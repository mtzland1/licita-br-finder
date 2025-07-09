
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Bidding } from '@/types/bidding';
import { Download, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilesModalProps {
  bidding: Bidding;
  isOpen: boolean;
  onClose: () => void;
}

const FILES_PER_PAGE = 10;

const FilesModal: React.FC<FilesModalProps> = ({ bidding, isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalFiles = bidding.arquivos.length;
  const totalPages = Math.ceil(totalFiles / FILES_PER_PAGE);
  
  const startIndex = (currentPage - 1) * FILES_PER_PAGE;
  const endIndex = startIndex + FILES_PER_PAGE;
  const currentFiles = bidding.arquivos.slice(startIndex, endIndex);

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Arquivos da Licitação
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              {totalFiles} arquivo(s) encontrado(s)
            </Badge>
            {totalPages > 1 && (
              <Badge variant="secondary">
                Página {currentPage} de {totalPages}
              </Badge>
            )}
          </div>

          {currentFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum arquivo encontrado para esta licitação.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentFiles.map((arquivo, index) => (
                <div 
                  key={`${arquivo.sequencialDocumento}-${index}`}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <h3 className="font-medium text-gray-900 truncate">
                          {arquivo.titulo || arquivo.tipoDocumentoDescricao || 'Documento'}
                        </h3>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Publicado em: {format(new Date(arquivo.dataPublicacaoPncp), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Tipo:</span> {arquivo.tipoDocumentoNome || arquivo.tipoDocumentoDescricao}
                        </div>
                        
                        {arquivo.sequencialDocumento && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Sequencial:</span> {arquivo.sequencialDocumento}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(arquivo.url, arquivo.titulo || 'documento')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilesModal;
