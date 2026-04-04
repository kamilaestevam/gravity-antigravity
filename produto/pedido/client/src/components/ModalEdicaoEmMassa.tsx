/**
 * ModalEdicaoEmMassa.tsx — Modal de edição em massa de pedidos
 *
 * Fluxo em 2 passos:
 *   Passo 1 — Selecionar campos + valores + preview em tempo real (debounce 300ms)
 *   Passo 2 — Confirmar: resumo com X pedidos · Y itens · Z campos + lista campo→valor
 *
 * Regras de negócio:
 *   - Campos bloqueados (calculados) nunca aparecem na lista editável
 *   - Campos com múltiplos valores entre pedidos: placeholder "Múltiplos valores"
 *   - Toggle de nível: Pedido / Item / Combinado
 *   - Preview em tempo real com debounce 300ms
 *   - Fechar com Escape
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Warning, Spinner, Plus, X, CheckCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type {
  Pedido,
  CampoEdicaoMassa,
  EdicaoMassaPayload,
  EdicaoMassaPreview,
  OperacaoCampo,
  TipoCampoEdicao,
} from '../shared/types'
import { CAMPOS_BLOQUEADOS_PEDIDO, CAMPOS_BLOQUEADOS_ITEM } from '../shared/types'
import { pedidoEdicaoMassaApi } from '../shared/api'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalEdicaoEmMassaProps {
  pedidos: Pedido[]
  onFechar: () => void
  onConcluido: () => void
}

// ── Definição de campos disponíveis para edição ───────────────────────────────

interface DefinicaoCampo {
  campo: string
  rotulo: string
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
}

const CAMPOS_PEDIDO_EDITAVEIS: DefinicaoCampo[] = [
  { campo: 'incoterm',             rotulo: 'Incoterm',              tipo: 'texto',  nivel: 'pedido' },
  { campo: 'moeda_pedido',         rotulo: 'Moeda',                 tipo: 'texto',  nivel: 'pedido' },
  { campo: 'data_embarque',        rotulo: 'Data de Embarque',      tipo: 'data',   nivel: 'pedido' },
  { campo: 'data_emissao_pedido',  rotulo: 'Data de Emissão',       tipo: 'data',   nivel: 'pedido' },
  { campo: 'cobertura_cambial',    rotulo: 'Cobertura Cambial',     tipo: 'texto',  nivel: 'pedido' },
  { campo: 'condicao_pagamento',   rotulo: 'Cond. Pagamento',       tipo: 'texto',  nivel: 'pedido' },
  { campo: 'exportador_nome',      rotulo: 'Exportador',            tipo: 'texto',  nivel: 'pedido' },
  { campo: 'porto_origem',         rotulo: 'Porto Origem',          tipo: 'texto',  nivel: 'pedido' },
  { campo: 'porto_destino',        rotulo: 'Porto Destino',         tipo: 'texto',  nivel: 'pedido' },
  { campo: 'numero_pedido',        rotulo: 'Número do Pedido',      tipo: 'texto',  nivel: 'pedido' },
]

const CAMPOS_ITEM_EDITAVEIS: DefinicaoCampo[] = [
  { campo: 'quantidade_inicial',   rotulo: 'Qtd. Inicial',          tipo: 'numero', nivel: 'item' },
  { campo: 'quantidade_transferida', rotulo: 'Qtd. Transferida',    tipo: 'numero', nivel: 'item' },
  { campo: 'valor_unitario',       rotulo: 'Valor Unitário',        tipo: 'numero', nivel: 'item' },
  { campo: 'data_embarque_item',   rotulo: 'Data Embarque (Item)',  tipo: 'data',   nivel: 'item' },
  { campo: 'part_number',          rotulo: 'Part Number',           tipo: 'texto',  nivel: 'item' },
]

const OPERACOES_POR_TIPO: Record<TipoCampoEdicao, { valor: OperacaoCampo; rotulo: string }[]> = {
  texto:   [{ valor: 'substituir', rotulo: 'Substituir' }],
  select:  [{ valor: 'substituir', rotulo: 'Substituir' }],
  usuario: [{ valor: 'substituir', rotulo: 'Substituir' }],
  numero: [
    { valor: 'substituir', rotulo: 'Substituir' },
    { valor: 'somar',      rotulo: 'Somar' },
    { valor: 'subtrair',   rotulo: 'Subtrair' },
    { valor: 'percentual', rotulo: 'Percentual (%)' },
  ],
  data: [
    { valor: 'substituir',   rotulo: 'Substituir' },
    { valor: 'avancar_dias', rotulo: 'Avançar dias' },
    { valor: 'recuar_dias',  rotulo: 'Recuar dias' },
  ],
}

const OPERACAO_LABELS: Record<OperacaoCampo, string> = {
  substituir:   'Substituir por',
  somar:        'Somar',
  subtrair:     'Subtrair',
  percentual:   'Aplicar %',
  avancar_dias: 'Avançar dias',
  recuar_dias:  'Recuar dias',
}

// ── Estado de um campo em edição ─────────────────────────────────────────────

interface CampoEmEdicao {
  uid: string             // chave única no UI (não é o campo em si)
  campo: string
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampo
  valor: string
}

function criarCampoVazio(def: DefinicaoCampo): CampoEmEdicao {
  const operacoes = OPERACOES_POR_TIPO[def.tipo]
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    campo: def.campo,
    tipo: def.tipo,
    nivel: def.nivel,
    operacao: operacoes[0].valor,
    valor: '',
  }
}

// ── Tipo de nível ─────────────────────────────────────────────────────────────

type NivelEdicao = 'pedido' | 'item' | 'combinado'

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectarMultiplosValores(pedidos: Pedido[], campo: string): boolean {
  const valores = pedidos.map(p => String((p as Record<string, unknown>)[campo] ?? ''))
  return new Set(valores).size > 1
}

function inputPlaceholder(campo: CampoEmEdicao, pedidos: Pedido[]): string {
  if (campo.nivel === 'pedido' && detectarMultiplosValores(pedidos, campo.campo)) {
    return 'Múltiplos valores'
  }
  return ''
}

function camposParaNivel(nivel: NivelEdicao): DefinicaoCampo[] {
  if (nivel === 'pedido')   return CAMPOS_PEDIDO_EDITAVEIS
  if (nivel === 'item')     return CAMPOS_ITEM_EDITAVEIS
  return [...CAMPOS_PEDIDO_EDITAVEIS, ...CAMPOS_ITEM_EDITAVEIS]
}

function estasBloqueado(campo: string, nivel: 'pedido' | 'item'): boolean {
  if (nivel === 'pedido') return CAMPOS_BLOQUEADOS_PEDIDO.has(campo)
  return CAMPOS_BLOQUEADOS_ITEM.has(campo)
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalEdicaoEmMassa({ pedidos, onFechar, onConcluido }: ModalEdicaoEmMassaProps) {
  const [passo, setPasso] = useState<1 | 2>(1)
  const [nivel, setNivel] = useState<NivelEdicao>('pedido')
  const [campos, setCampos] = useState<CampoEmEdicao[]>([])
  const [preview, setPreview] = useState<EdicaoMassaPreview | null>(null)
  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Inicializar com primeiro campo disponível
  useEffect(() => {
    const disponiveis = camposParaNivel(nivel)
    if (disponiveis.length > 0) {
      setCampos([criarCampoVazio(disponiveis[0])])
    }
    setPreview(null)
  }, [nivel])

  // Fechar com Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onFechar])

  // Preview em tempo real com debounce 300ms
  const solicitarPreview = useCallback(() => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '' && !estasBloqueado(c.campo, c.nivel))
    if (camposValidos.length === 0) {
      setPreview(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setCarregandoPreview(true)
      try {
        const payload: EdicaoMassaPayload = {
          pedido_ids: pedidos.map(p => p.id),
          campos: camposValidos.map(c => ({
            campo: c.campo,
            tipo: c.tipo,
            nivel: c.nivel,
            operacao: c.operacao,
            valor: c.tipo === 'numero' || c.operacao !== 'substituir' ? Number(c.valor) : c.valor,
          })),
          nivel,
        }
        const result = await pedidoEdicaoMassaApi.preview(payload)
        setPreview(result)
        setErroGeral(null)
      } catch (err: unknown) {
        setErroGeral(err instanceof Error ? err.message : 'Erro ao gerar preview')
      } finally {
        setCarregandoPreview(false)
      }
    }, 300)
  }, [campos, pedidos, nivel])

  // Reacionar a mudanças nos campos
  useEffect(() => {
    solicitarPreview()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [solicitarPreview])

  // ── Handlers de campos ───────────────────────────────────────────────────────

  const handleAdicionarCampo = useCallback(() => {
    const disponiveis = camposParaNivel(nivel)
    if (disponiveis.length > 0) {
      setCampos(prev => [...prev, criarCampoVazio(disponiveis[0])])
    }
  }, [nivel])

  const handleRemoverCampo = useCallback((uid: string) => {
    setCampos(prev => prev.filter(c => c.uid !== uid))
  }, [])

  const handleMudarCampoDef = useCallback((uid: string, novoCampo: string) => {
    const disponiveis = camposParaNivel(nivel)
    const def = disponiveis.find(d => d.campo === novoCampo)
    if (!def) return
    setCampos(prev => prev.map(c => {
      if (c.uid !== uid) return c
      const ops = OPERACOES_POR_TIPO[def.tipo]
      return { ...c, campo: def.campo, tipo: def.tipo, nivel: def.nivel, operacao: ops[0].valor, valor: '' }
    }))
  }, [nivel])

  const handleMudarOperacao = useCallback((uid: string, operacao: OperacaoCampo) => {
    setCampos(prev => prev.map(c => c.uid === uid ? { ...c, operacao } : c))
  }, [])

  const handleMudarValor = useCallback((uid: string, valor: string) => {
    setCampos(prev => prev.map(c => c.uid === uid ? { ...c, valor } : c))
  }, [])

  // ── Avancar para passo 2 ──────────────────────────────────────────────────────

  const handleAvancar = useCallback(() => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '')
    if (camposValidos.length === 0) {
      setErroGeral('Preencha ao menos um campo para continuar')
      return
    }
    setErroGeral(null)
    setPasso(2)
  }, [campos])

  // ── Confirmar edição em massa ─────────────────────────────────────────────────

  const handleConfirmar = useCallback(async () => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '' && !estasBloqueado(c.campo, c.nivel))
    if (camposValidos.length === 0) return

    setSalvando(true)
    setErroSalvar(null)

    const payload: EdicaoMassaPayload = {
      pedido_ids: pedidos.map(p => p.id),
      campos: camposValidos.map(c => ({
        campo: c.campo,
        tipo: c.tipo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.tipo === 'numero' || c.operacao !== 'substituir' ? Number(c.valor) : c.valor,
      })),
      nivel,
    }

    try {
      await pedidoEdicaoMassaApi.confirmar(payload)
      onConcluido()
    } catch (err: unknown) {
      setErroSalvar(err instanceof Error ? err.message : 'Erro ao aplicar edição em massa')
    } finally {
      setSalvando(false)
    }
  }, [campos, pedidos, nivel, onConcluido])

  // ── Render helpers ────────────────────────────────────────────────────────────

  const camposValidos = campos.filter(c => c.valor.trim() !== '')
  const disponiveis = camposParaNivel(nivel)

  const renderPasso1 = () => (
    <>
      {/* Toggle de nível */}
      <div className="modal-edicao-massa__secao">
        <div className="modal-edicao-massa__nivel-toggle" role="group" aria-label="Nível de edição">
          {(['pedido', 'item', 'combinado'] as NivelEdicao[]).map(n => (
            <button
              key={n}
              type="button"
              className={`modal-edicao-massa__nivel-btn${nivel === n ? ' modal-edicao-massa__nivel-btn--ativo' : ''}`}
              onClick={() => setNivel(n)}
              aria-pressed={nivel === n}
            >
              {n === 'pedido' ? 'Pedido' : n === 'item' ? 'Item' : 'Combinado'}
            </button>
          ))}
        </div>
      </div>

      <div className="modal-edicao-massa__separador" role="separator" />

      {/* Lista de campos */}
      <div className="modal-edicao-massa__secao">
        <p className="modal-edicao-massa__secao-titulo">Campos a editar</p>
        <div className="modal-edicao-massa__campos-lista">
          {campos.map(campo => {
            const ops = OPERACOES_POR_TIPO[campo.tipo]
            const temMultiplos = campo.nivel === 'pedido' && detectarMultiplosValores(pedidos, campo.campo)
            const placeholder = inputPlaceholder(campo, pedidos)

            return (
              <div key={campo.uid} className="modal-edicao-massa__campo-linha">
                {/* Seletor de campo */}
                <select
                  className="modal-edicao-massa__select"
                  value={campo.campo}
                  onChange={e => handleMudarCampoDef(campo.uid, e.target.value)}
                  aria-label="Campo a editar"
                >
                  {disponiveis.map(d => (
                    <option key={`${d.nivel}-${d.campo}`} value={d.campo}>
                      {d.rotulo}{d.nivel === 'item' ? ' (item)' : ''}
                    </option>
                  ))}
                </select>

                {/* Seletor de operação */}
                <select
                  className="modal-edicao-massa__select"
                  value={campo.operacao}
                  onChange={e => handleMudarOperacao(campo.uid, e.target.value as OperacaoCampo)}
                  aria-label={`Operação para ${campo.campo}`}
                >
                  {ops.map(op => (
                    <option key={op.valor} value={op.valor}>{op.rotulo}</option>
                  ))}
                </select>

                {/* Input de valor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    className="modal-edicao-massa__input"
                    type={campo.tipo === 'data' && campo.operacao === 'substituir' ? 'date'
                      : campo.tipo === 'numero' || campo.operacao !== 'substituir' ? 'number'
                      : 'text'}
                    value={campo.valor}
                    onChange={e => handleMudarValor(campo.uid, e.target.value)}
                    placeholder={placeholder || 'Novo valor...'}
                    aria-label={`Valor para ${campo.campo}`}
                  />
                  {temMultiplos && (
                    <span className="modal-edicao-massa__badge-multiplos">
                      <Warning size={11} weight="fill" aria-hidden="true" />
                      Múltiplos valores
                    </span>
                  )}
                </div>

                {/* Botão remover */}
                {campos.length > 1 && (
                  <button
                    type="button"
                    className="modal-edicao-massa__remover-campo"
                    onClick={() => handleRemoverCampo(campo.uid)}
                    aria-label={`Remover campo ${campo.campo}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Botão adicionar campo */}
        <button
          type="button"
          className="modal-edicao-massa__adicionar-campo"
          onClick={handleAdicionarCampo}
        >
          <Plus size={14} />
          Adicionar campo
        </button>
      </div>

      <div className="modal-edicao-massa__separador" role="separator" />

      {/* Preview em tempo real */}
      <div className="modal-edicao-massa__preview" aria-live="polite">
        <p className="modal-edicao-massa__preview-titulo">Preview</p>

        {carregandoPreview ? (
          <div className="modal-edicao-massa__preview-loading">
            <Spinner size={14} className="modal-edicao-massa__spinner" aria-hidden="true" />
            <span>Calculando impacto...</span>
          </div>
        ) : preview ? (
          <>
            <div className="modal-edicao-massa__preview-resumo">
              <div className="modal-edicao-massa__preview-stat">
                <strong>{preview.pedidos_afetados}</strong>
                <span>pedidos afetados</span>
              </div>
              {preview.itens_afetados > 0 && (
                <div className="modal-edicao-massa__preview-stat">
                  <strong>{preview.itens_afetados}</strong>
                  <span>itens afetados</span>
                </div>
              )}
              <div className="modal-edicao-massa__preview-stat">
                <strong>{preview.campos.length}</strong>
                <span>campos alterados</span>
              </div>
            </div>

            {preview.campos.length > 0 && (
              <div className="modal-edicao-massa__preview-campos">
                {preview.campos.map((c, i) => (
                  <div key={i} className="modal-edicao-massa__preview-campo">
                    <span className="modal-edicao-massa__preview-campo-nome">{c.campo}</span>
                    <span className="modal-edicao-massa__preview-campo-op">
                      {OPERACAO_LABELS[c.operacao]}
                    </span>
                    <span className="modal-edicao-massa__preview-campo-valor">{String(c.valor)}</span>
                    {c.multiplos_valores && (
                      <span className="modal-edicao-massa__badge-multiplos">
                        <Warning size={11} weight="fill" aria-hidden="true" />
                        múltiplos valores
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {preview.alertas_globais.length > 0 && preview.alertas_globais.map((alerta, i) => (
              <div key={i} className="modal-edicao-massa__alerta">
                <Warning size={14} weight="fill" aria-hidden="true" />
                {alerta}
              </div>
            ))}
          </>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--color-text-muted, #64748b)' }}>
            Preencha os campos acima para ver o impacto
          </span>
        )}
      </div>

      {erroGeral && (
        <div className="modal-edicao-massa__erro" role="alert">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {erroGeral}
        </div>
      )}
    </>
  )

  const renderPasso2 = () => (
    <div className="modal-edicao-massa__confirmacao">
      {/* Resumo */}
      <div className="modal-edicao-massa__confirmacao-resumo" aria-label="Resumo da edição em massa">
        <div className="modal-edicao-massa__confirmacao-stat">
          <strong>{preview?.pedidos_afetados ?? pedidos.length}</strong> pedidos serão afetados
        </div>
        {(preview?.itens_afetados ?? 0) > 0 && (
          <div className="modal-edicao-massa__confirmacao-stat">
            <strong>{preview?.itens_afetados}</strong> itens serão afetados
          </div>
        )}
        <div className="modal-edicao-massa__confirmacao-stat">
          <strong>{camposValidos.length}</strong> campos serão alterados
        </div>
      </div>

      {/* Lista de campos */}
      <div className="modal-edicao-massa__confirmacao-lista">
        {camposValidos.map(c => (
          <div key={c.uid} className="modal-edicao-massa__confirmacao-item">
            <span className="modal-edicao-massa__confirmacao-item-campo">
              {disponiveis.find(d => d.campo === c.campo)?.rotulo ?? c.campo}
            </span>
            <span className="modal-edicao-massa__confirmacao-item-op">
              {OPERACAO_LABELS[c.operacao]}
            </span>
            <span className="modal-edicao-massa__confirmacao-item-valor">{c.valor}</span>
            <span className="modal-edicao-massa__confirmacao-item-nivel">
              {c.nivel}
            </span>
          </div>
        ))}
      </div>

      {preview?.alertas_globais && preview.alertas_globais.length > 0 && (
        preview.alertas_globais.map((alerta, i) => (
          <div key={i} className="modal-edicao-massa__alerta">
            <Warning size={14} weight="fill" aria-hidden="true" />
            {alerta}
          </div>
        ))
      )}

      {erroSalvar && (
        <div className="modal-edicao-massa__erro" role="alert">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {erroSalvar}
        </div>
      )}
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div
      className="modal-edicao-massa__overlay"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edicao-massa-titulo"
    >
      <div className="modal-edicao-massa__container">
        {/* Header */}
        <div className="modal-edicao-massa__header">
          <h2 id="modal-edicao-massa-titulo" className="modal-edicao-massa__titulo">
            Editar em Massa ({pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} selecionado{pedidos.length !== 1 ? 's' : ''})
          </h2>
          <button
            className="modal-edicao-massa__fechar"
            onClick={onFechar}
            aria-label="Fechar modal de edição em massa"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Corpo */}
        <div className="modal-edicao-massa__corpo">
          {passo === 1 ? renderPasso1() : renderPasso2()}
        </div>

        {/* Footer */}
        <div className="modal-edicao-massa__footer">
          {/* Indicador de passos */}
          <div className="modal-edicao-massa__passos" aria-label="Passo atual">
            <span
              className={`modal-edicao-massa__passo${passo === 1 ? ' modal-edicao-massa__passo--ativo' : ' modal-edicao-massa__passo--concluido'}`}
              aria-current={passo === 1 ? 'step' : undefined}
            >
              {passo === 1 ? '1' : <CheckCircle size={12} weight="fill" aria-hidden="true" />}
            </span>
            <span className="modal-edicao-massa__passo-separador" />
            <span
              className={`modal-edicao-massa__passo${passo === 2 ? ' modal-edicao-massa__passo--ativo' : ''}`}
              aria-current={passo === 2 ? 'step' : undefined}
            >
              2
            </span>
          </div>

          <div className="modal-edicao-massa__footer-direita">
            {passo === 2 && (
              <BotaoGlobal
                variante="secundario"
                tamanho="medio"
                onClick={() => setPasso(1)}
                disabled={salvando}
              >
                Voltar
              </BotaoGlobal>
            )}

            <BotaoGlobal
              variante="secundario"
              tamanho="medio"
              onClick={onFechar}
              disabled={salvando}
            >
              Cancelar
            </BotaoGlobal>

            {passo === 1 ? (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={handleAvancar}
                disabled={camposValidos.length === 0 || carregandoPreview}
              >
                Revisar alterações
              </BotaoGlobal>
            ) : (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={handleConfirmar}
                disabled={salvando}
                aria-busy={salvando}
              >
                {salvando ? 'Aplicando...' : 'Aplicar em Massa'}
              </BotaoGlobal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
