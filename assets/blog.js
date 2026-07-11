// Shared behaviour for blog pages: mobile nav, theme toggle, footer year,
// and (on the index page only) rendering post cards + tag filters from posts.js

document.addEventListener('DOMContentLoaded', () => {
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

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
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

  // ---- Blog listing page: render post cards + tag filters ----
  const postGrid = document.getElementById('postGrid');
  if (postGrid && typeof POSTS !== 'undefined') {
    const filterRow = document.getElementById('filterRow');
    const emptyState = document.getElementById('emptyState');

    // Build unique tag list for filter chips
    const allTags = [...new Set(POSTS.flatMap(p => p.tags || []))].sort();
    allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.dataset.filter = tag;
      btn.textContent = tag;
      filterRow.appendChild(btn);
    });

    function escHtml(str) {
      return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderPosts(filter) {
      postGrid.innerHTML = '';
      const posts = POSTS
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
        a.href = p.url; // internal relative path only — not user-attacker-controlled attribute injection risk
        const dateStr = new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        a.innerHTML = `
          <div class="post-meta"><span>${escHtml(dateStr)}</span><span>${escHtml(p.readTime || '')}</span></div>
          <h3>${escHtml(p.title)}</h3>
          <p>${escHtml(p.excerpt)}</p>
          <div class="post-tags">${(p.tags || []).map(t => `<span class="post-tag">${escHtml(t)}</span>`).join('')}</div>
          <span class="post-read">Read write-up →</span>
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
  }
});
