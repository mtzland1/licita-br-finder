import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import BiddingCard from '@/components/BiddingCard';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useEditais } from '@/hooks/useEditais';
import { Heart, Clock, CheckCircle, Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const Favorites = () => {
  const { favorites } = useFavorites();
  
  const [openCurrentPage, setOpenCurrentPage] = useState(1);
  const [closedCurrentPage, setClosedCurrentPage] = useState(1);

  const { data: allEditaisData, isLoading } = useEditais(undefined, 1, 1000);
  
  const favoriteBiddings = useMemo(() => {
    if (!allEditaisData?.data) return [];
    return allEditaisData.data.filter(bidding => favorites.includes(bidding._id));
  }, [allEditaisData?.data, favorites]);

  const openFavorites = useMemo(() => {
    return favoriteBiddings.filter(bidding => bidding.status === 'aberto');
  }, [favoriteBiddings]);

  const closedFavorites = useMemo(() => {
    return favoriteBiddings.filter(bidding => bidding.status === 'encerrado');
  }, [favoriteBiddings]);

  // Lógica de paginação
  const openTotalPages = Math.ceil(openFavorites.length / ITEMS_PER_PAGE);
  const closedTotalPages = Math.ceil(closedFavorites.length / ITEMS_PER_PAGE);

  const paginatedOpenFavorites = useMemo(() => {
    const startIndex = (openCurrentPage - 1) * ITEMS_PER_PAGE;
    return openFavorites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [openFavorites, openCurrentPage]);
  
  const paginatedClosedFavorites = useMemo(() => {
    const startIndex = (closedCurrentPage - 1) * ITEMS_PER_PAGE;
    return closedFavorites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [closedFavorites, closedCurrentPage]);

  const handleOpenPageChange = (page: number) => {
    if (page >= 1 && page <= openTotalPages) {
      setOpenCurrentPage(page);
      window.scrollTo({ top: 400, behavior: 'smooth' }); // Ajustado para rolar abaixo dos cards
    }
  };

  const handleClosedPageChange = (page: number) => {
    if (page >= 1 && page <= closedTotalPages) {
      setClosedCurrentPage(page);
      window.scrollTo({ top: 400, behavior: 'smooth' }); // Ajustado para rolar abaixo dos cards
    }
  };
  
  const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
      let pageNum;
      if (totalPages <= 5) pageNum = i + 1;
      else if (currentPage <= 3) pageNum = i + 1;
      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
      else pageNum = currentPage - 2 + i;
      return pageNum;
    });

    return (
      <div className="flex justify-center mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
            {pageNumbers.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink onClick={() => onPageChange(pageNum)} isActive={currentPage === pageNum} className="cursor-pointer">{pageNum}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => onPageChange(currentPage + 1)} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  if (isLoading) { /* ... (código do loading inalterado) ... */ }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Favoritos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas licitações favoritas organizadas por status
        </p>
      </div>

      {/* Estatísticas dos Favoritos (REINSERIDO AQUI) */}
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

      {/* Tabs para Abertas/Encerradas (JÁ EXISTIAM E FORAM MANTIDAS) */}
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
          {paginatedOpenFavorites.length === 0 ? (
            <Card> {/* ... (mensagem de "nenhuma licitação") ... */} </Card>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedOpenFavorites
                  .sort((a, b) => new Date(b.dataPublicacaoPncp).getTime() - new Date(a.dataPublicacaoPncp).getTime())
                  .map((bidding) => (
                    <BiddingCard key={bidding._id} bidding={bidding} />
                  ))}
              </div>
              <PaginationControls 
                currentPage={openCurrentPage}
                totalPages={openTotalPages}
                onPageChange={handleOpenPageChange}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          {paginatedClosedFavorites.length === 0 ? (
            <Card> {/* ... (mensagem de "nenhuma licitação") ... */} </Card>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedClosedFavorites
                  .sort((a, b) => new Date(b.dataEncerramentoProposta).getTime() - new Date(a.dataEncerramentoProposta).getTime())
                  .map((bidding) => (
                    <BiddingCard key={bidding._id} bidding={bidding} />
                  ))}
              </div>
              <PaginationControls 
                currentPage={closedCurrentPage}
                totalPages={closedTotalPages}
                onPageChange={handleClosedPageChange}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Favorites;