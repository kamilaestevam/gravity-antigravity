import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { apiFetch, setAuthTokenProvider } from '../../services/api-client'
import {
  Desktop, User, Robot, FileCsv, FileCode, FileXls, FileText, FilePdf, Code,
  Info, Funnel, Warning, CheckCircle, ArrowsClockwise,
  Globe, Cpu, Gear, Hash, ListBullets, CalendarBlank, ChartPieSlice,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { caminhoParaLocalString } from '@nucleo/audit-locais'
import {
  exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarPDF, exportarJSON,
  type ColunasExport,
} from '@nucleo/export-utils'
import { useShellStore } from '@gravity/shell'

// ---------------------------------------------------------------------------
// Tipos canonical (DDD — paridade com fragment.prisma do historico-global)
// ---------------------------------------------------------------------------

type TipoAtorHistoricoLog = 'USUARIO' | 'API' | 'IA' | 'JOB' | 'INTEGRACAO'
type StatusHistoricoLog   = 'SUCESSO' | 'FALHA' | 'PARCIAL'
type StatusEventoAlerta   = 'PENDENTE' | 'REVISADO' | 'ESCALADO'

// Schema Zod do log de histórico — 21 campos, paridade 1:1 com model HistoricoLog
// (servicos-global/servicos-plataforma/historico-global/prisma/fragment.prisma).
// `email_ator_historico_log` é enriquecimento do proxy admin (lookup em prisma.usuario);
// fica como optional() porque não vem do banco de histórico.
const historicoLogSchema = z.object({
  id_historico_log:                 z.string(),
  data_criacao_historico_log:       z.string(),
  id_organizacao:                   z.string(),
  tipo_ator_historico_log:          z.enum(['USUARIO','API','IA','JOB','INTEGRACAO']),
  id_ator_historico_log:            z.string(),
  nome_ator_historico_log:          z.string(),
  ip_ator_historico_log:            z.string().nullable(),
  metadata_ator_historico_log:      z.record(z.unknown()).nullable(),
  modulo_historico_log:             z.string(),
  tipo_recurso_historico_log:       z.string(),
  id_recurso_historico_log:         z.string().nullable(),
  acao_historico_log:               z.string(),
  detalhe_acao_historico_log:       z.string(),
  estado_anterior_historico_log:    z.unknown().nullable(),
  estado_posterior_historico_log:   z.unknown().nullable(),
  status_historico_log:             z.enum(['SUCESSO','FALHA','PARCIAL']),
  mensagem_erro_historico_log:      z.string().nullable(),
  hash_integridade_historico_log:   z.string(),
  id_produto_historico_log:         z.string().nullable(),
  id_usuario:                       z.string().nullable(),
  email_ator_historico_log:         z.string().nullable().optional(),
})

type HistoricoLog = z.infer<typeof historicoLogSchema>

const listaHistoricoLogSchema = z.object({
  data: z.array(historicoLogSchema),
  meta: z.object({
    hasMore:    z.boolean(),
    nextCursor: z.string().nullable(),
    limit:      z.number(),
  }),
})

// Schema Zod do evento de alerta — paridade com model AlertaData + relation regra_evento_alerta.
const eventoAlertaSchema = z.object({
  id_evento_alerta:                z.string(),
  id_organizacao:                  z.string(),
  tipo_ator_evento_alerta:         z.enum(['USUARIO','API','IA','JOB','INTEGRACAO']),
  id_ator_evento_alerta:           z.string(),
  nome_ator_evento_alerta:         z.string(),
  modulo_evento_alerta:            z.string(),
  acao_evento_alerta:              z.string(),
  contagem_eventos_evento_alerta:  z.number(),
  janela_segundos_evento_alerta:   z.number(),
  status_evento_alerta:            z.enum(['PENDENTE','REVISADO','ESCALADO']),
  data_criacao_evento_alerta:      z.string(),
  notas_evento_alerta:             z.string().nullable().optional(),
  regra_evento_alerta:             z.object({ nome_regra_alerta: z.string() }),
})

type EventoAlerta = z.infer<typeof eventoAlertaSchema>

const listaEventoAlertaSchema = z.object({ data: z.array(eventoAlertaSchema) })

// ---------------------------------------------------------------------------
// Helpers visuais
// ---------------------------------------------------------------------------

const COR_TIPO_ATOR: Record<TipoAtorHistoricoLog, { cor: string; bg: string }> = {
  USUARIO:    { cor: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  API:        { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  IA:         { cor: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  JOB:        { cor: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
  INTEGRACAO: { cor: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
}

const COR_STATUS_HISTORICO_LOG: Record<StatusHistoricoLog, { cor: string; bg: string }> = {
  SUCESSO: { cor: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  FALHA:   { cor: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  PARCIAL: { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
}

function IconeAtor({ tipo }: { tipo: TipoAtorHistoricoLog }) {
  const props = { size: 14, weight: 'bold' as const }
  if (tipo === 'IA') return <Robot {...props} />
  if (tipo === 'JOB') return <Gear {...props} />
  if (tipo === 'API') return <Globe {...props} />
  if (tipo === 'INTEGRACAO') return <Cpu {...props} />
  return <User {...props} />
}

function BadgeAtorTipo({ tipo }: { tipo: TipoAtorHistoricoLog }) {
  const { cor, bg } = COR_TIPO_ATOR[tipo] ?? COR_TIPO_ATOR.USUARIO
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem',
      fontWeight: 700, background: bg, color: cor, border: `1px solid ${cor}33`,
    }}>
      <IconeAtor tipo={tipo} />
      {tipo}
    </span>
  )
}

function BadgeStatusHistoricoLog({ status }: { status: StatusHistoricoLog }) {
  const { cor, bg } = COR_STATUS_HISTORICO_LOG[status] ?? COR_STATUS_HISTORICO_LOG.PARCIAL
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
      fontSize: '0.65rem', fontWeight: 700, background: bg, color: cor,
    }}>
      {status}
    </span>
  )
}

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// Mapa código → particípio passado em PT-BR (humano para o usuário final).
// Fallback aplica humanizar() para qualquer código novo/legado.
const ACAO_PARTICIPIO: Record<string, string> = {
  CRIAR:       'Criou',
  ATUALIZAR:   'Atualizou',
  EXCLUIR:     'Excluiu',
  ENTRAR:      'Entrou',
  SAIR:        'Saiu',
  CONVIDAR:    'Convidou',
  CONSULTAR:   'Consultou',
  EXPORTAR:    'Exportou',
  ANULAR:      'Anulou',
  ENVIAR:      'Enviou',
  DUPLICAR:    'Duplicou',
  TRANSFERIR:  'Transferiu',
  CONSOLIDAR:  'Consolidou',
  ANONIMIZAR:  'Anonimizou',
  EXCLUIR_ITENS:                    'Excluiu itens',
  EXCLUIR_AUTOMATICAMENTE:          'Excluiu automaticamente',
  EXCLUIR_DADO:                     'Excluiu dado',
  EDITAR_EM_MASSA:                  'Editou em massa',
  REVERTER_TRANSFERENCIA:           'Reverteu transferência',
  ALTERAR_STATUS:                   'Alterou status',
  ALTERAR_PATENTE:                  'Alterou patente',
  REVOGAR_SESSAO:                   'Revogou sessão',
  FALHAR_AUTENTICACAO:              'Falhou autenticação',
  FALHAR_ASSINATURA_WEBHOOK:        'Falhou assinatura webhook',
  TENTAR_ACESSO_OUTRA_ORGANIZACAO:  'Tentou acessar outra organização',
  ATINGIR_LIMITE_TAXA:              'Atingiu limite de taxa',
  ACESSAR_ADMIN:                    'Acessou área Admin',
  CHAMAR_API:                       'Chamou API',
  CONCLUIR_JOB:                     'Concluiu job',
  FALHAR_JOB:                       'Falhou job',
  SINCRONIZAR_NCM:                  'Sincronizou NCM',
  AGENDAR_SINCRONIZACAO_NCM:        'Agendou sincronização NCM',
  INICIAR_EXECUCAO_TESTES:          'Iniciou execução de testes',
  CONCLUIR_EXECUCAO_TESTES:         'Concluiu execução de testes',
  INGERIR_LOGS_TESTE:               'Ingeriu logs de teste',
  GERAR_PLANO_TESTE:                'Gerou plano de teste',
  EXPANDIR_PLANO_TESTE:             'Expandiu plano de teste',
  REANALISAR_TESTE:                 'Reanalisou teste',
  APLICAR_CORRECAO_TESTE:           'Aplicou correção em teste',
  REJEITAR_ANALISE_TESTE:           'Rejeitou análise de teste',
  EXECUTAR_PENTEST:                 'Executou pentest',
}

function humanizar(codigo: string): string {
  return codigo
    .split('_')
    .map((p) => p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : '')
    .join(' ')
}

function rotuloAcao(codigo: string | null | undefined): string {
  if (!codigo) return '—'
  return ACAO_PARTICIPIO[codigo] ?? humanizar(codigo)
}

// ---------------------------------------------------------------------------
// Diff visual antes/depois (estado_anterior_historico_log vs estado_posterior_historico_log)
// ---------------------------------------------------------------------------

function DiffVisual({
  estado_anterior_historico_log,
  estado_posterior_historico_log,
}: {
  estado_anterior_historico_log?: unknown
  estado_posterior_historico_log?: unknown
}) {
  if (!estado_anterior_historico_log && !estado_posterior_historico_log) {
    return <p style={{ color: '#64748b', fontSize: '0.8125rem', padding: '0.5rem 0' }}>Sem dados de antes/depois registrados.</p>
  }

  const computedDiff = (() => {
    if (!estado_anterior_historico_log || !estado_posterior_historico_log) return null
    if (typeof estado_anterior_historico_log !== 'object' || typeof estado_posterior_historico_log !== 'object') return null
    const anterior  = estado_anterior_historico_log  as Record<string, unknown>
    const posterior = estado_posterior_historico_log as Record<string, unknown>
    const campos = Array.from(new Set([...Object.keys(anterior), ...Object.keys(posterior)]))
    return campos
      .filter((k) => JSON.stringify(anterior[k]) !== JSON.stringify(posterior[k]))
      .map((k) => ({ campo: k, antes: anterior[k], depois: posterior[k] }))
  })()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {/* Antes */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antes</span>
        </div>
        <pre style={{
          background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: '#e2e8f0',
          overflow: 'auto', maxHeight: '200px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {estado_anterior_historico_log ? JSON.stringify(estado_anterior_historico_log, null, 2) : '(novo registro)'}
        </pre>
      </div>

      {/* Depois */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Depois</span>
        </div>
        <pre style={{
          background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: '#e2e8f0',
          overflow: 'auto', maxHeight: '200px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {estado_posterior_historico_log ? JSON.stringify(estado_posterior_historico_log, null, 2) : '(registro excluído)'}
        </pre>
      </div>

      {/* Campos alterados */}
      {computedDiff && computedDiff.length > 0 && (
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Campos alterados ({computedDiff.length})
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {['Campo', 'Antes', 'Depois'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computedDiff.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px 8px', color: '#cbd5e1', fontWeight: 500 }}>{d.campo}</td>
                  <td style={{ padding: '6px 8px', color: '#f87171' }}>{String(d.antes ?? '—')}</td>
                  <td style={{ padding: '6px 8px', color: '#34d399' }}>{String(d.depois ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Linha expandida — abas Antes/Depois e Detalhes
// ---------------------------------------------------------------------------

function DetalheLog({ log }: { log: HistoricoLog }) {
  const [aba, setAba] = useState<'diff' | 'meta'>('diff')

  return (
    <div style={{ padding: '16px', background: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Abas */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {(['diff', 'meta'] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} style={{
            padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: aba === a ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: aba === a ? '#818cf8' : '#64748b',
          }}>
            {a === 'diff' ? 'Antes / Depois' : 'Detalhes'}
          </button>
        ))}
      </div>

      {aba === 'diff' && (
        <DiffVisual
          estado_anterior_historico_log={log.estado_anterior_historico_log}
          estado_posterior_historico_log={log.estado_posterior_historico_log}
        />
      )}

      {aba === 'meta' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
          {[
            { label: 'ID do Log',         valor: log.id_historico_log },
            { label: 'Módulo',            valor: log.modulo_historico_log },
            { label: 'Tipo de recurso',   valor: log.tipo_recurso_historico_log },
            { label: 'ID do recurso',     valor: log.id_recurso_historico_log ?? '—' },
            { label: 'IP do ator',        valor: log.ip_ator_historico_log ?? '—' },
            { label: 'Status',            valor: log.status_historico_log },
            { label: 'E-mail do ator',    valor: log.email_ator_historico_log ?? '—' },
            { label: 'ID do usuário',     valor: log.id_usuario ?? '—' },
            { label: 'ID do produto',     valor: log.id_produto_historico_log ?? '—' },
          ].map(({ label, valor }) => (
            <div key={label}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ color: '#e2e8f0', fontWeight: 500, wordBreak: 'break-all' }}>{valor}</p>
            </div>
          ))}

          {log.mensagem_erro_historico_log && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase' }}>Erro</p>
              <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.mensagem_erro_historico_log}</p>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Hash size={12} color="#64748b" />
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Integridade:</span>
            <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }}>{log.hash_integridade_historico_log}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Painel de alertas
// ---------------------------------------------------------------------------

function PainelAlertas({ onClose }: { onClose: () => void }) {
  const addNotification = useShellStore((s) => s.addNotification)
  const [alertas, setAlertas] = useState<EventoAlerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/v1/admin/historico-global/alerts?status=PENDENTE')
      .then((r) => r.json())
      .then((d) => {
        const parsed = listaEventoAlertaSchema.safeParse(d)
        if (parsed.success) {
          setAlertas(parsed.data.data)
        } else {
          // Falha ruidosa (Mandamento 08) sem quebrar a UI — admin vê tela vazia
          // e log no console identifica o drift de contrato.
          console.warn('[PainelAlertas] payload de alertas fora do contrato', parsed.error.issues, d)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function marcarRevisado(id_evento_alerta: string) {
    try {
      await apiFetch(`/api/v1/admin/historico-global/alerts/${id_evento_alerta}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_evento_alerta: 'REVISADO' }),
      })
      setAlertas((prev) => prev.filter((a) => a.id_evento_alerta !== id_evento_alerta))
      addNotification({ type: 'success', message: 'Alerta marcado como revisado.' })
    } catch {
      addNotification({ type: 'error', message: 'Erro ao atualizar alerta.' })
    }
  }

  const COR_STATUS_EVENTO_ALERTA: Record<StatusEventoAlerta, string> = {
    PENDENTE: '#fbbf24',
    REVISADO: '#34d399',
    ESCALADO: '#f87171',
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', zIndex: 50,
      background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Warning size={18} color="#fbbf24" weight="duotone" />
          <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>Alertas Pendentes</span>
          {alertas.length > 0 && (
            <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
              {alertas.length}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {loading && <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Carregando...</p>}
        {!loading && alertas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <CheckCircle size={36} color="#34d399" weight="duotone" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>Nenhum alerta pendente</p>
            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>O sistema não detectou atividades suspeitas.</p>
          </div>
        )}

        {alertas.map((alerta) => (
          <div key={alerta.id_evento_alerta} style={{
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${COR_STATUS_EVENTO_ALERTA[alerta.status_evento_alerta]}33`,
            borderRadius: '8px', padding: '12px', marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>{alerta.regra_evento_alerta.nome_regra_alerta}</p>
                <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatarData(alerta.data_criacao_evento_alerta)}</p>
              </div>
              <BadgeAtorTipo tipo={alerta.tipo_ator_evento_alerta} />
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '10px' }}>
              <strong style={{ color: '#e2e8f0' }}>{alerta.nome_ator_evento_alerta}</strong> executou{' '}
              <strong style={{ color: COR_STATUS_EVENTO_ALERTA[alerta.status_evento_alerta] }}>{alerta.contagem_eventos_evento_alerta}x</strong>{' '}
              "{rotuloAcao(alerta.acao_evento_alerta)}" em <strong>{alerta.modulo_evento_alerta}</strong>{' '}
              {alerta.janela_segundos_evento_alerta > 0 && `em ${alerta.janela_segundos_evento_alerta}s`}
            </p>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => marcarRevisado(alerta.id_evento_alerta)}
                style={{
                  flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(52,211,153,0.1)', color: '#34d399',
                  border: '1px solid rgba(52,211,153,0.2)', cursor: 'pointer',
                }}
              >
                Revisado
              </button>
              <button
                onClick={async () => {
                  await apiFetch(`/api/v1/admin/historico-global/alerts/${alerta.id_evento_alerta}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status_evento_alerta: 'ESCALADO' }),
                  })
                  setAlertas((prev) => prev.filter((a) => a.id_evento_alerta !== alerta.id_evento_alerta))
                }}
                style={{
                  flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(248,113,113,0.1)', color: '#f87171',
                  border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer',
                }}
              >
                Escalar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function HistoricoGlobalAdmin() {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const addNotification = useShellStore((s) => s.addNotification)

  useEffect(() => { setAuthTokenProvider(() => getToken()) }, [getToken])

  const [logs, setLogs] = useState<HistoricoLog[]>([])
  const [loading, setLoading] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [alertasAbertos, setAlertasAbertos] = useState(false)
  const [alertasPendentes, setAlertasPendentes] = useState(0)

  const [filtroTipoAtor,           setFiltroTipoAtor]           = useState<string | null>(null)
  const [filtroStatusHistoricoLog, setFiltroStatusHistoricoLog] = useState<string | null>(null)
  const [filtroPeriodo,            setFiltroPeriodo]            = useState<{
    data_inicio: Date | null
    data_fim:    Date | null
  }>({ data_inicio: null, data_fim: null })

  function buildQuery(cursor?: string) {
    const params = new URLSearchParams()
    if (filtroTipoAtor && filtroTipoAtor !== 'todos')
      params.set('tipo_ator_historico_log', filtroTipoAtor)
    if (filtroStatusHistoricoLog && filtroStatusHistoricoLog !== 'todos')
      params.set('status_historico_log', filtroStatusHistoricoLog)
    if (filtroPeriodo.data_inicio) params.set('startDate', filtroPeriodo.data_inicio.toISOString())
    if (filtroPeriodo.data_fim)    params.set('endDate',   filtroPeriodo.data_fim.toISOString())
    if (cursor) params.set('cursor', cursor)
    params.set('limit', '50')
    return params.toString()
  }

  const loadLogs = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setErroCarregar(null)
      const res = await apiFetch(`/api/v1/admin/historico-global/logs?${buildQuery()}`, { signal })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`)
      }
      const raw = await res.json()
      const parsed = listaHistoricoLogSchema.safeParse(raw)
      if (!parsed.success) {
        // Falha ruidosa (Mandamento 06+08) — payload divergente do contrato Zod
        // bilateral. Notifica o admin e loga as issues para diagnóstico.
        console.warn('[HistoricoGlobalAdmin] payload de logs fora do contrato', parsed.error.issues, raw)
        throw new Error('Payload do histórico fora do contrato esperado')
      }
      setLogs(parsed.data.data)
      setNextCursor(parsed.data.meta.nextCursor)
    } catch (err) {
      // Ignora AbortError (cleanup do useEffect no StrictMode em dev — evita toast duplicado)
      if (err instanceof DOMException && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      setErroCarregar(msg)
      addNotification({ type: 'error', message: `Falha ao carregar histórico: ${msg}` })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipoAtor, filtroStatusHistoricoLog, filtroPeriodo])

  useEffect(() => {
    const ctrl = new AbortController()
    void loadLogs(ctrl.signal)
    return () => ctrl.abort()
  }, [loadLogs])

  // Polling de alertas pendentes a cada 30s (além do carregamento inicial)
  useEffect(() => {
    const fetchAlertas = () => {
      apiFetch('/api/v1/admin/historico-global/alerts?status=PENDENTE&limit=1')
        .then((r) => r.json())
        .then((d) => setAlertasPendentes(d.data?.length ?? 0))
        .catch(() => { /* silencioso — indicador não-crítico */ })
    }
    fetchAlertas()
    const interval = setInterval(fetchAlertas, 30_000)
    return () => clearInterval(interval)
  }, [])

  async function carregarMais() {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const res = await apiFetch(`/api/v1/admin/historico-global/logs?${buildQuery(nextCursor)}`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const raw = await res.json()
      const parsed = listaHistoricoLogSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[HistoricoGlobalAdmin] paginação — payload fora do contrato', parsed.error.issues, raw)
        throw new Error('Payload do histórico fora do contrato esperado')
      }
      setLogs((prev) => [...prev, ...parsed.data.data])
      setNextCursor(parsed.data.meta.nextCursor)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      addNotification({ type: 'error', message: `Falha ao carregar mais logs: ${msg}` })
    } finally {
      setLoadingMore(false)
    }
  }

  // ── Exportação client-side (6 formatos via @nucleo/export-utils) ─────────
  // Substitui o endpoint legado /logs/export?format=csv|json. Backend continua
  // disponível para volumes >10k via job assíncrono (PG Boss); botão dedicado
  // será adicionado quando demanda aparecer.

  const colunasExport: ColunasExport[] = useMemo(() => [
    { header: 'Data/Hora',         key: 'data_criacao_historico_log' },
    { header: 'Tipo de Ator',      key: 'tipo_ator_historico_log' },
    { header: 'Nome do Ator',      key: 'nome_ator_historico_log' },
    { header: 'E-mail do Ator',    key: 'email_ator_historico_log' },
    { header: 'Módulo',            key: 'modulo_historico_log' },
    { header: 'Tipo de Recurso',   key: 'tipo_recurso_historico_log' },
    { header: 'ID do Recurso',     key: 'id_recurso_historico_log' },
    { header: 'Ação',              key: 'acao_historico_log' },
    { header: 'Detalhes',          key: 'detalhe_acao_historico_log' },
    { header: 'Status',            key: 'status_historico_log' },
    { header: 'Mensagem de Erro',  key: 'mensagem_erro_historico_log' },
  ], [])

  // Achata e humaniza para export — paridade visual com a tabela
  // (data formatada PT-BR + ação como particípio passado).
  const dadosExport: Record<string, unknown>[] = useMemo(
    () => logs.map((l) => ({
      data_criacao_historico_log: formatarData(l.data_criacao_historico_log),
      tipo_ator_historico_log:    l.tipo_ator_historico_log,
      nome_ator_historico_log:    l.nome_ator_historico_log ?? '',
      email_ator_historico_log:   l.email_ator_historico_log ?? '',
      modulo_historico_log:       l.modulo_historico_log ?? '',
      tipo_recurso_historico_log: l.tipo_recurso_historico_log ?? '',
      id_recurso_historico_log:   l.id_recurso_historico_log ?? '',
      acao_historico_log:         rotuloAcao(l.acao_historico_log),
      detalhe_acao_historico_log: l.detalhe_acao_historico_log ?? '',
      status_historico_log:       l.status_historico_log,
      mensagem_erro_historico_log: l.mensagem_erro_historico_log ?? '',
    })),
    [logs],
  )

  const opcoesExport = { nomeArquivo: 'historico-global-admin', titulo: 'Histórico Global' }

  const acoesExportacao: TabelaExportAcao<HistoricoLog>[] = useMemo(() => [
    { label: 'Excel (.xlsx)', icone: <FileXls  size={14} weight="duotone" />, onClick: () => void exportarExcel(dadosExport, colunasExport, opcoesExport) },
    { label: 'CSV',           icone: <FileCsv  size={14} weight="duotone" />, onClick: () => exportarCSV(dadosExport, colunasExport, opcoesExport) },
    { label: 'TXT',           icone: <FileText size={14} weight="duotone" />, onClick: () => exportarTXT(dadosExport, colunasExport, opcoesExport) },
    { label: 'XML',           icone: <FileCode size={14} weight="duotone" />, onClick: () => exportarXML(dadosExport, colunasExport, opcoesExport) },
    { label: 'PDF',           icone: <FilePdf  size={14} weight="duotone" />, onClick: () => void exportarPDF(dadosExport, colunasExport, opcoesExport) },
    { label: 'JSON',          icone: <Code     size={14} weight="duotone" />, onClick: () => exportarJSON(dadosExport, colunasExport, opcoesExport) },
  ], [dadosExport, colunasExport])

  // ── KPIs do cabeçalho ────────────────────────────────────────────────────
  // Cálculo sobre a página atual de cursor (best-effort) — endpoint dedicado
  // de contagens é follow-up. Suficiente para visão imediata do admin.

  const totalEventos    = logs.length
  const inicioUltimaSem = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d
  }, [])
  const eventosSemana   = useMemo(
    () => logs.filter((l) => new Date(l.data_criacao_historico_log) >= inicioUltimaSem).length,
    [logs, inicioUltimaSem],
  )
  const eventosSucesso  = useMemo(() => logs.filter((l) => l.status_historico_log === 'SUCESSO').length, [logs])
  const eventosFalha    = useMemo(() => logs.filter((l) => l.status_historico_log === 'FALHA').length, [logs])
  const eventosParcial  = useMemo(() => logs.filter((l) => l.status_historico_log === 'PARCIAL').length, [logs])

  // ── Colunas da tabela ────────────────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<HistoricoLog>[] = [
    {
      key: 'data_criacao_historico_log', label: 'Quando', tipo: 'periodo', largura: '160px',
      render: (v) => <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{formatarData(String(v))}</span>,
    },
    {
      key: 'nome_ator_historico_log', label: 'Ator', tipo: 'texto', largura: '240px',
      render: (_v, item) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center' }}>
          <BadgeAtorTipo tipo={item.tipo_ator_historico_log} />
          <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.8rem' }}>
            {item.nome_ator_historico_log}
          </span>
          {item.email_ator_historico_log && (
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', opacity: 0.85 }}>
              {item.email_ator_historico_log}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'acao_historico_log', label: 'Ação', tipo: 'texto', largura: '160px',
      render: (v) => (
        <span style={{
          display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
          background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)',
        }}>
          {rotuloAcao(v as string | null)}
        </span>
      ),
      renderFiltroLabel: (v) => rotuloAcao(v),
    },
    {
      key: 'detalhe_acao_historico_log', label: 'O que foi feito', tipo: 'texto',
      render: (v, item) => {
        const endpoint = (item.metadata_ator_historico_log as { endpoint?: string } | null | undefined)?.endpoint
        const local = caminhoParaLocalString(endpoint, item.modulo_historico_log, item.tipo_recurso_historico_log)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <span style={{
              padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.65rem', color: '#94a3b8',
            }}>
              {local}
            </span>
            <span style={{ color: '#e2e8f0', fontSize: '0.8125rem' }}>{(v as string | null) ?? '—'}</span>
          </div>
        )
      },
      getValorBruto: (item) => {
        const endpoint = (item.metadata_ator_historico_log as { endpoint?: string } | null | undefined)?.endpoint
        return caminhoParaLocalString(endpoint, item.modulo_historico_log, item.tipo_recurso_historico_log)
      },
    },
    {
      key: 'status_historico_log', label: 'Status', tipo: 'texto', largura: '110px',
      render: (v) => <BadgeStatusHistoricoLog status={v as StatusHistoricoLog} />,
    },
  ]

  // ── Opções de filtro ─────────────────────────────────────────────────────

  const opcoesTipoAtor = [
    { valor: 'todos', rotulo: 'Todos os atores' },
    { valor: 'USUARIO', rotulo: 'Usuário' },
    { valor: 'IA', rotulo: 'IA / GABI' },
    { valor: 'API', rotulo: 'API Externa' },
    { valor: 'JOB', rotulo: 'Job Interno' },
    { valor: 'INTEGRACAO', rotulo: 'Integração' },
  ]

  const opcoesStatusHistoricoLog = [
    { valor: 'todos', rotulo: 'Todos os status' },
    { valor: 'SUCESSO', rotulo: 'Sucesso' },
    { valor: 'FALHA', rotulo: 'Falha' },
    { valor: 'PARCIAL', rotulo: 'Parcial' },
  ]

  return (
    <>
      <PaginaGlobal
        className="ws-fade-up"
        layout="lista"
        stats={
          <>
            <CardBasicoGlobal
              titulo="Total de eventos"
              icone={<ListBullets weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
              valor={totalEventos}
              periodos={[
                { periodo: '7d',  rotulo: '7 dias',  valor: '—', direcao: 'neutral', descricao: 'vs semana anterior' },
                { periodo: '30d', rotulo: '30 dias', valor: '—', direcao: 'neutral', descricao: 'vs mês anterior'    },
                { periodo: '6m',  rotulo: '6 meses', valor: '—', direcao: 'neutral', descricao: 'vs semestre anterior'},
                { periodo: '1a',  rotulo: '1 ano',   valor: '—', direcao: 'neutral', descricao: 'vs ano anterior'    },
              ] as PeriodoTendencia[]}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Visão geral</p>
                  <div className="cg-tooltip__row">
                    <span>Carregados (página atual)</span>
                    <strong>{totalEventos}</strong>
                  </div>
                </>
              }
            />
            <CardBasicoGlobal
              titulo="Últimos 7 dias"
              icone={<CalendarBlank weight="duotone" size={16} style={{ color: '#34d399' }} />}
              valor={eventosSemana}
              variante="sucesso"
              periodos={[
                { periodo: '7d',  rotulo: '7 dias',  valor: '—', direcao: 'neutral', descricao: 'vs semana anterior' },
                { periodo: '30d', rotulo: '30 dias', valor: '—', direcao: 'neutral', descricao: 'vs mês anterior'    },
                { periodo: '6m',  rotulo: '6 meses', valor: '—', direcao: 'neutral', descricao: 'vs semestre anterior'},
                { periodo: '1a',  rotulo: '1 ano',   valor: '—', direcao: 'neutral', descricao: 'vs ano anterior'    },
              ] as PeriodoTendencia[]}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Atividade recente</p>
                  <div className="cg-tooltip__row">
                    <span>Eventos nos últimos 7 dias</span>
                    <strong style={{ color: '#34d399' }}>{eventosSemana}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>% do total carregado</span>
                    <strong>{totalEventos ? Math.round((eventosSemana / totalEventos) * 100) : 0}%</strong>
                  </div>
                </>
              }
            />
            <CardGraficoGlobal
              titulo="Status dos eventos"
              icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
              total={totalEventos}
              valorPrincipal={eventosSucesso}
              corGauge="#34d399"
              legenda={[
                { label: 'Sucesso',  valor: eventosSucesso, cor: 'green'  },
                { label: 'Falha',    valor: eventosFalha,   cor: 'red'    },
                { label: 'Parcial',  valor: eventosParcial, cor: 'yellow' },
              ]}
              tooltip={
                <>
                  <div className="cg-tooltip__row">
                    <span>Sucesso</span>
                    <strong style={{ color: '#34d399' }}>{eventosSucesso}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Falha</span>
                    <strong style={{ color: '#f87171' }}>{eventosFalha}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Parcial</span>
                    <strong style={{ color: '#fbbf24' }}>{eventosParcial}</strong>
                  </div>
                  <div className="cg-tooltip__divider" />
                  <div className="cg-tooltip__row">
                    <span>Taxa de sucesso</span>
                    <strong style={{ color: '#34d399' }}>
                      {totalEventos ? Math.round((eventosSucesso / totalEventos) * 100) : 0}%
                    </strong>
                  </div>
                </>
              }
            />
          </>
        }
        cabecalho={
          <CabecalhoGlobal
            icone={<Desktop weight="duotone" size={22} />}
            titulo={t('admin.historico-global.titulo')}
            subtitulo={t('admin.historico-global.subtitulo')}
            acoes={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Botão alertas */}
                <button
                  onClick={() => setAlertasAbertos(true)}
                  aria-label={`Ver alertas pendentes${alertasPendentes > 0 ? ` (${alertasPendentes})` : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                    background: alertasPendentes > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${alertasPendentes > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: alertasPendentes > 0 ? '#fbbf24' : '#64748b',
                    fontSize: '0.8rem', fontWeight: 600,
                  }}
                >
                  <Warning size={16} weight="duotone" />
                  Alertas
                  {alertasPendentes > 0 && (
                    <span style={{ background: '#fbbf24', color: '#0f172a', borderRadius: '9999px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 800 }}>
                      {alertasPendentes}
                    </span>
                  )}
                </button>

                <TooltipGlobal titulo="Processamento assíncrono" descricao="Os logs são gravados em fila — pode haver latência de até 1s na exibição.">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px', cursor: 'help' }}>
                    <Info size={18} weight="duotone" color="#3b82f6" />
                  </div>
                </TooltipGlobal>
              </div>
            }
          />
        }
      >
        <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', marginTop: '16px', position: 'relative', zIndex: 10 }}>
          {/* Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginRight: '4px' }}>
              <Funnel size={14} weight="bold" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filtrar</span>
            </div>

            <div style={{ width: '180px' }}>
              <SelectGlobal
                opcoes={opcoesTipoAtor}
                valor={filtroTipoAtor}
                aoMudarValor={(v) => setFiltroTipoAtor(v as string)}
                placeholder="Tipo de ator"
              />
            </div>

            <div style={{ width: '180px' }}>
              <SelectGlobal
                opcoes={opcoesStatusHistoricoLog}
                valor={filtroStatusHistoricoLog}
                aoMudarValor={(v) => setFiltroStatusHistoricoLog(v as string)}
                placeholder="Status"
              />
            </div>

            <div style={{ width: '240px' }}>
              <CampoCalendarioGlobal
                placeholder="Período"
                valor={{ inicio: filtroPeriodo.data_inicio, fim: filtroPeriodo.data_fim }}
                aoMudarValor={(range) => setFiltroPeriodo({ data_inicio: range.inicio, data_fim: range.fim })}
              />
            </div>

            <button
              onClick={() => void loadLogs()}
              aria-label="Atualizar lista de logs"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                color: '#818cf8', fontSize: '0.8rem', fontWeight: 600,
              }}
            >
              <ArrowsClockwise size={14} />
              Atualizar
            </button>
          </div>

          {/* Estado de erro — retry inline */}
          {erroCarregar && !loading ? (
            <div
              role="alert"
              style={{
                padding: '2rem 1rem', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px',
                background: 'rgba(248,113,113,0.05)',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 600 }}>
                Falha ao carregar histórico
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                {erroCarregar}
              </div>
              <button
                type="button"
                onClick={() => void loadLogs()}
                aria-label="Tentar carregar histórico novamente"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8', fontSize: '0.8rem', fontWeight: 600,
                }}
              >
                <ArrowsClockwise size={14} />
                Tentar novamente
              </button>
            </div>
          ) : (
            <TabelaGlobal<HistoricoLog>
              id="admin-historico-global"
              dados={logs}
              colunas={COLUNAS}
              idKey="id_historico_log"
              mensagemVazio={loading ? 'Carregando...' : 'Nenhum log encontrado com os filtros aplicados.'}
              mensagemSemFiltro="Nenhum log encontrado."
              tooltipBusca="Buscar por ação, ator ou recurso"
              tooltipExpandir="Ver antes/depois e detalhes"
              tooltipRecolher="Recolher detalhes"
              renderExpandido={(item) => <DetalheLog log={item} />}
              acoesExportacao={acoesExportacao}
            />
          )}

          {/* Carregar mais */}
          {nextCursor && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button
                onClick={carregarMais}
                disabled={loadingMore}
                aria-label={loadingMore ? 'Carregando mais logs' : 'Carregar mais logs'}
                style={{
                  padding: '8px 24px', borderRadius: '8px', cursor: loadingMore ? 'not-allowed' : 'pointer',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600,
                  opacity: loadingMore ? 0.6 : 1,
                }}
              >
                {loadingMore ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </div>
      </PaginaGlobal>

      {/* Painel lateral de alertas */}
      {alertasAbertos && <PainelAlertas onClose={() => setAlertasAbertos(false)} />}
    </>
  )
}
