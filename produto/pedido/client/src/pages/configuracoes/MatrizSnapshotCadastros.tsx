/**
 * MatrizSnapshotCadastros.tsx — Meta-configuração de snapshot do Pedido
 *
 * Objetivo
 * ─────────
 * Cada Pedido guarda um SNAPSHOT dos dados de cadastro (Importador, Exportador,
 * Agente, etc.) no momento em que é aberto. Se o registro-base muda no Cadastros
 * DEPOIS, esta matriz decide, para cada combinação Papel × Status-do-Pedido,
 * se o snapshot é re-sincronizado automaticamente OU se permanece congelado.
 *
 *   Linhas → Papéis de Empresa (Importador, Exportador, Fabricante, Agente,
 *            Despachante, Armador) — mesmas 6 flags do cadastro Empresa.
 *   Colunas → Status do Pedido (tabela dinâmica PedidoStatus do tenant).
 *   Célula  → toggle (SwitchGlobal). ON = "atualizar snapshot", OFF = "congelar".
 *
 * Persistência (MVP)
 * ──────────────────
 * localStorage, chaveado por tenantId. Quando o backend do Pedido ganhar o
 * endpoint dedicado (ver TODO abaixo), trocar `storage` pelo client de API
 * sem mudar a UI — shape é compatível.
 *
 * TODO(back): POST/GET `/api/v1/pedidos/config/snapshot-matriz` salvando
 * `{ papel, status_id, auto_atualizar: boolean }[]` na tabela de preferências
 * do Pedido. REGRA 02 impede alterar schema.prisma agora; o endpoint precisa
 * de aval do Coordenador para nova tabela ou reuso da existente.
 *
 * Isolamento
 * ──────────
 * Esta configuração pertence ao produto Pedido (afeta como ele lê o Cadastros).
 * Não é persistida no serviço de Cadastros.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Package, Truck, Factory, UserGear, ShieldStar, Boat,
  CheckSquare, Square, ArrowCounterClockwise,
} from '@phosphor-icons/react'
import { SwitchGlobal } from '@nucleo/switch-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import { pedidoConfigApi } from '../../shared/api'
import type { PedidoStatusConfig } from '../../shared/types'
import './MatrizSnapshotCadastros.css'

// ─── Papéis (rows) ────────────────────────────────────────────────────────────
// Mesma lista usada em EmpresasParceiros / ModalEditarEmpresa — fonte única de
// verdade seria um shared const, mas como a matriz está do lado do Pedido e o
// cadastro do lado do Cadastros, replicamos local por isolamento de serviço.

type PapelChave =
  | 'pode_ser_importador'
  | 'pode_ser_exportador'
  | 'pode_ser_fabricante'
  | 'pode_ser_agente'
  | 'pode_ser_despachante'
  | 'pode_ser_armador'

interface PapelDef {
  chave: PapelChave
  label: string
  descricao: string
  icone: React.ReactNode
  cor: string
}

const PAPEIS: PapelDef[] = [
  { chave: 'pode_ser_importador',  label: 'Importador',  descricao: 'Empresa que figura como importador no pedido',  icone: <Package    weight="duotone" size={16} />, cor: '#60a5fa' },
  { chave: 'pode_ser_exportador',  label: 'Exportador',  descricao: 'Empresa que figura como exportador no pedido',  icone: <Truck      weight="duotone" size={16} />, cor: '#34d399' },
  { chave: 'pode_ser_fabricante',  label: 'Fabricante',  descricao: 'Fabricante da mercadoria',                       icone: <Factory    weight="duotone" size={16} />, cor: '#fbbf24' },
  { chave: 'pode_ser_agente',      label: 'Agente',      descricao: 'Agente comercial ou de carga',                   icone: <UserGear   weight="duotone" size={16} />, cor: '#c084fc' },
  { chave: 'pode_ser_despachante', label: 'Despachante', descricao: 'Despachante aduaneiro / broker',                 icone: <ShieldStar weight="duotone" size={16} />, cor: '#f472b6' },
  { chave: 'pode_ser_armador',     label: 'Armador',     descricao: 'Companhia marítima armadora',                    icone: <Boat       weight="duotone" size={16} />, cor: '#22d3ee' },
]

// ─── Persistência ──────────────────────────────────────────────────────────────

// Matriz[papel][statusId] = true (atualiza automaticamente) | false (congela)
type Matriz = Record<PapelChave, Record<string, boolean>>

function matrizVazia(statusIds: string[]): Matriz {
  const base = {} as Matriz
  for (const p of PAPEIS) {
    base[p.chave] = {}
    for (const id of statusIds) base[p.chave][id] = false
  }
  return base
}

/**
 * Padrão recomendado: status "iniciais" (Rascunho, Em Emissão) atualizam
 * snapshot; status "finais" (Encerrado, Cancelado) congelam. Heurística
 * baseada em `ordem` (os 2 primeiros = iniciais, demais = finais).
 */
function matrizPadrao(statusList: PedidoStatusConfig[]): Matriz {
  const ordenados = [...statusList].sort((a, b) => a.ordem - b.ordem)
  const iniciais = new Set(ordenados.slice(0, 2).map(s => s.id))
  const base = {} as Matriz
  for (const p of PAPEIS) {
    base[p.chave] = {}
    for (const s of statusList) base[p.chave][s.id] = iniciais.has(s.id)
  }
  return base
}

const STORAGE_PREFIX = 'pedido:matriz-snapshot-cadastros:v1'

function storageKey(tenantId: string | undefined): string {
  return `${STORAGE_PREFIX}:${tenantId ?? 'anon'}`
}

function carregarMatriz(tenantId: string | undefined, statusIds: string[]): Matriz | null {
  try {
    const raw = localStorage.getItem(storageKey(tenantId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Matriz>
    // Sanitiza contra status removidos / adicionados entre sessões
    const safe = {} as Matriz
    for (const p of PAPEIS) {
      safe[p.chave] = {}
      for (const id of statusIds) {
        safe[p.chave][id] = parsed?.[p.chave]?.[id] === true
      }
    }
    return safe
  } catch {
    return null
  }
}

function salvarMatriz(tenantId: string | undefined, matriz: Matriz): void {
  try {
    localStorage.setItem(storageKey(tenantId), JSON.stringify(matriz))
  } catch { /* quota / modo privado — silencioso */ }
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function MatrizSnapshotCadastros() {
  const currentUser    = useShellStore(s => s.currentUser)
  const addNotification = useShellStore(s => s.addNotification)
  const tenantId       = currentUser?.tenantId

  const [statusList, setStatusList] = useState<PedidoStatusConfig[]>([])
  const [matriz, setMatriz]         = useState<Matriz | null>(null)
  const [snapshot, setSnapshot]     = useState<Matriz | null>(null)  // baseline p/ cancelar
  const [loading, setLoading]       = useState(true)

  // Carrega status + matriz salva
  useEffect(() => {
    let cancelado = false
    setLoading(true)
    pedidoConfigApi.listarStatus()
      .then(res => {
        if (cancelado) return
        // Blindagem: res ou res.data podem vir fora do shape esperado se o
        // backend estiver temporariamente fora do ar e o proxy devolver HTML.
        const bruto = Array.isArray(res?.data) ? res.data : []
        const lista = bruto.slice().sort((a, b) => (a?.ordem ?? 0) - (b?.ordem ?? 0))
        setStatusList(lista)
        const ids = lista.map(s => s.id).filter(Boolean)
        const salva = carregarMatriz(tenantId, ids) ?? matrizVazia(ids)
        setMatriz(salva)
        setSnapshot(salva)
      })
      .catch(() => {
        if (cancelado) return
        setStatusList([])
        setMatriz(matrizVazia([]))
        setSnapshot(matrizVazia([]))
        addNotification({ type: 'error', message: 'Erro ao carregar status do Pedido.' })
      })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [tenantId, addNotification])

  const alterouDesdeCarga = useMemo(() => {
    if (!matriz || !snapshot) return false
    return JSON.stringify(matriz) !== JSON.stringify(snapshot)
  }, [matriz, snapshot])

  // ── Ações de célula ──
  function toggleCell(papel: PapelChave, statusId: string) {
    setMatriz(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [papel]: { ...prev[papel], [statusId]: !prev[papel][statusId] },
      }
    })
  }

  function toggleLinha(papel: PapelChave, valor: boolean) {
    setMatriz(prev => {
      if (!prev) return prev
      const novaLinha: Record<string, boolean> = {}
      for (const s of statusList) novaLinha[s.id] = valor
      return { ...prev, [papel]: novaLinha }
    })
  }

  function toggleColuna(statusId: string, valor: boolean) {
    setMatriz(prev => {
      if (!prev) return prev
      const nova = { ...prev } as Matriz
      for (const p of PAPEIS) nova[p.chave] = { ...nova[p.chave], [statusId]: valor }
      return nova
    })
  }

  function marcarTodos(valor: boolean) {
    setMatriz(matrizVazia(statusList.map(s => s.id)))
    if (valor) {
      const cheia = {} as Matriz
      for (const p of PAPEIS) {
        cheia[p.chave] = {}
        for (const s of statusList) cheia[p.chave][s.id] = true
      }
      setMatriz(cheia)
    }
  }

  function aplicarPadrao() {
    setMatriz(matrizPadrao(statusList))
  }

  function salvar() {
    if (!matriz) return
    salvarMatriz(tenantId, matriz)
    setSnapshot(matriz)
    addNotification({ type: 'success', message: 'Matriz de snapshot salva.' })
  }

  function cancelar() {
    if (snapshot) setMatriz(snapshot)
  }

  // ── Render ──
  return (
    <section className="cfg-secao">
      <div className="cfg-secao__header">
        <div>
          <h2 className="cfg-secao__titulo">Matriz de Snapshot — Cadastros</h2>
          <p className="cfg-secao__desc">
            Cada pedido guarda uma cópia (snapshot) dos dados do cadastro no momento
            em que é aberto. Use esta matriz para decidir, por <strong>papel</strong> e
            <strong> status do pedido</strong>, se o snapshot deve ser re-sincronizado
            automaticamente quando o cadastro-base for alterado.
          </p>
        </div>
        <div className="msc-header-actions">
          <TooltipGlobal descricao="Marca os status iniciais e congela os finais">
            <button type="button" className="msc-mini-btn" onClick={aplicarPadrao}>
              <ArrowCounterClockwise size={13} weight="bold" />
              Padrão recomendado
            </button>
          </TooltipGlobal>
          <TooltipGlobal descricao="Habilita todas as células">
            <button type="button" className="msc-mini-btn" onClick={() => marcarTodos(true)}>
              <CheckSquare size={13} weight="bold" />
              Marcar todos
            </button>
          </TooltipGlobal>
          <TooltipGlobal descricao="Desabilita todas as células">
            <button type="button" className="msc-mini-btn" onClick={() => marcarTodos(false)}>
              <Square size={13} weight="bold" />
              Desmarcar todos
            </button>
          </TooltipGlobal>
        </div>
      </div>

      {loading && (
        <div className="msc-loading">
          <span className="msc-spinner" aria-hidden="true" />
          <span>Carregando status do Pedido…</span>
        </div>
      )}

      {!loading && statusList.length === 0 && (
        <p className="msc-feedback msc-feedback--aviso">
          Nenhum status cadastrado. Cadastre ao menos um status do Pedido em
          <strong> Configurações &gt; Status</strong> antes de configurar a matriz.
        </p>
      )}

      {!loading && statusList.length > 0 && matriz && (
        <div className="msc-tabela-wrapper">
          <table className="msc-tabela" role="grid" aria-label="Matriz de snapshot — papéis por status">
            <thead>
              <tr>
                <th scope="col" className="msc-th msc-th--papel">Papel \ Status</th>
                {statusList?.map(s => (
                  <th key={s.id} scope="col" className="msc-th msc-th--status">
                    <button
                      type="button"
                      className="msc-status-header"
                      onClick={() => {
                        const algumOff = PAPEIS.some(p => !(matriz?.[p.chave]?.[s.id]))
                        toggleColuna(s.id, algumOff)
                      }}
                      title="Clique para alternar a coluna inteira"
                    >
                      <span className="msc-status-dot" style={{ background: s.cor }} />
                      <span className="msc-status-label">{s.rotulo}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAPEIS.map(p => {
                const linha = matriz?.[p.chave] ?? {}
                const todosOn = statusList.length > 0 && statusList.every(s => !!linha[s.id])
                return (
                  <tr key={p.chave}>
                    <th scope="row" className="msc-td msc-td--papel">
                      <button
                        type="button"
                        className="msc-papel-label"
                        onClick={() => toggleLinha(p.chave, !todosOn)}
                        title="Clique para alternar a linha inteira"
                      >
                        <span className="msc-papel-icone" style={{ color: p.cor }}>{p.icone}</span>
                        <span>
                          <span className="msc-papel-nome">{p.label}</span>
                          <span className="msc-papel-desc">{p.descricao}</span>
                        </span>
                      </button>
                    </th>
                    {statusList?.map(s => (
                      <td key={s.id} className="msc-td msc-td--cell">
                        <SwitchGlobal
                          checked={!!linha[s.id]}
                          onChange={() => toggleCell(p.chave, s.id)}
                          id={`msc-${p.chave}-${s.id}`}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>

          <p className="msc-legenda">
            <strong>Ligado</strong> = o snapshot é re-sincronizado quando o cadastro-base
            muda enquanto o pedido está neste status.
            <br />
            <strong>Desligado</strong> = o snapshot permanece congelado — alterações no
            cadastro-base não alcançam pedidos neste status.
          </p>
        </div>
      )}

      {!loading && statusList.length > 0 && (
        <div className="cfg-secao__footer">
          <BotaoCancelar onClick={cancelar} dirty={alterouDesdeCarga} />
          <BotaoSalvar onClick={salvar} dirty={alterouDesdeCarga} />
        </div>
      )}
    </section>
  )
}
