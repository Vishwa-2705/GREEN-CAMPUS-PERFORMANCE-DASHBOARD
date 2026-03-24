import requests
import json

# Get token
admin_login = {"email": "admin@greencampus.com", "password": "admin123"}
response = requests.post("http://localhost:5000/api/auth/login", json=admin_login)
token = response.json()['access_token']
print(f"Token obtained: {token[:50]}...")

# Test JWT endpoint
print("\nTesting /api/test-jwt...")
headers = {'Authorization': f'Bearer {token}'}
response = requests.get("http://localhost:5000/api/test-jwt", headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Test messages endpoint
print("\nTesting /api/messages...")
response = requests.get("http://localhost:5000/api/messages", headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
