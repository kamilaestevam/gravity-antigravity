import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import { useCidadesIBGE } from '../../hooks/useCidadesIBGE'
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
  tipo_empresa: string
  espacoPadrao?: string
}

const TIPOS_EMPRESA = [
  'Importador',
  'Exportador',
  'Importador e Exportador',
  'Despachante Aduaneiro',
  'Agente de Carga',
  'Trading',
  'Transportadora Rodoviária',
  'Seguradora Internacional',
  'Corretora de Câmbio',
]

const OPCOES_TIPOS_EMPRESA: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...TIPOS_EMPRESA.map(t => ({ valor: t, rotulo: t }))
]

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
  const [tipoEmpresa, setTipoEmpresa] = useState('')
  const [espacoPadrao, setEspacoPadrao] = useState('')

  const { cidades, carregando: carregandoCidades } = useCidadesIBGE(estado)

  // Simple dirty tracking
  const dirty = !!(nome || subdominio || cnpj || estado || cidade || segmento || tipoEmpresa)
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
      tipo_empresa: tipoEmpresa,
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
    setTipoEmpresa('')
    setEspacoPadrao('')
  }

  function handleFechar() {
    aoFechar()
    handleLimpar()
  }

  const abas: AbaFormulario[] = useMemo(() => [
    {
      id: 'geral',
      rotulo: t('admin.testes-gerais.org.aba_geral'),
      tooltipTitulo: t('admin.testes-gerais.org.aba_geral_tooltip'),
      tooltipDescricao: t('admin.testes-gerais.org.aba_geral_desc'),
      conteudo: (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="em-grid">
            <CampoGeralGlobal
              label={t('admin.testes-gerais.org.campo_nome_org')}
              obrigatorio
              tooltipTitulo={t('admin.testes-gerais.org.campo_nome_tooltip')}
              tooltipDescricao={t('admin.testes-gerais.org.campo_nome_desc')}
            >
              <div className="ws-input-icon-wrap">
                <Buildings size={16} />
                <input
                  value={nome}
                  placeholder={t('admin.testes-gerais.org.campo_nome_placeholder')}
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
            </CampoGeralGlobal>

            <CampoGeralGlobal
              label={t('admin.visao-geral.campo_cnpj')}
              tooltipTitulo={t('admin.testes-gerais.org.campo_cnpj_tooltip')}
              tooltipDescricao={t('admin.testes-gerais.org.campo_cnpj_desc')}
            >
              <div className="ws-input-icon-wrap">
                <IdentificationCard size={16} />
                <input
                  value={cnpj}
                  placeholder={t('admin.testes-gerais.org.campo_cnpj_placeholder')}
                  onChange={e => setCnpj(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </CampoGeralGlobal>
          </div>

          <CampoGeralGlobal
            label={t('admin.testes-gerais.org.campo_subdominio_dns')}
            obrigatorio
            tooltipTitulo={t('admin.testes-gerais.org.campo_subdominio_tooltip')}
            tooltipDescricao={t('admin.testes-gerais.org.campo_subdominio_desc')}
          >
            <div className="ws-input-icon-wrap">
              <Globe size={16} />
              <input
                value={subdominio}
                placeholder={t('admin.testes-gerais.org.campo_subdominio_placeholder_novo')}
                onChange={e => setSubdominio(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))}
                style={{ width: '100%' }}
              />
              <span style={{ position: 'absolute', right: '1rem', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>.gravity.com.br</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', marginTop: '0.5rem' }}>
              {t('admin.testes-gerais.org.subdominio_hint')}
            </p>
          </CampoGeralGlobal>
        </div>
      )
    },
    {
      id: 'localizacao',
      rotulo: t('admin.testes-gerais.org.aba_localizacao'),
      tooltipTitulo: t('admin.testes-gerais.org.aba_localizacao_tooltip'),
      tooltipDescricao: t('admin.testes-gerais.org.aba_localizacao_desc'),
      conteudo: (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="em-grid em-grid--2">
            <CampoGeralGlobal label={t('admin.visao-geral.campo_estado')}>
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={OPCOES_ESTADOS}
                valor={estado}
                aoMudarValor={v => {
                  setEstado(String(v ?? ''))
                  setCidade('')
                }}
                placeholder={t('admin.testes-gerais.org.campo_selecione_placeholder')}
                buscavel
              />
            </CampoGeralGlobal>

            <CampoGeralGlobal label={t('admin.visao-geral.campo_cidade')}>
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={cidades}
                valor={cidade || null}
                aoMudarValor={v => setCidade(String(v ?? ''))}
                placeholder={estado ? t('admin.testes-gerais.org.cidade_placeholder_com_estado') : t('admin.testes-gerais.org.cidade_placeholder_sem_estado')}
                buscavel
                desabilitado={!estado}
                carregando={carregandoCidades}
              />
            </CampoGeralGlobal>
          </div>

          <div className="em-grid em-grid--2">
            <CampoGeralGlobal label={t('admin.visao-geral.campo_segmento')}>
              <SelectGlobal
                iconeEsquerda={<Archive size={16} />}
                opcoes={OPCOES_SEGMENTOS}
                valor={segmento}
                aoMudarValor={v => setSegmento(String(v ?? ''))}
                placeholder={t('admin.testes-gerais.org.campo_selecione_placeholder')}
                buscavel
              />
            </CampoGeralGlobal>

            <CampoGeralGlobal label={t('admin.visao-geral.campo_tipo_empresa')}>
              <SelectGlobal
                iconeEsquerda={<Buildings size={16} />}
                opcoes={OPCOES_TIPOS_EMPRESA}
                valor={tipoEmpresa}
                aoMudarValor={v => setTipoEmpresa(String(v ?? ''))}
                placeholder={t('admin.testes-gerais.org.campo_selecione_placeholder')}
              />
            </CampoGeralGlobal>
          </div>
        </div>
      )
    },
    {
      id: 'plano',
      rotulo: t('admin.testes-gerais.org.aba_plano'),
      tooltipTitulo: t('admin.testes-gerais.org.aba_plano_tooltip'),
      tooltipDescricao: t('admin.testes-gerais.org.aba_plano_desc'),
      conteudo: (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CampoGeralGlobal label={t('admin.testes-gerais.org.campo_plano_inicial')}>
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
          </CampoGeralGlobal>

          <CampoGeralGlobal
            label={t('admin.testes-gerais.org.campo_acesso_padrao')}
            tooltipTitulo={t('admin.testes-gerais.org.acesso_padrao_tooltip')}
            tooltipDescricao={t('admin.testes-gerais.org.acesso_padrao_desc')}
          >
            <SelectGlobal
              iconeEsquerda={<CheckCircle size={16} />}
              opcoes={[]} // Inicialmente vazio para nova organização
              valor={espacoPadrao || null}
              aoMudarValor={v => setEspacoPadrao(String(v ?? ''))}
              placeholder={t('admin.testes-gerais.org.campo_acesso_placeholder')}
              desabilitado
            />
          </CampoGeralGlobal>

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
              <p style={{ color: '#bae6fd', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('admin.testes-gerais.org.resumo_provisao_titulo')}</p>
              <p style={{ color: 'var(--ws-muted)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                {t('admin.testes-gerais.org.resumo_provisao_desc', { plano })}
              </p>
            </div>
          </div>
        </div>
      )
    }
  ], [nome, subdominio, plano, cnpj, estado, cidade, segmento, tipoEmpresa, espacoPadrao, cidades, carregandoCidades])

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={handleFechar}
      aoSalvar={handleSalvar}
      icone={<Buildings size={24} weight="duotone" />}
      titulo={t('admin.testes-gerais.org.novo_titulo')}
      subtitulo={t('admin.testes-gerais.org.novo_subtitulo')}
      tamanho="lg"
      altura="600px"
      dirty={dirty}
      podesSalvar={podesSalvar}
      textoSalvar={t('admin.testes-gerais.org.novo_btn_criar')}
      abas={abas}
      tipoAbas="pill"
    />
  )
}
