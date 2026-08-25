/* placebo-stay — reveal-on-enter, nav scheme swap, gallery ticker.
   The stylesheet only hides content under `.js`, so a browser with JS
   disabled (or a crawler) sees the fully rendered page. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveal: 1000ms tween on the enter curve (curves live in the CSS). */
  if (!reduced) {
    var targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add("in");
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      }, { threshold: [0, 0.2], rootMargin: "0px 0px -10% 0px" });
      targets.forEach(function (el) { io.observe(el); });
    }
  }

  /* Nav: solid scheme once past the hero, hidden while scrolling down. */
  var nav = document.getElementById("nav");
  if (nav) {
    var last = 0;
    addEventListener("scroll", function () {
      var y = window.scrollY;
      nav.classList.toggle("is-past", y > 40);
      nav.classList.toggle("is-hidden", y > last && y > 200);
      last = y;
    }, { passive: true });
  }

  /* Ticker: duplicate the track for a seamless loop and derive the
     animation duration from the real width at the measured 98 px/s.
     The measured reference ticker does NOT pause on hover. */
  var ticker = document.querySelector("[data-ticker]");
  if (ticker && !reduced) {
    var track = ticker.firstElementChild;
    if (track && track.children.length) {
      var cells = Array.prototype.slice.call(track.children);
      cells.forEach(function (cell) {
        var copy = cell.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        track.appendChild(copy);
      });
      var half = track.scrollWidth / 2;
      if (half > 0) {
        track.style.setProperty("--pb-ticker-dur", (half / 98).toFixed(2) + "s");
      }
    }
  }
})();
