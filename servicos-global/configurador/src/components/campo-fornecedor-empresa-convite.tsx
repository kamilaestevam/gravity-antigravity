/**
 * Select de fornecedor (empresa) no convite FORNECEDOR — padrão "+ Nova" do Pedido.
 */
import React from 'react'
import { Buildings } from '@phosphor-icons/react'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'

interface CampoFornecedorEmpresaConviteProps {
  label?: string
  opcoes: SelectOpcao[]
  valor: string
  aoMudarValor: (v: string) => void
  placeholder: string
  carregando?: boolean
  /** Org alvo ausente (admin) ou lista ainda carregando */
  desabilitado?: boolean
  onCadastrarNova?: () => void
  labelNova?: string
  invalido?: boolean
}

export function CampoFornecedorEmpresaConvite({
  label = 'FORNECEDOR (EMPRESA)',
  opcoes,
  valor,
  aoMudarValor,
  placeholder,
  carregando = false,
  desabilitado = false,
  onCadastrarNova,
  labelNova = '+ Nova',
  invalido = false,
}: CampoFornecedorEmpresaConviteProps) {
  const selectDesabilitado = desabilitado || carregando

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #94a3b8)',
          }}
        >
          {label}
          <span style={{ color: '#f87171', marginLeft: '0.125rem' }}>*</span>
        </span>
        {onCadastrarNova && (
          <button
            type="button"
            disabled={desabilitado}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (desabilitado) return
              onCadastrarNova()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: desabilitado ? 'var(--text-muted)' : 'var(--ws-accent, #818cf8)',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: 0,
              cursor: desabilitado ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!desabilitado) (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'
            }}
          >
            {labelNova}
          </button>
        )}
      </div>
      <div className={invalido && !selectDesabilitado ? 'cg-wrapper cg-wrapper--erro' : undefined}>
        <SelectGlobal
          opcoes={opcoes}
          valor={valor}
          aoMudarValor={aoMudarValor}
          iconeEsquerda={<Buildings size={18} weight="duotone" />}
          buscavel
          carregando={carregando}
          desabilitado={selectDesabilitado}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
