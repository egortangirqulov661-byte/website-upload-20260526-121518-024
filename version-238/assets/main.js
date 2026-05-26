(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero__slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  function startPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.play-cover');

    if (!video) {
      return;
    }

    var url = video.getAttribute('data-src');

    if (url && !video.getAttribute('src')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(function (box) {
    var cover = box.querySelector('.play-cover');
    var video = box.querySelector('video');

    if (cover) {
      cover.addEventListener('click', function () {
        startPlayer(box);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startPlayer(box);
      });
    }
  });
})();
