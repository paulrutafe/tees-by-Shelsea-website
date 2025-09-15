// About Page JavaScript
class AboutPage {
    constructor() {
        this.init();
    }

    init() {
        this.loadCartData();
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.setupCounterAnimations();
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
        // Cart functionality
        document.getElementById('cartBtn')?.addEventListener('click', () => {
            this.showCartModal();
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId) || 
                                    document.querySelector(`.${targetId}-section`);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Team member interaction
        document.querySelectorAll('.team-member').forEach(member => {
            member.addEventListener('mouseenter', () => {
                member.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            member.addEventListener('mouseleave', () => {
                member.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Value cards interaction
        document.querySelectorAll('.value-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showValueDetails(card);
            });
        });
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
                    
                    // Special handling for timeline items
                    if (entry.target.classList.contains('timeline-item')) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateX(0)';
                        }, 100);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.story-content > *, .value-card, .team-member, .timeline-item').forEach(el => {
            observer.observe(el);
        });

        // Special setup for timeline items
        document.querySelectorAll('.timeline-item').forEach((item, index) => {
            item.style.opacity = '0';
            if (item.classList.contains('left')) {
                item.style.transform = 'translateX(-100px)';
            } else {
                item.style.transform = 'translateX(100px)';
            }
            item.style.transition = 'all 0.6s ease';
        });
    }

    setupCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60 FPS
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (element.parentElement.querySelector('.stat-label').textContent.includes('%')) {
                element.textContent = Math.floor(current) + '%';
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }

    showValueDetails(card) {
        const title = card.querySelector('.value-title').textContent;
        const description = card.querySelector('.value-description').textContent;
        const icon = card.querySelector('.value-icon i').className;
        
        const valueDetails = {
            'Quality First': {
                details: [
                    'Premium materials sourced from trusted suppliers',
                    'Multi-stage quality control process',
                    'Customer satisfaction guarantee',
                    'Regular product testing and improvement',
                    'Certifications from industry standards organizations'
                ],
                video: 'https://cdn.pixabay.com/video/2018/09/21/18867-289786012_large.mp4'
            },
            'Customer Centric': {
                details: [
                    '24/7 customer support across all channels',
                    'Personalized shopping experience',
                    'Easy returns and exchanges policy',
                    'Customer feedback integration in product development',
                    'Loyalty rewards program'
                ],
                video: null
            },
            'Partnership': {
                details: [
                    'Dedicated account managers for wholesale partners',
                    'Joint marketing initiatives and support',
                    'Flexible payment and shipping terms',
                    'Business growth consultation and advice',
                    'Exclusive access to new product launches'
                ],
                video: null
            },
            'Innovation': {
                details: [
                    'Cutting-edge design and manufacturing processes',
                    'Regular trend research and market analysis',
                    'Technology integration in operations',
                    'Sustainable innovation initiatives',
                    'Collaboration with fashion designers and influencers'
                ],
                video: null
            },
            'Sustainability': {
                details: [
                    'Eco-friendly materials and packaging',
                    'Carbon footprint reduction programs',
                    'Ethical sourcing and fair trade practices',
                    'Waste reduction in manufacturing',
                    'Community environmental initiatives'
                ],
                video: 'https://cdn.pixabay.com/video/2019/01/29/21516-317040158_large.mp4'
            },
            'Excellence': {
                details: [
                    'Continuous improvement in all business processes',
                    'Industry-leading performance metrics',
                    'Award-winning customer service',
                    'High employee satisfaction and retention',
                    'Recognition from industry peers and customers'
                ],
                video: null
            }
        };

        const details = valueDetails[title];
        if (!details) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <span class="close-modal">&times;</span>
                <div class="value-detail-content">
                    <div class="value-header" style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 4rem; color: #667eea; margin-bottom: 15px;">
                            <i class="${icon}"></i>
                        </div>
                        <h2 style="color: #2c3e50; margin-bottom: 10px;">${title}</h2>
                        <p style="color: #7f8c8d; font-size: 1.1rem; line-height: 1.6;">${description}</p>
                    </div>
                    
                    ${details.video ? `
                        <div class="value-video" style="margin-bottom: 30px; text-align: center;">
                            <video controls style="width: 100%; max-width: 500px; border-radius: 15px;">
                                <source src="${details.video}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ` : ''}
                    
                    <div class="value-details">
                        <h4 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">How We Deliver This Value:</h4>
                        <ul style="color: #7f8c8d; line-height: 1.8; max-width: 500px; margin: 0 auto;">
                            ${details.details.map(detail => `
                                <li style="margin-bottom: 10px; display: flex; align-items: flex-start;">
                                    <i class="fas fa-check" style="color: #27ae60; margin-right: 12px; margin-top: 6px; font-size: 14px;"></i>
                                    <span>${detail}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 40px;">
                        <button class="btn btn-primary" onclick="window.location.href='contact.html'">
                            Experience Our ${title} Approach
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.close-modal').onclick = () => this.hideModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) this.hideModal(modal);
        };
        modal.style.display = 'block';

        // Add pulse effect to the clicked card
        card.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            card.style.animation = '';
        }, 300);
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
                        <button class="btn btn-secondary" onclick="aboutPage.clearCart()">Clear Cart</button>
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

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add additional CSS for animations and modals
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .fade-in {
        animation: fadeInUp 0.8s ease forwards;
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
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
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
    
    .value-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .value-card:hover {
        cursor: pointer;
        box-shadow: 0 25px 50px rgba(102, 126, 234, 0.2) !important;
    }
    
    .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-block;
        text-decoration: none;
        text-align: center;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    
    .btn-secondary {
        background: transparent;
        color: #667eea;
        border: 2px solid #667eea;
    }
    
    .btn-secondary:hover {
        background: #667eea;
        color: white;
    }
    
    @media (max-width: 768px) {
        .modal-content {
            margin: 10% auto;
            width: 95%;
            padding: 20px;
            max-height: 85vh;
        }
        
        .value-detail-content .value-header div {
            font-size: 3rem !important;
        }
        
        .value-details ul {
            padding-left: 0;
        }
        
        .value-details li {
            flex-direction: column;
            align-items: flex-start !important;
            text-align: left;
        }
        
        .value-details i {
            margin-bottom: 5px !important;
        }
    }
`;

document.head.appendChild(additionalStyles);

// Initialize the about page
const aboutPage = new AboutPage();
