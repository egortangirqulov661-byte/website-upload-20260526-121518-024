(function () {
  const mobileToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(activeIndex - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(activeIndex + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    activate(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const section = panel.closest('section') || document;
    const input = panel.querySelector('[data-filter-search]');
    const selects = Array.from(panel.querySelectorAll('[data-filter-select]'));
    const clearButton = panel.querySelector('[data-clear-filters]');
    const result = panel.querySelector('[data-filter-result]');
    const cards = Array.from(section.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const query = normalize(input ? input.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const searchText = normalize(card.dataset.search);
        const matchesQuery = !query || searchText.includes(query);
        const matchesSelects = selects.every(function (select) {
          const key = select.dataset.filterSelect;
          const expected = normalize(select.value);
          return !expected || normalize(card.dataset[key]) === expected;
        });
        const show = matchesQuery && matchesSelects;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = query || selects.some(function (select) { return select.value; })
          ? '匹配结果：' + visible + ' 部影片'
          : '';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        applyFilters();
      });
    }
  });

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-hls-loader]');

      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.dataset.hlsLoader = 'true';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setStatus(player, message) {
    const status = player.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message || '';
    }
  }

  function nativePlay(video, source, player) {
    video.src = source;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus(player, '浏览器已载入播放源，请点击视频控件播放。');
      });
    }
  }

  function attachHls(video, source, player, Hls) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(player, '播放源已就绪。');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus(player, '播放源已就绪，请点击视频控件播放。');
        });
      }
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus(player, '播放源暂时无法加载，可刷新页面后重试。');
        hls.destroy();
      }
    });

    player._hls = hls;
  }

  function startPlayer(player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-player-overlay]');
    const source = player.dataset.src;

    if (!video || !source) {
      setStatus(player, '播放源未找到。');
      return;
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    setStatus(player, '正在加载播放源…');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      nativePlay(video, source, player);
      return;
    }

    loadHlsLibrary()
      .then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          attachHls(video, source, player, Hls);
        } else {
          nativePlay(video, source, player);
        }
      })
      .catch(function () {
        nativePlay(video, source, player);
      });
  }

  document.querySelectorAll('[data-play-trigger]').forEach(function (button) {
    button.addEventListener('click', function () {
      const player = button.closest('[data-player]');
      if (player) {
        startPlayer(player);
      }
    });
  });
})();
