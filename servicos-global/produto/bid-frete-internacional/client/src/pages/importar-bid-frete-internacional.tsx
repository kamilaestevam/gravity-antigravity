/**
 * importar-bid-frete-internacional.tsx — Importação em lote de cotações / BID via planilha
 * Layout: wizard em página (paridade Pedido Smart Import / ModalPassoPassoGlobal)
 */

import React, { useState, useCallback, useRef, useMemo } from 'react'
import { ConteudoCarregandoBidFreteInternacional } from '../shared/pagina-carregando-bid-frete-internacional'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import { WizardImportacaoBidFreteInternacional } from '../components/importacao/wizard-importacao-bid-frete-internacional'
import { EtapaMapeamentoBidFreteInternacional } from '../components/importacao/etapa-mapeamento-bid-frete-internacional'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import {
  UploadSimple,
  FileArrowUp,
  FileXls,
  CheckCircle,
  XCircle,
  Warning,
  DownloadSimple,
  Table,
  Sparkle,
} from '@phosphor-icons/react'

import { criarBidFreteInternacional, criarCotacao } from '../shared/api'
import type { TipoOperacao, Incoterm } from '../shared/types'
import { montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional } from '../../../shared/montar-payload-criacao-cotacao-importacao-bid-frete-internacional'
import { INCOTERMS } from '../shared/types'
import {
  CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL,
  rotuloCampoImportacaoBid,
} from '../../../shared/campos-importacao-bid-frete-internacional'
import {
  calcularConfiancaGlobalMapeamento,
  calcularScoreEssenciaisBid,
  camposEssenciaisAusentes,
  conflitosMapeamentoBid,
} from '../../../shared/mapear-colunas-importacao-bid-frete-internacional'
import {
  aplicarMapeamentoImportacaoBid,
} from '../../../shared/parsear-planilha-importacao-bid-frete-internacional'
import { analisarArquivoImportacaoBidFreteInternacional } from '../shared/analisar-importacao-bid-frete-internacional'
import type {
  ColunaMapeadaBidFreteInternacional,
  LinhaImportacaoBidFreteInternacional,
  ModoPlanilhaImportacaoBidFreteInternacional,
} from '../../../shared/tipos-importacao-bid-frete-internacional'
import './importar-bid-frete-internacional.css'

const LIMITE_LINHAS = 500
const TAMANHO_MAX_MB = 10
const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024

import { validarLinhaImportacaoBidFreteInternacional } from '../../../shared/validar-linha-importacao-bid-frete-internacional'

interface ValidatedRow extends LinhaImportacaoBidFreteInternacional {
  id: number
  linha: number
  status: 'OK' | 'Erro'
  erros: string
}

type ImportPhase = 'upload' | 'mapeamento' | 'preview' | 'creating' | 'done'

interface CreationResult {
  criadas: number
  erros: number
  detalhes: string[]
  numero_bid_bid_frete_internacional?: string
}

function validateRow(row: LinhaImportacaoBidFreteInternacional): string[] {
  return validarLinhaImportacaoBidFreteInternacional(row)
}

const URL_TEMPLATE_IMPORTACAO_BID = '/api/v1/bid-frete-internacional/importacao/template'

function linhasParaValidadas(linhas: LinhaImportacaoBidFreteInternacional[]): ValidatedRow[] {
  return linhas.map((row, idx) => {
    const erros = validateRow(row)
    return {
      id: idx + 1,
      linha: idx + 1,
      status: erros.length === 0 ? 'OK' : 'Erro',
      ...row,
      erros: erros.join('; '),
    }
  })
}

function faseParaPasso(fase: ImportPhase): number {
  switch (fase) {
    case 'upload': return 1
    case 'mapeamento': return 2
    case 'preview':
    case 'creating': return 3
    case 'done': return 4
    default: return 1
  }
}

export default function ImportarBidFreteInternacional() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contextoBid = searchParams.get('contexto') === 'bid'

  const [phase, setPhase] = useState<ImportPhase>('upload')
  const [modoPlanilha, setModoPlanilha] = useState<ModoPlanilhaImportacaoBidFreteInternacional>('gravity')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ValidatedRow[]>([])
  const [mapeamento, setMapeamento] = useState<ColunaMapeadaBidFreteInternacional[]>([])
  const [linhasBrutas, setLinhasBrutas] = useState<Record<string, string>[]>([])
  const [parserArquivo, setParserArquivo] = useState('csv')
  const [confiancaGlobal, setConfiancaGlobal] = useState(0)
  const [scoreEssenciais, setScoreEssenciais] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [erroUpload, setErroUpload] = useState<string | null>(null)
  const [analisandoArquivo, setAnalisandoArquivo] = useState(false)
  const [result, setResult] = useState<CreationResult | null>(null)
  const [referenciaBid, setReferenciaBid] = useState('')

  const passos = useMemo<PassoConfig[]>(() => [
    { id: 1, label: t('bidfrete.importar.passo_upload') },
    { id: 2, label: t('bidfrete.importar.passo_mapeamento') },
    { id: 3, label: t('bidfrete.importar.passo_preview') },
    { id: 4, label: t('bidfrete.importar.passo_resultado') },
  ], [t])

  const passoAtual = faseParaPasso(phase)
  const validCount = rows.filter(r => r.status === 'OK').length
  const errorCount = rows.filter(r => r.status === 'Erro').length

  const subtituloImportar = useMemo(() => {
    if (phase === 'upload') {
      return contextoBid ? t('bidfrete.importar.subtitulo_upload_bid') : t('bidfrete.importar.subtitulo_upload')
    }
    if (phase === 'mapeamento') return t('bidfrete.importar.subtitulo_mapeamento')
    if (phase === 'preview') return `${fileName} — ${rows.length} ${t('bidfrete.importar.linhas_carregadas')}`
    if (phase === 'creating') return contextoBid ? t('bidfrete.importar.criando_bid') : t('bidfrete.importar.criando')
    return t('bidfrete.importar.concluida')
  }, [contextoBid, fileName, phase, rows.length, t])

  const passoIndex = passos.findIndex(p => p.id === passoAtual)
  const essenciaisAusentes = useMemo(() => camposEssenciaisAusentes(mapeamento), [mapeamento])
  const conflitosMapeamento = useMemo(() => conflitosMapeamentoBid(mapeamento), [mapeamento])
  const podeAvancarMapeamento = essenciaisAusentes.length === 0
    && conflitosMapeamento.length === 0
    && rows.length > 0

  const handleMapeamentoChange = useCallback((novo: ColunaMapeadaBidFreteInternacional[]) => {
    setMapeamento(novo)
    setConfiancaGlobal(calcularConfiancaGlobalMapeamento(novo))
    setScoreEssenciais(calcularScoreEssenciaisBid(novo))
    const linhas = aplicarMapeamentoImportacaoBid(linhasBrutas, novo)
    setRows(linhasParaValidadas(linhas))
  }, [linhasBrutas])

  const processFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setErroUpload(t('bidfrete.importar.erro_formato'))
      return
    }
    if (file.size > TAMANHO_MAX_BYTES) {
      setErroUpload(t('bidfrete.importar.erro_tamanho', { mb: TAMANHO_MAX_MB }))
      return
    }

    setErroUpload(null)
    setFileName(file.name)
    setParserArquivo(ext)
    setAnalisandoArquivo(true)

    void analisarArquivoImportacaoBidFreteInternacional(file, modoPlanilha).then(resultado => {
      if (resultado.linhas.length === 0) {
        setErroUpload(t('bidfrete.importar.vazio_arquivo'))
        return
      }
      if (resultado.linhas.length > LIMITE_LINHAS) {
        setErroUpload(t('bidfrete.importar.erro_limite_linhas', { max: LIMITE_LINHAS }))
        return
      }

      setLinhasBrutas(resultado.linhas_brutas)
      setMapeamento(resultado.mapeamento as ColunaMapeadaBidFreteInternacional[])
      setConfiancaGlobal(resultado.confianca_global)
      setScoreEssenciais(resultado.score_essenciais)
      setRows(linhasParaValidadas(resultado.linhas as LinhaImportacaoBidFreteInternacional[]))
      setPhase('mapeamento')
    }).catch(err => {
      const msg = err instanceof Error ? err.message : t('bidfrete.importar.erro_formato')
      setErroUpload(msg)
    }).finally(() => {
      setAnalisandoArquivo(false)
    })
  }, [modoPlanilha, t])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleCreate = useCallback(async () => {
    setPhase('creating')
    const validRows = rows.filter(r => r.status === 'OK')
    let criadas = 0
    let erros = 0
    const detalhes: string[] = []
    let idBid: string | undefined
    let numeroBid: string | undefined

    if (contextoBid) {
      try {
        const bid = await criarBidFreteInternacional({
          referencia_interna_bid_bid_frete_internacional: referenciaBid.trim() || undefined,
        })
        idBid = bid.id_bid_bid_frete_internacional
        numeroBid = bid.numero_bid_bid_frete_internacional
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('bidfrete.novo_bid.erro_criar')
        setResult({ criadas: 0, erros: 1, detalhes: [msg] })
        setPhase('done')
        return
      }
    }

    for (const row of validRows) {
      try {
        const payload = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(row, idBid)
        await criarCotacao({
          ...payload,
          tipo_operacao_cotacao_bid_frete_internacional: payload.tipo_operacao_cotacao_bid_frete_internacional as TipoOperacao,
        })
        criadas++
      } catch (err) {
        erros++
        const msg = err instanceof Error ? err.message : t('bidfrete.importar.erro_desconhecido')
        detalhes.push(t('bidfrete.importar.erro_linha', { linha: row.linha, msg }))
      }
    }

    setResult({
      criadas,
      erros,
      detalhes,
      ...(numeroBid ? { numero_bid_bid_frete_internacional: numeroBid } : {}),
    })
    setPhase('done')
  }, [contextoBid, referenciaBid, rows, t])

  const handleTrocarArquivo = useCallback(() => {
    setPhase('upload')
    setFileName('')
    setRows([])
    setMapeamento([])
    setLinhasBrutas([])
    setConfiancaGlobal(0)
    setScoreEssenciais(0)
    setErroUpload(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleReset = useCallback(() => {
    setPhase('upload')
    setFileName('')
    setRows([])
    setMapeamento([])
    setLinhasBrutas([])
    setParserArquivo('csv')
    setConfiancaGlobal(0)
    setScoreEssenciais(0)
    setResult(null)
    setErroUpload(null)
    setReferenciaBid('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const colunas: TabelaGlobalColuna<ValidatedRow>[] = useMemo(() => [
    {
      key: 'linha',
      label: '#',
      tipo: 'numero',
      largura: 56,
      align: 'center',
      render: (v: unknown) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>{String(v)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      largura: 90,
      align: 'center',
      render: (v: unknown) => {
        const isOk = v === 'OK'
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
            background: isOk ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: isOk ? 'var(--success, #22c55e)' : 'var(--danger, #ef4444)',
          }}>
            {isOk ? <CheckCircle weight="duotone" size={13} /> : <XCircle weight="duotone" size={13} />}
            {String(v)}
          </span>
        )
      },
    },
    { key: 'tipo_operacao_cotacao_bid_frete_internacional', label: t('bidfrete.importar.col_tipo'), tipo: 'texto', largura: 110 },
    { key: 'modal_cotacao_bid_frete_internacional', label: t('bidfrete.importar.col_modal'), tipo: 'texto', largura: 100 },
    {
      key: 'origem_codigo_cotacao_bid_frete_internacional',
      label: t('bidfrete.importar.col_origem'),
      tipo: 'texto',
      largura: 90,
      render: (v: unknown) => <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>,
    },
    {
      key: 'destino_codigo_cotacao_bid_frete_internacional',
      label: t('bidfrete.importar.col_destino'),
      tipo: 'texto',
      largura: 90,
      render: (v: unknown) => <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>,
    },
    { key: 'descricao_mercadoria_cotacao_bid_frete_internacional', label: t('bidfrete.importar.col_mercadoria'), tipo: 'texto' },
    {
      key: 'incoterm_cotacao_bid_frete_internacional',
      label: t('bidfrete.importar.col_incoterm'),
      tipo: 'texto',
      largura: 80,
      align: 'center',
      render: (v: unknown) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', fontWeight: 600 }}>{String(v).toUpperCase()}</span>
      ),
    },
    {
      key: 'quantidade_volume_cotacao_bid_frete_internacional',
      label: t('bidfrete.importar.col_qtd'),
      tipo: 'numero',
      largura: 64,
      align: 'right',
      render: (v: unknown) => <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{String(v)}</span>,
    },
    {
      key: 'erros',
      label: t('bidfrete.importar.col_erros'),
      tipo: 'texto',
      render: (v: unknown) => {
        const text = String(v)
        if (!text) return null
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--danger, #ef4444)' }}>
            <Warning weight="duotone" size={13} />
            {text}
          </span>
        )
      },
    },
  ], [t])

  const formatosIcones = useMemo(() => [
    { label: 'Excel', icone: <FileXls size={28} weight="duotone" style={{ color: '#34d399' }} /> },
  ], [])

  const footerWizard = phase === 'creating' ? undefined : phase === 'done' && result ? (
    <div className="bid-import-footer-direita" style={{ width: '100%' }}>
      <BotaoGlobal variante="secundario" tamanho="medio" onClick={handleReset}>
        {t('bidfrete.importar.nova_importacao')}
      </BotaoGlobal>
      <BotaoGlobal variante="primario" tamanho="medio" onClick={() => navigate('/bid-frete/lista')}>
        {t('bidfrete.importar.ver_cotacoes')}
      </BotaoGlobal>
    </div>
  ) : (
    <>
      <BotaoGlobal variante="fantasma" tamanho="padrao" onClick={() => navigate('/bid-frete/lista')}>
        {t('comum.cancelar')}
      </BotaoGlobal>
      <div className="bid-import-footer-direita">
        <span className="bid-import-footer-indicador">
          {passoIndex + 1} / {passos.length}
        </span>
        {phase === 'mapeamento' && (
          <BotaoGlobal variante="secundario" tamanho="medio" onClick={() => setPhase('upload')}>
            {t('comum.voltar')}
          </BotaoGlobal>
        )}
        {phase === 'preview' && (
          <BotaoGlobal variante="secundario" tamanho="medio" onClick={() => setPhase('mapeamento')}>
            {t('comum.voltar')}
          </BotaoGlobal>
        )}
        {phase === 'mapeamento' && (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={() => setPhase('preview')}
            disabled={!podeAvancarMapeamento}
            title={
              conflitosMapeamento.length > 0
                ? t('bidfrete.importar.conflitos_mapeamento')
                : !podeAvancarMapeamento
                  ? t('bidfrete.importar.erro_campos_essenciais')
                  : undefined
            }
          >
            {t('pedido.smart_import.continuar')}
          </BotaoGlobal>
        )}
        {phase === 'preview' && (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={() => void handleCreate()}
            disabled={validCount === 0}
          >
            {t('bidfrete.importar.criar_cotacoes', { count: validCount })}
          </BotaoGlobal>
        )}
      </div>
    </>
  )

  return (
    <PaginaGlobal className="bid-frete-page-shell">
      <WizardImportacaoBidFreteInternacional
        titulo={contextoBid ? t('bidfrete.importar.titulo_bid') : t('bidfrete.importar.titulo')}
        subtitulo={subtituloImportar}
        icone={<UploadSimple size={20} weight="duotone" />}
        passos={passos}
        passoAtual={passoAtual}
        onFechar={() => navigate('/bid-frete/lista')}
        ocultarStepper={phase === 'done'}
        footer={footerWizard}
      >
            {phase === 'upload' && (
              <>
                {contextoBid && (
                  <label className="bid-import-referencia">
                    <span>{t('bidfrete.novo_bid.referencia')}</span>
                    <input
                      type="text"
                      value={referenciaBid}
                      onChange={e => setReferenciaBid(e.target.value)}
                      placeholder={t('bidfrete.novo_bid.referencia_placeholder')}
                    />
                  </label>
                )}

                <div className="bid-import-modo-grid" role="radiogroup" aria-label={t('bidfrete.importar.modo_planilha_label')}>
                  <button
                    type="button"
                    className={`bid-import-modo-btn${modoPlanilha === 'gravity' ? ' bid-import-modo-btn--ativo' : ''}`}
                    onClick={() => setModoPlanilha('gravity')}
                    aria-pressed={modoPlanilha === 'gravity'}
                  >
                    <Table size={22} weight="duotone" />
                    <span className="bid-import-modo-titulo">{t('bidfrete.importar.modo_gravity_titulo')}</span>
                    <span className="bid-import-modo-desc">{t('bidfrete.importar.modo_gravity_desc')}</span>
                  </button>
                  <button
                    type="button"
                    className={`bid-import-modo-btn${modoPlanilha === 'usuario' ? ' bid-import-modo-btn--ativo' : ''}`}
                    onClick={() => setModoPlanilha('usuario')}
                    aria-pressed={modoPlanilha === 'usuario'}
                  >
                    <Sparkle size={22} weight="duotone" />
                    <span className="bid-import-modo-titulo">{t('bidfrete.importar.modo_usuario_titulo')}</span>
                    <span className="bid-import-modo-desc">{t('bidfrete.importar.modo_usuario_desc')}</span>
                  </button>
                </div>

                <div
                  className={`bid-import-upload-area${dragOver ? ' bid-import-upload-area--drag-over' : ''}${analisandoArquivo ? ' bid-import-upload-area--loading' : ''}`}
                  onDragOver={analisandoArquivo ? undefined : e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={analisandoArquivo ? undefined : () => setDragOver(false)}
                  onDrop={analisandoArquivo ? undefined : handleDrop}
                  onClick={analisandoArquivo ? undefined : () => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={analisandoArquivo ? -1 : 0}
                  aria-busy={analisandoArquivo}
                  onKeyDown={analisandoArquivo ? undefined : e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
                >
                  {analisandoArquivo ? (
                    <ConteudoCarregandoBidFreteInternacional />
                  ) : (
                    <>
                  <FileArrowUp size={48} weight="duotone" className="bid-import-upload-icone" aria-hidden />
                  <div style={{ textAlign: 'center' }}>
                    <p className="bid-import-upload-titulo">{t('pedido.importar.arrastar')}</p>
                    <p className="bid-import-upload-sub">
                      {t('pedido.importar.tamanho_maximo', { mb: TAMANHO_MAX_MB })}
                      {' · '}
                      {t('bidfrete.importar.limite_linhas', { max: LIMITE_LINHAS })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
                    {formatosIcones.map(({ label, icone }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', opacity: 0.75 }}>
                        {icone}
                        <span style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </>
                  )}
                </div>

                {erroUpload && (
                  <p role="alert" style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--danger, #ef4444)' }}>
                    {erroUpload}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('pedido.importar.nao_sabe_formato')}</span>
                  <a
                    href={URL_TEMPLATE_IMPORTACAO_BID}
                    download="template-importacao-bid-frete.xlsx"
                    className="bid-import-template-link"
                  >
                    <DownloadSimple size={16} weight="duotone" />
                    {t('bidfrete.importar.baixar_template')}
                  </a>
                </div>
              </>
            )}

            {phase === 'mapeamento' && (
              <>
                {modoPlanilha === 'gravity' ? (
                  <>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {t('bidfrete.importar.mapeamento_desc')}
                    </p>
                    {essenciaisAusentes.length > 0 && (
                      <p role="alert" style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--danger, #ef4444)' }}>
                        {t('bidfrete.importar.erro_campos_essenciais')}: {essenciaisAusentes.map(rotuloCampoImportacaoBid).join(', ')}
                      </p>
                    )}
                    <div style={{ overflow: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem' }}>
                      <table className="bid-import-cols-table">
                        <thead>
                          <tr>
                            <th>{t('bidfrete.importar.th_coluna')}</th>
                            <th>{t('bidfrete.importar.th_descricao')}</th>
                            <th>{t('bidfrete.importar.col_status_mapeamento')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL.map(col => {
                            const detectada = mapeamento.some(m => m.campo_sistema === col.campo && m.confianca >= 70)
                            return (
                              <tr key={col.campo}>
                                <td>{col.campo}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{col.rotulo}</td>
                                <td>
                                  {detectada ? (
                                    <span style={{ color: 'var(--success, #22c55e)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                      {t('bidfrete.importar.coluna_detectada')}
                                    </span>
                                  ) : col.obrigatorio ? (
                                    <span style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8125rem' }}>
                                      {t('bidfrete.importar.coluna_ausente')}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    {confiancaGlobal > 0 && confiancaGlobal < 60 && (
                      <div className="bid-import-aviso-confianca">
                        {t('pedido.smart_import.aviso_confianca', { pct: confiancaGlobal })}
                      </div>
                    )}
                    <EtapaMapeamentoBidFreteInternacional
                      mapeamento={mapeamento}
                      linhasBrutas={linhasBrutas}
                      nomeArquivo={fileName}
                      parser={parserArquivo}
                      totalCotacoes={rows.length}
                      onMapeamentoChange={handleMapeamentoChange}
                      onTrocarArquivo={handleTrocarArquivo}
                    />
                  </>
                )}
                {conflitosMapeamento.length > 0 && (
                  <p role="alert" style={{ margin: '1rem 0 0', fontSize: '0.8125rem', color: 'var(--danger, #ef4444)' }}>
                    {t('bidfrete.importar.conflitos_mapeamento')}: {conflitosMapeamento.map(rotuloCampoImportacaoBid).join(', ')}
                  </p>
                )}
                <p style={{ margin: '1rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {t('bidfrete.importar.linhas_total', { count: rows.length })}
                  {' · '}
                  {t('bidfrete.importar.validas', { count: validCount })}
                  {errorCount > 0 && ` · ${t('bidfrete.importar.com_erros', { count: errorCount })}`}
                  {modoPlanilha === 'usuario' && ` · ${t('bidfrete.importar.score_essenciais', { pct: Math.round(scoreEssenciais * 100) })}`}
                </p>
              </>
            )}

            {(phase === 'preview' || phase === 'creating') && (
              <>
                {phase === 'creating' ? (
                  <div className="bid-import-result-card">
                    <ConteudoCarregandoBidFreteInternacional />
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {t('bidfrete.importar.processando', { count: validCount })}
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span className="bid-import-counter-badge" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success, #22c55e)' }}>
                        <CheckCircle weight="duotone" size={15} />
                        {t('bidfrete.importar.validas', { count: validCount })}
                      </span>
                      {errorCount > 0 && (
                        <span className="bid-import-counter-badge" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger, #ef4444)' }}>
                          <XCircle weight="duotone" size={15} />
                          {t('bidfrete.importar.com_erros', { count: errorCount })}
                        </span>
                      )}
                    </div>
                    <TabelaGlobal
                      idKey="id"
                      colunas={colunas}
                      dados={rows}
                      mensagemVazio={t('bidfrete.importar.vazio')}
                      tooltipBusca={t('bidfrete.importar.buscar_placeholder')}
                    />
                  </>
                )}
              </>
            )}

            {phase === 'done' && result && (
              <div className="bid-import-result-card">
                {result.erros === 0 ? (
                  <CheckCircle weight="duotone" size={48} style={{ color: 'var(--success, #22c55e)' }} />
                ) : (
                  <Warning weight="duotone" size={48} style={{ color: 'var(--warning, #f59e0b)' }} />
                )}
                <div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {result.numero_bid_bid_frete_internacional
                      ? t('bidfrete.importar.concluida_bid', { numero: result.numero_bid_bid_frete_internacional })
                      : t('bidfrete.importar.concluida')}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <span className="bid-import-counter-badge" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success, #22c55e)' }}>
                      <CheckCircle weight="duotone" size={14} />
                      {t('bidfrete.importar.criadas', { count: result.criadas })}
                    </span>
                    {result.erros > 0 && (
                      <span className="bid-import-counter-badge" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger, #ef4444)' }}>
                        <XCircle weight="duotone" size={14} />
                        {t('bidfrete.importar.erros_count', { count: result.erros })}
                      </span>
                    )}
                  </div>
                </div>
                {result.detalhes.length > 0 && (
                  <div style={{ width: '100%', background: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem', padding: '0.75rem 1rem', textAlign: 'left' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger, #ef4444)', textTransform: 'uppercase' }}>
                      {t('bidfrete.importar.detalhes_erros')}
                    </p>
                    {result.detalhes.map((d, i) => (
                      <p key={i} style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
                        {d}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
      </WizardImportacaoBidFreteInternacional>
    </PaginaGlobal>
  )
}
