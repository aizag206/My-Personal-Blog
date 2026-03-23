(function () {
  'use strict';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function scrollToTopIfNoHash() {
    if (!window.location.hash || window.location.hash === '#') window.scrollTo(0, 0);
  }
  scrollToTopIfNoHash();
  window.addEventListener('load', scrollToTopIfNoHash);
  window.addEventListener('pageshow', function (e) { if (e.persisted) scrollToTopIfNoHash(); });

  var ACCENT_KEY = 'site-accent';
  var THEME_KEY = 'site-theme';
  var root = document.documentElement;
  var body = document.body;
  var nav = document.getElementById('site-nav');
  var settingsBtn = document.getElementById('settings-toggle');
  var settingsPanel = document.getElementById('settings-panel');
  var settingsClose = document.getElementById('settings-close');
  var themeToggle = document.getElementById('theme-toggle-btn');
  var upBtn = document.getElementById('scroll-up-btn');
  var contactForm = document.getElementById('contact-form');
  var backdrop = document.getElementById('settings-backdrop');

  function setAccent(hex) {
    root.style.setProperty('--accent', hex);
    localStorage.setItem(ACCENT_KEY, hex);
    document.querySelectorAll('.accent-swatch').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-accent') === hex);
    });
  }
  function applyTheme(dark) {
    body.classList.toggle('theme-dark', dark);
    if (nav) {
      if (dark) {
        nav.classList.remove('navbar-light', 'bg-white');
        nav.classList.add('navbar-dark', 'bg-dark');
      } else {
        nav.classList.add('navbar-light', 'bg-white');
        nav.classList.remove('navbar-dark', 'bg-dark');
      }
    }
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    if (themeToggle) themeToggle.textContent = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  function openSettings(open) {
    if (!settingsPanel || !settingsBtn) return;
    settingsPanel.classList.toggle('is-open', open);
    settingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    settingsPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('settings-panel-open', open);
  }

  setAccent(localStorage.getItem(ACCENT_KEY) || '#ff206e');
  applyTheme(localStorage.getItem(THEME_KEY) === 'dark');

  if (settingsBtn) settingsBtn.addEventListener('click', function () { openSettings(!settingsPanel.classList.contains('is-open')); });
  if (settingsClose) settingsClose.addEventListener('click', function () { openSettings(false); });
  if (backdrop) backdrop.addEventListener('click', function () { openSettings(false); });
  if (themeToggle) themeToggle.addEventListener('click', function () { applyTheme(!body.classList.contains('theme-dark')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openSettings(false); });
  document.querySelectorAll('.accent-swatch').forEach(function (s) { s.addEventListener('click', function () { setAccent(s.getAttribute('data-accent')); }); });

  function onScroll() {
    if (!upBtn) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    upBtn.classList.toggle('is-visible', y > 320);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var heroScroll = document.getElementById('hero-scroll-hint');
  if (heroScroll) {
    heroScroll.addEventListener('click', function (e) {
      e.preventDefault();
      var profile = document.getElementById('profile');
      if (profile) profile.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('contact-name');
      var email = document.getElementById('contact-email');
      var message = document.getElementById('contact-message');
      var subject = 'Portfolio contact: ' + (name.value.trim() || 'Website visitor');
      var bodyText = 'From: ' + name.value.trim() + '\nEmail: ' + email.value.trim() + '\n\n' + message.value.trim();
      window.location.href = 'mailto:azaghloul206@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
    });
  }

  function initScrollReveals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('js-reveals-enabled');
    var els = document.querySelectorAll('.reveal-on-scroll');
    if (typeof IntersectionObserver === 'undefined') { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  initScrollReveals();

  document.querySelectorAll('.navbar-nav a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992 && typeof window.$ !== 'undefined' && $.fn.collapse) {
        var collapseEl = document.getElementById('navbarNavAltMarkup');
        if (collapseEl) $(collapseEl).collapse('hide');
      }
    });
  });
})();
