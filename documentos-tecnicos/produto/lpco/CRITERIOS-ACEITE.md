# Criterios de Aceite — LPCO MVP

> **Elaborado por:** Business Analyst — Dream Team de Produtos
> **Data:** 30/03/2026
> **Formato:** Gherkin (Dado/Quando/Entao)

---

## Story #1 — Lista de LPCOs

### CA-048: Listagem basica

```gherkin
Dado que o usuario esta logado com permissao "lpco:read"
  E existem 50 LPCOs no tenant
Quando acessa a tela "/lpco"
Entao a lista exibe LPCOs paginados (20 por pagina)
  E cada linha mostra: ID, orgao, tipo operacao, status, data registro, canal entrada
  E a contagem total mostra "50 LPCOs"
```

### CA-049: Filtro por status

```gherkin
Dado que existem LPCOs nos status rascunho, em_analise e deferida
Quando o usuario filtra por status "em_analise"
Entao apenas LPCOs com status "em_analise" sao exibidos
  E a contagem total reflete o filtro
```

### CA-050: Filtro por orgao anuente

```gherkin
Dado que existem LPCOs para ANVISA, MAPA e IBAMA
Quando o usuario filtra por orgao "ANVISA"
Entao apenas LPCOs do orgao ANVISA sao exibidos
```

### CA-051: Filtro combinado

```gherkin
Dado que existem 50 LPCOs no tenant
Quando filtra por status "em_exigencia" E orgao "ANVISA"
Entao apenas LPCOs que atendem AMBOS filtros sao exibidos
  E paginacao reflete o resultado filtrado
```

### CA-052: Busca por texto

```gherkin
Dado que existe LPCO com numero_portal "I2600000001234"
Quando o usuario digita "1234" na busca
Entao o LPCO aparece no resultado
  E debounce de 300ms e aplicado
```

---

## Story #2 — Criar LPCO manual (rascunho)

### CA-001: Escolha de canal — manual

```gherkin
Dado que o usuario esta logado com permissao "lpco:create"
  E esta na tela "/lpco/novo"
Quando seleciona o card "Digitar manual"
Entao o sistema avanca para Step 1 (Dados Gerais)
  E o campo canal_entrada e definido como "MANUAL"
```

### CA-002: Dados gerais validos

```gherkin
Dado que o usuario esta no Step 1
Quando seleciona tipo_operacao "IMPORTACAO"
  E seleciona orgao_anuente "ANVISA"
  E seleciona modelo_lpco "I00004"
  E preenche pais_procedencia "CN"
  E preenche fundamento_legal "Portaria ANVISA 344/98"
  E clica em "Proximo"
Entao o sistema salva como rascunho
  E avanca para Step 2 (Itens)
  E o ID corporativo e gerado (lpco_id_XXXXXXX/YY)
```

### CA-003: Campos obrigatorios vazios

```gherkin
Dado que o usuario esta no Step 1
Quando deixa orgao_anuente vazio
  E clica em "Proximo"
Entao o sistema exibe erro "Orgao anuente e obrigatorio"
  E o campo e destacado em vermelho
  E NAO avanca para Step 2
```

### CA-004: Tenant isolation na criacao

```gherkin
Dado que o usuario pertence ao tenant "Empresa A"
Quando cria um LPCO
Entao o LPCO e criado com tenant_id = "Empresa A"
  E company_id = company do usuario
  E user_id = usuario logado
```

### CA-005: Status inicial

```gherkin
Dado que o usuario criou um LPCO
Entao o status e "rascunho"
  E LpcoHistorico registra evento "lpco_criado" com canal_entrada
```

---

## Story #3 — Preencher itens NCM

### CA-006: Adicionar item com NCM

```gherkin
Dado que o usuario esta no Step 2 de um LPCO rascunho
Quando preenche ncm "30049099"
  E preenche descricao "Medicamento X"
  E preenche quantidade_estatistica 1000
  E preenche unidade_medida "KG"
  E preenche peso_liquido 500
  E preenche vmle 50000
  E preenche moeda "USD"
  E clica em "Adicionar Item"
Entao o item aparece na lista com ID lpit_id_XXXXXXX/YY
```

### CA-007: NCM invalido

```gherkin
Dado que o usuario esta no Step 2
Quando preenche ncm "1234" (menos de 8 digitos)
Entao o sistema exibe erro "NCM deve ter 8 digitos"
  E o item NAO e adicionado
```

### CA-008: Importacao exige catalogo de produtos

```gherkin
Dado que o LPCO e de importacao
  E o usuario nao selecionou produto do Catalogo
Quando tenta adicionar o item
Entao o sistema exibe alerta "Importacao exige produto cadastrado no Catalogo"
```

### CA-009: Atributos dinamicos do orgao

```gherkin
Dado que o orgao anuente e "ANVISA" e modelo "I00004"
Quando o sistema carrega os atributos do modelo
Entao o formulario dinamico exibe os campos especificos do ANVISA
  E campos obrigatorios sao marcados com asterisco
  E campos condicionais aparecem quando o campo pai e preenchido
```

### CA-010: Minimo 1 item

```gherkin
Dado que o LPCO nao tem nenhum item
Quando o usuario clica em "Proximo" (para Step 3)
Entao o sistema exibe erro "Adicione pelo menos 1 item"
  E NAO avanca para Step 3
```

---

## Story #4 — Validar e registrar LPCO

### CA-013: Pre-validacao Zod

```gherkin
Dado que o usuario esta no Step 3 (Revisao)
Quando o sistema executa a validacao
Entao todos os campos obrigatorios sao verificados
  E erros sao listados com indicacao do campo
  E o botao "Registrar" so fica habilitado se nao ha erros
```

### CA-016: Registrar com sucesso

```gherkin
Dado que o LPCO passou na validacao
Quando o usuario clica em "Registrar"
Entao o status muda de "rascunho" para "para_analise"
  E LpcoHistorico registra evento "lpco_registrado"
  E data_registro e preenchida com timestamp atual
  E o LPCO nao pode mais ser editado (readonly)
```

### CA-017: Registrar no Portal Unico (se credencial configurada)

```gherkin
Dado que o tenant tem certificado digital configurado
  E o LPCO foi registrado internamente
Quando o sistema tenta registrar no Portal Unico
  E o Portal retorna numero "I2600000001234"
Entao numero_portal e preenchido com "I2600000001234"
  E LpcoHistorico registra evento "registrado_portal_unico"
```

### CA-018: Registro Portal Unico falha (fallback manual)

```gherkin
Dado que a API do Portal Unico retorna erro 500
Quando o sistema tenta registrar
Entao o LPCO permanece em status "para_analise"
  E o sistema exibe mensagem "Nao foi possivel registrar no Portal. Registre manualmente."
  E LpcoHistorico registra evento "falha_registro_portal"
```

---

## Story #5 — Criar LPCO a partir do Pedido

### CA-063: Selecionar Pedido

```gherkin
Dado que o usuario selecionou canal "A partir do Pedido" no Step 0
Quando seleciona o Pedido "pedi_id_0000042/26"
Entao o sistema preenche automaticamente:
  - tipo_operacao (do Pedido)
  - pais_procedencia (do exportador do Pedido)
  - importacao_exportador_id (do Pedido)
  - Itens: NCM, descricao, quantidade, peso, valor, moeda (do PedidoItem)
  E canal_entrada = "PEDIDO"
  E pedido_origem_id = "pedi_id_0000042/26"
```

### CA-064: Campos auto-preenchidos sao editaveis

```gherkin
Dado que o LPCO foi pre-preenchido a partir do Pedido
Quando o usuario esta no Step 1
Entao todos os campos auto-preenchidos sao editaveis
  E o usuario ainda deve completar: orgao_anuente, modelo_lpco, fundamento_legal
```

### CA-065: Pedido sem itens

```gherkin
Dado que o Pedido selecionado nao tem itens
Quando o sistema tenta pre-preencher
Entao exibe mensagem "Pedido sem itens. Adicione itens manualmente no Step 2."
```

---

## Story #6 — Smart Read (OCR+IA)

### CA-067: Upload de documento

```gherkin
Dado que o usuario selecionou canal "Smart Read" no Step 0
Quando faz upload de uma fatura comercial (PDF)
Entao o sistema exibe indicador de processamento
  E apos processamento, mostra os campos extraidos
```

### CA-068: Preview de extracao

```gherkin
Dado que o Smart Read processou o documento
Quando o resultado e exibido
Entao campos extraidos com alta confianca (>80%) aparecem em verde
  E campos extraidos com baixa confianca (<80%) aparecem em amarelo
  E campos nao encontrados aparecem vazios
  E NENHUM campo e aceito sem confirmacao humana
```

### CA-069: Confirmacao campo a campo

```gherkin
Dado que o usuario esta na tela de preview do Smart Read
Quando clica em "Confirmar" em um campo extraido
Entao o campo e aceito e fica verde
Quando clica em "Editar" em um campo extraido
Entao o campo se torna editavel para correcao
```

### CA-070: Gerar rascunho

```gherkin
Dado que o usuario confirmou todos os campos obrigatorios
Quando clica em "Criar Rascunho"
Entao o sistema cria o LPCO com canal_entrada = "SMART_READ"
  E avanca para Step 1 (completar orgao, modelo, fundamento)
```

---

## Story #8 — Responder exigencias

### CA-023: Receber exigencia

```gherkin
Dado que o LPCO esta em status "em_exigencia"
  E o orgao anuente formulou uma exigencia
Quando o usuario acessa a aba Exigencias
Entao a exigencia aparece com descricao, data e prazo
  E o status mostra "pendente"
  E ha botao "Responder"
```

### CA-024: Responder com texto

```gherkin
Dado que o usuario clica em "Responder" na exigencia
Quando preenche o campo de resposta com texto
  E clica em "Enviar Resposta"
Entao o status da exigencia muda para "respondida"
  E data_resposta e preenchida
  E LpcoHistorico registra evento "exigencia_respondida"
  E o status do LPCO muda para "resposta_exigencia"
```

### CA-025: Resposta vazia

```gherkin
Dado que o usuario clica em "Responder"
Quando deixa o campo de resposta vazio
  E clica em "Enviar Resposta"
Entao o sistema exibe erro "Resposta e obrigatoria"
  E a resposta NAO e enviada
```

---

## Story #9 — Cancelamento automatico 90 dias

### CA-042: Cancelamento no dia 90

```gherkin
Dado que LPCO esta em status "em_exigencia"
  E data_ultima_exigencia foi ha exatamente 90 dias
Quando cron job de cancelamento executa
Entao o status muda para "cancelada"
  E LpcoHistorico registra evento "cancelamento_automatico_90_dias"
  E notificacao in-app e enviada ao usuario
  E email e enviado ao usuario
```

### CA-043: Alerta 60 dias (amarelo)

```gherkin
Dado que LPCO esta em "em_exigencia" ha 60 dias
Quando cron de alertas executa
Entao notificacao amarela e criada: "LPCO {id} — exigencia pendente ha 60 dias. Cancelamento em 30 dias."
```

### CA-044: Alerta 80 dias (vermelho)

```gherkin
Dado que LPCO esta em "em_exigencia" ha 80 dias
Quando cron de alertas executa
Entao notificacao vermelha e criada: "URGENTE: LPCO {id} sera cancelado em 10 dias"
  E email urgente e enviado
```

---

## Story #11 — Integracao Portal Unico (registrar)

### CA-081: Registrar via certificado digital

```gherkin
Dado que o tenant tem certificado digital e-CNPJ configurado
  E o LPCO esta em status "para_analise"
Quando o usuario clica em "Registrar no Portal Unico"
Entao o sistema autentica via mTLS com o certificado
  E envia POST /portal/api/ext/lpco-importacao
  E recebe numero_portal do Portal Unico
  E atualiza o LPCO com o numero recebido
  E LpcoHistorico registra "registrado_portal_unico"
```

### CA-082: Registrar via token OAuth2

```gherkin
Dado que o tenant tem token OAuth2 configurado (sem certificado)
  E o token tem scope de escrita
Quando o usuario clica em "Registrar no Portal Unico"
Entao o sistema autentica via client_credentials
  E registra normalmente
```

### CA-083: Sem credencial configurada

```gherkin
Dado que o tenant NAO tem credencial configurada
Quando o usuario clica em "Registrar no Portal Unico"
Entao o sistema exibe mensagem "Configure certificado digital ou token em Configuracoes"
  E oferece link para tela de credenciais
  E o LPCO permanece em "para_analise" (modo manual)
```

---

## Story #12 — Infraestrutura certificado digital

### CA-089: Upload de certificado .pfx

```gherkin
Dado que o admin esta na tela de configuracoes
Quando faz upload de arquivo .pfx
  E preenche a senha do certificado
  E clica em "Salvar"
Entao o sistema valida o formato do certificado
  E armazena o .pfx criptografado com AES-256-GCM
  E armazena a senha criptografada com AES-256-GCM
  E extrai e exibe: CN (CNPJ), validade, emissor
  E senha NUNCA e exibida novamente
```

### CA-090: Certificado invalido

```gherkin
Dado que o admin faz upload de arquivo que nao e .pfx
Quando clica em "Salvar"
Entao o sistema exibe erro "Formato invalido. Envie um certificado .pfx ou .p12"
```

### CA-091: Teste de conexao

```gherkin
Dado que o certificado foi salvo
Quando o admin clica em "Testar Conexao"
Entao o sistema tenta autenticar no Portal Unico (ambiente treinamento)
  E exibe "Conexao OK" ou "Falha: {motivo}"
```

### CA-092: Alerta de vencimento

```gherkin
Dado que o certificado vence em 30 dias
Quando o cron de alertas executa
Entao notificacao e criada: "Certificado digital vence em 30 dias. Renove para manter integracao."
```

---

## Story #15 — Vincular LPCO a Processo

### CA-030: Vincular LPCO deferida

```gherkin
Dado que LPCO esta em status "deferida"
  E existem Processos no Gravity
Quando o usuario clica em "Vincular a Processo"
  E seleciona Processo "proc_id_0000001/26"
  E seleciona tipo_documento "DUIMP"
Entao LpcoVinculo e criado
  E LpcoHistorico registra "vinculo_criado"
```

### CA-031: Vincular LPCO nao deferida

```gherkin
Dado que LPCO esta em status "em_analise" (nao deferida)
Quando o usuario tenta vincular
Entao o sistema exibe erro "Apenas LPCOs deferidas podem ser vinculadas"
```

---

## Story #16 — Controle de saldo LPCO Flex

### CA-035: Saldo suficiente

```gherkin
Dado que LPCO Flex tem quantidade_deferida = 1000 kg
  E vinculos existentes totalizam 600 kg
  E saldo_disponivel = 400 kg
Quando usuario cria vinculo com quantidade = 300 kg
Entao vinculo e criado
  E saldo_disponivel atualiza para 100 kg
```

### CA-036: Saldo insuficiente

```gherkin
Dado que LPCO Flex tem saldo_disponivel = 100 kg
Quando usuario tenta criar vinculo com quantidade = 200 kg
Entao o sistema rejeita com erro "Saldo insuficiente. Disponivel: 100 kg"
  E nenhum vinculo e criado
```

### CA-037: Vigencia expirada

```gherkin
Dado que LPCO Flex tem data_vigencia_fim = ontem
Quando usuario tenta criar vinculo
Entao o sistema rejeita com erro "LPCO com vigencia expirada"
```

### CA-038: Cancelar vinculo devolve saldo

```gherkin
Dado que LPCO Flex tem saldo_disponivel = 100 kg
  E existe vinculo de 300 kg
Quando usuario cancela o vinculo
Entao saldo_disponivel atualiza para 400 kg
  E vinculo.status muda para "cancelado"
```

---

## Story #17 — Historico completo

### CA-045: Timeline de eventos

```gherkin
Dado que o LPCO tem 5 eventos no historico
Quando o usuario acessa a aba Historico
Entao os eventos aparecem em ordem cronologica inversa (mais recente primeiro)
  E cada evento mostra: data/hora, evento, usuario, descricao
```

### CA-046: Eventos de sistema

```gherkin
Dado que o cron de cancelamento cancelou um LPCO
Quando o usuario ve o historico
Entao o evento mostra user_nome = "Sistema" e evento = "cancelamento_automatico_90_dias"
```

### CA-047: Historico imutavel

```gherkin
Dado que existem eventos no historico
Entao NENHUM evento pode ser editado ou deletado (append-only)
  E nao existe botao de editar ou excluir no historico
```

---

## Story #19 — Importar LPCOs via planilha

### CA-073: Upload de Excel

```gherkin
Dado que o usuario selecionou canal "Planilha" no Step 0
Quando faz upload de arquivo Excel (.xlsx)
Entao o sistema faz parse das colunas
  E exibe tela de mapeamento: coluna da planilha → campo do LPCO
```

### CA-074: Preview antes de confirmar

```gherkin
Dado que o mapeamento foi feito
Quando o usuario clica em "Preview"
Entao o sistema exibe os primeiros 10 LPCOs que serao criados
  E destaca erros de validacao em vermelho
  E mostra contagem: "X validos, Y com erro"
```

### CA-075: Confirmar criacao em lote

```gherkin
Dado que o preview mostra 20 LPCOs validos e 2 com erro
Quando o usuario clica em "Criar 20 Rascunhos"
Entao 20 LPCOs sao criados com canal_entrada = "PLANILHA"
  E os 2 com erro NAO sao criados
  E o sistema exibe resumo: "20 criados, 2 rejeitados"
```

---

## Story #21 — Simulador de Tratamento Administrativo

### CA-053: Consultar NCM

```gherkin
Dado que o usuario esta na tela do Simulador TA
Quando digita NCM "30049099"
  E seleciona operacao "IMPORTACAO"
  E clica em "Simular"
Entao o sistema retorna os orgaos anuentes que exigem LPCO para essa NCM
  E mostra: sigla do orgao, modelo de LPCO, obrigatoriedade
```

### CA-054: NCM sem exigencia

```gherkin
Dado que a NCM "01012100" nao exige LPCO
Quando o usuario simula
Entao o sistema mostra "Esta NCM nao exige LPCO para importacao"
```

---

## Tenant Isolation (aplicavel a TODAS as stories)

### CA-TI-001: Dados isolados por tenant

```gherkin
Dado que existem LPCOs do tenant "Empresa A" e do tenant "Empresa B"
Quando o usuario do tenant "Empresa A" acessa qualquer tela
Entao apenas dados do tenant "Empresa A" sao exibidos
  E nenhum dado do tenant "Empresa B" e visivel
  E nenhum dado do tenant "Empresa B" e acessivel via API
```

### CA-TI-002: Anti-enumeracao

```gherkin
Dado que LPCO "lpco_id_0000001/26" pertence ao tenant "Empresa B"
Quando usuario do tenant "Empresa A" tenta acessar via GET /api/v1/lpcos/lpco_id_0000001/26
Entao o sistema retorna HTTP 404 (nao 403)
  E a mensagem e "LPCO nao encontrado"
```
