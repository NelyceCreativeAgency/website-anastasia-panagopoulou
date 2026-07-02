/* =============================================================
   Site behaviour - language switch, sticky nav, mobile menu,
   scroll reveal, accordion, testimonials, counters, forms.
   Runs after components.js has injected the header/footer.
   ============================================================= */
(function () {
  "use strict";
  var STORE_KEY = "apes_lang";

  /* ---------------- Language ---------------- */
  function applyLang(lang) {
    lang = lang === "en" ? "en" : "el";
    document.documentElement.lang = lang;
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}

    // Active state on switch buttons
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-set-lang") === lang);
      b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === lang);
    });

    // Per-page <title> swap
    var body = document.body;
    var t = body.getAttribute("data-title-" + lang);
    if (t) document.title = t;
    var d = body.getAttribute("data-desc-" + lang);
    if (d) {
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", d);
    }
  }

  function initLang() {
    var saved;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    applyLang(saved || document.documentElement.lang || "el");

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-set-lang]");
      if (!btn) return;
      applyLang(btn.getAttribute("data-set-lang"));
    });
  }

  /* ---------------- Sticky nav ---------------- */
  function initStickyNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("is-stuck", window.scrollY > 160);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    var nav = document.getElementById("nav");
    var burger = document.getElementById("burger");
    var backdrop = document.getElementById("navBackdrop");
    var menu = document.getElementById("navMenu");
    if (!nav || !burger) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      if (backdrop) backdrop.classList.toggle("is-shown", open);
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflowY = open ? "hidden" : "";
    }
    burger.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    if (backdrop) backdrop.addEventListener("click", function () { setOpen(false); });
    if (menu) menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- FAQ accordion ---------------- */
  function initAccordion() {
    document.querySelectorAll(".faq__item").forEach(function (item) {
      var q = item.querySelector(".faq__q");
      var a = item.querySelector(".faq__a");
      if (!q || !a) return;
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        q.setAttribute("aria-expanded", open);
        a.style.maxHeight = open ? a.scrollHeight + "px" : null;
      });
    });
    // Recalculate open heights on language change / resize
    window.addEventListener("resize", function () {
      document.querySelectorAll(".faq__item.is-open .faq__a").forEach(function (a) {
        a.style.maxHeight = a.scrollHeight + "px";
      });
    });
  }

  /* ---------------- Testimonials slider ---------------- */
  function initTestimonials() {
    var track = document.querySelector(".ttrack");
    if (!track) return;
    var prev = document.querySelector("[data-tslide='prev']");
    var next = document.querySelector("[data-tslide='next']");
    function step() {
      var card = track.querySelector(".tcard");
      return card ? card.offsetWidth + 28 : 380;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  }

  /* ---------------- Animated counters ---------------- */
  function initCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    if (!("IntersectionObserver" in window)) {
      nums.forEach(function (n) { n.firstChild ? (n.childNodes[0].nodeValue = n.getAttribute("data-count")) : (n.textContent = n.getAttribute("data-count")); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var dur = 1600, start = null;
        var valNode = el.querySelector(".js-val") || el;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          valNode.textContent = Math.round(target * eased).toLocaleString("el-GR");
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------------- Testimonial marquee - seamless infinite loop ---------------- */
  function initMarquee() {
    document.querySelectorAll('.tmarquee__track').forEach(function (track) {
      var set = track.querySelector('.tmarquee__set');
      if (!set) return;

      function fill() {
        var setW = set.offsetWidth;
        if (!setW) return;
        // Remove all clones (keep only the original first set)
        while (track.children.length > 1) track.lastChild.remove();
        // Clone until track content covers at least 4× the viewport width
        while (track.scrollWidth < window.innerWidth * 4) {
          track.appendChild(set.cloneNode(true));
        }
        // Set exact translation = negative width of one set
        track.style.setProperty('--marquee-x', '-' + setW + 'px');
      }

      fill();
      window.addEventListener('resize', fill, { passive: true });
    });
  }

  /* Why-choose-us cards stack with pure CSS position:sticky - no JS needed. */

  /* ---------------- Course card tilt ---------------- */
  function initCslider() {
    document.querySelectorAll('.cslide').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left)  / r.width  - 0.5;
        var y = (e.clientY - r.top)   / r.height - 0.5;
        card.style.transition = 'transform 0.08s linear';
        card.style.transform  = 'perspective(900px) rotateX(' + (y * -10) + 'deg) rotateY(' + (x * 8) + 'deg) scale(1.02)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.transform  = '';
      });
    });
  }

  /* ---------------- Article share buttons ---------------- */
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (err) {}
    document.body.removeChild(ta);
  }

  function initShareLinks() {
    var links = document.querySelectorAll(".article-hero__share a[data-share]");
    if (!links.length) return;
    links.forEach(function (a) {
      var type = a.getAttribute("data-share");
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var url = window.location.href;

        if (type === "copy") {
          var showCopied = function () {
            var original = a.innerHTML;
            a.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            a.classList.add("is-copied");
            setTimeout(function () {
              a.innerHTML = original;
              a.classList.remove("is-copied");
            }, 1600);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(showCopied).catch(function () {
              fallbackCopy(url);
              showCopied();
            });
          } else {
            fallbackCopy(url);
            showCopied();
          }
          return;
        }

        var shareUrls = {
          facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
          twitter: "https://twitter.com/intent/tweet?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(document.title),
          linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url)
        };
        if (shareUrls[type]) {
          window.open(shareUrls[type], "_blank", "noopener,width=600,height=520");
        }
      });
    });
  }

  /* ---------------- Article sidebar search ---------------- */
  function initSidebarSearch() {
    var box = document.querySelector(".sidebar-search");
    if (!box) return;
    var input = box.querySelector("input");
    var button = box.querySelector("button");

    function go() {
      var q = input.value.trim();
      window.location.href = "blog.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    }

    if (button) button.addEventListener("click", go);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        go();
      }
    });
  }

  /* ---------------- Contact form ---------------- */
  function initForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var status = document.getElementById("formStatus");
      if (status) status.classList.add("is-shown");
      form.reset();
      if (status) status.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------------- Footer art reveal ---------------- */
  function initFooterArt() {
    var art    = document.querySelector('.footer__art');
    var footer = document.querySelector('.footer');
    if (!art || !footer) return;
    if (!('IntersectionObserver' in window)) { art.classList.add('is-visible'); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        art.classList.add('is-visible');
        io.disconnect();
      }
    }, {
      rootMargin: '0px 0px -18% 0px', /* only fire once footer is 18vh above bottom edge */
      threshold: 0
    });
    io.observe(footer);
  }

  /* ---------------- Footer year handled in components.js ---------------- */

  /* ---------------- Fuzzy text matching (accent- and typo-tolerant) ---------------- */
  function normalizeText(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') /* strip Greek/Latin accents (tonos, dialytika, etc.) */
      .toLowerCase();
  }

  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      var curr = [i];
      for (j = 1; j <= n; j++) {
        curr[j] = a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
      prev = curr;
    }
    return prev[n];
  }

  /* substring search tolerant of ~1 typo per 4 characters of the query */
  function fuzzyIncludes(haystack, needle) {
    if (!needle) return true;
    if (haystack.indexOf(needle) !== -1) return true;
    if (needle.length < 3) return false; /* too short to fuzz without false positives */
    var maxDist = Math.min(2, Math.floor(needle.length / 4) + 1);
    var lens = [needle.length - 1, needle.length, needle.length + 1];
    for (var w = 0; w < lens.length; w++) {
      var len = lens[w];
      if (len <= 0) continue;
      for (var i = 0; i <= haystack.length - len; i++) {
        if (levenshtein(haystack.substr(i, len), needle) <= maxDist) return true;
      }
    }
    return false;
  }

  /* ---------------- Blog tag filter + search ---------------- */
  function initBlogFilters() {
    var tags    = document.querySelectorAll('.blog-tag[data-filter]');
    var grid    = document.getElementById('postGrid');
    var search  = document.querySelector('.blog-search input');
    var empty   = document.querySelector('.blog-empty');
    var reset   = document.getElementById('resetFilter');
    if (!tags.length || !grid) return;

    var activeFilter = 'all';
    var activeQuery  = '';

    function applyFilter() {
      var cards   = grid.querySelectorAll('.post-card');
      var visible = 0;
      cards.forEach(function (card) {
        var cat   = card.getAttribute('data-category') || '';
        var title = card.querySelector('h3') ? normalizeText(card.querySelector('h3').textContent) : '';
        var matchTag    = activeFilter === 'all' || cat === activeFilter;
        var matchSearch = !activeQuery || fuzzyIncludes(title, activeQuery);
        if (matchTag && matchSearch) {
          card.style.display = '';
          card.classList.remove('card-in');
          void card.offsetWidth;
          card.classList.add('card-in');
          visible++;
        } else {
          card.style.display = 'none';
          card.classList.remove('card-in');
        }
      });
      if (empty) empty.style.display = visible === 0 ? 'flex' : 'none';
    }

    tags.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tags.forEach(function (b) { b.classList.remove('blog-tag--active'); });
        btn.classList.add('blog-tag--active');
        activeFilter = btn.getAttribute('data-filter');
        applyFilter();
      });
    });

    if (search) {
      search.addEventListener('input', function () {
        activeQuery = normalizeText(this.value.trim());
        applyFilter();
      });
    }

    if (reset) {
      reset.addEventListener('click', function () {
        activeFilter = 'all';
        activeQuery  = '';
        if (search) search.value = '';
        tags.forEach(function (b) { b.classList.remove('blog-tag--active'); });
        var allBtn = document.querySelector('.blog-tag[data-filter="all"]');
        if (allBtn) allBtn.classList.add('blog-tag--active');
        applyFilter();
      });
    }

    /* pick up ?q= from the sidebar search on article pages */
    var qParam = new URLSearchParams(window.location.search).get('q');
    if (qParam) {
      activeQuery = normalizeText(qParam.trim());
      if (search) search.value = qParam;
      applyFilter();
    }
  }

  /* ---------------- SVG squiggle draw-on animation ---------------- */
  function initSquiggle() {
    document.querySelectorAll('.blog-squiggle path').forEach(function (path) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
    });
    // hero pencil ink line: expose true path length so the CSS draw stays in
    // step with the pencil tip (avoids the line finishing early)
    document.querySelectorAll('.write-line__path').forEach(function (path) {
      path.style.setProperty('--len', path.getTotalLength());
    });
  }

  /* ---------------- Courses tab carousel ---------------- */
  function initCourseTabs() {
    var carousel = document.querySelector('.course-carousel');
    if (!carousel) return;
    var track = carousel.querySelector('.course-track');
    var panels = Array.prototype.slice.call(track.children);
    var tabs = document.querySelectorAll('.course-tabs__btn');
    var AUTOPLAY_MS = 6000; // dwell time per card before auto-advancing
    var MOBILE_QUERY = window.matchMedia('(max-width: 600px)');
    var index = 0;
    var timer = null;

    function render() {
      var active = panels[index];
      var offset = active.offsetLeft - (carousel.clientWidth - active.offsetWidth) / 2;
      track.style.transform = 'translateX(' + (-offset) + 'px)';
      panels.forEach(function (p, i) { p.classList.toggle('is-active', i === index); });
      tabs.forEach(function (b, i) { b.classList.toggle('is-active', i === index); });
    }

    function goTo(i) {
      index = (i + panels.length) % panels.length;
      render();
    }

    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function startAutoplay() {
      stopAutoplay();
      if (MOBILE_QUERY.matches) return; // manual tap-only navigation on mobile
      timer = setInterval(function () { goTo(index + 1); }, AUTOPLAY_MS);
    }

    tabs.forEach(function (btn, i) {
      btn.addEventListener('click', function () { goTo(i); startAutoplay(); });
    });
    panels.forEach(function (p, i) {
      p.addEventListener('click', function () {
        if (i !== index) { goTo(i); startAutoplay(); }
      });
    });
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    window.addEventListener('resize', render);

    /* swipe / drag to navigate on touch (desktop/tablet only — on mobile
       navigation is pill-taps-only, see MOBILE_QUERY) */
    var dragging = false, startX = 0, deltaX = 0;
    track.addEventListener('touchstart', function (e) {
      if (MOBILE_QUERY.matches) return;
      dragging = true;
      deltaX = 0;
      startX = e.touches[0].clientX;
      stopAutoplay();
      track.style.transition = 'none';
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      deltaX = e.touches[0].clientX - startX;
      var active = panels[index];
      var offset = active.offsetLeft - (carousel.clientWidth - active.offsetWidth) / 2;
      track.style.transform = 'translateX(' + (-offset + deltaX) + 'px)';
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      var THRESHOLD = 40;
      if (deltaX <= -THRESHOLD) goTo(index + 1);
      else if (deltaX >= THRESHOLD) goTo(index - 1);
      else render();
      startAutoplay();
    });

    render();
    startAutoplay();
  }

  function init() {
    initLang();
    initStickyNav();
    initMobileMenu();
    initReveal();
    initAccordion();
    initTestimonials();
    initMarquee();
    initCounters();
    initCslider();
    initCourseTabs();
    initFooterArt();
    initShareLinks();
    initSidebarSearch();
    initForm();
    initSquiggle();
    initBlogFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
