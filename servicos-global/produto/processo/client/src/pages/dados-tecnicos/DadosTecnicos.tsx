/**
 * DadosTecnicos.tsx — Tela moderna de campos do processo
 *
 * Padrao: leitura + edit-in-place (estilo Linear/Notion).
 * Layout: TOC lateral fixa + secoes empilhadas com pill de completude.
 *
 * NOTA: as secoes/campos abaixo sao MODELO para definir o visual e
 * interacoes. O dicionario real (dezenas/centenas de campos) sera
 * definido posteriormente. Quando o back/banco estiver pronto, trocar
 * o estado local por consumo da API.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  GearSix, Buildings, MapPin, Scales, Anchor, FileText,
  CheckCircle, Circle, PencilSimple, IdentificationCard,
  Hash, User, UserCircle, Briefcase, Certificate, Globe,
  ArrowsLeftRight, Warehouse, ShieldCheck, TrafficSign,
  CurrencyDollar, Boat, AirplaneTakeoff, Package, ListChecks,
  IdentificationBadge, ChatText, SidebarSimple, Warning,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import './DadosTecnicos.css'

// ── Configuracao de campos ──────────────────────────────────────────────────

type CampoTipo = 'texto' | 'select' | 'numero'

interface CampoConfig {
  key: string
  label: string
  tipo: CampoTipo
  icone?: React.ReactNode
  obrigatorio?: boolean
  opcoes?: { valor: string; label: string }[]
  placeholder?: string
}

interface SecaoConfig {
  id: string
  titulo: string
  icone: React.ReactNode
  campos: CampoConfig[]
}

const SECOES: SecaoConfig[] = [
  {
    id: 'geral',
    titulo: 'Geral',
    icone: <Buildings weight="duotone" size={18} />,
    campos: [
      { key: 'ref_cliente',        label: 'Referência do Cliente', tipo: 'texto', obrigatorio: true, placeholder: 'Ex: 1995/25 E 2020/25', icone: <IdentificationCard /> },
      { key: 'outra_ref',          label: 'Outra Referência',      tipo: 'texto', icone: <Hash /> },
      { key: 'responsavel',        label: 'Responsável',           tipo: 'texto', obrigatorio: true, icone: <User /> },
      { key: 'responsavel_reg',    label: 'Responsável Registro',  tipo: 'texto', icone: <User /> },
      { key: 'auxiliar',           label: 'Auxiliar',              tipo: 'texto', icone: <UserCircle /> },
      { key: 'numero_booking',     label: 'Número do Booking',     tipo: 'texto', placeholder: 'BKG-…', icone: <Hash /> },
      { key: 'despachante',        label: 'Despachante',           tipo: 'texto', obrigatorio: true, icone: <Briefcase /> },
      { key: 'certificado',        label: 'Certificado',           tipo: 'texto', icone: <Certificate /> },
    ],
  },
  {
    id: 'origem-destino',
    titulo: 'Origem & Destino',
    icone: <MapPin weight="duotone" size={18} />,
    campos: [
      { key: 'pais_origem',         label: 'País de Origem',       tipo: 'texto', obrigatorio: true, placeholder: 'CN', icone: <Globe /> },
      { key: 'porto_embarque',      label: 'Porto de Embarque',    tipo: 'texto', obrigatorio: true, icone: <Anchor /> },
      { key: 'porto_transbordo',    label: 'Porto de Transbordo',  tipo: 'texto', icone: <ArrowsLeftRight /> },
      { key: 'pais_destino',        label: 'País de Destino',      tipo: 'texto', obrigatorio: true, placeholder: 'BR', icone: <Globe /> },
      { key: 'porto_destino',       label: 'Porto de Destino',     tipo: 'texto', obrigatorio: true, icone: <Anchor /> },
      { key: 'recinto_alfandegado', label: 'Recinto Alfandegado',  tipo: 'texto', icone: <Warehouse /> },
    ],
  },
  {
    id: 'operacao',
    titulo: 'Operação Aduaneira',
    icone: <Scales weight="duotone" size={18} />,
    campos: [
      { key: 'tipo_decl_aduaneira', label: 'Tipo de Declaração Aduaneira', tipo: 'select', icone: <FileText />,
        opcoes: [{ valor: 'DI', label: 'DI' }, { valor: 'DUIMP', label: 'DUIMP' }, { valor: 'DSI', label: 'DSI' }] },
      { key: 'tipo_operacao',       label: 'Tipo de Operação', tipo: 'select', icone: <Scales />,
        opcoes: [{ valor: 'direta', label: 'Direta' }, { valor: 'conta_ordem', label: 'Conta e Ordem' }, { valor: 'encomenda', label: 'Encomenda' }] },
      { key: 'regime_tributario',   label: 'Regime Tributário', tipo: 'select', icone: <ShieldCheck />,
        opcoes: [{ valor: 'comum', label: 'Comum' }, { valor: 'drawback', label: 'Drawback' }, { valor: 'recof', label: 'RECOF' }] },
      { key: 'canal',               label: 'Canal', tipo: 'select', icone: <TrafficSign />,
        opcoes: [{ valor: 'verde', label: 'Verde' }, { valor: 'amarelo', label: 'Amarelo' }, { valor: 'vermelho', label: 'Vermelho' }, { valor: 'cinza', label: 'Cinza' }] },
      { key: 'incoterm',            label: 'Incoterm', tipo: 'select', obrigatorio: true, icone: <Globe />,
        opcoes: ['EXW','FOB','CFR','CIF','CIP','DDP','DAP'].map(v => ({ valor: v, label: v })) },
      { key: 'moeda',               label: 'Moeda', tipo: 'select', icone: <CurrencyDollar />,
        opcoes: ['USD','EUR','BRL','CNY','JPY'].map(v => ({ valor: v, label: v })) },
    ],
  },
  {
    id: 'transporte',
    titulo: 'Transporte',
    icone: <Anchor weight="duotone" size={18} />,
    campos: [
      { key: 'via_transporte',  label: 'Via de Transporte', tipo: 'select', icone: <AirplaneTakeoff />,
        opcoes: [{ valor: 'maritimo', label: 'Marítimo' }, { valor: 'aereo', label: 'Aéreo' }, { valor: 'terrestre', label: 'Terrestre' }] },
      { key: 'companhia',       label: 'Companhia de Transporte', tipo: 'texto', icone: <Buildings /> },
      { key: 'navio_voo',       label: 'Navio / Voo',             tipo: 'texto', icone: <Boat /> },
      { key: 'bl_awb',          label: 'BL / AWB',                tipo: 'texto', obrigatorio: true, icone: <FileText /> },
      { key: 'tipo_carga',      label: 'Tipo de Carga',           tipo: 'select', icone: <Package />,
        opcoes: [{ valor: 'container', label: 'Container' }, { valor: 'granel', label: 'Granel' }, { valor: 'carga_geral', label: 'Carga Geral' }] },
      { key: 'romaneio_carga',  label: 'Romaneio Carga Nº',       tipo: 'texto', icone: <ListChecks /> },
    ],
  },
  {
    id: 'documentos',
    titulo: 'Documentos',
    icone: <FileText weight="duotone" size={18} />,
    campos: [
      { key: 'cert_origem',       label: 'Certificado de Origem Nº', tipo: 'texto', icone: <Certificate /> },
      { key: 'nif',               label: 'NIF',                       tipo: 'texto', icone: <IdentificationBadge /> },
      { key: 'di_numero',         label: 'DI Nº',                     tipo: 'texto', icone: <FileText /> },
      { key: 'li_numero',         label: 'LI Nº',                     tipo: 'texto', icone: <FileText /> },
      { key: 'status_observacao', label: 'Status Observação',         tipo: 'texto', icone: <ChatText /> },
    ],
  },
]

// ── Mock de valores iniciais ────────────────────────────────────────────────

const VALORES_INICIAIS: Record<string, string> = {
  ref_cliente: '1995/25 E 2020/25 - S25146005S',
  responsavel: 'Daniel Martins',
  despachante: 'Asia Shipping Transportes Internacionais Ltda.',
  certificado: '559 - David Ribeiro de Paula Neto',
  pais_origem: 'CN',
  porto_embarque: 'Shanghai',
  pais_destino: 'BR',
  porto_destino: 'Santos',
  tipo_decl_aduaneira: 'DI',
  tipo_operacao: 'direta',
  regime_tributario: 'comum',
  canal: 'verde',
  incoterm: 'CIF',
  moeda: 'USD',
  via_transporte: 'maritimo',
  companhia: 'Maersk Line',
  bl_awb: 'MSKU1234567',
  tipo_carga: 'container',
}

// ── Componente: linha de campo (read + edit-in-place) ──────────────────────

interface CampoLinhaProps {
  campo: CampoConfig
  valor: string
  onSalvar: (novo: string) => void
}

function CampoLinha({ campo, valor, onSalvar }: CampoLinhaProps) {
  const [editando, setEditando] = useState(false)
  const [valorLocal, setValorLocal] = useState(valor)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  useEffect(() => { setValorLocal(valor) }, [valor])

  useEffect(() => {
    if (editando && inputRef.current) {
      inputRef.current.focus()
      if ('select' in inputRef.current) inputRef.current.select()
    }
  }, [editando])

  function salvar() {
    if (valorLocal !== valor) onSalvar(valorLocal)
    setEditando(false)
  }
  function cancelar() {
    setValorLocal(valor)
    setEditando(false)
  }

  const vazio = !valor || valor.trim() === ''
  const opcaoSelecionada = campo.opcoes?.find(o => o.valor === valor)
  const valorDisplay = opcaoSelecionada?.label ?? valor

  // Status: verde=preenchido, ambar=vazio obrigatorio, cinza=vazio opcional
  const status: 'preenchido' | 'vazio-obrig' | 'vazio-opc' =
    !vazio ? 'preenchido'
    : campo.obrigatorio ? 'vazio-obrig'
    : 'vazio-opc'

  return (
    <div className={`dt-row dt-row--${status}`}>
      <div className="dt-row-status" aria-hidden="true" />

      <div className="dt-row-head">
        {campo.icone && <span className="dt-row-icon">{campo.icone}</span>}
        <span className="dt-row-label">{campo.label}</span>
        {campo.obrigatorio && <span className="dt-row-required" title="Obrigatório">*</span>}
      </div>

      {editando ? (
        <div className="dt-row-edit">
          {campo.tipo === 'select' ? (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={valorLocal}
              onChange={e => setValorLocal(e.target.value)}
              onBlur={salvar}
              onKeyDown={e => { if (e.key === 'Enter') salvar(); if (e.key === 'Escape') cancelar() }}
            >
              <option value="">—</option>
              {campo.opcoes?.map(op => (
                <option key={op.valor} value={op.valor}>{op.label}</option>
              ))}
            </select>
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={campo.tipo === 'numero' ? 'number' : 'text'}
              value={valorLocal}
              placeholder={campo.placeholder}
              onChange={e => setValorLocal(e.target.value)}
              onBlur={salvar}
              onKeyDown={e => { if (e.key === 'Enter') salvar(); if (e.key === 'Escape') cancelar() }}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          className="dt-row-value"
          onClick={() => setEditando(true)}
          title="Clique para editar"
        >
          {vazio
            ? <span className="dt-row-empty">—</span>
            : <span className="dt-row-text">{valorDisplay}</span>
          }
          <PencilSimple weight="duotone" size={13} className="dt-row-edit-icon" />
        </button>
      )}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────

export default function DadosTecnicos() {
  const [valores, setValores] = useState<Record<string, string>>(VALORES_INICIAIS)
  const [secaoAtiva, setSecaoAtiva] = useState(SECOES[0].id)
  // TOC default contraida. (TODO persistir preferencia do usuario depois)
  const [tocColapsada, setTocColapsada] = useState(true)
  // Modo do card de stats: total ou so obrigatorios
  const [modoStats, setModoStats] = useState<'total' | 'obrig'>('total')

  function salvarCampo(key: string, novo: string) {
    setValores(p => ({ ...p, [key]: novo }))
  }

  // Completude por secao
  const completude = useMemo(() => {
    const mapa: Record<string, { preenchidos: number; total: number; obrigatoriosPendentes: number }> = {}
    for (const sec of SECOES) {
      let preench = 0
      let obrigPend = 0
      for (const c of sec.campos) {
        const v = valores[c.key]
        if (v && v.trim() !== '') preench++
        else if (c.obrigatorio) obrigPend++
      }
      mapa[sec.id] = { preenchidos: preench, total: sec.campos.length, obrigatoriosPendentes: obrigPend }
    }
    return mapa
  }, [valores])

  // Estatisticas globais (todas as secoes somadas)
  const stats = useMemo(() => {
    let preench = 0, total = 0, obrigTotal = 0, obrigPend = 0
    for (const sec of SECOES) {
      for (const c of sec.campos) {
        total++
        const tem = !!valores[c.key] && valores[c.key].trim() !== ''
        if (tem) preench++
        if (c.obrigatorio) {
          obrigTotal++
          if (!tem) obrigPend++
        }
      }
    }
    const pct = total > 0 ? Math.round((preench / total) * 100) : 0
    return { preench, total, obrigTotal, obrigPend, pct }
  }, [valores])

  // Scroll-spy: detecta secao visivel
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visiveis = entries.filter(e => e.isIntersecting)
        if (visiveis.length > 0) {
          const top = visiveis.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          setSecaoAtiva(top.target.id)
        }
      },
      { rootMargin: '-100px 0px -60% 0px' }
    )
    SECOES.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function irParaSecao(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    // PaginaGlobal usa container interno com overflow — scrollIntoView nao
    // funciona porque so ajusta o window. Sobe a arvore ate achar o
    // ancestral com overflow rolavel e rola ele explicitamente.
    let parent: HTMLElement | null = el.parentElement
    while (parent) {
      const ov = getComputedStyle(parent).overflowY
      if (ov === 'auto' || ov === 'scroll' || ov === 'overlay') break
      parent = parent.parentElement
    }
    if (parent) {
      const offset = el.getBoundingClientRect().top - parent.getBoundingClientRect().top + parent.scrollTop - 16
      parent.scrollTo({ top: offset, behavior: 'smooth' })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<GearSix weight="duotone" size={22} />}
          titulo="Dados Técnicos"
          subtitulo="Informações operacionais e documentais do processo"
        />
      }
    >
      <div className={`dt-layout ${tocColapsada ? 'dt-layout--toc-colapsada' : ''}`}>
        {/* ── Sidebar: TOC + stats agrupados, sticky ─────────────────────── */}
        <div className="dt-sidebar">
        {/* ── TOC lateral ───────────────────────────────────────────────── */}
        <aside className={`dt-toc ${tocColapsada ? 'dt-toc--colapsada' : ''}`} aria-label="Navegação entre seções">
          {/* Toggle expandir/contrair */}
          <button
            type="button"
            className="dt-toc-toggle"
            onClick={() => setTocColapsada(p => !p)}
            title={tocColapsada ? 'Expandir menu' : 'Recolher menu'}
            aria-label={tocColapsada ? 'Expandir menu' : 'Recolher menu'}
          >
            <SidebarSimple weight="duotone" size={16} />
          </button>

          {SECOES.map(sec => {
            const c = completude[sec.id]
            const completa = c.preenchidos === c.total
            const ativa = secaoAtiva === sec.id

            const botao = (
              <button
                type="button"
                className={`dt-toc-item ${ativa ? 'dt-toc-item--ativa' : ''} ${completa ? 'dt-toc-item--ok' : ''}`}
                onClick={() => irParaSecao(sec.id)}
                aria-label={tocColapsada ? `${sec.titulo} — ${c.preenchidos} de ${c.total}` : undefined}
              >
                <span className="dt-toc-icon">{sec.icone}</span>
                <span className="dt-toc-label">{sec.titulo}</span>
                <span className={`dt-toc-pill ${completa ? 'dt-toc-pill--ok' : ''}`}>
                  {completa
                    ? <CheckCircle weight="fill" size={12} />
                    : <Circle weight="duotone" size={12} />}
                  {c.preenchidos}/{c.total}
                </span>
                {/* Bolinha de status no modo colapsado (canto sup. direito) */}
                {tocColapsada && (
                  <span className={`dt-toc-dot ${completa ? 'dt-toc-dot--ok' : ''}`} aria-hidden="true" />
                )}
              </button>
            )

            // No modo colapsado, envolve em tooltip pra mostrar nome+contagem ao hover
            return (
              <React.Fragment key={sec.id}>
                {tocColapsada ? (
                  <TooltipGlobal
                    titulo={sec.titulo}
                    descricao={`${c.preenchidos} de ${c.total} preenchidos${c.obrigatoriosPendentes > 0 ? ` • ${c.obrigatoriosPendentes} obrigatório${c.obrigatoriosPendentes > 1 ? 's' : ''} pendente${c.obrigatoriosPendentes > 1 ? 's' : ''}` : ''}`}
                  >
                    {botao}
                  </TooltipGlobal>
                ) : botao}
              </React.Fragment>
            )
          })}
        </aside>

        {/* ── Card de estatisticas com donut + toggle ──────────────────── */}
        {(() => {
          const obrigPreench = stats.obrigTotal - stats.obrigPend
          const pctObrig = stats.obrigTotal > 0
            ? Math.round((obrigPreench / stats.obrigTotal) * 100)
            : 100
          const pctAtual = modoStats === 'total' ? stats.pct : pctObrig
          // Cor: verde se 100%, ambar se modo obrig com pendentes, roxo no resto
          const corDonut =
            pctAtual === 100 ? '#34d399'
            : modoStats === 'obrig' ? '#fbbf24'
            : '#a78bfa'
          const numeradorAtual = modoStats === 'total' ? stats.preench : obrigPreench
          const denominadorAtual = modoStats === 'total' ? stats.total : stats.obrigTotal
          return (
            <div className={`dt-stats ${tocColapsada ? 'dt-stats--colapsada' : ''}`}>
              {/* Toggle Total / Obrigatorios — escondido no modo colapsado */}
              {!tocColapsada && (
                <div className="dt-stats-toggle" role="tablist" aria-label="Modo de visualizacao">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={modoStats === 'total'}
                    className={`dt-stats-toggle-btn ${modoStats === 'total' ? 'dt-stats-toggle-btn--ativa' : ''}`}
                    onClick={() => setModoStats('total')}
                  >
                    Total
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={modoStats === 'obrig'}
                    className={`dt-stats-toggle-btn ${modoStats === 'obrig' ? 'dt-stats-toggle-btn--ativa' : ''}`}
                    onClick={() => setModoStats('obrig')}
                  >
                    Obrigatórios
                  </button>
                </div>
              )}

              <div
                className="dt-stats-donut"
                style={{
                  background: `conic-gradient(${corDonut} 0% ${pctAtual}%, rgba(148,163,184,0.18) ${pctAtual}% 100%)`,
                }}
              >
                <div className="dt-stats-donut-inner">
                  <span className="dt-stats-donut-pct">{pctAtual}%</span>
                </div>
              </div>

              {!tocColapsada && (
                <div className="dt-stats-body">
                  <div className="dt-stats-linha dt-stats-linha--hero">
                    <strong>{numeradorAtual}</strong>
                    <span>
                      de {denominadorAtual} {modoStats === 'total' ? 'campos' : 'obrigatórios'}
                    </span>
                  </div>
                  {/* Linha secundaria — clicavel pra trocar de modo */}
                  {modoStats === 'total' ? (
                    <button
                      type="button"
                      className={`dt-stats-linha dt-stats-linha--secundaria ${stats.obrigPend === 0 ? 'dt-stats-linha--ok' : 'dt-stats-linha--warn'}`}
                      onClick={() => setModoStats('obrig')}
                      title="Ver só obrigatórios"
                    >
                      {stats.obrigPend === 0
                        ? <CheckCircle weight="fill" size={12} />
                        : <Warning weight="fill" size={12} />}
                      <strong>{obrigPreench}/{stats.obrigTotal}</strong>
                      <span>obrigatórios</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="dt-stats-linha dt-stats-linha--secundaria"
                      onClick={() => setModoStats('total')}
                      title="Ver total"
                    >
                      <Circle weight="duotone" size={12} />
                      <strong>{stats.preench}/{stats.total}</strong>
                      <span>no total</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })()}
        </div>

        {/* ── Conteudo: secoes empilhadas ──────────────────────────────── */}
        <main className="dt-main">
          {SECOES.map(sec => {
            const c = completude[sec.id]
            const completa = c.preenchidos === c.total
            const pct = Math.round((c.preenchidos / c.total) * 100)
            return (
              <section key={sec.id} id={sec.id} className="dt-secao">
                <header className="dt-secao-header">
                  <div className="dt-secao-title">
                    <span className="dt-secao-icon">{sec.icone}</span>
                    <h2>{sec.titulo}</h2>
                  </div>
                  <div className="dt-secao-completude">
                    <div className="dt-secao-progress">
                      <div
                        className="dt-secao-progress-fill"
                        style={{ width: `${pct}%`, background: completa ? '#34d399' : '#a78bfa' }}
                      />
                    </div>
                    <span className="dt-secao-pill">
                      {c.preenchidos}/{c.total}
                      {c.obrigatoriosPendentes > 0 && (
                        <span className="dt-secao-pill-warn">
                          • {c.obrigatoriosPendentes} obrigatório{c.obrigatoriosPendentes > 1 ? 's' : ''} pendente{c.obrigatoriosPendentes > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </div>
                </header>

                <div className="dt-grid">
                  {sec.campos.map(campo => (
                    <CampoLinha
                      key={campo.key}
                      campo={campo}
                      valor={valores[campo.key] ?? ''}
                      onSalvar={(novo) => salvarCampo(campo.key, novo)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </main>
      </div>
    </PaginaGlobal>
  )
}
