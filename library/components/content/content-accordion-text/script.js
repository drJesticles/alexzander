(function () {
  document.querySelectorAll('[data-wf-component="content-accordion-text"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var list = root.querySelector('[data-wf-accordion]');
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('details'));
    if (!items.length) return;

    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item && other.open) other.open = false;
        });
      });
    });

    list.addEventListener('keydown', function (e) {
      var summary = e.target && e.target.closest ? e.target.closest('summary') : null;
      if (!summary || !list.contains(summary)) return;
      var summaries = items.map(function (d) { return d.querySelector('summary'); });
      var i = summaries.indexOf(summary);
      if (i === -1) return;
      var next;
      if (e.key === 'ArrowDown') next = summaries[(i + 1) % summaries.length];
      else if (e.key === 'ArrowUp') next = summaries[(i - 1 + summaries.length) % summaries.length];
      else if (e.key === 'Home') next = summaries[0];
      else if (e.key === 'End') next = summaries[summaries.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
    });
  });
})();
