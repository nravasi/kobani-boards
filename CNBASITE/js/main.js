(function () {
  "use strict";

  var STORAGE_KEY = "cabna-theme";
  var DEFAULT_THEME = "estilo-puro";

  /* ==========================================================
     THEME SWITCHER
     ========================================================== */
  var ThemeSwitcher = {
    init: function () {
      var saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
      this.apply(saved);

      var buttons = document.querySelectorAll("[data-theme-choice]");
      var self = this;
      for (var i = 0; i < buttons.length; i++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            self.apply(btn.getAttribute("data-theme-choice"));
          });
        })(buttons[i]);
      }
    },

    apply: function (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(STORAGE_KEY, theme);

      var buttons = document.querySelectorAll("[data-theme-choice]");
      for (var i = 0; i < buttons.length; i++) {
        var isActive = buttons[i].getAttribute("data-theme-choice") === theme;
        buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
      }
    }
  };

  /* ==========================================================
     MOBILE NAVIGATION
     ========================================================== */
  var MobileNav = {
    init: function () {
      var btn = document.querySelector(".mobile-menu-btn");
      var nav = document.querySelector(".main-nav");
      var overlay = document.querySelector(".mobile-overlay");
      if (!btn || !nav) return;

      var self = this;
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.style.overflow = open ? "hidden" : "";
        if (overlay) overlay.classList.toggle("visible", open);
      });

      if (overlay) {
        overlay.addEventListener("click", function () { self.close(btn, nav, overlay); });
      }

      var links = nav.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function () { self.close(btn, nav, overlay); });
      }
    },

    close: function (btn, nav, overlay) {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      document.body.style.overflow = "";
      if (overlay) overlay.classList.remove("visible");
    }
  };

  /* ==========================================================
     ACTIVE NAV LINK
     ========================================================== */
  function setActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    var links = document.querySelectorAll(".nav-list a");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        links[i].classList.add("active");
      }
    }
  }

  /* ==========================================================
     EVENTS MODULE
     ========================================================== */
  var MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  function formatEventDate(dateStr, timeStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.getDate() + " " + MONTH_NAMES[d.getMonth()] + " " + d.getFullYear() + " · " + timeStr;
  }

  function getMonthLabel(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return MONTH_NAMES[d.getMonth()] + " " + d.getFullYear();
  }

  function getMonthValue(dateStr) {
    return dateStr.substring(0, 7);
  }

  var Events = {
    data: [],
    filtered: [],

    init: function () {
      if (!document.getElementById("events-grid")) return;
      this.loadData();
    },

    loadData: function () {
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "data/events.json", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
          try {
            self.data = JSON.parse(xhr.responseText);
            self.filtered = self.data.slice();
            self.populateFilters();
            self.render();
          } catch (e) { /* noscript fallback */ }
        }
      };
      try { xhr.send(); } catch (e) { /* noscript fallback */ }
    },

    populateFilters: function () {
      var catSelect = document.getElementById("filter-category");
      var dateSelect = document.getElementById("filter-date");
      if (!catSelect || !dateSelect) return;

      var categories = {}, months = {};
      for (var i = 0; i < this.data.length; i++) {
        var ev = this.data[i];
        categories[ev.category] = true;
        months[getMonthValue(ev.date)] = getMonthLabel(ev.date);
      }

      Object.keys(categories).sort().forEach(function (c) {
        var opt = document.createElement("option");
        opt.value = c; opt.textContent = c;
        catSelect.appendChild(opt);
      });

      Object.keys(months).sort().forEach(function (m) {
        var opt = document.createElement("option");
        opt.value = m; opt.textContent = months[m];
        dateSelect.appendChild(opt);
      });

      var self = this;
      catSelect.addEventListener("change", function () { self.applyFilters(); });
      dateSelect.addEventListener("change", function () { self.applyFilters(); });
      var resetBtn = document.getElementById("filter-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          catSelect.value = "all"; dateSelect.value = "all"; self.applyFilters();
        });
      }
    },

    applyFilters: function () {
      var catVal = document.getElementById("filter-category").value;
      var dateVal = document.getElementById("filter-date").value;
      this.filtered = this.data.filter(function (ev) {
        return (catVal === "all" || ev.category === catVal) &&
               (dateVal === "all" || getMonthValue(ev.date) === dateVal);
      });
      this.render();
    },

    render: function () {
      var grid = document.getElementById("events-grid");
      var countEl = document.getElementById("events-count");
      if (!grid) return;
      grid.innerHTML = "";

      if (this.filtered.length === 0) {
        grid.innerHTML = '<p class="events-empty">No upcoming events right now. Check back soon.</p>';
        if (countEl) countEl.textContent = "0 events";
        return;
      }
      if (countEl) countEl.textContent = this.filtered.length + " event" + (this.filtered.length !== 1 ? "s" : "");

      for (var i = 0; i < this.filtered.length; i++) {
        var ev = this.filtered[i];
        var card = document.createElement("article");
        card.className = "card event-card";
        card.setAttribute("role", "listitem");

        var badge = ev.status || "Upcoming";
        var badgeClass = badge === "Free Entry" ? "event-badge--free" :
                         badge === "Members Only" ? "event-badge--members" : "event-badge--upcoming";

        card.innerHTML =
          '<div style="padding: var(--card-padding)">' +
          '<span class="event-badge ' + badgeClass + '">' + badge + '</span>' +
          '<h3 style="margin: 0.75rem 0 0.5rem">' + ev.title + '</h3>' +
          '<div class="event-meta">' +
          '<time datetime="' + ev.date + '">📅 ' + formatEventDate(ev.date, ev.time) + '</time>' +
          '<span>📍 ' + ev.location + '</span>' +
          '</div>' +
          '<p style="color: var(--color-text-secondary); font-size: 0.9375rem; margin-top: 0.5rem">' + ev.description + '</p>' +
          '</div>';

        grid.appendChild(card);
      }
    }
  };

  /* ==========================================================
     GALLERY MODULE
     ========================================================== */
  var Gallery = {
    images: [],
    currentIndex: 0,

    init: function () {
      if (!document.getElementById("gallery-grid")) return;
      this.loadData();
    },

    loadData: function () {
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "data/image_assets.json", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
          try {
            var data = JSON.parse(xhr.responseText);
            var allImages = data.images || data;
            self.images = allImages.filter(function (img) {
              var url = img.url || "";
              return url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) && !url.match(/logo|ico-|favicon|portada-mob/i);
            });
            self.render();
            self.initLightbox();
          } catch (e) { /* noscript fallback */ }
        }
      };
      try { xhr.send(); } catch (e) { /* noscript fallback */ }
    },

    render: function () {
      var grid = document.getElementById("gallery-grid");
      if (!grid) return;
      grid.innerHTML = "";

      var captions = {
        "deportes.jpg": "Sports facilities at CABNA campus",
        "actividades.jpg": "Community activities for all ages",
        "video.jpg": "CABNA club aerial view",
        "portada.jpg": "CABNA club entrance facade",
        "quinchos.jpg": "Quincho and BBQ area for gatherings",
        "mapa.jpg": "Club location in Vicente López",
        "1.jpg": "Club facility view from the grounds",
        "2.jpg": "Sports courts and playing fields",
        "3.jpg": "Club swimming pool area",
        "4.jpg": "Gymnasium and indoor sports hall",
        "5.jpg": "Outdoor recreation space",
        "6.jpg": "Members enjoying club facilities",
        "7.jpg": "Youth training session at the club",
        "8.jpg": "Community event at CABNA"
      };

      for (var i = 0; i < this.images.length; i++) {
        var img = this.images[i];
        var filename = img.url.split("/").pop();
        var alt = captions[filename] || img.alt || "CABNA club photo";

        var figure = document.createElement("figure");
        figure.className = "gallery-item";
        figure.setAttribute("role", "listitem");
        figure.setAttribute("tabindex", "0");
        figure.setAttribute("data-index", i);
        figure.setAttribute("aria-label", "View image: " + alt);

        var imgEl = document.createElement("img");
        imgEl.src = img.url;
        imgEl.alt = alt;
        imgEl.loading = "lazy";
        imgEl.width = 400;
        imgEl.height = 300;
        figure.appendChild(imgEl);

        var caption = document.createElement("figcaption");
        caption.textContent = alt;
        figure.appendChild(caption);
        grid.appendChild(figure);
      }

      var self = this;
      grid.addEventListener("click", function (e) {
        var item = e.target.closest(".gallery-item");
        if (item) self.openLightbox(parseInt(item.getAttribute("data-index"), 10));
      });
      grid.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && e.target.closest(".gallery-item")) {
          e.preventDefault();
          self.openLightbox(parseInt(e.target.closest(".gallery-item").getAttribute("data-index"), 10));
        }
      });
    },

    initLightbox: function () {
      var self = this;
      var lightbox = document.getElementById("lightbox");
      if (!lightbox) return;
      document.getElementById("lightbox-prev").addEventListener("click", function () { self.navigate(-1); });
      document.getElementById("lightbox-next").addEventListener("click", function () { self.navigate(1); });
      lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
        el.addEventListener("click", function () { self.closeLightbox(); });
      });
      document.addEventListener("keydown", function (e) {
        if (lightbox.hidden) return;
        if (e.key === "Escape") self.closeLightbox();
        else if (e.key === "ArrowLeft") { e.preventDefault(); self.navigate(-1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); self.navigate(1); }
      });
    },

    openLightbox: function (index) {
      this.currentIndex = index;
      this._prev = document.activeElement;
      var lb = document.getElementById("lightbox");
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      this.updateLightbox();
      lb.querySelector(".lightbox-close").focus();
    },

    closeLightbox: function () {
      document.getElementById("lightbox").hidden = true;
      document.body.style.overflow = "";
      if (this._prev) this._prev.focus();
    },

    navigate: function (dir) {
      this.currentIndex = (this.currentIndex + dir + this.images.length) % this.images.length;
      this.updateLightbox();
    },

    updateLightbox: function () {
      var img = this.images[this.currentIndex];
      if (!img) return;
      var filename = img.url.split("/").pop();
      var alt = img.alt || "CABNA club photo";
      document.getElementById("lightbox-img").src = img.url;
      document.getElementById("lightbox-img").alt = alt;
      document.getElementById("lightbox-caption").textContent = alt;
      document.getElementById("lightbox-current").textContent = this.currentIndex + 1;
      document.getElementById("lightbox-total").textContent = this.images.length;
    }
  };

  /* ==========================================================
     CONTACT FORM
     ========================================================== */
  var ContactForm = {
    init: function () {
      var form = document.getElementById("contact-form");
      if (!form) return;
      var self = this;
      form.addEventListener("submit", function (e) { e.preventDefault(); self.handleSubmit(form); });
      var inputs = form.querySelectorAll("input, textarea");
      for (var i = 0; i < inputs.length; i++) {
        (function (input) {
          input.addEventListener("blur", function () { self.validateField(input); });
          input.addEventListener("input", function () {
            if (input.getAttribute("aria-invalid") === "true") self.validateField(input);
          });
        })(inputs[i]);
      }
    },

    validators: {
      name: function (v) { return !v.trim() ? "Full name is required." : v.trim().length < 2 ? "Name must be at least 2 characters." : ""; },
      email: function (v) { return !v.trim() ? "Email is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "Enter a valid email address." : ""; },
      subject: function (v) { return !v.trim() ? "Subject is required." : v.trim().length < 3 ? "Subject must be at least 3 characters." : ""; },
      message: function (v) { return !v.trim() ? "Message is required." : v.trim().length < 10 ? "Message must be at least 10 characters." : ""; }
    },

    validateField: function (input) {
      var validator = this.validators[input.name];
      if (!validator) return true;
      var err = validator(input.value);
      var errEl = document.getElementById("error-" + input.name);
      input.setAttribute("aria-invalid", err ? "true" : "false");
      if (errEl) errEl.textContent = err;
      return !err;
    },

    handleSubmit: function (form) {
      var inputs = form.querySelectorAll("input, textarea");
      var allValid = true, firstInvalid = null;
      for (var i = 0; i < inputs.length; i++) {
        if (!this.validateField(inputs[i]) && allValid) {
          allValid = false; firstInvalid = inputs[i];
        }
      }
      var fb = document.getElementById("form-feedback");
      if (!allValid) {
        fb.hidden = false; fb.className = "form-feedback error";
        fb.textContent = "Please fix the errors in the form.";
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      fb.hidden = false; fb.className = "form-feedback success";
      fb.textContent = "Thanks for reaching out. We have received your message and will reply within two business days.";
      form.reset();
      form.querySelectorAll(".field-error").forEach(function (el) { el.textContent = ""; });
      for (var k = 0; k < inputs.length; k++) inputs[k].removeAttribute("aria-invalid");
    }
  };

  /* ==========================================================
     INIT
     ========================================================== */
  function initApp() {
    ThemeSwitcher.init();
    MobileNav.init();
    setActiveNav();
    Events.init();
    Gallery.init();
    ContactForm.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
