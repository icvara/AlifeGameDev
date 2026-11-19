// Working paper page: builds the corpus with explicit, reproducible inclusion rules, fills every [data-stat]
// from the live data in games.js, and draws the figures. Change a rule here and the whole paper follows.
(function () {
  const NS = "http://www.w3.org/2000/svg";

  // ---------- selection rules ----------
  const ALIFE_MIN = 5;                                                          // R4: minimum ALife score for the artificial life group
  const isReleased = g => g.date !== "9999" && !/coming/i.test(g.year || "");   // R1: publicly released
  const isPrototype = g => g.platform === "itch";                               // R2: itch.io prototypes and jams
  const isBoard = g => g.platform === "board";                                  // R3: board games, analysed separately

  const GROUPS = [
    { key: "steam",     label: "ALife: Steam",      color: "var(--s1)", shape: "circle",   alife: true, about: "commercial artificial life games on Steam" },
    { key: "other",     label: "ALife: elsewhere",  color: "var(--s3)", shape: "triangle", alife: true, about: "classics, console and browser games, including the 1990s Maxis simulations" },
    { key: "project",   label: "ALife: projects",   color: "var(--s3)", shape: "diamond",  alife: true, about: "research simulations and software toys (Tierra, Avida, Framsticks…)" },
    { key: "alife-more", label: "ALife: other lists", color: "var(--s3)", shape: "square", alife: true, about: "games listed under Related or Play as an animal on the site that still score 5 or more" },
    { key: "related",   label: "Related",           color: "var(--s3)", shape: "cross",    about: "famous games touching on ALife ideas, scoring below 5" },
    { key: "animal",    label: "Play as an animal", color: "var(--s3)", shape: "x",        about: "games about living one animal's life in an ecosystem, scoring below 5" },
    { key: "reference", label: "Popular on Steam",  color: "var(--ref)", shape: "ring",    about: "15 of the most-played Steam games, as a mainstream baseline" },
    { key: "research",  label: "Conservation research", color: "var(--ref)", shape: "box", about: "all games covered by at least three papers in Blake et al.'s systematic map, including 11 also counted in another group" },
  ];
  // R4 decides group membership: every catalogue video game scoring ALIFE_MIN or more is an artificial life game,
  // whichever list of the site it comes from. The two comparison samples (popular, research) are kept whole.
  const ALIFE_LISTS = ["steam", "other", "project"];
  const paperGroup = g => {
    if (g.platform === "reference" || g.platform === "research") return g.platform;
    if (g.scoreTotal >= ALIFE_MIN) return ALIFE_LISTS.includes(g.platform) ? g.platform : "alife-more";
    return g.platform;
  };
  const isAlifeGroup = g => !!GROUPS.find(x => x.key === paperGroup(g))?.alife;

  // Every scored entry, deduplicated (a board game may share a video game's name).
  const seen = new Set();
  const CATALOGUE = [...GAMES, ...ITCH_GAMES, ...OTHER_GAMES, ...PROJECTS, ...RELATED, ...ANIMAL_GAMES, ...BOARD_GAMES, ...REFERENCE]
    .filter(g => {
      const key = (isBoard(g) ? "board:" : "") + g.name;
      return g.score && g.eco && !seen.has(key) && seen.add(key);
    });
  const RESEARCH = ECO_CONTROL.filter(g => g.score && g.eco && !seen.has(g.name));

  // Selection steps, applied in order; each one records what it removed.
  const FLOW = [];
  let pool = CATALOGUE;
  const step = (label, keep) => { const out = pool.filter(g => !keep(g)); pool = pool.filter(keep); FLOW.push({ label, n: out.length, out }); };
  step("itch.io prototypes and jams (R2)", g => !isPrototype(g));
  step("board games, analysed separately in section 5.7 (R3)", g => !isBoard(g));
  step("not yet released (R1)", isReleased);
  const alifeCandidates = pool.filter(g => ALIFE_LISTS.includes(g.platform));
  // Threshold-free artificial life group (Figures 4, 4b, 5, 5b and 7): every released, non-itch.io game from the
  // site's artificial life lists, plus games from other lists that reach the ALife threshold anyway.
  step(`games from the ALife lists scoring below ${ALIFE_MIN}/12 (R4)`, g => !ALIFE_LISTS.includes(g.platform) || g.scoreTotal >= ALIFE_MIN);
  const INCLUDED = [...pool, ...RESEARCH];
  const BOARD = CATALOGUE.filter(g => isBoard(g) && isReleased(g));

  const of = k => INCLUDED.filter(g => paperGroup(g) === k);
  const core = INCLUDED.filter(isAlifeGroup);
  const alifeNoThreshold = [...new Set([...alifeCandidates, ...of("alife-more")])];
  // The conservation research group holds ALL most-studied games: the ones only known from Blake et al.'s map,
  // plus those the site already lists in another group (STUDIED_ALSO). Those are counted in both groups.
  const researchOnly = of("research");
  const researchAll = [...researchOnly, ...CATALOGUE.filter(g => STUDIED_ALSO.includes(g.name) && !isBoard(g))];
  const research = researchAll;
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const corr = (xs, ys) => {
    const mx = mean(xs), my = mean(ys); let c = 0, vx = 0, vy = 0;
    xs.forEach((x, i) => { c += (x - mx) * (ys[i] - my); vx += (x - mx) ** 2; vy += (ys[i] - my) ** 2; });
    return c / Math.sqrt(vx * vy);
  };
  const f1 = x => x.toFixed(1), f2 = x => x.toFixed(2);
  const A = g => g.scoreTotal, E = g => g.ecoTotal;
  const crit = (list, i) => mean(list.map(g => g.score[i]));
  const ecrit = (list, i) => mean(list.map(g => g.eco[i] ?? 0));
  const words = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  const count = n => n <= 10 ? words[n] : String(n);
  const names = list => {
    const n = list.map(g => g.name);
    return n.length <= 1 ? n.join("") : n.slice(0, -1).join(", ") + " and " + n[n.length - 1];
  };

  const both = INCLUDED.filter(g => A(g) >= 6 && E(g) >= 5);
  const coreHigh = core.filter(g => A(g) >= 8);
  const intent = INCLUDED.filter(g => g.eco[0] === 2);
  const impact = INCLUDED.filter(g => g.eco[3] !== null && g.eco[3] !== undefined);
  const resTop = [...research].sort((a, b) => A(b) - A(a)).filter((g, i, s) => A(g) === A(s[0]));
  const STUDIED_TOTAL = 50;                       // games with at least three papers in Blake et al.'s map
  const overlap = STUDIED_ALSO.length;              // studied games that also belong to another group

  const STATS = {
    alifeMin: ALIFE_MIN,
    nCatalogue: CATALOGUE.length,
    n: INCLUDED.length,
    nCore: core.length,
    nCandidates: alifeCandidates.length,
    nResearch: research.length,
    nOverlap: overlap,
    nBoard: BOARD.length,
    rAll: f2(corr(INCLUDED.map(A), INCLUDED.map(E))),
    rCore: f2(corr(core.map(A), core.map(E))),
    resAlife: f1(mean(research.map(A))), coreAlife: f1(mean(core.map(A))),
    resEco: f1(mean(research.map(E))), coreEco: f1(mean(core.map(E))),
    refName: "the popular Steam games", refAlife: f1(mean(of("reference").map(A))),
    resHigh: count(research.filter(g => A(g) >= 6).length).toLowerCase(),
    resHighPhrase: (n => n === 0 ? "None of them reaches" : n === 1 ? "Only one reaches" : `Only ${count(n).toLowerCase()} reach`)(research.filter(g => A(g) >= 6).length),
    resTop: `${names(resTop)} (${resTop.length ? A(resTop[0]) : 0}/12)`,
    resWorld: f2(ecrit(researchAll, 1)), coreWorld: f2(ecrit(core, 1)),
    resMech: f2(ecrit(researchAll, 2)), coreMech: f2(ecrit(core, 2)),
    nResearchAll: researchAll.length, nDouble: core.filter(g => STUDIED_ALSO.includes(g.name)).length + of("reference").filter(g => STUDIED_ALSO.includes(g.name)).length,
    bothN: count(both.length).toLowerCase(), both: names(both),
    coreHighN: coreHigh.length, coreHighEcoN: count(coreHigh.filter(g => E(g) >= 5).length).toLowerCase(),
    intentN: intent.length, intentAlife: f1(mean(intent.map(A))),
    impactN: count(impact.length).toLowerCase(), impact: names(impact),
    boardAlife: f1(mean(BOARD.map(A))), boardEco: f1(mean(BOARD.map(E))),
  };
  document.querySelectorAll("[data-stat]").forEach(el => {
    const v = STATS[el.dataset.stat];
    el.textContent = v === undefined ? "?" : v;
  });

  document.getElementById("group-list").innerHTML = GROUPS.map(g =>
    `<li><b>${g.label}</b> (${g.key === "research" ? research.length : of(g.key).length}): ${g.about}</li>`).join("");

  // ---------- Figure 1: selection flow ----------
  const flowEl = document.getElementById("fig-flow");
  if (flowEl) {
    const box = (n, text, cls = "") => `<div class="flow-box ${cls}"><b>${n}</b> ${text}</div>`;
    const ex = f => `<div class="flow-out"><span>− ${f.n}</span> ${f.label}<details><summary>list</summary>${f.out.map(g => g.name).join(", ") || "none"}</details></div>`;
    let remaining = CATALOGUE.length;
    let html = `<div class="flow-col"><p class="flow-head">Site catalogue</p>` + box(remaining, "scored entries (video and board games)");
    FLOW.forEach((f, i) => {
      remaining -= f.n;
      const last = i === FLOW.length - 1;
      html += ex(f) + box(remaining, last ? "games included from the catalogue" : "remaining", last ? "final" : "");
    });
    html += `</div><div class="flow-col"><p class="flow-head">Blake et al.'s map</p>` +
      box(450, "commercial games studied in 380 papers") +
      `<div class="flow-out"><span>− ${450 - STUDIED_TOTAL}</span> covered by fewer than three papers</div>` +
      box(STUDIED_TOTAL, "most-studied games") +
      `<div class="flow-out"><span>${overlap}</span> of them are also in the catalogue: counted in both groups<details><summary>list</summary>${STUDIED_ALSO.join(", ")}</details></div>` +
      box(research.length, "form the conservation research group", "final") + `</div>`;
    flowEl.innerHTML = html + `<p class="flow-total">Analysed: <b>${INCLUDED.length}</b> games, including <b>${core.length}</b> artificial life games (ALife score ≥ ${ALIFE_MIN}/12). ${overlap} studied games belong to two groups. Board games: <b>${BOARD.length}</b>, in section 5.7.</p>`;
  }

  // ---------- helpers (same marks as the charts page) ----------
  const tip = document.getElementById("tooltip");
  const showTip = (html, x, y) => {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > innerHeight - 8) top = y - r.height - 14;
    tip.style.left = left + "px"; tip.style.top = top + "px";
  };
  const hideTip = () => { tip.hidden = true; };
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  function shape(parent, kind, x, y, r, fill) {
    const common = { fill, stroke: "var(--surface)", "stroke-width": 2 };
    if (kind === "box") return el("rect", { x: x - r + 1, y: y - r + 1, width: 2 * r - 2, height: 2 * r - 2, fill: "var(--surface)", stroke: fill, "stroke-width": 2 }, parent);
    if (kind === "ring") return el("circle", { cx: x, cy: y, r: r - 0.5, fill: "var(--surface)", stroke: fill, "stroke-width": 2 }, parent);
    if (kind === "circle") return el("circle", { cx: x, cy: y, r, ...common }, parent);
    if (kind === "square") return el("rect", { x: x - r, y: y - r, width: 2 * r, height: 2 * r, rx: 1.5, ...common }, parent);
    if (kind === "triangle") return el("path", { d: `M${x},${y - r * 1.2} L${x + r * 1.1},${y + r * 0.8} L${x - r * 1.1},${y + r * 0.8}Z`, ...common }, parent);
    if (kind === "diamond") return el("path", { d: `M${x},${y - r * 1.25} L${x + r * 1.1},${y} L${x},${y + r * 1.25} L${x - r * 1.1},${y}Z`, ...common }, parent);
    const t = r * 0.45;
    if (kind === "x") common.transform = `rotate(45 ${x} ${y})`;
    return el("path", { d: `M${x - t},${y - r} h${2 * t} v${r - t} h${r - t} v${2 * t} h${-(r - t)} v${r - t} h${-2 * t} v${-(r - t)} h${-(r - t)} v${-2 * t} h${r - t}Z`, ...common }, parent);
  }

  // ---------- one visual system for every figure ----------
  // Each category keeps the same colour and shape everywhere. Games in two categories:
  //   artificial life AND conservation research -> their own mark (dark diamond);
  //   popular AND conservation research          -> the popular mark with an orange ring.
  const CAT = {
    alife:    { label: "Artificial life games", short: "ALife games",           color: "var(--s1)", shape: "circle" },
    research: { label: "Conservation research", short: "Conservation research", color: "var(--s2)", shape: "square" },
    popular:  { label: "Popular on Steam",      short: "Popular on Steam",      color: "var(--s3)", shape: "triangle" },
    both:     { label: "Artificial life and conservation research", short: "ALife + research", color: "var(--ink)", shape: "diamond" },
  };
  const STUDIED = new Set([...ECO_CONTROL.map(g => g.name), ...STUDIED_ALSO]);
  const isStudied = g => STUDIED.has(g.name);
  const hashS = s => { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) | 0; return x; };
  const jit = (s, a) => (((hashS(s) >>> 0) % 1000) / 1000 - 0.5) * 2 * a;
  function mark(parent, key, g, x, y, r) {
    if (key === "alife" && g && isStudied(g)) return shape(parent, CAT.both.shape, x, y, r * 1.15, CAT.both.color);
    const node = shape(parent, CAT[key].shape, x, y, r, CAT[key].color);
    if (key === "popular" && g && isStudied(g)) {
      const ring = el("circle", { cx: x, cy: y, r: r + 3.2, fill: "none", stroke: CAT.research.color, "stroke-width": 1.8 }, parent);
      ring.style.pointerEvents = "none";
    }
    return node;
  }
  const icon = (key, studied) => {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("width", 18); s.setAttribute("height", 18); s.setAttribute("aria-hidden", "true");
    mark(s, key, studied ? { name: [...STUDIED][0] } : null, 9, 9, 4.5);
    return s.outerHTML;
  };
  // legend: [[key, label, count]] plus the two double-category entries, shown when present.
  // `dbl` = { both: games in ALife and research, ring: popular games also studied }
  const legendHTML = (entries, dbl = {}) =>
    entries.map(([k, l, n]) => `<span>${icon(k)} ${l}${n !== undefined ? ` (${n})` : ""}</span>`).join("") +
    (dbl.both ? `<span>${icon("alife", true)} artificial life + conservation research (${dbl.both})</span>` : "") +
    (dbl.ring ? `<span>${icon("popular", true)} popular + conservation research (${dbl.ring})</span>` : "");
  const dblOf = (alifeRows, popRows) => ({ both: alifeRows.filter(isStudied).length, ring: popRows.filter(isStudied).length });
  // Shaded area around a category's points: a convex hull, padded and rounded by a thick stroke.
  function area(svg, pts, color) {
    if (pts.length < 3) return;
    const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [], upper = [];
    for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
    for (const q of [...p].reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
    const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
    const g = el("g", { class: "area", opacity: 0.16 }, svg);
    el("path", { d: "M" + hull.map(q => q.join(",")).join(" L") + " Z", fill: color, stroke: color, "stroke-width": 18, "stroke-linejoin": "round" }, g);
  }
  // Average marks with labels that avoid each other.
  function averages(svg, cats, xs, ys, fx, fy, w, m, tipFn) {
    const labels = [];
    for (const c of cats) {
      if (!c.rows.length) continue;
      const ax = mean(c.rows.map(fx)), ay = mean(c.rows.map(fy)), px = xs(ax), py = ys(ay);
      const node = shape(svg, CAT[c.key].shape, px, py, 9, CAT[c.key].color);
      node.setAttribute("stroke", "var(--ink)"); node.setAttribute("stroke-width", 2); node.style.cursor = "help";
      node.addEventListener("pointermove", e => showTip(tipFn(c, ax, ay), e.clientX, e.clientY));
      node.addEventListener("pointerleave", hideTip);
      for (const [dx, dy, anchor] of [[14, 4, "start"], [-14, 4, "end"], [0, -16, "middle"], [0, 24, "middle"]]) {
        const t = el("text", { x: px + dx, y: py + dy, class: "point-label mean-label", "text-anchor": anchor }, svg);
        t.textContent = `${CAT[c.key].short} (average)`;
        const b = t.getBBox();
        if (labels.some(o => b.x < o.x + o.width + 10 && o.x < b.x + b.width + 10 && b.y < o.y + o.height + 2 && o.y < b.y + b.height + 2) || b.x < m.l || b.x + b.width > w) { t.remove(); continue; }
        labels.push(b); break;
      }
    }
  }
  function axes(svg, m, iw, ih, w, h, xs, ys, xmax, xstep, ymax, ystep, xlabel, ylabel) {
    for (let v = 0; v <= xmax; v += xstep) {
      el("line", { x1: xs(v), x2: xs(v), y1: m.t, y2: m.t + ih, class: v ? "grid" : "axis" }, svg);
      el("text", { x: xs(v), y: m.t + ih + 16, class: "tick", "text-anchor": "middle" }, svg).textContent = v;
    }
    for (let v = 0; v <= ymax; v += ystep) {
      el("line", { x1: m.l, x2: m.l + iw, y1: ys(v), y2: ys(v), class: v ? "grid" : "axis" }, svg);
      el("text", { x: m.l - 8, y: ys(v) + 4, class: "tick", "text-anchor": "end" }, svg).textContent = v;
    }
    el("text", { x: m.l + iw / 2, y: h - 4, class: "axis-label", "text-anchor": "middle" }, svg).textContent = xlabel;
    el("text", { x: 12, y: m.t + ih / 2, class: "axis-label", "text-anchor": "middle", transform: `rotate(-90 12 ${m.t + ih / 2})` }, svg).textContent = ylabel;
  }
  // Plot categories whose members may overlap: each game is drawn once, in its first category in `order`,
  // with a ring if it is also a studied game. Areas and averages use every member of each category.
  function scatterCats(svg, cats, order, xs, ys, fx, fy, tipFn) {
    // (shaded category areas were tried and removed: they hid more than they showed)
    const drawn = new Set();
    for (const key of order) {
      const c = cats.find(x => x.key === key); if (!c) continue;
      const layer = el("g", { class: "pts" }, svg);
      for (const g of c.rows) {
        if (drawn.has(g)) continue; drawn.add(g);
        const node = mark(layer, key, g, xs(fx(g) + jit(g.name, 0.3)), ys(fy(g) + jit(g.name + "y", 0.3)), 4);
        node.addEventListener("pointermove", e => showTip(tipFn(g, c), e.clientX, e.clientY));
        node.addEventListener("pointerleave", hideTip);
      }
    }
  }
  const studiedNote = g => isStudied(g) ? `<br><span class="tip-muted">also among the most-studied games in conservation research</span>` : "";

  // ---------- Figure 5: ALife score against environmental score ----------
  const MAIN3 = [
    { key: "alife", rows: alifeNoThreshold },
    { key: "research", rows: research },
    { key: "popular", rows: of("reference") },
  ];
  // The two "how alive" scales, so Figures 4 and 5 can be drawn with either (4b and 5b use the Life score).
  const Lt = g => g.lifeTotal;
  const SCALES = {
    alife: { f: A, max: 12, step: 3, short: "ALife", label: "ALife score (out of 12)", hi: 6 },
    life:  { f: Lt, max: 14, step: 2, short: "Life", label: "Life score, 7 characteristics (out of 14)", hi: 7 },
  };
  const hasLife = list => list.filter(g => g.lifeTotal !== undefined && g.lifeTotal !== null);
  function figGroups(which = "alife") {
    const S = SCALES[which], suffix = which === "alife" ? "" : "-life";
    const box = document.getElementById("fig-groups" + suffix); if (!box) return;
    box.innerHTML = "";
    const w = Math.max(300, box.clientWidth), h = 400;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": `${S.short} score against environmental score for artificial life, conservation research and popular games` }, box);
    const m = { l: 40, r: 14, t: 12, b: 40 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
    const xs = v => m.l + (v / S.max) * iw, ys = v => m.t + ih - (v / 8) * ih;
    axes(svg, m, iw, ih, w, h, xs, ys, S.max, S.step, 8, 2, S.label, "Environmental score (out of 8)");
    const cats = MAIN3.map(c => ({ key: c.key, rows: which === "alife" ? c.rows : hasLife(c.rows) }));
    const shown = cats.flatMap(c => c.rows);
    el("rect", { x: xs(S.hi), y: ys(8), width: xs(S.max) - xs(S.hi), height: ys(5) - ys(8), class: "corner" }, svg);
    el("text", { x: xs(S.max) - 6, y: ys(8) + 16, class: "tick", "text-anchor": "end" }, svg).textContent =
      `high on both: ${shown.filter(g => S.f(g) >= S.hi && E(g) >= 5).length} games`;
    scatterCats(svg, cats, ["alife", "popular", "research"], xs, ys, S.f, E,
      (g, c) => `<b>${g.name}</b> (${CAT[c.key].short})<br>${S.short} ${S.f(g)}/${S.max} · environment ${E(g)}/8${studiedNote(g)}`);
    averages(svg, cats, xs, ys, S.f, E, w, m, (c, ax, ay) => `<b>${CAT[c.key].label}</b>: average of ${c.rows.length} games<br>${S.short} ${f1(ax)}/${S.max} · environment ${f1(ay)}/8`);
    document.getElementById("groups-legend" + suffix).innerHTML = legendHTML([
      ["alife", "Artificial life games, no threshold", cats[0].rows.length], ["research", "Conservation research", cats[1].rows.length], ["popular", "Popular on Steam", cats[2].rows.length],
    ], dblOf(cats[0].rows, cats[2].rows));
  }

  // ---------- Figure 6: criteria profile ----------
  const bars = (v, color) => `<td><span class="bar" style="width:${(v / 2) * 100}%;background:${color}"></span><span class="v">${f2(v)}</span></td>`;
  function figCriteria() {
    const cols = [["alife", `Artificial life games (≥ ${ALIFE_MIN})`, core], ["research", "Conservation research, all most-studied", researchAll], ["popular", "Popular on Steam", of("reference")]];
    // Environmental criteria only; the ALife criteria are shown with the Life characteristics in Figure 3.
    const rows = ECO_CRITERIA.map(([k], i) => [k, "environment", list => ecrit(list, i)]);
    document.getElementById("fig-criteria").innerHTML =
      `<thead><tr><th scope="col">criterion</th>${cols.map(([k, n, l]) => `<th scope="col">${icon(k)} ${n} (${l.length})</th>`).join("")}</tr></thead><tbody>` +
      rows.map(([k, scale, fn]) => `<tr><th scope="row">${k} <span class="scale">${scale}</span></th>${cols.map(([key, , l]) => bars(fn(l), CAT[key].color)).join("")}</tr>`).join("") + "</tbody>";
  }

  // ---------- Section 3: the artificial life games themselves ----------
  const yearOf = g => { const m = String(g.date || g.year || "").match(/(19|20)\d\d/); return m ? +m[0] : null; };
  const BIN = 5;
  const years = core.map(yearOf).filter(Boolean);
  const y0 = Math.floor(Math.min(...years) / BIN) * BIN, y1 = Math.floor(Math.max(...years) / BIN) * BIN;
  const bins = [];
  for (let b = y0; b <= y1; b += BIN) bins.push({ b, list: core.filter(g => { const y = yearOf(g); return y >= b && y < b + BIN; }) });
  const emptyBins = bins.filter(x => !x.list.length).map(x => `${x.b}–${x.b + BIN - 1}`);
  const recent = core.filter(g => yearOf(g) >= 2015);
  const older = core.filter(g => yearOf(g) < 2015);
  const lvl = (i, v) => core.filter(g => g.score[i] === v).length;
  const full = core.filter(g => g.score.every(v => v >= 1));
  const neuro = core.filter(g => g.score[1] === 2 && g.score[3] === 2);
  const steamAlife = core.filter(g => g.popularity > 0);          // every ALife game sold on Steam, from any list
  const steamRes = research.filter(g => g.popularity > 0);
  const steamRef = of("reference").filter(g => g.popularity > 0);
  const ranks = a => { // average ranks, for ties
    const s = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = [];
    for (let k = 0; k < s.length;) { let j = k; while (j + 1 < s.length && s[j + 1][0] === s[k][0]) j++; for (let t = k; t <= j; t++) r[s[t][1]] = (k + j) / 2; k = j + 1; }
    return r;
  };
  const rho = steamAlife.length > 2 ? corr(ranks(steamAlife.map(g => g.popularity)), ranks(steamAlife.map(A))) : 0;
  const revs = steamAlife.map(g => g.popularity).sort((a, b) => a - b);
  const medianOf = list => { const v = list.map(g => g.popularity).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; };
  const median = medianOf(steamAlife);
  const best = core.filter(g => A(g) === Math.max(...core.map(A)));
  const topPlayed = [...steamAlife].sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  const fmtN = n => n.toLocaleString("en-GB");
  const withRev = g => g.popularity ? `${g.name} (${fmtN(g.popularity)} reviews)` : g.name;
  const pct = n => Math.round((100 * n) / core.length) + "%";

  const ASTATS = {
    n: core.length,
    first: Math.min(...years), last: Math.max(...years),
    steam: of("steam").length, other: of("other").length, project: of("project").length, more: of("alife-more").length,
    moreNames: names(of("alife-more")),
    recent: recent.length, recentPct: pct(recent.length),
    gap: (() => { // longest run of years with no included release
      let best = null, run = null;
      for (let y = Math.min(...years); y <= Math.max(...years); y++) {
        if (!years.includes(y)) { run = run ? [run[0], y] : [y, y]; if (!best || run[1] - run[0] > best[1] - best[0]) best = run; } else run = null;
      }
      return best ? (best[0] === best[1] ? `${best[0]}` : `${best[0]}–${best[1]}`) : "none";
    })(),
    olderAvg: f1(mean(older.map(A))), recentAvg: f1(mean(recent.map(A))),
    auto: pct(core.filter(g => g.score[0] >= 1).length), emerg: pct(core.filter(g => g.score[5] >= 1).length),
    brains0: lvl(1, 0), brains0Pct: pct(lvl(1, 0)), brains2: lvl(1, 2),
    natSel: lvl(3, 2), natSelPct: pct(lvl(3, 2)), evoPlayer: lvl(3, 1),
    ecoFull: lvl(4, 2), body2: lvl(2, 2),
    fullN: count(full.length).toLowerCase(), full: names(full),
    neuroN: count(neuro.length).toLowerCase(), neuro: names(neuro),
    steamN: steamAlife.length, median: fmtN(median), under1k: steamAlife.filter(g => g.popularity < 1000).length,
    resSteamN: steamRes.length, resMedian: fmtN(medianOf(steamRes)), refMedian: fmtN(medianOf(steamRef)),
    resTimes: Math.round(medianOf(steamRes) / Math.max(1, medianOf(alifeNoThreshold.filter(g => g.popularity > 0)))),
    medianNT: fmtN(medianOf(alifeNoThreshold.filter(g => g.popularity > 0))), steamNT: alifeNoThreshold.filter(g => g.popularity > 0).length,
    resNotSteam: research.length - steamRes.length,
    rho: f2(rho), best: best.map(withRev).join(", "), bestScore: best.length ? A(best[0]) : 0,
    topPlayed: topPlayed.map(g => `${g.name} (${fmtN(g.popularity)}, ALife ${A(g)})`).join(", "),
  };
  document.querySelectorAll("[data-astat]").forEach(el => {
    const v = ASTATS[el.dataset.astat];
    el.textContent = v === undefined ? "?" : v;
  });

  // Figure 2: releases per five years, with the average ALife score of each period.
  function figTimeline() {
    const box = document.getElementById("fig-timeline"); if (!box) return;
    box.innerHTML = "";
    const w = Math.max(300, box.clientWidth), h = 240;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": "Artificial life games released per year" }, box);
    const m = { l: 34, r: 34, t: 20, b: 40 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
    // one bar per year, from the first to the last release year
    const first = Math.min(...years), last = Math.max(...years);
    const perYear = [];
    for (let y = first; y <= last; y++) perYear.push({ y, list: core.filter(g => yearOf(g) === y) });
    const maxN = Math.max(1, ...perYear.map(x => x.list.length));
    const bw = iw / perYear.length;
    const yN = v => m.t + ih - (v / maxN) * ih, yS = v => m.t + ih - (v / 12) * ih;
    for (let v = 0; v <= maxN; v += Math.max(1, Math.ceil(maxN / 4))) {
      el("line", { x1: m.l, x2: m.l + iw, y1: yN(v), y2: yN(v), class: v ? "grid" : "axis" }, svg);
      el("text", { x: m.l - 8, y: yN(v) + 4, class: "tick", "text-anchor": "end" }, svg).textContent = v;
    }
    for (const v of [0, 6, 12]) el("text", { x: m.l + iw + 8, y: yS(v) + 4, class: "tick" }, svg).textContent = v;
    perYear.forEach(({ y, list }, i) => {
      const x = m.l + i * bw;
      if (y % 5 === 0) el("text", { x: x + bw / 2, y: m.t + ih + 16, class: "tick", "text-anchor": "middle" }, svg).textContent = y;
      if (!list.length) return;
      const pad = Math.min(1.5, bw * 0.15);
      const bar = el("rect", { x: x + pad, y: yN(list.length), width: Math.max(1, bw - 2 * pad), height: ih - (yN(list.length) - m.t), rx: 1.5, fill: "var(--s1)" }, svg);
      const tipHtml = `<b>${y}</b>: ${list.length} game${list.length > 1 ? "s" : ""}, average ALife ${f1(mean(list.map(A)))}/12<br><span class="tip-muted">${list.map(g => `${g.name} (${A(g)})`).join(", ")}</span>`;
      bar.addEventListener("pointermove", e => showTip(tipHtml, e.clientX, e.clientY));
      bar.addEventListener("pointerleave", hideTip);
      // average ALife score of that year's games (dot, right axis)
      const dot = el("circle", { cx: x + bw / 2, cy: yS(mean(list.map(A))), r: 3, fill: "var(--ink)", stroke: "var(--surface)", "stroke-width": 1.2 }, svg);
      dot.addEventListener("pointermove", e => showTip(tipHtml, e.clientX, e.clientY));
      dot.addEventListener("pointerleave", hideTip);
    });
    el("text", { x: m.l, y: h - 4, class: "axis-label" }, svg).textContent = "release year";
    document.getElementById("timeline-legend").innerHTML =
      `<span><i style="background:var(--s1)"></i>games released that year (left axis)</span><span><i style="background:var(--ink);border-radius:50%"></i>their average ALife score (right axis, out of 12)</span>`;
  }

  // Figure 3: share of the games scoring 0, 1 or 2 on each ALife criterion.
  function figProfile() {
    const box = document.getElementById("fig-profile"); if (!box) return;
    box.innerHTML = "";
    const w = Math.max(300, box.clientWidth), barH = 20, gap = 8;
    const m = { l: 92, r: 10, t: 4, b: 4 };
    const h = m.t + m.b + SCORE_CRITERIA.length * (barH + gap);
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": "Share of artificial life games at each level of each criterion" }, box);
    const iw = w - m.l - m.r, fills = ["var(--o0)", "var(--o1)", "var(--o2)"], ink = ["#0b0b0b", "#fff", "#fff"];
    SCORE_CRITERIA.forEach(([k], i) => {
      const y = m.t + i * (barH + gap);
      el("text", { x: m.l - 10, y: y + barH / 2 + 4, class: "tick", "text-anchor": "end" }, svg).textContent = k;
      let x = m.l;
      [0, 1, 2].forEach(v => {
        const list = core.filter(g => g.score[i] === v), sw = (list.length / core.length) * iw;
        if (!sw) return;
        const r = el("rect", { x: x + (v ? 1 : 0), y, width: Math.max(0, sw - 1), height: barH, rx: 2, fill: fills[v] }, svg);
        r.addEventListener("pointermove", e => showTip(`<b>${k}: ${v}</b>, ${list.length} of ${core.length}<br><span class="tip-muted">${list.slice(0, 12).map(g => g.name).join(", ")}${list.length > 12 ? "…" : ""}</span>`, e.clientX, e.clientY));
        r.addEventListener("pointerleave", hideTip);
        if (sw > 28) el("text", { x: x + sw / 2, y: y + barH / 2 + 4, class: "tick", "text-anchor": "middle", style: `fill:${ink[v]}` }, svg).textContent = list.length;
        x += sw;
      });
    });
    document.getElementById("profile-legend").innerHTML =
      ["0: none", "1: partly", "2: fully"].map((l, v) => `<span><i style="background:${fills[v]}"></i>${l}</span>`).join("");
  }

  // Figure 4 (and 4b): popularity (Steam reviews, log scale) against the ALife score (or the Life score).
  function figPopularity(which = "alife") {
    const S = SCALES[which], suffix = which === "alife" ? "" : "-life";
    const box = document.getElementById("fig-popularity" + suffix); if (!box) return;
    box.innerHTML = "";
    const w = Math.max(300, box.clientWidth), h = 300;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": `Steam reviews against ${S.short} score` }, box);
    const m = { l: 40, r: 14, t: 12, b: 40 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
    const cats = [{ key: "alife", rows: alifeNoThreshold.filter(g => g.popularity > 0) }, { key: "research", rows: steamRes }, { key: "popular", rows: steamRef }]
      .map(c => ({ ...c, rows: which === "alife" ? c.rows : hasLife(c.rows) }));
    const all = cats.flatMap(c => c.rows);
    const lmax = Math.ceil(Math.log10(Math.max(10, ...all.map(g => g.popularity))));
    const xs = v => m.l + ((v + 0.5) / (S.max + 1)) * iw;
    if (which === "alife") {   // the threshold used elsewhere, for reference only
      el("line", { x1: xs(ALIFE_MIN - 0.5), x2: xs(ALIFE_MIN - 0.5), y1: m.t, y2: m.t + ih, class: "threshold" }, svg);
      el("text", { x: xs(ALIFE_MIN - 0.5) + 4, y: m.t + 12, class: "tick" }, svg).textContent = `ALife ${ALIFE_MIN} (threshold used elsewhere)`;
    }
    const ys = v => m.t + ih - (Math.log10(Math.max(1, v)) / lmax) * ih;
    for (let v = 0; v <= S.max; v++) el("text", { x: xs(v), y: m.t + ih + 16, class: "tick", "text-anchor": "middle" }, svg).textContent = v;
    for (let i = 0; i <= lmax; i++) {
      el("line", { x1: m.l, x2: m.l + iw, y1: ys(10 ** i), y2: ys(10 ** i), class: i ? "grid" : "axis" }, svg);
      el("text", { x: m.l - 8, y: ys(10 ** i) + 4, class: "tick", "text-anchor": "end" }, svg).textContent = 10 ** i >= 1000 ? `${10 ** i / 1000}k` : 10 ** i;
    }
    el("text", { x: m.l + iw / 2, y: h - 4, class: "axis-label", "text-anchor": "middle" }, svg).textContent = S.label;
    el("text", { x: 12, y: m.t + ih / 2, class: "axis-label", "text-anchor": "middle", transform: `rotate(-90 12 ${m.t + ih / 2})` }, svg).textContent = "Steam reviews (log scale)";
    scatterCats(svg, cats, ["alife", "popular", "research"], v => xs(v), v => v, S.f, g => ys(g.popularity),
      (g, c) => `<b>${g.name}</b> (${CAT[c.key].short})<br>${S.short} ${S.f(g)}/${S.max} · ${fmtN(g.popularity)} Steam reviews${studiedNote(g)}`);
    const pts = all.map(g => ({ g, x: xs(S.f(g) + jit(g.name, 0.3)), y: ys(g.popularity) }));
    // Pooled trend: least-squares line of log10(reviews) on the score, over every plotted game (all categories
    // together, each game counted once), drawn dashed across the score range.
    const uniq = [...new Set(all)];
    const tx = uniq.map(S.f), ty = uniq.map(g => Math.log10(g.popularity));
    const mx = mean(tx), my = mean(ty);
    const slope = tx.reduce((s, x, i) => s + (x - mx) * (ty[i] - my), 0) / Math.max(1e-9, tx.reduce((s, x) => s + (x - mx) ** 2, 0));
    const at = x => 10 ** (my + slope * (x - mx));
    const x0 = Math.min(...tx), x1 = Math.max(...tx);
    el("line", { x1: xs(x0), y1: ys(at(x0)), x2: xs(x1), y2: ys(at(x1)), class: "trend" }, svg);
    const rAll = corr(tx, ty);
    const lab = el("text", { x: xs(x1), y: ys(at(x1)) + 18, class: "tick trend-label", "text-anchor": "end" }, svg);
    lab.textContent = `all games: r = ${f2(rAll)}`;
    document.getElementById("popularity-legend" + suffix).innerHTML = legendHTML([
      ["alife", "Artificial life games", cats[0].rows.length], ["research", "Conservation research, on Steam", cats[1].rows.length], ["popular", "Popular on Steam", cats[2].rows.length],
    ], dblOf(cats[0].rows, cats[2].rows));
    // label the three most-played ALife games and the top scorers on this scale
    const placedL = [];
    const top = Math.max(...cats[0].rows.map(S.f));
    const toLabel = [...topPlayed, ...cats[0].rows.filter(g => S.f(g) === top)];
    for (const g of toLabel) {
      const p = pts.find(q => q.g === g); if (!p) continue;
      for (const [dx, anchor] of [[8, "start"], [-8, "end"]]) {
        const t = el("text", { x: p.x + dx, y: p.y + 4, class: "point-label", "text-anchor": anchor }, svg);
        t.textContent = g.name.replace(/ - God Simulator|: .*/, "");
        const b = t.getBBox();
        if (placedL.some(o => b.x < o.x + o.width + 4 && o.x < b.x + b.width + 4 && b.y < o.y + o.height && o.y < b.y + b.height) || b.x < m.l || b.x + b.width > w) { t.remove(); continue; }
        placedL.push(b); break;
      }
    }
  }

  // Numbers comparing Figures 4/5 with 4b/5b.
  const XSTATS = (() => {
    const main = MAIN3.flatMap(c => hasLife(c.rows));
    const meanOf = (rows, f) => f1(mean(hasLife(rows).map(f)));
    const sa = hasLife(alifeNoThreshold.filter(g => g.popularity > 0));   // the artificial life games plotted in Figure 4
    const rhoL = sa.length > 2 ? corr(ranks(sa.map(g => g.popularity)), ranks(sa.map(Lt))) : 0;
    const rhoAnt = sa.length > 2 ? corr(ranks(sa.map(g => g.popularity)), ranks(sa.map(A))) : 0;
    const bestL = Math.max(...sa.map(Lt));
    return {
      rEcoA: f2(corr(main.map(A), main.map(E))), rEcoL: f2(corr(main.map(Lt), main.map(E))),
      coreL: meanOf(alifeNoThreshold, Lt), resL: meanOf(research, Lt), refL: meanOf(of("reference"), Lt),
      bothA: main.filter(g => A(g) >= 6 && E(g) >= 5).length, bothL: main.filter(g => Lt(g) >= 7 && E(g) >= 5).length,
      bothLNames: names(main.filter(g => Lt(g) >= 7 && E(g) >= 5)),
      rhoA: f2(rhoAnt), rhoL: f2(rhoL), nSteamNT: sa.length,
      // the dashed trend of Figures 6 and 6b: every plotted game once, score against log10(reviews)
      ...(() => {
        const pooled = [...new Set([...alifeNoThreshold.filter(g => g.popularity > 0), ...steamRes, ...steamRef])];
        const pl = hasLife(pooled);
        return {
          pooledN: pooled.length,
          pooledA: f2(corr(pooled.map(A), pooled.map(g => Math.log10(g.popularity)))),
          pooledL: f2(corr(pl.map(Lt), pl.map(g => Math.log10(g.popularity)))),
        };
      })(),
      bestL: names(sa.filter(g => Lt(g) === bestL)) + ` (${bestL}/14)`,
    };
  })();
  document.querySelectorAll("[data-xstat]").forEach(el => {
    const v = XSTATS[el.dataset.xstat];
    el.textContent = v === undefined ? "?" : v;
  });

  // ---------- Section 4.4: reception (Steam review score, % positive) ----------
  const Pos = g => g.positive;
  const withPos = list => list.filter(g => g.positive !== undefined && g.positive !== null);
  const recCats = () => [
    { key: "alife", rows: withPos(alifeNoThreshold) },
    { key: "research", rows: withPos(research) },
    { key: "popular", rows: withPos(of("reference")) },
  ];
  const RSTATS = (() => {
    const [a, r, pp] = recCats();
    const med = list => { const v = list.map(Pos).sort((x, y) => x - y); return v.length ? v[Math.floor(v.length / 2)] : 0; };
    const sp = (list, f) => list.length > 2 ? corr(ranks(list.map(Pos)), ranks(list.map(f))) : 0;
    const deep = a.rows.filter(g => A(g) >= 10).sort((x, y) => A(y) - A(x) || Pos(x) - Pos(y));
    const share90 = list => Math.round(100 * list.filter(g => Pos(g) >= 90).length / Math.max(1, list.length)) + "%";
    return {
      nA: a.rows.length, nR: r.rows.length, nP: pp.rows.length,
      medA: med(a.rows), medR: med(r.rows), medP: med(pp.rows),
      s90A: share90(a.rows), s90R: share90(r.rows), s90P: share90(pp.rows),
      rhoA: f2(sp(a.rows, A)), rhoL: f2(sp(hasLife(a.rows), Lt)),
      deep: deep.map(g => `${g.name} (${Pos(g)}%)`).join(", "),
      deepMed: med(deep),
      low: names(a.rows.filter(g => Pos(g) < 70)),
    };
  })();
  document.querySelectorAll("[data-rstat]").forEach(el => {
    const v = RSTATS[el.dataset.rstat];
    el.textContent = v === undefined ? "?" : v;
  });

  // Figures 7 and 7b: review score (% positive) against the ALife score, or the Life score.
  function figReception(which = "alife") {
    const S = SCALES[which], suffix = which === "alife" ? "" : "-life";
    const box = document.getElementById("fig-reception" + suffix); if (!box) return;
    box.innerHTML = "";
    const w = Math.max(300, box.clientWidth), h = 300;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": `Steam review score against ${S.short} score` }, box);
    const m = { l: 40, r: 14, t: 12, b: 40 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
    const cats = recCats().map(c => ({ ...c, rows: which === "alife" ? c.rows : hasLife(c.rows) }));
    const lo = Math.max(0, Math.floor(Math.min(...cats.flatMap(c => c.rows).map(Pos)) / 10) * 10);
    const xs = v => m.l + ((v + 0.5) / (S.max + 1)) * iw;
    const ys = v => m.t + ih - ((v - lo) / (100 - lo)) * ih;
    for (let v = 0; v <= S.max; v++) el("text", { x: xs(v), y: m.t + ih + 16, class: "tick", "text-anchor": "middle" }, svg).textContent = v;
    for (let v = lo; v <= 100; v += 10) {
      el("line", { x1: m.l, x2: m.l + iw, y1: ys(v), y2: ys(v), class: v === lo ? "axis" : "grid" }, svg);
      el("text", { x: m.l - 8, y: ys(v) + 4, class: "tick", "text-anchor": "end" }, svg).textContent = v + "%";
    }
    el("text", { x: m.l + iw / 2, y: h - 4, class: "axis-label", "text-anchor": "middle" }, svg).textContent = S.label;
    el("text", { x: 12, y: m.t + ih / 2, class: "axis-label", "text-anchor": "middle", transform: `rotate(-90 12 ${m.t + ih / 2})` }, svg).textContent = "Steam reviews positive";
    if (which === "alife") {
      el("line", { x1: xs(ALIFE_MIN - 0.5), x2: xs(ALIFE_MIN - 0.5), y1: m.t, y2: m.t + ih, class: "threshold" }, svg);
    }
    scatterCats(svg, cats, ["alife", "popular", "research"], v => xs(v), v => v, S.f, g => ys(Pos(g)),
      (g, c) => `<b>${g.name}</b> (${CAT[c.key].short})<br>${S.short} ${S.f(g)}/${S.max} · ${Pos(g)}% positive reviews${g.popularity ? ` (${fmtN(g.popularity)})` : ""}${studiedNote(g)}`);
    averages(svg, cats, v => xs(v), v => ys(v), S.f, Pos, w, m, (c, ax, ay) => `<b>${CAT[c.key].label}</b>: average of ${c.rows.length} games<br>${S.short} ${f1(ax)}/${S.max} · ${f1(ay)}% positive`);
    document.getElementById("reception-legend" + suffix).innerHTML = legendHTML([
      ["alife", "Artificial life games, no threshold", cats[0].rows.length], ["research", "Conservation research, on Steam", cats[1].rows.length], ["popular", "Popular on Steam", cats[2].rows.length],
    ], dblOf(cats[0].rows, cats[2].rows));
  }

  // ---------- Section 4.6: the seven characteristics of life, as a second yardstick ----------
  // No ALife threshold here: thresholding on one score and then correlating it with another would be circular.
  // Artificial life = every released, non-itch.io video game from the site's artificial life lists, plus the games
  // from other lists that reach the threshold anyway. Conservation research = all most-studied games, including
  // those listed elsewhere on the site, so a game can belong to two categories (drawn once, with a ring).
  const withLife = list => list.filter(g => g.life);
  const lifeAlife = alifeNoThreshold;
  const lifeResearch = researchAll;
  const lifeCats = [
    { key: "alife", rows: withLife(lifeAlife), all: lifeAlife },
    { key: "research", rows: withLife(lifeResearch), all: lifeResearch },
    { key: "popular", rows: withLife(of("reference")), all: of("reference") },
  ];
  const lifeAll = [...new Set(lifeCats.flatMap(c => c.rows))];
  const Lf = g => g.lifeTotal;
  const lifeR = lifeAll.length > 2 ? corr(lifeAll.map(A), lifeAll.map(Lf)) : 0;
  const catMean = (i, f) => mean(lifeCats[i].rows.map(f));
  const diff = g => Lf(g) / 14 - A(g) / 12;      // disagreement, each score as a share of its maximum
  const byDiff = [...lifeAll].sort((a, b) => diff(b) - diff(a));
  const charMean = (rows, i) => mean(rows.map(g => g.life[i]));
  const coreRows = lifeCats[0].rows;
  const charsSorted = LIFE_CRITERIA.map(([k], i) => [k, charMean(coreRows, i)]).sort((a, b) => b[1] - a[1]);
  const doubleLife = lifeAll.filter(g => isStudied(g) && g.platform !== "research" && (lifeAlife.includes(g) || g.platform === "reference"));
  const LSTATS = {
    n: lifeAll.length, missing: lifeCats.reduce((s, c) => s + c.all.length - c.rows.length, 0),
    nAlife: lifeCats[0].rows.length, nResearch: lifeCats[1].rows.length, nPopular: lifeCats[2].rows.length,
    below: lifeCats[0].rows.filter(g => A(g) < ALIFE_MIN).length,
    r: f2(lifeR),
    alife: f1(catMean(0, Lf)), research: f1(catMean(1, Lf)), popular: f1(catMean(2, Lf)),
    ratioL: Math.round(catMean(0, Lf) / Math.max(0.1, catMean(1, Lf))),
    ratioA: Math.round(catMean(0, A) / Math.max(0.1, catMean(1, A))),
    top: `${charsSorted[0][0]} and ${charsSorted[1][0]}`,
    low: `${charsSorted[charsSorted.length - 1][0]} and ${charsSorted[charsSorted.length - 2][0]}`,
    moreLife: byDiff.slice(0, 3).map(g => `${g.name} (Life ${Lf(g)}/14, ALife ${A(g)}/12)`).join(", "),
    moreAlife: byDiff.slice(-3).reverse().map(g => `${g.name} (Life ${Lf(g)}/14, ALife ${A(g)}/12)`).join(", "),
    full7N: lifeAll.filter(g => g.life.every(v => v >= 1)).length,
    full7Core: coreRows.filter(g => g.life.every(v => v >= 1)).length,
    topLife: (() => { const mx = Math.max(...lifeAll.map(Lf)); return names(lifeAll.filter(g => Lf(g) >= mx - 1)) + ` (${mx - 1} to ${mx}/14)`; })(),
    doubleN: doubleLife.length, doubles: names(doubleLife),
  };
  document.querySelectorAll("[data-lstat]").forEach(el => {
    const v = LSTATS[el.dataset.lstat];
    el.textContent = v === undefined ? "?" : v;
  });

  // Figure 7: ALife score against Life score.
  function figLife() {
    const box = document.getElementById("fig-life"); if (!box) return;
    box.innerHTML = "";
    const w = Math.max(300, box.clientWidth), h = 400;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": "ALife score against Life score" }, box);
    const m = { l: 40, r: 14, t: 12, b: 40 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
    const xs = v => m.l + (v / 12) * iw, ys = v => m.t + ih - (v / 14) * ih;
    axes(svg, m, iw, ih, w, h, xs, ys, 12, 3, 14, 2, "ALife score (out of 12)", "Life score, 7 characteristics (out of 14)");
    // where the two scores would agree (same share of their maximum)
    el("line", { x1: xs(0), y1: ys(0), x2: xs(12), y2: ys(14), class: "agree" }, svg);
    el("text", { x: xs(12) - 4, y: ys(14) + 14, class: "tick", "text-anchor": "end" }, svg).textContent = "equal share of each maximum";
    // the old threshold, for reference
    el("line", { x1: xs(ALIFE_MIN), x2: xs(ALIFE_MIN), y1: m.t, y2: m.t + ih, class: "threshold" }, svg);
    el("text", { x: xs(ALIFE_MIN) + 4, y: m.t + ih - 6, class: "tick" }, svg).textContent = `ALife ${ALIFE_MIN} (threshold used elsewhere)`;
    scatterCats(svg, lifeCats, ["alife", "popular", "research"], xs, ys, A, Lf,
      (g, c) => `<b>${g.name}</b> (${CAT[c.key].short})<br>ALife ${A(g)}/12 · Life ${Lf(g)}/14<br><span class="tip-muted">${LIFE_CRITERIA.map(([k], i) => `${k} ${g.life[i]}`).join(" · ")}</span>${studiedNote(g)}`);
    averages(svg, lifeCats, xs, ys, A, Lf, w, m, (c, ax, ay) => `<b>${CAT[c.key].label}</b>: average of ${c.rows.length} games<br>ALife ${f1(ax)}/12 · Life ${f1(ay)}/14`);
    document.getElementById("life-legend").innerHTML = legendHTML([
      ["alife", "Artificial life games, no threshold", lifeCats[0].rows.length], ["research", "Conservation research, all most-studied", lifeCats[1].rows.length], ["popular", "Popular on Steam", lifeCats[2].rows.length],
    ], dblOf(lifeCats[0].rows, lifeCats[2].rows));
  }

  // Figure 8: average per characteristic of life, by category.
  // Figure 3: average per criterion of both scales (ALife criteria on top, characteristics of life below), by category.
  function figLifeTable() {
    const t = document.getElementById("fig-life-table"); if (!t) return;
    const rows = [
      ...SCORE_CRITERIA.map(([k], i) => [k, "ALife", list => mean(list.map(g => g.score[i]))]),
      ...LIFE_CRITERIA.map(([k], i) => [k, "Life", list => charMean(list, i)]),
    ];
    t.innerHTML = `<thead><tr><th scope="col">criterion</th>${lifeCats.map(c => `<th scope="col">${icon(c.key)} ${CAT[c.key].short} (${c.rows.length})</th>`).join("")}</tr></thead><tbody>` +
      rows.map(([k, scale, fn], ri) => `<tr${ri === SCORE_CRITERIA.length ? ' class="split"' : ""}><th scope="row">${k} <span class="scale">${scale}</span></th>${lifeCats.map(c => bars(fn(c.rows), CAT[c.key].color)).join("")}</tr>`).join("") + "</tbody>";
  }

  // Figure 3b: in the style of Figure 5, one panel per category: for each of the 13 criteria, a bar split into the
  // share of the category's games scoring 0, 1 and 2, with the number of games written in each segment.
  function figCritDist() {
    const crits = [
      ...SCORE_CRITERIA.map(([k], i) => [k, "ALife", g => g.score[i]]),
      ...LIFE_CRITERIA.map(([k], i) => [k, "Life", g => g.life[i]]),
    ];
    const fills = ["var(--o0)", "var(--o1)", "var(--o2)"], ink = ["#0b0b0b", "#fff", "#fff"];
    lifeCats.forEach(c => {
      // each category has its own sub-figure: Figure 3b (ALife), 3c (research), 3d (popular)
      const cell = document.getElementById("fig-critdist-" + c.key); if (!cell) return;
      cell.innerHTML = "";
      const w = Math.max(240, cell.clientWidth), barH = 16, gap = 6, split = 12;
      const m = { l: 92, r: 6, t: 26, b: 4 }, iw = w - m.l - m.r;
      const h = m.t + m.b + crits.length * (barH + gap) + split;
      const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": `${CAT[c.key].label}: games scoring 0, 1 and 2 on each criterion` }, cell);
      shape(svg, CAT[c.key].shape, 8, 12, 5, CAT[c.key].color);
      el("text", { x: 18, y: 16, class: "tick crit-name" }, svg).textContent = `${CAT[c.key].short} (${c.rows.length})`;
      crits.forEach(([k, scale, f], i) => {
        const y = m.t + i * (barH + gap) + (i >= SCORE_CRITERIA.length ? split : 0);
        if (i === SCORE_CRITERIA.length) el("line", { x1: 0, x2: w, y1: y - split / 2 - gap / 2, y2: y - split / 2 - gap / 2, class: "axis" }, svg);
        el("text", { x: m.l - 8, y: y + barH / 2 + 4, class: "tick", "text-anchor": "end" }, svg).textContent = k;
        let x = m.l;
        [0, 1, 2].forEach(v => {
          const list = c.rows.filter(g => f(g) === v), sw = c.rows.length ? (list.length / c.rows.length) * iw : 0;
          if (!sw) return;
          const r = el("rect", { x: x + (v ? 1 : 0), y, width: Math.max(0, sw - 1), height: barH, rx: 2, fill: fills[v] }, svg);
          r.addEventListener("pointermove", e => showTip(`<b>${k}</b> (${scale}) = ${v}, ${CAT[c.key].short}<br>${list.length} of ${c.rows.length} games<br><span class="tip-muted">${list.slice(0, 14).map(g => g.name).join(", ")}${list.length > 14 ? "…" : ""}</span>`, e.clientX, e.clientY));
          r.addEventListener("pointerleave", hideTip);
          if (sw > 18) el("text", { x: x + sw / 2, y: y + barH / 2 + 4, class: "tick", "text-anchor": "middle", style: `fill:${ink[v]}` }, svg).textContent = list.length;
          x += sw;
        });
      });
    });
    const lg = document.getElementById("critdist-legend"); if (lg) lg.innerHTML =
      ["0: none", "1: partly", "2: fully"].map((l, v) => `<span><i style="background:${fills[v]}"></i>${l}</span>`).join("") +
      `<span class="legend-sep">numbers = games; bar length = share of the category</span>`;
  }




  // ---------- Section 4.7: artificial life across mainstream genres ----------
  const coreNames = new Set(core.map(g => g.name));
  const refNames = new Set(REFERENCE.map(g => g.name));
  const resNames = new Set(research.map(g => g.name));
  const scoreOf = n => SCORES[n] ? SCORES[n].slice(0, 6) : null;
  const totalOf = n => { const v = scoreOf(n); return v ? v.reduce((a, b) => a + b, 0) : null; };
  const catOf = n => coreNames.has(n) ? "alife" : refNames.has(n) ? "popular" : resNames.has(n) ? "research" : null;
  const lifeOf = n => LIFE_SCORES[n] || null;
  const BENCH = "Artificial life sims";   // benchmark row: shown on top, left out of genre rankings and statistics
  const GEN_ALL = Object.entries(GENRES).map(([genre, list]) => {
    const rows = list.filter(n => scoreOf(n)).map(n => {
      const life = lifeOf(n);
      return { name: n, total: totalOf(n), score: scoreOf(n), life, lifeTotal: life ? life.reduce((a, b) => a + b, 0) : null };
    });
    const lifeRows = rows.filter(r => r.life);
    return { genre, rows, mean: mean(rows.map(r => r.total)), above: rows.filter(r => r.total >= ALIFE_MIN).length,
      lifeMean: mean(lifeRows.map(r => r.lifeTotal)) };
  });
  const BENCH_ROW = GEN_ALL.find(g => g.genre === BENCH);
  const GEN = GEN_ALL.filter(g => g.genre !== BENCH).sort((a, b) => b.mean - a.mean);
  const ROWS = BENCH_ROW ? [BENCH_ROW, ...GEN] : GEN;   // what the figures draw
  const genAll = GEN.flatMap(g => g.rows);
  const genCrit = (rows, i) => mean(rows.map(r => r.score[i]));
  const strongest = g => SCORE_CRITERIA.map(([k], i) => [k, genCrit(g.rows, i)]).sort((a, b) => b[1] - a[1]);
  const fmtGenre = g => `${g.genre.toLowerCase()} (${f1(g.mean)})`;
  const lastG = GEN[GEN.length - 1];
  // Life-score view of the same genres
  const byLife = [...GEN].sort((a, b) => b.lifeMean - a.lifeMean);
  const rankShift = GEN.map((g, i) => ({ g, shift: i - byLife.indexOf(g) }));   // > 0: higher on Life than on ALife
  const up = rankShift.filter(x => x.shift > 0).sort((a, b) => b.shift - a.shift);
  const down = rankShift.filter(x => x.shift < 0).sort((a, b) => a.shift - b.shift);
  const lifeRowsAll = genAll.filter(r => r.life);
  const lifeCritAll = i => mean(lifeRowsAll.map(r => r.life[i]));
  const lifeCharsSorted = LIFE_CRITERIA.map(([k], i) => [k, lifeCritAll(i)]).sort((a, b) => b[1] - a[1]);
  const GSTATS = {
    nGenres: GEN.length, nGames: genAll.length, perGenre: Math.round(genAll.length / GEN.length),
    ranking: GEN.map(fmtGenre).join(", "),
    top: GEN[0].genre, topMean: f1(GEN[0].mean), topAbove: GEN[0].above, topN: GEN[0].rows.length,
    second: GEN[1].genre.toLowerCase(),
    topCrit: strongest(GEN[0]).slice(0, 2).map(x => x[0]).join(" and "),
    last: lastG.genre.toLowerCase(), lastMean: f1(lastG.mean), lastAbove: lastG.above,
    above: genAll.filter(r => r.total >= ALIFE_MIN).length,
    evoAll: f2(genCrit(genAll, 3)), brainsAll: f2(genCrit(genAll, 1)), autoAll: f2(genCrit(genAll, 0)), emergAll: f2(genCrit(genAll, 5)),
    brainsN: count(genAll.filter(r => r.score[1] >= 1).length).toLowerCase(),
    natSelN: count(genAll.filter(r => r.score[3] === 2).length).toLowerCase(),
    natSel: names(genAll.filter(r => r.score[3] === 2)),
    best: (() => { const mx = Math.max(...genAll.map(r => r.total)); return names(genAll.filter(r => r.total === mx)) + ` (${mx}/12)`; })(),
    lifeRanking: byLife.map(g => `${g.genre.toLowerCase()} (${f1(g.lifeMean)})`).join(", "),
    lifeR: f2(corr(lifeRowsAll.map(r => r.total), lifeRowsAll.map(r => r.lifeTotal))),
    genreR: f2(corr(GEN.map(g => g.mean), GEN.map(g => g.lifeMean))),
    up: up.length ? up.slice(0, 2).map(x => x.g.genre.toLowerCase()).join(" and ") : "none",
    down: down.length ? down.slice(0, 2).map(x => x.g.genre.toLowerCase()).join(" and ") : "none",
    lifeTop: `${lifeCharsSorted[0][0]} and ${lifeCharsSorted[1][0]}`,
    lifeLow: `${lifeCharsSorted[lifeCharsSorted.length - 1][0]} and ${lifeCharsSorted[lifeCharsSorted.length - 2][0]}`,
    benchMean: BENCH_ROW ? f1(BENCH_ROW.mean) : "?", benchLife: BENCH_ROW ? f1(BENCH_ROW.lifeMean) : "?",
    benchAbove: BENCH_ROW ? BENCH_ROW.above : "?", benchN: BENCH_ROW ? BENCH_ROW.rows.length : "?",
    benchTimes: BENCH_ROW ? f1(BENCH_ROW.mean / GEN[0].mean) : "?",
  };
  document.querySelectorAll("[data-gstat]").forEach(el => {
    const v = GSTATS[el.dataset.gstat];
    el.textContent = v === undefined ? "?" : v;
  });

  // Figures 9 and 10: one row per genre (same order in both), every game as a mark, the genre average as a bar.
  const GENRE_METRICS = {
    alife: { box: "fig-genres", legend: "genres-legend", max: 12, step: 2, label: "ALife score (out of 12)", val: r => r.total, avg: g => g.mean,
      right: g => `${g.above}/${g.rows.length}`, rightHead: `≥ ${ALIFE_MIN}`, zone: true,
      tip: r => `ALife ${r.total}/12<br><span class="tip-muted">${SCORE_CRITERIA.map(([k], j) => `${k} ${r.score[j]}`).join(" · ")}</span><br><span class="tip-muted">${SCORES[r.name][6]}</span>` },
    life: { box: "fig-genres-life", legend: "genres-life-legend", max: 14, step: 2, label: "Life score, 7 characteristics (out of 14)", val: r => r.lifeTotal, avg: g => g.lifeMean,
      right: g => f1(g.lifeMean), rightHead: "avg", zone: false,
      tip: r => `Life ${r.lifeTotal}/14 · ALife ${r.total}/12<br><span class="tip-muted">${LIFE_CRITERIA.map(([k], j) => `${k} ${r.life[j]}`).join(" · ")}</span>` },
  };
  function figGenres(which = "alife") {
    const M = GENRE_METRICS[which];
    const box = document.getElementById(M.box); if (!box) return;
    box.innerHTML = "";
    const rowH = 34, w = Math.max(300, box.clientWidth);
    const m = { l: 166, r: 54, t: 22, b: 36 };
    const h = m.t + m.b + rowH * ROWS.length, iw = w - m.l - m.r;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": `${M.label} of 15 games in each genre` }, box);
    const xs = v => m.l + (v / M.max) * iw;
    if (M.zone) {
      el("rect", { x: xs(ALIFE_MIN - 0.5), y: m.t - 6, width: xs(M.max) - xs(ALIFE_MIN - 0.5), height: rowH * ROWS.length + 6, class: "zone" }, svg);
      el("text", { x: xs(M.max), y: m.t - 9, class: "tick", "text-anchor": "end" }, svg).textContent = `artificial life zone (≥ ${ALIFE_MIN})`;
    }
    for (let v = 0; v <= M.max; v += M.step) {
      el("line", { x1: xs(v), x2: xs(v), y1: m.t - 6, y2: m.t + rowH * ROWS.length, class: v ? "grid" : "axis" }, svg);
      el("text", { x: xs(v), y: h - m.b + 16, class: "tick", "text-anchor": "middle" }, svg).textContent = v;
    }
    el("text", { x: m.l + iw / 2, y: h - 4, class: "axis-label", "text-anchor": "middle" }, svg).textContent = M.label;
    el("text", { x: w - 2, y: m.t - 9, class: "tick", "text-anchor": "end" }, svg).textContent = M.rightHead;
    const rows = which === "life" && BENCH_ROW ? [BENCH_ROW, ...byLife] : which === "life" ? byLife : ROWS;
    rows.forEach((g, i) => {
      const cy = m.t + i * rowH + rowH / 2;
      if (i) el("line", { x1: 0, x2: w, y1: cy - rowH / 2, y2: cy - rowH / 2, class: i === 1 && BENCH_ROW ? "axis" : "grid", "stroke-width": i === 1 && BENCH_ROW ? 2 : 1 }, svg);
      const lab = el("text", { x: m.l - 12, y: cy + 4, class: "tick crit-name", "text-anchor": "end" }, svg);
      lab.textContent = g === BENCH_ROW ? "ALife sims (benchmark)" : g.genre;
      if (g === BENCH_ROW) lab.style.fontStyle = "italic";
      el("text", { x: w - 2, y: cy + 4, class: "tick", "text-anchor": "end" }, svg).textContent = M.right(g);
      const byScore = {};
      g.rows.filter(r => M.val(r) !== null).forEach(r => (byScore[M.val(r)] ??= []).push(r));
      for (const [sc, list] of Object.entries(byScore)) {
        // up to 3 marks per column, extra columns spread sideways, all centred on the score
        const perCol = 3, cols = Math.ceil(list.length / perCol);
        list.forEach((r, k) => {
          const col = Math.floor(k / perCol), inCol = Math.min(perCol, list.length - col * perCol), row = k % perCol;
          const dx = (col - (cols - 1) / 2) * 8, dy = (row - (inCol - 1) / 2) * 8.5;
          const key = catOf(r.name), x = xs(+sc) + dx, y = cy + dy;
          const node = key ? mark(svg, key, { name: r.name }, x, y, 4.4)
                           : el("circle", { cx: x, cy: y, r: 3.6, fill: "var(--surface)", stroke: "var(--faint)", "stroke-width": 1.5 }, svg);
          node.addEventListener("pointermove", e => showTip(`<b>${r.name}</b> (${g.genre.toLowerCase()})<br>${M.tip(r)}`, e.clientX, e.clientY));
          node.addEventListener("pointerleave", hideTip);
        });
      }
      el("line", { x1: xs(M.avg(g)), x2: xs(M.avg(g)), y1: cy - rowH / 2 + 3, y2: cy + rowH / 2 - 3, stroke: "var(--ink)", "stroke-width": 2.5 }, svg);
    });
    document.getElementById(M.legend).innerHTML =
      legendHTML([["alife", "in the artificial life category"], ["research", "conservation research game"], ["popular", "popular on Steam"]],
        { both: genAll.filter(r => catOf(r.name) === "alife" && isStudied(r)).length, ring: genAll.filter(r => catOf(r.name) === "popular" && isStudied(r)).length }) +
      `<span><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="4" fill="var(--surface)" stroke="var(--faint)" stroke-width="1.5"/></svg> other game</span>` +
      `<span><svg width="14" height="14" aria-hidden="true"><line x1="7" x2="7" y1="1" y2="13" stroke="var(--ink)" stroke-width="2.5"/></svg> genre average</span>`;
  }

  // ---------- Section 6: board games ----------
  const BSTATS = (() => {
    const mxA = Math.max(...BOARD.map(A)), mxE = Math.max(...BOARD.map(E));
    return {
      r: f2(corr(BOARD.map(A), BOARD.map(E))),
      topA: names(BOARD.filter(g => A(g) >= mxA - 1)) + ` (${mxA - 1} to ${mxA}/12)`,
      topE: names(BOARD.filter(g => E(g) === mxE)) + ` (${mxE}/8)`,
      both: names(BOARD.filter(g => A(g) >= 4 && E(g) >= 4)) || "none",
      bothN: count(BOARD.filter(g => A(g) >= 4 && E(g) >= 4).length).toLowerCase(),
      autoZero: BOARD.filter(g => g.score[0] === 0).length, n: BOARD.length,
    };
  })();
  document.querySelectorAll("[data-bstat]").forEach(el => {
    const v = BSTATS[el.dataset.bstat];
    el.textContent = v === undefined ? "?" : v;
  });

  // Figure 11: board games, ALife score against environmental score, with video-game averages for reference.
  function figBoard() {
    const box = document.getElementById("fig-board"); if (!box) return;
    box.innerHTML = "";
    const w = Math.max(300, box.clientWidth), h = 380;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: "img", "aria-label": "Board games: ALife score against environmental score" }, box);
    const m = { l: 40, r: 14, t: 12, b: 40 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
    const xs = v => m.l + (v / 12) * iw, ys = v => m.t + ih - (v / 8) * ih;
    axes(svg, m, iw, ih, w, h, xs, ys, 12, 3, 8, 2, "ALife score (out of 12)", "Environmental score (out of 8)");
    const pts = BOARD.map(g => ({ g, x: xs(A(g) + jit(g.name, 0.3)), y: ys(E(g) + jit(g.name + "e", 0.3)) }));
    for (const p of pts) {
      const n = el("circle", { cx: p.x, cy: p.y, r: 4.5, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.8 }, svg);
      n.addEventListener("pointermove", e => showTip(`<b>${p.g.name}</b> (board game, ${p.g.year})<br>ALife ${A(p.g)}/12 · environment ${E(p.g)}/8<br><span class="tip-muted">${p.g.scoreWhy}</span>`, e.clientX, e.clientY));
      n.addEventListener("pointerleave", hideTip);
    }
    // reference averages: board games, and the video-game categories of Figure 5
    const refs = [
      { label: "Board games (average)", rows: BOARD, draw: (x, y) => el("circle", { cx: x, cy: y, r: 9, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 3 }, svg) },
      { label: "ALife video games (average)", rows: core, draw: (x, y) => { const n = shape(svg, CAT.alife.shape, x, y, 9, CAT.alife.color); n.setAttribute("stroke", "var(--ink)"); n.setAttribute("stroke-width", 2); return n; } },
      { label: "Conservation research (average)", rows: research, draw: (x, y) => { const n = shape(svg, CAT.research.shape, x, y, 9, CAT.research.color); n.setAttribute("stroke", "var(--ink)"); n.setAttribute("stroke-width", 2); return n; } },
    ];
    const placed = [];
    const tryLabel = (text, x, y, cls, pad) => {
      for (const [dx, dy, anchor] of [[12, 4, "start"], [-12, 4, "end"], [0, -13, "middle"], [0, 21, "middle"]]) {
        const t = el("text", { x: x + dx, y: y + dy, class: cls, "text-anchor": anchor }, svg);
        t.textContent = text;
        const b = t.getBBox();
        if (placed.some(o => b.x < o.x + o.width + pad && o.x < b.x + b.width + pad && b.y < o.y + o.height + 1 && o.y < b.y + b.height + 1) || b.x < m.l || b.x + b.width > w) { t.remove(); continue; }
        placed.push(b); return true;
      }
      return false;
    };
    for (const r of refs) {
      const ax = mean(r.rows.map(A)), ay = mean(r.rows.map(E));
      const n = r.draw(xs(ax), ys(ay));
      n.addEventListener("pointermove", e => showTip(`<b>${r.label}</b>: ${r.rows.length} games<br>ALife ${f1(ax)}/12 · environment ${f1(ay)}/8`, e.clientX, e.clientY));
      n.addEventListener("pointerleave", hideTip);
      tryLabel(r.label, xs(ax), ys(ay), "point-label mean-label", 8);
    }
    // label the most "alive" and the most environmental board games
    const byA = [...pts].sort((a, b) => A(b.g) - A(a.g)).slice(0, 4);
    const byE = [...pts].sort((a, b) => E(b.g) - E(a.g)).slice(0, 4);
    for (const p of [...new Set([...byA, ...byE])]) tryLabel(p.g.name, p.x, p.y, "point-label", 4);
    document.getElementById("board-legend").innerHTML =
      `<span><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/></svg> board game (${BOARD.length})</span>` +
      legendHTML([["alife", "ALife video games, average"], ["research", "conservation research, average"]]);
  }

  figTimeline(); figProfile(); figPopularity(); figPopularity("life"); figReception(); figReception("life"); figGroups(); figGroups("life"); figCriteria(); figLife(); figLifeTable(); figCritDist(); figGenres("alife"); figGenres("life"); figBoard();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { figTimeline(); figProfile(); figPopularity(); figPopularity("life"); figReception(); figReception("life"); figGroups(); figGroups("life"); figLife(); figLifeTable(); figCritDist(); figGenres("alife"); figGenres("life"); figBoard(); }, 150); });
})();
