(function () {
  document.querySelectorAll('[data-wf-component="testimonials-slider"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var slides = Array.prototype.slice.call(root.querySelectorAll('.c-testimonials-slider__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.c-testimonials-slider__dot'));
    var arrows = root.querySelectorAll('.c-testimonials-slider__btn');
    if (slides.length < 2) return;
    var index = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === index;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('hidden'); else s.setAttribute('hidden', '');
      });
      dots.forEach(function (d, i) {
        var on = i === index;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () { show(index + (parseInt(btn.dataset.dir, 10) || 1)); });
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(index - 1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { show(index + 1); e.preventDefault(); }
    });
    show(index);
  });
})();
