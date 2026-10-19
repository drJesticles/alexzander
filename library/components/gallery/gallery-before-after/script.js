(function () {
  document.querySelectorAll('[data-wf-component="gallery-before-after"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var compare = root.querySelector('[data-wf-compare]');
    var handle = root.querySelector('[data-wf-handle]');
    var wrap = root.querySelector('[data-wf-before-wrap]');
    if (!compare || !handle || !wrap) return;
    var pos = 50;
    var dragging = false;

    function set(p) {
      pos = Math.max(0, Math.min(100, p));
      compare.style.setProperty('--c-gallery-before-after-pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
      handle.setAttribute('aria-valuetext', Math.round(pos) + '% before');
    }
    function fromEvent(e) {
      var rect = compare.getBoundingClientRect();
      if (!rect.width) return;
      set(((e.clientX - rect.left) / rect.width) * 100);
    }

    compare.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      compare.classList.add('is-dragging');
      try { compare.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      fromEvent(e);
      handle.focus({ preventScroll: true });
    });
    compare.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    function end(e) {
      if (!dragging) return;
      dragging = false;
      compare.classList.remove('is-dragging');
      try { compare.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    compare.addEventListener('pointerup', end);
    compare.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', function (e) {
      var stepSize = e.shiftKey ? 10 : 2;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(pos - stepSize); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(pos + stepSize); }
      else if (e.key === 'Home') { e.preventDefault(); set(0); }
      else if (e.key === 'End') { e.preventDefault(); set(100); }
    });
    set(50);
  });
})();
