// Ülke kodu -> Para birimi sembolü dönüşüm haritası
const countryToCurrencyMap: Record<string, string> = {
  "US": "USD", // Amerikan Doları
  "EU": "EUR", // Euro
  "GB": "GBP", // İngiliz Sterlini
  "JP": "JPY", // Japon Yeni
  "AU": "AUD", // Avustralya Doları
  "CA": "CAD", // Kanada Doları
  "CH": "CHF", // İsviçre Frangı
  "CN": "CNY", // Çin Yuanı
  "HK": "HKD", // Hong Kong Doları
  "NZ": "NZD", // Yeni Zelanda Doları
  "SE": "SEK", // İsveç Kronu
  "KR": "KRW", // Güney Kore Wonu
  "SG": "SGD", // Singapur Doları
  "NO": "NOK", // Norveç Kronu
  "MX": "MXN", // Meksika Pezosu
  "IN": "INR", // Hindistan Rupisi
  "RU": "RUB", // Rus Rublesi
  "ZA": "ZAR", // Güney Afrika Randı
  "BR": "BRL", // Brezilya Reali
  "TR": "TRY", // Türk Lirası
  // Daha fazla para birimi eklenebilir
};

// Majör forex çiftleri
const majorForexPairs = [
  "EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCHF", "USDCAD", "NZDUSD"
];

/**
 * Ülke kodundan forex sembolü oluşturur
 * @param countryCode Ülke kodu (örn. "US", "GB", "JP")
 * @param baseCurrency Temel para birimi (varsayılan USD)
 * @returns TradingView için forex sembolü (örn. "FX:EURUSD", "FX:USDJPY")
 */
export function getForexSymbol(countryCode: string, baseCurrency = "USD"): string {
  const currency = countryToCurrencyMap[countryCode];
  
  if (!currency) {
    // Eğer ülke kodu bilinmiyorsa, varsayılan olarak EURUSD çiftini göster
    return "FX:EURUSD";
  }
  
  // USD temel para birimi olduğunda
  if (baseCurrency === "USD") {
    // USD/XXX formatında olanlar için tersine çevir
    if (currency === "USD") {
      return "FX:EURUSD"; // USD'nin kendisi için EUR/USD göster
    } else {
      // XXX/USD veya USD/XXX formatını belirle
      // Bazı para birimleri için USD önce gelir (örn. USD/JPY)
      const isUsdFirst = ["JPY", "CHF", "CAD", "MXN", "ZAR", "TRY", "HKD", "SGD", "NOK", "SEK"].includes(currency);
      
      return isUsdFirst 
        ? `FX:USD${currency}` 
        : `FX:${currency}USD`;
    }
  }
  
  // Özel bir temel para birimi belirtildiyse
  if (baseCurrency === currency) {
    return "FX:EURUSD"; // Aynı para birimi durumunda varsayılan göster
  }
  
  return `FX:${currency}${baseCurrency}`;
}

/**
 * Ülke kodundan hisse senedi piyasası sembolünü oluşturur
 * @param countryCode Ülke kodu (örn. "US", "GB", "JP")
 * @returns TradingView için piyasa endeksi sembolü
 */
export function getStockMarketSymbol(countryCode: string): string {
  switch (countryCode) {
    case "US": return "FOREXCOM:SPXUSD"; // S&P 500
    case "GB": return "FOREXCOM:UKXGBP"; // FTSE 100
    case "JP": return "TVC:NI225";      // Nikkei 225
    case "DE": return "FOREXCOM:DEFDE"; // DAX
    case "FR": return "EURONEXT:PX1";   // CAC 40
    case "CN": return "SSE:000001";     // Shanghai Composite
    case "HK": return "HKEX:HSI";       // Hang Seng
    case "AU": return "ASX:XJO";        // ASX 200
    case "CA": return "TSX:TSX";        // S&P/TSX Composite
    case "IN": return "NSE:NIFTY";      // NIFTY 50
    case "KR": return "KRX:KOSPI";      // KOSPI
    case "BR": return "BMFBOVESPA:IBOV"; // Bovespa
    case "RU": return "MOEX:IMOEX";     // MOEX Russia Index
    case "IT": return "MIL:FTSEMIB";    // FTSE MIB
    case "ES": return "BME:IBEX";       // IBEX 35
    case "MX": return "BMV:ME";         // IPC Mexico
    case "SG": return "SGX:STI";        // Straits Times Index
    case "CH": return "SIX:SMI";        // Swiss Market Index
    case "ZA": return "JSE:TOP40";      // FTSE/JSE Top 40
    case "TR": return "BIST:XU100";     // BIST 100
    // Daha fazla piyasa endeksi eklenebilir
    default: return "FOREXCOM:SPXUSD";  // Varsayılan olarak S&P 500
  }
}

/**
 * Ülkenin ekonomisi ve döviz kuru ile ilgili sembolleri döndürür
 * @param countryCode Ülke kodu (örn. "US", "GB", "JP")
 * @returns {Object} Forex, endeks ve ekonomik gösterge sembolleri
 */
export function getCountryEconomicSymbols(countryCode: string) {
  return {
    forex: getForexSymbol(countryCode),
    stockMarket: getStockMarketSymbol(countryCode),
    bonds: getBondSymbol(countryCode),
    inflation: getInflationSymbol(countryCode),
    gdp: getGDPSymbol(countryCode)
  };
}

/**
 * Ülke tahvil göstergesini döndürür
 */
function getBondSymbol(countryCode: string): string {
  switch (countryCode) {
    case "US": return "TVC:US10Y"; // ABD 10 yıllık tahvil
    case "GB": return "TVC:GB10Y"; // İngiltere 10 yıllık tahvil
    case "DE": return "TVC:DE10Y"; // Almanya 10 yıllık tahvil
    case "JP": return "TVC:JP10Y"; // Japonya 10 yıllık tahvil
    case "FR": return "TVC:FR10Y"; // Fransa 10 yıllık tahvil
    case "IT": return "TVC:IT10Y"; // İtalya 10 yıllık tahvil
    case "ES": return "TVC:ES10Y"; // İspanya 10 yıllık tahvil
    case "AU": return "TVC:AU10Y"; // Avustralya 10 yıllık tahvil
    case "CA": return "TVC:CA10Y"; // Kanada 10 yıllık tahvil
    case "CH": return "TVC:CH10Y"; // İsviçre 10 yıllık tahvil
    case "CN": return "TVC:CN10Y"; // Çin 10 yıllık tahvil
    case "BR": return "TVC:BR10Y"; // Brezilya 10 yıllık tahvil
    case "IN": return "TVC:IN10Y"; // Hindistan 10 yıllık tahvil
    case "MX": return "TVC:MX10Y"; // Meksika 10 yıllık tahvil
    case "RU": return "TVC:RU10Y"; // Rusya 10 yıllık tahvil
    case "TR": return "TVC:TR10Y"; // Türkiye 10 yıllık tahvil
    // Daha fazla ülke tahvili eklenebilir
    default: return "TVC:US10Y"; // Varsayılan olarak ABD 10 yıllık tahvil
  }
}

/**
 * Ülkenin enflasyon verileri için bir sembol döndürür 
 * (TradingView'da direkt olarak mevcut olmayabilir, bu kısım bilgilendirme amaçlıdır)
 */
function getInflationSymbol(countryCode: string): string {
  // Gerçekte çoğu enflasyon verisi TradingView'da direkt gösterge olarak mevcut değildir
  // Bu daha çok temsili veya bilgilendirme amaçlıdır
  return `${countryCode}_CPI`;
}

/**
 * Ülkenin GSYH verileri için bir sembol döndürür
 * (TradingView'da direkt olarak mevcut olmayabilir, bu kısım bilgilendirme amaçlıdır)
 */
function getGDPSymbol(countryCode: string): string {
  // Gerçekte çoğu GSYH verisi TradingView'da direkt gösterge olarak mevcut değildir
  // Bu daha çok temsili veya bilgilendirme amaçlıdır
  return `${countryCode}_GDP`;
}