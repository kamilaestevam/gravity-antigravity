/**
 * cotacoes-importar.tsx — Importação em lote de cotações / BID via planilha
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
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import {
  UploadSimple,
  FileArrowUp,
  FileXls,
  FileCsv,
  CheckCircle,
  XCircle,
  Warning,
  DownloadSimple,
} from '@phosphor-icons/react'

import { criarBidFreteInternacional, criarCotacao } from '../shared/api'
import type { TipoOperacao, ModalFrete, Incoterm } from '../shared/types'
import { INCOTERMS } from '../shared/types'
import './importar-bid-frete-internacional.css'

const LIMITE_LINHAS = 500
const TAMANHO_MAX_MB = 10
const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024

const EXPECTED_COLUMNS = [
  { key: 'tipo_operacao_cotacao_bid_frete_internacional', label: 'Tipo Operacao', example: 'IMPORTACAO ou EXPORTACAO' },
  { key: 'modal_cotacao_bid_frete_internacional', label: 'Modal', example: 'MARITIMO, AEREO ou RODOVIARIO' },
  { key: 'origem_codigo_cotacao_bid_frete_internacional', label: 'Origem (codigo)', example: 'BRSSZ' },
  { key: 'origem_nome_cotacao_bid_frete_internacional', label: 'Origem (nome)', example: 'Santos' },
  { key: 'destino_codigo_cotacao_bid_frete_internacional', label: 'Destino (codigo)', example: 'CNSHA' },
  { key: 'destino_nome_cotacao_bid_frete_internacional', label: 'Destino (nome)', example: 'Shanghai' },
  { key: 'descricao_mercadoria_cotacao_bid_frete_internacional', label: 'Mercadoria', example: 'Pecas automotivas' },
  { key: 'incoterm_cotacao_bid_frete_internacional', label: 'Incoterm', example: 'FOB, CIF, EXW...' },
  { key: 'quantidade_volume_cotacao_bid_frete_internacional', label: 'Quantidade de Volumes', example: '10' },
  { key: 'ncm_cotacao_bid_frete_internacional', label: 'NCM (opcional)', example: '8708.99.90' },
]

const VALID_TIPOS: TipoOperacao[] = ['IMPORTACAO', 'EXPORTACAO']
const VALID_MODAIS: ModalFrete[] = ['MARITIMO', 'AEREO', 'RODOVIARIO']

interface ParsedRow {
  tipo_operacao_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  incoterm_cotacao_bid_frete_internacional: string
  quantidade_volume_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string
}

interface ValidatedRow {
  id: number
  linha: number
  status: 'OK' | 'Erro'
  tipo_operacao_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  incoterm_cotacao_bid_frete_internacional: string
  quantidade_volume_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string
  erros: string
}

type ImportPhase = 'upload' | 'mapeamento' | 'preview' | 'creating' | 'done'

interface CreationResult {
  criadas: number
  erros: number
  detalhes: string[]
  numero_bid_bid_frete_internacional?: string
}

interface ParseResult {
  rows: ParsedRow[]
  colunasDetectadas: Set<string>
}

function validateRow(row: ParsedRow): string[] {
  const erros: string[] = []

  if (!row.tipo_operacao_cotacao_bid_frete_internacional?.trim()) {
    erros.push('tipo_operacao obrigatorio')
  } else if (!VALID_TIPOS.includes(row.tipo_operacao_cotacao_bid_frete_internacional.trim().toUpperCase() as TipoOperacao)) {
    erros.push('tipo_operacao invalido')
  }

  if (!row.modal_cotacao_bid_frete_internacional?.trim()) {
    erros.push('modal obrigatorio')
  } else if (!VALID_MODAIS.includes(row.modal_cotacao_bid_frete_internacional.trim().toUpperCase() as ModalFrete)) {
    erros.push('modal invalido')
  }

  if (!row.origem_codigo_cotacao_bid_frete_internacional?.trim()) erros.push('origem_codigo obrigatorio')
  if (!row.destino_codigo_cotacao_bid_frete_internacional?.trim()) erros.push('destino_codigo obrigatorio')
  if (!row.descricao_mercadoria_cotacao_bid_frete_internacional?.trim()) erros.push('mercadoria obrigatoria')

  if (!row.incoterm_cotacao_bid_frete_internacional?.trim()) {
    erros.push('incoterm obrigatorio')
  } else if (!INCOTERMS.includes(row.incoterm_cotacao_bid_frete_internacional.trim().toUpperCase() as Incoterm)) {
    erros.push('incoterm invalido')
  }

  const qty = Number(row.quantidade_volume_cotacao_bid_frete_internacional)
  if (!row.quantidade_volume_cotacao_bid_frete_internacional?.trim() || isNaN(qty) || qty <= 0) {
    erros.push('quantidade_volume invalida')
  }

  return erros
}

function parseCSV(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 2) return { rows: [], colunasDetectadas: new Set() }

  const delimiter = lines[0].includes(';') ? ';' : ','
  const headerLine = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/['"]/g, ''))

  const colMap: Record<string, number> = {}
  const colunasDetectadas = new Set<string>()

  EXPECTED_COLUMNS.forEach(col => {
    const idx = headerLine.findIndex(
      h => h === col.key || h === col.label.toLowerCase() || h.replace(/[_\s]/g, '') === col.key.replace(/[_\s]/g, ''),
    )
    if (idx >= 0) {
      colMap[col.key] = idx
      colunasDetectadas.add(col.key)
    }
  })

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''))
    rows.push({
      tipo_operacao_cotacao_bid_frete_internacional: cells[colMap.tipo_operacao_cotacao_bid_frete_internacional ?? 0] ?? '',
      modal_cotacao_bid_frete_internacional: cells[colMap.modal_cotacao_bid_frete_internacional ?? 1] ?? '',
      origem_codigo_cotacao_bid_frete_internacional: cells[colMap.origem_codigo_cotacao_bid_frete_internacional ?? 2] ?? '',
      origem_nome_cotacao_bid_frete_internacional: cells[colMap.origem_nome_cotacao_bid_frete_internacional ?? 3] ?? '',
      destino_codigo_cotacao_bid_frete_internacional: cells[colMap.destino_codigo_cotacao_bid_frete_internacional ?? 4] ?? '',
      destino_nome_cotacao_bid_frete_internacional: cells[colMap.destino_nome_cotacao_bid_frete_internacional ?? 5] ?? '',
      descricao_mercadoria_cotacao_bid_frete_internacional: cells[colMap.descricao_mercadoria_cotacao_bid_frete_internacional ?? 6] ?? '',
      incoterm_cotacao_bid_frete_internacional: cells[colMap.incoterm_cotacao_bid_frete_internacional ?? 7] ?? '',
      quantidade_volume_cotacao_bid_frete_internacional: cells[colMap.quantidade_volume_cotacao_bid_frete_internacional ?? 8] ?? '',
      ncm_cotacao_bid_frete_internacional: cells[colMap.ncm_cotacao_bid_frete_internacional ?? 9] ?? '',
    })
  }

  return { rows, colunasDetectadas }
}

function baixarTemplateModelo() {
  const headers = EXPECTED_COLUMNS.map(c => c.key).join(';')
  const exemplo = [
    'IMPORTACAO', 'MARITIMO', 'BRSSZ', 'Santos', 'CNSHA', 'Shanghai',
    'Pecas automotivas', 'FOB', '10', '8708.99.90',
  ].join(';')
  const csv = `${headers}\n${exemplo}\n`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template-importacao-bid-frete.csv'
  a.click()
  URL.revokeObjectURL(url)
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

export default function ImportarBloco() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contextoBid = searchParams.get('contexto') === 'bid'

  const [phase, setPhase] = useState<ImportPhase>('upload')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ValidatedRow[]>([])
  const [colunasDetectadas, setColunasDetectadas] = useState<Set<string>>(new Set())
  const [dragOver, setDragOver] = useState(false)
  const [erroUpload, setErroUpload] = useState<string | null>(null)
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

    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      const { rows: parsed, colunasDetectadas: detectadas } = parseCSV(content)

      if (parsed.length === 0) {
        setErroUpload(t('bidfrete.importar.vazio_arquivo'))
        return
      }
      if (parsed.length > LIMITE_LINHAS) {
        setErroUpload(t('bidfrete.importar.erro_limite_linhas', { max: LIMITE_LINHAS }))
        return
      }

      const validated: ValidatedRow[] = parsed.map((row, idx) => {
        const erros = validateRow(row)
        return {
          id: idx + 1,
          linha: idx + 1,
          status: erros.length === 0 ? 'OK' : 'Erro',
          ...row,
          erros: erros.join('; '),
        }
      })

      setColunasDetectadas(detectadas)
      setRows(validated)
      setPhase('mapeamento')
    }
    reader.readAsText(file, 'utf-8')
  }, [t])

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
        await criarCotacao({
          ...(idBid ? { id_bid_bid_frete_internacional: idBid } : {}),
          tipo_operacao_cotacao_bid_frete_internacional: row.tipo_operacao_cotacao_bid_frete_internacional.trim().toUpperCase() as TipoOperacao,
          modal_cotacao_bid_frete_internacional: row.modal_cotacao_bid_frete_internacional.trim().toUpperCase() as ModalFrete,
          origem_codigo_cotacao_bid_frete_internacional: row.origem_codigo_cotacao_bid_frete_internacional.trim(),
          origem_nome_cotacao_bid_frete_internacional: row.origem_nome_cotacao_bid_frete_internacional.trim() || row.origem_codigo_cotacao_bid_frete_internacional.trim(),
          origem_pais_cotacao_bid_frete_internacional: '',
          destino_codigo_cotacao_bid_frete_internacional: row.destino_codigo_cotacao_bid_frete_internacional.trim(),
          destino_nome_cotacao_bid_frete_internacional: row.destino_nome_cotacao_bid_frete_internacional.trim() || row.destino_codigo_cotacao_bid_frete_internacional.trim(),
          destino_pais_cotacao_bid_frete_internacional: '',
          descricao_mercadoria_cotacao_bid_frete_internacional: row.descricao_mercadoria_cotacao_bid_frete_internacional.trim(),
          incoterm_cotacao_bid_frete_internacional: row.incoterm_cotacao_bid_frete_internacional.trim().toUpperCase(),
          quantidade_volume_cotacao_bid_frete_internacional: Number(row.quantidade_volume_cotacao_bid_frete_internacional),
          ncm_cotacao_bid_frete_internacional: row.ncm_cotacao_bid_frete_internacional?.trim() || null,
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

  const handleReset = useCallback(() => {
    setPhase('upload')
    setFileName('')
    setRows([])
    setColunasDetectadas(new Set())
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
    { label: 'CSV', icone: <FileCsv size={28} weight="duotone" style={{ color: '#60a5fa' }} /> },
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
        {(phase === 'mapeamento' || phase === 'preview') && (
          <BotaoGlobal
            variante="secundario"
            tamanho="medio"
            onClick={() => setPhase(phase === 'preview' ? 'mapeamento' : 'upload')}
          >
            {t('comum.voltar')}
          </BotaoGlobal>
        )}
        {phase === 'mapeamento' && (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={() => setPhase('preview')}
            disabled={rows.length === 0}
          >
            {t('comum.proximo')}
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

                <div
                  className={`bid-import-upload-area${dragOver ? ' bid-import-upload-area--drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
                >
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
                </div>

                {erroUpload && (
                  <p role="alert" style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--danger, #ef4444)' }}>
                    {erroUpload}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('pedido.importar.nao_sabe_formato')}</span>
                  <button type="button" className="bid-import-template-link" onClick={baixarTemplateModelo}>
                    <DownloadSimple size={16} weight="duotone" />
                    {t('bidfrete.importar.baixar_template')}
                  </button>
                </div>
              </>
            )}

            {phase === 'mapeamento' && (
              <>
                <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {t('bidfrete.importar.mapeamento_desc')}
                </p>
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
                      {EXPECTED_COLUMNS.map(col => {
                        const detectada = colunasDetectadas.has(col.key)
                        const obrigatoria = col.key !== 'ncm_cotacao_bid_frete_internacional'
                        return (
                          <tr key={col.key}>
                            <td>{col.key}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{col.label}</td>
                            <td>
                              {detectada ? (
                                <span style={{ color: 'var(--success, #22c55e)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                  {t('bidfrete.importar.coluna_detectada')}
                                </span>
                              ) : obrigatoria ? (
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
                <p style={{ margin: '1rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {t('bidfrete.importar.linhas_total', { count: rows.length })}
                  {' · '}
                  {t('bidfrete.importar.validas', { count: validCount })}
                  {errorCount > 0 && ` · ${t('bidfrete.importar.com_erros', { count: errorCount })}`}
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
