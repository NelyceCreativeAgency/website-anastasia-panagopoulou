/* =============================================================
   Generate sitemap.xml from the same sources build-pages.js and
   build-blog.js already use, so it never drifts out of sync as
   blog posts are added/removed via the CMS. Run via
   `npm run build:sitemap` (also wired into `npm run build`, so
   every Vercel deploy regenerates it).
   ============================================================= */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.join(__dirname, "..");
const SITE_URL = "https://panagopoulou.gr";

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/pages/about.html", changefreq: "monthly", priority: "0.8" },
  { loc: "/pages/courses.html", changefreq: "monthly", priority: "0.8" },
  { loc: "/pages/certificates.html", changefreq: "monthly", priority: "0.6" },
  { loc: "/pages/contact.html", changefreq: "monthly", priority: "0.6" },
  { loc: "/pages/blog.html", changefreq: "weekly", priority: "0.7" },
  { loc: "/pages/privacy.html", changefreq: "yearly", priority: "0.2" },
];

/* Same normalisation as build-blog.js: Decap writes an unquoted
   `date: 2026-06-20` (parsed as a JS Date), older entries may be a
   quoted string - collapse both to a plain "YYYY-MM-DD". */
function toIsoDay(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function loadBlogEntries() {
  const dir = path.join(ROOT, "content", "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data } = matter(raw);
      const slug = data.slug || file.replace(/\.md$/, "");
      return {
        loc: `/pages/${slug}.html`,
        lastmod: toIsoDay(data.date),
        changefreq: "monthly",
        priority: "0.6",
      };
    });
}

function urlEntry(entry) {
  const lastmodTag = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${SITE_URL}${entry.loc}</loc>${lastmodTag}\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`;
}

function build() {
  const entries = [...STATIC_PAGES, ...loadBlogEntries()];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(urlEntry)
    .join("\n")}\n</urlset>\n`;

  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml, "utf8");
  console.log(`[build-sitemap] Generated sitemap.xml with ${entries.length} URL(s)`);
}

build();
