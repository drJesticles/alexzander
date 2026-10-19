(function () {
  document.querySelectorAll('[data-wf-component="gallery-filterable"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-wf-filter]'));
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-wf-items] [data-category]'));
    var count = root.querySelector('[data-wf-count]');
    var empty = root.querySelector('[data-wf-empty]');
    if (!buttons.length || !items.length) return;

    function apply(filter) {
      var shown = 0;
      items.forEach(function (item) {
        var cats = (item.getAttribute('data-category') || '').split(/\s+/);
        var on = filter === 'all' || cats.indexOf(filter) !== -1;
        if (on) { item.removeAttribute('hidden'); shown++; } else { item.setAttribute('hidden', ''); }
        if (on) {
          item.style.animation = 'none';
          void item.offsetWidth;
          item.style.animation = '';
        }
      });
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-wf-filter') === filter;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (count) count.textContent = 'Showing ' + shown + (shown === 1 ? ' project' : ' projects');
      if (empty) { if (shown) empty.setAttribute('hidden', ''); else empty.removeAttribute('hidden'); }
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-wf-filter')); });
    });
  });
})();
