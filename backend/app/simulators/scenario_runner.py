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
"password-spray-001": {
        "name": "Password Spray Attack",
        "difficulty": "Beginner",
        "alerts": [
            {
                "title": "Multiple failed sign-in attempts across accounts",
                "severity": "Medium",
                "product": "Defender for Identity",
                "category": "CredentialAccess",
                "description": "47 failed sign-in attempts detected across 12 different accounts from IP 185.220.101.45 in a 10-minute window, consistent with a password spray attack.",
                "entity": "185.220.101.45",
                "mitre": "T1110.003",
                "status": "New",
            },
            {
                "title": "Successful sign-in after password spray",
                "severity": "High",
                "product": "Defender for Identity",
                "category": "InitialAccess",
                "description": "bob.smith@contoso.com successfully authenticated from IP 185.220.101.45 after 6 failed attempts. This IP was involved in a password spray attack.",
                "entity": "bob.smith@contoso.com",
                "mitre": "T1078.004",
                "status": "New",
            },
            {
                "title": "Suspicious mailbox enumeration activity",
                "severity": "Medium",
                "product": "Defender for Office 365",
                "category": "Discovery",
                "description": "bob.smith@contoso.com performed 134 mailbox search operations within 5 minutes of sign-in, suggesting automated enumeration.",
                "entity": "bob.smith@contoso.com",
                "mitre": "T1087.003",
                "status": "New",
            },
            {
                "title": "Mass email forwarding rule created",
                "severity": "High",
                "product": "Defender for Office 365",
                "category": "Exfiltration",
                "description": "A forwarding rule was created by bob.smith@contoso.com to forward all emails to external address collector@protonmail.com.",
                "entity": "bob.smith@contoso.com",
                "mitre": "T1114.003",
                "status": "New",
            },
        ],
        "incident": {
            "title": "Password Spray Attack — Contoso M365 Environment",
            "severity": "High",
            "description": "An attacker conducted a password spray attack against Contoso's Microsoft 365 environment, successfully compromising bob.smith@contoso.com. The attacker then enumerated mailboxes and created a forwarding rule to exfiltrate email to an external address.",
            "entities": ["bob.smith@contoso.com", "185.220.101.45"],
            "mitre_techniques": ["T1110.003", "T1078.004", "T1087.003", "T1114.003"],
        }
    },

    "insider-threat-001": {
        "name": "Insider Threat — Data Exfiltration",
        "difficulty": "Intermediate",
        "alerts": [
            {
                "title": "Unusual volume of file downloads from SharePoint",
                "severity": "Medium",
                "product": "Defender for Cloud Apps",
                "category": "Exfiltration",
                "description": "carol.white@contoso.com downloaded 847 files from SharePoint in 2 hours — 40x their normal daily average. Files include financial reports and HR records.",
                "entity": "carol.white@contoso.com",
                "mitre": "T1530",
                "status": "New",
            },
            {
                "title": "Sensitive file upload to personal cloud storage",
                "severity": "High",
                "product": "Defender for Cloud Apps",
                "category": "Exfiltration",
                "description": "carol.white@contoso.com uploaded 2.3GB of data to a personal Dropbox account from a corporate device. Uploaded files match recently downloaded SharePoint content.",
                "entity": "carol.white@contoso.com",
                "mitre": "T1567.002",
                "status": "New",
            },
            {
                "title": "Access to HR and payroll systems outside business hours",
                "severity": "Medium",
                "product": "Defender for Identity",
                "category": "Collection",
                "description": "carol.white@contoso.com accessed the HR management system and payroll database at 11:47 PM — outside normal business hours. User is in the Finance department with no HR system access requirement.",
                "entity": "carol.white@contoso.com",
                "mitre": "T1213",
                "status": "New",
            },
            {
                "title": "Anomalous printing activity detected",
                "severity": "Low",
                "product": "Defender for Endpoint",
                "category": "Exfiltration",
                "description": "DESKTOP-FIN-001 printed 312 pages in a single session at 11:52 PM including documents flagged as confidential. User carol.white@contoso.com submitted resignation 3 days prior.",
                "entity": "DESKTOP-FIN-001",
                "mitre": "T1125",
                "status": "New",
            },
            {
                "title": "DLP policy violation — PII data exfiltration attempt",
                "severity": "High",
                "product": "Defender for Office 365",
                "category": "Exfiltration",
                "description": "A DLP policy was triggered when carol.white@contoso.com attempted to email a file containing 1,400 employee Social Security Numbers to a personal Gmail account.",
                "entity": "carol.white@contoso.com",
                "mitre": "T1048.003",
                "status": "New",
            },
        ],
        "incident": {
            "title": "Insider Threat — Departing Employee Data Exfiltration",
            "severity": "High",
            "description": "A departing finance employee conducted a multi-channel data exfiltration campaign in the days before their last working day. Activity included mass SharePoint downloads, uploads to personal cloud storage, after-hours access to HR and payroll systems, anomalous printing of confidential documents, and an attempted email exfiltration of PII data triggering DLP policies.",
            "entities": ["carol.white@contoso.com", "DESKTOP-FIN-001"],
            "mitre_techniques": ["T1530", "T1567.002", "T1213", "T1125", "T1048.003"],
        }
    },

    "azure-ad-privilege-escalation-001": {
        "name": "Azure AD Privilege Escalation",
        "difficulty": "Advanced",
        "alerts": [
            {
                "title": "Suspicious Azure AD application registration",
                "severity": "Medium",
                "product": "Defender for Identity",
                "category": "Persistence",
                "description": "A new Azure AD application 'LegitApp' was registered by eve.davis@contoso.com with Mail.ReadWrite and User.ReadWrite.All permissions — atypical for this user's role.",
                "entity": "eve.davis@contoso.com",
                "mitre": "T1098.001",
                "status": "New",
            },
            {
                "title": "Admin consent granted to suspicious application",
                "severity": "High",
                "product": "Defender for Identity",
                "category": "PrivilegeEscalation",
                "description": "Global Administrator consent was granted to application 'LegitApp' (AppID: a1b2c3d4) by eve.davis@contoso.com, granting it tenant-wide access to all mailboxes and user data.",
                "entity": "eve.davis@contoso.com",
                "mitre": "T1098.001",
                "status": "New",
            },
            {
                "title": "Service principal added to privileged role",
                "severity": "High",
                "product": "Defender for Identity",
                "category": "PrivilegeEscalation",
                "description": "The service principal for 'LegitApp' was added to the Global Administrator role in Azure AD by eve.davis@contoso.com.",
                "entity": "LegitApp (Service Principal)",
                "mitre": "T1098.003",
                "status": "New",
            },
            {
                "title": "Suspicious OAuth token generation",
                "severity": "High",
                "product": "Defender for Cloud Apps",
                "category": "CredentialAccess",
                "description": "Application 'LegitApp' generated 847 OAuth access tokens for user accounts across the tenant within 10 minutes of receiving admin consent.",
                "entity": "LegitApp (Service Principal)",
                "mitre": "T1528",
                "status": "New",
            },
            {
                "title": "Mass mailbox access via application permissions",
                "severity": "Critical",
                "product": "Defender for Office 365",
                "category": "Collection",
                "description": "Application 'LegitApp' accessed 312 mailboxes in 8 minutes using application-level permissions, reading emails from executive accounts including the CEO and CFO.",
                "entity": "LegitApp (Service Principal)",
                "mitre": "T1114.002",
                "status": "New",
            },
        ],
        "incident": {
            "title": "Azure AD Privilege Escalation via Malicious OAuth Application",
            "severity": "Critical",
            "description": "An attacker with access to a low-privilege account registered a malicious OAuth application and manipulated an administrator into granting tenant-wide consent. The application was then elevated to Global Administrator, used to generate OAuth tokens across the tenant, and leveraged to read executive mailboxes at scale — a technique known as an Illicit Consent Grant attack.",
            "entities": ["eve.davis@contoso.com", "LegitApp (Service Principal)"],
            "mitre_techniques": ["T1098.001", "T1098.003", "T1528", "T1114.002"],
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