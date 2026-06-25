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
        var title = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
        var matchTag    = activeFilter === 'all' || cat === activeFilter;
        var matchSearch = !activeQuery || title.indexOf(activeQuery) !== -1;
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
        activeQuery = this.value.trim().toLowerCase();
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
