import { PageHeader } from "@/components/page-header";
import { CardPageContent } from "@/features/card/card-page-content";

export default function ProsperityCardPage() {
  return (
    <>
      <PageHeader
        title="Prosperity Card"
        description="Pay the virtual card fee and manage your card activation from your Spend Wallet center."
      />
      <CardPageContent />
    </>
  );
}
