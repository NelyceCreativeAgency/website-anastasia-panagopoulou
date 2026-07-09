/* =============================================================
   Inject CMS-managed copy into static pages.
   Elements tagged data-cms="key" in a page get their text (or
   src/href, for images and the phone/email links) overwritten from
   the matching content/pages/*.yml on every build, so editors only
   ever touch the YAML (directly or via /admin) — never the HTML.

   Uses precise string slicing rather than a full HTML parser/
   serializer, so every other byte of the page (formatting,
   attribute order, whitespace) is left completely untouched.
   ============================================================= */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const ROOT = path.join(__dirname, "..");

// One entry per CMS-managed page: which YAML feeds which HTML file.
const PAGES = [
  { yml: path.join(ROOT, "content", "pages", "home.yml"), html: path.join(ROOT, "index.html") },
  { yml: path.join(ROOT, "content", "pages", "about.yml"), html: path.join(ROOT, "pages", "about.html") },
  { yml: path.join(ROOT, "content", "pages", "courses.yml"), html: path.join(ROOT, "pages", "courses.html") },
  { yml: path.join(ROOT, "content", "pages", "certificates.yml"), html: path.join(ROOT, "pages", "certificates.html") },
  { yml: path.join(ROOT, "content", "pages", "contact.yml"), html: path.join(ROOT, "pages", "contact.html") },
];

// { hero: { lead_el: "x" } } -> { hero_lead_el: "x" } — matches the
// data-cms="section_field" naming used in index.html.
function flatten(obj, prefix = "") {
  const out = {};
  Object.keys(obj || {}).forEach((key) => {
    const value = obj[key];
    const flatKey = prefix ? `${prefix}_${key}` : key;
    if (Array.isArray(value)) {
      // Repeating lists (e.g. faq.items) aren't single data-cms fields -
      // they're rendered by their own dedicated build script instead.
      return;
    }
    if (value && typeof value === "object") {
      Object.assign(out, flatten(value, flatKey));
    } else {
      out[flatKey] = value;
    }
  });
  return out;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function applyField(html, key, rawValue) {
  const needle = `data-cms="${key}"`;
  const attrIdx = html.indexOf(needle);
  if (attrIdx === -1) return { html, found: false };

  const tagStart = html.lastIndexOf("<", attrIdx);
  const tagEnd = html.indexOf(">", attrIdx);
  const openTag = html.slice(tagStart, tagEnd + 1);
  const tagName = (openTag.match(/^<([a-zA-Z0-9]+)/) || [, ""])[1].toLowerCase();

  if (tagName === "img") {
    const newOpenTag = openTag.replace(/src="[^"]*"/, `src="${escapeAttr(rawValue)}"`);
    return { html: html.slice(0, tagStart) + newOpenTag + html.slice(tagEnd + 1), found: true };
  }

  if (key === "contact_email") {
    const newOpenTag = openTag.replace(/href="mailto:[^"]*"/, `href="mailto:${escapeAttr(rawValue)}"`);
    const closeIdx = html.indexOf("<", tagEnd + 1);
    return { html: html.slice(0, tagStart) + newOpenTag + escapeHtml(rawValue) + html.slice(closeIdx), found: true };
  }

  if (key === "contact_phone") {
    const tel = String(rawValue).replace(/[^\d+]/g, "");
    const newOpenTag = openTag.replace(/href="tel:[^"]*"/, `href="tel:${tel}"`);
    const closeIdx = html.indexOf("<", tagEnd + 1);
    return { html: html.slice(0, tagStart) + newOpenTag + escapeHtml(rawValue) + html.slice(closeIdx), found: true };
  }

  const closeIdx = html.indexOf("<", tagEnd + 1);
  return { html: html.slice(0, tagEnd + 1) + escapeHtml(rawValue) + html.slice(closeIdx), found: true };
}

function buildOne(ymlPath, htmlPath) {
  const label = path.relative(ROOT, htmlPath);
  if (!fs.existsSync(ymlPath)) {
    console.warn(`[build-pages] ${path.relative(ROOT, ymlPath)} not found — skipping ${label}.`);
    return;
  }

  const nested = yaml.load(fs.readFileSync(ymlPath, "utf8")) || {};
  const data = flatten(nested);
  let html = fs.readFileSync(htmlPath, "utf8");

  let applied = 0;
  const missing = [];

  Object.keys(data).forEach((key) => {
    const result = applyField(html, key, data[key]);
    html = result.html;
    if (result.found) applied++;
    else missing.push(key);
  });

  if (missing.length) {
    console.warn(`[build-pages] ${label}: no data-cms="..." element found for: ${missing.join(", ")}`);
  }

  fs.writeFileSync(htmlPath, html, "utf8");
  console.log(`[build-pages] Applied ${applied} field(s) to ${label}`);
}

function build() {
  PAGES.forEach((page) => buildOne(page.yml, page.html));
}

build();
