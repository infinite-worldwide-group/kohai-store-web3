import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MerchantLayout from "@/components/Layouts/MerchantLayout";
import MerchantSettings from "@/components/Merchant/MerchantSettings";

export default async function MerchantSettingsIndex() {
  return (
    <MerchantLayout>
      <Breadcrumb pageName="Settings" />
      <MerchantSettings />
    </MerchantLayout>
  );
}
