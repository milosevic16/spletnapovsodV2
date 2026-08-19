/* mariven-stay — reveal-on-enter.
   The stylesheet only hides content under `.js`, so a browser with JS
   disabled (or a crawler) sees the fully rendered page. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  var targets = document.querySelectorAll(".reveal, .reveal-photo");
  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add("in");
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
    // threshold 0.5 is the reference's own __framer__threshold (measured).
    // Tall blocks can never reach 50% visibility, so they fall back to a
    // bottom-margin trigger.
  }, { threshold: [0, 0.5], rootMargin: "0px 0px -15% 0px" });
  targets.forEach(function (el) { io.observe(el); });
})();

/* Nav: swaps to the solid scheme once past the hero, and hides while the
   reader scrolls down. Both behaviours measured — motion.md §5. */
(function () {
  var nav = document.getElementById("nav");
  if (!nav) return;
  var last = 0;
  addEventListener("scroll", function () {
    var y = window.scrollY;
    nav.classList.toggle("is-past", y > 40);
    nav.classList.toggle("is-hidden", y > last && y > 200);
    last = y;
  }, { passive: true });
})();
