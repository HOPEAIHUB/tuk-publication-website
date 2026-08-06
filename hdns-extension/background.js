// HDNS Browser Extension v2.0 — Hope AI Sovereign DNS Redirect
// Intercepts ALL sovereign TLDs and redirects to public gateway
// LOLY Mandate Enforced | CGT Certified

// === Sovereign TLD → Public Gateway Mapping ===
const TLD_MAP = {
  "tuk":        "https://hopeaihub.github.io/tuk-publication-website/",
  "core":       "https://hopeaihub.github.io/tuk-publication-website/",
  "gag":        "https://hopeaihub.github.io/tuk-publication-website/",
  "gap":        "https://hopeaihub.github.io/tuk-publication-website/",
  "hope":       "https://hopeaihub.github.io/tuk-publication-website/",
  "thimothism": "https://hopeaihub.github.io/tuk-publication-website/",
  "otp":        "https://hopeaihub.github.io/tuk-publication-website/",
  "tuidl":      "https://hopeaihub.github.io/tuk-publication-website/",
  "hs":         "https://hopeaihub.github.io/tuk-publication-website/",
  "hpls":       "https://hopeaihub.github.io/tuk-publication-website/",
  "bank":       "https://hopeaihub.github.io/tuk-publication-website/services.html",
  "finance":    "https://hopeaihub.github.io/tuk-publication-website/services.html",
  "tuic":       "https://hopeaihub.github.io/tuk-publication-website/services.html",
  "tup":        "https://hopeaihub.github.io/tuk-publication-website/",
  "hmtml":      "https://hopeaihub.github.io/tuk-publication-website/about.html",
};

// === Subdomain → Page Mapping ===
const SUBDOMAIN_PAGE_MAP = {
  "vision":    "vision.html",
  "about":     "about.html",
  "services":  "services.html",
  "community": "community.html",
  "contact":   "contact.html",
  "bank":      "services.html",
  "5g":        "services.html",
  "api":       "index.html",
  "mail":      "contact.html",
  "cloud":     "services.html",
  "docs":      "about.html",
};

// === HDNS Resolver API ===
const HDNS_RESOLVER = "https://koda-545cce50.base44.app/functions/hdnsResolver";

// === Intercept web requests for sovereign TLDs ===
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const hostname = url.hostname.toLowerCase();
    const hostParts = hostname.split(".");
    const tld = hostParts[hostParts.length - 1];

    // Check if this is a sovereign TLD
    if (!TLD_MAP[tld]) {
      return {};
    }

    // Get base gateway URL for this TLD
    let baseUrl = TLD_MAP[tld];

    // Check for subdomain → page mapping
    if (hostParts.length >= 3) {
      const subdomain = hostParts[0];
      if (SUBDOMAIN_PAGE_MAP[subdomain]) {
        const pagePath = SUBDOMAIN_PAGE_MAP[subdomain];
        baseUrl = baseUrl.replace(/\/(index|services|about)\.html.*/, "/") + pagePath;
      }
    }

    // Preserve any path after the domain
    let path = url.pathname;
    if (path === "/" || path === "") {
      path = "";
    }

    const redirectUrl = baseUrl.replace(/\/$/, "") + path + url.search + url.hash;

    console.log(`[HDNS] ${hostname}${url.pathname} → ${redirectUrl}`);

    return { redirectUrl };
  },
  {
    urls: [
      "*://*.tuk/*",
      "*://*.core/*",
      "*://*.gag/*",
      "*://*.gap/*",
      "*://*.hope/*",
      "*://*.thimothism/*",
      "*://*.otp/*",
      "*://*.tuidl/*",
      "*://*.hs/*",
      "*://*.hpls/*",
      "*://*.bank/*",
      "*://*.finance/*",
      "*://*.tuic/*",
      "*://*.tup/*",
      "*://*.hmtml/*"
    ]
  },
  ["blocking"]
);

// === Handle messages from popup ===
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
    return true;
  }

  if (request.action === "getStatus") {
    sendResponse({
      active: true,
      version: "2.0.0",
      resolver: "HDNS v1.0",
      tlds: Object.keys(TLD_MAP),
      loly: "compliant",
      cgt: "certified",
      hapc: "activated"
    });
  }

  if (request.action === "getTlds") {
    sendResponse({ tlds: Object.keys(TLD_MAP) });
  }
});

console.log("[HDNS v2.0] Sovereign DNS extension loaded — 15 TLDs — LOLY compliant — HAPC activated");
