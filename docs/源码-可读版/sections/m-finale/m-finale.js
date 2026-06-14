/* ============================================================
   m-finale.js — 06 终幕「未完待续」(窗口 D 产出)
   入屏一次性时间线(非 scrub):
   ① 残流图块飞散退场 ② 白色字符从随机散点(x±400,y±300,
   rot±60)飞拢锁定成口号 ③ mono 落款 ④「未完待续」逐字 drop
   ⑤ 红球从左入场,在四字头顶依次弹跳(squash & stretch,
   字被砸得下沉回弹),弹过「续」落成省略号第一个点,后两点
   逐个亮起,整组 0.4↔1 呼吸循环——永远停在"还没完"。
   reduced-motion:直接显示「未完待续 · · ·」。
   QA 钩子:window.__finaleSettle() 跳到终态。
   ============================================================ */
(function () {
  'use strict';

  FX.init(); // 幂等

  var sec = document.querySelector('.m-finale');
  if (!sec) return;

  var slogan = document.getElementById('finSlogan');
  var sign = document.getElementById('finSign');
  var tbc = document.getElementById('finTbc');
  var tbcChars = Array.prototype.slice.call(sec.querySelectorAll('.m-finale__tbc-char'));
  var dots = Array.prototype.slice.call(sec.querySelectorAll('.m-finale__dots i'));
  var ball = document.getElementById('finBall');
  var ghosts = Array.prototype.slice.call(sec.querySelectorAll('.m-finale__ghost'));

  /* ---------- 版权带:♪ 点播 + 回顶(动效路径之外,先挂好) ---------- */
  var audio = document.getElementById('finAudio');
  var songBtn = document.getElementById('finSong');
  songBtn.addEventListener('click', function () {
    if (audio.paused) {
      audio.volume = 0.85;
      audio.play().then(function () { songBtn.setAttribute('aria-pressed', 'true'); })
        .catch(function () {});
    } else {
      audio.pause();
      songBtn.setAttribute('aria-pressed', 'false');
    }
  });
  document.getElementById('finTop').addEventListener('click', function () {
    if (FX.lenis) FX.lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: FX.reduced ? 'auto' : 'smooth' });
  });

  /* ---------- reduced-motion:直接显示终态 ---------- */
  if (FX.reduced) {
    sec.classList.add('m-finale--static');
    sec.querySelectorAll('.fx-hide').forEach(function (el) { el.classList.remove('fx-hide'); });
    return;
  }

  /* ---------- 章节小字进场 ---------- */
  FX.ready.then(function () {
    FX.revealText(sec.querySelector('.m-finale__kicker'), { mode: 'rise', start: 'top 80%' });
  });

  /* ---------- 红球一跳(落地压扁/起跳拉长 + 字被砸下沉回弹) ---------- */
  function hop(tl, t, from, to, apexY, dur, smashChar) {
    tl.to(ball, { x: to.x, duration: dur, ease: 'none' }, t);
    tl.to(ball, { y: apexY, duration: dur * 0.45, ease: 'power2.out' }, t);
    tl.to(ball, { y: to.y, duration: dur * 0.55, ease: 'power2.in' }, t + dur * 0.45);
    /* 起跳拉长 → 落地压扁 → 回弹 */
    tl.to(ball, { scaleY: 1.15, scaleX: 0.9, duration: dur * 0.3, ease: 'none' }, t);
    tl.to(ball, { scaleY: 1, scaleX: 1, duration: dur * 0.3, ease: 'none' }, t + dur * 0.35);
    tl.to(ball, { scaleY: 0.7, scaleX: 1.25, duration: 0.09, ease: 'none' }, t + dur - 0.02);
    tl.to(ball, { scaleY: 1, scaleX: 1, duration: 0.16, ease: 'fxContract' }, t + dur + 0.08);
    if (smashChar) {
      tl.to(smashChar, { yPercent: 6, duration: 0.1, ease: 'none' }, t + dur);
      tl.to(smashChar, { yPercent: 0, duration: 0.22, ease: 'fxContract' }, t + dur + 0.1);
    }
    return t + dur;
  }

  /* ---------- 主时间线(字体就绪后量位建线,入屏一次性播放) ---------- */
  FX.ready.then(function () {
    var split = FX.split(slogan, { lines: false, chars: true });

    /* 初始态:全部藏好(visibility 级,不破坏测量) */
    gsap.set(split.chars, { autoAlpha: 0 });
    gsap.set(tbcChars, { autoAlpha: 0 });
    gsap.set(ball, { transformOrigin: '50% 100%' });

    var master = gsap.timeline({ paused: true, onComplete: breathe });

    /* ① 残流图块飞散退场 */
    ghosts.forEach(function (g, i) {
      var dx = (i % 2 ? 1 : -1) * gsap.utils.random(220, 420);
      master.to(g, {
        x: dx, y: gsap.utils.random(-260, 260), rotation: gsap.utils.random(-18, 18),
        autoAlpha: 0, scale: 0.7, duration: 0.9, ease: 'fxContract'
      }, 0);
    });

    /* ② 字符从随机散点飞拢锁定 */
    master.fromTo(split.chars,
      {
        x: function () { return gsap.utils.random(-400, 400); },
        y: function () { return gsap.utils.random(-300, 300); },
        rotation: function () { return gsap.utils.random(-60, 60); },
        autoAlpha: 0
      },
      {
        x: 0, y: 0, rotation: 0, autoAlpha: 1,
        duration: 1.1, ease: 'fxContract', stagger: 0.05
      }, 0.1);

    /* ③ mono 落款 */
    master.add(FX.revealText(sign, { mode: 'rise', trigger: 'manual' }).play(), 1.5);

    /* ④「未完待续」逐字 drop 落位 */
    master.fromTo(tbcChars,
      { yPercent: -160, autoAlpha: 0, rotation: function () { return gsap.utils.random(-8, 8); }, transformOrigin: '50% 100%' },
      { yPercent: 0, autoAlpha: 1, rotation: 0, duration: 0.7, ease: 'fxContract', stagger: 0.09 }, 2.1);

    /* ⑤ 红球蹦跳:量四字与省略号第一点的位置(容器坐标) */
    var contRect = tbc.getBoundingClientRect();
    var ballW = ball.offsetWidth, ballH = ball.offsetHeight;
    function topOf(el, gap) {
      var r = el.getBoundingClientRect();
      return {
        x: r.left - contRect.left + r.width / 2 - ballW / 2,
        y: r.top - contRect.top - ballH - (gap || 8)
      };
    }
    var marks = tbcChars.map(function (c) { return topOf(c); });
    var d0 = dots[0].getBoundingClientRect();
    var rest = {
      x: d0.left - contRect.left + d0.width / 2 - ballW / 2,
      y: d0.top - contRect.top + (d0.height - ballH) / 2
    };
    gsap.set(dots[0], { visibility: 'hidden' });   /* 第一点由红球本体充当 */

    var t = 3.1;
    master.set(ball, { x: marks[0].x - 260, y: marks[0].y - 200, autoAlpha: 1 }, t);
    t = hop(master, t, null, marks[0], marks[0].y - 200, 0.55, tbcChars[0]);            /* 入场落在「未」 */
    for (var i = 1; i < 4; i++) {
      var apex = Math.min(marks[i - 1].y, marks[i].y) - 110;
      t = hop(master, t + 0.05, null, marks[i], apex, 0.5, tbcChars[i]);                 /* 未→完→待→续 */
    }
    t = hop(master, t + 0.05, null, rest, marks[3].y - 90, 0.5, null);                   /* 弹过「续」落成第一点 */

    /* 后两点逐个亮起 */
    master.to(dots[1], { autoAlpha: 1, duration: 0.3, ease: 'fxContract' }, t + 0.25);
    master.to(dots[2], { autoAlpha: 1, duration: 0.3, ease: 'fxContract' }, t + 0.55);

    /* 终态呼吸:永远停在"还没完" */
    function breathe() {
      gsap.to([ball, dots[1], dots[2]], {
        opacity: 0.4, duration: 1.2, ease: 'sine.inOut',
        repeat: -1, yoyo: true, stagger: 0.15
      });
    }

    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', once: true,
      onEnter: function () { master.play(); }
    });

    /* QA 钩子:跳到终态 */
    window.__finaleSettle = function () { master.progress(1); };
  });
})();
