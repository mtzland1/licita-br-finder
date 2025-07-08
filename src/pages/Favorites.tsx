
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BiddingCard from '@/components/BiddingCard';
import { useFavorites } from '@/contexts/FavoritesContext';
import { allMockBiddings } from '@/data/mockBiddings';
import { Heart, Clock, CheckCircle } from 'lucide-react';

const Favorites = () => {
  const { favorites } = useFavorites();

  const favoriteBiddings = useMemo(() => {
    return allMockBiddings.filter(bidding => favorites.includes(bidding._id));
  }, [favorites]);

  const openFavorites = useMemo(() => {
    return favoriteBiddings.filter(bidding => bidding.status === 'aberto');
  }, [favoriteBiddings]);

  const closedFavorites = useMemo(() => {
    return favoriteBiddings.filter(bidding => bidding.status === 'encerrado');
  }, [favoriteBiddings]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Favoritos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas licitações favoritas organizadas por status
        </p>
      </div>

      {/* Estatísticas dos Favoritos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Favoritos</p>
              <p className="text-2xl font-bold text-purple-700">{favoriteBiddings.length}</p>
            </div>
            <Heart className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Oportunidades Abertas</p>
              <p className="text-2xl font-bold text-green-700">{openFavorites.length}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Oportunidades Encerradas</p>
              <p className="text-2xl font-bold text-gray-700">{closedFavorites.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-600" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Abertas/Encerradas */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Oportunidades Abertas
            <Badge variant="secondary">{openFavorites.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Oportunidades Encerradas
            <Badge variant="secondary">{closedFavorites.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          {openFavorites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma licitação aberta favoritada
                </h3>
                <p className="text-gray-600">
                  Favorite licitações abertas para acompanhar as oportunidades disponíveis.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {openFavorites
                .sort((a, b) => new Date(b.dataPublicacaoPncp).getTime() - new Date(a.dataPublicacaoPncp).getTime())
                .map((bidding) => (
                  <BiddingCard key={bidding._id} bidding={bidding} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          {closedFavorites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma licitação encerrada favoritada
                </h3>
                <p className="text-gray-600">
                  Licitações encerradas que você favoritou aparecerão aqui para referência futura.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {closedFavorites
                .sort((a, b) => new Date(b.dataEncerramentoProposta).getTime() - new Date(a.dataEncerramentoProposta).getTime())
                .map((bidding) => (
                  <BiddingCard key={bidding._id} bidding={bidding} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Informação sobre favoritos */}
      {favoriteBiddings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Você ainda não tem favoritos
            </h3>
            <p className="text-gray-600 mb-4">
              Comece a favoritar licitações clicando no ícone de coração nos cards das licitações.
            </p>
            <div className="text-sm text-gray-500">
              <p>💡 Dica: Use os favoritos para acompanhar licitações de seu interesse</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Favorites;
