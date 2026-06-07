"use client";

import { AccountSettingsPanel } from "@/features/settings/account-settings-panel";
import { SettingsModuleGate } from "@/features/settings/settings-module-gate";

export default function SettingsAccountPage() {
  return (
    <SettingsModuleGate>
      {(data) => <AccountSettingsPanel data={data} />}
    </SettingsModuleGate>
  );
}
