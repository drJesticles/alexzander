(function () {
  document.querySelectorAll('[data-wf-component="nav-sidebar-drawer"]').forEach(function (nav) {
    if (nav.dataset.wfInit) return;
    nav.dataset.wfInit = '1';
    var openBtn = nav.querySelector('.c-nav-sidebar-drawer__open');
    var closeBtn = nav.querySelector('.c-nav-sidebar-drawer__close');
    var backdrop = nav.querySelector('.c-nav-sidebar-drawer__backdrop');
    var panel = nav.querySelector('.c-nav-sidebar-drawer__panel');
    if (!openBtn || !panel) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (backdrop) backdrop.hidden = !open;
      if (open) {
        if (closeBtn) closeBtn.focus();
      } else {
        openBtn.focus();
      }
    }

    openBtn.addEventListener('click', function () { setOpen(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
    if (backdrop) backdrop.addEventListener('click', function () { setOpen(false); });
    nav.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  });
})();
