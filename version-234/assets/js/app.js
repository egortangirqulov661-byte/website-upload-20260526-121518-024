(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var queryInput = filterRoot.querySelector('[data-filter-query]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var typeSelect = filterRoot.querySelector('[data-filter-type]');
        var categorySelect = filterRoot.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-title]'));

        function normalized(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalized(queryInput && queryInput.value);
            var year = normalized(yearSelect && yearSelect.value);
            var type = normalized(typeSelect && typeSelect.value);
            var category = normalized(categorySelect && categorySelect.value);

            cards.forEach(function (card) {
                var target = normalized([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matched = true;

                if (query && target.indexOf(query) === -1) {
                    matched = false;
                }
                if (year && normalized(card.getAttribute('data-year')) !== year) {
                    matched = false;
                }
                if (type && normalized(card.getAttribute('data-type')) !== type) {
                    matched = false;
                }
                if (category && normalized(card.getAttribute('data-category')) !== category) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
            });
        }

        [queryInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }
})();

function initMoviePlayer(options) {
    var video = document.querySelector(options.selector);
    var overlay = document.querySelector(options.overlaySelector);
    var trigger = document.querySelector(options.triggerSelector);
    var source = options.source;
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function startPlayback(event) {
        if (event) {
            event.preventDefault();
        }

        loadSource();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        video.controls = true;

        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (trigger) {
        trigger.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (!loaded) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
