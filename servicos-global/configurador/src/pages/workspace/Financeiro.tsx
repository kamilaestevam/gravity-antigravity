import React from 'react'
import { Receipt, DownloadSimple, CalendarBlank } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/stat-card-global'

import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'

type FaturaStatus = 'Pago' | 'Pendente' | 'Atrasado'

type Fatura = {
  id: string
  num: string
  competencia: string
  descricao: string
  valor: string
  vencimento: string
  status: FaturaStatus
}

const faturas: Fatura[] = [
  { id: 'f1', num: '#0042', competencia: 'Mar/2025', descricao: 'Mensalidade Plano Enterprise + Produtos', valor: 'R$ 3.247,00', vencimento: '05/04/2025', status: 'Pendente' },
  { id: 'f2', num: '#0041', competencia: 'Fev/2025', descricao: 'Mensalidade Plano Enterprise',            valor: 'R$ 2.499,00', vencimento: '05/03/2025', status: 'Pago'    },
  { id: 'f3', num: '#0040', competencia: 'Jan/2025', descricao: 'Mensalidade Plano Enterprise',            valor: 'R$ 2.499,00', vencimento: '05/02/2025', status: 'Pago'    },
  { id: 'f4', num: '#0039', competencia: 'Dez/2024', descricao: 'Plano Enterprise + SimulaCusto Setup',    valor: 'R$ 2.748,00', vencimento: '05/01/2025', status: 'Pago'    },
  { id: 'f5', num: '#0035', competencia: 'Ago/2024', descricao: 'Mensalidade Plano Professional',         valor: 'R$ 999,00',   vencimento: '05/09/2024', status: 'Atrasado' },
]

const statusBadge: Record<FaturaStatus, string> = {
  Pago:     'ws-badge-success',
  Pendente: 'ws-badge-warning',
  Atrasado: 'ws-badge-danger',
}

export function Financeiro() {
  const vencimento = faturas.find(f => f.status === 'Pendente')
  const emAberto  = faturas.filter(f => f.status === 'Pendente' || f.status === 'Atrasado')
  const valorAberto = emAberto.reduce((acc, f) => {
    const n = parseFloat(f.valor.replace('R$ ', '').replace('.', '').replace(',', '.'))
    return acc + n
  }, 0)

  function handleDownload(tipo: string, num: string) {
    alert(`Download de ${tipo} ${num} — funcionalidade disponível quando o backend estiver conectado.`)
  }

  const COLUNAS: TabelaGlobalColuna<Fatura>[] = [
    {
      key: 'num', label: '#', tipo: 'texto', align: 'center',
      tooltipTitulo: 'Número da Fatura', tooltipDescricao: 'Identificador único.',
      render: (v) => <code style={{ fontSize: '0.8125rem', color: '#818cf8', background: 'rgba(129,140,248,0.08)', padding: '0.125rem 0.4rem', borderRadius: '4px' }}>{v}</code>
    },
    {
      key: 'competencia', label: 'Competência', tipo: 'texto',
      tooltipTitulo: 'Mês/Ano', tooltipDescricao: 'Período de faturamento da fatura.',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'descricao', label: 'Descrição', tipo: 'texto',
      tooltipTitulo: 'Serviços Cobrados', tooltipDescricao: 'Resumo dos produtos em uso.',
      render: (v) => <span style={{ color: 'var(--ws-muted)', maxWidth: '260px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span>
    },
    {
      key: 'valor', label: 'Valor', tipo: 'texto',
      tooltipTitulo: 'Valor a Pagar', tooltipDescricao: 'Soma dos itens, em Reais.',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{v}</span>
    },
    {
      key: 'vencimento', label: 'Vencimento', tipo: 'texto',
      tooltipTitulo: 'Dia do Vencimento', tooltipDescricao: 'Data limite para pagamento.',
      render: (v, item) => <span style={{ color: item.status === 'Atrasado' ? '#f87171' : 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Status da Fatura', tooltipDescricao: 'Qual a situação atual do boleto.',
      render: (v) => <span className={`ws-badge ${statusBadge[v as FaturaStatus]}`}>{v}</span>
    }
  ]

  const ACOES_EXPORT: TabelaExportAcao<Fatura>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, COLUNAS as any, { nomeArquivo: 'faturas', titulo: 'Histórico de Faturas' }) },
  ]

  return (
    <div className="ws-fade-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--ws-text)', marginBottom: '0.25rem' }}>
          Financeiro
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--ws-muted)' }}>
          Acompanhe faturas, boletos e notas fiscais da sua conta Gravity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="ws-stats ws-fade-up ws-fade-up-d1">
        <StatCardGlobal
          titulo="Próximo Vencimento"
          icone={<CalendarBlank weight="duotone" size={16} />}
          valor={vencimento?.vencimento ?? '—'}
          subtexto={vencimento?.competencia ?? 'Sem faturas abertas'}
        />
        <StatCardGlobal
          titulo="Valor a Pagar"
          valor={emAberto.length ? `R$ ${valorAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
          variante={emAberto.length ? 'aviso' : 'sucesso'}
        />
        <StatCardGlobal
          titulo="Faturas em Aberto"
          valor={emAberto.length}
          subtexto={emAberto.length === 0 ? 'Tudo em dia 🎉' : 'Requer atenção'}
          variante={emAberto.length > 0 ? 'perigo' : 'sucesso'}
        />
      </div>

      {/* Invoices table */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d2">
        <Receipt weight="duotone" size={14} color="#818cf8" />
        Histórico de Faturas
      </p>
      <div style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
        <TabelaGlobal<Fatura>
          dados={faturas}
          colunas={COLUNAS}
          acoes={[
            {
              id: 'boleto', icone: <DownloadSimple weight="bold" size={15} />, tooltip: 'Baixar Boleto', labelAcao: 'Boleto',
              onClick: (f) => handleDownload('Boleto', f.num),
            },
            {
              id: 'nfe', icone: <DownloadSimple weight="bold" size={15} />, tooltip: 'Baixar NF-e', labelAcao: 'NF-e',
              onClick: (f) => handleDownload('NF-e', f.num),
            }
          ]}
          mensagemVazio="Nenhuma fatura encontrada."
          mensagemSemFiltro="Sem faturas geradas."
        />
      </div>

      {/* Info card */}
      <div style={{
        background: 'rgba(129,140,248,0.06)',
        border: '1px solid rgba(129,140,248,0.15)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        fontSize: '0.8125rem',
        color: 'var(--ws-muted)',
        lineHeight: 1.6,
      }}>
        💡 <strong style={{ color: 'var(--ws-text)' }}>Segunda via</strong> — O download de boletos e NF-e fica disponível após conectar o backend de cobrança. Para dúvidas, contate <strong style={{ color: '#818cf8' }}>financeiro@gravity.com.br</strong>.
      </div>
    </div>
  )
}
