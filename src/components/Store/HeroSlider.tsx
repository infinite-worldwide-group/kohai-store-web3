"use client";
import { useStore } from "@/contexts/StoreContext";
import { EmblaOptionsType } from "embla-carousel";

import EmblaCarousel from "../Carousel";

const HeroSlider = (props: {}) => {
  const { store } = useStore();

  const OPTIONS: EmblaOptionsType = { loop: true };
  const SLIDES = store?.heroBanners ?? [];

  if (!store?.heroBanners || store?.heroBanners?.length < 1) return null;

  return <EmblaCarousel slides={SLIDES} options={OPTIONS} />;
};

export default HeroSlider;
