(function () {
  document.querySelectorAll('[data-wf-component="hero-carousel"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var slides = Array.prototype.slice.call(root.querySelectorAll('.c-hero-carousel__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.c-hero-carousel__dot'));
    var arrows = root.querySelectorAll('.c-hero-carousel__arrow');
    if (slides.length < 2) return;
    var current = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
    var timer = null;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach(function (d, i) {
        var on = i === current;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      if (reduced || timer) return;
      timer = setInterval(function () { go(current + 1); }, 7000);
    }

    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        go(current + (parseInt(btn.getAttribute('data-dir'), 10) || 1));
        stop(); start();
      });
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { go(i); stop(); start(); });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(current - 1); stop(); start(); }
      if (e.key === 'ArrowRight') { go(current + 1); stop(); start(); }
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', function (e) {
      if (!e.relatedTarget || !root.contains(e.relatedTarget)) start();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    go(current);
    start();
  });
})();
