/**
 * certificado-parser.ts — Parsing de certificado digital .pfx/.p12
 *
 * Usa node-forge para suportar certificados ICP-Brasil (e-CNPJ/e-CPF)
 * cujo formato PKCS12 não é reconhecido pelo OpenSSL 3.x nativo do Node.js.
 *
 * Abordagem:
 * 1. Decodifica PKCS12 com node-forge (suporta RC2, 3DES, AES)
 * 2. Extrai certificado X.509 e valida senha
 * 3. Retorna metadata (CN, CNPJ, serial, emissor, validade)
 */

import forge from 'node-forge'
import { AppError } from '../lib/app-error.js'

export interface CertificadoMetadata {
  cn: string
  cnpj: string | null
  serial_number: string
  emissor: string
  validade_inicio: Date
  validade_fim: Date
}

export interface CertificadoParsed {
  metadata: CertificadoMetadata
  pfxBuffer: Buffer
}

export async function parsePfx(pfxBuffer: Buffer, senha: string): Promise<CertificadoParsed> {
  let p12: forge.pkcs12.Pkcs12Pfx

  try {
    const derString = forge.util.binary.raw.encode(new Uint8Array(pfxBuffer))
    const asn1 = forge.asn1.fromDer(derString)
    p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, senha)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('Invalid password') || msg.includes('PKCS#12 MAC could not be verified')) {
      throw new AppError('Senha do certificado incorreta', 400, 'CERT_WRONG_PASSWORD')
    }
    if (msg.includes('Too few bytes') || msg.includes('ASN.1') || msg.includes('Invalid PFX')) {
      throw new AppError('Arquivo não é um certificado PFX/P12 válido', 400, 'CERT_INVALID_FORMAT')
    }
    throw new AppError(`Erro ao processar certificado: ${msg}`, 400, 'CERT_PARSE_ERROR')
  }

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
  const bags = certBags[forge.pki.oids.certBag]

  if (!bags || bags.length === 0) {
    throw new AppError('Nenhum certificado encontrado no arquivo PFX', 400, 'CERT_NO_CERT_FOUND')
  }

  const certBag = bags[0]
  if (!certBag.cert) {
    throw new AppError('Certificado inválido no arquivo PFX', 400, 'CERT_INVALID')
  }

  const cert = certBag.cert
  const subject = cert.subject.attributes
  const issuer = cert.issuer.attributes

  const cn = getAttrValue(subject, 'commonName') ?? ''
  const cnpj = extrairCNPJ(subject)
  const emissor = getAttrValue(issuer, 'commonName') ?? formatDN(cert.issuer)

  const validadeInicio = cert.validity.notBefore
  const validadeFim = cert.validity.notAfter

  if (validadeFim < new Date()) {
    throw new AppError(
      `Certificado expirado em ${validadeFim.toLocaleDateString('pt-BR')}`,
      400,
      'CERT_EXPIRED',
    )
  }

  return {
    metadata: {
      cn,
      cnpj,
      serial_number: cert.serialNumber,
      emissor,
      validade_inicio: validadeInicio,
      validade_fim: validadeFim,
    },
    pfxBuffer,
  }
}

function getAttrValue(attrs: forge.pki.CertificateField[], shortName: string): string | null {
  const attr = attrs.find(a => a.shortName === shortName || a.name === shortName)
  return attr ? String(attr.value) : null
}

function extrairCNPJ(attrs: forge.pki.CertificateField[]): string | null {
  for (const attr of attrs) {
    const val = String(attr.value ?? '')
    const cnpjMatch = val.match(/(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/)
    if (cnpjMatch) return cnpjMatch[1].replace(/[.\-/]/g, '')
    const pureDigits = val.match(/(\d{14})/)
    if (pureDigits) return pureDigits[1]
  }

  // ICP-Brasil: CNPJ pode estar no campo OID 2.16.76.1.3.3 (otherName no SAN)
  // Tentativa via CN que frequentemente contém o CNPJ no nome
  const cn = getAttrValue(attrs, 'commonName') ?? ''
  const cnpjFromCN = cn.match(/(\d{14})/)
  return cnpjFromCN ? cnpjFromCN[1] : null
}

function formatDN(name: { attributes: forge.pki.CertificateField[] }): string {
  return name.attributes
    .map((a: forge.pki.CertificateField) => `${a.shortName ?? a.name}=${a.value}`)
    .join(', ')
}

export function extrairPemDoP12(pfxBuffer: Buffer, passphrase: string): { certPem: string; keyPem: string } {
  const derString = forge.util.binary.raw.encode(new Uint8Array(pfxBuffer))
  const asn1 = forge.asn1.fromDer(derString)
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, passphrase)

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
  const certs = certBags[forge.pki.oids.certBag]
  if (!certs || certs.length === 0 || !certs[0].cert) {
    throw new AppError('Nenhum certificado encontrado no PFX', 400, 'CERT_NO_CERT_FOUND')
  }

  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
  const keys = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]
  if (!keys || keys.length === 0 || !keys[0].key) {
    throw new AppError('Nenhuma chave privada encontrada no PFX', 400, 'CERT_NO_KEY_FOUND')
  }

  const certPem = forge.pki.certificateToPem(certs[0].cert)
  const keyPem = forge.pki.privateKeyToPem(keys[0].key)

  return { certPem, keyPem }
}
