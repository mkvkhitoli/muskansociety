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
    loadNews(); loadGallery();
    document.addEventListener("langchange", function () { loadNews(); loadGallery(); });
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
          (p.image ? '<img src="' + esc(p.image) + '" alt="" loading="lazy">' : "") +
          '<div class="meta">' + esc(fmtDate(p.date)) + (p.type ? " · " + esc(pick(p, "type")) : "") + "</div>" +
          "<h3>" + esc(pick(p, "title")) + "</h3><p>" + esc(pick(p, "body")) + "</p></article>";
      }).join("");
    }).catch(function () { box.innerHTML = ""; });
  }

  function loadGallery() {
    var box = document.getElementById("gallery-list"), vbox = document.getElementById("video-list");
    if (!box && !vbox) return;
    fetch("data/gallery.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (data) {
      var photos = data.photos || [], videos = data.videos || [];
      if (box) box.innerHTML = photos.length ? photos.map(function (p) {
        return '<figure><img src="' + esc(p.src) + '" alt="' + esc(pick(p, "caption")) + '" loading="lazy">' +
          (pick(p, "caption") ? "<figcaption>" + esc(pick(p, "caption")) + "</figcaption>" : "") + "</figure>";
      }).join("") : '<div class="empty" style="grid-column:1/-1">' + (getLang() === "hi" ? "तस्वीरें जल्द ही जोड़ी जाएँगी।" : "Photos will be added soon.") + "</div>";
      if (vbox) vbox.innerHTML = videos.map(function (v) {
        return '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.youtube_id) + '" title="' + esc(pick(v, "title")) + '" allowfullscreen loading="lazy"></iframe></div>';
      }).join("");
      if (vbox && !videos.length) vbox.parentElement.style.display = "none";
    }).catch(function () {});
  }
})();
