// HDNS Browser Extension — Background Service Worker
// Intercepts .tuk, .core, .hmtml, .hs, .hpls, .hope domains
// Resolves via HDNS sovereign DNS resolver (LOLY compliant)

const HDNS_RESOLVER = "https://koda-545cce50.base44.app/functions/hdnsResolver";
const SOVEREIGN_TLDS = [".tuk", ".core", ".hmtml", ".hs", ".hpls", ".hope"];
const GITHUB_PAGES_BASE = "https://hopeaihub.github.io/tuk-publication-website";

// Domain mapping: sovereign domain → page path on GitHub Pages
const DOMAIN_PAGE_MAP = {
  "www.gov.tuk": "/index.html",
  "gov.tuk": "/index.html",
  "www.gov.core": "/index.html",
  "gov.core": "/index.html",
  "www.tuk.core": "/index.html",
  "tuk.core": "/index.html",
  "vision.tuk": "/vision.html",
  "vision.core": "/vision.html",
  "about.tuk": "/about.html",
  "services.tuk": "/services.html",
  "community.tuk": "/community.html",
  "contact.tuk": "/contact.html",
  "bank.tuk": "/services.html",
  "5g.tuk": "/services.html",
  "api.tuk": "/index.html",
  "mail.tuk": "/contact.html",
  "bank.core": "/services.html",
  "cloud.core": "/services.html",
  "api.core": "/index.html",
  "www.hmtml": "/index.html",
  "docs.hmtml": "/about.html",
  "www.hs": "/index.html",
  "www.hpls": "/index.html",
  "www.hope": "/index.html",
  "cloud.hope": "/services.html",
};

// Intercept web requests and redirect sovereign TLDs to HDNS-resolved content
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const hostname = url.hostname.toLowerCase();

    // Check if this is a sovereign TLD
    const isSovereign = SOVEREIGN_TLDS.some(tld => hostname.endsWith(tld));

    if (!isSovereign) {
      return {};
    }

    // Resolve the sovereign domain to its GitHub Pages equivalent
    const pagePath = DOMAIN_PAGE_MAP[hostname] || "/index.html";
    const redirectUrl = GITHUB_PAGES_BASE + pagePath;

    console.log(`[HDNS] Resolving ${hostname}${url.pathname} → ${redirectUrl}`);

    return { redirectUrl };
  },
  { urls: ["*://*.tuk/*", "*://*.core/*", "*://*.hmtml/*", "*://*.hs/*", "*://*.hpls/*", "*://*.hope/*"] },
  ["blocking"]
);

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "resolve") {
    fetch(HDNS_RESOLVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: request.domain })
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // async response
  }

  if (request.action === "getStatus") {
    sendResponse({
      active: true,
      resolver: "HDNS v1.0",
      tlDs: SOVEREIGN_TLDS,
      loly: "compliant",
      cgt: "certified"
    });
  }
});

console.log("[HDNS] Sovereign DNS extension loaded — LOLY compliant — CGT certified");
