// Products Page JavaScript
class ProductsPage {
    constructor() {
        this.products = [];
        this.currentCategory = 'all';
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.handleURLParameters();
        this.renderProducts(this.products);
        this.updateCartUI();
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            this.products = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = this.getFallbackProducts();
        }
    }

    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryClick(e.target.dataset.category);
            });
        });

        // Search
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Cart button
        document.getElementById('cartBtn')?.addEventListener('click', () => {
            this.showCartModal();
        });
    }

    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        if (category) {
            // Update active button
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const categoryBtn = document.querySelector(`[data-category="${category}"]`);
            if (categoryBtn) {
                categoryBtn.classList.add('active');
                this.currentCategory = category;
                this.showCategoryShowcase(category);
                this.filterAndRenderProducts();
            }
        }
    }

    handleCategoryClick(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        
        // Show category showcase
        this.showCategoryShowcase(category);
        
        // Filter and render products
        this.filterAndRenderProducts();
    }

    showCategoryShowcase(category) {
        const showcase = document.getElementById('categoryShowcase');
        const categoryData = this.getCategoryData(category);
        
        if (category === 'all') {
            showcase.style.display = 'none';
            return;
        }

        // Update category hero
        document.getElementById('categoryTitle').textContent = categoryData.title;
        document.getElementById('categoryDescription').textContent = categoryData.description;
        
        // Show/hide video
        const videoShowcase = document.getElementById('videoShowcase');
        const categoryVideo = document.getElementById('categoryVideo');
        
        if (categoryData.video) {
            categoryVideo.src = categoryData.video;
            videoShowcase.style.display = 'block';
        } else {
            videoShowcase.style.display = 'none';
        }
        
        showcase.style.display = 'block';
        
        // Smooth scroll to showcase
        setTimeout(() => {
            showcase.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    getCategoryData(category) {
        const categoryData = {
            men: {
                title: "Men's Premium Collection",
                description: "Discover our stylish and comfortable men's clothing line featuring t-shirts, jeans, shirts and more.",
                video: "https://cdn.pixabay.com/video/2019/05/20/23203-337265097_large.mp4"
            },
            women: {
                title: "Women's Fashion Collection",
                description: "Elegant and trendy women's clothing designed for comfort and style in every occasion.",
                video: "https://cdn.pixabay.com/video/2021/04/05/70230-534322961_large.mp4"
            },
            kids: {
                title: "Kids & Children's Collection",
                description: "Fun, colorful, and comfortable clothing designed specially for active children.",
                video: null
            },
            shoes: {
                title: "Premium Footwear Collection",
                description: "Quality shoes for every occasion - from athletic sneakers to casual everyday wear.",
                video: "https://cdn.pixabay.com/video/2020/12/17/60835-490192985_large.mp4"
            },
            accessories: {
                title: "Stylish Accessories",
                description: "Complete your look with our premium accessories including belts, hats, and more.",
                video: null
            }
        };
        
        return categoryData[category] || { title: 'Products', description: 'Browse our collection' };
    }

    handleSearch(query) {
        const filteredProducts = this.products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        this.renderProducts(filteredProducts);
    }

    filterAndRenderProducts() {
        let filteredProducts = this.products;
        
        if (this.currentCategory !== 'all') {
            filteredProducts = this.products.filter(p => p.category === this.currentCategory);
        }
        
        this.renderProducts(filteredProducts);
    }

    renderProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        const noResults = document.getElementById('noResults');
        
        if (products.length === 0) {
            productsGrid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-rating">
                        <div class="rating-stars">
                            ${this.generateStarRating(product.reviews.rating)}
                        </div>
                        <span class="rating-count">(${product.reviews.count})</span>
                    </div>
                    <div class="product-price">
                        <span class="price-retail">$${product.retailPrice}</span>
                        <span class="price-wholesale">Wholesale: $${product.wholesalePrice}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="productsPage.showProductDetails('${product.id}')">
                            View Details
                        </button>
                        <button class="btn btn-success buy-now-btn" onclick="productsPage.buyNow('${product.id}')" title="Buy Now">
                            <i class="fas fa-bolt"></i>
                        </button>
                        <button class="btn-icon" onclick="productsPage.addToCart('${product.id}')" title="Add to Cart">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Create modal if it doesn't exist
        this.createProductModal(product);
    }

    createProductModal(product) {
        // Remove existing modal if present
        const existingModal = document.getElementById('productModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'productModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <span class="close-modal">&times;</span>
                <div class="product-detail">
                    <div class="product-gallery">
                        <div class="main-image">
                            <img src="${product.images[0]}" alt="${product.name}" id="mainProductImage">
                        </div>
                        <div class="thumbnail-images">
                            ${product.images.map((img, index) => `
                                <img src="${img}" alt="${product.name} ${index + 1}" 
                                     onclick="productsPage.changeMainImage('${img}')"
                                     class="thumbnail ${index === 0 ? 'active' : ''}">
                            `).join('')}
                        </div>
                        ${product.videos.length > 0 ? `
                            <div class="product-video" style="margin-top: 20px;">
                                <video controls style="width: 100%; border-radius: 10px;">
                                    <source src="${product.videos[0]}" type="video/mp4">
                                </video>
                            </div>
                        ` : ''}
                    </div>
                    <div class="product-details">
                        <h2>${product.name}</h2>
                        <div class="rating">
                            ${this.generateStarRating(product.reviews.rating)}
                            <span>(${product.reviews.count} reviews)</span>
                        </div>
                        <p class="description">${product.description}</p>
                        <div class="price-info">
                            <div class="retail-price">Retail: $${product.retailPrice}</div>
                            <div class="wholesale-price">Wholesale: $${product.wholesalePrice}</div>
                        </div>
                        <div class="product-options">
                            <div class="size-options">
                                <label>Size:</label>
                                <select id="productSize">
                                    ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                                </select>
                            </div>
                            <div class="color-options">
                                <label>Color:</label>
                                <select id="productColor">
                                    ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                                </select>
                            </div>
                            <div class="quantity-options">
                                <label>Quantity:</label>
                                <input type="number" id="productQuantity" min="1" max="${product.stock}" value="1">
                            </div>
                        </div>
                        <div class="stock-info">
                            <span class="${product.stock > 10 ? 'in-stock' : 'low-stock'}">
                                ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                        </div>
                        <div class="product-tags">
                            ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary" onclick="productsPage.addToCartFromModal('${product.id}')" 
                                    ${product.stock === 0 ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn btn-success" onclick="productsPage.buyNowFromModal('${product.id}')"
                                    ${product.stock === 0 ? 'disabled' : ''}>
                                <i class="fas fa-bolt"></i> Buy Now
                            </button>
                            <button class="btn btn-secondary" onclick="productsPage.addToWishlist('${product.id}')">
                                <i class="fas fa-heart"></i> Add to Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Setup modal close handlers
        modal.querySelector('.close-modal').onclick = () => this.hideModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) this.hideModal(modal);
        };
        
        // Show modal
        modal.style.display = 'block';
    }

    changeMainImage(imageSrc) {
        document.getElementById('mainProductImage').src = imageSrc;
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        document.querySelector(`[src="${imageSrc}"]`).classList.add('active');
    }

    hideModal(modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || product.stock === 0) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.retailPrice,
                image: product.images[0],
                quantity: 1,
                size: product.sizes[0],
                color: product.colors[0]
            });
        }
        
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification(`${product.name} added to cart!`);
    }

    addToCartFromModal(productId) {
        const product = this.products.find(p => p.id === productId);
        const size = document.getElementById('productSize').value;
        const color = document.getElementById('productColor').value;
        const quantity = parseInt(document.getElementById('productQuantity').value);
        
        const existingItem = this.cart.find(item => 
            item.id === productId && item.size === size && item.color === color
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.retailPrice,
                image: product.images[0],
                quantity: quantity,
                size: size,
                color: color
            });
        }
        
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification(`${product.name} (${size}, ${color}) added to cart!`);
        this.hideModal(document.getElementById('productModal'));
    }

    addToWishlist(productId) {
        // Wishlist functionality (could be expanded)
        this.showNotification('Added to wishlist!');
    }

    showCartModal() {
        // Create cart modal (simplified version)
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Shopping Cart</h3>
                <div class="cart-items">
                    ${this.cart.length === 0 ? '<p>Your cart is empty</p>' : 
                      this.cart.map(item => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;">
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p>${item.size} - ${item.color}</p>
                                <p>Quantity: ${item.quantity}</p>
                                <p>$${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                      `).join('')
                    }
                </div>
                <div class="cart-total">
                    <strong>Total: $${this.getCartTotal().toFixed(2)}</strong>
                </div>
                <div class="cart-actions">
                    <button class="btn btn-secondary" onclick="productsPage.clearCart()">Clear Cart</button>
                    <button class="btn btn-primary">Checkout</button>
                </div>
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
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        this.hideModal(document.querySelector('.modal'));
        this.showNotification('Cart cleared!');
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    buyNow(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || product.stock === 0) return;

        // Create cart item with first available size/color
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.retailPrice,
            image: product.images[0],
            quantity: 1,
            size: product.sizes[0],
            color: product.colors[0]
        };

        // Save to localStorage for checkout page
        localStorage.setItem('cart', JSON.stringify([cartItem]));

        // Redirect to checkout
        window.location.href = 'checkout.html';
    }

    buyNowFromModal(productId) {
        const product = this.products.find(p => p.id === productId);
        const size = document.getElementById('productSize').value;
        const color = document.getElementById('productColor').value;
        const quantity = parseInt(document.getElementById('productQuantity').value);

        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.retailPrice,
            image: product.images[0],
            quantity: quantity,
            size: size,
            color: color
        };

        // Save to localStorage for checkout page
        localStorage.setItem('cart', JSON.stringify([cartItem]));

        // Redirect to checkout
        window.location.href = 'checkout.html';
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
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getFallbackProducts() {
        // Fallback products in case JSON fails to load
        return [
            {
                id: "m001",
                name: "Classic Cotton T-Shirt",
                description: "Premium quality cotton t-shirt with modern fit.",
                category: "men",
                retailPrice: 24.99,
                wholesalePrice: 12.50,
                stock: 150,
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: ["White", "Black", "Navy"],
                featured: true,
                images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&crop=center"],
                videos: [],
                tags: ["cotton", "casual", "comfortable"],
                reviews: { rating: 4.5, count: 128 }
            }
        ];
    }
}

// Additional CSS for modals and notifications
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .category-btn {
        padding: 12px 24px;
        border: 2px solid #667eea;
        background: transparent;
        color: #667eea;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .category-btn:hover,
    .category-btn.active {
        background: #667eea;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
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
    
    .product-detail {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        align-items: start;
    }
    
    .thumbnail-images {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        flex-wrap: wrap;
    }
    
    .thumbnail {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }
    
    .thumbnail:hover,
    .thumbnail.active {
        border-color: #667eea;
        transform: scale(1.05);
    }
    
    .product-options {
        margin: 20px 0;
    }
    
    .product-options > div {
        margin-bottom: 15px;
    }
    
    .product-options label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #2c3e50;
    }
    
    .product-options select,
    .product-options input {
        width: 100%;
        padding: 10px;
        border: 2px solid #ecf0f1;
        border-radius: 8px;
        font-size: 14px;
    }
    
    .product-options select:focus,
    .product-options input:focus {
        border-color: #667eea;
        outline: none;
    }
    
    .stock-info {
        margin: 15px 0;
    }
    
    .in-stock {
        color: #27ae60;
        font-weight: 600;
    }
    
    .low-stock {
        color: #f39c12;
        font-weight: 600;
    }
    
    .product-tags {
        margin: 15px 0;
    }
    
    .tag {
        display: inline-block;
        background: #ecf0f1;
        color: #2c3e50;
        padding: 5px 12px;
        border-radius: 15px;
        font-size: 12px;
        margin: 2px;
    }
    
    .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 25px;
    }
    
    .cart-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        border-bottom: 1px solid #ecf0f1;
    }
    
    .item-details h4 {
        margin: 0 0 5px 0;
        color: #2c3e50;
    }
    
    .item-details p {
        margin: 2px 0;
        font-size: 14px;
        color: #7f8c8d;
    }
    
    .cart-total {
        text-align: center;
        padding: 20px;
        font-size: 18px;
        border-top: 2px solid #ecf0f1;
        margin-top: 20px;
    }
    
    .cart-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    }
    
    @media (max-width: 768px) {
        .product-detail {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .modal-content {
            margin: 10% auto;
            width: 95%;
            padding: 20px;
        }
        
        .category-filters {
            flex-direction: column;
            align-items: center;
        }
    }
`;

document.head.appendChild(additionalStyles);

// Initialize the products page
const productsPage = new ProductsPage();
