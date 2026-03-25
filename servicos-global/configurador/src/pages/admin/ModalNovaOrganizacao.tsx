import React, { useState } from 'react'
import { ModalSemSessoesGlobal } from '@nucleo/modal-sem-sessoes-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { Buildings, Link, Ticket } from '@phosphor-icons/react'

export interface DadosNovaOrg {
  nome: string
  subdominio: string
  plano: string
}

interface ModalNovaOrganizacaoProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: (dados: DadosNovaOrg) => void
}

const PLANOS = ['Startup', 'Pro', 'Enterprise', 'Trial']

export function ModalNovaOrganizacao({ aberto, aoFechar, aoSalvar }: ModalNovaOrganizacaoProps) {
  const [nome, setNome] = useState('')
  const [subdominio, setSubdominio] = useState('')
  const [plano, setPlano] = useState(PLANOS[0])

  // Simple dirty tracking
  const dirty = !!(nome || subdominio)
  // Simple validation
  const podesSalvar = dirty && !!(nome.trim() && subdominio.trim())

  function handleSalvar() {
    aoSalvar({ nome, subdominio, plano })
    // Reseta form ao salvar caso seja chamado novamente
    setNome('')
    setSubdominio('')
    setPlano(PLANOS[0])
  }

  function handleFechar() {
    aoFechar()
    setNome('')
    setSubdominio('')
    setPlano(PLANOS[0])
  }

  return (
    <ModalSemSessoesGlobal
      aberto={aberto}
      aoFechar={handleFechar}
      tamanho="md"
      altura="520px"
      titulo="Nova Organização (Tenant)"
      subtitulo="Provisione uma nova instância isolada no cluster."
      botoes={[
        { rotulo: 'Cancelar', variante: 'ghost', ao_clicar: handleFechar },
        { rotulo: 'Criar Instância', variante: 'primary', ao_clicar: handleSalvar, desabilitado: !podesSalvar }
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
        <GeralCampoGlobal label="Nome da Organização" obrigatorio>
          <div className="ws-input-icon-wrap">
            <Buildings size={16} />
            <input
              value={nome}
              placeholder="Ex: Acme Corp"
              onChange={e => {
                setNome(e.target.value)
                const sugerido = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                if (!subdominio || subdominio === sugerido.slice(0, -1)) {
                  setSubdominio(sugerido)
                }
              }}
              style={{ width: '100%' }}
            />
          </div>
        </GeralCampoGlobal>

        <GeralCampoGlobal label="Subdomínio / Endpoint DNS" obrigatorio>
          <div className="ws-input-icon-wrap">
            <Link size={16} />
            <input
              value={subdominio}
              placeholder="acme-corp"
              onChange={e => setSubdominio(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))}
              style={{ width: '100%' }}
            />
          </div>
        </GeralCampoGlobal>

        <GeralCampoGlobal label="Plano Inicial">
          <div className="ws-input-icon-wrap" style={{ padding: 0 }}>
            <select
              value={plano}
              onChange={e => setPlano(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--ws-text)', padding: '0 1rem 0 2.5rem', appearance: 'none', height: '100%' }}
            >
              {PLANOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <Ticket size={16} style={{ position: 'absolute', left: '0.875rem', color: 'var(--ws-muted)' }} />
          </div>
        </GeralCampoGlobal>
      </div>
    </ModalSemSessoesGlobal>
  )
}
