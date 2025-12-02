import HomeIndex from "@/components/Home";
import StoreLayout from "@/components/Layouts/StoreLayout";

export default async function StoreIndex() {
  return (
    <>
      <StoreLayout>
        <HomeIndex />
      </StoreLayout>
    </>
  );
}
