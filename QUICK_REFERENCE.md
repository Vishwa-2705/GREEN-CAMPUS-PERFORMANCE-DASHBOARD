# Quick Reference - Data Storage API

## Summary

Your Green Campus Dashboard now stores all metrics (Energy, Water, Waste, Carbon) in MongoDB with three types of data:
- **Daily**: Individual day values
- **Weekly**: Week totals with previous week comparison
- **Monthly**: Month totals for historical analysis

## Quick API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/data/daily` | Save daily metrics | ✓ |
| GET | `/api/data/daily` | Get daily data (with date range) | ✗ |
| POST | `/api/data/weekly` | Save weekly data | ✓ |
| GET | `/api/data/weekly` | Get weekly data | ✗ |
| POST | `/api/data/monthly` | Save monthly data | ✓ |
| GET | `/api/data/monthly` | Get monthly data | ✗ |
| GET | `/api/data/summary` | Get statistics (avg, total) | ✗ |
| DELETE | `/api/data/cleanup` | Delete old daily data | ✓ Admin |

✓ = Requires JWT token | ✗ = Public access

---

## Common Tasks

### 1. Save Today's Metrics
```bash
curl -X POST http://localhost:10000/api/data/daily \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-04-15",
    "energy": 125,
    "water": 210,
    "waste": 82,
    "carbon": 51
  }'
```

### 2. Save This Week's Data with Comparison
```bash
curl -X POST http://localhost:10000/api/data/weekly \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "week": "Week 15",
    "year": 2024,
    "week_number": 15,
    "energy": 875,
    "energy_previous": 850,
    "water": 1450,
    "water_previous": 1400,
    "waste": 580,
    "waste_previous": 600,
    "carbon": 360,
    "carbon_previous": 350
  }'
```

### 3. Save This Month's Total
```bash
curl -X POST http://localhost:10000/api/data/monthly \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "month": "April 2024",
    "year": 2024,
    "month_number": 4,
    "energy": 3500,
    "water": 6200,
    "waste": 2350,
    "carbon": 1450
  }'
```

### 4. View Last 30 Days
```bash
curl "http://localhost:10000/api/data/daily?start_date=2024-03-16&end_date=2024-04-15"
```

### 5. View This Year's Weekly Data
```bash
curl "http://localhost:10000/api/data/weekly?year=2024"
```

### 6. Get All-Time Statistics
```bash
curl http://localhost:10000/api/data/summary
```

### 7. Delete Data Older Than 90 Days (Admin)
```bash
curl -X DELETE "http://localhost:10000/api/data/cleanup?days=90" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Data Structure Examples

### Daily Record
```json
{
  "date": "2024-04-15",
  "energy": 125,
  "water": 210,
  "waste": 82,
  "carbon": 51,
  "notes": "Normal operations"
}
```

### Weekly Record
```json
{
  "week": "Week 15",
  "year": 2024,
  "week_number": 15,
  "energy": 875,
  "energy_previous": 850,
  "water": 1450,
  "water_previous": 1400,
  "waste": 580,
  "waste_previous": 600,
  "carbon": 360,
  "carbon_previous": 350,
  "notes": "Strong week"
}
```

### Monthly Record
```json
{
  "month": "April 2024",
  "year": 2024,
  "month_number": 4,
  "energy": 3500,
  "water": 6200,
  "waste": 2350,
  "carbon": 1450,
  "notes": "Best month of quarter"
}
```

### Summary Statistics
```json
{
  "total_records": 450,
  "energy_total": 52500,
  "water_total": 93000,
  "waste_total": 35100,
  "carbon_total": 21750,
  "energy_avg": 116.67,
  "water_avg": 206.67,
  "waste_avg": 78.00,
  "carbon_avg": 48.33
}
```

---

## File Structure

MongoDB stores data in these collections:
- `historical_daily` - Daily records
- `historical_weekly` - Weekly records
- `historical_monthly` - Monthly records

File-based fallback (dev mode):
- `data/historical_daily.json`
- `data/historical_weekly.json`
- `data/historical_monthly.json`

---

## Key Points

✅ **What Gets Stored**
- Energy consumption (kWh)
- Water usage (liters)
- Waste generated (kg)
- Carbon footprint (kg CO₂)

✅ **Data Retention**
- Daily data: Keep for trending (automatic cleanup after 90 days)
- Weekly data: Kept indefinitely
- Monthly data: Kept indefinitely for historical analysis

✅ **Access**
- Public: View all historical data (GET endpoints)
- Authenticated: Save new data (POST endpoints)
- Admin-only: Cleanup old data (DELETE endpoint)

---

## Frontend Integration

```javascript
// Simple daily save
async function saveDayMetrics(energy, water, waste, carbon) {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch('/api/data/daily', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: today, energy, water, waste, carbon })
  });
  return response.json();
}

// Get this month's data
async function getMonthData(month = 4, year = 2024) {
  const response = await fetch(`/api/data/monthly?year=${year}`);
  const data = await response.json();
  return data.data.find(m => m.month_number === month);
}

// Get trends
async function getStats() {
  const response = await fetch('/api/data/summary');
  return response.json();
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Date and data required" | Add `date` field in YYYY-MM-DD format |
| "Week, year, week_number required" | Include all three fields in weekly POST |
| Empty results | Check date format (YYYY-MM-DD) and verify data exists |
| 401 Unauthorized | Include valid JWT token in Authorization header |
| 403 Forbidden | Only admin can delete data |

---

## Database Maintenance

**Monthly**: Check storage usage
```bash
# See collection sizes
db.historical_daily.stats()
db.historical_weekly.stats()
db.historical_monthly.stats()
```

**Quarterly**: Archive old data
```bash
# Clean up records older than 90 days
curl -X DELETE "http://localhost:10000/api/data/cleanup?days=90" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Yearly**: Generate annual reports from monthly data
```bash
# Get all 2024 data
curl "http://localhost:10000/api/data/monthly?year=2024"
```

---

For detailed documentation, see [DATA_STORAGE_GUIDE.md](DATA_STORAGE_GUIDE.md)
