# Green Campus Dashboard - Complete Setup Guide

## What's Been Done

### 1. ✅ Dashboard Width Fixed
- Energy dashboard is now as wide as Water dashboard
- Removed `max-width: 1200px` constraint from Energy.css
- Now uses full viewport width with proper padding

### 2. ✅ Admin/User Badges Enhanced
- **Bigger badges** - Increased size with flexbox alignment
- **Centered properly** - Using `display: flex` with `justify-content: center`
- **Better styling** - Added semi-transparent borders

### 3. ✅ Logout Button Color Changed
- Changed to green (#27ae60) - matches the theme
- Hover state is darker green (#229954)
- Consistent across both admin and user sidebars

### 4. ✅ Messaging System with Backend Integration
- Users send messages → Messages stored in MongoDB
- Admin receives and reads messages
- Admin replies to messages → Reply sent to user via email
- Admin can delete messages

## System Architecture

```
Frontend (React) ←→ Backend (Flask) ←→ MongoDB
                   ↓
              Email Service (Gmail)
```

## Login Credentials

### Admin
- **Email:** admin@greencampus.com
- **Password:** admin123

### User
- Register new account with any email and password
- Will receive email when admin replies

## Backend Setup Instructions

### Prerequisites
- Python 3.8+
- MongoDB installed and running locally
- Gmail account (for email notifications)

### Step 1: Navigate to Backend Directory
```bash
cd green-campus-backend
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Edit `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/green_campus
JWT_SECRET_KEY=your-secret-key-change-in-production
ADMIN_EMAIL=admin@greencampus.com
ADMIN_PASSWORD=admin123
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Step 5: Start MongoDB
```bash
# Windows (if MongoDB is installed)
mongod

# Or use MongoDB Docker container
docker run -d -p 27017:27017 --name mongodb mongo
```

### Step 6: Run Flask Backend
```bash
python app.py
```

Backend will run on: `http://localhost:5000`

## Gmail Setup for Email Notifications

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows"
3. Generate the app password
4. Copy and paste into `.env` as `EMAIL_PASSWORD`

## Frontend Configuration

The frontend is already configured to connect to the backend at `http://localhost:5000`

- API calls are in `src/api/apiService.js`
- All endpoints use JWT authentication
- Credentials stored in localStorage

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user/admin

### Messages (Admin Only - Requires JWT Token)
- `GET /api/messages` - Get all messages
- `GET /api/messages/{id}` - Get specific message
- `POST /api/messages/send` - Send message from user
- `POST /api/messages/{id}/reply` - Add admin reply (sends email)
- `DELETE /api/messages/{id}` - Delete message
- `PUT /api/messages/{id}/read` - Mark as read

## Admin Message Management Workflow

1. **Admin logs in** with admin@greencampus.com / admin123
2. **Navigates to Contact Us** in sidebar
3. **Sees all user messages** in the Messages dashboard
4. **Selects a message** to view details and conversation
5. **Types reply** in the reply textarea
6. **Clicks "Send Reply"** - reply is added to database AND email is sent to user
7. **Can delete messages** using the delete button

## User Message Sending Workflow

1. **User registers or logs in**
2. **Navigates to Contact Us** in sidebar
3. **Fills out the form** (Name, Email, Subject, Message)
4. **Clicks "Send Message"** - message is stored in database
5. **Receives success notification**
6. **Waits for admin reply** - will receive email when admin responds

## File Structure

### Backend
```
green-campus-backend/
├── app.py                 # Flask main application
├── config.py             # Configuration settings
├── models.py             # MongoDB models
├── email_utils.py        # Email utility functions
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
└── README.md            # Backend documentation
```

### Frontend (Updated)
```
green-campus-frontend/
├── src/
│   ├── api/
│   │   └── apiService.js          # All API calls
│   ├── context/
│   │   └── MessagesContext.jsx    # Message state management
│   ├── pages/
│   │   └── Login.jsx              # Updated with API
│   ├── adminDashboard/
│   │   ├── Messages.jsx           # Admin message inbox
│   │   ├── Messages.css
│   │   └── ContactUs.jsx          # Routes to Messages
│   └── userDashboard/
│       ├── UserContactUs.jsx      # Send message form
│       └── UserContactUs.css
└── ...
```

## Running Both Frontend & Backend

### Terminal 1 - Backend
```bash
cd green-campus-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

### Terminal 2 - Frontend
```bash
cd green-campus-frontend
npm run dev
```

Then visit: `http://localhost:5173`

## Testing the System

### Test Flow

1. **Start Backend** (on port 5000)
2. **Start Frontend** (on port 5173)
3. **Login as Admin**
   - Email: admin@greencampus.com
   - Password: admin123
4. **Open another browser/incognito window**
5. **Register as User** with any email (must be valid for testing)
6. **User sends message** via Contact Us
7. **Admin sees message** in Contact Us → Messages inbox
8. **Admin replies** - email is sent to user
9. **User receives email** with admin's reply

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- Try MongoDB URI: `mongodb://localhost:27017/green_campus`

### Email Not Sending
- Verify Gmail app password is correct
- Ensure 2FA is enabled on Google account
- Check `.env` EMAIL_ADDRESS and EMAIL_PASSWORD
- Try sending test email manually

### CORS Errors
- Backend CORS is configured for `http://localhost:5173`
- If frontend runs on different port, update CORS in `app.py`

### JWT Token Errors
- Make sure token is stored in localStorage
- Token is automatically set on login
- Clear localStorage if issues persist: `localStorage.clear()`

## Security Notes

**Important for Production:**
1. Hash passwords using bcrypt (currently plain text for demo)
2. Change JWT_SECRET_KEY
3. Use environment variables for all sensitive data
4. Implement rate limiting on API endpoints
5. Add input validation and sanitization
6. Use HTTPS instead of HTTP
7. Implement refresh token mechanism

## Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password": "hashed_password",
  "role": "admin|user",
  "created_at": ISODate("2024-02-09T10:00:00.000Z")
}
```

### Messages Collection
```json
{
  "_id": ObjectId,
  "user_name": "John Doe",
  "user_email": "user@example.com",
  "subject": "Energy Inquiry",
  "message": "How can I reduce energy?",
  "status": "unread|read|replied",
  "created_at": ISODate("2024-02-09T10:00:00.000Z"),
  "replies": [
    {
      "sender": "Admin",
      "text": "Here's the answer...",
      "timestamp": ISODate("2024-02-09T11:00:00.000Z")
    }
  ]
}
```

## Next Steps (Optional Enhancements)

1. Add user profile management
2. Implement message search functionality
3. Add email notification preferences
4. Create admin dashboard statistics
5. Add message scheduling
6. Implement two-factor authentication
7. Add message attachments support
8. Create audit logs for admin actions

## Support

For issues or questions:
- Check the API documentation in backend README.md
- Review error messages in browser console
- Check MongoDB logs for database errors
- Check Flask console for backend errors

---

**System is now ready for use!** 🚀
