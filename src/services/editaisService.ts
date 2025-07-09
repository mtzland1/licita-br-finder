import { supabase } from '@/integrations/supabase/client';
import { SearchFilters, Bidding } from '@/types/bidding';
import { Tables } from '@/integrations/supabase/types';

type EditaisRow = Tables<'editais'>;

// Transform database row to Bidding type
const transformEditalToBidding = (edital: EditaisRow): Bidding => {
  // Parse arquivos JSON safely
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

// Function to find keyword context in text
const findKeywordContext = (text: string, keywords: string[], contextLength: number = 200): string => {
  if (!keywords.length || !text) return text.substring(0, contextLength);
  
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    if (!keyword.trim()) continue;
    
    const lowerKeyword = keyword.toLowerCase().trim();
    const keywordIndex = lowerText.indexOf(lowerKeyword);
    
    if (keywordIndex !== -1) {
      // Calculate start and end positions for context
      const start = Math.max(0, keywordIndex - Math.floor((contextLength - lowerKeyword.length) / 2));
      let end = Math.min(text.length, start + contextLength);
      
      // Adjust start if end is at text boundary
      if (end === text.length && text.length > contextLength) {
        const adjustedStart = Math.max(0, text.length - contextLength);
        return text.substring(adjustedStart, end);
      }
      
      return text.substring(start, end);
    }
  }
  
  // If no keyword found, return beginning
  return text.substring(0, contextLength);
};

export const fetchEditais = async (
  filters?: SearchFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ data: Bidding[]; total: number }> => {
  let query = supabase
    .from('editais')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters) {
    if (filters.keywords && filters.keywords.trim()) {
      const keywords = filters.keywords.split(';').map(k => k.trim()).filter(k => k);
      
      if (keywords.length > 0) {
        // Create search conditions that ensure words are correlative (not just substring matches)
        const searchConditions = keywords.map(keyword => {
          // Use word boundary regex to ensure we match whole words or word beginnings
          // This prevents "ração" from matching "administração"
          const pattern = `\\b${keyword.toLowerCase()}`;
          return `objeto_compra.ilike.*${pattern}*`;
        }).join(',');
        
        query = query.or(searchConditions);
      }
    }

    if (filters.states && filters.states.length > 0) {
      query = query.in('uf_sigla', filters.states);
    }

    if (filters.cities && filters.cities.length > 0) {
      query = query.in('municipio_nome', filters.cities);
    }

    if (filters.modalities && filters.modalities.length > 0) {
      query = query.in('modalidade_nome', filters.modalities);
    }

    if (filters.startDate) {
      query = query.gte('data_publicacao_pncp', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('data_publicacao_pncp', filters.endDate.toISOString());
    }
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .range(from, to)
    .order('data_publicacao_pncp', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching editais:', error);
    throw new Error('Failed to fetch editais');
  }

  let transformedData = data ? data.map(transformEditalToBidding) : [];

  // Post-process to ensure keyword context and improve matching
  if (filters?.keywords?.trim()) {
    const keywords = filters.keywords.split(';').map(k => k.trim()).filter(k => k);
    
    // Additional filtering to ensure correlative matches
    transformedData = transformedData.filter(edital => {
      const lowerObjecto = edital.objetoCompra.toLowerCase();
      return keywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase().trim();
        // Check for word boundaries to ensure correlative matches
        const regex = new RegExp(`\\b${lowerKeyword}`, 'i');
        return regex.test(edital.objetoCompra);
      });
    });

    // Update objeto_compra to show context containing the keyword
    transformedData = transformedData.map(edital => ({
      ...edital,
      objetoCompra: findKeywordContext(edital.objetoCompra, keywords, 200)
    }));
  }

  return {
    data: transformedData,
    total: count || 0,
  };
};

export const fetchEditalById = async (id: string): Promise<Bidding | null> => {
  const { data, error } = await supabase
    .from('editais')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching edital:', error);
    return null;
  }

  return data ? transformEditalToBidding(data) : null;
};

export const getUniqueStates = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('editais')
    .select('uf_sigla')
    .not('uf_sigla', 'is', null)
    .order('uf_sigla');

  if (error) {
    console.error('Error fetching states:', error);
    return [];
  }

  const uniqueStates = [...new Set(data.map(item => item.uf_sigla).filter(Boolean))];
  return uniqueStates;
};

export const getUniqueCities = async (state?: string): Promise<string[]> => {
  let query = supabase
    .from('editais')
    .select('municipio_nome')
    .not('municipio_nome', 'is', null);

  if (state) {
    query = query.eq('uf_sigla', state);
  }

  const { data, error } = await query.order('municipio_nome');

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  const uniqueCities = [...new Set(data.map(item => item.municipio_nome).filter(Boolean))];
  return uniqueCities;
};

export const getUniqueModalities = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('editais')
    .select('modalidade_nome')
    .not('modalidade_nome', 'is', null)
    .order('modalidade_nome');

  if (error) {
    console.error('Error fetching modalities:', error);
    return [];
  }

  const uniqueModalities = [...new Set(data.map(item => item.modalidade_nome).filter(Boolean))];
  return uniqueModalities;
};
