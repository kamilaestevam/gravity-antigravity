import React, { useState } from 'react'
import { Ruler, CurrencyDollar } from '@phosphor-icons/react'
import {
  ModalTabelaUnidades,
  InputUnidade,
} from '@nucleo/modal-tabela-unidades'
import {
  ModalTabelaMoeda,
  InputMoeda,
} from '@nucleo/modal-tabela-moeda'

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [tema, setTema] = useState<'dark' | 'light'>('dark')

  // modal-tabela-unidades state
  const [modalUnidadeAberto, setModalUnidadeAberto]   = useState(false)
  const [unidadeSelecionada, setUnidadeSelecionada]   = useState<string>('KG')
  const [quantidadeUom, setQuantidadeUom]             = useState<number>(0)

  // modal-tabela-moeda state
  const [modalMoedaAberto, setModalMoedaAberto]       = useState(false)
  const [moedaSelecionada, setMoedaSelecionada]       = useState<string>('USD')
  const [valorMoeda, setValorMoeda]                   = useState<number>(0)

  return (
    <div data-theme={tema}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="demo-header">
        <div>
          <h1>modal-tabela-unidades · modal-tabela-moeda</h1>
          <span>nucleo-global / Modais — componentes Siscomex/ISO 4217</span>
        </div>
        <button className="demo-theme-btn" onClick={() => setTema(t => t === 'dark' ? 'light' : 'dark')}>
          {tema === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <main className="demo-body">

        {/* ════ SEÇÃO 1 — modal-tabela-unidades ════════════════════════════ */}
        <div className="demo-section">
          <div className="demo-section-title">
            <Ruler size={12} weight="duotone" style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
            modal-tabela-unidades
            <span className="demo-section-badge">@nucleo/modal-tabela-unidades</span>
          </div>

          <div className="demo-card">

            {/* 1a. Abrir modal direto */}
            <div>
              <div className="demo-card-label" style={{ marginBottom: '0.75rem' }}>
                ModalTabelaUnidades — abre tabela Siscomex
              </div>
              <div className="demo-btn-row">
                <button className="demo-btn" onClick={() => setModalUnidadeAberto(true)}>
                  <Ruler size={14} weight="duotone" />
                  Selecionar Unidade
                </button>
              </div>
              {unidadeSelecionada && (
                <div className="demo-resultado" style={{ marginTop: '0.75rem' }}>
                  Selecionado: <strong>{unidadeSelecionada}</strong>
                </div>
              )}
            </div>

            <div className="demo-divider" />

            {/* 1b. InputUnidade */}
            <div>
              <div className="demo-card-label" style={{ marginBottom: '0.75rem' }}>
                InputUnidade — número + select de unidade (lado a lado)
              </div>
              <InputUnidade
                label="Quantidade"
                valor={quantidadeUom}
                unidade={unidadeSelecionada}
                onChange={(v, u) => { setQuantidadeUom(v); setUnidadeSelecionada(u) }}
                casasDecimais={3}
              />
            </div>

          </div>
        </div>

        {/* ════ SEÇÃO 2 — modal-tabela-moeda ═══════════════════════════════ */}
        <div className="demo-section">
          <div className="demo-section-title">
            <CurrencyDollar size={12} weight="duotone" style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
            modal-tabela-moeda
            <span className="demo-section-badge">@nucleo/modal-tabela-moeda</span>
          </div>

          <div className="demo-card">

            {/* 2a. Abrir modal direto */}
            <div>
              <div className="demo-card-label" style={{ marginBottom: '0.75rem' }}>
                ModalTabelaMoeda — abre tabela ISO 4217 / Siscomex
              </div>
              <div className="demo-btn-row">
                <button className="demo-btn" onClick={() => setModalMoedaAberto(true)}>
                  <CurrencyDollar size={14} weight="duotone" />
                  Selecionar Moeda
                </button>
              </div>
              {moedaSelecionada && (
                <div className="demo-resultado" style={{ marginTop: '0.75rem' }}>
                  Selecionado: <strong>{moedaSelecionada}</strong>
                </div>
              )}
            </div>

            <div className="demo-divider" />

            {/* 2b. InputMoeda */}
            <div>
              <div className="demo-card-label" style={{ marginBottom: '0.75rem' }}>
                InputMoeda — select de moeda + número (lado a lado)
              </div>
              <InputMoeda
                label="Valor"
                valor={valorMoeda}
                moeda={moedaSelecionada}
                onChange={(v, m) => { setValorMoeda(v); setMoedaSelecionada(m) }}
                casasDecimais={2}
              />
            </div>

          </div>
        </div>

      </main>

      {/* ── Modais ────────────────────────────────────────────────────────────── */}
      <ModalTabelaUnidades
        aberto={modalUnidadeAberto}
        aoFechar={() => setModalUnidadeAberto(false)}
        aoSelecionar={(u) => { setUnidadeSelecionada(u.sigla); setModalUnidadeAberto(false) }}
        unidadeSelecionada={unidadeSelecionada}
      />

      <ModalTabelaMoeda
        aberto={modalMoedaAberto}
        aoFechar={() => setModalMoedaAberto(false)}
        aoSelecionar={(m) => { setMoedaSelecionada(m.sigla); setModalMoedaAberto(false) }}
        moedaSelecionada={moedaSelecionada}
      />
    </div>
  )
}
