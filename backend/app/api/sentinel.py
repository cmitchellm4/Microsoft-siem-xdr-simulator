from fastapi import APIRouter, HTTPException
from typing import Optional
from app.simulators.kql_engine import KQLExecutor, TableRegistry
from app.simulators.log_data import load_all_tables
from app.simulators.scenario_runner import (
    get_all_incidents, get_incident,
    update_incident_status
)

router = APIRouter()

# Load synthetic data and register tables once at startup
_registry = TableRegistry()
for name, df in load_all_tables().items():
    _registry.register(name, df)

_executor = KQLExecutor(_registry)

KQL_CHALLENGES = [
    {
        "id": "kql-001",
        "title": "Find all failed sign-ins",
        "difficulty": "Beginner",
        "points": 10,
        "description": "Write a KQL query to find all failed sign-in events from the SignInLogs table.",
        "hint": "Use the 'where' operator to filter by the Status field.",
        "validation": {
            "required_table": "SignInLogs",
            "required_operators": ["where"],
            "min_rows": 1,
        },
        "example_solution": "SignInLogs\n| where Status == \"Failure\"",
    },
    {
        "id": "kql-002",
        "title": "Count alerts by severity",
        "difficulty": "Beginner",
        "points": 10,
        "description": "Write a KQL query to count the number of security alerts grouped by severity.",
        "hint": "Use the 'summarize' operator with count() and group by AlertSeverity.",
        "validation": {
            "required_table": "SecurityAlert",
            "required_operators": ["summarize"],
            "min_rows": 1,
        },
        "example_solution": "SecurityAlert\n| summarize Count = count() by AlertSeverity",
    },
    {
        "id": "kql-003",
        "title": "Find high-risk sign-ins",
        "difficulty": "Beginner",
        "points": 15,
        "description": "Write a KQL query to find sign-ins where the risk level is 'high', showing only the time, user, IP address and location.",
        "hint": "Use 'where' to filter RiskLevelDuringSignIn, then 'project' to select specific columns.",
        "validation": {
            "required_table": "SignInLogs",
            "required_operators": ["where", "project"],
            "min_rows": 1,
        },
        "example_solution": "SignInLogs\n| where RiskLevelDuringSignIn == \"high\"\n| project TimeGenerated, UserPrincipalName, IPAddress, Location",
    },
    {
        "id": "kql-004",
        "title": "Find suspicious PowerShell executions",
        "difficulty": "Intermediate",
        "points": 15,
        "description": "Write a KQL query to find all process events where PowerShell was executed, ordered by most recent first.",
        "hint": "Query DeviceProcessEvents, filter where FileName contains powershell, and order by TimeGenerated.",
        "validation": {
            "required_table": "DeviceProcessEvents",
            "required_operators": ["where", "order"],
            "min_rows": 1,
        },
        "example_solution": "DeviceProcessEvents\n| where FileName == \"powershell.exe\"\n| order by TimeGenerated desc",
    },
    {
        "id": "kql-005",
        "title": "Top 5 most active users in Office 365",
        "difficulty": "Intermediate",
        "points": 20,
        "description": "Write a KQL query to find the top 5 users with the most Office 365 activity, showing their operation count.",
        "hint": "Use OfficeActivity, summarize count() by UserId, then use top operator.",
        "validation": {
            "required_table": "OfficeActivity",
            "required_operators": ["summarize", "top"],
            "min_rows": 1,
        },
        "example_solution": "OfficeActivity\n| summarize OperationCount = count() by UserId\n| top 5 by OperationCount desc",
    },
    {
        "id": "kql-006",
        "title": "Detect external network connections",
        "difficulty": "Intermediate",
        "points": 20,
        "description": "Write a KQL query to find all network connections to external IPs (not starting with 10.), showing device name, remote IP and port.",
        "hint": "Use DeviceNetworkEvents and filter where RemoteIPAddress does not start with '10.'",
        "validation": {
            "required_table": "DeviceNetworkEvents",
            "required_operators": ["where", "project"],
            "min_rows": 1,
        },
        "example_solution": "DeviceNetworkEvents\n| where not(RemoteIPAddress startswith \"10.\")\n| project DeviceName, RemoteIPAddress, RemotePort, ActionType",
    },
]


@router.get("/incidents")
async def list_incidents(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50
):
    incidents = get_all_incidents()
    if severity:
        incidents = [i for i in incidents if i["severity"].lower() == severity.lower()]
    if status:
        incidents = [i for i in incidents if i["status"].lower() == status.lower()]
    return {"incidents": incidents[:limit], "total": len(incidents)}


@router.get("/incidents/{incident_id}")
async def get_incident_endpoint(incident_id: str):
    incident = get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/incidents/{incident_id}")
async def update_incident(incident_id: str, body: dict):
    status = body.get("status")
    assigned_to = body.get("assignedTo")
    valid_statuses = ["New", "Active", "InProgress", "Resolved", "Closed"]
    if status and status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    try:
        incident = update_incident_status(incident_id, status or "New", assigned_to)
        return incident
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/kql-challenges")
async def list_kql_challenges():
    """Return all KQL challenges without solutions."""
    return {
        "challenges": [
            {
                "id": c["id"],
                "title": c["title"],
                "difficulty": c["difficulty"],
                "points": c["points"],
                "description": c["description"],
                "hint": c["hint"],
            }
            for c in KQL_CHALLENGES
        ],
        "total_points": sum(c["points"] for c in KQL_CHALLENGES),
    }


@router.post("/kql-challenges/{challenge_id}/validate")
async def validate_kql_challenge(challenge_id: str, body: dict):
    """Validate a KQL query against a challenge."""
    query = body.get("query", "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    challenge = next((c for c in KQL_CHALLENGES if c["id"] == challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Run the query
    result = _executor.execute(query)

    if result.error:
        return {
            "passed": False,
            "feedback": f"Query error: {result.error}",
            "points_awarded": 0,
            "row_count": 0,
        }

    validation = challenge["validation"]
    query_lower = query.lower()

    # Check required table
    required_table = validation.get("required_table", "").lower()
    if required_table and required_table not in query_lower:
        return {
            "passed": False,
            "feedback": f"Your query should use the {validation['required_table']} table.",
            "points_awarded": 0,
            "row_count": result.row_count,
        }

    # Check required operators
    for op in validation.get("required_operators", []):
        if op.lower() not in query_lower:
            return {
                "passed": False,
                "feedback": f"Your query should use the '{op}' operator.",
                "points_awarded": 0,
                "row_count": result.row_count,
            }

    # Check minimum rows
    if result.row_count < validation.get("min_rows", 1):
        return {
            "passed": False,
            "feedback": "Your query returned no results. Check your filter conditions.",
            "points_awarded": 0,
            "row_count": result.row_count,
        }

    return {
        "passed": True,
        "feedback": f"Correct! Your query returned {result.row_count} rows.",
        "points_awarded": challenge["points"],
        "row_count": result.row_count,
        "example_solution": challenge["example_solution"],
    }


@router.post("/query/kql")
async def run_kql_query(body: dict):
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