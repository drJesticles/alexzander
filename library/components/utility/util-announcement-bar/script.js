(function () {
  var KEY = 'wf-announcement-dismissed';
  function read() { try { return window.sessionStorage.getItem(KEY); } catch (e) { return null; } }
  function write() { try { window.sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ } }

  document.querySelectorAll('[data-wf-component="util-announcement-bar"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    if (read()) { root.hidden = true; return; }
    var btn = root.querySelector('.c-util-announcement-bar__close');
    if (!btn) return;
    btn.addEventListener('click', function () { write(); root.hidden = true; });
  });
})();
