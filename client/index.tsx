import React from "react";
import { createRoot } from "react-dom/client";

function BootstrapApp() {
  return <div>Standalone client bundle entry (webpack).</div>;
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<BootstrapApp />);
}
