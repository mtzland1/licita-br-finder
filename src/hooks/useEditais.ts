import { useQuery } from '@tanstack/react-query';
import { fetchEditais, fetchEditalById, getUniqueStates, getUniqueCities, getUniqueModalities } from '@/services/editaisService';
import { SearchFilters } from '@/types/bidding';

export const useEditais = (filters?: SearchFilters, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['editais', filters, page, limit],
    queryFn: () => fetchEditais(filters, page, limit),
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

// ✅ CORRIGIDO: O hook agora aceita um array de estados (string[])
export const useCities = (states: string[]) => {
  return useQuery({
    // A chave da query agora depende do array para recarregar quando ele muda
    queryKey: ['cities', states],
    // A função do serviço é chamada com o array de estados
    queryFn: () => getUniqueCities(states),
    // A busca só é ativada se o array de estados não estiver vazio
    enabled: !!states && states.length > 0,
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