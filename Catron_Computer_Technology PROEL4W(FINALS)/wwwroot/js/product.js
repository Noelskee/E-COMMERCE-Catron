// product.js - Product detail/overview page for productOverview.cshtml

(async function () {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    // DOM Elements
    const titleEl = document.getElementById('title');
    const priceEl = document.getElementById('price');
    const descriptionEl = document.getElementById('description');
    const imageEl = document.getElementById('image');
    const optionEl = document.getElementById('option');
    const quantityEl = document.getElementById('quantity');
    const addToCartBtn = document.getElementById('addCart');

    // State variables
    let database = [];
    let currentProduct = null;
    let currentPriceIndex = 0;
    let currentQuantity = 1;
    let selectedOption = null;

    // Load database from JSON file
    async function loadDB() {
        try {
            const response = await fetch('/json/product.json');
            if (!response.ok) {
                throw new Error('Failed to load database');
            }
            return await response.json();
        } catch (error) {
            console.error("Error loading database:", error);
            return [];
        }
    }

    // Update cart count in navbar
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        const cartCountElements = document.querySelectorAll('.cart-count, #cartCount');
        cartCountElements.forEach(el => {
            if (el) el.textContent = totalItems;
        });
    }

    // Load and initialize product
    async function initializeProduct() {
        try {
            // Check if product ID exists
            if (!productId) {
                console.error("No product ID in URL");
                alert("Product ID not found!");
                window.location.href = "/products";
                return;
            }

            database = await loadDB();

            if (!database || database.length === 0) {
                console.error("Database is empty or not loaded");
                alert("Error loading products database!");
                return;
            }

            // Convert productId to number for comparison
            const productIndex = parseInt(productId);

            if (productIndex < 0 || productIndex >= database.length) {
                console.error(`Product index ${productIndex} out of range`);
                alert("Product not found!");
                window.location.href = "/products";
                return;
            }

            currentProduct = database[productIndex];

            if (!currentProduct) {
                console.error("Product is null or undefined");
                alert("Product not found!");
                window.location.href = "/products";
                return;
            }

            currentQuantity = parseInt(quantityEl?.innerHTML || 1);

            updateUI();
            initializeOptions();
            attachEventListeners();
            updateCartCount();
        } catch (error) {
            console.error("Error initializing product:", error);
            alert("Error loading product details!");
        }
    }

    // Update UI with product data
    function updateUI() {
        if (!currentProduct) return;

        const currentPrice = currentProduct.price[currentPriceIndex];

        if (titleEl) titleEl.innerHTML = currentProduct.title;
        if (priceEl) priceEl.innerHTML = '₱' + currentPrice;
        if (descriptionEl) descriptionEl.innerHTML = currentProduct.description;
        if (optionEl) optionEl.innerHTML = currentProduct.optionName + ':';
        if (imageEl) imageEl.src = currentProduct.image;

        updateAddToCartButton();
    }

    // Initialize product options
    function initializeOptions() {
        if (!currentProduct || !currentProduct.options) return;

        const optionHolder = document.getElementById("optionHolder");
        if (!optionHolder) return;

        optionHolder.innerHTML = '';

        currentProduct.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'btn btn-primary p-3 m-2 productOptionBtn';
            button.textContent = option;
            button.dataset.index = index;
            button.dataset.priceIndex = currentProduct.optionsPrice[index];
            button.type = 'button';

            if (index === 0) {
                button.classList.add('Pselected');
                selectedOption = option;
            }

            optionHolder.appendChild(button);
        });
    }

    // Change price based on selected option
    function changePrice(priceIndex) {
        currentPriceIndex = priceIndex;
        const currentPrice = currentProduct.price[currentPriceIndex];

        if (priceEl) {
            priceEl.innerHTML = '₱' + currentPrice;
        }

        updateAddToCartButton();
    }

    // Update add to cart button text
    function updateAddToCartButton() {
        if (!addToCartBtn || !currentProduct) return;

        const priceStr = currentProduct.price[currentPriceIndex].toString().replace(/,/g, '');
        const price = parseFloat(priceStr);
        const total = Math.round(price * currentQuantity * 100) / 100;

        // Update the button with new structure
        addToCartBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Add to Cart (₱${total.toLocaleString()})</span>
            <span class="btn-shine"></span>
        `;
    }

    // Attach event listeners
    function attachEventListeners() {
        // Quantity buttons
        document.querySelectorAll('.quantityBtn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });

        // Option buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('productOptionBtn')) {
                handleOptionSelect(e);
            }
        });

        // Add to cart button
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', addProductToCart);
        }
    }

    // Handle quantity change
    function handleQuantityChange(e) {
        const btn = e.target.closest('.quantityBtn');
        if (!btn) return;

        const action = btn.classList.contains('minus') ? '-' : '+';

        if (action === '-') {
            if (currentQuantity > 1) {
                currentQuantity--;
            }
        } else if (action === '+') {
            currentQuantity++;
        }

        if (quantityEl) {
            quantityEl.innerHTML = currentQuantity;
        }

        updateAddToCartButton();
    }

    // Handle option selection
    function handleOptionSelect(e) {
        const btn = e.target;

        // Remove previous selection
        document.querySelectorAll('.productOptionBtn').forEach(b => {
            b.classList.remove('Pselected');
        });

        // Add selection to current button
        btn.classList.add('Pselected');

        // Update selected option and price
        selectedOption = btn.textContent;
        const priceIndex = parseInt(btn.dataset.priceIndex);
        changePrice(priceIndex);
    }

    // Add product to cart
    function addProductToCart() {
        if (!currentProduct || currentQuantity <= 0) {
            alert("Invalid quantity or product data.");
            return;
        }

        const priceStr = currentProduct.price[currentPriceIndex].toString().replace(/,/g, '');
        const price = parseFloat(priceStr);

        const cartItem = {
            id: productId,
            title: currentProduct.title,
            price: price,
            optionSelected: selectedOption || currentProduct.options[0],
            quantity: currentQuantity,
            image: currentProduct.image
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Find if same product + option exists
        const existingIndex = cart.findIndex(item =>
            item.id === productId && item.optionSelected === cartItem.optionSelected
        );

        if (existingIndex > -1) {
            cart[existingIndex].quantity += currentQuantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        alert(`${currentProduct.title} (${selectedOption || 'Default'}) added to cart!`);
        updateCartCount();

        // Optional: redirect to cart or products page
        // window.location.href = "/checkout";
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProduct);
    } else {
        initializeProduct();
    }
})();

// Reset filters button (if on products page)
document.getElementById('resetFilters')?.addEventListener('click', function () {
    document.getElementById('filter0').checked = true;
    document.getElementById('priceCheck').checked = false;
    document.getElementById('customRange2').value = 100000;
    document.getElementById('priceValue').textContent = '100000';

    // Trigger filter change
    const event = new Event('change');
    document.getElementById('filter0').dispatchEvent(event);
});

// Price range display (if on products page)
const priceRange = document.getElementById('customRange2');
const priceValue = document.getElementById('priceValue');

if (priceRange && priceValue) {
    priceRange.addEventListener('input', function () {
        priceValue.textContent = parseInt(this.value).toLocaleString();
    });
}