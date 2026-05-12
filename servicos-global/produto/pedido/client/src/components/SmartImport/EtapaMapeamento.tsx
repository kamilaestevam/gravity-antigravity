/**
 * EtapaMapeamento.tsx — Etapa 2 do Smart Import
 * Tabela de mapeamento: coluna do arquivo → campo do sistema
 * Com nivel de confianca visual (verde/amarelo/cinza), exemplo do valor real e visualizacao do documento
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  CheckCircle,
  Warning,
  Question,
  Brain,
  Table,
  MagnifyingGlass,
  Star,
} from '@phosphor-icons/react'
import type { ColunaMapeada, SmartImportLinhaRaw } from '../../shared/types'
import { CAMPOS_PEDIDO_DDD_TODOS, prioridadeDeCampo, type PrioridadeCampoDDD } from '../../../../shared/campos-pedido-ddd'
import { ehCampoNcm, formatarNcm } from '../../../../shared/formatadores'

// ── Campos disponiveis no sistema ─────────────────────────────────────────────
//
// P5.2 — Fallback agora vem direto do SSOT (cross-tier) com TODOS os 143
// campos do Pedido + PedidoItem em vez do hardcode de 15 legados que tinha
// nomes obsoletos como `exportador` (correto: `nome_exportador`), `ncm`
// (correto: `ncm_item`) etc.
//
// O endpoint /campos do server tambem foi atualizado para devolver o SSOT
// completo (P5.1), mas mantemos o import direto como fallback rapido caso
// o fetch falhe (rede caida, headers errados, etc.).

interface CampoSistemaOpcao {
  valor:       string
  rotulo:      string
  nivel:       'pedido' | 'item'
  grupo?:      string
  prioridade?: PrioridadeCampoDDD  // P6.1
  obrigatorio?: boolean             // P6.1
}

const CAMPOS_SISTEMA_FALLBACK: CampoSistemaOpcao[] = CAMPOS_PEDIDO_DDD_TODOS.map((c) => ({
  valor:       c.campo,
  rotulo:      c.rotulo,
  nivel:       c.nivel,
  grupo:       c.grupo,
  prioridade:  prioridadeDeCampo(c),
  obrigatorio: c.obrigatorio,
}))

/**
 * P6.1 — Set de campos essenciais (critica + principal) por nome interno.
 * Usado para filtrar linhas do arquivo no Modo Essencial.
 */
const CAMPOS_ESSENCIAIS = new Set(
  CAMPOS_PEDIDO_DDD_TODOS
    .filter((c) => prioridadeDeCampo(c) !== 'secundaria')
    .map((c) => c.campo)
)

/** P6.1 — Set de campos obrigatorios (criticos). */
const CAMPOS_OBRIGATORIOS = new Set(
  CAMPOS_PEDIDO_DDD_TODOS.filter((c) => c.obrigatorio).map((c) => c.campo)
)

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaMapeamentoProps {
  mapeamento: ColunaMapeada[]
  memoriaAplicada: boolean
  lembrarMapeamento: boolean
  dadosBrutos?: SmartImportLinhaRaw[]
  onMapeamentoChange: (novo: ColunaMapeada[]) => void
  onLembrarChange: (valor: boolean) => void
  onVoltar?: () => void
  onResetarMapeamento?: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function BadgeConfianca({ confianca, nivel, campoSistema }: { confianca: number; nivel: ColunaMapeada['nivel']; campoSistema?: string | null }) {
  if (nivel === 'ignorado' && !campoSistema) {
    return <span className="smart-import__conf-cinza" title="Campo extra — dados preservados em campos_custom"><Question size={14} aria-hidden="true" /> Campo extra</span>
  }
  if (confianca >= 90) {
    return <span className="smart-import__conf-verde"><CheckCircle size={14} aria-hidden="true" /> {confianca}%</span>
  }
  if (confianca >= 50) {
    return <span className="smart-import__conf-amarelo"><Warning size={14} aria-hidden="true" /> {confianca}%</span>
  }
  return <span className="smart-import__conf-cinza"><Question size={14} aria-hidden="true" /> {confianca}%</span>
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaMapeamento({
  mapeamento,
  memoriaAplicada,
  lembrarMapeamento,
  dadosBrutos,
  onMapeamentoChange,
  onLembrarChange,
  onVoltar,
  onResetarMapeamento,
}: EtapaMapeamentoProps) {
  const [verDocumento, setVerDocumento] = useState(false)
  const [camposSistema, setCamposSistema] = useState<CampoSistemaOpcao[]>(CAMPOS_SISTEMA_FALLBACK)
  // P6.1 — Estado do Modo Essencial e busca textual
  const [modoEssencial, setModoEssencial] = useState(true)
  const [busca, setBusca] = useState('')

  // P6.3 — Telemetria leve (console.info em DEV; futuro: Sentry/Mixpanel).
  // Mede tempo gasto na etapa Mapeamento e padroes de uso (toggle, busca).
  const tempoInicioEtapa = useRef(Date.now())
  const cliquesCompleto = useRef(0)
  const cliquesEssencial = useRef(0)
  const buscasFeitas = useRef(0)
  const ultimaBusca = useRef('')

  useEffect(() => {
    // /campos enriquece o SSOT com colunas customizadas do tenant (P1.7).
    // Mesmo se o fetch falhar, o fallback ja' tem os 143 campos do SSOT
    // (P5.2 — antes era hardcode de 15 legados).
    // P17 — Portao 3 exige x-id-workspace (sessao paralela 12/05/2026).
    const idWorkspace = sessionStorage.getItem('gravity_company_id') || ''
    fetch('/api/v1/pedidos/importacoes-inteligentes/campos', {
      headers: {
        'x-id-organizacao': '',
        'x-internal-key': '',
        ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
      },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setCamposSistema(data) })
      .catch(() => { /* usa fallback do SSOT — ja completo */ })

    // P6.3 — registra entrada na etapa Mapeamento
    console.info('[smart-import:metrica] etapa_mapeamento_iniciada', {
      total_colunas: mapeamento.length,
      memoria_aplicada: memoriaAplicada,
      modo_inicial: 'essencial',
      timestamp: new Date().toISOString(),
    })

    return () => {
      // P6.3 — registra saida (desmount) com agregado
      const duracaoMs = Date.now() - tempoInicioEtapa.current
      console.info('[smart-import:metrica] etapa_mapeamento_finalizada', {
        duracao_segundos: Math.round(duracaoMs / 1000),
        cliques_toggle_completo: cliquesCompleto.current,
        cliques_toggle_essencial: cliquesEssencial.current,
        buscas_feitas: buscasFeitas.current,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // P6.3 — Conta a busca como evento apenas quando ela "estabiliza" (debounce manual).
  useEffect(() => {
    if (busca === ultimaBusca.current) return
    const t = setTimeout(() => {
      if (busca.trim().length > 0 && busca !== ultimaBusca.current) {
        buscasFeitas.current += 1
        console.info('[smart-import:metrica] busca_aplicada', { termo: busca.slice(0, 30) })
      }
      ultimaBusca.current = busca
    }, 800)
    return () => clearTimeout(t)
  }, [busca])

  // P6.3 — Conta troca de modo
  function handleModoChange(novo: boolean) {
    if (novo === modoEssencial) return
    if (novo) cliquesEssencial.current += 1
    else      cliquesCompleto.current += 1
    setModoEssencial(novo)
    console.info('[smart-import:metrica] modo_alterado', { para: novo ? 'essencial' : 'completo' })
  }

  // P5.3 — Agrupa campos por (nivel, grupo) para renderizar <optgroup>.
  // Sem isso, um <select> com 143 opcoes vira navegavel mas ruim de usar.
  // Ordem: PEDIDO primeiro (em ordem natural do SSOT), depois ITEM.
  const camposAgrupados = useMemo(() => {
    const grupos: { label: string; opcoes: CampoSistemaOpcao[] }[] = []
    const indice = new Map<string, CampoSistemaOpcao[]>()

    for (const c of camposSistema) {
      const prefixo = c.nivel === 'item' ? '📋 ITEM' : '📦 PEDIDO'
      const chave = `${prefixo} — ${c.grupo || 'Outros'}`
      if (!indice.has(chave)) {
        indice.set(chave, [])
        grupos.push({ label: chave, opcoes: indice.get(chave)! })
      }
      indice.get(chave)!.push(c)
    }
    // PEDIDO antes de ITEM, mantendo ordem do SSOT dentro de cada grupo
    grupos.sort((a, b) => {
      const aPedido = a.label.startsWith('📦')
      const bPedido = b.label.startsWith('📦')
      if (aPedido !== bPedido) return aPedido ? -1 : 1
      return 0
    })
    return grupos
  }, [camposSistema])

  function atualizarCampo(index: number, campo_sistema: string | null) {
    const novo = mapeamento.map((col, i) => {
      if (i !== index) return col
      return {
        ...col,
        campo_sistema,
        nivel: 'manual' as const,        // P5.2 fix: 'usuario' nao e valor valido de nivel
        inferido_por: 'usuario' as const, // 'usuario' e' valor de inferido_por
      }
    })
    onMapeamentoChange(novo)
  }

  const mapeadas = mapeamento.filter(m => m.campo_sistema !== null && m.campo_sistema !== '__drop__').length
  const extras = mapeamento.filter(m => !m.campo_sistema || m.campo_sistema === '').length
  const descartadas = mapeamento.filter(m => m.campo_sistema === '__drop__').length
  const total = mapeamento.length

  // P6.1 — Indices originais (para preservar correspondencia com `mapeamento` ao chamar atualizarCampo)
  const linhasFiltradas = useMemo(() => {
    const buscaNorm = busca.trim().toLowerCase()
    return mapeamento
      .map((col, indexOriginal) => ({ col, indexOriginal }))
      .filter(({ col }) => {
        // Filtro 1: Modo Essencial — esconde linhas que NAO mapeiam para essencial
        // (mas mantem visiveis as ainda nao mapeadas para o usuario decidir)
        if (modoEssencial && col.campo_sistema && !CAMPOS_ESSENCIAIS.has(col.campo_sistema)) {
          // Excecao: campo extra / descartado ficam ocultos no Modo Essencial tambem
          return false
        }
        // Filtro 2: busca textual contra coluna_arquivo (sem prefixo "* "),
        // valor_exemplo e rotulo do campo mapeado
        if (buscaNorm.length > 0) {
          const rotuloCampo = camposSistema.find(c => c.valor === col.campo_sistema)?.rotulo ?? ''
          const nomeColuna = col.coluna_arquivo.replace(/^\*+\s+/, '')
          const haystack = `${nomeColuna} ${col.exemplo_valor ?? ''} ${rotuloCampo}`.toLowerCase()
          if (!haystack.includes(buscaNorm)) return false
        }
        return true
      })
  }, [mapeamento, modoEssencial, busca, camposSistema])

  // P6.1 — Contadores especificos para indicador "essenciais mapeados"
  const essenciaisMapeados = mapeamento.filter(
    m => m.campo_sistema && CAMPOS_ESSENCIAIS.has(m.campo_sistema)
  ).length
  const obrigatoriosMapeados = mapeamento.filter(
    m => m.campo_sistema && CAMPOS_OBRIGATORIOS.has(m.campo_sistema)
  ).length
  const obrigatoriosFaltando = CAMPOS_OBRIGATORIOS.size - obrigatoriosMapeados

  return (
    <div style={{ position: 'relative' }}>
      {onVoltar && (
        <button
          type="button"
          className="smart-import__filtro-btn"
          onClick={onVoltar}
          style={{ marginBottom: '0.75rem' }}
        >
          ← Trocar arquivo
        </button>
      )}

      <div className="smart-import__mapa-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* P6.1 — Indicador focado em essenciais (em vez de "136 de 138" ruidoso) */}
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{essenciaisMapeados} de {CAMPOS_ESSENCIAIS.size}</strong> campos essenciais mapeados
            {obrigatoriosFaltando > 0 && (
              <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                · ⚠️ {obrigatoriosFaltando} obrigatorio{obrigatoriosFaltando > 1 ? 's' : ''} faltando
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.6875rem' }}>
              (total: {mapeadas}/{total})
            </span>
          </p>
          {memoriaAplicada && (
            <>
              <span className="smart-import__badge-memoria">
                <Brain size={11} aria-hidden="true" /> Memoria aplicada
              </span>
              {onResetarMapeamento && (
                <button
                  type="button"
                  className="smart-import__filtro-btn"
                  onClick={onResetarMapeamento}
                  style={{ fontSize: '0.6875rem' }}
                  title="Ignorar memória e remapear manualmente"
                >
                  Remapear
                </button>
              )}
            </>
          )}
          {dadosBrutos && dadosBrutos.length > 0 && (
            <button
              type="button"
              className="smart-import__filtro-btn"
              onClick={() => setVerDocumento(true)}
              style={{ marginLeft: '0.5rem' }}
            >
              <Table size={13} weight="duotone" aria-hidden="true" />
              Ver documento
            </button>
          )}
        </div>
        <label className="smart-import__lembrar">
          <input
            type="checkbox"
            checked={lembrarMapeamento}
            onChange={e => onLembrarChange(e.target.checked)}
            aria-label="Lembrar este mapeamento para proximas importacoes"
          />
          Lembrar este mapeamento
        </label>
      </div>

      {/* P6.1 — Toolbar: toggle Essencial/Completo + busca */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        margin: '0.5rem 0',
        padding: '0.5rem 0.75rem',
        background: 'var(--bg-surface, #1e293b)',
        borderRadius: '6px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} role="group" aria-label="Modo de exibicao">
          <button
            type="button"
            onClick={() => handleModoChange(true)}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: '4px',
              border: '1px solid',
              borderColor: modoEssencial ? 'var(--color-info, #60a5fa)' : 'transparent',
              background: modoEssencial ? 'rgba(96,165,250,0.12)' : 'transparent',
              color: modoEssencial ? 'var(--color-info, #60a5fa)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            title="Mostra apenas campos criticos e principais (31 campos)"
          >
            <Star size={12} weight={modoEssencial ? 'fill' : 'regular'} aria-hidden="true" />
            Essencial
          </button>
          <button
            type="button"
            onClick={() => handleModoChange(false)}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: '4px',
              border: '1px solid',
              borderColor: !modoEssencial ? 'var(--color-info, #60a5fa)' : 'transparent',
              background: !modoEssencial ? 'rgba(96,165,250,0.12)' : 'transparent',
              color: !modoEssencial ? 'var(--color-info, #60a5fa)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            title="Mostra todos os campos do arquivo (incluindo secundarios)"
          >
            Completo
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '180px', position: 'relative' }}>
          <MagnifyingGlass size={14} aria-hidden="true" style={{ position: 'absolute', left: '0.5rem', color: 'var(--text-muted)' }} />
          <input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar coluna do arquivo, valor ou campo..."
            aria-label="Buscar campos do mapeamento"
            style={{
              flex: 1,
              padding: '0.375rem 0.5rem 0.375rem 1.875rem',
              fontSize: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--bg-elevated, #334155)',
              background: 'var(--bg-elevated, #0f172a)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          Mostrando <strong style={{ color: 'var(--text-secondary)' }}>{linhasFiltradas.length}</strong> de {total}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="smart-import__tabela" aria-label="Mapeamento de colunas">
          <thead>
            <tr>
              <th scope="col">Coluna do Arquivo</th>
              <th scope="col">Valor Extraído</th>
              <th scope="col">Campo no Sistema</th>
              <th scope="col">Confianca</th>
              <th scope="col">Inferido Por</th>
            </tr>
          </thead>
          <tbody>
            {linhasFiltradas.map(({ col, indexOriginal }) => {
              // P6.1 — Determina destaque visual baseado em prioridade do campo mapeado
              const ehObrigatorio = col.campo_sistema ? CAMPOS_OBRIGATORIOS.has(col.campo_sistema) : false
              const ehEssencial = col.campo_sistema ? CAMPOS_ESSENCIAIS.has(col.campo_sistema) : false
              // P13.3 — Remove "* " literal do template ao exibir (redundancia visual:
              // o badge ⚠️ ja sinaliza obrigatorio com mais clareza).
              const nomeColunaExibido = col.coluna_arquivo.replace(/^\*+\s+/, '')
              // P13.2-UI — Formata NCM como "XXXX.XX.XX" no preview do valor extraido
              const valorExibido = col.exemplo_valor && ehCampoNcm(col.campo_sistema)
                ? formatarNcm(col.exemplo_valor)
                : col.exemplo_valor
              return (
                <tr
                  key={`${col.coluna_arquivo}-${indexOriginal}`}
                  style={ehObrigatorio ? { background: 'rgba(239,68,68,0.04)' } : undefined}
                >
                  {/* P13.3 — Fonte normal (nao monospace) + nowrap + tooltip com nome completo */}
                  <td style={{
                    fontSize: '0.8125rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 220,
                  }} title={col.coluna_arquivo}>
                    {ehObrigatorio && (
                      <span
                        title="Campo obrigatorio — sem isto nao cria pedido"
                        style={{ color: '#ef4444', marginRight: '0.375rem', fontWeight: 700 }}
                        aria-label="obrigatorio"
                      >
                        ⚠️
                      </span>
                    )}
                    {!ehObrigatorio && ehEssencial && (
                      <Star size={11} weight="fill" style={{ color: '#f59e0b', marginRight: '0.375rem', verticalAlign: '-1px' }} aria-label="essencial" />
                    )}
                    {nomeColunaExibido}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {valorExibido
                      ? <span title={col.exemplo_valor ?? ''}>{valorExibido}</span>
                      : <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>—</span>
                    }
                  </td>
                  <td>
                    <select
                      style={{
                        minWidth: '200px',
                        padding: '0.375rem 0.625rem',
                        borderRadius: '6px',
                        border: '1px solid var(--bg-elevated, #334155)',
                        background: 'var(--bg-surface, #1e293b)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8125rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                      value={col.campo_sistema ?? ''}
                      onChange={e => atualizarCampo(indexOriginal, e.target.value || null)}
                      aria-label={`Campo sistema para ${col.coluna_arquivo}`}
                    >
                      <option value="">→ Campo extra (preservar)</option>
                      <option value="__drop__">✕ Descartar este campo</option>
                      {camposAgrupados.map(g => (
                        <optgroup key={g.label} label={g.label}>
                          {g.opcoes.map(c => (
                            <option key={c.valor} value={c.valor}>{c.rotulo}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td>
                    <BadgeConfianca confianca={col.confianca} nivel={col.nivel} campoSistema={col.campo_sistema} />
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                    {col.inferido_por === 'memoria'  && 'Memoria'}
                    {col.inferido_por === 'ia'       && 'IA'}
                    {col.inferido_por === 'dados'    && 'Dados'}
                    {col.inferido_por === 'usuario'  && 'Usuario'}
                  </td>
                </tr>
              )
            })}
            {linhasFiltradas.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Nenhum campo corresponde aos filtros atuais.{' '}
                  {modoEssencial && (
                    <button
                      type="button"
                      onClick={() => handleModoChange(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-info, #60a5fa)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}
                    >
                      Mostrar todos
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {verDocumento && dadosBrutos && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg-base)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-default, rgba(255,255,255,0.08))' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Documento importado
            </span>
            <button type="button" onClick={() => setVerDocumento(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
              ✕
            </button>
          </div>
          <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, padding: '1rem' }}>
            <table className="smart-import__tabela" style={{ minWidth: 'max-content' }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--text-muted)', width: 40 }}>#</th>
                  {mapeamento.map(m => m.coluna_arquivo).map(col => <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {dadosBrutos.map(row => (
                  <tr key={row.linha}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{row.linha}</td>
                    {mapeamento.map(m => m.coluna_arquivo).map(col => (
                      <td key={col} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {row.valores[col] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
