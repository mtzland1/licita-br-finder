
-- Corrigir a função buscar_editais_fts para retornar o tipo correto
DROP FUNCTION IF EXISTS public.buscar_editais_fts(text);

CREATE OR REPLACE FUNCTION public.buscar_editais_fts(termos_de_busca text)
 RETURNS TABLE(id text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT e.id
    FROM public.editais AS e
    WHERE
      e.objeto_compra_padronizado @@ websearch_to_tsquery('portuguese', termos_de_busca);
END;
$function$
