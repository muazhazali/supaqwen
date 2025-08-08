import React from "react";
import { createRoot } from "react-dom/client";

function SidePanel() {
  return (
    <div style={{ padding: 8 }}>
      <h3>Qwen Side Panel</h3>
      <p>You can add search, pinned messages, or tools here later.</p>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<SidePanel />);


