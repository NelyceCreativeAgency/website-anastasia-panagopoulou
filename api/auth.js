/* =============================================================
   Decap CMS GitHub OAuth - step 1: kick off the GitHub login.
   Visiting /api/auth redirects the popup window that the CMS
   opened over to GitHub's authorize screen. GitHub then redirects
   back to /api/callback once the user approves access.

   Requires these env vars set in the Vercel project:
     GITHUB_CLIENT_ID
     GITHUB_CLIENT_SECRET   (used by api/callback.js)
   ============================================================= */
module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.statusCode = 500;
    res.end("Missing GITHUB_CLIENT_ID environment variable.");
    return;
  }

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/api/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
  });

  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
};
