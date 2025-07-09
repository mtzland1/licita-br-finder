
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Bidding } from '@/types/bidding';
import { Heart, MapPin, Calendar, DollarSign, FileText, ExternalLink, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BiddingObjectModal from './BiddingObjectModal';
import FilesModal from './FilesModal';

interface BiddingCardProps {
  bidding: Bidding;
}

const BiddingCard: React.FC<BiddingCardProps> = ({ bidding }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const shouldShowReadMore = bidding.objetoCompra.length > 100;

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
                  {truncateText(bidding.objetoCompra, 100)}
                  {shouldShowReadMore && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsModalOpen(true)}
                      className="ml-2 p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
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
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-600">Modalidade:</span>
                <span className="ml-1 font-medium">{bidding.modalidadeNome}</span>
              </div>
              <div>
                <span className="text-gray-600">Processo:</span>
                <span className="ml-1 font-medium">{bidding.processo}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilesModalOpen(true)}
                  className="flex items-center gap-1 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span>{bidding.arquivos.length} arquivo(s)</span>
                  <Eye className="h-3 w-3" />
                </Button>
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
          </div>
        </CardContent>
      </Card>

      <BiddingObjectModal
        bidding={bidding}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <FilesModal
        bidding={bidding}
        isOpen={isFilesModalOpen}
        onClose={() => setIsFilesModalOpen(false)}
      />
    </>
  );
};

export default BiddingCard;
