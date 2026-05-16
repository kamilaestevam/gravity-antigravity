/**
 * ModalEditarEmpresa.tsx — Criação/edição de Empresa do Cadastros (Fase 5).
 *
 * Contrato bilateral (Mandamento 09): usa `criarEmpresaSchema` e
 * `atualizarEmpresaSchema` do próprio Cadastros.
 *
 * Regras de UI seguem o schema:
 *   - pais === 'BR'  → CNPJ obrigatório, TIN oculto
 *   - pais !== 'BR'  → TIN visível, CNPJ oculto
 *   - pelo menos 1 dos 6 flags pode_ser_* deve estar marcado
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  Buildings,
  IdentificationCard,
  MapPinLine,
  MapPin,
  EnvelopeSimple,
  Phone,
  WhatsappLogo,
  Truck,
  Package,
  Factory,
  UserGear,
  ShieldStar,
  Boat,
  Airplane,
  TruckTrailer,
  Warehouse,
  Bank,
  ShieldCheck,
  CurrencyCircleDollar,
  Info,
  ArrowLeft,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import {
  BannerRequisitosGlobal,
  BannerRequisitosContexto,
  RequisitoMensagem,
  useRequisitoCampo,
  camposComRequisitoPendente,
  type RequisitoSalvar,
} from '@nucleo/banner-requisitos-global'
import { formatarCNPJ, formatarCEP, formatarTelefone, validarCNPJ } from '@nucleo/utils'
import { useShellStore } from '@gravity/shell'
import { useCidadesIBGE } from '../../hooks/use-cidades-ibge'
import { usePaises } from '../../hooks/use-paises'
import {
  criarEmpresaSchema,
  atualizarEmpresaSchema,
  empresaSchema,
  type Empresa,
} from '@cadastros/shared/schemas'

// ── Constantes de localização (BR) ───────────────────────────────────────────

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

const OPCOES_ESTADOS: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...ESTADOS_BR.map(uf => ({ valor: uf, rotulo: uf })),
]

// Lista de Países: lê da fonte única (Cadastros — usePaises hook).
// Anteriormente era hardcoded local (38 países) — substituído pela tabela
// canônica com 251 países. Lei: cadastros-snapshot-policy.

// ── Auth helper ──────────────────────────────────────────────────────────────

async function getAuthHeaders(idOrganizacao: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const session = await (window as unknown as { Clerk?: { session?: { getToken(): Promise<string | null> } } }).Clerk?.session
    const token = session ? await session.getToken() : null
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch {
    /* sem token */
  }
  headers['x-organizacao-id'] = idOrganizacao
  return headers
}

// ── Types internos ───────────────────────────────────────────────────────────

export type PapelFlag =
  | 'pode_ser_importador'
  | 'pode_ser_exportador'
  | 'pode_ser_fabricante'
  | 'pode_ser_agente'
  | 'pode_ser_despachante'
  | 'pode_ser_armador'
  | 'pode_ser_cia_aerea'
  | 'pode_ser_transportadora_rodoviaria_nacional'
  | 'pode_ser_transportadora_rodoviaria_internacional'
  | 'pode_ser_armazem_alfandegado'
  | 'pode_ser_armazem_nacional'
  | 'pode_ser_banco'
  | 'pode_ser_seguradora_internacional'
  | 'pode_ser_seguradora_corretora_cambio'

interface PapelConfig {
  chave: PapelFlag
  label: string
  descricao: string
  icone: React.ReactNode
  cor: string
}

const PAPEIS: PapelConfig[] = [
  { chave: 'pode_ser_importador', label: 'Importador', descricao: 'Pode figurar como importador', icone: <Package weight="duotone" size={18} />, cor: '#60a5fa' },
  { chave: 'pode_ser_exportador', label: 'Exportador', descricao: 'Pode figurar como exportador', icone: <Truck weight="duotone" size={18} />, cor: '#34d399' },
  { chave: 'pode_ser_fabricante', label: 'Fabricante', descricao: 'Fabricante da mercadoria', icone: <Factory weight="duotone" size={18} />, cor: '#fbbf24' },
  { chave: 'pode_ser_agente', label: 'Agente de Carga', descricao: 'Empresa de logística internacional', icone: <UserGear weight="duotone" size={18} />, cor: '#c084fc' },
  { chave: 'pode_ser_despachante', label: 'Despachante Aduaneiro', descricao: 'Representante legal da empresa', icone: <ShieldStar weight="duotone" size={18} />, cor: '#f472b6' },
  { chave: 'pode_ser_armador', label: 'Armador', descricao: 'Companhia marítima armadora', icone: <Boat weight="duotone" size={18} />, cor: '#22d3ee' },
  { chave: 'pode_ser_cia_aerea', label: 'Cia Aérea', descricao: 'Companhia aérea de transporte de carga', icone: <Airplane weight="duotone" size={18} />, cor: '#818cf8' },
  { chave: 'pode_ser_transportadora_rodoviaria_nacional', label: 'Transp. Rodoviária Nacional', descricao: 'Coletas e entregas internas', icone: <TruckTrailer weight="duotone" size={18} />, cor: '#a3e635' },
  { chave: 'pode_ser_transportadora_rodoviaria_internacional', label: 'Transp. Rodoviária Internacional', descricao: 'Transportes rodoviários internacionais', icone: <TruckTrailer weight="duotone" size={18} />, cor: '#facc15' },
  { chave: 'pode_ser_armazem_alfandegado', label: 'Armazém Alfandegado', descricao: 'Recinto alfandegado', icone: <Warehouse weight="duotone" size={18} />, cor: '#fb923c' },
  { chave: 'pode_ser_armazem_nacional', label: 'Armazém Nacional', descricao: 'Armazém geral não alfandegado', icone: <Warehouse weight="duotone" size={18} />, cor: '#fdba74' },
  { chave: 'pode_ser_banco', label: 'Banco', descricao: 'Instituição bancária para operações COMEX', icone: <Bank weight="duotone" size={18} />, cor: '#10b981' },
  { chave: 'pode_ser_seguradora_internacional', label: 'Seguradora Internacional', descricao: 'Seguradora de cargas internacionais', icone: <ShieldCheck weight="duotone" size={18} />, cor: '#06b6d4' },
  { chave: 'pode_ser_seguradora_corretora_cambio', label: 'Corretora de Câmbio', descricao: 'Corretora de câmbio para remessas', icone: <CurrencyCircleDollar weight="duotone" size={18} />, cor: '#14b8a6' },
]

// ── Formulário state shape ───────────────────────────────────────────────────

interface FormState {
  nome_empresa: string
  pais: string
  cnpj: string
  tin: string
  estado: string
  cidade: string
  endereco: string
  zipcode: string
  email: string
  telefone: string
  whatsapp: string
  papeis: Record<PapelFlag, boolean>
  ativo: boolean
}

function empresaParaForm(empresa: Empresa | null): FormState {
  return {
    nome_empresa: empresa?.nome_empresa ?? '',
    pais: empresa?.pais_empresa ?? 'BR',
    cnpj: empresa?.cnpj_empresa ?? '',
    tin: empresa?.tin_empresa ?? '',
    estado: empresa?.estado_empresa ?? '',
    cidade: empresa?.cidade_empresa ?? '',
    endereco: empresa?.endereco_empresa ?? '',
    zipcode: empresa?.zipcode_empresa ?? '',
    email: empresa?.email_empresa ?? '',
    telefone: empresa?.telefone_empresa ?? '',
    whatsapp: empresa?.whatsapp_empresa ?? '',
    papeis: {
      pode_ser_importador: empresa?.pode_ser_importador_empresa ?? false,
      pode_ser_exportador: empresa?.pode_ser_exportador_empresa ?? false,
      pode_ser_fabricante: empresa?.pode_ser_fabricante_empresa ?? false,
      pode_ser_agente: empresa?.pode_ser_agente_empresa ?? false,
      pode_ser_despachante: empresa?.pode_ser_despachante_empresa ?? false,
      pode_ser_armador: empresa?.pode_ser_armador_empresa ?? false,
      pode_ser_cia_aerea: empresa?.pode_ser_cia_aerea_empresa ?? false,
      pode_ser_transportadora_rodoviaria_nacional: empresa?.pode_ser_transportadora_rodoviaria_nacional_empresa ?? false,
      pode_ser_transportadora_rodoviaria_internacional: empresa?.pode_ser_transportadora_rodoviaria_internacional_empresa ?? false,
      pode_ser_armazem_alfandegado: empresa?.pode_ser_armazem_alfandegado_empresa ?? false,
      pode_ser_armazem_nacional: empresa?.pode_ser_armazem_nacional_empresa ?? false,
      pode_ser_banco: empresa?.pode_ser_banco_empresa ?? false,
      pode_ser_seguradora_internacional: empresa?.pode_ser_seguradora_internacional_empresa ?? false,
      pode_ser_seguradora_corretora_cambio: empresa?.pode_ser_seguradora_corretora_cambio_empresa ?? false,
    },
    ativo: empresa?.ativo_empresa ?? true,
  }
}

/**
 * Mapeia os flags `pode_ser_*` do FormState (sem sufixo) para as chaves do
 * schema Zod (`pode_ser_*_empresa`). Onda 38 DDD — sufixos físicos.
 */
function papeisParaPayload(papeis: FormState['papeis']): Record<string, boolean> {
  return {
    pode_ser_importador_empresa:                              papeis.pode_ser_importador,
    pode_ser_exportador_empresa:                              papeis.pode_ser_exportador,
    pode_ser_fabricante_empresa:                              papeis.pode_ser_fabricante,
    pode_ser_agente_empresa:                                  papeis.pode_ser_agente,
    pode_ser_despachante_empresa:                             papeis.pode_ser_despachante,
    pode_ser_armador_empresa:                                 papeis.pode_ser_armador,
    pode_ser_cia_aerea_empresa:                               papeis.pode_ser_cia_aerea,
    pode_ser_transportadora_rodoviaria_nacional_empresa:      papeis.pode_ser_transportadora_rodoviaria_nacional,
    pode_ser_transportadora_rodoviaria_internacional_empresa: papeis.pode_ser_transportadora_rodoviaria_internacional,
    pode_ser_armazem_alfandegado_empresa:                     papeis.pode_ser_armazem_alfandegado,
    pode_ser_armazem_nacional_empresa:                        papeis.pode_ser_armazem_nacional,
    pode_ser_banco_empresa:                                   papeis.pode_ser_banco,
    pode_ser_seguradora_internacional_empresa:                papeis.pode_ser_seguradora_internacional,
    pode_ser_seguradora_corretora_cambio_empresa:             papeis.pode_ser_seguradora_corretora_cambio,
  }
}

function formParaPayloadCriar(form: FormState, idOrganizacao: string): Record<string, unknown> {
  const ehBr = form.pais === 'BR'
  return {
    id_organizacao:   idOrganizacao,
    nome_empresa:     form.nome_empresa.trim(),
    pais_empresa:     form.pais.trim().toUpperCase(),
    cnpj_empresa:     ehBr ? form.cnpj.trim() || null : null,
    tin_empresa:      !ehBr ? form.tin.trim() || null : null,
    estado_empresa:   form.estado.trim() || null,
    cidade_empresa:   form.cidade.trim() || null,
    endereco_empresa: form.endereco.trim() || null,
    zipcode_empresa:  form.zipcode.trim() || null,
    email_empresa:    form.email.trim() || null,
    telefone_empresa: form.telefone.trim() || null,
    whatsapp_empresa: form.whatsapp.trim() || null,
    ...papeisParaPayload(form.papeis),
    ativo_empresa:    form.ativo,
  }
}

function formParaPayloadAtualizar(form: FormState): Record<string, unknown> {
  const ehBr = form.pais === 'BR'
  return {
    nome_empresa:     form.nome_empresa.trim(),
    pais_empresa:     form.pais.trim().toUpperCase(),
    cnpj_empresa:     ehBr ? form.cnpj.trim() || null : null,
    tin_empresa:      !ehBr ? form.tin.trim() || null : null,
    estado_empresa:   form.estado.trim() || null,
    cidade_empresa:   form.cidade.trim() || null,
    endereco_empresa: form.endereco.trim() || null,
    zipcode_empresa:  form.zipcode.trim() || null,
    email_empresa:    form.email.trim() || null,
    telefone_empresa: form.telefone.trim() || null,
    whatsapp_empresa: form.whatsapp.trim() || null,
    ...papeisParaPayload(form.papeis),
    ativo_empresa:    form.ativo,
  }
}

// ── Checkbox agrupado ────────────────────────────────────────────────────────

function PapelCheckbox({
  papel,
  marcado,
  onToggle,
}: {
  papel: PapelConfig
  marcado: boolean
  onToggle: () => void
}) {
  return (
    <div
      role="checkbox"
      aria-checked={marcado}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onToggle()
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.625rem 0.75rem',
        borderRadius: 8,
        background: marcado ? `${papel.cor}14` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${marcado ? `${papel.cor}44` : 'rgba(255,255,255,0.06)'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          flexShrink: 0,
          background: marcado ? `${papel.cor}33` : 'transparent',
          border: `2px solid ${marcado ? papel.cor : 'rgba(255,255,255,0.25)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {marcado && <span style={{ color: papel.cor, fontSize: 11, lineHeight: 1, fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ color: marcado ? papel.cor : 'var(--ws-muted)', flexShrink: 0 }}>{papel.icone}</div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.875rem',
            color: marcado ? 'var(--ws-text)' : 'var(--ws-muted)',
          }}
        >
          {papel.label}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', opacity: 0.8 }}>
          {papel.descricao}
        </span>
      </div>
      <TooltipGlobal titulo={papel.label} descricao={papel.descricao}>
        <span
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'var(--ws-muted)',
            opacity: 0.6,
            flexShrink: 0,
            cursor: 'help',
          }}
        >
          <Info size={14} weight="duotone" />
        </span>
      </TooltipGlobal>
    </div>
  )
}

// ── Modal principal ──────────────────────────────────────────────────────────

interface Props {
  empresa: Empresa | null
  idOrganizacao: string
  aoFechar: () => void
  aoSalvar: (empresa: Empresa) => void
  /** Papel pré-selecionado ao criar nova empresa (deep-link do Pedido) */
  papelInicial?: PapelFlag
  /** URL de retorno (deep-link do Pedido). Exibe banner "Voltar para Pedidos" */
  urlRetorno?: string | null
}

export function ModalEditarEmpresa({ empresa, idOrganizacao, aoFechar, aoSalvar, papelInicial, urlRetorno }: Props) {
  const addNotification = useShellStore((s) => s.addNotification)
  const [form, setForm] = useState<FormState>(() => {
    const base = empresaParaForm(empresa)
    if (!empresa && papelInicial) {
      base.papeis[papelInicial] = true
    }
    return base
  })
  const [enviando, setEnviando] = useState(false)
  const [erroCampos, setErroCampos] = useState<Record<string, string>>({})
  const modoEdicao = empresa !== null

  useEffect(() => {
    const base = empresaParaForm(empresa)
    if (!empresa && papelInicial) {
      base.papeis[papelInicial] = true
    }
    setForm(base)
    setErroCampos({})
  }, [empresa, papelInicial])

  const ehBr = form.pais === 'BR'
  const { cidades, carregando: carregandoCidades } = useCidadesIBGE(form.estado)
  // Lista de países da fonte única (Cadastros). Sprint 1: form.pais ainda
  // armazena ISO-2 ('BR') por compatibilidade com Empresa.pais_empresa
  // existente. Sprint 2 vai migrar para id_pais (cuid).
  const { paises, carregando: carregandoPaises } = usePaises()
  const opcoesPaises: SelectOpcao[] = useMemo(() => {
    return paises
      .filter(p => p.codigo_pais_iso_alpha2)
      .map(p => ({
        valor: p.codigo_pais_iso_alpha2 as string,
        rotulo: `${p.nome_pais_portugues} (${p.codigo_pais_iso_alpha2})`,
      }))
  }, [paises])
  const algumaFlagAtiva = useMemo(
    () => Object.values(form.papeis).some(Boolean),
    [form.papeis],
  )

  // Requisitos para salvar — lista visível, sem ponto cego.
  // Padrão @nucleo/banner-requisitos-global.
  const requisitos = useMemo<RequisitoSalvar[]>(() => {
    const lista: RequisitoSalvar[] = [
      {
        chave: 'nome_empresa',
        ok: form.nome_empresa.trim().length >= 2,
        mensagem: 'Razão social com pelo menos 2 caracteres',
      },
      {
        chave: 'pais',
        ok: /^[A-Z]{2}$/.test(form.pais.trim().toUpperCase()),
        mensagem: 'País em formato ISO-2 (ex: BR, US, CN)',
      },
    ]
    // CNPJ é opcional. Se preenchido, valida dígitos verificadores (CNPJ
    // inválido ainda bloqueia o save — é tech debt deixar gravar lixo).
    if (ehBr && form.cnpj.trim().length > 0) {
      lista.push({
        chave: 'cnpj',
        ok: validarCNPJ(form.cnpj),
        mensagem: 'CNPJ inválido (verifique os dígitos)',
      })
    }
    lista.push({
      chave: 'papeis',
      ok: algumaFlagAtiva,
      mensagem: 'Pelo menos uma função habilitada',
    })
    return lista
  }, [form.nome_empresa, form.pais, form.cnpj, ehBr, algumaFlagAtiva])

  const camposComRequisitoFaltando = camposComRequisitoPendente(requisitos)
  const podeSalvar = requisitos.every((r) => r.ok) && !enviando

  function setCampo<K extends keyof FormState>(chave: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [chave]: valor }))
  }

  function togglePapel(chave: PapelFlag) {
    setForm((prev) => ({ ...prev, papeis: { ...prev.papeis, [chave]: !prev.papeis[chave] } }))
  }

  async function handleSalvar() {
    setEnviando(true)
    setErroCampos({})
    try {
      const headers = await getAuthHeaders(idOrganizacao)

      // Validação frontend antes de enviar (feedback rápido).
      const payload = modoEdicao
        ? formParaPayloadAtualizar(form)
        : formParaPayloadCriar(form, idOrganizacao)
      const schema = modoEdicao ? atualizarEmpresaSchema : criarEmpresaSchema
      const pre = schema.safeParse(payload)
      if (!pre.success) {
        // Mapeia chaves do schema (sufixo _empresa) para chaves curtas usadas no
        // JSX/erro(): whatsapp_empresa → whatsapp, etc. Sem isso o destaque
        // visual nunca casa e o usuario fica no escuro (ponto cego).
        const SUFIXO = '_empresa'
        const campos: Record<string, string> = {}
        for (const issue of pre.error.issues) {
          const raw = issue.path.join('.') || 'geral'
          const curto = raw.endsWith(SUFIXO) ? raw.slice(0, -SUFIXO.length) : raw
          campos[curto] = issue.message
          // mantem a chave original tambem, caso algum render use o nome cheio
          campos[raw] = issue.message
        }
        setErroCampos(campos)
        const primeiros = Object.keys(campos).filter((k) => !k.endsWith(SUFIXO)).slice(0, 3).join(', ')
        addNotification({
          type: 'error',
          message: primeiros
            ? `Corrija os campos: ${primeiros}.`
            : 'Corrija os campos destacados e tente novamente.',
        })
        return
      }

      const url = modoEdicao
        ? `/api/v1/empresas/${empresa!.suid_empresa}`
        : '/api/v1/empresas'
      const res = await fetch(url, {
        method: modoEdicao ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        addNotification({
          type: 'error',
          message: body?.error?.message ?? body?.message ?? 'Falha ao salvar empresa.',
        })
        return
      }
      const raw = await res.json()
      const salva = empresaSchema.parse(raw)
      addNotification({
        type: 'success',
        message: modoEdicao ? `Empresa "${salva.nome_empresa}" atualizada.` : `Empresa "${salva.nome_empresa}" criada.`,
      })
      aoSalvar(salva)
    } catch (err) {
      console.error('[ModalEditarEmpresa] erro ao salvar:', err)
      addNotification({ type: 'error', message: 'Erro inesperado ao salvar empresa.' })
    } finally {
      setEnviando(false)
    }
  }

  const erro = (campo: string): string | undefined => erroCampos[campo]
  const corErro = '#f87171'

  return (
    <ModalFormularioGlobal
      aberto={true}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Buildings size={20} weight="duotone" />}
      titulo={modoEdicao ? 'Editar Empresa e Parceiro' : 'Nova Empresa e Parceiro'}
      subtitulo={
        modoEdicao
          ? `Ajuste os dados e papéis de ${empresa?.nome_empresa ?? ''}`
          : 'Cadastre um importador, exportador, fabricante ou parceiro COMEX'
      }
      tamanho="lg"
      altura="auto"
      dirty={true}
      podesSalvar={podeSalvar}
      rodapeEsquerdo={urlRetorno ? (
        <>
          <style>{`
            @keyframes ws-retorno-pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
              50% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
            }
          `}</style>
          <button
            type="button"
            onClick={() => {
              try { window.location.href = decodeURIComponent(urlRetorno) } catch { /* noop */ }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              background: 'rgba(99, 102, 241, 0.12)',
              color: '#a5b4fc',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              animation: 'ws-retorno-pulse 2s ease-in-out infinite',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)'; e.currentTarget.style.color = '#c7d2fe' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)'; e.currentTarget.style.color = '#a5b4fc' }}
          >
            <ArrowLeft size={14} weight="bold" />
            Voltar para Pedidos
          </button>
        </>
      ) : undefined}
    >
      <BannerRequisitosContexto requisitos={requisitos}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Identificação ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.875rem' }}>
          <CampoGeralGlobal label="NOME DO PARCEIRO" obrigatorio>
            <div className="ws-input-icon-wrap">
              <Buildings size={16} />
              <input
                value={form.nome_empresa}
                onChange={(e) => setCampo('nome_empresa', e.target.value)}
                placeholder="Ex: ACME Importadora Ltda"
                style={{ width: '100%', borderColor: (erro('nome_empresa') || camposComRequisitoFaltando.has('nome_empresa')) ? corErro : undefined }}
              />
            </div>
            {erro('nome_empresa') && <span style={{ color: corErro, fontSize: '0.75rem' }}>{erro('nome_empresa')}</span>}
          </CampoGeralGlobal>

          <CampoGeralGlobal label="PAÍS" obrigatorio>
            <SelectGlobal
              iconeEsquerda={<MapPinLine size={16} />}
              opcoes={opcoesPaises}
              valor={form.pais || null}
              aoMudarValor={(v) => {
                const novoPais = String(v ?? '')
                // Ao mudar de BR → estrangeiro, limpa CNPJ; ao mudar de
                // estrangeiro → BR, limpa TIN. Coerência com regra do schema
                // Zod (cnpj só com país=BR; tin só com país≠BR).
                setForm((prev) => ({
                  ...prev,
                  pais: novoPais,
                  cnpj: novoPais === 'BR' ? prev.cnpj : '',
                  tin:  novoPais !== 'BR' ? prev.tin  : '',
                }))
              }}
              placeholder={carregandoPaises ? 'Carregando países...' : 'Selecione o país...'}
              buscavel
              carregando={carregandoPaises}
            />
            {erro('pais') && <span style={{ color: corErro, fontSize: '0.75rem' }}>{erro('pais')}</span>}
          </CampoGeralGlobal>
        </div>

        {ehBr ? (
          <CampoGeralGlobal label="CNPJ">
            <div className="ws-input-icon-wrap">
              <IdentificationCard size={16} />
              <input
                value={form.cnpj}
                onChange={(e) => setCampo('cnpj', formatarCNPJ(e.target.value))}
                placeholder="XX.XXX.XXX/XXXX-XX"
                style={{ width: '100%', borderColor: (erro('cnpj') || camposComRequisitoFaltando.has('cnpj')) ? corErro : undefined }}
              />
            </div>
            {erro('cnpj') && <span style={{ color: corErro, fontSize: '0.75rem' }}>{erro('cnpj')}</span>}
            {!erro('cnpj') && form.cnpj.trim().length > 0 && !validarCNPJ(form.cnpj) && (
              <span style={{ color: corErro, fontSize: '0.75rem' }}>CNPJ inválido — verifique os dígitos</span>
            )}
          </CampoGeralGlobal>
        ) : (
          <CampoGeralGlobal label="TIN (documento estrangeiro)">
            <div className="ws-input-icon-wrap">
              <IdentificationCard size={16} />
              <input
                value={form.tin}
                onChange={(e) => setCampo('tin', e.target.value)}
                placeholder="Ex: US-EIN-123456789"
                style={{ width: '100%', borderColor: erro('tin') ? corErro : undefined }}
              />
            </div>
            {erro('tin') && <span style={{ color: corErro, fontSize: '0.75rem' }}>{erro('tin')}</span>}
          </CampoGeralGlobal>
        )}

        {/* ── Endereço ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.4fr 0.9fr', gap: '0.875rem' }}>
          <CampoGeralGlobal label="ESTADO/UF">
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={OPCOES_ESTADOS}
              valor={form.estado || null}
              aoMudarValor={(v) => {
                setForm((prev) => ({ ...prev, estado: String(v ?? ''), cidade: '' }))
              }}
              placeholder="Selecione..."
              buscavel
            />
          </CampoGeralGlobal>
          <CampoGeralGlobal label="CIDADE">
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={cidades}
              valor={form.cidade || null}
              aoMudarValor={(v) => setCampo('cidade', String(v ?? ''))}
              placeholder={form.estado ? 'Selecione a cidade' : 'Selecione o estado...'}
              buscavel
              desabilitado={!form.estado}
              carregando={carregandoCidades}
            />
          </CampoGeralGlobal>
          <CampoGeralGlobal label="CEP / ZIPCODE">
            <input value={form.zipcode} onChange={(e) => setCampo('zipcode', formatarCEP(e.target.value))} placeholder="01000-000" style={{ width: '100%' }} />
          </CampoGeralGlobal>
        </div>

        <CampoGeralGlobal label="ENDEREÇO">
          <input
            value={form.endereco}
            onChange={(e) => setCampo('endereco', e.target.value)}
            placeholder="Rua, número, complemento"
            style={{ width: '100%' }}
          />
        </CampoGeralGlobal>

        {/* ── Contato ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <CampoGeralGlobal label="E-MAIL">
            <div className="ws-input-icon-wrap">
              <EnvelopeSimple size={16} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setCampo('email', e.target.value)}
                placeholder="contato@exemplo.com"
                style={{ width: '100%', borderColor: erro('email') ? corErro : undefined }}
              />
            </div>
            {erro('email') && <span style={{ color: corErro, fontSize: '0.75rem' }}>{erro('email')}</span>}
          </CampoGeralGlobal>
          <CampoGeralGlobal label="TELEFONE">
            <div className="ws-input-icon-wrap">
              <Phone size={16} />
              <input
                value={form.telefone}
                onChange={(e) => setCampo('telefone', formatarTelefone(e.target.value))}
                placeholder="(11) 0000-0000"
                style={{ width: '100%' }}
              />
            </div>
          </CampoGeralGlobal>
        </div>

        <CampoGeralGlobal label="WHATSAPP (E.164)">
          <div className="ws-input-icon-wrap">
            <WhatsappLogo size={16} />
            <input
              value={form.whatsapp}
              onChange={(e) => setCampo('whatsapp', e.target.value)}
              placeholder="(00) 00000-0000"
              style={{ width: '100%', borderColor: erro('whatsapp') ? corErro : undefined }}
            />
          </div>
          {erro('whatsapp') && <span style={{ color: corErro, fontSize: '0.75rem' }}>{erro('whatsapp')}</span>}
        </CampoGeralGlobal>

        {/* ── Papéis operacionais ──────────────────────────────────── */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ws-muted)' }}>
              Tipo de Parceiro *
            </span>
            {!algumaFlagAtiva && (
              <span style={{ fontSize: '0.75rem', color: corErro }}>
                marque ao menos um
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {PAPEIS.map((p) => (
              <PapelCheckbox
                key={p.chave}
                papel={p}
                marcado={form.papeis[p.chave]}
                onToggle={() => togglePapel(p.chave)}
              />
            ))}
          </div>
        </div>

        {/* ── Banner de requisitos pendentes (componente global) ─────── */}
        <BannerRequisitosGlobal />
      </div>
      </BannerRequisitosContexto>
    </ModalFormularioGlobal>
  )
}

export default ModalEditarEmpresa
