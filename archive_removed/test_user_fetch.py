import requests
import json

API_BASE = "http://localhost:5000/api"

print("\n" + "="*60)
print("USER MESSAGE RETRIEVAL TEST WITH JWT")
print("="*60)

# 1. User login
print("\n1. User logging in...")
response = requests.post(f"{API_BASE}/auth/login", json={
    "email": "testuser@example.com",
    "password": "user123"
})

if response.status_code == 200:
    user_data = response.json()
    user_token = user_data['access_token']
    print("[OK] User logged in")
    print(f"  Email: {user_data['user']['email']}")
else:
    print("  User not found, registering...")
    response = requests.post(f"{API_BASE}/auth/register", json={
        "email": "testuser@example.com",
        "password": "user123"
    })
    user_data = response.json()
    user_token = user_data['access_token']
    print("[OK] User registered")

# 2. Send message as user
print("\n2. User sending message...")
response = requests.post(f"{API_BASE}/messages/send", json={
    "user_name": "Test User",
    "user_email": "testuser@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
})
message_id = response.json()['message_id']
print(f"[OK] Message sent: {message_id}")

# 3. Admin replies
print("\n3. Admin sending reply...")
response = requests.post(f"{API_BASE}/auth/login", json={
    "email": "admin@greencampus.com",
    "password": "admin123"
})
admin_data = response.json()
admin_token = admin_data['access_token']
admin_headers = {"Authorization": f"Bearer {admin_token}"}

response = requests.post(f"{API_BASE}/messages/{message_id}/reply", 
    headers=admin_headers,
    json={"reply_text": "Thank you for contacting us."}
)
print("[OK] Reply sent successfully")

# 4. User fetches messages WITH JWT
print("\n4. User fetching their messages WITH JWT...")
user_headers = {"Authorization": f"Bearer {user_token}"}
response = requests.get(f"{API_BASE}/messages", headers=user_headers)

if response.status_code == 200:
    user_messages = response.json()['messages']
    print(f"[OK] User fetched {len(user_messages)} message(s)")
    
    if user_messages:
        msg = user_messages[0]
        replies = msg.get('replies', [])
        
        print(f"  Subject: {msg.get('subject')}")
        print(f"  Status: {msg.get('status')}")
        print(f"  Replies: {len(replies)}")
        
        if replies:
            print("\n[SUCCESS] User can see replies!")
            print(f"  Reply: {replies[0].get('reply_text')}")
        else:
            print("\n[ISSUE] No replies found")
            print("  Full message:")
            print(json.dumps(msg, indent=2))
else:
    print(f"[ERROR] User fetch failed: {response.status_code}")

print("\n" + "="*60 + "\n")
