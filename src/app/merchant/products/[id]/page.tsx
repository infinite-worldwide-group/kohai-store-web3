import MerchantLayout from "@/components/Layouts/MerchantLayout";
import TopupProduct from "@/components/Merchant/TopupProducts/show";

export default async function GameShow({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <MerchantLayout>
      <TopupProduct id={id} />
    </MerchantLayout>
  );
}
