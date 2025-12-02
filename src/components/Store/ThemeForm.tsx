"use client";

import { useStore } from "@/contexts/StoreContext";
import { useUpdateThemeMutation } from "graphql/generated/graphql";
import { useForm } from "react-hook-form";
import styles from "./Merchant.module.css";

type Theme = {
  header: string;
  footer: string;
  button: string;
  background: string;
  text: string;
  hyperlink: string;
};

const ThemeForm = () => {
  const { store, setStore } = useStore();

  const defaultValues = {
    headerColor: store?.headerColor ?? "#DB292F",
    footerColor: store?.footerColor ?? "#3D0708",
    buttonColor: store?.buttonColor ?? "#DB292F",
    backgroundColor: store?.backgroundColor ?? "#1A202C",
    textColor: store?.textColor ?? "#FFFFFF",
    hyperlinkColor: store?.hyperlinkColor ?? "#22BCFF",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm({
    defaultValues: defaultValues,
  });

  const [updateTheme] = useUpdateThemeMutation({
    onCompleted: (data) => {
      if (data?.updateStoreTheme?.gamecreditStore) {
        setStore(data.updateStoreTheme.gamecreditStore);
        alert("Theme updated");
      }
    },
    onError: (e) => {
      alert(e);
    },
  });

  const onSubmit = (variables: any) => {
    updateTheme({
      variables: {
        ...variables,
      },
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5.5 grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="headerColor"
            >
              Header Color
            </label>
            <div className="relative">
              <span
                className={styles.colorLegend}
                style={{ backgroundColor: watch("headerColor") }}
              ></span>
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("headerColor")}
                {...register("headerColor", {
                  required: "Header Color is required",
                })}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="footerColor"
            >
              Footer Color
            </label>
            <div className="relative">
              <span
                className={styles.colorLegend}
                style={{ backgroundColor: watch("footerColor") }}
              ></span>
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("headerColor")}
                {...register("footerColor", {
                  required: "Footer Color is required",
                })}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="buttonColor"
            >
              Button Color
            </label>
            <div className="relative">
              <span
                className={styles.colorLegend}
                style={{ backgroundColor: watch("buttonColor") }}
              ></span>
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("buttonColor")}
                {...register("buttonColor", {
                  required: "Button Color is required",
                })}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="backgroundColor"
            >
              Background Color
            </label>
            <div className="relative">
              <span
                className={styles.colorLegend}
                style={{ backgroundColor: watch("backgroundColor") }}
              ></span>
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("backgroundColor")}
                {...register("backgroundColor", {
                  required: "Background Color is required",
                })}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="textColor"
            >
              Text Color
            </label>
            <div className="relative">
              <span
                className={styles.colorLegend}
                style={{ backgroundColor: watch("textColor") }}
              ></span>
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("headerColor")}
                {...register("textColor", {
                  required: "Text Color is required",
                })}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="hyperlinkColor"
            >
              Hyperlink Color
            </label>
            <div className="relative">
              <span
                className={styles.colorLegend}
                style={{ backgroundColor: watch("hyperlinkColor") }}
              ></span>
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("headerColor")}
                {...register("hyperlinkColor", {
                  required: "Hyperlink Color is required",
                })}
              />
            </div>
          </div>
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

      <div
        className={styles.previewContainer}
        style={{ backgroundColor: watch("backgroundColor") }}
      >
        <div
          className={styles.previewHeader}
          style={{ backgroundColor: watch("headerColor") }}
        ></div>
        <div
          className={styles.previewBody}
          style={{ backgroundColor: watch("backgroundColor") }}
        >
          <p style={{ color: watch("textColor") }}>
            This is preview{" "}
            <span style={{ color: watch("hyperlinkColor") }}>link</span>
          </p>
          <button
            className={styles.previewButton}
            style={{ backgroundColor: watch("buttonColor") }}
          >
            button
          </button>
        </div>
        <div
          className={styles.previewFooter}
          style={{ backgroundColor: watch("footerColor") }}
        ></div>
      </div>
    </>
  );
};

export default ThemeForm;
