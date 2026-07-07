import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import {
  calcularTotalInvoice,
  formatarMoeda,
  gerarItensInvoiceSimulador,
  type DocumentoSimulador,
} from './documentos-preview-simulador-smart-doc'

export type ContextoQaSimulador = {
  arquivos: ArquivoDemoSimulador[]
  documentoAtual: DocumentoSimulador | null
  tituloContexto: string
}

export type RespostaQaSimulador = {
  resposta: string
  aviso?: string | null
}

const RESPOSTAS_POR_TEXTO: Record<string, (ctx: ContextoQaSimulador) => string> = {
  'Relatório comparativo dos documentos': (ctx) => {
    const docs = ctx.arquivos.flatMap((a) => a.documentosIdentificados)
    const invoice = docs.find((d) => d.tipo === 'invoice')
    const packing = docs.find((d) => d.tipo === 'packing-list')
    const bol = docs.find((d) => d.tipo === 'bill-of-lading')
    const totalInvoice = invoice
      ? formatarMoeda(calcularTotalInvoice(gerarItensInvoiceSimulador(invoice.quantidadeItens)))
      : '—'
    return `## Comparativo entre documentos

Analisei **${docs.length} documentos** desta leitura com foco em consistência operacional.

### Valores e volumes
- **Invoice** (${invoice?.rotulo ?? 'n/d'}): total FOB **USD ${totalInvoice}**, 100 linhas de mercadoria
- **Packing List** (${packing?.rotulo ?? 'n/d'}): 10 linhas, pesos alinhados com a invoice nos itens 1–10
- **Bill of Lading** (${bol?.rotulo ?? 'n/d'}): 10 containers, volumes compatíveis com o packing

### Pontos de atenção
- Peso líquido geral da invoice está **vazio** — conferir antes do fechamento
- Item 12 da invoice sem descrição completa no campo Net Weight

### Conclusão
A operação está **97% consistente** entre documentos. Recomendo validar os dois campos vazios na aba Conferência de Campos.`
  },

  'Resumo dos dados do exportador': () => `## Exportador

**Shenzhen Valve Industries Co., Ltd.**
- Endereço: No. 88 Nanshan Tech Park, Shenzhen, Guangdong, China
- Tax ID: 91440300MA5F2K8L3X
- Contato: export@szvalve.com · +86 755 2888 4200

O exportador aparece de forma **idêntica** na Invoice e no Packing List. No B/L consta como *Shipper* com o mesmo endereço abreviado — padrão usual em embarques marítimos.`,

  'Informações faltando nos documentos': () => `## Campos pendentes

Identifiquei **2 campos vazios** na leitura atual:

1. **Net Weight (geral)** — Invoice, seção Mercadoria
2. **Net Weight** — Invoice, Item 12

Demais seções (Exportador, Importador, Valores declarados, 98 itens restantes) estão preenchidas.

*Sugestão:* use o filtro **Vazios** no progresso da conferência para localizar rapidamente.`,

  'Dados do Importador/consignatário': () => `## Importador / Consignatário

**Gravity Comex Importação Ltda.**
- CNPJ: 12.345.678/0001-90
- Endereço: Av. das Nações 1200, Santos — SP, Brasil
- Notify party: Gravity Comex — mesmo endereço

Dados **coerentes** entre Invoice, Packing e B/L. Consignee no conhecimento de embarque coincide com o importador da invoice.`,

  'Campos em conflito entre documentos': () => `## Conflitos detectados

Não há divergências críticas entre documentos nesta leitura.

| Campo | Invoice | Packing | B/L | Status |
| --- | --- | --- | --- | --- |
| Quantidade total (itens 1–10) | 2.450 UN | 2.450 UN | — | OK |
| Porto destino | Santos | — | Santos | OK |
| Incoterm | FOB Shenzhen | — | — | Informativo |

Única ressalva: **peso líquido geral** ausente na invoice — não é conflito, mas exige complemento.`,

  'Valores totais de cada documento': (ctx) => {
    const invoice = ctx.arquivos
      .flatMap((a) => a.documentosIdentificados)
      .find((d) => d.tipo === 'invoice')
    const total = invoice
      ? formatarMoeda(calcularTotalInvoice(gerarItensInvoiceSimulador(invoice.quantidadeItens)))
      : '128.450,75'
    return `## Valores por documento

- **Invoice #INV-9821:** USD **${total}** (FOB Shenzhen)
- **Packing List:** sem valor comercial — apenas pesos e volumes
- **Bill of Lading:** frete collect — USD 4.820,00 (campo Freight)

O valor aduaneiro de referência deve considerar o total da invoice + ajustes de frete/seguro conforme Incoterm **FOB**.`
  },

  'Comparar datas entre documentos': () => `## Linha do tempo

| Evento | Data | Documento |
| --- | --- | --- |
| Emissão invoice | 14/03/2026 | Invoice |
| Embarque estimado | 22/03/2026 | B/L |
| ETA Santos | 18/04/2026 | B/L |

Todas as datas estão em **ordem cronológica válida**. Prazo de trânsito: ~27 dias — típico para Shenzhen → Santos.`,

  'Resumo geral da operação': (ctx) => `## Resumo da operação

**${ctx.tituloContexto || 'Leitura COMEX demo'}**

Importação de **válvulas e componentes industriais** (NCM 8481.xx) da China para o Brasil.

- **3 arquivos** processados · **3 documentos** identificados
- **~1.051 campos** extraídos · **99,8%** preenchidos
- **2 alertas** de conferência (campos vazios)
- Riscos: mix de atenção e informativos — ver aba Análise de Riscos

Operação madura, típica de cliente com ~1.000 leituras/mês. Próximo passo sugerido: completar pesos pendentes e exportar resultado.`,
}

function normalizarPergunta(texto: string): string {
  return texto.trim().toLowerCase()
}

export function resolverRespostaQaSimulador(
  pergunta: string,
  contexto: ContextoQaSimulador,
): RespostaQaSimulador {
  const limpo = pergunta.trim()
  if (!limpo) {
    return { resposta: 'Digite uma pergunta sobre os documentos desta leitura.' }
  }

  for (const [textoSugestao, gerar] of Object.entries(RESPOSTAS_POR_TEXTO)) {
    if (normalizarPergunta(limpo) === normalizarPergunta(textoSugestao)) {
      return { resposta: gerar(contexto) }
    }
  }

  const perguntaNorm = normalizarPergunta(limpo)

  if (perguntaNorm.includes('exportador')) {
    return { resposta: RESPOSTAS_POR_TEXTO['Resumo dos dados do exportador'](contexto) }
  }
  if (perguntaNorm.includes('importador') || perguntaNorm.includes('consignat')) {
    return { resposta: RESPOSTAS_POR_TEXTO['Dados do Importador/consignatário'](contexto) }
  }
  if (perguntaNorm.includes('conflit') || perguntaNorm.includes('diverg')) {
    return { resposta: RESPOSTAS_POR_TEXTO['Campos em conflito entre documentos'](contexto) }
  }
  if (perguntaNorm.includes('valor') || perguntaNorm.includes('total')) {
    return { resposta: RESPOSTAS_POR_TEXTO['Valores totais de cada documento'](contexto) }
  }
  if (perguntaNorm.includes('falt') || perguntaNorm.includes('vazio')) {
    return { resposta: RESPOSTAS_POR_TEXTO['Informações faltando nos documentos'](contexto) }
  }
  if (perguntaNorm.includes('risco')) {
    return {
      resposta: `Posso ajudar com riscos aduaneiros, mas a análise detalhada está na aba **Análise de Riscos**.

Nesta leitura há alertas de **atenção** (NCM, pesos) e itens **informativos**. Abra a aba ao lado para ver evidências e checklist completo.`,
    }
  }

  return {
    resposta: `Com base nos documentos de **${contexto.tituloContexto || 'esta leitura'}**, posso detalhar exportador, importador, valores, datas e pendências.

Experimente os atalhos abaixo ou pergunte de forma específica — por exemplo: *"Quais campos estão vazios?"* ou *"Resumo da operação"*.`,
    aviso: 'Demonstração na landing — respostas simuladas com dados da leitura demo.',
  }
}

export const ATRASO_RESPOSTA_QA_MS = 900
