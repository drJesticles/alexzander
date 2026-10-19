(function () {
  document.querySelectorAll('[data-wf-component="services-accordion"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var triggers = Array.prototype.slice.call(root.querySelectorAll('.c-services-accordion__trigger'));

    function panelFor(trigger) {
      var item = trigger.closest('.c-services-accordion__item');
      return item ? item.querySelector('.c-services-accordion__panel') : null;
    }

    function setOpen(trigger, open) {
      var panel = panelFor(trigger);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.hidden = !open;
    }

    triggers.forEach(function (trigger) {
      setOpen(trigger, trigger.getAttribute('aria-expanded') === 'true');
      trigger.addEventListener('click', function () {
        var willOpen = trigger.getAttribute('aria-expanded') !== 'true';
        triggers.forEach(function (t) { if (t !== trigger) setOpen(t, false); });
        setOpen(trigger, willOpen);
      });
    });
  });
})();
