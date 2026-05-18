// ══════════════════════════════════════════════════════
//  ODCORRECT — product.js  v2
//  Fetches product from /api/products/:id
//  Falls back to hardcoded data if server unavailable
//  Depends on: cart.js
// ══════════════════════════════════════════════════════

// ─── FALLBACK DATA ──────────────────────────────────
const ALL_PRODUCTS_FALLBACK = [
    { id:"OC_MN_001", name:"OVERSIZED TEE",         cat:"men",      priceNum:1299, price:"₹1,299", badge:"new",  color:"#1d1d1f", colors:[{name:"BLACK",hex:"#1d1d1f"},{name:"CHALK",hex:"#e8e8e0"},{name:"OLIVE",hex:"#3d4228"}], desc:"Heavyweight 450gsm oversized tee with architectural silhouette. Dropped shoulders, boxy cut — engineered to keep its shape drop after drop." },
    { id:"OC_WM_001", name:"CROP HOODIE",            cat:"women",    priceNum:1899, price:"₹1,899", badge:"new",  color:"#2d2d3a", colors:[{name:"MIDNIGHT",hex:"#2d2d3a"},{name:"BLUSH",hex:"#c8a0a0"}], desc:"Cropped hoodie with raw hem detailing and OD logo embroidery. Kangaroo pocket." },
    { id:"OC_MN_002", name:"CORE JOGGER SET",        cat:"men",      priceNum:2499, price:"₹2,499", badge:"",     color:"#3a3a3a", colors:[{name:"CHARCOAL",hex:"#3a3a3a"},{name:"CREAM",hex:"#f0ede6"}], desc:"Matching heavyweight joggers with engineering-grade stitching and cuffed ankle." },
    { id:"OC_WM_002", name:"REVERSE WEAVE HOODIE",   cat:"women",    priceNum:2199, price:"₹2,199", badge:"",     color:"#2a3520", colors:[{name:"FOREST",hex:"#2a3520"},{name:"STONE",hex:"#8a8a7a"}], desc:"Reverse weave construction for maximum shape retention. Side gusset panels." },
    { id:"OC_BB_001", name:"MINI TEE",               cat:"baby",     priceNum:699,  price:"₹699",   badge:"new",  color:"#1d3a2a", colors:[{name:"SAGE",hex:"#1d3a2a"},{name:"WHITE",hex:"#f8f8f8"}], desc:"Soft 200gsm baby tee in RADHA collection colorways. Pre-shrunk, tagless." },
    { id:"OC_BG_001", name:"BABY DRESS",             cat:"baby",     priceNum:799,  price:"₹799",   badge:"new",  color:"#3a1d2a", colors:[{name:"MAUVE",hex:"#3a1d2a"},{name:"PEARL",hex:"#f0ece8"}], desc:"Tiny dress with OD branding for the next generation. Snap buttons. 0–3 yrs." },
    { id:"OC_HF_001", name:"OD LOW RUNNER",          cat:"footwear", priceNum:3999, price:"₹3,999", badge:"",     color:"#1d2a3a", colors:[{name:"NAVY",hex:"#1d2a3a"},{name:"OFF-WHITE",hex:"#f4f0e8"}], desc:"Low-profile runner with chunky vulcanised outsole and OD woven tab." },
    { id:"OC_HF_002", name:"PLATFORM SLIDE",         cat:"footwear", priceNum:1699, price:"₹1,699", badge:"sold", color:"#2a1d1d", colors:[{name:"OXBLOOD",hex:"#2a1d1d"}], desc:"Platform slide in premium moulded rubber. Sold out — join waitlist." },
    { id:"OC_MN_003", name:"COACH JACKET",           cat:"men",      priceNum:3499, price:"₹3,499", badge:"",     color:"#1a1a2a", colors:[{name:"NAVY",hex:"#1a1a2a"},{name:"CHALK",hex:"#e8e8e0"}], desc:"Satin-finish coach jacket with embroidered ODCORRECT badge and snap buttons." },
    { id:"OC_WM_003", name:"UTILITY CARGOS",         cat:"women",    priceNum:2799, price:"₹2,799", badge:"",     color:"#2a2a1a", colors:[{name:"KHAKI",hex:"#2a2a1a"},{name:"BLACK",hex:"#1d1d1f"}], desc:"Six-pocket utility pants with tonal OD hardware and articulated knees." },
    { id:"OC_MN_004", name:"TECH FLEECE HALF-ZIP",   cat:"men",      priceNum:2099, price:"₹2,099", badge:"",     color:"#1a2a2a", colors:[{name:"TEAL",hex:"#1a2a2a"},{name:"STONE",hex:"#8a8a7a"}], desc:"Textured tech fleece for the engineering aesthetic. Thumb holes." },
    { id:"OC_WM_004", name:"WIDE LEG SWEATS",        cat:"women",    priceNum:1999, price:"₹1,999", badge:"new",  color:"#2a1a2a", colors:[{name:"PLUM",hex:"#2a1a2a"},{name:"CREAM",hex:"#f0ede6"}], desc:"Ultra wide leg with elasticated waistband and OD tape stripe." }
];

const CAT_LABELS = { men:"M", women:"W", baby:"B", footwear:"F" };

// ─── STATE ──────────────────────────────────────────
let product       = null;
let allProducts   = [...ALL_PRODUCTS_FALLBACK];
let selectedSize  = "M";
let selectedColor = null;
let pdQty         = 1;
let sizeGuideOpen = false;
let wishlistItems = [];
try { wishlistItems = JSON.parse(localStorage.getItem("odcorrect_wishlist") || "[]"); } catch {}

// ─── LOAD PRODUCT ───────────────────────────────────
async function loadProduct() {
    const id = new URLSearchParams(window.location.search).get("id");

    // Try to fetch from API first
    try {
        const res = await fetch("/api/products");
        if (res.ok) {
            const result = await res.json();
            if (result.success && Array.isArray(result.products)) {
                allProducts = result.products.map(p => ({
                    ...p,
                    cat:      p.cat || p.category || "men",
                    priceNum: Number(p.price) || 0,
                    price:    "₹" + Number(p.price||0).toLocaleString("en-IN"),
                    color:    p.color || "#1d1d1f",
                    desc:     p.desc || p.description || "",
                    colors:   p.colors || [{ name:"DEFAULT", hex: p.color||"#1d1d1f" }]
                }));
            }
        }
    } catch { /* fallback */ }

    product = allProducts.find(p => p.id === id) || allProducts[0];
    renderProduct();
}

// ─── RENDER ─────────────────────────────────────────
function renderProduct() {
    const p = product;
    selectedColor = p.colors?.[0] || { name:"DEFAULT", hex: p.color };

    document.title = `ODCORRECT | ${p.name}`;

    set("bc-product-name", p.name);
    set("pd-cat",   `// ${p.cat.toUpperCase()}`);
    set("pd-id",    `CORE_ID: ${p.id}`);
    set("pd-name",  p.name);
    set("pd-price", p.price);
    set("pd-desc",  p.desc);

    if (p.badge === "sold") {
        const sl = document.getElementById("stock-label");
        if (sl) { sl.textContent = "SOLD OUT"; sl.classList.add("out-of-stock"); }
        const ab = document.getElementById("pd-add-btn");
        if (ab) { ab.disabled = true; ab.style.opacity = ".5"; ab.style.cursor = "not-allowed"; ab.querySelector("span").textContent = "SOLD OUT"; }
    }

    renderGallery();
    renderSwatches();
    renderSizes();
    updateWishlistBtn();
    renderRelated();
    animatePageIn();
}

function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ─── GALLERY ────────────────────────────────────────
function renderGallery() {
    const block  = document.getElementById("gallery-color-block");
    const label  = document.getElementById("gallery-block-label");
    const badges = document.getElementById("gallery-badges");
    if (block) block.style.background = selectedColor?.hex || product.color;
    if (label) label.textContent = CAT_LABELS[product.cat] || "OD";
    if (badges) badges.innerHTML = product.badge
        ? `<span class="gallery-badge ${product.badge}">${product.badge.toUpperCase()}</span>` : "";
    syncThumbs();
}

function syncThumbs() {
    ["thumb-0","thumb-1","thumb-2"].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.style.background = product.colors?.[i % product.colors.length]?.hex || product.color;
    });
}

document.addEventListener("click", e => {
    const thumb = e.target.closest(".thumb");
    if (!thumb || !product) return;
    const idx = parseInt(thumb.dataset.idx);
    document.querySelectorAll(".thumb").forEach((t,i) => t.classList.toggle("active", i===idx));
    const block = document.getElementById("gallery-color-block");
    if (block) {
        block.style.transition = "opacity .2s";
        block.style.opacity = "0";
        setTimeout(() => {
            block.style.background = product.colors?.[idx % product.colors.length]?.hex || product.color;
            block.style.opacity = "1";
        }, 200);
    }
});

// ─── SWATCHES ───────────────────────────────────────
function renderSwatches() {
    const wrap = document.getElementById("pd-swatches");
    const lbl  = document.getElementById("pd-selected-color");
    if (!wrap || !product.colors) return;
    wrap.innerHTML = product.colors.map((c,i) =>
        `<button class="pd-swatch ${i===0?"active":""}" style="background:${c.hex}" data-color="${c.name}" data-hex="${c.hex}" aria-label="${c.name}" title="${c.name}"></button>`
    ).join("");
    wrap.querySelectorAll(".pd-swatch").forEach(btn => {
        btn.addEventListener("click", () => {
            wrap.querySelectorAll(".pd-swatch").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedColor = { name: btn.dataset.color, hex: btn.dataset.hex };
            if (lbl) lbl.textContent = selectedColor.name;
            const block = document.getElementById("gallery-color-block");
            if (block) { block.style.transition = "background .4s"; block.style.background = selectedColor.hex; }
        });
    });
}

// ─── SIZES ──────────────────────────────────────────
function renderSizes() {
    document.querySelectorAll(".pd-size-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.size === selectedSize);
        btn.addEventListener("click", () => {
            document.querySelectorAll(".pd-size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedSize = btn.dataset.size;
            const el = document.getElementById("pd-selected-size");
            if (el) el.textContent = selectedSize;
        });
    });
}

// ─── SIZE GUIDE ─────────────────────────────────────
document.getElementById("size-guide-toggle")?.addEventListener("click", () => {
    sizeGuideOpen = !sizeGuideOpen;
    document.getElementById("size-guide-drawer")?.classList.toggle("open", sizeGuideOpen);
    const btn = document.getElementById("size-guide-toggle");
    if (btn) btn.textContent = sizeGuideOpen ? "SIZE GUIDE ↑" : "SIZE GUIDE ↘";
});

// ─── QTY ────────────────────────────────────────────
document.getElementById("pd-qty-minus")?.addEventListener("click", () => {
    if (pdQty > 1) { pdQty--; set("pd-qty-value", pdQty); }
});
document.getElementById("pd-qty-plus")?.addEventListener("click", () => {
    if (pdQty < 10) { pdQty++; set("pd-qty-value", pdQty); }
});

// ─── ADD TO BAG ─────────────────────────────────────
document.getElementById("pd-add-btn")?.addEventListener("click", () => {
    if (!product || product.badge === "sold") return;
    addToCart({ id:product.id, name:product.name, price:product.priceNum, color:selectedColor?.hex||product.color, cat:product.cat, size:selectedSize, colorName:selectedColor?.name||"DEFAULT" }, pdQty);
    showToast(product.name);
    // Flash button green
    const btn = document.getElementById("pd-add-btn");
    const span = btn?.querySelector("span");
    if (span) { span.textContent = "ADDED ✓"; btn.style.background = "var(--accent)"; }
    setTimeout(() => { if (span) { span.textContent = "ADD TO BAG"; if (btn) btn.style.background = ""; } }, 1800);
});

// ─── WISHLIST ────────────────────────────────────────
function updateWishlistBtn() {
    const icon = document.getElementById("wishlist-icon");
    if (!icon || !product) return;
    const isWished = wishlistItems.includes(product.id);
    icon.style.fill   = isWished ? "#ff453a" : "none";
    icon.style.stroke = isWished ? "#ff453a" : "currentColor";
}
document.getElementById("wishlist-btn")?.addEventListener("click", () => {
    if (!product) return;
    const idx = wishlistItems.indexOf(product.id);
    if (idx > -1) wishlistItems.splice(idx, 1); else wishlistItems.push(product.id);
    localStorage.setItem("odcorrect_wishlist", JSON.stringify(wishlistItems));
    updateWishlistBtn();
    const btn = document.getElementById("wishlist-btn");
    if (btn) { btn.style.transform = "scale(1.35)"; setTimeout(() => btn.style.transform = "", 250); }
});

// ─── ACCORDION ───────────────────────────────────────
document.querySelectorAll(".accordion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        const body   = document.getElementById(`acc-${target}`);
        const isOpen = body?.classList.contains("open");
        document.querySelectorAll(".accordion-body").forEach(b => b.classList.remove("open"));
        document.querySelectorAll(".accordion-btn").forEach(b => b.classList.remove("active"));
        if (!isOpen) { body?.classList.add("open"); btn.classList.add("active"); }
    });
});

// ─── RELATED ────────────────────────────────────────
function renderRelated() {
    const grid = document.getElementById("related-grid");
    if (!grid || !product) return;
    const related = allProducts
        .filter(r => r.cat === product.cat && r.id !== product.id)
        .slice(0, 4);
    if (related.length < 4) {
        allProducts.filter(r => r.id !== product.id && !related.find(x => x.id === r.id))
            .slice(0, 4 - related.length)
            .forEach(r => related.push(r));
    }
    grid.innerHTML = related.map(r => `
        <a class="related-card" href="product.html?id=${r.id}">
            <div class="related-img" style="background:${r.color}">
                <span class="related-img-label">${CAT_LABELS[r.cat]||"OD"}</span>
                ${r.badge ? `<span class="related-badge ${r.badge}">${r.badge.toUpperCase()}</span>` : ""}
            </div>
            <div class="related-info">
                <p class="related-cat">// ${r.cat.toUpperCase()}</p>
                <p class="related-name">${r.name}</p>
                <p class="related-price">${r.price}</p>
            </div>
        </a>`
    ).join("");
}

// ─── TOAST ───────────────────────────────────────────
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

// ─── PAGE-IN ANIMATIONS ──────────────────────────────
function animatePageIn() {
    const gallery = document.querySelector(".product-gallery");
    const info    = document.querySelector(".product-detail-info");
    if (gallery) {
        gallery.style.cssText = "opacity:0;transform:translateX(-30px);transition:opacity .7s .1s cubic-bezier(.2,1,.3,1),transform .7s .1s cubic-bezier(.2,1,.3,1)";
        setTimeout(() => { gallery.style.opacity = "1"; gallery.style.transform = "translateX(0)"; }, 60);
    }
    if (info) {
        [...info.querySelectorAll(":scope > *")].forEach((child, i) => {
            child.style.cssText = `opacity:0;transform:translateY(24px);transition:opacity .6s ${0.1+i*.07}s cubic-bezier(.2,1,.3,1),transform .6s ${0.1+i*.07}s cubic-bezier(.2,1,.3,1)`;
            setTimeout(() => { child.style.opacity = "1"; child.style.transform = "translateY(0)"; }, 60);
        });
    }
    setTimeout(() => {
        document.querySelectorAll(".related-card").forEach((card, i) => {
            card.style.cssText = `opacity:0;transform:translateY(20px);transition:opacity .5s ${i*.08}s ease,transform .5s ${i*.08}s ease`;
            setTimeout(() => { card.style.opacity="1"; card.style.transform="translateY(0)"; }, 60);
        });
    }, 400);
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

// ─── NAV SCROLL ──────────────────────────────────────
let lastScrollPD = 0;
window.addEventListener("scroll", () => {
    const nav = document.querySelector(".compact-nav");
    if (!nav) return;
    const cur = window.scrollY;
    if (cur <= 0) { nav.classList.remove("nav-hidden"); return; }
    if (cur > lastScrollPD && cur > 80) nav.classList.add("nav-hidden");
    else nav.classList.remove("nav-hidden");
    lastScrollPD = cur;
}, { passive: true });

// ─── INIT ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadProduct();
    initWinEffect();
    updateBagCount();
});