// addProduct.js - Quick add product to cart functionality

/**
 * Quick add product to cart from listing page
 * @param {number|string} productId - Product ID
 * @param {Object} options - Additional options
 * @returns {Promise<boolean>} Success status
 */
async function quickAddProduct(productId, options = {}) {
    try {
        // Load product database
        const database = await loadProductDatabase();

        // Find product
        const product = database.find(p => p.id == productId);

        if (!product) {
            showNotification('Product not found', 'error');
            return false;
        }

        // Prepare cart item
        const cartItem = {
            id: product.id,
            title: product.title,
            price: parseFloat(product.price[0].replace(',', '')),
            optionSelected: options.option || (product.options ? product.options[0] : null),
            quantity: options.quantity || 1,
            image: product.image
        };

        // Add to cart
        const success = addToCart(cartItem);

        if (success) {
            showNotification(`${product.title} added to cart!`, 'success');
            updateCartCount();
            return true;
        } else {
            showNotification('Failed to add product to cart', 'error');
            return false;
        }

    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('An error occurred', 'error');
        return false;
    }
}

/**
 * Add product with custom options
 * @param {number|string} productId - Product ID
 * @param {string} selectedOption - Selected product option
 * @param {number} quantity - Quantity to add
 * @returns {Promise<boolean>} Success status
 */
async function addProductWithOptions(productId, selectedOption, quantity = 1) {
    try {
        const database = await loadProductDatabase();
        const product = database.find(p => p.id == productId);

        if (!product) {
            showNotification('Product not found', 'error');
            return false;
        }

        // Find option index and corresponding price
        let priceIndex = 0;
        if (selectedOption && product.options) {
            const optionIndex = product.options.indexOf(selectedOption);
            if (optionIndex > -1) {
                priceIndex = product.optionsPrice[optionIndex] || 0;
            }
        }

        const price = parseFloat(product.price[priceIndex].replace(',', ''));

        const cartItem = {
            id: product.id,
            title: product.title,
            price: price,
            optionSelected: selectedOption,
            quantity: quantity,
            image: product.image
        };

        const success = addToCart(cartItem);

        if (success) {
            const optionText = selectedOption ? ` (${selectedOption})` : '';
            showNotification(`${product.title}${optionText} added to cart!`, 'success');
            updateCartCount();
            return true;
        }

        return false;

    } catch (error) {
        console.error('Error adding product with options:', error);
        showNotification('Failed to add product', 'error');
        return false;
    }
}

/**
 * Batch add multiple products to cart
 * @param {Array} products - Array of {productId, option, quantity}
 * @returns {Promise<Object>} Result with success count
 */
async function batchAddProducts(products) {
    let successCount = 0;
    let failCount = 0;

    for (const item of products) {
        const success = await quickAddProduct(item.productId, {
            option: item.option,
            quantity: item.quantity || 1
        });

        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    if (successCount > 0) {
        showNotification(`${successCount} product(s) added to cart!`, 'success');
    }

    if (failCount > 0) {
        showNotification(`${failCount} product(s) failed to add`, 'warning');
    }

    return { success: successCount, failed: failCount };
}

/**
 * Load product database
 * @returns {Promise<Array>} Product database
 */
async function loadProductDatabase() {
    try {
        const response = await fetch("/json/product.Json");

        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        const database = await response.json();
        return database;

    } catch (error) {
        console.error('Error loading product database:', error);
        return [];
    }
}

/**
 * Show notification to user
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Try to use alert as fallback
    if (typeof createToast === 'function') {
        createToast(message, type);
    } else {
        alert(message);
    }
}

/**
 * Create toast notification (optional enhancement)
 * @param {string} message - Message to display
 * @param {string} type - Toast type
 */
function createToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.cart-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `cart-toast cart-toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00cc44' : type === 'error' ? '#ff5252' : '#ffa726'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Add click handlers to all "Add to Cart" buttons on page
 */
function initializeAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn, .quick-add-btn').forEach(button => {
        button.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const productId = this.dataset.productId || this.getAttribute('data-product-id');
            const option = this.dataset.option || null;
            const quantity = parseInt(this.dataset.quantity) || 1;

            if (!productId) {
                console.error('No product ID found on button');
                return;
            }

            // Disable button during add
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

            // Add product
            const success = await quickAddProduct(productId, { option, quantity });

            // Re-enable button
            this.disabled = false;

            if (success) {
                this.innerHTML = '<i class="fas fa-check"></i> Added!';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            } else {
                this.innerHTML = originalText;
            }
        });
    });
}

/**
 * Buy now - Add to cart and go to checkout
 * @param {number|string} productId - Product ID
 * @param {Object} options - Additional options
 */
async function buyNow(productId, options = {}) {
    const success = await quickAddProduct(productId, options);

    if (success) {
        // Redirect to cart/checkout page
        window.location.href = 'checkout';
    }
}

/**
 * Add product and show cart preview
 * @param {number|string} productId - Product ID
 * @param {Object} options - Additional options
 */
async function addAndPreview(productId, options = {}) {
    const success = await quickAddProduct(productId, options);

    if (success && typeof showCartPreview === 'function') {
        showCartPreview();
    }
}

// Add CSS for toast animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .cart-toast i {
        font-size: 20px;
    }
`;
document.head.appendChild(toastStyles);

// Auto-initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAddToCartButtons);
} else {
    initializeAddToCartButtons();
}

// Re-initialize after dynamic content loads
const observer = new MutationObserver(() => {
    initializeAddToCartButtons();
});

if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        quickAddProduct,
        addProductWithOptions,
        batchAddProducts,
        buyNow,
        addAndPreview,
        initializeAddToCartButtons
    };
}