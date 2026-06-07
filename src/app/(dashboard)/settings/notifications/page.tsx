"use client";

import { NotificationsSettingsPanel } from "@/features/settings/notifications-settings-panel";
import { SettingsModuleGate } from "@/features/settings/settings-module-gate";

export default function SettingsNotificationsPage() {
  return (
    <SettingsModuleGate>
      {(data) => <NotificationsSettingsPanel data={data} />}
    </SettingsModuleGate>
  );
}
