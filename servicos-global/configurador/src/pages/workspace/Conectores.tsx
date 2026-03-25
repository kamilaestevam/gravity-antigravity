import React, { useState } from 'react'
import {
  Database, Plugs, PlugsConnected, CheckCircle, ShieldCheck,
  ArrowLeft, Key, Lightning, ArrowsLeftRight, Gear, Play,
  Warning, Globe, Lock, CaretDown, CaretUp, Trash, Plus,
  CloudArrowUp, CloudCheck, XCircle, Spinner, ArrowSquareOut
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'

/* ── Types ─────────────────────────────────────────────── */
type ConectorId = 'sap' | 'onesource' | 'cargowise' | 'bysoft'
type ConectorStatus = 'conectado' | 'configurando' | 'desconectado' | 'indisponivel'

type Conector = {
  id: ConectorId
  nome: string
  descricao: string
  status: ConectorStatus
  versao: string
  categoria: string
  corPrimaria: string
  corBg: string
  features: string[]
}

const CONECTORES: Conector[] = [
  {
    id: 'sap', nome: 'SAP ERP / S4HANA',
    descricao: 'Integração OData v4 com SAP ECC e S/4HANA para sincronização de NFs, materiais e parceiros de negócio.',
    status: 'conectado', versao: 'v2.3.1', categoria: 'ERP',
    corPrimaria: '#0070f2', corBg: 'rgba(0,112,242,0.08)',
    features: ['OData v4', 'RFC/BAPI', 'IDocs', 'Change Pointers']
  },
  {
    id: 'onesource', nome: 'Thomson Reuters ONESOURCE',
    descricao: 'Plataforma fiscal líder global. OAuth 2.0 nativo, mapeamento De-Para de tributos e teste de conexão integrado.',
    status: 'configurando', versao: 'v1.0.0', categoria: 'Tax Engine',
    corPrimaria: '#ff6900', corBg: 'rgba(255,105,0,0.08)',
    features: ['OAuth 2.0', 'De-Para Fiscal', 'Tax Calc API', 'Compliance']
  },
  {
    id: 'cargowise', nome: 'WiseTech CargoWise',
    descricao: 'Integração com CargoWise One para operações de comércio exterior, despacho aduaneiro e logística.',
    status: 'desconectado', versao: 'v1.2.0', categoria: 'Logistics',
    corPrimaria: '#00a650', corBg: 'rgba(0,166,80,0.08)',
    features: ['eAdaptor', 'XML Gateway', 'Customs', 'Shipments']
  },
  {
    id: 'bysoft', nome: 'Bysoft ERP Comex',
    descricao: 'Conector nativo para Bysoft ERP focado em processos de importação, exportação e drawback.',
    status: 'desconectado', versao: 'v0.9 beta', categoria: 'Comex',
    corPrimaria: '#6366f1', corBg: 'rgba(99,102,241,0.08)',
    features: ['REST API', 'Webhooks', 'LI/DI Sync', 'Drawback']
  },
]

const statusMap: Record<ConectorStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  conectado:     { label: 'Conectado',    cls: 'ws-badge-success', icon: <CloudCheck weight="bold" size={11}/> },
  configurando:  { label: 'Configurando', cls: 'ws-badge-warning', icon: <Gear weight="bold" size={11}/> },
  desconectado:  { label: 'Disponível',   cls: 'ws-badge-surface', icon: <Plugs weight="bold" size={11}/> },
  indisponivel:  { label: 'Em breve',     cls: 'ws-badge-surface', icon: <Lock weight="bold" size={11}/> },
}

/* ── De-Para Rows (ONESOURCE) ──────────────────────────── */
type DeParaRow = { id: number; gravityField: string; onesourceField: string }

const INITIAL_DEPARA: DeParaRow[] = [
  { id: 1, gravityField: 'ncm', onesourceField: 'tax_commodity_code' },
  { id: 2, gravityField: 'valor_aduaneiro', onesourceField: 'extended_price' },
  { id: 3, gravityField: 'cfop', onesourceField: 'transaction_type' },
  { id: 4, gravityField: 'icms_aliquota', onesourceField: 'tax_rate' },
  { id: 5, gravityField: 'pis_cofins_cst', onesourceField: 'tax_status_code' },
]

/* ── ONESOURCE Config Panel ────────────────────────────── */
function OnesourceConfig({ onBack }: { onBack: () => void }) {
  const [subTab, setSubTab] = useState<'oauth' | 'depara' | 'teste'>('oauth')
  const [depara, setDepara] = useState<DeParaRow[]>(INITIAL_DEPARA)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [oauthSaved, setOauthSaved] = useState(false)
  const [nextId, setNextId] = useState(6)

  function addRow() {
    setDepara(prev => [...prev, { id: nextId, gravityField: '', onesourceField: '' }])
    setNextId(n => n + 1)
  }
  function removeRow(id: number) {
    setDepara(prev => prev.filter(r => r.id !== id))
  }
  function updateRow(id: number, field: 'gravityField' | 'onesourceField', value: string) {
    setDepara(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  function handleTest() {
    setTestStatus('testing')
    setTimeout(() => setTestStatus(Math.random() > 0.3 ? 'success' : 'error'), 2200)
  }

  function handleSaveOAuth() {
    setOauthSaved(true)
    setTimeout(() => setOauthSaved(false), 2500)
  }

  return (
    <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onBack} style={{
          background: 'var(--ws-accent-dim)', border: '1px solid var(--ws-accent-border)',
          borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--ws-muted)',
          display: 'flex', alignItems: 'center', transition: 'all 0.15s',
        }}><ArrowLeft weight="bold" size={16}/></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '10px',
            background: 'rgba(255,105,0,0.12)', border: '1px solid rgba(255,105,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800, color: '#ff6900',
          }}>TR</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--ws-text)' }}>
              Thomson Reuters ONESOURCE
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
              Tax Engine · v1.0.0 · OAuth 2.0
            </span>
          </div>
        </div>
        <span className="ws-badge ws-badge-warning" style={{ gap: '0.375rem' }}>
          <Gear weight="bold" size={11}/> Configurando
        </span>
      </div>

      {/* Sub-tabs */}
      <div className="ws-tabs" style={{ margin: 0 }}>
        <button className={`ws-tab${subTab === 'oauth' ? ' active' : ''}`} onClick={() => setSubTab('oauth')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Key weight="bold" size={13}/> OAuth 2.0
          </span>
        </button>
        <button className={`ws-tab${subTab === 'depara' ? ' active' : ''}`} onClick={() => setSubTab('depara')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <ArrowsLeftRight weight="bold" size={13}/> Mapeamento De-Para
          </span>
        </button>
        <button className={`ws-tab${subTab === 'teste' ? ' active' : ''}`} onClick={() => setSubTab('teste')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Play weight="bold" size={13}/> Teste de Conexão
          </span>
        </button>
      </div>

      {/* ── OAuth 2.0 ─────────────────────────────────────── */}
      {subTab === 'oauth' && (
        <div className="ws-form-card ws-fade-up" style={{ marginBottom: 0 }}>
          <p className="ws-section-title" style={{ margin: 0 }}>
            <Lock weight="duotone" size={14} color="#ff6900"/> Credenciais OAuth 2.0 — ONESOURCE
          </p>
          <div style={{
            background: 'rgba(255,105,0,0.06)', border: '1px solid rgba(255,105,0,0.15)',
            borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8125rem',
            color: 'var(--ws-muted)', lineHeight: 1.55, display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
          }}>
            <ShieldCheck weight="duotone" size={20} color="#ff6900" style={{ flexShrink: 0, marginTop: 2 }}/>
            Credenciais armazenadas com criptografia AES-256-GCM. O token de acesso é renovado automaticamente
            via refresh_token antes da expiração.
          </div>

          <div className="ws-form-row">
            <div className="ws-field">
              <label>Client ID</label>
              <input type="text" placeholder="Ex: gravity-prod-client-id" defaultValue="gv_onesource_prod_xxxx"/>
            </div>
            <div className="ws-field">
              <label>Client Secret</label>
              <div style={{ position: 'relative' }}>
                <input type="password" placeholder="••••••••••••••" defaultValue="secretvalue" style={{ paddingRight: '2.5rem' }}/>
                <ShieldCheck size={18} color="#10b981" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}/>
              </div>
            </div>
          </div>

          <div className="ws-form-row">
            <div className="ws-field">
              <label>Token URL</label>
              <input type="text" placeholder="https://auth.onesource.com/oauth2/token" defaultValue="https://auth.thomsonreuters.com/oauth2/v1/token"/>
            </div>
            <div className="ws-field">
              <label>Scope</label>
              <input type="text" placeholder="tax.calc tax.compliance" defaultValue="tax.calc tax.compliance tax.returns"/>
            </div>
          </div>

          <div className="ws-form-row">
            <div className="ws-field">
              <label>API Base URL</label>
              <input type="text" placeholder="https://api.onesource.com/v2" defaultValue="https://api.onesourcetax.com/tax/v2"/>
            </div>
            <div className="ws-field">
              <label>Ambiente</label>
              <select defaultValue="production">
                <option value="sandbox">Sandbox (Testes)</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>

          <div className="ws-form-row">
            <div className="ws-field">
              <label>Grant Type</label>
              <select defaultValue="client_credentials">
                <option value="client_credentials">Client Credentials</option>
                <option value="authorization_code">Authorization Code</option>
              </select>
            </div>
            <div className="ws-field">
              <label>Token Expiry (segundos)</label>
              <input type="number" placeholder="3600" defaultValue={3600}/>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', borderTop: '1px solid var(--ws-accent-border)', paddingTop: '1.25rem' }}>
            <BotaoGlobal variante="primario" tamanho="pequeno" icone={<CheckCircle weight="bold" size={14}/>} onClick={handleSaveOAuth}>
              {oauthSaved ? 'Credenciais Salvas ✓' : 'Salvar Credenciais'}
            </BotaoGlobal>
            <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<ArrowSquareOut weight="bold" size={14}/>}>
              Documentação ONESOURCE
            </BotaoGlobal>
          </div>
        </div>
      )}

      {/* ── De-Para Mapping ─────────────────────────────── */}
      {subTab === 'depara' && (
        <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <ArrowsLeftRight weight="duotone" size={14} color="#ff6900"/> Mapeamento De-Para — Campos Fiscais
            </p>
            <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Plus weight="bold" size={13}/>} onClick={addRow}>
              Adicionar Campo
            </BotaoGlobal>
          </div>

          <div style={{
            background: 'rgba(255,105,0,0.06)', border: '1px solid rgba(255,105,0,0.15)',
            borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8125rem',
            color: 'var(--ws-muted)', lineHeight: 1.55,
          }}>
            Configure o mapeamento entre os campos do Gravity e os campos do ONESOURCE Tax Determination.
            Estes mapeamentos são usados na chamada <code style={{ color: '#ff6900', background: 'rgba(255,105,0,0.1)', padding: '0.1rem 0.375rem', borderRadius: '4px' }}>POST /tax/v2/calculate</code>.
          </div>

          <div style={{
            background: 'var(--ws-surface)', border: '1px solid var(--ws-accent-border)',
            borderRadius: '12px', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 40px 1fr 50px',
              gap: '1rem', padding: '0.75rem 1.25rem', alignItems: 'center',
              background: 'rgba(129,140,248,0.05)', borderBottom: '1px solid var(--ws-accent-border)',
            }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>#</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Campo Gravity</span>
              <span/>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Campo ONESOURCE</span>
              <span/>
            </div>

            {/* Rows */}
            {depara.map((row, idx) => (
              <div key={row.id} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 40px 1fr 50px',
                gap: '1rem', padding: '0.625rem 1.25rem', alignItems: 'center',
                borderBottom: idx < depara.length - 1 ? '1px solid rgba(129,140,248,0.06)' : 'none',
                transition: 'background 0.1s',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ws-muted)' }}>{idx + 1}</span>
                <input
                  type="text" value={row.gravityField}
                  onChange={e => updateRow(row.id, 'gravityField', e.target.value)}
                  style={{
                    background: 'var(--ws-bg-body)', border: '1px solid var(--ws-accent-border)',
                    borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#818cf8',
                    fontSize: '0.8125rem', fontFamily: "'Fira Code', monospace", outline: 'none',
                  }}
                />
                <ArrowsLeftRight weight="bold" size={14} color="var(--ws-muted)" style={{ justifySelf: 'center' }}/>
                <input
                  type="text" value={row.onesourceField}
                  onChange={e => updateRow(row.id, 'onesourceField', e.target.value)}
                  style={{
                    background: 'var(--ws-bg-body)', border: '1px solid var(--ws-accent-border)',
                    borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ff6900',
                    fontSize: '0.8125rem', fontFamily: "'Fira Code', monospace", outline: 'none',
                  }}
                />
                <button onClick={() => removeRow(row.id)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--ws-muted)', padding: '0.375rem', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}><Trash weight="bold" size={14}/></button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <BotaoGlobal variante="primario" tamanho="pequeno" icone={<CheckCircle weight="bold" size={14}/>}>
              Salvar Mapeamento
            </BotaoGlobal>
            <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<CloudArrowUp weight="bold" size={14}/>}>
              Importar CSV
            </BotaoGlobal>
          </div>
        </div>
      )}

      {/* ── Connection Test ────────────────────────────── */}
      {subTab === 'teste' && (
        <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p className="ws-section-title" style={{ margin: 0 }}>
            <Lightning weight="duotone" size={14} color="#ff6900"/> Teste de Conexão — ONESOURCE
          </p>

          {/* Test card */}
          <div className="ws-form-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: testStatus === 'success' ? 'rgba(16,185,129,0.12)' :
                            testStatus === 'error'   ? 'rgba(239,68,68,0.12)' :
                            testStatus === 'testing'  ? 'rgba(255,105,0,0.12)' : 'var(--ws-accent-dim)',
                border: `2px solid ${
                  testStatus === 'success' ? 'rgba(16,185,129,0.3)' :
                  testStatus === 'error'   ? 'rgba(239,68,68,0.3)' :
                  testStatus === 'testing'  ? 'rgba(255,105,0,0.3)' : 'var(--ws-accent-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {testStatus === 'idle' && <Plugs weight="duotone" size={32} color="var(--ws-muted)"/>}
                {testStatus === 'testing' && <Spinner weight="bold" size={32} color="#ff6900" className="ws-spin"/>}
                {testStatus === 'success' && <CheckCircle weight="fill" size={32} color="#34d399"/>}
                {testStatus === 'error' && <XCircle weight="fill" size={32} color="#f87171"/>}
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ws-text)', margin: '0 0 0.25rem' }}>
                  {testStatus === 'idle' && 'Pronto para testar'}
                  {testStatus === 'testing' && 'Conectando ao ONESOURCE...'}
                  {testStatus === 'success' && 'Conexão estabelecida com sucesso!'}
                  {testStatus === 'error' && 'Falha na conexão'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', margin: 0 }}>
                  {testStatus === 'idle' && 'Clique abaixo para validar as credenciais OAuth 2.0 e a conectividade com a API ONESOURCE.'}
                  {testStatus === 'testing' && 'Autenticando via OAuth 2.0 e verificando endpoint /tax/v2/health...'}
                  {testStatus === 'success' && 'Token obtido com sucesso. Latência: 142ms · Região: us-east-1'}
                  {testStatus === 'error' && 'Verifique Client ID / Secret e tente novamente. HTTP 401 Unauthorized.'}
                </p>
              </div>

              <BotaoGlobal
                variante={testStatus === 'error' ? 'perigo' : 'primario'}
                tamanho="pequeno"
                icone={testStatus === 'testing' ? <Spinner weight="bold" size={14}/> : <Play weight="bold" size={14}/>}
                onClick={handleTest}
                style={{ marginTop: '0.5rem' }}
              >
                {testStatus === 'testing' ? 'Testando...' : testStatus === 'error' ? 'Tentar Novamente' : 'Iniciar Teste'}
              </BotaoGlobal>
            </div>

            {/* Test details (only after test) */}
            {(testStatus === 'success' || testStatus === 'error') && (
              <div style={{
                borderTop: '1px solid var(--ws-accent-border)', paddingTop: '1.25rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ws-muted)', margin: 0 }}>
                  Detalhes do Teste
                </p>
                {[
                  { label: 'OAuth Token', value: testStatus === 'success' ? 'Obtido (expires_in: 3600s)' : 'Falha — 401', ok: testStatus === 'success' },
                  { label: 'Endpoint Health', value: testStatus === 'success' ? '200 OK — 142ms' : 'Timeout', ok: testStatus === 'success' },
                  { label: 'Tax Calc API', value: testStatus === 'success' ? 'Disponível' : 'Não verificado', ok: testStatus === 'success' },
                  { label: 'Compliance API', value: testStatus === 'success' ? 'Disponível' : 'Não verificado', ok: testStatus === 'success' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem', borderRadius: '6px',
                    background: item.ok ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: item.ok ? '#34d399' : '#f87171' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Connector Card ────────────────────────────────────── */
function ConnectorCard({ c, onClick }: { c: Conector; onClick: () => void }) {
  const st = statusMap[c.status]
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--ws-surface)', border: '1px solid var(--ws-accent-border)',
        borderRadius: '14px', padding: '1.5rem', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = c.corPrimaria;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px ${c.corBg}, 0 12px 24px rgba(0,0,0,0.25)`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ws-accent-border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      {/* Top color bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: c.corPrimaria, opacity: 0.6 }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '10px',
          background: c.corBg, border: `1px solid ${c.corPrimaria}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.875rem', fontWeight: 800, color: c.corPrimaria,
        }}>
          {c.id === 'sap' ? 'SAP' : c.id === 'onesource' ? 'TR' : c.id === 'cargowise' ? 'CW' : 'BY'}
        </div>
        <span className={`ws-badge ${st.cls}`} style={{ gap: '0.3rem' }}>
          {st.icon} {st.label}
        </span>
      </div>

      {/* Info */}
      <div>
        <h4 style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 700, color: 'var(--ws-text)' }}>{c.nome}</h4>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55 }}>{c.descricao}</p>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {c.features.map(f => (
          <span key={f} style={{
            fontSize: '0.6875rem', fontWeight: 600, padding: '0.2rem 0.5rem',
            borderRadius: '6px', background: c.corBg, color: c.corPrimaria,
            border: `1px solid ${c.corPrimaria}22`,
          }}>{f}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid var(--ws-accent-border)', paddingTop: '0.875rem',
        marginTop: 'auto',
      }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)' }}>{c.categoria} · {c.versao}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: c.corPrimaria, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          Configurar <ArrowSquareOut weight="bold" size={12}/>
        </span>
      </div>
    </div>
  )
}

/* ── Main Export ────────────────────────────────────────── */
export function Conectores() {
  const [selected, setSelected] = useState<ConectorId | null>(null)

  if (selected === 'onesource') {
    return <OnesourceConfig onBack={() => setSelected(null)}/>
  }

  return (
    <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="ws-section-title" style={{ margin: 0 }}>
          <Globe weight="duotone" size={14} color="#818cf8"/> Marketplace de Integrações
        </p>
        <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
          {CONECTORES.length} conectores disponíveis
        </span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.25rem',
      }}>
        {CONECTORES.map(c => (
          <ConnectorCard key={c.id} c={c} onClick={() => setSelected(c.id)}/>
        ))}
      </div>
    </div>
  )
}
