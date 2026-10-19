(function () {
  document.querySelectorAll('[data-wf-component="faq-search-filter"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var uid = 'faqs-' + Math.random().toString(36).slice(2, 8);
    var input = root.querySelector('.c-faq-search-filter__input');
    var label = root.querySelector('label[for]');
    var clear = root.querySelector('.c-faq-search-filter__clear');
    var status = root.querySelector('.c-faq-search-filter__status');
    var empty = root.querySelector('.c-faq-search-filter__empty');
    var reset = root.querySelector('.c-faq-search-filter__reset');
    var items = Array.prototype.slice.call(root.querySelectorAll('.c-faq-search-filter__item'));
    var total = items.length;

    if (input) { input.id = uid + '-input'; if (label) label.setAttribute('for', input.id); }

    function setOpen(item, open) {
      var btn = item.querySelector('.c-faq-search-filter__btn');
      var panel = item.querySelector('.c-faq-search-filter__panel');
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
    }

    items.forEach(function (item, i) {
      var btn = item.querySelector('.c-faq-search-filter__btn');
      var panel = item.querySelector('.c-faq-search-filter__panel');
      if (!btn || !panel) return;
      btn.id = uid + '-b' + i;
      panel.id = uid + '-p' + i;
      btn.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', btn.id);
      item.dataset.text = (btn.textContent + ' ' + panel.textContent).toLowerCase();
      btn.addEventListener('click', function () {
        setOpen(item, btn.getAttribute('aria-expanded') !== 'true');
      });
    });

    function filter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      items.forEach(function (item) {
        var hit = !q || item.dataset.text.indexOf(q) !== -1;
        if (hit) { item.removeAttribute('hidden'); shown++; } else item.setAttribute('hidden', '');
        if (q) setOpen(item, hit);
      });
      if (!q) items.forEach(function (item) { setOpen(item, false); });
      if (clear) { if (q) clear.removeAttribute('hidden'); else clear.setAttribute('hidden', ''); }
      if (empty) { if (shown === 0) empty.removeAttribute('hidden'); else empty.setAttribute('hidden', ''); }
      if (status) {
        status.textContent = !q ? 'Showing all ' + total + ' questions'
          : shown === 1 ? '1 question matches "' + input.value.trim() + '"'
          : shown + ' questions match "' + input.value.trim() + '"';
      }
    }

    if (input) input.addEventListener('input', filter);
    var form = root.querySelector('.c-faq-search-filter__form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    function doReset() { if (input) { input.value = ''; input.focus(); } filter(); }
    if (clear) clear.addEventListener('click', doReset);
    if (reset) reset.addEventListener('click', doReset);
    filter();
  });
})();
