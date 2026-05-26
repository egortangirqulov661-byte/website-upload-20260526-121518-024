(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  if (slides.length) {
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    window.setInterval(function() {
      showSlide(active + 1);
    }, 5200);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function(panel) {
    var input = panel.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var current = '全部';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' '));
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var shown = 0;

      cards.forEach(function(card) {
        var content = cardText(card);
        var matchesKeyword = !keyword || content.indexOf(keyword) >= 0;
        var matchesFilter = current === '全部' || content.indexOf(normalize(current)) >= 0;
        var visible = matchesKeyword && matchesFilter;

        card.classList.toggle('is-filtered-out', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        current = button.getAttribute('data-filter-value') || '全部';
        buttons.forEach(function(item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    if (buttons[0]) {
      buttons[0].classList.add('is-active');
    }

    apply();
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('videoPlayer');
  var button = document.getElementById('playerStart');
  var hls = null;
  var loaded = false;

  function start() {
    if (!video || !sourceUrl) {
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      loaded = true;
    }

    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function() {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function() {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function() {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }
}
