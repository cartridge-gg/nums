const canRegisterServiceWorker = () => {
  return (
    import.meta.env.PROD &&
    typeof window !== "undefined" &&
    "serviceWorker" in navigator
  );
};

export const registerServiceWorker = () => {
  if (!canRegisterServiceWorker()) {
    return;
  }

  window.addEventListener("load", () => {
    const version = encodeURIComponent(__APP_VERSION__);
    void navigator.serviceWorker
      .register(`/sw.js?v=${version}`, { scope: "/" })
      .catch((error: unknown) => {
        console.error("Failed to register service worker", error);
      });
  });
};
