// Shared behaviour for blog pages: mobile nav, theme toggle, footer year,
// and (on the index page only) rendering post cards + tag filters from posts.js

// Runs immediately: this script sits at the end of <body>, so the elements already exist.
// Rendering now (instead of waiting for DOMContentLoaded) avoids a layout jump on the listing page.
(() => {
  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Theme toggle (shared key with main portfolio site -> stays in sync)
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');


  // Header logo + browser-tab icon follow the theme (white logo with blue lines in Light mode)
  function syncBrandIcons(theme) {
    var icon = theme === 'light' ? '/favicon-light-64.png?v=3' : '/favicon-64.png?v=3';
    var logo = theme === 'light' ? '/assets/img/logo-light.webp?v=3' : '/assets/img/logo.webp?v=3';
    document.querySelectorAll('.brand-logo').forEach(function (i) { i.setAttribute('src', logo); });
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(function (l) { l.parentNode.removeChild(l); });
    var link = document.createElement('link');
    link.rel = 'icon'; link.type = 'image/png'; link.href = icon;
    document.head.appendChild(link);
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    syncBrandIcons(theme);
    if (themeIcon) themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
    if (themeLabel) themeLabel.textContent = theme === 'light' ? 'Light' : 'Dark';
  }
  let savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('asrbmy-theme') || 'dark'; } catch (e) {}
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('asrbmy-theme', next); } catch (e) {}
    });
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Blog listing page: render post cards + tag filters (local posts + live Gists) ----
  const postGrid = document.getElementById('postGrid');
  if (postGrid && typeof POSTS !== 'undefined') {
    const filterRow = document.getElementById('filterRow');
    const emptyState = document.getElementById('emptyState');
    let allEntries = [...POSTS];
    let currentFilter = 'all';

    function escHtml(str) {
      return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function rebuildFilterChips() {
      filterRow.querySelectorAll('.filter-chip:not([data-filter="all"])').forEach(c => c.remove());
      const allTags = [...new Set(allEntries.flatMap(p => p.tags || []))].sort();
      allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.dataset.filter = tag;
        btn.textContent = tag;
        if (tag === currentFilter) btn.classList.add('active');
        filterRow.appendChild(btn);
      });
    }

    function renderPosts(filter) {
      currentFilter = filter;
      postGrid.innerHTML = '';
      const posts = allEntries
        .filter(p => filter === 'all' || (p.tags || []).includes(filter))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (posts.length === 0) {
        emptyState.style.display = 'block';
        return;
      }
      emptyState.style.display = 'none';

      posts.forEach(p => {
        const a = document.createElement('a');
        a.className = 'post-card bp';
        a.href = p.url; // internal relative path, or a github.com gist URL from the GitHub API — not user input
        if (p.external) { a.target = '_blank'; a.rel = 'noopener'; }
        const dateStr = new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        a.innerHTML = `
          <div class="post-meta"><span>${escHtml(dateStr)}</span><span>${escHtml(p.readTime || '')}</span></div>
          <h3>${escHtml(p.title)}</h3>
          <p>${escHtml(p.excerpt)}</p>
          <div class="post-tags">${(p.tags || []).map(t => `<span class="post-tag">${escHtml(t)}</span>`).join('')}</div>
          <span class="post-read">${p.external ? 'View gist ↗' : 'Read write-up →'}</span>
        `;
        postGrid.appendChild(a);
      });
    }

    filterRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-chip');
      if (!btn) return;
      filterRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderPosts(btn.dataset.filter);
    });

    renderPosts('all');

    // ---- Live Gists: fetched from the GitHub API and merged in as extra write-up cards ----
    // No third-party service involved, and this never blocks the initial render above —
    // local posts show immediately, gists fold in a moment later once fetched.
    (async function loadGists() {
      const username = 'asrbmy';
      const cacheKey = 'gh-gists-cache-' + username;
      const cacheTtlMs = 30 * 60 * 1000; // 30 minutes

      function mapGist(gist) {
        const filenames = Object.keys(gist.files || {});
        const title = (gist.description && gist.description.trim()) || filenames[0] || 'Untitled gist';
        const excerpt = (gist.description && gist.description.trim())
          ? `Gist with ${filenames.length} file${filenames.length === 1 ? '' : 's'}: ${filenames.slice(0, 3).join(', ')}${filenames.length > 3 ? ', …' : ''}`
          : `${filenames.length} file${filenames.length === 1 ? '' : 's'}: ${filenames.slice(0, 3).join(', ')}${filenames.length > 3 ? ', …' : ''}`;
        return {
          title,
          date: gist.created_at,
          excerpt,
          tags: ['Gist'],
          readTime: '',
          url: gist.html_url,
          external: true
        };
      }

      let gistEntries = null;
      try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
        if (cached && (Date.now() - cached.savedAt) < cacheTtlMs) gistEntries = cached.entries;
      } catch (e) { /* ignore bad cache */ }

      if (!gistEntries) {
        try {
          const res = await fetch(`https://api.github.com/users/${username}/gists?per_page=100`);
          if (!res.ok) throw new Error('GitHub Gists API request failed');
          const gists = await res.json();
          gistEntries = gists.map(mapGist);
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), entries: gistEntries })); } catch (e) {}
        } catch (e) {
          return; // Gists unavailable right now — local write-ups still show fine, fail silently
        }
      }

      if (gistEntries && gistEntries.length) {
        allEntries = [...POSTS, ...gistEntries];
        rebuildFilterChips();
        renderPosts(currentFilter);
      }
    })();
  }
})();

// Repeat-visit caching (see /sw.js). Skipped on admin/tools pages.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && !/^\/(admin|tools)\//.test(location.pathname)) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
}
