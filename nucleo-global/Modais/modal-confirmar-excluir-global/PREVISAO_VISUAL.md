# Documentação Visual — ModalConfirmarExcluirGlobal

> **Pacote:** `@nucleo/modal-confirmar-excluir-global`
> **Referência visual:** `ModalPedidosExcluir` (`modal-excluir__*`) — mesmo layout, **sem tabela de múltiplos itens**.
> **Última atualização:** 2026-06-09

---

## 1. Estrutura

- **Overlay**: `rgba(0,0,0,0.5)`, centralizado, `max-width: 600px`, `createPortal` em `document.body`.
- **Header**: ícone `Trash` (accent) + título à esquerda, subtítulo abaixo, `X` à direita.
- **Body**: caixa de aviso vermelha (`Warning` + texto irreversível + `descricao` do consumidor).
- **Body opcional**: rótulo `REGISTRO` + nome do item (`nomeItem`) em mini-tabela de 1 linha (13px).
- **Footer**: `BotaoGlobal` secundário (Cancelar) + perigo (Excluir), alinhados à direita.

> **Diferença do `ModalPedidosExcluir`:** este modal não exibe tabela com colunas PEDIDO/ITEM/DESCRIÇÃO. Usa seção "Registro" com uma única linha quando `nomeItem` é informado.

---

## 2. Tipografia

| Elemento              | Tamanho     | Peso |
|-----------------------|-------------|------|
| Título                | 1.25rem     | 700  |
| Subtítulo             | 0.8125rem   | 400  |
| Aviso                 | 13px        | 400  |
| Seção (REGISTRO)      | 12px UPPER  | 600  |
| Nome do item (célula) | 13px        | 400  |

Classes CSS: prefixo `mce__*` em `modal-confirmar-excluir.css`.

---

## 3. Props do consumidor

| Prop          | Tipo                              | Uso no layout                                         |
|---------------|-----------------------------------|-------------------------------------------------------|
| `aberto`      | `boolean`                         | Controla visibilidade do modal                        |
| `titulo`      | `string`                          | Título do header (ex.: "Excluir coluna")              |
| `descricao`   | `string \| ReactNode`             | Texto após "Esta ação é irreversível." no aviso        |
| `nomeItem`    | `string` (opcional)             | Nome exibido na seção Registro                        |
| `aoConfirmar` | `() => void \| Promise<void>`     | Executa a exclusão (ver contrato abaixo)               |
| `aoCancelar`  | `() => void`                      | Fecha o modal sem excluir                             |

---

## 4. Contrato de `aoConfirmar`

O modal gerencia **loading**, **feedback no botão** e **fechamento** internamente.

| Regra | Detalhe |
|-------|---------|
| Assíncrono | Pode retornar `Promise<void>` — o modal aguarda antes de mostrar sucesso/erro |
| Sucesso | Não fechar o modal no consumidor — o modal exibe "Excluído" e chama `aoCancelar` após ~1,2s |
| Erro | **Deve lançar exceção** (`throw`) — modal exibe "Falhou", permanece aberto para nova tentativa |
| Loading | Consumidor **não** deve chamar `aoCancelar` nem zerar `aberto` antes da API responder |

**Anti-padrão (não fazer):**

```ts
async function excluir() {
  setModalAberto(null) // ❌ fecha antes do loading
  await api.excluir(id)
}
```

**Padrão correto:**

```ts
async function excluir() {
  await api.excluir(id)
  addNotification({ type: 'success', message: '...' })
  // modal fecha sozinho após flash "Excluído"
}

async function excluirComErro() {
  try {
    await api.excluir(id)
  } catch {
    addNotification({ type: 'error', message: '...' })
    throw new Error('excluir_falhou') // ✅ modal mostra "Falhou"
  }
}
```

---

## 5. Estados do botão Excluir

| Estado       | Visual (`BotaoGlobal`)     | Texto i18n                         |
|--------------|----------------------------|------------------------------------|
| Idle         | `variante="perigo"` + ícone Trash | `comum.excluir`              |
| Carregando   | `carregando={true}`        | `comum.modal_excluir_excluindo`    |
| Sucesso      | `resultadoAcao="sucesso"`  | `comum.modal_excluir_excluido`     |
| Erro         | `resultadoAcao="erro"`     | `comum.modal_excluir_falhou`       |

Durante carregamento ou feedback: Cancelar, X e Esc ficam desabilitados.

---

## 6. i18n (comum)

| Chave                           | Uso                                      |
|---------------------------------|------------------------------------------|
| `comum.modal_excluir_subtitulo` | Subtítulo do header                      |
| `comum.modal_excluir_aviso`     | "Esta ação é irreversível." (negrito)    |
| `comum.modal_excluir_registro`  | Rótulo da seção (REGISTRO)               |
| `comum.modal_excluir_excluindo` | Texto do botão em loading                |
| `comum.modal_excluir_excluido`  | Texto do botão após sucesso              |
| `comum.modal_excluir_falhou`    | Texto do botão após erro                 |

Textos específicos do domínio (`titulo`, `descricao`, toasts) ficam no namespace do produto (ex.: `pedido.config.colunas.personalizadas.*`).

---

## 7. Dependências

| Pacote                  | Uso                                      |
|-------------------------|------------------------------------------|
| `@nucleo/botao-global`  | Botões Cancelar e Excluir com loading    |
| `@phosphor-icons/react` | Trash, Warning, X                        |
| `react-i18next`         | Traduções `comum.*`                      |

> Não usa `@nucleo/modal-global` / `ModalOverlay` — overlay próprio via `createPortal`.

---

## 8. Quando usar qual modal de exclusão

| Cenário                              | Componente                    |
|--------------------------------------|-------------------------------|
| Exclusão em lote (pedidos + itens)   | `ModalPedidosExcluir` (Pedido) |
| Exclusão de registro único (coluna, template, anexo, workspace…) | `ModalConfirmarExcluirGlobal` |

Ver também: [`DUPLICAR-EXCLUIR-TECNICO.md`](../../../documentos-tecnicos/produtos-gravity/pedido/DUPLICAR-EXCLUIR-TECNICO.md).
