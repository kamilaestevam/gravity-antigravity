# Dicionário de Dados e Tabelas (Gravity Platform)

Este documento consolida o mapa arquitetural completo de todas as tabelas que suportam o motor da Gravity, divididas pelo banco central do "Configurador" (Master) e o banco de "Tenant" (Isolado de Workspace).

A coluna **Prefixo do ID (Status/Sugestão)** reflete o novo padrão CUID/Descritivo estruturado da plataforma.

## 🏛️ Banco 1: Configurador Central (Isolamento Nível 0)
Armazena a estrutura hierárquica base das Organizações (Tenants), Faturamento, Permissões e Perfis Master. 

| Nome da Tabela | Domínio | Descrição | Prefixo do ID |
| :--- | :--- | :--- | :--- |
| `Tenant` | Organização | A instância máxima de uma empresa que assina o produto | `ten_` |
| `Company` | Workspace | As filiais/unidades de negócio dessa empresa (Hierarquia Nível 2) | `comp_` |
| `User` | Autenticação | Conta unificada ligada ao Clerk (Identidade global do usuário) | `usr_` |
| `Subscription` | Faturamento | O plano pago e o link direto do Stripe | `sub_` |
| `ProductConfig` | Contrato | Liberação do módulo de produto para uso na Organização | `pcfg_` |
| `CompanyProduct` | Ativação | ***NOVO:*** O vínculo entre o produto e a Filial (Desbloqueio Nível 2) | `cprod_` |
| `UserMembership` | Acesso Core | Acesso e Papel base (Master/Standard) do usuário numa Filial | `mbr_` |
| `UserPermission` | Segurança | A regra final e granular (Nível 3) que valida acesso visual a um plugin | `perm_` |
| `GravityAdmin` | Suporte | Permissões internas cruzadas dos arquitetos da Gravity | `adm_` |
| `ServiceToken` | DevOps | Credenciais exclusivas para trocas máquina-máquina | `tok_` |

---

## 🏢 Banco 2: Banco de Serviços e Plugins (Isolamento Tenant)
Esse banco abriga os *Plugins transversais* que você consome nos Dossiês/Processos, blindados por RLS e filtrados pelo Frontend.

### Processos Base (Core)
*Nota: A modelagem final da tabela do Dossiê/Workspace aguarda sua validação técnica para ser construída.*
| Nome da Tabela | Domínio | Descrição | Prefixo do ID |
| :--- | :--- | :--- | :--- |
| `ProcessoWorkspace` | Processo Core | **O Cavalo de Tróia.** A pasta central raiz onde tudo converge. | `core_id_###/YY` |

### Plugin: Atividades do usuario (Gestor de Tarefas Pessoal)
| Nome da Tabela | Domínio | Descrição | Prefixo do ID |
| :--- | :--- | :--- | :--- |
| `Atividade` | Tarefas | Lista de to-do, reuniões, com amarra transacional ao `core_id` | `tsk_` |
| `Empresa` / `Contato` | Pessoas | Agenda unificada de contatos do Workspace | `cnt_` |
| `KanbanCard` | Gestão | O ticket desenhado em coluna para o método ágil | `crd_` |

### Plugin: E-mail (Resend Engine)
| Nome da Tabela | Domínio | Descrição | Prefixo do ID |
| :--- | :--- | :--- | :--- |
| `EmailThread` | Conversa | A raiz agrupadora de mensagens (O "Assunto") | `ass_email_` |
| `EmailMessage` | Mensagem | Escrita individual transacionada entre origens | `msg_email_` |
| `EmailEnviado` | Auditoria | Fila estrita e re-tentativas baseada no payload da SEFAZ/API | `tentativa_email_` |
| `Template` | Builder | O layout visual gravado para o disparo de massa do Tenant | `tpl_email_` |

### Plugin: Cronômetro (Apontamento de Horas)
| Nome da Tabela | Domínio | Descrição | Prefixo do ID |
| :--- | :--- | :--- | :--- |
| `TimerSession` | Registros | O carimbo fechado do tempo consolidado na tarefa | `timer_sessao_` |
| `TimerActive` | Estado Vivo | O segundo a segundo vivo gravado e atrelado a 1 usuário | `timer_ativo_` |

### Plugin: WhatsApp Engine
| Nome da Tabela | Domínio | Descrição | Prefixo do ID |
| :--- | :--- | :--- | :--- |
| `WhatsAppConversation`| Chat | O chat da GabiIA com o cliente (atrelado a um NCM) | `chat_whatsapp_` |
| `WhatsAppMessage` | Interação | O ping/pong de cada frase processada da conversa | `msg_whatsapp_` |

### Modulares Analíticos (BIs / Auditoria)
| Nome da Tabela | Domínio | Descrição | Prefixo do ID |
| :--- | :--- | :--- | :--- |
| `ConfigDashboard` | Visual | A ordenação de métricas que o Master escolheu | `conf_dashboard_` |
| `MetricaSnapshot` | Data Lake | A fotografia temporal calculada de importação (Ouro para DRE) | `estado_core_` |
| `Relatorio` | Custom | Salva a configuração das queries dos usuários criadores | `query_relatorio_` |
| `HistoryLog` | Auditoria | O rastro perene imutável (Inclusões, Exclusões) da plataforma | `log_historico_` |
