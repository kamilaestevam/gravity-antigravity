# CADASTROS — Documento Técnico de Arquitetura

**Versão:** 1.0 (final, aprovada)
**Data:** 22/04/2026
**Autor:** Sessão de governança Gravity
**Decisores:** Daniel (dono), Coordenador (executor)

---

## 1. Objetivo

Criar um **4º banco de dados** chamado `cadastros` no ecossistema Gravity, atuando como **cartório de identidades de domínio COMEX** — empresas, OPE, moedas, unidades, NCM e demais entidades compartilhadas entre múltiplos produtos.

A motivação central é resolver o atual problema arquitetural onde entidades como Exportador, Fabricante, Importador aparecem implicitamente em vários produtos (Pedido, LPCO, NF Importação) sem fonte única de verdade, gerando duplicação de modelagem, inconsistência de dados e impossibilidade de rastreabilidade cross-produto.

---

## 2. Princípios fundamentais

### 2.1 Database-per-Service mantido
Cadastros é apenas mais um banco isolado. Comunicação com outros serviços ocorre via **API REST interna** com `x-internal-key`. Sem JOINs cross-database, sem FK física entre bancos.

### 2.2 Cadastros é o cartório
Toda empresa do mundo COMEX (Importador, Exportador, Fabricante, Agente, Despachante, Armador) é registrada **primeiro** em Cadastros e recebe um **SUID** único e estável. Esse SUID é a chave de referência usada por todos os outros bancos.

### 2.3 SUID per-tenant
Cada Empresa em Cadastros pertence a **um tenant** (`id_organizacao`). Se a CAOA cadastra "Shenzhen Trading Co." e a Fiat cadastra a mesma empresa, são **dois SUIDs distintos**. Não há reconciliação cross-tenant. Isolamento prevalece sobre unicidade global.

### 2.4 Configurador espelha SUID
Quando uma Empresa vira cliente Gravity, o Configurador cria `Organizacao.suid_empresa` referenciando o SUID já existente em Cadastros. **Cópia, não FK** — mantém Database-per-Service.

### 2.5 Snapshot obrigatório
Todo Pedido (e equivalentes em outros produtos) grava uma **cópia congelada** dos campos críticos da Empresa no momento da emissão. Pedidos emitidos não dependem de Cadastros estar online ou inalterado.

### 2.6 Atualização opcional e auditável
Mudanças em Cadastros podem opcionalmente propagar pra pedidos via flag por **entidade × status**, com histórico imutável e UI de preview obrigatória.

### 2.7 Configurador sem campos COMEX
Configurador cuida de auth (Clerk), Organizacao (CNPJ do tenant pagante), Workspace e billing (Stripe). **Não armazena** estado/endereço/email de Exportador, Fabricante etc. — esses dados pertencem ao Cadastros e às tabelas de snapshot dos produtos.

---

## 3. Decisões consolidadas

| # | Decisão | Justificativa |
|---|---------|---------------|
| 1 | Cadastros = 4º banco isolado | Database-per-Service, isolamento de domínio COMEX |
| 2 | SUID nasce em Cadastros, sempre | Cartório único, evita ambiguidade |
| 3 | SUID per-tenant (não global) | Isolamento de tenant > unicidade mundial |
| 4 | Configurador espelha SUID por cópia | Mantém isolamento DB |
| 5 | CNPJ obrigatório no Brasil, opcional exterior | Realidade operacional |
| 6 | Empresa única com flags de papel (sem enum tipo, sem tabelas filhas) | Simplicidade; tipo é derivado das flags |
| 7 | Snapshot obrigatório no Pedido | Rastreabilidade legal COMEX |
| 8 | Atualização via flag por entidade × status | Compliance + flexibilidade |
| 9 | Sem granularidade por campo | Simplicidade, evita explosão de toggles |
| 10 | Histórico via serviço Histórico existente | Reuso, sem custo adicional |
| 11 | Preview de impacto obrigatório ao salvar Cadastros | Transparência, evita surpresas |
| 12 | Banner retroativo ao voltar status para editável | Usuário decide aplicar ou não |
| 13 | OPE sincronizado de Portal Único (fonte da verdade) | Portal Único é fonte da verdade SISCOMEX |
| 14 | Moedas, Unidades, NCM ficam em Cadastros | Compartilhados por múltiplos produtos |
| 15 | Anexos modelo X2 (Draft + Original separados) | Documentos distintos no fluxo COMEX |
| 16 | Onboarding cria Empresa + Organizacao atomicamente | UX transparente, SUID definitivo no primeiro insert |
| 17 | Cache Redis 5min para hidratação de Empresa | Performance, alivia Cadastros |
| 18 | Degradação graciosa: rascunho continua, criação de novo cadastro bloqueia | Fonte da verdade nunca tem fallback |
| 19 | Regra anti-saco-de-gato (4 critérios) | Evita Cadastros virar lixeira |
| 20 | Auditoria de campos espalhados via coluna extra na planilha DDD | Daniel preenche manualmente com a planilha em mãos |

---

## 4. Modelo de dados — banco Cadastros

> **Convenção DDD Gravity (atualizada 24/04/2026 — fix_model_casing_revert):**
> - **Model names em PascalCase** (convenção Prisma) — `Empresa`, `Moeda`, `Unidade`, `NCM`, `OPE`, `OpeHistoricoStatus`.
> - **Nome de tabela PostgreSQL em snake_case** via `@@map("tabela")`.
> - **Colunas em snake_case PT-BR** com **sufixo da tabela** (ex: `suid_empresa`, `codigo_moeda`) — exceções: FKs `id_<outra>` (ex: `id_organizacao`) e colunas já terminadas com o sufixo.
> - Valores de enum em UPPER_SNAKE EN. Booleans sem prefixo `is_`.
> - **Proibido** ficar apenas em `model empresa {}` sem `@@map`. O schema precisa ser válido tanto na ótica Prisma (PascalCase) quanto na ótica PG (snake_case).

### 4.1 Empresa

```prisma
model Empresa {
  suid_empresa                          String   @id           // ex: SHENZHEN-00042
  id_organizacao                        String                 // tenant dono
  nome_empresa                          String
  cnpj_empresa                          String?                // obrigatório se pais_empresa = BR
  tin_empresa                           String?                // estrangeiros (opcional)
  pais_empresa                          String                 // ISO-2
  estado_empresa                        String?
  cidade_empresa                        String?
  endereco_empresa                      String?
  zipcode_empresa                       String?
  email_empresa                         String?
  telefone_empresa                      String?
  whatsapp_empresa                      String?
  pode_ser_importador_empresa           Boolean  @default(false)
  pode_ser_exportador_empresa           Boolean  @default(false)
  pode_ser_fabricante_empresa           Boolean  @default(false)
  pode_ser_agente_empresa               Boolean  @default(false)
  pode_ser_despachante_empresa          Boolean  @default(false)
  pode_ser_armador_empresa              Boolean  @default(false)
  pode_ser_armazem_alfandegado_empresa                          Boolean @default(false)
  pode_ser_transportadora_rodoviaria_nacional_empresa           Boolean @default(false)
  pode_ser_cia_aerea_empresa                                    Boolean @default(false)
  pode_ser_transportadora_rodoviaria_internacional_empresa      Boolean @default(false)
  pode_ser_seguradora_internacional_empresa                     Boolean @default(false)
  pode_ser_seguradora_corretora_cambio_empresa                  Boolean @default(false)
  pode_ser_banco_empresa                                        Boolean @default(false)
  pode_ser_armazem_nacional_empresa                             Boolean @default(false)
  ativo_empresa                         Boolean  @default(true)
  criado_em_empresa                     DateTime @default(now())
  atualizado_em_empresa                 DateTime @updatedAt

  @@unique([id_organizacao, cnpj_empresa])
  @@unique([id_organizacao, tin_empresa, pais_empresa])
  @@index([id_organizacao])
  @@index([id_organizacao, nome_empresa])
  @@map("empresa")
}
```

**Tipo da empresa é derivado das flags, NÃO é campo persistido.** Função utilitária `derivarTipoVisual(empresa)` retorna string formatada ("Importador", "Importador + Exportador", "Importador + Exportador + Agente").

### 4.2 Catálogos compartilhados

```prisma
model Moeda {
  codigo_moeda    String   @id           // BRL, USD, EUR, CNY — ISO 4217
  simbolo_moeda   String
  ativo_moeda     Boolean  @default(true)

  @@map("moeda")
}

model Unidade {
  codigo_unidade  String   @id           // KG, UN, M, L
  nome_unidade    String
  tipo_unidade    String                 // peso, quantidade, comprimento, volume
  ativo_unidade   Boolean  @default(true)

  @@map("unidade")
}

model NCM {
  codigo_ncm      String   @id           // 8 dígitos
  descricao_ncm   String
  ipi_ncm         Float?
  ii_ncm          Float?
  pis_ncm         Float?
  cofins_ncm      Float?
  ativo_ncm       Boolean  @default(true)

  @@map("ncm")
}
```

### 4.3 OPE — sincronizado de Portal Único

```prisma
model OPE {
  suid_ope                   String   @id
  id_organizacao             String
  codigo_portal_unico_ope    String   @unique
  situacao_ope               String                 // espelho do status SISCOMEX
  versao_ope                 String
  nome_ope                   String
  cnpj_raiz_empresa_ope      String
  pais_ope                   String
  estado_ope                 String?
  cidade_ope                 String?
  endereco_ope               String?
  zip_ope                    String?
  tin_ope                    String?
  email_ope                  String?
  ultima_sincronizacao_ope   DateTime
  origem_ope                 String   @default("portal_unico")

  @@index([id_organizacao])
  @@map("ope")
}

model OpeHistoricoStatus {
  id_historico_status_ope                String   @id @default(cuid())
  suid_ope_historico_status_ope          String
  status_anterior_historico_status_ope   String?
  status_novo_historico_status_ope       String
  origem_historico_status_ope            String                 // portal_unico, manual, sistema
  payload_historico_status_ope           Json
  registrado_em_historico_status_ope     DateTime @default(now())

  @@index([suid_ope_historico_status_ope])
  @@index([registrado_em_historico_status_ope])
  @@map("ope_historico_status")
}
```

OPE é sincronizado via job que consome Portal Único. Portal Único é a fonte da verdade — edições manuais são tecnicamente possíveis, mas serão sobrescritas na próxima sincronização.

---

## 5. Validações aplicacionais (Zod backend + Zod frontend)

```
Empresa:
- nome_empresa: obrigatório, mínimo 2 caracteres
- pais_empresa: obrigatório, ISO-2
- if (pais_empresa === 'BR') { cnpj_empresa obrigatório, formato XX.XXX.XXX/XXXX-XX validado }
- if (pais_empresa !== 'BR') { cnpj_empresa deve ser null; tin_empresa opcional mas recomendado }
- pelo menos uma flag pode_ser_*_empresa deve ser true
- email_empresa: se preenchido, formato válido
- whatsapp_empresa: se preenchido, formato E.164

Moeda:
- codigo_moeda: obrigatório, ISO 4217 (3 letras maiúsculas)
- simbolo_moeda: obrigatório

Unidade:
- codigo_unidade: obrigatório, até 8 caracteres
- nome_unidade: obrigatório
- tipo_unidade: enum (peso | quantidade | comprimento | volume)

NCM:
- codigo_ncm: obrigatório, 8 dígitos numéricos
- descricao_ncm: obrigatório
- ipi_ncm / ii_ncm / pis_ncm / cofins_ncm: opcionais, quando preenchidos >= 0
```

---

## 6. Modelo de dados — Pedido (snapshot dentro do Pedido)

> **Snapshot = cópia congelada dos dados da Empresa, gravada DENTRO do Pedido no momento da emissão.** Garante que pedidos antigos preservem o estado original mesmo se Cadastros mudar.

### 6.1 Snapshot por entidade

```prisma
model PedidoSnapshotEmpresa {
  id                String   @id @default(cuid())
  id_pedido         String
  papel             String                       // importador, exportador, fabricante, agente, despachante, armador
  suid_empresa      String                       // referência ao Cadastros (sem FK física)
  nome_empresa      String                       // congelado
  cnpj              String?
  tin               String?
  pais              String
  estado            String?
  cidade            String?
  endereco          String?
  zipcode           String?
  email             String?
  telefone          String?
  congelado_em      DateTime @default(now())

  @@index([id_pedido])
  @@index([suid_empresa])
}

model PedidoSnapshotOpe {
  id                       String   @id @default(cuid())
  id_pedido                String
  suid_ope                 String
  codigo_portal_unico      String
  situacao_no_momento      String
  versao                   String
  nome_ope                 String
  cnpj_raiz_empresa        String
  pais                     String
  estado                   String?
  cidade                   String?
  endereco                 String?
  zip                      String?
  tin                      String?
  email                    String?
  congelado_em             DateTime @default(now())

  @@index([id_pedido])
  @@index([suid_ope])
}
```

### 6.2 Configuração de atualização por produto

> Esta tabela é a persistência da decisão "atualizar dados alterados do cadastro com base no status". Configurada pelo tenant em `Configurações > Pedido > Cadastros`.

```prisma
model PedidoConfigAtualizacaoCadastros {
  id_organizacao         String
  papel                  String                  // importador, exportador, fabricante, agente, despachante, armador
  status_permitidos      String[]                // ["rascunho", "em_emissao", ...status customizados do tenant]

  @@id([id_organizacao, papel])
}
```

UI: por linha, em `Configurações > Pedido > Cadastros`, mostra entidade + matriz de status (incluindo customizados criados pelo tenant) com toggle "atualizar quando Cadastros mudar?".

---

## 7. Modelo de dados — Configurador (alteração mínima)

```prisma
model Organizacao {
  suid_organizacao       String   @id
  suid_empresa           String?                 // espelho do Cadastros, opcional
  // ... resto inalterado
}
```

Sem FK física entre Configurador e Cadastros. `suid_empresa` é cópia.

---

## 8. Lista EXATA de mudanças estruturais

### Fase 0 — Aprovação deste documento (BLOQUEIA tudo abaixo)
- [x] Daniel revisa e aprova versão final do documento
- [x] Documento salvo em `documentos-tecnicos/produtos-gravity/cadastros/cadastros-arquitetura.md`
- [ ] Coordenador valida que documento está executável

### Fase 1 — Criação do banco Cadastros (não toca em produtos existentes)
- [x] Criar serviço `servicos-global/tenant/cadastros/`
- [x] Criar `fragment.prisma` com models: `Empresa`, `Moeda`, `Unidade`, `NCM`, `OPE`, `OpeHistoricoStatus` (PascalCase + `@@map`)
- [x] Coordenador roda script de composição → gera novo `schema.prisma` consolidado
- [x] Migration inicial criando o banco `cadastros` no Railway
- [x] Migration `fix_model_casing_revert` (24/04/2026) — PascalCase + `@@map`, tabelas snake_case com campos DDD e ghost flags
- [x] Endpoints CRUD (Empresa, Moeda, Unidade, NCM, OPE) com `x-internal-key`
- [x] Endpoint `GET /empresas/:suid/preview-impacto` (consulta produtos via API interna)
- [ ] Job de sincronização Portal Único → OPE
- [x] Cache Redis no client SDK (5min TTL por SUID)
- [x] Validações Zod (backend + frontend)
- [x] Função utilitária `derivarTipoVisual(empresa)`
- [x] Testes unitários e funcionais (53/53 verdes em 24/04/2026, incluindo cross-tenant)

### Fase 2 — Inclusão dos campos faltantes no Prisma do Pedido
**(Independente da Fase 1, pode rodar em paralelo. Exige aprovação do Coordenador — Mandamento 02.)**

Campos identificados como faltantes no schema atual de Pedido:
- [ ] `data_documento_proforma` (DateTime?)
- [ ] `data_documento_invoice` (DateTime?)
- [ ] Modelo `PedidoSnapshotEmpresa` (substitui colunas espalhadas de Importador/Exportador/Fabricante)
- [ ] Modelo `PedidoSnapshotOpe` (substitui colunas espalhadas de OPE)
- [ ] `AnexoPedido.tipo_documento` (proforma | invoice | bl_draft | bl_original | apolice | etc.)
- [x] Decisão fechada (22/04/2026): `AnexoPedido.tipo_documento` fica como String única (categoria pura — `proforma | invoice | certificado_origem | apolice | pedido | etc.`). Versão Draft/Original NÃO é atributo do anexo — vive em colunas de data explícitas no `model Pedido` (ex: `data_prev_aprovacao_draft_proforma` vs `data_prev_envio_original_proforma`).
- [ ] Campos de prev/conf/meta para etapas (~20 campos)
- [x] Decisão técnica fechada (22/04/2026): campos de etapa ficam em `model Pedido` como colunas. Sem tabela `PedidoEtapas` separada.
- [ ] `dt_transferencia_qtd` em `TrackingItemsTransferidos`
- [ ] Modelo `PedidoConfigAtualizacaoCadastros`

### Fase 3 — Alteração mínima no Configurador
- [ ] Adicionar `suid_empresa String?` em `Organizacao`
- [ ] Atualizar fluxo de onboarding: criar Empresa em Cadastros via API → receber SUID → criar Organizacao com SUID (transação atômica com compensação)
- [ ] Validação no onboarding: CNPJ obrigatório se país = BR
- [ ] Migration: para Organizacoes existentes, criar Empresa correspondente em Cadastros e popular `suid_empresa`

### Fase 4 — Migração de dados existentes
**(Maior risco. Janela de manutenção obrigatória.)**
- [ ] Script extrai todas as entidades implícitas dos produtos atuais (LPCO, NF Importação, Pedido)
- [ ] Deduplica por `(id_organizacao, cnpj)` e `(id_organizacao, tin, pais)`
- [ ] Cria registros em Cadastros recebendo SUID definitivo
- [ ] Atualiza referências nos produtos: substitui FKs antigos por snapshots `PedidoSnapshotEmpresa`
- [ ] Cria snapshots para todos os pedidos existentes (estado atual congelado)
- [ ] Validação: 0 registros órfãos, 0 duplicatas, contagem de pedidos preservada
- [ ] Backup completo antes de rodar
- [ ] Plano de rollback documentado e testado em staging

### Fase 5 — UI de gestão
- [ ] Tela de Cadastros (Empresas, Moedas, Unidades, NCM) com CRUD
- [ ] UI de cadastro de Empresa: checkboxes agrupados (quick options Importador / Exportador / Importador+Exportador) + checkboxes individuais (Fabricante / Agente / Despachante / Armador)
- [ ] Componente reutilizável `<ConfiguracaoAtualizacaoCadastros />` em nucleo-global
- [ ] `Configurações > Pedido > Cadastros`: matriz por linha (entidade × status com toggle)
- [ ] Mesma tela replicada em `Configurações > LPCO > Cadastros`, `Configurações > NF Importação > Cadastros`
- [ ] Endpoint `GET/PUT /api/v1/produtos/:produto/configuracao-atualizacao-cadastros`
- [ ] Default ao criar produto novo: flags ligadas em "Rascunho" e "Em emissão", desligadas nos demais
- [ ] UI de preview de impacto ao salvar Cadastros:
  - Loading state com aviso de lentidão
  - Lista de pedidos afetados por produto
  - Aviso de drift entre preview e execução
  - Aviso se algum produto estiver offline
- [ ] Banner retroativo ao abrir pedido com mudanças represadas
- [ ] Tooltip/help explicando comportamento

### Fase 6 — Testes e validação
- [ ] Testes cross-tenant (CAOA não vê Cadastros da Fiat)
- [ ] Testes de degradação (Cadastros offline → fluxos continuam onde permitido)
- [ ] Testes de snapshot (pedido emitido nunca muda)
- [ ] Testes de propagação (flag ON → mudança aplica, flag OFF → não aplica)
- [ ] Testes de preview (drift, offline, lentidão)
- [ ] Testes de banner retroativo
- [ ] Testes de validação CNPJ obrigatório BR / opcional exterior
- [ ] QA aprovação final

### Fase 7 — Deploy
- [ ] Deploy Cadastros (banco + serviço)
- [ ] Deploy Configurador atualizado
- [ ] Deploy produtos atualizados (LPCO, NF Importação, Pedido)
- [ ] Migração de dados (janela de manutenção)
- [ ] Smoke tests pós-deploy
- [ ] Monitoramento intensivo primeiras 48h

### Fase 8 — Pós-conclusão (memory permanente)
- [ ] Revisar 100% dos arquivos em `documentos-tecnicos/`
- [ ] Revisar 100% dos arquivos em `skills/`
- [ ] Identificar necessidade de edição/exclusão/criação
- [ ] Possível criação de `skills/servicos/cadastros/SKILL.md`
- [ ] Atualizar `MEMORY.md` com aprendizados pós-implementação

---

## 9. Roteiro de execução

| Passo | Ação | Status |
|-------|------|--------|
| 01 | Fechar este documento | Concluído |
| 02 | Criar banco Cadastros e modelar campos (Fase 1 + Fase 3) | Em andamento |
| 03 | Incluir no Prisma do Pedido os campos faltantes (Fase 2) | Bloqueado por 02 |
| 04 | Voltar à planilha DDD e seguir o PASSO 06 (com nova coluna "produtos que usam o campo") | Bloqueado por 03 |

---

## 10. Riscos identificados

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Migração de dados pode corromper produtos em produção | ALTA | Backup completo, rollback testado em staging, janela de manutenção, validação rigorosa antes de aplicar |
| Acoplamento Configurador ↔ Cadastros no onboarding | MÉDIA | Transação atômica com compensação; monitoramento de latência |
| Cadastros offline impacta criação de novos pedidos | MÉDIA | Cache Redis + fallback manual na UI documentado |
| Inflação de pedidos pra atualizar quando Cadastros muda | MÉDIA | Fila assíncrona, batch, monitoramento de throughput |
| Decisão de SUID per-tenant pode gerar arrependimento futuro | BAIXA | Aceito conscientemente; reversível adicionando tabela de reconciliação se necessário |
| Auditoria manual da planilha pode esquecer campos | MÉDIA | Coluna "produtos que usam" é preenchida pelo dono com a planilha em mãos; revisão pelo Coordenador antes de Fase 4 |

---

## 11. Itens em aberto

1. **Janela de manutenção pra Fase 4:** quando? Quanto tempo?
2. **Backup/rollback strategy:** snapshot full do banco ou point-in-time recovery?

---

## 12. Aprovação

- [x] Daniel (dono): aprovado
- [ ] Coordenador: validado executável
- [ ] QA: ciente do escopo de teste

---

**Fim do documento — versão 1.0 final.**
