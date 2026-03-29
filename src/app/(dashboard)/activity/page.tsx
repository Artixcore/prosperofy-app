import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export default function ActivityPage() {
  return (
    <>
      <PageHeader title="Activity" description="Activity history will appear when the API exposes it." />
      <EmptyState title="No activity yet" description="This page is reserved for a future Laravel-backed feed." />
    </>
  );
}
