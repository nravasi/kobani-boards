/* San Lorenzo de Almagro — Main JS */
(function () {
  "use strict";

  /* Mobile nav toggle */
  var toggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("is-open");
    });
  }

  /* Tabs */
  document.querySelectorAll("[data-tabs]").forEach(function (tabGroup) {
    var buttons = tabGroup.querySelectorAll(".tab-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-target");
        buttons.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        tabGroup.querySelectorAll(".tab-panel").forEach(function (panel) {
          panel.classList.remove("is-active");
          if (panel.id === target) { panel.classList.add("is-active"); }
        });
      });
    });
  });

  /* Contact & press form submission */
  document.querySelectorAll("form[data-ajax]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var honeypot = form.querySelector(".hp-field input");
      if (honeypot && honeypot.value !== "") { return; }
      var msg = form.querySelector(".form-message");
      if (msg) {
        msg.textContent = "¡Gracias! Tu mensaje fue enviado. Te responderemos a la brevedad.";
        msg.className = "form-message success";
        msg.removeAttribute("hidden");
      }
      form.reset();
    });
  });
})();
