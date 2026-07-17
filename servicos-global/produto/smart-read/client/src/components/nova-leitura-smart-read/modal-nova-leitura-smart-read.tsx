/**

 * modal-nova-leitura-smart-read.tsx — Wizard Nova Leitura (4 passos)

 * Padrão ModalPassoPassoGlobal (Pedido Transferir) + layout legado dati.

 */



import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkle } from '@phosphor-icons/react'

import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import { NOME_PRODUTO_EXIBICAO, iconeMarcaSmartDocs } from '../../shared/marca-smart-docs'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'

import type { PassoConfig } from '@nucleo/modal-passo-passo-global'

import { smartReadApi } from '../../shared/api'
import { useShellStore } from '@gravity/shell'

import { mensagemDeExcecao } from '../../shared/extrair-mensagem-erro-api'

import {
  criarArquivoLocalNovaLeitura,
  criarArquivosLocaisDeLeitura,
  arquivoLocalTemBlobVisualizavel,
  consolidarLeituraDeArquivosLocais,
  aplicarLeituraApiNosArquivosLocais,
  todosArquivosAnaliseCompleta,
  algumArquivoEmAnalise,
  todosArquivosProcessamentoFinalizado,
  pollAtualizacaoArquivoEquivalente,

  type ArquivoLocalNovaLeitura,

} from '../../shared/tipo-arquivo-nova-leitura-smart-read'

import {
  carregarProgressoLeituraSmartRead,
  hidratarCacheAnaliseRiscosDeProgresso,
  limparEstadoLeituraSmartRead,
  persistirProgressoLeituraSmartRead,
  persistirProgressoLeituraUrgenteSmartRead,
  type EstadoSalvoLeitura,
} from '../../shared/persistencia-leitura-smart-read'
import {
  diagnosticarEstadoProgressoLeituraSmartRead,
  montarEstadoProgressoLeituraSmartRead,
  type MotivoEstadoProgressoNaoMontavelSmartRead,
} from '../../shared/montar-estado-progresso-leitura-smart-read'
import type { Leitura } from '../../shared/schemas'
import { resolverPassoRetomarLeituraSmartRead } from '../../../../shared/resolver-passo-retomar-leitura-smart-read.js'
import {
  escolherLeituraEfetivaRetomarSmartRead,
} from '../../../../shared/escolher-leitura-efetiva-retomar-smart-read.js'
import {
  leituraTemExtracaoUtilRetomarSmartRead,
} from '../../../../shared/leitura-sem-extracao-retomar-smart-read.js'
import {
  resolverTempoProcessoTotalMsLeituraSmartRead,
} from '../../../../shared/aplicar-tempo-processo-total-leitura-smart-read.js'
import {
  reconstruirIndiceCamposEditadosDeArquivosLocaisLeituraSmartRead,
} from '../../../../shared/reconstruir-indice-campos-editados-leitura-smart-read.js'

import {
  carregarBlobArquivoLeituraSmartRead,
  removerBlobArquivoLeituraSmartRead,
  resolverArquivoOriginalLeituraSmartRead,
  salvarBlobArquivoLeituraSmartRead,
} from '../../shared/persistencia-blob-arquivo-leitura-smart-read'
import {
  obterArquivoSessaoLeituraSmartRead,
  registrarArquivoSessaoLeituraSmartRead,
} from '../../shared/cache-sessao-arquivo-leitura-smart-read'

import { abrirArquivoLeituraNovaAbaSmartRead } from '../../shared/abrir-arquivo-leitura-nova-aba-smart-read'

import {
  definirValorPorCaminho,
  montarChaveCampoEditadoLeitura,
} from '../../shared/definir-valor-por-caminho-dados-leitura-smart-read'

import { PainelLateralArquivosNovaLeituraSmartRead } from './painel-lateral-arquivos-nova-leitura-smart-read'
import { useContadorTokensLeituraSmartRead } from '../../shared/use-contador-tokens-leitura-smart-read'
import { limparCacheAnaliseRiscosSessaoSmartRead } from '../../shared/cache-analise-riscos-sessao-smart-read'
import {
  dispararAnaliseRiscosBackgroundSmartRead,
  limparRequisicoesAnaliseRiscosEmVooSmartRead,
} from '../../shared/disparar-analise-riscos-background-smart-read'

import { AreaAnexarNovaLeituraSmartRead } from './area-anexar-nova-leitura-smart-read'

import { DashboardAnaliseNovaLeituraSmartRead } from './dashboard-analise-nova-leitura-smart-read'

import { AreaConferenciaNovaLeituraSmartRead, type SelecaoDocumentoConferencia } from './area-conferencia-nova-leitura-smart-read'

import { ModalCompararArquivoConferenciaSmartRead } from './modal-comparar-arquivo-conferencia-smart-read'

import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'

import { AreaResultadoNovaLeituraSmartRead } from './area-resultado-nova-leitura-smart-read'
import type { PayloadContinuarPrefillCotacaoBidFreteSmartRead } from './painel-revisao-prefill-cotacao-bid-frete-smart-read'
import { buildUrlNovaCotacaoPrefillSmartReadBidFreteInternacional } from '../../shared/navegacao-cotacao-bid-frete-smart-read'
import {
  montarPacotePrefillCotacaoBidFreteSmartRead,
  salvarPrefillCotacaoBidFreteSmartRead,
} from '../../shared/persistencia-prefill-cotacao-bid-frete-smart-read'
import type { HintRetomarLeituraListaSmartRead } from '../../../../shared/hint-retomar-leitura-lista-smart-read.js'

import '../../../../../../configurador/src/pages/configurador/gabi.css'
import './modal-nova-leitura-smart-read.css'

const GabiChat = lazy(() => import('@plataforma/gabi/src/Gabi'))
const PainelRevisaoPrefillCotacaoBidFreteSmartRead = lazy(
  () =>
    import('./painel-revisao-prefill-cotacao-bid-frete-smart-read')
      .then((mod) => ({
        default: mod.PainelRevisaoPrefillCotacaoBidFreteSmartRead,
      }))
      .catch((erro) => {
        console.error('[smart-read] falha ao carregar painel prefill BID Frete', erro)
        return {
          default: function PainelPrefillIndisponivel() {
            return (
              <p className="sr-prefill-bid-revisao-aviso" role="alert">
                Não foi possível carregar a revisão para cotação. Recarregue a página ou abra
                novamente pelo BID Frete → Smart Docs.
              </p>
            )
          },
        }
      }),
)


const INTERVALO_POLLING_MS = 2000

const LIMITE_POLLING_MS = 5 * 60 * 1000

const LIMITE_SINCRONIZAR_EXTRACAO_CONTINUAR_MS = 15_000

function mensagemNotificacaoEstadoProgressoNaoMontavel(
  motivo: MotivoEstadoProgressoNaoMontavelSmartRead,
): { title: string; message: string } {
  switch (motivo) {
    case 'sem_extracao':
      return {
        title: 'Análise ainda sincronizando',
        message:
          'Os dados extraídos ainda não chegaram ao navegador. Aguarde alguns segundos e toque em Continuar novamente.',
      }
    case 'analise_incompleta':
      return {
        title: 'Análise em andamento',
        message: 'Aguarde todos os arquivos concluírem a análise antes de continuar.',
      }
    case 'sem_arquivos':
      return {
        title: 'Nenhum arquivo para conferir',
        message: 'Envie ao menos um arquivo válido antes de avançar.',
      }
    case 'sem_id_leitura':
      return {
        title: 'Leitura não iniciada',
        message: 'A leitura ainda não foi criada. Volte ao passo anterior e envie os arquivos.',
      }
    default:
      return {
        title: 'Não foi possível avançar',
        message: 'O progresso não pôde ser salvo. Tente novamente em instantes.',
      }
  }
}



const ICONE_MARCA_CABECALHO = iconeMarcaSmartDocs(22)

const PASSOS: PassoConfig[] = [

  { id: 1, label: 'Anexar arquivo' },

  { id: 2, label: 'Análise do arquivo' },

  { id: 3, label: 'Conferência' },

  { id: 4, label: 'Resultado das leituras' },

]



type Props = {

  aberto: boolean

  arquivosIniciais?: File[]

  /** Quando informado, abre uma leitura existente no passo atual (modo "retomar"). */
  idLeituraExistente?: string | null

  /** Passo vindo da Lista (status_fluxo) — placeholder até hidratar progresso. */
  passoRetomarLista?: number | null

  /** Metadados da linha da Lista (nome/total) para placeholders na retomada. */
  hintRetomarLista?: HintRetomarLeituraListaSmartRead | null

  onFechar: () => void

  onConcluido?: () => void

  /** Quando true (redirect do Pedido), dispara criação de pedido ao concluir passo 4. */
  origemPedido?: boolean

  /** Quando true (redirect do BID Frete), revisão DE/PARA e abre Nova Cotação no passo Fornecedores. */
  origemBidFrete?: boolean

  /** BID vinculado quando o fluxo veio de Novo → BID → Smart Docs. */
  idBidOrigem?: string | null

}



function gerarNomeLeitura(): string {

  const sequencia = Math.floor(100 + Math.random() * 900)

  return `Leitura ${sequencia}`

}



export function ModalNovaLeituraSmartRead({

  aberto,

  arquivosIniciais = [],

  idLeituraExistente = null,

  passoRetomarLista = null,

  hintRetomarLista = null,

  onFechar,

  onConcluido,

  origemPedido = false,

  origemBidFrete = false,

  idBidOrigem = null,

}: Props) {
  void hintRetomarLista

  const addNotification = useShellStore((s) => s.addNotification)

  const [passo, setPasso] = useState(1)

  const [nomeLeitura, setNomeLeitura] = useState(gerarNomeLeitura)

  const [arquivos, setArquivos] = useState<ArquivoLocalNovaLeitura[]>([])

  const [chaveSessaoTokens, setChaveSessaoTokens] = useState<string | null>(null)

  const idLeituraAtual = useMemo(
    () => idLeituraExistente ?? arquivos.find((a) => a.id_leitura)?.id_leitura ?? null,
    [arquivos, idLeituraExistente],
  )

  const analiseCompleta = useMemo(() => todosArquivosAnaliseCompleta(arquivos), [arquivos])
  const processamentoFinalizado = useMemo(
    () => todosArquivosProcessamentoFinalizado(arquivos),
    [arquivos],
  )
  const processamentoComErro =
    processamentoFinalizado && !arquivos.some((item) => item.status_arquivo_local === 'completo')

  const contadorTokens = useContadorTokensLeituraSmartRead(idLeituraAtual, passo >= 2, {
    chaveSessao: chaveSessaoTokens,
    redeLiberada: analiseCompleta,
  })

  const contadorIaRef = useRef(contadorTokens)
  contadorIaRef.current = contadorTokens
  const riscosIniciadosRef = useRef<Set<string>>(new Set())

  const [enviando, setEnviando] = useState(false)
  const [salvandoPasso, setSalvandoPasso] = useState(false)
  const [redirecionandoCotacao, setRedirecionandoCotacao] = useState(false)

  const leituraConsolidada = useMemo(
    () => consolidarLeituraDeArquivosLocais(arquivos),
    [arquivos],
  )

  const extracaoEmAndamento = useMemo(
    () => passo >= 2 && !analiseCompleta && (enviando || algumArquivoEmAnalise(arquivos)),
    [passo, analiseCompleta, enviando, arquivos],
  )

  const [inicioAnalise, setInicioAnalise] = useState<number | null>(null)
  const [tempoAnaliseSegundos, setTempoAnaliseSegundos] = useState<number | null>(null)

  const [conferenciaSelecao, setConferenciaSelecao] = useState<SelecaoDocumentoConferencia | null>(null)
  const [passoConferenciaMontado, setPassoConferenciaMontado] = useState(false)

  const [compararAberto, setCompararAberto] = useState(false)

  const [camposEditados, setCamposEditados] = useState<Set<string>>(() => new Set())

  const contagemCamposEditados = useMemo(() => {
    const reconstruido = reconstruirIndiceCamposEditadosDeArquivosLocaisLeituraSmartRead(arquivos).size
    return Math.max(camposEditados.size, reconstruido)
  }, [arquivos, camposEditados])

  const [tempoTotalMs, setTempoTotalMs] = useState(0)
  const [arquivoExclusaoPendente, setArquivoExclusaoPendente] =
    useState<ArquivoLocalNovaLeitura | null>(null)
  const [gabiAberta, setGabiAberta] = useState(false)
  const [hidratandoRetomar, setHidratandoRetomar] = useState(false)
  const [recuperandoExtracaoRetomar, setRecuperandoExtracaoRetomar] = useState(false)

  const ativo = useRef(true)
  const urlsBlob = useRef<Map<string, string>>(new Map())
  const abertoAnteriorRef = useRef(false)
  const passoSalvoRef = useRef(0)
  const hidratandoRetomarRef = useRef(false)
  const recuperandoExtracaoRetomarRef = useRef(false)
  const idLeituraRetomarAnteriorRef = useRef<string | null>(null)
  const inicioSessaoRef = useRef<number>(Date.now())
  const tempoPersistidoMsRef = useRef(0)
  const salvarProgressoRef = useRef<(passoAlvo?: number) => Promise<boolean>>(async () => false)
  const salvarProgressoEdicaoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const estadoFlushRef = useRef<{ idLeitura: string; estado: EstadoSalvoLeitura } | null>(null)
  const prefillContinuarRef = useRef<{
    payload: PayloadContinuarPrefillCotacaoBidFreteSmartRead
    manterWizard: boolean
  } | null>(null)
  const controladorEnvioRef = useRef<AbortController | null>(null)
  const continuandoPassoRef = useRef(false)

  const resolverTempoProcessoTotalMsAtual = useCallback((): number => {
    return tempoPersistidoMsRef.current + (Date.now() - inicioSessaoRef.current)
  }, [])

  useEffect(() => {
    ativo.current = true
    return () => {
      ativo.current = false
      controladorEnvioRef.current?.abort()
      if (salvarProgressoEdicaoTimeoutRef.current) {
        clearTimeout(salvarProgressoEdicaoTimeoutRef.current)
      }
    }
  }, [])

  const aplicarLeituraHidratada = useCallback(
    async (id: string, leituraEfetiva: Leitura, salvo: EstadoSalvoLeitura | null) => {
      setNomeLeitura(salvo?.nome ?? leituraEfetiva.nome_leitura ?? 'Leitura')
      const locais = criarArquivosLocaisDeLeitura(leituraEfetiva)
      const hidratados = await Promise.all(
        locais.map(async (item) => {
          if (arquivoLocalTemBlobVisualizavel(item.arquivo)) return item
          const idLeitura = item.id_leitura ?? id
          const idArquivo = item.id_arquivo
          const nome = item.arquivo.name
          const daSessao = obterArquivoSessaoLeituraSmartRead(idLeitura, idArquivo, nome)
          const resolvido =
            daSessao ??
            (await resolverArquivoOriginalLeituraSmartRead(idLeitura, idArquivo, nome))
          if (!resolvido) return item
          if (idArquivo) {
            registrarArquivoSessaoLeituraSmartRead(idLeitura, resolvido, idArquivo)
          }
          return { ...item, arquivo: resolvido }
        }),
      )
      if (!ativo.current) return
      setArquivos(hidratados)
      const tempoMs = resolverTempoProcessoTotalMsLeituraSmartRead(leituraEfetiva, salvo?.leitura)
      tempoPersistidoMsRef.current = tempoMs ?? 0
      inicioSessaoRef.current = Date.now()
      if (tempoMs != null && tempoMs > 0) {
        setTempoTotalMs(tempoMs)
        setTempoAnaliseSegundos(Math.floor(tempoMs / 1000))
      }
      setCamposEditados(reconstruirIndiceCamposEditadosDeArquivosLocaisLeituraSmartRead(hidratados))
      const passoRetomar = resolverPassoRetomarLeituraSmartRead(
        leituraEfetiva.status_leitura,
        salvo?.passo ?? passoRetomarLista,
        { temExtracaoUtil: leituraTemExtracaoUtilRetomarSmartRead(leituraEfetiva) },
      )
      setPasso(passoRetomar)
      passoSalvoRef.current = passoRetomar >= 2 ? passoRetomar : 0
      if (passoRetomar >= 3) {
        setPassoConferenciaMontado(true)
        const primeiroCompleto = hidratados.find(
          (item) => item.status_arquivo_local === 'completo' && item.leitura,
        )
        if (primeiroCompleto) {
          setConferenciaSelecao({
            idArquivoLocal: primeiroCompleto.id_arquivo_local,
            indiceDocumento: 0,
          })
        }
      }
    },
    [passoRetomarLista],
  )

  const passoPlaceholderRetomar = useMemo(() => {
    if (typeof passoRetomarLista === 'number' && passoRetomarLista >= 2 && passoRetomarLista <= 4) {
      return passoRetomarLista
    }
    return 2
  }, [passoRetomarLista])

  const hidratarLeituraExistente = useCallback(
    async (id: string) => {
      hidratandoRetomarRef.current = true
      setHidratandoRetomar(true)
      try {
      const salvo = await carregarProgressoLeituraSmartRead(id)
      hidratarCacheAnaliseRiscosDeProgresso(salvo)
      if (import.meta.env.DEV) {
        console.warn('[smart-read][persist] retomar', { id, temSalvo: !!salvo, passoSalvo: salvo?.passo })
      }

      let leituraApi: Leitura | null = null
      try {
        leituraApi = await smartReadApi.obterLeitura(id)
      } catch (erro) {
        leituraApi = salvo?.leitura ?? null
        if (!leituraApi) {
          if (!ativo.current) return
          setArquivos([])
          setPasso(1)
          return
        }
        if (import.meta.env.DEV) {
          console.warn('[smart-read][persist] obterLeitura falhou — usando progresso salvo', erro)
        }
      }

      try {
        const leituraEfetiva = escolherLeituraEfetivaRetomarSmartRead(leituraApi, salvo?.leitura ?? null)
        if (!leituraEfetiva) {
          if (!ativo.current) return
          setArquivos([])
          setPasso(1)
          return
        }
        await aplicarLeituraHidratada(id, leituraEfetiva, salvo)
      } catch {
        if (!ativo.current) return
        if (salvo?.leitura) {
          await aplicarLeituraHidratada(id, salvo.leitura, salvo)
          return
        }
        setArquivos([])
        setPasso(1)
      }
      } finally {
        hidratandoRetomarRef.current = false
        setHidratandoRetomar(false)
      }
    },
    [aplicarLeituraHidratada],
  )

  const iniciarRetomarLeitura = useCallback(
    (id: string) => {
      setConferenciaSelecao(null)
      setCompararAberto(false)
      setPassoConferenciaMontado(passoPlaceholderRetomar >= 3)
      setArquivos([])
      passoSalvoRef.current = passoPlaceholderRetomar >= 2 ? passoPlaceholderRetomar : 0
      setPasso(passoPlaceholderRetomar)
      riscosIniciadosRef.current.delete(id)
      void hidratarLeituraExistente(id)
    },
    [passoPlaceholderRetomar, hidratarLeituraExistente],
  )

  useEffect(() => {
    if (aberto && !abertoAnteriorRef.current) {
      passoSalvoRef.current = 0
      setEnviando(false)
      setInicioAnalise(null)
      setConferenciaSelecao(null)
      setPassoConferenciaMontado(false)
      setCompararAberto(false)
      setArquivoExclusaoPendente(null)
      setGabiAberta(false)
      if (idLeituraExistente) {
        iniciarRetomarLeitura(idLeituraExistente)
        idLeituraRetomarAnteriorRef.current = idLeituraExistente
      } else {
        setCamposEditados(new Set())
        setTempoTotalMs(0)
        setTempoAnaliseSegundos(null)
        tempoPersistidoMsRef.current = 0
        inicioSessaoRef.current = Date.now()
        setChaveSessaoTokens(String(inicioSessaoRef.current))
        setPasso(1)
        setNomeLeitura(gerarNomeLeitura())
        setArquivos(arquivosIniciais.map((arquivo) => criarArquivoLocalNovaLeitura(arquivo)))
      }
    }
    if (!aberto && abertoAnteriorRef.current) {
      void salvarProgressoRef.current(passoSalvoRef.current >= 2 ? passoSalvoRef.current : passo)
    }
    if (!aberto) {
      setChaveSessaoTokens(null)
      riscosIniciadosRef.current.clear()
      idLeituraRetomarAnteriorRef.current = null
      // Aborta uploads pendentes: um POST abandonado (30-90s no DATI real)
      // seguraria a conexão e entalaria o envio da próxima tentativa.
      controladorEnvioRef.current?.abort()
      controladorEnvioRef.current = null
    }
    abertoAnteriorRef.current = aberto
  }, [aberto, arquivosIniciais, idLeituraExistente, iniciarRetomarLeitura, passo])

  useEffect(() => {
    if (!aberto || !idLeituraExistente) return
    const anterior = idLeituraRetomarAnteriorRef.current
    if (anterior === idLeituraExistente) return
    idLeituraRetomarAnteriorRef.current = idLeituraExistente
    if (anterior !== null) {
      iniciarRetomarLeitura(idLeituraExistente)
    }
  }, [aberto, idLeituraExistente, iniciarRetomarLeitura])

  useEffect(() => {
    if (!aberto || !idLeituraExistente || hidratandoRetomar) return
    const passoSalvo = passoSalvoRef.current
    if (passoSalvo < 3) return

    const leituraConsolidada = consolidarLeituraDeArquivosLocais(arquivos)
    if (leituraTemExtracaoUtilRetomarSmartRead(leituraConsolidada)) return
    if (recuperandoExtracaoRetomarRef.current) return

    const id = idLeituraAtual ?? idLeituraExistente
    recuperandoExtracaoRetomarRef.current = true
    setRecuperandoExtracaoRetomar(true)

    let cancelado = false
    ;(async () => {
      const inicio = Date.now()
      try {
        while (!cancelado && ativo.current && aberto) {
          let leituraApi: Leitura | null = null
          const salvo = await carregarProgressoLeituraSmartRead(id)
          try {
            leituraApi = await smartReadApi.obterLeitura(id)
          } catch {
            leituraApi = salvo?.leitura ?? null
          }

          const leituraEfetiva = escolherLeituraEfetivaRetomarSmartRead(leituraApi, salvo?.leitura ?? null)
          if (leituraEfetiva && leituraTemExtracaoUtilRetomarSmartRead(leituraEfetiva)) {
            await aplicarLeituraHidratada(id, leituraEfetiva, salvo)
            return
          }
          if (leituraEfetiva?.status_leitura === 'FAILED') return

          if (Date.now() - inicio > LIMITE_POLLING_MS) return
          await new Promise((resolver) => setTimeout(resolver, INTERVALO_POLLING_MS))
        }
      } finally {
        recuperandoExtracaoRetomarRef.current = false
        if (!cancelado && ativo.current) setRecuperandoExtracaoRetomar(false)
      }
    })()

    return () => {
      cancelado = true
      recuperandoExtracaoRetomarRef.current = false
      setRecuperandoExtracaoRetomar(false)
    }
  }, [
    aberto,
    aplicarLeituraHidratada,
    arquivos,
    hidratandoRetomar,
    idLeituraAtual,
    idLeituraExistente,
  ])

  useEffect(() => {
    if (passo >= 3) setPassoConferenciaMontado(true)
  }, [passo])

  useEffect(() => {
    if (passo === 4) {
      setTempoTotalMs(resolverTempoProcessoTotalMsAtual())
    }
  }, [passo, resolverTempoProcessoTotalMsAtual])

  useEffect(() => {
    if (!inicioAnalise) return
    if (!analiseCompleta && !processamentoComErro) return
    setTempoAnaliseSegundos((atual) =>
      atual ?? Math.max(0, Math.floor((Date.now() - inicioAnalise) / 1000)),
    )
  }, [analiseCompleta, processamentoComErro, inicioAnalise])

  /**
   * IA/tokens só DEPOIS do OCR (analiseCompleta).
   * Fora do loop de poll — não compete com obterLeitura durante a leitura.
   */
  useEffect(() => {
    if (!analiseCompleta || passo < 2) return
    const id = idLeituraAtual
    if (!id || riscosIniciadosRef.current.has(id)) return
    const completos = arquivos.filter(
      (item) => item.status_arquivo_local === 'completo' && item.leitura,
    )
    if (completos.length === 0) return
    riscosIniciadosRef.current.add(id)

    dispararAnaliseRiscosBackgroundSmartRead({
      arquivos: completos,
      idLeituraLegado: id,
      onTokensAtualizados: (resumo, chamada) =>
        contadorIaRef.current.aplicarAtualizacaoTokens(resumo, chamada),
      onConcluido: () => {
        contadorIaRef.current.marcarIaInativa()
        void contadorIaRef.current.recarregar()
      },
      onErro: () => contadorIaRef.current.marcarIaInativa(),
    })
  }, [analiseCompleta, passo, idLeituraAtual, arquivos])



  useEffect(() => {

    return () => {

      for (const url of urlsBlob.current.values()) {

        URL.revokeObjectURL(url)

      }

      urlsBlob.current.clear()

    }

  }, [])



  const salvarProgressoAtual = useCallback(
    async (
      passoAlvo: number = passo,
      nomeOverride?: string,
      opcoes?: {
        permitirRegressaoPasso?: boolean
        arquivosOverride?: ArquivoLocalNovaLeitura[]
        silencioso?: boolean
      },
    ): Promise<boolean> => {
      if (
        !opcoes?.permitirRegressaoPasso &&
        passoSalvoRef.current >= 3 &&
        passoAlvo < passoSalvoRef.current
      ) {
        return false
      }
      const arquivosEfetivos = opcoes?.arquivosOverride ?? arquivos
      const nomeEfetivo = (nomeOverride ?? nomeLeitura).trim() || nomeLeitura
      const paramsMontagem = {
        arquivos: arquivosEfetivos,
        passo: passoAlvo,
        nomeLeitura: nomeEfetivo,
        idLeituraExistente,
        tempoProcessoTotalMs: resolverTempoProcessoTotalMsAtual(),
      }
      const motivoFalha = diagnosticarEstadoProgressoLeituraSmartRead(paramsMontagem)
      const estado = motivoFalha ? null : montarEstadoProgressoLeituraSmartRead(paramsMontagem)
      if (!estado) {
        console.warn('[smart-read][persist] estado não montável para gravar', {
          passoAlvo,
          arquivos: arquivosEfetivos.length,
          analiseCompleta: todosArquivosAnaliseCompleta(arquivosEfetivos),
          motivoFalha,
        })
        if (!opcoes?.silencioso && motivoFalha) {
          const aviso = mensagemNotificacaoEstadoProgressoNaoMontavel(motivoFalha)
          addNotification({ type: 'warning', title: aviso.title, message: aviso.message })
        }
        return false
      }
      const idLeitura = estado.leitura.id_leitura
      if (import.meta.env.DEV) {
        console.warn('[smart-read][persist] salvando', { idLeitura, passo: passoAlvo, nome: nomeEfetivo })
      }
      const gravou = await persistirProgressoLeituraSmartRead(idLeitura, estado)
      if (!gravou) {
        if (!opcoes?.silencioso) {
          addNotification({
            type: 'error',
            title: 'Progresso não salvo',
            message:
              'Não foi possível gravar o progresso no servidor. Verifique a conexão e tente novamente antes de sair.',
          })
        }
        return false
      }
      estadoFlushRef.current = { idLeitura, estado }
      passoSalvoRef.current = passoAlvo
      if (import.meta.env.DEV) console.warn('[smart-read][persist] SALVO', { idLeitura, passo: passoAlvo, nome: nomeEfetivo })
      return true
    },
    [arquivos, idLeituraExistente, nomeLeitura, passo, addNotification, resolverTempoProcessoTotalMsAtual],
  )
  salvarProgressoRef.current = salvarProgressoAtual

  useEffect(() => {
    const passoAlvo = passoSalvoRef.current >= 2 ? passoSalvoRef.current : passo
    const estado = montarEstadoProgressoLeituraSmartRead({
      arquivos,
      passo: passoAlvo,
      nomeLeitura,
      idLeituraExistente,
      tempoProcessoTotalMs: resolverTempoProcessoTotalMsAtual(),
    })
    estadoFlushRef.current = estado
      ? { idLeitura: estado.leitura.id_leitura, estado }
      : null
  }, [arquivos, passo, nomeLeitura, idLeituraExistente, resolverTempoProcessoTotalMsAtual])

  useEffect(() => {
    if (!aberto) return
    const flush = () => {
      const pendente = estadoFlushRef.current
      if (!pendente) return
      persistirProgressoLeituraUrgenteSmartRead(pendente.idLeitura, pendente.estado)
      void persistirProgressoLeituraSmartRead(pendente.idLeitura, pendente.estado)
    }
    const onVisibilidade = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibilidade)
    return () => {
      flush()
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibilidade)
    }
  }, [aberto])

  // Salva quando a análise termina (passo 2) ou ao mudar de passo com documento lido.
  useEffect(() => {
    if (!aberto || passo < 2 || !analiseCompleta || hidratandoRetomarRef.current) return
    void salvarProgressoAtual(passo)
  }, [aberto, passo, analiseCompleta, salvarProgressoAtual])



  const atualizarArquivo = useCallback(

    (id: string, patch: Partial<ArquivoLocalNovaLeitura>) => {

      setArquivos((prev) =>

        prev.map((item) => {
          if (item.id_arquivo_local !== id) return item
          if (pollAtualizacaoArquivoEquivalente(item, patch)) return item
          const proximo = { ...item, ...patch }
          // Carimba o início da análise na transição para 'analisando' (inclui
          // retomada via polling) — base da barra de estimativa do passo 2.
          if (proximo.status_arquivo_local === 'analisando' && proximo.inicio_analise_ms == null) {
            proximo.inicio_analise_ms = Date.now()
          }
          return proximo
        }),

      )

    },

    [],

  )



  const adicionarArquivos = useCallback((lista: File[]) => {

    setArquivos((prev) => [...prev, ...lista.map((arquivo) => criarArquivoLocalNovaLeitura(arquivo))])

  }, [])



  const solicitarRemoverArquivo = useCallback((id: string) => {

    const item = arquivos.find((arquivo) => arquivo.id_arquivo_local === id) ?? null

    if (item) setArquivoExclusaoPendente(item)

  }, [arquivos])



  const confirmarRemoverArquivo = useCallback(async () => {

    if (!arquivoExclusaoPendente) return

    const pendente = arquivoExclusaoPendente
    const id = pendente.id_arquivo_local

    const urlBlob = urlsBlob.current.get(id)
    if (urlBlob) {
      URL.revokeObjectURL(urlBlob)
      urlsBlob.current.delete(id)
    }

    if (pendente.id_leitura && pendente.id_arquivo) {
      void removerBlobArquivoLeituraSmartRead(pendente.id_leitura, pendente.id_arquivo)
    }

    let proximos: ArquivoLocalNovaLeitura[] = []
    setArquivos((prev) => {
      proximos = prev.filter((item) => item.id_arquivo_local !== id)
      return proximos
    })

    const idLeitura =
      idLeituraExistente ??
      pendente.id_leitura ??
      proximos.find((a) => a.id_leitura)?.id_leitura ??
      null

    if (idLeitura && proximos.length === 0) {
      limparEstadoLeituraSmartRead(idLeitura)
      setArquivoExclusaoPendente(null)
      return
    }

    if (idLeitura && passoSalvoRef.current >= 2 && proximos.length > 0) {
      const leituraBase = consolidarLeituraDeArquivosLocais(proximos)
      if (leituraBase) {
        const nomeEfetivo = nomeLeitura.trim() || nomeLeitura
        await persistirProgressoLeituraSmartRead(idLeitura, {
          passo: passoSalvoRef.current,
          nome: nomeEfetivo,
          leitura: { ...leituraBase, nome_leitura: nomeEfetivo },
        })
      }
    }

    setArquivoExclusaoPendente(null)
  }, [arquivoExclusaoPendente, idLeituraExistente, nomeLeitura])



  const alternarExpandido = useCallback((id: string) => {

    setArquivos((prev) =>

      prev.map((item) =>

        item.id_arquivo_local === id ? { ...item, expandido: !item.expandido } : item,

      ),

    )

  }, [])



  const visualizarArquivo = useCallback(
    (id: string) => {
      const item = arquivos.find((a) => a.id_arquivo_local === id)
      if (!item) return
      void abrirArquivoLeituraNovaAbaSmartRead({
        item,
        idLeituraExistente,
        urlsBlobCache: urlsBlob.current,
        aoArquivoAtualizado: (idArquivoLocal, arquivo) => {
          setArquivos((prev) =>
            prev.map((arquivoItem) =>
              arquivoItem.id_arquivo_local === idArquivoLocal
                ? { ...arquivoItem, arquivo }
                : arquivoItem,
            ),
          )
        },
      })
    },
    [arquivos, idLeituraExistente],
  )

  const visualizarEvidenciaRisco = useCallback((ctx: ContextoEvidenciaRiscoNovaLeitura) => {
    if (passo === 3) {
      setConferenciaSelecao({ idArquivoLocal: ctx.idArquivoLocal, indiceDocumento: 0 })
    }
    visualizarArquivo(ctx.idArquivoLocal)
  }, [visualizarArquivo, passo])

  const visualizarDocumento = useCallback((id: string, indice: number) => {
    if (passo >= 2) {
      setConferenciaSelecao({ idArquivoLocal: id, indiceDocumento: indice })
    }
    visualizarArquivo(id)
  }, [visualizarArquivo, passo])

  const selecionarDocumentoConferencia = useCallback((id: string, indice: number) => {
    setConferenciaSelecao({ idArquivoLocal: id, indiceDocumento: indice })
  }, [])

  const editarCampoDocumentoAtual = useCallback(
    (chave: string, valor: string) => {
      const selecao = conferenciaSelecao
      if (!selecao) return
      setArquivos((prev) =>
        prev.map((item) => {
          if (item.id_arquivo_local !== selecao.idArquivoLocal || !item.leitura) return item
          const leitura = structuredClone(item.leitura)
          const arquivoApi =
            leitura.arquivos.find((a) => a.id_arquivo === item.id_arquivo) ?? leitura.arquivos[0]
          const extracao = arquivoApi?.resultado_extracao?.[selecao.indiceDocumento]
          if (extracao?.dados) {
            if (!extracao.dados_original) {
              extracao.dados_original = structuredClone(extracao.dados)
            }
            definirValorPorCaminho(extracao.dados, chave, valor)
          }
          return { ...item, leitura }
        }),
      )
      setCamposEditados((prev) => {
        const next = new Set(prev)
        next.add(montarChaveCampoEditadoLeitura(selecao.idArquivoLocal, selecao.indiceDocumento, chave))
        return next
      })
      if (salvarProgressoEdicaoTimeoutRef.current) {
        clearTimeout(salvarProgressoEdicaoTimeoutRef.current)
      }
      salvarProgressoEdicaoTimeoutRef.current = setTimeout(() => {
        const passoAlvo = passoSalvoRef.current >= 3 ? passoSalvoRef.current : passo
        void salvarProgressoRef.current(passoAlvo)
      }, 800)
    },
    [conferenciaSelecao, passo],
  )



  const pollingArquivo = useCallback(

    async (idArquivoLocal: string, idLeitura: string, arquivoOriginal: File) => {

      const inicio = Date.now()
      const blobPersistidoRef = { atual: false }

      const persistirArquivoOriginal = (idArquivo: string | null | undefined) => {
        if (!arquivoOriginal.size || !idArquivo || blobPersistidoRef.atual) return
        blobPersistidoRef.atual = true
        registrarArquivoSessaoLeituraSmartRead(idLeitura, arquivoOriginal, idArquivo)
        void salvarBlobArquivoLeituraSmartRead(
          idLeitura,
          idArquivo,
          arquivoOriginal,
          arquivoOriginal.name,
        )
      }

      while (ativo.current) {

        const leitura = await smartReadApi.obterLeitura(idLeitura)

        if (!ativo.current) return

        const arquivoApi =
          leitura.arquivos.find((a) => a.nome_arquivo === arquivoOriginal.name) ?? leitura.arquivos[0]
        if (arquivoApi?.id_arquivo) {
          persistirArquivoOriginal(arquivoApi.id_arquivo)
          atualizarArquivo(idArquivoLocal, { id_arquivo: arquivoApi.id_arquivo })
        }

        if (leitura.status_leitura === 'COMPLETED') {
          atualizarArquivo(idArquivoLocal, {
            status_arquivo_local: 'completo',
            leitura,
            id_arquivo: arquivoApi?.id_arquivo ?? null,
            expandido: true,
          })
          return
        }

        if (leitura.status_leitura === 'FAILED') {
          contadorIaRef.current.marcarIaInativa()

          // Motivo real do DATI (contrato mensagem_erro) — o classificador do card
          // traduz para linguagem humana; o texto bruto fica no console p/ suporte.
          const mensagemReal = leitura.mensagem_erro?.trim()
          if (mensagemReal) {
            console.warn('[smart-read][polling] leitura FAILED no DATI', {
              idLeitura,
              mensagem_erro: mensagemReal,
            })
          }

          atualizarArquivo(idArquivoLocal, {
            status_arquivo_local: 'erro',
            leitura,
            mensagem_erro: mensagemReal || 'Falha no processamento',
          })

          return
        }

        atualizarArquivo(idArquivoLocal, {
          status_arquivo_local: 'analisando',
          leitura,
        })



        if (Date.now() - inicio > LIMITE_POLLING_MS) {

          contadorIaRef.current.marcarIaInativa()

          atualizarArquivo(idArquivoLocal, {

            status_arquivo_local: 'erro',

            mensagem_erro: 'Tempo limite de processamento excedido',

          })

          return

        }

        await new Promise((r) => setTimeout(r, INTERVALO_POLLING_MS))

      }

    },

    [atualizarArquivo],

  )



  const enviarArquivos = useCallback(async () => {

    if (arquivos.length === 0) return

    setEnviando(true)

    setInicioAnalise(Date.now())
    setTempoAnaliseSegundos(null)

    setPasso(2)

    controladorEnvioRef.current?.abort()
    const controlador = new AbortController()
    controladorEnvioRef.current = controlador

    for (const item of arquivos) {
      atualizarArquivo(item.id_arquivo_local, {
        status_arquivo_local: 'enviando',
        progresso_envio: 0,
      })
    }

    // POSTs em SÉRIE, polling em paralelo: o upload real via DATI leva 30-90s e
    // dois multipart simultâneos no mesmo destino podem entalar o proxy
    // (reproduzido no proxy do Vite em dev: o segundo POST nunca responde).
    const pollings: Promise<void>[] = []

    for (const item of arquivos) {

      if (controlador.signal.aborted) break

      try {

        const criada = await smartReadApi.enviarLeitura(item.arquivo, {
          signal: controlador.signal,
          // Barra «Envio dos arquivos» do passo 2 — progresso real byte a byte.
          aoProgredirEnvio: (fracao) => {
            atualizarArquivo(item.id_arquivo_local, {
              progresso_envio: Math.round(fracao * 100),
            })
          },
        })

        atualizarArquivo(item.id_arquivo_local, {
          status_arquivo_local: 'analisando',
          id_leitura: criada.id_leitura,
          id_arquivo: criada.id_arquivo,
          progresso_envio: 100,
          inicio_analise_ms: Date.now(),
        })

        registrarArquivoSessaoLeituraSmartRead(criada.id_leitura, item.arquivo, criada.id_arquivo)
        if (criada.id_leitura && criada.id_arquivo) {
          void salvarBlobArquivoLeituraSmartRead(
            criada.id_leitura,
            criada.id_arquivo,
            item.arquivo,
            item.arquivo.name,
          )
        }

        pollings.push(
          pollingArquivo(item.id_arquivo_local, criada.id_leitura, item.arquivo).catch((excecao) => {
            atualizarArquivo(item.id_arquivo_local, {
              status_arquivo_local: 'erro',
              mensagem_erro: mensagemDeExcecao(excecao, 'Falha ao enviar arquivo'),
            })
          }),
        )

      } catch (excecao) {

        if (controlador.signal.aborted) break

        atualizarArquivo(item.id_arquivo_local, {

          status_arquivo_local: 'erro',

          mensagem_erro: mensagemDeExcecao(excecao, 'Falha ao enviar arquivo'),

        })

      }

    }



    await Promise.all(pollings)

    if (!ativo.current) return

    setEnviando(false)

  }, [arquivos, atualizarArquivo, pollingArquivo])



  async function handleFechar() {
    await salvarProgressoAtual(passo)
    limparCacheAnaliseRiscosSessaoSmartRead()
    limparRequisicoesAnaliseRiscosEmVooSmartRead()
    onFechar()
  }



  function handleVoltarPasso() {
    if (passo <= 1) return
    const anterior = passo - 1
    setPasso(anterior)
    if (anterior >= 2) {
      void salvarProgressoAtual(anterior, undefined, { permitirRegressaoPasso: true, silencioso: true })
    }
  }

  const sincronizarExtracaoAntesContinuar = useCallback(async (): Promise<ArquivoLocalNovaLeitura[] | null> => {
    const id = idLeituraAtual
    if (!id) return null

    const inicio = Date.now()
    let arquivosAtualizados = arquivos

    while (ativo.current && Date.now() - inicio <= LIMITE_SINCRONIZAR_EXTRACAO_CONTINUAR_MS) {
      const motivo = diagnosticarEstadoProgressoLeituraSmartRead({
        arquivos: arquivosAtualizados,
        passo: 3,
        nomeLeitura,
        idLeituraExistente,
      })
      if (!motivo) {
        return arquivosAtualizados
      }
      if (motivo !== 'sem_extracao') {
        return null
      }

      try {
        const leituraApi = await smartReadApi.obterLeitura(id)
        arquivosAtualizados = aplicarLeituraApiNosArquivosLocais(arquivosAtualizados, leituraApi)
        if (leituraTemExtracaoUtilRetomarSmartRead(consolidarLeituraDeArquivosLocais(arquivosAtualizados))) {
          setArquivos(arquivosAtualizados)
          return arquivosAtualizados
        }
        if (leituraApi.status_leitura === 'FAILED') return null
      } catch (erro) {
        if (import.meta.env.DEV) {
          console.warn('[smart-read][continuar] obterLeitura ao sincronizar extração', erro)
        }
      }

      await new Promise((resolver) => setTimeout(resolver, INTERVALO_POLLING_MS))
    }

    return null
  }, [arquivos, idLeituraAtual, idLeituraExistente, nomeLeitura])

  async function handleContinuarPasso() {
    if (continuandoPassoRef.current) return
    if (passo === 2 && !processamentoFinalizado) return

    continuandoPassoRef.current = true
    setSalvandoPasso(true)
    try {
    if (passo >= 4) {

      if (origemBidFrete && idLeituraAtual && leituraConsolidada) {
        try {
          setRedirecionandoCotacao(true)
          const pacoteRef = prefillContinuarRef.current
          const payload = pacoteRef?.payload ?? await (async () => {
            const { converterLeituraParaCotacaoBidFreteInternacional } = await import(
              '../../../../shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'
            )
            const conversao = converterLeituraParaCotacaoBidFreteInternacional(leituraConsolidada)
            return {
              prefill: conversao.prefill,
              detalhe_mapeamento: conversao.detalhe_mapeamento,
              campos_faltantes: conversao.campos_faltantes,
              passo_inicial_tipo: conversao.passo_inicial_tipo,
              iniciar_no_passo_fornecedores: conversao.iniciar_no_passo_fornecedores,
            }
          })()
          const manterWizard = pacoteRef?.manterWizard === true
          salvarPrefillCotacaoBidFreteSmartRead(
            montarPacotePrefillCotacaoBidFreteSmartRead({
              idLeitura: idLeituraAtual,
              idBid: idBidOrigem,
              prefill: payload.prefill,
              detalheMapeamento: payload.detalhe_mapeamento,
              passoInicialTipo: payload.passo_inicial_tipo,
              iniciarNoPassoFornecedores: payload.iniciar_no_passo_fornecedores,
            }),
          )
          prefillContinuarRef.current = null
          const url = buildUrlNovaCotacaoPrefillSmartReadBidFreteInternacional(
            idLeituraAtual,
            idBidOrigem,
          )
          if (manterWizard) {
            // Sem noopener: nova aba herda sessionStorage; prefill também vai em localStorage.
            window.open(url, '_blank')
            setRedirecionandoCotacao(false)
            return
          }
          onConcluido?.()
          await handleFechar()
          window.location.assign(url)
          return
        } catch (erro) {
          setRedirecionandoCotacao(false)
          addNotification({
            type: 'error',
            title: 'Falha ao preparar cotação',
            message: mensagemDeExcecao(erro, 'Nao foi possivel abrir a nova cotacao a partir da leitura.'),
          })
        }
      }

      if (origemPedido && idLeituraAtual) {
        try {
          const resultado = await smartReadApi.criarPedidoDeLeitura(idLeituraAtual)
          const totalPedidos = resultado.pedidos_criados?.length ?? 1
          const tituloPedido =
            totalPedidos > 1
              ? `${totalPedidos} pedidos criados no Pedido (${resultado.numero_pedido} e outros)`
              : `Pedido ${resultado.numero_pedido} criado no Pedido`
          addNotification({
            type: 'success',
            title: tituloPedido,
            message: 'Leitura concluída e pedido gerado com sucesso.',
          })
        } catch (erro) {
          addNotification({
            type: 'error',
            title: 'Falha ao criar pedido',
            message: mensagemDeExcecao(erro, 'Nao foi possivel gerar o pedido a partir da leitura.'),
          })
        }
      }

      onConcluido?.()

      await handleFechar()

      return

    }

    const proximo = passo + 1
    let arquivosParaSalvar = arquivos

    if (passo === 2 && proximo === 3) {
      const motivoInicial = diagnosticarEstadoProgressoLeituraSmartRead({
        arquivos,
        passo: 3,
        nomeLeitura,
        idLeituraExistente,
      })
      if (motivoInicial === 'sem_extracao') {
        const sincronizados = await sincronizarExtracaoAntesContinuar()
        if (sincronizados) {
          arquivosParaSalvar = sincronizados
        }
      }
    }

    const gravou = await salvarProgressoAtual(proximo, undefined, {
      arquivosOverride: arquivosParaSalvar,
    })
    if (!gravou) return
    setPasso(proximo)
    } finally {
      continuandoPassoRef.current = false
      setSalvandoPasso(false)
    }

  }



  const podeContinuar =
    !salvandoPasso &&
    (passo === 2 ? processamentoFinalizado :
    passo === 3 ? arquivos.some((a) => a.status_arquivo_local === 'completo') :
    passo === 4 ? true :
    false)



  const gabiFlutuante =
    aberto && typeof document !== 'undefined'
      ? createPortal(
          <>
            {gabiAberta ? (
              <div className="ws-gabi-panel sr-wizard-gabi-camada">
                <Suspense fallback={null}>
                  <GabiChat onClose={() => setGabiAberta(false)} />
                </Suspense>
              </div>
            ) : (
              <TooltipGlobal descricao="Falar com a Gabi IA">
                <button
                  type="button"
                  className="ws-gabi-trigger sr-wizard-gabi-camada"
                  aria-label="Falar com a Gabi IA"
                  onClick={() => setGabiAberta(true)}
                >
                  <Sparkle weight="fill" size={28} />
                </button>
              </TooltipGlobal>
            )}
          </>,
          document.body,
        )
      : null

  return (

    <>
    <ModalPassoPassoGlobal

      titulo={NOME_PRODUTO_EXIBICAO}

      tituloNode={<span className="sr-wizard-cabecalho-marca-texto">{NOME_PRODUTO_EXIBICAO}</span>}

      icone={ICONE_MARCA_CABECALHO}

      subtituloNode={
        <span className="sr-wizard-modal-subtitulo-leitura">{nomeLeitura}</span>
      }

      aberto={aberto}

      passos={PASSOS}

      passoAtual={passo}

      onProximo={() => {}}

      onVoltar={() => {}}

      onFechar={handleFechar}

      tamanho="2xl"

      altura="min(920px, calc(100vh - 2rem))"

      ocultarFooter

      classNameDialog="sr-wizard-mpg-dialog"

      classNameCabecalho="sr-wizard-cabecalho"

      classNameStepperEnvoltorio="sr-wizard-stepper-painel-wrap"

      navegacaoDireta={passo > 1 && analiseCompleta}

      onIrParaPasso={(id) => {
        if (id >= passo) return
        setPasso(id)
        if (id >= 2) void salvarProgressoAtual(id)
      }}

    >

      <div className="sr-wizard-corpo">

        <PainelLateralArquivosNovaLeituraSmartRead

          passo={passo}

          nomeLeitura={nomeLeitura}

          arquivos={arquivos}

          enviando={enviando}

          podeContinuar={podeContinuar}
          salvandoPasso={salvandoPasso}

          onConfirmarNome={(nome) => {
            setNomeLeitura(nome)
            if (passo >= 2 && analiseCompleta) {
              void salvarProgressoAtual(passo, nome)
            }
          }}

          onRemoverArquivo={solicitarRemoverArquivo}

          onAlternarExpandido={alternarExpandido}

          onVisualizarArquivo={visualizarArquivo}

          onVisualizarDocumento={visualizarDocumento}

          selecaoConferencia={passo >= 2 ? conferenciaSelecao : null}

          onSelecionarDocumentoConferencia={
            passo >= 2 ? selecionarDocumentoConferencia : undefined
          }

          onEnviar={() => void enviarArquivos()}

          onCancelar={() => void handleFechar()}

          onVoltar={passo > 1 ? handleVoltarPasso : undefined}

          onContinuar={passo >= 2 ? handleContinuarPasso : undefined}

          tokensSessao={contadorTokens.tokensTotalSessao}
          tokensMesOrganizacao={contadorTokens.tokensTotalMesOrganizacao}
          iaAtiva={contadorTokens.iaAtiva}
          extracaoEmAndamento={extracaoEmAndamento}
          exibirContadorTokens={passo >= 2}

        />



        {passo === 1 && <AreaAnexarNovaLeituraSmartRead onArquivosAdicionados={adicionarArquivos} />}

        {passo === 2 && (

          <DashboardAnaliseNovaLeituraSmartRead
            arquivos={arquivos}
            analiseCompleta={analiseCompleta}
            processamentoComErro={processamentoComErro}
            inicioAnalise={inicioAnalise}
            tempoAnaliseSegundos={tempoAnaliseSegundos}
          />

        )}

        {passoConferenciaMontado && (
          <div className="sr-wizard-passo-painel" hidden={passo !== 3}>
            {hidratandoRetomar || recuperandoExtracaoRetomar ? (
              <p className="sr-conf-vazio">
                {recuperandoExtracaoRetomar
                  ? 'Recarregando análise dos arquivos…'
                  : 'Carregando leitura…'}
              </p>
            ) : (
            <AreaConferenciaNovaLeituraSmartRead
              arquivos={arquivos}
              selecao={conferenciaSelecao}
              onSelecionarDocumento={setConferenciaSelecao}
              onCompararArquivo={() => setCompararAberto(true)}
              onVerEvidencia={visualizarEvidenciaRisco}
              idLeituraLegado={idLeituraAtual}
              camposEditados={camposEditados}
              onEditarCampo={editarCampoDocumentoAtual}
              onTokensAtualizados={contadorTokens.aplicarAtualizacaoTokens}
              onIaInicio={() => contadorTokens.marcarIaAtiva()}
              onIaFim={() => contadorTokens.marcarIaInativa()}
            />
            )}
          </div>
        )}

        {passo === 4 && origemBidFrete && leituraConsolidada ? (
          <Suspense fallback={<div className="sr-prefill-bid-carregando">Carregando revisão…</div>}>
            <PainelRevisaoPrefillCotacaoBidFreteSmartRead
              leitura={leituraConsolidada}
              onContinuar={(payload, opcoes) => {
                prefillContinuarRef.current = {
                  payload,
                  manterWizard: opcoes?.manter_wizard_aberto === true,
                }
                void handleContinuarPasso()
              }}
              continuando={redirecionandoCotacao}
            />
          </Suspense>
        ) : passo === 4 ? (
          hidratandoRetomar || recuperandoExtracaoRetomar ? (
            <p className="sr-conf-vazio">Carregando leitura…</p>
          ) : (
            <AreaResultadoNovaLeituraSmartRead
              arquivos={arquivos}
              tempoTotalMs={tempoTotalMs || resolverTempoProcessoTotalMsAtual()}
            />
          )
        ) : null}

      </div>

      <ModalCompararArquivoConferenciaSmartRead
        aberto={compararAberto && passo === 3}
        arquivo={
          arquivos.find((a) => a.id_arquivo_local === conferenciaSelecao?.idArquivoLocal) ?? null
        }
        indiceDocumento={conferenciaSelecao?.indiceDocumento ?? 0}
        onFechar={() => setCompararAberto(false)}
        onEditarCampoDocumentoAtual={editarCampoDocumentoAtual}
      />

      <ModalConfirmarExcluirGlobal
        aberto={arquivoExclusaoPendente !== null}
        titulo="Excluir arquivo?"
        descricao="O arquivo será removido desta leitura."
        nomeItem={arquivoExclusaoPendente?.arquivo.name}
        aoConfirmar={confirmarRemoverArquivo}
        aoCancelar={() => setArquivoExclusaoPendente(null)}
      />

    </ModalPassoPassoGlobal>
    {gabiFlutuante}
    </>

  )

}


