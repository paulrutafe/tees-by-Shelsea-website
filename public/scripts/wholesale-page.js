// Wholesale Page JavaScript
class WholesalePage {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCartData();
        this.animateCounters();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('wholesaleForm')?.addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });

        // Cart functionality
        document.getElementById('cartBtn')?.addEventListener('click', () => {
            this.showCartModal();
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Intersection Observer for animations
        this.setupScrollAnimations();
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
                    
                    // Trigger counter animation if it's a stat item
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.benefit-card, .pricing-card, .gallery-item, .stat-item').forEach(el => {
            observer.observe(el);
        });
    }

    animateCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });
            observer.observe(stat);
        });
    }

    animateCounter(element) {
        const text = element.textContent;
        const isPercentage = text.includes('%');
        const isPlus = text.includes('+');
        const numMatch = text.match(/\d+/);
        
        if (!numMatch) return;
        
        const finalValue = parseInt(numMatch[0]);
        let currentValue = 0;
        const increment = finalValue / 50; // Animation duration control
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(currentValue).toString();
            if (isPercentage) displayValue += '%';
            if (isPlus) displayValue += '+';
            if (text.includes('Up to')) displayValue = 'Up to ' + displayValue;
            
            element.textContent = displayValue;
        }, 30);
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields
        const requiredFields = ['businessName', 'contactName', 'email', 'phone', 'businessType', 'monthlyVolume', 'message'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            this.processWholesaleApplication(data);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    processWholesaleApplication(data) {
        // In a real application, this would send data to a server
        console.log('Wholesale application submitted:', data);
        
        // Show success message
        this.showSuccessModal(data);
        
        // Clear form
        document.getElementById('wholesaleForm').reset();
        
        // Store application data locally (for demo purposes)
        this.saveApplicationLocally(data);
    }

    saveApplicationLocally(data) {
        const applications = JSON.parse(localStorage.getItem('wholesaleApplications') || '[]');
        applications.push({
            ...data,
            submittedAt: new Date().toISOString(),
            status: 'pending',
            applicationId: this.generateApplicationId()
        });
        localStorage.setItem('wholesaleApplications', JSON.stringify(applications));
    }

    generateApplicationId() {
        return 'WS' + Date.now().toString(36).toUpperCase();
    }

    showSuccessModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <span class="close-modal">&times;</span>
                <div class="success-content">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #27ae60; margin-bottom: 20px;"></i>
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Application Submitted Successfully!</h3>
                    <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 25px;">
                        Thank you ${data.contactName}! Your wholesale application for ${data.businessName} has been received. 
                        Our sales team will review your application and contact you within 24 hours.
                    </p>
                    <div class="next-steps" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px; text-align: left;">
                        <h4 style="margin-bottom: 10px; color: #2c3e50;">What happens next?</h4>
                        <ul style="color: #7f8c8d; line-height: 1.6;">
                            <li>📧 Confirmation email sent to ${data.email}</li>
                            <li>📞 Sales team will call you within 24 hours</li>
                            <li>📋 Application review and approval process</li>
                            <li>🎉 Welcome package and account setup</li>
                        </ul>
                    </div>
                    <div class="application-info" style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <strong>Application ID: ${this.generateApplicationId()}</strong>
                        <p style="font-size: 14px; margin-top: 5px;">Keep this ID for your records</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="wholesalePage.hideModal(this.closest('.modal'))">Continue</button>
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
                            <a href="products.html" class="btn btn-primary" style="margin-top: 20px;">Browse Products</a>
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
                        <button class="btn btn-secondary" onclick="wholesalePage.clearCart()">Clear Cart</button>
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
        }, 3000);
    }
}

// Gallery modal functionality
window.showGalleryModal = function(type) {
    const galleryData = {
        'retail-store': {
            title: 'Retail Store Success Story',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center',
            description: 'Fashion Forward Boutique increased their sales by 300% in just 6 months after joining our wholesale program. They started with our Starter tier and quickly moved to Professional tier as their business grew.',
            details: [
                '300% sales increase in 6 months',
                'Expanded from 50 to 200+ product SKUs',
                'Customer satisfaction rate of 98%',
                'Monthly revenue grew from $2K to $8K'
            ],
            video: 'https://cdn.pixabay.com/video/2016/10/04/5512-184225626_large.mp4'
        },
        'online-store': {
            title: 'Online Store Success Story',
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center',
            description: 'StyleHub Online expanded their product catalog with 50+ Tees by Shelsea items, becoming one of our top-performing partners with consistent monthly growth.',
            details: [
                'Added 50+ new product lines',
                'Achieved Enterprise tier within 8 months',
                'Consistent 25% month-over-month growth',
                '5-star customer ratings across all platforms'
            ]
        },
        'warehouse': {
            title: 'Efficient Wholesale Operations',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&crop=center',
            description: 'Our state-of-the-art warehouse and fulfillment center ensures fast, accurate order processing and shipping to all our wholesale partners.',
            details: [
                '99.8% order accuracy rate',
                'Same-day processing for orders placed before 2 PM',
                'Climate-controlled storage facility',
                'Real-time inventory tracking system'
            ]
        },
        'fashion-show': {
            title: 'Fashion Events & Marketing',
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop&crop=center',
            description: 'We support our partners with marketing materials and even help them showcase products at fashion events and trade shows.',
            details: [
                'Professional product photography provided',
                'Marketing material templates available',
                'Trade show support and participation',
                'Social media marketing guidance'
            ]
        }
    };

    const data = galleryData[type];
    if (!data) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
            <span class="close-modal">&times;</span>
            <div class="gallery-modal-content">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">${data.title}</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start;">
                    <div class="gallery-media">
                        <img src="${data.image}" alt="${data.title}" style="width: 100%; border-radius: 15px; margin-bottom: 20px;">
                        ${data.video ? `
                            <video controls style="width: 100%; border-radius: 15px;">
                                <source src="${data.video}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        ` : ''}
                    </div>
                    <div class="gallery-details">
                        <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 25px;">${data.description}</p>
                        <h4 style="color: #2c3e50; margin-bottom: 15px;">Key Achievements:</h4>
                        <ul style="color: #7f8c8d; line-height: 1.8;">
                            ${data.details.map(detail => `<li style="margin-bottom: 8px;"><i class="fas fa-check" style="color: #27ae60; margin-right: 10px;"></i>${detail}</li>`).join('')}
                        </ul>
                        <div style="margin-top: 30px;">
                            <button class="btn btn-primary" onclick="showContactForm('partner-inquiry')">Become a Partner</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.close-modal').onclick = () => wholesalePage.hideModal(modal);
    modal.onclick = (e) => {
        if (e.target === modal) wholesalePage.hideModal(modal);
    };
    modal.style.display = 'block';
};

// Contact form with pre-filled tier
window.showContactForm = function(tier) {
    const monthlyVolumeSelect = document.getElementById('monthlyVolume');
    if (monthlyVolumeSelect) {
        if (tier === 'starter') {
            monthlyVolumeSelect.value = 'starter';
        } else if (tier === 'professional') {
            monthlyVolumeSelect.value = 'professional';
        } else if (tier === 'enterprise') {
            monthlyVolumeSelect.value = 'enterprise';
        }
    }
    
    // Scroll to contact form
    document.getElementById('contactSection').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    // Add highlight effect
    const form = document.getElementById('wholesaleForm');
    form.style.animation = 'pulse 0.5s ease-in-out';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    .fade-in {
        animation: fadeIn 0.6s ease forwards;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
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
    }
    
    .modal-content {
        background: white;
        margin: 5% auto;
        padding: 30px;
        border-radius: 20px;
        width: 90%;
        max-width: 600px;
        position: relative;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .close-modal {
        position: absolute;
        top: 15px;
        right: 25px;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        color: #aaa;
    }
    
    .close-modal:hover {
        color: #000;
    }
    
    @media (max-width: 768px) {
        .modal-content {
            margin: 10% auto;
            width: 95%;
            padding: 20px;
        }
        
        .gallery-modal-content > div {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
        }
    }
`;

document.head.appendChild(style);

// Initialize the wholesale page
const wholesalePage = new WholesalePage();
