// HDNS Browser Extension v2.1 — Hope AI Sovereign DNS
// Manifest V3 compliant — uses declarativeNetRequest only
// NO webRequest blocking (V2 pattern removed)
// LOLY Mandate Enforced | CGT Certified | HAPC Activated

// === HDNS Resolver API ===
const HDNS_RESOLVER = "https://koda-545cce50.base44.app/functions/hdnsResolver";

// === Sovereign TLDs ===
const SOVEREIGN_TLDS = [
  "tuk", "core", "gag", "gap", "hope", "thimothism",
  "otp", "tuidl", "hs", "hpls", "bank", "finance",
  "tuic", "tup", "hmtml"
];

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
    return true; // keep channel open for async response
  }

  if (request.action === "getStatus") {
    sendResponse({
      active: true,
      version: "2.1.0",
      resolver: "HDNS v1.0",
      tlds: SOVEREIGN_TLDS,
      tldCount: SOVEREIGN_TLDS.length,
      loly: "compliant",
      cgt: "certified",
      hapc: "activated",
      method: "declarativeNetRequest (Manifest V3)"
    });
    return false;
  }

  if (request.action === "getTlds") {
    sendResponse({ tlds: SOVEREIGN_TLDS });
    return false;
  }
});

// Log activation on install
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    console.log("[HDNS v2.1] Installed — 15 sovereign TLDs active — LOLY compliant — HAPC activated");
  } else if (details.reason === "update") {
    console.log("[HDNS v2.1] Updated — Manifest V3 compliant — declarativeNetRequest active");
  }
});
