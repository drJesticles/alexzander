(function () {
  document.querySelectorAll('[data-wf-component="el-accordion"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var items = Array.prototype.slice.call(root.querySelectorAll('.c-el-accordion__item'));
    var triggers = [];

    function setOpen(item, open) {
      var btn = item.querySelector('.c-el-accordion__trigger');
      var panel = item.querySelector('.c-el-accordion__panel');
      if (!btn || !panel) return;
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    }

    items.forEach(function (item) {
      var btn = item.querySelector('.c-el-accordion__trigger');
      if (!btn) return;
      triggers.push(btn);
      setOpen(item, btn.getAttribute('aria-expanded') === 'true');
      btn.addEventListener('click', function () {
        var willOpen = btn.getAttribute('aria-expanded') !== 'true';
        items.forEach(function (other) { if (other !== item) setOpen(other, false); });
        setOpen(item, willOpen);
      });
      btn.addEventListener('keydown', function (e) {
        var i = triggers.indexOf(btn), next = null;
        if (e.key === 'ArrowDown') next = (i + 1) % triggers.length;
        else if (e.key === 'ArrowUp') next = (i - 1 + triggers.length) % triggers.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = triggers.length - 1;
        if (next === null) return;
        e.preventDefault();
        triggers[next].focus();
      });
    });
  });
})();
