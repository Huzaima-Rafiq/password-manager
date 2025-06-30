from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'fallback-secret-key-for-development-only')

# File paths
USERS_FILE = 'users.json'
PASSWORDS_FILE = 'passwords.json'

# Helper functions
def load_users():
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

def load_passwords():
    """Load passwords from JSON file"""
    if os.path.exists(PASSWORDS_FILE):
        with open(PASSWORDS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_passwords(passwords):
    """Save passwords to JSON file"""
    with open(PASSWORDS_FILE, 'w') as f:
        json.dump(passwords, f, indent=4)

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'})
        
        users = load_users()
        
        if username not in users:
            return jsonify({'success': False, 'message': 'Invalid username or password'})
        
        # Check password using werkzeug's check_password_hash
        if check_password_hash(users[username], password):
            session['username'] = username
            return jsonify({'success': True, 'message': 'Login successful'})
        else:
            return jsonify({'success': False, 'message': 'Invalid username or password'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred during login'})

@app.route('/signup', methods=['POST'])
def signup():
    """Handle user signup"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'})
        
        users = load_users()
        
        if username in users:
            return jsonify({'success': False, 'message': 'Username already exists'})
        
        # Hash password and save user
        hashed_password = generate_password_hash(password)
        users[username] = hashed_password
        save_users(users)
        
        # Initialize empty password storage for new user
        passwords = load_passwords()
        if username not in passwords:
            passwords[username] = {}
            save_passwords(passwords)
        
        return jsonify({'success': True, 'message': 'Account created successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred during signup'})

@app.route('/logout')
def logout():
    """Handle user logout"""
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/get_passwords')
def get_passwords():
    """Get user's passwords"""
    try:
        if 'username' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'})
        
        username = session['username']
        passwords = load_passwords()
        user_passwords = passwords.get(username, {})
        
        return jsonify({'success': True, 'passwords': user_passwords})
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error loading passwords'})

@app.route('/add_password', methods=['POST'])
def add_password():
    """Add a new password"""
    try:
        if 'username' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'})
        
        data = request.get_json()
        website = data.get('website')
        username_field = data.get('username')
        password = data.get('password')
        url = data.get('url', '')
        notes = data.get('notes', '')
        
        if not website or not password:
            return jsonify({'success': False, 'message': 'Website and password are required'})
        
        username = session['username']
        passwords = load_passwords()
        
        if username not in passwords:
            passwords[username] = {}
        
        passwords[username][website] = {
            'password': password,
            'username': username_field or '',
            'url': url,
            'notes': notes,
            'timestamp': datetime.now().isoformat()
        }
        
        save_passwords(passwords)
        
        return jsonify({'success': True, 'message': 'Password added successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error adding password'})

@app.route('/remove_password', methods=['POST'])
def remove_password():
    """Remove a password"""
    try:
        if 'username' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'})
        
        data = request.get_json()
        website = data.get('website')
        
        if not website:
            return jsonify({'success': False, 'message': 'Website is required'})
        
        username = session['username']
        passwords = load_passwords()
        
        if username in passwords and website in passwords[username]:
            del passwords[username][website]
            save_passwords(passwords)
            return jsonify({'success': True, 'message': 'Password deleted successfully'})
        else:
            return jsonify({'success': False, 'message': 'Password not found'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error removing password'})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
