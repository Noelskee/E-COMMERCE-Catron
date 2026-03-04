// checkout.js - Shopping cart page for checkout.cshtml

(async function () {
    // DOM Elements
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartEl = document.getElementById('emptyCart');
    const itemCountEl = document.getElementById('itemCount');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const discountEl = document.getElementById('discount');
    const finalTotalEl = document.getElementById('finalTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // State
    let cart = [];
    const SHIPPING_COST = 150;
    let discountAmount = 0;

    // Initialize cart page
    function initializeCart() {
        loadCart();
        renderCart();
        attachEventListeners();
        updateCartCount();
    }

    // Load cart from localStorage
    function loadCart() {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
    }

    // Render cart items
    function renderCart() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            showEmptyCart();
            return;
        }

        hideEmptyCart();
        cartItemsContainer.innerHTML = "";

        cart.forEach((item, index) => {
            const row = createCartRow(item, index);
            cartItemsContainer.appendChild(row);
        });

        updateTotals();
        updateItemCount();
    }

    // Create cart row element
    function createCartRow(item, index) {
        const row = document.createElement("tr");
        row.className = "cart-item";

        const total = (item.price * item.quantity).toFixed(2);
        let productTitle = item.title;
        if (item.optionSelected) {
            productTitle += ` <small class="text-muted">(${item.optionSelected})</small>`;
        }

        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.image}" height="60px" alt="${item.title}" class="me-3" style="object-fit: contain;">
                    <div>${productTitle}</div>
                </div>
            </td>
            <td class="text-success fw-bold">₱${parseFloat(item.price).toLocaleString()}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary qty-decrease" data-index="${index}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" 
                           class="form-control text-center" style="width: 70px;" 
                           data-index="${index}" readonly>
                    <button class="btn btn-sm btn-outline-secondary qty-increase" data-index="${index}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </td>
            <td class="fw-bold text-success">₱${parseFloat(total).toLocaleString()}</td>
            <td>
                <button class="btn btn-danger btn-sm btn-remove" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        return row;
    }

    // Show empty cart message
    function showEmptyCart() {
        const tableWrapper = document.querySelector('.table-responsive');
        if (tableWrapper) {
            tableWrapper.style.display = 'none';
        }
        if (emptyCartEl) {
            emptyCartEl.style.display = 'block';
        }
        updateTotals();
    }

    // Hide empty cart message
    function hideEmptyCart() {
        const tableWrapper = document.querySelector('.table-responsive');
        if (tableWrapper) {
            tableWrapper.style.display = 'block';
        }
        if (emptyCartEl) {
            emptyCartEl.style.display = 'none';
        }
    }

    // Update totals
    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = cart.length > 0 ? SHIPPING_COST : 0;
        const total = subtotal + shipping - discountAmount;

        if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toLocaleString()}`;
        if (shippingEl) shippingEl.textContent = `₱${shipping.toLocaleString()}`;
        if (discountEl) discountEl.textContent = `-₱${discountAmount.toLocaleString()}`;
        if (finalTotalEl) finalTotalEl.textContent = `₱${total.toLocaleString()}`;
    }

    // Update item count
    function updateItemCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (itemCountEl) {
            itemCountEl.textContent = count;
        }
    }

    // Attach event listeners
    function attachEventListeners() {
        // Use event delegation for dynamically created buttons
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;

                const index = parseInt(target.dataset.index);

                if (target.classList.contains('qty-increase')) {
                    increaseQuantity(index);
                } else if (target.classList.contains('qty-decrease')) {
                    decreaseQuantity(index);
                } else if (target.classList.contains('btn-remove')) {
                    removeItem(index);
                }
            });
        }

        // Checkout button
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', proceedToCheckout);
        }
    }

    // Increase quantity
    function increaseQuantity(index) {
        if (cart[index]) {
            cart[index].quantity++;
            saveCart();
            renderCart();
        }
    }

    // Decrease quantity
    function decreaseQuantity(index) {
        if (cart[index] && cart[index].quantity > 1) {
            cart[index].quantity--;
            saveCart();
            renderCart();
        }
    }

    // Remove item
    function removeItem(index) {
        if (confirm('Remove this item from cart?')) {
            cart.splice(index, 1);
            saveCart();
            renderCart();
        }
    }

    // Proceed to checkout
    function proceedToCheckout() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        window.location.href = '/payment';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCart);
    } else {
        initializeCart();
    }
})();