import React from 'react';
import { CountryShare } from '@shared/schema';
import CountryChart from './country-chart';

interface TradingViewProps {
  country: CountryShare;
}

/**
 * Haberlere göre güncellenen fiyat verilerini kullanan geliştirilmiş
 * ticaret grafiği bileşeni.
 */
export default function EnhancedTradingView({ country }: TradingViewProps) {
  return (
    <CountryChart country={country} className="w-full h-[400px]" />
  );
}