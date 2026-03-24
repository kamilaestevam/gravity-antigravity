import React from 'react'
import { Receipt, DownloadSimple, CalendarBlank } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/stat-card-global'

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
        <Receipt weight="duotone" size={14} color="#38bdf8" />
        Histórico de Faturas
      </p>
      <div className="ws-table-wrap ws-fade-up ws-fade-up-d2">
        <table className="ws-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Competência</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {faturas.map(f => (
              <tr key={f.id}>
                <td>
                  <code style={{ fontSize: '0.8125rem', color: '#38bdf8', background: 'rgba(56,189,248,0.08)', padding: '0.125rem 0.4rem', borderRadius: '4px' }}>
                    {f.num}
                  </code>
                </td>
                <td style={{ fontWeight: 600 }}>{f.competencia}</td>
                <td style={{ color: 'var(--ws-muted)', maxWidth: '260px' }}>{f.descricao}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{f.valor}</td>
                <td style={{ color: f.status === 'Atrasado' ? '#f87171' : 'var(--ws-muted)' }}>{f.vencimento}</td>
                <td><span className={`ws-badge ${statusBadge[f.status]}`}>{f.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <BotaoGlobal
                      variante="fantasma"
                      tamanho="pequeno"
                      icone={<DownloadSimple weight="bold" size={13} />}
                      onClick={() => handleDownload('Boleto', f.num)}
                      title="Download Boleto"
                    >
                      Boleto
                    </BotaoGlobal>
                    <BotaoGlobal
                      variante="fantasma"
                      tamanho="pequeno"
                      icone={<DownloadSimple weight="bold" size={13} />}
                      onClick={() => handleDownload('NF-e', f.num)}
                      title="Download NF-e"
                    >
                      NF-e
                    </BotaoGlobal>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info card */}
      <div style={{
        background: 'rgba(56,189,248,0.06)',
        border: '1px solid rgba(56,189,248,0.15)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        fontSize: '0.8125rem',
        color: 'var(--ws-muted)',
        lineHeight: 1.6,
      }}>
        💡 <strong style={{ color: 'var(--ws-text)' }}>Segunda via</strong> — O download de boletos e NF-e fica disponível após conectar o backend de cobrança. Para dúvidas, contate <strong style={{ color: '#38bdf8' }}>financeiro@gravity.com.br</strong>.
      </div>
    </div>
  )
}
