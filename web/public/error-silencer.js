/**
 * Veil error silencer — runs before any React hydration.
 *
 * Filters known noisy errors from third-party Web3 SDKs (Reown, Coinbase
 * Wallet) that have no impact on Veil's functionality but pollute the dev
 * experience with Next.js's error overlay modal.
 *
 * Loaded via <Script strategy="beforeInteractive"> in app/layout.tsx so
 * the handlers are registered before any other JS runs.
 *
 * Why we need this script (vs just a React component): the SDK in question
 * emits errors from an internal EventEmitter — by the time a React effect
 * mounts, Next has already captured the error and queued the overlay.
 */
(function () {
  if (typeof window === "undefined") return;

  var SILENCED = [
    "Connection interrupted while trying to subscribe",
    "Cross-Origin-Opener-Policy",
    "Failed to fetch remote project configuration",
    "Reown Config",
    "@base-org/account",
    "@reown/",
  ];

  function isSilenced(msg) {
    if (msg == null) return false;
    if (typeof msg !== "string") {
      try {
        msg = String(msg && msg.message ? msg.message : msg);
      } catch (_) {
        return false;
      }
    }
    for (var i = 0; i < SILENCED.length; i++) {
      if (msg.indexOf(SILENCED[i]) !== -1) return true;
    }
    return false;
  }

  // Capture phase listeners — fire before Next's overlay handlers
  window.addEventListener(
    "error",
    function (e) {
      if (isSilenced(e.message) || isSilenced(e.error)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );

  window.addEventListener(
    "unhandledrejection",
    function (e) {
      var msg = e.reason && (e.reason.message || e.reason);
      if (isSilenced(msg)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );

  // Next 16's error overlay also subscribes to console.error
  var origConsoleError = console.error;
  console.error = function () {
    for (var i = 0; i < arguments.length; i++) {
      if (isSilenced(arguments[i])) return;
    }
    return origConsoleError.apply(console, arguments);
  };
})();
