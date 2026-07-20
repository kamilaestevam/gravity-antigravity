import React, { useMemo, useState } from 'react'
import {
  CalendarBlank,
  CaretDown,
  CheckCircle,
  Clock,
  Envelope,
  EnvelopeSimple,
  Eye,
  LockKey,
  NotePencil,
  PencilSimple,
  Plus,
  Trash,
  Users,
  WarningCircle,
  ChatCircle,
} from '@phosphor-icons/react'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import type { CampoGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'
import {
  ICONE_FIELD,
  ICONE_LABEL_SECAO,
  SimuladorNcField,
  SimuladorNcOptionButton,
  SimuladorNcSectionTitle,
} from './manual-bid-frete-simulador-nc-ui'

export type TipoVisibilidade = 'DIRECIONADA' | 'ABERTA' | ''
export type CanalDisparoSimulador = 'EMAIL' | 'WHATSAPP'
export type CampoVisibilidadeId =
  | 'prazo_respostas'
  | 'fornecedor_pode_alterar'
  | 'tipo_visibilidade'
  | 'proposta_anonima'
  | 'fornecedores'

export type EstadoVisibilidade = {
  data_prazo: string
  hora_prazo: string
  fornecedor_pode_alterar: 'sim' | 'nao' | ''
  tipo_visibilidade: TipoVisibilidade
  proposta_anonima: boolean
  canais: CanalDisparoSimulador[]
  ids_fornecedores: string[]
}

type FornecedorMock = {
  id: string
  nome: string
  tipo: string
  emails: string[]
}

const FORNECEDORES_MOCK: readonly FornecedorMock[] = [
  { id: 'abc', nome: 'ABC', tipo: 'Agente de Carga', emails: ['comercial@abc.com'] },
  { id: 'agente-acd', nome: 'AGENTE ACD', tipo: 'Agente de Carga', emails: ['ops@agenteacd.com'] },
  { id: 'agente-despachante', nome: 'AGENTE E DESPACHANTE', tipo: 'Agente de Carga', emails: [] },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function emailsIniciaisMock(): Record<string, string[]> {
  return Object.fromEntries(FORNECEDORES_MOCK.map((f) => [f.id, [...f.emails]]))
}

const OPCOES_ALTERAR_PROPOSTA: SelectOpcao[] = [
  { valor: 'sim', rotulo: 'Sim' },
  { valor: 'nao', rotulo: 'Não' },
]

function dataIsoLocal(diasAFrente = 3): string {
  const d = new Date()
  d.setDate(d.getDate() + diasAFrente)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function aplicarMascaraHoraInput(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 4)
  if (digitos.length <= 2) return digitos
  return `${digitos.slice(0, 2)}:${digitos.slice(2)}`
}

function horaInputValida(hora: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(hora)) return false
  const [hh, mm] = hora.split(':').map(Number)
  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59
}

function parseDataLocal(iso: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function formatarDataBr(iso: string): string {
  const d = parseDataLocal(iso)
  if (!d) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

export const ESTADO_VISIBILIDADE_INICIAL: EstadoVisibilidade = {
  data_prazo: dataIsoLocal(3),
  hora_prazo: '23:59',
  fornecedor_pode_alterar: 'nao',
  tipo_visibilidade: 'DIRECIONADA',
  proposta_anonima: false,
  canais: ['EMAIL'],
  ids_fornecedores: FORNECEDORES_MOCK.filter((f) => f.emails.length > 0).map((f) => f.id),
}

const APLICAVEL_TODOS_CONTEXTO = {
  aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'] as const,
  aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'] as const,
  aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'] as const,
}

export const CAMPOS_VISIBILIDADE_BID_FRETE: CampoGuiaAoVivo<CampoVisibilidadeId>[] = [
  {
    id: 'prazo_respostas',
    num: '01',
    rotulo: 'Prazo para respostas',
    paragrafoGuia:
      'Define até quando os fornecedores podem enviar ou alterar propostas. Informe a **data de vencimento** e a **hora**.',
    icone: CalendarBlank,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.35)',
    fundo: 'rgba(99,102,241,.1)',
    descricaoPontos: ['Data de vencimento obrigatória', 'Hora no formato HH:mm'],
    obrigatorio: true,
    ...APLICAVEL_TODOS_CONTEXTO,
  },
  {
    id: 'fornecedor_pode_alterar',
    num: '02',
    rotulo: 'Fornecedor pode alterar proposta',
    paragrafoGuia:
      'Enquanto o prazo estiver aberto. Padrão da organização: **Não**: escolha obrigatória nesta cotação.',
    icone: NotePencil,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.35)',
    fundo: 'rgba(14,165,233,.1)',
    obrigatorio: true,
    ...APLICAVEL_TODOS_CONTEXTO,
  },
  {
    id: 'tipo_visibilidade',
    num: '03',
    rotulo: 'Visibilidade da cotação',
    paragrafoGuia:
      'Define se a cotação será enviada a fornecedores escolhidos (**Direcionada**) ou a todos que aceitam cotação aberta (**Aberta**).',
    icone: Eye,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.35)',
    fundo: 'rgba(139,92,246,.1)',
    descricaoPontos: [
      'Direcionada: escolher fornecedores e canais de disparo',
      'Aberta: todos os fornecedores que aceitam cotação aberta',
    ],
    obrigatorio: true,
    ...APLICAVEL_TODOS_CONTEXTO,
  },
  {
    id: 'proposta_anonima',
    num: '04',
    rotulo: 'Cotação anônima',
    paragrafoGuia:
      'Oculta o nome da sua empresa no mercado inicial de lances para total confidencialidade.',
    icone: LockKey,
    cor: '#c084fc',
    borda: 'rgba(192,132,252,.35)',
    fundo: 'rgba(168,85,247,.1)',
    obrigatorio: false,
    ...APLICAVEL_TODOS_CONTEXTO,
  },
  {
    id: 'fornecedores',
    num: '05',
    rotulo: 'Fornecedores e envio',
    paragrafoGuia:
      'Na visibilidade direcionada, selecione os fornecedores e os canais (e-mail / WhatsApp) que receberão o pedido de cotação.',
    icone: Users,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
    obrigatorio: false,
    obrigatorioNota: 'Obrigatório selecionar ao menos um fornecedor na cotação direcionada',
    ...APLICAVEL_TODOS_CONTEXTO,
  },
]

export function podeAvancarPassoVisibilidade(estado: EstadoVisibilidade): boolean {
  if (!estado.data_prazo || !horaInputValida(estado.hora_prazo)) return false
  if (!estado.fornecedor_pode_alterar) return false
  if (!estado.tipo_visibilidade) return false
  if (estado.canais.length === 0) return false
  if (estado.tipo_visibilidade === 'DIRECIONADA') return estado.ids_fornecedores.length > 0
  return true
}

export function resolverSelecoesVisibilidade(
  estado: EstadoVisibilidade,
  interagiu: Partial<Record<CampoVisibilidadeId, boolean>>,
): { id: CampoVisibilidadeId; valor: string }[] {
  const selecoes: { id: CampoVisibilidadeId; valor: string }[] = []
  if (interagiu.prazo_respostas && estado.data_prazo) {
    const dataBr = formatarDataBr(estado.data_prazo)
    selecoes.push({
      id: 'prazo_respostas',
      valor: estado.hora_prazo ? `${dataBr} ${estado.hora_prazo}` : dataBr,
    })
  }
  if (interagiu.fornecedor_pode_alterar && estado.fornecedor_pode_alterar) {
    selecoes.push({
      id: 'fornecedor_pode_alterar',
      valor: estado.fornecedor_pode_alterar === 'sim' ? 'Sim' : 'Não',
    })
  }
  if (interagiu.tipo_visibilidade && estado.tipo_visibilidade) {
    selecoes.push({
      id: 'tipo_visibilidade',
      valor: estado.tipo_visibilidade === 'DIRECIONADA' ? 'Direcionada' : 'Aberta',
    })
  }
  if (interagiu.proposta_anonima) {
    selecoes.push({
      id: 'proposta_anonima',
      valor: estado.proposta_anonima ? 'Ativada' : 'Desativada',
    })
  }
  if (interagiu.fornecedores && estado.tipo_visibilidade === 'DIRECIONADA' && estado.ids_fornecedores.length) {
    selecoes.push({ id: 'fornecedores', valor: `${estado.ids_fornecedores.length} selecionado(s)` })
  }
  return selecoes
}

export function resolverExplicacaoVisibilidade(
  estado: EstadoVisibilidade,
  campo: CampoVisibilidadeId,
): string {
  if (campo === 'prazo_respostas') {
    const dataBr = formatarDataBr(estado.data_prazo)
    return dataBr
      ? `Prazo definido para **${dataBr}${estado.hora_prazo ? ` às ${estado.hora_prazo}` : ''}**. Até esse momento os fornecedores podem enviar ou alterar propostas.`
      : ''
  }
  if (campo === 'fornecedor_pode_alterar') {
    if (!estado.fornecedor_pode_alterar) return ''
    return estado.fornecedor_pode_alterar === 'sim'
      ? 'Você permitiu que o fornecedor **altere a proposta** enquanto o prazo estiver aberto.'
      : 'Você definiu que o fornecedor **não pode alterar** a proposta após o envio (enquanto o prazo estiver aberto).'
  }
  if (campo === 'tipo_visibilidade') {
    return estado.tipo_visibilidade === 'DIRECIONADA'
      ? 'Você selecionou **Direcionada**: após criar a cotação, selecione os fornecedores e os canais de disparo.'
      : 'Você selecionou **Aberta**: todos os fornecedores cadastrados que aceitam cotação aberta receberão a solicitação.'
  }
  if (campo === 'fornecedores') {
    const nomes = FORNECEDORES_MOCK
      .filter((fornecedor) => estado.ids_fornecedores.includes(fornecedor.id))
      .map((fornecedor) => fornecedor.nome)
    return nomes.length
      ? `Fornecedores selecionados: **${nomes.join(', ')}**. Canais: **${estado.canais.join(' · ')}**.`
      : 'Selecione pelo menos um fornecedor para a cotação direcionada.'
  }
  return estado.proposta_anonima
    ? '**Cotação anônima ativada**: o nome da sua empresa ficará oculto no mercado inicial de lances.'
    : '**Cotação anônima desativada**: o nome da sua empresa será exibido normalmente.'
}

function ItemFornecedorDisparoSimulador({
  fornecedor,
  selecionado,
  canais,
  emails,
  onToggleSelecionado,
  onEmailsChange,
}: {
  fornecedor: FornecedorMock
  selecionado: boolean
  canais: CanalDisparoSimulador[]
  emails: string[]
  onToggleSelecionado: () => void
  onEmailsChange: (emails: string[]) => void
}) {
  const [expandido, setExpandido] = useState(false)
  const [emailNovo, setEmailNovo] = useState('')
  const [emailEditando, setEmailEditando] = useState<string | null>(null)
  const [emailEditandoValor, setEmailEditandoValor] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const exibirPainelEmail = canais.includes('EMAIL')
  const temEmail = emails.length > 0

  const adicionarEmail = () => {
    const valor = emailNovo.trim().toLowerCase()
    if (!EMAIL_REGEX.test(valor)) {
      setErro('E-mail inválido')
      return
    }
    if (emails.includes(valor)) {
      setErro('E-mail já cadastrado')
      return
    }
    onEmailsChange([...emails, valor])
    setEmailNovo('')
    setErro(null)
  }

  const salvarEdicao = () => {
    if (!emailEditando) return
    const valor = emailEditandoValor.trim().toLowerCase()
    if (!EMAIL_REGEX.test(valor)) {
      setErro('E-mail inválido')
      return
    }
    if (valor !== emailEditando && emails.includes(valor)) {
      setErro('E-mail já cadastrado')
      return
    }
    onEmailsChange(emails.map((e) => (e === emailEditando ? valor : e)))
    setEmailEditando(null)
    setEmailEditandoValor('')
    setErro(null)
  }

  return (
    <div className={`nc-disparo-item${selecionado ? ' nc-disparo-item--selected' : ''}`}>
      <div className="nc-disparo-item-linha">
        <label className="nc-disparo-item-check">
          <input type="checkbox" checked={selecionado} onChange={onToggleSelecionado} />
        </label>
        <span className="nc-disparo-item-corpo">
          <span className="nc-disparo-item-nome">{fornecedor.nome}</span>
          {exibirPainelEmail && !expandido ? (
            <span className={`nc-disparo-badge${temEmail ? ' nc-disparo-badge--ok' : ' nc-disparo-badge--warn'}`}>
              {temEmail ? <CheckCircle size={12} weight="fill" /> : <WarningCircle size={12} weight="fill" />}
              {temEmail ? 'E-mail cadastrado' : 'Sem e-mail'}
            </span>
          ) : null}
        </span>
        <span className="nc-disparo-item-meta">{fornecedor.tipo}</span>
        {exibirPainelEmail ? (
          <button
            type="button"
            className={`nc-disparo-item-expandir${expandido ? ' nc-disparo-item-expandir--aberto' : ''}`}
            aria-expanded={expandido}
            aria-label={expandido ? 'Ocultar e-mails' : 'Expandir e-mails'}
            onClick={() => {
              setExpandido((v) => !v)
              setErro(null)
              setEmailEditando(null)
            }}
          >
            <CaretDown size={14} weight="bold" />
          </button>
        ) : null}
      </div>

      {expandido && exibirPainelEmail ? (
        <div className="nc-disparo-item-painel">
          <p className="nc-disparo-emails-titulo">
            <EnvelopeSimple weight="duotone" size={14} />
            E-mails cadastrados
          </p>
          {emails.length === 0 ? (
            <p className="nc-cargo-subsecao-hint" style={{ margin: '0 0 0.5rem' }}>
              Nenhum e-mail cadastrado para este fornecedor.
            </p>
          ) : (
            <ul className="nc-disparo-emails-lista">
              {emails.map((email) => (
                <li key={email}>
                  {emailEditando === email ? (
                    <div className="nc-disparo-email-edicao">
                      <input
                        className="nc-input"
                        type="email"
                        value={emailEditandoValor}
                        onChange={(e) => setEmailEditandoValor(e.target.value)}
                        autoFocus
                      />
                      <div className="nc-disparo-email-acoes-form">
                        <button
                          type="button"
                          className="nc-disparo-email-link"
                          onClick={() => {
                            setEmailEditando(null)
                            setErro(null)
                          }}
                        >
                          Cancelar
                        </button>
                        <button type="button" className="nc-disparo-email-salvar" onClick={salvarEdicao}>
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="nc-disparo-email-row">
                      <span className="nc-disparo-email-endereco">{email}</span>
                      <div className="nc-disparo-email-row-acoes">
                        <button
                          type="button"
                          className="nc-disparo-email-acao"
                          aria-label="Editar e-mail"
                          onClick={() => {
                            setEmailEditando(email)
                            setEmailEditandoValor(email)
                            setErro(null)
                          }}
                        >
                          <PencilSimple size={15} weight="bold" />
                        </button>
                        <button
                          type="button"
                          className="nc-disparo-email-acao nc-disparo-email-acao--excluir"
                          aria-label="Excluir e-mail"
                          onClick={() => {
                            onEmailsChange(emails.filter((e) => e !== email))
                            setErro(null)
                          }}
                        >
                          <Trash size={15} weight="bold" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="nc-disparo-email-novo">
            <input
              className="nc-input"
              type="email"
              placeholder="email@fornecedor.com"
              value={emailNovo}
              onChange={(e) => {
                setEmailNovo(e.target.value)
                setErro(null)
              }}
            />
            <button type="button" className="nc-disparo-email-salvar" onClick={adicionarEmail}>
              <Plus size={12} weight="bold" />
              Adicionar e-mail
            </button>
          </div>
          {erro ? (
            <p className="nc-disparo-email-erro" role="alert">
              {erro}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

type ConteudoPassoVisibilidadeSimuladorProps = {
  estado: EstadoVisibilidade
  aoAtualizar: (parcial: Partial<EstadoVisibilidade>) => void
  aoInteragir: (campo: CampoVisibilidadeId) => void
  aoDesligarCampo: (campo: CampoVisibilidadeId) => void
}

export function ConteudoPassoVisibilidadeSimulador({
  estado,
  aoAtualizar,
  aoInteragir,
  aoDesligarCampo,
}: ConteudoPassoVisibilidadeSimuladorProps) {
  const prazoDataSelecionada = useMemo(() => parseDataLocal(estado.data_prazo), [estado.data_prazo])
  const [emailsPorFornecedor, setEmailsPorFornecedor] = useState<Record<string, string[]>>(emailsIniciaisMock)
  const todosSelecionados =
    FORNECEDORES_MOCK.length > 0
    && FORNECEDORES_MOCK.every((f) => estado.ids_fornecedores.includes(f.id))

  const alternarFornecedor = (id: string) => {
    const selecionado = estado.ids_fornecedores.includes(id)
    aoAtualizar({
      ids_fornecedores: selecionado
        ? estado.ids_fornecedores.filter((atual) => atual !== id)
        : [...estado.ids_fornecedores, id],
    })
    aoInteragir('fornecedores')
  }

  const alternarCanal = (canal: CanalDisparoSimulador) => {
    const ativo = estado.canais.includes(canal)
    aoAtualizar({
      canais: ativo ? estado.canais.filter((c) => c !== canal) : [...estado.canais, canal],
    })
    aoInteragir('fornecedores')
  }

  return (
    <div className="nc-root nc-step-wrapper nc-fade-in">
      <div className="nc-step-content nc-cargo-stack">
        <section className="nc-cargo-subsecao" style={{ marginBottom: '1.5rem' }}>
          <SimuladorNcSectionTitle icone={<CalendarBlank {...ICONE_LABEL_SECAO} />}>
            Prazo para respostas
          </SimuladorNcSectionTitle>
          <p className="nc-cargo-subsecao-hint">
            Obrigatório: define até quando os fornecedores podem enviar ou alterar propostas.
          </p>
          <div className="nc-prazo-data-hora">
            <SimuladorNcField
              label="Data de vencimento"
              obrigatorio
              icone={<CalendarBlank {...ICONE_FIELD} />}
            >
              <CampoCalendarioGlobal
                modoUnico
                permitirLimpar={false}
                placeholder="DD/MM/AAAA"
                valor={{ inicio: prazoDataSelecionada, fim: prazoDataSelecionada }}
                aoMudarValor={({ inicio }) => {
                  if (!inicio) return
                  const yyyy = inicio.getFullYear()
                  const mm = String(inicio.getMonth() + 1).padStart(2, '0')
                  const dd = String(inicio.getDate()).padStart(2, '0')
                  aoAtualizar({ data_prazo: `${yyyy}-${mm}-${dd}` })
                  aoInteragir('prazo_respostas')
                }}
              />
            </SimuladorNcField>
            <SimuladorNcField label="Hora" obrigatorio icone={<Clock {...ICONE_FIELD} />}>
              <div className="nc-input-icon-wrap">
                <Clock className="nc-input-search-icon" size={16} weight="duotone" aria-hidden />
                <input
                  className="nc-input nc-input--search"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="HH:mm"
                  maxLength={5}
                  value={estado.hora_prazo}
                  disabled={!estado.data_prazo}
                  onChange={(e) => {
                    if (!estado.data_prazo) return
                    aoAtualizar({ hora_prazo: aplicarMascaraHoraInput(e.target.value) })
                    aoInteragir('prazo_respostas')
                  }}
                  onBlur={(e) => {
                    if (!estado.data_prazo) return
                    const hora = aplicarMascaraHoraInput(e.target.value)
                    if (!horaInputValida(hora)) return
                    aoAtualizar({ hora_prazo: hora })
                    aoInteragir('prazo_respostas')
                  }}
                />
              </div>
            </SimuladorNcField>
          </div>
        </section>

        <section className="nc-cargo-subsecao" style={{ marginBottom: '1.5rem' }}>
          <SimuladorNcSectionTitle icone={<NotePencil {...ICONE_LABEL_SECAO} />}>
            Fornecedor pode alterar proposta
          </SimuladorNcSectionTitle>
          <p className="nc-cargo-subsecao-hint">
            Enquanto o prazo estiver aberto. Padrão da organização: Não: escolha obrigatória nesta cotação.
          </p>
          <SimuladorNcField
            label="Permitir edição da proposta"
            obrigatorio
            icone={<NotePencil {...ICONE_FIELD} />}
          >
            <SelectGlobal
              opcoes={OPCOES_ALTERAR_PROPOSTA}
              valor={estado.fornecedor_pode_alterar || null}
              aoMudarValor={(v) => {
                const valor = v == null ? '' : (String(v) as 'sim' | 'nao' | '')
                aoAtualizar({ fornecedor_pode_alterar: valor })
                aoInteragir('fornecedor_pode_alterar')
              }}
              placeholder="Selecionar"
              posicao="auto"
            />
          </SimuladorNcField>
        </section>

        <section className="nc-cargo-subsecao nc-visibilidade-subsecao" style={{ marginBottom: '1.5rem' }}>
          <SimuladorNcSectionTitle icone={<Eye {...ICONE_LABEL_SECAO} />} obrigatorio>
            Visibilidade da cotação
          </SimuladorNcSectionTitle>
          <div className="nc-options-grid-2 nc-visibilidade-inline">
            <SimuladorNcOptionButton
              selected={estado.tipo_visibilidade === 'DIRECIONADA'}
              onClick={() => {
                aoAtualizar({ tipo_visibilidade: 'DIRECIONADA' })
                aoInteragir('tipo_visibilidade')
              }}
              icon={<Users weight="duotone" size={20} />}
              label="Direcionada: Escolher fornecedores"
              description="Após criar a cotação, você poderá selecionar os fornecedores e os canais de disparo."
            />
            <SimuladorNcOptionButton
              selected={estado.tipo_visibilidade === 'ABERTA'}
              onClick={() => {
                aoAtualizar({ tipo_visibilidade: 'ABERTA', ids_fornecedores: [] })
                aoInteragir('tipo_visibilidade')
                aoDesligarCampo('fornecedores')
              }}
              icon={<Users weight="duotone" size={20} />}
              label="Aberta: Todos os fornecedores"
              description="Todos os fornecedores cadastrados que aceitam cotação aberta receberão a solicitação."
            />
          </div>

          <div className="nc-switch-row">
            <label className="nc-switch-label">
              <span className="nc-switch-text">
                <span className="nc-switch-title">Cotação anônima (ocultar nome da empresa)</span>
                <span className="nc-switch-desc">
                  Ocultar o nome da sua empresa no mercado inicial de lances para total confidencialidade.
                </span>
              </span>
              <span className="nc-switch">
                <input
                  type="checkbox"
                  checked={estado.proposta_anonima}
                  onChange={(event) => {
                    aoAtualizar({ proposta_anonima: event.target.checked })
                    aoInteragir('proposta_anonima')
                  }}
                  aria-label="Ativar cotação anônima"
                />
                <span className="nc-switch-slider" aria-hidden />
              </span>
            </label>
          </div>
        </section>

        <section className="nc-cargo-subsecao" style={{ marginBottom: '1.5rem' }}>
          <SimuladorNcSectionTitle icone={<Users {...ICONE_LABEL_SECAO} />}>
            Fornecedores e envio
          </SimuladorNcSectionTitle>
          <p className="nc-cargo-subsecao-hint">
            {estado.tipo_visibilidade === 'ABERTA'
              ? 'A cotação será enviada a todos os fornecedores ativos que aceitam cotação aberta.'
              : 'Selecione os fornecedores que receberão o pedido de cotação por e-mail.'}
          </p>

          <div className="nc-disparo-canais">
            <span className="nc-disparo-canais-label">Canais</span>
            <label className="nc-disparo-canal">
              <input
                type="checkbox"
                checked={estado.canais.includes('EMAIL')}
                onChange={() => alternarCanal('EMAIL')}
              />
              <Envelope weight="duotone" size={16} />
              E-mail (Resend)
            </label>
            <label className="nc-disparo-canal">
              <input
                type="checkbox"
                checked={estado.canais.includes('WHATSAPP')}
                onChange={() => alternarCanal('WHATSAPP')}
              />
              <ChatCircle weight="duotone" size={16} />
              WhatsApp
            </label>
            {estado.tipo_visibilidade === 'DIRECIONADA' ? (
              <button
                type="button"
                className="nc-disparo-selecionar-todos"
                onClick={() => {
                  aoAtualizar({
                    ids_fornecedores: todosSelecionados
                      ? []
                      : FORNECEDORES_MOCK.map((f) => f.id),
                  })
                  aoInteragir('fornecedores')
                }}
              >
                {todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            ) : null}
          </div>

          {estado.tipo_visibilidade === 'DIRECIONADA' ? (
            <div className="nc-disparo-lista-wrap">
              <div className="nc-disparo-lista">
                {FORNECEDORES_MOCK.map((fornecedor) => (
                  <ItemFornecedorDisparoSimulador
                    key={fornecedor.id}
                    fornecedor={fornecedor}
                    selecionado={estado.ids_fornecedores.includes(fornecedor.id)}
                    canais={estado.canais}
                    emails={emailsPorFornecedor[fornecedor.id] ?? []}
                    onToggleSelecionado={() => alternarFornecedor(fornecedor.id)}
                    onEmailsChange={(emails) => {
                      setEmailsPorFornecedor((prev) => ({ ...prev, [fornecedor.id]: emails }))
                      aoInteragir('fornecedores')
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="nc-cargo-subsecao-hint" style={{ marginTop: '0.75rem' }}>
              Preview: nesta cotação aberta, todos os fornecedores elegíveis da rede receberiam o disparo
              (simulação do manual: sem lista editável).
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
