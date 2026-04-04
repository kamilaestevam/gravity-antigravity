/**
 * ModalNovaColuna.tsx — Modal para criar ou editar uma coluna customizada do usuário
 *
 * Quando tipo = 'select' ou 'tipo_documento': exibe campo para gerenciar opções da lista.
 * Na edição, o tipo é exibido mas não pode ser alterado.
 */

import React, { useState, useCallback, useEffect } from 'react'
import { X, Plus, Trash } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type {
  ColunaUsuario,
  TipoColunaUsuario,
  EscopoColunaUsuario,
  VisibilidadeColunaUsuario,
} from '../../shared/types'
import { colunasUsuarioApi } from '../../shared/api'
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
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalNovaColuna({ colunaEdicao, onFechar, onSalvo }: ModalNovaColunaProps) {
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

  const tipoComOpcoes = tipo === 'select' || tipo === 'tipo_documento'

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

    setSalvando(true)
    setErro(null)

    const payload = {
      nome: nomeTrimmed,
      tipo,
      escopo,
      visibilidade,
      obrigatorio,
      valor_padrao: valorPadrao.trim() || undefined,
      descricao: descricao.trim() || undefined,
      opcoes: tipoComOpcoes ? opcoes : undefined,
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
    descricao, opcoes, tipoComOpcoes, isEdicao, colunaEdicao, onSalvo,
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
