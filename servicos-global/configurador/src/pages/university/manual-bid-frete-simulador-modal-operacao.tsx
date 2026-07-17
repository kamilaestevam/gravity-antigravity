import React, { useEffect, useMemo, useState } from 'react'
import {
  AirplaneTilt,
  Anchor,
  DownloadSimple,
  Export,
  FileText,
  GlobeHemisphereWest,
  Hash,
  Info,
  MapPin,
  Package,
  Scales,
  ShippingContainer,
  SquaresFour,
  Truck,
  Users,
  Van,
  Warning,
  Warehouse,
} from '@phosphor-icons/react'
import { gerarNumeroCotacaoFreteInternacional } from '@produto/bid-frete-internacional/shared/numeracao-bid-frete-internacional'
import {
  ehMaritimoLclCotacaoBidFreteInternacional,
  sequenciaPassosWizardNovaCotacao,
  tipoPassoWizardNovaCotacao,
  type TipoPassoWizardNovaCotacao,
} from './manual-bid-frete-simulador-passos-wizard-lcl'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  NC_ESTILOS_SIMULADOR_CARGA_INCOTERM,
  NC_ESTILOS_SIMULADOR_MODAL_OPERACAO,
  NC_ESTILOS_SIMULADOR_ORIGEM_DESTINO,
  NC_ESTILOS_AFFORDANCE_INTERATIVO_BID_FRETE,
} from './manual-bid-frete-estilos-nc-simulador'
import {
  FaixaDemoInterativaBidFrete,
  WrapperAlvoAffordanceBidFrete,
} from './manual-bid-frete-affordance-interativo'
import {
  ICONE_FIELD,
  ICONE_LABEL_SECAO,
  SimuladorNcField,
  SimuladorNcOptionButton,
  SimuladorNcSectionTitle,
} from './manual-bid-frete-simulador-nc-ui'
import { ManualBidFreteSimuladorWizardEmbutido } from './manual-bid-frete-simulador-wizard-embutido'
import { MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'
import {
  CAMPOS_MODAL_OPERACAO_BID_FRETE,
  type CampoModalOperacaoId,
} from './manual-bid-frete-infografico-modal-operacao-campos'
import { ManualBidFreteGuiaAoVivo, type CampoGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'
import {
  CAMPOS_ORIGEM_DESTINO_BID_FRETE,
  ConteudoPassoOrigemDestinoSimulador,
  ESTADO_LADO_ORIGEM_DESTINO_INICIAL,
  podeAvancarPassoOrigemDestino,
  resolverExplicacaoOrigemDestino,
  resolverSelecoesOrigemDestino,
  type CampoOrigemDestinoId,
  type EstadoOrigemDestino,
  type LadoLocal,
} from './manual-bid-frete-simulador-origem-destino'
import {
  CAMPOS_CARGA_INCOTERM_BID_FRETE,
  ConteudoPassoCargaIncotermSimulador,
  ESTADO_CARGA_INCOTERM_INICIAL,
  podeAvancarPassoCargaIncoterm,
  resolverExplicacaoCargaIncoterm,
  resolverSelecoesCargaIncoterm,
  type CampoCargaIncotermId,
  type EstadoCargaIncoterm,
} from './manual-bid-frete-simulador-carga-incoterm'
import {
  CAMPOS_VISIBILIDADE_BID_FRETE,
  ConteudoPassoVisibilidadeSimulador,
  ESTADO_VISIBILIDADE_INICIAL,
  podeAvancarPassoVisibilidade,
  resolverExplicacaoVisibilidade,
  resolverSelecoesVisibilidade,
  type CampoVisibilidadeId,
  type EstadoVisibilidade,
} from './manual-bid-frete-simulador-visibilidade'
import { ConteudoPassoResumoSimulador } from './manual-bid-frete-simulador-resumo'
import {
  ConteudoPassoArmazenagemSimulador,
  criarEstadoArmazenagemInicial,
  podeAvancarPassoArmazenagem,
  type EstadoArmazenagem,
} from './manual-bid-frete-simulador-armazenagem'

type TipoOperacao = 'IMPORTACAO' | 'EXPORTACAO' | ''
type ModalFrete = 'MARITIMO' | 'AEREO' | 'RODOVIARIO' | ''
type Modalidade = 'FCL' | 'LCL' | 'FTL' | 'LTL' | ''

type CampoFoco = CampoModalOperacaoId

type EstadoSimulador = {
  numero_cotacao: string
  tipo_operacao: TipoOperacao
  modal_frete: ModalFrete
  modalidade: Modalidade
  carga_perigosa: boolean
}

const ROTULOS_PASSO_WIZARD: Record<
  TipoPassoWizardNovaCotacao,
  { label: string; icone: React.ReactNode }
> = {
  modal: { label: 'Modal e Operação', icone: <Truck weight="duotone" size={16} /> },
  origem: { label: 'Origem e Destino', icone: <MapPin weight="duotone" size={16} /> },
  carga: { label: 'Carga e Incoterm', icone: <Package weight="duotone" size={16} /> },
  armazenagem: { label: 'Armazenagem', icone: <Warehouse weight="duotone" size={16} /> },
  fornecedores: { label: 'Fornecedores', icone: <Users weight="duotone" size={16} /> },
  resumo: { label: 'Resumo', icone: <FileText weight="duotone" size={16} /> },
}

function montarPassosWizard(modalFrete: ModalFrete, modalidade: Modalidade) {
  return sequenciaPassosWizardNovaCotacao(modalFrete, modalidade).map((tipo, index) => ({
    id: index + 1,
    ...ROTULOS_PASSO_WIZARD[tipo],
  }))
}

function criarEstadoModalInicial(): EstadoSimulador {
  return {
    numero_cotacao: gerarNumeroCotacaoFreteInternacional(),
    tipo_operacao: '',
    modal_frete: '',
    modalidade: '',
    carga_perigosa: false,
  }
}

function criarEstadoLocaisInicial(): EstadoOrigemDestino {
  return {
    origem: { ...ESTADO_LADO_ORIGEM_DESTINO_INICIAL },
    destino: { ...ESTADO_LADO_ORIGEM_DESTINO_INICIAL },
  }
}

function criarEstadoCargaInicial(): EstadoCargaIncoterm {
  return {
    ...ESTADO_CARGA_INCOTERM_INICIAL,
    linhas_container_fcl: ESTADO_CARGA_INCOTERM_INICIAL.linhas_container_fcl.map((l) => ({ ...l })),
  }
}

function criarEstadoVisibilidadeInicial(): EstadoVisibilidade {
  return {
    ...ESTADO_VISIBILIDADE_INICIAL,
    canais: [...ESTADO_VISIBILIDADE_INICIAL.canais],
    ids_fornecedores: [...ESTADO_VISIBILIDADE_INICIAL.ids_fornecedores],
  }
}

function resolverRotuloSelecao(estado: EstadoSimulador, id: CampoModalOperacaoId): string | null {
  switch (id) {
    case 'numero_cotacao':
      return estado.numero_cotacao
    case 'tipo_operacao':
      if (estado.tipo_operacao === 'IMPORTACAO') return 'Importação'
      if (estado.tipo_operacao === 'EXPORTACAO') return 'Exportação'
      return null
    case 'modal_frete':
      if (estado.modal_frete === 'MARITIMO') return 'Marítimo'
      if (estado.modal_frete === 'AEREO') return 'Aéreo'
      if (estado.modal_frete === 'RODOVIARIO') return 'Rodoviário'
      return null
    case 'modalidade':
      if (estado.modalidade === 'FCL') return 'FCL'
      if (estado.modalidade === 'LCL') return 'LCL'
      if (estado.modalidade === 'FTL') return 'FTL'
      if (estado.modalidade === 'LTL') return 'LTL'
      return null
    case 'carga_perigosa':
      // Desmarcada é o estado padrão — não conta como escolha na lista do guia.
      return estado.carga_perigosa ? 'Marcada' : null
    default:
      return null
  }
}

const ORDEM_CAMPOS_GUIA: CampoModalOperacaoId[] = [
  'numero_cotacao',
  'tipo_operacao',
  'modal_frete',
  'modalidade',
  'carga_perigosa',
]

function resolverSelecoesPreenchidas(
  estado: EstadoSimulador,
  interagiu: Partial<Record<CampoFoco, boolean>>,
): { id: CampoModalOperacaoId; valor: string }[] {
  return ORDEM_CAMPOS_GUIA.flatMap((id) => {
    if (id === 'numero_cotacao' && !interagiu.numero_cotacao) return []
    if (id === 'carga_perigosa' && !interagiu.carga_perigosa) return []
    if (id === 'carga_perigosa') {
      return [{ id, valor: estado.carga_perigosa ? 'Marcada' : 'Não marcada' }]
    }
    const valor = resolverRotuloSelecao(estado, id)
    if (!valor) return []
    return [{ id, valor }]
  })
}

function resolverExplicacao(estado: EstadoSimulador, foco: CampoFoco | null): string {
  if (!foco) return ''
  switch (foco) {
    case 'numero_cotacao':
      return `Número atual: **${estado.numero_cotacao}**. Identificador único da solicitação, gerado automaticamente no formato **COT-YYYYMMDD-NNNN**; você pode personalizar antes de criar.`
    case 'tipo_operacao':
      if (estado.tipo_operacao === 'IMPORTACAO') {
        return 'Você selecionou **Importação**: cotações de frete de importação. Orienta validações de origem e destino nos passos seguintes.'
      }
      if (estado.tipo_operacao === 'EXPORTACAO') {
        return 'Você selecionou **Exportação**: cotações de exportação. Orienta validações de origem e destino nos passos seguintes.'
      }
      return ''
    case 'modal_frete':
      if (estado.modal_frete === 'MARITIMO') {
        return 'Você selecionou **Marítimo**: alto volume, menor custo. Na sequência, escolha **FCL** ou **LCL** em Modalidade.'
      }
      if (estado.modal_frete === 'AEREO') {
        return 'Você selecionou **Aéreo**: entrega rápida e expressa. O bloco **Modalidade** não aparece neste passo (diferente de Marítimo e Rodoviário).'
      }
      if (estado.modal_frete === 'RODOVIARIO') {
        return 'Você selecionou **Rodoviário**: flexível e porta a porta. Na sequência, escolha **FTL** ou **LTL** em Modalidade.'
      }
      return ''
    case 'modalidade':
      if (estado.modalidade === 'FCL') {
        return 'Você selecionou **FCL (Container Completo)**. Container exclusivo para suas mercadorias; indicado para volumes que preenchem um container inteiro.'
      }
      if (estado.modalidade === 'LCL') {
        return 'Você selecionou **LCL (Carga Fracionada)**. Compartilha espaço no container com outras cargas; indicado para volumes menores.'
      }
      if (estado.modalidade === 'FTL') {
        return 'Você selecionou **FTL (Carga Completa)**. Veículo dedicado à sua carga, porta a porta.'
      }
      if (estado.modalidade === 'LTL') {
        return 'Você selecionou **LTL (Carga Fracionada)**. Compartilha o veículo com outras cargas; indicado para volumes menores.'
      }
      return ''
    case 'carga_perigosa':
      return estado.carga_perigosa
        ? '**Carga perigosa** marcada: mercadoria classificada **ONU** (IMDG / ADR / IATA DGR). Informe o **número ONU** no passo **Carga e Incoterm**.'
        : '**Carga perigosa** desmarcada: use quando a mercadoria **não** é classificada ONU. Se precisar marcar depois, alterne esta opção.'
    default:
      return ''
  }
}

/** Paridade com canNext() — passo «modal» do wizard real. */
function podeAvancarPassoModalOperacao(estado: EstadoSimulador): boolean {
  if (!estado.numero_cotacao.trim()) return false
  if (!estado.tipo_operacao || !estado.modal_frete) return false
  if (estado.modal_frete === 'AEREO') return true
  return !!estado.modalidade
}

type CampoGuiaUnificadoId =
  | CampoModalOperacaoId
  | CampoOrigemDestinoId
  | CampoCargaIncotermId
  | CampoVisibilidadeId

const CAMPOS_GUIA_UNIFICADO: CampoGuiaAoVivo<CampoGuiaUnificadoId>[] = [
  ...CAMPOS_MODAL_OPERACAO_BID_FRETE,
  ...CAMPOS_ORIGEM_DESTINO_BID_FRETE.map((campo) => ({
    ...campo,
    num: String(Number(campo.num) + 5).padStart(2, '0'),
  })),
  ...CAMPOS_CARGA_INCOTERM_BID_FRETE.map((campo) => ({
    ...campo,
    num: String(Number(campo.num) + 11).padStart(2, '0'),
  })),
  ...CAMPOS_VISIBILIDADE_BID_FRETE.map((campo) => ({
    ...campo,
    num: String(Number(campo.num) + 19).padStart(2, '0'),
  })),
]

const IDS_MODAL = ORDEM_CAMPOS_GUIA as string[]
const IDS_ORIGEM = CAMPOS_ORIGEM_DESTINO_BID_FRETE.map((c) => c.id) as string[]
const IDS_CARGA = CAMPOS_CARGA_INCOTERM_BID_FRETE.map((c) => c.id) as string[]
const IDS_VISIBILIDADE = CAMPOS_VISIBILIDADE_BID_FRETE.map((c) => c.id) as string[]

type AffordanceAlvoPassoModal = 'tipo_operacao' | 'modal_frete' | 'modalidade' | 'carga_perigosa'

function resolverAffordancePassoModal(
  interagiu: Partial<Record<CampoModalOperacaoId, boolean>>,
  exibirModalidade: boolean,
): AffordanceAlvoPassoModal | null {
  if (!interagiu.tipo_operacao) return 'tipo_operacao'
  if (!interagiu.modal_frete) return 'modal_frete'
  if (exibirModalidade && !interagiu.modalidade) return 'modalidade'
  if (!interagiu.carga_perigosa) return 'carga_perigosa'
  return null
}

/** Convite inicial da demo — desliga ao primeiro preenchimento ou passo > 1. */
function usuarioPreenchendoSimuladorNovaCotacao({
  passoAtual,
  selecoesGuiaCount,
  interagiuModal,
  interagiuLocais,
  interagiuCarga,
  interagiuVisibilidade,
}: {
  passoAtual: number
  selecoesGuiaCount: number
  interagiuModal: Partial<Record<CampoModalOperacaoId, boolean>>
  interagiuLocais: Partial<Record<CampoOrigemDestinoId, boolean>>
  interagiuCarga: Partial<Record<CampoCargaIncotermId, boolean>>
  interagiuVisibilidade: Partial<Record<CampoVisibilidadeId, boolean>>
}): boolean {
  if (passoAtual > 1) return true
  if (selecoesGuiaCount > 0) return true
  return (
    Object.keys(interagiuModal).length > 0
    || Object.keys(interagiuLocais).length > 0
    || Object.keys(interagiuCarga).length > 0
    || Object.keys(interagiuVisibilidade).length > 0
  )
}

/** Manual BID Frete §4.02.01 — wizard unificado (Modal → Origem → Carga) com guia preservado. */
export function ManualBidFreteSimuladorModalOperacao() {
  const [passoAtual, setPassoAtual] = useState(1)
  const [estado, setEstado] = useState<EstadoSimulador>(criarEstadoModalInicial)
  const [estadoLocais, setEstadoLocais] = useState<EstadoOrigemDestino>(criarEstadoLocaisInicial)
  const [estadoCarga, setEstadoCarga] = useState<EstadoCargaIncoterm>(criarEstadoCargaInicial)
  const [estadoVisibilidade, setEstadoVisibilidade] = useState<EstadoVisibilidade>(criarEstadoVisibilidadeInicial)
  const [estadoArmazenagem, setEstadoArmazenagem] = useState<EstadoArmazenagem>(criarEstadoArmazenagemInicial)
  const [foco, setFoco] = useState<CampoGuiaUnificadoId | null>(null)
  const [interagiuModal, setInteragiuModal] = useState<Partial<Record<CampoFoco, boolean>>>({})
  const [interagiuLocais, setInteragiuLocais] = useState<Partial<Record<CampoOrigemDestinoId, boolean>>>({})
  const [interagiuCarga, setInteragiuCarga] = useState<Partial<Record<CampoCargaIncotermId, boolean>>>({})
  const [interagiuVisibilidade, setInteragiuVisibilidade] = useState<
    Partial<Record<CampoVisibilidadeId, boolean>>
  >({})
  const [cotacaoCriadaSimulacao, setCotacaoCriadaSimulacao] = useState(false)
  const [chaveSimulacao, setChaveSimulacao] = useState(0)

  const reiniciarSimulacao = () => {
    setPassoAtual(1)
    setEstado(criarEstadoModalInicial())
    setEstadoLocais(criarEstadoLocaisInicial())
    setEstadoCarga(criarEstadoCargaInicial())
    setEstadoVisibilidade(criarEstadoVisibilidadeInicial())
    setEstadoArmazenagem(criarEstadoArmazenagemInicial())
    setFoco(null)
    setInteragiuModal({})
    setInteragiuLocais({})
    setInteragiuCarga({})
    setInteragiuVisibilidade({})
    setCotacaoCriadaSimulacao(false)
    setChaveSimulacao((prev) => prev + 1)
  }

  const passosWizard = useMemo(
    () => montarPassosWizard(estado.modal_frete, estado.modalidade),
    [estado.modal_frete, estado.modalidade],
  )
  const totalPassos = passosWizard.length
  const tipoPassoAtual = tipoPassoWizardNovaCotacao(
    passoAtual,
    estado.modal_frete,
    estado.modalidade,
  )

  useEffect(() => {
    if (passoAtual > totalPassos) {
      setPassoAtual(totalPassos)
    }
  }, [passoAtual, totalPassos])

  useEffect(() => {
    if (!ehMaritimoLclCotacaoBidFreteInternacional(estado.modal_frete, estado.modalidade)) {
      setEstadoArmazenagem(criarEstadoArmazenagemInicial())
    }
  }, [estado.modal_frete, estado.modalidade])

  const contextoCarga = useMemo(
    () => ({
      modal_frete: estado.modal_frete,
      modalidade: estado.modalidade,
      carga_perigosa: estado.carga_perigosa,
    }),
    [estado.modal_frete, estado.modalidade, estado.carga_perigosa],
  )

  const marcarInteracaoModal = (campo: CampoFoco) => {
    setInteragiuModal((prev) => ({ ...prev, [campo]: true }))
    setFoco(campo)
  }

  const marcarInteracaoLocal = (campo: CampoOrigemDestinoId) => {
    setInteragiuLocais((prev) => ({ ...prev, [campo]: true }))
    setFoco(campo)
  }

  const marcarInteracaoCarga = (campo: CampoCargaIncotermId) => {
    setInteragiuCarga((prev) => ({ ...prev, [campo]: true }))
    setFoco(campo)
  }

  const marcarInteracaoVisibilidade = (campo: CampoVisibilidadeId) => {
    setInteragiuVisibilidade((prev) => ({ ...prev, [campo]: true }))
    setFoco(campo)
  }

  const atualizarLado = (lado: LadoLocal, parcial: Partial<EstadoOrigemDestino[LadoLocal]>) => {
    setEstadoLocais((prev) => ({ ...prev, [lado]: { ...prev[lado], ...parcial } }))
  }

  const selecoesModal = useMemo(
    () => resolverSelecoesPreenchidas(estado, interagiuModal),
    [estado, interagiuModal],
  )
  const selecoesLocais = useMemo(
    () => resolverSelecoesOrigemDestino(estadoLocais, interagiuLocais, estado.modal_frete),
    [estadoLocais, interagiuLocais, estado.modal_frete],
  )
  const selecoesCarga = useMemo(
    () => resolverSelecoesCargaIncoterm(estadoCarga, interagiuCarga, contextoCarga),
    [estadoCarga, interagiuCarga, contextoCarga],
  )
  const selecoesVisibilidade = useMemo(
    () => resolverSelecoesVisibilidade(estadoVisibilidade, interagiuVisibilidade),
    [estadoVisibilidade, interagiuVisibilidade],
  )
  const selecoesGuia = useMemo(
    () => [
      ...selecoesModal.map((s) => ({ id: s.id as CampoGuiaUnificadoId, valor: s.valor })),
      ...selecoesLocais.map((s) => ({ id: s.id as CampoGuiaUnificadoId, valor: s.valor })),
      ...selecoesCarga.map((s) => ({ id: s.id as CampoGuiaUnificadoId, valor: s.valor })),
      ...selecoesVisibilidade.map((s) => ({ id: s.id as CampoGuiaUnificadoId, valor: s.valor })),
    ],
    [selecoesModal, selecoesLocais, selecoesCarga, selecoesVisibilidade],
  )

  const campoGuiaAtivo = useMemo((): CampoGuiaUnificadoId | null => {
    if (!foco) return null
    if (!selecoesGuia.some((s) => s.id === foco)) return null
    return foco
  }, [foco, selecoesGuia])

  const explicacao = useMemo(() => {
    if (!campoGuiaAtivo) return ''
    if (IDS_MODAL.includes(campoGuiaAtivo)) {
      return resolverExplicacao(estado, campoGuiaAtivo as CampoFoco)
    }
    if (IDS_ORIGEM.includes(campoGuiaAtivo)) {
      return resolverExplicacaoOrigemDestino(
        estadoLocais,
        campoGuiaAtivo as CampoOrigemDestinoId,
        estado.modal_frete,
      )
    }
    if (IDS_CARGA.includes(campoGuiaAtivo)) {
      return resolverExplicacaoCargaIncoterm(
        estadoCarga,
        campoGuiaAtivo as CampoCargaIncotermId,
        contextoCarga,
      )
    }
    if (IDS_VISIBILIDADE.includes(campoGuiaAtivo)) {
      return resolverExplicacaoVisibilidade(
        estadoVisibilidade,
        campoGuiaAtivo as CampoVisibilidadeId,
      )
    }
    return ''
  }, [campoGuiaAtivo, estado, estadoLocais, estadoCarga, contextoCarga, estadoVisibilidade])

  const exibirModalidade = estado.modal_frete !== 'AEREO' && estado.modal_frete !== ''

  const podeAvancar = useMemo(() => {
    if (cotacaoCriadaSimulacao) return false
    switch (tipoPassoAtual) {
      case 'modal':
        return podeAvancarPassoModalOperacao(estado)
      case 'origem':
        return podeAvancarPassoOrigemDestino(estadoLocais, estado.modal_frete)
      case 'carga':
        return podeAvancarPassoCargaIncoterm(estadoCarga, contextoCarga)
      case 'armazenagem':
        return podeAvancarPassoArmazenagem(estadoArmazenagem)
      case 'fornecedores':
        return podeAvancarPassoVisibilidade(estadoVisibilidade)
      case 'resumo':
        return true
      default:
        return false
    }
  }, [
    tipoPassoAtual,
    estado,
    estadoLocais,
    estadoCarga,
    contextoCarga,
    estadoArmazenagem,
    estadoVisibilidade,
    cotacaoCriadaSimulacao,
  ])

  const podeVoltar = passoAtual > 1

  const affordancePassoModal = useMemo(
    () => (tipoPassoAtual === 'modal'
      ? resolverAffordancePassoModal(interagiuModal, exibirModalidade)
      : null),
    [tipoPassoAtual, interagiuModal, exibirModalidade],
  )
  const usuarioPreenchendo = usuarioPreenchendoSimuladorNovaCotacao({
    passoAtual,
    selecoesGuiaCount: selecoesGuia.length,
    interagiuModal,
    interagiuLocais,
    interagiuCarga,
    interagiuVisibilidade,
  })
  const demoConviteAtiva = !cotacaoCriadaSimulacao && !usuarioPreenchendo

  return (
    <div id="sim-bid-frete-modal-operacao" style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
      <FaixaDemoInterativaBidFrete
        mensagem={
          affordancePassoModal === 'tipo_operacao'
            ? 'Demo interativa: comece escolhendo o tipo de operação'
            : 'Demo interativa: preencha os campos; o guia à direita registra cada escolha'
        }
        visivel={demoConviteAtiva}
      />
      <style>{NC_ESTILOS_SIMULADOR_MODAL_OPERACAO}</style>
      <style>{NC_ESTILOS_SIMULADOR_ORIGEM_DESTINO}</style>
      <style>{NC_ESTILOS_SIMULADOR_CARGA_INCOTERM}</style>
      <style>{NC_ESTILOS_AFFORDANCE_INTERATIVO_BID_FRETE}</style>
      <div className="sim-modal-operacao-layout">
        <div>
          <ManualBidFreteSimuladorWizardEmbutido
            titulo="Nova Cotação de Frete Internacional"
            subtitulo="Preencha os dados para solicitar cotações de frete"
            icone={<Truck weight="duotone" size={22} />}
            passos={passosWizard}
            passoAtual={passoAtual}
            larguraTotal
            classNameShell={demoConviteAtiva ? 'sim-wizard-embutido--vivo' : undefined}
            podeAvancar={podeAvancar}
            podeVoltar={podeVoltar}
            rotuloAvancar={tipoPassoAtual === 'resumo' ? 'Criar Cotação' : 'Próximo'}
            onAvancar={() => {
              if (tipoPassoAtual !== 'resumo') {
                setPassoAtual((prev) => prev + 1)
                return
              }
              setCotacaoCriadaSimulacao(true)
            }}
            onVoltar={() => {
              if (passoAtual > 1) {
                setCotacaoCriadaSimulacao(false)
                setPassoAtual((prev) => prev - 1)
              }
            }}
            footerCustom={cotacaoCriadaSimulacao ? (
              <div className="sim-wizard-embutido__footer sim-wizard-embutido__footer--acoes">
                <BotaoGlobal variante="primario" tamanho="padrao" onClick={reiniciarSimulacao}>
                  Fazer nova simulação
                </BotaoGlobal>
              </div>
            ) : undefined}
          >
            {tipoPassoAtual === 'modal' ? (
              <div className="nc-root nc-step-wrapper nc-fade-in">
                <div className="nc-step-content">
                  <SimuladorNcField label="Nº da cotação" icone={<Hash {...ICONE_FIELD} />}>
                    <input
                      type="text"
                      className="nc-input"
                      value={estado.numero_cotacao}
                      onFocus={() => {
                        setInteragiuModal((prev) => ({ ...prev, numero_cotacao: true }))
                        setFoco('numero_cotacao')
                      }}
                      onBlur={() => {
                        setFoco((prev) => (prev === 'numero_cotacao' ? null : prev))
                      }}
                      onChange={(e) => {
                        setEstado((prev) => ({ ...prev, numero_cotacao: e.target.value }))
                        marcarInteracaoModal('numero_cotacao')
                      }}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <span className="nc-field-hint">
                      Gerado automaticamente; você pode personalizar antes de criar
                    </span>
                  </SimuladorNcField>

                  <SimuladorNcSectionTitle icone={<GlobeHemisphereWest {...ICONE_LABEL_SECAO} />} obrigatorio>
                    Tipo de operação
                  </SimuladorNcSectionTitle>
                  <div className="nc-options-grid-2">
                    <WrapperAlvoAffordanceBidFrete
                      destacado={demoConviteAtiva && affordancePassoModal === 'tipo_operacao'}
                      rotuloClique="Importação"
                      varianteCursor="compacto"
                    >
                      <SimuladorNcOptionButton
                        selected={estado.tipo_operacao === 'IMPORTACAO'}
                        onClick={() => {
                          setEstado((prev) => ({ ...prev, tipo_operacao: 'IMPORTACAO' }))
                          marcarInteracaoModal('tipo_operacao')
                        }}
                        icon={<DownloadSimple weight="duotone" size={24} />}
                        label="Importação"
                        description="Cotações de frete de importação"
                      />
                    </WrapperAlvoAffordanceBidFrete>
                    <SimuladorNcOptionButton
                      selected={estado.tipo_operacao === 'EXPORTACAO'}
                      onClick={() => {
                        setEstado((prev) => ({ ...prev, tipo_operacao: 'EXPORTACAO' }))
                        marcarInteracaoModal('tipo_operacao')
                      }}
                      icon={<Export weight="duotone" size={24} />}
                      label="Exportação"
                      description="Cotações de exportação"
                    />
                  </div>

                  <SimuladorNcSectionTitle icone={<ShippingContainer {...ICONE_LABEL_SECAO} />} obrigatorio>
                    Modal de frete
                  </SimuladorNcSectionTitle>
                  <div className="nc-options-grid-3">
                    <WrapperAlvoAffordanceBidFrete
                      destacado={demoConviteAtiva && affordancePassoModal === 'modal_frete'}
                      rotuloClique="Marítimo"
                      varianteCursor="compacto"
                    >
                      <SimuladorNcOptionButton
                        selected={estado.modal_frete === 'MARITIMO'}
                        onClick={() => {
                          const mudou = estado.modal_frete !== 'MARITIMO'
                          setEstado((prev) => ({ ...prev, modal_frete: 'MARITIMO', modalidade: '' }))
                          if (mudou) {
                            setEstadoLocais({
                              origem: { ...ESTADO_LADO_ORIGEM_DESTINO_INICIAL },
                              destino: { ...ESTADO_LADO_ORIGEM_DESTINO_INICIAL },
                            })
                            setInteragiuLocais({})
                          }
                          marcarInteracaoModal('modal_frete')
                        }}
                        icon={<Anchor weight="duotone" size={24} />}
                        label="Marítimo"
                        description="Alto volume, menor custo"
                      />
                    </WrapperAlvoAffordanceBidFrete>
                    <SimuladorNcOptionButton
                      selected={estado.modal_frete === 'AEREO'}
                      onClick={() => {
                        const mudou = estado.modal_frete !== 'AEREO'
                        setEstado((prev) => ({ ...prev, modal_frete: 'AEREO', modalidade: '' }))
                        if (mudou) {
                          setEstadoLocais({
                            origem: { ...ESTADO_LADO_ORIGEM_DESTINO_INICIAL },
                            destino: { ...ESTADO_LADO_ORIGEM_DESTINO_INICIAL },
                          })
                          setInteragiuLocais({})
                        }
                        marcarInteracaoModal('modal_frete')
                      }}
                      icon={<AirplaneTilt weight="duotone" size={24} />}
                      label="Aéreo"
                      description="Entrega rápida e expressa"
                    />
                    <SimuladorNcOptionButton
                      selected={estado.modal_frete === 'RODOVIARIO'}
                      onClick={() => {
                        const mudou = estado.modal_frete !== 'RODOVIARIO'
                        setEstado((prev) => ({ ...prev, modal_frete: 'RODOVIARIO', modalidade: '' }))
                        if (mudou) {
                          setEstadoLocais({
                            origem: { ...ESTADO_LADO_ORIGEM_DESTINO_INICIAL },
                            destino: { ...ESTADO_LADO_ORIGEM_DESTINO_INICIAL },
                          })
                          setInteragiuLocais({})
                        }
                        marcarInteracaoModal('modal_frete')
                      }}
                      icon={<Truck weight="duotone" size={24} />}
                      label="Rodoviário"
                      description="Flexível e porta a porta"
                    />
                  </div>

                  {exibirModalidade ? (
                    <>
                      <SimuladorNcSectionTitle icone={<SquaresFour {...ICONE_LABEL_SECAO} />} obrigatorio>
                        Modalidade
                      </SimuladorNcSectionTitle>
                      <div className="nc-options-grid-2">
                        {!estado.modal_frete ? (
                          <div className="nc-empty-hint">
                            <Info size={18} weight="duotone" />
                            <p>Selecione o modal primeiro</p>
                          </div>
                        ) : null}
                        {estado.modal_frete === 'MARITIMO' ? (
                          <>
                            <WrapperAlvoAffordanceBidFrete
                              destacado={demoConviteAtiva && affordancePassoModal === 'modalidade'}
                              rotuloClique="FCL"
                              varianteCursor="compacto"
                            >
                              <SimuladorNcOptionButton
                                selected={estado.modalidade === 'FCL'}
                                onClick={() => {
                                  setEstado((prev) => ({ ...prev, modalidade: 'FCL' }))
                                  marcarInteracaoModal('modalidade')
                                }}
                                icon={<Package weight="duotone" size={22} />}
                                label="FCL (Container Completo)"
                                description="Container completo e exclusivo para acomodar suas mercadorias."
                              />
                            </WrapperAlvoAffordanceBidFrete>
                            <SimuladorNcOptionButton
                              selected={estado.modalidade === 'LCL'}
                              onClick={() => {
                                setEstado((prev) => ({ ...prev, modalidade: 'LCL' }))
                                marcarInteracaoModal('modalidade')
                              }}
                              icon={<Scales weight="duotone" size={22} />}
                              label="LCL (Carga Fracionada)"
                              description="Compartilha espaço no container com outras cargas."
                            />
                          </>
                        ) : null}
                        {estado.modal_frete === 'RODOVIARIO' ? (
                          <>
                            <SimuladorNcOptionButton
                              selected={estado.modalidade === 'FTL'}
                              onClick={() => {
                                setEstado((prev) => ({ ...prev, modalidade: 'FTL' }))
                                marcarInteracaoModal('modalidade')
                              }}
                              icon={<Van weight="duotone" size={22} />}
                              label="FTL (Carga Completa)"
                              description="Veículo dedicado à sua carga, porta a porta."
                            />
                            <SimuladorNcOptionButton
                              selected={estado.modalidade === 'LTL'}
                              onClick={() => {
                                setEstado((prev) => ({ ...prev, modalidade: 'LTL' }))
                                marcarInteracaoModal('modalidade')
                              }}
                              icon={<Van weight="duotone" size={22} />}
                              label="LTL (Carga Fracionada)"
                              description="Compartilha o veículo com outras cargas."
                            />
                          </>
                        ) : null}
                      </div>
                    </>
                  ) : null}

                  <SimuladorNcSectionTitle icone={<Warning {...ICONE_LABEL_SECAO} />}>
                    Carga perigosa
                  </SimuladorNcSectionTitle>
                  <div className="nc-options-grid-full">
                    <WrapperAlvoAffordanceBidFrete
                      destacado={demoConviteAtiva && affordancePassoModal === 'carga_perigosa'}
                      rotuloClique="Opcional"
                      varianteCursor="compacto"
                    >
                      <SimuladorNcOptionButton
                        selected={estado.carga_perigosa}
                        onClick={() => {
                          const marcada = !estado.carga_perigosa
                          setEstado((prev) => ({ ...prev, carga_perigosa: marcada }))
                          marcarInteracaoModal('carga_perigosa')
                        }}
                        icon={<Warning weight="duotone" size={22} />}
                        label="Carga Perigosa"
                        description="Mercadoria classificada ONU (IMDG / ADR / IATA DGR). Informe o número ONU no passo Carga."
                      />
                    </WrapperAlvoAffordanceBidFrete>
                  </div>
                </div>
              </div>
            ) : tipoPassoAtual === 'origem' ? (
              <ConteudoPassoOrigemDestinoSimulador
                estado={estadoLocais}
                modalFrete={estado.modal_frete}
                aoAtualizarLado={atualizarLado}
                aoInteragir={marcarInteracaoLocal}
                aoDesligarCampo={(campo) => setFoco((prev) => (prev === campo ? null : prev))}
              />
            ) : tipoPassoAtual === 'carga' ? (
              <ConteudoPassoCargaIncotermSimulador
                estado={estadoCarga}
                contexto={contextoCarga}
                aoAtualizar={(parcial) => setEstadoCarga((prev) => ({ ...prev, ...parcial }))}
                aoInteragir={marcarInteracaoCarga}
                aoDesligarCampo={(campo) => setFoco((prev) => (prev === campo ? null : prev))}
              />
            ) : tipoPassoAtual === 'armazenagem' ? (
              <ConteudoPassoArmazenagemSimulador
                estado={estadoArmazenagem}
                aoAtualizar={(parcial) => setEstadoArmazenagem((prev) => ({ ...prev, ...parcial }))}
              />
            ) : tipoPassoAtual === 'fornecedores' ? (
              <ConteudoPassoVisibilidadeSimulador
                key={`visibilidade-${chaveSimulacao}`}
                estado={estadoVisibilidade}
                aoAtualizar={(parcial) => setEstadoVisibilidade((prev) => ({ ...prev, ...parcial }))}
                aoInteragir={marcarInteracaoVisibilidade}
                aoDesligarCampo={(campo) => setFoco((prev) => (prev === campo ? null : prev))}
              />
            ) : (
              <ConteudoPassoResumoSimulador
                modalOperacao={estado}
                locais={estadoLocais}
                carga={estadoCarga}
                contextoCarga={contextoCarga}
                visibilidade={estadoVisibilidade}
                armazenagem={
                  ehMaritimoLclCotacaoBidFreteInternacional(estado.modal_frete, estado.modalidade)
                    ? estadoArmazenagem
                    : undefined
                }
                sucesso={cotacaoCriadaSimulacao}
              />
            )}
          </ManualBidFreteSimuladorWizardEmbutido>
        </div>

        <ManualBidFreteGuiaAoVivo
          campos={CAMPOS_GUIA_UNIFICADO}
          selecoes={selecoesGuia}
          campoAtivo={campoGuiaAtivo}
          textoContextual={explicacao}
          contextoSimulador={{
            tipo_operacao: estado.tipo_operacao,
            modal_frete: estado.modal_frete,
            modalidade: estado.modalidade,
          }}
          onSelecionarCampo={(id) => setFoco((prev) => (prev === id ? null : id))}
          conviteInterativo={demoConviteAtiva}
        />
      </div>
    </div>
  )
}
