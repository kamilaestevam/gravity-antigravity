import React, { useState, useEffect } from 'react'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { Package, CurrencyDollar, CalendarBlank, Tag, TreeStructure, CheckCircle, WarningCircle, Check, MagnifyingGlass, SelectionAll, Eraser, Broom } from '@phosphor-icons/react'
import { getSimboloMoeda } from '../../utils/formatters'
import type { Produto } from './Assinaturas'

interface ModalEditarAssinaturaProps {
  produto: Produto | null
  aoFechar: () => void
  aoSalvar: (dados: Produto) => void
}

const BILLING_OPTIONS = [
  { value: 'SaaS',  label: 'SaaS — Mensalidade recorrente' },
  { value: 'Uso',   label: 'Uso — Por consumo/evento'       },
  { value: 'Setup', label: 'Setup — Implantação única'      },
]

export function ModalEditarAssinatura({ produto, aoFechar, aoSalvar }: ModalEditarAssinaturaProps) {
  const [nome,     setNome]     = useState('')
  const [billing,  setBilling]  = useState<Produto['billing']>('SaaS')
  const [valor,    setValor]    = useState('')
  const [renovacao,setRenovacao]= useState('')
  const [workspaces, setWorkspaces] = useState<string[]>([])
  const [search, setSearch] = useState('')

  // Simulação de alta escala: 25 workspaces mocks (podemos escalar para 50+ no exemplo)
  const OPCOES_WORKSPACES = [
    'Sede São Paulo', 'Filial Rio', 'Filial Sul', 'Importes SA', 'Logística MG', 
    'Fábrica PR', 'Filial DF', 'Operações Nordeste', 'Hub Inovação', 'P&D Campinas',
    'Filial Manaus', 'Filial Salvador', 'Filial Porto Alegre', 'Filial Belo Horizonte', 'Filial Curitiba',
    'Filial Fortaleza', 'Filial Recife', 'Filial Goiânia', 'Filial Belém', 'Filial São Luís',
    'Filial Maceió', 'Filial Natal', 'Filial Teresina', 'Filial João Pessoa', 'Filial Aracaju'
  ]

  useEffect(() => {
    if (produto) {
      setNome(produto.nome)
      setBilling(produto.billing)
      setValor(produto.valor)
      setRenovacao(produto.renovacao)
      setWorkspaces(produto.workspacesHabilitados || [])
    }
  }, [produto])

  const dirty = produto
    ? nome !== produto.nome || 
      billing !== produto.billing || 
      valor !== produto.valor || 
      renovacao !== produto.renovacao ||
      JSON.stringify(workspaces) !== JSON.stringify(produto.workspacesHabilitados)
    : false

  function handleSalvar() {
    if (!produto) return
    aoSalvar({ ...produto, nome, billing, valor, renovacao, workspacesHabilitados: workspaces })
  }

  const toggleWorkspace = (ws: string) => {
    setWorkspaces(prev => prev.includes(ws) ? prev.filter(item => item !== ws) : [...prev, ws])
  }

  return (
    <ModalFormularioAbasGlobal
      aberto={!!produto}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Package weight="duotone" size={22} color="var(--color-primary)" />}
      titulo="Configurar Assinatura"
      subtitulo="Gerencie as condições e a distribuição deste produto no tenant"
      dirty={dirty}
      podesSalvar={dirty && !!nome.trim()}
      tamanho="md"
      altura="580px"
      abas={[
        {
          id: 'dados',
          rotulo: 'Dados da Assinatura',
          conteudo: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>
              <GeralCampoGlobal label="Nome do Produto" obrigatorio>
                <div className="ws-input-icon-wrap" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Package size={16} color="var(--ws-muted)" />
                  <input
                    value={nome}
                    placeholder="Ex: Dashboard Global"
                    onChange={e => setNome(e.target.value)}
                    style={{ width: '100%', fontSize: '0.875rem' }}
                  />
                </div>
              </GeralCampoGlobal>

              <GeralCampoGlobal label="Modelo de Cobrança">
                <div className="ws-input-icon-wrap" style={{ padding: 0, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <select
                    value={billing}
                    onChange={e => setBilling(e.target.value as Produto['billing'])}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--ws-text)', padding: '0 1rem 0 2.5rem', appearance: 'none', height: '100%', fontSize: '0.875rem' }}
                  >
                    {BILLING_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <Tag size={16} style={{ position: 'absolute', left: '0.875rem', color: 'var(--ws-muted)' }} />
                </div>
              </GeralCampoGlobal>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <GeralCampoGlobal label="Valor Acordado">
                  <div className="ws-input-icon-wrap" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <CurrencyDollar size={16} color="var(--ws-muted)" />
                    <input value={valor} placeholder="R$ 0,00" onChange={e => setValor(e.target.value)} style={{ width: '100%', fontSize: '0.875rem' }} />
                  </div>
                </GeralCampoGlobal>

                <GeralCampoGlobal label="Próxima Renovação">
                  <div className="ws-input-icon-wrap" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <CalendarBlank size={16} color="var(--ws-muted)" />
                    <input value={renovacao} placeholder="DD/MM/AAAA" onChange={e => setRenovacao(e.target.value)} style={{ width: '100%', fontSize: '0.875rem' }} />
                  </div>
                </GeralCampoGlobal>
              </div>
            </div>
          )
        },
        {
          id: 'distribuicao',
          rotulo: 'Distribuição por Espaço',
          conteudo: (
            <div style={{ paddingTop: '0.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
                  <TreeStructure size={16} weight="duotone" color="var(--color-primary)" /> Ativar nos Espaços
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => setWorkspaces(OPCOES_WORKSPACES)}
                    style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', color: '#818cf8', fontSize: '0.625rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <SelectionAll size={12} /> Selecionar Todos
                  </button>
                  <button 
                    onClick={() => setWorkspaces([])}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--ws-muted)', fontSize: '0.625rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Broom size={12} /> Limpar
                  </button>
                </div>
              </div>

              {/* Barra de Busca Local */}
              <div className="ws-input-icon-wrap" style={{ marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.1)' }}>
                <MagnifyingGlass size={16} color="var(--ws-muted)" />
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Pesquisar espaço de trabalho..." 
                  style={{ width: '100%', fontSize: '0.8125rem' }} 
                />
              </div>

              <div style={{ 
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', 
                overflowY: 'auto', flex: 1, paddingRight: '4px', maxHeight: '280px'
              }}>
                {OPCOES_WORKSPACES.filter(ws => ws.toLowerCase().includes(search.toLowerCase())).map(ws => {
                  const ativo = workspaces.includes(ws)
                  return (
                    <div 
                      key={ws}
                      onClick={() => toggleWorkspace(ws)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem', 
                        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                        background: ativo ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)',
                        border: ativo ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div style={{ 
                        width: 18, height: 18, borderRadius: '4px', border: '1px solid',
                        borderColor: ativo ? '#34d399' : 'var(--ws-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: ativo ? '#34d399' : 'transparent',
                        color: '#fff',
                        transition: 'all 0.2s'
                      }}>
                        {ativo && <Check size={12} weight="bold" />}
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: ativo ? 'var(--ws-text)' : 'var(--ws-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws}</span>
                    </div>
                  )
                })}
              </div>
              
              {workspaces.length === 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '0.6875rem', background: 'rgba(251,191,36,0.05)', padding: '8px', borderRadius: '4px' }}>
                   <WarningCircle size={14} /> Importante: Nenhuma instância selecionada para ativação imediata.
                </div>
              )}
            </div>
          )
        }
      ]}
    />
  )
}
