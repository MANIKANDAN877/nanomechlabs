/**
 * NanoMech Labs — Main JavaScript
 * Cyclemon-Inspired Parallax EdTech Website
 * Features: Loader, Parallax, Scroll-spy, Animations,
 *           Counter, Particles, Neural Canvas, Contact Form
 */

'use strict';

/* ── Utility ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

/* ══════════════════════════════════════════════════════════
   1. LOADING SCREEN
   ══════════════════════════════════════════════════════════ */
function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  // Minimum display time for branding impact
  const minTime = 2000;
  const startedAt = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minTime - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      // Trigger entry animations for hero section
      $$('.reveal, .reveal-left, .reveal-right, .reveal-scale', $('#hero')).forEach(el => {
        el.classList.add('visible');
      });
    }, remaining);
  }

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
    // Fallback in case load never fires
    setTimeout(hideLoader, 4000);
  }
}

/* ══════════════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
   ══════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = clamp(pct, 0, 100) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ══════════════════════════════════════════════════════════
   3. NAVBAR — Scroll State + Hamburger + Scroll-Spy
   ══════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileNav = $('#mobile-nav');
  const navLinks  = $$('#nav-links a[href^="#"]');
  const sections  = $$('section[id]');

  // Scroll state
  function updateNavScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll();

  // Hamburger toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      mobileNav.setAttribute('aria-hidden', String(!open));
    });

    // Close on mobile link click
    $$('a', mobileNav).forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // Scroll-spy with IntersectionObserver
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;

  const spyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', isActive);
        });
      }
    });
  }, {
    rootMargin: `-${navHeight}px 0px -60% 0px`,
    threshold: 0
  });

  sections.forEach(sec => spyObserver.observe(sec));

  // Smooth scroll with offset for fixed nav
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   4. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
   ══════════════════════════════════════════════════════════ */
function initRevealAnimations() {
  const revealEls = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after revealing (perf)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  // Don't observe hero elements (handled by loader)
  revealEls.forEach(el => {
    if (!el.closest('#hero')) {
      observer.observe(el);
    }
  });
}

/* ══════════════════════════════════════════════════════════
   5. ANIMATED COUNTERS
   ══════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = $$('.count-up');
  if (!counters.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString() + (progress >= 1 ? suffix : '');

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ══════════════════════════════════════════════════════════
   6. TYPED TEXT EFFECT (Hero)
   ══════════════════════════════════════════════════════════ */
function initTypedText() {
  const el = $('#typed-text');
  if (!el) return;

  const phrases = [
    'AI-Powered Learning',
    'STEAM Innovation',
    'SDG-Aligned Curricula',
    'Adaptive Assessment',
    'Future-Ready Skills',
    '21st Century Education',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let paused = false;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (paused) {
      paused = false;
      setTimeout(tick, 1600);
      return;
    }

    if (!deleting) {
      el.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        paused = true;
        deleting = true;
        setTimeout(tick, 80);
        return;
      }
      setTimeout(tick, 65);
    } else {
      el.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35);
    }
  }

  // Start after loader
  setTimeout(tick, 2200);
}

/* ══════════════════════════════════════════════════════════
   7. HERO PARTICLE SYSTEM (Canvas)
   ══════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    const count = Math.floor((W * H) / 10000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      dAlpha: (Math.random() - 0.5) * 0.005,
    }));
  }

  function drawLine(p1, p2, dist, maxDist) {
    const alpha = (1 - dist / maxDist) * 0.12;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    const maxDist = 120;

    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.dAlpha;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      if (p.alpha < 0.05 || p.alpha > 0.6) p.dAlpha *= -1;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 210, 255, ${p.alpha})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) drawLine(p, q, dist, maxDist);
      }
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  animate();
}

/* ══════════════════════════════════════════════════════════
   8. NEURAL NETWORK CANVAS (AI Section)
   ══════════════════════════════════════════════════════════ */
function initNeuralCanvas() {
  const canvas = $('#neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes, pulses;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
    buildNetwork();
  }

  function buildNetwork() {
    const layers = [3, 5, 5, 3];
    nodes = [];

    layers.forEach((count, li) => {
      const x = (W / (layers.length + 1)) * (li + 1);
      for (let ni = 0; ni < count; ni++) {
        const y = (H / (count + 1)) * (ni + 1);
        nodes.push({ x, y, layer: li, idx: ni, alpha: Math.random() * 0.4 + 0.3 });
      }
    });

    pulses = [];
  }

  function spawnPulse() {
    if (!nodes.length) return;
    const from = nodes[Math.floor(Math.random() * nodes.length)];
    const nextLayerNodes = nodes.filter(n => n.layer === from.layer + 1);
    if (!nextLayerNodes.length) return;
    const to = nextLayerNodes[Math.floor(Math.random() * nextLayerNodes.length)];
    pulses.push({ from, to, t: 0, speed: Math.random() * 0.008 + 0.004 });
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    const layers = [...new Set(nodes.map(n => n.layer))];
    layers.forEach(li => {
      const layerNodes = nodes.filter(n => n.layer === li);
      const nextNodes  = nodes.filter(n => n.layer === li + 1);
      layerNodes.forEach(a => {
        nextNodes.forEach(b => {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(189,147,249,0.08)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      });
    });

    // Draw nodes
    nodes.forEach(n => {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 12);
      grad.addColorStop(0, `rgba(189,147,249,${n.alpha})`);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(189,147,249,${n.alpha * 1.5})`;
      ctx.fill();

      n.alpha += (Math.random() - 0.5) * 0.01;
      n.alpha = clamp(n.alpha, 0.2, 0.7);
    });

    // Draw pulses
    pulses = pulses.filter(p => p.t <= 1);
    pulses.forEach(p => {
      p.t += p.speed;
      const x = lerp(p.from.x, p.to.x, p.t);
      const y = lerp(p.from.y, p.to.y, p.t);
      const alpha = Math.sin(p.t * Math.PI) * 0.8;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
      grad.addColorStop(0, `rgba(255,121,198,${alpha})`);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Spawn new pulses
    if (Math.random() < 0.04) spawnPulse();

    requestAnimationFrame(animate);
  }

  // Only run when section is visible
  const section = $('#ai-assessment');
  if (!section) return;

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        resize();
        animate();
        sectionObserver.unobserve(section);
      }
    });
  }, { threshold: 0.1 });

  sectionObserver.observe(section);
  window.addEventListener('resize', () => {
    if (canvas.width > 0) resize();
  });
}

/* ══════════════════════════════════════════════════════════
   9. PARALLAX ENGINE (requestAnimationFrame)
   ══════════════════════════════════════════════════════════ */
function initParallax() {
  const sections = $$('.section');
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      // Only process visible sections
      if (rect.bottom < -vh || rect.top > vh * 2) return;

      const relativeScroll = scrollY - (sec.offsetTop - vh * 0.5);
      const depth = 0.15;
      const offset = relativeScroll * depth;

      // Apply parallax to floating shapes
      const shapes = $$('.shape', sec);
      shapes.forEach((shape, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const factor = 0.06 * (i + 1);
        shape.style.transform = `translateY(${offset * factor * dir}px)`;
      });
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   10. CONTACT FORM HANDLER
   ══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form    = $('#contact-form');
  const btn     = $('#btn-submit-contact');
  const btnText = $('#btn-submit-text');
  const btnIcon = $('#btn-submit-icon');
  const success = $('#form-success');

  if (!form) return;

  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', show);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validate() {
    const name    = $('#form-name').value.trim();
    const email   = $('#form-email').value.trim();
    const school  = $('#form-school').value.trim();
    const message = $('#form-message').value.trim();

    let valid = true;

    showError('err-name',    !name);
    showError('err-email',   !validateEmail(email));
    showError('err-school',  !school);
    showError('err-message', !message);

    if (!name || !validateEmail(email) || !school || !message) valid = false;

    return valid;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate submission
    btn.classList.add('loading');
    btnText.textContent = 'Sending…';
    btnIcon.textContent = '⏳';

    setTimeout(() => {
      form.style.display = 'none';
      success.classList.add('show');
      btn.classList.remove('loading');
      btnText.textContent = 'Send Message';
      btnIcon.textContent = '→';
    }, 1800);
  });

  // Real-time validation on blur
  $$('input, textarea', form).forEach(el => {
    el.addEventListener('blur', () => {
      const errId = el.id.replace('form-', 'err-');
      if (el.type === 'email') {
        showError(errId, el.value.trim() && !validateEmail(el.value.trim()));
      } else {
        showError(errId, !el.value.trim());
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   11. PRODUCT CARD HOVER — Ripple Effect
   ══════════════════════════════════════════════════════════ */
function initCardRipples() {
  $$('.product-card, .sdg-card, .mega-stat, .award-card').forEach(card => {
    card.addEventListener('click', e => {
      const ripple = document.createElement('span');
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;

      Object.assign(ripple.style, {
        position:     'absolute',
        width:        size + 'px',
        height:       size + 'px',
        left:         (e.clientX - rect.left - size / 2) + 'px',
        top:          (e.clientY - rect.top  - size / 2) + 'px',
        background:   'rgba(255,255,255,0.06)',
        borderRadius: '50%',
        transform:    'scale(0)',
        animation:    'rippleAnim 0.6s ease-out forwards',
        pointerEvents:'none',
        zIndex:       '10',
      });

      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Inject ripple keyframes
  if (!document.getElementById('ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }`;
    document.head.appendChild(style);
  }
}

/* ══════════════════════════════════════════════════════════
   12. STEAM ICON CARD — Hover Color Cycling
   ══════════════════════════════════════════════════════════ */
function initSteamCards() {
  const colors = ['#e43f5a', '#58a6ff', '#64ffda', '#f1fa8c', '#bd93f9'];
  $$('.steam-icon-card').forEach((card, i) => {
    card.style.setProperty('--hover-color', colors[i % colors.length]);
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = colors[i % colors.length] + '55';
      card.style.background  = colors[i % colors.length] + '12';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '';
      card.style.background  = '';
    });
  });
}

/* ══════════════════════════════════════════════════════════
   13. ACTIVE NAV HIGHLIGHT ON LOAD
   ══════════════════════════════════════════════════════════ */
function initActiveNavOnLoad() {
  const hash = window.location.hash;
  if (hash) {
    const link = $(`#nav-links a[href="${hash}"]`);
    if (link) link.classList.add('active');
  } else {
    const first = $('#nav-links a[href="#hero"]');
    // hero isn't in nav but first section is about effectively
  }
}

/* ══════════════════════════════════════════════════════════
   14. SMOOTH HOVER TILT on AI visual
   ══════════════════════════════════════════════════════════ */
function initTiltEffect() {
  const tiltEls = $$('.ai-visual, .about-img-wrap, .steam-visual');

  tiltEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const maxTilt = 6;
      el.style.transform = `perspective(800px) rotateY(${dx * maxTilt}deg) rotateX(${-dy * maxTilt}deg) scale(1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.5s ease';
    });

    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.1s ease';
    });
  });
}

/* ══════════════════════════════════════════════════════════
   15. SDG CARD TOOLTIP
   ══════════════════════════════════════════════════════════ */
function initSDGTooltips() {
  const descriptions = {
    'sdg-1': 'Ensure inclusive and equitable quality education for all.',
    'sdg-2': 'Achieve gender equality and empower all women and girls.',
    'sdg-3': 'Build resilient infrastructure and foster innovation.',
    'sdg-4': 'Reduce inequality within and among countries.',
    'sdg-5': 'Take urgent action to combat climate change and its impacts.',
    'sdg-6': 'Strengthen the means of implementation and global partnerships.',
  };

  $$('.sdg-card').forEach(card => {
    const desc = descriptions[card.id];
    if (!desc) return;

    card.setAttribute('title', desc);
    card.setAttribute('aria-label', desc);
  });
}

/* ══════════════════════════════════════════════════════════
   INIT — Run everything on DOMContentLoaded
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollProgress();
  initNavbar();
  initRevealAnimations();
  initCounters();
  initTypedText();
  initParticles();
  initNeuralCanvas();
  initParallax();
  initContactForm();
  initCardRipples();
  initSteamCards();
  initActiveNavOnLoad();
  initTiltEffect();
  initSDGTooltips();

  console.log(
    '%cNanoMech Labs%c — Transforming K-12 Education',
    'color:#00d2ff;font-size:1.2rem;font-weight:800;',
    'color:rgba(255,255,255,0.5);font-size:0.9rem;'
  );
});
