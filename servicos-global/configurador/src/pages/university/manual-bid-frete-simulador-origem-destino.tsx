import React, { useMemo, useState } from 'react'
import {
  Anchor,
  Buildings,
  FileText,
  GlobeHemisphereWest,
  ListPlus,
  MapPin,
  Package,
  Plus,
  Trash,
  Truck,
  Users,
} from '@phosphor-icons/react'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import {
  NC_ESTILOS_SIMULADOR_MODAL_OPERACAO,
  NC_ESTILOS_SIMULADOR_ORIGEM_DESTINO,
} from './manual-bid-frete-estilos-nc-simulador'
import { ICONE_FIELD, SimuladorNcField } from './manual-bid-frete-simulador-nc-ui'
import { ManualBidFreteSimuladorWizardEmbutido } from './manual-bid-frete-simulador-wizard-embutido'
import { MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'
import {
  ManualBidFreteGuiaAoVivo,
  type CampoGuiaAoVivo,
  type SelecaoGuiaAoVivo,
} from './manual-bid-frete-guia-ao-vivo'

export type LadoLocal = 'origem' | 'destino'

export type CampoOrigemDestinoId =
  | 'porto_origem'
  | 'portos_proximos_origem'
  | 'coleta_origem'
  | 'porto_destino'
  | 'portos_proximos_destino'
  | 'entrega_destino'

export type EstadoLadoOrigemDestino = {
  porto: string | null
  proximosHabilitado: boolean
  proximos: string[]
  extrasHabilitado: boolean
  pais: string | null
  estadoProvincia: string | null
  estadoProvinciaTexto: string
  endereco: string
}

export type EstadoOrigemDestino = Record<LadoLocal, EstadoLadoOrigemDestino>

export const ESTADO_LADO_ORIGEM_DESTINO_INICIAL: EstadoLadoOrigemDestino = {
  porto: null,
  proximosHabilitado: false,
  proximos: [''],
  extrasHabilitado: false,
  pais: null,
  estadoProvincia: null,
  estadoProvinciaTexto: '',
  endereco: '',
}

type EstadoLado = EstadoLadoOrigemDestino
type EstadoSimulador = EstadoOrigemDestino
const ESTADO_LADO_INICIAL = ESTADO_LADO_ORIGEM_DESTINO_INICIAL

const PASSOS_WIZARD = [
  { id: 1, label: 'Modal e Operação', icone: <Truck weight="duotone" size={16} /> },
  { id: 2, label: 'Origem e Destino', icone: <MapPin weight="duotone" size={16} /> },
  { id: 3, label: 'Carga e Incoterm', icone: <Package weight="duotone" size={16} /> },
  { id: 4, label: 'Visibilidade', icone: <Users weight="duotone" size={16} /> },
  { id: 5, label: 'Resumo', icone: <FileText weight="duotone" size={16} /> },
] as const

/** Amostra estática do catálogo real (16.950 portos) — só para o manual. */
const PORTOS_CATALOGO: SelectOpcao[] = [
  { valor: 'BRSSZ', rotulo: 'Santos (BRSSZ) — Brasil' },
  { valor: 'BRPNG', rotulo: 'Paranaguá (BRPNG) — Brasil' },
  { valor: 'BRITJ', rotulo: 'Itajaí (BRITJ) — Brasil' },
  { valor: 'BRRIG', rotulo: 'Rio Grande (BRRIG) — Brasil' },
  { valor: 'BRSUA', rotulo: 'Suape (BRSUA) — Brasil' },
  { valor: 'CNSHA', rotulo: 'Xangai (CNSHA) — China' },
  { valor: 'CNNGB', rotulo: 'Ningbo (CNNGB) — China' },
  { valor: 'CNSZX', rotulo: 'Shenzhen (CNSZX) — China' },
  { valor: 'SGSIN', rotulo: 'Singapura (SGSIN) — Singapura' },
  { valor: 'KRPUS', rotulo: 'Busan (KRPUS) — Coreia do Sul' },
  { valor: 'NLRTM', rotulo: 'Roterdã (NLRTM) — Países Baixos' },
  { valor: 'DEHAM', rotulo: 'Hamburgo (DEHAM) — Alemanha' },
  { valor: 'USNYC', rotulo: 'Nova York (USNYC) — Estados Unidos' },
  { valor: 'USLAX', rotulo: 'Los Angeles (USLAX) — Estados Unidos' },
]

const PAISES_CATALOGO: SelectOpcao[] = [
  { valor: 'BR', rotulo: 'Brasil' },
  { valor: 'CN', rotulo: 'China' },
  { valor: 'US', rotulo: 'Estados Unidos' },
  { valor: 'DE', rotulo: 'Alemanha' },
  { valor: 'NL', rotulo: 'Países Baixos' },
  { valor: 'AR', rotulo: 'Argentina' },
]

const UFS_BR: SelectOpcao[] = [
  { valor: 'SP', rotulo: 'SP' },
  { valor: 'PR', rotulo: 'PR' },
  { valor: 'SC', rotulo: 'SC' },
  { valor: 'RS', rotulo: 'RS' },
  { valor: 'PE', rotulo: 'PE' },
  { valor: 'RJ', rotulo: 'RJ' },
]

function rotuloPortoCurto(codigo: string | null): string | null {
  if (!codigo) return null
  const opcao = PORTOS_CATALOGO.find((p) => String(p.valor) === codigo)
  if (!opcao) return null
  return String(opcao.rotulo).split(' — ')[0]
}

export const CAMPOS_ORIGEM_DESTINO_BID_FRETE: CampoGuiaAoVivo<CampoOrigemDestinoId>[] = [
  {
    id: 'porto_origem',
    num: '01',
    rotulo: 'Porto de embarque',
    paragrafoGuia:
      'Porto **preferencial** de saída da carga. Busque pelo **nome do porto** ou pelo **país** no catálogo. Nesta mesma tela você também pode autorizar **portos próximos** e informar **dados do exportador** (país, estado/província e endereço) para cotações de **coleta na origem**.',
    descricaoPontos: [
      'Porto preferencial de embarque',
      'Pode autorizar portos próximos à origem',
      'Pode exibir dados do exportador para coleta (país, estado/província, endereço)',
    ],
    obrigatorio: true,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Opção de **portos próximos** à origem preferencial',
      'Campos de **coleta na origem** com dados do exportador',
      'Rotas e propostas dos fornecedores no passo **Visibilidade** e no **Resumo**',
    ],
    icone: Anchor,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.08)',
  },
  {
    id: 'portos_proximos_origem',
    num: '02',
    rotulo: 'Portos próximos (origem)',
    paragrafoGuia:
      'Autoriza cotações em **outros portos próximos** à origem preferencial. Amplia o leque de propostas dos fornecedores sem trocar o porto principal.',
    descricaoPontos: [
      'Opcional: marque para habilitar',
      'Adicione um ou mais portos alternativos',
      'Fornecedores podem cotar também por esses portos',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Linhas de **portos alternativos** na origem',
      'Mais opções de preço e prazo nas propostas',
    ],
    icone: ListPlus,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.32)',
    fundo: 'rgba(45,212,191,.08)',
  },
  {
    id: 'coleta_origem',
    num: '03',
    rotulo: 'Coleta na origem',
    paragrafoGuia:
      'Exibe **País**, **Estado/Província** e **Endereço** de origem (dados do exportador). Use para cotar a **coleta na origem** (exemplo **EXW**).',
    descricaoPontos: [
      'Dados do exportador: país, estado/província e endereço',
      'Útil para coleta na origem (exemplo EXW)',
      'Opcional neste passo',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Cotação de **coleta** no endereço do exportador',
      'Exibição desses locais no **Resumo** da cotação',
    ],
    icone: MapPin,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    id: 'porto_destino',
    num: '04',
    rotulo: 'Porto de destino',
    paragrafoGuia:
      'Porto **preferencial** de chegada da carga. Mesma lógica de busca do porto de embarque. Você também pode autorizar **portos próximos** e informar **dados do importador** para cotações de **entrega no destino**.',
    descricaoPontos: [
      'Porto preferencial de destino',
      'Pode autorizar portos próximos ao destino',
      'Pode exibir dados do importador para entrega (país, estado/província, endereço)',
    ],
    obrigatorio: true,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Opção de **portos próximos** ao destino preferencial',
      'Campos de **entrega no destino** com dados do importador',
      'Rotas e propostas dos fornecedores no passo **Visibilidade** e no **Resumo**',
    ],
    icone: Anchor,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    id: 'portos_proximos_destino',
    num: '05',
    rotulo: 'Portos próximos (destino)',
    paragrafoGuia:
      'Autoriza cotações em **outros portos próximos** ao destino preferencial. Amplia o leque de propostas dos fornecedores sem trocar o porto principal.',
    descricaoPontos: [
      'Opcional: marque para habilitar',
      'Adicione um ou mais portos alternativos',
      'Fornecedores podem cotar também por esses portos',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Linhas de **portos alternativos** no destino',
      'Mais opções de preço e prazo nas propostas',
    ],
    icone: ListPlus,
    cor: '#c4b5fd',
    borda: 'rgba(196,181,253,.28)',
    fundo: 'rgba(167,139,250,.08)',
  },
  {
    id: 'entrega_destino',
    num: '06',
    rotulo: 'Entrega no destino',
    paragrafoGuia:
      'Exibe **País**, **Estado/Província** e **Endereço** de destino (dados do importador). Use para cotar a **entrega no destino** (porta a porta).',
    descricaoPontos: [
      'Dados do importador: país, estado/província e endereço',
      'Útil para entrega porta a porta',
      'Opcional neste passo',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Cotação de **entrega** no endereço do importador',
      'Exibição desses locais no **Resumo** da cotação',
    ],
    icone: Buildings,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
]

const ORDEM_CAMPOS_GUIA: CampoOrigemDestinoId[] = [
  'porto_origem',
  'portos_proximos_origem',
  'coleta_origem',
  'porto_destino',
  'portos_proximos_destino',
  'entrega_destino',
]

function resolverRotuloSelecao(
  estado: EstadoSimulador,
  id: CampoOrigemDestinoId,
): string | null {
  const lado: LadoLocal = id.endsWith('destino') ? 'destino' : 'origem'
  const dados = estado[lado]
  switch (id) {
    case 'porto_origem':
    case 'porto_destino':
      return rotuloPortoCurto(dados.porto)
    case 'portos_proximos_origem':
    case 'portos_proximos_destino': {
      if (!dados.proximosHabilitado) return null
      const escolhidos = dados.proximos.filter((c) => c !== '')
      if (escolhidos.length === 0) return 'Habilitado: escolha os portos'
      const primeiro = rotuloPortoCurto(escolhidos[0])
      return escolhidos.length === 1
        ? `${primeiro}`
        : `${primeiro} +${escolhidos.length - 1}`
    }
    case 'coleta_origem':
    case 'entrega_destino': {
      if (!dados.extrasHabilitado) return null
      const pais = PAISES_CATALOGO.find((p) => String(p.valor) === dados.pais)?.rotulo
      if (!pais) return 'Campos exibidos'
      const uf = dados.pais === 'BR' ? dados.estadoProvincia : dados.estadoProvinciaTexto
      return uf ? `${pais} · ${uf}` : String(pais)
    }
    default:
      return null
  }
}

function resolverExplicacao(
  estado: EstadoSimulador,
  foco: CampoOrigemDestinoId | null,
): string {
  if (!foco) return ''
  const lado: LadoLocal = foco.endsWith('destino') ? 'destino' : 'origem'
  const dados = estado[lado]
  switch (foco) {
    case 'porto_origem': {
      const rotulo = rotuloPortoCurto(dados.porto)
      return rotulo
        ? `Você selecionou **${rotulo}** como porto de **embarque preferencial**. Os fornecedores cotarão a saída da carga por este porto. Nesta tela você ainda pode autorizar **portos próximos** e informar **dados do exportador** (país, estado/província e endereço) para cotações de coleta.`
        : ''
    }
    case 'porto_destino': {
      const rotulo = rotuloPortoCurto(dados.porto)
      return rotulo
        ? `Você selecionou **${rotulo}** como porto de **destino preferencial**. Os fornecedores cotarão a chegada da carga por este porto. Nesta tela você ainda pode autorizar **portos próximos** e informar **dados do importador** (país, estado/província e endereço) para cotações de entrega.`
        : ''
    }
    case 'portos_proximos_origem':
    case 'portos_proximos_destino': {
      const escolhidos = dados.proximos.filter((c) => c !== '')
      const ladoTexto = lado === 'origem' ? 'à origem' : 'ao destino'
      if (escolhidos.length === 0) {
        return `Opção habilitada: adicione os **portos próximos ${ladoTexto}** que você **aceita na proposta**, além do porto de preferência. Use **Adicionar porto** para incluir mais linhas.`
      }
      const nomes = escolhidos
        .map((c) => rotuloPortoCurto(c))
        .filter(Boolean)
        .map((n) => `**${n}**`)
        .join(', ')
      return `Você autorizou cotações também em ${nomes}. Fornecedores podem propor rotas por ${escolhidos.length === 1 ? 'este porto' : 'estes portos'}, ampliando as opções de preço e prazo.`
    }
    case 'coleta_origem':
      return 'Campos de **coleta na origem** exibidos: preencha **País**, **Estado/Província** e **Endereço** (dados do exportador) para cotar a coleta (exemplo **EXW**). Desmarque se não precisar.'
    case 'entrega_destino':
      return 'Campos de **entrega no destino** exibidos: preencha **País**, **Estado/Província** e **Endereço** (dados do importador) para cotar a entrega porta a porta. Desmarque se não precisar.'
    default:
      return ''
  }
}

function CartaoLocalSimulador({
  lado,
  dados,
  aoAtualizar,
  aoInteragir,
  aoDesligarCampo,
}: {
  lado: LadoLocal
  dados: EstadoLado
  aoAtualizar: (parcial: Partial<EstadoLado>) => void
  aoInteragir: (campo: CampoOrigemDestinoId) => void
  aoDesligarCampo: (campo: CampoOrigemDestinoId) => void
}) {
  const origem = lado === 'origem'
  const idPorto: CampoOrigemDestinoId = origem ? 'porto_origem' : 'porto_destino'
  const idProximos: CampoOrigemDestinoId = origem ? 'portos_proximos_origem' : 'portos_proximos_destino'
  const idExtras: CampoOrigemDestinoId = origem ? 'coleta_origem' : 'entrega_destino'
  const preenchido = Boolean(dados.porto)

  const opcoesAlternativas = useMemo(
    () => PORTOS_CATALOGO.filter((p) => String(p.valor) !== dados.porto),
    [dados.porto],
  )

  const persistirLinhas = (linhas: string[]) => {
    aoAtualizar({ proximos: linhas.length > 0 ? linhas : [''] })
  }

  return (
    <div
      className={`nc-location-visual-card nc-location-visual-card--${origem ? 'origin' : 'destination'}${preenchido ? ' nc-location-visual-card--selected' : ''}`}
    >
      <div className="nc-location-visual-header">
        <div className="nc-location-visual-circle">
          <MapPin weight="duotone" size={26} className={origem ? 'nc-pulsing-icon' : 'nc-pulsing-icon-dest'} />
        </div>
        <div className="nc-location-visual-text">
          <h4>{origem ? 'Porto / Aeroporto de Origem' : 'Porto / Aeroporto de Destino'}</h4>
          <p className="nc-caption">
            {origem
              ? 'Selecione o porto de embarque de preferência'
              : 'Selecione o porto de destino de preferência'}
          </p>
        </div>
      </div>

      <div className="nc-location-body">
        <SimuladorNcField
          label={origem ? 'Porto de embarque' : 'Porto de destino'}
          obrigatorio
          icone={<Anchor {...ICONE_FIELD} />}
        >
          <SelectGlobal
            iconeEsquerda={<Anchor size={16} />}
            opcoes={PORTOS_CATALOGO}
            valor={dados.porto}
            aoMudarValor={(v) => {
              const codigo = v ? String(v) : null
              aoAtualizar({
                porto: codigo,
                proximos: dados.proximos.filter((c) => c !== codigo),
              })
              if (codigo) aoInteragir(idPorto)
            }}
            placeholder="Selecione o porto..."
            buscavel
            posicao="auto"
          />
        </SimuladorNcField>

        <div className="nc-exibir-campos-linha">
          <label className="nc-exibir-campos-checkbox">
            <input
              type="checkbox"
              className="nc-checkbox-padrao"
              checked={dados.proximosHabilitado}
              onChange={(e) => {
                const marcado = e.target.checked
                aoAtualizar({ proximosHabilitado: marcado, proximos: [''] })
                if (marcado) {
                  aoInteragir(idProximos)
                } else {
                  aoDesligarCampo(idProximos)
                }
              }}
            />
            <span>
              {origem
                ? 'Autorizar cotações em outros portos próximos à origem preferencial'
                : 'Autorizar cotações em outros portos próximos ao destino preferencial'}
            </span>
          </label>
        </div>

        {dados.proximosHabilitado ? (
          <div className="nc-locais-adicionais-bloco">
            <div className="nc-linhas-container-header">
              <p className="nc-cargo-subsecao-hint">
                Selecione portos próximos que você aceita na proposta, além do porto de preferência acima.
              </p>
              <button
                type="button"
                className="nc-btn-adicionar-linha"
                onClick={() => {
                  aoAtualizar({ proximos: [...dados.proximos, ''] })
                  aoInteragir(idProximos)
                }}
              >
                <Plus size={12} weight="bold" />
                Adicionar porto
              </button>
            </div>
            {dados.proximos.map((codigo, indice) => (
              <div key={`${lado}-local-${indice}`} className="nc-linha-armazem-row">
                <SimuladorNcField
                  label="Locais adicionais aceitos"
                  obrigatorio
                  icone={<Anchor {...ICONE_FIELD} />}
                >
                  <SelectGlobal
                    iconeEsquerda={<Anchor size={16} />}
                    opcoes={opcoesAlternativas.filter(
                      (o) => String(o.valor) === codigo || !dados.proximos.includes(String(o.valor)),
                    )}
                    valor={codigo || null}
                    aoMudarValor={(v) => {
                      const novo = String(v ?? '')
                      persistirLinhas(dados.proximos.map((c, i) => (i === indice ? novo : c)))
                      aoInteragir(idProximos)
                    }}
                    placeholder="Selecione o porto..."
                    buscavel
                    posicao="auto"
                  />
                </SimuladorNcField>
                <button
                  type="button"
                  className="nc-btn-remover-linha"
                  title="Remover local"
                  aria-label="Remover local"
                  disabled={dados.proximos.length <= 1 && !codigo}
                  onClick={() => {
                    persistirLinhas(dados.proximos.filter((_, i) => i !== indice))
                    aoInteragir(idProximos)
                  }}
                >
                  <Trash size={14} weight="bold" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="nc-exibir-campos-linha">
          <label className="nc-exibir-campos-checkbox">
            <input
              type="checkbox"
              className="nc-checkbox-padrao"
              checked={dados.extrasHabilitado}
              onChange={(e) => {
                const marcado = e.target.checked
                aoAtualizar({ extrasHabilitado: marcado })
                if (marcado) {
                  aoInteragir(idExtras)
                } else {
                  aoDesligarCampo(idExtras)
                }
              }}
            />
            <span>
              {origem
                ? 'Exibir campos: cidade, estado/província e país de origem para cotações de coleta na origem'
                : 'Exibir campos: cidade, estado/província e país de destino para cotações de coleta'}
            </span>
          </label>
        </div>

        {dados.extrasHabilitado ? (
          <div className="nc-fields-grid--location-extras">
            <SimuladorNcField
              label={origem ? 'País de origem' : 'País de destino'}
              icone={<GlobeHemisphereWest {...ICONE_FIELD} />}
            >
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={PAISES_CATALOGO}
                valor={dados.pais}
                aoMudarValor={(v) => {
                  aoAtualizar({
                    pais: v ? String(v) : null,
                    estadoProvincia: null,
                    estadoProvinciaTexto: '',
                  })
                  aoInteragir(idExtras)
                }}
                placeholder="Selecione o país..."
                buscavel
                posicao="auto"
              />
            </SimuladorNcField>
            <SimuladorNcField
              label={origem ? 'Estado ou província de origem' : 'Estado ou província de destino'}
              obrigatorio={dados.pais === 'BR'}
              icone={<MapPin {...ICONE_FIELD} />}
            >
              {dados.pais === 'BR' ? (
                <SelectGlobal
                  opcoes={UFS_BR}
                  valor={dados.estadoProvincia}
                  aoMudarValor={(v) => {
                    aoAtualizar({ estadoProvincia: v ? String(v) : null })
                    aoInteragir(idExtras)
                  }}
                  placeholder="Selecione o UF"
                  buscavel
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  placeholder={origem ? 'Ex: California' : 'Ex: São Paulo'}
                  value={dados.estadoProvinciaTexto}
                  disabled={!dados.pais}
                  onChange={(e) => {
                    aoAtualizar({ estadoProvinciaTexto: e.target.value })
                    aoInteragir(idExtras)
                  }}
                />
              )}
            </SimuladorNcField>
            <SimuladorNcField
              label={origem ? 'Endereço de origem' : 'Endereço de destino'}
              className="nc-field--span-2"
              icone={<MapPin {...ICONE_FIELD} />}
            >
              <input
                className="nc-input"
                placeholder="Complemento de endereço (opcional)"
                value={dados.endereco}
                onChange={(e) => {
                  aoAtualizar({ endereco: e.target.value })
                  aoInteragir(idExtras)
                }}
              />
            </SimuladorNcField>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function portosProximosValidos(dados: EstadoLado): boolean {
  if (!dados.proximosHabilitado) return true
  return dados.proximos.some((codigo) => codigo !== '')
}

/** Paridade com canNext() — passo «origem» (exemplo Marítimo). */
export function podeAvancarPassoOrigemDestino(estado: EstadoOrigemDestino): boolean {
  const origemOk = !!estado.origem.porto
  const destinoOk = !!estado.destino.porto
  return origemOk
    && destinoOk
    && portosProximosValidos(estado.origem)
    && portosProximosValidos(estado.destino)
}

export function resolverSelecoesOrigemDestino(
  estado: EstadoOrigemDestino,
  interagiu: Partial<Record<CampoOrigemDestinoId, boolean>>,
): SelecaoGuiaAoVivo<CampoOrigemDestinoId>[] {
  return ORDEM_CAMPOS_GUIA.flatMap((id) => {
    if (!interagiu[id]) return []
    const valor = resolverRotuloSelecao(estado, id)
    if (!valor) return []
    return [{ id, valor }]
  })
}

export function resolverExplicacaoOrigemDestino(
  estado: EstadoOrigemDestino,
  foco: CampoOrigemDestinoId | null,
): string {
  return resolverExplicacao(estado, foco)
}

/** Conteúdo do passo 2 — embutido no wizard unificado do manual. */
export function ConteudoPassoOrigemDestinoSimulador({
  estado,
  aoAtualizarLado,
  aoInteragir,
  aoDesligarCampo,
}: {
  estado: EstadoOrigemDestino
  aoAtualizarLado: (lado: LadoLocal, parcial: Partial<EstadoLadoOrigemDestino>) => void
  aoInteragir: (campo: CampoOrigemDestinoId) => void
  aoDesligarCampo: (campo: CampoOrigemDestinoId) => void
}) {
  return (
    <div className="nc-root nc-step-wrapper nc-fade-in">
      <div className="nc-step-content nc-origem-destino-stack">
        <CartaoLocalSimulador
          lado="origem"
          dados={estado.origem}
          aoAtualizar={(parcial) => aoAtualizarLado('origem', parcial)}
          aoInteragir={aoInteragir}
          aoDesligarCampo={aoDesligarCampo}
        />
        <CartaoLocalSimulador
          lado="destino"
          dados={estado.destino}
          aoAtualizar={(parcial) => aoAtualizarLado('destino', parcial)}
          aoInteragir={aoInteragir}
          aoDesligarCampo={aoDesligarCampo}
        />
      </div>
    </div>
  )
}

/** Manual BID Frete §4.02.01 — réplica standalone (legado; preferir wizard unificado). */
export function ManualBidFreteSimuladorOrigemDestino() {
  const [estado, setEstado] = useState<EstadoSimulador>(() => ({
    origem: { ...ESTADO_LADO_INICIAL },
    destino: { ...ESTADO_LADO_INICIAL },
  }))
  const [foco, setFoco] = useState<CampoOrigemDestinoId | null>(null)
  const [interagiu, setInteragiu] = useState<Partial<Record<CampoOrigemDestinoId, boolean>>>({})

  const marcarInteracao = (campo: CampoOrigemDestinoId) => {
    setInteragiu((prev) => ({ ...prev, [campo]: true }))
    setFoco(campo)
  }

  const atualizarLado = (lado: LadoLocal, parcial: Partial<EstadoLado>) => {
    setEstado((prev) => ({ ...prev, [lado]: { ...prev[lado], ...parcial } }))
  }

  const selecoesPreenchidas = useMemo(
    () => resolverSelecoesOrigemDestino(estado, interagiu),
    [estado, interagiu],
  )

  const campoGuiaAtivo = useMemo((): CampoOrigemDestinoId | null => {
    if (!foco) return null
    if (!selecoesPreenchidas.some((s) => s.id === foco)) return null
    return foco
  }, [foco, selecoesPreenchidas])

  const explicacao = useMemo(
    () => resolverExplicacaoOrigemDestino(estado, campoGuiaAtivo),
    [estado, campoGuiaAtivo],
  )

  return (
    <div id="sim-bid-frete-origem-destino" style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
      <p style={{
        margin: '0 0 10px',
        fontSize: '.75rem',
        lineHeight: 1.45,
        color: 'color-mix(in srgb, var(--ws-text, #f1f5f9) 65%, transparent)',
        fontStyle: 'italic',
      }}>
        Tela interativa: cada escolha permanece visível no painel guia à direita (exemplo com modal Marítimo)
      </p>
      <style>{NC_ESTILOS_SIMULADOR_MODAL_OPERACAO}</style>
      <style>{NC_ESTILOS_SIMULADOR_ORIGEM_DESTINO}</style>
      <div className="sim-modal-operacao-layout">
        <div>
          <ManualBidFreteSimuladorWizardEmbutido
            titulo="Nova Cotação de Frete Internacional"
            subtitulo="Preencha os dados para solicitar cotações de frete"
            icone={<Truck weight="duotone" size={22} />}
            passos={[...PASSOS_WIZARD]}
            passoAtual={2}
            larguraTotal
            podeAvancar={false}
            podeVoltar
          >
            <ConteudoPassoOrigemDestinoSimulador
              estado={estado}
              aoAtualizarLado={atualizarLado}
              aoInteragir={marcarInteracao}
              aoDesligarCampo={(campo) => setFoco((prev) => (prev === campo ? null : prev))}
            />
          </ManualBidFreteSimuladorWizardEmbutido>
        </div>

        <ManualBidFreteGuiaAoVivo
          campos={CAMPOS_ORIGEM_DESTINO_BID_FRETE}
          selecoes={selecoesPreenchidas}
          campoAtivo={campoGuiaAtivo}
          textoContextual={explicacao}
          onSelecionarCampo={(id) => setFoco((prev) => (prev === id ? null : id))}
        />
      </div>
    </div>
  )
}
