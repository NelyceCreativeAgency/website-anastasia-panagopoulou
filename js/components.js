/* =============================================================
   Shared header + footer - injected on every page so the
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
    ["pages/about.html", "Το Φροντιστήριο", "About"],
    ["pages/courses.html", "Τμήματα", "Courses"],
    ["pages/certificates.html", "Πτυχία", "Certificates"],
    ["pages/blog.html", "Τα νέα μας", "News"],
    ["pages/contact.html", "Επικοινωνία", "Contact"]
  ];

  function href(path) { return BASE + path; }
  // Generated blog post pages (pages/<slug>.html) carry data-generated="blog-post"
  // on <html> — treat them as "on the blog" for nav highlighting purposes.
  var onBlogPost = document.documentElement.getAttribute("data-generated") === "blog-post";
  function isActive(path) {
    var file = path.split("/").pop();
    if (onBlogPost && file === "blog.html") return true;
    return file === current;
  }

  function dual(el, en) {
    return '<span data-lang-el>' + el + '</span><span data-lang-en>' + en + '</span>';
  }

  // Wrap each word in its own span with a staggered transition-delay, so a
  // parent toggling .is-visible reveals the text one word at a time.
  function wordsReveal(text) {
    return text.split(" ").map(function (word, i) {
      return '<span class="word-reveal" style="transition-delay:' + (i * 0.07).toFixed(2) + 's">' + word + '</span>';
    }).join(" ");
  }

  /* ---------- Header ---------- */
  // Separate contact from the main menu so it can sit on the right
  var mainLinks = NAV.filter(function (n) { return n[0] !== "pages/contact.html"; });
  var contactItem = NAV.find(function (n) { return n[0] === "pages/contact.html"; });

  var pencilSVG = '<svg class="nav__underline" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M1,5 C12,2 25,7 38,4 S58,2 72,5 C82,7 91,3 99,5"/></svg>';
  var footerPencilSVG = '<svg class="footer__underline" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M1,5 C12,2 25,7 38,4 S58,2 72,5 C82,7 91,3 99,5"/></svg>';

  var links = mainLinks.map(function (n) {
    return '<li><a class="nav__link ' + (isActive(n[0]) ? "is-active" : "") +
      '" href="' + href(n[0]) + '">' + dual(n[1], n[2]) + pencilSVG + '</a></li>';
  }).join("") + (contactItem
    ? '<li class="nav__cta-mobile"><a class="nav__link nav__link--contact' + (isActive(contactItem[0]) ? ' is-active' : '') + '" href="' + href(contactItem[0]) + '">' + dual(contactItem[1], contactItem[2]) + '</a></li>'
    : '');

  var header =
    '<a class="skip-link" href="#main">' + dual("Μετάβαση στο περιεχόμενο", "Skip to content") + '</a>' +
    '<header class="nav" id="nav">' +
      '<img class="nav__art" src="' + href("Images/headertest.svg") + '" alt="" aria-hidden="true">' +
      '<img class="nav__torn-img" src="' + href("Images/mobile_rip_header.svg") + '" alt="" aria-hidden="true">' +
      '<div class="container nav__inner">' +
        '<a class="nav__logo" href="' + href("index.html") + '" aria-label="Anastasia Panagopoulou English School">' +
          '<img class="nav__logo-dark" src="' + href("Images/LOGO.webp") + '" alt="Anastasia Panagopoulou English School" width="170" height="38">' +
          '<img class="nav__logo-light" src="' + href("Images/LOGOlight.webp") + '" alt="Anastasia Panagopoulou English School" width="170" height="38" aria-hidden="true">' +
        '</a>' +
        '<nav aria-label="Primary">' +
          '<ul class="nav__menu" id="navMenu">' + links + '</ul>' +
        '</nav>' +
        '<div class="nav__actions">' +
          '<div class="lang" role="group" aria-label="Language">' +
            '<button class="lang__btn" data-set-lang="el" type="button">GR</button>' +
            '<button class="lang__btn" data-set-lang="en" type="button">EN</button>' +
          '</div>' +
          (contactItem
            ? '<a class="nav__link nav__link--contact nav__contact--desktop' + (isActive(contactItem[0]) ? ' is-active' : '') + '" href="' + href(contactItem[0]) + '">' +
                dual(contactItem[1], contactItem[2]) + '</a>'
            : '') +
          '<button class="nav__burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navMenu" type="button"><span></span></button>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<div class="nav__backdrop" id="navBackdrop"></div>';

  /* ---------- Footer ---------- */
  var fLinks = NAV.map(function (n) {
    return '<a href="' + href(n[0]) + '">' + dual(n[1], n[2]) + footerPencilSVG + '</a>';
  }).join("");

  var footer =
    '<footer class="footer">' +
      '<span class="torn-edge torn-edge--top torn-edge--navy footer__torn" aria-hidden="true"><span class="torn-edge__shape"></span></span>' +
      '<span class="footer__clip" aria-hidden="true"><img class="footer__art" src="' + href("Images/big-pencil.svg") + '" alt=""></span>' +
      '<div class="container">' +
        '<div class="footer__grid">' +
          '<div class="footer__about">' +
            '<a class="footer__logo" href="' + href("index.html") + '"><img src="' + href("Images/LOGOlight.webp") + '" alt="Anastasia Panagopoulou English School"></a>' +
            '<p class="footer__tagline reveal">' + dual(
              wordsReveal("36 χρόνια εκπαίδευσης στην αγγλική γλώσσα."),
              wordsReveal("36 years of English language education.")
            ) + '</p>' +
            '<div class="footer__social">' +
              '<a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l.5-3H14V9c0-.97.28-1.62 1.84-1.62H17V4.14C16.69 4.1 15.61 4 14.34 4 11.7 4 10 5.62 10 8.6V10.5H7v3h3V21h4v-7.5z"/></svg></a>' +
              '<a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.7 0 3.1 0 4.1.05 1.1.05 1.8.2 2.5.5.7.3 1.2.6 1.7 1.15.5.5.85 1 1.15 1.7.3.7.45 1.4.5 2.5.05 1 .05 1.4.05 4.1s0 3.1-.05 4.1c-.05 1.1-.2 1.8-.5 2.5-.3.7-.65 1.2-1.15 1.7-.5.5-1 .85-1.7 1.15-.7.3-1.4.45-2.5.5-1 .05-1.4.05-4.1.05s-3.1 0-4.1-.05c-1.1-.05-1.8-.2-2.5-.5-.7-.3-1.2-.65-1.7-1.15-.5-.5-.85-1-1.15-1.7-.3-.7-.45-1.4-.5-2.5C2 15.1 2 14.7 2 12s0-3.1.05-4.1c.05-1.1.2-1.8.5-2.5.3-.7.65-1.2 1.15-1.7.5-.5 1-.85 1.7-1.15.7-.3 1.4-.45 2.5-.5C8.9 2 9.3 2 12 2zm0 1.8c-2.65 0-2.97 0-4 .05-.9.05-1.4.2-1.7.3-.45.17-.75.4-1.1.7-.3.35-.5.65-.7 1.1-.1.3-.25.8-.3 1.7C4.15 8.7 4.15 9.02 4.15 12s0 3.3.05 4.35c.05.9.2 1.4.3 1.7.17.45.4.75.7 1.1.35.3.65.5 1.1.7.3.1.8.25 1.7.3 1.03.05 1.35.05 4 .05s2.97 0 4-.05c.9-.05 1.4-.2 1.7-.3.45-.17.75-.4 1.1-.7.3-.35.5-.65.7-1.1.1-.3.25-.8.3-1.7.05-1.05.05-1.37.05-4.35s0-3.3-.05-4.35c-.05-.9-.2-1.4-.3-1.7-.17-.45-.4-.75-.7-1.1-.35-.3-.65-.5-1.1-.7-.3-.1-.8-.25-1.7-.3-1.03-.05-1.35-.05-4-.05zm0 3.5a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 1.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8zm5.95-2.6a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/></svg></a>' +
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
              '<a href="' + href("pages/courses.html") + '">' + dual("Junior", "Junior") + footerPencilSVG + '</a>' +
              '<a href="' + href("pages/courses.html") + '">' + dual("Senior", "Senior") + footerPencilSVG + '</a>' +
              '<a href="' + href("pages/courses.html") + '">' + dual("Ενήλικες", "Adults") + footerPencilSVG + '</a>' +
              '<a href="' + href("pages/certificates.html") + '">' + dual("Πτυχία", "Certificates") + footerPencilSVG + '</a>' +
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
          '<span class="footer__credit">' +
            '<a href="' + href("pages/privacy.html") + '">' + dual("Πολιτική Απορρήτου", "Privacy Policy") + '</a>' +
            '<span class="footer__credit-sep">·</span>' +
            '<svg class="footer__heart" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z"/></svg> ' +
            dual("Website by ", "Website by ") + '<a href="https://www.nelycedesign.com/gr" target="_blank" rel="noopener">Nelyce</a>' +
          '</span>' +
          '<span>© <span id="year"></span> Anastasia Panagopoulou English School.</span>' +
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
