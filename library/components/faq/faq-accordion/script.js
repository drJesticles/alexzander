(function () {
  document.querySelectorAll('[data-wf-component="faq-accordion"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var uid = 'faq-' + Math.random().toString(36).slice(2, 8);
    root.querySelectorAll('.c-faq-accordion__item').forEach(function (item, i) {
      var btn = item.querySelector('.c-faq-accordion__btn');
      var panel = item.querySelector('.c-faq-accordion__panel');
      if (!btn || !panel) return;
      btn.id = uid + '-b' + i;
      panel.id = uid + '-p' + i;
      btn.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', btn.id);
      var open = btn.getAttribute('aria-expanded') === 'true';
      if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        if (expanded) panel.setAttribute('hidden', ''); else panel.removeAttribute('hidden');
      });
    });
  });
})();
