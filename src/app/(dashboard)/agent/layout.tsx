import type { ReactNode } from "react";
import { AgentSubNav } from "@/components/layout/agent-subnav";

export default function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AgentSubNav />
      {children}
    </>
  );
}
