import UIKit
import UserNotifications
import WebKit

private let notificationAppID = "nums"
private let notificationAPIURL: URL = {
    if let value = Bundle.main.object(forInfoDictionaryKey: "NotificationAPIURL") as? String,
       let url = URL(string: value) {
        return url
    }
    return URL(string: "https://api.cartridge.gg/query")!
}()
private let notificationDeviceIDDefaultsKey = "nums.notificationDeviceID"

private var apnsDeviceToken: String?
private var notificationRegistrationInFlight = false
private var notificationRegistrationQueued = false
private var notificationSessionReadyHandled = false

class SubscribeMessage {
    var topic  = ""
    var eventValue = ""
    var unsubscribe = false
    struct Keys {
        static var TOPIC = "topic"
        static var UNSUBSCRIBE = "unsubscribe"
        static var EVENTVALUE = "eventValue"
    }
    convenience init(dict: Dictionary<String,Any>) {
        self.init()
        if let topic = dict[Keys.TOPIC] as? String {
            self.topic = topic
        }
        if let unsubscribe = dict[Keys.UNSUBSCRIBE] as? Bool {
            self.unsubscribe = unsubscribe
        }
        if let eventValue = dict[Keys.EVENTVALUE] as? String {
            self.eventValue = eventValue
        }
    }
}

func handleSubscribeTouch(message: WKScriptMessage) {
  // [START subscribe_topic]
    let subscribeMessages = parseSubscribeMessage(message: message)
    if (subscribeMessages.count > 0){
        let _message = subscribeMessages[0]
        let action = _message.unsubscribe ? "unsubscribe" : "subscribe"
        print("Push topic \(action) requested for '\(_message.topic)', but Firebase is not configured.")
    }


  // [END subscribe_topic]
}

func parseSubscribeMessage(message: WKScriptMessage) -> [SubscribeMessage] {
    var subscribeMessages = [SubscribeMessage]()
    if let objStr = message.body as? String {

        let data: Data = objStr.data(using: .utf8)!
        do {
            let jsObj = try JSONSerialization.jsonObject(with: data, options: .init(rawValue: 0))
            if let jsonObjDict = jsObj as? Dictionary<String, Any> {
                let subscribeMessage = SubscribeMessage(dict: jsonObjDict)
                subscribeMessages.append(subscribeMessage)
            } else if let jsonArr = jsObj as? [Dictionary<String, Any>] {
                for jsonObj in jsonArr {
                    let sMessage = SubscribeMessage(dict: jsonObj)
                    subscribeMessages.append(sMessage)
                }
            }
        } catch _ {

        }
    }
    return subscribeMessages
}

func returnPermissionResult(isGranted: Bool){
    DispatchQueue.main.async(execute: {
        guard let webView = currentAppWebView() else { return }
        if (isGranted){
            webView.evaluateJavaScript("this.dispatchEvent(new CustomEvent('push-permission-request', { detail: 'granted' }))")
        }
        else {
            webView.evaluateJavaScript("this.dispatchEvent(new CustomEvent('push-permission-request', { detail: 'denied' }))")
        }
    })
}
func returnPermissionState(state: String){
    DispatchQueue.main.async(execute: {
        currentAppWebView()?.evaluateJavaScript("this.dispatchEvent(new CustomEvent('push-permission-state', { detail: '\(state)' }))")
    })
}

func handlePushPermission() {
    UNUserNotificationCenter.current().getNotificationSettings () { settings in
            switch settings.authorizationStatus {
            case .notDetermined:
                let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
                UNUserNotificationCenter.current().requestAuthorization(
                    options: authOptions,
                    completionHandler: { (success, error) in
                        if error == nil {
                            if success == true {
                                returnPermissionResult(isGranted: true)
                                DispatchQueue.main.async {
                                  UIApplication.shared.registerForRemoteNotifications()
                                }
                            }
                            else {
                                returnPermissionResult(isGranted: false)
                            }
                        }
                        else {
                            returnPermissionResult(isGranted: false)
                        }
                    }
                )
            case .denied:
                returnPermissionResult(isGranted: false)
            case .authorized, .ephemeral, .provisional:
                returnPermissionResult(isGranted: true)
            @unknown default:
                return;
            }
        }
}
func handlePushState() {
    UNUserNotificationCenter.current().getNotificationSettings () { settings in
        switch settings.authorizationStatus {
        case .notDetermined:
            returnPermissionState(state: "notDetermined")
        case .denied:
            returnPermissionState(state: "denied")
        case .authorized:
            returnPermissionState(state: "authorized")
        case .ephemeral:
            returnPermissionState(state: "ephemeral")
        case .provisional:
            returnPermissionState(state: "provisional")
        @unknown default:
            returnPermissionState(state: "unknown")
            return;
        }
    }
}

func checkViewAndEvaluate(event: String, detail: String) {
    if let webView = currentAppWebView(), !webView.isHidden && !webView.isLoading {
        DispatchQueue.main.async(execute: {
            webView.evaluateJavaScript("window.dispatchEvent(new CustomEvent(\(jsonStringLiteral(event)), { detail: \(detail) }))")
        })
    }
    else {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            checkViewAndEvaluate(event: event, detail: detail)
        }
    }
}

func handlePushTokenRequest(){
    DispatchQueue.main.async(execute: {
        if let token = apnsDeviceToken {
            checkViewAndEvaluate(event: "push-token", detail: jsonStringLiteral(token))
            registerNotificationDeviceIfPossible()
            return
        }

        UIApplication.shared.registerForRemoteNotifications()
        checkViewAndEvaluate(event: "push-token", detail: "null")
    })
}

func handleNotificationSessionReady() {
    print("Notification session ready signal received")
    if notificationSessionReadyHandled {
        registerNotificationDeviceIfPossible()
        return
    }
    notificationSessionReadyHandled = true

    UNUserNotificationCenter.current().getNotificationSettings { settings in
        print("Notification authorization status: \(settings.authorizationStatus.rawValue)")
        switch settings.authorizationStatus {
        case .notDetermined:
            let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
            UNUserNotificationCenter.current().requestAuthorization(options: authOptions) { granted, error in
                if let error = error {
                    print("Notification authorization failed: \(error.localizedDescription)")
                }
                guard granted else {
                    print("Notification authorization was not granted")
                    return
                }
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        case .authorized, .ephemeral, .provisional:
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
                registerNotificationDeviceIfPossible()
            }
        case .denied:
            print("Notification authorization denied in Settings")
            return
        @unknown default:
            print("Notification authorization status is unknown")
            return
        }
    }
}

func setAPNSToken(_ deviceToken: Data) {
    apnsDeviceToken = deviceToken.map { String(format: "%02x", $0) }.joined()
    print("APNs token received")
    registerNotificationDeviceIfPossible()

    if let token = apnsDeviceToken {
        checkViewAndEvaluate(event: "push-token", detail: jsonStringLiteral(token))
    }
}

func disableRegisteredNotificationDevice(completion: (() -> Void)? = nil) {
    guard let deviceID = UserDefaults.standard.string(forKey: notificationDeviceIDDefaultsKey), !deviceID.isEmpty else {
        completion?()
        return
    }

    performNotificationGraphQLRequest(
        query: """
        mutation DisableNotificationDevice($id: ID!) {
          disableNotificationDevice(id: $id)
        }
        """,
        variables: ["id": deviceID]
    ) { _, error in
        if let error = error {
            print("Failed to disable notification device: \(error.localizedDescription)")
        }
        UserDefaults.standard.removeObject(forKey: notificationDeviceIDDefaultsKey)
        completion?()
    }
}

private func registerNotificationDeviceIfPossible() {
    guard let token = apnsDeviceToken, !token.isEmpty else {
        print("Notification registration waiting for APNs token")
        return
    }
    guard isValidAPNSToken(token) else {
        print("Notification registration skipped: invalid APNs token")
        return
    }

    if notificationRegistrationInFlight {
        notificationRegistrationQueued = true
        return
    }

    notificationRegistrationInFlight = true
    print("Registering notification device with APNs provider")
    performNotificationGraphQLRequest(
        query: """
        mutation RegisterNotificationDevice($input: RegisterNotificationDeviceInput!) {
          registerNotificationDevice(input: $input) {
            id
          }
        }
        """,
        variables: [
            "input": [
                "appId": notificationAppID,
                "platform": "IOS",
                "provider": "APNS",
                "token": token,
            ],
        ]
    ) { json, error in
        notificationRegistrationInFlight = false

        if let error = error {
            print("Failed to register notification device: \(error.localizedDescription)")
        } else if let deviceID = notificationDeviceID(from: json) {
            UserDefaults.standard.set(deviceID, forKey: notificationDeviceIDDefaultsKey)
            print("Registered notification device: \(deviceID)")
        }

        if notificationRegistrationQueued {
            notificationRegistrationQueued = false
            registerNotificationDeviceIfPossible()
        }
    }
}

private func performNotificationGraphQLRequest(
    query: String,
    variables: [String: Any],
    completion: @escaping ([String: Any]?, Error?) -> Void
) {
    WKWebsiteDataStore.default().httpCookieStore.getAllCookies { cookies in
        var request = URLRequest(url: notificationAPIURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let matchingCookies = cookiesForNotificationAPI(cookies)
        print("Notification API cookies matched: \(matchingCookies.count)")
        if !matchingCookies.isEmpty,
           let cookieHeader = HTTPCookie.requestHeaderFields(with: matchingCookies)["Cookie"] {
            request.setValue(cookieHeader, forHTTPHeaderField: "Cookie")
        }

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: [
                "query": query,
                "variables": variables,
            ])
        } catch {
            DispatchQueue.main.async { completion(nil, error) }
            return
        }

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async { completion(nil, error) }
                return
            }

            if let httpResponse = response as? HTTPURLResponse,
               !(200..<300).contains(httpResponse.statusCode) {
                let error = NSError(
                    domain: "NumsNotifications",
                    code: httpResponse.statusCode,
                    userInfo: [NSLocalizedDescriptionKey: "Notification API returned HTTP \(httpResponse.statusCode)"]
                )
                DispatchQueue.main.async { completion(nil, error) }
                return
            }

            guard let data = data else {
                let error = NSError(
                    domain: "NumsNotifications",
                    code: -1,
                    userInfo: [NSLocalizedDescriptionKey: "Notification API returned an empty response"]
                )
                DispatchQueue.main.async { completion(nil, error) }
                return
            }

            do {
                let decoded = try JSONSerialization.jsonObject(with: data)
                guard let json = decoded as? [String: Any] else {
                    throw NSError(
                        domain: "NumsNotifications",
                        code: -2,
                        userInfo: [NSLocalizedDescriptionKey: "Notification API returned an invalid response"]
                    )
                }

                if let errors = json["errors"] as? [[String: Any]], !errors.isEmpty {
                    let message = (errors.first?["message"] as? String) ?? "Notification API request failed"
                    throw NSError(
                        domain: "NumsNotifications",
                        code: -3,
                        userInfo: [NSLocalizedDescriptionKey: message]
                    )
                }

                DispatchQueue.main.async { completion(json, nil) }
            } catch {
                DispatchQueue.main.async { completion(nil, error) }
            }
        }.resume()
    }
}

private func cookiesForNotificationAPI(_ cookies: [HTTPCookie]) -> [HTTPCookie] {
    guard let host = notificationAPIURL.host?.lowercased() else { return [] }
    return cookies.filter { cookie in
        let domain = cookie.domain.lowercased().trimmingCharacters(in: CharacterSet(charactersIn: "."))
        return host == domain || host.hasSuffix(".\(domain)")
    }
}

private func notificationDeviceID(from json: [String: Any]?) -> String? {
    guard
        let data = json?["data"] as? [String: Any],
        let device = data["registerNotificationDevice"] as? [String: Any],
        let id = device["id"] as? String
    else {
        return nil
    }
    return id
}

private func isValidAPNSToken(_ token: String) -> Bool {
    token.range(of: #"^[0-9a-f]{64}$"#, options: .regularExpression) != nil
}

private func jsonStringLiteral(_ value: String) -> String {
    guard
        let data = try? JSONEncoder().encode(value),
        let string = String(data: data, encoding: .utf8)
    else {
        return "null"
    }
    return string
}

func sendPushToWebView(userInfo: [AnyHashable: Any]){
    var json = "";
    do {
        let jsonData = try JSONSerialization.data(withJSONObject: userInfo)
        json = String(data: jsonData, encoding: .utf8)!
    } catch {
        print("ERROR: userInfo parsing problem")
        return
    }
    checkViewAndEvaluate(event: "push-notification", detail: json)
}

func sendPushClickToWebView(userInfo: [AnyHashable: Any]){
    var json = "";
    do {
        let jsonData = try JSONSerialization.data(withJSONObject: userInfo)
        json = String(data: jsonData, encoding: .utf8)!
    } catch {
        print("ERROR: userInfo parsing problem")
        return
    }
    checkViewAndEvaluate(event: "push-notification-click", detail: json)
}
