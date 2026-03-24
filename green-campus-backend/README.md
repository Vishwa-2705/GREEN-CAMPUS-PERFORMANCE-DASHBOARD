# Green Campus Dashboard - Backend

Python Flask backend for Green Campus Dashboard with MongoDB integration.

## Features

- User authentication (login/register)
- Admin message management
- Email notifications for admin replies
- JWT token-based authentication
- CORS enabled for frontend communication

## Credentials

**Admin Account:**
- Email: `admin@greencampus.com`
- Password: `admin123`

**Users:**
- Can register new accounts or login
- Can send messages to admin
- Receive email notifications when admin replies

## Setup Instructions

### Prerequisites
- Python 3.8+
- MongoDB installed and running
- Gmail account (for email notifications)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd green-campus-backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   - Edit `.env` file with your settings:
     - `MONGODB_URI`: Your MongoDB connection string
     - `EMAIL_ADDRESS`: Your Gmail address
     - `EMAIL_PASSWORD`: Your Gmail app password (not regular password)

6. **Start MongoDB:**
   - If using local MongoDB:
     ```bash
     mongod
     ```

7. **Run the Flask app:**
   ```bash
   python app.py
   ```

   The backend will start at `http://localhost:5000`

## API Endpoints

### Authentication

**Register User:**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login:**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com or admin@greencampus.com",
  "password": "password"
}
```

### Messages (Admin Only)

**Send Message (from user):**
```
POST /api/messages/send
Content-Type: application/json

{
  "user_name": "John Doe",
  "user_email": "user@example.com",
  "subject": "Energy Inquiry",
  "message": "How can I reduce energy consumption?"
}
```

**Get All Messages:**
```
GET /api/messages
Authorization: Bearer {access_token}
```

**Get Specific Message:**
```
GET /api/messages/{message_id}
Authorization: Bearer {access_token}
```

**Reply to Message (Admin Only):**
```
POST /api/messages/{message_id}/reply
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reply_text": "Thank you for your inquiry. Here's the answer..."
}
```

**Delete Message (Admin Only):**
```
DELETE /api/messages/{message_id}
Authorization: Bearer {access_token}
```

**Mark Message as Read:**
```
PUT /api/messages/{message_id}/read
Authorization: Bearer {access_token}
```

## Gmail Setup for Email Notifications

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail and Windows
   - Copy the generated password
3. Use this password in `.env` as `EMAIL_PASSWORD`

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "string (hashed in production)",
  "role": "admin|user",
  "created_at": "datetime"
}
```

### Messages Collection
```json
{
  "_id": "ObjectId",
  "user_name": "string",
  "user_email": "string",
  "subject": "string",
  "message": "string",
  "status": "unread|read|replied",
  "created_at": "datetime",
  "replies": [
    {
      "sender": "Admin",
      "text": "string",
      "timestamp": "datetime"
    }
  ]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/green_campus |
| JWT_SECRET_KEY | JWT signing key | your-secret-key-change-in-production |
| ADMIN_EMAIL | Admin email for login | admin@greencampus.com |
| ADMIN_PASSWORD | Admin password | admin123 |
| SMTP_SERVER | Email server | smtp.gmail.com |
| SMTP_PORT | Email port | 587 |
| EMAIL_ADDRESS | Sender email address | your-email@gmail.com |
| EMAIL_PASSWORD | Email password/app password | your-app-password |

## Frontend Integration

The frontend should:
1. Call `/api/auth/login` with admin/user credentials
2. Store the access token received
3. Use token in Authorization header for protected endpoints
4. Send messages to users via `/api/messages/send`
5. Display admin replies to messages

## Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`

**Email Not Sending:**
- Verify Gmail app password is correct
- Check 2FA is enabled on account
- Try with a test email first

**CORS Errors:**
- Ensure frontend URL is in CORS origins in `app.py`
- Update origins if frontend runs on different port

## Security Notes

- **Important**: Hash passwords using bcrypt in production
- Change JWT_SECRET_KEY in production
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Add input validation and sanitization
