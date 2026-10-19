(function () {
  document.querySelectorAll('[data-wf-component="gallery-lightbox"]').forEach(function (root) {
    if (root.dataset.wfInit) return;
    root.dataset.wfInit = '1';
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-wf-full]'));
    var overlay = root.querySelector('[data-wf-overlay]');
    var image = root.querySelector('[data-wf-image]');
    var caption = root.querySelector('[data-wf-caption-out]');
    var counter = root.querySelector('[data-wf-counter]');
    var closeBtn = root.querySelector('[data-wf-close]');
    var prevBtn = root.querySelector('[data-wf-prev]');
    var nextBtn = root.querySelector('[data-wf-next]');
    if (!thumbs.length || !overlay || !image) return;
    var index = 0;
    var opener = null;

    function render() {
      var t = thumbs[index];
      var thumbImg = t.querySelector('img');
      image.src = t.getAttribute('data-wf-full');
      image.alt = thumbImg ? thumbImg.alt : '';
      if (caption) caption.textContent = t.getAttribute('data-wf-caption') || '';
      if (counter) counter.textContent = (index + 1) + ' / ' + thumbs.length;
    }
    function open(i, source) {
      index = i;
      opener = source || null;
      render();
      overlay.removeAttribute('hidden');
      root.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      overlay.setAttribute('hidden', '');
      root.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      if (opener) opener.focus();
    }
    function step(delta) {
      index = (index + delta + thumbs.length) % thumbs.length;
      render();
    }

    thumbs.forEach(function (t, i) {
      t.addEventListener('click', function () { open(i, t); });
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'Tab') {
        var focusables = Array.prototype.slice.call(overlay.querySelectorAll('button'));
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  });
})();
