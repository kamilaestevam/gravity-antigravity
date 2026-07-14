import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CaretDown,
  CaretRight,
  CheckCircle,
  Funnel,
  Info,
  PencilSimpleLine,
  Plus,
  Spinner,
  Warning,
  X,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ResultadoAcao } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { ModalPassoPassoGlobal } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import type { PassoConfig } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import '../../../Modais/modal-passo-passo-global/src/modal-passo-passo.css'
import '../../../../servicos-global/produto/pedido/client/src/components/ModalPedidosEdicaoMassa.css'
import {
  OPERACOES_POR_TIPO_MASSA_SIMULADOR,
  ROTULOS_OPERACAO_MASSA_SIMULADOR,
  ROTULOS_OPERACAO_RESUMO_MASSA_SIMULADOR,
  camposEdicaoMassaParaNivelSimulador,
  formataNcmSimulador,
  type DefinicaoCampoEdicaoMassaSimulador,
  type NivelEdicaoMassaSimulador,
  type OperacaoCampoMassaSimulador,
} from './campos-edicao-massa-simulador-pedido'
import type { LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'
import {
  aplicarEdicaoMassaListaSimulador,
  criarCampoEdicaoVazioSimulador,
  detectarMultiplosValoresPedidoSimulador,
  gerarPreviewEdicaoMassaSimulador,
  montarTituloModalEdicaoMassaSimulador,
  type CampoEmEdicaoMassaSimulador,
  type PreviewEdicaoMassaSimulador,
  type ResumoEdicaoMassaListaSimulador,
} from './edicao-massa-lista-simulador-pedido'
import {
  selecaoTemTiposOperacaoIncompativeis,
  type SelecaoListaSimuladorPedido,
} from './regras-acoes-barra-lista-simulador-pedido'

type Props = {
  aberto: boolean
  selecao: SelecaoListaSimuladorPedido
  linhas: readonly LinhaListaPedidoSimulador[]
  onFechar: () => void
  onConfirmar: (payload: {
    nivel: NivelEdicaoMassaSimulador
    campos: CampoEmEdicaoMassaSimulador[]
    selecao: SelecaoListaSimuladorPedido
  }) => ResumoEdicaoMassaListaSimulador
}

const PASSOS: PassoConfig[] = [
  { id: 1, label: 'Campos' },
  { id: 2, label: 'Revisão' },
  { id: 3, label: 'Resultado' },
]

function dateToIsoBr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isoToDataBr(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export function ModalEdicaoMassaListaSimuladorPedido({
  aberto,
  selecao,
  linhas,
  onFechar,
  onConfirmar,
}: Props) {
  const [passo, setPasso] = useState<1 | 2 | 3>(1)
  const [nivel, setNivel] = useState<NivelEdicaoMassaSimulador>('combinado')
  const [campos, setCampos] = useState<CampoEmEdicaoMassaSimulador[]>([])
  const [preview, setPreview] = useState<PreviewEdicaoMassaSimulador | null>(null)
  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [feedbackBotao, setFeedbackBotao] = useState<ResultadoAcao>(null)
  const [resumo, setResumo] = useState<ResumoEdicaoMassaListaSimulador | null>(null)
  const [filtroRevisao, setFiltroRevisao] = useState<'todos' | 'alterados' | 'sem-efeito'>('todos')
  const [filtroPedido, setFiltroPedido] = useState<string | null>(null)
  const [deparaAbertos, setDeparaAbertos] = useState<Set<string>>(new Set())
  const [selecaoCongelada, setSelecaoCongelada] = useState(selecao)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pedidos = selecaoCongelada.pedidos
  const temTiposMistos = useMemo(() => selecaoTemTiposOperacaoIncompativeis(selecaoCongelada), [selecaoCongelada])

  const disponiveis = useMemo(
    () => camposEdicaoMassaParaNivelSimulador(nivel, pedidos),
    [nivel, pedidos],
  )

  useEffect(() => {
    if (!aberto) return
    setPasso(1)
    setNivel('combinado')
    setPreview(null)
    setErroGeral(null)
    setSalvando(false)
    setFeedbackBotao(null)
    setResumo(null)
    setFiltroRevisao('todos')
    setFiltroPedido(null)
    setDeparaAbertos(new Set())
    setSelecaoCongelada(selecao)
    const iniciais = camposEdicaoMassaParaNivelSimulador('combinado', selecao.pedidos)
    setCampos(iniciais.length > 0 ? [criarCampoEdicaoVazioSimulador(iniciais[0])] : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot na abertura
  }, [aberto])

  useEffect(() => {
    const defs = camposEdicaoMassaParaNivelSimulador(nivel, pedidos)
    if (defs.length > 0) {
      setCampos([criarCampoEdicaoVazioSimulador(defs[0])])
    } else {
      setCampos([])
    }
    setPreview(null)
  }, [nivel, pedidos])

  const solicitarPreview = useCallback(() => {
    const camposValidos = campos.filter((c) => c.valor.trim() !== '')
    if (camposValidos.length === 0) {
      setPreview(null)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setCarregandoPreview(true)
      try {
        setPreview(gerarPreviewEdicaoMassaSimulador(linhas, selecaoCongelada, nivel, campos))
        setErroGeral(null)
      } finally {
        setCarregandoPreview(false)
      }
    }, 300)
  }, [campos, linhas, selecaoCongelada, nivel])

  useEffect(() => {
    solicitarPreview()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [solicitarPreview])

  const fechar = useCallback(() => {
    setPasso(1)
    setResumo(null)
    onFechar()
  }, [onFechar])

  const handleAdicionarCampo = useCallback(() => {
    if (disponiveis.length === 0) return
    setCampos((prev) => [...prev, criarCampoEdicaoVazioSimulador(disponiveis[0])])
  }, [disponiveis])

  const handleRemoverCampo = useCallback((uid: string) => {
    setCampos((prev) => prev.filter((c) => c.uid !== uid))
  }, [])

  const handleMudarCampoDef = useCallback((uid: string, novoCampo: string) => {
    const def = disponiveis.find((d) => d.campo === novoCampo)
    if (!def) return
    const ops = OPERACOES_POR_TIPO_MASSA_SIMULADOR[def.tipo]
    setCampos((prev) =>
      prev.map((c) =>
        c.uid === uid
          ? { ...c, campo: def.campo, tipo: def.tipo, nivel: def.nivel, operacao: ops[0], valor: '' }
          : c,
      ),
    )
  }, [disponiveis])

  const handleMudarOperacao = useCallback((uid: string, operacao: OperacaoCampoMassaSimulador) => {
    setCampos((prev) => prev.map((c) => (c.uid === uid ? { ...c, operacao } : c)))
  }, [])

  const handleMudarValor = useCallback((uid: string, valor: string) => {
    setCampos((prev) => prev.map((c) => (c.uid === uid ? { ...c, valor } : c)))
  }, [])

  const handleAvancar = useCallback(() => {
    const camposValidos = campos.filter((c) => c.valor.trim() !== '')
    if (camposValidos.length === 0) {
      setErroGeral('Informe ao menos um campo com valor para revisar.')
      return
    }
    setErroGeral(null)
    setPasso(2)
  }, [campos])

  const handleConfirmar = useCallback(async () => {
    const camposValidos = campos.filter((c) => c.valor.trim() !== '')
    if (camposValidos.length === 0) return
    setSalvando(true)
    setFeedbackBotao(null)
    try {
      await new Promise((r) => setTimeout(r, 500))
      const resultado = onConfirmar({
        nivel,
        campos: camposValidos,
        selecao: selecaoCongelada,
      })
      setResumo(resultado)
      setFeedbackBotao('sucesso')
      await new Promise((r) => setTimeout(r, 400))
      setPasso(3)
    } catch {
      setFeedbackBotao('erro')
    } finally {
      setSalvando(false)
    }
  }, [campos, nivel, onConfirmar, selecaoCongelada])

  const camposValidos = campos.filter((c) => c.valor.trim() !== '')

  const toggleDepara = (campo: string) => {
    setDeparaAbertos((prev) => {
      const next = new Set(prev)
      if (next.has(campo)) next.delete(campo)
      else next.add(campo)
      return next
    })
  }

  const renderInputValor = (campo: CampoEmEdicaoMassaSimulador, def?: DefinicaoCampoEdicaoMassaSimulador) => {
    const temMultiplos = campo.nivel === 'pedido' && detectarMultiplosValoresPedidoSimulador(pedidos, campo.campo)
    const placeholder = temMultiplos ? 'Múltiplos valores' : 'Valor'

    if (campo.tipo === 'select') {
      const opcoes = def?.opcoes ?? []
      return (
        <SelectGlobal
          buscavel={opcoes.length > 8}
          tamanho="compacto"
          placeholder={placeholder}
          opcoes={opcoes.map((o) => ({ valor: o.valor, rotulo: o.rotulo }))}
          valor={campo.valor || null}
          aoMudarValor={(v) => handleMudarValor(campo.uid, v != null ? String(v) : '')}
          aria-label={`Valor para ${def?.rotulo ?? campo.campo}`}
        />
      )
    }

    if (campo.tipo === 'ncm') {
      return (
        <input
          className="modal-edicao-massa__input"
          type="text"
          inputMode="numeric"
          value={campo.valor}
          onChange={(e) => handleMudarValor(campo.uid, formataNcmSimulador(e.target.value))}
          placeholder="0000.00.00"
          maxLength={10}
          aria-label={`Valor para ${def?.rotulo ?? campo.campo}`}
          style={{ fontFamily: 'var(--font-mono, monospace)' }}
        />
      )
    }

    if (campo.tipo === 'data' && campo.operacao === 'substituir') {
      return (
        <CampoCalendarioGlobal
          modoUnico
          className="modal-edicao-massa__calendario"
          placeholder={placeholder}
          valor={
            campo.valor
              ? { inicio: new Date(`${campo.valor}T00:00:00`), fim: null }
              : { inicio: null, fim: null }
          }
          aoMudarValor={(val) => {
            const iso = val.inicio ? dateToIsoBr(val.inicio) : ''
            handleMudarValor(campo.uid, iso)
          }}
          aria-label={`Valor para ${def?.rotulo ?? campo.campo}`}
        />
      )
    }

    return (
      <input
        className="modal-edicao-massa__input"
        type={campo.tipo === 'numero' || campo.operacao !== 'substituir' ? 'number' : 'text'}
        value={campo.valor}
        onChange={(e) => handleMudarValor(campo.uid, e.target.value)}
        placeholder={placeholder}
        aria-label={`Valor para ${def?.rotulo ?? campo.campo}`}
      />
    )
  }

  const renderPasso1 = () => (
    <div className="modal-edicao-massa__corpo-inner">
      {temTiposMistos && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
          }}
        >
          <Info weight="duotone" size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              Tipos de operação mistos
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              A seleção inclui importação e exportação. Alguns campos podem não se aplicar a todos os pedidos.
            </p>
          </div>
        </div>
      )}

      <div className="em-secao">
        <span className="em-secao-titulo">Nível de edição</span>
        <div className="modal-edicao-massa__nivel-toggle" role="group" aria-label="Nível de edição">
          {(['combinado', 'pedido', 'item'] as NivelEdicaoMassaSimulador[]).map((n) => (
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

      <div className="em-secao">
        <span className="em-secao-titulo">Campos a editar</span>
        <div className="modal-edicao-massa__campos-lista">
          {campos.map((campo) => {
            const def = disponiveis.find((d) => d.campo === campo.campo)
            const ops = OPERACOES_POR_TIPO_MASSA_SIMULADOR[campo.tipo]
            const temMultiplos = campo.nivel === 'pedido' && detectarMultiplosValoresPedidoSimulador(pedidos, campo.campo)
            return (
              <div key={campo.uid} className="modal-edicao-massa__campo-linha">
                <SelectGlobal
                  buscavel
                  tamanho="compacto"
                  opcoes={disponiveis.map((d) => ({
                    valor: d.campo,
                    rotulo: `${d.grupo} · ${d.rotulo}${d.nivel === 'item' ? ' (Item)' : ''}`,
                  }))}
                  valor={campo.campo}
                  aoMudarValor={(v) => v != null && handleMudarCampoDef(campo.uid, String(v))}
                  aria-label="Campo a editar"
                />
                <SelectGlobal
                  buscavel={false}
                  tamanho="compacto"
                  desabilitado={ops.length === 1}
                  opcoes={ops.map((op) => ({ valor: op, rotulo: ROTULOS_OPERACAO_MASSA_SIMULADOR[op] }))}
                  valor={campo.operacao}
                  aoMudarValor={(v) => v != null && handleMudarOperacao(campo.uid, v as OperacaoCampoMassaSimulador)}
                  aria-label="Operação"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {renderInputValor(campo, def)}
                  {temMultiplos && (
                    <span className="modal-edicao-massa__badge-multiplos">
                      <Warning size={11} weight="fill" aria-hidden="true" />
                      Múltiplos valores
                    </span>
                  )}
                </div>
                {campos.length > 1 && (
                  <button
                    type="button"
                    className="modal-edicao-massa__remover-campo"
                    onClick={() => handleRemoverCampo(campo.uid)}
                    aria-label="Remover campo"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <button type="button" className="modal-edicao-massa__adicionar-campo" onClick={handleAdicionarCampo}>
          <Plus size={14} />
          Adicionar campo
        </button>
      </div>

      <div className="modal-edicao-massa__separador" role="separator" />

      <div className="em-secao" aria-live="polite">
        <span className="em-secao-titulo">Pré-visualização</span>
        {carregandoPreview ? (
          <div className="modal-edicao-massa__preview-loading">
            <Spinner size={14} className="modal-edicao-massa__spinner" aria-hidden="true" />
            <span>Calculando alterações…</span>
          </div>
        ) : preview ? (
          <div data-em-stats style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { rotulo: 'Pedidos', valor: preview.pedidos_afetados },
              { rotulo: 'Itens', valor: preview.itens_afetados },
              { rotulo: 'Campos', valor: camposValidos.length },
            ].map((stat) => (
              <div
                key={stat.rotulo}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  background: 'rgba(15, 23, 42, 0.5)',
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {stat.rotulo}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{stat.valor}</div>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Preencha ao menos um campo para ver o impacto.
          </span>
        )}
      </div>

      {erroGeral && (
        <div className="modal-edicao-massa__erro" role="alert">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {erroGeral}
        </div>
      )}
    </div>
  )

  const renderPasso2 = () => (
    <div className="modal-edicao-massa__corpo-inner">
      {pedidos.length >= 2 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Pedido
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SelectGlobal
              buscavel
              tamanho="compacto"
              placeholder="Filtrar por pedido"
              opcoes={[
                { valor: '__todos__', rotulo: `Todos os pedidos (${pedidos.length})` },
                ...pedidos.map((p) => ({
                  valor: p.id,
                  rotulo: `${p.numeroPedido} · ${p.detalhesItens.length} itens`,
                })),
              ]}
              valor={filtroPedido ?? '__todos__'}
              aoMudarValor={(v) => setFiltroPedido(v === '__todos__' ? null : String(v))}
              aria-label="Filtrar por pedido"
            />
          </div>
        </div>
      )}

      <div className="em-filtro-bar">
        <Funnel size={14} weight="duotone" style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
        {(['todos', 'alterados', 'sem-efeito'] as const).map((f) => {
          const contagem =
            f === 'todos'
              ? camposValidos.length
              : f === 'alterados'
                ? camposValidos.filter((c) => {
                    const pc = preview?.campos.find((p) => p.campo === c.campo)
                    return pc && pc.valores_distintos.length > 0 && pc.valores_distintos[0] !== c.valor
                  }).length
                : camposValidos.filter((c) => {
                    const pc = preview?.campos.find((p) => p.campo === c.campo)
                    return !pc || (pc.valores_distintos.length === 1 && pc.valores_distintos[0] === c.valor)
                  }).length
          const rotulo =
            f === 'todos' ? 'Todos' : f === 'alterados' ? 'Com alteração' : 'Sem efeito'
          return (
            <button
              key={f}
              type="button"
              className={`em-filtro-pill${filtroRevisao === f ? ' em-filtro-pill--ativo' : ''}`}
              onClick={() => setFiltroRevisao(f)}
            >
              {rotulo} ({contagem})
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {camposValidos
          .filter((c) => {
            if (filtroRevisao === 'todos') return true
            const pc = preview?.campos.find((p) => p.campo === c.campo)
            if (filtroRevisao === 'alterados') {
              return pc && pc.valores_distintos.length > 0
            }
            return !pc || pc.valores_distintos.length <= 1
          })
          .map((c) => {
            const def = disponiveis.find((d) => d.campo === c.campo)
            const rotulo = def?.rotulo ?? c.campo
            const previewCampo = preview?.campos.find((p) => p.campo === c.campo)
            const multiplos = (previewCampo?.valores_distintos.length ?? 0) > 1
            const valorAtualExib = multiplos
              ? `${previewCampo?.valores_distintos.length} valores distintos`
              : previewCampo?.valores_distintos[0] ?? '(vazio)'
            const valorNovoExib =
              def?.opcoes?.find((o) => o.valor === c.valor)?.rotulo ??
              (c.tipo === 'data' && c.operacao === 'substituir' && c.valor ? isoToDataBr(c.valor) : c.valor)

            return (
              <div
                key={c.uid}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                  padding: '0.75rem 0.875rem',
                  background: 'var(--surface-2, #1e293b)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #334155)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{rotulo}</span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      background:
                        c.nivel === 'pedido'
                          ? 'color-mix(in srgb, var(--primary, #6366f1) 15%, transparent)'
                          : 'color-mix(in srgb, var(--success, #22c55e) 15%, transparent)',
                      color: c.nivel === 'pedido' ? 'var(--primary, #818cf8)' : 'var(--success, #4ade80)',
                    }}
                  >
                    {c.nivel}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <span
                    style={{
                      flex: 1,
                      padding: '0.375rem 0.5rem',
                      background: 'color-mix(in srgb, var(--destructive, #ef4444) 8%, transparent)',
                      borderRadius: 'var(--radius-xs, 4px)',
                      color: 'var(--text-secondary, #94a3b8)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {valorAtualExib}
                  </span>
                  <span style={{ color: 'var(--text-tertiary, #64748b)', flexShrink: 0, fontSize: '0.75rem' }}>→</span>
                  <span
                    style={{
                      flex: 1,
                      padding: '0.375rem 0.5rem',
                      background: 'color-mix(in srgb, var(--success, #22c55e) 8%, transparent)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      color: 'var(--text-primary, #e2e8f0)',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ROTULOS_OPERACAO_RESUMO_MASSA_SIMULADOR[c.operacao]}: {valorNovoExib}
                  </span>
                </div>
              </div>
            )
          })}
      </div>

      {preview && preview.por_pedido.length > 0 && (
        <div className="modal-edicao-massa__depara">
          <p className="modal-edicao-massa__depara-titulo">Detalhe por pedido</p>
          {camposValidos.map((c) => {
            const def = disponiveis.find((d) => d.campo === c.campo)
            const aberto = deparaAbertos.has(c.campo)
            const blocos = preview.por_pedido.filter(
              (p) => !filtroPedido || p.pedido_id === filtroPedido,
            )
            const alteracoes = blocos.flatMap((p) =>
              p.alteracoes
                .filter((a) => a.campo === c.campo)
                .map((a) => ({ ...a, numero: p.pedido_numero })),
            )
            if (alteracoes.length === 0) return null
            return (
              <div key={c.campo} className="modal-edicao-massa__depara-campo">
                <button
                  type="button"
                  className="modal-edicao-massa__depara-campo-header"
                  onClick={() => toggleDepara(c.campo)}
                >
                  <span className="modal-edicao-massa__depara-campo-caret" aria-hidden="true">
                    {aberto ? <CaretDown size={14} /> : <CaretRight size={14} />}
                  </span>
                  <span className="modal-edicao-massa__depara-campo-nome">{def?.rotulo ?? c.campo}</span>
                  <span className="modal-edicao-massa__depara-campo-stat">{alteracoes.length} linha(s)</span>
                </button>
                {aberto && (
                  <div className="modal-edicao-massa__depara-lista">
                    {alteracoes.map((alt, idx) => {
                      const semMudanca = alt.valor_atual === alt.valor_novo
                      return (
                        <div
                          key={`${alt.numero}-${idx}`}
                          className={`modal-edicao-massa__depara-linha${semMudanca ? ' modal-edicao-massa__depara-linha--igual' : ''}`}
                        >
                          <span className="modal-edicao-massa__depara-linha-numero">{alt.numero}</span>
                          <span className="modal-edicao-massa__depara-linha-de">{alt.valor_atual}</span>
                          <span className="modal-edicao-massa__depara-linha-seta" aria-hidden="true">→</span>
                          <span
                            className={`modal-edicao-massa__depara-linha-para${semMudanca ? ' modal-edicao-massa__depara-linha-para--igual' : ''}`}
                          >
                            {alt.valor_novo}
                          </span>
                          {semMudanca && (
                            <span className="modal-edicao-massa__depara-linha-badge">Sem alteração</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderPasso3 = () => {
    if (!resumo) return null
    return (
      <div className="modal-edicao-massa__confirmacao">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'color-mix(in srgb, var(--success, #22c55e) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--success, #22c55e) 35%, transparent)',
            borderRadius: 'var(--radius-md, 8px)',
            marginBottom: '1rem',
          }}
        >
          <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
            {resumo.pedidosAtualizados} pedido(s) e {resumo.itensAtualizados} item(ns) atualizados com sucesso.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'var(--text-secondary, #94a3b8)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Campos editados
          </p>
          {camposValidos.map((c) => {
            const def = disponiveis.find((d) => d.campo === c.campo)
            const ok = resumo.camposAlterados.includes(c.campo)
            return (
              <div
                key={c.uid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--surface-2, #1e293b)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #334155)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{def?.rotulo ?? c.campo}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)' }}>
                    {c.operacao} → {c.valor}
                  </span>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: ok ? 'var(--success, #22c55e)' : 'var(--destructive, #ef4444)',
                  }}
                >
                  {ok ? (
                    <>
                      <CheckCircle size={14} weight="fill" /> OK
                    </>
                  ) : (
                    <>
                      <Warning size={14} weight="fill" /> Sem efeito
                    </>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!aberto) return null

  const footerCustom = (
    <div className="modal-edicao-massa__footer-direita" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
      {passo === 2 && (
        <BotaoGlobal variante="secundario" tamanho="medio" onClick={() => setPasso(1)} disabled={salvando}>
          Voltar
        </BotaoGlobal>
      )}
      {passo !== 3 && (
        <BotaoGlobal variante="secundario" tamanho="medio" onClick={fechar} disabled={salvando || feedbackBotao !== null}>
          Cancelar
        </BotaoGlobal>
      )}
      {passo === 1 ? (
        <BotaoGlobal
          variante="primario"
          tamanho="medio"
          onClick={handleAvancar}
          disabled={camposValidos.length === 0 || carregandoPreview}
        >
          Revisar
        </BotaoGlobal>
      ) : passo === 2 ? (
        <BotaoGlobal
          variante="primario"
          tamanho="medio"
          onClick={() => void handleConfirmar()}
          disabled={salvando || feedbackBotao !== null}
          carregando={salvando}
          textoCarregando="Aplicando…"
          resultadoAcao={feedbackBotao}
          icone={<PencilSimpleLine size={14} weight="bold" />}
        >
          {feedbackBotao === 'sucesso' ? 'Aplicado' : feedbackBotao === 'erro' ? 'Falhou' : 'Aplicar'}
        </BotaoGlobal>
      ) : (
        <BotaoGlobal variante="primario" tamanho="medio" onClick={fechar}>
          Fechar
        </BotaoGlobal>
      )}
    </div>
  )

  return (
    <>
      <style>{`
        .mpg-dialog {
          border: 1px solid color-mix(in srgb, var(--accent, #6366f1) 18%, var(--bg-elevated)) !important;
        }
        .mpg-dialog > div:last-child {
          justify-content: flex-end !important;
        }
        .em-secao {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border: 1px solid color-mix(in srgb, var(--bg-elevated) 60%, transparent);
          border-radius: var(--radius-lg);
        }
        .em-secao-titulo {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--accent, #6366f1);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .em-filtro-bar { display: flex; gap: 0.375rem; flex-wrap: wrap; }
        .em-filtro-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid var(--border, #334155);
          background: transparent;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
        }
        .em-filtro-pill--ativo {
          background: color-mix(in srgb, var(--accent, #6366f1) 15%, transparent);
          border-color: color-mix(in srgb, var(--accent, #6366f1) 40%, transparent);
          color: var(--accent, #6366f1);
        }
      `}</style>
      <ModalPassoPassoGlobal
        titulo={passo === 3 ? 'Edição concluída' : montarTituloModalEdicaoMassaSimulador(selecaoCongelada)}
        icone={<PencilSimpleLine size={20} weight="duotone" />}
        subtitulo="Altere vários pedidos ou itens de uma só vez"
        aberto={aberto}
        passos={PASSOS}
        passoAtual={passo}
        onProximo={() => {}}
        onVoltar={() => {}}
        onFechar={fechar}
        tamanho="xl"
        ocultarStepper={passo === 3}
        footerCustom={footerCustom}
        fecharComTeclaEscape
      >
        {passo === 1 && renderPasso1()}
        {passo === 2 && renderPasso2()}
        {passo === 3 && renderPasso3()}
      </ModalPassoPassoGlobal>
    </>
  )
}

export { mensagemToastEdicaoMassa } from './edicao-massa-lista-simulador-pedido'
