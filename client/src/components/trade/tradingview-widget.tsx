import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface TradingViewWidgetProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  theme?: "light" | "dark";
  locale?: string;
  interval?: string;
}

let scriptLoadingPromise: Promise<void> | null = null;

// TradingView kütüphanesini yükleyen fonksiyon
const loadTradingViewScript = (): Promise<void> => {
  // Eğer daha önce Promise oluşturulduysa onu yeniden kullan
  if (scriptLoadingPromise !== null) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<void>((resolve) => {
    // Eğer TradingView halihazırda tanımlıysa hemen tamamla
    if (window.TradingView) {
      resolve();
      return;
    }

    // Script elementini oluştur ve body'e ekle
    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

export default function TradingViewWidget({
  symbol = "FX:EURUSD",
  width = "100%",
  height = 500,
  theme = "dark",
  locale = "en",
  interval = "D" // Günlük varsayılan
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // Uygun dil kodunu belirleme
    const getLocale = () => {
      const currentLang = i18n.language || "en";
      
      // TradingView'in desteklediği dil kodlarına dönüştürme
      switch (currentLang) {
        case "tr": return "tr";
        case "ar": return "ar";
        case "es": return "es";
        case "fr": return "fr";
        case "fa": return "fa_IR";
        case "ru": return "ru";
        case "zh": return "zh_CN";
        case "de": return "de_DE";
        default: return "en";
      }
    };
    
    // Widget oluşturma fonksiyonu
    const initWidget = () => {
      if (containerRef.current && window.TradingView) {
        // Önceki içeriği temizle
        containerRef.current.innerHTML = "";
        
        // Widget eğer döviz sembolüyse standart forex sembol formatını kullan, 
        // değilse muhtemelen bir kripto para veya hisse senedidir
        const formattedSymbol = symbol.includes(":") ? symbol : `BINANCE:${symbol}USD`;
        
        new window.TradingView.widget({
          autosize: true,
          symbol: formattedSymbol,
          interval: interval,
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: getLocale(),
          toolbar_bg: theme === "dark" ? "#1E222D" : "#F1F3F6",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          hide_side_toolbar: false,
          save_image: true,
          container_id: containerRef.current.id,
          studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
        });
      }
    };

    // Script ve widget yükleme
    const loadWidgetAsync = async () => {
      try {
        await loadTradingViewScript();
        initWidget();
      } catch (error) {
        console.error("TradingView widget yüklenirken hata oluştu:", error);
        
        // Yükleme başarısız olursa fallback içeriği göster
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${theme === "dark" ? "#fff" : "#333"}; background: ${theme === "dark" ? "#151924" : "#f5f5f5"};">
              <div style="margin-bottom: 10px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
              </div>
              <div style="font-weight: 500; font-size: 16px; margin-bottom: 8px;">Market data is loading</div>
              <div style="font-size: 14px; opacity: 0.7; text-align: center; max-width: 80%;">
                We're retrieving the latest financial data for ${symbol}
              </div>
            </div>
          `;
        }
      }
    };

    loadWidgetAsync();

    return () => {
      // Temizleme işlemi
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, theme, locale, interval, i18n.language]);

  // Benzersiz container ID
  const containerId = `tradingview-widget-${Math.floor(Math.random() * 1000000)}`;

  return (
    <div 
      ref={containerRef} 
      id={containerId}
      className="rounded-md overflow-hidden w-full"
      style={{ width, height }}
    />
  );
}

// Global tanımlamaları ekleyin
declare global {
  interface Window {
    TradingView: any;
  }
}