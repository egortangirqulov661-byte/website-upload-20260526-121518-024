(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        initMenu();
        initBackTop();
        initSearchForms();
        initFilters();
        initPlayer();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        window.addEventListener("scroll", function () {
            button.classList.toggle("show", window.scrollY > 420);
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    function initSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var catalog = document.querySelector("[data-catalog]");
        if (!panel || !catalog) {
            return;
        }
        var cards = Array.prototype.slice.call(catalog.querySelectorAll("[data-card]"));
        var search = panel.querySelector("[data-local-search]");
        var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
        var empty = document.querySelector("[data-empty-state]");
        populateSelects(selects, cards);
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && search) {
            search.value = query;
        }
        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : "";
            var filters = {};
            selects.forEach(function (select) {
                filters[select.getAttribute("data-filter")] = select.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                Object.keys(filters).forEach(function (key) {
                    if (filters[key] && card.getAttribute("data-" + key) !== filters[key]) {
                        matched = false;
                    }
                });
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        if (search) {
            search.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    function populateSelects(selects, cards) {
        selects.forEach(function (select) {
            var key = select.getAttribute("data-filter");
            var values = cards.map(function (card) {
                return card.getAttribute("data-" + key) || "";
            }).filter(Boolean);
            var unique = Array.from(new Set(values)).sort(function (a, b) {
                if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                    return Number(b) - Number(a);
                }
                return a.localeCompare(b, "zh-Hans-CN");
            });
            unique.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-play-overlay]");
        var url = player.getAttribute("data-video");
        var loaded = false;
        var hls = null;
        function loadVideo() {
            if (loaded || !video || !url) {
                return;
            }
            loaded = true;
            video.setAttribute("controls", "controls");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = url;
            }
        }
        function play() {
            loadVideo();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
