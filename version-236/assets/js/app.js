import { H as Hls } from "./hls.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const menuButton = $(".mobile-menu-button");
const mobileNav = $(".mobile-nav");

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
  });
}

const heroSlides = $$(".hero-slide");
const heroCards = $$(".hero-mini-card");
let heroIndex = 0;

function setHero(index) {
  if (!heroSlides.length) {
    return;
  }
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, current) => {
    slide.classList.toggle("is-active", current === heroIndex);
  });
  heroCards.forEach((card, current) => {
    card.classList.toggle("is-active", current === heroIndex);
  });
}

heroCards.forEach((card, index) => {
  card.addEventListener("mouseenter", () => setHero(index));
  card.addEventListener("focus", () => setHero(index));
});

if (heroSlides.length > 1) {
  setInterval(() => setHero(heroIndex + 1), 5200);
}

const searchInput = $("[data-search-input]");
const filterSelect = $("[data-filter-select]");
const cards = $$("[data-card]");

function filterCards() {
  const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const selected = filterSelect ? filterSelect.value : "all";
  cards.forEach((card) => {
    const text = (card.getAttribute("data-search") || "").toLowerCase();
    const group = card.getAttribute("data-group") || "all";
    const matchTerm = !term || text.includes(term);
    const matchGroup = selected === "all" || selected === group;
    card.classList.toggle("is-hidden", !(matchTerm && matchGroup));
  });
}

if (searchInput) {
  searchInput.addEventListener("input", filterCards);
}

if (filterSelect) {
  filterSelect.addEventListener("change", filterCards);
}

function bindPlayers() {
  $$(".player-frame").forEach((frame) => {
    const video = $("video", frame);
    const cover = $(".play-cover", frame);
    const button = $(".play-button", frame);
    if (!video) {
      return;
    }
    let initialized = false;
    let hls = null;

    const start = () => {
      const stream = video.getAttribute("data-stream");
      if (!stream) {
        return;
      }
      if (!initialized) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        initialized = true;
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      video.play().catch(() => {});
    };

    if (button) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    frame.addEventListener("click", (event) => {
      if (event.target === frame) {
        start();
      }
    });

    video.addEventListener("play", () => {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

bindPlayers();
