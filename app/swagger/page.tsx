"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    SwaggerUIBundle?: (options: Record<string, unknown>) => unknown;
    SwaggerUIStandalonePreset?: unknown;
  }
}

function initSwaggerUi() {
  if (!window.SwaggerUIBundle) {
    return;
  }

  window.SwaggerUIBundle({
    url: "/api/openapi",
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [window.SwaggerUIStandalonePreset],
    layout: "BaseLayout"
  });
}

export default function SwaggerPage() {
  useEffect(() => {
    initSwaggerUi();
  }, []);

  return (
    <main style={{ padding: "1rem" }}>
      <h1>SmartTrip API Docs</h1>
      <p>Temporary auth header for requests: x-user-id: &lt;uuid&gt;.</p>
      <div id="swagger-ui" />
      <Script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" onLoad={initSwaggerUi} />
      <Script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" />
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    </main>
  );
}
