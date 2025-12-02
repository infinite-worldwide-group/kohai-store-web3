import HomeIndex from "@/components/Home";
import StoreLayout from "@/components/Layouts/StoreLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME,
  description: "Game Credits portal for Malaysians",
  icons: {
    icon: process.env.NEXT_PUBLIC_STORE_FAVICON_URL,
  },
};

export default function Home() {
  return (
    <StoreLayout>
      <HomeIndex />
    </StoreLayout>
  );
}
