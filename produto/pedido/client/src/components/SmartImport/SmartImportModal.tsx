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

import React, { useState, useEffect, useCallback } from 'react'
import { UploadSimple, X, Spinner } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
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

const ROTULOS_ETAPA: Record<Etapa, string> = {
  upload:       '1. Upload',
  mapeamento:   '2. Mapeamento',
  preview:      '3. Preview',
  confirmacao:  '4. Resultado',
}

const ORDEM_ETAPAS: Etapa[] = ['upload', 'mapeamento', 'preview', 'confirmacao']

// ── Componente ────────────────────────────────────────────────────────────────

export function SmartImportModal({ aberto, onFechar, onConcluido }: SmartImportModalProps) {
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
  const [resultado, setResultado]               = useState<SmartImportResultado | null>(null)

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
        setResultado(null)
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
  const handleArquivoSelecionado = useCallback(async (arquivo: File) => {
    setAnalisando(true)
    setErro(null)

    try {
      const dados = await smartImportApi.analisar(arquivo)
      setPreview(dados)
      setMapeamento(dados.mapeamento)

      // Pre-selecionar linhas validas
      const validas = new Set(dados.linhas.filter(l => l.status === 'ok').map(l => l.linha_arquivo))
      setLinhasSelecionadas(validas)

      // Pre-preencher decisoes de duplicata com 'pular'
      const decisoes: Record<string, DecisaoDuplicata> = {}
      dados.linhas.forEach(l => {
        if (l.numero_pedido && l.alertas.some(a => a.tipo === 'duplicado_sistema')) {
          decisoes[l.numero_pedido] = 'pular'
        }
      })
      setDecisoesDuplicatas(decisoes)

      setEtapa('mapeamento')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao analisar arquivo. Tente novamente.')
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
      preview_id: preview.total_linhas.toString(), // substituir por real preview_id do backend
      mapeamento_confirmado: mapeamento,
      decisoes_duplicatas: decisoesDuplicatas,
      linhas_incluidas: Array.from(linhasSelecionadas),
      salvar_mapeamento: lembrarMapeamento,
    }

    try {
      const dados = await smartImportApi.confirmar(payload)
      setResultado(dados)
      setEtapa('confirmacao')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao importar pedidos. Tente novamente.')
    } finally {
      setConfirmando(false)
    }
  }, [preview, mapeamento, decisoesDuplicatas, linhasSelecionadas, lembrarMapeamento])

  function handleDecisaoDuplicata(numeroPedido: string, decisao: DecisaoDuplicata) {
    setDecisoesDuplicatas(prev => ({ ...prev, [numeroPedido]: decisao }))
  }

  function handleVerPedidos() {
    onConcluido(resultado?.ids_criados ?? [])
  }

  function etapaIndex(e: Etapa) { return ORDEM_ETAPAS.indexOf(e) }

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
            Importar Pedidos
          </h2>
          <button
            className="smart-import__fechar"
            onClick={onFechar}
            aria-label="Fechar modal de importacao"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div className="smart-import__steps" role="navigation" aria-label="Etapas da importacao">
          {ORDEM_ETAPAS.map((e, i) => {
            const iAtual   = etapaIndex(etapa)
            const isAtiva  = e === etapa
            const isFeita  = etapaIndex(e) < iAtual
            return (
              <React.Fragment key={e}>
                {i > 0 && <div className="smart-import__step-sep" aria-hidden="true" />}
                <div
                  className={[
                    'smart-import__step',
                    isAtiva ? 'smart-import__step--ativa' : '',
                    isFeita ? 'smart-import__step--concluida' : '',
                  ].filter(Boolean).join(' ')}
                  aria-current={isAtiva ? 'step' : undefined}
                >
                  <span className="smart-import__step-num" aria-hidden="true">
                    {isFeita ? '✓' : i + 1}
                  </span>
                  <span>{ROTULOS_ETAPA[e]}</span>
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Corpo */}
        <div className="smart-import__corpo">
          {/* Analisando overlay */}
          {analisando && (
            <div className="smart-import__analisando" aria-live="polite" aria-busy="true">
              <Spinner size={32} className="smart-import__spinner" aria-hidden="true" />
              <span>Analisando arquivo e mapeando colunas...</span>
            </div>
          )}

          {!analisando && etapa === 'upload' && (
            <EtapaUpload
              onArquivoSelecionado={handleArquivoSelecionado}
              carregando={analisando}
              erro={erro}
            />
          )}

          {!analisando && etapa === 'mapeamento' && preview && (
            <EtapaMapeamento
              mapeamento={mapeamento}
              memoriaAplicada={preview.memoria_aplicada}
              lembrarMapeamento={lembrarMapeamento}
              onMapeamentoChange={setMapeamento}
              onLembrarChange={setLembrarMapeamento}
            />
          )}

          {!analisando && etapa === 'preview' && preview && (
            <EtapaPreview
              linhas={preview.linhas}
              linhasSelecionadas={linhasSelecionadas}
              decisoesDuplicatas={decisoesDuplicatas}
              onSelecaoChange={setLinhasSelecionadas}
              onDecisaoDuplicata={handleDecisaoDuplicata}
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
              Cancelar
            </BotaoGlobal>
            <div className="smart-import__footer-acoes">
              {etapa === 'preview' && (
                <BotaoGlobal
                  variante="secundario"
                  tamanho="medio"
                  onClick={() => setEtapa('mapeamento')}
                  disabled={confirmando}
                >
                  Voltar
                </BotaoGlobal>
              )}
              {etapa === 'mapeamento' && (
                <BotaoGlobal
                  variante="primario"
                  tamanho="medio"
                  onClick={handleAvancarParaPreview}
                  disabled={analisando}
                >
                  Continuar
                </BotaoGlobal>
              )}
              {etapa === 'preview' && (
                <BotaoGlobal
                  variante="primario"
                  tamanho="medio"
                  onClick={handleConfirmar}
                  disabled={confirmando || linhasSelecionadas.size === 0}
                  aria-busy={confirmando}
                >
                  {confirmando
                    ? 'Importando...'
                    : `Importar ${linhasSelecionadas.size} linha(s)`}
                </BotaoGlobal>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
