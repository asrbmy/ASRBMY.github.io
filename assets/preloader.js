/*
  Loading screen: the ASRBMY logo is drawn line by line, then the page fades in.
  - Used on the homepage only (so blog posts and project pages stay fast for search engines).
  - Shows on every homepage load. Set ALWAYS = false to show it once per browser session instead.
  - Skipped automatically for visitors who prefer reduced motion. Click or press Esc to skip.
  - The logo paths below were traced from your logo file; no image is downloaded.
*/
(function () {
  var ALWAYS = true;      // true = show on every homepage load, false = once per browser session
  var MIN_MS = 3100;      // shortest time the screen stays up (so the drawing can finish)
  var MAX_MS = 6500;      // safety limit if the page is slow to load
  var KEY = 'asrbmy-preloaded';

  if (navigator.webdriver || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)) return; // crawlers and automated tests go straight to the page
  try { if (!ALWAYS && sessionStorage.getItem(KEY)) return; } catch (e) {}
  var STATIC = false; // visitors/devices with 'reduce motion' on get a calm, non-animated version
  try { STATIC = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}
  if (STATIC) MIN_MS = 1200;
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

  var css = '' +
    '#pl.pl-light{background-color:#F4F6FA;background-image:linear-gradient(rgba(29,63,158,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(29,63,158,.07) 1px,transparent 1px)}' +
    '#pl.pl-light .pl-disc{fill:#fff}' +
    '#pl.pl-light .pl-lines path{stroke:#1D3F9E}' +
    '#pl.pl-light .pl-label{color:#0A7D73}' +
    '#pl.pl-light .pl-bar{background:rgba(29,63,158,.15)}' +
    '#pl.pl-light .pl-bar b{background:#1D3F9E}' +
    '@keyframes pl-glow-l{0%{filter:drop-shadow(0 0 0 rgba(29,63,158,0))}50%{filter:drop-shadow(0 0 16px rgba(29,63,158,.45))}100%{filter:drop-shadow(0 0 6px rgba(29,63,158,.22))}}' +
    '#pl.pl-light svg{animation-name:pl-glow-l}' +
    '#pl.pl-static *{animation:none!important}#pl.pl-static .pl-disc{opacity:1}#pl.pl-static .pl-lines path{stroke-dashoffset:0}#pl.pl-static .pl-bar b{transform:scaleX(1)}' +
    'html.pl-lock{overflow:hidden}' +
    '#pl{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;' +
      'background:#0B1220;background-image:linear-gradient(rgba(79,209,197,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(79,209,197,.05) 1px,transparent 1px);background-size:40px 40px;' +
      'transition:opacity .6s ease,visibility .6s ease}' +
    '#pl.pl-out{opacity:0;visibility:hidden}' +
    '#pl svg{width:min(58vmin,300px);height:auto;overflow:visible;animation:pl-glow .7s ease 2.25s both}' +
    '#pl .pl-disc{fill:#11265D;opacity:0;transform-origin:center;transform-box:fill-box;animation:pl-disc .6s ease .05s forwards}' +
    '#pl .pl-lines path{fill:none;stroke:#fff;stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1;stroke-dashoffset:1;' +
      'animation:pl-draw var(--t) cubic-bezier(.5,0,.3,1) var(--d) forwards}' +
    '#pl .pl-label{font-family:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.32em;color:#4FD1C5;text-transform:uppercase;padding-left:.32em}' +
    '#pl .pl-label i{font-style:normal;animation:pl-blink 1s steps(2,end) infinite}' +
    '#pl .pl-bar{width:min(58vmin,300px);height:2px;background:rgba(79,209,197,.18);border-radius:2px;overflow:hidden}' +
    '#pl .pl-bar b{display:block;height:100%;width:100%;background:#4FD1C5;transform:scaleX(0);transform-origin:left;animation:pl-bar 2.5s cubic-bezier(.4,0,.2,1) .1s forwards}' +
    '@keyframes pl-draw{to{stroke-dashoffset:0}}' +
    '@keyframes pl-disc{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}' +
    '@keyframes pl-bar{to{transform:scaleX(1)}}' +
    '@keyframes pl-blink{50%{opacity:0}}' +
    '@keyframes pl-glow{0%{filter:drop-shadow(0 0 0 rgba(79,209,197,0))}50%{filter:drop-shadow(0 0 18px rgba(79,209,197,.75))}100%{filter:drop-shadow(0 0 8px rgba(79,209,197,.35))}}';

  var style = document.createElement('style');
  style.id = 'pl-style';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  var el = document.createElement('div');
  el.id = 'pl';
  var light = false;
  try { light = localStorage.getItem('asrbmy-theme') === 'light'; } catch (e) {}
  el.className = (STATIC ? 'pl-static ' : '') + (light ? 'pl-light' : '');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><circle class="pl-disc" cx="230" cy="230" r="227"/><g class="pl-lines"><path pathLength="1" d="M273.3 20l-2.7 -1.3l-12.4 -2.1l-27.1 -2.6l-7.5 0.2l-15.6 1.7l-16.1 2.2l-8.2 1.9" style="--d:0.24s;--t:0.45s"/><path pathLength="1" d="M122 43.7l2.5 -2.2l5.8 -3.1l26.1 -11.5l18.1 -5.8l5.8 -1.1l3 0.3" style="--d:0.27s;--t:0.41s"/><path pathLength="1" d="M273.3 20l6.5 0.5l9.1 2.1l18.5 6l23.1 11.1l3.2 2.1l1.6 1.9" style="--d:0.27s;--t:0.41s"/><path pathLength="1" d="M183.7 20.7l2.7 4.2l10.5 13.2l13 20.3l6.9 13l8.1 18l3.1 5.6" style="--d:0.32s;--t:0.44s"/><path pathLength="1" d="M273.3 20l-0.6 1.5l-12.8 17.3l-8.7 12.8l-12.9 23.8l-7.6 16.5l-2.4 3.1" style="--d:0.33s;--t:0.45s"/><path pathLength="1" d="M114 69.7l-1 4.8l-2.7 6.2" style="--d:0.36s;--t:0.32s"/><path pathLength="1" d="M339 68.7l0.9 4.1l1.8 4.5" style="--d:0.36s;--t:0.32s"/><path pathLength="1" d="M122 44.3l2.9 2.7l16.4 10.7l7.7 5.8l15.2 14.7l18.1 20.1l7.4 9.9l10.7 17.6l5.4 11.1l6.2 14.3l3.4 8.9l0.3 1.9" style="--d:0.41s;--t:0.56s"/><path pathLength="1" d="M240.7 162.7l0.7 -3.9l4.3 -11.8l4.5 -10.2l5.1 -9.8l7.3 -11.3l16.2 -21.6l17.9 -20.1l13.1 -10.8l21.8 -15.9l3.7 -3.3" style="--d:0.42s;--t:0.56s"/><path pathLength="1" d="M114 69.3l2.3 -2.3l1.9 -1.1l3 0.5l3 1.5l20.8 16.9l9.9 9.3l13.9 16.8l10.5 14.9l11.1 20.4l7.3 17.5" style="--d:0.43s;--t:0.53s"/><path pathLength="1" d="M241 163l15.6 1.7l10.4 -21.9l16.9 -26.5l12.5 -16.6l7.5 -7.7l23.3 -19.9l8.3 -5.3l1.4 -0.1l2.1 1.6" style="--d:0.43s;--t:0.55s"/><path pathLength="1" d="M215.7 162.3l-6.1 0.9l-11.6 0.8" style="--d:0.56s;--t:0.33s"/><path pathLength="1" d="M240.3 163l-24.3 -0.7" style="--d:0.55s;--t:0.34s"/><path pathLength="1" d="M166.7 145l-5.1 -8.8l-5.6 -8.2l-11.3 -14.4l-6.1 -6.9l-5.9 -5.5l-1.5 -0.9l-1.3 0.4l-0.9 1.6l-1.7 14.5l-0.5 16.6l0.2 12.4l3.1 16.4l5.4 20.1l5.9 17.9l5.2 11.2l5.3 9.5l4.9 7.6l14.9 18.4l5.3 5.8l5 4.7l2.7 1.2l0.6 -0.5l0.9 -2.7l1.7 -9.6l0.6 -17l-0.8 -17.2l-3.3 -18.9l-3.6 -13.5l-5.3 -16.5" style="--d:0.59s;--t:0.85s"/><path pathLength="1" d="M269.3 255l-1.3 -9.2l-1 -15.3l0.1 -20.5l1.9 -12.9l7.7 -28.1l4.9 -12.2l3.8 -8.1l9.7 -16.7l6.2 -8.8l9.8 -12.3l9.1 -8.7l1.6 -0.2l1.4 1.3l1.6 5.2l1.3 15l0.1 10.3l-1.4 13.6l-4.3 23.5l-4.1 14.4l-8.7 20.5l-6.6 12.3l-6.1 9.9l-7 9.5l-6.1 7.2l-8.9 8.6l-3.3 2" style="--d:0.59s;--t:0.87s"/><path pathLength="1" d="M294.3 342.7l3.3 -3.6l4.2 -5.9l8.1 -13.5l6 -12.4l7.7 -18.2l7.7 -20.3l7 -21.1l5.1 -17.6l2.7 -12.4l3 -19.6l0.5 -6.8l0.4 -20.6l-0.2 -32.3l-2.8 -28.7l-2.7 -16.9l-2.8 -12.2l0.2 -2.9" style="--d:0.64s;--t:0.76s"/><path pathLength="1" d="M156.7 344l-5.7 -7.4l-5.1 -8.4l-13.4 -25.8l-5.1 -10.6l-8.6 -22.1l-4.3 -14.9l-10.6 -44l-1.3 -11.1l-1.9 -27.1l0.2 -11.9l3.4 -41.6l2.8 -18.4l3.8 -19l-0.6 -1" style="--d:0.68s;--t:0.76s"/><path pathLength="1" d="M108.3 408.7l-3.6 -1.6l-12.8 -9.3l-8.3 -6.7l-9.6 -8.9l-13.4 -14.4l-10.1 -12.2l-8.8 -12.5l-4.3 -7.5l-6.2 -12.1l-7.4 -17.4l-5.1 -15.9l-2.9 -11l-3.4 -15.9l-1.5 -11.8l-1.1 -16.1l0 -9.2l1.1 -14.3l2 -16.1l3.4 -15.7l5.3 -20.5l3.8 -8.7l9.3 -18.4l9.7 -17.3l6.1 -9.3l12.1 -15l13.1 -14l10.3 -10.2l10.8 -8.5l10.1 -6.8l9 -5.3l3.5 -1.6l2.3 -0.5" style="--d:0.69s;--t:0.95s"/><path pathLength="1" d="M113.7 69.3l-3.1 0.6l-11.6 8.2l-11.7 10l-10.9 11.1l-8.2 9.4l-4.1 5.6l-9.2 14.4l-6.4 11.5l-5.8 11.9l-5.1 13.1l-7.7 26.4l-2.2 12.7l-2.6 31l0.1 10.4l3.2 20.6l3.3 16l2.9 10l4.5 12.6l5.6 12.6l7.8 14.2l9.3 13.6l10.6 13.4l10.8 11.2l11.3 10.8l4.7 3.7l3.5 1.4" style="--d:0.69s;--t:0.92s"/><path pathLength="1" d="M342 77.7l2.4 1.7l1.6 3l9.9 26.5l4.5 14l6.1 24.6l5.9 33.3l1.7 14.2l1.1 16.9l0.5 25.6l-0.3 12.3l-1.2 18.3l-3.1 25l-2.6 14.1l-6.8 25.3l-7.8 24.3l-5.5 14.7l-7.4 15.8" style="--d:0.7s;--t:0.83s"/><path pathLength="1" d="M339.3 68.3l6.3 3l12.5 9l5.7 5.2l23.2 27.5l9.9 15l7 12.7l6.7 14.5l2.6 6.8l4.4 14l3 11.5l1.8 8.9l1.9 14.4l0.8 19.2l-1.2 24.2l-3.1 18.5l-3.3 12.1l-4.2 12.6l-4.3 10.6l-6 11.9l-8.7 14.8l-7.1 10.7l-9 11.8l-7.4 8.3l-8.7 8.5l-10.9 9.4l-7.7 5l-1.5 0.2l-1 -0.6" style="--d:0.69s;--t:0.93s"/><path pathLength="1" d="M335.7 44l5.3 2.1l9.9 6.1l9.2 7.3l15.5 13.7l8.9 8.8l14.4 16.3l9.4 11.8l5.4 7.9l8.2 14.5l4.8 10.6l6.5 17.6l5 16l4.1 20.6l1.8 18.2l1 19.5l-0.3 9.1l-2.1 15l-4.2 21.6l-2.6 9.5l-3 8.8l-7.1 17.4l-6 12.5l-9.2 15.8l-9.8 13.8l-8.4 10.3l-10.9 11.7l-11.3 10.6l-11.4 8.9l-5.5 3.7l-7 2.6" style="--d:0.71s;--t:0.95s"/><path pathLength="1" d="M110.3 80.7l-1.6 1.2l-2.5 4.5l-9.5 22.1l-5.7 17.7l-6 22.7l-4 18l-2.8 16.3l-2.5 20.6l-1.8 25.7l0.1 26.5l0.6 12.2l2.3 22.5l3.2 19.8l5.2 24.3l4.6 16l5 14.3l6.8 16.1l1.3 4.1" style="--d:0.72s;--t:0.82s"/><path pathLength="1" d="M157 344l5.3 -5l8.6 -12.3l6.2 -10.5l9.4 -19.7l1.8 -2.5l12.6 2.1l32.6 0.4l11.8 -0.9l18.3 -2.8l1 1.2l9.9 20.9l7.6 13.1l8.2 11.8l3.4 2.9" style="--d:0.88s;--t:0.62s"/><path pathLength="1" d="M180 344l10.3 -18.2l1.1 -0.3l8.2 0.5l12 1.7l18 0.8l16 -0.5l15.4 -2.1l3.7 -0.1l1.9 2.2l3.7 7.7" style="--d:0.92s;--t:0.48s"/><path pathLength="1" d="M180 344l-3.2 2.8l-2.9 3.5l-7.9 12" style="--d:0.97s;--t:0.34s"/><path pathLength="1" d="M217 351.7l6.6 -10.8l2.4 -2.6" style="--d:0.95s;--t:0.33s"/><path pathLength="1" d="M236 350.7l-1.3 -1.4l-5.2 -8.3l-2.8 -2.7" style="--d:0.95s;--t:0.33s"/><path pathLength="1" d="M287.3 357l-2.9 -5.5l-10.9 -13.5l-2.8 -2" style="--d:0.95s;--t:0.34s"/><path pathLength="1" d="M216.7 351.7l-3 0.4l-4.4 1.7l-4.9 2.5l-2.8 2.3l-1.6 4l-2.5 10.3l-1.2 2.4" style="--d:0.98s;--t:0.36s"/><path pathLength="1" d="M255.7 373.7l-0.9 -1.9l-0.3 -3.5l-2.1 -7.1l-2.5 -5.2l-0.9 -1l-5.2 -2.6l-4.4 -1.5l-3.4 -0.2" style="--d:0.99s;--t:0.36s"/><path pathLength="1" d="M300.7 372.7l-1 -2.6l-1.9 -2.9l-7.5 -8.3l-2.6 -1.6" style="--d:0.99s;--t:0.33s"/><path pathLength="1" d="M107.7 389.3l14.1 -9.7l14.9 -12.4l10.2 -10l5 -6l4.8 -6.9" style="--d:1.0s;--t:0.41s"/><path pathLength="1" d="M152.3 376l3.8 -5.1l5.8 -5.7l4.1 -2.9" style="--d:1.0s;--t:0.33s"/><path pathLength="1" d="M294 343l1.3 2.7l4.3 5.4l17.4 18.6l7.6 6.9l10.4 8.3l5.7 2.8" style="--d:1.0s;--t:0.41s"/><path pathLength="1" d="M107 389.3l-4 -3.3" style="--d:1.04s;--t:0.31s"/><path pathLength="1" d="M152.3 376l0.4 1.1l-0.1 4.1l-1.6 10.5" style="--d:1.03s;--t:0.33s"/><path pathLength="1" d="M180 344l0.4 0.8l-5.3 20.1l-3.8 16.8l-1.2 7.6l-0.3 27l1.5 20" style="--d:1.05s;--t:0.46s"/><path pathLength="1" d="M236 350.7l0.2 3l5.8 18.1l2.4 11.4l1.4 11.6l0.5 8.8l-0.3 14.4l-1.3 13.8l-1.7 10.9" style="--d:1.04s;--t:0.46s"/><path pathLength="1" d="M282.7 436.3l-0.2 -4.3l1.1 -10.9l0.6 -13l-1 -18.6l-1.7 -11l-2.7 -12.3l-3.5 -12.2l-3.6 -10.4l-1.7 -7.3" style="--d:1.04s;--t:0.47s"/><path pathLength="1" d="M302.7 390l-0.8 -1.6l-1 -5.6l-0.5 -6.8l0.3 -2.7" style="--d:1.03s;--t:0.33s"/><path pathLength="1" d="M346 406.3l-21.5 -14.8l-11.8 -9.4l-9.1 -8.1l-2.6 -1" style="--d:1.04s;--t:0.39s"/><path pathLength="1" d="M152.3 376l-3.9 2.4l-18.6 15.8l-18.5 12l-2.6 2.1" style="--d:1.05s;--t:0.39s"/><path pathLength="1" d="M123.3 417l21.4 -20.8l4.6 -3.7l1.7 -0.8" style="--d:1.07s;--t:0.36s"/><path pathLength="1" d="M150 405.7l0.6 -1.3l0.9 -5.7l0.2 -3.9l-0.7 -3.1" style="--d:1.07s;--t:0.32s"/><path pathLength="1" d="M166 362.3l0.4 2.8l-2.7 17.1l-1.9 18.9l0.3 22.3l0.9 10.6" style="--d:1.07s;--t:0.42s"/><path pathLength="1" d="M196.3 375.3l-2.8 1.2l-8.7 8.1l-5.3 6.3l-0.9 8.9l0 10.6l1 12l2.1 16.3" style="--d:1.06s;--t:0.42s"/><path pathLength="1" d="M197 441l-2.7 -23.4l-0.5 -10.8l0.4 -12.6l2.2 -16.1l-0.1 -2.8" style="--d:1.06s;--t:0.41s"/><path pathLength="1" d="M217 352l-0.7 3.5l-5 15.6l-3.6 17l-0.9 7.6l-0.3 6.8l0.3 16.7l1.3 12.1l2.2 11.4" style="--d:1.05s;--t:0.45s"/><path pathLength="1" d="M256 374l2.4 0.6l3.3 2.2l9.1 8.9l1.6 2.1l0.7 1.8l1.3 11.5l0.3 10.8l-0.9 13.9l-1.5 12.9" style="--d:1.06s;--t:0.42s"/><path pathLength="1" d="M292 433.3l-0.4 -2.4l1.1 -11.7l0.2 -9l-0.4 -12.8l-1.6 -16.6l-3.6 -19.4l0 -4.1" style="--d:1.05s;--t:0.43s"/><path pathLength="1" d="M302.7 390l-0.4 1l0 4.7l1 9.6" style="--d:1.06s;--t:0.33s"/><path pathLength="1" d="M123 417l-3.6 -1l-5.3 -2.5l-3.6 -2.4l-1.8 -2.1" style="--d:1.1s;--t:0.33s"/><path pathLength="1" d="M150 405.7l-4.1 2.7l-13.6 12.9" style="--d:1.09s;--t:0.34s"/><path pathLength="1" d="M255.7 374.3l1.7 11.3l0.9 13.6l0.1 10l-0.9 14.9l-2.2 17.6" style="--d:1.09s;--t:0.41s"/><path pathLength="1" d="M303.7 405.7l2.5 1.2l13.2 10.8l2.3 2.6" style="--d:1.1s;--t:0.34s"/><path pathLength="1" d="M302.7 390l3.8 2.2l23.8 21l1.7 2.1" style="--d:1.08s;--t:0.36s"/><path pathLength="1" d="M332 415.3l4.5 -1.5l5.2 -2.9l2.7 -1.9l1.6 -2.3" style="--d:1.09s;--t:0.33s"/><path pathLength="1" d="M132 421.7l-4.9 -1.6l-3.8 -2.8" style="--d:1.11s;--t:0.32s"/><path pathLength="1" d="M151.7 429.7l-1 -11.3l-0.2 -10.8l-0.5 -1.9" style="--d:1.1s;--t:0.34s"/><path pathLength="1" d="M301.7 430l-0.2 -1.8l1.2 -12l0.1 -8.3l0.5 -2.2" style="--d:1.11s;--t:0.34s"/><path pathLength="1" d="M301.7 430l3.6 -0.8l9.3 -4l6.2 -3.2l0.9 -1" style="--d:1.13s;--t:0.34s"/><path pathLength="1" d="M322 420.7l4.6 -1.4l3.8 -2.3l1.6 -1.7" style="--d:1.11s;--t:0.32s"/><path pathLength="1" d="M151.3 430l-3.1 -0.6l-13.8 -5.9l-2.1 -1.5" style="--d:1.13s;--t:0.33s"/><path pathLength="1" d="M151.7 430.3l4.5 2.2l6.5 1.8" style="--d:1.14s;--t:0.32s"/><path pathLength="1" d="M171 436.7l-2.5 -0.3l-5.2 -2.1" style="--d:1.15s;--t:0.31s"/><path pathLength="1" d="M282.7 436.3l-4.9 1.8l-5.1 0.9" style="--d:1.15s;--t:0.32s"/><path pathLength="1" d="M292 433.3l-3.3 1.6l-6 1.4" style="--d:1.15s;--t:0.32s"/><path pathLength="1" d="M292 433.3l7.3 -1.9l2.4 -1.4" style="--d:1.14s;--t:0.32s"/><path pathLength="1" d="M181.3 439l-3.6 -0.3l-6.4 -2" style="--d:1.15s;--t:0.32s"/><path pathLength="1" d="M181.7 439l8.6 2l6.4 0.3" style="--d:1.16s;--t:0.33s"/><path pathLength="1" d="M197.3 441.3l3.2 1.2l9.5 0.5" style="--d:1.16s;--t:0.32s"/><path pathLength="1" d="M243 443l-2.6 0.8l-9.2 0.4l-14.1 -0.2l-6.8 -1" style="--d:1.16s;--t:0.35s"/><path pathLength="1" d="M243.3 443l9 -0.2l3 -0.8" style="--d:1.16s;--t:0.32s"/><path pathLength="1" d="M255.7 442l10.7 -1.2l5.9 -1.8" style="--d:1.16s;--t:0.33s"/></g></svg>' +
    '<div class="pl-bar"><b></b></div>' +
    '<div class="pl-label">Loading<i>_</i></div>';
  document.documentElement.appendChild(el);
  document.documentElement.classList.add('pl-lock');

  var started = Date.now(), finished = false;
  function remove() {
    if (el.parentNode) el.parentNode.removeChild(el);
    if (style.parentNode) style.parentNode.removeChild(style);
    document.documentElement.classList.remove('pl-lock');
  }
  function finish() {
    if (finished) return;
    finished = true;
    el.classList.add('pl-out');
    setTimeout(remove, 700);
  }
  function whenReady() { setTimeout(finish, Math.max(0, MIN_MS - (Date.now() - started))); }

  if (document.readyState === 'complete') whenReady();
  else window.addEventListener('load', whenReady);
  setTimeout(finish, MAX_MS);

  el.addEventListener('click', finish);
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
})();
