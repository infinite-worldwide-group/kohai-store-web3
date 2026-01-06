import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AffiliateLayout from "@/components/Layouts/AffiliateLayout";
import TopupProducts from "@/components/Store/TopupProducts";

export default async function AffiliateDashboard() {
  return (
    <AffiliateLayout>
      <Breadcrumb pageName="Products" />
      <TopupProducts from="dashboard" />
    </AffiliateLayout>
  );
}
