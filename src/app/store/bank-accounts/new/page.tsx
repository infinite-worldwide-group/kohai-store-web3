import BankAccountForm from "@/components/Affiliate/Dashboard/BankAccountForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AffiliateLayout from "@/components/Layouts/AffiliateLayout";

export default async function CreateBankAccount() {
  return (
    <AffiliateLayout>
      <Breadcrumb pageName="Add Bank Account" />
      <BankAccountForm />
    </AffiliateLayout>
  );
}
