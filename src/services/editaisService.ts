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

// Function to normalize text for smart search (remove accents, convert to lowercase)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents
};

// Function to create search conditions with word boundaries
const createSearchConditions = (keywords: string[], smartSearch: boolean): string[] => {
  const orConditions: string[] = [];
  
  keywords.forEach(keyword => {
    if (keyword.trim()) {
      const k = keyword.trim();
      
      if (smartSearch) {
        // Smart search: normalize the keyword and search for variations
        const normalizedKeyword = normalizeText(k);
        
        // Create multiple variations to handle accents and case
        const variations = [
          k, // original
          k.toLowerCase(), // lowercase
          k.toUpperCase(), // uppercase
          normalizedKeyword, // without accents
        ];
        
        // Add plural/singular variations for Portuguese
        if (!k.endsWith('s') && !k.endsWith('ões')) {
          variations.push(k + 's'); // add plural
          variations.push(k + 'ões'); // add plural for words ending in ão
        }
        if (k.endsWith('s') && k.length > 3) {
          variations.push(k.slice(0, -1)); // remove s for potential singular
        }
        if (k.endsWith('ões')) {
          variations.push(k.slice(0, -3) + 'ão'); // convert ões to ão
        }
        if (k.endsWith('ão')) {
          variations.push(k.slice(0, -2) + 'ões'); // convert ão to ões
        }
        
        // Remove duplicates
        const uniqueVariations = [...new Set(variations)];
        
        uniqueVariations.forEach(variation => {
          // Word boundary conditions for each variation
          orConditions.push(`objeto_compra.ilike.${variation} %`); // word at start followed by space
          orConditions.push(`objeto_compra.ilike.% ${variation} %`); // word in middle with spaces
          orConditions.push(`objeto_compra.ilike.% ${variation}`); // word at end preceded by space
          orConditions.push(`objeto_compra.ilike.${variation}`); // exact match (single word)
        });
      } else {
        // Normal search: exact keyword match with word boundaries
        orConditions.push(`objeto_compra.ilike.${k} %`); // word at start followed by space
        orConditions.push(`objeto_compra.ilike.% ${k} %`); // word in middle with spaces
        orConditions.push(`objeto_compra.ilike.% ${k}`); // word at end preceded by space
        orConditions.push(`objeto_compra.ilike.${k}`); // exact match (single word)
      }
    }
  });
  
  return orConditions;
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
        const orConditions = createSearchConditions(keywords, filters.smartSearch || false);
        
        if (orConditions.length > 0) {
          query = query.or(orConditions.join(','));
        }
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

  return {
    data: data ? data.map(transformEditalToBidding) : [],
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
