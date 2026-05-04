// ══════════════════════════════════════════════
//  ODCORRECT MASTER ENGINE  v4 (Updated)
//  [Optimized for Spline Robot Integration]
// ══════════════════════════════════════════════

// ─── PRODUCT DATA ─────────────────────────────
let PRODUCTS = [
    { id:"OC_MN_001", name:"OVERSIZED TEE",    cat:"men",      price:"₹1,299", badge:"new",  color:"#1d1d1f", desc:"Heavyweight 450gsm oversized tee with architectural silhouette." },
    { id:"OC_WM_001", name:"CROP HOODIE",      cat:"women",    price:"₹1,899", badge:"new",  color:"#2d2d3a", desc:"Cropped hoodie with raw hem detailing and logo embroidery." },
    { id:"OC_MN_002", name:"CORE JOGGER SET",         cat:"men",      price:"₹2,499", badge:"",     color:"#3a3a3a", desc:"Matching heavyweight joggers with engineering-grade stitching." },
    { id:"OC_WM_002", name:"REVERSE WEAVE HOODIE",   cat:"women",    price:"₹2,199", badge:"",     color:"#2a3520", desc:"Reverse weave construction for maximum shape retention." },
    { id:"OC_BB_001", name:"MINI TEE",          cat:"baby",     price:"₹699",   badge:"new",  color:"#1d3a2a", desc:"Soft 200gsm baby tee in RADHA collection colorways." },
    { id:"OC_BG_001", name:"BABY DRESS",        cat:"baby",     price:"₹799",   badge:"new",  color:"#3a1d2a", desc:"Tiny dress with OD branding for the next generation." },
    { id:"OC_HF_001", name:"OD LOW RUNNER",           cat:"footwear", price:"₹3,999", badge:"",     color:"#1d2a3a", desc:"Low-profile runner with chunky outsole and OD tab." },
    { id:"OC_HF_002", name:"PLATFORM SLIDE",   cat:"footwear", price:"₹1,699", badge:"sold", color:"#2a1d1d", desc:"Platform slide in premium moulded rubber. Sold out." },
    { id:"OC_MN_003", name:"COACH JACKET",            cat:"men",      price:"₹3,499", badge:"",     color:"#1a1a2a", desc:"Satin-finish coach jacket with embroidered ODCORRECT badge." },
    { id:"OC_WM_003", name:"UTILITY CARGOS",          cat:"women",    price:"₹2,799", badge:"",     color:"#2a2a1a", desc:"Six-pocket utility pants with tonal OD hardware." },
    { id:"OC_MN_004", name:"TECH FLEECE HALF-ZIP",   cat:"men",      price:"₹2,099", badge:"",     color:"#1a2a2a", desc:"Textured tech fleece for the engineering aesthetic." },
    { id:"OC_WM_004", name:"WIDE LEG SWEATS",         cat:"women",    price:"₹1,999", badge:"new",  color:"#2a1a2a", desc:"Ultra wide leg with elasticated waistband and OD tape." }
];

// Category initials for geometric placeholders
const CAT_LABELS = { men:"M", women:"W", baby:"B", footwear:"F" };

function formatPriceDisplay(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function normalizeApiProduct(p) {
    const priceNum = Number(p.priceNum ?? p.price ?? 0);
    return {
        ...p,
        cat: p.cat || p.category || "men",
        price: typeof p.price === "string" ? p.price : formatPriceDisplay(priceNum),
        color: p.color || "#1d1d1f",
        desc: p.desc || p.description || ""
    };
}

async function loadHomeProductsFromApi() {
    try {
        const response = await fetch("/api/products");
        if (!response.ok) return;

        const result = await response.json();
        if (result.success && Array.isArray(result.products)) {
            PRODUCTS = result.products.map(normalizeApiProduct);
        }
    } catch {
        // Keep bundled product data as fallback.
    }
}

let portalTimerInterval = null;
let bagCount = 0;
let pwVisible = false;
let bubbleTimer = null;

// ─── DOM REFS ─────────────────────────────────
const bubble     = document.getElementById("char-bubble");
const bubbleTxt  = document.getElementById("char-bubble-text");
const pwInput    = document.getElementById("login-password");
const emailInput = document.getElementById("login-email");
const AUTH_KEY   = "odcorrect_user";

// ─── 1. WIN LIGHT EFFECT ──────────────────────
function initWindowsEffect() {
    document.querySelectorAll(".win-effect, .tile").forEach(el => {
        el.addEventListener("mousemove", e => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--x", `${e.clientX - r.left}px`);
            el.style.setProperty("--y", `${e.clientY - r.top}px`);
        });
    });
}

// ─── 2. SCROLL REVEAL ────────────────────────
function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80)
            el.classList.add("active");
    });
}
window.addEventListener("scroll", reveal, { passive:true });

// ─── 3. HERO BG TRACKING ─────────────────────
document.addEventListener("mousemove", e => {
    const bg = document.querySelector(".hero-bg");
    if (bg) {
        const x = (e.clientX / window.innerWidth)  * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        bg.style.background = `radial-gradient(ellipse 80% 60% at ${x}% ${y}%, rgba(0,201,107,.09) 0%, transparent 70%)`;
    }
});

// ─── 4. CINEMATIC INTRO ──────────────────────
function spawnIntroParticles() {
    const c = document.getElementById("intro-particles");
    if (!c) return;
    const colors = ["#00c96b","#f5a623","#e84393","#00c96b"];
    for (let i = 0; i < 24; i++) {
        const p = document.createElement("div");
        const angle = (i / 24) * 360;
        const dist  = 80 + Math.random() * 120;
        p.className = "intro-particle";
        p.style.cssText = `
            left:50%; top:50%;
            --tx:${Math.cos(angle * Math.PI / 180) * dist}px;
            --ty:${Math.sin(angle * Math.PI / 180) * dist}px;
            background:${colors[i % colors.length]};
            animation-delay:${0.8 + Math.random() * 0.5}s;
            animation-duration:${1.2 + Math.random() * 0.8}s;
        `;
        c.appendChild(p);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    const intro = document.getElementById("intro-overlay");
    document.body.classList.add("no-scroll");
    document.querySelectorAll(".reveal-up").forEach(el => {
        el.style.animationPlayState = "paused";
    });

    initWindowsEffect();
    spawnIntroParticles();
    initPortalParticles();
    await loadHomeProductsFromApi();
    renderProducts("all");
    initFilters();
    updateAuthNav();
    syncAuthFromServer();

    setTimeout(() => {
        intro?.classList.add("intro-hidden");
        document.body.classList.remove("no-scroll");
        document.querySelectorAll(".reveal-up").forEach(el => {
            el.style.animationPlayState = "running";
        });
        setTimeout(reveal, 200);
    }, 3800);
});

// ─── 5. NAV BEHAVIOR ─────────────────────────
let lastScroll = 0;

window.addEventListener("scroll", () => {
    const nav = document.querySelector(".compact-nav");
    if (!nav) return;

    const currentScroll = window.scrollY;

    nav.style.boxShadow = currentScroll > 40
        ? "0 8px 40px rgba(0,0,0,.13), 0 1px 0 rgba(255,255,255,.9) inset"
        : "0 4px 24px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.9) inset";

    if (currentScroll <= 0) {
        nav.classList.remove("nav-hidden");
        return;
    }

    if (currentScroll > lastScroll && currentScroll > 80) {
        nav.classList.add("nav-hidden");
    } else {
        nav.classList.remove("nav-hidden");
    }

    lastScroll = currentScroll;
}, { passive: true });

// ─── 6. PORTAL ──────────────────────────────
function initPortalParticles() {
    const c = document.getElementById("portal-particles");
    if (!c) return;
    c.innerHTML = "";
    const colors = ["#f5a623","#e84393","#00c96b","#00b4ff"];
    for (let i = 0; i < 54; i++) {
        const spark = document.createElement("div");
        const color = colors[Math.floor(Math.random() * colors.length)];
        const type  = i % 7 === 0 ? " ray" : i % 3 === 0 ? " hot" : "";
        spark.className = `portal-spark${type}`;
        spark.style.cssText = `
            --start-deg:${Math.random() * 360}deg;
            --r:${48 + Math.random() * 84}px;
            --dur:${0.9 + Math.random() * 2.1}s;
            --delay:${Math.random() * 1.1}s;
            left:50%; top:50%;
            color:${color}; background:${color};
            width:${1 + Math.random() * 2}px; height:${1 + Math.random() * 2}px;
            box-shadow:0 0 8px ${color};
        `;
        c.appendChild(spark);
    }
}

function openPortal(cat) {
    const overlay = document.getElementById("portal-overlay");
    const timerEl = document.getElementById("portal-timer");
    const arc     = document.getElementById("countdown-arc");
    initPortalParticles();
    overlay?.classList.add("active");
    overlay?.classList.remove("portal-burst");
    requestAnimationFrame(() => overlay?.classList.add("portal-burst"));
    document.body.classList.add("no-scroll");

    const total = 3;
    let count = total;
    const circumference = 2 * Math.PI * 42;
    if (timerEl) timerEl.textContent = count;
    if (arc) {
        arc.style.transition = "none";
        arc.style.strokeDashoffset = 0;
        arc.getBoundingClientRect();
        arc.style.transition = `stroke-dashoffset ${total}s linear`;
        arc.style.strokeDashoffset = circumference;
    }

    clearInterval(portalTimerInterval);
    portalTimerInterval = setInterval(() => {
        count -= 1;
        if (timerEl) timerEl.textContent = Math.max(count, 0);
        if (count <= 0) {
            closePortal();
            filterCategory(cat);
            setTimeout(() => document.getElementById("collection")?.scrollIntoView({ behavior:"smooth" }), 200);
        }
    }, 1000);
}

function closePortal() {
    clearInterval(portalTimerInterval);
    document.getElementById("portal-overlay")?.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

document.getElementById("portal-close")?.addEventListener("click", closePortal);
document.getElementById("portal-overlay")?.addEventListener("click", e => {
    if (e.target.id === "portal-overlay") closePortal();
});
window.openPortal = openPortal;

// ─── 7. PRODUCT RENDER ───────────────────────
function renderProducts(filter) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    const list = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
    grid.innerHTML = "";
    list.forEach((p, i) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.animationDelay = `${i * 0.055}s`;
        card.innerHTML = `
            <div class="product-img-wrap">
                <div class="product-img-block" style="background:${p.color}">
                    ${CAT_LABELS[p.cat] || "OD"}
                </div>
                ${p.badge ? `<div class="product-badge ${p.badge}">${p.badge.toUpperCase()}</div>` : ""}
            </div>
            <div class="product-info">
                <p class="product-cat">// ${p.cat.toUpperCase()}</p>
                <p class="product-name">${p.name}</p>
                <p class="product-desc-short">${p.desc}</p>
                <div class="product-row">
                    <span class="product-price">${p.price}</span>
                    <button class="product-view-btn" onclick="openPanel('${p.id}')">VIEW ↗</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    initWindowsEffect();
}

// ─── 8. FILTER ───────────────────────────────
function initFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => filterCategory(btn.dataset.cat));
    });
}

function filterCategory(cat) {
    const catMap = { "men":"men","women":"women","baby-boy":"baby","baby-girl":"baby","her-footwear":"footwear","his-footwear":"footwear","all":"all" };
    const filterCat = catMap[cat] || cat;
    const grid = document.getElementById("product-grid");
    if (grid) {
        grid.style.opacity = "0";
        grid.style.transform = "translateY(16px)";
        grid.style.transition = "opacity .25s, transform .25s";
        setTimeout(() => {
            renderProducts(filterCat);
            grid.style.opacity = "1";
            grid.style.transform = "translateY(0)";
        }, 260);
    }
    document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.cat === filterCat);
    });
}
window.filterCategory = filterCategory;

// ─── 9. SIDE PANEL ───────────────────────────
function openPanel(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    document.getElementById("overlay-spec").textContent  = `CORE_ID: ${product.id}`;
    document.getElementById("overlay-title").textContent = product.name;
    document.getElementById("overlay-price").textContent = product.price;
    document.getElementById("overlay-desc").textContent  = product.desc;

    const imgEl = document.getElementById("overlay-img");
    if (imgEl) {
        imgEl.style.display = "none";
        const wrap = imgEl.parentElement;
        let ph = wrap.querySelector(".panel-image-placeholder");
        if (!ph) { ph = document.createElement("div"); ph.className = "panel-image-placeholder"; wrap.appendChild(ph); }
        ph.innerHTML = `
            <div class="pi-block" style="background:${product.color}">${CAT_LABELS[product.cat]}</div>
            <span class="pi-label">${product.cat.toUpperCase()}</span>
        `;
    }
    document.getElementById("product-overlay")?.classList.add("active");
    document.getElementById("panel-backdrop")?.classList.add("active");
    document.body.classList.add("no-scroll");
}
function closePanel() {
    document.getElementById("product-overlay")?.classList.remove("active");
    document.getElementById("panel-backdrop")?.classList.remove("active");
    document.body.classList.remove("no-scroll");
}
document.getElementById("close-panel")?.addEventListener("click", closePanel);
document.getElementById("panel-backdrop")?.addEventListener("click", closePanel);
window.openPanel = openPanel;

document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});
document.querySelector(".add-bag-btn")?.addEventListener("click", () => {
    const el = document.querySelector(".bag-count");
    bagCount++;
    if (el) { el.textContent = bagCount; el.style.transform = "scale(1.6)"; setTimeout(() => el.style.transform = "scale(1)", 220); }
    closePanel();
});

// ──��� 10. LOGIN ──────────────────────────────
function openLogin() {
    if (getAuthUser()) return;
    document.getElementById("login-modal")?.classList.add("active");
    document.getElementById("login-backdrop")?.classList.add("active");
    document.body.classList.add("no-scroll");
    showBubble("Hey! Welcome back 👋");
}
function closeLogin() {
    document.getElementById("login-modal")?.classList.remove("active");
    document.getElementById("login-backdrop")?.classList.remove("active");
    document.body.classList.remove("no-scroll");
}
document.getElementById("open-login")?.addEventListener("click", openLogin);
document.getElementById("login-close")?.addEventListener("click", closeLogin);
document.getElementById("login-backdrop")?.addEventListener("click", closeLogin);

document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closePanel(); closePortal(); closeLogin(); }
});

function getAuthUser() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_KEY));
    } catch {
        return null;
    }
}

function saveAuthUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    updateAuthNav();
}

function clearAuthUser() {
    localStorage.removeItem(AUTH_KEY);
    updateAuthNav();
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

function getDisplayName(email) {
    const base = (email || "Admin").split("@")[0].replace(/[^a-z0-9]+/gi, " ").trim();
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Admin";
}

function updateAuthNav() {
    const user = getAuthUser();
    document.querySelectorAll(".login-trigger").forEach(trigger => {
        if (!user) {
            trigger.classList.remove("logged-in");
            trigger.textContent = "LOGIN";
            trigger.removeAttribute("title");
            return;
        }

        trigger.classList.add("logged-in");
        trigger.textContent = `HI ${user.name.toUpperCase()}`;
        trigger.title = user.email || "";
    });
}

// ─── 11. SPEECH BUBBLE ──────────────────────
function showBubble(text, delay = 0) {
    if (!bubble || !bubbleTxt) return;
    clearTimeout(bubbleTimer);

    bubble.style.opacity = "0";
    bubble.style.transform = "scale(.92) translateY(5px)";

    bubbleTimer = setTimeout(() => {
        bubbleTxt.textContent = text;
        bubbleTxt.style.display = "inline";
        bubble.style.opacity = "1";
        bubble.style.transform = "scale(1) translateY(0)";
        bubble.style.transition = "opacity .25s, transform .25s";
    }, delay + 160);
}

// ─── 12. INPUT INTERACTIONS ─────────────────
pwInput?.addEventListener("focus", () => {
    showBubble("I won't look. 🙈");
});
pwInput?.addEventListener("blur", () => {
    showBubble("All good! 👍");
});
emailInput?.addEventListener("focus", () => {
    showBubble("Enter your email ✉️");
});
emailInput?.addEventListener("blur", () => showBubble("Now the secret part... 🔐"));

document.getElementById("pw-toggle")?.addEventListener("click", () => {
    const icon = document.getElementById("pw-eye-icon");
    const toggle = document.getElementById("pw-toggle");
    pwVisible = !pwVisible;
    if (pwInput) pwInput.type = pwVisible ? "text" : "password";
    toggle?.setAttribute("aria-label", pwVisible ? "Hide password" : "Show password");
    if (icon) {
        icon.innerHTML = pwVisible
            ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
            : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
    if (pwVisible) { showBubble("I can see it now 👀"); }
    else           { showBubble("Back to not looking 🙈"); }
});

// ─── 13. NEWSLETTER ────────────────────────
const accessForm = document.getElementById("access-form");
const nlDot      = document.getElementById("nl-dot");
const nlStatus   = document.getElementById("nl-status");
const nlSuccess  = document.getElementById("nl-success");
const nlEmail    = document.getElementById("nl-email");

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

nlEmail?.addEventListener("input", () => {
    if (isValidEmail(nlEmail.value)) {
        if (nlDot)    nlDot.className = "nl-status-dot online";
        if (nlStatus) { nlStatus.textContent = "STATUS: SIGNAL_DETECTED // READY"; nlStatus.classList.add("online-text"); }
    } else {
        if (nlDot)    nlDot.className = "nl-status-dot offline";
        if (nlStatus) { nlStatus.textContent = "STATUS: SYSTEM_OFFLINE"; nlStatus.classList.remove("online-text"); }
    }
});

accessForm?.addEventListener("submit", e => {
    e.preventDefault();
    if (!isValidEmail(nlEmail.value)) return;
    accessForm.style.transition = "opacity .4s, transform .4s";
    accessForm.style.opacity = "0";
    accessForm.style.transform = "translateY(10px)";
    setTimeout(() => {
        accessForm.style.display = "none";
        if (nlDot)    nlDot.className = "nl-status-dot online";
        if (nlStatus) { nlStatus.textContent = "STATUS: SYSTEM_ONLINE // ACCESS_GRANTED"; nlStatus.classList.add("online-text"); }
        nlSuccess?.classList.add("show");
    }, 420);
});
// --- ODCORRECT LOGIN INTEGRATION ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevents the page from refreshing

        // 1. Grab data from the form fields
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // 2. Visual feedback for the user
        const bubbleText = document.getElementById('char-bubble-text');
        if (bubbleText) bubbleText.innerText = "Verifying identity...";

        try {
            // 3. Send the POST request to your server.js
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                // 4. Success! Redirect to the shop
                const user = result.user || {
                    name: getDisplayName(email),
                    email
                };
                saveAuthUser(user);
                if (bubbleText) bubbleText.innerText = "Access Granted. Welcome.";
                setTimeout(() => {
                    window.location.href = '/shop'; // Redirects using your server routes
                }, 1000);
            } else {
                // 5. Failure! Alert the user
                if (bubbleText) bubbleText.innerText = "System Reject: Invalid Credentials";
                alert(result.message || "Authentication Failed");
            }
        } catch (error) {
            console.error('System Error:', error);
            if (bubbleText) bubbleText.innerText = "Connection lost to server...";
        }
    });
}
