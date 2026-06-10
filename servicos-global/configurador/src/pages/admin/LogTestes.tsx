import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Bug, Sparkle, XCircle, CheckCircle, Warning, PlayCircle, CalendarBlank, Clock, SpinnerGap, X, Eye, ChartPieSlice } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { ModalAgendamentoTestes } from './ModalTestesAgendamento'
import { ModalExecutarTestes } from './ModalTestesExecutar'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { adminTestesApi, adminAgendamentosTesteApi, adminPlanosTesteApi, apiFetchBlob, type TesteApi, type ExecucaoTesteStatusApi } from '../../services/api-client'
import {
  resolverOqueFoiTestadoLog,
  resolverOqueFoiTestadoPlano,
  type PlanoFavoritoResumoOrigem,
} from '@testes/infra/admin/testes-favoritos-admin'
import { useShellStore } from '@gravity/shell'
import {
  calcularPercentuaisEmt,
  classificarLinhasLogEmt,
  contarPassosEmt,
  filtrarLinhasLogEmt,
  resolverEstadoEmtUi,
  resultadoEfetivoEmt,
  type LinhaEmtTabela,
} from '../../utils/emt-log-parser'


type TipoTeste = 'E2E' | 'EMT' | 'FUNCIONAL' | 'UNITARIO'

type AbaTestesGerais = 'executados' | 'em_execucao'

function formatarDuracaoCorrente(dataInicioIso: string): string {
  const inicio = new Date(dataInicioIso).getTime()
  if (Number.isNaN(inicio)) return '—'
  const seg = Math.max(0, Math.floor((Date.now() - inicio) / 1000))
  const min = Math.floor(seg / 60)
  const resto = seg % 60
  if (min === 0) return `${resto}s`
  return `${min}min ${resto}s`
}


function resolverNomeTesteExecucao(exec: ExecucaoTesteStatusApi): string {
  const idPlano = exec.lista_planos_execucao_teste[0]
  if (idPlano) return resolverNomeTeste(idPlano, idPlano)
  const modulo = exec.lista_modulos_execucao_teste[0]
  if (modulo) return resolverNomeTeste(modulo, modulo)
  return exec.runner_execucao_teste ?? '—'
}

function resolverOqueFoiTestadoExecucao(
  exec: ExecucaoTesteStatusApi,
  catalogo: Map<string, PlanoFavoritoResumoOrigem>,
): string {
  if (exec.lista_planos_execucao_teste.length > 0) {
    return exec.lista_planos_execucao_teste
      .map(id => {
        const plano = catalogo.get(id)
        return plano ? resolverOqueFoiTestadoPlano(plano) : id
      })
      .join(', ')
  }
  if (exec.lista_modulos_execucao_teste.length > 0) {
    return exec.lista_modulos_execucao_teste.join(', ')
  }
  return '—'
}

function passosPrevistosExecucao(
  exec: ExecucaoTesteStatusApi,
  catalogo: Map<string, PlanoFavoritoResumoOrigem>,
): string {
  let total = 0
  for (const id of exec.lista_planos_execucao_teste) {
    total += catalogo.get(id)?.casosTotal ?? 0
  }
  return total > 0 ? String(total) : '—'
}
type Resultado = 'APROVADO' | 'REPROVADO' | 'ERRO_CATASTROFICO'

interface LogTeste {
  id: string
  dataHora: string
  createdAtMs: number
  tipo: TipoTeste
  modulo: string
  teste: string
  resultado: Resultado
  duracao: string
  quantidadePassos?: number
  erroLog?: string
  aiAnalise?: {
    erroResumo: string
    motivo: string
    sugestaoCorrecao: string
    arquivo: string
    codigoDiff?: { arquivo?: string; linha?: number; old: string; new: string; explicacao?: string }
    provaVisual?: string
    categoria?: 'BUG_REAL' | 'TESTE_DESATUALIZADO' | 'FLAKY_TIMING' | 'REGRESSAO_RECENTE' | 'INFRA' | 'NAO_CLASSIFICAVEL'
    confianca?: 'alta' | 'media' | 'baixa'
    commitSuspeito?: { hash: string; autor: string; data: string; mensagem: string }
    modeloUsado?: string
  }
  aiRejected?: boolean
  successLog?: string
  emtPrints?: string[]
  emtPasta?: string
}

const EMT_PRINT_API_TIMEOUT_MS = 5_000
const MS_POR_DIA = 86_400_000

const CORES_TIPO_TESTE: Record<TipoTeste, string> = {
  EMT: '#fbbf24',
  E2E: '#eab308',
  UNITARIO: '#38bdf8',
  FUNCIONAL: '#a78bfa',
}

function filtrarLogsPorDias(dados: LogTeste[], dias: number): LogTeste[] {
  const corte = Date.now() - dias * MS_POR_DIA
  return dados.filter(d => d.createdAtMs >= corte)
}

function somarPassosAprovacao(itens: LogTeste[]): { aprovados: number; reprovados: number; total: number } {
  let aprovados = 0
  let reprovados = 0
  for (const item of itens) {
    const passos = contarPassosTeste(item)
    aprovados += passos.aprovados
    reprovados += passos.reprovados
  }
  return { aprovados, reprovados, total: aprovados + reprovados }
}

function somarPassosErro(itens: LogTeste[]): number {
  let erros = 0
  for (const item of itens) {
    const passos = contarPassosTeste(item)
    if (item.resultado === 'ERRO_CATASTROFICO') {
      erros += passos.total > 0 ? passos.total : 1
    } else {
      erros += passos.reprovados
    }
  }
  return erros
}

function somarPassosPorTipo(itens: LogTeste[]): Record<TipoTeste, number> {
  const acc: Record<TipoTeste, number> = { EMT: 0, E2E: 0, UNITARIO: 0, FUNCIONAL: 0 }
  for (const item of itens) {
    acc[item.tipo] += contarPassosTeste(item).total
  }
  return acc
}

function rotuloTipoTeste(tipo: TipoTeste, t: (k: string) => string): string {
  const map: Record<TipoTeste, string> = {
    EMT: t('admin.testes-gerais.tipo_emt'),
    E2E: t('admin.testes-gerais.tipo_e2e'),
    UNITARIO: t('admin.testes-gerais.tipo_unitario'),
    FUNCIONAL: t('admin.testes-gerais.tipo_funcional'),
  }
  return map[tipo]
}

function renderTextoTruncado50(valor: string, labelTooltip: string): React.ReactNode {
  if (valor.length <= 50) {
    return <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{valor}</span>
  }
  return (
    <TooltipGlobal titulo={labelTooltip} descricao={valor}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#f1f5f9' }}>
        {valor.slice(0, 50) + '…'}
        <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
      </span>
    </TooltipGlobal>
  )
}

/** Escopos canônicos → rótulo da coluna Teste no histórico admin. */
const MAPA_ESCOPO_PARA_NOME_TESTE: Record<string, string> = {
  LOGIN: 'Login',
  ADMIN: 'Admin',
  CONFIG: 'Configurador',
  CONFIGURADOR: 'Configurador',
  PEDIDO: 'Pedido',
  BIDFRT: 'Bid Frete Internacional',
  'BID-FRETE': 'Bid Frete Internacional',
  PROCSO: 'Processo',
  PROCESSO: 'Processo',
}

function extrairEscopoDeIdentificador(id: string): string | null {
  const limpo = id.trim().toUpperCase()
  const partes = limpo.split('-')
  if (partes[0] !== 'TST' || partes.length < 3) return null
  if (partes[1] === 'EMT' && partes.length >= 4) {
    if (partes[2] === 'BID' && partes[3] === 'FRETE') return 'BID-FRETE'
    return partes[2]
  }
  if (partes.length >= 4) return partes[2]
  return null
}

function resolverNomeTeste(modulo: string, teste: string): string {
  for (const id of [teste, modulo]) {
    const escopo = extrairEscopoDeIdentificador(id)
    if (escopo && MAPA_ESCOPO_PARA_NOME_TESTE[escopo]) {
      return MAPA_ESCOPO_PARA_NOME_TESTE[escopo]
    }
  }
  const texto = `${modulo} ${teste}`.toLowerCase()
  if (texto.includes('login')) return 'Login'
  if (texto.includes('admin')) return 'Admin'
  if (texto.includes('configurador') || texto.includes('/config')) return 'Configurador'
  if (texto.includes('pedido')) return 'Pedido'
  if (texto.includes('bid-frete') || texto.includes('bidfrete') || texto.includes('bidfrt')) return 'Bid Frete Internacional'
  if (texto.includes('processo') || texto.includes('procso')) return 'Processo'
  return modulo !== 'N/A' ? modulo : teste
}

function contarPassosTeste(item: Pick<LogTeste, 'tipo' | 'successLog' | 'erroLog' | 'resultado' | 'quantidadePassos'>): {
  total: number
  aprovados: number
  reprovados: number
} {
  if (item.quantidadePassos != null && item.quantidadePassos > 0 && item.tipo !== 'EMT') {
    const total = item.quantidadePassos
    if (item.resultado === 'APROVADO') return { total, aprovados: total, reprovados: 0 }
    if (item.resultado === 'REPROVADO' || item.resultado === 'ERRO_CATASTROFICO') {
      return { total, aprovados: 0, reprovados: total }
    }
    return { total, aprovados: total, reprovados: 0 }
  }
  if (item.tipo === 'EMT') return contarPassosEmt(item)
  if (item.resultado === 'APROVADO') return { total: 1, aprovados: 1, reprovados: 0 }
  if (item.resultado === 'REPROVADO' || item.resultado === 'ERRO_CATASTROFICO') {
    return { total: 1, aprovados: 0, reprovados: 1 }
  }
  return { total: 1, aprovados: 1, reprovados: 0 }
}

function calcularPercentuaisResultado(item: Pick<LogTeste, 'tipo' | 'successLog' | 'erroLog' | 'resultado'>): {
  pctAprovado: number
  pctReprovado: number
} {
  if (item.tipo === 'EMT') return calcularPercentuaisEmt(item)
  const { total, aprovados, reprovados } = contarPassosTeste(item)
  if (total === 0) return { pctAprovado: 0, pctReprovado: 0 }
  return {
    pctAprovado: Math.round((aprovados / total) * 100),
    pctReprovado: Math.round((reprovados / total) * 100),
  }
}

function formatarDuracaoMinutosSegundos(duracao: string): string {
  if (!duracao || duracao === 'N/A') return duracao
  const match = duracao.match(/^(\d+(?:\.\d+)?)\s*ms$/i)
  if (!match) return duracao
  const totalSegundos = Math.floor(Number(match[1]) / 1000)
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  if (minutos === 0) return `${segundos}s`
  return `${minutos}min ${segundos}s`
}

/** Extrai pasta relativa a partir do success_log (linha "Pasta: ..."). */
function extrairEmtPastaRelativa(texto?: string | null): string | undefined {
  if (!texto) return undefined
  const normalizado = texto.replace(/\\/g, '/')
  const idxPersist = normalizado.indexOf('data/emt-artifacts/testes/testes-em-tela/')
  if (idxPersist >= 0) {
    const trecho = normalizado.slice(idxPersist).split(/\s/)[0]?.replace(/\/+$/, '')
    if (trecho?.includes('/resultado-teste/')) return trecho
  }
  const idx = normalizado.indexOf('testes/testes-em-tela/')
  if (idx < 0) return undefined
  const trecho = normalizado.slice(idx).split(/\s/)[0]?.replace(/\/+$/, '')
  if (!trecho?.includes('/resultado-teste/')) return undefined
  return trecho
}

function resolverEmtPastaItem(item: Pick<LogTeste, 'emtPasta' | 'successLog' | 'erroLog'>): string | undefined {
  return item.emtPasta
    ?? extrairEmtPastaRelativa(item.successLog)
    ?? extrairEmtPastaRelativa(item.erroLog)
}

const COLUNAS_EMT_TABELA = [
  'Ambiente',
  'Produto',
  'Local',
  'Sublocal',
  'O que foi feito',
  'Resultado',
] as const

type StatusPrintEmt = 'aprovado' | 'reprovado' | 'neutro'

/**
 * Associa cada print (📸) ao próximo ✓/✗ no log — mesma ordem do runner.
 * Prints pendentes no fim herdam o resultado global do run.
 */
function mapearResultadoPrintsEmt(
  linhas: string[],
  resultadoRun: Resultado,
): Map<string, StatusPrintEmt> {
  const map = new Map<string, StatusPrintEmt>()
  const pendentes: string[] = []

  const flush = (status: StatusPrintEmt) => {
    for (const nome of pendentes) map.set(nome, status)
    pendentes.length = 0
  }

  for (const linha of linhas) {
    if (linha.startsWith('📸')) {
      const arquivo = linha.replace(/^📸\s*/, '').trim()
      if (arquivo) pendentes.push(arquivo)
      continue
    }
    if (linha.startsWith('✓')) {
      flush('aprovado')
      continue
    }
    if (linha.startsWith('✗')) {
      flush('reprovado')
    }
  }

  const fallback: StatusPrintEmt = resultadoRun === 'APROVADO' ? 'aprovado' : 'reprovado'
  for (const nome of pendentes) {
    if (/99-erro/i.test(nome)) map.set(nome, 'reprovado')
    else map.set(nome, fallback)
  }

  return map
}

function estiloBordaPrintEmt(status: StatusPrintEmt): React.CSSProperties {
  if (status === 'aprovado') {
    return {
      border: '2px solid #10b981',
      boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.15)',
    }
  }
  if (status === 'reprovado') {
    return {
      border: '2px solid #ef4444',
      boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.15)',
    }
  }
  return { border: '1px solid rgba(255,255,255,0.08)' }
}

/** Larguras fixas compartilhadas — aprovado e reprovado na mesma grade. */
const EMT_COL_LARGURAS = ['9%', '9%', '8%', '15%', '51%', '8%'] as const

const EMT_CELULA_PAD = '0.55rem 0.65rem'

/** Tipografia padrão Solid Slate (Plus Jakarta Sans via --font). */
const FONTE_UI = "var(--font, 'Plus Jakarta Sans', system-ui, sans-serif)"
/** Mono reservado a trechos de código (paths, diff). */
const FONTE_MONO = 'var(--font-mono, ui-monospace, monospace)'
/** Evita URLs/paths longos invadirem colunas vizinhas no grid. */
const TEXTO_QUEBRA_LONGO: React.CSSProperties = {
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  maxWidth: '100%',
}
const COLUNA_GRID_IA: React.CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
}

function EmtLinhaChecklist({
  row,
  variante,
  indice,
  total,
}: {
  row: LinhaEmtTabela
  variante: 'aprovado' | 'reprovado'
  indice: number
  total: number
}) {
  const corBorda = variante === 'aprovado' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'
  const corTexto = variante === 'aprovado' ? '#d1fae5' : '#fecaca'
  const corResultado = variante === 'aprovado' ? '#10b981' : '#ef4444'

  return (
    <tr
      style={{
        borderBottom: indice < total - 1 ? `1px solid ${corBorda}` : undefined,
        background: indice % 2 === 0 ? 'rgba(15,23,42,0.35)' : 'transparent',
      }}
    >
      <td style={{ padding: EMT_CELULA_PAD, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.ambiente}</td>
      <td style={{ padding: EMT_CELULA_PAD, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.produto}</td>
      <td style={{ padding: EMT_CELULA_PAD, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.local}</td>
      <td style={{ padding: EMT_CELULA_PAD, color: '#e2e8f0', whiteSpace: 'nowrap', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.sublocal}</td>
      <td style={{ padding: EMT_CELULA_PAD, color: corTexto, wordBreak: 'break-word', verticalAlign: 'top' }}>{row.acao}</td>
      <td style={{ padding: EMT_CELULA_PAD, color: corResultado, fontWeight: 700, whiteSpace: 'nowrap' }}>{row.resultado}</td>
    </tr>
  )
}

function EmtTabelaChecklistBloco({
  titulo,
  linhas,
  variante,
}: {
  titulo: string
  linhas: LinhaEmtTabela[]
  variante: 'aprovado' | 'reprovado'
}) {
  if (linhas.length === 0) return null

  const corBordaCard = variante === 'aprovado' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
  const corBordaCabecalho = variante === 'aprovado' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'
  const corTitulo = variante === 'aprovado' ? '#34d399' : '#f87171'
  const corCabecalhoCol = variante === 'aprovado' ? '#34d399' : '#f87171'

  return (
    <div style={{
      background: 'var(--ws-bg-body, #0f172a)',
      borderRadius: '8px',
      border: `1px solid ${corBordaCard}`,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.6rem 1rem',
        borderBottom: `1px solid ${corBordaCabecalho}`,
        fontSize: '0.7rem',
        fontWeight: 800,
        letterSpacing: '0.06em',
        color: corTitulo,
        textTransform: 'uppercase',
      }}>
        {titulo}
      </div>
      <div style={{ overflowX: 'auto', padding: '0.75rem 1rem' }}>
        <table style={{
          width: '100%',
          minWidth: 920,
          tableLayout: 'fixed',
          borderCollapse: 'collapse',
          fontSize: '0.78rem',
          fontFamily: FONTE_UI,
        }}>
          <colgroup>
            {EMT_COL_LARGURAS.map((largura, i) => (
              <col key={i} style={{ width: largura }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: `1px solid ${corBordaCabecalho}` }}>
              {COLUNAS_EMT_TABELA.map(col => (
                <th
                  key={col}
                  style={{
                    padding: EMT_CELULA_PAD,
                    textAlign: 'left',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: corCabecalhoCol,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((row, i) => (
              <EmtLinhaChecklist
                key={i}
                row={row}
                variante={variante}
                indice={i}
                total={linhas.length}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type HandlersAnaliseIaTeste = {
  onReanalyze: (id: string, opts?: { silent?: boolean }) => void | Promise<void>
  onApplyFix: (id: string) => void
  onReject: (id: string) => void
}

function PainelAnaliseIaTeste({
  item,
  handlers,
  mostrarSemAnalise = false,
}: {
  item: LogTeste
  handlers: HandlersAnaliseIaTeste
  mostrarSemAnalise?: boolean
}) {
  const { t } = useTranslation()
  const [analisando, setAnalisando] = useState(false)
  const autoDisparadoRef = useRef(false)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!mostrarSemAnalise || item.aiAnalise || item.aiRejected) return
    if (autoDisparadoRef.current) return
    autoDisparadoRef.current = true
    setAnalisando(true)
    void Promise.resolve(handlersRef.current.onReanalyze(item.id, { silent: true }))
      .finally(() => setAnalisando(false))
  }, [item.id, item.aiAnalise, item.aiRejected, mostrarSemAnalise])

  if (!item.aiAnalise && !mostrarSemAnalise) return null

  if (!item.aiAnalise) {
    if (analisando) {
      return (
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          padding: '1.25rem',
          fontFamily: FONTE_UI,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#c4b5fd' }}>
            <SpinnerGap size={22} weight="bold" style={{ animation: 'ws-running-spin 0.9s linear infinite', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>
                {t('admin.testes-gerais.expandido_ia_titulo')}
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Analisando falha automaticamente…
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{
        background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
        overflow: 'hidden',
        fontFamily: FONTE_UI,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '8px',
              background: 'rgba(139,92,246,0.2)', color: '#c084fc',
            }}>
              <Sparkle size={18} weight="fill" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                {t('admin.testes-gerais.expandido_ia_titulo')}
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#a78bfa', margin: 0 }}>
                {t('admin.testes-gerais.expandido_ia_subtitulo')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handlers.onReanalyze(item.id)}
            style={{
              padding: '0.3rem 0.7rem', borderRadius: '6px',
              background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)',
              color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Reanalisar
          </button>
        </div>
        <p style={{ margin: 0, padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
          Nenhuma análise disponível ainda. Use Reanalisar para a IA investigar esta falha e sugerir correção em um clique.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(139, 92, 246, 0.4)',
      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
      position: 'relative', overflow: 'hidden',
      fontFamily: FONTE_UI,
    }}>
      <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '150%', height: '100%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'rgba(139,92,246,0.2)', color: '#c084fc', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}>
            <Sparkle size={18} weight="fill" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{t('admin.testes-gerais.expandido_ia_titulo')}</h4>
            <p style={{ fontSize: '0.75rem', color: '#a78bfa', margin: 0 }}>
              {item.aiAnalise.modeloUsado ? `via ${item.aiAnalise.modeloUsado}` : t('admin.testes-gerais.expandido_ia_subtitulo')}
            </p>
          </div>
          {item.aiAnalise.categoria && (() => {
            const catColors: Record<string, { bg: string; border: string; text: string }> = {
              BUG_REAL:             { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
              TESTE_DESATUALIZADO:  { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#eab308' },
              FLAKY_TIMING:         { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.4)', text: '#fb923c' },
              REGRESSAO_RECENTE:    { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#a855f7' },
              INFRA:                { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.4)', text: '#94a3b8' },
              NAO_CLASSIFICAVEL:    { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', text: '#64748b' },
            }
            const c = catColors[item.aiAnalise!.categoria!] ?? catColors.NAO_CLASSIFICAVEL
            return (
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                {item.aiAnalise!.categoria!.replace(/_/g, ' ')}
              </span>
            )
          })()}
          {item.aiAnalise.confianca && (() => {
            const confColors: Record<string, { bg: string; border: string; text: string }> = {
              alta:  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#10b981' },
              media: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#eab308' },
              baixa: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', text: '#64748b' },
            }
            const c = confColors[item.aiAnalise!.confianca!] ?? confColors.baixa
            return (
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: '0.65rem', fontWeight: 800 }}>
                {item.aiAnalise!.confianca}
              </span>
            )
          })()}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          {item.aiAnalise.confianca === 'alta' && item.aiAnalise.codigoDiff && (
            <button
              type="button"
              onClick={() => handlers.onApplyFix(item.id)}
              style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {t('admin.testes-gerais.expandido_ia_corrigir')}
            </button>
          )}
          <button
            type="button"
            onClick={() => handlers.onReanalyze(item.id)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Reanalisar
          </button>
          <button
            type="button"
            onClick={() => handlers.onReject(item.id)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Rejeitar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '1rem', padding: '1.25rem', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', ...COLUNA_GRID_IA }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{t('admin.testes-gerais.expandido_ia_o_que_e')}</span>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#f8fafc', ...TEXTO_QUEBRA_LONGO }}>{item.aiAnalise.erroResumo}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{t('admin.testes-gerais.expandido_ia_motivo')}</span>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0, ...TEXTO_QUEBRA_LONGO }}>{item.aiAnalise.motivo}</p>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{t('admin.testes-gerais.expandido_ia_onde')}</span>
            <code style={{ display: 'block', padding: '0.3rem 0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#e2e8f0', fontSize: '0.75rem', fontFamily: FONTE_MONO, ...TEXTO_QUEBRA_LONGO }}>
              {item.aiAnalise.arquivo}
            </code>
          </div>
          {item.aiAnalise.commitSuspeito && (
            <div style={{ padding: '0.75rem', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '8px' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.4rem' }}>COMMIT SUSPEITO</span>
              <code style={{ fontSize: '0.75rem', color: '#e2e8f0', fontFamily: FONTE_MONO }}>
                {item.aiAnalise.commitSuspeito.hash.slice(0, 7)}
              </code>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}> por {item.aiAnalise.commitSuspeito.autor} em {item.aiAnalise.commitSuspeito.data}</span>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>{item.aiAnalise.commitSuspeito.mensagem}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', ...COLUNA_GRID_IA }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{t('admin.testes-gerais.expandido_ia_correcao')}</span>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0, ...TEXTO_QUEBRA_LONGO }}>{item.aiAnalise.sugestaoCorrecao}</p>
          </div>

          {item.aiAnalise.codigoDiff && (
            <div style={{ marginTop: '0.5rem', fontFamily: FONTE_MONO, fontSize: '0.75rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)' }}>
              {item.aiAnalise.codigoDiff.explicacao && (
                <div style={{ background: 'rgba(139,92,246,0.08)', color: '#a78bfa', padding: '0.35rem 0.75rem', fontSize: '0.7rem', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                  {item.aiAnalise.codigoDiff.arquivo && <span style={{ color: '#64748b' }}>{item.aiAnalise.codigoDiff.arquivo}{item.aiAnalise.codigoDiff.linha ? `:${item.aiAnalise.codigoDiff.linha}` : ''} — </span>}
                  {item.aiAnalise.codigoDiff.explicacao}
                </div>
              )}
              <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ opacity: 0.5, userSelect: 'none' }}>-</span>
                <span style={{ whiteSpace: 'pre-wrap' }}>{item.aiAnalise.codigoDiff.old}</span>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ opacity: 0.5, userSelect: 'none' }}>+</span>
                <span style={{ whiteSpace: 'pre-wrap' }}>{item.aiAnalise.codigoDiff.new}</span>
              </div>
            </div>
          )}

          {item.aiAnalise.provaVisual && (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#f87171', marginBottom: '0.5rem' }}>
                {t('admin.testes-gerais.expandido_ia_prova_visual')}
              </span>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <img src={item.aiAnalise.provaVisual} alt={t('admin.testes-gerais.expandido_ia_evidencia_alt')} style={{ width: '100%', display: 'block' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function urlDevPrintEmt(emtPasta: string, arquivo: string): string {
  return `/dev-emt-artifacts/${emtPasta}/${encodeURIComponent(arquivo)}`
}

type ModoPrintEmt = 'dev' | 'api' | 'erro'

function LightboxPrintEmt({
  src,
  arquivo,
  onFechar,
}: {
  src: string
  arquivo: string
  onFechar: () => void
}) {
  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', onKey)
    }
  }, [onFechar])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Print ampliado: ${arquivo}`}
      onClick={onFechar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(2, 6, 23, 0.94)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.75rem',
          flexShrink: 0,
        }}
      >
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#e2e8f0',
          fontFamily: FONTE_UI,
        }}>
          {arquivo}
        </span>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar print ampliado"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(15,23,42,0.8)',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <X size={14} weight="bold" />
          Fechar
        </button>
      </div>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingBottom: '1rem',
        }}
      >
        <img
          src={src}
          alt={arquivo}
          style={{
            display: 'block',
            width: 'auto',
            height: 'auto',
            maxWidth: 'none',
            borderRadius: '8px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
          }}
        />
      </div>
      <p style={{
        margin: 0,
        flexShrink: 0,
        fontSize: '0.68rem',
        color: '#64748b',
        textAlign: 'center',
      }}>
        Clique fora ou pressione Esc para fechar · role para ver detalhes
      </p>
    </div>,
    document.body,
  )
}

function EmtPrintImagem({ logId, arquivo, emtPasta }: { logId: string; arquivo: string; emtPasta?: string }) {
  const preferirDev = import.meta.env.DEV && Boolean(emtPasta)
  const [modo, setModo] = useState<ModoPrintEmt>(preferirDev ? 'dev' : 'api')
  const [apiSrc, setApiSrc] = useState<string | null>(null)
  const [ampliado, setAmpliado] = useState(false)

  useEffect(() => {
    setModo(preferirDev ? 'dev' : 'api')
    setApiSrc(null)
    setAmpliado(false)
  }, [logId, arquivo, emtPasta, preferirDev])

  useEffect(() => {
    if (modo !== 'api') return

    let cancelado = false
    let objectUrl: string | null = null
    const url = `/api/v1/admin/testes/emt-print/${encodeURIComponent(logId)}/${encodeURIComponent(arquivo)}`

    apiFetchBlob(url, { signal: AbortSignal.timeout(EMT_PRINT_API_TIMEOUT_MS) })
      .then(res => {
        if (!res.ok) throw new Error(String(res.status))
        return res.blob()
      })
      .then(blob => {
        if (cancelado) return
        if (blob.size === 0) throw new Error('empty blob')
        objectUrl = URL.createObjectURL(blob)
        setApiSrc(objectUrl)
      })
      .catch(() => { if (!cancelado) setModo('erro') })

    return () => {
      cancelado = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [modo, logId, arquivo])

  if (modo === 'erro') {
    return (
      <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center' }}>
        Print indisponível
      </div>
    )
  }

  const srcAtual = modo === 'dev' && emtPasta
    ? urlDevPrintEmt(emtPasta, arquivo)
    : apiSrc

  if (srcAtual) {
    return (
      <>
        <img
          src={srcAtual}
          alt={arquivo}
          title="Clique para ampliar"
          onClick={() => setAmpliado(true)}
          onError={() => { if (modo === 'dev') setModo('api') }}
          style={{
            width: '100%',
            display: 'block',
            borderRadius: '6px',
            cursor: 'zoom-in',
          }}
        />
        {ampliado && (
          <LightboxPrintEmt
            src={srcAtual}
            arquivo={arquivo}
            onFechar={() => setAmpliado(false)}
          />
        )}
      </>
    )
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Carregando print…</span>
    </div>
  )
}

function PainelEmtExpandido({
  item,
  handlersAnaliseIa,
}: {
  item: LogTeste
  handlersAnaliseIa: HandlersAnaliseIaTeste
}) {
  const estadoEmt = resolverEstadoEmtUi(item)
  const linhas = filtrarLinhasLogEmt(item.successLog ?? item.erroLog ?? '')
  const { aprovadas, reprovadas, tabelaAprovadas, tabelaReprovadas } = estadoEmt?.classificacao
    ?? classificarLinhasLogEmt(linhas)
  const printsLog = linhas.filter(l => l.startsWith('📸')).map(l => l.replace('📸', '').trim())
  const arquivosPrint = item.emtPrints?.length ? item.emtPrints : printsLog
  const resultadoEfetivo = resultadoEfetivoEmt(item)
  const statusPorPrint = mapearResultadoPrintsEmt(linhas, resultadoEfetivo)
  const logCompleto = item.erroLog ?? item.successLog

  const aprovado = estadoEmt?.aprovado ?? item.resultado === 'APROVADO'
  const emtPastaResolvida = resolverEmtPastaItem(item)

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1rem', borderRadius: '8px',
        background: aprovado ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.06)',
        border: `1px solid ${aprovado ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.2)'}`,
        color: aprovado ? '#10b981' : '#f87171',
      }}>
        {aprovado ? <CheckCircle size={20} weight="fill" /> : <Warning size={20} weight="bold" />}
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          {aprovado ? 'EMT aprovado — checklist e evidências abaixo' : 'EMT reprovado — falhas, IA e log abaixo'}
        </span>
        {estadoEmt?.falhaNaoDetalhada && (
          <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#fca5a5', marginLeft: '0.25rem' }}>
            (falha global sem detalhe no log exibido)
          </span>
        )}
      </div>

      <EmtTabelaChecklistBloco
        titulo="O que foi aprovado"
        linhas={tabelaAprovadas}
        variante="aprovado"
      />

      <EmtTabelaChecklistBloco
        titulo="O que foi reprovado"
        linhas={tabelaReprovadas}
        variante="reprovado"
      />

      {aprovadas.length > 0 && (
        <div style={{ background: 'var(--ws-bg-body, #0f172a)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', overflow: 'hidden' }}>
          <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(16,185,129,0.15)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', color: '#34d399', textTransform: 'uppercase' }}>
            O que foi aprovado (legado)
          </div>
          <ul style={{ margin: 0, padding: '0.75rem 1rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {aprovadas.map((texto, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', fontFamily: FONTE_UI }}>
                <CheckCircle size={16} weight="fill" color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: '#d1fae5' }}>{texto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reprovadas.length > 0 && (
        <div style={{ background: 'var(--ws-bg-body, #0f172a)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden' }}>
          <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(239,68,68,0.15)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', color: '#f87171', textTransform: 'uppercase' }}>
            O que foi reprovado (legado)
          </div>
          <ul style={{ margin: 0, padding: '0.75rem 1rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {reprovadas.map((texto, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', fontFamily: FONTE_UI }}>
                <XCircle size={16} weight="fill" color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: '#fecaca' }}>{texto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <PainelAnaliseIaTeste
        item={item}
        handlers={handlersAnaliseIa}
        mostrarSemAnalise={!aprovado}
      />

      {arquivosPrint.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', color: '#fbbf24', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Prints ({arquivosPrint.length})
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}>
            {arquivosPrint.map(arquivo => {
              const statusPrint = statusPorPrint.get(arquivo)
                ?? (resultadoEfetivo === 'APROVADO' ? 'aprovado' : 'reprovado')
              const corRotulo = statusPrint === 'aprovado' ? '#34d399' : statusPrint === 'reprovado' ? '#f87171' : '#94a3b8'
              return (
              <div key={arquivo} style={{
                borderRadius: '10px', overflow: 'hidden',
                ...estiloBordaPrintEmt(statusPrint),
                background: statusPrint === 'aprovado'
                  ? 'rgba(16, 185, 129, 0.04)'
                  : statusPrint === 'reprovado'
                    ? 'rgba(239, 68, 68, 0.04)'
                    : 'rgba(15,23,42,0.6)',
              }}>
                <div style={{
                  padding: '0.4rem 0.65rem', fontSize: '0.68rem', fontWeight: 700,
                  color: corRotulo,
                  borderBottom: `1px solid ${statusPrint === 'aprovado' ? 'rgba(16,185,129,0.2)' : statusPrint === 'reprovado' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  {arquivo}
                </div>
                <EmtPrintImagem logId={item.id} arquivo={arquivo} emtPasta={emtPastaResolvida} />
              </div>
              )
            })}
          </div>
        </div>
      )}

      {logCompleto && (
        <div style={{ background: 'var(--ws-bg-body, #0f172a)', borderRadius: '8px', border: '1px solid rgba(100,116,139,0.25)', overflow: 'hidden' }}>
          <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(100,116,139,0.2)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', color: '#94a3b8', textTransform: 'uppercase' }}>
            Log de execução
          </div>
          <code style={{
            display: 'block', padding: '1rem',
            color: aprovado ? '#cbd5e1' : '#fca5a5',
            fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontFamily: FONTE_UI,
          }}>
            {logCompleto}
          </code>
        </div>
      )}
    </div>
  )
}

// Helper: mapeia dados do backend para o formato do frontend
function mapTestesToLocal(log: TesteApi): LogTeste {
  const created = new Date(log.data_criacao_teste)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const data = `${pad(created.getDate())}/${pad(created.getMonth() + 1)}/${created.getFullYear()}`
  const hora = `${pad(created.getHours())}:${pad(created.getMinutes())}:${pad(created.getSeconds())}`
  const resultadoRaw = log.resultado_teste
  const resultado: Resultado = resultadoRaw === 'ERRO' ? 'ERRO_CATASTROFICO' : (resultadoRaw as Resultado) || 'APROVADO'
  return {
    id: log.id_teste,
    dataHora: `${data} ${hora}`,
    createdAtMs: created.getTime(),
    tipo: (log.tipo_teste as TipoTeste) || 'E2E',
    modulo: log.modulo_teste || 'N/A',
    teste: log.nome_teste || 'N/A',
    resultado,
    duracao: log.duracao_teste || 'N/A',
    quantidadePassos: log.quantidade_passos_teste,
    erroLog: log.log_erro_teste ?? undefined,
    successLog: log.log_sucesso_teste ?? undefined,
    emtPrints: Array.isArray(log.lista_prints_emt_teste) ? log.lista_prints_emt_teste : undefined,
    emtPasta: typeof log.pasta_emt_teste === 'string' && log.pasta_emt_teste.length > 0 ? log.pasta_emt_teste : undefined,
    aiAnalise: log.analise_ia_teste ? {
      erroResumo: (log.analise_ia_teste as Record<string, string>).erroResumo ?? '',
      motivo: (log.analise_ia_teste as Record<string, string>).motivo ?? '',
      sugestaoCorrecao: (log.analise_ia_teste as Record<string, string>).sugestaoCorrecao ?? '',
      arquivo: (log.analise_ia_teste as Record<string, string>).arquivo ?? '',
      codigoDiff: (log.analise_ia_teste as Record<string, unknown>).codigoDiff as LogTeste['aiAnalise'] extends undefined ? never : NonNullable<LogTeste['aiAnalise']>['codigoDiff'],
      categoria: (log.analise_ia_teste as Record<string, string>).categoria as LogTeste['aiAnalise'] extends undefined ? never : NonNullable<LogTeste['aiAnalise']>['categoria'],
      confianca: (log.analise_ia_teste as Record<string, string>).confianca as LogTeste['aiAnalise'] extends undefined ? never : NonNullable<LogTeste['aiAnalise']>['confianca'],
      commitSuspeito: (log.analise_ia_teste as Record<string, unknown>).commitSuspeito as LogTeste['aiAnalise'] extends undefined ? never : NonNullable<LogTeste['aiAnalise']>['commitSuspeito'],
      modeloUsado: (log.analise_ia_teste as Record<string, string>).modeloUsado,
    } : undefined,
    aiRejected: Boolean((log.analise_ia_teste as Record<string, unknown> | null)?.rejeitado),
  }
}

export function LogTestes() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)
  const addAviso = useShellStore((s) => s.addAviso)
  const [dados, setDados] = useState<LogTeste[]>([])
  const [carregando, setCarregando] = useState(true)
  const [execucoesAtivas, setExecucoesAtivas] = useState<ExecucaoTesteStatusApi[]>([])
  const [limiteExecucoes, setLimiteExecucoes] = useState(3)
  const [abaAtiva, setAbaAtiva] = useState<AbaTestesGerais>('executados')
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false)
  const [modalExecutarAberto, setModalExecutarAberto] = useState(false)
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(false)
  const [catalogoPlanos, setCatalogoPlanos] = useState<Map<string, PlanoFavoritoResumoOrigem>>(new Map())
  const execucoesAnterioresRef = useRef<Set<string>>(new Set())
  /** IDs já presentes no histórico antes do run — toast conta só entradas novas. */
  const baselineIdsRef = useRef<Set<string>>(new Set())

  const temExecucoesAtivas = execucoesAtivas.length > 0
  const noLimiteExecucoes = execucoesAtivas.length >= limiteExecucoes

  async function carregarStatusExecucoes(): Promise<ExecucaoTesteStatusApi[]> {
    try {
      const status = await adminTestesApi.status()
      setExecucoesAtivas(status.execucoes_teste)
      setLimiteExecucoes(status.limite_execucoes_simultaneas_teste)
      execucoesAnterioresRef.current = new Set(status.execucoes_teste.map(e => e.id_execucao_teste))
      return status.execucoes_teste
    } catch {
      return execucoesAtivas
    }
  }

  async function loadLogs(): Promise<LogTeste[]> {
    try {
      setCarregando(true)
      const res = await adminTestesApi.listar()
      const novos = res.logs.map(mapTestesToLocal)
      setDados(novos)
      return novos
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : t('admin.testes-gerais.msg_erro_carregar') })
      return []
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { loadLogs() }, [])

  useEffect(() => {
    adminPlanosTesteApi.listar()
      .then(({ planos }) => {
        setCatalogoPlanos(new Map(planos.map(p => [p.id, p])))
      })
      .catch(() => { /* histórico ainda exibe fallback pelo test_name gravado */ })
  }, [])

  // Carrega status do agendamento na montagem
  useEffect(() => {
    adminAgendamentosTesteApi.listar()
      .then(({ schedules }) => {
        if (schedules.length) {
          const s = schedules[0] as Record<string, unknown>
          setAgendamentoAtivo(Boolean(s.ativo_agendamento_teste))
        }
      })
      .catch(() => {})
  }, [])

  // Auto-detecta runs em progresso quando a tela monta (resiliente a F5 / navegação)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const ativas = await carregarStatusExecucoes()
        if (!cancelled && ativas.length > 0) setAbaAtiva('em_execucao')
      } catch { /* offline / erro — ignora */ }
    })()
    return () => { cancelled = true }
  }, [])

  // Polling enquanto há execuções ativas.
  useEffect(() => {
    if (!temExecucoesAtivas) return
    let stopped = false

    async function handleCompletion() {
      // Runner EMT detached pode gravar alguns segundos após o marker sumir — tenta de novo.
      let novosLogs: LogTeste[] = []
      let destaRun: LogTeste[] = []
      for (let tentativa = 0; tentativa < 10; tentativa++) {
        novosLogs = await loadLogs()
        destaRun = novosLogs.filter(d => !baselineIdsRef.current.has(d.id))
        if (destaRun.length > 0) break
        if (tentativa < 9) await new Promise(r => setTimeout(r, 1500))
      }

      if (destaRun.length === 0) {
        addNotification({
          type: 'warning',
          message:
            'Execução encerrou sem gravar linhas novas no histórico. '
            + 'Causa comum: cfg-back reiniciou (tsx watch) durante o run. '
            + 'Aguarde ~2 min e rode de novo sem reiniciar serviços.',
        })
        addAviso({
          conteudo: 'Execução de testes encerrou sem novas entradas no histórico. Clique para revisar a tela.',
          autor: { nome: 'Motor de Testes' },
          tipo: 'aviso',
          href: '/admin/testes-gerais',
        })
        return
      }

      const totalRun   = destaRun.length
      const aprovRun   = destaRun.filter(d => d.resultado === 'APROVADO').length
      const reprovRun  = destaRun.filter(d => d.resultado === 'REPROVADO').length
      const tudoVerde  = reprovRun === 0 && totalRun > 0
      const resultado  = tudoVerde
        ? `${aprovRun}/${totalRun} aprovados`
        : `${aprovRun} aprovados · ${reprovRun} reprovados`

      addNotification({
        type: tudoVerde ? 'success' : 'error',
        message: tudoVerde
          ? `Execução concluída: ${resultado}`
          : `Execução concluída com falhas: ${resultado}`,
      })

      addAviso({
        conteudo: tudoVerde
          ? `Execução de testes concluída — ${resultado}. Clique para abrir a tela.`
          : `Execução de testes concluída com falhas — ${resultado}. Clique para ver detalhes.`,
        autor: { nome: 'Motor de Testes' },
        tipo: tudoVerde ? 'sistema' : 'aviso',
        href: '/admin/testes-gerais',
      })
    }

    async function tick() {
      if (stopped) return
      try {
        const idsAntes = execucoesAnterioresRef.current
        const ativas = await carregarStatusExecucoes()
        const idsAgora = new Set(ativas.map(e => e.id_execucao_teste))
        const algumaConcluiu = [...idsAntes].some(id => !idsAgora.has(id))
        execucoesAnterioresRef.current = idsAgora

        if (algumaConcluiu) {
          await handleCompletion()
        }
        if (ativas.length === 0) {
          stopped = true
        }
      } catch { /* ignora falha de polling */ }
    }

    // Primeira verificação imediata — pega o caso de testes que já terminaram
    // antes do primeiro tick do intervalo.
    tick()
    const interval = setInterval(tick, 3000)
    return () => { stopped = true; clearInterval(interval) }
  }, [temExecucoesAtivas])

  const logs7d = useMemo(() => filtrarLogsPorDias(dados, 7), [dados])
  const logs30d = useMemo(() => filtrarLogsPorDias(dados, 30), [dados])
  const passos7d = useMemo(() => somarPassosAprovacao(logs7d), [logs7d])
  const passos30d = useMemo(() => somarPassosAprovacao(logs30d), [logs30d])
  const erros7d = useMemo(() => somarPassosErro(logs7d), [logs7d])
  const erros30d = useMemo(() => somarPassosErro(logs30d), [logs30d])
  const passosPorTipo30d = useMemo(() => somarPassosPorTipo(logs30d), [logs30d])

  const legendaTipos30d = useMemo(() => {
    return (['UNITARIO', 'FUNCIONAL', 'E2E', 'EMT'] as TipoTeste[])
      .map(tipo => ({ tipo, passos: passosPorTipo30d[tipo] }))
      .filter(e => e.passos > 0)
      .sort((a, b) => b.passos - a.passos)
  }, [passosPorTipo30d])

  const totalPassosTipo30d = legendaTipos30d.reduce((s, e) => s + e.passos, 0)
  const passosDominanteTipo30d = legendaTipos30d[0]?.passos ?? 0

  // Handlers para os botões de ação Gemini
  const handleReanalyze = async (id: string, opts?: { silent?: boolean }) => {
    try {
      await adminTestesApi.reanalisar(id)
      if (!opts?.silent) {
        addNotification({ type: 'success', message: 'Re-análise concluída' })
      }
      await loadLogs()
    } catch (err) {
      if (!opts?.silent) {
        addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao reanalisar' })
      }
    }
  }

  const handleApplyFix = async (id: string) => {
    try {
      const res = await adminTestesApi.aplicarCorrecao(id)
      addNotification({ type: 'success', message: `Correção aplicada em ${res.arquivo}` })
      await loadLogs()
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao aplicar correção' })
    }
  }

  const handleReject = async (id: string) => {
    const motivo = window.prompt('Motivo da rejeição (min 10 chars):')
    if (!motivo || motivo.length < 10) return
    try {
      await adminTestesApi.rejeitar(id, motivo)
      addNotification({ type: 'success', message: 'Análise rejeitada — feedback registrado' })
      await loadLogs()
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao rejeitar' })
    }
  }

  const colunas: TabelaGlobalColuna<LogTeste>[] = [
    {
      key: 'dataHora', label: t('admin.testes-gerais.col_data_hora'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_data_hora'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_data_hora_desc'),
    },
    {
      key: 'tipo',
      label: t('admin.testes-gerais.col_tipo'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_tipo'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_tipo_desc'),
      render: (v: TipoTeste) => (
        <span style={{
          display: 'inline-flex', padding: '0.15rem 0.6rem', borderRadius: '4px',
          background: v === 'E2E' ? 'rgba(234, 179, 8, 0.15)' : v === 'EMT' ? 'rgba(251, 191, 36, 0.15)' : v === 'UNITARIO' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(167, 139, 250, 0.15)',
          color: v === 'E2E' ? '#eab308' : v === 'EMT' ? '#fbbf24' : v === 'UNITARIO' ? '#38bdf8' : '#a78bfa',
          border: `1px solid ${v === 'E2E' ? 'rgba(234, 179, 8, 0.4)' : v === 'EMT' ? 'rgba(251, 191, 36, 0.4)' : v === 'UNITARIO' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(167, 139, 250, 0.4)'}`,
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em'
        }}>
          {v}
        </span>
      )
    },
    {
      key: 'modulo', label: t('admin.testes-gerais.col_modulo'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_modulo'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_modulo_desc'),
      getValorBruto: (item) => resolverNomeTeste(item.modulo, item.teste),
      render: (_v, item) => (
        <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
          {resolverNomeTeste(item.modulo, item.teste)}
        </span>
      ),
    },
    {
      key: 'teste', label: t('admin.testes-gerais.col_teste'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_teste'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_teste_desc'),
      getValorBruto: (item) => resolverOqueFoiTestadoLog(item.modulo, item.teste, catalogoPlanos),
      render: (_v, item) => {
        const texto = resolverOqueFoiTestadoLog(item.modulo, item.teste, catalogoPlanos)
        return renderTextoTruncado50(texto, t('admin.testes-gerais.col_teste'))
      },
    },
    {
      key: 'qtdPassos',
      label: t('admin.testes-gerais.col_qtd_passos'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_qtd_passos'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_qtd_passos_desc'),
      getValorBruto: (item) => String(contarPassosTeste(item).total),
      render: (_v, item) => {
        const { total, aprovados, reprovados } = contarPassosTeste(item)
        if (item.tipo === 'EMT' && total > 1) {
          return (
            <TooltipGlobal
              titulo={t('admin.testes-gerais.tooltip_qtd_passos')}
              descricao={`${aprovados} aprovados · ${reprovados} reprovados`}
            >
              <span style={{ fontWeight: 600, color: '#cbd5e1', fontVariantNumeric: 'tabular-nums' }}>{total}</span>
            </TooltipGlobal>
          )
        }
        return <span style={{ fontWeight: 600, color: '#cbd5e1', fontVariantNumeric: 'tabular-nums' }}>{total}</span>
      },
    },
    {
      key: 'resultado',
      label: t('admin.testes-gerais.col_resultado'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_resultado'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_resultado_desc'),
      getValorBruto: (item) => {
        const { pctAprovado, pctReprovado } = calcularPercentuaisResultado(item)
        return `Aprovado ${pctAprovado}% / Reprovado ${pctReprovado}%`
      },
      render: (_v: Resultado, item) => {
        const { pctAprovado, pctReprovado } = calcularPercentuaisResultado(item)
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em',
          }}>
            <span style={{ color: '#10b981' }}>Aprovado {pctAprovado}%</span>
            <span style={{ color: '#64748b' }}>/</span>
            <span style={{ color: '#ef4444' }}>Reprovado {pctReprovado}%</span>
          </span>
        )
      }
    },
    {
      key: 'duracao', label: t('admin.testes-gerais.col_duracao'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_duracao'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_duracao_desc'),
      getValorBruto: (item) => formatarDuracaoMinutosSegundos(item.duracao),
      render: (v) => <span style={{ color: '#94a3b8' }}>{formatarDuracaoMinutosSegundos(String(v ?? ''))}</span>
    },
  ]

  const colunasExecucao: TabelaGlobalColuna<ExecucaoTesteStatusApi>[] = [
    {
      key: 'data_inicio_execucao_teste',
      label: t('admin.testes-gerais.col_data_hora'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_data_hora'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_data_hora_desc'),
      getValorBruto: (item) => item.data_inicio_execucao_teste,
      render: (v) => {
        const d = new Date(String(v))
        if (Number.isNaN(d.getTime())) return '—'
        return (
          <span style={{ color: '#94a3b8' }}>
            {d.toLocaleDateString('pt-BR')} {d.toLocaleTimeString('pt-BR')}
          </span>
        )
      },
    },
    {
      key: 'runner_execucao_teste',
      label: t('admin.testes-gerais.col_tipo'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_tipo'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_tipo_desc'),
      getValorBruto: (item) => item.runner_execucao_teste ?? '—',
      render: (v) => {
        const tipo = String(v ?? 'EMT') as TipoTeste
        return (
          <span style={{
            display: 'inline-flex', padding: '0.15rem 0.6rem', borderRadius: '4px',
            background: tipo === 'E2E' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(251, 191, 36, 0.15)',
            color: tipo === 'E2E' ? '#eab308' : '#fbbf24',
            border: `1px solid ${tipo === 'E2E' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`,
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
          }}>
            {tipo}
          </span>
        )
      },
    },
    {
      key: 'lista_planos_execucao_teste',
      label: t('admin.testes-gerais.col_modulo'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_modulo'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_modulo_desc'),
      getValorBruto: (item) => resolverNomeTesteExecucao(item),
      render: (_, item) => (
        <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
          {resolverNomeTesteExecucao(item)}
        </span>
      ),
    },
    {
      key: 'lista_modulos_execucao_teste',
      label: t('admin.testes-gerais.col_teste'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_teste'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_teste_desc'),
      getValorBruto: (item) => resolverOqueFoiTestadoExecucao(item, catalogoPlanos),
      render: (_, item) => {
        const texto = resolverOqueFoiTestadoExecucao(item, catalogoPlanos)
        return renderTextoTruncado50(texto, t('admin.testes-gerais.col_teste'))
      },
    },
    {
      key: 'gatilho_teste',
      label: t('admin.testes-gerais.col_qtd_passos'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_qtd_passos'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_qtd_passos_desc'),
      getValorBruto: (item) => passosPrevistosExecucao(item, catalogoPlanos),
      render: (_, item) => (
        <span style={{ fontWeight: 600, color: '#cbd5e1', fontVariantNumeric: 'tabular-nums' }}>
          {passosPrevistosExecucao(item, catalogoPlanos)}
        </span>
      ),
    },
    {
      key: 'ambiente_teste',
      label: t('admin.testes-gerais.col_resultado'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_resultado'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_resultado_desc'),
      getValorBruto: () => t('admin.testes-gerais.resultado_em_execucao'),
      render: () => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
          <SpinnerGap size={14} weight="bold" style={{ animation: 'ws-running-spin 0.9s linear infinite' }} />
          {t('admin.testes-gerais.resultado_em_execucao')}
        </span>
      ),
    },
    {
      key: 'id_execucao_teste',
      label: t('admin.testes-gerais.col_duracao'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_duracao'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_duracao_desc'),
      getValorBruto: (item) => formatarDuracaoCorrente(item.data_inicio_execucao_teste),
      render: (_, item) => (
        <span style={{ color: '#10b981', fontWeight: 600 }}>
          {formatarDuracaoCorrente(item.data_inicio_execucao_teste)}
        </span>
      ),
    },
  ]

  const handlersAnaliseIa: HandlersAnaliseIaTeste = {
    onReanalyze: handleReanalyze,
    onApplyFix: handleApplyFix,
    onReject: handleReject,
  }

  const renderExpandido = (item: LogTeste) => {
    if (item.tipo === 'EMT' && (item.successLog || item.emtPrints?.length || item.erroLog)) {
      return <PainelEmtExpandido item={item} handlersAnaliseIa={handlersAnaliseIa} />
    }

    if (item.resultado === 'APROVADO') return (
       <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', margin: '0.5rem 1rem' }}>
          <CheckCircle size={20} weight="fill" /> 
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('admin.testes-gerais.expandido_sucesso')}</span>
       </div>
    )

    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Mensagem de Erro Bruta */}
        {item.erroLog && (
          <div style={{ background: 'var(--ws-bg-body, #0f172a)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
               <Warning size={16} color="#ef4444" weight="bold" />
               <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f87171' }}>{t('admin.testes-gerais.expandido_erro_titulo')}</span>
            </div>
            <div style={{ padding: '1rem' }}>
               <code style={{ color: '#fca5a5', fontFamily: FONTE_UI, fontSize: '0.85rem', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                 {item.erroLog}
               </code>
            </div>
          </div>
        )}

        <PainelAnaliseIaTeste
          item={item}
          handlers={handlersAnaliseIa}
          mostrarSemAnalise={item.resultado !== 'APROVADO'}
        />
      </div>
    )
  }

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      toolbar={
        <>
          <style>{`
            @keyframes ws-pulse-active {
              0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
              70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
              100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
            @keyframes ws-running-shimmer {
              0%   { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes ws-running-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50%      { opacity: 0.55; transform: scale(1.05); }
            }
            @keyframes ws-running-spin {
              to { transform: rotate(360deg); }
            }
            @keyframes ws-running-bar {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Bug weight="duotone" size={14} color="#818cf8" />
              {t('admin.testes-gerais.historico_titulo', { count: dados.length })}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TooltipGlobal descricao={t('admin.testes-gerais.tooltip_agendamento')}>
                <button
                  type="button"
                  onClick={() => setModalAgendamentoAberto(true)}
                  aria-label={t('admin.testes-gerais.btn_agendamento')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    height: '2.5rem', padding: '0 1rem', borderRadius: '8px',
                    background: agendamentoAtivo ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                    border: `1px solid ${agendamentoAtivo ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                    color: agendamentoAtivo ? '#10b981' : '#818cf8',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    animation: agendamentoAtivo ? 'ws-pulse-active 2s infinite' : 'none',
                  }}
                >
                  <Clock size={15} weight={agendamentoAtivo ? 'fill' : 'regular'} />
                  {t('admin.testes-gerais.btn_agendamento')}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px',
                    background: agendamentoAtivo ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)',
                    color: agendamentoAtivo ? '#10b981' : '#64748b',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    {agendamentoAtivo ? t('admin.testes-gerais.badge_ativo') : t('admin.testes-gerais.badge_inativo')}
                  </span>
                </button>
              </TooltipGlobal>
              <TooltipGlobal descricao={t('admin.testes-gerais.tooltip_rodar')}>
                <BotaoGlobal
                  variante="primario"
                  icone={temExecucoesAtivas
                    ? <SpinnerGap size={16} weight="bold" style={{ animation: 'ws-running-spin 0.9s linear infinite' }} />
                    : <PlayCircle size={16} weight="bold" />
                  }
                  onClick={() => setModalExecutarAberto(true)}
                  disabled={noLimiteExecucoes}
                >
                  {temExecucoesAtivas
                    ? t('admin.testes-gerais.btn_rodando_count', { count: execucoesAtivas.length })
                    : t('admin.testes-gerais.btn_rodar')}
                </BotaoGlobal>
              </TooltipGlobal>
            </div>
          </div>
        </>
      }
      stats={
        <>
          <CardGraficoGlobal
            titulo={t('admin.testes-gerais.card_pizza_7d')}
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#34d399' }} />}
            total={passos7d.total}
            valorPrincipal={passos7d.aprovados}
            corGauge="#34d399"
            legenda={[
              { label: t('admin.testes-gerais.legenda_aprovados'), valor: passos7d.aprovados, cor: 'green' },
              { label: t('admin.testes-gerais.legenda_reprovados'), valor: passos7d.reprovados, cor: 'red' },
            ]}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('admin.testes-gerais.legenda_aprovados')}</span>
                  <strong style={{ color: '#34d399' }}>{passos7d.aprovados}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('admin.testes-gerais.legenda_reprovados')}</span>
                  <strong style={{ color: '#f87171' }}>{passos7d.reprovados}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>{t('admin.testes-gerais.card_pizza_taxa_aprovacao')}</span>
                  <strong style={{ color: '#34d399' }}>
                    {passos7d.total ? Math.round((passos7d.aprovados / passos7d.total) * 100) : 0}%
                  </strong>
                </div>
              </>
            }
          />
          <CardGraficoGlobal
            titulo={t('admin.testes-gerais.card_pizza_30d')}
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
            total={passos30d.total}
            valorPrincipal={passos30d.aprovados}
            corGauge="#34d399"
            legenda={[
              { label: t('admin.testes-gerais.legenda_aprovados'), valor: passos30d.aprovados, cor: 'green' },
              { label: t('admin.testes-gerais.legenda_reprovados'), valor: passos30d.reprovados, cor: 'red' },
            ]}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('admin.testes-gerais.legenda_aprovados')}</span>
                  <strong style={{ color: '#34d399' }}>{passos30d.aprovados}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('admin.testes-gerais.legenda_reprovados')}</span>
                  <strong style={{ color: '#f87171' }}>{passos30d.reprovados}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>{t('admin.testes-gerais.card_pizza_taxa_aprovacao')}</span>
                  <strong style={{ color: '#34d399' }}>
                    {passos30d.total ? Math.round((passos30d.aprovados / passos30d.total) * 100) : 0}%
                  </strong>
                </div>
              </>
            }
          />
          <CardGraficoGlobal
            titulo={t('admin.testes-gerais.card_tipo_passos')}
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            total={totalPassosTipo30d}
            valorPrincipal={passosDominanteTipo30d}
            corGauge={legendaTipos30d[0] ? CORES_TIPO_TESTE[legendaTipos30d[0].tipo] : '#64748b'}
            legenda={legendaTipos30d.map(({ tipo, passos }) => ({
              label: rotuloTipoTeste(tipo, t),
              valor: passos,
              cor: CORES_TIPO_TESTE[tipo],
            }))}
            tooltip={
              <>
                {legendaTipos30d.map(({ tipo, passos }) => (
                  <div key={tipo} className="cg-tooltip__row">
                    <span>{rotuloTipoTeste(tipo, t)}</span>
                    <strong style={{ color: CORES_TIPO_TESTE[tipo] }}>
                      {passos} ({totalPassosTipo30d ? Math.round((passos / totalPassosTipo30d) * 100) : 0}%)
                    </strong>
                  </div>
                ))}
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>{t('admin.testes-gerais.card_tipo_passos_total')}</span>
                  <strong>{totalPassosTipo30d}</strong>
                </div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.testes-gerais.card_total_erros')}
            icone={<Warning weight="duotone" size={18} />}
            valor={erros30d}
            variante="aviso"
            periodos={[
              { periodo: '7d', rotulo: t('admin.testes-gerais.periodo_7d'), valor: String(erros7d), direcao: 'neutral' },
              { periodo: '30d', rotulo: t('admin.testes-gerais.periodo_30d'), valor: String(erros30d), direcao: 'neutral' },
            ] as PeriodoTendencia[]}
            tooltip={
              <span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>
                {t('admin.testes-gerais.card_total_erros_tooltip')}
              </span>
            }
          />
        </>
      }
    >
      {/* Container pai: trava qualquer scroll externo herdado do pg-conteudo-area */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        <div
          role="tablist"
          style={{
            display: 'flex', gap: '0.25rem', marginBottom: '12px', flexShrink: 0,
            borderBottom: '1px solid rgba(100,116,139,0.25)',
          }}
        >
          {([
            { key: 'em_execucao' as const, rotulo: t('admin.testes-gerais.aba_em_execucao'), badge: execucoesAtivas.length },
            { key: 'executados' as const, rotulo: t('admin.testes-gerais.aba_executados'), badge: dados.length },
          ]).map(tab => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={abaAtiva === tab.key}
              onClick={() => setAbaAtiva(tab.key)}
              style={{
                padding: '0.6rem 1rem', border: 'none', cursor: 'pointer',
                background: abaAtiva === tab.key ? 'var(--ws-surface, #1e293b)' : 'transparent',
                color: abaAtiva === tab.key ? '#10b981' : 'var(--ws-muted, #94a3b8)',
                borderBottom: abaAtiva === tab.key ? '2px solid #10b981' : '2px solid transparent',
                fontSize: '0.85rem', fontWeight: abaAtiva === tab.key ? 600 : 400,
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              {tab.rotulo}
              {tab.badge > 0 && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', borderRadius: '9999px',
                  background: tab.key === 'em_execucao' && temExecucoesAtivas ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)',
                  color: tab.key === 'em_execucao' && temExecucoesAtivas ? '#10b981' : '#64748b',
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div
          className="ws-fade-up"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', zIndex: 10 }}
        >
          {abaAtiva === 'em_execucao' ? (
            <TabelaGlobal
              id="admin-test-runs-ativos"
              dados={execucoesAtivas}
              colunas={colunasExecucao}
              idKey="id_execucao_teste"
              mensagemVazio={t('admin.testes-gerais.vazio_em_execucao')}
              mensagemSemFiltro={t('admin.testes-gerais.vazio_em_execucao')}
            />
          ) : (
            <TabelaGlobal
              id="admin-test-logs"
              dados={dados}
              colunas={colunas}
              idKey="id"
              renderExpandido={renderExpandido}
              mensagemVazio={t('admin.testes-gerais.vazio')}
              mensagemSemFiltro={t('admin.testes-gerais.vazio_filtro')}
              tooltipBusca={t('admin.testes-gerais.tooltip_busca')}
              tooltipExpandir={t('admin.testes-gerais.tooltip_expandir')}
              acoesExportacao={getAcoesExportacaoPadrao(colunas, 'dados_tabela', 'Exportação de Logs')}
            />
          )}
        </div>

        <ModalAgendamentoTestes
          aberto={modalAgendamentoAberto}
          aoFechar={() => {
            setModalAgendamentoAberto(false)
            adminAgendamentosTesteApi.listar()
              .then(({ schedules }) => {
                if (schedules.length) {
                  const s = schedules[0] as Record<string, unknown>
                  setAgendamentoAtivo(Boolean(s.ativo_agendamento_teste))
                }
              })
              .catch(() => {})
          }}
          aoMudarStatus={(ativo) => setAgendamentoAtivo(ativo)}
        />

        <ModalExecutarTestes
          aberto={modalExecutarAberto}
          aoFechar={() => setModalExecutarAberto(false)}
          aoIniciarRun={() => {
            baselineIdsRef.current = new Set(dados.map(d => d.id))
            setAbaAtiva('em_execucao')
            void carregarStatusExecucoes()
            setModalExecutarAberto(false)
          }}
        />
      </div>
    </PaginaGlobal>
  )
}
