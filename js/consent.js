/* =============================================================
   Cookie consent - GDPR-style banner + preferences modal.
   Analytics (Google Analytics) and the Contact-page map embed are
   NOT loaded until the visitor opts in; consent is stored locally
   and re-applied (without showing the banner again) on later visits.
   ============================================================= */
(function () {
  "use strict";

  var STORE_KEY = "apes_consent";
  var CONSENT_VERSION = 1;
  var GA_ID = "G-96DQREPWMG";

  var inPages = /\/pages\//.test(location.pathname);
  var BASE = inPages ? "../" : "";
  var PRIVACY_HREF = BASE + "pages/privacy.html#cookies";

  function dual(el, en) {
    return '<span data-lang-el>' + el + '</span><span data-lang-en>' + en + '</span>';
  }

  /* ---------------- Consent storage ---------------- */
  function readConsent() {
    var raw;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) { return null; }
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);
      return data.version === CONSENT_VERSION ? data : null;
    } catch (e) { return null; }
  }

  function writeConsent(categories) {
    var data = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: !!categories.analytics,
      functional: !!categories.functional,
      timestamp: new Date().toISOString()
    };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
    applyConsent(data);
    return data;
  }

  function hasGlobalOptOut() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1";
  }

  /* ---------------- Effects: only run once consent is granted ---------------- */
  var analyticsLoaded = false;
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function loadMapEmbeds() {
    document.querySelectorAll('[data-consent-embed="maps"]').forEach(function (el) {
      if (el.classList.contains("is-loaded")) return;
      var src = el.getAttribute("data-src");
      if (!src) return;
      var iframe = document.createElement("iframe");
      iframe.title = el.getAttribute("data-embed-title") || "Map";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.src = src;
      el.appendChild(iframe);
      el.classList.add("is-loaded");
    });
  }

  function applyConsent(data) {
    if (data.analytics) loadAnalytics();
    if (data.functional) loadMapEmbeds();
  }

  /* ---------------- Markup ---------------- */
  var bannerHTML =
    '<div class="cookie-consent" id="cookieConsent" role="dialog" aria-label="Cookie consent" aria-live="polite" hidden>' +
      '<div class="cookie-consent__panel">' +
        '<div class="cookie-consent__icon" aria-hidden="true">' +
          '<svg width="20" height="20" viewBox="0 0 162.3 162.28" fill="currentColor">' +
            '<path d="M162.24,77.9c-11.71,4.86-20.35-1.7-25.84-10.12-9.77-1.82-20.23-4.38-26.44-12.29-7.13-9.05-7.85-19.28-6.45-30.25-7.97-4.91-13.37-13.9-9.7-24.22C46.67-6.45,4.43,28.08.33,73.68c-4.19,46.64,31.8,87.18,78.36,88.56,46.14,1.37,85.4-36.47,83.55-84.34ZM58,33.15c8.21,0,14.87,6.66,14.87,14.88s-6.66,14.87-14.87,14.87-14.87-6.66-14.87-14.87,6.66-14.88,14.87-14.88ZM64.6,122.52c-10.04,0-18.19-8.15-18.19-18.19s8.15-18.19,18.19-18.19,18.19,8.14,18.19,18.19-8.14,18.19-18.19,18.19ZM117.64,115.95c-2.73,0-4.94-2.22-4.94-4.95s2.21-4.95,4.94-4.95,4.95,2.22,4.95,4.95-2.21,4.95-4.95,4.95Z"/>' +
            '<circle cx="134.18" cy="14.89" r="9.94"/>' +
            '<circle cx="147.48" cy="48.02" r="6.63"/>' +
          '</svg>' +
        '</div>' +
        '<div>' +
          '<h3 class="cookie-consent__title">' + dual("Η ιδιωτικότητα σας μας ενδιαφέρει", "Your privacy matters") + '</h3>' +
          '<p class="cookie-consent__text">' +
            dual(
              'Χρησιμοποιούμε cookies για να λειτουργεί σωστά η ιστοσελίδα και, εφόσον συναινέσετε, για στατιστικά επισκεψιμότητας. Δείτε την <a href="' + PRIVACY_HREF + '">Πολιτική Απορρήτου</a>.',
              'We use cookies to make the site work and, with your consent, for visit statistics. See our <a href="' + PRIVACY_HREF + '">Privacy Policy</a>.'
            ) +
          '</p>' +
          '<div class="cookie-consent__actions">' +
            '<button type="button" class="btn btn--sm" data-cookie-accept>' + dual("Αποδοχή όλων", "Accept all") + '</button>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-cookie-reject>' + dual("Απόρριψη", "Reject all") + '</button>' +
            '<button type="button" class="cookie-consent__link" data-cookie-prefs>' + dual("Προτιμήσεις", "Preferences") + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  function category(key, titleEl, titleEn, descEl, descEn, opts) {
    opts = opts || {};
    var checked = opts.checked ? "checked" : "";
    var disabled = opts.disabled ? "disabled" : "";
    var badge = opts.disabled ? '<span class="cookie-category__badge">' + dual("Πάντα ενεργά", "Always active") + '</span>' : "";
    return (
      '<div class="cookie-category">' +
        '<div class="cookie-category__head">' +
          '<label class="cookie-toggle">' +
            '<input type="checkbox" ' + checked + ' ' + disabled + (opts.disabled ? "" : ' data-cookie-toggle="' + key + '"') + '>' +
            '<span class="cookie-toggle__track"></span>' +
          '</label>' +
          '<div><h3>' + dual(titleEl, titleEn) + badge + '</h3></div>' +
        '</div>' +
        '<p>' + dual(descEl, descEn) + '</p>' +
      '</div>'
    );
  }

  var modalHTML =
    '<div class="cookie-modal" id="cookieModal" hidden>' +
      '<div class="cookie-modal__backdrop" data-cookie-close></div>' +
      '<div class="cookie-modal__panel" role="dialog" aria-modal="true" aria-labelledby="cookieModalTitle">' +
        '<button type="button" class="cookie-modal__close" data-cookie-close aria-label="Close">&times;</button>' +
        '<h2 id="cookieModalTitle" class="h3">' + dual("Ρυθμίσεις Cookies", "Cookie Settings") + '</h2>' +
        '<p class="cookie-modal__lead">' +
          dual(
            'Επιλέξτε ποιες κατηγορίες cookies επιτρέπετε. Περισσότερα στην <a href="' + PRIVACY_HREF + '">Πολιτική Απορρήτου</a>.',
            'Choose which categories of cookies you allow. More detail in our <a href="' + PRIVACY_HREF + '">Privacy Policy</a>.'
          ) +
        '</p>' +
        category("necessary",
          "Απαραίτητα", "Necessary",
          "Χρειάζονται για τη βασική λειτουργία της σελίδας, όπως η αποθήκευση της γλωσσικής σας επιλογής και των προτιμήσεων cookies. Δεν μπορούν να απενεργοποιηθούν.",
          "Required for the site to work, such as remembering your language and cookie preferences. These cannot be turned off.",
          { checked: true, disabled: true }) +
        category("analytics",
          "Στατιστικά", "Analytics",
          "Το Google Analytics μάς βοηθά να καταλάβουμε πώς χρησιμοποιείτε την ιστοσελίδα, ώστε να τη βελτιώνουμε. Φορτώνει μόνο εφόσον συναινέσετε.",
          "Google Analytics helps us understand how the site is used so we can improve it. Only loaded if you opt in.") +
        category("functional",
          "Λειτουργικά", "Functional",
          "Επιτρέπουν την εμφάνιση του ενσωματωμένου χάρτη Google Maps στη σελίδα Επικοινωνίας. Η Google ενδέχεται να τοποθετήσει δικά της cookies όταν φορτώσει ο χάρτης.",
          "Enable the embedded Google Map on the Contact page. Google may set its own cookies once the map loads.") +
        '<div class="cookie-modal__actions">' +
          '<button type="button" class="btn btn--ghost" data-cookie-reject>' + dual("Απόρριψη όλων", "Reject all") + '</button>' +
          '<button type="button" class="btn btn--ghost" data-cookie-save>' + dual("Αποθήκευση επιλογών", "Save preferences") + '</button>' +
          '<button type="button" class="btn" data-cookie-accept>' + dual("Αποδοχή όλων", "Accept all") + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ---------------- Wiring ---------------- */
  var banner, modal, lastFocused;

  function showBanner() {
    if (banner) { banner.hidden = false; requestAnimationFrame(function () { banner.classList.add("is-visible"); }); }
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.remove("is-visible");
    setTimeout(function () { banner.hidden = true; }, 500);
  }

  function syncModalToggles(data) {
    var d = data || readConsent() || { analytics: false, functional: false };
    modal.querySelectorAll("[data-cookie-toggle]").forEach(function (input) {
      input.checked = !!d[input.getAttribute("data-cookie-toggle")];
    });
  }

  function openModal() {
    syncModalToggles();
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add("is-visible"); });
    document.body.style.overflowY = "hidden";
    var closeBtn = modal.querySelector(".cookie-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("is-visible");
    document.body.style.overflowY = "";
    setTimeout(function () { modal.hidden = true; }, 350);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function trapFocus(e) {
    if (modal.hidden || e.key !== "Tab") return;
    var focusable = modal.querySelectorAll('button, [href], input:not([disabled])');
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function init() {
    document.body.insertAdjacentHTML("beforeend", bannerHTML + modalHTML);
    banner = document.getElementById("cookieConsent");
    modal = document.getElementById("cookieModal");

    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-cookie-accept]")) {
        writeConsent({ analytics: true, functional: true });
        hideBanner();
        if (!modal.hidden) closeModal();
      } else if (e.target.closest("[data-cookie-reject]")) {
        writeConsent({ analytics: false, functional: false });
        hideBanner();
        if (!modal.hidden) closeModal();
      } else if (e.target.closest("[data-cookie-prefs]") || e.target.closest("[data-open-cookie-prefs]")) {
        e.preventDefault();
        openModal();
      } else if (e.target.closest("[data-cookie-save]")) {
        var picked = {};
        modal.querySelectorAll("[data-cookie-toggle]").forEach(function (input) {
          picked[input.getAttribute("data-cookie-toggle")] = input.checked;
        });
        writeConsent(picked);
        hideBanner();
        closeModal();
      } else if (e.target.closest("[data-cookie-close]")) {
        closeModal();
      } else if (e.target.closest("[data-map-consent-enable]")) {
        writeConsent(Object.assign({}, readConsent() || {}, { functional: true }));
        hideBanner();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeModal();
      trapFocus(e);
    });

    var existing = readConsent();
    if (existing) {
      applyConsent(existing);
    } else if (hasGlobalOptOut()) {
      // Honour Global Privacy Control / Do Not Track: opt out silently,
      // no banner, but preferences stay reachable via the footer link.
      writeConsent({ analytics: false, functional: false });
    } else {
      showBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
