import json
import logging
from backend.agents.state import AgentState
from backend.services.db_service import fetch_government_schemes
from backend.services.gemini_service import GeminiService, SchemeResponse

logger = logging.getLogger("agrisense")
gemini = GeminiService()

def government_scheme_node(state: AgentState) -> dict:
    """Agent 5: Matches the crop/location to available subsidies and provides a translation in local languages."""
    logger.info("Executing Government Scheme Agent...")
    
    crop = state.get("crop", "Paddy")
    location = state.get("location", "Punjab")
    language = state.get("language", "Hindi")
    
    # Query matching or all agricultural schemes
    schemes = fetch_government_schemes()
    
    prompt = f"""
    You are an expert on Indian agricultural policies and government schemes.
    Identify the most relevant schemes for this farmer:
    - Crop: {crop}
    - Location: {location}
    - Schemes Database Context: {json.dumps(schemes)}
    - Target Translation Language: {language}
    
    Return a JSON object containing:
    1. 'applicable_schemes': A list of objects with 'name', 'type' (e.g., subsidy, loan), 'benefits', 'eligibility', and 'application_link'.
    2. 'translated_explanation': A detailed guide written entirely in {language} explaining what schemes they should apply for, how they benefit, and the step-by-step process.
    """
    
    system_instruction = "You are a helpful government agricultural liaison. Output JSON format only."
    response_text = gemini.generate_text(
        prompt, 
        system_instruction, 
        response_schema=SchemeResponse,
        metadata={
            "crop": crop,
            "location": location,
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
            logger.error(f"Government Scheme output parsing failed: {e}")
            output_json = {
                "applicable_schemes": schemes[:2],
                "translated_explanation": f"कृपया अपने नजदीकी कृषि विभाग से संपर्क करें। (Fallback translation for {language})"
            }
            
    schemes_list = output_json.get("applicable_schemes")
    schemes_count = len(schemes_list) if isinstance(schemes_list, list) else 0
            
    return {
        "government_scheme_output": output_json,
        "messages": state.get("messages", []) + [{
            "agent": "Government Scheme Agent",
            "content": f"Matched {schemes_count} schemes. Translated summary ready in {language}."
        }]
    }
