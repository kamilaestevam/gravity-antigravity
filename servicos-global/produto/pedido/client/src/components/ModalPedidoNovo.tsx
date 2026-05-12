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
import { Package, Tag, Plus, Trash, Warning, Lock, Info } from '@phosphor-icons/react'
import { ModalPassoPassoGlobal, type PassoConfig } from '@nucleo/modal-passo-passo-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { CampoDecimalGlobal } from '@nucleo/campo-decimal-global'
import { BannerRequisitosGlobal, type RequisitoSalvar } from '@nucleo/banner-requisitos-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { TipoOperacao, PedidoItem, Pedido } from '../shared/types'
import { pedidoApi } from '../shared/api'
import { cadastrosApi, type Empresa, type PapelEmpresaRapido } from '../shared/cadastrosApi'
import { ModalEmpresaCadastroRapido } from './ModalEmpresaCadastroRapido'


// ── Passos — movidos para dentro do componente (dependem de t()) ───────────────

// ── Tipos de formulário ────────────────────────────────────────────────────────

// Form types — Mandamento 03: nomenclatura DDD pura.
interface PedidoForm {
  tipo_operacao_pedido: TipoOperacao
  numero_pedido: string
  // SUIDs referenciam Empresas no serviço Cadastros (snapshot)
  suid_importador: string
  suid_exportador: string
  suid_fabricante: string
  incoterm_pedido: string
  condicao_pagamento_pedido: string
  numero_proforma_pedido: string
  numero_invoice_pedido: string
  referencia_importador_pedido: string
  referencia_exportador_pedido: string
  referencia_fabricante_pedido: string
  data_emissao_pedido: string
}

interface ItemForm {
  key: string
  part_number_item: string
  ncm_item: string
  descricao_item: string
  quantidade_inicial_item: string
}

const FORM_VAZIO: PedidoForm = {
  tipo_operacao_pedido: 'importacao',
  numero_pedido: '',
  suid_importador: '',
  suid_exportador: '',
  suid_fabricante: '',
  incoterm_pedido: '',  // sem default — usuário escolhe (Mandamento 08)
  condicao_pagamento_pedido: '',
  numero_proforma_pedido: '',
  numero_invoice_pedido: '',
  referencia_importador_pedido: '',
  referencia_exportador_pedido: '',
  referencia_fabricante_pedido: '',
  data_emissao_pedido: new Date().toISOString().split('T')[0],
}

const ITEM_VAZIO = (): ItemForm => ({
  key: crypto.randomUUID(),
  part_number_item: '',
  ncm_item: '',
  descricao_item: '',
  quantidade_inicial_item: '',
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

// ── Formatadores ───────────────────────────────────────────────────────────────

/**
 * Normaliza entrada de NCM para o padrão "XXXX.XX.XX" (8 dígitos com pontos).
 * Aceita: "22021000", "2202.10.00", "2202-10-00", "2202 10 00" etc.
 * Devolve: "2202.10.00" (até 8 dígitos com pontos automáticos).
 */
function formatarNcmInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 4)      return digits
  if (digits.length <= 6)      return `${digits.slice(0, 4)}.${digits.slice(4)}`
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
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
  // (Bloco "PARA AVANÇAR, AINDA FALTA" agora vem do BannerRequisitosGlobal —
  // styles removidos. CSS oficial em @nucleo/banner-requisitos-global.)
  asteriscoObrigatorio: {
    color: 'var(--danger, #ef4444)',
    fontWeight: 700,
    marginLeft: '0.125rem',
  } as React.CSSProperties,
  legendaObrigatorios: {
    marginTop: '0.5rem',
    fontSize: '0.6875rem',
    color: 'var(--text-muted, #94a3b8)',
    fontStyle: 'italic' as const,
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

  // ── Empresa-da-organização (auto-preenchida no lado correspondente) ───────
  // Regra: em IMPORTACAO a Empresa-da-Org é o IMPORTADOR; em EXPORTACAO é o
  // EXPORTADOR. O outro lado (contraparte) o usuário escolhe/cadastra.
  const [empresaDaOrg, setEmpresaDaOrg]               = useState<Empresa | null>(null)
  const [carregandoEmpresaDaOrg, setCarregandoEmpresaDaOrg] = useState(false)
  const [erroEmpresaDaOrg, setErroEmpresaDaOrg]       = useState<string | null>(null)

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

  // Carrega empresa-da-org ao abrir o modal — Mand. 08 (sem fallback silencioso):
  // erro 404 sobe para a UI exibir mensagem clara.
  useEffect(() => {
    if (!aberto) return
    let cancelado = false
    setCarregandoEmpresaDaOrg(true)
    setErroEmpresaDaOrg(null)
    cadastrosApi
      .obterEmpresaDaOrganizacao()
      .then((emp) => {
        if (!cancelado) setEmpresaDaOrg(emp)
      })
      .catch((err: unknown) => {
        if (cancelado) return
        const msg =
          err instanceof Error ? err.message : t('pedido.modal_novo.erro_inesperado')
        setErroEmpresaDaOrg(msg)
        setEmpresaDaOrg(null)
      })
      .finally(() => {
        if (!cancelado) setCarregandoEmpresaDaOrg(false)
      })
    return () => {
      cancelado = true
    }
  }, [aberto, t])

  // Auto-fill do lado-da-organização sempre que tipo_operacao OU empresa-da-org mudar.
  // O outro lado (contraparte) é mantido — usuário pode estar trocando só o tipo.
  useEffect(() => {
    if (!empresaDaOrg) return
    setForm((prev) => {
      if (prev.tipo_operacao_pedido === 'importacao') {
        return {
          ...prev,
          suid_importador: empresaDaOrg.suid_empresa,
          // Limpa exportador antigo se ele apontava para a empresa-da-org
          // (por ex. mudou de exportacao→importacao e ficou inconsistente)
          suid_exportador: prev.suid_exportador === empresaDaOrg.suid_empresa ? '' : prev.suid_exportador,
        }
      }
      return {
        ...prev,
        suid_exportador: empresaDaOrg.suid_empresa,
        suid_importador: prev.suid_importador === empresaDaOrg.suid_empresa ? '' : prev.suid_importador,
      }
    })
  }, [form.tipo_operacao_pedido, empresaDaOrg])

  // Monta opções do SelectGlobal para um papel.
  // Lista APENAS empresas com o papel marcado em Cadastros — quem não tem
  // o flag não aparece (UX exigida pelo dono: a lista de "Exportador" só
  // pode trazer exportadores, e assim por diante). Para cadastrar novas
  // o usuário usa o atalho "+ Nova" que abre o cascade modal.
  function opcoesEmpresaPara(papel: PapelEmpresaRapido) {
    const papelKey =
      papel === 'importador' ? 'pode_ser_importador_empresa'
      : papel === 'exportador' ? 'pode_ser_exportador_empresa'
      : 'pode_ser_fabricante_empresa'
    return empresas
      .filter((e) => e[papelKey])
      .map((e) => ({
        valor: e.suid_empresa,
        rotulo: `${e.nome_empresa} (${e.pais_empresa})`,
      }))
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

  // ── Pendências do passo 1 ─────────────────────────────────────────────────
  // Lista as obrigatoriedades que ainda faltam preencher para o user avançar.
  // Cada item vira uma linha no bloco "PARA AVANÇAR, AINDA FALTA" — UX
  // espelhada do modal de Cadastros (Razão social + funções habilitadas).
  // Ordem segue a leitura do formulário (top-down).
  // Helper: dado um SUID selecionado, retorna:
  //   - null               → SUID vazio ou empresa não encontrada
  //   - {tipo:'pais_br'}   → empresa BR num slot que deve ser estrangeiro (contraparte de IMP/EXP)
  //   - {tipo:'sem_cnpj'}  → empresa BR sem CNPJ (identidade fiscal incompleta)
  //   - {tipo:'ok'}        → tudo certo (inclui empresa estrangeira mesmo sem TIN — TIN é opcional)
  //
  // Regra de produto: TIN de contraparte estrangeira NÃO é obrigatório.
  // A empresa pode existir só com nome/país, e o pedido é gerado mesmo
  // sem TIN (snapshot do backend aceita documento nulo). CNPJ de empresa
  // BR continua sendo obrigatório porque é a própria identidade legal.
  // Mandamento 08: estados explícitos; sem auto-clean silencioso.
  type DiagnosticoEmpresa =
    | { tipo: 'ok'; nome: string }
    | { tipo: 'pais_br'; nome: string }
    | { tipo: 'sem_cnpj'; nome: string }
  function diagnosticarEmpresa(suid: string, esperaEstrangeira: boolean): DiagnosticoEmpresa | null {
    if (!suid) return null
    const e = empresas.find((x) => x.suid_empresa === suid)
    if (!e) return null
    if (esperaEstrangeira && e.pais_empresa === 'BR') {
      return { tipo: 'pais_br', nome: e.nome_empresa }
    }
    if (e.pais_empresa === 'BR' && (!e.cnpj_empresa || !e.cnpj_empresa.trim())) {
      return { tipo: 'sem_cnpj', nome: e.nome_empresa }
    }
    return { tipo: 'ok', nome: e.nome_empresa }
  }

  const exportadorDiag = form.tipo_operacao_pedido === 'importacao'
    ? diagnosticarEmpresa(form.suid_exportador, true)  // contraparte → estrangeira
    : null
  const importadorDiag = form.tipo_operacao_pedido === 'exportacao'
    ? diagnosticarEmpresa(form.suid_importador, true)  // contraparte → estrangeira
    : null
  const fabricanteDiag = diagnosticarEmpresa(form.suid_fabricante, false)  // fabricante flexível

  function mensagemDiag(diag: DiagnosticoEmpresa | null, papel: 'exportador' | 'importador' | 'fabricante'): string {
    if (!diag || diag.tipo === 'ok') return ''
    if (diag.tipo === 'pais_br') {
      return t('pedido.modal_novo.contraparte_pais_br', { nome: diag.nome, papel: t(`pedido.cadastro_empresa.papel_${papel}`).toLowerCase() })
    }
    return t('pedido.modal_novo.empresa_br_sem_cnpj', { nome: diag.nome })
  }

  // Lista canônica de requisitos do Passo 1 — feed do BannerRequisitosGlobal.
  // Cada item tem chave estável (usada também como id de campo), `ok` (atendido?)
  // e mensagem PT-BR/i18n. A regra "obrigatório vazio = vermelho" no
  // CampoGeralGlobal recebe `vazio={!ok}` derivado dessa mesma fonte.
  const requisitosPasso1 = useMemo<RequisitoSalvar[]>(() => [
    {
      chave: 'empresa_da_org',
      ok: !carregandoEmpresaDaOrg && !!empresaDaOrg,
      mensagem: carregandoEmpresaDaOrg
        ? t('pedido.modal_novo.falta_empresa_da_org_carregando')
        : t('pedido.modal_novo.falta_empresa_da_org'),
    },
    {
      chave: 'numero_pedido',
      ok: form.numero_pedido.trim().length > 0,
      mensagem: t('pedido.modal_novo.falta_numero_pedido'),
    },
    {
      chave: 'suid_exportador',
      ok: form.tipo_operacao_pedido !== 'importacao' || !!form.suid_exportador,
      mensagem: t('pedido.modal_novo.falta_exportador'),
    },
    {
      chave: 'suid_importador',
      ok: form.tipo_operacao_pedido !== 'exportacao' || !!form.suid_importador,
      mensagem: t('pedido.modal_novo.falta_importador'),
    },
    {
      chave: 'data_emissao_pedido',
      ok: !form.data_emissao_pedido
        ? false
        : !isNaN(new Date(`${form.data_emissao_pedido}T00:00:00.000Z`).getTime()),
      mensagem: !form.data_emissao_pedido
        ? t('pedido.modal_novo.falta_data_emissao')
        : t('pedido.modal_novo.falta_data_emissao_valida'),
    },
    // Validação de país e documento das contrapartes selecionadas. Cada slot
    // só entra na lista se o usuário JÁ selecionou uma empresa — evita ruído
    // antes da escolha. Distingue dois problemas:
    //   - país inválido (BR em slot estrangeiro) → mensagem educativa
    //   - documento ausente (CNPJ/TIN) → mensagem direta
    // Mandamento 08: cada problema vem com nome da empresa e ação clara.
    {
      chave: 'empresa_exportador',
      ok: !exportadorDiag || exportadorDiag.tipo === 'ok',
      mensagem: mensagemDiag(exportadorDiag, 'exportador'),
    },
    {
      chave: 'empresa_importador',
      ok: !importadorDiag || importadorDiag.tipo === 'ok',
      mensagem: mensagemDiag(importadorDiag, 'importador'),
    },
    {
      chave: 'empresa_fabricante',
      ok: !fabricanteDiag || fabricanteDiag.tipo === 'ok',
      mensagem: mensagemDiag(fabricanteDiag, 'fabricante'),
    },
  ], [form.numero_pedido, form.tipo_operacao_pedido, form.suid_exportador, form.suid_importador, form.suid_fabricante, form.data_emissao_pedido, empresaDaOrg, carregandoEmpresaDaOrg, exportadorDiag, importadorDiag, fabricanteDiag, t])

  // Helper: mapa chave→ok pra consultas O(1) ao montar `vazio` em CampoGeralGlobal.
  const requisitoOk = useMemo(
    () => new Map(requisitosPasso1.map((r) => [r.chave, r.ok])),
    [requisitosPasso1],
  )

  // Passo 1 → libera quando todos requisitos estão atendidos
  // Passo 2 → sem obrigatoriedade, sempre pode criar
  const podeAvancar = passo === 1
    ? requisitosPasso1.every((r) => r.ok)
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
        .filter(it => it.part_number_item.trim() !== '' || it.descricao_item.trim() !== '' || it.ncm_item.trim() !== '' || it.quantidade_inicial_item.trim() !== '')
        .map(it => ({
          part_number_item:        it.part_number_item,
          ncm_item:                it.ncm_item,
          descricao_item:          it.descricao_item,
          quantidade_inicial_item: parseFloat(it.quantidade_inicial_item) || 0,
        }))

      // Converter data para ISO 8601 completo (z.string().datetime() no backend)
      const dataISO = form.data_emissao_pedido
        ? new Date(`${form.data_emissao_pedido}T00:00:00.000Z`).toISOString()
        : undefined

      // Converter strings vazias para null nos campos opcionais
      const formLimpo = Object.fromEntries(
        Object.entries(form).map(([k, v]) =>
          k === 'tipo_operacao_pedido' || k === 'numero_pedido'
            ? [k, v]
            : [k, typeof v === 'string' && v.trim() === '' ? null : v]
        )
      )

      const payload = {
        ...formLimpo,
        data_emissao_pedido: dataISO,
        itens: itensMapped as unknown as PedidoItem[],
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
            empresas={empresas}
            opcoesImportador={opcoesEmpresaPara('importador')}
            opcoesExportador={opcoesEmpresaPara('exportador')}
            opcoesFabricante={opcoesEmpresaPara('fabricante')}
            carregandoEmpresas={carregandoEmpresas}
            empresaDaOrg={empresaDaOrg}
            carregandoEmpresaDaOrg={carregandoEmpresaDaOrg}
            erroEmpresaDaOrg={erroEmpresaDaOrg}
            requisitos={requisitosPasso1}
            requisitoOk={requisitoOk}
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
      {/* Modal cascateado para cadastro rápido de Empresa via Cadastros API.
          Regra de negócio: empresas estrangeiras NÃO podem ser BR.
            - Importação: Exportador (contraparte) + Fabricante (produz fora) = estrangeiros
            - Exportação: Importador (contraparte) = estrangeiro; Fabricante = BR
              (já que estamos exportando produção nacional)
          forcarEstrangeiro=true bloqueia BR na lista de países. */}
      <ModalEmpresaCadastroRapido
        aberto={cadastroEmpresaPapel !== null}
        papel={cadastroEmpresaPapel ?? 'exportador'}
        forcarEstrangeiro={
          (cadastroEmpresaPapel === 'exportador' && form.tipo_operacao_pedido === 'importacao') ||
          (cadastroEmpresaPapel === 'importador' && form.tipo_operacao_pedido === 'exportacao') ||
          (cadastroEmpresaPapel === 'fabricante' && form.tipo_operacao_pedido === 'importacao')
        }
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
  desabilitado,
  onSelecionar,
  onCadastrarNova,
  labelNova,
  placeholder,
  invalido,
}: {
  label: string
  opcoes: OpcaoEmpresaSelect[]
  valor: string | null
  carregando: boolean
  desabilitado?: boolean
  onSelecionar: (v: string | number | null) => void
  onCadastrarNova: () => void
  labelNova: string
  placeholder: string
  invalido?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', opacity: desabilitado ? 0.5 : 1 }}>
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
          disabled={desabilitado}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (desabilitado) return
            onCadastrarNova()
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: desabilitado ? 'var(--text-muted)' : 'var(--ws-accent, #818cf8)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            padding: 0,
            cursor: desabilitado ? 'not-allowed' : 'pointer',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            if (!desabilitado) (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'
          }}
        >
          {labelNova}
        </button>
      </div>
      <div
        style={
          invalido && !desabilitado
            ? {
                borderRadius: 'var(--radius-md)',
                outline: '1px solid var(--danger, #ef4444)',
                outlineOffset: '-1px',
              }
            : undefined
        }
      >
        <SelectGlobal
          opcoes={opcoes}
          valor={valor}
          aoMudarValor={onSelecionar}
          buscavel
          carregando={carregando}
          desabilitado={desabilitado}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

/**
 * Campo readonly mostrando a Empresa-da-Organização auto-preenchida no lado
 * correspondente ao tipo_operacao (Importador em IMPORTACAO, Exportador em
 * EXPORTACAO). Inclui ícone de cadeado e tooltip explicando a regra.
 */
function CampoEmpresaDaOrg({
  label,
  empresa,
  carregando,
  tooltipTexto,
}: {
  label: string
  empresa: Empresa | null
  carregando: boolean
  tooltipTexto: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
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
        <span title={tooltipTexto} style={{ display: 'inline-flex', cursor: 'help', color: 'var(--text-muted, #94a3b8)' }}>
          <Info size={12} weight="duotone" />
        </span>
      </div>
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minHeight: '2.25rem',
        }}
      >
        <Lock size={14} weight="duotone" style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
        <span style={{ flex: 1, color: empresa ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {carregando
            ? '…'
            : empresa
            ? `${empresa.nome_empresa}${empresa.cnpj_empresa ? ` — ${empresa.cnpj_empresa}` : ''}`
            : '—'}
        </span>
      </div>
    </div>
  )
}

function Passo1Dados({
  form,
  erros,
  onChange,
  empresas,
  opcoesImportador,
  opcoesExportador,
  opcoesFabricante,
  carregandoEmpresas,
  empresaDaOrg,
  carregandoEmpresaDaOrg,
  erroEmpresaDaOrg,
  requisitos,
  requisitoOk,
  aoCadastrarNova,
}: {
  form: PedidoForm
  erros: ErrosValidacao
  onChange: (campo: keyof PedidoForm, valor: string) => void
  empresas: Empresa[]
  opcoesImportador: OpcaoEmpresaSelect[]
  opcoesExportador: OpcaoEmpresaSelect[]
  opcoesFabricante: OpcaoEmpresaSelect[]
  carregandoEmpresas: boolean
  empresaDaOrg: Empresa | null
  carregandoEmpresaDaOrg: boolean
  erroEmpresaDaOrg: string | null
  requisitos: RequisitoSalvar[]
  requisitoOk: Map<string, boolean>
  aoCadastrarNova: (papel: PapelEmpresaRapido) => void
}) {
  const { t } = useTranslation()
  const opcoesTipoOperacao = useMemo(() => [
    { valor: 'importacao', rotulo: t('pedido.modal_novo.opt_importacao') },
    { valor: 'exportacao', rotulo: t('pedido.modal_novo.opt_exportacao') },
  ], [t])

  // Demais campos só liberam após carregar a empresa-da-org com sucesso.
  // Se erro, mostra alerta e mantém tudo bloqueado (com link para Cadastros).
  const camposBloqueados = !empresaDaOrg

  // Filtra contraparte: 1) NÃO inclui a empresa-da-org (ela já está do outro
  // lado); 2) Em IMPORTAÇÃO o Exportador é estrangeiro — exclui empresas BR
  // (mesmo as legadas que possam estar flagadas como `pode_ser_exportador`).
  // Em EXPORTAÇÃO o Importador é estrangeiro — mesma lógica. Evita o usuário
  // selecionar uma empresa BR que jamais geraria snapshot válido (CNPJ não
  // se aplica e snapshot exige documento por país).
  const suidsBr = useMemo(
    () => new Set(empresas.filter((e) => e.pais_empresa === 'BR').map((e) => e.suid_empresa)),
    [empresas],
  )
  const opcoesContraparteImportador = useMemo(
    () => opcoesImportador
      .filter((o) => o.valor !== empresaDaOrg?.suid_empresa)
      .filter((o) => !suidsBr.has(String(o.valor))),
    [opcoesImportador, empresaDaOrg, suidsBr],
  )
  const opcoesContraparteExportador = useMemo(
    () => opcoesExportador
      .filter((o) => o.valor !== empresaDaOrg?.suid_empresa)
      .filter((o) => !suidsBr.has(String(o.valor))),
    [opcoesExportador, empresaDaOrg, suidsBr],
  )
  // Fabricante em IMPORTAÇÃO é estrangeiro (estamos importando produção feita
  // fora). Em EXPORTAÇÃO o fabricante é BR (produção nacional sendo exportada).
  const opcoesFabricanteFiltrado = useMemo(
    () => form.tipo_operacao_pedido === 'importacao'
      ? opcoesFabricante.filter((o) => !suidsBr.has(String(o.valor)))
      : opcoesFabricante,
    [opcoesFabricante, suidsBr, form.tipo_operacao_pedido],
  )

  return (
    <div>
      <p style={s.secaoTitulo}>{t('pedido.modal_novo.passo_dados')}</p>

      {/* Bloco em destaque: TIPO_OPERACAO em linha cheia, único campo
          inicialmente disponível. Define qual lado é a empresa-da-org. */}
      <div style={{ ...s.grid, marginBottom: '1rem' }}>
        <div style={{ ...s.campo, ...s.gridFull }}>
          <SelectGlobal
            label={`${t('pedido.drawer.label_tipo_op')} *`}
            opcoes={opcoesTipoOperacao}
            valor={form.tipo_operacao_pedido}
            aoMudarValor={v => onChange('tipo_operacao_pedido', String(v ?? 'importacao'))}
          />
        </div>
      </div>

      {/* Erro/loading da empresa-da-org */}
      {erroEmpresaDaOrg && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.625rem 0.875rem',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
          }}
        >
          <Warning size={15} weight="fill" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
          <span>
            {t('pedido.modal_novo.erro_empresa_da_org', { detalhe: erroEmpresaDaOrg })}
          </span>
        </div>
      )}

      {/* Demais campos */}
      <div style={s.grid}>
        <div style={s.campo}>
          <CampoGeralGlobal
            label={t('pedido.drawer.label_numero')}
            obrigatorio
            vazio={!camposBloqueados && requisitoOk.get('numero_pedido') === false}
            erro={erros.numero_pedido}
          >
            <input
              id="mnp-numero-pedido"
              disabled={camposBloqueados}
              style={{
                ...s.input,
                ...(camposBloqueados ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
              }}
              value={form.numero_pedido}
              onChange={e => onChange('numero_pedido', e.target.value)}
              placeholder={t('pedido.drawer.ph_numero')}
              aria-invalid={Boolean(erros.numero_pedido) || (!camposBloqueados && requisitoOk.get('numero_pedido') === false)}
            />
          </CampoGeralGlobal>
        </div>
        {/* IMPORTAÇÃO: lado-da-org = IMPORTADOR (auto), contraparte = EXPORTADOR */}
        {form.tipo_operacao_pedido === 'importacao' && (
          <>
            <div style={s.campo}>
              <CampoEmpresaDaOrg
                label={t('pedido.drawer.label_importador', 'Importador')}
                empresa={empresaDaOrg}
                carregando={carregandoEmpresaDaOrg}
                tooltipTexto={t('pedido.modal_novo.tooltip_lado_da_org_importador')}
              />
            </div>
            <div style={s.campo}>
              <CampoEmpresaSelect
                label={`${t('pedido.drawer.label_exportador')} *`}
                opcoes={opcoesContraparteExportador}
                valor={form.suid_exportador || null}
                carregando={carregandoEmpresas}
                desabilitado={camposBloqueados}
                onSelecionar={(v) => onChange('suid_exportador', String(v ?? ''))}
                onCadastrarNova={() => aoCadastrarNova('exportador')}
                labelNova={t('pedido.cadastro_empresa.cadastrar_nova_curto')}
                placeholder={t('pedido.cadastro_empresa.ph_select_empresa_curto')}
                invalido={!camposBloqueados && requisitoOk.get('suid_exportador') === false}
              />
            </div>
          </>
        )}
        {/* EXPORTAÇÃO: lado-da-org = EXPORTADOR (auto), contraparte = IMPORTADOR */}
        {form.tipo_operacao_pedido === 'exportacao' && (
          <>
            <div style={s.campo}>
              <CampoEmpresaSelect
                label={`${t('pedido.drawer.label_importador', 'Importador')} *`}
                opcoes={opcoesContraparteImportador}
                valor={form.suid_importador || null}
                carregando={carregandoEmpresas}
                desabilitado={camposBloqueados}
                onSelecionar={(v) => onChange('suid_importador', String(v ?? ''))}
                onCadastrarNova={() => aoCadastrarNova('importador')}
                labelNova={t('pedido.cadastro_empresa.cadastrar_nova_curto')}
                placeholder={t('pedido.cadastro_empresa.ph_select_empresa_curto')}
                invalido={!camposBloqueados && requisitoOk.get('suid_importador') === false}
              />
            </div>
            <div style={s.campo}>
              <CampoEmpresaDaOrg
                label={t('pedido.drawer.label_exportador')}
                empresa={empresaDaOrg}
                carregando={carregandoEmpresaDaOrg}
                tooltipTexto={t('pedido.modal_novo.tooltip_lado_da_org_exportador')}
              />
            </div>
          </>
        )}
        <div style={s.campo}>
          <CampoEmpresaSelect
            label={t('pedido.drawer.label_fabricante')}
            opcoes={opcoesFabricanteFiltrado}
            valor={form.suid_fabricante || null}
            carregando={carregandoEmpresas}
            desabilitado={camposBloqueados}
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
            valor={form.incoterm_pedido}
            aoMudarValor={v => onChange('incoterm_pedido', String(v ?? ''))}
            desabilitado={camposBloqueados}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-pagamento">{t('pedido.drawer.label_cond_pgto')}</label>
          <input
            id="mnp-pagamento"
            disabled={camposBloqueados}
            style={{ ...s.input, ...(camposBloqueados ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            value={form.condicao_pagamento_pedido}
            onChange={e => onChange('condicao_pagamento_pedido', e.target.value)}
            placeholder={t('pedido.drawer.ph_cond_pgto')}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-proforma">{t('pedido.drawer.label_num_proforma')}</label>
          <input
            id="mnp-proforma"
            disabled={camposBloqueados}
            style={{ ...s.input, ...(camposBloqueados ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            value={form.numero_proforma_pedido}
            onChange={e => onChange('numero_proforma_pedido', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-invoice">{t('pedido.drawer.label_num_invoice')}</label>
          <input
            id="mnp-invoice"
            disabled={camposBloqueados}
            style={{ ...s.input, ...(camposBloqueados ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            value={form.numero_invoice_pedido}
            onChange={e => onChange('numero_invoice_pedido', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-imp">{t('pedido.drawer.label_ref_importador')}</label>
          <input
            id="mnp-ref-imp"
            disabled={camposBloqueados}
            style={{ ...s.input, ...(camposBloqueados ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            value={form.referencia_importador_pedido}
            onChange={e => onChange('referencia_importador_pedido', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-exp">{t('pedido.drawer.label_ref_exportador')}</label>
          <input
            id="mnp-ref-exp"
            disabled={camposBloqueados}
            style={{ ...s.input, ...(camposBloqueados ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            value={form.referencia_exportador_pedido}
            onChange={e => onChange('referencia_exportador_pedido', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-fab">{t('pedido.drawer.label_ref_fabricante')}</label>
          <input
            id="mnp-ref-fab"
            disabled={camposBloqueados}
            style={{ ...s.input, ...(camposBloqueados ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            value={form.referencia_fabricante_pedido}
            onChange={e => onChange('referencia_fabricante_pedido', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <CampoGeralGlobal
            label={t('pedido.drawer.label_data_emissao')}
            obrigatorio
            vazio={!camposBloqueados && requisitoOk.get('data_emissao_pedido') === false}
          >
            <input
              id="mnp-data-emissao"
              type="date"
              disabled={camposBloqueados}
              style={{
                ...s.input,
                ...(camposBloqueados ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
              }}
              value={form.data_emissao_pedido}
              onChange={e => onChange('data_emissao_pedido', e.target.value)}
              aria-invalid={!camposBloqueados && requisitoOk.get('data_emissao_pedido') === false}
            />
          </CampoGeralGlobal>
        </div>
      </div>

      {/* Erros do passo 1 (data inválida ou outros erros gerais) */}
      {erros.geral && (
        <div style={s.erroGeral} role="alert">
          <Warning size={15} weight="fill" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{erros.geral}</span>
        </div>
      )}

      {/* Banner consolidado de requisitos pendentes — componente único do
          nucleo-global. Não renderiza nada quando todos requisitos atendidos. */}
      <BannerRequisitosGlobal
        requisitos={requisitos}
        titulo={t('pedido.modal_novo.pendencias_titulo')}
      />

      {/* Legenda permanente: explicação do asterisco vermelho */}
      <p style={s.legendaObrigatorios}>
        <span style={s.asteriscoObrigatorio}>*</span> {t('pedido.modal_novo.legenda_obrigatorios')}
      </p>
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
                value={item.part_number_item}
                onChange={e => onChangeItem(index, 'part_number_item', e.target.value)}
                placeholder={t('pedido.modal_novo.ph_sku')}
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-ncm-${index}`}>{t('pedido.campos.ncm')}</label>
              <input
                id={`mnp-ncm-${index}`}
                style={{ ...s.inputCompacto, fontFamily: 'monospace' }}
                value={item.ncm_item}
                onChange={e => onChangeItem(index, 'ncm_item', formatarNcmInput(e.target.value))}
                placeholder="0000.00.00"
                maxLength={10}
                inputMode="numeric"
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
              {/* Live mask BR (0.000,00). casasDecimais=2 por enquanto — TODO
                  ler do config do usuário (Configurações / Casas Decimais /
                  col_quantidade_total_pedido) quando hook existir. */}
              <CampoDecimalGlobal
                id={`mnp-qty-${index}`}
                valor={item.quantidade_inicial_item === '' ? null : Number(item.quantidade_inicial_item)}
                aoMudarValor={(n) => onChangeItem(index, 'quantidade_inicial_item', n === null ? '' : String(n))}
                casasDecimais={2}
                style={s.inputCompacto}
                textAlign="right"
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
