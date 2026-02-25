"""
Scenario Runner
Loads YAML scenario files and injects synthetic alerts and incidents
into the in-memory data store when a user starts a lab.
"""

import uuid
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional

# ── In-memory store for active incidents and alerts ───────────────────────────

_incidents: Dict[str, dict] = {}
_alerts: Dict[str, dict] = {}


def get_all_incidents() -> List[dict]:
    return sorted(_incidents.values(), key=lambda x: x["createdTime"], reverse=True)


def get_all_alerts() -> List[dict]:
    return sorted(_alerts.values(), key=lambda x: x["createdTime"], reverse=True)


def get_incident(incident_id: str) -> Optional[dict]:
    return _incidents.get(incident_id)


def get_alert(alert_id: str) -> Optional[dict]:
    return _alerts.get(alert_id)


def clear_all():
    _incidents.clear()
    _alerts.clear()


# ── Scenario Definitions ──────────────────────────────────────────────────────

SCENARIOS = {
    "bec-invoice-fraud-001": {
        "name": "Business Email Compromise — Invoice Fraud",
        "difficulty": "Beginner",
        "alerts": [
            {
                "title": "Phishing email detected in user inbox",
                "severity": "Medium",
                "product": "Defender for Office 365",
                "category": "Phishing",
                "description": "A phishing email impersonating DocuSign was delivered to sarah.chen@fabrikam.com before detonation detection flagged the embedded URL.",
                "entity": "sarah.chen@fabrikam.com",
                "mitre": "T1566.002",
                "status": "New",
            },
            {
                "title": "Suspicious sign-in from unusual location",
                "severity": "Medium",
                "product": "Defender for Identity",
                "category": "InitialAccess",
                "description": "sarah.chen@fabrikam.com signed in from Romania (91.214.44.22) — a location not seen in the past 30 days.",
                "entity": "sarah.chen@fabrikam.com",
                "mitre": "T1078.004",
                "status": "New",
            },
            {
                "title": "Suspicious inbox rule created to redirect emails",
                "severity": "High",
                "product": "Defender for Office 365",
                "category": "Persistence",
                "description": "A new inbox rule 'Auto-Archive' was created by sarah.chen@fabrikam.com from an unusual IP that automatically deletes emails from the CFO.",
                "entity": "sarah.chen@fabrikam.com",
                "mitre": "T1564.008",
                "status": "New",
            },
            {
                "title": "Mailbox accessed from suspicious IP address",
                "severity": "High",
                "product": "Defender for Office 365",
                "category": "Collection",
                "description": "Mailbox of sarah.chen@fabrikam.com was accessed 47 times from IP 91.214.44.22 in Bucharest, Romania.",
                "entity": "sarah.chen@fabrikam.com",
                "mitre": "T1114.002",
                "status": "New",
            },
        ],
        "incident": {
            "title": "BEC Attack — Fabrikam Finance Account Takeover",
            "severity": "High",
            "description": "A finance employee's Microsoft 365 account was compromised via AiTM phishing. The attacker monitored the mailbox, created inbox rules to hide replies, and sent fraudulent wire transfer instructions to the CFO.",
            "entities": ["sarah.chen@fabrikam.com", "james.rivera@fabrikam.com"],
            "mitre_techniques": ["T1566.002", "T1078.004", "T1114.002", "T1564.008"],
        }
    },

    "ransomware-lockbit-001": {
        "name": "LockBit Ransomware Campaign",
        "difficulty": "Intermediate",
        "alerts": [
            {
                "title": "Malicious email attachment opened",
                "severity": "Medium",
                "product": "Defender for Office 365",
                "category": "Malware",
                "description": "User alice.johnson@contoso.com opened a malicious Excel macro file Invoice_Q4_2024.xlsm.",
                "entity": "alice.johnson@contoso.com",
                "mitre": "T1566.001",
                "status": "New",
            },
            {
                "title": "Suspicious encoded PowerShell command execution",
                "severity": "High",
                "product": "Defender for Endpoint",
                "category": "Execution",
                "description": "An encoded PowerShell command was launched by Microsoft Excel on DESKTOP-FIN-001.",
                "entity": "DESKTOP-FIN-001",
                "mitre": "T1059.001",
                "status": "New",
            },
            {
                "title": "Credential dumping via comsvcs.dll",
                "severity": "High",
                "product": "Defender for Endpoint",
                "category": "CredentialAccess",
                "description": "LSASS memory dump attempted on DESKTOP-FIN-001 using comsvcs.dll MiniDump.",
                "entity": "DESKTOP-FIN-001",
                "mitre": "T1003.001",
                "status": "New",
            },
            {
                "title": "Suspected Pass-the-Hash lateral movement",
                "severity": "High",
                "product": "Defender for Identity",
                "category": "LateralMovement",
                "description": "Suspicious NTLM lateral movement from DESKTOP-FIN-001 to SRV-DC-01 using bob.smith credentials.",
                "entity": "SRV-DC-01",
                "mitre": "T1550.002",
                "status": "New",
            },
            {
                "title": "Ransomware behavior detected — mass file encryption",
                "severity": "Critical",
                "product": "Defender for Endpoint",
                "category": "Impact",
                "description": "Mass file encryption activity detected on SRV-DC-01. LockBit ransomware indicators found. 500+ files encrypted.",
                "entity": "SRV-DC-01",
                "mitre": "T1486",
                "status": "New",
            },
        ],
        "incident": {
            "title": "Multi-stage Attack: Phishing → Credential Theft → LockBit Ransomware",
            "severity": "Critical",
            "description": "A multi-stage ransomware attack beginning with a phishing email containing a malicious Excel macro, leading to PowerShell execution, credential theft via LSASS dumping, lateral movement to the domain controller, and mass file encryption consistent with LockBit ransomware.",
            "entities": ["DESKTOP-FIN-001", "SRV-DC-01", "alice.johnson@contoso.com"],
            "mitre_techniques": ["T1566.001", "T1059.001", "T1003.001", "T1550.002", "T1486"],
        }
    },
}


# ── Runner ────────────────────────────────────────────────────────────────────

def start_scenario(scenario_id: str) -> dict:
    """
    Inject alerts and incidents from a scenario into the in-memory store.
    Returns the created incident.
    """
    scenario = SCENARIOS.get(scenario_id)
    if not scenario:
        raise ValueError(f"Scenario '{scenario_id}' not found")

    now = datetime.now(timezone.utc)
    alert_ids = []

    for alert_def in scenario["alerts"]:
        alert_id = str(uuid.uuid4())
        alert = {
            "id": alert_id,
            "title": alert_def["title"],
            "severity": alert_def["severity"],
            "product": alert_def["product"],
            "category": alert_def["category"],
            "description": alert_def["description"],
            "entity": alert_def["entity"],
            "mitreAttackTechnique": alert_def["mitre"],
            "status": alert_def["status"],
            "createdTime": now.isoformat(),
            "scenarioId": scenario_id,
        }
        _alerts[alert_id] = alert
        alert_ids.append(alert_id)

    incident_id = str(uuid.uuid4())
    inc_def = scenario["incident"]
    incident = {
        "id": incident_id,
        "title": inc_def["title"],
        "severity": inc_def["severity"],
        "description": inc_def["description"],
        "status": "New",
        "assignedTo": None,
        "entities": inc_def["entities"],
        "mitreAttackTechniques": inc_def["mitre_techniques"],
        "alertIds": alert_ids,
        "alertCount": len(alert_ids),
        "createdTime": now.isoformat(),
        "scenarioId": scenario_id,
        "scenarioName": scenario["name"],
    }
    _incidents[incident_id] = incident

    return incident