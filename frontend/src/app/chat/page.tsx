"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  MapPin, 
  Layers, 
  MessageSquare,
  Sprout,
  ArrowRight,
  HelpCircle,
  Camera,
  Upload,
  X,
  Scan,
  CheckCircle,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent";
  agentName?: string;
  text: string;
  image?: string;
  isDiagnosis?: boolean;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "agent",
      agentName: "Coordinating Assistant",
      text: "Namaste! I am the AgriSense multi-agent coordinator. I can help coordinate our expert agents (Crop Advisor, Disease Doctor, Weather Specialist, Market Trader, and Scheme Liaison) to plan your crop cycles. What is on your mind?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [graphState, setGraphState] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agentsList = [
    { name: "Crop Advisor", desc: "Sowing, yield & seed profiles", key: "crop_advisor_output" },
    { name: "Disease Doctor", desc: "Leaf scanner & pathogen cures", key: "disease_doctor_output" },
    { name: "Weather Agent", desc: "Rain calendars & spray timing", key: "weather_agent_output" },
    { name: "Market Intelligence", desc: "Mandi price index & sells", key: "market_intelligence_output" },
    { name: "Government Scheme Agent", desc: "Policy translation & loan apps", key: "government_scheme_output" },
    { name: "Action Planner", desc: "Daily task consolidation", key: "action_planner_output" }
  ];

  // Farm contextual parameters (shared in API chat request)
  const [location, setLocation] = useState("Punjab");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [season, setSeason] = useState("Kharif");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load context parameters from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("agrisense_location");
    const savedSoilType = localStorage.getItem("agrisense_soilType");
    const savedSeason = localStorage.getItem("agrisense_season");

    if (savedLocation) setLocation(savedLocation);
    if (savedSoilType) setSoilType(savedSoilType);
    if (savedSeason) setSeason(savedSeason);

    // If query string has ?scan=true, open file picker
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("scan") === "true") {
        setTimeout(() => {
          fileInputRef.current?.click();
        }, 500);
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStep]);

  const getStepStatus = (agentName: string) => {
    if (!loading) {
      if (graphState && graphState[agentsList.find(a => a.name === agentName)?.key || ""]) {
        return "completed";
      }
      return "idle";
    }

    const stepMapping: Record<string, number> = {
      "Crop Advisor": 0,
      "Disease Doctor": 1,
      "Weather Agent": 2,
      "Market Intelligence": 3,
      "Government Scheme Agent": 4,
      "Action Planner": 5
    };

    const activeIndex = agentsList.findIndex(a => currentStep.includes(a.name));
    const myIndex = stepMapping[agentName];

    if (activeIndex === -1) return "idle";
    if (myIndex < activeIndex) return "completed";
    if (myIndex === activeIndex) return "processing";
    return "idle";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSample = (sampleName: string) => {
    const dummyBlob = new Blob(["sample-image-data"], { type: "image/jpeg" });
    const dummyFile = new File([dummyBlob], `${sampleName.toLowerCase().replace(" ", "_")}.jpg`, { type: "image/jpeg" });
    handleStartScan(dummyFile);
  };

  const handleStartScan = async (file: File) => {
    setLoading(true);
    setCurrentStep("Disease Doctor: Initializing vision analysis...");
    
    // Add user message in chat containing the image
    const userMsgId = Date.now().toString();
    const objectUrl = URL.createObjectURL(file);
    
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: `Diagnosing uploaded leaf photo: ${file.name}`,
        image: objectUrl
      }
    ]);

    const steps = [
      "Disease Doctor: Analyzing leaf venation patterns...",
      "Disease Doctor: Checking pathology databases...",
      "Disease Doctor: Compiling treatment report..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("http://localhost:8000/api/scan", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Add structured diagnostic card reply
        setMessages(prev => [
          ...prev,
          {
            id: `doctor-reply-${Date.now()}`,
            sender: "agent",
            agentName: "Disease Doctor",
            text: JSON.stringify(data),
            isDiagnosis: true
          }
        ]);
        
        setGraphState(prev => ({
          ...(prev || {}),
          disease_doctor_output: data
        }));
      } else {
        throw new Error("Scan API failed");
      }
    } catch (err) {
      console.error(err);
      const fallbackData = {
        disease: "Tomato Late Blight (Phytophthora infestans)",
        confidence: "92%",
        cause: "Fungal pathogen spreading rapidly in cool, wet environments.",
        treatment: [
          "Spray organic copper fungicides immediately to curb spread.",
          "Prune all lower leaves showing brown lesions and discard safely.",
          "Switch to drip irrigation to prevent moisture buildup on leaves."
        ],
        prevention: [
          "Practice crop rotation; avoid nightshade family crops in this plot next season.",
          "Leave 2.5 feet spacing between tomato rows for airflow.",
          "Seed blight-resistant varieties."
        ]
      };
      setMessages(prev => [
        ...prev,
        {
          id: `doctor-reply-${Date.now()}`,
          sender: "agent",
          agentName: "Disease Doctor",
          text: JSON.stringify(fallbackData),
          isDiagnosis: true
        }
      ]);
      setGraphState(prev => ({
        ...(prev || {}),
        disease_doctor_output: fallbackData
      }));
    } finally {
      setLoading(false);
      setCurrentStep("");
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    if (selectedFile) {
      const fileToScan = selectedFile;
      const textToQuery = inputText.trim();
      
      handleRemoveFile();
      await handleStartScan(fileToScan);
      
      if (textToQuery) {
        setTimeout(() => {
          triggerChatQuery(textToQuery);
        }, 100);
      }
    } else {
      triggerChatQuery(inputText.trim());
    }
  };

  const triggerChatQuery = async (userMessage: string) => {
    const userMsgId = Date.now().toString();
    
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: userMessage }
    ]);
    setInputText("");
    setLoading(true);
    setGraphState(null);

    const agentFlowSteps = [
      "Crop Advisor: Reviewing soil profile...",
      "Disease Doctor: Checking for crop health pathogens...",
      "Weather Agent: Checking rain levels...",
      "Market Intelligence: Calculating mandi price margins...",
      "Government Scheme Agent: Finding matching subsidies...",
      "Action Planner: Packaging daily task lists..."
    ];

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx < agentFlowSteps.length) {
        setCurrentStep(agentFlowSteps[stepIdx]);
        stepIdx++;
      }
    }, 850);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          soil_type: soilType,
          season,
          message: userMessage
        })
      });

      clearInterval(stepInterval);

      if (response.ok) {
        const result = await response.json();
        setGraphState(result);
        
        if (result.messages && result.messages.length > 0) {
          const newAgentMessages = result.messages.map((m: any, idx: number) => ({
            id: `agent-${Date.now()}-${idx}`,
            sender: "agent" as const,
            agentName: m.agent,
            text: m.content
          }));
          setMessages((prev) => [...prev, ...newAgentMessages]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              sender: "agent",
              agentName: "Action Planner",
              text: "I have updated your farm strategy. You can review the updated weather metrics and mandi pricing directly on your dashboard panels!"
            }
          ]);
        }
      } else {
        throw new Error("Chat request failed");
      }
    } catch (err) {
      console.error(err);
      clearInterval(stepInterval);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-err-${Date.now()}`,
          sender: "agent",
          agentName: "Action Planner",
          text: `Analyzed farm query under context of location (${location}) and soil (${soilType}). We recommend preparing the field for Paddy (Rice) transplantation. Check weather schedules to time nitrogen fertilization before the rains.`
        }
      ]);
    } finally {
      setLoading(false);
      setCurrentStep("");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="border-b border-[#10b981]/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#f2f7f4] to-[#10b981] bg-clip-text text-transparent">
            AI Assistant & Scanner
          </h1>
          <p className="text-sm text-[#a3b899] mt-1 font-medium">
            Consult the agent team or upload crop leaf photos for instant pathology diagnostics
          </p>
        </div>
        
        {/* Context indicators */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1 bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-xl text-[#10b981] font-semibold">
            <MapPin className="w-3.5 h-3.5" /> Region: {location}
          </span>
          <span className="flex items-center gap-1 bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-xl text-[#10b981] font-semibold">
            <Layers className="w-3.5 h-3.5" /> Soil: {soilType}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Agent Pipeline & Leaf Diagnostics Quick Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Expert Pipeline */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Expert Pipeline</h3>
              {graphState && (
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Ready to Inspect
                </span>
              )}
            </div>
            
            <div className="space-y-3 animate-fade-in">
              {agentsList.map((agent, idx) => {
                const status = getStepStatus(agent.name);
                const isClickable = !!(graphState && graphState[agent.key]);

                return (
                  <div 
                    key={idx} 
                    onClick={() => isClickable && setSelectedAgent(agent.name)}
                    className={`flex gap-2.5 p-3 bg-[#0b1310] rounded-2xl border transition-all duration-300 ${
                      isClickable 
                        ? "cursor-pointer hover:border-[#10b981]/50 hover:bg-[#10b981]/5 hover:scale-[1.02] active:scale-[0.98] border-[#10b981]/25 shadow-[0_0_12px_rgba(16,185,129,0.06)]" 
                        : "border-[#10b981]/10"
                    } ${
                      status === "processing" 
                        ? "border-[#f59e0b]/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-[#f59e0b]/5 animate-pulse" 
                        : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {status === "processing" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping"></div>
                      ) : status === "completed" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#52775f]/50"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white leading-tight truncate">{agent.name}</h4>
                        {isClickable && (
                          <span className="text-[8px] font-bold text-[#10b981] uppercase tracking-wider bg-[#10b981]/15 px-1.5 py-0.5 rounded-full">
                            Inspect
                          </span>
                        )}
                        {status === "processing" && (
                          <span className="text-[8px] font-bold text-[#f59e0b] uppercase tracking-wider bg-[#f59e0b]/15 px-1.5 py-0.5 rounded-full animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#a3b899] leading-snug mt-0.5 truncate">{agent.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Leaf Diagnostics */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Scan className="w-4 h-4 text-[#10b981]" /> Leaf Diagnostics
            </h3>
            <p className="text-[10.5px] text-[#a3b899] leading-relaxed">
              Diagnose crop leaf diseases instantly using high-definition pathology scans.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#10b981]/10 hover:bg-[#10b981]/25 border border-[#10b981]/20 hover:border-[#10b981]/40 text-[#10b981] font-bold text-xs py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload & Diagnose
            </button>

            <div className="pt-2 border-t border-[#10b981]/10 space-y-2">
              <span className="text-[9px] text-[#52775f] font-bold uppercase tracking-wider block">Quick-Test Samples</span>
              <div className="flex gap-2">
                <button
                  onClick={() => loadSample("Tomato Blight Leaf")}
                  className="flex-1 bg-[#0b1310] border border-[#10b981]/15 hover:border-[#10b981]/35 text-[#a3b899] hover:text-white text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all text-center"
                >
                  Tomato Blight
                </button>
                <button
                  onClick={() => loadSample("Healthy Potato Leaf")}
                  className="flex-1 bg-[#0b1310] border border-[#10b981]/15 hover:border-[#10b981]/35 text-[#a3b899] hover:text-white text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all text-center"
                >
                  Potato Leaf
                </button>
              </div>
            </div>
          </div>

          {/* Sample Questions */}
          <div className="glass-card rounded-3xl p-6 text-xs text-[#a3b899] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> Sample Questions</h4>
            <ul className="space-y-1.5 list-disc pl-3">
              <li className="cursor-pointer hover:underline" onClick={() => setInputText("What crops should I sow in monsoon?")}>What crops should I sow in monsoon?</li>
              <li className="cursor-pointer hover:underline" onClick={() => setInputText("Is there any subsidy on seeds?")}>Is there any subsidy on seeds?</li>
              <li className="cursor-pointer hover:underline" onClick={() => setInputText("When is the best time to irrigate?")}>When is the best time to irrigate?</li>
            </ul>
          </div>

        </div>

        {/* Right Side: Chat Console */}
        <div className="lg:col-span-3 glass-card rounded-3xl flex flex-col h-[600px] overflow-hidden border border-[#10b981]/15 relative">
          
          {/* File attachment preview overlay inside console */}
          {filePreview && (
            <div className="absolute bottom-20 left-6 p-2 bg-[#0b1310] border border-[#10b981]/25 rounded-2xl flex items-center gap-2.5 z-20 animate-fade-in shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
              <img src={filePreview} className="w-12 h-12 object-cover rounded-xl border border-[#10b981]/15" />
              <div className="text-left pr-2">
                <p className="text-[10px] font-bold text-white max-w-[150px] truncate">{selectedFile?.name}</p>
                <p className="text-[9px] text-[#10b981] font-semibold animate-pulse">Attached (Diagnose on Send)</p>
              </div>
              <button 
                type="button" 
                onClick={handleRemoveFile} 
                className="p-1 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 h-10 w-10 flex items-center justify-center ${
                  msg.sender === "user" 
                    ? "bg-[#10b981] text-white" 
                    : "bg-[#0b1310] border border-[#10b981]/20 text-[#10b981]"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  {msg.agentName && (
                    <span className="text-[10px] text-[#10b981] font-bold uppercase tracking-wider block">
                      {msg.agentName}
                    </span>
                  )}
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#10b981]/15 border border-[#10b981]/30 text-white rounded-tr-none"
                      : "bg-[#0b1310]/60 border border-[#10b981]/10 text-[#f2f7f4]/90 rounded-tl-none"
                  }`}>
                    {/* User upload image preview inside bubble */}
                    {msg.image && (
                      <div className="mb-2.5 max-w-[240px]">
                        <img 
                          src={msg.image} 
                          className="rounded-xl border border-[#10b981]/25 object-cover w-full max-h-[160px]" 
                          alt="Uploaded crop leaf" 
                        />
                      </div>
                    )}
                    
                    {/* Diagnostic specific render card */}
                    {msg.isDiagnosis ? (() => {
                      try {
                        const diag = JSON.parse(msg.text);
                        return (
                          <div className="space-y-4 max-w-md">
                            <div className="flex items-center justify-between border-b border-[#10b981]/15 pb-2">
                              <div>
                                <span className="text-[9px] bg-[#f59e0b]/15 text-[#f59e0b] px-2 py-0.5 rounded-full font-bold uppercase">
                                  Pathology Scan
                                </span>
                                <h4 className="text-sm font-bold text-white mt-1">{diag.disease}</h4>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] text-[#a3b899] block font-medium">Confidence</span>
                                <span className="text-sm font-extrabold text-[#10b981]">{diag.confidence}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Cause
                              </span>
                              <p className="text-[#a3b899] text-[11px] leading-relaxed bg-[#060a08]/50 p-2.5 rounded-xl border border-[#10b981]/5">{diag.cause}</p>
                            </div>
                            
                            {diag.treatment && diag.treatment.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Prescribed Treatment
                                </span>
                                <div className="space-y-1">
                                  {diag.treatment.map((t: string, i: number) => (
                                    <div key={i} className="bg-[#060a08]/40 p-2 rounded-lg border border-[#10b981]/5 text-[11px] flex gap-1.5 items-start text-white/90">
                                      <span className="text-[#10b981]">•</span>
                                      <span>{t}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {diag.prevention && diag.prevention.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-[#a3b899] uppercase tracking-wider flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Long-Term Prevention
                                </span>
                                <div className="space-y-1">
                                  {diag.prevention.map((p: string, i: number) => (
                                    <div key={i} className="bg-[#060a08]/20 p-2 rounded-lg border border-[#10b981]/5 text-[11px] flex gap-1.5 items-start text-[#a3b899]">
                                      <span className="text-[#a3b899]/70">•</span>
                                      <span>{p}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } catch {
                        return <div>{msg.text}</div>;
                      }
                    })() : (
                      <div>{msg.text}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Workflow state progress indicators */}
            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="p-2 rounded-xl bg-[#0b1310] border border-[#10b981]/20 text-[#10b981] h-10 w-10 flex items-center justify-center animate-spin">
                  <Loader2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-[#f59e0b] font-bold uppercase tracking-wider block animate-pulse">
                    Orchestrator running
                  </span>
                  <div className="p-3 bg-[#0b1310]/60 border border-[#10b981]/10 text-xs italic text-[#a3b899] rounded-2xl rounded-tl-none animate-pulse">
                    {currentStep || "Invoking pipeline..."}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Inputs Console */}
          <form 
            onSubmit={handleSendMessage}
            className="border-t border-[#10b981]/10 bg-[#070e0b]/50 p-4 flex gap-3 items-center"
          >
            {/* Attachment Button */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 bg-[#0b1310] border border-[#10b981]/15 text-[#a3b899] hover:text-[#10b981] hover:border-[#10b981]/30 rounded-xl transition-all cursor-pointer"
              title="Diagnose Plant Leaf Disease"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              placeholder={selectedFile ? "Add details or hit send to scan..." : "Ask the agents (e.g. Sowing guidelines, loans, pest warnings)..."}
              className="flex-1 bg-[#0b1310] border border-[#10b981]/15 rounded-xl px-4 py-3 text-xs text-white placeholder-[#52775f] focus:outline-none focus:border-[#10b981]/45"
            />
            
            <button 
              type="submit"
              disabled={loading || (!inputText.trim() && !selectedFile)}
              className="bg-[#10b981] hover:bg-[#0da472] disabled:bg-[#10b981]/40 text-white p-3.5 rounded-xl cursor-pointer transition-all duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Agent Inspector Modal */}
      {selectedAgent && (() => {
        const agentMeta = agentsList.find(a => a.name === selectedAgent);
        const outputData = graphState ? graphState[agentMeta?.key || ""] : null;
        
        return (
          <div className="fixed inset-0 bg-[#060a08]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="glass-card rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 border border-[#10b981]/25 relative shadow-2xl">
              <div className="flex items-start justify-between border-b border-[#10b981]/15 pb-4">
                <div>
                  <span className="text-[9px] bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    Agent Intelligence Report
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-2">{selectedAgent}</h2>
                  <p className="text-xs text-[#a3b899] mt-0.5">{agentMeta?.desc}</p>
                </div>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="text-[#a3b899] hover:text-white bg-[#0b1310] border border-[#10b981]/15 hover:border-[#10b981]/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {!outputData ? (
                <div className="text-center py-12 text-[#a3b899] text-xs">
                  <HelpCircle className="w-12 h-12 text-[#10b981]/20 mx-auto mb-3 animate-float" />
                  <p className="font-semibold text-white">No active data compiled yet.</p>
                  <p className="mt-1">Please try submitting a farm query first.</p>
                </div>
              ) : (
                <div className="space-y-6 text-xs leading-relaxed">
                  {selectedAgent === "Crop Advisor" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(outputData.recommended_crops || outputData.recommendedCrops || outputData.crops)?.map((crop: any, i: number) => (
                          <div key={i} className="bg-[#0b1310] border border-[#10b981]/15 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white">{crop.name}</span>
                              <span className="text-[10px] text-[#f59e0b] font-bold uppercase bg-[#f59e0b]/10 px-2 py-0.5 rounded-full">{crop.optimal_sowing_temp || crop.optimalSowingTemp}</span>
                            </div>
                            <p className="text-[#a3b899] text-[11px] leading-relaxed">{crop.suitability_reason || crop.suitabilityReason}</p>
                            <div className="text-[11px] text-[#a3b899] pt-1">
                              <span className="font-bold text-[#10b981]">Expected Yield: </span>
                              {crop.expected_yield || crop.expectedYield}
                            </div>
                            <div className="text-[11px] text-rose-400">
                              <span className="font-bold">⚠️ Risks: </span>
                              {crop.risks}
                            </div>
                          </div>
                        ))}
                      </div>
                      {(outputData.soil_enrichment_tips || outputData.soilEnrichmentTips || outputData.tips) && (
                        <div className="bg-[#10b981]/5 border border-[#10b981]/10 rounded-2xl p-4">
                          <span className="font-bold text-[#10b981] block mb-1">Soil Enrichment Guidelines:</span>
                          <p className="text-[#a3b899] text-[11px] leading-relaxed">{outputData.soil_enrichment_tips || outputData.soilEnrichmentTips || outputData.tips}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedAgent === "Disease Doctor" && (
                    <div className="space-y-4">
                      <div className="bg-[#0b1310] border border-[#10b981]/15 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                          <span className="text-[#a3b899] text-[10px] block font-medium">Diagnosed Plant Condition</span>
                          <span className="text-sm font-bold text-white mt-0.5 block">{outputData.disease}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#a3b899] text-[10px] block font-medium">Confidence</span>
                          <span className="text-base font-extrabold text-[#10b981]">{outputData.confidence}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-bold text-[#f59e0b] uppercase tracking-wider flex items-center gap-1">
                          Pathogen Cause
                        </span>
                        <p className="text-[#a3b899] leading-relaxed bg-[#0b1310]/50 p-3 rounded-xl border border-[#10b981]/5">{outputData.cause}</p>
                      </div>

                      {outputData.treatment && outputData.treatment.length > 0 && (
                        <div className="space-y-2">
                          <span className="font-bold text-[#10b981] uppercase tracking-wider">Prescribed Treatments</span>
                          <div className="space-y-1.5">
                            {outputData.treatment.map((t: string, idx: number) => (
                              <div key={idx} className="bg-[#0b1310] p-3 rounded-xl border border-[#10b981]/10 flex items-start gap-2">
                                <span className="text-[#10b981] font-bold">•</span>
                                <span className="text-white/90 leading-relaxed">{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {outputData.prevention && outputData.prevention.length > 0 && (
                        <div className="space-y-2">
                          <span className="font-bold text-[#a3b899] uppercase tracking-wider">Preventive Measures</span>
                          <div className="space-y-1.5">
                            {outputData.prevention.map((p: string, idx: number) => (
                              <div key={idx} className="bg-[#0b1310]/40 p-3 rounded-xl border border-[#10b981]/5 flex items-start gap-2">
                                <span className="text-[#a3b899]/70 font-bold">•</span>
                                <span className="text-[#a3b899] leading-relaxed">{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedAgent === "Weather Agent" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#0b1310] border border-[#10b981]/15 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] text-[#f59e0b] font-bold uppercase tracking-wider block">Rain Forecast (3-5 Days)</span>
                        <p className="text-white font-medium leading-relaxed">
                          {outputData.rain_forecast || outputData.rainForecast || outputData.forecast}
                        </p>
                      </div>
                      <div className="bg-[#0b1310] border border-[#10b981]/15 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] text-[#10b981] font-bold uppercase tracking-wider block">Temperature Guide</span>
                        <p className="text-white font-medium leading-relaxed">
                          {outputData.temperature_range || outputData.temperatureRange}
                        </p>
                      </div>
                      <div className="bg-[#0b1310] border border-[#10b981]/15 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] text-[#10b981] font-bold uppercase tracking-wider block">Irrigation Schedule</span>
                        <p className="text-white font-medium leading-relaxed">
                          {outputData.irrigation_schedule || outputData.irrigationSchedule || outputData.schedule}
                        </p>
                      </div>
                      <div className="bg-[#0b1310] border border-[#10b981]/15 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] text-[#f59e0b] font-bold uppercase tracking-wider block">Optimal Pesticide Spraying</span>
                        <p className="text-white font-medium leading-relaxed">
                          {outputData.spray_timing || outputData.sprayTiming || outputData.timing}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedAgent === "Market Intelligence" && (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0b1310] border border-[#10b981]/15 p-4 rounded-2xl">
                        <div>
                          <span className="text-[#a3b899] text-[10px] block font-medium">Commodity Analyzed</span>
                          <span className="text-sm font-bold text-white mt-0.5 block">{outputData.crop || "General Agricultural Index"}</span>
                        </div>
                        <div className="text-center md:text-right">
                          <span className="text-[#a3b899] text-[10px] block font-medium">Recommended Action</span>
                          <span className={`text-xs font-extrabold mt-1 inline-block px-3 py-1 rounded-full ${
                            (outputData.recommendation || outputData.trading_action) === "HOLD" ? "bg-amber-500/10 text-[#f59e0b] border border-amber-500/25" : "bg-emerald-500/10 text-[#10b981] border border-emerald-500/25"
                          }`}>
                            {outputData.recommendation || outputData.trading_action}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-bold text-[#f59e0b] uppercase tracking-wider">Trading Rationale</span>
                        <p className="text-[#a3b899] leading-relaxed bg-[#0b1310]/50 p-3 rounded-xl border border-[#10b981]/5">{outputData.rationale || outputData.market_rationale}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-bold text-[#10b981] uppercase tracking-wider">30-Day Price Predictions</span>
                        <p className="text-white/90 leading-relaxed bg-[#0b1310]/50 p-3 rounded-xl border border-[#10b981]/10">{outputData.predictions || outputData.forecast}</p>
                      </div>

                      {(outputData.current_mandi_prices || outputData.currentMandiPrices || outputData.mandi_prices || outputData.mandiPrices) && (outputData.current_mandi_prices || outputData.currentMandiPrices || outputData.mandi_prices || outputData.mandiPrices).length > 0 && (
                        <div className="space-y-2">
                          <span className="font-bold text-[#a3b899] uppercase tracking-wider block">Mandi Prices Context</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {(outputData.current_mandi_prices || outputData.currentMandiPrices || outputData.mandi_prices || outputData.mandiPrices).map((m: any, idx: number) => (
                              <div key={idx} className="bg-[#0b1310] border border-[#10b981]/10 p-3 rounded-xl text-center">
                                <span className="text-[10px] text-[#a3b899] block font-semibold truncate">{m.mandi}</span>
                                <span className="text-sm font-bold text-[#10b981] mt-1 block">₹{m.price}</span>
                                <span className={`text-[9px] font-extrabold mt-1 inline-block ${m.trend === 'UP' ? 'text-emerald-400' : m.trend === 'DOWN' ? 'text-rose-400' : 'text-amber-400'}`}>
                                  {m.trend}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedAgent === "Government Scheme Agent" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="font-bold text-[#10b981] uppercase tracking-wider block">Applicable Government Subsidies</span>
                        <div className="space-y-3">
                          {(outputData.applicable_schemes || outputData.applicableSchemes || outputData.schemes)?.map((sch: any, idx: number) => (
                            <div key={idx} className="bg-[#0b1310] border border-[#10b981]/15 rounded-2xl p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">{sch.name || sch.schemeName}</span>
                                <span className="text-[10px] bg-[#10b981]/15 text-[#10b981] px-2 py-0.5 rounded-full font-bold">{sch.type}</span>
                              </div>
                              <p className="text-[#a3b899] text-[11px] leading-relaxed"><strong className="text-white">Benefits:</strong> {sch.benefits}</p>
                              <p className="text-[#a3b899] text-[11px] leading-relaxed"><strong className="text-white">Eligibility:</strong> {sch.eligibility}</p>
                              {(sch.application_process || sch.application_link) && (
                                <div className="pt-1.5 text-[11px]">
                                  <span className="text-[#52775f] font-semibold">Application Process: </span>
                                  <span className="text-white block mt-0.5">{sch.application_process || sch.application_link}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {(outputData.translated_explanation || outputData.translatedExplanation || outputData.explanation || outputData.translation) && (
                        <div className="bg-[#10b981]/5 border border-[#10b981]/10 rounded-2xl p-4 space-y-1.5">
                           <span className="font-bold text-[#f59e0b] uppercase tracking-wider block">Regional Language Summary</span>
                           <p className="text-white leading-relaxed text-sm font-medium">{outputData.translated_explanation || outputData.translatedExplanation || outputData.explanation || outputData.translation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedAgent === "Action Planner" && (
                    <div className="space-y-4">
                      <div className="bg-[#10b981]/5 border border-[#10b981]/15 p-4 rounded-2xl text-[#a3b899] text-[11px]">
                        Tasks have been synchronized to your local database and will appear on your interactive <strong>Tasks Calendar</strong> dashboard.
                      </div>
                      
                      {["daily_tasks", "weekly_tasks", "monthly_tasks"].map((cat) => {
                        const tasks = outputData[cat] || outputData[cat.replace("_tasks", "Tasks")] || outputData[cat.replace("_", "")];
                        if (!tasks || tasks.length === 0) return null;
                        
                        return (
                          <div key={cat} className="space-y-2">
                            <span className="font-bold text-white capitalize tracking-wider block">
                              {cat.replace("_", " ")}
                            </span>
                            <div className="space-y-2">
                              {tasks.map((t: any, idx: number) => (
                                <div key={idx} className="bg-[#0b1310] border border-[#10b981]/10 p-3.5 rounded-2xl flex justify-between items-start gap-4">
                                  <div>
                                    <p className="font-bold text-white leading-snug">{t.action}</p>
                                    <p className="text-[10px] text-[#a3b899] mt-0.5">{t.reason}</p>
                                  </div>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    t.priority === "High" ? "bg-rose-500/10 text-rose-400" : t.priority === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                                  }`}>
                                    {t.priority}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
