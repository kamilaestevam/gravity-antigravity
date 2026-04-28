# @tenant/cadastros

Serviço Gravity — **cartório de identidades de domínio COMEX**.

## Propósito

Banco isolado (4º banco do ecossistema) que centraliza:

- **Empresa** — Importador, Exportador, Fabricante, Agente, Despachante, Armador (per-tenant, com SUID estável).
- **Moeda, Unidade, NCM** — catálogos compartilhados entre produtos.
- **OPE** — sincronizado do Portal Único (SISCOMEX).
- **HistoricoStatusOPE** — histórico de transições de status do OPE.

Toda empresa do mundo COMEX é registrada **primeiro** aqui e recebe um SUID único e estável, usado como referência por todos os outros bancos (sem FK física — Database-per-Service mantido).

## Status

**Fase 1 — Implementação funcional (em andamento).**

CRUD de Empresa, Moeda, Unidade e NCM funcionando contra `gravity-cadastros-teste`.
SDK do client tipado, com cache TTL in-memory e validação Zod bilateral.
Endpoint `preview-impacto` consulta os 3 produtos consumidores via API interna,
com fallback gracioso quando algum está offline. Testes unitários e funcionais
implementados (não rodados ainda nesta task).

Pendente nesta fase: job de sincronização Portal Único → OPE; troca do cache
in-memory por Redis (quando o monorepo tiver Redis); UI de gestão (Fase 5).

## Documento técnico de referência

`documentos-tecnicos/banco-dados/cadastros-arquitetura.md` (v1.0 final, aprovado por Daniel em 22/04/2026).

Toda decisão de modelagem, validação ou fluxo está nele. Em caso de dúvida, ele prevalece sobre qualquer outro documento.

## Estrutura

```
cadastros/
├── package.json
├── tsconfig.json
├── README.md
├── .env.example
├── prisma/
│   └── fragment.prisma          # models Empresa, Moeda, Unidade, NCM, OPE, HistoricoStatusOPE
├── shared/
│   └── schemas/                 # CONTRATOS BILATERAIS (Mandamento 09) — server e client importam daqui
├── server/
│   └── src/
│       ├── index.ts             # entry point Express + errorHandler
│       ├── lib/                 # prisma singleton, AppError
│       ├── routes/              # CRUD com middleware x-internal-key
│       ├── schemas/             # ponte de re-export pra shared/schemas (back-compat)
│       ├── services/
│       │   └── preview-impacto.ts   # consulta os 3 produtos consumidores
│       └── utils/
│           ├── derivar-tipo-visual.ts
│           └── gerar-suid.ts        # gera ${PAIS}-${SLUG}-${SEQ_5}
├── client/
│   └── src/
│       ├── index.ts             # SDK tipado com cache + Zod
│       └── cache.ts             # CacheTTL genérico (Map+TTL+max size)
└── __tests__/
    ├── helpers/                 # montarAppDeTeste, constantes
    ├── unit/                    # cache, schemas, gerar-suid, derivar-tipo-visual
    └── functional/              # CRUD real + preview-impacto + cross-tenant
```

## Próximos passos (Fase 1, ordem obrigatória)

1. **Coordenador** valida o `fragment.prisma` e roda o script de composição → gera o `schema.prisma` consolidado (Mandamento 02 — nenhum agente edita schema diretamente).
2. **Coordenador** cria o banco `cadastros` no Railway e roda a migration inicial.
3. Implementar de fato os endpoints CRUD (Empresa, Moeda, Unidade, NCM) — substituir stubs por queries Prisma com filtro obrigatório por `id_organizacao` (Isolamento por Organização).
4. Implementar `GET /empresas/:suid/preview-impacto` (consulta produtos via API interna).
5. Implementar job de sincronização Portal Único → `OPE`.
6. Implementar cache Redis no SDK do client (TTL 5min por SUID).
7. Testes unitários, funcionais e cross-tenant.

## Regras invioláveis aplicadas

- **Mandamento 02:** este serviço NÃO toca em `schema.prisma`. Só fornece `fragment.prisma`.
- **DDD nomenclatura:** PT-BR em todo código, sem `@map`/`@@map`, booleans sem prefixo `is_`.
- **Isolamento por Organização:** toda query (futura) precisa de filtro por `id_organizacao` — Empresas e OPE são per-organizacao. Catálogos (Moeda, Unidade, NCM) são globais.
- **Snapshot obrigatório:** produtos consumidores (Pedido, LPCO, NF Importação) DEVEM gravar snapshot dos campos críticos da Empresa no momento da emissão. Cadastros não é dependência hard de runtime para pedidos já emitidos.
- **Comunicação inter-serviço:** apenas REST com header `x-internal-key`. Sem JOINs cross-database.

## Variáveis de ambiente esperadas

```
CADASTROS_DATABASE_URL=postgres://...     # criada na Fase 1 pelo Coordenador
INTERNAL_SERVICE_KEY=...                  # global, no .env.local da raiz
PORT=8030                                  # placeholder — confirmar com governança/portas
```

## Itens explicitamente fora desta rodada

- Endpoint `preview-impacto` (precisa coordenar com produtos consumidores).
- Job de sincronização Portal Único (precisa credenciais).
- Cache Redis (precisa Redis configurado no monorepo).
- Testes (próxima task).
- UI de gestão (Fase 5 do documento técnico).
