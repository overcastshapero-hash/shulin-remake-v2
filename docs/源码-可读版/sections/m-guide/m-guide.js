/* ============================================================
   m-guide.js — 树成林 · 学生使用指南(窗口 A,全站总目录)
   - pin 180vh(≤200vh 契约),行随 pin 进度分批 roll 进场,
     快滚直接全亮;通读约 8–12 秒。
   - 行点击:现量目标 offsetTop(并行注入会改文档高度,禁缓存),
     FX.lenis.scrollTo 平滑跳转;无 lenis 时原生跳。
   - hover:整行反白(CSS)+ 右侧固定预览换图(不跟鼠标)。
   - reduced-motion:静态列表,无 pin 无预览。
   依赖 base/fx.js;在 index.html 底部 m-intro.js 之后加载。
   ============================================================ */
(function () {
  'use strict';

  FX.init(); // 幂等

  var sec = document.querySelector('.m-guide');
  if (!sec) return;
  var rows = Array.prototype.slice.call(sec.querySelectorAll('.m-guide__row'));
  var peek = sec.querySelector('.m-guide__peek');
  var peekImg = peek ? peek.querySelector('img') : null;

  /* ---------- 点击跳转(现量 offsetTop) ---------- */
  function jump(row) {
    var el = document.querySelector(row.dataset.target)
      || document.querySelector('section[data-chapter="' + row.dataset.chapter + '"]');
    if (!el) return;
    var y = el.getBoundingClientRect().top
      + (FX.lenis ? FX.lenis.scroll : window.scrollY);
    if (FX.lenis) FX.lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo(0, y);
  }

  rows.forEach(function (row) {
    row.addEventListener('click', function (e) {
      e.preventDefault();
      jump(row);
    });
    row.addEventListener('mouseenter', function () {
      if (!peekImg || FX.reduced) return;
      peekImg.src = row.dataset.img;
      peek.classList.add('is-on');
    });
    row.addEventListener('mouseleave', function () {
      if (peek) peek.classList.remove('is-on');
    });
  });

  /* ---------- 进场:章头 rise,行随 pin 进度 roll ---------- */
  if (FX.reduced) {
    sec.querySelectorAll('.fx-hide').forEach(function (el) {
      el.classList.remove('fx-hide');
    });
    return;
  }

  FX.ready.then(function () {
    var revealed = 0;
    var reveals = rows.map(function (row) {
      return FX.revealText(row, { mode: 'roll', trigger: 'manual' });
    });

    function revealTo(n) {
      while (revealed < n && revealed < reveals.length) {
        reveals[revealed].play();
        revealed++;
      }
    }

    ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: '+=180%',
      pin: true,
      onEnter: function () {
        FX.revealText(sec.querySelector('.m-guide__kicker'), { mode: 'rise', trigger: 'manual' }).play();
        FX.revealText(sec.querySelector('.m-guide__title'), { mode: 'rise', trigger: 'manual' }).play();
        FX.revealText(sec.querySelector('.m-guide__sub'), { mode: 'rise', trigger: 'manual' }).play();
        revealTo(2); // 进章先亮前两行
      },
      onUpdate: function (self) {
        revealTo(Math.ceil(self.progress * reveals.length) + 1);
      },
      onLeave: function () { revealTo(reveals.length); },     // 快滚直接全亮
      onEnterBack: function () { revealTo(reveals.length); }  // 回看不再重播
    });
  });
})();
