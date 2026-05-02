# Histórico Global (`historico-global`)

## Visão Geral
O **Histórico Global** é o serviço base de Auditoria e Log do Gravity (Onda 3). Ele fornece a fundação `fire-and-forget` para rastrear qualquer alteração, acesso ou evento gerado na plataforma.

## Princípios (Por Agentes Gravity)

### Líder (Estratégia)
- **Altamente Descentralizado:** Desenvolvido como serviço em background, desenhado para não bloquear ou engasgar a UX do administrador que originou a requisição na plataforma.
- **Multiaxial:** Grava ações tanto de Clientes/Staff (USER/ADMIN) quanto rotinas e IAs nativos (GABI_IA / SYSTEM).

### Coordenador / Líder Técnico (Arquitetura)
- **Isolamento Absoluto por Organização:** Todo log obrigatoriamente vincula-se a um `id_organizacao`. Nenhuma leitura escapa do filtro e a modelagem do Prisma está enraizada nisso com índices rápidos (`@@index([id_organizacao])`).
- **Esquema Flexível:** Um `HistoryLog` abstrai o estado mutado (JSON) através do campo PostgreSQL `JSONB`, suportando Diffs e Payloads de formatos complexos passados pelas frentes (`useHistoricoLogger`).

### QA (Segurança e Validação)
- Filtros Paginados são mandatórios e as requisições cruzadas (ex: um Tenant lendo os Logs de outro Tenant) recebem mitigação imediata de erro HTTP 403 via `withTenantIsolation`.

## Como Integrar (Frontend Configurador)
Utilize o hook utilitário global para registrar novos eventos na auditoria:
```tsx
import { useHistoricoLogger } from '@/hooks/useHistoricoLogger';

function SuspenderItem() {
  const { logEvent } = useHistoricoLogger();

  const handleSuspender = async () => {
    await suspenderNaApi();
    
    // Dispara assincronamente (Fire-and-forget)
    logEvent({
      acao: 'ALTERAÇÃO',
      quemNome: 'Daniel Martins',
      quemTipo: 'user',
      entidade: 'Produtos Globais',
      oQueFoiFeito: 'Produto XYZ Suspenso pelo Administrador',
      diff: [{ campo: 'STATUS', antes: 'Ativo', depois: 'Suspenso' }]
    });
  };
}
```
