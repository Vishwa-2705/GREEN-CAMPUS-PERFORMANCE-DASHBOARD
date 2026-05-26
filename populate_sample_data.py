#!/usr/bin/env python3
"""
Sample script to populate MongoDB with test data
Run this to quickly fill the database with realistic data
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:10000/api"
JWT_TOKEN = None  # Will be populated after login

def get_auth_token(email="user@greencampus.com", password="user123"):
    """Login and get JWT token"""
    global JWT_TOKEN
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    if response.status_code == 200:
        JWT_TOKEN = response.json()["access_token"]
        print(f"✓ Authenticated as {email}")
        return JWT_TOKEN
    else:
        print(f"✗ Authentication failed: {response.text}")
        return None

def get_headers():
    """Get headers with JWT token"""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {JWT_TOKEN}"
    }

def save_daily_data(date_obj, energy, water, waste, carbon):
    """Save a day's data"""
    date_str = date_obj.strftime("%Y-%m-%d")
    payload = {
        "date": date_str,
        "energy": energy,
        "water": water,
        "waste": waste,
        "carbon": carbon,
        "notes": f"Auto-generated test data for {date_str}"
    }
    
    response = requests.post(
        f"{BASE_URL}/data/daily",
        json=payload,
        headers=get_headers()
    )
    
    if response.status_code == 201:
        print(f"✓ Saved daily data for {date_str}")
        return True
    else:
        print(f"✗ Failed to save {date_str}: {response.text}")
        return False

def save_weekly_data(week_num, year, energy, energy_prev, water, water_prev, waste, waste_prev, carbon, carbon_prev):
    """Save a week's data"""
    payload = {
        "week": f"Week {week_num}",
        "year": year,
        "week_number": week_num,
        "energy": energy,
        "energy_previous": energy_prev,
        "water": water,
        "water_previous": water_prev,
        "waste": waste,
        "waste_previous": waste_prev,
        "carbon": carbon,
        "carbon_previous": carbon_prev,
        "notes": f"Auto-generated test data for Week {week_num}"
    }
    
    response = requests.post(
        f"{BASE_URL}/data/weekly",
        json=payload,
        headers=get_headers()
    )
    
    if response.status_code == 201:
        print(f"✓ Saved weekly data for Week {week_num}")
        return True
    else:
        print(f"✗ Failed to save Week {week_num}: {response.text}")
        return False

def save_monthly_data(month_num, year, energy, water, waste, carbon):
    """Save a month's data"""
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    payload = {
        "month": f"{month_names[month_num-1]} {year}",
        "year": year,
        "month_number": month_num,
        "energy": energy,
        "water": water,
        "waste": waste,
        "carbon": carbon,
        "notes": f"Auto-generated test data for {month_names[month_num-1]}"
    }
    
    response = requests.post(
        f"{BASE_URL}/data/monthly",
        json=payload,
        headers=get_headers()
    )
    
    if response.status_code == 201:
        print(f"✓ Saved monthly data for {month_names[month_num-1]} {year}")
        return True
    else:
        print(f"✗ Failed to save {month_names[month_num-1]}: {response.text}")
        return False

def populate_last_30_days():
    """Populate daily data for last 30 days"""
    print("\n📊 Populating last 30 days of daily data...")
    
    base_energy = 120
    base_water = 200
    base_waste = 80
    base_carbon = 50
    
    today = datetime.now()
    for i in range(30, 0, -1):
        date = today - timedelta(days=i)
        # Add some variation to make data realistic
        energy = base_energy + (i % 15 - 7)
        water = base_water + (i % 20 - 10)
        waste = base_waste + (i % 10 - 5)
        carbon = base_carbon + (i % 8 - 4)
        
        save_daily_data(date, energy, water, waste, carbon)

def populate_weeks():
    """Populate weekly data for current year (first 12 weeks)"""
    print("\n📅 Populating weekly data...")
    
    weeks_data = [
        (1, 120, 110, 200, 190, 80, 75, 50, 55),
        (2, 125, 120, 205, 200, 82, 80, 52, 50),
        (3, 118, 125, 195, 205, 78, 82, 48, 52),
        (4, 130, 118, 215, 195, 85, 78, 55, 48),
        (5, 122, 130, 202, 215, 80, 85, 51, 55),
        (6, 128, 122, 210, 202, 84, 80, 54, 51),
        (7, 115, 128, 190, 210, 75, 84, 49, 54),
        (8, 135, 115, 220, 190, 88, 75, 57, 49),
        (9, 127, 135, 208, 220, 82, 88, 53, 57),
        (10, 132, 127, 217, 208, 86, 82, 56, 53),
        (11, 119, 132, 198, 217, 77, 86, 50, 56),
        (12, 138, 119, 228, 198, 90, 77, 59, 50),
    ]
    
    year = datetime.now().year
    for week_num, energy, energy_prev, water, water_prev, waste, waste_prev, carbon, carbon_prev in weeks_data:
        save_weekly_data(
            week_num, year,
            energy, energy_prev,
            water, water_prev,
            waste, waste_prev,
            carbon, carbon_prev
        )

def populate_months():
    """Populate monthly data for current year"""
    print("\n📈 Populating monthly data...")
    
    months_data = [
        (1, 3600, 6300, 2400, 1500),  # January
        (2, 3400, 6100, 2300, 1450),  # February
        (3, 3800, 6600, 2500, 1600),  # March
        (4, 3500, 6200, 2350, 1450),  # April
    ]
    
    year = datetime.now().year
    for month_num, energy, water, waste, carbon in months_data:
        save_monthly_data(month_num, year, energy, water, waste, carbon)

def get_summary():
    """Get and display summary statistics"""
    print("\n📊 Fetching summary statistics...")
    
    response = requests.get(f"{BASE_URL}/data/summary")
    
    if response.status_code == 200:
        stats = response.json()
        print("\n" + "="*50)
        print("SUMMARY STATISTICS")
        print("="*50)
        print(f"Total Records: {stats['total_records']}")
        print(f"\nENERGY:")
        print(f"  Total: {stats['energy_total']}")
        print(f"  Average/day: {stats['energy_avg']}")
        print(f"\nWATER:")
        print(f"  Total: {stats['water_total']}")
        print(f"  Average/day: {stats['water_avg']}")
        print(f"\nWASTE:")
        print(f"  Total: {stats['waste_total']}")
        print(f"  Average/day: {stats['waste_avg']}")
        print(f"\nCARBON:")
        print(f"  Total: {stats['carbon_total']}")
        print(f"  Average/day: {stats['carbon_avg']}")
        print("="*50 + "\n")
    else:
        print(f"✗ Failed to get summary: {response.text}")

def main():
    """Main function"""
    print("🌱 Green Campus Dashboard - Sample Data Population Script\n")
    
    # Authenticate
    if not get_auth_token():
        print("✗ Failed to authenticate. Please ensure the backend is running.")
        return
    
    # Populate data
    populate_last_30_days()
    populate_weeks()
    populate_months()
    
    # Show summary
    get_summary()
    
    print("✅ Sample data population complete!")
    print("\nYou can now:")
    print("  - View daily data: GET /api/data/daily")
    print("  - View weekly data: GET /api/data/weekly")
    print("  - View monthly data: GET /api/data/monthly")
    print("  - Get statistics: GET /api/data/summary")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
