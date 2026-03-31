import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import { 
  Buildings, 
  Link, 
  Ticket, 
  IdentificationCard, 
  MapPin, 
  Package, 
  Globe,
  CheckCircle,
  Archive
} from '@phosphor-icons/react'

export interface DadosNovaOrg {
  nome: string
  subdominio: string
  plano: string
  cnpj: string
  estado: string
  cidade: string
  segmento: string
  site: string
  espacoPadrao?: string
}

interface ModalNovaOrganizacaoProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: (dados: DadosNovaOrg) => void
}

const PLANOS = ['Startup', 'Pro', 'Enterprise', 'Trial']

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

const OPCOES_ESTADOS: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...ESTADOS_BR.map(uf => ({ valor: uf, rotulo: uf }))
]

const SEGMENTOS = [
  'Agronegócio', 'Alimentos e Bebidas', 'Armazenagem', 'Automotivo',
  'Calçados', 'Cosméticos', 'Despacho Aduaneiro', 'Eletrodomésticos',
  'Eletrônicos', 'Embalagens', 'Energia e Gás', 'Farmacêutico',
  'Ferramentas', 'Ferroviário', 'Financeiro', 'Higiene',
  'Hospitalar', 'Logística', 'Maquinário', 'Metalurgia',
  'Mineração', 'Papel', 'Químico', 'Seguro',
  'Têxtil', 'Trading', 'Transporte',
]

const OPCOES_SEGMENTOS: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...SEGMENTOS.map(s => ({ valor: s, rotulo: s }))
]

export function ModalNovaOrganizacao({ aberto, aoFechar, aoSalvar }: ModalNovaOrganizacaoProps) {
  const { t } = useTranslation()
  const [nome, setNome] = useState('')
  const [subdominio, setSubdominio] = useState('')
  const [plano, setPlano] = useState(PLANOS[0])
  const [cnpj, setCnpj] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [segmento, setSegmento] = useState('')
  const [site, setSite] = useState('')
  const [espacoPadrao, setEspacoPadrao] = useState('')

  const [cidades, setCidades] = useState<SelectOpcao[]>([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)

  // ── Carregar Cidades do IBGE ─────────────────────────────────────────────
  useEffect(() => {
    if (!estado) {
      setCidades([])
      return
    }
    setCarregandoCidades(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`)
      .then(res => res.json())
      .then(data => {
        const opcoes = data.map((c: any) => ({
          valor: c.nome,
          rotulo: c.nome
        }))
        opcoes.sort((a: SelectOpcao, b: SelectOpcao) => a.rotulo.localeCompare(b.rotulo))
        setCidades(opcoes)
      })
      .catch(err => {
        console.error("Erro ao buscar cidades do IBGE:", err)
        setCidades([])
      })
      .finally(() => setCarregandoCidades(false))
  }, [estado])

  // Simple dirty tracking
  const dirty = !!(nome || subdominio || cnpj || estado || cidade || segmento || site)
  // Simple validation
  const podesSalvar = !!(nome.trim() && subdominio.trim())

  function handleSalvar() {
    aoSalvar({ 
      nome, 
      subdominio, 
      plano,
      cnpj,
      estado,
      cidade,
      segmento,
      site,
      espacoPadrao
    })
    handleLimpar()
  }

  function handleLimpar() {
    setNome('')
    setSubdominio('')
    setPlano(PLANOS[0])
    setCnpj('')
    setEstado('')
    setCidade('')
    setSegmento('')
    setSite('')
    setEspacoPadrao('')
  }

  function handleFechar() {
    aoFechar()
    handleLimpar()
  }

  const abas: AbaFormulario[] = useMemo(() => [
    {
      id: 'geral',
      rotulo: t('admin.tests.org.aba_dados_gerais'),
      tooltipTitulo: t('admin.tests.org.aba_dados_gerais_tooltip'),
      tooltipDescricao: t('admin.tests.org.aba_dados_gerais_desc'),
      conteudo: (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="em-grid">
            <GeralCampoGlobal
              label={t('admin.tests.org.campo_nome')}
              obrigatorio
              tooltipTitulo={t('admin.tests.org.campo_nome_tooltip')}
              tooltipDescricao={t('admin.tests.org.campo_nome_desc')}
            >
              <div className="ws-input-icon-wrap">
                <Buildings size={16} />
                <input
                  value={nome}
                  placeholder="Ex: Acme Corporation Ltda."
                  onChange={e => {
                    setNome(e.target.value)
                    const sugerido = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                    if (!subdominio || subdominio === sugerido.slice(0, -1)) {
                      setSubdominio(sugerido)
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>

            <GeralCampoGlobal
              label={t('admin.overview.campo_cnpj')}
              tooltipTitulo={t('admin.tests.org.campo_cnpj_tooltip')}
              tooltipDescricao={t('admin.tests.org.campo_cnpj_desc')}
            >
              <div className="ws-input-icon-wrap">
                <IdentificationCard size={16} />
                <input
                  value={cnpj}
                  placeholder="00.000.000/0001-00"
                  onChange={e => setCnpj(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>

          <GeralCampoGlobal
            label={t('admin.tests.org.campo_subdominio_dns')}
            obrigatorio
            tooltipTitulo={t('admin.tests.org.campo_subdominio_tooltip')}
            tooltipDescricao={t('admin.tests.org.campo_subdominio_desc')}
          >
            <div className="ws-input-icon-wrap">
              <Globe size={16} />
              <input
                value={subdominio}
                placeholder="acme"
                onChange={e => setSubdominio(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))}
                style={{ width: '100%' }}
              />
              <span style={{ position: 'absolute', right: '1rem', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>.gravity.com.br</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', marginTop: '0.5rem' }}>
              {t('admin.tests.org.subdominio_hint')}
            </p>
          </GeralCampoGlobal>
        </div>
      )
    },
    {
      id: 'localizacao',
      rotulo: t('admin.tests.org.aba_localizacao'),
      tooltipTitulo: t('admin.tests.org.aba_localizacao_tooltip'),
      tooltipDescricao: t('admin.tests.org.aba_localizacao_desc'),
      conteudo: (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="em-grid em-grid--2">
            <GeralCampoGlobal label={t('admin.overview.campo_estado')}>
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={OPCOES_ESTADOS}
                valor={estado}
                aoMudarValor={v => {
                  setEstado(String(v ?? ''))
                  setCidade('')
                }}
                placeholder="Selecione..."
                buscavel
              />
            </GeralCampoGlobal>

            <GeralCampoGlobal label={t('admin.overview.campo_cidade')}>
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={cidades}
                valor={cidade || null}
                aoMudarValor={v => setCidade(String(v ?? ''))}
                placeholder={estado ? "Selecione a cidade..." : "Selecione o estado..."}
                buscavel
                desabilitado={!estado}
                carregando={carregandoCidades}
              />
            </GeralCampoGlobal>
          </div>

          <div className="em-grid em-grid--2">
            <GeralCampoGlobal label={t('admin.overview.campo_segmento')}>
              <SelectGlobal
                iconeEsquerda={<Archive size={16} />}
                opcoes={OPCOES_SEGMENTOS}
                valor={segmento}
                aoMudarValor={v => setSegmento(String(v ?? ''))}
                placeholder="Selecione..."
                buscavel
              />
            </GeralCampoGlobal>

            <GeralCampoGlobal label={t('admin.overview.campo_site')}>
              <div className="ws-input-icon-wrap">
                <Globe size={16} />
                <input
                  value={site}
                  placeholder="https://www.empresa.com.br"
                  onChange={e => setSite(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </GeralCampoGlobal>
          </div>
        </div>
      )
    },
    {
      id: 'plano',
      rotulo: t('admin.tests.org.aba_plano'),
      tooltipTitulo: t('admin.tests.org.aba_plano_tooltip'),
      tooltipDescricao: t('admin.tests.org.aba_plano_desc'),
      conteudo: (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GeralCampoGlobal label={t('admin.tests.org.plano_inicial')}>
            <div className="ws-input-icon-wrap" style={{ padding: 0 }}>
              <select
                value={plano}
                onChange={e => setPlano(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--ws-text)', padding: '0 1rem 0 2.5rem', appearance: 'none', height: '100%' }}
              >
                {PLANOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <Ticket size={16} style={{ position: 'absolute', left: '0.875rem', color: 'var(--ws-muted)' }} />
            </div>
          </GeralCampoGlobal>

          <GeralCampoGlobal
            label={t('admin.tests.org.acesso_padrao')}
            tooltipTitulo={t('admin.tests.org.acesso_padrao_tooltip')}
            tooltipDescricao={t('admin.tests.org.acesso_padrao_desc')}
          >
            <SelectGlobal
              iconeEsquerda={<CheckCircle size={16} />}
              opcoes={[]} // Inicialmente vazio para nova organização
              valor={espacoPadrao || null}
              aoMudarValor={v => setEspacoPadrao(String(v ?? ''))}
              placeholder="— Selecione após a criação —"
              desabilitado
            />
          </GeralCampoGlobal>

          <div style={{
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <Package size={20} weight="duotone" color="#38bdf8" style={{ marginTop: '2px' }} />
            <div>
              <p style={{ color: '#bae6fd', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('admin.tests.org.resumo_provisao')}</p>
              <p style={{ color: 'var(--ws-muted)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                {t('admin.tests.org.resumo_provisao_desc', { plano })}
              </p>
            </div>
          </div>
        </div>
      )
    }
  ], [nome, subdominio, plano, cnpj, estado, cidade, segmento, site, espacoPadrao, cidades, carregandoCidades])

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={handleFechar}
      aoSalvar={handleSalvar}
      icone={<Buildings size={24} weight="duotone" />}
      titulo={t('admin.tests.org.nova_titulo')}
      subtitulo={t('admin.tests.org.nova_subtitulo')}
      tamanho="lg"
      altura="600px"
      dirty={dirty}
      podesSalvar={podesSalvar}
      textoSalvar={t('admin.tests.org.criar_instancia')}
      abas={abas}
      tipoAbas="pill"
    />
  )
}
