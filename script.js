const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");
const header = document.querySelector(".site-header");
const filterToggle = document.querySelector(".filter-toggle");
const layout = document.querySelector(".layout");
const filters = document.querySelector(".filters");
const footer = document.querySelector(".footer");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

if (header) {
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

if (filterToggle && layout) {
  document.body.classList.toggle("filters-hidden", layout.classList.contains("filters-hidden"));

  filterToggle.addEventListener("click", () => {
    const hidden = layout.classList.toggle("filters-hidden");
    document.body.classList.toggle("filters-hidden", hidden);
    filterToggle.setAttribute("aria-expanded", String(!hidden));
    filterToggle.setAttribute("aria-label", hidden ? "Afficher les filtres" : "Masquer les filtres");
    window.dispatchEvent(new Event("resize"));
  });
}

if (filters && layout) {
  const updateFilters = () => {
    const headerHeight = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty("--header-offset", `${headerHeight}px`);
    const layoutRect = layout.getBoundingClientRect();
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const fixedHeight = window.innerHeight - headerHeight;
    const shouldFix = layoutRect.top <= headerHeight;
    const stopOffset = 5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const shouldStop = footerRect ? footerRect.top <= window.innerHeight + stopOffset : false;

    if (footerRect && shouldStop) {
      const layoutTop = layoutRect.top + window.scrollY;
      const footerTop = footerRect.top + window.scrollY;
      const stopTop = Math.max(0, footerTop - layoutTop - fixedHeight - stopOffset);
      filters.style.setProperty("--filter-stop-top", `${stopTop}px`);
    }

    filters.classList.toggle("is-stopped", shouldStop);
    filters.classList.toggle("is-fixed", shouldFix && !shouldStop);
  };

  updateFilters();
  window.addEventListener("scroll", updateFilters, { passive: true });
  window.addEventListener("resize", updateFilters);
}

// ==========================================================================
// MARKY PAGE COLOR SWATCHES INTERACTIVITY
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Main stamp color picker
  const stampSwatches = document.querySelectorAll(".color-swatches .swatch");
  const mainStampImg = document.getElementById("main-stamp-image");

  if (stampSwatches && mainStampImg) {
    stampSwatches.forEach(swatch => {
      swatch.addEventListener("click", () => {
        stampSwatches.forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");
        
        const newImgSrc = swatch.getAttribute("data-img");
        if (newImgSrc) {
          mainStampImg.src = newImgSrc;
        }
      });
    });
  }

  // Accessories color pickers (backpack, pencilcase)
  const cardSwatches = document.querySelectorAll(".card-color-picker .swatch");
  cardSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      const container = swatch.parentElement;
      const product = swatch.getAttribute("data-product");
      const newImgSrc = swatch.getAttribute("data-img");
      
      // Remove active class from sibling swatches
      container.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      
      // Update image
      if (product === "backpack") {
        const img = document.getElementById("backpack-image");
        if (img) img.src = newImgSrc;
      } else if (product === "pencilcase") {
        const img = document.getElementById("pencilcase-image");
        if (img) img.src = newImgSrc;
      }
    });
  });
});

