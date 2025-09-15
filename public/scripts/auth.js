// Authentication Module

class AuthManager {
    constructor(app) {
        this.app = app;
        this.setupAuthEventListeners();
    }
    
    setupAuthEventListeners() {
        // Auth tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchAuthTab(tab.dataset.tab);
            });
        });
        
        // Sign in form
        document.getElementById('signinForm')?.addEventListener('submit', this.handleSignIn.bind(this));
        
        // Sign up form
        document.getElementById('signupForm')?.addEventListener('submit', this.handleSignUp.bind(this));
    }
    
    switchAuthTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.querySelector(`[data-form="${tabName}"]`).classList.add('active');
    }
    
    async handleSignIn(e) {
        e.preventDefault();
        
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;
        
        if (!email || !password) {
            this.app.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.app.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.app.currentUser = data.user;
                this.app.updateAuthUI();
                this.app.hideModal(document.getElementById('authModal'));
                this.app.showNotification(`Welcome back, ${data.user.name}!`, 'success');
                
                // Update product prices based on account type
                this.app.renderProducts(this.app.products);
            } else {
                this.app.showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.app.showNotification('Login failed. Please try again.', 'error');
        }
    }
    
    async handleSignUp(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const accountType = document.getElementById('accountType').value;
        
        if (!name || !email || !password || !accountType) {
            this.app.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.app.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.app.apiBaseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, accountType })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.app.currentUser = data.user;
                this.app.updateAuthUI();
                this.app.hideModal(document.getElementById('authModal'));
                this.app.showNotification(`Account created successfully! Welcome, ${data.user.name}!`, 'success');
                
                // Update product prices based on account type
                this.app.renderProducts(this.app.products);
            } else {
                this.app.showNotification(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.app.showNotification('Registration failed. Please try again.', 'error');
        }
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validatePassword(password) {
        // At least 6 characters, one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        return passwordRegex.test(password);
    }
}

// Initialize auth manager when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.authManager = new AuthManager(window.app);
    } else {
        // Wait for app to be initialized
        setTimeout(() => {
            window.authManager = new AuthManager(window.app);
        }, 100);
    }
});