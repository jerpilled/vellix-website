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

  tabs.forEach((t) =>
    t.addEventListener("click", () => {
      tabs.forEach((x) => x.setAttribute("aria-pressed", String(x === t)));
      category = t.dataset.cat;
      apply();
    })
  );
  search.addEventListener("input", apply);
}
