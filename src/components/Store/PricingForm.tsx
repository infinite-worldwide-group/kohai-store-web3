"use client";

import { useStore } from "@/contexts/StoreContext";
import { useUpdateMarkupRateMutation } from "graphql/generated/graphql";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const PricingForm = () => {
  const { store, setStore } = useStore();

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      markupRate: store?.markupRate ? store.markupRate * 100 : 0,
    },
  });

  const [selectedFiat, setSelectedFiat] = useState({
    name: "Malaysian Ringgit",
    isoCode: "RM",
  });

  const [transactionFee, setTransactionFee] = useState(1);

  const [updateMarkupRate] = useUpdateMarkupRateMutation({
    onCompleted: (data) => {
      if (data?.updateMarkupRate?.gamecreditStore) {
        setStore(data.updateMarkupRate.gamecreditStore);
        alert("Rate updated");
      }
    },
    onError: (e) => {
      alert(e);
    },
  });

  const onSubmit = (variables: any) => {
    updateMarkupRate({
      variables: {
        markupRate: variables.markupRate / 100,
      },
    });
  };

  useEffect(() => {
    if (store?.fiatCurrency) {
      setSelectedFiat({
        name: store.fiatCurrency.name,
        isoCode: store.fiatCurrency.isoCode,
      });
    }
  }, [store]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5.5 grid gap-4 md:grid-cols-2">
        <div>
          <label
            className="mb-3 block text-sm font-medium text-white"
            htmlFor="currency"
          >
            Currency
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-strokedark bg-gray bg-meta-4 p-4.5 py-3 text-white focus:border-primary focus-visible:outline-none"
              type="text"
              value={`${selectedFiat.name} (${selectedFiat.isoCode})`}
              disabled
            />
          </div>
        </div>

        <div>
          <label
            className="mb-3 block text-sm font-medium text-white"
            htmlFor="markupRate"
          >
            Markup Rate
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-strokedark bg-gray bg-meta-4 px-6 py-3 text-right text-white focus:border-primary focus-visible:outline-none"
              type="number"
              defaultValue={watch("markupRate")}
              {...register("markupRate", {
                required: "markup rate is required",
              })}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 transform text-white">
              %
            </span>
          </div>
        </div>
      </div>

      <div className="mb-5.5 md:grid md:grid-cols-2 md:gap-4">
        <p>Your selling price:</p>
        <p>
          <s>{selectedFiat.isoCode} 1.00</s> {`->`} {selectedFiat.isoCode}{" "}
          {(1 * (1 + watch("markupRate") / 100)).toFixed(2)}
        </p>
      </div>

      <div className="flex justify-end gap-4.5">
        <button
          className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default PricingForm;
