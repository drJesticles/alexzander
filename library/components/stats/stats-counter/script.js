(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function format(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function run(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    if (isNaN(target)) return;
    if (reduce || !window.requestAnimationFrame) { el.textContent = format(target) + suffix; return; }
    var duration = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
    }
    el.textContent = format(0) + suffix;
    window.requestAnimationFrame(step);
  }
  document.querySelectorAll('[data-wf-component="stats-counter"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var nums = root.querySelectorAll('.c-stats-counter__num[data-count]');
    if (!nums.length) return;
    function fire() { nums.forEach(run); }
    if (!('IntersectionObserver' in window)) { fire(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fire();
        io.disconnect();
      });
    }, { threshold: 0.35 });
    io.observe(root);
  });
})();
