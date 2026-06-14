/* ============================================================
   fx.js — 全站动效组件库(窗口 A 产出,接口稳定,勿改)
   依赖(先于本文件以普通 <script> 加载):
     base/vendor/gsap.min.js  base/vendor/ScrollTrigger.min.js
     base/vendor/lenis.min.js
   暴露:window.FX
     FX.init(opts?)            初始化 Lenis+ScrollTrigger 桥(幂等)
     FX.reduced                prefers-reduced-motion 布尔
     FX.lenis                  Lenis 实例(reduced/noSmooth 时为 null)
     FX.ready                  Promise:字体就绪
     FX.lock()/FX.unlock()     仪式期间锁/放滚动
     FX.split(el, opts?)       文字拆分(CJK 感知),返回 {lines,chars,revert}
     FX.revealText(el, opts?)  文字进场,mode: rise|drop|roll
     FX.curtain.hard(opts?)    黑白幕硬切(0ms 落 / 150ms 揭)
     FX.curtain.eyelid(opts?)  睁眼幕(2px 中缝 0.3s → 上下退场,共 1.4s)
     FX.marquee(el, opts?)     无限横向跑马灯,滚速联动
     FX.preload(items, onProg) 真实预载(图片 decode + 字体),返回 Promise
   动效铁律:只动 transform/opacity;缓动用 'fxContract'
   (= cubic-bezier(.16,1,.3,1),CSS 侧用 var(--fx-ease))。
   ============================================================ */
(function () {
  'use strict';
  if (window.FX) return;

  var FX = (window.FX = {});
  FX.EASE_CSS = 'cubic-bezier(.16,1,.3,1)';
  FX.COLORS = { k: '#000000', w: '#FFFFFF', g: '#8A8A8A', r: '#E32B16' };

  /* ---------- cubic-bezier 求解器:注册全站唯一缓动 ---------- */
  function cubicBezier(p1x, p1y, p2x, p2y) {
    var cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
    var cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    function solve(x) {
      var t = x, i, x2, d;
      for (i = 0; i < 8; i++) {
        x2 = sx(t) - x;
        if (Math.abs(x2) < 1e-6) return t;
        d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= x2 / d;
      }
      var lo = 0, hi = 1;
      t = x;
      while (lo < hi) {
        x2 = sx(t);
        if (Math.abs(x2 - x) < 1e-6) return t;
        if (x > x2) lo = t; else hi = t;
        t = (lo + hi) / 2;
        if (hi - lo < 1e-6) break;
      }
      return t;
    }
    return function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)); };
  }

  var doc = document.documentElement;
  FX.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resolve(el) { return typeof el === 'string' ? document.querySelector(el) : el; }

  /* ---------- FX.init ---------- */
  var inited = false;
  FX.lenis = null;
  FX.init = function (opts) {
    if (inited) return FX;
    inited = true;
    opts = opts || {};

    gsap.registerPlugin(ScrollTrigger);
    gsap.registerEase('fxContract', cubicBezier(0.16, 1, 0.3, 1));
    gsap.defaults({ ease: 'fxContract', duration: 1 });
    ScrollTrigger.config({ ignoreMobileResize: true });

    doc.classList.add(FX.reduced ? 'fx-reduced' : 'fx-motion');

    if (!FX.reduced && !opts.noSmooth && window.Lenis) {
      FX.lenis = new Lenis({ lerp: 0.12 }); // 修订单-01 节奏令:lerp 0.1→0.12
      FX.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { FX.lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    FX.ready = (document.fonts && document.fonts.ready)
      ? document.fonts.ready.then(function () { ScrollTrigger.refresh(); })
      : Promise.resolve();

    return FX;
  };

  FX.lock = function () { if (FX.lenis) FX.lenis.stop(); doc.classList.add('fx-locked'); };
  FX.unlock = function () { if (FX.lenis) FX.lenis.start(); doc.classList.remove('fx-locked'); };

  /* ---------- FX.split 文字拆分(CJK 感知) ----------
     拉丁字母按词包裹(词内不折行),CJK 每字成词(允许字间折行);
     lines:true 时按 offsetTop 分组包行罩(.fx-line > .fx-line__in)。
     调用前确保字体已就绪(await FX.ready),否则行分组会漂。 */
  var CJK = /[⺀-鿿豈-﫿＀-￯　-〿]/;

  FX.split = function (el, opts) {
    el = resolve(el);
    opts = opts || {};
    var wantLines = opts.lines !== false;
    var wantChars = !!opts.chars;
    var origin = el.innerHTML;
    // 读屏:注入视觉隐藏原文(aria-label 在裸 div/p 上不合法),拆分结构整体 aria-hidden
    var label = (el.textContent || '').replace(/\s+/g, ' ').trim();

    // 1) 文本节点 → fx-word(/fx-char)
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var textNodes = [], n;
    while ((n = walker.nextNode())) { if (n.nodeValue.trim()) textNodes.push(n); }

    var words = [], chars = [];
    textNodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      var tokens = node.nodeValue.match(/(\s+|[⺀-鿿豈-﫿＀-￯　-〿]|[^\s⺀-鿿豈-﫿＀-￯　-〿]+)/g) || [];
      tokens.forEach(function (tok) {
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span');
        w.className = 'fx-word';
        w.setAttribute('aria-hidden', 'true');
        if (wantChars) {
          Array.from(tok).forEach(function (ch) {
            var c = document.createElement('span');
            c.className = 'fx-char';
            c.textContent = ch;
            w.appendChild(c);
            chars.push(c);
          });
        } else {
          w.textContent = tok;
        }
        frag.appendChild(w);
        words.push(w);
      });
      node.parentNode.replaceChild(frag, node);
    });

    // 2) 行分组:同父且 offsetTop 相近的连续词包进行罩
    var lines = [], lineWraps = [];
    if (wantLines && words.length) {
      var groups = [], cur = null;
      words.forEach(function (w) {
        var top = Math.round(w.offsetTop / 4) * 4;
        if (cur && cur.parent === w.parentNode && Math.abs(cur.top - top) < 4) {
          cur.items.push(w);
        } else {
          cur = { parent: w.parentNode, top: top, items: [w] };
          groups.push(cur);
        }
      });
      groups.forEach(function (g) {
        var wrap = document.createElement('span');
        wrap.className = 'fx-line';
        var inner = document.createElement('span');
        inner.className = 'fx-line__in';
        wrap.appendChild(inner);
        g.parent.insertBefore(wrap, g.items[0]);
        // 连同词间空格文本节点一起搬进行内
        var node = g.items[0], last = g.items[g.items.length - 1];
        while (node) {
          var next = node.nextSibling;
          inner.appendChild(node);
          if (node === last) break;
          node = next;
        }
        lineWraps.push(wrap);
        lines.push(inner);
      });
    }

    if (label) {
      var sr = document.createElement('span');
      sr.className = 'fx-sr';
      sr.textContent = label;
      el.insertBefore(sr, el.firstChild);
    }

    return {
      el: el, words: words, chars: chars, lines: lines, lineWraps: lineWraps,
      revert: function () { el.innerHTML = origin; }
    };
  };

  /* ---------- FX.revealText 全站唯一文字进场 ----------
     mode:
       rise — 行罩升起(yPercent 100→0,stagger .08)       标题
       drop — 逐字掉落(yPercent -140→0,±8° 微旋,stagger .035) Hero/章节卡
       roll — 字符纵滚 slot-machine(220→110→0,stagger .02 random)清单行
     opts: { mode, delay, stagger, trigger:'visible'|'manual',
             start:'top 88%', keep:false }
     返回 gsap.timeline;'manual' 时为 paused,自行 .play()。
     完成后自动 revert 拆分结构(keep:true 保留)。 */
  FX.revealText = function (el, opts) {
    el = resolve(el);
    opts = opts || {};
    var mode = opts.mode || 'rise';
    el.classList.remove('fx-hide');

    if (FX.reduced || !el) return gsap.timeline();

    var split = FX.split(el, { lines: true, chars: mode !== 'rise' });
    var tl = gsap.timeline({
      paused: true,
      delay: opts.delay || 0,
      onComplete: function () {
        if (!opts.keep) split.revert();
        else gsap.set(mode === 'rise' ? split.lines : split.chars, { clearProps: 'transform' });
      }
    });

    if (mode === 'rise') {
      tl.fromTo(split.lines,
        { yPercent: 101 },
        { yPercent: 0, duration: 1.1, ease: 'fxContract', stagger: opts.stagger != null ? opts.stagger : 0.08 });
    } else if (mode === 'drop') {
      tl.fromTo(split.chars,
        { yPercent: -140, rotation: function () { return gsap.utils.random(-8, 8); }, transformOrigin: '50% 100%' },
        { yPercent: 0, rotation: 0, duration: 0.9, ease: 'fxContract', stagger: opts.stagger != null ? opts.stagger : 0.035 });
    } else if (mode === 'roll') {
      tl.fromTo(split.chars,
        { yPercent: 220 },
        {
          keyframes: { yPercent: [220, 110, 0], easeEach: 'power1.out' },
          duration: 0.55, ease: 'fxContract',
          stagger: { each: opts.stagger != null ? opts.stagger : 0.02, from: 'random' }
        });
    }

    if (opts.trigger === 'manual') return tl;

    ScrollTrigger.create({
      trigger: el,
      start: opts.start || 'top 88%',
      once: true,
      onEnter: function () { tl.play(); }
    });
    return tl;
  };

  /* ---------- FX.curtain 章节幕 ---------- */
  function curtainCard(num, title) {
    var card = document.createElement('div');
    card.className = 'fx-curtain__card';
    card.innerHTML =
      '<span class="fx-curtain__num">' + num + '</span>' +
      '<span class="fx-curtain__dash">—</span>' +
      '<span class="fx-curtain__title">' + title + '</span>';
    return card;
  }

  FX.curtain = {
    /* 黑白幕硬切:0ms 落下 → 章节卡 → 150ms 揭开。
       opts: { num:'01', title:'写真', theme:'dark'|'light',
               hold:0.55, onCover:fn }   返回 timeline */
    hard: function (opts) {
      opts = opts || {};
      var theme = opts.theme || 'dark';
      var hold = opts.hold != null ? opts.hold : 0.55;
      if (FX.reduced) {
        if (opts.onCover) opts.onCover();
        return gsap.timeline();
      }
      var node = document.createElement('div');
      node.className = 'fx-curtain fx-curtain--hard fx-curtain--' + theme;
      var card = curtainCard(opts.num || '01', opts.title || '');
      node.appendChild(card);
      document.body.appendChild(node);

      var tl = gsap.timeline({ onComplete: function () { node.remove(); } });
      tl.set(node, { autoAlpha: 1 })                                   // 0ms 落下
        .call(function () { if (opts.onCover) opts.onCover(); })
        .fromTo(card, { autoAlpha: 0, yPercent: 40 },
          { autoAlpha: 1, yPercent: 0, duration: 0.35, ease: 'fxContract' }, 0.05)
        .to(node, { yPercent: -101, duration: 0.15, ease: 'none' }, 0.05 + hold); // 150ms 揭开
      return tl;
    },

    /* 睁眼幕(大章用):盖住 → 露 2px 中缝悬念 0.3s → 上下各自退场,
       总时长 1.4s。opts: { num,title,theme,onCover:fn }  返回 timeline */
    eyelid: function (opts) {
      opts = opts || {};
      var theme = opts.theme || 'dark';
      if (FX.reduced) {
        if (opts.onCover) opts.onCover();
        return gsap.timeline();
      }
      var node = document.createElement('div');
      node.className = 'fx-curtain fx-curtain--eyelid fx-curtain--' + theme;
      var top = document.createElement('div');
      top.className = 'fx-curtain__lid fx-curtain__lid--top';
      var bot = document.createElement('div');
      bot.className = 'fx-curtain__lid fx-curtain__lid--bot';
      node.appendChild(top); node.appendChild(bot);
      if (opts.num) {
        var card = curtainCard(opts.num, opts.title || '');
        top.appendChild(card);
        card.style.position = 'absolute';
        card.style.left = 'var(--fx-pad)';
        card.style.bottom = '24px';
      }
      document.body.appendChild(node);

      var tl = gsap.timeline({ onComplete: function () { node.remove(); } });
      tl.set(node, { autoAlpha: 1 })
        .call(function () { if (opts.onCover) opts.onCover(); })
        .to({}, { duration: 0.3 })                                    // 2px 中缝悬念
        .to(top, { yPercent: -101, duration: 1.1, ease: 'fxContract' }, 0.3)
        .to(bot, { yPercent: 101, duration: 1.1, ease: 'fxContract' }, 0.3);
      return tl;
    }
  };

  /* ---------- FX.marquee 无限横向跑马灯 ----------
     el 的子内容作为一节(chunk),复制至 ≥2 倍容器宽,
     track translateX 0→-50% 线性循环。
     opts: { speed:60(px/s), velocity:true 滚速联动, gap:'3em' }
     返回 { timeline, destroy } */
  FX.marquee = function (el, opts) {
    el = resolve(el);
    opts = opts || {};
    el.classList.add('fx-marquee');

    var track = document.createElement('div');
    track.className = 'fx-marquee__track';
    track.setAttribute('aria-hidden', 'true');
    var chunk = document.createElement('div');
    chunk.className = 'fx-marquee__chunk';
    if (opts.gap) chunk.style.paddingRight = opts.gap;
    while (el.firstChild) chunk.appendChild(el.firstChild);
    track.appendChild(chunk);
    el.appendChild(track);
    var sr = document.createElement('span');
    sr.className = 'fx-sr';
    sr.textContent = (chunk.textContent || '').replace(/\s+/g, ' ').trim();
    el.appendChild(sr);

    if (FX.reduced) return { timeline: null, destroy: function () {} };

    var cw = chunk.offsetWidth || 1;
    var copies = Math.max(1, Math.ceil(el.offsetWidth / cw)) * 2;
    for (var i = 1; i < copies; i++) track.appendChild(chunk.cloneNode(true));

    var speed = opts.speed || 60; // px/s
    var tl = gsap.to(track, {
      xPercent: -50, duration: (cw * copies / 2) / speed,
      ease: 'none', repeat: -1
    });

    var st = null, tick = null;
    if (opts.velocity !== false) {
      var vel = 0;
      st = ScrollTrigger.create({ onUpdate: function (self) { vel = self.getVelocity(); } });
      tick = function () {
        vel += (0 - vel) * 0.08;
        var dir = vel < -60 ? -1 : 1;
        var target = dir * (1 + Math.min(3, Math.abs(vel) / 500));
        tl.timeScale(tl.timeScale() + (target - tl.timeScale()) * 0.12);
      };
      gsap.ticker.add(tick);
    }

    return {
      timeline: tl,
      destroy: function () {
        tl.kill();
        if (st) st.kill();
        if (tick) gsap.ticker.remove(tick);
      }
    };
  };

  /* ---------- FX.preload 真实预载 ----------
     items: 字符串数组 — 图片 URL,或 'font:900 1em "Noto Sans SC"'。
     其他窗口可在 m-intro.js 执行前 push 进 window.FX_PRELOAD。
     onProgress(0..1) 逐项回调;返回 Promise(单项失败不阻塞)。 */
  FX.preload = function (items, onProgress) {
    items = items || [];
    var total = items.length, done = 0;
    if (!total) { if (onProgress) onProgress(1); return Promise.resolve(); }
    function step() { done++; if (onProgress) onProgress(done / total); }
    return Promise.all(items.map(function (item) {
      var p;
      if (/^font:/.test(item)) {
        p = (document.fonts && document.fonts.load)
          ? document.fonts.load(item.slice(5)) : Promise.resolve();
      } else {
        var img = new Image();
        img.src = item;
        p = img.decode ? img.decode() : new Promise(function (res) {
          img.onload = res; img.onerror = res;
        });
      }
      return p.catch(function () {}).then(step);
    })).then(function () {});
  };
})();
