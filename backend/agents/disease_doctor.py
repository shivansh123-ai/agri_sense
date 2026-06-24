import logging
from backend.agents.state import AgentState
from backend.services.gemini_service import GeminiService

logger = logging.getLogger("agrisense")
gemini = GeminiService()

def disease_doctor_node(state: AgentState) -> dict:
    """Agent 2: Detects crop diseases from uploaded leaf/plant images using Gemini Vision."""
    logger.info("Executing Disease Doctor Agent...")
    
    image_bytes = state.get("image_bytes")
    
    if not image_bytes:
        # Return a healthy summary or instruction to upload
        output = {
            "disease": "No leaf scan uploaded",
            "confidence": "100%",
            "cause": "Farmer did not provide an image of the plant.",
            "treatment": ["To diagnose a specific disease, please upload an image of the affected plant leaf using the Field Scanner."],
            "prevention": ["Maintain routine monitoring of leaf surfaces for discoloration, holes, or spots."]
        }
        return {
            "disease_doctor_output": output,
            "messages": state.get("messages", []) + [{
                "agent": "Disease Doctor",
                "content": "No leaf scan image was provided. Standing by to analyze crop photos."
            }]
        }
        
    # Analyze uploaded image
    prompt = "Examine this plant leaf for any discoloration, spots, damage, or symptoms of pest infestation. Identify the disease, cause, immediate treatment steps, and long-term prevention guidelines."
    
    output = gemini.analyze_image(image_bytes, prompt)
    
    treatments = output.get("treatment")
    first_treatment = treatments[0] if isinstance(treatments, list) and treatments else "Follow default treatment guidelines."
    
    return {
        "disease_doctor_output": output,
        "messages": state.get("messages", []) + [{
            "agent": "Disease Doctor",
            "content": f"Scan completed. Diagnosed: {output.get('disease', 'Healthy')} with {output.get('confidence', '100%')} confidence. Immediate action: {first_treatment}"
        }]
    }
