(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);

  // --- یافتن اسکریپت خودمان به‌صورت مطمئن ---
  const scriptEl = document.currentScript ||
    Array.from(document.scripts).find(s => /assets\/js\/app\.js(\?|$)/.test(s.src));
  const pageRoot = scriptEl && scriptEl.src
    ? new URL("../../", scriptEl.src)          // quran/
    : new URL("./", window.location.href);     // fallback

  const faDigits = (value) => String(value).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
  const durationText = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "—";
    const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
    return `${faDigits(m)}:${faDigits(String(s).padStart(2, "0"))}`;
  };

  // --- تبدیل مسیر فایل صوتی به URL کامل ---
  function mediaUrl(file) {
    let path = String(file || "").trim().replace(/\\/g, "/");
    if (/^https?:\/\//i.test(path)) return path;
    while (path.startsWith("./")) path = path.slice(2);
    while (path.startsWith("../")) path = path.slice(3);
    return new URL(path, pageRoot).href;
  }

  let voices = [];
  let videos = [];

  function fillSelect(select, values) {
    if (!select) return;
    const first = select.options[0];
    select.innerHTML = "";
    select.appendChild(first);
    [...new Set(values.filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "fa"))
      .forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
  }

  function meta(label, value) {
    if (!value) return null;
    const el = document.createElement("span");
    el.textContent = `${label}: ${value}`;
    return el;
  }

  function renderVoices() {
    const list = $("voice-list");
    if (!list) return;

    const query = ($("voice-search")?.value || "").trim().toLocaleLowerCase("fa");
    const city  = $("city-filter")?.value  || "";
    const type  = $("type-filter")?.value  || "";
    const surah = $("surah-filter")?.value || "";

    const filtered = voices.filter(v => {
      const text = [v.city, v.type, v.surah, v.ayah, v.place]
        .join(" ").toLocaleLowerCase("fa");
      return (!query || text.includes(query)) &&
        (!city  || v.city  === city)  &&
        (!type  || v.type  === type)  &&
        (!surah || v.surah === surah);
    });

    const countEl = $("voice-count");
    if (countEl) countEl.textContent = faDigits(voices.length);

    const noRes = $("no-results");
    if (noRes) noRes.hidden = filtered.length > 0 || voices.length === 0;

    if (!voices.length) {
      list.innerHTML = `<div class="empty-state"><span class="empty-icon">♫</span><h3>آرشیو در حال تکمیل است</h3><p>هنوز اطلاعاتی برای نمایش ثبت نشده است.</p></div>`;
      return;
    }
    if (!filtered.length) { list.innerHTML = ""; return; }
    list.innerHTML = "";

    filtered.forEach((voice, index) => {
      const item = document.createElement("article");
      item.className = "voice-item";

      const play = document.createElement("button");
      play.className = "play-button";
      play.type = "button";
      play.textContent = "▶";
      play.setAttribute("aria-label", "پخش تلاوت");

      const title = document.createElement("div");
      title.className = "voice-main";
      const strong = document.createElement("strong");
      strong.textContent = voice.surah ? `سوره ${voice.surah}` : "تلاوت قرآن";
      const details = document.createElement("div");
      details.className = "voice-meta";
      [meta("شهر", voice.city), meta("نوع", voice.type),
       meta("آیات", voice.ayah || voice.verses), meta("محل", voice.place)]
        .filter(Boolean).forEach(el => details.appendChild(el));
      title.append(strong, details);

      const duration = document.createElement("span");
      duration.className = "voice-duration";
      duration.textContent = voice.duration || "—";

      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = mediaUrl(voice.file);
      audio.addEventListener("loadedmetadata", () => {
        if (!voice.duration) duration.textContent = durationText(audio.duration);
      });

      play.addEventListener("click", () => {
        if (audio.paused) {
          document.querySelectorAll(".voice-item audio").forEach(other => {
            if (other !== audio) other.pause();
          });
          audio.play().catch(err => console.warn("پخش ناموفق:", err, audio.src));
        } else audio.pause();
      });
      audio.addEventListener("play", () => { play.textContent = "Ⅱ"; });
      const resetPlay = () => { play.textContent = "▶"; };
      audio.addEventListener("pause", resetPlay);
      audio.addEventListener("ended", resetPlay);

      // --- دانلود مستقیم کنار کنترل‌های صوت ---
      const actions = document.createElement("div");
      actions.className = "voice-actions";

      const download = document.createElement("a");
      download.className = "download-button";
      download.href = mediaUrl(voice.file);
      download.download = voice.file.split("/").pop() || `recitation-${index + 1}.mp3`;
      download.setAttribute("aria-label", "دانلود فایل صوتی");
      download.title = "دانلود فایل صوتی";
      download.textContent = "⬇";
      actions.appendChild(download);

      item.append(play, title, duration, actions, audio);
      list.appendChild(item);
    });
  }

  function renderVideos() {
    const target = $("video-list");
    if (!target || !videos.length) return;
    target.className = "video-grid";
    target.innerHTML = "";
    videos.forEach(video => {
      const card = document.createElement("article");
      card.className = "video-card";
      const player = document.createElement("video");
      player.controls = true;
      player.preload = "metadata";
      player.src = mediaUrl(video.file);
      const caption = document.createElement("p");
      caption.textContent = video.title || "ویدئو";
      card.append(player, caption);
      target.appendChild(card);
    });
  }

  // داده‌ها از فایل‌های JS سراسری خوانده می‌شوند (سازگار با file:// و http)
  async function loadData(globalName, fallback) {
    if (Array.isArray(window[globalName])) return window[globalName];
    console.warn(`متغیر ${globalName} یافت نشد. فایل JS مربوطه باید قبل از app.js لود شود.`);
    return fallback;
  }

  async function initArchive() {
    const list = $("voice-list");
    try {
      const [voiceData, videoData] = await Promise.all([
        loadData("QURAN_VOICES", []),
        loadData("QURAN_VIDEOS", [])
      ]);
      voices = Array.isArray(voiceData) ? voiceData : [];
      videos = Array.isArray(videoData) ? videoData : [];

      if (!voices.length) {
        if (list) list.innerHTML =
          `<div class="empty-state"><span class="empty-icon">♫</span>` +
          `<h3>آرشیو در حال تکمیل است</h3>` +
          `<p>هیچ فایل صوتی‌ای بارگذاری نشد. مطمئن شو <code>assets/voices.js</code> قبل از <code>app.js</code> لود می‌شود.</p></div>`;
        return;
      }

      fillSelect($("city-filter"),  voices.map(v => v.city));
      fillSelect($("surah-filter"), voices.map(v => v.surah));
      renderVoices();
      renderVideos();
    } catch (error) {
      console.error("Quran archive loading error:", error);
      if (list) {
        const box = document.createElement("div");
        box.className = "empty-state";
        const heading = document.createElement("h3");
        heading.textContent = "خطا در بارگذاری آرشیو";
        const detail = document.createElement("p");
        detail.textContent = String(error && error.message ? error.message : error);
        box.append(heading, detail);
        list.replaceChildren(box);
      }
    }
  }

  ["voice-search", "city-filter", "type-filter", "surah-filter"].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener(id === "voice-search" ? "input" : "change", renderVoices);
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".voice-menu").forEach(menu => { menu.hidden = true; });
  });

  const menuButton = document.querySelector(".menu-toggle");
  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const nav = document.querySelector(".main-nav");
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".main-nav a").forEach(link =>
      link.addEventListener("click", () => {
        document.querySelector(".main-nav").classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      })
    );
  }

  initArchive();
})();