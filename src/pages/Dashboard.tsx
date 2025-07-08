
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BiddingCard from '@/components/BiddingCard';
import { allMockBiddings } from '@/data/mockBiddings';
import { Search, TrendingUp, Clock, DollarSign, FileText } from 'lucide-react';

const Dashboard = () => {
  const [quickSearch, setQuickSearch] = useState('');

  // Filtrar licitações mais relevantes (abertas e recentes)
  const relevantBiddings = useMemo(() => {
    let filtered = allMockBiddings
      .filter(bidding => bidding.status === 'aberto')
      .sort((a, b) => new Date(b.dataPublicacaoPncp).getTime() - new Date(a.dataPublicacaoPncp).getTime())
      .slice(0, 50);

    if (quickSearch.trim()) {
      const keywords = quickSearch.toLowerCase().split(';').map(k => k.trim());
      filtered = filtered.filter(bidding =>
        keywords.some(keyword =>
          bidding.objetoCompra.toLowerCase().includes(keyword) ||
          bidding.orgaoEntidade.razaoSocial.toLowerCase().includes(keyword) ||
          bidding.unidadeOrgao.municipioNome.toLowerCase().includes(keyword)
        )
      );
    }

    return filtered;
  }, [quickSearch]);

  const statistics = useMemo(() => {
    const openBiddings = allMockBiddings.filter(b => b.status === 'aberto').length;
    const closedBiddings = allMockBiddings.filter(b => b.status === 'encerrado').length;
    const totalValue = allMockBiddings
      .filter(b => b.status === 'aberto')
      .reduce((sum, b) => sum + b.valorTotalEstimado, 0);
    const expiringSoon = allMockBiddings.filter(b => {
      if (b.status !== 'aberto') return false;
      const now = new Date();
      const endDate = new Date(b.dataEncerramentoProposta);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length;

    return { openBiddings, closedBiddings, totalValue, expiringSoon };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
              {statistics.openBiddings + statistics.closedBiddings}
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
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setQuickSearch('')}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Licitações */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Licitações Mais Relevantes
          </h2>
          <Badge variant="outline">
            {relevantBiddings.length} de {statistics.openBiddings} abertas
          </Badge>
        </div>

        {relevantBiddings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma licitação encontrada
              </h3>
              <p className="text-gray-600">
                {quickSearch.trim() 
                  ? 'Tente ajustar os termos de busca ou limpar o filtro.'
                  : 'Não há licitações abertas no momento.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {relevantBiddings.map((bidding) => (
              <BiddingCard 
                key={bidding._id} 
                bidding={bidding}
                highlightKeywords={quickSearch.split(';').map(k => k.trim()).filter(k => k)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
