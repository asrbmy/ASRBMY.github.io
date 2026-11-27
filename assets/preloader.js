/*
  Loading screen: the ASRBMY logo is drawn line by line, then the page fades in.
  - Used on the homepage only (so blog posts and project pages stay fast for search engines).
  - Shows once per browser session. Set ALWAYS = true to show it on every visit.
  - Skipped automatically for visitors who prefer reduced motion. Click or press Esc to skip.
  - The logo paths below were traced from your logo file; no image is downloaded.
*/
(function () {
  var ALWAYS = false;     // true = show on every page load
  var MIN_MS = 2700;      // shortest time the screen stays up (so the drawing can finish)
  var MAX_MS = 6500;      // safety limit if the page is slow to load
  var KEY = 'asrbmy-preloaded';

  try { if (!ALWAYS && sessionStorage.getItem(KEY)) return; } catch (e) {}
  try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

  var css = '' +
    'html.pl-lock{overflow:hidden}' +
    '#pl{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;' +
      'background:#0B1220;background-image:linear-gradient(rgba(79,209,197,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(79,209,197,.05) 1px,transparent 1px);background-size:40px 40px;' +
      'transition:opacity .6s ease,visibility .6s ease}' +
    '#pl.pl-out{opacity:0;visibility:hidden}' +
    '#pl svg{width:min(46vmin,240px);height:auto;overflow:visible;animation:pl-glow .7s ease 2.35s both}' +
    '#pl .pl-disc{fill:#11265D;opacity:0;transform-origin:center;transform-box:fill-box;animation:pl-disc .6s ease .05s forwards}' +
    '#pl .pl-lines path{fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;' +
      'animation:pl-draw var(--t) cubic-bezier(.5,0,.3,1) var(--d) forwards}' +
    '#pl .pl-label{font-family:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.32em;color:#4FD1C5;text-transform:uppercase;padding-left:.32em}' +
    '#pl .pl-label i{font-style:normal;animation:pl-blink 1s steps(2,end) infinite}' +
    '#pl .pl-bar{width:min(46vmin,240px);height:2px;background:rgba(79,209,197,.18);border-radius:2px;overflow:hidden}' +
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
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><circle class="pl-disc" cx="230.0" cy="230.0" r="226.0"/><g class="pl-lines"><path pathLength="1" d="M272 19L254 15L223 13L187 18L184 20" style="--d:0.29s;--t:0.52s"/><path pathLength="1" d="M183 20L180 19L153 27L122 43" style="--d:0.32s;--t:0.48s"/><path pathLength="1" d="M273 19L305 27L332 40L334 43" style="--d:0.33s;--t:0.48s"/><path pathLength="1" d="M335 44L349 50L356 56" style="--d:0.38s;--t:0.4s"/><path pathLength="1" d="M229 93L252 48L272 20" style="--d:0.38s;--t:0.51s"/><path pathLength="1" d="M227 93L209 56L184 21" style="--d:0.39s;--t:0.51s"/><path pathLength="1" d="M339 70L344 84" style="--d:0.44s;--t:0.38s"/><path pathLength="1" d="M112 72L112 77L108 85" style="--d:0.44s;--t:0.38s"/><path pathLength="1" d="M240 161L250 135L259 119L276 96L301 69L334 44" style="--d:0.51s;--t:0.64s"/><path pathLength="1" d="M215 161L213 153L197 119L181 96L148 62L122 45" style="--d:0.51s;--t:0.64s"/><path pathLength="1" d="M339 69L337 67L331 68L295 100L268 139L256 165L241 162" style="--d:0.52s;--t:0.63s"/><path pathLength="1" d="M214 162L198 164L196 162L191 147L176 120L158 97L146 85L120 65L117 65L112 71" style="--d:0.53s;--t:0.65s"/><path pathLength="1" d="M239 162L216 162" style="--d:0.66s;--t:0.39s"/><path pathLength="1" d="M269 254L266 232L266 209L277 165L293 133L307 114L319 102L322 102L325 109L326 136L323 158L316 186L298 223L284 242L270 254" style="--d:0.69s;--t:1.0s"/><path pathLength="1" d="M167 146L153 123L144 112L130 100L127 109L126 145L138 194L156 228L174 250L184 258L186 256L188 245L188 215L186 200L175 161" style="--d:0.71s;--t:0.99s"/><path pathLength="1" d="M156 343L145 328L122 280L115 261L104 216L100 160L104 110L109 92L108 85" style="--d:0.77s;--t:0.87s"/><path pathLength="1" d="M111 71L103 74L79 95L63 114L49 137L38 160L27 201L24 235L31 284L49 327L68 354L84 371L100 384" style="--d:0.79s;--t:1.0s"/><path pathLength="1" d="M344 86L343 91L350 136L350 190L346 218L334 262L318 303L305 328L294 342" style="--d:0.79s;--t:0.87s"/><path pathLength="1" d="M343 387L354 381L375 361L395 333L411 304L423 262L425 216L423 199L416 170L407 147L395 124L365 86L346 71L340 69" style="--d:0.81s;--t:1.0s"/><path pathLength="1" d="M108 85L105 87L97 105L86 140L77 183L73 226L73 257L79 309L87 344L101 379L101 383" style="--d:0.82s;--t:0.94s"/><path pathLength="1" d="M108 408L102 406L82 390L54 361L38 338L24 309L13 272L9 239L9 221L13 190L22 156L46 111L63 89L82 69L104 52L121 44" style="--d:0.82s;--t:1.0s"/><path pathLength="1" d="M345 85L350 92L364 134L371 170L375 203L375 256L371 294L364 325L350 368L342 386" style="--d:0.83s;--t:0.95s"/><path pathLength="1" d="M346 406L356 402L368 393L391 370L412 343L421 327L437 287L445 239L440 184L434 162L421 130L416 124L412 114L396 94L361 60" style="--d:0.86s;--t:1.0s"/><path pathLength="1" d="M293 342L286 335L277 321L264 293L259 292L239 296L209 296L187 293L170 328L157 343" style="--d:1.03s;--t:0.72s"/><path pathLength="1" d="M178 347L190 325L216 328L242 328L264 325L271 338" style="--d:1.08s;--t:0.57s"/><path pathLength="1" d="M235 349L227 338" style="--d:1.11s;--t:0.38s"/><path pathLength="1" d="M225 338L216 352" style="--d:1.11s;--t:0.38s"/><path pathLength="1" d="M287 358L282 348L272 339" style="--d:1.12s;--t:0.4s"/><path pathLength="1" d="M178 347L174 349L166 362" style="--d:1.13s;--t:0.39s"/><path pathLength="1" d="M215 352L211 352L201 358L195 376" style="--d:1.15s;--t:0.42s"/><path pathLength="1" d="M256 374L254 372L251 357L245 352L236 350" style="--d:1.15s;--t:0.42s"/><path pathLength="1" d="M156 344L140 364L108 389" style="--d:1.16s;--t:0.48s"/><path pathLength="1" d="M288 359L298 367L301 373" style="--d:1.17s;--t:0.39s"/><path pathLength="1" d="M294 343L306 359L321 374L335 385L341 387" style="--d:1.17s;--t:0.47s"/><path pathLength="1" d="M152 376L153 373L165 363" style="--d:1.18s;--t:0.39s"/><path pathLength="1" d="M178 347L179 349L172 373L169 393L171 435" style="--d:1.2s;--t:0.52s"/><path pathLength="1" d="M301 374L300 381L302 390" style="--d:1.2s;--t:0.38s"/><path pathLength="1" d="M152 378L151 392" style="--d:1.21s;--t:0.38s"/><path pathLength="1" d="M243 442L246 399L241 367L235 351" style="--d:1.22s;--t:0.53s"/><path pathLength="1" d="M302 374L345 406" style="--d:1.22s;--t:0.45s"/><path pathLength="1" d="M109 408L151 377" style="--d:1.23s;--t:0.45s"/><path pathLength="1" d="M287 360L292 392L291 432" style="--d:1.24s;--t:0.49s"/><path pathLength="1" d="M271 340L283 388L284 417L282 435" style="--d:1.24s;--t:0.54s"/><path pathLength="1" d="M166 364L161 399L162 432" style="--d:1.25s;--t:0.48s"/><path pathLength="1" d="M303 405L302 392" style="--d:1.25s;--t:0.38s"/><path pathLength="1" d="M331 415L306 391L303 391" style="--d:1.25s;--t:0.42s"/><path pathLength="1" d="M257 375L260 375L273 388L274 421L272 437" style="--d:1.25s;--t:0.49s"/><path pathLength="1" d="M151 394L150 405" style="--d:1.25s;--t:0.37s"/><path pathLength="1" d="M181 437L178 416L178 392L187 381L194 377" style="--d:1.25s;--t:0.48s"/><path pathLength="1" d="M124 416L147 393L150 393" style="--d:1.25s;--t:0.42s"/><path pathLength="1" d="M216 353L206 395L206 416L209 441" style="--d:1.25s;--t:0.52s"/><path pathLength="1" d="M255 440L258 414L256 376" style="--d:1.27s;--t:0.47s"/><path pathLength="1" d="M195 378L193 415L196 440" style="--d:1.28s;--t:0.47s"/><path pathLength="1" d="M331 415L340 412L345 407" style="--d:1.28s;--t:0.38s"/><path pathLength="1" d="M123 417L113 413L109 409" style="--d:1.28s;--t:0.38s"/><path pathLength="1" d="M321 420L304 406" style="--d:1.28s;--t:0.39s"/><path pathLength="1" d="M149 406L132 421" style="--d:1.28s;--t:0.39s"/><path pathLength="1" d="M303 406L301 428" style="--d:1.29s;--t:0.39s"/><path pathLength="1" d="M151 428L150 407" style="--d:1.29s;--t:0.39s"/><path pathLength="1" d="M331 415L322 420" style="--d:1.29s;--t:0.37s"/><path pathLength="1" d="M132 422L150 429" style="--d:1.31s;--t:0.39s"/><path pathLength="1" d="M302 429L306 429L321 421" style="--d:1.32s;--t:0.39s"/><path pathLength="1" d="M161 433L151 430" style="--d:1.33s;--t:0.37s"/><path pathLength="1" d="M292 433L301 430" style="--d:1.33s;--t:0.37s"/><path pathLength="1" d="M162 433L170 436" style="--d:1.34s;--t:0.37s"/><path pathLength="1" d="M291 433L283 436" style="--d:1.34s;--t:0.37s"/><path pathLength="1" d="M273 438L282 436" style="--d:1.34s;--t:0.37s"/><path pathLength="1" d="M180 438L174 438L171 436" style="--d:1.34s;--t:0.37s"/><path pathLength="1" d="M181 438L184 440L195 441" style="--d:1.35s;--t:0.38s"/><path pathLength="1" d="M272 438L265 441L256 441" style="--d:1.35s;--t:0.38s"/><path pathLength="1" d="M208 442L197 441" style="--d:1.35s;--t:0.37s"/><path pathLength="1" d="M255 441L244 443" style="--d:1.35s;--t:0.37s"/><path pathLength="1" d="M240 443L221 444L209 442" style="--d:1.36s;--t:0.41s"/></g></svg>' +
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
