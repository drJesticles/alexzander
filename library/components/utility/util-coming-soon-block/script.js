(function () {
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  document.querySelectorAll('[data-wf-component="util-coming-soon-block"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var target = Date.parse(root.getAttribute('data-wf-date') || '');
    if (isNaN(target)) target = Date.now() + 30 * 24 * 60 * 60 * 1000;
    var els = {
      days: root.querySelector('[data-wf-unit="days"]'),
      hours: root.querySelector('[data-wf-unit="hours"]'),
      minutes: root.querySelector('[data-wf-unit="minutes"]'),
      seconds: root.querySelector('[data-wf-unit="seconds"]')
    };
    var timer = null;

    function tick() {
      if (!root.isConnected) { clearInterval(timer); return; }
      var diff = Math.max(0, target - Date.now());
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      if (els.days) els.days.textContent = pad(d);
      if (els.hours) els.hours.textContent = pad(h);
      if (els.minutes) els.minutes.textContent = pad(m);
      if (els.seconds) els.seconds.textContent = pad(s);
      if (diff === 0) { root.classList.add('is-ended'); clearInterval(timer); }
    }
    tick();
    timer = setInterval(tick, 1000);
  });
})();
