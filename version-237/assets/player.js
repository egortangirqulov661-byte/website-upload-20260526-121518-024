(function () {
    const player = document.querySelector("[data-player]");
    if (!player) {
        return;
    }

    const video = player.querySelector("video");
    const button = player.querySelector("[data-play-button]");
    let initialized = false;
    let hlsInstance = null;

    async function resolveHls() {
        if (window.Hls) {
            return window.Hls;
        }
        try {
            const module = await import("./hls-dru42stk.js");
            return module.H;
        } catch (error) {
            return null;
        }
    }

    async function setup() {
        if (!video || initialized) {
            return;
        }
        initialized = true;
        const source = video.dataset.stream || video.querySelector("source")?.getAttribute("src") || "";
        if (!source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        const Hls = await resolveHls();
        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
        } else {
            video.src = source;
        }
    }

    async function play() {
        await setup();
        if (button) {
            button.classList.add("is-hidden");
        }
        try {
            await video.play();
        } catch (error) {
            if (button) {
                button.classList.remove("is-hidden");
            }
        }
    }

    if (button) {
        button.addEventListener("click", play);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
