
import { useQuery } from '@tanstack/react-query';
import { fetchEditais, fetchEditalById, getUniqueStates, getUniqueCities, getUniqueModalities } from '@/services/editaisService';
import { SearchFilters } from '@/types/bidding';

export const useEditais = (filters?: SearchFilters, page: number = 1, limit: number = 20) => {
  // Check if we should enable the query - only if there are search filters applied
  const shouldFetch = filters && (
    (filters.keywords && filters.keywords.trim()) ||
    (filters.states && filters.states.length > 0) ||
    (filters.cities && filters.cities.length > 0) ||
    (filters.modalities && filters.modalities.length > 0) ||
    filters.startDate ||
    filters.endDate
  );

  return useQuery({
    queryKey: ['editais', filters, page, limit],
    queryFn: () => fetchEditais(filters, page, limit),
    enabled: !!shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEdital = (id: string) => {
  return useQuery({
    queryKey: ['edital', id],
    queryFn: () => fetchEditalById(id),
    enabled: !!id,
  });
};

export const useStates = () => {
  return useQuery({
    queryKey: ['states'],
    queryFn: getUniqueStates,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCities = (state?: string) => {
  return useQuery({
    queryKey: ['cities', state],
    queryFn: () => getUniqueCities(state),
    enabled: true,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useModalities = () => {
  return useQuery({
    queryKey: ['modalities'],
    queryFn: getUniqueModalities,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
