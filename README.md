# Secure Password Manager

A modern web-based password manager built with Flask, HTML, CSS, and JavaScript. This application provides a secure way to store and manage your passwords with a beautiful user interface and dark/light theme support.

## Features

- User authentication (signup/login)
- Secure password storage
- Password visibility toggle
- Copy passwords to clipboard
- Delete passwords
- Dark/Light theme toggle
- Responsive design
- Toast notifications
- Password requirements validation

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Security Features

- Passwords are hashed using Werkzeug's security functions
- Session-based authentication
- Password requirements enforcement
- Secure password storage in JSON files

## Project Structure

```
.
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css  # Styles
│   └── js/
│       └── main.js    # Frontend logic
├── templates/
│   └── index.html     # Main template
├── users.json         # User data
└── passwords.json     # Password data
```

## Usage

1. Create an account using the signup form
2. Log in with your credentials
3. Add passwords for different websites/services
4. Use the copy button to copy passwords to clipboard
5. Toggle between dark and light themes using the theme button
6. Log out when done

## Note

This is a basic password manager for demonstration purposes. For production use, consider:
- Using a proper database instead of JSON files
- Implementing additional security measures
- Adding password encryption
- Using HTTPS
- Adding two-factor authentication 
