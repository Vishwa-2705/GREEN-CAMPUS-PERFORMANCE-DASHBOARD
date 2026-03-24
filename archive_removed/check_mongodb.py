from config import Config
from pymongo import MongoClient, errors

try:
    print(f"Trying to connect to: {Config.MONGODB_URI}")
    client = MongoClient(Config.MONGODB_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    print("✓ MongoDB connected successfully!")
except Exception as e:
    print(f"✗ MongoDB not available: {e}")
