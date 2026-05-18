// ══════════════════════════════════════════════════════
//  ODCORRECT — cart-page.js
//  Cart Page Logic: render items, totals, promo, checkout
//  Depends on: cart.js (must be loaded first)
// ══════════════════════════════════════════════════════

// ─── CONSTANTS ──────────────────────────────────────────

const TAX_RATE        = 0.18;   // 18% GST
const FREE_SHIPPING_THRESHOLD = 999; // free shipping above ₹999

// Valid promo codes → { discount type, value, label }
const PROMO_CODES = {
    "RADHAWEDSMRINAL":   { type: "percent", value: 100, label: "WEDDING GIFT — 100% OFF" },
    "ODLAUNCH":  { type: "flat",    value: 500, label: "ODLAUNCH — ₹500 OFF" },
    "SUPERCOOL": { type: "percent", value: 15, label: "SUPERCOOL — 15% OFF" }
};

let appliedPromo = null; // currently applied promo object
let savedAddresses = [];
let selectedAddressId = null;
let addressMode = "new";

// ─── RENDER CART ────────────────────────────────────────

/**
 * Main render function — reads localStorage and builds the cart UI.
 * Shows empty state if cart is empty, otherwise builds item list + summary.
 */
function renderCartPage() {
    const cart      = getCart();
    const emptyEl   = document.getElementById("cart-empty");
    const contentEl = document.getElementById("cart-content");
    const countEl   = document.getElementById("cart-item-count");

    if (countEl) countEl.textContent = getCartCount();

    if (cart.length === 0) {
        // Show empty state
        if (emptyEl)   emptyEl.style.display   = "flex";
        if (contentEl) contentEl.style.display = "none";
        return;
    }

    // Show cart content
    if (emptyEl)   emptyEl.style.display   = "none";
    if (contentEl) contentEl.style.display = "grid";

    renderCartItems(cart);
    renderOrderSummary(cart);
}

/**
 * Builds the list of cart item rows.
 * @param {Array} cart
 */
function renderCartItems(cart) {
    const list = document.getElementById("cart-items-list");
    if (!list) return;
    list.innerHTML = "";

    cart.forEach((line, idx) => {
        const lineTotal = line.price * line.qty;
        const row = document.createElement("div");
        row.className = "cart-item reveal";
        row.style.animationDelay = `${idx * 0.06}s`;
        row.innerHTML = `
            <!-- Product block -->
            <div class="cart-item-product">
                <div class="cart-item-img" style="background:${line.color}">
                    <span class="cart-img-label">${line.cat ? line.cat[0].toUpperCase() : "OD"}</span>
                </div>
                <div class="cart-item-meta">
                    <p class="cart-item-id">// ${line.cat?.toUpperCase() || "APPAREL"}</p>
                    <p class="cart-item-name">${line.name}</p>
                    <div class="cart-item-tags">
                        <span class="cart-tag">SIZE: ${line.size}</span>
                        <span class="cart-tag">COLOR: ${line.colorName}</span>
                    </div>
                    <p class="cart-item-unit-price">${formatPrice(line.price)} each</p>
                    <button
                        class="remove-btn"
                        onclick="handleRemove('${line.id}', '${line.size}', '${line.colorName}')"
                        aria-label="Remove ${line.name}">
                        REMOVE ✕
                    </button>
                </div>
            </div>

            <!-- Qty control -->
            <div class="cart-item-qty">
                <div class="qty-control">
                    <button
                        class="qty-btn"
                        onclick="handleQtyChange('${line.id}','${line.size}','${line.colorName}', ${line.qty - 1})"
                        aria-label="Decrease quantity">−</button>
                    <span class="qty-value">${line.qty}</span>
                    <button
                        class="qty-btn"
                        onclick="handleQtyChange('${line.id}','${line.size}','${line.colorName}', ${line.qty + 1})"
                        aria-label="Increase quantity">+</button>
                </div>
            </div>

            <!-- Line total -->
            <div class="cart-item-total">
                <span>${formatPrice(lineTotal)}</span>
            </div>
        `;
        list.appendChild(row);
    });

    // Trigger reveal
    setTimeout(() => {
        document.querySelectorAll(".cart-item.reveal").forEach(el => el.classList.add("active"));
    }, 50);
}

/**
 * Calculates and renders the order summary sidebar.
 * @param {Array} cart
 */
function renderOrderSummary(cart) {
    const subtotal = getCartSubtotal();

    // Apply promo discount
    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === "percent") {
            discount = Math.round(subtotal * appliedPromo.value / 100);
        } else {
            discount = Math.min(appliedPromo.value, subtotal);
        }
    }

    const discountedSubtotal = subtotal - discount;
    const tax                = Math.round(discountedSubtotal * TAX_RATE);
    const shipping           = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
    const total              = discountedSubtotal + tax + shipping;

    // Update DOM
    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setEl("summary-subtotal", formatPrice(subtotal));
    setEl("summary-tax",      formatPrice(tax));
    setEl("summary-shipping", shipping === 0 ? "FREE" : formatPrice(shipping));
    setEl("summary-total",    formatPrice(total));
    setEl("modal-total",      formatPrice(total));

    // Line items in summary
    const linesEl = document.getElementById("summary-lines");
    if (linesEl) {
        let html = cart.map(l => `
            <div class="summary-line">
                <span class="sl-name">${l.name} <span class="sl-qty">×${l.qty}</span></span>
                <span class="sl-price">${formatPrice(l.price * l.qty)}</span>
            </div>
        `).join("");

        // Promo discount line
        if (discount > 0) {
            html += `
                <div class="summary-line promo-line">
                    <span class="sl-name">🏷 ${appliedPromo.label}</span>
                    <span class="sl-price accent-text">−${formatPrice(discount)}</span>
                </div>
            `;
        }
        linesEl.innerHTML = html;
    }

    // Update cart count in header
    const countEl = document.getElementById("cart-item-count");
    if (countEl) countEl.textContent = getCartCount();
}

// ─── ACTION HANDLERS ────────────────────────────────────

/** Remove item and re-render */
function handleRemove(id, size, colorName) {
    removeFromCart(id, size, colorName);
    renderCartPage();
}
window.handleRemove = handleRemove;

/** Update qty (or remove if qty reaches 0) and re-render */
function handleQtyChange(id, size, colorName, newQty) {
    updateQty(id, size, colorName, newQty);
    renderCartPage();
}
window.handleQtyChange = handleQtyChange;

// Clear entire cart
document.getElementById("clear-cart-btn")?.addEventListener("click", () => {
    if (confirm("Clear your entire bag?")) {
        clearCart();
        appliedPromo = null;
        renderCartPage();
    }
});

// ─── PROMO CODE ─────────────────────────────────────────

document.getElementById("promo-btn")?.addEventListener("click", () => {
    const input    = document.getElementById("promo-input");
    const feedback = document.getElementById("promo-feedback");
    if (!input || !feedback) return;

    const code = input.value.trim().toUpperCase();

    if (!code) {
        showPromoFeedback("Enter a promo code first.", "error");
        return;
    }

    if (PROMO_CODES[code]) {
        appliedPromo = { ...PROMO_CODES[code], code };
        showPromoFeedback(`✓ ${appliedPromo.label} applied!`, "success");
        input.value = "";
        input.disabled = true;
        document.getElementById("promo-btn").disabled = true;
        document.getElementById("promo-btn").textContent = "APPLIED ✓";
        renderOrderSummary(getCart());
    } else {
        showPromoFeedback("Invalid code. Try: RADHA10, ODLAUNCH or SUPERCOOL", "error");
    }
});

/** Shows feedback text under the promo input */
function showPromoFeedback(msg, type) {
    const el = document.getElementById("promo-feedback");
    if (!el) return;
    el.textContent = msg;
    el.className   = `promo-feedback promo-${type}`;
}

// ─── CHECKOUT MODAL ─────────────────────────────────────

/** Opens the checkout modal */
async function openCheckout() {
    if (getCart().length === 0) {
        alert("Your bag is empty.");
        return;
    }

    try {
        const session = await fetch("/api/me");
        if (!session.ok) {
            alert("Please login before checkout.");
            window.location.href = "/";
            return;
        }
    } catch {
        alert("Start the website with Node before checkout.");
        return;
    }

    document.getElementById("checkout-modal")?.classList.add("active");
    document.getElementById("checkout-backdrop")?.classList.add("active");
    document.body.classList.add("no-scroll");
    await loadSavedAddresses();
}

/** Closes the checkout modal */
function closeCheckout() {
    document.getElementById("checkout-modal")?.classList.remove("active");
    document.getElementById("checkout-backdrop")?.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

document.getElementById("checkout-btn")?.addEventListener("click", openCheckout);
document.getElementById("checkout-close")?.addEventListener("click", closeCheckout);
document.getElementById("checkout-backdrop")?.addEventListener("click", closeCheckout);

// ─── SAVED ADDRESS UI ─────────────────────────

async function loadSavedAddresses() {
    const list = document.getElementById("address-list");
    if (list) list.innerHTML = `<p class="address-empty">Loading saved addresses...</p>`;

    try {
        const response = await fetch("/api/addresses");
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not load addresses");
        }

        savedAddresses = result.addresses || [];
        const defaultAddress = savedAddresses.find(address => address.isDefault) || savedAddresses[0];
        selectedAddressId = defaultAddress?.id || null;
        addressMode = savedAddresses.length ? "saved" : "new";
        renderAddressChooser();
    } catch {
        savedAddresses = [];
        selectedAddressId = null;
        addressMode = "new";
        renderAddressChooser("Add a delivery address to continue.");
    }
}

function renderAddressChooser(message = "") {
    const list = document.getElementById("address-list");
    const form = document.getElementById("address-form");
    if (!list || !form) return;

    if (!savedAddresses.length) {
        list.innerHTML = `<p class="address-empty">${message || "No saved addresses yet."}</p>`;
        form.classList.remove("is-hidden");
        return;
    }

    list.innerHTML = savedAddresses.map(address => `
        <label class="address-card ${address.id === selectedAddressId ? "selected" : ""}" data-address-id="${address.id}">
            <input type="radio" name="selected-address" value="${address.id}" ${address.id === selectedAddressId ? "checked" : ""}>
            <span>
                <strong>${address.label}${address.isDefault ? " · DEFAULT" : ""}</strong>
                <span>${address.fullName} · ${address.phone}</span>
                <span>${[
                    address.line1,
                    address.line2,
                    address.city,
                    address.state,
                    address.postalCode,
                    address.country
                ].filter(Boolean).join(", ")}</span>
            </span>
        </label>
    `).join("");

    list.querySelectorAll(".address-card").forEach(card => {
        card.addEventListener("click", () => {
            selectedAddressId = Number(card.dataset.addressId);
            addressMode = "saved";
            renderAddressChooser();
        });
    });

    form.classList.toggle("is-hidden", addressMode === "saved");
}

function showNewAddressForm() {
    addressMode = "new";
    selectedAddressId = null;
    renderAddressChooser();
    document.getElementById("addr-name")?.focus();
}

function getAddressFormPayload() {
    const value = id => document.getElementById(id)?.value.trim() || "";
    return {
        label: value("addr-label") || "Home",
        fullName: value("addr-name"),
        phone: value("addr-phone"),
        line1: value("addr-line1"),
        line2: value("addr-line2"),
        city: value("addr-city"),
        state: value("addr-state"),
        postalCode: value("addr-postal"),
        country: value("addr-country") || "India",
        isDefault: savedAddresses.length === 0
    };
}

function validateAddress(address) {
    const missing = [];
    if (!address.fullName) missing.push("full name");
    if (!address.phone) missing.push("phone");
    if (!address.line1) missing.push("address line");
    if (!address.city) missing.push("city");
    if (!address.state) missing.push("state");
    if (!address.postalCode) missing.push("pincode");

    if (missing.length) {
        alert(`Please add ${missing.join(", ")}.`);
        return false;
    }
    return true;
}

document.getElementById("new-address-btn")?.addEventListener("click", showNewAddressForm);

// ─── DATABASE ORDER CHECKOUT ─────────────────────────────

document.getElementById("mock-pay-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("mock-pay-btn");
    if (!btn) return;

    const cart = getCart();
    if (cart.length === 0) {
        alert("Your bag is empty.");
        return;
    }

    const checkoutPayload = {
        items: cart,
        promo: appliedPromo?.label || null,
        promoCode: appliedPromo?.code || null
    };

    if (addressMode === "saved" && selectedAddressId) {
        checkoutPayload.addressId = selectedAddressId;
    } else {
        const address = getAddressFormPayload();
        if (!validateAddress(address)) return;
        checkoutPayload.address = address;
        checkoutPayload.saveAddress = document.getElementById("addr-save")?.checked !== false;
    }

    btn.textContent = "PLACING ORDER...";
    btn.disabled = true;

    try {
        const response = await fetch("/api/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(checkoutPayload)
        });

        const result = await response.json();

        if (response.status === 401) {
            alert(result.message || "Please login before placing an order.");
            window.location.href = "/";
            return;
        }

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Order failed");
        }

        clearCart();
        appliedPromo = null;
        closeCheckout();

        const successEl = document.getElementById("order-success");
        const orderIdEl = document.getElementById("success-order-id");
        if (orderIdEl) orderIdEl.textContent = `ORDER_ID: ${result.order.id}`;
        if (successEl) {
            successEl.style.display = "flex";
            successEl.style.animation = "successFadeIn .6s cubic-bezier(.34,1.56,.64,1) forwards";
        }
    } catch (error) {
        alert(error.message || "Could not place order. Try again.");
    } finally {
        btn.textContent = "PLACE ORDER";
        btn.disabled = false;
    }
});

// ─── NAV HIDE/SHOW ON SCROLL ────────────────────────────

let lastScrollCart = 0;
window.addEventListener("scroll", () => {
    const nav = document.querySelector(".compact-nav");
    if (!nav) return;
    const current = window.scrollY;
    nav.style.boxShadow = current > 40
        ? "0 8px 40px rgba(0,0,0,.13)"
        : "0 4px 24px rgba(0,0,0,.08)";
    if (current <= 0) { nav.classList.remove("nav-hidden"); return; }
    if (current > lastScrollCart && current > 80) nav.classList.add("nav-hidden");
    else nav.classList.remove("nav-hidden");
    lastScrollCart = current;
}, { passive: true });

// ─── KEYBOARD ───────────────────────────────────────────

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeCheckout();
});

// ─── INIT ───────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    renderCartPage();
});
