// Main Application JavaScript

class TeesApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.cart = [];
        this.apiBaseUrl = '/api';
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.loadCartFromStorage();
        this.loadProducts();
        this.updateCartUI();
        this.checkAuthStatus();
        
        // Initialize smooth scrolling
        this.initSmoothScrolling();
        
        // Initialize intersection observer for animations
        this.initScrollAnimations();
    }
    
    setupEventListeners() {
        // Navigation
        document.getElementById('mobileMenuBtn')?.addEventListener('click', this.toggleMobileMenu.bind(this));
        
        // Search
        document.getElementById('searchInput')?.addEventListener('input', this.handleSearch.bind(this));
        
        // Category filtering
        document.getElementById('categoryFilter')?.addEventListener('change', this.handleCategoryFilter.bind(this));
        
        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.filterByCategory(category);
                this.scrollToSection('products');
            });
        });
        
        // Contact form
        document.getElementById('contactForm')?.addEventListener('submit', this.handleContactForm.bind(this));
        
        // Wholesale inquiry
        document.getElementById('wholesaleInquiryBtn')?.addEventListener('click', () => {
            this.scrollToSection('contact');
            // Pre-fill contact form for wholesale
            document.getElementById('subject').value = 'wholesale';
        });
        
        // Auth button
        document.getElementById('authBtn')?.addEventListener('click', this.showAuthModal.bind(this));
        
        // Cart button
        document.getElementById('cartBtn')?.addEventListener('click', this.showCartModal.bind(this));
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });
        
        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
    }
    
    initSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }
    
    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements for animations
        document.querySelectorAll('.category-card, .product-card, .stat, .benefit').forEach(el => {
            observer.observe(el);
        });
    }
    
    async loadProducts() {
        try {
            this.showLoading('productsLoading');
            const response = await fetch(`${this.apiBaseUrl}/products`);
            this.products = await response.json();
            this.renderProducts(this.products);
            this.renderFeaturedProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Failed to load products', 'error');
        } finally {
            this.hideLoading('productsLoading');
        }
    }
    
    renderProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <div class="product-image-placeholder">
                        <i class="fas fa-tshirt"></i>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        <span class="price-retail">$${product.retailPrice}</span>
                        <span class="price-wholesale">Wholesale: $${product.wholesalePrice}</span>
                    </div>
                    <div class="product-meta">
                        <span>Stock: ${product.stock}</span>
                        <span>${product.sizes.length} sizes available</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small" onclick="app.showProductDetails('${product.id}')">View Details</button>
                        <button class="btn-icon" onclick="app.addToCart('${product.id}')" title="Add to Cart">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderFeaturedProducts() {
        const featuredProducts = this.products.filter(p => p.featured).slice(0, 4);
        const featuredGrid = document.getElementById('featuredProducts');
        if (!featuredGrid) return;
        
        featuredGrid.innerHTML = featuredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <div class="product-image-placeholder">
                        <i class="fas fa-tshirt"></i>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        <span class="price-retail">$${product.retailPrice}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small" onclick="app.showProductDetails('${product.id}')">View Details</button>
                        <button class="btn-icon" onclick="app.addToCart('${product.id}')" title="Add to Cart">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
        this.renderProducts(filteredProducts);
    }
    
    handleCategoryFilter(e) {
        const category = e.target.value;
        this.filterByCategory(category);
    }
    
    filterByCategory(category) {
        let filteredProducts = this.products;
        
        if (category && category !== 'all') {
            filteredProducts = this.products.filter(p => p.category === category);
        }
        
        this.renderProducts(filteredProducts);
        
        // Update filter UI
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category || 'all';
        }
    }
    
    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modal = document.getElementById('productModal');
        const content = document.getElementById('productModalContent');
        
        const userPrice = this.currentUser?.accountType === 'wholesale' ? product.wholesalePrice : product.retailPrice;
        const priceLabel = this.currentUser?.accountType === 'wholesale' ? 'Wholesale Price' : 'Retail Price';
        
        content.innerHTML = `
            <div class="product-detail">
                <div class="product-detail-image">
                    <i class="fas fa-tshirt"></i>
                </div>
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <p class="product-detail-description">${product.description}</p>
                    <div class="product-detail-price">
                        <span class="price-retail">${priceLabel}: $${userPrice}</span>
                        ${this.currentUser?.accountType !== 'wholesale' ? `<span class="price-wholesale">Wholesale: $${product.wholesalePrice}</span>` : ''}
                    </div>
                    
                    <div class="product-options">
                        <div class="option-group">
                            <label>Size:</label>
                            <div class="option-buttons">
                                ${product.sizes.map(size => `
                                    <button class="option-btn" data-option="size" data-value="${size}">${size}</button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="option-group">
                            <label>Color:</label>
                            <div class="option-buttons">
                                ${product.colors.map(color => `
                                    <button class="option-btn" data-option="color" data-value="${color}">${color}</button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="quantity-selector">
                        <label>Quantity:</label>
                        <input type="number" class="quantity-input" value="1" min="1" max="${product.stock}">
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="app.addToCartFromModal('${product.id}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-secondary" onclick="app.hideModal(document.getElementById('productModal'))">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Setup option buttons
        content.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selected class from siblings
                btn.parentNode.querySelectorAll('.option-btn').forEach(sibling => {
                    sibling.classList.remove('selected');
                });
                // Add selected class to clicked button
                btn.classList.add('selected');
            });
        });
        
        // Select first options by default
        content.querySelectorAll('.option-buttons').forEach(group => {
            group.querySelector('.option-btn')?.classList.add('selected');
        });
        
        this.showModal(modal);
    }
    
    addToCart(productId, options = {}) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const cartItem = {
            productId: productId,
            name: product.name,
            price: this.currentUser?.accountType === 'wholesale' ? product.wholesalePrice : product.retailPrice,
            quantity: options.quantity || 1,
            size: options.size || product.sizes[0],
            color: options.color || product.colors[0],
            image: product.image
        };
        
        // Check if item already exists in cart
        const existingItem = this.cart.find(item => 
            item.productId === cartItem.productId &&
            item.size === cartItem.size &&
            item.color === cartItem.color
        );
        
        if (existingItem) {
            existingItem.quantity += cartItem.quantity;
        } else {
            this.cart.push(cartItem);
        }
        
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification(`Added ${product.name} to cart!`, 'success');
    }
    
    addToCartFromModal(productId) {
        const modal = document.getElementById('productModal');
        const sizeBtn = modal.querySelector('.option-btn[data-option="size"].selected');
        const colorBtn = modal.querySelector('.option-btn[data-option="color"].selected');
        const quantityInput = modal.querySelector('.quantity-input');
        
        const options = {
            size: sizeBtn?.dataset.value,
            color: colorBtn?.dataset.value,
            quantity: parseInt(quantityInput?.value || 1)
        };
        
        this.addToCart(productId, options);
        this.hideModal(modal);
    }
    
    updateCartQuantity(productId, size, color, newQuantity) {
        const item = this.cart.find(item => 
            item.productId === productId &&
            item.size === size &&
            item.color === color
        );
        
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId, size, color);
            } else {
                item.quantity = newQuantity;
                this.saveCartToStorage();
                this.updateCartUI();
            }
        }
    }
    
    removeFromCart(productId, size, color) {
        this.cart = this.cart.filter(item => 
            !(item.productId === productId &&
              item.size === size &&
              item.color === color)
        );
        this.saveCartToStorage();
        this.updateCartUI();
    }
    
    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification('Cart cleared!', 'info');
    }
    
    showCartModal() {
        const modal = document.getElementById('cartModal');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-details">Size: ${item.size} | Color: ${item.color}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="app.updateCartQuantity('${item.productId}', '${item.size}', '${item.color}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.updateCartQuantity('${item.productId}', '${item.size}', '${item.color}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn-icon" onclick="app.removeFromCart('${item.productId}', '${item.size}', '${item.color}')" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
        
        // Setup cart action buttons
        document.getElementById('clearCartBtn').onclick = () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                this.clearCart();
            }
        };
        
        document.getElementById('checkoutBtn').onclick = () => {
            if (this.cart.length === 0) {
                this.showNotification('Your cart is empty!', 'error');
                return;
            }
            
            if (!this.currentUser) {
                this.hideModal(modal);
                this.showAuthModal();
                this.showNotification('Please sign in to checkout', 'info');
                return;
            }
            
            this.processCheckout();
        };
        
        this.showModal(modal);
    }
    
    async processCheckout() {
        try {
            // In a real application, you would collect shipping/billing info
            const orderData = {
                items: this.cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                })),
                shippingAddress: {
                    name: this.currentUser.name,
                    address: '123 Default St',
                    city: 'City',
                    state: 'State',
                    zip: '12345'
                },
                billingAddress: {
                    name: this.currentUser.name,
                    address: '123 Default St',
                    city: 'City',
                    state: 'State',
                    zip: '12345'
                },
                paymentMethod: 'card'
            };
            
            const response = await fetch(`${this.apiBaseUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });
            
            if (response.ok) {
                const order = await response.json();
                this.clearCart();
                this.hideModal(document.getElementById('cartModal'));
                this.showNotification(`Order placed successfully! Order ID: ${order.id}`, 'success');
            } else {
                throw new Error('Failed to place order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            this.showNotification('Failed to place order. Please try again.', 'error');
        }
    }
    
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.updateAuthUI();
        }
    }
    
    updateAuthUI() {
        const authBtn = document.getElementById('authBtn');
        
        if (this.currentUser) {
            authBtn.innerHTML = `
                <div class="user-menu">
                    <span>Hi, ${this.currentUser.name}</span>
                    <button onclick="app.logout()" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            `;
            authBtn.classList.add('user-authenticated');
        } else {
            authBtn.textContent = 'Sign In';
            authBtn.classList.remove('user-authenticated');
            authBtn.onclick = this.showAuthModal.bind(this);
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser = null;
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'info');
    }
    
    showAuthModal() {
        const modal = document.getElementById('authModal');
        this.showModal(modal);
    }
    
    async handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Simulate form submission
        this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        e.target.reset();
    }
    
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const isVisible = mobileMenu.style.display === 'block';
        mobileMenu.style.display = isVisible ? 'none' : 'block';
    }
    
    showModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    hideModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'block';
    }
    
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'none';
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
            }"></i>
            <span>${message}</span>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    max-width: 300px;
                    animation: slideInRight 0.3s ease;
                    border-left: 4px solid #3498db;
                }
                .notification-success { border-left-color: #27ae60; }
                .notification-error { border-left-color: #e74c3c; }
                .notification-info { border-left-color: #3498db; }
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerHeight = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        
        // Close mobile menu if open
        document.getElementById('mobileMenu').style.display = 'none';
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`a[href="#${sectionId}"]`)?.classList.add('active');
    }
}

// Global function for button clicks
function scrollToSection(sectionId) {
    if (window.app) {
        window.app.scrollToSection(sectionId);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TeesApp();
});

// Add smooth scrolling behavior to the page
document.documentElement.style.scrollBehavior = 'smooth';

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = ['home', 'products', 'wholesale', 'about', 'contact'];
    const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
    });
    
    if (current) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`a[href="#${current}"]`)?.classList.add('active');
    }
});