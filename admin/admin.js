/* Wires the admin UI to CMS.* (see cms.js) */

(() => {
  const statusEl = document.getElementById('connectionStatus');
  const settingsPanel = document.getElementById('settingsPanel');
  const dashboard = document.getElementById('dashboard');

  function esc(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  // Use for any value placed inside an HTML attribute (href="...", etc.) —
  // also escapes quotes so input can't break out of the attribute.
  function escAttr(str) {
    return esc(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // Only allow safe link protocols; anything else (javascript:, data:, schemeless input, etc.) is rejected
  // rather than silently "fixed up" — resolving a bare domain against window.location would otherwise
  // turn e.g. "github.com/x" into "https://asrbmy.github.io/github.com/x" without warning.
  function sanitizeUrl(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (!/^(https?:|mailto:)/i.test(trimmed)) return '';
    try {
      const parsed = new URL(trimmed);
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '';
    } catch (e) {
      return '';
    }
  }
  function slugify(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  const today = new Date().toISOString().split('T')[0];

  function showBanner(msg, type) {
    statusEl.innerHTML = `<div class="status-banner ${type}"><span class="status-dot"></span>${msg}</div>`;
  }
  function clearBanner() { statusEl.innerHTML = ''; }

  function setBusy(btn, busy, busyLabel) {
    if (!btn) return;
    if (busy) {
      btn.dataset.originalLabel = btn.dataset.originalLabel || btn.textContent;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> ${busyLabel || 'Working…'}`;
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalLabel || btn.textContent;
    }
  }

  // ---------- Connection ----------
  function loadSavedConfig() {
    const cfg = CMS.getConfig();
    if (!cfg) return;
    document.getElementById('cfg-repo').value = `${cfg.owner}/${cfg.repo}`;
    document.getElementById('cfg-branch').value = cfg.branch;
    document.getElementById('cfg-token').value = cfg.token;
  }

  async function tryAutoConnect() {
    const cfg = CMS.getConfig();
    if (!cfg) return;
    try {
      await CMS.testConnection();
      showBanner(`Connected to ${cfg.owner}/${cfg.repo} (${cfg.branch})`, 'ok');
      settingsPanel.style.display = 'none';
      dashboard.style.display = 'block';
      refreshAll();
    } catch (e) {
      showBanner(e.message, 'err');
    }
  }

  document.getElementById('btnConnect').addEventListener('click', async () => {
    const repoField = document.getElementById('cfg-repo').value.trim();
    const [owner, repo] = repoField.split('/').map(s => s.trim());
    const branch = document.getElementById('cfg-branch').value.trim() || 'main';
    const token = document.getElementById('cfg-token').value.trim();

    if (!owner || !repo || !token) {
      showBanner('Fill in owner/repo (e.g. asrbmy/asrbmy.github.io) and a token.', 'err');
      return;
    }
    CMS.saveConfig({ owner, repo, branch, token });
    const btn = document.getElementById('btnConnect');
    setBusy(btn, true, 'Connecting…');
    try {
      await CMS.testConnection();
      showBanner(`Connected to ${owner}/${repo} (${branch})`, 'ok');
      settingsPanel.style.display = 'none';
      dashboard.style.display = 'block';
      refreshAll();
    } catch (e) {
      showBanner(e.message, 'err');
    } finally {
      setBusy(btn, false);
    }
  });

  document.getElementById('btnDisconnect').addEventListener('click', () => {
    CMS.clearConfig();
    document.getElementById('cfg-repo').value = '';
    document.getElementById('cfg-token').value = '';
    dashboard.style.display = 'none';
    settingsPanel.style.display = 'block';
    clearBanner();
  });

  // ---------- Tabs ----------
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
  });

  // ---------- Icon picker ----------
  let selectedIcon = '🏆';
  document.getElementById('ach-icon-picker').addEventListener('click', (e) => {
    const opt = e.target.closest('.icon-opt');
    if (!opt) return;
    document.querySelectorAll('#ach-icon-picker .icon-opt').forEach(o => {
      o.classList.remove('active');
      o.setAttribute('aria-pressed', 'false');
    });
    opt.classList.add('active');
    opt.setAttribute('aria-pressed', 'true');
    selectedIcon = opt.dataset.icon;
  });

  // Default dates
  document.getElementById('p-date').value = today;
  document.getElementById('c-date').value = today;
  document.getElementById('p-title').addEventListener('input', (e) => {
    const slugField = document.getElementById('p-slug');
    if (!slugField.dataset.touched) slugField.value = slugify(e.target.value);
  });
  document.getElementById('p-slug').addEventListener('input', (e) => { e.target.dataset.touched = 'true'; });

  // ---------- Blog post: build + publish ----------
  function buildPostHtml({ title, date, readTime, body }) {
    const dateDisplay = fmtDate(date);
    const closeScript = '<' + '/script>'; // avoid ending this actual <script> block early
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} — Ajit Singh Rathore (ASRBMY)</title>
<meta name="description" content="${esc(title)}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://gc.zgo.at; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self' https://gc.zgo.at; object-src 'none'; base-uri 'self';">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0B1220">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/blog.css">
</head>
<body>
<a href="#main" class="skip-link">Skip to main content</a>

<header>
  <div class="nav-inner">
    <a href="../../index.html" class="brand"><span class="dot"></span> ASRBMY</a>
    <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
    <nav>
      <ul id="navList">
        <li><a href="../../index.html">Portfolio</a></li>
        <li><a href="../../index.html#projects">Projects</a></li>
        <li><a href="../index.html" class="active" aria-current="page">Write-ups</a></li>
        <li><a href="../../index.html#contact">Contact</a></li>
      </ul>
    </nav>
    <div class="nav-right">
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle light and dark theme">
        <span id="themeIcon">🌙</span><span id="themeLabel">Dark</span>
      </button>
    </div>
  </div>
</header>

<main class="wrap post-header" id="main">
  <a class="back-link" href="../index.html">← Back to write-ups</a>
  <div class="post-meta"><span>${dateDisplay}</span><span>${esc(readTime)}</span></div>
  <h1>${esc(title)}</h1>
</main>

<article class="post-body">
${body}
</article>

<footer>
  <div class="wrap foot-bottom">
    <span>© <span id="year"></span> Ajit Singh Rathore | ASRBMY</span>
    <span><a href="../index.html">← All write-ups</a></span>
  </div>
</footer>

<script src="../../assets/blog.js">${closeScript}
</body>
</html>
`;
  }

  let editingPostUrl = null; // set when editing an existing post

  document.getElementById('btnPublishPost').addEventListener('click', async () => {
    const btn = document.getElementById('btnPublishPost');
    const title = document.getElementById('p-title').value.trim();
    const slug = document.getElementById('p-slug').value.trim() || slugify(title);
    const date = document.getElementById('p-date').value || today;
    const readTime = document.getElementById('p-readtime').value.trim() || '5 min read';
    const excerpt = document.getElementById('p-excerpt').value.trim();
    const body = document.getElementById('p-body').value.trim();
    const tags = document.getElementById('p-tags').value.split(',').map(t => t.trim()).filter(Boolean);

    if (!title || !slug || !excerpt || !body) {
      showBanner('Fill in title, excerpt, and body before publishing.', 'err');
      return;
    }

    setBusy(btn, true, editingPostUrl ? 'Updating…' : 'Publishing…');
    try {
      const html = buildPostHtml({ title, date, readTime, body });
      const newUrl = `posts/${slug}.html`;

      if (editingPostUrl && editingPostUrl !== newUrl) {
        // Slug changed — treat as rename: delete old file, create new one.
        const oldFile = await CMS.getFile('blog/' + editingPostUrl);
        if (oldFile) await CMS.deleteFile('blog/' + editingPostUrl, oldFile.sha, `Rename write-up: ${title}`);
        await CMS.putFile(`blog/${newUrl}`, html, `Add write-up: ${title}`);
      } else if (editingPostUrl) {
        // Same slug — overwrite in place.
        const existing = await CMS.getFile('blog/' + newUrl);
        await CMS.putFile(`blog/${newUrl}`, html, `Update write-up: ${title}`, existing?.sha);
      } else {
        await CMS.putFile(`blog/${newUrl}`, html, `Add write-up: ${title}`);
      }

      const { arr, sha } = await CMS.loadPosts();
      let nextArr;
      if (editingPostUrl) {
        nextArr = arr.map(p => p.url === editingPostUrl ? { title, date, excerpt, tags, readTime, url: newUrl } : p);
      } else {
        nextArr = [...arr, { title, date, excerpt, tags, readTime, url: newUrl }];
      }
      await CMS.savePosts(nextArr, sha, `Update posts.js: ${editingPostUrl ? 'edit' : 'add'} ${title}`);

      try { await CMS.regenerateFeeds(nextArr, CMS.getSiteUrl()); } catch (feedErr) { /* non-fatal */ }

      showBanner(`${editingPostUrl ? 'Updated' : 'Published'} "${title}" — live in ~30-60s.`, 'ok');
      resetPostForm();
      loadPostList();
    } catch (e) {
      showBanner(e.message, 'err');
    } finally {
      setBusy(btn, false);
    }
  });

  function resetPostForm() {
    ['p-title','p-slug','p-readtime','p-tags','p-excerpt','p-body'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('p-slug').dataset.touched = '';
    document.getElementById('p-readtime').value = '5 min read';
    document.getElementById('p-date').value = today;
    editingPostUrl = null;
    const btn = document.getElementById('btnPublishPost');
    btn.textContent = '🚀 Publish to GitHub';
    delete btn.dataset.originalLabel;
    const cancelBtn = document.getElementById('btnCancelPostEdit');
    if (cancelBtn) cancelBtn.remove();
  }

  function enterPostEditMode(post) {
    document.getElementById('p-title').value = post.title;
    document.getElementById('p-slug').value = post.url.replace(/^posts\//, '').replace(/\.html$/, '');
    document.getElementById('p-slug').dataset.touched = 'true';
    document.getElementById('p-date').value = post.date;
    document.getElementById('p-readtime').value = post.readTime || '5 min read';
    document.getElementById('p-tags').value = (post.tags || []).join(', ');
    document.getElementById('p-excerpt').value = post.excerpt || '';
    document.getElementById('p-body').value = '<!-- Editing an existing post: the original body isn\'t re-fetched here to keep this simple. Paste your updated content, or leave as-is if you only changed the title/tags/excerpt/date and republish. -->\n';
    editingPostUrl = post.url;
    const btn = document.getElementById('btnPublishPost');
    btn.textContent = '🚀 Update on GitHub';
    if (!document.getElementById('btnCancelPostEdit')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-ghost';
      cancelBtn.id = 'btnCancelPostEdit';
      cancelBtn.textContent = 'Cancel edit';
      cancelBtn.type = 'button';
      cancelBtn.addEventListener('click', resetPostForm);
      btn.parentElement.appendChild(cancelBtn);
    }
    document.getElementById('panel-post').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function loadPostList() {
    const listEl = document.getElementById('postList');
    listEl.innerHTML = '<span style="color:var(--muted); font-size:13px;">Loading…</span>';
    try {
      const { arr } = await CMS.loadPosts();
      if (arr.length === 0) { listEl.innerHTML = '<span style="color:var(--muted); font-size:13px;">No posts yet.</span>'; return; }
      listEl.innerHTML = '';
      arr.forEach((post) => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `<span class="label">${esc(post.title)} — ${esc(post.date)}</span>`;
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-ghost';
        editBtn.style.padding = '6px 12px';
        editBtn.style.fontSize = '12px';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => enterPostEditMode(post));
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-danger';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => deletePost(post));
        row.appendChild(editBtn);
        row.appendChild(delBtn);
        listEl.appendChild(row);
      });
    } catch (e) {
      listEl.innerHTML = `<span style="color:#C4574C; font-size:13px;">${esc(e.message)}</span>`;
    }
  }

  async function deletePost(post) {
    if (!confirm(`Delete "${post.title}"? This removes the post file and its listing entry.`)) return;
    try {
      const slugPath = 'blog/' + post.url;
      const file = await CMS.getFile(slugPath);
      if (file) await CMS.deleteFile(slugPath, file.sha, `Delete write-up: ${post.title}`);

      const { arr, sha } = await CMS.loadPosts();
      const filtered = arr.filter(p => p.url !== post.url);
      await CMS.savePosts(filtered, sha, `Update posts.js: remove ${post.title}`);
      try { await CMS.regenerateFeeds(filtered, CMS.getSiteUrl()); } catch (feedErr) { /* non-fatal */ }

      if (editingPostUrl === post.url) resetPostForm();

      showBanner(`Deleted "${post.title}".`, 'ok');
      loadPostList();
    } catch (e) {
      showBanner(e.message, 'err');
    }
  }

  document.getElementById('btnRefreshPosts').addEventListener('click', loadPostList);

  // ---------- Generic grid publisher (project / achievement / skill / cert) ----------
  // editState tracks which grid/index is being edited, if any, per tab.
  const editState = { project: null, achievement: null, skill: null, cert: null };

  async function publishToGrid(type, gridId, snippet, label, btn, warnings) {
    const editing = editState[type];
    const warningSuffix = (warnings && warnings.length)
      ? ` (${warnings.join(' and ')} ${warnings.length > 1 ? 'were' : 'was'} dropped — links must start with https:// or http://)`
      : '';
    setBusy(btn, true, editing != null ? 'Updating…' : 'Publishing…');
    try {
      if (editing != null) {
        await CMS.replaceGridItem(gridId, editing, snippet, `Update ${type} via admin CMS: ${label}`);
        showBanner(`Updated "${label}" — live in ~30-60s.${warningSuffix}`, warningSuffix ? 'info' : 'ok');
        exitEditMode(type);
      } else {
        await CMS.addCardToGrid(gridId, snippet, `Add ${label} via admin CMS`);
        showBanner(`Published "${label}" — live in ~30-60s.${warningSuffix}`, warningSuffix ? 'info' : 'ok');
      }
      loadGridList(gridId, type + 'List', type);
    } catch (e) {
      showBanner(e.message, 'err');
    } finally {
      setBusy(btn, false);
    }
  }

  function exitEditMode(type) {
    editState[type] = null;
    const btn = document.getElementById('btnPublish' + type[0].toUpperCase() + type.slice(1));
    if (btn) { btn.textContent = '🚀 Publish to GitHub'; delete btn.dataset.originalLabel; }
    const cancelBtn = document.getElementById('btnCancel' + type[0].toUpperCase() + type.slice(1) + 'Edit');
    if (cancelBtn) cancelBtn.remove();
    // clear the relevant form fields
    if (type === 'project') { ['pr-title','pr-desc','pr-stack','pr-repo','pr-demo'].forEach(id => document.getElementById(id).value = ''); }
    if (type === 'achievement') {
      ['ach-title','ach-sub'].forEach(id => document.getElementById(id).value = '');
      selectedIcon = '🏆';
      document.querySelectorAll('#ach-icon-picker .icon-opt').forEach(o => {
        const isMatch = o.dataset.icon === '🏆';
        o.classList.toggle('active', isMatch);
        o.setAttribute('aria-pressed', String(isMatch));
      });
    }
    if (type === 'skill') { document.getElementById('sk-name').value = ''; }
    if (type === 'cert') { ['c-name','c-issuer','c-url'].forEach(id => document.getElementById(id).value = ''); document.getElementById('c-date').value = today; }
  }

  function enterEditMode(type, index, prefill) {
    editState[type] = index;
    const btnId = 'btnPublish' + type[0].toUpperCase() + type.slice(1);
    const btn = document.getElementById(btnId);
    btn.textContent = '🚀 Update on GitHub';
    prefill();
    if (!document.getElementById('btnCancel' + type[0].toUpperCase() + type.slice(1) + 'Edit')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-ghost';
      cancelBtn.id = 'btnCancel' + type[0].toUpperCase() + type.slice(1) + 'Edit';
      cancelBtn.type = 'button';
      cancelBtn.textContent = 'Cancel edit';
      cancelBtn.addEventListener('click', () => exitEditMode(type));
      btn.parentElement.appendChild(cancelBtn);
    }
    btn.closest('.panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Parses one of our own generated card snippets back into plain text via the DOM
  // (safe: DOMParser never executes scripts from parsed markup).
  function parseCard(outerHTML) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = outerHTML;
    const el = wrapper.firstElementChild;
    return {
      icon: el.querySelector('.icon')?.textContent.trim() || '',
      h3Text: el.querySelector('h3')?.textContent.trim() || '',
      h3Href: el.querySelector('h3 a')?.getAttribute('href') || '',
      pText: el.querySelector('p')?.textContent.trim() || '',
      stack: Array.from(el.querySelectorAll('.stack-tag')).map(t => t.textContent.trim()),
      links: Array.from(el.querySelectorAll('.project-links a')).map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') }))
    };
  }

  async function loadGridList(gridId, listElId, type) {
    const listEl = document.getElementById(listElId);
    listEl.innerHTML = '<span style="color:var(--muted); font-size:13px;">Loading…</span>';
    try {
      const items = await CMS.listGridItems(gridId);
      if (items.length === 0) { listEl.innerHTML = '<span style="color:var(--muted); font-size:13px;">Nothing here yet.</span>'; return; }
      listEl.innerHTML = '';
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `<span class="label">${esc(item.label) || '(untitled)'}</span>`;

        if (type) {
          const editBtn = document.createElement('button');
          editBtn.className = 'btn btn-ghost';
          editBtn.style.padding = '6px 12px';
          editBtn.style.fontSize = '12px';
          editBtn.textContent = 'Edit';
          editBtn.addEventListener('click', () => beginEditFromItem(type, gridId, item));
          row.appendChild(editBtn);
        }

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-danger';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', async () => {
          if (!confirm('Remove this item from the live site?')) return;
          try {
            await CMS.deleteGridItem(gridId, item.index, `Remove item via admin CMS`);
            // Any in-progress edit on this grid now points at a stale index — cancel it
            // rather than risk "Update" silently overwriting the wrong card.
            if (type && editState[type] != null) exitEditMode(type);
            showBanner('Removed.', 'ok');
            loadGridList(gridId, listElId, type);
          } catch (e) {
            showBanner(e.message, 'err');
          }
        });
        row.appendChild(delBtn);
        listEl.appendChild(row);
      });
    } catch (e) {
      listEl.innerHTML = `<span style="color:#C4574C; font-size:13px;">${esc(e.message)}</span>`;
    }
  }

  function beginEditFromItem(type, gridId, item) {
    const parsed = parseCard(item.outerHTML);
    if (type === 'project') {
      enterEditMode('project', item.index, () => {
        document.getElementById('pr-title').value = parsed.h3Text;
        document.getElementById('pr-desc').value = parsed.pText;
        document.getElementById('pr-stack').value = parsed.stack.join(', ');
        const repoLink = parsed.links.find(l => /github/i.test(l.text)) || parsed.links[0];
        const demoLink = parsed.links.find(l => /demo/i.test(l.text));
        document.getElementById('pr-repo').value = repoLink ? repoLink.href : '';
        document.getElementById('pr-demo').value = demoLink ? demoLink.href : '';
      });
    } else if (type === 'achievement') {
      enterEditMode('achievement', item.index, () => {
        document.getElementById('ach-title').value = parsed.h3Text;
        document.getElementById('ach-sub').value = parsed.pText;
        if (parsed.icon) {
          selectedIcon = parsed.icon;
          document.querySelectorAll('#ach-icon-picker .icon-opt').forEach(o => {
            const isMatch = o.dataset.icon === parsed.icon;
            o.classList.toggle('active', isMatch);
            o.setAttribute('aria-pressed', String(isMatch));
          });
        }
      });
    } else if (type === 'skill') {
      enterEditMode('skill', item.index, () => {
        document.getElementById('sk-name').value = parsed.h3Text || item.label;
      });
    } else if (type === 'cert') {
      enterEditMode('cert', item.index, () => {
        document.getElementById('c-name').value = parsed.h3Text;
        document.getElementById('c-url').value = parsed.h3Href || '';
        const pParts = parsed.pText.split('·').map(s => s.trim());
        document.getElementById('c-issuer').value = pParts[0] || '';
      });
    }
  }

  // Project
  function buildProjectSnippet() {
    const title = document.getElementById('pr-title').value.trim() || 'Project title';
    const desc = document.getElementById('pr-desc').value.trim() || 'Project description.';
    const stack = document.getElementById('pr-stack').value.split(',').map(s => s.trim()).filter(Boolean);
    const repoRaw = document.getElementById('pr-repo').value.trim();
    const demoRaw = document.getElementById('pr-demo').value.trim();
    const repo = sanitizeUrl(repoRaw);
    const demo = sanitizeUrl(demoRaw);
    const rejected = [];
    if (repoRaw && !repo) rejected.push('Repo URL');
    if (demoRaw && !demo) rejected.push('Demo URL');
    const stackHtml = stack.map(s => `<span class="stack-tag">${esc(s)}</span>`).join('');
    let linksHtml = '';
    if (repo) linksHtml += `<a href="${escAttr(repo)}" target="_blank" rel="noopener">GitHub →</a>`;
    if (demo) linksHtml += `<a href="${escAttr(demo)}" target="_blank" rel="noopener">Live demo →</a>`;
    return { title, warnings: rejected, snippet: `<div class="card bp">
  <h3>${esc(title)}</h3>
  <p>${esc(desc)}</p>
  <div class="project-stack">${stackHtml}</div>
  <div class="project-links">${linksHtml}</div>
</div>` };
  }
  document.getElementById('btnPublishProject').addEventListener('click', () => {
    const { title, snippet, warnings } = buildProjectSnippet();
    publishToGrid('project', 'projectsGrid', snippet, title, document.getElementById('btnPublishProject'), warnings);
  });
  document.getElementById('btnRefreshProjects').addEventListener('click', () => loadGridList('projectsGrid', 'projectList', 'project'));

  // Achievement
  function buildAchievementSnippet() {
    const title = document.getElementById('ach-title').value.trim() || 'Achievement title';
    const sub = document.getElementById('ach-sub').value.trim() || 'Context / event name';
    return { title, snippet: `<div class="card bp">
  <span class="icon" aria-hidden="true">${selectedIcon}</span>
  <h3>${esc(title)}</h3>
  <p>${esc(sub)}</p>
</div>` };
  }
  document.getElementById('btnPublishAchievement').addEventListener('click', () => {
    const { title, snippet } = buildAchievementSnippet();
    publishToGrid('achievement', 'achievementsGrid', snippet, title, document.getElementById('btnPublishAchievement'));
  });
  document.getElementById('btnRefreshAchievements').addEventListener('click', () => loadGridList('achievementsGrid', 'achievementList', 'achievement'));

  // Skill
  function buildSkillSnippet() {
    const name = document.getElementById('sk-name').value.trim() || 'Skill name';
    return { title: name, snippet: `<div class="skill-chip">${esc(name)}</div>` };
  }
  document.getElementById('btnPublishSkill').addEventListener('click', () => {
    const { title, snippet } = buildSkillSnippet();
    publishToGrid('skill', 'skillsGrid', snippet, title, document.getElementById('btnPublishSkill'));
  });
  document.getElementById('btnRefreshSkills').addEventListener('click', () => loadGridList('skillsGrid', 'skillList', 'skill'));

  // Cert
  function buildCertSnippet() {
    const name = document.getElementById('c-name').value.trim() || 'Certification name';
    const issuer = document.getElementById('c-issuer').value.trim() || 'Issuer';
    const date = document.getElementById('c-date').value || today;
    const urlRaw = document.getElementById('c-url').value.trim();
    const url = sanitizeUrl(urlRaw);
    const warnings = (urlRaw && !url) ? ['Credential URL'] : [];
    const inner = url
      ? `<a href="${escAttr(url)}" target="_blank" rel="noopener" style="color:var(--cyan); text-decoration:none;">${esc(name)} →</a>`
      : esc(name);
    return { title: name, warnings, snippet: `<div class="card bp">
  <span class="icon" aria-hidden="true">🎓</span>
  <h3>${inner}</h3>
  <p>${esc(issuer)} · ${fmtDate(date)}</p>
</div>` };
  }
  document.getElementById('btnPublishCert').addEventListener('click', () => {
    const { title, snippet, warnings } = buildCertSnippet();
    publishToGrid('cert', 'certsGrid', snippet, title, document.getElementById('btnPublishCert'), warnings);
  });
  document.getElementById('btnRefreshCerts').addEventListener('click', () => loadGridList('certsGrid', 'certList', 'cert'));

  function refreshAll() {
    loadPostList();
    loadGridList('projectsGrid', 'projectList', 'project');
    loadGridList('achievementsGrid', 'achievementList', 'achievement');
    loadGridList('skillsGrid', 'skillList', 'skill');
    loadGridList('certsGrid', 'certList', 'cert');
  }

  // ---------- Image upload ----------
  let lastUploadedImageTag = '';

  document.getElementById('img-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const wrap = document.getElementById('imgPreviewWrap');
    document.getElementById('imgResultPanel').style.display = 'none';
    lastUploadedImageTag = '';
    if (!file) { wrap.style.display = 'none'; return; }
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('imgPreview').src = reader.result;
      wrap.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btnUploadImage').addEventListener('click', async () => {
    const btn = document.getElementById('btnUploadImage');
    const file = document.getElementById('img-file').files[0];
    if (!file) { showBanner('Choose an image file first.', 'err'); return; }
    if (file.size > 5 * 1024 * 1024) { showBanner('Keep images under 5MB for a fast page load.', 'err'); return; }

    setBusy(btn, true, 'Uploading…');
    try {
      const result = await CMS.uploadImage(file);
      document.getElementById('imgUrlRoot').value = result.relativeFromRoot;
      document.getElementById('imgUrlBlog').value = result.relativeFromBlogPost;
      document.getElementById('imgUrlLive').value = result.pagesUrl;
      lastUploadedImageTag = `<img src="${result.relativeFromRoot}" alt="" loading="lazy">`;
      document.getElementById('imgResultPanel').style.display = 'block';
      showBanner(`Uploaded — live in ~30-60s.`, 'ok');
    } catch (e) {
      showBanner(e.message, 'err');
    } finally {
      setBusy(btn, false);
    }
  });

  document.getElementById('btnCopyImgTag').addEventListener('click', () => {
    if (!lastUploadedImageTag) return;
    const finish = () => {
      const msg = document.getElementById('msg-image');
      msg.classList.add('show');
      setTimeout(() => msg.classList.remove('show'), 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastUploadedImageTag).then(finish).catch(() => {});
    }
  });

  // ---------- Init ----------
  loadSavedConfig();
  tryAutoConnect();
})();
