const ALLOWED_SCRIPT_DOMAINS = [
  "cdn.lordicon.com",
  "cdn.jsdelivr.net",
  "www.google.com",
  "www.gstatic.com",
  "www.googletagmanager.com",
];

export const loadScript = (id, src) => {
  if (typeof window === "undefined") return;

  try {
    const url = new URL(src);
    if (!ALLOWED_SCRIPT_DOMAINS.includes(url.hostname)) {
      console.warn(`[loadScript] Blocked script from disallowed domain: ${url.hostname}`);
      return;
    }
  } catch {
    console.warn(`[loadScript] Invalid script URL: ${src}`);
    return;
  }

  if (!document.getElementById(id)) {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }
};
