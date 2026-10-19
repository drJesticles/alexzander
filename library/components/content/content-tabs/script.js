(function () {
  document.querySelectorAll('[data-wf-component="content-tabs"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-wf-tab]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-wf-panel]'));
    if (!tabs.length || !panels.length) return;
    root.classList.add('is-ready');

    function activate(name, focus) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-wf-tab') === name;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focus) tab.focus();
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-wf-panel') === name;
        panel.classList.toggle('is-active', on);
        if (on) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(tab.getAttribute('data-wf-tab'), false); });
      tab.addEventListener('keydown', function (e) {
        var next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        activate(next.getAttribute('data-wf-tab'), true);
      });
    });

    var initial = tabs.filter(function (t) { return t.classList.contains('is-active'); })[0] || tabs[0];
    activate(initial.getAttribute('data-wf-tab'), false);
  });
})();
