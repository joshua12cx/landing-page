/**
 * FRANCO'S — landing page
 * -----------------------------------------------------------------------
 * Estructura del archivo:
 *   1. Datos de productos (reemplazar acá cuando haya fotos reales)
 *   2. Render de productos en el DOM
 *   3. Animaciones GSAP (respetan prefers-reduced-motion)
 *
 * Para reemplazar un placeholder de producto por una foto real:
 *   - Súbanla a /assets/products/<archivo>.jpg
 *   - En el arreglo PRODUCTS de abajo, agreguen `image: 'assets/products/<archivo>.jpg'`
 *   - No hace falta tocar el CSS ni las animaciones.
 * -----------------------------------------------------------------------
 */

const PRODUCTS = [
  {
    emoji: '🍌',
    image: 'assets/products/chifle-salado.jpg',
    title: 'Chifles fritos salados',
    desc: 'Plátano verde cortado fino, frito y salado al punto justo de crocante.'
  },
  {
    emoji: '🍯',
    image: 'assets/products/chifle-dulce.jpg',
    title: 'Chifles dulces',
    desc: 'La misma receta de siempre, con un toque dulce para los que prefieren otro perfil de sabor.'
  },
  {
    emoji: '🥔',
    image: 'assets/products/papas-hojuelas.jpg',
    title: 'Papas en hojuelas',
    desc: 'Hojuelas finas y crocantes, fritas en tandas cortas todos los días.'
  },
  {
    emoji: '🍠',
    image: 'assets/products/camote.jpg',
    title: 'Camote frito',
    desc: 'Tiras de camote frito con el punto justo de dulzor natural.'
  },
  {
    emoji: '🌱',
    image: 'assets/products/arvejita.jpg',
    title: 'Arveja frita salada',
    desc: 'Arvejita verde frita y salada, crocante de principio a fin.'
  },
  {
    emoji: '🫘',
    image: 'assets/products/garbanzo.jpg',
    title: 'Garbanzo frito salado',
    desc: 'Garbanzo tostado y salado, un clásico para acompañar cualquier reunión.'
  },
  {
    emoji: '🥜',
    image: 'assets/products/mani-frito.png',
    title: 'Maní frito salado',
    desc: 'Maní 100% peruano, frito y salado, calidad premium.'
  },
  {
    emoji: '🍇',
    image: 'assets/products/mani-pasas.png',
    title: 'Maní con pasas',
    desc: 'Maní frito salado combinado con uvas pasas, calidad premium.'
  },
  {
    emoji: '🍬',
    image: 'assets/products/mani-confitado.png',
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

  // ---- "Quiénes somos": líneas que se iluminan en secuencia con el scroll ----
  const storyLines = gsap.utils.toArray('.story-line');
  if (storyLines.length) {
    const storyTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.story-pin',
        start: 'top top',
        end: () => '+=' + (storyLines.length * 55),
        scrub: true,
        pin: true
      }
    });
    storyLines.forEach((line, i) => {
      storyTl.to(line, { color: 'rgba(255,255,255,1)', duration: 1, ease: 'none' }, i);
      if (i > 0) {
        storyTl.to(storyLines[i - 1], { color: 'rgba(255,255,255,0.28)', duration: 1, ease: 'none' }, i);
      }
    });
  }

  // ---- Productos: scroll vertical -> desplazamiento horizontal pineado ----
  const track = document.getElementById('productsTrack');
  if (track) {
    const scrollDist = () => track.scrollWidth - window.innerWidth + window.innerWidth * 0.06;
    gsap.to(track, {
      x: () => -scrollDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.products-pin',
        start: 'top top',
        end: () => '+=' + scrollDist(),
        scrub: true,
        pin: true,
        invalidateOnRefresh: true
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
  initAnimations();
});
