/**
 * EmpresasEParceirosAdmin.tsx — Visão CROSS-ORGANIZAÇÃO de empresas/parceiros.
 *
 * Tela admin (read-only) para SUPER_ADMIN/ADMIN Gravity. Lista empresas de
 * TODAS as organizações da plataforma. NÃO substitui a tela do workspace —
 * existe apenas para suporte, auditoria e troubleshooting interno.
 *
 * Camadas de aviso (decisões do plano + Coord/Líder):
 *   1. Banner permanente no topo (CardBasicoGlobal variante="aviso")
 *   2. Modal de aviso quando total > 500 — sempre aparece, sem dispense
 *   3. Audit log persistente em AuditLogAdmin (gravado pelo backend)
 *
 * Skill: skills/produtos-gravity/configurador/admin/SKILL.md
 * Doc:   documentos-tecnicos/admin-cross-org-pattern.md
 *
 * NOTA: criada como self-contained para evitar refator arriscado da página
 * do workspace. Quando o refator de extração de EmpresasEParceirosTabela
 * for executado, ambas as páginas convergem para usar o mesmo componente.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warning, Buildings, Globe } from '@phosphor-icons/react'
import { useAuth } from '@clerk/clerk-react'
import { z } from 'zod'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { ModalOverlay } from '@nucleo/modal-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  SelectOrganizacaoAdminGlobal,
  type OrganizacaoOpcao,
} from '@nucleo/select-organizacao-admin-global'
import { listaEmpresasAdminSchema, type EmpresaAdmin } from '@cadastros/shared/schemas'

// ─── Tipos auxiliares ────────────────────────────────────────────────────────

const TIPOS_PARCEIRO = [
  { key: 'importador',                                label: 'Importador' },
  { key: 'exportador',                                label: 'Exportador' },
  { key: 'fabricante',                                label: 'Fabricante' },
  { key: 'agente',                                    label: 'Agente' },
  { key: 'despachante',                               label: 'Despachante' },
  { key: 'armador',                                   label: 'Armador' },
  { key: 'cia_aerea',                                 label: 'Cia Aérea' },
  { key: 'transportadora_rodoviaria_nacional',        label: 'Transp. Rodoviária Nacional' },
  { key: 'transportadora_rodoviaria_internacional',   label: 'Transp. Rodoviária Internacional' },
  { key: 'armazem_alfandegado',                       label: 'Armazém Alfandegado' },
  { key: 'armazem_nacional',                          label: 'Armazém Nacional' },
  { key: 'banco',                                     label: 'Banco' },
  { key: 'seguradora_internacional',                  label: 'Seguradora Internacional' },
  { key: 'seguradora_corretora_cambio',               label: 'Seguradora/Corretora Câmbio' },
] as const

function derivarTiposEmpresa(e: EmpresaAdmin): string {
  return TIPOS_PARCEIRO
    .filter((t) => (e as unknown as Record<string, boolean>)[`pode_ser_${t.key}_empresa`])
    .map((t) => t.label)
    .join(' + ') || '—'
}

const organizacoesListaSchema = z.object({
  itens: z.array(z.object({
    id_organizacao:   z.string(),
    nome_organizacao: z.string(),
  })),
})

// ─── Componente ──────────────────────────────────────────────────────────────

export function EmpresasEParceirosAdmin(): JSX.Element {
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [totalGeral, setTotalGeral] = useState(0)
  const [alertaVolume, setAlertaVolume] = useState(false)
  const [modalAvisoAberto, setModalAvisoAberto] = useState(false)

  const [filtroOrg, setFiltroOrg] = useState('')
  const [filtroTipoParceiro, setFiltroTipoParceiro] = useState('')

  // ── Fetch ──────────────────────────────────────────────────────────────
  async function carregar(): Promise<void> {
    setCarregando(true)
    setErro(null)
    try {
      const token = await getToken()
      const qs = new URLSearchParams()
      if (filtroOrg)          qs.set('id_organizacao', filtroOrg)
      if (filtroTipoParceiro) qs.set('tipo_parceiro', filtroTipoParceiro)
      qs.set('por_pagina', '200')

      const res = await fetch(`/api/v1/admin/empresas?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const corpo = await res.json().catch(() => ({}))
        throw new Error(corpo?.error?.message ?? `Falha (${res.status})`)
      }
      const raw = await res.json()
      const data = listaEmpresasAdminSchema.parse(raw)
      setEmpresas(data.itens)
      setTotalGeral(data.total)
      setAlertaVolume(data.alerta_volume === true)
      if (data.alerta_volume === true) setModalAvisoAberto(true)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
      setEmpresas([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { void carregar() }, [filtroOrg, filtroTipoParceiro]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Autocomplete de organizações ────────────────────────────────────────
  async function fetchOrganizacoes(busca: string): Promise<OrganizacaoOpcao[]> {
    const token = await getToken()
    const qs = new URLSearchParams()
    if (busca) qs.set('busca', busca)
    const res = await fetch(`/api/v1/admin/organizacoes${qs.toString() ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const raw = await res.json()
    const parsed = organizacoesListaSchema.safeParse(raw)
    if (!parsed.success) return []
    return parsed.data.itens
  }

  // ── Colunas (nome_organizacao sticky-left, clicável → /admin/organizacoes/:id)
  const colunas: TabelaGlobalColuna<EmpresaAdmin>[] = useMemo(() => [
    {
      key:    'nome_organizacao',
      label:  'Organização',
      sticky: 'left',
      render: (linha) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/organizacoes/${linha.id_organizacao}`)}
          style={{
            background: 'transparent', border: 'none', padding: 0,
            color: 'var(--ws-accent, #818cf8)', cursor: 'pointer',
            textDecoration: 'underline', fontSize: 'inherit',
          }}
          title={`Abrir ${linha.id_organizacao}`}
        >
          {linha.nome_organizacao}
        </button>
      ),
    },
    { key: 'nome_empresa', label: 'Nome do parceiro' },
    {
      key:   'documento',
      label: 'CNPJ / TIN',
      render: (l) =>
        l.pais_empresa === 'BR'
          ? (l.cnpj_empresa ?? '—')
          : (l.tin_empresa ?? '—'),
    },
    {
      key:   'pais_empresa',
      label: 'País',
      render: (l) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Globe size={12} weight="bold" />
          {l.pais_empresa}
        </span>
      ),
    },
    {
      key:   'tipos_parceiro',
      label: 'Tipo de Parceiro',
      render: (l) => derivarTiposEmpresa(l),
    },
    {
      key:   'ativo_empresa',
      label: 'Status',
      render: (l) => (
        <span style={{ color: l.ativo_empresa ? '#34d399' : '#94a3b8' }}>
          {l.ativo_empresa ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
  ], [navigate])

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<Buildings weight="duotone" size={20} />}
          titulo="Empresas e Parceiros"
          subtitulo="Visão cross-organização (SUPER_ADMIN / ADMIN Gravity)"
        />
      }
    >
      {/* ── Camada 1: Banner permanente de aviso ──────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <CardBasicoGlobal
          titulo="Modo Administrador Gravity — Visão Cross-Organização"
          icone={<Warning weight="duotone" size={18} />}
          variante="aviso"
          valor=""
          tooltip={
            <span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>
              Você está vendo empresas/parceiros de TODAS as organizações da
              plataforma. Toda consulta é registrada no log de auditoria com
              seu id_usuario, timestamp e filtros aplicados. Esta tela NÃO
              substitui a tela do workspace — existe apenas para suporte,
              auditoria e troubleshooting interno da Gravity. Edição
              desabilitada — read-only por design.
            </span>
          }
        />
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <SelectOrganizacaoAdminGlobal
            value={filtroOrg}
            onChange={(id) => setFiltroOrg(id)}
            fetchOrganizacoes={fetchOrganizacoes}
            label="Organização"
            placeholder="Todas as organizações"
          />
        </div>

        <div style={{ flex: 1, maxWidth: 320 }}>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--ws-text-muted, #94a3b8)',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Tipo de Parceiro
          </label>
          <select
            value={filtroTipoParceiro}
            onChange={(e) => setFiltroTipoParceiro(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--ws-input-bg, #1e293b)',
              border: '1px solid var(--ws-border, #334155)',
              borderRadius: 6,
              color: 'var(--ws-text, #e2e8f0)',
              fontSize: '0.875rem',
            }}
          >
            <option value="">Todos os tipos</option>
            {TIPOS_PARCEIRO.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', color: 'var(--ws-text-muted)', fontSize: '0.75rem' }}>
          Total: <strong style={{ color: 'var(--ws-text)' }}>{totalGeral}</strong>
          {alertaVolume && (
            <span style={{ marginLeft: 8, color: '#f59e0b' }}>⚠ volume alto</span>
          )}
        </div>
      </div>

      {/* ── Estados ──────────────────────────────────────────────────────── */}
      {carregando && (
        <div style={{ padding: 24, color: 'var(--ws-text-muted)' }}>
          Carregando empresas, aguarde alguns segundos.
        </div>
      )}

      {erro && !carregando && (
        <div style={{
          padding: 16,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 6,
          color: '#fca5a5',
        }}>
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {/* ── Tabela ───────────────────────────────────────────────────────── */}
      {!carregando && !erro && (
        <TabelaGlobal<EmpresaAdmin>
          dados={empresas}
          colunas={colunas}
          idKey="suid_empresa"
          mensagemVazio="Nenhuma empresa encontrada com os filtros atuais."
          tooltipBusca="Busca por nome do parceiro"
        />
      )}

      {/* ── Camada 2: Modal volume > 500 (sempre, sem dispense) ─────────── */}
      <ModalOverlay
        aberto={modalAvisoAberto}
        aoFechar={() => setModalAvisoAberto(false)}
        titulo="Resultado grande"
        iconeTitulo="Warning"
        tamanho="md"
        botoes={[
          {
            rotulo: 'Filtrar agora',
            variante: 'secondary',
            ao_clicar: () => {
              setFiltroOrg('')
              setFiltroTipoParceiro('')
              setModalAvisoAberto(false)
            },
          },
          {
            rotulo: 'Continuar mesmo assim',
            variante: 'primary',
            ao_clicar: () => setModalAvisoAberto(false),
          },
        ]}
      >
        <div style={{ padding: 16 }}>
          <p style={{ marginBottom: 12 }}>
            <strong>{totalGeral} empresas</strong> retornadas em sua consulta cross-organização.
          </p>
          <p style={{ marginBottom: 12, color: 'var(--ws-text-muted)' }}>
            Você está prestes a carregar uma quantidade alta de registros.
            Recomendamos filtrar por <strong>organização</strong> ou{' '}
            <strong>tipo de parceiro</strong> antes de continuar.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--ws-text-muted)' }}>
            Esta consulta foi registrada no log de auditoria.
          </p>
        </div>
      </ModalOverlay>
    </PaginaGlobal>
  )
}
