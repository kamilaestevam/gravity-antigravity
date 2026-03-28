/**
 * Estimativas.tsx — Tela Principal do SimulaCusto
 * Skill: antigravity-simulacusto
 *
 * Formulário de entrada + resultado do cálculo fiscal (Landed Cost).
 * Usa PaginaGlobal + CabecalhoGlobal do nucleo-global.
 */

import React, { useState } from 'react'
import { Calculator } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { postSimulacao } from '../../shared/api'
import type { SimulacaoInput, ResultadoFiscal } from '../../shared/types'

// ─── Formatação ──────────────────────────────────────────────────────────────

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const pct = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(val)

// ─── Valores Padrão do Formulário ────────────────────────────────────────────

const FORM_DEFAULTS: SimulacaoInput = {
  ncm: '',
  paisOrigem: 'US',
  dataFatoGerador: new Date().toISOString().split('T')[0],
  valorProduto: 0,
  moedaProduto: 'USD',
  freteInter: 0,
  moedaFrete: 'USD',
  seguroInter: 0,
  moedaSeguro: 'USD',
  taxasOrigem: [],
  taxasDestino: [],
  ufDesembaraco: 'SP',
  aliquotaII: 0.16,
  aliquotaIPI: 0,
  aliquotaPIS: 0.021,
  aliquotaCOFINS: 0.0965,
  aliquotaICMS: 0.18,
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function Estimativas() {
  const [form, setForm] = useState<SimulacaoInput>(FORM_DEFAULTS)
  const [resultado, setResultado] = useState<ResultadoFiscal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof SimulacaoInput, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const res = await postSimulacao(form)
      setResultado(res)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao simular')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Simulador de Custo"
          subtitulo="Calcule o Landed Cost completo antes de fechar o negócio"
          icone={<Calculator weight="duotone" size={22} />}
        />
      }
    >
      <div className="sc-layout">
        {/* ─── Formulário ─────────────────────────────────── */}
        <form className="sc-form" onSubmit={handleSubmit}>
          <div className="sc-section-title">Produto &amp; Operação</div>

          <div className="sc-row">
            <div className="sc-field">
              <label>NCM (8 dígitos)</label>
              <input
                type="text"
                maxLength={8}
                placeholder="84713019"
                value={form.ncm}
                onChange={e => update('ncm', e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="sc-field">
              <label>País de Origem (ISO)</label>
              <input
                type="text"
                maxLength={2}
                placeholder="US"
                value={form.paisOrigem}
                onChange={e => update('paisOrigem', e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="sc-field">
              <label>UF de Desembaraço</label>
              <input
                type="text"
                maxLength={2}
                placeholder="SP"
                value={form.ufDesembaraco}
                onChange={e => update('ufDesembaraco', e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <div className="sc-row">
            <div className="sc-field">
              <label>Valor do Produto</label>
              <div className="sc-input-group">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="5925.00"
                  value={form.valorProduto || ''}
                  onChange={e => update('valorProduto', parseFloat(e.target.value) || 0)}
                  required
                />
                <select value={form.moedaProduto} onChange={e => update('moedaProduto', e.target.value)}>
                  <option>USD</option><option>EUR</option><option>GBP</option><option>CNY</option><option>BRL</option>
                </select>
              </div>
            </div>
            <div className="sc-field">
              <label>Frete Internacional</label>
              <div className="sc-input-group">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.freteInter || ''}
                  onChange={e => update('freteInter', parseFloat(e.target.value) || 0)}
                />
                <select value={form.moedaFrete} onChange={e => update('moedaFrete', e.target.value)}>
                  <option>USD</option><option>EUR</option><option>BRL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sc-section-title">Alíquotas</div>

          <div className="sc-row sc-row--4">
            <div className="sc-field">
              <label>II (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="16.00"
                value={(form.aliquotaII * 100) || ''}
                onChange={e => update('aliquotaII', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>IPI (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="0.00"
                value={(form.aliquotaIPI * 100) || ''}
                onChange={e => update('aliquotaIPI', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>PIS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="2.10"
                value={(form.aliquotaPIS * 100) || ''}
                onChange={e => update('aliquotaPIS', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>COFINS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="9.65"
                value={(form.aliquotaCOFINS * 100) || ''}
                onChange={e => update('aliquotaCOFINS', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
          </div>

          <div className="sc-row sc-row--2">
            <div className="sc-field">
              <label>ICMS (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="18.00"
                value={(form.aliquotaICMS * 100) || ''}
                onChange={e => update('aliquotaICMS', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
            <div className="sc-field">
              <label>Redução II — Acordos (%)</label>
              <input type="number" min={0} max={100} step="0.01" placeholder="0.00"
                value={((form.reducaoII ?? 0) * 100) || ''}
                onChange={e => update('reducaoII', (parseFloat(e.target.value) || 0) / 100)} />
            </div>
          </div>

          {error && <div className="sc-error">{error}</div>}

          <button type="submit" className="sc-btn-simular" disabled={loading}>
            {loading ? 'Calculando…' : '▶ Simular Custo'}
          </button>
        </form>

        {/* ─── Resultado ──────────────────────────────────── */}
        {resultado && (
          <div className="sc-result">
            <div className="sc-result-header">
              <span className="sc-result-badge">
                {resultado.source === 'siscomex' ? 'Portal Único' : 'Gravity Cloud Engine'}
              </span>
              <span className="sc-ptax">PTAX: R$ {resultado.ptaxUtilizada?.toFixed(4)}</span>
            </div>

            <div className="sc-landed-cost">
              <span className="sc-lc-label">Landed Cost Total</span>
              <span className="sc-lc-value">{brl(resultado.landedCostBRL)}</span>
            </div>

            <div className="sc-breakdown">
              <div className="sc-bk-row">
                <span>Valor Aduaneiro (VA)</span>
                <span>{brl(resultado.vAduaneiroBRL)}</span>
              </div>
              <div className="sc-bk-sep" />
              {Object.entries(resultado.tributos).map(([key, t]: [string, any]) => (
                <div key={key} className="sc-bk-row sc-bk-row--tributo">
                  <span>{key.toUpperCase()} <em>{pct(t.aliquota)}</em></span>
                  <span>{brl(t.valor)}</span>
                </div>
              ))}
              <div className="sc-bk-sep" />
              <div className="sc-bk-row sc-bk-row--total">
                <span>Total de Tributos</span>
                <span>{brl(resultado.totalTributos)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .sc-layout { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; padding: 1.5rem 0; }
        @media (max-width: 1024px) { .sc-layout { grid-template-columns: 1fr; } }
        .sc-form { background: var(--ws-surface, #1e293b); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.20)); }
        .sc-section-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ws-muted, #94a3b8); margin: 1.25rem 0 0.75rem; }
        .sc-section-title:first-child { margin-top: 0; }
        .sc-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; }
        .sc-row--4 { grid-template-columns: repeat(4, 1fr); }
        .sc-row--2 { grid-template-columns: repeat(2, 1fr); }
        .sc-field label { display: block; font-size: 0.75rem; font-weight: 500; color: var(--ws-muted, #94a3b8); margin-bottom: 0.4rem; }
        .sc-field input, .sc-field select { width: 100%; background: var(--ws-bg-body, #0f172a); border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.20)); border-radius: 8px; padding: 0.6rem 0.75rem; color: var(--ws-text, #f1f5f9); font-size: 0.875rem; font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.15s; }
        .sc-field input:focus, .sc-field select:focus { border-color: var(--ws-accent, #818cf8); box-shadow: 0 0 0 2px rgba(129,140,248,0.15); }
        .sc-input-group { display: flex; gap: 0.5rem; }
        .sc-input-group input { flex: 1; }
        .sc-input-group select { width: 80px; flex-shrink: 0; }
        .sc-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 0.75rem; font-size: 0.875rem; color: #f87171; margin-top: 1rem; }
        .sc-btn-simular { width: 100%; margin-top: 1.5rem; padding: 0.875rem; background: var(--ws-accent, #818cf8); color: #fff; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
        .sc-btn-simular:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .sc-btn-simular:disabled { opacity: 0.5; cursor: not-allowed; }
        .sc-result { background: var(--ws-surface, #1e293b); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.20)); height: fit-content; }
        .sc-result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .sc-result-badge { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; background: rgba(129,140,248,0.15); color: var(--ws-accent, #818cf8); padding: 0.25rem 0.6rem; border-radius: 999px; border: 1px solid rgba(129,140,248,0.3); }
        .sc-ptax { font-size: 0.75rem; color: var(--ws-muted, #94a3b8); }
        .sc-landed-cost { text-align: center; padding: 1.25rem 0; border-bottom: 1px solid var(--ws-accent-border, rgba(129,140,248,0.20)); margin-bottom: 1.25rem; }
        .sc-lc-label { display: block; font-size: 0.75rem; font-weight: 500; color: var(--ws-muted, #94a3b8); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.5rem; }
        .sc-lc-value { font-size: 2rem; font-weight: 800; color: #10b981; }
        .sc-breakdown { display: flex; flex-direction: column; gap: 0.5rem; }
        .sc-bk-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--ws-text, #f1f5f9); }
        .sc-bk-row--tributo { color: var(--ws-muted, #94a3b8); }
        .sc-bk-row--tributo em { font-style: normal; font-size: 0.75rem; color: var(--ws-muted, #64748b); margin-left: 0.25rem; }
        .sc-bk-row--total { font-weight: 700; color: var(--ws-text, #f1f5f9); }
        .sc-bk-sep { height: 1px; background: var(--ws-accent-border, rgba(129,140,248,0.20)); margin: 0.5rem 0; }
      `}</style>
    </PaginaGlobal>
  )
}
