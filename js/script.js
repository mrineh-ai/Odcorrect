// ══════════════════════════════════════════════
//  ODCORRECT MASTER ENGINE  v3
// ══════════════════════════════════════════════

// ─── PRODUCT DATA ────────────────────────────
const PRODUCTS = [
    { id:'OC_MN_001', name:'RADHA OVERSIZED TEE', cat:'men', price:'₹1,299', badge:'new', icon:'👕', desc:'Heavyweight 450gsm oversized tee with architectural silhouette.' },
    { id:'OC_WM_001', name:'RADHA CROP HOODIE', cat:'women', price:'₹1,899', badge:'new', icon:'🧥', desc:'Cropped hoodie with raw hem detailing and logo embroidery.' },
    { id:'OC_MN_002', name:'CORE JOGGER SET', cat:'men', price:'₹2,499', badge:'', icon:'👖', desc:'Matching heavyweight joggers with engineering-grade stitching.' },
    { id:'OC_WM_002', name:'REVERSE WEAVE HOODIE', cat:'women', price:'₹2,199', badge:'', icon:'🧥', desc:'Reverse weave construction for maximum shape retention.' },
    { id:'OC_BB_001', name:'MINI RADHA TEE', cat:'baby', price:'₹699', badge:'new', icon:'👶', desc:'Soft 200gsm baby tee in RADHA collection colorways.' },
    { id:'OC_BG_001', name:'BABY RADHA DRESS', cat:'baby', price:'₹799', badge:'new', icon:'🎀', desc:'Tiny dress with OD branding for the next generation.' },
    { id:'OC_HF_001', name:'OD LOW RUNNER', cat:'footwear', price:'₹3,999', badge:'', icon:'👟', desc:'Low-profile runner with chunky outsole and OD tab.' },
    { id:'OC_HF_002', name:'RADHA PLATFORM SLIDE', cat:'footwear', price:'₹1,699', badge:'sold', icon:'🥿', desc:'Platform slide in premium moulded rubber. Sold out.' },
    { id:'OC_MN_003', name:'COACH JACKET', cat:'men', price:'₹3,499', badge:'', icon:'🧥', desc:'Satin-finish coach jacket with embroidered ODCORRECT badge.' },
    { id:'OC_WM_003', name:'UTILITY CARGOS', cat:'women', price:'₹2,799', badge:'', icon:'👖', desc:'Six-pocket utility pants with tonal OD hardware.' },
    { id:'OC_MN_004', name:'TECH FLEECE HALF-ZIP', cat:'men', price:'₹2,099', badge:'', icon:'🧣', desc:'Textured tech fleece for the engineering aesthetic.' },
    { id:'OC_WM_004', name:'WIDE LEG SWEATS', cat:'women', price:'₹1,999', badge:'new', icon:'👖', desc:'Ultra wide leg with elasticated waistband and OD tape.' },
];

let currentFilter = 'all';

// ─── 1. WIN LIGHT TRACKING ───────────────────
function initWindowsEffect() {
    document.querySelectorAll('.win-effect, .tile').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--x', `${e.clientX - r.left}px`);
            el.style.setProperty('--y', `${e.clientY - r.top}px`);
        });
    });
}

// ─── 2. SCROLL REVEAL ────────────────────────
function reveal() {
    document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80)
            el.classList.add('active');
    });
}
window.addEventListener('scroll', reveal, { passive: true });

// ─── 3. HERO BG MOUSE TRACKING ───────────────
document.addEventListener('mousemove', e => {
    const bg = document.querySelector('.hero-bg');
    if (bg) {
        const x = (e.clientX / window.innerWidth)  * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        bg.style.background =
            `radial-gradient(ellipse 80% 60% at ${x}% ${y}%, rgba(0,201,107,.09) 0%, transparent 70%)`;
    }
});

// ─── 4. CINEMATIC INTRO ──────────────────────
function spawnIntroParticles() {
    const container = document.getElementById('intro-particles');
    if (!container) return;
    const colors = ['#00c96b', '#f5a623', '#e84393', '#00c96b'];
    for (let i = 0; i < 24; i++) {
        const p = document.createElement('div');
        p.className = 'intro-particle';
        const angle = (i / 24) * 360;
        const dist = 80 + Math.random() * 120;
        const tx = Math.cos(angle * Math.PI / 180) * dist + 'px';
        const ty = Math.sin(angle * Math.PI / 180) * dist + 'px';
        p.style.cssText = `
            left: 50%; top: 50%;
            --tx: ${tx}; --ty: ${ty};
            background: ${colors[i % colors.length]};
            animation-delay: ${0.8 + Math.random() * 0.5}s;
            animation-duration: ${1.2 + Math.random() * 0.8}s;
        `;
        container.appendChild(p);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro-overlay');
    document.body.classList.add('no-scroll');
    initWindowsEffect();
    spawnIntroParticles();
    renderProducts('all');
    initFilters();
    initPortalParticles();

    setTimeout(() => {
        if (intro) {
            intro.classList.add('intro-hidden');
            document.body.classList.remove('no-scroll');
            setTimeout(reveal, 200);
        }
    }, 4500);
});

// ─── 5. NAV SCROLL SHADOW ────────────────────
const nav = document.querySelector('.compact-nav');
window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.style.boxShadow = window.scrollY > 40
        ? '0 8px 40px rgba(0,0,0,.13), 0 1px 0 rgba(255,255,255,.9) inset'
        : '0 4px 24px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.9) inset';
}, { passive: true });

// ─── 6. DR STRANGE PORTAL POPUP ──────────────
const portalOverlay = document.getElementById('portal-overlay');
const portalClose   = document.getElementById('portal-close');
const portalTimerEl = document.getElementById('portal-timer');
let portalTimerInterval = null;

function initPortalParticles() {
    const container = document.getElementById('portal-particles');
    if (!container) return;
    const colors = ['#f5a623', '#e84393', '#00c96b', '#00b4ff'];
    for (let i = 0; i < 20; i++) {
        const spark = document.createElement('div');
        spark.className = 'portal-spark';
        const angle = Math.random() * 360;
        const r = 60 + Math.random() * 30;
        const color = colors[Math.floor(Math.random() * colors.length)];
        spark.style.cssText = `
            --start-deg: ${angle}deg;
            --r: ${r}px;
            --dur: ${1.5 + Math.random() * 2}s;
            --delay: ${Math.random() * 2}s;
            left: 50%; top: 50%;
            background: ${color};
            width: ${1 + Math.random() * 2}px;
            height: ${1 + Math.random() * 2}px;
            box-shadow: 0 0 4px ${color};
        `;
        container.appendChild(spark);
    }
}

function openPortal(cat) {
    portalOverlay.classList.add('active');
    document.body.classList.add('no-scroll');

    // Start countdown
    let count = 3;
    if (portalTimerEl) portalTimerEl.textContent = count;
    clearInterval(portalTimerInterval);

    portalTimerInterval = setInterval(() => {
        count--;
        if (portalTimerEl) portalTimerEl.textContent = count;
        if (count <= 0) {
            clearInterval(portalTimerInterval);
            closePortal();
            // Filter and scroll to products
            filterCategory(cat);
            setTimeout(() => {
                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
            }, 200);
        }
    }, 1000);
}

function closePortal() {
    clearInterval(portalTimerInterval);
    portalOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

portalClose?.addEventListener('click', closePortal);
portalOverlay?.addEventListener('click', e => {
    if (e.target === portalOverlay) closePortal();
});

// ─── 7. PRODUCT RENDER ───────────────────────
function renderProducts(filter) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const filtered = filter === 'all'
        ? PRODUCTS
        : PRODUCTS.filter(p => p.cat === filter);

    grid.innerHTML = '';
    filtered.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${i * 0.06}s`;
        card.innerHTML = `
            <div class="product-img-wrap">
                <div class="product-img-placeholder">
                    <span class="p-icon">${p.icon}</span>
                    <span class="p-cat">${p.cat.toUpperCase()}</span>
                </div>
                ${p.badge ? `<div class="product-badge ${p.badge}">${p.badge.toUpperCase()}</div>` : ''}
            </div>
            <div class="product-info">
                <p class="product-cat">// ${p.cat.toUpperCase()}</p>
                <p class="product-name">${p.name}</p>
                <p class="product-desc-short">${p.desc}</p>
                <div class="product-row">
                    <span class="product-price">${p.price}</span>
                    <button class="product-view-btn" onclick="openPanel('${p.id}')">
                        VIEW ↗
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Re-init win effects for new cards
    initWindowsEffect();
}

// ─── 8. FILTER LOGIC ─────────────────────────
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.cat;
            filterCategory(cat);
        });
    });
}

function filterCategory(cat) {
    currentFilter = cat;
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === cat || (cat !== 'all' && b.dataset.cat === cat));
    });

    // Map tile cats to filter cats
    const catMap = {
        'men': 'men',
        'women': 'women',
        'baby-boy': 'baby',
        'baby-girl': 'baby',
        'her-footwear': 'footwear',
        'his-footwear': 'footwear',
        'all': 'all'
    };
    const filterCat = catMap[cat] || cat;

    // Animate grid out then in
    const grid = document.getElementById('product-grid');
    if (grid) {
        grid.style.opacity = '0';
        grid.style.transform = 'translateY(16px)';
        grid.style.transition = 'opacity .25s, transform .25s';
        setTimeout(() => {
            renderProducts(filterCat);
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 260);
    }

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(b => {
        if (b.dataset.cat === filterCat) b.classList.add('active');
        else b.classList.remove('active');
    });
    const allBtn = document.querySelector('.filter-btn[data-cat="all"]');
    if (filterCat !== 'all' && allBtn) allBtn.classList.remove('active');
}

// ─── 9. SIDE PANEL ───────────────────────────
const overlay  = document.getElementById('product-overlay');
const backdrop = document.getElementById('panel-backdrop');
const closeBtn = document.getElementById('close-panel');

function openPanel(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Update panel content
    document.getElementById('overlay-spec').textContent = `CORE_ID: ${product.id}`;
    document.getElementById('overlay-title').textContent = product.name;
    document.getElementById('overlay-price').textContent = product.price;
    document.getElementById('overlay-desc').textContent = product.desc;

    // Show icon placeholder in panel image
    const imgEl = document.getElementById('overlay-img');
    if (imgEl) {
        imgEl.style.display = 'none';
        const wrap = imgEl.parentElement;
        let placeholder = wrap.querySelector('.panel-image-placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'panel-image-placeholder';
            wrap.appendChild(placeholder);
        }
        placeholder.innerHTML = `
            <span class="pi-icon">${product.icon}</span>
            <span class="pi-label">${product.cat.toUpperCase()}</span>
        `;
    }

    overlay?.classList.add('active');
    backdrop?.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closePanel() {
    overlay?.classList.remove('active');
    backdrop?.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

closeBtn?.addEventListener('click', closePanel);
backdrop?.addEventListener('click', closePanel);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closePanel();
        closePortal();
        closeLogin();
    }
});

document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

let bagCount = 0;
const bagCountEl = document.querySelector('.bag-count');
document.querySelector('.add-bag-btn')?.addEventListener('click', () => {
    bagCount++;
    if (bagCountEl) {
        bagCountEl.textContent = bagCount;
        bagCountEl.style.transform = 'scale(1.6)';
        setTimeout(() => bagCountEl.style.transform = 'scale(1)', 220);
    }
    closePanel();
});

// ─── 10. LOGIN MODAL ──────────────────────────
const loginModal    = document.getElementById('login-modal');
const loginBackdrop = document.getElementById('login-backdrop');
const openLoginBtn  = document.getElementById('open-login');
const closeLoginBtn = document.getElementById('login-close');

function openLogin() {
    loginModal.classList.add('active');
    loginBackdrop.classList.add('active');
    document.body.classList.add('no-scroll');
    setBubble("Hey! Welcome back 👋");
    eyesOpen();
}
function closeLogin() {
    loginModal.classList.remove('active');
    loginBackdrop.classList.remove('active');
    document.body.classList.remove('no-scroll');
    eyesOpen();
}

openLoginBtn?.addEventListener('click', openLogin);
closeLoginBtn?.addEventListener('click', closeLogin);
loginBackdrop?.addEventListener('click', closeLogin);

// ─── 11. CHARACTER EYE TRACKING ───────────────
const character = document.getElementById('login-character');
const pupilL    = document.getElementById('pupil-left');
const pupilR    = document.getElementById('pupil-right');
const irisL     = document.getElementById('iris-left');
const irisR     = document.getElementById('iris-right');
const shineL    = document.getElementById('shine-left');
const shineR    = document.getElementById('shine-right');
const shine2L   = document.getElementById('shine2-left');
const shine2R   = document.getElementById('shine2-right');
const lidL      = document.getElementById('lid-left');
const lidR      = document.getElementById('lid-right');
const browL     = document.getElementById('brow-left');
const browR     = document.getElementById('brow-right');
const mouth     = document.getElementById('char-mouth');
const armsNormal = document.getElementById('arms-normal');
const armsCover  = document.getElementById('arms-cover');

const EYE_L = { cx: 94, cy: 135 };
const EYE_R = { cx: 126, cy: 135 };
const MAX_OFFSET = 5;
let eyesClosed = false;

function movePupils(e) {
    if (eyesClosed || !character) return;
    const rect = character.getBoundingClientRect();
    const charCx = rect.left + rect.width  * 0.5;
    const charCy = rect.top  + rect.height * 0.48;

    const dx = e.clientX - charCx;
    const dy = e.clientY - charCy;
    const dist = Math.hypot(dx, dy) || 1;
    const norm = Math.min(dist, 180) / 180;
    const ox = (dx / dist) * norm * MAX_OFFSET;
    const oy = (dy / dist) * norm * MAX_OFFSET;

    setPupil(pupilL, shineL, shine2L, irisL, EYE_L, ox, oy);
    setPupil(pupilR, shineR, shine2R, irisR, EYE_R, ox, oy);
}

function setPupil(pupil, shine, shine2, iris, base, ox, oy) {
    if (!pupil) return;
    const nx = base.cx + ox;
    const ny = base.cy + oy;
    pupil.setAttribute('cx', nx);
    pupil.setAttribute('cy', ny);
    if (iris) { iris.setAttribute('cx', nx); iris.setAttribute('cy', ny); }
    if (shine) { shine.setAttribute('cx', nx + 4); shine.setAttribute('cy', ny - 4); }
    if (shine2) { shine2.setAttribute('cx', nx - 4); shine2.setAttribute('cy', ny + 4); }
}

document.addEventListener('mousemove', movePupils);

function eyesOpen() {
    eyesClosed = false;
    // Animate lids back up
    animateLid(lidL, 94,  122, 3);
    animateLid(lidR, 126, 122, 3);
    // Normal brows
    if (browL) browL.setAttribute('d', 'M80 118 Q94 111 108 118');
    if (browR) browR.setAttribute('d', 'M112 118 Q126 111 140 118');
    // Happy mouth
    if (mouth) mouth.setAttribute('d', 'M100 162 Q110 172 120 162');
    // Show normal arms, hide cover arms
    if (armsNormal) armsNormal.style.display = 'block';
    if (armsCover)  armsCover.style.display  = 'none';
    // Re-enable character bob animation
    if (character) character.style.animation = 'charBob 3s ease-in-out infinite';
}

function eyesClose() {
    eyesClosed = true;
    // Drop lids down
    animateLid(lidL, 94,  138, 9);
    animateLid(lidR, 126, 138, 9);
    // Raised/worried brows
    if (browL) browL.setAttribute('d', 'M80 113 Q94 106 108 113');
    if (browR) browR.setAttribute('d', 'M112 113 Q126 106 140 113');
    // Shy mouth
    if (mouth) mouth.setAttribute('d', 'M102 164 Q110 168 118 164');
    // Hide normal arms, show cover arms
    if (armsNormal) armsNormal.style.display = 'none';
    if (armsCover)  armsCover.style.display  = 'block';
    // Stop bob animation (arms covering eyes)
    if (character) {
        character.style.animation = 'none';
        character.style.transform = 'translateY(-3px)';
    }
}

function animateLid(el, cx, targetCy, targetRy) {
    if (!el) return;
    const startCy = parseFloat(el.getAttribute('cy')) || 122;
    const startRy = parseFloat(el.getAttribute('ry')) || 3;
    const dur = 250;
    const start = performance.now();

    function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = t < .5 ? 2*t*t : -1+(4-2*t)*t;
        const cy = startCy + (targetCy - startCy) * ease;
        const ry = startRy + (targetRy  - startRy) * ease;
        el.setAttribute('cy', cy);
        el.setAttribute('ry', ry);
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ─── 12. PASSWORD FIELD TRIGGER ───────────────
const pwInput    = document.getElementById('login-password');
const emailInput = document.getElementById('login-email');

pwInput?.addEventListener('focus',  () => {
    eyesClose();
    setBubble("🙈 Not looking, I promise!");
});
pwInput?.addEventListener('blur', () => {
    eyesOpen();
    setBubble("Password entered ✅");
    setTimeout(() => setBubble("Ready to authenticate! 🔐"), 1500);
});

emailInput?.addEventListener('focus', () => {
    eyesOpen();
    setBubble("Type your email ✉️");
});
emailInput?.addEventListener('blur', () => setBubble("Got it! Now your password 👇"));

// Password show/hide toggle
const pwToggle  = document.getElementById('pw-toggle');
const pwEyeIcon = document.getElementById('pw-eye-icon');
let pwVisible   = false;

pwToggle?.addEventListener('click', () => {
    pwVisible = !pwVisible;
    pwInput.type = pwVisible ? 'text' : 'password';
    pwEyeIcon.innerHTML = pwVisible
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;

    if (pwVisible) {
        eyesOpen();
        setBubble("👀 I can see it now!");
        setTimeout(() => eyesClose(), 1500);
    } else {
        eyesClose();
        setBubble("🙈 Eyes closed again!");
    }
});

// ─── 13. SPEECH BUBBLE ───────────────────────
const bubble    = document.getElementById('char-bubble');
const bubbleTxt = document.getElementById('char-bubble-text');
let bubbleTimer = null;

function setBubble(text) {
    if (!bubble) return;
    clearTimeout(bubbleTimer);
    bubble.style.opacity   = '0';
    bubble.style.transform = 'scale(.9) translateY(6px)';
    bubble.style.transition = 'opacity .2s, transform .2s';
    setTimeout(() => {
        if (bubbleTxt) bubbleTxt.textContent = text;
        bubble.style.opacity   = '1';
        bubble.style.transform = 'scale(1) translateY(0)';
    }, 180);
}

// ─── 14. LOGIN SUBMIT ────────────────────────
document.getElementById('login-submit')?.addEventListener('click', () => {
    const email = document.getElementById('login-email')?.value;
    const pass  = document.getElementById('login-password')?.value;
    if (!email || !pass) {
        setBubble("Please fill everything in! 😅");
        return;
    }
    setBubble("Authenticating... 🔐");
    setTimeout(() => {
        setBubble("✅ Access Granted! Welcome.");
        setTimeout(closeLogin, 1200);
    }, 900);
});

// ─── 15. NEWSLETTER ──────────────────────────
const accessForm = document.getElementById('access-form');
const nlDot      = document.getElementById('nl-dot');
const nlStatus   = document.getElementById('nl-status');
const nlSuccess  = document.getElementById('nl-success');
const nlEmail    = document.getElementById('nl-email');

function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

nlEmail?.addEventListener('input', () => {
    if (isValidEmail(nlEmail.value)) {
        if (nlDot) nlDot.className = 'nl-status-dot online';
        if (nlStatus) { nlStatus.textContent = 'STATUS: SIGNAL_DETECTED // READY'; nlStatus.classList.add('online-text'); }
    } else {
        if (nlDot) nlDot.className = 'nl-status-dot offline';
        if (nlStatus) { nlStatus.textContent = 'STATUS: SYSTEM_OFFLINE'; nlStatus.classList.remove('online-text'); }
    }
});

accessForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (!isValidEmail(nlEmail.value)) return;
    accessForm.style.transition = 'opacity .4s, transform .4s';
    accessForm.style.opacity    = '0';
    accessForm.style.transform  = 'translateY(10px)';
    setTimeout(() => {
        accessForm.style.display = 'none';
        if (nlDot) nlDot.className = 'nl-status-dot online';
        if (nlStatus) { nlStatus.textContent = 'STATUS: SYSTEM_ONLINE // ACCESS_GRANTED'; nlStatus.classList.add('online-text'); }
        nlSuccess?.classList.add('show');
    }, 420);
});