import { useEffect } from "react";

const FacebookPixel = () => {
  useEffect(() => {
    const pixelMap = {
      "store.kohai.gg": "4139187656314847",
      "www.ohahastore.com": "1223742869546092",
      "www.obotshop.com": "727748383158487",
      "www.karrashop.com": "699683936095410",
    };

    const hostname = window.location.hostname;
    const pixelId = pixelMap[hostname];

    if (!pixelId || window.fbq) return;

    // Inject Pixel script
    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src='https://connect.facebook.net/en_US/fbevents.js';
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script');

      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Optional: Add <noscript> fallback as invisible img
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
    `;
    document.body.appendChild(noscript);
  }, []);

  return null;
};

export default FacebookPixel;
