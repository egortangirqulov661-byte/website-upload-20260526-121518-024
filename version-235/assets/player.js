(function () {
  function bindPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-mask');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    if (!video || !button || !stream) {
      return;
    }

    function attachStream() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function startPlayback() {
      attachStream();
      player.classList.add('is-playing');
      video.controls = true;

      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    button.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.video-player').forEach(bindPlayer);
})();
