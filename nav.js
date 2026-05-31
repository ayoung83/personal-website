/**
 * nav.js — shared hamburger menu for ayoung83/personal-website
 *
 * Dynamically fetches HTML files from the GitHub repo and builds
 * a slide-out menu. Include this script on every page.
 *
 * Usage: <script src="/nav.js"></script>
 */

(function () {
  const REPO = 'ayoung83/personal-website';
  const BRANCH = 'main';

  // Nice display names for pages (add more as you create pages)
  const PAGE_LABELS = {
    'index.html':   '🏠 Home',
    'grocery.html': '🛒 Grocery List',
  };

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Courier+Prime&display=swap');

    #nav-toggle {
      position: fixed;
      top: 1.1rem;
      left: 1.1rem;
      z-index: 9999;
      width: 40px;
      height: 40px;
      background: #1a1a18;
      border: 1.5px solid #38382e;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 0;
      transition: border-color 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    #nav-toggle:hover { border-color: #c8b560; }

    #nav-toggle span {
      display: block;
      width: 18px;
      height: 1.5px;
      background: #e8e4d9;
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
    }

    #nav-toggle.open span:nth-child(1) {
      transform: translateY(6.5px) rotate(45deg);
    }
    #nav-toggle.open span:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }
    #nav-toggle.open span:nth-child(3) {
      transform: translateY(-6.5px) rotate(-45deg);
    }

    #nav-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0);
      z-index: 9997;
      pointer-events: none;
      transition: background 0.3s;
    }
    #nav-overlay.open {
      background: rgba(0,0,0,0.55);
      pointer-events: all;
    }

    #nav-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: min(280px, 85vw);
      background: #1a1a18;
      border-right: 1px solid #38382e;
      z-index: 9998;
      transform: translateX(-100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #nav-drawer.open {
      transform: translateX(0);
    }

    #nav-drawer-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid #38382e;
    }

    #nav-drawer-eyebrow {
      font-family: 'Courier Prime', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #c8b560;
      margin-bottom: 0.3rem;
    }

    #nav-drawer-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.6rem;
      color: #e8e4d9;
      letter-spacing: 0.05em;
      line-height: 1;
    }

    #nav-pages {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem 0;
    }

    .nav-page-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.5rem;
      font-family: 'Courier Prime', monospace;
      font-size: 0.95rem;
      color: #e8e4d9;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
      border-left: 2px solid transparent;
      -webkit-tap-highlight-color: transparent;
    }

    .nav-page-link:hover,
    .nav-page-link:active {
      background: #242420;
      border-left-color: #c8b560;
      color: #c8b560;
    }

    .nav-page-link.active {
      border-left-color: #c8b560;
      color: #c8b560;
      background: rgba(200,181,96,0.06);
    }

    .nav-loading {
      padding: 1.5rem;
      font-family: 'Courier Prime', monospace;
      font-size: 0.75rem;
      color: #6b6b5a;
      font-style: italic;
    }

    #nav-drawer-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #38382e;
      font-family: 'Courier Prime', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #38382e;
    }
  `;
  document.head.appendChild(style);

  // Build DOM
  const toggle = document.createElement('button');
  toggle.id = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.innerHTML = '<span></span><span></span><span></span>';

  const overlay = document.createElement('div');
  overlay.id = 'nav-overlay';

  const drawer = document.createElement('div');
  drawer.id = 'nav-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div id="nav-drawer-header">
      <div id="nav-drawer-eyebrow">— navigate —</div>
      <div id="nav-drawer-title">Pages</div>
    </div>
    <div id="nav-pages"><div class="nav-loading">loading pages...</div></div>
    <div id="nav-drawer-footer">ayoung83 · personal site</div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  // Open / close
  function openMenu() {
    toggle.classList.add('open');
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  function closeMenu() {
    toggle.classList.remove('open');
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', () => {
    toggle.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Fetch pages from GitHub Contents API
  async function loadPages() {
    const pagesEl = document.getElementById('nav-pages');
    const currentPage = location.pathname.split('/').pop() || 'index.html';

    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`
      );
      const data = await res.json();

      // Filter to .html files only, exclude files in hidden folders
      const htmlFiles = (data.tree || []).filter(
        f => f.type === 'blob' &&
             f.path.endsWith('.html') &&
             !f.path.startsWith('.')
      );

      if (!htmlFiles.length) {
        pagesEl.innerHTML = '<div class="nav-loading">no pages found</div>';
        return;
      }

      // Group by folder
      const groups = {};
      htmlFiles.forEach(f => {
        const parts = f.path.split('/');
        const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
        if (!groups[folder]) groups[folder] = [];
        groups[folder].push(f);
      });

      let html = '';
      const sortedFolders = Object.keys(groups).sort((a, b) =>
        a === 'root' ? -1 : b === 'root' ? 1 : a.localeCompare(b)
      );

      sortedFolders.forEach(folder => {
        if (folder !== 'root' && Object.keys(groups).length > 1) {
          html += `<div style="padding:0.5rem 1.5rem 0.2rem;font-family:'Courier Prime',monospace;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b5a;">${folder}</div>`;
        }
        groups[folder].forEach(f => {
          const filename = f.path.split('/').pop();
          const href = '/' + f.path;
          const label = PAGE_LABELS[filename] || filename.replace('.html', '');
          const isActive = filename === currentPage || f.path === currentPage;
          html += `<a class="nav-page-link${isActive ? ' active' : ''}" href="${href}">${label}</a>`;
        });
      });

      pagesEl.innerHTML = html;

    } catch (err) {
      console.error('Nav: failed to load pages', err);
      // Fallback to hardcoded pages
      pagesEl.innerHTML = `
        <a class="nav-page-link ${currentPage === 'index.html' ? 'active' : ''}" href="/index.html">🏠 Home</a>
        <a class="nav-page-link ${currentPage === 'grocery.html' ? 'active' : ''}" href="/grocery.html">🛒 Grocery List</a>
      `;
    }
  }

  loadPages();
})();
