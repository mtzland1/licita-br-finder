
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import BiddingCard from '@/components/BiddingCard';
import { allMockBiddings } from '@/data/mockBiddings';
import { SearchFilters } from '@/types/bidding';
import { Search as SearchIcon, Filter, ChevronDown, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Search = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    states: [],
    modalities: [],
    cities: [],
    smartSearch: true,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const availableStates = useMemo(() => {
    const states = Array.from(new Set(allMockBiddings.map(b => b.unidadeOrgao.ufSigla)));
    return states.sort();
  }, []);

  const availableModalities = useMemo(() => {
    const modalities = Array.from(new Set(allMockBiddings.map(b => b.modalidadeNome)));
    return modalities.sort();
  }, []);

  const availableCities = useMemo(() => {
    let cities = allMockBiddings.map(b => b.unidadeOrgao.municipioNome);
    if (filters.states.length > 0) {
      cities = allMockBiddings
        .filter(b => filters.states.includes(b.unidadeOrgao.ufSigla))
        .map(b => b.unidadeOrgao.municipioNome);
    }
    return Array.from(new Set(cities)).sort();
  }, [filters.states]);

  const filteredBiddings = useMemo(() => {
    let result = allMockBiddings;

    // Filtro por palavras-chave
    if (filters.keywords.trim()) {
      const keywords = filters.keywords.split(';').map(k => k.trim().toLowerCase());
      
      result = result.filter(bidding => {
        const searchText = `${bidding.objetoCompra} ${bidding.orgaoEntidade.razaoSocial}`.toLowerCase();
        
        if (filters.smartSearch) {
          // Busca inteligente - remove acentos e trata plurais/singulares básicos
          const normalizeText = (text: string) => {
            return text
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase();
          };
          
          const normalizedSearchText = normalizeText(searchText);
          
          return keywords.some(keyword => {
            const normalizedKeyword = normalizeText(keyword);
            // Busca exata ou variações básicas (plural/singular)
            return normalizedSearchText.includes(normalizedKeyword) ||
                   normalizedSearchText.includes(normalizedKeyword + 's') ||
                   normalizedSearchText.includes(normalizedKeyword.slice(0, -1));
          });
        } else {
          // Busca exata
          return keywords.some(keyword => searchText.includes(keyword));
        }
      });
    }

    // Filtro por estados
    if (filters.states.length > 0) {
      result = result.filter(bidding => 
        filters.states.includes(bidding.unidadeOrgao.ufSigla)
      );
    }

    // Filtro por modalidades
    if (filters.modalities.length > 0) {
      result = result.filter(bidding => 
        filters.modalities.includes(bidding.modalidadeNome)
      );
    }

    // Filtro por cidades
    if (filters.cities.length > 0) {
      result = result.filter(bidding => 
        filters.cities.includes(bidding.unidadeOrgao.municipioNome)
      );
    }

    // Filtro por data de abertura
    if (filters.startDate) {
      result = result.filter(bidding => 
        new Date(bidding.dataAberturaProposta) >= filters.startDate!
      );
    }

    // Filtro por data de encerramento
    if (filters.endDate) {
      result = result.filter(bidding => 
        new Date(bidding.dataEncerramentoProposta) <= filters.endDate!
      );
    }

    return result.sort((a, b) => 
      new Date(b.dataPublicacaoPncp).getTime() - new Date(a.dataPublicacaoPncp).getTime()
    );
  }, [filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'states' | 'modalities' | 'cities', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      keywords: '',
      states: [],
      modalities: [],
      cities: [],
      smartSearch: true,
    });
  };

  const hasActiveFilters = filters.keywords.trim() || 
    filters.states.length > 0 || 
    filters.modalities.length > 0 || 
    filters.cities.length > 0 ||
    filters.startDate || 
    filters.endDate;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pesquisa Avançada</h1>
        <p className="text-gray-600 mt-1">
          Encontre licitações específicas usando filtros detalhados
        </p>
      </div>

      {/* Busca por Palavras-chave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Busca por Palavras-chave
          </CardTitle>
          <CardDescription>
            Digite palavras-chave separadas por ";" para buscar em objetos de compra e órgãos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Ex: equipamentos; informática; hospital"
              value={filters.keywords}
              onChange={(e) => updateFilter('keywords', e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="smart-search"
              checked={filters.smartSearch}
              onCheckedChange={(checked) => updateFilter('smartSearch', checked)}
            />
            <Label htmlFor="smart-search" className="text-sm">
              Busca Inteligente (ignora acentos, trata plurais/singulares)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      <Card>
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="hover:bg-gray-50 cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros Avançados
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {[
                        filters.states.length,
                        filters.modalities.length,
                        filters.cities.length,
                        filters.startDate ? 1 : 0,
                        filters.endDate ? 1 : 0
                      ].reduce((a, b) => a + b, 0)} ativos
                    </Badge>
                  )}
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isFiltersOpen && "rotate-180")} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Estados */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Estados (UF)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {availableStates.map(state => (
                    <div key={state} className="flex items-center space-x-2">
                      <Checkbox
                        id={`state-${state}`}
                        checked={filters.states.includes(state)}
                        onCheckedChange={() => toggleArrayFilter('states', state)}
                      />
                      <Label htmlFor={`state-${state}`} className="text-sm">
                        {state}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modalidades */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Modalidades</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableModalities.map(modality => (
                    <div key={modality} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modality-${modality}`}
                        checked={filters.modalities.includes(modality)}
                        onCheckedChange={() => toggleArrayFilter('modalities', modality)}
                      />
                      <Label htmlFor={`modality-${modality}`} className="text-sm">
                        {modality}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cidades */}
              {availableCities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Cidades {filters.states.length > 0 && `(${filters.states.join(', ')})`}
                  </Label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableCities.map(city => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={`city-${city}`}
                          checked={filters.cities.includes(city)}
                          onCheckedChange={() => toggleArrayFilter('cities', city)}
                        />
                        <Label htmlFor={`city-${city}`} className="text-sm">
                          {city}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Data de Abertura (a partir de)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate ? (
                          format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => updateFilter('startDate', date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Data de Encerramento (até)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate ? (
                          format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => updateFilter('endDate', date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Botão Limpar Filtros */}
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Limpar Todos os Filtros
                </Button>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Resultados da Pesquisa
          </h2>
          <Badge variant="outline">
            {filteredBiddings.length} licitações encontradas
          </Badge>
        </div>

        {filteredBiddings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma licitação encontrada
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros de pesquisa para encontrar mais resultados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBiddings.map((bidding) => (
              <BiddingCard 
                key={bidding._id} 
                bidding={bidding}
                highlightKeywords={filters.keywords.split(';').map(k => k.trim()).filter(k => k)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
