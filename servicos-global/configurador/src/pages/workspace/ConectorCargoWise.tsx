import React, { useState, useRef } from 'react'
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
import { StatCardGlobal } from '@nucleo/stat-card-global'

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

const STEPS = [
  {
    id: 0 as StepId,
    label: 'Configuração da Conexão',
    sublabel: 'Credenciais & Environment',
    icon: <GlobeHemisphereWest weight="duotone" size={18} />,
  },
  {
    id: 1 as StepId,
    label: 'Mapeamento eAdaptor',
    sublabel: 'Preview do XML & Validação',
    icon: <Code weight="duotone" size={18} />,
  },
  {
    id: 2 as StepId,
    label: 'Envio de Documentação',
    sublabel: 'Certificado & Aprovação',
    icon: <FileArrowUp weight="duotone" size={18} />,
  },
]

/* ─── XML highlight helper ─────────────────────────────────────── */
function HighlightedXML({ xml }: { xml: string }) {
  const highlighted = xml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Tags
    .replace(/(&lt;\/?)([\w:]+)(&gt;)/g, '<span class="cw-xml-tag">$1$2$3</span>')
    .replace(/(&lt;)([\w:]+)(\s)/g, '<span class="cw-xml-tag">$1$2</span>$3')
    .replace(/(\/)(&gt;)/g, '<span class="cw-xml-tag">$1$2</span>')
    // Attributes
    .replace(/([\w:]+)(=)(")/g, '<span class="cw-xml-attr">$1</span>$2<span class="cw-xml-val">$3</span>')
    .replace(/(")(\s|&gt;)/g, '<span class="cw-xml-val">$1</span>$2')
    // Values between tags
    .replace(/(&gt;)([^&<\n]+)(&lt;)/g, '$1<span class="cw-xml-content">$2</span>$3')
    // Comments
    .replace(/(&lt;!--.*?--&gt;)/g, '<span class="cw-xml-comment">$1</span>')

  return (
    <pre
      className="cw-xml-viewer"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

/* ─── Component ─────────────────────────────────────────────────── */
export function ConectorCargoWise() {
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
  const [serverUrl, setServerUrl] = useState('https://uat.cargowise.com/eAdaptor')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [enterpriseCode, setEnterpriseCode] = useState('')
  const [staffCode, setStaffCode] = useState('')

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
          titulo="Conector CargoWise"
          subtitulo="Integração nativa via eAdaptor XML — implantação guiada em 3 etapas"
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="Status da Implantação"
            valor="Em Implantação"
            subtexto={`Etapa ${step + 1} de 3`}
            variante="aviso"
          />
          <StatCardGlobal
            titulo="Protocolo"
            valor="eAdaptor"
            subtexto="CargoWise One nativo"
            variante="primario"
          />
          <StatCardGlobal
            titulo="Ambiente Ativo"
            valor={env === 'uat' ? 'UAT' : 'Produção'}
            subtexto={env === 'uat' ? 'Homologação' : 'Go-Live'}
            variante={env === 'uat' ? 'aviso' : 'sucesso'}
          />
          <StatCardGlobal
            titulo="Documentação"
            valor={docSent ? 'Enviada' : fileUploaded ? 'Aguardando envio' : 'Pendente'}
            subtexto={docSent ? 'PDF recebido pela equipe' : 'Certificado de implantação'}
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
              Credenciais do CargoWise eAdaptor
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
                  {e === 'uat' ? '🧪 UAT / Homologação' : '🚀 Produção'}
                </button>
              ))}
            </div>
          </div>

          {/* Environment banner */}
          <div className={`cw-env-banner cw-env-banner--${env}`} style={{ marginBottom: '1.5rem' }}>
            {env === 'uat'
              ? <><Info size={14} /> Você está em modo <strong>UAT</strong>. Nenhuma operação real será afetada.</>
              : <><Warning size={14} weight="fill" /> Você está em modo <strong>Produção</strong>. As ações terão efeito real no CargoWise.</>
            }
          </div>

          <div className="ws-form-row">
            <div className="ws-field">
              <label>Server URL do eAdaptor</label>
              <input
                type="text"
                value={serverUrl}
                onChange={e => setServerUrl(e.target.value)}
                placeholder="https://uat.cargowise.com/eAdaptor"
              />
            </div>
            <div className="ws-field">
              <label>Enterprise Code</label>
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
              <label>Usuário do CargoWise</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: gravity.integration"
              />
            </div>
            <div className="ws-field">
              <label>Senha (AES-256)</label>
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
              <label>Staff Code</label>
              <input
                type="text"
                value={staffCode}
                onChange={e => setStaffCode(e.target.value)}
                placeholder="Ex: ADM"
              />
            </div>
            <div className="ws-field">
              <label>Timeout da Requisição (ms)</label>
              <select defaultValue="30000">
                <option value="15000">15 000 ms (Rápido)</option>
                <option value="30000">30 000 ms (Padrão)</option>
                <option value="60000">60 000 ms (Lento / Payloads grandes)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--ws-accent-border)' }}>
            <BotaoGlobal variante="fantasma" tamanho="pequeno">
              Testar Conexão
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<ArrowRight weight="bold" size={14} />}
              disabled={!canAdvanceStep0}
              onClick={() => setStep(1)}
            >
              Avançar para Mapeamento
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
                O que é o eAdaptor?
              </p>
              <p style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
                O <strong style={{ color: 'var(--ws-text)' }}>eAdaptor</strong> é o barramento oficial do CargoWise One para troca de dados XML. 
                A Gravity o utiliza para enviar declarações DI/DUE, documentos de embarque e dados de processo 
                de forma padronizada e rastreável. O XML abaixo é gerado automaticamente a partir do seu processo.
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
                  <HourglassMedium weight="fill" size={10} /> BL Pendente
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  icone={<Eye weight="bold" size={13} />}
                  onClick={() => setXmlExpanded(v => !v)}
                >
                  {xmlExpanded ? 'Colapsar' : 'Expandir'}
                </BotaoGlobal>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  icone={copied ? <CheckCircle weight="fill" size={13} color="#34d399" /> : <Copy weight="bold" size={13} />}
                  onClick={handleCopyXML}
                >
                  {copied ? 'Copiado!' : 'Copiar XML'}
                </BotaoGlobal>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  icone={<DownloadSimple weight="bold" size={13} />}
                >
                  Download
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
                  Documento <code style={{ fontSize: '0.75rem' }}>BL</code> aguardando PDF
                </p>
                <p style={{ color: 'var(--ws-muted)', fontSize: '0.78125rem', margin: 0 }}>
                  O Bill of Lading ainda não foi recebido. O eAdaptor ficará <strong style={{ color: 'var(--ws-text)' }}>pausado neste campo</strong> até o upload do PDF.
                  Avance para a próxima etapa para enviar o arquivo.
                </p>
              </div>
            </div>
          </div>

          {/* Field mapping table */}
          <div className="ws-form-card">
            <p className="ws-section-title" style={{ marginBottom: '1rem' }}>
              <CheckCircle weight="duotone" size={14} color="#818cf8" />
              Mapeamento de Campos Validado
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
              Voltar
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<ArrowRight weight="bold" size={14} />}
              onClick={() => setStep(2)}
            >
              Avançar para Documentação
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
                <h2 className="cw-await-hero__title">Aguardando o Bill of Lading (PDF)</h2>
                <p className="cw-await-hero__desc">
                  O eAdaptor está pronto mas o campo <code>Document[BL]</code> está <strong>pausado</strong> à espera do PDF do conhecimento de embarque. 
                  Faça o upload abaixo para liberar a sincronização com o CargoWise.
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
                      <CheckCircle weight="fill" size={13} /> PDF carregado com sucesso
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
                      {isDragging ? 'Solte o PDF aqui' : 'Arraste o BL aqui ou clique para escolher'}
                    </p>
                    <p style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem', margin: 0 }}>
                      Somente <strong>PDF</strong> · Máximo 30 MB
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
                Pacote de Documentação para Implantação
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Contrato de Implantação assinado', status: 'ok' },
                  { label: 'Invoice & Packing List (PDF gerado pelo Gravity)', status: 'ok' },
                  { label: 'Autorização de Acesso ao CargoWise', status: 'ok' },
                  { label: 'Bill of Lading — BL (PDF embarcador)', status: fileUploaded ? 'ok' : 'pending' },
                  { label: 'Certificado de Origem (opcional)', status: 'opcional' },
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
                      {doc.status === 'ok' ? 'Pronto' : doc.status === 'pending' ? 'Pendente' : 'Opcional'}
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
                  Voltar ao XML
                </BotaoGlobal>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <BotaoGlobal
                    variante="fantasma"
                    tamanho="pequeno"
                    icone={<Envelope weight="bold" size={14} />}
                  >
                    Enviar por E-mail
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
                    {sendingDoc ? 'Enviando...' : 'Enviar Documentação'}
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
              <h2 className="cw-success-card__title">Documentação Enviada!</h2>
              <p className="cw-success-card__desc">
                O pacote de documentação foi recebido pela equipe Gravity. 
                A implantação do conector CargoWise está sendo finalizada. 
                Você receberá um e-mail de confirmação com o resultado da homologação em até <strong>24 horas úteis</strong>.
              </p>
              <div className="cw-success-steps">
                {[
                  { label: 'Documentação Recebida', done: true },
                  { label: 'Validação pela Equipe Gravity', done: false },
                  { label: 'Ativação em Produção', done: false },
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
                  Reiniciar Implantação
                </BotaoGlobal>
                <BotaoGlobal variante="primario" tamanho="pequeno" icone={<DownloadSimple weight="bold" size={14} />}>
                  Baixar Comprovante
                </BotaoGlobal>
              </div>
            </div>
          )}
        </div>
      )}
    </PaginaGlobal>
  )
}
