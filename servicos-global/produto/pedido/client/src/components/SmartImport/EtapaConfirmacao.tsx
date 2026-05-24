/**
 * EtapaConfirmacao.tsx — Etapa 4 do Smart Import
 * Resumo dos resultados: criados / atualizados / pulados / erros
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import type { SmartImportResultado } from '../../shared/types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface HistoricoItem {
  id: string
  data: string
  criados: number
  atualizados: number
  pulados: number
  erros: number
  ids_criados: string[]
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaConfirmacaoProps {
  resultado: SmartImportResultado
  onVerPedidos: () => void
  onFechar: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function exportarErrosCSV(erros: { linha: number; motivo: string }[]) {
  const linhas = ['Linha,Motivo', ...erros.map(e => `${e.linha},"${e.motivo.replace(/"/g, '""')}"`)]
  const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `erros-importacao-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaConfirmacao({ resultado, onVerPedidos, onFechar }: EtapaConfirmacaoProps) {
  const { t } = useTranslation()
  const totalSucesso = resultado.criados + resultado.atualizados

  // Salvar no histórico de importações (localStorage)
  React.useEffect(() => {
    if (resultado.criados + resultado.atualizados === 0) return
    try {
      const CHAVE = 'gravity_import_history'
      const historico = JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as HistoricoItem[]
      const novoItem: HistoricoItem = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        criados: resultado.criados,
        atualizados: resultado.atualizados,
        pulados: resultado.pulados,
        erros: resultado.erros.length,
        ids_criados: resultado.ids_criados,
      }
      // Manter apenas últimos 20
      const atualizado = [novoItem, ...historico].slice(0, 20)
      localStorage.setItem(CHAVE, JSON.stringify(atualizado))
    } catch {
      // localStorage pode estar bloqueado
    }
  }, [resultado])

  const [revertendo, setRevertendo] = React.useState(false)
  const [revertido, setRevertido]   = React.useState(false)
  const [erroReversao, setErroReversao] = React.useState<string | null>(null)
  const [confirmarReversaoAberto, setConfirmarReversaoAberto] = React.useState(false)

  function handleReverter() {
    setConfirmarReversaoAberto(true)
  }

  async function handleReversaoConfirmada() {
    setConfirmarReversaoAberto(false)
    setRevertendo(true)
    setErroReversao(null)
    try {
      const idOrganizacao = sessionStorage.getItem('gravity_id_organizacao') ?? ''
      // P17 — Portao 3 exige x-id-workspace (sessao paralela 12/05/2026).
      const idWorkspace = sessionStorage.getItem('gravity_company_id') ?? ''
      const res = await fetch('/api/v1/pedidos/importacoes-inteligentes/reverter', {
        method: 'POST',
        headers: {
          'Content-Type':   'application/json',
          'x-id-organizacao':    idOrganizacao,
          ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
          'x-internal-key': (import.meta as Record<string, Record<string, string>>).env?.VITE_CHAVE_INTERNA_SERVICO || '',
        },
        body: JSON.stringify({ ids_criados: resultado.ids_criados }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: t('pedido.smart_import.erro_desconhecido') } }))
        throw new Error(err.error?.message ?? `HTTP ${res.status}`)
      }
      setRevertido(true)
    } catch (e) {
      setErroReversao(e instanceof Error ? e.message : t('pedido.smart_import.erro_reverter'))
    } finally {
      setRevertendo(false)
    }
  }

  return (
    <div className="smart-import__resultado" role="status" aria-live="polite">
      {totalSucesso > 0 ? (
        <CheckCircle
          size={56}
          weight="duotone"
          className="smart-import__resultado-icone"
          aria-hidden="true"
        />
      ) : (
        <XCircle
          size={56}
          weight="duotone"
          style={{ color: '#ef4444' }}
          aria-hidden="true"
        />
      )}

      <h3 className="smart-import__resultado-titulo">
        {totalSucesso > 0
          ? t('pedido.smart_import.concluida', { count: totalSucesso })
          : t('pedido.smart_import.nenhum_importado')}
      </h3>

      <div className="smart-import__resultado-grid">
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#34d399' }}>
            {resultado.criados}
          </div>
          <div className="smart-import__resultado-label">{t('pedido.smart_import.criados')}</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#60a5fa' }}>
            {resultado.atualizados}
          </div>
          <div className="smart-import__resultado-label">{t('pedido.smart_import.atualizados')}</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#94a3b8' }}>
            {resultado.pulados}
          </div>
          <div className="smart-import__resultado-label">{t('pedido.smart_import.pulados')}</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: resultado.erros.length > 0 ? '#ef4444' : '#94a3b8' }}>
            {resultado.erros.length}
          </div>
          <div className="smart-import__resultado-label">{t('pedido.smart_import.erros')}</div>
        </div>
      </div>

      {resultado.erros.length > 0 && (
        <div style={{ width: '100%', maxWidth: 520, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ef4444', margin: 0 }}>
              {t('pedido.smart_import.linhas_com_erro')}
            </p>
            <button
              type="button"
              className="smart-import__filtro-btn"
              onClick={() => exportarErrosCSV(resultado.erros)}
              style={{ fontSize: '0.75rem' }}
            >
              ↓ {t('pedido.smart_import.baixar_relatorio')}
            </button>
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
            {resultado.erros.map((e, i) => (
              <li key={i}>
                {t('pedido.smart_import.linha_label', { linha: e.linha })}: {e.motivo}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
        padding: '0.625rem 1rem',
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '0.5rem',
        maxWidth: 520,
        width: '100%',
        textAlign: 'left',
      }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
          <strong style={{ color: 'var(--accent, #6366f1)' }}>{t('pedido.smart_import.importante')}</strong>{' '}
          {t('pedido.smart_import.aviso_status_p1')} <strong>Rascunho</strong>. {t('pedido.smart_import.aviso_status_p2')} <strong>Aberto</strong> {t('pedido.smart_import.aviso_status_p3')}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <BotaoGlobal variante="secundario" tamanho="medio" onClick={onFechar}>
          {t('comum.fechar')}
        </BotaoGlobal>
        {resultado.ids_criados.length > 0 && (
          <BotaoGlobal variante="primario" tamanho="medio" onClick={onVerPedidos}>
            {t('pedido.smart_import.ver_pedidos_importados')}
          </BotaoGlobal>
        )}
      </div>

      {resultado.ids_criados.length > 0 && !revertido && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <button
            type="button"
            onClick={handleReverter}
            disabled={revertendo}
            style={{
              background: 'none',
              border: '1px solid rgba(239,68,68,0.3)',
              color: revertendo ? 'var(--text-muted)' : '#ef4444',
              fontSize: '0.75rem',
              padding: '0.375rem 0.875rem',
              borderRadius: '6px',
              cursor: revertendo ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {revertendo ? t('pedido.smart_import.revertendo') : `↩ ${t('pedido.smart_import.reverter_importacao')}`}
          </button>
          {erroReversao && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{erroReversao}</span>
          )}
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {resultado.atualizados > 0
              ? t('pedido.smart_import.marca_criados_atualizados')
              : t('pedido.smart_import.marca_criados')}
          </span>
        </div>
      )}

      {revertido && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '0.8125rem', color: '#ef4444' }}>
          ✓ {t('pedido.smart_import.revertido_msg')}
        </div>
      )}

      <ModalConfirmarExcluirGlobal
        aberto={confirmarReversaoAberto}
        titulo={t('pedido.smart_import.reverter_titulo')}
        descricao={t('pedido.smart_import.reverter_desc', { count: resultado.criados + resultado.atualizados })}
        aoConfirmar={handleReversaoConfirmada}
        aoCancelar={() => setConfirmarReversaoAberto(false)}
      />
    </div>
  )
}
