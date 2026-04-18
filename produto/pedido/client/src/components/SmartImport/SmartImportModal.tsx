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
import { UploadSimple, X, Spinner } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import { StepperPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import { EtapaUpload }       from './EtapaUpload'
import { EtapaMapeamento }   from './EtapaMapeamento'
import { EtapaPreview }      from './EtapaPreview'
import { EtapaConfirmacao }  from './EtapaConfirmacao'
import { smartImportApi }    from '../../shared/api'
import type {
  ColunaMapeada,
  SmartImportPreview,
  SmartImportResultado,
  DecisaoDuplicata,
  SmartImportConfirmar,
} from '../../shared/types'
import './SmartImportModal.css'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface SmartImportModalProps {
  aberto: boolean
  onFechar: () => void
  onConcluido: (idsCriados: string[]) => void
}

// ── Tipos internos ────────────────────────────────────────────────────────────

type Etapa = 'upload' | 'mapeamento' | 'preview' | 'confirmacao'

type TFunc = (key: string, opts?: Record<string, unknown>) => string

function traduzirErro(err: unknown, contexto: 'upload' | 'confirmar' = 'upload', t: TFunc): string {
  const msg = err instanceof Error ? err.message : String(err ?? '')

  if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('fetch')) {
    return t('pedido.smart_import.err_rede')
  }
  if (/^HTTP 5\d\d/.test(msg)) {
    return contexto === 'upload'
      ? t('pedido.smart_import.err_servidor_upload')
      : t('pedido.smart_import.err_servidor_confirmar')
  }
  if (msg === 'HTTP 413') {
    return t('pedido.smart_import.err_arquivo_grande')
  }
  if (msg === 'HTTP 403') {
    return t('pedido.smart_import.err_sessao')
  }
  if (msg === 'HTTP 408' || msg === 'HTTP 504' || msg === 'HTTP 502') {
    return t('pedido.smart_import.err_timeout')
  }
  if (msg === 'HTTP 400') {
    return contexto === 'upload'
      ? t('pedido.smart_import.err_formato')
      : t('pedido.smart_import.err_dados')
  }
  if (msg && msg.length > 0 && !msg.startsWith('HTTP ')) {
    return msg
  }
  return contexto === 'upload'
    ? t('pedido.smart_import.err_upload_gen')
    : t('pedido.smart_import.err_confirmar_gen')
}

const ORDEM_ETAPAS: Etapa[] = ['upload', 'mapeamento', 'preview', 'confirmacao']

// ── PASSOS_IMPORT — definido dentro do componente via useMemo([t]) ─────────────

function etapaParaId(e: Etapa): number {
  return ORDEM_ETAPAS.indexOf(e) + 1
}

// ── Componente ────────────────────────────────────────────────────────────────

export function SmartImportModal({ aberto, onFechar, onConcluido }: SmartImportModalProps) {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()

  const PASSOS_IMPORT = useMemo<PassoConfig[]>(() => [
    { id: 1, label: t('pedido.smart_import.passo_upload') },
    { id: 2, label: t('pedido.smart_import.passo_mapeamento') },
    { id: 3, label: t('pedido.smart_import.passo_preview') },
    { id: 4, label: t('pedido.smart_import.passo_resultado') },
  ], [t])
  const [etapa, setEtapa]             = useState<Etapa>('upload')
  const [analisando, setAnalisando]   = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro]               = useState<string | null>(null)

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
        ? `/api/v1/pedidos/smart-import/analisar?sheet=${encodeURIComponent(nomePlanilha)}`
        : '/api/v1/pedidos/smart-import/analisar'

      const tenantId =
        sessionStorage.getItem('gravity_tenant_id') ||
        import.meta.env.VITE_DEV_TENANT_ID ||
        ''
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'x-tenant-id':    tenantId,
          'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
        throw new Error((err as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`)
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

      // Pre-selecionar linhas validas
      const validas = new Set(
        previewDados.linhas
          .filter((l: { status: string }) => l.status === 'ok')
          .map((l: { linha_arquivo: number }) => l.linha_arquivo)
      )
      setLinhasSelecionadas(validas)

      // Pre-preencher decisoes de duplicata com 'pular'
      const decisoes: Record<string, DecisaoDuplicata> = {}
      previewDados.linhas.forEach((l: { numero_pedido: string | null; alertas: { tipo: string }[] }) => {
        if (l.numero_pedido && l.alertas.some((a: { tipo: string }) => a.tipo === 'duplicado_sistema')) {
          decisoes[l.numero_pedido] = 'pular'
        }
      })
      setDecisoesDuplicatas(decisoes)

      setEtapa('mapeamento')
    } catch (err: unknown) {
      setErro(traduzirErro(err, 'upload', t))
    } finally {
      setAnalisando(false)
    }
  }, [])

  // Avancar do mapeamento para preview
  function handleAvancarParaPreview() {
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
      addNotification({ type: 'success', message: `${dados.ids_criados?.length ?? 0} PO(s) importadas via SmartImport.`, duration: 4000 })
    } catch (err: unknown) {
      const msg = traduzirErro(err, 'confirmar', t)
      setErro(msg)
      addNotification({ type: 'error', message: `Falha na importação: ${msg}`, duration: 4000 })
    } finally {
      setConfirmando(false)
    }
  }, [preview, mapeamento, decisoesDuplicatas, linhasSelecionadas, lembrarMapeamento, numerosEditados, addNotification])

  function handleDecisaoDuplicata(numeroPedido: string, decisao: DecisaoDuplicata) {
    setDecisoesDuplicatas(prev => ({ ...prev, [numeroPedido]: decisao }))
  }

  function handleNumeroEditado(linhaArquivo: number, numero: string) {
    setNumerosEditados(prev => ({ ...prev, [linhaArquivo]: numero }))
  }

  function handleVerPedidos() {
    onConcluido(resultado?.ids_criados ?? [])
  }

  // Tipo auxiliar para preview com campos opcionais da Onda 2
  const previewExt = preview as (SmartImportPreview & { limite_excedido?: boolean }) | null

  if (!aberto) return null

  return (
    <div
      className="smart-import__overlay"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-import-titulo"
    >
      <div className="smart-import__container">
        {/* Header */}
        <div className="smart-import__header">
          <h2 id="smart-import-titulo" className="smart-import__titulo">
            <UploadSimple size={18} weight="duotone" aria-hidden="true" />
            {t('pedido.smart_import.titulo')}
          </h2>
          <button
            className="smart-import__fechar"
            onClick={onFechar}
            aria-label={t('pedido.smart_import.aria_fechar')}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div style={{ padding: '0.5rem 1.25rem', borderBottom: '1px solid var(--border-subtle, #2d2d3d)', flexShrink: 0 }}>
          <StepperPassoPassoGlobal
            passos={PASSOS_IMPORT}
            passoAtual={etapaParaId(etapa)}
          />
        </div>

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
              <Spinner size={32} className="smart-import__spinner" aria-hidden="true" />
              <span>{msgProgresso}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {arquivoAtual?.name.toLowerCase().endsWith('.pdf')
                  ? t('pedido.smart_import.pdf_aguarde')
                  : t('pedido.smart_import.xlsx_aguarde')}
              </span>
            </div>
          )}

          {!analisando && etapa === 'upload' && (
            <EtapaUpload
              onArquivoSelecionado={handleArquivoSelecionado}
              carregando={analisando}
              erro={erro}
              planilhas={planilhas}
              planilhaSelecionada={planilhaSelecionada}
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
            />
          )}

          {etapa === 'confirmacao' && resultado && (
            <EtapaConfirmacao
              resultado={resultado}
              onVerPedidos={handleVerPedidos}
              onFechar={onFechar}
            />
          )}

          {/* Erro geral (nao na etapa de upload que tem seu proprio) */}
          {erro && etapa !== 'upload' && (
            <div className="smart-import__erro" role="alert">
              {erro}
            </div>
          )}
        </div>

        {/* Footer */}
        {etapa !== 'confirmacao' && (
          <div className="smart-import__footer">
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
                  disabled={analisando}
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
          </div>
        )}
      </div>
    </div>
  )
}
