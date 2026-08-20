/* Shared photo lightbox — linked by every pack (like _profit/, this
   directory has no manifest.json, so the registry never treats it as a
   pack; packs list "../_lightbox/lightbox.js" in their static entry).

   Zero dependencies and self-styling: the overlay CSS is injected from
   here, so adding the lightbox to a pack is one manifest line plus one
   <script> tag — no per-pack stylesheet edits. Progressive enhancement
   only: without JS the page is unchanged and images simply don't expand.

   Every content photo on the page becomes expandable EXCEPT images inside
   an <a> (portfolio property cards link through to the stay's own page —
   a click there must navigate, not zoom). */
(function () {
  "use strict";

  var CSS =
    ".lb-zoomable{cursor:zoom-in}" +
    ".lb-overlay{position:fixed;inset:0;z-index:1000;display:flex;" +
    "flex-direction:column;align-items:center;justify-content:center;" +
    "background:rgba(10,10,12,0.94);opacity:0;transition:opacity 200ms ease}" +
    ".lb-overlay.lb-in{opacity:1}" +
    ".lb-overlay img{max-width:94vw;max-height:86vh;width:auto;height:auto;" +
    "object-fit:contain;box-shadow:0 20px 60px rgba(0,0,0,0.5)}" +
    ".lb-caption{color:#fff;opacity:0.85;font:14px/1.5 system-ui,sans-serif;" +
    "margin-top:12px;max-width:80vw;text-align:center}" +
    ".lb-count{color:#fff;opacity:0.6;font:12px/1.5 system-ui,sans-serif;" +
    "position:absolute;top:14px;left:18px}" +
    ".lb-btn{position:absolute;display:flex;align-items:center;" +
    "justify-content:center;width:44px;height:44px;border:0;cursor:pointer;" +
    "border-radius:999px;background:rgba(255,255,255,0.12);color:#fff;" +
    "font:22px/1 system-ui,sans-serif;transition:background 150ms ease}" +
    ".lb-btn:hover{background:rgba(255,255,255,0.28)}" +
    ".lb-close{top:12px;right:14px}" +
    ".lb-prev{left:14px;top:50%;transform:translateY(-50%)}" +
    ".lb-next{right:14px;top:50%;transform:translateY(-50%)}" +
    "@media (max-width:700px){.lb-prev{left:6px}.lb-next{right:6px}}" +
    "@media (prefers-reduced-motion:reduce){.lb-overlay{transition:none}}" +
    "body.lb-open{overflow:hidden}";

  /* The largest rendition the page knows about: max-width srcset candidate,
     falling back to the plain src. */
  function largestUrl(img) {
    var srcset = img.getAttribute("srcset");
    if (!srcset) return img.currentSrc || img.src;
    var best = null, bestW = -1;
    srcset.split(",").forEach(function (part) {
      var bits = part.trim().split(/\s+/);
      var w = bits[1] && /^\d+w$/.test(bits[1]) ? parseInt(bits[1], 10) : 0;
      if (bits[0] && w >= bestW) { bestW = w; best = bits[0]; }
    });
    return best || img.currentSrc || img.src;
  }

  function eligible(img) {
    if (img.closest("a")) return false;          // navigation wins over zoom
    if (img.closest(".lb-overlay")) return false;
    if (img.closest("[data-no-lightbox]")) return false;
    return !!(img.currentSrc || img.src);
  }

  var photos = [];
  var overlay = null, frame = null, caption = null, count = null;
  var current = 0, lastFocus = null;

  function build() {
    overlay = document.createElement("div");
    overlay.className = "lb-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Photo viewer");
    overlay.innerHTML =
      '<span class="lb-count"></span>' +
      '<img alt="">' +
      '<p class="lb-caption"></p>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Close">×</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">‹</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Next photo">›</button>';
    frame = overlay.querySelector("img");
    caption = overlay.querySelector(".lb-caption");
    count = overlay.querySelector(".lb-count");
    overlay.querySelector(".lb-close").addEventListener("click", close);
    overlay.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
    overlay.querySelector(".lb-next").addEventListener("click", function () { step(1); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();        // backdrop click closes
    });
    document.body.appendChild(overlay);
  }

  function show(index) {
    current = (index + photos.length) % photos.length;
    var img = photos[current];
    frame.src = largestUrl(img);
    frame.alt = img.alt || "";
    caption.textContent = img.alt || "";
    count.textContent = photos.length > 1
      ? (current + 1) + " / " + photos.length : "";
    var nav = photos.length > 1 ? "" : "none";
    overlay.querySelector(".lb-prev").style.display = nav;
    overlay.querySelector(".lb-next").style.display = nav;
  }

  function open(index) {
    if (!overlay) build();
    lastFocus = document.activeElement;
    show(index);
    overlay.style.display = "flex";
    document.body.classList.add("lb-open");
    requestAnimationFrame(function () { overlay.classList.add("lb-in"); });
    overlay.querySelector(".lb-close").focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    overlay.classList.remove("lb-in");
    overlay.style.display = "none";
    document.body.classList.remove("lb-open");
    document.removeEventListener("keydown", onKey);
    frame.src = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(delta) { show(current + delta); }

  function onKey(e) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  }

  function init() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    photos = Array.prototype.filter.call(
      document.querySelectorAll("img"), eligible);
    photos.forEach(function (img, i) {
      img.classList.add("lb-zoomable");
      img.addEventListener("click", function () { open(i); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
