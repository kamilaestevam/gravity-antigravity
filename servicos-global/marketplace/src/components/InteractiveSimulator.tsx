import { SmartDocSimulator } from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/SmartDocSimulator'
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

  // Pedido Simulator State
  const [kanbanCards, setKanbanCards] = useState([
    { id: '1', title: 'PO-9821 - Master Trade', client: 'Master Importações', status: 'abertura', date: '06/07/2026', value: 'USD 45.600' },
    { id: '2', title: 'PO-9822 - Log Tech', client: 'LogTech Brasil', status: 'anuencia', date: '05/07/2026', value: 'USD 12.800' },
    { id: '3', title: 'PO-9823 - Global Imp', client: 'Global Trading', status: 'desembaraco', date: '04/07/2026', value: 'USD 89.400' },
  ])
  const [selectedCard, setSelectedCard] = useState<typeof kanbanCards[0] | null>(null)

  // Drag and Drop handlers for Kanban
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    const cardId = e.dataTransfer.getData('cardId')
    setKanbanCards(cards =>
      cards.map(card => card.id === cardId ? { ...card, status: targetStatus } : card)
    )
  }

  // Reset states when product changes
  useEffect(() => {
    setBidStep(1)
    setSelectedModal(null)
    setOriginPort('')
    setDestPort('')
    setContainerQty(1)
    setSelectedCard(null)
  }, [productId])

  // Helper to format BRL
  const fmtBRL = (n: number) => {
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // =========================================================================
  // 1. SMART DOCS SIMULATOR
  // =========================================================================
  if (productId === 'smart-read') {
    return <SmartDocSimulator onClose={onClose} />
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
            <ClipboardText size={18} weight="duotone" style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: 0 }}>Gestão de Pedidos (Kanban)</h3>
          </div>
          <span style={{ fontSize: '9px', color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>MÓDULO OPERAÇÕES</span>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Kanban Columns */}
          <div style={{
            flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '14px',
            overflowX: 'auto', background: 'rgba(0,0,0,0.15)',
          }}>
            {['abertura', 'anuencia', 'desembaraco'].map((colStatus) => {
              const colTitle = colStatus === 'abertura' ? 'Abertura' : colStatus === 'anuencia' ? 'Anuência' : 'Desembaraço'
              const colColor = colStatus === 'abertura' ? '#818cf8' : colStatus === 'anuencia' ? '#fbbf24' : '#10b981'
              const colCards = kanbanCards.filter(c => c.status === colStatus)

              return (
                <div
                  key={colStatus}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, colStatus)}
                  style={{
                    background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.04)',
                    borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px',
                    minWidth: '150px',
                  }}
                >
                  {/* Column Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colColor }} />
                      <span style={{ fontWeight: 800, color: '#fff' }}>{colTitle}</span>
                    </div>
                    <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '3px' }}>
                      {colCards.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {colCards.map(card => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onClick={() => setSelectedCard(card)}
                        style={{
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '6px', padding: '8px', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '6px',
                          borderLeft: `2.5px solid ${colColor}`,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = colColor}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                      >
                        <p style={{ fontWeight: 700, color: '#fff', margin: 0 }}>{card.title}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
                          <span>{card.client}</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{card.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Drawer side panel for selected card */}
          {selectedCard && (
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '45%', height: '100%',
              background: '#06070c', borderLeft: '1px solid rgba(255,255,255,0.08)',
              padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px',
              animation: 'slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 10,
            }}>
              {/* Drawer Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <p style={{ fontWeight: 800, fontSize: '12px', color: '#fff', margin: 0 }}>Detalhamento do Processo</p>
                <button
                  onClick={() => setSelectedCard(null)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 2px 0' }}>Referência</p>
                  <p style={{ fontWeight: 700, color: '#fff', margin: 0 }}>{selectedCard.title}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 2px 0' }}>Cliente</p>
                  <p style={{ fontWeight: 600, color: '#cbd5e1', margin: 0 }}>{selectedCard.client}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 2px 0' }}>Data de Abertura</p>
                    <p style={{ fontWeight: 600, color: '#cbd5e1', margin: 0 }}>{selectedCard.date}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 2px 0' }}>Valor Total FOB</p>
                    <p style={{ fontWeight: 700, color: '#818cf8', fontFamily: 'monospace', margin: 0 }}>{selectedCard.value}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                  <p style={{ fontWeight: 700, color: '#94a3b8', margin: '0 0 8px 0' }}>Rastreabilidade de Etapas</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { step: 'Criação do Pedido', ok: true },
                      { step: 'Vincular Cotação de Frete (BID)', ok: selectedCard.status !== 'abertura' },
                      { step: 'Registrar Licença de Importação', ok: selectedCard.status === 'desembaraco' },
                    ].map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '14px', height: '14px', borderRadius: '50%',
                          background: t.ok ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                          color: t.ok ? '#10b981' : '#64748b', border: t.ok ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px',
                        }}>
                          {t.ok ? '✓' : '●'}
                        </span>
                        <span style={{ color: t.ok ? '#cbd5e1' : '#64748b', fontWeight: t.ok ? 600 : 400 }}>{t.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedCard.status === 'abertura' && (
                  <button
                    onClick={() => {
                      // Move card to next step
                      setKanbanCards(cards =>
                        cards.map(c => c.id === selectedCard.id ? { ...c, status: 'anuencia' } : c)
                      )
                      setSelectedCard(c => c ? { ...c, status: 'anuencia' } : null)
                    }}
                    className="btn btn-primary"
                    style={{ background: '#818cf8', color: '#fff', justifyContent: 'center', padding: '6px 12px' }}
                  >
                    <span>Vincular Cotação (BID)</span>
                    <ArrowRight size={12} />
                  </button>
                )}
                {selectedCard.status === 'anuencia' && (
                  <button
                    onClick={() => {
                      setKanbanCards(cards =>
                        cards.map(c => c.id === selectedCard.id ? { ...c, status: 'desembaraco' } : c)
                      )
                      setSelectedCard(c => c ? { ...c, status: 'desembaraco' } : null)
                    }}
                    className="btn btn-primary"
                    style={{ background: '#fbbf24', color: '#03050c', justifyContent: 'center', padding: '6px 12px' }}
                  >
                    <span>Registrar Anuência da LI</span>
                    <ArrowRight size={12} />
                  </button>
                )}
                {selectedCard.status === 'desembaraco' && (
                  <button
                    onClick={() => {
                      // Show success message or document
                      alert('Declaração de Importação vinculada com sucesso!')
                      setSelectedCard(null)
                    }}
                    className="btn btn-primary"
                    style={{ background: '#10b981', color: '#fff', justifyContent: 'center', padding: '6px 12px' }}
                  >
                    <CheckCircle size={14} />
                    <span>Emitir Declaração de Importação</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export function InteractiveSimulator(props: SimulatorProps) {
  // Configuração para evitar distorção de scale 3D e aumentar a resolução do modal
  // O scale do active layer no home.css foi aumentado para 3.6. A placa base tem 280x180.
  // 280 * 3.6 = 1008px. 180 * 3.6 = 648px.
  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      style={{
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      overflow: 'visible',
      borderRadius: '24px', 
      border: '18px solid #000',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.1)',
      background: '#090b14', 
    }}>
      <InteractiveSimulatorContent {...props} />
    </div>
  )
}
