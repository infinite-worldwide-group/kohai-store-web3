import ECommerce from "@/components/Dashboard/ECommerce";
import MerchantLayout from "@/components/Layouts/MerchantLayout";

export default async function Merchant() {
  return (
    <MerchantLayout>
      <ECommerce />
    </MerchantLayout>
  );
}
