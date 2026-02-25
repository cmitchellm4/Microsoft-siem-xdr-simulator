# Contributing to Microsoft SIEM & XDR Simulator

Thank you for your interest in contributing! This project thrives on community involvement from security practitioners, educators, and developers.

## Ways to Contribute

| Contribution Type | Skill Required | Difficulty |
|-------------------|---------------|------------|
| New attack scenarios (YAML) | Cybersecurity knowledge | ⭐ Easy |
| KQL challenges / exercises | KQL experience | ⭐⭐ Medium |
| Bug fixes | Python or React | ⭐ Easy |
| UI improvements | React / TypeScript | ⭐⭐ Medium |
| New KQL operators | Python | ⭐⭐⭐ Hard |
| New product simulations | Full-stack | ⭐⭐⭐ Hard |
| Documentation | Writing | ⭐ Easy |

## Getting Started

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/msiem-xdr-simulator.git
cd msiem-xdr-simulator
```

### 2. Set up dev environment

```bash
# Start dependencies only
docker compose up db redis -d

# Backend
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### 3. Create a branch

```bash
git checkout -b feature/my-new-scenario
# or
git checkout -b fix/kql-where-clause-bug
```

## Adding a New Attack Scenario

This is the most impactful way to contribute and requires no coding.

1. Read the [Scenario Format Guide](docs/SCENARIO_FORMAT.md)
2. Create your YAML file in `scenarios/shared/`, `scenarios/sentinel/`, or `scenarios/defender/`
3. Validate it: `python scripts/validate_scenario.py scenarios/shared/your-scenario.yaml`
4. Submit a PR with the `scenario` label

**Scenario guidelines:**
- Base it on real-world TTP patterns (reference public threat intel reports)
- Fictionalize all org names, usernames, and IPs
- Include at least 3 MITRE ATT&CK technique mappings
- Add a guided lab with 3+ objectives
- Cover at least 3 distinct attack stages

## Code Contribution Guidelines

### Python (Backend)

- Follow PEP 8 style
- Use type hints on all functions
- Write docstrings for modules and public functions
- Add tests in `backend/tests/` for new functionality
- Run tests before submitting: `pytest backend/tests/`

### TypeScript / React (Frontend)

- Use functional components with hooks only
- Type everything — avoid `any`
- Components go in `frontend/src/components/`
- Pages go in `frontend/src/pages/`
- Run lint before submitting: `npm run lint`

### Commit Messages

Use conventional commits:
```
feat: add new KQL summarize operator
fix: where clause fails on datetime comparison
docs: add scenario format guide
scenario: add LockBit ransomware campaign
test: add KQL engine unit tests
```

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if you've changed behaviour
3. Fill in the PR template completely
4. Link any related issues
5. Request review from a maintainer

## Issue Labels

| Label | Meaning |
|-------|---------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `scenario` | New attack scenario |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `kql` | KQL engine related |
| `ui` | Frontend related |
| `documentation` | Docs improvements |

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/). Be kind, be respectful, and remember we're all here to help the security community learn.

## Questions?

Open a discussion in the GitHub Discussions tab or open an issue with the `question` label.
