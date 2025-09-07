// Lógica básica separada: solo utilidades simples sin productos dinámicos

function scrollToProducts() {
  const el = document.getElementById('productos');
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Exponer si es necesario en global
window.scrollToProducts = scrollToProducts;

// Navegación básica para carruseles por serie
function initCarousels() {
  const tracks = document.querySelectorAll('.carousel.track[data-id]');
  tracks.forEach((track) => {
  // Usa .snap-start en lugar de clases con corchetes para compatibilidad de selectores
  const cards = () => Array.from(track.querySelectorAll('.snap-start'));
    const lefts = () => cards().map((el) => el.offsetLeft);

  // Botones de navegación: creados si no existen
  let leftBtn = track.parentElement.querySelector('.carousel-btn.left');
  let rightBtn = track.parentElement.querySelector('.carousel-btn.right');
  const ensureButtons = () => {
    if (!leftBtn) {
      leftBtn = document.createElement('button');
      leftBtn.type = 'button';
      leftBtn.className = 'carousel-btn left absolute top-1/2 -translate-y-1/2 left-1 z-10 hidden md:inline-flex items-center justify-center rounded-full w-10 h-10 bg-white border border-gray-200 text-gray-700 shadow hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed';
      leftBtn.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
      leftBtn.setAttribute('aria-label', 'Anterior');
      track.parentElement.style.position = 'relative';
      track.parentElement.appendChild(leftBtn);
    }
    if (!rightBtn) {
      rightBtn = document.createElement('button');
      rightBtn.type = 'button';
      rightBtn.className = 'carousel-btn right absolute top-1/2 -translate-y-1/2 right-1 z-10 hidden md:inline-flex items-center justify-center rounded-full w-10 h-10 bg-white border border-gray-200 text-gray-700 shadow hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed';
      rightBtn.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
      rightBtn.setAttribute('aria-label', 'Siguiente');
      track.parentElement.style.position = 'relative';
      track.parentElement.appendChild(rightBtn);
    }
  };
  ensureButtons();

  const updateDisabled = () => {
    const atStart = track.scrollLeft <= 1;
    const atEnd = Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 1;
    if (leftBtn) leftBtn.disabled = atStart;
    if (rightBtn) rightBtn.disabled = atEnd;
    // Ocultar botones cuando está en modo grid
    const isGrid = track.classList.contains('as-grid');
  if (leftBtn) leftBtn.classList.toggle('hidden', isGrid);
  if (rightBtn) rightBtn.classList.toggle('hidden', isGrid);
  };

  const scrollToCard = (dir) => {
    const cs = cards();
    if (!cs.length) return;
    const current = track.scrollLeft;
    const ls = lefts();
    // Encontrar el índice del card visible siguiente/anterior
    let idx = 0;
    for (let i = 0; i < ls.length; i++) {
      if (ls[i] >= current - 5) { idx = i; break; }
    }
    let targetIdx = dir > 0 ? Math.min(idx + 1, cs.length - 1) : Math.max(idx - 1, 0);
    // Ajuste si estamos casi al siguiente
    if (dir > 0 && ls[targetIdx] - current < 24 && targetIdx < cs.length - 1) targetIdx++;
    if (dir < 0 && current - ls[targetIdx] < 24 && targetIdx > 0) targetIdx--;
    track.scrollTo({ left: ls[targetIdx], behavior: 'smooth' });
    setTimeout(updateDisabled, 300);
  };

  track.addEventListener('scroll', updateDisabled, { passive: true });
  leftBtn?.addEventListener('click', () => scrollToCard(-1));
  rightBtn?.addEventListener('click', () => scrollToCard(1));
  // teclado en carrusel
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollToCard(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToCard(-1); }
  });
  updateDisabled();

    // Drag-to-scroll con pointer events (funciona en mouse y pantallas táctiles)
    let isDown = false;
    let startX = 0;
    let startLeft = 0;
    track.addEventListener('pointerdown', (e) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // respeta reduced motion
      isDown = true;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
      track.style.cursor = 'grabbing';
    });
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      track.scrollLeft = startLeft - dx;
    });
    const endDrag = (e) => {
      if (!isDown) return;
      isDown = false;
      try { track.releasePointerCapture(e.pointerId); } catch {}
      track.style.cursor = '';
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointerleave', endDrag);
  });
}

// Prefetch de partials al pasar mouse/enfocar chips
function initPrefetchChips() {
  document.querySelectorAll('[data-partial]').forEach((a) => {
    const path = a.getAttribute('data-partial');
    const pre = () => { if (path && !partialCache.has(path)) getPartial(path).catch(()=>{}); };
    a.addEventListener('mouseenter', pre);
    a.addEventListener('focus', pre);
  });
}

// Botón scroll al tope
function initToTop() {
  const btn = document.getElementById('to-top');
  if (!btn) return;
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle('hidden', y < 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  onScroll();
}

// Inicialización única
document.addEventListener('DOMContentLoaded', () => {
  initCarousels();
  enhanceImages();
  setupLightbox();
  setupCategoryLoader();
  setupMobileMenu();
  initPrefetchChips();
  initToTop();
});

// Pone loading="lazy" y decoding="async" en imágenes del catálogo
function enhanceImages() {
  const container = document.getElementById('productos');
  if (!container) return;
  container.querySelectorAll('img').forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
    if (!img.hasAttribute('sizes')) {
      img.setAttribute('sizes', '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');
    }
  // Limpiar códigos al final del alt ("- 115417_703") para accesibilidad
  const alt = img.getAttribute('alt') || '';
  const cleaned = alt.replace(/\s*[-–—]\s*\d[\d_]*\s*$/u, '');
  if (cleaned !== alt) img.setAttribute('alt', cleaned);
  });
}

// Lightbox simple para ver imágenes en grande con navegación por serie
function setupLightbox() {
  const productos = document.getElementById('productos');
  if (!productos) return;

  // Crear modal una vez
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm hidden items-center justify-center z-50';
  overlay.innerHTML = `
    <div class="relative max-w-[92vw] max-h-[88vh] w-full h-full flex flex-col items-center justify-center p-4">
      <button type="button" data-action="close" class="absolute top-4 right-4 text-white/90 hover:text-white text-2xl">×</button>
      <button type="button" data-action="prev" class="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-2xl">◀</button>
      <img id="lightbox-image" src="" alt="" class="max-h-[80vh] max-w-[90vw] object-contain rounded shadow-lg" />
      <div id="lightbox-caption" class="mt-3 text-white/90 text-sm text-center"></div>
      <div class="mt-3 flex flex-wrap items-center justify-center gap-3">
        <a id="wa-cta" href="#" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded">
          Consultar por WhatsApp
        </a>
      </div>
      <button type="button" data-action="next" class="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-2xl">▶</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('#lightbox-image');
  const capEl = overlay.querySelector('#lightbox-caption');
  const waBtn = overlay.querySelector('#wa-cta');

  let currentTrack = null; // .carousel.track
  let currentIndex = -1; // índice de la imagen actual dentro de la serie

  function openFrom(targetImg) {
    currentTrack = targetImg.closest('.carousel.track');
    if (!currentTrack) return;
    const imgs = Array.from(currentTrack.querySelectorAll('img'));
    currentIndex = imgs.indexOf(targetImg);
    if (currentIndex < 0) return;
    showAt(currentIndex);
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function showAt(idx) {
    const cards = Array.from(currentTrack.querySelectorAll('.min-w-[260px]'));
    if (!cards.length) return;
    const clamped = Math.max(0, Math.min(idx, cards.length - 1));
    currentIndex = clamped;
    const card = cards[clamped];
    const img = card.querySelector('img');
    imgEl.src = img?.getAttribute('src') || '';
    imgEl.alt = img?.getAttribute('alt') || '';
  // Caption: solo título corto
  const title = card.querySelector('.font-semibold')?.textContent?.trim() || '';
  capEl.textContent = title;
  // CTA de WhatsApp sin código
  const base = title || (imgEl.alt || '').replace(/\s*-\s*\d+$/, '');
  const msg = encodeURIComponent(`Hola, me interesa este producto: ${base}. ¿Podrían brindarme más información?`);
  waBtn.setAttribute('href', `https://wa.me/593984060541?text=${msg}`);
  }

  function close() {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    document.body.style.overflow = '';
  }

  function next() {
    if (!currentTrack) return;
    showAt(currentIndex + 1);
  }

  function prev() {
    if (!currentTrack) return;
    showAt(currentIndex - 1);
  }

  // Delegación: abrir al hacer click en cualquier imagen del carrusel
  productos.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.closest('.carousel.track')) {
      openFrom(t);
    }
  });

  // Controles del modal
  overlay.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
      const act = btn.getAttribute('data-action');
      if (act === 'close') return close();
      if (act === 'next') return next();
      if (act === 'prev') return prev();
    }
    // Cerrar si se hace click fuera del contenido central
    if (e.target === overlay) close();
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Swipe en lightbox (gestos simples)
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
  });
}

// Eliminado: copy-code y mini toast (no se muestran códigos)

// Carga parcial de categorías: inserta HTML de /partials y re-inicializa interacciones
function setupCategoryLoader() {
  const container = document.getElementById('categoria-contenido');
  const links = document.querySelectorAll('[data-partial]');
  if (!container || !links.length) return;

  async function loadCategory(path) {
    try {
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = `
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${Array.from({ length: 6 }).map(() => `
            <div class=\"animate-pulse bg-white rounded-lg shadow\">
              <div class=\"h-44 bg-gray-200 rounded-t-lg\"></div>
              <div class=\"p-4 space-y-2\">
                <div class=\"h-4 bg-gray-200 rounded w-2/3\"></div>
                <div class=\"h-3 bg-gray-200 rounded w-1/2\"></div>
              </div>
            </div>
          `).join('')}
        </div>`;
  const html = await getPartial(path);
    container.innerHTML = html;
      // Re-inicializar comportamientos
      initCarousels();
      enhanceImages();
  // Por defecto: vista en grilla (2-4 columnas según ancho)
  const persistGrid = localStorage.getItem('viewMode') !== 'carousel';
  container.querySelectorAll('.carousel.track').forEach((el) => el.classList.toggle('as-grid', persistGrid));
  setupViewToggle(container);
  setupFilter(container);
      container.setAttribute('aria-busy', 'false');
      announce(`Categoría cargada`);
    // desplazarse al inicio de productos tras cambiar categoría
    const prod = document.getElementById('productos');
    if (prod) prod.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      container.innerHTML = '<div class="py-12 text-center text-red-600">No se pudo cargar la categoría.</div>';
    }
  }

  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const path = a.getAttribute('data-partial');
      if (!path) return;
      // Estado activo accesible
      links.forEach((x) => {
        x.classList.remove('bg-yellow-400', 'text-gray-900', 'border-yellow-300', 'chip--active');
        x.setAttribute('aria-selected', 'false');
        x.setAttribute('tabindex', '-1');
      });
  a.classList.add('bg-yellow-400', 'text-gray-900', 'border-yellow-300', 'chip--active');
      a.setAttribute('aria-selected', 'true');
      a.setAttribute('tabindex', '0');
      loadCategory(path);
      const url = new URL(window.location);
      url.searchParams.set('cat', path);
      window.history.replaceState({}, '', url);
      a.focus({ preventScroll: true });
  // tooltip accesible
  if (!a.title) a.title = a.textContent?.trim() || '';
    });
  });

  // Cargar por query string o la primera categoría
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('cat') || links[0]?.getAttribute('data-partial');
  const initialLink = Array.from(links).find((x) => x.getAttribute('data-partial') === initial) || links[0];
  if (initialLink) initialLink.click();
  // Deep-link por código eliminado

  // Teclado para pestañas de categorías
  const tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    tablist.addEventListener('keydown', (e) => {
      const order = Array.from(links);
      const current = document.activeElement;
      const idx = order.indexOf(current);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (idx === -1) return;
        const nextIdx = e.key === 'ArrowRight' ? (idx + 1) % order.length : (idx - 1 + order.length) % order.length;
        order[nextIdx].focus();
      }
      if (e.key === 'Home') {
        e.preventDefault();
        order[0]?.focus();
      }
      if (e.key === 'End') {
        e.preventDefault();
        order[order.length - 1]?.focus();
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (idx !== -1) {
          e.preventDefault();
          order[idx].click();
        }
      }
    });
  }
}

// Mobile menu toggle
function setupMobileMenu() {
  const btn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const iconOpen = btn.querySelector('#icon-open');
  const iconClose = btn.querySelector('#icon-close');
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    btn.setAttribute('aria-expanded', String(next));
    menu.classList.toggle('hidden', !next);
    iconOpen.classList.toggle('hidden', next);
    iconClose.classList.toggle('hidden', !next);
  });
}

// (Modo oscuro eliminado por solicitud)

// Vista: Grid <-> Carrusel
function setupViewToggle(container) {
  const gridBtn = document.getElementById('view-grid');
  const carBtn = document.getElementById('view-carousel');
  const tracks = () => container.querySelectorAll('.carousel.track');
  if (!gridBtn || !carBtn) return;
  const setActive = (grid) => {
    gridBtn.classList.toggle('bg-gray-100', grid);
    carBtn.classList.toggle('bg-gray-100', !grid);
  };
  gridBtn.addEventListener('click', () => {
    tracks().forEach((el) => el.classList.add('as-grid'));
  // actualizar estado de botones si existen
  tracks().forEach((el) => el.dispatchEvent(new Event('scroll')));
    setActive(true);
    localStorage.setItem('viewMode', 'grid');
  });
  carBtn.addEventListener('click', () => {
    tracks().forEach((el) => el.classList.remove('as-grid'));
  tracks().forEach((el) => el.dispatchEvent(new Event('scroll')));
    setActive(false);
    localStorage.setItem('viewMode', 'carousel');
  });
  const persisted = localStorage.getItem('viewMode') || 'grid';
  setActive(persisted === 'grid');
}

// Filtro simple de tarjetas por texto
function setupFilter(container) {
  const input = document.getElementById('filter-input');
  const clearBtn = document.getElementById('filter-clear');
  if (!input) return;
  const emptyMsgId = 'empty-state-msg';
  const renderEmpty = (show) => {
    let msg = container.querySelector('#' + emptyMsgId);
    if (show) {
      if (!msg) {
        msg = document.createElement('div');
        msg.id = emptyMsgId;
        msg.className = 'py-10 text-center text-black/60';
        msg.textContent = 'No hay resultados para tu búsqueda.';
        container.appendChild(msg);
      }
    } else if (msg) {
      msg.remove();
    }
  };
  let t;
  const run = () => {
  const q = (input.value || '').toLowerCase().trim();
    container.querySelectorAll('.carousel.track > div').forEach((card) => {
  const title = card.querySelector('.font-semibold')?.textContent?.toLowerCase() || '';
  const alt = card.querySelector('img')?.getAttribute('alt')?.toLowerCase() || '';
  const show = !q || title.includes(q) || alt.includes(q);
      card.style.display = show ? '' : 'none';
    });
    const anyVisible = Array.from(container.querySelectorAll('.carousel.track > div')).some((el) => el.style.display !== 'none');
    renderEmpty(!anyVisible);
  if (clearBtn) clearBtn.classList.toggle('hidden', !q);
  announce(anyVisible ? '' : 'No hay resultados para tu búsqueda');
  };
  input.removeEventListener('input', input._filterHandler || (() => {}));
  input._filterHandler = () => { clearTimeout(t); t = setTimeout(run, 120); };
  input.addEventListener('input', input._filterHandler);
  clearBtn?.addEventListener('click', () => { input.value=''; run(); input.focus(); });
}

// Prefetch y cache simple de partials
const partialCache = new Map();
async function getPartial(path) {
  if (partialCache.has(path)) return partialCache.get(path);
  const res = await fetch(path, { cache: 'no-store' });
  const html = await res.text();
  partialCache.set(path, html);
  return html;
}

// Prefetch se inicializa en initPrefetchChips()

// Announce helper para aria-live
function announce(msg){
  const el = document.getElementById('filter-status');
  if (el) el.textContent = msg || '';
}

// Scroll-to-top se inicializa en initToTop()
