// Anchor / scroll-indicator scrolling (native — no smooth scroll library)
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEADER_OFFSET = 100;

  function getScrollY() {
    return window.scrollY || 0;
  }

  function scrollToElement(el, offset = -HEADER_OFFSET) {
    if (!el) return;
    const top = el.getBoundingClientRect().top + getScrollY() + offset;
    window.scrollTo({ top, behavior: "auto" });
  }

  function findNextScrollTarget(fromEl) {
    let node = fromEl.closest(".shopify-section") || fromEl.closest("section") || fromEl;
    while (node) {
      node = node.nextElementSibling;
      if (!node) break;
      if (node.matches && node.matches("section")) return node;
      if (node.matches && node.matches(".shopify-section")) {
        const nested = node.querySelector("section");
        if (nested) return nested;
      }
      const nested = node.querySelector && node.querySelector("section");
      if (nested) return nested;
    }
    return null;
  }

  document.addEventListener(
    "click",
    (e) => {
      const scrollTrigger = e.target && e.target.closest ? e.target.closest("[data-scroll-indicator]") : null;
      if (scrollTrigger) {
        e.preventDefault();
        const fromSection = scrollTrigger.closest("section");
        scrollToElement(findNextScrollTarget(fromSection || scrollTrigger));
        return;
      }

      const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      scrollToElement(target);
    },
    { passive: false }
  );

  const homeTale = document.querySelector(".home-tale");
  const siteHeader = document.getElementById("site-header");

  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  function updateHomeTaleOpacity() {
    if (!homeTale || reduceMotion) return;
    const rect = homeTale.getBoundingClientRect();
    const vh = window.innerHeight;
    const fadeDistance = Math.max(vh * 0.42, 280);
    let p = (vh - rect.top) / fadeDistance;
    p = Math.max(0, Math.min(1, p));
    p = easeOutQuad(p);
    homeTale.style.opacity = String(p);
    homeTale.style.willChange = p >= 0.998 ? "auto" : "opacity";
  }

  const isHomePage = document.body?.dataset?.page === "home";

  function updateHeaderHeroBackground() {
    if (!siteHeader) return;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const headerHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-header-height")) ||
      siteHeader.offsetHeight ||
      100;
    const heroHeight = Math.max(0, vh - headerHeight);
    const pastHero = !isHomePage || getScrollY() >= heroHeight;

    siteHeader.classList.toggle("site-header--past-hero", pastHero);
    siteHeader.classList.toggle("site-header--over-hero", isHomePage && !pastHero);
  }

  // Keep hero .home-story / .home-intro at full opacity (no scroll fade).
  document.querySelectorAll(".home-story.home-intro, .home-intro-section .home-story").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
    el.style.willChange = "auto";
  });

  const scrollHandlers = [];
  if (homeTale && !reduceMotion) scrollHandlers.push(updateHomeTaleOpacity);
  if (siteHeader) scrollHandlers.push(updateHeaderHeroBackground);

  function onScroll() {
    scrollHandlers.forEach((fn) => fn());
  }

  if (homeTale && !reduceMotion) {
    homeTale.style.opacity = "0";
    homeTale.style.willChange = "opacity";
  }

  if (scrollHandlers.length) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    if (siteHeader) requestAnimationFrame(updateHeaderHeroBackground);
  }

  if (isHomePage && getScrollY() < 100) {
    window.scrollTo({ top: 100, behavior: "auto" });
  }
})();

// Collection page filters (name + price + sort)
(function () {
  const root = document.querySelector("[data-collection-filters]");
  if (!root) return;

  const nameInput = root.querySelector("[data-filter-name]");
  const minSelect = root.querySelector("[data-filter-min-price]");
  const maxSelect = root.querySelector("[data-filter-max-price]");
  const sortSelect = root.querySelector("[data-filter-sort]");
  const clearBtn = root.querySelector("[data-filter-clear]");
  const resultsEl = root.querySelector("[data-filter-results-count]");

  const grid = document.querySelector(".collection-grid");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll("[data-product-item]"));
  if (!items.length) return;

  // Preserve initial DOM order as "featured"
  items.forEach((el, idx) => {
    el.dataset.featuredIndex = String(idx);
  });

  function parsePriceSelect(el) {
    if (!el) return null;
    const raw = String(el.value || "").trim();
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  function getFilters() {
    const q = (nameInput && nameInput.value ? nameInput.value : "").trim().toLowerCase();
    const minCents = parsePriceSelect(minSelect);
    const maxCents = parsePriceSelect(maxSelect);
    const sort = sortSelect && sortSelect.value ? sortSelect.value : "featured";
    return { q, minCents, maxCents, sort };
  }

  function matches(el, f) {
    const title = (el.dataset.productTitle || "").toLowerCase();
    const price = Number(el.dataset.productPrice || "0");

    if (f.q && !title.includes(f.q)) return false;
    if (f.minCents != null && price < f.minCents) return false;
    if (f.maxCents != null && price > f.maxCents) return false;
    return true;
  }

  function sortVisible(visible, sort) {
    const byTitle = (a, b) =>
      (a.dataset.productTitle || "").localeCompare(b.dataset.productTitle || "", undefined, { sensitivity: "base" });
    const byPrice = (a, b) => Number(a.dataset.productPrice || "0") - Number(b.dataset.productPrice || "0");
    const byFeatured = (a, b) => Number(a.dataset.featuredIndex || "0") - Number(b.dataset.featuredIndex || "0");

    switch (sort) {
      case "price-asc":
        return visible.sort(byPrice);
      case "price-desc":
        return visible.sort((a, b) => -byPrice(a, b));
      case "name-asc":
        return visible.sort(byTitle);
      case "name-desc":
        return visible.sort((a, b) => -byTitle(a, b));
      case "featured":
      default:
        return visible.sort(byFeatured);
    }
  }

  function apply() {
    const f = getFilters();
    const visible = [];

    for (const el of items) {
      const ok = matches(el, f);
      el.style.display = ok ? "" : "none";
      if (ok) visible.push(el);
    }

    sortVisible(visible, f.sort);
    for (const el of visible) grid.appendChild(el);

    if (resultsEl) {
      resultsEl.textContent = `${visible.length} of ${items.length} products`;
    }
  }

  function clearAll() {
    if (nameInput) nameInput.value = "";
    if (minSelect) minSelect.value = "";
    if (maxSelect) maxSelect.value = "";
    if (sortSelect) sortSelect.value = "featured";
    apply();
  }

  ["input", "change"].forEach((evt) => {
    if (nameInput) nameInput.addEventListener(evt, apply);
    if (minSelect) minSelect.addEventListener(evt, apply);
    if (maxSelect) maxSelect.addEventListener(evt, apply);
    if (sortSelect) sortSelect.addEventListener(evt, apply);
  });

  if (clearBtn) clearBtn.addEventListener("click", clearAll);

  apply();
})();

// Page intro + lazy grid reveal (list-collections + collection templates + story pages)
(function () {
  const pages = document.querySelectorAll("[data-page-intro]");
  if (!pages.length) return;

  if (typeof window.gsap === "undefined") {
    pages.forEach((page) => page.setAttribute("data-intro-ready", ""));
    return;
  }

  const gsap = window.gsap;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initPageIntro(page) {
    const title = page.querySelector("[data-page-intro-title]");
    const subtitles = Array.from(page.querySelectorAll("[data-page-intro-subtitle]"));
    const panel = page.querySelector("[data-page-intro-panel]");
    const media = page.querySelector("[data-page-intro-media]");
    const overlay = page.querySelector("[data-page-intro-overlay]");
    const items = Array.from(page.querySelectorAll("[data-page-intro-item]"));
    const fast = page.classList.contains("collection-page");
    const subtitle = subtitles[0] || null;
    const extraSubtitles = subtitles.slice(1);

    const animated = [title, ...subtitles, panel, media, overlay, ...items].filter(Boolean);

    if (reduceMotion) {
      page.setAttribute("data-intro-ready", "");
      gsap.set(animated, { opacity: 1, y: 0, scale: 1, clearProps: "transform" });
      return;
    }

    const textOffsetY = fast ? 22 : 36;
    const itemOffsetY = fast ? 36 : 56;

    if (media) gsap.set(media, { scale: 1.08, opacity: 0 });
    if (overlay) gsap.set(overlay, { opacity: 0 });
    gsap.set([title, ...subtitles, panel].filter(Boolean), { opacity: 0, y: textOffsetY });
    gsap.set(items, { opacity: 0, y: itemOffsetY });
    page.setAttribute("data-intro-ready", "");

    items.forEach((el, index) => {
      el.dataset.pageIntroIndex = String(index);
    });

    const introTl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: fast ? 0.06 : 0.15,
    });

    if (media) {
      introTl.to(media, { scale: 1, opacity: 1, duration: fast ? 0.65 : 1.2 });
    }
    if (overlay) {
      introTl.to(overlay, { opacity: 1, duration: fast ? 0.45 : 0.8 }, media ? (fast ? "-=0.55" : "-=0.9") : 0);
    }
    if (title) {
      introTl.to(
        title,
        { opacity: 1, y: 0, duration: fast ? 0.55 : 1.1 },
        overlay || media ? (fast ? "-=0.35" : "-=0.5") : 0
      );
    }
    if (subtitle) {
      introTl.to(subtitle, { opacity: 1, y: 0, duration: fast ? 0.45 : 0.85 }, fast ? "-=0.4" : "-=0.65");
    }
    if (extraSubtitles.length) {
      introTl.to(
        extraSubtitles,
        { opacity: 1, y: 0, duration: fast ? 0.45 : 0.85, stagger: fast ? 0.05 : 0.08 },
        fast ? "-=0.35" : "-=0.55"
      );
    }
    if (panel) {
      introTl.to(panel, { opacity: 1, y: 0, duration: fast ? 0.45 : 0.85 }, fast ? "-=0.35" : "-=0.55");
    }

    const itemDuration = fast ? 0.55 : 0.95;
    const itemStagger = fast ? 0.04 : 0.08;

    function revealItem(el, delay) {
      if (el.dataset.pageIntroRevealed === "1") return;
      el.dataset.pageIntroRevealed = "1";
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: itemDuration,
        delay: delay || 0,
        ease: "power3.out",
        clearProps: "transform",
        onComplete: () => {
          el.style.willChange = "auto";
        },
      });
    }

    if (!items.length) return;

    if (typeof IntersectionObserver === "undefined") {
      introTl.add(() => {
        items.forEach((el, i) => revealItem(el, i * itemStagger));
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target)
          .sort(
            (a, b) => Number(a.dataset.pageIntroIndex || "0") - Number(b.dataset.pageIntroIndex || "0")
          );

        visible.forEach((el, i) => {
          observer.unobserve(el);
          revealItem(el, i * itemStagger);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.12 }
    );

    introTl.add(() => {
      items.forEach((el) => observer.observe(el));
    });
  }

  pages.forEach(initPageIntro);
})();

// Product page: Swiper gallery + thumbs; tab panel toggles; colour swatches
(function initProductPage() {
  const root = document.querySelector(".product-page");
  if (!root) return;

  const SwiperCtor = typeof window !== "undefined" ? window.Swiper : undefined;
  if (SwiperCtor) {
    const thumbsEl = root.querySelector(".product-page__swiper-thumbs");
    const mainEl = root.querySelector(".product-page__swiper-main");
    const nextEl = root.querySelector(".product-page__swiper-next");
    const prevEl = root.querySelector(".product-page__swiper-prev");

    if (thumbsEl && mainEl) {
      const thumbSwiper = new SwiperCtor(thumbsEl, {
        spaceBetween: 12,
        slidesPerView: "auto",
        freeMode: true,
        watchSlidesProgress: true,
      });

      const mainSwiper = new SwiperCtor(mainEl, {
        slidesPerView: 1,
        spaceBetween: 0,
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
        speed: 500,
        navigation:
          nextEl && prevEl
            ? {
                nextEl,
                prevEl,
              }
            : undefined,
        thumbs: {
          swiper: thumbSwiper,
        },
      });

      /** Scroll the active thumb to the start of the thumbs track (visual index 0). */
      const moveActiveThumbToStart = () => {
        const index = mainSwiper.activeIndex;
        if (!Number.isFinite(index) || index < 0) return;
        thumbSwiper.slideTo(index);
      };

      thumbSwiper.on("click", () => {
        const index = thumbSwiper.clickedIndex;
        if (!Number.isFinite(index) || index < 0) return;
        thumbSwiper.slideTo(index);
      });

      const getGalleryVideoBySlideIndex = (slideIndex1Based) => {
        const index = parseInt(slideIndex1Based, 10);
        if (!Number.isFinite(index) || index < 1) return null;
        const slide = mainSwiper.slides[index - 1];
        return slide ? slide.querySelector("video") : null;
      };

      const syncWizardVideoButtons = () => {
        document.querySelectorAll("[data-video-toggle]").forEach((btn) => {
          const slideIndex = parseInt(btn.getAttribute("data-video-slide-index"), 10);
          const video = getGalleryVideoBySlideIndex(slideIndex);
          const isActiveSlide =
            Number.isFinite(slideIndex) && mainSwiper.activeIndex === slideIndex - 1;
          const playing = Boolean(
            video && isActiveSlide && !video.paused && !video.ended
          );
          const iconPlay = btn.querySelector(".video-icon-play");
          const iconPause = btn.querySelector(".video-icon-pause");
          if (iconPlay) iconPlay.style.display = playing ? "none" : "";
          if (iconPause) iconPause.style.display = playing ? "" : "none";
          btn.setAttribute("aria-label", playing ? "Pause product video" : "Play product video");
          btn.setAttribute("aria-pressed", playing ? "true" : "false");
        });
      };

      const syncProductGalleryVideo = () => {
        const slides = mainEl.querySelectorAll(".swiper-slide");
        slides.forEach((slide, i) => {
          const video = slide.querySelector("video");
          if (!video) return;
          if (i === mainSwiper.activeIndex) {
            video.muted = false;
            video.play().catch(() => {});
          } else {
            // Pause only — keep currentTime so playback resumes from this point
            video.pause();
          }
        });
        syncWizardVideoButtons();
      };

      /** Match step-1 voice toggle: play on video slide, pause on any other slide. */
      const syncStep1VoiceWithGalleryVideoSlide = () => {
        const slide = mainSwiper.slides[mainSwiper.activeIndex];
        const voice = root.querySelector("#wizard-step1-wedding-voice");
        if (!voice) return;
        const onVideoSlide = Boolean(slide && slide.querySelector("video"));
        if (onVideoSlide) {
          if (voice.paused) voice.play().catch(() => {});
        } else if (!voice.paused) {
          voice.pause();
        }
      };

      const onMainGallerySlideChange = () => {
        syncProductGalleryVideo();
        syncStep1VoiceWithGalleryVideoSlide();
        moveActiveThumbToStart();
      };

      mainEl.querySelectorAll("video").forEach((video) => {
        ["play", "pause", "ended"].forEach((evt) => {
          video.addEventListener(evt, syncWizardVideoButtons);
        });
      });

      mainSwiper.on("slideChange", onMainGallerySlideChange);
      onMainGallerySlideChange();

      window.goToProductGallerySlide = (slideIndex) => {
        const index = parseInt(slideIndex, 10);
        if (!Number.isFinite(index) || index < 1) return;
        const swiperIndex = index - 1;
        if (swiperIndex >= mainSwiper.slides.length) return;
        mainSwiper.slideTo(swiperIndex);
        const gallery =
          root.querySelector("#product-page-intro-gallery") ||
          root.querySelector(".product-page__gallery");
        if (gallery) {
          gallery.scrollIntoView({ behavior: "auto", block: "nearest" });
        }
      };

      window.toggleProductGalleryVideo = (slideIndex) => {
        const index = parseInt(slideIndex, 10);
        if (!Number.isFinite(index) || index < 1) return;
        const swiperIndex = index - 1;
        if (swiperIndex >= mainSwiper.slides.length) return;

        const video = getGalleryVideoBySlideIndex(index);
        const gallery =
          root.querySelector("#product-page-intro-gallery") ||
          root.querySelector(".product-page__gallery");

        if (mainSwiper.activeIndex === swiperIndex && video) {
          if (video.paused || video.ended) {
            if (video.ended) video.currentTime = 0;
            video.muted = false;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
          if (gallery) {
            gallery.scrollIntoView({ behavior: "auto", block: "nearest" });
          }
          return;
        }

        window.goToProductGallerySlide(index);
      };

      const mainWrap = root.querySelector(".product-page__swiper-main-wrap");
      const fullscreenBtn = root.querySelector(".product-page__fullscreen-btn");
      const zoomControls = root.querySelector("[data-gallery-zoom-controls]");
      const zoomInBtn = root.querySelector("[data-gallery-zoom-in]");
      const zoomOutBtn = root.querySelector("[data-gallery-zoom-out]");
      const zoomResetBtn = root.querySelector("[data-gallery-zoom-reset]");

      if (mainWrap && fullscreenBtn) {
        const fullscreenElement = () =>
          document.fullscreenElement || document.webkitFullscreenElement;
        const isWrapFullscreen = () => fullscreenElement() === mainWrap;

        let galleryZoom = 1;
        let panX = 0;
        let panY = 0;
        let isPanning = false;
        let panStartX = 0;
        let panStartY = 0;
        let panOriginX = 0;
        let panOriginY = 0;
        const ZOOM_MIN = 1;
        const ZOOM_MAX = 3;
        const ZOOM_STEP = 0.25;

        const getActiveSlideImage = () => {
          const slide = mainEl.querySelector(".swiper-slide-active");
          return slide ? slide.querySelector(".product-page__main-img") : null;
        };

        const getActiveSlide = () => mainEl.querySelector(".swiper-slide-active .product-page__main-slide");

        const clearAllZoomTransforms = () => {
          mainEl.querySelectorAll(".product-page__main-img").forEach((img) => {
            img.style.transform = "";
            img.style.cursor = "";
            img.style.willChange = "";
          });
          mainEl.querySelectorAll(".product-page__main-slide").forEach((slide) => {
            slide.classList.remove("is-panning");
          });
        };

        const clampPan = (x, y, zoom) => {
          const slide = getActiveSlide();
          const img = getActiveSlideImage();
          if (!slide || !img || zoom <= 1) return { x: 0, y: 0 };

          // offsetWidth/Height ignore CSS transforms — reliable while panning
          const baseWidth = img.offsetWidth;
          const baseHeight = img.offsetHeight;
          const slideWidth = slide.clientWidth;
          const slideHeight = slide.clientHeight;
          const maxX = Math.max(0, (baseWidth * zoom - slideWidth) / 2);
          const maxY = Math.max(0, (baseHeight * zoom - slideHeight) / 2);

          return {
            x: Math.min(maxX, Math.max(-maxX, x)),
            y: Math.min(maxY, Math.max(-maxY, y)),
          };
        };

        const updateZoomLabel = () => {
          if (zoomResetBtn) {
            zoomResetBtn.textContent = `${galleryZoom.toFixed(galleryZoom % 1 ? 1 : 0)}×`;
          }
          if (zoomOutBtn) zoomOutBtn.disabled = galleryZoom <= ZOOM_MIN;
          if (zoomInBtn) zoomInBtn.disabled = galleryZoom >= ZOOM_MAX;
        };

        const syncSwiperTouch = () => {
          const allowSwipe = galleryZoom <= 1 && !isPanning;
          if (typeof mainSwiper.allowTouchMove !== "undefined") {
            mainSwiper.allowTouchMove = allowSwipe;
          }
        };

        const applyGalleryZoom = () => {
          clearAllZoomTransforms();
          const img = getActiveSlideImage();
          if (img && galleryZoom > 1) {
            const clamped = clampPan(panX, panY, galleryZoom);
            panX = clamped.x;
            panY = clamped.y;
            img.style.transform = `translate(${panX}px, ${panY}px) scale(${galleryZoom})`;
            img.style.transformOrigin = "center center";
            img.style.cursor = isPanning ? "grabbing" : "grab";
            img.style.willChange = "transform";
          } else {
            panX = 0;
            panY = 0;
          }
          syncSwiperTouch();
          updateZoomLabel();
        };

        const setGalleryZoom = (next) => {
          const prev = galleryZoom;
          galleryZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
          if (galleryZoom <= 1) {
            panX = 0;
            panY = 0;
          } else if (prev !== galleryZoom) {
            // Scale pan with zoom so the focal area stays roughly in view
            const ratio = galleryZoom / prev;
            panX *= ratio;
            panY *= ratio;
          }
          applyGalleryZoom();
        };

        const resetGalleryZoom = () => {
          galleryZoom = 1;
          panX = 0;
          panY = 0;
          isPanning = false;
          applyGalleryZoom();
        };

        const updateFullscreenUi = () => {
          const on = isWrapFullscreen();
          fullscreenBtn.classList.toggle("is-fullscreen", on);
          fullscreenBtn.setAttribute("aria-pressed", on ? "true" : "false");
          fullscreenBtn.setAttribute("aria-label", on ? "Exit fullscreen" : "Enter fullscreen");
          if (zoomControls) {
            zoomControls.hidden = !on;
          }
          if (!on) resetGalleryZoom();
          mainSwiper.update();
          requestAnimationFrame(() => mainSwiper.update());
        };

        fullscreenBtn.addEventListener("click", () => {
          if (!isWrapFullscreen()) {
            const req = mainWrap.requestFullscreen || mainWrap.webkitRequestFullscreen;
            if (req) {
              Promise.resolve(req.call(mainWrap)).catch(() => {});
            }
          } else {
            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (exit) {
              Promise.resolve(exit.call(document)).catch(() => {});
            }
          }
        });

        if (zoomInBtn) {
          zoomInBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isWrapFullscreen()) return;
            setGalleryZoom(galleryZoom + ZOOM_STEP);
          });
        }
        if (zoomOutBtn) {
          zoomOutBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isWrapFullscreen()) return;
            setGalleryZoom(galleryZoom - ZOOM_STEP);
          });
        }
        if (zoomResetBtn) {
          zoomResetBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isWrapFullscreen()) return;
            resetGalleryZoom();
          });
        }

        mainWrap.addEventListener(
          "wheel",
          (e) => {
            if (!isWrapFullscreen() || !getActiveSlideImage()) return;
            e.preventDefault();
            setGalleryZoom(galleryZoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
          },
          { passive: false }
        );

        mainEl.addEventListener("dblclick", () => {
          if (!isWrapFullscreen() || !getActiveSlideImage()) return;
          if (galleryZoom > 1) resetGalleryZoom();
          else setGalleryZoom(2);
        });

        const endPan = () => {
          if (!isPanning) return;
          isPanning = false;
          const img = getActiveSlideImage();
          if (img && galleryZoom > 1) img.style.cursor = "grab";
          const slide = getActiveSlide();
          if (slide) slide.classList.remove("is-panning");
          syncSwiperTouch();
        };

        mainWrap.addEventListener("pointerdown", (e) => {
          if (!isWrapFullscreen() || galleryZoom <= 1) return;
          if (e.button !== 0) return;
          if (e.target.closest(".product-page__swiper-nav, .product-page__zoom-controls, .product-page__fullscreen-btn")) {
            return;
          }
          const img = getActiveSlideImage();
          if (!img || !e.target.closest(".product-page__main-slide")) return;

          isPanning = true;
          panStartX = e.clientX;
          panStartY = e.clientY;
          panOriginX = panX;
          panOriginY = panY;
          img.style.cursor = "grabbing";
          const slide = getActiveSlide();
          if (slide) slide.classList.add("is-panning");
          syncSwiperTouch();
          mainWrap.setPointerCapture?.(e.pointerId);
          e.preventDefault();
        });

        mainWrap.addEventListener("pointermove", (e) => {
          if (!isPanning || galleryZoom <= 1) return;
          const nextX = panOriginX + (e.clientX - panStartX);
          const nextY = panOriginY + (e.clientY - panStartY);
          const clamped = clampPan(nextX, nextY, galleryZoom);
          panX = clamped.x;
          panY = clamped.y;
          const img = getActiveSlideImage();
          if (img) {
            img.style.transform = `translate(${panX}px, ${panY}px) scale(${galleryZoom})`;
            img.style.cursor = "grabbing";
          }
          e.preventDefault();
        });

        mainWrap.addEventListener("pointerup", endPan);
        mainWrap.addEventListener("pointercancel", endPan);
        mainWrap.addEventListener("pointerleave", (e) => {
          if (isPanning && e.pointerType !== "mouse") endPan();
        });

        const prevSlideChange = onMainGallerySlideChange;
        mainSwiper.off("slideChange", onMainGallerySlideChange);
        mainSwiper.on("slideChange", () => {
          resetGalleryZoom();
          prevSlideChange();
        });

        document.addEventListener("fullscreenchange", updateFullscreenUi);
        document.addEventListener("webkitfullscreenchange", updateFullscreenUi);
        updateZoomLabel();
      }
    }
  }

  const tabsRoot = root.querySelector("[data-product-tabs]") || root.querySelector(".product-page__tabs");
  const tablist = tabsRoot ? tabsRoot.querySelector(".product-page__tablist") : root.querySelector(".product-page__tablist");
  if (tablist && tabsRoot) {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const items = Array.from(tabsRoot.querySelectorAll("[data-tab-item]"));
    const panels = items
      .map((item) => item.querySelector(".product-page__tab-panel"))
      .filter(Boolean);
    const accordionTriggers = Array.from(tabsRoot.querySelectorAll(".product-page__accordion-trigger"));
    const TAB_SCROLL_OFFSET = 100;
    const mobileMq = window.matchMedia("(max-width: 1023px)");

    function isMobileTabs() {
      return mobileMq.matches;
    }

    function scrollActiveTabIntoTablist(tab) {
      if (!tab || tablist.scrollWidth <= tablist.clientWidth) return;
      const listRect = tablist.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      const pad = 12;
      if (tabRect.left < listRect.left + pad) {
        tablist.scrollLeft += tabRect.left - listRect.left - pad;
      } else if (tabRect.right > listRect.right - pad) {
        tablist.scrollLeft += tabRect.right - listRect.right + pad;
      }
    }

    function pinTabsToTop() {
      const top =
        tabsRoot.getBoundingClientRect().top +
        (window.scrollY || 0) -
        TAB_SCROLL_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    }

    function setPanelOpen(panel, open) {
      if (!panel) return;
      panel.classList.toggle("hidden", !open);
      panel.toggleAttribute("hidden", !open);
      const item = panel.closest("[data-tab-item]");
      if (item) item.classList.toggle("is-open", open);
      const trigger = item ? item.querySelector(".product-page__accordion-trigger") : null;
      if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function activateTab(tab, { scrollPin = true } = {}) {
      if (!tab) return;
      const panelId = tab.getAttribute("aria-controls");
      if (!panelId) return;

      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.setAttribute("tabindex", active ? "0" : "-1");
        t.classList.toggle("product-page__tab--active", active);
      });

      panels.forEach((panel) => {
        setPanelOpen(panel, panel.id === panelId);
      });

      if (!isMobileTabs()) {
        scrollActiveTabIntoTablist(tab);
        if (scrollPin) {
          requestAnimationFrame(pinTabsToTop);
        }
      }
    }

    function toggleAccordion(trigger) {
      const panelId = trigger.getAttribute("aria-controls");
      if (!panelId) return;
      const panel = tabsRoot.querySelector("#" + CSS.escape(panelId));
      if (!panel) return;
      const willOpen = trigger.getAttribute("aria-expanded") !== "true";

      panels.forEach((p) => {
        setPanelOpen(p, willOpen && p === panel);
      });

      const matchingTab = tabs.find((t) => t.getAttribute("aria-controls") === panelId);
      if (matchingTab) {
        tabs.forEach((t) => {
          const active = t === matchingTab;
          t.setAttribute("aria-selected", active ? "true" : "false");
          t.setAttribute("tabindex", active ? "0" : "-1");
          t.classList.toggle("product-page__tab--active", active);
        });
      }
    }

    function collapseAllPanels() {
      panels.forEach((panel) => setPanelOpen(panel, false));
    }

    function syncMode() {
      if (isMobileTabs()) {
        collapseAllPanels();
        return;
      }
      const activeTab = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
      if (activeTab) activateTab(activeTab, { scrollPin: false });
    }

    // Mobile default: all accordion panels collapsed.
    if (isMobileTabs()) {
      collapseAllPanels();
    } else {
      const activeTab = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
      if (activeTab) activateTab(activeTab, { scrollPin: false });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (isMobileTabs()) return;
        activateTab(tab);
        if (typeof tab.focus === "function") {
          tab.focus({ preventScroll: true });
        }
      });
    });

    accordionTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        if (!isMobileTabs()) return;
        toggleAccordion(trigger);
      });
    });

    if (typeof mobileMq.addEventListener === "function") {
      mobileMq.addEventListener("change", syncMode);
    } else if (typeof mobileMq.addListener === "function") {
      mobileMq.addListener(syncMode);
    }
  }

  function closeAllColorDropdownMenus() {
    root.querySelectorAll(".product-page__color-dropdown-menu").forEach((menu) => {
      menu.hidden = true;
    });
    root
      .querySelectorAll("[data-text-color-trigger], [data-background-color-trigger]")
      .forEach((trigger) => {
        trigger.setAttribute("aria-expanded", "false");
      });
  }

  function initColorDropdown(dropdown, { inputSel, triggerSel, menuSel, valueSel, swatchSel, optionSel, labelSel }) {
    if (!dropdown) return;
    const hiddenInput = dropdown.querySelector(inputSel);
    const trigger = dropdown.querySelector(triggerSel);
    const menu = dropdown.querySelector(menuSel);
    const valueEl = dropdown.querySelector(valueSel);
    const swatchEl = dropdown.querySelector(swatchSel);
    const labelEl = labelSel ? root.querySelector(labelSel) : null;
    const options = dropdown.querySelectorAll(optionSel);

    function closeMenu() {
      if (!menu || !trigger) return;
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }

    function setSelection(option) {
      if (!option || !hiddenInput || !valueEl || !swatchEl) return;
      const value = option.getAttribute("data-value") || "";
      const name = option.getAttribute("data-color-name") || "";
      const hex = option.getAttribute("data-hex") || "";
      const displayLabel =
        option.getAttribute("data-color-display") ||
        (name && hex ? name + " - " + hex : name || hex);
      hiddenInput.value = value;
      valueEl.textContent = displayLabel;
      valueEl.classList.add("product-page__color-dropdown-value--selected");
      swatchEl.style.backgroundColor = hex;
      options.forEach((opt) => {
        opt.setAttribute("aria-selected", opt === option ? "true" : "false");
      });
      if (name && labelEl) {
        labelEl.textContent = name;
        labelEl.style.display = "inline-block";
      }
      closeMenu();
      hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
      if (inputSel.indexOf("text-color") !== -1) clearTextColorError();
      else if (inputSel.indexOf("background-color") !== -1) clearBackgroundColorError();
    }

    if (trigger && menu) {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = menu.hidden;
        closeAllColorDropdownMenus();
        if (willOpen) {
          menu.hidden = false;
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    }

    options.forEach((option) => {
      option.addEventListener("click", () => setSelection(option));
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  initColorDropdown(root.querySelector("[data-text-color-dropdown]"), {
    inputSel: "[data-text-color-input]",
    triggerSel: "[data-text-color-trigger]",
    menuSel: "[data-text-color-menu]",
    valueSel: "[data-text-color-value]",
    swatchSel: "[data-text-color-swatch]",
    optionSel: "[data-text-color-option]",
    labelSel: "[data-text-color-label]",
  });

  initColorDropdown(root.querySelector("[data-background-color-dropdown]"), {
    inputSel: "[data-background-color-input]",
    triggerSel: "[data-background-color-trigger]",
    menuSel: "[data-background-color-menu]",
    valueSel: "[data-background-color-value]",
    swatchSel: "[data-background-color-swatch]",
    optionSel: "[data-background-color-option]",
    labelSel: "[data-background-color-label]",
  });

  const partyNamesModal = root.querySelector("#product-party-names-info-modal");
  if (partyNamesModal) {
    const pausePartyNamesModalVoice = () => {
      partyNamesModal.querySelectorAll("audio").forEach((audioEl) => {
        audioEl.pause();
        audioEl.currentTime = 0;
      });
    };

    const onPartyNamesModalHidden = () => {
      const hidden =
        partyNamesModal.classList.contains("hidden") ||
        partyNamesModal.getAttribute("aria-hidden") === "true";
      if (hidden) pausePartyNamesModalVoice();
    };

    new MutationObserver(onPartyNamesModalHidden).observe(partyNamesModal, {
      attributes: true,
      attributeFilter: ["class", "aria-hidden"],
    });

    root.querySelectorAll('[data-modal-hide="product-party-names-info-modal"]').forEach((btn) => {
      btn.addEventListener("click", pausePartyNamesModalVoice);
    });

    onPartyNamesModalHidden();
  }

  const FlatpickrCtor = typeof window !== "undefined" ? window.flatpickr : undefined;
  if (FlatpickrCtor) {
    root.querySelectorAll("[data-flatpickr-date]").forEach((el) => {
      if (el._flatpickr) return;
      const fp = FlatpickrCtor(el, {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "j F Y",
        altInputClass: "product-page__input w-full",
        allowInput: true,
        disableMobile: true,
      });
      const wrap = el.closest(".wizard__event-date-wrap");
      const icon = wrap && wrap.querySelector(".wizard__event-date-icon");
      if (icon && fp) {
        icon.style.pointerEvents = "auto";
        icon.style.cursor = "pointer";
        icon.addEventListener("click", () => fp.open());
      }
    });
  }

  function isAllowedColorValue(field, colorValue) {
    if (!colorValue) return false;
    const optionSel =
      field.type === "background_color"
        ? "[data-background-color-option]"
        : "[data-text-color-option]";
    const options = root.querySelectorAll(optionSel);
    if (!options.length) return true;
    const normalized = colorValue.trim().toLowerCase();
    return Array.from(options).some(
      (opt) => (opt.getAttribute("data-value") || "").trim().toLowerCase() === normalized
    );
  }

  const ALPHANUMERIC_VALUE_RE = /^[A-Za-z0-9 ]+$/;
  const NON_INPUT_FIELD_TYPES = new Set(["voice_block"]);
  const FORMAT_VALIDATED_FIELD_TYPES = new Set(["text", "textarea", "repeatable"]);

  const productForm = root.querySelector("#product-form");
  const cartBtn = root.querySelector(".product-page__btn--cart");
  const productWizard = root.querySelector("#product-wizard");

  function initSizeAndOrientationVariantSync() {
    const select = root.querySelector("[data-size-and-orientation]");
    if (!select || !productForm) return;

    const variantsEl = root.querySelector("[data-size-and-orientation-variants]");
    let variants = [];
    if (variantsEl) {
      try {
        variants = JSON.parse(variantsEl.textContent || "[]");
      } catch {
        variants = [];
      }
    }
    if (!variants.length) return;

    const optionPosition = parseInt(select.getAttribute("data-option-position") || "1", 10);
    const optionKey = `option${optionPosition}`;
    const variantIdInput = productForm.querySelector('input[name="id"]');

    const findVariant = (value) => {
      const normalized = String(value || "").trim();
      if (!normalized) return null;
      return (
        variants.find((v) => String(v[optionKey] || "").trim() === normalized && v.available) ||
        variants.find((v) => String(v[optionKey] || "").trim() === normalized) ||
        null
      );
    };

    const syncVariant = () => {
      const variant = findVariant(select.value);
      if (!variant || !variantIdInput) return;
      variantIdInput.value = String(variant.id);
      if (typeof variant.price === "number") {
        variantIdInput.setAttribute("data-variant-price-cents", String(variant.price));
        if (productWizard) {
          productWizard.setAttribute("data-base-variant-price-cents", String(variant.price));
        }
      }
      if (window.ProductFormPricing) {
        window.ProductFormPricing.updateProductPriceDisplay(productForm, productWizard);
      }
      window.dispatchEvent(
        new CustomEvent("product-form:pricing-refresh", {
          bubbles: true,
          detail: { source: "size-and-orientation" },
        })
      );
    };

    select.addEventListener("change", syncVariant);
  }

  initSizeAndOrientationVariantSync();

  function parseProductFormConfig() {
    const configEl = document.getElementById("product-form-config");
    if (!configEl) return null;
    try {
      return JSON.parse(configEl.textContent || "");
    } catch {
      return null;
    }
  }

  function isFormFieldEnabled(field) {
    return field && field.enabled !== false;
  }

  function isFormFieldRequired(field) {
    if (!field) return false;
    if (field.type === "text_color" || field.type === "background_color") return true;
    // Select defaults to required unless explicitly unchecked in the form generator.
    if (field.type === "select") return field.required !== false;
    return field.required === true;
  }

  function isSelectValueChosen(value) {
    const normalized = String(value || "").trim();
    if (!normalized) return false;
    if (normalized.toLowerCase() === "none") return false;
    return true;
  }

  function getFormFieldLabel(field) {
    if (!field) return "Field";
    if (field.type === "text_color") return field.label || field.help_title || "Text Color";
    if (field.type === "background_color") return field.label || "Background Color";
    if (field.type === "size_and_orientation") {
      return field.label || field.placeholder || "Size and Orientation";
    }
    if (field.type === "input_group") return field.label || field.help_title || field.key || "Input group";
    if (field.type === "year_range") {
      return field.placeholder || field.label || "Entry Year - Exit Year";
    }
    if (field.type === "custom_message") {
      return field.label || field.placeholder || "Custom Message";
    }
    if (field.type === "upload") {
      return field.label || field.help_title || field.placeholder || "Upload file";
    }
    return field.placeholder || field.label || field.help_title || field.key || "Field";
  }

  function getInputGroupInputName(inputDef) {
    if (!inputDef) return "";
    const propertyName = inputDef.property_name || inputDef.key || "";
    return propertyName ? `properties[${propertyName}]` : "";
  }

  function inputGroupNeedsValidation(field) {
    if (!field || field.type !== "input_group") return false;
    const minFilled = Number(field.min_filled) || 0;
    const maxFilled = Number(field.max_filled) || 0;
    if (minFilled > 0 || maxFilled > 0) return true;
    const inputs = field.inputs || [];
    return inputs.some(
      (input) =>
        input.required === true ||
        getFieldValidationRules({ validation: input.validation }) !== null
    );
  }

  function getFormFieldPropertyName(field) {
    if (!field) return "";
    if (field.type === "text_color") return "Text color";
    if (field.type === "background_color") return "Background color";
    if (field.type === "size_and_orientation") return field.property_name || "Size and Orientation";
    return field.property_name || field.key || "";
  }

  function getFormFieldInputName(field) {
    const propertyName = getFormFieldPropertyName(field);
    if (!propertyName) return "";
    return `properties[${propertyName}]`;
  }

  function getFieldValidationRules(field) {
    const validation = field?.validation;
    if (!validation || typeof validation !== "object") return null;
    const rules = {};
    if (typeof validation.max_length === "number" && validation.max_length > 0) {
      rules.maxLength = validation.max_length;
    }
    if (validation.alphanumeric_only === true) {
      rules.alphanumericOnly = true;
    }
    return Object.keys(rules).length ? rules : null;
  }

  function fieldSupportsFormatValidation(field) {
    return FORMAT_VALIDATED_FIELD_TYPES.has(field?.type);
  }

  function fieldHasFormatValidation(field) {
    return fieldSupportsFormatValidation(field) && getFieldValidationRules(field) !== null;
  }

  function collectCartValidatedFields(config) {
    const fields = [];
    if (!config || !Array.isArray(config.steps)) return fields;
    config.steps.forEach((step) => {
      const stepNumber = step.number;
      (step.fields || []).forEach((field) => {
        if (!isFormFieldEnabled(field)) return;
        if (NON_INPUT_FIELD_TYPES.has(field.type)) return;
        if (field.type === "input_group") {
          if (inputGroupNeedsValidation(field)) fields.push({ field, stepNumber });
          return;
        }
        if (!isFormFieldRequired(field) && !fieldHasFormatValidation(field)) {
          if (
            field.type === "select" &&
            (field.show_input_on_selection || field.options_source === "countries") &&
            (field.selection_input_type === "property_date" ||
              field.selection_input_required === true ||
              field.options_source === "countries")
          ) {
            fields.push({ field, stepNumber });
          }
          return;
        }
        fields.push({ field, stepNumber });
      });
    });
    return fields;
  }

  function getFormFieldValueStrings(field, elements) {
    if (field.type === "radio") {
      const selected = elements.find((el) => el.checked);
      return [selected ? String(selected.value || "").trim() : ""];
    }
    if (field.type === "custom_message") {
      const select = elements.find((el) => el.matches && el.matches("select"));
      const selectedRadio = elements.find((el) => el.type === "radio" && el.checked && !el.disabled);
      if (select) {
        return [
          String(select.value || "").trim(),
          selectedRadio ? String(selectedRadio.value || "").trim() : "",
        ];
      }
      if (selectedRadio) return [String(selectedRadio.value || "").trim()];
      return [""];
    }
    return elements.map((el) => String(el.value || "").trim());
  }

  function getInputGroupValidationFailure(field, elements) {
    const groupLabel = getFormFieldLabel(field);
    const inputs = field.inputs || [];
    const minFilled = Math.max(0, Number(field.min_filled) || 0);
    const maxFilledRaw = Number(field.max_filled);
    const maxFilled = Number.isFinite(maxFilledRaw) && maxFilledRaw > 0 ? maxFilledRaw : 0;
    let filledCount = 0;
    const invalidElements = [];

    for (const inputDef of inputs) {
      const name = getInputGroupInputName(inputDef);
      const el = elements.find((node) => node.getAttribute("name") === name);
      const value = el ? String(el.value || "").trim() : "";
      const inputLabel = inputDef.placeholder || inputDef.key || "Field";
      const rules = getFieldValidationRules({ validation: inputDef.validation });
      const inputRequired = inputDef.required === true;

      if (inputRequired && !value) {
        if (el) invalidElements.push(el);
        return {
          message: `${inputLabel} is required`,
          kind: "required",
          elements: invalidElements.length ? invalidElements : elements,
        };
      }

      if (!value) continue;

      if (rules?.maxLength && value.length > rules.maxLength) {
        if (el) invalidElements.push(el);
        return {
          message: `${inputLabel} (max ${rules.maxLength} characters)`,
          kind: "format",
          elements: invalidElements.length ? invalidElements : elements,
        };
      }
      if (rules?.alphanumericOnly && !ALPHANUMERIC_VALUE_RE.test(value)) {
        if (el) invalidElements.push(el);
        return {
          message: `${inputLabel} (letters, numbers and spaces only, no special characters)`,
          kind: "format",
          elements: invalidElements.length ? invalidElements : elements,
        };
      }

      filledCount += 1;
    }

    if (filledCount < minFilled) {
      return {
        message: `${groupLabel} (at least ${minFilled} required)`,
        kind: "required",
        elements,
      };
    }

    if (maxFilled > 0 && filledCount > maxFilled) {
      return {
        message: `${groupLabel} (no more than ${maxFilled} allowed)`,
        kind: "format",
        elements,
      };
    }

    return null;
  }

  function getPropertyDateValidationFailure(field, selectEl) {
    if (
      !field ||
      field.type !== "select" ||
      field.selection_input_type !== "property_date" ||
      !field.show_input_on_selection
    ) {
      return null;
    }

    const label = getFormFieldLabel(field);
    const selectedValue = String(selectEl?.value || "").trim();
    if (!selectedValue) return null;

    const wrap = selectEl.closest(".wizard__select-with-input");
    const dependentWrap = wrap?.querySelector('[data-select-dependent-type="property_date"]');
    if (!dependentWrap || dependentWrap.hidden) return null;

    const visiblePanel = dependentWrap.querySelector("[data-selection-mode]:not([hidden])");
    if (!visiblePanel) {
      return { message: label, kind: "required", elements: [selectEl] };
    }

    const invalidElements = [];
    const mode = visiblePanel.getAttribute("data-selection-mode");

    if (mode === "year_range") {
      const startEl = visiblePanel.querySelector("[data-property-date-year-start]");
      const endEl = visiblePanel.querySelector("[data-property-date-year-end]");
      const startValue = String(startEl?.value || "").trim();
      const endValue = String(endEl?.value || "").trim();
      const detailRequired = field.selection_input_required === true;

      if (detailRequired && (!startValue || !endValue)) {
        if (!startValue && startEl) invalidElements.push(startEl);
        if (!endValue && endEl) invalidElements.push(endEl);
        return {
          message: `${label} (entry and exit years required)`,
          kind: "required",
          elements: invalidElements.length ? invalidElements : [selectEl],
        };
      }

      if (startValue && endValue && Number(endValue) < Number(startValue)) {
        if (endEl) invalidElements.push(endEl);
        return {
          message: `${label} (exit year must be on or after entry year)`,
          kind: "format",
          elements: invalidElements.length ? invalidElements : [selectEl],
        };
      }
      return null;
    }

    if (mode === "year" || mode === "circa_year") {
      const yearEl = visiblePanel.querySelector("[data-property-date-year]");
      const yearValue = String(yearEl?.value || "").trim();
      if (field.selection_input_required === true && !yearValue) {
        return {
          message: `${label} (year required)`,
          kind: "required",
          elements: yearEl ? [yearEl] : [selectEl],
        };
      }
      return null;
    }

    if (mode === "no_record") {
      return null;
    }

    if (mode === "date") {
      const dateEl = visiblePanel.querySelector("[data-property-date-specific]");
      const dateValue = String(dateEl?.value || "").trim();
      if (field.selection_input_required === true && !dateValue) {
        return {
          message: `${label} (date required)`,
          kind: "required",
          elements: dateEl ? [dateEl] : [selectEl],
        };
      }
      return null;
    }

    return null;
  }

  function getFormFieldValidationFailure(field, elements) {
    const label = getFormFieldLabel(field);
    const values = getFormFieldValueStrings(field, elements);
    const hasValue = values.some((value) => value !== "");
    const required = isFormFieldRequired(field);

    if (field.type === "input_group") {
      return getInputGroupValidationFailure(field, elements);
    }

    if (field.type === "upload") {
      if (required && !hasValue) {
        return {
          message: `${label} (upload required)`,
          kind: "required",
          elements,
        };
      }
      return null;
    }

    if (field.type === "year_range") {
      const entryEl = elements.find((el) => el.hasAttribute("data-year-range-entry")) || elements[0];
      const exitEl = elements.find((el) => el.hasAttribute("data-year-range-exit")) || elements[1];
      const entryValue = String(entryEl?.value || "").trim();
      const exitValue = String(exitEl?.value || "").trim();
      const invalidElements = [];

      if (required && (!entryValue || !exitValue)) {
        if (!entryValue && entryEl) invalidElements.push(entryEl);
        if (!exitValue && exitEl) invalidElements.push(exitEl);
        return {
          message: `${label} (entry and exit years required)`,
          kind: "required",
          elements: invalidElements.length ? invalidElements : elements,
        };
      }

      if (!entryValue && !exitValue) return null;

      if ((entryValue && !exitValue) || (!entryValue && exitValue)) {
        if (!entryValue && entryEl) invalidElements.push(entryEl);
        if (!exitValue && exitEl) invalidElements.push(exitEl);
        return {
          message: `${label} (entry and exit years required)`,
          kind: "required",
          elements: invalidElements.length ? invalidElements : elements,
        };
      }

      if (entryValue && exitValue && Number(exitValue) < Number(entryValue)) {
        if (exitEl) invalidElements.push(exitEl);
        return {
          message: `${label} (exit year must be on or after entry year)`,
          kind: "format",
          elements: invalidElements.length ? invalidElements : elements,
        };
      }

      return null;
    }

    if (field.type === "select" && field.show_input_on_selection && field.selection_input_type === "property_date") {
      const selectEl = elements[0];
      if (required && !isSelectValueChosen(selectEl?.value)) {
        return { message: label, kind: "required", elements: selectEl ? [selectEl] : elements };
      }
      const propertyDateFailure = getPropertyDateValidationFailure(field, selectEl);
      if (propertyDateFailure) return propertyDateFailure;
      if (!hasValue) return null;
      return null;
    }

    if (
      field.type === "select" &&
      (field.show_input_on_selection || field.options_source === "countries") &&
      field.selection_input_type !== "property_date"
    ) {
      const selectEl = elements[0];
      if (required && !isSelectValueChosen(selectEl?.value)) {
        return { message: label, kind: "required", elements: selectEl ? [selectEl] : elements };
      }
      const wrap = selectEl?.closest(".wizard__select-with-input");
      const dependentWrap = wrap?.querySelector("[data-select-dependent-input]");
      const dependentInput = dependentWrap?.querySelector("input, textarea");
      const detailRequired =
        field.selection_input_required === true ||
        (field.options_source === "countries" && field.selection_input_required !== false);
      if (dependentWrap && !dependentWrap.hidden && dependentInput && detailRequired) {
        const detailValue = String(dependentInput.value || "").trim();
        if (!detailValue) {
          return {
            message: `${label} (country required)`,
            kind: "required",
            elements: [dependentInput],
          };
        }
      }
      return null;
    }

    if (field.type === "select") {
      const selectEl = elements[0];
      if (required && !isSelectValueChosen(selectEl?.value)) {
        return { message: label, kind: "required", elements: selectEl ? [selectEl] : elements };
      }
      return null;
    }

    if (field.type === "custom_message") {
      const select = elements.find((el) => el.tagName === "SELECT");
      const radios = elements.filter((el) => el.type === "radio");
      const selectedRadio = radios.find((el) => el.checked && !el.disabled && String(el.value || "").trim());

      if (select) {
        const selectValue = String(select.value || "").trim();
        if (required && !selectValue) {
          return { message: `${label} (select an option)`, kind: "required", elements: [select] };
        }
        if (!selectValue) return null;
      }

      if (selectedRadio) return null;

      if (required) {
        return {
          message: `${label} (choose a message)`,
          kind: "required",
          elements: radios.filter((el) => !el.disabled),
        };
      }
      return null;
    }

    if (field.type === "radio") {
      if (required && !elements.some((el) => el.checked && String(el.value || "").trim())) {
        return { message: label, kind: "required" };
      }
      return null;
    }

    if (field.type === "text_color" || field.type === "background_color") {
      const colorValue = String(elements[0]?.value || "")
        .trim()
        .toLowerCase();
      if (!colorValue || !isAllowedColorValue(field, colorValue)) {
        return { message: label, kind: "required" };
      }
      return null;
    }

    if (required && (!elements.length || !hasValue)) {
      return { message: label, kind: "required" };
    }

    if (!hasValue) return null;

    const rules = getFieldValidationRules(field);
    const valuesToCheck =
      field.type === "repeatable"
        ? values.filter((value, index) => value !== "" || (required && index === 0))
        : values.filter((value) => value !== "");

    for (const value of valuesToCheck) {
      if (!value) continue;
      if (rules?.maxLength && value.length > rules.maxLength) {
        return {
          message: `${label} (max ${rules.maxLength} characters)`,
          kind: "format",
        };
      }
      if (rules?.alphanumericOnly && !ALPHANUMERIC_VALUE_RE.test(value)) {
        return {
          message: `${label} (letters, numbers and spaces only, no special characters)`,
          kind: "format",
        };
      }
    }

    return null;
  }

  function getFormFieldElements(field) {
    if (!field) return [];

    if (field.type === "text_color") {
      const el = root.querySelector("[data-text-color-input]");
      return el ? [el] : [];
    }

    if (field.type === "background_color") {
      const el = root.querySelector("[data-background-color-input]");
      return el ? [el] : [];
    }

    const inputName = getFormFieldInputName(field);
    if (!inputName) return [];

    if (field.type === "custom_message") {
      const wrap = field.key
        ? root.querySelector(`[data-custom-message="${field.key}"]`)
        : root.querySelector("[data-custom-message]");
      if (!wrap) return [];

      const select = wrap.querySelector("[data-custom-message-selector]");
      const radios = Array.from(wrap.querySelectorAll("[data-custom-message-radio]"));
      const elements = [];
      if (select) elements.push(select);
      elements.push(...radios);
      return elements;
    }

    if (field.type === "radio") {
      return Array.from(root.querySelectorAll(`input[type="radio"][name="${inputName}"]`));
    }

    if (field.type === "repeatable") {
      const list = field.key ? root.querySelector(`[data-repeatable-list="${field.key}"]`) : null;
      if (!list) return [];
      return Array.from(list.querySelectorAll(`[name="${inputName}"]`));
    }

    if (field.type === "input_group") {
      const group = field.key ? root.querySelector(`[data-input-group="${field.key}"]`) : null;
      if (!group) return [];
      return Array.from(group.querySelectorAll("input, textarea, select"));
    }

    if (field.type === "year_range") {
      const wrap = field.key ? root.querySelector(`[data-year-range="${field.key}"]`) : null;
      if (!wrap) return [];
      const entryEl = wrap.querySelector("[data-year-range-entry]");
      const exitEl = wrap.querySelector("[data-year-range-exit]");
      return [entryEl, exitEl].filter(Boolean);
    }

    const el = root.querySelector(`[name="${inputName}"]`);
    return el ? [el] : [];
  }

  function setFormFieldError(field, elements) {
    if (!elements.length) return null;

    if (field.type === "text_color") {
      setTextColorError();
      return (
        root.querySelector("[data-text-color-trigger]") ||
        root.querySelector("#text-color-trigger") ||
        elements[0]
      );
    }

    if (field.type === "background_color") {
      setBackgroundColorError();
      return (
        root.querySelector("[data-background-color-trigger]") ||
        root.querySelector("#background-color-trigger") ||
        elements[0]
      );
    }

    if (field.type === "radio" || field.type === "custom_message") {
      const group =
        elements[0]?.closest?.('[role="radiogroup"]') ||
        elements.find((el) => el.closest?.('[role="radiogroup"]'))?.closest?.('[role="radiogroup"]');
      if (group) group.classList.add("product-page__radiogroup--error");
      const select = elements.find((el) => el.tagName === "SELECT");
      if (select) {
        select.classList.add("product-page__input--error");
        select.setAttribute("aria-invalid", "true");
        const selectBox = select.closest?.(".wizard__select-field-box");
        if (selectBox) selectBox.classList.add("is-error");
      }
      elements
        .filter((el) => el.type === "radio" && !el.disabled)
        .forEach((el) => {
          el.classList.add("product-page__input--error");
          el.setAttribute("aria-invalid", "true");
        });
      return select || elements.find((el) => el.type === "radio" && !el.disabled) || elements[0];
    }

    if (field.type === "upload") {
      const wrap = elements[0]?.closest?.("[data-product-upload]");
      if (wrap) wrap.classList.add("is-error");
      elements.forEach((el) => {
        el.setAttribute("aria-invalid", "true");
      });
      return wrap?.querySelector("[data-upload-select]") || elements[0];
    }

    elements.forEach((el) => {
      el.classList.add("product-page__input--error");
      el.setAttribute("aria-invalid", "true");
      const altInput = el._flatpickr?.altInput;
      if (altInput) {
        altInput.classList.add("product-page__input--error");
        altInput.setAttribute("aria-invalid", "true");
      }
      if (el.tagName === "SELECT") {
        const selectBox = el.closest?.(".wizard__select-field-box");
        if (selectBox) selectBox.classList.add("is-error");
      }
    });
    const first = elements[0];
    return first?._flatpickr?.altInput || first;
  }

  function clearFormFieldError(field, elements) {
    if (field.type === "text_color") {
      clearTextColorError();
      return;
    }
    if (field.type === "background_color") {
      clearBackgroundColorError();
      return;
    }
    if (field.type === "radio" || field.type === "custom_message") {
      elements.forEach((el) => {
        const group = el.closest?.('[role="radiogroup"]');
        if (group) group.classList.remove("product-page__radiogroup--error");
        if (el.tagName === "SELECT" || el.type === "radio") {
          el.classList.remove("product-page__input--error");
          el.removeAttribute("aria-invalid");
        }
        if (el.tagName === "SELECT") {
          el.closest?.(".wizard__select-field-box")?.classList.remove("is-error");
        }
      });
      return;
    }
    if (field.type === "upload") {
      elements.forEach((el) => {
        const wrap = el.closest?.("[data-product-upload]");
        if (wrap) wrap.classList.remove("is-error");
        el.removeAttribute("aria-invalid");
      });
      return;
    }
    elements.forEach((el) => {
      el.classList.remove("product-page__input--error");
      el.removeAttribute("aria-invalid");
      const altInput = el._flatpickr?.altInput;
      if (altInput) {
        altInput.classList.remove("product-page__input--error");
        altInput.removeAttribute("aria-invalid");
      }
      if (el.tagName === "SELECT") {
        el.closest?.(".wizard__select-field-box")?.classList.remove("is-error");
      }
    });
  }

  function clearTextColorError() {
    const wrap = root.querySelector(".product-page__colors");
    if (wrap) wrap.classList.remove("product-page__colors--error");
    root.querySelectorAll('[data-text-color-input]').forEach((input) => {
      input.removeAttribute("aria-invalid");
    });
    const textTrigger = root.querySelector("[data-text-color-trigger]");
    if (textTrigger) textTrigger.removeAttribute("aria-invalid");
  }

  function clearBackgroundColorError() {
    const wrap = root.querySelector(".product-page__colors");
    if (wrap) wrap.classList.remove("product-page__colors--error-background");
    root.querySelectorAll('[data-background-color-input]').forEach((input) => {
      input.removeAttribute("aria-invalid");
    });
    const bgTrigger = root.querySelector("[data-background-color-trigger]");
    if (bgTrigger) bgTrigger.removeAttribute("aria-invalid");
  }

  function setTextColorError() {
    const wrap = root.querySelector(".product-page__colors");
    if (wrap) wrap.classList.add("product-page__colors--error");
    const trigger = root.querySelector("[data-text-color-trigger]");
    if (trigger) trigger.setAttribute("aria-invalid", "true");
    const hidden = root.querySelector('[data-text-color-input]');
    if (hidden) hidden.setAttribute("aria-invalid", "true");
  }

  function setBackgroundColorError() {
    const wrap = root.querySelector(".product-page__colors");
    if (wrap) wrap.classList.add("product-page__colors--error-background");
    const trigger = root.querySelector("[data-background-color-trigger]");
    if (trigger) trigger.setAttribute("aria-invalid", "true");
    const hidden = root.querySelector('[data-background-color-input]');
    if (hidden) hidden.setAttribute("aria-invalid", "true");
  }

  function clearCartFieldErrors() {
    clearTextColorError();
    clearBackgroundColorError();
    root.querySelectorAll(".product-page__radiogroup--error").forEach((group) => {
      group.classList.remove("product-page__radiogroup--error");
    });

    const config = parseProductFormConfig();
    if (!config) return;

    collectCartValidatedFields(config).forEach(({ field }) => {
      clearFormFieldError(field, getFormFieldElements(field));
    });
  }

  function showCartToast(message) {
    const ToastifyCtor = typeof window !== "undefined" ? window.Toastify : undefined;
    if (typeof ToastifyCtor !== "function") {
      return;
    }
    const toast = ToastifyCtor({
      text: message,
      duration: 800000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      escapeMarkup: true,
      ariaLive: "assertive",
      className: "product-page-toastify",
      style: {
        background: "#e53935",
        color: "#fff",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
        maxWidth: "min(28rem, calc(100vw - 2rem))",
        cursor: "default",
        fontFamily: "inherit",
        fontSize: "16px",
        lineHeight: "1.45",
      },
    });
    toast.showToast();
    const closeBtn = toast.toastElement && toast.toastElement.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.innerHTML =
        '<i class="hgi hgi-stroke hgi-rounded hgi-cancel-01 product-page-toastify__close-icon" aria-hidden="true"></i>';
    }
  }

  function validatePersonalizationFields() {
    const config = parseProductFormConfig();
    const validatedFields = collectCartValidatedFields(config);
    const requiredMessages = [];
    const formatMessages = [];
    let firstInvalid = null;
    let firstInvalidStep = null;

    validatedFields.forEach(({ field, stepNumber }) => {
      const elements = getFormFieldElements(field);
      const failure = getFormFieldValidationFailure(field, elements);
      if (!failure) return;

      if (failure.kind === "format") {
        formatMessages.push(failure.message);
      } else {
        requiredMessages.push(failure.message);
      }

      const invalidEl = setFormFieldError(field, failure.elements || elements);
      if (!firstInvalid && invalidEl) firstInvalid = invalidEl;
      if (firstInvalidStep == null) firstInvalidStep = stepNumber;
    });

    return { requiredMessages, formatMessages, firstInvalid, firstInvalidStep };
  }

  function buildCartValidationToast({ requiredMessages, formatMessages }) {
    const parts = [];
    if (requiredMessages.length) {
      parts.push(`Required fields are missing. Please complete: ${requiredMessages.join(", ")}.`);
    }
    if (formatMessages.length) {
      parts.push(`Please fix: ${formatMessages.join(", ")}.`);
    }
    return parts.join(" ");
  }

  function setAddToCartLoading(isLoading) {
    if (!cartBtn) return;
    const label = cartBtn.querySelector("[data-product-add-to-cart-label]");
    const loadingEl = cartBtn.querySelector("[data-product-add-to-cart-loading]");
    cartBtn.classList.toggle("is-loading", isLoading);
    cartBtn.disabled = isLoading;
    cartBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
    if (label) label.hidden = isLoading;
    if (loadingEl) loadingEl.hidden = !isLoading;
  }

  if (productWizard) {
    productWizard.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest(".wizard__step-btn");
        if (!btn || !productWizard.contains(btn)) return;
        const step = parseInt(btn.getAttribute("data-step"), 10);
        if (Number.isNaN(step) || step < 2) return;

        // Allow free navigation between wizard tabs. Required fields are validated on Add to cart from product-form JSON.
      },
      true
    );
  }

  function initGiftCardSendTo() {
    const rootEl = root.querySelector("[data-gift-card-send-to]");
    if (!rootEl) return null;

    const modeInputs = rootEl.querySelectorAll("[data-gift-card-send-mode]");
    const recipientFields = rootEl.querySelector("[data-gift-card-recipient-fields]");
    const recipientFlag = rootEl.querySelector("[data-gift-card-recipient-flag]");
    const recipientInputs = rootEl.querySelectorAll("[data-gift-card-recipient-input]");
    const emailInput = rootEl.querySelector("[data-gift-card-recipient-email]");
    const messageInput = rootEl.querySelector("[data-gift-card-recipient-message]");
    const messageCount = rootEl.querySelector("[data-gift-card-message-count]");

    function syncMessageCount() {
      if (!messageInput || !messageCount) return;
      messageCount.textContent = String((messageInput.value || "").length);
    }

    function setRecipientMode(enabled) {
      if (recipientFields) recipientFields.hidden = !enabled;
      if (recipientFlag) recipientFlag.disabled = !enabled;
      recipientInputs.forEach((input) => {
        input.disabled = !enabled;
        if (!enabled) {
          input.removeAttribute("required");
          input.classList.remove("gift-card-send-to__input--error");
        }
      });
      if (emailInput) {
        if (enabled) emailInput.setAttribute("required", "required");
        else emailInput.removeAttribute("required");
      }
    }

    function currentMode() {
      const checked = rootEl.querySelector("[data-gift-card-send-mode]:checked");
      return checked ? checked.value : "self";
    }

    modeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        setRecipientMode(currentMode() === "recipient");
      });
    });

    if (messageInput) {
      messageInput.addEventListener("input", syncMessageCount);
      syncMessageCount();
    }

    setRecipientMode(currentMode() === "recipient");

    return {
      validate() {
        if (currentMode() !== "recipient") {
          return { ok: true, message: "", focusEl: null };
        }
        const email = emailInput ? String(emailInput.value || "").trim() : "";
        if (!email) {
          if (emailInput) emailInput.classList.add("gift-card-send-to__input--error");
          return {
            ok: false,
            message: "Please enter the recipient’s email address.",
            focusEl: emailInput,
          };
        }
        if (emailInput && typeof emailInput.checkValidity === "function" && !emailInput.checkValidity()) {
          emailInput.classList.add("gift-card-send-to__input--error");
          return {
            ok: false,
            message: "Please enter a valid recipient email address.",
            focusEl: emailInput,
          };
        }
        if (emailInput) emailInput.classList.remove("gift-card-send-to__input--error");
        return { ok: true, message: "", focusEl: null };
      },
    };
  }

  const giftCardSendTo = initGiftCardSendTo();

  if (productForm || cartBtn) {
    const config = parseProductFormConfig();
    collectCartValidatedFields(config).forEach(({ field }) => {
      const elements = getFormFieldElements(field);
      const clearFieldError = () => clearFormFieldError(field, elements);
      elements.forEach((el) => {
        el.addEventListener("input", clearFieldError);
        el.addEventListener("change", clearFieldError);
      });
    });

    const onCartAttempt = (e) => {
      if (e) e.preventDefault();
      clearCartFieldErrors();

      if (giftCardSendTo) {
        const giftCardCheck = giftCardSendTo.validate();
        if (!giftCardCheck.ok) {
          setAddToCartLoading(false);
          showCartToast(giftCardCheck.message);
          if (giftCardCheck.focusEl && typeof giftCardCheck.focusEl.focus === "function") {
            giftCardCheck.focusEl.focus({ preventScroll: false });
          }
          return;
        }
      }

      const pers = validatePersonalizationFields();
      const hasErrors = pers.requiredMessages.length > 0 || pers.formatMessages.length > 0;

      if (hasErrors) {
        setAddToCartLoading(false);
        if (productWizard && pers.firstInvalidStep != null) {
          const stepBtn = productWizard.querySelector(
            `.wizard__step-btn[data-step="${pers.firstInvalidStep}"]`
          );
          if (stepBtn) stepBtn.click();
        }
        showCartToast(buildCartValidationToast(pers));
        if (pers.firstInvalid && typeof pers.firstInvalid.focus === "function") {
          pers.firstInvalid.focus({ preventScroll: false });
        }
        return;
      }

      if (window.ProductFormPricing && productForm) {
        window.ProductFormPricing.updateProductPriceDisplay(productForm, productWizard);
      }

      if (productForm) {
        setAddToCartLoading(true);
        addProductToCartWithCustomizationFee(productForm)
          .then(function () {
            window.location.href = (window.Shopify && Shopify.routes && Shopify.routes.root
              ? Shopify.routes.root
              : "/") + "cart";
          })
          .catch(function (err) {
            setAddToCartLoading(false);
            showCartToast(
              (err && err.message) || "Could not add to cart. Please try again."
            );
          });
      }
    };

    function readFormProperties(form) {
      const properties = {};
      form.querySelectorAll("[name^='properties[']").forEach(function (input) {
        if (input.disabled) return;
        if ((input.type === "radio" || input.type === "checkbox") && !input.checked) return;
        const match = input.name.match(/^properties\[([^\]]+)\]$/);
        if (!match) return;
        const key = match[1];
        const value = String(input.value || "").trim();
        if (!value && input.type !== "file") return;
        if (input.type === "file") return;
        if (Object.prototype.hasOwnProperty.call(properties, key)) {
          if (!Array.isArray(properties[key])) properties[key] = [properties[key]];
          properties[key].push(value);
        } else {
          properties[key] = value;
        }
      });
      return properties;
    }

    function pickFeeVariant(product) {
      const variants = (product && product.variants) || [];
      const priced = variants.filter(function (v) {
        return v && v.available !== false && Number(v.price) > 0;
      });
      if (!priced.length) return null;
      // Prefer Default Title / cheapest so we don't pick a size variant with a wrong label.
      priced.sort(function (a, b) {
        const aDefault = String(a.title || "") === "Default Title" ? 0 : 1;
        const bDefault = String(b.title || "") === "Default Title" ? 0 : 1;
        if (aDefault !== bDefault) return aDefault - bDefault;
        return Number(a.price) - Number(b.price);
      });
      const variant = priced[0];
      return {
        id: Number(variant.id),
        unitCents: Math.max(1, parseInt(variant.price, 10) || 0),
      };
    }

    function resolveFeeVariantForCharge(form, chargeCents) {
      const feeVariantInput = form.querySelector("[data-customization-fee-variant-id]");
      const configuredId = feeVariantInput && feeVariantInput.value;
      const configuredUnitCents = Math.max(
        0,
        parseInt(
          (feeVariantInput &&
            feeVariantInput.getAttribute("data-customization-fee-unit-cents")) ||
            "0",
          10
        ) || 0
      );

      if (configuredId && configuredUnitCents > 0) {
        return Promise.resolve({
          id: Number(configuredId),
          unitCents: configuredUnitCents,
        });
      }

      const root =
        window.Shopify && Shopify.routes && Shopify.routes.root
          ? Shopify.routes.root
          : "/";
      const base = root.replace(/\/?$/, "/");
      const handles = ["customization-charge", "customization-fee"];

      const tryHandle = function (index) {
        if (index >= handles.length) {
          return Promise.resolve(null);
        }
        return fetch(base + "products/" + handles[index] + ".js", {
          headers: { Accept: "application/json" },
        })
          .then(function (res) {
            if (!res.ok) return tryHandle(index + 1);
            return res.json().then(function (product) {
              const picked = pickFeeVariant(product);
              if (!picked) return tryHandle(index + 1);
              return picked;
            });
          })
          .catch(function () {
            return tryHandle(index + 1);
          });
      };

      if (chargeCents <= 0 && !configuredId) return Promise.resolve(null);
      return tryHandle(0);
    }

    function cartEndpoints() {
      const root =
        window.Shopify && Shopify.routes && Shopify.routes.root
          ? Shopify.routes.root
          : "/";
      const base = root.replace(/\/?$/, "/");
      return {
        add: base + "cart/add.js",
        get: base + "cart.js",
        update: base + "cart/update.js",
      };
    }

    function isCustomizationFeeLine(item) {
      if (!item || !item.properties) return false;
      const props = item.properties;
      if (props._customization_fee === "1" || props._customization_fee === 1) return true;
      if (Array.isArray(props)) {
        return props.some(function (p) {
          return p && p[0] === "_customization_fee" && String(p[1]) === "1";
        });
      }
      return false;
    }

    function getCartLineProperty(item, key) {
      if (!item || !item.properties) return null;
      const props = item.properties;
      if (!Array.isArray(props) && props[key] != null) return props[key];
      if (Array.isArray(props)) {
        for (let i = 0; i < props.length; i++) {
          const pair = props[i];
          if (pair && pair[0] === key) return pair[1];
        }
      }
      return null;
    }

    /**
     * Keep one fee line equal to $20 × each customized product line (qty-aware).
     * Prevents flat $20 for the whole cart and avoids orphan/stacked fee lines.
     */
    function syncCustomizationFeeLines(form) {
      const endpoints = cartEndpoints();
      return resolveFeeVariantForCharge(form, 100).then(function (fee) {
        return fetch(endpoints.get, {
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (cart) {
            let expectedCents = 0;
            const updates = {};
            let hasFee = false;

            (cart.items || []).forEach(function (item) {
              if (isCustomizationFeeLine(item)) {
                updates[item.key] = 0;
                hasFee = true;
                return;
              }
              const charge =
                parseInt(
                  String(getCartLineProperty(item, "_additional_charge_cents") || "0"),
                  10
                ) || 0;
              if (charge > 0) {
                expectedCents += charge * Math.max(1, item.quantity || 1);
              }
            });

            const afterClear = hasFee
              ? fetch(endpoints.update, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  credentials: "same-origin",
                  body: JSON.stringify({ updates: updates }),
                }).then(function (res) {
                  return res.json();
                })
              : Promise.resolve(cart);

            return afterClear.then(function () {
              if (expectedCents <= 0) return cart;
              if (!fee || !fee.id || !fee.unitCents) {
                return Promise.reject(
                  new Error(
                    "Customization fee product is missing. Create/publish “Customization charge” ($1.00) or set Theme settings → Customization fee product."
                  )
                );
              }
              // Prefer qty = charge/$20 when the fee product is $20 so checkout
              // shows "1" not "20". $1 products still work (qty = dollars).
              const feeQty = Math.max(1, Math.round(expectedCents / fee.unitCents));
              return fetch(endpoints.add, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                  items: [
                    {
                      id: Number(fee.id),
                      quantity: feeQty,
                      properties: {
                        _customization_fee: "1",
                        _additional_charge_cents: String(expectedCents),
                      },
                    },
                  ],
                }),
              }).then(function (res) {
                return res.json().then(function (data) {
                  if (!res.ok) {
                    const msg =
                      (data && (data.description || data.message)) ||
                      "Could not update customization fee.";
                    throw new Error(msg);
                  }
                  return data;
                });
              });
            });
          });
      });
    }

    function addProductToCartWithCustomizationFee(form) {
      const variantInput = form.querySelector('input[name="id"]');
      const qtyInput = form.querySelector('input[name="quantity"]');
      const chargeInput = form.querySelector("[data-additional-charge-total-input]");

      const variantId = variantInput && variantInput.value;
      const quantity = Math.max(1, parseInt((qtyInput && qtyInput.value) || "1", 10) || 1);
      // Prefer live calc so the hidden input can't go stale / double.
      const chargeCents = Math.max(
        0,
        window.ProductFormPricing
          ? window.ProductFormPricing.calculateAdditionalChargeCents(form)
          : parseInt((chargeInput && chargeInput.value) || "0", 10) || 0
      );
      if (chargeInput) chargeInput.value = String(chargeCents);
      const properties = readFormProperties(form);
      // Always stamp per-unit charge so cart sync can total $20 × products.
      properties._additional_charge_cents = String(chargeCents);

      if (!variantId) {
        return Promise.reject(new Error("Missing product variant."));
      }

      const endpoints = cartEndpoints();

      return fetch(endpoints.add, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          items: [
            {
              id: Number(variantId),
              quantity: quantity,
              properties: properties,
            },
          ],
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) {
              const msg =
                (data && (data.description || data.message)) ||
                "Could not add to cart.";
              throw new Error(msg);
            }
            return data;
          });
        })
        .then(function (data) {
          // Rebuild fee as sum of every customized product ($20 each), not a flat cart fee.
          return syncCustomizationFeeLines(form).then(function () {
            return data;
          });
        });
    }

    if (productForm) {
      productForm.addEventListener("submit", onCartAttempt);
    } else if (cartBtn) {
      cartBtn.addEventListener("click", onCartAttempt);
    }

    if (window.ProductFormPricing && productForm) {
      window.ProductFormPricing.initProductFormPricing(productForm, productWizard);
    }

    // Back-button / bfcache: button can stay stuck in "Adding…" and restored
    // form values may not fire input/change, so +$20 price never recalculates.
    function resetProductPageAfterResume() {
      setAddToCartLoading(false);
      if (window.ProductFormPricing && productForm) {
        window.ProductFormPricing.updateProductPriceDisplay(productForm, productWizard);
      }
    }

    window.addEventListener("pageshow", function (event) {
      resetProductPageAfterResume();
      // Browser may restore autofilled fields after pageshow without events.
      if (event && event.persisted) {
        requestAnimationFrame(resetProductPageAfterResume);
        setTimeout(resetProductPageAfterResume, 50);
        setTimeout(resetProductPageAfterResume, 250);
      }
    });

    window.addEventListener("pagehide", function () {
      setAddToCartLoading(false);
    });
  }

})();

// Home collections tab panels
(function () {
  const root = document.querySelector("[data-home-collections]");
  if (!root) return;

  const tablist = root.querySelector('[role="tablist"]');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll("[data-home-collection-panel]"));
  if (!tabs.length || !panels.length) return;

  function activateTab(index) {
    const panelIndex = String(index);

    tabs.forEach((tab) => {
      const tabIndex = tab.getAttribute("data-home-collection-tab");
      const active = tabIndex === panelIndex;
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.setAttribute("tabindex", active ? "0" : "-1");
      tab.classList.toggle("home-collections__pill--active", active);
    });

    panels.forEach((panel) => {
      const show = panel.getAttribute("data-home-collection-panel") === panelIndex;
      panel.classList.toggle("hidden", !show);
      panel.toggleAttribute("hidden", !show);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateTab(tab.getAttribute("data-home-collection-tab"));
    });

    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      tabs[next].focus();
      activateTab(tabs[next].getAttribute("data-home-collection-tab"));
    });
  });
})();

// Home collections GSAP intro (same pattern as product-page intro)
(function () {
  if (typeof window.gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll("[data-home-collections-intro]").forEach((root) => {
    const heading = root.querySelector("[data-home-collections-intro-heading]");
    const filters = root.querySelector("[data-home-collections-intro-filters]");
    const panel = root.querySelector("[data-home-collections-intro-panel]");
    const description = root.querySelector("[data-home-collections-intro-description]");
    const media = root.querySelector("[data-home-collections-intro-media]");
    const items = panel ? Array.from(panel.querySelectorAll(".product-card")) : [];

    if (!heading) return;

    const targets = [heading, filters, description, media, ...items].filter(Boolean);

    function runIntro() {
      if (root.dataset.homeCollectionsIntroDone === "1") return;
      root.dataset.homeCollectionsIntroDone = "1";

      window.gsap.set(targets, { willChange: "transform, opacity" });
      const tl = window.gsap.timeline({
        defaults: { ease: "power2.out" },
        delay: 0.08,
      });

      tl.from(heading, { opacity: 0, y: 18, duration: 0.95, ease: "power2.out" });

      if (filters) {
        tl.from(filters, { opacity: 0, y: 14, duration: 0.88, ease: "power2.out" }, "-=0.62");
      }
      if (description) {
        tl.from(description, { opacity: 0, y: 16, duration: 0.92, ease: "power2.out" }, "-=0.68");
      }
      if (media) {
        tl.from(
          media,
          { opacity: 0, y: 22, scale: 1.035, duration: 1.15, ease: "expo.out" },
          "-=0.72"
        );
      }
      if (items.length) {
        tl.from(
          items,
          {
            opacity: 0,
            y: 24,
            duration: 1,
            ease: "expo.out",
            stagger: { each: 0.14, ease: "power1.out" },
          },
          "-=0.62"
        );
      }

      tl.eventCallback("onComplete", () => {
        window.gsap.set(targets, { clearProps: "willChange,transform,opacity" });
      });
    }

    if (typeof IntersectionObserver === "undefined") {
      runIntro();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          runIntro();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -2% 0px" }
    );
    observer.observe(root);
  });
})();

// Home top sellers GSAP intro (same pattern as product-page / home-collections intro)
(function () {
  if (typeof window.gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll("[data-home-top-sellers-intro]").forEach((root) => {
    const heading = root.querySelector("[data-home-top-sellers-intro-heading]");
    const description = root.querySelector("[data-home-top-sellers-intro-description]");
    const more = root.querySelector("[data-home-top-sellers-intro-more]");
    const grid = root.querySelector("[data-home-top-sellers-intro-grid]");
    const items = grid ? Array.from(grid.querySelectorAll(".product-card")) : [];

    if (!heading && !items.length) return;

    const targets = [heading, description, more, ...items].filter(Boolean);

    function runIntro() {
      if (root.dataset.homeTopSellersIntroDone === "1") return;
      root.dataset.homeTopSellersIntroDone = "1";

      window.gsap.set(targets, { willChange: "transform, opacity" });
      const tl = window.gsap.timeline({
        defaults: { ease: "power2.out" },
        delay: 0.08,
      });

      if (items.length) {
        tl.from(items, {
          opacity: 0,
          y: 24,
          duration: 1,
          ease: "expo.out",
          stagger: { each: 0.14, ease: "power1.out" },
        });
      }

      if (heading) {
        tl.from(
          heading,
          { opacity: 0, y: 18, duration: 0.95, ease: "power2.out" },
          items.length ? "-=0.62" : 0
        );
      }
      if (description) {
        tl.from(description, { opacity: 0, y: 16, duration: 0.92, ease: "power2.out" }, "-=0.68");
      }
      if (more) {
        tl.from(more, { opacity: 0, y: 14, duration: 0.88, ease: "power2.out" }, "-=0.72");
      }

      tl.eventCallback("onComplete", () => {
        window.gsap.set(targets, { clearProps: "willChange,transform,opacity" });
      });
    }

    if (typeof IntersectionObserver === "undefined") {
      runIntro();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          runIntro();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -2% 0px" }
    );
    observer.observe(root);
  });
})();

// Home tagline GSAP intro (same pattern as product-page / home-collections intro)
(function () {
  if (typeof window.gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll("[data-home-tagline-intro]").forEach((root) => {
    const heading = root.querySelector("[data-home-tagline-intro-heading]");
    const quote = root.querySelector("[data-home-tagline-intro-quote]");
    const attribution = root.querySelector("[data-home-tagline-intro-attribution]");
    const scroll = root.querySelector("[data-home-tagline-intro-scroll]");

    const targets = [heading, quote, attribution, scroll].filter(Boolean);
    if (!targets.length) return;

    function runIntro() {
      if (root.dataset.homeTaglineIntroDone === "1") return;
      root.dataset.homeTaglineIntroDone = "1";

      window.gsap.set(targets, { willChange: "transform, opacity" });
      const tl = window.gsap.timeline({
        defaults: { ease: "power2.out" },
        delay: 0.08,
      });

      if (heading) {
        tl.from(heading, { opacity: 0, y: 18, duration: 0.95, ease: "power2.out" });
      }
      if (quote) {
        tl.from(quote, { opacity: 0, y: 16, duration: 0.92, ease: "power2.out" }, heading ? "-=0.68" : 0);
      }
      if (attribution) {
        tl.from(
          attribution,
          { opacity: 0, y: 14, duration: 0.88, ease: "power2.out" },
          heading || quote ? "-=0.72" : 0
        );
      }
      if (scroll) {
        tl.from(
          scroll,
          { opacity: 0, y: 12, duration: 0.85, ease: "power2.out" },
          heading || quote || attribution ? "-=0.65" : 0
        );
      }

      tl.eventCallback("onComplete", () => {
        window.gsap.set(targets, { clearProps: "willChange,transform,opacity" });
      });
    }

    if (typeof IntersectionObserver === "undefined") {
      runIntro();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          runIntro();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -2% 0px" }
    );
    observer.observe(root);
  });
})();

// Site footer GSAP intro (scroll-triggered, same pattern as home sections)
(function () {
  document.querySelectorAll("[data-site-footer-intro]").forEach((root) => {
    const monogram = root.querySelector("[data-site-footer-intro-monogram]");
    const heading = root.querySelector("[data-site-footer-intro-heading]");
    const introText = root.querySelector("[data-site-footer-intro-text]");
    const links = root.querySelector("[data-site-footer-intro-links]");
    const contact = root.querySelector("[data-site-footer-intro-contact]");
    const social = root.querySelector("[data-site-footer-intro-social]");
    const wordmark = root.querySelector("[data-site-footer-intro-wordmark]");

    const targets = [monogram, heading, introText, links, contact, social, wordmark].filter(Boolean);
    if (!targets.length) return;

    function markDone() {
      root.setAttribute("data-site-footer-intro-done", "");
    }

    if (typeof window.gsap === "undefined") {
      markDone();
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markDone();
      return;
    }

    function runIntro() {
      if (root.dataset.siteFooterIntroDone === "1") return;
      root.dataset.siteFooterIntroDone = "1";
      markDone();

      window.gsap.set(targets, { willChange: "transform, opacity" });
      const tl = window.gsap.timeline({
        defaults: { ease: "power2.out" },
        delay: 0.08,
      });

      if (monogram) {
        tl.from(monogram, { opacity: 0, scale: 0.92, duration: 0.95, ease: "expo.out" });
      }
      if (heading) {
        tl.from(
          heading,
          { opacity: 0, y: 18, duration: 0.92, ease: "power2.out" },
          monogram ? "-=0.62" : 0
        );
      }
      if (introText) {
        tl.from(
          introText,
          { opacity: 0, y: 16, duration: 0.9, ease: "power2.out" },
          heading || monogram ? "-=0.68" : 0
        );
      }
      if (links) {
        tl.from(
          links,
          { opacity: 0, y: 20, duration: 0.92, ease: "power2.out" },
          heading || introText || monogram ? "-=0.58" : 0
        );
      }
      if (contact) {
        tl.from(
          contact,
          { opacity: 0, y: 20, duration: 0.92, ease: "power2.out" },
          links ? "-=0.72" : heading || introText || monogram ? "-=0.58" : 0
        );
      }
      if (social) {
        tl.from(
          social,
          { opacity: 0, y: 16, duration: 0.88, ease: "power2.out" },
          contact || links ? "-=0.65" : 0
        );
      }
      if (wordmark) {
        tl.from(
          wordmark,
          { opacity: 0, y: 28, scale: 1.02, duration: 1.1, ease: "expo.out" },
          social || contact || links ? "-=0.55" : 0
        );
      }

      tl.eventCallback("onComplete", () => {
        window.gsap.set(targets, { clearProps: "willChange,transform,opacity" });
      });
    }

    if (typeof IntersectionObserver === "undefined") {
      runIntro();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          runIntro();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -2% 0px" }
    );
    observer.observe(root);
  });
})();

// Product page GSAP intro
(function () {
  const root = document.querySelector(".product-page[data-product-page-intro]");
  if (!root) return;

  function markReady() {
    root.setAttribute("data-intro-ready", "");
  }

  if (typeof window.gsap === "undefined") {
    markReady();
    return;
  }

  const gsap = window.gsap;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const breadcrumbMobile = root.querySelector("[data-product-page-intro-breadcrumb]");
  const breadcrumbDesktop = root.querySelector("[data-product-page-intro-breadcrumb-desktop]");
  const breadcrumb =
    window.matchMedia("(min-width: 1024px)").matches
      ? breadcrumbDesktop || breadcrumbMobile
      : breadcrumbMobile || breadcrumbDesktop;
  const media = root.querySelector("[data-product-page-intro-media]");
  const thumbs = root.querySelector("[data-product-page-intro-thumbs]");
  const headerMobile = root.querySelector("[data-product-page-intro-header-mobile]");
  const headerDesktop = root.querySelector("[data-product-page-intro-header-desktop]");
  const header =
    window.matchMedia("(min-width: 1024px)").matches
      ? headerDesktop || headerMobile
      : headerMobile || headerDesktop;
  const tabs =
    root.querySelector("[data-product-page-intro-tabs]") ||
    document.getElementById("product-page-intro-tabs");

  const animated = [breadcrumb, media, thumbs, header, tabs].filter(Boolean);
  if (!animated.length) {
    markReady();
    return;
  }

  if (reduceMotion) {
    gsap.set(animated, { opacity: 1, y: 0, scale: 1, clearProps: "transform" });
    markReady();
    return;
  }

  gsap.set(animated, { willChange: "transform, opacity" });
  if (breadcrumb) gsap.set(breadcrumb, { opacity: 0, y: 14 });
  if (media) gsap.set(media, { opacity: 0, y: 28, scale: 1.035 });
  if (thumbs) gsap.set(thumbs, { opacity: 0, y: 18 });
  if (header) gsap.set(header, { opacity: 0, y: 22 });
  if (tabs) gsap.set(tabs, { opacity: 0, y: 18 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    delay: 0.1,
  });

  if (breadcrumb) {
    tl.to(breadcrumb, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  }
  if (media) {
    tl.to(
      media,
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" },
      breadcrumb ? "-=0.3" : 0
    );
  }
  if (thumbs) {
    tl.to(thumbs, { opacity: 1, y: 0, duration: 0.62, ease: "power3.out" }, "-=0.48");
  }
  if (header) {
    tl.to(header, { opacity: 1, y: 0, duration: 0.72, ease: "power3.out" }, "-=0.42");
  }
  if (tabs) {
    tl.to(tabs, { opacity: 1, y: 0, duration: 0.58, ease: "power3.out" }, "-=0.46");
  }

  tl.eventCallback("onComplete", () => {
    gsap.set(animated, { clearProps: "willChange,transform,opacity" });
    markReady();
  });
})();

// Home process — video slider (Swiper)
(function () {
  const SwiperCtor = typeof window.Swiper !== "undefined" ? window.Swiper : null;
  if (!SwiperCtor) return;

  document.querySelectorAll("[data-home-process-swiper]").forEach((swiperEl) => {
    if (swiperEl.dataset.homeProcessInit === "1") return;
    swiperEl.dataset.homeProcessInit = "1";

    const playOverlay = swiperEl.querySelector("[data-home-process-play-overlay]");
    const paginationEl = swiperEl.querySelector(".home-process__pagination");

    const swiper = new SwiperCtor(swiperEl, {
      slidesPerView: 1,
      speed: 650,
      loop: swiperEl.querySelectorAll(".swiper-slide").length > 1,
      pagination: paginationEl
        ? {
            el: paginationEl,
            clickable: true,
          }
        : undefined,
    });

    function activeSlide() {
      return swiper.slides[swiper.activeIndex] || null;
    }

    function activeVideo() {
      return activeSlide()?.querySelector("video") || null;
    }

    function activeIsVideo() {
      const slide = activeSlide();
      if (!slide) return false;
      if (slide.getAttribute("data-home-process-slide-type") === "image") return false;
      return Boolean(slide.querySelector("video"));
    }

    function pauseInactiveVideos() {
      swiper.slides.forEach((slide, index) => {
        const video = slide.querySelector("video");
        if (!video) return;
        if (index !== swiper.activeIndex) {
          video.pause();
          video.currentTime = 0;
        }
      });
    }

    function playActiveVideo() {
      pauseInactiveVideos();
      const video = activeVideo();
      if (!video || !activeIsVideo()) {
        updatePlayOverlay();
        return;
      }
      video.muted = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => updatePlayOverlay());
      }
      updatePlayOverlay();
    }

    function updatePlayOverlay() {
      if (!playOverlay) return;
      const video = activeVideo();
      const showPlay = activeIsVideo() && Boolean(video) && video.paused;
      playOverlay.hidden = !showPlay;
      playOverlay.classList.toggle("is-hidden", !showPlay);
      playOverlay.setAttribute("aria-hidden", showPlay ? "false" : "true");
    }

    playOverlay?.addEventListener("click", () => {
      const video = activeVideo();
      if (!video || !video.paused) return;
      video.muted = true;
      video.play().catch(() => {});
      updatePlayOverlay();
    });

    swiperEl.querySelectorAll("video").forEach((video) => {
      video.muted = true;
      video.addEventListener("play", updatePlayOverlay);
      video.addEventListener("pause", updatePlayOverlay);
      video.addEventListener("ended", updatePlayOverlay);
    });

    swiper.on("slideChange", () => {
      playActiveVideo();
    });

    playActiveVideo();
  });
})();

// Mount menu top sellers + shop mega dropdown
(function () {
  const HOVER_DELAY_MS = 280;

  function mountMenuTopSellers() {
    if (typeof Shopify !== "undefined" && Shopify.designMode) return;

    const mount = document.querySelector("[data-menu-top-sellers-mount]");
    const source = document.querySelector("[data-menu-top-sellers-section]");
    if (!mount || !source) return;

    const panel = source.querySelector(".shop-mega__products");
    if (!panel) return;

    mount.replaceWith(panel);

    const sectionWrapper = source.closest(".shopify-section");
    if (sectionWrapper) {
      sectionWrapper.hidden = true;
      sectionWrapper.style.display = "none";
    }
  }

  function initShopMegaDropdown() {
    const button = document.getElementById("shop-mega-button");
    const dropdown = document.getElementById("shop-mega-dropdown");
    if (!button || !dropdown || button.dataset.shopMegaInit === "1") return;
    button.dataset.shopMegaInit = "1";

    let closeTimer = null;
    const desktopMq = window.matchMedia("(min-width: 1024px)");

    function openDropdown() {
      clearTimeout(closeTimer);
      dropdown.classList.remove("hidden");
      button.setAttribute("aria-expanded", "true");
      button.classList.add("is-active");
    }

    function closeDropdown() {
      dropdown.classList.add("hidden");
      button.setAttribute("aria-expanded", "false");
      button.classList.remove("is-active");
    }

    function scheduleClose() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(closeDropdown, HOVER_DELAY_MS);
    }

    button.addEventListener("mouseenter", () => {
      if (desktopMq.matches) openDropdown();
    });
    dropdown.addEventListener("mouseenter", () => {
      if (desktopMq.matches) openDropdown();
    });
    button.addEventListener("mouseleave", () => {
      if (desktopMq.matches) scheduleClose();
    });
    dropdown.addEventListener("mouseleave", () => {
      if (desktopMq.matches) scheduleClose();
    });

    button.addEventListener("focus", () => {
      if (desktopMq.matches) openDropdown();
    });
    button.addEventListener("blur", (event) => {
      if (!desktopMq.matches) return;
      if (dropdown.contains(event.relatedTarget)) return;
      scheduleClose();
    });

    button.addEventListener("click", (event) => {
      if (!desktopMq.matches) return;
      event.preventDefault();
      if (dropdown.classList.contains("hidden")) openDropdown();
      else closeDropdown();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDropdown();
    });
  }

  function initSiteHeaderDrawer() {
    const drawer = document.querySelector("[data-site-header-drawer]");
    const toggle = document.querySelector("[data-site-header-menu-toggle]");
    const closeButtons = document.querySelectorAll("[data-site-header-drawer-close]");
    const backdrop = document.querySelector("[data-site-header-drawer-backdrop]");
    const panel = document.getElementById("site-header-drawer-panel");
    const desktopMq = window.matchMedia("(min-width: 1024px)");

    if (!drawer || !toggle || !panel) return;

    if (drawer.parentElement !== document.body) {
      document.body.appendChild(drawer);
    }

    let previousFocus = null;

    function setToggleState(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    function setScrollLock(locked) {
      document.body.classList.toggle("site-header-drawer-open", locked);
    }

    function openDrawer() {
      if (desktopMq.matches) return;
      previousFocus = document.activeElement;
      setScrollLock(true);
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      setToggleState(true);
      const firstFocusable = panel.querySelector("[data-site-header-drawer-close]");
      if (firstFocusable) firstFocusable.focus();
    }

    function closeDrawer() {
      setScrollLock(false);
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      setToggleState(false);

      drawer.querySelectorAll("[data-site-header-drawer-accordion]").forEach((trigger) => {
        const targetId = trigger.getAttribute("aria-controls");
        const target = targetId ? document.getElementById(targetId) : null;
        trigger.setAttribute("aria-expanded", "false");
        if (target) target.hidden = true;
      });

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      } else {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", () => {
      if (drawer.classList.contains("is-open")) closeDrawer();
      else openDrawer();
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeDrawer);
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeDrawer);
    }

    drawer.querySelectorAll(".site-header-drawer__link[href]").forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });

    drawer.querySelectorAll("[data-site-header-drawer-accordion]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const targetId = trigger.getAttribute("aria-controls");
        const target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;

        const expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
        target.hidden = expanded;
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) {
        event.preventDefault();
        closeDrawer();
      }
    });

    desktopMq.addEventListener("change", (event) => {
      if (event.matches) closeDrawer();
    });
  }

  function initHeaderAccountMenu() {
    const roots = document.querySelectorAll("[data-header-account]");
    if (!roots.length) return;

    const closeAll = (except) => {
      roots.forEach((root) => {
        if (except && root === except) return;
        const trigger = root.querySelector("[data-header-account-trigger]");
        const menu = root.querySelector("[data-header-account-menu]");
        if (!trigger || !menu) return;
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        root.classList.remove("is-open");
      });
    };

    roots.forEach((root) => {
      const trigger = root.querySelector("[data-header-account-trigger]");
      const menu = root.querySelector("[data-header-account-menu]");
      if (!trigger || !menu) return;

      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = menu.hidden;
        closeAll(root);
        menu.hidden = !willOpen;
        trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
        root.classList.toggle("is-open", willOpen);
      });
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-header-account]")) return;
      closeAll();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAll();
    });
  }

  function initHeaderMenu() {
    mountMenuTopSellers();
    initShopMegaDropdown();
    initSiteHeaderDrawer();
    initHeaderAccountMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeaderMenu);
  } else {
    initHeaderMenu();
  }
})();

// Cart page — keep customization fee = $20 × customized products
(function () {
  const form = document.getElementById("CartForm");
  if (!form) return;

  function cartRootPath() {
    const root =
      (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || "/";
    return root.replace(/\/?$/, "/");
  }

  function isFeeLine(item) {
    if (!item || !item.properties) return false;
    const props = item.properties;
    if (props._customization_fee === "1" || props._customization_fee === 1) return true;
    if (Array.isArray(props)) {
      return props.some(function (p) {
        return p && p[0] === "_customization_fee" && String(p[1]) === "1";
      });
    }
    return false;
  }

  function lineProp(item, key) {
    if (!item || !item.properties) return null;
    const props = item.properties;
    if (!Array.isArray(props) && props[key] != null) return props[key];
    if (Array.isArray(props)) {
      for (let i = 0; i < props.length; i++) {
        if (props[i] && props[i][0] === key) return props[i][1];
      }
    }
    return null;
  }

  function resolveFeeVariant() {
    const base = cartRootPath();
    const handles = ["customization-charge", "customization-fee"];
    function tryHandle(index) {
      if (index >= handles.length) return Promise.resolve(null);
      return fetch(base + "products/" + handles[index] + ".js", {
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) return tryHandle(index + 1);
          return res.json().then(function (product) {
            const variant =
              (product.variants || []).find(function (v) {
                return v && v.available !== false && Number(v.price) > 0;
              }) || (product.variants || [])[0];
            if (!variant) return tryHandle(index + 1);
            return {
              id: Number(variant.id),
              unitCents: Math.max(1, parseInt(variant.price, 10) || 0),
            };
          });
        })
        .catch(function () {
          return tryHandle(index + 1);
        });
    }
    return tryHandle(0);
  }

  function syncCartCustomizationFees() {
    const base = cartRootPath();
    return resolveFeeVariant().then(function (fee) {
      return fetch(base + "cart.js", {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (cart) {
          let expectedCents = 0;
          let currentFeeCents = 0;
          const updates = {};
          let hasFee = false;

          (cart.items || []).forEach(function (item) {
            if (isFeeLine(item)) {
              updates[item.key] = 0;
              hasFee = true;
              currentFeeCents += item.final_line_price || 0;
              return;
            }
            const charge =
              parseInt(String(lineProp(item, "_additional_charge_cents") || "0"), 10) || 0;
            if (charge > 0) {
              expectedCents += charge * Math.max(1, item.quantity || 1);
            }
          });

          if (expectedCents === currentFeeCents && (!expectedCents || hasFee)) {
            return cart;
          }

          const clear = hasFee
            ? fetch(base + "cart/update.js", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                credentials: "same-origin",
                body: JSON.stringify({ updates: updates }),
              }).then(function (res) {
                return res.json();
              })
            : Promise.resolve(cart);

          return clear.then(function () {
            if (expectedCents <= 0 || !fee || !fee.id || !fee.unitCents) {
              if (hasFee) window.location.reload();
              return;
            }
            const feeQty = Math.max(1, Math.round(expectedCents / fee.unitCents));
            return fetch(base + "cart/add.js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              credentials: "same-origin",
              body: JSON.stringify({
                items: [
                  {
                    id: Number(fee.id),
                    quantity: feeQty,
                    properties: {
                      _customization_fee: "1",
                      _additional_charge_cents: String(expectedCents),
                    },
                  },
                ],
              }),
            }).then(function () {
              window.location.reload();
            });
          });
        });
    });
  }

  // Fix flat $20 cart fee → $20 per customized product when landing on cart.
  syncCartCustomizationFees().catch(function () {});

  function setActionLoading(el, isLoading, { disableButton = true } = {}) {
    if (!el) return;
    const label = el.querySelector("[data-cart-action-label]");
    const loading = el.querySelector("[data-cart-action-loading]");
    el.classList.toggle("is-loading", isLoading);
    el.setAttribute("aria-busy", isLoading ? "true" : "false");
    if (label) label.hidden = isLoading;
    if (loading) loading.hidden = !isLoading;
    if (el.matches("button") && disableButton) el.disabled = isLoading;
    if (el.matches("a") && isLoading) {
      el.setAttribute("aria-disabled", "true");
      el.style.pointerEvents = "none";
    }
  }

  form.querySelectorAll("[data-cart-remove]").forEach((link) => {
    link.addEventListener("click", () => setActionLoading(link, true));
  });

  const discountInput = form.querySelector("[data-cart-discount-code]");
  const discountApply = form.querySelector("[data-cart-discount-apply]");
  const discountMessage = form.querySelector("[data-cart-discount-message]");
  const cartRoot =
    (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || "/";

  function setDiscountMessage(text, { error = false } = {}) {
    if (!discountMessage) return;
    discountMessage.textContent = text;
    discountMessage.classList.toggle("text-red-600", error);
    discountMessage.classList.toggle("text-emerald-700", !error && !!text);
    discountMessage.classList.toggle("text-gray-500", !error && !text);
  }

  function codeLooksApplied(cart, code) {
    const needle = String(code || "").trim().toLowerCase();
    if (!needle || !cart) return false;

    const cartLevel = cart.cart_level_discount_applications || [];
    if (
      cartLevel.some((app) => String(app.title || "").trim().toLowerCase() === needle)
    ) {
      return true;
    }

    const items = cart.items || [];
    return items.some((item) =>
      (item.discounts || []).some(
        (discount) => String(discount.title || "").trim().toLowerCase() === needle
      )
    );
  }

  function goToCheckoutWithCode(code) {
    // Gift cards are payment methods — Shopify applies them at checkout.
    // Discount codes also work via this query param.
    window.location.href =
      cartRoot.replace(/\/?$/, "/") +
      "checkout?discount=" +
      encodeURIComponent(code);
  }

  async function applyCartCode(code, { preferCheckout = false } = {}) {
    const trimmed = String(code || "").trim();
    if (!trimmed) {
      setDiscountMessage("Enter a discount or gift card code first.", { error: true });
      discountInput?.focus();
      return false;
    }

    if (preferCheckout) {
      goToCheckoutWithCode(trimmed);
      return true;
    }

    try {
      // Discount codes can be applied on the cart via Ajax Cart API.
      const updateRes = await fetch(cartRoot.replace(/\/?$/, "/") + "cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ discount: trimmed }),
        credentials: "same-origin",
      });

      if (!updateRes.ok) {
        throw new Error("Cart update failed");
      }

      const cart = await updateRes.json();
      if (codeLooksApplied(cart, trimmed)) {
        setDiscountMessage("Discount applied.");
        window.location.reload();
        return true;
      }

      // Gift card codes are not cart discounts. Send them to checkout so
      // Shopify can redeem them as payment (e.g. 37qhhh6bcqxdv3qt).
      setDiscountMessage("Opening checkout to apply your gift card…");
      goToCheckoutWithCode(trimmed);
      return true;
    } catch (err) {
      // Fallback: still try checkout, which accepts discount + gift card codes.
      goToCheckoutWithCode(trimmed);
      return true;
    }
  }

  function setDiscountRemoveLoading(button, isLoading) {
    if (!button) return;
    const label = button.querySelector("[data-cart-discount-remove-label]");
    const loading = button.querySelector("[data-cart-discount-remove-loading]");
    button.disabled = isLoading;
    button.setAttribute("aria-busy", isLoading ? "true" : "false");
    if (label) label.hidden = isLoading;
    if (loading) loading.hidden = !isLoading;
  }

  async function removeCartDiscount(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const button = event && event.currentTarget;
    setDiscountRemoveLoading(button, true);
    setDiscountMessage("Removing discount…");
    try {
      // Only clears discount codes — never line items / cart contents.
      const updateRes = await fetch(cartRoot.replace(/\/?$/, "/") + "cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ discount: "" }),
        credentials: "same-origin",
      });

      if (!updateRes.ok) {
        throw new Error("Could not remove discount");
      }

      const cart = await updateRes.json();
      if ((cart.item_count || 0) === 0 && (cart.items || []).length === 0) {
        // Safety: never leave the user on an unexpectedly emptied cart from this action.
        throw new Error("Discount removal returned an empty cart");
      }

      setDiscountMessage("Discount removed.");
      window.location.reload();
      return true;
    } catch (err) {
      setDiscountRemoveLoading(button, false);
      setDiscountMessage("Could not remove the discount. Please try again.", {
        error: true,
      });
      return false;
    }
  }

  if (discountApply && discountInput) {
    discountApply.addEventListener("click", async () => {
      setActionLoading(discountApply, true);
      const ok = await applyCartCode(discountInput.value);
      if (!ok) setActionLoading(discountApply, false);
    });

    discountInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      discountApply.click();
    });
  }

  form.querySelectorAll("[data-cart-discount-remove]").forEach((button) => {
    button.addEventListener("click", removeCartDiscount);
  });

  form.addEventListener("submit", (event) => {
    const submitter = event.submitter;
    const isCheckout = !!(submitter && submitter.matches("[data-cart-checkout]"));
    const target =
      submitter && submitter.matches("[data-cart-update], [data-cart-checkout]")
        ? submitter
        : form.querySelector("[data-cart-update]");

    // Carry typed discount/gift card code into checkout.
    if (isCheckout && discountInput) {
      const typed = String(discountInput.value || "").trim();
      if (typed) {
        event.preventDefault();
        setActionLoading(target, true, { disableButton: false });
        applyCartCode(typed, { preferCheckout: true });
        return;
      }
    }

    // Disabled submit buttons are omitted from form data in many browsers.
    // Shopify needs `name="checkout"` in the POST to redirect to payment.
    if (isCheckout) {
      let checkoutInput = form.querySelector('input[data-cart-checkout-intent]');
      if (!checkoutInput) {
        checkoutInput = document.createElement("input");
        checkoutInput.type = "hidden";
        checkoutInput.name = "checkout";
        checkoutInput.value = "";
        checkoutInput.setAttribute("data-cart-checkout-intent", "true");
        form.appendChild(checkoutInput);
      }
    }

    // Keep the active submitter enabled so its name/value still posts.
    setActionLoading(target, true, { disableButton: false });
    if (target && target.matches("button")) {
      target.style.pointerEvents = "none";
    }

    form.querySelectorAll("[data-cart-update], [data-cart-checkout]").forEach((btn) => {
      if (btn !== target) btn.disabled = true;
    });
  });
})();


// Home Featured Collection carousel (Swiper)
(function () {
  const SwiperCtor = typeof window.Swiper !== "undefined" ? window.Swiper : null;
  if (!SwiperCtor) return;

  document.querySelectorAll("[data-home-featured-carousel]").forEach((root) => {
    if (root.dataset.homeFeaturedInit === "1") return;
    root.dataset.homeFeaturedInit = "1";

    const section = root.closest("[data-home-featured-collection]");
    const mediaEl = root.querySelector("[data-home-featured-media-swiper]");
    const contentEl = root.querySelector("[data-home-featured-content-swiper]");
    const paginationEl = root.querySelector("[data-home-featured-pagination]");
    const prevBtn = root.querySelector("[data-home-featured-prev]");
    const nextBtn = root.querySelector("[data-home-featured-next]");
    if (!mediaEl || !contentEl) return;

    const slideCount = mediaEl.querySelectorAll(".swiper-slide").length;
    const multi = slideCount > 1;
    const delayRaw = parseInt(section?.getAttribute("data-autoplay-delay") || "5000", 10);
    const autoplayDelay = Number.isFinite(delayRaw) && delayRaw >= 2000 ? delayRaw : 5000;

    if (!multi) {
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      if (paginationEl) paginationEl.hidden = true;
    }

    const contentSwiper = new SwiperCtor(contentEl, {
      slidesPerView: 1,
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: 650,
      allowTouchMove: false,
      nested: true,
    });

    const mediaSwiper = new SwiperCtor(mediaEl, {
      slidesPerView: 1,
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: 650,
      loop: multi,
      autoplay: multi
        ? {
            delay: autoplayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }
        : false,
      pagination: multi && paginationEl
        ? {
            el: paginationEl,
            clickable: true,
          }
        : undefined,
      navigation: multi && prevBtn && nextBtn
        ? {
            prevEl: prevBtn,
            nextEl: nextBtn,
          }
        : undefined,
      on: {
        slideChange: function () {
          const index = this.realIndex;
          if (contentSwiper.activeIndex !== index) {
            contentSwiper.slideTo(index);
          }
        },
      },
    });

    // Keep panel in sync if media starts at a non-zero index after init.
    contentSwiper.slideTo(mediaSwiper.realIndex, 0);
  });
})();
