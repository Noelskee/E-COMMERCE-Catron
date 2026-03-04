// login.js - Complete validation for Login and Registration

// Login page toggle functionality
const logincontainer = document.querySelector('.logincontainer');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Toggle between login and register forms
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        logincontainer.classList.add('active');
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        logincontainer.classList.remove('active');
    });
}

// Login form validation and submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        const username = document.getElementById('loginUsername')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        // Validate empty fields
        if (!username || !password) {
            e.preventDefault();
            showAlert('Please fill in all fields', 'error');

            // Highlight empty fields
            if (!username) {
                document.getElementById('loginUsername')?.classList.add('border-danger');
            }
            if (!password) {
                document.getElementById('loginPassword')?.classList.add('border-danger');
            }
            return;
        }

        // Remove error styling if fields are filled
        document.getElementById('loginUsername')?.classList.remove('border-danger');
        document.getElementById('loginPassword')?.classList.remove('border-danger');

        // Show loading state
        showLoadingState(this);
    });

    // Remove error styling on input
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');

    if (loginUsername) {
        loginUsername.addEventListener('input', function () {
            this.classList.remove('border-danger');
        });
    }

    if (loginPassword) {
        loginPassword.addEventListener('input', function () {
            this.classList.remove('border-danger');
        });
    }
}

// Register form validation and submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        const username = document.getElementById('registerUsername')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;

        // Validate username
        if (!username) {
            e.preventDefault();
            showAlert('Username is required', 'error');
            document.getElementById('registerUsername')?.focus();
            return;
        }

        if (username.length < 3) {
            e.preventDefault();
            showAlert('Username must be at least 3 characters', 'error');
            document.getElementById('registerUsername')?.focus();
            return;
        }

        if (username.length > 50) {
            e.preventDefault();
            showAlert('Username must be less than 50 characters', 'error');
            document.getElementById('registerUsername')?.focus();
            return;
        }

        // Validate email
        if (!email) {
            e.preventDefault();
            showAlert('Email is required', 'error');
            document.getElementById('registerEmail')?.focus();
            return;
        }

        if (!isValidEmail(email)) {
            e.preventDefault();
            showAlert('Please enter a valid email address', 'error');
            document.getElementById('registerEmail')?.focus();
            return;
        }

        // Validate password
        if (!password) {
            e.preventDefault();
            showAlert('Password is required', 'error');
            document.getElementById('registerPassword')?.focus();
            return;
        }

        if (password.length < 6) {
            e.preventDefault();
            showAlert('Password must be at least 6 characters', 'error');
            document.getElementById('registerPassword')?.focus();
            return;
        }

        // Validate password strength
        if (!isStrongPassword(password)) {
            e.preventDefault();
            showAlert('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 'error');
            document.getElementById('registerPassword')?.focus();
            return;
        }

        // Validate confirm password
        if (!confirmPassword) {
            e.preventDefault();
            showAlert('Please confirm your password', 'error');
            document.getElementById('registerConfirmPassword')?.focus();
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            e.preventDefault();
            showAlert('Passwords do not match', 'error');
            document.getElementById('registerConfirmPassword')?.focus();
            return;
        }

        // Show loading state
        showLoadingState(this);
    });

    // Real-time password validation
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            validatePasswordStrength(this.value);
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
            validatePasswordMatch();
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Strong password validation
function isStrongPassword(password) {
    // Must contain: uppercase, lowercase, number, special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return strongPasswordRegex.test(password);
}

// Password strength indicator
function validatePasswordStrength(password) {
    const hint = document.querySelector('.password-hint');
    if (!hint) return;

    if (password.length === 0) {
        hint.style.color = '#666';
        hint.textContent = 'Min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char';
        return;
    }

    if (password.length < 6) {
        hint.style.color = '#dc3545';
        hint.textContent = '❌ Too short (minimum 6 characters)';
    } else if (!isStrongPassword(password)) {
        hint.style.color = '#ffc107';
        hint.textContent = '⚠️ Weak: Add uppercase, number, and special character';
    } else {
        hint.style.color = '#28a745';
        hint.textContent = '✅ Strong password!';
    }
}

// Password match validation
function validatePasswordMatch() {
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
    const confirmInput = document.getElementById('registerConfirmPassword');

    if (!confirmInput) return;

    if (confirmPassword.length === 0) {
        confirmInput.style.borderColor = '';
        return;
    }

    if (password === confirmPassword) {
        confirmInput.style.borderColor = '#28a745';
    } else {
        confirmInput.style.borderColor = '#dc3545';
    }
}

// Show loading state on form submission
function showLoadingState(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnSpinner = submitBtn?.querySelector('.btn-spinner');

    if (btnText && btnSpinner) {
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;
    }
}

// Show alert messages
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `custom-alert alert-${type}`;

    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
    const textColor = type === 'success' ? '#155724' : '#721c24';
    const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';

    alert.style.cssText = `
        padding: 12px 20px;
        margin-bottom: 20px;
        border: 1px solid ${borderColor};
        border-radius: 8px;
        background-color: ${bgColor};
        color: ${textColor};
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
    `;

    alert.innerHTML = `
        <i class="fa-solid fa-${icon}"></i>
        <span>${message}</span>
    `;

    // Insert alert at the top of the active form
    const activeForm = document.querySelector('.logincontainer.active .form-box.register form') ||
        document.querySelector('.form-box.login form');

    if (activeForm) {
        const firstElement = activeForm.querySelector('img') || activeForm.firstElementChild;
        if (firstElement) {
            firstElement.insertAdjacentElement('afterend', alert);
        } else {
            activeForm.insertBefore(alert, activeForm.firstChild);
        }

        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
}

// Add CSS animation for alerts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .custom-alert {
        transition: opacity 0.3s ease-out;
    }
    
    .border-danger {
        border-color: #dc3545 !important;
    }
    
    .border-success {
        border-color: #28a745 !important;
    }
`;
document.head.appendChild(style);

// Auto-hide server-side alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function () {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });

    // Check if there's a registration success message
    const successMessage = document.querySelector('.alert-success');
    if (successMessage && logincontainer) {
        // Keep login form visible
        logincontainer.classList.remove('active');
    }
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Update cart count if needed
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? "inline-block" : "none";
    }
}

// Initialize cart count on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCartCount);
} else {
    updateCartCount();
}