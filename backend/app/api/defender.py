from fastapi import APIRouter, HTTPException
from typing import Optional
from app.simulators.scenario_runner import get_all_alerts, get_all_incidents, get_alert

router = APIRouter()


@router.get("/alerts")
async def list_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50
):
    """Return list of Defender XDR alerts."""
    alerts = get_all_alerts()
    if severity:
        alerts = [a for a in alerts if a["severity"].lower() == severity.lower()]
    if status:
        alerts = [a for a in alerts if a["status"].lower() == status.lower()]
    return {
        "alerts": alerts[:limit],
        "total": len(alerts)
    }


@router.get("/alerts/{alert_id}")
async def get_alert_endpoint(alert_id: str):
    """Return a single alert by ID."""
    alert = get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.get("/incidents")
async def list_incidents(limit: int = 50):
    """Return correlated Defender XDR incidents."""
    incidents = get_all_incidents()
    return {
        "incidents": incidents[:limit],
        "total": len(incidents)
    }


@router.get("/devices")
async def list_devices(limit: int = 50):
    """Return device inventory."""
    return {
        "devices": [],
        "total": 0
    }


@router.post("/hunting/query")
async def advanced_hunting(body: dict):
    """Execute an Advanced Hunting KQL query."""
    query = body.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    return {"columns": [], "rows": [], "row_count": 0}