# 🛡️ Microsoft SIEM & XDR Simulator

An open-source, browser-based training simulator for Microsoft Sentinel and Microsoft Defender XDR. Built for aspiring SOC analysts, SC-200 candidates, and cybersecurity students who want hands-on experience without needing a live Microsoft 365 tenant.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)
![React](https://img.shields.io/badge/react-18-blue)
![FastAPI](https://img.shields.io/badge/fastapi-0.100+-green)

---

## 📸 Screenshots

### Login Page
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Incident Queue
![Incidents](docs/screenshots/incidents.png)

### Incident Detail — MITRE ATT&CK Timeline
![Incident Detail](docs/screenshots/incident-detail.png)

### KQL Editor
![KQL Editor](docs/screenshots/kql-editor.png)

### Labs & Scenarios
![Labs](docs/screenshots/labs.png)

---

## ✨ Features

- 🔐 **Realistic login page** with role-based demo accounts (L1 Analyst, L2 Senior, Admin)
- 📋 **Incident queue** — triage, filter by severity, assign to analysts, update status
- 🔔 **Alert queue** — Defender XDR-style alerts with MITRE techniques and remediation steps
- 🖥️ **Device inventory** — Defender for Endpoint device list with risk levels and active alert counts
- 🔍 **KQL Editor** — write and run real KQL queries against 910 rows of synthetic log data across 8 tables
- 🏆 **KQL Challenges** — 6 guided exercises with hints, validation, and scoring
- 🎯 **5 attack scenarios** — each generates real alerts and incidents with MITRE ATT&CK mappings
- ❓ **Guided lab questions** — answer questions about each scenario to earn points
- 🔄 **Environment reset** — clear all data and start fresh with one click

---

## 🎯 Attack Scenarios

| Scenario | Difficulty | Alerts | MITRE Techniques |
|----------|-----------|--------|-----------------|
| Business Email Compromise — Invoice Fraud | Beginner | 4 | T1566.002, T1078.004, T1114.002, T1564.008 |
| Password Spray Attack | Beginner | 4 | T1110.003, T1078.004, T1087.003, T1114.003 |
| LockBit Ransomware Campaign | Intermediate | 5 | T1566.001, T1059.001, T1003.001, T1550.002, T1486 |
| Insider Threat — Data Exfiltration | Intermediate | 5 | T1530, T1567.002, T1213, T1125, T1048.003 |
| Azure AD Privilege Escalation | Advanced | 5 | T1098.001, T1098.003, T1528, T1114.002 |

---

## 📊 KQL Log Tables

| Table | Rows | Description |
|-------|------|-------------|
| SignInLogs | 100 | Azure AD sign-in events |
| SecurityEvent | 150 | Windows Security Event logs |
| DeviceProcessEvents | 200 | Process execution events |
| DeviceNetworkEvents | 150 | Network connection events |
| DeviceLogonEvents | 100 | Device logon events |
| EmailEvents | 80 | Email delivery events |
| OfficeActivity | 100 | Microsoft 365 activity logs |
| SecurityAlert | 30 | Security alerts |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/cmitchellm4/Microsoft-siem-xdr-simulator.git
cd Microsoft-siem-xdr-simulator
```

### 2. Start the backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend runs at: http://127.0.0.1:8000
API docs at: http://127.0.0.1:8000/docs

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### 4. Log in with a demo account

| Email | Password | Role |
|-------|----------|------|
| analyst@contoso.com | SOCtraining1! | SOC Analyst (L1) |
| senior@contoso.com | SOCtraining2! | Senior Analyst (L2) |
| admin@contoso.com | SOCtraining3! | Administrator |

---

## 🗺️ Roadmap

- [ ] Persistent data with SQLite
- [ ] Export incident report to PDF
- [ ] Leaderboard and progress tracking
- [ ] Docker one-command setup
- [ ] 5 more attack scenarios
- [ ] Mobile-responsive layout
- [ ] Guided SC-200 study tracks

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas where help is especially welcome:
- New attack scenarios (YAML format documented in [docs/SCENARIO_FORMAT.md](docs/SCENARIO_FORMAT.md))
- Additional KQL challenges
- Bug fixes and UI improvements
- Documentation and translations

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## ⚠️ Disclaimer

This is a training simulator. All data is synthetic and randomly generated. This tool is not connected to any real Microsoft services, tenants, or infrastructure.