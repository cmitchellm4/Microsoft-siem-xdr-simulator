# Architecture Guide

## Overview

The Microsoft SIEM & XDR Simulator follows a layered, service-oriented architecture designed to be extensible, easy to contribute to, and faithful to the real Microsoft security portal experience.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Port 3000)                       │
│              React + TypeScript Frontend                         │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │  Sentinel   │  │ Defender XDR │  │    Labs & Scenarios   │  │
│   │    Pages    │  │    Pages     │  │       Pages           │  │
│   └─────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST / WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                   FastAPI Backend (Port 8000)                     │
│                                                                   │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │  Sentinel  │  │  Defender    │  │     Lab / Scenario       │  │
│  │    API     │  │   XDR API    │  │        API               │  │
│  └─────┬──────┘  └──────┬───────┘  └───────────┬─────────────┘  │
│        │                │                       │               │
│  ┌─────▼────────────────▼───────────────────────▼─────────────┐ │
│  │                    Core Services                             │ │
│  │  KQL Engine │ Alert Engine │ Scenario Runner │ Log Generator │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼────────────────┐
           │               │                │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │ PostgreSQL  │ │    Redis    │ │  YAML Files │
    │  (Port 5432)│ │  (Port 6379)│ │  Scenarios  │
    └─────────────┘ └─────────────┘ └─────────────┘
```

## Component Details

### Frontend (React + TypeScript)

The frontend mimics the look and feel of the Microsoft Defender portal and Microsoft Sentinel within the Azure portal. Key design goals:

- **Portal-accurate navigation**: Replicate the sidebar structure, breadcrumbs, and layout familiar to real Sentinel/Defender users
- **Live data streaming**: Use WebSockets to show real-time alert creation as scenarios run
- **KQL Editor**: Monaco Editor (same editor as VS Code) for the KQL query experience

**Key directories:**
```
src/
├── components/
│   ├── sentinel/     # Incident queue, workbooks, analytics rules
│   ├── defender/     # Alerts, devices, advanced hunting
│   ├── shared/       # Navigation, KQL editor, alert cards
│   └── labs/         # Lab runner, progress tracker
├── pages/
│   ├── SentinelDashboard.tsx
│   ├── IncidentQueue.tsx
│   ├── DefenderAlerts.tsx
│   ├── AdvancedHunting.tsx
│   └── LabRunner.tsx
└── store/
    ├── sentinelSlice.ts
    ├── defenderSlice.ts
    └── labSlice.ts
```

### Backend (FastAPI + Python)

FastAPI provides asynchronous REST endpoints and WebSocket support. The backend is organized around three simulation domains:

**Sentinel API** (`/api/v1/sentinel/`)
- `GET /incidents` — List incidents with filters
- `GET /incidents/{id}` — Incident detail + evidence
- `POST /incidents/{id}/assign` — Assign incident
- `POST /query/kql` — Execute KQL query
- `GET /workbooks` — List workbook templates
- `GET /analytics-rules` — List detection rules

**Defender XDR API** (`/api/v1/defender/`)
- `GET /alerts` — Multi-product alert feed
- `GET /incidents` — Correlated incidents
- `GET /devices` — Device inventory
- `POST /hunting/query` — Advanced Hunting KQL
- `GET /vulnerabilities` — TVM data

**Lab API** (`/api/v1/labs/`)
- `GET /scenarios` — Available attack scenarios
- `POST /scenarios/{id}/start` — Launch a scenario
- `GET /labs` — Guided lab catalog
- `POST /labs/{id}/submit` — Submit lab answer
- `GET /progress` — User progress & score

### KQL Engine

The KQL engine is a custom Python implementation that supports a realistic subset of Kusto Query Language. It executes against an in-memory/PostgreSQL dataset representing Azure Monitor log tables.

**Supported operators (Phase 1):**
- `where` — Filter rows
- `project` — Select columns
- `extend` — Add computed columns
- `summarize` — Aggregation (`count()`, `sum()`, `avg()`, `dcount()`, `make_list()`)
- `order by` / `sort by` — Sorting
- `take` / `limit` — Row limiting
- `join` — Table joins (`inner`, `leftouter`)
- `union` — Combine tables
- `parse` — String parsing
- `mv-expand` — Expand arrays
- `ago()`, `now()`, `datetime()`, `bin()` — Time functions
- `contains`, `startswith`, `has`, `matches regex` — String operators
- `iff()`, `case()`, `iif()` — Conditional expressions

**Architecture:**
```
KQL Query String
      ↓
  Lexer / Tokenizer
      ↓
  Parser (AST)
      ↓
  Query Planner
      ↓
  Executor (against Pandas DataFrames / PostgreSQL)
      ↓
  Result Formatter (JSON)
```

### Scenario Engine

Scenarios are defined in YAML and describe multi-stage attack chains. The engine reads scenario definitions and injects synthetic telemetry into the appropriate log tables on a configurable timeline.

**Example scenario structure:**
```yaml
# scenarios/defender/ransomware-lapsus.yaml
id: ransomware-lapsus-001
name: "LockBit Ransomware Campaign"
mitre_techniques:
  - T1566.001  # Phishing Attachment
  - T1059.001  # PowerShell
  - T1486      # Data Encrypted for Impact
difficulty: intermediate
estimated_minutes: 30

stages:
  - name: Initial Access
    delay_minutes: 0
    events:
      - type: defender_alert
        alert_name: "Suspicious email attachment opened"
        severity: medium
      - type: sentinel_log
        table: EmailEvents
        data: { ... }
  - name: Execution
    delay_minutes: 5
    events:
      - type: defender_alert
        alert_name: "Encoded PowerShell command execution"
        severity: high
```

### Data Layer

**PostgreSQL** stores:
- User accounts and progress
- Incident and alert state (modified by user actions)
- KQL query history
- Lab completion records

**Redis** handles:
- Real-time alert streaming (WebSocket pub/sub)
- Session caching
- Scenario state (timers, stage progression)

**YAML files** define:
- Attack scenarios
- Guided lab content and questions
- Synthetic baseline log datasets (loaded at startup)

## Data Flow: Running a Scenario

```
User clicks "Start Scenario"
        ↓
Lab API creates Scenario Run record (Postgres)
        ↓
Scenario Runner reads YAML definition
        ↓
Scheduler begins stage injection
        ↓
Log Generator writes synthetic events → PostgreSQL log tables
        ↓
Alert Engine evaluates analytics rules → Creates alerts/incidents
        ↓
Redis pub/sub broadcasts new alerts
        ↓
WebSocket pushes to frontend
        ↓
User sees live alert in Sentinel / Defender UI
        ↓
User investigates, queries KQL, takes action
        ↓
Lab Engine validates user responses → Awards score
```

## Security Considerations

- All simulated data is entirely synthetic — no real credentials or PII
- The application is designed for local/intranet use only
- Default auth is basic username/password (JWT tokens)
- No external network calls are made during simulation
- Scenario YAML is sandboxed — no code execution from scenario files

## Extending the Simulator

### Adding a New Product Simulation

1. Create `backend/app/api/{product}/` with route handlers
2. Create `backend/app/simulators/{product}/` with log/alert generators
3. Create `frontend/src/pages/{Product}*.tsx` with portal UI
4. Add navigation entries to the sidebar
5. Add synthetic log tables to `data/logs/`

### Adding a New Scenario

See [SCENARIO_FORMAT.md](SCENARIO_FORMAT.md) for the full YAML specification.

### Adding a New KQL Function

1. Add the function signature to `backend/app/simulators/kql/functions.py`
2. Implement the function logic
3. Add test cases to `backend/tests/test_kql.py`
4. Document in [KQL_ENGINE.md](KQL_ENGINE.md)
