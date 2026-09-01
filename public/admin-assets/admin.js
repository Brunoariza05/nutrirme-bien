let CONTENT = null;

async function init() {
  const res = await fetch("/api/admin/content");
  if (res.status === 401 || res.redirected) {
    window.location.href = "/admin/login";
    return;
  }
  CONTENT = await res.json();
  render();
}

function render() {
  const root = document.getElementById("admin-root");
  root.innerHTML = `
    <div class="admin-header">
      <h1>Panel · Nutrirme Bien</h1>
      <form method="POST" action="/admin/logout">
        <button class="logout-btn" type="submit">Cerrar sesión</button>
      </form>
    </div>
    <div class="admin-tabs">
      <button class="admin-tab active" data-tab="general">General</button>
      <button class="admin-tab" data-tab="sobreMi">Sobre mí</button>
      <button class="admin-tab" data-tab="servicios">Servicios</button>
      <button class="admin-tab" data-tab="recetas">Recetas</button>
      <button class="admin-tab" data-tab="tips">Tips</button>
      <button class="admin-tab" data-tab="footer">Contacto / Footer</button>
    </div>
    <div id="panel-general" class="admin-panel active"></div>
    <div id="panel-sobreMi" class="admin-panel"></div>
    <div id="panel-servicios" class="admin-panel"></div>
    <div id="panel-recetas" class="admin-panel"></div>
    <div id="panel-tips" class="admin-panel"></div>
    <div id="panel-footer" class="admin-panel"></div>
  `;

  root.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.querySelectorAll(".admin-tab").forEach((b) => b.classList.remove("active"));
      root.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
    });
  });

  renderGeneral();
  renderSobreMi();
  renderServicios();
  renderRecetas();
  renderTips();
  renderFooter();
}

function campoTexto(label, id, value, hint) {
  return `
    <div class="admin-field">
      <label for="${id}">${label}</label>
      ${hint ? `<p class="admin-hint">${hint}</p>` : ""}
      <input type="text" id="${id}" value="${escapeAttr(value || "")}" />
    </div>`;
}
function campoTextarea(label, id, value, hint) {
  return `
    <div class="admin-field">
      <label for="${id}">${label}</label>
      ${hint ? `<p class="admin-hint">${hint}</p>` : ""}
      <textarea id="${id}">${escapeHtml(value || "")}</textarea>
    </div>`;
}

function campoImagen(label, id, value, hint) {
  return `
    <div class="admin-field">
      <label for="${id}">${label}</label>
      ${hint ? `<p class="admin-hint">${hint}</p>` : ""}
      <input type="text" id="${id}" value="${escapeAttr(value || "")}" placeholder="/img/... o subí una foto abajo" />
      <div class="admin-upload-row">
        <input type="file" id="${id}-file" accept="image/*" />
        <button type="button" class="admin-upload-btn" data-target="${id}">Subir foto</button>
        <span class="admin-upload-status" id="${id}-status"></span>
      </div>
      <img class="admin-preview" id="${id}-preview" src="${escapeAttr(value || "")}" ${value ? "" : "hidden"} />
    </div>`;
}

function setupImageUploaders(scopeEl) {
  scopeEl.querySelectorAll(".admin-upload-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId = btn.dataset.target;
      const fileInput = document.getElementById(`${targetId}-file`);
      const statusEl = document.getElementById(`${targetId}-status`);
      const urlInput = document.getElementById(targetId);
      const preview = document.getElementById(`${targetId}-preview`);

      if (!fileInput.files[0]) {
        statusEl.textContent = "Elegí un archivo primero";
        return;
      }
      statusEl.textContent = "Subiendo...";
      const formData = new FormData();
      formData.append("imagen", fileInput.files[0]);

      try {
        const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
        if (!res.ok) throw new Error("fallo la subida");
        const data = await res.json();
        urlInput.value = data.url;
        preview.src = data.url;
        preview.hidden = false;
        statusEl.textContent = "✓ Subida";
        setTimeout(() => { statusEl.textContent = ""; }, 2500);
      } catch (err) {
        statusEl.textContent = "Error al subir, probá de nuevo";
      }
    });
  });
}

function escapeAttr(str) { return String(str).replace(/"/g, "&quot;"); }
function escapeHtml(str) { return String(str).replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function botonGuardar(seccion, texto) {
  return `<button class="admin-save-btn" data-save="${seccion}">${texto || "Guardar cambios"}</button>
    <span class="admin-status" id="status-${seccion}"></span>`;
}

async function guardarSeccion(seccion, data) {
  const statusEl = document.getElementById(`status-${seccion}`);
  statusEl.textContent = "Guardando...";
  statusEl.classList.remove("error");
  try {
    const res = await fetch(`/api/admin/save/${seccion}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error del servidor");
    CONTENT[seccion] = data;
    statusEl.textContent = "✓ Guardado";
    setTimeout(() => (statusEl.textContent = ""), 2500);
  } catch (err) {
    statusEl.textContent = "No se pudo guardar, probá de nuevo";
    statusEl.classList.add("error");
  }
}

function renderGeneral() {
  const hero = CONTENT.hero;
  const panel = document.getElementById("panel-general");
  panel.innerHTML = `
    <h2>Inicio (Hero)</h2>
    ${campoTexto("Texto pequeño arriba del título", "hero-porQuien", hero.porQuien)}
    ${campoTexto("Nombre de la marca", "hero-marca", hero.marca)}
    ${campoTexto("Palabra destacada (en cursiva, debajo)", "hero-marcaDestacado", hero.marcaDestacado)}
    ${campoTextarea("Bio corta", "hero-bio", hero.bio)}
    ${campoTexto("Texto del botón de WhatsApp", "hero-textoBotonWhatsapp", hero.textoBotonWhatsapp)}
    ${campoImagen("Foto principal", "hero-imagen", hero.imagen, "Subí una foto o pegá un link manualmente")}    
    ${botonGuardar("hero", "Guardar Hero")}
    <h2 style="margin-top:36px;">Número de WhatsApp</h2>
    ${campoTexto("Número (con código de país, sin + ni espacios)", "whatsappNumero", CONTENT.whatsappNumero, "Ej: 5493511234567 — a este número llegan TODOS los botones de WhatsApp del sitio")}
    ${botonGuardar("whatsappNumero", "Guardar número de WhatsApp")}`,
    setupImageUploaders(panel);

  panel.querySelector('[data-save="hero"]').addEventListener("click", () => {
    guardarSeccion("hero", {
      porQuien: val("hero-porQuien"),
      marca: val("hero-marca"),
      marcaDestacado: val("hero-marcaDestacado"),
      bio: val("hero-bio"),
      textoBotonWhatsapp: val("hero-textoBotonWhatsapp"),
      imagen: val("hero-imagen"),
    });
  });
  panel.querySelector('[data-save="whatsappNumero"]').addEventListener("click", () => {
    guardarSeccion("whatsappNumero", val("whatsappNumero"));
  });
}

function val(id) { return document.getElementById(id).value.trim(); }

function renderSobreMi() {
  const s = CONTENT.sobreMi;
  const panel = document.getElementById("panel-sobreMi");
  function pintar() {
    panel.innerHTML = `
      <h2>Sobre mí</h2>
      ${campoTexto("Título", "sm-titulo", s.titulo)}
      ${campoTextarea("Bajada / presentación", "sm-bajada", s.bajada)}
      <h3>Pilares</h3>
      <div id="pilares-lista"></div>
      <button class="admin-add-btn" id="add-pilar">+ Agregar pilar</button>
      ${botonGuardar("sobreMi")}
    `;
    const lista = document.getElementById("pilares-lista");
    s.pilares.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.innerHTML = `
        <button class="admin-card-remove" data-remove="${i}">✕</button>
        ${campoTexto("Ícono (un emoji)", `pilar-icono-${i}`, p.icono)}
        ${campoTexto("Título del pilar", `pilar-titulo-${i}`, p.titulo)}
        ${campoTextarea("Descripción", `pilar-desc-${i}`, p.descripcion)}
      `;
      lista.appendChild(card);
    });
    lista.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => { s.pilares.splice(Number(btn.dataset.remove), 1); pintar(); });
    });
    document.getElementById("add-pilar").addEventListener("click", () => {
      s.pilares.push({ icono: "🌱", titulo: "", descripcion: "" }); pintar();
    });
    panel.querySelector('[data-save="sobreMi"]').addEventListener("click", () => {
      const pilares = s.pilares.map((_, i) => ({
        icono: val(`pilar-icono-${i}`), titulo: val(`pilar-titulo-${i}`), descripcion: val(`pilar-desc-${i}`),
      }));
      guardarSeccion("sobreMi", { titulo: val("sm-titulo"), bajada: val("sm-bajada"), pilares });
    });
  }
  pintar();
}

function renderServicios() {
  const s = CONTENT.servicios;
  const panel = document.getElementById("panel-servicios");
  function pintar() {
    panel.innerHTML = `
      <h2>Servicios</h2>
      ${campoTexto("Título de la sección", "srv-titulo", s.titulo)}
      ${campoTextarea("Bajada", "srv-bajada", s.bajada)}
      <h3>Planes / servicios</h3>
      <div id="servicios-lista"></div>
      <button class="admin-add-btn" id="add-servicio">+ Agregar servicio</button>
      ${botonGuardar("servicios")}
    `;
    const lista = document.getElementById("servicios-lista");
    s.items.forEach((it, i) => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.innerHTML = `
        <button class="admin-card-remove" data-remove="${i}">✕</button>
        ${campoTexto("Nombre del servicio", `srv-nombre-${i}`, it.nombre)}
        ${campoTexto("Subtítulo", `srv-subtitulo-${i}`, it.subtitulo)}
        ${campoTexto("Modalidad", `srv-modalidad-${i}`, it.modalidad)}
        ${campoTextarea("Descripción corta", `srv-descripcion-${i}`, it.descripcion)}
        ${campoTexto("Precio (texto)", `srv-precio-${i}`, it.precio, 'Ej: Inversión: $45.000')}
        ${campoTexto("Mensaje de WhatsApp para este servicio", `srv-msg-${i}`, it.mensajeWhatsapp)}
        ${campoTextarea("Qué incluye (una línea por punto)", `srv-incluye-${i}`, (it.queIncluye || []).join("\n"), "Cada línea nueva es un ítem de la lista")}
        ${campoTextarea("Nota extra (opcional)", `srv-nota-${i}`, it.notaExtra || "")}
      `;
      lista.appendChild(card);
    });
    lista.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => { s.items.splice(Number(btn.dataset.remove), 1); pintar(); });
    });
    document.getElementById("add-servicio").addEventListener("click", () => {
      s.items.push({ nombre: "", subtitulo: "", modalidad: "", descripcion: "", precio: "", mensajeWhatsapp: "", queIncluye: [], notaExtra: "" });
      pintar();
    });
    panel.querySelector('[data-save="servicios"]').addEventListener("click", () => {
      const items = s.items.map((_, i) => ({
        nombre: val(`srv-nombre-${i}`), subtitulo: val(`srv-subtitulo-${i}`), modalidad: val(`srv-modalidad-${i}`),
        descripcion: val(`srv-descripcion-${i}`), precio: val(`srv-precio-${i}`), mensajeWhatsapp: val(`srv-msg-${i}`),
        queIncluye: val(`srv-incluye-${i}`).split("\n").map((s) => s.trim()).filter(Boolean),
        notaExtra: val(`srv-nota-${i}`),
      }));
      guardarSeccion("servicios", { titulo: val("srv-titulo"), bajada: val("srv-bajada"), items });
    });
  }
  pintar();
}

function renderRecetas() {
  const s = CONTENT.recetas;
  const panel = document.getElementById("panel-recetas");
  function pintar() {
    panel.innerHTML = `
      <h2>Recetas</h2>
      ${campoTexto("Título de la sección", "rec-titulo", s.titulo)}
      <h3>Recetas cargadas</h3>
      <div id="recetas-lista"></div>
      <button class="admin-add-btn" id="add-receta">+ Agregar receta</button>
      ${botonGuardar("recetas")}
    `;
    const lista = document.getElementById("recetas-lista");
    s.items.forEach((it, i) => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.innerHTML = `
        <button class="admin-card-remove" data-remove="${i}">✕</button>
        ${campoTexto("Nombre de la receta", `rec-nombre-${i}`, it.nombre)}
        ${campoTexto("Categoría (ej: Postre fit)", `rec-categoria-${i}`, it.categoria)}
        ${campoTextarea("Descripción corta", `rec-descripcion-${i}`, it.descripcion)}
        ${campoImagen("Foto de la receta", `rec-imagen-${i}`, it.imagen)}
        ${campoTexto("Link de Instagram (opcional)", `rec-ig-${i}`, it.instagramUrl || "", "Si lo dejás vacío, usa el link general de Instagram del footer")}`,
        setupImageUploaders(lista);
      lista.appendChild(card);
    });
    lista.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => { s.items.splice(Number(btn.dataset.remove), 1); pintar(); });
    });
    document.getElementById("add-receta").addEventListener("click", () => {
      s.items.push({ nombre: "", categoria: "", descripcion: "", imagen: "", instagramUrl: "" }); pintar();
    });
    panel.querySelector('[data-save="recetas"]').addEventListener("click", () => {
      const items = s.items.map((_, i) => ({
        nombre: val(`rec-nombre-${i}`), categoria: val(`rec-categoria-${i}`), descripcion: val(`rec-descripcion-${i}`),
        imagen: val(`rec-imagen-${i}`), instagramUrl: val(`rec-ig-${i}`) || null,
      }));
      guardarSeccion("recetas", { titulo: val("rec-titulo"), items });
    });
  }
  pintar();
}

function renderTips() {
  const s = CONTENT.tips;
  const panel = document.getElementById("panel-tips");
  function pintar() {
    panel.innerHTML = `
      <h2>Tips</h2>
      ${campoTexto("Título de la sección", "tip-titulo", s.titulo)}
      <h3>Tips cargados</h3>
      <div id="tips-lista"></div>
      <button class="admin-add-btn" id="add-tip">+ Agregar tip</button>
      ${botonGuardar("tips")}
    `;
    const lista = document.getElementById("tips-lista");
    s.items.forEach((it, i) => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.innerHTML = `
        <button class="admin-card-remove" data-remove="${i}">✕</button>
        ${campoTexto("Categoría (ej: Familia)", `tipc-${i}`, it.categoria)}
        ${campoTextarea("Texto del tip", `tipt-${i}`, it.texto)}
      `;
      lista.appendChild(card);
    });
    lista.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => { s.items.splice(Number(btn.dataset.remove), 1); pintar(); });
    });
    document.getElementById("add-tip").addEventListener("click", () => {
      s.items.push({ categoria: "", texto: "" }); pintar();
    });
    panel.querySelector('[data-save="tips"]').addEventListener("click", () => {
      const items = s.items.map((_, i) => ({ categoria: val(`tipc-${i}`), texto: val(`tipt-${i}`) }));
      guardarSeccion("tips", { titulo: val("tip-titulo"), items });
    });
  }
  pintar();
}

function renderFooter() {
  const f = CONTENT.footer;
  const panel = document.getElementById("panel-footer");
  panel.innerHTML = `
    <h2>Contacto / Footer</h2>
    ${campoTexto("Texto pequeño arriba ('HABLEMOS')", "f-tituloHablemos", f.tituloHablemos)}
    ${campoTexto("Título", "f-titulo", f.titulo)}
    ${campoTextarea("Bajada", "f-bajada", f.bajada)}
    ${campoTexto("Texto del botón de WhatsApp", "f-textoBoton", f.textoBotonWhatsapp)}
    ${campoTexto("Usuario de Instagram (texto mostrado)", "f-instagram", f.instagram)}
    ${campoTexto("Link a Instagram", "f-instagramUrl", f.instagramUrl)}
    ${campoTextarea("Disclaimer", "f-disclaimer", f.disclaimer)}
    ${campoTexto("Copyright", "f-copyright", f.copyright)}
    ${botonGuardar("footer")}
  `;
  panel.querySelector('[data-save="footer"]').addEventListener("click", () => {
    guardarSeccion("footer", {
      tituloHablemos: val("f-tituloHablemos"), titulo: val("f-titulo"), bajada: val("f-bajada"),
      textoBotonWhatsapp: val("f-textoBoton"), instagram: val("f-instagram"), instagramUrl: val("f-instagramUrl"),
      disclaimer: val("f-disclaimer"), copyright: val("f-copyright"),
    });
  });
}

init();