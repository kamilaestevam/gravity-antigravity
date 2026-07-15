/**
 * ModalNovaColunaConfigSimuladorPedido — paridade com ModalNovaColunaUsuario.tsx (produto real).
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  Asterisk,
  CalendarBlank,
  CheckSquare,
  Columns,
  Eye,
  Hash,
  ListBullets,
  MathOperations,
  PencilSimple,
  Percent,
  Rows,
  SquaresFour,
  Tag,
  TextAlignLeft,
  TextT,
  Warning,
} from '@phosphor-icons/react'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { TipoColunaPersonalizadaSimulador } from './catalogo-config-simulador-pedido'
import '../../../Campos/campo-select-global/src/select.css'
import './modal-nova-coluna-config-simulador-pedido.css'

const ICONE_LABEL = { size: 13, weight: 'fill' as const }

const TIPOS_COLUNA: Array<{ id: TipoColunaPersonalizadaSimulador; icone: ReactNode; label: string }> = [
  { id: 'texto', label: 'Texto', icone: <TextT size={16} weight="duotone" /> },
  { id: 'numero', label: 'Número', icone: <Hash size={16} weight="duotone" /> },
  { id: 'data', label: 'Data', icone: <CalendarBlank size={16} weight="duotone" /> },
  { id: 'percentual', label: 'Percentual', icone: <Percent size={16} weight="duotone" /> },
  { id: 'select', label: 'Seleção', icone: <ListBullets size={16} weight="duotone" /> },
  { id: 'checkbox', label: 'Checkbox', icone: <CheckSquare size={16} weight="duotone" /> },
  { id: 'tipo_documento', label: 'Documento', icone: <Tag size={16} weight="duotone" /> },
  { id: 'formula', label: 'Fórmula', icone: <MathOperations size={16} weight="duotone" /> },
]

type VisibilidadeColuna = 'todos' | 'roles' | 'privado'

function LabelSecao({
  icone,
  children,
  obrigatorio,
  toggle,
  htmlFor,
}: {
  icone: ReactNode
  children: React.ReactNode
  obrigatorio?: boolean
  toggle?: boolean
  htmlFor?: string
}) {
  const classe = ['mnc-label-secao', toggle ? 'mnc-label-secao--toggle' : ''].filter(Boolean).join(' ')
  const conteudo = (
    <>
      {icone}
      <span>{children}</span>
      {obrigatorio && <span className="mnc-obrig">*</span>}
    </>
  )
  if (htmlFor) {
    return (
      <label className={classe} htmlFor={htmlFor}>
        {conteudo}
      </label>
    )
  }
  return <span className={classe}>{conteudo}</span>
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <label className="mnc-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mnc-toggle__input"
      />
      <span className="mnc-toggle__track" />
    </label>
  )
}

export function ModalNovaColunaConfigSimuladorPedido({
  aberto,
  onFechar,
  onSalvar,
}: {
  aberto: boolean
  onFechar: () => void
  onSalvar: (nome: string, tipo: TipoColunaPersonalizadaSimulador) => void
}) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoColunaPersonalizadaSimulador>('texto')
  const [visibilidade, setVisibilidade] = useState<VisibilidadeColuna>('todos')
  const [descricao, setDescricao] = useState('')
  const [itensDiferentes, setItensDiferentes] = useState(true)
  const [pedidoEditavel, setPedidoEditavel] = useState(true)
  const [obrigatorio, setObrigatorio] = useState(false)
  const [erroNome, setErroNome] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setNome('')
    setTipo('texto')
    setVisibilidade('todos')
    setDescricao('')
    setItensDiferentes(true)
    setPedidoEditavel(true)
    setObrigatorio(false)
    setErroNome(null)
  }, [aberto])

  const handleSalvar = useCallback(async () => {
    const nomeTrim = nome.trim()
    if (!nomeTrim) {
      setErroNome('Informe o nome da coluna')
      return
    }
    setSalvando(true)
    try {
      onSalvar(nomeTrim, tipo)
      onFechar()
    } finally {
      setSalvando(false)
    }
  }, [nome, tipo, onSalvar, onFechar])

  if (!aberto) return null

  return (
    <ModalFormularioAbasGlobal
      aberto
      aoFechar={onFechar}
      aoSalvar={handleSalvar}
      icone={<Columns size={24} weight="duotone" color="var(--ws-accent, #818cf8)" />}
      titulo="Nova coluna"
      subtitulo="Crie um campo personalizado para a tabela de pedidos"
      tamanho="md"
      larguraMaxima="560px"
      semAbas
      dirty
      carregando={salvando}
      textoSalvar="Salvar"
      textoCancelar="Cancelar"
      abas={[
        {
          id: 'form',
          rotulo: '',
          conteudo: (
            <div className="mnc-corpo" data-sds-tutorial-alvo="pedido-config-modal-nova-coluna">
              <div className="mnc-campo">
                <LabelSecao htmlFor="mnc-sim-nome" icone={<TextT {...ICONE_LABEL} />} obrigatorio>
                  Nome
                </LabelSecao>
                <input
                  id="mnc-sim-nome"
                  name="coluna_personalizada_nome"
                  className={['mnc-input', 'mnc-input--como-select', erroNome ? 'mnc-input--erro' : ''].filter(Boolean).join(' ')}
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    if (erroNome) setErroNome(null)
                  }}
                  maxLength={60}
                  placeholder="Ex: Campo comercial"
                  autoComplete="off"
                  autoFocus
                  aria-invalid={erroNome != null}
                />
                {erroNome && (
                  <p className="mnc-erro-campo" role="alert">
                    {erroNome}
                  </p>
                )}
              </div>

              <div className="mnc-campo">
                <LabelSecao icone={<SquaresFour {...ICONE_LABEL} />} obrigatorio>
                  Tipo
                </LabelSecao>
                <div className="mnc-tipo-grid">
                  {TIPOS_COLUNA.map((tc) => (
                    <button
                      key={tc.id}
                      type="button"
                      className={['mnc-tipo-btn', tipo === tc.id ? 'mnc-tipo-btn--ativo' : ''].filter(Boolean).join(' ')}
                      onClick={() => setTipo(tc.id)}
                      aria-pressed={tipo === tc.id}
                    >
                      <span className="mnc-tipo-btn__icone">{tc.icone}</span>
                      <span className="mnc-tipo-btn__label">{tc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {tipo === 'formula' && (
                <div className="mnc-campo">
                  <LabelSecao icone={<MathOperations {...ICONE_LABEL} />} obrigatorio>
                    Fórmula
                  </LabelSecao>
                  <div className="mnc-tokens mnc-tokens--ok">
                    <span className="mnc-tokens__placeholder">Clique nos campos abaixo para montar a fórmula</span>
                  </div>
                  <div className="mnc-gabi-card mnc-gabi-card--info" role="note">
                    <div className="mnc-gabi-card__header">
                      <span className="mnc-gabi-card__ico">✦</span>
                      <span className="mnc-gabi-card__titulo">Gabi · Como montar</span>
                    </div>
                    <p className="mnc-gabi-card__texto">
                      Selecione campos numéricos e operadores. A Gabi valida a fórmula antes de salvar.
                    </p>
                  </div>
                </div>
              )}

              <div className="mnc-campo">
                <LabelSecao icone={<Eye {...ICONE_LABEL} />} obrigatorio>
                  Visibilidade
                </LabelSecao>
                <SelectGlobal
                  id="mnc-sim-visibilidade"
                  buscavel={false}
                  opcoes={[
                    { valor: 'todos', rotulo: 'Todos os usuários' },
                    { valor: 'roles', rotulo: 'Por patente (roles)' },
                    { valor: 'privado', rotulo: 'Somente eu' },
                  ]}
                  valor={visibilidade}
                  aoMudarValor={(v) => v != null && setVisibilidade(v as VisibilidadeColuna)}
                />
              </div>

              <div className="mnc-campo">
                <LabelSecao htmlFor="mnc-sim-descricao" icone={<TextAlignLeft {...ICONE_LABEL} />}>
                  Descrição
                </LabelSecao>
                <input
                  id="mnc-sim-descricao"
                  name="coluna_personalizada_descricao"
                  className="mnc-input mnc-input--como-select"
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Texto de ajuda exibido no tooltip da coluna"
                  maxLength={200}
                  autoComplete="off"
                />
              </div>

              <div className="mnc-campo mnc-campo--toggle-row">
                <div>
                  <LabelSecao toggle icone={<Rows {...ICONE_LABEL} />}>
                    Itens podem ter dados diferentes
                  </LabelSecao>
                  <p className="mnc-hint">Cada item do pedido pode ter um valor distinto nesta coluna</p>
                </div>
                <Toggle id="mnc-sim-itens-dif" checked={itensDiferentes} onChange={setItensDiferentes} />
              </div>

              {itensDiferentes && (
                <>
                  <div className="mnc-aviso-migracao" role="note">
                    <Warning size={14} weight="fill" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.05rem' }} />
                    <span>Dados existentes não serão migrados automaticamente ao alterar o escopo.</span>
                  </div>
                  <div className="mnc-campo mnc-campo--toggle-row">
                    <div>
                      <LabelSecao toggle icone={<PencilSimple {...ICONE_LABEL} />}>
                        Pedido também é editável
                      </LabelSecao>
                      <p className="mnc-hint">Permite editar o valor no nível do pedido pai</p>
                    </div>
                    <Toggle id="mnc-sim-pedido-edit" checked={pedidoEditavel} onChange={setPedidoEditavel} />
                  </div>
                </>
              )}

              {tipo !== 'formula' && (
                <div className="mnc-campo mnc-campo--toggle-row">
                  <div>
                    <LabelSecao toggle icone={<Asterisk {...ICONE_LABEL} />}>
                      Obrigatório
                    </LabelSecao>
                    <p className="mnc-hint">Exige preenchimento antes de publicar o pedido</p>
                  </div>
                  <Toggle id="mnc-sim-obrigatorio" checked={obrigatorio} onChange={setObrigatorio} />
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  )
}
