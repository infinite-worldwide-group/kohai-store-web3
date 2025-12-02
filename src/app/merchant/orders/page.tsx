import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import OrderTable from "@/components/Dashboard/OrderTable";
import MerchantLayout from "@/components/Layouts/MerchantLayout";

export default async function MerchantSettingsIndex() {
  return (
    <MerchantLayout>
      <Breadcrumb pageName="Orders" />
      <OrderTable limit={10} />
    </MerchantLayout>
  );
}
