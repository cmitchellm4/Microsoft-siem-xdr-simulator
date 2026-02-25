from fastapi import APIRouter, HTTPException
from typing import Optional
from app.simulators.kql_engine import KQLExecutor, TableRegistry
from app.simulators.log_data import load_all_tables

router = APIRouter()

# Load synthetic data and register tables once at startup
_registry = TableRegistry()
for name, df in load_all_tables().items():
    _registry.register(name, df)

_executor = KQLExecutor(_registry)


@router.get("/incidents")
async def list_incidents(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50
):
    """Return list of Sentinel incidents."""
    return {
        "incidents": [],
        "total": 0
    }


@router.get("/incidents/{incident_id}")
async def get_incident(incident_id: str):
    """Return a single incident by ID."""
    raise HTTPException(status_code=404, detail="Incident not found")


@router.post("/query/kql")
async def run_kql_query(body: dict):
    """Execute a KQL query against the log tables."""
    query = body.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    result = _executor.execute(query)

    return {
        "columns": result.columns,
        "rows": result.rows,
        "row_count": result.row_count,
        "execution_time_ms": result.execution_time_ms,
        "error": result.error,
    }