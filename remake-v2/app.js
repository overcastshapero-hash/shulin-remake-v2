(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var boot = document.getElementById("boot");
  var bootWord = document.getElementById("bootWord");
  var bootCount = document.getElementById("bootCount");
  var bgmAudio = document.getElementById("bgmAudio");
  var bgmToggle = document.getElementById("bgmToggle");
  var dispatchPanel = document.getElementById("dispatchPanel");
  var dispatchType = document.getElementById("dispatchType");
  var dispatchTitle = document.getElementById("dispatchTitle");
  var dispatchCopy = document.getElementById("dispatchCopy");
  var dispatchMedia = document.getElementById("dispatchMedia");
  var dispatchPrimary = document.getElementById("dispatchPrimary");
  var dispatchSecondary = document.getElementById("dispatchSecondary");
  var dispatchButtons = Array.prototype.slice.call(document.querySelectorAll(".dispatch-pill"));
  var qrModal = document.getElementById("qrModal");
  var dispatchVideo = null;

  var missions = {
    web: {
      type: "WEB OUTPUT",
      title: "母亲节祝福网页",
      copy: "一句祝福不该停在聊天框里，而是被交付成一个可以打开、滚动、转发的动态网页。",
      mediaKind: "image",
      mediaSrc: "../sections/m-web/assets/shots/mothers-day-1.jpg",
      mediaAlt: "母亲节祝福网页预览",
      primaryHref: "https://mothers-day-love-2026.netlify.app/",
      primaryLabel: "打开样例",
      secondaryHref: "#web",
      secondaryLabel: "看网站工位"
    },
    video: {
      type: "VIDEO OUTPUT",
      title: "口播音频成片",
      copy: "原始音频进入后，不只是加字幕，而是被整理成节奏、封面、结构完整的可发布视频。",
      mediaKind: "video",
      mediaSrc: "../showcase-assets/video-matrix/zhuning-a.mp4",
      mediaPoster: "../showcase-assets/video-matrix/zhuning-a-poster.jpg",
      primaryHref: "../showcase-assets/video-matrix/zhuning-a-full.mp4",
      primaryLabel: "打开成片",
      secondaryHref: "#video",
      secondaryLabel: "看视频工位"
    },
    identity: {
      type: "PORTRAIT OUTPUT",
      title: "写真合辑海报",
      copy: "人物图不再只是散图收藏，而是被收束成一套可延展、可复用、可继续出海报的视觉身份。",
      mediaKind: "image",
      mediaSrc: "../showcase-assets/sites/photo-orbit/tools/shots/v3-portrait.jpg",
      mediaAlt: "写真合辑海报预览",
      primaryHref: "../showcase-assets/sites/photo-orbit/index.html",
      primaryLabel: "打开写真档案",
      secondaryHref: "#identity",
      secondaryLabel: "看档案工位"
    },
    skills: {
      type: "SKILL OUTPUT",
      title: "群聊变需求单",
      copy: "一串微信聊天会被重新组织成知识库、任务单和下一步动作，而不是继续淹没在消息里。",
      mediaKind: "video",
      mediaSrc: "../sections/m-skill/assets/wechat-kb.mp4",
      mediaPoster: "../sections/m-skill/assets/poster-kb.jpg",
      primaryHref: "../showcase-assets/sites/operationbookbook/index.html",
      primaryLabel: "打开技能站点",
      secondaryHref: "#skills",
      secondaryLabel: "看技能工位"
    }
  };

  [
    "../sections/m-web/assets/shots/file-zero2one.jpg",
    "../sections/m-web/assets/shots/mothers-day-1.jpg",
    "../sections/m-skill/assets/collage-jiangge.jpg",
    "../sections/m-river/assets/cube-02-25ip-live.jpg",
    "../showcase-assets/sites/photo-orbit/tools/shots/v3-portrait.jpg"
  ].forEach(function (src) {
    var img = new Image();
    img.src = src;
  });

  if (!reduce && window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function hideBoot() {
    if (boot) boot.classList.add("is-done");
  }

  function runBoot() {
    if (!boot || reduce) {
      hideBoot();
      return;
    }
    var value = 0;
    var timer = window.setInterval(function () {
      value += value < 72 ? 8 : 4;
      if (value >= 100) {
        value = 100;
        window.clearInterval(timer);
        if (bootWord) bootWord.textContent = "STUDENT AI ARCHIVE";
        window.setTimeout(hideBoot, 420);
      }
      if (bootCount) bootCount.textContent = String(value).padStart(2, "0");
    }, 34);
  }

  runBoot();

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -9% 0px" });

  document.querySelectorAll(".reveal").forEach(function (el, index) {
    el.style.transitionDelay = Math.min(index % 5, 4) * 0.055 + "s";
    revealObserver.observe(el);
  });

  var mediaObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      if (entry.isIntersecting && !reduce) {
        var playAttempt = video.play();
        if (playAttempt && playAttempt.catch) playAttempt.catch(function () {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.28 });

  function observeVideos(root) {
    Array.prototype.slice.call((root || document).querySelectorAll("video")).forEach(function (video) {
      mediaObserver.observe(video);
      video.addEventListener("timeupdate", function () {
        var card = video.closest("[data-bar-host]");
        var bar = card && card.querySelector(".bar em");
        if (bar && video.duration) {
          bar.style.width = Math.min(100, video.currentTime / video.duration * 100) + "%";
        }
      });
    });
  }

  observeVideos(document);

  function renderMission(name) {
    var mission = missions[name];
    if (!mission || !dispatchPanel) return;

    dispatchButtons.forEach(function (button) {
      var active = button.getAttribute("data-mission") === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    dispatchType.textContent = mission.type;
    dispatchTitle.textContent = mission.title;
    dispatchCopy.textContent = mission.copy;
    dispatchPrimary.href = mission.primaryHref;
    dispatchPrimary.textContent = mission.primaryLabel;
    dispatchSecondary.href = mission.secondaryHref;
    dispatchSecondary.textContent = mission.secondaryLabel;

    if (dispatchVideo) {
      dispatchVideo.pause();
      mediaObserver.unobserve(dispatchVideo);
      dispatchVideo = null;
    }

    if (mission.mediaKind === "video") {
      dispatchMedia.innerHTML =
        '<video src="' + mission.mediaSrc + '" poster="' + mission.mediaPoster + '" muted loop playsinline preload="metadata"></video>';
      dispatchVideo = dispatchMedia.querySelector("video");
      mediaObserver.observe(dispatchVideo);
      if (!reduce) {
        var playAttempt = dispatchVideo.play();
        if (playAttempt && playAttempt.catch) playAttempt.catch(function () {});
      }
    } else {
      dispatchMedia.innerHTML = '<img src="' + mission.mediaSrc + '" alt="' + mission.mediaAlt + '">';
    }
  }

  dispatchButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      renderMission(button.getAttribute("data-mission"));
    });
  });

  renderMission("web");

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

  if (qrModal) {
    qrModal.addEventListener("click", function (event) {
      if (event.target === qrModal) qrModal.classList.remove("is-open");
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && qrModal) qrModal.classList.remove("is-open");
  });

  var bgmPlaying = false;
  if (bgmToggle && bgmAudio) {
    bgmToggle.addEventListener("click", function () {
      if (bgmPlaying) {
        bgmAudio.pause();
        bgmToggle.setAttribute("aria-pressed", "false");
        bgmToggle.textContent = "MUSIC";
      } else {
        var playPromise = bgmAudio.play();
        if (playPromise && playPromise.catch) playPromise.catch(function () {});
        bgmToggle.setAttribute("aria-pressed", "true");
        bgmToggle.textContent = "ON";
      }
      bgmPlaying = !bgmPlaying;
    });
  }
})();
