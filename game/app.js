(function () {
  "use strict";

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var comboEl = document.getElementById("combo");
  var energyBar = document.getElementById("energyBar");
  var missionText = document.getElementById("missionText");
  var startPanel = document.getElementById("startPanel");
  var howPanel = document.getElementById("howPanel");
  var endPanel = document.getElementById("endPanel");
  var endTitle = document.getElementById("endTitle");
  var endText = document.getElementById("endText");
  var startBtn = document.getElementById("startBtn");
  var howBtn = document.getElementById("howBtn");
  var playFromHowBtn = document.getElementById("playFromHowBtn");
  var backBtn = document.getElementById("backBtn");
  var restartBtn = document.getElementById("restartBtn");
  var pauseBtn = document.getElementById("pauseBtn");
  var soundBtn = document.getElementById("soundBtn");
  var stick = document.getElementById("stick");
  var dashTouch = document.getElementById("dashTouch");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = 1;
  var w = 0;
  var h = 0;
  var lastTime = 0;
  var running = false;
  var paused = false;
  var gameOver = false;
  var frame = 0;
  var keys = Object.create(null);
  var pointerMove = { x: 0, y: 0, active: false };
  var best = Number(localStorage.getItem("sprout-best") || 0);
  var audio = null;
  var soundOn = false;

  var state;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function dist(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function padScore(value) {
    return String(Math.max(0, Math.floor(value))).padStart(6, "0");
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state) {
      state.player.x = clamp(state.player.x, 40, w - 40);
      state.player.y = clamp(state.player.y, 90, h - 50);
    }
  }

  function makeState() {
    return {
      score: 0,
      combo: 1,
      comboTimer: 0,
      energy: 0,
      fever: 0,
      lives: 3,
      level: 1,
      time: 0,
      shake: 0,
      flash: 0,
      spawnSeed: 0,
      spawnBug: 0,
      player: {
        x: w * 0.5,
        y: h * 0.58,
        vx: 0,
        vy: 0,
        r: 22,
        dash: 0,
        dashCooldown: 0,
        invuln: 0,
        face: 1
      },
      seeds: [],
      bugs: [],
      puffs: [],
      sparks: [],
      clouds: makeClouds()
    };
  }

  function makeClouds() {
    var clouds = [];
    var count = Math.max(7, Math.floor(w / 150));
    for (var i = 0; i < count; i += 1) {
      clouds.push({
        x: rand(-120, w + 120),
        y: rand(90, h * 0.68),
        s: rand(28, 92),
        v: rand(6, 22),
        a: rand(.24, .72)
      });
    }
    return clouds;
  }

  function show(panel) {
    [startPanel, howPanel, endPanel].forEach(function (el) {
      el.classList.add("is-hidden");
    });
    if (panel) panel.classList.remove("is-hidden");
  }

  function initAudio() {
    if (audio) return;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audio = new AudioContext();
  }

  function tone(freq, duration, type, gain) {
    if (!soundOn) return;
    initAudio();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();
    var osc = audio.createOscillator();
    var amp = audio.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, audio.currentTime);
    amp.gain.exponentialRampToValueAtTime(gain || 0.08, audio.currentTime + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + duration + 0.02);
  }

  function chord(base) {
    tone(base, .08, "triangle", .07);
    setTimeout(function () { tone(base * 1.5, .08, "square", .04); }, 48);
  }

  function startGame() {
    resize();
    state = makeState();
    running = true;
    paused = false;
    gameOver = false;
    lastTime = performance.now();
    show(null);
    updateHud();
    spawnSeed(7);
    state.seeds.push({
      x: clamp(state.player.x + 96, 56, w - 56),
      y: state.player.y,
      r: 17,
      a: 0,
      kind: "big"
    });
    spawnBug(4);
    chord(420);
  }

  function endGame() {
    running = false;
    gameOver = true;
    best = Math.max(best, state.score);
    localStorage.setItem("sprout-best", String(best));
    endTitle.textContent = state.score >= 12000 ? "这局有东西。" : "漂亮。";
    endText.textContent = "本局分数 " + padScore(state.score) + "，最高 " + padScore(best) + "。";
    show(endPanel);
    updateHud();
    tone(180, .18, "sawtooth", .06);
  }

  function updateHud() {
    scoreEl.textContent = padScore(state ? state.score : 0);
    bestEl.textContent = padScore(best);
    comboEl.textContent = "x" + (state ? state.combo : 1);
    energyBar.style.width = (state ? clamp(state.energy, 0, 100) : 0) + "%";
    if (!state) return;
    if (state.fever > 0) {
      missionText.textContent = "Fever 开了，撞碎巡逻块。";
    } else if (state.energy >= 100) {
      missionText.textContent = "能量满了，下一颗星核会点燃 Fever。";
    } else if (state.lives === 1) {
      missionText.textContent = "只剩一颗心，稳住别贪。";
    } else {
      missionText.textContent = "收集星核，躲开巡逻块。";
    }
    pauseBtn.textContent = paused ? "继续" : "暂停";
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
  }

  function spawnSeed(amount) {
    if (!state) return;
    for (var i = 0; i < amount; i += 1) {
      state.seeds.push({
        x: rand(44, w - 44),
        y: rand(110, h - 64),
        r: rand(12, 17),
        a: rand(0, Math.PI * 2),
        kind: Math.random() > .82 ? "big" : "normal"
      });
    }
  }

  function spawnBug(amount) {
    if (!state) return;
    for (var i = 0; i < amount; i += 1) {
      var edge = Math.floor(rand(0, 4));
      var x = edge === 0 ? -40 : edge === 1 ? w + 40 : rand(50, w - 50);
      var y = edge === 2 ? -40 : edge === 3 ? h + 40 : rand(110, h - 60);
      var speed = rand(80, 135) + state.level * 8;
      var angle = Math.atan2(h * .55 - y, w * .5 - x) + rand(-.7, .7);
      state.bugs.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: rand(18, 25),
        spin: rand(-3, 3),
        a: rand(0, Math.PI * 2),
        hit: 0
      });
    }
  }

  function puff(x, y, color, amount) {
    for (var i = 0; i < amount; i += 1) {
      state.puffs.push({
        x: x,
        y: y,
        vx: rand(-150, 150),
        vy: rand(-190, 100),
        r: rand(3, 10),
        life: rand(.38, .75),
        max: .75,
        color: color
      });
    }
  }

  function sparkle(x, y, label) {
    state.sparks.push({
      x: x,
      y: y,
      vy: -45,
      life: .75,
      label: label
    });
  }

  function dash() {
    if (!state || paused || !running) return;
    var p = state.player;
    if (p.dashCooldown > 0) return;
    var input = getInputVector();
    var dx = input.x || p.face;
    var dy = input.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    p.vx += dx / len * 760;
    p.vy += dy / len * 760;
    p.dash = .16;
    p.dashCooldown = .72;
    state.shake = .15;
    puff(p.x, p.y, "#ffffff", 10);
    tone(520, .07, "square", .06);
  }

  function getInputVector() {
    var x = 0;
    var y = 0;
    if (keys.ArrowLeft || keys.a) x -= 1;
    if (keys.ArrowRight || keys.d) x += 1;
    if (keys.ArrowUp || keys.w) y -= 1;
    if (keys.ArrowDown || keys.s) y += 1;
    if (pointerMove.active) {
      x += pointerMove.x;
      y += pointerMove.y;
    }
    var len = Math.sqrt(x * x + y * y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x: x, y: y };
  }

  function tick(now) {
    requestAnimationFrame(tick);
    var dt = Math.min(.033, (now - lastTime) / 1000 || .016);
    lastTime = now;
    frame += 1;
    if (!running || paused || !state) {
      draw();
      return;
    }
    update(dt);
    draw();
  }

  function update(dt) {
    state.time += dt;
    state.spawnSeed -= dt;
    state.spawnBug -= dt;
    state.level = 1 + Math.floor(state.score / 3500);
    if (state.spawnSeed <= 0) {
      state.spawnSeed = Math.max(.38, 1.1 - state.level * .05);
      spawnSeed(1 + Math.floor(Math.random() * 2));
    }
    if (state.spawnBug <= 0) {
      state.spawnBug = Math.max(1.1, 2.6 - state.level * .12);
      spawnBug(1);
    }
    updatePlayer(dt);
    updateSeeds(dt);
    updateBugs(dt);
    updateFx(dt);
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 1;
    if (state.fever > 0) {
      state.fever -= dt;
      state.score += 18 * dt;
    }
    state.shake = Math.max(0, state.shake - dt);
    state.flash = Math.max(0, state.flash - dt);
    updateHud();
  }

  function updatePlayer(dt) {
    var p = state.player;
    var input = getInputVector();
    var accel = state.fever > 0 ? 1880 : 1450;
    var maxSpeed = state.fever > 0 ? 520 : 390;
    p.vx += input.x * accel * dt;
    p.vy += input.y * accel * dt;
    p.vx *= Math.pow(.0018, dt);
    p.vy *= Math.pow(.0018, dt);
    var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    var cap = p.dash > 0 ? 980 : maxSpeed;
    if (speed > cap) {
      p.vx = p.vx / speed * cap;
      p.vy = p.vy / speed * cap;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (input.x) p.face = input.x > 0 ? 1 : -1;
    p.x = clamp(p.x, p.r + 12, w - p.r - 12);
    p.y = clamp(p.y, 88 + p.r, h - p.r - 24);
    p.dash = Math.max(0, p.dash - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.invuln = Math.max(0, p.invuln - dt);
  }

  function updateSeeds(dt) {
    for (var i = state.seeds.length - 1; i >= 0; i -= 1) {
      var seed = state.seeds[i];
      seed.a += dt * 4;
      if (dist(seed, state.player) < seed.r + state.player.r) {
        var value = seed.kind === "big" ? 520 : 180;
        var gain = value * state.combo * (state.fever > 0 ? 2 : 1);
        state.score += gain;
        state.combo = clamp(state.combo + 1, 1, 9);
        state.comboTimer = 2.1;
        state.energy = clamp(state.energy + (seed.kind === "big" ? 22 : 12), 0, 100);
        if (state.energy >= 100) {
          state.energy = 0;
          state.fever = 7.5;
          state.flash = .24;
          puff(seed.x, seed.y, "#ffd449", 28);
          chord(720);
        } else {
          puff(seed.x, seed.y, "#ffd449", 12);
          tone(640 + state.combo * 34, .06, "triangle", .06);
        }
        sparkle(seed.x, seed.y, "+" + Math.floor(gain));
        state.seeds.splice(i, 1);
      }
    }
  }

  function updateBugs(dt) {
    var p = state.player;
    for (var i = state.bugs.length - 1; i >= 0; i -= 1) {
      var bug = state.bugs[i];
      var chase = Math.min(.32, .08 + state.level * .012);
      var angle = Math.atan2(p.y - bug.y, p.x - bug.x);
      bug.vx += Math.cos(angle) * 80 * chase * dt;
      bug.vy += Math.sin(angle) * 80 * chase * dt;
      var sp = Math.sqrt(bug.vx * bug.vx + bug.vy * bug.vy);
      var max = 150 + state.level * 14;
      if (sp > max) {
        bug.vx = bug.vx / sp * max;
        bug.vy = bug.vy / sp * max;
      }
      bug.x += bug.vx * dt;
      bug.y += bug.vy * dt;
      bug.a += bug.spin * dt;
      bug.hit = Math.max(0, bug.hit - dt);
      if (bug.x < bug.r || bug.x > w - bug.r) bug.vx *= -1;
      if (bug.y < 90 + bug.r || bug.y > h - bug.r) bug.vy *= -1;
      bug.x = clamp(bug.x, bug.r, w - bug.r);
      bug.y = clamp(bug.y, 90 + bug.r, h - bug.r);
      if (dist(bug, p) < bug.r + p.r - 4) {
        if (state.fever > 0 || p.dash > 0) {
          state.score += 700 * state.combo;
          state.combo = clamp(state.combo + 1, 1, 9);
          state.comboTimer = 2.1;
          sparkle(bug.x, bug.y, "CRASH");
          puff(bug.x, bug.y, "#ff5b4a", 26);
          state.bugs.splice(i, 1);
          state.shake = .18;
          tone(140, .07, "sawtooth", .07);
        } else if (p.invuln <= 0) {
          state.lives -= 1;
          p.invuln = 1.4;
          state.combo = 1;
          state.comboTimer = 0;
          state.energy = Math.max(0, state.energy - 28);
          state.shake = .22;
          state.flash = .14;
          puff(p.x, p.y, "#ff5b4a", 24);
          tone(110, .16, "sawtooth", .06);
          if (state.lives <= 0) endGame();
        }
      }
    }
  }

  function updateFx(dt) {
    state.clouds.forEach(function (cloud) {
      cloud.x += cloud.v * dt;
      if (cloud.x > w + 150) {
        cloud.x = -150;
        cloud.y = rand(90, h * .68);
      }
    });
    for (var i = state.puffs.length - 1; i >= 0; i -= 1) {
      var p = state.puffs[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
      if (p.life <= 0) state.puffs.splice(i, 1);
    }
    for (var j = state.sparks.length - 1; j >= 0; j -= 1) {
      var s = state.sparks[j];
      s.life -= dt;
      s.y += s.vy * dt;
      if (s.life <= 0) state.sparks.splice(j, 1);
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    drawBackdrop();
    if (!state) return;
    var ox = state.shake ? rand(-10, 10) * state.shake * 5 : 0;
    var oy = state.shake ? rand(-10, 10) * state.shake * 5 : 0;
    ctx.save();
    ctx.translate(ox, oy);
    drawClouds();
    drawArena();
    state.seeds.forEach(drawSeed);
    state.bugs.forEach(drawBug);
    drawPlayer();
    state.puffs.forEach(drawPuff);
    state.sparks.forEach(drawSpark);
    ctx.restore();
    drawLives();
    if (state.fever > 0) drawFever();
    if (state.flash > 0) {
      ctx.fillStyle = "rgba(255,255,255," + state.flash * 1.8 + ")";
      ctx.fillRect(0, 0, w, h);
    }
  }

  function drawBackdrop() {
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#6bdcff");
    grad.addColorStop(.54, "#b7f2ff");
    grad.addColorStop(1, "#fff29b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = .28;
    for (var x = -80; x < w + 80; x += 96) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x + (frame * .12) % 96, h - 34, 72, Math.PI, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawClouds() {
    state.clouds.forEach(function (cloud) {
      ctx.save();
      ctx.globalAlpha = cloud.a;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.s * .62, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.s * .52, cloud.y + cloud.s * .1, cloud.s * .42, 0, Math.PI * 2);
      ctx.arc(cloud.x - cloud.s * .52, cloud.y + cloud.s * .14, cloud.s * .38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawArena() {
    ctx.save();
    ctx.globalAlpha = .22;
    ctx.strokeStyle = "#12213d";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 18]);
    roundRect(22, 84, w - 44, h - 112, 32);
    ctx.stroke();
    ctx.restore();
  }

  function drawSeed(seed) {
    var pulse = Math.sin(state.time * 5 + seed.a) * 2;
    ctx.save();
    ctx.translate(seed.x, seed.y);
    ctx.rotate(seed.a);
    ctx.fillStyle = seed.kind === "big" ? "#ff8a3d" : "#ffd449";
    ctx.strokeStyle = "#12213d";
    ctx.lineWidth = 3;
    star(0, 0, seed.r + pulse, (seed.r + pulse) * .46, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawBug(bug) {
    ctx.save();
    ctx.translate(bug.x, bug.y);
    ctx.rotate(bug.a);
    ctx.fillStyle = state.fever > 0 ? "#7867ff" : "#ff5b4a";
    ctx.strokeStyle = "#12213d";
    ctx.lineWidth = 4;
    roundRect(-bug.r, -bug.r, bug.r * 2, bug.r * 2, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(-bug.r * .46, -bug.r * .2, bug.r * .28, bug.r * .28);
    ctx.fillRect(bug.r * .18, -bug.r * .2, bug.r * .28, bug.r * .28);
    ctx.fillStyle = "#12213d";
    ctx.fillRect(-bug.r * .42, -bug.r * .14, bug.r * .14, bug.r * .14);
    ctx.fillRect(bug.r * .22, -bug.r * .14, bug.r * .14, bug.r * .14);
    ctx.restore();
  }

  function drawPlayer() {
    var p = state.player;
    var bob = Math.sin(state.time * 10) * 3;
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    ctx.scale(p.face, 1);
    if (p.invuln > 0 && Math.floor(state.time * 18) % 2 === 0) ctx.globalAlpha = .48;
    if (p.dash > 0) {
      ctx.fillStyle = "rgba(255,255,255,.48)";
      ctx.beginPath();
      ctx.ellipse(-p.face * 26, 2, 38, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = state.fever > 0 ? "#ffd449" : "#4ccc62";
    ctx.strokeStyle = "#12213d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 7, 22, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#63e17a";
    ctx.beginPath();
    ctx.ellipse(-8, -18, 16, 24, -.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(12, -18, 16, 24, .62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fffaf0";
    ctx.beginPath();
    ctx.arc(-8, 3, 5, 0, Math.PI * 2);
    ctx.arc(8, 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#12213d";
    ctx.beginPath();
    ctx.arc(-6, 4, 2.2, 0, Math.PI * 2);
    ctx.arc(10, 4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#12213d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(2, 11, 7, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  function drawPuff(p) {
    var alpha = clamp(p.life / p.max, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (1.2 - alpha * .2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSpark(s) {
    ctx.save();
    ctx.globalAlpha = clamp(s.life / .75, 0, 1);
    ctx.fillStyle = "#12213d";
    ctx.font = "900 18px Archivo, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.label, s.x, s.y);
    ctx.restore();
  }

  function drawLives() {
    if (!state) return;
    ctx.save();
    ctx.translate(24, 92);
    for (var i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < state.lives ? "#ff5b4a" : "rgba(18,33,61,.18)";
      ctx.strokeStyle = "#12213d";
      ctx.lineWidth = 3;
      heart(i * 34, 0, 12);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFever() {
    var pct = clamp(state.fever / 7.5, 0, 1);
    ctx.save();
    ctx.globalAlpha = .2 + pct * .16;
    var grad = ctx.createRadialGradient(state.player.x, state.player.y, 20, state.player.x, state.player.y, Math.max(w, h) * .62);
    grad.addColorStop(0, "#ffd449");
    grad.addColorStop(.45, "#ff5b4a");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#12213d";
    ctx.font = "900 " + Math.min(54, w / 11) + "px Archivo, sans-serif";
    ctx.textAlign = "center";
    ctx.globalAlpha = .9;
    ctx.fillText("FEVER", w / 2, 92);
    ctx.restore();
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function star(x, y, outer, inner, points) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i += 1) {
      var r = i % 2 === 0 ? outer : inner;
      var a = -Math.PI / 2 + i * Math.PI / points;
      var px = x + Math.cos(a) * r;
      var py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function heart(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s);
    ctx.bezierCurveTo(x - s * 2, y - s * .3, x - s, y - s * 1.7, x, y - s * .7);
    ctx.bezierCurveTo(x + s, y - s * 1.7, x + s * 2, y - s * .3, x, y + s);
    ctx.closePath();
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", function (event) {
    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    keys[key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(event.key) >= 0) event.preventDefault();
    if (event.key === " " || key === "Shift") dash();
    if (key === "p" && running) {
      paused = !paused;
      updateHud();
    }
    if (key === "r") startGame();
  });
  window.addEventListener("keyup", function (event) {
    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    keys[key] = false;
  });

  function setStickFromEvent(event) {
    var rect = stick.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var touch = event.touches ? event.touches[0] : event;
    var dx = touch.clientX - cx;
    var dy = touch.clientY - cy;
    var max = 34;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var amt = Math.min(max, len);
    pointerMove.x = dx / len * Math.min(1, len / max);
    pointerMove.y = dy / len * Math.min(1, len / max);
    pointerMove.active = true;
    stick.style.setProperty("--x", dx / len * amt + "px");
    stick.style.setProperty("--y", dy / len * amt + "px");
  }

  function releaseStick() {
    pointerMove.x = 0;
    pointerMove.y = 0;
    pointerMove.active = false;
    stick.style.setProperty("--x", "0px");
    stick.style.setProperty("--y", "0px");
  }

  stick.addEventListener("touchstart", function (event) {
    event.preventDefault();
    setStickFromEvent(event);
  }, { passive: false });
  stick.addEventListener("touchmove", function (event) {
    event.preventDefault();
    setStickFromEvent(event);
  }, { passive: false });
  stick.addEventListener("touchend", releaseStick);
  stick.addEventListener("pointerdown", function (event) {
    stick.setPointerCapture(event.pointerId);
    setStickFromEvent(event);
  });
  stick.addEventListener("pointermove", function (event) {
    if (event.buttons) setStickFromEvent(event);
  });
  stick.addEventListener("pointerup", releaseStick);
  dashTouch.addEventListener("click", dash);

  startBtn.addEventListener("click", startGame);
  playFromHowBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  howBtn.addEventListener("click", function () { show(howPanel); });
  backBtn.addEventListener("click", function () { show(startPanel); });
  pauseBtn.addEventListener("click", function () {
    if (!running || gameOver) return;
    paused = !paused;
    updateHud();
  });
  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    initAudio();
    if (soundOn) chord(520);
    updateHud();
  });

  resize();
  bestEl.textContent = padScore(best);
  updateHud();
  requestAnimationFrame(tick);
})();
