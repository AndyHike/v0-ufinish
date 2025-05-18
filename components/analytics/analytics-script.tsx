"use client"

import { useEffect } from "react"
import Script from "next/script"

export function AnalyticsScript() {
  useEffect(() => {
    // Ініціалізація Facebook Pixel
    if (typeof window !== "undefined" && !(window as any).fbq) {
      ;(window as any).fbq = () => {
        ;(window as any).fbq.callMethod
          ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
          : (window as any).fbq.queue.push(arguments)
      }

      if (!(window as any)._fbq) (window as any)._fbq = (window as any).fbq
      ;(window as any).fbq.push = (window as any).fbq
      ;(window as any).fbq.loaded = true
      ;(window as any).fbq.version = "2.0"
      ;(window as any).fbq.queue = []
    }
  }, [])

  return (
    <>
      {/* Google Analytics Script */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-MEASUREMENT-ID" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YOUR-MEASUREMENT-ID');
        `}
      </Script>

      {/* Facebook Pixel Script */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', 'YOUR-PIXEL-ID');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=YOUR-PIXEL-ID&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  )
}
