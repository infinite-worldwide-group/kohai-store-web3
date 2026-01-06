"use client";

import { useStore } from "@/contexts/StoreContext";
import { useUpdateContactsMutation } from "graphql/generated/graphql";
import { useForm } from "react-hook-form";

import {
  FaDiscord,
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaTiktok,
  FaTwitch,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { RiCustomerService2Line } from "react-icons/ri";

const ContactForm = () => {
  const { store, setStore } = useStore();

  const defaultValues = {
    fbUrl: store?.fbUrl ?? undefined,
    twitchUrl: store?.twitchUrl ?? undefined,
    youtubeUrl: store?.youtubeUrl ?? undefined,
    whatsappNumber: store?.whatsappNumber ?? undefined,
    discordUrl: store?.discordUrl ?? undefined,
    telegramNumber: store?.telegramNumber ?? undefined,
    tiktokUrl: store?.tiktokUrl ?? undefined,
    instagramUrl: store?.instagramUrl ?? undefined,
    csUrl: store?.csUrl ?? undefined,
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

  const [updateContacts] = useUpdateContactsMutation({
    onCompleted: (data) => {
      if (data?.updateStoreContacts?.gamecreditStore) {
        setStore(data.updateStoreContacts.gamecreditStore);
        alert("Contacts updated");
      }
    },
    onError: (e) => {
      alert(e);
    },
  });

  const onSubmit = (variables: any) => {
    updateContacts({
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
              htmlFor="fbUrl"
            >
              Facebook Link
            </label>
            <div className="relative">
              <FaFacebook className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("fbUrl")}
                {...register("fbUrl")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="tiktokUrl"
            >
              Tiktok Link
            </label>
            <div className="relative">
              <FaTiktok className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("tiktokUrl")}
                {...register("tiktokUrl")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="instagramUrl"
            >
              Instagram Link
            </label>
            <div className="relative">
              <FaInstagram className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("instagramUrl")}
                {...register("instagramUrl")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="fullName"
            >
              Discord Link
            </label>
            <div className="relative">
              <FaDiscord className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("discordUrl")}
                {...register("discordUrl")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="fullName"
            >
              Twitch Link
            </label>
            <div className="relative">
              <FaTwitch className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("twitchUrl")}
                {...register("twitchUrl")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="fullName"
            >
              YouTube Link
            </label>
            <div className="relative">
              <FaYoutube className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("youtubeUrl")}
                {...register("youtubeUrl")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="fullName"
            >
              Whatsapp Number
            </label>
            <div className="relative">
              <FaWhatsapp className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("whatsappNumber")}
                {...register("whatsappNumber")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="fullName"
            >
              Telegram Number
            </label>
            <div className="relative">
              <FaTelegram className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("telegramNumber")}
                {...register("telegramNumber")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="csUrl"
            >
              Customer Service Url
            </label>
            <div className="relative">
              <RiCustomerService2Line className="absolute left-4.5 top-4" />
              <input
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 py-3 pl-11.5 pr-4.5 text-white focus:border-primary focus-visible:outline-none"
                type="text"
                defaultValue={watch("csUrl")}
                {...register("csUrl")}
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
    </>
  );
};

export default ContactForm;
