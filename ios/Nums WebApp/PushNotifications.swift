import CartridgeIOSKit
import Foundation
import WebKit

private let notificationAPIURL: URL = {
    if let value = Bundle.main.object(forInfoDictionaryKey: "NotificationAPIURL") as? String,
       let url = URL(string: value) {
        return url
    }
    return URL(string: "https://api.cartridge.gg/query")!
}()

private let notificationBridge = CartridgeNotificationBridge(
    configuration: CartridgeNotificationConfiguration(
        appID: "nums",
        apiURL: notificationAPIURL,
        errorDomain: "NumsNotifications"
    ),
    webViewProvider: { currentAppWebView() }
)

func registerNotificationScriptMessageHandlers(
    on userContentController: WKUserContentController,
    handler: WKScriptMessageHandler
) {
    notificationBridge.registerScriptMessageHandlers(on: userContentController, handler: handler)
}

func triggerNotificationRegistrationCheck(in webView: WKWebView) {
    notificationBridge.triggerSessionCheck(in: webView)
}

func handleSubscribeTouch(message: WKScriptMessage) {
    notificationBridge.handleSubscribe(message: message)
}

func handlePushPermission() {
    notificationBridge.handlePushPermission()
}

func handlePushState() {
    notificationBridge.handlePushState()
}

func handlePushTokenRequest() {
    notificationBridge.handlePushTokenRequest()
}

func handleNotificationSessionReady() {
    notificationBridge.handleNotificationSessionReady()
}

func setAPNSToken(_ deviceToken: Data) {
    notificationBridge.setAPNSToken(deviceToken)
}

func disableRegisteredNotificationDevice(completion: (() -> Void)? = nil) {
    notificationBridge.disableRegisteredNotificationDevice(completion: completion)
}

func sendPushToWebView(userInfo: [AnyHashable: Any]) {
    notificationBridge.sendPushToWebView(userInfo: userInfo)
}

func sendPushClickToWebView(userInfo: [AnyHashable: Any]) {
    notificationBridge.sendPushClickToWebView(userInfo: userInfo)
}
