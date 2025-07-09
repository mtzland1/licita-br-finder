
import { supabase } from '@/integrations/supabase/client';
import { Bidding, SearchFilters } from '@/types/bidding';

export interface EditaisRow {
  id: string;
  status: string;
  ano_compra: number | null;
  sequencial_compra: number | null;
  orgao_cnpj: string | null;
  orgao_razao_social: string | null;
  orgao_esfera_id: string | null;
  orgao_poder_id: string | null;
  uf_sigla: string | null;
  codigo_ibge: string | null;
  municipio_nome: string | null;
  codigo_unidade: string | null;
  nome_unidade: string | null;
  data_extracao: string | null;
  data_atualizacao: string | null;
  data_publicacao_pncp: string | null;
  data_abertura_proposta: string | null;
  data_encerramento_proposta: string | null;
  objeto_compra: string | null;
  numero_controle_pncp: string | null;
  srp: boolean | null;
  situacao_compra_id: number | null;
  situacao_compra_nome: string | null;
  modalidade_id: number | null;
  modalidade_nome: string | null;
  amparo_legal_codigo: number | null;
  amparo_legal_nome: string | null;
  valor_total_estimado: number | null;
  informacao_complementar: string | null;
  arquivos: any[] | null;
  created_at: string | null;
  updated_at: string | null;
}

// Transform database row to Bidding interface
const transformEditaisToBidding = (edital: EditaisRow): Bidding => {
  return {
    _id: edital.id,
    valorTotalEstimado: edital.valor_total_estimado || 0,
    valorTotalHomologado: 0,
    orcamentoSigilosoCodigo: 0,
    orcamentoSigilosoDescricao: 'N/A',
    numeroControlePNCP: edital.numero_controle_pncp || '',
    linkSistemaOrigem: '',
    linkProcessoEletronico: '',
    anoCompra: edital.ano_compra || new Date().getFullYear(),
    sequencialCompra: edital.sequencial_compra || 0,
    numeroCompra: `${edital.ano_compra}/${edital.sequencial_compra}`,
    processo: '',
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
      descricao: '',
      nome: edital.amparo_legal_nome || '',
      codigo: edital.amparo_legal_codigo || 0,
    },
    objetoCompra: edital.objeto_compra || '',
    informacaoComplementar: edital.informacao_complementar || '',
    srp: edital.srp || false,
    fontesOrcamentarias: [],
    dataPublicacaoPncp: edital.data_publicacao_pncp ? new Date(edital.data_publicacao_pncp) : new Date(),
    dataAberturaProposta: edital.data_abertura_proposta ? new Date(edital.data_abertura_proposta) : new Date(),
    dataEncerramentoProposta: edital.data_encerramento_proposta ? new Date(edital.data_encerramento_proposta) : new Date(),
    situacaoCompraId: edital.situacao_compra_id || 0,
    situacaoCompraNome: edital.situacao_compra_nome || '',
    existeResultado: false,
    status: edital.status === 'aberto' ? 'aberto' : 'encerrado',
    dataInclusao: edital.created_at ? new Date(edital.created_at) : new Date(),
    dataAtualizacao: edital.updated_at ? new Date(edital.updated_at) : new Date(),
    dataAtualizacaoGlobal: edital.data_atualizacao ? new Date(edital.data_atualizacao) : new Date(),
    usuarioNome: '',
    dataExtracao: edital.data_extracao ? new Date(edital.data_extracao) : new Date(),
    arquivos: edital.arquivos || [],
  };
};

export const fetchEditais = async (
  filters?: SearchFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ data: Bidding[], total: number }> => {
  try {
    let query = supabase
      .from('editais')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      if (filters.keywords) {
        query = query.textSearch('objeto_compra', filters.keywords, {
          type: 'websearch',
          config: 'portuguese'
        });
      }

      if (filters.states.length > 0) {
        query = query.in('uf_sigla', filters.states);
      }

      if (filters.cities.length > 0) {
        query = query.in('municipio_nome', filters.cities);
      }

      if (filters.modalities.length > 0) {
        query = query.in('modalidade_nome', filters.modalities);
      }

      if (filters.startDate) {
        query = query.gte('data_abertura_proposta', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('data_encerramento_proposta', filters.endDate.toISOString());
      }
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by most recent
    query = query.order('data_publicacao_pncp', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar editais:', error);
      throw error;
    }

    const transformedData = (data || []).map(transformEditaisToBidding);

    return {
      data: transformedData,
      total: count || 0
    };
  } catch (error) {
    console.error('Erro na busca de editais:', error);
    throw error;
  }
};

export const fetchEditalById = async (id: string): Promise<Bidding | null> => {
  try {
    const { data, error } = await supabase
      .from('editais')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No data found
      }
      throw error;
    }

    return transformEditaisToBidding(data);
  } catch (error) {
    console.error('Erro ao buscar edital por ID:', error);
    throw error;
  }
};

export const getUniqueStates = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('editais')
      .select('uf_sigla')
      .not('uf_sigla', 'is', null);

    if (error) throw error;

    const uniqueStates = [...new Set(data.map(item => item.uf_sigla))].filter(Boolean);
    return uniqueStates.sort();
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    return [];
  }
};

export const getUniqueCities = async (state?: string): Promise<string[]> => {
  try {
    let query = supabase
      .from('editais')
      .select('municipio_nome')
      .not('municipio_nome', 'is', null);

    if (state) {
      query = query.eq('uf_sigla', state);
    }

    const { data, error } = await query;

    if (error) throw error;

    const uniqueCities = [...new Set(data.map(item => item.municipio_nome))].filter(Boolean);
    return uniqueCities.sort();
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return [];
  }
};

export const getUniqueModalities = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('editais')
      .select('modalidade_nome')
      .not('modalidade_nome', 'is', null);

    if (error) throw error;

    const uniqueModalities = [...new Set(data.map(item => item.modalidade_nome))].filter(Boolean);
    return uniqueModalities.sort();
  } catch (error) {
    console.error('Erro ao buscar modalidades:', error);
    return [];
  }
};
