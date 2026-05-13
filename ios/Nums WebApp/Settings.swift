import UIKit
import WebKit

struct Cookie {
    var name: String
    var value: String
}

// URL for first launch
let rootUrl = URL(string: "https://mobile.nums.gg")!

// allowed origin is for what we are sticking to pwa domain
// This should also appear in Info.plist
let allowedOrigins: [String] = ["mobile.nums.gg", "cartridge.gg", "x.cartridge.gg"]

// auth origins will open in modal and show toolbar for back into the main origin.
// These should also appear in Info.plist
let authOrigins: [String] = []
// allowedOrigins + authOrigins <= 10
let openAuthOriginsInSafariView = false

let platformCookie = Cookie(name: "app-platform", value: "iOS App Store")

// UI options
let displayMode = "standalone" // standalone / fullscreen.
let adaptiveUIStyle = true     // iOS 15+ only. Change app theme on the fly to dark/light related to WebView background color.
let overrideStatusBar = false   // iOS 13-14 only. if you don't support dark/light system theme.
let statusBarTheme = "dark"    // dark / light, related to override option.
let pullToRefresh = true    // Enable/disable pull down to refresh page
let webViewBackgroundColor = UIColor(red: 73/255, green: 25/255, blue: 208/255, alpha: 1)
let enableCartridgeIframeStorageRelay = true
let dispatchCartridgeAuthChangedEvent = false
let iframeStorageDebugEnabled = false
let opensExternalLinksInSafariView = false

func currentAppWebView() -> WKWebView? {
    appWebView
}

func resolvedWebViewURL(_ url: URL) -> URL {
    url
}
