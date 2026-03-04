/* ═══════════════════════════════════════════════════════════════════════
   CATRON COMPUTER TECHNOLOGY  ·  Customer-side JavaScript
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Toast Notification System ─────────────────────────────────────── */
(function () {
  let container = null;
  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }
  window.showToast = function (message, type, duration) {
    type = type || 'info';
    duration = duration || 3400;
    var icons   = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', info: 'fas fa-info-circle', warning: 'fas fa-exclamation-circle' };
    var classes = { success: 'toast-success', error: 'toast-error', info: 'toast-info', warning: 'toast-warning' };
    var c  = getContainer();
    var el = document.createElement('div');
    el.className = 'toast-item ' + (classes[type] || 'toast-info');
    el.innerHTML = '<i class="' + (icons[type] || icons.info) + ' toast-icon"></i><span>' + message + '</span>';
    c.prepend(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(function () { el.remove(); }, 260);
    }, duration);
  };
})();

/* ── Cart badge ──────────────────────────────────────────────────────── */
function setCartBadge(count) {
  var badge = document.getElementById('cartCount');
  if (!badge) return;
  var n = parseInt(count) || 0;
  badge.textContent = n;
  badge.style.display = n > 0 ? 'flex' : 'none';
}

var _cartFetchController = null;
function updateCartCount() {
  // Cancel any in-flight request before starting a new one
  if (_cartFetchController) _cartFetchController.abort();
  _cartFetchController = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var opts = { credentials: 'same-origin' };
  if (_cartFetchController) opts.signal = _cartFetchController.signal;
  fetch('/Customer/GetCartCount', opts)
    .then(function (r) { return r.json(); })
    .then(function (data) { setCartBadge(data.count !== undefined ? data.count : data); })
    .catch(function () {});
}

/* ── Add to Cart ─────────────────────────────────────────────────────── */
function addToCart(productId, quantity) {
  quantity = parseInt(quantity) || 1;

  // Animate all matching buttons
  var btns = document.querySelectorAll('[onclick*="addToCart(' + productId + '"]');
  btns.forEach(function (btn) {
    btn._origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Adding\u2026';
  });

  fetch('/Customer/AddToCart', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: productId, quantity: quantity })
  })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      btns.forEach(function (btn) {
        btn.disabled = false;
        btn.innerHTML = btn._origHtml || '<i class="fas fa-cart-plus me-1"></i>Add to Cart';
      });
      if (data.success) {
        showToast(data.message || 'Added to cart!', 'success');
        setCartBadge(data.count);
      } else {
        if (data.redirect) { window.location.href = data.redirect; return; }
        showToast(data.message || 'Could not add to cart.', 'error');
      }
    })
    .catch(function (err) {
      btns.forEach(function (btn) {
        btn.disabled = false;
        btn.innerHTML = btn._origHtml || '<i class="fas fa-cart-plus me-1"></i>Add to Cart';
      });
      console.error('addToCart:', err);
      showToast('Network error. Please try again.', 'error');
    });
}

/* ── Update Cart Quantity ────────────────────────────────────────────── */
function updateQty(cartItemId, newQty) {
  if (newQty < 1) { removeCartItem(cartItemId); return; }
  fetch('/Customer/UpdateCartItem', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItemId: cartItemId, quantity: newQty })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.success) { showToast('Update failed.', 'error'); return; }
      var qtyEl = document.getElementById('qty-' + cartItemId);
      var subEl = document.getElementById('sub-' + cartItemId);
      var totEl = document.getElementById('cart-total');
      if (qtyEl) qtyEl.textContent = newQty;
      if (subEl) subEl.textContent = '\u20b1' + Number(data.subtotal).toLocaleString('en-PH', { minimumFractionDigits: 0 });
      if (totEl) totEl.textContent = '\u20b1' + Number(data.total).toLocaleString('en-PH', { minimumFractionDigits: 0 });
      setCartBadge(data.count);
    })
    .catch(function () { showToast('Network error.', 'error'); });
}

/* ── Remove Cart Item ────────────────────────────────────────────────── */
function removeCartItem(cartItemId) {
  var row = document.getElementById('cart-row-' + cartItemId);
  if (row) {
    row.style.transition = 'opacity .3s, transform .3s';
    row.style.opacity = '0';
    row.style.transform = 'translateX(30px)';
  }
  fetch('/Customer/RemoveCartItem', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItemId: cartItemId })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        setTimeout(function () { if (row) row.remove(); }, 320);
        var totEl = document.getElementById('cart-total');
        if (totEl) totEl.textContent = '\u20b1' + Number(data.total).toLocaleString('en-PH', { minimumFractionDigits: 0 });
        setCartBadge(data.count);
        showToast('Item removed from cart.', 'info');
        if (parseInt(data.count) === 0) setTimeout(function () { window.location.reload(); }, 450);
      } else {
        if (row) { row.style.opacity = '1'; row.style.transform = ''; }
        showToast('Could not remove item.', 'error');
      }
    })
    .catch(function () {
      if (row) { row.style.opacity = '1'; row.style.transform = ''; }
      showToast('Network error.', 'error');
    });
}

/* ── Wishlist Toggle ─────────────────────────────────────────────────── */
function toggleWishlist(productId, btn) {
  btn.style.transform = 'scale(1.35)';
  setTimeout(function () { btn.style.transition = 'transform .2s'; btn.style.transform = ''; }, 200);

  fetch('/Customer/ToggleWishlist', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: productId })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        if (data.added) {
          btn.classList.remove('btn-outline-danger');
          btn.classList.add('btn-danger');
          showToast('Added to wishlist!', 'success');
        } else {
          btn.classList.remove('btn-danger');
          btn.classList.add('btn-outline-danger');
          showToast('Removed from wishlist.', 'info');
        }
      } else {
        if (data.redirect) { window.location.href = data.redirect; return; }
        showToast(data.message || 'Please log in first.', 'error');
      }
    })
    .catch(function () { showToast('Network error.', 'error'); });
}

/* ── Product Detail Qty Stepper ─────────────────────────────────────── */
function changeQty(delta) {
  var input = document.getElementById('qty');
  if (!input) return;
  var max = parseInt(input.max) || 99;
  var val = Math.max(1, Math.min(max, parseInt(input.value || 1) + delta));
  input.value = val;
  input.style.transition = 'transform .15s';
  input.style.transform = delta > 0 ? 'scale(1.18)' : 'scale(.85)';
  setTimeout(function () { input.style.transform = ''; }, 160);
}

/* ── Navbar scroll shadow ─────────────────────────────────────────────── */
(function () {
  var nav = document.querySelector('.main-navbar');
  if (!nav) return;
  var ticking = false;
  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

/* ── Active nav link ─────────────────────────────────────────────────── */
(function () {
  var path = window.location.pathname.toLowerCase();
  document.querySelectorAll('.main-navbar .nav-link').forEach(function (a) {
    var href = (a.getAttribute('href') || '').toLowerCase().split('?')[0];
    if (href && href !== '/' && path.startsWith(href)) a.classList.add('active');
  });
})();

/* ── Scroll-reveal ───────────────────────────────────────────────────── */
(function () {
  if (!window.IntersectionObserver) return;
  var els = document.querySelectorAll('.product-card, .category-card, .why-card');
  if (!els.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.animation = 'fadeUp .38s ease both';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  /* Stagger delay capped at 0.3s max to avoid long queues on large grids */
  els.forEach(function (el, i) {
    el.style.opacity = '0';
    el.style.animationDelay = Math.min(i * 0.05, 0.3) + 's';
    observer.observe(el);
  });
})();

/* ── Init ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  updateCartCount();
});