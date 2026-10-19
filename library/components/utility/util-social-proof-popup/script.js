(function () {
  var KEY = 'wf-social-proof-closed';
  function read() { try { return window.sessionStorage.getItem(KEY); } catch (e) { return null; } }
  function write() { try { window.sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ } }

  document.querySelectorAll('[data-wf-component="util-social-proof-popup"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    if (read()) { root.hidden = true; return; }

    var items = Array.prototype.map.call(root.querySelectorAll('.c-util-social-proof-popup__items li'), function (li) {
      return { text: li.textContent.trim(), icon: li.getAttribute('data-wf-icon') || 'quote' };
    });
    var text = root.querySelector('.c-util-social-proof-popup__text');
    var icons = root.querySelectorAll('.c-util-social-proof-popup__svg');
    var closeBtn = root.querySelector('.c-util-social-proof-popup__close');
    if (!items.length || !text) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SHOW_MS = 6000, GAP_MS = 9000, FIRST_MS = 1500;
    var index = 0, timer = null;

    function render(item) {
      text.textContent = item.text;
      icons.forEach(function (svg) { svg.hidden = svg.getAttribute('data-wf-icon') !== item.icon; });
    }
    function stop() { clearTimeout(timer); timer = null; }
    function show() {
      if (!root.isConnected) { stop(); return; }
      render(items[index]);
      root.classList.add('is-visible');
      index = (index + 1) % items.length;
      if (reduced) return;
      timer = setTimeout(hide, SHOW_MS);
    }
    function hide() {
      root.classList.remove('is-visible');
      timer = setTimeout(show, GAP_MS);
    }

    if (closeBtn) closeBtn.addEventListener('click', function () { stop(); write(); root.hidden = true; });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') { stop(); write(); root.hidden = true; } });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', function () { if (!reduced && root.classList.contains('is-visible') && !timer) timer = setTimeout(hide, 2000); });

    timer = setTimeout(show, reduced ? 0 : FIRST_MS);
  });
})();
