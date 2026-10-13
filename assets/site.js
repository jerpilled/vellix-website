/* ===== You can change these ===== */
const VELLIX = {
  clientId: "YOUR_CLIENT_ID",                 // Developer Portal → General Information → Application ID
  support: "https://discord.gg/YOURCODE",     // your support server invite
  permissions: "1374659407062",
};
/* ================================= */

const inviteUrl =
  `https://discord.com/oauth2/authorize?client_id=${VELLIX.clientId}` +
  `&permissions=${VELLIX.permissions}&scope=bot+applications.commands`;

document.querySelectorAll("[data-invite]").forEach((a) => (a.href = inviteUrl));
document.querySelectorAll("[data-support]").forEach((a) => (a.href = VELLIX.support));
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

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
