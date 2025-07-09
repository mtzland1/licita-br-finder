
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bidding } from '@/types/bidding';

interface BiddingObjectModalProps {
  bidding: Bidding;
  isOpen: boolean;
  onClose: () => void;
  highlightKeywords?: string[];
}

const BiddingObjectModal: React.FC<BiddingObjectModalProps> = ({
  bidding,
  isOpen,
  onClose,
  highlightKeywords = []
}) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Objeto da Licitação</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: highlightText(bidding.objetoCompra, highlightKeywords)
            }}
          />
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Processo:</span>
                <span className="ml-2">{bidding.processo}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Modalidade:</span>
                <span className="ml-2">{bidding.modalidadeNome}</span>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="font-medium text-gray-600">Órgão:</span>
              <p className="mt-1">{bidding.orgaoEntidade.razaoSocial}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BiddingObjectModal;
