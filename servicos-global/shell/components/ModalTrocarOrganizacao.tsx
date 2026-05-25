/**
 * ModalTrocarOrganizacao — Pendência #4 (Org switcher admin).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { ModalOverlay } from '@nucleo/modal-global'
import {
  SelectOrganizacaoAdminGlobal,
  type OrganizacaoOpcao,
} from '@nucleo/select-organizacao-admin-global'
import { useOrganizacaoOverride } from '../hooks/useOrganizacaoOverride'
import { buscarOrganizacoesAdmin } from '../utils/buscar-organizacoes-admin'

export interface ModalTrocarOrganizacaoProps {
  aberto: boolean
  aoFechar: () => void
}

export function ModalTrocarOrganizacao({
  aberto,
  aoFechar,
}: ModalTrocarOrganizacaoProps): JSX.Element {
  const { getToken } = useAuth()
  const { definirOverride, podeAtivarOverride } = useOrganizacaoOverride()

  const [idOrganizacaoSelecionada, setIdOrganizacaoSelecionada] = useState('')
  const [nomeOrganizacaoSelecionada, setNomeOrganizacaoSelecionada] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    if (!aberto) {
      setIdOrganizacaoSelecionada('')
      setNomeOrganizacaoSelecionada('')
      setConfirmando(false)
    }
  }, [aberto])

  const fetchOrganizacoes = useCallback(
    async (busca: string): Promise<OrganizacaoOpcao[]> =>
      buscarOrganizacoesAdmin(getToken, { busca, somenteAtivas: true }),
    [getToken],
  )

  function aoSelecionarOrganizacao(id: string, nome?: string): void {
    setIdOrganizacaoSelecionada(id)
    setNomeOrganizacaoSelecionada(nome ?? '')
  }

  function aoConfirmar(): void {
    if (!idOrganizacaoSelecionada || !nomeOrganizacaoSelecionada) return
    if (!podeAtivarOverride) return
    setConfirmando(true)
    definirOverride({
      idOrganizacao:   idOrganizacaoSelecionada,
      nomeOrganizacao: nomeOrganizacaoSelecionada,
    })
    aoFechar()
    // Reload completo garante hub/init com override já hidratado do localStorage.
    window.location.assign('/hub?select=1')
  }

  const podeConfirmar = !!idOrganizacaoSelecionada && !!nomeOrganizacaoSelecionada && !confirmando

  return (
    <ModalOverlay
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Trocar Organização"
      iconeTitulo="Key"
      tamanho="md"
      botoes={[
        {
          rotulo:    'Cancelar',
          variante:  'secondary',
          ao_clicar: aoFechar,
        },
        {
          rotulo:       'Visualizar como esta organização',
          variante:     'primary',
          desabilitado: !podeConfirmar,
          carregando:   confirmando,
          ao_clicar:    aoConfirmar,
        },
      ]}
    >
      <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--ws-muted)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
          Escolha uma organização para visualizar como se você fosse Master dela.
          Toda a UI (Configurador, Pedido, Cadastros etc.) passará a refletir os dados
          dessa organização. Uma faixa dourada no topo indica que você está em modo
          de visualização — clique em <strong>Voltar para Gravity</strong> a qualquer momento.
        </p>

        <SelectOrganizacaoAdminGlobal
          value={idOrganizacaoSelecionada}
          onChange={aoSelecionarOrganizacao}
          fetchOrganizacoes={fetchOrganizacoes}
          label="Organização alvo"
          placeholder="Buscar organização por nome..."
          permitirVazio={false}
        />

        <p style={{ color: 'var(--ws-muted)', fontSize: '0.75rem', margin: 0 }}>
          Cada troca é registrada em log de auditoria com seu ID de usuário,
          a organização de origem e a organização de destino.
        </p>
      </div>
    </ModalOverlay>
  )
}
