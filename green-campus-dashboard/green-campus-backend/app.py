from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from config import Config
from models import User, Message, Dashboard
from email_utils import send_admin_reply_email
from functools import wraps
import os
import json



app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
jwt = JWTManager(app)

# Track if we've initialized default users
_initialized = False

def init_default_users():
    """Create admin and a sample user if they don't exist"""
    global _initialized
    if _initialized:
        return
    
    try:
        admin = User.find_by_email(Config.ADMIN_EMAIL)
        if not admin:
            User.create_user(Config.ADMIN_EMAIL, Config.ADMIN_PASSWORD, role='admin')

        sample_user = User.find_by_email(Config.SAMPLE_USER_EMAIL)
        if not sample_user:
            User.create_user(Config.SAMPLE_USER_EMAIL, Config.SAMPLE_USER_PASSWORD, role='user')
        
        _initialized = True
    except Exception as e:
        # Log but don't prevent app from starting
        print(f"Error initializing default users: {e}")


# Initialize before the first request
@app.before_request
def before_first_request():
    """Called before each request"""
    init_default_users()


# ==================== Authentication Routes ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400
    
    email = data['email']
    password = data['password']
    
    # Check if user already exists
    if User.find_by_email(email):
        return jsonify({'message': 'User already exists'}), 409
    
    # Create new user
    user_id = User.create_user(email, password, role='user')
    
    if user_id:
        # Create JWT with user info as JSON string
        identity_data = json.dumps({'email': email, 'role': 'user'})
        access_token = create_access_token(identity=identity_data)
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'email': email,
                'role': 'user'
            }
        }), 201
    
    return jsonify({'message': 'Registration failed'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user or admin"""
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400
    
    email = data['email']
    password = data['password']
    
    user = User.verify_credentials(email, password)
    
    if user:
        # Create JWT with user info as JSON string
        identity_data = json.dumps({'email': email, 'role': user['role']})
        access_token = create_access_token(identity=identity_data)
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'email': email,
                'role': user['role']
            }
        }), 200
    
    return jsonify({'message': 'Invalid email or password'}), 401


# ==================== Message Routes ====================

@app.route('/api/messages/send', methods=['POST'])
def send_message():
    """Send a message from user"""
    data = request.json
    
    required_fields = ['user_name', 'user_email', 'subject', 'message']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    message_id = Message.create_message(
        data['user_name'],
        data['user_email'],
        data['subject'],
        data['message']
    )
    
    return jsonify({
        'message': 'Message sent successfully',
        'message_id': message_id
    }), 201


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Return dashboard data (energy, water, waste, carbon). Public endpoint."""
    try:
        data = Dashboard.get_dashboard()
        if not data:
            # Return default structure matching frontend
            data = {
                'energyData': [
                    { 'week': 'Week 1', 'current': 120, 'previous': 100 },
                    { 'week': 'Week 2', 'current': 130, 'previous': 110 },
                    { 'week': 'Week 3', 'current': 115, 'previous': 105 },
                    { 'week': 'Week 4', 'current': 140, 'previous': 120 },
                ],
                'waterData': [
                    { 'week': 'Week 1', 'current': 200, 'previous': 180 },
                    { 'week': 'Week 2', 'current': 210, 'previous': 190 },
                    { 'week': 'Week 3', 'current': 195, 'previous': 175 },
                    { 'week': 'Week 4', 'current': 220, 'previous': 200 },
                ],
                'wasteData': [
                    { 'week': 'Week 1', 'current': 80, 'previous': 75 },
                    { 'week': 'Week 2', 'current': 85, 'previous': 80 },
                    { 'week': 'Week 3', 'current': 78, 'previous': 72 },
                    { 'week': 'Week 4', 'current': 90, 'previous': 85 },
                ],
                'carbonData': [
                    { 'week': 'Week 1', 'current': 52, 'previous': 58 },
                    { 'week': 'Week 2', 'current': 49, 'previous': 54 },
                    { 'week': 'Week 3', 'current': 47, 'previous': 51 },
                    { 'week': 'Week 4', 'current': 55, 'previous': 60 },
                ]
            }
        return jsonify({'dashboard': data}), 200
    except Exception as e:
        print(f"[ERROR] Getting dashboard: {e}")
        return jsonify({'message': 'Error retrieving dashboard'}), 500


@app.route('/api/dashboard', methods=['PUT'])
@jwt_required()
def update_dashboard():
    """Update dashboard data (admin only)"""
    try:
        identity_str = get_jwt_identity()
        identity = json.loads(identity_str)
        if identity.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized - Admin only'}), 403

        data = request.json
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        # Validate expected keys
        dashboard = {
            'energyData': data.get('energyData', []),
            'waterData': data.get('waterData', []),
            'wasteData': data.get('wasteData', []),
            'carbonData': data.get('carbonData', [])
        }

        Dashboard.save_dashboard(dashboard)
        return jsonify({'message': 'Dashboard updated successfully'}), 200
    except Exception as e:
        print(f"[ERROR] Updating dashboard: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error updating dashboard'}), 500


@app.route('/api/messages', methods=['GET'])
@jwt_required()
def get_messages():
    """Get all messages (admin only) or user's messages"""
    try:
        identity_str = get_jwt_identity()
        identity = json.loads(identity_str)  # Parse JSON string back to dict
        print(f"[DEBUG] Getting messages for identity: {identity}")
        
        if identity.get('role') == 'admin':
            # Admin gets all messages
            messages = Message.get_all_messages()
            print(f"[DEBUG] Retrieved {len(messages)} messages for admin")
        elif identity.get('role') == 'user':
            # User gets only their own messages
            user_email = identity.get('email')
            all_messages = Message.get_all_messages()
            messages = [msg for msg in all_messages if msg.get('user_email') == user_email]
            print(f"[DEBUG] Retrieved {len(messages)} messages for user: {user_email}")
        else:
            return jsonify({'message': 'Unauthorized - Invalid role'}), 403
        
        # Convert any datetime objects to strings for JSON serialization
        for msg in messages:
            if isinstance(msg.get('created_at'), str):
                msg['created_at'] = msg['created_at']
            for reply in msg.get('replies', []):
                if isinstance(reply.get('timestamp'), str):
                    reply['timestamp'] = reply['timestamp']
        
        return jsonify({'messages': messages}), 200
    except Exception as e:
        print(f"[ERROR] Getting messages: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Error retrieving messages: {str(e)}'}), 500


@app.route('/api/messages/<message_id>', methods=['GET'])
@jwt_required()
def get_message(message_id):
    """Get a specific message"""
    message = Message.get_message_by_id(message_id)
    
    if not message:
        return jsonify({'message': 'Message not found'}), 404
    
    return jsonify({'message': message}), 200


@app.route('/api/messages/<message_id>/reply', methods=['POST'])
@jwt_required()
def reply_to_message(message_id):
    """Add admin reply to message and send email"""
    identity_str = get_jwt_identity()
    identity = json.loads(identity_str)  # Parse JSON string back to dict
    
    # Only admin can reply
    if identity.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.json
    
    if not data or not data.get('reply_text'):
        return jsonify({'message': 'Reply text required'}), 400
    
    # Get the message
    message = Message.get_message_by_id(message_id)
    if not message:
        return jsonify({'message': 'Message not found'}), 404
    
    # Add reply to database
    Message.add_reply(message_id, data['reply_text'])
    
    # Send email to user
    email_sent = send_admin_reply_email(
        message['user_email'],
        message['user_name'],
        message['subject'],
        data['reply_text']
    )
    
    return jsonify({
        'message': 'Reply sent successfully',
        'email_sent': email_sent
    }), 200


@app.route('/api/messages/<message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    """Delete a message (admin only)"""
    identity_str = get_jwt_identity()
    identity = json.loads(identity_str)  # Parse JSON string back to dict
    
    if identity.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if Message.delete_message(message_id):
        return jsonify({'message': 'Message deleted successfully'}), 200
    
    return jsonify({'message': 'Message not found'}), 404


@app.route('/api/messages/<message_id>/read', methods=['PUT'])
@jwt_required()
def mark_message_read(message_id):
    """Mark message as read"""
    Message.mark_as_read(message_id)
    return jsonify({'message': 'Message marked as read'}), 200


# ==================== Health Check ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200


@app.route('/api/test-jwt', methods=['GET'])
@jwt_required()
def test_jwt():
    """Test JWT identity"""
    try:
        identity_str = get_jwt_identity()
        identity = json.loads(identity_str)  # Parse JSON string back to dict
        return jsonify({
            'status': 'ok',
            'identity': identity,
            'type': type(identity).__name__
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

import os

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
