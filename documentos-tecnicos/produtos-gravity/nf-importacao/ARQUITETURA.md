# Arquitetura Tecnica — NF Importacao (Nota Fiscal de Entrada para Importacao)

> **Versao:** 1.0
> **Data:** 30/03/2026
> **Elaborado por:** Tech Lead — Dream Team de Produtos

---

## 1. PRODUCT_CONFIG

```typescript
export const PRODUCT_CONFIG = {
  id: 'nf-importacao',
  name: 'NF Importacao',
  description: 'Composicao inteligente de NF de Entrada para importacoes',
  icon: 'Receipt',
  color: '#F59E0B',    // amber-500 — financeiro/fiscal
  basePath: '/nf-importacao',
  serverPort: 8028,
  tenantServices: ['email', 'notifications', 'history', 'dashboard'],
  productServices: [],
  navigation: [
    { label: 'NFs Importacao', path: '/nf-importacao', icon: 'Receipt', permission: 'nf-importacao:read' },
    { label: 'Nova NF', path: '/nf-importacao/nova', icon: 'Plus', permission: 'nf-importacao:create' },
    { label: 'Configuracoes', path: '/nf-importacao/configuracoes', icon: 'Settings', permission: 'nf-importacao:config' },
  ],
}
```

---

## 2. Estrutura de Pastas

```
produto/nf-importacao/
├── package.json                    (workspaces: ["client", "server"])
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts              (port: 5183)
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── pages/
│       │   ├── NfLista/
│       │   │   ├── NfLista.tsx              # T-01: Grid de NFs
│       │   │   └── NfLista.css
│       │   ├── NfNova/
│       │   │   ├── NfNovaOrigem.tsx         # T-00: Step 0 — origem da DUIMP
│       │   │   ├── NfNovaDuimp.tsx          # T-02: Step 1 — dados da DUIMP
│       │   │   ├── NfNovaDespesas.tsx       # T-03: Step 2 — despesas
│       │   │   ├── NfNovaRateio.tsx         # T-04: Step 3 — rateio (preview)
│       │   │   ├── NfNovaFiscal.tsx         # T-05: Step 4 — CFOP + CSTs
│       │   │   ├── NfNovaExportacao.tsx     # T-06: Step 5 — formato + download
│       │   │   ├── NfSmartReadDuimp.tsx     # Canal: upload PDF → OCR+IA
│       │   │   └── NfNova.css
│       │   ├── NfDetalhe/
│       │   │   ├── NfDetalhe.tsx            # T-08: Container com abas
│       │   │   ├── NfItens.tsx              # T-09: Aba itens
│       │   │   ├── NfDespesas.tsx           # T-10: Aba despesas
│       │   │   ├── NfRateio.tsx             # T-11: Aba rateio (read-only)
│       │   │   ├── NfFiscal.tsx             # T-12: Aba fiscal
│       │   │   ├── NfExportacao.tsx         # T-13: Aba exportacao
│       │   │   ├── NfHistorico.tsx          # T-14: Aba historico
│       │   │   └── NfDetalhe.css
│       │   └── NfConfiguracoes/
│       │       ├── DespesaCatalogo.tsx      # T-15: CRUD de despesas
│       │       ├── DespesaTemplate.tsx      # T-16: Templates de despesas
│       │       ├── ExportLayoutBuilder.tsx  # T-17: Construtor de layout
│       │       ├── FavoritosFiscais.tsx     # T-18: Presets CFOP+CSTs
│       │       ├── CredenciaisPortalUnico.tsx # T-19: Cert digital / token
│       │       └── NfConfiguracoes.css
│       └── shared/
│           ├── config.ts                     # PRODUCT_CONFIG
│           ├── api.ts                        # REST client
│           ├── types.ts                      # Tipos do dominio
│           ├── constants.ts                  # Metodos de rateio, status, etc.
│           └── rateioCalculator.ts           # Calculo de rateio no frontend (preview)
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.ts                          # Express + 11 middlewares
│       ├── routes/
│       │   ├── nfImportacao.ts               # CRUD de NFs
│       │   ├── nfImportacaoItem.ts           # CRUD de itens
│       │   ├── nfImportacaoDespesa.ts        # CRUD de despesas + Smart Read
│       │   ├── nfImportacaoRateio.ts         # Preview + aplicar rateio
│       │   ├── nfImportacaoExportar.ts       # Gerar arquivo
│       │   ├── nfImportacaoHistorico.ts      # Timeline (read-only)
│       │   ├── nfImportacaoImportar.ts       # Canais de entrada (XML, PDF, Portal)
│       │   ├── despesaCatalogo.ts            # CRUD catalogo de despesas
│       │   ├── despesaTemplate.ts            # CRUD templates de despesas
│       │   ├── exportLayout.ts               # CRUD layouts de exportacao
│       │   └── favoritoFiscal.ts             # CRUD favoritos fiscais
│       ├── middleware/
│       │   ├── requireInternalKey.ts
│       │   └── tenantIsolation.ts
│       ├── services/
│       │   ├── nfImportacaoStatusEngine.ts   # Maquina de estados
│       │   ├── rateioEngine.ts               # Motor de rateio (9 metodos)
│       │   ├── exportEngine.ts               # Motor de exportacao multi-formato
│       │   ├── duimpXmlParser.ts             # Parser de XML da DUIMP
│       │   ├── despesaSmartReadService.ts    # Smart Read de recibos
│       │   ├── duimpSmartReadService.ts      # Smart Read de PDF da DUIMP
│       │   ├── favoritoFiscalService.ts      # Aplicar favoritos automaticamente
│       │   └── nfImportacaoImportService.ts  # Import de planilha (Excel/CSV)
│       ├── connectors/
│       │   ├── portalUnicoAdapter.ts         # Adapter: consulta DUIMP
│       │   ├── portalUnicoAuth.ts            # Strategy: cert digital vs token
│       │   ├── portalUnicoTypes.ts           # Tipos da API Portal Unico
│       │   └── processoConnector.ts          # Busca dados do Processo Gravity
│       ├── validators/
│       │   ├── nfImportacaoSchema.ts         # Zod schemas
│       │   ├── nfItemSchema.ts
│       │   ├── nfDespesaSchema.ts
│       │   ├── rateioSchema.ts
│       │   ├── exportLayoutSchema.ts
│       │   └── favoritoFiscalSchema.ts
│       └── lib/
│           ├── idGenerator.ts                # IDs corporativos
│           ├── rateioAlgorithms.ts           # Implementacao dos 9 metodos
│           ├── centavoRestante.ts            # Algoritmo de arredondamento
│           ├── exportFormatters/
│           │   ├── xmlFormatter.ts           # Gera XML
│           │   ├── txtFormatter.ts           # Gera TXT (posicao fixa/delimitado)
│           │   ├── excelFormatter.ts         # Gera .xlsx
│           │   ├── jsonFormatter.ts          # Gera JSON
│           │   └── pdfFormatter.ts           # Gera PDF (espelho NF)
│           └── cryptoUtils.ts                # AES-256-GCM (credenciais)
│   └── prisma/
│       ├── schema.base.prisma
│       ├── fragment.prisma
│       └── schema.prisma                     # GERADO (gitignore)
└── scripts/
    └── compose-schema.ts
```

---

## 3. Prisma Schema (fragment.prisma)

```prisma
// ============================================
// NF IMPORTACAO — Nota Fiscal de Entrada
// ============================================

model NfImportacao {
  id                    String    @id                     // nfim_id_XXXXXXX/YY
  tenant_id             String
  company_id            String
  product_id            String    @default("nf-importacao")

  // Referencia a DUIMP
  duimp_numero          String?                           // Numero da DUIMP
  duimp_data_registro   DateTime?                         // Data de registro da DUIMP
  processo_id           String?                           // Ref ao Processo Gravity (se vinculado)

  // Dados gerais
  tipo_operacao         String    @default("IMPORTACAO")  // IMPORTACAO (por ora so import)
  uf_destino            String                            // UF de destino da mercadoria
  local_desembaraco     String?                           // Recinto/porto de desembaraco
  via_transporte        String?                           // MARITIMA | AEREA | RODOVIARIA | etc
  moeda_negociada       String    @default("USD")         // ISO 4217

  // Totais calculados
  total_fob             Decimal   @db.Decimal(18, 2)
  total_frete           Decimal   @db.Decimal(18, 2)
  total_seguro          Decimal   @db.Decimal(18, 2)
  total_cif             Decimal   @db.Decimal(18, 2)      // FOB + Frete + Seguro
  total_ii              Decimal   @db.Decimal(18, 2)
  total_ipi             Decimal   @db.Decimal(18, 2)
  total_pis             Decimal   @db.Decimal(18, 2)
  total_cofins          Decimal   @db.Decimal(18, 2)
  total_icms            Decimal   @db.Decimal(18, 2)
  total_despesas        Decimal   @db.Decimal(18, 2)      // Soma de todas as despesas
  total_nf              Decimal   @db.Decimal(18, 2)      // CIF + impostos + despesas

  // Canal de entrada
  canal_entrada         String    @default("MANUAL")      // MANUAL|XML|SMART_READ|PORTAL_UNICO|ERP|PROCESSO

  // Configuracao de precisao
  casas_decimais_valor  Int       @default(2)
  casas_decimais_qtd    Int       @default(4)

  // Status e datas
  status                String    @default("rascunho")    // NfImportacaoStatus
  data_exportacao       DateTime?                         // Quando foi exportada
  formato_exportado     String?                           // Ultimo formato usado

  // Metadados
  created_by            String
  updated_by            String?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relacoes
  itens                 NfImportacaoItem[]
  despesas              NfImportacaoDespesa[]
  documentos            NfImportacaoDocumento[]
  historico             NfImportacaoHistorico[]

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, company_id])
  @@index([tenant_id, company_id, status])
  @@index([duimp_numero])
  @@index([processo_id])
}

// ============================================
// ITEM DA NF — Cada item/adicao da DUIMP
// ============================================

model NfImportacaoItem {
  id                    String    @id                     // nfit_id_XXXXXXX/YY
  tenant_id             String
  company_id            String
  nf_importacao_id      String
  numero_adicao         Int?                              // Numero da adicao na DUIMP

  // Produto
  ncm                   String                            // 8 digitos
  descricao             String
  fabricante            String?
  pais_origem           String?                           // ISO 3166-1 alpha-2

  // Quantidades
  quantidade_estatistica  Decimal   @db.Decimal(18, 4)
  unidade_medida          String
  quantidade_comercial    Decimal?  @db.Decimal(18, 4)
  unidade_medida_comercial String?
  peso_liquido            Decimal   @db.Decimal(18, 4)
  peso_bruto              Decimal?  @db.Decimal(18, 4)

  // Valores da DUIMP
  valor_fob               Decimal   @db.Decimal(18, 2)
  valor_frete             Decimal   @db.Decimal(18, 2)    @default(0)
  valor_seguro            Decimal   @db.Decimal(18, 2)    @default(0)
  valor_cif               Decimal   @db.Decimal(18, 2)    // FOB + Frete + Seguro

  // Impostos (vindos da DUIMP ou calculados)
  ii_aliquota             Decimal   @db.Decimal(8, 4)
  ii_valor                Decimal   @db.Decimal(18, 2)
  ipi_aliquota            Decimal   @db.Decimal(8, 4)
  ipi_valor               Decimal   @db.Decimal(18, 2)
  pis_aliquota            Decimal   @db.Decimal(8, 4)
  pis_valor               Decimal   @db.Decimal(18, 2)
  cofins_aliquota         Decimal   @db.Decimal(8, 4)
  cofins_valor            Decimal   @db.Decimal(18, 2)
  icms_aliquota           Decimal   @db.Decimal(8, 4)
  icms_valor              Decimal   @db.Decimal(18, 2)
  icms_base               Decimal?  @db.Decimal(18, 2)

  // Classificacao fiscal (favorito ou manual)
  cfop                    String?                         // 3.101, 3.102, 3.949, etc.
  cst_icms                String?                         // 00, 10, 20, 40, 41, 60, etc.
  cst_ipi                 String?                         // 00-05, 49-51, 99
  cst_pis                 String?                         // 50-56, 60-66, 70-75
  cst_cofins              String?                         // 50-56, 60-66, 70-75

  // Beneficio fiscal (override)
  beneficio_fiscal        String?                         // TTD, FUNDAP, ZFM, EX_TARIFARIO
  beneficio_descricao     String?

  // Total do item (CIF + impostos + despesas rateadas)
  total_despesas_rateadas Decimal   @db.Decimal(18, 2)    @default(0)
  total_item              Decimal   @db.Decimal(18, 2)

  // Metadados
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relacoes
  nf_importacao         NfImportacao @relation(fields: [nf_importacao_id], references: [id])
  rateios               NfImportacaoRateio[]

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([nf_importacao_id])
  @@index([ncm])
}

// ============================================
// DESPESA — Cada despesa adicionada a NF
// ============================================

model NfImportacaoDespesa {
  id                    String    @id                     // nfdp_id_XXXXXXX/YY
  tenant_id             String
  company_id            String
  nf_importacao_id      String

  // Despesa
  catalogo_despesa_id   String?                           // Ref ao catalogo (se veio de la)
  nome                  String                            // Nome livre (ex: "Capatazia")
  descricao             String?
  valor_total           Decimal   @db.Decimal(18, 2)      // Valor total a ser rateado
  cnpj_prestador        String?                           // CNPJ de quem cobrou
  data_despesa          DateTime?                         // Data do recibo/nota

  // Rateio
  metodo_rateio         String    @default("VALOR_CIF")   // Metodo de rateio desta despesa
  formula_customizada   String?                           // Se metodo = CUSTOMIZADO

  // Origem
  origem                String    @default("MANUAL")      // MANUAL | TEMPLATE | SMART_READ | PLANILHA
  documento_id          String?                           // Ref ao documento comprobatorio

  // Conta contabil (para integracao ERP)
  conta_contabil        String?
  centro_custo          String?

  // Metadados
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relacoes
  nf_importacao         NfImportacao @relation(fields: [nf_importacao_id], references: [id])
  rateios               NfImportacaoRateio[]

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([nf_importacao_id])
}

// ============================================
// RATEIO — Resultado: despesa × item = valor
// ============================================

model NfImportacaoRateio {
  id                    String    @id                     // nfrt_id_XXXXXXX/YY
  tenant_id             String
  company_id            String

  despesa_id            String
  item_id               String

  // Resultado do rateio
  valor_rateado         Decimal   @db.Decimal(18, 2)
  percentual_rateio     Decimal   @db.Decimal(8, 4)       // % que este item representa
  metodo_usado          String                            // Metodo usado neste calculo
  is_override_manual    Boolean   @default(false)         // Se usuario ajustou manualmente
  is_centavo_restante   Boolean   @default(false)         // Se e o item que absorveu diferenca

  // Metadados
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relacoes
  despesa               NfImportacaoDespesa @relation(fields: [despesa_id], references: [id])
  item                  NfImportacaoItem    @relation(fields: [item_id], references: [id])

  @@unique([despesa_id, item_id])                         // 1 rateio por par despesa×item
  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([despesa_id])
  @@index([item_id])
}

// ============================================
// DOCUMENTO — Recibos e comprovantes
// ============================================

model NfImportacaoDocumento {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String
  nf_importacao_id      String

  tipo                  String                            // DUIMP_XML | DUIMP_PDF | RECIBO | DEMONSTRATIVO | NOTA_SERVICO | OUTRO
  nome_arquivo          String
  mime_type             String
  tamanho_bytes         Int
  storage_key           String                            // Chave no storage (S3/R2)
  descricao             String?

  // Smart Read
  smart_read_processado Boolean   @default(false)
  smart_read_resultado  Json?                             // Dados extraidos pelo Smart Read

  created_by            String
  created_at            DateTime  @default(now())

  nf_importacao         NfImportacao @relation(fields: [nf_importacao_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([nf_importacao_id])
}

// ============================================
// HISTORICO — Audit trail append-only
// ============================================

model NfImportacaoHistorico {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String
  nf_importacao_id      String

  acao                  String                            // CRIADA | DUIMP_IMPORTADA | DESPESA_ADICIONADA | RATEIO_CALCULADO | FISCAL_PREENCHIDO | EXPORTADA | DUPLICADA | CANCELADA
  descricao             String
  dados_anteriores      Json?                             // Snapshot antes da mudanca
  dados_novos           Json?                             // Snapshot depois da mudanca
  user_id               String
  user_nome             String?

  created_at            DateTime  @default(now())

  nf_importacao         NfImportacao @relation(fields: [nf_importacao_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([nf_importacao_id])
  @@index([created_at])
}

// ============================================
// CATALOGO DE DESPESAS — Por empresa
// ============================================

model DespesaCatalogo {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String

  nome                  String                            // Nome livre (ex: "Capatazia")
  descricao             String?
  metodo_rateio_padrao  String    @default("VALOR_CIF")   // Metodo padrao quando usada em NF
  conta_contabil        String?                           // Conta contabil padrao
  centro_custo          String?                           // Centro de custo padrao
  ativo                 Boolean   @default(true)

  created_by            String
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@unique([tenant_id, company_id, nome])                 // Nome unico por empresa
}

// ============================================
// TEMPLATE DE DESPESAS — Presets por empresa
// ============================================

model DespesaTemplate {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String

  nome                  String                            // Ex: "Padrao Santos", "Padrao Aeroporto"
  descricao             String?
  is_padrao             Boolean   @default(false)         // Se e o template padrao da empresa
  ativo                 Boolean   @default(true)

  itens                 DespesaTemplateItem[]

  created_by            String
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@unique([tenant_id, company_id, nome])
}

model DespesaTemplateItem {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String
  template_id           String

  catalogo_despesa_id   String?                           // Ref ao catalogo
  nome                  String                            // Nome da despesa
  valor_padrao          Decimal?  @db.Decimal(18, 2)      // Valor padrao (opcional)
  metodo_rateio         String    @default("VALOR_CIF")
  ordem                 Int       @default(0)             // Ordem de exibicao

  template              DespesaTemplate @relation(fields: [template_id], references: [id])

  @@index([tenant_id])
  @@index([template_id])
}

// ============================================
// LAYOUT DE EXPORTACAO — Formato customizado
// ============================================

model ExportLayout {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String

  nome                  String                            // Ex: "SAP Santos", "TOTVS Protheus"
  descricao             String?
  formato               String                            // TXT | CSV | XML | JSON | EXCEL
  separador             String?                           // Para TXT/CSV: "|", ";", TAB, POSICAO_FIXA
  codificacao           String    @default("UTF-8")       // UTF-8 | ISO-8859-1 | WINDOWS-1252
  has_header            Boolean   @default(true)
  has_footer            Boolean   @default(false)
  header_template       String?                           // Template do header
  footer_template       String?                           // Template do footer
  is_padrao             Boolean   @default(false)         // Layout padrao da empresa
  ativo                 Boolean   @default(true)

  campos                ExportLayoutCampo[]

  created_by            String
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@unique([tenant_id, company_id, nome])
}

model ExportLayoutCampo {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String
  layout_id             String

  // Campo de origem
  campo_origem          String                            // Ex: "item.ncm", "item.cfop", "despesa.capatazia"
  label                 String                            // Label no header
  ordem                 Int                               // Ordem da coluna

  // Formatacao
  tipo_dado             String    @default("TEXTO")       // TEXTO | NUMERO | DATA | DECIMAL
  formato               String?                           // Ex: "dd/MM/yyyy", "0.00", "00000000"
  tamanho_fixo          Int?                              // Para TXT posicao fixa
  posicao_inicio        Int?                              // Para TXT posicao fixa
  alinhamento           String    @default("ESQUERDA")    // ESQUERDA | DIREITA | CENTRO
  preenchimento         String?                           // Char de preenchimento (ex: "0", " ")
  valor_padrao          String?                           // Se campo vazio
  transformacao         String?                           // MAIUSCULO | MINUSCULO | TRIM | REMOVER_ACENTOS

  layout                ExportLayout @relation(fields: [layout_id], references: [id])

  @@index([tenant_id])
  @@index([layout_id])
  @@unique([layout_id, ordem])
}

// ============================================
// FAVORITOS FISCAIS — CFOP + CSTs por NCM
// ============================================

model FavoritoFiscal {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String

  ncm                   String                            // 8 digitos
  uf_destino            String?                           // Se variar por UF
  tipo_operacao         String    @default("IMPORTACAO")

  cfop                  String                            // 3.101, 3.102, etc.
  cst_icms              String                            // 00, 10, 20, etc.
  cst_ipi               String                            // 00, 01, 02, etc.
  cst_pis               String                            // 50, 51, etc.
  cst_cofins            String                            // 50, 51, etc.
  beneficio_fiscal      String?                           // TTD, FUNDAP, etc.

  descricao             String?                           // Nota do usuario

  created_by            String
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([tenant_id, company_id, ncm])
  @@unique([tenant_id, company_id, ncm, uf_destino, tipo_operacao])
}
```

---

## 4. Motor de Rateio — Algoritmo

### Estrutura

```typescript
interface RateioInput {
  itens: NfImportacaoItem[]
  despesas: NfImportacaoDespesa[]
}

interface RateioOutput {
  rateios: NfImportacaoRateio[]        // despesa × item × valor
  totais_por_item: Map<string, Decimal> // total de despesas por item
  totais_por_despesa: Map<string, Decimal> // validacao: deve = valor_total
  warnings: string[]                    // ex: "centavo restante aplicado em item X"
}
```

### Algoritmo por Metodo

```typescript
function calcularRateio(
  despesa: NfImportacaoDespesa,
  itens: NfImportacaoItem[],
  casas_decimais: number
): NfImportacaoRateio[] {

  const total_despesa = despesa.valor_total
  let rateios: NfImportacaoRateio[] = []

  switch (despesa.metodo_rateio) {
    case 'PESO_LIQUIDO': {
      const total_peso = sum(itens.map(i => i.peso_liquido))
      rateios = itens.map(item => ({
        percentual: item.peso_liquido / total_peso,
        valor_rateado: round(total_despesa * (item.peso_liquido / total_peso), casas_decimais)
      }))
      break
    }
    case 'VALOR_CIF': {
      const total_cif = sum(itens.map(i => i.valor_cif))
      rateios = itens.map(item => ({
        percentual: item.valor_cif / total_cif,
        valor_rateado: round(total_despesa * (item.valor_cif / total_cif), casas_decimais)
      }))
      break
    }
    // ... demais metodos seguem mesmo padrao
    case 'IGUALITARIO': {
      const valor_por_item = round(total_despesa / itens.length, casas_decimais)
      rateios = itens.map(item => ({
        percentual: 1 / itens.length,
        valor_rateado: valor_por_item
      }))
      break
    }
    case 'MANUAL': {
      // Valores informados pelo usuario — apenas validacao
      break
    }
    case 'CUSTOMIZADO': {
      // Parse da formula (ex: "0.6 * PESO_LIQUIDO + 0.4 * VALOR_CIF")
      // Executa como combinacao ponderada de metodos
      break
    }
  }

  // CENTAVO RESTANTE — Corrige arredondamento
  const soma_rateada = sum(rateios.map(r => r.valor_rateado))
  const diferenca = total_despesa - soma_rateada
  if (diferenca !== 0) {
    // Ultimo item absorve a diferenca
    rateios[rateios.length - 1].valor_rateado += diferenca
    rateios[rateios.length - 1].is_centavo_restante = true
  }

  return rateios
}
```

### Validacoes do Rateio

1. `SUM(rateios por despesa) == despesa.valor_total` (tolerancia ±0.01)
2. Nenhum `valor_rateado < 0`
3. Se `metodo = MANUAL`, `SUM(valores manuais) == despesa.valor_total`
4. Se `metodo = CUSTOMIZADO`, soma dos pesos da formula == 1.0
5. Se item tem `peso_liquido = 0` e metodo = `PESO_LIQUIDO`, fallback para `IGUALITARIO` com warning

---

## 5. Motor de Exportacao — Arquitetura

### Strategy Pattern

```typescript
interface ExportFormatter {
  format(nf: NfImportacaoCompleta, layout?: ExportLayout): Buffer
  mimeType: string
  extension: string
}

// Implementacoes
class XmlFormatter implements ExportFormatter { ... }
class TxtFormatter implements ExportFormatter { ... }
class ExcelFormatter implements ExportFormatter { ... }
class JsonFormatter implements ExportFormatter { ... }
class PdfFormatter implements ExportFormatter { ... }
```

### TXT com Posicao Fixa (SAP IDOC / TOTVS)

```typescript
// Cada campo tem posicao_inicio + tamanho_fixo
// Exemplo SAP IDOC simplificado:
// Pos 001-010: Numero da NF (right-aligned, zero-fill)
// Pos 011-024: CNPJ (14 chars, left-aligned)
// Pos 025-032: NCM (8 chars)
// Pos 033-047: Valor (15 chars, right-aligned, 2 decimais sem ponto)
```

### Campos Disponiveis para Layout

```typescript
const CAMPOS_DISPONIVEIS = [
  // NF Header
  { id: 'nf.id', label: 'ID da NF', tipo: 'TEXTO' },
  { id: 'nf.duimp_numero', label: 'Numero DUIMP', tipo: 'TEXTO' },
  { id: 'nf.uf_destino', label: 'UF Destino', tipo: 'TEXTO' },
  { id: 'nf.total_nf', label: 'Total NF', tipo: 'DECIMAL' },
  // ... mais campos de header

  // Item
  { id: 'item.ncm', label: 'NCM', tipo: 'TEXTO' },
  { id: 'item.descricao', label: 'Descricao', tipo: 'TEXTO' },
  { id: 'item.cfop', label: 'CFOP', tipo: 'TEXTO' },
  { id: 'item.valor_fob', label: 'Valor FOB', tipo: 'DECIMAL' },
  { id: 'item.valor_cif', label: 'Valor CIF', tipo: 'DECIMAL' },
  { id: 'item.ii_valor', label: 'Valor II', tipo: 'DECIMAL' },
  { id: 'item.ipi_valor', label: 'Valor IPI', tipo: 'DECIMAL' },
  { id: 'item.pis_valor', label: 'Valor PIS', tipo: 'DECIMAL' },
  { id: 'item.cofins_valor', label: 'Valor COFINS', tipo: 'DECIMAL' },
  { id: 'item.icms_valor', label: 'Valor ICMS', tipo: 'DECIMAL' },
  { id: 'item.total_despesas_rateadas', label: 'Despesas Rateadas', tipo: 'DECIMAL' },
  { id: 'item.total_item', label: 'Total Item', tipo: 'DECIMAL' },
  // ... mais campos de item

  // Despesas (dinamicas — baseado no catalogo)
  { id: 'despesa.[nome]', label: '[Nome da Despesa]', tipo: 'DECIMAL' },
  // Ex: despesa.capatazia, despesa.afrmm, despesa.frete_interno
]
```

---

## 6. Isolamento Zero-Trust

### Regras Inviolaveis

```typescript
// TODA query Prisma DEVE ter:
where: {
  tenant_id: req.tenantId,    // Do middleware
  company_id: req.companyId,  // Do middleware
  ...filtros
}

// Cross-tenant retorna 404, NUNCA 403
if (!nf) throw new AppError('NF nao encontrada', 404)

// Catalogo, templates e layouts sao SEMPRE por company_id
// Um despachante com 5 clientes tem 5 catalogos diferentes
```

### Anti-Enumeracao

```typescript
// ERRADO — revela existencia
if (nf.tenant_id !== req.tenantId) throw new AppError('Forbidden', 403)

// CERTO — mascarado
const nf = await prisma.nfImportacao.findFirst({
  where: { id: nfId, tenant_id: req.tenantId, company_id: req.companyId }
})
if (!nf) throw new AppError('NF nao encontrada', 404)
```

---

## 7. Indices e Performance

### Queries Criticas

| Query | Indices Necessarios | Meta |
|-------|-------------------|------|
| Lista de NFs | `[tenant_id, company_id, status]` | < 200ms |
| Calculo de rateio | In-memory (dados ja carregados) | < 500ms |
| Busca de favorito fiscal | `[tenant_id, company_id, ncm]` | < 50ms |
| Exportacao | In-memory (NF completa carregada) | < 3s |
| Smart Read | Async (servico externo) | < 30s |

### Otimizacao do Rateio

- Carregar TODOS os itens e despesas em 1 query (include)
- Calcular rateio IN-MEMORY (nao no banco)
- Salvar rateios em batch (createMany)
- Preview = calculo sem persist (stateless)

---

## 8. Anti-Padroes

| Anti-Padrao | Por que e errado | O que fazer |
|------------|-----------------|-------------|
| Lista hardcoded de despesas | Cada empresa nomeia diferente | Catalogo livre por company_id |
| Metodo de rateio unico por NF | Despesas diferentes exigem rateios diferentes | Metodo por despesa |
| Layout de exportacao fixo | Cada ERP tem formato proprio | Construtor de layout |
| UUID como ID de NF | Nao e corporativo, nao e legivel | `nfim_id_XXXXXXX/YY` |
| Calcular rateio no banco (SQL) | Lento, complexo, dificil de debugar | In-memory com validacao |
| Arredondar cada valor isoladamente | Soma pode nao fechar | Centavo restante no ultimo item |
| Guardar formula de rateio como eval() | Injection risk | Parser seguro com whitelist de operadores |
| console.log com dados fiscais | Dados sensiveis | Structured logging sem PII |
| Query sem tenant_id | Vazamento cross-tenant | Middleware obrigatorio |
| Editar NF exportada | Perde rastreabilidade | Duplicar para nova versao |

---

## 9. Checklist Pre-Entrega

### Seguranca
- [ ] Toda query com `tenant_id` + `company_id`
- [ ] 404 para cross-tenant (nunca 403)
- [ ] Zod validation em todas as rotas
- [ ] `x-internal-key` em chamadas inter-servico
- [ ] JWT validado via `@clerk/backend`
- [ ] Sem `console.log` com dados sensiveis
- [ ] Formula customizada nao usa `eval()`
- [ ] Erros via `AppError`

### Motor de Rateio
- [ ] 9 metodos implementados e testados
- [ ] Centavo restante funciona com 1, 10, 100, 200 itens
- [ ] Soma dos rateios = total (±0.01)
- [ ] Nenhum rateio negativo
- [ ] Preview < 300ms para 100 itens × 20 despesas
- [ ] Fallback quando divisor = 0 (ex: peso = 0)

### Motor de Exportacao
- [ ] XML valido (well-formed)
- [ ] TXT com posicoes fixas exatas
- [ ] Excel com tipos numericos (nao texto)
- [ ] JSON com tipos corretos
- [ ] PDF legivel
- [ ] Codificacao ISO-8859-1 funciona (acentos)
- [ ] Preview identico ao arquivo final

### Smart Read
- [ ] DUIMP PDF → extrai itens, NCMs, valores
- [ ] Recibo de despesa → extrai tipo, valor, CNPJ
- [ ] Demonstrativo de despesas → extrai multiplas linhas
- [ ] Preview com campos amarelos para confirmacao
- [ ] Fallback se Smart Read falhar (digitacao manual)

### Performance
- [ ] Lista < 200ms (1000 NFs)
- [ ] Rateio 100×20 < 500ms
- [ ] Exportacao 200 itens < 3s
- [ ] Smart Read < 30s

### Acessibilidade
- [ ] Tab order no wizard de 6 steps
- [ ] aria-labels em todos os campos
- [ ] Tabela de rateio navegavel por teclado
- [ ] Construtor de layout acessivel (alternativa ao drag-and-drop)
- [ ] Contraste WCAG 2.1 AA
