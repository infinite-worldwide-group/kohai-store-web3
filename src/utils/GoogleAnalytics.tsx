import { useEffect } from "react";

const GoogleAnalytics = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-HQYBE9LLBH";
    document.head.appendChild(script);

    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-HQYBE9LLBH');
    `;
    document.head.appendChild(inlineScript);
  }, []);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;