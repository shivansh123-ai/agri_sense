import os
import sqlite3
import json
from datetime import datetime, timedelta

DB_FILE = "agrisense.db"

def get_db_connection():
    """Establish connection to local SQLite database."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database schemas and seed initial data."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Mandi Prices Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mandi_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_name TEXT NOT NULL,
        mandi_name TEXT NOT NULL,
        state TEXT NOT NULL,
        price_per_quintal INTEGER NOT NULL,
        trend TEXT NOT NULL, -- 'UP', 'DOWN', 'STABLE'
        last_updated TEXT NOT NULL
    )
    """)
    
    # 2. Government Schemes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS government_schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        scheme_type TEXT NOT NULL, -- 'Subsidy', 'Loan', 'Insurance'
        eligibility TEXT NOT NULL,
        benefits TEXT NOT NULL,
        application_process TEXT NOT NULL,
        original_language TEXT DEFAULT 'English'
    )
    """)
    
    # 3. Tasks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_name TEXT NOT NULL,
        category TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
        due_date TEXT NOT NULL,
        completed INTEGER DEFAULT 0
    )
    """)
    
    # Seed Mandi Prices if empty
    cursor.execute("SELECT COUNT(*) FROM mandi_prices")
    if cursor.fetchone()[0] == 0:
        mandi_data = [
            ("Wheat", "Khanna Mandi", "Punjab", 2425, "UP"),
            ("Wheat", "Karnal Mandi", "Haryana", 2410, "UP"),
            ("Paddy (Rice)", "Hapur Mandi", "Uttar Pradesh", 2200, "STABLE"),
            ("Paddy (Rice)", "Amritsar Mandi", "Punjab", 2250, "UP"),
            ("Mustard", "Alwar Mandi", "Rajasthan", 5650, "DOWN"),
            ("Mustard", "Kota Mandi", "Rajasthan", 5580, "DOWN"),
            ("Cotton", "Rajkot Mandi", "Gujarat", 7100, "UP"),
            ("Cotton", "Bathinda Mandi", "Punjab", 7250, "UP"),
            ("Potato", "Agra Mandi", "Uttar Pradesh", 1450, "STABLE"),
            ("Onion", "Lasalgaon Mandi", "Maharashtra", 1850, "DOWN"),
        ]
        today_str = datetime.now().strftime("%Y-%m-%d")
        for crop, mandi, state, price, trend in mandi_data:
            cursor.execute(
                "INSERT INTO mandi_prices (crop_name, mandi_name, state, price_per_quintal, trend, last_updated) VALUES (?, ?, ?, ?, ?, ?)",
                (crop, mandi, state, price, trend, today_str)
            )
            
    # Seed Government Schemes if empty
    cursor.execute("SELECT COUNT(*) FROM government_schemes")
    if cursor.fetchone()[0] == 0:
        schemes_data = [
            (
                "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                "Subsidy",
                "All small and marginal farmers owning cultivable land up to 2 hectares.",
                "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into bank accounts.",
                "Register online via PM-KISAN portal or visit nearby Common Service Centres (CSCs)."
            ),
            (
                "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
                "Insurance",
                "All farmers growing notified crops in notified areas during Kharif, Rabi, or Commercial seasons.",
                "Comprehensive crop insurance covering yield losses due to natural calamities, pests, and diseases. Premium is capped at 1.5% for Rabi, 2.0% for Kharif, and 5.0% for commercial crops.",
                "Apply through banks, authorized insurance agents, or the National Crop Insurance Portal (NCIP) within specified deadlines."
            ),
            (
                "KCC (Kisan Credit Card Scheme)",
                "Loan",
                "All farmers, owner-cultivators, tenant farmers, and sharecroppers.",
                "Short-term credit for crop cultivation, post-harvest expenses, and working capital for allied activities at an effective interest rate of 4% (after prompt repayment interest subvention).",
                "Apply at any commercial bank, cooperative bank, or Regional Rural Bank (RRB) with land ownership records."
            ),
            (
                "PM-KMY (Pradhan Mantri Kisan Maan-Dhan Yojana)",
                "Pension",
                "Small and marginal farmers aged 18 to 40 years.",
                "A monthly pension of ₹3,000 after attaining the age of 60, upon contribution of ₹55 to ₹200 monthly depending on entry age.",
                "Apply online or via Common Service Centres (CSCs)."
            ),
            (
                "Sub-Mission on Agricultural Mechanization (SMAM)",
                "Subsidy",
                "All categories of farmers, with priority given to women, SC/ST, and small/marginal farmers.",
                "Subsidies of 40% to 50% for purchasing agricultural machinery such as tractors, rotavators, power tillers, and custom hiring centers.",
                "Register and apply online on the SMAM portal of the Ministry of Agriculture."
            )
        ]
        for name, stype, elig, benefits, process in schemes_data:
            cursor.execute(
                "INSERT INTO government_schemes (name, scheme_type, eligibility, benefits, application_process) VALUES (?, ?, ?, ?, ?)",
                (name, stype, elig, benefits, process)
            )
            
    conn.commit()
    conn.close()
    print("Database initialized and seeded successfully.")

# Initialize the database immediately on import
init_db()

# DB Query Helper Operations
def fetch_mandi_prices(crop_name=None):
    """Retrieve mandi prices, optionally filtered by crop."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if crop_name:
        cursor.execute("SELECT * FROM mandi_prices WHERE crop_name LIKE ?", (f"%{crop_name}%",))
    else:
        cursor.execute("SELECT * FROM mandi_prices")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def fetch_government_schemes(search_term=None):
    """Retrieve government schemes, optionally matching search terms in name or eligibility."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if search_term:
        cursor.execute(
            "SELECT * FROM government_schemes WHERE name LIKE ? OR eligibility LIKE ? OR benefits LIKE ?",
            (f"%{search_term}%", f"%{search_term}%", f"%{search_term}%")
        )
    else:
        cursor.execute("SELECT * FROM government_schemes")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_farm_task(name, category, due_date=None):
    """Insert a new task into the planner list."""
    if not due_date:
        due_date = datetime.now().strftime("%Y-%m-%d")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (task_name, category, due_date) VALUES (?, ?, ?)",
        (name, category, due_date)
    )
    conn.commit()
    conn.close()

def get_all_tasks():
    """Retrieve all current tasks."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks ORDER BY due_date ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def toggle_task_status(task_id):
    """Toggle a task's completed flag."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT completed FROM tasks WHERE id = ?", (task_id,))
    row = cursor.fetchone()
    if row:
        new_status = 1 if row["completed"] == 0 else 0
        cursor.execute("UPDATE tasks SET completed = ? WHERE id = ?", (new_status, task_id))
        conn.commit()
    conn.close()

def clear_all_tasks():
    """Remove all tasks from the table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks")
    conn.commit()
    conn.close()
