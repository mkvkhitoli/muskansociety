// ===== Muskan Society — site script =====
var WA_NUMBER = "919522151016"; // WhatsApp number with country code (no +)
var DEFAULT_LANG = "en";         // change to "hi" to open the site in Hindi by default

(function () {
  var root = document.documentElement;

  // ---- Language ----
  function getLang() {
    try { return localStorage.getItem("ms-lang") || DEFAULT_LANG; } catch (e) { return DEFAULT_LANG; }
  }
  function setLang(l) {
    root.classList.remove("lang-en", "lang-hi");
    root.classList.add("lang-" + l);
    root.setAttribute("lang", l);
    try { localStorage.setItem("ms-lang", l); } catch (e) {}
    document.querySelectorAll("[data-ph-en]").forEach(function (el) {
      el.placeholder = el.getAttribute("data-ph-" + l) || "";
    });
  }
  window.msLang = getLang;
  setLang(getLang());

  document.addEventListener("DOMContentLoaded", function () {
    setLang(getLang());
    var btn = document.querySelector(".lang-btn");
    if (btn) btn.addEventListener("click", function () {
      setLang(getLang() === "en" ? "hi" : "en");
      document.dispatchEvent(new Event("langchange"));
    });

    // ---- Mobile menu ----
    var burger = document.querySelector(".burger"), menu = document.querySelector(".menu");
    if (burger) burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });

    // ---- Reveal on scroll ----
    var els = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: .12 });
      els.forEach(function (el) { io.observe(el); });
    } else els.forEach(function (el) { el.classList.add("in"); });

    // ---- Year ----
    document.querySelectorAll(".year").forEach(function (y) { y.textContent = new Date().getFullYear(); });

    // ---- WhatsApp forms ----
    document.querySelectorAll("form[data-wa]").forEach(function (f) {
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var lines = [
          "*[MUSKAN SOCIETY WEBSITE]*",
          "From: muskansociety.in (not Kalam Foundation)",
          "Form: *" + f.getAttribute("data-wa") + "*",
          "----------------------------", ""];
        var seen = {};
        Array.prototype.forEach.call(f.elements, function (el) {
          if (!el.name || seen[el.name]) return;
          var val;
          if (el.type === "checkbox") {
            seen[el.name] = 1;
            val = Array.prototype.filter.call(f.querySelectorAll('[name="' + el.name + '"]:checked'), function (c) { return c.checked; })
              .map(function (c) { return c.value; }).join(", ");
          } else val = el.value.trim();
          if (val) lines.push(el.getAttribute("data-label") + ": " + val);
        });
        window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n")), "_blank");
      });
    });

    // ---- News & gallery from JSON ----
    loadNews(); loadGallery(); loadEvents(); loadTeam(); loadSettings();
    document.addEventListener("langchange", function () { loadNews(); loadGallery(); loadEvents(); loadTeam(); });
  });

  function esc(s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pick(obj, key) { var l = getLang(); return obj[key + "_" + l] || obj[key + "_en"] || obj[key] || ""; }
  function fmtDate(d) {
    try { return new Date(d + "T00:00:00").toLocaleDateString(getLang() === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return d; }
  }

  function loadNews() {
    var box = document.getElementById("news-list"); if (!box) return;
    var limit = parseInt(box.getAttribute("data-limit") || "0", 10);
    fetch("data/news.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (data) {
      var items = (data.posts || []).sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
      if (limit) items = items.slice(0, limit);
      if (!items.length) { box.innerHTML = '<div class="empty">' + (getLang() === "hi" ? "जल्द ही नई खबरें आएँगी।" : "News will be posted here soon.") + "</div>"; return; }
      box.innerHTML = items.map(function (p) {
        return '<article class="card news-card">' +
          (p.image && isSafeUrl(p.image) ? '<img src="' + esc(p.image) + '" alt="" loading="lazy">' : "") +
          '<div class="meta">' + esc(fmtDate(p.date)) + (p.type ? " · " + esc(pick(p, "type")) : "") + "</div>" +
          "<h3>" + esc(pick(p, "title")) + "</h3><p>" + esc(pick(p, "body")) + "</p></article>";
      }).join("");
    }).catch(function () { box.innerHTML = ""; });
  }

  function getJSON(path) { return fetch(path, { cache: "no-store" }).then(function (r) { if (!r.ok) throw r; return r.json(); }); }
  function isSafeUrl(u) { return /^(https?:\/\/|images\/|\.\/images\/)/i.test(u || ""); }

  // ---- Events ----
  function eventEnd(d) { // returns end Date of an event date string, or null
    if (!d) return null; var p = d.split("-");
    if (p[2]) return new Date(+p[0], +p[1] - 1, +p[2], 23, 59);
    if (p[1]) return new Date(+p[0], +p[1], 0, 23, 59);
    return null;
  }
  function evDate(d) {
    var hi = getLang() === "hi";
    if (!d) return hi ? "जल्द<br><b>ही</b>" : "Coming<br><b>Soon</b>";
    var p = d.split("-"), dt = new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
    var mon = dt.toLocaleDateString(hi ? "hi-IN" : "en-IN", { month: "short" });
    return esc(mon) + "<br><b>" + (p[2] ? +p[2] : p[0]) + "</b>";
  }
  function loadEvents() {
    var boxes = document.querySelectorAll(".events-list"); if (!boxes.length) return;
    getJSON("data/events.json").then(function (data) {
      var now = new Date();
      var items = (data.events || []).filter(function (e) { var end = eventEnd(e.date); return !end || end >= now; });
      var html = items.length ? items.map(function (e) {
        return '<div class="card event reveal in"><div class="date">' + evDate(e.date) + "</div><div>" +
          (pick(e, "tag") ? '<span class="tag">' + esc(pick(e, "tag")) + "</span>" : "") +
          "<h3>" + esc(pick(e, "title")) + "</h3><p>" + esc(pick(e, "body")) + "</p></div></div>";
      }).join("") : '<div class="empty" style="grid-column:1/-1">' + (getLang() === "hi" ? "जल्द ही नए कार्यक्रम घोषित होंगे।" : "New events will be announced soon.") + "</div>";
      boxes.forEach(function (b) { b.innerHTML = html; });
    }).catch(function () {});
  }

  // ---- Team ----
  function initials(n) { return String(n || "").split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join(""); }
  function avatar(p, small) {
    var st = small ? ' style="width:64px;height:64px;font-size:1.1rem"' : "";
    var inner = p.photo && isSafeUrl(p.photo) ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy">' : esc(initials(p.name_en));
    return '<div class="avatar"' + st + ">" + inner + "</div>";
  }
  function loadTeam() {
    var L = document.querySelector(".team-leaders"), M = document.querySelector(".team-members");
    if (!L && !M) return;
    getJSON("data/team.json").then(function (data) {
      if (L) L.innerHTML = (data.leaders || []).map(function (p) {
        return '<div class="card person reveal in">' + avatar(p) + "<h3>" + esc(pick(p, "name")) + '</h3><div class="role">' + esc(pick(p, "role")) + "</div></div>";
      }).join("");
      if (M) M.innerHTML = (data.members || []).map(function (p) {
        return '<div class="card person reveal in" style="padding:22px">' + avatar(p, true) + '<h3 style="font-size:1.05rem">' + esc(pick(p, "name")) +
          '</h3><div class="role">' + esc(pick(p, "role") || (getLang() === "hi" ? "सदस्य" : "Member")) + "</div></div>";
      }).join("");
    }).catch(function () {});
  }

  // ---- Settings (phone, email, address, social) ----
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function loadSettings() {
    getJSON("data/settings.json").then(function (s) {
      if (digits(s.whatsapp)) WA_NUMBER = digits(s.whatsapp);
      var tel = digits(s.phone); if (tel.length === 10) tel = "91" + tel;
      document.querySelectorAll("[data-set]").forEach(function (el) {
        var k = el.getAttribute("data-set");
        if (k === "phone" && s.phone) { el.textContent = s.phone; el.href = "tel:+" + tel; }
        else if (k === "email" && s.email) { el.textContent = s.email; el.href = "mailto:" + s.email; }
        else if (k === "wa") { el.href = "https://wa.me/" + WA_NUMBER; }
        else if (k === "map" && s.map_query) { el.src = "https://maps.google.com/maps?q=" + encodeURIComponent(s.map_query) + "&z=14&output=embed"; }
        else if (s[k]) { el.textContent = s[k]; }
      });
      var nets = [["facebook", "Facebook"], ["instagram", "Instagram"], ["youtube", "YouTube"]];
      document.querySelectorAll("[data-social]").forEach(function (box) {
        box.innerHTML = nets.filter(function (n) { return /^https?:\/\//.test(s[n[0]] || ""); }).map(function (n) {
          return '<a href="' + esc(s[n[0]]) + '" target="_blank" rel="noopener">' + n[1] + "</a>";
        }).join("");
      });
    }).catch(function () {});
  }

  function loadGallery() {
    var box = document.getElementById("gallery-list"), vbox = document.getElementById("video-list");
    if (!box && !vbox) return;
    fetch("data/gallery.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (data) {
      var photos = data.photos || [], videos = data.videos || [];
      if (box) box.innerHTML = photos.length ? photos.map(function (p) {
        if (!isSafeUrl(p.src)) return "";
        return '<figure><img src="' + esc(p.src) + '" alt="' + esc(pick(p, "caption")) + '" loading="lazy">' +
          (pick(p, "caption") ? "<figcaption>" + esc(pick(p, "caption")) + "</figcaption>" : "") + "</figure>";
      }).join("") : '<div class="empty" style="grid-column:1/-1">' + (getLang() === "hi" ? "तस्वीरें जल्द ही जोड़ी जाएँगी।" : "Photos will be added soon.") + "</div>";
      if (vbox) vbox.innerHTML = videos.map(function (v) {
        return '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + String(v.youtube_id || "").replace(/[^A-Za-z0-9_-]/g, "") + '" title="' + esc(pick(v, "title")) + '" allowfullscreen loading="lazy"></iframe></div>';
      }).join("");
      if (vbox && !videos.length) vbox.parentElement.style.display = "none";
    }).catch(function () {});
  }
})();
