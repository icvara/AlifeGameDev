// Charts page. Reads GAMES, ITCH_GAMES, OTHER_GAMES, PROJECTS, RELATED and SCORE_CRITERIA
// from games.js and draws plain SVG charts. Colours come from CSS variables in style.css (.viz).

(function () {
  const NS = "http://www.w3.org/2000/svg";
  const tip = document.getElementById("tooltip");

  // Groups. Colour is capped at 3 hues (validated for scatter plots), so the three
  // non-store groups share a colour and are told apart by shape.
  const GROUPS = [
    { key: "steam",   label: "Steam",     color: "var(--s1)", shape: "circle" },
    { key: "itch",    label: "itch.io",   color: "var(--s2)", shape: "square" },
    { key: "other",   label: "Elsewhere", color: "var(--s3)", shape: "triangle" },
    { key: "project", label: "Projects",  color: "var(--s3)", shape: "diamond" },
    { key: "related", label: "Related",   color: "var(--s3)", shape: "cross" },
    { key: "animal",  label: "Play as an animal", color: "var(--s3)", shape: "x" },
    { key: "board",   label: "Board games", color: "var(--s2)", shape: "triangle" },
    // Comparison group: popular non-ALife Steam games, in neutral grey (hollow marks) so it reads as context.
    { key: "reference", label: "Popular on Steam", color: "var(--ref)", shape: "ring" },
    // Second comparison group, environmental charts only: the games most studied in conservation research.
    { key: "research", label: "Studied in conservation research", color: "var(--ref)", shape: "box" },
  ];
  const groupOf = k => GROUPS.find(g => g.key === k);
  const isRef = g => g.platform === "reference";
  const isResearch = g => g.platform === "research";
  const isComp = g => isRef(g) || isResearch(g);

  // Dedupe: Spore is both on Steam and in Related; keep the Steam entry.
  const seen = new Set();
  const ALL = [...GAMES, ...ITCH_GAMES, ...OTHER_GAMES, ...PROJECTS, ...RELATED, ...ANIMAL_GAMES, ...BOARD_GAMES, ...REFERENCE, ...ECO_CONTROL]
    .filter(g => {
      const key = (g.platform === "board" ? "board:" : "") + g.name; // a board game can share a video game's name
      return (g.score || g.eco) && !seen.has(key) && seen.add(key);
    });

  const active = new Set(GROUPS.map(g => g.key));
  // Rows for one score: only games that have it (the research group has no ALife score).
  const data = (S = SCORESETS.alife) => ALL.filter(g => active.has(g.platform) && S.has(g));

  // ---------- helpers ----------
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  const svgFor = (container, h) => {
    container.innerHTML = "";
    const w = Math.max(280, container.clientWidth);
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img" }, container);
    return { svg, w, h };
  };
  const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; };
  const jitter = (s, amt) => (((hash(s) >>> 0) % 1000) / 1000 - 0.5) * 2 * amt;
  const yearOf = g => {
    if (/coming/.test(g.year || "")) return null;          // unreleased
    const m = String(g.date || g.year || "").match(/(19|20)\d\d/);
    return m ? +m[0] : null;
  };
  const showTip = (html, x, y) => {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > innerHeight - 8) top = y - r.height - 14;
    tip.style.left = left + "px"; tip.style.top = top + "px";
  };
  const hideTip = () => { tip.hidden = true; };
  const breakdown = g => SCORE_CRITERIA.map(([k], i) => `${k} ${g.score[i]}`).join(" · ");
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n);

  function shape(parent, kind, x, y, r, fill) {
    const common = { fill, stroke: "var(--surface)", "stroke-width": 2 };
    if (kind === "box") return el("rect", { x: x - r + 1, y: y - r + 1, width: 2 * r - 2, height: 2 * r - 2, fill: "var(--surface)", stroke: fill, "stroke-width": 2 }, parent);
    if (kind === "ring") return el("circle", { cx: x, cy: y, r: r - 0.5, fill: "var(--surface)", stroke: fill, "stroke-width": 2 }, parent);
    if (kind === "circle") return el("circle", { cx: x, cy: y, r, ...common }, parent);
    if (kind === "square") return el("rect", { x: x - r, y: y - r, width: 2 * r, height: 2 * r, rx: 1.5, ...common }, parent);
    if (kind === "triangle") return el("path", { d: `M${x},${y - r * 1.2} L${x + r * 1.1},${y + r * 0.8} L${x - r * 1.1},${y + r * 0.8}Z`, ...common }, parent);
    if (kind === "diamond") return el("path", { d: `M${x},${y - r * 1.25} L${x + r * 1.1},${y} L${x},${y + r * 1.25} L${x - r * 1.1},${y}Z`, ...common }, parent);
    const t = r * 0.45; // cross (or "x": the same cross turned 45°)
    if (kind === "x") common.transform = `rotate(45 ${x} ${y})`;
    return el("path", { d: `M${x - t},${y - r} h${2 * t} v${r - t} h${r - t} v${2 * t} h${-(r - t)} v${r - t} h${-2 * t} v${-(r - t)} h${-(r - t)} v${-2 * t} h${r - t}Z`, ...common }, parent);
  }
  const legendSwatch = g => {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("width", 14); s.setAttribute("height", 14); s.setAttribute("aria-hidden", "true");
    shape(s, g.shape, 7, 7, 5, g.color);
    return s.outerHTML;
  };

  // ---------- group filter ----------
  const groupsEl = document.getElementById("groups");
  groupsEl.innerHTML = GROUPS.map(g =>
    `<button type="button" data-group="${g.key}" aria-pressed="true">${legendSwatch(g)} ${g.label}</button>`).join("");
  groupsEl.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const k = b.dataset.group;
    if (active.has(k) && active.size > 1) active.delete(k); else active.add(k);
    groupsEl.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", active.has(x.dataset.group)));
    renderAll();
  });

  // ---------- the two scores ----------
  // Every chart below is drawn once per score. `ids` prefixes the element ids ("" or "eco-").
  const SCORESETS = {
    alife: {
      ids: "", label: "ALife score", max: 12, step: 3, color: "var(--s1)",
      criteria: SCORE_CRITERIA, has: g => !!g.score, vals: g => g.score, total: g => g.scoreTotal,
    },
    eco: {
      ids: "eco-", label: "Environmental score", max: 8, step: 2, color: "var(--s3)",
      criteria: ECO_CRITERIA, has: g => !!g.eco, vals: g => g.eco || [null, null, null, null], total: g => g.ecoTotal ?? 0,
    },
  };
  const $ = (S, id) => document.getElementById(S.ids + id);
  const ecoBreakdown = g => g.eco ? ECO_CRITERIA.map(([k], i) => `${k} ${g.eco[i] ?? "?"}`).join(" · ") : "";

  // ---------- 1. scatter ----------
  const catsTo = n => Array.from({ length: n + 1 }, (_, i) => String(i));
  const X_COMMON = {
    year:   { label: "release year", get: yearOf },
    steam:  { label: "Steam reviews", get: g => g.platform !== "itch" && g.popularity > 0 ? g.popularity : null, log: true },
    itch:   { label: "itch.io ratings", get: g => g.platform === "itch" && g.popularity > 0 ? g.popularity : null, log: true },
  };
  const X_OPTIONS = {
    alife: { ...X_COMMON, other: { label: "environmental score (out of 8)", get: g => g.ecoTotal ?? null, cats: catsTo(8) } },
    eco:   { ...X_COMMON, other: { label: "ALife score (out of 12)", get: g => g.scoreTotal ?? null, cats: catsTo(12) } },
  };
  const NOTES = {
    year: "itch.io games have no release date, and unreleased games are left out.",
    steam: "Every game sold on Steam, from any group, including both grey comparison groups. Unreleased games have no reviews yet.",
    itch: "itch.io games only, by number of player ratings.",
    other: "The two scores barely go together: a game can be deep ALife with no environmental angle, or the reverse.",
  };
  const xKey = { alife: "year", eco: "year" };
  for (const key of Object.keys(SCORESETS)) {
    const S = SCORESETS[key], xEl = $(S, "x-axis");
    xEl.innerHTML = Object.entries(X_OPTIONS[key]).map(([k, o]) => `<button type="button" data-x="${k}">${o.label}</button>`).join("");
    xEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { xKey[key] = b.dataset.x; renderScatter(key); } });
  }

  function renderScatter(key) {
    const S = SCORESETS[key], xEl = $(S, "x-axis");
    xEl.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.x === xKey[key]));
    const opt = X_OPTIONS[key][xKey[key]];
    const rows = data(S).map(g => ({ g, x: opt.get(g) })).filter(r => r.x !== null && r.x !== undefined);
    const missing = data(S).length - rows.length;
    $(S, "scatter-legend").innerHTML = GROUPS.filter(g => active.has(g.key) && ALL.some(x => x.platform === g.key && S.has(x)))
      .map(g => `<span>${legendSwatch(g)} ${g.label}</span>`).join("");

    const box = $(S, "scatter");
    const { svg, w, h } = svgFor(box, 360);
    const m = { l: 44, r: 16, t: 14, b: 44 };
    const iw = w - m.l - m.r, ih = h - m.t - m.b;
    const ys = v => m.t + ih - (v / S.max) * ih;

    // x scale
    let xs, ticks;
    if (opt.cats) {
      xs = v => m.l + ((v + 0.5) / opt.cats.length) * iw;
      ticks = opt.cats.map((c, i) => [i, c]);
    } else if (opt.log) {
      const max = Math.max(10, ...rows.map(r => r.x));
      const lmax = Math.ceil(Math.log10(max));
      xs = v => m.l + (Math.log10(Math.max(1, v)) / lmax) * iw;
      ticks = Array.from({ length: lmax + 1 }, (_, i) => [10 ** i, fmt(10 ** i)]);
    } else {
      const xsV = rows.map(r => r.x);
      const lo = Math.floor(Math.min(...xsV) / 10) * 10, hi = Math.max(...xsV) + 1;
      const d0 = lo - 2;
      xs = v => m.l + ((v - d0) / (hi - d0)) * iw;
      ticks = []; for (let t = lo; t <= hi; t += 10) ticks.push([t, String(t)]);
    }

    // grid + axes
    const grid = el("g", {}, svg);
    for (let v = 0; v <= S.max; v += S.step) {
      el("line", { x1: m.l, x2: m.l + iw, y1: ys(v), y2: ys(v), class: v === 0 ? "axis" : "grid" }, grid);
      el("text", { x: m.l - 8, y: ys(v) + 4, class: "tick", "text-anchor": "end" }, grid).textContent = v;
    }
    for (const [v, label] of ticks) {
      el("text", { x: xs(v), y: m.t + ih + 18, class: "tick", "text-anchor": "middle" }, grid).textContent = label;
    }
    el("text", { x: m.l + iw / 2, y: h - 6, class: "axis-label", "text-anchor": "middle" }, svg).textContent =
      opt.label + (opt.log ? " (log scale)" : "");
    el("text", { x: 12, y: m.t + ih / 2, class: "axis-label", "text-anchor": "middle", transform: `rotate(-90 12 ${m.t + ih / 2})` }, svg)
      .textContent = `${S.label} (out of ${S.max})`;

    // points (jittered so equal values don't hide each other)
    const pts = rows.map(({ g, x }) => {
      const jx = opt.cats ? jitter(g.name, 0.3) * (iw / opt.cats.length) : opt.log ? 0 : jitter(g.name + "x", 0.35) * (iw / 60);
      return { g, x, px: xs(x) + jx, py: ys(S.total(g) + jitter(g.name, 0.3)) };
    });
    const layer = el("g", {}, svg);
    for (const p of pts) { const gr = groupOf(p.g.platform); p.node = shape(layer, gr.shape, p.px, p.py, 5, gr.color); }

    // hover: nearest point within 16px
    const hit = el("rect", { x: m.l, y: m.t, width: iw, height: ih, fill: "transparent" }, svg);
    let last = null;
    hit.addEventListener("pointermove", e => {
      const r = svg.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      let best = null, bd = 16 * 16;
      for (const p of pts) { const d = (p.px - mx) ** 2 + (p.py - my) ** 2; if (d < bd) { bd = d; best = p; } }
      if (last && last !== best) last.node.classList.remove("hot");
      if (!best) { hideTip(); last = null; return; }
      best.node.classList.add("hot"); last = best;
      const g = best.g, xv = opt.cats ? opt.cats[best.x] : opt.log ? fmt(best.x) : best.x;
      showTip(`<b>${g.name}</b><br>${S.label} ${S.total(g)}/${S.max} · ${opt.label}: ${xv}` +
        `<br><span class="tip-muted">ALife: ${breakdown(g)}</span>` +
        (g.eco ? `<br><span class="tip-muted">environment: ${ecoBreakdown(g)}</span>` : ""), e.clientX, e.clientY);
    });
    hit.addEventListener("pointerleave", () => { hideTip(); if (last) last.node.classList.remove("hot"); last = null; });

    // Direct labels for a few top scorers, so the chart reads without hovering.
    // A label is skipped if it would overlap one already placed.
    const placed = [];
    const top = [...pts].sort((a, b) => S.total(b.g) - S.total(a.g)).slice(0, 6);
    for (const p of top) {
      if (placed.length >= 3) break;
      for (const right of [p.px < m.l + iw - 130, !(p.px < m.l + iw - 130)]) {
        const t = el("text", { x: p.px + (right ? 9 : -9), y: p.py + 4, class: "point-label", "text-anchor": right ? "start" : "end" }, svg);
        t.textContent = p.g.name;
        const b = t.getBBox();
        const clash = placed.some(o => b.x < o.x + o.width + 4 && o.x < b.x + b.width + 4 && b.y < o.y + o.height && o.y < b.y + b.height)
          || b.x < m.l || b.x + b.width > w
          || pts.some(o => o !== p && o.px > b.x - 6 && o.px < b.x + b.width + 6 && o.py > b.y - 6 && o.py < b.y + b.height + 6);
        if (clash) { t.remove(); continue; }
        placed.push(b); break;
      }
    }

    $(S, "scatter-note").textContent =
      `${rows.length} games shown${missing ? `, ${missing} without this data left out` : ""}. ${NOTES[xKey[key]]}` +
      (key === "eco" ? " Unknown criteria (?) count as 0." : "");
  }

  // ---------- 2. criteria distribution (stacked bars) ----------
  // Levels 0-2, plus "?" (unknown, environmental score only), drawn hollow with a dashed outline.
  const LEVELS = [["0", "none", "var(--o0)"], ["1", "partly", "var(--o1)"], ["2", "fully", "var(--o2)"]];
  const hasUnknown = S => data(S).some(g => S.vals(g).includes(null));
  const critLegend = key => {
    const S = SCORESETS[key];
    $(S, "crit-legend").innerHTML =
      LEVELS.map(([v, l, c]) => `<span><i style="background:${c}"></i>${v}: ${l}</span>`).join("") +
      (hasUnknown(S) ? `<span><i class="unknown-swatch"></i>?: unknown</span>` : "") +
      (compSets(S).length ? `<span class="legend-sep">comparison games, same levels in grey:</span>` +
        [0, 1, 2].map(v => `<span><i style="background:var(--r${v})"></i>${v}</span>`).join("") : "");
  };

  // One bar per criterion for the ALife games, plus a second bar for the popular games when that group is on.
  // Comparison sets shown next to the listed games: [label, short label, rows, colour].
  const compSets = S => [
    ["popular games", "popular", data(S).filter(isRef), "var(--ref)"],
    ["studied in conservation research", "research", data(S).filter(isResearch), "var(--r2)"],
  ].filter(c => c[2].length);
  function renderCriteria(key) {
    const S = SCORESETS[key];
    const sets = [["listed games", data(S).filter(g => !isComp(g))], ...compSets(S).map(([n, sh, r]) => [n, r, sh])];
    const box = $(S, "criteria");
    const barH = 18, gap = 4, blockH = sets.length * (barH + gap) + 14;
    const m = { l: 104, r: hasUnknown(S) ? 120 : 64, t: 6, b: 6 };
    const { svg, w } = svgFor(box, m.t + m.b + blockH * S.criteria.length);
    const iw = w - m.l - m.r;
    S.criteria.forEach(([name], i) => {
      const top = m.t + i * blockH + 4;
      sets.forEach(([setName, rows], si) => {
        const y = top + si * (barH + gap);
        if (si === 0) el("text", { x: m.l - 10, y: y + barH / 2 + 4, class: "tick crit-name", "text-anchor": "end" }, svg).textContent = name;
        else el("text", { x: m.l - 10, y: y + barH / 2 + 4, class: "tick sub", "text-anchor": "end" }, svg).textContent = sets[si][2];
        let x = m.l;
        [0, 1, 2, null].forEach((v, vi) => {
          const list = rows.filter(g => S.vals(g)[i] === v);
          const sw = rows.length ? (list.length / rows.length) * iw : 0;
          if (sw <= 0) return;
          const unknown = v === null;
          const fill = unknown ? "var(--surface)" : si > 0 ? `var(--r${v})` : LEVELS[v][2];
          const attrs = { x: x + (vi ? 1 : 0), y, width: Math.max(0, sw - (vi ? 1 : 0) - 1), height: barH, rx: 2, fill };
          if (unknown) Object.assign(attrs, { stroke: "var(--faint)", "stroke-dasharray": "3 2", "stroke-width": 1 });
          const seg = el("rect", attrs, svg);
          const lvl = unknown ? "?: unknown" : `${v} (${LEVELS[v][1]})`;
          seg.addEventListener("pointermove", e => showTip(`<b>${name}: ${lvl}</b>, ${setName}<br>${list.length} of ${rows.length}<br><span class="tip-muted">${list.slice(0, 8).map(g => g.name).join(", ")}${list.length > 8 ? "…" : ""}</span>`, e.clientX, e.clientY));
          seg.addEventListener("pointerleave", hideTip);
          x += sw;
        });
        // Average over known values only.
        const known = rows.map(g => S.vals(g)[i]).filter(v => v !== null);
        const avg = known.length ? known.reduce((s, v) => s + v, 0) / known.length : null;
        el("text", { x: m.l + iw + 8, y: y + barH / 2 + 4, class: "tick" }, svg).textContent = avg === null ? "avg ?"
          : `avg ${avg.toFixed(1)}` + (known.length < rows.length ? ` (${known.length} known)` : "");
      });
    });
  }

  // ---------- 3. histogram ----------
  function renderHistogram(key) {
    const S = SCORESETS[key], n = S.max + 1;
    const rows = data(S);
    const box = $(S, "histogram");
    const { svg, w, h } = svgFor(box, 220);
    const m = { l: 36, r: 10, t: 12, b: 34 };
    const iw = w - m.l - m.r, ih = h - m.t - m.b;
    // Two series side by side in each score bin: ALife games (colour) and popular games (grey).
    const series = [["listed games", rows.filter(g => !isComp(g)), S.color], ...compSets(S).map(([n, , r, c]) => [n, r, c])];
    const bins = series.map(([, list]) => Array.from({ length: n }, (_, s) => list.filter(g => S.total(g) === s)));
    const max = Math.max(1, ...bins.flat().map(b => b.length));
    const step = Math.max(1, Math.ceil(max / 4));
    for (let v = 0; v <= max; v += step) {
      el("line", { x1: m.l, x2: m.l + iw, y1: m.t + ih - (v / max) * ih, y2: m.t + ih - (v / max) * ih, class: v ? "grid" : "axis" }, svg);
      el("text", { x: m.l - 8, y: m.t + ih - (v / max) * ih + 4, class: "tick", "text-anchor": "end" }, svg).textContent = v;
    }
    const bw = iw / n, sub = (bw - 4) / series.length;
    for (let s = 0; s < n; s++) {
      series.forEach(([name, , color], k) => {
        const list = bins[k][s];
        if (!list.length) return;
        const bh = (list.length / max) * ih, x = m.l + s * bw + 2 + k * sub;
        const bar = el("path", { d: roundTop(x + (k ? 1 : 0), m.t + ih - bh, sub - (series.length > 1 ? 1 : 0), bh, 3), fill: color }, svg);
        bar.addEventListener("pointermove", e => showTip(`<b>Score ${s}/${S.max}</b>, ${name}: ${list.length}<br><span class="tip-muted">${list.slice(0, 10).map(g => g.name).join(", ")}${list.length > 10 ? "…" : ""}</span>`, e.clientX, e.clientY));
        bar.addEventListener("pointerleave", hideTip);
      });
      el("text", { x: m.l + s * bw + bw / 2, y: m.t + ih + 16, class: "tick", "text-anchor": "middle" }, svg).textContent = s;
    }
    $(S, "hist-legend").innerHTML = series.length > 1
      ? series.map(([nm, , c]) => `<span><i style="background:${c}"></i>${nm}</span>`).join("") : "";
    el("text", { x: m.l + iw / 2, y: h - 4, class: "axis-label", "text-anchor": "middle" }, svg).textContent = `${S.label} (out of ${S.max})`;
  }
  // Bar with rounded top corners, anchored flat on the baseline.
  function roundTop(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
  }

  // ---------- 4. average by group ----------
  function renderByGroup(key) {
    const S = SCORESETS[key];
    const box = $(S, "by-group");
    const groups = GROUPS.filter(g => active.has(g.key)).map(g => {
      const list = ALL.filter(x => x.platform === g.key && S.has(x));
      return { g, n: list.length, avg: list.reduce((s, x) => s + S.total(x), 0) / (list.length || 1) };
    }).filter(r => r.n);
    const rowH = 30, m = { l: 92, r: 90, t: 4, b: 4 };
    const { svg, w } = svgFor(box, m.t + m.b + rowH * groups.length);
    const iw = w - m.l - m.r;
    groups.forEach(({ g, n, avg }, i) => {
      const y = m.t + i * rowH + 6, bh = rowH - 12, bw = (avg / S.max) * iw;
      el("text", { x: m.l - 10, y: y + bh / 2 + 4, class: "tick", "text-anchor": "end" }, svg).textContent = g.label;
      el("path", { d: roundRight(m.l, y, bw, bh, 4), fill: g.key === "reference" ? "var(--ref)" : g.key === "research" ? "var(--r2)" : S.color }, svg);
      el("text", { x: m.l + bw + 8, y: y + bh / 2 + 4, class: "value" }, svg).textContent = `${avg.toFixed(1)} / ${S.max}`;
      el("text", { x: m.l + bw + 8 + 62, y: y + bh / 2 + 4, class: "tick" }, svg).textContent = `(${n})`;
    });
  }
  function roundRight(x, y, w, h, r) {
    r = Math.min(r, h / 2, w);
    return `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z`;
  }

  // ---------- 5. table ----------
  let sortCol = "score", sortDir = -1;
  function renderTable() {
    // Short column headings so the table fits the page; the full name is in the tooltip.
    const SHORT = { autonomy: "auto", brains: "brain", body: "body", evolution: "evol", ecosystem: "eco", emergence: "emerg" };
    const ESHORT = { intentionality: "intent", worldbuilding: "world", mechanics: "mech", impact: "impact" };
    const cols = [["name", "game"], ["group", "group"], ["score", "score"],
      ...SCORE_CRITERIA.map(([k], i) => ["c" + i, SHORT[k] || k, k]),
      ["eco", "env.", "environmental score (out of 8)"],
      ...ECO_CRITERIA.map(([k], i) => ["e" + i, ESHORT[k] || k, "environmental: " + k])];
    const val = (g, c) => c === "name" ? g.name.toLowerCase() : c === "group" ? groupOf(g.platform).label
      : c === "score" ? g.scoreTotal : c === "eco" ? (g.ecoTotal ?? -1)
      : c[0] === "e" ? (g.eco ? g.eco[+c.slice(1)] ?? -1 : -1) : g.score[+c.slice(1)];
    const rows = [...data()].sort((a, b) => {
      const va = val(a, sortCol), vb = val(b, sortCol);
      return (va < vb ? -1 : va > vb ? 1 : 0) * sortDir || b.scoreTotal - a.scoreTotal;
    });
    const t = document.getElementById("table");
    t.innerHTML = `<thead><tr>${cols.map(([c, l, full]) =>
      `<th scope="col" data-col="${c}"${full ? ` title="${full}"` : ""} aria-sort="${c === sortCol ? (sortDir > 0 ? "ascending" : "descending") : "none"}">${l}${c === sortCol ? (sortDir > 0 ? " ↑" : " ↓") : ""}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(g => `<tr>
        <th scope="row"><a href="${g.link}" target="_blank" rel="noopener">${g.name}</a></th>
        <td class="grp">${groupOf(g.platform).label}</td>
        <td class="num"><b>${g.scoreTotal}</b></td>
        ${g.score.map(v => `<td class="lvl l${v}">${v}</td>`).join("")}
        <td class="num eco-col"><b>${g.ecoTotal ?? "–"}</b></td>
        ${(g.eco || [null, null, null, null]).map(v => v === null ? `<td class="lvl unknown">?</td>` : `<td class="lvl l${v}">${v}</td>`).join("")}      </tr>`).join("")}</tbody>`;
  }
  document.getElementById("table").addEventListener("click", e => {
    const th = e.target.closest("thead th"); if (!th) return;
    const c = th.dataset.col;
    if (c === sortCol) sortDir = -sortDir; else { sortCol = c; sortDir = c === "name" || c === "group" ? 1 : -1; }
    renderTable();
  });

  function renderAll() {
    for (const key of Object.keys(SCORESETS)) { renderScatter(key); critLegend(key); renderCriteria(key); renderHistogram(key); renderByGroup(key); }
    renderTable();
  }
  renderAll();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(renderAll, 150); });
})();
