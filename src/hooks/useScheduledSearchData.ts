
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFilters } from '@/contexts/FiltersContext';
import { Bidding } from '@/types/bidding';
import { ActivitySummary, EventType } from '@/pages/ScheduledSearch';
import { format, subDays } from 'date-fns';

export const useScheduledSearchData = (selectedFilterId: string) => {
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({});
  const { savedFilters } = useFilters();

  const selectedFilter = savedFilters.find(f => f.id === selectedFilterId);

  // Generate the last 7 days including today
  const getLast7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(new Date(), i);
      days.push(format(date, 'yyyy-MM-dd'));
    }
    return days;
  };

  const { data: relevantEditais = [], isLoading } = useQuery({
    queryKey: ['scheduledSearchEditais', selectedFilterId, selectedFilter?.keywords],
    queryFn: async () => {
      if (!selectedFilter?.keywords) return [];

      // Split keywords by semicolon or space and filter empty ones
      const keywords = selectedFilter.keywords
        .split(/[;\s]+/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywords.length === 0) return [];

      // Use the existing function to search by keywords
      const { data, error } = await supabase
        .rpc('buscar_editais_por_palavras', { palavras_chave: keywords });

      if (error) {
        console.error('Error fetching relevant editais:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!selectedFilter?.keywords,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate activity summary when relevant editais change
  useEffect(() => {
    if (!relevantEditais.length) {
      setActivitySummary({});
      return;
    }

    const last7Days = getLast7Days();
    const summary: ActivitySummary = {};

    last7Days.forEach(date => {
      summary[date] = {
        updates: 0,
        new_publications: 0,
        proposal_openings: 0,
        proposal_closings: 0
      };

      relevantEditais.forEach(edital => {
        // Count updates (data_atualizacao or updated_at)
        const updateDate = edital.data_atualizacao || edital.updated_at;
        if (updateDate && format(new Date(updateDate), 'yyyy-MM-dd') === date) {
          summary[date].updates++;
        }

        // Count new publications
        if (edital.data_publicacao_pncp && format(new Date(edital.data_publicacao_pncp), 'yyyy-MM-dd') === date) {
          summary[date].new_publications++;
        }

        // Count proposal openings
        if (edital.data_abertura_proposta && format(new Date(edital.data_abertura_proposta), 'yyyy-MM-dd') === date) {
          summary[date].proposal_openings++;
        }

        // Count proposal closings
        if (edital.data_encerramento_proposta && format(new Date(edital.data_encerramento_proposta), 'yyyy-MM-dd') === date) {
          summary[date].proposal_closings++;
        }
      });
    });

    setActivitySummary(summary);
  }, [relevantEditais]);

  const getFilteredBiddings = async (date: string, eventType: EventType): Promise<Bidding[]> => {
    if (!relevantEditais.length) return [];

    const dateField = {
      updates: 'data_atualizacao',
      new_publications: 'data_publicacao_pncp',
      proposal_openings: 'data_abertura_proposta',
      proposal_closings: 'data_encerramento_proposta'
    }[eventType];

    // Filter relevant editais by the specific date and event type
    const filteredEditais = relevantEditais.filter(edital => {
      const fieldValue = edital[dateField as keyof typeof edital] || 
                        (eventType === 'updates' ? edital.updated_at : null);
      
      if (!fieldValue) return false;
      
      return format(new Date(fieldValue as string), 'yyyy-MM-dd') === date;
    });

    // Transform to Bidding type
    return filteredEditais.map(edital => transformEditalToBidding(edital));
  };

  return {
    activitySummary,
    getFilteredBiddings,
    isLoading
  };
};

// Transform function (copied from editaisService.ts to avoid circular dependency)
const transformEditalToBidding = (edital: any): Bidding => {
  let arquivos = [];
  try {
    if (typeof edital.arquivos === 'string') {
      arquivos = JSON.parse(edital.arquivos);
    } else if (Array.isArray(edital.arquivos)) {
      arquivos = edital.arquivos;
    }
  } catch (error) {
    console.warn('Error parsing arquivos JSON:', error);
    arquivos = [];
  }

  return {
    _id: edital.id,
    valorTotalEstimado: edital.valor_total_estimado || 0,
    valorTotalHomologado: 0,
    orcamentoSigilosoCodigo: 0,
    orcamentoSigilosoDescricao: '',
    numeroControlePNCP: edital.numero_controle_pncp || '',
    linkSistemaOrigem: '',
    linkProcessoEletronico: '',
    anoCompra: edital.ano_compra || 0,
    sequencialCompra: edital.sequencial_compra || 0,
    numeroCompra: `${edital.ano_compra || 0}/${edital.sequencial_compra || 0}`,
    processo: `${edital.ano_compra || 0}/${edital.sequencial_compra || 0}`,
    orgaoEntidade: {
      cnpj: edital.orgao_cnpj || '',
      razaoSocial: edital.orgao_razao_social || '',
      poderId: edital.orgao_poder_id || '',
      esferaId: edital.orgao_esfera_id || '',
    },
    unidadeOrgao: {
      ufNome: edital.uf_sigla || '',
      codigoIbge: edital.codigo_ibge || '',
      codigoUnidade: edital.codigo_unidade || '',
      nomeUnidade: edital.nome_unidade || '',
      ufSigla: edital.uf_sigla || '',
      municipioNome: edital.municipio_nome || '',
    },
    orgaoSubRogado: null,
    unidadeSubRogada: null,
    modalidadeId: edital.modalidade_id || 0,
    modalidadeNome: edital.modalidade_nome || '',
    justificativaPresencial: '',
    modoDisputaId: 0,
    modoDisputaNome: '',
    tipoInstrumentoConvocatorioCodigo: 0,
    tipoInstrumentoConvocatorioNome: '',
    amparoLegal: {
      descricao: edital.amparo_legal_nome || '',
      nome: edital.amparo_legal_nome || '',
      codigo: edital.amparo_legal_codigo || 0,
    },
    objetoCompra: edital.objeto_compra || '',
    informacaoComplementar: edital.informacao_complementar || '',
    srp: edital.srp || false,
    fontesOrcamentarias: [],
    dataPublicacaoPncp: new Date(edital.data_publicacao_pncp || Date.now()),
    dataAberturaProposta: new Date(edital.data_abertura_proposta || Date.now()),
    dataEncerramentoProposta: new Date(edital.data_encerramento_proposta || Date.now()),
    situacaoCompraId: edital.situacao_compra_id || 0,
    situacaoCompraNome: edital.situacao_compra_nome || '',
    existeResultado: false,
    status: edital.status === 'aberto' ? 'aberto' : 'encerrado',
    dataInclusao: new Date(edital.created_at || Date.now()),
    dataAtualizacao: new Date(edital.updated_at || Date.now()),
    dataAtualizacaoGlobal: new Date(edital.updated_at || Date.now()),
    usuarioNome: '',
    dataExtracao: new Date(edital.data_extracao || Date.now()),
    arquivos: arquivos || [],
  };
};
