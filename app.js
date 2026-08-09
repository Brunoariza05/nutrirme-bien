const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const CONTENT_PATH = path.join(__dirname, "data", "content.json");

// Sirve todo lo que está en /public (html, css, js, imágenes)
app.use(express.static(path.join(__dirname, "public")));

// Única fuente de la data: lee data/content.json y lo devuelve como JSON.
// El frontend (public/js/main.js) llama a esta ruta para armar toda la página.
app.get("/api/content", (req, res) => {
  fs.readFile(CONTENT_PATH, "utf-8", (err, raw) => {
    if (err) {
      console.error("Error leyendo content.json:", err);
      return res.status(500).json({ error: "No se pudo leer el contenido" });
    }
    try {
      const data = JSON.parse(raw);
      res.json(data);
    } catch (parseErr) {
      console.error("content.json tiene un error de formato:", parseErr);
      res.status(500).json({ error: "content.json mal formado" });
    }
  });
});

module.exports = app;
