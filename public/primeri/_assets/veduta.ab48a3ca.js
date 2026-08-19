// veduta: nav state after the hero + scroll reveals. No dependencies.
(function () {
  document.documentElement.classList.add("js");
  var nav = document.getElementById("nav");
  var hero = document.querySelector(".hero-media");

  function onScroll() {
    // Viewport-based threshold: layout-independent, so an early call before
    // stylesheets settle cannot latch the wrong state.
    var threshold = hero ? Math.max(120, window.innerHeight * 0.55) : 40;
    nav.classList.toggle("scrolled", window.scrollY > threshold);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", onScroll);

  if ("IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) {
      // already on screen: show synchronously, no first-frame flash
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }
})();
