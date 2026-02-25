# 🛡️ Microsoft SIEM & XDR Simulator

> A free, open-source training environment that simulates Microsoft Sentinel and Microsoft Defender XDR — built for aspiring cybersecurity professionals to practice real-world skills without an Azure subscription.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active%20development-orange)
![Stack](https://img.shields.io/badge/stack-Python%20%7C%20React%20%7C%20Docker-informational)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

---

## 🎯 What Is This?

The **Microsoft SIEM & XDR Simulator** is a locally-hosted training platform that faithfully recreates the Microsoft Sentinel and Defender XDR experience. It's designed for:

- 🎓 Students preparing for **SC-200**, **AZ-500**, or **MS-500** certifications
- 🔍 Junior SOC analysts building **threat detection and triage** skills
- 🧪 Security engineers learning **KQL (Kusto Query Language)**
- 🧑‍🏫 Instructors who need a **hands-on lab environment** without cloud costs

No Azure subscription required. Spin it up in minutes with Docker.

---

## ✨ Features

### 🖥️ Microsoft Sentinel Simulator
- Realistic **Incident Queue** with severity, status, and assignment workflows
- Interactive **KQL Query Editor** backed by synthetic log data
- **Workbook dashboards** for threat visibility
- **Analytics Rule builder** — create detection rules and watch them fire
- Log data covering: Azure Activity, AAD Sign-in, Syslog, SecurityEvent, and more

### 🔐 Microsoft Defender XDR Simulator
- **Alerts & Incidents** view across Defender for Endpoint, Identity, Office 365, and Cloud Apps
- **Device inventory** with simulated vulnerability and exposure data
- **Advanced Hunting** with KQL support
- **Threat & Vulnerability Management** dashboard
- **Email threat explorer** (Defender for Office 365)

### 🎮 Attack Scenario Engine
- Pre-built attack chains mapped to **MITRE ATT&CK**
- Scenarios covering: BEC, ransomware, lateral movement, credential harvesting, insider threat
- Scenarios inject realistic telemetry across Sentinel and Defender simultaneously
- **Difficulty levels**: Beginner → Intermediate → Advanced

### 📚 Guided Labs & Skill Tracks
- Step-by-step walkthroughs with hints
- **Scoring and progress tracking** per user
- Skill tracks: SOC Analyst L1, Threat Hunter, Incident Responder, KQL Master
- Lab completion certificates (exportable)

### ⚙️ Additional Tools (Roadmap)
- Microsoft Entra ID (Azure AD) simulation
- Microsoft Purview Compliance portal
- Microsoft Defender for Cloud (CSPM)

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- 4GB RAM minimum (8GB recommended)
- Modern browser (Chrome, Edge, Firefox)

### Run in 3 commands

```bash
git clone https://github.com/YOUR_USERNAME/msiem-xdr-simulator.git
cd msiem-xdr-simulator
docker compose up
```

Then open your browser to: **http://localhost:3000**

Default credentials: `admin / simulator123`

---

## 🗺️ Project Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | 🔨 In Progress | Core Sentinel UI — Incident queue, basic KQL engine, 5 starter scenarios |
| **Phase 2** | 📋 Planned | Defender XDR UI — Alerts, devices, advanced hunting |
| **Phase 3** | 📋 Planned | Scenario engine v2 — Dynamic attack injection, multi-stage campaigns |
| **Phase 4** | 📋 Planned | Guided labs, scoring engine, skill tracks |
| **Phase 5** | 💡 Future | Entra ID sim, Purview, Defender for Cloud |

---

## 🏗️ Architecture

```
msiem-xdr-simulator/
├── backend/                  # Python / FastAPI
│   └── app/
│       ├── api/              # REST endpoints (Sentinel, Defender, Auth)
│       ├── core/             # Config, security, database
│       ├── models/           # SQLAlchemy ORM models
│       ├── services/         # Business logic
│       └── simulators/       # KQL engine, log generator, alert engine
├── frontend/                 # React / TypeScript
│   └── src/
│       ├── components/       # UI components (portal-style)
│       ├── pages/            # Sentinel, Defender, Lab pages
│       ├── hooks/            # Custom React hooks
│       ├── store/            # Redux/Zustand state
│       └── types/            # TypeScript interfaces
├── scenarios/                # YAML-defined attack scenarios
│   ├── sentinel/
│   ├── defender/
│   └── shared/
├── data/                     # Synthetic log datasets
│   ├── logs/
│   ├── alerts/
│   └── incidents/
└── docker/                   # Dockerfiles and compose config
```

**Tech Stack:**

| Layer | Technology | Reason |
|-------|-----------|--------|
| Backend API | Python + FastAPI | Native to security tooling ecosystem |
| Frontend | React + TypeScript | Best for recreating complex portals |
| Database | PostgreSQL | Reliable relational store for incidents/users |
| Cache / Streaming | Redis | Real-time alert simulation |
| KQL Engine | Custom Python parser | Lightweight, extensible |
| Container | Docker + Compose | One-command setup |

---

## 🧑‍💻 Contributing

We welcome contributions of all kinds! Whether you're fixing bugs, adding scenarios, improving the UI, or writing documentation — you're helping the next generation of security professionals.

### Ways to Contribute
- 🐛 **Bug reports** — Open an issue with the `bug` label
- 💡 **Feature requests** — Open an issue with the `enhancement` label
- 🎭 **New attack scenarios** — See `scenarios/CONTRIBUTING.md`
- 🔍 **KQL challenges** — Add new query exercises
- 🌐 **UI improvements** — Make it look more like the real portals

### Getting Started (Dev)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## 📖 Documentation

| Doc | Description |
|-----|-------------|
| [Architecture Guide](docs/ARCHITECTURE.md) | Deep dive into system design |
| [KQL Engine](docs/KQL_ENGINE.md) | How the query engine works |
| [Scenario Format](docs/SCENARIO_FORMAT.md) | How to write attack scenarios |
| [Lab Design Guide](docs/LAB_DESIGN.md) | How to create guided labs |
| [API Reference](docs/API.md) | Backend API documentation |

---

## 🛡️ Disclaimer

This project is for **educational purposes only**. All attack scenarios and telemetry are entirely synthetic. No real credentials, systems, or networks are used or targeted. The simulator is not affiliated with or endorsed by Microsoft.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## ⭐ Star This Repo

If this project helped you, please give it a star. It helps others find it and motivates continued development!

---

*Built with ❤️ for the cybersecurity community*
