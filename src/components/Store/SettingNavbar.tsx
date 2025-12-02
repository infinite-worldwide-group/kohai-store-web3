const SettingNavbar = (props: {
  currentIndex: number;
  setCurrentIndex: (arg: number) => void;
}) => {
  const { currentIndex, setCurrentIndex } = props;

  return (
    <div className="flex flex-row gap-6">
      <h3
        className={`cursor-pointer border-solid border-primary font-medium text-gray-400 dark:border-white dark:text-gray-400 dark:hover:text-white ${currentIndex == 0 && "border-b-2 text-primary dark:text-white"}`}
        onClick={() => setCurrentIndex(0)}
      >
        Store
      </h3>
      <h3
        className={`cursor-pointer border-solid border-primary font-medium text-gray-400 dark:border-white dark:text-gray-400 dark:hover:text-white ${currentIndex == 1 && "border-b-2 text-primary dark:text-white"}`}
        onClick={() => setCurrentIndex(1)}
      >
        Theme
      </h3>
      <h3
        className={`cursor-pointer border-solid border-primary font-medium text-gray-400 dark:border-white dark:text-gray-400 dark:hover:text-white ${currentIndex == 2 && "border-b-2 text-primary dark:text-white"}`}
        onClick={() => setCurrentIndex(2)}
      >
        Pricing
      </h3>
      <h3
        className={`cursor-pointer border-solid border-primary font-medium text-gray-400 dark:border-white dark:text-gray-400 dark:hover:text-white ${currentIndex == 3 && "border-b-2 text-primary dark:text-white"}`}
        onClick={() => setCurrentIndex(3)}
      >
        Contacts
      </h3>
      <h3
        className={`cursor-pointer border-solid border-primary font-medium text-gray-400 dark:border-white dark:text-gray-400 dark:hover:text-white ${currentIndex == 4 && "border-b-2 text-primary dark:text-white"}`}
        onClick={() => setCurrentIndex(4)}
      >
        Banners
      </h3>
      <h3
        className={`cursor-pointer border-solid border-primary font-medium text-gray-400 dark:border-white dark:text-gray-400 dark:hover:text-white ${currentIndex == 5 && "border-b-2 text-primary dark:text-white"}`}
        onClick={() => setCurrentIndex(5)}
      >
        Background
      </h3>
    </div>
  );
};

export default SettingNavbar;
