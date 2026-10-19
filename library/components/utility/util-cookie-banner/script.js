(function () {
  var KEY = 'wf-cookie-consent';
  function read() { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(value) { try { window.localStorage.setItem(KEY, value); } catch (e) { /* storage blocked; banner just hides for this view */ } }

  document.querySelectorAll('[data-wf-component="util-cookie-banner"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    if (read()) { root.hidden = true; return; }
    root.querySelectorAll('[data-wf-consent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        write(btn.getAttribute('data-wf-consent') || 'accepted');
        root.hidden = true;
      });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { write('dismissed'); root.hidden = true; }
    });
  });
})();
