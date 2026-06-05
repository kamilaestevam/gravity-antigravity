# Gravity Store — Plano Em Tela

**Rota:** `/store`  
**Doc:** `documentos-tecnicos/produtos-gravity/configurador/GRAVITY-STORE.md`  
**Script:** `run-gravity-store.ts`

## Checklist visual (QA manual)

| ID | Verificação | OK |
|----|-------------|-----|
| EMT-STORE-001 | 13 produtos / contadores coerentes com Admin | |
| EMT-STORE-002 | Puzzle só contratados + disponíveis (sem Em breve) | |
| EMT-STORE-003 | 4 faixas: Assinar → Ativo → Em breve → Todos | |
| EMT-STORE-004 | Setas carrossel quando overflow | |
| EMT-STORE-005 | Toolbar sincroniza com scroll (IntersectionObserver) | |
| EMT-STORE-006 | Cards mesma altura; tags no rodapé | |
| EMT-STORE-007 | Assinaturas workspace usa `gs-card--store` | |

## Ambiente

- `PLAYWRIGHT_BASE_URL` default `http://localhost:8000`
- `npx pm2 restart cfg-front cfg-back` após deploy

## Execução

```bash
npx tsx testes/testes-em-tela/gravity-store/run-gravity-store.ts
```

Screenshots em `testes/testes-em-tela/gravity-store/resultados/`.
