(function () {
  document.querySelectorAll('[data-wf-component="el-tabs"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.c-el-tabs__tab'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.c-el-tabs__panel'));
    if (!tabs.length) return;

    function activate(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
        tab.classList.toggle('is-active', on);
        if (panels[i]) panels[i].hidden = !on;
      });
      if (moveFocus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        activate(next, true);
      });
    });

    var start = 0;
    tabs.forEach(function (tab, i) { if (tab.getAttribute('aria-selected') === 'true') start = i; });
    activate(start, false);
  });
})();
