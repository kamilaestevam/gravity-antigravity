import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import { Info, Lock, Package, Plus, Tag, Trash, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { CampoDecimalGlobal } from '@nucleo/campo-decimal-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { BannerRequisitosGlobal } from '../../../Feedback/banner-requisitos-global/src/BannerRequisitosGlobal'
import { ModalPassoPassoGlobal } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import type { PassoConfig } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import '../../../Modais/modal-passo-passo-global/src/modal-passo-passo.css'
import '../../../Feedback/banner-requisitos-global/src/banner.css'
import '../../../Campos/campo-geral-global/src/campo-geral.css'
import '../../../Campos/campo-select-global/src/select.css'
import '../../../Campos/campo-calendario-global/src/calendario.css'
import {
  EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO,
  FORNECEDORES_SIMULADOR_NOVO_PEDIDO_INICIAIS,
  INCOTERMS_SIMULADOR_NOVO_PEDIDO,
  MOEDAS_SIMULADOR_NOVO_PEDIDO,
  opcoesFornecedorSimulador,
  resolverForcarEstrangeiroCadastroEmpresaSimulador,
  type FornecedorSimuladorNovoPedido,
  type PapelFornecedorSimuladorNovoPedido,
} from './dados-fornecedores-simulador-novo-pedido'
import { ModalEmpresaCadastroRapidoSimuladorPedido } from './modal-empresa-cadastro-rapido-simulador-pedido'
import {
  criarItemVazioNovoPedidoSimulador,
  formNovoPedidoSimuladorVazio,
  montarRequisitosPasso1NovoPedidoSimulador,
  podeAvancarPasso1NovoPedidoSimulador,
  type FormNovoPedidoSimulador,
  type ItemNovoPedidoSimulador,
} from './regras-modal-novo-pedido-simulador'
import './modal-novo-pedido-simulador.css'

type PapelCadastro = PapelFornecedorSimuladorNovoPedido | null

type Props = {
  aberto: boolean
  onFechar: () => void
  onSalvo: (
    form: FormNovoPedidoSimulador,
    itens: ItemNovoPedidoSimulador[],
    fornecedores: FornecedorSimuladorNovoPedido[],
  ) => void
}

const PASSOS: PassoConfig[] = [
  { id: 1, label: 'Dados do Pedido', icone: <Package size={13} weight="duotone" aria-hidden /> },
  { id: 2, label: 'Itens', icone: <Tag size={13} weight="duotone" aria-hidden /> },
]

const ESTILO_INPUT_ITEM: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  display: 'block',
  minHeight: '2.5rem',
  background: 'var(--ws-bg-body, #0f172a)',
  border: '1.5px solid var(--ws-accent-border, rgba(129, 140, 248, 0.2))',
  borderRadius: 'var(--radius-md, 8px)',
  color: 'var(--text-primary, #f1f5f9)',
  fontSize: '0.875rem',
  padding: '0.5625rem 0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
}

const ESTILO_INPUT_TOTAL_ITEM: CSSProperties = {
  ...ESTILO_INPUT_ITEM,
  cursor: 'not-allowed',
  background: 'var(--bg-elevated, #334155)',
}

export function ModalNovoPedidoSimulador({ aberto, onFechar, onSalvo }: Props) {
  const [passo, setPasso] = useState(1)
  const [form, setForm] = useState<FormNovoPedidoSimulador>(formNovoPedidoSimuladorVazio)
  const [itens, setItens] = useState<ItemNovoPedidoSimulador[]>([criarItemVazioNovoPedidoSimulador()])
  const [fornecedores, setFornecedores] = useState<FornecedorSimuladorNovoPedido[]>(
    FORNECEDORES_SIMULADOR_NOVO_PEDIDO_INICIAIS,
  )
  const [salvando, setSalvando] = useState(false)
  const [tentativaAvancar, setTentativaAvancar] = useState(false)
  const [cadastroPapel, setCadastroPapel] = useState<PapelCadastro>(null)

  const requisitos = useMemo(() => montarRequisitosPasso1NovoPedidoSimulador(form), [form])
  const requisitoOk = useMemo(
    () => new Map(requisitos.map((r) => [r.chave, r.ok])),
    [requisitos],
  )
  const podeAvancar = passo === 1 ? podeAvancarPasso1NovoPedidoSimulador(form) : true

  const opcoesImportador = useMemo(
    () => opcoesFornecedorSimulador(fornecedores, 'importador', form.tipo_operacao_pedido),
    [fornecedores, form.tipo_operacao_pedido],
  )
  const opcoesExportador = useMemo(
    () => opcoesFornecedorSimulador(fornecedores, 'exportador', form.tipo_operacao_pedido),
    [fornecedores, form.tipo_operacao_pedido],
  )
  const opcoesFabricante = useMemo(
    () => opcoesFornecedorSimulador(fornecedores, 'fabricante', form.tipo_operacao_pedido),
    [fornecedores, form.tipo_operacao_pedido],
  )

  const resetar = useCallback(() => {
    setPasso(1)
    setForm(formNovoPedidoSimuladorVazio())
    setItens([criarItemVazioNovoPedidoSimulador()])
    setSalvando(false)
    setTentativaAvancar(false)
    setCadastroPapel(null)
  }, [])

  const handleFechar = useCallback(() => {
    if (salvando) return
    resetar()
    onFechar()
  }, [onFechar, resetar, salvando])

  const setCampo = useCallback((campo: keyof FormNovoPedidoSimulador, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }, [])

  const setItem = useCallback((index: number, campo: keyof ItemNovoPedidoSimulador, valor: string) => {
    setItens((prev) => prev.map((it, i) => (i === index ? { ...it, [campo]: valor } : it)))
  }, [])

  const handleProximo = useCallback(() => {
    if (salvando) return
    if (passo === 1) {
      if (!podeAvancarPasso1NovoPedidoSimulador(form)) {
        setTentativaAvancar(true)
        return
      }
      setTentativaAvancar(false)
      setPasso(2)
      return
    }
    setSalvando(true)
    window.setTimeout(() => {
      onSalvo(form, itens, fornecedores)
      setSalvando(false)
      resetar()
      onFechar()
    }, 450)
  }, [form, itens, onFechar, onSalvo, passo, resetar, salvando])

  const handleVoltar = useCallback(() => {
    if (salvando) return
    if (passo > 1) {
      setPasso(1)
      setTentativaAvancar(false)
      return
    }
    handleFechar()
  }, [handleFechar, passo, salvando])

  const campoInvalido = useCallback(
    (chave: string) => tentativaAvancar && requisitoOk.get(chave) === false,
    [requisitoOk, tentativaAvancar],
  )

  const aoCriarFornecedor = useCallback((criado: FornecedorSimuladorNovoPedido) => {
    setFornecedores((prev) => [criado, ...prev])
    if (cadastroPapel === 'importador') setCampo('suid_importador', criado.id_fornecedor)
    if (cadastroPapel === 'exportador') setCampo('suid_exportador', criado.id_fornecedor)
    if (cadastroPapel === 'fabricante') setCampo('suid_fabricante', criado.id_fornecedor)
    setCadastroPapel(null)
  }, [cadastroPapel, setCampo])

  if (!aberto) return null

  return (
    <>
      <ModalPassoPassoGlobal
        titulo="Novo Pedido"
        icone={<Package size={18} weight="duotone" aria-hidden />}
        subtitulo="Preencha os dados do pedido e adicione os itens"
        aberto={aberto}
        passos={PASSOS}
        passoAtual={passo}
        onProximo={handleProximo}
        onVoltar={handleVoltar}
        onFechar={handleFechar}
        podeAvancar={podeAvancar && !salvando}
        labelBotaoFinal={salvando ? 'Criando…' : 'Criar pedido'}
        labelProximo="Próximo"
        tamanho="2xl"
        altura="620px"
        carregando={salvando}
        classNameDialog="pds-mnp-dialog"
      >
        {passo === 1 ? (
          <div className="pds-mnp-form">
            <p className="pds-mnp-secao">Dados do Pedido</p>
            <div className="pds-mnp-grid">
              <div className={`pds-mnp-campo pds-mnp-grid--full`}>
                <SelectGlobal
                  label="Tipo Operação *"
                  opcoes={[
                    { valor: 'importacao', rotulo: 'Importação' },
                    { valor: 'exportacao', rotulo: 'Exportação' },
                  ]}
                  valor={form.tipo_operacao_pedido}
                  aoMudarValor={(v) => {
                    setCampo('tipo_operacao_pedido', String(v ?? 'importacao'))
                    setCampo('suid_importador', '')
                    setCampo('suid_exportador', '')
                    setCampo('suid_fabricante', '')
                  }}
                />
              </div>

              <div className="pds-mnp-campo">
                <CampoGeralGlobal
                  label="Número Pedido"
                  obrigatorio
                  vazio={campoInvalido('numero_pedido')}
                >
                  <input
                    className="pds-mnp-input"
                    value={form.numero_pedido}
                    onChange={(e) => setCampo('numero_pedido', e.target.value)}
                    placeholder="Ex: PO-2026/001"
                  />
                </CampoGeralGlobal>
              </div>

              {form.tipo_operacao_pedido === 'importacao' ? (
                <>
                  <div className="pds-mnp-campo">
                    <div className="pds-mnp-label-row">
                      <span className="pds-mnp-label">Importador</span>
                      <Info size={11} weight="duotone" style={{ color: '#64748b' }} aria-hidden />
                    </div>
                    <div className="pds-mnp-locked">
                      <Lock size={13} weight="duotone" style={{ color: '#64748b', flexShrink: 0 }} aria-hidden />
                      {EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO.nome_empresa} — {EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO.cnpj_empresa}
                    </div>
                  </div>
                  <div className="pds-mnp-campo">
                    <div className="pds-mnp-label-row">
                      <span className="pds-mnp-label">
                        Exportador <span style={{ color: '#f87171' }}>*</span>
                      </span>
                      <button type="button" className="pds-mnp-link-nova" onClick={() => setCadastroPapel('exportador')}>
                        + Nova
                      </button>
                    </div>
                    <div className={campoInvalido('suid_exportador') ? 'cg-wrapper cg-wrapper--erro' : undefined}>
                      <SelectGlobal
                        opcoes={opcoesExportador}
                        valor={form.suid_exportador || null}
                        aoMudarValor={(v) => setCampo('suid_exportador', String(v ?? ''))}
                        placeholder="Selecionar empresa…"
                        buscavel
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="pds-mnp-campo">
                    <div className="pds-mnp-label-row">
                      <span className="pds-mnp-label">
                        Importador <span style={{ color: '#f87171' }}>*</span>
                      </span>
                      <button type="button" className="pds-mnp-link-nova" onClick={() => setCadastroPapel('importador')}>
                        + Nova
                      </button>
                    </div>
                    <div className={campoInvalido('suid_importador') ? 'cg-wrapper cg-wrapper--erro' : undefined}>
                      <SelectGlobal
                        opcoes={opcoesImportador}
                        valor={form.suid_importador || null}
                        aoMudarValor={(v) => setCampo('suid_importador', String(v ?? ''))}
                        placeholder="Selecionar empresa…"
                        buscavel
                      />
                    </div>
                  </div>
                  <div className="pds-mnp-campo">
                    <div className="pds-mnp-label-row">
                      <span className="pds-mnp-label">Exportador</span>
                      <Info size={11} weight="duotone" style={{ color: '#64748b' }} aria-hidden />
                    </div>
                    <div className="pds-mnp-locked">
                      <Lock size={13} weight="duotone" style={{ color: '#64748b', flexShrink: 0 }} aria-hidden />
                      {EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO.nome_empresa} — {EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO.cnpj_empresa}
                    </div>
                  </div>
                </>
              )}

              <div className="pds-mnp-campo">
                <div className="pds-mnp-label-row">
                  <span className="pds-mnp-label">Fabricante</span>
                  <button type="button" className="pds-mnp-link-nova" onClick={() => setCadastroPapel('fabricante')}>
                    + Nova
                  </button>
                </div>
                <SelectGlobal
                  opcoes={opcoesFabricante}
                  valor={form.suid_fabricante || null}
                  aoMudarValor={(v) => setCampo('suid_fabricante', String(v ?? ''))}
                  placeholder="Selecionar empresa…"
                  buscavel
                />
              </div>

              <div className="pds-mnp-campo">
                <SelectGlobal
                  label="Incoterm"
                  opcoes={INCOTERMS_SIMULADOR_NOVO_PEDIDO.map((o) => ({ valor: o.valor, rotulo: o.label }))}
                  valor={form.incoterm_pedido || null}
                  aoMudarValor={(v) => setCampo('incoterm_pedido', String(v ?? ''))}
                  placeholder="Selecionar…"
                  buscavel
                />
              </div>

              <div className="pds-mnp-campo">
                <label className="pds-mnp-label" htmlFor="mnp-cond-pgto">Condição de Pagamento</label>
                <input
                  id="mnp-cond-pgto"
                  className="pds-mnp-input"
                  value={form.condicao_pagamento_pedido}
                  onChange={(e) => setCampo('condicao_pagamento_pedido', e.target.value)}
                  placeholder="Ex: 30% Antecipado"
                />
              </div>

              <div className="pds-mnp-campo">
                <label className="pds-mnp-label" htmlFor="mnp-proforma">Número Proforma</label>
                <input
                  id="mnp-proforma"
                  className="pds-mnp-input"
                  value={form.numero_proforma_pedido}
                  onChange={(e) => setCampo('numero_proforma_pedido', e.target.value)}
                  placeholder="Nº proforma"
                />
              </div>

              <div className="pds-mnp-campo">
                <label className="pds-mnp-label" htmlFor="mnp-invoice">Número Invoice</label>
                <input
                  id="mnp-invoice"
                  className="pds-mnp-input"
                  value={form.numero_invoice_pedido}
                  onChange={(e) => setCampo('numero_invoice_pedido', e.target.value)}
                  placeholder="Nº invoice"
                />
              </div>

              <div className="pds-mnp-campo">
                <label className="pds-mnp-label" htmlFor="mnp-ref-imp">Ref. Importador</label>
                <input
                  id="mnp-ref-imp"
                  className="pds-mnp-input"
                  value={form.referencia_importador_pedido}
                  onChange={(e) => setCampo('referencia_importador_pedido', e.target.value)}
                  placeholder="Referência do importador"
                />
              </div>

              <div className="pds-mnp-campo">
                <label className="pds-mnp-label" htmlFor="mnp-ref-exp">Ref. Exportador</label>
                <input
                  id="mnp-ref-exp"
                  className="pds-mnp-input"
                  value={form.referencia_exportador_pedido}
                  onChange={(e) => setCampo('referencia_exportador_pedido', e.target.value)}
                  placeholder="Referência do exportador"
                />
              </div>

              <div className="pds-mnp-campo">
                <label className="pds-mnp-label" htmlFor="mnp-ref-fab">Ref. Fabricante</label>
                <input
                  id="mnp-ref-fab"
                  className="pds-mnp-input"
                  value={form.referencia_fabricante_pedido}
                  onChange={(e) => setCampo('referencia_fabricante_pedido', e.target.value)}
                  placeholder="Referência do fabricante"
                />
              </div>

              <div className="pds-mnp-campo pds-mnp-campo-data">
                <CampoCalendarioGlobal
                  label="Data Emissão"
                  obrigatorio
                  modoUnico
                  placeholder="Selecione a data"
                  vazio={campoInvalido('data_emissao_pedido')}
                  valor={
                    form.data_emissao_pedido
                      ? { inicio: new Date(`${form.data_emissao_pedido}T00:00:00`), fim: null }
                      : { inicio: null, fim: null }
                  }
                  aoMudarValor={(val) => {
                    if (val.inicio) {
                      setCampo('data_emissao_pedido', val.inicio.toISOString().split('T')[0])
                    } else {
                      setCampo('data_emissao_pedido', '')
                    }
                  }}
                />
              </div>
            </div>

            <BannerRequisitosGlobal
              requisitos={requisitos}
              titulo="Para avançar, ainda falta:"
            />
          </div>
        ) : (
          <div className="pds-mnp-form">
            <div className="pds-mnp-itens-header">
              <p className="pds-mnp-secao" style={{ margin: 0 }}>
                Itens ({itens.length})
              </p>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<Plus size={12} weight="bold" />}
                onClick={() => setItens((prev) => [...prev, criarItemVazioNovoPedidoSimulador()])}
              >
                Adicionar item
              </BotaoGlobal>
            </div>

            {itens.map((item, index) => {
              const qtdNum = item.quantidade_inicial_item === '' ? null : Number(item.quantidade_inicial_item)
              const unitNum = item.valor_por_unidade_item === '' ? null : Number(item.valor_por_unidade_item)
              const totalNum =
                qtdNum === null || unitNum === null || Number.isNaN(qtdNum) || Number.isNaN(unitNum)
                  ? null
                  : qtdNum * unitNum

              return (
                <div key={item.key} className="pds-mnp-item-card">
                  {itens.length > 1 && (
                    <button
                      type="button"
                      className="pds-mnp-item-remover"
                      aria-label={`Remover item ${index + 1}`}
                      onClick={() => setItens((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X size={13} weight="bold" aria-hidden />
                    </button>
                  )}
                  <div className="pds-mnp-grid">
                    <div className="pds-mnp-campo">
                      <label className="pds-mnp-label" htmlFor={`pn-${index}`}>Part Number</label>
                      <input
                        id={`pn-${index}`}
                        className="pds-mnp-input"
                        value={item.part_number_item}
                        onChange={(e) => setItem(index, 'part_number_item', e.target.value)}
                        placeholder="SKU"
                      />
                    </div>
                    <div className="pds-mnp-campo">
                      <SelectNcmGlobal
                        label="NCM"
                        value={item.ncm_item}
                        onChange={(codigo) => setItem(index, 'ncm_item', codigo)}
                        className="pds-mnp-ncm"
                      />
                    </div>
                    <div className="pds-mnp-campo pds-mnp-grid--full">
                      <label className="pds-mnp-label" htmlFor={`desc-${index}`}>Descrição</label>
                      <input
                        id={`desc-${index}`}
                        className="pds-mnp-input"
                        value={item.descricao_item}
                        onChange={(e) => setItem(index, 'descricao_item', e.target.value)}
                        placeholder="Descrição do Item"
                      />
                    </div>
                    <div className="pds-mnp-campo">
                      <label className="pds-mnp-label" htmlFor={`qtd-${index}`}>Qtd. Inicial do Item</label>
                      <CampoDecimalGlobal
                        id={`qtd-${index}`}
                        valor={qtdNum}
                        aoMudarValor={(n) => setItem(index, 'quantidade_inicial_item', n === null ? '' : String(n))}
                        casasDecimais={0}
                        placeholder="Quantidade"
                        style={ESTILO_INPUT_ITEM}
                        textAlign="left"
                      />
                    </div>
                    <div className="pds-mnp-campo">
                      <label className="pds-mnp-label" htmlFor={`moeda-${index}`}>Moeda</label>
                      <SelectGlobal
                        id={`moeda-${index}`}
                        opcoes={MOEDAS_SIMULADOR_NOVO_PEDIDO}
                        valor={item.moeda_item || null}
                        aoMudarValor={(v) => setItem(index, 'moeda_item', String(v ?? ''))}
                        placeholder="Selecionar moeda"
                        buscavel
                      />
                    </div>
                    <div className="pds-mnp-campo">
                      <label className="pds-mnp-label" htmlFor={`val-${index}`}>Valor do Item</label>
                      <CampoDecimalGlobal
                        id={`val-${index}`}
                        valor={unitNum}
                        aoMudarValor={(n) => setItem(index, 'valor_por_unidade_item', n === null ? '' : String(n))}
                        casasDecimais={2}
                        placeholder="Valor unitário"
                        style={ESTILO_INPUT_ITEM}
                        textAlign="left"
                      />
                    </div>
                    <div className="pds-mnp-campo">
                      <label className="pds-mnp-label" htmlFor={`tot-${index}`}>Valor Total dos Itens</label>
                      <CampoDecimalGlobal
                        id={`tot-${index}`}
                        valor={totalNum}
                        aoMudarValor={() => {}}
                        casasDecimais={2}
                        placeholder="Calculado"
                        style={ESTILO_INPUT_TOTAL_ITEM}
                        textAlign="left"
                        desabilitado
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ModalPassoPassoGlobal>

      <ModalEmpresaCadastroRapidoSimuladorPedido
        aberto={cadastroPapel !== null}
        papel={cadastroPapel ?? 'exportador'}
        forcarEstrangeiro={
          cadastroPapel !== null
            ? resolverForcarEstrangeiroCadastroEmpresaSimulador(cadastroPapel, form.tipo_operacao_pedido)
            : false
        }
        onFechar={() => setCadastroPapel(null)}
        onCriado={aoCriarFornecedor}
      />
    </>
  )
}
