(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-nav-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }

      current = (next + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var grid = form.parentElement.querySelector('[data-filter-grid]');
    var empty = form.parentElement.querySelector('[data-empty-state]');
    var searchInput = form.querySelector('[data-search-input]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var typeSelect = form.querySelector('[data-filter-type]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      if (!grid) {
        return;
      }

      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      grid.querySelectorAll('.movie-card').forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
