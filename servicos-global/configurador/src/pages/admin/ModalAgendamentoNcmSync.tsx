import React, { useState, useEffect } from 'react'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { TabelaGlobal } from '@nucleo/tabela-global'
import { Clock, Info, EnvelopeSimple, Play, List, CheckCircle, XCircle, SpinnerGap } from '@phosphor-icons/react'
import { useShellStore } from '@gravity/shell'
import {
  adminNcmApi,
  type NcmNotificador,
  type NcmScheduleConfigApi,
  type NcmExecuteResultado,
} from '../../services/apiClient'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cronParaHoraMinuto(cron: string): { hora: string; minuto: string; frequencia: string } {
  // Formato: "minuto hora * * *" ou "minuto hora * * dia-semana"
  const partes = cron.trim().split(/\s+/)
  if (partes.length < 5) return { hora: '02h', minuto: '00min', frequencia: 'Diario' }
  const min  = partes[0].padStart(2, '0')
  const hora = partes[1].padStart(2, '0')
  const dow  = partes[4]
  const freq = dow !== '*' ? 'Semanal' : 'Diario'
  return { hora: `${hora}h`, minuto: `${min}min`, frequencia: freq }
}

function horaMinutoCron(frequencia: string, hora: string, minuto: string): string {
  const h = hora.replace('h', '').padStart(2, '0')
  const m = minuto.replace('min', '').padStart(2, '0')
  if (frequencia === 'Semanal') return `${m} ${h} * * 1`   // segunda-feira
  return `${m} ${h} * * *`
}

function formatDatetime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ModalAgendamentoNcmSyncProps {
  aberto:          boolean
  aoFechar:        () => void
  aoMudarStatus?:  (ativo: boolean) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ModalAgendamentoNcmSync({ aberto, aoFechar, aoMudarStatus }: ModalAgendamentoNcmSyncProps) {
  const addNotification = useShellStore((s) => s.addNotification)

  // ── Estado da configuração ────────────────────────────────────────────────
  const [carregando, setCarregando]     = useState(true)
  const [salvando,   setSalvando]       = useState(false)
  const [isDirty,    setIsDirty]        = useState(false)
  const [configOriginal, setConfigOriginal] = useState<NcmScheduleConfigApi | null>(null)

  const [ativo,      setAtivo]      = useState(false)
  const [frequencia, setFrequencia] = useState('Diario')
  const [hora,       setHora]       = useState('02h')
  const [minuto,     setMinuto]     = useState('00min')

  // ── Estado de notificadores ───────────────────────────────────────────────
  const [notificadores,      setNotificadores]      = useState<NcmNotificador[]>([])
  const [mostrarFormAlerta,  setMostrarFormAlerta]  = useState(false)
  const [novoNotificador,    setNovoNotificador]    = useState<Omit<NcmNotificador, 'id'>>({
    nome: '', contato: '', condicao: 'Apenas Erros', canal: 'E-mail',
  })

  // ── Estado de execução manual ─────────────────────────────────────────────
  const [executando,        setExecutando]        = useState(false)
  const [resultadoExecucao, setResultadoExecucao] = useState<NcmExecuteResultado[] | null>(null)
  const [erroExecucao,      setErroExecucao]      = useState<string | null>(null)

  // ── Carregar config do backend ────────────────────────────────────────────
  useEffect(() => {
    if (!aberto) return
    setCarregando(true)
    adminNcmApi.getSchedule()
      .then((config) => {
        setConfigOriginal(config)
        setAtivo(config.ativo)
        const parsed = cronParaHoraMinuto(config.cron_expressao)
        setFrequencia(parsed.frequencia)
        setHora(parsed.hora)
        setMinuto(parsed.minuto)
        setNotificadores(Array.isArray(config.notificadores) ? config.notificadores : [])
        setIsDirty(false)
      })
      .catch(() => addNotification({ type: 'error', message: 'Falha ao carregar configuração de agendamento.' }))
      .finally(() => setCarregando(false))
  }, [aberto, addNotification])

  // ── Helpers de atualização ────────────────────────────────────────────────
  const markDirty = () => setIsDirty(true)

  const updateAtivo = (v: boolean) => { setAtivo(v); markDirty() }
  const updateFreq  = (v: string)  => { setFrequencia(v); markDirty() }
  const updateHora  = (v: string)  => { setHora(v); markDirty() }
  const updateMin   = (v: string)  => { setMinuto(v); markDirty() }

  const handleAdicionarNotificador = () => {
    if (!novoNotificador.nome || !novoNotificador.contato) return
    setNotificadores(prev => [...prev, { id: Date.now().toString(), ...novoNotificador }])
    setNovoNotificador({ nome: '', contato: '', condicao: 'Apenas Erros', canal: 'E-mail' })
    setMostrarFormAlerta(false)
    markDirty()
  }

  const handleRemoverNotificador = (id: string) => {
    setNotificadores(prev => prev.filter(n => n.id !== id))
    markDirty()
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSalvar = async () => {
    setSalvando(true)
    try {
      const cron_expressao = horaMinutoCron(frequencia, hora, minuto)
      await adminNcmApi.saveSchedule({ ativo, cron_expressao, notificadores })
      addNotification({ type: 'success', message: 'Agendamento NCM salvo com sucesso.' })
      if (aoMudarStatus) aoMudarStatus(ativo)
      setIsDirty(false)
      aoFechar()
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Falha ao salvar agendamento.' })
    } finally {
      setSalvando(false)
    }
  }

  // ── Execução manual ───────────────────────────────────────────────────────
  const handleExecutarManual = async () => {
    setExecutando(true)
    setResultadoExecucao(null)
    setErroExecucao(null)
    try {
      const res = await adminNcmApi.executeManual()  // executa todos os tenants
      setResultadoExecucao(res.resultados)
      addNotification({
        type: res.resultados.every(r => r.sucesso) ? 'success' : 'warning',
        message: `Execução manual concluída: ${res.tenants_executados} tenant(s) processado(s).`,
      })
    } catch (err) {
      setErroExecucao(err instanceof Error ? err.message : 'Erro na execução manual.')
      addNotification({ type: 'error', message: 'Falha na execução manual do NCM.' })
    } finally {
      setExecutando(false)
    }
  }

  // ── Opções ────────────────────────────────────────────────────────────────
  const opcoesAtivacao  = [{ valor: 'false', rotulo: 'Desativado' }, { valor: 'true', rotulo: 'Ativado' }]
  const opcoesFrequencia = [{ valor: 'Diario', rotulo: 'Diário' }, { valor: 'Semanal', rotulo: 'Semanal (Segunda)' }]
  const opcoesHora   = Array.from({ length: 24 }, (_, i) => ({ valor: `${i.toString().padStart(2,'0')}h`, rotulo: `${i.toString().padStart(2,'0')}h` }))
  const opcoesMinuto = Array.from({ length: 60 }, (_, i) => ({ valor: `${i.toString().padStart(2,'0')}min`, rotulo: `${i.toString().padStart(2,'0')}min` }))
  const opcoesCondicao = [{ valor: 'Apenas Erros', rotulo: 'Apenas Erros' }, { valor: 'Sempre', rotulo: 'Sempre' }]
  const opcoesCanal    = [{ valor: 'E-mail', rotulo: 'E-mail' }, { valor: 'WhatsApp', rotulo: 'WhatsApp' }, { valor: 'Ambos', rotulo: 'Ambos' }]

  const cronExpressaoAtual = horaMinutoCron(frequencia, hora, minuto)

  // ── Colunas tabela notificadores ──────────────────────────────────────────
  const colunasNotificadores: Array<{ key: string; label: string; tipo: string; render?: (v: unknown, row: NcmNotificador) => React.ReactNode }> = [
    { key: 'nome',     label: 'NOME',     tipo: 'texto' },
    { key: 'contato',  label: 'CONTATO',  tipo: 'texto' },
    { key: 'condicao', label: 'CONDIÇÃO', tipo: 'texto' },
    { key: 'canal',    label: 'CANAL',    tipo: 'texto' },
    {
      key: 'id', label: '', tipo: 'texto',
      render: (_v, row) => (
        <button
          onClick={() => handleRemoverNotificador(row.id)}
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Remover
        </button>
      ),
    },
  ]

  // ── Abas ──────────────────────────────────────────────────────────────────
  const abas: AbaFormulario[] = [
    {
      id: 'config',
      rotulo: 'Configuração',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          {/* Banner informativo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem 1.25rem', borderRadius: '12px',
            background: 'linear-gradient(90deg, rgba(56,189,248,0.08) 0%, rgba(56,189,248,0.03) 100%)',
            border: '1px solid rgba(56,189,248,0.15)', color: '#bae6fd', fontSize: '0.85rem', lineHeight: '1.4',
          }}>
            <div style={{ background: 'rgba(56,189,248,0.2)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Info size={16} weight="bold" color="#38bdf8" />
            </div>
            <span>O job sincroniza automaticamente a tabela NCM do Portal Único Siscomex para todos os tenants ativos. A tabela Siscomex é atualizada à meia-noite.</span>
          </div>

          {/* Ativação */}
          <div className="em-grid">
            <GeralCampoGlobal label="Agendamento Automático">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '200px' }}>
                  <SelectGlobal
                    opcoes={opcoesAtivacao}
                    valor={String(ativo)}
                    aoMudarValor={v => updateAtivo(v === 'true')}
                  />
                </div>
                <span style={{ color: ativo ? '#10b981' : '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                  Status: {ativo ? 'Ativado' : 'Desativado'}
                </span>
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Frequência & Hora */}
          <div className="em-grid em-grid--2">
            <GeralCampoGlobal label="Frequência">
              <SelectGlobal opcoes={opcoesFrequencia} valor={frequencia} aoMudarValor={v => updateFreq(String(v))} />
            </GeralCampoGlobal>
            <GeralCampoGlobal label="Hora de execução">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SelectGlobal opcoes={opcoesHora}   valor={hora}   aoMudarValor={v => updateHora(String(v))} />
                <span style={{ color: '#475569', fontWeight: 700 }}>:</span>
                <SelectGlobal opcoes={opcoesMinuto} valor={minuto} aoMudarValor={v => updateMin(String(v))} />
              </div>
            </GeralCampoGlobal>
          </div>

          {/* Preview da expressão cron */}
          <div style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Expressão Cron:</span>
            <code style={{ color: '#38bdf8', fontSize: '0.9rem', background: 'rgba(56,189,248,0.1)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {cronExpressaoAtual}
            </code>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>— America/Sao_Paulo</span>
          </div>
        </div>
      ),
    },
    {
      id: 'notificacoes',
      rotulo: 'Notificadores',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.1em' }}>
              <EnvelopeSimple size={14} weight="fill" /> Destinatários de Alertas
            </h4>
            <button
              onClick={() => setMostrarFormAlerta(v => !v)}
              style={{
                background: mostrarFormAlerta ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                border: `1px solid ${mostrarFormAlerta ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`,
                color: mostrarFormAlerta ? '#f87171' : '#818cf8',
                padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              {mostrarFormAlerta ? 'Cancelar' : '+ Novo Destinatário'}
            </button>
          </div>

          {mostrarFormAlerta && (
            <div style={{
              background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
            }}>
              <GeralCampoGlobal label="Nome">
                <input
                  placeholder="Nome do destinatário"
                  value={novoNotificador.nome}
                  onChange={e => setNovoNotificador(p => ({ ...p, nome: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.875rem' }}
                />
              </GeralCampoGlobal>
              <GeralCampoGlobal label="Contato (e-mail ou telefone)">
                <input
                  placeholder="email@empresa.com ou +5511..."
                  value={novoNotificador.contato}
                  onChange={e => setNovoNotificador(p => ({ ...p, contato: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.875rem' }}
                />
              </GeralCampoGlobal>
              <GeralCampoGlobal label="Condição de envio">
                <SelectGlobal
                  opcoes={opcoesCondicao}
                  valor={novoNotificador.condicao}
                  aoMudarValor={v => setNovoNotificador(p => ({ ...p, condicao: String(v) as NcmNotificador['condicao'] }))}
                />
              </GeralCampoGlobal>
              <GeralCampoGlobal label="Canal">
                <SelectGlobal
                  opcoes={opcoesCanal}
                  valor={novoNotificador.canal}
                  aoMudarValor={v => setNovoNotificador(p => ({ ...p, canal: String(v) as NcmNotificador['canal'] }))}
                />
              </GeralCampoGlobal>
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAdicionarNotificador}
                  style={{ background: '#6366f1', color: '#fff', padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Adicionar Destinatário
                </button>
              </div>
            </div>
          )}

          <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
            <TabelaGlobal
              dados={notificadores}
              colunas={colunasNotificadores as Parameters<typeof TabelaGlobal>[0]['colunas']}
              idKey="id"
              mensagemVazio="Nenhum destinatário configurado. Clique em '+ Novo Destinatário' para adicionar."
            />
          </div>
        </div>
      ),
    },
    {
      id: 'manual',
      rotulo: 'Execução Manual',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            <Play size={14} weight="fill" /> Disparo Imediato
          </h4>

          <div style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1.25rem', borderRadius: '10px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', color: '#6ee7b7', fontSize: '0.85rem' }}>
              <Info size={16} weight="bold" color="#10b981" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span>Executa a sincronização NCM imediatamente para <strong>todos os tenants</strong> com dados cadastrados, com a mesma lógica do job automático.</span>
            </div>

            <button
              type="button"
              onClick={handleExecutarManual}
              disabled={executando}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 2rem', borderRadius: '12px',
                background: executando
                  ? 'rgba(16,185,129,0.3)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff', fontSize: '0.95rem', fontWeight: 700, border: 'none',
                cursor: executando ? 'not-allowed' : 'pointer',
                boxShadow: executando ? 'none' : '0 8px 16px rgba(16,185,129,0.2)',
                width: 'max-content', transition: 'all 0.2s',
              }}
            >
              {executando
                ? <><SpinnerGap size={20} weight="bold" style={{ animation: 'spin 1s linear infinite' }} /> Sincronizando…</>
                : <><Play size={20} weight="fill" /> Sincronizar Agora</>
              }
            </button>

            {/* Resultado da execução */}
            {erroExecucao && (
              <div style={{ padding: '0.875rem 1.25rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={16} weight="fill" color="#f87171" /> {erroExecucao}
              </div>
            )}

            {resultadoExecucao && resultadoExecucao.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Resultado — {resultadoExecucao.length} tenant(s)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {resultadoExecucao.map((r) => (
                    <div
                      key={r.tenant_id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                        borderRadius: '8px', fontSize: '0.82rem',
                        background: r.sucesso ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                        border: `1px solid ${r.sucesso ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                      }}
                    >
                      {r.sucesso
                        ? <CheckCircle size={14} weight="fill" color="#34d399" />
                        : <XCircle    size={14} weight="fill" color="#f87171" />
                      }
                      <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.78rem', flex: 1 }}>{r.tenant_id}</span>
                      {r.sucesso ? (
                        <span style={{ color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                          {(r.total ?? 0).toLocaleString('pt-BR')} NCMs
                          {r.adicionados ? <span style={{ color: '#34d399' }}> +{r.adicionados}</span> : null}
                          {r.alterados   ? <span style={{ color: '#fbbf24' }}> ~{r.alterados}</span>   : null}
                          {r.removidos   ? <span style={{ color: '#f87171' }}> -{r.removidos}</span>   : null}
                          {' '}({r.duracaoMs}ms)
                        </span>
                      ) : (
                        <span style={{ color: '#f87171' }}>{r.erro}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'monitoramento',
      rotulo: 'Monitoramento',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#eab308', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            <Clock size={14} weight="duotone" /> Status do Agendamento
          </h4>

          <div className="em-grid em-grid--2">
            <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status</span>
              <span style={{ color: ativo ? '#10b981' : '#94a3b8', fontSize: '1.1rem', fontWeight: 600 }}>
                {ativo ? '● Ativo' : '○ Inativo'}
              </span>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Expressão Cron</span>
              <code style={{ color: '#38bdf8', fontSize: '1rem', background: 'rgba(56,189,248,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                {cronExpressaoAtual}
              </code>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Frequência</span>
              <span style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 300 }}>
                {frequencia === 'Semanal' ? `Semanal — ${hora}:${minuto.replace('min', '')}` : `Diário — ${hora}:${minuto.replace('min', '')}`}
              </span>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Última atualização config</span>
              <span style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 300 }}>
                {formatDatetime(configOriginal?.atualizado_em ?? null)}
              </span>
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: '#475569', marginBottom: '1rem' }}><List size={48} weight="thin" style={{ margin: '0 auto' }} /></div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Histórico detalhado de execuções disponível na página principal de Sincronização NCM.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Clock weight="fill" size={24} color="#6366f1" />}
      titulo={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Agendamento NCM</span>
          <span style={{
            fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.05em', padding: '2px 8px', borderRadius: '6px',
            background: ativo ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${ativo ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: ativo ? '#10b981' : '#94a3b8',
          }}>
            {ativo ? 'ATIVO' : 'INATIVO'}
          </span>
        </div> as unknown as string
      }
      subtitulo="Configure o job automático de sincronização da tabela NCM do Portal Único Siscomex"
      dirty={isDirty}
      podesSalvar={isDirty && !salvando}
      tamanho="lg"
      altura="720px"
      abas={abas}
      tipoAbas="pill"
    />
  )
}
