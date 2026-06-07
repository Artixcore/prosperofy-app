import Link from "next/link";

export default function ApiManagementSettingsPage() {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">API Management</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage API keys and developer access.
      </p>
      <div className="mt-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect exchanges and manage trading API keys from Exchange Connections. Use read-only
          keys where possible and never enable withdrawal permissions.
        </p>
        <Link
          href="/settings/exchange-connections"
          className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110"
        >
          Go to Exchange Connections
        </Link>
      </div>
    </div>
  );
}
