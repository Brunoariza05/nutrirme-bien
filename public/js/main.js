// Todo el contenido de la página sale de /api/content, que a su vez
// lee data/content.json en el servidor. Para cambiar textos, precios,
// recetas o tips: se edita SOLO ese archivo, no este JS.
const ICON_WHATSAPP = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.86.5 3.6 1.37 5.1L2 22l5.06-1.33A9.94 9.94 0 0 0 12.01 22C17.53 22 22 17.52 22 12S17.53 2 12.01 2Zm5.78 14.24c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.02.27-3.4-.7-2.87-1.18-4.7-4.08-4.85-4.27-.14-.2-1.16-1.55-1.16-2.95s.73-2.1 1-2.38c.26-.29.56-.36.75-.36h.53c.17 0 .4-.06.62.48.24.58.8 2 .87 2.14.07.15.12.32.02.51-.1.2-.15.32-.3.5-.14.17-.3.38-.44.51-.14.14-.3.29-.13.58.17.29.76 1.28 1.64 2.08 1.13 1.02 2.08 1.34 2.37 1.5.29.14.46.12.63-.07.17-.2.72-.85.9-1.14.2-.3.4-.24.66-.14.27.1 1.7.82 2 .97.28.14.47.2.54.32.07.13.07.7-.17 1.36Z"/></svg>`;
const ICON_INSTAGRAM = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>`;

async function init() {
  const res = await fetch("/api/content");
  const data = await res.json();

  renderHero(data.hero, data.whatsappNumero);
  renderSobreMi(data.sobreMi);
  renderServicios(data.servicios, data.whatsappNumero);
  renderRecetas(data.recetas, data.footer.instagramUrl);
  renderTips(data.tips);
  renderFooter(data.footer, data.whatsappNumero);

  setupCarousel("servicios-track", "servicios-prev", "servicios-next");
  setupCarousel("recetas-track", "recetas-prev", "recetas-next");
  setupCarousel("tips-track", "tips-prev", "tips-next");
  document.body.classList.add("content-ready");
}


function waLink(numero, mensaje) {
  const texto = encodeURIComponent(mensaje || "Hola Ani!");
  return `https://wa.me/${numero}?text=${texto}`;
}

// ---------- HERO ----------
function renderHero(hero, numero) {
  const el = document.getElementById("hero");
  el.innerHTML = `
    <div class="inner">
      <div>
        <p class="eyebrow">${hero.porQuien}</p>
        <h1>${hero.marca}<br/><span class="destacado">${hero.marcaDestacado}</span></h1>
        <p class="bio">${hero.bio}</p>
        <a class="btn-whatsapp" href="${waLink(numero, "Hola Ani!")}" target="_blank" rel="noopener">
        ${ICON_WHATSAPP} ${hero.textoBotonWhatsapp}
        </a>
      </div>
      <div class="imagen-wrap">
        <img src="${hero.imagen}" alt="Ani, Nutrirme Bien" onerror="this.src='https://placehold.co/600x750/F5F1E6/6B7854?text=Foto+de+Ani'"/>
      </div>
    </div>
  `;
}

// ---------- SOBRE MI ----------
function renderSobreMi(sobreMi) {
  const el = document.getElementById("sobre-mi");
  const pilares = sobreMi.pilares.map(p => `
    <div class="pilar-card">
      <div class="icono">${p.icono}</div>
      <h3>${p.titulo}</h3>
      <p>${p.descripcion}</p>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="inner">
      <p class="eyebrow">SOBRE MÍ</p>
      <h2>${sobreMi.titulo}</h2>
      <p class="bajada">${sobreMi.bajada}</p>
      <div class="pilares-grid">${pilares}</div>
    </div>
  `;
}

// ---------- SERVICIOS ----------
function renderServicios(servicios, numero) {
  const el = document.getElementById("servicios");
  const cards = servicios.items.map((s, i) => `
    <div class="servicio-card">
      ${s.subtitulo ? `<p class="subtitulo">${s.subtitulo}</p>` : ""}
      <h3>${s.nombre}</h3>
      <p class="descripcion">${s.descripcion}</p>
      <p class="modalidad">${s.modalidad}</p>
      <p class="precio">${s.precio}</p>
      <button class="ver-mas-btn" data-index="${i}">Ver más ›</button>
      <a class="btn-whatsapp" href="${waLink(numero, s.mensajeWhatsapp)}" target="_blank" rel="noopener">
        ${ICON_WHATSAPP} Consultar por WhatsApp
      </a>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="inner">
      <div class="section-header">
        <div>
          <p class="eyebrow">SERVICIOS</p>
          <h2>${servicios.titulo}</h2>
          <p class="bajada">${servicios.bajada}</p>
        </div>
        <div class="carousel-controls">
          <button id="servicios-prev" aria-label="Anterior">‹</button>
          <button id="servicios-next" aria-label="Siguiente">›</button>
        </div>
      </div>
      <div class="carousel-track" id="servicios-track">${cards}</div>
    </div>
  `;

  el.querySelectorAll(".ver-mas-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      openServicioModal(servicios.items[Number(btn.dataset.index)]);
    });
  });
}

function openServicioModal(servicio) {
  const incluye = (servicio.queIncluye || []).map(i => `<li>${i}</li>`).join("");
  document.getElementById("modal-content").innerHTML = `
    ${servicio.subtitulo ? `<p class="subtitulo">${servicio.subtitulo}</p>` : ""}
    <h3>${servicio.nombre}</h3>
    <p class="precio">${servicio.precio}</p>
    <p class="detalle-label">Qué incluye:</p>
    <ul>${incluye}</ul>
    ${servicio.notaExtra ? `<p class="nota-extra">${servicio.notaExtra}</p>` : ""}
  `;
  document.getElementById("servicio-modal").hidden = false;
  document.body.classList.add("modal-open");
}

function closeServicioModal() {
  document.getElementById("servicio-modal").hidden = true;
  document.body.classList.remove("modal-open");
}

// ---------- RECETAS ----------
function renderRecetas(recetas, instagramUrlGeneral) {
  const el = document.getElementById("recetas");
  const cards = recetas.items.map(r => `
    <div class="receta-card">
      <div class="imagen-wrap">
        <span class="badge">${r.categoria}</span>
        <img src="${r.imagen}" alt="${r.nombre}" onerror="this.src='https://placehold.co/400x300/E4DFCF/6B7854?text=${encodeURIComponent(r.nombre)}'"/>
      </div>
      <div class="body">
        <h3>${r.nombre}</h3>
        <p>${r.descripcion}</p>
        <a class="ver-video-btn" href="${r.instagramUrl || instagramUrlGeneral}" target="_blank" rel="noopener">
          <span class="play-icon">▶</span> Ver en Instagram
        </a>
      </div>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="inner">
      <div class="section-header">
        <div>
          <p class="eyebrow">RECETAS</p>
          <h2>${recetas.titulo}</h2>
        </div>
        <div class="carousel-controls">
          <button id="recetas-prev" aria-label="Anterior">‹</button>
          <button id="recetas-next" aria-label="Siguiente">›</button>
        </div>
      </div>
      <div class="carousel-track" id="recetas-track">${cards}</div>
    </div>
  `;
}

// ---------- TIPS ----------
function renderTips(tips) {
  const el = document.getElementById("tips");
  const cards = tips.items.map(t => `
    <div class="tip-card">
      <span class="badge">${t.categoria}</span>
      <p>"${t.texto}"</p>
      <hr class="rule"/>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="inner">
      <div class="section-header">
        <div>
          <p class="eyebrow">TIPS</p>
          <h2>${tips.titulo}</h2>
        </div>
        <div class="carousel-controls">
          <button id="tips-prev" aria-label="Anterior">‹</button>
          <button id="tips-next" aria-label="Siguiente">›</button>
        </div>
      </div>
      <div class="carousel-track" id="tips-track">${cards}</div>
    </div>
  `;
}

// ---------- FOOTER ----------
function renderFooter(footer, numero) {
  const el = document.getElementById("footer");
  el.innerHTML = `
    <div class="inner">
      <p class="eyebrow">${footer.tituloHablemos}</p>
      <h2>${footer.titulo}</h2>
      <p class="bajada">${footer.bajada}</p>
      <a class="btn-whatsapp" href="${waLink(numero, 'Hola Ani!')}" target="_blank" rel="noopener">
      ${ICON_WHATSAPP} ${footer.textoBotonWhatsapp}
      </a>
      <br/>
      <a class="instagram" href="${footer.instagramUrl}" target="_blank" rel="noopener">
      ${ICON_INSTAGRAM} ${footer.instagram}
      </a>
      <p class="disclaimer">${footer.disclaimer}</p>
      <a class="copyright" href="/admin">${footer.copyright}</a>    </div>
  `;
}

// ---------- CARRUSELES: flechas + swipe táctil ----------
function setupCarousel(trackId, prevId, nextId) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  if (!track) return;

  const scrollAmount = () => track.clientWidth * 0.8;

  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
  });
  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount(), behavior: "smooth" });
  });
  // El swipe táctil funciona solo (scroll-snap + overflow-x en la CSS),
  // no hace falta JS extra para eso en mobile.
}

init();

document.getElementById("modal-close-btn").addEventListener("click", closeServicioModal);
document.getElementById("servicio-modal").addEventListener("click", (e) => {
  if (e.target.id === "servicio-modal") closeServicioModal(); // click afuera del recuadro
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeServicioModal();
});