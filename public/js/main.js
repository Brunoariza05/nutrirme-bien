// Todo el contenido de la página sale de /api/content, que a su vez
// lee data/content.json en el servidor. Para cambiar textos, precios,
// recetas o tips: se edita SOLO ese archivo, no este JS.

async function init() {
  const res = await fetch("/api/content");
  const data = await res.json();

  renderHero(data.hero, data.whatsappNumero);
  renderSobreMi(data.sobreMi);
  renderServicios(data.servicios, data.whatsappNumero);
  renderRecetas(data.recetas);
  renderTips(data.tips);
  renderFooter(data.footer, data.whatsappNumero);

  setupCarousel("servicios-track", "servicios-prev", "servicios-next");
  setupCarousel("recetas-track", "recetas-prev", "recetas-next");
  setupCarousel("tips-track", "tips-prev", "tips-next");
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
          💬 ${hero.textoBotonWhatsapp}
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
  const cards = servicios.items.map(s => `
    <div class="servicio-card">
      ${s.subtitulo ? `<p class="subtitulo">${s.subtitulo}</p>` : ""}
      <h3>${s.nombre}</h3>
      <p class="descripcion">${s.descripcion}</p>
      <p class="modalidad">${s.modalidad}</p>
      <p class="precio">${s.precio}</p>
      <a class="btn-whatsapp" href="${waLink(numero, s.mensajeWhatsapp)}" target="_blank" rel="noopener">
        💬 Consultar por WhatsApp
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
}

// ---------- RECETAS ----------
function renderRecetas(recetas) {
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
        <button class="ver-mas-btn" disabled title="Próximamente: video de preparación">
          Ver más ›
        </button>
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
        💬 ${footer.textoBotonWhatsapp}
      </a>
      <br/>
      <a class="instagram" href="${footer.instagramUrl}" target="_blank" rel="noopener">
        📷 ${footer.instagram}
      </a>
      <p class="disclaimer">${footer.disclaimer}</p>
      <p class="copyright">${footer.copyright}</p>
    </div>
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
