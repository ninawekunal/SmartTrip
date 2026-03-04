"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: ((options: Record<string, unknown>) => unknown) & {
      presets?: { apis?: unknown };
    };
    SwaggerUIStandalonePreset?: unknown;
  }
}

function ensureStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

async function mountSwaggerUi() {
  ensureStylesheet("https://unpkg.com/swagger-ui-dist@5/swagger-ui.css");
  await loadScript("https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js");
  await loadScript("https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js");

  if (!window.SwaggerUIBundle) {
    return;
  }

  const options: Record<string, unknown> = {
    url: "/api/openapi",
    dom_id: "#swagger-ui",
    deepLinking: true,
    layout: "BaseLayout"
  };

  const apisPreset = window.SwaggerUIBundle.presets?.apis;
  const presets: unknown[] = [];
  if (apisPreset) {
    presets.push(apisPreset);
  }
  if (window.SwaggerUIStandalonePreset) {
    presets.push(window.SwaggerUIStandalonePreset);
  }
  if (presets.length > 0) {
    options.presets = presets;
  }

  window.SwaggerUIBundle(options);
}

export default function SwaggerPage() {
  useEffect(() => {
    mountSwaggerUi().catch((error) => {
      console.error(error);
    });
  }, []);

  return (
    <main style={{ padding: "1rem" }}>
      <h1>SmartTrip API Docs</h1>
      <p>Temporary auth header for requests: x-user-id: &lt;uuid&gt;.</p>
      <div id="swagger-ui" />
    </main>
  );
}
