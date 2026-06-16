import React, { useState } from 'react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'

export type TipoInputListaValoresContato = 'text' | 'email' | 'tel'

export interface ListaValoresContatoGlobalProps {
  label: string
  valores: string[]
  onChange: (valores: string[]) => void
  placeholder?: string
  tipoInput?: TipoInputListaValoresContato
  limite?: number
  icone?: React.ReactNode
  erro?: string
  htmlFor?: string
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.25rem 0.5rem',
  borderRadius: '999px',
  background: 'rgba(129,140,248,0.15)',
  border: '1px solid rgba(129,140,248,0.3)',
  color: '#c7d2fe',
  fontSize: '0.75rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  background: 'var(--ws-bg-card, rgba(30,41,59,0.5))',
  border: '1px solid var(--border-color)',
  color: 'var(--ws-text)',
}

export function ListaValoresContatoGlobal({
  label,
  valores,
  onChange,
  placeholder = '',
  tipoInput = 'text',
  limite = 20,
  icone,
  erro,
  htmlFor = 'lista-valores-contato',
}: ListaValoresContatoGlobalProps) {
  const [novoValor, setNovoValor] = useState('')
  const [erroLocal, setErroLocal] = useState<string | null>(null)

  const adicionar = () => {
    const v = novoValor.trim()
    if (!v) return
    if (valores.includes(v)) {
      setNovoValor('')
      return
    }
    if (valores.length >= limite) {
      setErroLocal(`Máximo de ${limite} valores`)
      return
    }
    setErroLocal(null)
    onChange([...valores, v])
    setNovoValor('')
  }

  const remover = (valor: string) => {
    onChange(valores.filter((x) => x !== valor))
  }

  const mensagemErro = erro ?? erroLocal ?? undefined

  return (
    <CampoGeralGlobal label={`${label} (${valores.length}/${limite})`} htmlFor={htmlFor} erro={mensagemErro}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: valores.length > 0 ? '0.5rem' : 0 }}>
        {valores.map((v) => (
          <span key={v} style={chipStyle}>
            {v}
            <button
              type="button"
              onClick={() => remover(v)}
              aria-label={`Remover ${v}`}
              style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, marginLeft: '0.25rem' }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
        {icone ? (
          <div className="ws-input-icon-wrap" style={{ flex: 1 }}>
            {icone}
            <input
              id={htmlFor}
              type={tipoInput}
              placeholder={placeholder}
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  adicionar()
                }
              }}
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
        ) : (
          <input
            id={htmlFor}
            type={tipoInput}
            placeholder={placeholder}
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                adicionar()
              }
            }}
            style={{ ...inputStyle, flex: 1 }}
          />
        )}
        <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={adicionar}>
          + Adicionar
        </BotaoGlobal>
      </div>
    </CampoGeralGlobal>
  )
}
