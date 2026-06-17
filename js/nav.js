(function () {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");

  if (!toggle || !nav) {
    return;
  }

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      open ? "Tutup menu navigasi" : "Buka menu navigasi",
    );
    nav.classList.toggle("is-open", open);
  }

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  toggle.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!isOpen());
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (!isOpen()) {
      return;
    }
    const header = document.querySelector(".site-header");
    if (header && !header.contains(event.target)) {
      setOpen(false);
    }
  });

  nav.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
      setOpen(false);
    }
  });

  const mql = window.matchMedia("(min-width: 641px)");
  function handleBreakpoint(event) {
    if (event.matches && isOpen()) {
      setOpen(false);
    }
  }
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", handleBreakpoint);
  } else if (typeof mql.addListener === "function") {
    mql.addListener(handleBreakpoint);
  }
})();
