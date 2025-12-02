"use client";

import {
  CategoryTypeEnum,
  useCategoriesQuery,
} from "graphql/generated/graphql";

import styles from "./TopupProduct.module.css";

const Filter = (props: {
  categoryId: string | undefined | null;
  setCategoryId: (arg: string | undefined) => void;
}) => {
  const { data, loading } = useCategoriesQuery({
    variables: {
      categoryType: CategoryTypeEnum.Game,
    },
  });

  if (!data || loading) return null;

  return (
    <div className="flex gap-4 py-3">
      <button
        onClick={() => props.setCategoryId(undefined)}
        className={!props.categoryId ? styles.active : undefined}
      >
        All
      </button>
      {data.categories.map((item, index) => (
        <button
          onClick={() => props.setCategoryId(item.id)}
          className={props.categoryId == item.id ? styles.active : undefined}
          key={`category-item=${index}`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};

export default Filter;
