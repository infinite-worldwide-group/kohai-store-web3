"use client";

import AlertModal from "@/components/Modals/alert";
import { useStore } from "@/contexts/StoreContext";
import { isColorDark } from "@/lib/ColorUtils";
import {
  Gateway,
  TopupProductFragment,
  useCheckPaymentUrlLazyQuery,
  useCheckPendingOrderLazyQuery,
  useCreateAffiliateOrderMutation,
  // useStoreTopupProductItemsQuery,
  useValidateGameAccountMutation,
} from "graphql/generated/graphql";

// TODO: Re-enable when backend supports CurrencyEnum
enum CurrencyEnum {
  Myr = "MYR",
  Sgd = "SGD",
  Usd = "USD",
}
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import LabelRow from "./LabelRow";
import styles from "./TopupProduct.module.css";
import TopupProductItem from "./TopupProductItem";

const GameForm = (props: { item: TopupProductFragment; slug?: string }) => {
  const { store } = useStore();
  const { code, userInput, id, topupProductItems } = props.item;
  const router = useRouter();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [method, setMethod] = useState(0);
  const [channel, setChannel] = useState<string | undefined>();

  const [transactionFee, setTransactionFee] = useState(1);

  // Use items from props instead of separate query
  const data = { topupProduct: { items: topupProductItems || [] } };
  const loadingItems = false;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      email: undefined,
      name: undefined,
      gateway: Gateway.Billplz,
    },
  });

  const [selectedItem, setSelectedItem] = useState<any>();

  const [userInputs, setUserInputs] = useState<any>([]);
  const [ign, setIgn] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const [createOrder] = useCreateAffiliateOrderMutation({
    onCompleted: (data) => {
      setTimeout(() => {
        if (data.createAffiliateOrder?.orderNumber) {
          checkOrder({
            variables: {
              orderNumber: data.createAffiliateOrder.orderNumber,
            },
          });
        }
      }, 1000);

      if (
        data.createAffiliateOrder?.errors &&
        data.createAffiliateOrder.errors.length > 0
      ) {
        setLoading(false);
        setErrorMsg(data.createAffiliateOrder.errors[0].detail);
        setErrorVisible(true);
      }
    },
    onError: (e) => {
      setLoading(false);
      setErrorMsg(e.message);
      setErrorVisible(true);
    },
  });

  const [validateGameAccount, { loading: validating }] =
    useValidateGameAccountMutation({
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        if (data?.validateGameAccount?.ign) {
          setErrorMsg(undefined);
          setIgn(data.validateGameAccount.ign);
          handlePrompt();
        } else if (data?.validateGameAccount?.errors) {
          setIgn(undefined);
          setErrorMsg(data?.validateGameAccount.errors[0].detail);
          setErrorVisible(true);
        }
      },
      onError: (e) => {
        setIgn(undefined);
        setErrorMsg(e.message);
        setErrorVisible(true);
      },
    });

  const handlePrompt = () => {
    setConfirmVisible(true);
  };

  const [checkOrder, { data: orderData }] = useCheckPaymentUrlLazyQuery({
    fetchPolicy: "network-only",
    pollInterval: 10000,
    onError: (e) => {
      alert("Failed to create order, please try again later");
      router.refresh();
    },
  });

  const [checkPendingOrder, { data: pendingData }] =
    useCheckPendingOrderLazyQuery({
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        if (data.checkPendingOrder) {
          const { paymentUrl, status, orderNumber } = data.checkPendingOrder;

          if (
            !!paymentUrl &&
            !!orderNumber &&
            ["pending", "processing"].includes(status)
          ) {
            router.push(`/orders/${orderNumber}`);
          }
        } else {
          onSubmit();
        }
      },
    });

  const onChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setErrorMsg(undefined);

    setUserInputs((prevInputs: any[]) => {
      const existing = prevInputs.find((input) => input.name === name);

      if (existing) {
        // Update existing input
        return prevInputs.map((input) =>
          input.name === name ? { ...input, value } : input,
        );
      } else {
        // Add new input
        return [...prevInputs, { name, value }];
      }
    });
  };

  const onClickSubmit = () => {
    if (loading || validating) return;

    validateGameAccount({
      variables: {
        id: props.item.id,
        userInputs: userInputs,
      },
    });
  };

  const onSelectFiuu = (val: string) => {
    setValue('gateway', Gateway.Fiuu);
    setChannel(val);
  }

  const beforeSubmit = handleSubmit(async (variables: any) => {
    setConfirmVisible(false);

    if (selectedItem) {
      setLoading(true);

      checkPendingOrder({
        variables: {
          email: variables.email,
        },
      });
    }
  });

  const onSubmit = handleSubmit(async (variables: any) => {
    if (selectedItem) {
      createOrder({
        variables: {
          ...variables,
          itemId: selectedItem.id,
          userInputs: userInputs,
          storeId: store?.id as string,
          redirectUrl: !!props.slug
            ? `https://store.kohai.gg/${props.slug}/orders/`
            : `${process.env.NEXT_PUBLIC_DOMAIN}orders/`,
          productId: id,
          channel: channel
        },
      });
    }
  });

  useEffect(() => {
    if (orderData?.affiliateOrder) {
      const { paymentUrl, status, orderNumber } = orderData.affiliateOrder;

      if (!!paymentUrl) {
        redirect(paymentUrl);
      }

      if (status !== "pending") {
        setLoading(false);
        router.push(`/orders/${orderNumber}`);
      }
    }
  }, [orderData]);

  useEffect(() => {
    if (store?.currency == CurrencyEnum.Sgd) {
      setValue("gateway", Gateway.Fiuu);
    }
  }, [store]);

  useEffect(() => {
    if (selectedItem) {
      if (watch("gateway") == Gateway.Fiuu) {
        const fee = parseFloat(
          (selectedItem.storePricing.sellingPrice * 0.06).toFixed(2),
        );
        setTransactionFee(fee < 1 ? 1.0 : fee);
      }
    }

    if (watch("gateway") == Gateway.Billplz) {
      setChannel(undefined);
      setTransactionFee(1);
    }
  }, [selectedItem, watch("gateway")]);

  const canSubmit =
    !errorMsg &&
    selectedItem &&
    !loading &&
    !!watch("email") &&
    !!watch("name") &&
    userInput?.fields.length == userInputs.length;

  const inputFields = userInput?.fields
    .map((i) => i.attrs?.placeholder)
    .join(" & ");

  const isDark = !!store?.backgroundColor
    ? isColorDark(String(store.backgroundColor))
    : true;

  const sharedStyle = `focus:border-opacity-1 w-full rounded border border-stroke border-opacity-30 px-4 py-3 focus-visible:outline-none dark:border-strokedark`;

  const inputStyle = store?.isPremium
    ? `${sharedStyle} rounded-xl bg-white/10 shadow-2xl backdrop-blur-lg focus:border-primary`
    : `${sharedStyle} bg-opacity-20 focus:border-primary dark:bg-meta-4 dark:focus:border-primary ${isDark ? "bg-white" : "bg-gray-400"}`;

  const selectedStyle = store?.isPremium ? styles.selected : "bg-success";

  return (
    <form>
      {validating && (
        <div
          style={{
            position: "fixed",
            zIndex: 9999,
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "rgba(0,0,0,0.6)",
          }}
          className="flex items-center justify-center"
        >
          <p>Validating game account...</p>
        </div>
      )}
      {loading ? (
        <>
          <div className="my-4 flex gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            <p className="opacity-60">Submitting your order...</p>
          </div>
          <p className="mb-2 opacity-90">Waiting too long?</p>
          <div
            className="inline-block cursor-pointer rounded bg-primary px-4 py-2 text-sm text-white"
            onClick={beforeSubmit}
          >
            Check my order
          </div>
        </>
      ) : (
        <>
          <LabelRow num="1" label={`Enter ${code} ${inputFields}`} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userInput?.fields &&
              userInput.fields.map((field) => (
                <div key={field.attrs?.key}>
                  {field.tag == "dropdown" ? (
                    <select
                      key={field.attrs?.key}
                      name={field.attrs?.key ?? ""}
                      id={field.attrs?.id ?? ""}
                      onChange={onChangeInput}
                      className={inputStyle}
                    >
                      <option value="">{field.attrs?.placeholder ?? ""}</option>
                      {(field.attrs?.datas ?? []).map((i) => (
                        <option key={i.value} value={i.value ?? ""}>
                          {i.text ?? ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      key={field.attrs?.key}
                      type={field.tag as string}
                      name={field.attrs?.key as string}
                      id={field.attrs?.id as string}
                      placeholder={field.attrs?.placeholder as string}
                      onChange={onChangeInput}
                      className={inputStyle}
                    />
                  )}
                </div>
              ))}
          </div>
          {!!errorMsg && <p className="mt-2 text-red-400">{errorMsg}</p>}
          {!!ign && (
            <p className="mt-2 text-green-400">Account validated: {ign}</p>
          )}
          <div className="mb-6"></div>
          <LabelRow num="2" label="Enter Email & Contact Number" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="w-full">
              <input
                type="email"
                placeholder="Enter E-mail address"
                id="email"
                className={inputStyle}
                defaultValue={watch("email")}
                {...register("email", {
                  required: "Email is required",
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter your phone number"
                id="name"
                className={inputStyle}
                defaultValue={watch("name")}
                {...register("name", {
                  required: "Phone number is required",
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
          <p className="mb-4 mt-2 text-gray-400">
            A confirmation email will be sent to your inbox as receipt
          </p>

          {store?.currency == CurrencyEnum.Myr && (
            <>
              <LabelRow num="3" label="Select payment channel" />
              <div className="mb-6 gap-4 md:grid md:grid-cols-3">
                <div
                  className={`cursor-pointer rounded  p-4 ${watch('gateway') == Gateway.Billplz ? "bg-success" : "bg-gray-300  bg-opacity-10"}`}
                  onClick={() => setValue('gateway', Gateway.Billplz)}
                >
                  <h4>FPX / Online Banking / E-Wallet</h4>
                </div>
                <div
                  className={`cursor-pointer rounded  p-4 ${channel == 'GrabPay' ? "bg-success" : "bg-gray-300 bg-opacity-10"}`}
                  onClick={() => onSelectFiuu('GrabPay')}
                >
                  <h4>GrapPay Later / Crypto</h4>
                </div>
              </div>
            </>
          )}

          <LabelRow
            num={store?.currency == CurrencyEnum.Myr ? "4" : "3"}
            label="Select Item"
          />
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingItems && (
              <div className="my-4 flex gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                <p className="opacity-60">Loading items...</p>
              </div>
            )}
            {data?.topupProduct.items &&
              data.topupProduct.items.map((i, index) => (
                <TopupProductItem
                  item={i}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  key={`item-${index}`}
                  showCost={false}
                />
              ))}
          </div>
        </>
      )}

      {selectedItem && (
        <div
          className={styles.checkoutBar}
          style={
            store?.isPremium
              ? { backgroundColor: "transparent" }
              : {
                  backgroundColor: isDark
                    ? (store?.footerColor ?? "#000")
                    : "#f0f0f0",
                }
          }
        >
          <div className="container mx-auto">
            <div
              className={
                store?.isPremium
                  ? `rounded-2xl bg-white/20 px-4 py-2 shadow-2xl backdrop-blur-lg`
                  : undefined
              }
            >
              <div className="items-center justify-between md:flex">
                <div className="flex items-center gap-3">
                  {!!selectedItem.iconUrl && (
                    <img src={selectedItem.iconUrl} className={styles.avatar} />
                  )}
                  <div>
                    <h4 className="text-lg font-bold">{selectedItem.name}</h4>
                    <p className="text-sm opacity-70">
                      {selectedItem?.storePricing?.formattedSellingPrice} +{" "}
                      {store?.fiatCurrency.symbol}
                      {transactionFee} transaction fee
                    </p>
                  </div>
                </div>
                <div className="items-center gap-3 md:flex">
                  <div className="jusitfy-between mt-2 flex gap-3 md:mt-0 md:block md:text-right">
                    <h4 className="text-sm md:mt-2">Total:</h4>
                    <p className="font-medium">
                      {store?.fiatCurrency.symbol}
                      {(
                        selectedItem.storePricing.sellingPrice + transactionFee
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`w-full cursor-pointer rounded px-4 py-3 text-center font-medium ${validating ? "bg-gray-400" : "bg-primary"}`}
                    style={{
                      backgroundColor:
                        canSubmit && !validating
                          ? (store?.buttonColor ?? undefined)
                          : "#ccc",
                      color: store?.backgroundColor ?? undefined,
                    }}
                    onClick={canSubmit ? onClickSubmit : undefined}
                  >
                    {validating ? "Checking Account..." : "BUY NOW"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        visible={confirmVisible}
        close={() => setConfirmVisible(false)}
        title={"Please double check your user ID"}
        description={`Are you sure you want to purchase this item for account ${ign}? You will be redirected to the payment page with total amount ${selectedItem?.formattedSellingPrice} plus ${store?.fiatCurrency.symbol}${transactionFee} transaction fee.`}
        confirm={beforeSubmit}
      />

      {!!errorMsg && (
        <AlertModal
          visible={errorVisible}
          close={() => setErrorVisible(false)}
          title={"Please double check your user ID"}
          description={errorMsg}
        />
      )}
    </form>
  );
};

export default GameForm;
