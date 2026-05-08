/**
 * ModalNovoPedido.tsx — Wizard de criação de pedido (2 passos)
 *
 * Passo 1 — Dados do Pedido: tipo, número, exportador, incoterm, moeda, etc.
 * Passo 2 — Itens: lista de itens com part_number, NCM, qtd, valor
 *
 * Usa ModalPassoPassoGlobal (nucleo-global) — padrão Gravity.
 * Edição de pedido existente usa o DrawerPedido (aba Dados / Itens / Transferências).
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Tag, Plus, Trash, Warning } from '@phosphor-icons/react'
import { ModalPassoPassoGlobal, type PassoConfig } from '@nucleo/modal-passo-passo-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { TipoOperacao, PedidoItem, Pedido } from '../shared/types'
import { pedidoApi } from '../shared/api'
import { cadastrosApi, type Empresa, type PapelEmpresaRapido } from '../shared/cadastrosApi'
import { ModalEmpresaCadastroRapido } from './ModalEmpresaCadastroRapido'


// ── Passos — movidos para dentro do componente (dependem de t()) ───────────────

// ── Tipos de formulário ────────────────────────────────────────────────────────

interface PedidoForm {
  tipo_operacao: TipoOperacao
  numero_pedido: string
  // Fase 4 DDD — SUIDs referenciam Empresas no serviço Cadastros.
  // UX (B3): SelectGlobal carrega empresas da organização ao abrir o modal,
  // com atalho "+ Cadastrar nova empresa" que abre ModalEmpresaCadastroRapido,
  // grava no Cadastros e seleciona o SUID retornado.
  suid_importador: string
  suid_exportador: string
  suid_fabricante: string
  incoterm: string
  condicao_pagamento: string
  numero_proforma: string
  numero_invoice: string
  referencia_importador: string
  referencia_exportador: string
  referencia_fabricante: string
  data_emissao_pedido: string
}

interface ItemForm {
  key: string
  part_number: string
  ncm: string
  descricao_item: string
  quantidade_inicial_pedido: string
}

const FORM_VAZIO: PedidoForm = {
  tipo_operacao: 'importacao',
  numero_pedido: '',
  suid_importador: '',
  suid_exportador: '',
  suid_fabricante: '',
  incoterm: 'FOB',
  condicao_pagamento: '',
  numero_proforma: '',
  numero_invoice: '',
  referencia_importador: '',
  referencia_exportador: '',
  referencia_fabricante: '',
  data_emissao_pedido: new Date().toISOString().split('T')[0],
}

const ITEM_VAZIO = (): ItemForm => ({
  key: crypto.randomUUID(),
  part_number: '',
  ncm: '',
  descricao_item: '',
  quantidade_inicial_pedido: '',
})

// ── Opções de select ───────────────────────────────────────────────────────────

const OPCOES_INCOTERM = ['FOB','CIF','EXW','CFR','DDP','DAP','FCA','CPT','CIP','DPU','FAS']
  .map(v => ({ valor: v, rotulo: v }))

// OPCOES_TIPO_OPERACAO e OPCOES_COBERTURA movidos para dentro dos sub-componentes (dependem de t())

// ── Validação frontend ─────────────────────────────────────────────────────────

interface ErrosValidacao {
  geral?: string
  numero_pedido?: string
}

type TFunc = (key: string, opts?: Record<string, unknown>) => string

function validarPasso1(form: PedidoForm, t: TFunc): ErrosValidacao {
  const erros: ErrosValidacao = {}
  if (!form.numero_pedido.trim()) {
    erros.numero_pedido = t('pedido.modal_novo.erro_numero_obrigatorio')
  }
  if (form.data_emissao_pedido) {
    const d = new Date(`${form.data_emissao_pedido}T00:00:00.000Z`)
    if (isNaN(d.getTime())) {
      erros.geral = t('pedido.modal_novo.erro_data_invalida')
    }
  }
  return erros
}

function validarPasso2(_itens: ItemForm[]): ErrosValidacao {
  // Nenhum campo de item é obrigatório no frontend.
  // O backend valida o que for necessário e retorna mensagens de erro claras.
  return {}
}

// ── Tradução de erros da API ───────────────────────────────────────────────────

function traduzirErroApi(err: unknown, t: TFunc): string {
  if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('network'))) {
    return t('pedido.modal_novo.erro_sem_conexao')
  }

  if (!(err instanceof Error)) return t('pedido.modal_novo.erro_inesperado')

  const msg = err.message

  if (msg && !msg.startsWith('HTTP ')) {
    if (msg.toLowerCase().includes('dados invalidos') || msg.toLowerCase().includes('dados inválidos')) {
      // BUG-C (Mand. 08) — preferir mostrar os campos reais com erro vindos do
      // backend (Zod `.flatten().fieldErrors`) em vez do texto genérico.
      const details = (err as Error & { details?: { fieldErrors?: Record<string, unknown> } }).details
      const campos = details?.fieldErrors ? Object.keys(details.fieldErrors) : []
      if (campos.length > 0) {
        return t('pedido.modal_novo.erro_dados_invalidos_campos', { campos: campos.join(', ') })
      }
      return t('pedido.modal_novo.erro_dados_invalidos')
    }
    return msg
  }

  if (msg === 'HTTP 400') return t('pedido.modal_novo.erro_http_400')
  if (msg === 'HTTP 401') return t('pedido.modal_novo.erro_http_401')
  if (msg === 'HTTP 403') return t('pedido.modal_novo.erro_http_403')
  if (msg === 'HTTP 404') return t('pedido.modal_novo.erro_http_404')
  if (msg === 'HTTP 409') return t('pedido.modal_novo.erro_http_409')
  if (msg === 'HTTP 422') return t('pedido.modal_novo.erro_http_422')
  if (msg === 'HTTP 500') return t('pedido.modal_novo.erro_http_500')
  if (msg === 'HTTP 502') return t('pedido.modal_novo.erro_http_502')
  if (msg === 'HTTP 503') return t('pedido.modal_novo.erro_http_503')

  const match = msg.match(/^HTTP (\d+)$/)
  if (match) return t('pedido.modal_novo.erro_http_generico', { code: match[1] })

  return t('pedido.modal_novo.erro_generico', { msg })
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface ModalNovoPedidoProps {
  aberto: boolean
  onFechar: () => void
  onSalvo: (pedido: Pedido) => void
}

// ── Estilos inline ─────────────────────────────────────────────────────────────

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  } as React.CSSProperties,
  gridFull: {
    gridColumn: '1 / -1',
  } as React.CSSProperties,
  campo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  } as React.CSSProperties,
  label: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  input: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  secaoTitulo: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '1rem',
  } as React.CSSProperties,
  erroGeral: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--danger, #ef4444)',
    marginTop: '0.75rem',
    padding: '0.625rem 0.875rem',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,
  itensHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.875rem',
  } as React.CSSProperties,
  itemCard: {
    padding: '0.875rem',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.625rem',
    border: '1px solid transparent',
  } as React.CSSProperties,
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr 2fr 0.8fr auto',
    gap: '0.5rem',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  btnRemover: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '0.375rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    marginTop: '1.25rem',
    transition: 'color 0.15s',
  } as React.CSSProperties,
  inputCompacto: {
    background: 'var(--bg-base)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    padding: '0.375rem 0.5rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  labelCompacto: {
    fontSize: '0.625rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    marginBottom: '0.25rem',
    display: 'block',
  } as React.CSSProperties,
  selectCompacto: {
    background: 'var(--bg-base)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    padding: '0.375rem 0.5rem',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  } as React.CSSProperties,
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ModalNovoPedido({ aberto, onFechar, onSalvo }: ModalNovoPedidoProps) {
  const { t } = useTranslation()
  const [passo, setPasso]       = useState(1)
  const [form, setForm]         = useState<PedidoForm>(FORM_VAZIO)
  const [itens, setItens]       = useState<ItemForm[]>([ITEM_VAZIO()])
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros]       = useState<ErrosValidacao>({})
  const { addNotification } = useShellStore()

  // ── Empresas (B3) — pré-carrega ao abrir e refresh quando cria nova ────────
  const [empresas, setEmpresas]                       = useState<Empresa[]>([])
  const [carregandoEmpresas, setCarregandoEmpresas]   = useState(false)
  const [cadastroEmpresaPapel, setCadastroEmpresaPapel] = useState<PapelEmpresaRapido | null>(null)

  useEffect(() => {
    if (!aberto) return
    let cancelado = false
    setCarregandoEmpresas(true)
    cadastrosApi
      .listarEmpresas()
      .then((resp) => {
        if (!cancelado) setEmpresas(resp.itens.filter((e) => e.ativo_empresa))
      })
      .catch(() => {
        // Falha silenciosa só na pré-carga (o usuário ainda pode cadastrar
        // nova empresa pelo atalho — esse fluxo trata erro com mensagem).
        if (!cancelado) setEmpresas([])
      })
      .finally(() => {
        if (!cancelado) setCarregandoEmpresas(false)
      })
    return () => {
      cancelado = true
    }
  }, [aberto])

  // Monta opções do SelectGlobal para um papel.
  // Empresas com o papel marcado aparecem primeiro; demais ficam visíveis com
  // descrição informativa (não bloqueia escolha — apenas alerta UX).
  function opcoesEmpresaPara(papel: PapelEmpresaRapido) {
    const papelKey =
      papel === 'importador' ? 'pode_ser_importador_empresa'
      : papel === 'exportador' ? 'pode_ser_exportador_empresa'
      : 'pode_ser_fabricante_empresa'
    const aptas = empresas.filter((e) => e[papelKey])
    const outras = empresas.filter((e) => !e[papelKey])
    return [
      ...aptas.map((e) => ({
        valor: e.suid_empresa,
        rotulo: `${e.nome_empresa} (${e.pais_empresa})`,
      })),
      ...outras.map((e) => ({
        valor: e.suid_empresa,
        rotulo: `${e.nome_empresa} (${e.pais_empresa})`,
        descricao: t('pedido.cadastro_empresa.papel_nao_marcado'),
      })),
    ]
  }

  function aoCriarEmpresa(empresa: Empresa) {
    setEmpresas((prev) => [empresa, ...prev.filter((e) => e.suid_empresa !== empresa.suid_empresa)])
    if (cadastroEmpresaPapel === 'importador') set('suid_importador', empresa.suid_empresa)
    if (cadastroEmpresaPapel === 'exportador') set('suid_exportador', empresa.suid_empresa)
    if (cadastroEmpresaPapel === 'fabricante') set('suid_fabricante', empresa.suid_empresa)
    setCadastroEmpresaPapel(null)
  }

  const PASSOS = useMemo<PassoConfig[]>(() => [
    { id: 1, label: t('pedido.modal_novo.passo_dados'), icone: <Package size={14} weight="duotone" /> },
    { id: 2, label: t('pedido.modal_novo.passo_itens'), icone: <Tag size={14} weight="duotone" /> },
  ], [t])

  // Bloqueia fechar enquanto está salvando (evita pedido duplicado)
  const handleFechar = useCallback(() => {
    if (salvando) return
    setPasso(1)
    setForm(FORM_VAZIO)
    setItens([ITEM_VAZIO()])
    setErros({})
    onFechar()
  }, [onFechar, salvando])

  function set(campo: keyof PedidoForm, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    // Limpar erro do campo ao editar
    if (campo === 'numero_pedido' && erros.numero_pedido) {
      setErros(prev => ({ ...prev, numero_pedido: undefined }))
    }
  }

  function setItem(index: number, campo: keyof ItemForm, valor: string) {
    setItens(prev => prev.map((it, i) => i === index ? { ...it, [campo]: valor } : it))
  }

  function adicionarItem() {
    setItens(prev => [...prev, ITEM_VAZIO()])
  }

  function removerItem(index: number) {
    if (itens.length <= 1) return
    setItens(prev => prev.filter((_, i) => i !== index))
  }

  // Passo 1 → só exige número do pedido para avançar
  // Passo 2 → sem obrigatoriedade, sempre pode criar
  const podeAvancar = passo === 1
    ? form.numero_pedido.trim() !== ''
    : true

  async function handleProximo() {
    if (passo === 1) {
      // Validar passo 1 antes de avançar
      const errosPasso1 = validarPasso1(form, t)
      if (Object.keys(errosPasso1).length > 0) {
        setErros(errosPasso1)
        return
      }
      setErros({})
      setPasso(2)
      return
    }

    // Passo 2 → validar antes de salvar
    const errosPasso2 = validarPasso2(itens)
    if (Object.keys(errosPasso2).length > 0) {
      setErros(errosPasso2)
      return
    }

    setSalvando(true)
    setErros({})
    try {
      const itensMapped = itens
        .filter(it => it.part_number.trim() !== '' || it.descricao_item.trim() !== '' || it.ncm.trim() !== '' || it.quantidade_inicial_pedido.trim() !== '')
        .map(it => ({
          part_number: it.part_number,
          ncm: it.ncm,
          descricao_item: it.descricao_item,
          quantidade_inicial_pedido: parseFloat(it.quantidade_inicial_pedido) || 0,
        }))

      // Converter data para ISO 8601 completo (z.string().datetime() no backend)
      const dataISO = form.data_emissao_pedido
        ? new Date(`${form.data_emissao_pedido}T00:00:00.000Z`).toISOString()
        : undefined

      // Converter strings vazias para null nos campos opcionais
      const formLimpo = Object.fromEntries(
        Object.entries(form).map(([k, v]) =>
          k === 'tipo_operacao' || k === 'numero_pedido'
            ? [k, v]
            : [k, typeof v === 'string' && v.trim() === '' ? null : v]
        )
      )

      const payload = {
        ...formLimpo,
        data_emissao_pedido: dataISO,
        itens: itensMapped as PedidoItem[],
      }

      const resultado = await pedidoApi.criar(payload)
      addNotification({
        type: 'success',
        message: `Pedido ${resultado.numero_pedido} criado com sucesso.`,
      })
      onSalvo(resultado)
      handleFechar()
    } catch (err: unknown) {
      console.error('[ModalNovoPedido] erro ao criar pedido:', err)
      const msg = traduzirErroApi(err, t)
      setErros({ geral: msg })
      addNotification({ type: 'error', message: msg })
    } finally {
      setSalvando(false)
    }
  }

  function handleVoltar() {
    if (salvando) return
    if (passo > 1) { setPasso(p => p - 1); setErros({}) }
    else handleFechar()
  }

  return (
    <>
      <ModalPassoPassoGlobal
        titulo={t('pedido.modal_novo.titulo')}
        aberto={aberto}
        passos={PASSOS}
        passoAtual={passo}
        onProximo={handleProximo}
        onVoltar={handleVoltar}
        onFechar={handleFechar}
        podeAvancar={podeAvancar && !salvando}
        labelBotaoFinal={salvando ? t('pedido.modal_novo.criando') : t('pedido.modal_novo.criar')}
        tamanho="lg"
        altura="620px"
      >
        {passo === 1 && (
          <Passo1Dados
            form={form}
            erros={erros}
            onChange={set}
            opcoesImportador={opcoesEmpresaPara('importador')}
            opcoesExportador={opcoesEmpresaPara('exportador')}
            opcoesFabricante={opcoesEmpresaPara('fabricante')}
            carregandoEmpresas={carregandoEmpresas}
            aoCadastrarNova={(papel) => setCadastroEmpresaPapel(papel)}
          />
        )}
        {passo === 2 && (
          <Passo2Itens
            itens={itens}
            erros={erros}
            onAdicionarItem={adicionarItem}
            onRemoverItem={removerItem}
            onChangeItem={setItem}
          />
        )}
      </ModalPassoPassoGlobal>
      {/* Modal cascateado para cadastro rápido de Empresa via Cadastros API */}
      <ModalEmpresaCadastroRapido
        aberto={cadastroEmpresaPapel !== null}
        papel={cadastroEmpresaPapel ?? 'exportador'}
        onFechar={() => setCadastroEmpresaPapel(null)}
        onCriado={aoCriarEmpresa}
      />
    </>
  )
}

// ── Passo 1 — Dados do Pedido ──────────────────────────────────────────────────

interface OpcaoEmpresaSelect {
  valor: string
  rotulo: string
  descricao?: string
}

/**
 * Campo composto: label-row com texto à esquerda e link "+ Nova" à direita,
 * seguido do SelectGlobal sem label (para evitar duplicação visual).
 * Foi extraído para encapsular o atalho "+ Cadastrar nova" — o click é direto
 * em <button> regular, sem depender de injeção de opção no SelectGlobal.
 */
function CampoEmpresaSelect({
  label,
  opcoes,
  valor,
  carregando,
  onSelecionar,
  onCadastrarNova,
  labelNova,
  placeholder,
}: {
  label: string
  opcoes: OpcaoEmpresaSelect[]
  valor: string | null
  carregando: boolean
  onSelecionar: (v: string | number | null) => void
  onCadastrarNova: () => void
  labelNova: string
  placeholder: string
}) {
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
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #94a3b8)',
          }}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onCadastrarNova()
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ws-accent, #818cf8)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'
          }}
        >
          {labelNova}
        </button>
      </div>
      <SelectGlobal
        opcoes={opcoes}
        valor={valor}
        aoMudarValor={onSelecionar}
        buscavel
        carregando={carregando}
        placeholder={placeholder}
      />
    </div>
  )
}

function Passo1Dados({
  form,
  erros,
  onChange,
  opcoesImportador,
  opcoesExportador,
  opcoesFabricante,
  carregandoEmpresas,
  aoCadastrarNova,
}: {
  form: PedidoForm
  erros: ErrosValidacao
  onChange: (campo: keyof PedidoForm, valor: string) => void
  opcoesImportador: OpcaoEmpresaSelect[]
  opcoesExportador: OpcaoEmpresaSelect[]
  opcoesFabricante: OpcaoEmpresaSelect[]
  carregandoEmpresas: boolean
  aoCadastrarNova: (papel: PapelEmpresaRapido) => void
}) {
  const { t } = useTranslation()
  const opcoesTipoOperacao = useMemo(() => [
    { valor: 'importacao', rotulo: t('pedido.modal_novo.opt_importacao') },
    { valor: 'exportacao', rotulo: t('pedido.modal_novo.opt_exportacao') },
  ], [t])

  return (
    <div>
      <p style={s.secaoTitulo}>{t('pedido.modal_novo.passo_dados')}</p>
      <div style={s.grid}>
        <div style={s.campo}>
          <SelectGlobal
            label={t('pedido.drawer.label_tipo_op')}
            opcoes={opcoesTipoOperacao}
            valor={form.tipo_operacao}
            aoMudarValor={v => onChange('tipo_operacao', String(v ?? 'importacao'))}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-numero-pedido">{t('pedido.drawer.label_numero')}</label>
          <input
            id="mnp-numero-pedido"
            style={{
              ...s.input,
              ...(erros.numero_pedido ? { borderColor: 'var(--danger, #ef4444)' } : {}),
            }}
            value={form.numero_pedido}
            onChange={e => onChange('numero_pedido', e.target.value)}
            placeholder={t('pedido.drawer.ph_numero')}
            aria-invalid={Boolean(erros.numero_pedido)}
          />
          {erros.numero_pedido && (
            <span
              style={{ fontSize: '0.6875rem', color: 'var(--danger, #ef4444)', marginTop: '0.125rem' }}
              role="alert"
            >
              {erros.numero_pedido}
            </span>
          )}
        </div>
        {/* B3 — SelectGlobal carrega empresas do Cadastros. Atalho discreto
            "+ Nova" como link inline no header da label, à direita. */}
        {form.tipo_operacao === 'importacao' && (
          <div style={s.campo}>
            <CampoEmpresaSelect
              label={t('pedido.drawer.label_exportador')}
              opcoes={opcoesExportador}
              valor={form.suid_exportador || null}
              carregando={carregandoEmpresas}
              onSelecionar={(v) => onChange('suid_exportador', String(v ?? ''))}
              onCadastrarNova={() => aoCadastrarNova('exportador')}
              labelNova={t('pedido.cadastro_empresa.cadastrar_nova_curto')}
              placeholder={t('pedido.cadastro_empresa.ph_select_empresa_curto')}
            />
          </div>
        )}
        {form.tipo_operacao === 'exportacao' && (
          <div style={s.campo}>
            <CampoEmpresaSelect
              label={t('pedido.drawer.label_importador', 'Importador')}
              opcoes={opcoesImportador}
              valor={form.suid_importador || null}
              carregando={carregandoEmpresas}
              onSelecionar={(v) => onChange('suid_importador', String(v ?? ''))}
              onCadastrarNova={() => aoCadastrarNova('importador')}
              labelNova={t('pedido.cadastro_empresa.cadastrar_nova_curto')}
              placeholder={t('pedido.cadastro_empresa.ph_select_empresa_curto')}
            />
          </div>
        )}
        <div style={s.campo}>
          <CampoEmpresaSelect
            label={t('pedido.drawer.label_fabricante')}
            opcoes={opcoesFabricante}
            valor={form.suid_fabricante || null}
            carregando={carregandoEmpresas}
            onSelecionar={(v) => onChange('suid_fabricante', String(v ?? ''))}
            onCadastrarNova={() => aoCadastrarNova('fabricante')}
            labelNova={t('pedido.cadastro_empresa.cadastrar_nova_curto')}
            placeholder={t('pedido.cadastro_empresa.ph_select_empresa_curto')}
          />
        </div>
        <div style={s.campo}>
          <SelectGlobal
            label="Incoterm"
            opcoes={OPCOES_INCOTERM}
            valor={form.incoterm}
            aoMudarValor={v => onChange('incoterm', String(v ?? 'FOB'))}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-pagamento">{t('pedido.drawer.label_cond_pgto')}</label>
          <input
            id="mnp-pagamento"
            style={s.input}
            value={form.condicao_pagamento}
            onChange={e => onChange('condicao_pagamento', e.target.value)}
            placeholder={t('pedido.drawer.ph_cond_pgto')}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-proforma">{t('pedido.drawer.label_num_proforma')}</label>
          <input
            id="mnp-proforma"
            style={s.input}
            value={form.numero_proforma}
            onChange={e => onChange('numero_proforma', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-invoice">{t('pedido.drawer.label_num_invoice')}</label>
          <input
            id="mnp-invoice"
            style={s.input}
            value={form.numero_invoice}
            onChange={e => onChange('numero_invoice', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-imp">{t('pedido.drawer.label_ref_importador')}</label>
          <input
            id="mnp-ref-imp"
            style={s.input}
            value={form.referencia_importador}
            onChange={e => onChange('referencia_importador', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-exp">{t('pedido.drawer.label_ref_exportador')}</label>
          <input
            id="mnp-ref-exp"
            style={s.input}
            value={form.referencia_exportador}
            onChange={e => onChange('referencia_exportador', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-fab">{t('pedido.drawer.label_ref_fabricante')}</label>
          <input
            id="mnp-ref-fab"
            style={s.input}
            value={form.referencia_fabricante}
            onChange={e => onChange('referencia_fabricante', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-data-emissao">{t('pedido.drawer.label_data_emissao')}</label>
          <input
            id="mnp-data-emissao"
            type="date"
            style={s.input}
            value={form.data_emissao_pedido}
            onChange={e => onChange('data_emissao_pedido', e.target.value)}
          />
        </div>
      </div>

      {/* Erros do passo 1 (data inválida ou outros erros gerais) */}
      {erros.geral && (
        <div style={s.erroGeral} role="alert">
          <Warning size={15} weight="fill" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{erros.geral}</span>
        </div>
      )}
    </div>
  )
}

// ── Passo 2 — Itens ────────────────────────────────────────────────────────────

function Passo2Itens({
  itens,
  erros,
  onAdicionarItem,
  onRemoverItem,
  onChangeItem,
}: {
  itens: ItemForm[]
  erros: ErrosValidacao
  onAdicionarItem: () => void
  onRemoverItem: (index: number) => void
  onChangeItem: (index: number, campo: keyof ItemForm, valor: string) => void
}) {
  const { t } = useTranslation()

  return (
    <div>
      <div style={s.itensHeader}>
        <p style={{ ...s.secaoTitulo, marginBottom: 0 }}>
          {t('pedido.drawer.secao_itens', { count: itens.length })}
        </p>
        <BotaoGlobal
          variante="secundario"
          tamanho="pequeno"
          icone={<Plus size={12} weight="bold" />}
          onClick={onAdicionarItem}
        >
          {t('pedido.drawer.adicionar_item')}
        </BotaoGlobal>
      </div>

      {itens.map((item, index) => (
        <div key={item.key} style={s.itemCard}>
          <div style={s.itemGrid}>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-pn-${index}`}>{t('pedido.campos.part_number')}</label>
              <input
                id={`mnp-pn-${index}`}
                style={s.inputCompacto}
                value={item.part_number}
                onChange={e => onChangeItem(index, 'part_number', e.target.value)}
                placeholder={t('pedido.modal_novo.ph_sku')}
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-ncm-${index}`}>{t('pedido.campos.ncm')}</label>
              <input
                id={`mnp-ncm-${index}`}
                style={{ ...s.inputCompacto, fontFamily: 'monospace' }}
                value={item.ncm}
                onChange={e => onChangeItem(index, 'ncm', e.target.value)}
                placeholder="0000.00.00"
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-desc-${index}`}>{t('pedido.drawer.label_descricao')}</label>
              <input
                id={`mnp-desc-${index}`}
                style={s.inputCompacto}
                value={item.descricao_item}
                onChange={e => onChangeItem(index, 'descricao_item', e.target.value)}
                placeholder={t('pedido.campos.descricao_item')}
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-qty-${index}`}>{t('pedido.drawer.label_qtd')}</label>
              <input
                id={`mnp-qty-${index}`}
                type="number"
                style={{ ...s.inputCompacto, textAlign: 'right' }}
                value={item.quantidade_inicial_pedido}
                onChange={e => onChangeItem(index, 'quantidade_inicial_pedido', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <button
              style={s.btnRemover}
              onClick={() => onRemoverItem(index)}
              disabled={itens.length <= 1}
              title={itens.length <= 1 ? t('pedido.modal_novo.remover_unico_hint') : t('pedido.modal_novo.remover_item_hint')}
              aria-label={t('pedido.modal_novo.remover_item_aria', { n: index + 1 })}
              type="button"
            >
              <Trash size={14} weight="duotone" />
            </button>
          </div>
        </div>
      ))}

      {/* Erro retornado pela API */}
      {erros.geral && (
        <div style={s.erroGeral} role="alert">
          <Warning size={15} weight="fill" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{erros.geral}</span>
        </div>
      )}
    </div>
  )
}
