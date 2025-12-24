"use client";

import { useTopupProductSlugQuery } from "graphql/generated/graphql";

import Loader from "@/components/common/Loader";
import GameForm from "./GameForm";
import GameInfo from "./GameInfo";

const TopupProduct = (props: { id: string }) => {
  const { data, loading } = useTopupProductSlugQuery({
    variables: {
      slug: props.id,
    },
  });

  if (!data || loading) return <Loader />;

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-8">
      <div className="md:col-span-2">
        <GameInfo item={data.topupProductSlug} />
      </div>
      {/* game info col ended */}
      <div className="md:col-span-6">
        <div className="">
          <GameForm item={data.topupProductSlug} />
        </div>
      </div>
    </div>
  );
};

export default TopupProduct;
