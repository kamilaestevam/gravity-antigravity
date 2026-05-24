/**
 * ModalTrocarOrganizacao — Pendência #4 (Org switcher admin).
 *
 * Vive no shell para ser consumido por Configurador e produtos (Pedido etc.)
 * sem acoplamento produto → configurador.
 */

import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { ModalOverlay } from '@nucleo/modal-global'
import {
  SelectOrganizacaoAdminGlobal,
  type OrganizacaoOpcao,
} from '@nucleo/select-organizacao-admin-global'
import { useOrganizacaoOverride } from '../hooks/useOrganizacaoOverride'

const CONFIGURADOR_URL = import.meta.env.VITE_CONFIGURADOR_URL ?? ''

const organizacoesListaSchema = z.object({
  itens: z.array(
    z.object({
      id_organizacao:   z.string(),
      nome_organizacao: z.string(),
    }),
  ),
})

export interface ModalTrocarOrganizacaoProps {
  aberto: boolean
  aoFechar: () => void
}

export function ModalTrocarOrganizacao({
  aberto,
  aoFechar,
}: ModalTrocarOrganizacaoProps): JSX.Element {
  const { getToken } = useAuth()
  const navigate = useNavigate()
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

  async function fetchOrganizacoes(busca: string): Promise<OrganizacaoOpcao[]> {
    try {
      const token = await getToken()
      const qs = new URLSearchParams()
      if (busca) qs.set('busca', busca)
      const base = CONFIGURADOR_URL || ''
      const res = await fetch(
        `${base}/api/v1/admin/organizacoes${qs.toString() ? `?${qs}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) {
        console.warn('[ModalTrocarOrganizacao] /admin/organizacoes retornou', res.status)
        return []
      }
      const raw: unknown = await res.json()
      const parsed = organizacoesListaSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[ModalTrocarOrganizacao] resposta inválida', parsed.error.flatten())
        return []
      }
      return parsed.data.itens
    } catch (err) {
      console.warn('[ModalTrocarOrganizacao] erro ao buscar organizações', err)
      return []
    }
  }

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
    navigate('/hub')
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
