// addCart.js - Cart management utility functions

/**
 * Get cart from localStorage
 * @returns {Array} Cart items array
 */
function getCart() {
    try {
        const cartData = localStorage.getItem("cart");
        return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
        console.error("Error reading cart:", error);
        return [];
    }
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items array
 * @returns {boolean} Success status
 */
function saveCart(cart) {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        return true;
    } catch (error) {
        console.error("Error saving cart:", error);
        return false;
    }
}

/**
 * Add item to cart
 * @param {Object} item - Item to add {id, title, price, optionSelected, quantity, image}
 * @returns {boolean} Success status
 */
function addToCart(item) {
    if (!item || !item.id || !item.title || !item.price) {
        console.error("Invalid item data");
        return false;
    }

    const cart = getCart();

    // Find if same product with same option exists
    const existingIndex = cart.findIndex(cartItem =>
        cartItem.id === item.id &&
        cartItem.optionSelected === item.optionSelected
    );

    if (existingIndex > -1) {
        // Update quantity of existing item
        cart[existingIndex].quantity += item.quantity || 1;
    } else {
        // Add new item to cart
        cart.push({
            id: item.id,
            title: item.title,
            price: parseFloat(item.price),
            optionSelected: item.optionSelected || null,
            quantity: item.quantity || 1,
            image: item.image || ""
        });
    }

    return saveCart(cart);
}

/**
 * Remove item from cart
 * @param {number} index - Index of item to remove
 * @returns {boolean} Success status
 */
function removeFromCart(index) {
    const cart = getCart();

    if (index < 0 || index >= cart.length) {
        console.error("Invalid cart index");
        return false;
    }

    cart.splice(index, 1);
    return saveCart(cart);
}

/**
 * Update item quantity in cart
 * @param {number} index - Index of item
 * @param {number} quantity - New quantity
 * @returns {boolean} Success status
 */
function updateCartItemQuantity(index, quantity) {
    const cart = getCart();

    if (index < 0 || index >= cart.length) {
        console.error("Invalid cart index");
        return false;
    }

    if (quantity < 1) {
        console.error("Quantity must be at least 1");
        return false;
    }

    cart[index].quantity = parseInt(quantity);
    return saveCart(cart);
}

/**
 * Clear entire cart
 * @returns {boolean} Success status
 */
function clearCart() {
    try {
        localStorage.removeItem("cart");
        updateCartCount();
        return true;
    } catch (error) {
        console.error("Error clearing cart:", error);
        return false;
    }
}

/**
 * Get total number of items in cart
 * @returns {number} Total item count
 */
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Get cart subtotal (without shipping/tax)
 * @returns {number} Subtotal amount
 */
function getCartSubtotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Get cart total (with shipping)
 * @param {number} shippingCost - Shipping cost to add
 * @returns {number} Total amount
 */
function getCartTotal(shippingCost = 0) {
    return getCartSubtotal() + shippingCost;
}

/**
 * Check if product is in cart
 * @param {string|number} productId - Product ID to check
 * @param {string} option - Product option (optional)
 * @returns {boolean} True if product is in cart
 */
function isInCart(productId, option = null) {
    const cart = getCart();
    return cart.some(item =>
        item.id == productId &&
        (option === null || item.optionSelected === option)
    );
}

/**
 * Get specific cart item
 * @param {number} index - Index of item
 * @returns {Object|null} Cart item or null
 */
function getCartItem(index) {
    const cart = getCart();
    return cart[index] || null;
}

/**
 * Update cart display count in navbar
 */
function updateCartCount() {
    const counter = document.getElementById("cartCount");
    if (counter) {
        const count = getCartItemCount();
        counter.textContent = count;

        // Add animation
        counter.classList.add('updated');
        setTimeout(() => {
            counter.classList.remove('updated');
        }, 300);
    }
}

/**
 * Validate cart item structure
 * @param {Object} item - Item to validate
 * @returns {boolean} True if valid
 */
function validateCartItem(item) {
    if (!item) return false;

    const hasRequiredFields =
        item.hasOwnProperty('id') &&
        item.hasOwnProperty('title') &&
        item.hasOwnProperty('price') &&
        item.hasOwnProperty('quantity');

    const hasValidValues =
        item.id !== null &&
        item.title !== '' &&
        !isNaN(item.price) &&
        item.quantity > 0;

    return hasRequiredFields && hasValidValues;
}

/**
 * Merge carts (useful for user login scenarios)
 * @param {Array} cart1 - First cart
 * @param {Array} cart2 - Second cart
 * @returns {Array} Merged cart
 */
function mergeCarts(cart1, cart2) {
    const merged = [...cart1];

    cart2.forEach(item2 => {
        const existingIndex = merged.findIndex(item1 =>
            item1.id === item2.id &&
            item1.optionSelected === item2.optionSelected
        );

        if (existingIndex > -1) {
            merged[existingIndex].quantity += item2.quantity;
        } else {
            merged.push(item2);
        }
    });

    return merged;
}

/**
 * Export cart data (for backup or transfer)
 * @returns {string} JSON string of cart
 */
function exportCart() {
    const cart = getCart();
    return JSON.stringify(cart, null, 2);
}

/**
 * Import cart data
 * @param {string} cartJSON - JSON string of cart
 * @returns {boolean} Success status
 */
function importCart(cartJSON) {
    try {
        const cart = JSON.parse(cartJSON);

        if (!Array.isArray(cart)) {
            throw new Error("Invalid cart format");
        }

        // Validate all items
        const allValid = cart.every(validateCartItem);
        if (!allValid) {
            throw new Error("Invalid cart items");
        }

        return saveCart(cart);
    } catch (error) {
        console.error("Error importing cart:", error);
        return false;
    }
}

// Initialize cart count on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCartCount);
} else {
    updateCartCount();
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCart,
        saveCart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartItemCount,
        getCartSubtotal,
        getCartTotal,
        isInCart,
        getCartItem,
        updateCartCount,
        validateCartItem,
        mergeCarts,
        exportCart,
        importCart
    };
}