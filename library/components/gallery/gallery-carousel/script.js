(function () {
  document.querySelectorAll('[data-wf-component="gallery-carousel"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var track = root.querySelector('[data-wf-track]');
    var prev = root.querySelector('[data-wf-prev]');
    var next = root.querySelector('[data-wf-next]');
    if (!track || !prev || !next) return;

    function stepWidth() {
      var slide = track.querySelector('li');
      if (!slide) return track.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return slide.getBoundingClientRect().width + gap;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max;
    }
    var raf = null;
    function queue() {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; update(); });
    }

    prev.addEventListener('click', function () { track.scrollBy({ left: -stepWidth(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: stepWidth(), behavior: 'smooth' }); });
    track.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
    });
    if (!track.hasAttribute('tabindex')) track.setAttribute('tabindex', '0');
    update();
  });
})();
