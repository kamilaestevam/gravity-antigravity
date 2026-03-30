# Sistema de Idiomas — Visão Geral

## O que é

O sistema de internacionalização (i18n) da plataforma Gravity permite que toda a interface seja exibida em 3 idiomas:

| Idioma | Código | Status | Bandeira |
|--------|--------|--------|----------|
| Português (Brasil) | `pt` | **Padrão** — fonte da verdade | 🇧🇷 |
| Inglês | `en` | Completo (924 chaves) | 🇺🇸 |
| Espanhol | `es` | Completo (924 chaves) | 🇪🇸 |

O usuário troca o idioma clicando no seletor de idioma (ícone de globo) no canto superior direito do header. A escolha é salva automaticamente e persiste entre sessões.

## Por que foi implementado

- Clientes internacionais que operam em comércio exterior
- Equipes multilíngues dentro de um mesmo tenant
- Preparação para expansão LATAM e global

## O que foi internacionalizado

Toda a interface pública da plataforma:

| Área | Exemplos |
|------|----------|
| **Navegação** | Menu lateral, header, breadcrumbs, tooltips |
| **Componentes base** | Tabelas, modais, botões, campos, calendário, select |
| **Login** | Tela de acesso, registro, recuperação de senha |
| **Perfil do usuário** | Menu dropdown, opções de tema, links |
| **Painel Admin** | Visão geral, segurança, histórico, deploy, monitor, produtos, usuários, financeiro |
| **Workspace** | Organização, workspaces, usuários, assinaturas, financeiro, conectores |
| **SimulaCusto** | Dashboard, estimativas, formulários, relatórios |
| **BID Frete** | Dashboard, cotações, nova cotação |
| **BID Câmbio** | Dashboard, KPIs, funil |
| **Pedidos** | Lista, formulário, ações |
| **Processos** | Layout, dados técnicos, menu |
| **Marketplace** | Landing page completa |
| **Dashboard Tenant** | KPIs, funil, health score |

### Exceção: API Cockpit do Admin

O API Cockpit (`/admin/apis`) é uma ferramenta exclusiva para administradores internos da Gravity. Por decisão de negócio, seus 26 textos existem **apenas em português** e não são traduzidos para outros idiomas.

## Números

| Métrica | Valor |
|---------|-------|
| Chaves de tradução totais | 950 |
| Chaves traduzidas (EN/ES) | 924 |
| Chaves exclusivas PT (admin.cockpit) | 26 |
| Namespaces de tradução | 45+ |
| Componentes atualizados | 50+ |
| Arquivos modificados | 64 |
| Testes unitários | 33 |
| Cenários E2E | 7 |
