/* ============================================================
   m-river.js — 05 章「档案」素材河(窗口 D 产出)
   多速漂流:每块按 data-speed(0.75/1.0/1.25/1.5)在 rAF 里
   translate3d 漂移,漂移量 = (scroll - 块锚点) × (1 - speed),
   即块经过视口中心时恰好在排版位,前后以各自速度穿插。
   中心字标 sticky 常驻(另加 ±30px 极慢视差);左下元数据按簇
   交叉淡换(mono 行 + 中文说明行);live 块可点直达,hover 红字
   「查看 ↗」随光标。内容索引由 showcase-assets/data/works.json 整理。
   修订单02已执行:全彩直出(无灰度);删数字卡;删尾部簇与丑图
   (旭风/江哥嫂子/母亲节信/饮品页);文案不出现数量统计。
   reduced-motion:整条河退化为静态网格。
   瘦身刀:删 CLUSTERS 条目即可缩行程(每簇 120vh)。
   ============================================================ */
(function () {
  'use strict';

  FX.init(); // 幂等

  var sec = document.querySelector('.m-river');
  if (!sec) return;

  var stream = document.getElementById('riverStream');
  var mark = document.getElementById('riverMark');
  var metaEl = document.getElementById('riverMeta');
  var cursor = document.getElementById('riverCursor');

  /* ---------- 素材路径 ---------- */
  var A = 'sections/m-river/assets/';                                // 本窗口产物(切片视频/截图副本)
  var S = '../../showcase-assets/site-shots/';                       // live 站截图(共享库)
  var P = '../../showcase-assets/sites/photo-orbit/assets/thumbs/';  // 写真精选(照片球图集,全河限 2-3 张防同人重复)
  var W = 'sections/m-web/assets/shots/';                            // 窗口 B 的网站截图(引用不修改)

  /* ---------- 簇数据(每簇 120vh;near/mid 进近景层,far/far2 进远景层)
     meta = 左下两行讲解:line(mono 定位行)+ note(中文说明行) ---------- */
  var ZONE = 120;   // vh / 簇
  var TAIL = 40;    // vh 收尾留白

  var CLUSTERS = [
    { meta: '01 — 网站 · 王杰民', note: '标准化交付 · 一个上线的个人站',
      near: { k: 'img', src: A + 'cube-01-wangjiemin.jpg', url: 'https://wangjiemin.com', cap: 'wangjiemin.com — 王杰民' },
      far:  { k: 'img', src: W + 'shot-porsche.jpg' },
      mid:  { k: 'vid', src: A + 'riv-vid-flow.mp4', cap: 'WORKFLOW SHOWREEL' },
      far2: { k: 'img', src: W + 'file-hoper.jpg' },
      tag:  'NO.02 / WEB · LIVE' },
    { meta: '02 — 展览 · 东渐西被', note: '标准流程办起来的线上作品展',
      near: { k: 'img', src: A + 'cube-02-25ip-live.jpg', url: 'https://25ip-live-exhibition.pages.dev/', cap: '25IP LIVE EXHIBITION — 东渐西被' },
      far:  { k: 'vid', src: A + 'riv-vid-gallery.mp4' },
      mid:  { k: 'img', src: P + 'm-012.jpg', cap: 'AI 写真 · 男刊' },
      tag:  'NO.04 / EXHIBITION · LIVE' },

    { meta: '04 — 工具 · Rheos / FATE', note: '标准化生产 · 长出能用的应用',
      near: { k: 'img', src: A + 'cube-04-ipreview.jpg', url: 'https://ipreview.netlify.app/', cap: 'IPREVIEW — Rheos' },
      far:  { k: 'vid', src: A + 'riv-vid-bot.mp4' },
      mid:  { k: 'img', src: S + 'riv-mirror.jpg', url: 'https://samson-i.github.io/web-demos/Tools/mirror.html', cap: 'MIRROR — FATE' },
      tag:  'NO.07 / TOOL · LIVE' },

    { meta: '06 — 视频 · 演示实录', note: '从素材到成片,产线直出',
      near: { k: 'vid', src: A + 'riv-vid-aiweb.mp4', cap: 'AI 网页生成 — 演示实录' },
      far:  { k: 'img', src: W + 'shot-manifesto.jpg' },
      mid:  { k: 'vid', src: A + 'riv-vid-xhs.mp4', cap: '小红书采集 — 演示实录' },
      far2: { k: 'img', src: W + 'file-truth.jpg' },
      tag:  'NO.25 / VIDEO' },
    { meta: '07 — 现场 · 918 发布会', note: '发布会现场实录,网站当场跑起来',
      near: { k: 'vid', src: A + 'riv-vid-918b.mp4', cap: '918 发布会 — 现场实录' },
      far:  { k: 'vid', src: A + 'riv-vid-918a.mp4' },
      mid:  { k: 'img', src: W + 'file-wall.jpg', cap: '看不见的墙 — 鼠标会扰动的实验页' },
      tag:  'NO.34 / LIVE SHOW' }
  ];

  /* 三套版式原型循环(x:left %,y:簇内 vh 偏移,w:vw),速度四档 */
  var ARCH = [
    { near: { x: 52, y: 16, w: 32 }, far: { x: 9,  y: 2, w: 14 }, mid: { x: 18, y: 76, w: 19 }, far2: { x: 79, y: 100, w: 11 }, tag: { x: 47, y: 8 } },
    { near: { x: 13, y: 14, w: 30 }, far: { x: 75, y: 0, w: 13 }, mid: { x: 58, y: 78, w: 20 }, far2: { x: 6,  y: 102, w: 10 }, tag: { x: 38, y: 108 } },
    { near: { x: 38, y: 26, w: 27 }, far: { x: 7,  y: 6, w: 12 }, mid: { x: 71, y: 82, w: 17 }, far2: { x: 24, y: 108, w: 10 }, tag: { x: 67, y: 16 } }
  ];
  var SPEED = { far: 0.75, far2: 0.75, mid: 1.0, tag: 1.5 };

  /* ---------- 章头文字进场 ---------- */
  FX.ready.then(function () {
    FX.revealText(sec.querySelector('.m-river__kicker'), { mode: 'rise' });
    FX.revealText(sec.querySelector('.m-river__title'), { mode: 'drop' });
    FX.revealText(sec.querySelector('.m-river__sub'), { mode: 'rise' });
  });

  /* ---------- 建块 ---------- */
  function media(t) {
    var m;
    if (t.k === 'vid') {
      m = document.createElement('video');
      m.muted = true; m.loop = true; m.playsInline = true;
      m.setAttribute('muted', ''); m.setAttribute('playsinline', '');
      m.preload = 'metadata';
      m.src = t.src;
    } else {
      m = document.createElement('img');
      m.loading = 'lazy'; m.decoding = 'async'; m.alt = t.cap || 'AI 成品';
      m.src = t.src;
    }
    m.className = 'm-river__media';
    return m;
  }

  function tile(t, role) {
    var el = document.createElement(t.url ? 'a' : 'div');
    el.className = 'm-river__tile m-river__tile--' + (role === 'near' || role === 'mid' ? 'near' : 'far');
    if (t.url) {
      el.href = t.url; el.target = '_blank'; el.rel = 'noopener';
      el.classList.add('m-river__tile--live');
      el.setAttribute('data-live', '1');
    }
    el.appendChild(media(t));
    if (t.cap) {
      var cap = document.createElement('span');
      cap.className = 'm-river__cap fx-label';
      cap.textContent = t.cap;
      el.appendChild(cap);
    }
    return el;
  }

  /* ---------- reduced-motion:静态网格 ---------- */
  if (FX.reduced) {
    sec.classList.add('m-river--static');
    var grid = document.createElement('div');
    grid.className = 'm-river__grid';
    CLUSTERS.forEach(function (c) {
      ['near', 'mid', 'far', 'far2'].forEach(function (role) {
        /* 静态网格不收视频块(不自动播放时只是黑方块) */
        if (c[role] && c[role].k !== 'vid') grid.appendChild(tile(c[role], role));
      });
    });
    stream.appendChild(grid);
    return;
  }

  /* ---------- 动态河道 ---------- */
  var totalVh = CLUSTERS.length * ZONE + TAIL;
  stream.style.height = totalVh + 'vh';

  var layerFar = document.createElement('div');
  layerFar.className = 'm-river__layer m-river__layer--far';
  var layerNear = document.createElement('div');
  layerNear.className = 'm-river__layer m-river__layer--near';
  var layerTag = document.createElement('div');
  layerTag.className = 'm-river__layer m-river__layer--tag';
  stream.appendChild(layerFar);
  stream.appendChild(layerNear);
  stream.appendChild(layerTag);

  var drifters = []; // {el, speed, anchor}

  CLUSTERS.forEach(function (c, i) {
    var base = i * ZONE;
    var arch = ARCH[i % ARCH.length];
    ['near', 'far', 'mid', 'far2'].forEach(function (role) {
      if (!c[role]) return;
      var pos = arch[role];
      var el = tile(c[role], role);
      el.style.left = pos.x + '%';
      el.style.top = (base + pos.y) + 'vh';
      el.style.width = pos.w + 'vw';
      (role === 'near' || role === 'mid' ? layerNear : layerFar).appendChild(el);
      drifters.push({ el: el, speed: role === 'near' ? (i % 2 ? 1.5 : 1.25) : SPEED[role] });
    });
    if (c.tag) {
      var tag = document.createElement('span');
      tag.className = 'm-river__tag fx-label';
      tag.textContent = c.tag;
      tag.style.left = arch.tag.x + '%';
      tag.style.top = (base + arch.tag.y) + 'vh';
      layerTag.appendChild(tag);
      drifters.push({ el: tag, speed: SPEED.tag });
    }
  });

  /* ---------- 锚点测量(布局位经过视口中心时漂移量=0) ---------- */
  var streamTop = 0, streamH = 1, vpH = window.innerHeight;
  function measure() {
    vpH = window.innerHeight;
    var r = stream.getBoundingClientRect();
    streamTop = r.top + window.scrollY;
    streamH = r.height;
    drifters.forEach(function (d) {
      d.anchor = streamTop + d.el.offsetTop + d.el.offsetHeight / 2 - vpH / 2;
    });
  }

  /* ---------- rAF 漂移(只在章内活跃) ---------- */
  var active = false, measured = false;
  function drift() {
    if (!active || !measured) return;
    var sc = window.scrollY;
    var lim = vpH * 1.6; /* 可见区内永远达不到的钳制值:防远端块攒出巨大位移 */
    for (var i = 0; i < drifters.length; i++) {
      var d = drifters[i];
      var dy = (sc - d.anchor) * (1 - d.speed);
      if (dy > lim) dy = lim; else if (dy < -lim) dy = -lim;
      d.el.style.transform = 'translate3d(' + (d.center ? '-50%' : '0') + ',' + dy.toFixed(2) + 'px,0)';
    }
    /* 中心字标极慢视差(±30px) */
    var p = (sc - streamTop) / Math.max(1, streamH - vpH);
    mark.style.transform = 'translate(-50%,' + (-50 + (0.5 - p) * 6).toFixed(3) + '%)';
  }
  gsap.ticker.add(drift);

  ScrollTrigger.create({
    trigger: sec, start: 'top bottom', end: 'bottom top',
    onToggle: function (self) { active = self.isActive; }
  });

  /* ---------- 左下元数据按簇交叉淡换(mono 行 + 中文说明行) ---------- */
  var noteEl = document.getElementById('riverMetaNote');
  var metaIdx = -1;
  function setMeta(i) {
    if (i === metaIdx) return;
    metaIdx = i;
    var c = CLUSTERS[i];
    var both = [metaEl, noteEl];
    gsap.timeline()
      .to(both, { yPercent: -110, autoAlpha: 0, duration: 0.25, ease: 'fxContract', stagger: 0.04 })
      .call(function () {
        metaEl.textContent = c.meta;
        noteEl.textContent = c.note || '';
      })
      .fromTo(both, { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'fxContract', stagger: 0.06 });
  }
  CLUSTERS.forEach(function (c, i) {
    ScrollTrigger.create({
      start: function () { return streamTop + i * ZONE * vpH / 100 - vpH * 0.5; },
      end: function () { return streamTop + (i + 1) * ZONE * vpH / 100 - vpH * 0.5; },
      onToggle: function (self) { if (self.isActive) setMeta(i); }
    });
  });

  /* ---------- 视频:入视口才播放 ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { v.play().catch(function () {}); }
      else { v.pause(); }
    });
  }, { rootMargin: '20% 0%' });
  stream.querySelectorAll('video').forEach(function (v) { io.observe(v); });

  /* ---------- 红字「查看 ↗」随光标(只对 live 块) ---------- */
  var cx = 0, cy = 0, cursorOn = false;
  sec.addEventListener('pointermove', function (e) {
    cx = e.clientX; cy = e.clientY;
    if (cursorOn) cursor.style.transform = 'translate3d(' + (cx + 18) + 'px,' + (cy + 14) + 'px,0)';
  }, { passive: true });
  sec.addEventListener('pointerover', function (e) {
    var live = e.target.closest && e.target.closest('[data-live]');
    if (live && !cursorOn) {
      cursorOn = true;
      cursor.style.transform = 'translate3d(' + (cx + 18) + 'px,' + (cy + 14) + 'px,0)';
      gsap.to(cursor, { autoAlpha: 1, duration: 0.2, ease: 'fxContract' });
    } else if (!live && cursorOn) {
      cursorOn = false;
      gsap.to(cursor, { autoAlpha: 0, duration: 0.2, ease: 'fxContract' });
    }
  });
  sec.addEventListener('pointerleave', function () {
    if (cursorOn) { cursorOn = false; gsap.to(cursor, { autoAlpha: 0, duration: 0.2 }); }
  });

  /* ---------- 注入完成:量锚点 + 刷新 ---------- */
  FX.ready.then(function () {
    measure();
    measured = true;
    ScrollTrigger.refresh();
    measure();
  });
  window.addEventListener('resize', function () { measure(); });
  ScrollTrigger.addEventListener('refresh', measure);
})();
