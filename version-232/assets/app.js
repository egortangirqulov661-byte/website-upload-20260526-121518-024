(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.hero-card'));
    if (slides.length > 1) {
      var active = 0;
      var show = function (index) {
        active = index % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        cards.forEach(function (card, cardIndex) {
          card.classList.toggle('is-active', cardIndex === active);
        });
      };
      cards.forEach(function (card, index) {
        card.addEventListener('mouseenter', function () {
          show(index);
        });
        card.addEventListener('focus', function () {
          show(index);
        });
      });
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterSelect = document.querySelector('[data-filter-select]');
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var applyFilter = function () {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var type = filterSelect ? filterSelect.value : '';
      filterItems.forEach(function (item) {
        var text = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-type') || '',
          item.getAttribute('data-region') || ''
        ].join(' ').toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = !type || item.getAttribute('data-type') === type;
        item.style.display = matchesQuery && matchesType ? '' : 'none';
      });
    };
    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }
    if (filterSelect) {
      filterSelect.addEventListener('change', applyFilter);
    }
  });
})();
