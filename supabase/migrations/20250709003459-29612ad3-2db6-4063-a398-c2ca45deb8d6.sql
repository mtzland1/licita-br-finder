
-- Remover tabela de favoritos que referencia biddings
DROP TABLE IF EXISTS public.favorites;

-- Remover tabela biddings
DROP TABLE IF EXISTS public.biddings;

-- Recriar tabela de favoritos referenciando editais
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  edital_id TEXT REFERENCES public.editais(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário não possa favoritar o mesmo edital duas vezes
  UNIQUE(user_id, edital_id)
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
