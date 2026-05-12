import UIKit
import WebKit
import AuthenticationServices
import SafariServices

let iframeStorageSnapshotKeyPrefix = "__iframeStorageSnapshot__:"
let iframeStorageTargetHost = "x.cartridge.gg"

func createWebView(container: UIView, WKSMH: WKScriptMessageHandler, WKND: WKNavigationDelegate) -> WKWebView{

    let config = WKWebViewConfiguration()
    let userContentController = WKUserContentController()
    config.websiteDataStore = WKWebsiteDataStore.default()
    config.processPool = WebViewProcessPool.shared

    userContentController.add(WKSMH, name: "print")
    registerNotificationScriptMessageHandlers(on: userContentController, handler: WKSMH)
    if enableCartridgeIframeStorageRelay {
        userContentController.add(WKSMH, name: "cartridge-logout-cleanup")
    }
    if iframeStorageDebugEnabled {
        userContentController.add(WKSMH, name: "iframe-storage-debug-native")
    }

    config.userContentController = userContentController

    let topFrameStorageRelayScriptSource = """
    (function() {
      if (window.top !== window) return;
      var targetHost = "\(iframeStorageTargetHost)";
      var keyPrefix = "\(iframeStorageSnapshotKeyPrefix)";
      var debugEnabled = \(iframeStorageDebugEnabled ? "true" : "false");
      var authEventDispatchEnabled = \(dispatchCartridgeAuthChangedEvent ? "true" : "false");
      var panelId = "__iframe_storage_debug_panel__";
      var panelBodyId = "__iframe_storage_debug_panel_body__";
      var reopenButtonId = "__iframe_storage_debug_reopen__";
      var debugState = {
        startedAt: Date.now(),
        lastHost: targetHost,
        syncCount: 0,
        requestCount: 0,
        restoreCount: 0,
        lastSyncAt: 0,
        lastRequestAt: 0,
        lastRestoreAt: 0,
        lastSyncKeys: 0,
        lastSyncBytes: 0,
        lastRestoreKeys: 0,
        lastRestoreBytes: 0,
        lastIframeEvent: "-",
        lastIframeEventAt: 0,
        lastIframeEventDetail: ""
      };

      var normalizeHost = function(value) {
        if (!value || typeof value !== "string") return "";
        return value.toLowerCase();
      };

      var parseHostFromOrigin = function(origin) {
        if (!origin || origin === "null") return "";
        try {
          return new URL(origin).hostname.toLowerCase();
        } catch (_) {
          return "";
        }
      };

      var hostMatchesTarget = function(host) {
        return host === targetHost || host.endsWith("." + targetHost);
      };

      var snapshotMeta = function(snapshot) {
        if (!snapshot || typeof snapshot !== "object") return { keys: 0, bytes: 0 };
        try {
          var serialized = JSON.stringify(snapshot);
          return {
            keys: Object.keys(snapshot).length,
            bytes: serialized ? serialized.length : 0
          };
        } catch (_) {
          return { keys: 0, bytes: 0 };
        }
      };

      var hasOwn = function(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      };
      var safeJsonParse = function(value) {
        if (typeof value !== "string" || value.length === 0) return null;
        try {
          return JSON.parse(value);
        } catch (_) {
          return null;
        }
      };
      var parseSessionExpirySeconds = function(rawSessionValue) {
        var parsed = safeJsonParse(rawSessionValue);
        var expiresAt = parsed &&
          parsed.Session &&
          parsed.Session.session &&
          parsed.Session.session.inner &&
          parsed.Session.session.inner.expires_at;
        if (typeof expiresAt !== "string" || expiresAt.length === 0) return null;
        var value = null;
        if (/^0x[0-9a-f]+$/i.test(expiresAt)) {
          value = parseInt(expiresAt, 16);
        } else {
          value = parseInt(expiresAt, 10);
        }
        return Number.isFinite(value) ? value : null;
      };
      var dropAllCartridgeAccountSessionKeys = function(map) {
        if (!map || typeof map !== "object") return;
        Object.keys(map).forEach(function(key) {
          if (typeof key !== "string") return;
          if (key.indexOf("@cartridge/account/") === 0 ||
              key.indexOf("@cartridge/session/") === 0) {
            delete map[key];
          }
        });
      };
      var sanitizeTargetSnapshot = function(snapshot) {
        var normalized = {};
        if (!snapshot || typeof snapshot !== "object") return normalized;

        Object.keys(snapshot).forEach(function(key) {
          var value = snapshot[key];
          if (typeof value === "string") {
            normalized[key] = value;
          }
        });

        delete normalized["needs_session_creation"];
        delete normalized["last_pending_block_tx"];

        var activeKey = "@cartridge/active";
        if (!hasOwn(normalized, activeKey)) {
          // No active connection — treat as logged out and drop any orphaned
          // account/session keys so the controller cannot resurrect a session.
          dropAllCartridgeAccountSessionKeys(normalized);
          return normalized;
        }

        var parsedActive = safeJsonParse(normalized[activeKey]);
        var activeData = parsedActive && parsedActive.Active ? parsedActive.Active : null;
        var activeAddress = activeData && typeof activeData.address === "string" ? activeData.address.toLowerCase() : "";
        var activeChainId = activeData && typeof activeData.chain_id === "string" ? activeData.chain_id.toLowerCase() : "";
        if (!activeAddress || !activeChainId) {
          delete normalized[activeKey];
          dropAllCartridgeAccountSessionKeys(normalized);
          return normalized;
        }

        var accountKey = "@cartridge/account/" + activeAddress + "/" + activeChainId;
        var sessionKey = "@cartridge/session/" + activeAddress + "/" + activeChainId;
        var hasAccount = hasOwn(normalized, accountKey);
        var hasSession = hasOwn(normalized, sessionKey);
        var isSessionExpired = false;
        if (hasSession) {
          var expiresAt = parseSessionExpirySeconds(normalized[sessionKey]);
          if (typeof expiresAt === "number") {
            isSessionExpired = expiresAt <= Math.floor(Date.now() / 1000);
          }
        }

        if (!hasAccount || !hasSession || isSessionExpired) {
          delete normalized[activeKey];
          dropAllCartridgeAccountSessionKeys(normalized);
        }

        return normalized;
      };
      var clearTopConnectorHints = function() {
        var keys = ["lastUsedConnector", "wagmi.store", "wagmi.connected", "wagmi.wallet", "walletconnect"];
        keys.forEach(function(key) {
          try { localStorage.removeItem(key); } catch (_) {}
          try { sessionStorage.removeItem(key); } catch (_) {}
        });
      };
      var lastAuthEventState = null;
      var hasValidActiveSession = function(snapshot) {
        var activeKey = "@cartridge/active";
        if (!snapshot || typeof snapshot !== "object" || !hasOwn(snapshot, activeKey)) return false;

        var parsedActive = safeJsonParse(snapshot[activeKey]);
        var activeData = parsedActive && parsedActive.Active ? parsedActive.Active : null;
        var activeAddress = activeData && typeof activeData.address === "string" ? activeData.address.toLowerCase() : "";
        var activeChainId = activeData && typeof activeData.chain_id === "string" ? activeData.chain_id.toLowerCase() : "";
        if (!activeAddress || !activeChainId) return false;

        var accountKey = "@cartridge/account/" + activeAddress + "/" + activeChainId;
        var sessionKey = "@cartridge/session/" + activeAddress + "/" + activeChainId;
        if (!hasOwn(snapshot, accountKey) || !hasOwn(snapshot, sessionKey)) return false;
        var expiresAt = parseSessionExpirySeconds(snapshot[sessionKey]);
        return !(typeof expiresAt === "number" && expiresAt <= Math.floor(Date.now() / 1000));
      };
      var managedTopStoragePrefixes = ["@cartridge/"];
      var transientTopStorageKeys = ["needs_session_creation", "last_pending_block_tx"];
      var isManagedTopStorageKey = function(key) {
        if (typeof key !== "string" || key.length === 0) return false;
        if (transientTopStorageKeys.indexOf(key) >= 0) return true;
        for (var i = 0; i < managedTopStoragePrefixes.length; i += 1) {
          if (key.indexOf(managedTopStoragePrefixes[i]) === 0) return true;
        }
        return false;
      };
      var readTopStorageSnapshot = function() {
        var snapshot = {};
        try {
          for (var i = 0; i < localStorage.length; i += 1) {
            var key = localStorage.key(i);
            if (!isManagedTopStorageKey(key)) continue;
            var value = localStorage.getItem(key);
            if (typeof value === "string") {
              snapshot[key] = value;
            }
          }
        } catch (_) {}
        return snapshot;
      };
      var dispatchAuthChanged = function(snapshot, source) {
        if (!authEventDispatchEnabled) return;
        try {
          var authenticated = hasValidActiveSession(snapshot);
          var nextState = JSON.stringify({
            authenticated: authenticated,
            source: source || ""
          });
          if (nextState === lastAuthEventState) return;
          lastAuthEventState = nextState;
          window.dispatchEvent(new CustomEvent("cartridge:auth-changed", {
            detail: {
              authenticated: authenticated,
              source: source || "native-bridge"
            }
          }));
        } catch (_) {}
      };
      var applyTopStorageSnapshot = function(snapshot) {
        var sanitized = sanitizeTargetSnapshot(snapshot);
        var existingManagedKeys = [];
        try {
          for (var i = 0; i < localStorage.length; i += 1) {
            var key = localStorage.key(i);
            if (isManagedTopStorageKey(key)) {
              existingManagedKeys.push(key);
            }
          }
          existingManagedKeys.forEach(function(key) {
            if (!hasOwn(sanitized, key)) {
              localStorage.removeItem(key);
            }
          });
          Object.keys(sanitized).forEach(function(key) {
            localStorage.setItem(key, sanitized[key]);
          });
        } catch (_) {}

        if (!hasValidActiveSession(sanitized)) {
          clearTopConnectorHints();
        }
        dispatchAuthChanged(sanitized, "top-storage");
        return sanitized;
      };

      var readSnapshot = function(host) {
        try {
          var raw = localStorage.getItem(keyPrefix + host);
          if (!raw) return null;
          var parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") return null;
          return sanitizeTargetSnapshot(parsed);
        } catch (_) {
          return null;
        }
      };

      var writeSnapshot = function(host, snapshot) {
        if (!hostMatchesTarget(host)) return;
        if (!snapshot || typeof snapshot !== "object") return;
        try {
          var sanitized = sanitizeTargetSnapshot(snapshot);
          if (!hasValidActiveSession(sanitized)) {
            clearTopConnectorHints();
          }
          localStorage.setItem(keyPrefix + host, JSON.stringify(sanitized));
        } catch (_) {}
      };
      // Track connected state across syncs so we can force a reload when the
      // user transitions from connected to disconnected. The game's React SDK
      // caches its connection state in memory and doesn't react to
      // localStorage changes, so without a reload the "Connect" button never
      // reappears even though our storage is correctly cleared.
      var topRelayInitialized = false;
      var lastConnectedState = false;
      var logoutReloadScheduled = false;
      var triggerLogoutReloadIfNeeded = function(snapshot) {
        var nowConnected = hasValidActiveSession(snapshot);
        if (topRelayInitialized &&
            lastConnectedState &&
            !nowConnected &&
            !logoutReloadScheduled) {
          logoutReloadScheduled = true;
          // Ask native to wipe cartridge.gg cookies / IndexedDB / sessionStorage
          // before we reload. localStorage on its own is not enough on hosts
          // that share a cookie scope with x.cartridge.gg (e.g. any
          // *.cartridge.gg top frame), because the cartridge auth cookie
          // outlives our localStorage cleanup and the reload would otherwise
          // come back still authenticated.
          try {
            if (window.webkit && window.webkit.messageHandlers &&
                window.webkit.messageHandlers["cartridge-logout-cleanup"]) {
              window.webkit.messageHandlers["cartridge-logout-cleanup"].postMessage({});
            }
          } catch (_) {}
          // 250ms gives native enough time to finish the WKWebsiteDataStore
          // record fetch + removal before we tear the page down. The user
          // already perceives logout as instant; an extra 200ms is invisible.
          setTimeout(function() {
            try { window.location.reload(); } catch (_) {}
          }, 250);
        }
        lastConnectedState = nowConnected;
      };
      var topStorageSyncTimer = 0;
      var isSyncingTopStorage = false;
      var syncTopStorageToTargetSnapshot = function() {
        if (isSyncingTopStorage) return;
        isSyncingTopStorage = true;
        try {
          var healedSnapshot = applyTopStorageSnapshot(readTopStorageSnapshot());
          if (Object.keys(healedSnapshot).length === 0) {
            try { localStorage.removeItem(keyPrefix + targetHost); } catch (_) {}
          } else {
            writeSnapshot(targetHost, healedSnapshot);
          }
          triggerLogoutReloadIfNeeded(healedSnapshot);
        } finally {
          isSyncingTopStorage = false;
        }
      };
      var scheduleTopStorageSync = function() {
        if (isSyncingTopStorage || topStorageSyncTimer) return;
        topStorageSyncTimer = setTimeout(function() {
          topStorageSyncTimer = 0;
          syncTopStorageToTargetSnapshot();
        }, 0);
      };
      var installTopStorageHooks = function() {
        try {
          var originalSetItem = localStorage.setItem.bind(localStorage);
          var originalRemoveItem = localStorage.removeItem.bind(localStorage);
          var originalClear = localStorage.clear.bind(localStorage);

          localStorage.setItem = function(key, value) {
            originalSetItem(key, value);
            if (isManagedTopStorageKey(key)) scheduleTopStorageSync();
          };
          localStorage.removeItem = function(key) {
            originalRemoveItem(key);
            if (isManagedTopStorageKey(key)) scheduleTopStorageSync();
          };
          localStorage.clear = function() {
            originalClear();
            scheduleTopStorageSync();
          };
        } catch (_) {}
      };

      var formatTime = function(epochMs) {
        if (!epochMs) return "-";
        try {
          return new Date(epochMs).toLocaleTimeString();
        } catch (_) {
          return "-";
        }
      };

      var postNativeDebug = function(text) {
        if (!debugEnabled) return;
        try {
          var handlers = window.webkit && window.webkit.messageHandlers;
          var nativeHandler = handlers && handlers["iframe-storage-debug-native"];
          if (!nativeHandler || typeof nativeHandler.postMessage !== "function") return;
          nativeHandler.postMessage({ text: text || "" });
        } catch (_) {}
      };

      var ensurePanel = function() {
        if (!debugEnabled) return;
        if (document.getElementById(panelId)) return;
        var attachTarget = document.body || document.documentElement;
        if (!attachTarget) return;

        var root = document.createElement("div");
        root.id = panelId;
        root.style.position = "fixed";
        root.style.left = "8px";
        root.style.top = "56px";
        root.style.zIndex = "2147483647";
        root.style.maxWidth = "92vw";
        root.style.background = "rgba(32,0,0,0.92)";
        root.style.color = "#FFB6B6";
        root.style.border = "1px solid #B33A3A";
        root.style.borderRadius = "8px";
        root.style.padding = "8px";
        root.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";
        root.style.fontSize = "12px";
        root.style.lineHeight = "1.35";
        root.style.pointerEvents = "auto";
        root.style.boxShadow = "0 4px 18px rgba(0,0,0,0.45)";
        root.style.webkitUserSelect = "text";
        root.style.userSelect = "text";
        root.style.opacity = "1";

        var controls = document.createElement("div");
        controls.style.display = "flex";
        controls.style.gap = "6px";
        controls.style.marginBottom = "6px";

        var refresh = document.createElement("button");
        refresh.textContent = "Refresh";
        refresh.style.fontSize = "11px";
        refresh.onclick = function() { renderPanel(); };

        var clear = document.createElement("button");
        clear.textContent = "Clear Snapshot";
        clear.style.fontSize = "11px";
        clear.onclick = function() {
          var key = keyPrefix + (debugState.lastHost || targetHost);
          try { localStorage.removeItem(key); } catch (_) {}
          renderPanel();
        };

        var hide = document.createElement("button");
        hide.textContent = "Hide";
        hide.style.fontSize = "11px";
        hide.onclick = function() {
          root.style.display = "none";
          var reopen = document.getElementById(reopenButtonId);
          if (reopen) reopen.style.display = "block";
        };

        controls.appendChild(refresh);
        controls.appendChild(clear);
        controls.appendChild(hide);

        var body = document.createElement("pre");
        body.id = panelBodyId;
        body.style.margin = "0";
        body.style.whiteSpace = "pre-wrap";
        body.style.wordBreak = "break-word";

        root.appendChild(controls);
        root.appendChild(body);
        attachTarget.appendChild(root);

        var reopen = document.createElement("button");
        reopen.id = reopenButtonId;
        reopen.textContent = "Show Storage Debug";
        reopen.style.position = "fixed";
        reopen.style.left = "8px";
        reopen.style.top = "8px";
        reopen.style.zIndex = "2147483647";
        reopen.style.padding = "6px 8px";
        reopen.style.fontSize = "11px";
        reopen.style.display = "none";
        reopen.onclick = function() {
          root.style.display = "block";
          reopen.style.display = "none";
          renderPanel();
        };
        attachTarget.appendChild(reopen);
      };

      var renderPanel = function() {
        if (!debugEnabled) return;
        ensurePanel();
        var body = document.getElementById(panelBodyId);
        if (!body) return;

        var activeHost = debugState.lastHost || targetHost;
        var storedSnapshot = readSnapshot(activeHost);
        var storedMeta = snapshotMeta(storedSnapshot);
        var detail = debugState.lastIframeEventDetail;
        if (typeof detail !== "string") {
          try { detail = JSON.stringify(detail); } catch (_) { detail = String(detail); }
        }

        body.textContent = [
          "Iframe Storage Debug",
          "targetHost: " + targetHost,
          "activeHost: " + activeHost,
          "stored.keys: " + storedMeta.keys,
          "stored.bytes: " + storedMeta.bytes,
          "sync.count: " + debugState.syncCount + " @ " + formatTime(debugState.lastSyncAt),
          "sync.last: keys=" + debugState.lastSyncKeys + " bytes=" + debugState.lastSyncBytes,
          "request.count: " + debugState.requestCount + " @ " + formatTime(debugState.lastRequestAt),
          "restore.count: " + debugState.restoreCount + " @ " + formatTime(debugState.lastRestoreAt),
          "restore.last: keys=" + debugState.lastRestoreKeys + " bytes=" + debugState.lastRestoreBytes,
          "iframe.event: " + debugState.lastIframeEvent + " @ " + formatTime(debugState.lastIframeEventAt),
          "iframe.detail: " + (detail || "-")
        ].join("\\n");
        postNativeDebug(body.textContent);
      };

      var updateState = function(fields) {
        Object.keys(fields || {}).forEach(function(key) {
          debugState[key] = fields[key];
        });
        if (debugEnabled) renderPanel();
      };

      window.addEventListener("message", function(event) {
        var data = event.data;
        if (!data || typeof data !== "object") return;
        if (debugEnabled && data.type === "iframe-storage-debug") {
          var debugHost = normalizeHost(data.host) || parseHostFromOrigin(event.origin);
          if (!hostMatchesTarget(debugHost)) return;
          updateState({
            lastHost: debugHost,
            lastIframeEvent: data.event || "unknown",
            lastIframeEventAt: data.ts || Date.now(),
            lastIframeEventDetail: data.detail || ""
          });
          return;
        }
        if (data.type !== "iframe-storage-sync" && data.type !== "iframe-storage-request") return;

        var host = normalizeHost(data.host) || parseHostFromOrigin(event.origin);
        if (!hostMatchesTarget(host)) return;

        if (data.type === "iframe-storage-sync") {
          var sanitizedSnapshot = sanitizeTargetSnapshot(data.snapshot);
          writeSnapshot(host, sanitizedSnapshot);
          if (host === targetHost) {
            applyTopStorageSnapshot(sanitizedSnapshot);
            triggerLogoutReloadIfNeeded(sanitizedSnapshot);
          }
          var syncMeta = snapshotMeta(sanitizedSnapshot);
          updateState({
            lastHost: host,
            syncCount: debugState.syncCount + 1,
            lastSyncAt: Date.now(),
            lastSyncKeys: syncMeta.keys,
            lastSyncBytes: syncMeta.bytes
          });
          return;
        }

        updateState({
          lastHost: host,
          requestCount: debugState.requestCount + 1,
          lastRequestAt: Date.now()
        });
        var snapshot = readSnapshot(host);
        if ((!snapshot || typeof snapshot !== "object" || Object.keys(snapshot).length === 0) && host === targetHost) {
          snapshot = sanitizeTargetSnapshot(readTopStorageSnapshot());
        }
        if (!snapshot || typeof snapshot !== "object") {
          snapshot = {};
        }
        if (!event.source || typeof event.source.postMessage !== "function") return;
        try {
          event.source.postMessage({
            type: "iframe-storage-restore",
            host: host,
            snapshot: snapshot
          }, event.origin && event.origin !== "null" ? event.origin : "*");
          var restoreMeta = snapshotMeta(snapshot);
          updateState({
            restoreCount: debugState.restoreCount + 1,
            lastRestoreAt: Date.now(),
            lastRestoreKeys: restoreMeta.keys,
            lastRestoreBytes: restoreMeta.bytes
          });
        } catch (_) {}
      });

      if (debugEnabled) {
        document.addEventListener("DOMContentLoaded", renderPanel);
        window.addEventListener("load", renderPanel);
        setInterval(renderPanel, 1500);
      }
      syncTopStorageToTargetSnapshot();
      installTopStorageHooks();
      var initialSnapshot = readSnapshot(targetHost) || {};
      if (!hasValidActiveSession(initialSnapshot)) {
        clearTopConnectorHints();
      }
      // Now that the initial sync settled and lastConnectedState reflects the
      // page's starting state, future connect→disconnect transitions are
      // genuine logouts and should trigger a reload.
      lastConnectedState = hasValidActiveSession(initialSnapshot);
      topRelayInitialized = true;
      window.__iframeStorageDebugState = debugState;
      window.__showIframeStorageDebugPanel = function() {
        if (!debugEnabled) return;
        ensurePanel();
        var root = document.getElementById(panelId);
        var reopen = document.getElementById(reopenButtonId);
        if (root) root.style.display = "block";
        if (reopen) reopen.style.display = "none";
        renderPanel();
      };
    })();
    """
    if enableCartridgeIframeStorageRelay {
        let topFrameStorageRelayScript = WKUserScript(
            source: topFrameStorageRelayScriptSource,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        userContentController.addUserScript(topFrameStorageRelayScript)
    }

    let iframeStorageSnapshotScriptSource = """
    (function() {
      if (window.top === window) return;
      var targetHost = "\(iframeStorageTargetHost)";
      var debugEnabled = \(iframeStorageDebugEnabled ? "true" : "false");
      var host = (window.location && window.location.hostname ? window.location.hostname : "").toLowerCase();
      var hostMatchesTarget = host === targetHost || host.endsWith("." + targetHost);
      if (!host || !hostMatchesTarget) return;

      var emitDebug = function(eventName, detail) {
        if (!debugEnabled) return;
        try {
          if (window.top && window.top !== window) {
            window.top.postMessage({
              type: "iframe-storage-debug",
              host: host,
              event: eventName,
              ts: Date.now(),
              detail: detail || ""
            }, "*");
          }
        } catch (_) {}
      };

      var snapshotMeta = function(snapshot) {
        if (!snapshot || typeof snapshot !== "object") return { keys: 0, bytes: 0 };
        try {
          var serialized = JSON.stringify(snapshot);
          return { keys: Object.keys(snapshot).length, bytes: serialized ? serialized.length : 0 };
        } catch (_) {
          return { keys: 0, bytes: 0 };
        }
      };

      var managedPrefixes = ["@cartridge/"];
      var hasOwn = function(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      };
      var isManagedKey = function(key) {
        for (var i = 0; i < managedPrefixes.length; i += 1) {
          if (typeof key === "string" && key.indexOf(managedPrefixes[i]) === 0) return true;
        }
        return false;
      };
      var safeJsonParse = function(value) {
        if (typeof value !== "string" || value.length === 0) return null;
        try {
          return JSON.parse(value);
        } catch (_) {
          return null;
        }
      };
      var parseSessionExpirySeconds = function(rawSessionValue) {
        var parsed = safeJsonParse(rawSessionValue);
        var expiresAt = parsed &&
          parsed.Session &&
          parsed.Session.session &&
          parsed.Session.session.inner &&
          parsed.Session.session.inner.expires_at;
        if (typeof expiresAt !== "string" || expiresAt.length === 0) return null;
        var value = null;
        if (/^0x[0-9a-f]+$/i.test(expiresAt)) {
          value = parseInt(expiresAt, 16);
        } else {
          value = parseInt(expiresAt, 10);
        }
        return Number.isFinite(value) ? value : null;
      };
      var dropAllCartridgeAccountSessionKeys = function(map) {
        if (!map || typeof map !== "object") return;
        Object.keys(map).forEach(function(key) {
          if (typeof key !== "string") return;
          if (key.indexOf("@cartridge/account/") === 0 ||
              key.indexOf("@cartridge/session/") === 0) {
            delete map[key];
          }
        });
      };
      var sanitizeCartridgeSnapshot = function(snapshot) {
        var normalized = {};
        if (snapshot && typeof snapshot === "object") {
          Object.keys(snapshot).forEach(function(key) {
            var value = snapshot[key];
            if (typeof value === "string") {
              normalized[key] = value;
            }
          });
        }

        delete normalized["needs_session_creation"];
        delete normalized["last_pending_block_tx"];

        var activeKey = "@cartridge/active";
        if (!hasOwn(normalized, activeKey)) {
          // No active connection — treat as logged out and drop any orphaned
          // account/session keys so the controller cannot resurrect a session.
          dropAllCartridgeAccountSessionKeys(normalized);
          return normalized;
        }

        var parsedActive = safeJsonParse(normalized[activeKey]);
        var activeData = parsedActive && parsedActive.Active ? parsedActive.Active : null;
        var activeAddress = activeData && typeof activeData.address === "string" ? activeData.address.toLowerCase() : "";
        var activeChainId = activeData && typeof activeData.chain_id === "string" ? activeData.chain_id.toLowerCase() : "";
        if (!activeAddress || !activeChainId) {
          delete normalized[activeKey];
          dropAllCartridgeAccountSessionKeys(normalized);
          return normalized;
        }

        var accountKey = "@cartridge/account/" + activeAddress + "/" + activeChainId;
        var sessionKey = "@cartridge/session/" + activeAddress + "/" + activeChainId;
        var hasAccount = hasOwn(normalized, accountKey);
        var hasSession = hasOwn(normalized, sessionKey);
        var isSessionExpired = false;
        if (hasSession) {
          var expiresAt = parseSessionExpirySeconds(normalized[sessionKey]);
          if (typeof expiresAt === "number") {
            isSessionExpired = expiresAt <= Math.floor(Date.now() / 1000);
          }
        }

        if (!hasAccount || !hasSession || isSessionExpired) {
          delete normalized[activeKey];
          dropAllCartridgeAccountSessionKeys(normalized);
        }

        return normalized;
      };

      var applySnapshot = function(snapshot) {
        var normalizedSnapshot = sanitizeCartridgeSnapshot(snapshot);
        try {
          var existingKeys = [];
          for (var i = 0; i < localStorage.length; i += 1) {
            var existingKey = localStorage.key(i);
            if (existingKey !== null) {
              existingKeys.push(existingKey);
            }
          }

          existingKeys.forEach(function(key) {
            if (isManagedKey(key) && !hasOwn(normalizedSnapshot, key)) {
              localStorage.removeItem(key);
            }
          });

          Object.keys(normalizedSnapshot).forEach(function(key) {
            localStorage.setItem(key, normalizedSnapshot[key]);
          });
        } catch (_) {
          return;
        }
      };

      var readSnapshot = function() {
        try {
          var snapshot = {};
          for (var i = 0; i < localStorage.length; i += 1) {
            var key = localStorage.key(i);
            if (key !== null) {
              var value = localStorage.getItem(key);
              snapshot[key] = value === null ? "" : value;
            }
          }
          return snapshot;
        } catch (_) {
          return {};
        }
      };

      var syncSnapshotToTop = function(snapshot) {
        try {
          if (window.top && window.top !== window) {
            window.top.postMessage({
              type: "iframe-storage-sync",
              host: host,
              snapshot: snapshot && typeof snapshot === "object" ? snapshot : readSnapshot()
            }, "*");
          }
        } catch (_) {}
      };

      var requestRestoreFromTop = function() {
        try {
          if (window.top && window.top !== window) {
            window.top.postMessage({
              type: "iframe-storage-request",
              host: host
            }, "*");
          }
        } catch (_) {}
        emitDebug("restore-requested", "");
      };

      var hasRestoredFromTop = false;
      var allowSyncToTop = false;
      var lastSerializedSnapshot = null;
      var unblockSyncToTop = function() {
        if (allowSyncToTop) return;
        allowSyncToTop = true;
        setTimeout(syncIfChanged, 0);
      };
      var syncIfChanged = function() {
        if (!allowSyncToTop) return;
        try {
          var snapshot = sanitizeCartridgeSnapshot(readSnapshot());
          var serializedSnapshot = JSON.stringify(snapshot);
          if (serializedSnapshot === lastSerializedSnapshot) return;
          lastSerializedSnapshot = serializedSnapshot;
          syncSnapshotToTop(snapshot);
          emitDebug("sync-sent", snapshotMeta(snapshot));
        } catch (_) {}
      };

      var scheduleSync = function() { setTimeout(syncIfChanged, 0); };

      window.addEventListener("message", function(event) {
        var data = event.data;
        if (!data || typeof data !== "object") return;
        if (data.type !== "iframe-storage-restore") return;
        if ((data.host || "").toLowerCase() !== host) return;
        // Only honor the first restore. Duplicate restores from the initial
        // request burst can otherwise overwrite work done after the first
        // restore (e.g. a logout that just cleared local storage).
        if (hasRestoredFromTop) {
          emitDebug("restore-ignored-duplicate", snapshotMeta(data.snapshot || {}));
          return;
        }
        emitDebug("restore-received", snapshotMeta(data.snapshot || {}));
        applySnapshot(data.snapshot);
        hasRestoredFromTop = true;
        unblockSyncToTop();
      });

      emitDebug("iframe-script-loaded", host);
      requestRestoreFromTop();
      setTimeout(requestRestoreFromTop, 400);
      setTimeout(requestRestoreFromTop, 1200);
      setTimeout(function() {
        if (!hasRestoredFromTop) {
          emitDebug("restore-timeout", "using-local-snapshot");
          unblockSyncToTop();
        }
      }, 3200);
      setInterval(function() {
        if (!hasRestoredFromTop) requestRestoreFromTop();
      }, 2000);

      window.addEventListener("pagehide", syncIfChanged);
      window.addEventListener("beforeunload", syncIfChanged);
      document.addEventListener("visibilitychange", function() {
        if (document.hidden) syncIfChanged();
      });
      setInterval(syncIfChanged, 1500);

      try {
        var originalSetItem = localStorage.setItem.bind(localStorage);
        var originalRemoveItem = localStorage.removeItem.bind(localStorage);
        var originalClear = localStorage.clear.bind(localStorage);

        var purgeStaleAccountSessionKeys = function() {
          var staleKeys = [];
          try {
            for (var i = 0; i < localStorage.length; i += 1) {
              var k = localStorage.key(i);
              if (typeof k !== "string") continue;
              if (k.indexOf("@cartridge/account/") === 0 ||
                  k.indexOf("@cartridge/session/") === 0) {
                staleKeys.push(k);
              }
            }
          } catch (_) {}
          for (var j = 0; j < staleKeys.length; j += 1) {
            try { originalRemoveItem(staleKeys[j]); } catch (_) {}
          }
        };

        localStorage.setItem = function(key, value) {
          originalSetItem(key, value);
          scheduleSync();
        };
        localStorage.removeItem = function(key) {
          originalRemoveItem(key);
          // When the controller removes the active key, treat it as logout and
          // proactively wipe any account/session keys so a stale SDK in the
          // same iframe cannot rebuild an active session before the next sync.
          if (key === "@cartridge/active") {
            purgeStaleAccountSessionKeys();
          }
          scheduleSync();
        };
        localStorage.clear = function() {
          originalClear();
          scheduleSync();
        };
      } catch (_) {}
    })();
    """
    if enableCartridgeIframeStorageRelay {
        let iframeStorageSnapshotScript = WKUserScript(
            source: iframeStorageSnapshotScriptSource,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )
        userContentController.addUserScript(iframeStorageSnapshotScript)
    }

    // Request Storage Access inside iframes after a user gesture, so third-party
    // storage (cookies/localStorage) can persist for x.cartridge.gg.
    let storageAccessScriptSource = """
    (function() {
      if (typeof document === "undefined") return;
      if (!document.hasStorageAccess || !document.requestStorageAccess) return;
      if (window.top === window) return;
      var debugEnabled = \(iframeStorageDebugEnabled ? "true" : "false");
      var host = (window.location && window.location.hostname ? window.location.hostname : "").toLowerCase();
      var emitDebug = function(eventName, detail) {
        if (!debugEnabled) return;
        try {
          if (window.top && window.top !== window) {
            window.top.postMessage({
              type: "iframe-storage-debug",
              host: host,
              event: eventName,
              ts: Date.now(),
              detail: detail || ""
            }, "*");
          }
        } catch (_) {}
      };
      var requested = false;
      var requestAccess = function() {
        if (requested) return;
        requested = true;
        document.hasStorageAccess().then(function(hasAccess) {
          emitDebug("storage-access-before", { hasAccess: !!hasAccess });
          if (hasAccess) return;
          return document.requestStorageAccess().then(function() {
            emitDebug("storage-access-granted", "");
          }).catch(function(error) {
            requested = false;
            emitDebug("storage-access-denied", String(error && error.message ? error.message : error || "error"));
          });
        }).catch(function(error) {
          requested = false;
          emitDebug("storage-access-check-failed", String(error && error.message ? error.message : error || "error"));
        });
      };
      document.addEventListener("click", requestAccess, true);
      document.addEventListener("touchend", requestAccess, true);
    })();
    """
    if enableCartridgeIframeStorageRelay {
        let storageAccessScript = WKUserScript(
            source: storageAccessScriptSource,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )
        userContentController.addUserScript(storageAccessScript)
    }

    // Keep app-bound navigation disabled so injected scripts/evaluateJavaScript can run
    // on arbitrary top-level sites and third-party iframes.
    config.limitsNavigationsToAppBoundDomains = false
    config.allowsInlineMediaPlayback = true
    config.preferences.javaScriptCanOpenWindowsAutomatically = true
    config.preferences.setValue(true, forKey: "standalone")

    let webView = WKWebView(frame: calcWebviewFrame(webviewView: container, toolbarView: nil), configuration: config)
    setCustomCookie(webView: webView)

    webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    webView.isHidden = true;
    webView.navigationDelegate = WKND
    webView.scrollView.bounces = false
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    webView.allowsBackForwardNavigationGestures = true
    webView.isOpaque = false
    webView.backgroundColor = webViewBackgroundColor
    webView.scrollView.backgroundColor = webViewBackgroundColor

    // Check if macCatalyst 16.4+ is available and if so, enable web inspector.
    // This allows the web app to be inspected using Safari Web Inspector. Supported on iOS 16.4+ and macOS 13.3+
    if #available(iOS 16.4, macOS 13.3, *) {
        webView.isInspectable = true
    }

    let deviceModel = UIDevice.current.model
    let osVersion = UIDevice.current.systemVersion
    webView.configuration.applicationNameForUserAgent = "Safari/604.1"
    webView.customUserAgent = "Mozilla/5.0 (\(deviceModel); CPU \(deviceModel) OS \(osVersion.replacingOccurrences(of: ".", with: "_")) like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/\(osVersion) Mobile/15E148 Safari/604.1 PWAShell"

    #if DEBUG
    if #available(iOS 16.4, *) {
        webView.isInspectable = true
    }
    #endif

    return webView
}

final class WebViewProcessPool {
    static let shared = WKProcessPool()
    private init() {}
}

func setAppStoreAsReferrer(contentController: WKUserContentController) {
    let scriptSource = "document.referrer = `app-info://platform/ios-store`;"
    let script = WKUserScript(source: scriptSource, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
    contentController.addUserScript(script);
}

func setCustomCookie(webView: WKWebView) {
    let _platformCookie = HTTPCookie(properties: [
        .domain: rootUrl.host!,
        .path: "/",
        .name: platformCookie.name,
        .value: platformCookie.value,
        .secure: "FALSE",
        .expires: NSDate(timeIntervalSinceNow: 31556926)
    ])!

    webView.configuration.websiteDataStore.httpCookieStore.setCookie(_platformCookie)

}

// Wipe every WKWebsiteDataStore record whose registrable domain is cartridge.gg.
// Called from the JS relay when it detects a logout transition. The relay's
// localStorage cleanup is not enough on its own because cartridge.gg cookies
// (and any IndexedDB / sessionStorage state) live in the WKWebsiteDataStore
// independently of the localStorage we manage from JS, and they survive
// page reloads and even app restarts. The top frame shares the cartridge.gg
// cookie scope with the
// x.cartridge.gg iframe so the auth cookie outlived our localStorage wipe.
func clearCartridgeWebsiteData(completion: (() -> Void)? = nil) {
    let dataStore = WKWebsiteDataStore.default()
    let types: Set<String> = [
        WKWebsiteDataTypeCookies,
        WKWebsiteDataTypeLocalStorage,
        WKWebsiteDataTypeSessionStorage,
        WKWebsiteDataTypeIndexedDBDatabases,
    ]
    dataStore.fetchDataRecords(ofTypes: types) { records in
        let cartridgeRecords = records.filter { record in
            let name = record.displayName.lowercased()
            return name == "cartridge.gg" || name.hasSuffix(".cartridge.gg")
        }
        if cartridgeRecords.isEmpty {
            DispatchQueue.main.async { completion?() }
            return
        }
        dataStore.removeData(ofTypes: types, for: cartridgeRecords) {
            DispatchQueue.main.async { completion?() }
        }
    }
}

func calcWebviewFrame(webviewView: UIView, toolbarView: UIToolbar?) -> CGRect{
    if ((toolbarView) != nil) {
        return CGRect(x: 0, y: toolbarView!.frame.height, width: webviewView.frame.width, height: webviewView.frame.height - toolbarView!.frame.height)
    }
    else {
        let winScene = UIApplication.shared.connectedScenes.first
        let windowScene = winScene as! UIWindowScene
        var statusBarHeight = windowScene.statusBarManager?.statusBarFrame.height ?? 0

        switch displayMode {
        case "fullscreen":
            #if targetEnvironment(macCatalyst)
                if let titlebar = windowScene.titlebar {
                    titlebar.titleVisibility = .hidden
                    titlebar.toolbar = nil
                }
            #endif
            return CGRect(x: 0, y: 0, width: webviewView.frame.width, height: webviewView.frame.height)
        default:
            #if targetEnvironment(macCatalyst)
            statusBarHeight = 29
            #endif
            let windowHeight = webviewView.frame.height - statusBarHeight
            return CGRect(x: 0, y: statusBarHeight, width: webviewView.frame.width, height: windowHeight)
        }
    }
}

private func hostMatchesAllowedOrigin(_ requestHost: String, origin: String) -> Bool {
    let normalizedHost = requestHost.lowercased()
    let normalizedOrigin = origin.lowercased()
    return normalizedHost == normalizedOrigin || normalizedHost.hasSuffix(".\(normalizedOrigin)")
}

extension ViewController: WKUIDelegate, WKDownloadDelegate {
    // redirect new tabs to main webview
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if (navigationAction.targetFrame == nil) {
            webView.load(navigationAction.request)
        }
        return nil
    }
    // restrict navigation to target host, open external links in 3rd party apps
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if (navigationAction.request.url?.scheme == "about") {
            return decisionHandler(.allow)
        }
        if (navigationAction.shouldPerformDownload || navigationAction.request.url?.scheme == "blob") {
            return decisionHandler(.download)
        }

        if let requestUrl = navigationAction.request.url{
            if let requestHost = requestUrl.host {
                // NOTE: Match auth origin first, because host origin may be a subset of auth origin and may therefore always match
                let matchingAuthOrigin = authOrigins.first(where: {
                    hostMatchesAllowedOrigin(requestHost, origin: $0)
                })
                if (matchingAuthOrigin != nil) {
                    let isTopLevelNavigation = navigationAction.targetFrame == nil || (navigationAction.targetFrame?.isMainFrame ?? false)
                    if (openAuthOriginsInSafariView && isTopLevelNavigation) {
                        decisionHandler(.cancel)
                        if (UIApplication.shared.canOpenURL(requestUrl)) {
                            UIApplication.shared.open(requestUrl)
                        }
                        return
                    }

                    decisionHandler(.allow)
                    if (toolbarView.isHidden) {
                        toolbarView.isHidden = false
                        webView.frame = calcWebviewFrame(webviewView: webviewView, toolbarView: toolbarView)
                    }
                    return
                }

                let matchingHostOrigin = allowedOrigins.first(where: {
                    hostMatchesAllowedOrigin(requestHost, origin: $0)
                })
                if (matchingHostOrigin != nil) {
                    // Open in main webview
                    decisionHandler(.allow)
                    if (!toolbarView.isHidden) {
                        toolbarView.isHidden = true
                        webView.frame = calcWebviewFrame(webviewView: webviewView, toolbarView: nil)
                    }
                    return
                }
                let syntheticClickType = navigationAction.value(forKey: "syntheticClickType") as? Int
                if (navigationAction.navigationType == .other &&
                    syntheticClickType == 0 &&
                    (navigationAction.targetFrame != nil)
                ) {
                    decisionHandler(.allow)
                    return
                }
                else {
                    decisionHandler(.cancel)
                }
                if opensExternalLinksInSafariView,
                   ["http", "https"].contains(requestUrl.scheme?.lowercased() ?? "") {
                    let safariViewController = SFSafariViewController(url: requestUrl)
                    self.present(safariViewController, animated: true, completion: nil)
                } else if (UIApplication.shared.canOpenURL(requestUrl)) {
                    UIApplication.shared.open(requestUrl)
                }
            } else {
                decisionHandler(.cancel)
                if (navigationAction.request.url?.scheme == "tel" || navigationAction.request.url?.scheme == "mailto" ){
                    if (UIApplication.shared.canOpenURL(requestUrl)) {
                        UIApplication.shared.open(requestUrl)
                    }
                }
                else {
                    if requestUrl.isFileURL {
                        // not tested
                        downloadAndOpenFile(url: requestUrl.absoluteURL)
                    }
                    // if (requestUrl.absoluteString.contains("base64")){
                    //     downloadAndOpenBase64File(base64String: requestUrl.absoluteString)
                    // }
                }
            }
        }
        else {
            decisionHandler(.cancel)
        }

    }
    // Handle javascript: `window.alert(message: String)`
    func webView(_ webView: WKWebView,
        runJavaScriptAlertPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping () -> Void) {

        // Set the message as the UIAlertController message
        let alert = UIAlertController(
            title: nil,
            message: message,
            preferredStyle: .alert
        )

        // Add a confirmation action “OK”
        let okAction = UIAlertAction(
            title: "OK",
            style: .default,
            handler: { _ in
                // Call completionHandler
                completionHandler()
            }
        )
        alert.addAction(okAction)

        // Display the NSAlert
        present(alert, animated: true, completion: nil)
    }
    // Handle javascript: `window.confirm(message: String)`
    func webView(_ webView: WKWebView,
        runJavaScriptConfirmPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (Bool) -> Void) {

        // Set the message as the UIAlertController message
        let alert = UIAlertController(
            title: nil,
            message: message,
            preferredStyle: .alert
        )

        // Add a confirmation action “Cancel”
        let cancelAction = UIAlertAction(
            title: "Cancel",
            style: .cancel,
            handler: { _ in
                // Call completionHandler
                completionHandler(false)
            }
        )

        // Add a confirmation action “OK”
        let okAction = UIAlertAction(
            title: "OK",
            style: .default,
            handler: { _ in
                // Call completionHandler
                completionHandler(true)
            }
        )
        alert.addAction(cancelAction)
        alert.addAction(okAction)

        // Display the NSAlert
        present(alert, animated: true, completion: nil)
    }
    // Handle javascript: `window.prompt(prompt: String, defaultText: String?)`
    func webView(_ webView: WKWebView,
        runJavaScriptTextInputPanelWithPrompt prompt: String,
        defaultText: String?,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (String?) -> Void) {

        // Set the message as the UIAlertController message
        let alert = UIAlertController(
            title: nil,
            message: prompt,
            preferredStyle: .alert
        )

        // Add a confirmation action “Cancel”
        let cancelAction = UIAlertAction(
            title: "Cancel",
            style: .cancel,
            handler: { _ in
                // Call completionHandler
                completionHandler(nil)
            }
        )

        // Add a confirmation action “OK”
        let okAction = UIAlertAction(
            title: "OK",
            style: .default,
            handler: { _ in
                // Call completionHandler with Alert input
                if let input = alert.textFields?.first?.text {
                    completionHandler(input)
                }
            }
        )

        alert.addTextField { textField in
            textField.placeholder = defaultText
        }
        alert.addAction(cancelAction)
        alert.addAction(okAction)

        // Display the NSAlert
        present(alert, animated: true, completion: nil)
    }

    func downloadAndOpenFile(url: URL){

        let destinationFileUrl = url
        let sessionConfig = URLSessionConfiguration.default
        let session = URLSession(configuration: sessionConfig)
        let request = URLRequest(url:url)
        let task = session.downloadTask(with: request) { (tempLocalUrl, response, error) in
            if let tempLocalUrl = tempLocalUrl, error == nil {
                if let statusCode = (response as? HTTPURLResponse)?.statusCode {
                    print("Successfully download. Status code: \(statusCode)")
                }
                do {
                    try FileManager.default.copyItem(at: tempLocalUrl, to: destinationFileUrl)
                    self.openFile(url: destinationFileUrl)
                } catch (let writeError) {
                    print("Error creating a file \(destinationFileUrl) : \(writeError)")
                }
            } else {
                print("Error took place while downloading a file. Error description: \(error?.localizedDescription ?? "N/A") ")
            }
        }
        task.resume()
    }

    // func downloadAndOpenBase64File(base64String: String) {
    //     // Split the base64 string to extract the data and the file extension
    //     let components = base64String.components(separatedBy: ";base64,")

    //     // Make sure the base64 string has the correct format
    //     guard components.count == 2, let format = components.first?.split(separator: "/").last else {
    //         print("Invalid base64 string format")
    //         return
    //     }

    //     // Remove the data type prefix to get the base64 data
    //     let dataString = components.last!

    //     if let imageData = Data(base64Encoded: dataString) {
    //         let documentsUrl: URL  =  FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    //         let destinationFileUrl = documentsUrl.appendingPathComponent("image.\(format)")

    //         do {
    //             try imageData.write(to: destinationFileUrl)
    //             self.openFile(url: destinationFileUrl)
    //         } catch {
    //             print("Error writing image to file url: \(destinationFileUrl): \(error)")
    //         }
    //     }
    // }

    func openFile(url: URL) {
        self.documentController = UIDocumentInteractionController(url: url)
        self.documentController?.delegate = self
        self.documentController?.presentPreview(animated: true)
    }

    func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) {
        download.delegate = self
    }

    func download(_ download: WKDownload, decideDestinationUsing response: URLResponse,
                suggestedFilename: String,
                completionHandler: @escaping (URL?) -> Void) {

        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsPath.appendingPathComponent(suggestedFilename)

        // Remove existing file if it exists, otherwise it may show an old file/content just by having the same name.
        if FileManager.default.fileExists(atPath: fileURL.path) {
            try? FileManager.default.removeItem(at: fileURL)
        }

        self.openFile(url: fileURL)
        completionHandler(fileURL)
    }
}
