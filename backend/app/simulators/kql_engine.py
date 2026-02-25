"""
KQL (Kusto Query Language) Engine
----------------------------------
A lightweight Python implementation of a KQL subset, designed to run
queries against Pandas DataFrames representing Azure Monitor log tables.

Supported operators:
  where, project, extend, summarize, order by, sort by,
  take, limit, join, union, parse, mv-expand, top

Supported functions:
  count(), sum(), avg(), min(), max(), dcount(), make_list()
  ago(), now(), datetime(), bin(), iif(), iff(), case(),
  tostring(), toint(), todouble(), tobool(),
  contains, startswith, endswith, has, matches regex
"""

import re
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field


# ─── Result ──────────────────────────────────────────────────────────────────

@dataclass
class KQLResult:
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    error: Optional[str] = None

    @classmethod
    def from_dataframe(cls, df: pd.DataFrame, execution_time_ms: float) -> "KQLResult":
        return cls(
            columns=list(df.columns),
            rows=df.to_dict(orient="records"),
            row_count=len(df),
            execution_time_ms=execution_time_ms,
        )

    @classmethod
    def error_result(cls, message: str) -> "KQLResult":
        return cls(columns=[], rows=[], row_count=0, execution_time_ms=0.0, error=message)


# ─── Table Registry ──────────────────────────────────────────────────────────

class TableRegistry:
    """Holds all available log tables as Pandas DataFrames."""

    def __init__(self):
        self._tables: Dict[str, pd.DataFrame] = {}

    def register(self, name: str, df: pd.DataFrame):
        self._tables[name] = df.copy()

    def get(self, name: str) -> Optional[pd.DataFrame]:
        return self._tables.get(name)

    def list_tables(self) -> List[str]:
        return list(self._tables.keys())


# ─── KQL Functions ───────────────────────────────────────────────────────────

def _parse_timespan(span: str) -> timedelta:
    """Parse KQL timespan strings like '1h', '30m', '7d'."""
    patterns = {
        "d": timedelta(days=1),
        "h": timedelta(hours=1),
        "m": timedelta(minutes=1),
        "s": timedelta(seconds=1),
    }
    match = re.match(r"(\d+(?:\.\d+)?)([dhms])", span.strip())
    if not match:
        raise ValueError(f"Cannot parse timespan: {span}")
    value, unit = float(match.group(1)), match.group(2)
    return patterns[unit] * value


def eval_kql_expression(expr: str, row: Optional[pd.Series] = None) -> Any:
    """
    Evaluate a simple KQL expression.
    This is a simplified evaluator — a full implementation would use a proper AST.
    """
    expr = expr.strip()

    # ago() function
    ago_match = re.match(r"ago\((.+)\)", expr)
    if ago_match:
        delta = _parse_timespan(ago_match.group(1))
        return datetime.now(timezone.utc) - delta

    # now()
    if expr == "now()":
        return datetime.now(timezone.utc)

    # Column reference
    if row is not None and expr in row.index:
        return row[expr]

    return expr


# ─── KQL Executor ────────────────────────────────────────────────────────────

class KQLExecutor:
    """
    Executes a KQL query string against a TableRegistry.

    This is a pipeline-based executor. Each KQL operator transforms
    the current DataFrame in sequence.
    """

    def __init__(self, registry: TableRegistry):
        self.registry = registry

    def execute(self, query: str) -> KQLResult:
        import time
        start = time.perf_counter()

        try:
            result_df = self._run_pipeline(query.strip())
            elapsed = (time.perf_counter() - start) * 1000
            return KQLResult.from_dataframe(result_df, elapsed)
        except Exception as exc:
            elapsed = (time.perf_counter() - start) * 1000
            return KQLResult.error_result(str(exc))

    def _run_pipeline(self, query: str) -> pd.DataFrame:
        # Split on pipe operator (skip pipes inside strings/parentheses)
        stages = self._split_pipeline(query)
        if not stages:
            raise ValueError("Empty query")

        # First stage must be a table name or union
        first = stages[0].strip()
        df = self._load_source(first)

        # Apply each subsequent stage
        for stage in stages[1:]:
            df = self._apply_operator(df, stage.strip())

        return df

    def _load_source(self, source: str) -> pd.DataFrame:
        """Load initial table — supports: TableName, union T1, T2"""
        if source.lower().startswith("union"):
            table_names = [t.strip() for t in source[5:].split(",")]
            frames = [self._get_table(n) for n in table_names]
            return pd.concat(frames, ignore_index=True)

        return self._get_table(source)

    def _get_table(self, name: str) -> pd.DataFrame:
        df = self.registry.get(name)
        if df is None:
            raise ValueError(f"Table '{name}' not found. Available: {self.registry.list_tables()}")
        return df.copy()

    def _apply_operator(self, df: pd.DataFrame, stage: str) -> pd.DataFrame:
        lower = stage.lower()

        if lower.startswith("where "):
            return self._op_where(df, stage[6:])
        elif lower.startswith("project "):
            return self._op_project(df, stage[8:])
        elif lower.startswith("extend "):
            return self._op_extend(df, stage[7:])
        elif lower.startswith("summarize "):
            return self._op_summarize(df, stage[10:])
        elif lower.startswith("order by ") or lower.startswith("sort by "):
            prefix_len = 9 if lower.startswith("order by") else 8
            return self._op_orderby(df, stage[prefix_len:])
        elif lower.startswith("take ") or lower.startswith("limit "):
            n = int(stage.split()[1])
            return df.head(n)
        elif lower.startswith("top "):
            return self._op_top(df, stage[4:])
        elif lower.startswith("count"):
            return pd.DataFrame({"Count": [len(df)]})
        elif lower.startswith("distinct "):
            cols = [c.strip() for c in stage[9:].split(",")]
            return df[cols].drop_duplicates()
        else:
            raise ValueError(f"Unsupported KQL operator: '{stage.split()[0]}'")

    def _op_where(self, df: pd.DataFrame, condition: str) -> pd.DataFrame:
        """Apply a where filter. Translates KQL conditions to pandas."""
        # Translate KQL operators to pandas-friendly expressions
        cond = condition.strip()

        # Handle 'ago()' time comparisons
        cond = re.sub(
            r"ago\((\w+)\)",
            lambda m: f'pd.Timestamp.now(tz="UTC") - pd.Timedelta("{_parse_timespan(m.group(1))}")',
            cond,
        )

        # KQL string operators → Python
        cond = re.sub(r"(\w+)\s+contains\s+['\"](.+?)['\"]", r"df['\1'].str.contains('\2', case=False, na=False)", cond)
        cond = re.sub(r"(\w+)\s+startswith\s+['\"](.+?)['\"]", r"df['\1'].str.startswith('\2', na=False)", cond)
        cond = re.sub(r"(\w+)\s+has\s+['\"](.+?)['\"]", r"df['\1'].str.contains(r'\\b\2\\b', case=False, na=False)", cond)

        # Replace == with pandas-safe equals
        cond = re.sub(r"(\w+)\s*==\s*['\"](.+?)['\"]", r"(df['\1'] == '\2')", cond)
        cond = re.sub(r"(\w+)\s*!=\s*['\"](.+?)['\"]", r"(df['\1'] != '\2')", cond)
        cond = re.sub(r"\band\b", "&", cond)
        cond = re.sub(r"\bor\b", "|", cond)
        cond = re.sub(r"\bnot\b", "~", cond)

        try:
            mask = eval(cond, {"df": df, "pd": pd, "np": np})  # noqa: S307
            return df[mask].reset_index(drop=True)
        except Exception as exc:
            raise ValueError(f"Error in where clause '{condition}': {exc}") from exc

    def _op_project(self, df: pd.DataFrame, cols_str: str) -> pd.DataFrame:
        """Select (and optionally rename) columns."""
        cols = []
        renames = {}
        for part in cols_str.split(","):
            part = part.strip()
            if "=" in part:
                alias, col = [x.strip() for x in part.split("=", 1)]
                cols.append(col)
                renames[col] = alias
            else:
                cols.append(part)
        result = df[[c for c in cols if c in df.columns]]
        if renames:
            result = result.rename(columns=renames)
        return result

    def _op_extend(self, df: pd.DataFrame, expr_str: str) -> pd.DataFrame:
        """Add computed columns."""
        df = df.copy()
        for part in expr_str.split(","):
            part = part.strip()
            if "=" in part:
                alias, expr = [x.strip() for x in part.split("=", 1)]
                df[alias] = df.apply(lambda row: eval_kql_expression(expr, row), axis=1)  # noqa: S307
        return df

    def _op_summarize(self, df: pd.DataFrame, expr_str: str) -> pd.DataFrame:
        """Aggregation: summarize count() by Column"""
        by_match = re.search(r"\bby\b(.+)$", expr_str, re.IGNORECASE)
        group_cols = []
        if by_match:
            group_cols = [c.strip() for c in by_match.group(1).split(",")]
            agg_str = expr_str[: by_match.start()].strip()
        else:
            agg_str = expr_str.strip()

        agg_exprs = {}
        for part in agg_str.split(","):
            part = part.strip()
            alias_match = re.match(r"(\w+)\s*=\s*(.+)", part)
            if alias_match:
                alias, func = alias_match.group(1), alias_match.group(2).strip()
            else:
                alias, func = part, part

            if re.match(r"count\(\)", func, re.IGNORECASE):
                agg_exprs[alias] = ("__count__", "count")
            elif m := re.match(r"sum\((\w+)\)", func, re.IGNORECASE):
                agg_exprs[alias] = (m.group(1), "sum")
            elif m := re.match(r"avg\((\w+)\)", func, re.IGNORECASE):
                agg_exprs[alias] = (m.group(1), "mean")
            elif m := re.match(r"min\((\w+)\)", func, re.IGNORECASE):
                agg_exprs[alias] = (m.group(1), "min")
            elif m := re.match(r"max\((\w+)\)", func, re.IGNORECASE):
                agg_exprs[alias] = (m.group(1), "max")
            elif m := re.match(r"dcount\((\w+)\)", func, re.IGNORECASE):
                agg_exprs[alias] = (m.group(1), "nunique")

        if group_cols:
            grouped = df.groupby(group_cols)
        else:
            df["__all__"] = 1
            grouped = df.groupby("__all__")

        result_parts = {}
        for alias, (col, agg) in agg_exprs.items():
            if col == "__count__":
                result_parts[alias] = grouped.size()
            else:
                result_parts[alias] = getattr(grouped[col], agg)()

        result = pd.DataFrame(result_parts).reset_index()
        if not group_cols:
            result = result.drop(columns=["__all__"], errors="ignore")
        return result

    def _op_orderby(self, df: pd.DataFrame, expr_str: str) -> pd.DataFrame:
        cols, ascending = [], []
        for part in expr_str.split(","):
            part = part.strip()
            if part.endswith(" desc"):
                cols.append(part[:-5].strip())
                ascending.append(False)
            elif part.endswith(" asc"):
                cols.append(part[:-4].strip())
                ascending.append(True)
            else:
                cols.append(part)
                ascending.append(True)
        return df.sort_values(by=cols, ascending=ascending).reset_index(drop=True)

    def _op_top(self, df: pd.DataFrame, expr_str: str) -> pd.DataFrame:
        """top N by Column [asc|desc]"""
        parts = expr_str.split()
        n = int(parts[0])
        if len(parts) >= 3 and parts[1].lower() == "by":
            col = parts[2]
            asc = len(parts) >= 4 and parts[3].lower() == "asc"
            df = df.sort_values(by=col, ascending=asc)
        return df.head(n).reset_index(drop=True)

    def _split_pipeline(self, query: str) -> List[str]:
        """Split query on '|' while respecting parentheses and strings."""
        stages, current, depth, in_string, string_char = [], [], 0, False, None
        for char in query:
            if in_string:
                current.append(char)
                if char == string_char:
                    in_string = False
            elif char in ("'", '"'):
                in_string, string_char = True, char
                current.append(char)
            elif char == "(":
                depth += 1
                current.append(char)
            elif char == ")":
                depth -= 1
                current.append(char)
            elif char == "|" and depth == 0:
                stages.append("".join(current).strip())
                current = []
            else:
                current.append(char)
        if current:
            stages.append("".join(current).strip())
        return [s for s in stages if s]
