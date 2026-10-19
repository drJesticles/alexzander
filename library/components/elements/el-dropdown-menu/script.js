(function () {
  document.querySelectorAll('[data-wf-component="el-dropdown-menu"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var btn = root.querySelector('.c-el-dropdown-menu__trigger');
    var menu = root.querySelector('.c-el-dropdown-menu__menu');
    if (!btn || !menu) return;
    var items = Array.prototype.slice.call(menu.querySelectorAll('.c-el-dropdown-menu__item'));

    function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }
    function open(focusIndex) {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      if (typeof focusIndex === 'number' && items[focusIndex]) items[focusIndex].focus();
    }
    function close(returnFocus) {
      if (!isOpen()) return;
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (returnFocus) btn.focus();
    }

    btn.addEventListener('click', function () { isOpen() ? close(false) : open(); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(0); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); open(items.length - 1); }
    });
    items.forEach(function (item, i) {
      item.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown') next = (i + 1) % items.length;
        else if (e.key === 'ArrowUp') next = (i - 1 + items.length) % items.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = items.length - 1;
        else if (e.key === 'Tab') { close(false); return; }
        if (next === null) return;
        e.preventDefault();
        items[next].focus();
      });
      item.addEventListener('click', function () { close(false); });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(true); }
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !root.contains(e.target)) close(false);
    });
  });
})();
