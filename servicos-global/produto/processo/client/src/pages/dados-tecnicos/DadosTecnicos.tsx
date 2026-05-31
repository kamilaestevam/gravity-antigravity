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
  CaretDown, MagnifyingGlass, X, Cube, Resize, Barcode,
  Stack, CubeFocus, Lock, Sparkle, Gear,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import './DadosTecnicos.css'

// ── Configuracao de campos ──────────────────────────────────────────────────

type CampoTipo = 'texto' | 'select' | 'numero'

/**
 * Motivo de campo nao editavel:
 * - calculado: derivado de formula/soma (ex: Total FOB dos pedidos)
 * - bloqueado: trava por status do processo (ex: Canal apos parametrizacao RF)
 * - sistema: gerado automaticamente (ex: Numero do Processo, timestamps)
 */
type ReadonlyMotivo = 'calculado' | 'bloqueado' | 'sistema'

interface CampoConfig {
  key: string
  label: string
  tipo: CampoTipo
  icone?: React.ReactNode
  obrigatorio?: boolean
  opcoes?: { valor: string; label: string }[]
  placeholder?: string
  /** Marca o campo como nao editavel + define o motivo (ícone + tooltip). */
  readonly?: ReadonlyMotivo
  /** Texto custom do tooltip readonly. Default usa o texto padrao do motivo. */
  motivoTexto?: string
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
      // Sistema (readonly) — gerados na criacao do processo
      { key: 'numero_processo',    label: 'Número do Processo',    tipo: 'texto', icone: <Hash />,
        readonly: 'sistema', motivoTexto: 'Gerado automaticamente na criação do processo' },
      { key: 'data_abertura',      label: 'Data de Abertura',      tipo: 'texto', icone: <Certificate />,
        readonly: 'sistema', motivoTexto: 'Timestamp de criação do processo' },
      // Editaveis
      { key: 'ref_cliente',        label: 'Referência do Cliente', tipo: 'texto', obrigatorio: true, placeholder: 'Ex: 1995/25 E 2020/25', icone: <IdentificationCard /> },
      { key: 'outra_ref',          label: 'Outra Referência',      tipo: 'texto', icone: <Hash /> },
      { key: 'responsavel',        label: 'Responsável',           tipo: 'texto', obrigatorio: true, icone: <User /> },
      { key: 'responsavel_reg',    label: 'Responsável Registro',  tipo: 'texto', icone: <User /> },
      { key: 'auxiliar',           label: 'Auxiliar',              tipo: 'texto', icone: <UserCircle /> },
      { key: 'numero_booking',     label: 'Número do Booking',     tipo: 'texto', placeholder: 'BKG-…', icone: <Hash /> },
      { key: 'despachante',        label: 'Despachante',           tipo: 'texto', obrigatorio: true, icone: <Briefcase /> },
      // Bloqueado (readonly) — apos emissao nao pode ser alterado
      { key: 'certificado',        label: 'Certificado',           tipo: 'texto', icone: <Certificate />,
        readonly: 'bloqueado', motivoTexto: 'Bloqueado após emissão do certificado' },
      // Calculado (readonly) — soma dos pedidos vinculados
      { key: 'total_fob',          label: 'Total FOB',             tipo: 'texto', icone: <CurrencyDollar />,
        readonly: 'calculado', motivoTexto: 'Soma do valor FOB de todos os pedidos vinculados ao processo' },
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
        readonly: 'bloqueado', motivoTexto: 'Definido pela Receita Federal após parametrização da DI',
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
  {
    // Containers: tipo/tamanho herdam dos enums do Cadastros/Container;
    // numero, tara, pesos e cubagem sao operacionais do processo
    // (variam por embarque, nao moram no catalogo).
    id: 'containers',
    titulo: 'Containers',
    icone: <Cube weight="duotone" size={18} />,
    campos: [
      { key: 'numero_container',       label: 'Número do Container', tipo: 'texto',  obrigatorio: true, placeholder: 'Ex: MSKU1234567', icone: <Barcode /> },
      { key: 'tipo_container',         label: 'Tipo de Container',   tipo: 'select', obrigatorio: true, icone: <Cube />,
        opcoes: [
          { valor: 'DRY',         label: 'Dry (carga seca)' },
          { valor: 'REEFER',      label: 'Reefer (refrigerado)' },
          { valor: 'OPEN_TOP',    label: 'Open Top' },
          { valor: 'FLAT_RACK',   label: 'Flat Rack' },
          { valor: 'TANK',        label: 'Tank (tanque)' },
          { valor: 'BULK',        label: 'Bulk (granel)' },
          { valor: 'PLATAFORMA',  label: 'Plataforma' },
        ] },
      { key: 'tamanho_container',      label: 'Tamanho do Container', tipo: 'select', obrigatorio: true, icone: <Resize />,
        opcoes: [
          { valor: "20'",    label: "20'" },
          { valor: "40'",    label: "40'" },
          { valor: "40'HC",  label: "40' High Cube" },
          { valor: "45'",    label: "45'" },
        ] },
      { key: 'tara_container',         label: 'Tara do Container (kg)',          tipo: 'numero', placeholder: 'Ex: 2300',  icone: <Scales /> },
      { key: 'peso_liquido_container', label: 'Peso Líquido do Container (kg)',  tipo: 'numero', placeholder: 'Ex: 20000', icone: <Package /> },
      { key: 'peso_bruto_container',   label: 'Peso Bruto do Container (kg)',    tipo: 'numero', placeholder: 'Ex: 22300', icone: <Stack /> },
      { key: 'cubagem_container',      label: 'Cubagem do Container (m³)',       tipo: 'numero', placeholder: 'Ex: 33.2',  icone: <CubeFocus /> },
    ],
  },
]

// ── Mock de valores iniciais ────────────────────────────────────────────────

const VALORES_INICIAIS: Record<string, string> = {
  numero_processo: 'IMP-2026/0150',
  data_abertura: '10/01/2026',
  total_fob: 'US$ 108.050,00',
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

  // ── Caso readonly: mesmo layout/cor dos editaveis, so muda o
  //    icone direito (Lock/Sparkle/Gear) + tooltip ancorado no icone
  //    + sem hover lift + cursor default. Visual ortogonal ao status. ───
  if (campo.readonly) {
    const READONLY_CONFIG: Record<ReadonlyMotivo, { icone: React.ReactNode; texto: string }> = {
      calculado:  { icone: <Sparkle weight="fill"     size={14} />, texto: 'Calculado automaticamente' },
      bloqueado:  { icone: <Lock    weight="duotone"  size={14} />, texto: 'Bloqueado por status do processo' },
      sistema:    { icone: <Gear    weight="duotone"  size={14} />, texto: 'Gerado pelo sistema' },
    }
    const cfg = READONLY_CONFIG[campo.readonly]
    const tooltipDescricao = campo.motivoTexto ?? cfg.texto

    return (
      <div className={`dt-row dt-row--${status} dt-row--readonly dt-row--readonly-${campo.readonly}`}>
        <div className="dt-row-status" aria-hidden="true" />
        <div className="dt-row-head">
          {campo.icone && <span className="dt-row-icon">{campo.icone}</span>}
          <span className="dt-row-label">{campo.label}</span>
          {/* Icone do motivo logo apos o label (mesmo lugar do asterisco
              de obrigatorio). TooltipGlobal ancorado SOMENTE no icone
              — anchor pequeno = posicao correta. */}
          <TooltipGlobal titulo={campo.label} descricao={tooltipDescricao}>
            <span className="dt-row-readonly-icon" aria-hidden="true">{cfg.icone}</span>
          </TooltipGlobal>
        </div>
        <div className="dt-row-value dt-row-value--readonly">
          {vazio
            ? <span className="dt-row-empty">—</span>
            : <span className="dt-row-text">{valorDisplay}</span>
          }
        </div>
      </div>
    )
  }

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
            // SelectGlobal — padrao do sistema (com busca, icone, chevron)
            <SelectGlobal
              opcoes={campo.opcoes?.map(o => ({ valor: o.valor, rotulo: o.label })) ?? []}
              valor={valorLocal}
              aoMudarValor={(v) => {
                const novo = v == null ? '' : String(v)
                setValorLocal(novo)
                if (novo !== valor) onSalvar(novo)
                setEditando(false)
              }}
              buscavel
              placeholder="Selecione…"
              iconeEsquerda={campo.icone}
            />
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
  // (TOC vertical/colapsavel foi substituida por header horizontal —
  //  estado tocColapsada removido pra evitar codigo orfao.)
  // Modo do card de stats: total ou so obrigatorios
  const [modoStats, setModoStats] = useState<'total' | 'obrig'>('total')
  // Secoes colapsadas — default TODAS COLAPSADAS (usuario expande as
  // que quiser). Tela inicia compacta, evita rolagem desnecessaria.
  const [secoesColapsadas, setSecoesColapsadas] = useState<Set<string>>(() => new Set(SECOES.map(s => s.id)))
  // Busca por nome do campo OU conteudo preenchido
  const [busca, setBusca] = useState('')
  const buscaNorm = busca.trim().toLowerCase()
  const filtroAtivo = buscaNorm !== ''

  // Decide se um campo corresponde a busca: bate no label, no valor
  // bruto ou no label da opcao selecionada (no caso de selects).
  function campoCorresponde(c: CampoConfig, v: string): boolean {
    if (c.label.toLowerCase().includes(buscaNorm)) return true
    if (v && v.toLowerCase().includes(buscaNorm)) return true
    const op = c.opcoes?.find(o => o.valor === v)
    if (op && op.label.toLowerCase().includes(buscaNorm)) return true
    return false
  }

  // Pre-computa quais campos batem com a busca por secao
  const camposFiltrados = useMemo(() => {
    if (!filtroAtivo) return null
    const mapa: Record<string, CampoConfig[]> = {}
    for (const sec of SECOES) {
      mapa[sec.id] = sec.campos.filter(c => campoCorresponde(c, valores[c.key] ?? ''))
    }
    return mapa
  }, [buscaNorm, valores, filtroAtivo])

  const totalMatches = useMemo(() => {
    if (!camposFiltrados) return 0
    return Object.values(camposFiltrados).reduce((acc, arr) => acc + arr.length, 0)
  }, [camposFiltrados])

  function toggleSecao(id: string) {
    setSecoesColapsadas(prev => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id); else novo.add(id)
      return novo
    })
  }

  function expandirSecao(id: string) {
    setSecoesColapsadas(prev => {
      if (!prev.has(id)) return prev
      const novo = new Set(prev)
      novo.delete(id)
      return novo
    })
  }

  const todasColapsadas = secoesColapsadas.size === SECOES.length

  function toggleTodas() {
    setSecoesColapsadas(prev =>
      prev.size === SECOES.length ? new Set() : new Set(SECOES.map(s => s.id))
    )
  }

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
    // Se a secao estiver colapsada, expande antes do scroll.
    expandirSecao(id)
    // Double rAF: o primeiro frame deixa o React fazer o re-render
    // (a secao expande, ganha altura), o segundo deixa o browser
    // recomputar o layout antes do scrollIntoView usar as posicoes
    // novas. Sem isso, o scrollIntoView usa as posicoes antigas
    // (todas colapsadas, todas no topo da tela) e nada acontece.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<GearSix weight="duotone" size={22} />}
          titulo="Dados do Processo"
          subtitulo="Informações operacionais e documentais do processo"
        />
      }
    >
      <div className="dt-layout">
        {/* ── Conteudo: secoes empilhadas em largura total ──────────────── */}
        <main className="dt-main">
          {/* Toolbar: Recolher / Expandir todas */}
          <div className="dt-main-toolbar">
            <button
              type="button"
              className="dt-main-toolbar-btn"
              onClick={toggleTodas}
              title={todasColapsadas ? 'Expandir todas as seções' : 'Recolher todas as seções'}
            >
              <CaretDown
                weight="bold"
                size={12}
                className={`dt-caret ${todasColapsadas ? 'dt-caret--colapsado' : ''}`}
              />
              {todasColapsadas ? 'Expandir todas' : 'Recolher todas'}
            </button>
          </div>

          {SECOES.map(sec => {
            const c = completude[sec.id]
            const completa = c.preenchidos === c.total
            const pct = Math.round((c.preenchidos / c.total) * 100)
            // Quando busca ativa: usa lista filtrada, esconde secao sem
            // matches e forca expansao para mostrar os hits.
            const camposVisiveis = filtroAtivo
              ? (camposFiltrados?.[sec.id] ?? [])
              : sec.campos
            if (filtroAtivo && camposVisiveis.length === 0) return null
            const colapsada = filtroAtivo ? false : secoesColapsadas.has(sec.id)
            return (
              <section
                key={sec.id}
                id={sec.id}
                className={`dt-secao ${colapsada ? 'dt-secao--colapsada' : ''}`}
              >
                <button
                  type="button"
                  className="dt-secao-header"
                  onClick={() => toggleSecao(sec.id)}
                  aria-expanded={!colapsada}
                  aria-controls={`${sec.id}-grid`}
                  title={colapsada ? 'Expandir seção' : 'Recolher seção'}
                >
                  <div className="dt-secao-title">
                    <CaretDown
                      weight="bold"
                      size={14}
                      className={`dt-caret ${colapsada ? 'dt-caret--colapsado' : ''}`}
                    />
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
                </button>

                {!colapsada && (
                  <div id={`${sec.id}-grid`} className="dt-grid">
                    {camposVisiveis.map(campo => (
                      <CampoLinha
                        key={campo.key}
                        campo={campo}
                        valor={valores[campo.key] ?? ''}
                        onSalvar={(novo) => salvarCampo(campo.key, novo)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )
          })}

          {/* Empty state quando busca nao tem matches */}
          {filtroAtivo && totalMatches === 0 && (
            <div className="dt-empty">
              <MagnifyingGlass weight="duotone" size={32} />
              <h3>Nenhum campo encontrado</h3>
              <p>Nenhum campo cujo nome ou conteúdo contenha “{busca}”.</p>
              <button type="button" className="dt-empty-btn" onClick={() => setBusca('')}>
                Limpar busca
              </button>
            </div>
          )}
        </main>
      </div>
    </PaginaGlobal>
  )
}
