import { useMemo, useRef, useState } from 'react'
import {
  CheckCircle,
  FileArrowUp,
  FileXls,
  FileCsv,
  FileCode,
  File,
  DownloadSimple,
  Lightbulb,
  PencilSimple,
  Warning,
  XCircle,
  CaretDown,
  CaretRight,
  Brain,
  Table,
  MagnifyingGlass,
  Star,
  Question,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import '../../../Campos/campo-select-global/src/select.css'
import {
  CAMPOS_PEDIDO_DDD_TODOS,
  prioridadeDeCampo,
} from '../../../../servicos-global/produto/pedido/shared/campos-pedido-ddd'
import {
  EXTENSOES_IMPORTACAO_SIMULADOR,
  FORMATOS_ICONE_IMPORTACAO_SIMULADOR,
  LIMITE_LINHAS_IMPORTACAO_SIMULADOR,
  rotuloCampoSmartImportSimulador,
} from './dados-smart-import-simulador-pedido'
import { formatarValorPreviewSmartImportSimulador } from './formatar-valor-preview-smart-import-simulador-pedido'
import { baixarTemplateXlsxSmartImportSimuladorPedido } from './gerar-template-xlsx-smart-import-simulador-pedido'
import type {
  ColunaMapeadaSimulador,
  DecisaoDuplicataSimulador,
  ErroDetalhadoUploadSimulador,
  SmartImportLinhaRawSimulador,
  SmartImportLinhaSimulador,
  SmartImportResultadoSimulador,
} from './tipos-smart-import-simulador-pedido'

const TAMANHO_MAX_MB = 10
const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024

const CAMPOS_ESSENCIAIS = new Set(
  CAMPOS_PEDIDO_DDD_TODOS
    .filter((c) => prioridadeDeCampo(c) !== 'secundaria')
    .map((c) => c.campo),
)
const CAMPOS_OBRIGATORIOS = new Set(
  CAMPOS_PEDIDO_DDD_TODOS.filter((c) => c.obrigatorio).map((c) => c.campo),
)

function BadgeConfianca({ confianca, nivel, campoSistema }: {
  confianca: number
  nivel: ColunaMapeadaSimulador['nivel']
  campoSistema?: string | null
}) {
  if (nivel === 'ignorado' && !campoSistema) {
    return <span className="smart-import__conf-cinza"><Question size={14} aria-hidden /> Campo extra</span>
  }
  if (confianca >= 90) {
    return <span className="smart-import__conf-verde"><CheckCircle size={14} aria-hidden /> {confianca}%</span>
  }
  if (confianca >= 50) {
    return <span className="smart-import__conf-amarelo"><Warning size={14} aria-hidden /> {confianca}%</span>
  }
  return <span className="smart-import__conf-cinza"><Question size={14} aria-hidden /> {confianca}%</span>
}

type UploadProps = {
  onArquivoSelecionado: (arquivo: File) => void
  carregando: boolean
  erro: ErroDetalhadoUploadSimulador | null
  avisoPlanilhaModeloBaixada?: boolean
  nomePlanilhaModeloBaixada?: string
}

export function EtapaUploadSmartImportSimulador({
  onArquivoSelecionado,
  carregando,
  erro,
  avisoPlanilhaModeloBaixada = false,
  nomePlanilhaModeloBaixada,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const [baixandoTemplate, setBaixandoTemplate] = useState(false)
  const [erroTemplate, setErroTemplate] = useState<string | null>(null)

  function validarESelecionar(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!EXTENSOES_IMPORTACAO_SIMULADOR.includes(ext as typeof EXTENSOES_IMPORTACAO_SIMULADOR[number])) {
      setErroLocal(`Formato .${ext} não suportado. Use: ${EXTENSOES_IMPORTACAO_SIMULADOR.join(', ')}.`)
      return
    }
    if (file.size > TAMANHO_MAX_BYTES) {
      setErroLocal(`Arquivo muito grande. Tamanho máximo: ${TAMANHO_MAX_MB}MB.`)
      return
    }
    setErroLocal(null)
    onArquivoSelecionado(file)
  }

  const erroExibir: ErroDetalhadoUploadSimulador | null = erro ?? (erroLocal ? {
    code: 'VALIDACAO_LOCAL',
    titulo: 'Não foi possível processar o arquivo',
    mensagem: erroLocal,
    sugestoes: [
      `Formatos aceitos: ${EXTENSOES_IMPORTACAO_SIMULADOR.join(', ')} (PDF via Smart Docs)`,
      `Tamanho máximo: ${TAMANHO_MAX_MB}MB`,
      `Máximo de ${LIMITE_LINHAS_IMPORTACAO_SIMULADOR} linhas por importação`,
      'Baixe a planilha modelo abaixo se ainda não tiver o arquivo correto',
    ],
    retryable: false,
  } : null)

  async function handleBaixarTemplate() {
    if (baixandoTemplate) return
    setErroTemplate(null)
    setBaixandoTemplate(true)
    try {
      await baixarTemplateXlsxSmartImportSimuladorPedido()
    } catch {
      setErroTemplate('Não foi possível gerar a planilha modelo. Tente novamente.')
    } finally {
      setBaixandoTemplate(false)
    }
  }

  return (
    <div>
      <div className="smart-import__upload-conteudo">
      {avisoPlanilhaModeloBaixada && (
        <div className="smart-import__aviso-download-modelo" role="status" aria-live="polite">
          <CheckCircle size={22} weight="fill" className="smart-import__aviso-download-modelo-icone" aria-hidden />
          <div>
            <p className="smart-import__aviso-download-modelo-titulo">Download da planilha modelo concluído</p>
            <p className="smart-import__aviso-download-modelo-texto">
              A <strong>planilha modelo Gravity preenchida</strong> (
              {nomePlanilhaModeloBaixada ?? 'planilha_preenchido_teste_site_marketplace.xlsx'}) foi baixada para o seu
              computador. Anexe esse arquivo na área abaixo para continuar.
            </p>
            <p className="smart-import__aviso-download-modelo-dica">
              <Lightbulb size={14} weight="fill" className="smart-import__aviso-download-modelo-dica-icone" aria-hidden />
              <span>
                Se quiser ver a planilha ou alterar algo, basta abrir o arquivo na pasta{' '}
                <strong>Downloads</strong> do seu computador.
              </span>
            </p>
          </div>
        </div>
      )}

      <div
        className={`smart-import__upload-area${dragOver ? ' smart-import__upload-area--drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) validarESelecionar(file)
        }}
        onClick={() => !carregando && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Área de upload — clique ou arraste um arquivo"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      >
        <FileArrowUp size={40} weight="duotone" className="smart-import__upload-icone" aria-hidden />
        <div className="smart-import__upload-texto">
          <p className="smart-import__upload-titulo">
            {carregando
              ? 'Analisando arquivo...'
              : avisoPlanilhaModeloBaixada
                ? 'Anexe a planilha que você acabou de baixar'
                : 'Arraste um arquivo ou clique para selecionar'}
          </p>
          <p className="smart-import__upload-sub">
            Tamanho máximo: {TAMANHO_MAX_MB}MB · Máximo: {LIMITE_LINHAS_IMPORTACAO_SIMULADOR} linhas
          </p>
        </div>
        <div className="smart-import__upload-formatos" role="list" aria-label="Formatos aceitos">
          {FORMATOS_ICONE_IMPORTACAO_SIMULADOR.map(({ ext, label }) => (
            <div key={ext} className="smart-import__upload-formato" role="listitem" title={`.${ext}`}>
              {ext === 'xlsx' || ext === 'xls' ? (
                <FileXls size={28} weight="duotone" className="smart-import__upload-formato-icone smart-import__upload-formato-icone--xls" aria-hidden />
              ) : ext === 'csv' ? (
                <FileCsv size={28} weight="duotone" className="smart-import__upload-formato-icone smart-import__upload-formato-icone--csv" aria-hidden />
              ) : ext === 'xml' || ext === 'json' ? (
                <FileCode size={28} weight="duotone" className={`smart-import__upload-formato-icone smart-import__upload-formato-icone--${ext}`} aria-hidden />
              ) : (
                <File size={28} weight="duotone" className="smart-import__upload-formato-icone smart-import__upload-formato-icone--txt" aria-hidden />
              )}
              <span className="smart-import__upload-formato-label">{label}</span>
            </div>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={EXTENSOES_IMPORTACAO_SIMULADOR.map((e) => `.${e}`).join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) validarESelecionar(file)
          }}
          style={{ display: 'none' }}
          aria-hidden
        />
      </div>

      {!avisoPlanilhaModeloBaixada && (
      <div className="smart-import__upload-rodape">
        <span className="smart-import__upload-rodape-hint">Ainda não tem a planilha modelo?</span>
        <button
          type="button"
          className="smart-import__btn-baixar-template"
          disabled={baixandoTemplate}
          onClick={() => { void handleBaixarTemplate() }}
        >
          <DownloadSimple size={14} weight="bold" aria-hidden />
          {baixandoTemplate ? 'Gerando planilha...' : 'Baixar planilha modelo vazia (.xlsx)'}
        </button>
        {erroTemplate && (
          <span className="smart-import__upload-erro-template" role="alert">{erroTemplate}</span>
        )}
      </div>
      )}
      </div>

      {erroExibir && (
        <div role="alert" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#ef4444' }}>
            <Warning size={18} weight="fill" aria-hidden style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>{erroExibir.titulo}</strong>
              <span style={{ fontSize: '0.8125rem', color: '#fca5a5', display: 'block' }}>{erroExibir.mensagem}</span>
            </div>
          </div>
          {erroExibir.sugestoes.length > 0 && (
            <ul style={{ margin: '0.75rem 0 0 1.125rem', padding: 0, fontSize: '0.8125rem', color: 'var(--text-default, #e2e8f0)', lineHeight: 1.6 }}>
              {erroExibir.sugestoes.map((s) => <li key={s}>{s}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

type MapeamentoProps = {
  mapeamento: ColunaMapeadaSimulador[]
  memoriaAplicada: boolean
  lembrarMapeamento: boolean
  dadosBrutos?: SmartImportLinhaRawSimulador[]
  onMapeamentoChange: (novo: ColunaMapeadaSimulador[]) => void
  onLembrarChange: (valor: boolean) => void
  onVoltar?: () => void
}

export function EtapaMapeamentoSmartImportSimulador({
  mapeamento,
  memoriaAplicada,
  lembrarMapeamento,
  dadosBrutos,
  onMapeamentoChange,
  onLembrarChange,
  onVoltar,
}: MapeamentoProps) {
  const [modoEssencial, setModoEssencial] = useState(true)
  const [busca, setBusca] = useState('')
  const [verDocumento, setVerDocumento] = useState(false)

  const camposAgrupados = useMemo(() => {
    const grupos: { label: string; opcoes: Array<{ valor: string; rotulo: string }> }[] = []
    const indice = new Map<string, Array<{ valor: string; rotulo: string }>>()

    for (const c of CAMPOS_PEDIDO_DDD_TODOS) {
      const prefixo = c.nivel === 'item' ? '📋 Item' : '📦 Pedido'
      const chave = `${prefixo} — ${c.grupo ?? 'Outros'}`
      if (!indice.has(chave)) {
        indice.set(chave, [])
        grupos.push({ label: chave, opcoes: indice.get(chave)! })
      }
      indice.get(chave)!.push({ valor: c.campo, rotulo: c.rotulo })
    }

    grupos.sort((a, b) => {
      const aPedido = a.label.startsWith('📦')
      const bPedido = b.label.startsWith('📦')
      if (aPedido !== bPedido) return aPedido ? -1 : 1
      return 0
    })
    return grupos
  }, [])

  const linhasFiltradas = useMemo(() => {
    const buscaNorm = busca.trim().toLowerCase()
    return mapeamento
      .map((col, indexOriginal) => ({ col, indexOriginal }))
      .filter(({ col }) => {
        if (modoEssencial && col.campo_sistema && !CAMPOS_ESSENCIAIS.has(col.campo_sistema)) return false
        if (buscaNorm) {
          const rotulo = CAMPOS_PEDIDO_DDD_TODOS.find((c) => c.campo === col.campo_sistema)?.rotulo ?? rotuloCampoSmartImportSimulador(col.campo_sistema ?? '')
          const nomeColuna = col.coluna_arquivo.replace(/^\*+\s+/, '')
          const haystack = `${nomeColuna} ${col.valor_exemplo_coluna_pedido ?? ''} ${rotulo}`.toLowerCase()
          if (!haystack.includes(buscaNorm)) return false
        }
        return true
      })
  }, [mapeamento, modoEssencial, busca])

  const essenciaisMapeados = mapeamento.filter((m) => m.campo_sistema && CAMPOS_ESSENCIAIS.has(m.campo_sistema)).length
  const obrigatoriosMapeados = mapeamento.filter((m) => m.campo_sistema && CAMPOS_OBRIGATORIOS.has(m.campo_sistema)).length
  const obrigatoriosFaltando = CAMPOS_OBRIGATORIOS.size - obrigatoriosMapeados
  const mapeadas = mapeamento.filter((m) => m.campo_sistema && m.campo_sistema !== '__drop__').length

  function atualizarCampo(index: number, campo: string | null) {
    const next = [...mapeamento]
    const atual = next[index]
    if (!atual) return
    next[index] = {
      ...atual,
      campo_sistema: campo || null,
      nivel: campo ? 'manual' : 'ignorado',
      inferido_por: 'usuario',
      confianca: campo ? Math.max(atual.confianca, 70) : 0,
    }
    onMapeamentoChange(next)
  }

  return (
    <div style={{ position: 'relative' }}>
      {onVoltar && (
        <button type="button" className="smart-import__filtro-btn" onClick={onVoltar} style={{ marginBottom: '0.75rem' }}>
          ← Trocar arquivo
        </button>
      )}

      <div className="smart-import__mapa-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{essenciaisMapeados} de {CAMPOS_ESSENCIAIS.size}</strong> campos essenciais mapeados
            {obrigatoriosFaltando > 0 && (
              <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                · ⚠️ {obrigatoriosFaltando} obrigatório(s) faltando
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.6875rem' }}>
              ({mapeadas} de {mapeamento.length} colunas)
            </span>
          </p>
          {memoriaAplicada && (
            <span className="smart-import__badge-memoria"><Brain size={11} aria-hidden /> Memória aplicada</span>
          )}
          {dadosBrutos && dadosBrutos.length > 0 && (
            <button type="button" className="smart-import__filtro-btn" onClick={() => setVerDocumento(true)}>
              <Table size={13} weight="duotone" aria-hidden /> Ver documento
            </button>
          )}
        </div>
        <label className="smart-import__lembrar">
          <input type="checkbox" checked={lembrarMapeamento} onChange={(e) => onLembrarChange(e.target.checked)} />
          Lembrar este mapeamento
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0', padding: '0.5rem 0.75rem', background: 'var(--bg-surface, #1e293b)', borderRadius: '6px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setModoEssencial(true)} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, borderRadius: '4px', border: '1px solid', borderColor: modoEssencial ? '#60a5fa' : 'transparent', background: modoEssencial ? 'rgba(96,165,250,0.12)' : 'transparent', color: modoEssencial ? '#60a5fa' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Star size={12} weight={modoEssencial ? 'fill' : 'regular'} aria-hidden /> Essencial
        </button>
        <button type="button" onClick={() => setModoEssencial(false)} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, borderRadius: '4px', border: '1px solid', borderColor: !modoEssencial ? '#60a5fa' : 'transparent', background: !modoEssencial ? 'rgba(96,165,250,0.12)' : 'transparent', color: !modoEssencial ? '#60a5fa' : 'var(--text-secondary)', cursor: 'pointer' }}>
          Completo
        </button>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '180px', position: 'relative' }}>
          <MagnifyingGlass size={14} aria-hidden style={{ position: 'absolute', left: '0.5rem', color: 'var(--text-muted)' }} />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar coluna ou campo..."
            style={{ flex: 1, padding: '0.375rem 0.5rem 0.375rem 1.875rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--bg-elevated, #334155)', background: 'var(--bg-elevated, #0f172a)', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          Mostrando {linhasFiltradas.length} de {mapeamento.length}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="smart-import__tabela" aria-label="Mapeamento de colunas">
          <thead>
            <tr>
              <th scope="col">Coluna do arquivo</th>
              <th scope="col">Valor extraído</th>
              <th scope="col">Campo do sistema</th>
              <th scope="col">Confiança</th>
              <th scope="col">Inferido por</th>
            </tr>
          </thead>
          <tbody>
            {linhasFiltradas.map(({ col, indexOriginal }) => {
              const ehObrigatorio = col.campo_sistema ? CAMPOS_OBRIGATORIOS.has(col.campo_sistema) : false
              const ehEssencial = col.campo_sistema ? CAMPOS_ESSENCIAIS.has(col.campo_sistema) : false
              const nomeColunaExibido = col.coluna_arquivo.replace(/^\*+\s+/, '')
              const inferidoLabel = col.inferido_por === 'ia' ? 'IA'
                : col.inferido_por === 'dados' ? 'Dados'
                  : col.inferido_por === 'memoria' ? 'Memória'
                    : 'Usuário'

              return (
              <tr
                key={`${col.coluna_arquivo}-${indexOriginal}`}
                style={ehObrigatorio ? { background: 'rgba(239,68,68,0.04)' } : undefined}
              >
                <td title={col.coluna_arquivo} style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ehObrigatorio && (
                    <span style={{ color: '#ef4444', marginRight: '0.375rem', fontWeight: 700 }} title="Campo obrigatório">⚠️</span>
                  )}
                  {!ehObrigatorio && ehEssencial && (
                    <Star size={11} weight="fill" style={{ color: '#f59e0b', marginRight: '0.375rem', verticalAlign: '-1px' }} aria-hidden />
                  )}
                  {nomeColunaExibido}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{col.valor_exemplo_coluna_pedido ?? '—'}</td>
                <td style={{ minWidth: 220 }}>
                  <SelectGlobal
                    placeholder="→ Campo extra (preservar)"
                    opcoes={[{ valor: '__drop__', rotulo: 'Descartar campo' }]}
                    grupos={camposAgrupados.map((g) => ({
                      rotulo: g.label,
                      opcoes: g.opcoes,
                    }))}
                    valor={col.campo_sistema ?? null}
                    aoMudarValor={(v) => atualizarCampo(indexOriginal, v != null ? String(v) : null)}
                    buscavel
                    tamanho="compacto"
                  />
                </td>
                <td><BadgeConfianca confianca={col.confianca} nivel={col.nivel} campoSistema={col.campo_sistema} /></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{inferidoLabel}</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {verDocumento && dadosBrutos && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setVerDocumento(false)}>
          <div style={{ background: 'var(--bg-surface, #1e1e2e)', borderRadius: '0.5rem', maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto', padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong>Documento original</strong>
              <button type="button" className="smart-import__filtro-btn" onClick={() => setVerDocumento(false)}>Fechar</button>
            </div>
            <table className="smart-import__tabela">
              <tbody>
                {dadosBrutos.map((row) => (
                  <tr key={row.linha}>
                    <td>#{row.linha}</td>
                    <td>{Object.entries(row.valores).map(([k, v]) => `${k}: ${v}`).join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function IconeStatus({ status }: { status: SmartImportLinhaSimulador['status'] }) {
  if (status === 'ok') return <CheckCircle size={18} weight="fill" className="smart-import__status-ok" aria-hidden />
  if (status === 'aviso') return <Warning size={18} weight="fill" className="smart-import__status-aviso" aria-hidden />
  return <XCircle size={18} weight="fill" className="smart-import__status-erro" aria-hidden />
}

type PreviewProps = {
  linhas: SmartImportLinhaSimulador[]
  linhasSelecionadas: Set<number>
  decisoesDuplicatas: Record<string, DecisaoDuplicataSimulador>
  numerosEditados: Record<number, string>
  onSelecaoChange: (next: Set<number>) => void
  onDecisaoDuplicata: (numero: string, decisao: DecisaoDuplicataSimulador) => void
  onNumeroEditado: (linhaArquivo: number, numero: string) => void
}

export function EtapaPreviewSmartImportSimulador({
  linhas,
  linhasSelecionadas,
  decisoesDuplicatas,
  numerosEditados,
  onSelecaoChange,
  onDecisaoDuplicata,
  onNumeroEditado,
}: PreviewProps) {
  const [filtro, setFiltro] = useState<'todos' | 'ok' | 'aviso' | 'erro'>('todos')

  const linhasFiltradas = useMemo(
    () => linhas.filter((l) => filtro === 'todos' || l.status === filtro),
    [linhas, filtro],
  )
  const contagem = useMemo(() => ({
    todos: linhas.length,
    ok: linhas.filter((l) => l.status === 'ok').length,
    aviso: linhas.filter((l) => l.status === 'aviso').length,
    erro: linhas.filter((l) => l.status === 'erro').length,
  }), [linhas])

  const pedidosUnicosTotal = useMemo(
    () => new Set(linhas.map((l) => l.numero_pedido).filter(Boolean)).size,
    [linhas],
  )
  const pedidosUnicosSelecionados = useMemo(
    () => new Set(
      linhas
        .filter((l) => linhasSelecionadas.has(l.linha_arquivo))
        .map((l) => l.numero_pedido)
        .filter(Boolean),
    ).size,
    [linhas, linhasSelecionadas],
  )

  const duplicatas = linhas.filter((l) => l.alertas.some((a) => a.tipo === 'duplicado_sistema'))
  const atualizados = duplicatas.filter((l) => decisoesDuplicatas[l.numero_pedido ?? ''] === 'sobrescrever').length
  const pulados = duplicatas.filter((l) => decisoesDuplicatas[l.numero_pedido ?? ''] === 'pular').length

  function selecionarTodasValidas() {
    onSelecaoChange(new Set(linhas.filter((l) => l.status === 'ok').map((l) => l.linha_arquivo)))
  }

  function selecionarTodas() {
    onSelecaoChange(new Set(linhas.map((l) => l.linha_arquivo)))
  }

  function desselecionarTodas() {
    onSelecaoChange(new Set())
  }

  return (
    <div>
      <div className="smart-import__contador" role="status">
        <span><strong>{pedidosUnicosSelecionados}</strong> pedido(s) de <strong>{pedidosUnicosTotal}</strong> únicos</span>
        <span>·</span>
        <span><strong>{linhasSelecionadas.size}</strong> linha(s) incluídas</span>
        <span>·</span>
        <span><strong>{atualizados}</strong> atualiz.</span>
        <span>·</span>
        <span><strong>{pulados}</strong> pulados</span>
        {contagem.erro > 0 && (
          <span style={{ color: '#ef4444' }}>
            · <strong>{contagem.erro}</strong> com erro
          </span>
        )}
      </div>

      <div className="smart-import__filtros" role="group" aria-label="Filtrar linhas do preview">
        {(['todos', 'ok', 'aviso', 'erro'] as const).map((id) => (
          <button
            key={id}
            type="button"
            className={`smart-import__filtro-btn${filtro === id ? ' smart-import__filtro-btn--ativo' : ''}`}
            onClick={() => setFiltro(id)}
            aria-pressed={filtro === id}
          >
            {id === 'todos' ? 'Todos' : id.charAt(0).toUpperCase() + id.slice(1)} ({contagem[id]})
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="smart-import__filtro-btn" onClick={selecionarTodasValidas}>
            Selecionar válidas
          </button>
          <button
            type="button"
            className="smart-import__filtro-btn"
            onClick={() => onSelecaoChange(new Set([
              ...Array.from(linhasSelecionadas),
              ...linhas.filter((l) => l.status === 'aviso').map((l) => l.linha_arquivo),
            ]))}
          >
            + Incluir avisos
          </button>
          <button type="button" className="smart-import__filtro-btn" onClick={selecionarTodas}>
            Selecionar todas
          </button>
          <button type="button" className="smart-import__filtro-btn" onClick={desselecionarTodas}>
            Limpar seleção
          </button>
        </div>
      </div>

      <div className="smart-import__cards-lista">
        {linhasFiltradas.map((linha) => (
            <CardPreviewLinha
              key={linha.linha_arquivo}
              linha={linha}
              selecionada={linhasSelecionadas.has(linha.linha_arquivo)}
              numero={numerosEditados[linha.linha_arquivo] ?? linha.numero_pedido ?? '—'}
              numeroEditado={numerosEditados[linha.linha_arquivo] != null}
              temDuplicata={linha.alertas.some((a) => a.tipo === 'duplicado_sistema')}
              decisao={linha.numero_pedido ? decisoesDuplicatas[linha.numero_pedido] : undefined}
              onToggleSelecao={() => {
                const selecionada = linhasSelecionadas.has(linha.linha_arquivo)
                const next = new Set(linhasSelecionadas)
                if (selecionada) next.delete(linha.linha_arquivo)
                else next.add(linha.linha_arquivo)
                onSelecaoChange(next)
              }}
              onDecisao={(d) => linha.numero_pedido && onDecisaoDuplicata(linha.numero_pedido, d)}
              onNumeroEditado={(n) => onNumeroEditado(linha.linha_arquivo, n)}
            />
          ))}
      </div>
    </div>
  )
}

function CardPreviewLinha({
  linha,
  selecionada,
  numero,
  numeroEditado,
  temDuplicata,
  decisao,
  onToggleSelecao,
  onDecisao,
  onNumeroEditado,
}: {
  linha: SmartImportLinhaSimulador
  selecionada: boolean
  numero: string
  numeroEditado: boolean
  temDuplicata: boolean
  decisao?: DecisaoDuplicataSimulador
  onToggleSelecao: () => void
  onDecisao: (d: DecisaoDuplicataSimulador) => void
  onNumeroEditado: (n: string) => void
}) {
  const [editandoNumero, setEditandoNumero] = useState(false)
  const [numeroTemp, setNumeroTemp] = useState(numero)
  const [expandidoCampos, setExpandidoCampos] = useState(false)
  const [expandidoAlertas, setExpandidoAlertas] = useState(false)
  const exportador = linha.dados.nome_exportador ?? linha.dados.exportador

  const camposVisiveis = Object.entries(linha.dados)
    .filter(([k]) => k !== 'numero_pedido' && k !== 'tipo_linha' && k !== '_origem')
    .filter(([k]) => !k.startsWith('data_criacao_') && !k.startsWith('data_atualizacao_'))
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')

  function confirmarEdicaoNumero() {
    if (numeroTemp.trim()) onNumeroEditado(numeroTemp.trim())
    setEditandoNumero(false)
  }

  return (
    <div className={`smart-import__card-pedido${selecionada ? ' smart-import__card-pedido--selecionado' : ' smart-import__card-pedido--desmarcado'}`}>
      <div className="smart-import__card-header">
        <input
          type="checkbox"
          checked={selecionada}
          onChange={onToggleSelecao}
          disabled={linha.status === 'erro'}
          aria-label={`Selecionar linha ${linha.linha_arquivo}`}
          style={{ flexShrink: 0 }}
        />

        {linha.status === 'ok' && !temDuplicata && (
          <span style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            NOVO PEDIDO
          </span>
        )}
        {linha.status === 'aviso' && !temDuplicata && (
          <span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            COM AVISO
          </span>
        )}
        {linha.status === 'erro' && (
          <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            COM ERRO
          </span>
        )}

        <div className="smart-import__numero-pedido-wrapper">
          {editandoNumero ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <input
                className="smart-import__numero-input"
                value={numeroTemp}
                onChange={(e) => setNumeroTemp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmarEdicaoNumero()
                  if (e.key === 'Escape') setEditandoNumero(false)
                }}
                autoFocus
                aria-label="Número do pedido"
              />
              <button type="button" className="smart-import__btn-icone" onClick={confirmarEdicaoNumero} aria-label="Confirmar">
                <CheckCircle size={14} weight="bold" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="smart-import__numero-pedido">{numero}</span>
              {linha.status !== 'erro' && (
                <button
                  type="button"
                  className="smart-import__btn-icone"
                  onClick={() => { setNumeroTemp(numero); setEditandoNumero(true) }}
                  aria-label="Editar número do pedido"
                  title="Editar número do pedido"
                >
                  <PencilSimple size={13} weight="bold" />
                </button>
              )}
              {numeroEditado && (
                <span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>editado</span>
              )}
            </div>
          )}
        </div>

        <IconeStatus status={linha.status} />
        {exportador ? <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{String(exportador)}</span> : null}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>
          linha {linha.linha_arquivo}
        </span>
      </div>

      {temDuplicata && (
        <div className="smart-import__duplicata-aviso">
          <Warning size={13} weight="fill" style={{ color: '#f59e0b' }} aria-hidden />
          <span>Pedido já existe no sistema</span>
          <SelectGlobal
            buscavel={false}
            tamanho="compacto"
            opcoes={[
              { valor: 'sobrescrever', rotulo: 'Sobrescrever' },
              { valor: 'criar', rotulo: 'Criar novo' },
              { valor: 'pular', rotulo: 'Pular' },
            ]}
            valor={decisao ?? 'sobrescrever'}
            aoMudarValor={(v) => v != null && onDecisao(v as DecisaoDuplicataSimulador)}
          />
        </div>
      )}

      {camposVisiveis.length > 0 && (
        <div className="smart-import__campos-detectados">
          <button
            type="button"
            className="smart-import__expandir-campos"
            onClick={() => setExpandidoCampos((v) => !v)}
            aria-expanded={expandidoCampos}
          >
            {expandidoCampos ? <CaretDown size={11} aria-hidden /> : <CaretRight size={11} aria-hidden />}
            {expandidoCampos
              ? 'Ocultar campos'
              : `Ver ${camposVisiveis.length} campo(s) detectado(s)`}
          </button>
          {expandidoCampos && (
            <div className="smart-import__campos-grid">
              {camposVisiveis.map(([campo, valor]) => (
                <div key={campo} className="smart-import__campo-item">
                  <span className="smart-import__campo-label">{rotuloCampoSmartImportSimulador(campo)}</span>
                  <span className="smart-import__campo-valor">
                    {formatarValorPreviewSmartImportSimulador(campo, valor)}
                  </span>
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
            onClick={() => setExpandidoAlertas((v) => !v)}
            aria-expanded={expandidoAlertas}
            style={{ color: linha.status === 'erro' ? '#ef4444' : '#f59e0b' }}
          >
            {expandidoAlertas ? <CaretDown size={11} aria-hidden /> : <CaretRight size={11} aria-hidden />}
            {linha.alertas.length} alerta(s)
          </button>
          {expandidoAlertas && (
            <ul style={{ margin: '0.375rem 0 0 1rem', padding: 0, listStyle: 'none' }}>
              {linha.alertas.map((a, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    color: a.nivel === 'erro' ? '#ef4444' : '#f59e0b',
                    marginBottom: '0.25rem',
                  }}
                >
                  {a.nivel === 'erro'
                    ? <XCircle size={12} weight="fill" aria-hidden />
                    : <Warning size={12} weight="fill" aria-hidden />}
                  <strong>{rotuloCampoSmartImportSimulador(a.campo)}:</strong> {a.mensagem}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

type ConfirmacaoProps = {
  resultado: SmartImportResultadoSimulador
  onVerPedidos: () => void
  onFechar: () => void
}

export function EtapaConfirmacaoSmartImportSimulador({ resultado, onVerPedidos, onFechar }: ConfirmacaoProps) {
  const totalSucesso = resultado.criados + resultado.atualizados

  return (
    <div className="smart-import__resultado" role="status">
      {totalSucesso > 0 ? (
        <CheckCircle size={56} weight="duotone" className="smart-import__resultado-icone" aria-hidden />
      ) : (
        <XCircle size={56} weight="duotone" style={{ color: '#ef4444' }} aria-hidden />
      )}

      <h3 className="smart-import__resultado-titulo">
        {totalSucesso > 0
          ? `Importação concluída — ${totalSucesso} pedido(s) processado(s)`
          : 'Nenhum pedido foi importado'}
      </h3>

      <div className="smart-import__resultado-grid">
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#34d399' }}>{resultado.criados}</div>
          <div className="smart-import__resultado-label">Criados</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#60a5fa' }}>{resultado.atualizados}</div>
          <div className="smart-import__resultado-label">Atualizados</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: '#94a3b8' }}>{resultado.pulados}</div>
          <div className="smart-import__resultado-label">Pulados</div>
        </div>
        <div className="smart-import__resultado-card">
          <div className="smart-import__resultado-numero" style={{ color: resultado.erros.length > 0 ? '#ef4444' : '#94a3b8' }}>{resultado.erros.length}</div>
          <div className="smart-import__resultado-label">Erros</div>
        </div>
      </div>

      <div style={{ padding: '0.625rem 1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem', maxWidth: 520, width: '100%', textAlign: 'left' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
          <strong style={{ color: 'var(--accent, #6366f1)' }}>Importante:</strong> Pedidos criados com status <strong>Rascunho</strong>. Verifique os dados importados e altere o status para <strong>Aberto</strong> quando estiver pronto.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <BotaoGlobal variante="secundario" tamanho="medio" onClick={onFechar}>Fechar</BotaoGlobal>
        {resultado.ids_criados.length > 0 && (
          <BotaoGlobal variante="primario" tamanho="medio" onClick={onVerPedidos}>Ver Pedidos Importados</BotaoGlobal>
        )}
      </div>
    </div>
  )
}
