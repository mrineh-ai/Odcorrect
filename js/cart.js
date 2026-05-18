// ══════════════════════════════════════════════════════
//  ODCORRECT — cart.js
//  Shared localStorage Cart System
//  Used by: shop.html, cart.html, index.html
// ══════════════════════════════════════════════════════

/**
 * CART DATA STRUCTURE (stored in localStorage under "odcorrect_cart"):
 * [
 *   {
 *     id: "OC_MN_001",          // product ID
 *     name: "OVERSIZED TEE",    // product name
 *     price: 1299,              // numeric price (no ₹ symbol)
 *     color: "#1d1d1f",         // swatch color
 *     cat: "men",               // category
 *     size: "M",                // selected size
 *     colorName: "BLACK",       // selected color name
 *     qty: 2,                   // quantity
 *     addedAt: 1710000000000    // timestamp for ordering
 *   },
 *   ...
 * ]
 */

const CART_KEY = "odcorrect_cart";
const AUTH_KEY = "odcorrect_user";

// ─── Core Cart API ──────────────────────────────────────

/**
 * Reads the current cart array from localStorage.
 * @returns {Array} cart items
 */
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

/**
 * Writes the cart array back to localStorage.
 * @param {Array} cart - the cart array to save
 */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Adds an item to the cart. If an identical item (same id + size + colorName)
 * already exists, increments its quantity instead.
 *
 * @param {Object} item - product data to add
 * @param {number} qty  - quantity to add (default 1)
 * @returns {Object} the updated or newly added cart line
 */
function addToCart(item, qty = 1) {
    const cart = getCart();

    // Look for an existing line with same product, size, and color
    const existing = cart.find(
        line => line.id === item.id &&
                line.size === item.size &&
                line.colorName === item.colorName
    );

    if (existing) {
        existing.qty = Math.min(existing.qty + qty, 10); // max 10 per line
    } else {
        cart.push({ ...item, qty, addedAt: Date.now() });
    }

    saveCart(cart);
    updateBagCount(); // refresh any nav counters on the page
    return existing || cart[cart.length - 1];
}

/**
 * Removes a cart line entirely by matching id + size + colorName.
 * @param {string} id        - product id
 * @param {string} size      - size string
 * @param {string} colorName - color name
 */
function removeFromCart(id, size, colorName) {
    const cart = getCart().filter(
        line => !(line.id === id && line.size === size && line.colorName === colorName)
    );
    saveCart(cart);
    updateBagCount();
}

/**
 * Updates the quantity of a specific cart line.
 * If qty <= 0 the line is removed.
 * @param {string} id
 * @param {string} size
 * @param {string} colorName
 * @param {number} newQty
 */
function updateQty(id, size, colorName, newQty) {
    if (newQty <= 0) {
        removeFromCart(id, size, colorName);
        return;
    }
    const cart = getCart();
    const line = cart.find(
        l => l.id === id && l.size === size && l.colorName === colorName
    );
    if (line) {
        line.qty = Math.min(newQty, 10);
        saveCart(cart);
        updateBagCount();
    }
}

/**
 * Clears all items from the cart.
 */
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateBagCount();
}

/**
 * Returns the total number of individual items (sum of all qtys).
 * @returns {number}
 */
function getCartCount() {
    return getCart().reduce((sum, line) => sum + line.qty, 0);
}

/**
 * Returns the subtotal (before tax/shipping) as a number.
 * @returns {number}
 */
function getCartSubtotal() {
    return getCart().reduce((sum, line) => sum + line.price * line.qty, 0);
}

// ─── UI Helpers ──────────────────────────────────────────

/**
 * Updates every .bag-count element on the page with the current item count.
 * Call this after any cart mutation.
 */
function updateBagCount() {
    const count = getCartCount();
    document.querySelectorAll(".bag-count").forEach(el => {
        el.textContent = count;
        // Quick pop animation
        el.style.transform = "scale(1.7)";
        el.style.transition = "transform .15s cubic-bezier(.34,1.56,.64,1)";
        setTimeout(() => { el.style.transform = "scale(1)"; }, 200);
    });
}

/**
 * Formats a numeric price into ODCORRECT style: "₹1,299"
 * @param {number} amount
 * @returns {string}
 */
function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

// ─── Initialise count on every page load ───────────────
document.addEventListener("DOMContentLoaded", updateBagCount);

function getAuthUser() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_KEY));
    } catch {
        return null;
    }
}

function clearAuthUser() {
    localStorage.removeItem(AUTH_KEY);
    updateAuthNav();
}

function saveAuthUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    updateAuthNav();
}

function updateAuthNav() {
    const user = getAuthUser();
    document.querySelectorAll(".login-trigger").forEach(trigger => {
        if (!user) {
            trigger.classList.remove("logged-in");
            trigger.textContent = "LOGIN";
            return;
        }

        trigger.classList.add("logged-in");
        trigger.textContent = `HI ${(user.name || "USER").toUpperCase().split(" ")[0]}`;
        trigger.title = user.role === "admin" ? `${user.email} - open admin` : `${user.email} - click to logout`;
        if (trigger.tagName === "A") {
            if (user.role === "admin") {
                trigger.setAttribute("href", "/admin");
                trigger.onclick = null;
            } else {
                trigger.setAttribute("href", "#");
                trigger.onclick = async e => {
                    e.preventDefault();
                    if (!confirm("You are logged in. Log out?")) return;
                    try {
                        await fetch("/api/logout", { method: "POST" });
                    } catch { /* ignore */ }
                    clearAuthUser();
                    window.location.reload();
                };
            }
        }
    });
}

async function syncAuthFromServer() {
    try {
        const response = await fetch("/api/me");
        if (!response.ok) {
            clearAuthUser();
            return;
        }

        const result = await response.json();
        if (result.success && result.user) {
            saveAuthUser(result.user);
        } else {
            clearAuthUser();
        }
    } catch {
        updateAuthNav();
    }
}

document.addEventListener("DOMContentLoaded", updateAuthNav);
document.addEventListener("DOMContentLoaded", syncAuthFromServer);
