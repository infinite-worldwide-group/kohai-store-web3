import BankAccountTable from "@/components/Affiliate/Dashboard/BankAccountTable";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AffiliateLayout from "@/components/Layouts/AffiliateLayout";

export default async function BankAccounts() {
  return (
    <AffiliateLayout>
      <Breadcrumb pageName="Bank Accounts" />
      <BankAccountTable />
    </AffiliateLayout>
  );
}
