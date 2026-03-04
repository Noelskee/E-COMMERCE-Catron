// productsContainer.js - Complete working version with FIXED ROUTES

(async function () {
    console.log("✓ Products script loading...");

    // DOM Elements
    const container = document.getElementById("pContainer");
    const priceSlider = document.getElementById("customRange2");
    const priceCheck = document.getElementById("priceCheck");
    const filterRadios = document.querySelectorAll('input[name="flexRadioDefault"]');
    const priceValueEl = document.getElementById("priceValue");
    const productCountEl = document.getElementById("productCount");
    const noProductsEl = document.getElementById("noProducts");
    const sortSelect = document.getElementById("sortSelect");

    // State
    let database = [];

    // Filter mapping - EXACT match with JSON productType
    const filterMap = {
        "0": "All",
        "1": "Laptops",
        "2": "Desktops",
        "3": "Mobile Devices",
        "4": "School Supplies",
        "5": "Office Supplies",
        "6": "Software",
        "7": "Hardware",
        "8": "Printers"
    };

    // Load database from URL or local
    async function loadDB() {
        try {
            // Try GitHub first
            let response = await fetch("https://raw.githubusercontent.com/MoogsKotobuki/E-COMMERCE/refs/heads/main/json/product.Json");

            if (!response.ok) {
                // Fallback to local
                response = await fetch("/json/product.json");
            }

            const db = await response.json();
            console.log("✓ Database loaded successfully:", db.length, "products");
            return db;
        } catch (error) {
            console.error("✗ Error loading database:", error);
            return [];
        }
    }

    // Initialize products page
    async function initializeProductsPage() {
        try {
            console.log("✓ Initializing products page...");

            // Load database
            database = await loadDB();

            if (database.length === 0) {
                showError("No products found in database");
                return;
            }

            console.log("✓ Products loaded:", database.length);
            console.log("✓ Categories found:", [...new Set(database.map(p => p.productType))]);

            initFiltersFromURL();
            filterProducts();
            attachFilterListeners();
            updateCartCount();

            console.log("✓ Products page initialized successfully!");

        } catch (error) {
            console.error("✗ Error initializing products page:", error);
            showError("Error loading products. Please refresh the page.");
        }
    }

    // Show error message
    function showError(message) {
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center p-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo me-2"></i>Reload Page
                    </button>
                </div>
            `;
        }
    }

    // Initialize filters from URL
    function initFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        const priceParam = urlParams.get('price');
        const priceEnabledParam = urlParams.get('priceEnabled');

        if (filterParam) {
            const filterEl = document.getElementById(`filter${filterParam}`);
            if (filterEl) {
                filterEl.checked = true;
            }
        }

        if (priceParam && priceSlider) {
            priceSlider.value = priceParam;
            if (priceValueEl) {
                priceValueEl.textContent = parseInt(priceParam).toLocaleString();
            }
        }

        if (priceEnabledParam && priceCheck) {
            priceCheck.checked = priceEnabledParam === "true";
        }
    }

    // Render product card HTML
    function renderProductCard(product) {
        const { id, title, price, image, productType, stocks } = product;
        const displayPrice = parseFloat(price[0].replace(',', '')).toLocaleString();

        // Stock badge
        let stockBadge = '';
        if (stocks < 20) {
            stockBadge = '<span class="badge bg-danger position-absolute top-0 start-0 m-2">Low Stock</span>';
        } else if (stocks > 100) {
            stockBadge = '<span class="badge bg-success position-absolute top-0 start-0 m-2">In Stock</span>';
        }

        return `
            <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
                <div class="card h-100 shadow-sm product-card">
                    <div class="product-image-wrapper position-relative">
                        <img src="${image}" class="product-image" alt="${title}" 
                             onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                        ${stockBadge}
                        <span class="badge bg-primary position-absolute top-0 end-0 m-2" style="font-size: 10px;">
                            ${productType}
                        </span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title fw-bold" style="min-height: 48px; font-size: 15px;">${title}</h6>
                        <p class="text-success fw-bold fs-4 mb-2">₱${displayPrice}</p>
                        <p class="text-muted small mb-3">Stock: ${stocks} units</p>
                        <div class="mt-auto d-grid gap-2">
                            <a href="/Product/ProductOverview?id=${id}" class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-eye me-1"></i>View Details
                            </a>
                            <button class="btn btn-success btn-sm add-to-cart-btn" data-product-id="${id}">
                                <i class="fas fa-cart-plus me-1"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Sort products
    function sortProducts(products, sortType) {
        const sorted = [...products];

        switch (sortType) {
            case 'price-low':
                return sorted.sort((a, b) => parseFloat(a.price[0]) - parseFloat(b.price[0]));
            case 'price-high':
                return sorted.sort((a, b) => parseFloat(b.price[0]) - parseFloat(a.price[0]));
            case 'name-az':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'name-za':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return sorted;
        }
    }

    // Filter and display products
    function filterProducts() {
        if (!container) {
            console.error("✗ Container not found!");
            return;
        }

        if (!database || database.length === 0) {
            console.error("✗ No products in database!");
            showError("No products available");
            return;
        }

        // Get selected filter
        const selectedTypeId = [...filterRadios].find(r => r.checked)?.id.replace('filter', '') || "0";
        const selectedType = filterMap[selectedTypeId] || "All";
        const maxPrice = priceSlider ? parseInt(priceSlider.value) : 100000;
        const isPriceFilterEnabled = priceCheck?.checked || false;
        const sortType = sortSelect?.value || 'featured';

        console.log("Filtering:", {
            category: selectedType,
            maxPrice: maxPrice,
            priceFilterEnabled: isPriceFilterEnabled,
            sort: sortType
        });

        // Filter products
        let filteredProducts = database.filter(product => {
            const typeMatch = selectedType === "All" || product.productType === selectedType;
            const productPrice = parseFloat(product.price[0].replace(',', ''));
            const priceMatch = !isPriceFilterEnabled || productPrice <= maxPrice;

            return typeMatch && priceMatch;
        });

        console.log(`✓ Matched ${filteredProducts.length} products`);

        // Sort products
        filteredProducts = sortProducts(filteredProducts, sortType);

        // Update count
        if (productCountEl) {
            productCountEl.textContent = filteredProducts.length;
        }

        // Display products or empty state
        if (filteredProducts.length > 0) {
            let productsHTML = '<div class="row">';
            filteredProducts.forEach(product => {
                productsHTML += renderProductCard(product);
            });
            productsHTML += '</div>';

            container.innerHTML = productsHTML;

            if (noProductsEl) {
                noProductsEl.style.display = 'none';
            }

        } else {
            container.innerHTML = '';
            if (noProductsEl) {
                noProductsEl.style.display = 'block';
            }
        }

        // Update URL
        updateURL(selectedTypeId, maxPrice, isPriceFilterEnabled);

        // Attach event listeners
        attachAddToCartListeners();

        // Animate cards
        setTimeout(() => {
            document.querySelectorAll('.product-card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                }, index * 30);
            });
        }, 50);
    }

    // Update URL
    function updateURL(filterType, price, priceEnabled) {
        const url = new URL(window.location);
        url.searchParams.set('filter', filterType);
        url.searchParams.set('price', price);
        url.searchParams.set('priceEnabled', priceEnabled);
        window.history.replaceState({}, '', url);
    }

    // Add to cart
    function addProductToCart(productId) {
        const product = database.find(p => p.id == productId);

        if (!product) {
            alert("Product not found.");
            return;
        }

        const price = parseFloat(product.price[0].replace(',', ''));
        const optionSelected = product.options ? product.options[0] : null;

        const cartItem = {
            id: product.id,
            title: product.title,
            price: price,
            optionSelected: optionSelected,
            quantity: 1,
            image: product.image
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingIndex = cart.findIndex(item =>
            item.id === product.id && item.optionSelected === cartItem.optionSelected
        );

        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        // Button feedback
        const btn = event.target.closest('.add-to-cart-btn');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check me-1"></i>Added!';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-primary');
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.add('btn-success');
                btn.classList.remove('btn-primary');
                btn.disabled = false;
            }, 1500);
        }

        updateCartCount();
        console.log(`✓ Added to cart: ${product.title}`);
    }

    // Attach add to cart listeners
    function attachAddToCartListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = e.target.closest('.add-to-cart-btn').getAttribute('data-product-id');
                addProductToCart(productId);
            });
        });
    }

    // Attach filter listeners
    function attachFilterListeners() {
        // Category filters
        filterRadios.forEach(radio => {
            radio.addEventListener('change', filterProducts);
        });

        // Price slider
        if (priceSlider) {
            priceSlider.addEventListener('input', filterProducts);
        }

        // Price checkbox
        if (priceCheck) {
            priceCheck.addEventListener('change', filterProducts);
        }

        // Sort select
        if (sortSelect) {
            sortSelect.addEventListener('change', filterProducts);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProductsPage);
    } else {
        initializeProductsPage();
    }
})();