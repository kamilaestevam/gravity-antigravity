/**
 * ModalNovaColuna.tsx — Modal para criar ou editar uma coluna customizada do usuário
 *
 * Quando tipo = 'select' ou 'tipo_documento': exibe campo para gerenciar opções da lista.
 * Quando tipo = 'formula': exibe construtor de expressão com validação em tempo real.
 * Na edição, o tipo é exibido mas não pode ser alterado.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { X, Plus, Trash, Warning, Info } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
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
import './ModalNovaColuna.css'

// ── Opções de enum ────────────────────────────────────────────────────────────

const TIPO_OPCOES: { valor: TipoColunaUsuario; label: string }[] = [
  { valor: 'texto',          label: 'Texto'              },
  { valor: 'numero',         label: 'Número'             },
  { valor: 'data',           label: 'Data'               },
  { valor: 'select',         label: 'Select (lista)'     },
  { valor: 'checkbox',       label: 'Checkbox'           },
  { valor: 'percentual',     label: 'Percentual (%)'     },
  { valor: 'tipo_documento', label: 'Tipo de Documento'  },
  { valor: 'formula',        label: 'Fórmula'            },
]

const ESCOPO_OPCOES: { valor: EscopoColunaUsuario; label: string }[] = [
  { valor: 'pedido', label: 'Pedido'       },
  { valor: 'item',   label: 'Item'         },
  { valor: 'ambos',  label: 'Ambos'        },
]

const VISIBILIDADE_OPCOES: { valor: VisibilidadeColunaUsuario; label: string }[] = [
  { valor: 'todos',   label: 'Todos do tenant' },
  { valor: 'roles',   label: 'Por perfil/role' },
  { valor: 'privado', label: 'Só eu'           },
]

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

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalNovaColuna({
  colunaEdicao,
  onFechar,
  onSalvo,
  camposDisponiveis = [],
  todasColunas = [],
}: ModalNovaColunaProps) {
  const isEdicao = Boolean(colunaEdicao)

  const [nome, setNome]               = useState(colunaEdicao?.nome ?? '')
  const [tipo, setTipo]               = useState<TipoColunaUsuario>(colunaEdicao?.tipo ?? 'texto')
  const [escopo, setEscopo]           = useState<EscopoColunaUsuario>(colunaEdicao?.escopo ?? 'pedido')
  const [visibilidade, setVisibilidade] = useState<VisibilidadeColunaUsuario>(colunaEdicao?.visibilidade ?? 'todos')
  const [obrigatorio, setObrigatorio] = useState(colunaEdicao?.obrigatorio ?? false)
  const [valorPadrao, setValorPadrao] = useState(colunaEdicao?.valor_padrao ?? '')
  const [descricao, setDescricao]     = useState(colunaEdicao?.descricao ?? '')
  const [opcoes, setOpcoes]           = useState<string[]>(colunaEdicao?.opcoes ?? [])
  const [novaOpcao, setNovaOpcao]     = useState('')
  const [salvando, setSalvando]       = useState(false)
  const [erro, setErro]               = useState<string | null>(null)

  // ── Estado para fórmula ────────────────────────────────────────────────────
  const [formulaExpressao, setFormulaExpressao] = useState(colunaEdicao?.formula_expressao ?? '')
  const [formulaErro, setFormulaErro]           = useState<string | null>(null)
  const [formulaValida, setFormulaValida]        = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tipoComOpcoes = tipo === 'select' || tipo === 'tipo_documento'
  const tipoFormula   = tipo === 'formula'

  // ── Validação de fórmula com debounce ────────────────────────────────────────
  const validarFormula = useCallback((expressao: string) => {
    if (!expressao.trim()) {
      setFormulaErro(null)
      setFormulaValida(false)
      return
    }
    try {
      parsearFormula(expressao)

      // Verifica ciclo: usa chave existente ou derivada do nome (slug provisório)
      const chaveProvisoria = colunaEdicao?.chave ?? nome.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || '__nova__'
      const temCiclo = detectarCircular(chaveProvisoria, expressao, todasColunas)
      if (temCiclo) {
        setFormulaErro('Referência circular detectada: a fórmula cria um ciclo de dependências. Remova a referência que aponta de volta para esta coluna.')
        setFormulaValida(false)
        return
      }

      setFormulaErro(null)
      setFormulaValida(true)
    } catch (err) {
      setFormulaErro(err instanceof Error ? `Erro de sintaxe: ${err.message}` : 'Fórmula inválida')
      setFormulaValida(false)
    }
  }, [colunaEdicao, nome, todasColunas])

  const handleFormulaChange = useCallback((valor: string) => {
    setFormulaExpressao(valor)
    setFormulaValida(false)
    setFormulaErro(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { validarFormula(valor) }, 500)
  }, [validarFormula])

  // Limpa timeout ao desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

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

  const handleSalvar = useCallback(async () => {
    const nomeTrimmed = nome.trim()
    if (!nomeTrimmed) {
      setErro('O nome da coluna é obrigatório.')
      return
    }
    if (tipoComOpcoes && opcoes.length === 0) {
      setErro('Adicione ao menos uma opção à lista.')
      return
    }
    if (tipoFormula) {
      if (!formulaExpressao.trim()) {
        setErro('A expressão da fórmula é obrigatória.')
        return
      }
      // Força validação síncrona antes de salvar
      try {
        parsearFormula(formulaExpressao)
      } catch (err) {
        setErro(err instanceof Error ? `Fórmula inválida: ${err.message}` : 'Fórmula inválida.')
        return
      }
      if (formulaErro) {
        setErro(formulaErro)
        return
      }
    }

    setSalvando(true)
    setErro(null)

    const formulaDeps = tipoFormula ? extrairDependencias(formulaExpressao) : undefined

    const payload = {
      nome: nomeTrimmed,
      tipo,
      escopo,
      visibilidade,
      obrigatorio,
      valor_padrao: valorPadrao.trim() || undefined,
      descricao: descricao.trim() || undefined,
      opcoes: tipoComOpcoes ? opcoes : undefined,
      formula_expressao: tipoFormula ? formulaExpressao.trim() : undefined,
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
    descricao, opcoes, tipoComOpcoes, tipoFormula, formulaExpressao,
    formulaErro, isEdicao, colunaEdicao, onSalvo,
  ])

  // Fecha com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onFechar])

  return (
    <div
      className="mnc-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEdicao ? 'Editar coluna' : 'Nova coluna'}
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
    >
      <div className="mnc-modal">
        {/* Cabeçalho */}
        <div className="mnc-header">
          <h2 className="mnc-titulo">{isEdicao ? 'Editar Coluna' : 'Nova Coluna'}</h2>
          <button
            type="button"
            className="mnc-fechar"
            onClick={onFechar}
            aria-label="Fechar modal"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Corpo */}
        <div className="mnc-corpo">
          {/* Nome */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-nome">
              Nome <span className="mnc-obrig">*</span>
            </label>
            <input
              id="mnc-nome"
              className="mnc-input"
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              maxLength={60}
              placeholder="Ex: Margem %, Prioridade"
              autoFocus
            />
          </div>

          {/* Tipo */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-tipo">
              Tipo <span className="mnc-obrig">*</span>
            </label>
            {isEdicao ? (
              <input
                id="mnc-tipo"
                className="mnc-input mnc-input--readonly"
                type="text"
                value={TIPO_OPCOES.find(o => o.valor === tipo)?.label ?? tipo}
                readOnly
                aria-description="O tipo não pode ser alterado após a criação"
              />
            ) : (
              <select
                id="mnc-tipo"
                className="mnc-select"
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoColunaUsuario)}
              >
                {TIPO_OPCOES.map(o => (
                  <option key={o.valor} value={o.valor}>{o.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Escopo */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-escopo">
              Escopo <span className="mnc-obrig">*</span>
            </label>
            <select
              id="mnc-escopo"
              className="mnc-select"
              value={escopo}
              onChange={e => setEscopo(e.target.value as EscopoColunaUsuario)}
            >
              {ESCOPO_OPCOES.map(o => (
                <option key={o.valor} value={o.valor}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Visibilidade */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-visibilidade">
              Visibilidade <span className="mnc-obrig">*</span>
            </label>
            <select
              id="mnc-visibilidade"
              className="mnc-select"
              value={visibilidade}
              onChange={e => setVisibilidade(e.target.value as VisibilidadeColunaUsuario)}
            >
              {VISIBILIDADE_OPCOES.map(o => (
                <option key={o.valor} value={o.valor}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Obrigatório */}
          <div className="mnc-campo mnc-campo--inline">
            <label className="mnc-label-inline" htmlFor="mnc-obrigatorio">
              <input
                id="mnc-obrigatorio"
                type="checkbox"
                checked={obrigatorio}
                onChange={e => setObrigatorio(e.target.checked)}
                className="mnc-checkbox"
              />
              Obrigatório
            </label>
          </div>

          {/* Valor padrão */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-valor-padrao">Valor padrão</label>
            <input
              id="mnc-valor-padrao"
              className="mnc-input"
              type="text"
              value={valorPadrao}
              onChange={e => setValorPadrao(e.target.value)}
              placeholder="Deixe em branco para não definir"
            />
          </div>

          {/* Descrição */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-descricao">Descrição</label>
            <input
              id="mnc-descricao"
              className="mnc-input"
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descrição auxiliar exibida como tooltip"
              maxLength={200}
            />
          </div>

          {/* Opções (select / tipo_documento) */}
          {tipoComOpcoes && (
            <div className="mnc-campo">
              <label className="mnc-label">
                Opções da lista <span className="mnc-obrig">*</span>
              </label>
              <div className="mnc-opcoes-lista">
                {opcoes.map(opcao => (
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
                ))}
              </div>
              <div className="mnc-nova-opcao">
                <input
                  className="mnc-input mnc-input--opcao"
                  type="text"
                  value={novaOpcao}
                  onChange={e => setNovaOpcao(e.target.value)}
                  onKeyDown={handleOpcaoKeyDown}
                  placeholder="Digite e pressione Enter ou clique em +"
                  aria-label="Nova opção da lista"
                />
                <button
                  type="button"
                  className="mnc-btn-add-opcao"
                  onClick={handleAdicionarOpcao}
                  aria-label="Adicionar opção"
                >
                  <Plus size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* Fórmula */}
          {tipoFormula && (
            <div className="mnc-campo">
              <label className="mnc-label" htmlFor="mnc-formula-expressao">
                Expressão da fórmula <span className="mnc-obrig">*</span>
              </label>
              <textarea
                id="mnc-formula-expressao"
                className={[
                  'mnc-textarea',
                  formulaErro ? 'mnc-textarea--erro' : '',
                  formulaValida && formulaExpressao.trim() ? 'mnc-textarea--valida' : '',
                ].filter(Boolean).join(' ')}
                value={formulaExpressao}
                onChange={e => handleFormulaChange(e.target.value)}
                placeholder="ex: quantidade_pedida - quantidade_transferida"
                rows={3}
                spellCheck={false}
                aria-describedby={formulaErro ? 'mnc-formula-erro' : undefined}
              />

              {/* Feedback de validação */}
              {formulaErro && (
                <p id="mnc-formula-erro" className="mnc-formula-erro" role="alert">
                  <Warning size={14} weight="fill" style={{ flexShrink: 0, marginTop: '0.0625rem' }} />
                  {formulaErro}
                </p>
              )}
              {formulaValida && formulaExpressao.trim() && (
                <p className="mnc-formula-ok" aria-live="polite">
                  Fórmula válida
                </p>
              )}

              {/* Campos disponíveis */}
              {camposDisponiveis.length > 0 && (
                <div className="mnc-formula-campos">
                  <p className="mnc-formula-campos-titulo">
                    <Info size={13} weight="fill" />
                    Campos disponíveis
                  </p>
                  <div className="mnc-formula-chips">
                    {camposDisponiveis.map(campo => (
                      <button
                        key={campo}
                        type="button"
                        className="mnc-formula-chip"
                        title={`Inserir referência: ${campo}`}
                        onClick={() => {
                          const textarea = document.getElementById('mnc-formula-expressao') as HTMLTextAreaElement | null
                          if (textarea) {
                            const inicio = textarea.selectionStart
                            const fim    = textarea.selectionEnd
                            const nova   = formulaExpressao.slice(0, inicio) + campo + formulaExpressao.slice(fim)
                            handleFormulaChange(nova)
                            // Reposiciona o cursor após a inserção
                            requestAnimationFrame(() => {
                              textarea.focus()
                              textarea.setSelectionRange(inicio + campo.length, inicio + campo.length)
                            })
                          } else {
                            handleFormulaChange(formulaExpressao ? `${formulaExpressao} ${campo}` : campo)
                          }
                        }}
                      >
                        {campo}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dica de sintaxe */}
              <p className="mnc-formula-dica">
                Suporta <code>+</code> <code>-</code> <code>*</code> <code>/</code> e funções{' '}
                <code>SE(cond, sim, não)</code> e <code>SOMA_ITENS(campo)</code>.
              </p>
            </div>
          )}

          {/* Erro */}
          {erro && (
            <p className="mnc-erro" role="alert">{erro}</p>
          )}
        </div>

        {/* Rodapé */}
        <div className="mnc-rodape">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={salvando}>
            Cancelar
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleSalvar}
            carregando={salvando}
          >
            Salvar
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
