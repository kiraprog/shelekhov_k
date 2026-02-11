const CONFIG = {
  contacts: {
    email: "your@email.com",
    telegramUrl: "https://t.me/yourhandle",
    telegramText: "@yourhandle",
    instagramUrl: "https://instagram.com/yourhandle",
    instagramText: "@yourhandle",
    primaryCtaUrl: "mailto:your@email.com?subject=Video%20editing%20inquiry"
  }
};

const state = {
  all: [],
  filter: "all"
};

const el = (sel) => document.querySelector(sel);

function setContacts() {
  const { email, telegramUrl, telegramText, instagramUrl, instagramText, primaryCtaUrl } = CONFIG.contacts;

  const emailEl = el("#contactEmail");
  emailEl.textContent = email;
  emailEl.href = `mailto:${email}`;

  const tgEl = el("#contactTelegram");
  tgEl.textContent = telegramText;
  tgEl.href = telegramUrl;

  const igEl = el("#contactInstagram");
  igEl.textContent = instagramText;
  igEl.href = instagramUrl;

  const btn = el("#contactBtn");
  btn.href = primaryCtaUrl;

  el("#year").textContent = new Date().getFullYear();
}

function youtubeThumb(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function buildEmbedUrl(source) {
  // source: { type: 'youtube'|'gdrive'|'url', id?:string, url?:string }
  if (!source) return "";

  if (source.type === "youtube") {
    return `https://www.youtube.com/embed/${source.id}`;
  }
  if (source.type === "gdrive") {
    return `https://drive.google.com/file/d/${source.id}/preview`;
  }
  if (source.type === "url") {
    return source.url;
  }
  return "";
}

function buildOpenUrl(source) {
  if (!source) return "#";
  if (source.type === "youtube") return `https://www.youtube.com/watch?v=${source.id}`;
  if (source.type === "gdrive") return `https://drive.google.com/file/d/${source.id}/view`;
  if (source.type === "url") return source.url;
  return "#";
}

function formatLabel(format) {
  return format === "vertical" ? "Vertical (9:16)" : "Horizontal (16:9)";
}

function render(items) {
  const grid = el("#grid");
  const empty = el("#empty");
  grid.innerHTML = "";

  if (!items.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "item";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open video: ${item.title}`);

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    // Thumb logic:
    // - YouTube: auto thumb
    // - Otherwise: optional item.thumbUrl
    // - Else: gradient placeholder
    if (item.thumbUrl) {
      const img = document.createElement("img");
      img.src = item.thumbUrl;
      img.alt = item.title;
      img.loading = "lazy";
      thumb.appendChild(img);
    } else if (item.source?.type === "youtube") {
      const img = document.createElement("img");
      img.src = youtubeThumb(item.source.id);
      img.alt = item.title;
      img.loading = "lazy";
      thumb.appendChild(img);
    }

    const play = document.createElement("div");
    play.className = "play";
    play.textContent = "Play";
    thumb.appendChild(play);

    const meta = document.createElement("div");
    meta.className = "meta";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = item.title;

    const sub = document.createElement("div");
    sub.className = "sub";
    sub.textContent = item.note || "";

    left.appendChild(title);
    left.appendChild(sub);

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = item.format === "vertical" ? "Vertical" : "Horizontal";

    meta.appendChild(left);
    meta.appendChild(badge);

    card.appendChild(thumb);
    card.appendChild(meta);

    const open = () => openModal(item);

    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    grid.appendChild(card);
  });
}

function applyFilter() {
  const f = state.filter;
  const items = f === "all" ? state.all : state.all.filter((x) => x.format === f);
  render(items);
}

function setFeaturedTitle(items, featuredId) {
  const featured = items.find((x) => x.id === featuredId) || items[0];
  el("#featuredTitle").textContent = featured ? featured.title : "Selected work";
}

function initFilters() {
  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.filter = btn.dataset.filter;
      applyFilter();
    });
  });
}

function openModal(item) {
  const modal = el("#modal");
  const player = el("#player");
  const playerWrap = el("#playerWrap");
  const title = el("#modalTitle");
  const meta = el("#modalMeta");
  const openSource = el("#openSource");

  title.textContent = item.title;
  meta.textContent = formatLabel(item.format);

  playerWrap.classList.toggle("player--vertical", item.format === "vertical");
  playerWrap.classList.toggle("player--horizontal", item.format !== "vertical");

  const src = buildEmbedUrl(item.source);
  player.src = src;

  openSource.href = buildOpenUrl(item.source);

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  // Focus close button for accessibility
  modal.querySelector(".modal__close").focus();
}

function closeModal() {
  const modal = el("#modal");
  const player = el("#player");
  player.src = ""; // stop playback
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function initModal() {
  el("#modal").addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.close === "true") closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

async function load() {
  setContacts();
  initFilters();
  initModal();

  const res = await fetch("videos.json", { cache: "no-store" });
  const data = await res.json();

  state.all = (data.items || []).slice();

  // Sort: vertical first? (optional) — leave as-is, you control order in JSON.
  setFeaturedTitle(state.all, data.featured);
  applyFilter();
}

load().catch((err) => {
  console.error(err);
  el("#grid").innerHTML = `<div class="empty">Failed to load videos.json. Check console.</div>`;
});
