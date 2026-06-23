(() => {
  "use strict";

  const ARCHIVE_SHA = "92c5df1c24fa6d0611ceda99e5bc07b255754e38";
  const ARCHIVE_URLS = [
    `https://raw.githubusercontent.com/ren-jie-wu/public-pages/${ARCHIVE_SHA}/yellowstone-trip/index.html`,
    `https://cdn.jsdelivr.net/gh/ren-jie-wu/public-pages@${ARCHIVE_SHA}/yellowstone-trip/index.html`,
  ];

  const MAPS = [
    {
      day: 1,
      title: "7/9｜抵达盐湖城",
      subtitle: "机场取车后，按到达时间选择市区方案或 Antelope Island。",
      embedUrl: "https://www.google.com/maps/d/u/0/embed?mid=1XixH0GqXY8KUk3rT1B3a7VRo6FCvnik&ehbc=2E312F&noprof=1",
    },
    {
      day: 2,
      title: "7/10｜SLC → West Yellowstone → 大棱镜一带",
      subtitle: "长途北上；下午游览 Midway 与 Lower Geyser Basin。",
      embedUrl: "https://www.google.com/maps/d/u/0/embed?mid=1EMj1MBLmDoZ6ZyyCWrpAbbDpDMPbtpA&ehbc=2E312F&noprof=1",
    },
    {
      day: 3,
      title: "7/11｜Old Faithful + Upper Geyser Basin",
      subtitle: "西门往返 Old Faithful；盆地内部以步行为主。",
      embedUrl: "https://www.google.com/maps/d/u/0/embed?mid=1aqPI-rzf1T7lrsA7wVL5pFiVlSoDl8o&ehbc=2E312F&noprof=1",
    },
    {
      day: 4,
      title: "7/12｜Norris → Mammoth → Lamar → Canyon → West Yellowstone",
      subtitle: "北环长环线；傍晚短看 North Rim 后返回 West Yellowstone。",
      embedUrl: "https://www.google.com/maps/d/u/0/embed?mid=1X349V95ylGypdcDc5onpJnd_YEy1SFI&ehbc=2E312F&noprof=1",
      mapNote: "地图尚未补上 Canyon → West Yellowstone 回程，以正文路线为准。",
    },
    {
      day: 5,
      title: "7/13｜West Yellowstone → Canyon → 湖区 → Grand Teton",
      subtitle: "早上重点游览 South Rim，随后经黄石湖区南下。",
      embedUrl: "https://www.google.com/maps/d/u/0/embed?mid=1-PtitmyqekulbSeFx0yzHV_9Ijoxm3E&ehbc=2E312F&noprof=1",
      mapNote: "地图起点仍为 Canyon；实际需先从 West Yellowstone 驶入，以正文路线为准。",
    },
    {
      day: 6,
      title: "7/14｜Grand Teton 核心景点 → Salt Lake City",
      subtitle: "上午 Jenny Lake 坐船徒步，下午顺路补南部景点后返回 SLC。",
      embedUrl: "https://www.google.com/maps/d/u/0/embed?mid=1UioPxx72NbNUVkUvcNBwagD7jBLN2ZA&ehbc=2E312F&noprof=1",
    },
    {
      day: 7,
      title: "7/15｜返程",
      subtitle: "以机场为核心；晚班机且时间充足时再补市区。",
      embedUrl: "https://www.google.com/maps/d/u/0/embed?mid=1H2yT_J3OA8xm2Sv2OzZHCdZh628PQEg&ehbc=2E312F&noprof=1",
    },
  ];

  function anchor(id) {
    const node = document.getElementById(id);
    return node ? node.closest("p") || node : null;
  }

  function sectionNodes(day) {
    const start = anchor(`day${day}`);
    const end = anchor(`day${day + 1}`);
    if (!start) return [];
    const nodes = [];
    let node = start.nextElementSibling;
    while (node && node !== end) {
      nodes.push(node);
      node = node.nextElementSibling;
    }
    return nodes;
  }

  function findInDay(day, selector, predicate) {
    for (const root of sectionNodes(day)) {
      if (root.matches?.(selector) && predicate(root)) return root;
      const nested = [...(root.querySelectorAll?.(selector) || [])].find(predicate);
      if (nested) return nested;
    }
    return null;
  }

  function replaceSection(startId, endId, html) {
    const start = anchor(startId);
    const end = anchor(endId);
    if (!start || !end) return;
    let node = start.nextElementSibling;
    while (node && node !== end) {
      const next = node.nextElementSibling;
      node.remove();
      node = next;
    }
    end.insertAdjacentHTML("beforebegin", html);
  }

  function nextMatching(node, selector) {
    let current = node?.nextElementSibling || null;
    while (current) {
      if (current.matches?.(selector)) return current;
      current = current.nextElementSibling;
    }
    return null;
  }

  function replaceText(root, from, to) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.nodeValue.includes(from)) node.nodeValue = node.nodeValue.split(from).join(to);
    });
  }

  async function fetchArchive() {
    let lastError;
    for (const url of ARCHIVE_URLS) {
      try {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("无法载入归档行程");
  }

  function addStyles() {
    const style = document.createElement("style");
    style.id = "yellowstone-enhancements";
    style.textContent = `
      :root {
        --text: #1f2937; --muted: #5b6472; --line: #d7dde5;
        --soft: #f6f8fb; --accent: #2f6ea5; --accent-soft: #eaf3fb;
        --warning-soft: #fff8e8;
      }
      html { scroll-behavior: smooth; background: #fff !important; }
      body {
        max-width: 960px !important; margin: 0 auto !important;
        padding: 32px 24px 72px !important; box-sizing: border-box !important;
        font-size: 16px !important; line-height: 1.65 !important;
        color: var(--text) !important; background: #fff !important;
        overflow-wrap: anywhere;
      }
      h1 { font-size: 32px !important; margin: .25em 0 .45em !important; padding-bottom: .28em !important; }
      h2 { font-size: 23px !important; margin: 1.45em 0 .55em !important; padding-left: .55em !important; }
      h3 { font-size: 18px !important; margin: 1em 0 .38em !important; }
      h4 { font-size: 16px !important; }
      p, ul, ol { margin: .38em 0 .75em !important; }
      li { margin: .18em 0 !important; }
      table { display: table !important; width: 100% !important; font-size: 14px !important; overflow: visible !important; }
      th, td { padding: 9px 10px !important; }
      details { margin: .8em 0 1em !important; padding: .65em .8em !important; }
      summary { cursor: pointer !important; }
      img { max-height: 420px !important; display: block; margin-left: auto !important; margin-right: auto !important; }
      figcaption { text-align: center; color: var(--muted); font-size: .86em; }
      .updated-note { margin: .8em 0 1.25em !important; color: var(--muted); font-size: .9em; }
      .travel-alert {
        margin: .9em 0 1.05em; padding: .8em 1em; border: 1px solid #efd7a8;
        border-left: 4px solid #d28b2c; border-radius: 8px;
        background: var(--warning-soft); color: #65410e;
      }
      .travel-alert strong { color: #65410e !important; }
      .route-map-card {
        margin: 1em 0 1.35em; overflow: hidden; border: 1px solid #dbe4ee;
        border-radius: 12px; background: #fbfdff; break-inside: avoid;
        box-shadow: 0 5px 18px rgba(31, 41, 55, .06);
      }
      .route-map-head { padding: 14px 16px 10px; border-bottom: 1px solid #e5ebf2; }
      .route-map-head h3 { margin: 0 0 3px !important; color: #1f3f5b !important; }
      .route-map-head p { margin: 0 !important; color: var(--muted); font-size: .9em; }
      .route-map-embed { position: relative; width: 100%; aspect-ratio: 4 / 3; overflow: hidden; background: #eef3f7; }
      .route-map-embed iframe { display: block; width: 100%; height: 100%; border: 0; }
      .route-map-foot { display: grid; gap: 6px; padding: 12px 16px 14px; border-top: 1px solid #e5ebf2; }
      .map-note { margin: 0 !important; color: var(--muted); font-size: .78em; }
      .map-warning { color: #8a4b08; font-weight: 600; }
      @media (max-width: 680px) {
        body { padding: 18px 15px 52px !important; font-size: 15px !important; line-height: 1.62 !important; }
        h1 { font-size: 27px !important; } h2 { font-size: 21px !important; } h3 { font-size: 17px !important; }
        table { display: block !important; overflow-x: auto !important; font-size: 13px !important; }
      }
      @media print {
        body { max-width: none !important; padding: 0 4mm !important; font-size: 11.2px !important; line-height: 1.4 !important; }
        h1 { font-size: 23px !important; } h2 { font-size: 17px !important; margin-top: 1em !important; }
        h3 { font-size: 14px !important; } table { font-size: 11px !important; }
        .route-map-card { box-shadow: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function updateHeaderAndOverview() {
    const heading = document.querySelector("h1");
    const intro = heading?.nextElementSibling;
    if (intro) {
      intro.innerHTML = `<strong>日期：2026年7月9日–7月15日</strong><br>
        <strong>路线：SLC → West Yellowstone（3晚）→ Grand Teton/Jackson → SLC</strong><br>
        <strong>人数：3人，自驾，共住一间房或 cabin</strong>`;
    }

    const overviewHeading = [...document.querySelectorAll("h2")].find(
      (node) => node.textContent.trim() === "行程总览",
    );
    const table = nextMatching(overviewHeading, "table");
    if (!table) return;
    const rows = [...table.querySelectorAll("tbody tr")];
    const setRow = (date, route, lodging) => {
      const row = rows.find((item) => item.cells[0]?.textContent.trim() === date);
      if (row) {
        row.cells[1].textContent = route;
        row.cells[2].textContent = lodging;
      }
    };
    setRow("7/12", "Norris + Mammoth + Lamar + Canyon → West Yellowstone", "West Yellowstone");
    setRow("7/13", "West Yellowstone → Canyon + 湖区 → Grand Teton；Kayak 可选", "Moran / Colter Bay / Jackson");
    setRow("7/14", "Jenny Lake + Grand Teton 南部景点 → SLC", "SLC Airport");
  }

  function updatePreparationAndLodging() {
    const hotelHeading = [...document.querySelectorAll("h3")].find(
      (node) => node.textContent.trim() === "2. 酒店",
    );
    const hotelList = nextMatching(hotelHeading, "ol");
    if (hotelList) {
      hotelList.innerHTML = `
        <li>West Yellowstone：7/10–7/13（连续3晚）</li>
        <li>Moran / Colter Bay / Jackson：7/13–7/14</li>
        <li>SLC：7/9和7/14</li>`;
    }

    const weatherItem = [...document.querySelectorAll("li")].find((node) =>
      node.textContent.includes("查看 SLC、West Yellowstone、Gardiner"),
    );
    if (weatherItem) {
      weatherItem.textContent = "查看 SLC、West Yellowstone、Canyon、Colter Bay / Moran、Jackson 天气";
    }

    const lodgingTable = nextMatching(anchor("hotel"), "table");
    if (lodgingTable) {
      const rows = [...lodgingTable.querySelectorAll("tbody tr")];
      const july12 = rows.find((row) => row.cells[0]?.textContent.trim() === "7/12");
      if (july12) {
        july12.cells[1].textContent = "West Yellowstone";
        if (july12.cells[2]) july12.cells[2].textContent = "1";
        if (july12.cells[3]) july12.cells[3].textContent = "$260–320";
      }
      const total = rows.find((row) => row.cells[0]?.textContent.includes("总计"));
      if (total?.cells[3]) total.cells[3].innerHTML = "<strong>$1,560–2,040</strong>";
      lodgingTable.insertAdjacentHTML(
        "afterend",
        `<p><strong>7/12住宿说明：</strong>继续住 West Yellowstone，三晚尽量订同一酒店和同一房型。相比 Canyon Lodge 预计节省约 $200；代价是增加 Canyon 往返约 3–4 小时驾驶。</p>`,
      );
    }
  }

  function updateBudgetAndPacking() {
    const sharedHeading = [...document.querySelectorAll("h2")].find(
      (node) => node.textContent.trim() === "三个人共用即可",
    );
    const sharedList = nextMatching(sharedHeading, "ul");
    if (sharedList) {
      sharedList.insertAdjacentHTML(
        "beforeend",
        `<li>1个 10–20 L 小 dry bag 或防水收纳袋</li>
         <li>2–3个防水手机袋</li>
         <li>1–2条轻量速干毛巾</li>`,
      );
    }

    const budgetTable = nextMatching(anchor("budget"), "table");
    if (budgetTable) {
      const rows = [...budgetTable.querySelectorAll("tbody tr")];
      const setBudget = (label, total, perPerson) => {
        const row = rows.find((item) => item.cells[0]?.textContent.includes(label));
        if (!row) return;
        row.cells[1].innerHTML = `<strong>${total}</strong>`;
        row.cells[2].innerHTML = label === "总计" ? `<strong>${perPerson}</strong>` : perPerson;
      };
      setBudget("酒店", "$1,560–2,040", "$520–680");
      setBudget("机酒以外", "$2,050–3,000", "$685–1,000");
      setBudget("总计", "$4,600–6,200", "$1,535–2,070");
    }

    const activityHeading = [...document.querySelectorAll("h3")].find((node) =>
      node.textContent.includes("活动和用品"),
    );
    if (activityHeading) activityHeading.textContent = "活动和用品：$365–575";
    const activityTable = nextMatching(activityHeading, "table");
    if (activityTable) {
      const body = activityTable.querySelector("tbody");
      const firstRow = body?.querySelector("tr");
      firstRow?.insertAdjacentHTML(
        "afterend",
        `<tr><td>Colter Bay kayak（两小时粗估）</td><td style="text-align: right;">$150–200</td></tr>`,
      );
    }
  }

  function updateTips() {
    const list = nextMatching(anchor("tips"), "ul");
    if (!list) return;
    [...list.querySelectorAll("li")].forEach((item) => {
      if (item.textContent.includes("7/13为最长行程日")) item.remove();
    });
    list.insertAdjacentHTML(
      "beforeend",
      `<li><strong>7/12：</strong>目标 5:30–6:00 PM 离开 Lamar；晚到 Canyon 就缩减 North Rim。</li>
       <li><strong>Canyon 往返：</strong>返回 West Yellowstone 预留 1.5–2 小时，不疲劳驾驶。</li>
       <li><strong>Colter Bay kayak：</strong>雷雨、强风、低温或白浪时取消，全程穿 PFD。</li>`,
    );
  }

  function addUpdateNote() {
    document.documentElement.lang = "zh-CN";
    document.title = "盐湖城—黄石—大提顿 7天6晚行程";
    const heading = document.querySelector("h1");
    const intro = heading?.nextElementSibling;
    if (intro) {
      const note = document.createElement("p");
      note.className = "updated-note";
      note.innerHTML = `<strong>最后更新：2026年6月23日。</strong> 7/12 改为 West Yellowstone 连住第三晚；Grand Canyon 分为 7/12 傍晚 North Rim 与 7/13 早上 South Rim。`;
      intro.insertAdjacentElement("afterend", note);
    }

    replaceText(document.body, "SLC → West Yellowstone → Gardiner → Grand Teton/Jackson → SLC", "SLC → West Yellowstone → Grand Teton/Jackson → SLC");

    document.querySelectorAll("img").forEach((image, index) => {
      if (index > 0) image.loading = "lazy";
      image.decoding = "async";
    });
    document.querySelectorAll('a[href^="http"]').forEach((link) => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  }

  function addMaps() {
    MAPS.forEach((map) => {
      const heading = findInDay(map.day, "h2", () => true);
      if (!heading || !map.embedUrl) return;
      const section = document.createElement("section");
      section.className = "route-map-card";
      section.id = `route-map-day-${map.day}`;
      const warning = map.mapNote
        ? `<p class="map-note map-warning">${map.mapNote}</p>`
        : "";
      section.innerHTML = `
        <div class="route-map-head">
          <h3>${map.title}｜路线地图</h3>
          <p>${map.subtitle}</p>
        </div>
        <div class="route-map-embed">
          <iframe src="${map.embedUrl}" title="${map.title}路线地图" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <div class="route-map-foot">
          ${warning}
          <p class="map-note">实际驾驶以当天路况、NPS 道路状态和现场封路指示为准。</p>
        </div>`;
      const intensity = findInDay(map.day, "p", (node) => node.textContent.includes("驾驶强度"));
      (intensity || heading).insertAdjacentElement("afterend", section);
    });
  }

  (async function init() {
    try {
      const archive = await fetchArchive();
      const parsed = new DOMParser().parseFromString(archive, "text/html");
      document.getElementById("content").innerHTML = parsed.body.innerHTML;
      addStyles();

      if (!window.TRIP_V2) throw new Error("TRIP_V2 content missing");
      replaceSection("day4", "day5", window.TRIP_V2.day4);
      replaceSection("day5", "day6", window.TRIP_V2.day5);
      replaceSection("day6", "day7", window.TRIP_V2.day6);

      updateHeaderAndOverview();
      updatePreparationAndLodging();
      updateBudgetAndPacking();
      updateTips();
      addUpdateNote();
      addMaps();
    } catch (error) {
      console.error(error);
      document.getElementById("content").innerHTML = `
        <div id="loading">
          <strong>行程正文暂时无法载入。</strong><br>
          可先查看 <a href="https://github.com/ren-jie-wu/public-pages/blob/${ARCHIVE_SHA}/yellowstone-trip/index.html">GitHub 中的归档版本</a>。
        </div>`;
    }
  })();
})();
