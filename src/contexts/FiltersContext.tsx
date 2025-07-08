
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  saveFilter: (filter: Omit<SavedFilter, 'id'>) => void;
  deleteFilter: (id: string) => void;
  updateFilter: (id: string, filter: Omit<SavedFilter, 'id'>) => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Converter strings de data de volta para objetos Date
      const withDates = parsed.map((filter: any) => ({
        ...filter,
        startDate: filter.startDate ? new Date(filter.startDate) : undefined,
        endDate: filter.endDate ? new Date(filter.endDate) : undefined,
      }));
      setSavedFilters(withDates);
    }
  }, []);

  const saveFilter = (filter: Omit<SavedFilter, 'id'>) => {
    const newFilter = {
      ...filter,
      id: Date.now().toString(),
    };
    
    setSavedFilters(prev => {
      const updated = [...prev, newFilter];
      localStorage.setItem('savedFilters', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFilter = (id: string) => {
    setSavedFilters(prev => {
      const updated = prev.filter(filter => filter.id !== id);
      localStorage.setItem('savedFilters', JSON.stringify(updated));
      return updated;
    });
  };

  const updateFilter = (id: string, filter: Omit<SavedFilter, 'id'>) => {
    setSavedFilters(prev => {
      const updated = prev.map(f => 
        f.id === id ? { ...filter, id } : f
      );
      localStorage.setItem('savedFilters', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <FiltersContext.Provider value={{ 
      savedFilters, 
      saveFilter, 
      deleteFilter, 
      updateFilter 
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
