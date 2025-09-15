// Authentication Module

class AuthManager {
    constructor(app) {
        this.app = app;
        this.users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
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
        
        // Forgot password
        document.getElementById('forgotPasswordLink')?.addEventListener('click', this.handleForgotPassword.bind(this));
        
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', this.handleLogout.bind(this));
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
        
        // Simulate loading
        this.showLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check user credentials
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Login successful
            delete user.password; // Don't store password in session
            this.currentUser = {
                ...user,
                lastLogin: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.showLoading(false);
            this.app.showNotification(`Welcome back, ${user.firstName}!`, 'success');
            this.app.updateAuthUI();
            this.app.hideModal(document.getElementById('authModal'));
            
            // Update user's login history
            this.updateLoginHistory(user.email);
        } else {
            // Login failed
            this.showLoading(false);
            this.app.showNotification('Invalid email or password', 'error');
        }
    }
    
    async handleSignUp(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('signupFirstName').value;
        const lastName = document.getElementById('signupLastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const accountType = document.getElementById('accountType').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            this.app.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.app.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.app.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.app.showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (!agreeTerms) {
            this.app.showNotification('Please accept the terms and conditions', 'error');
            return;
        }
        
        // Check if user already exists
        if (this.users.some(u => u.email === email)) {
            this.app.showNotification('An account with this email already exists', 'error');
            return;
        }
        
        // Simulate loading
        this.showLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            password, // In production, this would be hashed
            accountType,
            createdAt: new Date().toISOString(),
            isActive: true,
            preferences: {
                newsletter: true,
                promotions: true,
                recommendations: true
            },
            profile: {
                phone: '',
                birthday: '',
                gender: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: ''
                }
            },
            loginHistory: []
        };
        
        this.users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(this.users));
        
        // Auto login new user
        delete newUser.password;
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        this.showLoading(false);
        this.app.showNotification(`Welcome to Tees By Shelsea, ${firstName}!`, 'success');
        this.app.updateAuthUI();
        this.app.hideModal(document.getElementById('authModal'));
        
        // Send welcome notification
        this.sendWelcomeNotification(newUser);
    }
    
    handleForgotPassword(e) {
        e.preventDefault();
        
        const email = prompt('Please enter your email address:');
        if (!email) return;
        
        if (!this.validateEmail(email)) {
            this.app.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        const user = this.users.find(u => u.email === email);
        if (user) {
            // In production, this would send an actual email
            this.app.showNotification('Password reset instructions sent to your email', 'success');
        } else {
            this.app.showNotification('No account found with that email address', 'error');
        }
    }
    
    handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.app.updateAuthUI();
            this.app.showNotification('Signed out successfully', 'success');
            
            // Clear any sensitive data
            this.clearSensitiveData();
        }
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showLoading(show) {
        const signinBtn = document.getElementById('signinBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        if (show) {
            if (signinBtn) {
                signinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
                signinBtn.disabled = true;
            }
            if (signupBtn) {
                signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
                signupBtn.disabled = true;
            }
        } else {
            if (signinBtn) {
                signinBtn.innerHTML = 'Sign In';
                signinBtn.disabled = false;
            }
            if (signupBtn) {
                signupBtn.innerHTML = 'Create Account';
                signupBtn.disabled = false;
            }
        }
    }
    
    updateLoginHistory(email) {
        const user = this.users.find(u => u.email === email);
        if (user) {
            if (!user.loginHistory) user.loginHistory = [];
            user.loginHistory.push({
                timestamp: new Date().toISOString(),
                ip: 'xxx.xxx.xxx.xxx', // Would be actual IP in production
                userAgent: navigator.userAgent
            });
            
            // Keep only last 10 logins
            if (user.loginHistory.length > 10) {
                user.loginHistory = user.loginHistory.slice(-10);
            }
            
            localStorage.setItem('registeredUsers', JSON.stringify(this.users));
        }
    }
    
    sendWelcomeNotification(user) {
        // In production, this would trigger email/SMS
        console.log(`Welcome notification sent to ${user.email}`);
        
        // Show welcome tips
        setTimeout(() => {
            this.app.showNotification('💡 Tip: Check out our wholesale prices for bulk orders!', 'info');
        }, 3000);
    }
    
    clearSensitiveData() {
        // Clear cart, saved forms, etc.
        localStorage.removeItem('savedShippingAddress');
        
        // Clear any cached payment methods (in production)
        // clearPaymentTokens();
    }
    
    // Get user preferences
    getUserPreferences() {
        return this.currentUser?.preferences || {
            newsletter: true,
            promotions: true,
            recommendations: true
        };
    }
    
    // Update user profile
    updateUserProfile(profileData) {
        if (!this.currentUser) return false;
        
        this.currentUser.profile = { ...this.currentUser.profile, ...profileData };
        this.currentUser.updatedAt = new Date().toISOString();
        
        // Update in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], profile: this.currentUser.profile };
            localStorage.setItem('registeredUsers', JSON.stringify(this.users));
        }
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        return true;
    }
    
    // Get account type pricing
    getPrice(product) {
        if (!this.currentUser) return product.retailPrice;
        
        return this.currentUser.accountType === 'wholesale' 
            ? product.wholesalePrice 
            : product.retailPrice;
    }
    
    // Check if user has wholesale access
    hasWholesaleAccess() {
        return this.currentUser?.accountType === 'wholesale';
    }
    
    // Get user's order history (mock data)
    getOrderHistory() {
        if (!this.currentUser) return [];
        
        // In production, this would fetch from API
        return JSON.parse(localStorage.getItem(`orders_${this.currentUser.id}`) || '[]');
    }
    
    // Save order to history
    saveOrder(orderData) {
        if (!this.currentUser) return;
        
        const orders = this.getOrderHistory();
        orders.push({
            ...orderData,
            userId: this.currentUser.id,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem(`orders_${this.currentUser.id}`, JSON.stringify(orders));
    }
    
    // Export user data (GDPR compliance)
    exportUserData() {
        if (!this.currentUser) return null;
        
        const userData = {
            profile: this.currentUser,
            orders: this.getOrderHistory(),
            preferences: this.getUserPreferences(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${this.currentUser.email}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize auth manager when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.authManager = new AuthManager(window.app);
    } else {
        setTimeout(() => {
            window.authManager = new AuthManager(window.app);
        }, 100);
    }
});
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