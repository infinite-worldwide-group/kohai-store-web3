import StoreProduct from "@/components/Affiliate/Products/StoreProduct";
import AffiliateLayout from "@/components/Layouts/AffiliateLayout";

export default async function GameShow({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AffiliateLayout>
      <StoreProduct id={id} />
    </AffiliateLayout>
  );
}
