import json
import logging
from backend.agents.state import AgentState
from backend.services.gemini_service import GeminiService, WeatherResponse

logger = logging.getLogger("agrisense")
gemini = GeminiService()

def weather_agent_node(state: AgentState) -> dict:
    """Agent 3: Analyzes forecasts and determines irrigation schedules and chemical spraying windows."""
    logger.info("Executing Weather Agent...")
    
    location = state.get("location", "Punjab")
    crop = state.get("crop", "Paddy (Rice)")
    season = state.get("season", "Kharif")
    weather_data = state.get("weather_data")
    
    # If no external weather service provided data, define a realistic farming forecast
    if not weather_data:
        weather_data = {
            "temperature_current": "32°C",
            "humidity": "82%",
            "wind_speed": "14 km/h",
            "three_day_forecast": "High humidity, 70% chance of rain on Day 3 with totals around 12mm."
        }
        
    prompt = f"""
    You are an agricultural weather specialist. 
    Analyze the weather conditions and provide an irrigation and spraying schedule for:
    - Crop: {crop}
    - Location: {location}
    - Weather Data: {json.dumps(weather_data)}
    
    Return a JSON object containing:
    1. 'rain_forecast': Summary of the next 3-5 days rain outlook.
    2. 'temperature_range': Temperature guidelines.
    3. 'irrigation_schedule': Precise watering guidelines (e.g. skip irrigation, water lightly).
    4. 'spray_timing': Optimal window to spray pesticides/fungicides or liquid fertilizers based on rain/wind speed.
    """
    
    system_instruction = "You are a pragmatic farm-weather consultant. Output JSON format only."
    response_text = gemini.generate_text(
        prompt, 
        system_instruction, 
        response_schema=WeatherResponse,
        metadata={
            "location": location,
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
            logger.error(f"Weather Agent output parsing failed: {e}")
            output_json = {
                "rain_forecast": "Rain expected in 2 days",
                "temperature_range": "30-35C",
                "irrigation_schedule": "Postpone watering to avoid waterlogging.",
                "spray_timing": "Spray tomorrow morning before wind speeds pick up."
            }
            
    return {
        "weather_agent_output": output_json,
        "messages": state.get("messages", []) + [{
            "agent": "Weather Agent",
            "content": f"Weather advisory generated for {crop}. Recommendation: {output_json.get('irrigation_schedule')}"
        }]
    }
