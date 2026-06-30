/* =============================================================
   Inject CMS-managed copy into index.html.
   Elements tagged data-cms="key" in index.html get their text (or
   src/href, for images and the phone/email links) overwritten from
   content/pages/home.yml on every build, so editors only ever touch
   the YAML (directly or via /admin) — never the HTML.

   Uses precise string slicing rather than a full HTML parser/
   serializer, so every other byte of index.html (formatting,
   attribute order, whitespace) is left completely untouched.
   ============================================================= */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const ROOT = path.join(__dirname, "..");
const HOME_YML = path.join(ROOT, "content", "pages", "home.yml");
const INDEX_HTML = path.join(ROOT, "index.html");

// { hero: { lead_el: "x" } } -> { hero_lead_el: "x" } — matches the
// data-cms="section_field" naming used in index.html.
function flatten(obj, prefix = "") {
  const out = {};
  Object.keys(obj || {}).forEach((key) => {
    const value = obj[key];
    const flatKey = prefix ? `${prefix}_${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
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

function build() {
  if (!fs.existsSync(HOME_YML)) {
    console.warn("[build-pages] content/pages/home.yml not found — skipping.");
    return;
  }

  const nested = yaml.load(fs.readFileSync(HOME_YML, "utf8")) || {};
  const data = flatten(nested);
  let html = fs.readFileSync(INDEX_HTML, "utf8");

  let applied = 0;
  const missing = [];

  Object.keys(data).forEach((key) => {
    const result = applyField(html, key, data[key]);
    html = result.html;
    if (result.found) applied++;
    else missing.push(key);
  });

  if (missing.length) {
    console.warn(`[build-pages] No data-cms="..." element found for: ${missing.join(", ")}`);
  }

  fs.writeFileSync(INDEX_HTML, html, "utf8");
  console.log(`[build-pages] Applied ${applied} field(s) to index.html`);
}

build();
