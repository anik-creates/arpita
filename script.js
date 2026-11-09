/* ═══════════════════════════════════════════════════════════
   MODERN BIRTHDAY LOGIC  —  ARPITA'S BIRTHDAY
   ═══════════════════════════════════════════════════════════ */

// State
let isPlaying = false;
let audioCtx = null;
let synthInterval = null;

/* ═══════════════════════════════════════════
   1. LOAD MESSAGES FROM JSON
   ═══════════════════════════════════════════ */
async function loadMessages() {
  let data = {};
  try {
    const res = await fetch('messages.json?v=' + Date.now());
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    console.log('Using default messages fallback');
  }

  const defaults = {
    name: "Arpita",
    badgeText: "Special Day • Birthday Edition",
    greeting: "Dearest,",
    tagline: "The Most Beautiful Birthday Girl",
    heroWish: "Happy Birthday, Arpita! 🎂",
    heroMessage: "Today the world became brighter and infinitely more beautiful because you're in it. Your grace, that enchanting smile in your red and black sari, and your warmth touch everyone around you.\n\nMay this year unfold with endless happiness, breathtaking adventures, and all the love your heart can hold.\n\nHere's to celebrating you today and forever. 🥂",
    heroSign: "— With all my love ❤️",
    ctaButton: "Celebrate Arpita ✨",
    memoriesTitle: "Our Cherished Memories",
    memoriesSubtitle: "Every frame holds a moment I treasure forever",
    footerText: "Handcrafted with ❤️ exclusively for Arpita"
  };

  const M = Object.assign({}, defaults, data);

  // Bind to DOM
  const elBadge = document.getElementById('hero-badge');
  const elGreeting = document.getElementById('hero-greeting');
  const elName = document.getElementById('hero-name');
  const elWish = document.getElementById('hero-wish');
  const elMsg = document.getElementById('hero-message');
  const elSign = document.getElementById('hero-sign');
  const elCta = document.getElementById('cta-text');
  const elMemTitle = document.getElementById('memories-title');
  const elMemSub = document.getElementById('memories-subtitle');
  const elFooter = document.getElementById('footer-text');

  if (elBadge) elBadge.textContent = M.badgeText;
  if (elGreeting) elGreeting.textContent = M.greeting;
  if (elName) elName.textContent = M.name;
  if (elWish) elWish.textContent = M.heroWish;
  if (elMsg) elMsg.textContent = M.heroMessage;
  if (elSign) elSign.textContent = M.heroSign;
  if (elCta) elCta.textContent = M.ctaButton;
  if (elMemTitle) elMemTitle.textContent = M.memoriesTitle;
  if (elMemSub) elMemSub.textContent = M.memoriesSubtitle;
  if (elFooter) elFooter.textContent = M.footerText;

  // Typewriter effect on tagline
  initTypewriter(M.tagline || defaults.tagline);
}

function initTypewriter(text) {
  const el = document.getElementById('hero-tagline');
  if (!el) return;
  el.textContent = '';
  let i = 0;
  const speed = 65;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  setTimeout(type, 400);
}

/* ═══════════════════════════════════════════
   2. HIGH-FIDELITY WEB AUDIO SYNTHESIZER
   (Guarantees zero-lag birthday melody on any device)
   ═══════════════════════════════════════════ */
function playSynthMelody() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const notes = [
      { f: 261.63, d: 0.35, p: 0.4 }, // C4
      { f: 261.63, d: 0.15, p: 0.2 }, // C4
      { f: 293.66, d: 0.5,  p: 0.55 }, // D4
      { f: 261.63, d: 0.5,  p: 0.55 }, // C4
      { f: 349.23, d: 0.5,  p: 0.55 }, // F4
      { f: 329.63, d: 0.9,  p: 1.0 }, // E4

      { f: 261.63, d: 0.35, p: 0.4 }, // C4
      { f: 261.63, d: 0.15, p: 0.2 }, // C4
      { f: 293.66, d: 0.5,  p: 0.55 }, // D4
      { f: 261.63, d: 0.5,  p: 0.55 }, // C4
      { f: 392.00, d: 0.5,  p: 0.55 }, // G4
      { f: 349.23, d: 0.9,  p: 1.0 }, // F4

      { f: 261.63, d: 0.35, p: 0.4 }, // C4
      { f: 261.63, d: 0.15, p: 0.2 }, // C4
      { f: 523.25, d: 0.5,  p: 0.55 }, // C5
      { f: 440.00, d: 0.5,  p: 0.55 }, // A4
      { f: 349.23, d: 0.5,  p: 0.55 }, // F4
      { f: 329.63, d: 0.5,  p: 0.55 }, // E4
      { f: 293.66, d: 0.8,  p: 0.9 }, // D4

      { f: 466.16, d: 0.35, p: 0.4 }, // Bb4
      { f: 466.16, d: 0.15, p: 0.2 }, // Bb4
      { f: 440.00, d: 0.5,  p: 0.55 }, // A4
      { f: 349.23, d: 0.5,  p: 0.55 }, // F4
      { f: 392.00, d: 0.5,  p: 0.55 }, // G4
      { f: 349.23, d: 1.2,  p: 1.4 }  // F4
    ];

    let time = audioCtx.currentTime + 0.1;

    function scheduleSong() {
      notes.forEach(note => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Music-box bell overtone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, time);

        // Gentle bell envelope
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.3, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + note.d);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(time);
        osc.stop(time + note.d + 0.05);

        time += note.p;
      });
      time += 0.8; // pause between loops
    }

    scheduleSong();
    // Loop
    const totalDuration = notes.reduce((acc, n) => acc + n.p, 0) + 0.8;
    synthInterval = setInterval(() => {
      if (isPlaying) {
        scheduleSong();
      }
    }, totalDuration * 1000);

  } catch (e) {
    console.log('Synth error', e);
  }
}

function stopSynth() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
  if (audioCtx) {
    try { audioCtx.suspend(); } catch (e) {}
  }
}

/* ═══════════════════════════════════════════
   3. AUDIO CONTROLLER (DUAL MODE)
   ═══════════════════════════════════════════ */
function startMusic() {
  isPlaying = true;
  const audio = document.getElementById('bg-music');
  const pillWave = document.getElementById('music-wave');
  if (pillWave) pillWave.classList.add('playing');

  let audioPlayed = false;
  if (audio) {
    try {
      audio.volume = 0.5;
    } catch(e) {}

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audioPlayed = true;
        })
        .catch(err => {
          console.log('Audio file blocked or missing, using WebAudio synth chime');
          playSynthMelody();
        });
    }
  }

  // If audio element takes too long or fails, ensure synth plays
  setTimeout(() => {
    if (!audioPlayed && (!audio || audio.paused || audio.currentTime === 0)) {
      playSynthMelody();
    }
  }, 600);
}

function toggleMusic() {
  const audio = document.getElementById('bg-music');
  const pillWave = document.getElementById('music-wave');

  if (isPlaying) {
    isPlaying = false;
    if (audio) audio.pause();
    stopSynth();
    if (pillWave) pillWave.classList.remove('playing');
  } else {
    isPlaying = true;
    if (pillWave) pillWave.classList.add('playing');
    if (audio) {
      audio.play().catch(() => playSynthMelody());
    } else {
      playSynthMelody();
    }
  }
}

/* ═══════════════════════════════════════════
   4. VOLUME ENTRY GATE (FULL VOLUME REQUIREMENT)
   ═══════════════════════════════════════════ */
function initVolumeGate() {
  const overlay = document.getElementById('entry-overlay');
  const slider = document.getElementById('volume-slider');
  const readout = document.getElementById('vol-readout');
  const indicator = document.getElementById('volume-indicator');
  const btn = document.getElementById('entry-btn');
  const main = document.getElementById('main-content');

  if (!slider || !btn) return;

  function updateState() {
    const val = parseInt(slider.value, 10);
    readout.textContent = val + '%';

    // Slider track gradient
    slider.style.background = `linear-gradient(to right, #e03c31 ${val}%, rgba(255,255,255,0.1) ${val}%)`;

    if (val >= 100) {
      indicator.textContent = '✓ Volume Confirmed at 100% (Maximum)';
      indicator.classList.add('ready');
      btn.disabled = false;
      btn.classList.add('unlocked');
      btn.querySelector('.btn-icon').textContent = '🔓';
      btn.querySelector('.btn-text').textContent = 'Unlock The Celebration ✨';
    } else {
      indicator.textContent = `Slide to 100% to unlock (Currently ${val}%)`;
      indicator.classList.remove('ready');
      btn.disabled = true;
      btn.classList.remove('unlocked');
      btn.querySelector('.btn-icon').textContent = '🔒';
      btn.querySelector('.btn-text').textContent = 'Set Volume to 100% to Unlock';
    }
  }

  slider.addEventListener('input', updateState);
  updateState();

  btn.addEventListener('click', () => {
    if (btn.disabled) return;

    // Start music
    startMusic();

    // Fade out overlay
    overlay.classList.add('fade-out');
    main.classList.remove('content-hidden');

    // Confetti celebration
    triggerConfetti();

    setTimeout(() => {
      overlay.remove();
    }, 850);
  });
}

/* ═══════════════════════════════════════════
   5. MEMORY CAROUSEL (11 UNIQUE REAL PHOTOS)
   ═══════════════════════════════════════════ */
function initCarousel() {
  const TOTAL_SLIDES = 11;
  const AUTOPLAY_TIME = 4500;
  const track = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('carousel-dots');
  const counter = document.getElementById('meta-counter');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || !dotsWrap) return;

  // Render slides dynamically
  for (let i = 1; i <= TOTAL_SLIDES; i++) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide-item';

    const img = document.createElement('img');
    img.src = `images/memory${i}.jpg`;
    img.alt = `Cherished Memory ${i}`;
    img.loading = i <= 2 ? 'eager' : 'lazy';

    slide.appendChild(img);
    track.appendChild(slide);

    // Dot chip
    const dot = document.createElement('button');
    dot.className = 'carousel-dot-chip' + (i === 1 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i}`);
    dotsWrap.appendChild(dot);
  }

  let currentIndex = 0;
  let autoTimer = null;
  const dots = dotsWrap.querySelectorAll('.carousel-dot-chip');

  function updateSlide(idx) {
    currentIndex = ((idx % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    if (counter) {
      const padIndex = (currentIndex + 1).toString().padStart(2, '0');
      counter.textContent = `${padIndex} / ${TOTAL_SLIDES.toString().padStart(2, '0')}`;
    }
  }

  function nextSlide() { updateSlide(currentIndex + 1); }
  function prevSlide() { updateSlide(currentIndex - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(nextSlide, AUTOPLAY_TIME);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAuto(); });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateSlide(idx);
      startAuto();
    });
  });

  const frame = document.querySelector('.carousel-glass-frame');
  if (frame) {
    frame.addEventListener('mouseenter', stopAuto);
    frame.addEventListener('mouseleave', startAuto);

    // Touch support
    let startX = 0;
    frame.addEventListener('touchstart', e => {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });

    frame.addEventListener('touchend', e => {
      const deltaX = e.changedTouches[0].clientX - startX;
      if (Math.abs(deltaX) > 40) {
        if (deltaX < 0) nextSlide();
        else prevSlide();
        startAuto();
      }
    }, { passive: true });
  }

  updateSlide(0);
  startAuto();
}

/* ═══════════════════════════════════════════
   6. CELEBRATION CHIPS & CONFETTI
   ═══════════════════════════════════════════ */
function triggerConfetti() {
  const colors = ['#e03c31', '#e67e22', '#ffffff', '#ffd166', '#ff4757'];
  const count = 75;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-burst';
    el.style.position = 'fixed';
    el.style.zIndex = '99999';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-10px';
    el.style.width = (Math.random() * 8 + 6) + 'px';
    el.style.height = (Math.random() * 12 + 6) + 'px';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.borderRadius = '2px';
    el.style.pointerEvents = 'none';
    el.style.transform = `rotate(${Math.random() * 360}deg)`;

    const duration = Math.random() * 2.5 + 2;
    el.style.transition = `transform ${duration}s cubic-bezier(0.25, 1, 0.5, 1), top ${duration}s cubic-bezier(0.25, 1, 0.5, 1), opacity ${duration}s`;

    document.body.appendChild(el);

    setTimeout(() => {
      el.style.top = (window.innerHeight + 20) + 'px';
      el.style.transform = `rotate(${Math.random() * 720}deg) translateX(${(Math.random() - 0.5) * 150}px)`;
      el.style.opacity = '0';
    }, 20);

    setTimeout(() => el.remove(), duration * 1000);
  }
}

function showerHearts() {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.textContent = Math.random() > 0.4 ? '💖' : '❤️';
    heart.style.position = 'fixed';
    heart.style.zIndex = '9999';
    heart.style.left = Math.random() * 95 + 'vw';
    heart.style.bottom = '-20px';
    heart.style.fontSize = (Math.random() * 20 + 16) + 'px';
    heart.style.pointerEvents = 'none';
    heart.style.transition = `all ${Math.random() * 2 + 2.5}s cubic-bezier(0.25, 1, 0.5, 1)`;

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.style.bottom = (window.innerHeight + 50) + 'px';
      heart.style.transform = `translateX(${(Math.random() - 0.5) * 80}px) scale(1.3)`;
      heart.style.opacity = '0';
    }, 20);

    setTimeout(() => heart.remove(), 4500);
  }
}

function initChips() {
  const chipConfetti = document.getElementById('chip-confetti');
  const chipLove = document.getElementById('chip-love');
  const chipMusic = document.getElementById('chip-music');
  const chipMemories = document.getElementById('chip-memories');
  const ctaBtn = document.getElementById('cta-btn');
  const musicPill = document.getElementById('music-pill');

  if (chipConfetti) chipConfetti.addEventListener('click', triggerConfetti);
  if (chipLove) chipLove.addEventListener('click', showerHearts);
  if (chipMusic) chipMusic.addEventListener('click', toggleMusic);
  if (musicPill) musicPill.addEventListener('click', toggleMusic);

  if (chipMemories) {
    chipMemories.addEventListener('click', () => {
      const section = document.getElementById('memories');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      showerHearts();
      triggerConfetti();
      const section = document.getElementById('memories');
      if (section) {
        setTimeout(() => section.scrollIntoView({ behavior: 'smooth' }), 500);
      }
    });
  }
}

/* ═══════════════════════════════════════════
   7. AMBIENT PARTICLES (RED & GOLD DUST)
   ═══════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const COUNT = 45;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Ember {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 2 + 0.6;
      this.vy = -(Math.random() * 0.35 + 0.1);
      this.vx = (Math.random() - 0.5) * 0.2;
      this.alpha = Math.random() * 0.35 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 500 + 300;
      this.isRed = Math.random() > 0.45;
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
        ctx.fillStyle = `rgba(224, 60, 49, ${this.alpha * fade})`;
      } else {
        ctx.fillStyle = `rgba(230, 126, 34, ${this.alpha * fade * 0.8})`;
      }
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Ember());

  function render() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(render);
  }
  render();
}

/* ═══════════════════════════════════════════
   INITIALIZE EVERYTHING
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadMessages();
  initVolumeGate();
  initCarousel();
  initChips();
  initParticles();
});
