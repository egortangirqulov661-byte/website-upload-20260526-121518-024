document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initHeaderSearch();
  initHeroSlider();
  initGridFilter();
  initPlayer();
});

function initMobileMenu() {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
}

function initHeaderSearch() {
  var forms = document.querySelectorAll('[data-site-search]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        return;
      }
    });
  });
}

function initHeroSlider() {
  var slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }
  var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
  var prev = slider.querySelector('[data-hero-prev]');
  var next = slider.querySelector('[data-hero-next]');
  var index = 0;
  var timer;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function restart() {
    window.clearInterval(timer);
    start();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      restart();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
      restart();
    });
  });

  show(0);
  start();
}

function initGridFilter() {
  var grid = document.querySelector('[data-card-grid]');
  if (!grid) {
    return;
  }
  var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
  var searchInput = document.querySelector('[data-filter-search]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var sortSelect = document.querySelector('[data-filter-sort]');
  var empty = document.querySelector('[data-empty-state]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (searchInput && query) {
    searchInput.value = query;
  }

  function match(card) {
    var text = (card.getAttribute('data-search') || '').toLowerCase();
    var type = card.getAttribute('data-type') || '';
    var region = card.getAttribute('data-region') || '';
    var searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var typeValue = typeSelect ? typeSelect.value : '';
    var regionValue = regionSelect ? regionSelect.value : '';
    var okSearch = !searchValue || text.indexOf(searchValue) !== -1;
    var okType = !typeValue || type === typeValue;
    var okRegion = !regionValue || region === regionValue;
    return okSearch && okType && okRegion;
  }

  function sortCards(visibleCards) {
    if (!sortSelect || !sortSelect.value) {
      return visibleCards;
    }
    var key = sortSelect.value;
    return visibleCards.sort(function (a, b) {
      if (key === 'year') {
        return Number(b.getAttribute('data-year-num') || 0) - Number(a.getAttribute('data-year-num') || 0);
      }
      if (key === 'score') {
        return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
      }
      return Number(a.getAttribute('data-index') || 0) - Number(b.getAttribute('data-index') || 0);
    });
  }

  function update() {
    var visible = [];
    cards.forEach(function (card) {
      var isVisible = match(card);
      card.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visible.push(card);
      }
    });
    sortCards(visible).forEach(function (card) {
      grid.appendChild(card);
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible.length === 0);
    }
  }

  [searchInput, typeSelect, regionSelect, sortSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', update);
      control.addEventListener('change', update);
    }
  });

  update();
}

function initPlayer() {
  var wrap = document.querySelector('[data-player]');
  if (!wrap) {
    return;
  }
  var video = wrap.querySelector('video');
  var overlay = wrap.querySelector('[data-player-overlay]');
  var src = wrap.getAttribute('data-src');
  var hlsInstance = null;
  var ready = false;

  function playVideo() {
    if (!video || !src) {
      return;
    }
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (!ready) {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
      ready = true;
    } else {
      video.play().catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
