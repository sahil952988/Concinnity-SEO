function includeHTML(id, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = data;
      } else {
        console.error(`Element with id "${id}" not found.`);
      }
    })
    .catch((error) =>
      console.error(
        `Error loading file "${file}" for element id "${id}":`,
        error
      )
    );
}

// Number animation function
function animateNumber(
  elementId,
  finalValue,
  suffix = "",
  prefix = "",
  duration = 2000
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const startValue = 0;
  const startTime = Date.now();

  function updateNumber() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(
      startValue + (finalValue - startValue) * easeOutCubic
    );

    element.textContent = prefix + currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      // Ensure final value is exact
      element.textContent = prefix + finalValue + suffix;
    }
  }

  updateNumber();
}

// Intersection Observer for triggering animations when section comes into view
function initStatsAnimation() {
  const statsSection = document.querySelector(".success-metrics-section");
  if (!statsSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Trigger animations with slight delays for better effect
          setTimeout(() => animateNumber("stat-1", 120, "%", "+", 1500), 200);
          setTimeout(() => animateNumber("stat-2", 400, "+", "", 1800), 400);
          setTimeout(() => animateNumber("stat-3", 60, "%", "", 1600), 600);

          // Unobserve after animation starts
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5, // Trigger when 50% of the section is visible
      rootMargin: "-50px", // Start animation a bit before the section is fully visible
    }
  );

  observer.observe(statsSection);
}

// Initialize stats animation when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Small delay to ensure all elements are rendered
  setTimeout(initStatsAnimation, 100);
});

/* =========================================================
   Dropdowns: hover on desktop, click on mobile
   - Works with Bootstrap 5 .dropdown and nested .dropend
   - Keeps aria-expanded in sync
   ========================================================= */
(function () {
  const desktopQuery = window.matchMedia("(min-width: 768px)");

  // Bind hover handlers (guarded so we don't double-bind)
  function bindHover(drop) {
    if (drop.dataset.hoverBound === "1") return;
    drop.dataset.hoverBound = "1";

    const toggle = drop.querySelector('[data-bs-toggle="dropdown"]');
    const menu = drop.querySelector(":scope > .dropdown-menu");
    if (!toggle || !menu) return;

    function show() {
      if (!desktopQuery.matches) return;
      drop.classList.add("show");
      menu.classList.add("show");
      toggle.setAttribute("aria-expanded", "true");
    }

    function hide() {
      if (!desktopQuery.matches) return;
      drop.classList.remove("show");
      menu.classList.remove("show");
      toggle.setAttribute("aria-expanded", "false");
    }

    // Mouse
    drop.addEventListener("mouseenter", show);
    drop.addEventListener("mouseleave", hide);

    // Keyboard focus (accessibility)
    toggle.addEventListener("focus", show);
    menu.addEventListener("focusin", show);
    menu.addEventListener("focusout", (e) => {
      if (!menu.contains(e.relatedTarget)) hide();
    });
  }

  // Click handlers for nested submenus (works mobile + desktop)
  function bindSubmenuClicks() {
    document
      .querySelectorAll(".dropdown-menu .dropend > .dropdown-toggle")
      .forEach((trigger) => {
        if (trigger.dataset.submenuBound === "1") return;
        trigger.dataset.submenuBound = "1";

        trigger.addEventListener("click", function (e) {
          // On desktop, prevent click navigating so hover remains primary;
          // On mobile, we also prevent default to toggle submenu.
          e.preventDefault();
          e.stopPropagation();

          const submenu = this.nextElementSibling; // nested .dropdown-menu
          if (!submenu) return;

          // Close other open submenus at the same level
          const parentMenu = this.closest(".dropdown-menu");
          parentMenu
            ?.querySelectorAll(".dropdown-menu.show")
            .forEach((m) => {
              if (m !== submenu) m.classList.remove("show");
            });

          // Toggle current submenu
          submenu.classList.toggle("show");

          // Ensure ancestor dropdown stays open
          const parentDropdown = this.closest(".dropdown, .dropend");
          parentDropdown?.classList.add("show");
          parentMenu?.classList.add("show");
        });
      });
  }

  function closeAllMenus() {
    document
      .querySelectorAll(".navbar .dropdown-menu.show")
      .forEach((m) => m.classList.remove("show"));
    document
      .querySelectorAll(".navbar .dropdown.show, .navbar .dropend.show")
      .forEach((d) => d.classList.remove("show"));
    document
      .querySelectorAll(".navbar [data-bs-toggle='dropdown'][aria-expanded='true']")
      .forEach((t) => t.setAttribute("aria-expanded", "false"));
  }

  function initDropdowns() {
    // Hover binding on all dropdown containers
    document
      .querySelectorAll(".navbar .dropdown, .navbar .dropend")
      .forEach(bindHover);

    // Click binding for nested submenus
    bindSubmenuClicks();

    // When any top-level dropdown fully closes, hide nested submenus too
    document.querySelectorAll(".dropdown").forEach((dd) => {
      if (dd.dataset.hideBound === "1") return;
      dd.dataset.hideBound = "1";

      dd.addEventListener("hidden.bs.dropdown", () => {
        dd.querySelectorAll(".dropdown-menu.show").forEach((m) =>
          m.classList.remove("show")
        );
        dd.querySelectorAll("[aria-expanded='true']").forEach((t) =>
          t.setAttribute("aria-expanded", "false")
        );
      });
    });
  }

  // Init on DOM ready
  document.addEventListener("DOMContentLoaded", initDropdowns);

  // On breakpoint change, close any open menus so states don't get stuck
  desktopQuery.addEventListener("change", closeAllMenus);
})();
