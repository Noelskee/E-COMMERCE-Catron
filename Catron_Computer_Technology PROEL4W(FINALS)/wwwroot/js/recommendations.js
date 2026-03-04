// recommendations.js - Load personalized product recommendations

document.addEventListener('DOMContentLoaded', function () {
    loadRecommendations();
});

async function loadRecommendations() {
    const recommendedContainer = document.getElementById('recommendedProducts');

    if (!recommendedContainer) {
        console.warn('Recommended products container not found');
        return;
    }

    try {
        // Simulate API call - replace with your actual API endpoint
        // const response = await fetch('/api/recommendations');
        // const recommendations = await response.json();

        // Sample recommended products (replace with actual API data)
        const recommendations = [
            {
                id: 7,
                name: 'Mechanical Gaming Keyboard',
                category: 'Accessories',
                price: 5499,
                image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600',
                badge: 'RECOMMENDED'
            },
            {
                id: 8,
                name: 'Gaming Chair Ergonomic',
                category: 'Furniture',
                price: 12999,
                image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600',
                badge: 'RECOMMENDED'
            },
            {
                id: 9,
                name: 'USB-C Docking Station',
                category: 'Accessories',
                price: 4299,
                image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600',
                badge: 'RECOMMENDED'
            },
            {
                id: 10,
                name: 'Webcam Full HD 1080p',
                category: 'Peripherals',
                price: 3899,
                image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600',
                badge: 'RECOMMENDED'
            },
            {
                id: 11,
                name: 'RGB LED Strip Kit',
                category: 'Accessories',
                price: 1299,
                image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600',
                badge: 'RECOMMENDED'
            },
            {
                id: 12,
                name: 'External SSD 1TB',
                category: 'Storage',
                price: 6999,
                image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600',
                badge: 'RECOMMENDED'
            }
        ];

        // Clear loading placeholder
        recommendedContainer.innerHTML = '';

        // Check if we have recommendations
        if (!recommendations || recommendations.length === 0) {
            recommendedContainer.innerHTML = `
                <div class="no-recommendations">
                    <i class="fas fa-box-open"></i>
                    <p>No recommendations available at the moment.</p>
                </div>
            `;
            return;
        }

        // Display recommendations
        recommendations.forEach(product => {
            const productCard = createProductCard(product);
            recommendedContainer.appendChild(productCard);
        });

        // Initialize add to cart buttons for recommendations
        initializeAddToCartButtons();

    } catch (error) {
        console.error('Error loading recommendations:', error);
        recommendedContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to load recommendations. Please try again later.</p>
            </div>
        `;
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const formattedPrice = formatPrice(product.price);

    card.innerHTML = `
        <div class="product-image-wrapper">
            <img src="${product.image}" class="product-image" alt="${product.name}" loading="lazy">
            <span class="product-badge recommended">${product.badge || 'RECOMMENDED'}</span>
        </div>
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">${formattedPrice}</div>
            <button class="btn-add-cart" 
                    data-product-id="${product.id}" 
                    data-product-name="${product.name}" 
                    data-product-price="${product.price}">
                <i class="fas fa-cart-plus me-2"></i>Add to Cart
            </button>
        </div>
    `;

    return card;
}

function formatPrice(price) {
    return '₱' + price.toLocaleString('en-PH');
}

function initializeAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('#recommendedProducts .btn-add-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');
            const productPrice = this.getAttribute('data-product-price');

            // Add to cart logic (integrate with your existing cart system)
            addToCart({
                id: productId,
                name: productName,
                price: parseFloat(productPrice)
            });

            // Visual feedback
            showAddedToCartFeedback(this);
        });
    });
}

function addToCart(product) {
    // Get existing cart or create new one
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        // Increase quantity if product exists
        cart[existingProductIndex].quantity = (cart[existingProductIndex].quantity || 1) + 1;
    } else {
        // Add new product
        cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count in header (if it exists)
    updateCartCount();

    console.log('Product added to cart:', product);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Update cart badge in header
    const cartBadge = document.querySelector('.cart-badge, .cart-count, #cartCount');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

function showAddedToCartFeedback(button) {
    const originalHTML = button.innerHTML;

    // Change button to show success
    button.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
    button.classList.add('added');
    button.disabled = true;

    // Reset after 2 seconds
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('added');
        button.disabled = false;
    }, 2000);
}

// Optional: Refresh recommendations periodically
function setupAutoRefresh() {
    // Refresh every 5 minutes (300000 ms)
    setInterval(() => {
        loadRecommendations();
    }, 300000);
}

// Uncomment to enable auto-refresh
// setupAutoRefresh();