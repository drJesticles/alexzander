(function () {
  document.querySelectorAll('[data-wf-component="nav-mega-menu"]').forEach(function (nav) {
    if (nav.dataset.wfInit) return;
    nav.dataset.wfInit = '1';
    var toggle = nav.querySelector('.c-nav-mega-menu__toggle');
    var trigger = nav.querySelector('.c-nav-mega-menu__trigger');
    var panel = nav.querySelector('.c-nav-mega-menu__panel');

    function setPanel(open) {
      if (!trigger || !panel) return;
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (!open) setPanel(false);
      });
    }

    if (trigger && panel) {
      trigger.addEventListener('click', function () {
        setPanel(trigger.getAttribute('aria-expanded') !== 'true');
      });
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) setPanel(false);
      });
      nav.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
          setPanel(false);
          trigger.focus();
        }
      });
      nav.addEventListener('focusout', function (e) {
        if (e.relatedTarget && !nav.contains(e.relatedTarget)) setPanel(false);
      });
    }
  });
})();
