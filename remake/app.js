(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var boot = document.getElementById("boot");
  var progressNum = document.getElementById("progressNum");
  var guidePreview = document.getElementById("guidePreview");
  var workPreview = document.getElementById("workPreview");
  var qrModal = document.getElementById("qrModal");
  var song = document.getElementById("song");
  var musicBtn = document.getElementById("musicBtn");
  var videos = Array.prototype.slice.call(document.querySelectorAll("video"));

  window.addEventListener("load", function () {
    setTimeout(function () {
      if (boot) boot.classList.add("is-done");
    }, 420);
  });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -7% 0px" });

  document.querySelectorAll(".reveal").forEach(function (el, index) {
    el.style.transitionDelay = Math.min(index % 7, 6) * 0.045 + "s";
    revealObserver.observe(el);
  });

  var mediaObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      if (entry.isIntersecting && !reduce) {
        var play = video.play();
        if (play && play.catch) play.catch(function () {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.28 });

  videos.forEach(function (video) {
    if (video !== song) mediaObserver.observe(video);
  });

  document.querySelectorAll(".guide-list li").forEach(function (item) {
    item.addEventListener("mouseenter", function () {
      var src = item.getAttribute("data-preview");
      if (src && guidePreview) guidePreview.src = src;
    });
  });

  document.querySelectorAll(".work-index li").forEach(function (item) {
    item.addEventListener("mouseenter", function () {
      var src = item.getAttribute("data-shot");
      if (src && workPreview) workPreview.src = src;
    });
  });

  document.querySelectorAll("[data-open-qr]").forEach(function (button) {
    button.addEventListener("click", function () {
      qrModal.classList.add("is-open");
    });
  });

  document.querySelectorAll("[data-close-qr]").forEach(function (button) {
    button.addEventListener("click", function () {
      qrModal.classList.remove("is-open");
    });
  });

  qrModal.addEventListener("click", function (event) {
    if (event.target === qrModal) qrModal.classList.remove("is-open");
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") qrModal.classList.remove("is-open");
  });

  function toggleSong(button) {
    if (!song) return;
    if (song.paused) {
      song.volume = 0.45;
      var play = song.play();
      if (play && play.catch) play.catch(function () {});
      if (button) button.textContent = "PAUSE";
      if (musicBtn) musicBtn.textContent = "♪ ON";
    } else {
      song.pause();
      if (button) button.textContent = "PLAY";
      if (musicBtn) musicBtn.textContent = "♪ MUSIC";
    }
  }

  document.querySelectorAll("[data-play-song]").forEach(function (button) {
    button.addEventListener("click", function () { toggleSong(button); });
  });
  if (musicBtn) musicBtn.addEventListener("click", function () { toggleSong(null); });

  var lastProgress = -1;
  function progressLoop() {
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var pct = Math.max(0, Math.min(1, window.scrollY / max));
    var rounded = Math.round(pct * 1000) / 1000;
    if (rounded !== lastProgress) {
      lastProgress = rounded;
      if (progressNum) progressNum.textContent = String(Math.round(pct * 100)).padStart(3, "0");
    }
    requestAnimationFrame(progressLoop);
  }
  progressLoop();
})();
