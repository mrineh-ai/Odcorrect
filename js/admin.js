const currency = amount => "₹" + Number(amount || 0).toLocaleString("en-IN");
const dateFmt = ts => new Date(Number(ts)).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
});

let currentUser = null;

async function api(path, options = {}) {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Request failed");
    }
    return data;
}

function setStatus(text) {
    const el = document.getElementById("admin-status");
    if (el) el.textContent = text;
}

function renderBlocked(message) {
    document.querySelector(".admin-shell").innerHTML = `
        <div class="admin-blocked">
            <p class="admin-kicker">ACCESS DENIED</p>
            <h1>Admin Only</h1>
            <p class="admin-sub">${message}</p>
            <div class="admin-actions" style="margin-top:24px">
                <a class="admin-dark-btn" href="/">Go Home</a>
                <a class="admin-ghost-btn" href="/shop">Shop</a>
            </div>
        </div>
    `;
}

async function checkAdmin() {
    try {
        const result = await api("/api/me");
        currentUser = result.user;

        if (currentUser.role !== "admin") {
            renderBlocked("This dashboard is only available to admin accounts.");
            return false;
        }

        const btn = document.getElementById("admin-user-btn");
        if (btn) btn.textContent = `HI ${currentUser.name.toUpperCase().split(" ")[0]}`;
        setStatus(`Signed in as ${currentUser.email}`);
        return true;
    } catch {
        renderBlocked("Please login as admin first.");
        return false;
    }
}

function renderSummary(summary) {
    document.getElementById("stat-orders").textContent = summary.orders;
    document.getElementById("stat-revenue").textContent = currency(summary.revenue);
    document.getElementById("stat-users").textContent = summary.users;
    document.getElementById("stat-products").textContent = summary.products;
}

function renderOrders(orders) {
    const tbody = document.getElementById("orders-table");
    if (!tbody) return;

    if (!orders.length) {
        tbody.innerHTML = `<tr><td colspan="7">No orders yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const items = order.items.map(item =>
            `${item.name} x${item.quantity}`
        ).join("<br>");
        const shipping = order.shipping_line1
            ? `${order.shipping_name || order.customer_name}<br>
               <span class="muted-cell">${order.shipping_phone || ""}</span><br>
               <span class="muted-cell">${[
                    order.shipping_line1,
                    order.shipping_line2,
                    order.shipping_city,
                    order.shipping_state,
                    order.shipping_postal_code,
                    order.shipping_country
                ].filter(Boolean).join(", ")}</span>`
            : `<span class="muted-cell">No address saved</span>`;

        return `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    <strong>${order.customer_name}</strong><br>
                    <span class="muted-cell">${order.customer_email}</span>
                </td>
                <td>${items}</td>
                <td>${shipping}</td>
                <td><span class="status-pill">${order.status}</span></td>
                <td><strong>${currency(order.total)}</strong></td>
                <td class="muted-cell">${dateFmt(order.created_at)}</td>
            </tr>
        `;
    }).join("");
}

function renderProducts(products) {
    const tbody = document.getElementById("products-table");
    if (!tbody) return;

    tbody.innerHTML = products.map(product => `
        <tr>
            <td><strong>${product.id}</strong></td>
            <td>${product.name}</td>
            <td>${product.cat.toUpperCase()}</td>
            <td>${product.badge || "-"}</td>
            <td><strong>${currency(product.price)}</strong></td>
            <td><span class="active-pill ${product.active ? "yes" : "no"}">${product.active ? "active" : "off"}</span></td>
        </tr>
    `).join("");
}

function renderUsers(users) {
    const tbody = document.getElementById("users-table");
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td><span class="role-pill ${user.role}">${user.role}</span></td>
            <td>${user.order_count}</td>
            <td><strong>${currency(user.total_spent)}</strong></td>
            <td class="muted-cell">${dateFmt(user.created_at)}</td>
        </tr>
    `).join("");
}

async function loadDashboard() {
    setStatus("Loading dashboard...");
    const [summary, orders, products, users] = await Promise.all([
        api("/api/admin/summary"),
        api("/api/admin/orders"),
        api("/api/admin/products"),
        api("/api/admin/users")
    ]);

    renderSummary(summary.summary);
    renderOrders(orders.orders);
    renderProducts(products.products);
    renderUsers(users.users);
    setStatus(`Signed in as ${currentUser.email}`);
}

function initTabs() {
    document.querySelectorAll(".admin-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(tab.dataset.panel)?.classList.add("active");
        });
    });
}

async function logout() {
    try {
        await fetch("/api/logout", { method: "POST" });
    } finally {
        localStorage.removeItem("odcorrect_user");
        window.location.href = "/";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    initTabs();
    document.getElementById("refresh-admin")?.addEventListener("click", loadDashboard);
    document.getElementById("logout-admin")?.addEventListener("click", logout);
    document.getElementById("admin-user-btn")?.addEventListener("click", logout);

    if (await checkAdmin()) {
        await loadDashboard();
    }
});
