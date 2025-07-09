
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bidding } from '@/types/bidding';
import { generateHighlightVariations } from '@/services/editaisService';

interface BiddingObjectModalProps {
  bidding: Bidding;
  isOpen: boolean;
  onClose: () => void;
  highlightKeywords?: string[];
  smartSearch?: boolean;
}

const BiddingObjectModal: React.FC<BiddingObjectModalProps> = ({
  bidding,
  isOpen,
  onClose,
  highlightKeywords = [],
  smartSearch = false
}) => {
  const highlightText = (text: string, keywords: string[]) => {
    if (!keywords.length) return text;
    
    let highlightedText = text;
    const colors = ['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-pink-200', 'bg-purple-200'];
    
    // Generate all variations for each keyword
    const allVariations: { variation: string; color: string }[] = [];
    
    keywords.forEach((keyword, index) => {
      if (keyword.trim()) {
        const color = colors[index % colors.length];
        const variations = generateHighlightVariations(keyword.trim(), smartSearch);
        
        variations.forEach(variation => {
          allVariations.push({ variation, color });
        });
      }
    });
    
    // Sort variations by length (longest first) to avoid partial replacements
    allVariations.sort((a, b) => b.variation.length - a.variation.length);
    
    // Apply highlighting for each variation
    allVariations.forEach(({ variation, color }) => {
      // Escape special regex characters
      const escapedVariation = variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create case-insensitive regex with word boundaries
      const regex = new RegExp(`\\b(${escapedVariation})\\b`, 'gi');
      
      highlightedText = highlightedText.replace(regex, (match) => {
        // Only highlight if not already highlighted
        if (match.includes('<mark')) return match;
        return `<mark class="${color} px-1 rounded font-medium">${match}</mark>`;
      });
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
