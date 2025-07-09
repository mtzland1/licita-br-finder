
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavedFilter {
  id: string;
  name: string;
  keywords: string;
  states: string[];
  modalities: string[];
  cities: string[];
  startDate?: Date;
  endDate?: Date;
  smartSearch: boolean;
}

interface FiltersContextType {
  savedFilters: SavedFilter[];
  saveFilter: (filter: Omit<SavedFilter, 'id'>) => Promise<void>;
  deleteFilter: (id: string) => Promise<void>;
  updateFilter: (id: string, filter: Omit<SavedFilter, 'id'>) => Promise<void>;
  isLoading: boolean;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar filtros salvos do usuário
  useEffect(() => {
    if (user) {
      loadSavedFilters();
    } else {
      setSavedFilters([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadSavedFilters = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar filtros salvos:', error);
        toast({
          title: "Erro ao carregar filtros",
          description: "Não foi possível carregar seus filtros salvos",
          variant: "destructive",
        });
      } else {
        const filters = data.map(filter => ({
          id: filter.id,
          name: filter.name,
          keywords: filter.keywords || '',
          states: filter.states || [],
          modalities: filter.modalities || [],
          cities: filter.cities || [],
          startDate: filter.start_date ? new Date(filter.start_date) : undefined,
          endDate: filter.end_date ? new Date(filter.end_date) : undefined,
          smartSearch: filter.smart_search || false,
        }));
        setSavedFilters(filters);
      }
    } catch (error) {
      console.error('Erro ao carregar filtros salvos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFilter = async (filter: Omit<SavedFilter, 'id'>) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para salvar filtros",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: user.id,
          name: filter.name,
          keywords: filter.keywords || null,
          states: filter.states.length > 0 ? filter.states : null,
          modalities: filter.modalities.length > 0 ? filter.modalities : null,
          cities: filter.cities.length > 0 ? filter.cities : null,
          start_date: filter.startDate ? filter.startDate.toISOString().split('T')[0] : null,
          end_date: filter.endDate ? filter.endDate.toISOString().split('T')[0] : null,
          smart_search: filter.smartSearch,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar filtro:', error);
        toast({
          title: "Erro ao salvar filtro",
          description: "Não foi possível salvar o filtro",
          variant: "destructive",
        });
      } else {
        const newFilter: SavedFilter = {
          id: data.id,
          name: data.name,
          keywords: data.keywords || '',
          states: data.states || [],
          modalities: data.modalities || [],
          cities: data.cities || [],
          startDate: data.start_date ? new Date(data.start_date) : undefined,
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          smartSearch: data.smart_search || false,
        };
        setSavedFilters(prev => [newFilter, ...prev]);
        toast({
          title: "Filtro salvo",
          description: "O filtro foi salvo com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar filtro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const deleteFilter = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar filtro:', error);
        toast({
          title: "Erro ao deletar filtro",
          description: "Não foi possível deletar o filtro",
          variant: "destructive",
        });
      } else {
        setSavedFilters(prev => prev.filter(filter => filter.id !== id));
        toast({
          title: "Filtro deletado",
          description: "O filtro foi deletado com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro ao deletar filtro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const updateFilter = async (id: string, filter: Omit<SavedFilter, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .update({
          name: filter.name,
          keywords: filter.keywords || null,
          states: filter.states.length > 0 ? filter.states : null,
          modalities: filter.modalities.length > 0 ? filter.modalities : null,
          cities: filter.cities.length > 0 ? filter.cities : null,
          start_date: filter.startDate ? filter.startDate.toISOString().split('T')[0] : null,
          end_date: filter.endDate ? filter.endDate.toISOString().split('T')[0] : null,
          smart_search: filter.smartSearch,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar filtro:', error);
        toast({
          title: "Erro ao atualizar filtro",
          description: "Não foi possível atualizar o filtro",
          variant: "destructive",
        });
      } else {
        const updatedFilter: SavedFilter = {
          id: data.id,
          name: data.name,
          keywords: data.keywords || '',
          states: data.states || [],
          modalities: data.modalities || [],
          cities: data.cities || [],
          startDate: data.start_date ? new Date(data.start_date) : undefined,
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          smartSearch: data.smart_search || false,
        };
        setSavedFilters(prev => prev.map(f => f.id === id ? updatedFilter : f));
        toast({
          title: "Filtro atualizado",
          description: "O filtro foi atualizado com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar filtro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  return (
    <FiltersContext.Provider value={{ 
      savedFilters, 
      saveFilter, 
      deleteFilter, 
      updateFilter,
      isLoading 
    }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
