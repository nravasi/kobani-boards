/* San Lorenzo — Main JS */
(function () {
  'use strict';

  /* Mobile menu toggle */
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* Tabs */
  var tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.closest('.tabs').parentNode.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.closest('.tabs').parentNode.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      panel.classList.add('is-active');
    });
  });

  /* Contact form basic validation */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var honey = contactForm.querySelector('.honeypot input');
      if (honey && honey.value !== '') return;
      var msgEl = document.getElementById('form-feedback');
      if (msgEl) {
        msgEl.textContent = '¡Gracias! Tu mensaje fue enviado. Te responderemos a la brevedad.';
        msgEl.className = 'form-message form-message-success';
        msgEl.removeAttribute('hidden');
      }
      contactForm.reset();
    });
  }

  /* Press form */
  var pressForm = document.getElementById('press-form');
  if (pressForm) {
    pressForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var honey = pressForm.querySelector('.honeypot input');
      if (honey && honey.value !== '') return;
      var msgEl = document.getElementById('press-form-feedback');
      if (msgEl) {
        msgEl.textContent = '¡Gracias! Tu solicitud de acreditación fue enviada.';
        msgEl.className = 'form-message form-message-success';
        msgEl.removeAttribute('hidden');
      }
      pressForm.reset();
    });
  }
})();
