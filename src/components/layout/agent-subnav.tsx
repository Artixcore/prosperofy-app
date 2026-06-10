"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const AGENT_TABS = [
  {
    href: "/agent",
    label: "AI Center",
    match: (path: string) => path === "/agent",
  },
  {
    href: "/agent/my-agents",
    label: "My Agents",
    match: (path: string) =>
      path === "/agent/my-agents" ||
      (path.startsWith("/agent/") && !path.startsWith("/agent/create") && path !== "/agent"),
  },
  {
    href: "/agent/create",
    label: "Create Agent",
    match: (path: string) => path === "/agent/create" || path.startsWith("/agent/create/"),
  },
  {
    href: "/strategy",
    label: "Strategy",
    match: (path: string) => path === "/strategy" || path.startsWith("/strategy/"),
  },
] as const;

export function AgentSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="AI Center sections"
      className="mb-6 flex gap-1 overflow-x-auto border-b border-surface-border pb-px"
    >
      {AGENT_TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium motion-safe:transition-colors ${
              active
                ? "border-b-2 border-primary text-content-primary"
                : "text-content-muted hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
