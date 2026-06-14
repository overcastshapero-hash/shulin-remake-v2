/* ============================================================
   m-web.js — 02 作品(窗口 B 产出,修订单-02 整改版)
   B1 SHIPPED 字母分隔带(60vh)→ SLOTS 精选 live 大位
   (从0到1 首位,iframe 进视口自动播开场,透明挡板防滚动劫持)
   → B2 快闪秀框(pin 砍半)→ B3 三列滚轮(砍半,彩色)
   → B5 斜置橱窗(砍半,彩色)→ B5+ 918(转台一圈)
   → B6 精选索引(右侧固定预览,不跟鼠标)。
   新铁律:彩色直出 / 无统计数字 / 每个大位两行中文(学生原文案)
        / 段间无白屏(内部章节幕已删) / 视频并发 ≤2。
   ============================================================ */
(function () {
  'use strict';

  var qa = /[?&]qa=1/.test(location.search);
  FX.init({ noSmooth: qa });

  var sec = document.querySelector('.m-web');
  if (!sec) return;
  function $(s) { return sec.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var NUM = sec.dataset.chapter || '02';
  var A = 'sections/m-web/assets/';
  var SHOT = A + 'shots/';
  var SEQ = '../../showcase-assets/918/';
  var LIVE = '../../showcase-assets/live-works/' + encodeURIComponent('视觉效果比较好的') + '/';

  /* ============================================================
     数据:works.json(fetch 失败时用内嵌快照,仅索引用)
     ============================================================ */
  var WORKS_FALLBACK = [
    { name: 'zero_to_one_full_visual_v12_kinetic_motion_pass', author: '赤の破滅', type: 'file', url: null },
    { name: 'wangjiemin.com 个人站', author: '王杰民', type: 'url', url: 'https://wangjiemin.com' },
    { name: 'hoper_wow', author: '档案', type: 'file', url: null },
    { name: '25IP Live Exhibition', author: '东渐西被', type: 'url', url: 'https://25ip-live-exhibition.pages.dev/' },
    { name: 'ipreview', author: 'Rheos', type: 'url', url: 'https://ipreview.netlify.app/' },
    { name: 'web-demos 合集', author: 'FATE', type: 'url', url: 'https://samson-i.github.io/web-demos/' },
    { name: 'structure', author: '亮作', type: 'file', url: null },
    { name: 'kaijie 个人站', author: '凯杰', type: 'url', url: 'https://kaijie.netlify.app/' },
    { name: 'mirror (互动工具)', author: 'FATE', type: 'url', url: 'https://samson-i.github.io/web-demos/Tools/mirror.html' },
    { name: '语言的力量', author: '雪糕wo', type: 'file', url: null },
    { name: '野针AI识别应用', author: '王杰民', type: 'url', url: 'https://wangjiemin888-yezhen-app.hf.space' }
  ];

  /* 精选索引:只留有预览画面的作品(name → 截图);删丑清单已剔除 */
  var THUMB = {
    'zero_to_one_full_visual_v12_kinetic_motion_pass': 'file-zero2one.jpg',
    'wangjiemin.com 个人站': 'wangjiemin-3.jpg',
    'hoper_wow': 'file-hoper.jpg',
    '25IP Live Exhibition': '25ip-live-1.jpg',
    'ipreview': 'ipreview-1.jpg',
    'web-demos 合集': 'web-demos-1.jpg',
    'structure': 'file-structure.jpg',
    'kaijie 个人站': 'kaijie-1.jpg',
    'mirror (互动工具)': 'mirror-1.jpg',
    '语言的力量': 'file-language.jpg',
    '野针AI识别应用': 'yezhen-1.jpg'
  };

  /* B2 快闪秀框选图(彩色直出;删丑清单已剔除) */
  var DECK = [
    ['wangjiemin-3.jpg', 'wangjiemin.com — 王杰民'],
    ['file-zero2one.jpg', '从0到1,是最贵的'],
    ['25ip-live-1.jpg', '25IP Live Exhibition — 东渐西被'],
    ['ipreview-1.jpg', 'ipreview — Rheos'],
    ['web-demos-1.jpg', '论活着这件小事 — FATE'],
    ['file-hoper.jpg', 'hoper_wow'],
    ['kaijie-1.jpg', 'kaijie — 凯杰'],
    ['mirror-1.jpg', 'mirror — FATE'],
    ['yezhen-1.jpg', '野针AI识别应用 — 王杰民'],
    ['file-language.jpg', '语言的力量 — 雪糕wo'],
    ['file-language-pixel.jpg', '语言的力量 · 像素版'],
    ['file-truth.jpg', 'AI时代的残酷真相与破局之道'],
    ['file-wall.jpg', '有一道看不见的墙'],
    ['file-structure.jpg', 'structure — 亮作'],
    ['shot-nuelian.jpg', '虐恋的完美配方'],
    ['cube-03-portrait-archive.jpg', 'portrait-archive-v2'],
    ['portrait-archive-1.jpg', 'portrait-archive-v2'],
    ['wangjiemin-4.jpg', 'wangjiemin.com — 王杰民']
  ];

  /* B3 三列滚轮选图(7 × 3,彩色) */
  var COLS = [
    ['wangjiemin-3.jpg', 'ipreview-2.jpg', 'file-truth.jpg', 'file-hoper.jpg', 'web-demos-2.jpg', 'cube-04-ipreview.jpg', 'file-language.jpg'],
    ['25ip-live-1.jpg', 'kaijie-2.jpg', 'mirror-1.jpg', 'file-zero2one.jpg', 'shot-nuelian.jpg', 'portrait-archive-1.jpg', 'file-wall.jpg'],
    ['web-demos-1.jpg', 'file-language-pixel.jpg', 'wangjiemin-4.jpg', 'yezhen-1.jpg', 'cube-05-web-demos.jpg', 'kaijie-1.jpg', 'file-structure.jpg']
  ];

  /* 精选 live 大位 · 交错网格:1 列(整屏 hero)→ 3 列小框 → 2 列并列。
     每位必配作品解释:作者 · 作品名 · 一句话说明(优先学生原文案)。 */
  var SLOTS = [
    {
      span: 'hero',
      src: LIVE + encodeURIComponent('从0到1是最贵的（树林）.html'),
      pos: '从0到1,是最贵的',
      line: '老板亲手做的开场计数页 —「从 0 到 1 不是知识问题,是动作问题。先做,再用语言把这次经验放大。」',
      meta: 'HOPER VOL.002 — LIVE'
    },
    {
      span: 2,
      src: 'https://samson-i.github.io/web-demos/',
      pos: 'FATE · 论活着这件小事',
      line: 'web-demos 合集的开篇一页,整组都能在线点开。',
      meta: 'LIVE'
    },
    {
      span: 2,
      src: LIVE + encodeURIComponent('AI时代的残酷真相与破局之道.html'),
      pos: 'AI时代的残酷真相与破局之道',
      line: '「请给我一个乔布斯都会觉得震惊的网页排版。」— 下给产线的原始指令',
      meta: 'MANIFESTO — LIVE'
    },
    {
      span: 2,
      src: LIVE + encodeURIComponent('Porsche Cayman.html'),
      pos: '社群 · Porsche Cayman',
      line: '产品级演示页 — 往下滚,整车细节逐层展开。',
      meta: 'PRODUCT — LIVE'
    },
    {
      span: 3,
      src: LIVE + encodeURIComponent('有一道看不见的墙.html'),
      pos: '有一道看不见的墙',
      line: '「墙是技能。墙是经验。墙是那种"做这个的人和我不是同一种人"的直觉。」鼠标可扰动。',
      meta: '认知的跃迁 — LIVE'
    },
    {
      span: 3,
      src: '../../showcase-assets/live-works/' + encodeURIComponent('把注意力放回自己身上（树林）.html'),
      pos: '把注意力放回自己身上',
      line: '一份手稿,七章一个尾声 —「一个人的系统是从内到外长出来的。」',
      meta: 'MANUSCRIPT — LIVE'
    }
  ];

  /* ============================================================
     视频并发管控:全站任意时刻 playing ≤ 2
     ============================================================ */
  var Gov = {
    list: [],
    MAX: 2,
    play: function (v) {
      if (!v || FX.reduced) return;
      var i = this.list.indexOf(v);
      if (i > -1) this.list.splice(i, 1);
      while (this.list.length >= this.MAX) this.pause(this.list[0]);
      this.list.push(v);
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    },
    pause: function (v) {
      if (!v) return;
      var i = this.list.indexOf(v);
      if (i > -1) this.list.splice(i, 1);
      v.pause();
    }
  };

  /* 入章一幕(唯一保留的章节幕;内部黑白幕已删,杜绝闪帧) */
  function entryCurtain() {
    if (FX.reduced) return;
    var armed = true;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 65%',
      onEnter: function () {
        if (!armed) return;
        armed = false;
        FX.curtain.hard({ num: NUM, title: '作品', theme: 'dark' });
      },
      onLeaveBack: function () { armed = true; }
    });
  }

  /* ============================================================
     B1 — SHIPPED 字母分隔带(60vh,hover/键盘逻辑保留)
     ============================================================ */
  var b1 = {
    el: $('.m-web__b1'),
    letters: 'WORKS'.split(''),
    /* 每字母独立画布宽(Archivo 900 字幅不同,W 比 S 宽得多)与对应录屏段 */
    W: { W: 128, O: 100, R: 96, K: 102, S: 90 },
    VID: ['l0', 'l5', 'l3', 'l2', 'l6'],
    cells: [],
    lit: -1,
    timer: null,
    hovering: false,

    build: function () {
      var wrap = $('.m-web__letters');
      var frag = document.createDocumentFragment();
      this.letters.forEach(function (ch, i) {
        var w = b1.W[ch] || 100;
        var cell = document.createElement('div');
        cell.className = 'm-web__letter';
        cell.dataset.letter = ch;
        cell.style.aspectRatio = w + '/132';
        cell.innerHTML =
          '<video class="m-web__letter-vid" muted loop playsinline preload="auto" src="' +
          A + 'letters/' + b1.VID[i] + '.mp4"></video>' +
          '<svg class="m-web__letter-cover" viewBox="0 0 ' + w + ' 132" preserveAspectRatio="none" aria-hidden="true">' +
          '<defs><mask id="mwebLm' + i + '" maskUnits="userSpaceOnUse" x="-2" y="-2" width="' + (w + 4) + '" height="136">' +
          '<rect x="-2" y="-2" width="' + (w + 4) + '" height="136" fill="#FFFFFF"/>' +
          '<text class="m-web__lglyph" x="' + (w / 2) + '" y="112" text-anchor="middle" font-size="124" fill="#000000">' + ch + '</text>' +
          '</mask></defs>' +
          '<rect x="-2" y="-2" width="' + (w + 4) + '" height="136" fill="#000000" mask="url(#mwebLm' + i + ')"/>' +
          '<text class="m-web__lglyph" x="' + (w / 2) + '" y="112" text-anchor="middle" font-size="124" ' +
          'fill="none" stroke="#FFFFFF" stroke-opacity=".25" stroke-width="1">' + ch + '</text>' +
          '</svg>';
        frag.appendChild(cell);
        b1.cells.push(cell);
      });
      wrap.appendChild(frag);
      if (FX.reduced) return;

      this.cells.forEach(function (cell, i) {
        cell.addEventListener('mouseenter', function () { b1.hovering = true; b1.light(i); });
        cell.addEventListener('mouseleave', function () { b1.hovering = false; });
      });

      document.addEventListener('keydown', function (e) {
        if (!b1.active || e.metaKey || e.ctrlKey || e.altKey) return;
        if (!/^[a-z]$/i.test(e.key || '')) return;
        var k = e.key.toUpperCase();
        var hits = [];
        b1.letters.forEach(function (ch, i) { if (ch === k) hits.push(i); });
        var i = hits.length ? hits[Math.floor(Math.random() * hits.length)]
                            : Math.floor(Math.random() * b1.cells.length);
        b1.light(i);
        gsap.fromTo(b1.cells[i], { scale: 1.12 }, { scale: 1, duration: 0.7, ease: 'fxContract' });
      });

      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          b1.active = en.isIntersecting;
          if (en.isIntersecting) b1.start(); else b1.stop();
        });
      }, { threshold: 0.25 });
      io.observe(this.el);
    },

    light: function (i) {
      if (i === this.lit) return;
      if (this.lit > -1) {
        var prev = this.cells[this.lit];
        prev.classList.remove('is-lit');
        gsap.to(prev, { scale: 1, duration: 0.6, ease: 'fxContract' });
        Gov.pause(prev.querySelector('video'));
      }
      this.lit = i;
      var cell = this.cells[i];
      cell.classList.add('is-lit');
      gsap.to(cell, { scale: 1.07, duration: 0.6, ease: 'fxContract' });
      Gov.play(cell.querySelector('video'));
    },

    start: function () {
      if (this.timer || FX.reduced) return;
      if (this.lit < 0) this.light(0);
      else Gov.play(this.cells[this.lit].querySelector('video'));
      this.timer = setInterval(function () {
        if (!b1.hovering) b1.light((b1.lit + 1) % b1.cells.length);
      }, 1700);
    },

    stop: function () {
      clearInterval(this.timer);
      this.timer = null;
      if (this.lit > -1) Gov.pause(this.cells[this.lit].querySelector('video'));
    },

    reveal: function () {
      if (FX.reduced) {
        $$('.m-web__b1 .fx-hide').forEach(function (el) { el.classList.remove('fx-hide'); });
        return;
      }
      FX.ready.then(function () {
        FX.revealText($('.m-web__title'), { mode: 'drop' });
        FX.revealText($('.m-web__kicker'), { mode: 'rise' });
        FX.revealText($('.m-web__sub'), { mode: 'rise' });
        FX.revealText($('.m-web__b1-hint'), { mode: 'roll' });
        gsap.fromTo(b1.cells,
          { yPercent: 24, opacity: 0 },
          {
            yPercent: 0, opacity: 1, duration: 1.1, ease: 'fxContract',
            stagger: 0.06,
            scrollTrigger: { trigger: b1.el, start: 'top 75%', once: true }
          });
      });
    }
  };

  /* ============================================================
     SLOTS — 精选 live 大位:iframe 进视口装载(自动播自己的开场),
     离开很远即卸载(再来重播,同时压住同屏 live 数);
     iframe pointer-events:none 防滚动劫持,互动走「进入互动 ↗」。
     ============================================================ */
  var slots = {
    el: $('.m-web__slots'),

    build: function () {
      var grid = document.createElement('div');
      grid.className = 'm-web__sgrid';
      SLOTS.forEach(function (s) {
        var hero = s.span === 'hero';
        var fig = document.createElement('figure');
        fig.className = 'm-web__slot' + (hero ? ' m-web__slot--hero' : ' m-web__slot--cell m-web__slot--c' + s.span);
        fig.style.margin = '0';
        fig.innerHTML =
          '<div class="m-web__slot-frame">' +
          '<iframe data-src="' + s.src + '" title="' + s.pos + '" tabindex="-1"></iframe>' +
          '<div class="m-web__slot-shield"><span class="m-web__slot-go fx-label">进入互动</span></div>' +
          '<button class="m-web__slot-exit fx-label" type="button">退出互动 ✕</button>' +
          '<a class="m-web__slot-open fx-label" href="' + s.src + '" target="_blank" rel="noopener">新页打开 ↗</a>' +
          '</div>' +
          '<figcaption class="m-web__slot-cap">' +
          '<div><p class="m-web__slot-pos">' + s.pos + '</p>' +
          '<p class="m-web__slot-line">' + s.line + '</p></div>' +
          '<p class="m-web__slot-meta fx-label fx-label--dim">' + s.meta + '</p>' +
          '</figcaption>';
        if (hero) slots.el.appendChild(fig);
        else grid.appendChild(fig);
      });
      this.el.appendChild(grid);

      /* 小框里的页面按整页 1280×800 渲染再缩放进框,保住原排版 */
      function fit() {
        $$('.m-web__slot--cell iframe').forEach(function (f) {
          var box = f.parentNode;
          var k = box.clientWidth / 1280;
          f.style.width = '1280px';
          f.style.height = '800px';
          f.style.transform = 'scale(' + k + ')';
          f.style.transformOrigin = '0 0';
        });
      }
      fit();
      window.addEventListener('resize', fit);

      var figs = $$('.m-web__slot');

      /* 点击进入互动(透明挡板让位),Esc / 滚出视口退出 —— v2Wall 同款 */
      figs.forEach(function (fig) {
        var frame = fig.querySelector('.m-web__slot-frame');
        var iframe = fig.querySelector('iframe');
        var shield = fig.querySelector('.m-web__slot-shield');
        var exit = fig.querySelector('.m-web__slot-exit');
        function off() { frame.classList.remove('is-live'); }
        shield.addEventListener('click', function () {
          if (!iframe.src) iframe.src = iframe.dataset.src;
          frame.classList.add('is-live');
        });
        exit.addEventListener('click', off);
        fig._mwebOff = off;
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        figs.forEach(function (fig) { fig._mwebOff(); });
      });

      if (FX.reduced) { // 退化:进视口装载一次,不卸载
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (!en.isIntersecting) return;
            var f = en.target.querySelector('iframe');
            if (f && !f.src) f.src = f.dataset.src;
          });
        }, { rootMargin: '160% 0px' });
        figs.forEach(function (f) { io.observe(f); });
        return;
      }

      figs.forEach(function (fig) {
        var iframe = fig.querySelector('iframe');
        ScrollTrigger.create({
          trigger: fig, start: 'top 130%', end: 'bottom -30%',
          onToggle: function (self) {
            if (self.isActive) {
              if (!iframe.src) iframe.src = iframe.dataset.src; // 进视口自动播开场
            } else if (iframe.src) {
              iframe.removeAttribute('src'); // 离场卸载:省资源,回来重播
              fig._mwebOff();
            }
          }
        });
        gsap.fromTo(fig,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.1, ease: 'fxContract',
            scrollTrigger: { trigger: fig, start: 'top 86%', once: true }
          });
      });
    }
  };

  /* ============================================================
     B2 — 精华快闪秀框:pin 已砍半,自动快闪 → 滚动 scrub
     ============================================================ */
  var b2 = {
    el: $('.m-web__b2'),
    idx: -1,
    mode: 'auto',
    imgs: [],
    step: 0,
    PATTERN: [0.12, 0.12, 0.12, 0.6], // 3 快 1 慢

    build: function () {
      var frame = $('.m-web__deck-frame');
      DECK.forEach(function (d) {
        var img = document.createElement('img');
        img.dataset.src = SHOT + d[0];
        img.alt = d[1];
        img.decoding = 'async';
        frame.appendChild(img);
        b2.imgs.push(img);
      });
      if (FX.reduced) {
        this.imgs.slice(0, 8).forEach(function (img) { img.src = img.dataset.src; });
        this.imgs.slice(8).forEach(function (img) { img.remove(); });
        return;
      }

      ScrollTrigger.create({
        trigger: this.el, start: 'top 140%', once: true,
        onEnter: function () {
          b2.imgs.forEach(function (img) {
            img.src = img.dataset.src;
            if (img.decode) img.decode().catch(function () {});
          });
        }
      });

      ScrollTrigger.create({
        trigger: this.el, start: 'top top', end: 'bottom bottom',
        pin: $('.m-web__b2-pin'), pinSpacing: false, anticipatePin: 1,
        onUpdate: function (self) {
          if (self.progress > 0.12) b2.mode = 'scrub';
          else if (self.progress < 0.06) b2.mode = 'auto';
          if (b2.mode === 'scrub') {
            var i = Math.round(gsap.utils.mapRange(0.12, 0.97, 0, DECK.length - 1, clamp(self.progress, 0.12, 0.97)));
            b2.show(i);
          }
        },
        onToggle: function (self) {
          if (self.isActive) b2.auto(); else b2.stopAuto();
        }
      });
      this.show(0);
    },

    show: function (i) {
      i = clamp(i, 0, DECK.length - 1);
      if (i === this.idx) return;
      if (this.idx > -1) this.imgs[this.idx].classList.remove('is-cur');
      this.idx = i;
      this.imgs[i].classList.add('is-cur');
      $('.m-web__deck-count').textContent = pad2(i + 1) + ' / ' + DECK.length;
      $('.m-web__deck-name').textContent = DECK[i][1];
    },

    auto: function () {
      this.stopAuto();
      var tick = function () {
        if (b2.mode === 'auto') b2.show((b2.idx + 1) % DECK.length);
        b2.call = gsap.delayedCall(b2.PATTERN[b2.step++ % b2.PATTERN.length], tick);
      };
      this.call = gsap.delayedCall(this.PATTERN[0], tick);
    },

    stopAuto: function () { if (this.call) { this.call.kill(); this.call = null; } }
  };

  /* ============================================================
     B3 — 三列滚轮橱窗(白,行程砍半,彩色直出)
     ============================================================ */
  var b3 = {
    el: $('.m-web__b3'),
    build: function () {
      var tracks = $$('.m-web__b3-track');
      tracks.forEach(function (track, c) {
        COLS[c].forEach(function (f) {
          var img = document.createElement('img');
          img.src = SHOT + f;
          img.alt = '';
          img.loading = 'lazy';
          img.decoding = 'async';
          track.appendChild(img);
        });
      });
      if (FX.reduced) return;

      ScrollTrigger.create({
        trigger: this.el, start: 'top top', end: 'bottom bottom',
        pin: $('.m-web__b3-pin'), pinSpacing: false, anticipatePin: 1
      });

      var tls = [];
      tracks.forEach(function (track, c) {
        track.innerHTML += track.innerHTML; // 复制两份,yPercent -50 无缝循环
        var dur = [30, 40, 34][c];
        var tl = (c === 1)
          ? gsap.fromTo(track, { yPercent: -50 }, { yPercent: 0, duration: dur, ease: 'none', repeat: -1 })
          : gsap.fromTo(track, { yPercent: 0 }, { yPercent: -50, duration: dur, ease: 'none', repeat: -1 });
        tls.push(tl);
      });

      var vel = 0, inView = false;
      ScrollTrigger.create({
        trigger: this.el, start: 'top bottom', end: 'bottom top',
        onToggle: function (self) {
          inView = self.isActive;
          tls.forEach(function (tl) { self.isActive ? tl.play() : tl.pause(); });
        },
        onUpdate: function (self) { vel = self.getVelocity(); }
      });
      var tick = function () {
        if (!inView) return;
        vel += (0 - vel) * 0.07;
        var dir = vel < -60 ? -1 : 1;
        var target = dir * (1 + Math.min(3.2, Math.abs(vel) / 480));
        tls.forEach(function (tl) {
          tl.timeScale(tl.timeScale() + (target - tl.timeScale()) * 0.1);
        });
      };
      gsap.ticker.add(tick);
    }
  };

  /* ============================================================
     B5 — 斜置橱窗:pin 砍半 + 横向 scrub,彩色直出
     ============================================================ */
  var b5 = {
    el: $('.m-web__b5'),
    ITEMS: [
      { t: 'shot', src: 'wangjiemin-3.jpg', cap: 'WANGJIEMIN.COM', rot: -7, sc: 1.06, z: 3 },
      { t: 'car', src: SEQ + 'seq_oneshot/frame_0180.webp', cap: '918 SPYDER — 676 FRAMES', rot: 4, sc: 1.18, z: 5 },
      { t: 'shot', src: 'file-zero2one.jpg', cap: '从0到1,是最贵的', rot: 6, sc: 0.92, z: 2 },
      { t: 'phone', src: '../../showcase-assets/sites/operationbookbook/assets/videos/workflow_showreel.mp4', cap: 'WORKFLOW SHOWREEL', rot: -5, sc: 1.0, z: 4 },
      { t: 'shot', src: '25ip-live-1.jpg', cap: '25IP LIVE EXHIBITION', rot: 8, sc: 1.1, z: 1 },
      { t: 'shot', src: 'kaijie-1.jpg', cap: 'KAIJIE.NETLIFY.APP', rot: -8, sc: 0.9, z: 3 },
      { t: 'shot', src: 'file-truth.jpg', cap: 'AI时代的残酷真相', rot: 5, sc: 1.14, z: 2 },
      { t: 'shot', src: 'mirror-1.jpg', cap: 'MIRROR', rot: -4, sc: 0.96, z: 1 }
    ],

    build: function () {
      var track = $('.m-web__b5-track');
      this.ITEMS.forEach(function (it) {
        var fig = document.createElement('figure');
        fig.className = 'm-web__b5-item m-web__b5-item--' + it.t;
        fig.style.margin = '0';
        fig.style.zIndex = it.z;
        var media = (it.t === 'phone')
          ? '<video muted loop playsinline preload="metadata" src="' + it.src + '"></video>'
          : '<img src="' + (it.t === 'car' ? it.src : SHOT + it.src) + '" alt="" loading="lazy" decoding="async">';
        fig.innerHTML = media + '<figcaption class="m-web__b5-cap fx-label fx-label--dim">' + it.cap + '</figcaption>';
        if (!FX.reduced) gsap.set(fig, { rotation: it.rot, scale: it.sc });
        track.appendChild(fig);
      });

      var phone = track.querySelector('.m-web__b5-item--phone video');
      if (FX.reduced) return;

      if (phone) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (en) { en.isIntersecting ? Gov.play(phone) : Gov.pause(phone); });
        }, { threshold: 0.3 });
        io.observe(phone);
      }

      gsap.to(track, {
        x: function () { return -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.1); },
        ease: 'none',
        scrollTrigger: {
          trigger: this.el, start: 'top top', end: 'bottom bottom',
          pin: $('.m-web__b5-pin'), pinSpacing: false, anticipatePin: 1,
          scrub: 1, invalidateOnRefresh: true
        }
      });
    }
  };

  /* ============================================================
     B5+ — 918 驶入:canvas 图序列 scroll-scrub
     三相:驶入(seq_coming 120帧)→ 驻车转台(只转一圈,77帧)→ 顺滑出章
     帧按需加载(当前 -8/+24),createImageBitmap 解码
     ============================================================ */
  function Seq(dir, count) {
    this.dir = dir; this.count = count;
    this.cache = new Map(); this.loading = new Set();
  }
  Seq.prototype.url = function (i) {
    return SEQ + this.dir + '/frame_' + String(i).padStart(4, '0') + '.webp';
  };
  Seq.prototype.load = function (i) {
    if (i < 1 || i > this.count || this.cache.has(i) || this.loading.has(i)) return;
    var self = this;
    this.loading.add(i);
    fetch(this.url(i))
      .then(function (r) { return r.blob(); })
      .then(function (b) { return createImageBitmap(b); })
      .then(function (bmp) { self.cache.set(i, bmp); self.loading.delete(i); b918.redraw(); })
      .catch(function () { self.loading.delete(i); });
  };
  Seq.prototype.ensure = function (i) {
    for (var j = i - 8; j <= i + 24; j++) this.load(j);
    if (this.cache.size > 130) {
      var self = this;
      this.cache.forEach(function (bmp, k) {
        if (Math.abs(k - i) > 48 && k !== 1) { bmp.close && bmp.close(); self.cache.delete(k); }
      });
    }
  };
  Seq.prototype.get = function (i) {
    if (this.cache.has(i)) return this.cache.get(i);
    for (var d = 1; d < 30; d++) {
      if (this.cache.has(i - d)) return this.cache.get(i - d);
      if (this.cache.has(i + d)) return this.cache.get(i + d);
    }
    return this.cache.get(1) || null;
  };

  var ROT_ONE = 77; // 192 帧 ≈ 两圈半;77 帧 = 正好一圈

  var b918 = {
    el: $('.m-web__b918'),
    coming: new Seq('seq_coming', 120),
    rotate: new Seq('seq_rotate', ROT_ONE),
    cur: null,

    build: function () {
      if (FX.reduced) return;
      var canvas = $('.m-web__b918-canvas');
      var stage = $('.m-web__b918-stage');
      var n1 = $('.m-web__b918-note--1');
      var n2 = $('.m-web__b918-note--2');
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', function () { b918.resize(); b918.redraw(); });

      ScrollTrigger.create({
        trigger: this.el, start: 'top 160%', once: true,
        onEnter: function () {
          for (var i = 1; i <= 32; i++) b918.coming.load(i);
          for (var j = 1; j <= 16; j++) b918.rotate.load(j);
        }
      });

      ScrollTrigger.create({
        trigger: this.el, start: 'top top', end: 'bottom bottom',
        pin: $('.m-web__b918-pin'), pinSpacing: false, anticipatePin: 1,
        onUpdate: function (self) {
          var p = self.progress;

          /* 相位一:驶入 — 容器从右 60vw 滑入,滚动越深车越近 */
          if (p <= 0.42) {
            var t = p / 0.42;
            gsap.set(stage, { x: (1 - t) * window.innerWidth * 0.6 });
            b918.frame(b918.coming, 1 + Math.round(t * 119));
          } else {
            gsap.set(stage, { x: 0 });
          }

          /* 相位二:驻车转台 — scrub 一圈(77 帧) */
          if (p > 0.42 && p <= 0.96) {
            var t2 = (p - 0.42) / 0.54;
            b918.frame(b918.rotate, 1 + Math.round(t2 * (ROT_ONE - 1)));
          }

          /* Space Mono 浮注两块 */
          var k1 = ramp(p, 0.46, 0.52, 0.64, 0.70);
          gsap.set(n1, { opacity: k1, y: (1 - k1) * 24 });
          var k2 = ramp(p, 0.68, 0.74, 0.88, 0.94);
          gsap.set(n2, { opacity: k2, y: (1 - k2) * 24 });
        }
      });

      function ramp(p, a, b, c, d) { // 0→1→0 梯形
        if (p <= a || p >= d) return 0;
        if (p < b) return (p - a) / (b - a);
        if (p > c) return (d - p) / (d - c);
        return 1;
      }
    },

    resize: function () {
      var dpr = Math.min(1.6, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(window.innerWidth * dpr);
      this.canvas.height = Math.round(window.innerHeight * dpr);
    },

    frame: function (seq, i) {
      seq.ensure(i);
      this.want = [seq, i];
      var bmp = seq.get(i);
      if (bmp) { this.cur = bmp; this.draw(bmp); }
    },

    redraw: function () {
      if (!this.want) return;
      var bmp = this.want[0].get(this.want[1]);
      if (bmp && bmp !== this.cur) { this.cur = bmp; this.draw(bmp); }
    },

    draw: function (bmp) {
      var c = this.canvas, ctx = this.ctx;
      var s = Math.max(c.width / bmp.width, c.height / bmp.height); // cover
      var w = bmp.width * s, h = bmp.height * s;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(bmp, (c.width - w) / 2, (c.height - h) / 2, w, h);
    }
  };

  /* ============================================================
     B6 — 精选索引:只列有预览画面的作品;
     右侧固定预览面板(sticky),hover 换图 clip 揭示,不跟鼠标。
     ============================================================ */
  var b6 = {
    el: $('.m-web__b6'),

    build: function (works) {
      var picks = works.filter(function (w) { return THUMB[w.name]; });
      var list = $('.m-web__index');
      var peek = $('.m-web__peek');
      var pimg = peek.querySelector('img');
      var pcap = peek.querySelector('.m-web__peek-cap');
      var frag = document.createDocumentFragment();

      picks.forEach(function (w, i) {
        var live = w.type === 'url' && w.url;
        var thumb = SHOT + THUMB[w.name];
        var li = document.createElement('li');
        var row = document.createElement(live ? 'a' : 'div');
        row.className = 'm-web__row';
        if (live) { row.href = w.url; row.target = '_blank'; row.rel = 'noopener'; }
        row.dataset.thumb = thumb;
        row.dataset.name = w.name;
        row.innerHTML =
          '<span class="m-web__row-num fx-label fx-num">' + pad2(i + 1) + '</span>' +
          '<p class="m-web__row-name">' + w.name + '</p>' +
          '<img class="m-web__row-thumb" src="' + thumb + '" alt="" loading="lazy" decoding="async">' +
          '<span class="m-web__row-pill fx-label">' + w.author + '</span>' +
          '<span class="m-web__row-type fx-label fx-label--dim">' + (live ? 'LIVE ↗' : 'FILE') + '</span>';
        li.appendChild(row);
        frag.appendChild(li);
      });
      list.appendChild(frag);

      /* 预览面板默认显示第一行 */
      if (picks.length) {
        pimg.src = SHOT + THUMB[picks[0].name];
        peek.dataset.cur = pimg.src;
        pcap.textContent = picks[0].name;
      }

      if (FX.reduced) {
        $$('.m-web__b6-head .fx-hide').forEach(function (el) { el.classList.remove('fx-hide'); });
        return;
      }
      $$('.m-web__b6-head .fx-hide').forEach(function (el) { FX.revealText(el, { mode: 'rise' }); });

      FX.ready.then(function () {
        var rows = $$('.m-web__index li');
        gsap.set(rows, { opacity: 0, y: 30 });
        ScrollTrigger.batch(rows, {
          start: 'top 95%', once: true,
          onEnter: function (batch) {
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'fxContract', stagger: 0.04, overwrite: true });
          }
        });
      });

      /* 临近预载全部缩略图 */
      ScrollTrigger.create({
        trigger: this.el, start: 'top 130%', once: true,
        onEnter: function () {
          picks.forEach(function (w) { var im = new Image(); im.src = SHOT + THUMB[w.name]; });
        }
      });

      /* hover 行 → 右侧面板换图(clip-path 揭示),位置固定 */
      list.addEventListener('mouseover', function (e) {
        var row = e.target.closest('.m-web__row');
        if (!row) return;
        if (peek.dataset.cur !== row.dataset.thumb) {
          peek.dataset.cur = row.dataset.thumb;
          pimg.src = row.dataset.thumb;
          pcap.textContent = row.dataset.name;
          gsap.fromTo(pimg, { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'fxContract' });
        }
      });
    }
  };

  /* ============================================================
     装配
     ============================================================ */
  b1.build();
  b1.reveal();
  slots.build();
  b2.build();
  b3.build();
  b5.build();
  b918.build();
  entryCurtain();

  fetch('../../showcase-assets/data/works.json')
    .then(function (r) { return r.json(); })
    .then(function (j) { return (j && j.works && j.works.length) ? j.works : WORKS_FALLBACK; })
    .catch(function () { return WORKS_FALLBACK; })
    .then(function (works) {
      b6.build(works);
      FX.ready.then(function () { ScrollTrigger.refresh(); });
    });
})();
