"use client";

import { useState } from "react";
import ApiForm from "./ApiForm";
import SettingNavbar from "./SettingNavbar";
import WhitelistForm from "./WhitelistForm";

const MerchantSettings = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div
      className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      style={{ marginBottom: 240 }}
    >
      <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
        <SettingNavbar
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </div>
      <div className="p-3 md:p-7">
        {currentIndex == 0 && <ApiForm />}
        {currentIndex == 1 && <WhitelistForm />}
      </div>
    </div>
  );
};

export default MerchantSettings;
