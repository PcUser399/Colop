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
// MARKY HERO SCROLL STEP
// ==========================================================================
(() => {
  const hero = document.querySelector(".marky-hero");
  const stepText = document.querySelector(".marky-step-text");
  const heroImage = document.querySelector(".marky-hero-image");
  const heroVideo = document.querySelector(".marky-hero-video");
  const colorDots = document.querySelectorAll(".marky-color-dot");

  if (!document.body.classList.contains("marky-page") || !hero || !stepText || !heroImage || !heroVideo) {
    return;
  }

  const availableStateImages = {
    green: {
      0: "assets/key frames/green-0.webp",
      1: "assets/key frames/green-1.webp",
      2: "assets/key frames/green-2.webp",
      3: "assets/key frames/green-3.webp",
      4: "assets/key frames/green-4.webp",
      5: "assets/key frames/green-5.webp",
    },
    pink: {
      0: "assets/key frames/pink-0.webp",
      1: "assets/key frames/pink-1.webp",
      2: "assets/key frames/pink-2.webp",
      3: "assets/key frames/pink-3.webp",
      4: "assets/key frames/pink-4.webp",
      5: "assets/key frames/pink-5.webp",
    },
    blue: {
      0: "assets/key frames/blue-0.webp",
      1: "assets/key frames/blue-1.webp",
      2: "assets/key frames/blue-2.webp",
      3: "assets/key frames/blue-3.webp",
      4: "assets/key frames/blue-4.webp",
      5: "assets/key frames/blue-5.webp",
    },
  };
  const transitionVideos = {
    green: {
      0: "assets/transition/green0-1.webm",
      1: "assets/transition/green1-2.webm",
      2: "assets/transition/green2-3.webm",
      3: "assets/transition/green3-4.webm",
      4: "assets/transition/green4-5.webm",
    },
    pink: {
      0: "assets/transition/pink0-1.webm",
      1: "assets/transition/pink1-2.webm",
      2: "assets/transition/pink2-3.webm",
      3: "assets/transition/pink3-4.webm",
      4: "assets/transition/pink4-5.webm",
    },
    blue: {
      0: "assets/transition/blue0-1.webm",
      1: "assets/transition/blue1-2.webm",
      2: "assets/transition/blue2-3.webm",
      3: "assets/transition/blue3-4.webm",
      4: "assets/transition/blue4-5.webm",
    },
  };

  let markyHeroState = 0;
  let selectedMarkyColor = "green";
  const maxMarkyHeroState = 5;
  let isRunningStep = false;
  let isVideoRunning = false;
  let isResettingStep = false;
  let isHeroSequenceComplete = false;
  let touchStartY = 0;
  const initialStepText = stepText.innerHTML;
  window.markyHeroState = markyHeroState;
  window.selectedMarkyColor = selectedMarkyColor;

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const isHeroActive = () => window.scrollY < hero.offsetTop + hero.offsetHeight - 4;

  const setScrollLock = (locked) => {
    document.documentElement.classList.toggle("marky-sequence-locked", locked);
    document.body.classList.toggle("marky-sequence-locked", locked);
  };

  const preventScroll = (event) => {
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const getStateImage = (color = selectedMarkyColor, state = markyHeroState) => {
    return availableStateImages[color]?.[state] || availableStateImages.green[state] || availableStateImages.green[0];
  };

  const applyMediaFallback = (src, fallback) => {
    Object.values(availableStateImages).forEach((states) => {
      Object.keys(states).forEach((state) => {
        if (states[state] === src) {
          states[state] = fallback;
        }
      });
    });
  };

  const fallbackStateImage = (color, state) => {
    return availableStateImages[color]?.[state - 1] || availableStateImages.green[state - 1] || availableStateImages.green[0];
  };

  const preloadStateImage = (color, state) => {
    const src = availableStateImages[color]?.[state];
    if (!src) return;

    const probe = new Image();
    probe.onerror = () => applyMediaFallback(src, fallbackStateImage(color, state));
    probe.src = src;
  };

  const setSelectedColor = (color) => {
    selectedMarkyColor = color;
    window.selectedMarkyColor = selectedMarkyColor;

    colorDots.forEach((dot) => {
      const isActive = dot.dataset.color === selectedMarkyColor;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
  };

  const updateHeroImage = () => {
    heroImage.src = getStateImage();
    heroImage.alt = `MARKY ${selectedMarkyColor} etape ${markyHeroState}`;
  };

  const waitForHeroImage = () => new Promise((resolve) => {
    if (heroImage.complete && heroImage.naturalWidth > 0) {
      resolve();
      return;
    }

    const finish = () => {
      heroImage.removeEventListener("load", finish);
      heroImage.removeEventListener("error", finish);
      resolve();
    };

    heroImage.addEventListener("load", finish, { once: true });
    heroImage.addEventListener("error", finish, { once: true });
  });

  const updateHeroImageAndWait = async () => {
    updateHeroImage();
    await waitForHeroImage();
  };

  const getTransitionVideo = (fromState = markyHeroState) => {
    return transitionVideos[selectedMarkyColor]?.[fromState] || transitionVideos.green[fromState];
  };

  const applyVideoFallback = (src, fallback) => {
    Object.values(transitionVideos).forEach((states) => {
      Object.keys(states).forEach((state) => {
        if (states[state] === src) {
          states[state] = fallback;
        }
      });
    });
  };

  const fallbackTransitionVideo = (color, fromState) => {
    return transitionVideos.green[fromState] || transitionVideos[color]?.[fromState - 1] || transitionVideos.green[0];
  };

  const preloadTransitionVideo = (color, fromState) => {
    const src = transitionVideos[color]?.[fromState];
    if (!src) return;

    const probe = document.createElement("video");
    probe.addEventListener("error", () => applyVideoFallback(src, fallbackTransitionVideo(color, fromState)), { once: true });
    probe.preload = "metadata";
    probe.src = src;
  };

  const updateTransitionVideo = (fromState) => {
    const nextSrc = getTransitionVideo(fromState);

    if (heroVideo.dataset.src === nextSrc) return;

    heroVideo.pause();
    heroVideo.src = nextSrc;
    heroVideo.dataset.src = nextSrc;
    heroVideo.load();
  };

  const playTransition = (fromState) => new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      isVideoRunning = false;
      heroVideo.removeEventListener("ended", finish);
      resolve();
    };

    isVideoRunning = true;
    updateTransitionVideo(fromState);
    heroVideo.addEventListener("ended", finish, { once: true });
    heroVideo.currentTime = 0;
    heroVideo.classList.add("is-active");
    heroImage.classList.remove("is-active");

    const playRequest = heroVideo.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(finish);
    }

    window.setTimeout(finish, 12000);
  });

  const stepContent = {
    1: {
      title: "Composez le nom<br />et pr&eacute;parez le <strong>tampon !</strong>",
      subtitle: "Ins&eacute;rez les lettres, choisissez un petit symbole et pr&eacute;parez MARKY pour marquer les affaires de votre enfant en quelques secondes.",
      features: [
        ["fa-solid fa-font", "Lettres<br />incluses"],
        ["fa-regular fa-face-smile", "Symboles<br />amusants"],
        ["fa-solid fa-hand-sparkles", "Pr&ecirc;t en<br />un instant"],
      ],
      cta: "Voir l'&eacute;tape suivante",
      status: "Transition en cours",
    },
    2: {
      title: "Tamponnez, collez<br />et gardez tout <strong>identifi&eacute; !</strong>",
      subtitle: "Appliquez le marquage sur les v&ecirc;tements, les gourdes, les bo&icirc;tes et les fournitures pour retrouver chaque affaire sans stress.",
      features: [
        ["fa-solid fa-shirt", "Textiles<br />marqu&eacute;s"],
        ["fa-solid fa-bottle-water", "Objets<br />prot&eacute;g&eacute;s"],
        ["fa-solid fa-check-double", "Routine<br />termin&eacute;e"],
      ],
      cta: "D&eacute;couvrir les produits",
      status: "Etape finalis&eacute;e",
    },
    3: {
      title: "Rangez, partez<br />et laissez MARKY <strong>suivre !</strong>",
      subtitle: "La solution est pr&ecirc;te pour accompagner la routine quotidienne : les affaires restent reconnaissables, organis&eacute;es et faciles &agrave; retrouver.",
      features: [
        ["fa-solid fa-box-open", "Affaires<br />rang&eacute;es"],
        ["fa-solid fa-route", "Pr&ecirc;t pour<br />la journ&eacute;e"],
        ["fa-solid fa-heart", "Sourire<br />assur&eacute;"],
      ],
      cta: "Voir la collection",
      status: "Parcours complet",
    },
    4: {
      title: "Retrouvez tout<br />avec un simple <strong>coup d'oeil !</strong>",
      subtitle: "Chaque objet porte son rep&egrave;re clair et durable, pour une journ&eacute;e plus fluide &agrave; l'&eacute;cole, au sport ou en sortie.",
      features: [
        ["fa-solid fa-magnifying-glass", "Objets<br />retrouv&eacute;s"],
        ["fa-solid fa-child-reaching", "Enfants<br />autonomes"],
        ["fa-solid fa-star", "Routine<br />simplifi&eacute;e"],
      ],
      cta: "Choisir mon MARKY",
      status: "Derniere etape",
    },
    5: {
      title: "MARKY devient<br />votre alli&eacute; <strong>quotidien !</strong>",
      subtitle: "Du matin jusqu'au retour &agrave; la maison, le marquage reste lisible, pratique et rassurant pour toute la famille.",
      features: [
        ["fa-solid fa-house-chimney", "Retour<br />sans perte"],
        ["fa-solid fa-calendar-check", "Usage<br />quotidien"],
        ["fa-solid fa-thumbs-up", "Parents<br />rassur&eacute;s"],
      ],
      cta: "Ajouter au panier",
      status: "Sequence terminee",
    },
  };

  const renderStepText = (step) => {
    const content = stepContent[step];
    if (!content) return;

    const features = content.features.map(([icon, label]) => (
      `<span><i class="${icon}"></i><b>${label}</b></span>`
    )).join("");

    stepText.innerHTML = `
      <h1>&Eacute;TAPE ${step}</h1>
      <h2 class="marky-hero-title">${content.title}</h2>
      <p class="marky-subtitle">${content.subtitle}</p>
      <div class="marky-feature-row" aria-label="Etape ${step} MARKY">${features}</div>
      <div class="marky-hero-actions">
        <a class="marky-primary" href="#marky-utilisation">${content.cta}</a>
        <span class="marky-made"><i class="fa-solid fa-spinner"></i> ${content.status}</span>
      </div>
    `;
  };

  const runNextStep = async () => {
    if (isHeroSequenceComplete || isResettingStep || isRunningStep || markyHeroState >= maxMarkyHeroState || !isHeroActive()) return;

    isRunningStep = true;
    const previousState = markyHeroState;
    markyHeroState += 1;
    window.markyHeroState = markyHeroState;
    setScrollLock(true);
    window.scrollTo({ top: hero.offsetTop, left: 0 });

    const transitionVideo = playTransition(previousState);

    stepText.classList.add("is-leaving");
    await wait(460);
    renderStepText(markyHeroState);
    stepText.dataset.step = String(markyHeroState);
    stepText.classList.remove("is-leaving");
    stepText.classList.add("is-entering");
    await wait(620);
    stepText.classList.remove("is-entering");

    await transitionVideo;

    await updateHeroImageAndWait();
    heroImage.classList.add("is-active");
    heroVideo.pause();
    heroVideo.classList.remove("is-active");

    setScrollLock(false);
    isRunningStep = false;
  };

  const resetHeroSequence = async () => {
    if (isResettingStep || isRunningStep || isVideoRunning || isHeroSequenceComplete || markyHeroState < maxMarkyHeroState) return;

    isResettingStep = true;
    isHeroSequenceComplete = true;
    setScrollLock(true);
    window.scrollTo({ top: hero.offsetTop, left: 0 });
    markyHeroState = 0;
    window.markyHeroState = markyHeroState;
    heroVideo.pause();
    heroVideo.classList.remove("is-active");

    stepText.classList.add("is-leaving");
    heroImage.classList.remove("is-active");
    await wait(360);
    stepText.innerHTML = initialStepText;
    stepText.dataset.step = "0";
    await updateHeroImageAndWait();
    stepText.classList.remove("is-leaving");
    stepText.classList.add("is-entering");
    heroImage.classList.add("is-active");
    isResettingStep = false;
    setScrollLock(false);
    await wait(520);
    stepText.classList.remove("is-entering");
  };

  window.addEventListener("wheel", (event) => {
    if (isRunningStep || isResettingStep) {
      preventScroll(event);
      return;
    }

    if (!isHeroSequenceComplete && markyHeroState < maxMarkyHeroState && event.deltaY > 0 && isHeroActive()) {
      preventScroll(event);
      runNextStep();
    } else if (!isHeroSequenceComplete && markyHeroState >= maxMarkyHeroState && event.deltaY > 0 && isHeroActive()) {
      preventScroll(event);
      resetHeroSequence();
    }
  }, { passive: false });

  window.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    const touchY = event.touches[0]?.clientY || touchStartY;
    const isMovingDownPage = touchStartY - touchY > 8;

    if (isRunningStep || isResettingStep) {
      preventScroll(event);
      return;
    }

    if (!isHeroSequenceComplete && markyHeroState < maxMarkyHeroState && isMovingDownPage && isHeroActive()) {
      preventScroll(event);
      runNextStep();
    } else if (!isHeroSequenceComplete && markyHeroState >= maxMarkyHeroState && isMovingDownPage && isHeroActive()) {
      preventScroll(event);
      resetHeroSequence();
    }
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    const downKeys = ["ArrowDown", "PageDown", " ", "Spacebar"];

    if ((isRunningStep || isResettingStep) && downKeys.includes(event.key)) {
      preventScroll(event);
      return;
    }

    if (!isHeroSequenceComplete && markyHeroState < maxMarkyHeroState && downKeys.includes(event.key) && isHeroActive()) {
      preventScroll(event);
      runNextStep();
    } else if (!isHeroSequenceComplete && markyHeroState >= maxMarkyHeroState && downKeys.includes(event.key) && isHeroActive()) {
      preventScroll(event);
      resetHeroSequence();
    }
  });

  colorDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      if (isVideoRunning) return;

      const color = dot.dataset.color;
      if (!color || color === selectedMarkyColor) return;

      setSelectedColor(color);
      updateHeroImage();
    });
  });

  Object.keys(availableStateImages).forEach((color) => {
    Object.keys(availableStateImages[color]).forEach((state) => preloadStateImage(color, Number(state)));
  });

  Object.keys(transitionVideos).forEach((color) => {
    Object.keys(transitionVideos[color]).forEach((state) => preloadTransitionVideo(color, Number(state)));
  });

})();

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
