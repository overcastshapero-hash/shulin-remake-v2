/* ============================================================
   m-intro.js — 00 序章(窗口 A,第三轮整改版)
   时序:加载计数(真实预载)→ 红幕上切 → FIRST EDUCATION
        scramble(字符乱码翻动锁定)→ hold 一拍 → 2px 中缝悬念
        → 红幕睁眼退场 → 品牌幕(v2-brand,总装)。
   注:scramble 仅限开场 logo 专用,不进 revealText 三模式契约。
   本 section 不占滚动行程;巨字段拆出为 sections/m-slogan/。
   深链约定:?qa=1 跳过仪式 + 关平滑(无头验证/低配兼容)。
   完成信号:window.__BOOT_DONE = true;事件 'fx:intro:done'。
   ============================================================ */
(function () {
  'use strict';

  var qa = /[?&]qa=1/.test(location.search);
  FX.init({ noSmooth: qa });

  var sec = document.querySelector('.m-intro');
  if (!sec) return;
  function $(s) { return sec.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); }

  var loader = $('.m-intro__loader');
  var countNum = $('.m-intro__count');
  var facts = $$('.m-intro__fact');
  var red = $('.m-intro__red');
  var lidTop = $('.m-intro__red-lid--top');
  var lidBot = $('.m-intro__red-lid--bot');
  var word = $('.m-intro__word');

  /* ---------- 固定 UI(导航/进度数字)点亮 ---------- */
  function chromeOn() {
    document.querySelectorAll('[data-fx-chrome]').forEach(function (el) {
      el.classList.add('is-on');
    });
  }

  function bootDone() {
    window.__BOOT_DONE = true;
    document.dispatchEvent(new CustomEvent('fx:intro:done'));
  }

  /* ---------- wordmark scramble(读屏只读 .fx-sr 原文) ---------- */
  var GLYPHS = 'ABCDEFGHIKLMNOPRSTUVXYZ0123456789#%&';

  function buildWord(el) {
    var text = (el.textContent || '').trim();
    el.textContent = '';
    var sr = document.createElement('span');
    sr.className = 'fx-sr';
    sr.textContent = text;
    el.appendChild(sr);
    var wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    el.appendChild(wrap);
    var spans = [];
    Array.from(text).forEach(function (ch) {
      if (ch === ' ') { wrap.appendChild(document.createTextNode(' ')); return; }
      var s = document.createElement('span');
      s.className = 'm-intro__word-ch';
      s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      s.dataset.ch = ch;
      wrap.appendChild(s);
      spans.push(s);
    });
    return spans;
  }

  function scramble(spans, dur) {
    var proxy = { p: 0 }, frame = 0;
    return gsap.to(proxy, {
      p: 1, duration: dur, ease: 'none',
      onUpdate: function () {
        frame++;
        var locked = Math.floor(proxy.p * spans.length);
        spans.forEach(function (s, i) {
          if (i < locked) s.textContent = s.dataset.ch;
          else if (frame % 3 === 0) s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        });
      },
      onComplete: function () {
        spans.forEach(function (s) { s.textContent = s.dataset.ch; });
      }
    });
  }

  /* ---------- 加载计数(真实预载,tabular-nums 防抖) ---------- */
  function pad3(v) { return String(Math.min(100, Math.floor(v))).padStart(3, '0'); }

  function runLoader() {
    return new Promise(function (done) {
      var items = [
        'font:900 1em "Noto Sans SC"',
        'font:400 1em "Noto Sans SC"',
        'font:900 1em Archivo',
        'font:400 1em "Space Mono"',
        'font:700 1em "Space Mono"'
      ].concat(window.FX_PRELOAD || []);

      var target = 0, shown = 0, ramp = 0;
      var MIN_DUR = 1.2; // 计数仪式下限(秒)
      FX.preload(items, function (p) { target = p * 100; });

      // 事实小字轮换(纵滚)
      var idx = 0, factTimer = null;
      if (facts.length > 1) {
        gsap.set(facts.slice(1), { yPercent: 110 });
        factTimer = setInterval(function () {
          var cur = facts[idx % facts.length];
          var next = facts[(idx + 1) % facts.length];
          gsap.to(cur, { yPercent: -110, duration: 0.5, ease: 'fxContract' });
          gsap.fromTo(next, { yPercent: 110 },
            { yPercent: 0, duration: 0.5, ease: 'fxContract' });
          idx++;
        }, 900);
      }

      var tick = function (time, dt) {
        ramp = Math.min(100, ramp + (dt / 1000) * (100 / MIN_DUR));
        var goal = Math.min(ramp, target);
        shown += (goal - shown) * 0.22;
        countNum.textContent = pad3(shown);
        if (ramp >= 100 && target >= 100 && shown > 99.2) {
          countNum.textContent = '100';
          gsap.ticker.remove(tick);
          if (factTimer) clearInterval(factTimer);
          done();
        }
      };
      gsap.ticker.add(tick);
    });
  }

  /* ---------- 总仪式:计数 → 红幕 scramble → 睁眼 ---------- */
  var SCRAMBLE_DUR = 0.85;
  var HOLD = 0.4;

  function ritual() {
    FX.lock();
    document.documentElement.classList.add('m-intro-ritual');
    window.scrollTo(0, 0);
    // 初始位移只能由 GSAP 设(CSS transform 会被解析成像素残留叠加在 yPercent 上)
    gsap.set(red, { yPercent: 101, autoAlpha: 1 });
    var spans = buildWord(word);

    runLoader().then(function () {
      gsap.timeline()
        .fromTo(red, { yPercent: 101 },
          { yPercent: 0, duration: 0.45, ease: 'fxContract' }, '+=0.12')
        .set(loader, { display: 'none' })
        .to(word, { autoAlpha: 1, duration: 0.18 }, '-=0.08')
        .call(function () { scramble(spans, SCRAMBLE_DUR); })
        .to({}, { duration: SCRAMBLE_DUR + HOLD })            // 翻动锁定 + hold 一拍
        .to(word, { autoAlpha: 0, duration: 0.15 })
        .to(lidTop, { y: -2, duration: 0.1, ease: 'none' }, '<')
        .to(lidBot, { y: 2, duration: 0.1, ease: 'none' }, '<')
        .to({}, { duration: 0.3 })                            // 2px 中缝悬念
        .add('open')
        .to(lidTop, { yPercent: -101, duration: 1.1, ease: 'fxContract' }, 'open')
        .to(lidBot, { yPercent: 101, duration: 1.1, ease: 'fxContract' }, 'open')
        .call(function () {
          FX.unlock();
          chromeOn();
          document.documentElement.classList.remove('m-intro-ritual');
        }, null, 'open+=0.25')
        .set(red, { display: 'none' })
        .call(bootDone);
    });
  }

  /* ---------- 直接显示路径(reduced-motion / ?qa=1) ---------- */
  function skip() {
    sec.classList.add('m-intro--skip');
    FX.unlock();
    chromeOn();
    bootDone();
  }

  if (FX.reduced || qa) skip();
  else ritual();
})();
