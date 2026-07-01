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

import { mensagemDeExcecao } from '../../shared/extrair-mensagem-erro-api'

import {

  criarArquivoLocalNovaLeitura,

  criarArquivosLocaisDeLeitura,
  arquivoLocalTemBlobVisualizavel,
  consolidarLeituraDeArquivosLocais,
  passoInicialLeituraSmartRead,

  todosArquivosAnaliseCompleta,
  algumArquivoEmAnalise,
  todosArquivosProcessamentoFinalizado,
  pollAtualizacaoArquivoEquivalente,

  type ArquivoLocalNovaLeitura,

} from '../../shared/tipo-arquivo-nova-leitura-smart-read'

import {
  carregarProgressoLeituraSmartRead,
  limparEstadoLeituraSmartRead,
  persistirProgressoLeituraSmartRead,
} from '../../shared/persistencia-leitura-smart-read'

import {
  carregarBlobArquivoLeituraSmartRead,
  removerBlobArquivoLeituraSmartRead,
  salvarBlobArquivoLeituraSmartRead,
} from '../../shared/persistencia-blob-arquivo-leitura-smart-read'
import {
  obterArquivoSessaoLeituraSmartRead,
  registrarArquivoSessaoLeituraSmartRead,
} from '../../shared/cache-sessao-arquivo-leitura-smart-read'

import { criarObjectUrlArquivoLeitura } from '../../shared/url-blob-arquivo-leitura-smart-read'
import {
  montarUrlApiArquivoLeituraSmartRead,
  urlVisualizacaoEhBlobRevogavel,
} from '../../shared/url-api-arquivo-leitura-smart-read'
import {
  abrirDocumentoNovaAba,
  navegarAbaDocumento,
  reservarAbaDocumento,
} from '../../shared/abrir-documento-nova-aba-smart-read'
import { resolverUrlVisualizacaoArquivoLeituraSmartRead } from '../../shared/resolver-url-visualizacao-arquivo-leitura-smart-read'

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

import { ModalVisualizarArquivoNovaLeituraSmartRead } from './modal-visualizar-arquivo-nova-leitura-smart-read'

import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'

import { AreaResultadoNovaLeituraSmartRead } from './area-resultado-nova-leitura-smart-read'

import '../../../../../../configurador/src/pages/configurador/gabi.css'
import './modal-nova-leitura-smart-read.css'

const GabiChat = lazy(() => import('@plataforma/gabi/src/Gabi'))



const INTERVALO_POLLING_MS = 2000

const LIMITE_POLLING_MS = 5 * 60 * 1000



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

  onFechar: () => void

  onConcluido?: () => void

}



function gerarNomeLeitura(): string {

  const sequencia = Math.floor(100 + Math.random() * 900)

  return `Leitura ${sequencia}`

}



export function ModalNovaLeituraSmartRead({

  aberto,

  arquivosIniciais = [],

  idLeituraExistente = null,

  onFechar,

  onConcluido,

}: Props) {

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

  const extracaoEmAndamento = useMemo(
    () => passo >= 2 && !analiseCompleta && (enviando || algumArquivoEmAnalise(arquivos)),
    [passo, analiseCompleta, enviando, arquivos],
  )

  const [inicioAnalise, setInicioAnalise] = useState<number | null>(null)
  const [tempoAnaliseSegundos, setTempoAnaliseSegundos] = useState<number | null>(null)

  const [conferenciaSelecao, setConferenciaSelecao] = useState<SelecaoDocumentoConferencia | null>(null)
  const [passoConferenciaMontado, setPassoConferenciaMontado] = useState(false)

  const [compararAberto, setCompararAberto] = useState(false)

  const [previewArquivo, setPreviewArquivo] = useState<{
    idArquivoLocal: string
    nomeArquivo: string
  } | null>(null)
  const [previewEvidencia, setPreviewEvidencia] = useState<ContextoEvidenciaRiscoNovaLeitura | null>(
    null,
  )
  const [previewUrlRemota, setPreviewUrlRemota] = useState<string | null>(null)
  const [previewCarregando, setPreviewCarregando] = useState(false)
  const [previewErro, setPreviewErro] = useState<string | null>(null)

  const [camposEditados, setCamposEditados] = useState<Set<string>>(() => new Set())

  const [tempoTotalMs, setTempoTotalMs] = useState(0)
  const [arquivoExclusaoPendente, setArquivoExclusaoPendente] =
    useState<ArquivoLocalNovaLeitura | null>(null)
  const [gabiAberta, setGabiAberta] = useState(false)

  const ativo = useRef(true)
  const urlsBlob = useRef<Map<string, string>>(new Map())
  const urlPreviewRemotaRef = useRef<string | null>(null)
  const abertoAnteriorRef = useRef(false)
  const passoSalvoRef = useRef(0)
  const inicioSessaoRef = useRef<number>(Date.now())

  useEffect(() => {
    ativo.current = true
    return () => {
      ativo.current = false
    }
  }, [])

  const hidratarLeituraExistente = useCallback(async (id: string) => {
    try {
      const leitura = await smartReadApi.obterLeitura(id)
      if (!ativo.current) return
      // Estado salvo localmente (passo + edições) tem prioridade sobre o fetch.
      const salvo = await carregarProgressoLeituraSmartRead(id)
      if (import.meta.env.DEV) {
        console.warn('[smart-read][persist] retomar', { id, temSalvo: !!salvo, passoSalvo: salvo?.passo })
      }
      const leituraEfetiva = salvo?.leitura ?? leitura
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
      setPasso(salvo?.passo ?? passoInicialLeituraSmartRead(leitura.status_leitura))
    } catch {
      if (!ativo.current) return
      setArquivos([])
      setPasso(1)
    }
  }, [])

  useEffect(() => {
    if (aberto && !abertoAnteriorRef.current) {
      passoSalvoRef.current = 0
      setEnviando(false)
      setInicioAnalise(null)
      setConferenciaSelecao(null)
      setPassoConferenciaMontado(false)
      setCompararAberto(false)
      setPreviewArquivo(null)
      setPreviewUrlRemota(null)
      setPreviewCarregando(false)
      setPreviewErro(null)
      setCamposEditados(new Set())
      setTempoTotalMs(0)
      setArquivoExclusaoPendente(null)
      setGabiAberta(false)
      setTempoAnaliseSegundos(null)
      inicioSessaoRef.current = Date.now()
      setChaveSessaoTokens(String(inicioSessaoRef.current))
      if (idLeituraExistente) {
        setArquivos([])
        void hidratarLeituraExistente(idLeituraExistente)
      } else {
        setPasso(1)
        setNomeLeitura(gerarNomeLeitura())
        setArquivos(arquivosIniciais.map((arquivo) => criarArquivoLocalNovaLeitura(arquivo)))
      }
    }
    if (!aberto) {
      setChaveSessaoTokens(null)
      riscosIniciadosRef.current.clear()
    }
    abertoAnteriorRef.current = aberto
  }, [aberto, arquivosIniciais, idLeituraExistente, hidratarLeituraExistente])

  useEffect(() => {
    if (passo >= 3) setPassoConferenciaMontado(true)
  }, [passo])

  useEffect(() => {
    if (passo === 4) {
      setTempoTotalMs((atual) => (atual === 0 ? Date.now() - inicioSessaoRef.current : atual))
    }
  }, [passo])

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

    const timer = window.setTimeout(() => {
      dispararAnaliseRiscosBackgroundSmartRead({
        arquivos: completos,
        idLeituraLegado: id,
        onInicio: () => contadorIaRef.current.marcarIaAtiva(),
        onTokensAtualizados: (resumo, chamada) =>
          contadorIaRef.current.aplicarAtualizacaoTokens(resumo, chamada),
        onConcluido: () => contadorIaRef.current.marcarIaInativa(),
        onErro: () => contadorIaRef.current.marcarIaInativa(),
      })
    }, 800)

    return () => window.clearTimeout(timer)
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
    async (passoAlvo: number = passo, nomeOverride?: string): Promise<boolean> => {
      const idLeitura = idLeituraExistente ?? arquivos.find((a) => a.id_leitura)?.id_leitura ?? null
      if (!idLeitura || passoAlvo < 2 || !todosArquivosAnaliseCompleta(arquivos)) return false
      const leituraBase = consolidarLeituraDeArquivosLocais(arquivos)
      if (!leituraBase) return false
      const nomeEfetivo = (nomeOverride ?? nomeLeitura).trim() || nomeLeitura
      const leitura = { ...leituraBase, nome_leitura: nomeEfetivo }
      if (import.meta.env.DEV) {
        console.warn('[smart-read][persist] salvando', { idLeitura, passo: passoAlvo, nome: nomeEfetivo })
      }
      await persistirProgressoLeituraSmartRead(idLeitura, { passo: passoAlvo, nome: nomeEfetivo, leitura })
      passoSalvoRef.current = passoAlvo
      if (import.meta.env.DEV) console.warn('[smart-read][persist] SALVO', { idLeitura, passo: passoAlvo, nome: nomeEfetivo })
      return true
    },
    [arquivos, idLeituraExistente, nomeLeitura, passo],
  )

  // Salva quando a análise termina (passo 2) ou ao mudar de passo com documento lido.
  useEffect(() => {
    if (!aberto || passo < 2 || !analiseCompleta) return
    void salvarProgressoAtual(passo)
  }, [aberto, passo, analiseCompleta, salvarProgressoAtual])



  const atualizarArquivo = useCallback(

    (id: string, patch: Partial<ArquivoLocalNovaLeitura>) => {

      setArquivos((prev) =>

        prev.map((item) => {
          if (item.id_arquivo_local !== id) return item
          if (pollAtualizacaoArquivoEquivalente(item, patch)) return item
          return { ...item, ...patch }
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



  const abrirPreviewModalFallback = useCallback(
    (
      id: string,
      nomeArquivo: string,
      url: string | null,
      evidencia: ContextoEvidenciaRiscoNovaLeitura | null,
      carregando: boolean,
      erro: string | null,
    ) => {
      if (urlPreviewRemotaRef.current && urlVisualizacaoEhBlobRevogavel(urlPreviewRemotaRef.current)) {
        URL.revokeObjectURL(urlPreviewRemotaRef.current)
        urlPreviewRemotaRef.current = null
      }
      if (url) {
        urlPreviewRemotaRef.current = url
        setPreviewUrlRemota(url)
      } else {
        setPreviewUrlRemota(null)
      }
      setPreviewCarregando(carregando)
      setPreviewErro(erro)
      setPreviewEvidencia(evidencia)
      setPreviewArquivo({ idArquivoLocal: id, nomeArquivo })
    },
    [],
  )

  const visualizarArquivo = useCallback(
    async (id: string, evidencia?: ContextoEvidenciaRiscoNovaLeitura | null) => {
      const item = arquivos.find((a) => a.id_arquivo_local === id)
      if (!item) return

      const nomeArquivo = item.arquivo.name
      const idLeitura =
        item.id_leitura ?? idLeituraExistente ?? item.leitura?.id_leitura ?? null
      const idArquivo = item.id_arquivo

      // Paridade DATI: URL estável do BFF (mesma origem + sessão) — evita blob: inválido em nova aba
      if (idLeitura && idArquivo) {
        const urlApi = montarUrlApiArquivoLeituraSmartRead(idLeitura, idArquivo)
        if (!abrirDocumentoNovaAba(urlApi)) {
          abrirPreviewModalFallback(id, nomeArquivo, urlApi, evidencia ?? null, false, null)
        }
        return
      }

      const temBlobLocal = arquivoLocalTemBlobVisualizavel(item.arquivo)
      const abaReservada = temBlobLocal ? null : reservarAbaDocumento()

      const tentarAbrirNovaAba = (url: string): boolean => {
        if (temBlobLocal) {
          return abrirDocumentoNovaAba(url) != null
        }
        if (abaReservada) {
          navegarAbaDocumento(abaReservada, url)
          return true
        }
        return abrirDocumentoNovaAba(url) != null
      }

      try {
        if (temBlobLocal) {
          let url = urlsBlob.current.get(id)
          if (!url) {
            url = criarObjectUrlArquivoLeitura(item.arquivo)
            urlsBlob.current.set(id, url)
          }
          if (!tentarAbrirNovaAba(url)) {
            abrirPreviewModalFallback(id, nomeArquivo, url, evidencia ?? null, false, null)
          }
          return
        }

        if (!abaReservada) {
          abrirPreviewModalFallback(id, nomeArquivo, null, evidencia ?? null, true, null)
        }

        const resultado = await resolverUrlVisualizacaoArquivoLeituraSmartRead(
          item,
          idLeituraExistente,
        )

        if (!resultado.ok) {
          abaReservada?.close()
          abrirPreviewModalFallback(id, nomeArquivo, null, evidencia ?? null, false, resultado.mensagem)
          return
        }

        if (urlVisualizacaoEhBlobRevogavel(resultado.url)) {
          urlsBlob.current.set(id, resultado.url)
        }

        if (resultado.arquivoAtualizado) {
          setArquivos((prev) =>
            prev.map((arquivoItem) =>
              arquivoItem.id_arquivo_local === id
                ? { ...arquivoItem, arquivo: resultado.arquivoAtualizado! }
                : arquivoItem,
            ),
          )
        }

        if (!tentarAbrirNovaAba(resultado.url)) {
          abrirPreviewModalFallback(id, nomeArquivo, resultado.url, evidencia ?? null, false, null)
        }
      } catch {
        abaReservada?.close()
      }
    },
    [abrirPreviewModalFallback, arquivos, idLeituraExistente],
  )



  const visualizarEvidenciaRisco = useCallback((ctx: ContextoEvidenciaRiscoNovaLeitura) => {
    if (passo === 3) {
      setConferenciaSelecao({ idArquivoLocal: ctx.idArquivoLocal, indiceDocumento: 0 })
    }
    void visualizarArquivo(ctx.idArquivoLocal, ctx)
  }, [visualizarArquivo, passo])



  const visualizarDocumento = useCallback((id: string, indice: number) => {
    if (passo >= 2) {
      setConferenciaSelecao({ idArquivoLocal: id, indiceDocumento: indice })
    }
    void visualizarArquivo(id)
  }, [visualizarArquivo, passo])

  const selecionarDocumentoConferencia = useCallback((id: string, indice: number) => {
    setConferenciaSelecao({ idArquivoLocal: id, indiceDocumento: indice })
  }, [])

  useEffect(() => {
    return () => {
      if (urlPreviewRemotaRef.current && urlVisualizacaoEhBlobRevogavel(urlPreviewRemotaRef.current)) {
        URL.revokeObjectURL(urlPreviewRemotaRef.current)
        urlPreviewRemotaRef.current = null
      }
    }
  }, [])

  const fecharPreviewArquivo = useCallback(() => {
    if (urlPreviewRemotaRef.current && urlVisualizacaoEhBlobRevogavel(urlPreviewRemotaRef.current)) {
      URL.revokeObjectURL(urlPreviewRemotaRef.current)
      urlPreviewRemotaRef.current = null
    }
    setPreviewUrlRemota(null)
    setPreviewCarregando(false)
    setPreviewErro(null)
    setPreviewArquivo(null)
    setPreviewEvidencia(null)
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
    },
    [conferenciaSelecao],
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

          atualizarArquivo(idArquivoLocal, {
            status_arquivo_local: 'erro',
            leitura,
            mensagem_erro: 'Falha no processamento',
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



    const pendencias = arquivos.map(async (item) => {

      atualizarArquivo(item.id_arquivo_local, { status_arquivo_local: 'enviando' })

      try {

        const criada = await smartReadApi.enviarLeitura(item.arquivo)

        atualizarArquivo(item.id_arquivo_local, {
          status_arquivo_local: 'analisando',
          id_leitura: criada.id_leitura,
          id_arquivo: criada.id_arquivo,
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

        await pollingArquivo(item.id_arquivo_local, criada.id_leitura, item.arquivo)

      } catch (excecao) {

        atualizarArquivo(item.id_arquivo_local, {

          status_arquivo_local: 'erro',

          mensagem_erro: mensagemDeExcecao(excecao, 'Falha ao enviar arquivo'),

        })

      }

    })



    await Promise.all(pendencias)

    if (!ativo.current) return

    setEnviando(false)

  }, [arquivos, atualizarArquivo, pollingArquivo])



  async function handleFechar() {
    try {
      await salvarProgressoAtual(passo)
    } catch (erro) {
      if (import.meta.env.DEV) console.error('[smart-read][persist] fechar falhou', erro)
    }
    limparCacheAnaliseRiscosSessaoSmartRead()
    limparRequisicoesAnaliseRiscosEmVooSmartRead()
    onFechar()
  }



  function handleVoltarPasso() {

    if (passo <= 1) return

    setPasso((p) => p - 1)

  }



  async function handleContinuarPasso() {

    if (passo === 2 && !processamentoFinalizado) return

    if (passo >= 4) {

      onConcluido?.()

      await handleFechar()

      return

    }

    const proximo = passo + 1
    await salvarProgressoAtual(proximo)
    setPasso(proximo)

  }



  const podeContinuar =

    passo === 2 ? processamentoFinalizado :

    passo === 3 ? arquivos.some((a) => a.status_arquivo_local === 'completo') :

    passo === 4 ? true :

    false



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

        if (id < passo) setPasso(id)

      }}

    >

      <div className="sr-wizard-corpo">

        <PainelLateralArquivosNovaLeituraSmartRead

          passo={passo}

          nomeLeitura={nomeLeitura}

          arquivos={arquivos}

          enviando={enviando}

          podeContinuar={podeContinuar}

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
            <AreaConferenciaNovaLeituraSmartRead
              arquivos={arquivos}
              selecao={conferenciaSelecao}
              onSelecionarDocumento={setConferenciaSelecao}
              onCompararArquivo={() => setCompararAberto(true)}
              onVerEvidencia={visualizarEvidenciaRisco}
              idLeituraLegado={idLeituraAtual}
              onTokensAtualizados={contadorTokens.aplicarAtualizacaoTokens}
              onIaInicio={() => contadorTokens.marcarIaAtiva()}
              onIaFim={() => contadorTokens.marcarIaInativa()}
            />
          </div>
        )}

        {passo === 4 && (
          <AreaResultadoNovaLeituraSmartRead
            arquivos={arquivos}
            camposEditados={camposEditados.size}
            tempoTotalMs={tempoTotalMs}
          />
        )}

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

      <ModalVisualizarArquivoNovaLeituraSmartRead
        aberto={previewArquivo !== null}
        nomeArquivo={previewArquivo?.nomeArquivo ?? 'documento'}
        url={previewUrlRemota}
        carregando={previewCarregando}
        erro={previewErro}
        evidenciaRisco={previewEvidencia}
        onFechar={fecharPreviewArquivo}
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


