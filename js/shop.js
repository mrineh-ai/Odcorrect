// ══════════════════════════════════════════════════════
//  ODCORRECT — shop.js
//  Product Grid, Filtering, Quick-View Panel, Add-to-Cart
//  Depends on: cart.js (must be loaded first)
// ══════════════════════════════════════════════════════

// ─── PRODUCT DATA ───────────────────────────────────────
// Mirror of the data in script.js — single source of truth
// In a real app this would come from a backend API: GET /api/products
let SHOP_PRODUCTS = [
    {
        id:"OC_MN_001", name:"OVERSIZED TEE",          cat:"men",
        priceNum:1299,  price:"₹1,299",  badge:"new",
        color:"#1d1d1f",
        colors:[{name:"BLACK",hex:"#1d1d1f"},{name:"CHALK",hex:"#e8e8e0"},{name:"OLIVE",hex:"#3d4228"}],
        desc:"Heavyweight 450gsm oversized tee with architectural silhouette. Dropped shoulders, boxy cut.",
        images:[] // add paths like "images/oc_mn_001_black.jpg" when ready
    },
    {
        id:"OC_WM_001", name:"CROP HOODIE",             cat:"women",
        priceNum:1899,  price:"₹1,899",  badge:"new",
        color:"#2d2d3a",
        colors:[{name:"MIDNIGHT",hex:"#2d2d3a"},{name:"BLUSH",hex:"#c8a0a0"}],
        desc:"Cropped hoodie with raw hem detailing and logo embroidery. Kangaroo pocket."
    },
    {
        id:"OC_MN_002", name:"CORE JOGGER SET",          cat:"men",
        priceNum:2499,  price:"₹2,499",  badge:"",
        color:"#3a3a3a",
        colors:[{name:"CHARCOAL",hex:"#3a3a3a"},{name:"CREAM",hex:"#f0ede6"}],
        desc:"Matching heavyweight joggers with engineering-grade stitching and cuffed ankle."
    },
    {
        id:"OC_WM_002", name:"REVERSE WEAVE HOODIE",    cat:"women",
        priceNum:2199,  price:"₹2,199",  badge:"",
        color:"#2a3520",
        colors:[{name:"FOREST",hex:"#2a3520"},{name:"STONE",hex:"#8a8a7a"}],
        desc:"Reverse weave construction for maximum shape retention. Side gusset panels."
    },
    {
        id:"OC_BB_001", name:"MINI TEE",                 cat:"baby",
        priceNum:699,   price:"₹699",    badge:"new",
        color:"#1d3a2a",
        colors:[{name:"SAGE",hex:"#1d3a2a"},{name:"WHITE",hex:"#f8f8f8"}],
        desc:"Soft 200gsm baby tee in RADHA collection colorways. 0–3 yrs."
    },
    {
        id:"OC_BG_001", name:"BABY DRESS",               cat:"baby",
        priceNum:799,   price:"₹799",    badge:"new",
        color:"#3a1d2a",
        colors:[{name:"MAUVE",hex:"#3a1d2a"},{name:"PEARL",hex:"#f0ece8"}],
        desc:"Tiny dress with OD branding for the next generation. 0–3 yrs."
    },
    {
        id:"OC_HF_001", name:"OD LOW RUNNER",             cat:"footwear",
        priceNum:3999,  price:"₹3,999",  badge:"",
        color:"#1d2a3a",
        colors:[{name:"NAVY",hex:"#1d2a3a"},{name:"OFF-WHITE",hex:"#f4f0e8"}],
        desc:"Low-profile runner with chunky outsole and OD tab. Vulcanised sole."
    },
    {
        id:"OC_HF_002", name:"PLATFORM SLIDE",            cat:"footwear",
        priceNum:1699,  price:"₹1,699",  badge:"sold",
        color:"#2a1d1d",
        colors:[{name:"OXBLOOD",hex:"#2a1d1d"}],
        desc:"Platform slide in premium moulded rubber. Sold out — join waitlist."
    },
    {
        id:"OC_MN_003", name:"COACH JACKET",              cat:"men",
        priceNum:3499,  price:"₹3,499",  badge:"",
        color:"#1a1a2a",
        colors:[{name:"NAVY",hex:"#1a1a2a"},{name:"CHALK",hex:"#e8e8e0"}],
        desc:"Satin-finish coach jacket with embroidered ODCORRECT badge and snap buttons."
    },
    {
        id:"OC_WM_003", name:"UTILITY CARGOS",            cat:"women",
        priceNum:2799,  price:"₹2,799",  badge:"",
        color:"#2a2a1a",
        colors:[{name:"KHAKI",hex:"#2a2a1a"},{name:"BLACK",hex:"#1d1d1f"}],
        desc:"Six-pocket utility pants with tonal OD hardware and articulated knees."
    },
    {
        id:"OC_MN_004", name:"TECH FLEECE HALF-ZIP",     cat:"men",
        priceNum:2099,  price:"₹2,099",  badge:"",
        color:"#1a2a2a",
        colors:[{name:"TEAL",hex:"#1a2a2a"},{name:"STONE",hex:"#8a8a7a"}],
        desc:"Textured tech fleece for the engineering aesthetic. Thumb holes."
    },
    {
        id:"OC_WM_004", name:"WIDE LEG SWEATS",           cat:"women",
        priceNum:1999,  price:"₹1,999",  badge:"new",
        color:"#2a1a2a",
        colors:[{name:"PLUM",hex:"#2a1a2a"},{name:"CREAM",hex:"#f0ede6"}],
        desc:"Ultra wide leg with elasticated waistband and OD tape stripe."
    }
];

function normalizeApiProduct(p) {
    const priceNum = Number(p.priceNum ?? p.price ?? 0);
    return {
        ...p,
        cat: p.cat || p.category || "men",
        priceNum,
        price: typeof p.price === "string" ? p.price : formatPrice(priceNum),
        color: p.color || "#1d1d1f",
        colors: Array.isArray(p.colors) && p.colors.length
            ? p.colors
            : [{ name: "DEFAULT", hex: p.color || "#1d1d1f" }],
        desc: p.desc || p.description || ""
    };
}

async function loadShopProductsFromApi() {
    try {
        const response = await fetch("/api/products");
        if (!response.ok) return;

        const result = await response.json();
        if (result.success && Array.isArray(result.products)) {
            SHOP_PRODUCTS = result.products.map(normalizeApiProduct);
        }
    } catch {
        // Keep the bundled product data as a fallback.
    }
}

// ─── CAT LABELS (for geometric placeholder blocks) ──────
const CAT_LABELS = { men:"M", women:"W", baby:"B", footwear:"F" };

// ─── STATE ──────────────────────────────────────────────
let currentFilter = "all";
let currentSort   = "default";
let currentProduct = null; // product open in quick-view panel
let panelQty = 1;
let selectedSize = "M";
let selectedColorName = "";

// ─── RENDER ─────────────────────────────────────────────

/**
 * Renders product cards into #shop-product-grid.
 * Applies category filter and sort order.
 */
function renderShopProducts() {
    const grid = document.getElementById("shop-product-grid");
    if (!grid) return;

    // 1. Filter
    let list = currentFilter === "all"
        ? [...SHOP_PRODUCTS]
        : SHOP_PRODUCTS.filter(p => p.cat === currentFilter);

    // 2. Sort
    switch (currentSort) {
        case "price-asc":  list.sort((a,b) => a.priceNum - b.priceNum); break;
        case "price-desc": list.sort((a,b) => b.priceNum - a.priceNum); break;
        case "name":       list.sort((a,b) => a.name.localeCompare(b.name)); break;
    }

    // 3. Update results label
    const rc = document.getElementById("results-count");
    const rcat = document.getElementById("results-cat");
    if (rc)   rc.textContent = `${list.length} ${list.length === 1 ? "ITEM" : "ITEMS"}`;
    if (rcat) rcat.textContent = currentFilter === "all" ? "ALL CATEGORIES" : currentFilter.toUpperCase();

    // 4. Animate grid out
    grid.style.opacity = "0";
    grid.style.transform = "translateY(16px)";
    grid.style.transition = "opacity .25s, transform .25s";

    setTimeout(() => {
        grid.innerHTML = "";

        list.forEach((p, i) => {
            const isSold = p.badge === "sold";
            const card = document.createElement("div");
            card.className = "product-card";
            card.style.animationDelay = `${i * 0.055}s`;

            // Each card has a placeholder coloured block + product info
            card.innerHTML = `
                <div class="product-img-wrap" onclick="openQuickView('${p.id}')">
                    <div class="product-img-block" style="background:${p.color}">
                        <span class="img-block-label">${CAT_LABELS[p.cat] || "OD"}</span>
                    </div>
                    ${p.badge ? `<div class="product-badge ${p.badge}">${p.badge.toUpperCase()}</div>` : ""}
                    <div class="product-img-overlay">
                        <span class="img-overlay-cta">QUICK VIEW ↗</span>
                    </div>
                </div>
                <div class="product-info">
                    <p class="product-cat">// ${p.cat.toUpperCase()}</p>
                    <p class="product-name">${p.name}</p>
                    <div class="color-dots">
                        ${p.colors.map(c =>
                            `<span class="color-dot" style="background:${c.hex}" title="${c.name}"></span>`
                        ).join("")}
                    </div>
                    <p class="product-desc-short">${p.desc}</p>
                    <div class="product-row">
                        <span class="product-price">${p.price}</span>
                        <div class="card-action-btns">
                            <button
                                class="product-view-btn"
                                onclick="openQuickView('${p.id}')"
                                aria-label="Quick view ${p.name}">
                                VIEW ↗
                            </button>
                            <button
                                class="add-to-cart-btn win-effect ${isSold ? "sold-out" : ""}"
                                onclick="${isSold ? "" : `quickAddToCart('${p.id}', event)`}"
                                ${isSold ? "disabled" : ""}
                                aria-label="${isSold ? "Sold out" : "Add " + p.name + " to bag"}">
                                ${isSold ? "SOLD OUT" : "+ BAG"}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Re-attach win-effect mouse tracking
        initWinEffect();

        // Animate grid in
        grid.style.opacity = "1";
        grid.style.transform = "translateY(0)";
    }, 260);
}

// ─── FILTER / SORT ──────────────────────────────────────

/** Sets active filter and re-renders */
function setFilter(cat) {
    currentFilter = cat;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.cat === cat);
    });
    renderShopProducts();
}

/** Called by filter buttons */
function initFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => setFilter(btn.dataset.cat));
    });
    const sortSel = document.getElementById("sort-select");
    if (sortSel) {
        sortSel.addEventListener("change", () => {
            currentSort = sortSel.value;
            renderShopProducts();
        });
    }
}

// ─── QUICK VIEW PANEL ───────────────────────────────────

/** Opens the side panel with full product details */
function openQuickView(productId) {
    const product = SHOP_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    currentProduct = product;
    panelQty = 1;
    selectedSize = "M";
    selectedColorName = product.colors[0]?.name || "BLACK";

    // Populate text fields
    document.getElementById("overlay-spec").textContent  = `CORE_ID: ${product.id}`;
    document.getElementById("overlay-title").textContent = product.name;
    document.getElementById("overlay-price").textContent = product.price;
    document.getElementById("overlay-desc").textContent  = product.desc;
    document.getElementById("qty-value").textContent     = panelQty;
    document.getElementById("selected-size").textContent = selectedSize;

    // Populate colour swatches
    const swatchWrap = document.getElementById("color-swatches");
    const selectedColorEl = document.getElementById("selected-color");
    if (swatchWrap) {
        swatchWrap.innerHTML = product.colors.map((c, idx) => `
            <button
                class="swatch-btn ${idx === 0 ? "active" : ""}"
                style="background:${c.hex}"
                data-color="${c.name}"
                title="${c.name}"
                aria-label="Color: ${c.name}">
            </button>
        `).join("");

        // Swatch click handler
        swatchWrap.querySelectorAll(".swatch-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                swatchWrap.querySelectorAll(".swatch-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedColorName = btn.dataset.color;
                if (selectedColorEl) selectedColorEl.textContent = selectedColorName;
            });
        });
    }

    // Placeholder image block
    const ph = document.getElementById("panel-img-placeholder");
    if (ph) {
        ph.innerHTML = `
            <div class="pi-block" style="background:${product.color}">
                ${CAT_LABELS[product.cat]}
            </div>
            <span class="pi-label">${product.cat.toUpperCase()}</span>
        `;
    }

    // Size button listeners
    document.querySelectorAll(".size-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.size === selectedSize) btn.classList.add("active");
        btn.onclick = () => {
            document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedSize = btn.dataset.size;
            const el = document.getElementById("selected-size");
            if (el) el.textContent = selectedSize;
        };
    });

    // Open panel
    document.getElementById("product-overlay")?.classList.add("active");
    document.getElementById("panel-backdrop")?.classList.add("active");
    document.body.classList.add("no-scroll");
}
window.openQuickView = openQuickView;

/** Closes the side panel */
function closeQuickView() {
    document.getElementById("product-overlay")?.classList.remove("active");
    document.getElementById("panel-backdrop")?.classList.remove("active");
    document.body.classList.remove("no-scroll");
    currentProduct = null;
}

// Qty controls in panel
document.getElementById("qty-minus")?.addEventListener("click", () => {
    if (panelQty > 1) {
        panelQty--;
        const el = document.getElementById("qty-value");
        if (el) el.textContent = panelQty;
    }
});
document.getElementById("qty-plus")?.addEventListener("click", () => {
    if (panelQty < 10) {
        panelQty++;
        const el = document.getElementById("qty-value");
        if (el) el.textContent = panelQty;
    }
});

// Panel "ADD TO BAG" button
document.getElementById("panel-add-btn")?.addEventListener("click", () => {
    if (!currentProduct) return;
    const item = {
        id:         currentProduct.id,
        name:       currentProduct.name,
        price:      currentProduct.priceNum,
        color:      currentProduct.color,
        cat:        currentProduct.cat,
        size:       selectedSize,
        colorName:  selectedColorName
    };
    addToCart(item, panelQty);
    showToast(currentProduct.name);
    closeQuickView();
});

// Close panel via backdrop or button
document.getElementById("close-panel")?.addEventListener("click", closeQuickView);
document.getElementById("panel-backdrop")?.addEventListener("click", closeQuickView);

// ─── QUICK ADD (card "+ BAG" button) ────────────────────

/**
 * Adds the default variant (first color, size M) directly from the card,
 * without opening the panel.
 */
function quickAddToCart(productId, event) {
    event.stopPropagation(); // don't open quick view
    const product = SHOP_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const item = {
        id:        product.id,
        name:      product.name,
        price:     product.priceNum,
        color:     product.color,
        cat:       product.cat,
        size:      "M",
        colorName: product.colors[0]?.name || "DEFAULT"
    };
    addToCart(item, 1);
    showToast(product.name);
}
window.quickAddToCart = quickAddToCart;

// ─── TOAST ──────────────────────────────────────────────

let toastTimer = null;

/** Shows the "Added to Bag" toast notification */
function showToast(productName) {
    const toast = document.getElementById("toast");
    const sub   = document.getElementById("toast-sub");
    if (!toast) return;
    if (sub) sub.textContent = productName;

    clearTimeout(toastTimer);
    toast.classList.remove("toast-visible");

    // Force reflow so re-entry animation plays
    void toast.offsetWidth;
    toast.classList.add("toast-visible");

    toastTimer = setTimeout(() => {
        toast.classList.remove("toast-visible");
    }, 3500);
}

// ─── WIN EFFECT (mouse-tracking glow on cards) ──────────

function initWinEffect() {
    document.querySelectorAll(".win-effect, .add-to-cart-btn").forEach(el => {
        el.addEventListener("mousemove", e => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--x", `${e.clientX - r.left}px`);
            el.style.setProperty("--y", `${e.clientY - r.top}px`);
        });
    });
}

// ─── SCROLL REVEAL ──────────────────────────────────────

function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80)
            el.classList.add("active");
    });
}
window.addEventListener("scroll", reveal, { passive: true });

// ─── NAV HIDE/SHOW ON SCROLL ────────────────────────────

let lastScroll = 0;
window.addEventListener("scroll", () => {
    const nav = document.querySelector(".compact-nav");
    if (!nav) return;
    const current = window.scrollY;
    nav.style.boxShadow = current > 40
        ? "0 8px 40px rgba(0,0,0,.13), 0 1px 0 rgba(255,255,255,.9) inset"
        : "0 4px 24px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.9) inset";
    if (current <= 0) { nav.classList.remove("nav-hidden"); return; }
    if (current > lastScroll && current > 80) nav.classList.add("nav-hidden");
    else nav.classList.remove("nav-hidden");
    lastScroll = current;
}, { passive: true });

// ─── KEYBOARD ESCAPE ────────────────────────────────────

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeQuickView();
});

// ─── INIT ───────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
    await loadShopProductsFromApi();
    renderShopProducts();
    initFilters();
    initWinEffect();
    setTimeout(reveal, 200);
});
