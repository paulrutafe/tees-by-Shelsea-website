// Contact Page JavaScript
class ContactPage {
    constructor() {
        this.init();
    }

    init() {
        this.loadCartData();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupScrollAnimations();
    }

    loadCartData() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.updateCartUI(cart);
    }

    updateCartUI(cart = null) {
        if (!cart) {
            cart = JSON.parse(localStorage.getItem('cart') || '[]');
        }
        
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
            cartCount.textContent = totalItems;
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('contactForm')?.addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });

        // Cart functionality
        document.getElementById('cartBtn')?.addEventListener('click', () => {
            this.showCartModal();
        });

        // Dynamic form interactions
        this.setupDynamicFormFeatures();

        // Social link animations
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-5px) scale(1.1)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Contact item hover effects
        document.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.querySelector('.contact-icon').style.transform = 'scale(1.1) rotate(5deg)';
            });
            item.addEventListener('mouseleave', () => {
                item.querySelector('.contact-icon').style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }

    setupDynamicFormFeatures() {
        const subjectSelect = document.getElementById('subject');
        const messageTextarea = document.getElementById('message');

        // Auto-populate message based on subject selection
        subjectSelect?.addEventListener('change', (e) => {
            const subject = e.target.value;
            const placeholders = {
                'general': 'Hi! I have a general question about...',
                'product': 'I\'d like to know more about your products, specifically...',
                'order': 'I need help with my order. My order details are...',
                'wholesale': 'I\'m interested in becoming a wholesale partner. My business details are...',
                'partnership': 'I\'d like to explore a business partnership opportunity. My proposal is...',
                'complaint': 'I\'d like to report an issue with...',
                'compliment': 'I wanted to share some positive feedback about...',
                'other': 'Tell us more about your inquiry...'
            };
            
            if (messageTextarea && placeholders[subject]) {
                messageTextarea.placeholder = placeholders[subject];
                messageTextarea.focus();
            }
        });

        // Real-time character counter for message
        if (messageTextarea) {
            const maxLength = 1000;
            const counter = document.createElement('div');
            counter.style.cssText = 'text-align: right; font-size: 12px; color: #7f8c8d; margin-top: 5px;';
            messageTextarea.parentNode.appendChild(counter);
            
            const updateCounter = () => {
                const remaining = maxLength - messageTextarea.value.length;
                counter.textContent = `${remaining} characters remaining`;
                counter.style.color = remaining < 50 ? '#e74c3c' : '#7f8c8d';
            };
            
            messageTextarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    }

    setupFormValidation() {
        const form = document.getElementById('contactForm');
        const inputs = form?.querySelectorAll('input, select, textarea');
        
        inputs?.forEach(input => {
            // Add real-time validation
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // Remove error styling when user starts typing
                this.removeFieldError(input);
            });
        });
    }

    validateField(field) {
        let isValid = true;
        let errorMessage = '';

        // Remove previous error
        this.removeFieldError(field);

        // Check if required field is empty
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Validate email format
        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Validate phone format (optional but if provided should be valid)
        if (field.type === 'tel' && field.value.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = field.value.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#e74c3c';
        
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.cssText = 'color: #e74c3c; font-size: 12px; margin-top: 5px;';
            field.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    removeFieldError(field) {
        field.style.borderColor = '#ecf0f1';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validate all fields
        const form = e.target;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let allValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                allValid = false;
            }
        });
        
        if (!allValid) {
            this.showNotification('Please fix the errors above and try again', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            this.processContactForm(data);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    processContactForm(data) {
        // In a real application, this would send data to a server
        console.log('Contact form submitted:', data);
        
        // Show success modal
        this.showSuccessModal(data);
        
        // Clear form
        document.getElementById('contactForm').reset();
        
        // Store message locally (for demo purposes)
        this.saveMessageLocally(data);
    }

    saveMessageLocally(data) {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push({
            ...data,
            submittedAt: new Date().toISOString(),
            messageId: this.generateMessageId(),
            status: 'new'
        });
        localStorage.setItem('contactMessages', JSON.stringify(messages));
    }

    generateMessageId() {
        return 'MSG' + Date.now().toString(36).toUpperCase();
    }

    showSuccessModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <span class="close-modal">&times;</span>
                <div class="success-content">
                    <div style="width: 80px; height: 80px; background: #27ae60; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px;">
                        <i class="fas fa-check" style="font-size: 2.5rem; color: white;"></i>
                    </div>
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Message Sent Successfully!</h3>
                    <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 25px;">
                        Thank you ${data.firstName}! We've received your message and will respond within 24 hours.
                    </p>
                    
                    <div class="response-info" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px; text-align: left;">
                        <h4 style="margin-bottom: 15px; color: #2c3e50; text-align: center;">What happens next?</h4>
                        <div style="display: grid; gap: 10px; color: #7f8c8d;">
                            <div style="display: flex; align-items: center;">
                                <i class="fas fa-envelope" style="color: #667eea; margin-right: 12px; width: 20px;"></i>
                                Confirmation email sent to ${data.email}
                            </div>
                            <div style="display: flex; align-items: center;">
                                <i class="fas fa-clock" style="color: #667eea; margin-right: 12px; width: 20px;"></i>
                                We'll respond within 24 hours
                            </div>
                            <div style="display: flex; align-items: center;">
                                <i class="fas fa-user-tie" style="color: #667eea; margin-right: 12px; width: 20px;"></i>
                                ${data.subject === 'wholesale' ? 'Wholesale specialist will handle your inquiry' : 'Customer service team will assist you'}
                            </div>
                            ${data.phone ? `
                                <div style="display: flex; align-items: center;">
                                    <i class="fas fa-phone" style="color: #667eea; margin-right: 12px; width: 20px;"></i>
                                    We may call you at ${data.phone}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="message-id" style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <strong>Reference ID: ${this.generateMessageId()}</strong>
                        <p style="font-size: 12px; margin-top: 5px;">Keep this ID for your records</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="contactPage.hideModal(this.closest('.modal'))">
                            Continue Browsing
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Setup close handlers
        modal.querySelector('.close-modal').onclick = () => this.hideModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) this.hideModal(modal);
        };
        
        modal.style.display = 'block';
    }

    toggleFaq(questionElement) {
        const faqItem = questionElement.parentNode;
        const answer = faqItem.querySelector('.faq-answer');
        const isActive = questionElement.classList.contains('active');
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-question.active').forEach(q => {
            if (q !== questionElement) {
                q.classList.remove('active');
                q.parentNode.querySelector('.faq-answer').classList.remove('active');
            }
        });
        
        // Toggle current FAQ
        if (isActive) {
            questionElement.classList.remove('active');
            answer.classList.remove('active');
        } else {
            questionElement.classList.add('active');
            answer.classList.add('active');
        }
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.contact-item, .faq-item, .social-link').forEach(el => {
            observer.observe(el);
        });
    }

    showCartModal() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Shopping Cart</h3>
                <div class="cart-items">
                    ${cart.length === 0 ? 
                        `<div style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                            <p>Your cart is empty</p>
                            <a href="products.html" class="btn btn-primary" style="margin-top: 20px; text-decoration: none;">Browse Products</a>
                        </div>` : 
                        cart.map(item => `
                            <div class="cart-item" style="display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid #ecf0f1;">
                                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                                <div class="item-details" style="flex: 1;">
                                    <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${item.name}</h4>
                                    <p style="margin: 2px 0; font-size: 14px; color: #7f8c8d;">${item.size} - ${item.color}</p>
                                    <p style="margin: 2px 0; font-size: 14px; color: #7f8c8d;">Quantity: ${item.quantity}</p>
                                    <p style="margin: 2px 0; font-weight: 600; color: #2c3e50;">$${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
                ${cart.length > 0 ? `
                    <div class="cart-total" style="text-align: center; padding: 20px; font-size: 18px; border-top: 2px solid #ecf0f1; margin-top: 20px;">
                        <strong>Total: $${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</strong>
                    </div>
                    <div class="cart-actions" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                        <button class="btn btn-secondary" onclick="contactPage.clearCart()">Clear Cart</button>
                        <button class="btn btn-primary">Proceed to Checkout</button>
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.close-modal').onclick = () => this.hideModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) this.hideModal(modal);
        };
        modal.style.display = 'block';
    }

    clearCart() {
        localStorage.removeItem('cart');
        this.updateCartUI([]);
        this.hideModal(document.querySelector('.modal'));
        this.showNotification('Cart cleared!');
    }

    hideModal(modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.success};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Add additional CSS for animations and form enhancements
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .fade-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background: white;
        margin: 5% auto;
        padding: 30px;
        border-radius: 20px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: slideInModal 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideInModal {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .close-modal {
        position: absolute;
        top: 15px;
        right: 25px;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        color: #aaa;
        transition: color 0.3s ease;
    }
    
    .close-modal:hover {
        color: #667eea;
    }
    
    .contact-icon {
        transition: transform 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        transform: translateY(-2px);
    }
    
    .btn:hover {
        transform: translateY(-2px);
    }
    
    .btn:active {
        transform: translateY(0);
    }
    
    .field-error {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 20%, 40%, 60%, 80%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    }
    
    @media (max-width: 768px) {
        .modal-content {
            margin: 10% auto;
            width: 95%;
            padding: 20px;
            max-height: 85vh;
        }
        
        .success-content .response-info > div {
            grid-template-columns: 1fr !important;
            text-align: center !important;
        }
        
        .success-content .response-info i {
            margin: 0 auto 5px !important;
            display: block !important;
        }
    }
`;

document.head.appendChild(additionalStyles);

// Initialize the contact page
const contactPage = new ContactPage();
