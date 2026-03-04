// About Page JavaScript - Enhanced with Animations

// Details data for modal popups
const detailsData = {
    computers: `
        <h2>Computers & Laptops</h2>
        <p>We offer a comprehensive range of computers and laptops from leading brands including Dell, HP, Lenovo, Asus, and Acer. Whether you're a student, professional, or gamer, we have the perfect machine for your needs.</p>
        <ul>
            <li><strong>Student Laptops:</strong> Affordable and reliable for everyday tasks</li>
            <li><strong>Business Laptops:</strong> Professional-grade with security features</li>
            <li><strong>Gaming Laptops:</strong> High-performance for intense gaming</li>
            <li><strong>Desktop PCs:</strong> Custom builds and pre-configured systems</li>
            <li><strong>All-in-One PCs:</strong> Space-saving designs with full functionality</li>
        </ul>
        <p><strong>All products come with:</strong> Manufacturer warranty, technical support, and optional extended warranty plans.</p>
    `,
    accessories: `
        <h2>Accessories & Peripherals</h2>
        <p>Complete your computing experience with our extensive selection of high-quality accessories and peripherals.</p>
        <ul>
            <li><strong>Keyboards & Mice:</strong> Wired, wireless, gaming, and ergonomic options</li>
            <li><strong>Monitors:</strong> From budget displays to 4K professional screens</li>
            <li><strong>Headsets & Speakers:</strong> Crystal-clear audio for work and entertainment</li>
            <li><strong>Webcams:</strong> HD cameras for video calls and streaming</li>
            <li><strong>External Storage:</strong> HDDs, SSDs, and flash drives</li>
            <li><strong>Cables & Adapters:</strong> All types of connectivity solutions</li>
        </ul>
        <p>We stock products from trusted brands like Logitech, Razer, Corsair, and more.</p>
    `,
    supplies: `
        <h2>Office & School Supplies</h2>
        <p>Everything you need for productivity, from basic supplies to advanced office equipment.</p>
        <ul>
            <li><strong>Printing Supplies:</strong> Ink, toner, and paper for all printer types</li>
            <li><strong>School Essentials:</strong> Notebooks, pens, folders, and organizers</li>
            <li><strong>Office Equipment:</strong> Calculators, staplers, and desk accessories</li>
            <li><strong>Filing & Storage:</strong> Folders, binders, and filing systems</li>
            <li><strong>Writing Instruments:</strong> Quality pens, pencils, and markers</li>
        </ul>
        <p>Special bulk pricing available for schools and businesses.</p>
    `,
    services: `
        <h2>Repair & Maintenance Services</h2>
        <p>Our certified technicians provide professional repair and maintenance services to keep your devices running smoothly.</p>
        <ul>
            <li><strong>Hardware Repair:</strong> Screen replacement, battery replacement, component upgrades</li>
            <li><strong>Software Services:</strong> OS installation, virus removal, data recovery</li>
            <li><strong>Network Setup:</strong> Home and office network configuration</li>
            <li><strong>Preventive Maintenance:</strong> Cleaning, optimization, and health checks</li>
            <li><strong>Consultation:</strong> Expert advice on upgrades and purchases</li>
        </ul>
        <p><strong>Service Guarantee:</strong> All repairs come with a 30-day warranty on workmanship.</p>
        <p><strong>Turnaround Time:</strong> Most repairs completed within 24-48 hours.</p>
    `
};

// Function to open details modal
function openDetails(key) {
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = detailsData[key] || '<h2>Information Not Available</h2><p>Details for this section are coming soon.</p>';
    modal.classList.add('show');

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Function to close details modal
function closeDetails() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('show');

    // Restore body scroll
    document.body.style.overflow = '';
}

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeDetails();
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');

            // Unobserve after animation to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', function () {
    const animatedElements = document.querySelectorAll('.animate');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero section (optional enhancement)
window.addEventListener('scroll', function () {
    const hero = document.querySelector('.about-hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        hero.style.transform = `translateY(${parallax}px)`;
    }
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60 FPS
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// Trigger counter animation when stats come into view
const statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                animateCounter(stat, number);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Add hover effect sound (optional)
const cards = document.querySelectorAll('.offering-card, .feature-card, .mvv-card');
cards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// Lazy load images for better performance
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Print page functionality
function printPage() {
    window.print();
}

// Share page functionality
function sharePage() {
    if (navigator.share) {
        navigator.share({
            title: 'About Catron Computer Technology',
            text: 'Learn more about Catron Computer Technology - Your Leading Computer Suppliers',
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Link copied to clipboard!'))
            .catch(err => console.log('Error copying:', err));
    }
}

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

// Console greeting
console.log('%cWelcome to Catron Computer Technology!', 'color: #00cc44; font-size: 20px; font-weight: bold;');
console.log('%cYour Leading Computer Suppliers in the Philippines', 'color: #667eea; font-size: 14px;');