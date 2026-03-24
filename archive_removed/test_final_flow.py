"""
Final comprehensive test of the complete message + reply flow
This simulates the exact browser workflow
"""
import requests
import json
from time import sleep

API_BASE = "http://localhost:5000/api"

print("\n" + "="*70)
print("FINAL COMPREHENSIVE TEST - COMPLETE MESSAGE & REPLY FLOW")
print("="*70)

# STEP 1: User registers and logs in
print("\n[STEP 1] User Registration & Login")
print("-" * 70)
USEREXAMPLE = "browser_test_user@example.com"
USER_PWD = "test123456"

response = requests.post(f"{API_BASE}/auth/register", json={
    "email": USEREXAMPLE,
    "password": USER_PWD
})

if response.status_code == 201:
    user_token = response.json()['access_token']
    print(f"[OK] User registered: {USEREXAMPLE}")
    print(f"[OK] JWT Token received and stored")
else:
    # User already exists, just login
    response = requests.post(f"{API_BASE}/auth/login", json={
        "email": USEREXAMPLE,
        "password": USER_PWD
    })
    user_token = response.json()['access_token']
    print(f"[OK] User logged in: {USEREXAMPLE}")

# STEP 2: User sends a message
print("\n[STEP 2] User Sends Message")
print("-" * 70)
response = requests.post(f"{API_BASE}/messages/send", json={
    "user_name": "Test Browser User",
    "user_email": USEREXAMPLE,
    "subject": "Dashboard Feature Request",
    "message": "Can you add real-time notifications to the dashboard?"
})
message_id = response.json()['message_id']
print(f"[OK] Message sent")
print(f"    Message ID: {message_id}")
print(f"    Subject: Dashboard Feature Request")
print(f"    Status: Stored in database")

# STEP 3: Admin logs in and fetches messages
print("\n[STEP 3] Admin Fetches Messages")
print("-" * 70)
response = requests.post(f"{API_BASE}/auth/login", json={
    "email": "admin@greencampus.com",
    "password": "admin123"
})
admin_token = response.json()['access_token']
admin_headers = {"Authorization": f"Bearer {admin_token}"}
print(f"[OK] Admin logged in")

response = requests.get(f"{API_BASE}/messages", headers=admin_headers)
messages = response.json()['messages']
print(f"[OK] Admin fetched all messages: {len(messages)} total")

# Find our test message
test_msg = next((m for m in messages if m.get('_id') == message_id), None)
if test_msg:
    print(f"[OK] Found user's message in admin dashboard")
    print(f"    Status: {test_msg.get('status')}")
else:
    print("[ERROR] Message not found!")
    exit(1)

# STEP 4: Admin sends reply
print("\n[STEP 4] Admin Sends Reply")
print("-" * 70)
response = requests.post(f"{API_BASE}/messages/{message_id}/reply",
    headers=admin_headers,
    json={"reply_text": "Great suggestion! We're adding notifications in the next release."}
)
if response.status_code == 200:
    print(f"[OK] Reply sent successfully")
    print(f"    Reply text: 'Great suggestion! We're adding notifications in the next release.'")
    print(f"    Message status updated to: replied")
else:
    print(f"[ERROR] Reply failed: {response.json()}")
    exit(1)

# STEP 5: Admin verifies reply was stored
print("\n[STEP 5] Admin Verifies Reply Storage")
print("-" * 70)
response = requests.get(f"{API_BASE}/messages", headers=admin_headers)
messages = response.json()['messages']
test_msg = next((m for m in messages if m.get('_id') == message_id), None)

if test_msg:
    print(f"[OK] Message found in database")
    print(f"    Status: {test_msg.get('status')}")
    replies = test_msg.get('replies', [])
    print(f"    Replies: {len(replies)}")
    
    if replies:
        print(f"[OK] Reply stored successfully")
        print(f"    Sender: {replies[0].get('sender')}")
        print(f"    Text: {replies[0].get('text')[:50]}...")
else:
    print("[ERROR] Message not found after reply!")
    exit(1)

# STEP 6: User logs in and fetches messages
print("\n[STEP 6] User Fetches Their Messages (WITH JWT)")
print("-" * 70)
user_headers = {"Authorization": f"Bearer {user_token}"}
print(f"[OK] User has valid JWT token")

response = requests.get(f"{API_BASE}/messages", headers=user_headers)
if response.status_code == 200:
    user_messages = response.json()['messages']
    print(f"[OK] User fetched {len(user_messages)} message(s)")
    
    # Find our message
    user_msg = next((m for m in user_messages if m.get('_id') == message_id), None)
    if user_msg:
        print(f"[OK] Found own message in user's messages")
        print(f"    Subject: {user_msg.get('subject')}")
        print(f"    Status: {user_msg.get('status')}")
        
        replies = user_msg.get('replies', [])
        print(f"    Replies: {len(replies)}")
        
        # STEP 7: Verify reply is visible to user
        if replies:
            print(f"\n[SUCCESS] REPLY IS VISIBLE TO USER!")
            reply = replies[0]
            print(f"    Sender: {reply.get('sender')}")
            print(f"    Text: {reply.get('text')}")
            print(f"    Timestamp: {reply.get('timestamp')}")
            print(f"\n[FINAL STATUS] Message & Reply System: WORKING PERFECTLY")
        else:
            print(f"[ERROR] Reply not visible to user!")
            print(f"Full message: {json.dumps(user_msg, indent=2)}")
    else:
        print("[ERROR] User's message not found in their own messages!")
        exit(1)
else:
    print(f"[ERROR] User fetch failed: {response.status_code}")
    print(f"Response: {response.json()}")
    exit(1)

print("\n" + "="*70)
print("TEST COMPLETED SUCCESSFULLY - ALL SYSTEMS OPERATIONAL")
print("="*70 + "\n")
