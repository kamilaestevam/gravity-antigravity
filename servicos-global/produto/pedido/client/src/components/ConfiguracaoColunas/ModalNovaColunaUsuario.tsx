/**
 * ModalNovaColuna.tsx — Modal para criar ou editar uma coluna customizada do usuário
 *
 * Ordem dos campos:
 *  1. Nome da Coluna
 *  2. Tipo (select com todos os tipos; readonly na edição)
 *  3. Opções da Lista (condicional: select / tipo_documento)
 *  4. Fórmula (condicional: formula)
 *  5. Escopo
 *  6. Visibilidade
 *  7. Obrigatório
 *  8. Valor Padrão
 *  9. Descrição
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X, Plus, Warning, Info, Columns } from '@phosphor-icons/react'
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
import './ModalNovaColuna.css'

// ── Opções de enum ────────────────────────────────────────────────────────────

const TIPO_OPCOES: { valor: TipoColunaUsuario; labelKey: string }[] = [
  { valor: 'texto',          labelKey: 'pedido.coluna_tipo.texto'          },
  { valor: 'numero',         labelKey: 'pedido.coluna_tipo.numero'         },
  { valor: 'data',           labelKey: 'pedido.coluna_tipo.data'           },
  { valor: 'select',         labelKey: 'pedido.coluna_tipo.select'         },
  { valor: 'checkbox',       labelKey: 'pedido.coluna_tipo.checkbox'       },
  { valor: 'percentual',     labelKey: 'pedido.coluna_tipo.percentual'     },
  { valor: 'tipo_documento', labelKey: 'pedido.coluna_tipo.tipo_documento' },
  { valor: 'formula',        labelKey: 'pedido.coluna_tipo.formula'        },
]

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalNovaColunaProps {
  colunaEdicao?: ColunaUsuario
  onFechar: () => void
  onSalvo: () => void
  camposDisponiveis?: string[]
  todasColunas?: ColunaUsuario[]
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

  const [nome, setNome]               = useState(colunaEdicao?.nome ?? '')
  const [tipo, setTipo]               = useState<TipoColunaUsuario>(colunaEdicao?.tipo ?? 'texto')
  const [escopo, setEscopo]           = useState<EscopoColunaUsuario>(colunaEdicao?.escopo ?? 'ambos')
  const [visibilidade, setVisibilidade] = useState<VisibilidadeColunaUsuario>(colunaEdicao?.visibilidade ?? 'todos')
  const [obrigatorio, setObrigatorio] = useState(colunaEdicao?.obrigatorio ?? false)
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
      const chaveProvisoria = colunaEdicao?.chave ?? (nome.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || '__nova__')
      const temCiclo = detectarCircular(chaveProvisoria, expressao, todasColunas)
      if (temCiclo) {
        setFormulaErro(t('pedido.modal_col.erro_circular'))
        setFormulaValida(false)
        return
      }
      setFormulaErro(null)
      setFormulaValida(true)
    } catch (err) {
      setFormulaErro(err instanceof Error ? t('pedido.modal_col.erro_sintaxe', { msg: err.message }) : t('pedido.modal_col.erro_formula_invalida_gen'))
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

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
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
    if (e.key === 'Enter') { e.preventDefault(); handleAdicionarOpcao() }
  }, [handleAdicionarOpcao])

  const handleSalvar = useCallback(async () => {
    const nomeTrimmed = nome.trim()
    if (!nomeTrimmed) { setErro(t('pedido.modal_col.erro_nome_obrigatorio')); return }
    if (tipoComOpcoes && opcoes.length === 0) { setErro(t('pedido.modal_col.erro_sem_opcoes')); return }
    if (tipoFormula) {
      if (!formulaExpressao.trim()) { setErro(t('pedido.modal_col.erro_formula_obrigatoria')); return }
      try { parsearFormula(formulaExpressao) } catch (err) {
        setErro(err instanceof Error ? t('pedido.modal_col.erro_formula_invalida', { msg: err.message }) : t('pedido.modal_col.erro_formula_invalida_gen'))
        return
      }
      if (formulaErro) { setErro(formulaErro); return }
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
      setErro(err instanceof Error ? err.message : 'Erro ao salvar coluna.')
    } finally {
      setSalvando(false)
    }
  }, [
    nome, tipo, escopo, visibilidade, obrigatorio,
    descricao, opcoes, tipoComOpcoes, tipoFormula, formulaExpressao,
    formulaErro, isEdicao, colunaEdicao, onSalvo,
  ])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onFechar])

  // ── Render ─────────────────────────────────────────────────────────────────

  return createPortal(
    <div
      className="mnc-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t(isEdicao ? 'pedido.modal_col.titulo_edicao' : 'pedido.modal_col.titulo_novo')}
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
    >
      <div className="mnc-modal">
        {/* ── Cabeçalho ── */}
        <div className="mnc-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Columns size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              <h2 className="mnc-titulo">{t(isEdicao ? 'pedido.modal_col.titulo_edicao' : 'pedido.modal_col.titulo_novo')}</h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ws-muted, var(--text-muted, #94a3b8))', lineHeight: 1.4 }}>
              {isEdicao ? 'Altere as propriedades da coluna personalizada' : 'Crie uma coluna personalizada para organizar seus pedidos'}
            </p>
          </div>
          <button type="button" className="mnc-fechar" onClick={onFechar} aria-label={t('pedido.modal_col.aria_fechar')}>
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* ── Corpo ── */}
        <div className="mnc-corpo">

          {/* 1. Nome da Coluna */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-nome">
              Nome da Coluna <span className="mnc-obrig">*</span>
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

          {/* 2. Tipo */}
          <SelectGlobal
            label="Tipo de Coluna"
            obrigatorio
            buscavel={false}
            desabilitado={isEdicao}
            opcoes={TIPO_OPCOES.map(o => ({ valor: o.valor, rotulo: t(o.labelKey) }))}
            valor={tipo}
            aoMudarValor={v => v != null && setTipo(v as TipoColunaUsuario)}
          />
          {isEdicao && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', margin: '-0.5rem 0 0', fontSize: '0.75rem', color: '#f59e0b' }}>
              <Warning size={13} weight="fill" style={{ flexShrink: 0 }} />
              O tipo da coluna não pode ser alterado após a criação.
            </p>
          )}

          {/* 3. Opções da Lista (condicional: select / tipo_documento) */}
          {tipoComOpcoes && (
            <div className="mnc-campo">
              <label className="mnc-label">
                Opções da Lista <span className="mnc-obrig">*</span>
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
                <button type="button" className="mnc-btn-add-opcao" onClick={handleAdicionarOpcao} aria-label={t('pedido.modal_col.aria_adicionar_opcao')}>
                  <Plus size={14} weight="bold" />
                </button>
              </div>
              <div className="mnc-opcoes-caixa">
                <span className="mnc-opcoes-caixa__label">
                  {opcoes.length > 0
                    ? `${opcoes.length} ${opcoes.length === 1 ? 'opção adicionada' : 'opções adicionadas'}`
                    : 'Nenhuma opção adicionada'}
                </span>
                {opcoes.length > 0 ? (
                  <div className="mnc-opcoes-lista">
                    {opcoes.map(opcao => (
                      <span key={opcao} className="mnc-opcao-chip">
                        {opcao}
                        <button type="button" className="mnc-opcao-remover" onClick={() => handleRemoverOpcao(opcao)} aria-label={`Remover opção ${opcao}`}>
                          <X size={10} weight="bold" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mnc-opcoes-vazio">
                    Adicione pelo menos uma opção para habilitar a criação da coluna.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Fórmula (condicional: formula) */}
          {tipoFormula && (
            <div className="mnc-campo">
              <label className="mnc-label" htmlFor="mnc-formula-expressao">
                {t('pedido.modal_col.label_formula')} <span className="mnc-obrig">*</span>
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
                placeholder={t('pedido.modal_col.placeholder_formula')}
                rows={3}
                spellCheck={false}
                aria-describedby={formulaErro ? 'mnc-formula-erro' : undefined}
              />
              {formulaErro && (
                <p id="mnc-formula-erro" className="mnc-formula-erro" role="alert">
                  <Warning size={14} weight="fill" style={{ flexShrink: 0, marginTop: '0.0625rem' }} />
                  {formulaErro}
                </p>
              )}
              {formulaValida && formulaExpressao.trim() && (
                <p className="mnc-formula-ok" aria-live="polite">{t('pedido.modal_col.formula_valida')}</p>
              )}
              {camposDisponiveis.length > 0 && (
                <div className="mnc-formula-campos">
                  <p className="mnc-formula-campos-titulo">
                    <Info size={13} weight="fill" />
                    {t('pedido.modal_col.campos_disponiveis')}
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
              <p className="mnc-formula-dica">{t('pedido.modal_col.formula_dica')}</p>
            </div>
          )}

          {/* 5. Escopo */}
          <SelectGlobal
            label="Escopo"
            obrigatorio
            buscavel={false}
            opcoes={ESCOPO_OPCOES.map(o => ({ valor: o.valor, rotulo: t(o.labelKey) }))}
            valor={escopo}
            aoMudarValor={v => v != null && setEscopo(v as EscopoColunaUsuario)}
          />

          {/* 6. Visibilidade */}
          <SelectGlobal
            label="Visibilidade"
            obrigatorio
            buscavel={false}
            opcoes={VISIBILIDADE_OPCOES.map(o => ({ valor: o.valor, rotulo: t(o.labelKey) }))}
            valor={visibilidade}
            aoMudarValor={v => v != null && setVisibilidade(v as VisibilidadeColunaUsuario)}
          />

          {/* 7. Obrigatório */}
          <div className="mnc-campo mnc-campo--inline">
            <label className="mnc-label-inline" htmlFor="mnc-obrigatorio">
              <input
                id="mnc-obrigatorio"
                type="checkbox"
                checked={obrigatorio}
                onChange={e => setObrigatorio(e.target.checked)}
                className="mnc-checkbox"
              />
              {t('pedido.modal_col.label_obrigatorio')}
            </label>
          </div>

          {/* 8. Descrição */}
          <div className="mnc-campo">
            <label className="mnc-label" htmlFor="mnc-descricao">Descrição</label>
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

        {/* ── Rodapé ── */}
        <div className="mnc-rodape">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={salvando}>
            {t('pedido.modal_col.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? t('pedido.modal_col.salvando', 'Salvando...') : t('pedido.modal_col.salvar')}
          </BotaoGlobal>
        </div>
      </div>
    </div>,
    document.body,
  )
}
