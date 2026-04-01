# NF Importação — Manual Funcional Completo para Treinamento da GABI

> **Propósito**: Este documento é a base de conhecimento completa do produto NF Importação para treinamento da IA GABI. Contém 100% das funcionalidades, campos, botões, estados, validações, mensagens de erro, avisos e regras de negócio.
> 
> Versão: 1.0 | Produto: `nf-importacao` | Data: 2026-03-31

---

## O QUE É O PRODUTO NF IMPORTAÇÃO

O **NF Importação** é o módulo do Gravity responsável pela composição e exportação de Notas Fiscais de Importação. Ele permite que operadores de comércio exterior:

1. **Importem** dados de NFs de diferentes fontes (XML DUIMP, Portal Único, OCR/Smart Read, integração com Processo Gravity, ou entrada manual)
2. **Componham** as despesas aduaneiras e logísticas de cada NF
3. **Rateiem** essas despesas entre os itens da NF de forma proporcional e auditável
4. **Classifiquem** fiscalmente cada item (NCM, CFOP, CSTs, alíquotas)
5. **Exportem** a NF no formato correto para o ERP do cliente (TOTVS Protheus, SAP, SENIOR, CSV, XML, JSON)

O produto resolve um problema crítico: o ERP precisa da NF com todas as despesas rateadas nos itens para a escrituração contábil e fiscal correta. Fazer isso manualmente é propenso a erros; o NF Importação automatiza e audita todo o processo.

---

## CONCEITOS FUNDAMENTAIS

### O que é uma NF de Importação
Uma Nota Fiscal de Importação é o documento fiscal emitido quando mercadorias entram no Brasil vindo do exterior. Ela precisa refletir não apenas o valor da mercadoria em si (FOB), mas também todos os custos adicionais: frete internacional, seguro, impostos aduaneiros (II, IPI, PIS/COFINS, ICMS) e despesas operacionais (Armazenagem, Despachante, etc.). Cada um desses custos precisa ser "rateado" (distribuído proporcionalmente) entre os itens da NF para que a escrituração contábil seja correta.

### Status da NF (Ciclo de Vida)
A NF percorre um fluxo linear de status:

| Status | O que significa | O que pode fazer |
|--------|----------------|------------------|
| **Rascunho** | NF criada mas sem despesas | Editar dados, adicionar itens, cancelar |
| **Em Composição** | Tem ≥1 despesa | Editar dados, adicionar/editar itens e despesas, calcular rateio, cancelar |
| **Pronta** | Rateio calculado e validado, ≥1 item | Visualizar, exportar, cancelar |
| **Exportada** | Arquivo gerado para o ERP | Apenas visualizar e duplicar |
| **Cancelada** | Soft delete | Apenas visualizar (histórico) |

**Transições possíveis**:
- Rascunho → Em Composição (automático ao adicionar 1ª despesa)
- Em Composição → Pronta (ao aplicar rateio com sucesso)
- Pronta → Exportada (ao gerar exportação para ERP)
- Qualquer status editável → Cancelada (ação do usuário)
- Exportada/Cancelada → **Sem retorno** (estados terminais)

### O que é Rateio
Rateio é a distribuição proporcional de uma despesa entre os itens da NF. Por exemplo:

- Despesa: Frete Internacional = R$ 10.000
- Item A: 500 kg peso líquido → recebe R$ 5.000 (50%)
- Item B: 300 kg peso líquido → recebe R$ 3.000 (30%)
- Item C: 200 kg peso líquido → recebe R$ 2.000 (20%)

O método de rateio (base de cálculo) é escolhido por despesa:

| Método | Base de Cálculo | Quando Usar |
|--------|----------------|-------------|
| **Peso Líquido** | Proporcional ao peso_liquido de cada item | Fretes internacionais |
| **Peso Bruto** | Proporcional ao peso_bruto de cada item | Armazenagem |
| **Valor CIF** | Proporcional ao valor_cif de cada item | Seguro, AFRMM |
| **Valor FOB** | Proporcional ao valor_fob de cada item | Comissão de agente |
| **Quantidade** | Proporcional à quantidade de cada item | Taxas por unidade |
| **Valor II** | Proporcional ao valor do Imposto de Importação | Siscomex |
| **Igualitário** | Divisão igual entre todos os itens | Taxas fixas |
| **Manual** | Usuário define o valor de cada item | Correções pontuais |
| **Customizado** | Fórmula personalizada combinando campos | Casos especiais |

---

## TELAS DO PRODUTO

### TELA 1: Lista de NFs (NfLista)

**Rota**: `/nf-importacao`

**O que mostra**:
- Listagem paginada de todas as NFs do tenant/empresa
- Filtros no topo: status, período, busca textual
- Cada linha da tabela exibe: número da NF, referência DUIMP, exportador, importador, status (badge colorido), data de emissão, valor total CIF

**Campos de filtro**:
- `busca`: Pesquisa livre em numero_nf, chave_acesso, exportador_nome, importador_nome, di_numero
- `status`: Rascunho | Em Composição | Pronta | Exportada | Cancelada | Todos
- Ordenação por qualquer coluna (asc/desc)

**Botões**:
- `+ Nova NF`: Navega para a tela de criação (NfNovaOrigem)
- Linha clicável: abre o detalhe da NF

**Paginação**: 20 itens por página (configurável)

**Estados**:
- **Loading**: Spinner enquanto carrega
- **Vazio**: Mensagem "Nenhuma NF encontrada" + botão para criar
- **Erro**: Mensagem de erro com botão para tentar novamente

---

### TELA 2: Criação — Step 1 — Origem dos Dados (NfNovaOrigem)

**Rota**: `/nf-importacao/nova`

**O que é**: Primeiro passo do wizard de criação de NF. O usuário escolhe de onde vêm os dados.

**6 Canais de Entrada** (cards clicáveis):

| Canal | Ícone | O que faz |
|-------|-------|-----------|
| **XML (DUIMP)** | Ícone de arquivo XML | Upload de arquivo XML da DUIMP — sistema extrai dados automaticamente |
| **Portal Único** | Ícone de portal | Consulta automática no Portal Único do Governo via DI/DUIMP número |
| **Smart Read (OCR)** | Ícone de câmera/scan | Upload de PDF/imagem — IA extrai dados via OCR |
| **Planilha** | Ícone de planilha | Upload de planilha Excel/CSV com dados da NF |
| **Processo Gravity** | Ícone de processo | Importa dados de um Processo já cadastrado no Gravity |
| **Manual** | Ícone de lápis | Entrada manual de todos os campos |

**Após selecionar o canal**:
- XML, Smart Read, Planilha: Abre input de upload de arquivo
- Portal Único: Abre campo para digitar número da DI ou DUIMP
- Processo Gravity: Abre seletor de processo
- Manual: Vai direto para o Step 2 com formulário vazio

**Validações**:
- XML: Aceita apenas `.xml`, máx 10MB
- Smart Read: Aceita PDF, JPG, PNG, máx 10MB
- Planilha: Aceita `.xlsx`, `.csv`, máx 5MB
- Portal Único: DI ou DUIMP número obrigatório

**Avisos**:
- Smart Read: "Processamento pode levar alguns segundos"
- Portal Único: "Dados sujeitos à disponibilidade do sistema do governo"

---

### TELA 3: Criação — Step 2 — Dados da DUIMP (NfNovaDuimp)

**Rota**: `/nf-importacao/nova/duimp`

**O que é**: Formulário com dados gerais da NF de importação. Se veio de XML ou Portal Único, campos são preenchidos automaticamente (mas editáveis).

**Seções e campos**:

#### Identificação
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Número da NF | text | Não | Número gerado pelo ERP ou sistema próprio |
| Série | text | Não | Série da NF (ex: 1) |
| Chave de Acesso | text (44 chars) | Não | Chave SEFAZ (44 dígitos) |
| Tipo de Operação | select | **Sim** | Importação / Importação Indireta |
| Natureza da Operação | text | Não | Descrição da natureza (ex: "Compra de mercadoria") |

#### Datas
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Data de Emissão | date | Não | Data em que a NF foi emitida |
| Data de Entrada | date | Não | Data de entrada da mercadoria no Brasil |

#### Exportador / Importador
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Nome do Exportador | text | Não | Razão social do fornecedor estrangeiro |
| País do Exportador | select (países) | Não | País de origem |
| CNPJ do Importador | text (14 chars) | Não | CNPJ do importador brasileiro |
| Nome do Importador | text | Não | Razão social do importador |

#### Valores e Câmbio
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Moeda | select | Não | USD, EUR, GBP, etc. (default: USD) |
| Taxa de Câmbio | decimal (4 casas) | Não | Taxa PTAX ou negociada |
| Valor Total FOB | decimal | Não | Valor total da mercadoria no embarque |
| Valor do Frete | decimal | Não | Frete internacional |
| Valor do Seguro | decimal | Não | Seguro internacional |
| Valor Total CIF | decimal | Não | FOB + Frete + Seguro (calculado automaticamente) |

#### Logística
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Incoterm | select | Não | FOB, CIF, EXW, etc. |
| Via de Transporte | select | Não | Marítimo, Aéreo, Rodoviário, Ferroviário, Postal |
| Porto de Embarque | text | Não | Porto/aeroporto de origem |
| Porto de Destino | text | Não | Porto/aeroporto de destino no Brasil |

#### Vínculos
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Número da DI | text | Não | Declaração de Importação |
| Número da DUIMP | text | Não | Declaração Única de Importação |
| Data de Registro DUIMP | date | Não | Data de registro da DUIMP |
| Processo Gravity | text/link | Não | ID do processo vinculado |

#### Observações
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Observações | textarea | Não | Notas internas livres |

**Botões**:
- `Voltar`: Retorna ao Step 1
- `Próximo`: Salva a NF como Rascunho e avança para Step 3

**Cálculo automático**:
- Valor Total CIF = Valor FOB + Valor Frete + Valor Seguro (atualizado em tempo real)

---

### TELA 4: Criação — Step 3 — Despesas (NfNovaDespesas)

**Rota**: `/nf-importacao/nova/despesas`

**O que é**: Listagem e adição de todas as despesas da NF (frete, impostos, despachante, armazenagem, etc.).

**Lista de despesas já cadastradas**:
- Nome da despesa
- Valor total
- Moeda
- Método de rateio escolhido
- Origem (manual, template, smart read)
- Botões: Editar | Excluir

**Botão `+ Adicionar Despesa`**: Abre formulário inline ou modal com campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Categoria | select (catálogo) | **Sim** | Seleciona do catálogo de despesas configurado |
| Descrição | text | **Sim** | Descrição livre da despesa |
| Valor Total | decimal | **Sim** | Valor total da despesa |
| Moeda | select | Não | BRL, USD, EUR (default: BRL) |
| Taxa de Câmbio | decimal | Não | Se moeda ≠ BRL |
| Valor em BRL | decimal (calculado) | Não | Valor × taxa (calculado automaticamente) |
| Método de Rateio | select | **Sim** | 9 opções (ver conceitos fundamentais) |
| Fornecedor | text | Não | Nome do prestador do serviço |
| Número do Documento | text | Não | NF do prestador, boleto, etc. |
| Data do Documento | date | Não | Data do documento do fornecedor |
| Conta Contábil | text | Não | Código contábil do plano de contas |
| Centro de Custo | text | Não | Centro de custo para rateio contábil |
| Observações | text | Não | Notas internas |

**Botão `Aplicar Template`**: Abre modal com lista de templates disponíveis. Ao selecionar, cria automaticamente as despesas do template para a NF.

**Botão `Smart Read`**: Abre upload de PDF/imagem de comprovante (NF do fornecedor, recibo). IA extrai despesas automaticamente.

**Avisos**:
- "Ao adicionar a primeira despesa, a NF avança para 'Em Composição'"
- "Despesas em moeda estrangeira serão convertidas pela taxa informada"

**Validações**:
- Valor Total: Deve ser > 0
- Método de Rateio: Obrigatório (sem default — usuário deve escolher conscientemente)
- Se moeda ≠ BRL: Taxa de câmbio obrigatória

**Botões da tela**:
- `Voltar`: Retorna ao Step 2
- `Próximo`: Avança para Step 4 (Rateio)

---

### TELA 5: Criação — Step 4 — Rateio (NfNovaRateio)

**Rota**: `/nf-importacao/nova/rateio`

**O que é**: Cálculo e visualização de como cada despesa é distribuída entre os itens da NF.

**Pré-requisitos para acessar**:
- NF deve ter ≥ 1 item
- NF deve ter ≥ 1 despesa

**Aviso se itens faltando**: "Adicione itens à NF antes de calcular o rateio"

**Layout**:
- Por despesa: tabela mostrando quanto cada item recebe
- Preview: colunas = itens, linhas = despesas, células = valor rateado
- Totais: soma do rateio vs. valor total da despesa (deve bater com ≤ R$ 0,01 diferença)

**Botão `Calcular Rateio`**: Executa os algoritmos e exibe o resultado (preview)

**Botão `Aplicar Rateio`**: Persiste o rateio calculado no banco. NF avança para **Pronta**.

**Override Manual**:
- Em cada célula da tabela, usuário pode clicar para editar o valor manualmente
- Sistema recalcula percentuais
- Célula marcada com ícone de "editado manualmente"

**Avisos**:
- "Diferença de centavos absorvida pelo último item" (aviso informativo)
- "Método Igualitário ativado como fallback pois o divisor zerou" (aviso)
- "Soma dos rateios difere do total da despesa em R$ X,XX" (erro bloqueante)

**Botões**:
- `Voltar`: Retorna ao Step 3
- `Próximo`: Avança para Step 5 (somente após aplicar rateio)

---

### TELA 6: Criação — Step 5 — Classificação Fiscal (NfNovaFiscal)

**Rota**: `/nf-importacao/nova/fiscal`

**O que é**: Revisão e ajuste da classificação fiscal de cada item (NCM, CFOP, CSTs, alíquotas). Usa favoritos fiscais para agilizar.

**Por item**: tabela ou cards com:
- NCM, CFOP
- CST ICMS, CST IPI, CST PIS/COFINS
- Alíquota e valor de cada imposto
- Botão `Aplicar Favorito`: Preenche campos fiscais a partir dos favoritos salvos

**Filtro de favoritos**: Pesquisa por NCM ou nome do favorito

**Botões**:
- `Voltar`: Retorna ao Step 4
- `Próximo`: Avança para Step 6

---

### TELA 7: Criação — Step 6 — Exportação (NfNovaExportacao)

**Rota**: `/nf-importacao/nova/exportacao`

**O que é**: Última etapa — gera o arquivo para o ERP.

**Campos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Formato de Exportação | select | **Sim** | TOTVS Protheus, SAP, SENIOR, CSV, XML, JSON, Custom |
| Layout Personalizado | select (layouts) | Não | Somente para formato Custom |

**Preview**: Ao selecionar formato, exibe amostra do arquivo gerado (primeiras linhas)

**Botão `Gerar Arquivo`**:
- Gera o arquivo
- Faz download automático no navegador
- Transita NF para status **Exportada**
- Registra no histórico

**Botão `Finalizar sem Exportar`**: Mantém a NF como **Pronta** e retorna à lista.

**Avisos**:
- "O arquivo será gerado no formato [formato] com extensão [extensão]"
- "Após exportar, a NF não poderá mais ser editada"

---

### TELA 8: Detalhe da NF (NfDetalhe)

**Rota**: `/nf-importacao/:id`

**O que é**: Visão completa de uma NF já criada, com 6 abas de conteúdo.

#### Cabeçalho do Detalhe
Sempre visível acima das abas:
- Número da NF (ou "Rascunho [id]" se sem número)
- Status (badge colorido)
- Exportador e Importador
- Data de emissão
- Valor Total CIF
- Botões de ação contextuais (dependem do status)

#### Botões de Ação por Status

| Status | Botões disponíveis |
|--------|--------------------|
| Rascunho | Editar, Cancelar, Duplicar |
| Em Composição | Editar, Cancelar, Duplicar, Calcular Rateio |
| Pronta | Exportar, Cancelar, Duplicar |
| Exportada | Duplicar, Download novamente |
| Cancelada | Duplicar |

#### Aba 1: Itens
- Tabela com todos os itens da NF
- Colunas: Nº Item, NCM, Descrição, Quantidade, Unidade, Peso Líquido, Peso Bruto, Valor FOB, Valor CIF, Total com Despesas
- Botão `+ Adicionar Item` (somente em rascunho/em composição)
- Clicar em item: abre formulário de edição inline
- Botão `Excluir` em cada linha
- Botão `Aplicar Favorito Fiscal`: preenche campos fiscais do item

Formulário de Item (campos):
```
Nº do Item (auto)
Nº da Adição
NCM (obrigatório, 8-10 dígitos)
Descrição (obrigatório)
Fabricante
País de Origem
Quantidade Estatística
Unidade de Medida (UN, KG, M2, etc.)
Quantidade Comercial
Unidade Comercial
Peso Líquido (kg)
Peso Bruto (kg)
Valor FOB
Valor do Frete (pro-rata)
Valor do Seguro (pro-rata)
Valor CIF (calculado)
CFOP
CST ICMS
CST IPI
CST PIS
CST COFINS
Alíquota II (%)  → Valor II (calculado)
Alíquota IPI (%) → Valor IPI (calculado)
Alíquota PIS (%) → Valor PIS (calculado)
Alíquota COFINS (%) → Valor COFINS (calculado)
Alíquota ICMS (%) → Base ICMS / Valor ICMS (calculado)
Ex-TIPI
Benefício Fiscal
Descrição do Benefício
```

#### Aba 2: Despesas
- Tabela com todas as despesas
- Colunas: Nome, Valor Total, Moeda, Valor BRL, Método de Rateio, Origem, Status do Rateio
- Botão `+ Adicionar Despesa` (somente em rascunho/em composição)
- Botão `Aplicar Template`
- Botão `Smart Read`
- Clicar em despesa: abre formulário de edição
- Badge "Rateado" / "Pendente" em cada despesa

#### Aba 3: Rateio
- Visão tabular cruzada: despesas × itens
- Cada célula: valor rateado (R$) e percentual
- Botão `Recalcular Rateio`
- Botão `Aplicar Rateio`
- Células clicáveis para override manual
- Indicador: "Última aplicação em [data] por [usuário]"

#### Aba 4: Fiscal
- Por item: NCM, CFOP, CSTs, alíquotas
- Filtro de favoritos
- Botão `Aplicar Favorito` por item

#### Aba 5: Exportação
- Histórico de exportações anteriores (se houver)
- Botão `Exportar` (somente status pronta/exportada)
- Formulário: Formato + Layout (opcional)
- Preview do arquivo
- Download de exportações anteriores

#### Aba 6: Histórico
- Timeline append-only de todos os eventos da NF
- Cada evento: ação, descrição, usuário, data/hora
- Eventos comuns:
  - NF criada
  - Status alterado para [X]
  - Item adicionado/editado/removido
  - Despesa adicionada/editada/removida
  - Rateio calculado e aplicado
  - Rateio manual aplicado a [item]
  - Arquivo exportado em formato [X]
  - NF cancelada

---

### TELA 9: Catálogo de Despesas (Config)

**Rota**: `/nf-importacao/config/despesas`

**O que é**: Cadastro de tipos de despesas reutilizáveis (similar a uma tabela de preços). Evita que o usuário precise digitar o mesmo tipo de despesa toda vez.

**Lista**: Tabela com código, nome, método de rateio padrão, conta contábil, status (ativo/inativo)

**Botão `+ Nova Despesa`**: Abre formulário com campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Código | text | **Sim** | Código único por empresa (ex: "FRETE-INT") |
| Nome | text | **Sim** | Nome da despesa (ex: "Frete Internacional") |
| Tipo | text | Não | Classificação livre |
| Descrição | text | Não | Descrição detalhada |
| Método de Rateio Padrão | select | Não | Pré-selecionado ao usar esta categoria |
| Moeda Padrão | select | Não | Moeda pré-selecionada |
| Conta Contábil | text | Não | Código do plano de contas |
| Centro de Custo | text | Não | Centro de custo padrão |
| Ativo | toggle | Não | Default: ativo |

**Botões por linha**: Editar | Inativar/Ativar | Excluir

**Validações**:
- Código: Único por tenant + empresa (erro: "Código já existe")
- Não é possível excluir categoria em uso em alguma NF (aviso: "Categoria usada em X NFs")

---

### TELA 10: Templates de Despesa (Config)

**Rota**: `/nf-importacao/config/templates`

**O que é**: Conjuntos de despesas que podem ser aplicados de uma vez a uma NF. Ex: "Template Importação Marítima" pode incluir Frete, Armazenagem, Despachante, AFRMM.

**Lista**: Nome, descrição, quantidade de itens, status (ativo/padrão), ações

**Botão `+ Novo Template`**: Abre formulário:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Nome | text | **Sim** | Nome do template |
| Descrição | text | Não | Descrição do uso |
| Ativo | toggle | Não | Default: ativo |
| Itens do Template | tabela editável | **Sim** | Lista de despesas do template |

**Cada item do template**:
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Tipo de Despesa | select (catálogo) | **Sim** |
| Valor Padrão | decimal | Não |
| Método de Rateio | select | **Sim** |
| Ordem | number | Não |

**Botão `+ Adicionar Item`** dentro do formulário de template

**Ação `Definir como Padrão`**: Marca template como padrão da empresa (aplicado automaticamente em novas NFs)

---

### TELA 11: Layouts de Exportação (Config)

**Rota**: `/nf-importacao/config/layouts`

**O que é**: Construtor de layouts de arquivo para exportação. Permite mapear campos do Gravity para os campos exatos do ERP do cliente.

**Lista**: Nome, formato, quantidade de campos, status

**Botão `+ Novo Layout`**: Formulário com:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Nome | text | **Sim** | Nome do layout |
| Descrição | text | Não | Descrição |
| Formato | select | **Sim** | TOTVS Protheus, SAP, SENIOR, CSV, XML, JSON, Custom |
| Separador | text | Não | Separador de campo (`;`, `,`, `|`) para CSV |
| Codificação | select | Não | UTF-8, ISO-8859-1 (default UTF-8) |
| Tem Cabeçalho | toggle | Não | Se o arquivo tem linha de cabeçalho |
| Tem Rodapé | toggle | Não | Se o arquivo tem linha de rodapé |
| Template de Cabeçalho | textarea | Não | Template da linha de cabeçalho |
| Template de Rodapé | textarea | Não | Template da linha de rodapé |

**Mapeamento de Campos** (tabela editável — um por linha):
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Campo Origem | select | Campo do modelo Gravity (ex: numero_nf, valor_cif) |
| Rótulo/Campo Destino | text | Nome do campo no ERP |
| Tipo de Dado | select | String, Número, Data, Booleano |
| Formato | text | Formato de data/número (ex: DD/MM/YYYY) |
| Tamanho Fixo | number | Para arquivos posicionais (ex: TOTVS) |
| Posição Inicial | number | Para arquivos posicionais |
| Alinhamento | select | Esquerda, Direita, Centro |
| Preenchimento | text | Char de padding (ex: espaço, zero) |
| Valor Padrão | text | Valor fixo quando campo está vazio |
| Transformação | text | Expressão de transformação do valor |

---

### TELA 12: Favoritos Fiscais (Config)

**Rota**: `/nf-importacao/config/favoritos`

**O que é**: Atalhos de classificação fiscal por NCM. Ao aplicar um favorito a um item, preenche automaticamente CFOP, CSTs, alíquotas e benefícios fiscais.

**Lista**: NCM, Nome, CFOP, CST ICMS, status

**Botão `+ Novo Favorito`**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Nome | text | **Sim** | Nome do favorito (ex: "Monitor LED - MG") |
| Descrição | text | Não | Detalhe do uso |
| NCM | text (8 dígitos) | **Sim** | Código NCM |
| UF de Destino | select (estados) | Não | Para ICMS específico por estado |
| Tipo de Operação | select | Não | Importação / Importação Indireta |
| CFOP | text | Não | Código CFOP (ex: 3101) |
| CST ICMS | text | Não | Código de Situação Tributária do ICMS |
| CST IPI | text | Não | Código de Situação Tributária do IPI |
| CST PIS | text | Não | Código de Situação Tributária do PIS |
| CST COFINS | text | Não | Código de Situação Tributária do COFINS |
| Benefício Fiscal | text | Não | Código do benefício |
| Descrição do Benefício | text | Não | Ex-tarifário, REx, etc. |
| Alíquota II | decimal | Não | Imposto de Importação (%) |
| Alíquota IPI | decimal | Não | IPI (%) |
| Alíquota PIS | decimal | Não | PIS (%) |
| Alíquota COFINS | decimal | Não | COFINS (%) |
| Alíquota ICMS | decimal | Não | ICMS (%) |
| Ex-TIPI | text | Não | Exceção tarifária do TIPI |
| Ativo | toggle | Não | Default: ativo |

---

## REGRAS DE NEGÓCIO COMPLETAS

### Regras de Status

**RN-001**: Uma NF não pode avançar de rascunho para em_composicao manualmente — isso ocorre automaticamente ao adicionar a primeira despesa.

**RN-002**: Uma NF só pode ir para "Pronta" se tiver ao menos 1 item, ao menos 1 despesa, e TODAS as despesas tiverem rateios calculados e aplicados.

**RN-003**: Uma NF exportada não pode ser revertida para pronta. Para refazer, é necessário duplicar a NF.

**RN-004**: Uma NF cancelada não pode ser reativada. Para continuar o processo, duplicar e editar.

**RN-005**: Somente NFs com status "Pronta" ou "Exportada" podem gerar arquivos de exportação.

### Regras de Itens

**RN-010**: O número do item é sequencial e automático dentro de cada NF. Começa em 1.

**RN-011**: O NCM deve ter entre 8 e 10 caracteres (apenas dígitos).

**RN-012**: Itens só podem ser adicionados/editados/removidos em NFs com status rascunho ou em_composicao.

**RN-013**: Ao remover um item, todos os rateios desse item são removidos em cascata. O rateio precisará ser recalculado.

### Regras de Despesas

**RN-020**: O valor total de uma despesa deve ser > 0.

**RN-021**: Se a despesa estiver em moeda estrangeira, a taxa de câmbio é obrigatória.

**RN-022**: Ao remover uma despesa, todos os rateios dela são removidos em cascata.

**RN-023**: Despesas só podem ser adicionadas/editadas em NFs com status rascunho ou em_composicao.

### Regras de Rateio

**RN-030**: O rateio é calculado por despesa, usando o método definido em cada despesa individualmente.

**RN-031**: A soma dos valores rateados de uma despesa deve ser igual ao valor total da despesa, com tolerância de R$ 0,01.

**RN-032**: Se o divisor do método de rateio for zero (ex: todos os itens têm peso_liquido = 0), o sistema faz fallback automático para o método Igualitário e emite um aviso.

**RN-033**: O último item da NF recebe qualquer diferença de centavos de arredondamento (campo `is_centavo_restante = true`).

**RN-034**: O override manual de um rateio marca aquele rateio como `is_override_manual = true` e recalcula o percentual.

**RN-035**: Ao recalcular o rateio, overrides manuais anteriores são perdidos (o rateio antigo é deletado e substituído).

### Regras de Exportação

**RN-040**: Ao gerar a exportação pela primeira vez em uma NF com status "Pronta", a NF transita para "Exportada".

**RN-041**: Exportações de uma NF já exportada não mudam o status (permanece exportada) — apenas geram um novo arquivo.

**RN-042**: O layout personalizado só é aplicável no formato "Custom".

**RN-043**: O Preview de exportação sempre retorna JSON, independente do formato escolhido.

### Regras de Catálogo de Despesas

**RN-050**: O código de uma categoria de despesa é único por tenant + empresa.

**RN-051**: Não é possível excluir uma categoria que esteja vinculada a despesas existentes.

**RN-052**: Inativar uma categoria não afeta despesas já criadas com ela — apenas impede novas.

### Regras de Templates

**RN-060**: Um template pode ter vários itens, e cada item pode ter valores padrão ou não.

**RN-061**: Ao aplicar um template, as despesas são criadas com os valores padrão do template (usuário pode editar depois).

**RN-062**: Cada empresa pode ter apenas 1 template marcado como padrão.

### Regras de Favoritos Fiscais

**RN-070**: Um favorito pode ser específico por NCM + UF + tipo de operação, ou genérico (apenas por NCM).

**RN-071**: Ao aplicar um favorito a um item, apenas os campos preenchidos no favorito sobrescrevem os campos do item. Campos vazios no favorito são ignorados.

---

## MENSAGENS DE ERRO E AVISOS

### Erros de Validação (HTTP 400)

| Código | Mensagem | Quando |
|--------|---------|--------|
| `VALIDATION_ERROR` | "Campos obrigatórios não preenchidos" | Body inválido |
| `INVALID_NCM` | "NCM deve ter entre 8 e 10 dígitos" | NCM fora do padrão |
| `INVALID_CHAVE_ACESSO` | "Chave de acesso deve ter 44 dígitos" | Chave SEFAZ inválida |
| `VALOR_ZERO` | "Valor total deve ser maior que zero" | Despesa com valor 0 |
| `TAXA_CAMBIO_OBRIGATORIA` | "Taxa de câmbio obrigatória para moeda estrangeira" | Falta taxa |
| `CODIGO_DUPLICADO` | "Código de despesa já existe para esta empresa" | Conflito catálogo |
| `METODO_RATEIO_OBRIGATORIO` | "Selecione um método de rateio" | Falta método |

### Erros de Negócio (HTTP 422)

| Código | Mensagem | Quando |
|--------|---------|--------|
| `NF_NAO_ENCONTRADA` | "NF não encontrada" | ID inválido ou sem permissão |
| `TRANSICAO_INVALIDA` | "Não é possível transitar de [X] para [Y]" | Fluxo de status inválido |
| `NF_NAO_EDITAVEL` | "NF com status [X] não pode ser editada" | Tentativa de editar NF pronta/exportada/cancelada |
| `SEM_ITENS` | "Adicione pelo menos um item antes de prosseguir" | Tentativa de ir para pronta sem itens |
| `SEM_DESPESAS` | "Adicione pelo menos uma despesa" | Tentativa de ir para pronta sem despesas |
| `RATEIO_PENDENTE` | "Existem despesas sem rateio calculado" | Tentativa de ir para pronta com rateio incompleto |
| `RATEIO_SOMA_INVALIDA` | "Soma do rateio difere do total em R$ [X]" | Erro de rateio |
| `NF_NAO_EXPORTAVEL` | "NF deve estar com status Pronta ou Exportada para exportar" | Exportação inválida |
| `TEMPLATE_NAO_ENCONTRADO` | "Template não encontrado" | Template deletado |
| `FAVORITO_NAO_ENCONTRADO` | "Favorito fiscal não encontrado" | Favorito deletado |

### Erros de Servidor (HTTP 500)

| Código | Mensagem | Quando |
|--------|---------|--------|
| `DB_ERROR` | "Erro ao acessar o banco de dados" | Prisma falhou |
| `EXPORT_ERROR` | "Erro ao gerar arquivo de exportação" | Falha no gerador |
| `SMART_READ_ERROR` | "Erro no processamento do documento" | OCR falhou |

### Avisos Informativos (não bloqueantes)

| Situação | Mensagem exibida |
|----------|-----------------|
| Rateio com fallback | "Método [X] resultou em divisor zero. Usando Igualitário como fallback" |
| Diferença de centavos | "Diferença de R$ 0,01 absorvida pelo último item (arredondamento)" |
| Smart Read aguardando | "Processamento iniciado. O resultado aparecerá em alguns instantes" |
| Portal Único indisponível | "Não foi possível conectar ao Portal Único. Tente novamente" |
| NF duplicada | "NF duplicada com sucesso. Editando nova NF como rascunho" |
| Export em NF já exportada | "Esta NF já foi exportada. Gerando novo arquivo" |

---

## FLUXOS COMPLETOS

### Fluxo 1: Criar NF a partir de XML

1. Usuário clica em `+ Nova NF`
2. Seleciona canal **XML (DUIMP)**
3. Faz upload do arquivo `.xml`
4. Sistema processa o XML e preenche automaticamente:
   - Dados da DUIMP (número, datas, exportador, importador)
   - Valores FOB, Frete, Seguro, CIF
   - Itens com NCM, descrição, quantidades, pesos, valores, impostos
5. Usuário revisa e ajusta os dados no Step 2
6. Avança para Step 3 — Adiciona despesas (frete pode já vir do XML, mas despesas operacionais são manuais)
7. Avança para Step 4 — Calcula e aplica rateio
8. Avança para Step 5 — Revisa classificação fiscal de cada item
9. Avança para Step 6 — Seleciona formato (ex: TOTVS Protheus) e gera arquivo
10. Arquivo é baixado automaticamente. NF vai para status **Exportada**.

### Fluxo 2: Criar NF Manualmente

1. Usuário clica em `+ Nova NF`
2. Seleciona canal **Manual**
3. Preenche todos os campos do Step 2 (dados da NF)
4. No Step 3, clica em `+ Adicionar Despesa` e preenche cada despesa uma a uma
5. No detalhe da NF (aba Itens), adiciona cada item manualmente com todos os campos
6. Volta para aba Rateio, clica `Calcular Rateio`, revisa, clica `Aplicar Rateio`
7. Na aba Exportação, escolhe formato e gera arquivo

### Fluxo 3: Rateio com Override Manual

1. NF em status **Em Composição**
2. Usuário vai para aba Rateio
3. Clica `Calcular Rateio` — sistema calcula automaticamente
4. Usuário identifica que o Item C recebeu valor incorreto
5. Clica na célula do Item C na despesa X
6. Digita o valor correto manualmente
7. Sistema recalcula o percentual e atualiza o restante
8. Usuário clica `Aplicar Rateio` — persiste os valores (com o override)

### Fluxo 4: Aplicar Template de Despesas

1. NF em status **Rascunho** ou **Em Composição**
2. Na aba Despesas (ou Step 3), clica `Aplicar Template`
3. Seleciona o template desejado (ex: "Importação Marítima Completa")
4. Sistema cria automaticamente todas as despesas do template (ex: Frete, Armazenagem, Despachante, AFRMM, Siscomex)
5. Cada despesa criada com os valores padrão e métodos de rateio do template
6. Usuário edita os valores conforme o processo específico
7. NF transita automaticamente para **Em Composição** se era rascunho

### Fluxo 5: Duplicar NF

1. Usuário acessa uma NF exportada (ou qualquer status)
2. Clica `Duplicar`
3. Sistema cria nova NF como **Rascunho** com:
   - Mesmos dados gerais (exportador, importador, valores, logística)
   - Mesmos itens
   - **Sem** despesas (precisam ser adicionadas novamente)
   - **Sem** rateios
4. Nova NF recebe novo ID e status rascunho
5. Usuário edita o que for necessário e refaz o processo

---

## INTEGRAÇÕES DO PRODUTO

### Com o Processo Gravity
- Ao criar NF via canal "Processo", o sistema busca os dados do Processo (exportador, importador, valores, mercadorias)
- A NF fica vinculada ao Processo via `processo_id`
- Mudanças de status da NF podem notificar o Processo

### Com o Configurador
- Autenticação via Clerk (usuário final)
- Permissões verificadas via Configurador
- Tenant e empresa do usuário determinam quais NFs ele vê

### Com o Conector ERP
- Exportação pode ser feita via API pelo Conector ERP (automação)
- Webhooks para notificar ERP quando NF fica Pronta

### Com o Histórico (Tenant Service)
- Todo evento da NF (criar, mudar status, adicionar despesa, etc.) é registrado no Histórico global do tenant
- Auditável por qualquer usuário com permissão

### Com Notificações (Tenant Service)
- NF pronta: notifica o responsável
- Exportação gerada: notifica o operador
- Erro de processamento Smart Read: notifica o usuário

---

## CASOS DE BORDA E COMPORTAMENTOS ESPECIAIS

### CB-001: NF sem itens com despesas rateadas
- O rateio não pode ser aplicado sem itens
- Botão `Aplicar Rateio` fica desabilitado
- Mensagem: "Adicione itens à NF antes de calcular o rateio"

### CB-002: Todos os itens com peso_liquido = 0 (método PESO_LIQUIDO)
- Sistema detecta divisor zero
- Fallback automático para IGUALITÁRIO
- Aviso exibido ao usuário
- Rateio aplicado normalmente com o fallback

### CB-003: Despesa de valor muito pequeno com muitos itens (arredondamento)
- Ex: R$ 0,01 distribuído entre 10 itens → cada um recebe R$ 0,001
- Sistema arredonda para 2 casas decimais
- 9 itens recebem R$ 0,00, 1 item recebe R$ 0,01 (centavo restante)

### CB-004: Taxa de câmbio zero
- Validação impede salvar despesa com taxa = 0 se moeda ≠ BRL
- Mensagem: "Taxa de câmbio deve ser maior que zero"

### CB-005: XML inválido ou fora do padrão DUIMP
- Sistema retorna erro com lista de campos inválidos
- NF não é criada
- Usuário pode tentar corrigir o XML ou usar entrada manual

### CB-006: Smart Read com baixa confiança
- OCR retorna confiança < 80%
- Dados são preenchidos mas marcados como "verificar"
- Campos com baixa confiança ficam com borda laranja
- Usuário deve revisar manualmente

### CB-007: Cancelamento de NF com exportações anteriores
- Mesmo exportadas, NFs podem ser canceladas
- Exportações anteriores permanecem no histórico
- NF cancelada aparece na lista com badge vermelho "Cancelada"

### CB-008: Editar NF após rateio aplicado (mas antes de exportar)
- Usuário edita um item (ex: peso_liquido)
- Sistema detecta que o rateio ficou desatualizado
- Badge "Rateio desatualizado" aparece na aba Rateio
- NF permanece em **Em Composição** (não vai automaticamente para Pronta)
- Usuário precisa recalcular e reaplicar o rateio

---

## PERMISSÕES E ACESSOS

| Ação | Perfil Mínimo |
|------|--------------|
| Visualizar lista de NFs | Colaborador |
| Criar NF | Colaborador |
| Editar NF em rascunho/composição | Colaborador |
| Aplicar rateio | Colaborador |
| Exportar NF | Analista |
| Cancelar NF | Analista |
| Gerenciar catálogo de despesas | Administrador |
| Gerenciar templates | Administrador |
| Gerenciar layouts de exportação | Administrador |
| Gerenciar favoritos fiscais | Administrador |

---

## GLOSSÁRIO

| Termo | Definição |
|-------|-----------|
| **NF** | Nota Fiscal de Importação |
| **DUIMP** | Declaração Única de Importação (sistema do governo federal) |
| **DI** | Declaração de Importação (sistema antigo, sendo substituído pela DUIMP) |
| **Rateio** | Distribuição proporcional de despesas entre itens da NF |
| **CIF** | Cost, Insurance and Freight — valor total da mercadoria no desembarque |
| **FOB** | Free On Board — valor da mercadoria no porto de embarque (sem frete e seguro) |
| **NCM** | Nomenclatura Comum do Mercosul — código de classificação tarifária |
| **CFOP** | Código Fiscal de Operações e Prestações |
| **CST** | Código de Situação Tributária |
| **II** | Imposto de Importação |
| **IPI** | Imposto sobre Produtos Industrializados |
| **PIS/COFINS** | Impostos federais incidentes na importação |
| **ICMS** | Imposto Estadual |
| **Ex-TIPI** | Exceção tarifária na Tabela de Incidência do IPI |
| **AFRMM** | Adicional ao Frete para Renovação da Marinha Mercante |
| **Smart Read** | Recurso de leitura inteligente via OCR + IA para extrair dados de documentos |
| **Portal Único** | Sistema do governo federal para declarações de importação/exportação |
| **Incoterm** | International Commercial Terms — termos padrão de comércio internacional (FOB, CIF, EXW, etc.) |
| **Catálogo** | Tabela de despesas pré-configuradas reutilizáveis |
| **Template** | Conjunto de despesas salvo para aplicação em múltiplas NFs |
| **Favorito Fiscal** | Classificação fiscal salva por NCM para uso rápido |
| **Override Manual** | Sobrescrita manual do valor de rateio calculado automaticamente |
| **Centavo Restante** | Diferença de arredondamento absorvida pelo último item |

---

*Este documento é a referência completa do produto NF Importação para treinamento da GABI. Atualizar sempre que funcionalidades forem adicionadas ou modificadas.*
