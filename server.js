const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "odcorrect.sqlite");
const SESSION_COOKIE = "odcorrect_session";
const SESSION_DAYS = 7;

const ROUTES = {
    "/": "index.html",
    "/home": "index.html",
    "/shop": "shop.html",
    "/product": "product.html",
    "/cart": "cart.html"
};

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf"
};

const PRODUCT_CATALOG = [
    { id:"OC_MN_001", name:"OVERSIZED TEE", cat:"men", price:1299, badge:"new", color:"#1d1d1f", description:"Heavyweight 450gsm oversized tee with architectural silhouette." },
    { id:"OC_WM_001", name:"CROP HOODIE", cat:"women", price:1899, badge:"new", color:"#2d2d3a", description:"Cropped hoodie with raw hem detailing and logo embroidery." },
    { id:"OC_MN_002", name:"CORE JOGGER SET", cat:"men", price:2499, badge:"", color:"#3a3a3a", description:"Matching heavyweight joggers with engineering-grade stitching." },
    { id:"OC_WM_002", name:"REVERSE WEAVE HOODIE", cat:"women", price:2199, badge:"", color:"#2a3520", description:"Reverse weave construction for maximum shape retention." },
    { id:"OC_BB_001", name:"MINI TEE", cat:"baby", price:699, badge:"new", color:"#1d3a2a", description:"Soft 200gsm baby tee in RADHA collection colorways." },
    { id:"OC_BG_001", name:"BABY DRESS", cat:"baby", price:799, badge:"new", color:"#3a1d2a", description:"Tiny dress with OD branding for the next generation." },
    { id:"OC_HF_001", name:"OD LOW RUNNER", cat:"footwear", price:3999, badge:"", color:"#1d2a3a", description:"Low-profile runner with chunky outsole and OD tab." },
    { id:"OC_HF_002", name:"PLATFORM SLIDE", cat:"footwear", price:1699, badge:"sold", color:"#2a1d1d", description:"Platform slide in premium moulded rubber. Sold out." },
    { id:"OC_MN_003", name:"COACH JACKET", cat:"men", price:3499, badge:"", color:"#1a1a2a", description:"Satin-finish coach jacket with embroidered ODCORRECT badge." },
    { id:"OC_WM_003", name:"UTILITY CARGOS", cat:"women", price:2799, badge:"", color:"#2a2a1a", description:"Six-pocket utility pants with tonal OD hardware." },
    { id:"OC_MN_004", name:"TECH FLEECE HALF-ZIP", cat:"men", price:2099, badge:"", color:"#1a2a2a", description:"Textured tech fleece for the engineering aesthetic." },
    { id:"OC_WM_004", name:"WIDE LEG SWEATS", cat:"women", price:1999, badge:"new", color:"#2a1a2a", description:"Ultra wide leg with elasticated waistband and OD tape." }
];

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);

initDatabase();

function initDatabase() {
    db.exec(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'customer',
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            badge TEXT,
            color TEXT,
            description TEXT,
            active INTEGER NOT NULL DEFAULT 1,
            updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            subtotal INTEGER NOT NULL,
            tax INTEGER NOT NULL,
            shipping INTEGER NOT NULL,
            total INTEGER NOT NULL,
            promo TEXT,
            status TEXT NOT NULL DEFAULT 'placed',
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            name TEXT NOT NULL,
            size TEXT,
            color_name TEXT,
            quantity INTEGER NOT NULL,
            unit_price INTEGER NOT NULL,
            line_total INTEGER NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `);

    seedAdminUser();
    seedProducts();
}

function seedAdminUser() {
    const email = "admin@mrineh.in";
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

    if (!existing) {
        db.prepare(`
            INSERT INTO users (name, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run("Admin", email, hashPassword("password123"), "admin", Date.now());
    }
}

function seedProducts() {
    const stmt = db.prepare(`
        INSERT INTO products (id, name, category, price, badge, color, description, active, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            category = excluded.category,
            price = excluded.price,
            badge = excluded.badge,
            color = excluded.color,
            description = excluded.description,
            active = 1,
            updated_at = excluded.updated_at
    `);

    const now = Date.now();
    for (const product of PRODUCT_CATALOG) {
        stmt.run(
            product.id,
            product.name,
            product.cat,
            product.price,
            product.badge,
            product.color,
            product.description,
            now
        );
    }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    const [salt, originalHash] = String(storedHash || "").split(":");
    if (!salt || !originalHash) return false;

    const candidateHash = crypto.scryptSync(password, salt, 64);
    const originalBuffer = Buffer.from(originalHash, "hex");

    return originalBuffer.length === candidateHash.length &&
        crypto.timingSafeEqual(originalBuffer, candidateHash);
}

function createSession(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const createdAt = Date.now();
    const expiresAt = createdAt + SESSION_DAYS * 24 * 60 * 60 * 1000;

    db.prepare(`
        INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
        VALUES (?, ?, ?, ?)
    `).run(tokenHash, userId, expiresAt, createdAt);

    return { token, expiresAt };
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function parseCookies(req) {
    const header = req.headers.cookie || "";
    return Object.fromEntries(
        header.split(";")
            .map(part => part.trim())
            .filter(Boolean)
            .map(part => {
                const idx = part.indexOf("=");
                return [
                    decodeURIComponent(part.slice(0, idx)),
                    decodeURIComponent(part.slice(idx + 1))
                ];
            })
    );
}

function getSessionUser(req) {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (!token) return null;

    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());

    return db.prepare(`
        SELECT users.id, users.name, users.email, users.role
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?
    `).get(hashToken(token), Date.now()) || null;
}

function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
            if (body.length > 1_000_000) {
                req.destroy();
                reject(new Error("Request body too large"));
            }
        });
        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                reject(new Error("Invalid JSON"));
            }
        });
        req.on("error", reject);
    });
}

function sendJson(res, status, payload, headers = {}) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...headers
    });
    res.end(JSON.stringify(payload));
}

function setSessionCookie(res, token) {
    const maxAge = SESSION_DAYS * 24 * 60 * 60;
    return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearSessionCookie() {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function resolveFile(requestUrl) {
    const parsedUrl = new URL(requestUrl, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);
    const routeFile = ROUTES[pathname];
    const requestedPath = routeFile || pathname.replace(/^\/+/, "");
    const absolutePath = path.resolve(ROOT, requestedPath);

    if (!absolutePath.toLowerCase().startsWith(ROOT.toLowerCase())) {
        return null;
    }

    return absolutePath;
}

function sendFile(res, filePath) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            send404(res);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
            "Cache-Control": "no-store"
        });
        res.end(content);
    });
}

function send404(res) {
    const notFoundPath = path.join(ROOT, "index.html");

    fs.readFile(notFoundPath, (err, content) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("404 - Page not found");
            return;
        }

        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(content);
    });
}

async function handleApi(req, res, url) {
    if (req.method === "GET" && url.pathname === "/api/health") {
        sendJson(res, 200, { ok: true, database: "sqlite", time: new Date().toISOString() });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
        const body = await readJsonBody(req);
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

        if (!user || !verifyPassword(password, user.password_hash)) {
            sendJson(res, 401, { success: false, message: "Invalid email or password" });
            return true;
        }

        const session = createSession(user.id);
        sendJson(res, 200, {
            success: true,
            user: publicUser(user)
        }, {
            "Set-Cookie": setSessionCookie(res, session.token)
        });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/register") {
        const body = await readJsonBody(req);
        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");

        if (!name || !email || password.length < 6) {
            sendJson(res, 400, { success: false, message: "Name, valid email, and 6+ character password required" });
            return true;
        }

        try {
            const result = db.prepare(`
                INSERT INTO users (name, email, password_hash, role, created_at)
                VALUES (?, ?, ?, 'customer', ?)
            `).run(name, email, hashPassword(password), Date.now());

            const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);
            const session = createSession(user.id);
            sendJson(res, 201, { success: true, user: publicUser(user) }, {
                "Set-Cookie": setSessionCookie(res, session.token)
            });
        } catch {
            sendJson(res, 409, { success: false, message: "That email is already registered" });
        }
        return true;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
        const user = getSessionUser(req);
        if (!user) {
            sendJson(res, 401, { success: false, user: null });
            return true;
        }
        sendJson(res, 200, { success: true, user: publicUser(user) });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
        const token = parseCookies(req)[SESSION_COOKIE];
        if (token) {
            db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
        }
        sendJson(res, 200, { success: true }, { "Set-Cookie": clearSessionCookie() });
        return true;
    }

    if (req.method === "GET" && url.pathname === "/api/products") {
        const products = db.prepare(`
            SELECT id, name, category AS cat, price, badge, color, description AS desc
            FROM products
            WHERE active = 1
            ORDER BY updated_at DESC, id ASC
        `).all();
        sendJson(res, 200, { success: true, products });
        return true;
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/products/")) {
        const id = decodeURIComponent(url.pathname.replace("/api/products/", ""));
        const product = db.prepare(`
            SELECT id, name, category AS cat, price, badge, color, description AS desc
            FROM products
            WHERE id = ? AND active = 1
        `).get(id);
        if (!product) {
            sendJson(res, 404, { success: false, message: "Product not found" });
            return true;
        }
        sendJson(res, 200, { success: true, product });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/orders/create") {
        const user = getSessionUser(req);
        if (!user) {
            sendJson(res, 401, { success: false, message: "Please login before placing an order" });
            return true;
        }

        const body = await readJsonBody(req);
        const items = Array.isArray(body.items) ? body.items : [];

        if (items.length === 0) {
            sendJson(res, 400, { success: false, message: "Cart is empty" });
            return true;
        }

        const orderLines = [];
        let subtotal = 0;

        for (const item of items) {
            const product = db.prepare("SELECT id, name, price FROM products WHERE id = ? AND active = 1").get(item.id);
            const qty = Math.max(1, Math.min(Number(item.qty) || 1, 10));
            if (!product) continue;

            const lineTotal = product.price * qty;
            subtotal += lineTotal;
            orderLines.push({
                productId: product.id,
                name: product.name,
                size: String(item.size || "M"),
                colorName: String(item.colorName || "DEFAULT"),
                quantity: qty,
                unitPrice: product.price,
                lineTotal
            });
        }

        if (orderLines.length === 0) {
            sendJson(res, 400, { success: false, message: "No valid products in cart" });
            return true;
        }

        const tax = Math.round(subtotal * 0.18);
        const shipping = subtotal >= 999 ? 0 : 99;
        const total = subtotal + tax + shipping;
        const orderId = `OD-${Date.now().toString(36).toUpperCase()}`;
        const promo = body.promo ? String(body.promo).slice(0, 80) : null;

        db.exec("BEGIN");
        try {
            db.prepare(`
                INSERT INTO orders (id, user_id, subtotal, tax, shipping, total, promo, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'placed', ?)
            `).run(orderId, user.id, subtotal, tax, shipping, total, promo, Date.now());

            const itemStmt = db.prepare(`
                INSERT INTO order_items
                    (order_id, product_id, name, size, color_name, quantity, unit_price, line_total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const line of orderLines) {
                itemStmt.run(
                    orderId,
                    line.productId,
                    line.name,
                    line.size,
                    line.colorName,
                    line.quantity,
                    line.unitPrice,
                    line.lineTotal
                );
            }

            db.exec("COMMIT");
        } catch (err) {
            db.exec("ROLLBACK");
            throw err;
        }

        sendJson(res, 201, {
            success: true,
            order: {
                id: orderId,
                subtotal,
                tax,
                shipping,
                total,
                status: "placed"
            }
        });
        return true;
    }

    if (req.method === "GET" && url.pathname === "/api/orders") {
        const user = getSessionUser(req);
        if (!user) {
            sendJson(res, 401, { success: false, message: "Please login to view orders" });
            return true;
        }

        const orders = db.prepare(`
            SELECT id, subtotal, tax, shipping, total, promo, status, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).all(user.id);

        sendJson(res, 200, { success: true, orders });
        return true;
    }

    return false;
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    try {
        if (url.pathname.startsWith("/api/")) {
            const handled = await handleApi(req, res, url);
            if (!handled) {
                sendJson(res, 404, { success: false, message: "API route not found" });
            }
            return;
        }

        if (!["GET", "HEAD"].includes(req.method)) {
            res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Method not allowed");
            return;
        }

        const filePath = resolveFile(req.url);

        if (!filePath) {
            send404(res);
            return;
        }

        sendFile(res, filePath);
    } catch (err) {
        console.error(err);
        sendJson(res, 500, { success: false, message: "Server error" });
    }
});

server.listen(PORT, HOST, () => {
    console.log(`ODCORRECT is live at http://localhost:${PORT}`);
    console.log(`Database: ${DB_PATH}`);
});
