import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Buildings,
  Globe,
  IdentificationCard,
  CalendarBlank,
  MapPin,
  Package
} from '@phosphor-icons/react'
import { ModalFormularioGlobal, SecaoFormulario } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { Organizacao } from '../../types/entidades'
import { useCidadesIBGE } from '../../hooks/useCidadesIBGE'

export interface DadosEditarOrg {
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

interface ModalEditarOrganizacaoProps {
  aberto: boolean
  organizacao: Organizacao | null
  aoFechar: () => void
  aoSalvar: (dados: Partial<DadosEditarOrg>) => void
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

function formatarCNPJ(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export function ModalEditarOrganizacao({ aberto, organizacao, aoFechar, aoSalvar }: ModalEditarOrganizacaoProps) {
  const { t } = useTranslation()
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [segmento, setSegmento] = useState('')
  const [tipoEmpresa, setTipoEmpresa] = useState('')

  // Subdomínio é gerado pelo sistema na criação e é IMUTÁVEL na edição
  // (URLs já em uso por usuários, integrações e webhooks dependem dele).
  const subdominio = organizacao?.subdominio_organizacao ?? ''

  const { cidades, carregando: carregandoCidades } = useCidadesIBGE(estado)

  // Preenche dados quando a modal abre
  useEffect(() => {
    if (aberto && organizacao) {
      setNome(organizacao.nome_organizacao || '')
      setCnpj('')
      setEstado('')
      setCidade('')
      setSegmento('')
      setTipoEmpresa('')
    }
  }, [aberto, organizacao])

  const dirty = !!(
    nome !== (organizacao?.nome_organizacao || '') ||
    cnpj !== '' ||
    estado !== '' ||
    cidade !== '' ||
    segmento !== '' ||
    tipoEmpresa !== ''
  )
  const podesSalvar = !!nome.trim()

  function handleSalvar() {
    if (!podesSalvar) return
    aoSalvar({ nome, subdominio, cnpj, estado, cidade, segmento, tipo_empresa: tipoEmpresa })
    aoFechar()
  }

  return (
    <ModalFormularioGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Buildings size={24} weight="duotone" />}
      titulo={t('admin.testes-gerais.org.editar_titulo')}
      subtitulo={t('admin.testes-gerais.org.editar_subtitulo')}
      tamanho="lg"
      altura="680px"
      dirty={dirty}
      podesSalvar={podesSalvar}
      textoSalvar={t('admin.testes-gerais.org.editar_btn_salvar')}
    >
      <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* ── Seção: Identidade ─────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <SecaoFormulario
              icone={<IdentificationCard size={16} weight="duotone" />}
              titulo={t('admin.testes-gerais.org.secao_identidade')}
              tooltip={t('admin.testes-gerais.org.secao_identidade_tooltip')}
              marginBottom={0}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: organizacao?.status_organizacao === 'ATIVO' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                color: organizacao?.status_organizacao === 'ATIVO' ? '#34d399' : '#f87171',
                border: `1px solid ${organizacao?.status_organizacao === 'ATIVO' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
              }}>
                {organizacao?.status_organizacao}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                <CalendarBlank size={14} />
                <span>{t('admin.testes-gerais.org.criado_em')} {organizacao?.data_criacao_organizacao}</span>
              </div>
            </div>
          </div>

          <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <CampoGeralGlobal label={t('admin.visao-geral.campo_empresa')} obrigatorio>
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
            </div>

            <div>
              <CampoGeralGlobal label={t('admin.visao-geral.campo_cnpj')}>
                <div className="ws-input-icon-wrap">
                  <IdentificationCard size={16} />
                  <input
                    value={cnpj}
                    placeholder={t('admin.testes-gerais.org.campo_cnpj_placeholder')}
                    onChange={e => setCnpj(formatarCNPJ(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </CampoGeralGlobal>
            </div>

            <div>
              <CampoGeralGlobal label={t('admin.visao-geral.campo_segmento')}>
                <SelectGlobal
                  iconeEsquerda={<Package size={16} />}
                  opcoes={OPCOES_SEGMENTOS}
                  valor={segmento || null}
                  aoMudarValor={(v: string | number | null) => setSegmento(String(v ?? ''))}
                  placeholder={t('admin.testes-gerais.org.campo_selecione_placeholder')}
                  buscavel
                />
              </CampoGeralGlobal>
            </div>

            <div>
              <CampoGeralGlobal label={t('admin.visao-geral.campo_estado')}>
                <SelectGlobal
                  iconeEsquerda={<MapPin size={16} />}
                  opcoes={OPCOES_ESTADOS}
                  valor={estado || null}
                  aoMudarValor={(v: string | number | null) => {
                    setEstado(String(v ?? ''))
                    setCidade('')
                  }}
                  placeholder={t('admin.testes-gerais.org.campo_estado_placeholder')}
                  buscavel
                />
              </CampoGeralGlobal>
            </div>

            <div>
              <CampoGeralGlobal label={t('admin.visao-geral.campo_cidade')}>
                <SelectGlobal
                  iconeEsquerda={<MapPin size={16} />}
                  opcoes={cidades}
                  valor={cidade || null}
                  aoMudarValor={(v: string | number | null) => setCidade(String(v ?? ''))}
                  placeholder={estado ? t('admin.testes-gerais.org.cidade_placeholder_com_estado') : t('admin.testes-gerais.org.cidade_placeholder_sem_estado')}
                  buscavel
                  desabilitado={!estado}
                  carregando={carregandoCidades}
                />
              </CampoGeralGlobal>
            </div>
          </div>
        </div>

        {/* ── Seção: Acesso e Web ───────────────────────────────────── */}
        <div>
          <SecaoFormulario
            icone={<Globe size={16} weight="duotone" />}
            titulo={t('admin.testes-gerais.org.secao_acesso_web')}
          />
          <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div>
              <CampoGeralGlobal label={t('admin.visao-geral.campo_tipo_empresa')}>
                <SelectGlobal
                  iconeEsquerda={<Buildings size={16} />}
                  opcoes={OPCOES_TIPOS_EMPRESA}
                  valor={tipoEmpresa || null}
                  aoMudarValor={(v: string | number | null) => setTipoEmpresa(String(v ?? ''))}
                  placeholder={t('admin.testes-gerais.org.campo_selecione_placeholder')}
                />
              </CampoGeralGlobal>
            </div>

            <div>
              <CampoGeralGlobal
                label={t('admin.testes-gerais.org.campo_subdominio')}
                tooltipTitulo="Subdomínio gerado pelo sistema"
                tooltipDescricao="Subdomínio é gerado pela plataforma na criação e não pode ser alterado depois — URLs já em uso por usuários, integrações e webhooks dependem dele."
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
                  opacity: 0.85,
                }}>
                  <Globe size={16} style={{ marginRight: '0.5rem', color: 'var(--ws-muted)' }} />
                  <strong style={{ color: 'var(--ws-accent)' }}>
                    {subdominio}<span style={{ color: 'var(--ws-muted)', fontWeight: 400 }}>.usegravity.com.br</span>
                  </strong>
                </div>
              </CampoGeralGlobal>
            </div>
          </div>
        </div>

      </div>
    </ModalFormularioGlobal>
  )
}
