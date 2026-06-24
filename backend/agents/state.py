from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    # Inputs
    location: str
    soil_type: str
    season: str
    language: str
    crop: Optional[str]
    weather_data: Optional[Dict[str, Any]]
    image_bytes: Optional[bytes]
    
    # Outputs populated by agents
    crop_advisor_output: Optional[Dict[str, Any]]
    disease_doctor_output: Optional[Dict[str, Any]]
    weather_agent_output: Optional[Dict[str, Any]]
    market_intelligence_output: Optional[Dict[str, Any]]
    government_scheme_output: Optional[Dict[str, Any]]
    action_planner_output: Optional[Dict[str, Any]]
    
    # Collaborative coordination log
    messages: List[Dict[str, Any]]
    next_agent: Optional[str]
