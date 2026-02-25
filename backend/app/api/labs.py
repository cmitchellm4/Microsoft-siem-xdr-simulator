from fastapi import APIRouter, HTTPException
from typing import Optional
from app.simulators.scenario_runner import start_scenario, SCENARIOS

router = APIRouter()


@router.get("/scenarios")
async def list_scenarios(
    difficulty: Optional[str] = None,
):
    """Return available attack scenarios."""
    result = []
    for scenario_id, scenario in SCENARIOS.items():
        if difficulty and scenario["difficulty"].lower() != difficulty.lower():
            continue
        result.append({
            "id": scenario_id,
            "name": scenario["name"],
            "difficulty": scenario["difficulty"],
            "alert_count": len(scenario["alerts"]),
        })
    return {
        "scenarios": result,
        "total": len(result)
    }


@router.post("/scenarios/{scenario_id}/start")
async def start_scenario_endpoint(scenario_id: str):
    """Launch an attack scenario — injects alerts and incidents."""
    try:
        incident = start_scenario(scenario_id)
        return {
            "status": "started",
            "scenario_id": scenario_id,
            "incident_id": incident["id"],
            "alerts_created": incident["alertCount"],
            "message": f"Scenario started! {incident['alertCount']} alerts and 1 incident created.",
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/labs")
async def list_labs(
    difficulty: Optional[str] = None,
):
    """Return available guided labs."""
    return {
        "labs": [],
        "total": 0
    }


@router.post("/labs/{lab_id}/submit")
async def submit_lab_answer(lab_id: str, body: dict):
    """Submit an answer for a lab objective."""
    objective_id = body.get("objective_id")
    answer = body.get("answer")
    if not objective_id or not answer:
        raise HTTPException(
            status_code=400,
            detail="objective_id and answer are required"
        )
    return {
        "correct": False,
        "points_awarded": 0,
        "feedback": "Grading not yet implemented"
    }


@router.get("/progress")
async def get_progress():
    """Return current user progress and score."""
    return {
        "total_points": 0,
        "labs_completed": 0,
        "scenarios_run": 0,
        "skill_tracks": []
    }

@router.post("/reset")
async def reset_environment():
    """Clear all incidents and alerts from the in-memory store."""
    from app.simulators.scenario_runner import clear_all
    clear_all()
    return {
        "status": "reset",
        "message": "Environment reset. All incidents and alerts cleared."
    }