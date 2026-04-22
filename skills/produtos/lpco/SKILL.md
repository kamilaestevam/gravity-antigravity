---
name: antigravity-lpco
description: "Use esta skill ao desenvolver ou modificar o produto LPCO (Licencas, Permissoes, Certificados e Outros). Define o ciclo de vida do documento LPCO, os status de tramitacao, a integracao com orgaos anuentes do Portal Unico Siscomex, os modelos de formularios por orgao, o vinculo com DUIMP/DU-E, e o isolamento zero-trust por organizacao+workspace. Todo agente consulta esta skill antes de tocar em LPCO, LpcoItem, ou nas rotas de /api/v1/lpcos."
---

# Gravity — Skill: LPCO (Licencas, Permissoes, Certificados e Outros)

> **ATENCAO IA:** Se voce for modificar queries Prisma, rotas Express, ou logica de negocio relacionada a `Lpco`, `LpcoItem`, `LpcoExigencia`, ou `LpcoVinculo`, acate TODAS as regras abaixo. Violacao causa falha em testes e build blockage.

---

## 1. O Que E o LPCO

LPCO significa **Licencas, Permissoes, Certificados e Outros Documentos**. E o modulo do Portal Unico de Comercio Exterior (Siscomex) que centraliza a comunicacao entre importadores/exportadores e os **16 orgaos anuentes** do governo brasileiro.

No Gravity, o produto LPCO e o **gerenciador interno** que permite ao usuario:
- Preparar, preencher e revisar LPCOs antes de registrar no Portal Unico
- Acompanhar o ciclo de vida (rascunho -> analise -> deferido/indeferido)
- Responder exigencias dos orgaos anuentes
- Vincular LPCOs a Processos (DUIMP/DU-E) existentes no Gravity
- Controlar saldo de LPCOs Flex (guarda-chuva)
- Manter historico e rastreabilidade para compliance

**O Gravity NAO substitui o Portal Unico** — ele e um sistema de gestao que prepara, acompanha e organiza os LPCOs do usuario. Com integracao via API, o Gravity tambem registra e sincroniza LPCOs diretamente no Portal Unico.

---

## 1.1. Canais de Entrada — "Entre Como Quiser"

O LPCO suporta 5 canais de entrada de dados + integracao via API Cockpit:

| # | Canal | Enum | Como Funciona |
|---|-------|------|--------------|
| 1 | Digitacao manual | `MANUAL` | Wizard com formulario dinamico por orgao |
| 2 | Planilha (Excel/CSV) | `PLANILHA` | Upload + mapeamento de colunas → cria LPCOs em lote |
| 3 | A partir do Pedido | `PEDIDO` | Seleciona Pedido → auto-preenche ~70% dos campos |
| 4 | Smart Read | `SMART_READ` | Upload de fatura/packing list/laudo → OCR+IA extrai dados |
| 5 | Duplicar existente | `DUPLICAR` | Copia LPCO anterior como modelo |
| 6 | API (ERP/Sistema COMEX) | `API` | Via API Cockpit — sistema externo empurra dados via `POST /api/v1/lpcos` |

### Auto-Preenchimento a partir do Pedido

Quando o canal e `PEDIDO`, o sistema preenche automaticamente:

| Campo LPCO | Origem no Pedido |
|-----------|-----------------|
| `tipo_operacao` | Pedido.tipo_operacao |
| `pais_procedencia` | Pedido.pais do exportador |
| `importacao_exportador_id` | Pedido.importacao_exportador_id |
| `exportacao_importador_id` | Pedido.exportacao_importador_id |
| Item.ncm | PedidoItem.ncm |
| Item.descricao_produto | PedidoItem.descricao |
| Item.fabricante | PedidoItem.fabricante |
| Item.quantidade_estatistica | PedidoItem.quantidade_inicial_item_pedido |
| Item.peso_liquido | PedidoItem.peso_liquido |
| Item.vmle | PedidoItem.valor_unitario × quantidade |
| Item.moeda | Pedido.moeda_negociada |
| Item.condicao_venda | Pedido.incoterm |

**Regra:** O usuario ainda deve completar: orgao anuente, modelo, fundamento legal e atributos especificos do orgao.

### Smart Read

O Smart Read (OCR + IA) ja esta funcional no Gravity. Para LPCO, extrai dados de:
- **Fatura comercial** → produtos, NCMs, quantidades, valores, exportador
- **Packing List** → pesos, volumes, embalagens
- **Certificado de origem** → pais, fabricante
- **Laudo tecnico** → atributos especificos do orgao

**Regra:** Smart Read gera rascunho com campos extraidos destacados em amarelo para revisao humana. Nenhum campo e aceito sem confirmacao.

### Integracao via API Cockpit

Sistemas externos (ERP, SAP, sistemas de COMEX) podem criar LPCOs via API usando tokens do API Cockpit:

```typescript
// Exemplo: ERP cria LPCO via API
POST /api/v1/lpcos
Authorization: Bearer gv_live_sk_xxxxx
Content-Type: application/json

{
  "canal_entrada": "API",
  "tipo_operacao": "IMPORTACAO",
  "orgao_anuente": "ANVISA",
  "modelo_lpco": "I00004",
  // ... demais campos
}
```

**Regra:** Todo LPCO criado via API segue a mesma validacao Zod. Canal de entrada e registrado em `Lpco.canal_entrada` para rastreabilidade.

---

## 2. Arquitetura de Entidades

| Camada | Model | Tabela | Responsabilidade |
|--------|-------|--------|-----------------|
| 1 | `Lpco` | `lpcos` | Documento LPCO mestre — dados do pedido, orgao anuente, modelo, status |
| 2 | `LpcoItem` | `lpco_itens` | Item NCM do LPCO — produto, quantidades, valores, atributos especificos |
| 3 | `LpcoExigencia` | `lpco_exigencias` | Exigencias formuladas pelo orgao anuente e respostas |
| 4 | `LpcoVinculo` | `lpco_vinculos` | Vinculacao do LPCO a DUIMPs/DU-Es (controle de saldo) |
| 5 | `LpcoDocumento` | `lpco_documentos` | Documentos anexados (dossie comprobatorio) |
| 6 | `LpcoHistorico` | `lpco_historico` | Eventos do ciclo de vida (append-only) |

**Regras:**
- O produto LPCO NUNCA cria, modifica ou deleta `Processo` ou `Pedido`
- A vinculacao a Processos acontece via `LpcoVinculo` que referencia `processo_id`
- O LPCO compartilha o Catalogo de Produtos com o ecosistema Gravity (NCMs, atributos)

---

## 3. Ciclo de Vida — Status e Transicoes

```
RASCUNHO -> PARA_ANALISE -> EM_ANALISE -> DEFERIDA
                                      |-> EM_EXIGENCIA -> RESPOSTA_EXIGENCIA -> EM_ANALISE
                                      |-> INDEFERIDA
                                      |-> CANCELADA (manual ou auto 90 dias)
```

### Enum de Status

```typescript
enum LpcoStatus {
  RASCUNHO = 'rascunho',
  PARA_ANALISE = 'para_analise',
  EM_ANALISE = 'em_analise',
  EM_EXIGENCIA = 'em_exigencia',
  RESPOSTA_EXIGENCIA = 'resposta_exigencia',
  DEFERIDA = 'deferida',
  INDEFERIDA = 'indeferida',
  CANCELADA = 'cancelada',
}
```

### Regras de Transicao

| De | Para | Quem | Condicao |
|----|------|------|----------|
| `rascunho` | `para_analise` | Usuario | Todos os campos obrigatorios preenchidos + validacao Zod |
| `para_analise` | `em_analise` | Sistema (sync Portal Unico) | Orgao anuente iniciou analise |
| `em_analise` | `deferida` | Sistema (sync Portal Unico) | Orgao deferiu |
| `em_analise` | `em_exigencia` | Sistema (sync Portal Unico) | Orgao formulou exigencia |
| `em_analise` | `indeferida` | Sistema (sync Portal Unico) | Orgao indeferiu |
| `em_exigencia` | `resposta_exigencia` | Usuario | Respondeu exigencia com documentos/informacoes |
| `resposta_exigencia` | `em_analise` | Sistema (sync Portal Unico) | Orgao retomou analise |
| `em_exigencia` | `cancelada` | Sistema (auto) | 90 dias sem resposta → cancelamento automatico |
| qualquer | `cancelada` | Usuario | Cancelamento manual (exceto `deferida` ja vinculada) |

**Regras inviolaveis:**
- LPCO `deferida` com vinculos ativos NAO pode ser cancelada
- Toda transicao gera registro em `LpcoHistorico` (append-only)
- Status so muda via `lpcoStatusEngine` — NUNCA update direto no Prisma
- Cancelamento automatico roda via cron job diario

---

## 4. Tipos de LPCO

| Tipo | Enum | Descricao | Controle de Saldo |
|------|------|-----------|-------------------|
| Por Operacao | `POR_OPERACAO` | Autoriza uma unica operacao (1 DUIMP ou 1 DU-E) | Nao — vinculo 1:1 |
| Flex (Guarda-chuva) | `FLEX` | Autoriza multiplas operacoes dentro do prazo/saldo | Sim — saldo decrementado por vinculo |
| Taxa | `TAXA` | Exclusivo para recolhimento de taxas | Nao — sem analise tecnica |

### Controle de Saldo (LPCO Flex)

**Formula Sagrada (similar ao Pedido):**
```
saldo_disponivel = quantidade_deferida - SUM(quantidade_vinculada)
```

**Regras:**
- `quantidade_deferida` e definida pelo orgao anuente e NUNCA muda no Gravity
- Cada `LpcoVinculo` consome parte do saldo
- Se `saldo_disponivel < quantidade_solicitada`, REJEITAR vinculo com erro 400
- Validade temporal: `data_vigencia_fim` — vinculos apos essa data sao rejeitados

---

## 5. IDs Corporativos (Identidades Fortes)

NAO use `cuid()` ou `uuid()`. Todo objeto do LPCO usa prefixos unicos:

| Entidade | Prefixo | Exemplo |
|----------|---------|---------|
| Lpco | `lpco_id_` | `lpco_id_0000001/26` |
| LpcoItem | `lpit_id_` | `lpit_id_0000001/26` |
| LpcoExigencia | `lpex_id_` | `lpex_id_0000001/26` |
| LpcoVinculo | `lpvc_id_` | `lpvc_id_0000001/26` |

Formato: `{prefixo}{sequencial_7_digitos}/{ano_2_digitos}`

---

## 6. Orgaos Anuentes — Modelos de LPCO

O sistema deve suportar os 16 orgaos anuentes. Cada orgao define modelos de formulario com atributos especificos.

| Sigla | Nome | Area |
|-------|------|------|
| ANVISA | Agencia Nacional de Vigilancia Sanitaria | Medicamentos, alimentos, cosmeticos |
| MAPA | Ministerio da Agricultura e Pecuaria | Animais, vegetais, agrotoxicos |
| IBAMA | Instituto Brasileiro do Meio Ambiente | Fauna, flora, CITES |
| INMETRO | Instituto Nacional de Metrologia | Conformidade industrial |
| ANP | Agencia Nacional do Petroleo | Petroleo, gas, biocombustiveis |
| DECEX | Departamento de Operacoes de COMEX | Cotas, controle estatistico |
| DPF | Departamento de Policia Federal | Precursores quimicos, armas |
| DFPC | Diretoria de Fiscalizacao de Produtos Controlados | Armas, municao, explosivos |
| CNEN | Comissao Nacional de Energia Nuclear | Material nuclear/radioativo |
| CNPq | Conselho Nacional de Desenv. Cientifico | Material genetico |
| MCTI | Ministerio de Ciencia e Tecnologia | Bens sensiveis |
| ANM | Agencia Nacional de Mineracao | Minerios |
| ANEEL | Agencia Nacional de Energia Eletrica | Energia eletrica |
| ANCINE | Agencia Nacional do Cinema | Audiovisual |
| ECT | Correios | Remessas postais |
| SUFRAMA | Superintendencia Zona Franca de Manaus | Zona Franca |

### Atributos Dinamicos

Cada modelo de LPCO possui atributos especificos (`ATT_XXXXX`). O sistema armazena como JSON tipado:

```typescript
interface LpcoAtributo {
  codigo: string        // ex: "ATT_15900"
  nome: string          // ex: "Produto controlado pelo Exercito"
  tipo: 'texto' | 'numero' | 'data' | 'selecao' | 'booleano' | 'composto'
  obrigatorio: boolean
  valor: string | number | boolean | Record<string, unknown>
  dependeDe?: string    // ATT pai que ativa este atributo
}
```

**Regra:** Atributos sao definidos pelo modelo do orgao anuente e podem mudar via comunicados Siscomex. O sistema deve suportar formularios dinamicos.

---

## 7. Importacao vs Exportacao

O LPCO suporta ambas operacoes na mesma tabela com discriminador `tipo_operacao`:

| Campo | Importacao | Exportacao |
|-------|-----------|------------|
| `tipo_operacao` | `IMPORTACAO` | `EXPORTACAO` |
| Documento vinculado | DUIMP | DU-E |
| Catalogo de Produtos | Obrigatorio | Opcional |
| Operacional desde | 2021 (piloto) | Jul/2018 |
| Regulamento | Portaria SECEX 77/2021 | Portaria SECEX 19/2019 |

**Escudo Anti-Conflito (herdado do Pedido):**
- `importacao_exportador_id` — quem exporta para nos (fornecedor estrangeiro)
- `exportacao_importador_id` — quem importa de nos (cliente estrangeiro)
- NUNCA usar `fornecedor_id` ou `cliente_id` generico

---

## 8. Integracao com Ecosistema Gravity

### Integracoes Internas

| Produto/Servico | Tipo | Finalidade |
|----------------|------|-----------|
| Processo | Vinculo | LPCO vinculada a DUIMP/DU-E via `LpcoVinculo` |
| Pedido | Referencia | LPCO pode referenciar PedidoItem para rastreabilidade |
| SimulaCusto | Consulta | Verificar se NCM exige LPCO (simulador de tratamento administrativo) |
| Catalogo de Produtos | Dependencia | Produto deve estar cadastrado antes de criar LPCO de importacao |
| Historico (tenant) | Auditoria | Toda acao gera evento no servico de historico |
| Notificacoes (tenant) | Alertas | Mudanca de status, exigencia recebida, prazo expirando |
| Email (tenant) | Comunicacao | Notificacao por email de eventos criticos |

### Integracao com Portal Unico Siscomex

O Gravity se integra bidireccionalmente com o Portal Unico via API REST:

| Recurso | Endpoint Portal Unico | Direcao |
|---------|----------------------|---------|
| Registrar LPCO (imp) | `POST /portal/api/ext/lpco-importacao` | Gravity → Portal |
| Consultar LPCO (imp) | `GET /portal/api/ext/lpco-importacao/{numero}` | Portal → Gravity |
| Retificar LPCO | `PUT /portal/api/ext/lpco-importacao/{numero}` | Gravity → Portal |
| Cancelar LPCO | `PATCH /portal/api/ext/lpco-importacao/{numero}/cancelamento` | Gravity → Portal |
| Responder exigencia | `POST /portal/api/ext/lpco-importacao/{numero}/exigencia/{id}/resposta` | Gravity → Portal |
| Anexar documento | `POST /portal/api/ext/lpco-importacao/{numero}/anexo` | Gravity → Portal |
| Registrar LPCO (exp) | `POST /portal/api/ext/lpco-exportacao` | Gravity → Portal |
| Simular TA | `GET /portal/api/ext/tratamento-administrativo/importacao?ncm={ncm}` | Portal → Gravity |
| Catalogo Produtos | `GET /portal/api/ext/catalogo-produtos` | Portal → Gravity |
| 15 Webhooks | `talp-registro-lpco`, `talp-resposta-exig`, etc. | Portal → Gravity |

### Autenticacao com Portal Unico — Strategy Pattern

O Gravity suporta **dois metodos de autenticacao** com o Portal Unico (strategy pattern):

**Metodo 1 — Certificado Digital (e-CNPJ/e-CPF):**
- mTLS com certificado ICP-Brasil (A1 ou A3)
- Upload do `.pfx`/`.p12` pelo usuario
- Retorna JWT com validade de 1h (auto-refresh)
- Operacao completa: leitura + escrita

**Metodo 2 — Token OAuth2 (gov.br / Serpro):**
- Autenticacao via `client_id` + `client_secret`
- Sem necessidade de certificado digital
- Lancado recentemente — pode ter escopo limitado a consultas
- Fallback automatico: se token falha para escrita, solicita certificado

```typescript
// Strategy pattern — adapter escolhe o metodo disponivel
interface PortalUnicoAuthStrategy {
  authenticate(): Promise<string>  // retorna Bearer token
  canWrite(): boolean
}

class CertificadoDigitalStrategy implements PortalUnicoAuthStrategy {
  // mTLS com .pfx → JWT 1h
}

class TokenOAuth2Strategy implements PortalUnicoAuthStrategy {
  // client_credentials → Bearer token
}
```

### Modelo `SiscomexCredencial` (novo)

```prisma
model SiscomexCredencial {
  id                    String    @id @default(cuid())
  id_organizacao        String    @map("tenant_id")
  id_workspace          String    @map("company_id")

  // Tipo de autenticacao
  tipo_auth             String                  // CERTIFICADO_DIGITAL | TOKEN_OAUTH2

  // Certificado Digital
  certificado_encrypted String?                 // .pfx criptografado AES-256-GCM
  certificado_senha_encrypted String?            // Senha criptografada AES-256-GCM
  certificado_validade  DateTime?               // Data de expiração do certificado
  certificado_cn        String?                 // Common Name (CNPJ/CPF)

  // Token OAuth2
  oauth_client_id       String?
  oauth_client_secret_encrypted String?          // AES-256-GCM
  oauth_scope           String?

  // Cache de JWT (em memoria, nao persiste — apenas referencia)
  ultimo_uso            DateTime?
  status                String    @default("ativo") // ativo | expirado | revogado

  created_by            String
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@unique([tenant_id, company_id, tipo_auth])
}
```

**Regras de seguranca:**
- Certificado `.pfx` armazenado com **AES-256-GCM** (mesmo padrao do Conector ERP no API Cockpit)
- Senha do certificado **NUNCA** em plain text — AES-256-GCM
- JWT do Portal Unico cacheado **em memoria apenas** — nunca persiste no banco
- Auto-refresh do JWT antes de expirar (1h validade)
- `oauth_client_secret` criptografado com AES-256-GCM
- Validacao de expiração do certificado com alerta 30 dias antes

### Fluxo de Autenticacao

```
Usuario configura credenciais (1x por empresa):
  ┌─── Tem certificado digital? ──→ Upload .pfx + senha → AES-256 → DB
  │
  └─── Tem token gov.br? ──→ client_id + secret → AES-256 → DB

Ao registrar LPCO no Portal Unico:
  1. portalUnicoAdapter.getAuthStrategy(idOrganizacao, idWorkspace)
  2. Se CERTIFICADO_DIGITAL disponivel → mTLS → JWT
  3. Se apenas TOKEN_OAUTH2 → client_credentials → Bearer
  4. Se nenhum → modo manual (usuario registra por fora)
```

**Regra:** O Gravity funciona em 3 modos:
- **Integrado (certificado)** — registra, consulta, responde tudo via API
- **Integrado (token)** — consulta via API, escrita depende do escopo do token
- **Manual** — usuario opera no Portal Unico por fora e atualiza status no Gravity

---

## 9. Isolamento Zero-Trust (Organização + Workspace)

**Toda query exige o par de campos de Organização + Workspace do model Prisma (atualmente `tenant_id` + `company_id` — colunas reais do fragment.prisma do LPCO).**

> Os nomes dos campos Prisma são preservados conforme o `fragment.prisma` real (Mandamento 02 — schema intocável). Em payloads, JSON e variáveis TypeScript fora do contexto Prisma, use a nomenclatura DDD (`idOrganizacao`, `idWorkspace`).

```typescript
// CORRETO — campos Prisma reais
prisma.lpco.findMany({
  where: { tenant_id, company_id, status: 'deferida' }
})

// PROIBIDO — falta tenant_id (Organização)
prisma.lpco.findMany({
  where: { status: 'deferida' }
})

// PROIBIDO — falta company_id (Workspace)
prisma.lpco.findMany({
  where: { tenant_id, status: 'deferida' }
})
```

**Anti-enumeracao:** Se usuario tenta acessar LPCO de outra Organização/Workspace, retornar HTTP 404 (nao 403).

---

## 10. Validacoes Zod Obrigatorias

Todo LPCO deve ser validado antes de transitar para `para_analise`:

```typescript
const LpcoRegistroSchema = z.object({
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  tipo_lpco: z.enum(['POR_OPERACAO', 'FLEX', 'TAXA']),
  orgao_anuente: z.string().min(2).max(10),
  modelo_lpco: z.string().min(1),
  pais_procedencia: z.string().length(2),         // ISO 3166-1 alpha-2
  fundamento_legal: z.string().min(1),
  itens: z.array(LpcoItemSchema).min(1),
})

const LpcoItemSchema = z.object({
  ncm: z.string().regex(/^\d{8}$/),
  catalogo_produto_id: z.string().optional(),      // obrigatorio se importacao
  quantidade_estatistica: z.number().positive(),
  peso_liquido: z.number().positive(),
  vmle: z.number().positive(),
  moeda: z.string().length(3),                     // ISO 4217
  atributos: z.array(LpcoAtributoSchema).optional(),
})
```

---

## 11. Anti-Padroes — O Que NUNCA Fazer

- ❌ Mudar status de LPCO sem passar pelo `lpcoStatusEngine`
- ❌ Query sem filtro de Organização + Workspace (`tenant_id` + `company_id` no fragment.prisma atual)
- ❌ Usar `cuid()` ou `uuid()` em vez de IDs corporativos
- ❌ Cancelar LPCO deferida que tem vinculos ativos
- ❌ Ler `publicMetadata.role` do Clerk para autorização — permissões vêm de `GET /api/v1/me` (Mandamento 01)
- ❌ `useState<T>({} as T)` em telas de LPCO — usar `null` + tratamento de loading (Mandamento 05)
- ❌ Consumir `fetch().json()` sem `schema.parse()` Zod (Mandamento 06)
- ❌ Permitir vinculo em LPCO Flex sem verificar saldo
- ❌ Permitir vinculo em LPCO com `data_vigencia_fim` expirada
- ❌ Criar LPCO de importacao sem produto no Catalogo
- ❌ Usar `fornecedor_id` generico (usar prefixos operacionais)
- ❌ Deletar registros de `LpcoHistorico` (append-only)
- ❌ Importar codigo de outro produto (comunicacao via REST API)

---

## 12. Checklist Pre-Entrega

- [ ] Todo model Prisma do LPCO tem campos de Organização + Workspace obrigatórios (`tenant_id` + `company_id` no fragment.prisma atual)?
- [ ] 3 índices por model: `[tenant_id]`, `[tenant_id, product_id]`, `[tenant_id, user_id]` (nomes dos campos Prisma reais)?
- [ ] IDs corporativos com prefixo `lpco_id_`, `lpit_id_`, etc.?
- [ ] Status muda apenas via `lpcoStatusEngine`?
- [ ] Saldo de LPCO Flex validado antes de criar vinculo?
- [ ] Cancelamento automatico (90 dias) implementado via cron?
- [ ] Validacao Zod em todas as rotas de criacao/atualizacao?
- [ ] `LpcoHistorico` append-only em toda transicao?
- [ ] Anti-enumeracao: 404 para acesso entre Organizações?
- [ ] Testes de Isolamento de Organização cobrindo todos os endpoints?
- [ ] Front lê `tipo_usuario` apenas via `/api/v1/me` validado por Zod (Mandamentos 01, 06, 09)?
- [ ] Sem `publicMetadata` lido para autorização?
