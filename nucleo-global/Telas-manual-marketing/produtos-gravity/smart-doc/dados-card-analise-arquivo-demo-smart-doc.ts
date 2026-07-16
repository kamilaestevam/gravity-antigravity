import type { DocumentoSimulador } from './documentos-preview-simulador-smart-doc'

/** Documentos identificados no PDF composto do manual (paridade print passo 2-c). */
export const DOCUMENTOS_INVOICES_PACKINGS_DEMO: DocumentoSimulador[] = [
  { id: 'doc-inv-1', rotulo: 'INVOICE 1', tipo: 'invoice', quantidadeItens: 2 },
  { id: 'doc-pl-1', rotulo: 'PACKING LIST 1', tipo: 'packing-list', quantidadeItens: 2 },
  { id: 'doc-inv-2', rotulo: 'INVOICE 2', tipo: 'invoice', quantidadeItens: 2 },
  { id: 'doc-pl-2', rotulo: 'PACKING LIST 2', tipo: 'packing-list', quantidadeItens: 2 },
]

export const NOME_ARQUIVO_DEMO_CARD_ANALISE = 'invoices_packings.pdf'

export type FaseNarrativaCardAnaliseDemo = 1 | 2 | 3

export type AlvoDemoCardAnaliseArquivo =
  | 'expandir'
  | 'fechar-preview'
  | `visualizar-doc-${number}`

export const PASSOS_NARRATIVOS_CARD_ANALISE_DEMO: {
  fase: FaseNarrativaCardAnaliseDemo
  rotulo: string
  texto: string
}[] = [
  {
    fase: 1,
    rotulo: 'Identificou e separou',
    texto:
      'O Smart Doc **identifica o que está dentro do arquivo** e **separa cada documento**.',
  },
  {
    fase: 2,
    rotulo: 'Separação correta',
    texto: 'Cada documento já aparece separado na lista do card, pronto para conferência.',
  },
  {
    fase: 3,
    rotulo: 'Visualizar arquivos',
    texto: 'Use o ícone Visualizar para abrir o preview de cada documento identificado.',
  },
]
