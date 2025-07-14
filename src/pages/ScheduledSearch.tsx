import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivitySummaryTable } from '@/components/scheduled-search/ActivitySummaryTable';
import { ClosingSummaryTable } from '@/components/scheduled-search/ClosingSummaryTable';
import BiddingCard from "@/components/BiddingCard";
import { useFilters } from '@/contexts/FiltersContext';
import { useScheduledSearchData } from '@/hooks/useScheduledSearchData';
import { Bidding } from '@/types/bidding';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type EventType = 'updates' | 'new_publications' | 'proposal_openings' | 'proposal_closings';
export type ActivitySummary = Record<string, Record<EventType, number>>;

const ScheduledSearch: React.FC = () => {
  const [selectedFilterId, setSelectedFilterId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [filteredBiddings, setFilteredBiddings] = useState<Bidding[]>([]);
  const [closingDate, setClosingDate] = useState<string>('');
  const [closingBiddings, setClosingBiddings] = useState<Bidding[]>([]);
  
  const [clientTodayStr, setClientTodayStr] = useState<string | null>(null);
  const [clientYesterdayStr, setClientYesterdayStr] = useState<string | null>(null);
  
  const { savedFilters, isLoading: filtersLoading } = useFilters();
  
  const selectedFilter = savedFilters.find(f => f.id === selectedFilterId);
  const { 
    activitySummary,
    closingSummary,
    getFilteredBiddings,
    getClosingBiddings,
    isLoading: dataLoading 
  } = useScheduledSearchData(selectedFilterId);

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayFormatted = format(today, 'yyyy-MM-dd');
    const yesterdayFormatted = format(yesterday, 'yyyy-MM-dd');
    
    setClientTodayStr(todayFormatted);
    setClientYesterdayStr(yesterdayFormatted);
  }, []);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilterId(filterId);
    setSelectedDate('');
    setSelectedEventType(null);
    setFilteredBiddings([]);
    setClosingDate('');
    setClosingBiddings([]);
  };

  const handleCellClick = async (date: string, eventType: EventType, count: number) => {
    if (count === 0) return;
    
    try {
      setSelectedDate(date);
      setSelectedEventType(eventType);
      
      const biddings = await getFilteredBiddings(date, eventType);
      setFilteredBiddings(biddings);
      
      // Clear closing selection
      setClosingDate('');
      setClosingBiddings([]);
    } catch (error) {
      console.error('Error fetching filtered biddings:', error);
    }
  };

  const handleClosingCellClick = async (date: string) => {
    try {
      const biddings = await getClosingBiddings(date);
      setClosingDate(date);
      setClosingBiddings(biddings);
      
      // Clear activity selection
      setSelectedDate('');
      setSelectedEventType(null);
      setFilteredBiddings([]);
    } catch (error) {
      console.error('Error fetching closing biddings:', error);
    }
  };

  const formatDateForDisplay = (dateStr: string): string => {
    if (!clientTodayStr) return dateStr;
    
    if (dateStr === clientTodayStr) {
      return `${format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR })} (Hoje)`;
    } else if (dateStr === clientYesterdayStr) {
      return `${format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR })} (Ontem)`;
    } else {
      return format(new Date(dateStr), 'dd/MM/yyyy (eeee)', { locale: ptBR });
    }
  };

  const getEventTypeLabel = (eventType: EventType): string => {
    const labels = {
      updates: 'Atualizações',
      new_publications: 'Novas Publicações',
      proposal_openings: 'Aberturas de Propostas',
      proposal_closings: 'Encerramentos de Propostas'
    };
    return labels[eventType];
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

      {/* Summary Tables */}
      {selectedFilterId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          
          <ClosingSummaryTable
            closingSummary={closingSummary}
            onCellClick={handleClosingCellClick}
            clientTodayStr={clientTodayStr}
          />
        </div>
      )}

      {/* Results for Activity Summary */}
      {(selectedDate && selectedEventType && filteredBiddings.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {getEventTypeLabel(selectedEventType)} - {formatDateForDisplay(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBiddings.map((bidding) => (
                <BiddingCard 
                  key={bidding._id} 
                  bidding={bidding}
                  searchTerms={selectedFilter?.keywords ? selectedFilter.keywords.split(';').map(k => k.trim()).filter(k => k) : []}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results for Closing Proposals */}
      {(closingDate && closingBiddings.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              Propostas Encerrando em {formatDateForDisplay(closingDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {closingBiddings.map((bidding) => (
                <BiddingCard 
                  key={bidding._id} 
                  bidding={bidding}
                  searchTerms={selectedFilter?.keywords ? selectedFilter.keywords.split(';').map(k => k.trim()).filter(k => k) : []}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduledSearch;