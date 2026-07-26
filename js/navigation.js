(() => {
    const nav = document.querySelector(".compact-nav");
    const toggle = nav?.querySelector(".nav-menu-toggle");
    const drawer = nav?.querySelector(".nav-drawer");
    const backdrop = document.querySelector(".nav-drawer-backdrop");

    if (!nav || !toggle || !drawer || !backdrop) return;

    function setMenu(open) {
        nav.classList.toggle("nav-open", open);
        backdrop.classList.toggle("active", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        drawer.setAttribute("aria-hidden", String(!open));
        drawer.toggleAttribute("inert", !open);
        document.body.classList.toggle("menu-open", open);
    }

    setMenu(false);

    toggle.addEventListener("click", () => {
        setMenu(!nav.classList.contains("nav-open"));
    });

    backdrop.addEventListener("click", () => setMenu(false));

    drawer.addEventListener("click", event => {
        const action = event.target.closest("a, button");
        if (action) setMenu(false);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") setMenu(false);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1200 && nav.classList.contains("nav-open")) {
            setMenu(false);
        }
    }, { passive: true });
})();
