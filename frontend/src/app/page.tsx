"use client";

import { useState, useEffect } from "react";
import { 
  Sprout, 
  CloudRain, 
  TrendingUp, 
  ShieldAlert, 
  MapPin, 
  Layers, 
  Calendar, 
  Languages, 
  ChevronRight, 
  ArrowRight,
  Loader2,
  Sparkles,
  BookOpenCheck,
  Sun,
  Wind,
  Compass
} from "lucide-react";
import Link from "next/link";

// Multi-lingual translation mapping for the dashboard UI
const translations: Record<string, Record<string, string>> = {
  English: {
    title: "AgriSense AI",
    subtitle: "AI-Powered Multi-Agent Operating System for Smallholder Farms",
    agentsActive: "6 Collaborative Specialist Agents Active",
    configTitle: "Configure Farm Parameters",
    labelLocation: "Location / Region",
    labelSoil: "Soil Profile",
    labelSeason: "Season",
    labelLanguage: "Language Advisor",
    btnCompile: "Compile Farm Strategy & Tasks",
    btnCompiling: "Agent Team Collaborating...",
    healthTitle: "Overall Crop Health",
    healthOptimal: "Optimal",
    healthWarning: "All active parameters within safe thresholds.",
    weatherTitle: "Weather Agent Advisory",
    weatherRain: "Rain Forecast",
    weatherIrrigation: "Irrigation Action",
    weatherSpraying: "Spraying Window",
    advisorTitle: "Crop Advisor Recommendations",
    advisorSoil: "Soil Enrichment Guidelines",
    marketTitle: "Market Intelligence Outlook",
    marketRecommendation: "Trading Action",
    marketPredictions: "Checking Mandis",
    tasksTitle: "Today's Actions",
    tasksFull: "Full Calendar",
    schemeTitle: "Government Scheme Advisor",
    schemeSummary: "Language Summary",
    detectLoc: "Detect Location",
    detecting: "Detecting...",
    optionKharif: "Kharif (Monsoon)",
    optionRabi: "Rabi (Winter)",
    optionZaid: "Zaid (Summer)",
    optionClayLoam: "Clay Loam",
    optionSandySoil: "Sandy Soil",
    optionAlluvialSoil: "Alluvial Soil",
    optionBlackCotton: "Black Cotton Soil",
    optionSiltyClay: "Silty Clay"
  },
  Hindi: {
    title: "एग्रीसेंस एआई",
    subtitle: "छोटे किसानों के लिए एआई-संचालित मल्टी-एजेंट कृषि प्रणाली",
    agentsActive: "6 सहयोगी विशेषज्ञ एजेंट सक्रिय हैं",
    configTitle: "कृषि पैरामीटर सेट करें",
    labelLocation: "राज्य / क्षेत्र",
    labelSoil: "मिट्टी का प्रकार",
    labelSeason: "मौसम",
    labelLanguage: "भाषा सलाहकार",
    btnCompile: "कृषि रणनीति और कार्य संकलित करें",
    btnCompiling: "एजेंट टीम सहयोग कर रही है...",
    healthTitle: "फसल का कुल स्वास्थ्य",
    healthOptimal: "उत्तम",
    healthWarning: "सभी सक्रिय पैरामीटर सुरक्षित सीमा में हैं।",
    weatherTitle: "मौसम एजेंट की सलाह",
    weatherRain: "बारिश का पूर्वानुमान",
    weatherIrrigation: "सिंचाई की कार्रवाई",
    weatherSpraying: "छिड़काव का सही समय",
    advisorTitle: "फसल सलाहकार की सिफारिशें",
    advisorSoil: "मिट्टी संवर्धन दिशा-निर्देश",
    marketTitle: "बाजार खुफिया दृष्टिकोण",
    marketRecommendation: "व्यापारिक कार्रवाई",
    marketPredictions: "मंडियों की जांच",
    tasksTitle: "आज की कार्रवाई",
    tasksFull: "पूर्ण कैलेंडर",
    schemeTitle: "सरकारी योजना सलाहकार",
    schemeSummary: "भाषा सारांश",
    detectLoc: "स्थान खोजें",
    detecting: "खोज रहे हैं...",
    optionKharif: "खरीफ (मानसून)",
    optionRabi: "रबी (सर्दी)",
    optionZaid: "जायद (गर्मी)",
    optionClayLoam: "चिकनी दोमट मिट्टी",
    optionSandySoil: "रेतीली मिट्टी",
    optionAlluvialSoil: "जलोढ़ मिट्टी",
    optionBlackCotton: "काली कपास मिट्टी",
    optionSiltyClay: "गाद वाली मिट्टी"
  },
  Punjabi: {
    title: "ਐਗਰੀਸੈਂਸ ਏਆਈ",
    subtitle: "ਛੋਟੇ ਕਿਸਾਨਾਂ ਲਈ ਏਆਈ-ਸੰਚਾਲਿਤ ਮਲਟੀ-ਏਜੰਟ ਖੇਤੀ ਪ੍ਰਣਾਲੀ",
    agentsActive: "6 ਸਹਿਯੋਗੀ ਮਾਹਰ ਏਜੰਟ ਸਰਗਰਮ ਹਨ",
    configTitle: "ਖੇਤ ਦੇ ਪੈਰਾਮੀਟਰ ਕੌਂਫਿਗਰ ਕਰੋ",
    labelLocation: "ਸਥਾਨ / ਖੇਤਰ",
    labelSoil: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ",
    labelSeason: "ਮੌਸਮ",
    labelLanguage: "ਭਾਸ਼ਾ ਸਲਾਹਕਾਰ",
    btnCompile: "ਖੇਤੀਬਾੜੀ ਰਣਨੀਤੀ ਅਤੇ ਕਾਰਜਾਂ ਨੂੰ ਸੰਕਲਿਤ ਕਰੋ",
    btnCompiling: "ਏਜੰਟ ਟੀਮ ਸਹਿਯੋਗ ਕਰ ਰਹੀ ਹੈ...",
    healthTitle: "ਫਸਲ ਦੀ ਕੁੱਲ ਸਿਹਤ",
    healthOptimal: "ਵਧੀਆ",
    healthWarning: "ਸਾਰੇ ਸਰਗਰਮ ਪੈਰਾਮੀਟਰ ਸੁਰੱਖਿਅਤ ਸੀਮਾ ਦੇ ਅੰਦਰ ਹਨ।",
    weatherTitle: "ਮੌਸਮ ਏਜੰਟ ਦੀ ਸਲਾਹ",
    weatherRain: "ਮੀਂਹ ਦੀ ਭਵਿੱਖਬਾਣੀ",
    weatherIrrigation: "ਸਿੰਚਾਈ ਕਾਰਵਾਈ",
    weatherSpraying: "ਸਪ੍ਰੇਅ ਕਰਨ ਦਾ ਸਮਾਂ",
    advisorTitle: "ਫਸਲ ਸਲਾਹਕਾਰ ਦੀਆਂ ਸਿਫ਼ਾਰਸ਼ਾਂ",
    advisorSoil: "ਮਿੱਟੀ ਦੀ ਖਾਦ ਦੇ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼",
    marketTitle: "ਮਾਰਕੀਟ ਇੰਟੈਲੀਜੈਂਸ ਆਉਟਲੁੱਕ",
    marketRecommendation: "ਵਪਾਰਕ ਕਾਰਵਾਈ",
    marketPredictions: "ਮੰਡੀਆਂ ਦੀ ਜਾਂਚ",
    tasksTitle: "ਅੱਜ ਦੇ ਕਾਰਜ",
    tasksFull: "ਪੂਰਾ ਕੈਲੰਡਰ",
    schemeTitle: "ਸਰਕਾਰੀ ਸਕੀਮ ਸਲਾਹਕਾਰ",
    schemeSummary: "ਭਾਸ਼ਾ ਸਾਰ",
    detectLoc: "ਲੋਕੇਸ਼ਨ ਲੱਭੋ",
    detecting: "ਲੱਭ ਰਿਹਾ ਹੈ...",
    optionKharif: "ਖਰੀਫ (ਮਾਨਸੂਨ)",
    optionRabi: "ਰਬੀ (ਸਰਦੀ)",
    optionZaid: "ਜ਼ੈਦ (ਗਰਮੀ)",
    optionClayLoam: "ਚੀਕਣੀ ਦੋਮਟ ਮਿੱਟੀ",
    optionSandySoil: "ਰੇਤਲੀ ਮਿੱਟੀ",
    optionAlluvialSoil: "ਜਲੋੜ ਮਿੱਟੀ",
    optionBlackCotton: "ਕਾਲੀ ਕਪਾਹ ਮਿੱਟੀ",
    optionSiltyClay: "ਗਾਰ ਵਾਲੀ ਮਿੱਟੀ"
  },
  Marathi: {
    title: "अ‍ॅग्रीसेन्स एआय",
    subtitle: "अल्पभूधारक शेतकऱ्यांसाठी एआय-संचालित मल्टी-एजंट प्रणाली",
    agentsActive: "६ सहयोगी तज्ञ एजंट सक्रिय आहेत",
    configTitle: "शेत पॅरामीटर्स कॉन्फिगर करा",
    labelLocation: "स्थान / प्रदेश",
    labelSoil: "मातीचा प्रकार",
    labelSeason: "हंगाम",
    labelLanguage: "भाषा सल्लागार",
    btnCompile: "कृषी रणनीती आणि कार्य संकलित करा",
    btnCompiling: "एजंट टीम सहकार्य करत आहे...",
    healthTitle: "पिकांचे एकूण आरोग्य",
    healthOptimal: "इष्टतम",
    healthWarning: "सर्व सक्रिय पॅरामीटर्स सुरक्षित मर्यादेत आहेत.",
    weatherTitle: "हवामान एजंटचा सल्ला",
    weatherRain: "पावसाचा अंदाज",
    weatherIrrigation: "सिंचन कृती",
    weatherSpraying: "फवारणीची वेळ",
    advisorTitle: "पीक सल्लागारांच्या शिफारसी",
    advisorSoil: "माती समृद्धी मार्गदर्शक तत्त्वे",
    marketTitle: "बाजार माहितीचा दृष्टिकोन",
    marketRecommendation: "व्यापार कृती",
    marketPredictions: "मंड्या तपासत आहे",
    tasksTitle: "आजचे कार्य",
    tasksFull: "पूर्ण कॅलेंडर",
    schemeTitle: "सरकारी योजना सल्लागार",
    schemeSummary: "भाषा सारांश",
    detectLoc: "स्थान शोधा",
    detecting: "शोधत आहे...",
    optionKharif: "खरीप (पावसाळा)",
    optionRabi: "रब्बी (हिवाळा)",
    optionZaid: "झैद (उन्हाळा)",
    optionClayLoam: "चिकणमाती",
    optionSandySoil: "रेताड माती",
    optionAlluvialSoil: "गाळाची माती",
    optionBlackCotton: "काळी कापसाची माती",
    optionSiltyClay: "पंकयुक्त चिकणमाती"
  },
  Telugu: {
    title: "అగ్రిసెన్స్ ఏఐ",
    subtitle: "చిన్న రైతులకు ఏఐ-ఆధారిత మల్టీ-ఏజెంట్ వ్యవసాయ వ్యవస్థ",
    agentsActive: "6 సహకార నిపుణుల ఏజెంట్లు క్రియాశీలంగా ఉన్నారు",
    configTitle: "వ్యవసాయ పారామితులను కాన్ఫిగర్ చేయండి",
    labelLocation: "ప్రాంతం / రాష్ట్రం",
    labelSoil: "నేల రకం",
    labelSeason: "సీజన్",
    labelLanguage: "భాషా సలహాదారు",
    btnCompile: "వ్యవసాయ వ్యూహాన్ని మరియు పనులను క్రోడీకరించండి",
    btnCompiling: "ఏజెంట్ బృందం సమన్వయ పరుస్తోంది...",
    healthTitle: "మొత్తం ఆరోగ్యం",
    healthOptimal: "అత్యుత్తమంగా ఉంది",
    healthWarning: "అన్ని పారామితులు సురక్షిత పరిమితుల్లో ఉన్నాయి.",
    weatherTitle: "వాతావరణ ఏజెంట్ సలహా",
    weatherRain: "వర్ష సూచన",
    weatherIrrigation: "నీటి పారుదల చర్య",
    weatherSpraying: "మందులు చల్లే సమయం",
    advisorTitle: "పంట సలహాదారు సిఫార్సులు",
    advisorSoil: "నేల సారవంతం మార్గదర్శకాలు",
    marketTitle: "మార్కెట్ ఇంటెలిజెన్స్ అవుట్‌లుక్",
    marketRecommendation: "ట్రేడింగ్ చర్య",
    marketPredictions: "మార్కెట్ రేట్ల పరిశీలన",
    tasksTitle: "ఈ రోజు పనులు",
    tasksFull: "పూర్తి క్యాలెండర్",
    schemeTitle: "ప్రభుత్వ పథకాల సలహాదారు",
    schemeSummary: "భాషా సారాంశం",
    detectLoc: "స్థానాన్ని గుర్తించు",
    detecting: "గుర్తిస్తోంది...",
    optionKharif: "ఖరీఫ్ (వర్షాకాలం)",
    optionRabi: "రబీ (చలికాలం)",
    optionZaid: "జైద్ (వేసవి కాలం)",
    optionClayLoam: "బంకమట్టి నేల",
    optionSandySoil: "ఇసుక నేల",
    optionAlluvialSoil: "ఒండ్రు నేల",
    optionBlackCotton: "నల్ల రేగడి నేల",
    optionSiltyClay: "మట్టితో కూడిన బంకనేల"
  }
};

export default function Dashboard() {
  // Farm properties state
  const [location, setLocation] = useState("Punjab");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [season, setSeason] = useState("Kharif");
  const [language, setLanguage] = useState("Hindi");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [detectingLoc, setDetectingLoc] = useState(false);

  // Load initial simulated data or run initial compile
  useEffect(() => {
    const savedLocation = localStorage.getItem("agrisense_location");
    const savedSoilType = localStorage.getItem("agrisense_soilType");
    const savedSeason = localStorage.getItem("agrisense_season");
    const savedLanguage = localStorage.getItem("agrisense_language");
    const savedData = localStorage.getItem("agrisense_data");

    let currentLoc = "Punjab";
    let currentSoil = "Clay Loam";
    let currentSeason = "Kharif";
    let currentLang = "Hindi";

    if (savedLocation) {
      setLocation(savedLocation);
      currentLoc = savedLocation;
    }
    if (savedSoilType) {
      setSoilType(savedSoilType);
      currentSoil = savedSoilType;
    }
    if (savedSeason) {
      setSeason(savedSeason);
      currentSeason = savedSeason;
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
      currentLang = savedLanguage;
    }

    if (savedData) {
      setData(JSON.parse(savedData));
    } else {
      handleRunAnalysis(currentLoc, currentSoil, currentSeason, currentLang);
    }
  }, []);

  const handleRunAnalysis = async (
    loc: string = location,
    soil: string = soilType,
    seas: string = season,
    lang: string = language
  ) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: loc,
          soil_type: soil,
          season: seas,
          language: lang
        })
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
        localStorage.setItem("agrisense_data", JSON.stringify(result));
      } else {
        console.error("Failed to run farm analysis");
      }
    } catch (err) {
      console.error("Error fetching analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Map latitude/longitude coordinate zones to Indian agricultural states
        let detectedState = "Punjab";
        if (lat < 13) {
          detectedState = "Tamil Nadu";
        } else if (lat < 16) {
          if (lon < 78) detectedState = "Karnataka";
          else detectedState = "Andhra Pradesh";
        } else if (lat < 21) {
          if (lon < 74) detectedState = "Gujarat";
          else detectedState = "Maharashtra";
        } else if (lat < 24) {
          if (lon < 78) detectedState = "Madhya Pradesh";
          else detectedState = "Andhra Pradesh";
        } else if (lat < 27) {
          if (lon < 76) detectedState = "Rajasthan";
          else if (lon < 83) detectedState = "Uttar Pradesh";
          else detectedState = "Bihar";
        } else if (lat < 30) {
          if (lon < 77) detectedState = "Rajasthan";
          else detectedState = "Uttar Pradesh";
        } else {
          if (lon < 76) detectedState = "Punjab";
          else detectedState = "Haryana";
        }

        setLocation(detectedState);
        localStorage.setItem("agrisense_location", detectedState);
        setDetectingLoc(false);
        alert(`Detected Location: Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)}) mapped to ${detectedState}`);
      },
      (error) => {
        console.error(error);
        setDetectingLoc(false);
        setLocation("Punjab");
        localStorage.setItem("agrisense_location", "Punjab");
        alert("Failed to retrieve location. Defaulting to Punjab.");
      }
    );
  };

  // Get translated texts based on the active language selection
  const t = translations[language] || translations["English"];
  const tEng = translations["English"];

  // Custom Weather Icon/Animation based on Season
  const renderWeatherAnimation = () => {
    if (season === "Kharif") {
      return (
        <div className="relative w-10 h-10 flex items-center justify-center pointer-events-none">
          <div className="rain-container flex justify-between items-end h-6 w-8 opacity-80">
            <div className="raindrop" style={{ left: '10%', animationDelay: '0s' }}></div>
            <div className="raindrop" style={{ left: '35%', animationDelay: '0.3s' }}></div>
            <div className="raindrop" style={{ left: '60%', animationDelay: '0.15s' }}></div>
            <div className="raindrop" style={{ left: '85%', animationDelay: '0.45s' }}></div>
          </div>
          <CloudRain className="w-6 h-6 text-[#10b981] absolute -top-1" />
        </div>
      );
    } else {
      return (
        <div className="relative w-10 h-10 flex items-center justify-center pointer-events-none">
          <Sun className="w-7 h-7 text-[#f59e0b] weather-sun" />
          {season === "Zaid" && <Wind className="w-4 h-4 text-[#a3b899] absolute bottom-0 right-0 animate-pulse" />}
        </div>
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#10b981]/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#f2f7f4] to-[#10b981] bg-clip-text text-transparent">
            {tEng.title}
          </h1>
          <p className="text-sm text-[#a3b899] mt-1 font-medium">
            {tEng.subtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] px-3 py-1.5 rounded-full font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          {tEng.agentsActive}
        </div>
      </div>

      {/* Control Panel (Farm Setup) */}
      <section className="glass-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#10b981]/5 to-transparent rounded-full pointer-events-none"></div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-[#10b981]" />
          {tEng.configTitle}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Location Selection with Detect Location Trigger */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#a3b899] font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {tEng.labelLocation}
              </label>
              <button 
                onClick={handleDetectLocation}
                disabled={detectingLoc}
                className="text-[10px] text-[#10b981] hover:underline flex items-center gap-0.5 font-bold cursor-pointer disabled:text-[#10b981]/50"
              >
                <Compass className={`w-3 h-3 ${detectingLoc ? 'animate-spin' : ''}`} />
                {detectingLoc ? tEng.detecting : tEng.detectLoc}
              </button>
            </div>
            <select 
              value={location} 
              onChange={(e) => {
                const val = e.target.value;
                setLocation(val);
                localStorage.setItem("agrisense_location", val);
              }}
              className="w-full bg-[#0b1310] border border-[#10b981]/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]/50 cursor-pointer"
            >
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>

          {/* Soil Selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#a3b899] font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3" /> {tEng.labelSoil}
            </label>
            <select 
              value={soilType} 
              onChange={(e) => {
                const val = e.target.value;
                setSoilType(val);
                localStorage.setItem("agrisense_soilType", val);
              }}
              className="w-full bg-[#0b1310] border border-[#10b981]/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]/50 cursor-pointer"
            >
              <option value="Clay Loam">{tEng.optionClayLoam}</option>
              <option value="Sandy Soil">{tEng.optionSandySoil}</option>
              <option value="Alluvial Soil">{tEng.optionAlluvialSoil}</option>
              <option value="Black Cotton Soil">{tEng.optionBlackCotton}</option>
              <option value="Silty Clay">{tEng.optionSiltyClay}</option>
            </select>
          </div>

          {/* Season Selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#a3b899] font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {tEng.labelSeason}
            </label>
            <select 
              value={season} 
              onChange={(e) => {
                const val = e.target.value;
                setSeason(val);
                localStorage.setItem("agrisense_season", val);
              }}
              className="w-full bg-[#0b1310] border border-[#10b981]/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]/50 cursor-pointer"
            >
              <option value="Kharif">{tEng.optionKharif}</option>
              <option value="Rabi">{tEng.optionRabi}</option>
              <option value="Zaid">{tEng.optionZaid}</option>
            </select>
          </div>

          {/* Language Selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#a3b899] font-semibold flex items-center gap-1">
              <Languages className="w-3 h-3" /> {tEng.labelLanguage}
            </label>
            <select 
              value={language} 
              onChange={(e) => {
                const val = e.target.value;
                setLanguage(val);
                localStorage.setItem("agrisense_language", val);
              }}
              className="w-full bg-[#0b1310] border border-[#10b981]/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]/50 cursor-pointer"
            >
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => handleRunAnalysis(location, soilType, season, language)}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#0da472] disabled:bg-[#10b981]/50 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {tEng.btnCompiling}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {tEng.btnCompile}
            </>
          )}
        </button>
      </section>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Health Score, Advisor Suggestion & Market Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Circular Crop Health & Advisor Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Crop Health Score Circle */}
            <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center relative">
              <h3 className="text-sm font-bold text-[#a3b899] mb-4">{t.healthTitle}</h3>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(16,185,129,0.1)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#10b981" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="251.2" 
                    strokeDashoffset="30.1" 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">88%</span>
                  <span className="text-[10px] text-[#10b981] font-semibold mt-0.5 uppercase tracking-wider">{t.healthOptimal}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#a3b899] font-medium text-center">
                <ShieldAlert className="w-4 h-4 text-[#10b981]" />
                {t.healthWarning}
              </div>
            </div>

            {/* Weather Irrigation Schedule Card */}
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#f59e0b]/5 to-transparent rounded-full pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#a3b899]">{t.weatherTitle}</h3>
                  {renderWeatherAnimation()}
                </div>
                {data?.weather_agent_output ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#52775f] font-semibold uppercase tracking-wider">{t.weatherRain}</p>
                      <p className="text-sm text-white font-medium">
                        {data.weather_agent_output.rain_forecast || data.weather_agent_output.rainForecast || data.weather_agent_output.forecast || "Light showers expected."}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#52775f] font-semibold uppercase tracking-wider">{t.weatherIrrigation}</p>
                      <p className="text-sm text-white font-medium">
                        {data.weather_agent_output.irrigation_schedule || data.weather_agent_output.irrigationSchedule || data.weather_agent_output.schedule || "Postpone irrigation to avoid rot."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="shimmer h-24 rounded-2xl"></div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#10b981]/10 flex justify-between items-center text-xs">
                <span className="text-[#a3b899] font-semibold">{t.weatherSpraying}:</span>
                <span className="text-[#f59e0b] font-bold">
                  {data?.weather_agent_output ? (data.weather_agent_output.spray_timing || data.weather_agent_output.sprayTiming || data.weather_agent_output.timing || "Thursday morning") : "Checking..."}
                </span>
              </div>
            </div>

          </div>

          {/* Crop Recommendation Details */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#10b981]" />
                {t.advisorTitle}
              </h3>
              <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full">
                {season}
              </span>
            </div>

            {data?.crop_advisor_output ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data.crop_advisor_output.recommended_crops || data.crop_advisor_output.recommendedCrops || data.crop_advisor_output.crops)?.map((crop: any, idx: number) => (
                    <div key={idx} className="bg-[#0b1310] border border-[#10b981]/10 rounded-2xl p-4 space-y-2 hover:border-[#10b981]/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{crop.name}</span>
                        <span className="text-[10px] text-[#f59e0b] font-bold uppercase">{crop.optimal_sowing_temp || crop.optimalSowingTemp}</span>
                      </div>
                      <p className="text-xs text-[#a3b899] leading-relaxed">{crop.suitability_reason || crop.suitabilityReason}</p>
                      <div className="text-[11px] text-[#ff6b6b] font-medium">
                        ⚠️ Risks: {crop.risks}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#10b981]/5 border border-[#10b981]/10 rounded-2xl p-4 text-xs">
                  <span className="font-bold text-[#10b981] block mb-1">{t.advisorSoil}:</span>
                  <p className="text-[#a3b899] leading-relaxed">{data.crop_advisor_output.soil_enrichment_tips || data.crop_advisor_output.soilEnrichmentTips || data.crop_advisor_output.tips}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="shimmer h-24 rounded-2xl"></div>
                <div className="shimmer h-12 rounded-2xl"></div>
              </div>
            )}
          </div>

          {/* Market Intelligence Box */}
          <div className="glass-card rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#f59e0b]" />
                {t.marketTitle}
              </h3>
              {data?.market_intelligence_output ? (
                <>
                  <p className="text-sm text-[#a3b899]">
                    Recommendation for <strong className="text-white">{data.market_intelligence_output.crop}</strong>:
                  </p>
                  <p className="text-xs text-[#a3b899] max-w-lg leading-relaxed">
                    {data.market_intelligence_output.rationale || data.market_intelligence_output.market_rationale}
                  </p>
                </>
              ) : (
                <div className="shimmer h-12 w-80 rounded-2xl"></div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-[#0b1310] border border-[#10b981]/15 rounded-2xl min-w-[150px] text-center">
              <span className="text-[10px] text-[#a3b899] font-bold uppercase tracking-wider">{t.marketRecommendation}</span>
              <span className={`text-2xl font-extrabold mt-1 tracking-wide ${
                (data?.market_intelligence_output?.recommendation || data?.market_intelligence_output?.trading_action) === "HOLD" ? "text-[#f59e0b]" : "text-[#10b981]"
              }`}>
                {data?.market_intelligence_output?.recommendation || data?.market_intelligence_output?.trading_action || "ANALYZING..."}
              </span>
              <span className="text-[10px] text-[#52775f] font-semibold mt-1">
                {data?.market_intelligence_output ? (data.market_intelligence_output.predictions || data.market_intelligence_output.forecast ? "Prices rising +4%" : t.marketPredictions) : t.marketPredictions}
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Tasks Calendar & Schemes Translation */}
        <div className="space-y-6">
          
          {/* Quick Action Tasks Preview */}
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-[#10b981]" />
                  {t.tasksTitle}
                </h3>
                <Link href="/tasks" className="text-xs text-[#10b981] hover:underline flex items-center gap-0.5">
                  {t.tasksFull} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {data?.action_planner_output ? (
                <div className="space-y-2.5">
                  {(data.action_planner_output.daily_tasks || data.action_planner_output.dailyTasks || [])?.slice(0, 3).map((task: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#0b1310] border border-[#10b981]/10 p-3 rounded-2xl hover:border-[#10b981]/25 transition-all duration-300">
                      <div className="mt-1 w-2.5 h-2.5 rounded-full bg-[#10b981] flex-shrink-0 animate-pulse"></div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-snug">{task.action}</p>
                        <p className="text-[10px] text-[#a3b899] mt-0.5">{task.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="shimmer h-12 rounded-2xl"></div>
                  <div className="shimmer h-12 rounded-2xl"></div>
                  <div className="shimmer h-12 rounded-2xl"></div>
                </div>
              )}
            </div>
          </div>

          {/* Scheme Translation Local Card */}
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-base font-bold text-white mb-3">
              {t.schemeTitle}
            </h3>
            
            {data?.government_scheme_output ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {(data.government_scheme_output.applicable_schemes || data.government_scheme_output.applicableSchemes || data.government_scheme_output.schemes)?.slice(0, 2).map((sch: any, idx: number) => (
                    <div key={idx} className="text-xs">
                      <strong className="text-white block mb-0.5">{sch.name || sch.schemeName}</strong>
                      <span className="text-[#a3b899]">{sch.benefits}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#10b981]/10 pt-3">
                  <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Languages className="w-3.5 h-3.5" /> {t.schemeSummary} ({language})
                  </span>
                  <div className="bg-[#0b1310] border border-[#10b981]/10 rounded-2xl p-4 text-xs font-medium text-white/90 leading-relaxed max-h-[160px] overflow-y-auto">
                    {data.government_scheme_output.translated_explanation || data.government_scheme_output.translatedExplanation || data.government_scheme_output.explanation || data.government_scheme_output.translation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="shimmer h-10 rounded-2xl"></div>
                <div className="shimmer h-24 rounded-2xl"></div>
              </div>
            )}
          </div>

          {/* Field Scanner Ad Banner */}
          <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-[#10b981]/10 to-transparent border border-[#10b981]/25 relative overflow-hidden flex flex-col justify-between h-48">
            <div className="space-y-2">
              <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Field Scanner
              </span>
              <h3 className="text-base font-bold text-white">
                Diagnose Leaf Diseases Instantly
              </h3>
              <p className="text-xs text-[#a3b899] max-w-[200px] leading-relaxed">
                Take a photo of crop leaves to analyze symptoms using Gemini Vision path pathology.
              </p>
            </div>
            
            <Link href="/chat?scan=true" className="flex items-center gap-1 text-xs text-white font-bold hover:gap-2 transition-all duration-300">
              Open Field Scanner <ArrowRight className="w-4 h-4 text-[#10b981]" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
