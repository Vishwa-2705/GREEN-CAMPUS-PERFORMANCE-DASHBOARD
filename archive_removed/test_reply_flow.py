import requests
import json
import time

API_BASE = "http://localhost:5000/api"

print("=" * 60)
print("MESSAGE & REPLY FLOW TEST")
print("=" * 60)

# Step 1: Admin login
print("\n1. Admin logging in...")
admin_login = {"email": "admin@greencampus.com", "password": "admin123"}
response = requests.post(f"{API_BASE}/auth/login", json=admin_login)
admin_token = response.json()['access_token']
print(f"✓ Admin logged in")

# Step 2: User sends a message
print("\n2. User sending message...")
message_data = {
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "subject": "Help Request",
    "message": "I need help with the dashboard"
}
response = requests.post(f"{API_BASE}/messages/send", json=message_data)
message_id = response.json()['message_id']
print(f"✓ Message sent with ID: {message_id}")

time.sleep(0.5)

# Step 3: Admin fetches messages
print("\n3. Admin fetching messages...")
headers = {'Authorization': f'Bearer {admin_token}'}
response = requests.get(f"{API_BASE}/messages", headers=headers)
messages = response.json()['messages']
print(f"✓ Found {len(messages)} message(s)")
print(f"Message status before reply: {messages[0]['status']}")

# Step 4: Admin sends reply
print("\n4. Admin sending reply...")
reply_data = {"reply_text": "Thank you for reaching out! We'll help you with the dashboard."}
response = requests.post(f"{API_BASE}/messages/{message_id}/reply", headers=headers, json=reply_data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

time.sleep(0.5)

# Step 5: Admin fetches messages again to verify reply was stored
print("\n5. Admin fetching messages again to verify reply...")
response = requests.get(f"{API_BASE}/messages", headers=headers)
messages = response.json()['messages']
for msg in messages:
    if msg['_id'] == message_id:
        print(f"✓ Message status after reply: {msg['status']}")
        print(f"✓ Number of replies: {len(msg['replies'])}")
        if msg['replies']:
            print(f"✓ Reply text: {msg['replies'][0]['text'][:50]}...")

# Step 6: Get all messages (user perspective - no JWT)
print("\n6. Fetching messages without JWT (like user does)...")
response = requests.get(f"{API_BASE}/messages")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Step 7: Try to get message by ID without JWT
print("\n7. Getting specific message by ID without JWT...")
response = requests.get(f"{API_BASE}/messages/{message_id}")
print(f"Status: {response.status_code}")
if response.status_code == 200:
    msg = response.json()['message']
    print(f"✓ Message found")
    print(f"  Status: {msg['status']}")
    print(f"  Replies: {len(msg.get('replies', []))}")
    if msg.get('replies'):
        for i, reply in enumerate(msg['replies']):
            print(f"  Reply {i+1}: {reply['text'][:50]}...")
else:
    print(f"✗ Error: {response.json()}")

print("\n" + "=" * 60)
