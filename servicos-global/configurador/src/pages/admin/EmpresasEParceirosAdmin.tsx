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
import { Warning, Buildings, Globe, UsersThree, GlobeHemisphereWest, ChartPieSlice } from '@phosphor-icons/react'
import { useAuth } from '@clerk/clerk-react'
import { z } from 'zod'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global'
import { ModalOverlay } from '@nucleo/modal-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  type OrganizacaoOpcao,
} from '@nucleo/select-organizacao-admin-global'
import { listaEmpresasAdminSchema, type EmpresaAdmin } from '@cadastros/shared/schemas'
import { buscarOrganizacoesAdmin } from '@gravity/shell'

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

      const res = await fetch(`/api/v1/admin/fornecedores?${qs.toString()}`, {
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
    return buscarOrganizacoesAdmin(getToken, { busca, somenteAtivas: false })
  }

  // ── Colunas (nome_organizacao sticky-left, clicável → /admin/organizacoes/:id)
  // TabelaGlobalColuna<T>['render'] signature: (valorCelula, linhaInteira)
  // — primeiro argumento é o valor da célula (item[col.key]), segundo é a
  // row completa. Anteriormente todas as renders pegavam só o primeiro
  // como se fosse a row — quebrava em qualquer coluna onde a key não
  // existia diretamente em EmpresaAdmin (ex: 'documento', 'tipos_parceiro').
  const colunas: TabelaGlobalColuna<EmpresaAdmin>[] = useMemo(() => [
    {
      key:    'nome_organizacao',
      label:  'Organização',
      sticky: 'left',
      render: (_, linha) => (
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
    { key: 'nome_fornecedor', label: 'Nome do parceiro' },
    {
      key:   'documento',
      label: 'CNPJ / TIN',
      render: (_, l) =>
        l.pais_fornecedor === 'BR'
          ? (l.cnpj_fornecedor ?? '—')
          : (l.tin_fornecedor ?? '—'),
    },
    {
      key:   'pais_fornecedor',
      label: 'País',
      render: (_, l) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Globe size={12} weight="bold" />
          {l.pais_fornecedor}
        </span>
      ),
    },
    {
      key:   'tipos_parceiro',
      label: 'Tipo de Parceiro',
      render: (_, l) => derivarTiposEmpresa(l),
    },
    {
      key:   'ativo_fornecedor',
      label: 'Status',
      render: (_, l) => (
        <span style={{ color: l.ativo_fornecedor ? '#34d399' : '#94a3b8' }}>
          {l.ativo_fornecedor ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
  ], [navigate])

  return (
    <PaginaGlobal
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total de Empresas"
            icone={<Buildings weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
            valor={totalGeral}
            tooltip={
              <>
                <div className="cg-tooltip__row"><span>Empresas cadastradas</span> <strong>{totalGeral}</strong></div>
                <div className="cg-tooltip__row"><span>Ativas</span> <strong style={{ color: '#34d399' }}>{empresas.filter(e => e.ativo_fornecedor).length}</strong></div>
                <div className="cg-tooltip__row"><span>Inativas</span> <strong style={{ color: '#94a3b8' }}>{empresas.filter(e => !e.ativo_fornecedor).length}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Países"
            icone={<GlobeHemisphereWest weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={new Set(empresas.map(e => e.pais_fornecedor)).size}
            tooltip={
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Quantidade de países distintos entre todas as empresas cadastradas.</span>
            }
          />
          <CardBasicoGlobal
            titulo="Organizações"
            icone={<UsersThree weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
            valor={new Set(empresas.map(e => e.id_organizacao)).size}
            tooltip={
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Organizações que possuem ao menos uma empresa/parceiro cadastrado.</span>
            }
          />
          <CardGraficoGlobal
            titulo="Status"
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            total={empresas.length}
            valorPrincipal={empresas.filter(e => e.ativo_fornecedor).length}
            corGauge="#34d399"
            legenda={[
              { label: 'Ativas', valor: empresas.filter(e => e.ativo_fornecedor).length, cor: 'green' },
              { label: 'Inativas', valor: empresas.filter(e => !e.ativo_fornecedor).length, cor: 'red' },
            ]}
            tooltip={
              <>
                <div className="cg-tooltip__row"><span>Ativas</span> <strong style={{ color: '#34d399' }}>{empresas.filter(e => e.ativo_fornecedor).length}</strong></div>
                <div className="cg-tooltip__row"><span>Inativas</span> <strong style={{ color: '#f87171' }}>{empresas.filter(e => !e.ativo_fornecedor).length}</strong></div>
              </>
            }
          />
        </>
      }
    >


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
          idKey="id_fornecedor"
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
