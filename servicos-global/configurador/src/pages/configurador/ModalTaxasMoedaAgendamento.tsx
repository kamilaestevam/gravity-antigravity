import React, { useState, useEffect } from 'react'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { Clock, Info, List } from '@phosphor-icons/react'
import { useShellStore } from '@gravity/shell'
import {
  adminTaxasMoedaAgendamentoApi,
  type TaxaMoedaAgendamentoConfigApi,
  type TipoAgendamentoTaxaMoedaApi,
} from '../../services/api-client'
import { isGravityApiError } from '../../utils/gravity-api-error'
import {
  taxaMoedaAgendamentoResponseSchema,
  PTAX_HORARIOS_BRT_UI,
  PTAX_MINUTO_BRT_UI,
} from '../../shared/taxas-moeda-agendamento-schema'

export interface ModalTaxasMoedaAgendamentoProps {
  aberto: boolean
  tipo: TipoAgendamentoTaxaMoedaApi
  aoFechar: () => void
  aoMudarStatus?: (ativo: boolean) => void
}

interface DadosAgendamento {
  agendamentoAutomatico: 'Ativado' | 'Desativado'
  frequencia: 'Manual' | 'Diario' | 'Semanal'
  hora: string
  minuto: string
}

function mensagemErroAgendamento(err: unknown): string {
  if (isGravityApiError(err)) return err.message
  if (err instanceof Error && err.message) return err.message
  return 'Falha ao carregar agendamento'
}

function fmtDataHora(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function ModalTaxasMoedaAgendamento({
  aberto,
  tipo,
  aoFechar,
  aoMudarStatus,
}: ModalTaxasMoedaAgendamentoProps) {
  const addNotification = useShellStore(s => s.addNotification)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [configOriginal, setConfigOriginal] = useState<TaxaMoedaAgendamentoConfigApi | null>(null)
  const [horariosPtax, setHorariosPtax] = useState<number[]>([...PTAX_HORARIOS_BRT_UI])

  const [dados, setDados] = useState<DadosAgendamento>({
    agendamentoAutomatico: 'Desativado',
    frequencia: tipo === 'ptax' ? 'Diario' : 'Semanal',
    hora: tipo === 'ptax' ? '10h' : '22h',
    minuto: tipo === 'ptax' ? '03min' : '00min',
  })

  useEffect(() => {
    if (!aberto) return
    setCarregando(true)
    adminTaxasMoedaAgendamentoApi.obter(tipo)
      .then(raw => {
        const config = taxaMoedaAgendamentoResponseSchema.parse(raw)
        setConfigOriginal(config)
        setHorariosPtax(config.horarios_ptax_brt ?? [...PTAX_HORARIOS_BRT_UI])
        setDados({
          agendamentoAutomatico: config.ativo ? 'Ativado' : 'Desativado',
          frequencia: config.frequencia,
          hora: tipo === 'ptax' ? '10h' : `${String(config.hora).padStart(2, '0')}h`,
          minuto: tipo === 'ptax' ? '03min' : `${String(config.minuto).padStart(2, '0')}min`,
        })
        setIsDirty(false)
      })
      .catch((err: unknown) => addNotification({
        type: 'error',
        message: mensagemErroAgendamento(err),
      }))
      .finally(() => setCarregando(false))
  }, [aberto, tipo, addNotification])

  const updateDados = (updates: Partial<DadosAgendamento>) => {
    setDados(prev => ({ ...prev, ...updates }))
    setIsDirty(true)
  }

  const handleSalvar = async () => {
    const ativo = dados.agendamentoAutomatico === 'Ativado'
    const horaNum = parseInt(dados.hora.replace('h', ''), 10)
    const minutoNum = parseInt(dados.minuto.replace('min', ''), 10)

    const horaSalvar = tipo === 'ptax' ? 10 : (isNaN(horaNum) ? 0 : horaNum)
    const minutoSalvar = tipo === 'ptax' ? PTAX_MINUTO_BRT_UI : (isNaN(minutoNum) ? 0 : minutoNum)

    setSalvando(true)
    try {
      await adminTaxasMoedaAgendamentoApi.salvar(tipo, {
        ativo,
        frequencia: dados.frequencia,
        hora: horaSalvar,
        minuto: minutoSalvar,
        alertas: configOriginal?.alertas ?? [],
      })
      addNotification({ type: 'success', message: 'Agendamento salvo com sucesso' })
      if (aoMudarStatus) aoMudarStatus(ativo)
      setIsDirty(false)
      aoFechar()
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao salvar agendamento',
      })
    } finally {
      setSalvando(false)
    }
  }

  const opcoesAtivacao = [
    { valor: 'Desativado', rotulo: 'Desativado' },
    { valor: 'Ativado', rotulo: 'Ativado' },
  ]

  const opcoesFrequenciaPtax = [
    { valor: 'Manual', rotulo: 'Manual' },
    { valor: 'Diario', rotulo: 'Diário (4 boletins PTAX)' },
  ]

  const opcoesFrequenciaFocus = [
    { valor: 'Manual', rotulo: 'Manual' },
    { valor: 'Semanal', rotulo: 'Semanal' },
    { valor: 'Diario', rotulo: 'Diário' },
  ]

  const opcoesHora = Array.from({ length: 24 }, (_, i) => ({
    valor: `${i.toString().padStart(2, '0')}h`,
    rotulo: `${i.toString().padStart(2, '0')}h`,
  }))

  const opcoesMinuto = Array.from({ length: 60 }, (_, i) => ({
    valor: `${i.toString().padStart(2, '0')}min`,
    rotulo: `${i.toString().padStart(2, '0')}min`,
  }))

  const tituloModal = tipo === 'ptax' ? 'Agendamento — Cotação Atual (PTAX)' : 'Agendamento — Cotação Futura (Focus)'
  const subtituloModal = tipo === 'ptax'
    ? 'Sincronização automática dos boletins BCB/PTAX em dias úteis'
    : 'Sincronização automática das projeções BACEN Focus'

  const bannerInfo = tipo === 'ptax'
    ? `Com agendamento ativado, o sistema sincroniza automaticamente em dias úteis às ${horariosPtax.map(h => `${h}h03`).join(', ')} (horário de Brasília), conforme publicação do BCB.`
    : 'O BACEN Focus consolida expectativas semanalmente. Recomenda-se frequência Semanal (ex.: terça 22h BRT). Apenas USD/BRL é publicado oficialmente.'

  const abas: AbaFormulario[] = [
    {
      id: 'config',
      rotulo: 'Configuração',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem 1.25rem', borderRadius: '12px',
            background: 'linear-gradient(90deg, rgba(56,189,248,0.08) 0%, rgba(56,189,248,0.03) 100%)',
            border: '1px solid rgba(56,189,248,0.15)', color: '#bae6fd', fontSize: '0.85rem', lineHeight: 1.4,
          }}>
            <div style={{ background: 'rgba(56,189,248,0.2)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Info size={16} weight="bold" color="#38bdf8" />
            </div>
            <span>{bannerInfo}</span>
          </div>

          <div className="em-grid">
            <CampoGeralGlobal label="Agendamento automático">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '200px' }}>
                  <SelectGlobal
                    opcoes={opcoesAtivacao}
                    valor={dados.agendamentoAutomatico}
                    aoMudarValor={v => {
                      if (v != null) updateDados({ agendamentoAutomatico: String(v) as DadosAgendamento['agendamentoAutomatico'] })
                    }}
                  />
                </div>
                <span style={{
                  color: dados.agendamentoAutomatico === 'Ativado' ? '#10b981' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  {dados.agendamentoAutomatico === 'Ativado' ? 'Ativado' : 'Desativado'}
                </span>
              </div>
            </CampoGeralGlobal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: tipo === 'focus' ? '1fr 1fr 1fr' : '1fr', gap: '1rem' }}>
            <CampoGeralGlobal label="Frequência">
              <SelectGlobal
                opcoes={tipo === 'ptax' ? opcoesFrequenciaPtax : opcoesFrequenciaFocus}
                valor={dados.frequencia}
                aoMudarValor={v => { if (v != null) updateDados({ frequencia: String(v) as DadosAgendamento['frequencia'] }) }}
              />
            </CampoGeralGlobal>

            {tipo === 'focus' && (
              <>
                <div style={{
                  opacity: dados.frequencia === 'Manual' ? 0.4 : 1,
                  pointerEvents: dados.frequencia === 'Manual' ? 'none' : 'auto',
                  transition: 'opacity 0.15s',
                }}>
                  <CampoGeralGlobal label="Hora (BRT)">
                    <SelectGlobal
                      opcoes={opcoesHora}
                      valor={dados.hora}
                      aoMudarValor={v => { if (v != null) updateDados({ hora: String(v) }) }}
                    />
                  </CampoGeralGlobal>
                </div>
                <div style={{
                  opacity: dados.frequencia === 'Manual' ? 0.4 : 1,
                  pointerEvents: dados.frequencia === 'Manual' ? 'none' : 'auto',
                  transition: 'opacity 0.15s',
                }}>
                  <CampoGeralGlobal label="Minuto">
                    <SelectGlobal
                      opcoes={opcoesMinuto}
                      valor={dados.minuto}
                      aoMudarValor={v => { if (v != null) updateDados({ minuto: String(v) }) }}
                    />
                  </CampoGeralGlobal>
                </div>
              </>
            )}
          </div>

          {tipo === 'ptax' && dados.frequencia === 'Diario' && (
            <div style={{
              background: 'rgba(15,23,42,0.3)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '0.875rem 1.25rem',
              fontSize: '0.85rem',
              color: '#94a3b8',
            }}>
              Horários fixos do BCB:{' '}
              <strong style={{ color: '#38bdf8' }}>
                {horariosPtax.map(h => `${String(h).padStart(2, '0')}h03`).join(' · ')}
              </strong>{' '}
              — America/Sao_Paulo
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'monitoramento',
      rotulo: 'Monitoramento',
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <h4 style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
            color: '#eab308', letterSpacing: '0.1em', marginBottom: '0.5rem',
          }}>
            <Clock size={14} weight="duotone" /> Status do agendamento
          </h4>

          <div className="em-grid em-grid--2">
            <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status</span>
              <span style={{ color: dados.agendamentoAutomatico === 'Ativado' ? '#10b981' : '#94a3b8', fontSize: '1.1rem', fontWeight: 600 }}>
                {dados.agendamentoAutomatico === 'Ativado' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Última execução</span>
              <span style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 300 }}>
                {fmtDataHora(configOriginal?.ultima_execucao ?? null)}
              </span>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Frequência</span>
              <span style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 300 }}>{dados.frequencia}</span>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Configuração salva em</span>
              <span style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 300 }}>
                {fmtDataHora(configOriginal?.atualizado_em ?? null)}
              </span>
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: '#475569', marginBottom: '1rem' }}><List size={48} weight="thin" style={{ margin: '0 auto' }} /></div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Use o botão Sincronizar na tela principal para execução manual imediata.
            </p>
          </div>
        </div>
      ),
    },
  ]

  if (carregando && aberto) {
    return null
  }

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Clock weight="fill" size={24} color="#6366f1" />}
      titulo={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>{tituloModal}</span>
          <span style={{
            fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.05em', padding: '2px 8px', borderRadius: '6px',
            background: dados.agendamentoAutomatico === 'Ativado' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${dados.agendamentoAutomatico === 'Ativado' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: dados.agendamentoAutomatico === 'Ativado' ? '#10b981' : '#94a3b8',
          }}>
            {dados.agendamentoAutomatico === 'Ativado' ? 'Ativo' : 'Inativo'}
          </span>
        </div> as unknown as string
      }
      subtitulo={subtituloModal}
      dirty={isDirty}
      podesSalvar={isDirty && !salvando}
      tamanho="lg"
      altura="640px"
      abas={abas}
      tipoAbas="pill"
    />
  )
}
