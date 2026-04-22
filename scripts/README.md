# scripts/

Diretório de uso EXCLUSIVO do Coordenador.

## Estrutura

```
scripts/
├── ativamente/       ← chamados por package.json, CI, lint-staged, testes
├── sob-demanda/      ← rodados manualmente (setup, seed, cleanup local)
├── package.json      ← deps (pg, tsx, typescript)
└── tsconfig.json
```

## ativamente/ — USADOS por automação

| Arquivo | Consumidor |
|---|---|
| `apply-rls.sql` | `package.json:db:apply-rls` + `.github/workflows/security.yml` |
| `apply-rls-user.sql` | RLS por user_id (documentado em auditoria de segurança) |
| `compose-tenant-schema.ts` | `package.json:db:compose` + `.github/workflows/deploy.yml` |
| `check-deps.ts` | `package.json:check:deps` + lint-staged pre-commit |
| `seed-staging.ts` | `package.json:db:seed:staging` |
| `translate.ts` + `translate-hook.ts` | `package.json:translate` + `translate:check` |
| `validate-test-ids.ts` | `package.json:validate:test-ids` |
| `validate-cobertura.ts` | `package.json:validate:cobertura` |
| `validate-testes.ts` | `package.json:validate:testes` |
| `migrate-all-tenants.ts` | Orquestrador Schema-per-Tenant (ADR-003) |
| `migrate-tenants/` | 3 fases: provision → backfill → cutover |
| `rotate-internal-key.ts` | Rotação de chaves S2S |

## sob-demanda/ — rodados manualmente

| Arquivo | Uso |
|---|---|
| `setup-dev.ts` | Setup completo de dev local (migrate + seed) |
| `seed-demo.ts` | Tenant demo + SimulaCusto ativo |
| `seed-dev.ts` | Padrão Ouro de ambiente de testes |
| `seed-test-user.ts` | Dados de teste para fluxo completo |
| `cleanup-users.ts` | Remove users (exceto Super Admin) no Clerk + Configurador |
| `cleanup-seed-tenants.ts` | Limpa tenants de seed/demo |
| `check-products.ts` | Lista produtos do catálogo |
| `dev-local.ps1` | Sobe plataforma inteira localmente (Windows) |
| `start-configurador-backend.bat` | Atalho p/ backend configurador |

## Regra
Nenhum agente modifica arquivos aqui sem autorização explícita do Coordenador.
