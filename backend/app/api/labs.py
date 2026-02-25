from fastapi import APIRouter, HTTPException
from typing import Optional
from app.simulators.scenario_runner import start_scenario, SCENARIOS, clear_all

router = APIRouter()

# In-memory score tracking
_scores: dict = {}

LAB_QUESTIONS = {
    "bec-invoice-fraud-001": [
        {
            "id": "q1",
            "question": "What country did the attacker sign in from?",
            "hint": "Check the Alerts page for the suspicious sign-in alert and look at the description.",
            "answer": "romania",
            "points": 10,
        },
        {
            "id": "q2",
            "question": "What technique did the attacker use to bypass MFA?",
            "hint": "The sign-in alert description mentions a specific attack technique involving a proxy.",
            "answer": "aitm",
            "points": 15,
            "accepted_answers": ["aitm", "adversary in the middle", "adversary-in-the-middle", "session cookie theft"],
        },
        {
            "id": "q3",
            "question": "What is the name of the malicious inbox rule the attacker created?",
            "hint": "Look at the persistence alert in the Alerts page.",
            "answer": "auto-archive",
            "points": 10,
            "accepted_answers": ["auto-archive", "auto archive"],
        },
        {
            "id": "q4",
            "question": "What MITRE ATT&CK technique ID covers the inbox rule creation?",
            "hint": "Check the alert timeline in the incident detail page.",
            "answer": "t1564.008",
            "points": 15,
        },
        {
            "id": "q5",
            "question": "Which Microsoft product detected the suspicious sign-in?",
            "hint": "Look at the product field on the sign-in alert.",
            "answer": "defender for identity",
            "points": 10,
        },
    ],
    "ransomware-lockbit-001": [
        {
            "id": "q1",
            "question": "What was the initial infection vector for this attack?",
            "hint": "Check the first alert in the incident timeline.",
            "answer": "malicious email attachment",
            "points": 10,
            "accepted_answers": ["malicious email attachment", "phishing email", "excel macro", "malicious excel"],
        },
        {
            "id": "q2",
            "question": "What process was used to dump LSASS memory?",
            "hint": "Look at the credential access alert description.",
            "answer": "comsvcs.dll",
            "points": 15,
        },
        {
            "id": "q3",
            "question": "What lateral movement technique was used to reach the domain controller?",
            "hint": "Check the lateral movement alert — look at the MITRE technique ID.",
            "answer": "pass the hash",
            "points": 15,
            "accepted_answers": ["pass the hash", "pass-the-hash", "pth", "t1550.002"],
        },
        {
            "id": "q4",
            "question": "Which device was the final target of the ransomware encryption?",
            "hint": "Look at the last alert in the incident timeline.",
            "answer": "srv-dc-01",
            "points": 10,
        },
        {
            "id": "q5",
            "question": "How many files were reported encrypted in the ransomware alert?",
            "hint": "Read the ransomware alert description carefully.",
            "answer": "500",
            "points": 10,
            "accepted_answers": ["500", "500+", "over 500"],
        },
    ],
"password-spray-001": [
        {
            "id": "q1",
            "question": "How many failed sign-in attempts were detected in the password spray?",
            "hint": "Check the first alert description carefully.",
            "answer": "47",
            "points": 10,
        },
        {
            "id": "q2",
            "question": "Which user account was successfully compromised?",
            "hint": "Look at the second alert in the incident timeline.",
            "answer": "bob.smith@contoso.com",
            "points": 10,
        },
        {
            "id": "q3",
            "question": "What external email address were emails being forwarded to?",
            "hint": "Check the email forwarding rule alert description.",
            "answer": "collector@protonmail.com",
            "points": 15,
        },
        {
            "id": "q4",
            "question": "What MITRE technique covers password spray attacks?",
            "hint": "Check the first alert in the incident timeline.",
            "answer": "t1110.003",
            "points": 15,
            "accepted_answers": ["t1110.003", "T1110.003", "password spray"],
        },
        {
            "id": "q5",
            "question": "How many accounts were targeted in the spray attack?",
            "hint": "Re-read the first alert description.",
            "answer": "12",
            "points": 10,
        },
    ],

    "insider-threat-001": [
        {
            "id": "q1",
            "question": "How many files did the insider download from SharePoint?",
            "hint": "Check the first alert description.",
            "answer": "847",
            "points": 10,
        },
        {
            "id": "q2",
            "question": "What personal cloud storage service did the insider use to exfiltrate data?",
            "hint": "Look at the second alert description.",
            "answer": "dropbox",
            "points": 10,
        },
        {
            "id": "q3",
            "question": "How many employee Social Security Numbers were in the file the insider tried to email?",
            "hint": "Check the DLP alert description.",
            "answer": "1400",
            "points": 15,
            "accepted_answers": ["1400", "1,400"],
        },
        {
            "id": "q4",
            "question": "What key personal event made this user a higher insider threat risk?",
            "hint": "Read the printing alert description carefully.",
            "answer": "resignation",
            "points": 15,
            "accepted_answers": ["resignation", "they resigned", "submitted resignation"],
        },
        {
            "id": "q5",
            "question": "Which Microsoft product detected the personal cloud storage upload?",
            "hint": "Check the product field on the Dropbox alert.",
            "answer": "defender for cloud apps",
            "points": 10,
        },
    ],

    "azure-ad-privilege-escalation-001": [
        {
            "id": "q1",
            "question": "What is the name of the malicious OAuth application registered by the attacker?",
            "hint": "Check the first alert description.",
            "answer": "legitapp",
            "points": 10,
            "accepted_answers": ["legitapp", "LegitApp"],
        },
        {
            "id": "q2",
            "question": "What Azure AD role was the malicious service principal added to?",
            "hint": "Look at the third alert in the incident timeline.",
            "answer": "global administrator",
            "points": 15,
        },
        {
            "id": "q3",
            "question": "How many mailboxes were accessed by the malicious application?",
            "hint": "Check the last alert in the incident timeline.",
            "answer": "312",
            "points": 15,
        },
        {
            "id": "q4",
            "question": "What is this type of attack commonly called?",
            "hint": "Read the incident description carefully.",
            "answer": "illicit consent grant",
            "points": 20,
            "accepted_answers": ["illicit consent grant", "illicit consent grant attack", "consent grant attack"],
        },
        {
            "id": "q5",
            "question": "How many OAuth tokens were generated by the malicious app?",
            "hint": "Check the OAuth token generation alert.",
            "answer": "847",
            "points": 10,
        },
    ],
}


@router.get("/scenarios")
async def list_scenarios(difficulty: Optional[str] = None):
    result = []
    for scenario_id, scenario in SCENARIOS.items():
        if difficulty and scenario["difficulty"].lower() != difficulty.lower():
            continue
        result.append({
            "id": scenario_id,
            "name": scenario["name"],
            "difficulty": scenario["difficulty"],
            "alert_count": len(scenario["alerts"]),
            "question_count": len(LAB_QUESTIONS.get(scenario_id, [])),
        })
    return {"scenarios": result, "total": len(result)}


@router.post("/scenarios/{scenario_id}/start")
async def start_scenario_endpoint(scenario_id: str):
    try:
        incident = start_scenario(scenario_id)
        return {
            "status": "started",
            "scenario_id": scenario_id,
            "incident_id": incident["id"],
            "alerts_created": incident["alertCount"],
            "question_count": len(LAB_QUESTIONS.get(scenario_id, [])),
            "message": f"Scenario started! {incident['alertCount']} alerts and 1 incident created.",
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/scenarios/{scenario_id}/questions")
async def get_questions(scenario_id: str):
    questions = LAB_QUESTIONS.get(scenario_id)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this scenario")
    return {
        "scenario_id": scenario_id,
        "questions": [
            {
                "id": q["id"],
                "question": q["question"],
                "hint": q["hint"],
                "points": q["points"],
            }
            for q in questions
        ],
        "total_points": sum(q["points"] for q in questions),
    }


@router.post("/scenarios/{scenario_id}/answer")
async def submit_answer(scenario_id: str, body: dict):
    question_id = body.get("question_id")
    answer = body.get("answer", "").strip().lower()

    questions = LAB_QUESTIONS.get(scenario_id, [])
    question = next((q for q in questions if q["id"] == question_id), None)

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    accepted = question.get("accepted_answers", [question["answer"]])
    correct = answer in [a.lower() for a in accepted]

    return {
        "correct": correct,
        "points_awarded": question["points"] if correct else 0,
        "correct_answer": question["answer"] if not correct else None,
        "feedback": "Correct! Well done." if correct else f"Not quite. The answer was: {question['answer']}",
    }


@router.get("/labs")
async def list_labs(difficulty: Optional[str] = None):
    return {"labs": [], "total": 0}


@router.post("/labs/{lab_id}/submit")
async def submit_lab_answer(lab_id: str, body: dict):
    objective_id = body.get("objective_id")
    answer = body.get("answer")
    if not objective_id or not answer:
        raise HTTPException(status_code=400, detail="objective_id and answer are required")
    return {"correct": False, "points_awarded": 0, "feedback": "Grading not yet implemented"}


@router.get("/progress")
async def get_progress():
    return {"total_points": 0, "labs_completed": 0, "scenarios_run": 0, "skill_tracks": []}


@router.post("/reset")
async def reset_environment():
    clear_all()
    return {"status": "reset", "message": "Environment reset. All incidents and alerts cleared."}