import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { Clock, Info, EnvelopeSimple, List } from '@phosphor-icons/react'
import { TabelaGlobal } from '@nucleo/tabela-global'
import { adminAgendamentosTesteApi } from '../../services/apiClient'
import { useShellStore } from '@gravity/shell'

export interface ModalAgendamentoTestesProps {
  aberto: boolean
  aoFechar: () => void
  aoMudarStatus?: (ativo: boolean) => void
}


interface DadosAgendamento {
  agendamentoAutomatico: 'Ativado' | 'Desativado'
  frequencia: 'Manual' | 'Diario' | 'Semanal'
  hora: string
  minuto: string
  tipos: { unitarios: boolean; funcionais: boolean; e2e: boolean }
  ambiente: 'Local' | 'Staging' | 'Producao'
}

interface ColunaAlerta {
  key: string
  label: string
  tipo: 'texto' | 'numero' | 'data' | 'select'
}

function cronParaDados(cron: string): Pick<DadosAgendamento, 'frequencia' | 'hora' | 'minuto'> {
  const FALLBACK = { frequencia: 'Manual' as const, hora: '00h', minuto: '00min' }
  const partes = cron.trim().split(/\s+/)
  if (partes.length < 5) return FALLBACK
  if (cron === '0 0 31 2 *') return FALLBACK
  const minNum  = parseInt(partes[0], 10)
  const horaNum = parseInt(partes[1], 10)
  if (isNaN(minNum) || isNaN(horaNum) || minNum < 0 || minNum > 59 || horaNum < 0 || horaNum > 23) return FALLBACK
  const freq: DadosAgendamento['frequencia'] = partes[4] !== '*' ? 'Semanal' : 'Diario'
  return {
    frequencia: freq,
    hora:   `${String(horaNum).padStart(2, '0')}h`,
    minuto: `${String(minNum).padStart(2, '0')}min`,
  }
}

export function ModalAgendamentoTestes({ aberto, aoFechar, aoMudarStatus }: ModalAgendamentoTestesProps) {
  const { t } = useTranslation()
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [dados, setDados] = useState<DadosAgendamento>({
    agendamentoAutomatico: 'Desativado',
    frequencia: 'Manual',
    hora: '00h',
    minuto: '00min',
    tipos: { unitarios: true, funcionais: true, e2e: false },
    ambiente: 'Local'
  })

  useEffect(() => {
    if (!aberto) return
    adminAgendamentosTesteApi.listar().then(({ schedules }) => {
      if (!schedules.length) return
      const s = schedules[0] as Record<string, unknown>
      const tipos = (s.tipos_agendamento_teste as Record<string, boolean> | undefined) ?? {}
      const horaNum   = Number(s.hora_agendamento_teste   ?? 0)
      const minutoNum = Number(s.minuto_agendamento_teste ?? 0)
      const alertasDb = (s.alertas_agendamento_teste as Array<Record<string, string>> | undefined) ?? []
      setScheduleId(String(s.id_agendamento_teste))
      setDados({
        agendamentoAutomatico: s.ativo_agendamento_teste ? 'Ativado' : 'Desativado',
        frequencia:            (s.frequencia_agendamento_teste as DadosAgendamento['frequencia']) ?? 'Manual',
        hora:                  `${String(horaNum).padStart(2, '0')}h`,
        minuto:                `${String(minutoNum).padStart(2, '0')}min`,
        tipos: {
          unitarios:  Boolean(tipos.uni),
          funcionais: Boolean(tipos.fun),
          e2e:        Boolean(tipos.e2e),
        },
        ambiente: (s.ambiente_agendamento_teste as DadosAgendamento['ambiente']) ?? 'Local',
      })
      if (alertasDb.length) {
        setAlertas(alertasDb.map((a, i) => ({
          id:       a.id ?? String(i),
          nome:     a.nome ?? '',
          contato:  a.contato ?? '',
          condicao: a.condicao ?? 'Apenas Falhas',
          canal:    a.canal ?? 'E-mail',
        })))
      }
      setIsDirty(false)
    }).catch(() => { /* ignora — mantém defaults */ })
  }, [aberto])

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

  const addNotification = useShellStore((s) => s.addNotification)

  const handleSalvar = async () => {
    const ativo = dados.agendamentoAutomatico === 'Ativado'

    const horaNum   = parseInt(dados.hora.replace('h', ''),    10)
    const minutoNum = parseInt(dados.minuto.replace('min', ''), 10)
    const horaVal   = isNaN(horaNum)   ? 0 : horaNum
    const minVal    = isNaN(minutoNum) ? 0 : minutoNum

    // Payload no formato do schema TesteAgendamento (DDD final 2026-05-03):
    // frequencia/hora/minuto separados, tipos como objeto, ambiente único.
    const payload = {
      ativo,
      frequencia: dados.frequencia,
      hora:       horaVal,
      minuto:     minVal,
      tipos: {
        uni: dados.tipos.unitarios,
        fun: dados.tipos.funcionais,
        e2e: dados.tipos.e2e,
      },
      escopos:  [],
      ambiente: dados.ambiente,
      alertas:  alertas.map(a => ({
        id:       a.id,
        nome:     a.nome,
        contato:  a.contato,
        condicao: a.condicao,
        canal:    a.canal,
      })),
    }

    try {
      if (scheduleId) {
        await adminAgendamentosTesteApi.atualizar(scheduleId, payload)
      } else {
        const res = await adminAgendamentosTesteApi.criar(payload)
        const newId = (res.schedule as Record<string, unknown>)?.id_agendamento_teste
        if (newId) setScheduleId(String(newId))
      }
      addNotification({ type: 'success', message: 'Agendamento salvo com sucesso' })
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao salvar agendamento' })
      return
    }

    if (aoMudarStatus) aoMudarStatus(ativo)
    setIsDirty(false)
    aoFechar()
  }

  const updateDados = (updates: Partial<DadosAgendamento>) => {
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

  const colunasAlertas: ColunaAlerta[] = [
    { key: 'nome', label: 'NOME', tipo: 'texto' },
    { key: 'contato', label: 'CONTATO', tipo: 'texto' },
    { key: 'condicao', label: 'AVISO (CONDIÇÃO)', tipo: 'texto' },
    { key: 'canal', label: 'CANAL', tipo: 'texto' }
  ]

  const abas: AbaFormulario[] = [
    {
      id: 'config',
      rotulo: t('admin.testes-gerais.agendamento.aba_config'),
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
            <span>{t('admin.testes-gerais.agendamento.banner_info')}</span>
          </div>

          {/* Agendamento Automático */}
          <div className="em-grid">
            <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_agendamento_automatico')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '200px' }}>
                  <SelectGlobal
                    opcoes={opcoesAtivacao}
                    valor={dados.agendamentoAutomatico}
                    aoMudarValor={v => { if (v != null) updateDados({ agendamentoAutomatico: String(v) as DadosAgendamento['agendamentoAutomatico'] }) }}
                  />
                </div>
                <span style={{ color: dados.agendamentoAutomatico === 'Ativado' ? '#10b981' : '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                  {t('admin.testes-gerais.agendamento.status_label')}: {dados.agendamentoAutomatico === 'Ativado' ? t('admin.testes-gerais.agendamento.status_ativado_label') : t('admin.testes-gerais.agendamento.status_desativado_label')}
                </span>
              </div>
            </CampoGeralGlobal>
          </div>

          {/* Frequência & Hora & Minuto — Hora/Minuto só fazem sentido se Frequência ≠ Manual */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_frequencia')}>
              <SelectGlobal
                opcoes={opcoesFrequencia}
                valor={dados.frequencia}
                aoMudarValor={v => { if (v != null) updateDados({ frequencia: String(v) as DadosAgendamento['frequencia'] }) }}
              />
            </CampoGeralGlobal>
            <div style={{ opacity: dados.frequencia === 'Manual' ? 0.4 : 1, pointerEvents: dados.frequencia === 'Manual' ? 'none' : 'auto', transition: 'opacity 0.15s' }}>
              <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_hora')}>
                <SelectGlobal
                  opcoes={opcoesHora}
                  valor={dados.hora}
                  aoMudarValor={v => { if (v != null) updateDados({ hora: String(v) }) }}
                />
              </CampoGeralGlobal>
            </div>
            <div style={{ opacity: dados.frequencia === 'Manual' ? 0.4 : 1, pointerEvents: dados.frequencia === 'Manual' ? 'none' : 'auto', transition: 'opacity 0.15s' }}>
              <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_minuto')}>
                <SelectGlobal
                  opcoes={opcoesMinuto}
                  valor={dados.minuto}
                  aoMudarValor={v => { if (v != null) updateDados({ minuto: String(v) }) }}
                />
              </CampoGeralGlobal>
            </div>
          </div>

          {/* Tipos de Teste - CORRIGIDO LAYOUT */}
          <div className="em-grid">
            <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_tipos_teste')}>
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
                  <span>{t('admin.testes-gerais.agendamento.tipo_unitarios')}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={dados.tipos.funcionais} onChange={e => updateDados({tipos: {...dados.tipos, funcionais: e.target.checked}})}
                         style={{ accentColor: '#6366f1', width: '18px', height: '18px', borderRadius: '4px' }} />
                  <span>🧪 {t('admin.testes-gerais.agendamento.tipo_funcionais')}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={dados.tipos.e2e} onChange={e => updateDados({tipos: {...dados.tipos, e2e: e.target.checked}})}
                         style={{ accentColor: '#6366f1', width: '18px', height: '18px', borderRadius: '4px' }} />
                  <span>🖥️ {t('admin.testes-gerais.agendamento.tipo_e2e')}</span>
                </label>
              </div>
            </CampoGeralGlobal>
          </div>

          {/* Ambiente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_ambiente')}>
              <SelectGlobal
                opcoes={opcoesAmbiente}
                valor={dados.ambiente}
                aoMudarValor={v => { if (v != null) updateDados({ ambiente: String(v) as DadosAgendamento['ambiente'] }) }}
              />
            </CampoGeralGlobal>
          </div>
        </div>
      )
    },
    {
      id: 'notificacoes',
      rotulo: t('admin.testes-gerais.agendamento.aba_notificacoes'),
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.1em' }}>
              <EnvelopeSimple size={14} weight="fill" /> {t('admin.testes-gerais.agendamento.secao_destinatarios')}
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
              {mostrarFormAlerta ? t('comum.cancelar') : t('admin.testes-gerais.agendamento.btn_novo_alerta')}
            </button>
          </div>

          {mostrarFormAlerta && (
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(99, 102, 241, 0.3)', 
              borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' 
            }}>
              <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_nome_receptor')}>
                <input 
                  className="ws-input-pure"
                  placeholder={t('admin.testes-gerais.agendamento.campo_nome_receptor_placeholder')}
                  value={novoAlerta.nome}
                  onChange={e => setNovoAlerta({...novoAlerta, nome: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </CampoGeralGlobal>
              <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_contato')}>
                <input 
                  className="ws-input-pure"
                  placeholder={t('admin.testes-gerais.agendamento.campo_contato_placeholder')}
                  value={novoAlerta.contato}
                  onChange={e => setNovoAlerta({...novoAlerta, contato: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </CampoGeralGlobal>
              <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_condicao')}>
                <SelectGlobal 
                  opcoes={[{valor: 'Apenas Falhas', rotulo: 'Apenas Falhas'}, {valor: 'Todos os Testes', rotulo: 'Todos os Testes'}]}
                  valor={novoAlerta.condicao}
                  aoMudarValor={v => setNovoAlerta({...novoAlerta, condicao: String(v)})}
                />
              </CampoGeralGlobal>
              <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_canal')}>
                <SelectGlobal 
                  opcoes={[{valor: 'E-mail', rotulo: 'E-mail'}, {valor: 'WhatsApp', rotulo: 'WhatsApp'}, {valor: 'Todos', rotulo: 'Todos'}]}
                  valor={novoAlerta.canal}
                  aoMudarValor={v => setNovoAlerta({...novoAlerta, canal: String(v)})}
                />
              </CampoGeralGlobal>
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleAdicionarAlerta}
                  style={{ background: '#6366f1', color: '#fff', padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('admin.testes-gerais.agendamento.btn_adicionar_destinatario')}
                </button>
              </div>
            </div>
          )}

          <div style={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', overflow: 'hidden' }}>
            <TabelaGlobal 
              dados={alertas}
              colunas={colunasAlertas}
              idKey="id"
              mensagemVazio={t('admin.testes-gerais.agendamento.alertas_vazio')}
            />
          </div>
        </div>
      )
    },
    {
      id: 'historico',
      rotulo: t('admin.testes-gerais.agendamento.aba_monitoramento'),
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#eab308', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            <Clock size={14} weight="duotone" /> {t('admin.testes-gerais.agendamento.secao_status')}
          </h4>
          
          <div className="em-grid em-grid--2">
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('admin.testes-gerais.agendamento.proxima_execucao')}</span>
              <span style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 300 }}>{t('admin.testes-gerais.agendamento.proxima_execucao_valor')}</span>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('admin.testes-gerais.agendamento.frequencia_cron')}</span>
              <code style={{ color: '#38bdf8', fontSize: '1rem', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>* * * * *</code>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: '#475569', marginBottom: '1rem' }}><List size={48} weight="thin" style={{ margin: '0 auto' }} /></div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('admin.testes-gerais.agendamento.vazio_execucoes')}</p>
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
          <span>{t('admin.testes-gerais.agendamento.titulo')}</span>
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
            {dados.agendamentoAutomatico === 'Ativado' ? t('admin.testes-gerais.agendamento.status_ativo') : t('admin.testes-gerais.agendamento.status_inativo')}
          </span>
        </div> as any
      }
      subtitulo={t('admin.testes-gerais.agendamento.subtitulo')}
      dirty={isDirty}
      podesSalvar={isDirty}
      tamanho="lg"
      altura="720px"
      abas={abas}
      tipoAbas="pill"
    />
  )
}
