/**
 * EtapaPreviewBidFreteInternacional — passo 3 do wizard (paridade Pedido Smart Import)
 */

import './etapa-preview-bid-frete-internacional.css'
import React, { useMemo, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import {
  CheckCircle,
  Warning,
  XCircle,
  CaretDown,
  CaretRight,
} from '@phosphor-icons/react'
import {
  CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL,
  rotuloCampoImportacaoBid,
} from '../../../../shared/campos-importacao-bid-frete-internacional'
import type { CampoImportacaoBidFreteInternacional } from '../../../../shared/tipos-importacao-bid-frete-internacional'
import type { LinhaPreviewImportacaoBid } from '../../../../shared/validar-preview-importacao-bid-frete-internacional'

type FiltroPreview = 'todos' | 'ok' | 'aviso' | 'erro'

export interface EtapaPreviewBidFreteInternacionalProps {
  linhas: LinhaPreviewImportacaoBid[]
  linhasSelecionadas: Set<number>
  nomeArquivo: string
  parser: string
  contextoBid?: boolean
  onSelecaoChange: (linhas: Set<number>) => void
}

function IconeStatus({ status }: { status: LinhaPreviewImportacaoBid['status'] }) {
  const { t } = useTranslation()
  if (status === 'ok') return <CheckCircle size={16} weight="fill" className="smart-import__status-ok" aria-label={t('pedido.smart_preview.status_ok')} />
  if (status === 'aviso') return <Warning size={16} weight="fill" className="smart-import__status-aviso" aria-label={t('pedido.smart_preview.status_aviso')} />
  return <XCircle size={16} weight="fill" className="smart-import__status-erro" aria-label={t('pedido.smart_preview.status_erro')} />
}

function CardCotacao({
  linha,
  selecionada,
  onToggle,
}: {
  linha: LinhaPreviewImportacaoBid
  selecionada: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const [expandidoAlertas, setExpandidoAlertas] = useState(linha.status !== 'ok')
  const [expandidoCampos, setExpandidoCampos] = useState(false)

  const camposVisiveis = CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL
    .map(meta => [meta.campo, linha.dados[meta.campo]] as const)
    .filter(([, valor]) => valor != null && String(valor).trim() !== '')

  return (
    <div
      className={`smart-import__card-pedido${selecionada ? ' smart-import__card-pedido--selecionado' : ' smart-import__card-pedido--desmarcado'}`}
      aria-selected={selecionada}
    >
      <div className="smart-import__card-header">
        <input
          type="checkbox"
          checked={selecionada}
          onChange={onToggle}
          disabled={linha.status === 'erro'}
          aria-label={t('pedido.smart_preview.aria_selecionar_linha', { linha: linha.linha_arquivo })}
          style={{ flexShrink: 0 }}
        />

        {linha.status === 'ok' && (
          <span className="bid-import-preview-badge bid-import-preview-badge--ok">
            {t('bidfrete.importar.preview_badge_nova_cotacao')}
          </span>
        )}
        {linha.status === 'aviso' && (
          <span className="bid-import-preview-badge bid-import-preview-badge--aviso">
            {t('pedido.smart_preview.badge_com_aviso')}
          </span>
        )}
        {linha.status === 'erro' && (
          <span className="bid-import-preview-badge bid-import-preview-badge--erro">
            {t('pedido.smart_preview.badge_com_erro')}
          </span>
        )}

        <div className="smart-import__numero-pedido-wrapper">
          <span className="smart-import__numero-pedido">{linha.titulo}</span>
        </div>

        <IconeStatus status={linha.status} />

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginLeft: 'auto', flexShrink: 0 }}>
          {t('pedido.smart_preview.linha_n', { linha: linha.linha_arquivo })}
        </span>
      </div>

      {camposVisiveis.length > 0 && (
        <div>
          <button
            type="button"
            className="smart-import__expandir-campos"
            onClick={() => setExpandidoCampos(v => !v)}
            aria-expanded={expandidoCampos}
          >
            {expandidoCampos
              ? <CaretDown size={11} aria-hidden="true" />
              : <CaretRight size={11} aria-hidden="true" />}
            {t('pedido.smart_preview.ver_campos_detectados', { count: camposVisiveis.length })}
          </button>

          {expandidoCampos && (
            <div className="smart-import__campos-grid">
              {camposVisiveis.map(([campo, valor]) => (
                <div key={campo} className="smart-import__campo-item">
                  <span className="smart-import__campo-label">{rotuloCampoImportacaoBid(campo)}</span>
                  <span className="smart-import__campo-valor">{String(valor)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {linha.alertas.length > 0 && (
        <div>
          <button
            type="button"
            className="smart-import__expandir-campos"
            onClick={() => setExpandidoAlertas(v => !v)}
            aria-expanded={expandidoAlertas}
            style={{ color: linha.status === 'erro' ? '#ef4444' : '#f59e0b' }}
          >
            {expandidoAlertas
              ? <CaretDown size={11} aria-hidden="true" />
              : <CaretRight size={11} aria-hidden="true" />}
            {t('pedido.smart_preview.n_alertas', { count: linha.alertas.length })}
          </button>

          {expandidoAlertas && (
            <ul className="bid-import-preview-alertas">
              {linha.alertas.map((a, i) => (
                <li
                  key={i}
                  className={a.nivel === 'erro' ? 'bid-import-preview-alerta--erro' : 'bid-import-preview-alerta--aviso'}
                >
                  {a.nivel === 'erro'
                    ? <XCircle size={12} weight="fill" aria-hidden="true" />
                    : <Warning size={12} weight="fill" aria-hidden="true" />}
                  <strong>{rotuloCampoImportacaoBid(a.campo as CampoImportacaoBidFreteInternacional)}:</strong>
                  {' '}
                  {a.mensagem}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function EtapaPreviewBidFreteInternacional({
  linhas,
  linhasSelecionadas,
  nomeArquivo,
  parser,
  contextoBid = false,
  onSelecaoChange,
}: EtapaPreviewBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const [filtro, setFiltro] = useState<FiltroPreview>('todos')
  const [filtroVisible, setFiltroVisible] = useState(true)

  const linhasFiltradas = useMemo(() => {
    if (filtro === 'todos') return linhas
    return linhas.filter(l => l.status === filtro)
  }, [linhas, filtro])

  const contadores = useMemo(() => ({
    ok: linhas.filter(l => l.status === 'ok').length,
    aviso: linhas.filter(l => l.status === 'aviso').length,
    erro: linhas.filter(l => l.status === 'erro').length,
  }), [linhas])

  function aplicarFiltro(novoFiltro: FiltroPreview) {
    setFiltroVisible(false)
    setTimeout(() => {
      setFiltro(novoFiltro)
      setFiltroVisible(true)
    }, 100)
  }

  function toggleLinha(linhaNum: number) {
    const novo = new Set(linhasSelecionadas)
    if (novo.has(linhaNum)) novo.delete(linhaNum)
    else novo.add(linhaNum)
    onSelecaoChange(novo)
  }

  function selecionarTodasValidas() {
    onSelecaoChange(new Set(linhas.filter(l => l.status === 'ok').map(l => l.linha_arquivo)))
  }

  function selecionarTodas() {
    onSelecaoChange(new Set(linhas.filter(l => l.status !== 'erro').map(l => l.linha_arquivo)))
  }

  function incluirAvisos() {
    onSelecaoChange(new Set([
      ...Array.from(linhasSelecionadas),
      ...linhas.filter(l => l.status === 'aviso').map(l => l.linha_arquivo),
    ]))
  }

  function desselecionarTodas() {
    onSelecaoChange(new Set())
  }

  const selecionadas = linhasSelecionadas.size

  return (
    <div>
      <div className="bid-import-contexto-arquivo">
        <span>
          {contextoBid
            ? t('bidfrete.importar.preview_contexto_bid', { count: linhasSelecionadas.size })
            : t('bidfrete.importar.preview_contexto_avulsa', { count: linhasSelecionadas.size })}
        </span>
        <span style={{ opacity: 0.65, marginLeft: '0.5rem' }}>
          {t('bidfrete.importar.contexto_preview', { cotacoes: linhas.length, parser })}
          {' · '}
          {nomeArquivo}
        </span>
      </div>

      <div className="smart-import__contador" role="status">
        <span>
          <Trans
            i18nKey="bidfrete.importar.preview_resumo_cotacoes"
            values={{ selecionadas, total: linhas.length }}
            components={{ strong: <strong /> }}
          />
        </span>
        <span>·</span>
        <span>
          <Trans
            i18nKey="bidfrete.importar.preview_resumo_ok"
            values={{ count: contadores.ok }}
            components={{ strong: <strong /> }}
          />
        </span>
        <span>
          <Trans
            i18nKey="bidfrete.importar.preview_resumo_aviso"
            values={{ count: contadores.aviso }}
            components={{ strong: <strong /> }}
          />
        </span>
        {contadores.erro > 0 && (
          <span style={{ color: '#ef4444' }}>
            <Trans
              i18nKey="bidfrete.importar.preview_resumo_erro"
              values={{ count: contadores.erro }}
              components={{ strong: <strong /> }}
            />
          </span>
        )}
      </div>

      <div className="smart-import__filtros" role="group" aria-label={t('bidfrete.importar.preview_aria_filtrar')}>
        {(['todos', 'ok', 'aviso', 'erro'] as FiltroPreview[]).map(f => (
          <button
            key={f}
            type="button"
            className={`smart-import__filtro-btn${filtro === f ? ' smart-import__filtro-btn--ativo' : ''}`}
            onClick={() => aplicarFiltro(f)}
            aria-pressed={filtro === f}
          >
            {f === 'todos' && t('pedido.smart_preview.filtro_todos', { count: linhas.length })}
            {f === 'ok' && t('pedido.smart_preview.filtro_ok', { count: contadores.ok })}
            {f === 'aviso' && t('pedido.smart_preview.filtro_aviso', { count: contadores.aviso })}
            {f === 'erro' && t('pedido.smart_preview.filtro_erro', { count: contadores.erro })}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="smart-import__filtro-btn" onClick={selecionarTodasValidas}>
            {t('pedido.smart_preview.btn_selecionar_validas')}
          </button>
          <button type="button" className="smart-import__filtro-btn" onClick={incluirAvisos}>
            {t('pedido.smart_preview.btn_incluir_avisos')}
          </button>
          <button type="button" className="smart-import__filtro-btn" onClick={selecionarTodas}>
            {t('pedido.smart_preview.btn_selecionar_todas')}
          </button>
          <button type="button" className="smart-import__filtro-btn" onClick={desselecionarTodas}>
            {t('pedido.smart_preview.btn_limpar_selecao')}
          </button>
        </div>
      </div>

      <div
        className="smart-import__cards-lista"
        style={{ transition: 'opacity 0.15s ease', opacity: filtroVisible ? 1 : 0 }}
      >
        {linhasFiltradas.map(linha => (
          <CardCotacao
            key={linha.linha_arquivo}
            linha={linha}
            selecionada={linhasSelecionadas.has(linha.linha_arquivo)}
            onToggle={() => toggleLinha(linha.linha_arquivo)}
          />
        ))}
        {linhasFiltradas.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {t('pedido.smart_import.nenhum_filtro_corresponde')}
          </p>
        )}
      </div>
    </div>
  )
}
