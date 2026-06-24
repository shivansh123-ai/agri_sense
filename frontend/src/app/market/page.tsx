"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  DollarSign, 
  MapPin, 
  Calendar,
  Sparkles,
  Info,
  BadgeAlert
} from "lucide-react";

interface MandiRecord {
  id: number;
  crop_name: string;
  mandi_name: string;
  state: string;
  price_per_quintal: number;
  trend: "UP" | "DOWN" | "STABLE";
  last_updated: string;
}

export default function MarketTrends() {
  const [selectedCrop, setSelectedCrop] = useState("Paddy (Rice)");
  const [mandiRates, setMandiRates] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch prices
  useEffect(() => {
    fetchRates();
  }, [selectedCrop]);

  const fetchRates = async () => {
    setLoading(true);
    try {
      // Filter endpoint query
      const cropQuery = selectedCrop.split(" ")[0]; // e.g. "Paddy" or "Wheat"
      const res = await fetch(`http://localhost:8000/api/market?crop=${cropQuery}`);
      if (res.ok) {
        const data = await res.json();
        setMandiRates(data);
      }
    } catch (err) {
      console.error("Failed to load mandi rates:", err);
    } finally {
      setLoading(false);
    }
  };

  // Historical mock data points for plotting stock-style graphs
  const historicalData: Record<string, { month: string; price: number }[]> = {
    "Paddy (Rice)": [
      { month: "Jan", price: 2050 },
      { month: "Feb", price: 2100 },
      { month: "Mar", price: 2080 },
      { month: "Apr", price: 2150 },
      { month: "May", price: 2200 },
      { month: "Jun", price: 2250 },
    ],
    "Wheat": [
      { month: "Jan", price: 2200 },
      { month: "Feb", price: 2280 },
      { month: "Mar", price: 2320 },
      { month: "Apr", price: 2380 },
      { month: "May", price: 2400 },
      { month: "Jun", price: 2425 },
    ],
    "Mustard": [
      { month: "Jan", price: 5900 },
      { month: "Feb", price: 5800 },
      { month: "Mar", price: 5700 },
      { month: "Apr", price: 5620 },
      { month: "May", price: 5600 },
      { month: "Jun", price: 5580 },
    ],
    "Cotton": [
      { month: "Jan", price: 6800 },
      { month: "Feb", price: 6950 },
      { month: "Mar", price: 7100 },
      { month: "Apr", price: 7050 },
      { month: "May", price: 7150 },
      { month: "Jun", price: 7250 },
    ]
  };

  const activeHistory = historicalData[selectedCrop] || historicalData["Paddy (Rice)"];

  // Custom SVG Coordinates Calculator for plotting Stock chart
  const minPrice = Math.min(...activeHistory.map(d => d.price)) * 0.98;
  const maxPrice = Math.max(...activeHistory.map(d => d.price)) * 1.02;
  const chartHeight = 160;
  const chartWidth = 500;

  const points = activeHistory.map((d, index) => {
    const x = (index / (activeHistory.length - 1)) * chartWidth;
    const y = chartHeight - ((d.price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, index) => {
    return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Gradient area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#10b981]/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#f2f7f4] to-[#10b981] bg-clip-text text-transparent">
            Market Intelligence
          </h1>
          <p className="text-sm text-[#a3b899] mt-1 font-medium">
            Real-time APMC Mandi rates and predictive trading metrics
          </p>
        </div>

        <div className="flex gap-2">
          {Object.keys(historicalData).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                selectedCrop === c 
                  ? "bg-[#10b981] border-[#10b981] text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]" 
                  : "bg-[#0b1310] border-[#10b981]/15 text-[#a3b899] hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#10b981]/5 to-transparent rounded-full pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs text-[#a3b899] font-bold uppercase tracking-wider block">Price Index Trend (6 Months)</span>
                <span className="text-xl font-extrabold text-white mt-0.5 block">{selectedCrop} — APMC Average</span>
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                selectedCrop === "Mustard" 
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" 
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              }`}>
                {selectedCrop === "Mustard" ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {selectedCrop === "Mustard" ? "-2.1%" : "+8.4% YTD"}
              </span>
            </div>

            {/* Custom stock path SVG */}
            <div className="w-full h-44 mt-4 relative">
              <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid guide lines */}
                <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(16, 185, 129, 0.05)" strokeDasharray="3 3" />
                <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(16, 185, 129, 0.05)" strokeDasharray="3 3" />
                <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(16, 185, 129, 0.05)" strokeDasharray="3 3" />
                
                {/* Gradient area */}
                <path d={areaD} fill="url(#chartGlow)" />
                
                {/* Main line */}
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />

                {/* Interactive dots */}
                {points.map((p, idx) => (
                  <g key={idx} className="group/dot cursor-pointer">
                    <circle cx={p.x} cy={p.y} r="4" fill="#10b981" />
                    <circle cx={p.x} cy={p.y} r="10" fill="#10b981" fillOpacity="0" className="hover:fill-opacity-15 transition-all" />
                  </g>
                ))}
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between border-t border-[#10b981]/10 pt-3 text-[10px] text-[#a3b899] font-bold">
              {activeHistory.map((d, idx) => (
                <span key={idx}>{d.month} (₹{d.price})</span>
              ))}
            </div>

          </div>

          {/* Mandi Rates List Table */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#10b981]" />
              Active Local APMC Mandi Rates ({selectedCrop})
            </h3>

            {loading ? (
              <div className="space-y-2.5">
                <div className="shimmer h-10 rounded-xl"></div>
                <div className="shimmer h-10 rounded-xl"></div>
                <div className="shimmer h-10 rounded-xl"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#10b981]/15 text-[#a3b899] font-bold">
                      <th className="pb-3 font-semibold">Mandi Name</th>
                      <th className="pb-3 font-semibold">State</th>
                      <th className="pb-3 font-semibold">Price per Quintal</th>
                      <th className="pb-3 font-semibold">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#10b981]/5 text-white/90">
                    {mandiRates.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#10b981]/5 transition-all duration-200">
                        <td className="py-3.5 font-bold flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                          {rec.mandi_name}
                        </td>
                        <td className="py-3.5 text-[#a3b899]">{rec.state}</td>
                        <td className="py-3.5 font-extrabold text-[#10b981]">₹{rec.price_per_quintal}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                            rec.trend === "UP" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : rec.trend === "DOWN" 
                                ? "bg-rose-500/10 text-rose-400" 
                                : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {rec.trend === "UP" ? <TrendingUp className="w-3 h-3" /> : rec.trend === "DOWN" ? <TrendingDown className="w-3 h-3" /> : "STABLE"}
                            {rec.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Advisors Sell/Hold Verdict */}
        <div className="space-y-6">
          {/* Sell/Hold Gauge Card */}
          <div className="glass-card rounded-3xl p-6 text-center space-y-6 border border-[#10b981]/25 relative overflow-hidden">
            <h3 className="text-xs font-bold text-[#a3b899] uppercase tracking-wider">Agent Verdict</h3>
            
            <div className="flex flex-col items-center">
              <div className={`p-4 rounded-3xl inline-flex ${
                selectedCrop === "Mustard" ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
              }`}>
                {selectedCrop === "Mustard" ? (
                  <span className="text-4xl font-extrabold tracking-wider">SELL</span>
                ) : (
                  <span className="text-4xl font-extrabold tracking-wider">HOLD</span>
                )}
              </div>
              <p className="text-xs text-[#a3b899] mt-4 max-w-xs leading-relaxed">
                {selectedCrop === "Mustard" ? (
                  "Mustard supplies are hitting peak crop arrivals in Rajasthan APMCs, leading to storage overloads. Selling now limits further risk."
                ) : (
                  "Low domestic buffer stocks and strong government purchase windows are pushing rates higher. Hold inventory for a higher return in 15-20 days."
                )}
              </p>
            </div>

            <div className="border-t border-[#10b981]/10 pt-4 flex justify-between items-center text-xs">
              <span className="text-[#a3b899] font-medium">Estimated price peak:</span>
              <span className="text-[#10b981] font-bold">
                {selectedCrop === "Mustard" ? "Now (Peak Rates)" : "Mid-July"}
              </span>
            </div>
          </div>

          {/* Mandi Insights Alert Box */}
          <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-[#f59e0b]/10 to-transparent border border-[#f59e0b]/20 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <BadgeAlert className="w-4 h-4 text-[#f59e0b]" /> Mandi Dispatch Alert
            </h4>
            <p className="text-xs text-[#a3b899] leading-relaxed">
              National shipping channels report a 4% increase in wheat exports, indicating a highly positive domestic window for north-Indian farmers. Consider holding storage stacks until next APMC auctions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
