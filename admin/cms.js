/* ===========================================================
   ASRBMY Admin CMS — talks directly to the GitHub Contents API
   from the browser using a personal access token you provide.

   Nothing here is sent to any third party. The token is stored
   only in this browser's localStorage and used only for direct
   calls to api.github.com over HTTPS.
   =========================================================== */

const CMS = (() => {
  const CONFIG_KEY = 'asrbmy-cms-config';

  function getConfig() {
    try { return JSON.parse(localStorage.getItem(CONFIG_KEY)) || null; }
    catch (e) { return null; }
  }
  function saveConfig(cfg) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  }
  function clearConfig() {
    localStorage.removeItem(CONFIG_KEY);
  }

  function apiBase() {
    const cfg = getConfig();
    if (!cfg) throw new Error('Not connected. Add your repo + token first.');
    return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/`;
  }

  function headers() {
    const cfg = getConfig();
    return {
      'Authorization': `token ${cfg.token}`,
      'Accept': 'application/vnd.github+json'
    };
  }

  // ---- UTF-8 safe base64 helpers (handles emoji, non-Latin text, etc.) ----
  function b64Encode(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary);
  }
  function b64Decode(str) {
    const binary = atob(str.replace(/\n/g, ''));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  async function testConnection() {
    const cfg = getConfig();
    const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, { headers: headers() });
    if (!res.ok) throw new Error(`Connection failed (${res.status}). Check owner/repo/branch/token.`);
    return res.json();
  }

  async function getFile(path) {
    const cfg = getConfig();
    const res = await fetch(apiBase() + path + `?ref=${encodeURIComponent(cfg.branch)}`, { headers: headers() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to read ${path} (${res.status})`);
    const data = await res.json();
    return { content: b64Decode(data.content), sha: data.sha };
  }

  async function putFile(path, content, message, sha) {
    return putFileRaw(path, b64Encode(content), message, sha);
  }

  // For binary content (images) that's already base64-encoded — skips text re-encoding.
  async function putFileRaw(path, base64Content, message, sha) {
    const cfg = getConfig();
    const body = {
      message,
      content: base64Content,
      branch: cfg.branch
    };
    if (sha) body.sha = sha;
    const res = await fetch(apiBase() + path, {
      method: 'PUT',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to save ${path} (${res.status}): ${err.message || 'unknown error'}`);
    }
    return res.json();
  }

  async function deleteFile(path, sha, message) {
    const cfg = getConfig();
    const res = await fetch(apiBase() + path, {
      method: 'DELETE',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sha, branch: cfg.branch })
    });
    if (!res.ok) throw new Error(`Failed to delete ${path} (${res.status})`);
    return res.json();
  }

  // ---- image upload ----
  async function uploadImage(file, commitMessage) {
    const cfg = getConfig();
    const base64Content = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-]/g, '-').replace(/-+/g, '-');
    const path = `assets/uploads/${Date.now()}-${safeName}`;
    await putFileRaw(path, base64Content, commitMessage || `Upload image: ${safeName}`);

    // User (root) Pages sites are named exactly "<owner>.github.io"; anything else is a project site
    // served under a /<repo>/ subpath.
    const isUserSite = cfg.repo.toLowerCase() === `${cfg.owner.toLowerCase()}.github.io`;
    const pagesUrl = isUserSite
      ? `https://${cfg.owner}.github.io/${path}`
      : `https://${cfg.owner}.github.io/${cfg.repo}/${path}`;

    return {
      path,
      pagesUrl,
      relativeFromRoot: path,
      relativeFromBlogPost: '../../' + path
    };
  }

  // ---- posts.js helpers ----
  async function loadPosts() {
    const file = await getFile('blog/posts.js');
    if (!file) throw new Error('blog/posts.js not found in this repo/branch.');
    const match = file.content.match(/const\s+POSTS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/m);
    if (!match) throw new Error('Could not parse blog/posts.js — unexpected format.');
    const arr = JSON.parse(match[1]);
    return { arr, sha: file.sha };
  }

  function buildPostsJs(arr) {
    return `/*
  POSTS — the single source of truth for the blog listing page.
  This file is maintained by the Admin CMS (/admin/index.html).
*/
const POSTS = ${JSON.stringify(arr, null, 2)};
`;
  }

  async function savePosts(arr, sha, message) {
    return putFile('blog/posts.js', buildPostsJs(arr), message, sha);
  }

  // ---- index.html helpers (DOM-based, safe insert/remove) ----
  async function loadIndex() {
    const file = await getFile('index.html');
    if (!file) throw new Error('index.html not found in this repo/branch.');
    return file; // {content, sha}
  }

  function parseDoc(html) {
    return new DOMParser().parseFromString(html, 'text/html');
  }
  function serializeDoc(doc) {
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML + '\n';
  }

  async function addCardToGrid(gridId, snippetHtml, commitMessage) {
    const file = await loadIndex();
    const doc = parseDoc(file.content);
    const grid = doc.getElementById(gridId);
    if (!grid) throw new Error(`Couldn't find #${gridId} in index.html`);
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = snippetHtml.trim();
    Array.from(wrapper.children).forEach(el => grid.appendChild(el));
    const newHtml = serializeDoc(doc);
    return putFile('index.html', newHtml, commitMessage, file.sha);
  }

  async function listGridItems(gridId) {
    const file = await loadIndex();
    const doc = parseDoc(file.content);
    const grid = doc.getElementById(gridId);
    if (!grid) throw new Error(`Couldn't find #${gridId} in index.html`);
    return Array.from(grid.children).map((el, i) => ({
      index: i,
      label: (el.querySelector('h3')?.textContent || el.textContent || '').trim().slice(0, 80),
      outerHTML: el.outerHTML
    }));
  }

  async function deleteGridItem(gridId, index, commitMessage) {
    const file = await loadIndex();
    const doc = parseDoc(file.content);
    const grid = doc.getElementById(gridId);
    if (!grid) throw new Error(`Couldn't find #${gridId} in index.html`);
    const child = grid.children[index];
    if (!child) throw new Error('Item not found (index out of range).');
    child.remove();
    const newHtml = serializeDoc(doc);
    return putFile('index.html', newHtml, commitMessage, file.sha);
  }

  async function replaceGridItem(gridId, index, newSnippetHtml, commitMessage) {
    const file = await loadIndex();
    const doc = parseDoc(file.content);
    const grid = doc.getElementById(gridId);
    if (!grid) throw new Error(`Couldn't find #${gridId} in index.html`);
    const child = grid.children[index];
    if (!child) throw new Error('Item not found (index out of range).');
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = newSnippetHtml.trim();
    const replacement = wrapper.firstElementChild;
    if (!replacement) throw new Error('Generated snippet was empty.');
    grid.replaceChild(replacement, child);
    const newHtml = serializeDoc(doc);
    return putFile('index.html', newHtml, commitMessage, file.sha);
  }

  // ---- sitemap.xml + rss.xml — regenerated whenever posts change ----
  function buildSitemapXml(siteUrl, posts) {
    const urls = [
      { loc: `${siteUrl}/`, priority: '1.0' },
      { loc: `${siteUrl}/blog/index.html`, priority: '0.8' },
      ...posts.map(p => ({ loc: `${siteUrl}/blog/${p.url}`, priority: '0.6', lastmod: p.date }))
    ];
    const body = urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  }

  function buildRssXml(siteUrl, posts) {
    const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const items = sorted.map(p => `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${siteUrl}/blog/${p.url}</link>
    <guid>${siteUrl}/blog/${p.url}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${escapeXml(p.excerpt || '')}</description>
  </item>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>ASRBMY — Write-ups</title>
  <link>${siteUrl}/blog/index.html</link>
  <description>CTF write-ups, OSINT notes, and things learned while building — Ajit Singh Rathore (ASRBMY)</description>
${items}
</channel>
</rss>
`;
  }

  function escapeXml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  async function regenerateFeeds(posts, siteUrl) {
    const sitemapXml = buildSitemapXml(siteUrl, posts);
    const rssXml = buildRssXml(siteUrl, posts);

    const existingSitemap = await getFile('sitemap.xml');
    await putFile('sitemap.xml', sitemapXml, 'Update sitemap.xml', existingSitemap?.sha);

    const existingRss = await getFile('rss.xml');
    await putFile('rss.xml', rssXml, 'Update rss.xml', existingRss?.sha);
  }

  function getSiteUrl() {
    const cfg = getConfig();
    const isUserSite = cfg.repo.toLowerCase() === `${cfg.owner.toLowerCase()}.github.io`;
    return isUserSite ? `https://${cfg.owner}.github.io` : `https://${cfg.owner}.github.io/${cfg.repo}`;
  }

  return {
    getConfig, saveConfig, clearConfig,
    testConnection,
    getFile, putFile, putFileRaw, deleteFile, uploadImage,
    loadPosts, savePosts,
    loadIndex, addCardToGrid, listGridItems, deleteGridItem, replaceGridItem,
    regenerateFeeds, getSiteUrl
  };
})();
