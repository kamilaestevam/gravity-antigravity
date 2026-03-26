import React, { useState, useEffect, useRef } from 'react'
import { 
  Receipt, Buildings, DownloadSimple, CalendarBlank, FileXls, ChartLineUp, 
  Plus, FilePdf, Paperclip, Trash
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormularioGlobal } from '@nucleo/modal-formulario-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { exportarExcel } from '../../services/exportService'

type FaturaStatus = 'Pago' | 'Pendente' | 'Atrasado'

type ComposicaoItem = {
  item: string
  valor: string
  tipo?: 'base' | 'adicional' | 'desconto'
}

type DocumentoFatura = {
  id: string
  nome: string
  tipo: 'Boleto' | 'Nota Fiscal' | 'Relatório' | 'Outros'
  status: 'Anexado' | 'Pendente'
}

type FaturaGlobal = {
  id: string
  num: string
  cliente: string
  produto: string
  competencia: string
  valor: string
  vencimento: string
  status: FaturaStatus
  composicao: ComposicaoItem[]
  documentos: DocumentoFatura[]
}

const faturasGlobais: FaturaGlobal[] = [
  {
    id: 'g1', num: '#0412', cliente: 'Importas SA', produto: 'Gravity Journey', competencia: 'Mar/2025', valor: 'R$ 3.247,00', vencimento: '05/04/2025', status: 'Pendente',
    documentos: [
      { id: 'd1', nome: 'Boleto_Importas_Mar25.pdf', tipo: 'Boleto', status: 'Anexado' },
      { id: 'd2', nome: 'Pendente', tipo: 'Nota Fiscal', status: 'Pendente' },
    ],
    composicao: [
      { item: 'Plano Enterprise', valor: 'R$ 2.499,00', tipo: 'base' },
      { item: 'Journey — 68 jornadas ativas', valor: 'R$ 637,32', tipo: 'adicional' },
      { item: 'Smart Read — 45 documentos', valor: 'R$ 269,55', tipo: 'adicional' },
      { item: 'Desconto Fidelidade 5%', valor: '- R$ 158,87', tipo: 'desconto' },
    ]
  },
  {
    id: 'g2', num: '#0411', cliente: 'TechCorp Brasil', produto: 'Gravity Flow', competencia: 'Mar/2025', valor: 'R$ 1.500,00', vencimento: '10/04/2025', status: 'Pendente',
    documentos: [],
    composicao: [
      { item: 'Plano Professional', valor: 'R$ 999,00', tipo: 'base' },
      { item: 'Flow — 12 automações', valor: 'R$ 501,00', tipo: 'adicional' },
    ]
  },
  {
    id: 'g3', num: '#0410', cliente: 'Mega Retail', produto: 'Gravity Sales', competencia: 'Fev/2025', valor: 'R$ 4.900,00', vencimento: '05/03/2025', status: 'Pago',
    documentos: [
      { id: 'd3', nome: 'Boleto_Mega_Fev.pdf', tipo: 'Boleto', status: 'Anexado' },
      { id: 'd4', nome: 'NFe_Mega_Fev.pdf', tipo: 'Nota Fiscal', status: 'Anexado' },
    ],
    composicao: [
      { item: 'Plano Enterprise', valor: 'R$ 2.499,00', tipo: 'base' },
      { item: 'Sales — 320 leads processados', valor: 'R$ 1.920,00', tipo: 'adicional' },
      { item: '15 usuários adicionais', valor: 'R$ 750,00', tipo: 'adicional' },
      { item: 'Desconto volume 5%', valor: '- R$ 269,00', tipo: 'desconto' },
    ]
  },
  {
    id: 'g4', num: '#0409', cliente: 'Importas SA', produto: 'Plano Enterprise', competencia: 'Fev/2025', valor: 'R$ 2.499,00', vencimento: '05/03/2025', status: 'Pago',
    documentos: [
      { id: 'd5', nome: 'Boleto_Importas_Fev.pdf', tipo: 'Boleto', status: 'Anexado' },
      { id: 'd6', nome: 'NFe_Importas_Fev.pdf', tipo: 'Nota Fiscal', status: 'Anexado' },
    ],
    composicao: [
      { item: 'Plano Enterprise', valor: 'R$ 2.499,00', tipo: 'base' },
    ]
  },
  {
    id: 'g5', num: '#0408', cliente: 'Logistics Pro', produto: 'Plano Starter', competencia: 'Jan/2025', valor: 'R$ 500,00', vencimento: '05/02/2025', status: 'Atrasado',
    documentos: [],
    composicao: [
      { item: 'Plano Starter', valor: 'R$ 500,00', tipo: 'base' },
    ]
  },
  {
    id: 'g6', num: '#0407', cliente: 'Alpha Solutions', produto: 'Gravity Analytics', competencia: 'Mar/2025', valor: 'R$ 1.200,00', vencimento: '15/04/2025', status: 'Pendente',
    documentos: [],
    composicao: [
      { item: 'Plano Professional', valor: 'R$ 999,00', tipo: 'base' },
      { item: 'Analytics — dashboards premium', valor: 'R$ 201,00', tipo: 'adicional' },
    ]
  },
]

const statusBadge: Record<FaturaStatus, string> = {
  Pago:     'ws-badge-success',
  Pendente: 'ws-badge-warning',
  Atrasado: 'ws-badge-danger',
}

export function AdminFinanceiro() {
  const [faturasLocal, setFaturasLocal] = useState<FaturaGlobal[]>(faturasGlobais)
  
  const faturasAbertas = faturasLocal.filter(f => f.status === 'Pendente' || f.status === 'Atrasado')
  const inadimplencias = faturasLocal.filter(f => f.status === 'Atrasado')

  const totalAberto = faturasAbertas.reduce((acc, f) => acc + parseFloat(f.valor.replace('R$ ', '').replace('.', '').replace(',', '.')), 0)
  const totalInadimplencia = inadimplencias.reduce((acc, f) => acc + parseFloat(f.valor.replace('R$ ', '').replace('.', '').replace(',', '.')), 0)

  function handleDownload(tipo: string, num: string) {
    alert(`Preparando download de ${tipo} da fatura ${num}.`)
  }

  // === Estado para Modal de Cadastro
  const [modalAberto, setModalAberto] = useState(false)
  const [faturaEditando, setFaturaEditando] = useState<FaturaGlobal | null>(null)
  const [formData, setFormData] = useState({
    cliente: '',
    produto: '',
    competencia: '',
    valor: '',
    vencimento: '',
    status: 'Pendente' as FaturaStatus
  })
  const [docsLocal, setDocsLocal] = useState<DocumentoFatura[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [docIdEmUpload, setDocIdEmUpload] = useState<string | null>(null)

  function abrirModalNovo() {
    setFaturaEditando(null)
    setFormData({ cliente: '', produto: '', competencia: '', valor: '', vencimento: '', status: 'Pendente' })
    setDocsLocal([])
    setModalAberto(true)
  }

  function abrirModalEditar(fatura: FaturaGlobal) {
    setFaturaEditando(fatura)
    setFormData({
      cliente: fatura.cliente,
      produto: fatura.produto,
      competencia: fatura.competencia,
      valor: fatura.valor,
      vencimento: fatura.vencimento,
      status: fatura.status
    })
    setDocsLocal(fatura.documentos || [])
    setModalAberto(true)
  }

  function handleSalvar() {
    if (faturaEditando) {
      setFaturasLocal(prev => prev.map(f => f.id === faturaEditando.id ? { 
        ...f, 
        ...formData, 
        documentos: docsLocal 
      } : f))
    } else {
      const nova: FaturaGlobal = {
        id: `g${Date.now()}`,
        num: `#${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        documentos: docsLocal,
        composicao: [{ item: 'Lançamento Manual', valor: formData.valor, tipo: 'base' }]
      }
      setFaturasLocal(prev => [nova, ...prev])
    }
    
    alert('Fatura salva com sucesso! (Simulação em State Local)')
    setModalAberto(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && docIdEmUpload) {
      setDocsLocal(prev => prev.map(d => d.id === docIdEmUpload ? { 
        ...d, 
        nome: file.name, 
        status: 'Anexado' as const 
      } : d))
      setDocIdEmUpload(null)
    }
    // Limpa o valor para permitir selecionar o mesmo arquivo novamente se necessário
    e.target.value = ''
  }

  function dispararUpload(id: string) {
    setDocIdEmUpload(id)
    fileInputRef.current?.click()
  }

  // === Tooltip de Valor (hover) ──────────────────────────────────────────────
  const [valorTooltipAberto, setValorTooltipAberto] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const mostrarTooltipValor = (faturaId: string, triggerEl: HTMLElement) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    const rect = triggerEl.getBoundingClientRect()
    setTooltipPos({
      top: rect.bottom + 8,
      left: Math.max(16, rect.right - 360),
    })
    setValorTooltipAberto(faturaId)
  }

  const esconderTooltipValor = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setValorTooltipAberto(null)
    }, 200)
  }

  const manterTooltipAberto = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }

  // Fecha tooltip ao scrollar
  useEffect(() => {
    if (!valorTooltipAberto) return
    const handler = () => setValorTooltipAberto(null)
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [valorTooltipAberto])

  const faturaTooltip = valorTooltipAberto ? faturasLocal.find(f => f.id === valorTooltipAberto) : null

  // === Colunas ───────────────────────────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<FaturaGlobal>[] = [
    {
      key: 'num', label: '#', tipo: 'texto', align: 'center',
      tooltipTitulo: 'Invoice ID / Reference', tooltipDescricao: 'Identificador único de transação gerado no Payment Gateway (ex: Iugu/Stripe).',
      render: (v) => <code style={{ fontSize: '0.8125rem', color: '#818cf8', background: 'rgba(129,140,248,0.08)', padding: '0.125rem 0.4rem', borderRadius: '4px' }}>{v}</code>
    },
    {
      key: 'cliente', label: 'Cliente', tipo: 'texto',
      tooltipTitulo: 'Tenant Object Reference', tooltipDescricao: 'Chave primária vinculada ao root da Organization no banco de dados isolado.',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'produto', label: 'Produto', tipo: 'texto',
      tooltipTitulo: 'SKU / Subscription Plan', tooltipDescricao: 'Identificador de serviço ativo associado à assinatura do tenant.',
      render: (v) => <span style={{ color: 'var(--ws-text)' }}>{v}</span>
    },
    {
      key: 'competencia', label: 'Competência', tipo: 'texto',
      tooltipTitulo: 'Billing Cycle', tooltipDescricao: 'Período computado pela engine de faturamento para cálculo de quota/excedente.',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'valor', label: 'Valor', tipo: 'texto',
      tooltipTitulo: 'Gross Amount', tooltipDescricao: 'Passe o mouse para ver a composição detalhada.',
      render: (v, item) => (
        <span
          className="valor-tooltip-trigger"
          onMouseEnter={(e) => mostrarTooltipValor(item.id, e.currentTarget)}
          onMouseLeave={() => esconderTooltipValor()}
          style={{
            fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem',
            background: valorTooltipAberto === item.id ? 'rgba(129,140,248,0.12)' : 'transparent',
            border: `1px solid ${valorTooltipAberto === item.id ? 'rgba(129,140,248,0.3)' : 'transparent'}`,
            borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'default',
            transition: 'all 0.15s', display: 'inline-block',
          }}
        >
          {v}
        </span>
      )
    },
    {
      key: 'vencimento', label: 'Data (Vencimento)', tipo: 'texto',
      tooltipTitulo: 'Due Date / Prazo Limite', tooltipDescricao: 'Timestamp configurado para trigger de suspensão em caso de inadimplência (cron job).',
      render: (v, item) => <span style={{ color: item.status === 'Atrasado' ? '#f87171' : 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Payment State', tooltipDescricao: 'Lifecycle event devolvido via webhook do gateway de pagamento.',
      render: (v) => <span className={`ws-badge ${statusBadge[v as FaturaStatus]}`}>{v}</span>
    },
    {
      key: 'id', label: 'Docs', tipo: 'texto', align: 'center',
      tooltipTitulo: 'Documentos Anexos', tooltipDescricao: 'Indica a quantidade e o status dos documentos carregados para acesso do cliente.',
      render: (_, item) => {
        const DocsIcon = ({ tipo, status }: { tipo: string, status: string }) => {
          const isOk = status === 'Anexado'
          if (tipo === 'Boleto') return <FilePdf size={14} weight="fill" style={{ color: isOk ? '#fbbf24' : 'rgba(255,255,255,0.05)' }} />
          if (tipo === 'Nota Fiscal') return <Receipt size={14} weight="fill" style={{ color: isOk ? '#34d399' : 'rgba(255,255,255,0.05)' }} />
          return <Paperclip size={14} weight="fill" style={{ color: isOk ? '#818cf8' : 'rgba(255,255,255,0.05)' }} />
        }

        return (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '80px' }}>
            {item.documentos.length > 0 ? (
              item.documentos.map(d => (
                <span key={d.id} title={`${d.tipo}: ${d.nome}`} style={{ display: 'flex' }}>
                   <DocsIcon tipo={d.tipo} status={d.status} />
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.05)', fontWeight: 700 }}>ZERO</span>
            )}
          </div>
        )
      }
    }
  ]

  const ACOES_EXPORT: TabelaExportAcao<FaturaGlobal>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, COLUNAS as any, { nomeArquivo: 'financeiro_global', titulo: 'Relatório Financeiro Global' }), tooltipDescricao: 'Gera planilha consolidada com todas as faturas e status' },
  ]

  return (
    <>
    <style>{`
      @keyframes fadeInScale {
        from { opacity: 0; transform: translateY(-4px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Financeiro Global"
          subtitulo="Relatório consolidado por cliente, produto e data com acompanhamento de inadimplências."
          icone={<Receipt weight="duotone" size={22} color="#818cf8" />}
          acoes={
            <BotaoGlobal 
              texto="Lançar Fatura" 
              icone={<Plus weight="bold" />} 
              variante="sucesso" 
              onClick={abrirModalNovo}
            />
          }
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="A Receber (Aberto)"
            icone={<ChartLineUp weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{faturasAbertas.length ? `R$ ${totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}</span>}
            subtexto={`${faturasAbertas.length} faturas pendentes`}
            variante="padrao"
            tooltip={
              <>
                <p className="cg-tooltip__title">PROJEÇÃO</p>
                <div className="cg-tooltip__row">
                  <span>Volume a receber</span>
                  <strong>{faturasAbertas.length} docs</strong>
                </div>
              </>
            }
          />
          <StatCardGlobal
            titulo="Risco Inadimplência"
            valor={<span style={{ fontSize: '1.5rem' }}>{inadimplencias.length ? `R$ ${totalInadimplencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}</span>}
            variante={inadimplencias.length ? 'perigo' : 'sucesso'}
            tooltip={
              <>
                <p className="cg-tooltip__title">ANÁLISE DE ATRASO</p>
                <div className="cg-tooltip__row">
                  <span>Clientes em atraso</span>
                  <strong>{new Set(inadimplencias.map(i => i.cliente)).size}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Faturas em atraso</span>
                  <strong>{inadimplencias.length}</strong>
                </div>
              </>
            }
          />
          <StatCardGlobal
            titulo="Performance"
            valor={<span style={{ fontSize: '1.75rem' }}>{((faturasLocal.filter(f => f.status === 'Pago').length / (faturasLocal.length || 1)) * 100).toFixed(0)}%</span>}
            subtexto="Taxa de recebimento"
            variante="sucesso"
            tooltip={
              <>
                <p className="cg-tooltip__title">EFICIÊNCIA</p>
                <div className="cg-tooltip__row">
                  <span>Recebidas</span>
                  <strong>{faturasLocal.filter(x => x.status === 'Pago').length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Total emitido</span>
                  <strong>{faturasLocal.length}</strong>
                </div>
              </>
            }
          />
        </>
      }
    >

      {/* Tabela de faturamento global */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d2">
        <Buildings weight="duotone" size={14} color="#818cf8" />
        Faturamento por Cliente e Base
      </p>
      <div style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
        <TabelaGlobal<FaturaGlobal>
          dados={faturasLocal}
          colunas={COLUNAS}
          acoesExportacao={ACOES_EXPORT}
          acoes={[
            {
              id: 'anexar', icone: <Paperclip weight="bold" size={15} />, tooltip: 'Anexar Boleto / NF-e',
              onClick: (f) => abrirModalEditar(f),
            },
            {
              id: 'nfe', icone: <DownloadSimple weight="bold" size={15} />, tooltip: 'Baixar Documentos',
              onClick: (f) => handleDownload('Pack PDF', f.num),
            }
          ]}
          mensagemVazio="Nenhuma fatura encontrada."
          mensagemSemFiltro="Sem faturas geradas no período."
        />
      </div>

      {/* Card Informativo API NF */}
      <div style={{
        background: 'rgba(129,140,248,0.06)',
        border: '1px solid rgba(129,140,248,0.15)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        fontSize: '0.8125rem',
        color: 'var(--ws-muted)',
        lineHeight: 1.6,
      }}>
        💡 <strong style={{ color: 'var(--ws-text)' }}>Gestão Manual</strong> — Utilize o botão "Lançar Fatura" para registrar cobranças manuais ou o ícone de clipe (<Paperclip size={12} />) para anexar boletos e notas fiscais em faturas existentes.
      </div>

      {/* Modal de Cadastro/Edição de Fatura */}
      <ModalFormularioAbasGlobal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={handleSalvar}
        titulo={faturaEditando ? `Editar Fatura ${faturaEditando.num}` : 'Lançar Nova Fatura'}
        subtitulo="Preencha os dados de faturamento e anexe os documentos necessários."
        icone={<Receipt weight="duotone" size={24} />}
        tamanho="lg"
        tipoAbas="pill"
        abas={[
          {
            id: 'dados',
            rotulo: 'Dados da Fatura',
            conteudo: (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <SecaoFormularioGlobal titulo="Identificação" icone={<Buildings size={16} />} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal label="Cliente / Organização">
                    <input type="text" className="ws-input" value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} placeholder="Ex: Importas SA" />
                  </GeralCampoGlobal>
                  <GeralCampoGlobal label="Produto">
                    <input type="text" className="ws-input" value={formData.produto} onChange={e => setFormData({...formData, produto: e.target.value})} placeholder="Ex: Gravity Journey" />
                  </GeralCampoGlobal>
                </div>
                
                <SecaoFormularioGlobal titulo="Valores e Prazos" icone={<CalendarBlank size={16} />} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal label="Competência">
                    <input type="text" className="ws-input" value={formData.competencia} onChange={e => setFormData({...formData, competencia: e.target.value})} placeholder="Ex: Abr/2025" />
                  </GeralCampoGlobal>
                  <GeralCampoGlobal label="Vencimento">
                    <input type="date" className="ws-input" value={formData.vencimento} onChange={e => setFormData({...formData, vencimento: e.target.value})} />
                  </GeralCampoGlobal>
                  <GeralCampoGlobal label="Valor Total">
                    <input type="text" className="ws-input" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} placeholder="R$ 0,00" />
                  </GeralCampoGlobal>
                </div>
              </div>
            )
          },
          {
            id: 'arquivos',
            rotulo: 'Documentos (PDF)',
            conteudo: (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SecaoFormularioGlobal titulo="Anexos da Fatura" icone={<Paperclip size={16} weight="duotone" />} marginBottom={0} />
                  <button 
                    type="button" 
                    onClick={() => setDocsLocal([...docsLocal, { id: `d${Date.now()}`, nome: 'Aguardando PDF...', tipo: 'Outros', status: 'Pendente' }])}
                    style={{ fontSize: '0.8125rem', fontWeight: 700, background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', padding: '0.375rem 0.875rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.08)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)' }}
                  >
                    <Plus size={14} weight="bold" /> Adicionar Documento
                  </button>
                </div>
                
                {docsLocal.length > 0 ? (
                  <div style={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                    <TabelaGlobal<DocumentoFatura>
                      dados={docsLocal}
                      idKey="id"
                      colunas={[
                        { 
                          key: 'tipo', label: 'Tipo de Documento', tipo: 'texto', largura: '200px',
                          render: (v, item) => (
                            <SelectGlobal
                              valor={v}
                              opcoes={[
                                { valor: 'Boleto', rotulo: 'Boleto Bancário' },
                                { valor: 'Nota Fiscal', rotulo: 'Nota Fiscal (NF-e)' },
                                { valor: 'Relatório', rotulo: 'Relatório de Uso' },
                                { valor: 'Outros', rotulo: 'Outro Documento' },
                              ]}
                              aoMudarValor={(newVal) => {
                                setDocsLocal(prev => prev.map(d => d.id === item.id ? { ...d, tipo: newVal as any } : d))
                              }}
                            />
                          )
                        },
                        {
                          key: 'nome', label: 'Arquivo / Link', tipo: 'texto',
                          render: (v, item) => (
                            <div style={{ 
                              display: 'flex', alignItems: 'center', gap: '8px', 
                              padding: '2px 8px', background: 'rgba(255,255,255,0.02)', 
                              borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)',
                              fontSize: '0.8125rem'
                            }}>
                              {item.tipo === 'Boleto' && <FilePdf size={16} weight="duotone" color="#fbbf24" />}
                              {item.tipo === 'Nota Fiscal' && <Receipt size={16} weight="duotone" color="#34d399" />}
                              {item.tipo !== 'Boleto' && item.tipo !== 'Nota Fiscal' && <Paperclip size={16} weight="duotone" color="#818cf8" />}
                              
                              <span style={{ flex: 1, color: item.status === 'Anexado' ? 'var(--ws-text)' : 'var(--ws-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {v}
                              </span>

                              <button 
                                type="button"
                                onClick={() => dispararUpload(item.id)}
                                style={{ 
                                  fontSize: '0.7rem', fontWeight: 700, background: item.status === 'Anexado' ? 'rgba(52,211,153,0.1)' : 'rgba(129,140,248,0.1)', 
                                  color: item.status === 'Anexado' ? '#34d399' : '#818cf8', border: 'none', 
                                  padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap'
                                }}
                              >
                                {item.status === 'Anexado' ? 'Trocar' : 'Anexar'}
                              </button>
                            </div>
                          )
                        },
                        {
                          key: 'status', label: 'Status', tipo: 'texto', align: 'center', largura: '100px',
                          render: (v) => (
                            <span style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '4px', 
                              fontSize: '0.6875rem', fontWeight: 700, 
                              color: v === 'Anexado' ? '#34d399' : '#fbbf24'
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: v === 'Anexado' ? '#34d399' : '#fbbf24' }} />
                              {v === 'Anexado' ? 'OK' : 'Pendente'}
                            </span>
                          )
                        }
                      ]}
                      acoes={[
                        {
                          id: 'remover',
                          icone: <Trash size={14} color="#ef4444" />,
                          tooltip: 'Excluir documento',
                          onClick: (item) => setDocsLocal(prev => prev.filter(d => d.id !== item.id))
                        }
                      ]}
                      mensagemVazio="Nenhum documento anexado."
                    />
                  </div>
                ) : (
                  <div style={{ padding: '2.5rem', border: '2px dashed rgba(255,255,255,0.04)', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ opacity: 0.4, marginBottom: '0.75rem' }}><Paperclip size={32} weight="duotone" /></div>
                    <p style={{ margin: 0, color: 'var(--ws-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>Nenhum documento anexado.</p>
                    <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>Utilize o botão acima para adicionar boletos, notas ou relatórios.</p>
                  </div>
                )}

                <div style={{ 
                  background: 'rgba(251,191,36,0.05)', 
                  border: '1px solid rgba(251,191,36,0.15)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#fbbf24'
                }}>
                  ⚠️ Os arquivos anexados ficarão disponíveis imediatamente para o cliente na área "Financeiro" do workspace dele.
                </div>

                {/* Input de arquivo oculto para funcionalidade real */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            )
          }
        ]}
      />
    </PaginaGlobal>

    {/* ═══════ POPOVER FIXO: COMPOSIÇÃO DA FATURA (hover, fora da tabela) ═══════ */}
    {faturaTooltip && (
      <div
        className="valor-tooltip-popover"
        onMouseEnter={manterTooltipAberto}
        onMouseLeave={esconderTooltipValor}
        style={{
          position: 'fixed',
          top: tooltipPos.top,
          left: tooltipPos.left,
          zIndex: 99999,
          width: '360px',
          background: 'var(--ws-surface, #1e293b)',
          border: '1px solid rgba(129,140,248,0.2)',
          borderRadius: '12px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(129,140,248,0.08)',
          padding: '1rem',
          animation: 'fadeInScale 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.625rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Receipt weight="duotone" size={16} color="#818cf8" />
          <div>
            <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#818cf8' }}>COMPOSIÇÃO DA FATURA {faturaTooltip.num}</p>
            <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--ws-muted)' }}>{faturaTooltip.cliente} · {faturaTooltip.competencia} · {faturaTooltip.produto}</p>
          </div>
        </div>

        {/* Itens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {faturaTooltip.composicao.map((comp, idx) => (
            <div key={idx} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '0.8125rem', padding: '0.375rem 0.5rem', borderRadius: '6px',
              background: comp.tipo === 'desconto' ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: comp.tipo === 'desconto' ? '#34d399' : 'var(--ws-muted)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: comp.tipo === 'base' ? '#818cf8' : comp.tipo === 'desconto' ? '#34d399' : '#fbbf24',
                }} />
                {comp.item}
              </span>
              <strong style={{
                fontFamily: 'monospace', fontSize: '0.8125rem',
                color: comp.tipo === 'desconto' ? '#34d399' : 'var(--ws-text)',
              }}>
                {comp.valor}
              </strong>
            </div>
          ))}
        </div>

        {/* Divider + Total */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.625rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ws-muted)' }}>Total da Fatura</span>
          <strong style={{ fontFamily: 'monospace', fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ws-text)' }}>{faturaTooltip.valor}</strong>
        </div>

        {/* Legenda */}
        <div style={{ marginTop: '0.625rem', display: 'flex', gap: '1rem', fontSize: '0.625rem', color: 'var(--ws-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8' }} /> Base</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} /> Adicional</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> Desconto</span>
        </div>
      </div>
    )}
    </>
  )
}
