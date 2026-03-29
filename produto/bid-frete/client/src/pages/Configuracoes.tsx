/**
 * Configuracoes.tsx — Configurações do BID Frete (T10)
 * Sprint 3 — Geral + Conectores + Notificações
 *
 * Skill: antigravity-design-system, antigravity-componentes
 * Layout: 3 tabs (Geral, Conectores, Notificações) com toggles customizados
 */

import React, { useState, useCallback, useMemo } from 'react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  GearSix,
  Plugs,
  Bell,
  Faders,
  FloppyDisk,
  ArrowsClockwise,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ConfigGeral {
  respostaAutomatica: boolean
  prazoPadraoHoras: number
  canaisEmail: boolean
  canaisWhatsApp: boolean
}

interface Conector {
  id: string
  nome: string
  tipo: string
  ativo: boolean
  ultimoTeste: { sucesso: boolean; data: string } | null
}

interface NotificacaoRow {
  id: string
  label: string
  email: boolean
  whatsapp: boolean
}

type TabKey = 'geral' | 'conectores' | 'notificacoes'

// ─── Toggle Switch ──────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`bf-toggle ${checked ? 'bf-toggle--on' : ''} ${disabled ? 'bf-toggle--disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span className="bf-toggle-knob" />
    </button>
  )
}

// ─── Tab: Geral ─────────────────────────────────────────────────────────────

function TabGeral({ config, onChange }: {
  config: ConfigGeral
  onChange: (c: ConfigGeral) => void
}) {
  return (
    <div className="bf-cfg-section">
      <div className="bf-cfg-card">
        <div className="bf-cfg-row">
          <div className="bf-cfg-row-info">
            <span className="bf-cfg-row-label">Resposta automática</span>
            <span className="bf-cfg-row-desc">
              Envia confirmação de recebimento automaticamente aos fornecedores
            </span>
          </div>
          <Toggle
            checked={config.respostaAutomatica}
            onChange={(v) => onChange({ ...config, respostaAutomatica: v })}
          />
        </div>

        <div className="bf-cfg-divider" />

        <div className="bf-cfg-row">
          <div className="bf-cfg-row-info">
            <span className="bf-cfg-row-label">Prazo padrão de resposta</span>
            <span className="bf-cfg-row-desc">
              Tempo limite (em horas) para fornecedores responderem uma cotação
            </span>
          </div>
          <div className="bf-cfg-input-group">
            <input
              type="number"
              className="bf-cfg-input"
              value={config.prazoPadraoHoras}
              min={1}
              max={720}
              onChange={(e) => onChange({ ...config, prazoPadraoHoras: Number(e.target.value) || 0 })}
            />
            <span className="bf-cfg-input-suffix">horas</span>
          </div>
        </div>

        <div className="bf-cfg-divider" />

        <div className="bf-cfg-row">
          <div className="bf-cfg-row-info">
            <span className="bf-cfg-row-label">Canais padrão de disparo</span>
            <span className="bf-cfg-row-desc">
              Canais utilizados para enviar solicitações de cotação
            </span>
          </div>
          <div className="bf-cfg-checkboxes">
            <label className="bf-cfg-checkbox">
              <Toggle
                checked={config.canaisEmail}
                onChange={(v) => onChange({ ...config, canaisEmail: v })}
              />
              <span>Email</span>
            </label>
            <label className="bf-cfg-checkbox">
              <Toggle
                checked={config.canaisWhatsApp}
                onChange={(v) => onChange({ ...config, canaisWhatsApp: v })}
              />
              <span>WhatsApp</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Conectores ────────────────────────────────────────────────────────

function TabConectores({ conectores, onToggle, onTestar }: {
  conectores: Conector[]
  onToggle: (id: string, ativo: boolean) => void
  onTestar: (id: string) => void
}) {
  return (
    <div className="bf-cfg-section">
      <div className="bf-cfg-connectors">
        {conectores.map((c) => (
          <div key={c.id} className="bf-cfg-connector">
            <div className="bf-cfg-connector-header">
              <div className="bf-cfg-connector-icon">
                <Plugs weight="duotone" size={20} />
              </div>
              <div className="bf-cfg-connector-info">
                <span className="bf-cfg-connector-name">{c.nome}</span>
                <span className="bf-cfg-connector-tipo">{c.tipo}</span>
              </div>
              <Toggle
                checked={c.ativo}
                onChange={(v) => onToggle(c.id, v)}
              />
            </div>

            <div className="bf-cfg-connector-footer">
              <div className="bf-cfg-connector-status">
                {c.ultimoTeste ? (
                  <>
                    <span className={`bf-cfg-dot ${c.ultimoTeste.sucesso ? 'bf-cfg-dot--green' : 'bf-cfg-dot--red'}`} />
                    <span className="bf-cfg-connector-test-info">
                      {c.ultimoTeste.sucesso ? 'Conectado' : 'Falha'}
                      <span className="bf-cfg-connector-test-date"> — {c.ultimoTeste.data}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="bf-cfg-dot bf-cfg-dot--muted" />
                    <span className="bf-cfg-connector-test-info">Nunca testado</span>
                  </>
                )}
              </div>
              <button
                className="bf-cfg-btn-test"
                onClick={() => onTestar(c.id)}
              >
                <ArrowsClockwise weight="bold" size={14} />
                Testar Conexão
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Notificações ──────────────────────────────────────────────────────

function TabNotificacoes({ rows, onChange }: {
  rows: NotificacaoRow[]
  onChange: (rows: NotificacaoRow[]) => void
}) {
  const update = (id: string, field: 'email' | 'whatsapp', value: boolean) => {
    onChange(rows.map((r) => r.id === id ? { ...r, [field]: value } : r))
  }

  return (
    <div className="bf-cfg-section">
      <div className="bf-cfg-card">
        <div className="bf-cfg-notif-header">
          <span className="bf-cfg-notif-col" />
          <span className="bf-cfg-notif-col-label">Email</span>
          <span className="bf-cfg-notif-col-label">WhatsApp</span>
        </div>

        {rows.map((row, i) => (
          <React.Fragment key={row.id}>
            {i > 0 && <div className="bf-cfg-divider" />}
            <div className="bf-cfg-notif-row">
              <div className="bf-cfg-notif-label">
                <Bell weight="duotone" size={16} />
                <span>{row.label}</span>
              </div>
              <div className="bf-cfg-notif-toggle">
                <Toggle checked={row.email} onChange={(v) => update(row.id, 'email', v)} />
              </div>
              <div className="bf-cfg-notif-toggle">
                <Toggle checked={row.whatsapp} onChange={(v) => update(row.id, 'whatsapp', v)} />
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ─── Componente Principal ───────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'geral', label: 'Geral', icon: <Faders weight="duotone" size={16} /> },
  { key: 'conectores', label: 'Conectores', icon: <Plugs weight="duotone" size={16} /> },
  { key: 'notificacoes', label: 'Notificações', icon: <Bell weight="duotone" size={16} /> },
]

const CONECTORES_INICIAIS: Conector[] = [
  { id: 'sap', nome: 'SAP OData', tipo: 'ERP', ativo: true, ultimoTeste: { sucesso: true, data: '28/03/2026' } },
  { id: 'maersk', nome: 'Maersk Spot', tipo: 'Armador', ativo: true, ultimoTeste: { sucesso: true, data: '27/03/2026' } },
  { id: 'msc', nome: 'MSC API', tipo: 'Armador', ativo: false, ultimoTeste: { sucesso: false, data: '25/03/2026' } },
  { id: 'hapag', nome: 'Hapag-Lloyd', tipo: 'Armador', ativo: false, ultimoTeste: null },
]

const NOTIFICACOES_INICIAIS: NotificacaoRow[] = [
  { id: 'nova_resposta', label: 'Nova resposta recebida', email: true, whatsapp: false },
  { id: 'cotacao_expirada', label: 'Cotação expirada', email: true, whatsapp: true },
  { id: 'cotacao_aprovada', label: 'Cotação aprovada', email: true, whatsapp: false },
]

const CONFIG_INICIAL: ConfigGeral = {
  respostaAutomatica: true,
  prazoPadraoHoras: 72,
  canaisEmail: true,
  canaisWhatsApp: false,
}

export default function Configuracoes() {
  const [tab, setTab] = useState<TabKey>('geral')
  const [config, setConfig] = useState<ConfigGeral>(CONFIG_INICIAL)
  const [conectores, setConectores] = useState<Conector[]>(CONECTORES_INICIAIS)
  const [notificacoes, setNotificacoes] = useState<NotificacaoRow[]>(NOTIFICACOES_INICIAIS)
  const [salvando, setSalvando] = useState(false)
  const [salvoMsg, setSalvoMsg] = useState(false)

  // Dirty state detection
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(config) !== JSON.stringify(CONFIG_INICIAL) ||
      JSON.stringify(conectores) !== JSON.stringify(CONECTORES_INICIAIS) ||
      JSON.stringify(notificacoes) !== JSON.stringify(NOTIFICACOES_INICIAIS)
    )
  }, [config, conectores, notificacoes])

  const handleToggleConector = useCallback((id: string, ativo: boolean) => {
    setConectores((prev) => prev.map((c) => c.id === id ? { ...c, ativo } : c))
  }, [])

  const handleTestarConector = useCallback((id: string) => {
    const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    setConectores((prev) => prev.map((c) =>
      c.id === id ? { ...c, ultimoTeste: { sucesso: true, data: hoje } } : c
    ))
  }, [])

  const handleSalvar = useCallback(async () => {
    setSalvando(true)
    // Simula chamada API
    await new Promise((r) => setTimeout(r, 800))
    setSalvando(false)
    setSalvoMsg(true)
    setTimeout(() => setSalvoMsg(false), 2500)
  }, [])

  return (
    <PaginaGlobal
      className="bf-configuracoes"
      cabecalho={
        <CabecalhoGlobal
          icone={<GearSix weight="duotone" size={22} />}
          titulo="Configurações"
          subtitulo="Conectores, notificações e preferências"
        />
      }
    >
      {/* ── Tabs ── */}
      <div className="bf-cfg-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`bf-cfg-tab ${tab === t.key ? 'bf-cfg-tab--ativo' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {tab === 'geral' && (
        <TabGeral config={config} onChange={setConfig} />
      )}
      {tab === 'conectores' && (
        <TabConectores
          conectores={conectores}
          onToggle={handleToggleConector}
          onTestar={handleTestarConector}
        />
      )}
      {tab === 'notificacoes' && (
        <TabNotificacoes rows={notificacoes} onChange={setNotificacoes} />
      )}

      {/* ── Save Bar ── */}
      <div className={`bf-cfg-savebar ${isDirty ? 'bf-cfg-savebar--visible' : ''}`}>
        <div className="bf-cfg-savebar-inner">
          {salvoMsg ? (
            <span className="bf-cfg-saved-msg">
              <CheckCircle weight="fill" size={16} />
              Configurações salvas
            </span>
          ) : (
            <span className="bf-cfg-dirty-msg">Alterações não salvas</span>
          )}
          <button
            className="bf-cfg-btn-save"
            onClick={handleSalvar}
            disabled={salvando || !isDirty}
          >
            <FloppyDisk weight="bold" size={16} />
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════ */
        /* BID FRETE — Configurações Styles                      */
        /* Design System: Solid Slate (CSS Vars)                 */
        /* ═══════════════════════════════════════════════════════ */

        .bf-configuracoes { padding-bottom: 5rem; }

        /* ── Tabs ── */
        .bf-cfg-tabs {
          display: flex;
          gap: 0.25rem;
          border-bottom: 1px solid var(--bg-elevated, #475569);
          margin-bottom: 1.5rem;
        }

        .bf-cfg-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }
        .bf-cfg-tab:hover {
          color: var(--text-primary, #f1f5f9);
        }
        .bf-cfg-tab--ativo {
          color: var(--accent, #6366f1);
          border-bottom-color: var(--accent, #6366f1);
        }

        /* ── Section / Card ── */
        .bf-cfg-section {
          max-width: 720px;
        }

        .bf-cfg-card {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 0.25rem 0;
        }

        .bf-cfg-divider {
          height: 1px;
          background: var(--bg-elevated, #475569);
          margin: 0 1.25rem;
        }

        /* ── Row ── */
        .bf-cfg-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1rem 1.25rem;
        }

        .bf-cfg-row-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          flex: 1;
        }

        .bf-cfg-row-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
        }

        .bf-cfg-row-desc {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
        }

        /* ── Input ── */
        .bf-cfg-input-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bf-cfg-input {
          width: 80px;
          padding: 0.4rem 0.6rem;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--bg-elevated, #475569);
          background: var(--bg-base, #1e293b);
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
          font-size: 0.875rem;
          text-align: center;
          outline: none;
          transition: border-color 0.15s;
        }
        .bf-cfg-input:focus {
          border-color: var(--accent, #6366f1);
        }

        .bf-cfg-input-suffix {
          font-size: 0.8125rem;
          color: var(--text-muted, #64748b);
        }

        /* ── Checkboxes row ── */
        .bf-cfg-checkboxes {
          display: flex;
          gap: 1.25rem;
        }

        .bf-cfg-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
        }

        /* ── Toggle Switch ── */
        .bf-toggle {
          position: relative;
          width: 40px;
          height: 22px;
          border-radius: 9999px;
          border: none;
          background: var(--bg-elevated, #475569);
          cursor: pointer;
          padding: 0;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .bf-toggle--on {
          background: var(--accent, #6366f1);
        }
        .bf-toggle--disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bf-toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s;
          pointer-events: none;
        }
        .bf-toggle--on .bf-toggle-knob {
          transform: translateX(18px);
        }

        /* ── Conectores ── */
        .bf-cfg-connectors {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .bf-cfg-connector {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .bf-cfg-connector-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .bf-cfg-connector-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md, 8px);
          background: var(--bg-elevated, #475569);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent, #6366f1);
          flex-shrink: 0;
        }

        .bf-cfg-connector-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .bf-cfg-connector-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }

        .bf-cfg-connector-tipo {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--accent, #6366f1);
          background: rgba(99,102,241,0.15);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-pill, 9999px);
          width: fit-content;
        }

        .bf-cfg-connector-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.5rem;
          border-top: 1px solid var(--bg-elevated, #475569);
        }

        .bf-cfg-connector-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bf-cfg-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bf-cfg-dot--green  { background: var(--success, #22c55e); }
        .bf-cfg-dot--red    { background: var(--danger, #ef4444); }
        .bf-cfg-dot--muted  { background: var(--text-muted, #64748b); }

        .bf-cfg-connector-test-info {
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
        }

        .bf-cfg-connector-test-date {
          color: var(--text-muted, #64748b);
        }

        .bf-cfg-btn-test {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--bg-elevated, #475569);
          background: transparent;
          color: var(--text-secondary, #94a3b8);
          font-family: inherit;
          transition: all 0.15s;
        }
        .bf-cfg-btn-test:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }

        /* ── Notificações ── */
        .bf-cfg-notif-header {
          display: grid;
          grid-template-columns: 1fr 80px 80px;
          gap: 1rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }

        .bf-cfg-notif-col-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
          text-align: center;
        }

        .bf-cfg-notif-row {
          display: grid;
          grid-template-columns: 1fr 80px 80px;
          gap: 1rem;
          align-items: center;
          padding: 0.875rem 1.25rem;
        }

        .bf-cfg-notif-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary, #f1f5f9);
        }
        .bf-cfg-notif-label svg {
          color: var(--text-muted, #64748b);
        }

        .bf-cfg-notif-toggle {
          display: flex;
          justify-content: center;
        }

        /* ── Save Bar ── */
        .bf-cfg-savebar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          pointer-events: none;
        }
        .bf-cfg-savebar--visible {
          transform: translateY(0);
          pointer-events: auto;
        }

        .bf-cfg-savebar-inner {
          max-width: 720px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          border: 1px solid var(--bg-elevated, #475569);
          box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
        }

        .bf-cfg-dirty-msg {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--warning, #f59e0b);
        }

        .bf-cfg-saved-msg {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--success, #22c55e);
        }

        .bf-cfg-btn-save {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: var(--accent, #6366f1);
          color: #fff;
          font-family: inherit;
          transition: all 0.15s;
        }
        .bf-cfg-btn-save:hover {
          background: var(--accent-hover, #4f46e5);
        }
        .bf-cfg-btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </PaginaGlobal>
  )
}
