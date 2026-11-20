/* West of June Media — shared behaviour for all pages. No dependencies. */
(function () {
  'use strict';

  var EASE = 'cubic-bezier(.2,.75,.2,1)';

  function parseDecls(text) {
    var out = [];
    text.split(';').forEach(function (part) {
      var i = part.indexOf(':');
      if (i < 0) return;
      var prop = part.slice(0, i).trim();
      var value = part.slice(i + 1).trim();
      if (prop && value) out.push([prop, value]);
    });
    return out;
  }

  /* 1. style-hover="color:#DC5B2E" — applied on hover and on keyboard focus. */
  function wireHover() {
    document.querySelectorAll('[style-hover]').forEach(function (el) {
      if (el.dataset.hoverWired) return;
      el.dataset.hoverWired = '1';
      var decls = parseDecls(el.getAttribute('style-hover'));
      if (!decls.length) return;
      var before = decls.map(function (d) { return el.style.getPropertyValue(d[0]); });
      var on = function () {
        decls.forEach(function (d) { el.style.setProperty(d[0], d[1]); });
      };
      var off = function () {
        decls.forEach(function (d, i) {
          if (before[i]) el.style.setProperty(d[0], before[i]);
          else el.style.removeProperty(d[0]);
        });
      };
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
      el.addEventListener('focus', on);
      el.addEventListener('blur', off);
    });
  }

  /* 2. [data-reveal] — fade and rise into place as it scrolls in. */
  function wireReveal() {
    var show = function (el) {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      el.style.filter = 'none';
    };
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(show);
      return;
    }

    els.forEach(function (el) {
      el.style.transition = 'opacity 1.05s ' + EASE + ', transform 1.05s ' + EASE + ', filter 1.05s ease';
      el.style.filter = 'blur(6px)';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          setTimeout(function () { show(e.target); }, i * 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.02, rootMargin: '0px 0px -2% 0px' });
    els.forEach(function (el) { io.observe(el); });

    /* Safety net: never leave content invisible if the observer misses. */
    setTimeout(function () { els.forEach(show); }, 900);
  }

  /* 3. [data-cta] — primary button: lifts, and slides an arrow out on hover. */
  function wireCta() {
    document.querySelectorAll('[data-cta]').forEach(function (btn) {
      if (btn.dataset.ctaWired) return;
      btn.dataset.ctaWired = '1';
      var label = btn.textContent.trim();
      btn.textContent = '';
      var txt = document.createElement('span');
      txt.textContent = label;
      txt.style.cssText = 'position:relative;display:inline-block;transition:transform .45s ' + EASE;
      var arrow = document.createElement('span');
      arrow.textContent = '→';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.style.cssText = 'position:relative;display:inline-block;margin-left:0;max-width:0;opacity:0;overflow:hidden;transform:translateX(-6px);transition:max-width .45s ' + EASE + ',opacity .35s ease,margin-left .45s,transform .45s ' + EASE;
      btn.appendChild(txt);
      btn.appendChild(arrow);
      var on = function () {
        btn.style.transform = 'translateY(-3px)';
        btn.style.boxShadow = '0 14px 34px rgba(220,91,46,.32)';
        arrow.style.maxWidth = '2em';
        arrow.style.opacity = '1';
        arrow.style.marginLeft = '12px';
        arrow.style.transform = 'translateX(0)';
      };
      var off = function () {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
        arrow.style.maxWidth = '0';
        arrow.style.opacity = '0';
        arrow.style.marginLeft = '0';
        arrow.style.transform = 'translateX(-6px)';
      };
      btn.addEventListener('mouseenter', on);
      btn.addEventListener('mouseleave', off);
      btn.addEventListener('focus', on);
      btn.addEventListener('blur', off);
    });
  }

  /* 4. [data-cta-quiet] — the understated text link beside it. */
  function wireQuietCta() {
    document.querySelectorAll('[data-cta-quiet]').forEach(function (link) {
      if (link.dataset.quietWired) return;
      link.dataset.quietWired = '1';
      var arrow = document.createElement('span');
      arrow.textContent = '→';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.style.cssText = 'display:inline-block;max-width:0;opacity:0;overflow:hidden;margin-left:0;transform:translateX(-6px);transition:max-width .45s ' + EASE + ',opacity .35s,margin-left .45s,transform .45s ' + EASE;
      link.appendChild(arrow);
      var on = function () {
        arrow.style.maxWidth = '2em';
        arrow.style.opacity = '1';
        arrow.style.marginLeft = '10px';
        arrow.style.transform = 'translateX(0)';
      };
      var off = function () {
        arrow.style.maxWidth = '0';
        arrow.style.opacity = '0';
        arrow.style.marginLeft = '0';
        arrow.style.transform = 'translateX(-6px)';
      };
      link.addEventListener('mouseenter', on);
      link.addEventListener('mouseleave', off);
      link.addEventListener('focus', on);
      link.addEventListener('blur', off);
    });
  }

  /* 5. [data-row] — portfolio band: rule draws across, number and title warm up,
        artwork comes to full brightness. */
  function wireRows() {
    document.querySelectorAll('[data-row]').forEach(function (row) {
      if (row.dataset.rowWired) return;
      row.dataset.rowWired = '1';
      var bar = row.querySelector('[data-bar]');
      var num = row.querySelector('[data-num]');
      var title = row.querySelector('[data-title]');
      var arts = row.querySelectorAll('[data-art]');
      var dim = row.dataset.artDim || '.86';
      /* Hover colours come from the band's own theme variables, so a cream band
         warms to terracotta instead of the navy band's gold. Leaving the row
         clears the inline colour so the stylesheet decides the resting state. */
      var hov = function (name, fallback) {
        return getComputedStyle(row).getPropertyValue(name).trim() || fallback;
      };
      row.addEventListener('mouseenter', function () {
        if (bar) bar.style.width = '100%';
        if (num) num.style.color = hov('--num-hover', 'rgba(240,180,41,.52)');
        if (title) title.style.color = hov('--title-hover', '#F0B429');
        arts.forEach(function (a) {
          a.style.filter = 'brightness(1)';
          a.style.transform = 'scale(1.02)';
        });
      });
      row.addEventListener('mouseleave', function () {
        if (bar) bar.style.width = '0';
        if (num) num.style.removeProperty('color');
        if (title) title.style.removeProperty('color');
        arts.forEach(function (a) {
          a.style.filter = 'brightness(' + dim + ')';
          a.style.transform = 'scale(1)';
        });
      });
    });
  }

  /* 6. [data-parallax] — the hero portrait drifts a little as the page scrolls. */
  function wireParallax() {
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ticking = false;
    var frame = function () {
      var y = window.scrollY || window.pageYOffset || 0;
      els.forEach(function (el) {
        var rate = parseFloat(el.dataset.parallax) || 0.04;
        el.style.transform = 'translateY(' + (-y * rate).toFixed(1) + 'px)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(frame);
    }, { passive: true });
  }

  /* 7. figure + [data-photo] — the My Story photo grid lifts and warms its caption. */
  function wirePhotos() {
    document.querySelectorAll('figure').forEach(function (fig) {
      if (fig.dataset.figWired) return;
      fig.dataset.figWired = '1';
      var frame = fig.querySelector('[data-photo]');
      var cap = fig.querySelector('figcaption');
      if (!frame && !cap) return;
      if (cap) cap.style.transition = 'color .45s';
      fig.addEventListener('mouseenter', function () {
        if (frame) {
          frame.style.transform = 'translateY(-8px)';
          frame.style.boxShadow = '0 24px 50px rgba(31,45,61,.22)';
        }
        if (cap) cap.style.color = '#DC5B2E';
      });
      fig.addEventListener('mouseleave', function () {
        if (frame) {
          frame.style.transform = 'translateY(0)';
          frame.style.boxShadow = 'none';
        }
        if (cap) cap.style.color = 'rgba(31,45,61,.55)';
      });
    });
  }

  /* 8. [data-phil] — the How I Work rows step in and colour their heading. */
  function wirePhil() {
    document.querySelectorAll('[data-phil]').forEach(function (row) {
      if (row.dataset.philWired) return;
      row.dataset.philWired = '1';
      var title = row.firstElementChild;
      if (title) title.style.transition = 'color .45s';
      row.addEventListener('mouseenter', function () {
        row.style.paddingLeft = '18px';
        if (title) title.style.color = '#DC5B2E';
      });
      row.addEventListener('mouseleave', function () {
        row.style.paddingLeft = '0px';
        if (title) title.style.color = '#1F2D3D';
      });
    });
  }

  function start() {
    wireHover();
    wireCta();
    wireQuietCta();
    wireRows();
    wirePhotos();
    wirePhil();
    wireParallax();
    setTimeout(wireReveal, 30);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
