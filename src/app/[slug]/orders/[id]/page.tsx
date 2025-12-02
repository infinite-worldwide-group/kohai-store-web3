import SlugLayout from "@/components/Layouts/SlugLayout";
import OrderReceipt from "@/components/Store/OrderReceipt";

export default async function SlugOrderShow({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;

  return (
    <SlugLayout slug={slug}>
      <OrderReceipt id={id} slug={slug} />
    </SlugLayout>
  );
}
