import os
import json
import logging
from PIL import Image
import io
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional, Any

load_dotenv()

logger = logging.getLogger("agrisense")
logging.basicConfig(level=logging.INFO)

API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
IS_MOCK = not API_KEY

# ----------------- Structured JSON Schema Definitions -----------------
class CropRecommendation(BaseModel):
    name: str
    expected_yield: str
    suitability_reason: str
    risks: str
    optimal_sowing_temp: str

class CropAdvisorResponse(BaseModel):
    recommended_crops: List[CropRecommendation]
    soil_enrichment_tips: str

class WeatherResponse(BaseModel):
    rain_forecast: str
    temperature_range: str
    irrigation_schedule: str
    spray_timing: str

class MandiPrice(BaseModel):
    mandi: str
    price: int
    trend: str

class MarketResponse(BaseModel):
    crop: str
    current_mandi_prices: List[MandiPrice]
    recommendation: str
    rationale: str
    predictions: str

class Scheme(BaseModel):
    name: str
    type: str
    benefits: str
    eligibility: str
    application_link: str

class SchemeResponse(BaseModel):
    applicable_schemes: List[Scheme]
    translated_explanation: str

class TaskItem(BaseModel):
    action: str
    reason: str
    priority: str

class PlannerResponse(BaseModel):
    daily_tasks: List[TaskItem]
    weekly_tasks: List[TaskItem]
    monthly_tasks: List[TaskItem]
# ----------------------------------------------------------------------

class GeminiService:
    def __init__(self):
        global IS_MOCK
        self.client = None
        if IS_MOCK:
            logger.warning("GEMINI_API_KEY is not set. Running in Simulator Mode.")
        else:
            try:
                self.client = genai.Client(api_key=API_KEY)
                logger.info("Gemini Service initialized successfully.")
            except Exception as e:
                logger.error(f"Error initializing Gemini client: {e}. Falling back to Simulator Mode.")
                IS_MOCK = True

    def generate_text(self, prompt: str, system_instruction: str = None, response_schema: Any = None, metadata: dict = None) -> str:
        """Generate text from prompt. Enforces structured output schema if provided."""
        if IS_MOCK:
            return self._mock_text_generation(prompt, metadata)
            
        try:
            config = types.GenerateContentConfig()
            if system_instruction:
                config.system_instruction = system_instruction
            if response_schema:
                config.response_mime_type = "application/json"
                config.response_schema = response_schema
                
            # If metadata is provided, prepend it to the prompt to guide the LLM
            full_prompt = prompt
            if metadata:
                metadata_str = "\n".join([f"- {k.capitalize()}: {v}" for k, v in metadata.items() if v])
                full_prompt = f"Context Metadata:\n{metadata_str}\n\n{prompt}"
                
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=full_prompt,
                config=config
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation error: {e}. Using simulated response.")
            return self._mock_text_generation(prompt, metadata)

    def analyze_image(self, image_bytes: bytes, prompt: str) -> dict:
        """Analyze plant crop image to detect diseases using Gemini Vision."""
        if IS_MOCK:
            return self._mock_disease_detection()
            
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            # Requesting structured JSON format
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                system_instruction="You are a professional plant pathologist. Output a JSON containing: 'disease', 'confidence' (e.g. 92%), 'cause', 'treatment' (list of chemical/organic recommendations), and 'prevention' (list of guidelines)."
            )
            
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[image, prompt],
                config=config
            )
            
            # Parse the JSON response
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini Vision error: {e}. Using simulated disease diagnosis.")
            return self._mock_disease_detection()

    def _mock_text_generation(self, prompt: str, metadata: dict = None) -> str:
        """Provides rich, realistic agricultural outputs for different agent prompts."""
        prompt_lower = prompt.lower()
        
        # Extract variables from metadata or fallback to prompt parsing
        location = "Punjab"
        if metadata and metadata.get("location"):
            location = metadata["location"]
        else:
            for loc in ["Punjab", "Haryana", "Rajasthan", "Uttar Pradesh", "Maharashtra", "Gujarat", "Madhya Pradesh", "Bihar", "Karnataka", "Andhra Pradesh", "Tamil Nadu"]:
                if f"location: {loc.lower()}" in prompt_lower or f"location={loc.lower()}" in prompt_lower:
                    location = loc
                    break
                
        season = "Kharif"
        if metadata and metadata.get("season"):
            season = metadata["season"]
        else:
            for seas in ["kharif", "rabi", "zaid"]:
                if seas in prompt_lower:
                    if seas == "kharif":
                        season = "Kharif"
                    elif seas == "rabi":
                        season = "Rabi"
                    elif seas == "zaid":
                        season = "Zaid"
                    break
                
        language = "Hindi"
        if metadata and metadata.get("language"):
            language = metadata["language"]
        else:
            for lang in ["Hindi", "Punjabi", "Telugu", "Marathi", "English"]:
                if lang.lower() in prompt_lower:
                    language = lang
                    break
                
        crop = "Basmati Rice"
        if metadata and metadata.get("crop"):
            crop = metadata["crop"]
        else:
            for line in prompt.split("\n"):
                line_lower = line.lower()
                if "- crop:" in line_lower:
                    crop = line.split(":", 1)[1].strip()
                    break
                elif "crop=" in line_lower:
                    crop = line_lower.split("crop=", 1)[1].split()[0].strip().replace("\"", "").replace("'", "")
                    break
        
        # 1. Action Planner Simulation (specific keyword check)
        if "head coordinator" in prompt_lower or "planner" in prompt_lower or "consolidate the reports" in prompt_lower:
            if season == "Kharif":
                daily = [
                    {"action": f"Check drainage channels in fields of {location} ahead of rain", "reason": "Ensure water-logging is prevented under heavy monsoon spells", "priority": "High"},
                    {"action": f"Monitor {crop} crop for vegetative growth health", "reason": "High humidity conditions invite leaf rollers and fungal pathogens", "priority": "Medium"}
                ]
                weekly = [
                    {"action": "Apply second dose of Nitrogen fertilizer (Urea) at 45kg/acre", "reason": "Time with expected rain intervals to maximize assimilation", "priority": "High"},
                    {"action": f"Prepare biopesticide spray for {crop} protection", "reason": "Humid periods trigger rapid pest hatch cycles", "priority": "Medium"}
                ]
                monthly = [
                    {"action": "Register Kharif crop on PMFBY insurance portal", "reason": "Secure financial cover against flood or monsoon failure", "priority": "High"},
                    {"action": f"Check APMC Mandi price indexes for {crop} updates", "reason": "Track trading price variations to target harvest sale windows", "priority": "Low"}
                ]
            elif season == "Rabi":
                daily = [
                    {"action": f"Inspect soil moisture levels in {location} fields", "reason": "Dry winter conditions require structured irrigation cycles", "priority": "High"},
                    {"action": f"Check {crop} crop leaves for winter rust or frost indicators", "reason": "Morning temperature drops increase rust infection speeds", "priority": "Medium"}
                ]
                weekly = [
                    {"action": "Conduct weeding operations in crop rows", "reason": "Prevent weeds from consuming nitrogen and soil moisture", "priority": "High"},
                    {"action": "Schedule light sprinkler irrigation cycle", "reason": "Keep root zone moist without causing waterlogging during vegetative phase", "priority": "High"}
                ]
                monthly = [
                    {"action": f"Purchase next sowing cycle seeds or green manure compost", "reason": "Plan ahead to capitalize on local cooperative bank subsidies", "priority": "Medium"},
                    {"action": f"Check open-market rates for {crop} in region", "reason": "Decide holding strategy based on MSP procurement levels", "priority": "Low"}
                ]
            else: # Zaid
                daily = [
                    {"action": f"Irrigate {crop} fields in early morning (5-8 AM)", "reason": "High midday temperatures trigger extreme soil evaporation rates", "priority": "High"},
                    {"action": "Inspect drip pipes for blockages or leakage", "reason": "Prevent moisture stress under severe hot summer heat", "priority": "High"}
                ]
                weekly = [
                    {"action": f"Apply organic compost mulch to {crop} beds", "reason": "Retain root moisture and protect micro-organisms from sun heat", "priority": "Medium"},
                    {"action": "Apply micronutrient foliar spray late evening", "reason": "Boost heat resistance and improve flower retention rates", "priority": "Medium"}
                ]
                monthly = [
                    {"action": f"Prepare harvesting crates and transport for {crop}", "reason": "Liquidate summer crops fast due to short post-harvest shelf life", "priority": "High"},
                    {"action": "Register for farm mechanization subsidy scheme", "reason": "Avail 40% discount on solar-powered water pumps", "priority": "Low"}
                ]
                
            return json.dumps({
                "daily_tasks": daily,
                "weekly_tasks": weekly,
                "monthly_tasks": monthly
            })

        # 2. Government Scheme Agent Simulation (specific keyword check)
        elif "government schemes" in prompt_lower or "policies" in prompt_lower or "subsidies" in prompt_lower:
            schemes = [
                {
                    "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                    "type": "Crop Insurance",
                    "benefits": "Compensates for yield losses from sowing to post-harvest. Premium rate is just 2% for Kharif crops and 1.5% for Rabi crops.",
                    "eligibility": "All landholders and sharecropper farmers cultivating notified crops in notified areas.",
                    "application_link": "https://pmfby.gov.in"
                },
                {
                    "name": "Kisan Credit Card (KCC)",
                    "type": "Low-interest Loan",
                    "benefits": "Provides working capital loans up to ₹3 Lakhs at a low interest rate of 4% (subject to timely repayment).",
                    "eligibility": "Self-cultivating farmers, tenants, and joint liability farming groups.",
                    "application_link": "Visit your local cooperative bank branch."
                }
            ]
            
            if language == "Punjabi":
                translation = "ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਫਸਲ ਬੀਮਾ ਯੋਜਨਾ (PMFBY) ਦੇ ਤਹਿਤ ਤੁਹਾਨੂੰ ਫਸਲਾਂ ਦੇ ਨੁਕਸਾਨ 'ਤੇ ਵਿੱਤੀ ਸੁਰੱਖਿਆ ਮਿਲਦੀ ਹੈ। ਖਰੀਫ ਫਸਲਾਂ ਲਈ ਪ੍ਰੀਮੀਅਮ ਸਿਰਫ 2% ਹੈ। ਤੁਸੀਂ ਸਥਾਨਕ ਸਹਿਕਾਰੀ ਬੈਂਕ ਜਾਂ ਬੀਮਾ ਪੋਰਟਲ ਰਾਹੀਂ ਅਪਲਾਈ ਕਰ ਸਕਦੇ ਹੋ। ਕਿਸਾਨ ਕ੍ਰੈਡਿਟ ਕਾਰਡ (KCC) ਰਾਹੀਂ ਘੱਟ ਵਿਆਜ 'ਤੇ ਕਰਜ਼ਾ ਵੀ ਮਿਲ ਸਕਦਾ ਹੈ।"
            elif language == "Telugu":
                translation = "ప్రధానమంత్రి ఫసల్ బీమా యోజన (PMFBY) కింద మీ పంట నష్టానికి ఆర్థిక సహాయం లభిస్తుంది. ఖరీఫ్ పంటల ప్రీమియం కేవలం 2% మాత్రమే. మీరు స్థానిక సహకార బ్యాంకు లేదా ప్రభుత్వ పోర్టల్ ద్వారా దరఖాస్తు చేసుకోవచ్చు. కిసాన్ క్రెడిట్ కార్డ్ (KCC) ద్వారా 4% తక్కువ వడ్డీతో రుణాలు కూడా పొందవచ్చు."
            elif language == "Marathi":
                translation = "पंतप्रधान फसल विमा योजना (PMFBY) अंतर्गत तुमच्या पिकाच्या नुकसानीवर आर्थिक सुरक्षा मिळते. खरीप पिकांसाठी विमा हप्ता केवळ २% आहे. तुम्ही स्थानिक सहकारी बँक किंवा विमा पोर्टलद्वारे अर्ज करू शकता. किसान क्रेडिट कार्ड (KCC) द्वारे कमी व्याजावर कर्ज देखील मिळू शकते."
            elif language == "English":
                translation = "Under the PM Fasal Bima Yojana (PMFBY), you get financial protection against crop losses. The premium is capped at 2% for Kharif crops and 1.5% for Rabi crops. Apply online via the PMFBY portal or visit your nearest cooperative bank. You can also avail low-interest crop loans via Kisan Credit Card (KCC)."
            else: # Hindi (default)
                translation = "प्रधानमंत्री फसल बीमा योजना (PMFBY) के तहत आपको फसल के नुकसान पर वित्तीय सुरक्षा मिलती है। खरीफ फसलों के लिए प्रीमियम केवल 2% है। आप स्थानीय सहकारी बैंक या सरकारी बीमा पोर्टल के माध्यम से आवेदन कर सकते हैं। साथ ही किसान क्रेडिट कार्ड (KCC) के जरिए 4% की सस्ती दर पर ऋण का लाभ ले सकते हैं।"
                
            return json.dumps({
                "applicable_schemes": schemes,
                "translated_explanation": translation
            })

        # 3. Market Intelligence Agent Simulation (specific keyword check)
        elif "commodity market" in prompt_lower or "mandi" in prompt_lower or "price" in prompt_lower:
            crop_name = "Paddy (Rice)"
            if "wheat" in crop.lower() or "kanak" in crop.lower():
                crop_name = "Wheat"
            elif "mustard" in crop.lower() or "sarson" in crop.lower():
                crop_name = "Mustard"
            elif "cotton" in crop.lower() or "kapas" in crop.lower():
                crop_name = "Cotton"
            elif "millet" in crop.lower() or "bajra" in crop.lower():
                crop_name = "Pearl Millet (Bajra)"
            elif "moong" in crop.lower():
                crop_name = "Moong Dal"
            elif "watermelon" in crop.lower():
                crop_name = "Watermelon"
                
            if crop_name == "Wheat":
                prices = [
                    {"mandi": "Khanna Mandi (Punjab)", "price": 2425, "trend": "UP"},
                    {"mandi": "Karnal Mandi (Haryana)", "price": 2410, "trend": "UP"},
                    {"mandi": "Hapur Mandi (UP)", "price": 2405, "trend": "STABLE"}
                ]
                recommendation = "HOLD"
                rationale = "Government procurement centers are actively buying at MSP (₹2,425/quintal). Open market prices are climbing slightly above MSP due to export inquiries. Waiting 2-3 weeks will maximize profits."
                predictions = f"Wheat prices are projected to rise to ₹2,480 per quintal by late {season} season."
            elif crop_name == "Mustard":
                prices = [
                    {"mandi": "Alwar Mandi (Rajasthan)", "price": 5650, "trend": "DOWN"},
                    {"mandi": "Kota Mandi (Rajasthan)", "price": 5580, "trend": "DOWN"},
                    {"mandi": "Hapur Mandi (UP)", "price": 5620, "trend": "STABLE"}
                ]
                recommendation = "SELL"
                rationale = "New winter crops are arriving in mass volumes across Rajasthan, creating a downward pressure on oilseed rates. Selling immediately avoids further price corrections."
                predictions = "Mustard prices might slide to ₹5,450 per quintal as arrivals peak."
            elif crop_name == "Cotton":
                prices = [
                    {"mandi": "Bathinda Mandi (Punjab)", "price": 7250, "trend": "UP"},
                    {"mandi": "Rajkot Mandi (Gujarat)", "price": 7100, "trend": "UP"},
                    {"mandi": "Amravati Mandi (Maharashtra)", "price": 7150, "trend": "STABLE"}
                ]
                recommendation = "HOLD"
                rationale = "Global demand for long-staple cotton has surged. Indian spinning mills are actively buying quality fiber. Retaining stock will fetch premium rates in late auctions."
                predictions = "Cotton prices are estimated to hover around ₹7,450 per quintal by mid-autumn."
            elif crop_name == "Pearl Millet (Bajra)":
                prices = [
                    {"mandi": "Alwar Mandi (Rajasthan)", "price": 2350, "trend": "UP"},
                    {"mandi": "Jaipur Mandi (Rajasthan)", "price": 2320, "trend": "STABLE"},
                    {"mandi": "Agra Mandi (UP)", "price": 2280, "trend": "UP"}
                ]
                recommendation = "SELL"
                rationale = "Demand for coarse grains remains strong for feed industries. Local mandis have stabilized at strong rates. Selling now secures immediate cash flow."
                predictions = "Bajra prices are stable with slight positive bias around ₹2,400."
            elif crop_name == "Moong Dal" or crop_name == "Watermelon":
                prices = [
                    {"mandi": "Delhi Mandi (NCR)", "price": 8200, "trend": "UP"},
                    {"mandi": "Jaipur Mandi (Rajasthan)", "price": 8050, "trend": "UP"},
                    {"mandi": "Indore Mandi (MP)", "price": 8100, "trend": "STABLE"}
                ] if crop_name == "Moong Dal" else [
                    {"mandi": "Azadpur Mandi (Delhi)", "price": 1200, "trend": "UP"},
                    {"mandi": "Agra Mandi (UP)", "price": 1150, "trend": "UP"},
                    {"mandi": "Ahmedabad Mandi (Gujarat)", "price": 1250, "trend": "STABLE"}
                ]
                recommendation = "SELL"
                rationale = "Zaid crops have short shelf life. Summer demand is peak now. Liquidate harvest instantly to capitalize on hot weather consumption."
                predictions = "Prices will peak this week and then stabilize as monsoon approaches."
            else: # Paddy (Rice)
                prices = [
                    {"mandi": "Khanna Mandi (Punjab)", "price": 2250, "trend": "UP"},
                    {"mandi": "Hapur Mandi (UP)", "price": 2200, "trend": "STABLE"},
                    {"mandi": "Karnal Mandi (Haryana)", "price": 2260, "trend": "UP"}
                ]
                recommendation = "HOLD"
                rationale = "Mandi rates are rising due to increased export demand and lower initial crop arrivals. Selling now will miss an expected 4-6% price surge."
                predictions = "Paddy prices are estimated to climb to ₹2,350 per quintal by mid-July."
                
            return json.dumps({
                "crop": crop_name,
                "current_mandi_prices": prices,
                "recommendation": recommendation,
                "rationale": rationale,
                "predictions": predictions
            })

        # 4. Weather Agent Simulation (specific keyword check)
        elif "weather specialist" in prompt_lower or "rain" in prompt_lower or "irrigation" in prompt_lower:
            # Map locations to climate zones
            if location in ["Punjab", "Haryana", "Rajasthan", "Uttar Pradesh"]:
                zone = "north"
            elif location in ["Madhya Pradesh", "Bihar"]:
                zone = "central_east"
            elif location in ["Maharashtra", "Gujarat"]:
                zone = "west"
            else: # Karnataka, Andhra Pradesh, Tamil Nadu
                zone = "south"

            if season == "Kharif":
                if zone == "north":
                    if location == "Rajasthan":
                        rain = "Very dry Kharif. Scattered light drizzles (2-5mm) expected in 4 days. Humidity 45-50%."
                        temp = "30°C to 38°C"
                        irrigation = f"Maintain light drip irrigation for {crop} since local monsoon coverage is weak. Avoid over-watering to prevent salinization."
                        spray = "Good spraying window during morning hours as wind speed is under 8 km/h."
                    else:
                        rain = "Moderate monsoon showers (15mm - 25mm) expected in 2 days. High relative humidity (75-80%) persisting."
                        temp = "27°C to 34°C"
                        irrigation = f"Suspend active irrigation for {crop}. Check field drainage channels to prevent water accumulation."
                        spray = "Delay foliar pesticide sprays. High probability of rain washing away chemicals within 24 hours."
                elif zone == "central_east":
                    rain = "Heavy monsoon downpours (35mm - 60mm) expected in the next 36 hours. Alert for low-lying fields. Humidity 90%."
                    temp = "25°C to 31°C"
                    irrigation = f"IMMEDIATELY suspend all irrigation. Dig run-off trenches to drain excess water from the root zone of {crop}."
                    spray = "Do NOT spray today. Severe rainfall will completely wash away active chemical formulations."
                elif zone == "west":
                    rain = "Intermittent moderate monsoon rains (20mm - 30mm) with gusty coastal winds. Humidity 85%."
                    temp = "26°C to 32°C"
                    irrigation = f"No irrigation required. Natural monsoon rainfall is sufficient for the vegetative phase of {crop}."
                    spray = "Spraying is not recommended due to high wind speeds (up to 18 km/h) causing spray drift."
                else: # south
                    rain = "Light to moderate monsoon showers (10mm - 15mm) with steady westerly winds. Humidity 75%."
                    temp = "25°C to 33°C"
                    irrigation = f"Irrigation not needed. Monitor soil moisture. Keep drainage paths open for {crop} fields."
                    spray = "Systemic fungicides can be applied in early morning during wind lull."

            elif season == "Rabi":
                if zone == "north":
                    rain = "Dry winter conditions. Clear blue skies with zero rainfall forecast for 7 days. Mild morning dew."
                    if location in ["Punjab", "Haryana"]:
                        temp = "8°C to 18°C"
                        irrigation = f"Apply moderate irrigation (2-3 inches) to {crop} to protect crops against potential ground frost damage."
                    else:
                        temp = "12°C to 23°C"
                        irrigation = f"Apply light sprinkler irrigation cycle to keep the crop root zone moist."
                    spray = "Excellent pesticide and fertilizer spraying window. Calm winds (under 5 km/h) and clear afternoon sunlight."
                elif zone == "central_east":
                    rain = "Dry winter weather. No precipitation expected. Clear days with cool nights."
                    temp = "13°C to 25°C"
                    irrigation = f"Schedule light irrigation every 10-12 days for {crop} to prevent soil moisture stress."
                    spray = "Clear spraying conditions. Best time is mid-day after morning dew has fully evaporated."
                elif zone == "west":
                    rain = "Warm, dry winter season. Humidity moderate (50-60%)."
                    temp = "17°C to 29°C"
                    irrigation = f"Apply regular light irrigation. Soil dries faster due to warm daytime temperatures."
                    spray = "Safe spraying window from 8 AM to 2 PM. Avoid late evenings due to local wind shifts."
                else: # south
                    rain = "Occasional Northeast monsoon showers (10mm - 20mm) expected due to localized low pressure. Humidity 70%."
                    temp = "21°C to 30°C"
                    irrigation = f"Postpone next irrigation cycle until rain passes. Adjust schedule based on soil dampness."
                    spray = "Check localized cloud cover. Apply sprays only when clear skies are forecast for at least 6 hours."

            else: # Zaid (Summer)
                if zone == "north":
                    rain = "Severe heatwave condition. Dry winds (Loo) blowing from west. 0% chance of rain. Humidity under 20%."
                    temp = "36°C to 45°C"
                    irrigation = f"Critical moisture stress. Irrigate {crop} every 4 days using drip lines. Mulch fields to preserve water."
                    spray = "Apply foliar sprays only after 6 PM. Daytime heat will cause chemical vaporization and leaf scorch."
                elif zone == "central_east":
                    rain = "Dry and intense summer heat. Dry winds blowing. Humidity around 25%."
                    temp = "34°C to 42°C"
                    irrigation = f"Frequent light irrigation required. Irrigate early mornings (5-8 AM) to minimize evaporation losses."
                    spray = "Spray only in late evening hours. Avoid spraying under direct high solar radiation."
                elif zone == "west":
                    rain = "Hot and dry summer. Steady breeze. Humidity 35%."
                    temp = "33°C to 40°C"
                    irrigation = f"Irrigate crop every 5-6 days. Ensure crop root zone is adequately wet."
                    spray = "Spray during late afternoon when wind speeds decline below 10 km/h."
                else: # south
                    rain = "Humid and moderately hot summer conditions. High moisture level in air (65%)."
                    temp = "29°C to 37°C"
                    irrigation = f"Irrigate every 6-7 days. High humidity reduces soil evaporation but watch for root mildew."
                    spray = "Spraying window is open in early morning. Watch for fungal activity stimulated by high humidity."

            return json.dumps({
                "rain_forecast": rain,
                "temperature_range": temp,
                "irrigation_schedule": irrigation,
                "spray_timing": spray
            })

        # 5. Crop Advisor Agent Simulation (general fallback check)
        elif "agronomist" in prompt_lower or "crop" in prompt_lower or "soil" in prompt_lower:
            if season == "Kharif":
                if location == "Rajasthan":
                    recommended = [
                        {
                            "name": "Pearl Millet (Bajra)",
                            "expected_yield": "1.8 to 2.5 tonnes per hectare",
                            "suitability_reason": "Highly drought-resistant crop suited for dry sandy/loamy soil and hot temperatures in Rajasthan.",
                            "risks": "Ergot disease and downy mildew under sudden heavy spells.",
                            "optimal_sowing_temp": "28°C to 35°C"
                        },
                        {
                            "name": "Cluster Bean (Guar)",
                            "expected_yield": "1.2 to 1.8 tonnes per hectare",
                            "suitability_reason": "Low water requirements and excellent adaptation to sandy soils with nitrogen fixation properties.",
                            "risks": "Bacterial leaf blight and root rot if soil is over-irrigated.",
                            "optimal_sowing_temp": "25°C to 35°C"
                        }
                    ]
                    tips = "Apply 40 kg Nitrogen and 20 kg Phosphorus per hectare. Use organic neem-cake manure to retain soil moisture."
                elif location in ["Maharashtra", "Gujarat", "Karnataka", "Andhra Pradesh", "Tamil Nadu"]:
                    recommended = [
                        {
                            "name": "Cotton (Kapas)",
                            "expected_yield": "2.0 to 2.8 tonnes per hectare",
                            "suitability_reason": "Black cotton soil and monsoon rainfall followed by dry weather during picking is ideal for cotton lint production.",
                            "risks": "Pink Bollworm infestation and leaf curl virus.",
                            "optimal_sowing_temp": "22°C to 32°C"
                        },
                        {
                            "name": "Soybean",
                            "expected_yield": "1.8 to 2.4 tonnes per hectare",
                            "suitability_reason": "Thrives in warm humid conditions and black soils, providing excellent biological nitrogen fixation.",
                            "risks": "Girdle beetle and yellow mosaic virus.",
                            "optimal_sowing_temp": "20°C to 30°C"
                        }
                    ]
                    tips = "Apply balanced NPK (30:60:40) fertilizer. Ensure good field drainage to avoid collar rot."
                else: # Punjab, Haryana, UP, MP, Bihar
                    recommended = [
                        {
                            "name": "Basmati Rice",
                            "expected_yield": "4.5 to 5.5 tonnes per hectare",
                            "suitability_reason": "High rainfall/humidity during monsoon combined with clayey soil properties is ideal for deep flooding irrigation.",
                            "risks": "Stem Borer insects, Bacterial Leaf Blight, and early withdrawal of monsoon.",
                            "optimal_sowing_temp": "25°C to 35°C"
                        },
                        {
                            "name": "Maize (Corn)",
                            "expected_yield": "5.0 to 6.2 tonnes per hectare",
                            "suitability_reason": "Clay-loam with moderate drainage allows good root development without root rot risk if drainage channels are prepared.",
                            "risks": "Fall Armyworm infestations, water-logging in low-lying sections.",
                            "optimal_sowing_temp": "21°C to 27°C"
                        }
                    ]
                    tips = "Apply 120 kg Nitrogen, 60 kg Phosphorus, and 40 kg Potash per hectare. Consider growing green manure (dhaincha) prior to paddy transplanting."
            elif season == "Rabi":
                if location == "Rajasthan":
                    recommended = [
                        {
                            "name": "Mustard (Sarson)",
                            "expected_yield": "2.0 to 2.5 tonnes per hectare",
                            "suitability_reason": "Thrives in dry winter weather of Rajasthan, requiring only 2-3 cycles of irrigation.",
                            "risks": "Mustard aphid outbreaks and white rust under cloudy weather.",
                            "optimal_sowing_temp": "15°C to 22°C"
                        },
                        {
                            "name": "Chickpea (Chana)",
                            "expected_yield": "1.5 to 2.0 tonnes per hectare",
                            "suitability_reason": "Deep root system utilizes residual soil moisture efficiently during winter.",
                            "risks": "Pod borer pests and wilt disease.",
                            "optimal_sowing_temp": "15°C to 25°C"
                        }
                    ]
                    tips = "Apply 20 kg Nitrogen and 40 kg Phosphorus per hectare. Treat seeds with Rhizobium culture to enhance nitrogen fixation."
                elif location in ["Maharashtra", "Gujarat", "Karnataka", "Andhra Pradesh", "Tamil Nadu"]:
                    recommended = [
                        {
                            "name": "Sorghum (Rabi Jowar)",
                            "expected_yield": "2.2 to 3.0 tonnes per hectare",
                            "suitability_reason": "Highly drought-resistant and utilizes post-monsoon soil moisture in heavy black clay soils.",
                            "risks": "Shoot fly pests and charcoal rot.",
                            "optimal_sowing_temp": "15°C to 28°C"
                        },
                        {
                            "name": "Chickpea (Gram)",
                            "expected_yield": "1.6 to 2.2 tonnes per hectare",
                            "suitability_reason": "Excellent winter crop for central black soil tracts with minimal irrigation needs.",
                            "risks": "Fusarium wilt and pod borer damage.",
                            "optimal_sowing_temp": "15°C to 25°C"
                        }
                    ]
                    tips = "Apply 25 kg Nitrogen and 50 kg Phosphorus per hectare."
                else: # Punjab, Haryana, UP, MP, Bihar
                    recommended = [
                        {
                            "name": "Wheat (Kanak)",
                            "expected_yield": "5.0 to 6.5 tonnes per hectare",
                            "suitability_reason": "Cool winter temperatures during vegetative phase and warm dry weather during ripening is perfect for high-yield wheat in this region.",
                            "risks": "Yellow rust disease and heat stress during grain filling stage.",
                            "optimal_sowing_temp": "15°C to 22°C"
                        },
                        {
                            "name": "Mustard (Sarson)",
                            "expected_yield": "2.2 to 2.8 tonnes per hectare",
                            "suitability_reason": "Low water requirement and resistance to cold makes mustard highly profitable during winter in clay-loam soil.",
                            "risks": "Alternaria blight and aphid attacks during flowering.",
                            "optimal_sowing_temp": "10°C to 20°C"
                        }
                    ]
                    tips = "Apply 120 kg Nitrogen, 60 kg Phosphorus, and 40 kg Potash per hectare. Conduct primary tillage with soil turning plow."
            else: # Zaid (Summer)
                recommended = [
                    {
                        "name": "Moong Dal (Green Gram)",
                        "expected_yield": "0.8 to 1.2 tonnes per hectare",
                        "suitability_reason": "Short-duration nitrogen-fixing crop ideal for the dry summer gap before Kharif transplantation.",
                        "risks": "Yellow mosaic virus and leaf hopper pests.",
                        "optimal_sowing_temp": "25°C to 35°C"
                    },
                    {
                        "name": "Watermelon",
                        "expected_yield": "25 to 35 tonnes per hectare",
                        "suitability_reason": "Grows rapidly in hot dry weather with irrigation, capturing high summer market prices.",
                        "risks": "Fruit rot and powdery mildew due to warm climate.",
                        "optimal_sowing_temp": "28°C to 38°C"
                    }
                ]
                tips = "Apply 20 kg Nitrogen, 40 kg Phosphorus, and 20 kg Potash per hectare. Ensure light and frequent drip irrigation during early mornings."
            
            return json.dumps({
                "recommended_crops": recommended,
                "soil_enrichment_tips": tips
            })

        # Generic fallback chat response
        return "AgriSense AI agent here! I'm scanning crop data, forecasting weather cycles, and querying local mandi price indexes to compile an optimal plan for your farm."

    def _mock_disease_detection(self) -> dict:
        """Simulated disease patholgist diagnosis report."""
        return {
            "disease": "Tomato Late Blight (Phytophthora infestans)",
            "confidence": "94%",
            "cause": "Fungal-like oomycete pathogen thriving in cool, wet weather and high humidity.",
            "treatment": [
                "Apply organic copper-based fungicide spray immediately.",
                "Prune and safely destroy lower infected leaves showing dark, water-soaked spots.",
                "Avoid overhead watering; irrigate at soil level to reduce leaf wetness."
            ],
            "prevention": [
                "Practice crop rotation (avoid planting potatoes or eggplants in the same spot next season).",
                "Ensure spacing between tomato plants is at least 2 feet to promote airflow.",
                "Use disease-resistant tomato varieties in the future."
            ]
        }
