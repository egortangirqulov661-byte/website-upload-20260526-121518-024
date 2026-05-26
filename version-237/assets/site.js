(function () {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });

        show(0);
        start();
    }

    const filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
        const input = filterPanel.querySelector("[data-filter-input]");
        const clear = filterPanel.querySelector("[data-filter-clear]");
        const chips = Array.from(filterPanel.querySelectorAll("[data-filter-value]"));
        const cards = Array.from(document.querySelectorAll("[data-card]"));
        const empty = document.querySelector("[data-empty-state]");
        let active = "all";

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardText(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.category,
                card.dataset.genre,
                card.dataset.tags
            ].join(" ").toLowerCase();
        }

        function apply() {
            const query = normalize(input ? input.value : "");
            let visible = 0;
            cards.forEach(function (card) {
                const inCategory = active === "all" || card.dataset.category === active;
                const inSearch = !query || cardText(card).includes(query);
                const shouldShow = inCategory && inSearch;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                active = chip.dataset.filterValue || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                apply();
            });
        });

        if (input) {
            input.addEventListener("input", apply);
        }

        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                active = "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item.dataset.filterValue === "all");
                });
                apply();
            });
        }

        apply();
    }

    const searchResults = document.querySelector("[data-search-results]");
    if (searchResults && Array.isArray(window.SITE_MOVIE_INDEX)) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";
        const input = document.querySelector("[data-search-page-input]");
        const empty = document.querySelector("[data-search-empty]");

        if (input) {
            input.value = q;
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;"
                }[char];
            });
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function render(items) {
            searchResults.innerHTML = items.map(function (item) {
                const tags = item.tags.slice(0, 3).map(function (tag) {
                    return "<span>#" + escapeHtml(tag) + "</span>";
                }).join("");
                return "<article class=\"movie-card compact\">" +
                    "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\">" +
                    "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
                    "<span class=\"play-dot\">▶</span>" +
                    "</a>" +
                    "<div class=\"card-body\">" +
                    "<div class=\"card-tags\">" + tags + "</div>" +
                    "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
                    "<p>" + escapeHtml(item.description) + "</p>" +
                    "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
                    "</div>" +
                    "</article>";
            }).join("");
        }

        const needle = normalize(q);
        if (!needle) {
            searchResults.innerHTML = "";
            if (empty) {
                empty.classList.add("show");
            }
        } else {
            const results = window.SITE_MOVIE_INDEX.filter(function (item) {
                return normalize([
                    item.title,
                    item.description,
                    item.region,
                    item.type,
                    item.year,
                    item.category,
                    item.genre,
                    item.tags.join(" ")
                ].join(" ")).includes(needle);
            });
            render(results.slice(0, 240));
            if (empty) {
                empty.textContent = results.length ? "" : "没有匹配的影片";
                empty.classList.toggle("show", results.length === 0);
            }
        }
    }

    const scrollButton = document.querySelector("[data-scroll-player]");
    if (scrollButton) {
        scrollButton.addEventListener("click", function () {
            const player = document.querySelector("[data-player]");
            if (player) {
                player.scrollIntoView({ behavior: "smooth", block: "center" });
                const button = document.querySelector("[data-play-button]");
                if (button) {
                    button.click();
                }
            }
        });
    }

    const shareButton = document.querySelector("[data-share-title]");
    if (shareButton) {
        shareButton.addEventListener("click", function () {
            const shareData = {
                title: shareButton.dataset.shareTitle || document.title,
                url: window.location.href
            };
            if (navigator.share) {
                navigator.share(shareData).catch(function () {});
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href).catch(function () {});
            }
        });
    }
})();
