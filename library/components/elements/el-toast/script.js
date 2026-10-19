(function () {
  document.querySelectorAll('[data-wf-component="el-toast"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var trigger = root.querySelector('.c-el-toast__trigger');
    var toast = root.querySelector('.c-el-toast__toast');
    if (!trigger || !toast) return;
    var closeBtn = toast.querySelector('.c-el-toast__close');
    var timer = null, leaveTimer = null;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function hide() {
      clearTimeout(timer);
      if (toast.hidden) return;
      if (reduced) { toast.hidden = true; return; }
      toast.classList.add('is-leaving');
      leaveTimer = setTimeout(function () { toast.classList.remove('is-leaving'); toast.hidden = true; }, 240);
    }
    function show() {
      clearTimeout(timer); clearTimeout(leaveTimer);
      toast.classList.remove('is-leaving');
      toast.hidden = true;
      // force a reflow so the entrance animation replays on repeat clicks
      void toast.offsetWidth;
      toast.hidden = false;
      timer = setTimeout(hide, 4000);
    }

    trigger.addEventListener('click', show);
    if (closeBtn) closeBtn.addEventListener('click', hide);
    toast.addEventListener('mouseenter', function () { clearTimeout(timer); });
    toast.addEventListener('mouseleave', function () { if (!toast.hidden) timer = setTimeout(hide, 2000); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !toast.hidden) hide(); });
  });
})();
