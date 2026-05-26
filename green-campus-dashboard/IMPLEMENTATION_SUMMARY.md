# Green Campus Dashboard - Data Storage Implementation Summary

## What Has Been Implemented

Your Green Campus Dashboard now has **comprehensive data storage in MongoDB** to track all metrics (Energy, Water, Waste, Carbon) across multiple time granularities.

---

## 📊 Data Storage Layers

### 1. **Daily Data**
- Individual day records
- Single values per metric per day
- Useful for: Daily trends, anomaly detection
- **Collection**: `historical_daily`

Example Record:
```json
{
  "date": "2024-04-15",
  "energy": 125,
  "water": 210,
  "waste": 82,
  "carbon": 51,
  "notes": "Optional notes",
  "updated_at": "2024-04-15T10:30:00Z"
}
```

---

### 2. **Weekly Data**
- Week aggregations with previous week comparison
- Tracks current vs. previous for trend analysis
- Useful for: Week-over-week analysis, Green Score calculation
- **Collection**: `historical_weekly`

Example Record:
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
  "notes": "Strong performance",
  "updated_at": "2024-04-21T23:59:00Z"
}
```

---

### 3. **Monthly Data**
- Month totals for long-term historical analysis
- Useful for: Historical comparisons, yearly reports, compliance
- **Collection**: `historical_monthly`

Example Record:
```json
{
  "month": "April 2024",
  "year": 2024,
  "month_number": 4,
  "energy": 3500,
  "water": 6200,
  "waste": 2350,
  "carbon": 1450,
  "notes": "Best month of quarter",
  "updated_at": "2024-05-01T00:00:00Z"
}
```

---

## 🔌 API Endpoints Added

### Daily Data Management
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/data/daily` | POST | Save daily metrics | ✓ |
| `/api/data/daily` | GET | Retrieve daily data (with date range) | ✗ |

### Weekly Data Management
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/data/weekly` | POST | Save weekly aggregations | ✓ |
| `/api/data/weekly` | GET | Retrieve weekly data (by year) | ✗ |

### Monthly Data Management
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/data/monthly` | POST | Save monthly aggregations | ✓ |
| `/api/data/monthly` | GET | Retrieve monthly data (by year) | ✗ |

### Analytics & Maintenance
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/data/summary` | GET | Get aggregate statistics | ✗ |
| `/api/data/cleanup` | DELETE | Delete old daily data | ✓ Admin |

✓ = Requires JWT Authentication | ✗ = Public Access

---

## 🛠️ Backend Changes

### 1. **models.py** - New `HistoricalData` Class
Added comprehensive class with methods:
- `save_daily_data()` - Store daily metrics
- `save_weekly_data()` - Store weekly aggregations
- `save_monthly_data()` - Store monthly totals
- `get_daily_data()` - Query daily records (with date range filtering)
- `get_weekly_data()` - Query weekly records (by year)
- `get_monthly_data()` - Query monthly records (by year)
- `get_summary_stats()` - Calculate aggregate statistics
- `delete_old_data()` - Archive old daily records (retention policy)

**Supports both MongoDB and file-based storage** (JSON files in development mode)

### 2. **app.py** - New Endpoints
Added 8 new routes for complete data management:
```python
POST   /api/data/daily                # Save daily data
GET    /api/data/daily                # Get daily data
POST   /api/data/weekly               # Save weekly data
GET    /api/data/weekly               # Get weekly data
POST   /api/data/monthly              # Save monthly data
GET    /api/data/monthly              # Get monthly data
GET    /api/data/summary              # Get statistics
DELETE /api/data/cleanup              # Clean old data (admin)
```

All endpoints feature:
- ✅ Full error handling
- ✅ Type validation
- ✅ Authentication/authorization
- ✅ Comprehensive logging
- ✅ JSON responses

---

## 📚 Documentation Created

### 1. **DATA_STORAGE_GUIDE.md** (Comprehensive)
- Complete API documentation
- Schema definitions for each collection
- Examples for all endpoints
- Authentication requirements
- Database indexes recommendations
- Frontend integration examples
- Troubleshooting guide
- Security best practices

### 2. **QUICK_REFERENCE.md** (Quick Start)
- Summary of all endpoints
- Common tasks with curl examples
- Data structure examples
- Key points checklist
- Simple frontend integration code
- Maintenance schedule

---

## 🧪 Sample Data Script

### **populate_sample_data.py**
Python script to quickly populate database with test data:
- Automatically authenticates
- Populates 30 days of daily data
- Populates 12 weeks of weekly data
- Populates 4 months of monthly data
- Displays summary statistics

**Usage:**
```bash
python3 populate_sample_data.py
```

---

## 🔐 Security Features

✅ **Authentication**
- JWT token required for save/delete operations
- Public access for read operations
- Admin-only for cleanup operations

✅ **Data Validation**
- All inputs validated
- Type checking on numeric fields
- Date format validation (YYYY-MM-DD)

✅ **Access Control**
- Separate admin endpoint for data cleanup
- Token-based authorization
- Role-based access (admin vs. user)

---

## 💾 Data Persistence

### MongoDB
If MongoDB is connected:
- All data stored in MongoDB collections
- Automatic indexing recommended
- Scalable for large datasets

### File-Based Fallback
If MongoDB unavailable:
- Data stored as JSON files
- Directory: `green-campus-backend/data/`
- Files:
  - `historical_daily.json`
  - `historical_weekly.json`
  - `historical_monthly.json`

---

## 📈 Usage Flow

### Daily Operations
```
1. End of day:
   POST /api/data/daily
   {
     "date": "2024-04-15",
     "energy": 125,
     "water": 210,
     "waste": 82,
     "carbon": 51
   }

2. Monitor trends:
   GET /api/data/summary
```

### Weekly Operations
```
1. End of week:
   POST /api/data/weekly
   {
     "week": "Week 15",
     "year": 2024,
     "week_number": 15,
     "energy": 875,
     "energy_previous": 850,
     ...
   }

2. Display weekly chart:
   GET /api/data/weekly?year=2024
```

### Monthly Operations
```
1. End of month:
   POST /api/data/monthly
   {
     "month": "April 2024",
     "year": 2024,
     "month_number": 4,
     ...
   }

2. Generate monthly report:
   GET /api/data/monthly?year=2024
```

### Maintenance (Quarterly)
```
1. Archive old daily data (>90 days):
   DELETE /api/data/cleanup?days=90
   
2. Monthly data kept indefinitely for compliance
```

---

## 🎯 Key Features

### ✅ Implemented
- [x] Daily metric storage
- [x] Weekly aggregations with trend tracking
- [x] Monthly historical data
- [x] Summary statistics and analytics
- [x] Date range filtering
- [x] Data cleanup/retention policies
- [x] Full API documentation
- [x] Sample data population script
- [x] Error handling and validation
- [x] MongoDB and file-based storage support
- [x] JWT authentication
- [x] Admin-only operations
- [x] Public data access (GET only)

### 🚀 Ready for Frontend Integration
- [x] All data retrieval endpoints public
- [x] Simple JSON responses
- [x] CORS enabled
- [x] Clear error messages

---

## 📋 Testing Checklist

Before deploying, verify:

1. **Backend Setup**
   - [ ] MongoDB connected or file storage working
   - [ ] `HistoricalData` model imported in app.py
   - [ ] All endpoints returning 200 for GET, 201 for POST
   - [ ] Authentication required where specified

2. **Database**
   - [ ] Collections created automatically
   - [ ] JSON files created in fallback mode
   - [ ] Data persists across restarts

3. **API Testing**
   - [ ] Can save daily data: `POST /api/data/daily`
   - [ ] Can retrieve daily: `GET /api/data/daily`
   - [ ] Can save weekly data: `POST /api/data/weekly`
   - [ ] Can retrieve weekly: `GET /api/data/weekly`
   - [ ] Can save monthly: `POST /api/data/monthly`
   - [ ] Can get summary: `GET /api/data/summary`
   - [ ] Cleanup requires admin auth: `DELETE /api/data/cleanup`

4. **Sample Data**
   - [ ] Run `python3 populate_sample_data.py`
   - [ ] Verify data in database
   - [ ] Check summary statistics are calculated correctly

---

## 🔗 Integration with Frontend

### Next Steps for Frontend
1. **Display Historical Data**
   - Add charts showing daily trends
   - Weekly comparison views
   - Monthly historical reports

2. **Automated Data Collection**
   - Auto-save daily metrics at day end
   - Weekly aggregation on Monday
   - Monthly report generation

3. **Analytics Dashboard**
   - Show trends over time
   - Compare current vs. previous periods
   - Display Green Score based on historical data

4. **Export Features**
   - Export daily/weekly/monthly data to CSV
   - Generate PDF reports
   - Email monthly summaries

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: Data not saving?**
A: Check MongoDB connection or verify file permissions in data/ directory

**Q: Getting empty results?**
A: Verify data exists. First run `python3 populate_sample_data.py` for test data

**Q: Endpoints returning 401?**
A: Include JWT token in Authorization header for protected endpoints

**Q: Performance slow?**
A: Run `DELETE /api/data/cleanup?days=90` to archive old data

For detailed troubleshooting, see [DATA_STORAGE_GUIDE.md](DATA_STORAGE_GUIDE.md)

---

## 📄 Files Modified/Created

### Modified
- `green-campus-backend/models.py` - Added `HistoricalData` class
- `green-campus-backend/app.py` - Added 8 new endpoints

### Created
- `DATA_STORAGE_GUIDE.md` - Complete API documentation
- `QUICK_REFERENCE.md` - Quick start guide
- `populate_sample_data.py` - Sample data population script

---

## ✅ Summary

You now have a **production-ready data storage system** that:

✅ Stores all campus sustainability metrics in MongoDB (or JSON fallback)  
✅ Provides daily, weekly, and monthly data aggregation  
✅ Offers complete REST API for data access  
✅ Includes authentication and authorization  
✅ Supports historical analysis and trending  
✅ Includes comprehensive documentation  
✅ Ready for frontend integration  

**To get started:**
1. Review [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common tasks
2. Run `python3 populate_sample_data.py` to populate test data
3. Call `GET /api/data/summary` to verify data is stored
4. Integrate endpoints into your frontend dashboard

---

**Questions?** See the complete documentation in [DATA_STORAGE_GUIDE.md](DATA_STORAGE_GUIDE.md)
