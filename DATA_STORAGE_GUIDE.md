# Green Campus Dashboard - Data Storage Guide

## Overview

The Green Campus Dashboard now includes comprehensive data storage capabilities in MongoDB to track all metrics (Energy, Water, Waste, Carbon) across multiple time granularities:
- **Daily Data**: Individual day records
- **Weekly Data**: Week aggregations with current/previous comparisons
- **Monthly Data**: Month aggregations
- **Summary Statistics**: Overall trends and averages

## Database Schema

### MongoDB Collections

#### `historical_daily`
Stores daily aggregated values for all metrics.

**Document Structure:**
```json
{
  "date": "2024-01-15",
  "energy": 125,
  "water": 210,
  "waste": 82,
  "carbon": 51,
  "notes": "Optional notes about this day",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Fields:**
- `date` (String, required): Date in YYYY-MM-DD format
- `energy` (Number): Daily energy consumption
- `water` (Number): Daily water consumption
- `waste` (Number): Daily waste generated
- `carbon` (Number): Daily carbon footprint
- `notes` (String, optional): Additional information
- `updated_at` (DateTime): Records when the entry was last updated

---

#### `historical_weekly`
Stores weekly aggregations with previous period comparisons for trending.

**Document Structure:**
```json
{
  "week": "Week 2",
  "year": 2024,
  "week_number": 2,
  "energy": 875,
  "energy_previous": 750,
  "water": 1450,
  "water_previous": 1350,
  "waste": 580,
  "waste_previous": 550,
  "carbon": 360,
  "carbon_previous": 390,
  "notes": "Optional weekly analysis notes",
  "updated_at": "2024-01-21T15:45:00Z"
}
```

**Fields:**
- `week` (String): Week identifier (e.g., "Week 2" or "2024-W02")
- `year` (Number): Year of the week
- `week_number` (Number): Week number (1-52/53)
- `{metric}` (Number): Current week total for energy, water, waste, carbon
- `{metric}_previous` (Number): Previous week total for comparison
- `notes` (String, optional): Additional information
- `updated_at` (DateTime): Last update timestamp

---

#### `historical_monthly`
Stores monthly aggregations for long-term historical analysis.

**Document Structure:**
```json
{
  "month": "January 2024",
  "year": 2024,
  "month_number": 1,
  "energy": 3500,
  "water": 6200,
  "waste": 2350,
  "carbon": 1450,
  "notes": "Monthly summary and insights",
  "updated_at": "2024-02-01T08:00:00Z"
}
```

**Fields:**
- `month` (String): Month identifier (e.g., "January 2024" or "2024-01")
- `year` (Number): Year
- `month_number` (Number): Month number (1-12)
- `energy`, `water`, `waste`, `carbon` (Number): Monthly totals
- `notes` (String, optional): Monthly analysis
- `updated_at` (DateTime): Last update timestamp

---

## API Endpoints

### 1. Save Daily Data
**POST** `/api/data/daily`

Save or update daily metrics for a specific date.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2024-01-15",
  "energy": 125,
  "water": 210,
  "waste": 82,
  "carbon": 51,
  "notes": "Optional notes"
}
```

**Response (Success - 201):**
```json
{
  "message": "Daily data saved successfully",
  "success": true
}
```

**Response (Error):**
```json
{
  "message": "Date and data required"
}
```

---

### 2. Get Daily Data
**GET** `/api/data/daily`

Retrieve daily data with optional date range filtering.

**Query Parameters:**
- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format

**Examples:**
```
GET /api/data/daily                          # All daily data
GET /api/data/daily?start_date=2024-01-01   # From Jan 1 onwards
GET /api/data/daily?start_date=2024-01-01&end_date=2024-01-31  # Jan 2024
```

**Response (200):**
```json
{
  "data": [
    {
      "date": "2024-01-15",
      "energy": 125,
      "water": 210,
      "waste": 82,
      "carbon": 51,
      "notes": "",
      "updated_at": "2024-01-15T10:30:00"
    }
  ],
  "count": 15
}
```

---

### 3. Save Weekly Data
**POST** `/api/data/weekly`

Save weekly aggregations with previous week comparisons.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "week": "Week 2",
  "year": 2024,
  "week_number": 2,
  "energy": 875,
  "energy_previous": 750,
  "water": 1450,
  "water_previous": 1350,
  "waste": 580,
  "waste_previous": 550,
  "carbon": 360,
  "carbon_previous": 390,
  "notes": "Strong performance this week"
}
```

**Response (Success - 201):**
```json
{
  "message": "Weekly data saved successfully",
  "success": true
}
```

---

### 4. Get Weekly Data
**GET** `/api/data/weekly`

Retrieve weekly data for a specific year (default: current year).

**Query Parameters:**
- `year` (optional): Year (e.g., 2024)

**Examples:**
```
GET /api/data/weekly           # Current year
GET /api/data/weekly?year=2024 # Year 2024
```

**Response (200):**
```json
{
  "data": [
    {
      "week": "Week 2",
      "year": 2024,
      "week_number": 2,
      "energy": 875,
      "energy_previous": 750,
      "water": 1450,
      "water_previous": 1350,
      "waste": 580,
      "waste_previous": 550,
      "carbon": 360,
      "carbon_previous": 390,
      "notes": "",
      "updated_at": "2024-01-21T15:45:00"
    }
  ],
  "count": 10,
  "year": 2024
}
```

---

### 5. Save Monthly Data
**POST** `/api/data/monthly`

Save monthly aggregations for long-term historical tracking.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "month": "January 2024",
  "year": 2024,
  "month_number": 1,
  "energy": 3500,
  "water": 6200,
  "waste": 2350,
  "carbon": 1450,
  "notes": "Successful January - improved efficiency"
}
```

**Response (Success - 201):**
```json
{
  "message": "Monthly data saved successfully",
  "success": true
}
```

---

### 6. Get Monthly Data
**GET** `/api/data/monthly`

Retrieve monthly data for a specific year (default: current year).

**Query Parameters:**
- `year` (optional): Year (e.g., 2024)

**Examples:**
```
GET /api/data/monthly           # Current year
GET /api/data/monthly?year=2024 # Year 2024
```

**Response (200):**
```json
{
  "data": [
    {
      "month": "January 2024",
      "year": 2024,
      "month_number": 1,
      "energy": 3500,
      "water": 6200,
      "waste": 2350,
      "carbon": 1450,
      "notes": "",
      "updated_at": "2024-02-01T08:00:00"
    }
  ],
  "count": 12,
  "year": 2024
}
```

---

### 7. Get Summary Statistics
**GET** `/api/data/summary`

Get aggregate statistics across all stored data (no authentication required).

**Response (200):**
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

**Fields:**
- `total_records`: Total number of daily records stored
- `{metric}_total`: Sum of all values for that metric
- `{metric}_avg`: Average value per day for that metric

---

### 8. Cleanup Old Data
**DELETE** `/api/data/cleanup`

Remove daily records older than specified days (admin only). Monthly data is preserved for historical reference.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `days` (optional): Number of days to retain (default: 90)

**Examples:**
```
DELETE /api/data/cleanup            # Remove records older than 90 days
DELETE /api/data/cleanup?days=30    # Remove records older than 30 days
DELETE /api/data/cleanup?days=365   # Remove records older than 1 year
```

**Response (200):**
```json
{
  "message": "Deleted 25 records older than 90 days",
  "deleted_count": 25
}
```

---

## Authentication Requirements

Most endpoints require JWT authentication:
- **Public endpoints** (no auth): GET `/api/data/daily`, GET `/api/data/weekly`, GET `/api/data/monthly`, GET `/api/data/summary`
- **Authenticated endpoints** (any logged-in user): POST `/api/data/daily`, POST `/api/data/weekly`, POST `/api/data/monthly`
- **Admin-only endpoints**: DELETE `/api/data/cleanup`

Include JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Usage Examples

### Save Today's Data
```bash
curl -X POST http://localhost:10000/api/data/daily \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "energy": 125,
    "water": 210,
    "waste": 82,
    "carbon": 51,
    "notes": "Good day"
  }'
```

### Retrieve Last Month's Data
```bash
curl http://localhost:10000/api/data/daily?start_date=2024-01-01&end_date=2024-01-31
```

### Save Week 2 Data
```bash
curl -X POST http://localhost:10000/api/data/weekly \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "week": "Week 2",
    "year": 2024,
    "week_number": 2,
    "energy": 875,
    "energy_previous": 750,
    "water": 1450,
    "water_previous": 1350,
    "waste": 580,
    "waste_previous": 550,
    "carbon": 360,
    "carbon_previous": 390
  }'
```

### Get All Summary Statistics
```bash
curl http://localhost:10000/api/data/summary
```

---

## Data Flow Recommendations

### Daily Operations
1. At end of each day, call `POST /api/data/daily` to save day's totals
2. Periodically call `GET /api/data/summary` to monitor trends

### Weekly Operations
1. At end of each week, call `POST /api/data/weekly` with current and previous week data
2. Retrieved data can be used to update dashboard weekly views

### Monthly Operations
1. At end of each month, calculate totals from all daily records
2. Call `POST /api/data/monthly` to save monthly aggregate
3. Historical monthly data enables year-over-year comparisons

### Maintenance
1. Periodically (quarterly) call `DELETE /api/data/cleanup?days=90` to archive old daily data
2. Monthly and yearly aggregates are preserved indefinitely

---

## Frontend Integration Example

```javascript
// Save today's data
async function saveDailyData(data) {
  const response = await fetch('/api/data/daily', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      energy: data.energy,
      water: data.water,
      waste: data.waste,
      carbon: data.carbon
    })
  });
  return response.json();
}

// Get monthly data
async function getMonthlyData(year = 2024) {
  const response = await fetch(`/api/data/monthly?year=${year}`);
  return response.json();
}

// Get summary stats
async function getSummaryStats() {
  const response = await fetch('/api/data/summary');
  return response.json();
}
```

---

## Database Indexes (MongoDB)

For optimal performance, ensure these indexes are created:

```javascript
// Suggested indexes
db.historical_daily.createIndex({ "date": 1 })
db.historical_daily.createIndex({ "date": -1 })

db.historical_weekly.createIndex({ "year": 1, "week_number": 1 }, { unique: true })
db.historical_weekly.createIndex({ "year": -1 })

db.historical_monthly.createIndex({ "year": 1, "month_number": 1 }, { unique: true })
db.historical_monthly.createIndex({ "year": -1 })
```

---

## Troubleshooting

### Data not saving
- Check that MongoDB is running and connected
- Verify JWT token is valid for authenticated endpoints
- Check request body format matches schema

### Querying returns empty
- Verify date format is YYYY-MM-DD
- Check year and month_number values are correct
- Confirm data exists in database

### Performance issues
- Create indexes as recommended above
- Run `DELETE /api/data/cleanup` periodically to reduce daily data size
- Monthly data is archived for historical queries

---

## Security Notes

- Always use HTTPS in production
- Validate all input data on both client and server
- Admin cleanup endpoint requires authentication
- Monthly and yearly data should be preserved for compliance
- Regular backups recommended

---

## Future Enhancements

- Real-time data aggregation during week/month transitions
- Automated scheduled cleanup tasks
- Custom date range reports
- Data export functionality (CSV, PDF)
- Predictive analytics based on historical trends
- Anomaly detection for unusual consumption patterns
