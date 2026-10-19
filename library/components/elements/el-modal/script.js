(function () {
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  document.querySelectorAll('[data-wf-component="el-modal"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var trigger = root.querySelector('.c-el-modal__trigger');
    var overlay = root.querySelector('.c-el-modal__overlay');
    var dialog = root.querySelector('.c-el-modal__dialog');
    if (!trigger || !overlay || !dialog) return;
    var lastFocus = null;

    function focusables() {
      return Array.prototype.filter.call(dialog.querySelectorAll(FOCUSABLE), function (el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0;
      });
    }
    function open() {
      lastFocus = document.activeElement;
      overlay.hidden = false;
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      var first = focusables()[0];
      (first || dialog).focus();
      document.addEventListener('keydown', onKey);
    }
    function close() {
      overlay.hidden = true;
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKey);
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var items = focusables();
      if (!items.length) { e.preventDefault(); dialog.focus(); return; }
      var first = items[0], last = items[items.length - 1], active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }

    trigger.addEventListener('click', open);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    root.querySelectorAll('[data-wf-close]').forEach(function (btn) { btn.addEventListener('click', close); });
  });
})();
