/* ============================================================
   CABNA Interactive Features
   No external runtime dependencies
   ============================================================ */
(function () {
  "use strict";

  var MONTH_NAMES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  function formatDate(dateStr, timeStr) {
    var d = new Date(dateStr + "T00:00:00");
    var day = d.getDate();
    var month = MONTH_NAMES[d.getMonth()];
    var year = d.getFullYear();
    return day + " de " + month + " de " + year + " - " + timeStr;
  }

  function getMonthLabel(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var m = MONTH_NAMES[d.getMonth()];
    return m.charAt(0).toUpperCase() + m.slice(1) + " " + d.getFullYear();
  }

  function getMonthValue(dateStr) {
    return dateStr.substring(0, 7);
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ============================================================
     EVENTS MODULE
     ============================================================ */
  var Events = {
    data: [],
    filtered: [],

    init: function () {
      this.loadData();
    },

    loadData: function () {
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "data/events.json", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 0) {
            try {
              self.data = JSON.parse(xhr.responseText);
              self.filtered = self.data.slice();
              self.populateFilters();
              self.render();
            } catch (e) {
              self.renderFallback();
            }
          } else {
            self.renderFallback();
          }
        }
      };
      try {
        xhr.send();
      } catch (e) {
        self.renderFallback();
      }
    },

    populateFilters: function () {
      var catSelect = document.getElementById("filter-category");
      var dateSelect = document.getElementById("filter-date");
      if (!catSelect || !dateSelect) return;

      var categories = {};
      var months = {};
      for (var i = 0; i < this.data.length; i++) {
        var ev = this.data[i];
        categories[ev.category] = true;
        var mv = getMonthValue(ev.date);
        months[mv] = getMonthLabel(ev.date);
      }

      var catKeys = Object.keys(categories).sort();
      for (var c = 0; c < catKeys.length; c++) {
        var opt = document.createElement("option");
        opt.value = catKeys[c];
        opt.textContent = catKeys[c];
        catSelect.appendChild(opt);
      }

      var monthKeys = Object.keys(months).sort();
      for (var m = 0; m < monthKeys.length; m++) {
        var mopt = document.createElement("option");
        mopt.value = monthKeys[m];
        mopt.textContent = months[monthKeys[m]];
        dateSelect.appendChild(mopt);
      }

      var self = this;
      catSelect.addEventListener("change", function () { self.applyFilters(); });
      dateSelect.addEventListener("change", function () { self.applyFilters(); });

      var resetBtn = document.getElementById("filter-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          catSelect.value = "all";
          dateSelect.value = "all";
          self.applyFilters();
        });
      }
    },

    applyFilters: function () {
      var catVal = document.getElementById("filter-category").value;
      var dateVal = document.getElementById("filter-date").value;

      this.filtered = this.data.filter(function (ev) {
        var catMatch = catVal === "all" || ev.category === catVal;
        var dateMatch = dateVal === "all" || getMonthValue(ev.date) === dateVal;
        return catMatch && dateMatch;
      });

      this.render();
    },

    render: function () {
      var grid = document.getElementById("events-grid");
      var countEl = document.getElementById("events-count");
      if (!grid) return;

      grid.innerHTML = "";

      if (this.filtered.length === 0) {
        var empty = document.createElement("p");
        empty.className = "events-empty";
        empty.textContent = "No se encontraron eventos con los filtros seleccionados.";
        grid.appendChild(empty);
        if (countEl) countEl.textContent = "0 eventos";
        return;
      }

      if (countEl) {
        countEl.textContent = this.filtered.length + " evento" + (this.filtered.length !== 1 ? "s" : "");
      }

      for (var i = 0; i < this.filtered.length; i++) {
        var ev = this.filtered[i];
        var card = document.createElement("article");
        card.className = "event-card";
        card.setAttribute("role", "listitem");

        var img = document.createElement("img");
        img.className = "event-card-img";
        img.src = ev.image;
        img.alt = escapeHtml(ev.title);
        img.loading = "lazy";
        img.width = 400;
        img.height = 180;
        card.appendChild(img);

        var body = document.createElement("div");
        body.className = "event-card-body";

        var cat = document.createElement("span");
        cat.className = "event-category";
        cat.setAttribute("data-cat", ev.category);
        cat.textContent = ev.category;
        body.appendChild(cat);

        var title = document.createElement("h3");
        title.className = "event-title";
        title.textContent = ev.title;
        body.appendChild(title);

        var time = document.createElement("time");
        time.className = "event-date";
        time.setAttribute("datetime", ev.date);
        time.textContent = formatDate(ev.date, ev.time);
        body.appendChild(time);

        var loc = document.createElement("p");
        loc.className = "event-location";
        loc.textContent = "\uD83D\uDCCD " + ev.location;
        body.appendChild(loc);

        var desc = document.createElement("p");
        desc.className = "event-desc";
        desc.textContent = ev.description;
        body.appendChild(desc);

        card.appendChild(body);
        grid.appendChild(card);
      }
    },

    renderFallback: function () {
      /* If XHR fails, the noscript content already provides fallback */
    }
  };

  /* ============================================================
     GALLERY MODULE
     ============================================================ */
  var Gallery = {
    images: [],
    currentIndex: 0,

    init: function () {
      this.loadData();
    },

    loadData: function () {
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "data/image_assets.json", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 0) {
            try {
              var data = JSON.parse(xhr.responseText);
              var allImages = data.images || data;
              self.images = allImages.filter(function (img) {
                var url = img.url || "";
                return url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) && !url.match(/logo|ico-|favicon/i);
              });
              self.render();
              self.initLightbox();
            } catch (e) {
              /* noscript fallback */
            }
          }
        }
      };
      try {
        xhr.send();
      } catch (e) {
        /* noscript fallback */
      }
    },

    render: function () {
      var grid = document.getElementById("gallery-grid");
      if (!grid) return;

      grid.innerHTML = "";

      for (var i = 0; i < this.images.length; i++) {
        var img = this.images[i];

        var figure = document.createElement("figure");
        figure.className = "gallery-item";
        figure.setAttribute("role", "listitem");
        figure.setAttribute("tabindex", "0");
        figure.setAttribute("data-index", i);
        figure.setAttribute("aria-label", "Ver imagen: " + (img.alt || img.found_on_page || "Imagen del club"));

        var imgEl = document.createElement("img");
        imgEl.src = img.url;
        imgEl.alt = img.alt || img.found_on_page || "Imagen del club";
        imgEl.loading = "lazy";
        imgEl.width = 400;
        imgEl.height = 300;
        figure.appendChild(imgEl);

        var caption = document.createElement("figcaption");
        caption.textContent = img.alt || img.found_on_page || "";
        figure.appendChild(caption);

        grid.appendChild(figure);
      }

      var self = this;
      grid.addEventListener("click", function (e) {
        var item = e.target.closest(".gallery-item");
        if (item) {
          self.openLightbox(parseInt(item.getAttribute("data-index"), 10));
        }
      });
      grid.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          var item = e.target.closest(".gallery-item");
          if (item) {
            e.preventDefault();
            self.openLightbox(parseInt(item.getAttribute("data-index"), 10));
          }
        }
      });
    },

    initLightbox: function () {
      var self = this;
      var lightbox = document.getElementById("lightbox");
      if (!lightbox) return;

      var prevBtn = document.getElementById("lightbox-prev");
      var nextBtn = document.getElementById("lightbox-next");

      prevBtn.addEventListener("click", function () { self.navigate(-1); });
      nextBtn.addEventListener("click", function () { self.navigate(1); });

      lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
        el.addEventListener("click", function () { self.closeLightbox(); });
      });

      document.addEventListener("keydown", function (e) {
        if (lightbox.hidden) return;

        switch (e.key) {
          case "Escape":
            self.closeLightbox();
            break;
          case "ArrowLeft":
            e.preventDefault();
            self.navigate(-1);
            break;
          case "ArrowRight":
            e.preventDefault();
            self.navigate(1);
            break;
        }
      });
    },

    openLightbox: function (index) {
      this.currentIndex = index;
      this._previouslyFocused = document.activeElement;

      var lightbox = document.getElementById("lightbox");
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";

      this.updateLightbox();

      var closeBtn = lightbox.querySelector(".lightbox-close");
      if (closeBtn) closeBtn.focus();
    },

    closeLightbox: function () {
      var lightbox = document.getElementById("lightbox");
      lightbox.hidden = true;
      document.body.style.overflow = "";

      if (this._previouslyFocused) {
        this._previouslyFocused.focus();
      }
    },

    navigate: function (direction) {
      this.currentIndex += direction;
      if (this.currentIndex < 0) this.currentIndex = this.images.length - 1;
      if (this.currentIndex >= this.images.length) this.currentIndex = 0;
      this.updateLightbox();
    },

    updateLightbox: function () {
      var img = this.images[this.currentIndex];
      if (!img) return;

      var lightboxImg = document.getElementById("lightbox-img");
      var captionEl = document.getElementById("lightbox-caption");
      var currentEl = document.getElementById("lightbox-current");
      var totalEl = document.getElementById("lightbox-total");

      lightboxImg.src = img.url;
      lightboxImg.alt = img.alt || "Imagen del club";
      captionEl.textContent = img.alt || img.found_on_page || "";
      currentEl.textContent = this.currentIndex + 1;
      totalEl.textContent = this.images.length;
    }
  };

  /* ============================================================
     CONTACT FORM MODULE
     ============================================================ */
  var ContactForm = {
    init: function () {
      var form = document.getElementById("contact-form");
      if (!form) return;

      var self = this;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        self.handleSubmit(form);
      });

      var inputs = form.querySelectorAll("input, textarea");
      for (var i = 0; i < inputs.length; i++) {
        (function (input) {
          input.addEventListener("blur", function () {
            self.validateField(input);
          });
          input.addEventListener("input", function () {
            if (input.getAttribute("aria-invalid") === "true") {
              self.validateField(input);
            }
          });
        })(inputs[i]);
      }
    },

    validators: {
      nombre: function (value) {
        if (!value.trim()) return "El nombre es obligatorio.";
        if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres.";
        return "";
      },
      email: function (value) {
        if (!value.trim()) return "El correo electrónico es obligatorio.";
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value.trim())) return "Ingresá un correo electrónico válido.";
        return "";
      },
      asunto: function (value) {
        if (!value.trim()) return "El asunto es obligatorio.";
        if (value.trim().length < 3) return "El asunto debe tener al menos 3 caracteres.";
        return "";
      },
      mensaje: function (value) {
        if (!value.trim()) return "El mensaje es obligatorio.";
        if (value.trim().length < 10) return "El mensaje debe tener al menos 10 caracteres.";
        return "";
      }
    },

    validateField: function (input) {
      var name = input.name;
      var validator = this.validators[name];
      if (!validator) return true;

      var error = validator(input.value);
      var errorEl = document.getElementById("error-" + name);

      if (error) {
        input.setAttribute("aria-invalid", "true");
        if (errorEl) errorEl.textContent = error;
        return false;
      } else {
        input.setAttribute("aria-invalid", "false");
        if (errorEl) errorEl.textContent = "";
        return true;
      }
    },

    handleSubmit: function (form) {
      var inputs = form.querySelectorAll("input, textarea");
      var allValid = true;
      var firstInvalid = null;

      for (var i = 0; i < inputs.length; i++) {
        var valid = this.validateField(inputs[i]);
        if (!valid && allValid) {
          allValid = false;
          firstInvalid = inputs[i];
        }
      }

      var feedback = document.getElementById("form-feedback");

      if (!allValid) {
        feedback.hidden = false;
        feedback.className = "form-feedback error";
        feedback.textContent = "Por favor, corregí los errores en el formulario.";
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      feedback.hidden = false;
      feedback.className = "form-feedback success";
      feedback.textContent = "¡Mensaje enviado correctamente! Te responderemos a la brevedad.";
      form.reset();

      var errorSpans = form.querySelectorAll(".field-error");
      for (var j = 0; j < errorSpans.length; j++) {
        errorSpans[j].textContent = "";
      }
      for (var k = 0; k < inputs.length; k++) {
        inputs[k].removeAttribute("aria-invalid");
      }
    }
  };

  /* ============================================================
     INITIALIZATION
     ============================================================ */
  function initApp() {
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
