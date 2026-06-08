# `testes/infra/admin/` — infraestrutura compartilhada da UI Admin/Testes

> Lógica de domínio **sem React** usada pelo painel Admin do Configurador (escopo `ADMIN` / sublocal Testes).
> A UI continua em `servicos-global/configurador/src/pages/admin/`.

## Divisão de responsabilidades

| Camada | Pasta | Responsabilidade |
|--------|-------|------------------|
| **Domínio** | `testes/infra/admin/` | Contratos Zod, localStorage, rótulos, deduplicação, snapshots |
| **UI** | `configurador/.../ModalTestesExecutar.tsx` | Modal, abas, estilos, APIs, estado React, i18n |
| **Testes** | `testes/testes-unitarios/configurador/` | Vitest das funções puras (sem browser real) |

## Módulos atuais

| Arquivo | Função |
|---------|--------|
| `testes-favoritos-admin.ts` | Favoritos de execução manual — produto, ambiente, tipos, planos + `planos_resumo` |

## Import

```ts
import { lerTestesFavoritosAdmin } from '@testes/infra/admin/testes-favoritos-admin'
```

Alias configurado em `tsconfig.json` (raiz), `tsconfig.paths-servico.json` e `servicos-global/configurador/vite.config.ts`.

## Regras para novos módulos

1. **Só lógica pura** — se precisar de `fetch`, Prisma ou JSX, não entra aqui.
2. **Contrato Zod** — toda persistência ou payload serializado valida com Zod (REGRA 06/09).
3. **Teste unitário** — adicionar spec em `testes/testes-unitarios/configurador/` ou `testes/testes-unitarios/infra/admin/`.
4. **Documentar** — atualizar `documentos-tecnicos/testes/tecnico/01-arquitetura-sistema-testes.md`.

## Favoritos — chave localStorage

`admin:testes-favoritos:{id_usuario}` — máximo 20 entradas por usuário.

Favoritos salvos **antes** de `planos_resumo` exibem só o rótulo curto até o usuário re-salvar ou abrir com o mesmo produto (catálogo de planos carregado).
