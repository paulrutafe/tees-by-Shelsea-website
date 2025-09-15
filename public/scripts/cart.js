// Shopping Cart Module

class CartManager {
    constructor(app) {
        this.app = app;
        this.setupCartEventListeners();
    }
    
    setupCartEventListeners() {
        // Cart operations are handled in the main app
        // This module provides additional cart utilities
    }
    
    // Calculate cart totals with tax and shipping
    calculateCartTotals() {
        const subtotal = this.app.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.08; // 8% tax
        const tax = subtotal * taxRate;
        const shippingThreshold = 50; // Free shipping over $50
        const shippingCost = subtotal >= shippingThreshold ? 0 : 9.99;
        const total = subtotal + tax + shippingCost;
        
        return {
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            shipping: shippingCost.toFixed(2),
            total: total.toFixed(2),
            freeShipping: subtotal >= shippingThreshold
        };
    }
    
    // Validate cart items against current inventory
    async validateCart() {
        const validation = {
            valid: true,
            issues: []
        };
        
        for (const cartItem of this.app.cart) {
            const product = this.app.products.find(p => p.id === cartItem.productId);
            
            if (!product) {
                validation.valid = false;
                validation.issues.push(`Product "${cartItem.name}" is no longer available`);
                continue;
            }
            
            if (product.stock < cartItem.quantity) {
                validation.valid = false;
                validation.issues.push(`Only ${product.stock} units of "${product.name}" available`);
            }
            
            if (!product.sizes.includes(cartItem.size)) {
                validation.valid = false;
                validation.issues.push(`Size "${cartItem.size}" no longer available for "${product.name}"`);
            }
            
            if (!product.colors.includes(cartItem.color)) {
                validation.valid = false;
                validation.issues.push(`Color "${cartItem.color}" no longer available for "${product.name}"`);
            }
            
            // Check if price has changed
            const currentPrice = this.app.currentUser?.accountType === 'wholesale' 
                ? product.wholesalePrice 
                : product.retailPrice;
            
            if (Math.abs(currentPrice - cartItem.price) > 0.01) {
                cartItem.price = currentPrice; // Update price
                validation.issues.push(`Price updated for "${product.name}"`);
            }
        }
        
        return validation;
    }
    
    // Get cart summary for display
    getCartSummary() {
        const totalItems = this.app.cart.reduce((sum, item) => sum + item.quantity, 0);
        const uniqueProducts = this.app.cart.length;
        const totals = this.calculateCartTotals();
        
        return {
            totalItems,
            uniqueProducts,
            ...totals
        };
    }
    
    // Bulk operations
    updateAllQuantities(multiplier) {
        this.app.cart.forEach(item => {
            item.quantity = Math.max(1, Math.floor(item.quantity * multiplier));
        });
        this.app.saveCartToStorage();
        this.app.updateCartUI();
    }
    
    // Remove items of specific category
    removeByCategory(category) {
        this.app.cart = this.app.cart.filter(item => {
            const product = this.app.products.find(p => p.id === item.productId);
            return !product || product.category !== category;
        });
        this.app.saveCartToStorage();
        this.app.updateCartUI();
    }
    
    // Get recommended products based on cart contents
    getRecommendedProducts(limit = 4) {
        if (this.app.cart.length === 0) {
            return this.app.products.filter(p => p.featured).slice(0, limit);
        }
        
        // Get categories of items in cart
        const cartCategories = [...new Set(this.app.cart.map(item => {
            const product = this.app.products.find(p => p.id === item.productId);
            return product?.category;
        }).filter(Boolean))];
        
        // Find products in similar categories
        const recommendations = this.app.products.filter(product => {
            // Don't recommend items already in cart
            if (this.app.cart.some(item => item.productId === product.id)) {
                return false;
            }
            
            // Recommend products from same categories
            return cartCategories.includes(product.category);
        });
        
        // If not enough recommendations, add featured products
        if (recommendations.length < limit) {
            const featured = this.app.products.filter(p => 
                p.featured && 
                !recommendations.some(r => r.id === p.id) &&
                !this.app.cart.some(item => item.productId === p.id)
            );
            recommendations.push(...featured);
        }
        
        return recommendations.slice(0, limit);
    }
    
    // Export cart for external processing
    exportCart() {
        const summary = this.getCartSummary();
        const cartData = {
            timestamp: new Date().toISOString(),
            user: this.app.currentUser,
            items: this.app.cart,
            summary
        };
        
        // Create downloadable JSON
        const blob = new Blob([JSON.stringify(cartData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cart-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Import cart from file
    importCart(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const cartData = JSON.parse(e.target.result);
                if (cartData.items && Array.isArray(cartData.items)) {
                    this.app.cart = cartData.items;
                    this.app.saveCartToStorage();
                    this.app.updateCartUI();
                    this.app.showNotification('Cart imported successfully!', 'success');
                } else {
                    throw new Error('Invalid cart file format');
                }
            } catch (error) {
                this.app.showNotification('Failed to import cart file', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    // Save cart as wish list
    saveAsWishList(name) {
        const wishLists = JSON.parse(localStorage.getItem('wishLists') || '[]');
        const wishList = {
            id: Date.now().toString(),
            name: name || `Wishlist ${wishLists.length + 1}`,
            items: [...this.app.cart],
            createdAt: new Date().toISOString()
        };
        
        wishLists.push(wishList);
        localStorage.setItem('wishLists', JSON.stringify(wishLists));
        
        this.app.showNotification(`Saved as "${wishList.name}"`, 'success');
        return wishList;
    }
    
    // Load wish list into cart
    loadWishList(wishListId, replace = false) {
        const wishLists = JSON.parse(localStorage.getItem('wishLists') || '[]');
        const wishList = wishLists.find(wl => wl.id === wishListId);
        
        if (wishList) {
            if (replace) {
                this.app.cart = [...wishList.items];
            } else {
                // Merge with current cart
                wishList.items.forEach(item => {
                    const existingItem = this.app.cart.find(cartItem => 
                        cartItem.productId === item.productId &&
                        cartItem.size === item.size &&
                        cartItem.color === item.color
                    );
                    
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                    } else {
                        this.app.cart.push({...item});
                    }
                });
            }
            
            this.app.saveCartToStorage();
            this.app.updateCartUI();
            this.app.showNotification(`Loaded "${wishList.name}"`, 'success');
        }
    }
    
    // Proceed to checkout
    proceedToCheckout() {
        if (this.app.cart.length === 0) {
            this.app.showNotification('Your cart is empty', 'error');
            return;
        }
        
        // Save cart to localStorage for checkout page
        localStorage.setItem('cart', JSON.stringify(this.app.cart));
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }
    
    // Quick checkout (for single product)
    quickCheckout(productId, size, color, quantity = 1) {
        const product = this.app.products.find(p => p.id === productId);
        if (!product) return;
        
        const price = this.app.currentUser?.accountType === 'wholesale' 
            ? product.wholesalePrice 
            : product.retailPrice;
        
        const cartItem = {
            productId,
            name: product.name,
            price,
            size,
            color,
            quantity,
            image: product.images[0],
            addedAt: new Date().toISOString()
        };
        
        // Clear cart and add only this item
        localStorage.setItem('cart', JSON.stringify([cartItem]));
        
        // Redirect to checkout
        window.location.href = 'checkout.html';
    }
    
    // Get cart analytics
    getCartAnalytics() {
        const analytics = {
            totalValue: 0,
            averageItemPrice: 0,
            categoryBreakdown: {},
            sizeBreakdown: {},
            colorBreakdown: {},
            quantityBreakdown: {
                single: 0,
                multiple: 0
            }
        };
        
        this.app.cart.forEach(item => {
            analytics.totalValue += item.price * item.quantity;
            
            const product = this.app.products.find(p => p.id === item.productId);
            if (product) {
                // Category breakdown
                analytics.categoryBreakdown[product.category] = 
                    (analytics.categoryBreakdown[product.category] || 0) + item.quantity;
            }
            
            // Size breakdown
            analytics.sizeBreakdown[item.size] = 
                (analytics.sizeBreakdown[item.size] || 0) + item.quantity;
            
            // Color breakdown
            analytics.colorBreakdown[item.color] = 
                (analytics.colorBreakdown[item.color] || 0) + item.quantity;
            
            // Quantity breakdown
            if (item.quantity === 1) {
                analytics.quantityBreakdown.single++;
            } else {
                analytics.quantityBreakdown.multiple++;
            }
        });
        
        if (this.app.cart.length > 0) {
            analytics.averageItemPrice = analytics.totalValue / 
                this.app.cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        return analytics;
    }
}

// Initialize cart manager when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.cartManager = new CartManager(window.app);
    } else {
        setTimeout(() => {
            window.cartManager = new CartManager(window.app);
        }, 100);
    }
});