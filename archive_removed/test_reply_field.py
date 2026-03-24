import requests
API_BASE = 'http://localhost:5000/api'

# User login
resp = requests.post(f'{API_BASE}/auth/login', json={'email': 'testuser@example.com', 'password': 'user123'})
if resp.status_code != 200:
    resp = requests.post(f'{API_BASE}/auth/register', json={'email': 'testuser@example.com', 'password': 'user123'})
user_token = resp.json()['access_token']

# Send message
resp = requests.post(f'{API_BASE}/messages/send', json={'user_name': 'Test', 'user_email': 'testuser@example.com', 'subject': 'Test', 'message': 'Test'})
msg_id = resp.json()['message_id']
print(f'Message ID: {msg_id}')

# Admin reply
resp = requests.post(f'{API_BASE}/auth/login', json={'email': 'admin@greencampus.com', 'password': 'admin123'})
admin_token = resp.json()['access_token']
resp = requests.post(f'{API_BASE}/messages/{msg_id}/reply', headers={'Authorization': f'Bearer {admin_token}'}, json={'reply_text': 'Thanks for reaching out'})
print(f'Reply status: {resp.status_code}')

# User fetch
resp = requests.get(f'{API_BASE}/messages', headers={'Authorization': f'Bearer {user_token}'})
messages = resp.json()['messages']
print(f'User fetched {len(messages)} messages')

msg = messages[0]
print(f'Status: {msg.get("status")}')
print(f'Replies: {len(msg.get("replies", []))}')

if msg.get('replies'):
    reply = msg['replies'][0]
    print(f'Reply keys: {list(reply.keys())}')
    print(f'Reply text: {reply.get("text")}')
    print(f'Reply sender: {reply.get("sender")}')
else:
    print('No replies found')
