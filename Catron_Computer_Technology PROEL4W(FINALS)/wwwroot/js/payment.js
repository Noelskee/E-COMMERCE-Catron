// payment.js  – handles cart display + order submission
document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. Load cart from sessionStorage ─────────────────────────────── */
    const cartKey = 'catronCart';

    function getCart() {
        try { return JSON.parse(sessionStorage.getItem(cartKey)) || []; }
        catch { return []; }
    }

    /* ── 2. Render order summary ───────────────────────────────────────── */
    function renderOrderSummary() {
        const cart = getCart();
        const section = document.querySelector('.order-section');
        if (!section) return;

        // Remove placeholder product divs
        section.querySelectorAll('.product').forEach(el => el.remove());
        const totalEl = section.querySelector('.total');

        if (cart.length === 0) {
            const empty = document.createElement('p');
            empty.style.cssText = 'color:#6b7280;text-align:center;padding:1rem 0;';
            empty.textContent = 'Your cart is empty.';
            section.insertBefore(empty, totalEl);
            totalEl.textContent = 'Total: ₱0.00';
            return;
        }

        let subtotal = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity) || 1;
            const lineTotal = price * qty;
            subtotal += lineTotal;

            const div = document.createElement('div');
            div.className = 'product';
            div.innerHTML = `
                <div style="display:flex;align-items:center;gap:.75rem;">
                    ${item.image ? `<img src="${item.image}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;" alt="">` : ''}
                    <div>
                        <div style="font-weight:600;font-size:.875rem;">${item.title}</div>
                        ${item.selectedOption ? `<div style="font-size:.75rem;color:#6b7280;">${item.selectedOption}</div>` : ''}
                        <div style="font-size:.75rem;color:#6b7280;">Qty: ${qty}</div>
                    </div>
                </div>
                <div style="font-weight:600;white-space:nowrap;">₱${lineTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>`;
            section.insertBefore(div, totalEl);
        });

        const shipping = subtotal > 0 ? 150 : 0;
        const total = subtotal + shipping;

        // Insert subtotal + shipping rows before total line
        const sub = document.createElement('div');
        sub.className = 'product';
        sub.style.cssText = 'border-top:1px solid #e5e7eb;margin-top:.5rem;padding-top:.5rem;';
        sub.innerHTML = `<div style="color:#6b7280;">Subtotal</div><div>₱${subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>`;
        section.insertBefore(sub, totalEl);

        const ship = document.createElement('div');
        ship.className = 'product';
        ship.innerHTML = `<div style="color:#6b7280;">Shipping Fee</div><div>₱${shipping.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>`;
        section.insertBefore(ship, totalEl);

        totalEl.textContent = `Total: ₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

        // Store computed values for submission
        totalEl.dataset.subtotal = subtotal;
        totalEl.dataset.shipping = shipping;
        totalEl.dataset.total = total;
    }

    renderOrderSummary();

    /* ── 3. Credit/Debit card extra fields ────────────────────────────── */
    const cardInfoDiv = document.getElementById('creditDebitInfo');

    function showCardFields() {
        const selected = document.querySelector('input[name="payment"]:checked')?.value;
        if (!cardInfoDiv) return;

        if (selected === 'Credit Card' || selected === 'Debit Card') {
            cardInfoDiv.innerHTML = `
                <div class="form-grid" style="margin-top:1rem;">
                    <div class="form-group full-width">
                        <label>Card Number <span class="required">*</span></label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="form-group">
                        <label>Expiry Date <span class="required">*</span></label>
                        <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label>CVV <span class="required">*</span></label>
                        <input type="text" id="cardCvv" placeholder="123" maxlength="4">
                    </div>
                    <div class="form-group full-width">
                        <label>Cardholder Name <span class="required">*</span></label>
                        <input type="text" id="cardName" placeholder="Name as on card">
                    </div>
                </div>`;

            // Auto-format card number
            document.getElementById('cardNumber')?.addEventListener('input', e => {
                let v = e.target.value.replace(/\D/g, '').substring(0, 16);
                e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
            });
            // Auto-format expiry
            document.getElementById('cardExpiry')?.addEventListener('input', e => {
                let v = e.target.value.replace(/\D/g, '').substring(0, 4);
                if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
                e.target.value = v;
            });
        } else if (selected === 'G Cash') {
            cardInfoDiv.innerHTML = `
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;margin-top:1rem;text-align:center;">
                    <p style="color:#166534;font-weight:600;margin:0;">GCash Number: <span style="font-size:1.1rem;">0917-XXX-XXXX</span></p>
                    <p style="color:#15803d;font-size:.85rem;margin:.5rem 0 0;">Please send payment and include your order number as reference.</p>
                </div>`;
        } else {
            cardInfoDiv.innerHTML = '';
        }
    }

    showCardFields();
    document.querySelectorAll('input[name="payment"]').forEach(r => r.addEventListener('change', showCardFields));

    /* ── 4. Place Order ────────────────────────────────────────────────── */
    document.getElementById('placeOrder')?.addEventListener('click', async () => {
        const fullName = document.getElementById('fullName')?.value.trim();
        const address = document.getElementById('address')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const contact = document.getElementById('contact')?.value.trim();
        const landmark = document.getElementById('landmark')?.value.trim();
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

        // Basic validation
        if (!fullName || !address || !email || !contact) {
            showToast('Please fill in all required delivery fields.', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        const cart = getCart();
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        // Card validation
        if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
            const num = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
            const exp = document.getElementById('cardExpiry')?.value;
            const cvv = document.getElementById('cardCvv')?.value;
            const name = document.getElementById('cardName')?.value.trim();
            if (!num || num.length < 15 || !exp || !cvv || !name) {
                showToast('Please complete your card details.', 'error');
                return;
            }
        }

        const totalEl = document.querySelector('.total');
        const subtotal = parseFloat(totalEl?.dataset.subtotal) || 0;
        const shipping = parseFloat(totalEl?.dataset.shipping) || 0;
        const total = parseFloat(totalEl?.dataset.total) || 0;

        // Build items list
        const items = cart.map(item => ({
            productId: parseInt(item.productId) || 0,
            productTitle: item.title,
            selectedOption: item.selectedOption || '',
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.price) || 0
        }));

        const payload = {
            fullName, address, landmark, email,
            contactNumber: contact,
            paymentMethod, subtotal, shippingFee: shipping,
            totalAmount: total, items
        };

        // Disable button
        const btn = document.getElementById('placeOrder');
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Processing…';

        try {
            // Get CSRF token from hidden input added by ASP.NET
            const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

            const res = await fetch('/Checkout/PlaceOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': token || ''
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                // Clear cart
                sessionStorage.removeItem(cartKey);
                // Redirect to receipt
                window.location.href = `/Checkout/SuccessReceipt/${data.orderId}`;
            } else {
                showToast(data.message || 'Something went wrong. Please try again.', 'error');
                btn.disabled = false;
                btn.querySelector('span').textContent = 'Place Order';
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
            btn.disabled = false;
            btn.querySelector('span').textContent = 'Place Order';
        }
    });

    /* ── 5. Toast helper ───────────────────────────────────────────────── */
    function showToast(msg, type = 'info') {
        const existing = document.querySelector('.ct-toast');
        if (existing) existing.remove();

        const t = document.createElement('div');
        t.className = 'ct-toast';
        const bg = type === 'error' ? '#ef4444' : '#10b981';
        t.style.cssText = `
            position:fixed;bottom:2rem;right:2rem;z-index:9999;
            background:${bg};color:#fff;padding:.9rem 1.5rem;
            border-radius:12px;font-weight:600;font-size:.9rem;
            box-shadow:0 4px 20px rgba(0,0,0,.2);
            animation:slideInToast .3s ease;`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
    }

    // Inject toast animation
    if (!document.getElementById('toastStyle')) {
        const s = document.createElement('style');
        s.id = 'toastStyle';
        s.textContent = `@keyframes slideInToast{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;
        document.head.appendChild(s);
    }
});