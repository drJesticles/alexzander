(function () {
  document.querySelectorAll('[data-wf-component="form-multistep"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var form = root.querySelector('form');
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-wf-step]'));
    var steps = Array.prototype.slice.call(root.querySelectorAll('[data-wf-steps] li'));
    var bar = root.querySelector('[data-wf-bar]');
    var fill = root.querySelector('[data-wf-bar-fill]');
    var back = root.querySelector('[data-wf-back]');
    var next = root.querySelector('[data-wf-next]');
    var submit = root.querySelector('[data-wf-submit]');
    var count = root.querySelector('[data-wf-count]');
    var error = root.querySelector('[data-wf-error]');
    var done = root.querySelector('[data-wf-done]');
    if (!form || !panels.length || !next || !back) return;
    var current = 0;
    var total = panels.length;

    function show(i) {
      current = Math.max(0, Math.min(total - 1, i));
      panels.forEach(function (p, idx) {
        var on = idx === current;
        p.classList.toggle('is-active', on);
        if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      });
      steps.forEach(function (s, idx) {
        s.classList.toggle('is-active', idx === current);
        s.classList.toggle('is-done', idx < current);
        if (idx === current) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current');
      });
      if (fill) fill.style.width = ((current + 1) / total * 100) + '%';
      if (bar) bar.setAttribute('aria-valuenow', String(current + 1));
      if (count) count.textContent = 'Step ' + (current + 1) + ' of ' + total;
      back.disabled = current === 0;
      var last = current === total - 1;
      if (last) next.setAttribute('hidden', ''); else next.removeAttribute('hidden');
      if (submit) { if (last) submit.removeAttribute('hidden'); else submit.setAttribute('hidden', ''); }
      if (error) error.setAttribute('hidden', '');
      var first = panels[current].querySelector('input, select, textarea');
      if (first && root.dataset.wfTouched) first.focus();
    }

    function validate(i) {
      var ok = true;
      var fields = panels[i].querySelectorAll('input, select, textarea');
      Array.prototype.forEach.call(fields, function (f) {
        var valid = f.checkValidity();
        f.classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });
      if (error) { if (ok) error.setAttribute('hidden', ''); else error.removeAttribute('hidden'); }
      return ok;
    }

    root.addEventListener('input', function (e) {
      if (e.target && e.target.classList) e.target.classList.remove('is-invalid');
    });
    next.addEventListener('click', function () {
      root.dataset.wfTouched = '1';
      if (validate(current)) show(current + 1);
    });
    back.addEventListener('click', function () {
      root.dataset.wfTouched = '1';
      show(current - 1);
    });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target && e.target.tagName !== 'TEXTAREA' && current < total - 1) {
        e.preventDefault();
        next.click();
      }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(current)) return;
      if (done) done.removeAttribute('hidden');
      if (submit) submit.disabled = true;
      back.disabled = true;
    });
    show(0);
  });
})();
