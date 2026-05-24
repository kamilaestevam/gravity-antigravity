# Pedido · Parceiros · Fornecedores — Plano consolidado

**Data:** 2026-05-25  
**Status:** Passo 01–03 ✅ · Passo 02 prod ✅ (2026-05-24) · PM2 local OK · UI (04) pendente  
**Decisão dono (2026-05-25):** cartório + vínculos no **Cadastros**; **usuario** só no Configurador; modelo C para portal (troca de crachá).

---

## Passo 01 — `fornecedor_organizacao` no Cadastros ✅

**Migrations:**

- `20260524120000_add_fornecedor_organizacao` — tabela + ENUM inicial
- `20260525120000_trim_tipo_fornecedor_organizacao_enum` — ENUM só prestadores (12 valores)

**Aplicar:**

```bash
cd servicos-global/cadastros
npx tsx ../../scripts/ativamente/compose-cadastros-schema.ts
npx prisma migrate deploy --schema=prisma/schema.prisma
npx prisma generate --schema=prisma/schema.prisma
```

**Configurador:** `fornecedor_organizacao` legada **removida** (Passo 02 teste + prod).

---

## 1. Divisão de bancos (acordado)

| Banco | Contém | Não contém |
|-------|--------|------------|
| **Cadastros** | `fornecedor` + `fornecedor_organizacao` | `usuario`, Clerk |
| **Configurador** | `usuario`, `usuario_workspace`, permissões | COMEX, snapshot (sem `fornecedor_organizacao`) |
| **Pedido** | Snapshot δ na emissão | Master data vivo |

### Usuario FORNECEDOR — onde está o vínculo?

- **Não** existe `id_fornecedor` na tabela `usuario`.
- `usuario.tipo_usuario = FORNECEDOR` + auth Clerk em `id_clerk_usuario`.
- Vínculo operacional: `Cadastros.fornecedor_organizacao.id_usuario` → `usuario.id_usuario`.
- **Troca de crachá:** `GET /api/v1/cadastros/fornecedores-organizacao/por-usuario?id_usuario=...` lista orgs/clientes do prestador.

---

## 2. Dois regimes de negócio

| Regime | Exemplo | `id_fornecedor` em várias orgs? |
|--------|---------|--------------------------------|
| **A — Parceiro pedido** | Exportador Shenzhen | Não (SUID por org cadastro — §2.3 cadastros-arquitetura) |
| **B — Prestador portal** | Agente / Despachante CNPJ | **Sim** — um SUID, N linhas `fornecedor_organizacao` |

---

## 3. Colunas — `fornecedor` (Cadastros cartório)

> **Produção:** tabela `fornecedor` (rename `empresa` → `fornecedor` aplicado teste + prod).

| Coluna alvo | Hoje (`empresa`) | Tipo | Obrig. |
|-------------|------------------|------|--------|
| `id_fornecedor` | `suid_empresa` | PK SUID | ✅ |
| `id_organizacao_cadastro_fornecedor` | `id_organizacao_empresa` | String | ✅ |
| `nome_fornecedor` | `nome_empresa` | String | ✅ |
| `cnpj_fornecedor` | `cnpj_empresa` | String? | BR |
| `tin_fornecedor` | `tin_empresa` | String? | exterior |
| `pais_fornecedor` | `pais_empresa` | ISO-2 | ✅ |
| `estado_provincia_fornecedor` | `estado_empresa` | String? | |
| `cidade_fornecedor` | `cidade_empresa` | String? | |
| `cep_zipcode_fornecedor` | `zipcode_empresa` | String? | |
| `endereco_fornecedor` | `endereco_empresa` | String? | |
| `email_principal_fornecedor` | `email_empresa` | String? | |
| `telefone_principal_fornecedor` | `telefone_empresa` | String? | |
| `whatsapp_principal_fornecedor` | `whatsapp_empresa` | String? | |
| `pode_ser_*_fornecedor` | `pode_ser_*_empresa` | Boolean | papéis possíveis |
| `ativo_fornecedor` | `ativo_empresa` | Boolean | ✅ |
| `criado_em_fornecedor` | `criado_em_empresa` | DateTime | ✅ |
| `atualizado_em_fornecedor` | `atualizado_em_empresa` | DateTime | ✅ |

**Sem** `tipo_fornecedor` ENUM único no master — tipo do vínculo em `fornecedor_organizacao`.

---

## 4. Colunas — `fornecedor_organizacao` (Cadastros vínculos)

**Sem snapshot** (nome/CNPJ via FK + enrich API). Snapshot δ só no Pedido/contrato.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id_fornecedor_organizacao` | PK cuid | ID da linha de vínculo |
| `id_fornecedor` | FK | → `empresa.suid_empresa` |
| `id_organizacao` | String | Org **cliente** (contexto crachá / habilitação) |
| `tipo_fornecedor_organizacao` | ENUM (12) | Papel neste vínculo |
| `status_fornecedor_organizacao` | ENUM | ATIVO / INATIVO / PENDENTE_APROVACAO |
| `id_usuario` | String? | → `usuario.id_usuario` (Configurador) |
| `data_criacao_fornecedor_organizacao` | DateTime | |
| `data_atualizacao_fornecedor_organizacao` | DateTime | |

**ENUM `tipo_fornecedor_organizacao`:** AGENTE_CARGA, DESPACHANTE_ADUANEIRO, ARMADOR, CIA_AEREA, transportadoras, armazéns, BANCO, seguradoras, CORRETORA_CAMBIO, FABRICANTE.

**Removidos:** EXPORTADOR_QUANDO_IMPORTACAO, IMPORTADOR_QUANDO_EXPORTACAO (contraparte = `empresa` + Pedido).

**Unique:** `(id_fornecedor, id_organizacao, tipo_fornecedor_organizacao)`.

---

## 5. Passo 03 — API Cadastros ✅ (código)

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/api/v1/cadastros/fornecedores-organizacao` | Lista por `id_organizacao` (header) |
| GET | `/api/v1/cadastros/fornecedores-organizacao/por-usuario` | Troca de crachá (`?id_usuario=`) |
| GET | `/api/v1/cadastros/fornecedores-organizacao/:id` | Detalhe + enrich fornecedor |
| POST | `/api/v1/cadastros/fornecedores-organizacao` | Criar vínculo |
| PATCH | `/api/v1/cadastros/fornecedores-organizacao/:id` | Atualizar status / id_usuario |
| DELETE | `/api/v1/cadastros/fornecedores-organizacao/:id` | Remover vínculo |

**Schemas Zod:** `servicos-global/cadastros/shared/schemas/fornecedor-organizacao.schema.ts`

---

## 6. Pedido — partes da operação (inalterado)

| Tipo | Nacional (= workspace) | Estrangeiro (= Cadastros `empresa`) |
|------|------------------------|-------------------------------------|
| **Importação** | Importador = workspace | Exportador = cadastro + snapshot pedido |
| **Exportação** | Exportador = workspace | Importador = cadastro + snapshot pedido |

---

## 7. Backlog restante

| Passo | Tarefa |
|-------|--------|
| **01b** | ✅ ENUM + migrations teste (kodama) |
| **02** | ✅ Drop `fornecedor_organizacao` Configurador (teste + prod, proxy `switchback.proxy.rlwy.net:13516`) |
| **03b** | ✅ Proxy Config (`/fornecedores`, `/empresas`→rewrite, `/cadastros/*`); convite FORNECEDOR + vínculo Cadastros = **04** |
| **04** | UI Empresas e Parceiros + portal crachá |
| **05** | ✅ Drop `exportador_quando_importacao` + `importador_quando_exportacao` |
| **Rename** | ✅ `empresa` → `fornecedor` (Cadastros, teste + prod) |

---

## 8. Checkpoint git

```bash
git log --oneline -5 -- documentos-tecnicos/produtos-gravity/PEDIDO-PARCEIROS-FORNECEDORES-PLANO.md
```

---

*Atualizado 2026-05-25 após alinhamento colunas + usuario + API Passo 03.*
