/* ============================================================
   m-skill.js — 技能(窗口 C 产出,修订单-01 §2/§5 + 修订单-02 §0/§3)
   时序:16 卡 Matter.js 真物理掉落(restitution .3/friction .4)
        → 中文格阵逐格点亮(150vh),红巨字「技能」开章一拍后
          缩小退到眉标位 → 分屏案例 ×6(7:5)→ 文字详解 ×13 收章。
   修订单-02 落点:统计数字不出现(计数器已删)/彩色直出/
   案例 4 双竖屏对比、案例 5 工作流整图、案例 6 song.mp3 点播。
   卡片:正面中文大字+一句话,背面英文包名;点击 → 滚动锚到格阵
   对应单元格并高亮。
   退化:FX.reduced / ?qa=1 → .m-skill--static。深链:?qa=1&scroll=px。
   依赖:base/fx.js + sections/m-skill/vendor/matter.min.js
   ============================================================ */
(function () {
  'use strict';

  var qa = /[?&]qa=1/.test(location.search);
  FX.init({ noSmooth: qa });

  var sec = document.querySelector('.m-skill');
  if (!sec) return;
  var STATIC = FX.reduced || qa;

  function $(s) { return sec.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- 16 个 Skill:[英文包名, 中文一句话, 中文技能名] ---------- */
  var SKILLS = [
    ['make-website', '需求 → 上线链接', '一键建站'],
    ['frontend-design', '需求 → 有设计感的页面', '页面设计'],
    ['cf-pages-deploy', '需求 → 部署上线', '部署上线'],
    ['audio-driven-video', '一段口播 → 带字幕成片', '口播成片'],
    ['ffmpeg-video-editor', '人话 → 剪辑指令', '视频剪辑'],
    ['ai-portrait-imagegen', '需求 → 杂志级写真', '整本写真'],
    ['suno-song-creator', '一个主题 → 整首歌', '整首成歌'],
    ['copywriting', '一个产品 → 落地页文案', '落地文案'],
    ['blog-writer', '一个观点 → 长文', '观点成文'],
    ['seo-content-writer', '一个关键词 → 搜索流量文章', '搜索文章'],
    ['social-content-generator', '一条内容 → 全平台帖子', '全网分发'],
    ['research-paper-writer', '一个题目 → 规范论文', '规范论文'],
    ['brainstorming', '一个模糊想法 → 明确方案', '想法落定'],
    ['market-research', '一个市场 → 规模与机会', '市场调研'],
    ['interview-designer', '一份简历 → 结构化面试', '结构面试'],
    ['skill-creator', '缺什么,造什么', '造新技能']
  ];

  /* 有真实成品缩略的格子(hover 浮出,彩色直出;不为没有成品的格子造假图) */
  var THUMBS = {
    0: 'shot-work-zero2one.jpg',
    1: 'shot-work-language.jpg',
    2: 'shot-work-wall.jpg',
    3: 'poster-demo-clip.jpg',
    5: 'collage-shulin.jpg'
  };
  var ASSET = 'sections/m-skill/assets/';

  function pad2(i) { return String(i).padStart(2, '0'); }

  /* 几何字形(图标阵):四种形 × 四个朝向,fill/stroke 跟随 currentColor */
  function glyphSVG(i) {
    var rot = 'transform="rotate(' + (Math.floor(i / 4) * 90) + ' 10 10)"';
    var shapes = [
      '<rect x="4" y="4" width="12" height="12" fill="currentColor" ' + rot + '/>',
      '<circle cx="10" cy="10" r="5.6" fill="none" stroke="currentColor" stroke-width="2.6"/>',
      '<polygon points="10,3.4 17,16.6 3,16.6" fill="currentColor" ' + rot + '/>',
      '<path d="M3.4 10a6.6 6.6 0 0 1 13.2 0Z" fill="currentColor" ' + rot + '/>'
    ];
    return '<svg viewBox="0 0 20 20" aria-hidden="true">' + shapes[i % 4] + '</svg>';
  }

  /* ---------- 注入:16 张卡(中文面朝外)+ 4×4 中文格阵 ---------- */
  var pile = $('.m-skill__pile');
  var cards = SKILLS.map(function (s, i) {
    var card = document.createElement('div');
    card.className = 'm-skill__card m-skill__card--' + (i % 2 ? 'k' : 'w');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', s[2] + ',' + s[1] + ',点击定位到总览格阵');
    card.innerHTML =
      '<div class="m-skill__card-in">' +
        '<div class="m-skill__card-face">' +
          '<p class="m-skill__card-zh">' + s[2] + '</p>' +
          '<p class="m-skill__card-line">' + s[1] + '</p>' +
        '</div>' +
        '<div class="m-skill__card-back">' +
          '<p class="m-skill__card-idx">' + pad2(i) + '</p>' +
          '<p class="m-skill__card-eng">' + s[0] + '</p>' +
        '</div>' +
      '</div>';
    pile.appendChild(card);
    return card;
  });

  var grid = $('.m-skill__grid');
  var cells = SKILLS.map(function (s, i) {
    var cell = document.createElement('div');
    cell.className = 'm-skill__cell';
    cell.id = 'msk-cell-' + pad2(i);
    cell.setAttribute('role', 'listitem');
    cell.innerHTML =
      '<p class="m-skill__cell-idx">' + pad2(i) + '</p>' +
      '<p class="m-skill__cell-zh">' + s[2] + '</p>' +
      '<p class="m-skill__cell-eng">' + s[0] + '</p>' +
      '<span class="m-skill__cell-glyph">' + glyphSVG(i) + '</span>' +
      (THUMBS[i] != null
        ? '<img class="m-skill__cell-thumb" src="' + ASSET + THUMBS[i] + '" alt="" loading="lazy" decoding="async">'
        : '');
    grid.appendChild(cell);
    return cell;
  });

  if (STATIC) sec.classList.add('m-skill--static');

  /* ---------- 卡片点击 → 滚动锚到格阵单元格并高亮 ---------- */
  var flashTimer = null;
  function flashCell(i) {
    cells.forEach(function (c) { c.classList.remove('is-target'); });
    cells[i].classList.add('is-target');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { cells[i].classList.remove('is-target'); }, 1600);
  }
  function goCell(i) {
    if (STATIC) {
      cells[i].scrollIntoView({ block: 'center' });
      flashCell(i);
      return;
    }
    var act1 = $('.m-skill__act1');
    var top = act1.getBoundingClientRect().top + window.scrollY;
    // 点亮进度反推滚动位:lit n = round(clamp((p-.04)/.82)*16) ≥ i+1
    var p = 0.06 + 0.82 * ((i + 1) / 16);
    var y = top + p * (act1.offsetHeight - window.innerHeight);
    if (FX.lenis) FX.lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo(0, y);
    setTimeout(function () { flashCell(i); }, 700);
  }
  cards.forEach(function (card, i) {
    card.addEventListener('click', function () { goCell(i); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goCell(i); }
    });
  });

  /* ---------- 开章:Matter.js 真物理掉落(保留) ---------- */
  function buildDrop() {
    if (STATIC || !window.Matter) {
      sec.classList.add('m-skill--static');
      pile.classList.add('is-settled');
      return;
    }
    var stage = $('.m-skill__drop-stage');
    var started = false;

    function startDrop() {
      if (started) return;
      started = true;
      var W = stage.clientWidth, H = stage.clientHeight;
      var Engine = Matter.Engine, Bodies = Matter.Bodies,
          Body = Matter.Body, Composite = Matter.Composite;
      var engine = Engine.create({ enableSleeping: true });

      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + 60, W + 600, 120, { isStatic: true }),
        Bodies.rectangle(-60, H / 2 - H, 120, H * 4, { isStatic: true }),
        Bodies.rectangle(W + 60, H / 2 - H, 120, H * 4, { isStatic: true })
      ]);

      var bodies = cards.map(function (card, i) {
        var w = card.offsetWidth, h = card.offsetHeight;
        var body = Bodies.rectangle(
          rand(W * 0.16, W * 0.84),
          -h - 80 - i * (H * 0.16) - rand(0, 70),
          w, h,
          { restitution: 0.3, friction: 0.4, frictionAir: 0.012, angle: rand(-0.35, 0.35) }
        );
        Body.setAngularVelocity(body, rand(-0.08, 0.08));
        Composite.add(engine.world, body);
        card.classList.add('is-live');
        card._w = w; card._h = h;
        return body;
      });

      function sync() {
        for (var i = 0; i < cards.length; i++) {
          var b = bodies[i], c = cards[i];
          c.style.transform = 'translate3d(' + (b.position.x - c._w / 2).toFixed(2) + 'px,' +
            (b.position.y - c._h / 2).toFixed(2) + 'px,0) rotate(' + b.angle.toFixed(4) + 'rad)';
        }
      }

      var acc = 0, elapsed = 0;
      var tick = function (time, deltaMS) {
        acc = Math.min(acc + deltaMS, 100);
        elapsed += deltaMS;
        while (acc >= 16.666) { Engine.update(engine, 16.666); acc -= 16.666; }
        sync();
        var asleep = bodies.every(function (b) { return b.isSleeping; });
        if (asleep || elapsed > 9000) {
          gsap.ticker.remove(tick);
          sync();
          pile.classList.add('is-settled');
        }
      };
      gsap.ticker.add(tick);
    }

    ScrollTrigger.create({
      trigger: $('.m-skill__drop'), start: 'top 55%', once: true, onEnter: startDrop
    });
  }

  /* ---------- 格阵:逐格点亮 + 巨字开章一拍后退眉标位 ----------
     计数器已删(修订单-02 精选铁律:统计数字不出现)。 */
  function buildAct1() {
    if (STATIC) {
      cells.forEach(function (c) { c.classList.add('is-lit'); });
      return;
    }
    var act1 = $('.m-skill__act1');
    var stage = $('.m-skill__act1-stage');
    var lit = -1;
    ScrollTrigger.create({
      trigger: act1, start: 'top top', end: 'bottom bottom',
      onUpdate: function (self) {
        var n = Math.round(gsap.utils.clamp(0, 1, (self.progress - 0.04) / 0.82) * 16);
        if (n === lit) return;
        lit = n;
        cells.forEach(function (c, i) { c.classList.toggle('is-lit', i < n); });
      }
    });
    // 巨字:进场一拍(drop reveal)后,滚动前 35% 内缩小上移到眉标位
    gsap.fromTo($('.m-skill__giant'), { y: 0, scale: 1 }, {
      y: function () { return -(stage.clientHeight / 2 - 72); },
      scale: 0.11,
      ease: 'none',
      scrollTrigger: {
        trigger: act1, start: 'top top', end: '+=85%',
        scrub: 1, invalidateOnRefresh: true
      }
    });
  }

  /* ---------- 演示视频:懒加载 + 进出视口播停(彩色直出) ---------- */
  function buildVideos() {
    $$('.m-skill__video').forEach(function (v) {
      ScrollTrigger.create({
        trigger: v, start: 'top 170%', once: true,
        onEnter: function () {
          v.src = v.dataset.src;
          if (STATIC) v.controls = true;
        }
      });
      if (STATIC) return;
      ScrollTrigger.create({
        trigger: v, start: 'top 115%', end: 'bottom -15%',
        onToggle: function (self) {
          if (!v.src) return;
          if (self.isActive) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        }
      });
    });
  }

  /* ---------- 案例 6:song.mp3 点播 ---------- */
  function buildSong() {
    var btn = $('.m-skill__songbtn');
    var audio = $('.m-skill__song');
    if (!btn || !audio) return;
    var ico = $('.m-skill__songbtn-ico'), txt = $('.m-skill__songbtn-txt');
    function render(playing) {
      btn.classList.toggle('is-playing', playing);
      ico.textContent = playing ? '❚❚' : '▶';
      txt.textContent = playing ? 'PAUSE' : 'PLAY';
      btn.setAttribute('aria-label', (playing ? '暂停' : '播放') + '歌曲 Orbiting the Unknown');
    }
    btn.addEventListener('click', function () {
      if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
      else audio.pause();
    });
    audio.addEventListener('play', function () { render(true); });
    audio.addEventListener('pause', function () { render(false); });
    ScrollTrigger.create({
      trigger: $('.m-skill__case--song'), start: 'top bottom', end: 'bottom top',
      onLeave: function () { audio.pause(); },
      onLeaveBack: function () { audio.pause(); }
    });
  }

  /* ---------- 文字进场(全部走 FX.revealText) ---------- */
  function buildReveals() {
    FX.revealText($('.m-skill__kicker'), { mode: 'rise' });
    FX.revealText($('.m-skill__drop-hint'), { mode: 'rise' });
    FX.revealText($('.m-skill__act1-title'), { mode: 'roll' });   // 标题行 slot-machine
    FX.revealText($('.m-skill__giant'), { mode: 'drop', start: 'top 95%' });
    $$('.m-skill__case-num').forEach(function (el) { FX.revealText(el, { mode: 'rise' }); });
    $$('.m-skill__case-tag').forEach(function (el) { FX.revealText(el, { mode: 'rise' }); });
    $$('.m-skill__case-title').forEach(function (el) { FX.revealText(el, { mode: 'rise' }); });
    $$('.m-skill__case-body').forEach(function (el) { FX.revealText(el, { mode: 'rise' }); });
    $$('.m-skill__case-data').forEach(function (el) { FX.revealText(el, { mode: 'rise' }); });
    FX.revealText($('.m-skill__list-eyebrow'), { mode: 'rise' });
    FX.revealText($('.m-skill__list-title'), { mode: 'rise' });
    $$('.m-skill__li').forEach(function (el) { FX.revealText(el, { mode: 'rise', stagger: 0.04 }); });
  }

  /* ---------- 装配 ---------- */
  buildDrop();
  buildAct1();
  buildVideos();
  buildSong();
  FX.ready.then(function () {
    buildReveals();
    ScrollTrigger.refresh();
    // qa 深链:?qa=1&scroll=px 或 ?qa=1&scrollto=元素id(无头截图/低配验证)。
    // 并行窗口的章节异步注入会改文档高度,定位前等 scrollHeight 连续稳定再现量。
    var mPx = location.search.match(/[?&]scroll=(\d+)/);
    var mId = location.search.match(/[?&]scrollto=([\w-]+)/);
    if (qa && (mPx || mId)) {
      var lastH = 0, stable = 0;
      var poll = setInterval(function () {
        var h = document.body.scrollHeight;
        if (h === lastH) {
          if (++stable >= 2) {
            clearInterval(poll);
            ScrollTrigger.refresh();
            if (mId) {
              var el = document.getElementById(mId[1]);
              if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
            } else {
              window.scrollTo(0, +mPx[1]);
            }
          }
        } else { stable = 0; lastH = h; }
      }, 350);
    }
  });
})();
