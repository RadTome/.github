/**
 * RadTome GitHub Pages Portal - Interactive Engine
 * Canvas Tron Perspective Grid + Interactivity + Telemetry
 */

(function () {
  'use strict';

  // --- 1. Canvas Tron Perspective Grid ---
  function initTronCanvas() {
    const canvas = document.getElementById('tron-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animId = null;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 60;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 30;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Vector stars in upper sky
    const starCount = 45;
    const stars = Array.from({ length: starCount }, () => ({
      xRatio: Math.random(),
      yRatio: Math.random() * 0.48,
      radius: 0.6 + Math.random() * 1.4,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    }));

    let offset = 0;
    const speed = 0.0035;
    const floorRungs = 22;
    const ceilRungs = 14;
    const numCols = 32;

    const render = (time) => {
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Base void fill
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);

      // Horizon coordinates
      const horizonY = height * 0.52 + mouseY;
      const vpX = width * 0.5 + mouseX;

      // Render starry upper sky
      const t = time * 0.001;
      stars.forEach((s) => {
        const sx = s.xRatio * width + mouseX * 0.25;
        const sy = s.yRatio * height + mouseY * 0.25;
        const alpha = 0.35 + 0.45 * Math.sin(t * s.twinkleSpeed + s.phase);
        ctx.fillStyle = `rgba(255, 220, 180, ${Math.max(0.1, alpha)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Horizon neon glow band
      const glowGrad = ctx.createLinearGradient(0, horizonY - 45, 0, horizonY + 45);
      glowGrad.addColorStop(0, 'rgba(255, 107, 53, 0)');
      glowGrad.addColorStop(0.5, 'rgba(255, 176, 32, 0.18)');
      glowGrad.addColorStop(1, 'rgba(255, 107, 53, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, horizonY - 45, width, 90);

      // --- FLOOR GRID ---
      offset = (offset + speed) % 1;

      // Floor Transversals (horizontal lines converging into distance)
      for (let i = 0; i < floorRungs; i++) {
        const rawZ = (i + offset) / floorRungs;
        const z = Math.pow(rawZ, 2.5); // exponential depth
        const y = horizonY + z * (height - horizonY);
        const alpha = Math.min(1, Math.pow(rawZ, 1.2) * 0.7);

        ctx.strokeStyle = `rgba(255, 120, 0, ${alpha})`;
        ctx.lineWidth = 0.7 + z * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Floor Longitudinals (perspective rays radiating from vanishing point)
      for (let c = -numCols / 2; c <= numCols / 2; c++) {
        const xBottom = vpX + c * (width / (numCols * 0.35));
        const grad = ctx.createLinearGradient(vpX, horizonY, xBottom, height);
        grad.addColorStop(0, 'rgba(255, 176, 32, 0.05)');
        grad.addColorStop(0.5, 'rgba(255, 107, 53, 0.35)');
        grad.addColorStop(1, 'rgba(255, 69, 0, 0.8)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(xBottom, height);
        ctx.stroke();
      }

      // --- CEILING GRID (Subtle cybernetic grid in upper sky) ---
      for (let j = 0; j < ceilRungs; j++) {
        const rawZ = (j + (1 - offset)) / ceilRungs;
        const z = Math.pow(rawZ, 2.8);
        const y = horizonY - z * horizonY;
        const alpha = Math.min(0.28, Math.pow(rawZ, 1.4) * 0.28);

        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      for (let c = -numCols / 2; c <= numCols / 2; c += 2) {
        const xTop = vpX + c * (width / (numCols * 0.4));
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(xTop, 0);
        ctx.stroke();
      }

      // Horizon line
      ctx.strokeStyle = 'rgba(255, 176, 32, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(render);
    } else {
      render(0); // static snapshot
    }
  }

  // --- 2. Project Filtering System ---
  function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        projectCards.forEach((card) => {
          const cardCat = card.getAttribute('data-category') || '';
          if (category === 'all' || cardCat.includes(category)) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  // --- 3. CRT Scanline Toggle ---
  function initCrtToggle() {
    const toggleBtn = document.getElementById('toggle-crt-btn');
    const crtOverlay = document.getElementById('crt-overlay');
    if (!toggleBtn || !crtOverlay) return;

    const savedPref = localStorage.getItem('radtome_crt_enabled');
    if (savedPref === 'false') {
      crtOverlay.classList.add('disabled');
      toggleBtn.setAttribute('aria-pressed', 'false');
    }

    toggleBtn.addEventListener('click', () => {
      const isDisabled = crtOverlay.classList.toggle('disabled');
      localStorage.setItem('radtome_crt_enabled', !isDisabled);
      toggleBtn.setAttribute('aria-pressed', (!isDisabled).toString());
    });
  }

  // --- 4. Interactive Telemetry Timestamp ---
  function updateTelemetryClock() {
    const clockEl = document.getElementById('telemetry-clock');
    if (!clockEl) return;

    const update = () => {
      const now = new Date();
      const utcString = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      clockEl.textContent = utcString;
    };

    update();
    setInterval(update, 1000);
  }

  // --- 5. Initializer on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    initTronCanvas();
    initProjectFilters();
    initCrtToggle();
    updateTelemetryClock();
  });
})();
