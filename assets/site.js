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
