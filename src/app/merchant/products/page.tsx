import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MerchantLayout from "@/components/Layouts/MerchantLayout";
import TopupProducts from "@/components/Merchant/TopupProducts";

export default async function MerchantSettingsIndex() {
  return (
    <MerchantLayout>
      <Breadcrumb pageName="Products" />
      <TopupProducts />
    </MerchantLayout>
  );
}
