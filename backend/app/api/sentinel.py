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
    """Update incident status and/or assignee."""
    status = body.get("status")
    assigned_to = body.get("assignedTo")

    valid_statuses = ["New", "Active", "InProgress", "Resolved", "Closed"]
    if status and status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    try:
        incident = update_incident_status(incident_id, status or "New", assigned_to)
        return incident
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


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