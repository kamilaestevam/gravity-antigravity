# Regras de prints — testes em tela (EMT)

> **SSOT** para nomenclatura, pares antes/depois e cor no Admin.  
> Referência de implementação: `LogTestes.tsx` (`mapearResultadoPrintsEmt`, `estiloBordaPrintEmt`).

---

## 1. Seção obrigatória no plano

Todo plano EMT (`.md` referenciado por `planoFile` no registry) **deve** conter:

1. **`### ETAPA …`** — roteiro (passos de ação).
2. **`## Prints planejados`** — tabela `# | Arquivo | Estado capturado` (modal Admin → bloco **PRINTS PLANEJADOS**).

Sem `## Prints planejados`, o modal não lista os PNG esperados.

---

## 2. Par `-selecao` / `-resultado` (como está → como ficou)

Para cada interação que **muda** a UI (anexar, confirmar modal, avançar wizard, salvar, etc.), o runner captura **dois** prints em sequência:

| Sufixo | Significado | Quando capturar |
|--------|-------------|-----------------|
| **`-selecao.png`** | **Como está** — estado imediatamente antes de confirmar a ação | Popover aberto, modal de confirmação visível, dropzone vazio, passo anterior ainda ativo |
| **`-resultado.png`** | **Como ficou** — efeito visível após a ação | Grade/lista atualizada, modal fechado, passo seguinte, toast de sucesso/erro |

**Padrão de nome:** `{NN}-{slug}-selecao.png` e `{NN}-{slug}-resultado.png`  
(`NN` = ordem no roteiro; `slug` = kebab-case do cenário)

### Ícone câmera no modal «O que será testado» (roteiro)

Cada passo do roteiro (`### ETAPA`) deve incluir na coluna **APROVADO quando** (ou **Ação**) referências explícitas:

```markdown
| **03** | Upload arquivo | Sidebar atualizada · Print `03-anexar-selecao.png` · Print `03-anexar-resultado.png` (sucesso ou erro) |
```

O frontend (`ModalDetalhePlanoTeste` → `DetalhePassoComPrints`) renderiza badge câmera a partir de `Print \`arquivo.png\``.  
Coluna **Print** isolada na tabela **não** gera ícone — use inline na terceira coluna (padrão Admin NCM / convite).

Exemplos (Pedido editar-salvar — referência): `35-ncm-pedido-codigo-selecao.png` → `35-ncm-pedido-codigo-resultado.png`.

**Exceções (um print só `-resultado`):**

- Alertas/toasts sem popover de edição.
- **`99-erro.png`** — somente no `catch` de falha inesperada; nunca em run APROVADO.

**Referência legada completa:** `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md` (§ Regra de sequência dos prints).

---

## 3. Log do runner ↔ cor no Admin (verde / vermelho)

O runner **obrigatoriamente** emite linhas no stdout (espelhadas em `RESULTADO.txt`):

```
📸 03-anexar-selecao.png
📸 03-anexar-resultado.png
✓ ETAPA 3 — Anexar arquivos
```

| Linha no log | Efeito nos prints pendentes desde o último ✓/✗ |
|--------------|-----------------------------------------------|
| `📸 nome.png` | Enfileira print |
| `✓ …` | Marca prints enfileirados como **aprovado** (borda **verde** `#10b981`) |
| `✗ …` | Marca prints enfileirados como **reprovado** (borda **vermelha** `#ef4444`) |
| `99-erro*.png` sem ✓/✗ | Sempre **vermelho** |

Implementação: `mapearResultadoPrintsEmt` em `servicos-global/configurador/src/pages/admin/LogTestes.tsx`.

**Regra:** cada par `-selecao`/`-resultado` (ou grupo de prints de uma ETAPA) deve ser seguido de **uma** linha `✓` ou `✗` antes do próximo `📸`, para o Admin pintar corretamente.

---

## 4. Qualidade técnica

- Viewport **1440×900**; aguardar `networkidle` antes de capturar.
- Pasta **`resultado-teste/<runId>/`** — ver [07-organizacao-plano-resultado-por-escopo.md](./07-organizacao-plano-resultado-por-escopo.md).
- `casosTotal` no registry = quantidade de linhas em **`## Prints planejados`** (não só ETAPAs).

---

## 5. Anti-padrões

| Anti-padrão | Problema |
|-------------|----------|
| Só `-resultado` quando há popover/confirmação | Perde evidência «como estava» |
| `📸` sem `✓`/`✗` até o fim do run | Prints ficam neutros ou herdam cor global errada |
| Reutilizar PNG de run anterior | APROVADO exibe erro fantasma (ver regra 07) |
