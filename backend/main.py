import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.agents.graph import agent_graph
from backend.services.db_service import (
    fetch_mandi_prices,
    fetch_government_schemes,
    get_all_tasks,
    toggle_task_status,
    clear_all_tasks
)
from backend.services.gemini_service import GeminiService

# Setup logger
logger = logging.getLogger("agrisense")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="AgriSense AI API", version="1.0.0")

# Enable CORS for Next.js development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow requests from any local frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini_service = GeminiService()

class ChatRequest(BaseModel):
    location: str = "Punjab"
    soil_type: str = "Clay Loam"
    season: str = "Kharif"
    language: str = "Hindi"
    crop: Optional[str] = None
    message: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "online", "message": "AgriSense AI Farm OS backend running successfully."}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Triggers the full collaborative LangGraph agent workflow."""
    logger.info(f"Chat request received: Location={request.location}, Soil={request.soil_type}, Crop={request.crop}")
    
    # Construct initial graph state
    initial_state = {
        "location": request.location,
        "soil_type": request.soil_type,
        "season": request.season,
        "language": request.language,
        "crop": request.crop,
        "weather_data": None,
        "image_bytes": None,
        "crop_advisor_output": None,
        "disease_doctor_output": None,
        "weather_agent_output": None,
        "market_intelligence_output": None,
        "government_scheme_output": None,
        "action_planner_output": None,
        "messages": [],
        "next_agent": None
    }
    
    try:
        # Run LangGraph execution flow
        result_state = agent_graph.invoke(initial_state)
        
        # Clean up binary image data if present to serialize JSON correctly
        if "image_bytes" in result_state:
            result_state["image_bytes"] = None
            
        return result_state
    except Exception as e:
        logger.error(f"Error running LangGraph: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scan")
async def scan_endpoint(
    image: UploadFile = File(...),
    crop: Optional[str] = Form(None)
):
    """Directly triggers the Disease Doctor agent for crop health image scans."""
    logger.info(f"Image scan requested for crop={crop}")
    try:
        image_bytes = await image.read()
        prompt = f"Identify the disease affecting this plant. Target Crop: {crop if crop else 'General Leaf'}"
        
        analysis = gemini_service.analyze_image(image_bytes, prompt)
        return analysis
    except Exception as e:
        logger.error(f"Scanning failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image scan failed: {str(e)}")

@app.get("/api/weather")
async def weather_endpoint(location: str = "Punjab", crop: str = "Wheat"):
    """Fetch structured weather recommendations."""
    prompt = f"Analyze the weather for location={location} and crop={crop}. Return temperature range, rain forecast, and irrigation schedules."
    try:
        response_text = gemini_service.generate_text(
            prompt,
            system_instruction="Output JSON only.",
            metadata={"location": location, "crop": crop}
        )
        import json
        return json.loads(response_text)
    except Exception:
        # Return fallback simulation
        return {
            "rain_forecast": "Light scattered showers expected on Wednesday (60% probability).",
            "temperature_range": "28°C to 35°C",
            "irrigation_schedule": "Water crops lightly early morning. Avoid evening logging.",
            "spray_timing": "Excellent pesticide spraying conditions for Tuesday before winds exceed 12 km/h."
        }

@app.get("/api/market")
async def market_endpoint(crop: Optional[str] = None):
    """Fetch Mandi price metrics."""
    return fetch_mandi_prices(crop)

@app.get("/api/schemes")
async def schemes_endpoint(search: Optional[str] = None):
    """Fetch matching Government Subsidies/Schemes."""
    return fetch_government_schemes(search)

@app.get("/api/tasks")
async def get_tasks_endpoint():
    """Retrieve planner tasks."""
    return get_all_tasks()

@app.post("/api/tasks/{task_id}/toggle")
async def toggle_task_endpoint(task_id: int):
    """Toggle a task's completed checkmark."""
    toggle_task_status(task_id)
    return {"success": True}

@app.post("/api/tasks/clear")
async def clear_tasks_endpoint():
    """Remove all planner tasks."""
    clear_all_tasks()
    return {"success": True}
