import WithdrawForm from "@/components/Affiliate/Dashboard/WithdrawForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AffiliateLayout from "@/components/Layouts/AffiliateLayout";

export default async function AffiliateTransactions() {
  return (
    <AffiliateLayout>
      <Breadcrumb pageName="Withdraw" />
      <WithdrawForm />
    </AffiliateLayout>
  );
}
