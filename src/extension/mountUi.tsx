import React from "react";
import { createRoot } from "react-dom/client";
import { GeoLensOverlay } from "./ui/GeoLensOverlay";

export function mountGeoLensUI() {
  const host = document.createElement("div");
  host.id = "geolens-root-host";
  host.style.all = "initial";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const container = document.createElement("div");
  shadow.appendChild(container);

  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
  `;
  shadow.appendChild(style);

  createRoot(container).render(<GeoLensOverlay />);
}
