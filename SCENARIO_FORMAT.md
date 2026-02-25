# Scenario Format Guide

Attack scenarios are defined in YAML files located in the `scenarios/` directory. Each scenario describes a realistic cyber attack chain that injects synthetic telemetry into the simulator, allowing users to practice detection and investigation.

## Directory Layout

```
scenarios/
├── sentinel/          # Scenarios that primarily generate Sentinel log/incident data
├── defender/          # Scenarios that primarily generate Defender XDR alert data
└── shared/            # Scenarios that span both Sentinel and Defender XDR
```

Most realistic scenarios should be placed in `shared/` since real attacks generate telemetry across both platforms.

---

## Scenario YAML Specification

```yaml
# ─── Metadata ───────────────────────────────────────────────────────────────
id: "unique-scenario-id-001"              # Kebab-case, must be globally unique
name: "Human-readable Scenario Name"
description: >
  A multi-line description of what this scenario simulates.
  Include the threat actor, attack chain, and business impact.
version: "1.0.0"
author: "your-github-username"

# ─── Classification ──────────────────────────────────────────────────────────
difficulty: beginner                      # beginner | intermediate | advanced | expert
estimated_minutes: 30                     # Expected time to complete investigation
tags:
  - ransomware
  - credential-theft
  - lateral-movement

mitre_techniques:
  - id: T1566.001
    name: "Phishing: Spearphishing Attachment"
    tactic: "Initial Access"
  - id: T1059.001
    name: "Command and Scripting Interpreter: PowerShell"
    tactic: "Execution"
  - id: T1486
    name: "Data Encrypted for Impact"
    tactic: "Impact"

# ─── Target Environment ───────────────────────────────────────────────────────
# Describes the simulated victim environment context
environment:
  org_name: "Contoso Ltd"
  domain: "contoso.local"
  users:
    - name: "Alice Johnson"
      upn: "alice.johnson@contoso.com"
      role: "Finance Manager"
      device: "DESKTOP-FIN-001"
    - name: "Bob Smith"
      upn: "bob.smith@contoso.com"
      role: "IT Admin"
      device: "DESKTOP-IT-042"
  devices:
    - hostname: "DESKTOP-FIN-001"
      os: "Windows 11"
      ip: "10.1.5.22"
    - hostname: "SRV-DC-01"
      os: "Windows Server 2022"
      ip: "10.1.0.5"
      role: "Domain Controller"

# ─── Stages ─────────────────────────────────────────────────────────────────
# Each stage represents a phase of the attack chain.
# Stages execute in order. Events within a stage can have individual delays.
stages:
  - name: "Initial Access — Phishing"
    description: "Attacker sends a malicious Excel attachment via email."
    delay_minutes: 0                      # Delay from scenario start

    events:
      # ── Defender for Office 365 email event
      - type: log
        table: EmailEvents                # Target log table (KQL table name)
        delay_seconds: 0
        data:
          SenderFromAddress: "invoice@contoso-billing.net"
          RecipientEmailAddress: "alice.johnson@contoso.com"
          Subject: "Q4 Invoice - Action Required"
          AttachmentCount: 1
          AttachmentName: "Invoice_Q4_2024.xlsm"
          ThreatTypes: '["Malware"]'
          DetectionMethods: '["File reputation"]'
          DeliveryAction: "Delivered"

      # ── Defender for Office 365 alert
      - type: alert
        product: "Defender for Office 365"
        delay_seconds: 30
        data:
          title: "Email message containing malicious file removed after delivery"
          severity: medium
          category: "Malware"
          description: "A malicious Excel macro file was delivered to alice.johnson@contoso.com"
          entities:
            - type: mailbox
              upn: "alice.johnson@contoso.com"
            - type: file
              name: "Invoice_Q4_2024.xlsm"

  - name: "Execution — Macro Runs PowerShell"
    description: "User opens the attachment and enables macros. A PowerShell dropper executes."
    delay_minutes: 8

    events:
      # ── Defender for Endpoint device event
      - type: log
        table: DeviceProcessEvents
        delay_seconds: 0
        data:
          DeviceName: "DESKTOP-FIN-001"
          AccountName: "alice.johnson"
          FileName: "powershell.exe"
          ProcessCommandLine: "powershell.exe -EncodedCommand SQBuAHYAbwBrAGUALQBXAGUAYgBS..."
          InitiatingProcessFileName: "EXCEL.EXE"
          InitiatingProcessCommandLine: '"C:\\Program Files\\Microsoft Office\\EXCEL.EXE" "C:\\Users\\alice.johnson\\Downloads\\Invoice_Q4_2024.xlsm"'

      - type: alert
        product: "Defender for Endpoint"
        delay_seconds: 10
        data:
          title: "Suspicious PowerShell command line"
          severity: high
          category: "Execution"
          mitre_technique: "T1059.001"
          description: "An encoded PowerShell command was launched by Microsoft Excel on DESKTOP-FIN-001"
          entities:
            - type: device
              hostname: "DESKTOP-FIN-001"
            - type: process
              name: "powershell.exe"

  - name: "Credential Access — LSASS Dump"
    description: "Attacker dumps credentials from LSASS memory."
    delay_minutes: 15

    events:
      - type: log
        table: DeviceProcessEvents
        delay_seconds: 0
        data:
          DeviceName: "DESKTOP-FIN-001"
          AccountName: "alice.johnson"
          FileName: "rundll32.exe"
          ProcessCommandLine: "rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 640 C:\\Temp\\dump.bin full"

      - type: log
        table: SecurityEvent
        delay_seconds: 5
        data:
          EventID: 4656
          SubjectUserName: "alice.johnson"
          ObjectName: "\\Device\\HarddiskVolume3\\Windows\\System32\\lsass.exe"
          AccessMask: "0x143A"
          Computer: "DESKTOP-FIN-001"

      - type: alert
        product: "Defender for Endpoint"
        delay_seconds: 15
        data:
          title: "Credential dumping via comsvcs.dll"
          severity: high
          category: "CredentialAccess"
          mitre_technique: "T1003.001"
          description: "LSASS memory dump attempted on DESKTOP-FIN-001"

  - name: "Lateral Movement — Pass the Hash"
    description: "Attacker uses stolen hash to move to the Domain Controller."
    delay_minutes: 25

    events:
      - type: log
        table: SecurityEvent
        delay_seconds: 0
        data:
          EventID: 4624
          LogonType: 3
          TargetUserName: "bob.smith"
          IpAddress: "10.1.5.22"
          WorkstationName: "DESKTOP-FIN-001"
          Computer: "SRV-DC-01"
          AuthenticationPackageName: "NTLM"

      - type: alert
        product: "Defender for Identity"
        delay_seconds: 20
        data:
          title: "Suspected Pass-the-Hash attack"
          severity: high
          category: "LateralMovement"
          mitre_technique: "T1550.002"
          description: "Suspicious NTLM lateral movement from DESKTOP-FIN-001 to SRV-DC-01 using bob.smith credentials"

  - name: "Impact — Ransomware Encryption"
    description: "Ransomware payload begins encrypting files across the network."
    delay_minutes: 40

    events:
      - type: log
        table: DeviceFileEvents
        delay_seconds: 0
        repeat: 500                        # Repeat this event N times (simulates mass encryption)
        repeat_interval_ms: 200
        data:
          DeviceName: "SRV-DC-01"
          ActionType: "FileModified"
          FileName: "{random_filename}.lockbit"     # {random_*} tokens are substituted
          FolderPath: "\\\\SRV-DC-01\\Finance\\"
          SHA256: "{random_sha256}"

      - type: alert
        product: "Defender for Endpoint"
        delay_seconds: 30
        data:
          title: "Ransomware behavior detected"
          severity: critical
          category: "Impact"
          mitre_technique: "T1486"
          description: "Mass file encryption activity detected on SRV-DC-01. LockBit ransomware indicators found."

# ─── Correlated Incident ─────────────────────────────────────────────────────
# Defines the top-level incident that Sentinel/Defender XDR creates
# by correlating the above alerts.
incident:
  title: "Multi-stage attack: Phishing → Credential Theft → Ransomware on Contoso network"
  severity: critical
  sentinel:
    enabled: true
    workspace: "primary"
  defender_xdr:
    enabled: true

# ─── Lab Integration ─────────────────────────────────────────────────────────
# If this scenario is used by a guided lab, define the questions here.
# Lab questions reference specific data points the user must discover.
lab:
  id: "lab-ransomware-001"
  title: "Investigate a LockBit Ransomware Campaign"
  skill_track: "incident-responder"
  objectives:
    - id: obj-1
      text: "Identify the initial infection vector"
      hint: "Look at the email events and Defender for Office 365 alerts"
      answer_type: multiple_choice
      choices:
        - "Malicious email attachment"
        - "Drive-by download"
        - "RDP brute force"
        - "Supply chain compromise"
      correct: "Malicious email attachment"
      points: 10

    - id: obj-2
      text: "What MITRE ATT&CK technique was used for credential access?"
      hint: "Query DeviceProcessEvents for suspicious LSASS access"
      answer_type: text
      correct: "T1003.001"
      points: 15

    - id: obj-3
      text: "Write a KQL query to find all devices that communicated with DESKTOP-FIN-001 in the 30 minutes before the ransomware alert"
      hint: "Check DeviceNetworkEvents and filter by RemoteIPAddress"
      answer_type: kql
      validation:
        tables_used: ["DeviceNetworkEvents"]
        must_return_device: "SRV-DC-01"
      points: 25
```

---

## Supported Log Tables

The following log tables are available for scenario injection:

**Microsoft Sentinel (Azure Monitor)**
| Table | Description |
|-------|-------------|
| `SecurityEvent` | Windows Security Event Log |
| `Syslog` | Linux syslog |
| `SignInLogs` | Azure AD sign-in events |
| `AuditLogs` | Azure AD audit events |
| `AzureActivity` | Azure Resource Manager activity |
| `OfficeActivity` | Office 365 activity |
| `CommonSecurityLog` | CEF-format security device logs |

**Microsoft Defender XDR (Advanced Hunting)**
| Table | Description |
|-------|-------------|
| `DeviceProcessEvents` | Process creation events |
| `DeviceNetworkEvents` | Network connection events |
| `DeviceFileEvents` | File create/modify/delete events |
| `DeviceLogonEvents` | Device logon/logoff events |
| `DeviceRegistryEvents` | Registry modification events |
| `EmailEvents` | Email delivery events |
| `EmailAttachmentInfo` | Email attachment details |
| `CloudAppEvents` | Cloud app activity (MCAS) |
| `IdentityLogonEvents` | Identity provider logon events |
| `AlertEvidence` | Evidence linked to alerts |

---

## Template Variables

Use `{variable}` tokens in data fields for dynamic values:

| Token | Description |
|-------|-------------|
| `{random_sha256}` | Random SHA256 hash |
| `{random_filename}` | Random realistic filename |
| `{random_ip_internal}` | Random RFC1918 IP |
| `{random_ip_external}` | Random external IP |
| `{random_guid}` | Random GUID |
| `{timestamp}` | Current event timestamp |
| `{timestamp_offset_-5m}` | Timestamp minus 5 minutes |
| `{env.domain}` | Value from environment block |
| `{env.users[0].upn}` | First user's UPN from environment |

---

## Submission Guidelines

1. Place your scenario in the correct subdirectory (`sentinel/`, `defender/`, or `shared/`)
2. Ensure the `id` is unique — check existing scenarios
3. Map all stages to real MITRE ATT&CK techniques
4. Test with `python scripts/validate_scenario.py your-scenario.yaml`
5. Include at least 3 lab objectives if adding a guided lab
6. Open a PR with the `scenario` label

We especially welcome scenarios based on real-world threat actor TTPs (sanitized and fictionalized).
