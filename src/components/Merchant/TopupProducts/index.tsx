"use client";

import Loader from "@/components/common/Loader";
import { useMerchant } from "@/contexts/MerchantContext";
import { useMerchantTopupProductsQuery } from "graphql/generated/graphql";
import { useState } from "react";
import Filter from "./Filter";
import TopupProductListItem from "./ListItem";

const TopupProducts = (props: {}) => {
  const { merchant } = useMerchant();
  if (!merchant) return <Loader />;

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const { data, loading } = useMerchantTopupProductsQuery({
    variables: {
      merchantId: merchant.id,
      categoryId: categoryId,
      page: page,
      perPage: 100,
    },
  });

  return (
    <div>
      <div className="py-2">
        <Filter categoryId={categoryId} setCategoryId={setCategoryId} />
      </div>

      {!data || loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.merchantTopupProducts.map((item, index) => (
            <TopupProductListItem item={item} key={`topup-products-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopupProducts;
