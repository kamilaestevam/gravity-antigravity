import React, { useState } from 'react'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/select-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { Clock, Info, EnvelopeSimple, Play, List } from '@phosphor-icons/react'

export interface ModalAgendamentoTestesProps {
  aberto: boolean
  aoFechar: () => void
}

export function ModalAgendamentoTestes({ aberto, aoFechar }: ModalAgendamentoTestesProps) {
  const [dados, setDados] = useState({
    agendamentoAutomatico: 'Desativado',
    frequencia: 'Manual',
    hora: '00h',
    minuto: '00min',
    tipos: { unitarios: true, funcionais: true, e2e: false },
    email: '',
    notificarApenasFalhas: true,
    ambiente: 'Local',
    manual: {
      tipos: { unitarios: true, funcionais: false, e2e: false },
      ambiente: 'Local'
    }
  })

  // Mock dirty state
  const isDirty = false

  const handleSalvar = () => {
    aoFechar()
  }

  // --- Opções de Selects ---
  const opcoesAtivacao = [
    { valor: 'Desativado', rotulo: 'Desativado' },
    { valor: 'Ativado', rotulo: 'Ativado' }
  ]
  const opcoesFrequencia = [
    { valor: 'Manual', rotulo: 'Manual' },
    { valor: 'Diario', rotulo: 'Diário' },
    { valor: 'Semanal', rotulo: 'Semanal' }
  ]
  const opcoesHora = Array.from({ length: 24 }).map((_, i) => ({ valor: `${i.toString().padStart(2, '0')}h`, rotulo: `${i.toString().padStart(2, '0')}h` }))
  const opcoesMinuto = Array.from({ length: 60 }).map((_, i) => ({ valor: `${i.toString().padStart(2, '0')}min`, rotulo: `${i.toString().padStart(2, '0')}min` }))
  const opcoesAmbiente = [
    { valor: 'Local', rotulo: 'Local' },
    { valor: 'Staging', rotulo: 'Staging' },
    { valor: 'Producao', rotulo: 'Produção' }
  ]

  const abas: AbaFormulario[] = [
    {
      id: 'config',
      rotulo: 'Configuração',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Banner Info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem', borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            color: '#bae6fd', fontSize: '0.85rem'
          }}>
            <Info size={18} weight="fill" color="#38bdf8" />
            <span>Servidor offline — mostrando configurações padrão.</span>
          </div>

          {/* Agendamento Automático */}
          <div className="em-grid">
            <GeralCampoGlobal label="AGENDAMENTO AUTOMÁTICO">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '200px' }}>
                  <SelectGlobal
                    opcoes={opcoesAtivacao}
                    valor={dados.agendamentoAutomatico}
                    aoMudarValor={v => setDados({ ...dados, agendamentoAutomatico: String(v) })}
                  />
                </div>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Desativado</span>
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Frequência & Hora */}
          <div className="em-grid em-grid--2">
            <GeralCampoGlobal label="FREQUÊNCIA">
              <SelectGlobal
                opcoes={opcoesFrequencia}
                valor={dados.frequencia}
                aoMudarValor={v => setDados({ ...dados, frequencia: String(v) })}
              />
            </GeralCampoGlobal>
            <GeralCampoGlobal label="HORA DE EXECUÇÃO">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SelectGlobal
                  opcoes={opcoesHora}
                  valor={dados.hora}
                  aoMudarValor={v => setDados({ ...dados, hora: String(v) })}
                />
                <span style={{ color: '#64748b' }}>:</span>
                <SelectGlobal
                  opcoes={opcoesMinuto}
                  valor={dados.minuto}
                  aoMudarValor={v => setDados({ ...dados, minuto: String(v) })}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Tipos de Teste */}
          <div className="em-grid">
            <GeralCampoGlobal label="TIPOS DE TESTE">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dados.tipos.unitarios} onChange={e => setDados({...dados, tipos: {...dados.tipos, unitarios: e.target.checked}})} 
                         style={{ accentColor: 'var(--cl-primary, #6366f1)', width: '16px', height: '16px', borderRadius: '4px' }} />
                  Unitários
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dados.tipos.funcionais} onChange={e => setDados({...dados, tipos: {...dados.tipos, funcionais: e.target.checked}})}
                         style={{ accentColor: 'var(--cl-primary, #6366f1)', width: '16px', height: '16px', borderRadius: '4px' }} />
                  🧪 Funcionais
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dados.tipos.e2e} onChange={e => setDados({...dados, tipos: {...dados.tipos, e2e: e.target.checked}})}
                         style={{ accentColor: 'var(--cl-primary, #6366f1)', width: '16px', height: '16px', borderRadius: '4px' }} />
                  🖥️ E2E
                </label>
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Email e Notificações */}
          <div className="em-grid em-grid--2">
            <GeralCampoGlobal label="EMAIL DE NOTIFICAÇÃO">
              <div className="ws-input-icon-wrap" style={{ '--ws-focus-ring': '#6366f1' } as React.CSSProperties}>
                <EnvelopeSimple size={16} />
                <input 
                  type="email" 
                  placeholder="eng@empresa.com" 
                  value={dados.email} 
                  onChange={e => setDados({...dados, email: e.target.value})} 
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
                />
              </div>
            </GeralCampoGlobal>
            <GeralCampoGlobal label="NOTIFICAÇÕES">
              <div style={{ display: 'flex', alignItems: 'center', height: '40px', padding: '0 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}>
                  <input type="checkbox" checked={dados.notificarApenasFalhas} onChange={e => setDados({...dados, notificarApenasFalhas: e.target.checked})}
                         style={{ accentColor: '#38bdf8', width: '16px', height: '16px', borderRadius: '4px' }} />
                  Notificar apenas em falhas
                </label>
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Ambiente */}
          <div className="em-grid" style={{ width: '50%' }}>
            <GeralCampoGlobal label="AMBIENTE">
              <SelectGlobal
                opcoes={opcoesAmbiente}
                valor={dados.ambiente}
                aoMudarValor={v => setDados({ ...dados, ambiente: String(v) })}
              />
            </GeralCampoGlobal>
          </div>
        </div>
      )
    },
    {
      id: 'manual',
      rotulo: 'Execução Manual',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <Play size={14} weight="fill" /> DISPARO MANUAL
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>TIPOS:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dados.manual.tipos.unitarios} onChange={e => setDados({...dados, manual: {...dados.manual, tipos: {...dados.manual.tipos, unitarios: e.target.checked}}})}
                         style={{ accentColor: '#38bdf8', width: '16px', height: '16px', borderRadius: '4px' }} />
                  Unitários
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dados.manual.tipos.funcionais} onChange={e => setDados({...dados, manual: {...dados.manual, tipos: {...dados.manual.tipos, funcionais: e.target.checked}}})}
                         style={{ accentColor: '#38bdf8', width: '16px', height: '16px', borderRadius: '4px' }} />
                  🧪 Funcionais
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dados.manual.tipos.e2e} onChange={e => setDados({...dados, manual: {...dados.manual, tipos: {...dados.manual.tipos, e2e: e.target.checked}}})}
                         style={{ accentColor: '#38bdf8', width: '16px', height: '16px', borderRadius: '4px' }} />
                  🖥️ E2E
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>AMBIENTE:</span>
                <div style={{ width: '140px' }}>
                  <SelectGlobal
                    opcoes={opcoesAmbiente}
                    valor={dados.manual.ambiente}
                    aoMudarValor={v => setDados({ ...dados, manual: {...dados.manual, ambiente: String(v)} })}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 700, border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                width: 'max-content'
              }}
            >
              <Play size={18} weight="fill" /> Executar Agora
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'historico',
      rotulo: 'Histórico',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#eab308', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <Clock size={14} weight="duotone" /> PRÓXIMAS EXECUÇÕES
          </h4>
          
          <div className="em-grid em-grid--2">
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>PRÓXIMA EXECUÇÃO</span>
              <span style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600 }}>Manual</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>EXPRESSÃO CRON</span>
              <span style={{ color: '#f1f5f9', fontSize: '1.1rem' }}>—</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>ÚLTIMA EXECUÇÃO</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
              <List size={22} weight="duotone" />
              <span style={{ fontSize: '0.95rem' }}>Nenhuma execução registrada no histórico recente.</span>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Clock weight="duotone" size={22} />}
      titulo="Agendamento de Testes"
      subtitulo="Configure a automação e disparos manuais da pipeline"
      dirty={isDirty}
      podesSalvar={isDirty}
      tamanho="lg"
      altura="620px"
      abas={abas}
      tipoAbas="pill"
    />
  )
}
