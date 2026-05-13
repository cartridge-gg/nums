import UIKit
import WebKit
import CartridgeIOSKit

var appWebView: WKWebView! = nil

class ViewController: UIViewController, WKNavigationDelegate, UIDocumentInteractionControllerDelegate {

    var documentController: UIDocumentInteractionController?
    func documentInteractionControllerViewControllerForPreview(_ controller: UIDocumentInteractionController) -> UIViewController {
        return self
    }

    @IBOutlet weak var loadingView: UIView!
    @IBOutlet weak var loadingBackgroundView: UIView!
    @IBOutlet weak var logoImageView: UIImageView!
    @IBOutlet weak var connectionProblemView: UIImageView!
    @IBOutlet weak var webviewView: UIView!
    var toolbarView: UIToolbar!
    lazy var popupWebViewCoordinator = CartridgePopupWebViewCoordinator(containerView: webviewView)

    var htmlIsLoaded = false;

    private var loadingGradientLayer: CAGradientLayer?
    private var glitchLayers: [UIImageView] = []
    private let loadingTheme = LoadingTheme()
    private let iframeDebugOverlayTag = 909401
    private var iframeDebugPollTimer: Timer?

    private var svgLogoWebView: WKWebView?
    private var themeObservation: NSKeyValueObservation?
    var currentWebViewTheme: UIUserInterfaceStyle = .unspecified
    override var preferredStatusBarStyle : UIStatusBarStyle {
        if #available(iOS 13, *), overrideStatusBar{
            if #available(iOS 15, *) {
                return .default
            } else {
                return statusBarTheme == "dark" ? .lightContent : .darkContent
            }
        }
        return .default
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupLoadingScreen()
        if iframeStorageDebugEnabled {
            setupIframeDebugOverlay()
        }
        initWebView()
        if iframeStorageDebugEnabled {
            startIframeDebugPolling()
        }
        initToolbarView()
        loadRootUrl()

        NotificationCenter.default.addObserver(self, selector: #selector(self.keyboardWillHide(_:)), name: UIResponder.keyboardWillHideNotification , object: nil)

    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        appWebView.frame = calcWebviewFrame(webviewView: webviewView, toolbarView: nil)
        loadingGradientLayer?.frame = loadingBackgroundView.bounds
    }

    @objc func keyboardWillHide(_ notification: NSNotification) {
        appWebView.setNeedsLayout()
    }

    private func setupIframeDebugOverlay() {
        if view.viewWithTag(iframeDebugOverlayTag) != nil { return }

        let label = UILabel(frame: .zero)
        label.tag = iframeDebugOverlayTag
        label.translatesAutoresizingMaskIntoConstraints = false
        label.numberOfLines = 0
        label.textAlignment = .left
        label.font = UIFont.monospacedSystemFont(ofSize: 10, weight: .regular)
        label.backgroundColor = UIColor(red: 0.22, green: 0.03, blue: 0.03, alpha: 0.88)
        label.textColor = UIColor(red: 1.0, green: 0.78, blue: 0.78, alpha: 1.0)
        label.layer.cornerRadius = 8
        label.layer.masksToBounds = true
        label.layer.borderWidth = 1
        label.layer.borderColor = UIColor(red: 0.75, green: 0.25, blue: 0.25, alpha: 1.0).cgColor
        label.text = "Iframe Storage Debug\\nWaiting for web debug stream..."
        label.isUserInteractionEnabled = false

        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 8),
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 8),
            label.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -8)
        ])
    }

    private func updateIframeDebugOverlay(text: String) {
        guard let label = view.viewWithTag(iframeDebugOverlayTag) as? UILabel else { return }
        label.text = text
    }

    private func startIframeDebugPolling() {
        iframeDebugPollTimer?.invalidate()
        iframeDebugPollTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            guard let appWebView = appWebView else { return }

            let js = """
            (() => {
              const state = window.__iframeStorageDebugState;
              const href = window.location ? window.location.href : "-";
              const prefix = "__iframeStorageSnapshot__:";
              if (!state) {
                return [
                  "Iframe Storage Debug (polled)",
                  "status: top debug state missing",
                  "url: " + href
                ].join("\\n");
              }

              const host = state.lastHost || "x.cartridge.gg";
              let keys = 0;
              let bytes = 0;
              try {
                const raw = localStorage.getItem(prefix + host);
                if (raw) {
                  bytes = raw.length;
                  try {
                    const parsed = JSON.parse(raw);
                    keys = parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
                  } catch (_) {}
                }
              } catch (_) {}

              return [
                "Iframe Storage Debug (polled)",
                "url: " + href,
                "activeHost: " + host,
                "stored.keys: " + keys,
                "stored.bytes: " + bytes,
                "sync.count: " + (state.syncCount || 0),
                "request.count: " + (state.requestCount || 0),
                "restore.count: " + (state.restoreCount || 0),
                "iframe.event: " + (state.lastIframeEvent || "-"),
                "iframe.detail: " + (typeof state.lastIframeEventDetail === "string" ? state.lastIframeEventDetail : JSON.stringify(state.lastIframeEventDetail || ""))
              ].join("\\n");
            })();
            """

            appWebView.evaluateJavaScript(js) { value, error in
                DispatchQueue.main.async {
                    if let text = value as? String {
                        self.updateIframeDebugOverlay(text: text)
                    } else if let error = error {
                        self.updateIframeDebugOverlay(text: "Iframe Storage Debug\\nJS polling error:\\n\\(error.localizedDescription)")
                    }
                }
            }
        }
    }

    func initWebView() {
        appWebView = createWebView(container: webviewView, WKSMH: self, WKND: self)
        webviewView.addSubview(appWebView);
        applyChromeBackgroundColor(loadingTheme.backgroundTop)
        appWebView.isOpaque = false
        appWebView.backgroundColor = .clear
        appWebView.scrollView.backgroundColor = loadingTheme.backgroundTop

        appWebView.uiDelegate = self;

        appWebView.addObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress), options: .new, context: nil)

        if pullToRefresh {
            #if !targetEnvironment(macCatalyst)
            let refreshControl = UIRefreshControl()
            refreshControl.addTarget(self, action: #selector(refreshWebView(_:)), for: .valueChanged)
            appWebView.scrollView.addSubview(refreshControl)
            appWebView.scrollView.bounces = true
            #endif
        }

        if #available(iOS 15.0, *), adaptiveUIStyle {
            themeObservation = appWebView.observe(\.underPageBackgroundColor) { [unowned self] appWebView, _ in
                let sampled = appWebView.underPageBackgroundColor
                self.applyChromeBackgroundColor(sampled ?? self.loadingTheme.backgroundTop)
                self.currentWebViewTheme = (sampled?.isLight() ?? true) ? .light : .dark
                self.overrideUIStyle()
            }
        }

    }

    @objc func refreshWebView(_ sender: UIRefreshControl) {
        appWebView?.reload()
        sender.endRefreshing()
    }

    func createToolbarView() -> UIToolbar{
        let winScene = UIApplication.shared.connectedScenes.first
        let windowScene = winScene as! UIWindowScene
        var statusBarHeight = windowScene.statusBarManager?.statusBarFrame.height ?? 60

        #if targetEnvironment(macCatalyst)
        if (statusBarHeight == 0){
            statusBarHeight = 30
        }
        #endif

        let toolbarView = UIToolbar(frame: CGRect(x: 0, y: 0, width: webviewView.frame.width, height: 0))
        toolbarView.sizeToFit()
        toolbarView.frame = CGRect(x: 0, y: 0, width: webviewView.frame.width, height: toolbarView.frame.height + statusBarHeight)
//        toolbarView.autoresizingMask = [.flexibleTopMargin, .flexibleRightMargin, .flexibleWidth]

        let flex = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
        let close = UIBarButtonItem(barButtonSystemItem: .done, target: self, action: #selector(loadRootUrl))
        toolbarView.setItems([close,flex], animated: true)

        toolbarView.isHidden = true

        return toolbarView
    }

    func overrideUIStyle(toDefault: Bool = false) {
        if #available(iOS 15.0, *), adaptiveUIStyle {
            if (((htmlIsLoaded && !appWebView.isHidden) || toDefault) && self.currentWebViewTheme != .unspecified) {
                UIApplication
                    .shared
                    .connectedScenes
                    .flatMap { ($0 as? UIWindowScene)?.windows ?? [] }
                    .first { $0.isKeyWindow }?.overrideUserInterfaceStyle = toDefault ? .unspecified : self.currentWebViewTheme;
            }
        }
    }

    func initToolbarView() {
        toolbarView =  createToolbarView()

        webviewView.addSubview(toolbarView)
    }

    @objc func loadRootUrl() {
        appWebView.load(URLRequest(url: SceneDelegate.universalLinkToLaunch ?? SceneDelegate.shortcutLinkToLaunch ?? rootUrl))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!){
        htmlIsLoaded = true

        self.animateConnectionProblem(false)

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            appWebView.isHidden = false
            self.loadingBackgroundView.isHidden = true
            self.loadingView.isHidden = true

            self.overrideUIStyle()
            triggerNotificationRegistrationCheck(in: webView)
            if iframeStorageDebugEnabled {
                appWebView.evaluateJavaScript("window.__showIframeStorageDebugPanel && window.__showIframeStorageDebugPanel();", completionHandler: nil)
            }
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        htmlIsLoaded = false;

        if (error as NSError)._code != (-999) {
            self.overrideUIStyle(toDefault: true);

            appWebView.isHidden = true;
            loadingBackgroundView.isHidden = false
            loadingView.isHidden = false;
            animateConnectionProblem(true);

            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    self.loadRootUrl();
                }
            }
        }
    }

    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {

        if (keyPath == #keyPath(WKWebView.estimatedProgress) &&
                appWebView.isLoading &&
                !self.loadingView.isHidden &&
                !self.htmlIsLoaded) {
                    var progress = Float(appWebView.estimatedProgress);

                    if (progress >= 0.8) { progress = 1.0; };
                    if (progress >= 0.3) { self.animateConnectionProblem(false); }
        }
    }


    func animateConnectionProblem(_ show: Bool) {
        if (show) {
            self.connectionProblemView.isHidden = false;
            self.connectionProblemView.alpha = 0
            UIView.animate(withDuration: 0.7, delay: 0, options: [.repeat, .autoreverse], animations: {
                self.connectionProblemView.alpha = 1
            })
        }
        else {
            UIView.animate(withDuration: 0.3, delay: 0, options: [], animations: {
                self.connectionProblemView.alpha = 0 // Here you will get the animation you want
            }, completion: { _ in
                self.connectionProblemView.isHidden = true;
                self.connectionProblemView.layer.removeAllAnimations();
            })
        }
    }

    deinit {
        appWebView.removeObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress))
        iframeDebugPollTimer?.invalidate()
        iframeDebugPollTimer = nil
        NotificationCenter.default.removeObserver(self)
    }
}

private extension ViewController {
    struct LoadingTheme {
        let backgroundTop = UIColor(red: 73.0/255.0, green: 25.0/255.0, blue: 208.0/255.0, alpha: 1) // #4919D0
        let backgroundBottom = UIColor(red: 73.0/255.0, green: 25.0/255.0, blue: 208.0/255.0, alpha: 1)
        let accent = UIColor(red: 34.0/255.0, green: 227.0/255.0, blue: 182.0/255.0, alpha: 1)
        let accentMuted = UIColor(red: 34.0/255.0, green: 227.0/255.0, blue: 182.0/255.0, alpha: 0.25)
        let glitchA = UIColor(red: 255.0/255.0, green: 86.0/255.0, blue: 100.0/255.0, alpha: 0.9)
        let glitchB = UIColor(red: 76.0/255.0, green: 162.0/255.0, blue: 255.0/255.0, alpha: 0.9)
        let glow = UIColor(red: 34.0/255.0, green: 227.0/255.0, blue: 182.0/255.0, alpha: 0.9)
    }

    func setupLoadingScreen() {
        setupLoadingBackground()
        setupLogoEffects()
        setupSVGLogo()
    }

    func setupSVGLogo() {
        guard let svgURL = Bundle.main.url(forResource: "countup", withExtension: "svg"),
              let svgString = try? String(contentsOf: svgURL, encoding: .utf8) else { return }

        let html = """
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; background: transparent; overflow: hidden; }
          body { display: flex; justify-content: center; align-items: center; }
          svg { width: 100%; height: 100%; }
        </style>
        </head>
        <body>\(svgString)</body>
        </html>
        """

        let config = WKWebViewConfiguration()
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.scrollView.isScrollEnabled = false
        webView.translatesAutoresizingMaskIntoConstraints = false

        loadingView.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.centerXAnchor.constraint(equalTo: logoImageView.centerXAnchor),
            webView.centerYAnchor.constraint(equalTo: logoImageView.centerYAnchor),
            webView.widthAnchor.constraint(equalToConstant: 80),
            webView.heightAnchor.constraint(equalToConstant: 96)
        ])

        webView.loadHTMLString(html, baseURL: nil)
        logoImageView.isHidden = true
        svgLogoWebView = webView
    }

    func setupLoadingBackground() {
        loadingBackgroundView.backgroundColor = loadingTheme.backgroundTop

        let gradient = CAGradientLayer()
        gradient.colors = [loadingTheme.backgroundTop.cgColor, loadingTheme.backgroundBottom.cgColor]
        gradient.startPoint = CGPoint(x: 0.1, y: 0.0)
        gradient.endPoint = CGPoint(x: 0.9, y: 1.0)
        gradient.frame = loadingBackgroundView.bounds
        loadingBackgroundView.layer.insertSublayer(gradient, at: 0)
        loadingGradientLayer = gradient
    }

    func setupLogoEffects() {
        loadingView.clipsToBounds = false

        logoImageView.layer.shadowColor = UIColor.clear.cgColor
        logoImageView.layer.shadowRadius = 0
        logoImageView.layer.shadowOpacity = 0
        logoImageView.layer.shadowOffset = .zero
    }

    func applyChromeBackgroundColor(_ color: UIColor) {
        view.backgroundColor = color
        webviewView.backgroundColor = color
        appWebView?.scrollView.backgroundColor = color

        if let toolbarView = toolbarView {
            if #available(iOS 15.0, *) {
                let appearance = UIToolbarAppearance()
                appearance.configureWithOpaqueBackground()
                appearance.backgroundColor = color
                toolbarView.standardAppearance = appearance
                toolbarView.scrollEdgeAppearance = appearance
            } else {
                toolbarView.barTintColor = color
            }
        }
    }

    func createGlitchOverlays() {
        guard glitchLayers.isEmpty, let baseImage = logoImageView.image else { return }

        let glitchColors = [loadingTheme.glitchA, loadingTheme.glitchB]
        for color in glitchColors {
            let image = baseImage.withRenderingMode(.alwaysTemplate)
            let layerView = UIImageView(image: image)
            layerView.translatesAutoresizingMaskIntoConstraints = false
            layerView.contentMode = logoImageView.contentMode
            layerView.tintColor = color
            layerView.alpha = 0

            loadingView.addSubview(layerView)
            NSLayoutConstraint.activate([
                layerView.centerXAnchor.constraint(equalTo: logoImageView.centerXAnchor),
                layerView.centerYAnchor.constraint(equalTo: logoImageView.centerYAnchor),
                layerView.widthAnchor.constraint(equalTo: logoImageView.widthAnchor),
                layerView.heightAnchor.constraint(equalTo: logoImageView.heightAnchor)
            ])
            glitchLayers.append(layerView)
        }
    }

    func startLoadingAnimations() {
        let pulse = CABasicAnimation(keyPath: "transform.scale")
        pulse.fromValue = 0.98
        pulse.toValue = 1.05
        pulse.duration = 1.2
        pulse.autoreverses = true
        pulse.repeatCount = .infinity
        pulse.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        logoImageView.layer.add(pulse, forKey: "pulse")
    }

    func addGlitchAnimation(to imageView: UIImageView, delay: TimeInterval) {
        let shiftX = CAKeyframeAnimation(keyPath: "transform.translation.x")
        shiftX.values = [0, 2, -3, 0, 1, 0]
        shiftX.keyTimes = [0, 0.2, 0.4, 0.6, 0.85, 1]
        shiftX.duration = 0.8
        shiftX.repeatCount = .infinity
        shiftX.beginTime = CACurrentMediaTime() + delay

        let shiftY = CAKeyframeAnimation(keyPath: "transform.translation.y")
        shiftY.values = [0, -1, 2, 0, -1, 0]
        shiftY.keyTimes = shiftX.keyTimes
        shiftY.duration = shiftX.duration
        shiftY.repeatCount = .infinity
        shiftY.beginTime = shiftX.beginTime

        let opacity = CAKeyframeAnimation(keyPath: "opacity")
        opacity.values = [0.0, 0.6, 0.0, 0.75, 0.0]
        opacity.keyTimes = [0, 0.15, 0.35, 0.65, 1]
        opacity.duration = 1.4
        opacity.repeatCount = .infinity
        opacity.beginTime = shiftX.beginTime

        let group = CAAnimationGroup()
        group.animations = [shiftX, shiftY, opacity]
        group.duration = 1.4
        group.repeatCount = .infinity
        group.timingFunction = CAMediaTimingFunction(name: .linear)
        group.beginTime = shiftX.beginTime
        imageView.layer.add(group, forKey: "glitch")
    }
}

extension UIColor {
    // Check if the color is light or dark, as defined by the injected lightness threshold.
    // Some people report that 0.7 is best. I suggest to find out for yourself.
    // A nil value is returned if the lightness couldn't be determined.
    func isLight(threshold: Float = 0.5) -> Bool? {
        let originalCGColor = self.cgColor

        // Now we need to convert it to the RGB colorspace. UIColor.white / UIColor.black are greyscale and not RGB.
        // If you don't do this then you will crash when accessing components index 2 below when evaluating greyscale colors.
        let RGBCGColor = originalCGColor.converted(to: CGColorSpaceCreateDeviceRGB(), intent: .defaultIntent, options: nil)
        guard let components = RGBCGColor?.components else {
            return nil
        }
        guard components.count >= 3 else {
            return nil
        }

        let brightness = Float(((components[0] * 299) + (components[1] * 587) + (components[2] * 114)) / 1000)
        return (brightness > threshold)
    }
}

extension ViewController: WKScriptMessageHandler {
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "print" {
            printView(webView: appWebView)
        }
        if iframeStorageDebugEnabled && message.name == "iframe-storage-debug-native" {
            if let body = message.body as? [String: Any], let text = body["text"] as? String {
                DispatchQueue.main.async {
                    self.updateIframeDebugOverlay(text: text)
                }
            }
        }
        if message.name == "push-subscribe" {
            handleSubscribeTouch(message: message)
        }
        if message.name == "push-permission-request" {
            handlePushPermission()
        }
        if message.name == "push-permission-state" {
            handlePushState()
        }
        if message.name == "push-token" {
            handlePushTokenRequest()
        }
        if message.name == "notification-session-ready" {
            print("Notification session ready message received from web")
            handleNotificationSessionReady()
        }
        if message.name == "cartridge-logout-cleanup" {
            disableRegisteredNotificationDevice {
                clearCartridgeWebsiteData()
            }
        }
  }
}
