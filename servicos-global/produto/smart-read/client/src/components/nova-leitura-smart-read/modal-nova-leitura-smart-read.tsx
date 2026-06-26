/**

 * modal-nova-leitura-smart-read.tsx — Wizard Nova Leitura (4 passos)

 * Padrão ModalPassoPassoGlobal (Pedido Transferir) + layout legado dati.

 */



import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkle } from '@phosphor-icons/react'

import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import { iconeOficialProdutoGravity } from '@nucleo/logo-produtos'
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
  todosArquivosProcessamentoFinalizado,

  type ArquivoLocalNovaLeitura,

} from '../../shared/tipo-arquivo-nova-leitura-smart-read'

import {
  carregarProgressoLeituraSmartRead,
  limparEstadoLeituraSmartRead,
  persistirProgressoLeituraSmartRead,
} from '../../shared/persistencia-leitura-smart-read'

import {
  carregarBlobArquivoLeituraSmartRead,
  mensagemPreviewArquivoIndisponivel,
  mensagemErroPreviewArquivoRemoto,
  removerBlobArquivoLeituraSmartRead,
  resolverArquivoOriginalLeituraSmartRead,
  salvarBlobArquivoLeituraSmartRead,
} from '../../shared/persistencia-blob-arquivo-leitura-smart-read'
import {
  obterArquivoSessaoLeituraSmartRead,
  registrarArquivoSessaoLeituraSmartRead,
} from '../../shared/cache-sessao-arquivo-leitura-smart-read'

import {
  conteudoArquivoLeituraEhVisualizavel,
  mensagemConteudoArquivoInvalido,
  resolverMimePorNomeArquivo,
} from '../../../../shared/validar-conteudo-arquivo-leitura-smart-read'

import { criarObjectUrlArquivoLeitura } from '../../shared/url-blob-arquivo-leitura-smart-read'

import {
  definirValorPorCaminho,
  montarChaveCampoEditadoLeitura,
} from '../../shared/definir-valor-por-caminho-dados-leitura-smart-read'

import { PainelLateralArquivosNovaLeituraSmartRead } from './painel-lateral-arquivos-nova-leitura-smart-read'

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



const ICONE_MARCA_CABECALHO_SMART_READ = iconeOficialProdutoGravity('smart-read', 22, {
  variant: 'card',
})

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

  const [enviando, setEnviando] = useState(false)

  const [inicioAnalise, setInicioAnalise] = useState<number | null>(null)

  const [conferenciaSelecao, setConferenciaSelecao] = useState<SelecaoDocumentoConferencia | null>(null)

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
  const previewLoadGenRef = useRef(0)
  const previewRetryRenderRef = useRef(false)
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
      setCompararAberto(false)
      setPreviewArquivo(null)
      setPreviewUrlRemota(null)
      setPreviewCarregando(false)
      setPreviewErro(null)
      setCamposEditados(new Set())
      setTempoTotalMs(0)
      setArquivoExclusaoPendente(null)
      setGabiAberta(false)
      inicioSessaoRef.current = Date.now()
      if (idLeituraExistente) {
        setArquivos([])
        void hidratarLeituraExistente(idLeituraExistente)
      } else {
        setPasso(1)
        setNomeLeitura(gerarNomeLeitura())
        setArquivos(arquivosIniciais.map((arquivo) => criarArquivoLocalNovaLeitura(arquivo)))
      }
    }
    abertoAnteriorRef.current = aberto
  }, [aberto, arquivosIniciais, idLeituraExistente, hidratarLeituraExistente])

  useEffect(() => {
    if (passo === 4) {
      setTempoTotalMs((atual) => (atual === 0 ? Date.now() - inicioSessaoRef.current : atual))
    }
  }, [passo])



  useEffect(() => {

    return () => {

      for (const url of urlsBlob.current.values()) {

        URL.revokeObjectURL(url)

      }

      urlsBlob.current.clear()

    }

  }, [])



  const analiseCompleta = useMemo(() => todosArquivosAnaliseCompleta(arquivos), [arquivos])
  const processamentoFinalizado = useMemo(
    () => todosArquivosProcessamentoFinalizado(arquivos),
    [arquivos],
  )
  const processamentoComErro =
    processamentoFinalizado && !arquivos.some((item) => item.status_arquivo_local === 'completo')

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

        prev.map((item) => (item.id_arquivo_local === id ? { ...item, ...patch } : item)),

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



  const obterUrlArquivo = useCallback((id: string) => {

    const item = arquivos.find((a) => a.id_arquivo_local === id)

    if (!item) return null

    let url = urlsBlob.current.get(id)

    if (!url) {

      url = criarObjectUrlArquivoLeitura(item.arquivo)

      urlsBlob.current.set(id, url)

    }

    return url

  }, [arquivos])



  const visualizarArquivo = useCallback((id: string, evidencia?: ContextoEvidenciaRiscoNovaLeitura | null) => {

    const item = arquivos.find((a) => a.id_arquivo_local === id)

    if (!item) return

    if (urlPreviewRemotaRef.current) {
      URL.revokeObjectURL(urlPreviewRemotaRef.current)
      urlPreviewRemotaRef.current = null
    }
    setPreviewUrlRemota(null)
    setPreviewErro(null)
    setPreviewEvidencia(evidencia ?? null)
    previewLoadGenRef.current += 1
    previewRetryRenderRef.current = false
    const temBlobLocal = arquivoLocalTemBlobVisualizavel(item.arquivo)
    setPreviewCarregando(!temBlobLocal)
    setPreviewArquivo({ idArquivoLocal: id, nomeArquivo: item.arquivo.name })

  }, [arquivos])



  const visualizarEvidenciaRisco = useCallback((ctx: ContextoEvidenciaRiscoNovaLeitura) => {
    if (passo === 3) {
      setConferenciaSelecao({ idArquivoLocal: ctx.idArquivoLocal, indiceDocumento: 0 })
    }
    visualizarArquivo(ctx.idArquivoLocal, ctx)
  }, [visualizarArquivo, passo])



  const visualizarDocumento = useCallback((id: string, indice: number) => {

    if (passo === 3) {
      setConferenciaSelecao({ idArquivoLocal: id, indiceDocumento: indice })
    }

    visualizarArquivo(id)

  }, [visualizarArquivo, passo])

  const previewArquivoItem = useMemo(
    () =>
      previewArquivo
        ? arquivos.find((a) => a.id_arquivo_local === previewArquivo.idArquivoLocal) ?? null
        : null,
    [arquivos, previewArquivo],
  )

  const previewUrlLocal = useMemo(() => {
    if (!previewArquivoItem || !arquivoLocalTemBlobVisualizavel(previewArquivoItem.arquivo)) return null
    return obterUrlArquivo(previewArquivoItem.id_arquivo_local)
  }, [previewArquivoItem, obterUrlArquivo])

  const validarBlobLocal = useCallback(async (blob: Blob, nomeArquivo: string): Promise<Blob | null> => {
    const bytes = new Uint8Array(await blob.arrayBuffer())
    if (!conteudoArquivoLeituraEhVisualizavel(bytes, nomeArquivo)) return null
    const mime =
      blob.type && blob.type !== 'application/octet-stream'
        ? blob.type
        : resolverMimePorNomeArquivo(nomeArquivo)
    return new Blob([bytes], { type: mime })
  }, [])

  const aplicarBlobPreview = useCallback(async (blob: Blob, gen: number, nomeArquivo: string) => {
    if (gen !== previewLoadGenRef.current) return false
    const validado = await validarBlobLocal(blob, nomeArquivo)
    if (!validado) {
      setPreviewErro(mensagemConteudoArquivoInvalido(nomeArquivo))
      return false
    }
    if (urlPreviewRemotaRef.current) {
      URL.revokeObjectURL(urlPreviewRemotaRef.current)
    }
    const url = criarObjectUrlArquivoLeitura(validado, nomeArquivo)
    urlPreviewRemotaRef.current = url
    setPreviewUrlRemota(url)
    return true
  }, [validarBlobLocal])

  const chavePreviewRemoto = previewArquivoItem
    ? `${previewArquivoItem.id_leitura ?? ''}:${previewArquivoItem.id_arquivo ?? ''}:${previewArquivo?.idArquivoLocal ?? ''}`
    : null

  useEffect(() => {
    if (!previewArquivo || !previewArquivoItem || !chavePreviewRemoto) return

    if (arquivoLocalTemBlobVisualizavel(previewArquivoItem.arquivo)) {
      setPreviewCarregando(false)
      setPreviewErro(null)
      return
    }

    const idLeitura =
      previewArquivoItem.id_leitura ?? idLeituraExistente ?? previewArquivoItem.leitura?.id_leitura ?? null
    const idArquivo = previewArquivoItem.id_arquivo
    const nomeArquivo = previewArquivo?.nomeArquivo ?? previewArquivoItem.arquivo.name
    if (!idLeitura || !idArquivo) {
      setPreviewCarregando(false)
      setPreviewErro(mensagemPreviewArquivoIndisponivel(nomeArquivo))
      return
    }

    const gen = ++previewLoadGenRef.current
    setPreviewCarregando(true)
    setPreviewErro(null)

    ;(async () => {
      try {
        const idLeitura =
          previewArquivoItem.id_leitura ?? idLeituraExistente ?? previewArquivoItem.leitura?.id_leitura ?? null
        const daSessao =
          idLeitura != null
            ? obterArquivoSessaoLeituraSmartRead(idLeitura, idArquivo, nomeArquivo)
            : null
        let blob: Blob | null = daSessao

        if (!blob?.size && idLeitura) {
          const resolvido = await resolverArquivoOriginalLeituraSmartRead(
            idLeitura,
            idArquivo,
            nomeArquivo,
            daSessao,
          )
          blob = resolvido
        }

        if (!blob || blob.size === 0) {
          try {
            blob = await smartReadApi.obterArquivoLeitura(idLeitura, idArquivo, nomeArquivo)
          } catch (excecao) {
            if (gen !== previewLoadGenRef.current) return
            setPreviewErro(mensagemErroPreviewArquivoRemoto(excecao, nomeArquivo))
            return
          }
        }

        if (gen !== previewLoadGenRef.current) return

        if (!blob || blob.size === 0) {
          setPreviewErro(mensagemPreviewArquivoIndisponivel(nomeArquivo))
          return
        }

        if (idLeitura) {
          registrarArquivoSessaoLeituraSmartRead(idLeitura, blob instanceof File ? blob : new File([blob], nomeArquivo), idArquivo)
          if (idArquivo) {
            void salvarBlobArquivoLeituraSmartRead(idLeitura, idArquivo, blob, nomeArquivo)
          }
        }

        setArquivos((prev) =>
          prev.map((item) =>
            item.id_arquivo_local === previewArquivoItem.id_arquivo_local
              ? {
                  ...item,
                  arquivo: blob instanceof File ? blob : new File([blob], nomeArquivo, { type: blob.type }),
                }
              : item,
          ),
        )

        await aplicarBlobPreview(blob, gen, nomeArquivo)
      } catch {
        if (gen !== previewLoadGenRef.current) return
        setPreviewErro(mensagemPreviewArquivoIndisponivel(nomeArquivo))
      } finally {
        if (gen === previewLoadGenRef.current) {
          setPreviewCarregando(false)
        }
      }
    })()
  }, [aplicarBlobPreview, chavePreviewRemoto, idLeituraExistente, previewArquivo, previewArquivoItem, validarBlobLocal])

  const tratarErroRenderPreview = useCallback(async () => {
    if (!previewArquivoItem || !previewArquivo) return
    const nomeArquivo = previewArquivo.nomeArquivo
    if (nomeArquivo.toLowerCase().endsWith('.pdf')) return

    if (previewRetryRenderRef.current) {
      setPreviewErro(mensagemConteudoArquivoInvalido(nomeArquivo))
      return
    }
    previewRetryRenderRef.current = true

    if (arquivoLocalTemBlobVisualizavel(previewArquivoItem.arquivo)) {
      const idLocal = previewArquivoItem.id_arquivo_local
      const urlAnterior = urlsBlob.current.get(idLocal)
      if (urlAnterior) URL.revokeObjectURL(urlAnterior)
      const urlCorrigida = criarObjectUrlArquivoLeitura(previewArquivoItem.arquivo)
      urlsBlob.current.set(idLocal, urlCorrigida)
      if (urlPreviewRemotaRef.current) {
        URL.revokeObjectURL(urlPreviewRemotaRef.current)
        urlPreviewRemotaRef.current = null
      }
      setPreviewUrlRemota(urlCorrigida)
      setPreviewErro(null)
      setPreviewCarregando(false)
      return
    }

    const idLeitura =
      previewArquivoItem.id_leitura ?? idLeituraExistente ?? previewArquivoItem.leitura?.id_leitura ?? null
    const idArquivo = previewArquivoItem.id_arquivo
    const daSessao =
      idLeitura != null
        ? obterArquivoSessaoLeituraSmartRead(idLeitura, idArquivo, nomeArquivo)
        : null
    if (daSessao) {
      setArquivos((prev) =>
        prev.map((item) =>
          item.id_arquivo_local === previewArquivoItem.id_arquivo_local
            ? { ...item, arquivo: daSessao }
            : item,
        ),
      )
      const urlCorrigida = criarObjectUrlArquivoLeitura(daSessao)
      setPreviewUrlRemota(urlCorrigida)
      setPreviewErro(null)
      setPreviewCarregando(false)
      return
    }

    const idLeituraRetry = idLeitura
    if (!idLeituraRetry || !idArquivo) {
      setPreviewErro(mensagemPreviewArquivoIndisponivel(nomeArquivo))
      setPreviewCarregando(false)
      return
    }

    const resolvido = await resolverArquivoOriginalLeituraSmartRead(
      idLeituraRetry,
      idArquivo,
      nomeArquivo,
    )
    if (resolvido) {
      setArquivos((prev) =>
        prev.map((item) =>
          item.id_arquivo_local === previewArquivoItem.id_arquivo_local
            ? { ...item, arquivo: resolvido }
            : item,
        ),
      )
      await aplicarBlobPreview(resolvido, previewLoadGenRef.current, nomeArquivo)
      setPreviewCarregando(false)
      return
    }

    try {
      const remoto = await smartReadApi.obterArquivoLeitura(idLeituraRetry, idArquivo, nomeArquivo)
      setArquivos((prev) =>
        prev.map((item) =>
          item.id_arquivo_local === previewArquivoItem.id_arquivo_local
            ? { ...item, arquivo: new File([remoto], nomeArquivo, { type: remoto.type }) }
            : item,
        ),
      )
      void salvarBlobArquivoLeituraSmartRead(idLeituraRetry, idArquivo, remoto, nomeArquivo)
      await aplicarBlobPreview(remoto, previewLoadGenRef.current, nomeArquivo)
      setPreviewCarregando(false)
      return
    } catch (excecao) {
      setPreviewErro(mensagemErroPreviewArquivoRemoto(excecao, nomeArquivo))
      setPreviewCarregando(false)
      return
    }

    setPreviewErro(mensagemPreviewArquivoIndisponivel(nomeArquivo))
    setPreviewCarregando(false)
  }, [aplicarBlobPreview, idLeituraExistente, previewArquivo, previewArquivoItem])

  useEffect(() => {
    return () => {
      if (urlPreviewRemotaRef.current) {
        URL.revokeObjectURL(urlPreviewRemotaRef.current)
        urlPreviewRemotaRef.current = null
      }
    }
  }, [])

  const fecharPreviewArquivo = useCallback(() => {
    if (urlPreviewRemotaRef.current) {
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
          if (extracao?.dados) definirValorPorCaminho(extracao.dados, chave, valor)
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

      const persistirArquivoOriginal = (idArquivo: string | null | undefined) => {
        if (!arquivoOriginal.size) return
        registrarArquivoSessaoLeituraSmartRead(idLeitura, arquivoOriginal, idArquivo)
        if (idArquivo) {
          void salvarBlobArquivoLeituraSmartRead(
            idLeitura,
            idArquivo,
            arquivoOriginal,
            arquivoOriginal.name,
          )
        }
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
            expandido: true,
          })
          return
        }

        if (leitura.status_leitura === 'FAILED') {

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

      titulo="Smart Read"

      tituloNode={<span className="sr-wizard-cabecalho-marca-texto">Smart Read</span>}

      icone={ICONE_MARCA_CABECALHO_SMART_READ}

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

          onEnviar={() => void enviarArquivos()}

          onCancelar={() => void handleFechar()}

          onVoltar={passo > 1 ? handleVoltarPasso : undefined}

          onContinuar={passo >= 2 ? handleContinuarPasso : undefined}

        />



        {passo === 1 && <AreaAnexarNovaLeituraSmartRead onArquivosAdicionados={adicionarArquivos} />}

        {passo === 2 && (

          <DashboardAnaliseNovaLeituraSmartRead
            arquivos={arquivos}
            analiseCompleta={analiseCompleta}
            processamentoComErro={processamentoComErro}
            inicioAnalise={inicioAnalise}
          />

        )}

        {passo === 3 && (
          <AreaConferenciaNovaLeituraSmartRead
            arquivos={arquivos}
            selecao={conferenciaSelecao}
            onSelecionarDocumento={setConferenciaSelecao}
            onCompararArquivo={() => setCompararAberto(true)}
            onVerEvidencia={visualizarEvidenciaRisco}
          />
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
        url={previewUrlRemota ?? previewUrlLocal}
        carregando={previewCarregando}
        erro={previewErro}
        evidenciaRisco={previewEvidencia}
        onErroRender={tratarErroRenderPreview}
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


