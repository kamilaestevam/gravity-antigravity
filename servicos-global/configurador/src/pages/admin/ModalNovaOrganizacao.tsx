import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import {
  BannerRequisitosGlobal,
  BannerRequisitosProvider,
  type RequisitoSalvar,
} from '@nucleo/banner-requisitos-global'
import { useCidadesIBGE } from '../../hooks/useCidadesIBGE'
import { useSugerirSubdominio } from '../../hooks/useSugerirSubdominio'
import {
  Buildings,
  IdentificationCard,
  MapPin,
  Globe,
  Archive,
  Warning
} from '@phosphor-icons/react'

export interface DadosNovaOrg {
  nome: string
  subdominio: string
  cnpj: string
  estado: string
  cidade: string
  segmento: string
  tipo_empresa: string
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
  const [cnpj, setCnpj] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [segmento, setSegmento] = useState('')
  const [tipoEmpresa, setTipoEmpresa] = useState('')

  const { cidades, carregando: carregandoCidades } = useCidadesIBGE(estado)

  // Sistema gera o subdomínio (cross-tabela único, auto-suffix). Usuário não escolhe.
  const sug = useSugerirSubdominio(nome)
  const subdominioSugerido = sug.sugestao

  // Simple dirty tracking
  const dirty = !!(nome || cnpj || estado || cidade || segmento || tipoEmpresa)

  const requisitos: RequisitoSalvar[] = [
    { chave: 'nome',       ok: !!nome.trim(),         mensagem: 'Nome da organização' },
    { chave: 'subdominio', ok: !!subdominioSugerido && !sug.carregando, mensagem: sug.carregando ? 'Aguardando sugestão de subdomínio…' : 'Subdomínio gerado pelo sistema' },
    { chave: 'sugErro',    ok: !sug.erro,             mensagem: sug.erro ?? 'Subdomínio válido' },
  ]
  const podesSalvar = requisitos.every(r => r.ok)

  function handleSalvar() {
    if (!podesSalvar) return
    aoSalvar({
      nome,
      subdominio: subdominioSugerido,
      cnpj,
      estado,
      cidade,
      segmento,
      tipo_empresa: tipoEmpresa,
    })
    handleLimpar()
  }

  function handleLimpar() {
    setNome('')
    setCnpj('')
    setEstado('')
    setCidade('')
    setSegmento('')
    setTipoEmpresa('')
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
        <BannerRequisitosProvider requisitos={requisitos}>
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
                  onChange={e => setNome(e.target.value)}
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
            tooltipTitulo="Subdomínio gerado pelo sistema"
            tooltipDescricao="A plataforma gera automaticamente um subdomínio único a partir do nome da organização. Se já existir, o sistema adiciona um sufixo numérico (-2, -3...)."
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 0.875rem',
              background: 'var(--ws-surface)',
              border: '1px solid var(--ws-accent-border)',
              borderRadius: '8px',
              height: '40px',
              fontSize: '0.8125rem',
              fontFamily: 'monospace',
            }}>
              <Globe size={16} style={{ marginRight: '0.5rem', color: 'var(--ws-muted)' }} />
              {sug.carregando ? (
                <span style={{ color: 'var(--ws-muted)', fontStyle: 'italic' }}>gerando…</span>
              ) : subdominioSugerido ? (
                <strong style={{ color: 'var(--ws-accent)' }}>
                  {subdominioSugerido}<span style={{ color: 'var(--ws-muted)', fontWeight: 400 }}>.usegravity.com.br</span>
                </strong>
              ) : (
                <span style={{ color: 'var(--ws-muted)', fontStyle: 'italic' }}>Digite o nome da organização para gerar o subdomínio</span>
              )}
            </div>
            {sug.erro && (
              <p style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.375rem' }}>
                <Warning size={12} weight="bold" />
                {sug.erro}
              </p>
            )}
            {sug.ajustado && !sug.erro && subdominioSugerido && (
              <p style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.375rem' }}>
                <Warning size={12} weight="bold" />
                Subdomínio <code>{sug.solicitado}</code> já estava em uso. Ajustamos para <code>{subdominioSugerido}</code>.
              </p>
            )}
          </CampoGeralGlobal>

          <BannerRequisitosGlobal />
        </div>
        </BannerRequisitosProvider>
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
  ], [nome, subdominioSugerido, sug.carregando, sug.ajustado, sug.solicitado, sug.erro, cnpj, estado, cidade, segmento, tipoEmpresa, cidades, carregandoCidades])

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
