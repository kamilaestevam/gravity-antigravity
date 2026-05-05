# Cadastros — Política de Snapshot

> **Lei única do Gravity sobre como cada produto consome entidades do banco Cadastros.**
> Aplicável a `Empresa`, `Moeda`, `Unidade`, `NCM`, `Pais` e qualquer entidade futura que viva em `servicos-global/cadastros/`.
> Em conflito com qualquer outro documento, esta skill prevalece.

---

## Princípio fundamental

> **Cadastros é home canônica. Tela de gestão lê vivo. Documento emitido congela snapshot.**

Toda entidade de Cadastros tem **uma única fonte de verdade**: o banco do serviço Cadastros (`CADASTROS_DATABASE_URL`). Tudo o que aparece como "empresa", "moeda", "unidade" ou "NCM" em qualquer tela ou documento do Gravity nasce ali.

A partir desse princípio, dois — e apenas dois — modos de consumo são permitidos:

1. **Leitura ao vivo** (REST direto da API Cadastros): para telas de gestão, simulações, cotações, orquestradores e qualquer fluxo onde o **dado mais recente é o correto**.
2. **Snapshot congelado**: para qualquer produto que **emita documento legal, fiscal ou financeiro** referenciando a entidade. O snapshot fica no banco do produto que emite, sem FK física para o Cadastros.

Misturar os dois modos no mesmo fluxo (ex.: cache local "para performance" em tela de gestão) é **proibido** — gera janela de inconsistência sem upside.

---

## Onde se aplica (escopo)

A política vale para **todo produto e serviço** que referencia entidade de Cadastros:

| Produto / Serviço | Padrão atual | Padrão exigido |
|---|---|---|
| Configurador (`/workspace/empresas-e-parceiros`) | Leitura ao vivo (gestão) | Mantém — gestão da entidade |
| Configurador (Modal Editar Empresa — campo País) | Leitura ao vivo via `usePaises()` hook | Mantém — gestão. Lista vem de `GET /api/v1/cadastros/paises` |
| Pedido | Snapshot (`pedido_snapshot_empresa`) | Mantém — referência canônica desta lei |
| LPCO | (a definir) | **Snapshot** — emite ao Portal Único |
| NF-Importação | (a definir) | **Snapshot** — emite NF-e ao SEFAZ |
| Bid-Cambio | (a definir) | **Snapshot na confirmação** — operação cambial |
| Bid-Frete (cotação) | Sem ref | Leitura ao vivo (estado vivo até virar contrato) |
| Bid-Frete (contrato) | (a definir) | **Snapshot** ao virar contrato |
| Simula-Custo | Sem ref | Leitura ao vivo (descartável) |
| Financeiro-Comex | Consome do Pedido | Herda snapshot do Pedido — **não cria próprio** |
| Processo (orquestrador) | Leitura ao vivo via `cadastrosClient.ts` | Mantém — não emite |

### Master Data (catálogos globais — leitura ao vivo única)

`Pais`, `Moeda`, `Unidade`, `NcmSync` são **catálogos globais** sem `id_organizacao`. Diferente das entidades por organização (Empresa), eles:

- Têm **fonte única** em Cadastros — código fora de Cadastros não pode ter cópia hardcoded da lista
- Sempre acessados via leitura ao vivo (REST direto)
- Cache em memória client-side é permitido (lista raramente muda) — `usePaises()`, `useMoedas()` etc.
- **NÃO** geram snapshot por documento (mesma moeda hoje e ontem; mudar valor de moeda = nova moeda)
- Quando uma entidade que se usa um deles for emitida em documento (Pedido cita Empresa-em-país-X), o snapshot da entidade-pai inclui os campos relevantes do master data como cópia denormalizada

Se um produto novo aparecer, ele cai em uma destas categorias por critério de risco (REGRA 1).

---

## Quando consultar

- **Antes** de criar produto novo que referencie entidade de Cadastros
- **Antes** de modelar tabela que guarde dado de Cadastros
- **Antes** de implementar emissão de documento que cite Empresa/Moeda/Unidade/NCM
- **Antes** de propor cache local de Cadastros (resposta padrão: não)
- **Sempre** que um agente perguntar "como acesso o cadastro daqui?"

---

## As 8 Regras

### REGRA 1 — Critério de decisão: snapshot OU leitura ao vivo

Toda referência a entidade de Cadastros pertence a **exatamente um** dos dois modos. O critério é:

| Pergunta | Se SIM | Se NÃO |
|---|---|---|
| O fluxo emite documento com efeito legal, fiscal ou financeiro vinculante? | **Snapshot** | continua |
| O fluxo grava registro que terceiro pode auditar (governo, banco, cliente externo)? | **Snapshot** | continua |
| O fluxo é tela de gestão direta da entidade (CRUD)? | **Leitura ao vivo** | continua |
| O fluxo é simulação/cotação/orquestração descartável? | **Leitura ao vivo** | rever |

Se nenhuma das 4 perguntas decide → escalar para o Coordenador.

---

### REGRA 2 — Cadastros é home canônica e única

A entidade Empresa (e demais) só existe em uma tabela viva: a do serviço Cadastros (`servicos-global/cadastros`).

❌ **Proibido:** criar `model Empresa` (ou equivalente) em qualquer outro `schema.prisma` do monorepo.
✅ **Permitido:** criar `model <produto>SnapshotEmpresa` no schema do produto que emite.

---

### REGRA 3 — Snapshot fica no banco do produto que emite

O snapshot vive no banco do **próprio produto** que emite o documento (ex: `pedido_snapshot_empresa` está no banco do Pedido), não em organizacao-shared nem no Cadastros.

❌ **Proibido:** snapshot compartilhado entre produtos (ex: "tabela única de snapshots de Empresa em organizacao-shared").
✅ **Permitido:** cada produto que emite tem o seu próprio snapshot, mesmo que o pattern de modelagem seja idêntico.

**Justificativa:** o snapshot pertence ao **documento do produto**. Compartilhar quebra isolamento e cria dono ambíguo.

---

### REGRA 4 — FK lógica via SUID, sem FK física cross-banco

O snapshot referencia o registro original em Cadastros via `suid_<entidade>` (string), **não** via `@relation` Prisma.

```prisma
// ✅ Correto — referência lógica, ponte cross-banco
model PedidoSnapshotEmpresa {
  id                  String  @id @default(cuid())
  id_pedido           String
  suid_empresa        String  // referência lógica ao Cadastros (sem FK física)
  // ...
  pedido              Pedido  @relation(fields: [id_pedido], references: [id_pedido], onDelete: Cascade)
  @@map("pedido_snapshot_empresa")
}
```

```prisma
// 🚫 Proibido — FK física para banco de outro produto
model PedidoSnapshotEmpresa {
  // ...
  empresa             Empresa @relation(fields: [suid_empresa], references: [suid_empresa])  // BLOQUEADO
}
```

**Justificativa:** Schema-per-Produto + Schema-per-Organização (ver `arquitetura/schema-composition`). FK física entre bancos é arquiteturalmente impossível e quebra deploy.

---

### REGRA 5 — Modelagem mínima do snapshot

Todo snapshot **deve** ter, no mínimo:

| Campo | Tipo | Função |
|---|---|---|
| `id` | String @id @default(cuid()) | PK do snapshot |
| `id_organizacao` | String | Tenant isolation (ver `lei/isolamento-organizacao`) |
| `id_<documento_pai>` | String | FK para o documento que originou o snapshot (ex: `id_pedido`) |
| `suid_<entidade>` | String | Referência lógica ao Cadastros |
| Campos canônicos da entidade | conforme schema da entidade | Cópia congelada — usar exatamente os mesmos nomes do schema de Cadastros |
| `congelado_em` | DateTime @default(now()) | Quando o snapshot foi tirado |
| `motivo_congelamento` | String | Taxonomia da REGRA 7 |

**Indexação obrigatória** (ver `lei/database-governance`):

```prisma
@@index([id_organizacao])
@@index([id_organizacao, id_<documento_pai>])
@@index([id_organizacao, suid_<entidade>])
```

---

### REGRA 6 — Naming Prisma + tabela (DDD)

Conforme `lei/ddd-nomenclatura` REGRA 10:

- **Model name** PascalCase em PT-BR: `PedidoSnapshotEmpresa`, `LpcoSnapshotEmpresa`, `NfSnapshotEmpresa`
- **Tabela** snake_case em PT-BR via `@@map`: `pedido_snapshot_empresa`, `lpco_snapshot_empresa`, `nf_snapshot_empresa`
- **Padrão fixo:** `<produto>_snapshot_<entidade>` (singular)

Sufixo de campo segue Onda 38 quando aplicável (ex: `id_organizacao_empresa` se for cópia exata; campos do snapshot copiam o naming canônico de Cadastros).

---

### REGRA 7 — Taxonomia de `motivo_congelamento`

Valores permitidos (string literal — não enum, para flexibilidade cross-produto):

| Valor | Quando usar |
|---|---|
| `'emissao'` | Primeiro congelamento — momento em que o documento é emitido/efetivado |
| `'atualizacao_manual'` | Re-snapshot disparado por ação explícita do usuário (raro, requer justificativa em UI) |
| `'transicao_status'` | Re-snapshot quando o documento muda de status que exige re-congelamento (definido por produto) |

Outros valores **não são permitidos** sem alteração desta skill.

---

### REGRA 8 — Quem autoriza criação/alteração de snapshot

**Mandamento 02** (schema intocável) se aplica integralmente:

- Modelo Prisma de snapshot só é alterado via migration controlada
- Migration cabe ao **Coordenador**, nunca ao agente do produto
- Alterar campos de snapshot existente exige migration de backfill (snapshots antigos não podem ficar com campos NULL retroativamente sem decisão explícita)

---

## Quick reference — decisão em 3 segundos

```
Tela CRUD de gestão da entidade?         → leitura ao vivo (REST Cadastros)
Documento emitido (legal/fiscal/financ)? → snapshot
Simulação/cotação/orquestração?          → leitura ao vivo
Cache "pra performance"?                 → NÃO. Cadastros é fonte canônica.
Em dúvida?                                → escalar Coordenador
```

---

## Anti-padrões proibidos

- ❌ `model Empresa` (ou outra entidade Cadastros) em schema fora do serviço Cadastros
- ❌ Snapshot compartilhado entre produtos (em organizacao-shared, configurador, ou central)
- ❌ FK física Prisma entre snapshot e tabela canônica de Cadastros
- ❌ Cache local de Cadastros em tela de gestão "para performance"
- ❌ Snapshot parcial (omitir campos canônicos por economia de espaço)
- ❌ Snapshot sem `congelado_em` ou sem `motivo_congelamento`
- ❌ Reusar mesmo registro de snapshot para múltiplos documentos (1 documento = 1 snapshot)
- ❌ Editar snapshot retroativamente (snapshot é imutável — para mudar, criar novo com `motivo_congelamento='atualizacao_manual'`)
- ❌ Agente de produto criar/alterar tabela de snapshot sem o Coordenador

---

## Referência canônica de modelagem

A primeira implementação correta — usar como gabarito para LPCO, NF-Importação, Bid-Cambio:

[`servicos-global/produto/pedido/prisma/fragment.prisma:480`](../../../../servicos-global/produto/pedido/prisma/fragment.prisma) — `model PedidoSnapshotEmpresa`

Inclui:

- 6 papéis da empresa no documento (importador, exportador, fabricante, agente, despachante, armador)
- Endereço completo congelado
- Contatos congelados (especialmente para exportador)
- Relação Exportador↔Fabricante (campo de domínio do Pedido)
- Cnpj raiz pré-calculado (otimização para queries)

Cada produto adapta os campos extras conforme seu domínio (ex: LPCO pode ter campos de habilitação RADAR; NF-Importação pode ter campos de inscrição estadual). O **núcleo** (REGRA 5) é constante.

---

## Referências cruzadas

- **Mandamento 02** — Schema intocável, só Coordenador altera
- **Mandamento 03** — Glossário canônico DDD
- **`lei/ddd-nomenclatura`** — REGRA 10 (PascalCase + `@@map`)
- **`lei/database-governance`** — Paridade Front=Back=Banco, índices obrigatórios
- **`lei/isolamento-organizacao`** — `id_organizacao` em todo model
- **`arquitetura/schema-composition`** — Schema-per-Produto, schema-per-Organização
- **`papeis/coordenador`** — Quem orquestra migration de snapshot
