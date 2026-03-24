---
name: Escrita de Tooltips — Gravity Platform
description: Regras para escrever tooltips com TooltipGlobal em todo o workspace. Deve ser lida antes de escrever qualquer titulo ou descricao de tooltip na plataforma.
---

# Skill: Escrita de Tooltips

## Filosofia Central

A tooltip responde **uma única pergunta do usuário**:

> *"O que esse campo/dado faz pela minha empresa?"*

Nunca como o sistema funciona internamente. O usuário não sabe — e não precisa saber — que existe uma API, um banco de dados ou qualquer lógica de programação.

---

## As 5 Regras Invioláveis

### 1. Sem ponto final
O texto da `descricao` nunca termina com ponto.

```
❌ "Razão social da empresa."
✅ "Razão social da empresa"
```

### 2. Idioma do usuário, não do desenvolvedor
Nunca mencione implementação técnica.

```
❌ "Carregado via API do IBGE com base no estado selecionado"
✅ "A lista de cidades aparece após você escolher o estado"

❌ "Utilizado no backend para cálculos fiscais"
✅ "Aparece em notas fiscais e relatórios gerados pela plataforma"

❌ "Renderizado via ReactDOM.createPortal"
✅ — (isso nunca deveria estar em uma tooltip)
```

### 3. Máximo ~90 caracteres na `descricao`
Uma frase. Se precisar de mais, a tooltip está errada — o design do campo precisa melhorar.

### 4. `titulo` = nome do conceito, `descricao` = o que o usuário faz ou ganha
O `titulo` pode ser igual ao label do campo. A `descricao` é onde está o valor real.

```tsx
// Correto
<TooltipGlobal
  titulo="CNPJ"
  descricao="Aparece em notas fiscais e documentos gerados na plataforma"
>

// Errado — descricao redundante com o titulo
<TooltipGlobal
  titulo="CNPJ"
  descricao="Campo de CNPJ da empresa"
>
```

### 5. Sem jargão técnico, sem siglas sem contexto
Use linguagem que um gerente administrativo entenderia.

```
❌ "Define o slug do tenant no multi-tenant router"
✅ "Endereço exclusivo da sua conta — não pode ser alterado após a criação"

❌ "Foreign key vinculada ao registro pai"
✅ "Empresa à qual este usuário está vinculado"
```

---

## Perguntas de Checagem

Antes de publicar uma tooltip, responda:

1. **O que o usuário FAZ com esse campo?**
   → ex: "digita a razão social", "seleciona um estado"

2. **O que acontece com esse dado depois?**
   → ex: "aparece nos relatórios", "define o contexto da sessão", "enviado nas notas fiscais"

3. **Existe comportamento especial que o usuário não esperaria?**
   → ex: "a lista muda quando você troca o estado", "não pode ser editado após salvar"

4. **Esse campo depende de outro campo?**
   → se sim, mencione a dependência de forma simples

---

## Padrões por Tipo de Contexto

### Campo de formulário editável
Responda: *O que esse dado representa e onde ele aparece depois?*

| Campo | titulo | descricao |
|---|---|---|
| Nome da empresa | Nome da Empresa | Razão social que aparece nos documentos e relatórios |
| CNPJ | CNPJ | Aparece em notas fiscais e documentos gerados na plataforma |
| Site | Site | Exibido no perfil público da empresa |
| Segmento | Segmento | Usado para categorizar a empresa nos relatórios |

### Campo dependente de outro campo
Responda: *Qual a condição para esse campo funcionar?*

```
✅ "A lista de cidades aparece após você escolher o estado"
✅ "Disponível somente para usuários do tipo Master"
✅ "Calculado com base no período de vigência do contrato"
```

### Campo somente-leitura / metadado
Responda: *O que esse valor significa para o negócio?*

```
✅ "Endereço exclusivo da sua conta — não pode ser alterado"
✅ "Calculado desde a data de ativação da conta"
✅ "Definido automaticamente com base no plano contratado"
```

### Coluna de tabela
Responda: *O que esse valor representa no contexto das linhas da tabela?*

```
✅ "Total de usuários com acesso ativo nesta empresa filha"
✅ "Indica se a empresa está operando normalmente ou com acesso bloqueado"
✅ "Data em que a empresa foi cadastrada no sistema"
```

### Botão ou ação destrutiva
Responda: *O que acontece imediatamente ao clicar? Há consequência?*

```
✅ "Todo acesso desta empresa filha será bloqueado imediatamente"
✅ "Define esta empresa como contexto da sua sessão — afeta todos os dados exibidos"
✅ "As alterações serão descartadas e o formulário voltará ao estado original"
```

---

## Anti-padrões — Nunca Use

```
❌ Implementação exposta:
   "via API", "via IBGE", "carregado do banco", "query no backend"

❌ Passivo e vago:
   "utilizado para X", "referente ao campo X", "campo obrigatório"

❌ Redundância com o label:
   label = "Status" → descricao = "Status da empresa" (inútil)

❌ Muito longo:
   Mais de 2 linhas quebra o card e ninguém lê

❌ Ponto final:
   toda frase na descricao termina sem ponto

❌ Inglês:
   A plataforma é PT-BR. Tooltips também.

❌ Tom técnico ou formal demais:
   "Mediante seleção do estado federativo correspondente..."
   Use: "Após escolher o estado"
```

---

## Template para Novos Campos

Sempre que for adicionar `TooltipGlobal` a um novo campo, use este raciocínio:

```
Campo: [nome do campo]
Tipo: [editável | somente-leitura | coluna | botão | dependente]
O usuário faz o quê com isso? → [resposta]
O que acontece com o dado? → [resposta]
Tem comportamento especial? → [sim/não → qual]
---
titulo: [nome do conceito — geralmente igual ao label]
descricao: [frase curta, ativo, sem ponto, sem jargão, max 90 chars]
```

---

## Exemplos Reais do Workspace Gravity

### EmpresaMae.tsx

| Campo | descricao aprovada |
|---|---|
| Nome da Empresa | Razão social que aparece nos documentos e relatórios |
| CNPJ | Aparece em notas fiscais e documentos gerados na plataforma |
| Estado | Estado onde a empresa tem sua sede principal |
| Cidade | A lista de cidades aparece após você escolher o estado |
| Segmento | Usado para categorizar a empresa nos relatórios da plataforma |
| Site | Endereço público da empresa, exibido no perfil |
| Subdomínio | Endereço exclusivo da sua conta — não pode ser alterado |
| Cliente desde | Data de ativação da conta na plataforma |
| Localização | Cidade e estado da sede principal da empresa |
| Empresa filha ativa | Define qual empresa filha você está operando agora |

### TabelaGlobal — Empresas Filhas

| Coluna | descricao aprovada |
|---|---|
| Filial | Nome da empresa filha cadastrada neste tenant |
| Subdomínio | Endereço exclusivo desta filial no workspace |
| Usuários | Total de usuários com acesso habilitado nesta filial |
| Status | Indica se a filial está operando ou com acesso suspenso |
| Criado em | Data em que a filial foi cadastrada no sistema |

### TabelaGlobal — Usuários

| Coluna | descricao aprovada |
|---|---|
| Usuário | Nome completo e identificação visual do usuário |
| E-mail | E-mail de acesso utilizado no login da plataforma |
| Tipo | Define as permissões base: Master, Standard ou Fornecedor |
| Status | Indica se o usuário pode acessar a plataforma |
| Empresas vinculadas | Empresas filhas às quais este usuário tem acesso liberado |
