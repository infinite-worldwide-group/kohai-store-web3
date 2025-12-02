"use client";

import { useState } from "react";
import BackgroundForm from "./BackgroundForm";
import BannerForm from "./BannerForm";
import ContactForm from "./ContactForm";
import PricingForm from "./PricingForm";
import SettingNavbar from "./SettingNavbar";
import StoreForm from "./StoreForm";
import ThemeForm from "./ThemeForm";

const StoreSettings = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div
      className="rounded-sm border border-strokedark bg-boxdark shadow-default"
      style={{ marginBottom: 240 }}
    >
      <div className="border-b border-strokedark px-7 py-4">
        <SettingNavbar
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </div>
      <div className="p-3 md:p-7">
        {currentIndex == 0 && <StoreForm />}
        {currentIndex == 1 && <ThemeForm />}
        {currentIndex == 2 && <PricingForm />}
        {currentIndex == 3 && <ContactForm />}
        {currentIndex == 4 && <BannerForm />}
        {currentIndex == 5 && <BackgroundForm />}
      </div>
    </div>
  );
};

export default StoreSettings;
