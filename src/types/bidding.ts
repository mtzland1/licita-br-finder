
export interface Bidding {
  _id: string;
  valorTotalEstimado: number;
  valorTotalHomologado?: number;
  orcamentoSigilosoCodigo: number;
  orcamentoSigilosoDescricao: string;
  numeroControlePNCP: string;
  linkSistemaOrigem?: string;
  linkProcessoEletronico?: string;
  anoCompra: number;
  sequencialCompra: number;
  numeroCompra: string;
  processo: string;
  orgaoEntidade: {
    cnpj: string;
    razaoSocial: string;
    poderId: string;
    esferaId: string;
  };
  unidadeOrgao: {
    ufNome: string;
    codigoIbge: string;
    codigoUnidade: string;
    nomeUnidade: string;
    ufSigla: string;
    municipioNome: string;
  };
  orgaoSubRogado?: any;
  unidadeSubRogada?: any;
  modalidadeId: number;
  modalidadeNome: string;
  justificativaPresencial?: string;
  modoDisputaId: number;
  modoDisputaNome: string;
  tipoInstrumentoConvocatorioCodigo: number;
  tipoInstrumentoConvocatorioNome: string;
  amparoLegal: {
    descricao: string;
    nome: string;
    codigo: number;
  };
  objetoCompra: string;
  informacaoComplementar?: string;
  srp: boolean;
  fontesOrcamentarias: any[];
  dataPublicacaoPncp: Date;
  dataAberturaProposta: Date;
  dataEncerramentoProposta: Date;
  situacaoCompraId: number;
  situacaoCompraNome: string;
  existeResultado: boolean;
  status: 'aberto' | 'encerrado';
  dataInclusao: Date;
  dataAtualizacao: Date;
  dataAtualizacaoGlobal: Date;
  usuarioNome: string;
  dataExtracao: Date;
  arquivos: Array<{
    uri: string;
    tipoDocumentoId: number;
    tipoDocumentoDescricao: string;
    url: string;
    sequencialDocumento: number;
    dataPublicacaoPncp: string;
    cnpj: string;
    anoCompra: number;
    sequencialCompra: number;
    statusAtivo: boolean;
    titulo: string;
    tipoDocumentoNome: string;
  }>;
}

export interface SearchFilters {
  keywords: string;
  states: string[];
  modalities: string[];
  cities: string[];
  startDate?: Date;
  endDate?: Date;
  smartSearch: boolean;
}
