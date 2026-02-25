from fastapi import APIRouter, HTTPException
from typing import Optional
from app.simulators.scenario_runner import get_all_alerts, get_all_incidents, get_alert

router = APIRouter()

DEVICE_INVENTORY = [
    {
        "id": "dev-001",
        "name": "DESKTOP-FIN-001",
        "os": "Windows 11 Pro",
        "osVersion": "22H2",
        "riskLevel": "High",
        "exposureLevel": "High",
        "status": "Active",
        "lastSeen": "2026-02-25T14:22:00Z",
        "ipAddress": "10.1.1.45",
        "domain": "CONTOSO",
        "owner": "alice.johnson@contoso.com",
        "tags": ["Finance", "High Value"],
    },
    {
        "id": "dev-002",
        "name": "SRV-DC-01",
        "os": "Windows Server 2022",
        "osVersion": "21H2",
        "riskLevel": "Critical",
        "exposureLevel": "High",
        "status": "Active",
        "lastSeen": "2026-02-25T14:25:00Z",
        "ipAddress": "10.1.0.1",
        "domain": "CONTOSO",
        "owner": "IT Admin",
        "tags": ["Domain Controller", "Critical Asset"],
    },
    {
        "id": "dev-003",
        "name": "DESKTOP-IT-042",
        "os": "Windows 10 Pro",
        "osVersion": "21H2",
        "riskLevel": "Medium",
        "exposureLevel": "Medium",
        "status": "Active",
        "lastSeen": "2026-02-25T13:10:00Z",
        "ipAddress": "10.1.2.88",
        "domain": "CONTOSO",
        "owner": "bob.smith@contoso.com",
        "tags": ["IT"],
    },
    {
        "id": "dev-004",
        "name": "LAPTOP-EXEC-001",
        "os": "Windows 11 Pro",
        "osVersion": "22H2",
        "riskLevel": "Low",
        "exposureLevel": "Low",
        "status": "Active",
        "lastSeen": "2026-02-25T12:00:00Z",
        "ipAddress": "10.1.3.12",
        "domain": "CONTOSO",
        "owner": "carol.white@contoso.com",
        "tags": ["Executive", "High Value"],
    },
    {
        "id": "dev-005",
        "name": "SRV-FILE-02",
        "os": "Windows Server 2019",
        "osVersion": "1809",
        "riskLevel": "Medium",
        "exposureLevel": "Medium",
        "status": "Active",
        "lastSeen": "2026-02-25T11:45:00Z",
        "ipAddress": "10.1.0.15",
        "domain": "CONTOSO",
        "owner": "IT Admin",
        "tags": ["File Server"],
    },
]


@router.get("/alerts")
async def list_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50
):
    alerts = get_all_alerts()
    if severity:
        alerts = [a for a in alerts if a["severity"].lower() == severity.lower()]
    if status:
        alerts = [a for a in alerts if a["status"].lower() == status.lower()]
    return {"alerts": alerts[:limit], "total": len(alerts)}


@router.get("/alerts/{alert_id}")
async def get_alert_endpoint(alert_id: str):
    alert = get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.get("/incidents")
async def list_incidents(limit: int = 50):
    incidents = get_all_incidents()
    return {"incidents": incidents[:limit], "total": len(incidents)}


@router.get("/devices")
async def list_devices(limit: int = 50):
    alerts = get_all_alerts()
    alert_devices: dict = {}
    for alert in alerts:
        entity = alert.get("entity", "")
        if "@" not in entity and entity:
            alert_devices[entity] = alert_devices.get(entity, 0) + 1

    enriched = []
    for device in DEVICE_INVENTORY:
        d = dict(device)
        d["activeAlerts"] = alert_devices.get(device["name"], 0)
        enriched.append(d)

    return {"devices": enriched[:limit], "total": len(enriched)}


@router.post("/hunting/query")
async def advanced_hunting(body: dict):
    query = body.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    return {"columns": [], "rows": [], "row_count": 0}