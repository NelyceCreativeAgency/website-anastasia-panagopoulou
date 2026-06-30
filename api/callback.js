/* =============================================================
   Decap CMS GitHub OAuth - step 2: GitHub redirects here with a
   ?code=... after the user approves access. We exchange that code
   for an access token (server-side, so the client secret never
   reaches the browser) and hand it back to the /admin popup via
   postMessage, in the format Decap CMS expects.
   ============================================================= */
module.exports = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code");

  function respond(message) {
    res.setHeader("Content-Type", "text/html");
    res.end(`<!DOCTYPE html><html><body>
<script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:${message.startsWith("error") ? "error" : "success"}:${message}',
        e.origin
      );
      window.removeEventListener("message", receiveMessage, false);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script>
</body></html>`);
  }

  if (!clientId || !clientSecret) {
    respond("error:Missing GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET env vars");
    return;
  }
  if (!code) {
    respond("error:Missing OAuth code from GitHub");
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json();

    if (data.error || !data.access_token) {
      respond(`error:${data.error_description || data.error || "No access_token returned"}`);
      return;
    }

    respond(JSON.stringify({ token: data.access_token, provider: "github" }));
  } catch (err) {
    respond(`error:${err.message}`);
  }
};
