"use client";

import { useSlugStoreQuery } from "graphql/generated/graphql";
import Loader from "../common/Loader";

const StoreIndex = (props: { slug: string }) => {
  const { data, loading } = useSlugStoreQuery({
    variables: {
      slug: props.slug,
    },
  });

  if (!data || loading) return <Loader />;

  return <h1>{data.slugStore.id}</h1>;
};

export default StoreIndex;
