
-- Criar tabela para armazenar os editais/licitações
CREATE TABLE public.biddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL, -- O _id do JSON original
  status TEXT NOT NULL DEFAULT 'aberto',
  valor_total_estimado NUMERIC,
  valor_total_homologado NUMERIC,
  orcamento_sigiloso_codigo INTEGER,
  orcamento_sigiloso_descricao TEXT,
  numero_controle_pncp TEXT,
  link_sistema_origem TEXT,
  link_processo_eletronico TEXT,
  ano_compra INTEGER,
  sequencial_compra INTEGER,
  numero_compra TEXT,
  processo TEXT,
  
  -- Dados do órgão/entidade
  orgao_cnpj TEXT,
  orgao_razao_social TEXT,
  orgao_poder_id TEXT,
  orgao_esfera_id TEXT,
  
  -- Dados da unidade do órgão
  unidade_uf_nome TEXT,
  unidade_codigo_ibge TEXT,
  unidade_codigo_unidade TEXT,
  unidade_nome_unidade TEXT,
  unidade_uf_sigla TEXT,
  unidade_municipio_nome TEXT,
  
  -- Modalidade e modo de disputa
  modalidade_id INTEGER,
  modalidade_nome TEXT,
  justificativa_presencial TEXT,
  modo_disputa_id INTEGER,
  modo_disputa_nome TEXT,
  
  -- Tipo de instrumento convocatório
  tipo_instrumento_codigo INTEGER,
  tipo_instrumento_nome TEXT,
  
  -- Amparo legal
  amparo_legal_codigo INTEGER,
  amparo_legal_nome TEXT,
  amparo_legal_descricao TEXT,
  
  -- Objeto e informações complementares
  objeto_compra TEXT NOT NULL,
  informacao_complementar TEXT,
  srp BOOLEAN DEFAULT FALSE,
  
  -- Datas importantes
  data_publicacao_pncp TIMESTAMP WITH TIME ZONE,
  data_abertura_proposta TIMESTAMP WITH TIME ZONE,
  data_encerramento_proposta TIMESTAMP WITH TIME ZONE,
  
  -- Situação da compra
  situacao_compra_id INTEGER,
  situacao_compra_nome TEXT,
  existe_resultado BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  data_inclusao TIMESTAMP WITH TIME ZONE,
  data_atualizacao TIMESTAMP WITH TIME ZONE,
  data_atualizacao_global TIMESTAMP WITH TIME ZONE,
  usuario_nome TEXT,
  data_extracao TIMESTAMP WITH TIME ZONE,
  
  -- Arquivos (armazenados como JSONB)
  arquivos JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps do sistema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_biddings_external_id ON public.biddings(external_id);
CREATE INDEX idx_biddings_status ON public.biddings(status);
CREATE INDEX idx_biddings_modalidade ON public.biddings(modalidade_nome);
CREATE INDEX idx_biddings_uf ON public.biddings(unidade_uf_sigla);
CREATE INDEX idx_biddings_municipio ON public.biddings(unidade_municipio_nome);
CREATE INDEX idx_biddings_data_abertura ON public.biddings(data_abertura_proposta);
CREATE INDEX idx_biddings_data_encerramento ON public.biddings(data_encerramento_proposta);
CREATE INDEX idx_biddings_objeto_search ON public.biddings USING gin(to_tsvector('portuguese', objeto_compra));

-- Habilitar RLS na tabela de editais (dados públicos, não precisa de políticas restritivas)
ALTER TABLE public.biddings ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todos os editais para usuários autenticados
CREATE POLICY "Anyone can view biddings" 
  ON public.biddings 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para permitir inserção apenas para usuários autenticados (para população de dados)
CREATE POLICY "Authenticated users can insert biddings" 
  ON public.biddings 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Criar tabela de favoritos
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bidding_id UUID REFERENCES public.biddings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário não possa favoritar o mesmo edital duas vezes
  UNIQUE(user_id, bidding_id)
);

-- Habilitar RLS na tabela de favoritos
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para favoritos
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
  ON public.favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar tabela de filtros salvos
CREATE TABLE public.saved_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT,
  states TEXT[], -- Array de estados (siglas)
  modalities TEXT[], -- Array de modalidades
  cities TEXT[], -- Array de cidades
  start_date DATE,
  end_date DATE,
  smart_search BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de filtros salvos
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para filtros salvos
CREATE POLICY "Users can view their own saved filters" 
  ON public.saved_filters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved filters" 
  ON public.saved_filters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved filters" 
  ON public.saved_filters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved filters" 
  ON public.saved_filters 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_biddings_updated_at 
  BEFORE UPDATE ON public.biddings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_filters_updated_at 
  BEFORE UPDATE ON public.saved_filters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
