
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActivitySummary, EventType } from '@/pages/ScheduledSearch';

interface ActivitySummaryTableProps {
  activitySummary: ActivitySummary;
  onCellClick: (date: string, eventType: EventType, count: number) => void;
  formatDateForDisplay: (dateStr: string) => string;
}

export const ActivitySummaryTable: React.FC<ActivitySummaryTableProps> = ({
  activitySummary,
  onCellClick,
  formatDateForDisplay
}) => {
  const eventTypes: Array<{ key: EventType; label: string }> = [
    { key: 'updates', label: 'Atualizações' },
    { key: 'new_publications', label: 'Novas Publicações' },
    { key: 'proposal_openings', label: 'Abertura de Propostas' },
    { key: 'proposal_closings', label: 'Encerramento de Propostas' }
  ];

  const dates = Object.keys(activitySummary).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (dates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma atividade encontrada para este filtro nos últimos 7 dias.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Tipo de Evento</TableHead>
            {dates.map((date) => (
              <TableHead key={date} className="text-center font-semibold min-w-[120px]">
                {formatDateForDisplay(date)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventTypes.map(({ key, label }) => (
            <TableRow key={key}>
              <TableCell className="font-medium">{label}</TableCell>
              {dates.map((date) => {
                const count = activitySummary[date]?.[key] || 0;
                return (
                  <TableCell key={`${key}-${date}`} className="text-center">
                    {count > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCellClick(date, key, count)}
                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                      >
                        {count}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
