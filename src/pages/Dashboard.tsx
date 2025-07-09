
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import BiddingCard from '@/components/BiddingCard';
import { useEditais } from '@/hooks/useEditais';
import { SearchFilters } from '@/types/bidding';
import { Search, TrendingUp, Clock, DollarSign, FileText, Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const Dashboard = () => {
  const [quickSearch, setQuickSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Create filters for the query
  const filters: SearchFilters = useMemo(() => ({
    keywords: quickSearch,
    states: [],
    modalities: [],
    cities: [],
    smartSearch: false,
  }), [quickSearch]);

  // Fetch editais data with pagination
  const { data: editaisData, isLoading, error } = useEditais(filters, currentPage, ITEMS_PER_PAGE);

  const editais = editaisData?.data || [];
  const total = editaisData?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const statistics = useMemo(() => {
    const openBiddings = editais.filter(b => b.status === 'aberto').length;
    const closedBiddings = editais.filter(b => b.status === 'encerrado').length;
    const totalValue = editais
      .filter(b => b.status === 'aberto')
      .reduce((sum, b) => sum + b.valorTotalEstimado, 0);
    const expiringSoon = editais.filter(b => {
      if (b.status !== 'aberto') return false;
      const now = new Date();
      const endDate = new Date(b.dataEncerramentoProposta);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length;

    return { openBiddings, closedBiddings, totalValue, expiringSoon };
  }, [editais]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe as licitações mais relevantes e recentes
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600">Erro ao carregar licitações. Tente novamente mais tarde.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Acompanhe as licitações mais relevantes e recentes
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licitações Abertas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {statistics.openBiddings}
            </div>
            <p className="text-xs text-muted-foreground">
              Oportunidades disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(statistics.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em licitações abertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirando em Breve</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {statistics.expiringSoon}
            </div>
            <p className="text-xs text-muted-foreground">
              Próximas 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {total}
            </div>
            <p className="text-xs text-muted-foreground">
              Processos cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Busca Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Rápida
          </CardTitle>
          <CardDescription>
            Pesquise por palavras-chave nas licitações abertas. Use ";" para separar múltiplas palavras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Ex: equipamentos; informática; escola"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              Buscar
            </Button>
            <Button variant="outline" onClick={() => {
              setQuickSearch('');
              setCurrentPage(1);
            }}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Licitações */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Licitações Mais Relevantes
          </h2>
          <Badge variant="outline">
            Página {currentPage} de {totalPages} - {total} resultados
          </Badge>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando licitações...</p>
            </CardContent>
          </Card>
        ) : editais.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma licitação encontrada
              </h3>
              <p className="text-gray-600">
                {quickSearch.trim() 
                  ? 'Tente ajustar os termos de busca ou limpar o filtro.'
                  : 'Não há licitações disponíveis no momento.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {editais.map((bidding) => (
              <BiddingCard 
                key={bidding._id} 
                bidding={bidding}
                highlightKeywords={quickSearch.split(';').map(k => k.trim()).filter(k => k)}
              />
            ))}
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
