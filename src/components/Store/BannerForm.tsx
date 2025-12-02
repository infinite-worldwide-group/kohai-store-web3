"use client";

import { useStore } from "@/contexts/StoreContext";
import {
  useDeleteStoreBannerMutation,
  useUpdateBannersMutation,
} from "graphql/generated/graphql";
import { useForm } from "react-hook-form";
import ImagesInput from "../Inputs/ImagesInput";

const BannerForm = () => {
  const { store, setStore } = useStore();

  const { handleSubmit, register, setError, watch, setValue } = useForm();

  const [updateBanners, { loading: updating }] = useUpdateBannersMutation();

  const [deleteBanner, { loading: deleting }] = useDeleteStoreBannerMutation();

  const onSubmit = handleSubmit(async (input) => {
    const variables = {
      ...input,
    };

    const { data } = await updateBanners({
      variables,
    });

    if (data?.updateStoreBanners?.gamecreditStore) {
      alert("Banners uploaded successfully!");
    } else if (data?.updateStoreBanners?.errors) {
      alert(data?.updateStoreBanners?.errors[0].detail);
    }
  });

  return (
    <form>
      <div className="grid gap-4">
        <div>
          <label
            className="mb-3 block text-sm font-medium text-white"
            htmlFor="Store Icon"
          >
            Banners
          </label>
          <ImagesInput
            name="heroBanners"
            imageClass="max-h-64 rounded mx-auto"
            existingImageUrl={store?.heroBanners ? store?.heroBanners : []}
            setValue={setValue}
            register={() => register("heroBanners")}
            multiple
            watch={watch}
            deleteBanner={deleteBanner}
            loading={deleting || updating}
          >
            <div className="flex justify-center rounded border-2 border-dashed border-gray-300 px-6 pb-10 pt-10">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mx-auto mb-4 h-12 w-12 text-blue-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm leading-3 text-gray-400">Upload Images</p>
              </div>
            </div>
          </ImagesInput>
        </div>
      </div>

      <div className="flex justify-end gap-4.5">
        <button
          className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
          type="submit"
          onClick={onSubmit}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default BannerForm;
