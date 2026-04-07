import React, { useState, useEffect, useCallback } from 'react'
import {
  CurrencyCircleDollar,
  ArrowsClockwise,
  Clock,
  ChartLine,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface TaxaItem {
  id: string
  moeda: string
  compra: number
  venda: number
  data_cotacao: string
  hora_cotacao: string | null
  fonte: string
  criado_em: string
}

interface TaxaAtual {
  moeda: string
  taxa: TaxaItem | null
}

interface HistoricoItem {
  id: string
  moeda: string
  compra: number
  venda: number
  data_cotacao: string
  hora_cotacao: string | null
  fonte: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOEDAS_INFO: Record<string, { simbolo: string; nome: string }> = {
  USD: { simbolo: 'US$', nome: 'Dólar Americano' },
  EUR: { simbolo: '€',   nome: 'Euro' },
  GBP: { simbolo: '£',   nome: 'Libra Esterlina' },
  CHF: { simbolo: 'CHF', nome: 'Franco Suíço' },
  CNY: { simbolo: '¥',   nome: 'Yuan Chinês' },
  JPY: { simbolo: '¥',   nome: 'Iene Japonês' },
}

function formatarTaxa(valor: number | undefined | null): string {
  if (valor == null) return '—'
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

function formatarData(iso: string | undefined | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

function formatarDataHora(iso: string | undefined | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function TaxaCambio() {
  const [taxasAtuais, setTaxasAtuais] = useState<TaxaAtual[]>([])
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [moedaHistorico, setMoedaHistorico] = useState<string>('USD')
  const [sincronizando, setSincronizando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [ultimaSync, setUltimaSync] = useState<string | null>(null)
  const [erroSync, setErroSync] = useState<string | null>(null)

  // ── Buscar taxas atuais ──────────────────────────────────────────────────

  const buscarTaxas = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/taxa-cambio')
      if (!res.ok) throw new Error('Falha ao buscar taxas')
      const json = await res.json()
      setTaxasAtuais(json.moedas ?? [])
    } catch {
      // silent — tabela mostra vazios
    } finally {
      setCarregando(false)
    }
  }, [])

  // ── Buscar histórico ─────────────────────────────────────────────────────

  const buscarHistorico = useCallback(async (moeda: string) => {
    try {
      const res = await fetch(`/api/v1/taxa-cambio/historico?moeda=${moeda}&dias=30`)
      if (!res.ok) throw new Error('Falha ao buscar histórico')
      const json = await res.json()
      setHistorico(json.historico ?? [])
    } catch {
      setHistorico([])
    }
  }, [])

  useEffect(() => {
    buscarTaxas()
  }, [buscarTaxas])

  useEffect(() => {
    buscarHistorico(moedaHistorico)
  }, [moedaHistorico, buscarHistorico])

  // ── Sincronizar ──────────────────────────────────────────────────────────

  const sincronizar = async () => {
    setSincronizando(true)
    setErroSync(null)
    try {
      const res = await fetch('/api/v1/taxa-cambio/sync', { method: 'POST' })
      const json = await res.json()
      if (json.total_erro > 0 && json.total_ok === 0) {
        setErroSync('Não foi possível sincronizar. O bid-câmbio pode estar offline.')
      } else {
        setUltimaSync(new Date().toLocaleString('pt-BR'))
        await buscarTaxas()
        await buscarHistorico(moedaHistorico)
      }
    } catch {
      setErroSync('Erro de comunicação com o servidor.')
    } finally {
      setSincronizando(false)
    }
  }

  // ── Colunas — tabela taxas atuais ────────────────────────────────────────

  const colunasTaxas: TabelaGlobalColuna<TaxaAtual>[] = [
    {
      key: 'moeda',
      label: 'Moeda',
      render: (_, row) => {
        const info = MOEDAS_INFO[row.moeda] ?? { simbolo: row.moeda, nome: row.moeda }
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.moeda}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {info.simbolo} · {info.nome}
            </span>
          </span>
        )
      },
    },
    {
      key: 'compra',
      label: 'Compra (R$)',
      render: (_, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatarTaxa(row.taxa?.compra)}
        </span>
      ),
    },
    {
      key: 'venda',
      label: 'Venda (R$)',
      render: (_, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatarTaxa(row.taxa?.venda)}
        </span>
      ),
    },
    {
      key: 'data_cotacao',
      label: 'Data Cotação',
      render: (_, row) => formatarData(row.taxa?.data_cotacao),
    },
    {
      key: 'hora_cotacao',
      label: 'Hora',
      render: (_, row) => row.taxa?.hora_cotacao ?? '—',
    },
    {
      key: 'fonte',
      label: 'Fonte',
      render: (_, row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          {row.taxa?.fonte ?? '—'}
        </span>
      ),
    },
    {
      key: 'atualizado_em',
      label: 'Armazenado em',
      render: (_, row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          {formatarDataHora(row.taxa?.criado_em)}
        </span>
      ),
    },
  ]

  // ── Colunas — histórico ──────────────────────────────────────────────────

  const colunasHistorico: TabelaGlobalColuna<HistoricoItem>[] = [
    {
      key: 'data_cotacao',
      label: 'Data',
      render: (_, row) => formatarData(row.data_cotacao),
    },
    {
      key: 'compra',
      label: 'Compra (R$)',
      render: (_, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatarTaxa(row.compra)}
        </span>
      ),
    },
    {
      key: 'venda',
      label: 'Venda (R$)',
      render: (_, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatarTaxa(row.venda)}
        </span>
      ),
    },
    {
      key: 'hora_cotacao',
      label: 'Hora',
      render: (_, row) => row.hora_cotacao ?? '—',
    },
    {
      key: 'fonte',
      label: 'Fonte',
      render: (_, row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{row.fonte}</span>
      ),
    },
  ]

  // ── Taxa de referência USD (para stat card) ──────────────────────────────

  const taxaUSD = taxasAtuais.find(t => t.moeda === 'USD')?.taxa
  const taxaEUR = taxasAtuais.find(t => t.moeda === 'EUR')?.taxa
  const taxasComDados = taxasAtuais.filter(t => t.taxa != null).length

  return (
    <PaginaGlobal>
      <CabecalhoGlobal
        titulo="Taxa de Câmbio"
        descricao="Cotações PTAX oficiais do Banco Central do Brasil"
        icone={<CurrencyCircleDollar weight="duotone" size={24} />}
        acoes={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {ultimaSync && (
              <TooltipGlobal conteudo={`Última sincronização: ${ultimaSync}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <Clock size={14} />
                  {ultimaSync}
                </span>
              </TooltipGlobal>
            )}
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<ArrowsClockwise size={16} weight={sincronizando ? 'regular' : 'duotone'} />}
              onClick={sincronizar}
              carregando={sincronizando}
            >
              Sincronizar PTAX
            </BotaoGlobal>
          </div>
        }
      />

      {erroSync && (
        <div style={{
          background: 'var(--color-danger-subtle)',
          border: '1px solid var(--color-danger)',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          color: 'var(--color-danger)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
        }}>
          {erroSync}
        </div>
      )}

      {/* Stat cards resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCardGlobal
          titulo="USD / BRL"
          valor={taxaUSD ? `R$ ${formatarTaxa(taxaUSD.venda)}` : '—'}
          descricao={taxaUSD ? `Compra: R$ ${formatarTaxa(taxaUSD.compra)}` : 'Sincronize para atualizar'}
          icone={<CurrencyCircleDollar weight="duotone" size={20} />}
        />
        <StatCardGlobal
          titulo="EUR / BRL"
          valor={taxaEUR ? `R$ ${formatarTaxa(taxaEUR.venda)}` : '—'}
          descricao={taxaEUR ? `Compra: R$ ${formatarTaxa(taxaEUR.compra)}` : 'Sincronize para atualizar'}
          icone={<CurrencyCircleDollar weight="duotone" size={20} />}
        />
        <StatCardGlobal
          titulo="Moedas ativas"
          valor={String(taxasComDados)}
          descricao="de 6 moedas com cotação"
          icone={<ChartLine weight="duotone" size={20} />}
        />
      </div>

      {/* Tabela taxas atuais */}
      <TabelaGlobal<TaxaAtual>
        dados={taxasAtuais}
        colunas={colunasTaxas}
        carregando={carregando}
        titulo="Cotações Atuais"
        mensagemVazia="Nenhuma cotação armazenada. Clique em Sincronizar PTAX para buscar."
      />

      {/* Histórico */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChartLine weight="duotone" size={18} />
            Histórico — últimos 30 dias
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMoedaHistorico(m)}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: moedaHistorico === m ? 'var(--accent)' : 'var(--border)',
                  background: moedaHistorico === m ? 'var(--accent)' : 'transparent',
                  color: moedaHistorico === m ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: moedaHistorico === m ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <TabelaGlobal<HistoricoItem>
          dados={historico}
          colunas={colunasHistorico}
          mensagemVazia={`Nenhum histórico de ${moedaHistorico} armazenado ainda.`}
        />
      </div>
    </PaginaGlobal>
  )
}
