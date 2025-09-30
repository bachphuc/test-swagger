import { chromium } from 'playwright';
import axios from "axios";
import crypto from "crypto";
import colors from 'colors';

colors.enable();

function base64URLEncode(str: any) {
  return str.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
}

async function login() {
  const clientId = "9U7u7HO1XTBhwiGMAsJ7rvMkoCNOKEYT";
  const domain = "dev-qecvz2r7i1fkuflm.us.auth0.com"; // e.g. my-tenant.us.auth0.com
  const redirectUri = "https://xnxms.xnprotel.com/xms/rsp/localresident/qa/";

  // PKCE setup
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(sha256(codeVerifier));

  // Auth0 authorize URL
  const authUrl = `https://${domain}/authorize?` +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid profile email offline_access",
      audience: "https://dev-qecvz2r7i1fkuflm.us.auth0.com/api/v2/",
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    });

  // Launch headless browser and auto-login
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`Navigate to ${authUrl}`.yellow);
  await page.goto(authUrl);

  // Fill in login form (adjust selectors for your tenant!)
  await page.fill('input[name="email"]', "lqatiger@mailinator.com");
  await page.fill('input[name="password"]', "Abc123456!");
  await page.click('button[type="submit"]');
  console.log(`Submit`);
  // Wait for redirect to callback
  console.log(`waitForURL ${redirectUri}`);
  await page.waitForURL(`${redirectUri}*`, {
    timeout: 0,
  });
  const redirectedUrl = page.url();
  console.log(`Redirect url ${redirectedUrl}`.yellow);
  await browser.close();

  // Extract "code" from URL
  const params = new URL(redirectedUrl).searchParams;
  const code = params.get("code");

  // Exchange code for tokens
  const tokenResponse = await axios.post(`https://${domain}/oauth/token`, {
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  });

  return tokenResponse.data; // { access_token, id_token, refresh_token, ... }
}

login().then(console.log).catch(console.error);