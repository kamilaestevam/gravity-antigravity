import React, { useEffect } from 'react'
import {
  Barcode,
  Certificate,
  Hash,
  IdentificationCard,
  Package,
  Plus,
  Scales,
  TextAlignLeft,
  Trash,
  Warning,
} from '@phosphor-icons/react'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'
import { calcularCubagemAutoDimensoesPorModalBidFreteInternacional } from '@produto/bid-frete-internacional/shared/calcular-cubagem-m3-dimensoes-bid-frete-internacional'
import { instalarMockApiNcmSimuladorPedido } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/instalar-mock-api-ncm-simulador-pedido'
import {
  ICONE_FIELD,
  ICONE_LABEL_SECAO,
  SimuladorNcField,
  SimuladorNcSectionTitle,
} from './manual-bid-frete-simulador-nc-ui'
import {
  type CampoGuiaAoVivo,
  type SelecaoGuiaAoVivo,
} from './manual-bid-frete-guia-ao-vivo'

export type CampoCargaIncotermId =
  | 'descricao_mercadoria'
  | 'ncm'
  | 'hs_code'
  | 'numero_onu'
  | 'quantidade'
  | 'peso_cubagem'
  | 'incoterm'
  | 'valor_alvo'

export type LinhaContainerFcl = {
  id: string
  tipo_container: string
  quantidade: number
}

export type EstadoCargaIncoterm = {
  /** Código NCM em 8 dígitos (storage do SelectNcmGlobal). */
  ncm: string
  descricao_mercadoria: string
  hs_code: string
  id_mercadoria_perigosa: string | null
  numero_onu: string
  classe_dg: string
  divisao_dg: string
  grupo_embalagem_dg: string
  nome_tecnico_embarque: string
  observacoes_dg: string
  linhas_container_fcl: LinhaContainerFcl[]
  tipo_volume: string | null
  quantidade_volume: number
  peso_kg: string
  peso_ton: string
  cubagem_detalhada: boolean
  unidade_cubagem: string | null
  comprimento: string
  largura: string
  altura: string
  cubagem_m3: string
  incoterm: string
  moeda_alvo: string | null
  valor_alvo: string
}

export type ContextoPassoCarga = {
  modal_frete: 'MARITIMO' | 'AEREO' | 'RODOVIARIO' | ''
  modalidade: 'FCL' | 'LCL' | 'FTL' | 'LTL' | ''
  carga_perigosa: boolean
}

const INCOTERM_TODOS = [
  'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
] as const

const INCOTERM_AJUDA: Record<string, { titulo: string; desc: string; responsabilidade: string }> = {
  EXW: {
    titulo: 'EXW: Ex Works',
    desc: 'O vendedor disponibiliza a mercadoria no próprio estabelecimento. Coleta, frete e risco ficam com o comprador.',
    responsabilidade: 'Comprador assume quase tudo a partir da origem',
  },
  FCA: {
    titulo: 'FCA: Free Carrier',
    desc: 'O vendedor entrega a mercadoria ao transportador indicado pelo comprador no local combinado.',
    responsabilidade: 'Vendedor até a entrega ao transportador; depois, comprador',
  },
  FAS: {
    titulo: 'FAS: Free Alongside Ship',
    desc: 'O vendedor coloca a mercadoria ao lado do navio no porto de embarque (só marítimo).',
    responsabilidade: 'Vendedor até o costado do navio; embarque e frete com o comprador',
  },
  FOB: {
    titulo: 'FOB: Free On Board',
    desc: 'O vendedor embarca a mercadoria no navio no porto de origem (só marítimo).',
    responsabilidade: 'Vendedor até o embarque; frete principal com o comprador',
  },
  CFR: {
    titulo: 'CFR: Cost and Freight',
    desc: 'O vendedor paga o frete até o porto de destino; o risco passa no embarque.',
    responsabilidade: 'Frete com o vendedor; risco com o comprador após embarque',
  },
  CIF: {
    titulo: 'CIF: Cost, Insurance and Freight',
    desc: 'Como CFR, com seguro mínimo contratado pelo vendedor até o destino.',
    responsabilidade: 'Frete e seguro mínimo com o vendedor; risco após embarque com o comprador',
  },
  CPT: {
    titulo: 'CPT: Carriage Paid To',
    desc: 'O vendedor paga o transporte até o local de destino combinado; o risco passa na entrega ao primeiro transportador.',
    responsabilidade: 'Frete com o vendedor; risco antecipado para o comprador',
  },
  CIP: {
    titulo: 'CIP: Carriage and Insurance Paid To',
    desc: 'Como CPT, com seguro contratado pelo vendedor até o destino.',
    responsabilidade: 'Frete e seguro com o vendedor; risco antecipado para o comprador',
  },
  DAP: {
    titulo: 'DAP: Delivered at Place',
    desc: 'O vendedor entrega no local de destino, pronto para desembarque; impostos de importação ficam com o comprador.',
    responsabilidade: 'Vendedor até o local; desembaraço de importação com o comprador',
  },
  DPU: {
    titulo: 'DPU: Delivered at Place Unloaded',
    desc: 'O vendedor entrega e descarrega no local de destino combinado.',
    responsabilidade: 'Vendedor até a descarga; impostos de importação com o comprador',
  },
  DDP: {
    titulo: 'DDP: Delivered Duty Paid',
    desc: 'O vendedor entrega no destino com impostos e desembaraço de importação pagos.',
    responsabilidade: 'Máxima responsabilidade do vendedor até a entrega final',
  },
}

function formatarNcmDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`
}

const ONU_CATALOGO: Array<{
  id: string
  rotulo: string
  numero_onu: string
  classe: string
  divisao: string
  grupo: string
  nome: string
}> = [
  {
    id: 'un1203',
    rotulo: 'UN 1203: Gasolina',
    numero_onu: '1203',
    classe: '3',
    divisao: '',
    grupo: 'II',
    nome: 'GASOLINE',
  },
  {
    id: 'un1263',
    rotulo: 'UN 1263: Tinta',
    numero_onu: '1263',
    classe: '3',
    divisao: '',
    grupo: 'III',
    nome: 'PAINT',
  },
  {
    id: 'un3480',
    rotulo: 'UN 3480: Bateria de íon-lítio',
    numero_onu: '3480',
    classe: '9',
    divisao: '',
    grupo: '',
    nome: 'LITHIUM ION BATTERIES',
  },
]

const CONTAINERS_CATALOGO: SelectOpcao[] = [
  { valor: '20GP', rotulo: '20GP: Dry 20\'' },
  { valor: '40GP', rotulo: '40GP: Dry 40\'' },
  { valor: '40HC', rotulo: '40HC: High Cube 40\'' },
  { valor: '20RF', rotulo: '20RF: Reefer 20\'' },
  { valor: '40RF', rotulo: '40RF: Reefer 40\'' },
]

const EMBALAGENS_CATALOGO: SelectOpcao[] = [
  { valor: 'CAIXA', rotulo: 'Caixa' },
  { valor: 'PALLET', rotulo: 'Pallet' },
  { valor: 'VOLUME', rotulo: 'Volume' },
  { valor: 'FARDO', rotulo: 'Fardo' },
  { valor: 'SACO', rotulo: 'Saco' },
  { valor: 'TAMBOR', rotulo: 'Tambor' },
  { valor: 'BIG_BAG', rotulo: 'Big bag' },
  { valor: 'UNIDADE', rotulo: 'Unidade' },
]

const UNIDADES_CUBAGEM: SelectOpcao[] = [
  { valor: 'CM', rotulo: 'Centímetro (cm)' },
  { valor: 'M', rotulo: 'Metro (m)' },
  { valor: 'IN', rotulo: 'Polegada (in)' },
]

const MOEDAS_CATALOGO: SelectOpcao[] = [
  { valor: 'USD', rotulo: 'USD: Dólar americano' },
  { valor: 'BRL', rotulo: 'BRL: Real brasileiro' },
  { valor: 'EUR', rotulo: 'EUR: Euro' },
  { valor: 'CNY', rotulo: 'CNY: Yuan chinês' },
]

function novaLinhaContainer(): LinhaContainerFcl {
  return {
    id: `ctn-${Math.random().toString(36).slice(2, 9)}`,
    tipo_container: '',
    quantidade: 1,
  }
}

export const ESTADO_CARGA_INCOTERM_INICIAL: EstadoCargaIncoterm = {
  ncm: '',
  descricao_mercadoria: '',
  hs_code: '',
  id_mercadoria_perigosa: null,
  numero_onu: '',
  classe_dg: '',
  divisao_dg: '',
  grupo_embalagem_dg: '',
  nome_tecnico_embarque: '',
  observacoes_dg: '',
  linhas_container_fcl: [novaLinhaContainer()],
  tipo_volume: null,
  quantidade_volume: 0,
  peso_kg: '',
  peso_ton: '',
  cubagem_detalhada: false,
  unidade_cubagem: null,
  comprimento: '',
  largura: '',
  altura: '',
  cubagem_m3: '',
  incoterm: '',
  moeda_alvo: null,
  valor_alvo: '',
}

export function exigeContainerFcl(contexto: ContextoPassoCarga): boolean {
  return contexto.modal_frete === 'MARITIMO' && contexto.modalidade === 'FCL'
}

function rotuloModalidade(contexto: ContextoPassoCarga): string {
  if (contexto.modal_frete === 'AEREO') return 'Aéreo'
  if (contexto.modalidade === 'FCL') return 'FCL'
  if (contexto.modalidade === 'LCL') return 'LCL'
  if (contexto.modalidade === 'FTL') return 'FTL'
  if (contexto.modalidade === 'LTL') return 'LTL'
  return 'volume'
}

function sufixoQuantidade(tipoVolume: string | null): string {
  if (!tipoVolume) return 'un'
  if (tipoVolume === 'PALLET') return 'plt'
  if (tipoVolume === 'CAIXA') return 'cx'
  if (tipoVolume === 'TAMBOR') return 'tb'
  return 'un'
}

export const CAMPOS_CARGA_INCOTERM_BID_FRETE: CampoGuiaAoVivo<CampoCargaIncotermId>[] = [
  {
    id: 'descricao_mercadoria',
    num: '01',
    rotulo: 'Descrição da mercadoria',
    paragrafoGuia:
      'Texto comercial da carga que os fornecedores verão na cotação. É o único campo obrigatório da identificação da mercadoria neste passo.',
    descricaoPontos: [
      'Obrigatório para avançar',
      'Pode ser preenchido junto com NCM e HS Code',
      'Use linguagem clara para o fornecedor cotar',
    ],
    obrigatorio: true,
    icone: TextAlignLeft,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.35)',
    fundo: 'rgba(45,212,191,.08)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: ['Resumo da cotação', 'Propostas dos fornecedores'],
  },
  {
    id: 'ncm',
    num: '02',
    rotulo: 'NCM',
    paragrafoGuia:
      'Código NCM da mercadoria. Digite os 8 dígitos ou use a **lupa** para **localizar por NCM ou por descrição** no catálogo (mesmo componente do produto).',
    descricaoPontos: [
      'Opcional para avançar',
      'Lupa abre busca por código ou descrição',
      'Ao escolher no modal, a descrição pode ser preenchida',
    ],
    obrigatorio: false,
    icone: Barcode,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.35)',
    fundo: 'rgba(56,189,248,.08)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
  },
  {
    id: 'hs_code',
    num: '03',
    rotulo: 'HS Code',
    paragrafoGuia:
      'Código HS internacional (até 10 caracteres). Complementa o NCM quando a operação exige classificação harmonizada.',
    descricaoPontos: [
      'Opcional',
      'Formato livre curto (ex.: 8708.99)',
      'Útil em operações com parceiros no exterior',
    ],
    obrigatorio: false,
    icone: Certificate,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.35)',
    fundo: 'rgba(167,139,250,.08)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
  },
  {
    id: 'numero_onu',
    num: '04',
    rotulo: 'Número ONU',
    paragrafoGuia:
      'Aparece só se **Carga perigosa** foi marcada no passo Modal e Operação. Escolha a mercadoria ONU; classe, divisão e nome técnico vêm preenchidos.',
    descricaoPontos: [
      'Obrigatório quando carga perigosa está marcada',
      'Classificação IMDG / IATA DGR / ADR',
      'Observações DG são opcionais',
    ],
    obrigatorio: true,
    obrigatorioNota: 'Somente se carga perigosa estiver marcada',
    icone: Warning,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.35)',
    fundo: 'rgba(251,191,36,.08)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: ['Alertas DG no resumo', 'Filtro de fornecedores aptos'],
  },
  {
    id: 'quantidade',
    num: '05',
    rotulo: 'Quantidade',
    paragrafoGuia:
      'No **FCL** marítimo: uma ou mais linhas de tipo de container + quantidade (ctn). Nos demais modais/modalidades: tipo de volume (caixa, pallet…) + quantidade.',
    descricaoPontos: [
      'Obrigatório para avançar',
      'FCL: container + quantidade > 0',
      'LCL / aéreo / rodoviário: volume + quantidade > 0',
    ],
    obrigatorio: true,
    icone: Package,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.35)',
    fundo: 'rgba(56,189,248,.08)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: ['Cálculo de frete', 'Comparativo de propostas'],
  },
  {
    id: 'peso_cubagem',
    num: '06',
    rotulo: 'Peso e cubagem',
    paragrafoGuia:
      'Bloco opcional. Informe peso em kg ou ton (conversão automática) e, se quiser, cubagem detalhada com medidas.',
    descricaoPontos: [
      'Opcional',
      'Kg e ton se atualizam mutuamente',
      'Cubagem detalhada libera medidas e m³',
    ],
    obrigatorio: false,
    icone: Scales,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.35)',
    fundo: 'rgba(148,163,184,.08)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
  },
  {
    id: 'incoterm',
    num: '07',
    rotulo: 'Incoterm',
    paragrafoGuia:
      'Define quem assume frete e risco até o destino (EXW, FOB, CIF, DAP…). Obrigatório para avançar; o card abaixo explica a responsabilidade do termo escolhido.',
    descricaoPontos: [
      'Obrigatório',
      '11 termos Incoterms® 2020',
      'Card de ajuda muda conforme a escolha',
    ],
    obrigatorio: true,
    icone: Scales,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.35)',
    fundo: 'rgba(45,212,191,.08)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: ['Escopo de coleta/entrega', 'Comparativo de propostas'],
  },
  {
    id: 'valor_alvo',
    num: '08',
    rotulo: 'Valor alvo',
    paragrafoGuia:
      'Referência opcional de preço esperado (moeda + valor). Não bloqueia o avanço; ajuda o fornecedor a calibrar a proposta.',
    descricaoPontos: [
      'Opcional',
      'Moeda + valor de referência',
      'Não substitui a proposta do fornecedor',
    ],
    obrigatorio: false,
    icone: Hash,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.35)',
    fundo: 'rgba(251,191,36,.08)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
  },
]

const ORDEM_CAMPOS_GUIA: CampoCargaIncotermId[] = [
  'descricao_mercadoria',
  'ncm',
  'hs_code',
  'numero_onu',
  'quantidade',
  'peso_cubagem',
  'incoterm',
  'valor_alvo',
]

const CAMPOS_GUIA_EXIBEM_SEM_VALOR: CampoCargaIncotermId[] = ['quantidade', 'peso_cubagem']

function propsFocoGuiaSecaoCarga(
  idCampo: CampoCargaIncotermId,
  aoInteragir: (campo: CampoCargaIncotermId) => void,
  aoDesligarCampo: (campo: CampoCargaIncotermId) => void,
) {
  return {
    onFocusCapture: () => aoInteragir(idCampo),
    onBlurCapture: (e: React.FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        aoDesligarCampo(idCampo)
      }
    },
  }
}

function resolverRotuloSelecao(
  estado: EstadoCargaIncoterm,
  id: CampoCargaIncotermId,
  contexto: ContextoPassoCarga,
): string | null {
  switch (id) {
    case 'descricao_mercadoria':
      return estado.descricao_mercadoria.trim() || null
    case 'ncm':
      return estado.ncm.trim() ? formatarNcmDisplay(estado.ncm) : null
    case 'hs_code':
      return estado.hs_code.trim() || null
    case 'numero_onu':
      if (!contexto.carga_perigosa) return null
      return estado.numero_onu ? `UN ${estado.numero_onu}` : null
    case 'quantidade': {
      if (exigeContainerFcl(contexto)) {
        const linhas = estado.linhas_container_fcl.filter(
          (l) => l.tipo_container && l.quantidade > 0,
        )
        if (linhas.length === 0) return null
        return linhas.map((l) => `${l.quantidade}× ${l.tipo_container}`).join(', ')
      }
      if (!estado.tipo_volume || estado.quantidade_volume <= 0) return null
      return `${estado.quantidade_volume} ${estado.tipo_volume}`
    }
    case 'peso_cubagem': {
      const partes: string[] = []
      if (estado.peso_kg) partes.push(`${estado.peso_kg} kg`)
      if (estado.cubagem_m3) partes.push(`${estado.cubagem_m3} m³`)
      return partes.length ? partes.join(' · ') : null
    }
    case 'incoterm':
      return estado.incoterm || null
    case 'valor_alvo': {
      if (!estado.valor_alvo.trim()) return null
      return estado.moeda_alvo
        ? `${estado.moeda_alvo} ${estado.valor_alvo}`
        : estado.valor_alvo
    }
    default:
      return null
  }
}

export function podeAvancarPassoCargaIncoterm(
  estado: EstadoCargaIncoterm,
  contexto: ContextoPassoCarga,
): boolean {
  if (!estado.descricao_mercadoria.trim()) return false
  if (!estado.incoterm) return false

  if (contexto.carga_perigosa) {
    if (!estado.numero_onu.trim() || !estado.nome_tecnico_embarque.trim() || !estado.classe_dg.trim()) {
      return false
    }
  }

  if (exigeContainerFcl(contexto)) {
    return estado.linhas_container_fcl.some(
      (l) => l.tipo_container.trim() !== '' && l.quantidade > 0,
    )
  }

  return !!estado.tipo_volume && estado.quantidade_volume > 0
}

export function resolverSelecoesCargaIncoterm(
  estado: EstadoCargaIncoterm,
  interagiu: Partial<Record<CampoCargaIncotermId, boolean>>,
  contexto: ContextoPassoCarga,
): SelecaoGuiaAoVivo<CampoCargaIncotermId>[] {
  return ORDEM_CAMPOS_GUIA.flatMap((id) => {
    if (id === 'numero_onu' && !contexto.carga_perigosa) return []
    if (!interagiu[id]) return []
    const valor = resolverRotuloSelecao(estado, id, contexto)
    if (!valor) {
      if (CAMPOS_GUIA_EXIBEM_SEM_VALOR.includes(id)) {
        return [{ id, valor: 'Em preenchimento' }]
      }
      return []
    }
    return [{ id, valor }]
  })
}

export function resolverExplicacaoCargaIncoterm(
  estado: EstadoCargaIncoterm,
  foco: CampoCargaIncotermId | null,
  contexto: ContextoPassoCarga,
): string {
  if (!foco) return ''
  switch (foco) {
    case 'descricao_mercadoria':
      return estado.descricao_mercadoria.trim()
        ? `Descrição informada: **${estado.descricao_mercadoria.trim()}**. Os fornecedores usarão este texto para entender a carga.`
        : 'Preencha a **descrição comercial** da mercadoria para liberar o avanço.'
    case 'ncm':
      return estado.ncm.trim()
        ? `NCM selecionado: **${formatarNcmDisplay(estado.ncm)}**. Use a lupa para localizar por código ou descrição.`
        : 'Informe o **NCM** ou use a **lupa** para localizar por código ou descrição (opcional).'
    case 'hs_code':
      return estado.hs_code.trim()
        ? `HS Code informado: **${estado.hs_code.trim()}**.`
        : 'Informe o **HS Code** se a operação exigir classificação harmonizada (opcional).'
    case 'numero_onu':
      return estado.numero_onu
        ? `Mercadoria perigosa **UN ${estado.numero_onu}** (${estado.nome_tecnico_embarque}). Classe **${estado.classe_dg}**.`
        : 'Com **carga perigosa** marcada, escolha o **número ONU** no catálogo de amostra.'
    case 'quantidade':
      if (exigeContainerFcl(contexto)) {
        const linhas = estado.linhas_container_fcl.filter((l) => l.tipo_container && l.quantidade > 0)
        return linhas.length
          ? `Containers FCL: ${linhas.map((l) => `**${l.quantidade}× ${l.tipo_container}**`).join(', ')}.`
          : 'No **FCL**, adicione ao menos um **tipo de container** com quantidade maior que zero.'
      }
      return estado.tipo_volume && estado.quantidade_volume > 0
        ? `Volume **${estado.tipo_volume}** com quantidade **${estado.quantidade_volume}** (${rotuloModalidade(contexto)}).`
        : `Escolha o **tipo de volume** e a **quantidade** para a modalidade **${rotuloModalidade(contexto)}**.`
    case 'peso_cubagem':
      return estado.peso_kg || estado.cubagem_m3
        ? `Peso/cubagem: ${[estado.peso_kg && `**${estado.peso_kg} kg**`, estado.cubagem_m3 && `**${estado.cubagem_m3} m³**`].filter(Boolean).join(' · ')}.`
        : 'Bloco opcional: informe **peso** e, se quiser, **cubagem detalhada**.'
    case 'incoterm': {
      const ajuda = estado.incoterm ? INCOTERM_AJUDA[estado.incoterm] : null
      return ajuda
        ? `Incoterm **${estado.incoterm}**: ${ajuda.desc}`
        : 'Escolha o **Incoterm** que define frete e risco nesta cotação.'
    }
    case 'valor_alvo':
      return estado.valor_alvo.trim()
        ? `Valor alvo: **${estado.moeda_alvo ?? ''} ${estado.valor_alvo}**. Referência opcional para o fornecedor.`
        : 'Informe moeda e valor alvo se quiser dar uma referência de preço (opcional).'
    default:
      return ''
  }
}

function SubsecaoTitle({
  id,
  icone,
  obrigatorio,
  children,
}: {
  id: string
  icone: React.ReactNode
  obrigatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <h4 id={id} className="nc-cargo-subsecao-title">
      {icone}
      {children}
      {obrigatorio ? <span className="nc-obrig">*</span> : null}
    </h4>
  )
}

function recalcularCubagemM3Auto(
  estado: EstadoCargaIncoterm,
  contexto: ContextoPassoCarga,
  parcial: Partial<EstadoCargaIncoterm> = {},
): Partial<EstadoCargaIncoterm> {
  const next = { ...estado, ...parcial }
  const m3Auto = calcularCubagemAutoDimensoesPorModalBidFreteInternacional({
    comprimento: next.comprimento,
    largura: next.largura,
    altura: next.altura,
    codigo_unidade: next.unidade_cubagem ?? '',
    modal: contexto.modal_frete,
  })
  if (m3Auto == null) return parcial
  return { ...parcial, cubagem_m3: m3Auto }
}

/** Conteúdo do passo 3 — embutido no wizard unificado do manual. */
export function ConteudoPassoCargaIncotermSimulador({
  estado,
  contexto,
  aoAtualizar,
  aoInteragir,
  aoDesligarCampo,
}: {
  estado: EstadoCargaIncoterm
  contexto: ContextoPassoCarga
  aoAtualizar: (parcial: Partial<EstadoCargaIncoterm>) => void
  aoInteragir: (campo: CampoCargaIncotermId) => void
  aoDesligarCampo: (campo: CampoCargaIncotermId) => void
}) {
  const fcl = exigeContainerFcl(contexto)
  const modalidadeLabel = rotuloModalidade(contexto)
  const ajudaIncoterm = estado.incoterm ? INCOTERM_AJUDA[estado.incoterm] : null
  const opcoesOnu: SelectOpcao[] = ONU_CATALOGO.map((o) => ({ valor: o.id, rotulo: o.rotulo }))

  useEffect(() => instalarMockApiNcmSimuladorPedido(), [])

  const atualizarDimensaoComAutoCalc = (parcial: Partial<EstadoCargaIncoterm>) => {
    aoAtualizar(recalcularCubagemM3Auto(estado, contexto, parcial))
    aoInteragir('peso_cubagem')
  }

  return (
    <div className="nc-root nc-step-wrapper nc-fade-in">
      <div className="nc-step-content nc-cargo-stack">
        <SimuladorNcSectionTitle icone={<Package {...ICONE_LABEL_SECAO} />} obrigatorio>
          Dados da mercadoria
        </SimuladorNcSectionTitle>

        <section className="nc-cargo-subsecao" aria-labelledby="nc-sim-cargo-identificacao">
          <SubsecaoTitle
            id="nc-sim-cargo-identificacao"
            icone={<IdentificationCard {...ICONE_LABEL_SECAO} />}
            obrigatorio
          >
            Identificação da mercadoria
          </SubsecaoTitle>
          <p className="nc-cargo-subsecao-hint">
            NCM, descrição comercial e HS Code (quando aplicável).
          </p>
          <div className="nc-cargo-subsecao-grid-identificacao">
            <SimuladorNcField label="NCM" icone={<Barcode {...ICONE_FIELD} />}>
              <SelectNcmGlobal
                className="nc-campo-ncm nc-campo-ncm--label-externo"
                label=""
                value={estado.ncm}
                onChange={(codigo, descricao) => {
                  aoAtualizar({
                    ncm: codigo,
                    ...(descricao && !estado.descricao_mercadoria.trim()
                      ? { descricao_mercadoria: descricao.replace(/<[^>]*>/g, '') }
                      : {}),
                  })
                  aoInteragir('ncm')
                  if (descricao && !estado.descricao_mercadoria.trim()) {
                    aoInteragir('descricao_mercadoria')
                  }
                }}
              />
            </SimuladorNcField>

            <SimuladorNcField
              label="Descrição da mercadoria"
              obrigatorio
              icone={<TextAlignLeft {...ICONE_FIELD} />}
              className="nc-cargo-descricao"
            >
              <input
                className="nc-input"
                placeholder="Ex: Peças automotivas, eletrônicos industriais..."
                value={estado.descricao_mercadoria}
                onChange={(e) => {
                  aoAtualizar({ descricao_mercadoria: e.target.value })
                  aoInteragir('descricao_mercadoria')
                }}
              />
            </SimuladorNcField>
          </div>

          <div className="nc-cargo-subsecao-grid-hs">
            <SimuladorNcField label="HS CODE" icone={<Certificate {...ICONE_FIELD} />}>
              <input
                className="nc-input"
                placeholder="Ex: 8708.99"
                value={estado.hs_code}
                onChange={(e) => {
                  aoAtualizar({ hs_code: e.target.value.slice(0, 10) })
                  aoInteragir('hs_code')
                }}
              />
            </SimuladorNcField>
          </div>
        </section>

        {contexto.carga_perigosa ? (
          <section className="nc-cargo-subsecao" aria-labelledby="nc-sim-cargo-perigosa">
            <SubsecaoTitle
              id="nc-sim-cargo-perigosa"
              icone={<Warning {...ICONE_LABEL_SECAO} />}
              obrigatorio
            >
              Carga perigosa
            </SubsecaoTitle>
            <p className="nc-cargo-subsecao-hint">
              Marcado no passo 1: informe a classificação ONU (IMDG / IATA DGR / ADR).
            </p>
            <div className="nc-cargo-perigosa-grid">
              <SimuladorNcField label="Número ONU" obrigatorio icone={<Warning {...ICONE_FIELD} />}>
                <SelectGlobal
                  opcoes={opcoesOnu}
                  valor={estado.id_mercadoria_perigosa}
                  aoMudarValor={(v) => {
                    const id = v == null ? null : String(v)
                    const merc = ONU_CATALOGO.find((o) => o.id === id)
                    if (!merc) {
                      aoAtualizar({
                        id_mercadoria_perigosa: null,
                        numero_onu: '',
                        classe_dg: '',
                        divisao_dg: '',
                        grupo_embalagem_dg: '',
                        nome_tecnico_embarque: '',
                      })
                      aoDesligarCampo('numero_onu')
                      return
                    }
                    aoAtualizar({
                      id_mercadoria_perigosa: merc.id,
                      numero_onu: merc.numero_onu,
                      classe_dg: merc.classe,
                      divisao_dg: merc.divisao,
                      grupo_embalagem_dg: merc.grupo,
                      nome_tecnico_embarque: merc.nome,
                    })
                    aoInteragir('numero_onu')
                  }}
                  placeholder="Selecione UN + nome técnico..."
                  buscavel
                  posicao="auto"
                />
              </SimuladorNcField>
              <SimuladorNcField label="Classe" icone={<Package {...ICONE_FIELD} />}>
                <input className="nc-input" readOnly value={estado.classe_dg || '—'} />
              </SimuladorNcField>
              <SimuladorNcField label="Divisão" icone={<Package {...ICONE_FIELD} />}>
                <input className="nc-input" readOnly value={estado.divisao_dg || '—'} />
              </SimuladorNcField>
              <SimuladorNcField label="Grupo de embalagem" icone={<Package {...ICONE_FIELD} />}>
                <input className="nc-input" readOnly value={estado.grupo_embalagem_dg || '—'} />
              </SimuladorNcField>
              <SimuladorNcField label="Nome técnico de embarque" icone={<TextAlignLeft {...ICONE_FIELD} />}>
                <input className="nc-input" readOnly value={estado.nome_tecnico_embarque || '—'} />
              </SimuladorNcField>
              <SimuladorNcField label="Observações DG" icone={<TextAlignLeft {...ICONE_FIELD} />}>
                <textarea
                  className="nc-input nc-textarea"
                  rows={1}
                  placeholder="Flash point, poluente marinho..."
                  value={estado.observacoes_dg}
                  onChange={(e) => {
                    aoAtualizar({ observacoes_dg: e.target.value })
                    aoInteragir('numero_onu')
                  }}
                />
              </SimuladorNcField>
            </div>
          </section>
        ) : null}

        <section
          className="nc-cargo-subsecao"
          aria-labelledby="nc-sim-cargo-quantidade"
          {...propsFocoGuiaSecaoCarga('quantidade', aoInteragir, aoDesligarCampo)}
        >
          <SubsecaoTitle
            id="nc-sim-cargo-quantidade"
            icone={<Package {...ICONE_LABEL_SECAO} />}
            obrigatorio
          >
            Quantidade
          </SubsecaoTitle>
          {fcl ? (
            <>
              <div className="nc-linhas-container-header">
                <p className="nc-cargo-subsecao-hint" style={{ margin: 0 }}>
                  Modalidade <strong>{modalidadeLabel}</strong>: adicione um ou mais tipos de container.
                </p>
                <button
                  type="button"
                  className="nc-btn-adicionar-linha"
                  onClick={() => {
                    aoAtualizar({
                      linhas_container_fcl: [...estado.linhas_container_fcl, novaLinhaContainer()],
                    })
                    aoInteragir('quantidade')
                  }}
                >
                  <Plus size={12} weight="bold" />
                  Adicionar container
                </button>
              </div>
              {estado.linhas_container_fcl.map((linha) => (
                <div key={linha.id} className="nc-linha-container-row">
                  <SimuladorNcField label="Tipo container" obrigatorio icone={<Package {...ICONE_FIELD} />}>
                    <SelectGlobal
                      opcoes={CONTAINERS_CATALOGO}
                      valor={linha.tipo_container || null}
                      aoMudarValor={(v) => {
                        aoAtualizar({
                          linhas_container_fcl: estado.linhas_container_fcl.map((l) =>
                            l.id === linha.id ? { ...l, tipo_container: String(v ?? '') } : l,
                          ),
                        })
                        aoInteragir('quantidade')
                      }}
                      placeholder="Selecione o tipo..."
                      buscavel
                      posicao="auto"
                    />
                  </SimuladorNcField>
                  <SimuladorNcField label="Quantidade" obrigatorio icone={<Hash {...ICONE_FIELD} />}>
                    <div className="nc-input-group">
                      <input
                        className="nc-input nc-input--with-suffix"
                        type="number"
                        min={0}
                        step={1}
                        placeholder="Ex: 1"
                        value={linha.quantidade > 0 ? linha.quantidade : ''}
                        onChange={(e) => {
                          const bruto = e.target.value
                          const quantidade = bruto === '' ? 0 : parseInt(bruto, 10)
                          if (bruto !== '' && !Number.isFinite(quantidade)) return
                          aoAtualizar({
                            linhas_container_fcl: estado.linhas_container_fcl.map((l) =>
                              l.id === linha.id ? { ...l, quantidade: quantidade >= 0 ? quantidade : 0 } : l,
                            ),
                          })
                          aoInteragir('quantidade')
                        }}
                      />
                      <span className="nc-input-suffix">ctn</span>
                    </div>
                  </SimuladorNcField>
                  <button
                    type="button"
                    className="nc-btn-remover-linha"
                    title="Remover linha"
                    disabled={estado.linhas_container_fcl.length <= 1}
                    onClick={() => {
                      aoAtualizar({
                        linhas_container_fcl: estado.linhas_container_fcl.filter((l) => l.id !== linha.id),
                      })
                      aoInteragir('quantidade')
                    }}
                    aria-label="Remover container"
                  >
                    <Trash size={14} weight="bold" aria-hidden />
                  </button>
                </div>
              ))}
            </>
          ) : (
            <>
              <p className="nc-cargo-subsecao-hint">
                Modalidade <strong>{modalidadeLabel}</strong>: escolha o tipo de volume (caixa, palete, etc.) e a quantidade
              </p>
              <div className="nc-cargo-subsecao-grid-quantidade nc-cargo-subsecao-grid-quantidade--embalagem">
                <SimuladorNcField label="Tipo de volume" obrigatorio icone={<Package {...ICONE_FIELD} />}>
                  <SelectGlobal
                    opcoes={EMBALAGENS_CATALOGO}
                    valor={estado.tipo_volume}
                    aoMudarValor={(v) => {
                      aoAtualizar({ tipo_volume: v == null ? null : String(v) })
                      aoInteragir('quantidade')
                    }}
                    placeholder="Selecione caixa, palete..."
                    buscavel
                    posicao="auto"
                  />
                </SimuladorNcField>
                <SimuladorNcField label="Quantidade" obrigatorio icone={<Hash {...ICONE_FIELD} />}>
                  <div className="nc-input-group">
                    <input
                      className="nc-input nc-input--with-suffix"
                      type="number"
                      min={0}
                      step={1}
                      placeholder="Ex: 10"
                      value={estado.quantidade_volume > 0 ? estado.quantidade_volume : ''}
                      onChange={(e) => {
                        const bruto = e.target.value
                        const quantidade = bruto === '' ? 0 : parseInt(bruto, 10)
                        if (bruto !== '' && !Number.isFinite(quantidade)) return
                        aoAtualizar({ quantidade_volume: quantidade >= 0 ? quantidade : 0 })
                        aoInteragir('quantidade')
                      }}
                    />
                    <span className="nc-input-suffix">{sufixoQuantidade(estado.tipo_volume)}</span>
                  </div>
                </SimuladorNcField>
              </div>
            </>
          )}
        </section>

        <section
          className="nc-cargo-subsecao"
          aria-labelledby="nc-sim-cargo-peso"
          {...propsFocoGuiaSecaoCarga('peso_cubagem', aoInteragir, aoDesligarCampo)}
        >
          <SubsecaoTitle id="nc-sim-cargo-peso" icone={<Scales {...ICONE_LABEL_SECAO} />}>
            Peso e cubagem
          </SubsecaoTitle>
          <p className="nc-cargo-subsecao-hint">
            Opcional: informe peso e cubagem para ajudar o fornecedor a cotar com precisão
          </p>
          <div className="nc-cargo-subsecao-grid-peso">
            <SimuladorNcField label="Peso (kg)" icone={<Scales {...ICONE_FIELD} />}>
              <div className="nc-input-group">
                <input
                  className="nc-input nc-input--with-suffix"
                  type="number"
                  placeholder="Ex: 12000"
                  value={estado.peso_kg}
                  onChange={(e) => {
                    const val = e.target.value
                    aoAtualizar({
                      peso_kg: val,
                      peso_ton: val ? (parseFloat(val) / 1000).toFixed(3) : '',
                    })
                    aoInteragir('peso_cubagem')
                  }}
                />
                <span className="nc-input-suffix">Kg</span>
              </div>
            </SimuladorNcField>
            <SimuladorNcField label="Peso (ton)" icone={<Scales {...ICONE_FIELD} />}>
              <div className="nc-input-group">
                <input
                  className="nc-input nc-input--with-suffix"
                  type="number"
                  placeholder="Ex: 12.0"
                  value={estado.peso_ton}
                  onChange={(e) => {
                    const val = e.target.value
                    aoAtualizar({
                      peso_ton: val,
                      peso_kg: val ? (parseFloat(val) * 1000).toFixed(0) : '',
                    })
                    aoInteragir('peso_cubagem')
                  }}
                />
                <span className="nc-input-suffix">TON</span>
              </div>
            </SimuladorNcField>
          </div>

          <div className="nc-cargo-cubagem-stack">
            <label className="nc-exibir-campos-checkbox" style={{ marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                className="nc-checkbox-padrao"
                checked={estado.cubagem_detalhada}
                onChange={(e) => {
                  const marcado = e.target.checked
                  if (!marcado) {
                    aoAtualizar({
                      cubagem_detalhada: false,
                      unidade_cubagem: null,
                      comprimento: '',
                      largura: '',
                      altura: '',
                      cubagem_m3: '',
                    })
                    return
                  }
                  atualizarDimensaoComAutoCalc({
                    cubagem_detalhada: true,
                    unidade_cubagem: estado.unidade_cubagem || 'CM',
                  })
                }}
              />
              <span>Incluir cubagem detalhada (medidas)</span>
            </label>

            {estado.cubagem_detalhada ? (
              <div className="nc-cargo-cubagem-detalhe-panel nc-fade-in">
                <p className="nc-helper-desc">
                  Escolha a unidade de medida e informe comprimento, largura e altura.
                </p>
                <div className="nc-cargo-cubagem-dimensoes-grid">
                  <SimuladorNcField label="Medida" icone={<Scales {...ICONE_FIELD} />}>
                    <SelectGlobal
                      opcoes={UNIDADES_CUBAGEM}
                      valor={estado.unidade_cubagem}
                      aoMudarValor={(v) => {
                        atualizarDimensaoComAutoCalc({
                          unidade_cubagem: v == null ? null : String(v),
                        })
                      }}
                      placeholder="Selecione cm, m, in..."
                      buscavel
                      posicao="auto"
                    />
                  </SimuladorNcField>
                  {(['comprimento', 'largura', 'altura'] as const).map((campo) => (
                    <SimuladorNcField
                      key={campo}
                      label={campo.charAt(0).toUpperCase() + campo.slice(1)}
                      icone={<Scales {...ICONE_FIELD} />}
                    >
                      <div className="nc-input-group">
                        <input
                          className="nc-input nc-input--with-suffix"
                          type="number"
                          placeholder="Ex: 120"
                          value={estado[campo]}
                          onChange={(e) => {
                            atualizarDimensaoComAutoCalc({ [campo]: e.target.value })
                          }}
                        />
                        <span className="nc-input-suffix">{estado.unidade_cubagem ?? 'un'}</span>
                      </div>
                    </SimuladorNcField>
                  ))}
                </div>
                <div className="nc-cargo-subsecao-grid-cubagem-m3" style={{ marginTop: '1rem' }}>
                  <SimuladorNcField label="Cubagem (m³)" icone={<Scales {...ICONE_FIELD} />}>
                    <div className="nc-input-group">
                      <input
                        className="nc-input nc-input--with-suffix"
                        type="number"
                        placeholder="Ex: 33.2"
                        value={estado.cubagem_m3}
                        onChange={(e) => {
                          aoAtualizar({ cubagem_m3: e.target.value })
                          aoInteragir('peso_cubagem')
                        }}
                      />
                      <span className="nc-input-suffix">m³</span>
                    </div>
                  </SimuladorNcField>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="nc-cargo-subsecao" aria-labelledby="nc-sim-cargo-incoterm">
          <SubsecaoTitle
            id="nc-sim-cargo-incoterm"
            icone={<Scales {...ICONE_LABEL_SECAO} />}
            obrigatorio
          >
            Incoterm
          </SubsecaoTitle>
          <p className="nc-cargo-subsecao-hint">
            Escolha quem assume frete e risco até o destino
          </p>
          <div className="nc-incoterm-stack">
            <div className="nc-incoterm-grid" role="group" aria-label="Incoterm">
              {INCOTERM_TODOS.map((inc) => (
                <button
                  key={inc}
                  type="button"
                  className={`nc-incoterm-btn${estado.incoterm === inc ? ' nc-incoterm-btn--selected' : ''}`}
                  onClick={() => {
                    aoAtualizar({ incoterm: inc })
                    aoInteragir('incoterm')
                  }}
                >
                  {inc}
                </button>
              ))}
            </div>
            {ajudaIncoterm ? (
              <div className="nc-incoterm-helper-card nc-fade-in">
                <div className="nc-helper-header">
                  <Scales size={20} weight="duotone" className="nc-helper-icon" />
                  <h4>{ajudaIncoterm.titulo}</h4>
                </div>
                <p className="nc-helper-desc">{ajudaIncoterm.desc}</p>
                <div className="nc-helper-footer">
                  <strong>Responsabilidade:</strong> {ajudaIncoterm.responsabilidade}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="nc-cargo-subsecao" aria-labelledby="nc-sim-cargo-valor-alvo">
          <SubsecaoTitle id="nc-sim-cargo-valor-alvo" icone={<Hash {...ICONE_LABEL_SECAO} />}>
            Valor alvo
          </SubsecaoTitle>
          <p className="nc-cargo-subsecao-hint">
            Informe o valor de referência esperado para esta cotação
          </p>
          <div className="nc-fields-grid nc-fields-grid--summary-inputs">
            <SimuladorNcField label="Moeda" icone={<Hash {...ICONE_FIELD} />}>
              <SelectGlobal
                opcoes={MOEDAS_CATALOGO}
                valor={estado.moeda_alvo}
                aoMudarValor={(v) => {
                  aoAtualizar({ moeda_alvo: v == null ? null : String(v) })
                  aoInteragir('valor_alvo')
                }}
                placeholder="Selecionar moeda"
                buscavel
                posicao="auto"
              />
            </SimuladorNcField>
            <SimuladorNcField label="Valor alvo" icone={<Hash {...ICONE_FIELD} />}>
              <input
                className="nc-input"
                type="number"
                placeholder="Ex: 5000"
                value={estado.valor_alvo}
                onChange={(e) => {
                  aoAtualizar({ valor_alvo: e.target.value })
                  aoInteragir('valor_alvo')
                }}
              />
            </SimuladorNcField>
          </div>
        </section>
      </div>
    </div>
  )
}
