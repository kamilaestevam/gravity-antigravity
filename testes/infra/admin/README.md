# `testes/infra/admin/` — infraestrutura compartilhada da UI Admin/Testes

> Lógica de domínio **sem React** usada pelo painel Admin do Configurador (escopo `ADMIN` / sublocal Testes).
> A UI continua em `servicos-global/configurador/src/pages/admin/`.

## Divisão de responsabilidades

| Camada | Pasta | Responsabilidade |
|--------|-------|------------------|
| **Domínio** | `testes/infra/admin/` | Contratos Zod, mappers, rótulos, deduplicação, snapshots (persistência fica no banco, via API) |
| **UI** | `configurador/.../ModalTestesExecutar.tsx` | Modal, abas, estilos, APIs, estado React, i18n |
| **Testes** | `testes/testes-unitarios/configurador/` | Vitest das funções puras (sem browser real) |

## Módulos atuais

| Arquivo | Função |
|---------|--------|
| `testes-favoritos-admin.ts` | Favoritos de execução manual — produto, ambiente, tipos, planos + `planos_resumo` |

## Import

```ts
import { testeFavoritoUsuarioSchema, rotuloTesteFavoritoUsuario } from '@testes/infra/admin/testes-favoritos-admin'
```

Alias configurado em `tsconfig.json` (raiz), `tsconfig.paths-servico.json` e `servicos-global/configurador/vite.config.ts`.

## Regras para novos módulos

1. **Só lógica pura** — se precisar de `fetch`, Prisma ou JSX, não entra aqui.
2. **Contrato Zod** — toda persistência ou payload serializado valida com Zod (REGRA 06/09).
3. **Teste unitário** — adicionar spec em `testes/testes-unitarios/configurador/` ou `testes/testes-unitarios/infra/admin/`.
4. **Documentar** — atualizar `documentos-tecnicos/testes/tecnico/01-arquitetura-sistema-testes.md`.

## Favoritos — persistência no banco

Desde 2026-06-11 os favoritos vivem na tabela `teste_favorito_usuario` (model Prisma
`TesteFavoritoUsuario`, banco do Configurador), escopados por `id_usuario` — máximo 20 por
usuário (validado no backend). Substituiu o `localStorage`, que não acompanhava o usuário
entre navegadores/máquinas/janelas anônimas.

- **Rotas:** `GET/POST/DELETE /api/v1/admin/testes-favoritos` (ver `server/routes/admin.ts`).
- **Client:** `adminTestesFavoritosApi` em `configurador/src/services/api-client.ts`.
- **Contrato Zod:** `testeFavoritoUsuarioSchema` (este módulo) — paridade nominal com as colunas.

Favoritos salvos **antes** de `planos_resumo` exibem só o rótulo curto até o usuário re-salvar
ou abrir com o mesmo produto (catálogo de planos carregado).
