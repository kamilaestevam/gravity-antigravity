/**
 * FornecedoresAdmin.tsx — Visão CROSS-ORGANIZAÇÃO de fornecedores COMEX.
 *
 * Tela admin (read-only) para SUPER_ADMIN/ADMIN Gravity. Lista fornecedores de
 * TODAS as organizações da plataforma. NÃO substitui a tela do workspace —
 * existe apenas para suporte, auditoria e troubleshooting interno.
 *
 * NOTA: criada como self-contained para evitar refator arriscado da página
 * do workspace. Quando o refator de extração de FornecedoresTabela
 * for executado, ambas as páginas convergem para usar o mesmo componente.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warning, Buildings, Globe, UsersThree, GlobeHemisphereWest, ChartPieSlice, TreeStructure, UserCircle } from '@phosphor-icons/react'
import { useAuth } from '@clerk/clerk-react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global'
import { ModalOverlay } from '@nucleo/modal-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import {
  type OrganizacaoOpcao,
} from '@nucleo/select-organizacao-admin-global'
import {
  listaFornecedoresAdminSchema,
  listaUsuariosVinculadosFornecedorAdminSchema,
  type FornecedorAdmin,
  type UsuarioVinculadoFornecedorAdmin,
} from '@cadastros/shared/schemas'
import { buscarOrganizacoesAdmin, useShellStore } from '@gravity/shell'
import { ROTULOS_TIPO_FORNECEDOR_ORGANIZACAO } from '../../../shared/tipo-fornecedor-organizacao.js'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'

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

function derivarPapeisComex(e: FornecedorAdmin): string {
  return TIPOS_PARCEIRO
    .filter((t) => (e as unknown as Record<string, boolean>)[`pode_ser_${t.key}_fornecedor`])
    .map((t) => t.label)
    .join(' + ') || '—'
}

function rotuloStatusVinculo(status: UsuarioVinculadoFornecedorAdmin['status_fornecedor_organizacao']): string {
  switch (status) {
    case 'ATIVO': return 'Ativo'
    case 'INATIVO': return 'Inativo'
    case 'PENDENTE_APROVACAO': return 'Pendente'
    default: return status
  }
}

function chaveCacheUsuarios(idFornecedor: string): string {
  return idFornecedor
}

export function FornecedoresAdmin(): JSX.Element {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const addNotification = useShellStore((state) => state.addNotification)

  const [fornecedores, setFornecedores] = useState<FornecedorAdmin[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [totalGeral, setTotalGeral] = useState(0)
  const [alertaVolume, setAlertaVolume] = useState(false)
  const [modalAvisoAberto, setModalAvisoAberto] = useState(false)

  const [filtroOrg, setFiltroOrg] = useState('')
  const [filtroTipoParceiro, setFiltroTipoParceiro] = useState('')

  const [usuariosPorFornecedor, setUsuariosPorFornecedor] = useState<
    Record<string, UsuarioVinculadoFornecedorAdmin[]>
  >({})
  const [carregandoUsuarios, setCarregandoUsuarios] = useState<Set<string>>(new Set())
  const [erroUsuarios, setErroUsuarios] = useState<Record<string, string>>({})

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
      const data = listaFornecedoresAdminSchema.parse(raw)
      setFornecedores(data.itens)
      setTotalGeral(data.total)
      setAlertaVolume(data.alerta_volume === true)
      if (data.alerta_volume === true) setModalAvisoAberto(true)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
      setFornecedores([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { void carregar() }, [filtroOrg, filtroTipoParceiro]) // eslint-disable-line react-hooks/exhaustive-deps

  const carregarUsuariosVinculados = useCallback(async (idFornecedor: string, forcar = false): Promise<void> => {
    const chave = chaveCacheUsuarios(idFornecedor)
    if (!forcar && (usuariosPorFornecedor[chave] !== undefined || carregandoUsuarios.has(chave))) return

    setCarregandoUsuarios((prev) => new Set(prev).add(chave))
    setErroUsuarios((prev) => {
      const next = { ...prev }
      delete next[chave]
      return next
    })

    try {
      const token = await getToken()
      const res = await fetch(
        `/api/v1/admin/fornecedores/${encodeURIComponent(idFornecedor)}/usuarios-vinculados`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) {
        const corpo = await res.json().catch(() => ({}))
        throw new Error(corpo?.error?.message ?? `Falha (${res.status})`)
      }
      const raw = await res.json()
      const data = listaUsuariosVinculadosFornecedorAdminSchema.parse(raw)
      setUsuariosPorFornecedor((prev) => ({ ...prev, [chave]: data.itens }))
    } catch (e) {
      setErroUsuarios((prev) => ({
        ...prev,
        [chave]: e instanceof Error ? e.message : 'Erro ao carregar usuários vinculados',
      }))
    } finally {
      setCarregandoUsuarios((prev) => {
        const next = new Set(prev)
        next.delete(chave)
        return next
      })
    }
  }, [carregandoUsuarios, getToken, usuariosPorFornecedor])

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
  const colunas: TabelaGlobalColuna<FornecedorAdmin>[] = useMemo(() => [
    {
      key:    'nome_organizacao',
      label:  'Organização',
      tipo:   'texto',
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
    {
      // Decisão dono 2026-06-12 — IDs técnicos visíveis na UI (diagnóstico sem SQL),
      // mesmo padrão das colunas ID do Admin > Organizações (PR #303).
      key:   'id_fornecedor',
      label: 'ID Fornecedor',
      tipo:  'texto',
      render: (_, linha) => (
        <span
          style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--ws-muted)', cursor: 'pointer', userSelect: 'all' }}
          title="Clique para copiar"
          onClick={ev => {
            ev.stopPropagation()
            void navigator.clipboard.writeText(linha.id_fornecedor)
            addNotification({ type: 'success', message: 'ID do fornecedor copiado.' })
          }}
        >
          {linha.id_fornecedor}
        </span>
      ),
    },
    { key: 'nome_fornecedor', label: 'Fornecedor', tipo: 'texto' },
    {
      key:   'cnpj_fornecedor',
      label: 'CNPJ / TIN',
      tipo:  'texto',
      render: (_, l) =>
        l.pais_fornecedor === 'BR'
          ? (l.cnpj_fornecedor ?? '—')
          : (l.tin_fornecedor ?? '—'),
      getValorBruto: (l) =>
        l.pais_fornecedor === 'BR'
          ? (l.cnpj_fornecedor ?? '—')
          : (l.tin_fornecedor ?? '—'),
    },
    {
      key:   'pais_fornecedor',
      label: 'País',
      tipo:  'texto',
      render: (_, l) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Globe size={12} weight="bold" />
          {l.pais_fornecedor}
        </span>
      ),
    },
    {
      // Key realocada de 'id_fornecedor' → 'pode_ser_agente_fornecedor' (2026-06-12):
      // 'id_fornecedor' agora identifica a coluna ID Fornecedor acima. Esta coluna
      // é derivada (render + getValorBruto), a key serve só como identificador.
      key:   'pode_ser_agente_fornecedor',
      label: 'Papel COMEX',
      tipo:  'texto',
      render: (_, l) => derivarPapeisComex(l),
      getValorBruto: (l) => derivarPapeisComex(l),
    },
    {
      key:   'ativo_fornecedor',
      label: 'Status',
      tipo:  'texto',
      render: (_, l) => (
        <span style={{ color: l.ativo_fornecedor ? '#34d399' : '#94a3b8' }}>
          {l.ativo_fornecedor ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
  ], [navigate, addNotification])

  const colunasUsuariosVinculados: TabelaGlobalColuna<UsuarioVinculadoFornecedorAdmin>[] = useMemo(() => [
    {
      key: 'nome_organizacao',
      label: 'Organização',
      tipo: 'texto',
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
    {
      key: 'nome_usuario',
      label: 'Usuário',
      tipo: 'texto',
      render: (_, linha) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCircle size={16} weight="duotone" style={{ color: '#818cf8', flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>{linha.nome_usuario ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'email_usuario',
      label: 'E-mail',
      tipo: 'texto',
      render: (_, linha) => linha.email_usuario ?? '—',
    },
    {
      key: 'tipo_usuario',
      label: 'Tipo',
      tipo: 'texto',
      render: (_, linha) => linha.tipo_usuario ?? '—',
    },
    {
      key: 'tipo_fornecedor_organizacao',
      label: 'Papel COMEX',
      tipo: 'texto',
      render: (_, linha) =>
        ROTULOS_TIPO_FORNECEDOR_ORGANIZACAO[linha.tipo_fornecedor_organizacao] ?? linha.tipo_fornecedor_organizacao,
    },
    {
      key: 'status_fornecedor_organizacao',
      label: 'Status vínculo',
      tipo: 'texto',
      render: (_, linha) => (
        <StatusBadgeGlobal valor={rotuloStatusVinculo(linha.status_fornecedor_organizacao)} />
      ),
    },
  ], [navigate])

  return (
    <PaginaGlobal
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total de Fornecedores"
            icone={<Buildings weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
            valor={totalGeral}
            tooltip={
              <>
                <div className="cg-tooltip__row"><span>Fornecedores cadastrados</span> <strong>{totalGeral}</strong></div>
                <div className="cg-tooltip__row"><span>Ativos</span> <strong style={{ color: '#34d399' }}>{fornecedores.filter(e => e.ativo_fornecedor).length}</strong></div>
                <div className="cg-tooltip__row"><span>Inativos</span> <strong style={{ color: '#94a3b8' }}>{fornecedores.filter(e => !e.ativo_fornecedor).length}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Países"
            icone={<GlobeHemisphereWest weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={new Set(fornecedores.map(e => e.pais_fornecedor)).size}
            tooltip={
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Quantidade de países distintos entre todos os fornecedores cadastrados.</span>
            }
          />
          <CardBasicoGlobal
            titulo="Organizações"
            icone={<UsersThree weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
            valor={new Set(fornecedores.map(e => e.id_organizacao)).size}
            tooltip={
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Organizações que possuem ao menos um fornecedor cadastrado.</span>
            }
          />
          <CardGraficoGlobal
            titulo="Status"
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            total={fornecedores.length}
            valorPrincipal={fornecedores.filter(e => e.ativo_fornecedor).length}
            corGauge="#34d399"
            legenda={[
              { label: 'Ativos', valor: fornecedores.filter(e => e.ativo_fornecedor).length, cor: 'green' },
              { label: 'Inativos', valor: fornecedores.filter(e => !e.ativo_fornecedor).length, cor: 'red' },
            ]}
            tooltip={
              <>
                <div className="cg-tooltip__row"><span>Ativos</span> <strong style={{ color: '#34d399' }}>{fornecedores.filter(e => e.ativo_fornecedor).length}</strong></div>
                <div className="cg-tooltip__row"><span>Inativos</span> <strong style={{ color: '#f87171' }}>{fornecedores.filter(e => !e.ativo_fornecedor).length}</strong></div>
              </>
            }
          />
        </>
      }
    >


      {/* ── Estados ──────────────────────────────────────────────────────── */}
      {carregando && (
        <div style={{ padding: 24, color: 'var(--ws-text-muted)' }}>
          Carregando fornecedores, aguarde alguns segundos.
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
        <TabelaGlobal<FornecedorAdmin>
          id="admin-fornecedores"
          dados={fornecedores}
          colunas={colunas}
          frozenColunas={1}
          idKey="id_fornecedor"
          mensagemVazio="Nenhum fornecedor encontrado com os filtros atuais."
          tooltipBusca="Busca por nome do fornecedor"
          tooltipExpandir="Ver usuários vinculados ao fornecedor"
          tooltipRecolher="Recolher usuários vinculados"
          renderExpandido={(fornecedor) => {
            const chave = chaveCacheUsuarios(fornecedor.id_fornecedor)
            if (
              usuariosPorFornecedor[chave] === undefined
              && !carregandoUsuarios.has(chave)
              && !erroUsuarios[chave]
            ) {
              void carregarUsuariosVinculados(fornecedor.id_fornecedor)
            }

            const lista = usuariosPorFornecedor[chave] ?? []
            const carregandoVinculos = carregandoUsuarios.has(chave)
            const erroVinculos = erroUsuarios[chave]

            return (
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{
                  padding: '1rem',
                  borderTop: '1px solid rgba(129,140,248,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--ws-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  <TreeStructure size={14} /> Usuários vinculados ({carregandoVinculos ? '…' : lista.length})
                </div>

                {erroVinculos ? (
                  <div style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fca5a5',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}>
                    <span>{erroVinculos}</span>
                    <BotaoGlobal
                      variante="secundario"
                      onClick={() => void carregarUsuariosVinculados(fornecedor.id_fornecedor, true)}
                    >
                      Tentar novamente
                    </BotaoGlobal>
                  </div>
                ) : null}

                {carregandoVinculos ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
                    Carregando usuários vinculados a <strong>{fornecedor.nome_fornecedor}</strong>…
                  </div>
                ) : (
                  <div style={{ border: '1px solid rgba(129,140,248,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                    <TabelaGlobal<UsuarioVinculadoFornecedorAdmin>
                      id={`admin-fornecedor-usuarios-${fornecedor.id_fornecedor}`}
                      idKey="id_fornecedor_organizacao"
                      dados={lista}
                      colunas={colunasUsuariosVinculados}
                      mensagemVazio="Nenhum usuário vinculado a este fornecedor."
                      tooltipBusca="Buscar por nome, e-mail ou organização"
                      acoesExportacao={getAcoesExportacaoPadrao(
                        colunasUsuariosVinculados,
                        'dados_tabela',
                        'Exportação de Dados',
                      )}
                    />
                  </div>
                )}
              </div>
            )
          }}
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
            <strong>{totalGeral} fornecedores</strong> retornados em sua consulta cross-organização.
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
