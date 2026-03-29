/**
 * Estimativas.tsx — Tela Principal do SimulaCusto
 * Skill: antigravity-simulacusto
 *
 * Formulário de entrada + resultado do cálculo fiscal (Landed Cost).
 * Usa PaginaGlobal + CabecalhoGlobal do nucleo-global.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { SeletorVisualizacao, type ViewMode } from '@nucleo/view-toggle-global'
import { postSimulacao } from '../../shared/api'
import type { SimulacaoInput, ResultadoFiscal } from '../../shared/types'
import { ModalSimulacao } from './ModalSimulacao'
import { Plus } from '@phosphor-icons/react'
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
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('lista')
  const [form, setForm] = useState<SimulacaoInput>(FORM_DEFAULTS)
  const [resultado, setResultado] = useState<ResultadoFiscal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  const handleSimular = async (dados: SimulacaoInput) => {
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const res = await postSimulacao(dados)
      setResultado(res)
      setModalAberto(false)
      setForm(dados) // Atualiza o form local com o que foi simulado
    } catch (err: any) {
      setError(err.message ?? 'Erro ao simular')
    } finally {
      setLoading(false)
    }
  }

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
          icone={<Calculator weight="duotone" size={22} color="#818cf8" />}
          viewToggle={
            <SeletorVisualizacao 
              view="lista" 
              onChange={(v: ViewMode) => {
                if (v === 'dashboard') navigate('/dashboard')
              }} 
            />
          }
        />
      }
    >
      <div className="sc-layout">
        {/* ─── Área de Lista/Ações ─────────────────────────── */}
        <div className="sc-list-area">
          <div className="sc-actions-bar">
            <button 
              className="sc-btn-nova"
              onClick={() => setModalAberto(true)}
            >
              <Plus weight="bold" />
              Nova Simulação
            </button>
          </div>

          <div className="sc-empty-state">
            <Calculator weight="duotone" size={48} />
            <h3>Nenhuma simulação recente</h3>
            <p>Clique no botão acima para iniciar um novo cálculo de Landed Cost.</p>
          </div>
        </div>

        {/* ─── Resultado ──────────────────────────────────── */}

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

      <ModalSimulacao
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoSimular={handleSimular}
        loading={loading}
        dadosIniciais={form}
      />

      <style>{`
        .sc-layout { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; padding: 1.5rem 0; }
        @media (max-width: 1024px) { .sc-layout { grid-template-columns: 1fr; } }
        
        .sc-list-area { display: flex; flex-direction: column; gap: 1.5rem; }
        .sc-actions-bar { display: flex; justify-content: flex-end; }
        .sc-btn-nova { display: flex; align-items: center; gap: 0.5rem; background: var(--ws-accent, #818cf8); color: #fff; border: none; border-radius: 8px; padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .sc-btn-nova:hover { opacity: 0.9; transform: translateY(-1px); }

        .sc-empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--ws-surface, #1e293b); border: 2px dashed var(--ws-accent-border, rgba(129,140,248,0.20)); border-radius: 12px; padding: 4rem 2rem; color: var(--ws-muted, #94a3b8); text-align: center; }
        .sc-empty-state svg { color: var(--ws-accent, #818cf8); opacity: 0.5; margin-bottom: 1.5rem; }
        .sc-empty-state h3 { font-size: 1.125rem; font-weight: 600; color: var(--ws-text, #f1f5f9); margin: 0 0 0.5rem 0; }
        .sc-empty-state p { font-size: 0.875rem; max-width: 300px; margin: 0; }

        .sc-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 0.75rem; font-size: 0.875rem; color: #f87171; margin-bottom: 1rem; }
        
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

