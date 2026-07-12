---
name: university-manual-markdown-rich-text
description: "Marcação rich text nos manuais University Gravity (manual-*-conteudo.ts). Use ao criar ou editar DICAs, callouts e parágrafos com ManualTextoRich."
---

# University — Marcação rich text do manual descritivo

> **SSOT documental:** `documentos-tecnicos/produtos-gravity/university-gravity/MANUAL-GRAVITY-ONBOARDING.md` **§9.7**  
> **SSOT código:** `manual-tipografia.ts` (`MANUAL_MARKUP_*`), `ManualTextoRichSegmento` em `manual-configurador-ui.tsx`, `ManualInfograficoRichText` em `manual-infografico-rich-text.tsx`

## Quando usar

- Editar ou criar texto em `manual-*-conteudo.ts`, callouts (`tipo: 'dica'`), `paragrafoAntes`, `textoIntro`, `texto` de seções University.
- Revisar manual após mudança de UI — alinhar cópia literal com o que aparece na tela.

## Sintaxe obrigatória

| Sintaxe | Visual | Uso |
|---------|--------|-----|
| `**texto**` | Negrito 700 | **Botões** e ações clicáveis curtas |
| `*_texto_*` | Itálico + peso 600 | Cópia **literal** da interface (não botão) |
| `*texto*` | Itálico | Evitar; preferir `*_…_*` para UI literal |

## Regra de decisão (aplicar automaticamente)

1. **Botão** — texto que o usuário **clica** para executar ação (`Próximo`, `Transferir`, `+ Novo`, `Excluir`, `Salvar`, `Assinar`, `Editar em Massa`) → `**…**`.
2. **Literal da UI** — frase inteira de link/checkbox, placeholder de busca, título de modal, rótulo longo de opção, caminho de menu (`Configurações › Kanban`), chip de filtro com formato fixo → `*_…_*`.
3. **Conceito** — termo de negócio ou explicação (`Importação`, `EXW`, `workspace`, `coleta na origem`) → `**…**` ou texto sem marcação.

## Exemplos canônicos

```ts
// Link/checkbox — literal
'Clique em *_Selecione portos próximos que você aceita na proposta, além do porto de preferência acima._*'
'marque a opção *_Exibir campos: País de origem, Estado ou Província de origem, Cidade de origem_*'

// Modal — título literal; botão de confirmação separado
'No modal *_Revogar token?_*, leia o aviso e clique em **Excluir** para confirmar.'

// Placeholder
'aparece busca *_Buscar produto…_*'

// Botão — negrito
'… e avance com **Próximo** antes da etapa de mercadoria.'
```

## Proibido

- Usar `**…**` em frases literais longas copiadas da tela (regressão visual).
- Converter botões para `*_…_*`.
- Inventar texto que não existe na UI.

## Checklist do agente

- [ ] Li MANUAL-GRAVITY-ONBOARDING.md §9.7
- [ ] Botões permanecem `**…**`
- [ ] Literais da UI (frase/modal/placeholder/checkbox) em `*_…_*`
- [ ] Parser suportado em `ManualTextoRich` (e infográfico se aplicável)
