
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivitySummaryTable } from '@/components/scheduled-search/ActivitySummaryTable';
import BiddingCard from "@/components/BiddingCard";
import { useFilters } from '@/contexts/FiltersContext';
import { useScheduledSearchData } from '@/hooks/useScheduledSearchData';
import { Bidding } from '@/types/bidding';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export type EventType = 'updates' | 'new_publications' | 'proposal_openings' | 'proposal_closings';
export type ActivitySummary = Record<string, Record<EventType, number>>;

const ITEMS_PER_PAGE = 10;

const ScheduledSearch: React.FC = () => {
  const [selectedFilterId, setSelectedFilterId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [filteredBiddings, setFilteredBiddings] = useState<Bidding[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { savedFilters, isLoading: filtersLoading } = useFilters();
  const { 
    activitySummary, 
    getFilteredBiddings,
    isLoading: dataLoading 
  } = useScheduledSearchData(selectedFilterId);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilterId(filterId);
    setSelectedDate('');
    setSelectedEventType(null);
    setFilteredBiddings([]);
    setCurrentPage(1);
  };

  const handleCellClick = async (date: string, eventType: EventType, count: number) => {
    if (count === 0) return;
    
    setSelectedDate(date);
    setSelectedEventType(eventType);
    setCurrentPage(1);
    
    const biddings = await getFilteredBiddings(date, eventType);
    setFilteredBiddings(biddings);
  };

  const formatDateForDisplay = (dateStr: string) => {
    const timeZone = 'America/Sao_Paulo';
    const date = utcToZonedTime(new Date(dateStr), timeZone);
    const today = utcToZonedTime(new Date(), timeZone);
    const yesterday = utcToZonedTime(new Date(), timeZone);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
    
    if (dateStr === todayStr) {
      return `Hoje, ${format(date, 'dd/MM', { locale: ptBR })}`;
    } else if (dateStr === yesterdayStr) {
      return `Ontem, ${format(date, 'dd/MM', { locale: ptBR })}`;
    } else {
      return format(date, 'dd/MM', { locale: ptBR });
    }
  };

  const getEventTypeLabel = (eventType: EventType) => {
    const labels = {
      updates: 'Atualizações',
      new_publications: 'Novas Publicações',
      proposal_openings: 'Abertura de Propostas',
      proposal_closings: 'Encerramento de Propostas'
    };
    return labels[eventType];
  };

  // Pagination logic
  const totalItems = filteredBiddings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBiddings = filteredBiddings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Pesquisa Programada</h1>
      
      {/* Filter Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione seu filtro programado</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedFilterId} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha um filtro salvo..." />
            </SelectTrigger>
            <SelectContent>
              {savedFilters.map((filter) => (
                <SelectItem key={filter.id} value={filter.id}>
                  {filter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Activity Summary Table */}
      {selectedFilterId && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Atividades - Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Carregando resumo...</div>
              </div>
            ) : (
              <ActivitySummaryTable
                activitySummary={activitySummary}
                onCellClick={handleCellClick}
                formatDateForDisplay={formatDateForDisplay}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {selectedDate && selectedEventType && (
        <Card>
          <CardHeader>
            <CardTitle>
              {getEventTypeLabel(selectedEventType)} - {formatDateForDisplay(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBiddings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum edital encontrado para os critérios selecionados.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentBiddings.map((bidding) => (
                    <BiddingCard key={bidding._id} bidding={bidding} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                {/* Results summary */}
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  Mostrando {startIndex + 1} até {Math.min(endIndex, totalItems)} de {totalItems} editais
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduledSearch;
