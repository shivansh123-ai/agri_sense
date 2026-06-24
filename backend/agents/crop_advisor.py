import json
import logging
from backend.agents.state import AgentState
from backend.services.gemini_service import GeminiService, CropAdvisorResponse

logger = logging.getLogger("agrisense")
gemini = GeminiService()

def crop_advisor_node(state: AgentState) -> dict:
    """Agent 1: Recommends best crops based on location, soil, season, and weather."""
    logger.info("Executing Crop Advisor Agent...")
    
    location = state.get("location", "Punjab")
    soil_type = state.get("soil_type", "Clay Loam")
    season = state.get("season", "Kharif")
    weather = state.get("weather_data")
    
    prompt = f"""
    You are an expert agronomist advising smallholder farmers. 
    Analyze the following farm conditions and suggest the best crops:
    - Location: {location}
    - Soil Type: {soil_type}
    - Season: {season}
    - Current Weather Context: {json.dumps(weather) if weather else 'No recent weather data'}
    
    Return a JSON object containing:
    1. 'recommended_crops': A list of crop objects, each with 'name', 'expected_yield', 'suitability_reason', 'risks', 'optimal_sowing_temp'.
    2. 'soil_enrichment_tips': A string recommending fertilizers or compost.
    """
    
    system_instruction = "You are a friendly and professional agronomist. Output JSON format only."
    response_text = gemini.generate_text(
        prompt, 
        system_instruction, 
        response_schema=CropAdvisorResponse,
        metadata={
            "location": location,
            "season": season,
            "language": state.get("language", "Hindi")
        }
    )
    
    try:
        output_json = json.loads(response_text)
    except Exception:
        # Fallback to parsing a JSON block if code block delimiters are returned
        try:
            cleaned = response_text.replace("```json", "").replace("```", "").strip()
            output_json = json.loads(cleaned)
        except Exception as e:
            logger.error(f"Crop Advisor output parsing failed: {e}")
            output_json = {
                "recommended_crops": [
                    {"name": "Paddy (Rice)", "expected_yield": "4.2 tonnes/ha", "suitability_reason": "High humidity", "risks": "Blast disease", "optimal_sowing_temp": "28C"}
                ],
                "soil_enrichment_tips": "Apply balanced NPK fertilizer."
            }
            
    # Append status log to messages
    crops_list = output_json.get("recommended_crops") or []
    crop_names = ", ".join([c.get("name", "Unknown") for c in crops_list if isinstance(c, dict)])
    
    state_update = {
        "crop_advisor_output": output_json,
        "messages": state.get("messages", []) + [{
            "agent": "Crop Advisor",
            "content": f"Analyzed soil type ({soil_type}) and season ({season}) at location ({location}). Recommending: {crop_names}."
        }]
    }
    
    # If the user hasn't locked in a crop, let's select the first recommendation
    if not state.get("crop") and output_json.get("recommended_crops"):
        state_update["crop"] = output_json["recommended_crops"][0]["name"]
        
    return state_update
