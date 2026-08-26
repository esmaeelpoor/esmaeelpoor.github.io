(function () {
  const mount = document.getElementById('site-header');
  if (!mount) return;

  /* A real spacer keeps page content below the fixed header. */
  let spacer = document.getElementById('site-header-spacer');
  if (!spacer) {
    spacer = document.createElement('div');
    spacer.id = 'site-header-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    mount.insertAdjacentElement('afterend', spacer);
  }

  /* Fix the mount itself, not a child inside it. This is more robust
     against page-specific CSS and overflow/position rules. */
  Object.assign(mount.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    left: '0',
    width: '100%',
    zIndex: '2147483000'
  });

  function syncHeaderSpace() {
    const fallback = window.innerWidth <= 820 ? 72 : 80;
    const h = Math.max(mount.getBoundingClientRect().height || 0, fallback);
    spacer.style.height = h + 'px';
    spacer.style.minHeight = h + 'px';

    const nav = mount.querySelector('.shared-header__nav');
    if (nav && window.innerWidth <= 820) {
      nav.style.top = h + 'px';
      nav.style.height = 'calc(100vh - ' + h + 'px)';
    } else if (nav) {
      nav.style.top = '';
      nav.style.height = '';
    }
  }

  /* Reserve space immediately, even before header.html finishes loading. */
  syncHeaderSpace();

  fetch('/header.html?v=20260826-3', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('Header load failed: ' + response.status);
      return response.text();
    })
    .then(function (markup) {
      mount.innerHTML = markup;

      const nav = mount.querySelector('.shared-header__nav');
      const toggle = mount.querySelector('.shared-header__toggle');

      function closeMenu() {
        if (!nav || !toggle) return;
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }

      if (nav && toggle) {
        toggle.addEventListener('click', function () {
          const open = nav.classList.toggle('is-open');
          toggle.classList.toggle('is-open', open);
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        nav.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function (event) {
          if (event.key === 'Escape') closeMenu();
        });
      }

      function setActiveNav() {
        mount.querySelectorAll('[data-nav]').forEach(function (item) {
          item.classList.remove('is-active');
        });

        const path = (window.location.pathname || '/').replace(/\/index\.html$/, '/');
        const hash = window.location.hash || '';
        let active = 'home';

        if (path.indexOf('/experience/') === 0) active = 'experience';
        else if (path.indexOf('/publishing/') === 0) active = 'publishing';
        else if (path === '/' || path === '') {
          const map = {
            '#about': 'about',
            '#brand-dna': 'dna',
            '#timeline-ai': 'timeline',
            '#portfolio': 'portfolio',
            '#contact': 'contact'
          };
          active = map[hash] || 'home';
        }

        const item = mount.querySelector('[data-nav="' + active + '"]');
        if (item) item.classList.add('is-active');
      }

      setActiveNav();
      window.addEventListener('hashchange', setActiveNav);

      /* Re-measure after DOM insertion and after layout settles. */
      syncHeaderSpace();
      requestAnimationFrame(syncHeaderSpace);
      setTimeout(syncHeaderSpace, 120);
    })
    .catch(function (error) {
      console.error(error);
      syncHeaderSpace();
    });

  window.addEventListener('resize', syncHeaderSpace);
  window.addEventListener('orientationchange', syncHeaderSpace);
})();