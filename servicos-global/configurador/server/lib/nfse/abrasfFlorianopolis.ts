// server/lib/nfse/abrasfFlorianopolis.ts
// Skeleton NfseProvider para Florianópolis via padrão ABRASF 2.03.
//
// STATUS: Esqueleto não-funcional. Implementação real bloqueada pelos seguintes pré-requisitos:
//
// 1. Inscrição Municipal ativa do Gravity em Florianópolis
//    → Gera: numero_inscricao_municipal, codigo_tributacao_municipio
//
// 2. Certificado Digital A1 do CNPJ do Gravity (Serasa/Certisign/Valid — ~R$ 200/ano)
//    → Usado para assinar o XML da NFS-e (XMLDSig)
//    → Arquivo .pfx ou .p12 com senha
//
// 3. Cadastro no portal da prefeitura (e-Nota Floripa / NFPS-e):
//    https://sistemas.pmf.sc.gov.br/nfps
//    → Configurar perfil de envio via webservice
//
// 4. Código de serviço municipal (ex: '1.05' — processamento de dados,
//    '1.07' — suporte técnico em TI, etc.) conforme lista da Lei 116/2003
//    + lista municipal de Florianópolis.
//
// 5. Teste em ambiente de homologação antes de produção.
//
// Padrão ABRASF 2.03:
//   - XML schema: http://www.abrasf.org.br/nfse.xsd
//   - Webservice SOAP com envelope SOAP 1.2
//   - Métodos: RecepcionarLoteRpsSincrono, ConsultarNfseRps, CancelarNfse
//   - Assinatura digital obrigatória (XMLDSig + canonicalização C14N)
//
// Endpoints Florianópolis:
//   Homologação: https://hom-nfps.pmf.sc.gov.br/nfps-ws/NfseWSService
//   Produção:    https://nfps.pmf.sc.gov.br/nfps-ws/NfseWSService
//
// Env vars necessárias:
//   NFSE_FLORIPA_INSCRICAO_MUNICIPAL
//   NFSE_FLORIPA_CODIGO_MUNICIPIO       (IBGE 4205407)
//   NFSE_FLORIPA_CERT_PATH              (caminho do .pfx/.p12)
//   NFSE_FLORIPA_CERT_PASSWORD
//   NFSE_FLORIPA_ENVIRONMENT            ('hom' | 'prod')
//   NFSE_FLORIPA_CODIGO_SERVICO         (ex: '1.05')
//   NFSE_FLORIPA_ALIQUOTA_ISS           (ex: '2.5')
//
// Alternativa pragmática: em vez de implementar ABRASF direto, usar um agregador
// (NFe.io, eNotas, TecnoSpeed, Focus NFe) que abstrai todas as prefeituras.
// O custo é ~R$ 0,50–1,00 por nota, mas evita manter 1 integração por cidade.

import type {
  EmitNfseParams,
  NfseProvider,
  NfseProviderName,
  NfseResult,
} from './types.js'

export class AbrasfFlorianopolisProvider implements NfseProvider {
  readonly name: NfseProviderName = 'abrasf_florianopolis'

  async isAvailable(): Promise<boolean> {
    const required = [
      'NFSE_FLORIPA_INSCRICAO_MUNICIPAL',
      'NFSE_FLORIPA_CERT_PATH',
      'NFSE_FLORIPA_CERT_PASSWORD',
      'NFSE_FLORIPA_CODIGO_SERVICO',
    ] as const
    return required.every(key => !!process.env[key])
  }

  async emit(_params: EmitNfseParams): Promise<NfseResult> {
    throw new Error(
      'AbrasfFlorianopolisProvider.emit não implementado. Ver server/lib/nfse/abrasfFlorianopolis.ts para checklist de ativação.',
    )
  }

  async getStatus(_id: string): Promise<NfseResult | null> {
    throw new Error('AbrasfFlorianopolisProvider.getStatus não implementado')
  }

  async cancel(_id: string, _reason: string): Promise<NfseResult> {
    throw new Error('AbrasfFlorianopolisProvider.cancel não implementado')
  }
}
