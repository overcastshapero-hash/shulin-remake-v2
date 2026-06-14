/* ============================================================
   m-video.js — 03 章「视频矩阵」(窗口 E 产出 · 修订单-02 重构版)
   G1「AI 生视频」:pin(行程 +=75%,铁律四已砍半),主打大窗 + 右列三联。
   G2「AI 代码视频」:横向错落带,不 pin;2 个 live 单文件(挡板+进入互动,
   进视口前 300px 挂载、离开即卸载,同屏 ≤2)+ 2 个录屏循环。
   小窗静音循环 ≤3MB,彩色直出;每个 mp4 自绘进度条;点击全屏带声。
   内容只改下方 GEN / CODE 配置。reduced-motion:静态海报陈列,无自动播。
   ============================================================ */
(function () {
  'use strict';

  FX.init(); // 幂等

  var sec = document.querySelector('.m-video');
  if (!sec) return;

  /* 资产路径锚定到本脚本位置:index.html 与 demo.html 都能直跑 */
  var BASE = (document.currentScript && document.currentScript.src)
    ? new URL('.', document.currentScript.src).href
    : 'sections/m-video/';
  var A = BASE + 'assets/';
  var VM = new URL('../../../../showcase-assets/video-matrix/', BASE).href;

  function pad2(n) { return String(n).padStart(2, '0'); }

  /* ---------- 配置(补片只改这里) ---------- */
  var GEN = {
    word: 'AI 生视频',
    rail: 'REEL 01 — AI 生视频 · GENERATED',
    lead: { code: 'GEN-01', name: '叙事运镜', dur: '0:15',
      line: '分镜、推拉、光线,都是生成的,不是拍的——主打位。',
      mono: 'AI FOOTAGE · 0:15 · 生成运镜',
      src: VM + 'ai-vid-2.mp4', poster: A + 'gen-03-poster.jpg' },
    side: [
      { code: 'GEN-02', name: '实拍质感', dur: '0:15',
        line: '没有摄像机开机,画面全部由模型生成。',
        src: VM + 'ai-vid-1.mp4', poster: A + 'gen-02-poster.jpg' },
      { code: 'GEN-03', name: '从小姜到老姜', dur: '0:14',
        line: '一句指令,同一张脸从年轻演到年老——金字段。',
        src: VM + 'ai-vid-4-jiang.mp4', poster: A + 'gen-01-poster.jpg' },
      { code: 'GEN-04', name: '成片节选', dur: '0:15',
        line: '从整支成片里截出的 15 秒,动作不停在半截。',
        src: VM + 'ai-vid-3.mp4', poster: A + 'gen-04-poster.jpg' }
    ]
  };

  var CODE = {
    title: 'AI 代码视频',
    rail: 'REEL 02 — AI 代码视频 · CODE AS FILM',
    items: [
      { kind: 'live', w: 'w58', code: 'CODE-01', name: '愤怒时间',
        line: '这支"视频"没有视频文件——整段片子是代码当场算出来的,带配音。',
        mono: 'LIVE · 单文件 HTML · 自动放映 · 点击开声',
        url: VM + 'code-video-愤怒时间.html', ph: A + 'code-live-1-poster.jpg' },
      { kind: 'live', w: 'w44', code: 'CODE-02', name: '多巴胺 · 陌生人',
        line: '整支片子由代码现场演算——配乐驱动,画面跟着节拍走。',
        mono: 'LIVE · 单文件 HTML · 自动放映 · 点击开声',
        url: VM + 'code-video-strangers.html', ph: A + 'code-a-poster.jpg' },
      /* 原定 CODE-03「最后两天」缺件:其 html 只是播放器壳,引用的 电影感.mp4
         全盘不存在;素材到位后把下面这条的 url/ph/文案换回即可。 */
      { kind: 'live', w: 'w50', code: 'CODE-03', name: 'AI 宣言 · 粗野主义',
        line: '打穿一个点——整部宣言片由代码现场演算,带配音。',
        mono: 'LIVE · 单文件 HTML · 自动放映 · 点击开声',
        url: VM + 'code-video-AI宣言.html', ph: A + 'code-live-2-poster.jpg' },
      { kind: 'video', w: 'w44', code: 'CODE-04', name: '代码视频 · 成片', dur: '2:59',
        line: '完整成片,小窗静音循环;点开全屏,带声从头放。',
        mono: 'SCREEN REC · 2:59 · 点击全屏带声',
        src: A + 'kb-01.mp4', full: A + 'kb-01-full.mp4', poster: A + 'kb-01-poster.jpg' }
    ]
  };

  /* ---------- 视频并发管控:G1 四窗同播为设计,上限 4 ---------- */
  var Gov = {
    list: [], MAX: 4,
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

  /* ---------- live iframe 管控:同屏挂载 ≤2,离场卸载 ---------- */
  var Frames = {
    mounted: [], MAX: 2,
    mount: function (slot) {
      if (slot.frame || FX.reduced) return;
      while (this.mounted.length >= this.MAX) this.unmount(this.mounted[0]);
      var f = document.createElement('iframe');
      f.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      f.loading = 'lazy';
      f.title = slot.conf.name + ' — live';
      f.src = slot.conf.url;
      f.addEventListener('load', function () {
        // 自动放映:延迟+重试(片内脚本可能晚于 load 才绑好播放键);已在播则停手
        var tries = 0;
        function go() {
          tries++;
          try {
            var cd = f.contentDocument;
            var med = cd.querySelector('audio,video');
            if (med && !med.paused) return;
            cd.querySelectorAll('audio,video').forEach(function (m) { m.muted = true; });
            var btn = cd.getElementById('playBtn') || cd.getElementById('startBtn') || cd.querySelector('[id*="start"],[id*="play"],[class*="play"],button');
            if (btn) btn.click();
          } catch (e) {}
          if (tries < 4) setTimeout(go, 700 * tries);
        }
        setTimeout(go, 400);
      });
      slot.frameBox.appendChild(f);
      slot.frame = f;
      this.mounted.push(slot);
    },
    unmount: function (slot) {
      var i = this.mounted.indexOf(slot);
      if (i > -1) this.mounted.splice(i, 1);
      if (slot.frame) { slot.frame.src = 'about:blank'; slot.frame.remove(); slot.frame = null; }
      slot.tile.classList.remove('is-on'); // 挡板复位,音频随卸载停止
    }
  };

  /* ---------- 构件 ---------- */
  var vids = [];   // {video, tile, conf, inView}
  var lives = [];  // {tile, frameBox, conf, frame}

  function capBlock(conf, withMono) {
    var d = document.createElement('div');
    d.className = 'm-video__cap';
    d.innerHTML =
      '<p class="m-video__cap-name">' + conf.name + '</p>' +
      '<p class="m-video__cap-line">' + conf.line + '</p>' +
      (withMono && conf.mono ? '<p class="m-video__cap-mono fx-label fx-label--dim">' + conf.mono + '</p>' : '');
    return d;
  }

  function videoTile(conf) {
    var fig = document.createElement('figure');
    fig.className = 'm-video__tile m-video__tile--video';
    fig.style.margin = '0';
    fig.tabIndex = 0;
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', conf.code + ' ' + conf.name + ',点击全屏带声播放');
    var frame = document.createElement('div');
    frame.className = 'm-video__frame';
    var v = document.createElement('video');
    v.className = 'm-video__vid';
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'none';
    v.poster = conf.poster || '';
    v.dataset.src = conf.src;
    frame.appendChild(v);
    /* 自绘进度条 + 角标 */
    var bar = document.createElement('div');
    bar.className = 'm-video__bar';
    bar.innerHTML = '<i></i>';
    frame.appendChild(bar);
    var corner = document.createElement('div');
    corner.className = 'm-video__corner';
    corner.innerHTML =
      '<span class="fx-label fx-num m-video__tc">00:00</span>' +
      '<span class="fx-label m-video__go">全屏 ↗</span>';
    frame.appendChild(corner);
    fig.appendChild(frame);

    var fill = bar.firstElementChild;
    var tc = corner.querySelector('.m-video__tc');
    v.addEventListener('timeupdate', function () {
      if (!v.duration) return;
      gsap.set(fill, { scaleX: v.currentTime / v.duration });
      var s = Math.floor(v.currentTime);
      tc.textContent = pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
    });

    var item = { video: v, tile: fig, conf: conf, inView: false };
    vids.push(item);
    fig.addEventListener('click', function () { openLb(conf); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(conf); }
    });
    return fig;
  }

  function liveTile(conf) {
    var fig = document.createElement('figure');
    fig.className = 'm-video__tile m-video__live';
    fig.style.margin = '0';
    var frame = document.createElement('div');
    frame.className = 'm-video__frame';
    frame.innerHTML =
      '<img class="m-video__ph" src="' + conf.ph + '" alt="' + conf.name + ' 首屏" loading="lazy" decoding="async">' +
      '<span class="m-video__livebadge fx-label">LIVE · 代码即影片</span>';
    fig.appendChild(frame);

    var slot = { tile: fig, frameBox: frame, conf: conf, frame: null };

    if (FX.reduced) {
      /* reduced:海报 + 新窗打开 */
      var a = document.createElement('a');
      a.className = 'm-video__shield';
      a.href = conf.url; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = '<span class="m-video__shield-tag fx-label">打开原片 ↗</span>';
      frame.appendChild(a);
      return fig;
    }

    var shield = document.createElement('div');
    shield.className = 'm-video__shield';
    shield.innerHTML = '<span class="m-video__shield-tag fx-label">已自动放映(静音) · 点击进入互动 + 开声 ♪</span>';
    frame.appendChild(shield);
    var exit = document.createElement('button');
    exit.type = 'button';
    exit.className = 'm-video__exit fx-label';
    exit.textContent = '退出互动 ✕';
    frame.appendChild(exit);

    shield.addEventListener('click', function () {
      Frames.mount(slot);                 // 兜底:还没挂载就先挂
      fig.classList.add('is-on');
      try {
        slot.frame.contentDocument.querySelectorAll('audio,video').forEach(function (m) { m.muted = false; });
      } catch (e) {}
    });
    exit.addEventListener('click', function () { fig.classList.remove('is-on'); });

    lives.push(slot);
    return fig;
  }

  /* ---------- G1 AI 生视频:主打 + 右列 ---------- */
  var reelGen = sec.querySelector('[data-reel="gen"]');
  (function buildGen() {
    var stage = document.createElement('div');
    stage.className = 'm-video__stage';

    var lead = document.createElement('div');
    lead.className = 'm-video__lead';
    lead.appendChild(videoTile(GEN.lead));
    lead.appendChild(capBlock(GEN.lead, true));

    var col = document.createElement('div');
    col.className = 'm-video__sidecol';
    GEN.side.forEach(function (c) {
      var wrap = document.createElement('div');
      wrap.className = 'm-video__tilewrap';
      wrap.appendChild(videoTile(c));
      wrap.appendChild(capBlock(c, false));
      col.appendChild(wrap);
    });

    var word = document.createElement('div');
    word.className = 'm-video__word';
    word.innerHTML = '<h3 class="m-video__word-txt fx-display">' + GEN.word + '</h3>';

    var rail = document.createElement('p');
    rail.className = 'fx-label fx-label--dim';
    rail.style.cssText = 'position:absolute;left:var(--fx-pad);top:24px;margin:0;';
    if (FX.reduced) rail.style.position = 'static';

    rail.textContent = GEN.rail;

    stage.appendChild(rail);
    stage.appendChild(lead);
    stage.appendChild(col);
    stage.appendChild(word);
    reelGen.appendChild(stage);
    GEN._el = { stage: stage, lead: lead, col: col, word: word, rail: rail };
  })();

  /* ---------- G2 AI 代码视频:横向错落带 ---------- */
  var band = sec.querySelector('[data-reel="code"]');
  (function buildCode() {
    var head = document.createElement('header');
    head.className = 'm-video__band-head';
    head.innerHTML =
      '<h3 class="m-video__band-title fx-display fx-hide">' + CODE.title + '</h3>' +
      '<p class="fx-label fx-label--dim fx-hide">' + CODE.rail + '</p>';
    band.appendChild(head);

    CODE.items.forEach(function (c) {
      var item = document.createElement('div');
      item.className = 'm-video__band-item m-video__band-item--' + c.w;
      item.appendChild(c.kind === 'live' ? liveTile(c) : videoTile(c));
      item.appendChild(capBlock(c, true));
      band.appendChild(item);
    });
  })();

  /* ---------- 懒加载与播放调度 ---------- */
  var lbOpen = false;

  if ('IntersectionObserver' in window) {
    /* mp4:进视口前 300px 挂 src */
    var ioAttach = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var v = e.target;
        if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
        ioAttach.unobserve(v);
      });
    }, { rootMargin: '300px 0px' });

    var ioPlay = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var item = null;
        vids.forEach(function (t) { if (t.video === e.target) item = t; });
        if (!item) return;
        item.inView = e.isIntersecting;
        syncPlayback(item);
      });
    }, { threshold: 0.2 });

    vids.forEach(function (t) {
      ioAttach.observe(t.video);
      if (!FX.reduced) ioPlay.observe(t.video);
    });

    /* live:进视口前 300px 挂载,离开即卸载(音频随之停) */
    if (!FX.reduced && lives.length) {
      var ioLive = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var slot = null;
          lives.forEach(function (s) { if (s.tile === e.target) slot = s; });
          if (!slot) return;
          if (e.isIntersecting) Frames.mount(slot);
          else Frames.unmount(slot);
        });
      }, { rootMargin: '300px 0px' });
      lives.forEach(function (s) { ioLive.observe(s.tile); });
    }
  }

  function syncPlayback(item) {
    if (item.inView && !lbOpen && !FX.reduced) Gov.play(item.video);
    else Gov.pause(item.video);
  }

  /* ---------- 全屏放映层(带声,full 版按需加载) ---------- */
  var lb = document.getElementById('mvLightbox');
  var lbStage = document.getElementById('mvLbStage');
  var lbTag = document.getElementById('mvLbTag');
  var lbClose = document.getElementById('mvLbClose');

  function openLb(conf) {
    if (lbOpen) return;
    lbOpen = true;
    lbTag.textContent = conf.code + ' — ' + conf.name + (conf.dur ? ' · ' + conf.dur : '');
    var v = document.createElement('video');
    v.className = 'm-video__lb-vid';
    v.controls = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.src = conf.full || conf.src;
    lbStage.appendChild(v);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    vids.forEach(function (t) { Gov.pause(t.video); });
    if (FX.lenis) FX.lenis.stop();
    document.addEventListener('keydown', onEsc);
    lbClose.focus();
  }

  function closeLb() {
    if (!lbOpen) return;
    lbOpen = false;
    var v = lbStage.querySelector('video');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); lbStage.removeChild(v); }
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    if (FX.lenis) FX.lenis.start();
    document.removeEventListener('keydown', onEsc);
    vids.forEach(syncPlayback);
  }

  function onEsc(e) { if (e.key === 'Escape') closeLb(); }
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target === lbStage) closeLb();
  });

  /* ---------- 入口幕:02(白)→03(黑)硬切;总装另挂幕则删 data-curtain ---------- */
  if (sec.dataset.curtain === 'hard' && !FX.reduced) {
    ScrollTrigger.create({
      trigger: sec, start: 'top 75%', once: true,
      onEnter: function () {
        FX.curtain.hard({ num: '03', title: '视频矩阵 · VIDEO MATRIX', theme: 'dark' });
      }
    });
  }

  /* ---------- 进场与 pin 动效 ---------- */
  FX.ready.then(function () {

    FX.revealText(sec.querySelector('.m-video__kicker'), { mode: 'rise' });
    FX.revealText(sec.querySelector('.m-video__title'), { mode: 'drop' });
    FX.revealText(sec.querySelector('.m-video__sub'), { mode: 'rise' });
    FX.revealText(sec.querySelector('.m-video__band-title'), { mode: 'rise' });
    FX.revealText(document.getElementById('mvTailMeta'), { mode: 'rise' });
    var bandRail = sec.querySelector('.m-video__band-head .fx-label--dim');
    if (bandRail) FX.revealText(bandRail, { mode: 'roll' });

    FX.marquee(document.getElementById('mvMarquee'), { speed: 80 });

    if (!FX.reduced) {
      /* G1 pin:行程 +=75%(铁律四:在修订单01基础上再砍半) */
      var el = GEN._el;
      var sideWraps = el.col.children;
      gsap.set(el.lead, { yPercent: 24, autoAlpha: 0 });
      gsap.set(sideWraps, { yPercent: 30, autoAlpha: 0, visibility: 'visible' });
      gsap.set(el.rail, { autoAlpha: 0 });

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: reelGen,
          start: 'top top',
          end: '+=75%',
          scrub: 1,
          pin: true,
          anticipatePin: 1
        }
      });
      tl.to(el.word.firstElementChild, { yPercent: -120, autoAlpha: 0, duration: .26 }, .06)
        .to(el.lead, { yPercent: 0, autoAlpha: 1, duration: .34 }, .10)
        .to(sideWraps, { yPercent: 0, autoAlpha: 1, duration: .30, stagger: .08 }, .22)
        .to(el.rail, { autoAlpha: 1, duration: .12 }, .52)
        /* 收尾微漂留呼吸 */
        .to(el.lead, { yPercent: -2, duration: .30 }, .68)
        .to(sideWraps, { yPercent: function (i) { return i % 2 ? 3 : -3; }, duration: .30 }, .68);

      /* G2 错落带:入场一次 + 轻视差(只动 transform/opacity) */
      Array.prototype.forEach.call(band.querySelectorAll('.m-video__band-item'), function (item, i) {
        gsap.fromTo(item,
          { x: (i % 2 ? 70 : -70), autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 1, ease: 'fxContract',
            scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
        gsap.to(item, {
          yPercent: i % 2 ? -4 : 4, ease: 'none',
          scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      });
    } else {
      Array.prototype.forEach.call(sec.querySelectorAll('.fx-hide'), function (n) {
        n.classList.remove('fx-hide');
      });
    }

    ScrollTrigger.refresh(); // 注入内容后刷新(契约)
  });

})();
