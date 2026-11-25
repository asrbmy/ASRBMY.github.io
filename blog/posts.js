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
    "title": "Sample write-up — replace me",
    "date": "2026-07-04",
    "excerpt": "This is a placeholder entry so the blog isn't empty. Replace it with your first real write-up, or delete it once you've published one.",
    "tags": ["Meta"],
    "readTime": "2 min read",
    "url": "posts/sample-post.html"
  }
];
