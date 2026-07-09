/* =============================================================
   Contact form submission handler.
   Sends the visitor's message by email via SMTP (nodemailer) to
   the school's mailbox. Requires these env vars in the Vercel
   project:
     SMTP_HOST
     SMTP_PORT       (e.g. 465 or 587)
     SMTP_USER       (mailbox login, e.g. hello@panagopoulou.gr)
     SMTP_PASS
     CONTACT_TO      (destination inbox - defaults to SMTP_USER)
   ============================================================= */
const nodemailer = require("nodemailer");

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
    return;
  }

  let body = req.body;
  if (!body || typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; }
  }

  const { name, phone, email, subject, message, website } = body || {};

  // Honeypot: a hidden field real visitors never see or fill in.
  if (website) {
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (!name || !email || !message) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: "missing_fields" }));
    return;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("[api/contact] Missing SMTP_HOST/SMTP_USER/SMTP_PASS env vars.");
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: "not_configured" }));
    return;
  }

  const port = Number(SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"${name} (via panagopoulou.gr)" <${SMTP_USER}>`,
      to: CONTACT_TO || SMTP_USER,
      replyTo: email,
      subject: `Νέο μήνυμα επικοινωνίας: ${subject || "—"}`,
      text: `Όνομα: ${name}\nEmail: ${email}\nΤηλέφωνο: ${phone || "—"}\nΕνδιαφέρον: ${subject || "—"}\n\n${message}`,
      html:
        `<p><strong>Όνομα:</strong> ${escapeHtml(name)}</p>` +
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` +
        `<p><strong>Τηλέφωνο:</strong> ${escapeHtml(phone || "—")}</p>` +
        `<p><strong>Ενδιαφέρον:</strong> ${escapeHtml(subject || "—")}</p>` +
        `<p><strong>Μήνυμα:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("[api/contact] sendMail failed:", err);
    res.statusCode = 502;
    res.end(JSON.stringify({ ok: false, error: "send_failed" }));
  }
};
