"use client";

import { useStore } from "@/contexts/StoreContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { CiSearch } from "react-icons/ci";
import styles from "./Styles.module.css";

export default function SearchDrawer({
  slug,
  closeAction,
}: {
  slug?: string;
  closeAction: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { store } = useStore();

  const [search, setSearch] = useState<string>(
    searchParams.get("search") || "",
  );

  const [genre, setGenre] = useState<string>(searchParams.get("genre") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleSearch = () => {
    closeAction();
    const targetPath = pathname === "/" ? pathname : !!slug ? `/${slug}` : "/";

    router.push(targetPath + "?" + createQueryString("search", search));
  };

  const handleGenre = (val: string) => {
    setGenre(val);
    closeAction();
    const targetPath = pathname === "/" ? pathname : !!slug ? `/${slug}` : "/";

    router.push(targetPath + "?" + createQueryString("genre", val));
  };

  return (
    <>
      <div className="rounded-2xl bg-white/10 shadow-2xl backdrop-blur-md md:block">
        <div className="md:grid md:grid-cols-10">
          <div className="relative col-span-3 w-full p-5">
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 20,
                marginTop: -17,
                borderRightStyle: "solid",
                borderRightWidth: 1,
                borderRightColor: "rgba(255,255,255,0.14)",
                paddingRight: 15,
                paddingTop: 6,
                paddingBottom: 6,
              }}
            >
              <CiSearch className="opacity-70" size={24} />
            </div>
            <input
              className="h-5 h-full w-full bg-transparent pl-14 focus:outline-none"
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
        </div>
      </div>

      <div className="py-4 ">
        <div className="flex w-full flex-wrap gap-4">
          {["Moba", "FPS", "Action", "RPG", "Racing"].map((i) => (
            <div
              key={`genre-${i}`}
              className={styles.btnSecond}
              onClick={() => handleGenre(i)}
              style={
                genre == i
                  ? { backgroundColor: store?.buttonColor ?? "blue" }
                  : undefined
              }
            >
              {i}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
