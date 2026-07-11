/*
  POSTS — the single source of truth for the blog listing page.

  This file is edited automatically by the Admin CMS (/admin/index.html).
  You can still edit it by hand if you prefer — just keep the keys quoted
  so it stays valid JSON inside the POSTS array (the CMS relies on that).

  Fields:
    title     - post title shown on the card and the post page
    date      - "YYYY-MM-DD", used for sorting and the displayed date
    excerpt   - 1-2 sentence summary shown on the card
    tags      - array of strings, used to generate filter chips automatically
    readTime  - optional, e.g. "5 min read"
    url       - path to the post's HTML file, relative to /blog/
*/
const POSTS = [
  {
    title: "Defending Against Malicious Extensions",
    date: "2026-07-11",
    excerpt: "A Guide for Security Teams",
    tags: ["Security"],
    readTime: "8 min read",
    url: "posts/Defending Against Malicious Extensions.html"
  },
  {
    title: "MDocForge Pro — Design by Link with IQ (ASRBMY)",
    date: "2026-07-07",
    excerpt: "MDocForge Pro is the enhanced edition of MDocForge — a single-file, browser-based, block-based Markdown/HTML document editor with live preview and multi-format export (PDF, Word, HTML, Markdown, PNG, plain text).",
    tags: ["MDocForge"],
    readTime: "7 min read",
    url: "posts/MDocForge-Pro.html"
  },
  {
    title: "MDocForge — Design by Link with IQ (ASRBMY)",
    date: "2026-07-07",
    excerpt: "MDocForge is a single-file, browser-based document editor that lets you write in Markdown or HTML, see a live visual preview as you type, and export the result to PDF, Word (.docx), HTML, Markdown, PNG, or plain text — all without a server or sign-up. Everything runs locally in your browser tab.",
    tags: ["MDocForge"],
    readTime: "7 min read",
    url: "posts/MDocForge.html"
  },
  {
    "title": "Sample write-up — replace me",
    "date": "2026-07-04",
    "excerpt": "This is a placeholder entry so the blog isn't empty. Replace it with your first real write-up, or delete it once you've published one.",
    "tags": ["Meta"],
    "readTime": "2 min read",
    "url": "posts/sample-post.html"
  }
];
