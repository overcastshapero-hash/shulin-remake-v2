/* v2-brand v3:电影底 + 纯白「树成林」——镂空方案已废(汉字笔画复杂,镂空成脚手架) */
(function () {
  'use strict';
  var sec = document.querySelector('.v2-brand');
  if (!sec) return;
  var stage = sec.querySelector('.v2-brand__stage');
  var row = sec.querySelector('.v2-brand__row');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 背景:整幅成品混剪,压暗作底
  var bg = document.createElement('video');
  bg.className = 'v2-brand__bg';
  bg.muted = true; bg.loop = true; bg.playsInline = true;
  bg.setAttribute('muted', ''); bg.setAttribute('playsinline', '');
  bg.preload = 'auto';
  bg.src = 'sections/m-river/assets/riv-vid-flow.mp4';
  var veil = document.createElement('div');
  veil.className = 'v2-brand__veil';
  stage.insertBefore(veil, stage.firstChild);
  stage.insertBefore(bg, veil);

  // 三个纯白巨字,各自行罩内升起
  var wraps = [];
  ['树', '成', '林'].forEach(function (ch) {
    var w = document.createElement('span');
    w.className = 'v2-brand__chwrap';
    w.innerHTML = '<span class="v2-brand__ch">' + ch + '</span>';
    row.appendChild(w);
    wraps.push(w.firstChild);
  });

  var line = sec.querySelector('.v2-brand__line');
  var sub = sec.querySelector('.v2-brand__sub');
  var mono = sec.querySelector('.v2-brand__mono');

  if (reduced || !window.gsap || !window.ScrollTrigger) {
    sec.classList.add('is-static');
    bg.remove();
    return;
  }

  gsap.set(wraps, { yPercent: 112 }); // 初始位移只准 gsap.set(契约坑#1)

  ScrollTrigger.create({
    trigger: sec, start: 'top 75%', once: true,
    onEnter: function () {
      bg.play().catch(function () {});
      var tl = gsap.timeline();
      tl.to(bg, { autoAlpha: 0.32, duration: 1.8, ease: 'power2.out' }, 0);
      tl.to(wraps, { yPercent: 0, duration: 1.5, stagger: 0.22, ease: 'expo.out' }, 0.25);
      tl.to(line, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, '-=0.45');
      tl.to(sub, { y: 0, duration: 0.9, ease: 'expo.out' }, '-=0.4');
      tl.to(mono, { autoAlpha: 1, duration: 0.5 }, '-=0.25');
    }
  });

  // 视口外暂停背景视频
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) bg.play().catch(function () {});
      else bg.pause();
    });
  }, { rootMargin: '200px' }).observe(sec);
})();
