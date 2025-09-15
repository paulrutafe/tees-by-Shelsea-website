// Products Management Module

class ProductsManager {
    constructor(app) {
        this.app = app;
        this.filters = {
            category: 'all',
            priceRange: { min: 0, max: 1000 },
            sizes: [],
            colors: [],
            inStock: false
        };
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.setupProductEventListeners();
    }
    
    setupProductEventListeners() {
        // Advanced filtering
        this.createAdvancedFilters();
        
        // Sorting options
        this.createSortingOptions();
        
        // Product comparison
        this.setupProductComparison();
    }
    
    createAdvancedFilters() {
        const filtersContainer = document.querySelector('.filters');
        if (!filtersContainer) return;
        
        // Create advanced filters toggle
        const advancedToggle = document.createElement('button');
        advancedToggle.className = 'btn btn-secondary';
        advancedToggle.textContent = 'Advanced Filters';
        advancedToggle.onclick = () => this.toggleAdvancedFilters();
        
        // Create advanced filters panel
        const advancedPanel = document.createElement('div');
        advancedPanel.className = 'advanced-filters hidden';
        advancedPanel.id = 'advancedFilters';
        
        // Get unique values for filter options
        const allSizes = [...new Set(this.app.products.flatMap(p => p.sizes))].sort();
        const allColors = [...new Set(this.app.products.flatMap(p => p.colors))].sort();
        const priceRange = this.getPriceRange();
        
        advancedPanel.innerHTML = `
            <h4>Advanced Filters</h4>
            
            <div class="filter-group">
                <label>Price Range: $<span id="priceRangeLabel">${priceRange.min} - ${priceRange.max}</span></label>
                <div class="price-range">
                    <input type="range" id="minPrice" min="${priceRange.min}" max="${priceRange.max}" value="${priceRange.min}" class="range-slider">
                    <input type="range" id="maxPrice" min="${priceRange.min}" max="${priceRange.max}" value="${priceRange.max}" class="range-slider">
                </div>
            </div>
            
            <div class="filter-group">
                <label>Sizes:</label>
                <div class="checkbox-group">
                    ${allSizes.map(size => `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${size}" class="size-filter">
                            <span>${size}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="filter-group">
                <label>Colors:</label>
                <div class="checkbox-group">
                    ${allColors.map(color => `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${color}" class="color-filter">
                            <span>${color}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="filter-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="inStockOnly">
                    <span>In Stock Only</span>
                </label>
            </div>
            
            <div class="filter-actions">
                <button class="btn btn-primary" onclick="productManager.applyAdvancedFilters()">Apply Filters</button>
                <button class="btn btn-secondary" onclick="productManager.clearAdvancedFilters()">Clear All</button>
            </div>
        `;
        
        filtersContainer.appendChild(advancedToggle);
        filtersContainer.appendChild(advancedPanel);
        
        // Setup price range sliders
        this.setupPriceRangeSliders();
    }
    
    setupPriceRangeSliders() {
        const minSlider = document.getElementById('minPrice');
        const maxSlider = document.getElementById('maxPrice');
        const label = document.getElementById('priceRangeLabel');
        
        if (!minSlider || !maxSlider || !label) return;
        
        const updateLabel = () => {
            const min = parseInt(minSlider.value);
            const max = parseInt(maxSlider.value);
            
            if (min >= max) {
                minSlider.value = max - 1;
            }
            
            label.textContent = `$${minSlider.value} - $${maxSlider.value}`;
            this.filters.priceRange = { min: parseInt(minSlider.value), max: parseInt(maxSlider.value) };
        };
        
        minSlider.addEventListener('input', updateLabel);
        maxSlider.addEventListener('input', updateLabel);
    }
    
    createSortingOptions() {
        const filtersContainer = document.querySelector('.filters');
        if (!filtersContainer) return;
        
        const sortGroup = document.createElement('div');
        sortGroup.className = 'filter-group';
        sortGroup.innerHTML = `
            <label>Sort By:</label>
            <select id="sortSelect" class="filter-select">
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="stock-desc">Most in Stock</option>
                <option value="featured">Featured First</option>
            </select>
        `;
        
        filtersContainer.appendChild(sortGroup);
        
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            const [sortBy, order] = e.target.value.split('-');
            this.setSorting(sortBy, order);
            this.applyFiltersAndSort();
        });
    }
    
    getPriceRange() {
        const retailPrices = this.app.products.map(p => p.retailPrice);
        return {
            min: Math.floor(Math.min(...retailPrices)),
            max: Math.ceil(Math.max(...retailPrices))
        };
    }
    
    toggleAdvancedFilters() {
        const panel = document.getElementById('advancedFilters');
        panel.classList.toggle('hidden');
    }
    
    applyAdvancedFilters() {
        // Collect size filters
        const sizeFilters = Array.from(document.querySelectorAll('.size-filter:checked')).map(cb => cb.value);
        this.filters.sizes = sizeFilters;
        
        // Collect color filters
        const colorFilters = Array.from(document.querySelectorAll('.color-filter:checked')).map(cb => cb.value);
        this.filters.colors = colorFilters;
        
        // Get in stock filter
        this.filters.inStock = document.getElementById('inStockOnly')?.checked || false;
        
        this.applyFiltersAndSort();
    }
    
    clearAdvancedFilters() {
        // Reset all filters
        this.filters = {
            category: 'all',
            priceRange: this.getPriceRange(),
            sizes: [],
            colors: [],
            inStock: false
        };
        
        // Reset UI
        document.querySelectorAll('.size-filter, .color-filter').forEach(cb => cb.checked = false);
        document.getElementById('inStockOnly').checked = false;
        
        const priceRange = this.getPriceRange();
        document.getElementById('minPrice').value = priceRange.min;
        document.getElementById('maxPrice').value = priceRange.max;
        document.getElementById('priceRangeLabel').textContent = `$${priceRange.min} - ${priceRange.max}`;
        
        this.applyFiltersAndSort();
    }
    
    setSorting(sortBy, order = 'asc') {
        this.sortBy = sortBy;
        this.sortOrder = order;
    }
    
    applyFiltersAndSort() {
        let filteredProducts = [...this.app.products];
        
        // Apply category filter
        if (this.filters.category && this.filters.category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === this.filters.category);
        }
        
        // Apply price range filter
        const userAccountType = this.app.currentUser?.accountType || 'retail';
        filteredProducts = filteredProducts.filter(p => {
            const price = userAccountType === 'wholesale' ? p.wholesalePrice : p.retailPrice;
            return price >= this.filters.priceRange.min && price <= this.filters.priceRange.max;
        });
        
        // Apply size filter
        if (this.filters.sizes.length > 0) {
            filteredProducts = filteredProducts.filter(p => 
                this.filters.sizes.some(size => p.sizes.includes(size))
            );
        }
        
        // Apply color filter
        if (this.filters.colors.length > 0) {
            filteredProducts = filteredProducts.filter(p => 
                this.filters.colors.some(color => p.colors.includes(color))
            );
        }
        
        // Apply stock filter
        if (this.filters.inStock) {
            filteredProducts = filteredProducts.filter(p => p.stock > 0);
        }
        
        // Apply sorting
        filteredProducts.sort((a, b) => {
            let comparison = 0;
            
            switch (this.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'price':
                    const priceA = userAccountType === 'wholesale' ? a.wholesalePrice : a.retailPrice;
                    const priceB = userAccountType === 'wholesale' ? b.wholesalePrice : b.retailPrice;
                    comparison = priceA - priceB;
                    break;
                case 'stock':
                    comparison = a.stock - b.stock;
                    break;
                case 'featured':
                    comparison = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
                    break;
                default:
                    comparison = 0;
            }
            
            return this.sortOrder === 'desc' ? -comparison : comparison;
        });
        
        this.app.renderProducts(filteredProducts);
        this.showFilterResults(filteredProducts.length);
    }
    
    showFilterResults(count) {
        // Show results count
        let resultsInfo = document.getElementById('filterResults');
        if (!resultsInfo) {
            resultsInfo = document.createElement('div');
            resultsInfo.id = 'filterResults';
            resultsInfo.className = 'filter-results';
            document.querySelector('.products-section .container').insertBefore(
                resultsInfo, 
                document.getElementById('productsGrid')
            );
        }
        
        resultsInfo.innerHTML = `
            <p>Showing ${count} product${count !== 1 ? 's' : ''}</p>
            ${count === 0 ? '<p class="no-results">No products match your criteria. Try adjusting your filters.</p>' : ''}
        `;
    }
    
    setupProductComparison() {
        this.comparisonList = [];
        this.maxComparisons = 3;
        
        // Add compare buttons to products
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('compare-btn') || e.target.closest('.compare-btn')) {
                const productCard = e.target.closest('.product-card');
                const productId = productCard.dataset.productId;
                this.toggleProductComparison(productId);
            }
        });
        
        this.createComparisonBar();
    }
    
    createComparisonBar() {
        const comparisonBar = document.createElement('div');
        comparisonBar.id = 'comparisonBar';
        comparisonBar.className = 'comparison-bar hidden';
        comparisonBar.innerHTML = `
            <div class="comparison-content">
                <div class="comparison-items" id="comparisonItems"></div>
                <div class="comparison-actions">
                    <button class="btn btn-primary" onclick="productManager.showComparison()">Compare</button>
                    <button class="btn btn-secondary" onclick="productManager.clearComparison()">Clear</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(comparisonBar);
    }
    
    toggleProductComparison(productId) {
        const index = this.comparisonList.indexOf(productId);
        
        if (index > -1) {
            // Remove from comparison
            this.comparisonList.splice(index, 1);
        } else {
            // Add to comparison
            if (this.comparisonList.length >= this.maxComparisons) {
                this.app.showNotification(`Maximum ${this.maxComparisons} products can be compared`, 'info');
                return;
            }
            this.comparisonList.push(productId);
        }
        
        this.updateComparisonBar();
        this.updateCompareButtons();
    }
    
    updateComparisonBar() {
        const bar = document.getElementById('comparisonBar');
        const itemsContainer = document.getElementById('comparisonItems');
        
        if (this.comparisonList.length === 0) {
            bar.classList.add('hidden');
            return;
        }
        
        bar.classList.remove('hidden');
        
        itemsContainer.innerHTML = this.comparisonList.map(productId => {
            const product = this.app.products.find(p => p.id === productId);
            return product ? `
                <div class="comparison-item">
                    <span>${product.name}</span>
                    <button onclick="productManager.toggleProductComparison('${productId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            ` : '';
        }).join('');
    }
    
    updateCompareButtons() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.dataset.productId;
            const isComparing = this.comparisonList.includes(productId);
            
            let compareBtn = card.querySelector('.compare-btn');
            if (!compareBtn) {
                compareBtn = document.createElement('button');
                compareBtn.className = 'btn-icon compare-btn';
                compareBtn.title = 'Compare';
                compareBtn.innerHTML = '<i class="fas fa-balance-scale"></i>';
                
                const actionsDiv = card.querySelector('.product-actions');
                if (actionsDiv) {
                    actionsDiv.appendChild(compareBtn);
                }
            }
            
            compareBtn.classList.toggle('active', isComparing);
            compareBtn.title = isComparing ? 'Remove from comparison' : 'Add to comparison';
        });
    }
    
    showComparison() {
        if (this.comparisonList.length < 2) {
            this.app.showNotification('Select at least 2 products to compare', 'info');
            return;
        }
        
        const products = this.comparisonList.map(id => 
            this.app.products.find(p => p.id === id)
        ).filter(Boolean);
        
        this.renderComparisonModal(products);
    }
    
    renderComparisonModal(products) {
        // Create comparison modal
        let modal = document.getElementById('comparisonModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'comparisonModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        const userAccountType = this.app.currentUser?.accountType || 'retail';
        
        modal.innerHTML = `
            <div class="modal-content comparison-modal-content">
                <span class="close-modal">&times;</span>
                <h3>Product Comparison</h3>
                <div class="comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                ${products.map(p => `<th>${p.name}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Price</strong></td>
                                ${products.map(p => {
                                    const price = userAccountType === 'wholesale' ? p.wholesalePrice : p.retailPrice;
                                    return `<td>$${price}</td>`;
                                }).join('')}
                            </tr>
                            <tr>
                                <td><strong>Category</strong></td>
                                ${products.map(p => `<td>${p.category}</td>`).join('')}
                            </tr>
                            <tr>
                                <td><strong>Available Sizes</strong></td>
                                ${products.map(p => `<td>${p.sizes.join(', ')}</td>`).join('')}
                            </tr>
                            <tr>
                                <td><strong>Available Colors</strong></td>
                                ${products.map(p => `<td>${p.colors.join(', ')}</td>`).join('')}
                            </tr>
                            <tr>
                                <td><strong>Stock</strong></td>
                                ${products.map(p => `<td>${p.stock} units</td>`).join('')}
                            </tr>
                            <tr>
                                <td><strong>Description</strong></td>
                                ${products.map(p => `<td>${p.description}</td>`).join('')}
                            </tr>
                            <tr>
                                <td><strong>Actions</strong></td>
                                ${products.map(p => `
                                    <td>
                                        <button class="btn btn-primary btn-small" onclick="app.showProductDetails('${p.id}')">
                                            View Details
                                        </button>
                                        <button class="btn btn-secondary btn-small" onclick="app.addToCart('${p.id}')">
                                            Add to Cart
                                        </button>
                                    </td>
                                `).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Setup close functionality
        modal.querySelector('.close-modal').onclick = () => {
            this.app.hideModal(modal);
        };
        
        this.app.showModal(modal);
    }
    
    clearComparison() {
        this.comparisonList = [];
        this.updateComparisonBar();
        this.updateCompareButtons();
    }
    
    // Get product statistics
    getProductStats() {
        const stats = {
            total: this.app.products.length,
            byCategory: {},
            avgPrice: 0,
            priceRange: this.getPriceRange(),
            inStock: 0,
            outOfStock: 0,
            featured: 0
        };
        
        let totalPrice = 0;
        
        this.app.products.forEach(product => {
            // Category breakdown
            stats.byCategory[product.category] = (stats.byCategory[product.category] || 0) + 1;
            
            // Price calculation
            totalPrice += product.retailPrice;
            
            // Stock status
            if (product.stock > 0) {
                stats.inStock++;
            } else {
                stats.outOfStock++;
            }
            
            // Featured count
            if (product.featured) {
                stats.featured++;
            }
        });
        
        stats.avgPrice = totalPrice / this.app.products.length;
        
        return stats;
    }
}

// Initialize products manager when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.productManager = new ProductsManager(window.app);
    } else {
        setTimeout(() => {
            window.productManager = new ProductsManager(window.app);
        }, 100);
    }
});