/**
 * SmartImportModal.tsx — Modal de importacao inteligente de pedidos (4 etapas)
 *
 * Etapas:
 *   1. Upload — drag-and-drop de arquivo
 *   2. Mapeamento — coluna arquivo → campo sistema, com confianca visual
 *   3. Preview — linhas com status ok/aviso/erro, decisoes de duplicata
 *   4. Confirmacao — resultado final
 *
 * Props:
 *   aberto      — controla visibilidade
 *   onFechar    — callback para fechar
 *   onConcluido — callback com IDs criados (para recarregar lista)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { UploadSimple } from '@phosphor-icons/react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import { EtapaUpload }       from './EtapaUpload'
import { EtapaMapeamento }   from './EtapaMapeamento'
import { EtapaPreview }      from './EtapaPreview'
import { EtapaConfirmacao }  from './EtapaConfirmacao'
import { smartImportApi }    from '../../shared/api'
import type {
  ColunaMapeada,
  SmartImportPreview,
  SmartImportLinha,
  SmartImportResultado,
  DecisaoDuplicata,
  SmartImportConfirmar,
} from '../../shared/types'
import './ModalPedidoSmartImport.css'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ModalSmartImportPedidoProps {
  aberto: boolean
  onFechar: () => void
  onConcluido: (idsCriados: string[]) => void
  /** Recarrega a lista sem fechar o modal (chamado logo após confirmar importação). */
  onListaAlterada?: () => void | Promise<void>
}

// ── Tipos internos ────────────────────────────────────────────────────────────

type Etapa = 'upload' | 'mapeamento' | 'preview' | 'confirmacao'

/** Sincroniza a lista de pedidos (Kanban/lista) sem fechar o modal de confirmação. */
function notificarPedidosAtualizados() {
  window.dispatchEvent(
    new CustomEvent('pedido:atualizado', { detail: { origem: 'smart-import' } }),
  )
}

type TFunc = (key: string, opts?: Record<string, unknown>) => string

/**
 * Estrutura rica de erro — substitui mensagem string por objeto com sugestoes
 * contextuais. Cada `code` mapeia para `titulo` + `mensagem` + `sugestoes`.
 *
 * Mand. 08 — jamais mascara totalmente o detalhe tecnico. O `code` aparece
 * sempre no rodape do alerta para suporte/debug.
 */
export interface ErroDetalhado {
  code: string                 // Para suporte/debug — sempre presente
  titulo: string               // "O que aconteceu" — uma linha
  mensagem: string             // Frase principal explicativa
  causa?: string               // "Por que aconteceu" — contexto opcional
  sugestoes: string[]          // Lista de acoes praticas
  retryable: boolean           // Mostra botao "Tentar novamente"?
  acoes?: Array<{ label: string; tipo: 'baixar_template' | 'recarregar' }>
}

/** Extrai message + code do response body do backend. */
async function lerErroBody(res: Response): Promise<{ message: string; code: string }> {
  const body = await res.json().catch(() => null) as { error?: { message?: string; code?: string } } | null
  return {
    message: body?.error?.message ?? `HTTP ${res.status}`,
    code:    body?.error?.code    ?? `HTTP_${res.status}`,
  }
}

/**
 * Traduz erro do backend (com code) ou erro de cliente (Failed to fetch, etc.)
 * para `ErroDetalhado` com sugestoes contextuais. Cobre todos os codes do backend
 * + erros de rede + HTTP genericos.
 */
function traduzirErroDetalhado(
  err: unknown,
  contexto: 'upload' | 'confirmar',
  t: TFunc,
  codeBackend?: string,
): ErroDetalhado {
  const msg = err instanceof Error ? err.message : String(err ?? '')

  // eslint-disable-next-line no-console
  console.error('[SmartImport] erro capturado (raw):', err, 'msg:', msg, 'code:', codeBackend)

  // ── Erros de rede / browser ─────────────────────────────────────────────
  if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      titulo: t('pedido.smart_import.err_network_titulo'),
      mensagem: t('pedido.smart_import.err_network_msg'),
      causa: t('pedido.smart_import.err_network_causa'),
      sugestoes: [
        t('pedido.smart_import.err_network_sug1'),
        t('pedido.smart_import.err_network_sug2'),
        t('pedido.smart_import.err_network_sug3'),
      ],
      retryable: true,
    }
  }

  // ── Codes do backend (mais especificos) ─────────────────────────────────
  switch (codeBackend) {
    case 'ARQUIVO_AUSENTE':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_arquivo_ausente_titulo'),
        mensagem: t('pedido.smart_import.err_arquivo_ausente_msg'),
        sugestoes: [
          t('pedido.smart_import.err_arquivo_ausente_sug1'),
          t('pedido.smart_import.err_arquivo_ausente_sug2'),
        ],
        retryable: false,
      }

    case 'ARQUIVO_SEM_DADOS':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_sem_dados_titulo'),
        mensagem: t('pedido.smart_import.err_sem_dados_msg'),
        causa: t('pedido.smart_import.err_sem_dados_causa'),
        sugestoes: [
          t('pedido.smart_import.err_sem_dados_sug1'),
          t('pedido.smart_import.err_sem_dados_sug2'),
          t('pedido.smart_import.err_sem_dados_sug3'),
          t('pedido.smart_import.err_sem_dados_sug4'),
        ],
        retryable: false,
        acoes: [{ label: t('pedido.smart_import.acao_baixar_template'), tipo: 'baixar_template' }],
      }

    case 'FORMATO_NAO_SUPORTADO':
    case 'FORMATO_INVALIDO':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_formato_titulo'),
        mensagem: msg || t('pedido.smart_import.err_formato_msg'),
        sugestoes: [
          t('pedido.smart_import.err_formato_sug1'),
          t('pedido.smart_import.err_formato_sug2'),
          t('pedido.smart_import.err_formato_sug3'),
        ],
        retryable: false,
      }

    case 'JSON_FORMATO_INVALIDO':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_json_formato_titulo'),
        mensagem: t('pedido.smart_import.err_json_formato_msg'),
        causa: t('pedido.smart_import.err_json_formato_causa'),
        sugestoes: [
          t('pedido.smart_import.err_json_formato_sug1'),
          t('pedido.smart_import.err_json_formato_sug2'),
          t('pedido.smart_import.err_json_formato_sug3'),
        ],
        retryable: false,
      }

    case 'JSON_MALFORMADO':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_json_malformado_titulo'),
        mensagem: msg || t('pedido.smart_import.err_json_malformado_msg'),
        causa: t('pedido.smart_import.err_json_malformado_causa'),
        sugestoes: [
          t('pedido.smart_import.err_json_malformado_sug1'),
          t('pedido.smart_import.err_json_malformado_sug2'),
          t('pedido.smart_import.err_json_malformado_sug3'),
          t('pedido.smart_import.err_json_malformado_sug4'),
        ],
        retryable: false,
      }

    case 'JSON_VAZIO':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_json_vazio_titulo'),
        mensagem: t('pedido.smart_import.err_json_vazio_msg'),
        causa: t('pedido.smart_import.err_json_vazio_causa'),
        sugestoes: [
          t('pedido.smart_import.err_json_vazio_sug1'),
          t('pedido.smart_import.err_json_vazio_sug2'),
          t('pedido.smart_import.err_json_vazio_sug3'),
        ],
        retryable: false,
      }

    case 'PDF_PROTEGIDO':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_pdf_protegido_titulo'),
        mensagem: t('pedido.smart_import.err_pdf_protegido_msg'),
        sugestoes: [
          t('pedido.smart_import.err_pdf_protegido_sug1'),
          t('pedido.smart_import.err_pdf_protegido_sug2'),
          t('pedido.smart_import.err_pdf_protegido_sug3'),
        ],
        retryable: false,
      }

    case 'PDF_ESCANEADO':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_pdf_escaneado_titulo'),
        mensagem: t('pedido.smart_import.err_pdf_escaneado_msg'),
        causa: t('pedido.smart_import.err_pdf_escaneado_causa'),
        sugestoes: [
          t('pedido.smart_import.err_pdf_escaneado_sug1'),
          t('pedido.smart_import.err_pdf_escaneado_sug2'),
          t('pedido.smart_import.err_pdf_escaneado_sug3'),
        ],
        retryable: false,
      }

    case 'PDF_INVALIDO':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_pdf_invalido_titulo'),
        mensagem: msg || t('pedido.smart_import.err_pdf_invalido_msg'),
        causa: t('pedido.smart_import.err_pdf_invalido_causa'),
        sugestoes: [
          t('pedido.smart_import.err_pdf_invalido_sug1'),
          t('pedido.smart_import.err_pdf_invalido_sug2'),
          t('pedido.smart_import.err_pdf_invalido_sug3'),
        ],
        retryable: false,
      }

    case 'RATE_LIMIT_EXCEEDED':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_rate_limit_titulo'),
        mensagem: t('pedido.smart_import.err_rate_limit_msg'),
        sugestoes: [
          t('pedido.smart_import.err_rate_limit_sug1'),
          t('pedido.smart_import.err_rate_limit_sug2'),
        ],
        retryable: true,
      }

    case 'UNAUTHORIZED_PREVIEW':
      return {
        code: codeBackend,
        titulo: t('pedido.smart_import.err_unauth_preview_titulo'),
        mensagem: t('pedido.smart_import.err_unauth_preview_msg'),
        sugestoes: [
          t('pedido.smart_import.err_unauth_preview_sug1'),
          t('pedido.smart_import.err_unauth_preview_sug2'),
        ],
        retryable: false,
        acoes: [{ label: t('pedido.smart_import.acao_recarregar_pagina'), tipo: 'recarregar' }],
      }
  }

  // ── HTTP genericos (sem code do backend) ────────────────────────────────
  if (/^HTTP_5\d\d|^HTTP 5\d\d/.test(codeBackend ?? msg)) {
    return {
      code: codeBackend ?? 'HTTP_500',
      titulo: t('pedido.smart_import.err_http500_titulo'),
      mensagem: t('pedido.smart_import.err_http500_msg'),
      sugestoes: [
        t('pedido.smart_import.err_http500_sug1'),
        t('pedido.smart_import.err_http500_sug2'),
      ],
      retryable: true,
    }
  }

  if (codeBackend === 'HTTP_413' || msg === 'HTTP 413') {
    return {
      code: 'HTTP_413',
      titulo: t('pedido.smart_import.err_http413_titulo'),
      mensagem: t('pedido.smart_import.err_http413_msg'),
      sugestoes: [
        t('pedido.smart_import.err_http413_sug1'),
        t('pedido.smart_import.err_http413_sug2'),
        t('pedido.smart_import.err_http413_sug3'),
      ],
      retryable: false,
    }
  }

  if (codeBackend === 'HTTP_401' || msg === 'HTTP 401' ||
      codeBackend === 'UNAUTHENTICATED' || msg.includes('Authorization')) {
    return {
      code: 'HTTP_401',
      titulo: t('pedido.smart_import.err_http401_titulo'),
      mensagem: t('pedido.smart_import.err_http401_msg'),
      sugestoes: [
        t('pedido.smart_import.err_http401_sug1'),
        t('pedido.smart_import.err_http401_sug2'),
      ],
      retryable: false,
      acoes: [{ label: t('pedido.smart_import.acao_recarregar_pagina'), tipo: 'recarregar' }],
    }
  }

  if (codeBackend === 'HTTP_403' || msg === 'HTTP 403') {
    return {
      code: 'HTTP_403',
      titulo: t('pedido.smart_import.err_http403_titulo'),
      mensagem: t('pedido.smart_import.err_http403_msg'),
      sugestoes: [
        t('pedido.smart_import.err_http403_sug1'),
      ],
      retryable: false,
    }
  }

  if (codeBackend === 'HTTP_408' || msg === 'HTTP 408' || msg.includes('408')) {
    return {
      code: 'HTTP_408',
      titulo: t('pedido.smart_import.err_http408_titulo'),
      mensagem: t('pedido.smart_import.err_http408_msg'),
      causa: t('pedido.smart_import.err_http408_causa'),
      sugestoes: [
        t('pedido.smart_import.err_http408_sug1'),
        t('pedido.smart_import.err_http408_sug2'),
        t('pedido.smart_import.err_http408_sug3'),
      ],
      retryable: true,
    }
  }

  // ── Fallback: erro com mensagem do backend mas sem code conhecido ──────
  if (msg && msg.length > 0 && !msg.startsWith('HTTP ')) {
    return {
      code: codeBackend ?? 'ERRO_DESCONHECIDO',
      titulo: contexto === 'upload' ? t('pedido.smart_import.err_fallback_upload_titulo') : t('pedido.smart_import.err_fallback_concluir_titulo'),
      mensagem: msg,
      sugestoes: [
        t('pedido.smart_import.err_fallback_sug1'),
        t('pedido.smart_import.err_fallback_sug2'),
      ],
      retryable: true,
    }
  }

  // ── Fallback final ──────────────────────────────────────────────────────
  return {
    code: codeBackend ?? 'ERRO_DESCONHECIDO',
    titulo: contexto === 'upload' ? t('pedido.smart_import.err_final_upload_titulo') : t('pedido.smart_import.err_final_confirmar_titulo'),
    mensagem: msg || (contexto === 'upload'
      ? t('pedido.smart_import.err_upload_gen')
      : t('pedido.smart_import.err_confirmar_gen')),
    sugestoes: [
      t('pedido.smart_import.err_final_sug1'),
      t('pedido.smart_import.err_final_sug2'),
    ],
    retryable: true,
  }
}

/**
 * @deprecated Use traduzirErroDetalhado. Mantido como wrapper para compatibilidade
 * com chamadas legadas (etapa confirmar) que ainda esperam string.
 */
function traduzirErro(err: unknown, contexto: 'upload' | 'confirmar' = 'upload', t: TFunc): string {
  const detalhado = traduzirErroDetalhado(err, contexto, t)
  return detalhado.mensagem
}

const ORDEM_ETAPAS: Etapa[] = ['upload', 'mapeamento', 'preview', 'confirmacao']

// ── PASSOS_IMPORT — definido dentro do componente via useMemo([t]) ─────────────

function etapaParaId(e: Etapa): number {
  return ORDEM_ETAPAS.indexOf(e) + 1
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalSmartImportPedido({ aberto, onFechar, onConcluido, onListaAlterada }: ModalSmartImportPedidoProps) {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()
  const { getToken } = useAuth()

  const PASSOS_IMPORT = useMemo<PassoConfig[]>(() => [
    { id: 1, label: t('pedido.smart_import.passo_upload') },
    { id: 2, label: t('pedido.smart_import.passo_mapeamento') },
    { id: 3, label: t('pedido.smart_import.passo_preview') },
    { id: 4, label: t('pedido.smart_import.passo_resultado') },
  ], [t])
  const [etapa, setEtapa]             = useState<Etapa>('upload')
  const [analisando, setAnalisando]   = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  // Erro rico — substitui string simples por estrutura ErroDetalhado com sugestoes contextuais.
  const [erro, setErro]               = useState<ErroDetalhado | null>(null)

  // Dados do fluxo
  const [preview, setPreview]                   = useState<SmartImportPreview | null>(null)
  const [mapeamento, setMapeamento]             = useState<ColunaMapeada[]>([])
  const [lembrarMapeamento, setLembrarMapeamento] = useState(true)
  const [linhasSelecionadas, setLinhasSelecionadas] = useState<Set<number>>(new Set())
  const [decisoesDuplicatas, setDecisoesDuplicatas] = useState<Record<string, DecisaoDuplicata>>({})
  const [numerosEditados, setNumerosEditados]     = useState<Record<number, string>>({})
  const [resultado, setResultado]               = useState<SmartImportResultado | null>(null)

  // Multi-sheet
  const [planilhas, setPlanilhas]                     = useState<string[]>([])
  const [planilhaSelecionada, setPlanilhaSelecionada] = useState<string | undefined>()
  const [arquivoAtual, setArquivoAtual]               = useState<File | null>(null)

  const [msgProgresso, setMsgProgresso] = React.useState(() => t('pedido.smart_import.analisando'))
  const [analiseDemorada, setAnaliseDemorada] = React.useState(false)

  React.useEffect(() => {
    if (!analisando) {
      setAnaliseDemorada(false)
      return
    }
    const timerDemorada = setTimeout(() => setAnaliseDemorada(true), 30_000)
    return () => clearTimeout(timerDemorada)
  }, [analisando])

  React.useEffect(() => {
    if (!analisando) return
    const isPdf = arquivoAtual?.name.toLowerCase().endsWith('.pdf') ?? false
    const msgs = isPdf
      ? [
          t('pedido.smart_import.prog_pdf_1'),
          t('pedido.smart_import.prog_pdf_2'),
          t('pedido.smart_import.prog_pdf_3'),
          t('pedido.smart_import.prog_pdf_4'),
          t('pedido.smart_import.prog_pdf_5'),
          t('pedido.smart_import.prog_pdf_6'),
        ]
      : [
          t('pedido.smart_import.prog_xlsx_1'),
          t('pedido.smart_import.prog_xlsx_2'),
          t('pedido.smart_import.prog_xlsx_3'),
          t('pedido.smart_import.prog_xlsx_4'),
        ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % msgs.length
      setMsgProgresso(msgs[idx])
    }, isPdf ? 4000 : 1800)
    return () => clearInterval(interval)
  }, [analisando, arquivoAtual, t])

  // Resetar ao fechar
  useEffect(() => {
    if (!aberto) {
      setTimeout(() => {
        setEtapa('upload')
        setAnalisando(false)
        setConfirmando(false)
        setErro(null)
        setPreview(null)
        setMapeamento([])
        setLinhasSelecionadas(new Set())
        setDecisoesDuplicatas({})
        setNumerosEditados({})
        setResultado(null)
        setPlanilhas([])
        setPlanilhaSelecionada(undefined)
        setArquivoAtual(null)
        setMsgProgresso(t('pedido.smart_import.analisando'))
        setAnaliseDemorada(false)
      }, 300)
    }
  }, [aberto])

  // Fechar com Escape
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto, onFechar])

  // Etapa 1: arquivo selecionado → chamar API
  const handleArquivoSelecionado = useCallback(async (arquivo: File, nomePlanilha?: string) => {
    setArquivoAtual(arquivo)
    setAnalisando(true)
    setErro(null)

    try {
      const formData = new FormData()
      formData.append('arquivo', arquivo)
      const url = nomePlanilha
        ? `/api/v1/pedidos/importacoes-inteligentes/analisar?sheet=${encodeURIComponent(nomePlanilha)}`
        : '/api/v1/pedidos/importacoes-inteligentes/analisar'

      const idOrganizacao =
        sessionStorage.getItem('gravity_id_organizacao') ||
        import.meta.env.VITE_DEV_ID_ORGANIZACAO ||
        ''
      // P17 — Portao 3 (security 12/05/2026 sessao paralela) exige x-id-workspace
      // em rotas do produto Pedido. Header vem do sessionStorage definido pelo
      // Shell em SelecionarWorkspace.tsx (chave gravity_company_id por convencao).
      const idWorkspace = sessionStorage.getItem('gravity_company_id') || ''
      const token = await getToken()
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-id-organizacao':       idOrganizacao,
          ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
          'x-chave-interna-servico': import.meta.env.VITE_CHAVE_INTERNA_SERVICO || '',
        },
      })
      if (!res.ok) {
        const { message, code } = await lerErroBody(res)
        // Lanca erro com code anexado para o catch traduzir corretamente.
        const errToThrow = new Error(message) as Error & { codeBackend: string }
        errToThrow.codeBackend = code
        throw errToThrow
      }
      const dados = await res.json() as Record<string, unknown>

      // Multiplas planilhas — mostrar seletor
      if (dados.multiplas_planilhas) {
        setPlanilhas((dados.planilhas as string[]) ?? [])
        return
      }

      // Preview normal
      const previewDados = dados as unknown as SmartImportPreview
      setPreview(previewDados)
      setMapeamento(previewDados.mapeamento)

      // Pre-selecionar linhas ok + aviso (apenas 'erro' fica desmarcada)
      const validas = new Set(
        previewDados.linhas
          .filter((l: { status: string }) => l.status !== 'erro')
          .map((l: { linha_arquivo: number }) => l.linha_arquivo)
      )
      setLinhasSelecionadas(validas)

      // Duplicatas detectadas ficam SEM decisão por default — backend faz
      // append incremental (adiciona itens ao pedido existente). Usuário pode
      // mudar para 'sobrescrever' ou 'pular' na UI de preview.
      setDecisoesDuplicatas({})

      setEtapa('mapeamento')
    } catch (err: unknown) {
      const codeBackend = (err as { codeBackend?: string })?.codeBackend
      setErro(traduzirErroDetalhado(err, 'upload', t, codeBackend))
    } finally {
      setAnalisando(false)
    }
  }, [])

  // P2.4 — Conflitos calculados sobre o mapeamento atual (reflete edicoes do usuario)
  const conflitosAtuais = (() => {
    const grupos = new Map<string, string[]>()
    for (const col of mapeamento) {
      if (!col.campo_sistema) continue
      if (col.nivel === 'ignorado') continue
      const arr = grupos.get(col.campo_sistema) ?? []
      arr.push(col.coluna_arquivo)
      grupos.set(col.campo_sistema, arr)
    }
    return Array.from(grupos.entries())
      .filter(([, cols]) => cols.length >= 2)
      .map(([campo_sistema, colunas_arquivo]) => ({ campo_sistema, colunas_arquivo }))
  })()

  // Avancar do mapeamento para preview
  function handleAvancarParaPreview() {
    // P2.4 — Bloqueia avanco se ha conflitos (banner vermelho fixo no topo
    // ja explica o problema; botao "Continuar" tambem fica disabled).
    if (conflitosAtuais.length > 0) return
    setEtapa('preview')
  }

  // Confirmar importacao
  const handleConfirmar = useCallback(async () => {
    if (!preview) return
    setConfirmando(true)
    setErro(null)

    const payload: SmartImportConfirmar = {
      preview_id: preview.preview_id,
      mapeamento_confirmado: mapeamento,
      decisoes_duplicatas: decisoesDuplicatas,
      linhas_incluidas: Array.from(linhasSelecionadas),
      salvar_mapeamento: lembrarMapeamento,
      numeros_editados: Object.keys(numerosEditados).length > 0 ? numerosEditados : undefined,
      linhas: preview.linhas,
    }

    try {
      const dados = await smartImportApi.confirmar(payload)
      setResultado(dados)
      setEtapa('confirmacao')
      if (dados.criados > 0 || dados.atualizados > 0) {
        void onListaAlterada?.()
        notificarPedidosAtualizados()
      }
      const totalProcessados = dados.criados + dados.atualizados
      addNotification({ type: 'success', message: t('pedido.smart_import.toast_sucesso', { count: totalProcessados }), duration: 4000 })
    } catch (err: unknown) {
      const codeBackend = (err as { codeBackend?: string })?.codeBackend
      const detalhado = traduzirErroDetalhado(err, 'confirmar', t, codeBackend)
      setErro(detalhado)
      addNotification({ type: 'error', message: t('pedido.smart_import.toast_falha', { msg: detalhado.mensagem }), duration: 4000 })
    } finally {
      setConfirmando(false)
    }
  }, [preview, mapeamento, decisoesDuplicatas, linhasSelecionadas, lembrarMapeamento, numerosEditados, addNotification, onListaAlterada, t])

  function handleDecisaoDuplicata(numeroPedido: string, decisao: DecisaoDuplicata) {
    setDecisoesDuplicatas(prev => ({ ...prev, [numeroPedido]: decisao }))
  }

  function handleNumeroEditado(linhaArquivo: number, numero: string) {
    setNumerosEditados(prev => ({ ...prev, [linhaArquivo]: numero }))
  }

  // P18.2 — Edita o valor exemplo da coluna do arquivo (1a linha) na etapa Mapeamento.
  //
  // 2 efeitos simultaneos:
  //   (a) Atualiza `mapeamento[i].valor_exemplo_coluna_pedido` — afeta o que aparece
  //       na celula "Valor Extraido" do mapeamento.
  //   (b) Atualiza `preview.dados_brutos[0].valores[col.coluna_arquivo]` E
  //       `preview.linhas[0].dados[col.campo_sistema]` — afeta o valor real que
  //       sera gravado quando o usuario confirmar (payload.linhas no /confirmar).
  //
  // Para edicao por linha (qualquer outra linha alem da 1a), o usuario usa o
  // Preview (P15.2 — onEditarCampoLinha).
  function handleValorExemploEditado(indexColuna: number, novoValor: string) {
    setMapeamento(prev => {
      const novo = [...prev]
      if (novo[indexColuna]) {
        novo[indexColuna] = { ...novo[indexColuna], valor_exemplo_coluna_pedido: novoValor }
      }
      return novo
    })
    setPreview(prev => {
      if (!prev) return prev
      const colArquivo = mapeamento[indexColuna]?.coluna_arquivo
      const campoSis   = mapeamento[indexColuna]?.campo_sistema
      if (!colArquivo) return prev
      // (b1) Atualiza dados_brutos[0] (visualizacao do documento)
      const dadosBrutosAtualizados = prev.dados_brutos
        ? prev.dados_brutos.map((row, i) =>
            i === 0 ? { ...row, valores: { ...row.valores, [colArquivo]: novoValor } } : row
          )
        : prev.dados_brutos
      // (b2) Atualiza linhas[0].dados[campo_sistema] (valor real para o /confirmar)
      const linhasAtualizadas = prev.linhas.map((l, i) => {
        if (i !== 0) return l
        if (!campoSis) return l
        return { ...l, dados: { ...l.dados, [campoSis]: novoValor } }
      })
      return { ...prev, dados_brutos: dadosBrutosAtualizados, linhas: linhasAtualizadas }
    })
  }

  // P15.1 — Adiciona uma nova SmartImportLinha (tipo ITEM) ao preview
  function handleAdicionarItemInline(linhaPedido: SmartImportLinha, dadosItem: Record<string, unknown>) {
    setPreview(prev => {
      if (!prev) return prev
      // Calcula proximo linha_arquivo (max + 1) para nao colidir com linhas reais
      const maxLinhaArquivo = prev.linhas.reduce((acc, l) => Math.max(acc, l.linha_arquivo), 0)
      const novaLinha: SmartImportLinha = {
        linha_arquivo: maxLinhaArquivo + 1,
        numero_pedido: linhaPedido.numero_pedido,
        status: 'ok',
        alertas: [],
        dados: dadosItem,
      }
      // Remove o alerta "sem ITEM associado" da linha PEDIDO afetada
      const linhasAtualizadas = prev.linhas.map(l => {
        if (l.linha_arquivo !== linhaPedido.linha_arquivo) return l
        const alertasSemFaltando = l.alertas.filter(a =>
          !(a.campo === 'tipo_linha' && /sem ITEM associado|nao tem nenhum ITEM/i.test(a.mensagem))
        )
        const novoStatus: SmartImportLinha['status'] =
          alertasSemFaltando.some(a => a.nivel === 'erro')  ? 'erro'  :
          alertasSemFaltando.some(a => a.nivel === 'aviso') ? 'aviso' :
          'ok'
        return { ...l, alertas: alertasSemFaltando, status: novoStatus }
      })
      return {
        ...prev,
        linhas: [...linhasAtualizadas, novaLinha],
        total_linhas: prev.total_linhas + 1,
        total_itens:  prev.total_itens + 1,
      }
    })
    // Auto-seleciona a nova linha
    setLinhasSelecionadas(prev => {
      const next = new Set(prev)
      // O linha_arquivo da nova sera o ultimo apos o set acima
      const proxLinha = (preview?.linhas.reduce((acc, l) => Math.max(acc, l.linha_arquivo), 0) ?? 0) + 1
      next.add(proxLinha)
      return next
    })
  }

  // P15.2 — Atualiza valor de um campo em linha existente do preview
  function handleEditarCampoLinha(linhaArquivo: number, campo: string, novoValor: string) {
    setPreview(prev => {
      if (!prev) return prev
      const linhasAtualizadas = prev.linhas.map(l => {
        if (l.linha_arquivo !== linhaArquivo) return l
        return { ...l, dados: { ...l.dados, [campo]: novoValor } }
      })
      return { ...prev, linhas: linhasAtualizadas }
    })
  }

  function handleVerPedidos() {
    onConcluido(resultado?.ids_criados ?? [])
  }

  /** Fechar/X na confirmação também recarrega a lista (antes só "Ver pedidos importados" fazia isso). */
  function handleFecharModal() {
    if (
      etapa === 'confirmacao'
      && resultado
      && (resultado.criados > 0 || resultado.atualizados > 0)
    ) {
      onConcluido(resultado.ids_criados ?? [])
      return
    }
    onFechar()
  }

  // Tipo auxiliar para preview com campos opcionais da Onda 2
  const previewExt = preview as (SmartImportPreview & { limite_excedido?: boolean }) | null

  const footerSmartImport = etapa !== 'confirmacao' ? (
    <>
      <BotaoGlobal
        variante="secundario"
        tamanho="medio"
        onClick={onFechar}
        disabled={analisando || confirmando}
      >
        {t('pedido.smart_import.cancelar')}
      </BotaoGlobal>
      <div className="smart-import__footer-acoes">
        {etapa === 'preview' && (
          <BotaoGlobal
            variante="secundario"
            tamanho="medio"
            onClick={() => {
              setEtapa('mapeamento')
              document.querySelector('.smart-import__corpo')?.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={confirmando}
          >
            {t('pedido.smart_import.voltar')}
          </BotaoGlobal>
        )}
        {etapa === 'mapeamento' && (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={handleAvancarParaPreview}
            disabled={analisando || conflitosAtuais.length > 0}
            title={conflitosAtuais.length > 0 ? t('pedido.smart_import.title_resolver_conflitos') : undefined}
          >
            {t('pedido.smart_import.continuar')}
          </BotaoGlobal>
        )}
        {etapa === 'preview' && preview && (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={handleConfirmar}
            disabled={confirmando || linhasSelecionadas.size === 0}
            aria-busy={confirmando}
          >
            {confirmando
              ? t('pedido.smart_import.importando')
              : linhasSelecionadas.size === preview.linhas.length
                ? t('pedido.smart_import.importar_tudo')
                : t('pedido.smart_import.importar_n', { count: linhasSelecionadas.size })}
          </BotaoGlobal>
        )}
      </div>
      {etapa === 'preview' && (
        <p style={{ width: '100%', margin: '0.5rem 0 0 0', fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1/-1' }}>
          {t('pedido.smart_import.rascunho_hint')}
        </p>
      )}
    </>
  ) : undefined

  return (
    <ModalPassoPassoGlobal
      titulo={t('pedido.smart_import.titulo')}
      icone={<UploadSimple size={20} weight="duotone" />}
      subtitulo={t('pedido.smart_import.subtitulo')}
      aberto={aberto}
      passos={PASSOS_IMPORT}
      passoAtual={etapaParaId(etapa)}
      onProximo={() => {}}
      onVoltar={() => {}}
      onFechar={handleFecharModal}
      tamanho="xl"
      ocultarStepper={etapa === 'confirmacao'}
      ocultarFooter={etapa === 'confirmacao'}
      footerCustom={footerSmartImport}
    >

        {/* Contexto do arquivo — total_pedidos / total_itens / total_linhas */}
        {preview && (etapa === 'mapeamento' || etapa === 'preview') && (
          <div className="smart-import__contexto-arquivo">
            <span>{t('pedido.smart_import.contexto_arquivo', { pedidos: preview.total_pedidos, itens: preview.total_itens, linhas: preview.total_linhas })}</span>
            {preview.extrator_usado && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.75rem', opacity: 0.7 }}>
                {preview.extrator_usado === 'gemini' ? t('pedido.smart_import.extrator_gemini') : t('pedido.smart_import.extrator_parser', { nome: preview.extrator_usado })}
              </span>
            )}
          </div>
        )}

        {/* Aviso de confiança global baixa */}
        {preview && etapa === 'mapeamento' && preview.confianca_global < 60 && (
          <div className="smart-import__aviso-confianca">
            {t('pedido.smart_import.aviso_confianca', { pct: preview.confianca_global })}
          </div>
        )}

        {/* P2.4 — Aviso de conflitos de mapeamento (2+ colunas -> mesmo campo) */}
        {etapa === 'mapeamento' && conflitosAtuais.length > 0 && (
          <div style={{
            padding: '0.625rem 1.25rem',
            background: 'rgba(239,68,68,0.08)',
            borderBottom: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 500,
            flexShrink: 0,
          }}>
            <strong>{t('pedido.smart_import.conflito_titulo')}</strong>{' '}
            {conflitosAtuais.map((c) => (
              t('pedido.smart_import.conflito_detalhe', { colunas: c.colunas_arquivo.join('", "'), campo: c.campo_sistema })
            )).join(' · ')}
            {t('pedido.smart_import.conflito_instrucao')}
          </div>
        )}

        {/* Aviso de limite de linhas excedido */}
        {previewExt && previewExt.limite_excedido && (
          <div style={{
            padding: '0.5rem 1.25rem',
            background: 'rgba(245,158,11,0.08)',
            borderBottom: '1px solid rgba(245,158,11,0.2)',
            color: '#f59e0b',
            fontSize: '0.75rem',
            fontWeight: 500,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            {t('pedido.smart_import.aviso_limite', { total: previewExt.total_linhas })}
          </div>
        )}

        {/* Corpo */}
        <div className="smart-import__corpo">
          {/* Analisando overlay */}
          {analisando && (
            <div className="smart-import__analisando" aria-live="polite" aria-busy="true">
              <GravityLoader tamanho="sm" />
              <span>{msgProgresso}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {arquivoAtual?.name.toLowerCase().endsWith('.pdf')
                  ? t('pedido.smart_import.pdf_aguarde')
                  : t('pedido.smart_import.xlsx_aguarde')}
              </span>
              {analiseDemorada && (
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--ws-accent, #a5b4fc)',
                    marginTop: '0.5rem',
                    maxWidth: '28rem',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  {t('pedido.smart_import.analise_demorada')}
                </span>
              )}
            </div>
          )}

          {!analisando && etapa === 'upload' && (
            <EtapaUpload
              onArquivoSelecionado={handleArquivoSelecionado}
              carregando={analisando}
              erro={erro}
              planilhas={planilhas}
              planilhaSelecionada={planilhaSelecionada}
              onBaixarTemplate={() => {
                window.open('/api/v1/pedidos/importacoes-inteligentes/template', '_blank')
              }}
              onPlanilhaSelecionada={(nome) => {
                setPlanilhaSelecionada(nome)
                setPlanilhas([])
                if (arquivoAtual) {
                  handleArquivoSelecionado(arquivoAtual, nome)
                }
              }}
            />
          )}

          {!analisando && etapa === 'mapeamento' && preview && (
            <EtapaMapeamento
              mapeamento={mapeamento}
              memoriaAplicada={preview.memoria_aplicada}
              lembrarMapeamento={lembrarMapeamento}
              dadosBrutos={preview.dados_brutos}
              onMapeamentoChange={setMapeamento}
              onLembrarChange={setLembrarMapeamento}
              onValorExemploEditado={handleValorExemploEditado}
              onVoltar={() => setEtapa('upload')}
              onResetarMapeamento={() => {
                // Recriar mapeamento sem memória — manter colunas mas limpar campo_sistema
                setMapeamento(prev => prev.map(m => ({ ...m, campo_sistema: null, confianca: 0, nivel: 'ignorado' as const, inferido_por: 'usuario' as const })))
              }}
            />
          )}

          {!analisando && etapa === 'preview' && preview && (
            <EtapaPreview
              linhas={preview.linhas}
              linhasSelecionadas={linhasSelecionadas}
              decisoesDuplicatas={decisoesDuplicatas}
              numerosEditados={numerosEditados}
              onSelecaoChange={setLinhasSelecionadas}
              onDecisaoDuplicata={handleDecisaoDuplicata}
              onNumeroEditado={handleNumeroEditado}
              onAdicionarItemInline={handleAdicionarItemInline}
              onEditarCampoLinha={handleEditarCampoLinha}
            />
          )}

          {etapa === 'confirmacao' && resultado && (
            <EtapaConfirmacao
              resultado={resultado}
              onVerPedidos={handleVerPedidos}
              onFechar={handleFecharModal}
            />
          )}

          {/* Erro geral (nao na etapa de upload que tem seu proprio).
             Q6 — `erro` e' um ErroDetalhado (objeto), nao string. Renderizar
             diretamente {erro} gerava "Objects are not valid as a React child"
             e o ErrorBoundary do shell engolia a pagina toda com
             "Erro ao carregar: Pedido". Agora extraimos os campos. */}
          {erro && etapa !== 'upload' && (
            <div className="smart-import__erro" role="alert">
              <p style={{ margin: 0, fontWeight: 600 }}>{erro.titulo}</p>
              <p style={{ margin: '0.25rem 0 0' }}>{erro.mensagem}</p>
              {erro.sugestoes && erro.sugestoes.length > 0 && (
                <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.8125rem' }}>
                  {erro.sugestoes.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
              {erro.code && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.6875rem', opacity: 0.6 }}>
                  [{erro.code}]
                </p>
              )}
            </div>
          )}
        </div>

    </ModalPassoPassoGlobal>
  )
}
