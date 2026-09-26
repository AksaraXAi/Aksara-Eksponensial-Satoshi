(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GITHUB_USERNAME = "AksaraXAI";

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menu-toggle");
  var mainNav = document.getElementById("main-nav");

  function closeMenu() {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    var isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", toggleMenu);

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll (static sections) ---------- */
  var staticRevealTargets = document.querySelectorAll(
    ".section-head, .log-entry, .index-table"
  );

  staticRevealTargets.forEach(function (el) {
    el.classList.add("reveal");
  });

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    staticRevealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    staticRevealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Copy to clipboard ---------- */
  document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-copy-target");
      var target = document.getElementById(targetId);
      if (!target) return;

      var text = target.textContent.trim();
      var originalLabel = btn.textContent;

      function markCopied() {
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = originalLabel;
          btn.classList.remove("copied");
        }, 1600);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(markCopied).catch(function () {
          fallbackCopy(text, markCopied);
        });
      } else {
        fallbackCopy(text, markCopied);
      }
    });
  });

  function fallbackCopy(text, onSuccess) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      onSuccess();
    } catch (err) {
      /* silent fail: clipboard unavailable */
    }
    document.body.removeChild(textarea);
  }

  /* ---------- External link indicator (safety) ---------- */
  function enforceNoopener() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      if (!link.getAttribute("rel") || link.getAttribute("rel").indexOf("noopener") === -1) {
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  }
  enforceNoopener();

  /* ---------- Projects: fetch from GitHub API ---------- */
  var projectList = document.getElementById("project-list");
  var loadingNote = document.getElementById("project-loading");
  var errorNote = document.getElementById("project-error");
  var emptyNote = document.getElementById("empty-note");
  var filterButtons = document.querySelectorAll(".filter-btn");

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  function deriveStatus(repo) {
    if (repo.archived) return "archived";
    var topics = repo.topics || [];
    if (topics.indexOf("experimental") !== -1) return "experimental";
    return "active";
  }

  function buildProjectCard(repo) {
    var status = deriveStatus(repo);
    var name = repo.name;
    var description = repo.description
      ? escapeHTML(repo.description)
      : "Belum ada deskripsi di GitHub.";
    var stack = repo.language ? escapeHTML(repo.language) : "Belum diisi di GitHub";
    var repoUrl = repo.html_url;

    var article = document.createElement("article");
    article.className = "project-card reveal is-visible";
    article.setAttribute("data-status", status);

    article.innerHTML =
      '<div class="project-top">' +
        "<h3>" + escapeHTML(name) + "</h3>" +
        '<span class="status-tag"><span class="status-dot status-' + status + '" aria-hidden="true"></span>' + status + "</span>" +
      "</div>" +
      '<p class="project-desc">' + description + "</p>" +
      '<dl class="project-meta">' +
        "<div><dt>Stack</dt><dd>" + stack + "</dd></div>" +
        "<div><dt>Repo</dt><dd>" + escapeHTML(repo.full_name) + "</dd></div>" +
      "</dl>" +
      '<div class="project-actions">' +
        '<a href="' + escapeHTML(repoUrl) + '" class="link-arrow" target="_blank" rel="noopener">Source <span class="ext-icon" aria-hidden="true">\u2197</span></a>' +
      "</div>";

    return article;
  }

  function applyFilter(filter) {
    var cards = projectList.querySelectorAll(".project-card");
    var visibleCount = 0;
    cards.forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-status") === filter;
      card.hidden = !match;
      if (match) visibleCount++;
    });
    if (emptyNote) emptyNote.hidden = visibleCount !== 0 || cards.length === 0;
  }

  function setupFilterButtons() {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        applyFilter(btn.getAttribute("data-filter"));
      });
    });
  }

  function renderProjects(repos) {
    if (loadingNote) loadingNote.remove();

    var filtered = repos.filter(function (repo) {
      return !repo.fork;
    });

    if (filtered.length === 0) {
      if (errorNote) errorNote.hidden = false;
      return;
    }

    filtered.sort(function (a, b) {
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    });

    filtered.forEach(function (repo) {
      projectList.appendChild(buildProjectCard(repo));
    });

    setupFilterButtons();
    applyFilter("all");
    enforceNoopener();
  }

  function showFetchError() {
    if (loadingNote) loadingNote.remove();
    if (errorNote) errorNote.hidden = false;
  }

  fetch("https://api.github.com/users/" + GITHUB_USERNAME + "/repos?sort=pushed&per_page=100")
    .then(function (response) {
      if (!response.ok) throw new Error("GitHub API error: " + response.status);
      return response.json();
    })
    .then(renderProjects)
    .catch(showFetchError);

  /* ---------- Engineering Log: recent commits from GitHub ---------- */
  var activityLog = document.getElementById("activity-log");
  var activityLoading = document.getElementById("activity-loading");
  var activityError = document.getElementById("activity-error");

  function timeAgo(dateStr) {
    var diffMs = Date.now() - new Date(dateStr).getTime();
    var minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return minutes + " menit lalu";
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " jam lalu";
    var days = Math.floor(hours / 24);
    if (days < 30) return days + " hari lalu";
    var months = Math.floor(days / 30);
    return months + " bulan lalu";
  }

  function buildLogEntry(commit) {
    var li = document.createElement("li");
    li.className = "log-entry reveal is-visible";

    var messageLine = commit.message.split("\n")[0];
    var shortSha = commit.sha.substring(0, 7);
    var commitUrl = "https://github.com/" + commit.repoName + "/commit/" + commit.sha;

    li.innerHTML =
      '<div class="log-meta">' +
        '<time datetime="' + escapeHTML(commit.date) + '">' + escapeHTML(timeAgo(commit.date)) + "</time>" +
        '<span class="log-tag">' + escapeHTML(commit.repoName) + "</span>" +
      "</div>" +
      "<h3>" + escapeHTML(messageLine) + "</h3>" +
      '<p><a href="' + escapeHTML(commitUrl) + '" class="link-arrow" target="_blank" rel="noopener">' + escapeHTML(shortSha) + ' <span class="ext-icon" aria-hidden="true">\u2197</span></a></p>';

    return li;
  }

  function renderActivity(events) {
    if (activityLoading) activityLoading.remove();

    var commits = [];
    events.forEach(function (event) {
      if (event.type !== "PushEvent" || !event.payload || !event.payload.commits) return;
      event.payload.commits.forEach(function (c) {
        commits.push({
          sha: c.sha,
          message: c.message || "(tanpa pesan commit)",
          repoName: event.repo.name,
          date: event.created_at
        });
      });
    });

    if (commits.length === 0) {
      if (activityError) activityError.hidden = false;
      return;
    }

    commits.slice(0, 8).forEach(function (commit) {
      activityLog.appendChild(buildLogEntry(commit));
    });

    enforceNoopener();
  }

  function showActivityError() {
    if (activityLoading) activityLoading.remove();
    if (activityError) activityError.hidden = false;
  }

  fetch("https://api.github.com/users/" + GITHUB_USERNAME + "/events/public?per_page=30")
    .then(function (response) {
      if (!response.ok) throw new Error("GitHub API error: " + response.status);
      return response.json();
    })
    .then(renderActivity)
    .catch(showActivityError);
})();
