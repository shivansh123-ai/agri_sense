# 🌱 AgriSense AI
### Collaborative Multi-Agent Operating System for Smallholder Farms

AgriSense AI is an intelligent farm orchestration platform that empowers smallholder farmers by bringing together a collaborative team of AI agents. Powered by **Google Gemini 2.5 Flash** and orchestrated via **LangGraph**, these agents work together to compile crop recommendations, diagnose leaf diseases, coordinate irrigation schedules with weather forecasts, analyze local APMC mandi price indices, and translate complex government policies.

---

## 🛠️ System Architecture

AgriSense AI leverages a state-sharing multi-agent graph where specialized agents compile insights sequentially, passing structured JSON payloads to down-line specialists. The workflow culminates in the **Action Planner**, which consolidates the team's recommendations into an interactive checklist.

```
       +---------------------------------------------+
       |   User Context (Region, Soil, Season)       |
       +--------------------+------------------------+
                            |
                            v
               +------------+------------+
               |   1. Crop Advisor       | <--- Recommends crops & soil tips
               +------------+------------+
                            |
                            v
               +------------+------------+
               |   2. Disease Doctor     | <--- Identifies leaf pathogen reports
               +------------+------------+
                            |
                            v
               +------------+------------+
               |   3. Weather Specialist | <--- Schedules irrigation & spray timing
               +------------+------------+
                            |
                            v
               +------------+------------+
               |   4. Market Intelligence| <--- Fetches APMC rates & SELL/HOLD verdict
               +------------+------------+
                            |
                            v
               +------------+------------+
               |   5. Govt Scheme Liaison| <--- Checks subsidies & translates policies
               +------------+------------+
                            |
                            v
               +------------+------------+
               |   6. Action Planner     | <--- Compiles todo items & syncs to DB
               +------------+------------+
                            |
                            v
       +--------------------+------------------------+
       |   Unified Farm Calendar / Interactive Task DB|
       +---------------------------------------------+
```

---

## ✨ Features

- **Dynamic Collaborative Chat**: Enter a single query and watch the agents collaborate in real-time. Click on any active agent node to inspect its specific JSON intelligence reports.
- **Crop Advisor**: Uses regional history and soil profile inputs to recommend optimal crops, expected yields, and soil enrichment guidelines.
- **Field Scanner (Gemini Vision)**: Analyze images of diseased crop leaves in real-time to detect pathogens, treatment steps, and preventive measures.
- **Weather Specialist**: Suggests safe pesticide spraying windows and irrigation plans based on local wind speeds and moisture forecasts.
- **Market Intelligence**: An interactive dashboard showing APMC Mandi rates and historical stock-like charts to recommend whether to Sell or Hold inventory.
- **Govt Scheme Advisor**: Scans government schemes (like PMFBY, KCC, and PM-KISAN) matching your context, translating complex applications into regional languages (Hindi, Telugu, Punjabi, Marathi).
- **Interactive Planner**: A synchronized local checklist of daily, weekly, and monthly tasks automatically updated by the agent team.

---

## 🚀 Setup & Installation

Follow these steps to run AgriSense AI locally:

### 1. Prerequisites
- **Python**: v3.10 or higher
- **Node.js**: v18 or higher
- **Gemini API Key**: Retrieve yours from Google AI Studio.

---

### 2. Backend Installation (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # macOS/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Gemini Developer Key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_key
   ```
5. Run the FastAPI dev server:
   ```bash
   uvicorn backend.main:app --reload
   ```
   The backend will start on **`http://localhost:8000`**.

---

### 3. Frontend Installation (Next.js & Tailwind 4)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js dev server:
   ```bash
   npm run dev
   ```
   The frontend will launch on **`http://localhost:3000`**.

---

## 🛡️ License

This project was built for the **Kaggle 5-Day Intensive Vibe Coding Event with Google**.
Licensed under the MIT License.
