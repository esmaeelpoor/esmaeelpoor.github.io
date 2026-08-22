(function () {
  'use strict';

  const doc = document;
  const body = doc.body;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Dark mode ---------- */
  const themeKey = 'esmaeelpoor-theme';
  const themeButtons = Array.from(doc.querySelectorAll('.darkmode-btn a'));

  function setDarkMode(isDark, persist) {
    body.classList.toggle('darkmode', isDark);
    themeButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
    if (persist) {
      try { localStorage.setItem(themeKey, isDark ? 'dark' : 'light'); } catch (e) {}
    }
  }

  try {
    const savedTheme = localStorage.getItem(themeKey);
    if (savedTheme === 'dark') setDarkMode(true, false);
  } catch (e) {}

  themeButtons.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      setDarkMode(!body.classList.contains('darkmode'), true);
    });
  });

  /* ---------- Mobile navigation ---------- */
  const burger = doc.querySelector('.burger');
  const navBar = doc.querySelector('.navigation-bar');

  function setMenu(open) {
    if (!burger || !navBar) return;
    burger.classList.toggle('open', open);
    navBar.classList.toggle('show', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
    body.classList.toggle('menu-open', open && window.innerWidth <= 799);
  }

  if (burger && navBar) {
    burger.addEventListener('click', function (event) {
      event.preventDefault();
      setMenu(!burger.classList.contains('open'));
    });

    navBar.addEventListener('click', function (event) {
      const link = event.target.closest('a[href^="#"]');
      if (link) setMenu(false);
    });

    doc.addEventListener('click', function (event) {
      if (navBar.classList.contains('show') && !event.target.closest('.navigation-bar,.burger')) {
        setMenu(false);
      }
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 799) setMenu(false);
    }, { passive: true });
  }

  /* ---------- Header, back-to-top and native scrollspy ---------- */
  const header = doc.querySelector('header');
  const scrollUp = doc.querySelector('.scrollup');
  const navLinks = Array.from(doc.querySelectorAll('#nav a[href^="#"]')).filter(function (link) {
    const href = link.getAttribute('href');
    return href && href.length > 1 && doc.querySelector(href);
  });

  let ticking = false;
  function updateOnScroll() {
    ticking = false;
    const y = window.scrollY || doc.documentElement.scrollTop || 0;
    const headerHeight = header ? header.offsetHeight : 80;

    if (header) {
      const fixed = y > headerHeight;
      header.classList.toggle('fixed', fixed);
      body.style.paddingTop = fixed ? headerHeight + 'px' : '';
    }

    if (scrollUp) scrollUp.classList.toggle('show', y > 500);

    if (navLinks.length) {
      let active = navLinks[0];
      const offset = headerHeight + 28;
      navLinks.forEach(function (link) {
        const target = doc.querySelector(link.getAttribute('href'));
        if (target && target.getBoundingClientRect().top <= offset) active = link;
      });
      navLinks.forEach(function (link) {
        const li = link.closest('li');
        const isActive = link === active;
        if (li) li.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }

  function requestScrollUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  updateOnScroll();

  if (scrollUp) {
    scrollUp.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Reveal animation ---------- */
  const reveals = Array.from(doc.querySelectorAll('.reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  } else if (reveals.length) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Timeline progress ---------- */
  const timelineRows = Array.from(doc.querySelectorAll('.timeline-row'));
  const progress = doc.getElementById('timelineProgress');
  if (timelineRows.length && progress) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      timelineRows.forEach(function (row) { row.classList.add('active'); });
      progress.style.height = '100%';
    } else {
      const timelineObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            const idx = timelineRows.indexOf(entry.target) + 1;
            progress.style.height = ((idx / timelineRows.length) * 100) + '%';
          }
        });
      }, { threshold: 0.5 });
      timelineRows.forEach(function (row) { timelineObserver.observe(row); });
    }
  }

  /* ---------- Hero network canvas ---------- */
  const canvas = doc.getElementById('hero-network');
  if (canvas && !reduceMotion && 'IntersectionObserver' in window) {
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, points = [], rafId = 0;
    let running = false, inViewport = false;
    const mouse = { x: null, y: null };
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      width = canvas.offsetWidth || (canvas.parentElement ? canvas.parentElement.offsetWidth : 0);
      height = canvas.offsetHeight || (canvas.parentElement ? canvas.parentElement.offsetHeight : 0);
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 768 ? 34 : 58;
      points = Array.from({ length: count }, function () {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: 1.6 + Math.random() * 2.2
        };
      });
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const mouseDistance = mouse.x == null ? 9999 : Math.hypot(mouse.x - p.x, mouse.y - p.y);
        if (mouseDistance < 120) {
          p.x += (p.x - mouse.x) * 0.004;
          p.y += (p.y - mouse.y) * 0.004;
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(29,139,255,.7)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < points.length; j++) {
          const q = points[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(80,199,247,' + ((1 - d / 120) * 0.35) + ')';
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      rafId = window.requestAnimationFrame(frame);
    }

    function startCanvas() {
      if (running || !inViewport || doc.hidden) return;
      running = true;
      frame();
    }

    function stopCanvas() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    let resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 120);
    }, { passive: true });

    canvas.addEventListener('mousemove', function (event) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }, { passive: true });
    canvas.addEventListener('mouseleave', function () { mouse.x = null; mouse.y = null; }, { passive: true });
    doc.addEventListener('visibilitychange', function () { doc.hidden ? stopCanvas() : startCanvas(); });

    const canvasObserver = new IntersectionObserver(function (entries) {
      inViewport = !!(entries[0] && entries[0].isIntersecting);
      inViewport ? startCanvas() : stopCanvas();
    }, { threshold: 0.05 });

    resizeCanvas();
    canvasObserver.observe(canvas);
  } else if (canvas && reduceMotion) {
    canvas.style.display = 'none';
  }

  /* ---------- Achievements carousel ---------- */
  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.owlCarousel) {
    window.jQuery(function ($) {
      const $slider = $('.testmonial-slider');
      if ($slider.length && !$slider.hasClass('owl-loaded')) {
        $slider.owlCarousel({
          autoplay: true,
          autoplayTimeout: 4500,
          autoplayHoverPause: true,
          loop: true,
          responsiveClass: true,
          nav: false,
          dots: true,
          smartSpeed: 700,
          margin: 30,
          responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 2 }
          }
        });
      }
    });
  }
})();
