# E2E · Pedido / Lista · Feature — Painel de Colunas Configurável

**Tela:** Lista de Pedidos (`/pedidos`)
**Elemento:** Botão "Colunas" na toolbar — painel para ocultar/mostrar colunas

---

## 1. Abertura do painel

- [ ] **COL-R01** — O botão `Colunas` está visível na toolbar?
- [ ] **COL-R02** — Clicar em `Colunas` abre painel ou modal de seleção?
- [ ] **COL-R03** — O painel lista as colunas disponíveis?
- [ ] **COL-R04** — O painel exibe ao menos as colunas padrão (Nº Pedido, Status, Exportador, Importador)?
- [ ] **COL-R05** — O painel agrupa as colunas por categoria (ex: Identificação, Financeiro, Quantidades)?
- [ ] **COL-R06** — Pressionar `Escape` fecha o painel?
- [ ] **COL-R07** — Clicar fora do painel fecha sem alterar nada?

---

## 2. Ocultar coluna

- [ ] **COL-O01** — Desmarcar a coluna `Nome do Exportador` a remove da tabela imediatamente?
- [ ] **COL-O02** — O header da coluna oculta não aparece mais na tabela?
- [ ] **COL-O03** — As demais colunas redistribuem o espaço corretamente?

---

## 3. Mostrar coluna oculta

- [ ] **COL-M01** — Marcar novamente a coluna `Nome do Exportador` a restaura na tabela?
- [ ] **COL-M02** — A coluna volta na posição original (não vai para o final)?

---

## 4. Persistência de preferências

- [ ] **COL-P01** — A preferência de colunas é salva (localStorage ou backend)?
- [ ] **COL-P02** — Navegar para `Dashboard` e voltar: colunas ocultas continuam ocultas?
- [ ] **COL-P03** — Recarregar a página: colunas ocultas continuam ocultas?

---

## 5. Evidências (screenshots obrigatórias)

| # | Momento | Arquivo |
|---|---------|---------|
| 1 | Painel de colunas aberto | `col-01-painel.png` |
| 2 | Após ocultar coluna Exportador | `col-02-oculta.png` |
| 3 | Após restaurar coluna Exportador | `col-03-restaurada.png` |

---

## 6. Resultado

| Campo | Valor |
|-------|-------|
| Data | |
| Executor | |
| Ambiente | `localhost:5179` |
| Total de checks | 16 |
| Aprovados | |
| Reprovados | |
| Resultado | ⬜ APROVADO · ⬜ REPROVADO · ⬜ RESSALVAS |

**Observações:**
