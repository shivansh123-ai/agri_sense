import logging
from langgraph.graph import StateGraph, END
from backend.agents.state import AgentState
from backend.agents.crop_advisor import crop_advisor_node
from backend.agents.disease_doctor import disease_doctor_node
from backend.agents.weather_agent import weather_agent_node
from backend.agents.market_intelligence import market_intelligence_node
from backend.agents.government_scheme import government_scheme_node
from backend.agents.action_planner import action_planner_node

logger = logging.getLogger("agrisense")

def build_agent_graph():
    """Build and compile the multi-agent workflow state graph."""
    logger.info("Initializing LangGraph multi-agent workflow...")
    
    workflow = StateGraph(AgentState)
    
    # 1. Register nodes
    workflow.add_node("crop_advisor", crop_advisor_node)
    workflow.add_node("disease_doctor", disease_doctor_node)
    workflow.add_node("weather_agent", weather_agent_node)
    workflow.add_node("market_intelligence", market_intelligence_node)
    workflow.add_node("government_scheme", government_scheme_node)
    workflow.add_node("action_planner", action_planner_node)
    
    # 2. Define edges
    # The workflow starts with crop recommendations based on location/soil
    workflow.set_entry_point("crop_advisor")
    
    # Run specialists sequentially so their outputs compile
    workflow.add_edge("crop_advisor", "disease_doctor")
    workflow.add_edge("disease_doctor", "weather_agent")
    workflow.add_edge("weather_agent", "market_intelligence")
    workflow.add_edge("market_intelligence", "government_scheme")
    workflow.add_edge("government_scheme", "action_planner")
    
    # End workflow after the Action Planner produces the calendar
    workflow.add_edge("action_planner", END)
    
    compiled_graph = workflow.compile()
    logger.info("LangGraph workflow compiled successfully.")
    return compiled_graph

# Expose instance
agent_graph = build_agent_graph()
