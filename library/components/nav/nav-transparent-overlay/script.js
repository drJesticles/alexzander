(function () {
  document.querySelectorAll('[data-wf-component="nav-transparent-overlay"]').forEach(function (nav) {
    if (nav.dataset.wfInit) return;
    nav.dataset.wfInit = '1';
    var btn = nav.querySelector('.c-nav-transparent-overlay__toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
    }
    var threshold = 24;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      nav.classList.toggle('is-solid', y > threshold);
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  });
})();
