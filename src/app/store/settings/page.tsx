import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AffiliateLayout from "@/components/Layouts/AffiliateLayout";
import StoreSettings from "@/components/Store/StoreSettings";

export default async function AffiliateDashboard() {
  return (
    <AffiliateLayout>
      <Breadcrumb pageName="Settings" />
      <StoreSettings />
    </AffiliateLayout>
  );
}
