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

// Function to normalize text (remove accents, convert to lowercase)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents and diacritics
};

// Advanced stemming function for Portuguese with comprehensive suffix removal
const stemWord = (word: string): string => {
  let stem = normalizeText(word);
  
  // Remove common Portuguese suffixes (ordered by priority - longest first)
  const suffixes = [
    // Diminutivos e aumentativos (mais específicos primeiro)
    'zinhos', 'zinhas', 'zinho', 'zinha',
    'inhos', 'inhas', 'inho', 'inha',
    'ões', 'onas', 'ona', 'ão',
    
    // Adjetivos e advérbios
    'mente', 'avel', 'ivel', 'osos', 'osas', 'oso', 'osa',
    'icos', 'icas', 'ico', 'ica',
    'ivos', 'ivas', 'ivo', 'iva',
    
    // Verbos (participios, gerundios, infinitivos)
    'ações', 'acoes', 'acao', 'ação',
    'sões', 'soes', 'são', 'sao',
    'ados', 'adas', 'ado', 'ada',
    'idos', 'idas', 'ido', 'ida',
    'ando', 'endo', 'indo',
    'aram', 'eram', 'iram',
    'ava', 'ave', 'ive',
    'ar', 'er', 'ir',
    
    // Substantivos (plurais e variações)
    'ções', 'coes', 'ção', 'cao',
    'ais', 'eis', 'ois', 'uis',
    'as', 'es', 'is', 'os', 'us',
    's'
  ];
  
  // Apply suffix removal (only one per word to avoid over-stemming)
  for (const suffix of suffixes) {
    if (stem.endsWith(suffix) && stem.length > suffix.length + 2) {
      stem = stem.slice(0, -suffix.length);
      break; // Only remove one suffix to avoid over-stemming
    }
  }
  
  return stem;
};

// Generate comprehensive variations for smart search
const generateSmartSearchVariations = (keyword: string): string[] => {
  const variations = new Set<string>();
  const normalizedKeyword = normalizeText(keyword);
  const stemmedKeyword = stemWord(keyword);
  
  // Add base variations
  [keyword, normalizedKeyword, stemmedKeyword].forEach(base => {
    if (base && base.length >= 2) {
      variations.add(base);
      
      // Add common Portuguese plural/singular variations
      variations.add(base + 's');
      variations.add(base + 'es');
      variations.add(base + 'oes');
      variations.add(base + 'ões');
      variations.add(base + 'ais');
      variations.add(base + 'eis');
      
      // Add common verb forms
      variations.add(base + 'ar');
      variations.add(base + 'er');
      variations.add(base + 'ir');
      variations.add(base + 'acao');
      variations.add(base + 'ação');
      variations.add(base + 'acoes');
      variations.add(base + 'ações');
      
      // Add diminutive forms
      variations.add(base + 'inho');
      variations.add(base + 'inha');
      variations.add(base + 'inhos');
      variations.add(base + 'inhas');
    }
  });
  
  // Remove empty strings and very short words
  return Array.from(variations).filter(v => v && v.trim().length >= 2);
};

// Create search conditions based on smart search setting
const createSearchConditions = (keywords: string[], smartSearch: boolean): string[] => {
  const orConditions: string[] = [];
  
  keywords.forEach(keyword => {
    if (keyword.trim()) {
      const k = keyword.trim();
      
      if (smartSearch) {
        // Smart search: use stemmed variations
        const variations = generateSmartSearchVariations(k);
        
        variations.forEach(variation => {
          // Escape special characters for PostgREST
          const escapedVariation = variation.replace(/[%_]/g, '\\$&');
          orConditions.push(`objeto_compra.ilike.%${escapedVariation}%`);
        });
      } else {
        // Normal search: exact match
        const escapedKeyword = k.replace(/[%_]/g, '\\$&');
        orConditions.push(`objeto_compra.ilike.%${escapedKeyword}%`);
      }
    }
  });
  
  return orConditions;
};

// Generate highlight variations for frontend highlighting
export const generateHighlightVariations = (keyword: string, smartSearch: boolean): string[] => {
  if (!smartSearch) {
    return [keyword];
  }
  
  return generateSmartSearchVariations(keyword);
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
