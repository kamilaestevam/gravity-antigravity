import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { Clock, Info, EnvelopeSimple, Play, List } from '@phosphor-icons/react'
import { TabelaGlobal } from '@nucleo/tabela-global'

export interface ModalAgendamentoTestesProps {
  aberto: boolean
  aoFechar: () => void
  aoMudarStatus?: (ativo: boolean) => void
}

export function ModalAgendamentoTestes({ aberto, aoFechar, aoMudarStatus }: ModalAgendamentoTestesProps) {
  const { t } = useTranslation()
  const [dados, setDados] = useState({
    agendamentoAutomatico: 'Desativado',
    frequencia: 'Manual',
    hora: '00h',
    minuto: '00min',
    tipos: { unitarios: true, funcionais: true, e2e: false },
    ambiente: 'Local'
  })

  const [dadosManual, setDadosManual] = useState({
    tipos: { unitarios: true, funcionais: false, e2e: false },
    ambiente: 'Local'
  })

  const [alertas, setAlertas] = useState([
    { id: '1', nome: 'Daniel Martins', contato: 'daniel@empresa.com', condicao: 'Apenas Falhas', canal: 'E-mail + Push' },
    { id: '2', nome: 'Engenharia QA', contato: '+551199999999', condicao: 'Todos os Testes', canal: 'WhatsApp' }
  ])

  const [mostrarFormAlerta, setMostrarFormAlerta] = useState(false)
  const [novoAlerta, setNovoAlerta] = useState({ nome: '', contato: '', condicao: 'Apenas Falhas', canal: 'E-mail' })
  const [isDirty, setIsDirty] = useState(false)

  const handleAdicionarAlerta = () => {
    if (!novoAlerta.nome || !novoAlerta.contato) return
    setAlertas([...alertas, { id: Date.now().toString(), ...novoAlerta }])
    setMostrarFormAlerta(false)
    setNovoAlerta({ nome: '', contato: '', condicao: 'Apenas Falhas', canal: 'E-mail' })
    setIsDirty(true) // Agora sim está dirty!
  }

  const handleSalvar = () => {
    if (aoMudarStatus) {
      aoMudarStatus(dados.agendamentoAutomatico === 'Ativado')
    }
    setIsDirty(false)
    aoFechar()
  }

  const updateDados = (updates: any) => {
    setDados(prev => ({ ...prev, ...updates }))
    setIsDirty(true)
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

  const colunasAlertas: any[] = [
    { key: 'nome', label: 'NOME', tipo: 'texto' },
    { key: 'contato', label: 'CONTATO', tipo: 'texto' },
    { key: 'condicao', label: 'AVISO (CONDIÇÃO)', tipo: 'texto' },
    { key: 'canal', label: 'CANAL', tipo: 'texto' }
  ]

  const abas: AbaFormulario[] = [
    {
      id: 'config',
      rotulo: t('admin.tests.agendamento.aba_config'),
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          {/* Banner Info - Refinado para estética Premium */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem 1.25rem', borderRadius: '12px',
            background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, rgba(56, 189, 248, 0.03) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            color: '#bae6fd', fontSize: '0.85rem',
            lineHeight: '1.4'
          }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Info size={16} weight="bold" color="#38bdf8" />
            </div>
            <span>{t('admin.tests.agendamento.config_banner')}</span>
          </div>

          {/* Agendamento Automático */}
          <div className="em-grid">
            <GeralCampoGlobal label={t('admin.tests.agendamento.campo_agendamento_automatico')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '200px' }}>
                  <SelectGlobal
                    opcoes={opcoesAtivacao}
                    valor={dados.agendamentoAutomatico}
                    aoMudarValor={v => updateDados({ agendamentoAutomatico: String(v) })}
                  />
                </div>
                <span style={{ color: dados.agendamentoAutomatico === 'Ativado' ? '#10b981' : '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                  {t('admin.tests.agendamento.status_label')}: {dados.agendamentoAutomatico === 'Ativado' ? t('admin.tests.agendamento.status_ativado_label') : t('admin.tests.agendamento.status_desativado_label')}
                </span>
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Frequência & Hora */}
          <div className="em-grid em-grid--2">
            <GeralCampoGlobal label={t('admin.tests.agendamento.campo_frequencia')}>
              <SelectGlobal
                opcoes={opcoesFrequencia}
                valor={dados.frequencia}
                aoMudarValor={v => updateDados({ frequencia: String(v) })}
              />
            </GeralCampoGlobal>
            <GeralCampoGlobal label={t('admin.tests.agendamento.campo_hora')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SelectGlobal
                  opcoes={opcoesHora}
                  valor={dados.hora}
                  aoMudarValor={v => updateDados({ hora: String(v) })}
                />
                <span style={{ color: '#475569', fontWeight: 700 }}>:</span>
                <SelectGlobal
                  opcoes={opcoesMinuto}
                  valor={dados.minuto}
                  aoMudarValor={v => updateDados({ minuto: String(v) })}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Tipos de Teste - CORRIGIDO LAYOUT */}
          <div className="em-grid">
            <GeralCampoGlobal label={t('admin.tests.agendamento.campo_tipos_teste')}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '1.5rem', 
                marginTop: '0.5rem',
                flexWrap: 'nowrap'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={dados.tipos.unitarios} onChange={e => updateDados({tipos: {...dados.tipos, unitarios: e.target.checked}})} 
                         style={{ accentColor: '#6366f1', width: '18px', height: '18px', borderRadius: '4px' }} />
                  <span>UNITÁRIOS</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={dados.tipos.funcionais} onChange={e => updateDados({tipos: {...dados.tipos, funcionais: e.target.checked}})}
                         style={{ accentColor: '#6366f1', width: '18px', height: '18px', borderRadius: '4px' }} />
                  <span>🧪 FUNCIONAIS</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={dados.tipos.e2e} onChange={e => updateDados({tipos: {...dados.tipos, e2e: e.target.checked}})}
                         style={{ accentColor: '#6366f1', width: '18px', height: '18px', borderRadius: '4px' }} />
                  <span>🖥️ END-TO-END</span>
                </label>
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Ambiente */}
          <div className="em-grid" style={{ width: '50%' }}>
            <GeralCampoGlobal label={t('admin.tests.agendamento.campo_ambiente')}>
              <SelectGlobal
                opcoes={opcoesAmbiente}
                valor={dados.ambiente}
                aoMudarValor={v => updateDados({ ambiente: String(v) })}
              />
            </GeralCampoGlobal>
          </div>
        </div>
      )
    },
    {
      id: 'notificacoes',
      rotulo: t('admin.tests.agendamento.aba_notificacoes'),
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.1em' }}>
              <EnvelopeSimple size={14} weight="fill" /> DESTINATÁRIOS DE ALERTAS
            </h4>
            <button 
              onClick={() => setMostrarFormAlerta(!mostrarFormAlerta)}
              style={{ 
                background: mostrarFormAlerta ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
                border: `1px solid ${mostrarFormAlerta ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`, 
                color: mostrarFormAlerta ? '#f87171' : '#818cf8', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {mostrarFormAlerta ? t('comum.cancelar') : t('admin.tests.agendamento.btn_novo_alerta')}
            </button>
          </div>

          {mostrarFormAlerta && (
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(99, 102, 241, 0.3)', 
              borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' 
            }}>
              <GeralCampoGlobal label={t('admin.tests.agendamento.campo_nome_receptor')}>
                <input 
                  className="ws-input-pure"
                  placeholder="Ex: João Silva" 
                  value={novoAlerta.nome}
                  onChange={e => setNovoAlerta({...novoAlerta, nome: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </GeralCampoGlobal>
              <GeralCampoGlobal label={t('admin.tests.agendamento.campo_contato')}>
                <input 
                  className="ws-input-pure"
                  placeholder="joao@email.com" 
                  value={novoAlerta.contato}
                  onChange={e => setNovoAlerta({...novoAlerta, contato: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </GeralCampoGlobal>
              <GeralCampoGlobal label={t('admin.tests.agendamento.campo_condicao')}>
                <SelectGlobal 
                  opcoes={[{valor: 'Apenas Falhas', rotulo: 'Apenas Falhas'}, {valor: 'Todos os Testes', rotulo: 'Todos os Testes'}]}
                  valor={novoAlerta.condicao}
                  aoMudarValor={v => setNovoAlerta({...novoAlerta, condicao: String(v)})}
                />
              </GeralCampoGlobal>
              <GeralCampoGlobal label={t('admin.tests.agendamento.campo_canal')}>
                <SelectGlobal 
                  opcoes={[{valor: 'E-mail', rotulo: 'E-mail'}, {valor: 'WhatsApp', rotulo: 'WhatsApp'}, {valor: 'Todos', rotulo: 'Todos'}]}
                  valor={novoAlerta.canal}
                  aoMudarValor={v => setNovoAlerta({...novoAlerta, canal: String(v)})}
                />
              </GeralCampoGlobal>
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleAdicionarAlerta}
                  style={{ background: '#6366f1', color: '#fff', padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('admin.tests.agendamento.btn_adicionar_destinatario')}
                </button>
              </div>
            </div>
          )}

          <div style={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', overflow: 'hidden' }}>
            <TabelaGlobal 
              dados={alertas}
              colunas={colunasAlertas}
              idKey="id"
              mensagemVazio="Nenhum alerta configurado."
            />
          </div>
        </div>
      )
    },
    {
      id: 'manual',
      rotulo: t('admin.tests.agendamento.aba_manual'),
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            <Play size={14} weight="fill" /> DISPARO SOB DEMANDA
          </h4>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <GeralCampoGlobal label={t('admin.tests.agendamento.campo_selecione_tipos')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={dadosManual.tipos.unitarios} onChange={e => setDadosManual({...dadosManual, tipos: {...dadosManual.tipos, unitarios: e.target.checked}})}
                           style={{ accentColor: '#38bdf8', width: '17px', height: '17px' }} />
                    Unitários
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={dadosManual.tipos.funcionais} onChange={e => setDadosManual({...dadosManual, tipos: {...dadosManual.tipos, funcionais: e.target.checked}})}
                           style={{ accentColor: '#38bdf8', width: '17px', height: '17px' }} />
                    🧪 Funcionais
                  </label>
                </div>
              </GeralCampoGlobal>

              <GeralCampoGlobal label={t('admin.tests.agendamento.campo_ambiente_origem')}>
                <div style={{ width: '100%' }}>
                  <SelectGlobal
                    opcoes={opcoesAmbiente}
                    valor={dadosManual.ambiente}
                    aoMudarValor={v => setDadosManual({ ...dadosManual, ambiente: String(v) })}
                  />
                </div>
              </GeralCampoGlobal>
            </div>

            <button
              type="button"
              className="mg-btn-manual-exec"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 2rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff', fontSize: '0.95rem', fontWeight: 700, border: 'none',
                cursor: 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                width: 'max-content', transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Play size={20} weight="fill" /> {t('admin.tests.agendamento.btn_executar')}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'historico',
      rotulo: t('admin.tests.agendamento.aba_monitoramento'),
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#eab308', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            <Clock size={14} weight="duotone" /> STATUS DO AGENDADOR
          </h4>
          
          <div className="em-grid em-grid--2">
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('admin.tests.agendamento.proxima_execucao')}</span>
              <span style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 300 }}>{t('admin.tests.agendamento.proxima_execucao_valor')}</span>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('admin.tests.agendamento.frequencia_cron')}</span>
              <code style={{ color: '#38bdf8', fontSize: '1rem', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>* * * * *</code>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: '#475569', marginBottom: '1rem' }}><List size={48} weight="thin" style={{ margin: '0 auto' }} /></div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('admin.tests.agendamento.vazio_execucoes')}</p>
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
      icone={<Clock weight="fill" size={24} color="#6366f1" />}
      titulo={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>{t('admin.tests.agendamento.titulo')}</span>
          <span style={{
            fontSize: '0.625rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '2px 8px',
            borderRadius: '6px',
            background: dados.agendamentoAutomatico === 'Ativado' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${dados.agendamentoAutomatico === 'Ativado' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: dados.agendamentoAutomatico === 'Ativado' ? '#10b981' : '#94a3b8'
          }}>
            {dados.agendamentoAutomatico === 'Ativado' ? t('admin.tests.agendamento.status_ativo') : t('admin.tests.agendamento.status_inativo')}
          </span>
        </div> as any
      }
      subtitulo={t('admin.tests.agendamento.subtitulo')}
      dirty={isDirty}
      podesSalvar={isDirty}
      tamanho="lg"
      altura="720px"
      abas={abas}
      tipoAbas="pill"
    />
  )
}
