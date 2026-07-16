import {
  MATRIZ_VALIDACAO_INVOICE,
  ORDEM_SECOES_MATRIZ_INVOICE,
  ROTULO_SECAO_MATRIZ_INVOICE,
  type RegraMatrizInvoice,
} from '@produto/smart-read/shared/matriz-validacao-invoice-smart-read'
import {
  MATRIZ_VALIDACAO_PACKING_LIST,
  ORDEM_SECOES_MATRIZ_PACKING_LIST,
  ROTULO_SECAO_MATRIZ_PACKING_LIST,
  type RegraMatrizPackingList,
} from '@produto/smart-read/shared/matriz-validacao-packing-list-smart-read'
import {
  MATRIZ_VALIDACAO_AWB,
  ORDEM_SECOES_MATRIZ_AWB,
  ROTULO_SECAO_MATRIZ_AWB,
  type RegraMatrizAwb,
} from '@produto/smart-read/shared/matriz-validacao-awb-smart-read'
import {
  MATRIZ_VALIDACAO_BL,
  ORDEM_SECOES_MATRIZ_BL,
  ROTULO_SECAO_MATRIZ_BL,
  type RegraMatrizBl,
} from '@produto/smart-read/shared/matriz-validacao-bl-smart-read'
import {
  MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM,
  ORDEM_SECOES_MATRIZ_CERTIFICADO_ORIGEM,
  ROTULO_SECAO_MATRIZ_CERTIFICADO_ORIGEM,
  type RegraMatrizCertificadoOrigem,
} from '@produto/smart-read/shared/matriz-validacao-certificado-origem-smart-read'
import {
  MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO,
  ORDEM_SECOES_MATRIZ_CERTIFICADO_FITOSSANITARIO,
  ROTULO_SECAO_MATRIZ_CERTIFICADO_FITOSSANITARIO,
  type RegraMatrizCertificadoFitossanitario,
} from '@produto/smart-read/shared/matriz-validacao-certificado-fitossanitario-smart-read'
import {
  MATRIZ_VALIDACAO_PEDIDO_COMPRA,
  ORDEM_SECOES_MATRIZ_PEDIDO_COMPRA,
  ROTULO_SECAO_MATRIZ_PEDIDO_COMPRA,
  type RegraMatrizPedidoCompra,
} from '@produto/smart-read/shared/matriz-validacao-pedido-compra-smart-read'
import {
  MATRIZ_VALIDACAO_PEDIDO_VENDA,
  ORDEM_SECOES_MATRIZ_PEDIDO_VENDA,
  ROTULO_SECAO_MATRIZ_PEDIDO_VENDA,
  type RegraMatrizPedidoVenda,
} from '@produto/smart-read/shared/matriz-validacao-pedido-venda-smart-read'

export const RESULTADOS_CHECKLIST_MANUAL =
  'CONFORME · ATENÇÃO · FALHA · PENDENTE · N/A'

export type LinhaChecklistManual = {
  ordem: number
  oQueE: string
  comoFeito: string
  baseLegal: string
  resultadosPossiveis: string
  documentos: string
}

export type GrupoChecklistManual = {
  id: string
  titulo: string
  tipoDocumento: string
  colunas: LinhaChecklistManual[]
}

const ROTULO_MOTOR: Record<string, string> = {
  codigo: 'Código determinístico',
  api: 'API cadastral (Receita/CNPJ)',
  llm: 'IA analista (Gemini)',
  rag: 'RAG + base normativa',
  cross_doc: 'Cruzamento entre documentos da leitura',
  codigo_rag: 'Código + RAG',
  cross_doc_rag: 'Cross-doc + RAG',
  api_llm: 'API + IA',
}

function rotuloMotor(motor: string): string {
  return ROTULO_MOTOR[motor] ?? motor
}

function documentosDaRegra(tipoDocumento: string, motor: string): string {
  if (motor === 'cross_doc' || motor === 'cross_doc_rag') {
    return `${tipoDocumento} — cruza com outros documentos da mesma leitura`
  }
  return tipoDocumento
}

type RegraGenerica = {
  id: string
  secao: string
  item: string
  motor: string
  tooltip_conferencia: string
  base_normativa?: string
  severidade?: string | null
}

function mapearRegra(
  regra: RegraGenerica,
  ordem: number,
  tipoDocumento: string,
): LinhaChecklistManual {
  return {
    ordem,
    oQueE: `**${regra.item}** — ${regra.tooltip_conferencia}`,
    comoFeito: rotuloMotor(regra.motor),
    baseLegal: regra.base_normativa?.trim() || '—',
    resultadosPossiveis: RESULTADOS_CHECKLIST_MANUAL,
    documentos: documentosDaRegra(tipoDocumento, regra.motor),
  }
}

function montarGruposPorSecao<T extends RegraGenerica>({
  prefixoId,
  tipoDocumento,
  matriz,
  ordemSecoes,
  rotulosSecao,
}: {
  prefixoId: string
  tipoDocumento: string
  matriz: T[]
  ordemSecoes: readonly string[]
  rotulosSecao: Record<string, string>
}): GrupoChecklistManual[] {
  return ordemSecoes.map((secao) => {
    const regras = matriz.filter((r) => {
      if ('severidade' in r && r.severidade === null) return false
      return r.secao === secao
    })
    return {
      id: `${prefixoId}-${secao}`,
      titulo: rotulosSecao[secao] ?? secao,
      tipoDocumento,
      colunas: regras.map((regra, i) => mapearRegra(regra, i + 1, tipoDocumento)),
    }
  }).filter((g) => g.colunas.length > 0)
}

export const GRUPOS_CHECKLIST_CONFERENCIA_SMART_READ: GrupoChecklistManual[] = [
  ...montarGruposPorSecao({
    prefixoId: 'invoice',
    tipoDocumento: 'Commercial Invoice',
    matriz: MATRIZ_VALIDACAO_INVOICE as RegraMatrizInvoice[],
    ordemSecoes: ORDEM_SECOES_MATRIZ_INVOICE,
    rotulosSecao: ROTULO_SECAO_MATRIZ_INVOICE,
  }),
  ...montarGruposPorSecao({
    prefixoId: 'packing-list',
    tipoDocumento: 'Packing List',
    matriz: MATRIZ_VALIDACAO_PACKING_LIST as RegraMatrizPackingList[],
    ordemSecoes: ORDEM_SECOES_MATRIZ_PACKING_LIST,
    rotulosSecao: ROTULO_SECAO_MATRIZ_PACKING_LIST,
  }),
  ...montarGruposPorSecao({
    prefixoId: 'awb',
    tipoDocumento: 'Air Waybill (AWB)',
    matriz: MATRIZ_VALIDACAO_AWB as RegraMatrizAwb[],
    ordemSecoes: ORDEM_SECOES_MATRIZ_AWB,
    rotulosSecao: ROTULO_SECAO_MATRIZ_AWB,
  }),
  ...montarGruposPorSecao({
    prefixoId: 'bl',
    tipoDocumento: 'Bill of Lading (BL)',
    matriz: MATRIZ_VALIDACAO_BL as RegraMatrizBl[],
    ordemSecoes: ORDEM_SECOES_MATRIZ_BL,
    rotulosSecao: ROTULO_SECAO_MATRIZ_BL,
  }),
  ...montarGruposPorSecao({
    prefixoId: 'certificado-origem',
    tipoDocumento: 'Certificado de Origem',
    matriz: MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM as RegraMatrizCertificadoOrigem[],
    ordemSecoes: ORDEM_SECOES_MATRIZ_CERTIFICADO_ORIGEM,
    rotulosSecao: ROTULO_SECAO_MATRIZ_CERTIFICADO_ORIGEM,
  }),
  ...montarGruposPorSecao({
    prefixoId: 'certificado-fitossanitario',
    tipoDocumento: 'Certificado Fitossanitário',
    matriz: MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO as RegraMatrizCertificadoFitossanitario[],
    ordemSecoes: ORDEM_SECOES_MATRIZ_CERTIFICADO_FITOSSANITARIO,
    rotulosSecao: ROTULO_SECAO_MATRIZ_CERTIFICADO_FITOSSANITARIO,
  }),
  ...montarGruposPorSecao({
    prefixoId: 'pedido-compra',
    tipoDocumento: 'Pedido de Compra (PO)',
    matriz: MATRIZ_VALIDACAO_PEDIDO_COMPRA as RegraMatrizPedidoCompra[],
    ordemSecoes: ORDEM_SECOES_MATRIZ_PEDIDO_COMPRA,
    rotulosSecao: ROTULO_SECAO_MATRIZ_PEDIDO_COMPRA,
  }),
  ...montarGruposPorSecao({
    prefixoId: 'pedido-venda',
    tipoDocumento: 'Pedido de Venda (SO)',
    matriz: MATRIZ_VALIDACAO_PEDIDO_VENDA as RegraMatrizPedidoVenda[],
    ordemSecoes: ORDEM_SECOES_MATRIZ_PEDIDO_VENDA,
    rotulosSecao: ROTULO_SECAO_MATRIZ_PEDIDO_VENDA,
  }),
]

export const TOTAL_REGRAS_CHECKLIST_SMART_READ = GRUPOS_CHECKLIST_CONFERENCIA_SMART_READ
  .reduce((acc, g) => acc + g.colunas.length, 0)

export const TOTAL_TIPOS_DOCUMENTO_CHECKLIST_SMART_READ = 8

export const TOTAL_SECOES_CHECKLIST_SMART_READ = GRUPOS_CHECKLIST_CONFERENCIA_SMART_READ.length

export const CONTAGEM_REGRAS_POR_TIPO_CHECKLIST: { tipo: string; regras: number; secoes: number }[] = [
  'Commercial Invoice',
  'Packing List',
  'Air Waybill (AWB)',
  'Bill of Lading (BL)',
  'Certificado de Origem',
  'Certificado Fitossanitário',
  'Pedido de Compra (PO)',
  'Pedido de Venda (SO)',
].map((tipo) => {
  const grupos = GRUPOS_CHECKLIST_CONFERENCIA_SMART_READ.filter((g) => g.tipoDocumento === tipo)
  return {
    tipo,
    regras: grupos.reduce((acc, g) => acc + g.colunas.length, 0),
    secoes: grupos.length,
  }
})
