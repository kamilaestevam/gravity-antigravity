/**
 * CampoLinhaConferenciaNovaLeituraSmartRead — edit-in-place (paridade DadosTecnicos / CampoLinha)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { resolverIconeCampoConferenciaSmartRead } from '../../shared/resolver-icone-campo-conferencia-smart-read'

type Props = {
  chave: string
  rotulo: string
  valor: string | null
  alterado?: boolean
  tipo?: 'texto' | 'booleano'
  aoSalvar: (novo: string) => void
}

const OPCOES_BOOLEANO = [
  { valor: 'Sim', rotulo: 'Sim' },
  { valor: 'Não', rotulo: 'Não' },
]

function textoExibicao(valor: string | null, tipo: 'texto' | 'booleano'): string {
  if (!valor) return ''
  if (tipo === 'booleano') {
    return valor === 'Sim' ? 'Assinado' : 'Não assinado'
  }
  return valor
}

export function CampoLinhaConferenciaNovaLeituraSmartRead({
  chave,
  rotulo,
  valor,
  alterado = false,
  tipo = 'texto',
  aoSalvar,
}: Props) {
  const [editando, setEditando] = useState(false)
  const [valorLocal, setValorLocal] = useState(valor ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const icone = useMemo(() => resolverIconeCampoConferenciaSmartRead(chave), [chave])

  useEffect(() => {
    setValorLocal(valor ?? '')
  }, [valor])

  useEffect(() => {
    if (editando && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editando])

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
    setEditando(false)
  }

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
