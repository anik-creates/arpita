/* ═══════════════════════════════════════════
   LOAD MESSAGES FROM JSON
   ═══════════════════════════════════════════ */
let MSG = {};

async function loadMessages() {
  try {
    const res = await fetch('messages.json');
    MSG = await res.json();
  } catch (e) {
    // Fallback defaults if JSON fails
    MSG = {
      name: "Arpita",
      heroPrelude: "A little something for",
      heroWish: "Happy Birthday! 🎉",
      heroMessage: "Wishing you the most wonderful birthday filled with love, joy, and all the beautiful things you deserve.",
      heroSign: "— With love ❤️",
      memoriesTitle: "Our Memories",
      memoriesSubtitle: "A few snapshots worth a thousand words",
      footerText: "Made with ❤️ just for you"
    };
  }

  // Inject content into DOM
  document.getElementById('hero-prelude').textContent = MSG.heroPrelude;
  const nameEl = document.getElementById('hero-name');
  // Split name: first word white, rest red (like portfolio reference)
  const parts = MSG.name.split(' ');
  if (parts.length > 1) {
    nameEl.innerHTML = `<span class="first">${parts[0]}</span> <span class="accent">${parts.slice(1).join(' ')}</span>`;
  } else {
    nameEl.innerHTML = `<span class="accent">${MSG.name}</span>`;
  }
  document.getElementById('hero-wish-title').textContent = MSG.heroWish;
  document.getElementById('hero-wish').textContent = MSG.heroMessage;
  document.getElementById('hero-sign').textContent = MSG.heroSign;
  document.getElementById('section-title').textContent = MSG.memoriesTitle;
  document.getElementById('section-subtitle').textContent = MSG.memoriesSubtitle;
  document.getElementById('footer-text').innerHTML = `<p>${MSG.footerText}</p>`;
}

loadMessages();

/* ═══════════════════════════════════════════
   VOLUME GATE — require max volume
   ═══════════════════════════════════════════ */
(() => {
  const overlay  = document.getElementById('entry-overlay');
  const slider   = document.getElementById('volume-slider');
  const status   = document.getElementById('volume-status');
  const btn      = document.getElementById('entry-btn');
  const music    = document.getElementById('bg-music');
  const main     = document.getElementById('main-content');

  const THRESHOLD = 95; // consider "full volume" at 95+

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value, 10);
    // Update slider track color
    slider.style.background = `linear-gradient(to right, #c0392b ${val}%, rgba(255,255,255,.08) ${val}%)`;

    if (val >= THRESHOLD) {
      status.textContent = '🔊 Volume is at maximum — you\'re ready!';
      status.classList.add('ready');
      btn.disabled = false;
      btn.classList.add('unlocked');
      btn.querySelector('.btn-lock').textContent = '🔓';
      btn.querySelector('.btn-text').textContent = 'Enter ✨';
    } else {
      status.textContent = `Volume: ${val}% — slide to 100% to unlock`;
      status.classList.remove('ready');
      btn.disabled = true;
      btn.classList.remove('unlocked');
      btn.querySelector('.btn-lock').textContent = '🔒';
      btn.querySelector('.btn-text').textContent = 'Turn volume to max to enter';
    }
  });

  // Trigger initial state
  slider.dispatchEvent(new Event('input'));

  btn.addEventListener('click', () => {
    if (btn.disabled) return;

    overlay.classList.add('fade-out');

    // Start music
    music.volume = 0;
    music.play().catch(() => {});
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.02, 0.6);
      music.volume = vol;
      if (vol >= 0.6) clearInterval(fadeIn);
    }, 50);

    // Show main content
    main.classList.remove('hidden');

    // Remove overlay after transition
    setTimeout(() => overlay.remove(), 900);
  });
})();

/* ═══════════════════════════════════════════
   MEMORY CAROUSEL
   ═══════════════════════════════════════════ */
(() => {
  const MEMORY_COUNT = 11;
  const AUTOPLAY_MS  = 4500;

  const track    = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('carousel-dots');

  // Build slides — no fallback placeholders; use real images only
  for (let i = 0; i < MEMORY_COUNT; i++) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    const img = document.createElement('img');
    img.src = `images/memory${i + 1}.jpg`;
    img.alt = `Memory ${i + 1}`;
    img.loading = i === 0 ? 'eager' : 'lazy';

    slide.appendChild(img);
    track.appendChild(slide);

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

  document.querySelector('.carousel-prev').addEventListener('click', () => { prev(); resetAuto(); });
  document.querySelector('.carousel-next').addEventListener('click', () => { next(); resetAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  function startAuto() { autoTimer = setInterval(next, AUTOPLAY_MS); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();

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
   FLOATING PARTICLES — Red & Gold dust
   ═══════════════════════════════════════════ */
(() => {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const COUNT = 50;

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
      this.r  = Math.random() * 2 + .4;
      this.vy = -(Math.random() * .3 + .08);
      this.vx = (Math.random() - .5) * .15;
      this.a  = Math.random() * .3 + .05;
      this.life = 0;
      this.maxLife = Math.random() * 600 + 300;
      // Alternate between red and gold particles
      this.isRed = Math.random() > 0.5;
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
      if (this.isRed) {
        ctx.fillStyle = `rgba(192, 57, 43, ${this.a * fade})`;
      } else {
        ctx.fillStyle = `rgba(201, 168, 76, ${this.a * fade * 0.7})`;
      }
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
