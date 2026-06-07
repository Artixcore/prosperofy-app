"use client";

import { SecuritySettingsPanel } from "@/features/settings/security-settings-panel";
import { SettingsModuleGate } from "@/features/settings/settings-module-gate";

export default function SettingsSecurityPage() {
  return (
    <SettingsModuleGate>
      {(data) => <SecuritySettingsPanel data={data} />}
    </SettingsModuleGate>
  );
}
