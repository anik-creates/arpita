/* ═══════════════════════════════════════════
   ENTRY OVERLAY  —  tap to start music
   ═══════════════════════════════════════════ */
(() => {
  const overlay = document.getElementById('entry-overlay');
  const music   = document.getElementById('bg-music');

  overlay.addEventListener('click', () => {
    overlay.classList.add('fade-out');
    music.volume = 0;
    music.play().catch(() => {});
    // Fade music in
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.02, 0.5);
      music.volume = vol;
      if (vol >= 0.5) clearInterval(fadeIn);
    }, 60);
    // Remove overlay from DOM after transition
    setTimeout(() => overlay.remove(), 900);
  }, { once: true });
})();

/* ═══════════════════════════════════════════
   MEMORY CAROUSEL
   ═══════════════════════════════════════════ */
(() => {
  const MEMORY_COUNT = 11;
  const AUTOPLAY_MS  = 4500;

  const fallbacks = [
    'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80',
    'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  ];

  const track = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('carousel-dots');

  // Build slides
  for (let i = 0; i < MEMORY_COUNT; i++) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    const img = document.createElement('img');
    img.src = `images/memory${i + 1}.jpg`;
    img.alt = `Memory ${i + 1}`;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.onerror = function () {
      this.onerror = null;
      this.src = fallbacks[i % fallbacks.length];
    };

    slide.appendChild(img);
    track.appendChild(slide);

    // Dot
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dotsWrap.appendChild(dot);
  }

  let current = 0;
  let autoTimer;
  const slides = track.querySelectorAll('.carousel-slide');
  const dots   = dotsWrap.querySelectorAll('.carousel-dot');

  function goTo(index) {
    current = ((index % MEMORY_COUNT) + MEMORY_COUNT) % MEMORY_COUNT;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Buttons
  document.querySelector('.carousel-prev').addEventListener('click', () => { prev(); resetAuto(); });
  document.querySelector('.carousel-next').addEventListener('click', () => { next(); resetAuto(); });

  // Dots click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  // Autoplay
  function startAuto() { autoTimer = setInterval(next, AUTOPLAY_MS); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();

  // Pause on hover / touch
  const container = document.querySelector('.carousel-container');
  container.addEventListener('mouseenter', () => clearInterval(autoTimer));
  container.addEventListener('mouseleave', startAuto);

  // Touch swipe
  let touchX = 0;
  container.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  container.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
      resetAuto();
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   FLOATING PARTICLES  (gold dust)
   ═══════════════════════════════════════════ */
(() => {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const COUNT = 45;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 2 + .5;
      this.vy = -(Math.random() * .35 + .1);
      this.vx = (Math.random() - .5) * .2;
      this.a  = Math.random() * .35 + .05;
      this.life = 0;
      this.maxLife = Math.random() * 600 + 300;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset(false);
    }
    draw() {
      const fade = 1 - (this.life / this.maxLife);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 76, ${this.a * fade})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();
