import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Notification APIs are not wired yet." />
      <EmptyState title="No notifications" description="Check back after backend notification endpoints ship." />
    </>
  );
}
