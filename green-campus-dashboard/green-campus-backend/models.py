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
