
-- Criar tabela de controle para gerenciar o status da carga
CREATE TABLE public.controle_carga (
  nome TEXT PRIMARY KEY,
  status BOOLEAN DEFAULT FALSE,
  data_checkpoint TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela editais para armazenar os dados da API
CREATE TABLE public.editais (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'aberto',
  ano_compra INTEGER,
  sequencial_compra INTEGER,
  orgao_cnpj TEXT,
  orgao_razao_social TEXT,
  orgao_esfera_id TEXT,
  orgao_poder_id TEXT,
  uf_sigla TEXT,
  codigo_ibge TEXT,
  municipio_nome TEXT,
  codigo_unidade TEXT,
  nome_unidade TEXT,
  data_extracao TIMESTAMP WITH TIME ZONE,
  data_atualizacao TIMESTAMP WITH TIME ZONE,
  data_publicacao_pncp TIMESTAMP WITH TIME ZONE,
  data_abertura_proposta TIMESTAMP WITH TIME ZONE,
  data_encerramento_proposta TIMESTAMP WITH TIME ZONE,
  objeto_compra TEXT,
  numero_controle_pncp TEXT,
  srp BOOLEAN DEFAULT FALSE,
  situacao_compra_id INTEGER,
  situacao_compra_nome TEXT,
  modalidade_id INTEGER,
  modalidade_nome TEXT,
  amparo_legal_codigo INTEGER,
  amparo_legal_nome TEXT,
  valor_total_estimado NUMERIC,
  informacao_complementar TEXT,
  arquivos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance na tabela editais
CREATE INDEX idx_editais_status ON public.editais(status);
CREATE INDEX idx_editais_uf_sigla ON public.editais(uf_sigla);
CREATE INDEX idx_editais_municipio ON public.editais(municipio_nome);
CREATE INDEX idx_editais_modalidade ON public.editais(modalidade_nome);
CREATE INDEX idx_editais_data_abertura ON public.editais(data_abertura_proposta);
CREATE INDEX idx_editais_data_encerramento ON public.editais(data_encerramento_proposta);
CREATE INDEX idx_editais_objeto_search ON public.editais USING gin(to_tsvector('portuguese', objeto_compra));

-- Habilitar RLS nas novas tabelas (dados públicos, políticas permissivas)
ALTER TABLE public.controle_carga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editais ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso aos dados (dados públicos de licitações)
CREATE POLICY "Anyone can view controle_carga" 
  ON public.controle_carga 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage controle_carga" 
  ON public.controle_carga 
  FOR ALL 
  TO service_role
  USING (true);

CREATE POLICY "Anyone can view editais" 
  ON public.editais 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage editais" 
  ON public.editais 
  FOR ALL 
  TO service_role
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_controle_carga_updated_at 
  BEFORE UPDATE ON public.controle_carga 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_editais_updated_at 
  BEFORE UPDATE ON public.editais 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
