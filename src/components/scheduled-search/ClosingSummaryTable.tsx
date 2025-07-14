import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClosingSummaryTableProps {
  closingSummary: Record<string, number>;
  onCellClick: (date: string) => void;
  clientTodayStr: string | null;
}

export const ClosingSummaryTable: React.FC<ClosingSummaryTableProps> = ({
  closingSummary,
  onCellClick,
  clientTodayStr
}) => {
  const formatDateForDisplay = (dateStr: string): string => {
    if (!clientTodayStr) return dateStr;
    
    const today = new Date(clientTodayStr);
    const tomorrow = format(addDays(today, 1), 'yyyy-MM-dd');
    
    if (dateStr === clientTodayStr) {
      return `${format(new Date(dateStr), 'dd/MM', { locale: ptBR })} (Hoje)`;
    } else if (dateStr === tomorrow) {
      return `${format(new Date(dateStr), 'dd/MM', { locale: ptBR })} (Amanhã)`;
    } else {
      return format(new Date(dateStr), 'dd/MM (eeee)', { locale: ptBR });
    }
  };

  // Generate next 7 days starting from today
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      days.push(format(date, 'yyyy-MM-dd'));
    }
    return days;
  };

  const next7Days = getNext7Days();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-800">
          Encerramento de Propostas - Próximos 7 Dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-3 text-left font-medium text-blue-900">
                  Data
                </th>
                <th className="border border-blue-200 p-3 text-center font-medium text-blue-900">
                  Encerramentos
                </th>
              </tr>
            </thead>
            <tbody>
              {next7Days.map(date => {
                const count = closingSummary[date] || 0;
                return (
                  <tr key={date} className="hover:bg-blue-25">
                    <td className="border border-blue-200 p-3 font-medium text-gray-700">
                      {formatDateForDisplay(date)}
                    </td>
                    <td className="border border-blue-200 p-3 text-center">
                      <button
                        onClick={() => count > 0 && onCellClick(date)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                          ${count > 0 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer' 
                            : 'bg-gray-100 text-gray-500 cursor-default'
                          }`}
                        disabled={count === 0}
                      >
                        {count}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};