import React from 'react'
import { Receipt, Buildings, DownloadSimple, CalendarBlank, FileXls, ChartLineUp } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/stat-card-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { exportarExcel } from '../../services/exportService'

type FaturaStatus = 'Pago' | 'Pendente' | 'Atrasado'

type FaturaGlobal = {
  id: string
  num: string
  cliente: string
  produto: string
  competencia: string
  valor: string
  vencimento: string
  status: FaturaStatus
}

const faturasGlobais: FaturaGlobal[] = [
  { id: 'g1', num: '#0412', cliente: 'Importas SA', produto: 'Gravity Journey', competencia: 'Mar/2025', valor: 'R$ 3.247,00', vencimento: '05/04/2025', status: 'Pendente' },
  { id: 'g2', num: '#0411', cliente: 'TechCorp Brasil', produto: 'Gravity Flow', competencia: 'Mar/2025', valor: 'R$ 1.500,00', vencimento: '10/04/2025', status: 'Pendente' },
  { id: 'g3', num: '#0410', cliente: 'Mega Retail', produto: 'Gravity Sales', competencia: 'Fev/2025', valor: 'R$ 4.900,00', vencimento: '05/03/2025', status: 'Pago' },
  { id: 'g4', num: '#0409', cliente: 'Importas SA', produto: 'Plano Enterprise', competencia: 'Fev/2025', valor: 'R$ 2.499,00', vencimento: '05/03/2025', status: 'Pago' },
  { id: 'g5', num: '#0408', cliente: 'Logistics Pro', produto: 'Plano Starter', competencia: 'Jan/2025', valor: 'R$ 500,00', vencimento: '05/02/2025', status: 'Atrasado' },
  { id: 'g6', num: '#0407', cliente: 'Alpha Solutions', produto: 'Gravity Analytics', competencia: 'Mar/2025', valor: 'R$ 1.200,00', vencimento: '15/04/2025', status: 'Pendente' },
]

const statusBadge: Record<FaturaStatus, string> = {
  Pago:     'ws-badge-success',
  Pendente: 'ws-badge-warning',
  Atrasado: 'ws-badge-danger',
}

export function AdminFinanceiro() {
  const faturasAbertas = faturasGlobais.filter(f => f.status === 'Pendente' || f.status === 'Atrasado')
  const inadimplencias = faturasGlobais.filter(f => f.status === 'Atrasado')

  const totalAberto = faturasAbertas.reduce((acc, f) => acc + parseFloat(f.valor.replace('R$ ', '').replace('.', '').replace(',', '.')), 0)
  const totalInadimplencia = inadimplencias.reduce((acc, f) => acc + parseFloat(f.valor.replace('R$ ', '').replace('.', '').replace(',', '.')), 0)

  function handleDownload(tipo: string, num: string) {
    alert(`Preparando emissão de ${tipo} ${num} — API de emissão em breve.`)
  }

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
      tooltipTitulo: 'Gross Amount (Moeda em Centavos)', tooltipDescricao: 'Valor serializado, geralmente armazenado em integer para evitar flutuação.',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{v}</span>
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
    }
  ]

  const ACOES_EXPORT: TabelaExportAcao<FaturaGlobal>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, COLUNAS as any, { nomeArquivo: 'financeiro_global', titulo: 'Relatório Financeiro Global' }) },
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Financeiro Global"
          subtitulo="Relatório consolidado por cliente, produto e data com acompanhamento de inadimplências."
          icone={<Receipt weight="duotone" size={22} color="#818cf8" />}
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
                <p className="scg-tooltip__title">PROJEÇÃO</p>
                <div className="scg-tooltip__row">
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
                <p className="scg-tooltip__title">ANÁLISE DE ATRASO</p>
                <div className="scg-tooltip__row">
                  <span>Clientes em atraso</span>
                  <strong>{new Set(inadimplencias.map(i => i.cliente)).size}</strong>
                </div>
                <div className="scg-tooltip__row">
                  <span>Faturas em atraso</span>
                  <strong>{inadimplencias.length}</strong>
                </div>
              </>
            }
          />
          <StatCardGlobal
            titulo="Performance"
            valor={<span style={{ fontSize: '1.75rem' }}>{((faturasGlobais.filter(f => f.status === 'Pago').length / (faturasGlobais.length || 1)) * 100).toFixed(0)}%</span>}
            subtexto="Taxa de recebimento"
            variante="sucesso"
            tooltip={
              <>
                <p className="scg-tooltip__title">EFICIÊNCIA</p>
                <div className="scg-tooltip__row">
                  <span>Recebidas</span>
                  <strong>{faturasGlobais.filter(x => x.status === 'Pago').length}</strong>
                </div>
                <div className="scg-tooltip__row">
                  <span>Total emitido</span>
                  <strong>{faturasGlobais.length}</strong>
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
          dados={faturasGlobais}
          colunas={COLUNAS}
          acoesExportacao={ACOES_EXPORT}
          acoes={[
            {
              id: 'nfe', icone: <DownloadSimple weight="bold" size={15} />, tooltip: 'Emitir NF-e (Em breve)',
              onClick: (f) => handleDownload('NF-e', f.num),
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
        💡 <strong style={{ color: 'var(--ws-text)' }}>Futura API</strong> — Em breve, a integração com a API permitirá a emissão automática de NF-e, envio de boletos direto para os clientes e automação do processo de cobrança.
      </div>
    </PaginaGlobal>
  )
}
