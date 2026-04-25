// ══════════════════════════════════════════════
//  ODCORRECT MASTER ENGINE  v2
// ══════════════════════════════════════════════

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
window.addEventListener('DOMContentLoaded', () => {
    const intro  = document.getElementById('intro-overlay');
    const status = document.querySelector('.status-code');

    document.body.classList.add('no-scroll');
    initWindowsEffect();

    setTimeout(() => {
        if (intro) {
            intro.classList.add('intro-hidden');
            document.body.classList.remove('no-scroll');
            setTimeout(reveal, 200);
        }
    }, 4200);
});

// ─── 5. NAV SCROLL SHADOW ────────────────────
const nav = document.querySelector('.compact-nav');
window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 40
        ? '0 8px 40px rgba(0,0,0,.13), 0 1px 0 rgba(255,255,255,.9) inset'
        : '0 4px 24px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.9) inset';
}, { passive: true });

// ─── 6. TILE CATEGORY FILTER ─────────────────
function filterCategory(cat) {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(t => { t.style.transition = 'opacity .25s'; t.style.opacity = '.4'; });
    setTimeout(() => tiles.forEach(t => t.style.opacity = '1'), 350);
}

// ─── 7. LOGIN MODAL ──────────────────────────
const loginModal    = document.getElementById('login-modal');
const loginBackdrop = document.getElementById('login-backdrop');
const openLoginBtn  = document.getElementById('open-login');
const closeLoginBtn = document.getElementById('login-close');

function openLogin() {
    loginModal.classList.add('active');
    loginBackdrop.classList.add('active');
    document.body.classList.add('no-scroll');
    setBubble("Hey! Welcome back 👋");
}
function closeLogin() {
    loginModal.classList.remove('active');
    loginBackdrop.classList.remove('active');
    document.body.classList.remove('no-scroll');
    eyesOpen(); // reset eyes
}

openLoginBtn?.addEventListener('click', openLogin);
closeLoginBtn?.addEventListener('click', closeLogin);
loginBackdrop?.addEventListener('click', closeLogin);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLogin(); });

// ─── 8. CHARACTER EYE TRACKING ───────────────
const character  = document.getElementById('login-character');
const pupilL     = document.getElementById('pupil-left');
const pupilR     = document.getElementById('pupil-right');
const irisL      = document.getElementById('iris-left');
const irisR      = document.getElementById('iris-right');
const shineL     = document.getElementById('shine-left');
const shineR     = document.getElementById('shine-right');
const lidL       = document.getElementById('lid-left');
const lidR       = document.getElementById('lid-right');
const browL      = document.getElementById('brow-left');
const browR      = document.getElementById('brow-right');
const mouth      = document.getElementById('char-mouth');

// Base centres for pupils
const EYE_L = { cx: 74, cy: 91 };
const EYE_R = { cx: 126, cy: 91 };
const MAX_OFFSET = 6;
let eyesClosed = false;

function movePupils(e) {
    if (eyesClosed || !character) return;
    const rect = character.getBoundingClientRect();
    const charCx = rect.left + rect.width  * 0.5;
    const charCy = rect.top  + rect.height * 0.42;

    const dx = e.clientX - charCx;
    const dy = e.clientY - charCy;
    const dist = Math.hypot(dx, dy) || 1;
    const norm = Math.min(dist, 160) / 160;
    const ox = (dx / dist) * norm * MAX_OFFSET;
    const oy = (dy / dist) * norm * MAX_OFFSET;

    setPupil(pupilL, shineL, irisL, EYE_L, ox, oy);
    setPupil(pupilR, shineR, irisR, EYE_R, ox, oy);
}

function setPupil(pupil, shine, iris, base, ox, oy) {
    const nx = base.cx + ox;
    const ny = base.cy + oy;
    pupil.setAttribute('cx', nx);
    pupil.setAttribute('cy', ny);
    iris.setAttribute('cx', nx);
    iris.setAttribute('cy', ny);
    shine.setAttribute('cx', nx + 4);
    shine.setAttribute('cy', ny - 4);
}

document.addEventListener('mousemove', movePupils);

function eyesOpen() {
    eyesClosed = false;
    // Eyelids back up
    animateLid(lidL, 76,  74);
    animateLid(lidR, 126, 74);
    // Brows normal
    browL.setAttribute('d', 'M62 74 Q74 68 86 74');
    browR.setAttribute('d', 'M114 74 Q126 68 138 74');
    // Happy mouth
    mouth.setAttribute('d', 'M84 120 Q100 131 116 120');
    setBubble("Your password is safe with me 🤫");
    setTimeout(() => { if (!eyesClosed) setBubble("Hey! Welcome back 👋"); }, 2000);
}

function eyesClose() {
    eyesClosed = true;
    // Drop eyelids down
    animateLid(lidL, 76,  91);
    animateLid(lidR, 126, 91);
    // Raise brows (squinting shy look)
    browL.setAttribute('d', 'M62 70 Q74 63 86 70');
    browR.setAttribute('d', 'M114 70 Q126 63 138 70');
    // Embarrassed / squished mouth
    mouth.setAttribute('d', 'M88 120 Q100 124 112 120');
    setBubble("🙈 I'm not looking, promise!");
}

function animateLid(el, cx, targetCy) {
    const startCy = parseFloat(el.getAttribute('cy')) || 74;
    const startRy = parseFloat(el.getAttribute('ry')) || 3;
    const endRy   = targetCy > 80 ? 9 : 3;
    const dur     = 280; // ms
    const start   = performance.now();

    function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = t < .5 ? 2*t*t : -1+(4-2*t)*t;
        const cy = startCy + (targetCy - startCy) * ease;
        const ry = startRy + (endRy   - startRy) * ease;
        el.setAttribute('cy', cy);
        el.setAttribute('ry', ry);
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ─── 9. PASSWORD FIELD EYE TRIGGER ───────────
const pwInput  = document.getElementById('login-password');
const emailInput = document.getElementById('login-email');

pwInput?.addEventListener('focus',  () => eyesClose());
pwInput?.addEventListener('blur',   () => eyesOpen());

emailInput?.addEventListener('focus', () => {
    eyesOpen();
    setBubble("Type your email ✉️");
});
emailInput?.addEventListener('blur', () => setBubble("Hey! Welcome back 👋"));

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
        setBubble("I can see it now 👀");
    } else {
        eyesClose();
    }
});

// ─── 10. SPEECH BUBBLE ───────────────────────
const bubble     = document.getElementById('char-bubble');
const bubbleTxt  = document.getElementById('char-bubble-text');
let bubbleTimer  = null;

function setBubble(text) {
    if (!bubble) return;
    clearTimeout(bubbleTimer);
    bubble.style.opacity = '0';
    bubble.style.transform = 'scale(.9) translateY(6px)';
    bubble.style.transition = 'opacity .2s, transform .2s';
    setTimeout(() => {
        bubbleTxt.textContent = text;
        bubble.style.opacity  = '1';
        bubble.style.transform = 'scale(1) translateY(0)';
    }, 180);
}

// ─── 11. LOGIN SUBMIT ────────────────────────
document.getElementById('login-submit')?.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const pass  = document.getElementById('login-password').value;
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

// ─── 12. SIDE PANEL ──────────────────────────
const overlay  = document.getElementById('product-overlay');
const backdrop = document.getElementById('panel-backdrop');
const closeBtn = document.getElementById('close-panel');

function closePanel() {
    overlay?.classList.remove('active');
    backdrop?.classList.remove('active');
    document.body.classList.remove('no-scroll');
}
closeBtn?.addEventListener('click', closePanel);
backdrop?.addEventListener('click', closePanel);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

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
        bagCountEl.style.transform = 'scale(1.5)';
        setTimeout(() => bagCountEl.style.transform = 'scale(1)', 220);
    }
    closePanel();
});

// ─── 13. NEWSLETTER — STATUS + SUCCESS ───────
const accessForm = document.getElementById('access-form');
const nlDot      = document.getElementById('nl-dot');
const nlStatus   = document.getElementById('nl-status');
const nlSuccess  = document.getElementById('nl-success');
const nlEmail    = document.getElementById('nl-email');

function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// As user types, switch status if email is valid
nlEmail?.addEventListener('input', () => {
    if (isValidEmail(nlEmail.value)) {
        nlDot.className    = 'nl-status-dot online';
        nlStatus.textContent = 'STATUS: SIGNAL_DETECTED // READY';
        nlStatus.classList.add('online-text');
    } else {
        nlDot.className    = 'nl-status-dot offline';
        nlStatus.textContent = 'STATUS: SYSTEM_OFFLINE';
        nlStatus.classList.remove('online-text');
    }
});

accessForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (!isValidEmail(nlEmail.value)) return;

    // Animate out form
    accessForm.style.transition = 'opacity .4s, transform .4s';
    accessForm.style.opacity    = '0';
    accessForm.style.transform  = 'translateY(10px)';

    setTimeout(() => {
        accessForm.style.display = 'none';
        // Update status
        nlDot.className      = 'nl-status-dot online';
        nlStatus.textContent = 'STATUS: SYSTEM_ONLINE // ACCESS_GRANTED';
        nlStatus.classList.add('online-text');
        // Show success
        nlSuccess.classList.add('show');
    }, 420);
});