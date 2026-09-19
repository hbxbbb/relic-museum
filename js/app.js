(() => {
  const artifacts = window.ARTIFACT_WORLD;
  const types = ["全部", "青铜器", "陶瓷", "雕塑", "绘画", "金银器", "玉石器", "文书碑刻", "织物"];
  const typeCopy = {
    青铜器: "礼器、兵器与神面",
    陶瓷: "土与火的釉色",
    雕塑: "石、泥与人体",
    绘画: "绢素与油彩",
    金银器: "王权的反光",
    玉石器: "温润与纪念碑",
    文书碑刻: "把法律与语言刻下来",
    织物: "针线里的史诗"
  };

  const els = {
    gallery: document.getElementById("gallery"),
    empty: document.getElementById("empty"),
    filters: document.getElementById("filters"),
    wings: document.getElementById("wing-grid"),
    search: document.getElementById("search-input"),
    result: document.getElementById("result-line"),
    overlay: document.getElementById("overlay"),
    close: document.getElementById("close-sheet"),
    random: document.getElementById("random-btn"),
    more: document.getElementById("load-more"),
    heroImage: document.getElementById("hero-image"),
    heroName: document.getElementById("hero-name"),
    heroMeta: document.getElementById("hero-meta"),
    count: document.getElementById("stat-count")
  };

  let type = "全部";
  let query = "";
  let shown = 24;
  const PAGE = 24;

  const countByType = (name) =>
    artifacts.filter((item) => name === "全部" || item.type === name).length;

  function renderWings() {
    els.wings.innerHTML = types
      .slice(1)
      .map(
        (name) => `
        <button class="wing" type="button" data-type="${name}">
          <small>门类</small>
          <strong>${name}</strong>
          <b>${typeCopy[name]} · ${countByType(name)} 件</b>
        </button>`
      )
      .join("");
  }

  function renderFilters() {
    els.filters.innerHTML = types
      .map(
        (name) =>
          `<button class="chip${name === type ? " active" : ""}" type="button" data-type="${name}">${name}</button>`
      )
      .join("");
  }

  function filtered() {
    const q = query.trim().toLowerCase();
    return artifacts.filter((item) => {
      const typeOk = type === "全部" || item.type === type;
      if (!typeOk) return false;
      if (!q) return true;
      return [item.name, item.era, item.civilization, item.museum, item.summary, item.story]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }

  function renderGallery() {
    const list = filtered();
    els.result.textContent = query
      ? `找到 ${list.length} 件与“${query}”有关的文物`
      : type === "全部"
        ? `馆藏 ${list.length} 件，按门类慢慢看`
        : `${type}现有 ${list.length} 件`;

    els.empty.hidden = list.length > 0;
    const visible = list.slice(0, shown);
    els.gallery.innerHTML = visible
      .map(
        (item) => `
        <button class="card" type="button" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.removeAttribute('src')" />
          <div class="card-body">
            <div class="type">${item.type} · ${item.civilization}</div>
            <h3>${item.name}</h3>
            <p class="era">${item.era}</p>
            <p class="blurb">${item.summary}</p>
          </div>
        </button>`
      )
      .join("");
    els.more.hidden = visible.length >= list.length;
  }

  function openArtifact(id) {
    const item = artifacts.find((entry) => entry.id === id);
    if (!item) return;
    const image = document.getElementById("sheet-image");
    image.onerror = () => image.removeAttribute("src");
    image.src = item.image;
    image.alt = item.name;
    document.getElementById("sheet-type").textContent = item.type;
    document.getElementById("sheet-name").textContent = item.name;
    document.getElementById("sheet-story").textContent = item.story;
    document.getElementById("sheet-meta").innerHTML = [
      ["年代", item.era],
      ["文明", item.civilization],
      ["馆藏", item.museum]
    ]
      .map(([label, value]) => `<li><b>${label}</b>${value}</li>`)
      .join("");
    els.overlay.hidden = false;
    document.body.style.overflow = "hidden";
    els.close.focus();
  }

  function closeSheet() {
    els.overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function setType(next) {
    type = next;
    shown = PAGE;
    document.querySelectorAll(".wing").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === next);
    });
    renderFilters();
    renderGallery();
    document.getElementById("atlas").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setHero(item) {
    els.heroImage.onerror = () => els.heroImage.removeAttribute("src");
    els.heroImage.src = item.image;
    els.heroImage.alt = item.name;
    els.heroName.textContent = item.name;
    els.heroMeta.textContent = `${item.era} · ${item.civilization}`;
    els.heroImage.onclick = () => openArtifact(item.id);
    els.heroImage.style.cursor = "pointer";
  }

  els.count.textContent = String(artifacts.length);
  renderWings();
  renderFilters();
  renderGallery();

  const featured = artifacts.filter((item) => item.featured);
  let heroIndex = 0;
  setHero(featured[0]);
  setInterval(() => {
    heroIndex = (heroIndex + 1) % featured.length;
    setHero(featured[heroIndex]);
  }, 7000);

  els.filters.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-type]");
    if (btn) setType(btn.dataset.type);
  });

  els.wings.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-type]");
    if (btn) setType(btn.dataset.type);
  });

  els.gallery.addEventListener("click", (event) => {
    const card = event.target.closest("[data-id]");
    if (card) openArtifact(card.dataset.id);
  });

  els.search.addEventListener("input", (event) => {
    query = event.target.value;
    shown = PAGE;
    renderGallery();
  });

  els.more.addEventListener("click", () => {
    shown += PAGE;
    renderGallery();
  });

  els.random.addEventListener("click", () => {
    const item = artifacts[Math.floor(Math.random() * artifacts.length)];
    setHero(item);
    openArtifact(item.id);
  });

  els.close.addEventListener("click", closeSheet);
  els.overlay.addEventListener("click", (event) => {
    if (event.target === els.overlay) closeSheet();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSheet();
  });
})();
