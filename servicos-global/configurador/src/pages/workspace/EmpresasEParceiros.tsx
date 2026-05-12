/**
 * EmpresasEParceiros.tsx — Gaveta do Configurador (Fase 5 DDD).
 *
 * Tela tenant — NÃO é painel Admin. Só lista/edita Empresas da organização
 * logada (Tenant Isolation via header x-organizacao-id).
 *
 * Contrato bilateral (Mandamento 09): schemas Zod vêm do próprio serviço
 * Cadastros (@tenant/cadastros/shared/schemas). Divergência aqui = commit
 * incompleto.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Buildings,
  Globe,
  PencilSimple,
  PauseCircle,
  PlayCircle,
  Plus,
  FileXls,
  FileCsv,
  FileText,
  FilePdf,
  Code,
  CheckCircle,
  ChartPieSlice,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import {
  TabelaGlobal,
  type TabelaGlobalColuna,
  type TabelaGlobalAcao,
  type TabelaExportAcao,
} from '@nucleo/tabela-global'
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  listaEmpresasSchema,
  empresaSchema,
  type Empresa,
} from '@cadastros/shared/schemas'
import { useShellStore } from '@gravity/shell'
import {
  exportarExcel,
  exportarCSV,
  exportarTXT,
  exportarXML,
  exportarJSON,
  exportarPDF,
  type ColunasExport,
} from '../../services/export-service'
import { ModalEditarEmpresa } from './ModalEditarEmpresa'

// ── Auth helpers ─────────────────────────────────────────────────────────────

async function getAuthHeaders(idOrganizacao: string | undefined): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const session = await (window as unknown as { Clerk?: { session?: { getToken(): Promise<string | null> } } }).Clerk?.session
    const token = session ? await session.getToken() : null
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch {
    /* sem token */
  }
  if (idOrganizacao) headers['x-organizacao-id'] = idOrganizacao
  return headers
}

// ── Cell renderers ───────────────────────────────────────────────────────────

// Empresa enriquecida com campo derivado `tipos_empresa` para suportar
// filtro/ordenacao do TabelaGlobal sem duplicar 14 colunas booleanas.
type EmpresaComTipos = Empresa & { tipos_empresa: string }

const PAPEIS: Array<{ key: keyof Empresa; label: string; cor: string }> = [
  { key: 'pode_ser_importador_empresa', label: 'Importador', cor: '#60a5fa' },
  { key: 'pode_ser_exportador_empresa', label: 'Exportador', cor: '#34d399' },
  { key: 'pode_ser_fabricante_empresa', label: 'Fabricante', cor: '#fbbf24' },
  { key: 'pode_ser_agente_empresa', label: 'Agente', cor: '#c084fc' },
  { key: 'pode_ser_despachante_empresa', label: 'Despachante', cor: '#f472b6' },
  { key: 'pode_ser_armador_empresa', label: 'Armador', cor: '#22d3ee' },
  { key: 'pode_ser_cia_aerea_empresa', label: 'Cia Aérea', cor: '#818cf8' },
  { key: 'pode_ser_transportadora_rodoviaria_nacional_empresa', label: 'Transp. Rod. Nacional', cor: '#a3e635' },
  { key: 'pode_ser_transportadora_rodoviaria_internacional_empresa', label: 'Transp. Rod. Internacional', cor: '#facc15' },
  { key: 'pode_ser_armazem_alfandegado_empresa', label: 'Armazém Alfandegado', cor: '#fb923c' },
  { key: 'pode_ser_armazem_nacional_empresa', label: 'Armazém Nacional', cor: '#fdba74' },
  { key: 'pode_ser_banco_empresa', label: 'Banco', cor: '#10b981' },
  { key: 'pode_ser_seguradora_internacional_empresa', label: 'Seguradora Internacional', cor: '#06b6d4' },
  { key: 'pode_ser_seguradora_corretora_cambio_empresa', label: 'Seguradora / Corretora Câmbio', cor: '#14b8a6' },
]

function derivarTiposEmpresa(empresa: Empresa): string {
  const ativos = PAPEIS.filter(p => Boolean(empresa[p.key])).map(p => p.label)
  return ativos.length === 0 ? '—' : ativos.join(' + ')
}

function ChipsPapeis({ empresa }: { empresa: EmpresaComTipos | Empresa }) {
  const ativos = PAPEIS.filter((p) => Boolean(empresa[p.key]))
  if (ativos.length === 0) {
    return <span style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>—</span>
  }
  // inline-flex + justifyContent center casa com `text-align: center` da célula <td>.
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '100%' }}>
      {ativos.map((p) => (
        <span
          key={p.label}
          style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            background: `${p.cor}1a`,
            border: `1px solid ${p.cor}33`,
            color: p.cor,
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {p.label}
        </span>
      ))}
    </span>
  )
}

function DocumentoCell({ empresa }: { empresa: Empresa }) {
  const ehBr = empresa.pais_empresa === 'BR'
  const doc = ehBr ? empresa.cnpj_empresa : empresa.tin_empresa
  const tipo = ehBr ? 'CNPJ' : 'TIN'
  if (!doc) {
    return <span style={{ color: 'var(--ws-muted)', fontStyle: 'italic' }}>sem documento</span>
  }
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.2 }}>
      <code style={{ fontSize: '0.8125rem', color: 'var(--ws-text)', fontWeight: 600 }}>{doc}</code>
      <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tipo}</span>
    </span>
  )
}

function StatusCell({ ativo }: { ativo: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '0.2rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: ativo ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
        color: ativo ? '#34d399' : '#f87171',
        border: `1px solid ${ativo ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
      }}
    >
      {ativo ? 'Ativa' : 'Inativa'}
    </span>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function EmpresasEParceiros() {
  const addNotification = useShellStore((s) => s.addNotification)
  const currentUser = useShellStore((s) => s.currentUser)
  const idOrganizacao = currentUser.idOrganizacao

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null)
  const [criandoNova, setCriandoNova] = useState(false)

  async function recarregar() {
    if (!idOrganizacao) {
      setCarregando(false)
      return
    }
    try {
      setCarregando(true)
      const headers = await getAuthHeaders(idOrganizacao)
      const res = await fetch('/api/v1/empresas?pagina=1&por_pagina=200', { headers })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        addNotification({
          type: 'error',
          message: body?.error?.message ?? 'Falha ao carregar empresas.',
        })
        return
      }
      const raw = await res.json()
      const parsed = listaEmpresasSchema.parse(raw)
      setEmpresas(parsed.itens)
    } catch (err) {
      console.error('[EmpresasEParceiros] erro ao carregar:', err)
      addNotification({
        type: 'error',
        message: 'Erro inesperado ao carregar empresas.',
      })
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrganizacao])

  async function alternarAtivacao(empresa: Empresa) {
    try {
      const headers = await getAuthHeaders(idOrganizacao)
      // Soft delete (DELETE) desativa; para reativar usamos PUT com { ativo_empresa: true }.
      const res = empresa.ativo_empresa
        ? await fetch(`/api/v1/empresas/${empresa.suid_empresa}`, {
            method: 'DELETE',
            headers,
          })
        : await fetch(`/api/v1/empresas/${empresa.suid_empresa}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ ativo_empresa: true }),
          })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        addNotification({
          type: 'error',
          message: body?.error?.message ?? 'Falha ao atualizar status da empresa.',
        })
        return
      }
      const raw = await res.json()
      const atualizada = empresaSchema.parse(raw)
      setEmpresas((prev) => prev.map((e) => (e.suid_empresa === atualizada.suid_empresa ? atualizada : e)))
      addNotification({
        type: 'success',
        message: `Empresa "${atualizada.nome_empresa}" ${atualizada.ativo_empresa ? 'reativada' : 'desativada'}.`,
      })
    } catch (err) {
      console.error('[EmpresasEParceiros] erro ao alternar status:', err)
      addNotification({ type: 'error', message: 'Erro inesperado ao atualizar empresa.' })
    }
  }

  // ── Colunas + ações ──────────────────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<EmpresaComTipos>[] = [
    {
      key: 'nome_empresa',
      label: 'Empresa',
      tipo: 'texto',
      tooltipTitulo: 'Empresa',
      tooltipDescricao: 'Razão social registrada no Cadastros da organização',
      render: (_, item) => (
        // inline-flex + justifyContent center casa com `text-align: center` da célula <td>.
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem' }}>
          <span
            style={{
              width: 32,
              height: 32,
              minWidth: 32,
              borderRadius: 8,
              background: 'rgba(129,140,248,0.12)',
              border: '1px solid rgba(129,140,248,0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <Buildings size={16} weight="duotone" />
          </span>
          <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.2, textAlign: 'left' }}>
            <span style={{ fontWeight: 600 }}>{item.nome_empresa}</span>
            <code style={{ fontSize: '0.625rem', color: 'var(--ws-muted)' }}>{item.suid_empresa}</code>
          </span>
        </span>
      ),
    },
    {
      key: 'cnpj_empresa',
      label: 'CNPJ do Parceiro',
      tipo: 'texto',
      tooltipTitulo: 'CNPJ do Parceiro',
      tooltipDescricao: 'CNPJ para parceiros brasileiros, TIN para estrangeiros',
      render: (_, item) => <DocumentoCell empresa={item} />,
    },
    {
      key: 'pais_empresa',
      label: 'Localização',
      tipo: 'texto',
      tooltipTitulo: 'Localização',
      tooltipDescricao: 'País e cidade cadastrados',
      render: (_, item) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <Globe size={14} weight="duotone" color="var(--ws-muted)" />
          <strong style={{ fontSize: '0.8125rem' }}>{item.pais_empresa}</strong>
          {item.cidade_empresa && (
            <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>
              · {item.cidade_empresa}
              {item.estado_empresa ? `/${item.estado_empresa}` : ''}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'tipos_empresa',
      label: 'Tipo de Parceiro',
      tipo: 'texto',
      tooltipTitulo: 'Tipo de Parceiro',
      tooltipDescricao: 'Papéis que esta empresa pode desempenhar em operações de comércio exterior',
      render: (_, item) => <ChipsPapeis empresa={item} />,
    },
    {
      key: 'ativo_empresa',
      label: 'Status',
      tipo: 'texto',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Empresas inativas não aparecem em dropdowns operacionais',
      render: (_, item) => <StatusCell ativo={item.ativo_empresa} />,
      renderFiltroLabel: (val) => (val === 'true' ? 'Ativa' : val === 'false' ? 'Inativa' : val),
    },
  ]

  const ACOES: TabelaGlobalAcao<EmpresaComTipos>[] = [
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar empresa',
      onClick: (e) => setEmpresaEditando(e),
    },
    {
      id: 'toggle-ativo',
      icone: <PauseCircle size={16} weight="bold" />,
      tooltip: 'Desativar/Reativar',
      onClick: (e) => void alternarAtivacao(e),
      renderCustom: (item) => (
        <TooltipGlobal descricao={item.ativo_empresa ? 'Desativar empresa' : 'Reativar empresa'}>
          <button
            type="button"
            onClick={(ev) => {
              ev.preventDefault()
              ev.stopPropagation()
              void alternarAtivacao(item)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'transparent',
              border: '1px solid transparent',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(ev) => {
              ev.currentTarget.style.background = item.ativo_empresa ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'
              ev.currentTarget.style.borderColor = item.ativo_empresa ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'
              ev.currentTarget.style.color = item.ativo_empresa ? '#fbbf24' : '#34d399'
            }}
            onMouseLeave={(ev) => {
              ev.currentTarget.style.background = 'transparent'
              ev.currentTarget.style.borderColor = 'transparent'
              ev.currentTarget.style.color = '#64748b'
            }}
          >
            {item.ativo_empresa ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
          </button>
        </TooltipGlobal>
      ),
    },
  ]

  // ── Exportação ────────────────────────────────────────────────────────────

  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'SUID', key: 'suid' },
    { header: 'Nome', key: 'nome_empresa' },
    { header: 'País', key: 'pais' },
    { header: 'CNPJ', key: 'cnpj' },
    { header: 'TIN', key: 'tin' },
    { header: 'Cidade', key: 'cidade' },
    { header: 'Estado', key: 'estado' },
    { header: 'Importador', key: 'pode_ser_importador' },
    { header: 'Exportador', key: 'pode_ser_exportador' },
    { header: 'Fabricante', key: 'pode_ser_fabricante' },
    { header: 'Agente', key: 'pode_ser_agente' },
    { header: 'Despachante', key: 'pode_ser_despachante' },
    { header: 'Armador', key: 'pode_ser_armador' },
    { header: 'Cia Aérea', key: 'pode_ser_cia_aerea' },
    { header: 'Transp. Rod. Nacional', key: 'pode_ser_transportadora_rodoviaria_nacional' },
    { header: 'Transp. Rod. Internacional', key: 'pode_ser_transportadora_rodoviaria_internacional' },
    { header: 'Armazém Alfandegado', key: 'pode_ser_armazem_alfandegado' },
    { header: 'Armazém Nacional', key: 'pode_ser_armazem_nacional' },
    { header: 'Banco', key: 'pode_ser_banco' },
    { header: 'Seguradora Internacional', key: 'pode_ser_seguradora_internacional' },
    { header: 'Seguradora / Corretora Câmbio', key: 'pode_ser_seguradora_corretora_cambio' },
    { header: 'Ativo', key: 'ativo' },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'empresas-e-parceiros', titulo: 'Empresas e Parceiros' }

  const ACOES_EXPORT: TabelaExportAcao<EmpresaComTipos>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV', icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT', icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarXML(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF', icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarJSON(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  ]

  // ── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const ativas = empresas.filter((e) => e.ativo_empresa)
    // Contagem por papel — empresas podem somar em mais de um (count > total e' OK).
    // Ordena por count desc para destacar o tipo mais frequente.
    const tiposCount = PAPEIS
      .map((p) => ({ label: p.label, cor: p.cor, count: empresas.filter((e) => Boolean(e[p.key])).length }))
      .sort((a, b) => b.count - a.count)
    return {
      total: empresas.length,
      ativas: ativas.length,
      tiposCount,
    }
  }, [empresas])

  const tipoPrincipal = stats.tiposCount[0]
  const tiposComEmpresas = stats.tiposCount.filter((t) => t.count > 0)

  // Estilo do valor principal — alinhado ao padrao da tela TaxasMoeda
  // (font-size maior, branco). Default do componente e' 1.875rem; aqui
  // bumpamos para 2rem para destaque visual quando o valor e' curto (1-2 digitos).
  const estiloValor = { fontSize: '2rem', color: 'var(--ws-text, #f1f5f9)', fontWeight: 700 } as const

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Buildings weight="duotone" size={22} />}
          titulo="Empresas e Parceiros"
          subtitulo="Cadastre e gerencie os parceiros da sua jornada COMEX"
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total de empresas"
            valor={<span style={estiloValor}>{stats.total}</span>}
            icone={<Buildings weight="duotone" size={18} />}
            subtexto="Ativas e inativas"
          />
          <CardBasicoGlobal
            titulo="Empresas ativas"
            valor={<span style={estiloValor}>{stats.ativas}</span>}
            icone={<CheckCircle weight="duotone" size={18} />}
            variante="sucesso"
            subtexto="Disponíveis em dropdowns operacionais"
          />
          <CardGraficoGlobal
            titulo="Distribuição por tipo"
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
            total={empresas.length}
            valorPrincipal={tipoPrincipal?.count ?? 0}
            corGauge={tipoPrincipal?.cor ?? '#818cf8'}
            legenda={
              tiposComEmpresas.length === 0
                ? [{ label: 'Nenhum tipo cadastrado', cor: '#64748b' }]
                : tiposComEmpresas.length <= 3
                  ? tiposComEmpresas.map((t) => ({ label: t.label, cor: t.cor }))
                  : [
                      ...tiposComEmpresas.slice(0, 3).map((t) => ({ label: t.label, cor: t.cor })),
                      { label: 'Outros', cor: '#64748b' },
                    ]
            }
            tooltip={
              <>
                {tiposComEmpresas.length === 0 ? (
                  <div className="cg-tooltip__row">
                    <span>Nenhum tipo cadastrado ainda</span>
                  </div>
                ) : (
                  tiposComEmpresas.map((t) => (
                    <div key={t.label} className="cg-tooltip__row">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <i
                          aria-hidden
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: t.cor,
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        {t.label}
                      </span>
                      <strong style={{ color: t.cor }}>{t.count}</strong>
                    </div>
                  ))
                )}
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Total de empresas</span>
                  <strong>{empresas.length}</strong>
                </div>
              </>
            }
          />
        </>
      }
      toolbar={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
          <TooltipGlobal descricao="Cadastrar uma nova empresa no cartório de identidades">
            <BotaoGlobal
              variante="primario"
              onClick={() => setCriandoNova(true)}
              icone={<Plus size={18} />}
            >
              Nova Empresa e Parceiro
            </BotaoGlobal>
          </TooltipGlobal>
        </div>
      }
    >
      <div style={{ position: 'relative', zIndex: 10 }}>
        {carregando ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>
            Carregando empresas...
          </div>
        ) : !idOrganizacao ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
            Carregando parceiros, aguarde alguns segundos.
          </div>
        ) : (
          <TabelaGlobal<EmpresaComTipos>
            id="workspace-empresas-e-parceiros"
            idKey="suid_empresa"
            dados={empresas.map((e) => ({ ...e, tipos_empresa: derivarTiposEmpresa(e) }))}
            colunas={COLUNAS}
            acoes={ACOES}
            acoesExportacao={ACOES_EXPORT}
            mensagemVazio="Nenhuma empresa encontrada com esse filtro."
            mensagemSemFiltro="Você ainda não cadastrou empresas. Use o botão “Nova Empresa e Parceiro” acima."
            tooltipBusca="Localizar empresa por nome, SUID, CNPJ ou TIN"
          />
        )}
      </div>

      {/*
        Modal renderizado via React portal direto no document.body.
        Motivo: ancestrais do .ws-main (ex: .ws-stats-row com transform:
        translateZ(0)) criam containing block que prende `position: fixed`
        do .mg-overlay no stacking context interno — fazendo o overlay
        ficar atras do botao Hub/sino/busca. Saindo via portal, o modal
        sobe para o body e respeita a viewport. Scoped a esta tela; nao
        toca no nucleo (ModalSemSessoesGlobal) nem no HubBotao.
      */}
      {(criandoNova || empresaEditando) && idOrganizacao && createPortal(
        <ModalEditarEmpresa
          empresa={empresaEditando}
          idOrganizacao={idOrganizacao}
          aoFechar={() => {
            setEmpresaEditando(null)
            setCriandoNova(false)
          }}
          aoSalvar={(empresaSalva) => {
            setEmpresas((prev) => {
              const existe = prev.some((e) => e.suid_empresa === empresaSalva.suid_empresa)
              return existe
                ? prev.map((e) => (e.suid_empresa === empresaSalva.suid_empresa ? empresaSalva : e))
                : [empresaSalva, ...prev]
            })
            setEmpresaEditando(null)
            setCriandoNova(false)
          }}
        />,
        document.body,
      )}
    </PaginaGlobal>
  )
}

export default EmpresasEParceiros
