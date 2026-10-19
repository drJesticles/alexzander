(function () {
  function money(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  document.querySelectorAll('[data-wf-component="form-estimate-calculator"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var form = root.querySelector('form');
    var service = root.querySelector('[data-wf-rate]');
    var sqft = root.querySelector('[data-wf-sqft]');
    var total = root.querySelector('[data-wf-total]');
    var breakdown = root.querySelector('[data-wf-breakdown]');
    if (!form || !service || !sqft || !total) return;

    function update() {
      var opt = service.options[service.selectedIndex];
      var rate = opt ? parseFloat(opt.getAttribute('data-rate')) || 0 : 0;
      var area = Math.max(0, parseFloat(sqft.value) || 0);
      var raw = area * rate;
      var rounded = Math.ceil(raw / 10) * 10;
      total.textContent = money(rounded);
      if (breakdown) {
        breakdown.textContent = area
          ? area.toLocaleString('en-US') + ' sq ft at $' + rate.toFixed(2)
          : 'Enter an area to see a price';
      }
    }

    service.addEventListener('change', update);
    sqft.addEventListener('input', update);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      update();
      form.classList.add('is-submitted');
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.textContent = 'Request sent. We will confirm ' + total.textContent + ' shortly.';
    });
    update();
  });
})();
