/**
 * ModalNovaColunaSmartRead — criar/editar coluna personalizada (paridade Pedido › Personalizadas).
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
  Percent,
  Plus,
  TextAlignLeft,
  TextT,
  X,
} from '@phosphor-icons/react'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import './modal-nova-coluna-smart-read.css'

export type TipoColunaSmartRead =
  | 'texto'
  | 'numero'
  | 'data'
  | 'percentual'
  | 'select'
  | 'checkbox'

/** Tipos legados removidos do modal — só para rótulo de colunas antigas no storage. */
export type TipoColunaSmartReadLegado = 'tipo_documento' | 'formula'

export type TipoColunaSmartReadArmazenado = TipoColunaSmartRead | TipoColunaSmartReadLegado

export type VisibilidadeColunaSmartRead = 'todos' | 'roles' | 'privado'

export interface ColunaPersonalizadaSmartRead {
  id: string
  nome: string
  tipo: TipoColunaSmartReadArmazenado
  visible: boolean
  descricao?: string
  visibilidade?: VisibilidadeColunaSmartRead
  roles_permitidas?: string[]
  obrigatorio?: boolean
  id_usuario_criador?: string
  opcoes?: string[]
}

export const TIPOS_COLUNA_SMART_READ: Array<{ id: TipoColunaSmartRead; icone: ReactNode; label: string }> = [
  { id: 'texto', label: 'Texto', icone: <TextT size={16} weight="duotone" /> },
  { id: 'numero', label: 'Número', icone: <Hash size={16} weight="duotone" /> },
  { id: 'data', label: 'Data', icone: <CalendarBlank size={16} weight="duotone" /> },
  { id: 'percentual', label: 'Percentual', icone: <Percent size={16} weight="duotone" /> },
  { id: 'select', label: 'Lista', icone: <ListBullets size={16} weight="duotone" /> },
  { id: 'checkbox', label: 'Checkbox', icone: <CheckSquare size={16} weight="duotone" /> },
]

const ROTULOS_TIPO_LEGADO: Record<TipoColunaSmartReadLegado, string> = {
  tipo_documento: 'Tipo documento',
  formula: 'Fórmula',
}

export function rotuloTipoColunaSmartRead(tipo: TipoColunaSmartReadArmazenado): string {
  return TIPOS_COLUNA_SMART_READ.find((t) => t.id === tipo)?.label
    ?? ROTULOS_TIPO_LEGADO[tipo as TipoColunaSmartReadLegado]
    ?? tipo
}

const ICONE_LABEL = { size: 13, weight: 'fill' as const }

function LabelSecao({
  icone,
  children,
  obrigatorio,
  htmlFor,
}: {
  icone: ReactNode
  children: ReactNode
  obrigatorio?: boolean
  htmlFor?: string
}) {
  const conteudo = (
    <>
      {icone}
      <span>{children}</span>
      {obrigatorio && <span className="mnc-obrig">*</span>}
    </>
  )
  if (htmlFor) {
    return (
      <label className="mnc-label-secao" htmlFor={htmlFor}>
        {conteudo}
      </label>
    )
  }
  return <span className="mnc-label-secao">{conteudo}</span>
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

export function ModalNovaColunaSmartRead({
  colunaEdicao,
  onFechar,
  onSalvo,
}: {
  colunaEdicao?: ColunaPersonalizadaSmartRead
  onFechar: () => void
  onSalvo: (dados: {
    nome: string
    tipo: TipoColunaSmartRead
    descricao?: string
    visibilidade: VisibilidadeColunaSmartRead
    obrigatorio: boolean
    opcoes?: string[]
  }) => void
}) {
  const editando = Boolean(colunaEdicao)
  const [nome, setNome] = useState(colunaEdicao?.nome ?? '')
  const [tipo, setTipo] = useState<TipoColunaSmartRead>(colunaEdicao?.tipo ?? 'texto')
  const [visibilidade, setVisibilidade] = useState<VisibilidadeColunaSmartRead>(
    colunaEdicao?.visibilidade ?? 'todos',
  )
  const [descricao, setDescricao] = useState(colunaEdicao?.descricao ?? '')
  const [obrigatorio, setObrigatorio] = useState(colunaEdicao?.obrigatorio ?? false)
  const [opcoes, setOpcoes] = useState<string[]>(colunaEdicao?.opcoes ?? [])
  const [novaOpcao, setNovaOpcao] = useState('')
  const [erroNome, setErroNome] = useState<string | null>(null)
  const [erroOpcoes, setErroOpcoes] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const tipoComOpcoes = tipo === 'select'

  useEffect(() => {
    setNome(colunaEdicao?.nome ?? '')
    setTipo(
      colunaEdicao?.tipo && TIPOS_COLUNA_SMART_READ.some((t) => t.id === colunaEdicao.tipo)
        ? (colunaEdicao.tipo as TipoColunaSmartRead)
        : 'texto',
    )
    setVisibilidade(colunaEdicao?.visibilidade ?? 'todos')
    setDescricao(colunaEdicao?.descricao ?? '')
    setObrigatorio(colunaEdicao?.obrigatorio ?? false)
    setOpcoes(colunaEdicao?.opcoes ?? [])
    setNovaOpcao('')
    setErroNome(null)
    setErroOpcoes(null)
  }, [colunaEdicao])

  useEffect(() => {
    if (editando) return
    if (tipo === 'select') {
      setOpcoes([])
      return
    }
    setOpcoes([])
    setNovaOpcao('')
  }, [tipo, editando])

  const handleAdicionarOpcao = useCallback(() => {
    const trimmed = novaOpcao.trim()
    if (!trimmed || opcoes.includes(trimmed)) return
    setOpcoes((prev) => [...prev, trimmed])
    setNovaOpcao('')
    if (erroOpcoes) setErroOpcoes(null)
  }, [novaOpcao, opcoes, erroOpcoes])

  const handleRemoverOpcao = useCallback((opcao: string) => {
    setOpcoes((prev) => prev.filter((item) => item !== opcao))
  }, [])

  const handleSalvar = useCallback(async () => {
    const nomeTrim = nome.trim()
    const tipoFinal = editando && colunaEdicao ? colunaEdicao.tipo : tipo
    const tipoExigeOpcoes = tipoFinal === 'select'
    if (!nomeTrim) {
      setErroNome('Informe o nome da coluna')
      return
    }
    if (tipoExigeOpcoes && opcoes.length === 0) {
      setErroOpcoes('Adicione ao menos uma opção para este tipo de coluna')
      return
    }
    setSalvando(true)
    try {
      onSalvo({
        nome: nomeTrim,
        tipo: tipoFinal,
        descricao: descricao.trim() || undefined,
        visibilidade,
        obrigatorio,
        ...(tipoExigeOpcoes ? { opcoes: [...opcoes] } : {}),
      })
      onFechar()
    } finally {
      setSalvando(false)
    }
  }, [nome, tipo, descricao, visibilidade, obrigatorio, opcoes, editando, colunaEdicao, onSalvo, onFechar])

  return (
    <ModalFormularioAbasGlobal
      aberto
      aoFechar={onFechar}
      aoSalvar={handleSalvar}
      icone={<Columns size={24} weight="duotone" color="var(--ws-accent, #818cf8)" />}
      titulo={editando ? 'Editar coluna' : 'Nova coluna'}
      subtitulo="Crie um campo personalizado para a tabela de leituras"
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
            <div className="mnc-corpo">
              <div className="mnc-campo">
                <LabelSecao htmlFor="mnc-sr-nome" icone={<TextT {...ICONE_LABEL} />} obrigatorio>
                  Nome
                </LabelSecao>
                <input
                  id="mnc-sr-nome"
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
                <LabelSecao icone={<Columns {...ICONE_LABEL} />} obrigatorio>
                  Tipo
                </LabelSecao>
                {editando ? (
                  <p className="mnc-hint" style={{ margin: 0 }}>
                    {rotuloTipoColunaSmartRead(tipo)} — o tipo não pode ser alterado após a criação.
                  </p>
                ) : (
                  <div className="mnc-tipo-grid">
                    {TIPOS_COLUNA_SMART_READ.map((tc) => (
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
                )}
              </div>

              {tipoComOpcoes && (
                <div className="mnc-campo">
                  <LabelSecao icone={<ListBullets {...ICONE_LABEL} />} obrigatorio>
                    Opções
                  </LabelSecao>
                  <div className="mnc-nova-opcao">
                    <input
                      className="mnc-input mnc-input--como-select mnc-input--opcao"
                      type="text"
                      value={novaOpcao}
                      onChange={(e) => setNovaOpcao(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAdicionarOpcao()
                        }
                      }}
                      placeholder="Digite uma opção e pressione Enter"
                      aria-label="Nova opção"
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
                  {erroOpcoes && (
                    <p className="mnc-erro-campo" role="alert">
                      {erroOpcoes}
                    </p>
                  )}
                  <div className="mnc-opcoes-lista">
                    {opcoes.length > 0 ? (
                      opcoes.map((opcao) => (
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
                      ))
                    ) : (
                      <span className="mnc-opcoes-lista__vazio">Nenhuma opção adicionada</span>
                    )}
                  </div>
                </div>
              )}

              <div className="mnc-campo">
                <LabelSecao icone={<Eye {...ICONE_LABEL} />} obrigatorio>
                  Visibilidade
                </LabelSecao>
                <SelectGlobal
                  id="mnc-sr-visibilidade"
                  buscavel={false}
                  opcoes={[
                    { valor: 'todos', rotulo: 'Todos os usuários' },
                    { valor: 'roles', rotulo: 'Por patente (roles)' },
                    { valor: 'privado', rotulo: 'Somente eu' },
                  ]}
                  valor={visibilidade}
                  aoMudarValor={(v) => v != null && setVisibilidade(v as VisibilidadeColunaSmartRead)}
                />
              </div>

              <div className="mnc-campo">
                <LabelSecao htmlFor="mnc-sr-descricao" icone={<TextAlignLeft {...ICONE_LABEL} />}>
                  Descrição
                </LabelSecao>
                <input
                  id="mnc-sr-descricao"
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
                  <LabelSecao icone={<Asterisk {...ICONE_LABEL} />}>
                    Obrigatório
                  </LabelSecao>
                  <p className="mnc-hint">Exige preenchimento na tabela de leituras</p>
                </div>
                <Toggle id="mnc-sr-obrigatorio" checked={obrigatorio} onChange={setObrigatorio} />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
