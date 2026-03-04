// Contact Page JavaScript - Enhanced with Form Validation

// Form validation and submission
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);

        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateField(this);
            });

            input.addEventListener('input', function () {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    }
});

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    const formMessage = document.getElementById('formMessage');

    // Validate all fields
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        showMessage('Please fix the errors in the form', 'error');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'flex';

    // Get form data
    const formData = {
        firstName: form.querySelector('#firstName').value.trim(),
        lastName: form.querySelector('#lastName').value.trim(),
        email: form.querySelector('#email').value.trim(),
        phone: form.querySelector('#phone').value.trim(),
        subject: form.querySelector('#subject').value,
        message: form.querySelector('#message').value.trim()
    };

    try {
        // Simulate API call (replace with actual endpoint)
        await simulateAPICall(formData);

        // Success
        showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.', 'success');
        form.reset();

        // Track event (if analytics is set up)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                'event_category': 'Contact',
                'event_label': 'Contact Form'
            });
        }

    } catch (error) {
        // Error
        showMessage('Oops! Something went wrong. Please try again or contact us directly at cathy.catron18@gmail.com', 'error');
        console.error('Form submission error:', error);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'flex';
        btnSpinner.style.display = 'none';
    }
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let errorMessage = '';

    // Remove previous error
    field.classList.remove('error');
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
    }

    // Email validation
    else if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Phone validation (optional but must be valid if provided)
    else if (fieldName === 'phone' && value) {
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(value) || value.length < 10) {
            errorMessage = 'Please enter a valid phone number';
        }
    }

    // Name validation
    else if ((fieldName === 'firstName' || fieldName === 'lastName') && value) {
        if (value.length < 2) {
            errorMessage = 'Name must be at least 2 characters';
        }
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(value)) {
            errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
    }

    // Message validation
    else if (fieldName === 'message' && value) {
        if (value.length < 10) {
            errorMessage = 'Message must be at least 10 characters';
        }
    }

    // Show error if exists
    if (errorMessage) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.85rem; margin-top: 5px;';
        errorDiv.textContent = errorMessage;
        field.parentElement.appendChild(errorDiv);
        return false;
    }

    return true;
}

// Show form message
function showMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';

    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide success message after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
}

// Simulate API call (replace with actual implementation)
function simulateAPICall(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success (90% success rate for demo)
            if (Math.random() > 0.1) {
                console.log('Form data:', data);
                resolve({ success: true });
            } else {
                reject(new Error('Simulated error'));
            }
        }, 1500);
    });
}

// Add character counter to message field
const messageField = document.getElementById('message');
if (messageField) {
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.cssText = 'text-align: right; font-size: 0.85rem; color: #999; margin-top: 5px;';
    messageField.parentElement.appendChild(counter);

    const updateCounter = () => {
        const length = messageField.value.length;
        const maxLength = 500;
        counter.textContent = `${length}/${maxLength} characters`;

        if (length > maxLength * 0.9) {
            counter.style.color = '#dc3545';
        } else if (length > maxLength * 0.7) {
            counter.style.color = '#ffc107';
        } else {
            counter.style.color = '#999';
        }
    };

    messageField.addEventListener('input', updateCounter);
    updateCounter();
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.animate').forEach(el => {
    observer.observe(el);
});

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');

        // Format as +63 XXX XXX XXXX
        if (value.startsWith('63')) {
            value = value.substring(2);
        }

        if (value.length > 0) {
            if (value.length <= 3) {
                e.target.value = `+63 ${value}`;
            } else if (value.length <= 6) {
                e.target.value = `+63 ${value.substring(0, 3)} ${value.substring(3)}`;
            } else {
                e.target.value = `+63 ${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6, 10)}`;
            }
        }
    });
}

// Add smooth scroll for FAQ items
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function () {
        this.classList.toggle('expanded');
    });
});

// Add map click to open in new tab
const mapIframe = document.querySelector('.map-container iframe');
if (mapIframe) {
    mapIframe.style.cursor = 'pointer';
    mapIframe.addEventListener('click', function () {
        window.open(this.src, '_blank');
    });
}

// Add copy email functionality
document.querySelectorAll('.info-content p').forEach(p => {
    if (p.textContent.includes('@')) {
        p.style.cursor = 'pointer';
        p.title = 'Click to copy email';

        p.addEventListener('click', function () {
            const email = this.textContent.trim();
            navigator.clipboard.writeText(email).then(() => {
                // Show copied message
                const originalText = this.textContent;
                this.textContent = '✓ Copied!';
                this.style.color = '#00cc44';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.color = '';
                }, 2000);
            });
        });
    }
});

// Add scroll-to-top button
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.className = 'scroll-to-top';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    z-index: 999;
`;

document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

scrollTopBtn.addEventListener('mouseenter', function () {
    this.style.transform = 'translateY(-5px)';
    this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
});

scrollTopBtn.addEventListener('mouseleave', function () {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Console greeting
console.log('%cContact Catron Computer Technology', 'color: #00cc44; font-size: 20px; font-weight: bold;');
console.log('%cWe\'re here to help! Fill out the form or reach us directly.', 'color: #667eea; font-size: 14px;');