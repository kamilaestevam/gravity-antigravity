# Arquitetura de Software: SimulaCusto (Estimativa de Custo)

Este documento dita as regras imutáveis da engenharia de banco de dados e lógica de negócios do produto **SimulaCusto** (`Estimativa`).

## 1. O Modelo de Dados Absoluto (`Estimativa`)
A `Estimativa` de custo (Landed Cost) é um artefato volátil simulado pelo Operador Aduaneiro antes que a carga sequer saia do armazém da China ou EUA. Ela **não** é uma invoice real, ela é uma *expectativa financeira*.

### 1.1 Regra de Ouro: Identificadores (Padrão Corporativo)
Não utilizamos UUIDs genéricos e irreconhecíveis em Logs. Todo ID deve conter seu radical identificador e o ano corrente.
```prisma
id String @id // ex: esti_id_000000001/26
```

### 1.2 Regra de Ouro: Zero-Trust Isolation Nível 2
Uma estimativa de custo contém NCMs, Despesas, Margens Logísticas e Preços do Fornecedor. Isso é segredo industrial absurdo. Um ID vazado nunca pode permitir que um usuário do Tenant Alpha veja a estimativa do Tenant Beta.
Toda tabela do módulo **TEM que ter**:
```prisma
tenant_id  String // Identifica a Instância (Master)
company_id String // Identifica a Filial/Workspace atuante
```

### 1.3 O Ciclo de Vida: A Conexão com o "CoreProcess"
As estimativas transitam entre os estados: `draft`, `efetivada` (aprovada para embarque), e `arquivada` (lixo).
Quando o Operador Aduaneiro decidir que aquela estimativa "vai virar um processo real" de importação, a linha da tabela Estimativa **será carimbada** com o `core_id`:
```prisma
core_id String? // Liga a Estimativa ao Processo Real
```
Nesse momento, a Estimativa congela. As `taxas` dela serão absorvidas pelo `CoreProcess` e ela não sofre mais edição, transformando-se num histórico/prova do planejamento inicial da importação para comparação com o Custo Real Efetivo.

## 2. Tabelas Satélites da Estimativa
O `SimulaCusto` não sobrevive apenas de `ncm` e `valor_fob`. Ele possui anexos cruciais:
- `TaxaEstimativa`: São os Capatazias, Armazenagens, Fretes (Rodoviários, Marítimos) anexados. Devem possuir os mesmos indexadores compulsórios (`tenant_id`, `company_id`, `estimativa_id`).

## 3. Composição de Landed Cost (Segurança de Ponto Flutuante)
Os valores transacionados pelo banco NUNCA devem ser formatados ou parseados como strings dentro do Banco de Dados para envio via API (tipo transformar R$ em varchar no Prisma Raw). Eles correm nativamente em `Float` ou `Decimal` para evitar erros de cast em cálculo tributário (IPI, PIS, COFINS, ICMS) onde a 4ª casa decimal muda a base de cálculo.
