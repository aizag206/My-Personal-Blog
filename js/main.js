(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVG = 'http://www.w3.org/2000/svg';

  /* ─── GAUGES ─────────────────────────────────────────────────
     270° sweep, centre (100,100), radius 80. Fraction 0 sits at
     bottom-left, 1 at bottom-right; the needle rotates -135°..135°. */
  var ARC_LEN = 2 * Math.PI * 80 * 0.75;

  function el(name, attrs) {
    var node = document.createElementNS(SVG, name);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function buildGauge(host) {
    var svg = el('svg', { viewBox: '0 0 200 172', 'aria-hidden': 'true' });
    var arcPath = 'M 43.43 156.57 A 80 80 0 1 1 156.57 156.57';
    svg.appendChild(el('path', { d: arcPath, class: 'gauge__track', fill: 'none', 'stroke-width': '8', 'stroke-linecap': 'round' }));
    var arc = el('path', {
      d: arcPath, class: 'gauge__arc', fill: 'none', 'stroke-width': '8', 'stroke-linecap': 'round',
      'stroke-dasharray': ARC_LEN.toFixed(2), 'stroke-dashoffset': ARC_LEN.toFixed(2)
    });
    svg.appendChild(arc);

    for (var i = 0; i <= 20; i++) {
      var major = i % 5 === 0;
      var a = (135 + i * 13.5) * Math.PI / 180;
      var r1 = major ? 58 : 63, r2 = 69;
      svg.appendChild(el('line', {
        x1: (100 + r1 * Math.cos(a)).toFixed(2), y1: (100 + r1 * Math.sin(a)).toFixed(2),
        x2: (100 + r2 * Math.cos(a)).toFixed(2), y2: (100 + r2 * Math.sin(a)).toFixed(2),
        class: 'gauge__tick' + (major ? ' gauge__tick--major' : ''), 'stroke-width': major ? '2' : '1'
      }));
    }

    var needle = el('line', { x1: '100', y1: '108', x2: '100', y2: '50', class: 'gauge__needle', 'stroke-width': '3', 'stroke-linecap': 'round' });
    needle.style.transform = 'rotate(-135deg)';
    svg.appendChild(needle);
    svg.appendChild(el('circle', { cx: '100', cy: '100', r: '7', class: 'gauge__hub', 'stroke-width': '2' }));
    var value = el('text', { x: '100', y: '163', 'text-anchor': 'middle', class: 'gauge__value' });
    svg.appendChild(value);

    var label = document.createElement('span');
    label.className = 'gauge__label';
    var sub = document.createElement('span');
    sub.className = 'gauge__sub';

    host.appendChild(svg);
    host.appendChild(label);
    host.appendChild(sub);
    return { host: host, arc: arc, needle: needle, value: value, label: label, sub: sub };
  }

  function setFraction(g, frac) {
    frac = Math.max(0, Math.min(1, frac));
    g.arc.setAttribute('stroke-dashoffset', (ARC_LEN * (1 - frac)).toFixed(2));
    g.needle.style.transform = 'rotate(' + (-135 + 270 * frac) + 'deg)';
  }

  function readMode(g, mode) {
    try { return JSON.parse(g.host.getAttribute('data-' + mode)); } catch (e) { return null; }
  }

  function showGauge(g, mode, sweep) {
    var d = readMode(g, mode);
    if (!d) return;
    g.value.textContent = d.display;
    g.label.textContent = d.label;
    g.sub.textContent = d.sub;
    g.host.setAttribute('aria-label', d.label + ': ' + d.display + ' (' + d.sub + ')');
    g.host.setAttribute('role', 'img');
    var frac = d.value / d.max;
    if (sweep && !reduceMotion) {
      // Self-test: needle to full scale, then settle on the reading.
      setFraction(g, 1);
      setTimeout(function () { setFraction(g, frac); }, 750);
    } else {
      setFraction(g, frac);
    }
  }

  var gauges = Array.prototype.map.call(document.querySelectorAll('.gauge'), buildGauge);

  /* ─── DRIVE MODE ─────────────────────────────────────────── */
  var tagline = document.querySelector('.ignition__tagline');
  var modeButtons = document.querySelectorAll('[data-set-mode]');

  function applyMode(mode, sweep) {
    root.setAttribute('data-mode', mode);
    Array.prototype.forEach.call(modeButtons, function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-mode') === mode));
    });
    if (tagline && tagline.getAttribute('data-' + mode)) tagline.textContent = tagline.getAttribute('data-' + mode);
    gauges.forEach(function (g) { showGauge(g, mode, sweep); });
    try { localStorage.setItem('az-mode', mode); } catch (e) { /* storage unavailable */ }
  }

  Array.prototype.forEach.call(modeButtons, function (b) {
    b.addEventListener('click', function () {
      var mode = b.getAttribute('data-set-mode');
      if (mode !== root.getAttribute('data-mode')) applyMode(mode, true);
    });
  });

  var startMode = 'engineer';
  try { if (localStorage.getItem('az-mode') === 'showroom') startMode = 'showroom'; } catch (e) { /* ignore */ }

  // Let the zeroed needles paint first so the ignition sweep is visible.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { applyMode(startMode, true); });
  });

  /* ─── CAIRO CLOCK ────────────────────────────────────────── */
  var clock = document.getElementById('clock');
  if (clock) {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) { fmt = null; }
    var tick = function () { if (fmt) clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 20000);
  }

  /* ─── GEAR INDICATOR ─────────────────────────────────────── */
  var gearLinks = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-gear]'), function (a) {
    gearLinks[a.getAttribute('data-gear')] = a;
  });

  function setGear(name) {
    Object.keys(gearLinks).forEach(function (k) {
      var on = k === name;
      gearLinks[k].classList.toggle('is-active', on);
      if (on) gearLinks[k].setAttribute('aria-current', 'location');
      else gearLinks[k].removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    var gearObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setGear(entry.target.getAttribute('data-gear-section') || entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('[data-gear-section], #ignition, #log, #contact').forEach(function (s) {
      gearObserver.observe(s);
    });

    /* ─── REVEAL ON SCROLL ─────────────────────────────────── */
    if (!reduceMotion) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.section__head, .screen, .readouts, .timeline__item, .driver, .now, .log, .contact__panel')
        .forEach(function (node) {
          node.classList.add('reveal');
          revealObserver.observe(node);
        });
    }
  }
})();
