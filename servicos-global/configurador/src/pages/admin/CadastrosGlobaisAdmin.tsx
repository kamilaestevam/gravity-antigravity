/**
 * CadastrosGlobaisAdmin.tsx — Gaveta do Super Admin (FASE 5 DDD, Parte 1).
 *
 * Scaffold genérico de leitura sobre os 3 catálogos GLOBAIS do serviço
 * Cadastros (porta 8031): NCM, Moedas, Unidades. Essas tabelas não têm
 * `id_organizacao` — são compartilhadas por todos os tenants.
 *
 * Contrato bilateral (Mandamento 09): schemas Zod vêm de
 * `@tenant/cadastros/shared/schemas`. Divergência aqui = commit incompleto.
 *
 * Escopo
 * ──────
 * V1 é read-only (listagem + busca + filtro de ativos). CRUD dos globais
 * fica bloqueado atrás do Super Admin em uma próxima onda.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  Database,
  Coins,
  Ruler,
  Barcode,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { z } from 'zod'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  TabelaGlobal,
  type TabelaGlobalColuna,
} from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  moedaSchema,
  unidadeSchema,
  ncmSchema,
  type Moeda,
  type Unidade,
  type NCM,
} from '@organizacao/cadastros/shared/schemas'

// ─── Schemas de lista (contrato bilateral com o backend) ───────────────────

const listaMoedasSchema = z.object({
  itens: z.array(moedaSchema),
  total: z.number().int().nonnegative(),
})

const listaUnidadesSchema = z.object({
  itens: z.array(unidadeSchema),
  total: z.number().int().nonnegative(),
})

const listaNcmSchema = z.object({
  itens: z.array(ncmSchema),
  total: z.number().int().nonnegative(),
})

// ─── Tabs ───────────────────────────────────────────────────────────────────

type TabId = 'ncm' | 'moedas' | 'unidades'

interface TabDef {
  id: TabId
  label: string
  icone: React.ReactNode
  descricao: string
  cor: string
}

const TABS: TabDef[] = [
  { id: 'ncm',       label: 'NCM',              icone: <Barcode weight="duotone"  size={16} />, descricao: 'Nomenclatura Comum do Mercosul (8 dígitos)', cor: '#60a5fa' },
  { id: 'moedas',    label: 'Moedas',           icone: <Coins weight="duotone"    size={16} />, descricao: 'Catálogo ISO 4217 de moedas aceitas',        cor: '#fbbf24' },
  { id: 'unidades',  label: 'Unidades',         icone: <Ruler weight="duotone"    size={16} />, descricao: 'Unidades de medida: peso, quantidade, etc.',cor: '#34d399' },
]

// ─── Componente ─────────────────────────────────────────────────────────────

export default function CadastrosGlobaisAdmin() {
  const [tab, setTab]           = useState<TabId>('ncm')
  const [busca, setBusca]       = useState('')
  const [apenasAtivos, setApenasAtivos] = useState(true)

  const [moedas, setMoedas]     = useState<Moeda[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [ncm, setNcm]           = useState<NCM[]>([])

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]             = useState<string | null>(null)

  // Limpa busca ao trocar de aba para não confundir usuário
  useEffect(() => { setBusca('') }, [tab])

  async function carregar() {
    setCarregando(true)
    setErro(null)
    try {
      const [resMoedas, resUnidades, resNcm] = await Promise.all([
        fetch('/api/v1/moedas').then(r => r.json()),
        fetch('/api/v1/unidades').then(r => r.json()),
        fetch('/api/v1/ncm').then(r => r.json()),
      ])
      setMoedas(listaMoedasSchema.parse(resMoedas).itens)
      setUnidades(listaUnidadesSchema.parse(resUnidades).itens)
      setNcm(listaNcmSchema.parse(resNcm).itens)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha desconhecida'
      setErro(`Não foi possível carregar os catálogos globais: ${msg}`)
      setMoedas([])
      setUnidades([])
      setNcm([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  // ─── Dados filtrados por aba ──
  const dadosAtivos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtraAtivo = <T extends { ativo: boolean }>(arr: T[]) =>
      apenasAtivos ? arr.filter(i => i.ativo) : arr

    if (tab === 'ncm') {
      return filtraAtivo(ncm).filter(i =>
        !termo ||
        i.codigo.toLowerCase().includes(termo) ||
        i.descricao.toLowerCase().includes(termo),
      )
    }
    if (tab === 'moedas') {
      return filtraAtivo(moedas).filter(i =>
        !termo ||
        i.codigo.toLowerCase().includes(termo) ||
        i.nome.toLowerCase().includes(termo) ||
        i.simbolo.toLowerCase().includes(termo),
      )
    }
    return filtraAtivo(unidades).filter(i =>
      !termo ||
      i.codigo.toLowerCase().includes(termo) ||
      i.nome.toLowerCase().includes(termo) ||
      i.tipo.toLowerCase().includes(termo),
    )
  }, [tab, busca, apenasAtivos, moedas, unidades, ncm])

  // ─── Colunas por aba ──
  const colunasNcm: TabelaGlobalColuna<NCM>[] = [
    { key: 'codigo',    label: 'Código NCM', tipo: 'texto',  largura: 140, align: 'left' },
    { key: 'descricao', label: 'Descrição',  tipo: 'texto',  align: 'left' },
    { key: 'ii',        label: 'II (%)',     tipo: 'numero', largura: 90,  align: 'right', render: v => v == null ? '—' : Number(v).toFixed(2) },
    { key: 'ipi',       label: 'IPI (%)',    tipo: 'numero', largura: 90,  align: 'right', render: v => v == null ? '—' : Number(v).toFixed(2) },
    { key: 'ativo',     label: 'Status',     tipo: 'texto',  largura: 110, align: 'center', render: v => <StatusBadge ativo={!!v} /> },
  ]

  const colunasMoedas: TabelaGlobalColuna<Moeda>[] = [
    { key: 'codigo',  label: 'ISO 4217', tipo: 'texto', largura: 120, align: 'center' },
    { key: 'nome',    label: 'Nome',     tipo: 'texto', align: 'left' },
    { key: 'simbolo', label: 'Símbolo',  tipo: 'texto', largura: 110, align: 'center' },
    { key: 'ativo',   label: 'Status',   tipo: 'texto', largura: 110, align: 'center', render: v => <StatusBadge ativo={!!v} /> },
  ]

  const colunasUnidades: TabelaGlobalColuna<Unidade>[] = [
    { key: 'codigo', label: 'Código', tipo: 'texto', largura: 120, align: 'center' },
    { key: 'nome',   label: 'Nome',   tipo: 'texto', align: 'left' },
    { key: 'tipo',   label: 'Tipo',   tipo: 'texto', largura: 160, align: 'center', render: v => <TipoUnidadeChip tipo={String(v)} /> },
    { key: 'ativo',  label: 'Status', tipo: 'texto', largura: 110, align: 'center', render: v => <StatusBadge ativo={!!v} /> },
  ]

  // ─── Counts (stats inline no header) ──
  const countNcm      = ncm.filter(i => i.ativo).length
  const countMoedas   = moedas.filter(i => i.ativo).length
  const countUnidades = unidades.filter(i => i.ativo).length

  return (
    <PaginaGlobal>
      <CabecalhoGlobal
        titulo="Cadastros Globais"
        subtitulo="Catálogos compartilhados por todos os tenants (NCM, Moedas, Unidades). Somente leitura nesta onda."
        icone={<Database weight="duotone" size={22} />}
        cor="#10b981"
        acoesDireita={
          <TooltipGlobal descricao="Recarregar catálogos">
            <button
              type="button"
              className="cga-refresh-btn"
              onClick={carregar}
              disabled={carregando}
              aria-label="Recarregar"
            >
              <ArrowsClockwise size={15} weight="bold" />
              {carregando ? 'Atualizando…' : 'Atualizar'}
            </button>
          </TooltipGlobal>
        }
      />

      {/* ── Abas ── */}
      <div className="cga-tabs">
        {TABS.map(tdef => {
          const ativo = tab === tdef.id
          const count = tdef.id === 'ncm' ? countNcm : tdef.id === 'moedas' ? countMoedas : countUnidades
          return (
            <button
              key={tdef.id}
              type="button"
              className={`cga-tab${ativo ? ' cga-tab--ativo' : ''}`}
              style={ativo ? { borderColor: tdef.cor, color: tdef.cor } : undefined}
              onClick={() => setTab(tdef.id)}
            >
              <span className="cga-tab__icone" style={{ color: tdef.cor }}>{tdef.icone}</span>
              <span className="cga-tab__label">{tdef.label}</span>
              <span className="cga-tab__count">{count}</span>
            </button>
          )
        })}
      </div>

      {/* ── Descrição da aba + Toolbar ── */}
      <div className="cga-toolbar">
        <p className="cga-tab-desc">{TABS.find(t => t.id === tab)?.descricao}</p>
        <div className="cga-toolbar-right">
          <label className="cga-checkbox">
            <input
              type="checkbox"
              checked={apenasAtivos}
              onChange={e => setApenasAtivos(e.target.checked)}
            />
            <span>Apenas ativos</span>
          </label>
          <div className="cga-busca">
            <MagnifyingGlass size={14} weight="bold" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder={`Buscar em ${TABS.find(t => t.id === tab)?.label ?? ''}…`}
            />
          </div>
        </div>
      </div>

      {/* ── Estados ── */}
      {carregando && (
        <div className="cga-loading">
          <span className="cga-spinner" aria-hidden="true" />
          <span>Carregando catálogos globais…</span>
        </div>
      )}

      {erro && !carregando && (
        <div className="cga-erro">
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {/* ── Tabela por aba ── */}
      {!carregando && !erro && (
        <div className="cga-tabela">
          {tab === 'ncm' && (
            <TabelaGlobal<NCM>
              dados={dadosAtivos as NCM[]}
              colunas={colunasNcm}
              idKey="codigo"
              mensagemVazio="Nenhum NCM encontrado com os filtros atuais."
              tooltipBusca="Busca por código ou descrição"
            />
          )}
          {tab === 'moedas' && (
            <TabelaGlobal<Moeda>
              dados={dadosAtivos as Moeda[]}
              colunas={colunasMoedas}
              idKey="codigo"
              mensagemVazio="Nenhuma moeda encontrada com os filtros atuais."
              tooltipBusca="Busca por código ISO, nome ou símbolo"
            />
          )}
          {tab === 'unidades' && (
            <TabelaGlobal<Unidade>
              dados={dadosAtivos as Unidade[]}
              colunas={colunasUnidades}
              idKey="codigo"
              mensagemVazio="Nenhuma unidade encontrada com os filtros atuais."
              tooltipBusca="Busca por código, nome ou tipo"
            />
          )}
        </div>
      )}

      <style>{CGA_CSS}</style>
    </PaginaGlobal>
  )
}

// ─── Renderers auxiliares ──────────────────────────────────────────────────

function StatusBadge({ ativo }: { ativo: boolean }) {
  const cor = ativo ? '#34d399' : '#94a3b8'
  const Icone = ativo ? CheckCircle : XCircle
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
      padding: '0.15rem 0.5rem', borderRadius: '9999px',
      background: `${cor}1a`, border: `1px solid ${cor}33`, color: cor,
      fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.02em',
    }}>
      <Icone size={12} weight="fill" />
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  )
}

function TipoUnidadeChip({ tipo }: { tipo: string }) {
  const map: Record<string, string> = {
    peso: '#60a5fa', quantidade: '#a78bfa', comprimento: '#34d399', volume: '#fbbf24',
  }
  const cor = map[tipo] ?? '#94a3b8'
  return (
    <span style={{
      display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px',
      background: `${cor}1a`, border: `1px solid ${cor}33`, color: cor,
      fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.02em',
      textTransform: 'capitalize',
    }}>
      {tipo || '—'}
    </span>
  )
}

// ─── CSS inline (ligado apenas a esta página) ──────────────────────────────

const CGA_CSS = `
  .cga-refresh-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4375rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #10b981;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 6px;
    cursor: pointer;
    transition: background 120ms, border-color 120ms;
  }
  .cga-refresh-btn:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.5);
  }
  .cga-refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .cga-tabs {
    display: flex;
    gap: 0.5rem;
    margin: 1.25rem 0 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .cga-tab {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-muted, #94a3b8);
    background: transparent;
    border: 1px solid transparent;
    border-bottom: 2px solid transparent;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    transition: color 120ms, background 120ms, border-color 120ms;
    margin-bottom: -1px;
  }
  .cga-tab:hover { color: var(--text-primary, #f1f5f9); background: rgba(255, 255, 255, 0.025); }
  .cga-tab--ativo {
    color: var(--text-primary, #f1f5f9);
    background: rgba(255, 255, 255, 0.03);
    border-bottom-color: currentColor;
  }
  .cga-tab__icone { display: inline-flex; }
  .cga-tab__count {
    padding: 0.05rem 0.4rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    font-size: 0.6875rem;
    font-weight: 700;
    color: inherit;
  }

  .cga-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: 0.75rem 0 1rem;
    flex-wrap: wrap;
  }
  .cga-tab-desc {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--text-muted, #94a3b8);
  }
  .cga-toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .cga-checkbox {
    display: inline-flex;
    align-items: center;
    gap: 0.4375rem;
    font-size: 0.8125rem;
    color: var(--text-muted, #94a3b8);
    cursor: pointer;
    user-select: none;
  }
  .cga-checkbox input { accent-color: #10b981; }

  .cga-busca {
    display: inline-flex;
    align-items: center;
    gap: 0.4375rem;
    padding: 0.4rem 0.625rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    color: var(--text-muted, #94a3b8);
    transition: border-color 120ms;
    min-width: 240px;
  }
  .cga-busca:focus-within { border-color: rgba(16, 185, 129, 0.5); }
  .cga-busca input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--text-primary, #f1f5f9);
    font-size: 0.8125rem;
    outline: none;
  }
  .cga-busca input::placeholder { color: var(--text-muted, #64748b); }

  .cga-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 3rem 1rem;
    font-size: 0.875rem;
    color: var(--text-muted, #94a3b8);
  }
  .cga-spinner {
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(16, 185, 129, 0.2);
    border-top-color: #10b981;
    animation: cga-spin 0.8s linear infinite;
  }
  @keyframes cga-spin { to { transform: rotate(360deg); } }

  .cga-erro {
    padding: 0.875rem 1rem;
    background: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.25);
    border-radius: 8px;
    color: #fca5a5;
    font-size: 0.8125rem;
  }
  .cga-erro strong { color: #f87171; }

  .cga-tabela { margin-top: 0.25rem; }

  body.light-theme .cga-tab { color: #64748b; }
  body.light-theme .cga-tab:hover { color: #1e293b; background: rgba(0,0,0,0.02); }
  body.light-theme .cga-tab--ativo { color: #1e293b; background: rgba(0,0,0,0.025); }
  body.light-theme .cga-tab__count { background: rgba(0,0,0,0.06); }
  body.light-theme .cga-busca { background: rgba(0,0,0,0.025); border-color: rgba(0,0,0,0.1); }
  body.light-theme .cga-busca input { color: #1e293b; }
  body.light-theme .cga-tab-desc,
  body.light-theme .cga-checkbox,
  body.light-theme .cga-loading { color: #64748b; }
`
