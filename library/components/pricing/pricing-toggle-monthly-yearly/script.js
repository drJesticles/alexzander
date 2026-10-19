(function () {
  document.querySelectorAll('[data-wf-component="pricing-toggle-monthly-yearly"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var buttons = root.querySelectorAll('.c-pricing-toggle-monthly-yearly__opt');
    var swaps = root.querySelectorAll('[data-monthly][data-yearly]');
    if (!buttons.length) return;
    function apply(period) {
      swaps.forEach(function (el) {
        var next = period === 'yearly' ? el.dataset.yearly : el.dataset.monthly;
        if (next !== undefined && el.textContent !== next) el.textContent = next;
      });
      buttons.forEach(function (b) {
        var on = b.dataset.period === period;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      root.dataset.period = period;
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.dataset.period || 'monthly'); });
    });
    apply(root.dataset.period || 'monthly');
  });
})();
