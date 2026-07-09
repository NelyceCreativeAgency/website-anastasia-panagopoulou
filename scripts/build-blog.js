/* =============================================================
   Build the blog from markdown.
   Reads content/blog/*.md (CMS-managed via Decap, /admin) and
   generates:
     - pages/<slug>.html   one detail page per post
     - pages/blog.html     the listing page (featured + grid)
   Run via `npm run build:blog` (also wired into `npm run dev`
   and the Vercel build step so the site never drifts from the
   markdown source).
   ============================================================= */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const PAGES_DIR = path.join(ROOT, "pages");

/* YAML parses an unquoted `date: 2026-06-20` (as Decap CMS writes it) into a
   JS Date object, while older hand-written entries have a quoted string —
   normalise both to a plain "YYYY-MM-DD" string. */
function toIsoDay(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function loadPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data } = matter(raw);
    return {
      title_el: data.title_el || "",
      title_en: data.title_en || "",
      slug: data.slug || file.replace(/\.md$/, ""),
      category_el: data.category_el || "",
      category_en: data.category_en || "",
      filter_tag: data.filter_tag || "tips",
      date: toIsoDay(data.date),
      read_minutes: data.read_minutes || 5,
      image: data.image || "",
      author: data.author || "Anastasia Panagopoulou",
      excerpt_el: data.excerpt_el || "",
      excerpt_en: data.excerpt_en || "",
      bodyHtml_el: marked.parse(data.body_el || ""),
      bodyHtml_en: marked.parse(data.body_en || ""),
    };
  });
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function formatDate(iso, locale) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}
function formatDateShort(iso, locale) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

/* ---------------- shared fragments ---------------- */

function postCard(post, delay) {
  return `          <article class="post-card reveal"${delay ? ` data-delay="${delay}"` : ""} data-category="${post.filter_tag}" style="--card-bg: url('${post.image}')">
            <div class="post-card__body">
              <span class="post-card__tag"><span data-lang-el>${post.category_el}</span><span data-lang-en>${post.category_en}</span></span>
              <div class="post-card__content">
                <h3><a href="${post.slug}.html"><span data-lang-el>${post.title_el}</span><span data-lang-en>${post.title_en}</span></a></h3>
                <p class="card__text"><span data-lang-el>${post.excerpt_el}</span><span data-lang-en>${post.excerpt_en}</span></p>
              </div>
              <div class="post-card__foot">
                <a class="post-card__arrow-btn" href="${post.slug}.html" aria-label="Read article">
                  <svg class="arrow-out" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                  <svg class="arrow-in" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                </a>
              </div>
            </div>
          </article>`;
}

function relatedGrid(others) {
  return `        <div class="grid cols-3" style="gap: 0.75rem">
${others.map((p, i) => postCard(p, i || null)).join("\n")}
        </div>`;
}

function sidebarRecent(others) {
  return others
    .map(
      (p) => `              <li>
                <a href="${p.slug}.html">
                  <img src="${p.image}" alt="" loading="lazy" width="60" height="60">
                  <div>
                    <h4><span data-lang-el>${p.title_el}</span><span data-lang-en>${p.title_en}</span></h4>
                    <span><span data-lang-el>${formatDateShort(p.date, "el-GR")}</span><span data-lang-en>${formatDateShort(p.date, "en-GB")}</span> · <span data-lang-el>${p.read_minutes} λεπτά</span><span data-lang-en>${p.read_minutes} min</span></span>
                  </div>
                </a>
              </li>`
    )
    .join("\n");
}

function pickOthers(posts, current, count) {
  const others = posts.filter((p) => p.slug !== current.slug);
  if (others.length <= count) return others;
  return others.slice(0, count);
}

/* ---------------- detail page ---------------- */

function detailPage(post, posts) {
  const related = pickOthers(posts, post, 3);
  const recent = pickOthers(posts, post, 3);
  const ogImage = post.image.startsWith("http") ? post.image : `https://panagopoulou.gr${post.image}`;

  return `<!DOCTYPE html>
<html lang="el" data-generated="blog-post">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0B3048">

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-96DQREPWMG"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());

    gtag("config", "G-96DQREPWMG");
  </script>
  <title>${post.title_el} | Anastasia Panagopoulou English School</title>
  <meta name="description" content="${post.excerpt_el}">
  <meta property="og:title" content="${post.title_el} | Anastasia Panagopoulou English School">
  <meta property="og:description" content="${post.excerpt_el}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://panagopoulou.gr/pages/${post.slug}.html">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1600">
  <meta property="og:image:height" content="900">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.title_el} | Anastasia Panagopoulou English School">
  <meta name="twitter:description" content="${post.excerpt_el}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="canonical" href="https://panagopoulou.gr/pages/${post.slug}.html">
  <link rel="icon" href="../Images/favicon.webp">

  <link rel="preload" href="../font/Gotham-Book.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../font/Gotham-Bold.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../Images/mobile_rip_header.svg" as="image" fetchpriority="high" media="(max-width: 1004px)">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body
  data-title-el="${post.title_el} | Anastasia Panagopoulou English School"
  data-title-en="${post.title_en} | Anastasia Panagopoulou English School">

  <div id="site-header"></div>

  <main id="main">

    <!-- HERO -->
    <section class="article-hero reveal">
      <div class="container">
        <div class="article-hero__media">
          <img src="${post.image}" alt="${post.title_el}" width="1600" height="900" fetchpriority="high">
          <div class="article-hero__overlay">
            <span class="eyebrow article-hero__tag"><span class="eyebrow__mark" aria-hidden="true"></span><span data-lang-el>${post.category_el}</span><span data-lang-en>${post.category_en}</span></span>
            <h1 class="article-hero__title">
              <span data-lang-el>${post.title_el}</span>
              <span data-lang-en>${post.title_en}</span>
            </h1>
            <div class="article-hero__row">
              <div class="article-hero__meta">
                <span data-lang-el>${formatDate(post.date, "el-GR")}</span><span data-lang-en>${formatDate(post.date, "en-GB")}</span>
                <span> · </span>
                <span data-lang-el>${post.read_minutes} λεπτά ανάγνωση</span><span data-lang-en>${post.read_minutes} min read</span>
              </div>
              <div class="article-hero__share">
                <a href="#" data-share="facebook" aria-label="Facebook"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l.5-3H14V9c0-.97.28-1.62 1.84-1.62H17V4.14C16.69 4.1 15.61 4 14.34 4 11.7 4 10 5.62 10 8.6V10.5H7v3h3V21h4v-7.5z"/></svg></a>
                <a href="#" data-share="twitter" aria-label="X"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22.6l-8.02 9.16L24 22h-7.4l-5.8-7.58L4.15 22H.45l8.58-9.8L0 2h7.6l5.24 6.93L18.9 2Zm-1.3 18h2.05L6.5 4H4.3l13.3 16Z"/></svg></a>
                <a href="#" data-share="linkedin" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.5-.95 1.75-1.95 3.6-1.95C20.6 8.75 21 11 21 14v7h-4v-6.2c0-1.5 0-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V21H8.5z"/></svg></a>
                <a href="#" data-share="copy" aria-label="Copy link"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="article-cover">
      <div class="torn-edge torn-edge--top torn-edge--white" aria-hidden="true"><span class="torn-edge__shape"></span></div>

      <div class="container">
        <div class="breadcrumb breadcrumb--article" style="justify-content:flex-start;margin:1.6rem 0">
          <a href="../" data-lang-el>Αρχική</a><a href="../" data-lang-en>Home</a><span>›</span>
          <a href="blog.html" data-lang-el>Τα νέα μας</a><a href="blog.html" data-lang-en>News</a><span>›</span>
          <span data-lang-el>${post.title_el}</span><span data-lang-en>${post.title_en}</span>
        </div>
      </div>

      <article class="section" style="padding-top:0">
        <div class="container">
          <div class="article-layout">
          <div class="article__body reveal">
            <div data-lang-el>${post.bodyHtml_el}</div>
            <div data-lang-en>${post.bodyHtml_en}</div>
          </div>

          <aside class="article-sidebar reveal">
            <div class="sidebar-card">
              <h3><span data-lang-el>Αναζήτηση</span><span data-lang-en>Search</span></h3>
              <div class="sidebar-search">
                <input type="search" placeholder="Αναζήτηση…">
                <button type="button" aria-label="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></button>
              </div>
            </div>

            <div class="sidebar-card">
              <h3><span data-lang-el>Πρόσφατα άρθρα</span><span data-lang-en>Recent posts</span></h3>
              <ul class="sidebar-recent">
${sidebarRecent(recent)}
              </ul>
            </div>
          </aside>
          </div>
        </div>
      </article>

      <!-- RELATED ARTICLES -->
      <section class="section section--soft">
        <div class="container">
          <div class="section-head reveal">
            <span class="eyebrow"><span class="eyebrow__mark" aria-hidden="true"></span><span data-lang-el>Σχετικά άρθρα</span><span data-lang-en>Related articles</span></span>
            <h2 class="h2" style="margin-top:1rem"><span data-lang-el>Διαβάστε επίσης</span><span data-lang-en>Read next</span></h2>
          </div>
${relatedGrid(related)}
        </div>
      </section>
    </div>

  </main>

  <div id="site-footer"></div>
  <script src="../js/components.js" defer></script>
  <script src="../js/main.js" defer></script>
</body>
</html>
`;
}

/* ---------------- listing page ---------------- */

function listingPage(posts) {
  const [featured, ...rest] = posts;
  const gridPosts = rest.length ? rest : posts;

  return `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0B3048">

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-96DQREPWMG"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());

    gtag("config", "G-96DQREPWMG");
  </script>
  <title>Τα νέα μας | Anastasia Panagopoulou English School</title>
  <meta name="description" content="Συμβουλές για γονείς και μαθητές, νέα του φροντιστηρίου και οδηγοί για τις εξετάσεις Αγγλικών.">
  <meta property="og:title" content="Τα νέα μας | Anastasia Panagopoulou English School">
  <meta property="og:description" content="Συμβουλές για γονείς και μαθητές, νέα του φροντιστηρίου και οδηγοί για τις εξετάσεις Αγγλικών.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://panagopoulou.gr/pages/blog.html">
  <meta property="og:image" content="https://panagopoulou.gr/Images/mainroom.webp">
  <meta property="og:image:width" content="800">
  <meta property="og:image:height" content="640">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Τα νέα μας | Anastasia Panagopoulou English School">
  <meta name="twitter:description" content="Συμβουλές για γονείς και μαθητές, νέα του φροντιστηρίου και οδηγοί για τις εξετάσεις Αγγλικών.">
  <meta name="twitter:image" content="https://panagopoulou.gr/Images/mainroom.webp">
  <link rel="canonical" href="https://panagopoulou.gr/pages/blog.html">
  <link rel="icon" href="../Images/favicon.webp">

  <link rel="preload" href="../font/Gotham-Book.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../font/Gotham-Bold.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../Images/mobile_rip_header.svg" as="image" fetchpriority="high" media="(max-width: 1004px)">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body
  data-title-el="Τα νέα μας | Anastasia Panagopoulou English School"
  data-title-en="News | Anastasia Panagopoulou English School">

  <div id="site-header"></div>

  <main id="main">

    <section class="page-hero page-hero--blog">
      <div class="container">
        <h1 class="display blog-hero__title">
          <span data-lang-el>Μερικά νέα από εμάς, <em class="blog-hero__accent">για εσάς.<svg class="blog-squiggle" width="42" height="39" viewBox="0 0 59 55" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.5 27.4535C9.44977 20.5037 11.412 12.0272 11.412 2.5" stroke="#E53914" stroke-width="5" stroke-linecap="round"/><path d="M13.1943 32.8006C29.0746 26.95 44.0219 18.0146 55.9717 6.0647" stroke="#E53914" stroke-width="5" stroke-linecap="round"/><path d="M22.1064 46.1685C27.4737 46.1685 34.6436 47.1804 37.2568 52.4068" stroke="#E53914" stroke-width="5" stroke-linecap="round"/></svg></em></span>
          <span data-lang-en>Some news from us, <em class="blog-hero__accent">for you.<svg class="blog-squiggle" width="42" height="39" viewBox="0 0 59 55" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.5 27.4535C9.44977 20.5037 11.412 12.0272 11.412 2.5" stroke="#E53914" stroke-width="5" stroke-linecap="round"/><path d="M13.1943 32.8006C29.0746 26.95 44.0219 18.0146 55.9717 6.0647" stroke="#E53914" stroke-width="5" stroke-linecap="round"/><path d="M22.1064 46.1685C27.4737 46.1685 34.6436 47.1804 37.2568 52.4068" stroke="#E53914" stroke-width="5" stroke-linecap="round"/></svg></em></span>
        </h1>
        <p class="lead" style="margin-top:1rem"><span data-lang-el>Διάβασε, εξερεύνησε και ανακάλυψε κάτι καινούριο κάθε μέρα.</span><span data-lang-en>Read, explore and discover something new every day.</span></p>
      </div>
    </section>

    <!-- FEATURED POST -->
    <section class="section" style="padding-block: clamp(2rem, 3.5vw, 3rem)">
      <div class="container">
        <article class="feat-post reveal">
          <a href="${featured.slug}.html" class="feat-post__link">
            <img src="${featured.image}" alt="" loading="lazy" width="1400" height="700">
            <div class="feat-post__overlay">
              <div class="feat-post__top">
                <span class="bento-cat"><span data-lang-el>Επιλεγμένο</span><span data-lang-en>Featured</span></span>
                <span class="feat-post__time">${featured.read_minutes} min · <span data-lang-el>${formatDate(featured.date, "el-GR")}</span><span data-lang-en>${formatDate(featured.date, "en-GB")}</span></span>
              </div>
              <h2 class="feat-post__title"><span data-lang-el>${featured.title_el}</span><span data-lang-en>${featured.title_en}</span></h2>
              <p class="feat-post__desc"><span data-lang-el>${featured.excerpt_el}</span><span data-lang-en>${featured.excerpt_en}</span></p>
            </div>
          </a>
        </article>
      </div>
    </section>

    <!-- FILTERS -->
    <section class="section" style="padding-block: clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 2.5vw, 2rem)">
      <div class="container">
        <h2 class="h2" style="margin-bottom: clamp(1.2rem, 2.5vw, 1.8rem)"><span data-lang-el>Όλα τα άρθρα</span><span data-lang-en>All articles</span></h2>
        <div class="blog-filters">
          <div class="blog-tags">
            <button class="blog-tag blog-tag--active" data-filter="all"><span data-lang-el>Όλα</span><span data-lang-en>All</span></button>
            <button class="blog-tag" data-filter="tips"><span data-lang-el>Συμβουλές</span><span data-lang-en>Tips</span></button>
            <button class="blog-tag" data-filter="exams"><span data-lang-el>Εξετάσεις</span><span data-lang-en>Exams</span></button>
            <button class="blog-tag" data-filter="motivation"><span data-lang-el>Κίνητρο</span><span data-lang-en>Motivation</span></button>
            <button class="blog-tag" data-filter="parents"><span data-lang-el>Γονείς</span><span data-lang-en>Parents</span></button>
          </div>
          <label class="blog-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="search" placeholder="Αναζήτηση άρθρου..." aria-label="Αναζήτηση">
          </label>
        </div>
      </div>
    </section>

    <!-- POST GRID -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="grid cols-3" id="postGrid" style="gap: 0.75rem">

${gridPosts.map((p, i) => postCard(p, i || null)).join("\n\n")}

        </div>

        <!-- Empty state -->
        <div class="blog-empty" style="display:none">
          <div class="blog-empty__inner">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="36" cy="36" r="22" stroke="#E53914" stroke-width="4" stroke-linecap="round"/>
              <path d="M52 52 L68 68" stroke="#E53914" stroke-width="4" stroke-linecap="round"/>
              <path d="M28 36 h16" stroke="#E53914" stroke-width="3.5" stroke-linecap="round"/>
              <path d="M36 28 v16" stroke="#E53914" stroke-width="3.5" stroke-linecap="round"/>
            </svg>
            <h3 class="blog-empty__title"><span data-lang-el>Δεν βρέθηκαν άρθρα</span><span data-lang-en>No articles found</span></h3>
            <p class="blog-empty__text"><span data-lang-el>Δοκίμασε διαφορετική αναζήτηση ή επέλεξε άλλη κατηγορία.</span><span data-lang-en>Try a different search or pick another category.</span></p>
            <button class="blog-tag blog-tag--active" id="resetFilter"><span data-lang-el>← Εμφάνιση όλων</span><span data-lang-en>← Show all</span></button>
          </div>
        </div>

      </div>
    </section>

  </main>

  <div id="site-footer"></div>
  <script src="../js/components.js" defer></script>
  <script src="../js/main.js" defer></script>
</body>
</html>
`;
}

/* ---------------- run ---------------- */

function build() {
  const posts = loadPosts();
  if (!posts.length) {
    console.warn("[build-blog] No posts found in content/blog — skipping.");
    return;
  }

  // Clean up any previously generated detail pages no longer in content/blog
  const knownSlugs = new Set(posts.map((p) => p.slug));
  fs.readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".html"))
    .forEach((f) => {
      const filePath = path.join(PAGES_DIR, f);
      const content = fs.readFileSync(filePath, "utf8");
      if (content.includes('data-generated="blog-post"')) {
        const slug = f.replace(/\.html$/, "");
        if (!knownSlugs.has(slug)) fs.unlinkSync(filePath);
      }
    });

  posts.forEach((post) => {
    fs.writeFileSync(path.join(PAGES_DIR, `${post.slug}.html`), detailPage(post, posts), "utf8");
  });

  fs.writeFileSync(path.join(PAGES_DIR, "blog.html"), listingPage(posts), "utf8");

  console.log(`[build-blog] Generated ${posts.length} post page(s) + blog.html`);
}

build();
