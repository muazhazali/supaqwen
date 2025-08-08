import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadSettings, saveSettings } from "../storage/db";
import { Settings } from "../types";

function Options() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  async function onSave() {
    if (!settings) return;
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
  }

  if (!settings) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h2>Qwen Chat Settings</h2>
      <div style={{ display: "grid", gap: 12 }}>
        <label>
          Theme
          <select
            value={settings.theme}
            onChange={(e) => setSettings({ ...settings, theme: e.target.value as Settings["theme"] })}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label>
          Language
          <input
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          />
        </label>

        <label>
          Model
          <select
            value={settings.model}
            onChange={(e) => setSettings({ ...settings, model: e.target.value as Settings["model"] })}
          >
            <option value="qwen-lite">Qwen Lite</option>
            <option value="qwen-plus">Qwen Plus</option>
            <option value="local">Local</option>
          </select>
        </label>

        <fieldset style={{ border: "1px solid #ddd" }}>
          <legend>Optional Remote Endpoint</legend>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={settings.remoteEndpointEnabled}
              onChange={(e) => setSettings({ ...settings, remoteEndpointEnabled: e.target.checked })}
            />
            Enable remote endpoint (disabled by default for privacy)
          </label>
          <label>
            URL
            <input
              disabled={!settings.remoteEndpointEnabled}
              value={settings.remoteEndpointUrl ?? ""}
              onChange={(e) => setSettings({ ...settings, remoteEndpointUrl: e.target.value })}
              placeholder="https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"
            />
          </label>
          <label>
            API Key
            <input
              disabled={!settings.remoteEndpointEnabled}
              value={settings.apiKey ?? ""}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </label>
        </fieldset>

        <div>
          <button onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Options />);


