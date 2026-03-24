import requests
import json
import time

# Give the server a moment to fully start
time.sleep(2)

API_BASE = "http://localhost:5000/api"

# Test admin login
admin_login = {
    "email": "admin@greencampus.com",
    "password": "admin123"
}

print("Testing admin login...")
response = requests.post(f"{API_BASE}/auth/login", json=admin_login)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
print()

# Test user login
user_login = {
    "email": "user@greencampus.com",
    "password": "user123"
}

print("Testing user login...")
response = requests.post(f"{API_BASE}/auth/login", json=user_login)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
