const PRODUCTS = [
    { id:"OC_MN_001", name:"RADHA OVERSIZED TEE", cat:"men", price:"₹1,299", badge:"new", icon:"👕", desc:"Heavyweight 450gsm oversized tee with architectural silhouette." },
    { id:"OC_WM_001", name:"RADHA CROP HOODIE", cat:"women", price:"₹1,899", badge:"new", icon:"🧥", desc:"Cropped hoodie with raw hem detailing and logo embroidery." },
    { id:"OC_MN_002", name:"CORE JOGGER SET", cat:"men", price:"₹2,499", badge:"", icon:"👖", desc:"Matching heavyweight joggers with engineering-grade stitching." },
    { id:"OC_WM_002", name:"REVERSE WEAVE HOODIE", cat:"women", price:"₹2,199", badge:"", icon:"🧥", desc:"Reverse weave construction for maximum shape retention." },
    { id:"OC_BB_001", name:"MINI RADHA TEE", cat:"baby", price:"₹699", badge:"new", icon:"👶", desc:"Soft 200gsm baby tee in RADHA collection colorways." },
    { id:"OC_BG_001", name:"BABY RADHA DRESS", cat:"baby", price:"₹799", badge:"new", icon:"🎀", desc:"Tiny dress with OD branding for the next generation." },
    { id:"OC_HF_001", name:"OD LOW RUNNER", cat:"footwear", price:"₹3,999", badge:"", icon:"👟", desc:"Low-profile runner with chunky outsole and OD tab." },
    { id:"OC_HF_002", name:"RADHA PLATFORM SLIDE", cat:"footwear", price:"₹1,699", badge:"sold", icon:"🥿", desc:"Platform slide in premium moulded rubber. Sold out." },
    { id:"OC_MN_003", name:"COACH JACKET", cat:"men", price:"₹3,499", badge:"", icon:"🧥", desc:"Satin-finish coach jacket with embroidered ODCORRECT badge." },
    { id:"OC_WM_003", name:"UTILITY CARGOS", cat:"women", price:"₹2,799", badge:"", icon:"👖", desc:"Six-pocket utility pants with tonal OD hardware." },
    { id:"OC_MN_004", name:"TECH FLEECE HALF-ZIP", cat:"men", price:"₹2,099", badge:"", icon:"🧣", desc:"Textured tech fleece for the engineering aesthetic." },
    { id:"OC_WM_004", name:"WIDE LEG SWEATS", cat:"women", price:"₹1,999", badge:"new", icon:"👖", desc:"Ultra wide leg with elasticated waistband and OD tape." }
];

let portalTimerInterval = null;
let bagCount = 0;
let eyesClosed = false;
let dizzyTimer = null;
let pwVisible = false;

const EYE_L = { cx:113, cy:130 };
const EYE_R = { cx:162, cy:130 };
const MAX_OFFSET = 6;

const character = document.querySelector(".boy-character") || document.getElementById("login-character");
const faceZone = character?.querySelector("#face-zone") || document.getElementById("face-zone");
const pupilL = character?.querySelector("#pupil-left") || document.getElementById("pupil-left");
const pupilR = character?.querySelector("#pupil-right") || document.getElementById("pupil-right");
const irisL = document.getElementById("iris-left");
const irisR = document.getElementById("iris-right");
const shineL = document.getElementById("shine-left");
const shineR = document.getElementById("shine-right");
const shine2L = document.getElementById("shine2-left");
const shine2R = document.getElementById("shine2-right");
const lidL = character?.querySelector("#lid-left") || document.getElementById("lid-left");
const lidR = character?.querySelector("#lid-right") || document.getElementById("lid-right");
const browL = character?.querySelector("#brow-left") || document.getElementById("brow-left");
const browR = character?.querySelector("#brow-right") || document.getElementById("brow-right");
const mouth = character?.querySelector("#char-mouth") || document.getElementById("char-mouth");
const bubble = document.getElementById("char-bubble");
const bubbleTxt = document.getElementById("char-bubble-text");
const pwInput = document.getElementById("login-password");
const emailInput = document.getElementById("login-email");

function initWindowsEffect() {
    document.querySelectorAll(".win-effect, .tile").forEach(el => {
        el.addEventListener("mousemove", event => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--x", `${event.clientX - r.left}px`);
            el.style.setProperty("--y", `${event.clientY - r.top}px`);
        });
    });
}

function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80) {
            el.classList.add("active");
        }
    });
}

function spawnIntroParticles() {
    const container = document.getElementById("intro-particles");
    if (!container) return;
    const colors = ["#00c96b", "#f5a623", "#e84393", "#00c96b"];
    for (let i = 0; i < 24; i++) {
        const p = document.createElement("div");
        const angle = (i / 24) * 360;
        const dist = 80 + Math.random() * 120;
        p.className = "intro-particle";
        p.style.cssText = `
            left:50%; top:50%;
            --tx:${Math.cos(angle * Math.PI / 180) * dist}px;
            --ty:${Math.sin(angle * Math.PI / 180) * dist}px;
            background:${colors[i % colors.length]};
            animation-delay:${0.8 + Math.random() * 0.5}s;
            animation-duration:${1.2 + Math.random() * 0.8}s;
        `;
        container.appendChild(p);
    }
}

function initPortalParticles() {
    const container = document.getElementById("portal-particles");
    if (!container) return;
    container.innerHTML = "";
    const colors = ["#f5a623", "#e84393", "#00c96b", "#00b4ff"];
    for (let i = 0; i < 54; i++) {
        const spark = document.createElement("div");
        const color = colors[Math.floor(Math.random() * colors.length)];
        const sparkType = i % 7 === 0 ? " ray" : i % 3 === 0 ? " hot" : "";
        spark.className = `portal-spark${sparkType}`;
        spark.style.cssText = `
            --start-deg:${Math.random() * 360}deg;
            --r:${48 + Math.random() * 84}px;
            --dur:${0.9 + Math.random() * 2.1}s;
            --delay:${Math.random() * 1.1}s;
            left:50%; top:50%;
            color:${color};
            background:${color};
            width:${1 + Math.random() * 2}px;
            height:${1 + Math.random() * 2}px;
            box-shadow:0 0 8px ${color};
        `;
        container.appendChild(spark);
    }
}

function openPortal(cat) {
    const overlay = document.getElementById("portal-overlay");
    const timer = document.getElementById("portal-timer");
    initPortalParticles();
    overlay?.classList.add("active");
    overlay?.classList.remove("portal-burst");
    requestAnimationFrame(() => overlay?.classList.add("portal-burst"));
    document.body.classList.add("no-scroll");

    let count = 2;
    if (timer) timer.textContent = count;
    clearInterval(portalTimerInterval);
    portalTimerInterval = setInterval(() => {
        count -= 1;
        if (timer) timer.textContent = count;
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

function renderProducts(filter) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
    grid.innerHTML = "";
    filtered.forEach((p, i) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.animationDelay = `${i * 0.06}s`;
        card.innerHTML = `
            <div class="product-img-wrap">
                <div class="product-img-placeholder">
                    <span class="p-icon">${p.icon}</span>
                    <span class="p-cat">${p.cat.toUpperCase()}</span>
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
}

function initFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => filterCategory(btn.dataset.cat));
    });
}

function filterCategory(cat) {
    const catMap = {
        "men":"men",
        "women":"women",
        "baby-boy":"baby",
        "baby-girl":"baby",
        "her-footwear":"footwear",
        "his-footwear":"footwear",
        "all":"all"
    };
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

function openPanel(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    document.getElementById("overlay-spec").textContent = `CORE_ID: ${product.id}`;
    document.getElementById("overlay-title").textContent = product.name;
    document.getElementById("overlay-price").textContent = product.price;
    document.getElementById("overlay-desc").textContent = product.desc;

    const imgEl = document.getElementById("overlay-img");
    if (imgEl) {
        imgEl.style.display = "none";
        const wrap = imgEl.parentElement;
        let placeholder = wrap.querySelector(".panel-image-placeholder");
        if (!placeholder) {
            placeholder = document.createElement("div");
            placeholder.className = "panel-image-placeholder";
            wrap.appendChild(placeholder);
        }
        placeholder.innerHTML = `<span class="pi-icon">${product.icon}</span><span class="pi-label">${product.cat.toUpperCase()}</span>`;
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

function openLogin() {
    document.getElementById("login-modal")?.classList.add("active");
    document.getElementById("login-backdrop")?.classList.add("active");
    document.body.classList.add("no-scroll");
    setMouseMood("happy");
    setBubble("Hey! Welcome back");
}

function closeLogin() {
    document.getElementById("login-modal")?.classList.remove("active");
    document.getElementById("login-backdrop")?.classList.remove("active");
    document.body.classList.remove("no-scroll");
    setMouseMood("happy");
}

function setMouseMood(mood) {
    if (!character) return;
    character.classList.remove("mouse-happy", "mouse-shy", "mouse-dizzy");
    character.classList.add(`mouse-${mood}`);
    if (mood === "shy") {
        eyesClose();
        setMouth("shy");
        setBrows("shy");
    } else {
        eyesOpen();
        setMouth("happy");
        setBrows("happy");
    }
}

function triggerDizzy() {
    setMouseMood("dizzy");
    setBubble("Whoa... system spinning");
    clearTimeout(dizzyTimer);
    dizzyTimer = setTimeout(() => {
        if (document.activeElement === pwInput && !pwVisible) {
            setMouseMood("shy");
            setBubble("Not peeking. Promise.");
        } else {
            setMouseMood("happy");
            setBubble("Okay, I'm back online");
        }
    }, 1400);
}

function movePupils(event) {
    if (eyesClosed || !character || character.classList.contains("mouse-dizzy")) return;
    const rect = character.getBoundingClientRect();
    const charCx = rect.left + rect.width * .5;
    const charCy = rect.top + rect.height * .44;
    const dx = event.clientX - charCx;
    const dy = event.clientY - charCy;
    const dist = Math.hypot(dx, dy) || 1;
    const norm = Math.min(dist, 190) / 190;
    const ox = (dx / dist) * norm * MAX_OFFSET;
    const oy = (dy / dist) * norm * MAX_OFFSET;
    setEye(pupilL, irisL, shineL, shine2L, EYE_L, ox, oy);
    setEye(pupilR, irisR, shineR, shine2R, EYE_R, ox, oy);
}

function setEye(pupil, iris, shine, shine2, base, ox, oy) {
    if (!pupil) return;
    if (pupil instanceof HTMLElement) {
        pupil.style.transform = `translate(${ox}px, ${oy}px)`;
        return;
    }
    const nx = base.cx + ox;
    const ny = base.cy + oy;
    pupil.setAttribute("cx", nx);
    pupil.setAttribute("cy", ny);
    iris?.setAttribute("cx", nx);
    iris?.setAttribute("cy", ny);
    shine?.setAttribute("cx", nx + 4);
    shine?.setAttribute("cy", ny - 4);
    shine2?.setAttribute("cx", nx - 4);
    shine2?.setAttribute("cy", ny + 5);
}

function eyesOpen() {
    eyesClosed = false;
    character?.style.setProperty("--lid-scale", "0");
    animateLid(lidL, 113, 110, 3);
    animateLid(lidR, 162, 110, 3);
}

function eyesClose() {
    eyesClosed = true;
    setEye(pupilL, irisL, shineL, shine2L, EYE_L, 0, 0);
    setEye(pupilR, irisR, shineR, shine2R, EYE_R, 0, 0);
    character?.style.setProperty("--lid-scale", "1");
    animateLid(lidL, 113, 130, 23);
    animateLid(lidR, 162, 130, 23);
}

function animateLid(el, cx, targetCy, targetRy) {
    if (!el) return;
    if (el instanceof HTMLElement) return;
    const startCy = parseFloat(el.getAttribute("cy")) || 111;
    const startRy = parseFloat(el.getAttribute("ry")) || 3;
    const start = performance.now();
    const dur = 230;
    function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        el.setAttribute("cy", startCy + (targetCy - startCy) * ease);
        el.setAttribute("ry", startRy + (targetRy - startRy) * ease);
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function setBrows(mood) {
    if (browL instanceof HTMLElement || browR instanceof HTMLElement) {
        if (mood === "shy") {
            if (browL) browL.style.transform = "translateY(-5px) rotate(-4deg)";
            if (browR) browR.style.transform = "translateY(-5px) rotate(4deg)";
        } else if (mood === "dizzy") {
            if (browL) browL.style.transform = "translateY(6px) rotate(13deg)";
            if (browR) browR.style.transform = "translateY(6px) rotate(-13deg)";
        } else {
            if (browL) browL.style.transform = "rotate(-12deg)";
            if (browR) browR.style.transform = "rotate(12deg)";
        }
        return;
    }
}

function setMouth(mood) {
    if (!mouth) return;
    if (mouth instanceof HTMLElement) {
        mouth.style.height = mood === "dizzy" ? "7px" : mood === "shy" ? "4px" : "10px";
        mouth.style.transform = mood === "dizzy" ? "rotate(180deg)" : "none";
        return;
    }
}

function setBubble(text) {
    if (!bubble || !bubbleTxt) return;
    bubble.style.opacity = "0";
    bubble.style.transform = "scale(.9) translateY(6px)";
    setTimeout(() => {
        bubbleTxt.textContent = text;
        bubble.style.opacity = "1";
        bubble.style.transform = "scale(1) translateY(0)";
    }, 160);
}

function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

window.openPortal = openPortal;
window.openPanel = openPanel;

document.addEventListener("DOMContentLoaded", () => {
    const intro = document.getElementById("intro-overlay");
    document.body.classList.add("no-scroll");
    initWindowsEffect();
    spawnIntroParticles();
    initPortalParticles();
    renderProducts("all");
    initFilters();

    setTimeout(() => {
        intro?.classList.add("intro-hidden");
        document.body.classList.remove("no-scroll");
        setTimeout(reveal, 200);
    }, 2800);
});

window.addEventListener("scroll", reveal, { passive:true });
window.addEventListener("scroll", () => {
    const nav = document.querySelector(".compact-nav");
    if (!nav) return;
    nav.style.boxShadow = window.scrollY > 40
        ? "0 8px 40px rgba(0,0,0,.13), 0 1px 0 rgba(255,255,255,.9) inset"
        : "0 4px 24px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.9) inset";
}, { passive:true });

document.addEventListener("mousemove", event => {
    const bg = document.querySelector(".hero-bg");
    if (bg) {
        const x = event.clientX / window.innerWidth * 100;
        const y = event.clientY / window.innerHeight * 100;
        bg.style.background = `radial-gradient(ellipse 80% 60% at ${x}% ${y}%, rgba(0,201,107,.09) 0%, transparent 70%)`;
    }
    movePupils(event);
});

document.getElementById("portal-close")?.addEventListener("click", closePortal);
document.getElementById("portal-overlay")?.addEventListener("click", event => {
    if (event.target.id === "portal-overlay") closePortal();
});

document.getElementById("open-login")?.addEventListener("click", openLogin);
document.getElementById("login-close")?.addEventListener("click", closeLogin);
document.getElementById("login-backdrop")?.addEventListener("click", closeLogin);

pwInput?.addEventListener("focus", () => {
    if (!pwVisible) {
        setMouseMood("shy");
        setBubble("I won't look.");
    }
});
pwInput?.addEventListener("blur", () => {
    if (!pwVisible) {
        setMouseMood("happy");
        setBubble("All good.");
    }
});
emailInput?.addEventListener("focus", () => {
    setMouseMood("happy");
    setBubble("Type your email.");
});
emailInput?.addEventListener("blur", () => setBubble("Now the secret part."));

document.getElementById("pw-toggle")?.addEventListener("click", () => {
    const icon = document.getElementById("pw-eye-icon");
    pwVisible = !pwVisible;
    if (pwInput) pwInput.type = pwVisible ? "text" : "password";
    if (icon) {
        icon.innerHTML = pwVisible
            ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
            : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
    if (pwVisible) {
        setMouseMood("happy");
        setBubble("Password visible.");
    } else {
        setMouseMood("shy");
        setBubble("Covered again.");
    }
});

document.getElementById("login-submit")?.addEventListener("click", () => {
    const email = emailInput?.value;
    const pass = pwInput?.value;
    if (!email || !pass) {
        setMouseMood("happy");
        setBubble("Fill both fields first");
        setTimeout(() => setMouseMood("happy"), 1000);
        return;
    }
    setMouseMood("happy");
    setBubble("Authenticating...");
    setTimeout(() => {
        setBubble("Access granted. Welcome.");
        setTimeout(closeLogin, 1200);
    }, 900);
});

document.getElementById("close-panel")?.addEventListener("click", closePanel);
document.getElementById("panel-backdrop")?.addEventListener("click", closePanel);
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closePanel();
        closePortal();
        closeLogin();
    }
});

document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

document.querySelector(".add-bag-btn")?.addEventListener("click", () => {
    const bagCountEl = document.querySelector(".bag-count");
    bagCount += 1;
    if (bagCountEl) {
        bagCountEl.textContent = bagCount;
        bagCountEl.style.transform = "scale(1.6)";
        setTimeout(() => {
            bagCountEl.style.transform = "scale(1)";
        }, 220);
    }
    closePanel();
});

const accessForm = document.getElementById("access-form");
const nlDot = document.getElementById("nl-dot");
const nlStatus = document.getElementById("nl-status");
const nlSuccess = document.getElementById("nl-success");
const nlEmail = document.getElementById("nl-email");

nlEmail?.addEventListener("input", () => {
    if (isValidEmail(nlEmail.value)) {
        if (nlDot) nlDot.className = "nl-status-dot online";
        if (nlStatus) {
            nlStatus.textContent = "STATUS: SIGNAL_DETECTED // READY";
            nlStatus.classList.add("online-text");
        }
    } else {
        if (nlDot) nlDot.className = "nl-status-dot offline";
        if (nlStatus) {
            nlStatus.textContent = "STATUS: SYSTEM_OFFLINE";
            nlStatus.classList.remove("online-text");
        }
    }
});

accessForm?.addEventListener("submit", event => {
    event.preventDefault();
    if (!isValidEmail(nlEmail.value)) return;
    accessForm.style.transition = "opacity .4s, transform .4s";
    accessForm.style.opacity = "0";
    accessForm.style.transform = "translateY(10px)";
    setTimeout(() => {
        accessForm.style.display = "none";
        if (nlDot) nlDot.className = "nl-status-dot online";
        if (nlStatus) {
            nlStatus.textContent = "STATUS: SYSTEM_ONLINE // ACCESS_GRANTED";
            nlStatus.classList.add("online-text");
        }
        nlSuccess?.classList.add("show");
    }, 420);
});
