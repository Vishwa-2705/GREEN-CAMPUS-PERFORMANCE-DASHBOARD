import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/green_campus')
    MONGO_DB_NAME = 'green_campus'
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    
    # Admin credentials
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@greencampus.com')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')
    
    # Sample user credentials (for testing)
    SAMPLE_USER_EMAIL = os.getenv('SAMPLE_USER_EMAIL', 'user@greencampus.com')
    SAMPLE_USER_PASSWORD = os.getenv('SAMPLE_USER_PASSWORD', 'user123')
    
    # Email configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS', 'your-email@gmail.com')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', 'your-app-password')
