(function () {
  document.querySelectorAll('[data-wf-component="el-rating-stars"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var picks = Array.prototype.slice.call(root.querySelectorAll('.c-el-rating-stars__pick'));
    if (!picks.length) return;
    var hidden = root.querySelector('.c-el-rating-stars__value');
    var output = root.querySelector('.c-el-rating-stars__output');
    var labels = ['', 'Not great', 'Could be better', 'Good', 'Really good', 'Excellent'];

    function select(index, moveFocus) {
      var value = index + 1;
      picks.forEach(function (btn, i) {
        var on = i <= index;
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-checked', i === index ? 'true' : 'false');
        btn.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      if (hidden) hidden.value = String(value);
      if (output) output.textContent = 'You rated ' + value + ' of 5: ' + labels[value];
      if (moveFocus) picks[index].focus();
    }

    picks.forEach(function (btn, i) {
      btn.addEventListener('click', function () { select(i, false); });
      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(i + 1, picks.length - 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(i - 1, 0);
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = picks.length - 1;
        else if (e.key === ' ' || e.key === 'Enter') next = i;
        if (next === null) return;
        e.preventDefault();
        select(next, true);
      });
    });
  });
})();
