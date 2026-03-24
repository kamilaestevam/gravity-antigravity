import React, { useState } from 'react'
import {
  Crown,
  Buildings,
  IdentificationCard,
  MapPin,
  Globe,
  Package,
  CalendarBlank,
  CheckCircle,
  PencilSimple,
  FloppyDisk,
  X,
} from '@phosphor-icons/react'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'

// ── Mock — substituir por contexto real de tenant ──────────────────────────
const EMPRESAS_FILHAS_MOCK = [
  { id: '1', nome: 'Acme Logística',       subdominio: 'acme-log'    },
  { id: '2', nome: 'Acme Importações',     subdominio: 'acme-import' },
  { id: '3', nome: 'Acme Distribuição',    subdominio: 'acme-dist'   },
  { id: '4', nome: 'Brasilcom Tecnologia', subdominio: 'brasilcom'   },
]

type DadosMae = {
  nome:       string
  cnpj:       string
  estado:     string
  cidade:     string
  segmento:   string
  site:       string
  plano:      string
  subdominio: string
  criadaEm:   string
}

const dadosIniciais: DadosMae = {
  nome:       'Acme Corporation Ltda.',
  cnpj:       '12.345.678/0001-99',
  estado:     'SP',
  cidade:     'São Paulo',
  segmento:   'Logística & Distribuição',
  site:       'https://www.acme.com.br',
  plano:      'Enterprise',
  subdominio: 'acme',
  criadaEm:   '01/01/2024',
}

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

export function EmpresaMae() {
  const [dados, setDados]       = useState<DadosMae>(dadosIniciais)
  const [editando, setEditando] = useState(false)
  const [draft, setDraft]       = useState<DadosMae>(dadosIniciais)

  // empresa filha selecionada para acesso operacional
  const [filhaAtivaId, setFilhaAtivaId] = useState<string>('')

  function handleEdit() {
    setDraft({ ...dados })
    setEditando(true)
  }

  function handleSave() {
    setDados({ ...draft })
    setEditando(false)
  }

  function handleCancel() {
    setDraft({ ...dados })
    setEditando(false)
  }

  function field(key: keyof DadosMae, label: string, placeholder?: string) {
    return (
      <div className="ws-field">
        <label>{label}</label>
        {editando
          ? <input
              value={draft[key]}
              placeholder={placeholder ?? label}
              onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
            />
          : <div className="em-readonly">{dados[key] || <span className="em-empty">—</span>}</div>
        }
      </div>
    )
  }

  const filhaAtiva = EMPRESAS_FILHAS_MOCK.find(f => f.id === filhaAtivaId)

  return (
    <div className="ws-fade-up">
      <CabecalhoGlobal
        icone={<Crown weight="duotone" size={22} />}
        titulo="Empresa Mãe"
        subtitulo="Dados da empresa que contratou a plataforma Gravity."
      />

      {/* ── Identity card ──────────────────────────────────────────────── */}
      <div className="em-identity ws-fade-up">
        {/* Avatar + nome + plano */}
        <div className="em-identity__hero">
          <div className="em-identity__avatar">{dados.nome.charAt(0)}</div>
          <div className="em-identity__text">
            <p className="em-identity__badge">Empresa Mãe</p>
            <h2 className="em-identity__nome">{dados.nome}</h2>
            <p className="em-identity__sub">
              <span className="em-tag">{dados.plano}</span>
              <span className="em-identity__sep">·</span>
              {dados.subdominio}.gravity.com.br
            </p>
          </div>
          <div className="em-identity__actions">
            {!editando
              ? <BotaoGlobal variante="secundario" onClick={handleEdit}>
                  <PencilSimple size={14} weight="bold" /> Editar dados
                </BotaoGlobal>
              : <>
                  <BotaoGlobal variante="primario" onClick={handleSave}>
                    <FloppyDisk size={14} weight="bold" /> Salvar
                  </BotaoGlobal>
                  <BotaoGlobal variante="fantasma" onClick={handleCancel}>
                    <X size={14} weight="bold" /> Cancelar
                  </BotaoGlobal>
                </>
            }
          </div>
        </div>
      </div>

      {/* ── Dados Básicos ───────────────────────────────────────────────── */}
      <div className="em-section ws-fade-up ws-fade-up-d1">
        <p className="ws-section-title">
          <Buildings weight="duotone" size={14} color="var(--ws-accent)" />
          Dados Básicos
        </p>
        <div className="em-grid">
          {field('nome',    'Nome da Empresa *',  'Ex: Acme Corporation Ltda.')}
          {field('cnpj',    'CNPJ',               'Ex: 00.000.000/0001-00')}
        </div>
        <div className="em-grid em-grid--4">
          {/* Estado — select quando editando */}
          <div className="ws-field">
            <label>Estado</label>
            {editando
              ? <select
                  className="ws-select-inline"
                  value={draft.estado}
                  onChange={e => setDraft(p => ({ ...p, estado: e.target.value }))}
                  style={{ width: '100%', borderRadius: 8, padding: '0.625rem 0.875rem' }}
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_BR.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              : <div className="em-readonly">{dados.estado || '—'}</div>
            }
          </div>
          {field('cidade',   'Cidade',    'Ex: São Paulo')}
          {field('segmento', 'Segmento',  'Ex: Logística')}
          {field('site',     'Site',      'https://...')}
        </div>
      </div>

      {/* ── Dados do Plano ────────────────────────────────────────────── */}
      <div className="em-section ws-fade-up ws-fade-up-d2">
        <p className="ws-section-title">
          <Package weight="duotone" size={14} color="var(--ws-accent)" />
          Plano Contratado
        </p>
        <div className="em-plan-row">
          <div className="em-plan-info">
            <div className="em-plan-icon"><Package weight="duotone" size={22} /></div>
            <div>
              <p className="em-plan-label">Plano atual</p>
              <p className="em-plan-name">{dados.plano}</p>
            </div>
          </div>
          <div className="em-plan-meta">
            <div className="em-plan-meta-item">
              <Globe size={14} weight="duotone" />
              <span>{dados.subdominio}.gravity.com.br</span>
            </div>
            <div className="em-plan-meta-item">
              <CalendarBlank size={14} weight="duotone" />
              <span>Cliente desde {dados.criadaEm}</span>
            </div>
            <div className="em-plan-meta-item">
              <MapPin size={14} weight="duotone" />
              <span>{dados.cidade}, {dados.estado}</span>
            </div>
            <div className="em-plan-meta-item">
              <IdentificationCard size={14} weight="duotone" />
              <span>{dados.cnpj}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Utilizar como empresa filha ───────────────────────────────── */}
      <div className="em-section em-filha-section ws-fade-up ws-fade-up-d3">
        <p className="ws-section-title">
          <CheckCircle weight="duotone" size={14} color="var(--ws-accent)" />
          Utilizar essa empresa como filha
        </p>
        <p className="em-filha-desc">
          Selecione a empresa filha que deseja utilizar como contexto operacional
          ao acessar a plataforma. O acesso e os dados exibidos serão referentes
          à empresa selecionada.
        </p>

        <div className="em-filha-select-row">
          <div className="ws-field" style={{ flex: 1 }}>
            <label>Empresa filha ativa</label>
            <select
              className="ws-select-inline"
              value={filhaAtivaId}
              onChange={e => setFilhaAtivaId(e.target.value)}
              style={{ width: '100%', borderRadius: 8, padding: '0.625rem 0.875rem' }}
            >
              <option value="">— Selecione uma empresa filha —</option>
              {EMPRESAS_FILHAS_MOCK.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nome}  ({f.subdominio}.gravity.com.br)
                </option>
              ))}
            </select>
          </div>
          <div style={{ paddingTop: '1.375rem' }}>
            <BotaoGlobal
              variante="primario"
              disabled={!filhaAtivaId}
              onClick={() => {}}
            >
              <CheckCircle size={15} weight="bold" />
              Aplicar seleção
            </BotaoGlobal>
          </div>
        </div>

        {filhaAtiva && (
          <div className="em-filha-active ws-fade-up">
            <CheckCircle weight="fill" size={16} color="#34d399" />
            <span>
              Acessando como&nbsp;<strong>{filhaAtiva.nome}</strong>&nbsp;
              <span className="em-filha-active__sub">
                ({filhaAtiva.subdominio}.gravity.com.br)
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
