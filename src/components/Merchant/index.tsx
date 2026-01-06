import Image from "next/image";

const MerchantSettings = (props: {}) => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <Image src="/images/logo.png" width="100" height="40" alt="logo" />
      </div>
    </header>
  );
};

export default MerchantSettings;
