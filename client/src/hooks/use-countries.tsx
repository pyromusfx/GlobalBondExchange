import { useQuery } from "@tanstack/react-query";
import { CountryShare } from "@shared/schema";

// Hook for fetching all countries
export function useAllCountries() {
  return useQuery<CountryShare[]>({
    queryKey: ['/api/countries'],
    staleTime: 60000, // 1 minute
  });
}

// Hook for fetching featured countries (for homepage)
export function useFeaturedCountries() {
  return useQuery<CountryShare[]>({
    queryKey: ['/api/countries/featured'],
    staleTime: 60000, // 1 minute
  });
}

// Hook for fetching presale countries
export function usePresaleCountries() {
  return useQuery<CountryShare[]>({
    queryKey: ['/api/presale'],
    staleTime: 60000, // 1 minute
  });
}

// Hook for fetching a single country by code
export function useCountry(countryCode: string | undefined) {
  return useQuery<CountryShare>({
    queryKey: [`/api/countries/${countryCode}`],
    enabled: !!countryCode,
    staleTime: 30000, // 30 seconds
  });
}

// Hook for fetching user's holdings
export function useUserHoldings() {
  return useQuery<any[]>({
    queryKey: ['/api/holdings'],
    staleTime: 10000, // 10 seconds
  });
}

// Hook for fetching user's transactions
export function useUserTransactions() {
  return useQuery<any[]>({
    queryKey: ['/api/transactions'],
    staleTime: 10000, // 10 seconds
  });
}
