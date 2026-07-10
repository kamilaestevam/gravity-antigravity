import React from 'react'
import { Buildings, GlobeHemisphereWest, LockKey, Users } from '@phosphor-icons/react'
import type { CampoGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'
import {
  ICONE_LABEL_SECAO,
  SimuladorNcOptionButton,
  SimuladorNcSectionTitle,
} from './manual-bid-frete-simulador-nc-ui'

export type TipoVisibilidade = 'DIRECIONADA' | 'ABERTA' | ''
export type CampoVisibilidadeId = 'tipo_visibilidade' | 'fornecedores' | 'proposta_anonima'

export type EstadoVisibilidade = {
  tipo_visibilidade: TipoVisibilidade
  proposta_anonima: boolean
  ids_fornecedores: string[]
}

type FornecedorMock = {
  id: string
  nome: string
  especialidade: string
}

const FORNECEDORES_MOCK: readonly FornecedorMock[] = [
  { id: 'atlantic-cargo', nome: 'Atlantic Cargo', especialidade: 'Mar?timo e a?reo' },
  { id: 'global-log', nome: 'Global Log', especialidade: 'Opera??es internacionais' },
  { id: 'rota-sul', nome: 'Rota Sul Transportes', especialidade: 'Rodovi?rio Mercosul' },
]

export const ESTADO_VISIBILIDADE_INICIAL: EstadoVisibilidade = {
  tipo_visibilidade: '',
  proposta_anonima: false,
  ids_fornecedores: [],
}

export const CAMPOS_VISIBILIDADE_BID_FRETE: CampoGuiaAoVivo<CampoVisibilidadeId>[] = [
  {
    id: 'tipo_visibilidade',
    num: '01',
    rotulo: 'Tipo de visibilidade',
    paragrafoGuia: 'Define se a cota??o ser? enviada a fornecedores escolhidos ou ficar? dispon?vel para toda a rede.',
    icone: GlobeHemisphereWest,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.35)',
    fundo: 'rgba(99,102,241,.1)',
    descricaoPontos: ['Direcionada: somente fornecedores selecionados', 'Aberta: todos os fornecedores da rede'],
    obrigatorio: true,
  },
  {
    id: 'fornecedores',
    num: '02',
    rotulo: 'Fornecedores convidados',
    paragrafoGuia: 'Na visibilidade direcionada, escolha pelo menos um fornecedor para receber a solicita??o.',
    icone: Buildings,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.35)',
    fundo: 'rgba(14,165,233,.1)',
    obrigatorio: false,
    obrigatorioNota: 'Obrigat?rio apenas para uma cota??o direcionada',
  },
  {
    id: 'proposta_anonima',
    num: '03',
    rotulo: 'Proposta an?nima',
    paragrafoGuia: 'Oculta a identidade dos participantes durante a disputa para reduzir influ?ncia entre propostas.',
    icone: LockKey,
    cor: '#c084fc',
    borda: 'rgba(192,132,252,.35)',
    fundo: 'rgba(168,85,247,.1)',
    obrigatorio: false,
  },
]

export function podeAvancarPassoVisibilidade(estado: EstadoVisibilidade): boolean {
  if (!estado.tipo_visibilidade) return false
  if (estado.tipo_visibilidade === 'DIRECIONADA') return estado.ids_fornecedores.length > 0
  return true
}

export function resolverSelecoesVisibilidade(
  estado: EstadoVisibilidade,
  interagiu: Partial<Record<CampoVisibilidadeId, boolean>>,
): { id: CampoVisibilidadeId; valor: string }[] {
  const selecoes: { id: CampoVisibilidadeId; valor: string }[] = []
  if (interagiu.tipo_visibilidade && estado.tipo_visibilidade) {
    selecoes.push({
      id: 'tipo_visibilidade',
      valor: estado.tipo_visibilidade === 'DIRECIONADA' ? 'Direcionada' : 'Aberta',
    })
  }
  if (interagiu.fornecedores && estado.tipo_visibilidade === 'DIRECIONADA' && estado.ids_fornecedores.length) {
    selecoes.push({ id: 'fornecedores', valor: `${estado.ids_fornecedores.length} selecionado(s)` })
  }
  if (interagiu.proposta_anonima) {
    selecoes.push({ id: 'proposta_anonima', valor: estado.proposta_anonima ? 'Ativada' : 'Desativada' })
  }
  return selecoes
}

export function resolverExplicacaoVisibilidade(
  estado: EstadoVisibilidade,
  campo: CampoVisibilidadeId,
): string {
  if (campo === 'tipo_visibilidade') {
    return estado.tipo_visibilidade === 'DIRECIONADA'
      ? 'Voc? selecionou **Direcionada**: somente os fornecedores convidados poder?o participar da cota??o.'
      : 'Voc? selecionou **Aberta**: a cota??o ficar? dispon?vel para todos os fornecedores da rede.'
  }
  if (campo === 'fornecedores') {
    const nomes = FORNECEDORES_MOCK
      .filter((fornecedor) => estado.ids_fornecedores.includes(fornecedor.id))
      .map((fornecedor) => fornecedor.nome)
    return nomes.length
      ? `Fornecedores convidados: **${nomes.join(', ')}**.`
      : 'Selecione pelo menos um fornecedor para a cota??o direcionada.'
  }
  return estado.proposta_anonima
    ? '**Proposta an?nima ativada**: a identidade dos participantes ficar? oculta durante a disputa.'
    : '**Proposta an?nima desativada**: os participantes ser?o identificados durante a disputa.'
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
  const alternarFornecedor = (id: string) => {
    const selecionado = estado.ids_fornecedores.includes(id)
    aoAtualizar({
      ids_fornecedores: selecionado
        ? estado.ids_fornecedores.filter((atual) => atual !== id)
        : [...estado.ids_fornecedores, id],
    })
    aoInteragir('fornecedores')
  }

  return (
    <div className="nc-root nc-step-wrapper nc-fade-in">
      <div className="nc-step-content nc-cargo-stack">
        <section className="nc-cargo-subsecao nc-visibilidade-subsecao">
          <SimuladorNcSectionTitle icone={<GlobeHemisphereWest {...ICONE_LABEL_SECAO} />} obrigatorio>
            Visibilidade da cota??o
          </SimuladorNcSectionTitle>
          <p className="nc-cargo-subsecao-hint">
            Escolha quem poder? visualizar e responder ? solicita??o de frete.
          </p>
          <div className="nc-options-grid-2">
            <SimuladorNcOptionButton
              selected={estado.tipo_visibilidade === 'DIRECIONADA'}
              onClick={() => {
                aoAtualizar({ tipo_visibilidade: 'DIRECIONADA' })
                aoInteragir('tipo_visibilidade')
              }}
              icon={<Users weight="duotone" size={22} />}
              label="Direcionada"
              description="Somente fornecedores selecionados"
            />
            <SimuladorNcOptionButton
              selected={estado.tipo_visibilidade === 'ABERTA'}
              onClick={() => {
                aoAtualizar({ tipo_visibilidade: 'ABERTA', ids_fornecedores: [] })
                aoInteragir('tipo_visibilidade')
                aoDesligarCampo('fornecedores')
              }}
              icon={<GlobeHemisphereWest weight="duotone" size={22} />}
              label="Aberta"
              description="Dispon?vel para toda a rede"
            />
          </div>

          {estado.tipo_visibilidade === 'DIRECIONADA' ? (
            <div>
              <SimuladorNcSectionTitle icone={<Buildings {...ICONE_LABEL_SECAO} />} obrigatorio>
                Fornecedores convidados
              </SimuladorNcSectionTitle>
              <div className="nc-fornecedores-lista">
                {FORNECEDORES_MOCK.map((fornecedor) => {
                  const selecionado = estado.ids_fornecedores.includes(fornecedor.id)
                  return (
                    <label
                      key={fornecedor.id}
                      className={`nc-fornecedor-item${selecionado ? ' nc-fornecedor-item--selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => alternarFornecedor(fornecedor.id)}
                      />
                      <span>
                        <strong>{fornecedor.nome}</strong> ? {fornecedor.especialidade}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="nc-switch-row">
            <label className="nc-switch-label">
              <span className="nc-switch-text">
                <span className="nc-switch-title">Proposta an?nima</span>
                <span className="nc-switch-desc">Oculta a identidade dos participantes durante a disputa.</span>
              </span>
              <span className="nc-switch">
                <input
                  type="checkbox"
                  checked={estado.proposta_anonima}
                  onChange={(event) => {
                    aoAtualizar({ proposta_anonima: event.target.checked })
                    aoInteragir('proposta_anonima')
                  }}
                  aria-label="Ativar proposta an?nima"
                />
                <span className="nc-switch-slider" aria-hidden />
              </span>
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}
