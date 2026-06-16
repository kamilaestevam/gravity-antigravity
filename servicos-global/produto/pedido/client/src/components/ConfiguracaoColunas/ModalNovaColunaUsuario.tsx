/**
 * ModalNovaColuna.tsx — Modal para criar ou editar uma coluna customizada do usuário
 *
 * Features:
 *  - Grid de pills para seleção de tipo (com ícones)
 *  - Editor tokenizado (pill-based) para fórmulas
 *  - GABI AI: análise semântica local + Gemini async com sugestões
 *  - Toggles: "Itens podem ter dados diferentes" + "Pedido também é editável"
 *  - Campos disponíveis agrupados (Quantidades, Financeiro, Minhas Colunas)
 *
 * Na edição, o tipo é exibido mas não pode ser alterado.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import {
  X, Plus, Warning, Info, Columns,
  TextT, Hash, CalendarBlank, Percent, ListBullets,
  CheckSquare, Tag, MathOperations, Paperclip,
  Eye, PencilSimple, Asterisk, TextAlignLeft,
  SquaresFour, Rows,
} from '@phosphor-icons/react'
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

const ICONE_LABEL_SECAO = { size: 13, weight: 'fill' as const }

function MncLabelSecao({
  icone,
  children,
  obrigatorio,
  toggle,
  htmlFor,
  iconeDestaque,
}: {
  icone: React.ReactNode
  children: React.ReactNode
  obrigatorio?: boolean
  toggle?: boolean
  htmlFor?: string
  iconeDestaque?: boolean
}) {
  const classe = [
    'mnc-label-secao',
    toggle ? 'mnc-label-secao--toggle' : '',
    iconeDestaque ? 'mnc-label-secao--icone-destaque' : '',
  ].filter(Boolean).join(' ')
  const conteudo = (
    <>
      {icone}
      <span>{children}</span>
      {obrigatorio && <span className="mnc-obrig">*</span>}
    </>
  )
  if (htmlFor) {
    return <label className={classe} htmlFor={htmlFor}>{conteudo}</label>
  }
  return <span className={classe}>{conteudo}</span>
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
  const [alertaDivergenciaItens, setAlertaDivergenciaItens] = useState(
    colunaEdicao?.alerta_divergencia_itens ?? false,
  )
  const [descricao, setDescricao]       = useState(colunaEdicao?.descricao ?? '')
  const [opcoes, setOpcoes]             = useState<string[]>(colunaEdicao?.opcoes ?? [])
  const [novaOpcao, setNovaOpcao]       = useState('')
  const [salvando, setSalvando]         = useState(false)
  const [erro, setErro]                 = useState<string | null>(null)
  const [erroCampo, setErroCampo]       = useState<'nome' | 'opcoes' | 'formula' | 'geral' | null>(null)

  const definirErro = useCallback((campo: NonNullable<typeof erroCampo>, mensagem: string) => {
    setErroCampo(campo)
    setErro(mensagem)
  }, [])

  const limparErro = useCallback(() => {
    setErroCampo(null)
    setErro(null)
  }, [])

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

  useEffect(() => {
    if (escopo !== 'ambos') setAlertaDivergenciaItens(false)
  }, [escopo])

  // ── Estado: fórmula tokenizada + GABI ──────────────────────────────────
  const [formulaTokens, setFormulaTokens] = useState<FormulaToken[]>(() => {
    if (colunaEdicao?.tipo === 'formula' && colunaEdicao?.valor_padrao) {
      return aliasFormulaParaTokens(formulaParaAlias(colunaEdicao.valor_padrao))
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
        grupo: t('pedido.modal_col.grupo_minhas_colunas'),
        campos: colunasNumericas.map(c => ({ chave: c.chave ?? c.id, label: c.nome })),
      })
    }
    return grupos
  }, [todasColunas, t])

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
        setFormulaErro(t('pedido.modal_col.gabi_erro_circular'))
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
          titulo: t('pedido.modal_col.gabi_titulo_nao_numerico'),
          texto: t('pedido.modal_col.gabi_texto_nao_numerico', { campos: camposTexto.join(', '), count: camposTexto.length }),
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
          titulo: t('pedido.modal_col.gabi_titulo_desconhecido'),
          texto: t('pedido.modal_col.gabi_texto_desconhecido', { campos: camposDesconhecidos.map(c => `"${c}"`).join(', '), count: camposDesconhecidos.length }),
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
      const msg = err instanceof Error ? err.message : t('pedido.modal_col.gabi_formula_invalida')

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
              titulo: t('pedido.modal_col.gabi_titulo_falta_operador'),
              texto: t('pedido.modal_col.gabi_texto_falta_operador', { antes, token: tokenExtra }),
              sugestao: `${antes} + ${tokenExtra}`,
            })
            return
          }
        }
      }

      setFormulaErro(msg); setFormulaValida(false); setFormulaGabi(null)
    }
  }, [todasColunas, t])

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
      definirErro('nome', t('pedido.modal_col.erro_nome_obrigatorio'))
      return
    }
    if (tipoComOpcoes && opcoes.length === 0) {
      definirErro('opcoes', t('pedido.modal_col.erro_sem_opcoes'))
      return
    }

    const formulaAlias = tokensParaAliasFormula(formulaTokens)
    const formulaChave = formulaParaChave(formulaAlias)

    if (tipoFormula) {
      if (!formulaAlias.trim()) {
        definirErro('formula', t('pedido.modal_col.erro_formula_obrigatoria'))
        return
      }
      try {
        parsearFormula(formulaChave)
      } catch (err) {
        definirErro(
          'formula',
          err instanceof Error ? t('pedido.modal_col.erro_formula_invalida', { msg: err.message }) : t('pedido.modal_col.erro_formula_invalida_gen'),
        )
        return
      }
      if (formulaErro) {
        definirErro('formula', formulaErro)
        return
      }
    }

    setSalvando(true)
    limparErro()

    const basePayload = {
      nome: nomeTrimmed,
      escopo,
      visibilidade,
      obrigatorio,
      alerta_divergencia_itens: escopo === 'ambos' ? alertaDivergenciaItens : false,
      ...(tipoFormula ? { valor_padrao: formulaChave } : {}),
      descricao: descricao.trim() || undefined,
      opcoes: tipoComOpcoes ? opcoes : undefined,
    }

    try {
      if (isEdicao && colunaEdicao) {
        // Backend rejeita 'tipo' no PUT (TIPO_IMUTAVEL) — enviar sem ele
        await colunasUsuarioApi.atualizar(colunaEdicao.id, basePayload)
      } else {
        await colunasUsuarioApi.criar({ ...basePayload, tipo })
      }
      await Promise.resolve(onSalvo())
      onFechar()
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('pedido.modal_col.erro_salvar')
      definirErro('geral', msg)
    } finally {
      setSalvando(false)
    }
  }, [
    nome, tipo, escopo, visibilidade, obrigatorio, alertaDivergenciaItens,
    descricao, opcoes, tipoComOpcoes, tipoFormula, formulaTokens,
    formulaErro, isEdicao, colunaEdicao, onSalvo, onFechar, definirErro, limparErro, t,
  ])

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <ModalFormularioAbasGlobal
      aberto
      aoFechar={onFechar}
      aoSalvar={handleSalvar}
      icone={<Columns size={24} weight="duotone" color="var(--ws-accent, #818cf8)" />}
      titulo={t(isEdicao ? 'pedido.modal_col.titulo_edicao' : 'pedido.modal_col.titulo_novo')}
      subtitulo={isEdicao ? t('pedido.modal_col.subtitulo_edicao') : t('pedido.modal_col.subtitulo_novo')}
      tamanho="md"
      larguraMaxima="560px"
      semAbas
      dirty
      carregando={salvando}
      textoSalvar={t('pedido.modal_col.salvar')}
      textoCancelar={t('pedido.modal_col.cancelar')}
      abas={[{
        id: 'form',
        rotulo: '',
        conteudo: (
        <div className="mnc-corpo">
          {erroCampo === 'geral' && erro && (
            <p className="mnc-erro mnc-erro--banner" role="alert">{erro}</p>
          )}

          {/* Nome */}
          <div className="mnc-campo">
            <MncLabelSecao
              htmlFor="mnc-nome"
              icone={<TextT {...ICONE_LABEL_SECAO} />}
              obrigatorio
            >
              {t('pedido.modal_col.label_nome')}
            </MncLabelSecao>
            <input
              id="mnc-nome"
              className={[
                'mnc-input',
                isEdicao ? 'mnc-input--readonly' : 'mnc-input--como-select',
                erroCampo === 'nome' ? 'mnc-input--erro' : '',
              ].filter(Boolean).join(' ')}
              type="text"
              value={nome}
              onChange={e => {
                if (!isEdicao) {
                  setNome(e.target.value)
                  if (erroCampo === 'nome') limparErro()
                }
              }}
              readOnly={isEdicao}
              maxLength={60}
              placeholder={isEdicao ? undefined : t('pedido.modal_col.placeholder_nome')}
              autoFocus={!isEdicao}
              aria-readonly={isEdicao || undefined}
              aria-invalid={erroCampo === 'nome' || undefined}
              aria-describedby={erroCampo === 'nome' ? 'mnc-nome-erro' : undefined}
            />
            {erroCampo === 'nome' && erro && (
              <p id="mnc-nome-erro" className="mnc-erro-campo" role="alert">{erro}</p>
            )}
          </div>

          {/* Tipo — Grid de Pills */}
          <div className="mnc-campo">
            <MncLabelSecao
              icone={<SquaresFour {...ICONE_LABEL_SECAO} />}
              obrigatorio
            >
              {t('pedido.modal_col.label_tipo')}
            </MncLabelSecao>
            <div className="mnc-tipo-grid">
              {TIPOS_COLUNA.map(tc => (
                <button
                  key={tc.id}
                  type="button"
                  className={[
                    'mnc-tipo-btn',
                    tipo === tc.id ? 'mnc-tipo-btn--ativo' : '',
                    isEdicao ? 'mnc-tipo-btn--readonly' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => !isEdicao && setTipo(tc.id)}
                  aria-pressed={tipo === tc.id}
                  aria-disabled={isEdicao || undefined}
                  tabIndex={isEdicao ? -1 : 0}
                >
                  <span className="mnc-tipo-btn__icone">{tc.icone}</span>
                  <span className="mnc-tipo-btn__label">{t(`pedido.coluna_tipo.${tc.id}`)}</span>
                </button>
              ))}
            </div>
            {isEdicao && (
              <p className="mnc-tipo-readonly-aviso">
                <Warning size={13} weight="fill" style={{ flexShrink: 0 }} />
                {t('pedido.modal_col.tipo_readonly', 'O tipo da coluna não pode ser alterado após a criação')}
              </p>
            )}
          </div>

          {/* ── Editor de Fórmula Tokenizado + GABI ── */}
          {tipoFormula && (
            <div className="mnc-campo">
              <MncLabelSecao
                icone={<MathOperations {...ICONE_LABEL_SECAO} />}
                obrigatorio
              >
                {t('pedido.modal_col.label_formula')}
              </MncLabelSecao>

              {/* Área de tokens (pills) */}
              <div className={[
                'mnc-tokens',
                formulaErro || erroCampo === 'formula' ? 'mnc-tokens--erro' : '',
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
                        <button type="button" className="mnc-token__remove" onClick={() => removerToken(i)} aria-label={t('pedido.modal_col.aria_remover_token', { label: token.label })}>
                          <X size={9} weight="bold" />
                        </button>
                      </span>
                    ) : (
                      <button key={i} type="button" className="mnc-token mnc-token--op" onClick={() => removerToken(i)} title={t('pedido.modal_col.clique_remover')}>
                        {token.valor}
                      </button>
                    )
                  )
                )}
              </div>

              {erroCampo === 'formula' && erro && (
                <p className="mnc-erro-campo" role="alert">{erro}</p>
              )}

              {/* Operadores */}
              <div className="mnc-ops">
                {(['+', '-', '*', '/', '(', ')'] as const).map(op => (
                  <button key={op} type="button" className="mnc-op-btn" onClick={() => adicionarOpToken(op)}>{op}</button>
                ))}
                {formulaTokens.length > 0 && (
                  <button type="button" className="mnc-op-btn mnc-op-btn--clear" onClick={() => setFormulaTokens([])}>{t('pedido.modal_col.limpar')}</button>
                )}
              </div>

              {/* Campos disponíveis (agrupados) */}
              <div className="mnc-formula-campos">
                <p className="mnc-formula-campos-titulo">
                  <Info size={13} weight="fill" />
                  {t('pedido.modal_col.adicionar_campo')}
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
                          title={t('pedido.modal_col.inserir_campo', { label: campo.label })}
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
                      <span className="mnc-gabi-card__titulo">{t('pedido.modal_col.gabi_como_montar')}</span>
                    </div>
                    <p className="mnc-gabi-card__texto">
                      {t('pedido.modal_col.gabi_como_montar_texto')}
                    </p>
                  </div>
                )
                if (!formulaErro && !formulaGabi && !formulaValida) return null
                const variante = formulaErro ? 'erro' : formulaGabi ? 'aviso' : 'ok'
                const titulo   = formulaErro ? t('pedido.modal_col.gabi_erro_formula') : formulaGabi ? formulaGabi.titulo : t('pedido.modal_col.gabi_formula_valida')
                const texto    = formulaErro ?? formulaGabi?.texto ?? t('pedido.modal_col.gabi_formula_correta')
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
                          title={t('pedido.modal_col.usar_sugestao_tooltip')}
                        >
                          {t('pedido.modal_col.usar')}
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
              <MncLabelSecao
                icone={<ListBullets {...ICONE_LABEL_SECAO} />}
                obrigatorio
              >
                {t('pedido.modal_col.label_opcoes')}
              </MncLabelSecao>
              <div className="mnc-nova-opcao">
                <input
                  className="mnc-input mnc-input--como-select mnc-input--opcao"
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
              {erroCampo === 'opcoes' && erro && (
                <p className="mnc-erro-campo" role="alert">{erro}</p>
              )}
              <div className="mnc-opcoes-lista">
                {opcoes.length > 0 ? opcoes.map(opcao => (
                  <span key={opcao} className="mnc-opcao-chip">
                    {opcao}
                    <button
                      type="button"
                      className="mnc-opcao-remover"
                      onClick={() => handleRemoverOpcao(opcao)}
                      aria-label={t('pedido.modal_col.aria_remover_opcao', { opcao })}
                    >
                      <X size={10} weight="bold" />
                    </button>
                  </span>
                )) : (
                  <span className="mnc-opcoes-lista__vazio">
                    {t('pedido.modal_col.nenhuma_opcao')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Visibilidade */}
          <div className="mnc-campo">
            <MncLabelSecao
              icone={<Eye {...ICONE_LABEL_SECAO} />}
              obrigatorio
            >
              {t('pedido.modal_col.label_visibilidade')}
            </MncLabelSecao>
            <SelectGlobal
              id="mnc-visibilidade"
              buscavel={false}
              opcoes={VISIBILIDADE_OPCOES.map(o => ({ valor: o.valor, rotulo: t(o.labelKey) }))}
              valor={visibilidade}
              aoMudarValor={v => v != null && setVisibilidade(v as VisibilidadeColunaUsuario)}
            />
          </div>

          {/* Descrição — mesmo padrão/layout da visibilidade */}
          <div className="mnc-campo">
            <MncLabelSecao icone={<TextAlignLeft {...ICONE_LABEL_SECAO} />}>
              {t('pedido.modal_col.label_descricao')}
            </MncLabelSecao>
            <input
              id="mnc-descricao"
              className="mnc-input mnc-input--como-select"
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder={t('pedido.modal_col.placeholder_descricao')}
              maxLength={200}
            />
          </div>

          {/* Itens podem ter dados diferentes (toggle) */}
          <div className="mnc-campo mnc-campo--toggle-row">
            <div>
              <MncLabelSecao toggle icone={<Rows {...ICONE_LABEL_SECAO} />}>
                {t('pedido.modal_col.itens_diferentes')}
              </MncLabelSecao>
              <p className="mnc-hint">{t('pedido.modal_col.itens_diferentes_hint')}</p>
            </div>
            <MncToggle checked={itensDiferentes} onChange={setItensDiferentes} id="mnc-itens-dif" />
          </div>

          {itensDiferentes && (
            <>
              <div className="mnc-aviso-migracao" role="note">
                <Warning size={14} weight="fill" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.05rem' }} />
                <span>{t('pedido.modal_col.dados_nao_migrados')}</span>
              </div>

              <div className="mnc-campo mnc-campo--toggle-row">
                <div>
                  <MncLabelSecao toggle icone={<PencilSimple {...ICONE_LABEL_SECAO} />}>
                    {t('pedido.modal_col.pedido_editavel')}
                  </MncLabelSecao>
                  <p className="mnc-hint">{t('pedido.modal_col.pedido_editavel_hint')}</p>
                </div>
                <MncToggle checked={pedidoEditavel} onChange={setPedidoEditavel} id="mnc-pedido-edit" />
              </div>
            </>
          )}

          {/* Obrigatório */}
          {tipo !== 'formula' && (
            <div className="mnc-campo mnc-campo--toggle-row">
              <div>
                <MncLabelSecao toggle icone={<Asterisk {...ICONE_LABEL_SECAO} />}>
                  {t('pedido.modal_col.label_obrigatorio')}
                </MncLabelSecao>
                <p className="mnc-hint">{t('pedido.modal_col.obrigatorio_hint')}</p>
              </div>
              <MncToggle checked={obrigatorio} onChange={setObrigatorio} id="mnc-obrigatorio" />
            </div>
          )}

          {escopo === 'ambos' && (
            <div className="mnc-campo mnc-campo--toggle-row">
              <div>
                <MncLabelSecao
                  toggle
                  iconeDestaque
                  icone={<Warning {...ICONE_LABEL_SECAO} aria-hidden="true" />}
                >
                  {t('pedido.modal_col.alerta_divergencia_itens')}
                </MncLabelSecao>
                <p className="mnc-hint">{t('pedido.modal_col.alerta_divergencia_itens_hint')}</p>
              </div>
              <MncToggle checked={alertaDivergenciaItens} onChange={setAlertaDivergenciaItens} id="mnc-alerta-div" />
            </div>
          )}

        </div>
        ),
      }]}
    />
  )
}
