/**
 * Bu dosya, fiyat değişim yüzdelerini 100 kat büyüterek göstermek için kullanılır.
 * Bu sayede %0.02 gibi bir değişim kullanıcıya %2 olarak gösterilir.
 */

// Yüzde değişimi büyütme çarpanı
export const PRICE_CHANGE_DISPLAY_MULTIPLIER = 100;

/**
 * Gerçek değişim yüzdesinden gösterim değerini hesaplar (100 kat büyütülmüş)
 * @param actualChangePercent Gerçek değişim yüzdesi
 * @returns Gösterim için büyütülmüş değişim yüzdesi
 */
export function getDisplayChangePercent(actualChangePercent: number): number {
  return actualChangePercent * PRICE_CHANGE_DISPLAY_MULTIPLIER;
}

/**
 * Büyütülmüş gösterim değerinden gerçek değişim yüzdesini hesaplar
 * @param displayChangePercent Gösterim için büyütülmüş değişim yüzdesi
 * @returns Gerçek değişim yüzdesi
 */
export function getActualChangePercent(displayChangePercent: number): number {
  return displayChangePercent / PRICE_CHANGE_DISPLAY_MULTIPLIER;
}