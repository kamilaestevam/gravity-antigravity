# Organização por escopo — `plano-teste` e `resultado-teste`

> **Obrigatório a partir de 2026-06-06.** Cada feature testada tem duas pastas fixas no mesmo nível do escopo.
> Prints, `RESULTADO.txt` e evidências de **um** run ficam isolados — nunca compartilhados entre execuções.

---

## Regra

Todo escopo (feature) em qualquer tipo de teste segue:

```
testes/<tipo>/<produto>/<area>/<feature>/
├── plano-teste/          ← plano, specs do tipo, runner (quando aplicável)
└── resultado-teste/      ← uma subpasta por execução (prints + RESULTADO.txt)
    └── <runId>/
        ├── 01-....png
        ├── RESULTADO.txt
        └── ...
```

| Tipo | Caminho base | Pasta do plano | Pasta dos resultados |
|------|--------------|----------------|----------------------|
| Unitário | `testes/testes-unitarios/` | `plano-teste/` | `resultado-teste/` (quando houver artefatos) |
| Funcional | `testes/testes-funcionais/` | `plano-de-teste/` | `resultado-teste/` |
| E2E | `testes/testes-e2e/` | `plano-teste/` | `resultado-teste/` |
| Cross-org | `testes/testes-cross-organizacao/` | `plano-teste/` | `resultado-teste/` |
| **Em tela (EMT)** | `testes/testes-em-tela/` | `plano-teste/` | `resultado-teste/` |

> Funcionais mantêm `plano-de-teste` (legado já adotado). Demais tipos usam `plano-teste`.

---

## Exemplo — Pedido › Lista › Editar-salvar (EMT)

**ID:** `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001` (`TST` + `EMT` + local `PEDIDO` + área `LISTA` + resumo `EDITAR-SALVAR` + `001`)

```
testes/testes-em-tela/pedido/lista/editar-salvar/
├── plano-de-teste/
│   ├── plano-teste-em-tela.md
│   └── run-status-config-reflexo.ts
└── resultado-teste/
    └── <runId>/
        ├── 01-lista-carregada.png
        └── RESULTADO.txt
```

---

## Exemplo — Pedido › Configurações › Status (EMT)

```
testes/testes-em-tela/pedido/configuracoes/status/
├── plano-teste/
│   ├── plano-teste-em-tela.md
│   └── run-status-config-reflexo.ts
└── resultado-teste/
    └── <runId>/
```

---

## `runId` e isolamento

- Disparo pelo Admin (`POST /admin/testes/disparar`) define `EMT_RUN_ID=<runId>` no processo filho.
- Cada run grava **somente** em `resultado-teste/<runId>/`.
- O histórico (`data/test-logs/*.json`) persiste `emt_pasta` apontando para essa subpasta.
- **Proibido** gravar prints na raiz do escopo ou em pasta datada compartilhada (`YYYY-MM-DD-nome/` — legado).

---

## Anti-padrões (causam bugs no Admin)

| Anti-padrão | Efeito |
|-------------|--------|
| Pasta única `2026-06-02-feature/` para todos os runs | Mesmos 16 prints em APROVADO e REPROVADO |
| `99-erro.png` de run antigo na pasta compartilhada | APROVADO exibe erro fantasma |
| `readdir` na pasta do escopo sem `runId` | Mistura evidências de ambientes diferentes |

---

## Referências

- Skill: `skills/testes/teste-em-tela/SKILL.md`
- Skill coordenação: `skills/testes/SKILL.md` § "ONDE colocar"
- Artefatos backend: `servicos-global/configurador/server/lib/emt-artifacts.ts`
- UI histórico: `documentos-tecnicos/testes/tecnico/01-arquitetura-sistema-testes.md`
