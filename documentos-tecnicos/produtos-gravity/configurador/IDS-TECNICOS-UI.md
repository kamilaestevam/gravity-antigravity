# IDs Técnicos visíveis na UI — Configurador e Admin

> **Decisão do dono:** 2026-06-12 · **Entrega:** PR #303 (`claude/nifty-northcutt-010941`)
> **Motivação:** a investigação do erro *"Não foi possível carregar a empresa da sua organização"* (2026-06-10/11) exigiu SQL manual em produção só para descobrir `id_organizacao` e `suid_empresa_organizacao`. Esta entrega torna os IDs técnicos visíveis e copiáveis na própria UI — diagnóstico de vínculos sem abrir banco.

---

## Onde cada ID aparece

| Tela | ID(s) exposto(s) | Forma |
|------|------------------|-------|
| Configurador → Organização | `id_organizacao` | linha no identity card, sob o subdomínio |
| Configurador → Workspaces | `id_workspace` | coluna entre Workspace e Subdomínio |
| Configurador → Fornecedores | `id_fornecedor` (SUID) | coluna entre Fornecedor e CNPJ/TIN |
| Configurador → Usuários | `id_usuario` | coluna entre Usuário e E-mail |
| Admin → Organizações | `id_organizacao` + `suid_empresa_organizacao` | colunas entre Organização e Subdomínio |
| Admin → Usuários Globais | `id_usuario` | coluna entre Usuário e E-mail |
| Admin → Fornecedores | `id_fornecedor` (SUID) | coluna entre Organização e Fornecedor |
| Admin → Visão Geral | `suid_empresa_organizacao` | linha "ID Empresa" no card HQ Owner (decisão do dono: card mostra **só** o ID Empresa) |

## Padrão de implementação (obrigatório)

- **Componente único:** `servicos-global/configurador/src/shared/CelulaIdCopiavel.tsx` — monospace discreto, clique copia (`navigator.clipboard`) e toast de confirmação via `useShellStore.addNotification`. **Novas colunas de ID DEVEM usá-lo** — nunca recriar o snippet inline (extraído no code-review do PR #303, item DRY).
- **Ausência é informação (Mand. 08):** org sem Empresa vinculada exibe badge âmbar **"sem empresa"** (em vez de célula vazia). Esse estado é exatamente a causa do erro de onboarding incompleto no modal Novo Pedido do produto Pedido.
- **i18n:** telas que usam `t()` têm chaves dedicadas (`admin.usuarios-globais.tabela.id_usuario*`, `workspace.users.tabela.id_usuario*`, `workspace.workspaces.tabela.id_workspace*`, `tabela.id_clique_copiar`) em pt/en/es. Telas historicamente 100% literais (OrganizacoesAdmin, FornecedoresAdmin) seguem o padrão literal do próprio arquivo.

## Contratos de API alterados (aditivos)

| Rota | Mudança |
|------|---------|
| `GET /v1/admin/organizacoes` | select inclui `suid_empresa_organizacao` (string \| null); DTO repassa. Tipo front: `OrganizacaoApi.suid_empresa_organizacao?: string \| null` |
| `GET /v1/admin/visao-geral` | select inclui `suid_empresa_organizacao`; DTO repassa |
| `GET/PUT /v1/admin/visao-geral` (front) | contrato agora é **Zod**: `platformConfigApiSchema` em `src/services/api-client.ts`, com `.parse()` em `getConfig`/`updateConfig` (Mand. 06/09). PUT não devolve `suid` → campo `.optional()` no schema |

## Semântica dos IDs (referência rápida)

- `id_organizacao` — chave da organização no Configurador (CUID/UUID).
- `suid_empresa_organizacao` — SUID da **Empresa no Cadastros** vinculada à org (`${PAIS}-${SLUG}-${SEQ_5}`, ex.: `BR-GRAVITY-00001`). O vínculo real é `empresa.id_organizacao_empresa = id_organizacao` (match exato; SUID/nome não participam do lookup).
- `id_fornecedor` — SUID no Cadastros; compartilha namespace com Empresa (`gerar-suid-empresa.ts` verifica colisão nos dois).

## Follow-ups registrados

1. Converter `OrganizacaoApi` (listagem admin, payload grande/aninhado) para Zod — refactor incremental aprovado no code-review, payload a payload.
2. Promover `CelulaIdCopiavel` ao `nucleo-global` quando outro produto precisar do padrão (decisão Coordenador: hoje todos os consumidores são do Configurador).
