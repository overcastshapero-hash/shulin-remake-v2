/* ============================================================
   m-slogan.js — 巨字短幕(窗口 A)
   进视口触发:巨字 drop 逐字落位、副文 rise、行情带淡入起滚。
   依赖 base/fx.js;在 index.html 底部 m-intro.js 之后加载。
   ============================================================ */
(function () {
  'use strict';

  FX.init(); // 幂等

  var sec = document.querySelector('.m-slogan');
  if (!sec) return;
  var title = sec.querySelector('.m-slogan__title');
  var sub = sec.querySelector('.m-slogan__sub');
  var tape = sec.querySelector('.m-slogan__tape');

  FX.ready.then(function () {
    FX.revealText(title, { mode: 'drop', start: 'top 78%' });
    FX.revealText(sub, { mode: 'rise', start: 'top 82%' });
    FX.marquee(tape, { speed: 70, velocity: true });

    if (FX.reduced) return; // 行情带静止、文字已直显
    gsap.fromTo(tape, { autoAlpha: 0 }, {
      autoAlpha: 1, duration: 0.8, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top 60%', once: true }
    });
  });
})();
