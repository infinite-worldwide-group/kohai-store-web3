import StoreLayout from "@/components/Layouts/StoreLayout";
import StoreProduct from "@/components/Store/TopupProducts/StoreProduct";

export default async function GameShow({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <StoreLayout>
      <StoreProduct id={id} />
    </StoreLayout>
  );
}
