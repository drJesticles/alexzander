(function () {
  document.querySelectorAll('[data-wf-component="util-back-to-top"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var btn = root.querySelector('.c-util-back-to-top__btn');
    if (!btn) return;
    var threshold = 400, ticking = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      root.classList.toggle('is-visible', y > threshold);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    btn.addEventListener('click', function () {
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
      catch (e) { window.scrollTo(0, 0); }
      var target = document.querySelector('main, h1') || document.body;
      if (target && target !== document.body) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
})();
