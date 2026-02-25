"""
Synthetic Log Data Generator
Generates realistic fake security log data for all supported KQL tables.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
import random
import uuid

# ── Helpers ──────────────────────────────────────────────────────────────────

def now():
    return datetime.now(timezone.utc)

def random_time(hours_ago=24):
    delta = random.uniform(0, hours_ago * 3600)
    return now() - timedelta(seconds=delta)

def random_ip_internal():
    return f"10.1.{random.randint(0,10)}.{random.randint(1,254)}"

def random_ip_external():
    return f"{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}"

def random_guid():
    return str(uuid.uuid4())

# ── Sample Data ───────────────────────────────────────────────────────────────

USERS = [
    "alice.johnson@contoso.com",
    "bob.smith@contoso.com",
    "carol.white@contoso.com",
    "david.brown@contoso.com",
    "eve.davis@contoso.com",
]

DEVICES = [
    "DESKTOP-FIN-001",
    "DESKTOP-IT-042",
    "LAPTOP-EXEC-001",
    "SRV-DC-01",
    "SRV-FILE-02",
]

LOCATIONS = [
    "New York, US",
    "London, UK",
    "Bucharest, Romania",
    "Toronto, Canada",
    "Sydney, Australia",
]

PROCESSES = [
    "powershell.exe",
    "cmd.exe",
    "explorer.exe",
    "chrome.exe",
    "outlook.exe",
    "svchost.exe",
    "rundll32.exe",
    "mshta.exe",
]

# ── Table Generators ──────────────────────────────────────────────────────────

def generate_signin_logs(n=100):
    rows = []
    for _ in range(n):
        success = random.random() > 0.2
        rows.append({
            "TimeGenerated": random_time(48),
            "UserPrincipalName": random.choice(USERS),
            "AppDisplayName": random.choice(["Microsoft Office", "Azure Portal", "Teams", "SharePoint"]),
            "IPAddress": random_ip_external() if random.random() > 0.7 else random_ip_internal(),
            "Location": random.choice(LOCATIONS),
            "Status": "Success" if success else "Failure",
            "RiskLevelDuringSignIn": random.choice(["none", "none", "none", "low", "medium", "high"]),
            "ConditionalAccessStatus": random.choice(["success", "notApplied", "failure"]),
            "DeviceDetail": random.choice(["Windows 11", "Windows 10", "macOS", "iOS"]),
            "CorrelationId": random_guid(),
        })
    return pd.DataFrame(rows)


def generate_security_event(n=150):
    event_ids = [4624, 4625, 4648, 4656, 4720, 4732, 4768, 4769]
    rows = []
    for _ in range(n):
        rows.append({
            "TimeGenerated": random_time(48),
            "EventID": random.choice(event_ids),
            "Computer": random.choice(DEVICES),
            "SubjectUserName": random.choice([u.split("@")[0] for u in USERS]),
            "TargetUserName": random.choice([u.split("@")[0] for u in USERS]),
            "IpAddress": random_ip_internal(),
            "LogonType": random.choice([2, 3, 10]),
            "AuthenticationPackageName": random.choice(["NTLM", "Kerberos", "Negotiate"]),
            "Activity": random.choice([
                "An account was successfully logged on",
                "An account failed to log on",
                "A logon was attempted using explicit credentials",
                "A handle to an object was requested",
            ]),
        })
    return pd.DataFrame(rows)


def generate_device_process_events(n=200):
    rows = []
    for _ in range(n):
        proc = random.choice(PROCESSES)
        rows.append({
            "TimeGenerated": random_time(48),
            "DeviceName": random.choice(DEVICES),
            "AccountName": random.choice([u.split("@")[0] for u in USERS]),
            "FileName": proc,
            "ProcessCommandLine": f"{proc} {random.choice(['', '-enc abc123', '/c whoami', '--hidden'])}",
            "InitiatingProcessFileName": random.choice(PROCESSES),
            "SHA256": uuid.uuid4().hex * 2,
            "ProcessId": random.randint(1000, 9999),
        })
    return pd.DataFrame(rows)


def generate_device_network_events(n=150):
    rows = []
    for _ in range(n):
        rows.append({
            "TimeGenerated": random_time(48),
            "DeviceName": random.choice(DEVICES),
            "AccountName": random.choice([u.split("@")[0] for u in USERS]),
            "RemoteIPAddress": random_ip_external() if random.random() > 0.5 else random_ip_internal(),
            "RemotePort": random.choice([80, 443, 445, 3389, 8080, 22, 53]),
            "LocalIPAddress": random_ip_internal(),
            "LocalPort": random.randint(49152, 65535),
            "Protocol": random.choice(["Tcp", "Udp"]),
            "ActionType": random.choice(["ConnectionSuccess", "ConnectionFailed", "ConnectionFound"]),
        })
    return pd.DataFrame(rows)


def generate_device_logon_events(n=100):
    rows = []
    for _ in range(n):
        rows.append({
            "TimeGenerated": random_time(48),
            "DeviceName": random.choice(DEVICES),
            "AccountName": random.choice([u.split("@")[0] for u in USERS]),
            "AccountDomain": "CONTOSO",
            "LogonType": random.choice(["Interactive", "Network", "RemoteInteractive"]),
            "ActionType": random.choice(["LogonSuccess", "LogonFailed"]),
            "RemoteIPAddress": random_ip_internal(),
            "IsLocalAdmin": random.choice([True, False]),
        })
    return pd.DataFrame(rows)


def generate_email_events(n=80):
    rows = []
    subjects = [
        "Q4 Invoice - Action Required",
        "Meeting tomorrow",
        "Please review and sign",
        "Urgent: Payment details updated",
        "Your account security",
        "Weekly report",
    ]
    for _ in range(n):
        rows.append({
            "TimeGenerated": random_time(48),
            "SenderFromAddress": random.choice(USERS + ["attacker@evil.com", "noreply@phish.net"]),
            "RecipientEmailAddress": random.choice(USERS),
            "Subject": random.choice(subjects),
            "DeliveryAction": random.choice(["Delivered", "Blocked", "Quarantined"]),
            "ThreatTypes": random.choice(["", "", "", '["Phish"]', '["Malware"]']),
            "AttachmentCount": random.randint(0, 3),
            "UrlCount": random.randint(0, 5),
        })
    return pd.DataFrame(rows)


def generate_office_activity(n=100):
    operations = [
        "FileDownloaded", "FileUploaded", "FilePreviewed",
        "MailItemsAccessed", "New-InboxRule", "SearchQueryInitiatedExchange",
        "UserLoggedIn", "FileDeleted",
    ]
    rows = []
    for _ in range(n):
        rows.append({
            "TimeGenerated": random_time(48),
            "UserId": random.choice(USERS),
            "Operation": random.choice(operations),
            "ClientIPAddress": random_ip_external() if random.random() > 0.6 else random_ip_internal(),
            "Workload": random.choice(["SharePoint", "Exchange", "OneDrive", "Teams"]),
            "ObjectId": f"/sites/contoso/{random_guid()}",
        })
    return pd.DataFrame(rows)


def generate_security_alert(n=30):
    alerts = [
        ("Suspicious PowerShell command line", "High", "Execution"),
        ("Credential dumping via comsvcs.dll", "High", "CredentialAccess"),
        ("Phishing email detected", "Medium", "InitialAccess"),
        ("Suspicious inbox rule created", "High", "Persistence"),
        ("Unusual sign-in from unfamiliar location", "Medium", "InitialAccess"),
        ("Pass-the-Hash attack detected", "High", "LateralMovement"),
        ("Mass file deletion detected", "Medium", "Impact"),
        ("Encoded PowerShell execution", "Medium", "Execution"),
    ]
    rows = []
    for _ in range(n):
        alert = random.choice(alerts)
        rows.append({
            "TimeGenerated": random_time(48),
            "AlertName": alert[0],
            "AlertSeverity": alert[1],
            "Category": alert[2],
            "CompromisedEntity": random.choice(DEVICES + USERS),
            "ProviderName": random.choice([
                "Microsoft Defender for Endpoint",
                "Microsoft Defender for Identity",
                "Microsoft Defender for Office 365",
            ]),
            "Status": random.choice(["New", "InProgress", "Resolved"]),
            "SystemAlertId": random_guid(),
        })
    return pd.DataFrame(rows)


# ── Registry ──────────────────────────────────────────────────────────────────

def load_all_tables() -> dict:
    """Generate all synthetic log tables and return as a dict of DataFrames."""
    print("📊 Loading synthetic log data...")
    tables = {
        "SignInLogs": generate_signin_logs(100),
        "SecurityEvent": generate_security_event(150),
        "DeviceProcessEvents": generate_device_process_events(200),
        "DeviceNetworkEvents": generate_device_network_events(150),
        "DeviceLogonEvents": generate_device_logon_events(100),
        "EmailEvents": generate_email_events(80),
        "OfficeActivity": generate_office_activity(100),
        "SecurityAlert": generate_security_alert(30),
    }
    total = sum(len(df) for df in tables.values())
    print(f"✅ Loaded {len(tables)} tables with {total} total rows")
    return tables