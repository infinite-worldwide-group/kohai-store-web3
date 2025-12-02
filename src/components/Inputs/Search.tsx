"use client";

import { useStore } from "@/contexts/StoreContext";
import { isColorDark } from "@/lib/ColorUtils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function Search({ slug }: { slug?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { store } = useStore();

  const [search, setSearch] = useState<string>(
    searchParams.get("search") || "",
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleSearch = () => {
    const targetPath = pathname === "/" ? pathname : !!slug ? `/${slug}` : "/";
    router.push(targetPath + "?" + createQueryString("search", search));
  };

  const isDark = !!store?.backgroundColor
    ? isColorDark(String(store.backgroundColor))
    : true;

  return (
    <div className="relative">
      <span className="absolute left-4.5 top-4">
        <FaSearch />
      </span>
      <input
        className={`w-full rounded border border-stroke border-strokedark bg-opacity-10 py-3 pl-11.5 pr-4.5 focus:border-primary focus:border-primary focus-visible:outline-none ${isDark ? "bg-white" : "bg-gray-400"}`}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search games"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
    </div>
  );
}
