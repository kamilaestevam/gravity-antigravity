/**
 * SimulaCusto — Página React
 * Usa TabelaGlobal do nucleo-global para exibir resultados da simulação.
 */

import React, { useState } from 'react'
import TabelaGlobal from '@nucleo/tabela-global'

interface BreakdownCategoria {
  categoria: string
  descricao: string
  subtotal: number
  percentualDoTotal: number
}

interface SimulacaoResult {
  tenantId: string
  nomeServico: string
  subtotalBruto: number
  descontoValor: number
  totalFinal: number
  breakdown: BreakdownCategoria[]
  alertas: string[]
  criadoEm: string
}

interface FormItem {
  categoria: string
  descricao: string
  quantidade: number
  precoUnitario: number
}

const CATEGORIAS = [
  'infraestrutura',
  'suporte',
  'licenca',
  'integracao',
  'customizacao',
] as const

const colunas = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'subtotal', label: 'Subtotal (R$)' },
  { key: 'percentualDoTotal', label: '% do Total' },
]

export default function SimulaCustoPage() {
  const [nomeServico, setNomeServico] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [desconto, setDesconto] = useState(0)
  const [itens, setItens] = useState<FormItem[]>([
    { categoria: 'infraestrutura', descricao: '', quantidade: 1, precoUnitario: 0 },
  ])
  const [resultado, setResultado] = useState<SimulacaoResult | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  function adicionarItem() {
    setItens([
      ...itens,
      { categoria: 'licenca', descricao: '', quantidade: 1, precoUnitario: 0 },
    ])
  }

  function removerItem(index: number) {
    setItens(itens.filter((_, i) => i !== index))
  }

  function atualizarItem(index: number, campo: keyof FormItem, valor: string | number) {
    const novos = [...itens]
    novos[index] = { ...novos[index], [campo]: valor }
    setItens(novos)
  }

  async function simular() {
    setErro(null)
    setCarregando(true)
    try {
      const response = await fetch('/api/v1/simula-custo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          nomeServico,
          itens,
          descontoPercentual: desconto,
        }),
      })
      const json = await response.json()
      if (!response.ok) {
        setErro(json.error ?? 'Erro ao simular')
      } else {
        setResultado(json.data)
      }
    } catch (e) {
      setErro('Falha na comunicação com o servidor')
    } finally {
      setCarregando(false)
    }
  }

  const dadosTabela = resultado?.breakdown.map((b) => ({
    ...b,
    subtotal: `R$ ${b.subtotal.toFixed(2)}`,
    percentualDoTotal: `${b.percentualDoTotal.toFixed(2)}%`,
  }))

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1>SimulaCusto</h1>
      <p style={{ color: '#666' }}>
        Simule o custo de um serviço antes de contratar.
      </p>

      <section style={{ marginBottom: '1.5rem' }}>
        <label>
          Tenant ID:{' '}
          <input
            id="tenantId"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="tenant-abc"
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </label>
        <br />
        <label>
          Nome do Serviço:{' '}
          <input
            id="nomeServico"
            value={nomeServico}
            onChange={(e) => setNomeServico(e.target.value)}
            placeholder="ERP Cloud"
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </label>
        <br />
        <label>
          Desconto (%):{' '}
          <input
            id="desconto"
            type="number"
            min={0}
            max={100}
            value={desconto}
            onChange={(e) => setDesconto(Number(e.target.value))}
            style={{ marginLeft: '0.5rem', padding: '0.25rem', width: '80px' }}
          />
        </label>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Itens</h2>
        {itens.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={item.categoria}
              onChange={(e) => atualizarItem(idx, 'categoria', e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="Descrição"
              value={item.descricao}
              onChange={(e) => atualizarItem(idx, 'descricao', e.target.value)}
              style={{ padding: '0.25rem' }}
            />
            <input
              type="number"
              min={1}
              value={item.quantidade}
              onChange={(e) => atualizarItem(idx, 'quantidade', Number(e.target.value))}
              style={{ width: '70px', padding: '0.25rem' }}
            />
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="Preço unit."
              value={item.precoUnitario}
              onChange={(e) => atualizarItem(idx, 'precoUnitario', Number(e.target.value))}
              style={{ width: '100px', padding: '0.25rem' }}
            />
            <button onClick={() => removerItem(idx)} disabled={itens.length === 1}>
              🗑
            </button>
          </div>
        ))}
        <button id="btn-adicionar-item" onClick={adicionarItem}>
          + Adicionar Item
        </button>
      </section>

      <button
        id="btn-simular"
        onClick={simular}
        disabled={carregando}
        style={{ padding: '0.5rem 1.5rem', fontWeight: 'bold' }}
      >
        {carregando ? 'Simulando...' : 'Simular Custo'}
      </button>

      {erro && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          ❌ {erro}
        </div>
      )}

      {resultado && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Relatório de Simulação — {resultado.nomeServico}</h2>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
            <div>
              <strong>Subtotal Bruto:</strong> R$ {resultado.subtotalBruto.toFixed(2)}
            </div>
            <div>
              <strong>Desconto:</strong> R$ {resultado.descontoValor.toFixed(2)}
            </div>
            <div style={{ fontSize: '1.2rem', color: '#1a7' }}>
              <strong>Total Final:</strong> R$ {resultado.totalFinal.toFixed(2)}
            </div>
          </div>

          {resultado.alertas.length > 0 && (
            <div style={{ backgroundColor: '#fff3cd', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <strong>⚠️ Alertas:</strong>
              <ul>
                {resultado.alertas.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          <h3>Breakdown por Categoria</h3>
          <TabelaGlobal
            colunas={colunas}
            dados={dadosTabela ?? []}
            paginacao={false}
          />

          <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '1rem' }}>
            Simulado em: {new Date(resultado.criadoEm).toLocaleString('pt-BR')}
          </p>
        </section>
      )}
    </div>
  )
}
