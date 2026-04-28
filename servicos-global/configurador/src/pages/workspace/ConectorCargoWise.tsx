import React, { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Truck,
  CheckCircle,
  ArrowRight,
  Copy,
  ClockAfternoon,
  FileArrowUp,
  FilePdf,
  ShieldCheck,
  Info,
  Spinner,
  DownloadSimple,
  Eye,
  X,
  Warning,
  ArrowLeft,
  Envelope,
  GlobeHemisphereWest,
  Code,
  SealCheck,
  HourglassMedium,
  CircleDashed,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { SelectGlobal } from '@nucleo/campo-select-global'

/* ─── eAdaptor XML sample ───────────────────────────────────────── */
const XML_EADAPTOR = `<?xml version="1.0" encoding="UTF-8"?>
<UniversalTransaction>
  <Body>
    <UniversalShipment>
      <Shipment>
        <DataContext>
          <DataSourceCollection>
            <DataSource>
              <Type>ForwardingShipment</Type>
              <Key>GVT-2026-00438</Key>
            </DataSource>
          </DataSourceCollection>
        </DataContext>
        <SubShipmentCollection>
          <SubShipment>
            <HouseBill>HB2026-3871</HouseBill>
            <ContainerMode>FCL</ContainerMode>
            <TransportMode>SEA</TransportMode>
            <LoadPort>
              <Code>CNSHA</Code>
              <Name>Shanghai</Name>
            </LoadPort>
            <DischargePort>
              <Code>BRSNT</Code>
              <Name>Santos</Name>
            </DischargePort>
          </SubShipment>
        </SubShipmentCollection>
        <CustomDeclarations>
          <Declaration>
            <DeclarationType>IMP</DeclarationType>
            <NCMCode>84821010</NCMCode>
            <CustomsValue currency="BRL">487500.00</CustomsValue>
            <GravityRef>GVT-2026-00438</GravityRef>
          </Declaration>
        </CustomDeclarations>
        <DocumentCollection>
          <Document>
            <Type>INV</Type>
            <IsAvailable>true</IsAvailable>
            <GravityGenerated>true</GravityGenerated>
            <Timestamp>2026-03-25T10:00:00Z</Timestamp>
          </Document>
          <Document>
            <Type>PKL</Type>
            <IsAvailable>true</IsAvailable>
            <GravityGenerated>true</GravityGenerated>
          </Document>
          <Document>
            <Type>BL</Type>
            <IsAvailable>false</IsAvailable>
            <PendingReason>AguardandoPDF</PendingReason>
          </Document>
        </DocumentCollection>
      </Shipment>
    </UniversalShipment>
  </Body>
</UniversalTransaction>`

/* ─── Steps definition ──────────────────────────────────────────── */
type StepId = 0 | 1 | 2

/* ─── XML highlight helper ─────────────────────────────────────── */
function HighlightedXML({ xml }: { xml: string }) {
  return (
    <pre className="cw-xml-viewer">
      <code>{xml}</code>
    </pre>
  )
}

/* ─── Component ─────────────────────────────────────────────────── */
export function ConectorCargoWise() {
  const { t } = useTranslation()
  const STEPS = useMemo(() => [
    { id: 0 as StepId, label: t('workspace.cargowise.step0_label'), sublabel: t('workspace.cargowise.step0_sublabel'), icon: <GlobeHemisphereWest weight="duotone" size={18} /> },
    { id: 1 as StepId, label: t('workspace.cargowise.step1_label'), sublabel: t('workspace.cargowise.step1_sublabel'), icon: <Code weight="duotone" size={18} /> },
    { id: 2 as StepId, label: t('workspace.cargowise.step2_label'), sublabel: t('workspace.cargowise.step2_sublabel'), icon: <FileArrowUp weight="duotone" size={18} /> },
  ], [t])
  const [step, setStep] = useState<StepId>(0)
  const [copied, setCopied] = useState(false)
  const [fileUploaded, setFileUploaded] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [xmlExpanded, setXmlExpanded] = useState(false)
  const [sendingDoc, setSendingDoc] = useState(false)
  const [docSent, setDocSent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Step 0 state
  const [env, setEnv] = useState<'production' | 'uat'>('uat')
  const [serverUrl, setServerUrl] = useState(import.meta.env.VITE_CARGOWISE_URL ?? 'https://uat.cargowise.com/eAdaptor')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [enterpriseCode, setEnterpriseCode] = useState('')
  const [staffCode, setStaffCode] = useState('')
  const [timeout, setTimeout_] = useState('30000')

  function handleCopyXML() {
    navigator.clipboard.writeText(XML_EADAPTOR).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') setFileUploaded(file.name)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFileUploaded(file.name)
  }

  function handleSendDoc() {
    setSendingDoc(true)
    setTimeout(() => {
      setSendingDoc(false)
      setDocSent(true)
    }, 2200)
  }

  const canAdvanceStep0 = serverUrl && username && password && enterpriseCode && staffCode

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Truck weight="duotone" size={24} color="#818cf8" />}
          titulo={t('workspace.cargowise.titulo')}
          subtitulo={t('workspace.cargowise.subtitulo')}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('workspace.cargowise.stat_status_implantacao')}
            valor={t('workspace.cargowise.stat_status_valor')}
            subtexto={t('workspace.cargowise.stat_status_subtexto', { etapa: step + 1 })}
            variante="aviso"
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.cargowise.stat_protocolo')}
            valor="eAdaptor"
            subtexto={t('workspace.cargowise.stat_protocolo_subtexto')}
            variante="primario"
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.cargowise.stat_ambiente')}
            valor={env === 'uat' ? 'UAT' : t('workspace.cargowise.producao')}
            subtexto={env === 'uat' ? t('workspace.cargowise.homologacao') : t('workspace.cargowise.go_live')}
            variante={env === 'uat' ? 'aviso' : 'sucesso'}
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.cargowise.stat_documentacao')}
            valor={docSent ? t('workspace.cargowise.doc_enviada') : fileUploaded ? t('workspace.cargowise.aguardando_envio') : t('comum.pendente')}
            subtexto={docSent ? t('workspace.cargowise.pdf_recebido') : t('workspace.cargowise.certificado_implantacao')}
            variante={docSent ? 'sucesso' : 'padrao'}
          />
        </>
      }
    >
      {/* ── Stepper ─────────────────────────────────────────────────── */}
      <div className="cw-stepper ws-fade-up">
        {STEPS.map((s, idx) => {
          const isActive = step === s.id
          const isDone = step > s.id
          return (
            <React.Fragment key={s.id}>
              <div
                className={`cw-step ${isActive ? 'cw-step--active' : ''} ${isDone ? 'cw-step--done' : ''}`}
                onClick={() => { if (isDone) setStep(s.id) }}
                style={{ cursor: isDone ? 'pointer' : 'default' }}
              >
                <div className="cw-step__circle">
                  {isDone
                    ? <CheckCircle weight="fill" size={18} />
                    : isActive
                    ? <span className="cw-step__num">{idx + 1}</span>
                    : <CircleDashed weight="regular" size={18} />
                  }
                </div>
                <div className="cw-step__info">
                  <span className="cw-step__label">{s.label}</span>
                  <span className="cw-step__sub">{s.sublabel}</span>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`cw-step__connector ${step > s.id ? 'cw-step__connector--done' : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* ── Step 0 — Configuração da Conexão ──────────────────────── */}
      {step === 0 && (
        <div className="ws-form-card ws-fade-up" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <GlobeHemisphereWest weight="duotone" size={14} color="#818cf8" />
              {t('workspace.cargowise.secao_credenciais')}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['uat', 'production'] as const).map(e => (
                <button
                  key={e}
                  className={`cw-env-btn ${env === e ? 'cw-env-btn--active' : ''}`}
                  onClick={() => {
                    setEnv(e)
                    setServerUrl(e === 'uat'
                      ? 'https://uat.cargowise.com/eAdaptor'
                      : 'https://live.cargowise.com/eAdaptor')
                  }}
                >
                  {e === 'uat' ? t('workspace.cargowise.btn_uat') : t('workspace.cargowise.btn_producao_env')}
                </button>
              ))}
            </div>
          </div>

          {/* Environment banner */}
          <div className={`cw-env-banner cw-env-banner--${env}`} style={{ marginBottom: '1.5rem' }}>
            {env === 'uat'
              ? <><Info size={14} /> {t('workspace.cargowise.banner_uat')}</>
              : <><Warning size={14} weight="fill" /> {t('workspace.cargowise.banner_producao')}</>
            }
          </div>

          <div className="ws-form-row">
            <div className="ws-field">
              <label>{t('workspace.cargowise.campo_server_url')}</label>
              <input
                type="text"
                value={serverUrl}
                onChange={e => setServerUrl(e.target.value)}
                placeholder="https://uat.cargowise.com/eAdaptor"
              />
            </div>
            <div className="ws-field">
              <label>{t('workspace.cargowise.campo_enterprise_code')}</label>
              <input
                type="text"
                value={enterpriseCode}
                onChange={e => setEnterpriseCode(e.target.value)}
                placeholder="Ex: ACM"
              />
            </div>
          </div>

          <div className="ws-form-row">
            <div className="ws-field">
              <label>{t('workspace.cargowise.campo_usuario')}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: gravity.integration"
              />
            </div>
            <div className="ws-field">
              <label>{t('workspace.cargowise.campo_senha')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  style={{ paddingRight: '2.5rem' }}
                />
                <ShieldCheck
                  size={18}
                  color={password ? '#34d399' : '#475569'}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }}
                />
              </div>
            </div>
          </div>

          <div className="ws-form-row">
            <div className="ws-field">
              <label>{t('workspace.cargowise.campo_staff_code')}</label>
              <input
                type="text"
                value={staffCode}
                onChange={e => setStaffCode(e.target.value)}
                placeholder="Ex: ADM"
              />
            </div>
            <div className="ws-field">
              <label>{t('workspace.cargowise.campo_timeout')}</label>
              <SelectGlobal
                opcoes={[
                  { valor: '15000', rotulo: t('workspace.cargowise.timeout_rapido') },
                  { valor: '30000', rotulo: t('workspace.cargowise.timeout_padrao') },
                  { valor: '60000', rotulo: t('workspace.cargowise.timeout_lento') },
                ]}
                valor={timeout}
                aoMudarValor={(v) => setTimeout_(String(v ?? '30000'))}
                placeholder="Selecione..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--ws-accent-border)' }}>
            <BotaoGlobal variante="fantasma" tamanho="pequeno">
              {t('workspace.cargowise.btn_testar_conexao')}
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<ArrowRight weight="bold" size={14} />}
              disabled={!canAdvanceStep0}
              onClick={() => setStep(1)}
            >
              {t('workspace.cargowise.btn_avancar_mapeamento')}
            </BotaoGlobal>
          </div>
        </div>
      )}

      {/* ── Step 1 — Mapeamento eAdaptor ─────────────────────────── */}
      {step === 1 && (
        <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>

          {/* Info card */}
          <div className="cw-info-card">
            <Info size={16} weight="duotone" color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--ws-text)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                {t('workspace.cargowise.eadaptor_titulo')}
              </p>
              <p style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
                {t('workspace.cargowise.eadaptor_desc')}
              </p>
            </div>
          </div>

          {/* XML Viewer */}
          <div className="cw-xml-card">
            <div className="cw-xml-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Code weight="duotone" size={16} color="#818cf8" />
                <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ws-text)' }}>
                  UniversalTransaction.xml — GVT-2026-00438
                </span>
                <span className="ws-badge ws-badge-warning" style={{ fontSize: '0.7rem' }}>
                  <HourglassMedium weight="fill" size={10} /> {t('workspace.cargowise.bl_pendente')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  icone={<Eye weight="bold" size={13} />}
                  onClick={() => setXmlExpanded(v => !v)}
                >
                  {xmlExpanded ? t('workspace.cargowise.colapsar') : t('workspace.cargowise.expandir')}
                </BotaoGlobal>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  icone={copied ? <CheckCircle weight="fill" size={13} color="#34d399" /> : <Copy weight="bold" size={13} />}
                  onClick={handleCopyXML}
                >
                  {copied ? t('workspace.cargowise.copiado') : t('workspace.cargowise.copiar_xml')}
                </BotaoGlobal>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  icone={<DownloadSimple weight="bold" size={13} />}
                >
                  {t('workspace.cargowise.download')}
                </BotaoGlobal>
              </div>
            </div>
            <div className={`cw-xml-body ${xmlExpanded ? 'cw-xml-body--expanded' : ''}`}>
              <HighlightedXML xml={XML_EADAPTOR} />
            </div>

            {/* Pending document alert */}
            <div className="cw-pending-alert">
              <HourglassMedium weight="duotone" size={15} color="#fbbf24" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, color: '#fbbf24', margin: '0 0 0.125rem', fontSize: '0.8125rem' }}>
                  {t('workspace.cargowise.alerta_bl_titulo')}
                </p>
                <p style={{ color: 'var(--ws-muted)', fontSize: '0.78125rem', margin: 0 }}>
                  {t('workspace.cargowise.alerta_bl_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Field mapping table */}
          <div className="ws-form-card">
            <p className="ws-section-title" style={{ marginBottom: '1rem' }}>
              <CheckCircle weight="duotone" size={14} color="#818cf8" />
              {t('workspace.cargowise.secao_mapeamento')}
            </p>
            <div className="cw-mapping-grid">
              {[
                { campo: 'GravityRef', destino: 'DataSource / Key', status: 'ok', valor: 'GVT-2026-00438' },
                { campo: 'HouseBill', destino: 'SubShipment / HouseBill', status: 'ok', valor: 'HB2026-3871' },
                { campo: 'ContainerMode', destino: 'SubShipment / ContainerMode', status: 'ok', valor: 'FCL' },
                { campo: 'PortaOrigem (UNLOC)', destino: 'LoadPort / Code', status: 'ok', valor: 'CNSHA' },
                { campo: 'PortaDestino (UNLOC)', destino: 'DischargePort / Code', status: 'ok', valor: 'BRSNT' },
                { campo: 'NCM', destino: 'Declaration / NCMCode', status: 'ok', valor: '84821010' },
                { campo: 'ValorAduaneiro', destino: 'Declaration / CustomsValue', status: 'ok', valor: 'R$ 487.500,00' },
                { campo: 'BillOfLading PDF', destino: 'Document [BL] / IsAvailable', status: 'pending', valor: '—' },
              ].map(row => (
                <div key={row.campo} className="cw-mapping-row">
                  <div className="cw-mapping-field">{row.campo}</div>
                  <div className="cw-mapping-arrow">
                    <ArrowRight size={12} color="#818cf8" />
                  </div>
                  <div className="cw-mapping-dest">{row.destino}</div>
                  <div className="cw-mapping-val">{row.valor}</div>
                  <div className={`cw-mapping-status cw-mapping-status--${row.status}`}>
                    {row.status === 'ok'
                      ? <CheckCircle weight="fill" size={14} />
                      : <HourglassMedium weight="duotone" size={14} />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <BotaoGlobal
              variante="fantasma"
              tamanho="pequeno"
              icone={<ArrowLeft weight="bold" size={14} />}
              onClick={() => setStep(0)}
            >
              {t('workspace.cargowise.btn_voltar')}
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<ArrowRight weight="bold" size={14} />}
              onClick={() => setStep(2)}
            >
              {t('workspace.cargowise.btn_avancar_documentacao')}
            </BotaoGlobal>
          </div>
        </div>
      )}

      {/* ── Step 2 — Envio de Documentação ───────────────────────── */}
      {step === 2 && (
        <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>

          {/* Awaiting PDF Hero */}
          {!docSent && (
            <div className="cw-await-hero">
              <div className="cw-await-hero__icon">
                <HourglassMedium weight="duotone" size={44} color="#fbbf24" />
                <div className="cw-await-hero__pulse" />
              </div>
              <div>
                <h2 className="cw-await-hero__title">{t('workspace.cargowise.hero_titulo')}</h2>
                <p className="cw-await-hero__desc">
                  {t('workspace.cargowise.hero_desc')}
                </p>
              </div>
            </div>
          )}

          {/* Upload zone */}
          {!docSent && (
            <div
              className={`cw-upload-zone ${isDragging ? 'cw-upload-zone--dragging' : ''} ${fileUploaded ? 'cw-upload-zone--done' : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => !fileUploaded && fileRef.current?.click()}
              style={{ cursor: fileUploaded ? 'default' : 'pointer' }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              {fileUploaded ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FilePdf weight="duotone" size={40} color="#818cf8" />
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--ws-text)', margin: '0 0 0.25rem' }}>{fileUploaded}</p>
                    <p style={{ color: '#34d399', fontSize: '0.8125rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle weight="fill" size={13} /> {t('workspace.cargowise.upload_sucesso')}
                    </p>
                  </div>
                  <button
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onClick={e => { e.stopPropagation(); setFileUploaded(null) }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
                  <FileArrowUp weight="duotone" size={40} color={isDragging ? '#818cf8' : '#475569'} style={{ transition: 'color 0.2s' }} />
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--ws-text)', margin: '0 0 0.25rem', fontSize: '0.9375rem' }}>
                      {isDragging ? t('workspace.cargowise.upload_soltar') : t('workspace.cargowise.upload_arrastar')}
                    </p>
                    <p style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem', margin: 0 }}>
                      {t('workspace.cargowise.upload_restricao')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Document checklist */}
          {!docSent && (
            <div className="ws-form-card">
              <p className="ws-section-title" style={{ marginBottom: '1rem' }}>
                <Envelope weight="duotone" size={14} color="#818cf8" />
                {t('workspace.cargowise.secao_pacote')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: t('workspace.cargowise.doc_contrato'), status: 'ok' },
                  { label: t('workspace.cargowise.doc_invoice'), status: 'ok' },
                  { label: t('workspace.cargowise.doc_autorizacao'), status: 'ok' },
                  { label: t('workspace.cargowise.doc_bl'), status: fileUploaded ? 'ok' : 'pending' },
                  { label: t('workspace.cargowise.doc_certificado'), status: 'opcional' },
                ].map((doc, i) => (
                  <div key={i} className={`cw-doc-row cw-doc-row--${doc.status}`}>
                    <div className="cw-doc-row__icon">
                      {doc.status === 'ok'
                        ? <CheckCircle weight="fill" size={16} color="#34d399" />
                        : doc.status === 'pending'
                        ? <ClockAfternoon weight="duotone" size={16} color="#fbbf24" />
                        : <Info size={16} color="#475569" />
                      }
                    </div>
                    <span>{doc.label}</span>
                    <span className={`ws-badge ${doc.status === 'ok' ? 'ws-badge-success' : doc.status === 'pending' ? 'ws-badge-warning' : ''}`} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                      {doc.status === 'ok' ? t('workspace.cargowise.status_pronto') : doc.status === 'pending' ? t('workspace.cargowise.status_pendente') : t('workspace.cargowise.status_opcional')}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--ws-accent-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  icone={<ArrowLeft weight="bold" size={14} />}
                  onClick={() => setStep(1)}
                >
                  {t('workspace.cargowise.btn_voltar_xml')}
                </BotaoGlobal>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <BotaoGlobal
                    variante="fantasma"
                    tamanho="pequeno"
                    icone={<Envelope weight="bold" size={14} />}
                  >
                    {t('workspace.cargowise.btn_enviar_email')}
                  </BotaoGlobal>
                  <BotaoGlobal
                    variante="primario"
                    tamanho="pequeno"
                    icone={
                      sendingDoc
                        ? <Spinner weight="bold" size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        : <FileArrowUp weight="bold" size={14} />
                    }
                    onClick={handleSendDoc}
                    disabled={!fileUploaded || sendingDoc}
                  >
                    {sendingDoc ? t('workspace.cargowise.enviando') : t('workspace.cargowise.enviar_documentacao')}
                  </BotaoGlobal>
                </div>
              </div>
            </div>
          )}

          {/* Success state */}
          {docSent && (
            <div className="cw-success-card ws-fade-up">
              <div className="cw-success-card__icon">
                <SealCheck weight="fill" size={56} color="#34d399" />
              </div>
              <h2 className="cw-success-card__title">{t('workspace.cargowise.success_titulo')}</h2>
              <p className="cw-success-card__desc">
                {t('workspace.cargowise.success_desc')}
              </p>
              <div className="cw-success-steps">
                {[
                  { label: t('workspace.cargowise.success_step1'), done: true },
                  { label: t('workspace.cargowise.success_step2'), done: false },
                  { label: t('workspace.cargowise.success_step3'), done: false },
                ].map((s, i) => (
                  <div key={i} className="cw-success-step">
                    <div className={`cw-success-step__dot ${s.done ? 'cw-success-step__dot--done' : ''}`}>
                      {s.done ? <CheckCircle weight="fill" size={14} /> : i + 1}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: s.done ? 'var(--ws-text)' : 'var(--ws-muted)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={() => { setDocSent(false); setFileUploaded(null); setStep(0) }}
                >
                  {t('workspace.cargowise.btn_reiniciar')}
                </BotaoGlobal>
                <BotaoGlobal variante="primario" tamanho="pequeno" icone={<DownloadSimple weight="bold" size={14} />}>
                  {t('workspace.cargowise.btn_baixar_comprovante')}
                </BotaoGlobal>
              </div>
            </div>
          )}
        </div>
      )}
    </PaginaGlobal>
  )
}
