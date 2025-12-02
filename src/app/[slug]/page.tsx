import HomeIndex from "@/components/Home";
import SlugLayout from "@/components/Layouts/SlugLayout";

export default async function StoreShow({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <SlugLayout slug={slug}>
        <HomeIndex slug={slug} />
      </SlugLayout>
    </>
  );
}
