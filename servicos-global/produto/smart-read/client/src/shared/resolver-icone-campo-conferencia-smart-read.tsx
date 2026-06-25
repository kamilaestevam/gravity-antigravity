/**
 * Ícones de campo Smart Read — paridade visual com DadosTecnicos (Processo).
 * Regras por caminho legado DATI; fallback heurístico no padrão dt-row-icon.
 */

import type { ReactNode } from 'react'
import {
  AirplaneTakeoff,
  Anchor,
  ArrowsLeftRight,
  Barcode,
  Boat,
  Briefcase,
  Buildings,
  Certificate,
  ChatText,
  Circle,
  Cube,
  CubeFocus,
  CurrencyDollar,
  EnvelopeSimple,
  FileText,
  Globe,
  Hash,
  IdentificationBadge,
  IdentificationCard,
  ListChecks,
  MapPin,
  Package,
  Phone,
  Resize,
  Scales,
  ShieldCheck,
  Stack,
  TrafficSign,
  User,
  UserCircle,
  Warehouse,
} from '@phosphor-icons/react'

const TAMANHO = 14

type IconePhosphor = typeof Hash

function iconePadrao(Icon: IconePhosphor): ReactNode {
  return <Icon size={TAMANHO} aria-hidden />
}

type RegraIcone = { match: RegExp; icone: ReactNode }

/** Regras específicas — ordem importa (mais específico primeiro). */
const REGRAS_EXATAS: RegraIcone[] = [
  { match: /^isSigned$/i, icone: iconePadrao(Certificate) },
  { match: /^observations$/i, icone: iconePadrao(ChatText) },
  { match: /^handlingInformation$/i, icone: iconePadrao(ChatText) },
  { match: /document\.(type|documentType)$/i, icone: iconePadrao(FileText) },
  { match: /document\.(number|documentNumber|billOfLadingNumber|masterBillOfLadingNumber|bookingReference)$/i, icone: iconePadrao(Hash) },
  { match: /document\.(date|documentDate|shippedOnBoardDate)$/i, icone: iconePadrao(Certificate) },
  { match: /document\.incoterm/i, icone: iconePadrao(Globe) },
  { match: /document\.(originCountry|countryOfAcquisition|countryOfProvenance)/i, icone: iconePadrao(Globe) },
  { match: /awbInfo\.(mawbNumber|hawbNumber)$/i, icone: iconePadrao(Hash) },
  { match: /awbInfo\.awbDate$/i, icone: iconePadrao(Certificate) },
  { match: /awbInfo\.shippedOnBoardDate$/i, icone: iconePadrao(Certificate) },
  { match: /awbInfo\.flight\.flightNumber$/i, icone: iconePadrao(AirplaneTakeoff) },
  { match: /awbInfo\.flight\.flightDate$/i, icone: iconePadrao(Certificate) },
  { match: /route\.(originAirport|destinationAirport)$/i, icone: iconePadrao(AirplaneTakeoff) },
  { match: /cargoAgent\.iataCode$/i, icone: iconePadrao(Hash) },
  { match: /cargoAgent\.accountingInfo$/i, icone: iconePadrao(ChatText) },
  { match: /shipment\.(vessel_name|vesselName)$/i, icone: iconePadrao(Boat) },
  { match: /shipment\.voyage_number$/i, icone: iconePadrao(Hash) },
  { match: /shipment\.(port_of_origin|port_of_destination|ports\.(origin|destination|loading|discharge))$/i, icone: iconePadrao(Anchor) },
  { match: /shipment\.modal$|shipmentDetails\.transportMode$/i, icone: iconePadrao(AirplaneTakeoff) },
  { match: /goods\.(ncm_code|ncm)$/i, icone: iconePadrao(Barcode) },
  { match: /goods\.hs_code$|\.hsCode$/i, icone: iconePadrao(Barcode) },
  { match: /containerNumbers$/i, icone: iconePadrao(Barcode) },
  { match: /container_number$/i, icone: iconePadrao(Barcode) },
  { match: /container_type$/i, icone: iconePadrao(Cube) },
  { match: /container_seal$/i, icone: iconePadrao(ShieldCheck) },
  { match: /container_tare$/i, icone: iconePadrao(Scales) },
  { match: /container_gross_weight$|container_net_weight$/i, icone: iconePadrao(Scales) },
  { match: /container_volume$/i, icone: iconePadrao(CubeFocus) },
  { match: /dangerous_goods/i, icone: iconePadrao(TrafficSign) },
  { match: /payment\.(terms|method)$/i, icone: iconePadrao(CurrencyDollar) },
  { match: /currency\.(type|exchangeRate)$/i, icone: iconePadrao(CurrencyDollar) },
  { match: /bankingDetails\.(bankName|iban|swift)$/i, icone: iconePadrao(CurrencyDollar) },
  { match: /charges\..*\.(currency|rate|paymentType|totalFreightAmount|basicFreightAmount|totalAmountToCollect|destinationCharges|currencyConversionRates|agentOtherCharges|freightTax|declaredValueFee|airlineOtherCharges)$/i, icone: iconePadrao(CurrencyDollar) },
  { match: /declaredValues\.(transportValue|customsValue)$/i, icone: iconePadrao(CurrencyDollar) },
  { match: /shipment\.costs\.(freight|insurance)$/i, icone: iconePadrao(CurrencyDollar) },
  { match: /totals\./i, icone: iconePadrao(CurrencyDollar) },
  { match: /packageSummary\.commercialUnit$/i, icone: iconePadrao(Resize) },
  { match: /packageSummary\.totalPackages$|shipmentDetails\.totalPackages$|goods\.total_packages$/i, icone: iconePadrao(ListChecks) },
  { match: /(totalGrossWeight|total_gross_weight|gross_weight|peso_bruto)/i, icone: iconePadrao(Stack) },
  { match: /(totalNetWeight|total_net_weight|net_weight|peso_liquido)/i, icone: iconePadrao(Package) },
  { match: /(totalCubedWeight|total_shipment_volume|volume)$/i, icone: iconePadrao(CubeFocus) },
  { match: /items_quantity$|\.quantity$/i, icone: iconePadrao(ListChecks) },
  { match: /items\[\]\.description$|productDescription$/i, icone: iconePadrao(FileText) },
  { match: /carrier\.name$/i, icone: iconePadrao(Buildings) },
  { match: /(exporter|importer|shipper|consignee|notify_party|cargoAgent|issuer)\.name$/i, icone: iconePadrao(Buildings) },
  { match: /additionalFields\./i, icone: iconePadrao(IdentificationCard) },
]

/** Regras por sufixo / segmento — aplicadas após regras exatas. */
const REGRAS_SUFIXO: RegraIcone[] = [
  { match: /\.email$/i, icone: iconePadrao(EnvelopeSimple) },
  { match: /\.phone$/i, icone: iconePadrao(Phone) },
  { match: /\.address$/i, icone: iconePadrao(MapPin) },
  { match: /\.city$/i, icone: iconePadrao(MapPin) },
  { match: /\.(state|state_province)$/i, icone: iconePadrao(MapPin) },
  { match: /\.zipCode$|\.zip_code$/i, icone: iconePadrao(Hash) },
  { match: /\.cnpj$|\.taxId$/i, icone: iconePadrao(IdentificationBadge) },
  { match: /\.country$/i, icone: iconePadrao(Globe) },
  { match: /Date$|_date$|\.date$/i, icone: iconePadrao(Certificate) },
  { match: /Number$|_number$|numero/i, icone: iconePadrao(Hash) },
  { match: /Reference$|referencia/i, icone: iconePadrao(IdentificationCard) },
  { match: /port/i, icone: iconePadrao(Anchor) },
  { match: /airport/i, icone: iconePadrao(AirplaneTakeoff) },
  { match: /weight/i, icone: iconePadrao(Scales) },
  { match: /volume/i, icone: iconePadrao(CubeFocus) },
  { match: /currency|amount|freight|cost|total|rate|payment|valor|taxa|tarifa/i, icone: iconePadrao(CurrencyDollar) },
  { match: /description|observ|info|remarks|notes/i, icone: iconePadrao(ChatText) },
  { match: /incoterm/i, icone: iconePadrao(Globe) },
  { match: /warehouse|recinto/i, icone: iconePadrao(Warehouse) },
  { match: /transbordo|tranship/i, icone: iconePadrao(ArrowsLeftRight) },
  { match: /container/i, icone: iconePadrao(Cube) },
  { match: /packaging|package|volume|embalagem/i, icone: iconePadrao(Package) },
  { match: /ncm|hsCode|hs_code|barcode/i, icone: iconePadrao(Barcode) },
  { match: /vessel|navio|boat/i, icone: iconePadrao(Boat) },
  { match: /flight|voo|awb/i, icone: iconePadrao(AirplaneTakeoff) },
  { match: /document|tipo_documento|bl_|awb|invoice/i, icone: iconePadrao(FileText) },
  { match: /responsavel_reg/i, icone: iconePadrao(User) },
  { match: /auxiliar/i, icone: iconePadrao(UserCircle) },
  { match: /responsavel|shipper|consignee|notify/i, icone: iconePadrao(User) },
  { match: /despachante|agente|carrier|transportadora/i, icone: iconePadrao(Briefcase) },
  { match: /\.name$/i, icone: iconePadrao(Buildings) },
]

function iconeCampoAdicional(caminho: string): ReactNode {
  const rotulo = caminho.replace(/^additionalFields\./i, '').toLowerCase()
  if (/cnpj|tax|nif|documento/.test(rotulo)) return iconePadrao(IdentificationBadge)
  if (/email|e-mail/.test(rotulo)) return iconePadrao(EnvelopeSimple)
  if (/telefone|phone|fax/.test(rotulo)) return iconePadrao(Phone)
  if (/numero|nº|referencia|referência|booking|bl|awb|invoice/.test(rotulo)) return iconePadrao(Hash)
  if (/agente|despachante|transportador/.test(rotulo)) return iconePadrao(Briefcase)
  if (/taxa|valor|frete|total|moeda|amount|rate/.test(rotulo)) return iconePadrao(CurrencyDollar)
  if (/data|date/.test(rotulo)) return iconePadrao(Certificate)
  if (/endereco|endereço|cidade|pais|país|porto|local/.test(rotulo)) return iconePadrao(MapPin)
  if (/observ|info|nota|remark/.test(rotulo)) return iconePadrao(ChatText)
  return iconePadrao(IdentificationCard)
}

export function resolverIconeCampoConferenciaSmartRead(chave: string): ReactNode {
  const caminho = chave.trim()
  if (!caminho) return iconePadrao(Circle)

  if (/^additionalFields\./i.test(caminho)) {
    return iconeCampoAdicional(caminho)
  }

  for (const regra of REGRAS_EXATAS) {
    if (regra.match.test(caminho)) return regra.icone
  }

  for (const regra of REGRAS_SUFIXO) {
    if (regra.match.test(caminho)) return regra.icone
  }

  return iconePadrao(FileText)
}
