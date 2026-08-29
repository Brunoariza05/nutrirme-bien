require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { getDb } = require("./lib/db");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || "cambiar-en-produccion"));

app.get("/api/content", async (req, res) => {
  try {
    const db = await getDb();
    const content = await db.collection("content").findOne({ _id: "site" });
    if (!content) {
      return res.status(404).json({ error: "Todavía no hay contenido cargado en la base." });
    }
    delete content._id;
    res.json(content);
  } catch (err) {
    console.error("Error leyendo /api/content:", err);
    res.status(500).json({ error: "No se pudo leer el contenido" });
  }
});

function paginaLogin(error) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ingresar | Panel Nutrirme Bien</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/admin-assets/admin.css" />
  </head>
  <body class="login-body">
    <form class="login-box" method="POST" action="/admin/login">
      <h1>Panel de Nutrirme Bien</h1>
      <p class="login-sub">Ingresá tus datos para editar la página</p>
      ${error ? `<p class="login-error">${error}</p>` : ""}
      <label>Usuario</label>
      <input type="text" name="usuario" autocomplete="username" required />
      <label>Contraseña</label>
      <input type="password" name="contrasena" autocomplete="current-password" required />
      <button type="submit">Ingresar</button>
    </form>
  </body>
  </html>`;
}

app.get("/admin/login", (req, res) => {
  res.send(paginaLogin());
});

app.post("/admin/login", (req, res) => {
  const { usuario, contrasena } = req.body;
  const usuarioOk = usuario === process.env.ADMIN_USER;
  const passOk = contrasena === process.env.ADMIN_PASS;

  if (usuarioOk && passOk) {
    res.cookie("admin_session", "ok", {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 12,
    });
    return res.redirect("/admin");
  }
  res.status(401).send(paginaLogin("Usuario o contraseña incorrectos."));
});

app.post("/admin/logout", (req, res) => {
  res.clearCookie("admin_session");
  res.redirect("/admin/login");
});

function requireAuth(req, res, next) {
  if (req.signedCookies && req.signedCookies.admin_session === "ok") {
    return next();
  }
  res.redirect("/admin/login");
}

app.get("/admin", requireAuth, (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panel | Nutrirme Bien</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/admin-assets/admin.css" />
  </head>
  <body>
    <div id="admin-root">Cargando panel...</div>
    <script src="/admin-assets/admin.js"></script>
  </body>
  </html>`);
});

app.get("/api/admin/content", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const content = await db.collection("content").findOne({ _id: "site" });
    if (!content) return res.status(404).json({ error: "No hay contenido cargado" });
    delete content._id;
    res.json(content);
  } catch (err) {
    console.error("Error en /api/admin/content:", err);
    res.status(500).json({ error: "No se pudo leer el contenido" });
  }
});

const SECCIONES_VALIDAS = ["hero", "sobreMi", "servicios", "recetas", "tips", "footer", "whatsappNumero"];

app.post("/api/admin/save/:seccion", requireAuth, async (req, res) => {
  const { seccion } = req.params;
  if (!SECCIONES_VALIDAS.includes(seccion)) {
    return res.status(400).json({ error: "Sección inválida" });
  }
  try {
    const db = await getDb();
    await db.collection("content").updateOne(
      { _id: "site" },
      { $set: { [seccion]: req.body } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(`Error guardando sección "${seccion}":`, err);
    res.status(500).json({ error: "No se pudo guardar" });
  }
});

module.exports = app;