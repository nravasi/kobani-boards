/* San Lorenzo — Main JS (progressive enhancement) */
(function () {
  'use strict';

  /* Mobile nav toggle */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('nav-mobile');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('is-open');
    });
  }

  /* Mobile accordion sections */
  var toggles = document.querySelectorAll('.nav-mobile__toggle');
  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      var panel = document.getElementById(toggle.getAttribute('aria-controls'));
      if (panel) {
        panel.classList.toggle('is-open');
      }
    });
  });

  /* Search overlay */
  var searchBtn = document.getElementById('btn-search');
  var searchOverlay = document.getElementById('search-overlay');
  var searchClose = document.getElementById('search-close');
  var searchInput = document.getElementById('search-input');

  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', function () {
      searchOverlay.classList.add('is-open');
      if (searchInput) searchInput.focus();
    });
  }

  if (searchClose && searchOverlay) {
    searchClose.addEventListener('click', function () {
      searchOverlay.classList.remove('is-open');
    });
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('is-open');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchOverlay.classList.contains('is-open')) {
        searchOverlay.classList.remove('is-open');
      }
    });
  }

  /* Hero slider */
  var slides = document.querySelectorAll('.hero__slide');
  var dots = document.querySelectorAll('.hero__dot');

  if (slides.length > 1) {
    var currentSlide = 0;
    var interval;

    function showSlide(index) {
      slides.forEach(function (s) { s.classList.remove('is-active'); });
      dots.forEach(function (d) { d.classList.remove('is-active'); });
      slides[index].classList.add('is-active');
      if (dots[index]) dots[index].classList.add('is-active');
      currentSlide = index;
    }

    function nextSlide() {
      showSlide((currentSlide + 1) % slides.length);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        clearInterval(interval);
        interval = setInterval(nextSlide, 8000);
      });
    });

    interval = setInterval(nextSlide, 8000);

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', function () { clearInterval(interval); });
      hero.addEventListener('mouseleave', function () { interval = setInterval(nextSlide, 8000); });
    }
  }

  /* Agenda tabs */
  var agendaTabs = document.querySelectorAll('.agenda__tab');
  agendaTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('aria-controls');
      agendaTabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.agenda__panel').forEach(function (p) {
        p.classList.remove('is-active');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('is-active');
    });
  });

  /* Contact form validation */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var required = contactForm.querySelectorAll('[required]');
      required.forEach(function (field) {
        var group = field.closest('.form-group');
        if (!field.value.trim()) {
          if (group) group.classList.add('has-error');
          valid = false;
        } else {
          if (group) group.classList.remove('has-error');
        }
      });

      var emailField = contactForm.querySelector('[type="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        var emailGroup = emailField.closest('.form-group');
        if (emailGroup) emailGroup.classList.add('has-error');
        valid = false;
      }

      if (valid) {
        var success = contactForm.querySelector('.form-success');
        if (success) success.style.display = 'block';
        contactForm.reset();
      }
    });
  }

  /* Press form validation */
  var pressForm = document.getElementById('press-form');
  if (pressForm) {
    pressForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var required = pressForm.querySelectorAll('[required]');
      required.forEach(function (field) {
        var group = field.closest('.form-group');
        if (!field.value.trim()) {
          if (group) group.classList.add('has-error');
          valid = false;
        } else {
          if (group) group.classList.remove('has-error');
        }
      });

      if (valid) {
        var success = pressForm.querySelector('.form-success');
        if (success) success.style.display = 'block';
        pressForm.reset();
      }
    });
  }
})();
