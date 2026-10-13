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
   mid-screen, at the hero orb's own size (mirrors the dashboard's "center" mode). */
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
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(.65, 0, .35, 1)";
  const cards = [...document.querySelectorAll(".stage .float-card")];
  const rings = [...document.querySelectorAll(".stage .ring")];
  const toSpot = (r, t) =>
    `translate(${t.x - (r.left + r.width / 2)}px, ${t.y - (r.top + r.height / 2)}px) scale(${t.s / r.width})`;

  // The cards step aside while Buddy travels, then slide back out from behind him once he has landed
  let holdTimer = 0;
  const hold = () => { root.classList.add("vx-hold"); clearTimeout(holdTimer); holdTimer = setTimeout(release, 4000); };
  function release(delay = 0) {
    clearTimeout(holdTimer);
    if (!root.classList.contains("vx-hold")) return;
    root.classList.remove("vx-hold");
    // the orb's resting centre (layout box, so it ignores any flight still in progress)
    const st = orb.offsetParent.getBoundingClientRect();
    const ox = st.left + orb.offsetLeft + orb.offsetWidth / 2, oy = st.top + orb.offsetTop + orb.offsetHeight / 2;
    cards.forEach((c, i) => {
      c.getAnimations().forEach((a) => { if (a.animationName === "settle") a.finish(); });
      const r = c.getBoundingClientRect();
      if (!r.width) return;                       // hidden on small phones
      const dx = (ox - (r.left + r.width / 2)) * 0.35, dy = (oy - (r.top + r.height / 2)) * 0.35;
      c.animate([{ opacity: 0, translate: `${dx}px ${dy}px`, scale: 0.9 }, { opacity: 1, translate: "0px 0px", scale: 1 }],
        { duration: 650, delay: delay + i * 90, easing: "cubic-bezier(.34, 1.3, .64, 1)", fill: "backwards" });
    });
  }

  // Returning from the dashboard: the orb starts where the face was and settles back into its place
  if (from) {
    orb.removeAttribute("data-reveal");          // skip its normal entrance
    orb.classList.add("is-visible", "revealed");
    if (!calm) hold();
    if (!calm && from === "glow") {
      // From inside a server: Buddy re-formed mid-screen. He drops into his spot with a little bounce,
      // the rings ripple out from him, and the cards slide back out after them.
      rings.forEach((r) => {
        r.removeAttribute("data-reveal");
        r.classList.add("is-visible", "revealed");
        // each ring starts at the orb's size (orb 62% of the stage, inner ring 82%, outer 100%)
        r.animate([{ opacity: 0, scale: r.classList.contains("r2") ? 0.62 / 0.82 : 0.62 }, { opacity: 1, scale: 1 }],
          { duration: 800, delay: r.classList.contains("r2") ? 420 : 540, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "backwards" });
      });
      orb.animate([{ transform: toSpot(orb.getBoundingClientRect(), glowSpot()) }, { transform: "none" }],
        { duration: 750, easing: "cubic-bezier(.34, 1.25, .64, 1)" });
      root.classList.remove("vx-arrive");
      release(780);                               // just after he lands
    } else {
      root.classList.remove("vx-arrive");
      if (!calm) orb.animate([{ transform: toSpot(orb.getBoundingClientRect(), faceSlot()) }, { transform: "none" }], { duration: 900, easing: EASE })
        .finished.then(() => release(), () => release());
    }
  }

  // Leaving for the dashboard: the orb flies to the face's spot, the page fades, then we go
  let flight = null, clone = null;
  orb.addEventListener("click", (e) => {
    if (calm || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const href = new URL(orb.href);
    href.hash = "from-orb";
    const r = orb.getBoundingClientRect();
    clone = document.createElement("div");
    clone.className = "orb-fly";
    clone.innerHTML = '<img src="/assets/vellix-face.webp" alt="">';
    Object.assign(clone.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    document.body.append(clone);
    orb.style.visibility = "hidden";
    root.classList.add("vx-leaving");
    flight = clone.animate([{ transform: "none" }, { transform: toSpot(r, faceSlot()) }], { duration: 850, easing: EASE, fill: "forwards" });
    flight.finished.then(() => { location.href = href.toString(); });
  });

  // Browser Back from the dashboard restores this page mid-flight: fly the face home, then the cards
  addEventListener("pageshow", (e) => {
    if (!e.persisted || !flight) return;
    hold();
    root.classList.remove("vx-leaving");
    const f = flight, c = clone;
    flight = clone = null;
    f.reverse();
    f.finished.then(() => { c.remove(); orb.style.visibility = ""; release(); }, () => {});
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
  });
}

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

  // Deep links from the home page, e.g. /commands/?cat=economy&cmd=daily
  const params = new URLSearchParams(location.search);
  const startTab = tabs.find((t) => t.dataset.cat === params.get("cat"));
  if (startTab) {
    selectTab(startTab);
    apply();
  }
  const cmd = (params.get("cmd") || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const row = cmd && document.getElementById("cmd-" + cmd);
  if (row && !row.hidden) {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      row.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
      row.classList.add("is-target");
    });
  }
}

/* Scroll reveals: each element fades/slides in once, the first time it scrolls into view.
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
      // when finished, reveal() drops the delay and switches to snappy timing so hovers respond instantly
      reveal(entry.target, Math.min(batch++, MAX_STAGGER) * STAGGER);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  // The opening sequence (anything with a fixed delay) plays on load, even if it starts just below the fold
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
