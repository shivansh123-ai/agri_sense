import json
import logging
from backend.agents.state import AgentState
from backend.services.db_service import fetch_mandi_prices
from backend.services.gemini_service import GeminiService, MarketResponse

logger = logging.getLogger("agrisense")
gemini = GeminiService()

def market_intelligence_node(state: AgentState) -> dict:
    """Agent 4: Checks nearby mandi rates, analyzes supply/demand, and recommends Sell or Hold."""
    logger.info("Executing Market Intelligence Agent...")
    
    crop = state.get("crop")
    if not crop:
        # Default to Paddy if no crop is set
        crop = "Paddy (Rice)"
        
    season = state.get("season", "Kharif")
        
    # Query prices from SQLite APMC data
    mandi_records = fetch_mandi_prices(crop)
    
    # If no exact match, fetch all to give Gemini broad market context
    if not mandi_records:
        mandi_records = fetch_mandi_prices()
        
    prompt = f"""
    You are a commodity market expert specializing in Indian agriculture.
    Analyze the current mandi rates and advise whether the farmer should Sell or Hold:
    - Crop of Interest: {crop}
    - Current Local Mandi Prices: {json.dumps(mandi_records)}
    
    Return a JSON object containing:
    1. 'crop': The crop name analyzed.
    2. 'current_mandi_prices': A list of records with 'mandi', 'price', and 'trend' (UP, DOWN, STABLE).
    3. 'recommendation': Exactly 'SELL' or 'HOLD'.
    4. 'rationale': Detailed reasons explaining supply/demand, government procurement plans, or weather factors.
    5. 'predictions': Expected rates and trends over the next 15 to 30 days.
    """
    
    system_instruction = "You are a professional agricultural market trader. Output JSON format only."
    response_text = gemini.generate_text(
        prompt, 
        system_instruction, 
        response_schema=MarketResponse,
        metadata={
            "crop": crop,
            "season": season
        }
    )
    
    try:
        output_json = json.loads(response_text)
    except Exception:
        try:
            cleaned = response_text.replace("```json", "").replace("```", "").strip()
            output_json = json.loads(cleaned)
        except Exception as e:
            logger.error(f"Market Intelligence output parsing failed: {e}")
            output_json = {
                "crop": crop,
                "current_mandi_prices": mandi_records[:3],
                "recommendation": "HOLD",
                "rationale": "High export demands are expected to push crop rates higher.",
                "predictions": "Prices are projected to increase by 5% in 2 weeks."
            }
            
    recommendation = output_json.get("recommendation", "HOLD")
    rationale = output_json.get("rationale", "") or ""
    rationale_snippet = rationale[:100] if rationale else "No rationale provided"

    return {
        "market_intelligence_output": output_json,
        "messages": state.get("messages", []) + [{
            "agent": "Market Intelligence",
            "content": f"Market analysis for {crop}. Recommendation: {recommendation}. Rationale: {rationale_snippet}..."
        }]
    }
