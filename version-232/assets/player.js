function initMoviePlayer(videoId, coverId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  if (!video || !cover || !sourceUrl) {
    return;
  }

  var loaded = false;
  var hlsInstance = null;

  function attachSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playVideo() {
    attachSource();
    cover.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  cover.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
