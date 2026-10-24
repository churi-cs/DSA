/* ==========================================================================
       STATE & CONTROLLERS
       ========================================================================== */
    let currentScene = 0;
    let isUnlocked = false;
    let candlesBlown = false;
    let micStream = null;
    let audioContext = null;
    let micAnalyser = null;
    let isMicActive = false;
    let balloonInterval = null;
    let memoryGalleryTimer = null;

    /* Safe Animation Helper (Works seamlessly with Anime.js v4 UMD and fallbacks) */
    function doAnimate(target, params) {
      if (window.anime && typeof window.anime.animate === 'function') {
        return window.anime.animate(target, params);
      } else if (typeof window.anime === 'function') {
        return window.anime({ targets: target, ...params });
      } else {
        // Fallback for offline/safe mode
        const elements = typeof target === 'string' ? document.querySelectorAll(target) : (Array.isArray(target) ? target : [target]);
        elements.forEach(el => {
          if (!el) return;
          if (params.opacity !== undefined) {
            el.style.opacity = Array.isArray(params.opacity) ? params.opacity[params.opacity.length - 1] : params.opacity;
          }
          if (params.transform !== undefined) el.style.transform = params.transform;
        });
        if (params.onComplete) setTimeout(params.onComplete, params.duration || 300);
        return null;
      }
    }

    /* Safe Stagger Helper */
    function getStagger(step) {
      if (window.anime && typeof window.anime.stagger === 'function') {
        return window.anime.stagger(step);
      }
      return (el, i) => i * step;
    }

    /* ==========================================================================
       SOUND SYSTEM (Web Audio API Synthesizer - No external files required)
       ========================================================================== */
    class SoundEngine {
      constructor() {
        this.ctx = null;
        this.muted = false;
        this.timeouts = [];
      }

      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      // Bubble / soft pop sound on taps
      playPop() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(450, t);
          osc.frequency.exponentialRampToValueAtTime(820, t + 0.08);
          gain.gain.setValueAtTime(0.14, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.09);
        } catch (e) {}
      }

      // Sparkle chime sound
      playSparkle() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          [880, 1108, 1320, 1760].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.045);
            gain.gain.setValueAtTime(0.09, t + idx * 0.045);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.045 + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t + idx * 0.045);
            osc.stop(t + idx * 0.045 + 0.29);
          });
        } catch (e) {}
      }

      // Heavy stamp thud
      playStampThud() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(32, t + 0.2);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.21);
        } catch (e) {}
      }

      // Heartbeat Lub-Dub sound
      playHeartbeat() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          // Lub
          const o1 = this.ctx.createOscillator();
          const g1 = this.ctx.createGain();
          o1.type = 'sine';
          o1.frequency.setValueAtTime(80, t);
          o1.frequency.exponentialRampToValueAtTime(45, t + 0.09);
          g1.gain.setValueAtTime(0.22, t);
          g1.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          o1.connect(g1);
          g1.connect(this.ctx.destination);
          o1.start(t);
          o1.stop(t + 0.1);

          // Dub
          const o2 = this.ctx.createOscillator();
          const g2 = this.ctx.createGain();
          o2.type = 'sine';
          o2.frequency.setValueAtTime(70, t + 0.13);
          o2.frequency.exponentialRampToValueAtTime(38, t + 0.24);
          g2.gain.setValueAtTime(0.18, t + 0.13);
          g2.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
          o2.connect(g2);
          g2.connect(this.ctx.destination);
          o2.start(t + 0.13);
          o2.stop(t + 0.25);
        } catch (e) {}
      }

      // Full Synthesized "Happy Birthday" Melody
      playHappyBirthday(onComplete) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.stopMelody();

        // Key of C: G4=392, A4=440, B4=493.88, C5=523.25, D5=587.33, E5=659.25, F5=698.46, G5=783.99
        const melody = [
          // Phrase 1: Hap-py Birth-day to you
          { f: 392.00, d: 0.32, p: 0.38 }, // Hap-
          { f: 392.00, d: 0.18, p: 0.22 }, // py
          { f: 440.00, d: 0.52, p: 0.58 }, // birth-
          { f: 392.00, d: 0.52, p: 0.58 }, // day
          { f: 523.25, d: 0.52, p: 0.58 }, // to
          { f: 493.88, d: 1.05, p: 1.15, chord: 392 }, // you

          // Phrase 2: Hap-py Birth-day to you
          { f: 392.00, d: 0.32, p: 0.38 },
          { f: 392.00, d: 0.18, p: 0.22 },
          { f: 440.00, d: 0.52, p: 0.58 },
          { f: 392.00, d: 0.52, p: 0.58 },
          { f: 587.33, d: 0.52, p: 0.58 },
          { f: 523.25, d: 1.05, p: 1.15, chord: 392 },

          // Phrase 3: Hap-py Birth-day dear Su-mu
          { f: 392.00, d: 0.32, p: 0.38 },
          { f: 392.00, d: 0.18, p: 0.22 },
          { f: 783.99, d: 0.52, p: 0.58 }, // birth- (G5)
          { f: 659.25, d: 0.52, p: 0.58 }, // day (E5)
          { f: 523.25, d: 0.52, p: 0.58 }, // dear (C5)
          { f: 493.88, d: 0.52, p: 0.58 }, // Su- (B4)
          { f: 440.00, d: 1.00, p: 1.10, chord: 349.23 }, // mu! (A4)

          // Phrase 4: Hap-py Birth-day to you
          { f: 698.46, d: 0.32, p: 0.38 }, // Hap- (F5)
          { f: 698.46, d: 0.18, p: 0.22 }, // py
          { f: 659.25, d: 0.52, p: 0.58 }, // birth- (E5)
          { f: 523.25, d: 0.52, p: 0.58 }, // day (C5)
          { f: 587.33, d: 0.52, p: 0.58 }, // to (D5)
          { f: 523.25, d: 1.40, p: 1.60, chord: 261.63 }  // you! (C5)
        ];

        let start = this.ctx.currentTime + 0.12;
        let cumulative = 0;

        melody.forEach((note) => {
          const noteTime = start + cumulative;
          if (note.f > 0) {
            // Music box shimmer voice: fundamental + gentle overtone
            const o1 = this.ctx.createOscillator();
            const o2 = this.ctx.createOscillator();
            const g = this.ctx.createGain();

            o1.type = 'sine';
            o1.frequency.setValueAtTime(note.f, noteTime);

            o2.type = 'triangle';
            o2.frequency.setValueAtTime(note.f * 2.002, noteTime);

            g.gain.setValueAtTime(0.0001, noteTime);
            g.gain.linearRampToValueAtTime(0.18, noteTime + 0.025);
            g.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.d);

            o1.connect(g);
            o2.connect(g);
            g.connect(this.ctx.destination);

            o1.start(noteTime);
            o1.stop(noteTime + note.d + 0.05);
            o2.start(noteTime);
            o2.stop(noteTime + note.d + 0.05);

            // Optional warm harmony chord note
            if (note.chord) {
              const oC = this.ctx.createOscillator();
              const gC = this.ctx.createGain();
              oC.type = 'sine';
              oC.frequency.setValueAtTime(note.chord, noteTime);
              gC.gain.setValueAtTime(0.0001, noteTime);
              gC.gain.linearRampToValueAtTime(0.09, noteTime + 0.03);
              gC.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.d);
              oC.connect(gC);
              gC.connect(this.ctx.destination);
              oC.start(noteTime);
              oC.stop(noteTime + note.d + 0.05);
            }
          }
          cumulative += note.p;
        });

        const totalMs = cumulative * 1000;
        const tid = setTimeout(() => {
          if (onComplete) onComplete();
        }, totalMs);
        this.timeouts.push(tid);
      }

      stopMelody() {
        this.timeouts.forEach(t => clearTimeout(t));
        this.timeouts = [];
      }
    }

    const sound = new SoundEngine();

    /* ==========================================================================
       CANVAS FX: CONFETTI & FIREWORKS ENGINE
       ========================================================================== */
    class ParticleEngine {
      constructor() {
        this.canvas = document.getElementById('fx-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.confetti = [];
        this.fireworks = [];
        this.sparkles = [];
        this.isRainingConfetti = false;
        this.colors = ['#ff7597', '#ff9ebb', '#a78bfa', '#c4b5fd', '#34d399', '#6ee7b7', '#fbbf24', '#fde68a', '#fb923c'];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
      }

      resize() {
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
      }

      burstConfetti(originX, originY, count = 45) {
        const x = originX !== undefined ? originX : this.width / 2;
        const y = originY !== undefined ? originY : this.height / 2;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 3;
          this.confetti.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.5,
            size: Math.random() * 7 + 5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 12,
            wobble: Math.random() * 10,
            wobbleSpeed: Math.random() * 0.1 + 0.05,
            gravity: 0.18,
            drag: 0.96,
            shape: Math.random() > 0.3 ? 'rect' : 'circle',
            alpha: 1,
            decay: Math.random() * 0.008 + 0.004
          });
        }
      }

      startConfettiRain() {
        this.isRainingConfetti = true;
      }
      stopConfettiRain() {
        this.isRainingConfetti = false;
      }

      spawnFirework() {
        const startX = Math.random() * (this.width * 0.8) + (this.width * 0.1);
        const targetY = Math.random() * (this.height * 0.4) + (this.height * 0.15);
        this.fireworks.push({
          x: startX,
          y: this.height + 10,
          targetY,
          vx: (Math.random() - 0.5) * 2,
          vy: -(Math.random() * 4 + 11),
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          exploded: false,
          trail: []
        });
      }

      explodeFirework(x, y, baseColor) {
        sound.playPop();
        const sparkCount = Math.floor(Math.random() * 30) + 45;
        for (let i = 0; i < sparkCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 1.5;
          this.sparkles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: Math.random() > 0.4 ? baseColor : this.colors[Math.floor(Math.random() * this.colors.length)],
            alpha: 1,
            decay: Math.random() * 0.015 + 0.012,
            gravity: 0.06,
            drag: 0.965,
            size: Math.random() * 2.8 + 1.2
          });
        }
      }

      loop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Continuous Confetti Rain
        if (this.isRainingConfetti && Math.random() < 0.35) {
          this.confetti.push({
            x: Math.random() * this.width,
            y: -10,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 2,
            size: Math.random() * 7 + 4,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 8,
            wobble: Math.random() * 10,
            wobbleSpeed: 0.06,
            gravity: 0.04,
            drag: 0.99,
            shape: Math.random() > 0.35 ? 'rect' : 'circle',
            alpha: 1,
            decay: 0.002
          });
        }

        // Draw Confetti
        for (let i = this.confetti.length - 1; i >= 0; i--) {
          const p = this.confetti[i];
          p.vx *= p.drag;
          p.vy = (p.vy + p.gravity) * p.drag;
          p.x += p.vx + Math.sin(p.wobble) * 1.2;
          p.y += p.vy;
          p.wobble += p.wobbleSpeed;
          p.rotation += p.rotSpeed;
          p.alpha -= p.decay;

          if (p.alpha <= 0 || p.y > this.height + 20) {
            this.confetti.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            const wobbleScale = Math.cos(p.wobble);
            this.ctx.fillRect(-p.size / 2, (-p.size * wobbleScale) / 2, p.size, p.size * wobbleScale);
          } else {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.restore();
        }

        // Update Fireworks Rockets
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
          const fw = this.fireworks[i];
          fw.x += fw.vx;
          fw.y += fw.vy;
          fw.vy += 0.08;

          // Rocket Trail
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(fw.x, fw.y, 2.5, 0, Math.PI * 2);
          this.ctx.fillStyle = fw.color;
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = fw.color;
          this.ctx.fill();
          this.ctx.restore();

          if (fw.vy >= -1 || fw.y <= fw.targetY) {
            this.explodeFirework(fw.x, fw.y, fw.color);
            this.fireworks.splice(i, 1);
          }
        }

        // Update Fireworks Sparks
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
          const s = this.sparkles[i];
          s.vx *= s.drag;
          s.vy = (s.vy + s.gravity) * s.drag;
          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= s.decay;

          if (s.alpha <= 0) {
            this.sparkles.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, s.alpha);
          this.ctx.beginPath();
          this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          this.ctx.fillStyle = s.color;
          this.ctx.shadowBlur = 6;
          this.ctx.shadowColor = s.color;
          this.ctx.fill();
          this.ctx.restore();
        }

        requestAnimationFrame(this.loop);
      }
    }

    const fx = new ParticleEngine();

    /* ==========================================================================
       HAPTIC VIBRATION HELPER
       ========================================================================== */
    function vibrateDevice(pattern) {
      if (navigator.vibrate) {
        try {
          navigator.vibrate(pattern);
        } catch (e) {}
      }
    }

    /* ==========================================================================
       DEVICE TILT & MOUSE PARALLAX
       ========================================================================== */
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        const tiltX = Math.max(-18, Math.min(18, e.gamma)) * 0.7;
        const tiltY = Math.max(-18, Math.min(18, e.beta - 45)) * 0.7;
        document.documentElement.style.setProperty('--tilt-x', `${tiltX}px`);
        document.documentElement.style.setProperty('--tilt-y', `${tiltY}px`);
      }
    });

    window.addEventListener('mousemove', (e) => {
      const xPct = (e.clientX / window.innerWidth) - 0.5;
      const yPct = (e.clientY / window.innerHeight) - 0.5;
      document.documentElement.style.setProperty('--tilt-x', `${xPct * 18}px`);
      document.documentElement.style.setProperty('--tilt-y', `${yPct * 18}px`);
    });

    /* ==========================================================================
       SCENE 0: COUNTDOWN GATE LOGIC
       ========================================================================== */
    const countdownGrid = document.getElementById('countdownGrid');
    const unlockCta = document.getElementById('unlockCta');
    const gateTitle = document.getElementById('gateTitle');
    const gateSubtitle = document.getElementById('gateSubtitle');
    const giftBox = document.getElementById('giftBox');
    const giftLid = document.getElementById('giftLid');
    const skipBtn = document.getElementById('skipCountdownBtn');
    const scene0TapHint = document.getElementById('scene0TapHint');

    function checkUnlockState() {
      const now = new Date();
      const hasOpenHash = window.location.hash.toLowerCase().includes('open');
      const timeRemaining = CONFIG.birthday.getTime() - now.getTime();

      if (timeRemaining <= 0 || hasOpenHash) {
        unlockBirthdayGate();
      } else {
        updateCountdownDisplay(timeRemaining);
      }
    }

    function updateCountdownDisplay(ms) {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      document.getElementById('cntDays').textContent = String(days).padStart(2, '0');
      document.getElementById('cntHours').textContent = String(hours).padStart(2, '0');
      document.getElementById('cntMins').textContent = String(mins).padStart(2, '0');
      document.getElementById('cntSecs').textContent = String(secs).padStart(2, '0');
    }

    function unlockBirthdayGate() {
      if (isUnlocked) return;
      isUnlocked = true;

      gateTitle.textContent = "Happy Birthday Sumu! 🎉";
      gateSubtitle.textContent = "A magical story is ready to unfold just for you...";
      countdownGrid.style.display = 'none';
      skipBtn.style.display = 'none';
      unlockCta.style.display = 'flex';
      scene0TapHint.style.visibility = 'visible';

      // Animate unlock reveal
      doAnimate('#unlockCta', {
        opacity: [0, 1],
        scale: [0.85, 1],
        duration: 600,
        ease: 'outBack(1.7)'
      });

      doAnimate('.gift-glow', {
        scale: [1, 1.4],
        opacity: [0.5, 0.9],
        duration: 800,
        alternate: true,
        loop: true
      });
    }

    // Countdown interval
    checkUnlockState();
    const countdownTimer = setInterval(() => {
      if (!isUnlocked) checkUnlockState();
    }, 1000);

    // Skip Button Handler
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.hash = 'open';
      unlockBirthdayGate();
      sound.playSparkle();
      fx.burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 25);
    });

    // Opening Gift Box triggers Scene 1
    function triggerOpenGift() {
      if (!isUnlocked) {
        // Subtle reminder shake if not unlocked yet
        doAnimate(giftBox, {
          rotate: [-4, 4, -4, 4, 0],
          duration: 400
        });
        vibrateDevice(40);
        return;
      }

      sound.playSparkle();
      vibrateDevice([50, 40, 80]);

      // Animate Lid Pop Off
      doAnimate(giftLid, {
        translateY: -90,
        rotate: -24,
        scale: 1.15,
        opacity: [1, 0],
        duration: 650,
        ease: 'outBack(1.4)'
      });

      // Burst confetti from the gift box
      const rect = giftBox.getBoundingClientRect();
      fx.burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 3, 50);

      setTimeout(() => {
        goToScene(1);
      }, 550);
    }

    giftBox.addEventListener('click', triggerOpenGift);
    document.getElementById('btnOpenGift').addEventListener('click', (e) => {
      e.stopPropagation();
      triggerOpenGift();
    });

    /* ==========================================================================
       SCENE 1: ANIMATED MEMORY RIBBON
       ========================================================================== */
    const memoryRibbon = document.getElementById('memoryRibbon');

    const photoMemoryEmojis = ['📸', '🌸', '🌷', '💗', '✨'];
    const photoMemoriesReady = fetch('assets/photos/memories.json', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : [])
      .then((photos) => {
        if (!Array.isArray(photos) || photos.length === 0) {
          return CONFIG.memories.filter((memory) => memory.img);
        }
        return photos.map((photo, idx) => ({
          e: photoMemoryEmojis[idx % photoMemoryEmojis.length],
          img: photo.src
        }));
      })
      .catch(() => CONFIG.memories.filter((memory) => memory.img));

    async function initScene1() {
      const memories = await photoMemoriesReady;
      if (memoryGalleryTimer) clearInterval(memoryGalleryTimer);
      memoryRibbon.innerHTML = '';
      document.querySelector('.memory-ribbon-copy').textContent =
        `A little photo wall made from ${memories.length} happy memories.`;

      const photosPerPage = 6;
      const pageCount = Math.ceil(memories.length / photosPerPage);
      let pageIndex = 0;

      const showPage = () => {
        const previousCards = Array.from(memoryRibbon.children);
        if (previousCards.length) {
          doAnimate(previousCards, {
            opacity: [1, 0],
            translateY: [0, -18],
            duration: 320,
            ease: 'inQuad'
          });
        }

        setTimeout(() => {
          memoryRibbon.innerHTML = '';
          const start = pageIndex * photosPerPage;
          const photoPage = memories.slice(start, start + photosPerPage);

          photoPage.forEach((memory, idx) => {
            const card = document.createElement('figure');
            const tilt = [-7, 4, -3, 6, -5, 3][idx];
            card.className = 'memory-ribbon-card';
            card.style.setProperty('--card-tilt', `${tilt}deg`);
            card.innerHTML = `
              <div class="memory-ribbon-image${memory.img ? ' has-photo' : ''}">
                ${memory.img
                  ? `<img src="${memory.img}" alt="A birthday memory" draggable="false">`
                  : `<span aria-hidden="true">${memory.e}</span>`}
              </div>
            `;
            memoryRibbon.appendChild(card);

            doAnimate(card, {
              opacity: [0, 1],
              translateY: [32, 0],
              scale: [0.9, 1],
              rotate: [tilt * 2, tilt],
              duration: 700,
              delay: idx * 85,
              ease: 'outBack(1.2)'
            });

            doAnimate(card, {
              translateY: [0, idx % 2 === 0 ? -7 : 7, 0],
              rotate: [tilt, tilt + (idx % 2 === 0 ? 1.5 : -1.5), tilt],
              duration: 3400 + idx * 140,
              delay: 800 + idx * 90,
              loop: true,
              ease: 'inOutSine'
            });
          });
        }, previousCards.length ? 340 : 0);
      };

      showPage();
      if (pageCount > 1) {
        memoryGalleryTimer = setInterval(() => {
          pageIndex = (pageIndex + 1) % pageCount;
          showPage();
        }, 5600);
      }

      sound.playSparkle();
      vibrateDevice(35);
    }

    /* ==========================================================================
       SCENE 2: NAME + AGE CELEBRATION
       ========================================================================== */
    const ageCounter = document.getElementById('ageCounter');
    const balloonsContainer = document.getElementById('balloonsContainer');

    function initScene2() {
      sound.playSparkle();
      vibrateDevice([40, 30, 40]);

      // 1. Pop letters of Sumu's name with elastic spring & stagger
      const letters = document.querySelectorAll('.letter-bubble');
      letters.forEach((el, idx) => {
        doAnimate(el, {
          scale: [0, 1],
          translateY: [60, 0],
          rotate: [-15 + idx * 8, 0],
          duration: 850,
          delay: 150 + idx * 120,
          ease: 'outElastic(1.2, 0.5)'
        });
      });

      // 2. Count-up Age
      const targetAge = (typeof CONFIG.age === 'number' && CONFIG.age > 0) ? CONFIG.age : 17;
      let currentVal = 0;
      const countDuration = 1400;
      const stepInterval = Math.max(25, Math.floor(countDuration / targetAge));

      const timer = setInterval(() => {
        currentVal++;
        ageCounter.textContent = currentVal;
        if (currentVal >= targetAge) {
          clearInterval(timer);
          // Explode celebratory confetti on age complete
          const rect = document.getElementById('ageBadgeCard').getBoundingClientRect();
          fx.burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
          sound.playSparkle();
          vibrateDevice([80, 50, 100]);
        }
      }, stepInterval);

      // 3. Continuously float rising balloons in background
      startBalloons();
    }

    function startBalloons() {
      if (balloonInterval) clearInterval(balloonInterval);
      balloonsContainer.innerHTML = '';

      const balloonColors = ['b-pink', 'b-lavender', 'b-mint', 'b-yellow', 'b-peach'];

      function spawnOneBalloon() {
        const b = document.createElement('div');
        const colorClass = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        b.className = `floating-balloon ${colorClass}`;
        const startX = Math.random() * 85 + 5;
        b.style.left = `${startX}%`;
        balloonsContainer.appendChild(b);

        doAnimate(b, {
          translateY: [0, -window.innerHeight - 150],
          translateX: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
          rotate: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 25],
          duration: Math.random() * 3000 + 5500,
          ease: 'linear',
          onComplete: () => {
            if (b.parentNode) b.parentNode.removeChild(b);
          }
        });
      }

      for (let i = 0; i < 4; i++) {
        setTimeout(spawnOneBalloon, i * 400);
      }
      balloonInterval = setInterval(spawnOneBalloon, 1600);
    }

    /* ==========================================================================
       SCENE 3: MEMORIES POLAROID GALLERY
       ========================================================================== */
    const memoriesStage = document.getElementById('memoriesStage');
    let currentMemoryIdx = 0;
    let isTypewriting = false;

    function initScene3() {
      currentMemoryIdx = 0;
      renderPolaroids();
    }

    function renderPolaroids() {
      memoriesStage.innerHTML = '';
      const memories = CONFIG.memories;
      const tilts = [-5, 4, -3, 6];

      memories.forEach((mem, idx) => {
        const card = document.createElement('div');
        card.className = 'polaroid-card';
        card.id = `polaroid-${idx}`;
        card.style.zIndex = memories.length - idx;
        const tilt = tilts[idx % tilts.length];

        card.innerHTML = `
          <div class="washi-tape"></div>
          <div class="photo-frame${mem.img ? ' has-img' : ''}">
            <span class="memory-index-badge">#${idx + 1} of ${memories.length}</span>
            ${mem.img
              ? `<img class="photo-img" src="${mem.img}" alt="" draggable="false">`
              : `<div class="photo-big-emoji">${mem.flower ? flowerSVG() : mem.e}</div>`}
          </div>
          <div class="polaroid-caption-box">
            <div class="remember-tag">Remember when…</div>
            <div class="typewriter-text" id="typewriter-${idx}"></div>
          </div>
        `;

        memoriesStage.appendChild(card);

        // Drop-in bounce animation
        doAnimate(card, {
          translateY: [-280, 0],
          rotate: [tilt * 2, tilt],
          scale: [0.8, 1],
          opacity: [0, 1],
          duration: 700,
          delay: idx * 120,
          ease: 'outBack(1.4)'
        });
      });

      // Trigger typewriter on top card
      typewriteCaption(0);
    }

    function typewriteCaption(idx) {
      if (idx >= CONFIG.memories.length) return;
      isTypewriting = true;
      const targetEl = document.getElementById(`typewriter-${idx}`);
      if (!targetEl) return;

      if (CONFIG.memories[idx].flower) bloomFlower(document.getElementById(`polaroid-${idx}`));
      const fullText = CONFIG.memories[idx].c;
      targetEl.innerHTML = '<span class="typing-cursor"></span>';
      let charIdx = 0;

      function typeNext() {
        if (charIdx < fullText.length) {
          charIdx++;
          targetEl.textContent = fullText.slice(0, charIdx);
          const cursor = document.createElement('span');
          cursor.className = 'typing-cursor';
          targetEl.appendChild(cursor);
          setTimeout(typeNext, 45);
        } else {
          isTypewriting = false;
        }
      }
      typeNext();
    }

    function advanceMemoryCard() {
      if (currentMemoryIdx < CONFIG.memories.length - 1) {
        const topCard = document.getElementById(`polaroid-${currentMemoryIdx}`);
        if (topCard) {
          sound.playPop();
          vibrateDevice(35);
          // Alternate the throw direction so the stack feels playful:
          // card 1 exits left, card 2 exits right, and so on.
          const exitDirection = currentMemoryIdx % 2 === 0 ? -1 : 1;
          doAnimate(topCard, {
            translateX: [0, exitDirection * 320],
            translateY: [0, -60],
            rotate: [4 * exitDirection, 35 * exitDirection],
            opacity: [1, 0],
            duration: 500,
            ease: 'inOutQuad',
            onComplete: () => {
              topCard.style.display = 'none';
            }
          });
        }
        currentMemoryIdx++;
        typewriteCaption(currentMemoryIdx);
      } else {
        // Last memory reached, advance to next scene
        sound.playSparkle();
        goToScene(4);
      }
    }

    /* ==========================================================================
       SCENE 4: FUTURE DOCTOR (ECG, BEATING HEART & PRESCRIPTION)
       ========================================================================== */
    const ecgPath = document.getElementById('ecgPath');
    const beatingHeart = document.getElementById('beatingHeart');
    const drStamp = document.getElementById('drStamp');
    const rxCard = document.getElementById('rxCard');
    let heartInterval = null;

    function initScene4() {
      // 1. Reset SVG Path strokeDashoffset
      const pathLength = ecgPath.getTotalLength();
      ecgPath.style.strokeDasharray = pathLength;
      ecgPath.style.strokeDashoffset = pathLength;
      beatingHeart.classList.remove('beating');
      drStamp.style.opacity = '0';
      drStamp.style.transform = 'rotate(-12deg) scale(0)';

      // 2. Draw ECG Line using Anime.js
      doAnimate(ecgPath, {
        strokeDashoffset: [pathLength, 0],
        duration: 1600,
        ease: 'easeInOutSine',
        onComplete: () => {
          // ECG completes and connects to beating heart!
          beatingHeart.classList.add('beating');
          sound.playHeartbeat();
          vibrateDevice([40, 25, 40]);

          if (heartInterval) clearInterval(heartInterval);
          heartInterval = setInterval(() => {
            if (currentScene === 4) {
              sound.playHeartbeat();
            } else {
              clearInterval(heartInterval);
            }
          }, 1100);

          // 3. Slide in Prescription Card
          doAnimate(rxCard, {
            translateY: [35, 0],
            opacity: [0, 1],
            scale: [0.94, 1],
            duration: 650,
            delay: 150,
            ease: 'outBack(1.2)',
            onComplete: () => {
              // 4. Rubber Stamp Slams down with explosive bounce & haptic feedback
              setTimeout(() => {
                sound.playStampThud();
                vibrateDevice([70, 40, 110]);
                fx.burstConfetti(window.innerWidth / 2, window.innerHeight * 0.65, 30);

                doAnimate(drStamp, {
                  scale: [3.5, 1],
                  opacity: [0, 1],
                  rotate: [-35, -12],
                  duration: 480,
                  ease: 'outElastic(1.1, 0.45)'
                });
              }, 450);
            }
          });
        }
      });
    }

    /* ==========================================================================
       SECTION 6: BIRTHDAY WISH, BREATH DETECTION & CAKE CUT
       ========================================================================== */
    const cakeStage = document.getElementById('cakeStage');
    const letterModal = document.getElementById('letterModal');
    const letterText = document.getElementById('letterText');
    const micStatusText = document.getElementById('micStatusText');
    const micStatusBox = document.getElementById('micStatusBox');
    const micWaveWrap = document.getElementById('micWaveWrap');
    const micToggleBtn = document.getElementById('micToggleBtn');
    const manualBlowBtn = document.getElementById('manualBlowBtn');
    const cutCakeBtn = document.getElementById('cutCakeBtn');
    const wishInstruction = document.getElementById('wishInstruction');
    const scene5TapHint = document.getElementById('scene5TapHint');
    const giftChatList = document.getElementById('giftChatList');
    const giftMoodAvatar = document.getElementById('giftMoodAvatar');
    const giftContinueBtn = document.getElementById('giftContinueBtn');
    const giftScene = document.getElementById('scene-6');
    const giftChatCard = document.querySelector('.gift-chat-card');
    const giftChatName = document.getElementById('giftChatName');
    const giftChatStatus = document.getElementById('giftChatStatus');
    const birthdayGiftCard = document.getElementById('birthdayGiftCard');
    const birthdayGiftArt = document.getElementById('birthdayGiftArt');
    const birthdayGiftMessage = document.getElementById('birthdayGiftMessage');
    const giftClaimCode = document.getElementById('giftClaimCode');
    const claimGiftBtn = document.getElementById('claimGiftBtn');
    let cakeSliced = false;
    let micRequestPending = false;
    let finaleTimers = [];
    let giftChatTimer = null;
    let giftChatIndex = 0;
    let giftRevealDone = false;
    let giftRevealPlayed = false;
    let giftClaimed = false;

    function scheduleFinaleTimer(callback, delay) {
      const timer = setTimeout(() => {
        finaleTimers = finaleTimers.filter(id => id !== timer);
        callback();
      }, delay);
      finaleTimers.push(timer);
      return timer;
    }

    function clearFinaleTimers() {
      finaleTimers.forEach(clearTimeout);
      finaleTimers = [];
    }

    function stopMicBlow() {
      isMicActive = false;
      micWaveWrap.classList.remove('is-live');
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
      audioContext = null;
      micAnalyser = null;
    }

    function giftUsesReducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function setGiftChatStatus(status) {
      if (giftChatStatus) giftChatStatus.textContent = status;
    }

    function setGiftMood(emoji) {
      if (!giftMoodAvatar) return;
      giftMoodAvatar.textContent = emoji;
      giftMoodAvatar.classList.toggle('is-happy', emoji === '😍');
      if (!giftUsesReducedMotion()) {
        doAnimate(giftMoodAvatar, {
          scale: [0.72, 1.14, 1],
          rotate: [-10, 7, 0],
          duration: 500,
          ease: 'outBack(1.5)'
        });
      }
    }

    function openGiftReveal() {
      if (giftRevealPlayed) return;
      giftRevealPlayed = true;
      setGiftMood('😍');
      sound.playSparkle();
      vibrateDevice([70, 40, 110]);
      if (typeof fx !== 'undefined' && fx && typeof fx.spawnFirework === 'function') {
        fx.spawnFirework();
      }
    }

    function renderGiftBubble(message) {
      if (!giftChatList) return;
      const row = document.createElement('div');
      const who = message.who || 'You';
      const isMine = who === 'You';
      const effectClass = message.effect ? `gift-${message.effect}` : 'gift-bubble';
      row.className = `gift-chat-row ${isMine ? 'is-me' : 'is-them'}`;

      if (message.effect === 'typing') {
        row.innerHTML = `
          <div class="gift-bubble gift-typing">
            <span></span><span></span><span></span>
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="gift-bubble-shell">
            <span class="gift-role">${who}</span>
            <div class="gift-bubble ${effectClass}">${message.text}</div>
          </div>
        `;
      }

      giftChatList.appendChild(row);
      giftChatList.scrollTop = giftChatList.scrollHeight;

      if (!giftUsesReducedMotion()) {
        doAnimate(row, {
          opacity: [0, 1],
          translateY: [16, 0],
          scale: [0.84, 1],
          duration: 440,
          ease: 'outBack(1.25)'
        });
      }

      const bubble = row.querySelector('.gift-bubble');
      switch (message.effect) {
        case 'typing':
          setGiftChatStatus((CONFIG.gift && CONFIG.gift.typingStatus) || 'typing…');
          break;
        case 'anger':
          setGiftMood('😤');
          if (bubble) {
            bubble.classList.add('gift-bubble--anger');
            bubble.insertAdjacentHTML('beforeend', '<span class="gift-steam gift-steam-one"></span><span class="gift-steam gift-steam-two"></span>');
          }
          vibrateDevice(30);
          break;
        case 'rage':
          setGiftMood('😡');
          if (bubble) {
            bubble.classList.add('gift-bubble--rage');
            bubble.insertAdjacentHTML('beforeend', '<span class="gift-speed-lines" aria-hidden="true"></span>');
          }
          if (!giftUsesReducedMotion() && giftChatCard) doAnimate(giftChatCard, { translateX: [0, -7, 7, -5, 5, 0], duration: 440 });
          vibrateDevice([35, 20, 45]);
          break;
        case 'seen':
          setGiftMood('🤨');
          if (bubble) bubble.insertAdjacentHTML('beforeend', '<span class="gift-seen">Seen 👀</span>');
          break;
        case 'sweat':
          setGiftMood('🤨');
          if (bubble) bubble.insertAdjacentHTML('beforeend', '<span class="gift-sweat" aria-hidden="true">💧</span>');
          break;
        case 'shake':
          setGiftMood('😡');
          if (bubble) bubble.classList.add('gift-bubble--shake');
          if (!giftUsesReducedMotion() && giftChatCard) doAnimate(giftChatCard, { translateX: [0, -9, 9, -7, 7, 0], duration: 520 });
          vibrateDevice([50, 25, 50]);
          break;
        case 'soft':
          setGiftMood('🥺');
          break;
        case 'countdown':
          if (bubble) bubble.classList.add('gift-bubble--countdown');
          break;
        case 'reveal':
          if (bubble) bubble.classList.add('gift-bubble--reveal');
          openGiftReveal();
          break;
        case 'happy':
          setGiftMood('😍');
          break;
      }
    }

    function revealGiftScene() {
      if (giftRevealDone) return;
      giftRevealDone = true;
      openGiftReveal();
      if (giftScene) giftScene.classList.add('gift-card-revealed');
      if (giftChatCard) giftChatCard.classList.add('gift-card-mode');
      if (birthdayGiftCard) {
        birthdayGiftCard.hidden = false;
        if (!giftUsesReducedMotion()) {
          doAnimate(birthdayGiftCard, {
            opacity: [0, 1],
            translateY: [24, 0],
            scale: [0.9, 1],
            duration: 650,
            ease: 'outBack(1.25)'
          });
        }
      }
      if (giftContinueBtn) giftContinueBtn.hidden = true;
      setGiftChatStatus((CONFIG.gift && CONFIG.gift.readyStatus) || 'online');
      if (window.setGiftSceneActionsVisible) window.setGiftSceneActionsVisible(true);
    }

    function playGiftChat() {
      const messages = (CONFIG.gift && CONFIG.gift.messages) || [];
      if (!messages.length) {
        revealGiftScene();
        return;
      }
      const message = messages[giftChatIndex];
      if (!message) {
        revealGiftScene();
        return;
      }
      if (message.effect !== 'typing') {
        setGiftChatStatus((CONFIG.gift && CONFIG.gift.readyStatus) || 'online');
      }
      renderGiftBubble(message);

      const delay = message.effect === 'typing' ? 820 : message.effect === 'countdown' ? 880 : 1180;
      giftChatTimer = setTimeout(() => {
        if (giftChatIndex >= messages.length - 1) {
          revealGiftScene();
          return;
        }
        giftChatIndex += 1;
        playGiftChat();
      }, delay);
    }

    function fastForwardGiftChat() {
      if (giftRevealDone) return;
      if (giftChatTimer) clearTimeout(giftChatTimer);
      const messages = (CONFIG.gift && CONFIG.gift.messages) || [];
      for (let idx = giftChatIndex + 1; idx < messages.length; idx++) {
        renderGiftBubble(messages[idx]);
      }
      giftChatIndex = messages.length;
      revealGiftScene();
    }

    function initScene6() {
      if (giftChatTimer) clearTimeout(giftChatTimer);
      giftChatIndex = 0;
      giftRevealDone = false;
      giftRevealPlayed = false;
      giftClaimed = false;
      if (giftChatList) giftChatList.innerHTML = '';
      if (giftChatName) giftChatName.textContent = (CONFIG.gift && CONFIG.gift.chatName) || 'Sumu';
      setGiftChatStatus((CONFIG.gift && CONFIG.gift.readyStatus) || 'online');
      if (giftMoodAvatar) {
        giftMoodAvatar.textContent = '😡';
        giftMoodAvatar.classList.remove('is-happy');
      }
      if (giftContinueBtn) giftContinueBtn.hidden = true;
      if (giftContinueBtn) giftContinueBtn.textContent = (CONFIG.gift && CONFIG.gift.continueLabel) || 'Relive the magic ↺';
      if (giftScene) giftScene.classList.remove('gift-card-revealed');
      if (giftChatCard) giftChatCard.classList.remove('gift-card-mode');
      const card = (CONFIG.gift && CONFIG.gift.card) || {};
      if (birthdayGiftCard) birthdayGiftCard.hidden = true;
      if (birthdayGiftArt) birthdayGiftArt.src = card.artworkPath || 'assets/gifts/birthday-gift-card-v2.jpeg';
      if (birthdayGiftMessage) birthdayGiftMessage.textContent = card.message || 'A little something chosen just for you. I hope it makes your birthday feel even more beautiful. 💗';
      if (giftClaimCode) giftClaimCode.textContent = card.claimCode || 'Gift code will be added privately';
      if (claimGiftBtn) {
        claimGiftBtn.disabled = !card.claimCode;
        claimGiftBtn.textContent = card.claimCode
          ? card.claimLabel || 'Claim & copy gift code ✨'
          : 'Gift code will be added privately';
      }
      if (window.setGiftSceneActionsVisible) window.setGiftSceneActionsVisible(false);
      playGiftChat();
    }

    function initScene5() {
      stopMicBlow();
      clearFinaleTimers();
      candlesBlown = false;
      cakeSliced = false;
      letterModal.classList.remove('open');
      scene5TapHint.style.display = 'flex';
      cakeStage.classList.remove('is-blowing', 'is-cutting', 'is-cut');
      document.querySelectorAll('.candle').forEach(candle => candle.classList.remove('is-out'));
      micStatusBox.classList.remove('is-success');
      micToggleBtn.disabled = false;
      micToggleBtn.textContent = '🎙️ Enable microphone';
      micToggleBtn.setAttribute('aria-pressed', 'false');
      manualBlowBtn.hidden = true;
      cutCakeBtn.hidden = true;
      cutCakeBtn.disabled = false;
      wishInstruction.textContent = 'Take a breath, then blow gently toward the candles.';
      micStatusText.textContent = 'Enable your microphone, then blow gently to make a wish.';
      letterText.textContent = CONFIG.letter;
    }

    async function toggleMicBlow() {
      if (micRequestPending || candlesBlown) return;
      if (isMicActive) {
        stopMicBlow();
        micToggleBtn.textContent = '🎙️ Enable microphone';
        micToggleBtn.setAttribute('aria-pressed', 'false');
        micStatusText.textContent = 'Microphone paused. Enable it whenever you are ready.';
        return;
      }

      micRequestPending = true;
      micToggleBtn.disabled = true;
      micStatusText.textContent = 'Waiting for microphone permission…';
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('microphone-unavailable');
        }
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error('audio-unavailable');

        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        if (currentScene !== 5) {
          stopMicBlow();
          return;
        }

        audioContext = new AudioContextClass();
        await audioContext.resume();
        micAnalyser = audioContext.createAnalyser();
        micAnalyser.fftSize = 2048;
        micAnalyser.smoothingTimeConstant = 0.25;
        audioContext.createMediaStreamSource(micStream).connect(micAnalyser);
        isMicActive = true;
        manualBlowBtn.hidden = true;
        micToggleBtn.disabled = false;
        micToggleBtn.textContent = '⏸ Pause microphone';
        micToggleBtn.setAttribute('aria-pressed', 'true');
        micWaveWrap.classList.add('is-live');
        micStatusText.textContent = 'Mic is ready. Blow gently toward your screen.';

        const timeData = new Uint8Array(micAnalyser.fftSize);
        const frequencyData = new Uint8Array(micAnalyser.frequencyBinCount);
        const binWidth = audioContext.sampleRate / micAnalyser.fftSize;
        const lowStart = Math.max(1, Math.floor(100 / binWidth));
        const splitBin = Math.max(lowStart + 1, Math.floor(1200 / binWidth));
        const highEnd = Math.min(frequencyData.length, Math.floor(7000 / binWidth));
        let noiseFloor = 0.012;
        let breathFrames = 0;

        function listenForBreath() {
          if (!isMicActive || candlesBlown || currentScene !== 5) return;
          micAnalyser.getByteTimeDomainData(timeData);
          micAnalyser.getByteFrequencyData(frequencyData);

          let squareSum = 0;
          let crossings = 0;
          for (let i = 0; i < timeData.length; i++) {
            const sample = (timeData[i] - 128) / 128;
            squareSum += sample * sample;
            if (i > 0 && (timeData[i - 1] - 128) * (timeData[i] - 128) < 0) crossings++;
          }
          const rms = Math.sqrt(squareSum / timeData.length);
          let lowEnergy = 0;
          let highEnergy = 0;
          for (let i = lowStart; i < splitBin; i++) lowEnergy += frequencyData[i] * frequencyData[i];
          for (let i = splitBin; i < highEnd; i++) highEnergy += frequencyData[i] * frequencyData[i];
          const totalEnergy = lowEnergy + highEnergy || 1;
          const airyShare = highEnergy / totalEnergy;
          const volumeLimit = Math.min(0.4, Math.max(0.03, noiseFloor * 2.6));
          const soundsLikeAir = rms > volumeLimit && rms < 0.38 && airyShare > 0.2 && airyShare < 0.96 && crossings > 18;

          const meterLevel = Math.min(18, 4 + rms * 105);
          ['wb1', 'wb2', 'wb3', 'wb4'].forEach((id, index) => {
            document.getElementById(id).style.height = `${Math.max(4, meterLevel * (index % 2 ? 0.82 : 1))}px`;
          });

          if (soundsLikeAir) {
            breathFrames++;
            cakeStage.classList.add('is-blowing');
            micStatusText.textContent = breathFrames > 3 ? 'I can feel the breeze — keep blowing!' : 'Listening for your birthday blow…';
          } else {
            if (rms < 0.07) noiseFloor = Math.max(0.006, Math.min(0.08, noiseFloor * 0.96 + rms * 0.04));
            breathFrames = Math.max(0, breathFrames - 2);
            if (breathFrames === 0) {
              cakeStage.classList.remove('is-blowing');
              micStatusText.textContent = 'Mic is ready. Blow gently toward your screen.';
            }
          }

          if (breathFrames >= 9) {
            extinguishCandles();
            return;
          }
          requestAnimationFrame(listenForBreath);
        }
        requestAnimationFrame(listenForBreath);
      } catch (error) {
        stopMicBlow();
        micToggleBtn.disabled = false;
        micToggleBtn.textContent = 'Try microphone again';
        micToggleBtn.setAttribute('aria-pressed', 'false');
        manualBlowBtn.hidden = false;
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          micStatusText.textContent = 'Microphone access was blocked. Allow it in your browser, or use the candle button.';
        } else {
          micStatusText.textContent = 'Microphone is unavailable here. Use the candle button to continue.';
        }
      } finally {
        micRequestPending = false;
        if (!isMicActive) micToggleBtn.disabled = false;
      }
    }

    function extinguishCandles() {
      if (candlesBlown) return;
      candlesBlown = true;
      stopMicBlow();
      micToggleBtn.disabled = true;
      manualBlowBtn.hidden = true;
      cakeStage.classList.add('is-blowing');
      scene5TapHint.style.display = 'none';
      wishInstruction.textContent = 'Your birthday wish is in the air.';
      micStatusText.textContent = 'One by one, your candles are going out…';
      vibrateDevice([45, 35, 75]);

      const candles = [...document.querySelectorAll('.candle')];
      candles.forEach((candle, index) => {
        scheduleFinaleTimer(() => {
          candle.classList.add('is-out');
          sound.playPop();
          if (index === candles.length - 1) {
            cakeStage.classList.remove('is-blowing');
            micStatusBox.classList.add('is-success');
            micStatusText.textContent = '✨ Wish granted! Now cut your birthday cake.';
            wishInstruction.textContent = 'All five candles are out. Your wish is yours.';
            cutCakeBtn.hidden = false;
            fx.startConfettiRain();
            fx.spawnFirework();
            scheduleFinaleTimer(() => fx.spawnFirework(), 450);
            scheduleFinaleTimer(() => fx.spawnFirework(), 950);
            sound.playHappyBirthday();
            vibrateDevice([70, 45, 110]);
          }
        }, 220 + index * 175);
      });
    }

    function cutBirthdayCake() {
      if (!candlesBlown || cakeSliced) return;
      cakeSliced = true;
      cutCakeBtn.disabled = true;
      cutCakeBtn.textContent = '✨ Serving your slice…';
      cakeStage.classList.add('is-cutting');
      scheduleFinaleTimer(() => {
        cakeStage.classList.remove('is-cutting');
        cakeStage.classList.add('is-cut');
        cutCakeBtn.textContent = '✨ Cake is served';
        micStatusText.textContent = 'A sweet slice, just for you. Happy Birthday, Sumu!';
        wishInstruction.textContent = 'A little birthday magic, made just for you.';
        sound.playSparkle();
        fx.spawnFirework();
        scheduleFinaleTimer(() => {
          letterModal.classList.add('open');
          vibrateDevice([80, 50, 80]);
        }, 1100);
      }, 850);
    }

    micToggleBtn.addEventListener('click', toggleMicBlow);
    manualBlowBtn.addEventListener('click', extinguishCandles);
    cutCakeBtn.addEventListener('click', cutBirthdayCake);

    document.getElementById('btnReplayMelody').addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playHappyBirthday();
      fx.spawnFirework();
      vibrateDevice(50);
    });

    document.getElementById('btnContinueLetter').addEventListener('click', (e) => {
      e.stopPropagation();
      goToScene(6);
    });

    document.getElementById('btnRestartStory').addEventListener('click', (e) => {
      e.stopPropagation();
      fx.stopConfettiRain();
      sound.stopMelody();
      goToScene(1);
    });

    giftContinueBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToScene(1);
    });

    claimGiftBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (giftClaimed) return;
      giftClaimed = true;
      const card = (CONFIG.gift && CONFIG.gift.card) || {};
      const code = card.claimCode;
      if (!code) return;
      claimGiftBtn.disabled = true;
      birthdayGiftCard.classList.add('is-claimed');
      sound.playSparkle();
      vibrateDevice([45, 30, 60]);
      if (typeof fx !== 'undefined' && fx && typeof fx.burstConfetti === 'function') {
        const rect = birthdayGiftCard.getBoundingClientRect();
        fx.burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
      }
      const copyPromise = navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(code)
        : Promise.reject(new Error('clipboard-unavailable'));
      copyPromise
        .then(() => {
          claimGiftBtn.textContent = card.claimedLabel || 'Gift code copied 💗';
          claimGiftBtn.blur();
          birthdayGiftCard.scrollTop = 0;
        })
        .catch(() => {
          claimGiftBtn.disabled = false;
          claimGiftBtn.textContent = 'Copy the code above 💗';
          giftClaimed = false;
          claimGiftBtn.blur();
          birthdayGiftCard.scrollTop = 0;
        });
    });

    /* ==========================================================================
       SCENE NAVIGATION & ROUTING
       ========================================================================== */
    function goToScene(targetIdx) {
      if (targetIdx === currentScene) return;

      if (currentScene === 1 && targetIdx !== 1 && memoryGalleryTimer) {
        clearInterval(memoryGalleryTimer);
        memoryGalleryTimer = null;
      }

      if (currentScene === 5 && targetIdx !== 5) {
        stopMicBlow();
        clearFinaleTimers();
        fx.stopConfettiRain();
        sound.stopMelody();
      }

      if (currentScene === 6 && targetIdx !== 6) {
        if (giftChatTimer) clearTimeout(giftChatTimer);
        giftChatTimer = null;
        if (window.setGiftSceneActionsVisible) window.setGiftSceneActionsVisible(false);
      }

      const currentEl = document.getElementById(`scene-${currentScene}`);
      const nextEl = document.getElementById(`scene-${targetIdx}`);

      if (currentEl) {
        currentEl.classList.remove('active');
        currentEl.classList.add('exit');
        setTimeout(() => currentEl.classList.remove('exit'), 500);
      }

      currentScene = targetIdx;

      if (nextEl) {
        nextEl.classList.add('active');
      }

      // Update Header Progress Indicators
      document.querySelectorAll('.prog-pill').forEach((pill, idx) => {
        pill.classList.remove('active');
        if (idx === currentScene) {
          pill.classList.add('active');
        } else if (idx < currentScene) {
          pill.classList.add('completed');
        } else {
          pill.classList.remove('completed');
        }
      });

      // Initialize specific scene behaviors
      switch (targetIdx) {
        case 1:
          initScene1();
          break;
        case 2:
          initScene2();
          break;
        case 3:
          initScene3();
          break;
        case 4:
          initScene4();
          break;
        case 5:
          initScene5();
          break;
        case 6:
          initScene6();
          break;
      }

      if (window.syncGiftSceneUi) {
        window.syncGiftSceneUi(currentScene);
      }
    }

    // Tap anywhere on scene transitions
    document.querySelectorAll('.scene').forEach((sceneEl, idx) => {
      sceneEl.addEventListener('click', (e) => {
        // Prevent accidental skip on buttons / inputs
        if (e.target.closest('button') || e.target.closest('.gift-stage') || e.target.closest('.letter-modal')) {
          return;
        }

        sound.playPop();

        if (idx === 0) {
          // Scene 0 only advances if unlocked
          if (isUnlocked) triggerOpenGift();
        } else if (idx === 1) {
          goToScene(2);
        } else if (idx === 2) {
          goToScene(3);
        } else if (idx === 3) {
          advanceMemoryCard();
        } else if (idx === 4) {
          goToScene(5);
        } else if (idx === 6) {
          fastForwardGiftChat();
        }
      });
    });

    // Make progress pills clickable for easy revisiting
    document.querySelectorAll('.prog-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = parseInt(pill.getAttribute('data-step'), 10);
        if (target <= currentScene || isUnlocked) {
          sound.playPop();
          goToScene(target);
        }
      });
    });

    /* ==========================================================================
       THEME & SOUND TOGGLE
       ========================================================================== */
    const themeToggle = document.getElementById('themeToggle');
    const soundToggle = document.getElementById('soundToggle');

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
      sound.playPop();
    }
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheme();
    });

    soundToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.muted = !sound.muted;
      soundToggle.textContent = sound.muted ? '🔕' : '🔔';
      if (!sound.muted) sound.playPop();
    });
