import { useEffect, useRef, useState } from 'react'
import { FileText, PencilSimple } from '@phosphor-icons/react'
import type { StatusCampoConferenciaSimulador } from './dados-conferencia-simulador-smart-doc'

type Props = {
  chave: string
  rotulo: string
  valor: string | null
  status: StatusCampoConferenciaSimulador
}

export function CampoLinhaConferenciaSimuladorSmartDoc({ chave, rotulo, valor, status }: Props) {
  const [editando, setEditando] = useState(false)
  const [valorLocal, setValorLocal] = useState(valor ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValorLocal(valor ?? '')
  }, [valor])

  useEffect(() => {
    if (editando) inputRef.current?.focus()
  }, [editando])

  const vazio = !valorLocal.trim()
  const statusClasse =
    status === 'preenchido' && !vazio
      ? 'preenchido'
      : status === 'vazio-obrig'
        ? 'vazio-obrig'
        : 'vazio-opc'

  function salvar() {
    setEditando(false)
  }

  function cancelar() {
    setValorLocal(valor ?? '')
    setEditando(false)
  }

  return (
    <div id={`sds-nl-campo-${chave}`} className={`dt-row dt-row--${statusClasse}`}>
      <div className="dt-row-status" aria-hidden />
      <div className="dt-row-head">
        <span className="dt-row-icon">
          <FileText weight="duotone" size={14} />
        </span>
        <span className="dt-row-label">{rotulo}</span>
      </div>
      {editando ? (
        <div className="dt-row-edit">
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
        </div>
      ) : (
        <button type="button" className="dt-row-value" onClick={() => setEditando(true)} title="Clique para editar">
          {vazio ? (
            <span className="dt-row-empty">—</span>
          ) : (
            <span className="dt-row-text">{valorLocal}</span>
          )}
          <PencilSimple weight="duotone" size={13} className="dt-row-edit-icon" />
        </button>
      )}
    </div>
  )
}
