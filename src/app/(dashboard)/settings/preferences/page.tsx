"use client";

import { PreferencesSettingsPanel } from "@/features/settings/preferences-settings-panel";
import { SettingsModuleGate } from "@/features/settings/settings-module-gate";

export default function SettingsPreferencesPage() {
  return (
    <SettingsModuleGate>
      {(data) => <PreferencesSettingsPanel data={data} />}
    </SettingsModuleGate>
  );
}
