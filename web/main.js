// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const addPasswordForm = document.getElementById('add-password-form');
const passwordList = document.getElementById('password-list');
const themeToggle = document.getElementById('theme-toggle');
const authThemeToggle = document.getElementById('auth-theme-toggle');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const toast = document.getElementById('toast');
const passwordHistoryModal = document.getElementById('password-history-modal');
const closeModalBtn = document.querySelector('.close-modal');

// Add at the top with other DOM elements
const newPasswordInput = document.getElementById('new-password');
const newPasswordToggle = document.getElementById('toggle-new-password');
const signupPasswordInput = document.getElementById('signup-password');

// Theme Management
let currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcons();

// Event Listeners
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);
addPasswordForm.addEventListener('submit', handleAddPassword);
themeToggle.addEventListener('click', toggleTheme);
authThemeToggle.addEventListener('click', toggleTheme);
logoutBtn.addEventListener('click', handleLogout);
closeModalBtn.addEventListener('click', () => passwordHistoryModal.classList.remove('active'));

// Password strength check
if (newPasswordInput) {
    newPasswordInput.addEventListener('input', checkPasswordStrength);
}

if (signupPasswordInput) {
    signupPasswordInput.addEventListener('input', function(e) {
        checkPasswordStrength(e, this.closest('.form-group').querySelector('.password-strength'));
    });
}

// Add event listener for the new password toggle
if (newPasswordToggle) {
    newPasswordToggle.addEventListener('click', function() {
        togglePasswordVisibility(this);
    });
}

// Functions
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    loginForm.classList.toggle('hidden', tab !== 'login');
    signupForm.classList.toggle('hidden', tab !== 'signup');
}

function togglePasswordVisibility(button) {
    const passwordField = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.className = 'fas fa-eye-slash';
        button.setAttribute('data-tooltip', 'Hide Password');
    } else {
        passwordField.type = 'password';
        icon.className = 'fas fa-eye';
        button.setAttribute('data-tooltip', 'Show Password');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        console.log('Attempting login...');
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log('Login response:', data);

        if (data.success) {
            showToast(data.message, 'success');
            usernameDisplay.textContent = username;
            authSection.classList.add('hidden');
            dashboard.classList.remove('hidden');
            dashboard.classList.add('active');
            console.log('Loading passwords...');
            loadPasswords();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (data.success) {
            showToast(data.message, 'success');
            switchTab('login');
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('An error occurred', 'error');
    }
}

async function handleAddPassword(e) {
    e.preventDefault();
    const website = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    const url = document.getElementById('url').value;
    const password = document.getElementById('new-password').value;
    const notes = document.getElementById('notes').value;

    try {
        const response = await fetch('/add_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                website, 
                username, 
                url, 
                password, 
                notes,
                timestamp: new Date().toISOString()
            })
        });
        const data = await response.json();

        if (data.success) {
            showToast(data.message, 'success');
            e.target.reset();
            loadPasswords();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('An error occurred', 'error');
    }
}

async function handleRemovePassword(website) {
    try {
        const response = await fetch('/remove_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ website })
        });
        const data = await response.json();

        if (data.success) {
            showToast(data.message, 'success');
            loadPasswords();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('An error occurred', 'error');
    }
}

async function loadPasswords() {
    try {
        console.log('Fetching passwords...');
        const response = await fetch('/get_passwords');
        const data = await response.json();
        console.log('Passwords response:', data);

        if (data.success) {
            passwordList.innerHTML = '';
            Object.entries(data.passwords).forEach(([website, info]) => {
                const item = createPasswordItem(website, info);
                passwordList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error loading passwords:', error);
        showToast('Error loading passwords', 'error');
    }
}

function createPasswordItem(website, data) {
    const item = document.createElement('div');
    item.className = 'password-item';
    
    // Format timestamp
    const timestamp = new Date(data.timestamp);
    const formattedDate = timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    item.innerHTML = `
        <div class="password-item-header">
            <div class="password-info">
                <h4>${website}</h4>
                <p class="timestamp">
                    <i class="fas fa-clock"></i>
                    Last modified: ${formattedDate}
                </p>
            </div>
            <div class="password-actions">
                <button class="btn-icon view-history" data-tooltip="View Password History" onclick="showPasswordHistory('${website}')">
                    <i class="fas fa-history"></i>
                </button>
                <button class="btn-icon delete-password" data-tooltip="Delete Password" onclick="deletePassword('${website}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="password-details">
            ${data.username ? `
                <p>
                    <i class="fas fa-user"></i>
                    <strong>Username:</strong> ${data.username}
                </p>
            ` : ''}
            ${data.url ? `
                <p>
                    <i class="fas fa-link"></i>
                    <strong>URL:</strong>
                    <a href="${data.url}" target="_blank" class="url-link">
                        <i class="fas fa-external-link-alt"></i>
                        ${data.url}
                    </a>
                </p>
            ` : ''}
            <p>
                <i class="fas fa-key"></i>
                <strong>Password:</strong>
                <div class="password-field">
                    <input type="password" value="${data.password}" readonly>
                    <button class="btn-icon toggle-password" data-tooltip="Show Password" onclick="togglePasswordVisibility(this)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon copy-password" data-tooltip="Copy Password" onclick="copyToClipboard(this, '${data.password}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </p>
        </div>
        ${data.notes ? `
            <div class="notes-section">
                <p>
                    <i class="fas fa-sticky-note"></i>
                    <strong>Notes:</strong> ${data.notes}
                </p>
            </div>
        ` : ''}
    `;
    
    return item;
}

function showPasswordHistory(website) {
    const historyList = document.getElementById('password-history-list');
    historyList.innerHTML = `
        <h4>Password History for ${website}</h4>
        <p>No password history available</p>
    `;
    passwordHistoryModal.classList.add('active');
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcons();
}

function updateThemeIcons() {
    // Only update theme toggle icons
    const themeIcons = document.querySelectorAll('#theme-toggle i, #auth-theme-toggle i');
    themeIcons.forEach(icon => {
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    });
}

function handleLogout() {
    window.location.href = '/logout';
}

let lastDeletedPassword = null;

function showToast(message, type = 'info', showUndo = false) {
    if (showUndo) {
        toast.innerHTML = `
            ${message}
            <button class="toast-undo" onclick="undoDelete()">Undo</button>
        `;
    } else {
        toast.textContent = message;
    }
    toast.className = `toast show ${type}`;
    
    if (!showUndo) {
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
}

function checkPasswordStrength(event, container = null) {
    const password = event.target.value;
    const strengthContainer = container || event.target.closest('.form-group').querySelector('.password-strength');
    const strengthMeter = strengthContainer.querySelector('.strength-meter-fill');
    const strengthText = strengthContainer.querySelector('.strength-text span');
    const requirements = strengthContainer.querySelectorAll('.password-requirements li');
    
    // Reset requirements
    requirements.forEach(req => {
        const icon = req.querySelector('i');
        icon.className = 'fas fa-times';
        icon.style.color = 'var(--danger-color)';
    });
    
    // Check requirements
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Update requirement icons
    if (hasLength) {
        const lengthReq = strengthContainer.querySelector('[data-requirement="length"] i');
        lengthReq.className = 'fas fa-check';
        lengthReq.style.color = 'var(--success-color)';
    }
    if (hasUppercase) {
        const upperReq = strengthContainer.querySelector('[data-requirement="uppercase"] i');
        upperReq.className = 'fas fa-check';
        upperReq.style.color = 'var(--success-color)';
    }
    if (hasLowercase) {
        const lowerReq = strengthContainer.querySelector('[data-requirement="lowercase"] i');
        lowerReq.className = 'fas fa-check';
        lowerReq.style.color = 'var(--success-color)';
    }
    if (hasNumber) {
        const numberReq = strengthContainer.querySelector('[data-requirement="number"] i');
        numberReq.className = 'fas fa-check';
        numberReq.style.color = 'var(--success-color)';
    }
    if (hasSpecial) {
        const specialReq = strengthContainer.querySelector('[data-requirement="special"] i');
        specialReq.className = 'fas fa-check';
        specialReq.style.color = 'var(--success-color)';
    }
    
    // Calculate strength
    const strength = [hasLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    // Update strength meter
    strengthMeter.dataset.strength = strength;
    
    // Update strength text
    let strengthMessage = 'Too weak';
    if (strength === 5) strengthMessage = 'Very strong';
    else if (strength === 4) strengthMessage = 'Strong';
    else if (strength === 3) strengthMessage = 'Medium';
    else if (strength === 2) strengthMessage = 'Weak';
    
    strengthText.textContent = strengthMessage;
}

function copyToClipboard(button, text) {
    navigator.clipboard.writeText(text).then(() => {
        const icon = button.querySelector('i');
        
        // Change icon to checkmark
        icon.className = 'fas fa-check';
        button.classList.add('copied');
        button.setAttribute('data-tooltip', 'Copied!');
        
        // Show toast
        showToast('Password copied to clipboard', 'success');
        
        // Reset after 2 seconds
        setTimeout(() => {
            icon.className = 'fas fa-copy';
            button.classList.remove('copied');
            button.setAttribute('data-tooltip', 'Copy Password');
        }, 2000);
    }).catch(() => {
        showToast('Failed to copy password', 'error');
    });
}

function undoDelete() {
    if (lastDeletedPassword) {
        fetch('/add_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lastDeletedPassword)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Password restored successfully', 'success');
                loadPasswords();
                lastDeletedPassword = null;
            } else {
                showToast(data.message || 'Failed to restore password', 'error');
            }
        })
        .catch(error => {
            showToast('Error restoring password', 'error');
        });
    }
    toast.className = 'toast';
}

function deletePassword(website) {
    if (confirm(`Are you sure you want to delete the password for ${website}?`)) {
        // Store the password data before deleting
        fetch('/get_passwords')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.passwords[website]) {
                    lastDeletedPassword = {
                        website: website,
                        ...data.passwords[website]
                    };
                    
                    // Now proceed with deletion
                    return fetch('/remove_password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ website })
                    });
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Password deleted successfully', 'success', true);
                    loadPasswords();
                } else {
                    showToast(data.message || 'Failed to delete password', 'error');
                }
            })
            .catch(error => {
                showToast('Error deleting password', 'error');
            });
    }
}

// Check if user is logged in
console.log('Checking login status...');
fetch('/get_passwords')
    .then(response => response.json())
    .then(data => {
        console.log('Initial login check:', data);
        if (data.success) {
            authSection.classList.add('hidden');
            dashboard.classList.remove('hidden');
            dashboard.classList.add('active');
            loadPasswords();
        }
    })
    .catch(error => {
        console.error('Initial login check error:', error);
    }); 
