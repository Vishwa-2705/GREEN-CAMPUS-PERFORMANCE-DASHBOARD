import requests
import json
import time

API_BASE = "http://localhost:5000/api"

print("=" * 60)
print("MESSAGE FLOW DEBUG TEST")
print("=" * 60)

# Step 1: Get admin token
print("\n1. Logging in as admin...")
admin_login = {
    "email": "admin@greencampus.com",
    "password": "admin123"
}

response = requests.post(f"{API_BASE}/auth/login", json=admin_login)
admin_token = response.json()['access_token']
print(f"✓ Admin logged in")
print(f"Token: {admin_token[:50]}...")

# Step 2: Send a test message from user
print("\n2. Sending test message from user...")
message_data = {
    "user_name": "Test User",
    "user_email": "testuser@example.com",
    "subject": "Test Subject",
    "message": "This is a test message to verify the system works"
}

response = requests.post(f"{API_BASE}/messages/send", json=message_data)
print(f"Response Status: {response.status_code}")
print(f"Response: {response.json()}")

# Wait a moment
time.sleep(1)

# Step 3: Admin fetches messages
print("\n3. Admin fetching all messages...")
headers = {
    'Authorization': f'Bearer {admin_token}',
    'Content-Type': 'application/json'
}

response = requests.get(f"{API_BASE}/messages", headers=headers)
print(f"Response Status: {response.status_code}")
messages = response.json()
print(f"Messages Response: {json.dumps(messages, indent=2, default=str)[:500]}...")

if messages.get('messages'):
    print(f"\n✓ Found {len(messages['messages'])} message(s)")
    for msg in messages['messages']:
        print(f"  - Subject: {msg['subject']}")
        print(f"    From: {msg['user_email']}")
        print(f"    Status: {msg['status']}")
else:
    print("\n✗ No messages found!")

# Step 4: Check backend directory
print("\n4. Checking backend data directory...")
import os
backend_path = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(backend_path, 'green-campus-backend', 'data')
print(f"Backend path: {backend_path}")
print(f"Expected data path: {data_path}")

if os.path.exists(data_path):
    print(f"✓ Data directory exists")
    files = os.listdir(data_path)
    print(f"Files in data directory: {files}")
    
    for file in files:
        filepath = os.path.join(data_path, file)
        with open(filepath, 'r') as f:
            content = json.load(f)
            print(f"\n{file} contains {len(content)} record(s)")
            if content:
                print(f"First record: {json.dumps(content[0], indent=2, default=str)[:300]}...")
else:
    print(f"✗ Data directory NOT found")

print("\n" + "=" * 60)
