import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import BiddingCard from '@/components/BiddingCard';
import { Bidding } from '@/types/bidding';
import { useToast } from "@/components/ui/use-toast"

const Dashboard = () => {
  const [editais, setEditais] = useState<Bidding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast()

  useEffect(() => {
    const fetchEditais = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/editais?page=${currentPage}&limit=${itemsPerPage}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEditais(data.data || []);
      } catch (e: any) {
        setError(e.message);
        toast({
          title: "Error!",
          description: "Failed to load bidding.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false);
      }
    };

    fetchEditais();
  }, [currentPage, itemsPerPage, toast]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(editais.length / itemsPerPage);

  // Logic for displaying current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEditais = editais.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Painel de Editais</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2.5">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[350px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[400px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <div className="space-y-4">
              {currentEditais.map((bidding) => (
                <BiddingCard 
                  key={bidding._id} 
                  bidding={bidding}
                />
              ))}
            </div>
          )}
          <div className="flex justify-center mt-4">
            <div className="join">
              <button
                className="join-item btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`join-item btn ${currentPage === i + 1 ? 'btn-active' : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="join-item btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                »
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
