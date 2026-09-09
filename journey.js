/* West of June — micro-motion: a sun crests over the horizon under nav labels and buttons */
(function () {
  if (window.__wojJourney) return;
  window.__wojJourney = true;

  function el(tag, css) {
    var n = document.createElement(tag);
    n.style.cssText = css;
    return n;
  }

  /* is the element's own ground dark? decides whether the sun reads gold or cream */
  function isDark(node) {
    var n = node;
    for (var i = 0; i < 6 && n; i++) {
      var cs = getComputedStyle(n);
      var bg = cs.backgroundColor;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      var m = bg && bg.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
      if (m && (m[4] === undefined || parseFloat(m[4]) > 0.5)) {
        var lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
        return lum < 0.6;
      }
      n = n.parentElement;
    }
    return false;
  }

  /* attach a horizon rule (if the element has no edge of its own) plus a cresting sun */
  function addSun(node, opts) {
    if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
    node.style.overflow = 'hidden';

    var fill = 'linear-gradient(180deg,#F0B429 0%,#DC5B2E 100%)';
    var line = 'rgba(31,45,61,.28)';
    var h = opts.size;

    if (opts.rule) {
      var horizon = el('span',
        'position:absolute;left:' + opts.inset + ';right:' + opts.inset + ';bottom:' + opts.bottom + ';' +
        'height:1px;background:' + line + ';opacity:.55;pointer-events:none;' +
        'transition:opacity 380ms ease,background 380ms ease');
      node.appendChild(horizon);
      node._wojHorizon = horizon;
      node._wojLine = line;
    }

    var sun = el('span',
      'position:absolute;left:50%;bottom:' + opts.bottom + ';width:' + (h * 2.4) + 'px;height:' + h + 'px;' +
      'background:' + fill + ';border-radius:999px 999px 0 0;' +
      'transform:translate(-50%,' + h + 'px);opacity:0;pointer-events:none;' +
      'transition:transform 460ms cubic-bezier(.2,.75,.2,1),opacity 320ms ease');
    node.appendChild(sun);

    node.addEventListener('mouseenter', function () {
      sun.style.transform = 'translate(-50%,0)';
      sun.style.opacity = '1';
      if (node._wojHorizon) {
        node._wojHorizon.style.opacity = '1';
        node._wojHorizon.style.background = opts.fillOnHover ? 'rgba(253,247,238,.5)' : line;
      }
    });
    node.addEventListener('mouseleave', function () {
      sun.style.transform = 'translate(-50%,' + h + 'px)';
      sun.style.opacity = '0';
      if (node._wojHorizon) {
        node._wojHorizon.style.opacity = '.55';
        node._wojHorizon.style.background = line;
      }
    });
  }

  function wireNav() {
    document.querySelectorAll('[data-nav-links] > a').forEach(function (a) {
      if (a.dataset.wojSun) return;
      a.dataset.wojSun = '1';
      a.style.paddingBottom = a.style.paddingBottom || '7px';
      /* the Contact pill already has its own outline; the plain labels need a horizon */
      var hasEdge = parseFloat(getComputedStyle(a).borderTopWidth) > 0;
      addSun(a, { size: 10, bottom: '0px', inset: '0px', rule: !hasEdge, fillOnHover: hasEdge });
    });
  }

  function wireButtons() {
    document.querySelectorAll('[data-cta]').forEach(function (b) {
      if (b.dataset.wojSun) return;
      b.dataset.wojSun = '1';
      addSun(b, { size: 11, bottom: '7px', inset: '18px', rule: true, fillOnHover: true });
    });
  }

  function boot() {
    if (!document.body) return setTimeout(boot, 30);
    wireNav();
    wireButtons();
    new MutationObserver(function () {
      wireNav();
      wireButtons();
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  boot();
})();
