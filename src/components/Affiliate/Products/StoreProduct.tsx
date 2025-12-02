"use client";

import { useStoreTopupProductQuery, useTopupProductSlugQuery } from "graphql/generated/graphql";
import Loader from "../../common/Loader";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import GameInfo from "@/components/Store/TopupProducts/GameInfo";
import { useStore } from "@/contexts/StoreContext";
import ProductItems from "./ProductItems";

const StoreProduct = (props: { id: string }) => {
  const { store } = useStore();

  const { data, loading } = useTopupProductSlugQuery({
    variables: {
      slug: props.id,
    },
  });

  if (!data || loading) return <Loader />;

  const history = [{ name: "Products", path: "/store/products" }];

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-8">
      <div className="md:col-span-2">
        <GameInfo item={data.topupProductSlug} />
      </div>
      {/* game info col ended */}
      <div className="md:col-span-6">
        <Breadcrumb pageName="Items" history={history} />
        {store && <ProductItems item={data.topupProductSlug} store={store} />}
      </div>
    </div>
  );
};

export default StoreProduct;
