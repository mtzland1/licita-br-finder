import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Bidding } from '@/types/bidding';
import { Heart, MapPin, Calendar, DollarSign, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BiddingObjectModal from './BiddingObjectModal';

interface BiddingCardProps {
  bidding: Bidding;
  highlightKeywords?: string[];
}

// ✅ INÍCIO DAS FUNÇÕES DE DESTAQUE APRIMORADAS
// Recomenda-se mover estas duas funções para um arquivo de utilitários (ex: /utils/highlight.ts) no futuro.

/**
 * Função auxiliar para remover acentos e normalizar uma string.
 * Ex: "informática" -> "informatica"
 */
const normalizeTextForSearch = (text: string): string => {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Destaca as palavras-chave em um texto, ignorando acentos e maiúsculas/minúsculas.
 * Preserva as cores de destaque para cada keyword.
 * @param text O texto original a ser destacado.
 * @param keywords As palavras-chave da busca do usuário.
 * @returns Uma string com HTML contendo as tags <mark> para o destaque.
 */
const highlightText = (text: string, keywords: string[]): string => {
  if (!keywords?.length || !text) return text;

  let highlightedText = text;

  keywords.forEach((keyword, index) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      // Normaliza a palavra-chave da busca para uma comparação sem acentos.
      const normalizedKeyword = normalizeTextForSearch(trimmedKeyword);
      
      const colors = ['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-pink-200', 'bg-purple-200'];
      const color = colors[index % colors.length];

      // Regex para encontrar todas as palavras no texto original.
      const wordsRegex = new RegExp(`\\b[\\wÀ-ú]+\\b`, 'g');
      const uniqueWords = [...new Set(highlightedText.match(wordsRegex) || [])];
      
      uniqueWords.forEach(word => {
        // Compara a versão normalizada da palavra do texto com a keyword normalizada.
      if (normalizeTextForSearch(word).toLowerCase().startsWith(normalizedKeyword.toLowerCase())) {
          // Se corresponder, cria uma Regex para a palavra *original* (com acento)
          // e a substitui de forma segura no texto.
          const finalHighlightRegex = new RegExp(`\\b(${word})\\b`, 'g');
          highlightedText = highlightedText.replace(finalHighlightRegex, `<mark class="${color} px-1 rounded">$1</mark>`);
        }
      });
    }
  });

  return highlightedText;
};
// ✅ FIM DAS FUNÇÕES DE DESTAQUE

const BiddingCard: React.FC<BiddingCardProps> = ({ bidding, highlightKeywords = [] }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const favorite = isFavorite(bidding._id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isExpiringSoon = () => {
    const now = new Date();
    const endDate = new Date(bidding.dataEncerramentoProposta);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  // A função truncateText não é mais necessária aqui, foi substituída por CSS.
  // const truncateText = ...

  const shouldShowReadMore = bidding.objetoCompra.length > 200; // Ajuste o valor se necessário

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500 w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={bidding.status === 'aberto' ? 'default' : 'secondary'}>
                  {bidding.status === 'aberto' ? 'Aberta' : 'Encerrada'}
                </Badge>
                {bidding.status === 'aberto' && isExpiringSoon() && (
                  <Badge variant="destructive">
                    Expira em breve
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  
                  {/* ✅ CORREÇÃO APLICADA: Truncamento com CSS e destaque corrigido */}
                  <span
                    className="block text-justify [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(bidding.objetoCompra, highlightKeywords)
                    }}
                  />

                  {shouldShowReadMore && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsModalOpen(true)}
                      className="ml-1 p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                    >
                      Leia mais
                    </Button>
                  )}
                </h3>
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{bidding.orgaoEntidade.razaoSocial}</p>
                  <p className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {bidding.unidadeOrgao.municipioNome}, {bidding.unidadeOrgao.ufSigla}
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(bidding._id)}
              className="text-gray-400 hover:text-red-500 flex-shrink-0"
            >
              <Heart 
                className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ... o resto do seu CardContent continua igual ... */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Valor Estimado</p>
                <p className="font-medium text-green-700 text-sm">
                  {formatCurrency(bidding.valorTotalEstimado)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Abertura</p>
                <p className="font-medium text-sm">
                  {format(new Date(bidding.dataAberturaProposta), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Encerramento</p>
                <p className="font-medium text-sm">
                  {format(new Date(bidding.dataEncerramentoProposta), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
              {/* ... esta parte também continua igual ... */}
          </div>
        </CardContent>
      </Card>

      <BiddingObjectModal
        bidding={bidding}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        highlightKeywords={highlightKeywords}
      />
    </>
  );
};

export default BiddingCard;