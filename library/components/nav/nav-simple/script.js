(function () {
  document.querySelectorAll('[data-wf-component="nav-simple"]').forEach(function (nav) {
    if (nav.dataset.wfInit) return;
    nav.dataset.wfInit = '1';
    var btn = nav.querySelector('.c-nav-simple__toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
