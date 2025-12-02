"use client";

import { useStore } from "@/contexts/StoreContext";
import { useMemo } from "react";
import styles from "./TopupProduct.module.css";

interface TopupProduct {
  category?: string | null;
  title?: string;
}

const FilterPremium = (props: {
  categoryId: string | undefined | null;
  setCategoryId: (arg: string | undefined) => void;
  products?: TopupProduct[];
}) => {
  const { store } = useStore();

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!props.products) {
      console.log('🏷️ Filter: No products provided');
      return [];
    }

    console.log('🏷️ Filter: Processing', props.products.length, 'products');

    const uniqueCategories = new Set<string>();
    props.products.forEach(product => {
      console.log('Product:', product.title, 'Category:', product.category);
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });

    const categoriesArray = Array.from(uniqueCategories).sort();
    console.log('🏷️ Filter: Extracted categories:', categoriesArray);

    return categoriesArray;
  }, [props.products]);

  return (
    <div className="mb-3 rounded-xl bg-white/10 p-2 backdrop-blur-md">
      <div className="flex flex-wrap gap-2 md:gap-4">
        <button
          onClick={() => props.setCategoryId(undefined)}
          className={`rounded-xl p-2 px-3 text-sm ${!props.categoryId ? styles.active : "opacity-60"}`}
          style={
            !props.categoryId
              ? { backgroundColor: store?.buttonColor ?? "blue" }
              : undefined
          }
        >
          All Products
        </button>
        {categories.map((category, index) => (
          <button
            onClick={() => props.setCategoryId(category)}
            className={`rounded-xl p-2 px-3 text-sm ${props.categoryId === category ? styles.active : "opacity-60"}`}
            key={`category-item-${index}`}
            style={
              props.categoryId === category
                ? { backgroundColor: store?.buttonColor ?? "blue" }
                : undefined
            }
          >
            {category.replace(" Game", "").replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPremium;
