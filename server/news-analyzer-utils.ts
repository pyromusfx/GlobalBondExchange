// Fiyat geçmişi verilerini saklayacak nesne
const priceHistories: { [countryCode: string]: any[] } = {};

/**
 * Bir ülke için fiyat geçmişi verilerini kaydeder
 * @param countryCode Ülke kodu
 * @param priceHistory Fiyat geçmişi verileri
 */
export async function savePriceHistoryForCountry(countryCode: string, priceHistory: any[]) {
  // Verileri bellek içinde saklıyoruz
  priceHistories[countryCode] = priceHistory;
}

/**
 * Bir ülke için fiyat geçmişi verilerini alır
 * @param countryCode Ülke kodu
 * @returns Fiyat geçmişi verileri
 */
export function getPriceHistoryForCountry(countryCode: string) {
  // Eğer hafızada bu ülke için veri yoksa, boş dizi döndür
  // generatePriceHistoryForCountry işlemini dışarıda yap
  return priceHistories[countryCode] || [];
}

/**
 * Yeni fiyat noktası ekler
 * @param countryCode Ülke kodu
 * @param price Yeni fiyat
 */
export function appendLatestPriceForCountry(countryCode: string, price: number) {
  // Eğer fiyat geçmişi yoksa, oluştur
  if (!priceHistories[countryCode]) {
    priceHistories[countryCode] = [];
  }
  
  const now = new Date();
  const today = Math.floor(now.getTime() / 1000);
  
  if (priceHistories[countryCode].length === 0) {
    // İlk veri noktası
    priceHistories[countryCode].push({
      time: today,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1000
    });
    return;
  }
  
  const lastPoint = priceHistories[countryCode][priceHistories[countryCode].length - 1];
  
  // Eğer aynı gün içinde bir güncelleme ise, son noktayı güncelle
  if (lastPoint.time === today) {
    lastPoint.close = price;
    lastPoint.high = Math.max(lastPoint.high, price);
    lastPoint.low = Math.min(lastPoint.low, price);
    lastPoint.volume += Math.floor(Math.random() * 100);
  } else {
    // Yeni bir gün için yeni veri noktası ekle
    priceHistories[countryCode].push({
      time: today,
      open: lastPoint.close,
      high: Math.max(price, lastPoint.close),
      low: Math.min(price, lastPoint.close),
      close: price,
      volume: Math.floor(Math.random() * 1000) + 500
    });
  }
}