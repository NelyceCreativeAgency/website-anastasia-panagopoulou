/* =============================================================
   Shared header + footer — injected on every page so the
   navigation lives in ONE place. Bilingual text is inlined with
   data-lang-el / data-lang-en spans toggled via the <html lang> attr.
   ============================================================= */
(function () {
  // Are we inside /pages/ ? then assets live one level up.
  var inPages = /\/pages\//.test(location.pathname);
  var BASE = inPages ? "../" : "";
  var current = location.pathname.split("/").pop() || "index.html";

  // [file, el-label, en-label]
  var NAV = [
    ["index.html", "Αρχική", "Home"],
    ["pages/about.html", "Το Σχολείο", "About"],
    ["pages/courses.html", "Τμήματα", "Courses"],
    ["pages/certificates.html", "Πτυχία", "Certificates"],
    ["pages/blog.html", "Άρθρα", "Blog"],
    ["pages/contact.html", "Επικοινωνία", "Contact"]
  ];

  function href(path) { return BASE + path; }
  function isActive(path) {
    var file = path.split("/").pop();
    if (current === "blog-details.html" && file === "blog.html") return true;
    return file === current;
  }

  function dual(el, en) {
    return '<span data-lang-el>' + el + '</span><span data-lang-en>' + en + '</span>';
  }

  /* ---------- Header ---------- */
  var links = NAV.map(function (n) {
    return '<li><a class="nav__link ' + (isActive(n[0]) ? "is-active" : "") +
      '" href="' + href(n[0]) + '">' + dual(n[1], n[2]) + '</a></li>';
  }).join("");

  var header =
    '<a class="skip-link" href="#main">' + dual("Μετάβαση στο περιεχόμενο", "Skip to content") + '</a>' +
    '<header class="nav" id="nav">' +
      '<div class="container nav__inner">' +
        '<a class="nav__logo" href="' + href("index.html") + '" aria-label="Anastasia Panagopoulou English School">' +
          '<img src="' + href("Images/LOGO.png") + '" alt="Anastasia Panagopoulou English School" width="170" height="38">' +
        '</a>' +
        '<nav aria-label="Primary">' +
          '<ul class="nav__menu" id="navMenu">' + links +
            '<li class="nav__cta-mobile"><a class="btn btn--sm" href="' + href("pages/contact.html") + '">' +
              dual("Κλείσε Δωρεάν Test", "Book a Free Test") + '</a></li>' +
          '</ul>' +
        '</nav>' +
        '<div class="nav__actions">' +
          '<div class="lang" role="group" aria-label="Language">' +
            '<button class="lang__btn" data-set-lang="el" type="button">GR</button>' +
            '<button class="lang__btn" data-set-lang="en" type="button">EN</button>' +
          '</div>' +
          '<a class="btn btn--sm nav__cta-desktop" href="' + href("pages/contact.html") + '">' +
            dual("Δωρεάν Test", "Free Test") + '</a>' +
          '<button class="nav__burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navMenu" type="button"><span></span></button>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<div class="nav__backdrop" id="navBackdrop"></div>';

  /* ---------- Footer ---------- */
  var fLinks = NAV.map(function (n) {
    return '<a href="' + href(n[0]) + '">' + dual(n[1], n[2]) + '</a>';
  }).join("");

  var footer =
    '<footer class="footer">' +
      '<div class="container">' +
        '<div class="footer__grid">' +
          '<div class="footer__about">' +
            '<a class="footer__logo" href="' + href("index.html") + '"><img src="' + href("Images/LOGO.png") + '" alt="Anastasia Panagopoulou English School"></a>' +
            '<p>' + dual(
              "Από το 1988 διδάσκουμε Αγγλικά με αγάπη, συνέπεια και αποτελέσματα — σε μια ζεστή, οικογενειακή ατμόσφαιρα.",
              "Since 1988 we have taught English with care, consistency and results — in a warm, family atmosphere."
            ) + '</p>' +
            '<div class="footer__social">' +
              '<a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l1-4h-4V8c0-1.1.3-2 2-2h2V2.1C18.7 2 17.5 2 16.5 2 13.7 2 12 3.7 12 6.7V10H9v4h3v8z"/></svg></a>' +
              '<a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
              '<a href="#" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.4 12 31 31 0 0 0 22 8.2zM10 15V9l5.2 3z"/></svg></a>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h4>' + dual("Πλοήγηση", "Explore") + '</h4>' +
            '<div class="footer__links">' + fLinks + '</div>' +
          '</div>' +
          '<div>' +
            '<h4>' + dual("Τμήματα", "Courses") + '</h4>' +
            '<div class="footer__links">' +
              '<a href="' + href("pages/courses.html") + '">' + dual("Junior", "Junior") + '</a>' +
              '<a href="' + href("pages/courses.html") + '">' + dual("Senior", "Senior") + '</a>' +
              '<a href="' + href("pages/courses.html") + '">' + dual("Ενήλικες", "Adults") + '</a>' +
              '<a href="' + href("pages/certificates.html") + '">' + dual("Πτυχία", "Certificates") + '</a>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h4>' + dual("Επικοινωνία", "Contact") + '</h4>' +
            '<ul class="footer__contact">' +
              '<li><span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>' +
                '<span>D. Papanikolaou 12,<br>19400 Koropi, Attica</span></li>' +
              '<li><span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z"/></svg></span>' +
                '<a href="tel:+306932384633">+30 693 238 4633</a></li>' +
              '<li><span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span>' +
                '<a href="mailto:hello@englishpanagopoulou.com">hello@englishpanagopoulou.com</a></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<span>© <span id="year"></span> Anastasia Panagopoulou English School. ' + dual("Με επιφύλαξη παντός δικαιώματος.", "All rights reserved.") + '</span>' +
          '<span>' + dual("Σχεδιασμός με φροντίδα ", "Crafted with care ") + '· Est. 1988</span>' +
        '</div>' +
      '</div>' +
    '</footer>';

  var h = document.getElementById("site-header");
  var f = document.getElementById("site-footer");
  if (h) h.innerHTML = header;
  if (f) f.innerHTML = footer;

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
