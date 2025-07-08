
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Bidding } from '@/types/bidding';
import { Heart, MapPin, Calendar, DollarSign, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BiddingCardProps {
  bidding: Bidding;
  highlightKeywords?: string[];
}

const BiddingCard: React.FC<BiddingCardProps> = ({ bidding, highlightKeywords = [] }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(bidding._id);

  const highlightText = (text: string, keywords: string[]) => {
    if (!keywords.length) return text;
    
    let highlightedText = text;
    keywords.forEach((keyword, index) => {
      if (keyword.trim()) {
        const colors = ['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-pink-200', 'bg-purple-200'];
        const color = colors[index % colors.length];
        const regex = new RegExp(`(${keyword.trim()})`, 'gi');
        highlightedText = highlightedText.replace(regex, `<mark class="${color} px-1 rounded">$1</mark>`);
      }
    });
    return highlightedText;
  };

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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={bidding.status === 'aberto' ? 'default' : 'secondary'}>
                {bidding.status === 'aberto' ? 'Aberta' : 'Encerrada'}
              </Badge>
              {bidding.status === 'aberto' && isExpiringSoon() && (
                <Badge variant="destructive">
                  Expira em breve
                </Badge>
              )}
            </div>
            <h3 
              className="font-semibold text-gray-900 text-sm leading-tight"
              dangerouslySetInnerHTML={{
                __html: highlightText(bidding.objetoCompra, highlightKeywords)
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(bidding._id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Heart 
              className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-gray-600">Valor Estimado</p>
              <p className="font-medium text-green-700">
                {formatCurrency(bidding.valorTotalEstimado)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-gray-600">Localização</p>
              <p className="font-medium">
                {bidding.unidadeOrgao.municipioNome}, {bidding.unidadeOrgao.ufSigla}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-gray-600">Abertura:</span>
            <span className="font-medium">
              {format(new Date(bidding.dataAberturaProposta), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-600" />
            <span className="text-gray-600">Encerramento:</span>
            <span className="font-medium">
              {format(new Date(bidding.dataEncerramentoProposta), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Modalidade:</span>
            <span className="ml-1 font-medium">{bidding.modalidadeNome}</span>
          </div>
          <div>
            <span className="text-gray-600">Processo:</span>
            <span className="ml-1 font-medium">{bidding.processo}</span>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-gray-600">Órgão:</p>
          <p className="font-medium text-gray-800">{bidding.orgaoEntidade.razaoSocial}</p>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>{bidding.arquivos.length} arquivo(s)</span>
          </div>
          {bidding.linkSistemaOrigem && (
            <Button variant="outline" size="sm" asChild>
              <a href={bidding.linkSistemaOrigem} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver Detalhes
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BiddingCard;
