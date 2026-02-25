
(function () {
  // ================================
  // Configuration (Injected by Backend)
  // ================================
  const APP_ID = window.__APP_ID__ || "unknown";

  // Backend endpoint (optional)
  const API_BASE = window.__API_BASE__ || null;

  // PostHog config (must be injected)
  const POSTHOG_KEY = window.__POSTHOG_KEY__ || null;
  const POSTHOG_HOST =
    window.__POSTHOG_HOST__ || "https://app.posthog.com";

  // ================================
  // Generate/Get User ID (Persistent)
  // ================================
  let userId = localStorage.getItem("analytics_user_id");

  if (!userId) {
    userId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("analytics_user_id", userId);
  }

  // ================================
  // Generate/Get Session ID (Per Tab)
  // ================================
  let sessionId = sessionStorage.getItem("analytics_session_id");

  if (!sessionId) {
    sessionId = "session_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("analytics_session_id", sessionId);
  }

  const sessionStart = Date.now();

  // ================================
  // Initialize PostHog
  // ================================
  if (POSTHOG_KEY) {
    (function (t, e) {
      var o, n, p, r;
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
          function g(t, e) {
            var o = e.split(".");
            2 == o.length && ((t = t[o[0]]), (e = o[1]));
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          ((p = t.createElement("script")).type = "text/javascript"),
            (p.async = !0),
            (p.src = s.api_host + "/static/array.js"),
            (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(
              p,
              r
            );
          var u = e;
          a !== undefined ? (u = e[a] = []) : (a = "posthog");
          u.people = u.people || [];
          u.toString = function (t) {
            var e = "posthog";
            return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
          };
          u.people.toString = function () {
            return u.toString(1) + ".people (stub)";
          };
          o =
            "capture identify alias people.set people.set_once people.unset reset".split(
              " "
            );
          for (n = 0; n < o.length; n++) g(u, o[n]);
          e._i.push([i, s, a]);
        }),
        e.__SV = 1);
    })(document, window.posthog || []);

    // Init PostHog
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,

      // Enable session replay + heatmaps
      session_recording: {
        maskAllInputs: true,
      },
    });

    // Identify user inside PostHog
    posthog.identify(userId, {
      app_id: APP_ID,
      session_id: sessionId,
    });

    console.log("✅ PostHog initialized");
  } else {
    console.warn("⚠️ PostHog key missing. Analytics running in fallback mode.");
  }

  // ================================
  // Track Event Function
  // ================================
  function track(type, payload = {}) {
    const eventData = {
      app_id: APP_ID,
      user_id: userId,
      session_id: sessionId,
      ...payload,
    };

    // 1. Send event to PostHog
    if (POSTHOG_KEY) {
      posthog.capture(type, eventData);
    }

    // 2. (Optional) Send event to your backend
    if (API_BASE) {
      const backendEvent = {
        app_id: APP_ID,
        user_id: userId,
        session_id: sessionId,
        type: type,
        payload: payload,
        ts: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      };

      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(backendEvent)], {
          type: "application/json",
        });
        navigator.sendBeacon(API_BASE + "/analytics/event", blob);
      } else {
        fetch(API_BASE + "/analytics/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backendEvent),
          keepalive: true,
        }).catch((err) => console.warn("Analytics backend error:", err));
      }
    }
  }

  // ================================
  // Automatic Tracking
  // ================================

  // Page View
  track("page_view", {
    path: location.pathname,
    title: document.title,
    screen: screen.width + "x" + screen.height,
  });

  // Session Start
  track("session_start");

  // Session End
  window.addEventListener("beforeunload", function () {
    track("session_end", {
      duration: Date.now() - sessionStart,
    });
  });

  // JavaScript Errors
  window.addEventListener("error", function (e) {
    track("error", {
      message: e.message,
      filename: e.filename,
      line: e.lineno,
      column: e.colno,
    });
  });

  // Click Tracking
  document.addEventListener("click", function (e) {
    const target = e.target.closest("a, button");
    if (target) {
      track("click", {
        tag: target.tagName,
        text: target.textContent.substring(0, 100),
        href: target.href || null,
      });
    }
  });

  // Form Submissions
  document.addEventListener("submit", function (e) {
    const form = e.target;
    track("form_submit", {
      form_name:
        form.getAttribute("name") ||
        form.getAttribute("id") ||
        "unnamed",
      form_action: form.action,
    });
  });

  // ================================
  // Public API (Custom Events)
  // ================================
  window.trackEvent = track;

  console.log("📊 Analytics initialized");
  console.log("   App ID:", APP_ID);
  console.log("   User ID:", userId);
  console.log("   Session ID:", sessionId);
})();
