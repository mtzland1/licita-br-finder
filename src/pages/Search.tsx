
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import BiddingCard from '@/components/BiddingCard';
import { useEditais, useStates, useCities, useModalities } from '@/hooks/useEditais';
import { SearchFilters } from '@/types/bidding';
import { Search as SearchIcon, Filter, ChevronDown, Calendar as CalendarIcon, X, Loader2, SlidersHorizontal, MapPin, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

const Search = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    states: [],
    modalities: [],
    cities: [],
    smartSearch: true,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [citySearchTerm, setCitySearchTerm] = useState('');

  // Fetch filter options
  const { data: availableStates = [] } = useStates();
  const { data: availableModalities = [] } = useModalities();
  const { data: availableCities = [] } = useCities(filters.states.length > 0 ? filters.states[0] : undefined);

  // Fetch editais data with pagination
  const { data: editaisData, isLoading, error } = useEditais(filters, currentPage, ITEMS_PER_PAGE);
  
  const editais = editaisData?.data || [];
  const total = editaisData?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Filter cities based on search term
  const filteredCities = useMemo(() => {
    if (!citySearchTerm.trim()) return availableCities;
    return availableCities.filter(city => 
      city.toLowerCase().includes(citySearchTerm.toLowerCase())
    );
  }, [availableCities, citySearchTerm]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const toggleArrayFilter = (key: 'states' | 'modalities' | 'cities', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
    setCurrentPage(1);
    
    // Clear cities when states change
    if (key === 'states') {
      setFilters(prev => ({ ...prev, cities: [] }));
      setCitySearchTerm('');
    }
  };

  const selectAllStates = () => {
    const allSelected = filters.states.length === availableStates.length;
    setFilters(prev => ({
      ...prev,
      states: allSelected ? [] : [...availableStates],
      cities: [] // Clear cities when changing state selection
    }));
    setCitySearchTerm('');
    setCurrentPage(1);
  };

  const selectAllCities = () => {
    const relevantCities = filters.states.length > 0 ? availableCities : [];
    const allSelected = filters.cities.length === relevantCities.length;
    setFilters(prev => ({
      ...prev,
      cities: allSelected ? [] : [...relevantCities]
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      keywords: '',
      states: [],
      modalities: [],
      cities: [],
      smartSearch: true,
    });
    setCitySearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = filters.keywords.trim() || 
    filters.states.length > 0 || 
    filters.modalities.length > 0 || 
    filters.cities.length > 0 ||
    filters.startDate || 
    filters.endDate;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesquisa Avançada</h1>
          <p className="text-gray-600 mt-1">
            Encontre licitações específicas usando filtros detalhados
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
        <h1 className="text-3xl font-bold text-gray-900">Pesquisa Avançada</h1>
        <p className="text-gray-600 mt-1">
          Encontre licitações específicas usando filtros detalhados
        </p>
      </div>

      {/* Busca por Palavras-chave com Filtros Avançados */}
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
          <div className="flex gap-2">
            <Input
              placeholder="Ex: equipamentos; informática; hospital"
              value={filters.keywords}
              onChange={(e) => updateFilter('keywords', e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-2 py-0 text-xs">
                  {[
                    filters.states.length,
                    filters.modalities.length,
                    filters.cities.length,
                    filters.startDate ? 1 : 0,
                    filters.endDate ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>💡 A busca inteligente está sempre ativa: ignora acentos e trata plurais/singulares automaticamente</p>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros Avançados
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Filtros de Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Data de Abertura
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">De</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm",
                              !filters.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {filters.startDate ? (
                              format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecionar</span>
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
                      <Label className="text-xs text-gray-600 mb-1 block">Até</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm",
                              !filters.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {filters.endDate ? (
                              format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecionar</span>
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
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Data de Encerramento
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">De</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm",
                              !filters.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {filters.startDate ? (
                              format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecionar</span>
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
                      <Label className="text-xs text-gray-600 mb-1 block">Até</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm",
                              !filters.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {filters.endDate ? (
                              format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecionar</span>
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
                </div>
              </div>

              {/* Estados */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Estados (UF)
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllStates}
                    className="text-xs"
                  >
                    {filters.states.length === availableStates.length ? 'Desmarcar Todos' : 'Todos os Estados'}
                  </Button>
                </div>
                {filters.states.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {filters.states.map(state => (
                      <Badge key={state} variant="secondary" className="text-xs">
                        {state}
                        <button
                          onClick={() => toggleArrayFilter('states', state)}
                          className="ml-1 hover:bg-gray-300 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {availableStates.map(state => (
                    <div key={state} className="flex items-center space-x-2">
                      <Checkbox
                        id={`state-${state}`}
                        checked={filters.states.includes(state)}
                        onCheckedChange={() => toggleArrayFilter('states', state)}
                      />
                      <Label htmlFor={`state-${state}`} className="text-sm cursor-pointer">
                        {state}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cidades */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Cidades {filters.states.length > 0 && `(${filters.states.join(', ')})`}
                  </Label>
                  {availableCities.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllCities}
                      className="text-xs"
                    >
                      {filters.cities.length === availableCities.length ? 'Desmarcar Todas' : 'Todas as Cidades'}
                    </Button>
                  )}
                </div>
                
                {availableCities.length > 0 && (
                  <>
                    <Input
                      placeholder="Digite para buscar uma cidade..."
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      className="w-full"
                    />
                    
                    {filters.cities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {filters.cities.map(city => (
                          <Badge key={city} variant="secondary" className="text-xs">
                            {city}
                            <button
                              onClick={() => toggleArrayFilter('cities', city)}
                              className="ml-1 hover:bg-gray-300 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {filteredCities.map(city => (
                        <div key={city} className="flex items-center space-x-2">
                          <Checkbox
                            id={`city-${city}`}
                            checked={filters.cities.includes(city)}
                            onCheckedChange={() => toggleArrayFilter('cities', city)}
                          />
                          <Label htmlFor={`city-${city}`} className="text-sm cursor-pointer">
                            {city}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {filters.states.length === 0 && (
                  <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    Selecione um ou mais estados para filtrar por cidades
                  </p>
                )}
              </div>

              {/* Modalidades */}
              <div className="space-y-4">
                <Label className="text-sm font-medium mb-3 block">Modalidades</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableModalities.map(modality => (
                    <div key={modality} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modality-${modality}`}
                        checked={filters.modalities.includes(modality)}
                        onCheckedChange={() => toggleArrayFilter('modalities', modality)}
                      />
                      <Label htmlFor={`modality-${modality}`} className="text-sm cursor-pointer">
                        {modality}
                      </Label>
                    </div>
                  ))}
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
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Resultados da Pesquisa
          </h2>
          <Badge variant="outline">
            Página {currentPage} de {totalPages} - {total} licitações encontradas
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
          <div className="space-y-4">
            {editais.map((bidding) => (
              <BiddingCard 
                key={bidding._id} 
                bidding={bidding}
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

export default Search;
