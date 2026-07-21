/**
 * ModalNovaCotacaoSimuladorBidFrete — fluxo de Nova Cotação manual do
 * simulador de marketing, espelhando o wizard real do produto
 * (modal-nova-cotacao-bid-frete-internacional): 5 passos —
 * Modal e Operação → Origem e Destino → Carga e Incoterm → Fornecedores → Resumo,
 * com tela de sucesso e criação da cotação na Lista da demonstração.
 */

import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import {
  AirplaneTilt,
  Anchor,
  ArrowsClockwise,
  CalendarBlank,
  CheckCircle,
  Clock,
  DownloadSimple,
  Export,
  Eye,
  FileText,
  GlobeHemisphereWest,
  Hash,
  Info,
  MagnifyingGlass,
  MapPin,
  NotePencil,
  Package,
  Plus,
  Scales,
  ShippingContainer,
  SquaresFour,
  Tag,
  Trash,
  Truck,
  Users,
  Van,
  Warning,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '../../../Botoes/botao-global/src/index'
import { ModalPassoPassoGlobal } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import type { PassoConfig } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import { SelectGlobal } from '../../../Campos/campo-select-global/src/SelectGlobal'
import type { SelectOpcao } from '../../../Campos/campo-select-global/src/tipos'
import { CampoCalendarioGlobal } from '../../../Campos/campo-calendario-global/src/CampoCalendarioGlobal'
import { TooltipGlobal } from '../../../Feedback/tooltip-global/src/tooltip'
import '../../../Modais/modal-passo-passo-global/src/modal-passo-passo.css'
import '../../../Botoes/botao-global/src/botao.css'
import '../../../Campos/campo-select-global/src/select.css'
import '../../../Campos/campo-calendario-global/src/calendario.css'
import {
  type CotacaoSimuladorBidFrete,
  type ModalSimuladorBidFrete,
  type OperacaoSimuladorBidFrete,
  type PortoSimuladorBidFrete,
} from './dados-simulador-bid-frete'
import {
  listarPaisesCatalogoSimulador,
  portoSimuladorDeCatalogo,
  useSelectCatalogoLogisticaSimuladorBidFrete,
} from './catalogo-logistica-simulador-bid-frete'
import { validarNcmSimulador, type NcmCatalogoSimulador } from './catalogo-ncm-simulador-bid-frete'
import { ModalBuscarNcmSimulador } from './modal-buscar-ncm-simulador-bid-frete'
import type { DadosPainelCotacaoSimulador } from './painel-cotacao-simulador-bid-frete'
import './modal-nova-cotacao-simulador-bid-frete.css'

// ─── Domínio do formulário ────────────────────────────────────────────────────

type ModalidadeWizard = '' | 'FCL' | 'LCL' | 'AEREO_GERAL' | 'RODOVIARIO_FTL' | 'RODOVIARIO_LTL'
type VisibilidadeWizard = '' | 'DIRECIONADA' | 'ABERTA'
type MedidaCubagemWizard = 'cm' | 'm' | 'in'

type LinhaContainerWizard = { id: string; tipo: string; quantidade: string }

type FormNovaCotacao = {
  numero: string
  operacao: '' | OperacaoSimuladorBidFrete
  modal: '' | ModalSimuladorBidFrete
  modalidade: ModalidadeWizard
  cargaPerigosa: boolean
  numeroOnu: string
  origemCodigo: string
  destinoCodigo: string
  origemLocaisProximos: boolean
  origemLocaisProximosCodigos: string[]
  destinoLocaisProximos: boolean
  destinoLocaisProximosCodigos: string[]
  origemExibirCampos: boolean
  origemPais: string
  origemEstadoProvincia: string
  origemEndereco: string
  destinoExibirCampos: boolean
  destinoPais: string
  destinoEstadoProvincia: string
  destinoEndereco: string
  descricaoMercadoria: string
  ncm: string
  hsCode: string
  linhasContainer: LinhaContainerWizard[]
  tipoVolume: string
  quantidade: string
  pesoKg: string
  pesoTon: string
  cubagemDetalhada: boolean
  medidaCubagem: MedidaCubagemWizard
  comprimento: string
  largura: string
  altura: string
  cubagemM3: string
  incoterm: string
  moedaMeta: string
  valorMeta: string
  prazoData: Date | null
  prazoHora: string
  fornecedorPodeAlterar: '' | 'sim' | 'nao'
  visibilidade: VisibilidadeWizard
  anonima: boolean
  fornecedoresSelecionados: string[]
}

const ROTULO_MODALIDADE: Record<Exclude<ModalidadeWizard, ''>, string> = {
  FCL: 'FCL — Container Completo',
  LCL: 'LCL — Carga Fracionada',
  AEREO_GERAL: 'Aéreo Geral',
  RODOVIARIO_FTL: 'FTL — Carga completa',
  RODOVIARIO_LTL: 'LTL — Carga fracionada',
}

const DESC_MODALIDADE: Record<Exclude<ModalidadeWizard, ''>, string> = {
  FCL: 'Container exclusivo para sua carga',
  LCL: 'Compartilha espaço com outras cargas',
  AEREO_GERAL: 'Cotação padrão de frete aéreo',
  RODOVIARIO_FTL: 'Caminhão exclusivo para sua carga',
  RODOVIARIO_LTL: 'Compartilha espaço com outras cargas',
}

const MODALIDADE_COTACAO: Record<Exclude<ModalidadeWizard, ''>, CotacaoSimuladorBidFrete['modalidade']> = {
  FCL: 'FCL',
  LCL: 'LCL',
  AEREO_GERAL: 'Aéreo Geral',
  RODOVIARIO_FTL: 'FTL',
  RODOVIARIO_LTL: 'LTL',
}

// Incoterms — paridade total com o produto real (INCOTERM_GRUPOS_CODIGOS +
// INCOTERM_EXPLANATIONS_PT de traduzir-nova-cotacao-bid-frete-internacional.ts)
const INCOTERMS_WIZARD: { codigo: string; grupo: string; titulo: string; desc: string; responsabilidade: string }[] = [
  {
    codigo: 'EXW',
    grupo: 'Grupo E — Saída do vendedor',
    titulo: 'EXW — Ex Works (Na Origem)',
    desc: 'O comprador assume todos os custos e riscos a partir do estabelecimento do vendedor (coleta, porto de origem, frete internacional e taxas).',
    responsabilidade: 'Comprador assume 100% da cadeia logística.',
  },
  {
    codigo: 'FCA',
    grupo: 'Grupo E — Saída do vendedor',
    titulo: 'FCA — Free Carrier (Franco Transportador)',
    desc: 'O vendedor realiza o desembaraço de exportação e entrega a carga no local/transportador indicado na origem pelo comprador.',
    responsabilidade: 'Vendedor desembaraça na origem; comprador assume a partir da entrega ao transportador.',
  },
  {
    codigo: 'FAS',
    grupo: 'Grupo F — Principal não pago (marítimo)',
    titulo: 'FAS — Free Alongside Ship (Livre ao Lado do Navio)',
    desc: 'O vendedor coloca a mercadoria ao lado do navio do comprador no porto de embarque indicado. Risco passa na linha de cais.',
    responsabilidade: 'Exclusivo para modal marítimo/fluvial. Comprador contrata frete internacional.',
  },
  {
    codigo: 'FOB',
    grupo: 'Grupo F — Principal não pago (marítimo)',
    titulo: 'FOB — Free On Board (Livre a Bordo)',
    desc: 'O vendedor entrega a carga a bordo do navio indicado pelo comprador no porto de embarque designado. O risco passa quando a carga está a bordo.',
    responsabilidade: 'Exclusivo para modal marítimo. Custos de embarque de origem com o vendedor; frete com o comprador.',
  },
  {
    codigo: 'CFR',
    grupo: 'Grupo C — Principal pago',
    titulo: 'CFR — Cost and Freight (Custo e Frete)',
    desc: 'O vendedor paga os custos e frete marítimo até o porto de destino. Os riscos de perda são transferidos ao comprador no embarque.',
    responsabilidade: 'Exclusivo para marítimo. Frete pago pelo vendedor; seguro internacional é opcional do comprador.',
  },
  {
    codigo: 'CIF',
    grupo: 'Grupo C — Principal pago',
    titulo: 'CIF — Cost, Insurance and Freight (Custo, Seguro e Frete)',
    desc: 'O vendedor paga custos, frete internacional e contrata seguro marítimo até o porto de destino designado. Riscos transferem no embarque.',
    responsabilidade: 'Exclusivo para marítimo. Frete e seguro básico com o vendedor; riscos com o comprador.',
  },
  {
    codigo: 'CPT',
    grupo: 'Grupo C — Principal pago',
    titulo: 'CPT — Carriage Paid To (Transporte Pago Até)',
    desc: 'O vendedor contrata e paga o frete principal até o ponto acordado. Porém, os riscos passam ao comprador na entrega ao primeiro transportador.',
    responsabilidade: 'Custos com o vendedor; riscos de perda ou dano com o comprador durante o transporte.',
  },
  {
    codigo: 'CIP',
    grupo: 'Grupo C — Principal pago',
    titulo: 'CIP — Carriage and Insurance Paid To (Transporte e Seguro Pagos Até)',
    desc: 'Idêntico ao CPT, mas o vendedor é responsável por contratar e pagar um seguro de transporte contra perda ou dano da carga.',
    responsabilidade: 'Custos e seguro com o vendedor; riscos com o comprador a partir da origem.',
  },
  {
    codigo: 'DAP',
    grupo: 'Grupo D — Entrega no destino',
    titulo: 'DAP — Delivered At Place (Entregue no Local)',
    desc: 'O vendedor assume riscos e fretes até a chegada no local de destino acordado (antes da descarga). O comprador faz a importação e descarga.',
    responsabilidade: 'Vendedor assume frete internacional até o destino; comprador faz desembaraço de importação.',
  },
  {
    codigo: 'DPU',
    grupo: 'Grupo D — Entrega no destino',
    titulo: 'DPU — Delivered at Place Unloaded (Entregue no Local Descarregado)',
    desc: 'O vendedor entrega a mercadoria descarregada do meio de transporte no local indicado. Substitui o antigo DAT.',
    responsabilidade: 'Vendedor assume o transporte e a descarga no destino; comprador faz o desembaraço.',
  },
  {
    codigo: 'DDP',
    grupo: 'Grupo D — Entrega no destino',
    titulo: 'DDP — Delivered Duty Paid (Entregue com Direitos Pagos)',
    desc: 'O vendedor assume todos os custos e riscos da operação até a entrega no destino do comprador, incluindo tarifas alfandegárias de importação.',
    responsabilidade: 'Vendedor assume 100% da logística e impostos de importação.',
  },
]

const TIPOS_CONTAINER: SelectOpcao[] = [
  { valor: "20' Dry", rotulo: "20' Dry" },
  { valor: "40' Dry", rotulo: "40' Dry" },
  { valor: "40' High Cube", rotulo: "40' High Cube" },
  { valor: "40' Reefer", rotulo: "40' Reefer" },
  { valor: "20' Open Top", rotulo: "20' Open Top" },
]

const TIPOS_VOLUME: SelectOpcao[] = [
  { valor: 'Caixa', rotulo: 'Caixa' },
  { valor: 'Palete', rotulo: 'Palete' },
  { valor: 'Engradado', rotulo: 'Engradado' },
  { valor: 'Tambor', rotulo: 'Tambor' },
  { valor: 'Big Bag', rotulo: 'Big Bag' },
]

const MEDIDAS_CUBAGEM: SelectOpcao[] = [
  { valor: 'cm', rotulo: 'CM — Centímetros' },
  { valor: 'm', rotulo: 'M — Metros' },
  { valor: 'in', rotulo: 'IN — Polegadas' },
]

const FATOR_MEDIDA_PARA_METRO: Record<MedidaCubagemWizard, number> = {
  cm: 0.01,
  m: 1,
  in: 0.0254,
}

const MOEDAS_META: SelectOpcao[] = [
  { valor: 'USD', rotulo: 'USD — Dólar americano' },
  { valor: 'EUR', rotulo: 'EUR — Euro' },
  { valor: 'BRL', rotulo: 'BRL — Real brasileiro' },
]

const OPCOES_SIM_NAO: SelectOpcao[] = [
  { valor: 'sim', rotulo: 'Sim' },
  { valor: 'nao', rotulo: 'Não' },
]

/** Fornecedores mock da demonstração (paridade com fornecedores citados nas cotações). */
const FORNECEDORES_DEMO: { id: string; nome: string; modais: ModalSimuladorBidFrete[] }[] = [
  { id: 'maersk', nome: 'Maersk Line', modais: ['MARITIMO'] },
  { id: 'msc', nome: 'MSC Mediterranean', modais: ['MARITIMO'] },
  { id: 'cma-cgm', nome: 'CMA CGM', modais: ['MARITIMO'] },
  { id: 'hapag', nome: 'Hapag-Lloyd', modais: ['MARITIMO'] },
  { id: 'kuehne', nome: 'Kuehne+Nagel', modais: ['MARITIMO', 'AEREO', 'RODOVIARIO'] },
  { id: 'dhl', nome: 'DHL Global Forwarding', modais: ['AEREO', 'RODOVIARIO'] },
  { id: 'schenker', nome: 'DB Schenker', modais: ['MARITIMO', 'AEREO', 'RODOVIARIO'] },
  { id: 'expeditors', nome: 'Expeditors', modais: ['AEREO', 'MARITIMO'] },
]

const PASSOS_WIZARD: PassoConfig[] = [
  { id: 1, label: 'Modal e Operação', icone: <Truck weight="duotone" size={16} /> },
  { id: 2, label: 'Origem e Destino', icone: <MapPin weight="duotone" size={16} /> },
  { id: 3, label: 'Carga e Incoterm', icone: <Package weight="duotone" size={16} /> },
  { id: 4, label: 'Fornecedores', icone: <Users weight="duotone" size={16} /> },
  { id: 5, label: 'Resumo', icone: <FileText weight="duotone" size={16} /> },
]

const ICONE_LABEL_SECAO = { size: 13, weight: 'fill' as const }

function gerarNumeroCotacao(): string {
  const agora = new Date()
  const ymd = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}`
  const sufixo = String(Math.floor(1000 + Math.random() * 9000))
  return `COT-${ymd}-${sufixo}`
}

let proximoIdLinhaContainer = 1
function novaLinhaContainer(): LinhaContainerWizard {
  return { id: `lc-${proximoIdLinhaContainer++}`, tipo: '', quantidade: '1' }
}

/** Display "XXXX.XX.XX" — mesmo padrão do SelectNcmGlobal do produto real. */
function formatarNcmDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`
}

/** Remove tags HTML da descrição do NCM (paridade com limparHtmlNcm do produto). */
function limparHtmlNcm(texto: string): string {
  return texto.replace(/<[^>]*>/g, '')
}

function formEmBranco(): FormNovaCotacao {
  const prazo = new Date()
  prazo.setDate(prazo.getDate() + 7)
  return {
    numero: gerarNumeroCotacao(),
    operacao: '',
    modal: '',
    modalidade: '',
    cargaPerigosa: false,
    numeroOnu: '',
    origemCodigo: '',
    destinoCodigo: '',
    origemLocaisProximos: false,
    origemLocaisProximosCodigos: [],
    destinoLocaisProximos: false,
    destinoLocaisProximosCodigos: [],
    origemExibirCampos: false,
    origemPais: '',
    origemEstadoProvincia: '',
    origemEndereco: '',
    destinoExibirCampos: false,
    destinoPais: '',
    destinoEstadoProvincia: '',
    destinoEndereco: '',
    descricaoMercadoria: '',
    ncm: '',
    hsCode: '',
    linhasContainer: [novaLinhaContainer()],
    tipoVolume: '',
    quantidade: '',
    pesoKg: '',
    pesoTon: '',
    cubagemDetalhada: false,
    medidaCubagem: 'cm',
    comprimento: '',
    largura: '',
    altura: '',
    cubagemM3: '',
    incoterm: '',
    moedaMeta: 'USD',
    valorMeta: '',
    prazoData: prazo,
    prazoHora: '23:59',
    fornecedorPodeAlterar: 'sim',
    visibilidade: 'DIRECIONADA',
    anonima: false,
    fornecedoresSelecionados: [],
  }
}

/** Pré-seleção padrão do passo Fornecedores: os 5 primeiros elegíveis ao modal. */
function fornecedoresPadraoParaModal(modal: ModalSimuladorBidFrete): string[] {
  return FORNECEDORES_DEMO
    .filter((f) => f.modais.includes(modal))
    .slice(0, 5)
    .map((f) => f.id)
}

// ─── Blocos de UI (paridade com o wizard real) ───────────────────────────────

function OptionButton({
  selected,
  onClick,
  icon,
  label,
  description,
}: {
  selected: boolean
  onClick: () => void
  icon: ReactNode
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      className={`nc-option-btn ${selected ? 'nc-option-btn--selected' : ''}`}
      onClick={onClick}
    >
      <div className="nc-option-checkbox">
        {selected && <span className="nc-option-checkmark">✓</span>}
      </div>
      <span className="nc-option-icon">{icon}</span>
      <div className="nc-option-text">
        <span className="nc-option-label">{label}</span>
        {description && <span className="nc-option-desc">{description}</span>}
      </div>
    </button>
  )
}

function NcSectionTitle({
  icone,
  children,
  obrigatorio,
}: {
  icone: ReactNode
  children: ReactNode
  obrigatorio?: boolean
}) {
  return (
    <h3 className="nc-section-title">
      {icone}
      <span>{children}</span>
      {obrigatorio && <span className="nc-obrig">*</span>}
    </h3>
  )
}

function NcSubsecaoTitle({
  icone,
  children,
  obrigatorio,
}: {
  icone: ReactNode
  children: ReactNode
  obrigatorio?: boolean
}) {
  return (
    <h4 className="nc-cargo-subsecao-title">
      {icone}
      <span>{children}</span>
      {obrigatorio && <span className="nc-obrig">*</span>}
    </h4>
  )
}

function Field({
  label,
  required,
  icone,
  children,
  className,
}: {
  label: string
  required?: boolean
  icone?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={['nc-field', className].filter(Boolean).join(' ')}>
      <span className="nc-field-label">
        {icone}
        <span>{label}</span>
        {required && <span className="nc-obrig">*</span>}
      </span>
      {children}
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export type ModalNovaCotacaoSimuladorBidFreteProps = {
  aberto: boolean
  empresaIdPadrao: string
  onFechar: () => void
  onCriarCotacao: (cotacao: CotacaoSimuladorBidFrete) => void
  onVerCotacao: (numeroCotacao: string) => void
  onAbrirPainelCotacao: (dados: DadosPainelCotacaoSimulador) => void
  /** Registra os dados do painel da cotação criada (link de acesso na Lista). */
  onRegistrarPainelCotacao?: (dados: DadosPainelCotacaoSimulador) => void
}

export function ModalNovaCotacaoSimuladorBidFrete({
  aberto,
  empresaIdPadrao,
  onFechar,
  onCriarCotacao,
  onVerCotacao,
  onAbrirPainelCotacao,
  onRegistrarPainelCotacao,
}: ModalNovaCotacaoSimuladorBidFreteProps) {
  const [passo, setPasso] = useState(1)
  const [form, setForm] = useState<FormNovaCotacao>(formEmBranco)
  const [sucesso, setSucesso] = useState(false)
  const [numeroCriado, setNumeroCriado] = useState('')
  const [fornecedoresNotificados, setFornecedoresNotificados] = useState(0)
  const [dadosPainelCriado, setDadosPainelCriado] = useState<DadosPainelCotacaoSimulador | null>(null)

  const set = <K extends keyof FormNovaCotacao>(campo: K, valor: FormNovaCotacao[K]) =>
    setForm((prev) => ({ ...prev, [campo]: valor }))

  const exigeAeroporto = form.modal === 'AEREO'
  // Fonte dos locais = catálogo de produção (Cadastros/UN-LOCODE) — mesmo dado
  // e mesma lógica de busca do produto real (busca "china" resolve país → CN).
  const tipoCatalogo = exigeAeroporto ? ('aeroporto' as const) : ('porto' as const)
  const catalogoOrigem = useSelectCatalogoLogisticaSimuladorBidFrete({
    tipo: tipoCatalogo,
    ativo: aberto && passo >= 2,
    codigoSelecionado: form.origemCodigo || null,
  })
  const catalogoDestino = useSelectCatalogoLogisticaSimuladorBidFrete({
    tipo: tipoCatalogo,
    ativo: aberto && passo >= 2,
    codigoSelecionado: form.destinoCodigo || null,
  })

  const portoPorCodigo = (codigo: string): PortoSimuladorBidFrete | undefined =>
    portoSimuladorDeCatalogo(codigo) ?? undefined

  const fornecedoresElegiveis = useMemo(
    () => FORNECEDORES_DEMO.filter((f) => !form.modal || f.modais.includes(form.modal)),
    [form.modal],
  )

  const incotermSelecionado = INCOTERMS_WIZARD.find((i) => i.codigo === form.incoterm) ?? null

  const podeAvancar = (() => {
    if (passo === 1) {
      if (!form.operacao || !form.modal) return false
      if (form.modal !== 'AEREO' && !form.modalidade) return false
      return true
    }
    if (passo === 2) {
      if (!form.origemCodigo || !form.destinoCodigo || form.origemCodigo === form.destinoCodigo) return false
      // Paridade com o real: se autorizou locais próximos, exige ao menos 1 selecionado
      if (form.origemLocaisProximos && form.origemLocaisProximosCodigos.length === 0) return false
      if (form.destinoLocaisProximos && form.destinoLocaisProximosCodigos.length === 0) return false
      return true
    }
    if (passo === 3) {
      if (!form.descricaoMercadoria.trim() || !form.incoterm) return false
      if (form.modalidade === 'FCL') {
        return form.linhasContainer.every((l) => !!l.tipo && Number(l.quantidade) >= 1)
      }
      return true
    }
    if (passo === 4) {
      if (!form.prazoData || !form.visibilidade) return false
      if (form.visibilidade === 'DIRECIONADA' && form.fornecedoresSelecionados.length === 0) return false
      return true
    }
    return true
  })()

  function fecharTudo() {
    onFechar()
    setPasso(1)
    setForm(formEmBranco())
    setSucesso(false)
    setDadosPainelCriado(null)
  }

  /** Pós-criação: fechar sempre leva à Lista com a cotação nova em foco. */
  function fecharParaLista() {
    const numero = numeroCriado
    fecharTudo()
    onVerCotacao(numero)
  }

  function criarCotacao() {
    const origem = portoPorCodigo(form.origemCodigo)
    const destino = portoPorCodigo(form.destinoCodigo)
    if (!origem || !destino) return

    const modalidadeFinal: CotacaoSimuladorBidFrete['modalidade'] = form.modal === 'AEREO'
      ? 'Aéreo Geral'
      : form.modalidade
        ? MODALIDADE_COTACAO[form.modalidade]
        : 'FCL'

    const equipamento = (() => {
      if (form.modalidade === 'FCL') {
        const linhas = form.linhasContainer.filter((l) => l.tipo)
        if (linhas.length > 0) {
          return linhas.map((l) => `${l.tipo} ×${l.quantidade || 1}`).join(' · ')
        }
      }
      const partes = [
        form.quantidade ? `${form.quantidade}× ${form.tipoVolume || 'vol'}` : '',
        form.pesoKg ? `${Number(form.pesoKg).toLocaleString('pt-BR')} kg` : '',
        form.cubagemM3 ? `${form.cubagemM3} m³` : '',
      ].filter(Boolean)
      return partes.length > 0 ? partes.join(' · ') : modalidadeFinal
    })()

    const prazo = form.prazoData ?? new Date()
    const isoPrazo = `${prazo.getFullYear()}-${String(prazo.getMonth() + 1).padStart(2, '0')}-${String(prazo.getDate()).padStart(2, '0')}`
    const hoje = new Date()
    const isoHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

    const fornecedoresConvidados = form.visibilidade === 'DIRECIONADA'
      ? fornecedoresElegiveis.filter((f) => form.fornecedoresSelecionados.includes(f.id))
      : fornecedoresElegiveis
    const convidados = fornecedoresConvidados.length

    const cotacao: CotacaoSimuladorBidFrete = {
      id: `nova-${Date.now()}`,
      numero: form.numero.trim() || gerarNumeroCotacao(),
      empresaId: empresaIdPadrao,
      operacao: form.operacao as OperacaoSimuladorBidFrete,
      modal: form.modal as ModalSimuladorBidFrete,
      modalidade: modalidadeFinal,
      origem,
      destino,
      incoterm: form.incoterm,
      equipamento,
      valorMetaUsd: form.valorMeta ? Number(form.valorMeta) : 0,
      melhorLanceUsd: null,
      fornecedorLider: null,
      propostasRecebidas: 0,
      fornecedoresConvidados: convidados,
      status: 'ENVIADA_FORNECEDORES',
      dataCriacao: isoHoje,
      dataLimiteResposta: isoPrazo,
      transitTimeDias: null,
    }

    const linhasFclValidas = form.modalidade === 'FCL'
      ? form.linhasContainer.filter((l) => l.tipo)
      : []
    const quantidadeVolumes = form.modalidade === 'FCL'
      ? String(linhasFclValidas.reduce((soma, l) => soma + (Number(l.quantidade) || 1), 0) || 1)
      : form.quantidade
    const tipoContainer = linhasFclValidas.length > 0
      ? linhasFclValidas.map((l) => `${l.quantidade || 1}x ${l.tipo}`).join(' · ')
      : ''

    onCriarCotacao(cotacao)
    setNumeroCriado(cotacao.numero)
    setFornecedoresNotificados(convidados)
    const dadosPainel: DadosPainelCotacaoSimulador = {
      cotacao,
      criadaEmIso: new Date().toISOString(),
      descricaoMercadoria: form.descricaoMercadoria,
      ncm: form.ncm ? formatarNcmDisplay(form.ncm) : '',
      hsCode: form.hsCode,
      cargaPerigosa: form.cargaPerigosa,
      numeroOnu: form.numeroOnu,
      visibilidade: form.visibilidade === 'DIRECIONADA' ? 'DIRECIONADA' : 'ABERTA',
      anonima: form.anonima,
      moedaMeta: form.moedaMeta,
      pesoKg: form.pesoKg,
      cubagemM3: form.cubagemM3,
      quantidadeVolumes,
      tipoContainer,
      prazoHora: form.prazoHora,
      fornecedoresConvidados: fornecedoresConvidados.map((f) => ({ id: f.id, nome: f.nome })),
    }
    setDadosPainelCriado(dadosPainel)
    onRegistrarPainelCotacao?.(dadosPainel)
    setSucesso(true)
  }

  function handleProximo() {
    if (passo < PASSOS_WIZARD.length) setPasso((p) => p + 1)
    else criarCotacao()
  }

  function handleVoltar() {
    if (passo > 1) setPasso((p) => p - 1)
    else fecharTudo()
  }

  if (!aberto) return null

  if (sucesso) {
    return (
      <ModalPassoPassoGlobal
        titulo="Cotação criada com sucesso!"
        aberto
        classNameDialog="nc-sim-dialog"
        passos={PASSOS_WIZARD}
        passoAtual={PASSOS_WIZARD.length}
        onProximo={fecharParaLista}
        onVoltar={fecharParaLista}
        onFechar={fecharParaLista}
        fecharAoClicarFora={false}
        ocultarStepper
        footerCustom={(
          <div className="nc-sim-footer-resultado">
            <BotaoGlobal variante="fantasma" tamanho="padrao" onClick={fecharParaLista}>
              Ver cotações
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="padrao"
              onClick={() => {
                const dados = dadosPainelCriado
                fecharTudo()
                if (dados) onAbrirPainelCotacao(dados)
              }}
            >
              Ir para o Painel da Cotação
            </BotaoGlobal>
          </div>
        )}
        tamanho="md"
      >
        <div className="nc-root nc-sim-resultado">
          <div className="nc-sim-resultado-banner">
            <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />
            <p>
              <strong>{numeroCriado}</strong>
              {' '}
              criada. Agora você pode disparar para os fornecedores.
            </p>
          </div>
          <div className="nc-sim-resultado-banner">
            <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />
            <p>
              <strong>Disparo confirmado</strong>
              {' — '}
              {fornecedoresNotificados}
              {' '}
              fornecedor(es) notificado(s) por e-mail.
            </p>
          </div>
        </div>
      </ModalPassoPassoGlobal>
    )
  }

  return (
    <ModalPassoPassoGlobal
      titulo="Nova Cotação de Frete Internacional"
      icone={<Truck weight="duotone" size={22} />}
      subtitulo="Preencha os dados para solicitar cotações de frete"
      aberto
      classNameDialog="nc-sim-dialog"
      passos={PASSOS_WIZARD}
      passoAtual={passo}
      onProximo={handleProximo}
      onVoltar={handleVoltar}
      onFechar={fecharTudo}
      fecharAoClicarFora={false}
      onIrParaPasso={(id) => setPasso(id)}
      podeAvancar={podeAvancar}
      labelBotaoFinal="Criar Cotação"
      labelProximo="Próximo"
      tamanho="xl"
      altura="90vh"
    >
      <div className="nc-root nc-step-wrapper nc-fade-in" key={passo}>
        {passo === 1 && <PassoModalOperacao form={form} set={set} setForm={setForm} />}
        {passo === 2 && (
          <PassoOrigemDestino
            form={form}
            set={set}
            setForm={setForm}
            catalogoOrigem={catalogoOrigem}
            catalogoDestino={catalogoDestino}
          />
        )}
        {passo === 3 && (
          <PassoCargaIncoterm form={form} set={set} setForm={setForm} incotermSelecionado={incotermSelecionado} />
        )}
        {passo === 4 && (
          <PassoFornecedores form={form} set={set} fornecedoresElegiveis={fornecedoresElegiveis} />
        )}
        {passo === 5 && (
          <PassoResumo
            form={form}
            origem={portoPorCodigo(form.origemCodigo) ?? null}
            destino={portoPorCodigo(form.destinoCodigo) ?? null}
            incotermSelecionado={incotermSelecionado}
          />
        )}
      </div>
    </ModalPassoPassoGlobal>
  )
}

// ─── Passo 1 — Modal e Operação ──────────────────────────────────────────────

function PassoModalOperacao({
  form,
  set,
  setForm,
}: {
  form: FormNovaCotacao
  set: <K extends keyof FormNovaCotacao>(campo: K, valor: FormNovaCotacao[K]) => void
  setForm: Dispatch<SetStateAction<FormNovaCotacao>>
}) {
  const selecionarModal = (modal: ModalSimuladorBidFrete) => {
    setForm((prev) => ({
      ...prev,
      modal,
      modalidade: modal === 'AEREO' ? 'AEREO_GERAL' : '',
      origemCodigo: '',
      destinoCodigo: '',
      origemLocaisProximos: false,
      origemLocaisProximosCodigos: [],
      destinoLocaisProximos: false,
      destinoLocaisProximosCodigos: [],
      origemExibirCampos: false,
      origemPais: '',
      origemEstadoProvincia: '',
      origemEndereco: '',
      destinoExibirCampos: false,
      destinoPais: '',
      destinoEstadoProvincia: '',
      destinoEndereco: '',
      linhasContainer: [novaLinhaContainer()],
      tipoVolume: '',
      quantidade: '',
      fornecedoresSelecionados: fornecedoresPadraoParaModal(modal),
    }))
  }

  return (
    <div className="nc-step-content">
      <Field label="Nº da cotação" icone={<Hash {...ICONE_LABEL_SECAO} />}>
        <input
          type="text"
          className="nc-input"
          value={form.numero}
          onChange={(e) => set('numero', e.target.value)}
          placeholder="COT-YYYYMMDD-NNNN"
          autoComplete="off"
          spellCheck={false}
        />
        <span className="nc-field-hint">
          Gerado automaticamente; você pode personalizar antes de criar.
        </span>
      </Field>

      <NcSectionTitle icone={<GlobeHemisphereWest {...ICONE_LABEL_SECAO} />} obrigatorio>
        Tipo de Operação
      </NcSectionTitle>
      <div className="nc-options-grid-2">
        <OptionButton
          selected={form.operacao === 'IMPORTACAO'}
          onClick={() => set('operacao', 'IMPORTACAO')}
          icon={<DownloadSimple weight="duotone" size={24} />}
          label="Importação"
          description="Trazer cargas de outros países para o território nacional."
        />
        <OptionButton
          selected={form.operacao === 'EXPORTACAO'}
          onClick={() => set('operacao', 'EXPORTACAO')}
          icon={<Export weight="duotone" size={24} />}
          label="Exportação"
          description="Enviar produtos nacionais para compradores internacionais."
        />
      </div>

      <NcSectionTitle icone={<ShippingContainer {...ICONE_LABEL_SECAO} />} obrigatorio>
        Modal de Frete
      </NcSectionTitle>
      <div className="nc-options-grid-3">
        <OptionButton
          selected={form.modal === 'MARITIMO'}
          onClick={() => selecionarModal('MARITIMO')}
          icon={<Anchor weight="duotone" size={24} />}
          label="Marítimo"
          description="Alto volume, menor custo"
        />
        <OptionButton
          selected={form.modal === 'AEREO'}
          onClick={() => selecionarModal('AEREO')}
          icon={<AirplaneTilt weight="duotone" size={24} />}
          label="Aéreo"
          description="Entrega rápida e expressa"
        />
        <OptionButton
          selected={form.modal === 'RODOVIARIO'}
          onClick={() => selecionarModal('RODOVIARIO')}
          icon={<Truck weight="duotone" size={24} />}
          label="Rodoviário"
          description="Flexível e porta a porta"
        />
      </div>

      {form.modal !== 'AEREO' && (
        <>
          <NcSectionTitle icone={<SquaresFour {...ICONE_LABEL_SECAO} />} obrigatorio>
            Modalidade
          </NcSectionTitle>
          <div className="nc-options-grid-2">
            {!form.modal && (
              <div className="nc-empty-hint">
                <Info size={18} weight="duotone" />
                <p>Selecione o modal primeiro</p>
              </div>
            )}
            {form.modal === 'MARITIMO' && (
              <>
                <OptionButton
                  selected={form.modalidade === 'FCL'}
                  onClick={() => set('modalidade', 'FCL')}
                  icon={<Package weight="duotone" size={22} />}
                  label={ROTULO_MODALIDADE.FCL}
                  description={DESC_MODALIDADE.FCL}
                />
                <OptionButton
                  selected={form.modalidade === 'LCL'}
                  onClick={() => set('modalidade', 'LCL')}
                  icon={<Package weight="duotone" size={22} />}
                  label={ROTULO_MODALIDADE.LCL}
                  description={DESC_MODALIDADE.LCL}
                />
              </>
            )}
            {form.modal === 'RODOVIARIO' && (
              <>
                <OptionButton
                  selected={form.modalidade === 'RODOVIARIO_FTL'}
                  onClick={() => set('modalidade', 'RODOVIARIO_FTL')}
                  icon={<Van weight="duotone" size={22} />}
                  label={ROTULO_MODALIDADE.RODOVIARIO_FTL}
                  description={DESC_MODALIDADE.RODOVIARIO_FTL}
                />
                <OptionButton
                  selected={form.modalidade === 'RODOVIARIO_LTL'}
                  onClick={() => set('modalidade', 'RODOVIARIO_LTL')}
                  icon={<Van weight="duotone" size={22} />}
                  label={ROTULO_MODALIDADE.RODOVIARIO_LTL}
                  description={DESC_MODALIDADE.RODOVIARIO_LTL}
                />
              </>
            )}
          </div>
        </>
      )}

      <NcSectionTitle icone={<Warning {...ICONE_LABEL_SECAO} />}>
        Carga perigosa
      </NcSectionTitle>
      <div className="nc-options-grid-full">
        <OptionButton
          selected={form.cargaPerigosa}
          onClick={() => set('cargaPerigosa', !form.cargaPerigosa)}
          icon={<Warning weight="duotone" size={22} />}
          label="Carga Perigosa"
          description="Mercadoria classificada ONU (IMDG / ADR / IATA DGR). Informe o número ONU no passo Carga."
        />
      </div>
    </div>
  )
}

// ─── Passo 2 — Origem e Destino ──────────────────────────────────────────────

type CatalogoLogisticaSelectProps = ReturnType<typeof useSelectCatalogoLogisticaSimuladorBidFrete>

const UFS_BRASIL_SIM = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const OPCOES_ESTADOS_BR_SIM: SelectOpcao[] = UFS_BRASIL_SIM.map((uf) => ({ valor: uf, rotulo: uf }))

type LadoLocalizacaoSimulador = 'origem' | 'destino'
type TipoLocalSimulador = 'porto' | 'aeroporto' | 'local'

const TITULO_LOCALIZACAO_SIM: Record<TipoLocalSimulador, Record<LadoLocalizacaoSimulador, string>> = {
  porto: { origem: 'Porto / Aeroporto de Origem', destino: 'Porto / Aeroporto de Destino' },
  aeroporto: { origem: 'Aeroporto de Origem', destino: 'Aeroporto de Destino' },
  local: { origem: 'Local de Origem', destino: 'Local de Destino' },
}

const LEGENDA_LOCALIZACAO_SIM: Record<TipoLocalSimulador, Record<LadoLocalizacaoSimulador, string>> = {
  porto: {
    origem: 'Informe o porto de embarque. Marque a opção abaixo se precisar complementar endereço ou país.',
    destino: 'Informe o porto de destino. Marque a opção abaixo se precisar complementar endereço ou país.',
  },
  aeroporto: {
    origem: 'Informe o aeroporto de partida. Marque a opção abaixo se precisar complementar endereço ou país.',
    destino: 'Informe o aeroporto de chegada. Marque a opção abaixo se precisar complementar endereço ou país.',
  },
  local: {
    origem: 'De onde a carga sai — ponto de embarque no exterior ou no Brasil.',
    destino: 'Para onde a carga vai — ponto de desembarque e entrega.',
  },
}

const ROTULO_CAMPO_LOCALIZACAO_SIM: Record<TipoLocalSimulador, Record<LadoLocalizacaoSimulador, string>> = {
  porto: { origem: 'PORTO DE EMBARQUE', destino: 'PORTO DE DESTINO' },
  aeroporto: { origem: 'AEROPORTO DE EMBARQUE', destino: 'AEROPORTO DE DESTINO' },
  local: { origem: 'Local de origem', destino: 'Local de destino' },
}

function fraseLocaisProximosSim(lado: LadoLocalizacaoSimulador, tipo: TipoLocalSimulador): string {
  const plural = tipo === 'aeroporto' ? 'aeroportos' : 'portos'
  return lado === 'origem'
    ? `Autorizar cotações em outros ${plural} próximos à origem preferencial`
    : `Autorizar cotações em outros ${plural} próximos ao destino preferencial`
}

function fraseExibirCamposSim(lado: LadoLocalizacaoSimulador): string {
  return lado === 'origem'
    ? 'Exibir campos: Cidade de Origem, Estado ou Província de Origem e País de Origem'
    : 'Exibir campos: Cidade de Destino, Estado ou Província de Destino e País de Destino'
}

function PassoOrigemDestino({
  form,
  set,
  setForm,
  catalogoOrigem,
  catalogoDestino,
}: {
  form: FormNovaCotacao
  set: <K extends keyof FormNovaCotacao>(campo: K, valor: FormNovaCotacao[K]) => void
  setForm: Dispatch<SetStateAction<FormNovaCotacao>>
  catalogoOrigem: CatalogoLogisticaSelectProps
  catalogoDestino: CatalogoLogisticaSelectProps
}) {
  const tipoLocal: TipoLocalSimulador =
    form.modal === 'AEREO' ? 'aeroporto' : form.modal === 'RODOVIARIO' ? 'local' : 'porto'

  // Países do snapshot de produção — usados nos campos extras (paridade usePaisesCadastros)
  const [opcoesPaises, setOpcoesPaises] = useState<SelectOpcao[]>([])
  const [carregandoPaises, setCarregandoPaises] = useState(true)
  useEffect(() => {
    let ativo = true
    void listarPaisesCatalogoSimulador().then((paises) => {
      if (!ativo) return
      setOpcoesPaises(
        paises
          .filter((p) => p.codigo_pais_iso_alpha2)
          .map((p) => ({
            valor: p.codigo_pais_iso_alpha2,
            rotulo: `${p.nome_pais_portugues} (${p.codigo_pais_iso_alpha2})`,
          })),
      )
      setCarregandoPaises(false)
    })
    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className="nc-step-content nc-origem-destino-stack">
      <SecaoLocalizacaoSimulador
        lado="origem"
        tipoLocal={tipoLocal}
        form={form}
        set={set}
        setForm={setForm}
        catalogo={catalogoOrigem}
        codigoOutroLado={form.destinoCodigo}
        opcoesPaises={opcoesPaises}
        carregandoPaises={carregandoPaises}
      />
      <SecaoLocalizacaoSimulador
        lado="destino"
        tipoLocal={tipoLocal}
        form={form}
        set={set}
        setForm={setForm}
        catalogo={catalogoDestino}
        codigoOutroLado={form.origemCodigo}
        opcoesPaises={opcoesPaises}
        carregandoPaises={carregandoPaises}
      />
    </div>
  )
}

function SecaoLocalizacaoSimulador({
  lado,
  tipoLocal,
  form,
  set,
  setForm,
  catalogo,
  codigoOutroLado,
  opcoesPaises,
  carregandoPaises,
}: {
  lado: LadoLocalizacaoSimulador
  tipoLocal: TipoLocalSimulador
  form: FormNovaCotacao
  set: <K extends keyof FormNovaCotacao>(campo: K, valor: FormNovaCotacao[K]) => void
  setForm: Dispatch<SetStateAction<FormNovaCotacao>>
  catalogo: CatalogoLogisticaSelectProps
  codigoOutroLado: string
  opcoesPaises: SelectOpcao[]
  carregandoPaises: boolean
}) {
  const ehOrigem = lado === 'origem'
  const codigoPrincipal = ehOrigem ? form.origemCodigo : form.destinoCodigo
  const mostrarOpcoes = tipoLocal === 'porto' || tipoLocal === 'aeroporto'
  const iconeLocal = tipoLocal === 'aeroporto'
    ? <AirplaneTilt {...ICONE_LABEL_SECAO} />
    : tipoLocal === 'porto'
      ? <Anchor {...ICONE_LABEL_SECAO} />
      : <MapPin {...ICONE_LABEL_SECAO} />
  const iconeSelect = tipoLocal === 'aeroporto' ? <AirplaneTilt size={16} /> : <Anchor size={16} />
  const placeholderLocal = tipoLocal === 'aeroporto' ? 'Selecione o aeroporto...' : 'Selecione o porto...'

  const locaisProximosAtivo = ehOrigem ? form.origemLocaisProximos : form.destinoLocaisProximos
  const codigosLocaisProximos = ehOrigem
    ? form.origemLocaisProximosCodigos
    : form.destinoLocaisProximosCodigos
  const exibirCampos = ehOrigem ? form.origemExibirCampos : form.destinoExibirCampos
  const paisExtra = ehOrigem ? form.origemPais : form.destinoPais
  const estadoExtra = ehOrigem ? form.origemEstadoProvincia : form.destinoEstadoProvincia
  const enderecoExtra = ehOrigem ? form.origemEndereco : form.destinoEndereco

  // Linhas no padrão "Adicionar container": '' = linha recém-adicionada sem local escolhido
  const [linhasLocais, setLinhasLocais] = useState<string[]>(
    codigosLocaisProximos.length > 0 ? codigosLocaisProximos : [''],
  )

  const persistirLinhas = (linhas: string[]) => {
    const proximas = linhas.length > 0 ? linhas : ['']
    setLinhasLocais(proximas)
    const codigos = proximas.filter((c) => c !== '')
    setForm((prev) =>
      ehOrigem
        ? { ...prev, origemLocaisProximosCodigos: codigos }
        : { ...prev, destinoLocaisProximosCodigos: codigos },
    )
  }

  const alternarLocaisProximos = (ativo: boolean) => {
    if (!ativo) setLinhasLocais([''])
    setForm((prev) =>
      ehOrigem
        ? {
          ...prev,
          origemLocaisProximos: ativo,
          origemLocaisProximosCodigos: ativo ? prev.origemLocaisProximosCodigos : [],
        }
        : {
          ...prev,
          destinoLocaisProximos: ativo,
          destinoLocaisProximosCodigos: ativo ? prev.destinoLocaisProximosCodigos : [],
        },
    )
  }

  const alternarExibirCampos = (ativo: boolean) => {
    setForm((prev) => {
      if (ehOrigem) {
        return {
          ...prev,
          origemExibirCampos: ativo,
          ...(ativo ? {} : { origemPais: '', origemEstadoProvincia: '', origemEndereco: '' }),
        }
      }
      return {
        ...prev,
        destinoExibirCampos: ativo,
        ...(ativo ? {} : { destinoPais: '', destinoEstadoProvincia: '', destinoEndereco: '' }),
      }
    })
  }

  const opcoesLocaisAdicionais = catalogo.opcoes.filter(
    (o) => String(o.valor) !== codigoPrincipal && String(o.valor) !== codigoOutroLado,
  )

  const rotuloMaiusculo = (texto: string) => (ehOrigem ? `${texto} DE ORIGEM` : `${texto} DE DESTINO`)

  return (
    <div
      className={`nc-location-visual-card nc-location-visual-card--${ehOrigem ? 'origin' : 'destination'}${codigoPrincipal ? ' nc-location-visual-card--selected' : ''}`}
    >
      <div className="nc-location-visual-header">
        <div className="nc-location-visual-circle">
          <MapPin weight="duotone" size={26} className={ehOrigem ? 'nc-pulsing-icon' : 'nc-pulsing-icon-dest'} />
        </div>
        <div className="nc-location-visual-text">
          <h4>{TITULO_LOCALIZACAO_SIM[tipoLocal][lado]}</h4>
          <p className="nc-caption">{LEGENDA_LOCALIZACAO_SIM[tipoLocal][lado]}</p>
        </div>
      </div>
      <div className="nc-location-body">
        <Field label={ROTULO_CAMPO_LOCALIZACAO_SIM[tipoLocal][lado]} required icone={iconeLocal}>
          <SelectGlobal
            id={`nc-sim-${lado}`}
            iconeEsquerda={mostrarOpcoes ? iconeSelect : undefined}
            opcoes={catalogo.opcoes.filter((o) => String(o.valor) !== codigoOutroLado)}
            valor={codigoPrincipal || null}
            aoMudarValor={(v) => set(ehOrigem ? 'origemCodigo' : 'destinoCodigo', v == null ? '' : String(v))}
            buscavel
            buscaRemota
            aoMudarBusca={catalogo.aoMudarBusca}
            aoScrollFimLista={catalogo.aoScrollFimLista}
            totalOpcoesCatalogo={catalogo.totalCatalogo}
            mensagemListaVazia={catalogo.mensagemListaVazia}
            carregando={catalogo.carregando}
            placeholder={tipoLocal === 'local' ? 'Selecione o local...' : placeholderLocal}
            posicao="auto"
          />
        </Field>

        {mostrarOpcoes && (
          <>
            <div className="nc-exibir-campos-linha">
              <label className="nc-exibir-campos-checkbox">
                <input
                  type="checkbox"
                  className="nc-checkbox-padrao"
                  checked={locaisProximosAtivo}
                  onChange={(e) => alternarLocaisProximos(e.target.checked)}
                />
                <span>{fraseLocaisProximosSim(lado, tipoLocal)}</span>
              </label>
            </div>

            {locaisProximosAtivo && (
              <div className="nc-locais-adicionais-bloco">
                <div className="nc-linhas-container-header">
                  <p className="nc-cargo-subsecao-hint" style={{ margin: 0 }}>
                    {tipoLocal === 'aeroporto'
                      ? 'Selecione aeroportos próximos que você aceita na proposta, além do aeroporto de preferência acima.'
                      : 'Selecione portos próximos que você aceita na proposta, além do porto de preferência acima.'}
                  </p>
                  <button
                    type="button"
                    className="nc-btn-adicionar-linha"
                    onClick={() => setLinhasLocais((prev) => [...prev, ''])}
                  >
                    <Plus size={14} weight="bold" />
                    {tipoLocal === 'aeroporto' ? 'Adicionar aeroporto' : 'Adicionar porto'}
                  </button>
                </div>
                {linhasLocais.map((codigo, indice) => (
                  <div key={`${lado}-local-${indice}`} className="nc-linha-local-adicional-row">
                    <Field label="LOCAIS ADICIONAIS ACEITOS" required icone={iconeLocal}>
                      <SelectGlobal
                        iconeEsquerda={iconeSelect}
                        opcoes={opcoesLocaisAdicionais.filter(
                          (o) => String(o.valor) === codigo || !linhasLocais.includes(String(o.valor)),
                        )}
                        valor={codigo || null}
                        aoMudarValor={(v) => {
                          const novo = String(v ?? '')
                          persistirLinhas(linhasLocais.map((c, i) => (i === indice ? novo : c)))
                        }}
                        placeholder={placeholderLocal}
                        buscavel
                        buscaRemota
                        aoMudarBusca={catalogo.aoMudarBusca}
                        aoScrollFimLista={catalogo.aoScrollFimLista}
                        totalOpcoesCatalogo={catalogo.totalCatalogo}
                        mensagemListaVazia={catalogo.mensagemListaVazia}
                        carregando={catalogo.carregando}
                        posicao="auto"
                      />
                    </Field>
                    <button
                      type="button"
                      className="nc-btn-remover-linha"
                      title="Remover local"
                      aria-label="Remover local"
                      disabled={linhasLocais.length <= 1 && !codigo}
                      onClick={() => persistirLinhas(linhasLocais.filter((_, i) => i !== indice))}
                    >
                      <Trash size={14} weight="bold" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="nc-exibir-campos-linha">
              <label className="nc-exibir-campos-checkbox">
                <input
                  type="checkbox"
                  className="nc-checkbox-padrao"
                  checked={exibirCampos}
                  onChange={(e) => alternarExibirCampos(e.target.checked)}
                />
                <span>{fraseExibirCamposSim(lado)}</span>
              </label>
            </div>

            {exibirCampos && (
              <div className="nc-fields-grid nc-fields-grid--location-extras">
                <Field label={rotuloMaiusculo('PAÍS')} icone={<GlobeHemisphereWest {...ICONE_LABEL_SECAO} />}>
                  <SelectGlobal
                    iconeEsquerda={<MapPin size={16} />}
                    opcoes={opcoesPaises}
                    valor={paisExtra || null}
                    aoMudarValor={(v) => {
                      const codigo = v == null ? '' : String(v)
                      setForm((prev) =>
                        ehOrigem
                          ? { ...prev, origemPais: codigo, origemEstadoProvincia: '' }
                          : { ...prev, destinoPais: codigo, destinoEstadoProvincia: '' },
                      )
                    }}
                    placeholder="Selecione o país..."
                    buscavel
                    carregando={carregandoPaises}
                    posicao="auto"
                  />
                </Field>
                <Field
                  label={rotuloMaiusculo('ESTADO OU PROVÍNCIA')}
                  required={paisExtra === 'BR'}
                  icone={<MapPin {...ICONE_LABEL_SECAO} />}
                >
                  {paisExtra === 'BR' ? (
                    <SelectGlobal
                      opcoes={OPCOES_ESTADOS_BR_SIM}
                      valor={estadoExtra || null}
                      aoMudarValor={(v) =>
                        set(ehOrigem ? 'origemEstadoProvincia' : 'destinoEstadoProvincia', String(v ?? ''))}
                      placeholder="Selecione o UF"
                      buscavel
                      desabilitado={!paisExtra}
                      posicao="auto"
                    />
                  ) : (
                    <input
                      className="nc-input"
                      placeholder="Ex: California"
                      value={estadoExtra}
                      onChange={(e) =>
                        set(ehOrigem ? 'origemEstadoProvincia' : 'destinoEstadoProvincia', e.target.value)}
                    />
                  )}
                </Field>
                <Field
                  label={rotuloMaiusculo('ENDEREÇO')}
                  className="nc-field--span-2"
                  icone={<MapPin {...ICONE_LABEL_SECAO} />}
                >
                  <input
                    className="nc-input"
                    placeholder="Complemento de endereço (opcional)"
                    value={enderecoExtra}
                    onChange={(e) => set(ehOrigem ? 'origemEndereco' : 'destinoEndereco', e.target.value)}
                  />
                </Field>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Passo 3 — Carga e Incoterm ──────────────────────────────────────────────

function PassoCargaIncoterm({
  form,
  set,
  setForm,
  incotermSelecionado,
}: {
  form: FormNovaCotacao
  set: <K extends keyof FormNovaCotacao>(campo: K, valor: FormNovaCotacao[K]) => void
  setForm: Dispatch<SetStateAction<FormNovaCotacao>>
  incotermSelecionado: { codigo: string; titulo: string; desc: string; responsabilidade: string } | null
}) {
  const ehFcl = form.modalidade === 'FCL'
  const rotuloModalidadeCurto = form.modalidade ? MODALIDADE_COTACAO[form.modalidade] : '—'
  const ncmInputRef = useRef<HTMLInputElement>(null)

  // Busca + validação de NCM contra a tabela de produção (paridade SelectNcmGlobal:
  // debounce 600ms, badge não bloqueante verde/amarelo)
  const [ncmModalAberto, setNcmModalAberto] = useState(false)
  const [ncmStatus, setNcmStatus] = useState<'idle' | 'validando' | 'valido' | 'invalido'>('idle')
  const [ncmDescricao, setNcmDescricao] = useState<string | null>(null)

  useEffect(() => {
    if (form.ncm.length !== 8) {
      setNcmStatus('idle')
      setNcmDescricao(null)
      return
    }
    setNcmStatus('validando')
    let cancelado = false
    const timer = setTimeout(() => {
      void validarNcmSimulador(form.ncm).then((resultado) => {
        if (cancelado) return
        setNcmStatus(resultado ? 'valido' : 'invalido')
        setNcmDescricao(resultado ? limparHtmlNcm(resultado.descricao) : null)
      })
    }, 600)
    return () => {
      cancelado = true
      clearTimeout(timer)
    }
  }, [form.ncm])

  const selecionarNcmDoModal = (opcao: NcmCatalogoSimulador) => {
    setForm((prev) => ({
      ...prev,
      ncm: opcao.codigo,
      descricaoMercadoria: limparHtmlNcm(opcao.descricao),
    }))
  }

  const ncmDescricaoVisivel = (() => {
    if (!ncmDescricao) return null
    const MAX_CHARS = 50
    return ncmDescricao.length > MAX_CHARS ? `${ncmDescricao.slice(0, MAX_CHARS)}…` : ncmDescricao
  })()

  const atualizarLinhaContainer = (id: string, patch: Partial<LinhaContainerWizard>) => {
    setForm((prev) => ({
      ...prev,
      linhasContainer: prev.linhasContainer.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }))
  }

  const aplicarDimensaoComAutoCalc = (patch: Partial<FormNovaCotacao>) => {
    setForm((prev) => {
      const prox = { ...prev, ...patch }
      const fator = FATOR_MEDIDA_PARA_METRO[prox.medidaCubagem]
      const c = parseFloat(prox.comprimento)
      const l = parseFloat(prox.largura)
      const a = parseFloat(prox.altura)
      if (Number.isFinite(c) && Number.isFinite(l) && Number.isFinite(a)) {
        prox.cubagemM3 = (c * fator * l * fator * a * fator).toFixed(3)
      }
      return prox
    })
  }

  return (
    <div className="nc-step-content nc-cargo-stack">
      <NcSectionTitle icone={<Package {...ICONE_LABEL_SECAO} />} obrigatorio>
        Dados da Mercadoria
      </NcSectionTitle>

      <section className="nc-cargo-subsecao">
        <NcSubsecaoTitle icone={<Tag {...ICONE_LABEL_SECAO} />} obrigatorio>
          Identificação da Mercadoria
        </NcSubsecaoTitle>
        <p className="nc-cargo-subsecao-hint">
          NCM, descrição comercial e HS Code (quando aplicável)
        </p>
        <div className="nc-cargo-subsecao-grid-identificacao">
          <Field label="NCM" icone={<Hash {...ICONE_LABEL_SECAO} />}>
            <div className="nc-sim-ncm">
              <input
                ref={ncmInputRef}
                className={[
                  'nc-input nc-sim-ncm-input',
                  ncmStatus === 'valido' ? 'nc-sim-ncm-input--valido' : '',
                  ncmStatus === 'invalido' ? 'nc-sim-ncm-input--invalido' : '',
                ].filter(Boolean).join(' ')}
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="0000.00.00"
                value={formatarNcmDisplay(form.ncm)}
                onChange={(e) => set('ncm', e.target.value.replace(/\D/g, '').slice(0, 8))}
              />
              <button
                type="button"
                className="nc-sim-ncm-buscar"
                aria-label="Buscar NCM"
                title="Buscar NCM por código ou descrição"
                onClick={() => setNcmModalAberto(true)}
              >
                <MagnifyingGlass size={16} weight="bold" />
              </button>
            </div>
            {ncmStatus !== 'idle' && (
              <div className="nc-sim-ncm-status" aria-live="polite">
                {ncmStatus === 'validando' && (
                  <span className="nc-sim-ncm-badge nc-sim-ncm-badge--verificando">
                    <ArrowsClockwise size={12} className="nc-sim-spin" /> Verificando…
                  </span>
                )}
                {ncmStatus === 'valido' && (
                  <span className="nc-sim-ncm-badge nc-sim-ncm-badge--valido" title={ncmDescricao ?? undefined}>
                    <CheckCircle size={12} weight="fill" /> {ncmDescricaoVisivel ?? 'NCM válido'}
                  </span>
                )}
                {ncmStatus === 'invalido' && (
                  <span className="nc-sim-ncm-badge nc-sim-ncm-badge--invalido">
                    <Warning size={12} weight="fill" /> NCM não encontrado na tabela Siscomex
                  </span>
                )}
              </div>
            )}
            <ModalBuscarNcmSimulador
              aberto={ncmModalAberto}
              onFechar={() => setNcmModalAberto(false)}
              onSelecionar={selecionarNcmDoModal}
              valorAtual={form.ncm}
            />
          </Field>

          <Field
            label="Descrição da Mercadoria"
            required
            icone={<Tag {...ICONE_LABEL_SECAO} />}
            className="nc-cargo-descricao"
          >
            <input
              className="nc-input"
              placeholder="Ex: Peças automotivas, eletrônicos industriais..."
              value={form.descricaoMercadoria}
              onChange={(e) => set('descricaoMercadoria', e.target.value)}
            />
          </Field>

          <Field label="HS Code" icone={<Hash {...ICONE_LABEL_SECAO} />}>
            <input
              className="nc-input"
              placeholder="Ex: 8708.99"
              value={form.hsCode}
              onChange={(e) => set('hsCode', e.target.value.slice(0, 10))}
            />
          </Field>
        </div>
      </section>

      {form.cargaPerigosa && (
        <section className="nc-cargo-subsecao">
          <NcSubsecaoTitle icone={<Warning {...ICONE_LABEL_SECAO} />} obrigatorio>
            Carga perigosa
          </NcSubsecaoTitle>
          <p className="nc-cargo-subsecao-hint">
            Marcado no passo 1 — informe a classificação ONU (IMDG / IATA DGR / ADR).
          </p>
          <div className="nc-cargo-subsecao-grid-identificacao">
            <Field label="Número ONU" required icone={<Warning {...ICONE_LABEL_SECAO} />}>
              <input
                className="nc-input"
                placeholder="Ex: UN 1263"
                value={form.numeroOnu}
                onChange={(e) => set('numeroOnu', e.target.value)}
              />
            </Field>
          </div>
        </section>
      )}

      <section className="nc-cargo-subsecao">
        <NcSubsecaoTitle icone={<Package {...ICONE_LABEL_SECAO} />} obrigatorio={ehFcl}>
          Quantidade de Volumes
        </NcSubsecaoTitle>
        {ehFcl ? (
          <>
            <div className="nc-linhas-container-header">
              <p className="nc-cargo-subsecao-hint" style={{ margin: 0 }}>
                Modalidade
                {' '}
                <strong>{rotuloModalidadeCurto}</strong>
                {' '}
                — adicione um ou mais tipos de container.
              </p>
              <button
                type="button"
                className="nc-btn-adicionar-linha"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    linhasContainer: [...prev.linhasContainer, novaLinhaContainer()],
                  }))}
              >
                <Plus size={14} weight="bold" />
                Adicionar container
              </button>
            </div>
            {form.linhasContainer.map((linha) => (
              <div key={linha.id} className="nc-linha-container-row">
                <Field label="Tipo Container" required icone={<ShippingContainer {...ICONE_LABEL_SECAO} />}>
                  <SelectGlobal
                    opcoes={TIPOS_CONTAINER}
                    valor={linha.tipo || null}
                    aoMudarValor={(v) => atualizarLinhaContainer(linha.id, { tipo: v == null ? '' : String(v) })}
                    placeholder="Selecione o tipo..."
                    buscavel
                    posicao="auto"
                  />
                </Field>
                <Field label="Quantidade" required icone={<Hash {...ICONE_LABEL_SECAO} />}>
                  <div className="nc-input-group">
                    <input
                      className="nc-input nc-input--with-suffix"
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Ex: 1"
                      value={linha.quantidade}
                      onChange={(e) => atualizarLinhaContainer(linha.id, { quantidade: e.target.value })}
                      onBlur={() => {
                        if (Number(linha.quantidade) < 1) atualizarLinhaContainer(linha.id, { quantidade: '1' })
                      }}
                    />
                    <span className="nc-input-suffix">ctn</span>
                  </div>
                </Field>
                <button
                  type="button"
                  className="nc-btn-remover-linha"
                  title="Remover linha"
                  aria-label="Remover container"
                  disabled={form.linhasContainer.length <= 1}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      linhasContainer: prev.linhasContainer.filter((l) => l.id !== linha.id),
                    }))}
                >
                  <Trash size={14} weight="bold" aria-hidden />
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="nc-cargo-subsecao-hint">
              Modalidade
              {' '}
              <strong>{rotuloModalidadeCurto}</strong>
              {' '}
              — escolha o tipo de volume (caixa, palete, etc.) e a quantidade
            </p>
            <div className="nc-cargo-subsecao-grid-quantidade nc-cargo-subsecao-grid-quantidade--embalagem">
              <Field label="Tipo de Volume" icone={<Package {...ICONE_LABEL_SECAO} />}>
                <SelectGlobal
                  opcoes={TIPOS_VOLUME}
                  valor={form.tipoVolume || null}
                  aoMudarValor={(v) => set('tipoVolume', v == null ? '' : String(v))}
                  placeholder="Selecione caixa, palete..."
                  buscavel
                  posicao="auto"
                />
              </Field>
              <Field label="Quantidade" icone={<Hash {...ICONE_LABEL_SECAO} />}>
                <div className="nc-input-group">
                  <input
                    className="nc-input nc-input--with-suffix"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Ex: 10"
                    value={form.quantidade}
                    onChange={(e) => set('quantidade', e.target.value)}
                  />
                  <span className="nc-input-suffix">vol</span>
                </div>
              </Field>
            </div>
          </>
        )}
      </section>

      <section className="nc-cargo-subsecao">
        <NcSubsecaoTitle icone={<Scales {...ICONE_LABEL_SECAO} />}>
          Peso e cubagem
        </NcSubsecaoTitle>
        <p className="nc-cargo-subsecao-hint">
          Opcional — informe peso e cubagem para ajudar o fornecedor a cotar com precisão
        </p>
        <div className="nc-cargo-subsecao-grid-peso">
          <Field label="Peso (kg)" icone={<Scales {...ICONE_LABEL_SECAO} />}>
            <div className="nc-input-group">
              <input
                className="nc-input nc-input--with-suffix"
                type="number"
                placeholder="Ex: 12000"
                value={form.pesoKg}
                onChange={(e) => {
                  const val = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    pesoKg: val,
                    pesoTon: val ? (parseFloat(val) / 1000).toFixed(3) : '',
                  }))
                }}
              />
              <span className="nc-input-suffix">Kg</span>
            </div>
          </Field>

          <Field label="Peso (ton)" icone={<Scales {...ICONE_LABEL_SECAO} />}>
            <div className="nc-input-group">
              <input
                className="nc-input nc-input--with-suffix"
                type="number"
                placeholder="Ex: 12.0"
                value={form.pesoTon}
                onChange={(e) => {
                  const val = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    pesoTon: val,
                    pesoKg: val ? (parseFloat(val) * 1000).toFixed(0) : '',
                  }))
                }}
              />
              <span className="nc-input-suffix">TON</span>
            </div>
          </Field>
        </div>

        <div className="nc-cargo-cubagem-stack">
          <Field label="Incluir cubagem detalhada" icone={<Package {...ICONE_LABEL_SECAO} />}>
            <div className="nc-exibir-campos-linha">
              <label className="nc-exibir-campos-checkbox">
                <input
                  type="checkbox"
                  className="nc-checkbox-padrao"
                  checked={form.cubagemDetalhada}
                  onChange={(e) => set('cubagemDetalhada', e.target.checked)}
                />
                <span>Informar medidas e dimensões da carga</span>
              </label>
            </div>
          </Field>

          {form.cubagemDetalhada && (
            <div className="nc-cargo-cubagem-detalhe-panel nc-fade-in" role="region">
              <p className="nc-helper-desc">
                Escolha a unidade de medida e informe comprimento, largura e altura.
              </p>
              <div className="nc-cargo-cubagem-dimensoes-grid">
                <Field className="nc-field-medida-cubagem" label="Medida da cubagem" icone={<Scales {...ICONE_LABEL_SECAO} />}>
                  <SelectGlobal
                    opcoes={MEDIDAS_CUBAGEM}
                    valor={form.medidaCubagem}
                    aoMudarValor={(v) =>
                      aplicarDimensaoComAutoCalc({ medidaCubagem: (v as MedidaCubagemWizard) || 'cm' })}
                    placeholder="Selecione cm, m, in..."
                    posicao="auto"
                  />
                </Field>
                <Field label="Comprimento" icone={<Hash {...ICONE_LABEL_SECAO} />}>
                  <div className="nc-input-group">
                    <input
                      className="nc-input nc-input--with-suffix"
                      type="number"
                      placeholder="Ex: 120"
                      value={form.comprimento}
                      onChange={(e) => aplicarDimensaoComAutoCalc({ comprimento: e.target.value })}
                    />
                    <span className="nc-input-suffix">{form.medidaCubagem}</span>
                  </div>
                </Field>
                <Field label="Largura" icone={<Hash {...ICONE_LABEL_SECAO} />}>
                  <div className="nc-input-group">
                    <input
                      className="nc-input nc-input--with-suffix"
                      type="number"
                      placeholder="Ex: 80"
                      value={form.largura}
                      onChange={(e) => aplicarDimensaoComAutoCalc({ largura: e.target.value })}
                    />
                    <span className="nc-input-suffix">{form.medidaCubagem}</span>
                  </div>
                </Field>
                <Field label="Altura" icone={<Hash {...ICONE_LABEL_SECAO} />}>
                  <div className="nc-input-group">
                    <input
                      className="nc-input nc-input--with-suffix"
                      type="number"
                      placeholder="Ex: 90"
                      value={form.altura}
                      onChange={(e) => aplicarDimensaoComAutoCalc({ altura: e.target.value })}
                    />
                    <span className="nc-input-suffix">{form.medidaCubagem}</span>
                  </div>
                </Field>
              </div>

              <div className="nc-cargo-subsecao-grid-cubagem-m3" style={{ marginTop: '1rem' }}>
                <Field label="Cubagem (m³)" icone={<Scales {...ICONE_LABEL_SECAO} />}>
                  <div className="nc-input-group">
                    <input
                      className="nc-input nc-input--with-suffix"
                      type="number"
                      placeholder="Ex: 33.2"
                      value={form.cubagemM3}
                      onChange={(e) => set('cubagemM3', e.target.value)}
                    />
                    <span className="nc-input-suffix">m³</span>
                  </div>
                </Field>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="nc-cargo-subsecao">
        <NcSubsecaoTitle icone={<FileText {...ICONE_LABEL_SECAO} />} obrigatorio>
          Incoterm
        </NcSubsecaoTitle>
        <p className="nc-cargo-subsecao-hint">
          Escolha quem assume frete e risco até o destino
        </p>
        <div className="nc-incoterm-stack">
          <div className="nc-incoterm-grid" role="group" aria-label="Incoterm">
            {INCOTERMS_WIZARD.map((inc) => (
              <TooltipGlobal
                key={inc.codigo}
                titulo={inc.titulo}
                descricao={
                  <>
                    <p><strong>Grupo:</strong> {inc.grupo}</p>
                    <p>{inc.desc}</p>
                    <p><strong>Responsabilidade:</strong> {inc.responsabilidade}</p>
                  </>
                }
                interativo
                posicaoPreferida="auto"
              >
                <button
                  type="button"
                  aria-pressed={form.incoterm === inc.codigo}
                  className={[
                    'nc-incoterm-btn',
                    form.incoterm === inc.codigo ? 'nc-incoterm-btn--selected' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => set('incoterm', inc.codigo)}
                >
                  {inc.codigo}
                </button>
              </TooltipGlobal>
            ))}
          </div>
          {incotermSelecionado && (
            <div className="nc-incoterm-helper-card nc-fade-in">
              <div className="nc-helper-header">
                <Scales size={20} weight="duotone" className="nc-helper-icon" />
                <h4>{incotermSelecionado.titulo}</h4>
              </div>
              <p className="nc-helper-desc">{incotermSelecionado.desc}</p>
              <div className="nc-helper-footer">
                <strong>Responsabilidade:</strong>
                {' '}
                {incotermSelecionado.responsabilidade}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="nc-cargo-subsecao">
        <NcSubsecaoTitle icone={<Hash {...ICONE_LABEL_SECAO} />}>
          Valor alvo (opcional)
        </NcSubsecaoTitle>
        <p className="nc-cargo-subsecao-hint">
          Informe o valor de referência esperado para esta cotação
        </p>
        <div className="nc-fields-grid nc-fields-grid--summary-inputs">
          <Field label="Moeda" icone={<Tag {...ICONE_LABEL_SECAO} />}>
            <SelectGlobal
              id="nc-sim-moeda"
              opcoes={MOEDAS_META}
              valor={form.moedaMeta || null}
              aoMudarValor={(v) => set('moedaMeta', v == null ? '' : String(v))}
              placeholder="Selecionar moeda"
              posicao="auto"
            />
          </Field>
          <Field label="Valor alvo (opcional)">
            <input
              className="nc-input"
              type="number"
              placeholder="Ex: 5000"
              value={form.valorMeta}
              onChange={(e) => set('valorMeta', e.target.value)}
            />
          </Field>
        </div>
      </section>
    </div>
  )
}

// ─── Passo 4 — Fornecedores ──────────────────────────────────────────────────

function PassoFornecedores({
  form,
  set,
  fornecedoresElegiveis,
}: {
  form: FormNovaCotacao
  set: <K extends keyof FormNovaCotacao>(campo: K, valor: FormNovaCotacao[K]) => void
  fornecedoresElegiveis: { id: string; nome: string; modais: ModalSimuladorBidFrete[] }[]
}) {
  const alternarFornecedor = (id: string) => {
    const atual = form.fornecedoresSelecionados
    set(
      'fornecedoresSelecionados',
      atual.includes(id) ? atual.filter((f) => f !== id) : [...atual, id],
    )
  }

  return (
    <div className="nc-step-content">
      <section className="nc-cargo-subsecao" style={{ marginBottom: '1.5rem' }}>
        <NcSubsecaoTitle icone={<CalendarBlank {...ICONE_LABEL_SECAO} />}>
          Prazo para respostas
        </NcSubsecaoTitle>
        <p className="nc-cargo-subsecao-hint">
          Obrigatório — define até quando os fornecedores podem enviar ou alterar propostas.
        </p>
        <div className="nc-prazo-data-hora">
          <Field label="Data de vencimento" required icone={<CalendarBlank {...ICONE_LABEL_SECAO} />}>
            <CampoCalendarioGlobal
              modoUnico
              permitirLimpar={false}
              placeholder="DD/MM/AAAA"
              valor={{ inicio: form.prazoData, fim: form.prazoData }}
              aoMudarValor={({ inicio }) => {
                if (!inicio) return
                set('prazoData', inicio)
              }}
            />
          </Field>
          <Field label="Hora" required icone={<Clock {...ICONE_LABEL_SECAO} />}>
            <input
              className="nc-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="HH:mm"
              maxLength={5}
              value={form.prazoHora}
              onChange={(e) => set('prazoHora', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="nc-cargo-subsecao" style={{ marginBottom: '1.5rem' }}>
        <NcSubsecaoTitle icone={<NotePencil {...ICONE_LABEL_SECAO} />}>
          Fornecedor pode alterar proposta
        </NcSubsecaoTitle>
        <p className="nc-cargo-subsecao-hint">
          Enquanto o prazo estiver aberto. Padrão da organização: Sim — escolha obrigatória nesta cotação.
        </p>
        <Field label="Permitir edição da proposta" icone={<NotePencil {...ICONE_LABEL_SECAO} />} required>
          <SelectGlobal
            id="nc-sim-pode-alterar"
            opcoes={OPCOES_SIM_NAO}
            valor={form.fornecedorPodeAlterar || null}
            aoMudarValor={(v) => set('fornecedorPodeAlterar', (v == null ? '' : String(v)) as '' | 'sim' | 'nao')}
            placeholder="Selecionar"
            posicao="auto"
          />
        </Field>
      </section>

      <section className="nc-cargo-subsecao nc-visibilidade-subsecao" style={{ marginBottom: '1.5rem' }}>
        <NcSubsecaoTitle icone={<Eye {...ICONE_LABEL_SECAO} />} obrigatorio>
          Visibilidade da Cotação
        </NcSubsecaoTitle>

        <div className="nc-options-grid-2 nc-visibilidade-inline">
          <OptionButton
            selected={form.visibilidade === 'DIRECIONADA'}
            onClick={() => set('visibilidade', 'DIRECIONADA')}
            icon={<Users weight="duotone" size={20} />}
            label="Direcionada — Escolher fornecedores"
            description="Após criar a cotação, você poderá selecionar os fornecedores e os canais de disparo."
          />
          <OptionButton
            selected={form.visibilidade === 'ABERTA'}
            onClick={() => set('visibilidade', 'ABERTA')}
            icon={<Users weight="duotone" size={20} />}
            label="Aberta — Todos os fornecedores"
            description="Todos os fornecedores cadastrados que aceitam cotação aberta receberão a solicitação."
          />
        </div>

        <div className="nc-switch-row">
          <label className="nc-switch-label">
            <div className="nc-switch-text">
              <span className="nc-switch-title">Cotação anônima (ocultar nome da empresa)</span>
              <span className="nc-switch-desc">
                Ocultar o nome da sua empresa no mercado inicial de lances para total confidencialidade.
              </span>
            </div>
            <div className="nc-switch">
              <input
                type="checkbox"
                checked={form.anonima}
                onChange={(e) => set('anonima', e.target.checked)}
              />
              <span className="nc-switch-slider" />
            </div>
          </label>
        </div>
      </section>

      <section className="nc-cargo-subsecao">
        <NcSubsecaoTitle icone={<Users {...ICONE_LABEL_SECAO} />}>
          Fornecedores e envio
        </NcSubsecaoTitle>
        <p className="nc-cargo-subsecao-hint">
          {form.visibilidade === 'ABERTA'
            ? 'Todos os fornecedores elegíveis para o modal receberão o pedido de cotação por e-mail.'
            : 'Selecione os fornecedores que receberão o pedido de cotação por e-mail.'}
        </p>
        {form.visibilidade === 'ABERTA' ? (
          <div className="nc-empty-hint" style={{ gridColumn: 'auto' }}>
            <Info size={18} weight="duotone" />
            <p>
              {fornecedoresElegiveis.length}
              {' '}
              fornecedores elegíveis serão notificados automaticamente.
            </p>
          </div>
        ) : (
          <div className="nc-sim-fornecedores-lista">
            {fornecedoresElegiveis.map((f) => {
              const marcado = form.fornecedoresSelecionados.includes(f.id)
              return (
                <label key={f.id} className={`nc-sim-fornecedor-item${marcado ? ' nc-sim-fornecedor-item--marcado' : ''}`}>
                  <input
                    type="checkbox"
                    className="nc-checkbox-padrao"
                    checked={marcado}
                    onChange={() => alternarFornecedor(f.id)}
                  />
                  <span className="nc-sim-fornecedor-nome">{f.nome}</span>
                  <span className="nc-sim-fornecedor-modais">
                    {f.modais.map((m) => (m === 'MARITIMO' ? 'Marítimo' : m === 'AEREO' ? 'Aéreo' : 'Rodoviário')).join(' · ')}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

// ─── Passo 5 — Resumo ────────────────────────────────────────────────────────

function PassoResumo({
  form,
  origem,
  destino,
  incotermSelecionado,
}: {
  form: FormNovaCotacao
  origem: PortoSimuladorBidFrete | null
  destino: PortoSimuladorBidFrete | null
  incotermSelecionado: { codigo: string; titulo: string } | null
}) {
  const rotuloOperacao = form.operacao === 'IMPORTACAO' ? 'Importação' : form.operacao === 'EXPORTACAO' ? 'Exportação' : '—'
  const rotuloModal = form.modal === 'MARITIMO' ? 'Marítimo' : form.modal === 'AEREO' ? 'Aéreo' : form.modal === 'RODOVIARIO' ? 'Rodoviário' : '—'
  const rotuloModalidade = form.modalidade ? ROTULO_MODALIDADE[form.modalidade] : '—'
  const textoModalResumo = form.modal === 'AEREO' ? rotuloModal : `${rotuloModal} / ${rotuloModalidade}`

  const textoContainers = form.modalidade === 'FCL'
    ? form.linhasContainer
        .filter((l) => l.tipo)
        .map((l) => `${l.quantidade || 1}× ${l.tipo}`)
        .join(' · ')
    : ''

  const textoQtdPeso = [
    form.modalidade === 'FCL'
      ? textoContainers
      : form.quantidade
        ? `${form.quantidade}× ${form.tipoVolume || 'vol'}`
        : '',
    form.pesoKg
      ? `${Number(form.pesoKg).toLocaleString('pt-BR')} kg${form.pesoTon ? ` (${form.pesoTon} TON)` : ''}`
      : '',
    form.cubagemM3 ? `${form.cubagemM3} m³` : '',
  ].filter(Boolean).join(' · ')

  const textoPrazo = form.prazoData
    ? `${form.prazoData.toLocaleDateString('pt-BR')} ${form.prazoHora || '23:59'}`
    : '—'

  const textoVisibilidade = form.visibilidade === 'DIRECIONADA'
    ? 'Direcionada — apenas os fornecedores selecionados recebem a cotação'
    : form.visibilidade === 'ABERTA'
      ? form.anonima
        ? 'Aberta (Anônima) — o nome da sua empresa ficará oculto para os fornecedores'
        : 'Aberta — todos os fornecedores elegíveis verão o nome da sua empresa'
      : '—'

  const textoFornecedores = form.visibilidade === 'DIRECIONADA'
    ? `${form.fornecedoresSelecionados.length} fornecedor(es) selecionado(s) · E-mail`
    : 'Todos os fornecedores elegíveis · E-mail'

  return (
    <div className="nc-step-content">
      <NcSectionTitle icone={<FileText {...ICONE_LABEL_SECAO} />}>
        Resumo da Cotação
      </NcSectionTitle>

      <div className="nc-receipt-card">
        <div className="nc-receipt-header">
          <span className="nc-receipt-badge">{rotuloOperacao}</span>
          <span className="nc-receipt-modal">{textoModalResumo}</span>
        </div>

        <div className="nc-route-timeline">
          <div className="nc-timeline-node">
            <div className="nc-node-dot nc-node-dot--origin" />
            <div className="nc-node-text">
              <span className="nc-node-code">{origem?.codigo ?? '—'}</span>
              <span className="nc-node-name">
                {origem ? `${origem.cidade}, ${origem.pais}` : '—'}
              </span>
            </div>
          </div>

          <div className="nc-timeline-line">
            <div className="nc-timeline-icon-wrap">
              {form.modal === 'MARITIMO' && <Anchor weight="duotone" size={16} />}
              {form.modal === 'AEREO' && <AirplaneTilt weight="duotone" size={16} />}
              {(form.modal === 'RODOVIARIO' || !form.modal) && <Truck weight="duotone" size={16} />}
            </div>
            <div className="nc-timeline-line-fill" />
          </div>

          <div className="nc-timeline-node">
            <div className="nc-node-dot nc-node-dot--destination" />
            <div className="nc-node-text">
              <span className="nc-node-code">{destino?.codigo ?? '—'}</span>
              <span className="nc-node-name">
                {destino ? `${destino.cidade}, ${destino.pais}` : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="nc-receipt-details">
          <div className="nc-receipt-row">
            <span className="nc-receipt-label">
              <Hash size={14} />
              Nº da cotação
            </span>
            <span className="nc-receipt-value font-mono">{form.numero || '—'}</span>
          </div>
          <div className="nc-receipt-row">
            <span className="nc-receipt-label">
              <Tag size={14} />
              Mercadoria
            </span>
            <span className="nc-receipt-value">{form.descricaoMercadoria || '—'}</span>
          </div>
          {form.ncm && (
            <div className="nc-receipt-row">
              <span className="nc-receipt-label">
                <Hash size={14} />
                NCM
              </span>
              <span className="nc-receipt-value font-mono">{formatarNcmDisplay(form.ncm)}</span>
            </div>
          )}
          {form.hsCode && (
            <div className="nc-receipt-row">
              <span className="nc-receipt-label">
                <Hash size={14} />
                HS Code
              </span>
              <span className="nc-receipt-value font-mono">{form.hsCode}</span>
            </div>
          )}
          {textoQtdPeso && (
            <div className="nc-receipt-row">
              <span className="nc-receipt-label">
                <Package size={14} />
                Quantidade de Volumes / Peso
              </span>
              <span className="nc-receipt-value">{textoQtdPeso}</span>
            </div>
          )}
          {form.cargaPerigosa && (
            <div className="nc-receipt-row">
              <span className="nc-receipt-label">
                <Warning size={14} />
                Carga Perigosa
              </span>
              <span className="nc-receipt-value">{form.numeroOnu ? `UN ${form.numeroOnu.replace(/^UN\s*/i, '')}` : 'Sim'}</span>
            </div>
          )}
          <div className="nc-receipt-row">
            <span className="nc-receipt-label">
              <Scales size={14} />
              Incoterm
            </span>
            <span className="nc-receipt-value nc-receipt-value--incoterm">
              {incotermSelecionado?.codigo ?? '—'}
            </span>
          </div>
          <div className="nc-receipt-row">
            <span className="nc-receipt-label">
              <CalendarBlank size={14} />
              Prazo para respostas
            </span>
            <span className="nc-receipt-value">{textoPrazo}</span>
          </div>
          <div className="nc-receipt-row">
            <span className="nc-receipt-label">
              <Eye size={14} />
              Visibilidade
            </span>
            <span className="nc-receipt-value">{textoVisibilidade}</span>
          </div>
          <div className="nc-receipt-row">
            <span className="nc-receipt-label">
              <Users size={14} />
              Fornecedores
            </span>
            <span className="nc-receipt-value">{textoFornecedores}</span>
          </div>
          {form.valorMeta && (
            <div className="nc-receipt-row">
              <span className="nc-receipt-label">
                <Hash size={14} />
                Valor alvo
              </span>
              <span className="nc-receipt-value font-mono">
                {form.moedaMeta}
                {' '}
                {Number(form.valorMeta).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
