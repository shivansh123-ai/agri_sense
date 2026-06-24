import json
import logging
from backend.agents.state import AgentState
from backend.services.gemini_service import GeminiService, PlannerResponse
from backend.services.db_service import clear_all_tasks, add_farm_task

logger = logging.getLogger("agrisense")
gemini = GeminiService()

def action_planner_node(state: AgentState) -> dict:
    """Agent 6: Consolidates outputs from all other agents and outputs a comprehensive farm calendar."""
    logger.info("Executing Action Planner Agent...")
    
    crop = state.get("crop", "Paddy (Rice)")
    crop_adv = state.get("crop_advisor_output", {})
    disease = state.get("disease_doctor_output", {})
    weather = state.get("weather_agent_output", {})
    market = state.get("market_intelligence_output", {})
    schemes = state.get("government_scheme_output", {})
    
    location = state.get("location", "Punjab")
    season = state.get("season", "Kharif")
    language = state.get("language", "Hindi")
    
    prompt = f"""
    You are the head coordinator for a smart farm management system.
    Consolidate the reports from all specialized agents into a unified, actionable timeline for the crop '{crop}':
    
    - Crop Advisor advice: {json.dumps(crop_adv)}
    - Crop Health Scan / Disease Doctor advice: {json.dumps(disease)}
    - Weather Forecast / Irrigation scheduling: {json.dumps(weather)}
    - Market intelligence (Sell/Hold rates): {json.dumps(market)}
    - Government Schemes & Subsidies: {json.dumps(schemes)}
    
    Compile a detailed calendar list of tasks. Return a JSON object with:
    1. 'daily_tasks': List of task items with 'action', 'reason', 'priority' (High, Medium, Low).
    2. 'weekly_tasks': List of task items with 'action', 'reason', 'priority'.
    3. 'monthly_tasks': List of task items with 'action', 'reason', 'priority'.
    
    Focus on specific actions like: 'Irrigate fields today', 'Spray fungicide (Hexaconazole) due to high humidity forecast', 'Hold wheat inventory due to rising prices', 'Apply NPK fertilizer', 'Apply for PM-KISAN subsidy'.
    """
    
    system_instruction = "You are an organized agricultural planner. Output JSON format only."
    response_text = gemini.generate_text(
        prompt, 
        system_instruction, 
        response_schema=PlannerResponse,
        metadata={
            "crop": crop,
            "location": location,
            "season": season,
            "language": language
        }
    )
    
    try:
        output_json = json.loads(response_text)
    except Exception:
        try:
            cleaned = response_text.replace("```json", "").replace("```", "").strip()
            output_json = json.loads(cleaned)
        except Exception as e:
            logger.error(f"Action Planner output parsing failed: {e}")
            output_json = {
                "daily_tasks": [
                    {"action": "Check fields for moisture levels.", "reason": "Basic monitoring", "priority": "High"}
                ],
                "weekly_tasks": [
                    {"action": "Apply organic manure.", "reason": "Enhance soil structure", "priority": "Medium"}
                ],
                "monthly_tasks": [
                    {"action": "Review local market prices.", "reason": "Track trading windows", "priority": "Low"}
                ]
            }
            
    # Synchronize tasks with database to make them interactive on the UI
    try:
        clear_all_tasks()
        for task in output_json.get("daily_tasks", []):
            add_farm_task(task["action"], "daily")
        for task in output_json.get("weekly_tasks", []):
            add_farm_task(task["action"], "weekly")
        for task in output_json.get("monthly_tasks", []):
            add_farm_task(task["action"], "monthly")
        logger.info("Tasks synchronized to DB successfully.")
    except Exception as db_err:
        logger.error(f"Error syncing planner tasks to SQLite: {db_err}")
        
    daily = output_json.get("daily_tasks")
    weekly = output_json.get("weekly_tasks")
    daily_count = len(daily) if isinstance(daily, list) else 0
    weekly_count = len(weekly) if isinstance(weekly, list) else 0

    return {
        "action_planner_output": output_json,
        "messages": state.get("messages", []) + [{
            "agent": "Action Planner",
            "content": f"Consolidated action checklist generated. Daily tasks: {daily_count}, Weekly tasks: {weekly_count}."
        }]
    }
