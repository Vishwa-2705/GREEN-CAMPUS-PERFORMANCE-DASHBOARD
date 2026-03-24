"""
Complete test of the message reply flow for users
Tests:
1. Admin login
2. User sends message
3. Admin fetches message
4. Admin sends reply
5. User login
6. User fetches their messages with JWT
7. Verify reply is visible in user messages
"""

import requests
import json

API_BASE = "http://localhost:5000/api"

# Test credentials
ADMIN_EMAIL = "admin@greencampus.com"
ADMIN_PASSWORD = "admin123"
USER_EMAIL = "testuser@example.com"
USER_PASSWORD = "user123"

print("\n" + "="*60)
print("COMPLETE MESSAGE REPLY FLOW TEST")
print("="*60)

# 1. Admin login
print("\n1. Admin logging in...")
response = requests.post(f"{API_BASE}/auth/login", json={
    "email": ADMIN_EMAIL,
    "password": ADMIN_PASSWORD
})
if response.status_code == 200:
    admin_data = response.json()
    admin_token = admin_data['access_token']
    print("✓ Admin logged in")
    print(f"  Token: {admin_token[:20]}...")
else:
    print(f"✗ Admin login failed: {response.json()}")
    exit(1)

# 2. Send test message from user
print("\n2. User sending message...")
response = requests.post(f"{API_BASE}/messages/send", json={
    "user_name": "Test User",
    "user_email": USER_EMAIL,
    "subject": "Need help with dashboard",
    "message": "Can someone help me with the energy tracking feature?"
})
if response.status_code == 201:
    message_data = response.json()
    message_id = message_data['message_id']
    print(f"✓ Message sent with ID: {message_id}")
else:
    print(f"✗ Failed to send message: {response.json()}")
    exit(1)

# 3. Admin fetches all messages
print("\n3. Admin fetching all messages...")
headers = {"Authorization": f"Bearer {admin_token}"}
response = requests.get(f"{API_BASE}/messages", headers=headers)
if response.status_code == 200:
    messages = response.json()['messages']
    print(f"✓ Found {len(messages)} message(s)")
    
    # Find our test message
    test_msg = next((m for m in messages if m.get('_id') == message_id), None)
    if test_msg:
        print(f"  Status before reply: {test_msg.get('status')}")
    else:
        print("✗ Could not find our test message")
else:
    print(f"✗ Failed to fetch messages: {response.json()}")
    exit(1)

# 4. Admin sends reply
print("\n4. Admin sending reply...")
response = requests.post(f"{API_BASE}/messages/{message_id}/reply", 
    headers=headers,
    json={"reply_text": "We would be happy to help! The energy tracking feature allows you to monitor real-time power usage."}
)
if response.status_code == 200:
    reply_data = response.json()
    print("✓ Reply sent successfully")
    print(f"  Response: {reply_data}")
else:
    print(f"✗ Failed to send reply: {response.json()}")
    exit(1)

# 5. User login (Register if needed)
print("\n5. User logging in...")
response = requests.post(f"{API_BASE}/auth/login", json={
    "email": USER_EMAIL,
    "password": USER_PASSWORD
})
if response.status_code == 200:
    user_data = response.json()
    user_token = user_data['access_token']
    print("✓ User logged in")
    print(f"  Token: {user_token[:20]}...")
elif response.status_code == 401:
    print("  User not found, registering...")
    response = requests.post(f"{API_BASE}/auth/register", json={
        "email": USER_EMAIL,
        "password": USER_PASSWORD
    })
    if response.status_code == 201:
        user_data = response.json()
        user_token = user_data['access_token']
        print("✓ User registered and logged in")
        print(f"  Token: {user_token[:20]}...")
        
        # Now re-send the message since user account just created
        print("\n  (Re-sending message from user)")
        response = requests.post(f"{API_BASE}/messages/send", json={
            "user_name": "Test User",
            "user_email": USER_EMAIL,
            "subject": "Need help with dashboard",
            "message": "Can someone help me with the energy tracking feature?"
        })
        if response.status_code == 201:
            message_data = response.json()
            message_id = message_data['message_id']
            print(f"✓ Message sent with ID: {message_id}")
            
            # Send reply again
            print("\n  (Sending admin reply again for new message)")
            response = requests.post(f"{API_BASE}/messages/{message_id}/reply", 
                headers=headers,
                json={"reply_text": "We would be happy to help! The energy tracking feature allows you to monitor real-time power usage."}
            )
            if response.status_code == 200:
                print("✓ Reply sent")
    else:
        print(f"✗ Registration failed: {response.json()}")
        exit(1)
else:
    print(f"✗ Login failed: {response.json()}")
    exit(1)

# 6. User fetches their messages with JWT
print("\n6. User fetching their messages with JWT...")
user_headers = {"Authorization": f"Bearer {user_token}"}
response = requests.get(f"{API_BASE}/messages", headers=user_headers)
if response.status_code == 200:
    user_messages = response.json()['messages']
    print(f"✓ User fetched {len(user_messages)} message(s)")
    
    # 7. Verify reply is visible
    if user_messages:
        msg = user_messages[0]
        print(f"\n7. Message Details:")
        print(f"  Subject: {msg.get('subject')}")
        print(f"  Status: {msg.get('status')}")
        
        replies = msg.get('replies', [])
        if replies:
            print(f"  ✓ Found {len(replies)} reply/replies!")
            for i, reply in enumerate(replies):
                print(f"    Reply {i+1}: {reply.get('reply_text', '')[:60]}...")
                print(f"    Timestamp: {reply.get('timestamp')}")
            print("\n✓ SUCCESS: User can see admin replies!")
        else:
            print(f"  ✗ No replies found in message")
            print(f"  Full message: {json.dumps(msg, indent=2)}")
    else:
        print("✗ No messages found for user")
        exit(1)
else:
    print(f"✗ Failed to fetch user messages: {response.json()}")
    exit(1)

print("\n" + "="*60)
print("TEST COMPLETED SUCCESSFULLY")
print("="*60 + "\n")
