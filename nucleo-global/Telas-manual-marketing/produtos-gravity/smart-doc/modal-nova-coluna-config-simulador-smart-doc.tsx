/**
 * ModalNovaColunaConfigSimuladorSmartDoc — paridade com ModalNovaColunaSmartRead (produto real).
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
  TextAlignLeft,
  TextT,
} from '@phosphor-icons/react'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import '../../../Campos/campo-select-global/src/select.css'
import './modal-nova-coluna-config-simulador-smart-doc.css'

export type TipoColunaSmartDocSimulador =
  | 'texto'
  | 'numero'
  | 'data'
  | 'percentual'
  | 'select'
  | 'checkbox'

type TipoColunaSmartDocSimuladorLegado = 'tipo_documento' | 'formula'

export type VisibilidadeColunaSmartDocSimulador = 'todos' | 'roles' | 'privado'

export interface ColunaPersonalizadaSmartDocSimulador {
  id: string
  nome: string
  tipo: TipoColunaSmartDocSimulador | TipoColunaSmartDocSimuladorLegado
  visible: boolean
  descricao?: string
  visibilidade?: VisibilidadeColunaSmartDocSimulador
  roles_permitidas?: string[]
  obrigatorio?: boolean
  id_usuario_criador?: string
}

const TIPOS_COLUNA: Array<{ id: TipoColunaSmartDocSimulador; icone: ReactNode; label: string }> = [
  { id: 'texto', label: 'Texto', icone: <TextT size={16} weight="duotone" /> },
  { id: 'numero', label: 'Número', icone: <Hash size={16} weight="duotone" /> },
  { id: 'data', label: 'Data', icone: <CalendarBlank size={16} weight="duotone" /> },
  { id: 'percentual', label: 'Percentual', icone: <Percent size={16} weight="duotone" /> },
  { id: 'select', label: 'Lista', icone: <ListBullets size={16} weight="duotone" /> },
  { id: 'checkbox', label: 'Checkbox', icone: <CheckSquare size={16} weight="duotone" /> },
]

const ROTULOS_TIPO_LEGADO: Record<TipoColunaSmartDocSimuladorLegado, string> = {
  tipo_documento: 'Tipo documento',
  formula: 'Fórmula',
}

export function rotuloTipoColunaSmartDocSimulador(
  tipo: TipoColunaSmartDocSimulador | TipoColunaSmartDocSimuladorLegado,
): string {
  return TIPOS_COLUNA.find((t) => t.id === tipo)?.label
    ?? ROTULOS_TIPO_LEGADO[tipo as TipoColunaSmartDocSimuladorLegado]
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

export function ModalNovaColunaConfigSimuladorSmartDoc({
  colunaEdicao,
  onFechar,
  onSalvo,
}: {
  colunaEdicao?: ColunaPersonalizadaSmartDocSimulador
  onFechar: () => void
  onSalvo: (dados: {
    nome: string
    tipo: TipoColunaSmartDocSimulador
    descricao?: string
    visibilidade: VisibilidadeColunaSmartDocSimulador
    obrigatorio: boolean
  }) => void
}) {
  const editando = Boolean(colunaEdicao)
  const [nome, setNome] = useState(colunaEdicao?.nome ?? '')
  const [tipo, setTipo] = useState<TipoColunaSmartDocSimulador>(
    colunaEdicao?.tipo && TIPOS_COLUNA.some((t) => t.id === colunaEdicao.tipo)
      ? (colunaEdicao.tipo as TipoColunaSmartDocSimulador)
      : 'texto',
  )
  const [visibilidade, setVisibilidade] = useState<VisibilidadeColunaSmartDocSimulador>(
    colunaEdicao?.visibilidade ?? 'todos',
  )
  const [descricao, setDescricao] = useState(colunaEdicao?.descricao ?? '')
  const [obrigatorio, setObrigatorio] = useState(colunaEdicao?.obrigatorio ?? false)
  const [erroNome, setErroNome] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setNome(colunaEdicao?.nome ?? '')
    setTipo(
      colunaEdicao?.tipo && TIPOS_COLUNA.some((t) => t.id === colunaEdicao.tipo)
        ? (colunaEdicao.tipo as TipoColunaSmartDocSimulador)
        : 'texto',
    )
    setVisibilidade(colunaEdicao?.visibilidade ?? 'todos')
    setDescricao(colunaEdicao?.descricao ?? '')
    setObrigatorio(colunaEdicao?.obrigatorio ?? false)
    setErroNome(null)
  }, [colunaEdicao])

  const handleSalvar = useCallback(async () => {
    const nomeTrim = nome.trim()
    if (!nomeTrim) {
      setErroNome('Informe o nome da coluna')
      return
    }
    setSalvando(true)
    try {
      onSalvo({
        nome: nomeTrim,
        tipo: editando && colunaEdicao ? colunaEdicao.tipo : tipo,
        descricao: descricao.trim() || undefined,
        visibilidade,
        obrigatorio,
      })
      onFechar()
    } finally {
      setSalvando(false)
    }
  }, [nome, tipo, descricao, visibilidade, obrigatorio, editando, colunaEdicao, onSalvo, onFechar])

  return (
    <ModalFormularioAbasGlobal
      aberto
      aoFechar={onFechar}
      aoSalvar={handleSalvar}
      icone={<Columns size={24} weight="duotone" color="var(--ws-accent, #a78bfa)" />}
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
                <LabelSecao htmlFor="mnc-sds-nome" icone={<TextT {...ICONE_LABEL} />} obrigatorio>
                  Nome
                </LabelSecao>
                <input
                  id="mnc-sds-nome"
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
                    {rotuloTipoColunaSmartDocSimulador(tipo)} — o tipo não pode ser alterado após a criação.
                  </p>
                ) : (
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
                )}
              </div>

              <div className="mnc-campo">
                <LabelSecao icone={<Eye {...ICONE_LABEL} />} obrigatorio>
                  Visibilidade
                </LabelSecao>
                <SelectGlobal
                  id="mnc-sds-visibilidade"
                  buscavel={false}
                  opcoes={[
                    { valor: 'todos', rotulo: 'Todos os usuários' },
                    { valor: 'roles', rotulo: 'Por patente (roles)' },
                    { valor: 'privado', rotulo: 'Somente eu' },
                  ]}
                  valor={visibilidade}
                  aoMudarValor={(v) => v != null && setVisibilidade(v as VisibilidadeColunaSmartDocSimulador)}
                />
              </div>

              <div className="mnc-campo">
                <LabelSecao htmlFor="mnc-sds-descricao" icone={<TextAlignLeft {...ICONE_LABEL} />}>
                  Descrição
                </LabelSecao>
                <input
                  id="mnc-sds-descricao"
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
                <Toggle id="mnc-sds-obrigatorio" checked={obrigatorio} onChange={setObrigatorio} />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
