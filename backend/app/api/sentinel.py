from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter()

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
    return {"columns": [], "rows": [], "row_count": 0}