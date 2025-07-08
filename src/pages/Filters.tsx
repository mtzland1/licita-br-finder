
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useFilters, SavedFilter } from '@/contexts/FiltersContext';
import { Filter, Plus, Trash2, Edit, Search, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const Filters = () => {
  const { savedFilters, saveFilter, deleteFilter, updateFilter } = useFilters();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    states: [] as string[],
    modalities: [] as string[],
    cities: [] as string[],
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    smartSearch: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      keywords: '',
      states: [],
      modalities: [],
      cities: [],
      startDate: undefined,
      endDate: undefined,
      smartSearch: true,
    });
  };

  const handleCreateFilter = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para o filtro.",
        variant: "destructive",
      });
      return;
    }

    const newFilter = {
      name: formData.name,
      keywords: formData.keywords,
      states: formData.states,
      modalities: formData.modalities,
      cities: formData.cities,
      startDate: formData.startDate,
      endDate: formData.endDate,
      smartSearch: formData.smartSearch,
    };

    if (editingFilter) {
      updateFilter(editingFilter.id, newFilter);
      toast({
        title: "Filtro atualizado",
        description: `O filtro "${formData.name}" foi atualizado com sucesso.`,
      });
      setEditingFilter(null);
    } else {
      saveFilter(newFilter);
      toast({
        title: "Filtro salvo",
        description: `O filtro "${formData.name}" foi salvo com sucesso.`,
      });
    }

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setFormData({
      name: filter.name,
      keywords: filter.keywords,
      states: filter.states,
      modalities: filter.modalities,
      cities: filter.cities,
      startDate: filter.startDate,
      endDate: filter.endDate,
      smartSearch: filter.smartSearch,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteFilter = (filter: SavedFilter) => {
    deleteFilter(filter.id);
    toast({
      title: "Filtro excluído",
      description: `O filtro "${filter.name}" foi excluído com sucesso.`,
    });
  };

  const applyFilter = (filter: SavedFilter) => {
    // Em uma implementação real, isso redirecionaria para a página de pesquisa com os filtros aplicados
    toast({
      title: "Filtro aplicado",
      description: `Redirecionando para pesquisa com o filtro "${filter.name}".`,
    });
  };

  const getFilterSummary = (filter: SavedFilter) => {
    const parts = [];
    
    if (filter.keywords.trim()) {
      parts.push(`Palavras-chave: ${filter.keywords}`);
    }
    
    if (filter.states.length > 0) {
      parts.push(`Estados: ${filter.states.join(', ')}`);
    }
    
    if (filter.modalities.length > 0) {
      parts.push(`Modalidades: ${filter.modalities.join(', ')}`);
    }
    
    if (filter.cities.length > 0) {
      parts.push(`Cidades: ${filter.cities.join(', ')}`);
    }
    
    if (filter.startDate) {
      parts.push(`Data início: ${format(filter.startDate, 'dd/MM/yyyy', { locale: ptBR })}`);
    }
    
    if (filter.endDate) {
      parts.push(`Data fim: ${format(filter.endDate, 'dd/MM/yyyy', { locale: ptBR })}`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Nenhum filtro específico';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Filtros Salvos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas combinações de filtros para reutilizar facilmente
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Filtro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingFilter ? 'Editar Filtro' : 'Criar Novo Filtro'}
              </DialogTitle>
              <DialogDescription>
                {editingFilter 
                  ? 'Modifique as configurações do filtro existente.'
                  : 'Configure um novo filtro para reutilizar nas suas pesquisas.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="filter-name">Nome do Filtro *</Label>
                <Input
                  id="filter-name"
                  placeholder="Ex: Equipamentos SP, Serviços RJ..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="filter-keywords">Palavras-chave</Label>
                <Input
                  id="filter-keywords"
                  placeholder="Ex: equipamentos; informática; escola"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separe múltiplas palavras com ";"
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>💡 <strong>Dica:</strong> Para criar filtros mais específicos, use a página de Pesquisa Avançada e depois salve a combinação de filtros aqui.</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
                setEditingFilter(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFilter}>
                {editingFilter ? 'Atualizar' : 'Salvar'} Filtro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Filtros Salvos */}
      {savedFilters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum filtro salvo ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Crie filtros personalizados para agilizar suas pesquisas de licitações.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Filtro
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Filtro</DialogTitle>
                  <DialogDescription>
                    Configure um novo filtro para reutilizar nas suas pesquisas.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="filter-name">Nome do Filtro *</Label>
                    <Input
                      id="filter-name"
                      placeholder="Ex: Equipamentos SP, Serviços RJ..."
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-keywords">Palavras-chave</Label>
                    <Input
                      id="filter-keywords"
                      placeholder="Ex: equipamentos; informática; escola"
                      value={formData.keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separe múltiplas palavras com ";"
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>💡 <strong>Dica:</strong> Para criar filtros mais específicos, use a página de Pesquisa Avançada e depois salve a combinação de filtros aqui.</p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => resetForm()}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateFilter}>
                    Salvar Filtro
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedFilters.map((filter) => (
            <Card key={filter.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{filter.name}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFilter(filter)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Filtro</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o filtro "{filter.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteFilter(filter)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
                
                <CardDescription className="text-xs">
                  {getFilterSummary(filter)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Badges dos Filtros */}
                  <div className="flex flex-wrap gap-1">
                    {filter.keywords.trim() && (
                      <Badge variant="outline" className="text-xs">
                        <Search className="h-3 w-3 mr-1" />
                        Palavras-chave
                      </Badge>
                    )}
                    
                    {filter.states.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {filter.states.length} Estado(s)
                      </Badge>
                    )}
                    
                    {filter.cities.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {filter.cities.length} Cidade(s)
                      </Badge>
                    )}
                    
                    {(filter.startDate || filter.endDate) && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Período
                      </Badge>
                    )}
                    
                    {filter.smartSearch && (
                      <Badge variant="secondary" className="text-xs">
                        Busca Inteligente
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => applyFilter(filter)}
                    className="w-full"
                    size="sm"
                  >
                    Aplicar Filtro
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Informações sobre os Filtros */}
      {savedFilters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como usar os Filtros Salvos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• Clique em "Aplicar Filtro" para ir para a página de pesquisa com os filtros pré-configurados</p>
            <p>• Use o botão de editar para modificar um filtro existente</p>
            <p>• Os filtros são salvos localmente no seu navegador</p>
            <p>• Você pode criar quantos filtros precisar para diferentes tipos de pesquisa</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Filters;
