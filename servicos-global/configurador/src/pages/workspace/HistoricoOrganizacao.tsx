import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import {
  ClockCounterClockwise,
  FileXls,
  FileCsv,
  FileText,
  FileCode,
  FilePdf,
  Code,
  ListBullets,
  CalendarBlank,
  ChartPieSlice,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import {
  TabelaGlobal,
  type TabelaGlobalColuna,
  type TabelaExportAcao,
} from '@nucleo/tabela-global'
import { caminhoParaLocalString } from '@nucleo/audit-locais'
import {
  exportarExcel,
  exportarCSV,
  exportarTXT,
  exportarXML,
  exportarPDF,
  exportarJSON,
  type ColunasExport,
} from '@nucleo/export-utils'

// ---------------------------------------------------------------------------
// Contrato — paridade DDD direta com Prisma `historico_log`
// (sem ACL no backend; nomes idênticos do model até o React)
// ---------------------------------------------------------------------------

const historicoLogSchema = z.object({
  id_historico_log:            z.string(),
  data_criacao_historico_log:  z.string(),
  acao_historico_log:          z.string(),
  detalhe_acao_historico_log:  z.string().nullable(),
  tipo_recurso_historico_log:  z.string(),
  id_recurso_historico_log:    z.string().nullable(),
  nome_ator_historico_log:     z.string().nullable(),
  tipo_ator_historico_log:     z.string().nullable(),
  status_historico_log:        z.string().nullable(),
  modulo_historico_log:        z.string().nullable().optional(),
  metadata_ator_historico_log: z.record(z.unknown()).nullable().optional(),
  /** Email do ator — enriquecido pelo proxy via lookup em `usuario`. Null para atores não-humanos. */
  email_ator_historico_log:    z.string().nullable().optional(),
})

const historicoResponseSchema = z.object({
  page:       z.number(),
  limit:      z.number(),
  logs:       z.array(historicoLogSchema),
  total:      z.number(),
  hasMore:    z.boolean(),
  nextCursor: z.string().nullable().optional(),
})

type HistoricoLog = z.infer<typeof historicoLogSchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// ---------------------------------------------------------------------------
// Mapa código → particípio passado em PT-BR (humano para o usuário final)
// Cobertura completa do conjunto canonical de `acao_historico_log` (Mandamento 03).
// Fallback aplica `humanizar()` para qualquer código novo/legado.
// ---------------------------------------------------------------------------

const ACAO_PARTICIPIO: Record<string, string> = {
  // Verbos canonical do glossário (skill arquitetura/observabilidade)
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
  // Verbos compostos
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

/**
 * Humaniza códigos legados (CREATE, UPDATE, etc) ou desconhecidos.
 * UPPER_SNAKE → "Capitalize separated by spaces".
 */
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
// Colunas
// ---------------------------------------------------------------------------

const colunas: TabelaGlobalColuna<HistoricoLog>[] = [
  {
    key: 'data_criacao_historico_log',
    label: 'Data/Hora',
    tipo: 'periodo',
    largura: '160px',
    render: (v) => formatarData(String(v)),
  },
  {
    key: 'acao_historico_log',
    label: 'Ação',
    tipo: 'texto',
    largura: '160px',
    render: (v) => rotuloAcao(v as string | null),
    // Filtro mostra label humanizado em vez do código cru (CRIAR → "Criou").
    // Mantém 1 chip por código pra não mascarar drift legado (CREATE/UPDATE/DELETE).
    renderFiltroLabel: (v) => rotuloAcao(v),
  },
  {
    key: 'modulo_historico_log',
    label: 'Local',
    tipo: 'texto',
    largura: '220px',
    render: (_v, item) => {
      const endpoint = (item.metadata_ator_historico_log as { endpoint?: string } | null | undefined)?.endpoint
      return caminhoParaLocalString(
        endpoint,
        item.modulo_historico_log,
        item.tipo_recurso_historico_log,
      )
    },
    // Filtro usa o mesmo "Sessão | Subsessão" que aparece na célula, não só o
    // valor cru de modulo_historico_log (admin/auth/configuracao).
    getValorBruto: (item) => {
      const endpoint = (item.metadata_ator_historico_log as { endpoint?: string } | null | undefined)?.endpoint
      return caminhoParaLocalString(
        endpoint,
        item.modulo_historico_log,
        item.tipo_recurso_historico_log,
      )
    },
  },
  {
    key: 'nome_ator_historico_log',
    label: 'Usuário',
    tipo: 'texto',
    largura: '220px',
    render: (_v, item) => {
      const nome  = item.nome_ator_historico_log ?? item.tipo_ator_historico_log ?? '—'
      const email = item.email_ator_historico_log
      // Atores não-humanos (`'system'`, `'webhook'`, `'anonymous'`) e logs antigos
      // sem lookup de email caem aqui — exibe só o nome.
      if (!email) return nome
      return (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <span>{nome}</span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            opacity: 0.85,
          }}>
            {email}
          </span>
        </div>
      )
    },
  },
  {
    key: 'detalhe_acao_historico_log',
    label: 'Detalhes',
    tipo: 'texto',
    render: (v) => (v as string | null) ?? '—',
  },
]

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function HistoricoOrganizacao() {
  const { t } = useTranslation()
  const { getToken } = useAuth()

  const [logs, setLogs] = useState<HistoricoLog[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const limit = 25

  const fetchLogs = useCallback(async (pageNum: number) => {
    try {
      const token = await getToken()
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(limit),
      })

      const res = await fetch(`/api/v1/historico-organizacao?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        console.warn('[HistoricoOrganizacao] resposta não-ok', res.status)
        return
      }

      const raw = await res.json()
      const parsed = historicoResponseSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[HistoricoOrganizacao] payload fora do contrato', parsed.error.issues, raw)
        return
      }
      setLogs(parsed.data.logs)
      setTotal(parsed.data.total)
      setHasMore(parsed.data.hasMore)
    } catch (err) {
      console.error('[HistoricoOrganizacao] Erro ao buscar logs:', err)
    }
  }, [getToken])

  useEffect(() => {
    fetchLogs(page)
  }, [page, fetchLogs])

  // ─── Exportação ──────────────────────────────────────────────────────────
  // Achata o payload do log para o formato consumido pelos utilitários de
  // export. Preserva os mesmos rótulos vistos na tela (ação humanizada,
  // local resolvido) para manter paridade visual com a tabela.

  const colunasExport: ColunasExport[] = useMemo(() => [
    { header: 'Data/Hora',  key: 'data_criacao_historico_log'  },
    { header: 'Ação',       key: 'acao_historico_log'          },
    { header: 'Local',      key: 'local'                       },
    { header: 'Recurso',    key: 'tipo_recurso_historico_log'  },
    { header: 'ID Recurso', key: 'id_recurso_historico_log'    },
    { header: 'Usuário',    key: 'nome_ator_historico_log'     },
    { header: 'Email',      key: 'email_ator_historico_log'    },
    { header: 'Tipo Ator',  key: 'tipo_ator_historico_log'     },
    { header: 'Módulo',     key: 'modulo_historico_log'        },
    { header: 'Detalhes',   key: 'detalhe_acao_historico_log'  },
    { header: 'Status',     key: 'status_historico_log'        },
  ], [])

  const dadosExport: Record<string, unknown>[] = useMemo(
    () => logs.map((log) => {
      const endpoint = (log.metadata_ator_historico_log as { endpoint?: string } | null | undefined)?.endpoint
      return {
        data_criacao_historico_log: formatarData(log.data_criacao_historico_log),
        acao_historico_log:         rotuloAcao(log.acao_historico_log),
        local: caminhoParaLocalString(
          endpoint,
          log.modulo_historico_log,
          log.tipo_recurso_historico_log,
        ),
        tipo_recurso_historico_log: log.tipo_recurso_historico_log ?? '',
        id_recurso_historico_log:   log.id_recurso_historico_log ?? '',
        nome_ator_historico_log:    log.nome_ator_historico_log ?? '',
        email_ator_historico_log:   log.email_ator_historico_log ?? '',
        tipo_ator_historico_log:    log.tipo_ator_historico_log ?? '',
        modulo_historico_log:       log.modulo_historico_log ?? '',
        detalhe_acao_historico_log: log.detalhe_acao_historico_log ?? '',
        status_historico_log:       log.status_historico_log ?? '',
      }
    }),
    [logs],
  )

  const opcoesExport = { nomeArquivo: 'historico-organizacao', titulo: 'Histórico da Organização' }

  const acoesExportacao: TabelaExportAcao<HistoricoLog>[] = useMemo(() => [
    {
      label:  'Excel (.xlsx)',
      icone:  <FileXls   size={14} weight="duotone" />,
      onClick: () => void exportarExcel(dadosExport, colunasExport, opcoesExport),
    },
    {
      label:  'CSV',
      icone:  <FileCsv   size={14} weight="duotone" />,
      onClick: () => exportarCSV(dadosExport, colunasExport, opcoesExport),
    },
    {
      label:  'TXT',
      icone:  <FileText  size={14} weight="duotone" />,
      onClick: () => exportarTXT(dadosExport, colunasExport, opcoesExport),
    },
    {
      label:  'XML',
      icone:  <FileCode  size={14} weight="duotone" />,
      onClick: () => exportarXML(dadosExport, colunasExport, opcoesExport),
    },
    {
      label:  'PDF',
      icone:  <FilePdf   size={14} weight="duotone" />,
      onClick: () => void exportarPDF(dadosExport, colunasExport, opcoesExport),
    },
    {
      label:  'JSON',
      icone:  <Code      size={14} weight="duotone" />,
      onClick: () => exportarJSON(dadosExport, colunasExport, opcoesExport),
    },
  ], [dadosExport, colunasExport])

  // ─── KPIs do cabeçalho — calculados a partir da página corrente de logs ───
  // (delta vs. período anterior fica como TODO — precisa endpoint dedicado de
  // contagem agregada que o proxy ainda não expõe. Por ora os deltas são
  // placeholders neutros — serão preenchidos quando o backend ganhar
  // GET /api/v1/historico-organizacao/contagens).
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

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<ClockCounterClockwise weight="duotone" size={22} />}
          titulo={t('workspace.layout.historico-organizacao')}
          subtitulo="Registro de alterações na organização e workspaces"
        />
      }
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
    >
      <TabelaGlobal<HistoricoLog>
        colunas={colunas}
        dados={logs}
        idKey="id_historico_log"
        acoesExportacao={acoesExportacao}
        mensagemSemFiltro="Nenhum registro de histórico encontrado"
      />

      {/* Paginacao simples */}
      {total > limit && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 0',
          color: 'var(--color-text-muted)',
          fontSize: '0.8125rem',
        }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--bg-elevated)',
              background: 'var(--bg-surface)',
              color: 'var(--color-text-secondary)',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            Anterior
          </button>
          <span>
            Pagina {page} de {Math.ceil(total / limit)}
          </span>
          <button
            disabled={!hasMore && page >= Math.ceil(total / limit)}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--bg-elevated)',
              background: 'var(--bg-surface)',
              color: 'var(--color-text-secondary)',
              cursor: !hasMore && page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer',
              opacity: !hasMore && page >= Math.ceil(total / limit) ? 0.5 : 1,
            }}
          >
            Proxima
          </button>
        </div>
      )}
    </PaginaGlobal>
  )
}
