/**
 * CampoLinhaConferenciaNovaLeituraSmartRead — edit-in-place (paridade DadosTecnicos / CampoLinha)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarBlank, PencilSimple } from '@phosphor-icons/react'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import {
  aplicarMascaraDataConferenciaSmartRead,
  dateToIsoConferenciaSmartRead,
  ehCampoDataConferenciaSmartRead,
  formatarDataConferenciaSmartRead,
  normalizarValorDataConferenciaParaIso,
  valorDataConferenciaParaCalendario,
} from '../../shared/data-campo-conferencia-leitura-smart-read'
import { resolverIconeCampoConferenciaSmartRead } from '../../shared/resolver-icone-campo-conferencia-smart-read'

type TipoCampoConferencia = 'texto' | 'booleano' | 'data'

type Props = {
  chave: string
  rotulo: string
  valor: string | null
  alterado?: boolean
  tipo?: TipoCampoConferencia
  aoSalvar: (novo: string) => void
}

const OPCOES_BOOLEANO = [
  { valor: 'Sim', rotulo: 'Sim' },
  { valor: 'Não', rotulo: 'Não' },
]

function textoExibicao(valor: string | null, tipo: TipoCampoConferencia): string {
  if (!valor) return ''
  if (tipo === 'booleano') {
    return valor === 'Sim' ? 'Assinado' : 'Não assinado'
  }
  if (tipo === 'data') {
    return formatarDataConferenciaSmartRead(valor)
  }
  return valor
}

export function CampoLinhaConferenciaNovaLeituraSmartRead({
  chave,
  rotulo,
  valor,
  alterado = false,
  tipo: tipoProp,
  aoSalvar,
}: Props) {
  const tipo: TipoCampoConferencia =
    tipoProp ?? (ehCampoDataConferenciaSmartRead(chave) ? 'data' : 'texto')

  const [editando, setEditando] = useState(false)
  const [valorLocal, setValorLocal] = useState(valor ?? '')
  const [textoDataLocal, setTextoDataLocal] = useState('')
  const [calendarioAberto, setCalendarioAberto] = useState(false)
  const [painelCalendarioPos, setPainelCalendarioPos] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const btnCalendarioRef = useRef<HTMLButtonElement>(null)
  const calendarioAbertoRef = useRef(false)
  const icone = useMemo(() => resolverIconeCampoConferenciaSmartRead(chave), [chave])

  useEffect(() => {
    calendarioAbertoRef.current = calendarioAberto
  }, [calendarioAberto])

  useEffect(() => {
    setValorLocal(valor ?? '')
  }, [valor])

  useEffect(() => {
    if (editando && tipo === 'data') {
      setTextoDataLocal(formatarDataConferenciaSmartRead(valor))
      calendarioAbertoRef.current = false
      setCalendarioAberto(false)
      setPainelCalendarioPos(null)
    }
  }, [editando, tipo, valor])

  useEffect(() => {
    if (!calendarioAberto) return

    function fecharCalendario() {
      calendarioAbertoRef.current = false
      setCalendarioAberto(false)
      setPainelCalendarioPos(null)
    }

    function handleClickOutside(event: MouseEvent) {
      const alvo = event.target
      if (!(alvo instanceof Node)) return
      if (inputRef.current?.contains(alvo)) return
      if (btnCalendarioRef.current?.contains(alvo)) return
      if (alvo instanceof Element && alvo.closest('.sr-conf-campo-data-calendario-painel-portal')) return
      if (alvo instanceof Element && alvo.closest('.ws-calendario-panel')) return
      if (alvo instanceof Element && alvo.closest('[id$="-portal"]')) return
      fecharCalendario()
    }

    function handleScroll(event: Event) {
      const alvo = event.target
      if (alvo === document || alvo === document.documentElement) {
        fecharCalendario()
        return
      }
      if (alvo instanceof Element) {
        if (
          alvo.closest('.ws-calendario-panel') ||
          alvo.closest('[id$="-portal"]') ||
          alvo.closest('.sg-dropdown')
        ) {
          return
        }
      }
      fecharCalendario()
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [calendarioAberto])

  useEffect(() => {
    if (editando && inputRef.current && (tipo === 'texto' || (tipo === 'data' && !calendarioAberto))) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editando, tipo, calendarioAberto])

  const vazio = !valor || valor.trim() === ''
  const status = vazio ? 'vazio-opc' : 'preenchido'
  const valorDisplay = textoExibicao(valor, tipo)

  function salvar() {
    const limpo = valorLocal.trim()
    if (limpo !== (valor ?? '')) aoSalvar(limpo)
    setEditando(false)
  }

  function cancelar() {
    setValorLocal(valor ?? '')
    setTextoDataLocal(formatarDataConferenciaSmartRead(valor))
    fecharCalendario()
    setEditando(false)
  }

  function fecharCalendario() {
    calendarioAbertoRef.current = false
    setCalendarioAberto(false)
    setPainelCalendarioPos(null)
  }

  function alternarCalendario() {
    if (calendarioAbertoRef.current) {
      fecharCalendario()
      inputRef.current?.focus()
      return
    }

    const ancora = inputRef.current ?? btnCalendarioRef.current
    if (!ancora) return

    const rect = ancora.getBoundingClientRect()
    const largura = Math.max(rect.width, 300)
    let left = Math.min(rect.left, window.innerWidth - largura - 8)
    left = Math.max(8, left)

    const alturaEstimada = 320
    let top = rect.bottom + 4
    if (top + alturaEstimada > window.innerHeight - 8) {
      top = Math.max(8, rect.top - alturaEstimada - 4)
    }

    calendarioAbertoRef.current = true
    setPainelCalendarioPos({ top, left, width: largura })
    setCalendarioAberto(true)
  }
  function salvarData() {
    const bruto = textoDataLocal.trim()
    const iso = bruto ? (normalizarValorDataConferenciaParaIso(bruto) ?? '') : ''
    const anterior = normalizarValorDataConferenciaParaIso(valor) ?? ''
    if (iso !== anterior) aoSalvar(iso)
    fecharCalendario()
    setEditando(false)
  }

  function cancelarEdicaoData() {
    fecharCalendario()
    cancelar()
  }

  const painelCalendario =
    calendarioAberto && painelCalendarioPos && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="sr-conf-campo-data-calendario-painel-portal"
            style={{
              position: 'fixed',
              top: painelCalendarioPos.top,
              left: painelCalendarioPos.left,
              width: painelCalendarioPos.width,
              zIndex: 10001,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <CampoCalendarioGlobal
              modoUnico
              semTrigger
              valor={{
                inicio: valorDataConferenciaParaCalendario(
                  normalizarValorDataConferenciaParaIso(textoDataLocal) ?? valor,
                ),
                fim: null,
              }}
              aoMudarValor={(selecionado) => {
                const iso = selecionado.inicio
                  ? dateToIsoConferenciaSmartRead(selecionado.inicio)
                  : ''
                const anterior = normalizarValorDataConferenciaParaIso(valor) ?? ''
                if (iso !== anterior) aoSalvar(iso)
                fecharCalendario()
                setEditando(false)
              }}
            />
          </div>,
          document.body,
        )
      : null

  return (
    <div className={`dt-row dt-row--${status}${alterado ? ' sr-conf-campo-alterado' : ''}`}>
      <div className="dt-row-status" aria-hidden="true" />
      <div className="dt-row-head">
        <span className="dt-row-icon">{icone}</span>
        <span className="dt-row-label">{rotulo}</span>
        {alterado && (
          <span className="sr-conf-campo-alterado-badge" title="Campo alterado na conferência">
            <PencilSimple size={11} weight="fill" aria-hidden />
            Alterado
          </span>
        )}
      </div>

      {editando ? (
        <div className="dt-row-edit">
          {tipo === 'booleano' ? (
            <SelectGlobal
              opcoes={OPCOES_BOOLEANO}
              valor={valorLocal || 'Não'}
              aoMudarValor={(v) => {
                const novo = v == null ? 'Não' : String(v)
                setValorLocal(novo)
                if (novo !== (valor ?? '')) aoSalvar(novo)
                setEditando(false)
              }}
              buscavel={false}
              placeholder="Selecione…"
              posicao="baixo"
            />
          ) : tipo === 'data' ? (
            <div className="sr-conf-campo-data-edit">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={textoDataLocal}
                onChange={(e) =>
                  setTextoDataLocal(aplicarMascaraDataConferenciaSmartRead(e.target.value))
                }
                onBlur={() => {
                  window.setTimeout(() => {
                    if (!calendarioAbertoRef.current) salvarData()
                  }, 120)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    salvarData()
                  }
                  if (e.key === 'Escape') cancelarEdicaoData()
                }}
              />
              <button
                ref={btnCalendarioRef}
                type="button"
                className="sr-conf-campo-data-calendario-btn"
                aria-label="Abrir calendário"
                aria-expanded={calendarioAberto}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  alternarCalendario()
                }}
              >
                <CalendarBlank weight="duotone" size={16} aria-hidden />
              </button>
              {painelCalendario}
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={valorLocal}
              onChange={(e) => setValorLocal(e.target.value)}
              onBlur={salvar}
              onKeyDown={(e) => {
                if (e.key === 'Enter') salvar()
                if (e.key === 'Escape') cancelar()
              }}
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
          {vazio ? (
            <span className="dt-row-empty">—</span>
          ) : (
            <span className="dt-row-text">{valorDisplay}</span>
          )}
          <PencilSimple weight="duotone" size={13} className="dt-row-edit-icon" />
        </button>
      )}
    </div>
  )
}
