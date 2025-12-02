import StoreLayout from "@/components/Layouts/StoreLayout";
import OrderReceipt from "@/components/Store/OrderReceipt";

export default async function OrderShow({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <StoreLayout>
      <OrderReceipt id={id} />
    </StoreLayout>
  );
}
