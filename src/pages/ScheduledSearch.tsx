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

export type EventType = 'updates' | 'new_publications' | 'proposal_openings' | 'proposal_closings';
export type ActivitySummary = Record<string, Record<EventType, number>>;

const ScheduledSearch: React.FC = () => {
  const [selectedFilterId, setSelectedFilterId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [filteredBiddings, setFilteredBiddings] = useState<Bidding[]>([]);
  
  const [clientTodayStr, setClientTodayStr] = useState<string | null>(null);
  const [clientYesterdayStr, setClientYesterdayStr] = useState<string | null>(null);
  
  const { savedFilters, isLoading: filtersLoading } = useFilters();
  
  const selectedFilter = savedFilters.find(f => f.id === selectedFilterId);
  const { 
    activitySummary, 
    getFilteredBiddings,
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
  };

  const handleCellClick = async (date: string, eventType: EventType, count: number) => {
    if (count === 0) return;
    
    setSelectedDate(date);
    setSelectedEventType(eventType);
    
    const biddings = await getFilteredBiddings(date, eventType);
    setFilteredBiddings(biddings);
  };

  const formatDateForDisplay = (dateStr: string) => {

    const date = new Date(`${dateStr}T00:00:00`); 
    
    if (clientTodayStr && dateStr === clientTodayStr) {
      return `Hoje, ${format(date, 'dd/MM', { locale: ptBR })}`;
    } else if (clientYesterdayStr && dateStr === clientYesterdayStr) {
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
              <div className="space-y-4">
                {filteredBiddings.map((bidding) => (
                  <BiddingCard 
                    key={bidding._id} 
                    bidding={bidding}
                    searchTerms={selectedFilter?.keywords ? selectedFilter.keywords.split(';').map(k => k.trim()).filter(k => k) : []}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduledSearch;
