import TransactionTable from "@/components/Affiliate/Dashboard/TransactionTable";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AffiliateLayout from "@/components/Layouts/AffiliateLayout";

export default async function AffiliateTransactions() {
  return (
    <AffiliateLayout>
      <Breadcrumb pageName="Transactions" />
      <TransactionTable limit={10} />
    </AffiliateLayout>
  );
}
