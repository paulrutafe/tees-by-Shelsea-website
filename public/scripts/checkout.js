// Checkout Page JavaScript

class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.shippingData = {};
        this.paymentData = {};
        this.stripe = null;
        this.stripeElements = null;
        this.cardElement = null;
        this.paymentMethod = 'card';
        this.orderData = {};
        this.promoCodes = {
            'WELCOME10': 0.10,
            'SUMMER20': 0.20,
            'STUDENT15': 0.15,
            'BULK25': 0.25
        };
        this.appliedPromo = null;
        
        this.init();
    }
    
    async init() {
        // Initialize Stripe (using test key - replace with your own)
        this.stripe = Stripe('pk_test_51234567890abcdef'); // Replace with your Stripe publishable key
        this.setupStripeElements();
        this.setupEventListeners();
        this.loadOrderSummary();
        this.updateProgressSteps();
        
        // Check if user is logged in
        this.checkAuthStatus();
        
        // Auto-fill shipping if user is logged in
        this.prefillShippingData();
    }
    
    setupStripeElements() {
        // Create Stripe elements
        this.stripeElements = this.stripe.elements();
        this.cardElement = this.stripeElements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
            },
        });
        
        this.cardElement.mount('#stripe-card-element');
        
        // Handle real-time validation errors from the card Element
        this.cardElement.on('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }
    
    setupEventListeners() {
        // Step navigation
        document.getElementById('continueToPayment')?.addEventListener('click', () => {
            if (this.validateShipping()) {
                this.nextStep();
            }
        });
        
        document.getElementById('backToShipping')?.addEventListener('click', () => {
            this.goToStep(1);
        });
        
        document.getElementById('continueToReview')?.addEventListener('click', () => {
            this.nextStep();
        });
        
        document.getElementById('backToPayment')?.addEventListener('click', () => {
            this.goToStep(2);
        });
        
        document.getElementById('placeOrder')?.addEventListener('click', () => {
            this.processOrder();
        });
        
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget.dataset.method);
            });
        });
        
        // Promo code
        document.getElementById('applyPromo')?.addEventListener('click', () => {
            this.applyPromoCode();
        });
        
        // Form validation
        this.setupFormValidation();
    }
    
    setupFormValidation() {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.id;
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // ZIP code validation
        if (fieldName === 'zipCode' && value) {
            const zipRegex = /^[0-9]{5}(-[0-9]{4})?$/;
            if (!zipRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid ZIP code';
            }
        }
        
        // Update field appearance
        field.classList.toggle('error', !isValid);
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
        
        return isValid;
    }
    
    validateShipping() {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'phone', 
            'address', 'city', 'state', 'zipCode', 'country'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            // Save shipping data
            this.shippingData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zipCode').value,
                country: document.getElementById('country').value
            };
        }
        
        return isValid;
    }
    
    selectPaymentMethod(method) {
        // Update UI
        document.querySelectorAll('.payment-method').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('active');
        
        // Show/hide payment forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });
        
        const paymentForm = document.getElementById(`${method}-payment`);
        if (paymentForm) {
            paymentForm.style.display = 'block';
        }
        
        this.paymentMethod = method;
        
        // Initialize payment method specific features
        if (method === 'paypal') {
            this.initPayPal();
        } else if (method === 'apple') {
            this.initApplePay();
        }
    }
    
    initPayPal() {
        // PayPal integration
        if (window.paypal) {
            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: this.calculateTotal().total
                            }
                        }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((details) => {
                        this.paymentData = {
                            method: 'paypal',
                            transactionId: details.id,
                            details: details
                        };
                        this.nextStep();
                    });
                }
            }).render('#paypal-button-container');
        }
    }
    
    initApplePay() {
        // Apple Pay integration would go here
        // This requires additional setup with Apple Pay merchant configuration
        console.log('Apple Pay integration would be initialized here');
    }
    
    nextStep() {
        if (this.currentStep < 4) {
            this.goToStep(this.currentStep + 1);
        }
    }
    
    goToStep(step) {
        // Hide current step
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target step
        const stepMap = {
            1: 'shipping-section',
            2: 'payment-section',
            3: 'review-section',
            4: 'complete-section'
        };
        
        const targetSection = document.getElementById(stepMap[step]);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        this.currentStep = step;
        this.updateProgressSteps();
        
        // Perform step-specific actions
        if (step === 3) {
            this.populateReview();
        }
    }
    
    updateProgressSteps() {
        const stepsContainer = document.querySelector('.checkout-steps');
        stepsContainer.setAttribute('data-step', this.currentStep);
        
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }
    
    populateReview() {
        // Shipping address review
        const shippingReview = document.getElementById('shipping-review');
        shippingReview.innerHTML = `
            <p><strong>${this.shippingData.firstName} ${this.shippingData.lastName}</strong></p>
            <p>${this.shippingData.address}</p>
            <p>${this.shippingData.city}, ${this.shippingData.state} ${this.shippingData.zipCode}</p>
            <p>${this.shippingData.country}</p>
            <p>Email: ${this.shippingData.email}</p>
            <p>Phone: ${this.shippingData.phone}</p>
        `;
        
        // Payment method review
        const paymentReview = document.getElementById('payment-review');
        const methodNames = {
            card: 'Credit/Debit Card',
            paypal: 'PayPal',
            apple: 'Apple Pay'
        };
        paymentReview.innerHTML = `<p>${methodNames[this.paymentMethod]}</p>`;
        
        // Items review
        this.loadOrderSummary();
    }
    
    async processOrder() {
        const loadingElement = document.getElementById('loading');
        loadingElement.classList.add('active');
        
        try {
            let paymentResult = null;
            
            if (this.paymentMethod === 'card') {
                paymentResult = await this.processStripePayment();
            } else if (this.paymentMethod === 'paypal') {
                // PayPal payment already processed in initPayPal
                paymentResult = { success: true };
            }
            
            if (paymentResult && paymentResult.success) {
                // Create order
                const orderData = await this.createOrder();
                
                if (orderData.success) {
                    this.orderData = orderData.order;
                    this.goToStep(4);
                    this.displayOrderConfirmation();
                    this.clearCart();
                    
                    // Send confirmation email (would be handled by backend)
                    this.sendConfirmationEmail();
                } else {
                    throw new Error(orderData.message || 'Failed to create order');
                }
            }
        } catch (error) {
            console.error('Order processing error:', error);
            this.showErrorNotification(error.message || 'An error occurred while processing your order. Please try again.');
        } finally {
            loadingElement.classList.remove('active');
        }
    }
    
    async processStripePayment() {
        try {
            const result = await this.stripe.confirmCardPayment(
                await this.createPaymentIntent(),
                {
                    payment_method: {
                        card: this.cardElement,
                        billing_details: {
                            name: `${this.shippingData.firstName} ${this.shippingData.lastName}`,
                            email: this.shippingData.email,
                            address: {
                                line1: this.shippingData.address,
                                city: this.shippingData.city,
                                state: this.shippingData.state,
                                postal_code: this.shippingData.zipCode,
                                country: this.shippingData.country,
                            }
                        }
                    }
                }
            );
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            this.paymentData = {
                method: 'stripe',
                paymentIntentId: result.paymentIntent.id,
                details: result.paymentIntent
            };
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
    
    async createPaymentIntent() {
        // This would normally be done on your backend
        // For demo purposes, we'll simulate it
        const totals = this.calculateTotal();
        
        // Simulate API call to create payment intent
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
            }, 1000);
        });
    }
    
    async createOrder() {
        // Simulate order creation API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const orderId = `ORD-${Date.now()}`;
                const order = {
                    id: orderId,
                    orderNumber: orderId,
                    status: 'confirmed',
                    items: this.getCartItems(),
                    shipping: this.shippingData,
                    payment: this.paymentData,
                    totals: this.calculateTotal(),
                    createdAt: new Date().toISOString(),
                    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                };
                
                resolve({ success: true, order });
            }, 2000);
        });
    }
    
    displayOrderConfirmation() {
        const orderDetails = document.getElementById('order-details');
        orderDetails.innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p><strong>Order Number:</strong> ${this.orderData.orderNumber}</p>
                <p><strong>Order Total:</strong> $${this.orderData.totals.total}</p>
                <p><strong>Estimated Delivery:</strong> ${this.orderData.estimatedDelivery}</p>
            </div>
        `;
        
        // Set up order tracking
        document.getElementById('trackOrder')?.addEventListener('click', () => {
            // Would redirect to order tracking page
            alert(`Order tracking for ${this.orderData.orderNumber} would be shown here.`);
        });
    }
    
    sendConfirmationEmail() {
        // This would be handled by your backend
        console.log('Confirmation email sent to:', this.shippingData.email);
    }
    
    clearCart() {
        // Clear cart from localStorage and update UI
        localStorage.removeItem('cart');
        if (window.app) {
            window.app.cart = [];
            window.app.updateCartUI();
        }
    }
    
    loadOrderSummary() {
        const cart = this.getCartItems();
        const orderItemsContainer = document.getElementById('order-items');
        
        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p>Your cart is empty</p>';
            return;
        }
        
        orderItemsContainer.innerHTML = cart.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-variant">Size: ${item.size}, Color: ${item.color}</div>
                    <div class="item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
            </div>
        `).join('');
        
        this.updateTotals();
    }
    
    getCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return cart;
    }
    
    calculateTotal() {
        const cart = this.getCartItems();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Calculate shipping
        const freeShippingThreshold = 75;
        const shippingCost = subtotal >= freeShippingThreshold ? 0 : 9.99;
        
        // Calculate tax (8%)
        const taxRate = 0.08;
        const tax = subtotal * taxRate;
        
        // Apply promo code discount
        const discountAmount = this.appliedPromo ? subtotal * this.appliedPromo.discount : 0;
        
        const total = subtotal + shippingCost + tax - discountAmount;
        
        return {
            subtotal: subtotal.toFixed(2),
            shipping: shippingCost.toFixed(2),
            tax: tax.toFixed(2),
            discount: discountAmount.toFixed(2),
            total: total.toFixed(2)
        };
    }
    
    updateTotals() {
        const totals = this.calculateTotal();
        
        document.getElementById('subtotal').textContent = `$${totals.subtotal}`;
        document.getElementById('shipping').textContent = `$${totals.shipping}`;
        document.getElementById('tax').textContent = `$${totals.tax}`;
        document.getElementById('total').textContent = `$${totals.total}`;
        
        // Show/hide discount row
        const discountRow = document.getElementById('discount-row');
        if (this.appliedPromo) {
            document.getElementById('discount').textContent = `-$${totals.discount}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    applyPromoCode() {
        const promoInput = document.getElementById('promoCode');
        const code = promoInput.value.trim().toUpperCase();
        
        if (this.promoCodes[code]) {
            this.appliedPromo = {
                code: code,
                discount: this.promoCodes[code]
            };
            
            this.updateTotals();
            this.showSuccessNotification(`Promo code ${code} applied! ${(this.promoCodes[code] * 100)}% discount.`);
            promoInput.value = '';
        } else {
            this.showErrorNotification('Invalid promo code');
        }
    }
    
    checkAuthStatus() {
        // Check if user is logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser) {
            this.prefillUserData(currentUser);
        }
    }
    
    prefillUserData(user) {
        if (user.email) {
            document.getElementById('email').value = user.email;
        }
        if (user.firstName) {
            document.getElementById('firstName').value = user.firstName;
        }
        if (user.lastName) {
            document.getElementById('lastName').value = user.lastName;
        }
        if (user.phone) {
            document.getElementById('phone').value = user.phone;
        }
        if (user.address) {
            document.getElementById('address').value = user.address.street || '';
            document.getElementById('city').value = user.address.city || '';
            document.getElementById('state').value = user.address.state || '';
            document.getElementById('zipCode').value = user.address.zip || '';
            document.getElementById('country').value = user.address.country || '';
        }
    }
    
    prefillShippingData() {
        // Pre-fill with saved shipping data if available
        const savedShipping = JSON.parse(localStorage.getItem('savedShippingAddress') || 'null');
        if (savedShipping) {
            Object.keys(savedShipping).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = savedShipping[key];
                }
            });
        }
    }
    
    showSuccessNotification(message) {
        // Create and show success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showErrorNotification(message) {
        // Create and show error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize checkout when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
