// ══════════════════════════════════════════════════════
//  ODCORRECT — shop.js  v2
//  Live API fetch, fixed reveals, VIEW → product.html
//  Depends on: cart.js
// ══════════════════════════════════════════════════════

// ─── FALLBACK PRODUCT DATA ──────────────────────────
let SHOP_PRODUCTS = [
    { id:"OC_MN_001", name:"OVERSIZED TEE",         cat:"men",      priceNum:1299, price:"₹1,299", badge:"new",  color:"#1d1d1f", colors:[{name:"BLACK",hex:"#1d1d1f"},{name:"CHALK",hex:"#e8e8e0"},{name:"OLIVE",hex:"#3d4228"}], desc:"Heavyweight 450gsm oversized tee with architectural silhouette." },
    { id:"OC_WM_001", name:"CROP HOODIE",            cat:"women",    priceNum:1899, price:"₹1,899", badge:"new",  color:"#2d2d3a", colors:[{name:"MIDNIGHT",hex:"#2d2d3a"},{name:"BLUSH",hex:"#c8a0a0"}], desc:"Cropped hoodie with raw hem detailing and logo embroidery." },
    { id:"OC_MN_002", name:"CORE JOGGER SET",        cat:"men",      priceNum:2499, price:"₹2,499", badge:"",     color:"#3a3a3a", colors:[{name:"CHARCOAL",hex:"#3a3a3a"},{name:"CREAM",hex:"#f0ede6"}], desc:"Matching heavyweight joggers with engineering-grade stitching." },
    { id:"OC_WM_002", name:"REVERSE WEAVE HOODIE",   cat:"women",    priceNum:2199, price:"₹2,199", badge:"",     color:"#2a3520", colors:[{name:"FOREST",hex:"#2a3520"},{name:"STONE",hex:"#8a8a7a"}], desc:"Reverse weave construction for maximum shape retention." },
    { id:"OC_BB_001", name:"MINI TEE",               cat:"baby",     priceNum:699,  price:"₹699",   badge:"new",  color:"#1d3a2a", colors:[{name:"SAGE",hex:"#1d3a2a"},{name:"WHITE",hex:"#f8f8f8"}], desc:"Soft 200gsm baby tee in RADHA collection colorways." },
    { id:"OC_BG_001", name:"BABY DRESS",             cat:"baby",     priceNum:799,  price:"₹799",   badge:"new",  color:"#3a1d2a", colors:[{name:"MAUVE",hex:"#3a1d2a"},{name:"PEARL",hex:"#f0ece8"}], desc:"Tiny dress with OD branding for the next generation." },
    { id:"OC_HF_001", name:"OD LOW RUNNER",          cat:"footwear", priceNum:3999, price:"₹3,999", badge:"",     color:"#1d2a3a", colors:[{name:"NAVY",hex:"#1d2a3a"},{name:"OFF-WHITE",hex:"#f4f0e8"}], desc:"Low-profile runner with chunky outsole and OD tab." },
    { id:"OC_HF_002", name:"PLATFORM SLIDE",         cat:"footwear", priceNum:1699, price:"₹1,699", badge:"sold", color:"#2a1d1d", colors:[{name:"OXBLOOD",hex:"#2a1d1d"}], desc:"Platform slide in premium moulded rubber. Sold out." },
    { id:"OC_MN_003", name:"COACH JACKET",           cat:"men",      priceNum:3499, price:"₹3,499", badge:"",     color:"#1a1a2a", colors:[{name:"NAVY",hex:"#1a1a2a"},{name:"CHALK",hex:"#e8e8e0"}], desc:"Satin-finish coach jacket with embroidered ODCORRECT badge." },
    { id:"OC_WM_003", name:"UTILITY CARGOS",         cat:"women",    priceNum:2799, price:"₹2,799", badge:"",     color:"#2a2a1a", colors:[{name:"KHAKI",hex:"#2a2a1a"},{name:"BLACK",hex:"#1d1d1f"}], desc:"Six-pocket utility pants with tonal OD hardware." },
    { id:"OC_MN_004", name:"TECH FLEECE HALF-ZIP",   cat:"men",      priceNum:2099, price:"₹2,099", badge:"",     color:"#1a2a2a", colors:[{name:"TEAL",hex:"#1a2a2a"},{name:"STONE",hex:"#8a8a7a"}], desc:"Textured tech fleece for the engineering aesthetic." },
    { id:"OC_WM_004", name:"WIDE LEG SWEATS",        cat:"women",    priceNum:1999, price:"₹1,999", badge:"new",  color:"#2a1a2a", colors:[{name:"PLUM",hex:"#2a1a2a"},{name:"CREAM",hex:"#f0ede6"}], desc:"Ultra wide leg with elasticated waistband and OD tape." }
];

const CAT_LABELS = { men:"M", women:"W", baby:"B", footwear:"F" };

// ─── FETCH FROM API ──────────────────────────────────
async function loadShopProductsFromApi() {
    try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const result = await res.json();
        if (result.success && Array.isArray(result.products)) {
            SHOP_PRODUCTS = result.products.map(p => ({
                ...p,
                cat:      p.cat || p.category || "men",
                priceNum: Number(p.price) || 0,
                price:    "₹" + Number(p.price || 0).toLocaleString("en-IN"),
                color:    p.color || "#1d1d1f",
                desc:     p.desc || p.description || "",
                colors:   p.colors || [{ name:"DEFAULT", hex: p.color || "#1d1d1f" }]
            }));
        }
    } catch { /* fallback data stays */ }
}

// ─── STATE ──────────────────────────────────────────
let currentFilter  = "all";
let currentSort    = "default";
let currentProduct = null;
let panelQty       = 1;
let selectedSize   = "M";
let selectedColorName = "";

// ─── RENDER GRID ─────────────────────────────────────
function renderShopProducts() {
    const grid = document.getElementById("shop-product-grid");
    if (!grid) return;

    let list = currentFilter === "all"
        ? [...SHOP_PRODUCTS]
        : SHOP_PRODUCTS.filter(p => p.cat === currentFilter);

    switch (currentSort) {
        case "price-asc":  list.sort((a,b) => a.priceNum - b.priceNum); break;
        case "price-desc": list.sort((a,b) => b.priceNum - a.priceNum); break;
        case "name":       list.sort((a,b) => a.name.localeCompare(b.name)); break;
    }

    const rc   = document.getElementById("results-count");
    const rcat = document.getElementById("results-cat");
    if (rc)   rc.textContent = `${list.length} ${list.length === 1 ? "ITEM" : "ITEMS"}`;
    if (rcat) rcat.textContent = currentFilter === "all" ? "ALL CATEGORIES" : currentFilter.toUpperCase();

    grid.style.opacity    = "0";
    grid.style.transform  = "translateY(16px)";
    grid.style.transition = "opacity .25s, transform .25s";

    setTimeout(() => {
        grid.innerHTML = "";
        list.forEach((p, i) => {
            const isSold = p.badge === "sold";
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <div class="product-img-wrap" onclick="location.href='product.html?id=${p.id}'" style="cursor:pointer">
                    <div class="product-img-block" style="background:${p.color}">
                        <span class="img-block-label">${CAT_LABELS[p.cat] || "OD"}</span>
                    </div>
                    ${p.badge ? `<div class="product-badge ${p.badge}">${p.badge.toUpperCase()}</div>` : ""}
                    <div class="product-img-overlay"><span class="img-overlay-cta">QUICK VIEW ↗</span></div>
                </div>
                <div class="product-info">
                    <p class="product-cat">// ${p.cat.toUpperCase()}</p>
                    <p class="product-name">${p.name}</p>
                    <div class="color-dots">
                        ${(p.colors || []).map(c => `<span class="color-dot" style="background:${c.hex}" title="${c.name}"></span>`).join("")}
                    </div>
                    <p class="product-desc-short">${p.desc}</p>
                    <div class="product-row">
                        <span class="product-price">${p.price}</span>
                        <div class="card-action-btns">
                            <button class="product-view-btn" onclick="openQuickView('${p.id}')">VIEW ↗</button>
                            <button class="add-to-cart-btn win-effect ${isSold ? "sold-out" : ""}"
                                onclick="${isSold ? "" : `quickAddToCart('${p.id}',event)`}"
                                ${isSold ? "disabled" : ""}>
                                ${isSold ? "SOLD OUT" : "+ BAG"}
                            </button>
                        </div>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
        initWinEffect();
        grid.style.opacity   = "1";
        grid.style.transform = "translateY(0)";
    }, 260);
}

// ─── FILTER / SORT ───────────────────────────────────
function setFilter(cat) {
    currentFilter = cat;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b.dataset.cat === cat));
    renderShopProducts();
}
function initFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn =>
        btn.addEventListener("click", () => setFilter(btn.dataset.cat))
    );
    document.getElementById("sort-select")?.addEventListener("change", e => {
        currentSort = e.target.value;
        renderShopProducts();
    });
}

// ─── QUICK VIEW PANEL ───────────────────────────────
function openQuickView(productId) {
    const p = SHOP_PRODUCTS.find(x => x.id === productId);
    if (!p) return;
    currentProduct    = p;
    panelQty          = 1;
    selectedSize      = "M";
    selectedColorName = p.colors?.[0]?.name || "DEFAULT";

    document.getElementById("overlay-spec").textContent  = `CORE_ID: ${p.id}`;
    document.getElementById("overlay-title").textContent = p.name;
    document.getElementById("overlay-price").textContent = p.price;
    document.getElementById("overlay-desc").textContent  = p.desc;
    const qvEl = document.getElementById("qty-value");
    if (qvEl) qvEl.textContent = 1;
    const ssEl = document.getElementById("selected-size");
    if (ssEl) ssEl.textContent = "M";

    // Swatches
    const sw = document.getElementById("color-swatches");
    const scEl = document.getElementById("selected-color");
    if (sw && p.colors) {
        sw.innerHTML = p.colors.map((c,i) =>
            `<button class="swatch-btn ${i===0?"active":""}" style="background:${c.hex}" data-color="${c.name}" title="${c.name}"></button>`
        ).join("");
        sw.querySelectorAll(".swatch-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                sw.querySelectorAll(".swatch-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedColorName = btn.dataset.color;
                if (scEl) scEl.textContent = selectedColorName;
            });
        });
    }

    // Placeholder image
    const ph = document.getElementById("panel-img-placeholder");
    if (ph) ph.innerHTML = `
        <div class="pi-block" style="background:${p.color}">${CAT_LABELS[p.cat]||"OD"}</div>
        <span class="pi-label">${p.cat.toUpperCase()}</span>`;

    // Size btns
    document.querySelectorAll(".size-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.size === "M");
        btn.onclick = () => {
            document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedSize = btn.dataset.size;
            if (ssEl) ssEl.textContent = selectedSize;
        };
    });

    // Full page link
    const fpl = document.getElementById("panel-full-page-link");
    if (fpl) fpl.href = `product.html?id=${p.id}`;

    document.getElementById("product-overlay")?.classList.add("active");
    document.getElementById("panel-backdrop")?.classList.add("active");
    document.body.classList.add("no-scroll");
}
window.openQuickView = openQuickView;

function closeQuickView() {
    document.getElementById("product-overlay")?.classList.remove("active");
    document.getElementById("panel-backdrop")?.classList.remove("active");
    document.body.classList.remove("no-scroll");
    currentProduct = null;
}

document.getElementById("qty-minus")?.addEventListener("click", () => {
    if (panelQty > 1) { panelQty--; const el = document.getElementById("qty-value"); if (el) el.textContent = panelQty; }
});
document.getElementById("qty-plus")?.addEventListener("click", () => {
    if (panelQty < 10) { panelQty++; const el = document.getElementById("qty-value"); if (el) el.textContent = panelQty; }
});
document.getElementById("panel-add-btn")?.addEventListener("click", () => {
    if (!currentProduct) return;
    addToCart({ id:currentProduct.id, name:currentProduct.name, price:currentProduct.priceNum, color:currentProduct.color, cat:currentProduct.cat, size:selectedSize, colorName:selectedColorName }, panelQty);
    showToast(currentProduct.name);
    closeQuickView();
});
document.getElementById("close-panel")?.addEventListener("click", closeQuickView);
document.getElementById("panel-backdrop")?.addEventListener("click", closeQuickView);

// ─── QUICK ADD FROM CARD ─────────────────────────────
function quickAddToCart(id, event) {
    event.stopPropagation();
    const p = SHOP_PRODUCTS.find(x => x.id === id);
    if (!p) return;
    addToCart({ id:p.id, name:p.name, price:p.priceNum, color:p.color, cat:p.cat, size:"M", colorName:p.colors?.[0]?.name||"DEFAULT" }, 1);
    showToast(p.name);
}
window.quickAddToCart = quickAddToCart;

// ─── TOAST ──────────────────────────────────────────
let toastTimer = null;
function showToast(name) {
    const toast = document.getElementById("toast");
    const sub   = document.getElementById("toast-sub");
    if (!toast) return;
    if (sub) sub.textContent = name;
    clearTimeout(toastTimer);
    toast.classList.remove("toast-visible");
    void toast.offsetWidth;
    toast.classList.add("toast-visible");
    toastTimer = setTimeout(() => toast.classList.remove("toast-visible"), 3500);
}

// ─── WIN EFFECT ──────────────────────────────────────
function initWinEffect() {
    document.querySelectorAll(".win-effect").forEach(el => {
        el.addEventListener("mousemove", e => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--x", `${e.clientX-r.left}px`);
            el.style.setProperty("--y", `${e.clientY-r.top}px`);
        });
    });
}

// ─── REVEAL ──────────────────────────────────────────
function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60) el.classList.add("active");
    });
}
window.addEventListener("scroll", reveal, { passive: true });

// ─── NAV SCROLL ──────────────────────────────────────
let lastScrollShop = 0;
window.addEventListener("scroll", () => {
    const nav = document.querySelector(".compact-nav");
    if (!nav) return;
    const cur = window.scrollY;
    if (cur <= 0) { nav.classList.remove("nav-hidden"); return; }
    if (cur > lastScrollShop && cur > 80) nav.classList.add("nav-hidden");
    else nav.classList.remove("nav-hidden");
    lastScrollShop = cur;
}, { passive: true });

document.addEventListener("keydown", e => { if (e.key === "Escape") closeQuickView(); });

// ─── INIT ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    await loadShopProductsFromApi();
    renderShopProducts();
    initFilters();
    initWinEffect();
    updateBagCount();
    // Reveal immediately (don't wait for scroll)
    setTimeout(reveal, 80);
    setTimeout(reveal, 350);
});