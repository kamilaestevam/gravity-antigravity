import React, { useState } from 'react'
import {
  ShieldCheck,
  LockKey,
  Clock,
  Info,
  FileText,
  ArrowRight,
  CheckCircle,
  Warning,
  LockOpen,
  Eye,
  CalendarBlank,
} from '@phosphor-icons/react'

export function PedidoSnapshotCadastros() {
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(2) // Lock step active by default

  // Mock snapshot data for visual excellence
  const mockSnapshotItems = [
    { campo: 'Fornecedor Líder', valorOriginal: 'Maersk Line Brasil Ltda', valorAtual: 'Maersk Line Global S.A.', status: 'LOCKED', dataLock: '21/05/2026' },
    { campo: 'Incoterm Associado', valorOriginal: 'FOB (Free on Board)', valorAtual: 'CIF (Cost, Insurance & Freight)', status: 'LOCKED', dataLock: '21/05/2026' },
    { campo: 'Taxa Administrativa (THC)', valorOriginal: 'USD 180,00 por CTN', valorAtual: 'USD 210,00 por CTN', status: 'LOCKED', dataLock: '21/05/2026' },
    { campo: 'Alíquota de ICMS Aplicada', valorOriginal: '18.00% (SP)', valorAtual: '19.50% (SP)', status: 'LOCKED', dataLock: '21/05/2026' },
    { campo: 'Câmbio de Fechamento', valorOriginal: '1 USD = 5,2340 BRL', valorAtual: '1 USD = 5,4120 BRL', status: 'LOCKED', dataLock: '21/05/2026' },
  ]

  return (
    <section className="cfg-secao" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Dynamic Keyframes injected locally */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .timeline-step {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .timeline-step:hover {
          transform: translateY(-2px);
          background: rgba(30, 41, 59, 0.8) !important;
          border-color: rgba(99, 102, 241, 0.4) !important;
        }
        .snapshot-table-tr {
          transition: background 0.2s ease;
        }
        .snapshot-table-tr:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>

      {/* Header Section */}
      <div className="cfg-secao__header" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '10px',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <ShieldCheck size={26} weight="duotone" />
          </div>
          <div>
            <h2 className="cfg-secao__titulo" style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#fff', margin: '0 0 0.3rem 0' }}>
              Histórico & Snapshots de Auditoria
            </h2>
            <p className="cfg-secao__desc" style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Garantia jurídica e conformidade regulatória através do congelamento automatizado dos dados cadastrais associados aos Bids.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Info Card */}
      <div style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <Info size={20} weight="duotone" style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Por que congelamos estes dados?</span>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Ao contrário do módulo de pedidos nacionais comuns onde cadastros dinâmicos podem atualizar em tempo real, as cotações de <strong>Frete Internacional</strong> envolvem conformidade alfandegária e acordos tarifários estritos. O sistema congela a imagem fiel ("Snapshot") das tabelas de apoio para auditar os valores acordados perante a diretoria e os órgãos de controle financeiro.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Lifecycle Timeline */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} weight="duotone" style={{ color: '#a78bfa' }} /> Ciclo de Vida do Lock do Bid
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          position: 'relative'
        }}>
          {/* Step 1: Draft */}
          <div
            className="timeline-step"
            onClick={() => setActiveTimelineStep(0)}
            style={{
              background: activeTimelineStep === 0 ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.4)',
              border: activeTimelineStep === 0 ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase 01</span>
              <span style={{
                background: 'rgba(52, 211, 153, 0.1)',
                color: '#34d399',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <LockOpen size={10} weight="bold" /> Dinâmico
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Rascunho & Análise</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Todos os dados fiscais e cadastros de parceiros atualizam dinamicamente conforme alterações globais do ERP.
              </span>
            </div>
          </div>

          {/* Step 2: Active */}
          <div
            className="timeline-step"
            onClick={() => setActiveTimelineStep(1)}
            style={{
              background: activeTimelineStep === 1 ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.4)',
              border: activeTimelineStep === 1 ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase 02</span>
              <span style={{
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#fbbf24',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Warning size={10} weight="bold" /> Monitorado
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Bid Ativo no Mercado</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Cadastros permanecem editáveis, mas alterações nos campos de regras de frete disparam alertas aos fornecedores.
              </span>
            </div>
          </div>

          {/* Step 3: Locked */}
          <div
            className="timeline-step"
            onClick={() => setActiveTimelineStep(2)}
            style={{
              background: activeTimelineStep === 2 ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.4)',
              border: activeTimelineStep === 2 ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: activeTimelineStep === 2 ? '0 0 15px rgba(99, 102, 241, 0.15)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase 03</span>
              <span style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <LockKey size={10} weight="bold" /> Congelado
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Aprovação & Lock Final</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Ao aprovar/recusar o Bid, as tabelas de suporte são eternizadas. Alterações futuras no ERP não afetarão o histórico deste frete.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Live Demonstration of Snapshot Values */}
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
      }}>
        {/* Title and Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.15rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} weight="duotone" style={{ color: '#10b981' }} /> Visualizador de Snapshot (Somente Leitura)
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Exemplo de auditoria do Bid #BF-2026-9902 aprovado</span>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            padding: '5px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle size={14} weight="fill" /> Integridade Protegida por SHA-256
          </div>
        </div>

        {/* The Snapshot Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '10px 12px', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Propriedade</th>
                <th style={{ padding: '10px 12px', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor no Fechamento (Snapshot)</th>
                <th style={{ padding: '10px 12px', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor Atual do ERP</th>
                <th style={{ padding: '10px 12px', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockSnapshotItems.map((item, idx) => (
                <tr key={idx} className="snapshot-table-tr" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td style={{ padding: '12px', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1' }}>{item.campo}</td>
                  <td style={{ padding: '12px', fontSize: '0.82rem', color: '#10b981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LockKey size={12} style={{ color: '#10b981' }} /> {item.valorOriginal}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.82rem', color: '#ef4444', textDecoration: 'line-through', opacity: 0.65 }}>
                    {item.valorAtual}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#6366f1', textAlign: 'right' }}>
                    <span style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <LockKey size={10} /> LOCK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Message */}
        <div style={{
          marginTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '1rem',
          fontSize: '0.75rem',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CalendarBlank size={13} /> Data de Gravação do Bloco: <strong>21/05/2026 20:40:02 (UTC)</strong>
          </span>
          <span style={{ color: '#94a3b8' }}>
            Assinatura Digital: <code>0xbf882e...7d91e</code>
          </span>
        </div>
      </div>
    </section>
  )
}
