/**
 * ModalNovaColuna.tsx — Modal para criar ou editar uma coluna customizada do usuário
 *
 * Features:
 *  - Grid de pills para seleção de tipo (com ícones)
 *  - Editor tokenizado (pill-based) para fórmulas
 *  - GABI AI: análise semântica local + Gemini async com sugestões
 *  - Valor padrão contextual (checkbox toggle, select das opções, input tipado)
 *  - Toggles: "Itens podem ter dados diferentes" + "Pedido também é editável"
 *  - Campos disponíveis agrupados (Quantidades, Financeiro, Minhas Colunas)
 *
 * Na edição, o tipo é exibido mas não pode ser alterado.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  X, Plus, Warning, Info, Columns,
  TextT, Hash, CalendarBlank, Percent, ListBullets,
  CheckSquare, Tag, MathOperations, Paperclip,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type {
  ColunaUsuario,
  TipoColunaUsuario,
  EscopoColunaUsuario,
  VisibilidadeColunaUsuario,
} from '../../shared/types'
import { colunasUsuarioApi } from '../../shared/api'
import {
  parsearFormula,
  extrairDependencias,
  detectarCircular,
} from '../../shared/formulaEngine'
import {
  FORMULA_ALIAS_MAP,
  formulaParaAlias,
  formulaParaChave,
  CAMPOS_FORMULA_BASE,
  tokensParaAliasFormula,
  aliasFormulaParaTokens,
  type FormulaToken,
  type CampoFormulaGrupo,
} from '../../shared/formulaUtils'
import { analisarSemanticaFormula, SEMANTICA_CAMPOS } from '../../shared/gabiSemantica'
import './ModalNovaColuna.css'

// ── Grid de tipos com ícones ────────────────────────────────────────────────

const TIPOS_COLUNA: { id: TipoColunaUsuario; icone: React.ReactNode }[] = [
  { id: 'texto',          icone: <TextT          size={16} weight="duotone" /> },
  { id: 'numero',         icone: <Hash           size={16} weight="duotone" /> },
  { id: 'data',           icone: <CalendarBlank  size={16} weight="duotone" /> },
  { id: 'percentual',     icone: <Percent        size={16} weight="duotone" /> },
  { id: 'select',         icone: <ListBullets    size={16} weight="duotone" /> },
  { id: 'checkbox',       icone: <CheckSquare    size={16} weight="duotone" /> },
  { id: 'tipo_documento', icone: <Tag            size={16} weight="duotone" /> },
  { id: 'formula',        icone: <MathOperations size={16} weight="duotone" /> },
]

// ── Opções de enum ────────────────────────────────────────────────────────────

const ESCOPO_OPCOES: { valor: EscopoColunaUsuario; labelKey: string }[] = [
  { valor: 'pedido', labelKey: 'pedido.coluna_escopo.pedido' },
  { valor: 'item',   labelKey: 'pedido.coluna_escopo.item'   },
  { valor: 'ambos',  labelKey: 'pedido.coluna_escopo.ambos'  },
]

const VISIBILIDADE_OPCOES: { valor: VisibilidadeColunaUsuario; labelKey: string }[] = [
  { valor: 'todos',   labelKey: 'pedido.coluna_visibilidade.todos'   },
  { valor: 'roles',   labelKey: 'pedido.coluna_visibilidade.roles'   },
  { valor: 'privado', labelKey: 'pedido.coluna_visibilidade.privado' },
]

// Tipos numéricos válidos em fórmulas
const TIPOS_NUMERICOS_FORMULA: TipoColunaUsuario[] = ['numero', 'percentual', 'formula']

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalNovaColunaProps {
  colunaEdicao?: ColunaUsuario
  onFechar: () => void
  onSalvo: () => void
  /** Lista de chaves de campos disponíveis para referenciar em fórmulas */
  camposDisponiveis?: string[]
  /** Lista de todas as colunas de fórmula existentes (para detecção de ciclos) */
  todasColunas?: ColunaUsuario[]
}

// ── Toggle inline ─────────────────────────────────────────────────────────────

function MncToggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <label className="mnc-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mnc-toggle__input"
      />
      <span className="mnc-toggle__track" />
    </label>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalNovaColunaUsuario({
  colunaEdicao,
  onFechar,
  onSalvo,
  camposDisponiveis = [],
  todasColunas = [],
}: ModalNovaColunaProps) {
  const isEdicao = Boolean(colunaEdicao)
  const { t } = useTranslation()

  // ── Estado principal ─────────────────────────────────────────────────────
  const [nome, setNome]                 = useState(colunaEdicao?.nome ?? '')
  const [tipo, setTipo]                 = useState<TipoColunaUsuario>(colunaEdicao?.tipo ?? 'texto')
  const [escopo, setEscopo]             = useState<EscopoColunaUsuario>(colunaEdicao?.escopo ?? 'ambos')
  const [visibilidade, setVisibilidade] = useState<VisibilidadeColunaUsuario>(colunaEdicao?.visibilidade ?? 'todos')
  const [obrigatorio, setObrigatorio]   = useState(colunaEdicao?.obrigatorio ?? false)
  const [valorPadrao, setValorPadrao]   = useState(colunaEdicao?.valor_padrao ?? '')
  const [descricao, setDescricao]       = useState(colunaEdicao?.descricao ?? '')
  const [opcoes, setOpcoes]             = useState<string[]>(colunaEdicao?.opcoes ?? [])
  const [novaOpcao, setNovaOpcao]       = useState('')
  const [salvando, setSalvando]         = useState(false)
  const [erro, setErro]                 = useState<string | null>(null)

  // ── Estado: itens diferentes + pedido editável ──────────────────────────
  const [itensDiferentes, setItensDiferentes] = useState(() => {
    if (colunaEdicao) return colunaEdicao.escopo === 'item' || colunaEdicao.escopo === 'ambos'
    return true
  })
  const [pedidoEditavel, setPedidoEditavel] = useState(() => {
    if (colunaEdicao) return colunaEdicao.escopo === 'ambos'
    return true
  })

  // Derivar escopo a partir dos toggles (mesma lógica do Configuracoes)
  useEffect(() => {
    if (itensDiferentes && pedidoEditavel) setEscopo('ambos')
    else if (itensDiferentes) setEscopo('item')
    else setEscopo('pedido')
  }, [itensDiferentes, pedidoEditavel])

  // ── Estado: fórmula tokenizada + GABI ──────────────────────────────────
  const [formulaTokens, setFormulaTokens] = useState<FormulaToken[]>(() => {
    if (colunaEdicao?.formula_expressao) {
      return aliasFormulaParaTokens(formulaParaAlias(colunaEdicao.formula_expressao))
    }
    return []
  })
  const [formulaErro, setFormulaErro]       = useState<string | null>(null)
  const [formulaValida, setFormulaValida]   = useState(false)
  const [formulaGabi, setFormulaGabi]       = useState<{ titulo: string; texto: string; sugestao?: string } | null>(null)
  const formulaDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nomeRef = useRef(nome)
  useEffect(() => { nomeRef.current = nome }, [nome])

  // Campos agrupados para fórmula
  const camposFormulaRef = useRef<Array<{ chave: string; label: string; unidade?: string; papel?: string }>>([])
  const camposFormula: CampoFormulaGrupo[] = useMemo(() => {
    const colunasNumericas = todasColunas.filter(c => c.tipo !== 'formula' && c.ativo)
    const grupos = [...CAMPOS_FORMULA_BASE]
    if (colunasNumericas.length > 0) {
      grupos.push({
        grupo: 'Minhas Colunas',
        campos: colunasNumericas.map(c => ({ chave: c.chave ?? c.id, label: c.nome })),
      })
    }
    return grupos
  }, [todasColunas])

  // Manter ref atualizada
  useEffect(() => {
    camposFormulaRef.current = camposFormula.flatMap(g =>
      g.campos.map(c => ({
        chave:   c.chave,
        label:   c.label,
        unidade: SEMANTICA_CAMPOS[c.chave]?.unidade as string | undefined,
        papel:   SEMANTICA_CAMPOS[c.chave]?.papel   as string | undefined,
      }))
    )
  }, [camposFormula])

  const tipoComOpcoes = tipo === 'select' || tipo === 'tipo_documento'
  const tipoFormula   = tipo === 'formula'

  // Reset tokens quando tipo muda para fora de 'formula'
  useEffect(() => {
    if (!tipoFormula) {
      setFormulaTokens([])
      setFormulaErro(null)
      setFormulaValida(false)
      setFormulaGabi(null)
    }
  }, [tipoFormula])

  // ── Validação GABI (semântica local + Gemini async) ────────────────────
  const validarFormulaGabi = useCallback(async (expressaoAlias: string) => {
    if (!expressaoAlias.trim()) {
      setFormulaErro(null); setFormulaValida(false); setFormulaGabi(null)
      return
    }
    try {
      const expressaoChave = formulaParaChave(expressaoAlias)
      parsearFormula(expressaoChave)

      // Verificar ciclo
      const chave = nomeRef.current.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || '__nova__'
      if (detectarCircular(chave, expressaoChave, todasColunas)) {
        setFormulaErro('Referência circular: a fórmula cria um ciclo de dependências.')
        setFormulaValida(false); setFormulaGabi(null)
        return
      }

      // Detectar campos não-numéricos
      const camposTexto: string[] = []
      const identRegex = /\b([a-z][a-z0-9_]*)\b/g
      let m: RegExpExecArray | null
      while ((m = identRegex.exec(expressaoChave)) !== null) {
        const id = m[1]
        const colUsuario = todasColunas.find(c => c.chave === id || c.id === id)
        if (colUsuario && !TIPOS_NUMERICOS_FORMULA.includes(colUsuario.tipo)) {
          camposTexto.push(`"${colUsuario.nome}" (${colUsuario.tipo})`)
        }
      }
      if (camposTexto.length > 0) {
        setFormulaErro(null); setFormulaValida(true)
        setFormulaGabi({
          titulo: 'Campo não-numérico detectado',
          texto: `${camposTexto.join(', ')} ${camposTexto.length === 1 ? 'não é um campo numérico' : 'não são campos numéricos'}. Em operações aritméticas, campos texto, data ou checkbox serão tratados como 0.`,
        })
        return
      }

      // Detectar campos desconhecidos
      const palavrasReservadas = new Set(['SE', 'SOMA_ITENS'])
      const chavesValidas = new Set(camposFormulaRef.current.map(c => c.chave))
      const identRegex2 = /\b([a-z][a-z0-9_]*)\b/g
      const camposDesconhecidos: string[] = []
      let m2: RegExpExecArray | null
      while ((m2 = identRegex2.exec(expressaoAlias)) !== null) {
        const id = m2[1]
        if (!palavrasReservadas.has(id.toUpperCase()) && !chavesValidas.has(id)) {
          const ehColunaUsuario = todasColunas.some(c => c.chave === id || c.id === id)
          if (!ehColunaUsuario && !camposDesconhecidos.includes(id)) camposDesconhecidos.push(id)
        }
      }
      if (camposDesconhecidos.length > 0) {
        setFormulaErro(null); setFormulaValida(false)
        setFormulaGabi({
          titulo: 'Campo não reconhecido',
          texto: `${camposDesconhecidos.map(c => `"${c}"`).join(', ')} ${camposDesconhecidos.length === 1 ? 'não é um campo disponível' : 'não são campos disponíveis'}. Use os chips abaixo para inserir campos válidos.`,
        })
        return
      }

      // Análise semântica local
      const gabiLocal = analisarSemanticaFormula(expressaoChave)
      setFormulaErro(null); setFormulaValida(true); setFormulaGabi(gabiLocal)

      // Gemini async (melhoria opcional)
      const respostaGemini = await colunasUsuarioApi.gabiAnalisar(expressaoChave, camposFormulaRef.current)
      if (respostaGemini.gemini) {
        setFormulaGabi({ titulo: respostaGemini.titulo, texto: respostaGemini.texto, sugestao: respostaGemini.sugestao })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fórmula inválida'

      // Detectar "dois campos sem operador"
      if (msg.includes('Token inesperado após fim da fórmula:')) {
        const match = msg.match(/Token inesperado após fim da fórmula: '([^']+)'/)
        const tokenExtra = match?.[1]
        if (tokenExtra) {
          const idx = expressaoAlias.lastIndexOf(tokenExtra)
          const antes = idx > 0 ? expressaoAlias.slice(0, idx).trim() : null
          if (antes) {
            setFormulaErro(null); setFormulaValida(false)
            setFormulaGabi({
              titulo: 'Falta um operador',
              texto: `Parece que faltou um operador entre "${antes}" e "${tokenExtra}". Escolha o que faz mais sentido e insira entre os dois campos.`,
              sugestao: `${antes} + ${tokenExtra}`,
            })
            return
          }
        }
      }

      setFormulaErro(msg); setFormulaValida(false); setFormulaGabi(null)
    }
  }, [todasColunas])

  // Sincronizar tokens → validação com debounce
  useEffect(() => {
    const alias = tokensParaAliasFormula(formulaTokens)
    setFormulaErro(null); setFormulaValida(false); setFormulaGabi(null)
    if (formulaDebounceRef.current) clearTimeout(formulaDebounceRef.current)
    if (alias.trim()) {
      formulaDebounceRef.current = setTimeout(() => {
        void validarFormulaGabi(alias)
      }, 600)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulaTokens])

  useEffect(() => {
    return () => { if (formulaDebounceRef.current) clearTimeout(formulaDebounceRef.current) }
  }, [])

  // ── Handlers de token ─────────────────────────────────────────────────

  function adicionarCampoToken(campo: { chave: string; label: string }) {
    setFormulaTokens(prev => [...prev, { tipo: 'campo', chave: campo.chave, label: campo.label }])
  }

  function adicionarOpToken(op: string) {
    setFormulaTokens(prev => [...prev, { tipo: 'op', valor: op }])
  }

  function removerToken(index: number) {
    setFormulaTokens(prev => prev.filter((_, i) => i !== index))
  }

  // ── Handlers de opções ────────────────────────────────────────────────

  const handleAdicionarOpcao = useCallback(() => {
    const trimmed = novaOpcao.trim()
    if (!trimmed || opcoes.includes(trimmed)) return
    setOpcoes(prev => [...prev, trimmed])
    setNovaOpcao('')
  }, [novaOpcao, opcoes])

  const handleRemoverOpcao = useCallback((opcao: string) => {
    setOpcoes(prev => prev.filter(o => o !== opcao))
  }, [])

  const handleOpcaoKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdicionarOpcao()
    }
  }, [handleAdicionarOpcao])

  // ── Salvar ─────────────────────────────────────────────────────────────

  const handleSalvar = useCallback(async () => {
    const nomeTrimmed = nome.trim()
    if (!nomeTrimmed) {
      setErro(t('pedido.modal_col.erro_nome_obrigatorio'))
      return
    }
    if (tipoComOpcoes && opcoes.length === 0) {
      setErro(t('pedido.modal_col.erro_sem_opcoes'))
      return
    }

    const formulaAlias = tokensParaAliasFormula(formulaTokens)
    const formulaChave = formulaParaChave(formulaAlias)

    if (tipoFormula) {
      if (!formulaAlias.trim()) {
        setErro(t('pedido.modal_col.erro_formula_obrigatoria'))
        return
      }
      try {
        parsearFormula(formulaChave)
      } catch (err) {
        setErro(err instanceof Error ? t('pedido.modal_col.erro_formula_invalida', { msg: err.message }) : t('pedido.modal_col.erro_formula_invalida_gen'))
        return
      }
      if (formulaErro) {
        setErro(formulaErro)
        return
      }
    }

    setSalvando(true)
    setErro(null)

    const formulaDeps = tipoFormula ? extrairDependencias(formulaChave) : undefined

    const payload = {
      nome: nomeTrimmed,
      tipo,
      escopo,
      visibilidade,
      obrigatorio,
      valor_padrao: valorPadrao.trim() || undefined,
      descricao: descricao.trim() || undefined,
      opcoes: tipoComOpcoes ? opcoes : undefined,
      formula_expressao: tipoFormula ? formulaChave : undefined,
      formula_dependencias: formulaDeps,
      ativo: true,
      ordem: colunaEdicao?.ordem ?? 0,
    }

    try {
      if (isEdicao && colunaEdicao) {
        await colunasUsuarioApi.atualizar(colunaEdicao.id, payload)
      } else {
        await colunasUsuarioApi.criar(payload)
      }
      onSalvo()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar coluna.'
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }, [
    nome, tipo, escopo, visibilidade, obrigatorio, valorPadrao,
    descricao, opcoes, tipoComOpcoes, tipoFormula, formulaTokens,
    formulaErro, isEdicao, colunaEdicao, onSalvo,
  ])

  // Fecha com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onFechar])

  // ── Render ─────────────────────────────────────────────────────────────

  return createPortal(
    <div
      className="mnc-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t(isEdicao ? 'pedido.modal_col.titulo_edicao' : 'pedido.modal_col.titulo_novo')}
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
    >
      <div className="mnc-modal">
        {/* Cabeçalho */}
        <div className="mnc-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Columns size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              <h2 className="mnc-titulo">{t(isEdicao ? 'pedido.modal_col.titulo_edicao' : 'pedido.modal_col.titulo_novo')}</h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
              {isEdicao ? 'Altere as propriedades da coluna personalizada' : 'Crie uma coluna personalizada para organizar seus pedidos'}
            </p>
          </div>
          <button
            type="button"
            className="mnc-fechar"
            onClick={onFechar}
            aria-label={t('pedido.modal_col.aria_fechar')}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Corpo */}
        <div className="mnc-corpo">
          {/* Nome */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-nome">
              {t('pedido.modal_col.label_nome')} <span className="mnc-obrig">*</span>
            </label>
            <input
              id="mnc-nome"
              className="mnc-input"
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              maxLength={60}
              placeholder={t('pedido.modal_col.placeholder_nome')}
              autoFocus
            />
          </div>

          {/* Tipo — Grid de Pills */}
          <div className="mnc-campo">
            <label className="mnc-label">
              {t('pedido.modal_col.label_tipo')} <span className="mnc-obrig">*</span>
            </label>
            <div className="mnc-tipo-grid">
              {TIPOS_COLUNA.map(tc => (
                <button
                  key={tc.id}
                  type="button"
                  className={`mnc-tipo-btn${tipo === tc.id ? ' mnc-tipo-btn--ativo' : ''}`}
                  onClick={() => !isEdicao && setTipo(tc.id)}
                  aria-pressed={tipo === tc.id}
                  disabled={isEdicao}
                >
                  <span className="mnc-tipo-btn__icone">{tc.icone}</span>
                  <span className="mnc-tipo-btn__label">{t(`pedido.coluna_tipo.${tc.id}`)}</span>
                </button>
              ))}
            </div>
            {isEdicao && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#f59e0b' }}>
                <Warning size={13} weight="fill" style={{ flexShrink: 0 }} />
                {t('pedido.modal_col.tipo_readonly', 'O tipo da coluna não pode ser alterado após a criação.')}
              </p>
            )}
          </div>

          {/* ── Editor de Fórmula Tokenizado + GABI ── */}
          {tipoFormula && (
            <div className="mnc-campo">
              <label className="mnc-label">
                {t('pedido.modal_col.label_formula')} <span className="mnc-obrig">*</span>
              </label>

              {/* Área de tokens (pills) */}
              <div className={[
                'mnc-tokens',
                formulaErro ? 'mnc-tokens--erro' : '',
                formulaValida && formulaTokens.length > 0 ? 'mnc-tokens--ok' : '',
              ].filter(Boolean).join(' ')}>
                {formulaTokens.length === 0 ? (
                  <span className="mnc-tokens__placeholder">
                    {t('pedido.modal_col.placeholder_formula')}
                  </span>
                ) : (
                  formulaTokens.map((token, i) =>
                    token.tipo === 'campo' ? (
                      <span key={i} className="mnc-token mnc-token--campo">
                        <span className="mnc-token__label">{token.label}</span>
                        <button type="button" className="mnc-token__remove" onClick={() => removerToken(i)} aria-label={`Remover ${token.label}`}>
                          <X size={9} weight="bold" />
                        </button>
                      </span>
                    ) : (
                      <button key={i} type="button" className="mnc-token mnc-token--op" onClick={() => removerToken(i)} title="Clique para remover">
                        {token.valor}
                      </button>
                    )
                  )
                )}
              </div>

              {/* Operadores */}
              <div className="mnc-ops">
                {(['+', '-', '*', '/', '(', ')'] as const).map(op => (
                  <button key={op} type="button" className="mnc-op-btn" onClick={() => adicionarOpToken(op)}>{op}</button>
                ))}
                {formulaTokens.length > 0 && (
                  <button type="button" className="mnc-op-btn mnc-op-btn--clear" onClick={() => setFormulaTokens([])}>Limpar</button>
                )}
              </div>

              {/* Campos disponíveis (agrupados) */}
              <div className="mnc-formula-campos">
                <p className="mnc-formula-campos-titulo">
                  <Info size={13} weight="fill" />
                  Adicionar campo
                </p>
                {camposFormula.map(grupo => (
                  <div key={grupo.grupo} className="mnc-campos-grupo">
                    <span className="mnc-campos-grupo__label">{grupo.grupo}</span>
                    <div className="mnc-formula-chips">
                      {grupo.campos.map(campo => (
                        <button
                          key={campo.chave}
                          type="button"
                          className="mnc-formula-chip"
                          onClick={() => adicionarCampoToken(campo)}
                          title={`Inserir: ${campo.label}`}
                        >
                          {campo.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* GABI AI Card */}
              {(() => {
                if (formulaTokens.length === 0) return (
                  <div className="mnc-gabi-card mnc-gabi-card--info" role="note">
                    <div className="mnc-gabi-card__header">
                      <span className="mnc-gabi-card__ico">✦</span>
                      <span className="mnc-gabi-card__titulo">Gabi · Como montar sua fórmula</span>
                    </div>
                    <p className="mnc-gabi-card__texto">
                      Use os chips acima para inserir campos e os operadores (+, -, *, /) para construir sua fórmula. A Gabi vai analisar e sugerir melhorias automaticamente.
                    </p>
                  </div>
                )
                if (!formulaErro && !formulaGabi && !formulaValida) return null
                const variante = formulaErro ? 'erro' : formulaGabi ? 'aviso' : 'ok'
                const titulo   = formulaErro ? 'Erro na fórmula' : formulaGabi ? formulaGabi.titulo : 'Fórmula válida'
                const texto    = formulaErro ?? formulaGabi?.texto ?? 'A fórmula está correta. Preencha os demais campos para criar a coluna.'
                const sugestao = formulaGabi?.sugestao
                return (
                  <div className={`mnc-gabi-card mnc-gabi-card--${variante}`} role="note" aria-live="polite">
                    <div className="mnc-gabi-card__header">
                      <span className="mnc-gabi-card__ico">✦</span>
                      <span className="mnc-gabi-card__titulo">Gabi · {titulo}</span>
                    </div>
                    <p className="mnc-gabi-card__texto">{texto}</p>
                    {sugestao && (
                      <div className="mnc-gabi-card__sugestao-row">
                        <code className="mnc-gabi-card__sugestao">{sugestao}</code>
                        <button
                          type="button"
                          className="mnc-gabi-card__usar"
                          onClick={() => {
                            const allCampos = camposFormula.flatMap(g => g.campos)
                            const tokens = sugestao.trim().split(/\s+/).map(part => {
                              const campo = allCampos.find(c => c.chave === part)
                              if (campo) return { tipo: 'campo' as const, chave: campo.chave, label: campo.label }
                              return { tipo: 'op' as const, valor: part }
                            })
                            setFormulaTokens(tokens)
                          }}
                          title="Usar esta sugestão"
                        >
                          Usar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Opções (select / tipo_documento) */}
          {tipoComOpcoes && (
            <div className="mnc-campo">
              <label className="mnc-label">
                {t('pedido.modal_col.label_opcoes')} <span className="mnc-obrig">*</span>
              </label>
              <div className="mnc-nova-opcao">
                <input
                  className="mnc-input mnc-input--opcao"
                  type="text"
                  value={novaOpcao}
                  onChange={e => setNovaOpcao(e.target.value)}
                  onKeyDown={handleOpcaoKeyDown}
                  placeholder={t('pedido.modal_col.placeholder_opcao')}
                  aria-label={t('pedido.modal_col.aria_nova_opcao')}
                />
                <button
                  type="button"
                  className="mnc-btn-add-opcao"
                  onClick={handleAdicionarOpcao}
                  aria-label={t('pedido.modal_col.aria_adicionar_opcao')}
                >
                  <Plus size={14} weight="bold" />
                </button>
              </div>
              <div className="mnc-opcoes-lista">
                {opcoes.length > 0 ? opcoes.map(opcao => (
                  <span key={opcao} className="mnc-opcao-chip">
                    {opcao}
                    <button
                      type="button"
                      className="mnc-opcao-remover"
                      onClick={() => handleRemoverOpcao(opcao)}
                      aria-label={`Remover opção ${opcao}`}
                    >
                      <X size={10} weight="bold" />
                    </button>
                  </span>
                )) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>
                    Nenhuma opção adicionada
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Visibilidade */}
          <div className="mnc-campo">
            <label className="mnc-label">
              {t('pedido.modal_col.label_visibilidade')} <span className="mnc-obrig">*</span>
            </label>
            <SelectGlobal
              buscavel={false}
              opcoes={VISIBILIDADE_OPCOES.map(o => ({ valor: o.valor, rotulo: t(o.labelKey) }))}
              valor={visibilidade}
              aoMudarValor={v => v != null && setVisibilidade(v as VisibilidadeColunaUsuario)}
            />
          </div>

          {/* Itens podem ter dados diferentes (toggle) */}
          <div className="mnc-campo mnc-campo--toggle-row">
            <div>
              <span className="mnc-label" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Itens podem ter dados diferentes
              </span>
              <p className="mnc-hint">Cada item do pedido poderá ter seu próprio valor nesta coluna</p>
            </div>
            <MncToggle checked={itensDiferentes} onChange={setItensDiferentes} id="mnc-itens-dif" />
          </div>

          {itensDiferentes && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.625rem', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                <Warning size={14} weight="fill" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.05rem' }} />
                <span>Dados existentes não serão migrados automaticamente. Valores do pedido serão mantidos e itens iniciam vazios.</span>
              </div>

              <div className="mnc-campo mnc-campo--toggle-row">
                <div>
                  <span className="mnc-label" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    O pedido também é editável
                  </span>
                  <p className="mnc-hint">Além dos itens, o valor a nível de pedido também poderá ser preenchido</p>
                </div>
                <MncToggle checked={pedidoEditavel} onChange={setPedidoEditavel} id="mnc-pedido-edit" />
              </div>
            </>
          )}

          {/* Obrigatório */}
          {tipo !== 'formula' && (
            <div className="mnc-campo mnc-campo--toggle-row">
              <span className="mnc-label" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t('pedido.modal_col.label_obrigatorio')}
              </span>
              <MncToggle checked={obrigatorio} onChange={setObrigatorio} id="mnc-obrigatorio" />
            </div>
          )}

          {/* Valor Padrão — contextual por tipo */}
          {tipo !== 'formula' && (
            <div className="mnc-campo">
              <label className="mnc-label" htmlFor="mnc-valor-padrao">{t('pedido.modal_col.label_valor_padrao')}</label>
              <p className="mnc-hint">Valor preenchido automaticamente ao criar um novo pedido/item</p>
              {tipo === 'checkbox' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    id="mnc-valor-padrao"
                    type="checkbox"
                    className="mnc-checkbox"
                    checked={valorPadrao === 'true'}
                    onChange={e => setValorPadrao(e.target.checked ? 'true' : 'false')}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    {valorPadrao === 'true' ? 'Marcado por padrão' : 'Desmarcado por padrão'}
                  </span>
                </div>
              ) : (tipo === 'select' || tipo === 'tipo_documento') ? (
                opcoes.length > 0 ? (
                  <SelectGlobal
                    opcoes={[
                      { valor: '', rotulo: 'Sem valor padrão' },
                      ...opcoes.map(o => ({ valor: o, rotulo: o })),
                    ]}
                    valor={valorPadrao}
                    aoMudarValor={v => setValorPadrao(String(v ?? ''))}
                    buscavel={false}
                  />
                ) : (
                  <p className="mnc-hint" style={{ fontStyle: 'italic' }}>Adicione opções acima para definir um valor padrão</p>
                )
              ) : (
                <input
                  id="mnc-valor-padrao"
                  className="mnc-input"
                  type={tipo === 'numero' || tipo === 'percentual' ? 'number' : tipo === 'data' ? 'date' : 'text'}
                  value={valorPadrao}
                  onChange={e => setValorPadrao(e.target.value)}
                  placeholder={t('pedido.modal_col.placeholder_valor_padrao')}
                />
              )}
            </div>
          )}

          {/* Descrição */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-descricao">{t('pedido.modal_col.label_descricao')}</label>
            <input
              id="mnc-descricao"
              className="mnc-input"
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder={t('pedido.modal_col.placeholder_descricao')}
              maxLength={200}
            />
          </div>

          {/* Erro */}
          {erro && (
            <p className="mnc-erro" role="alert">{erro}</p>
          )}
        </div>

        {/* Rodapé */}
        <div className="mnc-rodape">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={salvando}>
            {t('pedido.modal_col.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleSalvar}
            carregando={salvando}
          >
            {t('pedido.modal_col.salvar')}
          </BotaoGlobal>
        </div>
      </div>
    </div>,
    document.body,
  )
}
