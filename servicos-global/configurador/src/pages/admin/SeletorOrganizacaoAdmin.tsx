import React, { useState, useEffect, useCallback } from 'react'
import { Buildings } from '@phosphor-icons/react'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { adminOrganizacoesApi, type OrganizacaoApi } from '../../services/api-client'

/**
 * SeletorOrganizacaoAdmin — drill-down de organizacao para abas admin do
 * API Cockpit (Tokens, Webhooks, Consumo).
 *
 * Por que drill-down?
 *   Os endpoints admin underlying (api-cockpit.ts:374, tokens.ts:36) exigem
 *   id_organizacao explicito. Esta UX reusa 100% do backend existente,
 *   evita criar superficie de ataque cross-organizacao e mantem auditoria
 *   focada em uma org de cada vez.
 *
 * Uso:
 *   const [idOrg, setIdOrg] = useState<string>('')
 *   <SeletorOrganizacaoAdmin valor={idOrg} aoMudar={setIdOrg} />
 *   {!idOrg ? <MensagemEscolhaOrg /> : <TabelaDeDados id_organizacao={idOrg} />}
 */

const SELECT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--ws-accent-border, rgba(255,255,255,0.1))',
  background: 'rgba(0,0,0,0.2)',
  color: 'var(--text-primary, #fff)',
  fontSize: '0.875rem',
}

interface Props {
  valor: string
  aoMudar: (id_organizacao: string) => void
  rotuloVazio?: string
}

export function SeletorOrganizacaoAdmin({ valor, aoMudar, rotuloVazio }: Props) {
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      setErro(null)
      const res = await adminOrganizacoesApi.list({ limit: 200 })
      setOrganizacoes(res.organizacoes)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao listar organizacoes')
      setOrganizacoes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      borderRadius: '12px',
      background: 'var(--ws-bg-card, rgba(30,41,59,0.5))',
      border: '1px solid var(--border-color)',
    }}>
      <Buildings size={20} weight="duotone" style={{ color: 'var(--brand-primary, #818cf8)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
      <CampoGeralGlobal
        label="Organização"
        htmlFor="seletor-organizacao-admin"
        tooltipTitulo="Drill-down por organização"
        tooltipDescricao="Escolha qual organização inspecionar — a aba mostra apenas dados desta org"
      >
        <select
          id="seletor-organizacao-admin"
          style={SELECT_STYLE}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          disabled={loading || !!erro}
        >
          <option value="">
            {loading
              ? 'Carregando organizações...'
              : erro
                ? `Erro: ${erro}`
                : (rotuloVazio ?? '— Selecione uma organização —')}
          </option>
          {organizacoes.map((org) => (
            <option key={org.id_organizacao} value={org.id_organizacao}>
              {org.nome_organizacao} ({org.subdominio_organizacao})
            </option>
          ))}
        </select>
      </CampoGeralGlobal>
      </div>
    </div>
  )
}

export default SeletorOrganizacaoAdmin
