import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { CampoGeralGlobal, type CampoGeralGlobalProps } from '@nucleo/campo-geral-global'
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import './calendario.css'

export interface CalendarioCampoGlobalProps extends Omit<CampoGeralGlobalProps, 'children'> {
  placeholder?: string
  valor?: { inicio: Date | null; fim: Date | null }
  aoMudarValor?: (valor: { inicio: Date | null; fim: Date | null }) => void
  disabled?: boolean
  /** Abre o painel imediatamente ao montar (útil em overlays controladas externamente) */
  initialOpen?: boolean
  /** Omite o trigger e renderiza o painel diretamente inline (uso em dropdowns externos) */
  semTrigger?: boolean
}

const MESES_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

function formatarDataBR(d: Date | null): string {
  if (!d) return ''
  return d.toLocaleDateString('pt-BR')
}

export function CalendarioCampoGlobal({
  placeholder,
  valor = { inicio: null, fim: null },
  aoMudarValor,
  disabled = false,
  initialOpen = false,
  semTrigger = false,
  className,
  ...geralProps
}: CalendarioCampoGlobalProps) {
  const { t } = useTranslation()
  const defaultPlaceholder = placeholder ?? t('campo.selecione_periodo')

  const MESES_NOMES = MESES_INDICES.map((idx) => t(`calendario.mes_${idx}`))
  const MESES_OPCOES = MESES_INDICES.map((idx) => ({
    rotulo: MESES_NOMES[idx],
    valor: idx,
  }))
  const DIAS_SEMANA = [
    t('calendario.dia_dom'), t('calendario.dia_seg'), t('calendario.dia_ter'),
    t('calendario.dia_qua'), t('calendario.dia_qui'), t('calendario.dia_sex'), t('calendario.dia_sab')
  ]
  const [isOpen, setIsOpen] = useState(initialOpen)
  const containerRef = useRef<HTMLDivElement>(null)

  const [inicio, setInicio] = useState<Date | null>(valor.inicio)
  const [fim, setFim] = useState<Date | null>(valor.fim)

  const [viewMes, setViewMes] = useState(new Date().getMonth())
  const [viewAno, setViewAno] = useState(new Date().getFullYear())

  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [etapa, setEtapa] = useState<'inicio' | 'fim'>('inicio')
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(null)

  // Quando initialOpen=true, calcula posição do painel logo após montar
  useEffect(() => {
    if (initialOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPanelPos({ top: rect.bottom + 8, left: rect.left, width: Math.max(rect.width, 380) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setInicio(valor.inicio)
    setFim(valor.fim)
    if (valor.inicio) {
      setViewMes(valor.inicio.getMonth())
      setViewAno(valor.inicio.getFullYear())
    }
  }, [valor.inicio, valor.fim])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Não fechar se o clique foi dentro de um portal do SelectGlobal (dropdown de mês/ano)
        const portal = (target as Element).closest?.('[id$="-portal"]')
        if (portal) return
        setIsOpen(false)
      }
    }
    // Fechar calendário ao scroll da página (evita painel flutuante desalinhado)
    // Ignora scroll interno de componentes (dropdown mês/ano, lista do calendário, etc.)
    function handleScroll(e: Event) {
      const target = e.target
      if (target === document || target === document.documentElement) {
        setIsOpen(false)
        return
      }
      // Scroll de elementos internos do calendário ou portais de selects — não fechar
      if (target instanceof Element) {
        if (target.closest('.ws-calendario-panel') || target.closest('[id$="-portal"]') || target.closest('.sg-dropdown')) return
      }
      setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  function handleDayClick(d: Date) {
    if (etapa === 'inicio' || (inicio && d < inicio && (!fim || fim === inicio))) {
      setInicio(d)
      setFim(null)
      setEtapa('fim')
    } else {
      if (inicio && d < inicio) {
        setFim(inicio)
        setInicio(d)
      } else {
        setFim(d)
      }
      setEtapa('inicio')
    }
  }

  function handleDayMouseEnter(d: Date) {
    if (etapa === 'fim' && inicio) {
      setHoverDate(d)
    } else {
      setHoverDate(null)
    }
  }

  function aplicarPeriodo(tipo: string) {
    const hoje = new Date()
    hoje.setHours(0,0,0,0)
    
    let i = new Date(hoje)
    let f = new Date(hoje)

    if (tipo === 'hoje') {
      // already set
    } else if (tipo === 'ontem') {
      i.setDate(i.getDate() - 1)
      f.setDate(f.getDate() - 1)
    } else if (tipo === '7dias') {
      i.setDate(i.getDate() - 6)
    } else if (tipo === '30dias') {
      i.setDate(i.getDate() - 29)
    } else if (tipo === 'esteMes') {
      i.setDate(1)
      f = new Date(f.getFullYear(), f.getMonth() + 1, 0)
    } else if (tipo === 'mesPassado') {
      i = new Date(i.getFullYear(), i.getMonth() - 1, 1)
      f = new Date(f.getFullYear(), f.getMonth(), 0)
    } else if (tipo === 'esteAno') {
      i = new Date(i.getFullYear(), 0, 1)
      f = new Date(f.getFullYear(), 11, 31)
    } else if (tipo === 'todos') {
      setInicio(null)
      setFim(null)
      setEtapa('inicio')
      return
    }

    setInicio(i)
    setFim(f)
    setViewMes(f.getMonth())
    setViewAno(f.getFullYear())
    setEtapa('inicio')
  }

  // Calcula posição do painel relativa ao viewport (position: fixed)
  const calcularPosicao = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPanelPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 380),
      })
    }
  }, [])

  function doConfirm() {
    aoMudarValor?.({ inicio, fim })
    setIsOpen(false)
  }

  const anosOptions = useMemo(() => {
    const min = new Date().getFullYear() - 10
    const max = new Date().getFullYear() + 5
    const opts = []
    for (let a = min; a <= max; a++) {
      opts.push({ rotulo: String(a), valor: a })
    }
    return opts
  }, [])

  const diasNoMes = useMemo(() => {
    const dias = []
    const primeiroDia = new Date(viewAno, viewMes, 1).getDay()
    const qtdeDias = new Date(viewAno, viewMes + 1, 0).getDate()
    
    // Mes anterior
    const qtdeMesAnterior = new Date(viewAno, viewMes, 0).getDate()
    for (let i = primeiroDia - 1; i >= 0; i--) {
      dias.push({ data: new Date(viewAno, viewMes - 1, qtdeMesAnterior - i), atual: false })
    }
    
    // Mes atual
    for (let i = 1; i <= qtdeDias; i++) {
      dias.push({ data: new Date(viewAno, viewMes, i), atual: true })
    }
    
    // Proximo mes
    const faltam = 42 - dias.length
    for (let i = 1; i <= faltam; i++) {
      dias.push({ data: new Date(viewAno, viewMes + 1, i), atual: false })
    }
    return dias
  }, [viewAno, viewMes])

  function mudaMes(diff: number) {
    let m = viewMes + diff
    let a = viewAno
    if (m > 11) { m = 0; a += 1 }
    else if (m < 0) { m = 11; a -= 1 }
    setViewMes(m)
    setViewAno(a)
  }

  const textoDisplay = (valor.inicio && valor.fim)
    ? `${formatarDataBR(valor.inicio)} a ${formatarDataBR(valor.fim)}`
    : valor.inicio ? formatarDataBR(valor.inicio) : ''

  function renderPanel(inline = false) {
    return (
      <div
        className="ws-calendario-panel"
        style={inline ? undefined : panelPos ? {
          position: 'fixed',
          top: panelPos.top,
          left: panelPos.left,
          zIndex: 10001,
        } : undefined}
      >
        {/* Sidebar Periods */}
        <div className="ws-calendario-sidebar">
          <button className="ws-calendario-preset" onClick={() => aplicarPeriodo('hoje')}>{t('calendario.hoje')}</button>
          <button className="ws-calendario-preset" onClick={() => aplicarPeriodo('ontem')}>{t('calendario.ontem')}</button>
          <button className="ws-calendario-preset" onClick={() => aplicarPeriodo('7dias')}>{t('calendario.ultimos_7')}</button>
          <button className="ws-calendario-preset" onClick={() => aplicarPeriodo('30dias')}>{t('calendario.ultimos_30')}</button>
          <button className="ws-calendario-preset" onClick={() => aplicarPeriodo('esteMes')}>{t('calendario.este_mes')}</button>
          <button className="ws-calendario-preset" onClick={() => aplicarPeriodo('mesPassado')}>{t('calendario.mes_passado')}</button>
          <button className="ws-calendario-preset" onClick={() => aplicarPeriodo('esteAno')}>{t('calendario.este_ano')}</button>
          <div style={{ flex: 1 }} />
          <button className="ws-calendario-preset" onClick={() => aplicarPeriodo('todos')} style={{ color: '#f87171' }}>{t('calendario.limpar_periodo')}</button>
        </div>

        {/* Main Calendar Body */}
        <div className="ws-calendario-body">
          <div className="ws-calendario-header">
            <button className="ws-calendario-nav-btn" onClick={() => mudaMes(-1)}><CaretLeft size={16} weight="bold" /></button>

            <div className="ws-calendario-selectors">
              <SelectGlobal
                buscavel={false}
                valor={viewMes}
                opcoes={MESES_OPCOES}
                aoMudarValor={(val: string | number | null) => setViewMes(Number(val))}
              />
              <SelectGlobal
                buscavel={false}
                valor={viewAno}
                opcoes={anosOptions}
                aoMudarValor={(val: string | number | null) => setViewAno(Number(val))}
              />
            </div>

            <button className="ws-calendario-nav-btn" onClick={() => mudaMes(1)}><CaretRight size={16} weight="bold" /></button>
          </div>

          <div className="ws-calendario-range-display">
            <div className={`ws-calendario-range-item ${etapa === 'inicio' ? 'ws-calendario-range-item--ativo' : ''}`}>
              <span className="ws-calendario-range-label">{t('calendario.inicio')}</span>
              <span className="ws-calendario-range-value">{inicio ? formatarDataBR(inicio) : '—'}</span>
            </div>
            <span className="ws-calendario-range-separator">→</span>
            <div className={`ws-calendario-range-item ${etapa === 'fim' ? 'ws-calendario-range-item--ativo' : ''}`}>
              <span className="ws-calendario-range-label">{t('calendario.fim')}</span>
              <span className="ws-calendario-range-value">{fim ? formatarDataBR(fim) : '—'}</span>
            </div>
          </div>

          <div className="ws-calendario-grid">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="ws-calendario-day-name">{d}</div>
            ))}

            {diasNoMes.map((d, i) => {
              const dataTs = d.data.getTime()
              const iniTs = inicio?.getTime()
              const fimTs = fim?.getTime() || (hoverDate ? hoverDate.getTime() : iniTs)

              const isStart = iniTs === dataTs
              const isEnd = fimTs === dataTs && fim !== null

              let inRange = false
              if (iniTs && fimTs) {
                const sortedIni = Math.min(iniTs, fimTs)
                const sortedFim = Math.max(iniTs, fimTs)
                if (dataTs >= sortedIni && dataTs <= sortedFim) {
                  inRange = true
                }
              }

              let wrapperClass = 'ws-calendario-cell-wrapper'
              if (inRange) {
                if (iniTs === fimTs) {
                  wrapperClass += ' single-date'
                } else if (dataTs === Math.min(iniTs as number, fimTs as number)) {
                  wrapperClass += ' start-date'
                } else if (dataTs === Math.max(iniTs as number, fimTs as number)) {
                  wrapperClass += ' end-date'
                } else {
                  wrapperClass += ' in-range'
                }
              }

              let cellClass = 'ws-calendario-cell'
              if (!d.atual) cellClass += ' muted'
              if (isStart || isEnd) cellClass += ' active'

              return (
                <div key={i} className={wrapperClass}>
                  <button
                    className={cellClass}
                    onClick={() => handleDayClick(d.data)}
                    onMouseEnter={() => handleDayMouseEnter(d.data)}
                  >
                    {d.data.getDate()}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="ws-calendario-footer">
            <BotaoGlobal
              variante="fantasma"
              tamanho="pequeno"
              onClick={() => setIsOpen(false)}
            >
              {t('calendario.cancelar')}
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              onClick={doConfirm}
            >
              {t('calendario.aplicar')}
            </BotaoGlobal>
          </div>
        </div>
      </div>
    )
  }

  // Modo sem trigger: renderiza o painel diretamente inline, sem trigger ou wrapper CampoGeralGlobal
  if (semTrigger) {
    return renderPanel(true)
  }

  return (
    <CampoGeralGlobal className={className} {...geralProps}>
      <div
        ref={containerRef}
        style={{ position: 'relative' }}
        className={disabled ? 'ws-disabled' : ''}
      >
        {textoDisplay ? (
          <TooltipGlobal titulo={textoDisplay} descricao="">
            <div
              onClick={() => { if (!disabled) { calcularPosicao(); setIsOpen(v => !v) } }}
              className={`sg-campo ${isOpen ? 'sg-campo--aberto' : ''} ${disabled ? 'sg-campo--desabilitado' : ''}`}
            >
              <span className="sg-icone-esquerda" aria-hidden="true">
                <CalendarBlank size={16} />
              </span>

              <div className="sg-valor">
                <span className="sg-valor-selecionado">{textoDisplay}</span>
              </div>

              <div className="sg-acoes">
                {!disabled ? (
                  <button
                    title={t('campo.limpar')}
                    className="sg-btn-limpar"
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setInicio(null)
                      setFim(null)
                      aoMudarValor?.({ inicio: null, fim: null })
                    }}
                    aria-label={t('campo.limpar_selecao')}
                    tabIndex={-1}
                  >
                    ✕
                  </button>
                ) : null}
                <span className={`sg-chevron ${isOpen ? 'sg-chevron--aberto' : ''}`} aria-hidden="true">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>
          </TooltipGlobal>
        ) : (
          <div
            onClick={() => { if (!disabled) { calcularPosicao(); setIsOpen(v => !v) } }}
            className={`sg-campo ${isOpen ? 'sg-campo--aberto' : ''} ${disabled ? 'sg-campo--desabilitado' : ''}`}
          >
            <span className="sg-icone-esquerda" aria-hidden="true">
              <CalendarBlank size={16} />
            </span>

            <div className="sg-valor">
              <span className="sg-placeholder">{defaultPlaceholder}</span>
            </div>

            <div className="sg-acoes">
              <span className={`sg-chevron ${isOpen ? 'sg-chevron--aberto' : ''}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>
        )}

        {isOpen && renderPanel()}
      </div>
    </CampoGeralGlobal>
  )
}

// ─── CalendarioPainelGlobal ───────────────────────────────────────────────────
// Painel standalone sem trigger — para uso em dropdowns externos.
// Renderiza o calendário inline (sem posicionamento absoluto/fixo).

export interface CalendarioPainelGlobalProps {
  valor?: { inicio: Date | null; fim: Date | null }
  aoMudarValor?: (valor: { inicio: Date | null; fim: Date | null }) => void
  onFechar?: () => void
}

// CalendarioPainelGlobal excede 50 linhas por necessidade: é um componente React
// completo com estado próprio (mes/ano/hover/etapa/datas), JSX do grid de dias,
// sidebar de presets e footer. Cada parte depende do estado compartilhado — extrair
// sub-componentes exigiria prop drilling extenso ou Context, adicionando complexidade
// desnecessária para um painel de uso único.
export function CalendarioPainelGlobal({
  valor = { inicio: null, fim: null },
  aoMudarValor,
  onFechar,
}: CalendarioPainelGlobalProps) {
  const { t } = useTranslation()

  const MESES_NOMES = MESES_INDICES.map((idx) => t(`calendario.mes_${idx}`))
  const MESES_OPCOES = MESES_INDICES.map((idx) => ({ rotulo: MESES_NOMES[idx], valor: idx }))
  const DIAS_SEMANA = [
    t('calendario.dia_dom'), t('calendario.dia_seg'), t('calendario.dia_ter'),
    t('calendario.dia_qua'), t('calendario.dia_qui'), t('calendario.dia_sex'), t('calendario.dia_sab'),
  ]

  const [inicio, setInicio] = useState<Date | null>(valor.inicio)
  const [fim, setFim] = useState<Date | null>(valor.fim)
  const [viewMes, setViewMes] = useState(new Date().getMonth())
  const [viewAno, setViewAno] = useState(new Date().getFullYear())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [etapa, setEtapa] = useState<'inicio' | 'fim'>('inicio')

  const anosOptions = useMemo(() => {
    const min = new Date().getFullYear() - 10
    const max = new Date().getFullYear() + 5
    const opts = []
    for (let a = min; a <= max; a++) opts.push({ rotulo: String(a), valor: a })
    return opts
  }, [])

  const diasNoMes = useMemo(() => {
    const dias = []
    const primeiroDia = new Date(viewAno, viewMes, 1).getDay()
    const qtdeDias = new Date(viewAno, viewMes + 1, 0).getDate()
    const qtdeMesAnterior = new Date(viewAno, viewMes, 0).getDate()
    for (let i = primeiroDia - 1; i >= 0; i--)
      dias.push({ data: new Date(viewAno, viewMes - 1, qtdeMesAnterior - i), atual: false })
    for (let i = 1; i <= qtdeDias; i++)
      dias.push({ data: new Date(viewAno, viewMes, i), atual: true })
    const faltam = 42 - dias.length
    for (let i = 1; i <= faltam; i++)
      dias.push({ data: new Date(viewAno, viewMes + 1, i), atual: false })
    return dias
  }, [viewAno, viewMes])

  function mudaMes(diff: number) {
    let m = viewMes + diff, a = viewAno
    if (m > 11) { m = 0; a += 1 } else if (m < 0) { m = 11; a -= 1 }
    setViewMes(m); setViewAno(a)
  }

  function aplicarPreset(tipo: string) {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    let i = new Date(hoje), f = new Date(hoje)
    if (tipo === 'ontem') { i.setDate(i.getDate() - 1); f.setDate(f.getDate() - 1) }
    else if (tipo === '7dias') i.setDate(i.getDate() - 6)
    else if (tipo === '30dias') i.setDate(i.getDate() - 29)
    else if (tipo === 'esteMes') { i.setDate(1); f = new Date(f.getFullYear(), f.getMonth() + 1, 0) }
    else if (tipo === 'mesPassado') { i = new Date(i.getFullYear(), i.getMonth() - 1, 1); f = new Date(f.getFullYear(), f.getMonth(), 0) }
    else if (tipo === 'esteAno') { i = new Date(i.getFullYear(), 0, 1); f = new Date(f.getFullYear(), 11, 31) }
    else if (tipo === 'todos') { setInicio(null); setFim(null); setEtapa('inicio'); return }
    setInicio(i); setFim(f); setViewMes(f.getMonth()); setViewAno(f.getFullYear()); setEtapa('inicio')
  }

  function handleDayClick(d: Date) {
    if (etapa === 'inicio' || (inicio && d < inicio)) {
      setInicio(d); setFim(null); setEtapa('fim')
    } else {
      if (inicio && d < inicio) { setFim(inicio); setInicio(d) } else { setFim(d) }
      setEtapa('inicio')
    }
  }

  function doConfirm() {
    aoMudarValor?.({ inicio, fim })
    onFechar?.()
  }

  return (
    // position: relative sobrescreve o position: absolute do CSS .ws-calendario-panel
    <div className="ws-calendario-panel" style={{ position: 'relative', top: 'auto', left: 'auto' }}>
      <div className="ws-calendario-sidebar">
        <button className="ws-calendario-preset" onClick={() => aplicarPreset('hoje')}>{t('calendario.hoje')}</button>
        <button className="ws-calendario-preset" onClick={() => aplicarPreset('ontem')}>{t('calendario.ontem')}</button>
        <button className="ws-calendario-preset" onClick={() => aplicarPreset('7dias')}>{t('calendario.ultimos_7')}</button>
        <button className="ws-calendario-preset" onClick={() => aplicarPreset('30dias')}>{t('calendario.ultimos_30')}</button>
        <button className="ws-calendario-preset" onClick={() => aplicarPreset('esteMes')}>{t('calendario.este_mes')}</button>
        <button className="ws-calendario-preset" onClick={() => aplicarPreset('mesPassado')}>{t('calendario.mes_passado')}</button>
        <button className="ws-calendario-preset" onClick={() => aplicarPreset('esteAno')}>{t('calendario.este_ano')}</button>
        <div style={{ flex: 1 }} />
        <button className="ws-calendario-preset" onClick={() => aplicarPreset('todos')} style={{ color: '#f87171' }}>{t('calendario.limpar_periodo')}</button>
      </div>

      <div className="ws-calendario-body">
        <div className="ws-calendario-header">
          <button className="ws-calendario-nav-btn" onClick={() => mudaMes(-1)}><CaretLeft size={16} weight="bold" /></button>
          <div className="ws-calendario-selectors">
            <SelectGlobal buscavel={false} valor={viewMes} opcoes={MESES_OPCOES} aoMudarValor={(v: string | number | null) => setViewMes(Number(v))} />
            <SelectGlobal buscavel={false} valor={viewAno} opcoes={anosOptions} aoMudarValor={(v: string | number | null) => setViewAno(Number(v))} />
          </div>
          <button className="ws-calendario-nav-btn" onClick={() => mudaMes(1)}><CaretRight size={16} weight="bold" /></button>
        </div>

        <div className="ws-calendario-range-display">
          <div className={`ws-calendario-range-item ${etapa === 'inicio' ? 'ws-calendario-range-item--ativo' : ''}`}>
            <span className="ws-calendario-range-label">{t('calendario.inicio')}</span>
            <span className="ws-calendario-range-value">{inicio ? formatarDataBR(inicio) : '—'}</span>
          </div>
          <span className="ws-calendario-range-separator">→</span>
          <div className={`ws-calendario-range-item ${etapa === 'fim' ? 'ws-calendario-range-item--ativo' : ''}`}>
            <span className="ws-calendario-range-label">{t('calendario.fim')}</span>
            <span className="ws-calendario-range-value">{fim ? formatarDataBR(fim) : '—'}</span>
          </div>
        </div>

        <div className="ws-calendario-grid">
          {DIAS_SEMANA.map(d => <div key={d} className="ws-calendario-day-name">{d}</div>)}
          {diasNoMes.map((d, i) => {
            const dataTs = d.data.getTime()
            const iniTs = inicio?.getTime()
            const fimTs = fim?.getTime() || (hoverDate ? hoverDate.getTime() : iniTs)
            const isStart = iniTs === dataTs
            const isEnd = fimTs === dataTs && fim !== null
            let inRange = false
            if (iniTs && fimTs) {
              const s = Math.min(iniTs, fimTs), e = Math.max(iniTs, fimTs)
              if (dataTs >= s && dataTs <= e) inRange = true
            }
            let wrapperClass = 'ws-calendario-cell-wrapper'
            if (inRange) {
              if (iniTs === fimTs) wrapperClass += ' single-date'
              else if (dataTs === Math.min(iniTs as number, fimTs as number)) wrapperClass += ' start-date'
              else if (dataTs === Math.max(iniTs as number, fimTs as number)) wrapperClass += ' end-date'
              else wrapperClass += ' in-range'
            }
            let cellClass = 'ws-calendario-cell'
            if (!d.atual) cellClass += ' muted'
            if (isStart || isEnd) cellClass += ' active'
            return (
              <div key={i} className={wrapperClass}>
                <button className={cellClass} onClick={() => handleDayClick(d.data)} onMouseEnter={() => { if (etapa === 'fim' && inicio) setHoverDate(d.data); else setHoverDate(null) }}>
                  {d.data.getDate()}
                </button>
              </div>
            )
          })}
        </div>

        <div className="ws-calendario-footer">
          <BotaoGlobal variante="fantasma" tamanho="pequeno" onClick={onFechar}>{t('calendario.cancelar')}</BotaoGlobal>
          <BotaoGlobal variante="primario" tamanho="pequeno" onClick={doConfirm}>{t('calendario.aplicar')}</BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
