import { toast } from "sonner";

const canRegisterServiceWorker = () => {
  return (
    import.meta.env.PROD &&
    typeof window !== "undefined" &&
    "serviceWorker" in navigator
  );
};

const UPDATE_TOAST_ID = "app-update-ready";

const promptForUpdate = (registration: ServiceWorkerRegistration) => {
  const reloadWithUpdate = () => {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) {
        return;
      }
      refreshing = true;
      window.location.reload();
    });

    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  toast("New version available", {
    id: UPDATE_TOAST_ID,
    duration: Number.POSITIVE_INFINITY,
    description: "Reload to use the latest frontend update.",
    action: {
      label: "Reload",
      onClick: reloadWithUpdate,
    },
    cancel: {
      label: "Later",
      onClick: () => {},
    },
  });
};

const watchForUpdates = (registration: ServiceWorkerRegistration) => {
  if (registration.waiting && navigator.serviceWorker.controller) {
    promptForUpdate(registration);
  }

  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) {
      return;
    }

    installing.addEventListener("statechange", () => {
      if (
        installing.state === "installed" &&
        navigator.serviceWorker.controller &&
        registration.waiting
      ) {
        promptForUpdate(registration);
      }
    });
  });
};

export const registerServiceWorker = () => {
  if (!canRegisterServiceWorker()) {
    return;
  }

  window.addEventListener("load", () => {
    const version = encodeURIComponent(__APP_VERSION__);
    void navigator.serviceWorker
      .register(`/sw.js?v=${version}`, { scope: "/" })
      .then((registration) => {
        watchForUpdates(registration);
      })
      .catch((error: unknown) => {
        console.error("Failed to register service worker", error);
      });
  });
};
