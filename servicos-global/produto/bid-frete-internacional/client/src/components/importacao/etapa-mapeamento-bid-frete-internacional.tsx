/**
 * EtapaMapeamentoBidFreteInternacional — passo 2 do wizard de importação
 * Paridade visual com EtapaMapeamento do Pedido Smart Import
 */

import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle,
  Warning,
  Question,
  Table,
  MagnifyingGlass,
  Star,
  PencilSimple,
  Check,
  X,
} from '@phosphor-icons/react'
import { SelectGlobal } from '@nucleo/campo-select-global'
import {
  CAMPOS_ESSENCIAIS_IMPORTACAO_BID,
  CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL,
  rotuloCampoImportacaoBid,
} from '../../../../shared/campos-importacao-bid-frete-internacional'
import type {
  CampoImportacaoBidFreteInternacional,
  ColunaMapeadaBidFreteInternacional,
  NivelConfiancaMapeamento,
} from '../../../../shared/tipos-importacao-bid-frete-internacional'

export interface EtapaMapeamentoBidFreteInternacionalProps {
  mapeamento: ColunaMapeadaBidFreteInternacional[]
  linhasBrutas: Record<string, string>[]
  nomeArquivo: string
  parser: string
  totalCotacoes: number
  onMapeamentoChange: (novo: ColunaMapeadaBidFreteInternacional[]) => void
  onTrocarArquivo: () => void
}

function BadgeConfianca({
  confianca,
  nivel,
  campoSistema,
}: {
  confianca: number
  nivel: NivelConfiancaMapeamento
  campoSistema?: CampoImportacaoBidFreteInternacional | null
}) {
  const { t } = useTranslation()

  if (nivel === 'ignorado' && !campoSistema) {
    return (
      <span className="smart-import__conf-cinza" title={t('pedido.smart_import.campo_extra_tooltip')}>
        <Question size={14} aria-hidden="true" />
        {t('pedido.smart_import.campo_extra')}
      </span>
    )
  }
  if (confianca >= 90) {
    return (
      <span className="smart-import__conf-verde">
        <CheckCircle size={14} aria-hidden="true" />
        {confianca}%
      </span>
    )
  }
  if (confianca >= 50) {
    return (
      <span className="smart-import__conf-amarelo">
        <Warning size={14} aria-hidden="true" />
        {confianca}%
      </span>
    )
  }
  return (
    <span className="smart-import__conf-cinza">
      <Question size={14} aria-hidden="true" />
      {confianca}%
    </span>
  )
}

export function EtapaMapeamentoBidFreteInternacional({
  mapeamento,
  linhasBrutas,
  nomeArquivo,
  parser,
  totalCotacoes,
  onMapeamentoChange,
  onTrocarArquivo,
}: EtapaMapeamentoBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const [modoEssencial, setModoEssencial] = useState(true)
  const [busca, setBusca] = useState('')
  const [verDocumento, setVerDocumento] = useState(false)
  const [colunaEditando, setColunaEditando] = useState<number | null>(null)
  const [valorTempEdicao, setValorTempEdicao] = useState('')

  const opcoesCampo = useMemo(
    () => CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL.map(c => ({
      valor: c.campo,
      rotulo: c.rotulo,
      obrigatorio: c.obrigatorio,
    })),
    [],
  )

  const essenciaisMapeados = mapeamento.filter(
    m => m.campo_sistema && CAMPOS_ESSENCIAIS_IMPORTACAO_BID.has(m.campo_sistema),
  ).length

  const obrigatoriosFaltando = [...CAMPOS_ESSENCIAIS_IMPORTACAO_BID].filter(campo =>
    !mapeamento.some(m => m.campo_sistema === campo && m.confianca >= 70),
  ).length

  const mapeadas = mapeamento.filter(m => m.campo_sistema).length
  const total = mapeamento.length

  const linhasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return mapeamento
      .map((col, indexOriginal) => ({ col, indexOriginal }))
      .filter(({ col }) => {
        if (modoEssencial) {
          const ehEssencialCol = col.campo_sistema
            ? CAMPOS_ESSENCIAIS_IMPORTACAO_BID.has(col.campo_sistema)
            : false
          const pareceEssencial = !col.campo_sistema && col.confianca >= 50
          if (!ehEssencialCol && !pareceEssencial && col.confianca < 70) return false
        }
        if (!termo) return true
        const rotulo = col.campo_sistema ? rotuloCampoImportacaoBid(col.campo_sistema) : ''
        return (
          col.coluna_arquivo.toLowerCase().includes(termo)
          || rotulo.toLowerCase().includes(termo)
          || (col.valor_exemplo ?? '').toLowerCase().includes(termo)
        )
      })
  }, [busca, mapeamento, modoEssencial])

  function atualizarCampo(index: number, campo: string | null) {
    const novo = mapeamento.map((col, i) => {
      if (i !== index) return col
      const campoSistema = campo === '__drop__' || !campo
        ? null
        : campo as CampoImportacaoBidFreteInternacional
      return {
        ...col,
        campo_sistema: campoSistema,
        confianca: campoSistema ? Math.max(col.confianca, 95) : 0,
        nivel: campoSistema ? 'confirmado' as const : 'ignorado' as const,
        inferido_por: 'usuario' as const,
      }
    })
    onMapeamentoChange(novo)
  }

  function confirmarEdicaoValor() {
    if (colunaEditando === null) return
    const novo = mapeamento.map((col, i) =>
      i === colunaEditando ? { ...col, valor_exemplo: valorTempEdicao || null } : col,
    )
    onMapeamentoChange(novo)
    setColunaEditando(null)
  }

  function labelInferidoPor(inferido: ColunaMapeadaBidFreteInternacional['inferido_por']): string {
    switch (inferido) {
      case 'rotulo': return t('bidfrete.importar.inferido_rotulo')
      case 'nome_interno': return t('bidfrete.importar.inferido_nome_interno')
      case 'alias': return t('bidfrete.importar.inferido_alias')
      case 'dados': return t('bidfrete.importar.inferido_dados')
      case 'usuario': return t('pedido.smart_import.inferido_usuario')
      default: return '—'
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="bid-import-contexto-arquivo">
        <span>
          {t('bidfrete.importar.contexto_arquivo', {
            cotacoes: totalCotacoes,
            linhas: linhasBrutas.length,
            parser,
          })}
        </span>
        <span style={{ opacity: 0.65, marginLeft: '0.5rem' }}>{nomeArquivo}</span>
      </div>

      <button
        type="button"
        className="smart-import__filtro-btn"
        onClick={onTrocarArquivo}
        style={{ marginBottom: '0.75rem' }}
      >
        ← {t('pedido.smart_import.trocar_arquivo')}
      </button>

      <div className="smart-import__mapa-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              {t('pedido.smart_import.contador_essenciais', {
                mapeados: essenciaisMapeados,
                total: CAMPOS_ESSENCIAIS_IMPORTACAO_BID.size,
              })}
            </strong>
            {' '}
            {t('pedido.smart_import.essenciais_mapeados')}
            {obrigatoriosFaltando > 0 && (
              <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                · {t('pedido.smart_import.obrigatorios_faltando', { count: obrigatoriosFaltando })}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.6875rem' }}>
              {t('pedido.smart_import.total_legenda', { mapeadas, total })}
            </span>
          </p>
          {linhasBrutas.length > 0 && (
            <button
              type="button"
              className="smart-import__filtro-btn"
              onClick={() => setVerDocumento(true)}
            >
              <Table size={13} weight="duotone" aria-hidden="true" />
              {t('pedido.smart_import.ver_documento')}
            </button>
          )}
        </div>
      </div>

      <div className="bid-import-mapa-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} role="group" aria-label={t('pedido.smart_import.aria_modo_exibicao')}>
          <button
            type="button"
            className={`bid-import-mapa-toggle${modoEssencial ? ' bid-import-mapa-toggle--ativo' : ''}`}
            onClick={() => setModoEssencial(true)}
          >
            <Star size={12} weight={modoEssencial ? 'fill' : 'regular'} aria-hidden="true" />
            {t('pedido.smart_import.modo_essencial')}
          </button>
          <button
            type="button"
            className={`bid-import-mapa-toggle${!modoEssencial ? ' bid-import-mapa-toggle--ativo' : ''}`}
            onClick={() => setModoEssencial(false)}
          >
            {t('pedido.smart_import.modo_completo')}
          </button>
        </div>

        <div className="bid-import-mapa-busca">
          <MagnifyingGlass size={14} aria-hidden="true" />
          <input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder={t('pedido.smart_import.buscar_placeholder')}
            aria-label={t('pedido.smart_import.aria_buscar')}
          />
        </div>

        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          {t('pedido.smart_import.mostrando_de', { mostrando: linhasFiltradas.length, total })}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="smart-import__tabela" aria-label={t('pedido.smart_import.aria_tabela_mapeamento')}>
          <thead>
            <tr>
              <th scope="col">{t('pedido.smart_import.col_coluna_arquivo')}</th>
              <th scope="col">{t('pedido.smart_import.col_valor_extraido')}</th>
              <th scope="col">{t('pedido.smart_import.col_campo_sistema')}</th>
              <th scope="col">{t('pedido.smart_import.col_confianca')}</th>
              <th scope="col">{t('pedido.smart_import.col_inferido_por')}</th>
            </tr>
          </thead>
          <tbody>
            {linhasFiltradas.map(({ col, indexOriginal }) => {
              const ehObrigatorio = col.campo_sistema
                ? CAMPOS_ESSENCIAIS_IMPORTACAO_BID.has(col.campo_sistema)
                : false
              const ehEssencial = ehObrigatorio

              return (
                <tr
                  key={`${col.coluna_arquivo}-${indexOriginal}`}
                  style={ehObrigatorio ? { background: 'rgba(239,68,68,0.04)' } : undefined}
                >
                  <td
                    style={{
                      fontSize: '0.8125rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 220,
                    }}
                    title={col.coluna_arquivo}
                  >
                    {ehObrigatorio && (
                      <span style={{ color: '#ef4444', marginRight: '0.375rem', fontWeight: 700 }} aria-hidden="true">
                        ⚠️
                      </span>
                    )}
                    {!ehObrigatorio && ehEssencial && (
                      <Star size={11} weight="fill" style={{ color: '#f59e0b', marginRight: '0.375rem', verticalAlign: '-1px' }} aria-hidden="true" />
                    )}
                    {(col.coluna_arquivo ?? '').replace(/^\*+\s+/, '')}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', maxWidth: 180, whiteSpace: 'nowrap' }}>
                    {colunaEditando === indexOriginal ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          className="smart-import__numero-input"
                          value={valorTempEdicao}
                          onChange={e => setValorTempEdicao(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') confirmarEdicaoValor()
                            if (e.key === 'Escape') setColunaEditando(null)
                          }}
                          autoFocus
                          style={{ flex: 1, minWidth: 0, maxWidth: 140 }}
                        />
                        <button type="button" className="smart-import__btn-icone" onClick={confirmarEdicaoValor}>
                          <Check size={12} weight="bold" />
                        </button>
                        <button type="button" className="smart-import__btn-icone" onClick={() => setColunaEditando(null)}>
                          <X size={12} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {col.valor_exemplo
                          ? <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.valor_exemplo}</span>
                          : <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>—</span>}
                        <button
                          type="button"
                          className="smart-import__btn-icone"
                          onClick={() => {
                            setColunaEditando(indexOriginal)
                            setValorTempEdicao(col.valor_exemplo ?? '')
                          }}
                          style={{ opacity: 0.6, flexShrink: 0 }}
                        >
                          <PencilSimple size={11} weight="bold" />
                        </button>
                      </span>
                    )}
                  </td>
                  <td>
                    <SelectGlobal
                      buscavel
                      tamanho="compacto"
                      placeholder={t('pedido.smart_import.campo_extra_preservar')}
                      opcoes={[
                        { valor: '__drop__', rotulo: t('pedido.smart_import.descartar_campo') },
                        ...opcoesCampo.map(c => ({ valor: c.valor, rotulo: c.rotulo })),
                      ]}
                      valor={col.campo_sistema ?? null}
                      aoMudarValor={v => atualizarCampo(indexOriginal, v != null ? String(v) : null)}
                      aria-label={t('pedido.smart_import.aria_campo_sistema', { coluna: col.coluna_arquivo })}
                    />
                  </td>
                  <td>
                    <BadgeConfianca confianca={col.confianca} nivel={col.nivel} campoSistema={col.campo_sistema} />
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                    {labelInferidoPor(col.inferido_por)}
                  </td>
                </tr>
              )
            })}
            {linhasFiltradas.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  {t('pedido.smart_import.nenhum_filtro_corresponde')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {verDocumento && (
        <div className="bid-import-doc-overlay">
          <div className="bid-import-doc-panel">
            <div className="bid-import-doc-header">
              <strong>{nomeArquivo}</strong>
              <button type="button" className="smart-import__filtro-btn" onClick={() => setVerDocumento(false)}>
                {t('comum.fechar')}
              </button>
            </div>
            <div style={{ overflow: 'auto', maxHeight: '50vh' }}>
              <table className="smart-import__tabela">
                <thead>
                  <tr>
                    {mapeamento.map(m => (
                      <th key={m.coluna_arquivo} style={{ whiteSpace: 'nowrap' }}>{m.coluna_arquivo}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhasBrutas.slice(0, 20).map((linha, idx) => (
                    <tr key={idx}>
                      {mapeamento.map(m => (
                        <td key={m.coluna_arquivo} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {linha[m.coluna_arquivo] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
