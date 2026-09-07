/**
 * FRANCO'S — landing page
 * -----------------------------------------------------------------------
 * Estructura del archivo:
 *   1. Datos de productos (reemplazar acá cuando haya fotos reales)
 *   2. Render de productos en el DOM
 *   3. Carrusel de productos (autoplay + controles manuales)
 *   4. Animaciones GSAP de scroll (respetan prefers-reduced-motion)
 *
 * Para reemplazar un placeholder de producto por una foto real:
 *   - Súbanla directo a la raíz del repo, junto a index.html
 *   - En el arreglo PRODUCTS de abajo, agreguen `image: '<archivo>.jpg'`
 *   - No hace falta tocar el CSS ni las animaciones.
 * -----------------------------------------------------------------------
 */

const PRODUCTS = [
  {
    emoji: '🍌',
    image: 'chifle-salado.jpg',
    title: 'Chifles fritos salados',
    desc: 'Plátano verde cortado fino, frito y salado al punto justo de crocante.'
  },
  {
    emoji: '🍯',
    image: 'chifle-dulce.jpg',
    title: 'Chifles dulces',
    desc: 'La misma receta de siempre, con un toque dulce para los que prefieren otro perfil de sabor.'
  },
  {
    emoji: '🥔',
    image: 'papas-hojuelas.jpg',
    title: 'Papas en hojuelas',
    desc: 'Hojuelas finas y crocantes, fritas en tandas cortas todos los días.'
  },
  {
    emoji: '🍠',
    image: 'camote.jpg',
    title: 'Camote frito',
    desc: 'Tiras de camote frito con el punto justo de dulzor natural.'
  },
  {
    emoji: '🌱',
    image: 'arvejita.jpg',
    title: 'Arveja frita salada',
    desc: 'Arvejita verde frita y salada, crocante de principio a fin.'
  },
  {
    emoji: '🫘',
    image: 'garbanzo.jpg',
    title: 'Garbanzo frito salado',
    desc: 'Garbanzo tostado y salado, un clásico para acompañar cualquier reunión.'
  },
  {
    emoji: '🥜',
    image: 'mani-frito.png',
    title: 'Maní frito salado',
    desc: 'Maní 100% peruano, frito y salado, calidad premium.'
  },
  {
    emoji: '🍇',
    image: 'mani-pasas.png',
    title: 'Maní con pasas',
    desc: 'Maní frito salado combinado con uvas pasas, calidad premium.'
  },
  {
    emoji: '🍬',
    image: 'mani-confitado.png',
    title: 'Maní confitado',
    desc: 'Maní con cobertura de caramelo y ajonjolí.'
  }
];

function renderProducts() {
  const track = document.getElementById('productsTrack');
  if (!track) return;

  track.innerHTML = PRODUCTS.map(p => `
    <div class="p-card">
      <span class="emoji">${p.emoji}</span>
      <div class="swatch" style="background-image:url('${p.image}');"></div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
    </div>
  `).join('');
}

/**
 * Carrusel de productos: autoplay cada 3s + controles manuales.
 * - Flechas prev/next y puntos indicadores.
 * - Botón de pausa (requisito de accesibilidad: WCAG 2.2.2 exige poder
 *   detener contenido que se mueve solo).
 * - Se pausa automáticamente con hover, foco de teclado o swipe táctil,
 *   y se reanuda al soltar (salvo que el usuario la haya pausado a propósito).
 * - Respeta prefers-reduced-motion: no autoavanza, pero los controles
 *   manuales siguen funcionando.
 */
function initProductsCarousel() {
  const viewport = document.querySelector('.carousel-viewport');
  const track = document.getElementById('productsTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const btnPrev = document.getElementById('carouselPrev');
  const btnNext = document.getElementById('carouselNext');
  const btnToggle = document.getElementById('carouselToggle');
  if (!track || !viewport) return;

  const AUTOPLAY_MS = 3000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = PRODUCTS.length;

  let index = 0;
  let autoplayId = null;
  let userPaused = false;

  dotsWrap.innerHTML = PRODUCTS.map((p, i) => `
    <button type="button" role="tab" aria-label="Ir a ${p.title}" data-index="${i}"></button>
  `).join('');
  const dots = Array.from(dotsWrap.children);

  function stepWidth() {
    const card = track.querySelector('.p-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function render() {
    track.style.transform = `translateX(-${index * stepWidth()}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function goTo(i) {
    index = (i + total) % total;
    render();
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function startAutoplay() {
    if (reduceMotion || userPaused) return;
    stopAutoplay();
    autoplayId = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    clearInterval(autoplayId);
    autoplayId = null;
  }

  function setUserPaused(paused) {
    userPaused = paused;
    btnToggle.setAttribute('aria-pressed', String(paused));
    btnToggle.setAttribute('aria-label', paused ? 'Reanudar reproducción automática' : 'Pausar reproducción automática');
    btnToggle.querySelector('span').textContent = paused ? '▶' : '⏸';
    paused ? stopAutoplay() : startAutoplay();
  }

  btnNext.addEventListener('click', () => { next(); startAutoplay(); });
  btnPrev.addEventListener('click', () => { prev(); startAutoplay(); });
  dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.index); startAutoplay(); }));
  btnToggle.addEventListener('click', () => setUserPaused(!userPaused));

  // Pausa mientras el mouse está encima o hay foco de teclado dentro
  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);
  viewport.addEventListener('focusin', stopAutoplay);
  viewport.addEventListener('focusout', startAutoplay);

  // Swipe táctil
  let startX = 0, dragging = false;
  viewport.addEventListener('touchstart', e => {
    dragging = true;
    startX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });
  viewport.addEventListener('touchend', e => {
    if (!dragging) return;
    const deltaX = e.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) > 40) { deltaX < 0 ? next() : prev(); }
    dragging = false;
    startAutoplay();
  });

  // Recalcular la posición si cambia el ancho de pantalla (responsive)
  window.addEventListener('resize', render);

  render();
  startAutoplay();
}

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    document.querySelectorAll('.stat .n').forEach(el => {
      el.innerText = el.dataset.count;
    });
    document.querySelectorAll('.story-line, .proc-step').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    return;
  }

  // ---- Hero entrance (un único momento orquestado al cargar) ----
  gsap.timeline()
    .from('.hero-badge', { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out' })
    .from('.hero-copy h1', { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5')
    .from('.hero-copy .lede', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
    .from('.hero-features li', { y: 16, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.4')
    .from('.hero-circle', { scale: 0.6, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.08 }, 0);

  gsap.utils.toArray('.hero-circle').forEach((el, i) => {
    gsap.to(el, {
      yPercent: i % 2 === 0 ? -18 : 12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  gsap.to('.hero-strip', { xPercent: -25, ease: 'none', repeat: -1, duration: 14 });

  // ---- "Quiénes somos": todo el bloque aparece junto al entrar, desaparece junto al salir ----
  const storyLines = gsap.utils.toArray('.story-line');
  if (storyLines.length) {
    gsap.to(storyLines, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.06,
      scrollTrigger: {
        trigger: '.story-pin',
        start: 'top 70%',
        end: 'bottom 30%',
        toggleActions: 'play reverse play reverse'
      }
    });
  }

  // ---- Proceso: línea de tiempo vertical que se dibuja con el scroll ----
  const steps = gsap.utils.toArray('.proc-step');
  if (steps.length) {
    const processTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.process-track',
        start: 'top 75%',
        end: 'bottom 55%',
        scrub: true
      }
    });
    processTl.to('#processFill', { height: '100%', ease: 'none' }, 0);
    steps.forEach((step, i) => {
      processTl.to(step, { opacity: 1, scale: 1, duration: 1, ease: 'none' }, i);
    });
  }

  // ---- Conteo de cifras al entrar en pantalla ----
  gsap.utils.toArray('.stat .n').forEach(el => {
    const target = +el.dataset.count;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          innerText: target,
          duration: 1.4,
          ease: 'power1.out',
          snap: { innerText: 1 },
          onUpdate: function () {
            el.innerText = Math.round(this.targets()[0].innerText);
          }
        });
      }
    });
  });

  // ---- Reveal genérico (solo para secciones sin animación dedicada) ----
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Recalcular medidas cuando cargan las fuentes (evita desfases de posición)
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initProductsCarousel();
  initAnimations();
});
