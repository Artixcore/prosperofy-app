"use client";

import type { ReferralMember } from "@/types/rewards";

type ReferredMembersTableProps = {
  members: ReferralMember[];
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ReferredMembersTable({ members }: ReferredMembersTableProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="text-sm font-semibold text-content-primary">Referred members</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-content-muted">
              <th className="px-2 py-2 font-medium">Member</th>
              <th className="px-2 py-2 font-medium">Joined</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Plan</th>
              <th className="px-2 py-2 font-medium">Estimated monthly reward</th>
              <th className="px-2 py-2 font-medium">Last reward</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr
                key={`${member.display_name}-${member.joined_at ?? index}`}
                className="border-b border-surface-border/60"
              >
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-content-primary">
                      {member.initials}
                    </span>
                    <span className="text-content-primary">{member.display_name}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-content-primary">{formatDate(member.joined_at)}</td>
                <td className="px-2 py-2 text-content-primary">{formatStatus(member.status)}</td>
                <td className="px-2 py-2 text-content-primary">{member.plan_label}</td>
                <td className="px-2 py-2 text-content-primary">{member.estimated_monthly_reward}</td>
                <td className="px-2 py-2 text-content-primary">
                  {member.last_reward_amount
                    ? `${member.last_reward_amount} (${formatDate(member.last_reward_at)})`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
