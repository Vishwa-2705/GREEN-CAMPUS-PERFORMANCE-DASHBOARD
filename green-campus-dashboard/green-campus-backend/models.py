from config import Config
from datetime import datetime
import os
import json
from bson import ObjectId

# Try to connect to MongoDB, fall back to file-based storage if unavailable
try:
    from pymongo import MongoClient, errors
    client = MongoClient(Config.MONGODB_URI, serverSelectionTimeoutMS=5000)
    # Test connection
    client.server_info()
    db = client[Config.MONGO_DB_NAME]
    USE_MONGODB = True
    print("✓ Connected to MongoDB")
except Exception as e:
    print(f"⚠ MongoDB not available: {e}. Using file-based storage.")
    USE_MONGODB = False
    db = None

# File-based database for development
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
MESSAGES_FILE = os.path.join(DATA_DIR, 'messages.json')
DASHBOARD_FILE = os.path.join(DATA_DIR, 'dashboard.json')

def ensure_data_dir():
    """Ensure data directory exists"""
    if not USE_MONGODB and not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def load_json_file(filepath):
    """Load JSON from file"""
    ensure_data_dir()
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {filepath}: {e}")
            return []
    return []

def save_json_file(filepath, data):
    """Save JSON to file"""
    ensure_data_dir()
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"✓ Saved to {filepath}")
    except Exception as e:
        print(f"✗ Error saving to {filepath}: {e}")


class Dashboard:
    """Store dashboard datasets (energy, water, waste, carbon)"""

    @staticmethod
    def get_dashboard():
        """Return a dashboard dict with energyData, waterData, wasteData, carbonData"""
        if USE_MONGODB:
            coll = db['dashboard']
            doc = coll.find_one({})
            if doc:
                # remove _id if present
                doc.pop('_id', None)
                return doc
            return None
        else:
            data = load_json_file(DASHBOARD_FILE)
            return data or None

    @staticmethod
    def save_dashboard(dashboard):
        """Save dashboard dict to storage (overwrite)"""
        if USE_MONGODB:
            coll = db['dashboard']
            # Upsert a single document
            coll.replace_one({}, dashboard, upsert=True)
            return True
        else:
            save_json_file(DASHBOARD_FILE, dashboard)
            return True

class User:
    """User model for authentication"""
    
    @staticmethod
    def create_user(email, password, role='user'):
        """Create a new user"""
        if USE_MONGODB:
            users_collection = db['users']
            if users_collection.find_one({'email': email}):
                return None
            user = {
                'email': email,
                'password': password,
                'role': role,
                'created_at': datetime.now()
            }
            result = users_collection.insert_one(user)
            return str(result.inserted_id)
        else:
            users = load_json_file(USERS_FILE)
            if any(u['email'] == email for u in users):
                return None
            user = {
                '_id': str(ObjectId()),
                'email': email,
                'password': password,
                'role': role,
                'created_at': datetime.now().isoformat()
            }
            users.append(user)
            save_json_file(USERS_FILE, users)
            return user['_id']
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        if USE_MONGODB:
            users_collection = db['users']
            return users_collection.find_one({'email': email})
        else:
            users = load_json_file(USERS_FILE)
            return next((u for u in users if u['email'] == email), None)
    
    @staticmethod
    def verify_credentials(email, password):
        """Verify user credentials"""
        user = User.find_by_email(email)
        if user and user['password'] == password:
            return user
        return None


class Message:
    """Message model for user-admin communication"""
    
    @staticmethod
    def create_message(user_name, user_email, subject, message_text):
        """Create a new message from user"""
        if USE_MONGODB:
            messages_collection = db['messages']
            message = {
                'user_name': user_name,
                'user_email': user_email,
                'subject': subject,
                'message': message_text,
                'status': 'unread',
                'created_at': datetime.now(),
                'replies': []
            }
            result = messages_collection.insert_one(message)
            return str(result.inserted_id)
        else:
            messages = load_json_file(MESSAGES_FILE)
            message = {
                '_id': str(ObjectId()),
                'user_name': user_name,
                'user_email': user_email,
                'subject': subject,
                'message': message_text,
                'status': 'unread',
                'created_at': datetime.now().isoformat(),
                'replies': []
            }
            messages.append(message)
            save_json_file(MESSAGES_FILE, messages)
            return message['_id']
    
    @staticmethod
    def get_all_messages():
        """Get all messages for admin"""
        if USE_MONGODB:
            messages_collection = db['messages']
            messages = list(messages_collection.find().sort('created_at', -1))
            for msg in messages:
                msg['_id'] = str(msg['_id'])
            return messages
        else:
            messages = load_json_file(MESSAGES_FILE)
            return sorted(messages, key=lambda x: x['created_at'], reverse=True)
    
    @staticmethod
    def get_message_by_id(message_id):
        """Get a specific message"""
        if USE_MONGODB:
            messages_collection = db['messages']
            message = messages_collection.find_one({'_id': ObjectId(message_id)})
            if message:
                message['_id'] = str(message['_id'])
            return message
        else:
            messages = load_json_file(MESSAGES_FILE)
            return next((m for m in messages if m['_id'] == message_id), None)
    
    @staticmethod
    def add_reply(message_id, reply_text):
        """Add admin reply to a message"""
        if USE_MONGODB:
            messages_collection = db['messages']
            reply = {
                'sender': 'Admin',
                'text': reply_text,
                'timestamp': datetime.now()
            }
            messages_collection.update_one(
                {'_id': ObjectId(message_id)},
                {
                    '$push': {'replies': reply},
                    '$set': {'status': 'replied'}
                }
            )
            return True
        else:
            messages = load_json_file(MESSAGES_FILE)
            for msg in messages:
                if msg['_id'] == message_id:
                    msg['replies'].append({
                        'sender': 'Admin',
                        'text': reply_text,
                        'timestamp': datetime.now().isoformat()
                    })
                    msg['status'] = 'replied'
                    break
            save_json_file(MESSAGES_FILE, messages)
            return True
    
    @staticmethod
    def delete_message(message_id):
        """Delete a message"""
        if USE_MONGODB:
            messages_collection = db['messages']
            result = messages_collection.delete_one({'_id': ObjectId(message_id)})
            return result.deleted_count > 0
        else:
            messages = load_json_file(MESSAGES_FILE)
            initial_count = len(messages)
            messages = [m for m in messages if m['_id'] != message_id]
            save_json_file(MESSAGES_FILE, messages)
            return len(messages) < initial_count
    
    @staticmethod
    def mark_as_read(message_id):
        """Mark message as read"""
        if USE_MONGODB:
            messages_collection = db['messages']
            messages_collection.update_one(
                {'_id': ObjectId(message_id)},
                {'$set': {'status': 'read'}}
            )
            return True
        else:
            messages = load_json_file(MESSAGES_FILE)
            for msg in messages:
                if msg['_id'] == message_id:
                    msg['status'] = 'read'
                    break
            save_json_file(MESSAGES_FILE, messages)
            return True


class HistoricalData:
    """Store historical metrics data (energy, water, waste, carbon) at various time granularities"""
    
    @staticmethod
    def save_daily_data(data_dict):
        """
        Save daily aggregated data
        data_dict format: {
            'date': 'YYYY-MM-DD',
            'energy': value,
            'water': value,
            'waste': value,
            'carbon': value,
            'notes': optional string
        }
        """
        if USE_MONGODB:
            coll = db['historical_daily']
            # Upsert: replace if date exists, insert if not
            result = coll.update_one(
                {'date': data_dict.get('date')},
                {'$set': {
                    'date': data_dict.get('date'),
                    'energy': data_dict.get('energy', 0),
                    'water': data_dict.get('water', 0),
                    'waste': data_dict.get('waste', 0),
                    'carbon': data_dict.get('carbon', 0),
                    'notes': data_dict.get('notes', ''),
                    'updated_at': datetime.now()
                }},
                upsert=True
            )
            return result.upserted_id or result.matched_count > 0
        else:
            DAILY_FILE = os.path.join(DATA_DIR, 'historical_daily.json')
            daily_data = load_json_file(DAILY_FILE)
            entry = next((d for d in daily_data if d.get('date') == data_dict.get('date')), None)
            if entry:
                entry.update(data_dict)
                entry['updated_at'] = datetime.now().isoformat()
            else:
                data_dict['updated_at'] = datetime.now().isoformat()
                daily_data.append(data_dict)
            save_json_file(DAILY_FILE, daily_data)
            return True
    
    @staticmethod
    def save_weekly_data(data_dict):
        """
        Save weekly aggregated data
        data_dict format: {
            'week': 'Week X or 2024-W10',
            'year': 2024,
            'week_number': 10,
            'energy': value,
            'energy_previous': value,
            'water': value,
            'water_previous': value,
            'waste': value,
            'waste_previous': value,
            'carbon': value,
            'carbon_previous': value,
            'notes': optional string
        }
        """
        if USE_MONGODB:
            coll = db['historical_weekly']
            result = coll.update_one(
                {'year': data_dict.get('year'), 'week_number': data_dict.get('week_number')},
                {'$set': {
                    'week': data_dict.get('week'),
                    'year': data_dict.get('year'),
                    'week_number': data_dict.get('week_number'),
                    'energy': data_dict.get('energy', 0),
                    'energy_previous': data_dict.get('energy_previous', 0),
                    'water': data_dict.get('water', 0),
                    'water_previous': data_dict.get('water_previous', 0),
                    'waste': data_dict.get('waste', 0),
                    'waste_previous': data_dict.get('waste_previous', 0),
                    'carbon': data_dict.get('carbon', 0),
                    'carbon_previous': data_dict.get('carbon_previous', 0),
                    'notes': data_dict.get('notes', ''),
                    'updated_at': datetime.now()
                }},
                upsert=True
            )
            return result.upserted_id or result.matched_count > 0
        else:
            WEEKLY_FILE = os.path.join(DATA_DIR, 'historical_weekly.json')
            weekly_data = load_json_file(WEEKLY_FILE)
            entry = next((d for d in weekly_data if d.get('year') == data_dict.get('year') 
                         and d.get('week_number') == data_dict.get('week_number')), None)
            if entry:
                entry.update(data_dict)
                entry['updated_at'] = datetime.now().isoformat()
            else:
                data_dict['updated_at'] = datetime.now().isoformat()
                weekly_data.append(data_dict)
            save_json_file(WEEKLY_FILE, weekly_data)
            return True
    
    @staticmethod
    def save_monthly_data(data_dict):
        """
        Save monthly aggregated data
        data_dict format: {
            'month': 'January 2024 or 2024-01',
            'year': 2024,
            'month_number': 1,
            'energy': value,
            'water': value,
            'waste': value,
            'carbon': value,
            'notes': optional string
        }
        """
        if USE_MONGODB:
            coll = db['historical_monthly']
            result = coll.update_one(
                {'year': data_dict.get('year'), 'month_number': data_dict.get('month_number')},
                {'$set': {
                    'month': data_dict.get('month'),
                    'year': data_dict.get('year'),
                    'month_number': data_dict.get('month_number'),
                    'energy': data_dict.get('energy', 0),
                    'water': data_dict.get('water', 0),
                    'waste': data_dict.get('waste', 0),
                    'carbon': data_dict.get('carbon', 0),
                    'notes': data_dict.get('notes', ''),
                    'updated_at': datetime.now()
                }},
                upsert=True
            )
            return result.upserted_id or result.matched_count > 0
        else:
            MONTHLY_FILE = os.path.join(DATA_DIR, 'historical_monthly.json')
            monthly_data = load_json_file(MONTHLY_FILE)
            entry = next((d for d in monthly_data if d.get('year') == data_dict.get('year') 
                         and d.get('month_number') == data_dict.get('month_number')), None)
            if entry:
                entry.update(data_dict)
                entry['updated_at'] = datetime.now().isoformat()
            else:
                data_dict['updated_at'] = datetime.now().isoformat()
                monthly_data.append(data_dict)
            save_json_file(MONTHLY_FILE, monthly_data)
            return True
    
    @staticmethod
    def get_daily_data(start_date=None, end_date=None):
        """
        Retrieve daily data. If dates not provided, returns last 30 days.
        Format: start_date='2024-01-01', end_date='2024-01-31'
        """
        if USE_MONGODB:
            coll = db['historical_daily']
            query = {}
            
            if start_date or end_date:
                query['date'] = {}
                if start_date:
                    query['date']['$gte'] = start_date
                if end_date:
                    query['date']['$lte'] = end_date
            
            results = list(coll.find(query).sort('date', -1))
            for doc in results:
                doc.pop('_id', None)
            return results
        else:
            DAILY_FILE = os.path.join(DATA_DIR, 'historical_daily.json')
            daily_data = load_json_file(DAILY_FILE)
            
            if start_date or end_date:
                daily_data = [d for d in daily_data 
                             if (not start_date or d.get('date', '') >= start_date) and
                                (not end_date or d.get('date', '') <= end_date)]
            
            return sorted(daily_data, key=lambda x: x.get('date', ''), reverse=True)
    
    @staticmethod
    def get_weekly_data(year=None):
        """
        Retrieve weekly data. If year not provided, returns current year.
        """
        if USE_MONGODB:
            coll = db['historical_weekly']
            query = {'year': year} if year else {}
            results = list(coll.find(query).sort('week_number', -1))
            for doc in results:
                doc.pop('_id', None)
            return results
        else:
            WEEKLY_FILE = os.path.join(DATA_DIR, 'historical_weekly.json')
            weekly_data = load_json_file(WEEKLY_FILE)
            
            if year:
                weekly_data = [d for d in weekly_data if d.get('year') == year]
            
            return sorted(weekly_data, key=lambda x: x.get('week_number', 0), reverse=True)
    
    @staticmethod
    def get_monthly_data(year=None):
        """
        Retrieve monthly data. If year not provided, returns current year.
        """
        if USE_MONGODB:
            coll = db['historical_monthly']
            query = {'year': year} if year else {}
            results = list(coll.find(query).sort('month_number', -1))
            for doc in results:
                doc.pop('_id', None)
            return results
        else:
            MONTHLY_FILE = os.path.join(DATA_DIR, 'historical_monthly.json')
            monthly_data = load_json_file(MONTHLY_FILE)
            
            if year:
                monthly_data = [d for d in monthly_data if d.get('year') == year]
            
            return sorted(monthly_data, key=lambda x: x.get('month_number', 0), reverse=True)
    
    @staticmethod
    def get_summary_stats():
        """
        Get summary statistics (total, average) across all stored data
        """
        if USE_MONGODB:
            daily_coll = db['historical_daily']
            daily_records = list(daily_coll.find({}))
            
            if not daily_records:
                return {
                    'total_records': 0,
                    'energy_total': 0,
                    'water_total': 0,
                    'waste_total': 0,
                    'carbon_total': 0,
                    'energy_avg': 0,
                    'water_avg': 0,
                    'waste_avg': 0,
                    'carbon_avg': 0
                }
            
            count = len(daily_records)
            energy_total = sum(d.get('energy', 0) for d in daily_records)
            water_total = sum(d.get('water', 0) for d in daily_records)
            waste_total = sum(d.get('waste', 0) for d in daily_records)
            carbon_total = sum(d.get('carbon', 0) for d in daily_records)
            
            return {
                'total_records': count,
                'energy_total': energy_total,
                'water_total': water_total,
                'waste_total': waste_total,
                'carbon_total': carbon_total,
                'energy_avg': round(energy_total / count, 2),
                'water_avg': round(water_total / count, 2),
                'waste_avg': round(waste_total / count, 2),
                'carbon_avg': round(carbon_total / count, 2)
            }
        else:
            DAILY_FILE = os.path.join(DATA_DIR, 'historical_daily.json')
            daily_data = load_json_file(DAILY_FILE)
            
            if not daily_data:
                return {
                    'total_records': 0,
                    'energy_total': 0,
                    'water_total': 0,
                    'waste_total': 0,
                    'carbon_total': 0,
                    'energy_avg': 0,
                    'water_avg': 0,
                    'waste_avg': 0,
                    'carbon_avg': 0
                }
            
            count = len(daily_data)
            energy_total = sum(d.get('energy', 0) for d in daily_data)
            water_total = sum(d.get('water', 0) for d in daily_data)
            waste_total = sum(d.get('waste', 0) for d in daily_data)
            carbon_total = sum(d.get('carbon', 0) for d in daily_data)
            
            return {
                'total_records': count,
                'energy_total': energy_total,
                'water_total': water_total,
                'waste_total': waste_total,
                'carbon_total': carbon_total,
                'energy_avg': round(energy_total / count, 2),
                'water_avg': round(water_total / count, 2),
                'waste_avg': round(waste_total / count, 2),
                'carbon_avg': round(carbon_total / count, 2)
            }
    
    @staticmethod
    def delete_old_data(days=90):
        """
        Delete daily records older than specified days (default: 90 days)
        while keeping monthly aggregates for history.
        """
        if USE_MONGODB:
            from datetime import timedelta
            cutoff_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            coll = db['historical_daily']
            result = coll.delete_many({'date': {'$lt': cutoff_date}})
            return result.deleted_count
        else:
            from datetime import timedelta
            DAILY_FILE = os.path.join(DATA_DIR, 'historical_daily.json')
            daily_data = load_json_file(DAILY_FILE)
            cutoff_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            
            initial_count = len(daily_data)
            daily_data = [d for d in daily_data if d.get('date', '') >= cutoff_date]
            save_json_file(DAILY_FILE, daily_data)
            return initial_count - len(daily_data)
