/**
 * Resolve destinatários de disparo BID a partir do Cadastros (SSOT contatos).
 * Espelho BID mantém e-mail principal; demais contatos vêm de fornecedor_contato ao vivo.
 */

export type ContatoCadastrosDisparo = {
  tipo_canal_fornecedor_contato: 'EMAIL' | 'WHATSAPP' | 'TELEFONE'
  valor_fornecedor_contato: string
  principal_fornecedor_contato: boolean
  ordem_fornecedor_contato: number
}

export type FornecedorCadastrosDisparo = {
  email_fornecedor?: string | null
  whatsapp_fornecedor?: string | null
  contatos_fornecedor?: ContatoCadastrosDisparo[]
}

export type FornecedorEspelhoBidDisparo = {
  id_fornecedor_bid_frete_internacional: string
  nome_fornecedor_bid_frete_internacional?: string
  email_fornecedor_bid_frete_internacional?: string
  whatsapp_fornecedor_bid_frete_internacional?: string | null
}

function ordenarContatosCanal(contatos: ContatoCadastrosDisparo[]): string[] {
  const vistos = new Set<string>()
  const ordenados: string[] = []
  for (const c of [...contatos].sort((a, b) => {
    if (a.principal_fornecedor_contato !== b.principal_fornecedor_contato) {
      return a.principal_fornecedor_contato ? -1 : 1
    }
    return a.ordem_fornecedor_contato - b.ordem_fornecedor_contato
  })) {
    const valor = c.valor_fornecedor_contato.trim()
    const chave = valor.toLowerCase()
    if (!valor || vistos.has(chave)) continue
    vistos.add(chave)
    ordenados.push(valor)
  }
  return ordenados
}

function emailValidoDisparoBidFrete(email: string): boolean {
  const normalizado = email.trim().toLowerCase()
  return normalizado.length > 0 && !normalizado.endsWith('@interno.gravity.local')
}

function filtrarEmailsValidosDisparo(emails: string[]): string[] {
  return emails.filter(emailValidoDisparoBidFrete)
}

export function resolverEmailsDisparoBidFrete(
  espelho: FornecedorEspelhoBidDisparo,
  cadastros: FornecedorCadastrosDisparo | null | undefined,
): string[] {
  const contatosEmail = (cadastros?.contatos_fornecedor ?? []).filter(
    (c) => c.tipo_canal_fornecedor_contato === 'EMAIL',
  )
  if (contatosEmail.length > 0) {
    return filtrarEmailsValidosDisparo(ordenarContatosCanal(contatosEmail).map((e) => e.toLowerCase()))
  }
  const legadoCadastros = cadastros?.email_fornecedor?.trim()
  if (legadoCadastros && emailValidoDisparoBidFrete(legadoCadastros)) {
    return [legadoCadastros.toLowerCase()]
  }
  const legadoBid = espelho.email_fornecedor_bid_frete_internacional?.trim()
  if (legadoBid && emailValidoDisparoBidFrete(legadoBid)) {
    return [legadoBid.toLowerCase()]
  }
  return []
}

export function resolverWhatsappsDisparoBidFrete(
  espelho: FornecedorEspelhoBidDisparo,
  cadastros: FornecedorCadastrosDisparo | null | undefined,
): string[] {
  const contatosWa = (cadastros?.contatos_fornecedor ?? []).filter(
    (c) => c.tipo_canal_fornecedor_contato === 'WHATSAPP',
  )
  if (contatosWa.length > 0) {
    return ordenarContatosCanal(contatosWa)
  }
  const legadoCadastros = cadastros?.whatsapp_fornecedor?.trim()
  if (legadoCadastros) return [legadoCadastros]
  const legadoBid = espelho.whatsapp_fornecedor_bid_frete_internacional?.trim()
  if (legadoBid) return [legadoBid]
  return []
}
