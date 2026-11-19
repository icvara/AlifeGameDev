// Interactive figures for the "What is artificial life?" page.
// Each figure only runs if its canvas exists on the page.

// Fig. 1: boids-style flocking
(function () {
  const canvas = document.getElementById("life");
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const p = { cohesion: 0.4, alignment: 0.5, separation: 0.5 };
  let W = 0, H = 0, cells = [], color = "46,107,79", running = false;

  const readColor = () => { color = getComputedStyle(document.documentElement).getPropertyValue("--cell").trim() || color; };
  const makeCell = (x, y) => ({
    x: x ?? Math.random() * W, y: y ?? Math.random() * H,
    vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2,
    r: 2 + Math.random() * 3
  });
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function populate() {
    const n = Math.round(Math.min(70, (W * H) / 3000));
    cells = Array.from({ length: n }, () => makeCell());
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    const R = 70;
    for (const a of cells) {
      let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, k = 0;
      for (const b of cells) {
        if (a === b) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          k++; cx += b.x; cy += b.y; ax += b.vx; ay += b.vy;
          if (d2 < 600) { sx -= dx / (d2 + 1) * 20; sy -= dy / (d2 + 1) * 20; }
        }
      }
      if (k) {
        a.vx += (cx / k - a.x) * 0.0006 * p.cohesion + (ax / k - a.vx) * 0.04 * p.alignment + sx * 0.03 * p.separation;
        a.vy += (cy / k - a.y) * 0.0006 * p.cohesion + (ay / k - a.vy) * 0.04 * p.alignment + sy * 0.03 * p.separation;
      }
      const sp = Math.hypot(a.vx, a.vy), max = 1.2, min = 0.3;
      if (sp > max) { a.vx *= max / sp; a.vy *= max / sp; }
      if (sp < min) { a.vx *= min / (sp || 1); a.vy *= min / (sp || 1); }
      a.x = (a.x + a.vx + W) % W; a.y = (a.y + a.vy + H) % H;

      // body + a short tail showing heading
      const s = Math.hypot(a.vx, a.vy) || 1;
      ctx.strokeStyle = `rgba(${color},0.45)`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x - a.vx / s * a.r * 3, a.y - a.vy / s * a.r * 3); ctx.stroke();
      ctx.fillStyle = `rgba(${color},0.85)`;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    if (running && !reduce) requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  readColor(); size(); populate();
  window.addEventListener("resize", () => { size(); populate(); if (reduce) frame(); });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { readColor(); if (reduce) frame(); });
  new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(canvas);
  if (reduce) frame();

  document.getElementById("stage").addEventListener("pointerdown", e => {
    const r = canvas.getBoundingClientRect();
    for (let i = 0; i < 6; i++) cells.push(makeCell(e.clientX - r.left + (Math.random() - .5) * 20, e.clientY - r.top + (Math.random() - .5) * 20));
    if (cells.length > 200) cells.splice(0, cells.length - 200);
    if (reduce) frame();
  });
  [["c-coh", "cohesion"], ["c-ali", "alignment"], ["c-sep", "separation"]].forEach(([id, key]) => {
    const input = document.getElementById(id);
    const set = () => { p[key] = input.value / 100; };
    input.addEventListener("input", set); set();
  });
  document.getElementById("c-reset").addEventListener("click", () => { populate(); if (reduce) frame(); });
  document.getElementById("c-scatter").addEventListener("click", () => { for (const c of cells) { c.vx = (Math.random() - .5) * 4; c.vy = (Math.random() - .5) * 4; } });
})();

// Fig. 2: neural networks evolved by a genetic algorithm
(function () {
  const canvas = document.getElementById("evo");
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const POP = 40, FOOD = 24, GEN_LEN = 700, HID = 6, IN = 3;
  const GENES = IN * HID + HID + 1;          // input→hidden weights, hidden→output weights, output bias
  const statsEl = document.getElementById("e-stats");
  let W = 0, H = 0, agents = [], food = [], tick = 0, gen = 0, history = [];
  let playing = !reduce, visible = false, speed = 1, cellColor = "46,107,79", inkColor = "#24221d";

  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  const randomGenome = () => Array.from({ length: GENES }, () => gauss());
  const spot = () => ({ x: 10 + Math.random() * (W - 20), y: 10 + Math.random() * (H - 20) });
  const spawn = g => Object.assign(spot(), { a: Math.random() * Math.PI * 2, g, score: 0 });

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    cellColor = s.getPropertyValue("--cell").trim() || cellColor;
    inkColor = s.getPropertyValue("--faint").trim() || inkColor;
  }
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function restart() {
    gen = 0; tick = 0; history = [];
    agents = Array.from({ length: POP }, () => spawn(randomGenome()));
    food = Array.from({ length: FOOD }, spot);
  }

  // The brain: 3 inputs (sin and cos of the angle to food, plus a constant) → 6 hidden → 1 output (turn)
  function think(g, inputs) {
    let out = g[GENES - 1];
    for (let h = 0; h < HID; h++) {
      let sum = 0;
      for (let i = 0; i < IN; i++) sum += g[h * IN + i] * inputs[i];
      out += Math.tanh(sum) * g[IN * HID + h];
    }
    return Math.tanh(out);
  }

  function step() {
    for (const ag of agents) {
      let best = null, bd = Infinity;
      for (const f of food) {
        const d = (f.x - ag.x) ** 2 + (f.y - ag.y) ** 2;
        if (d < bd) { bd = d; best = f; }
      }
      const rel = Math.atan2(best.y - ag.y, best.x - ag.x) - ag.a;
      ag.a += think(ag.g, [Math.sin(rel), Math.cos(rel), 1]) * 0.15;
      ag.x = (ag.x + Math.cos(ag.a) * 1.6 + W) % W;
      ag.y = (ag.y + Math.sin(ag.a) * 1.6 + H) % H;
      if (bd < 49) { ag.score++; Object.assign(best, spot()); }
    }
    if (++tick >= GEN_LEN) nextGeneration();
  }

  // Genetic algorithm: keep the best, breed the rest from the top quarter with crossover + mutation
  function nextGeneration() {
    agents.sort((a, b) => b.score - a.score);
    history.push(agents.reduce((s, a) => s + a.score, 0) / POP);
    if (history.length > 60) history.shift();
    const parents = agents.slice(0, POP / 4).map(a => a.g);
    const pick = () => parents[Math.floor(Math.random() * parents.length)];
    const next = parents.slice(0, 4).map(g => g.slice());
    while (next.length < POP) {
      const p1 = pick(), p2 = pick();
      next.push(p1.map((w, i) => (Math.random() < .5 ? w : p2[i]) + (Math.random() < .15 ? gauss() * .5 : 0)));
    }
    agents = next.map(spawn);
    gen++; tick = 0;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = inkColor;
    for (const f of food) ctx.fillRect(f.x - 2, f.y - 2, 4, 4);
    for (const ag of agents) {
      ctx.strokeStyle = `rgba(${cellColor},0.45)`;
      ctx.beginPath(); ctx.moveTo(ag.x, ag.y); ctx.lineTo(ag.x - Math.cos(ag.a) * 9, ag.y - Math.sin(ag.a) * 9); ctx.stroke();
      ctx.fillStyle = `rgba(${cellColor},0.9)`;
      ctx.beginPath(); ctx.arc(ag.x, ag.y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    // fitness sparkline (top right)
    if (history.length > 1) {
      const bw = 110, bh = 36, x0 = W - bw - 10, y0 = 10, max = Math.max(...history, 1);
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
      ctx.fillRect(x0 - 4, y0 - 4, bw + 8, bh + 8);
      ctx.strokeStyle = inkColor; ctx.lineWidth = 1; ctx.strokeRect(x0 - 4, y0 - 4, bw + 8, bh + 8);
      ctx.strokeStyle = `rgb(${cellColor})`; ctx.lineWidth = 1.5; ctx.beginPath();
      history.forEach((v, i) => {
        const x = x0 + (i / (history.length - 1)) * bw, y = y0 + bh - (v / max) * bh;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke(); ctx.lineWidth = 1;
    }
    const last = history.length ? history[history.length - 1].toFixed(1) : "–";
    statsEl.textContent = `generation ${gen} · avg food last gen: ${last}`;
  }

  function loop() {
    if (!playing || !visible) return;
    for (let i = 0; i < speed; i++) step();
    draw();
    requestAnimationFrame(loop);
  }
  function resume() { if (playing && visible) requestAnimationFrame(loop); }

  readColors(); size(); restart(); draw();
  window.addEventListener("resize", () => { size(); draw(); });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { readColors(); draw(); });
  new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) resume(); }).observe(canvas);

  const playBtn = document.getElementById("e-play");
  playBtn.textContent = playing ? "pause" : "play";
  playBtn.addEventListener("click", () => {
    playing = !playing; playBtn.textContent = playing ? "pause" : "play"; resume();
  });
  const speedBtn = document.getElementById("e-speed");
  speedBtn.addEventListener("click", () => {
    speed = speed === 1 ? 10 : 1; speedBtn.textContent = `speed ×${speed}`;
  });
  document.getElementById("e-reset").addEventListener("click", () => { restart(); draw(); });
})();

// Fig. 3: grass / herbivore / predator ecosystem
const ECO = (function () {
  const canvas = document.getElementById("eco"), ctx = canvas.getContext("2d");
  const chart = document.getElementById("eco-chart"), cctx = chart.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CELL = 12, HIST = 400;
  const P = {
    grassGrow: 0.0006, maxPrey: 600, maxPred: 120,
    prey: { speed: 0.9, cost: 0.008, bite: 0.02, gain: 2.0, split: 1.6, see: 25 },
    pred: { speed: 1.25, cost: 0.012, gain: 0.7, split: 2.0, see: 80 }
  };
  let W = 0, H = 0, cols = 0, rows = 0, grass, prey = [], pred = [], tick = 0, hist = [], capPrey = 0, capPred = 0;
  let playing = !reduce, visible = false, speed = 1;
  let c = { cell: "46,107,79", prey: "176,128,32", pred: "178,64,42", faint: "#6f6a5e" };

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    c = { cell: s.getPropertyValue("--cell").trim(), prey: s.getPropertyValue("--prey").trim(),
          pred: s.getPropertyValue("--pred").trim(), faint: s.getPropertyValue("--faint").trim() };
  }
  function fit(cv, cx) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const animal = (e) => ({ x: Math.random() * W, y: Math.random() * H, a: Math.random() * 6.28, e });
  function restart() {
    fit(canvas, ctx); fit(chart, cctx);
    W = canvas.clientWidth; H = canvas.clientHeight;
    cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
    const area = (W * H) / 255000;   // caps are tuned for a ~620x410 world; scale them to this one
    capPrey = Math.max(60, Math.round(P.maxPrey * area)); capPred = Math.max(12, Math.round(P.maxPred * area));
    grass = new Float32Array(cols * rows).map(() => Math.random() * 0.6);
    prey = Array.from({ length: 60 }, () => animal(0.8));
    pred = Array.from({ length: 6 }, () => animal(1.2));
    tick = 0; hist = [];
  }
  function nearest(a, list, r) {
    let best = null, bd = r * r;
    for (const b of list) { const d = (b.x - a.x) ** 2 + (b.y - a.y) ** 2; if (d < bd) { bd = d; best = b; } }
    return best;
  }
  function move(a, sp) {
    a.x = (a.x + Math.cos(a.a) * sp + W) % W;
    a.y = (a.y + Math.sin(a.a) * sp + H) % H;
  }
  function turnTo(a, target, sign) {
    const want = Math.atan2(target.y - a.y, target.x - a.x) + (sign < 0 ? Math.PI : 0);
    let d = want - a.a; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.a += Math.max(-0.3, Math.min(0.3, d));
  }

  function step() {
    for (let i = 0; i < grass.length; i++) if (grass[i] < 1) grass[i] = Math.min(1, grass[i] + P.grassGrow);

    const born = [];
    for (const h of prey) {
      const danger = nearest(h, pred, P.prey.see);
      if (danger) turnTo(h, danger, -1); else h.a += (Math.random() - .5) * 0.5;
      move(h, P.prey.speed);
      const gi = Math.floor(h.y / CELL) * cols + Math.floor(h.x / CELL);
      const eat = Math.min(grass[gi], P.prey.bite);
      grass[gi] -= eat; h.e += eat * P.prey.gain - P.prey.cost;
      if (h.e > P.prey.split && prey.length + born.length < capPrey) { h.e /= 2; born.push({ x: h.x, y: h.y, a: h.a + 3.14, e: h.e }); }
    }
    prey = prey.filter(h => h.e > 0).concat(born);

    const pBorn = [];
    for (const f of pred) {
      const target = nearest(f, prey, P.pred.see);
      if (target) turnTo(f, target, 1); else f.a += (Math.random() - .5) * 0.4;
      move(f, target ? P.pred.speed : P.pred.speed * 0.7);
      f.e -= P.pred.cost;
      if (target && (target.x - f.x) ** 2 + (target.y - f.y) ** 2 < 36) { target.e = -1; f.e += P.pred.gain; }
      if (f.e > P.pred.split && pred.length + pBorn.length < capPred) { f.e /= 2; pBorn.push({ x: f.x, y: f.y, a: f.a + 3.14, e: f.e }); }
    }
    pred = pred.filter(f => f.e > 0).concat(pBorn);
    prey = prey.filter(h => h.e > 0);

    // newcomers wander in if a species has died out
    if (tick % 400 === 399) {
      if (prey.length === 0) for (let i = 0; i < 10; i++) prey.push(animal(0.8));
      if (pred.length === 0) for (let i = 0; i < 3; i++) pred.push(animal(1.2));
    }

    if (++tick % 6 === 0) {
      let g = 0; for (const v of grass) g += v;
      hist.push([g / grass.length, prey.length, pred.length]);
      if (hist.length > HIST) hist.shift();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const g = grass[y * cols + x];
      if (g > 0.05) { ctx.fillStyle = `rgba(${c.cell},${g * 0.35})`; ctx.fillRect(x * CELL, y * CELL, CELL, CELL); }
    }
    ctx.fillStyle = `rgb(${c.prey})`;
    for (const h of prey) { ctx.beginPath(); ctx.arc(h.x, h.y, 3, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = `rgb(${c.pred})`;
    for (const f of pred) {
      ctx.beginPath();
      ctx.moveTo(f.x + Math.cos(f.a) * 7, f.y + Math.sin(f.a) * 7);
      ctx.lineTo(f.x + Math.cos(f.a + 2.4) * 5, f.y + Math.sin(f.a + 2.4) * 5);
      ctx.lineTo(f.x + Math.cos(f.a - 2.4) * 5, f.y + Math.sin(f.a - 2.4) * 5);
      ctx.fill();
    }
    // population chart
    const cw = chart.clientWidth, ch = chart.clientHeight;
    cctx.clearRect(0, 0, cw, ch);
    if (hist.length > 1) {
      const maxPrey = Math.max(60, ...hist.map(r => r[1])), maxPred = Math.max(10, ...hist.map(r => r[2]));
      const series = [[0, 1, c.cell], [1, maxPrey, c.prey], [2, maxPred, c.pred]];
      for (const [k, max, col] of series) {
        cctx.strokeStyle = `rgb(${col})`; cctx.lineWidth = 1.5; cctx.beginPath();
        hist.forEach((r, i) => {
          const x = (i / (HIST - 1)) * cw, y = ch - 4 - (r[k] / max) * (ch - 8);
          i ? cctx.lineTo(x, y) : cctx.moveTo(x, y);
        });
        cctx.stroke();
      }
    }
    document.getElementById("k-nprey").textContent = prey.length;
    document.getElementById("k-npred").textContent = pred.length;
  }

  function loop() {
    if (!playing || !visible) return;
    for (let i = 0; i < speed; i++) step();
    draw();
    requestAnimationFrame(loop);
  }
  const resume = () => { if (playing && visible) requestAnimationFrame(loop); };

  readColors(); restart(); draw();
  window.addEventListener("resize", () => { restart(); draw(); });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { readColors(); draw(); });
  new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) resume(); }).observe(canvas);

  const playBtn = document.getElementById("k-play");
  playBtn.textContent = playing ? "pause" : "play";
  playBtn.addEventListener("click", () => { playing = !playing; playBtn.textContent = playing ? "pause" : "play"; resume(); });
  const speedBtn = document.getElementById("k-speed");
  speedBtn.addEventListener("click", () => { speed = speed === 1 ? 5 : 1; speedBtn.textContent = `speed ×${speed}`; });
  document.getElementById("k-prey").addEventListener("click", () => { for (let i = 0; i < 20; i++) prey.push(animal(0.8)); draw(); });
  document.getElementById("k-pred").addEventListener("click", () => { for (let i = 0; i < 4; i++) pred.push(animal(1.2)); draw(); });
  document.getElementById("k-reset").addEventListener("click", () => { restart(); draw(); });

  // used only for tuning/testing from the console
  return { P, run(n) { for (let i = 0; i < n; i++) step(); return [prey.length, pred.length]; }, restart, get hist() { return hist; } };
})();
