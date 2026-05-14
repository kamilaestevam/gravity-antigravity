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
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { BannerRequisitosGlobal, type RequisitoSalvar } from '@nucleo/banner-requisitos-global'
import { useMoedas } from '@nucleo/modal-tabela-moeda'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useIncotermsPedido } from '../shared/useIncotermsPedido'
import { useShellStore } from '@gravity/shell'
import type { TipoOperacao, PedidoItem, Pedido } from '../shared/types'
import { pedidoApi } from '../shared/api'
import { cadastrosApi, type Empresa, type PapelEmpresaRapido } from '../shared/cadastrosApi'
import { ModalEmpresaCadastroRapido } from './ModalEmpresaCadastroRapido'
import { getCasas } from './lista/ColunasPai'

// Casas decimais padrão alinhadas com Configurações › Casas Decimais
// (`COLUNAS_NUMERICAS` em pages/Configuracoes.tsx). Defaults sistêmicos:
//   - quantidade_item        → 0 casas  (herda de quantidade_total_pedido)
//   - valor_por_unidade_item → 2 casas
//   - valor_total_pedido     → 2 casas  (Valor Total dos Itens herda)
function casasQtdItem()        { return getCasas('quantidade_item', 0) }
function casasValorUnitario()  { return getCasas('valor_por_unidade_item', 2) }
function casasValorTotal()     { return getCasas('valor_total_pedido', 2) }


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
  // Moeda por item — default herdado do pedido (hoje 'USD' via Zod default).
  // Usuário pode override por item se necessário (ex: pedido multi-moeda).
  moeda_item: string
  // Valor unitário — usuário digita; valor_total é computado (qtd × unitário).
  valor_por_unidade_item: string
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
  moeda_item: '',  // P16: sem default — usuário escolhe (Mandamento 08, mesma regra do FOB)
  valor_por_unidade_item: '',
})

// Lista de moedas NÃO é hardcoded — vem do hook `useMoedas()` (@nucleo/modal-tabela-moeda)
// que fetcha `/api/v1/cadastros/moedas` (SSOT: banco Cadastros). Componentização
// alinhada com DrawerPedido e demais consumidores do sistema (Mandamento 03+06+09).

// ── Opções de select ───────────────────────────────────────────────────────────
// OPCOES_INCOTERM removido em 2026-05-13 — SSOT migrada para cadastros.incoterm.
// Consumir via useIncotermsPedido() dentro do componente (dispatch via hook).

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

// P13.2 — formatarNcmInput migrado para `shared/formatadores.ts` (DRY:
// usado tambem pelo Smart Import). Wrapper aqui mantem assinatura local.
import { formatarNcm } from '../../../shared/formatadores'
const formatarNcmInput = formatarNcm

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
  // Padrão sistêmico: alinhado com .cg-label (CampoGeralGlobal) — --text-micro
  // (0.75rem / 12px), uppercase, muted color, letter-spacing 0.05em.
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    lineHeight: 1.3,
  } as React.CSSProperties,
  // Padrão sistêmico: alinhado com .sg-campo (SelectGlobal) — fundo abaixo do
  // modal, borda visível (1.5px) com acento sutil. Diferenciação clara entre
  // editável e bloqueado fica via opacity (apenas locked).
  input: {
    background:    'var(--ws-bg-body, var(--bg-body, #0f172a))',
    border:        '1.5px solid var(--ws-accent-border, var(--border-accent, rgba(129,140,248,0.20)))',
    borderRadius:  'var(--radius-md, 8px)',
    color:         'var(--text-primary)',
    fontSize:      '0.875rem',
    padding:       '0.5625rem 0.875rem',
    outline:       'none',
    transition:    'border-color 0.18s ease, box-shadow 0.18s ease',
    width:         '100%',
    boxSizing:     'border-box' as const,
  } as React.CSSProperties,
  // P15: letter-spacing 0.05em alinhado com labels (era 0.06em — inconsistência).
  secaoTitulo: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
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
  // (P14: `asteriscoObrigatorio` e `legendaObrigatorios` removidos junto com
  // a legenda do rodapé — asterisco no label do CampoGeralGlobal já cobre
  // o sinal estático; banner cobre o consolidado.)
  itensHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.875rem',
  } as React.CSSProperties,
  // P14 UX: card de item migrou de --bg-elevated (cinza claro, baixo contraste
  // com labels) → --bg-base (escuro do modal). Borda sutil pra delimitar.
  itemCard: {
    padding:       '0.875rem',
    background:    'var(--bg-base)',
    borderRadius:  'var(--radius-md)',
    marginBottom:  '0.625rem',
    border:        '1px solid var(--border-default, rgba(255,255,255,0.06))',
  } as React.CSSProperties,
  // P15: grid de 8 colunas — PartNum / NCM / Descricao / Qtd / Moeda / Valor / Total / lixeira.
  // Valores numéricos (qtd, valor, total) à direita pra alinhamento contábil.
  // Modal `tamanho="xl"` (960px) acomoda os 7 labels + lixeira sem wrap.
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr 1.3fr 0.7fr 0.55fr 1.15fr 1.2fr auto',
    gap: '0.5rem',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  // P15 UX: padrão alinhado com `.drawer-pedido__item-remover` (DrawerPedido.css):
  // estado base levemente apagado (opacity 0.6 + text-muted), hover destrutivo
  // (--danger) com opacity 1 — sinaliza ação irreversível. Padding 0.25rem
  // (mesmo do drawer). Hover via onMouseEnter/Leave inline (estilos inline
  // não suportam :hover).
  btnRemover: {
    background:    'transparent',
    border:        'none',
    cursor:        'pointer',
    color:         'var(--text-muted, #64748b)',
    opacity:       0.6,
    padding:       '0.25rem',
    borderRadius:  'var(--radius-sm, 6px)',
    display:       'flex',
    alignItems:    'center',
    justifyContent: 'center',
    marginTop:     '1.25rem',
    transition:    'color 0.15s, opacity 0.15s',
  } as React.CSSProperties,
  inputCompacto: {
    background:    'var(--ws-bg-body, var(--bg-body, #0f172a))',
    border:        '1.5px solid var(--ws-accent-border, var(--border-accent, rgba(129,140,248,0.20)))',
    borderRadius:  'var(--radius-sm, 6px)',
    color:         'var(--text-primary)',
    fontSize:      '0.8125rem',
    padding:       '0.375rem 0.625rem',
    outline:       'none',
    transition:    'border-color 0.18s ease, box-shadow 0.18s ease',
    width:         '100%',
    boxSizing:     'border-box' as const,
  } as React.CSSProperties,
  // P15: cor alinhada com `.cg-label` do CampoGeralGlobal (canônico do sistema)
  // — `--text-muted` é o padrão de label em todo o nucleo-global.
  labelCompacto: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    lineHeight: 1.3,
    marginBottom: '0.25rem',
    display: 'block',
  } as React.CSSProperties,
  selectCompacto: {
    background:    'var(--ws-bg-body, var(--bg-body, #0f172a))',
    border:        '1.5px solid var(--ws-accent-border, var(--border-accent, rgba(129,140,248,0.20)))',
    borderRadius:  'var(--radius-sm, 6px)',
    color:         'var(--text-primary)',
    fontSize:      '0.8125rem',
    padding:       '0.375rem 0.625rem',
    outline:       'none',
    transition:    'border-color 0.18s ease, box-shadow 0.18s ease',
    width:         '100%',
    cursor:        'pointer',
  } as React.CSSProperties,
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ModalNovoPedido({ aberto, onFechar, onSalvo }: ModalNovoPedidoProps) {
  const { t } = useTranslation()
  // SSOT: incoterms vêm de cadastros.incoterm via hook (2026-05-13).
  const { incotermsOpcoes } = useIncotermsPedido()
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
        .filter(it => it.part_number_item.trim() !== '' || it.descricao_item.trim() !== '' || it.ncm_item.trim() !== '' || it.quantidade_inicial_item.trim() !== '' || it.valor_por_unidade_item.trim() !== '')
        .map(it => {
          const qtd = parseFloat(it.quantidade_inicial_item) || 0
          const valorUnit = it.valor_por_unidade_item.trim() === '' ? null : (parseFloat(it.valor_por_unidade_item) || 0)
          return {
            part_number_item:        it.part_number_item,
            ncm_item:                it.ncm_item,
            descricao_item:          it.descricao_item,
            quantidade_inicial_item: qtd,
            moeda_item:              it.moeda_item,
            valor_por_unidade_item:  valorUnit,
            // valor_total_item: NÃO enviado — backend recalcula via
            // recalcularAgregadosPedido a partir de qtd × valor_por_unidade.
            // Mandamento 08 (sem fallback): fonte única de verdade é o backend.
          }
        })

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
        tamanho="2xl"
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
            incotermsOpcoes={incotermsOpcoes}
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
  obrigatorio,
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
  obrigatorio?: boolean
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
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #94a3b8)',
          }}
        >
          {label}
          {obrigatorio && (
            <span style={{ color: '#f87171', marginLeft: '0.125rem' }}>*</span>
          )}
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
            fontSize: '0.75rem',
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
      {/* P14: usa a classe canônica `cg-wrapper--erro` do CampoGeralGlobal pra
          aplicar a borda vermelha no SelectGlobal filho — mesmo CSS que pinta
          os inputs Número Pedido / Data Emissão. Unifica o padrão obrigatório+vazio. */}
      <div className={invalido && !desabilitado ? 'cg-wrapper cg-wrapper--erro' : undefined}>
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
            fontSize: '0.75rem',
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
  incotermsOpcoes,
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
  /** Opções de Incoterm vindas de cadastros.incoterm (SSOT). */
  incotermsOpcoes: Array<{ valor: string; label: string }>
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
                label={t('pedido.drawer.label_exportador')}
                obrigatorio
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
                label={t('pedido.drawer.label_importador', 'Importador')}
                obrigatorio
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
            opcoes={incotermsOpcoes.map(o => ({ valor: o.valor, rotulo: o.label }))}
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
          <CampoCalendarioGlobal
            label={t('pedido.drawer.label_data_emissao')}
            obrigatorio
            modoUnico
            placeholder="Selecione a data"
            disabled={camposBloqueados}
            valor={form.data_emissao_pedido
              ? { inicio: new Date(`${form.data_emissao_pedido}T00:00:00`), fim: null }
              : { inicio: null, fim: null }
            }
            aoMudarValor={(val) => {
              if (val.inicio) {
                const iso = val.inicio.toISOString().split('T')[0]
                onChange('data_emissao_pedido', iso)
              } else {
                onChange('data_emissao_pedido', '')
              }
            }}
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

      {/* Banner consolidado de requisitos pendentes — componente único do
          nucleo-global. Não renderiza nada quando todos requisitos atendidos. */}
      <BannerRequisitosGlobal
        requisitos={requisitos}
        titulo={t('pedido.modal_novo.pendencias_titulo')}
      />

      {/* P14 UX: legenda "* Campos obrigatórios" removida — asterisco no label
          já tem semântica universal, e o banner consolidado lista pendências.
          Padrão alinhado com Material Design / Apple HIG. */}
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

  // Lista canônica de moedas — SSOT vem do banco Cadastros via /api/v1/cadastros/moedas.
  // Hook tem cache singleton (não re-fetch), Zod-validado, ordem prioritária UX
  // (USD/EUR/BRL/CNY/GBP/JPY no topo, demais alfabético).
  //
  // Mandamento 08 — sem fallback silencioso: se a chamada falhar, o select é
  // desabilitado e o placeholder mostra a mensagem de erro (ruidoso, visível
  // pro usuário). Se a lista voltar vazia (catálogo zerado no banco), idem.
  const { moedas, loading: carregandoMoedas, erro: erroMoedas } = useMoedas()
  const opcoesMoeda = useMemo(
    () => moedas
      .filter((m) => m.ativo_moeda)
      .map((m) => ({
        valor: m.codigo_moeda,
        rotulo: m.codigo_moeda,
        descricao: m.nome_moeda,
      })),
    [moedas],
  )

  // Estado degenerado: erro de rede/Zod OU catálogo vazio após load completo.
  const moedasIndisponiveis = !carregandoMoedas && (erroMoedas !== null || opcoesMoeda.length === 0)
  // P16: placeholder NUNCA pode ser texto idêntico a um código de moeda válido
  // (ex: "USD") — visualmente o cinza-muted do .sg-placeholder fica indistinguível
  // de um valor selecionado e o usuário lê como "USD pré-preenchido". Padrão do
  // sistema (DrawerPedido): "Selecionar moeda".
  const placeholderMoeda = erroMoedas
    ? `Erro: ${erroMoedas}`
    : (!carregandoMoedas && opcoesMoeda.length === 0)
      ? 'Sem moedas cadastradas'
      : 'Selecionar moeda'

  return (
    <div className="mni-form">
      <style>{`
        .mni-form input::placeholder,
        .mni-form input:disabled::placeholder {
          color: var(--text-muted, #94a3b8) !important;
          opacity: 1 !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-size: 0.875rem !important;
          text-align: left !important;
        }
        .mni-form .sg-placeholder {
          color: var(--text-muted, #94a3b8) !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-size: 0.875rem !important;
        }
      `}</style>
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
              <label style={s.labelCompacto} htmlFor={`mnp-pn-${index}`}>{t('pedido.item.part_number')}</label>
              <input
                id={`mnp-pn-${index}`}
                style={s.inputCompacto}
                value={item.part_number_item}
                onChange={e => onChangeItem(index, 'part_number_item', e.target.value)}
                placeholder={t('pedido.modal_novo.ph_sku')}
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-ncm-${index}`}>{t('pedido.item.ncm')}</label>
              <input
                id={`mnp-ncm-${index}`}
                style={{ ...s.inputCompacto, fontFamily: 'var(--font-mono, monospace)' }}
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
                placeholder={t('pedido.item.descricao_item')}
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-qty-${index}`}>{t('pedido.drawer.label_qtd')}</label>
              {/* Live mask BR. casasDecimais lê config do usuário via getCasas() —
                  default 0 para quantidade (alinha com lista e Configurações). */}
              <CampoDecimalGlobal
                id={`mnp-qty-${index}`}
                valor={item.quantidade_inicial_item === '' ? null : Number(item.quantidade_inicial_item)}
                aoMudarValor={(n) => onChangeItem(index, 'quantidade_inicial_item', n === null ? '' : String(n))}
                casasDecimais={casasQtdItem()}
                placeholder="Quantidade"
                style={s.inputCompacto}
                textAlign="right"
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-moeda-${index}`}>{t('pedido.item.moeda', 'Moeda')}</label>
              {/* P16: SelectGlobal alinhado com ModalItemNovo — mesmo placeholder
                  "USD" (sigla canônica padrão), sem `monoValor` (display normal,
                  não mono). `tamanho="compacto"` é mantido APENAS para casar a
                  altura com os demais inputs da grade (inputCompacto). SSOT
                  lista vem de useMoedas() (Cadastros). */}
              <SelectGlobal
                id={`mnp-moeda-${index}`}
                opcoes={opcoesMoeda}
                valor={item.moeda_item || null}
                aoMudarValor={(v) => onChangeItem(index, 'moeda_item', String(v ?? ''))}
                placeholder={placeholderMoeda}
                tamanho="compacto"
                buscavel
                carregando={carregandoMoedas}
                desabilitado={moedasIndisponiveis}
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-valor-${index}`}>{t('pedido.item.valor_do_item')}</label>
              {/* P15: Live mask BR. casasDecimais via getCasas — default 2. */}
              <CampoDecimalGlobal
                id={`mnp-valor-${index}`}
                valor={item.valor_por_unidade_item === '' ? null : Number(item.valor_por_unidade_item)}
                aoMudarValor={(n) => onChangeItem(index, 'valor_por_unidade_item', n === null ? '' : String(n))}
                casasDecimais={casasValorUnitario()}
                placeholder="Valor unitário"
                style={s.inputCompacto}
                textAlign="right"
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-total-${index}`}>{t('pedido.item.valor_total_dos_itens')}</label>
              {/* P15: computed read-only = qtd × valor_por_unidade. Não enviado ao
                  backend — backend recalcula via recalcularAgregadosPedido. */}
              <CampoDecimalGlobal
                id={`mnp-total-${index}`}
                valor={
                  item.valor_por_unidade_item === '' || item.quantidade_inicial_item === ''
                    ? null
                    : Number(item.valor_por_unidade_item) * Number(item.quantidade_inicial_item)
                }
                aoMudarValor={() => { /* read-only: ignora mudanças */ }}
                casasDecimais={casasValorTotal()}
                placeholder="Calculado"
                style={{ ...s.inputCompacto, cursor: 'not-allowed', background: 'var(--bg-elevated, #1e293b)' }}
                textAlign="right"
                desabilitado
              />
            </div>
            <button
              style={s.btnRemover}
              onClick={() => onRemoverItem(index)}
              disabled={itens.length <= 1}
              title={itens.length <= 1 ? t('pedido.modal_novo.remover_unico_hint') : t('pedido.modal_novo.remover_item_hint')}
              aria-label={t('pedido.modal_novo.remover_item_aria', { n: index + 1 })}
              type="button"
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.color = 'var(--danger, #ef4444)'; e.currentTarget.style.opacity = '1' } }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted, #64748b)'; e.currentTarget.style.opacity = '0.6' }}
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
