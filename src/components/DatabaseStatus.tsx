
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ControleCargas {
  nome: string;
  status: boolean;
  data_checkpoint: string | null;
  created_at: string;
  updated_at: string;
}

const fetchDatabaseStatus = async () => {
  const [editaisCount, controleCargas] = await Promise.all([
    supabase.from('editais').select('*', { count: 'exact', head: true }),
    supabase.from('controle_carga').select('*')
  ]);

  return {
    totalEditais: editaisCount.count || 0,
    controleCargas: controleCargas.data || []
  };
};

export const DatabaseStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['database-status'],
    queryFn: fetchDatabaseStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status do Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            Carregando...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status do Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            Erro ao carregar status
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status do Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total de Editais:</span>
              <Badge variant="secondary">
                {data?.totalEditais.toLocaleString('pt-BR')}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Controle de Cargas:</h4>
              {data?.controleCargas && data.controleCargas.length > 0 ? (
                data.controleCargas.map((carga: ControleCargas) => (
                  <div key={carga.nome} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{carga.nome}</span>
                    <div className="flex items-center gap-2">
                      {carga.status ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <Badge variant={carga.status ? "default" : "secondary"}>
                        {carga.status ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  Nenhum controle de carga configurado
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
