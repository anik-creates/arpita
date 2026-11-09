/* ═══════════════════════════════════════════════════════════
   CAKE PAGE LOGIC  —  MICROPHONE BLOW, CAKE CUTTING, QUIZ & LETTER
   ═══════════════════════════════════════════════════════════ */

let quizData = [];
let secretLetterData = {};
let candlesBlown = false;
let cakeSliced = false;
let userAnswers = {};

// Microphone audio stream
let audioStream = null;
let audioContext = null;
let analyser = null;
let micAnimationId = null;

/* ═══════════════════════════════════════════
   1. LOAD DATA FROM JSON
   ═══════════════════════════════════════════ */
async function loadCakeData() {
  try {
    const res = await fetch('messages.json?v=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      quizData = data.quiz || getDefaultQuiz();
      secretLetterData = data.secretMessage || getDefaultLetter();
    } else {
      quizData = getDefaultQuiz();
      secretLetterData = getDefaultLetter();
    }
  } catch (err) {
    quizData = getDefaultQuiz();
    secretLetterData = getDefaultLetter();
  }

  renderQuiz();
}

function getDefaultQuiz() {
  return [
    {
      id: 1,
      question: "Where did you meet Anik for the first time?",
      options: ["Chunkutia", "Rajendrapur", "Ramna", "Lalbag"],
      answer: "Chunkutia"
    },
    {
      id: 2,
      question: "What was the shirt color of your Hubby on your first meet?",
      options: ["White", "Black", "Ash", "Maroon"],
      answer: "White"
    },
    {
      id: 3,
      question: "Where did you have your first kiss?",
      options: ["Rajendrapur", "Lalbag", "Chunkutia", "Ramna"],
      answer: "Rajendrapur"
    }
  ];
}

function getDefaultLetter() {
  return {
    title: "A Secret Letter From Your Hubby ❤️",
    subtitle: "Only for my real Arpi • 13th November",
    content: "My Sweetest Arpi,\n\nHappy 20th Birthday, my love!\n\nFrom that very first day we met at Chunkutia with me in that white shirt, to that magical first kiss at Rajendrapur, every memory with you has been etched forever into my heart.\n\nYou look so breathtaking in that red and black sari, but even more beautiful is the warmth, laughter, and kindness you bring into my world every single day.\n\nThank you for choosing me, for believing in us, and for being my greatest blessing. On this milestone 20th birthday, I promise to hold your hand, stand by your side through every storm and sunshine, and love you more and more with each passing breath.\n\nForever & always yours,\nAnik (Your Hubby) ❤️"
  };
}

/* ═══════════════════════════════════════════
   2. MICROPHONE DETECTION & BLOW LOGIC
   ═══════════════════════════════════════════ */
async function initMicrophone() {
  const meterFill = document.getElementById('meter-fill');
  const meterText = document.getElementById('meter-text');
  const micIcon = document.getElementById('mic-icon');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (meterText) meterText.textContent = "Mic access unavailable • Use blow button";
    return;
  }

  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.3;

    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    if (micIcon) micIcon.classList.add('active');
    if (meterText) meterText.textContent = "Listening... Blow into microphone!";

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function checkBlow() {
      if (candlesBlown) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;

      // Update meter fill
      const percent = Math.min(100, Math.round((avg / 90) * 100));
      if (meterFill) meterFill.style.width = percent + '%';

      // High volume threshold for blowing (breath produces broad-band high energy)
      if (avg > 55 || percent > 65) {
        extinguishCandles();
        return;
      }

      micAnimationId = requestAnimationFrame(checkBlow);
    }

    checkBlow();

  } catch (err) {
    console.log("Microphone access denied or error:", err);
    if (meterText) meterText.textContent = "Microphone access optional • Tap blow button";
  }
}

function extinguishCandles() {
  if (candlesBlown) return;
  candlesBlown = true;

  // Stop mic
  if (micAnimationId) cancelAnimationFrame(micAnimationId);
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
  }

  // Extinguish each candle with smoke
  const candles = document.querySelectorAll('.candle');
  candles.forEach((c, idx) => {
    setTimeout(() => {
      c.classList.add('blown');
    }, idx * 120);
  });

  // Update instruction & reveal knife
  setTimeout(() => {
    const stepInd = document.getElementById('step-indicator');
    const title = document.getElementById('instruction-title');
    const desc = document.getElementById('instruction-desc');
    const meterWrap = document.getElementById('mic-meter-wrap');
    const blowBtn = document.getElementById('blow-fallback-btn');
    const knife = document.getElementById('cake-knife');

    if (stepInd) stepInd.textContent = "STEP 2 OF 3";
    if (title) title.textContent = "Candles Blown! Make a Wish! ✨";
    if (desc) desc.textContent = "Now take the chef's knife and cut your birthday cake!";
    if (meterWrap) meterWrap.style.display = 'none';
    if (blowBtn) blowBtn.style.display = 'none';

    if (knife) knife.classList.add('visible');

    triggerSparkles();
  }, 700);
}

/* ═══════════════════════════════════════════
   3. CAKE CUTTING INTERACTION
   ═══════════════════════════════════════════ */
function initCakeCutting() {
  const knife = document.getElementById('cake-knife');
  const cakeWrap = document.getElementById('heart-cake-wrap');

  function cutCake() {
    if (!candlesBlown || cakeSliced) return;
    cakeSliced = true;

    // Knife cutting animation
    if (knife) knife.classList.add('cutting');

    // Show cut line
    setTimeout(() => {
      const cutLine = document.getElementById('cake-cut-line');
      if (cutLine) cutLine.classList.add('sliced');

      triggerSparkles();
      showerHeartIcons();

      // Update instructions
      const stepInd = document.getElementById('step-indicator');
      const title = document.getElementById('instruction-title');
      const desc = document.getElementById('instruction-desc');
      const secretWrap = document.getElementById('secret-btn-wrap');

      if (stepInd) stepInd.textContent = "STEP 3 OF 3";
      if (title) title.textContent = "Cake Sliced! Happy 20th Birthday! 🍰";
      if (desc) desc.textContent = "Your Hubby has left you a secret birthday message below.";
      if (secretWrap) secretWrap.classList.add('visible');

    }, 600);
  }

  if (knife) knife.addEventListener('click', cutCake);
  if (cakeWrap) cakeWrap.addEventListener('click', () => {
    if (candlesBlown && !cakeSliced) cutCake();
  });

  // Fallback blow button
  const blowBtn = document.getElementById('blow-fallback-btn');
  if (blowBtn) {
    blowBtn.addEventListener('click', extinguishCandles);
  }
}

/* ═══════════════════════════════════════════
   4. ARPI VERIFICATION QUIZ & SECRET LETTER
   ═══════════════════════════════════════════ */
function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container || !quizData.length) return;

  container.innerHTML = '';
  userAnswers = {};

  quizData.forEach((q, idx) => {
    const item = document.createElement('div');
    item.className = 'quiz-item';
    item.id = `quiz-q-${q.id}`;

    const title = document.createElement('div');
    title.className = 'quiz-question';
    title.innerHTML = `<span class="q-num">0${idx + 1}.</span> <span>${q.question}</span>`;
    item.appendChild(title);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'quiz-options';

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = opt;

      btn.addEventListener('click', () => {
        // Select
        optionsWrap.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        userAnswers[q.id] = opt;
        item.classList.remove('wrong');

        checkQuizComplete();
      });

      optionsWrap.appendChild(btn);
    });

    item.appendChild(optionsWrap);
    container.appendChild(item);
  });
}

function checkQuizComplete() {
  const submitBtn = document.getElementById('quiz-submit-btn');
  const answeredCount = Object.keys(userAnswers).length;

  if (submitBtn) {
    submitBtn.disabled = answeredCount < quizData.length;
  }
}

function initQuizModal() {
  const openBtn = document.getElementById('open-secret-btn');
  const quizModal = document.getElementById('quiz-modal');
  const cancelBtn = document.getElementById('quiz-cancel-btn');
  const submitBtn = document.getElementById('quiz-submit-btn');
  const errorMsg = document.getElementById('quiz-error');
  const letterModal = document.getElementById('letter-modal');
  const letterCloseBtn = document.getElementById('letter-close-btn');

  // Open Quiz
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (quizModal) quizModal.classList.add('active');
    });
  }

  // Cancel Quiz
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (quizModal) quizModal.classList.remove('active');
    });
  }

  // Submit Quiz
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      let allCorrect = true;

      quizData.forEach(q => {
        const itemEl = document.getElementById(`quiz-q-${q.id}`);
        const userChoice = userAnswers[q.id];

        if (userChoice !== q.answer) {
          allCorrect = false;
          if (itemEl) itemEl.classList.add('wrong');
        } else {
          if (itemEl) itemEl.classList.add('correct');
        }
      });

      if (allCorrect) {
        if (errorMsg) errorMsg.textContent = '';
        if (quizModal) quizModal.classList.remove('active');

        // Reveal letter
        revealSecretLetter();
      } else {
        if (errorMsg) {
          errorMsg.textContent = "Oops! Impostor detected! Only my real Arpi knows these answers 🥰 Try again!";
        }
      }
    });
  }

  // Close Letter
  if (letterCloseBtn) {
    letterCloseBtn.addEventListener('click', () => {
      if (letterModal) letterModal.classList.remove('active');
    });
  }
}

function revealSecretLetter() {
  const letterModal = document.getElementById('letter-modal');
  const title = document.getElementById('letter-title');
  const subtitle = document.getElementById('letter-subtitle');
  const content = document.getElementById('letter-content');

  if (title) title.textContent = secretLetterData.title || "A Secret Letter From Your Hubby ❤️";
  if (subtitle) subtitle.textContent = secretLetterData.subtitle || "Only for my real Arpi • 13th November";
  if (content) content.textContent = secretLetterData.content || "";

  if (letterModal) {
    letterModal.classList.add('active');
    triggerSparkles();
    showerHeartIcons();
  }
}

/* ═══════════════════════════════════════════
   5. GLOBAL CLICK-ANYWHERE LOVE ICON EFFECT
   ═══════════════════════════════════════════ */
function spawnClickLoveIcon(x, y) {
  const count = 3 + Math.floor(Math.random() * 3);
  const hearts = [
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="#e03c31" stroke="#e03c31" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="#e67e22" stroke="#e67e22" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4757" stroke="#ff4757" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  ];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.position = 'fixed';
    el.style.zIndex = '99999';
    el.style.left = (x + (Math.random() - 0.5) * 30) + 'px';
    el.style.top = (y + (Math.random() - 0.5) * 20) + 'px';
    el.style.pointerEvents = 'none';
    el.style.filter = 'drop-shadow(0 0 6px rgba(224, 60, 49, 0.6))';
    el.style.transform = 'translate(-50%, -50%) scale(0.6)';
    el.style.opacity = '1';

    const duration = 1.2 + Math.random() * 0.8;
    const destX = (Math.random() - 0.5) * 80;
    const destY = -80 - Math.random() * 60;
    const rot = (Math.random() - 0.5) * 60;

    el.style.transition = `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1), opacity ${duration}s ease-out`;

    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.2) rotate(${rot}deg)`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), duration * 1000);
  }
}

function initGlobalClickLove() {
  window.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    spawnClickLoveIcon(e.clientX, e.clientY);
  });
}

/* ═══════════════════════════════════════════
   6. CELEBRATION SPARKS & HEARTS
   ═══════════════════════════════════════════ */
function triggerSparkles() {
  const colors = ['#e03c31', '#e67e22', '#ffffff', '#ffd166', '#ff4757'];
  const count = 60;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.zIndex = '99999';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-10px';
    el.style.width = (Math.random() * 8 + 4) + 'px';
    el.style.height = (Math.random() * 8 + 4) + 'px';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.borderRadius = '50%';
    el.style.pointerEvents = 'none';
    el.style.boxShadow = '0 0 10px ' + el.style.backgroundColor;

    const duration = Math.random() * 2.2 + 2;
    el.style.transition = `transform ${duration}s cubic-bezier(0.25, 1, 0.5, 1), top ${duration}s cubic-bezier(0.25, 1, 0.5, 1), opacity ${duration}s`;

    document.body.appendChild(el);

    setTimeout(() => {
      el.style.top = (window.innerHeight + 20) + 'px';
      el.style.transform = `translateX(${(Math.random() - 0.5) * 160}px) scale(0.3)`;
      el.style.opacity = '0';
    }, 20);

    setTimeout(() => el.remove(), duration * 1000);
  }
}

function showerHeartIcons() {
  const count = 25;
  for (let i = 0; i < count; i++) {
    const heartWrap = document.createElement('div');
    heartWrap.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="#e03c31" stroke="#e03c31" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    heartWrap.style.position = 'fixed';
    heartWrap.style.zIndex = '9999';
    heartWrap.style.left = Math.random() * 92 + 'vw';
    heartWrap.style.bottom = '-30px';
    heartWrap.style.pointerEvents = 'none';
    heartWrap.style.filter = 'drop-shadow(0 0 8px rgba(224, 60, 49, 0.5))';

    const duration = Math.random() * 2 + 2.5;
    heartWrap.style.transition = `all ${duration}s cubic-bezier(0.25, 1, 0.5, 1)`;

    document.body.appendChild(heartWrap);

    setTimeout(() => {
      heartWrap.style.bottom = (window.innerHeight + 50) + 'px';
      heartWrap.style.transform = `translateX(${(Math.random() - 0.5) * 90}px) scale(1.3) rotate(${(Math.random() - 0.5) * 40}deg)`;
      heartWrap.style.opacity = '0';
    }, 20);

    setTimeout(() => heartWrap.remove(), duration * 1000);
  }
}

/* ═══════════════════════════════════════════
   7. AMBIENT PARTICLES
   ═══════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const COUNT = 35;

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
   INITIALIZE CAKE EXPERIENCE
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadCakeData();
  initMicrophone();
  initCakeCutting();
  initQuizModal();
  initGlobalClickLove();
  initParticles();
});
