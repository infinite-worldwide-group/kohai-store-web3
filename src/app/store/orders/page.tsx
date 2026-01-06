import OrderTable from "@/components/Affiliate/Dashboard/OrderTable";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AffiliateLayout from "@/components/Layouts/AffiliateLayout";

export default async function AffiliateDashboard() {
  return (
    <AffiliateLayout>
      <Breadcrumb pageName="Orders" />
      <OrderTable limit={10} />
    </AffiliateLayout>
  );
}
