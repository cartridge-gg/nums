import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { inject } from "@vercel/analytics";
import { registerServiceWorker } from "./register-service-worker";

if (
  typeof window !== "undefined" &&
  !window.location.hostname.includes("localhost")
) {
  inject();
}

registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
