/* ===== You can change these ===== */
const VELLIX = {
  clientId: "1559358210006196295",                 // Developer Portal → General Information → Application ID
  support: "https://discord.gg/t5aDvZ7UTr",     // your support server invite
  permissions: "1374659407062",
  // Where the dashboard lives. It runs on the bot's PC, so localhost only works on that PC.
  // When the dashboard gets a public address (e.g. an ngrok domain), put it here.
  dashboard: "http://localhost:8080",
};
/* ================================= */

window.vxMotion = true; // tells the safety timer in <head> that the animation script is running
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const inviteUrl =
  `https://discord.com/oauth2/authorize?client_id=${VELLIX.clientId}` +
  `&permissions=${VELLIX.permissions}&scope=bot+applications.commands`;

document.querySelectorAll("[data-invite]").forEach((a) => (a.href = inviteUrl));
document.querySelectorAll("[data-support]").forEach((a) => (a.href = VELLIX.support));
// Dashboard links carry the current light/dark choice over (the dashboard is a different address)
document.querySelectorAll("[data-dashboard]").forEach((a) => {
  a.href = VELLIX.dashboard;
  a.addEventListener("click", () => {
    const url = new URL(VELLIX.dashboard);
    url.searchParams.set("theme", document.documentElement.dataset.theme || "light");
    a.href = url.toString();
  });
});

/* Face hand-off with the dashboard.
   faceSlot() mirrors the dashboard's CSS for where the face rests beside the server list,
   so the orb can fly there before the page changes, and fly back from there on return. */
function faceSlot() {
  const w = window.innerWidth, h = window.innerHeight;
  if (w >= 900) {
    const s = Math.min(380, Math.max(220, w * 0.26));
    return { x: w - Math.max(0, (w - 1100) / 2) - 32 - s / 2, y: 62 + (h - 62) / 2, s };
  }
  const s = Math.min(200, w * 0.44);
  return { x: w / 2, y: 94 + s / 2, s };
}
/* Where the dashboard gathers its glow back into the face before the Website link:
   mid-screen (mirrors the dashboard's "center" mode). */
function glowSpot() {
  const w = window.innerWidth, h = window.innerHeight;
  return { x: w / 2, y: h / 2, s: (w <= 640 ? w * 0.86 : Math.min(560, w * 0.92)) * 0.62 };
}
(() => {
  const root = document.documentElement;
  const orb = document.querySelector(".orb");
  const from = { "#from-dashboard": "slot", "#from-glow": "glow" }[location.hash];
  if (from) history.replaceState(null, "", location.pathname + location.search);
  if (!orb) { root.classList.remove("vx-arrive"); return; }
  const EASE = "cubic-bezier(.65, 0, .35, 1)";
  const stage = orb.closest(".buddy-stage");
  // the page glow fades back in as Buddy's halo fades out, so the glow never pops
  const glowIn = (ms) => stage && stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: "ease-in-out", pseudoElement: "::before" });
  const haloOut = (ms) => {
    const h = document.createElement("span");
    h.className = "vx-halo"; h.setAttribute("aria-hidden", "true");
    orb.prepend(h);
    h.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: "ease-in-out", fill: "forwards" }).finished.then(() => h.remove(), () => h.remove());
    glowIn(ms);
  };
  const toSpot = (r, t) =>
    `translate(${t.x - (r.left + r.width / 2)}px, ${t.y - (r.top + r.height / 2)}px) scale(${t.s / r.width})`;

  // Returning from the dashboard: the orb starts where the face was and settles back into its place
  if (from) {
    orb.removeAttribute("data-reveal");          // skip its normal entrance
    orb.classList.add("is-visible", "revealed");
    root.classList.remove("vx-arrive");
    if (!calm && from === "glow") {
      // From inside a server: Buddy re-formed mid-screen and drops into his spot with a little bounce
      orb.animate([{ transform: toSpot(orb.getBoundingClientRect(), glowSpot()) }, { transform: "none" }],
        { duration: 750, easing: "cubic-bezier(.34, 1.25, .64, 1)" });
      haloOut(900);
    } else if (!calm) {
      orb.animate([{ transform: toSpot(orb.getBoundingClientRect(), faceSlot()) }, { transform: "none" }], { duration: 900, easing: EASE });
      haloOut(900);
    }
  }

  // Leaving for the dashboard: the orb flies to the face's spot, the page fades, then we go
  let flight = null, clone = null, haloIn = null;
  orb.addEventListener("click", (e) => {
    if (calm || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const href = new URL(orb.href);
    href.hash = "from-orb";
    const r = orb.getBoundingClientRect();
    clone = document.createElement("div");
    clone.className = "orb-fly";
    clone.innerHTML = '<span class="vx-halo"></span><img src="/assets/vellix-face.webp" alt="">';
    Object.assign(clone.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    document.body.append(clone);
    orb.style.visibility = "hidden";
    root.classList.add("vx-leaving");
    flight = clone.animate([{ transform: "none" }, { transform: toSpot(r, faceSlot()) }], { duration: 850, easing: EASE, fill: "forwards" });
    // the page glow fades with the page while Buddy gathers it up as his halo
    haloIn = clone.firstChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 850, easing: "ease-in-out", fill: "forwards" });
    flight.finished.then(() => { location.href = href.toString(); });
  });

  // Browser Back from the dashboard restores this page mid-flight: fly the face home
  addEventListener("pageshow", (e) => {
    if (!e.persisted || !flight) return;
    root.classList.remove("vx-leaving");
    const f = flight, c = clone;
    flight = clone = null;
    f.reverse();
    if (haloIn) { haloIn.reverse(); haloIn = null; }
    glowIn(850);
    f.finished.then(() => { c.remove(); orb.style.visibility = ""; }, () => {});
  });
})();

// Tidy the address bar after a ?theme= hand-over from the dashboard
(() => {
  const url = new URL(location.href);
  if (url.searchParams.has("theme")) {
    url.searchParams.delete("theme");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
})();
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* Light / dark switch. The choice is remembered in this browser. */
const themeButton = document.querySelector("[data-theme-toggle]");
function showTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeButton) themeButton.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
if (themeButton) {
  showTheme(document.documentElement.dataset.theme || "light");
  themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    showTheme(next);
    try { localStorage.setItem("vellix-theme", next); } catch (e) { /* private mode: just don't remember */ }
    document.dispatchEvent(new Event("vx-theme"));
  });
}

/* Small helper: build an element from trusted template text, putting user text in safely */
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* Discord-style text: escape everything, then **bold**, then the placeholders as mentions/values */
function discordText(raw, values) {
  let t = esc(raw).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return t.replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m));
}

/* ---------- Hero: try a command (example member and numbers, real formats) ---------- */
(() => {
  const demo = document.querySelector("[data-demo]");
  if (!demo) return;
  const used = demo.querySelector("[data-demo-used]");
  const reply = demo.querySelector("[data-demo-reply]");
  const chips = [...demo.querySelectorAll(".chip")];
  const hex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();  // taste-skill-ignore: Vellix's real reply text / hex code
  const lum = (rgb) => {
    const c = rgb.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const verdict = (r) => (r >= 4.5 ? "easy to read" : r >= 3 ? "large text only" : "hard to read");
  function hsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    let h = 0, s = 0;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return `${Math.round(h)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  }
  const replies = {
    balance: () => `<div class="dc-embed" style="--bar:#e8243c">
        <img src="/assets/cards/ember.webp" width="800" height="504" alt="maya's wallet card: 12,340 coins, 48,500 banked, 3 Embers, global level 27">
        <p class="foot">One wallet for every server · /card shop to restyle it</p></div>`,
    rank: () => `<div class="dc-embed" style="--bar:#e8243c">
        <p class="t">maya</p>
        <div class="f"><p class="fn">🏠 Server · Level 12 · #3</p><p class="meter">▰▰▰▰▰▰▰▰▱▱▱▱▱▱</p><p>880 / 1,420 XP · 7,910 total</p></div>  // taste-skill-ignore: Vellix's real reply text / hex code
        <div class="f"><p class="fn">🌍 Global · Level 27 · #148</p><p class="meter">▰▰▰▰▱▱▱▱▱▱▱▱▱▱</p><p>1,790 / 5,095 XP · 53,045 total</p></div>  // taste-skill-ignore: Vellix's real reply text / hex code
        <p class="foot">Every global level-up pays 100 × level in coins</p></div>`,
    daily: () => `<div class="dc-embed" style="--bar:#2fa866">
        <p class="t">Daily reward</p><p>You got 🪙 <strong>650</strong>!</p><p>Streak: <strong>4</strong> days</p>  // taste-skill-ignore: Vellix's real reply text / hex code
        <p class="dc-sub">3 more day(s) to your next Ember</p></div>`,
    color: () => {
      // reads this page's own background, the way /color reads the code you give it
      const m = getComputedStyle(document.body).backgroundColor.match(/\d+/g).slice(0, 3).map(Number);
      const w = ratio(m, [255, 255, 255]), k = ratio(m, [0, 0, 0]);
      const ink = w >= k ? "#fff" : "#000";
      return `<div class="dc-embed" style="--bar:${hex(m)}">
        <p class="t">Colour</p>
        <div class="dc-fields"><div><p class="fn">Hex</p><p>${hex(m)}</p></div><div><p class="fn">RGB</p><p>${m.join(", ")}</p></div><div><p class="fn">HSL</p><p>${hsl(m)}</p></div></div>
        <div class="swatch" style="background:${hex(m)};color:${ink}">
          <p><span class="w">Aa</span> White text ${w.toFixed(1)}:1, ${verdict(w)}</p>
          <p><span class="k">Aa</span> Black text ${k.toFixed(1)}:1, ${verdict(k)}</p>
          <p class="hex">${hex(m)}</p></div></div>`;
    },
  };
  let current = "balance";
  function run(cmd) {
    current = cmd;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cmd === cmd)));
    used.textContent = "/" + (cmd === "color" ? "color" : cmd);
    reply.innerHTML = replies[cmd]();
    if (!calm) reply.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.16, 1, .3, 1)" });
  }
  chips.forEach((c) => c.addEventListener("click", () => run(c.dataset.cmd)));
  document.addEventListener("vx-theme", () => { if (current === "color") run("color"); });
})();

/* ---------- Showcase: the centred reply is in focus and named; the others wait out of focus ---------- */
(() => {
  const row = document.querySelector("[data-row]");
  if (!row) return;
  const panels = [...row.querySelectorAll(".panel")];
  const name = document.querySelector("[data-side-name]");
  const text = document.querySelector("[data-side-text]");
  const prev = document.querySelector("[data-row-prev]");
  const next = document.querySelector("[data-row-next]");
  const slot = panels.length > 1 ? panels[1].offsetLeft - panels[0].offsetLeft : 1;
  let lit = null, swapId = 0, gliding = 0, raf = 0;

  // the side text crosses over to the new reply's name and sentence
  const swap = (p) => {
    const id = ++swapId;
    const set = () => { name.textContent = p.dataset.name; text.textContent = p.dataset.text; };
    if (calm || !lit) return set();
    const out = [name, text].map((el) => el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-8px)" }], { duration: 150, easing: "ease-in", fill: "forwards" }));
    out[1].finished.then(() => {
      if (id !== swapId) return;
      set();
      out.forEach((a) => a.cancel());
      [name, text].forEach((el, i) => el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 450, delay: i * 60, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "backwards" }));
    }, () => {});
  };
  const light = (p) => {
    if (!p || p === lit) return;
    swap(p);
    lit = p;
    panels.forEach((x) => x.classList.toggle("is-lit", x === p));
    const i = panels.indexOf(p);
    prev.classList.toggle("is-off", i === 0);                   // no arrow pointing past the first reply
    next.classList.toggle("is-off", i === panels.length - 1);   // or past the last
    if (document.activeElement && document.activeElement.classList.contains("is-off")) (i === 0 ? next : prev).focus();
  };
  // how far each reply is from the middle (0 = in focus, 1 = a whole slot away), read by the CSS blur and scale
  const focus = () => {
    const mid = row.scrollLeft + row.clientWidth / 2;
    let best = null, dist = Infinity;
    panels.forEach((p) => {
      const d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - mid);
      p.style.setProperty("--k", Math.min(1, d / slot).toFixed(3));
      if (d < dist) { dist = d; best = p; }
    });
    light(best);
  };
  const centre = (p) => p.offsetLeft + p.offsetWidth / 2 - row.clientWidth / 2;
  // an eased glide of our own (the browser's smooth scroll is abrupt); snapping is paused while it runs
  const stop = () => { if (gliding) { cancelAnimationFrame(gliding); gliding = 0; row.classList.remove("is-gliding"); } };
  const glide = (to) => {
    stop();
    if (calm) { row.scrollLeft = to; return; }
    row.classList.add("is-gliding");
    const from = row.scrollLeft, t0 = performance.now(), dur = 760;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      row.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) gliding = requestAnimationFrame(step);
      else { gliding = 0; row.classList.remove("is-gliding"); }
    };
    gliding = requestAnimationFrame(step);
  };
  const go = (step) => glide(centre(panels[Math.max(0, Math.min(panels.length - 1, panels.indexOf(lit) + step))]));

  focus();
  row.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(focus); }, { passive: true });
  addEventListener("resize", focus);
  addEventListener("load", focus);
  row.addEventListener("wheel", stop, { passive: true });
  row.addEventListener("touchstart", stop, { passive: true });
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  row.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  });
  // drag with a mouse (touch already swipes); on release it settles on the nearest reply
  let down = null;
  row.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") { stop(); down = { x: e.clientX, left: row.scrollLeft }; row.classList.add("is-dragging"); } });
  addEventListener("pointermove", (e) => { if (down) row.scrollLeft = down.left - (e.clientX - down.x); });
  addEventListener("pointerup", () => { if (down) { down = null; row.classList.remove("is-dragging"); focus(); go(0); } });
})();

/* ---------- Setup: the controls change the channel preview ---------- */
(() => {
  const preview = document.querySelector("[data-setup-preview]");
  if (!preview) return;
  const values = { user: '<span class="dc-mention">@juno</span>', name: "juno", server: "Cozy Corner", count: "128" };
  const welcomeIn = document.querySelector("[data-set-welcome]");
  const outWelcome = preview.querySelector("[data-out-welcome]");
  const spam = preview.querySelector("[data-out-spam]");
  const blocked = preview.querySelector("[data-out-blocked]");
  const levelup = preview.querySelector("[data-out-levelup]");
  const flash = (el) => { if (!calm) el.animate([{ backgroundColor: "rgba(245,166,35,.28)" }, { backgroundColor: "transparent" }], { duration: 900, easing: "ease-out" }); };
  const welcome = () => { outWelcome.innerHTML = discordText(welcomeIn.value || " ", values); };
  welcomeIn.addEventListener("input", welcome);
  welcomeIn.addEventListener("change", () => flash(outWelcome.closest(".dc-msg")));
  const sw = document.querySelector("[data-set-invites]");
  sw.addEventListener("click", () => {
    const on = sw.getAttribute("aria-checked") !== "true";
    sw.setAttribute("aria-checked", String(on));
    spam.hidden = on;
    blocked.hidden = !on;
    flash(on ? blocked : spam);
  });
  document.querySelectorAll("[data-set-levelup]").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("[data-set-levelup]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    levelup.hidden = b.dataset.setLevelup === "off";
    if (!levelup.hidden) flash(levelup);
  }));
  welcome();
})();

/* ---------- Getting started: each field performs its step once it's in view; the fragments tilt toward the mouse ---------- */
(() => {
  const steps = [...document.querySelectorAll("[data-step]")];
  if (!steps.length) return;
  if (document.documentElement.classList.contains("motion")) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-on"); io.unobserve(e.target); }
    }), { threshold: 0.3 });
    steps.forEach((s) => io.observe(s));
  } else steps.forEach((s) => s.classList.add("is-on"));
  if (calm) return;
  steps.forEach((step) => {
    const card = step.querySelector(".frag .dc");
    step.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${(-y * 9).toFixed(1)}deg) rotateY(${(x * 11).toFixed(1)}deg) translateY(-6px)`;
    });
    step.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
})();

/* ---------- Questions: one open at a time (hover, click or keyboard focus selects on wide screens) ---------- */
(() => {
  const faq = document.querySelector("[data-faq]");
  if (!faq) return;
  const qs = [...faq.querySelectorAll(".q")];
  const wide = window.matchMedia("(min-width: 900px)");
  const open = (q) => qs.forEach((x) => {
    const on = x === q;
    x.setAttribute("aria-expanded", String(on));
    document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
  });
  open(qs[0]);
  qs.forEach((q) => {
    q.addEventListener("click", () => open(q));
    q.addEventListener("focus", () => { if (wide.matches) open(q); });
    q.addEventListener("mouseenter", () => { if (wide.matches) open(q); });
  });
})();

/* ---------- Legal pages: the contents list marks the section you're reading ---------- */
(() => {
  const links = [...document.querySelectorAll(".toc a")];
  if (!links.length) return;
  const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove("is-here"));
      const a = byId.get(e.target.id);
      if (a) a.classList.add("is-here");
    });
  }, { rootMargin: "0px 0px -70% 0px" });
  byId.forEach((a, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
})();

/* Commands page: search box + category buttons */
const search = document.querySelector("#cmd-search");
if (search) {
  const tabs = [...document.querySelectorAll(".tab")];
  const groups = [...document.querySelectorAll(".cmd-group")];
  const empty = document.querySelector(".empty");
  let category = "all";

  function apply() {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    groups.forEach((g) => {
      const inCat = category === "all" || g.dataset.cat === category;
      let rows = 0;
      g.querySelectorAll("tr").forEach((tr) => {
        const match = inCat && (!q || tr.textContent.toLowerCase().includes(q));
        tr.hidden = !match;
        rows += match;
      });
      g.hidden = rows === 0;
      shown += rows;
    });
    empty.hidden = shown !== 0;
  }

  function selectTab(tab) {
    tabs.forEach((x) => x.setAttribute("aria-pressed", String(x === tab)));
    category = tab.dataset.cat;
  }

  tabs.forEach((t) =>
    t.addEventListener("click", () => {
      selectTab(t);
      apply();
      document.querySelectorAll("tr.is-target").forEach((tr) => tr.classList.remove("is-target"));
      // keep the address shareable: /commands/?cat=economy (or plain /commands/ for All)
      history.replaceState(null, "", category === "all" ? location.pathname : `${location.pathname}?cat=${category}`);
    })
  );
  search.addEventListener("input", apply);

  // Deep links, e.g. /commands/?cat=economy&cmd=daily
  const params = new URLSearchParams(location.search);
  const startTab = tabs.find((t) => t.dataset.cat === params.get("cat"));
  if (startTab) {
    selectTab(startTab);
    apply();
  }
  const cmd = (params.get("cmd") || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const row = cmd && document.getElementById("cmd-" + cmd);
  if (row && !row.hidden) {
    requestAnimationFrame(() => {
      row.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
      row.classList.add("is-target");
    });
  }
}

/* Scroll reveals: each element rises in once, the first time it scrolls into view.
   Elements that arrive together get a short stagger so they cascade instead of popping. */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains("motion")) return;
  const items = document.querySelectorAll("[data-reveal], .legal > *");
  const STAGGER = 80, MAX_STAGGER = 5;

  const io = new IntersectionObserver((entries) => {
    let batch = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      reveal(entry.target, Math.min(batch++, MAX_STAGGER) * STAGGER);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  // when finished, the delay is dropped and timing switches to snappy, so hovers respond instantly
  const reveal = (el, delay) => {
    el.style.setProperty("--d", delay + "ms");
    el.classList.add("is-visible");
    el.addEventListener("transitionend", () => { el.style.removeProperty("--d"); el.classList.add("revealed"); }, { once: true });
  };
  items.forEach((el) => {
    if (el.dataset.revealDelay !== undefined) requestAnimationFrame(() => requestAnimationFrame(() => reveal(el, Number(el.dataset.revealDelay))));
    else io.observe(el);
  });

  // Jumping to an anchor (e.g. /privacy/#contact) or printing should never leave things hidden
  window.addEventListener("beforeprint", () => items.forEach((el) => el.classList.add("is-visible")));
})();
