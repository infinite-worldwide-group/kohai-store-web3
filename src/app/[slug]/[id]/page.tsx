import SlugLayout from "@/components/Layouts/SlugLayout";
import StoreProduct from "@/components/Store/TopupProducts/StoreProduct";

export default async function GameShow({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;

  return (
    <SlugLayout slug={slug}>
      <StoreProduct id={id} slug={slug} />
    </SlugLayout>
  );
}
