
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar favoritos do usuário
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('bidding_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao carregar favoritos:', error);
        toast({
          title: "Erro ao carregar favoritos",
          description: "Não foi possível carregar seus favoritos",
          variant: "destructive",
        });
      } else {
        setFavorites(data.map(fav => fav.bidding_id));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (biddingId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar editais",
        variant: "destructive",
      });
      return;
    }

    const isFav = favorites.includes(biddingId);

    try {
      if (isFav) {
        // Remover favorito
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('bidding_id', biddingId);

        if (error) {
          console.error('Erro ao remover favorito:', error);
          toast({
            title: "Erro ao remover favorito",
            description: "Não foi possível remover o favorito",
            variant: "destructive",
          });
        } else {
          setFavorites(prev => prev.filter(fav => fav !== biddingId));
          toast({
            title: "Favorito removido",
            description: "O edital foi removido dos seus favoritos",
          });
        }
      } else {
        // Adicionar favorito
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            bidding_id: biddingId
          });

        if (error) {
          console.error('Erro ao adicionar favorito:', error);
          toast({
            title: "Erro ao adicionar favorito",
            description: "Não foi possível adicionar o favorito",
            variant: "destructive",
          });
        } else {
          setFavorites(prev => [...prev, biddingId]);
          toast({
            title: "Favorito adicionado",
            description: "O edital foi adicionado aos seus favoritos",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      toggleFavorite, 
      isFavorite, 
      isLoading 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
