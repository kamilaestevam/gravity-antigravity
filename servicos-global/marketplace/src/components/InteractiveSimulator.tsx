import { SmartDocSimulator } from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/SmartDocSimulator'
import { PedidoSimulator } from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/PedidoSimulator'
import { useState, useEffect } from 'react'
import {
  Folder,
  FileText,
  ClipboardText,
  UploadSimple,
  MagnifyingGlass,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkle,
  Truck,
  Anchor,
  Globe,
  CurrencyDollar,
  X,
  Check,
  Warning,
  Gear,
  Trash,
} from '@phosphor-icons/react'

interface SimulatorProps {
  productId: string
  onClose: () => void
}

function InteractiveSimulatorContent({ productId, onClose }: SimulatorProps) {
  // BID Frete Simulator State
  const [bidStep, setBidStep] = useState<number>(1) // 1: dashboard, 2: choose modal, 3: select ports, 4: select container, 5: comparison, 6: success
  const [selectedModal, setSelectedModal] = useState<'maritimo' | 'aereo' | 'rodoviario' | null>(null)
  const [originPort, setOriginPort] = useState('')
  const [destPort, setDestPort] = useState('')
  const [containerQty, setContainerQty] = useState(1)

  // Reset states when product changes
  useEffect(() => {
    setBidStep(1)
    setSelectedModal(null)
    setOriginPort('')
    setDestPort('')
    setContainerQty(1)
  }, [productId])

  // Helper to format BRL
  const fmtBRL = (n: number) => {
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // =========================================================================
  // 1. SMART DOCS SIMULATOR
  // =========================================================================
  if (productId === 'smart-read') {
    return <SmartDocSimulator onFecharSimulador={onClose} />
  }
  // =========================================================================
  // 2. BID FRETE SIMULATOR
  // =========================================================================
  if (productId === 'bid-frete') {
    return (
      <div style={{
        width: '100%', height: '100%', background: '#090b14', color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '13px', textAlign: 'left',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3, 5, 12, 0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} weight="duotone" style={{ color: '#fbbf24' }} />
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: 0 }}>BID Frete Internacional</h3>
          </div>
          {bidStep === 1 && (
            <button
              onClick={() => setBidStep(2)}
              style={{
                background: '#fbbf24', color: '#03050c', border: 'none', borderRadius: '6px',
                padding: '5px 10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
              }}
            >
              <Plus size={12} weight="bold" />
              <span>Nova Cotação</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        {bidStep === 1 && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { label: 'Savings Acumulado', val: 'R$ 38.450', color: '#10b981' },
                { label: 'BIDs Ativos', val: '4 Processos', color: '#fbbf24' },
                { label: 'Melhor Lance Médio', val: 'USD 3.200 / FCL', color: '#06b6d4' },
              ].map((stat, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '8px', padding: '10px',
                }}>
                  <p style={{ color: '#64748b', fontSize: '9px', margin: '0 0 2px 0' }}>{stat.label}</p>
                  <p style={{ fontWeight: 800, fontSize: '13px', color: stat.color, margin: 0 }}>{stat.val}</p>
                </div>
              ))}
            </div>

            {/* Bids List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontWeight: 700, color: '#94a3b8', margin: 0 }}>Listagem de Cotações Ativas</p>
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
                {[
                  { ref: 'BID-9821', route: 'Santos (BRSSZ) → Shanghai (CNSHA)', proposals: '5 Recebidas', status: 'Aguardando Aprovação', color: '#fbbf24' },
                  { ref: 'BID-9710', route: 'Navegantes (BRNVG) → Rotterdam (NLRTM)', proposals: '3 Recebidas', status: 'Análise Técnica', color: '#06b6d4' },
                ].map((bid, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (bid.ref === 'BID-9821') {
                        setBidStep(5)
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px',
                      borderBottom: idx === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer',
                      background: bid.ref === 'BID-9821' ? 'rgba(251,191,36,0.03)' : 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = bid.ref === 'BID-9821' ? 'rgba(251,191,36,0.03)' : 'transparent'}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: '#fff' }}>{bid.ref}</span>
                        <span style={{ fontSize: '8px', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '3px', color: '#94a3b8' }}>{bid.proposals}</span>
                      </div>
                      <span style={{ color: '#cbd5e1' }}>{bid.route}</span>
                    </div>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, color: bid.color,
                      padding: '2px 6px', background: `${bid.color}15`, borderRadius: '4px',
                      border: `1px solid ${bid.color}30`,
                    }}>{bid.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {bidStep === 2 && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: '13px', color: '#fff', margin: 0 }}>Selecione o Modal Logístico</p>
            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
              {[
                { id: 'maritimo', label: 'Marítimo', icon: <Anchor size={22} /> },
                { id: 'aereo', label: 'Aéreo', icon: <Globe size={22} /> },
              ].map(modal => (
                <div
                  key={modal.id}
                  onClick={() => {
                    setSelectedModal(modal.id as 'maritimo' | 'aereo')
                    setBidStep(3)
                  }}
                  style={{
                    flex: 1, padding: '20px 10px', borderRadius: '10px',
                    border: '1.5px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.02)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#fbbf24'
                    e.currentTarget.style.background = 'rgba(251,191,36,0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'
                    e.currentTarget.style.background = 'rgba(251,191,36,0.02)'
                  }}
                >
                  <div style={{ color: '#fbbf24' }}>{modal.icon}</div>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{modal.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setBidStep(1)} style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer' }}>Voltar</button>
          </div>
        )}

        {bidStep === 3 && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: '13px', color: '#fff', margin: 0 }}>Origem e Destino</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
              <div>
                <label style={{ fontSize: '9px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Porto de Origem</label>
                <select
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '11px', outline: 'none',
                  }}
                >
                  <option value="" style={{ background: '#090b14' }}>Selecionar Porto...</option>
                  <option value="Santos" style={{ background: '#090b14' }}>Porto de Santos (BRSSZ)</option>
                  <option value="Paranagua" style={{ background: '#090b14' }}>Porto de Paranaguá (BRPNG)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '9px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Porto de Destino</label>
                <select
                  value={destPort}
                  onChange={(e) => setDestPort(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '11px', outline: 'none',
                  }}
                >
                  <option value="" style={{ background: '#090b14' }}>Selecionar Porto...</option>
                  <option value="Shanghai" style={{ background: '#090b14' }}>Porto de Shanghai (CNSHA)</option>
                  <option value="Rotterdam" style={{ background: '#090b14' }}>Porto de Rotterdam (NLRTM)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button onClick={() => setBidStep(2)} className="btn btn-secondary" style={{ padding: '6px 14px' }}>Voltar</button>
              <button
                disabled={!originPort || !destPort}
                onClick={() => setBidStep(4)}
                className="btn btn-primary"
                style={{ padding: '6px 14px', background: '#fbbf24', color: '#03050c' }}
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {bidStep === 4 && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: '13px', color: '#fff', margin: 0 }}>Configuração da Carga</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
              <div>
                <label style={{ fontSize: '9px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Tipo de Equipamento</label>
                <select
                  style={{
                    width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '11px', outline: 'none',
                  }}
                >
                  <option style={{ background: '#090b14' }}>20' Dry Standard</option>
                  <option style={{ background: '#090b14' }}>40' High Cube</option>
                  <option style={{ background: '#090b14' }}>40' Flat Rack</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '9px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Quantidade de Contêineres</label>
                <input
                  type="number"
                  min={1}
                  value={containerQty}
                  onChange={(e) => setContainerQty(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '11px', outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button onClick={() => setBidStep(3)} className="btn btn-secondary" style={{ padding: '6px 14px' }}>Voltar</button>
              <button
                onClick={() => setBidStep(5)}
                className="btn btn-primary"
                style={{ padding: '6px 14px', background: '#fbbf24', color: '#03050c' }}
              >
                Lançar BID
              </button>
            </div>
          </div>
        )}

        {bidStep === 5 && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '12px', margin: 0 }}>BID-9821: Lances Recebidos</p>
                <p style={{ color: '#64748b', fontSize: '9px', margin: '2px 0 0 0' }}>Santos (BRSSZ) → Shanghai (CNSHA) · 20' Dry x {containerQty}</p>
              </div>
              <span style={{ fontSize: '9px', background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>LICITAÇÃO ATIVA</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { partner: 'HAPAG-LLOYD', value: 12400, transit: '24 dias', best: true },
                { partner: 'CMA CGM', value: 14500, transit: '26 dias', best: false },
                { partner: 'MSC LOGISTICS', value: 15200, transit: '22 dias', best: false },
              ].map((proposal, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderColor: proposal.best ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, color: proposal.best ? '#10b981' : '#fff' }}>{proposal.partner}</span>
                      {proposal.best && <span style={{ fontSize: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>MELHOR FRETE</span>}
                    </div>
                    <span style={{ color: '#64748b' }}>Tempo de trânsito: {proposal.transit}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fff', fontSize: '12px' }}>USD {proposal.value.toLocaleString()}</span>
                    <button
                      onClick={() => setBidStep(6)}
                      style={{
                        background: proposal.best ? '#10b981' : 'rgba(255,255,255,0.08)',
                        color: proposal.best ? '#fff' : '#cbd5e1',
                        border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '9px', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      Aprovar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bidStep === 6 && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={36} weight="fill" style={{ color: '#10b981' }} />
              <p style={{ fontWeight: 800, fontSize: '13px', color: '#fff', margin: 0 }}>Frete Contratado com Sucesso!</p>
              <p style={{ color: '#94a3b8', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                Proposta da Hapag-Lloyd aprovada. Dados de transporte vinculados diretamente ao Pedido #PO-9821.
              </p>
            </div>
            <button
              onClick={() => setBidStep(1)}
              style={{
                background: '#fbbf24', color: '#03050c', border: 'none', borderRadius: '6px',
                padding: '6px 14px', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Voltar ao Dashboard
            </button>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // 3. PEDIDO SIMULATOR
  // =========================================================================
  if (productId === 'pedido') {
    return <PedidoSimulator onFecharSimulador={onClose} />
  }

  return null
}

export function InteractiveSimulator(props: SimulatorProps) {
  // Configuração para evitar distorção de scale 3D e aumentar a resolução do modal
  // O scale do active layer no home.css foi aumentado para 3.6. A placa base tem 280x180.
  // 280 * 3.6 = 1008px. 180 * 3.6 = 648px.
  return (
    <div
      className="interactive-simulator-shell"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {props.productId !== 'smart-read' && props.productId !== 'pedido' && (
      <button
        type="button"
        className="interactive-simulator-close"
        aria-label="Fechar demonstração"
        title="Fechar"
        onClick={(e) => {
          e.stopPropagation()
          props.onClose()
        }}
      >
        <X size={20} weight="bold" />
      </button>
      )}
      <InteractiveSimulatorContent {...props} />
    </div>
  )
}
