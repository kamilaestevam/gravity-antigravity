# Diagrama e Configurações de Autenticação (Clerk)

Este documento centraliza as regras, auditorias de segurança e decisões arquiteturais de autenticação adotadas no **Gravity** utilizando o provedor *Clerk*.

O Clerk atua como o motor de resolução de identidade e segurança de senhas do sistema. Ele trabalha em conjunto com o nosso banco de dados (Prisma/PostgreSQL), servindo como o guardião da entrada. 

Abaixo estão as parametrizações vitais configuradas no ambiente do Clerk para suportar o modelo Multi-Tenant e as políticas de segurança B2B.

---

## 1. Gestão de Contas (Personal Accounts vs Organizations)
**Caminho no Clerk:** *Configure > Organizations > Settings*

O *Gravity* adota um modelo híbrido onde o isolamento de Tenants pode ser estrito no banco, mas fluido na criação.
- **Membership Optional (Ativado):** O sistema foi parametrizado para permitir "Personal Accounts" (contas individuais) fora do escopo de Organizações engessadas do Clerk. 
- **Objetivo:** Impedir que o Clerk force a renderização compulsória do componente `<CreateOrganization />` durante o fluxo de "Sign Up", mantendo a UX fluida. Nossa plataforma roteia e assimila o usuário (Tenant) dinamicamente pós-login.

---

## 2. Autenticação e Verificação
**Caminho no Clerk:** *Configure > User & Authentication > Email, Phone, Username*

- **Sign-up with Email (Ativo):** Permite o cadastro aberto. *(Atenção para auditorias futuras: Caso a governança do processo B2B exija um ecossistema fechado (Invite-Only), esta flag deverá ser desativada)*.
- **Verify at sign-up (Ativo):** Exige validação mandatória com **código de e-mail (OTP)**.
- **Objetivo:** Impedir a criação fantasma de massas de dados contendo e-mails forjados (`teste@teste.com`), garantindo rastreabilidade e comunicações transacionais saudáveis.

---

## 3. Gestão de Sessões (Segurança e UX)
**Caminho no Clerk:** *Configure > Sessions*

A persistência do token JWT baseia-se num equilíbrio entre segurança (proteção de dados de Comex e Custos) e UX (evitando aborrecimentos diários). Entendeu-se o uso de dois cronômetros simultâneos:

1. **Maximum lifetime (Duração Máxima - Ex: 1 ano ou 7 dias):** O "teto" invisível da sessão. Independentemente se o usuário acessou todo dia, a sessão expira compulsoriamente na data limite de Maximum Lifetime desde que o botão "Entrar" foi clicado.
2. **Inactivity timeout (Timeout de Inatividade - Ex: 1 dia ou 60 minutos):** O "cronômetro de inatividade". Protege contra uso não autorizado em terminais abandonados, exigindo zero movimento interativo no painel antes de revogar o token de acesso.

*Configuração Adotada Inicial:* Permissiva à adaptação, priorizando tempo de Inatividade suficiente para uma jornada normal de escritório sem deslogar repentinamente, mas com *timeout* obrigatório de ociosidade contínua (ex: 24h sem ação).

---

## 4. Webhooks e Sincronização Server-Side (Vital)
**Caminho no Clerk:** *Configure > Webhooks*

O Clerk é isolado da infraestrutura do PostgreSQL. O sincronismo do ciclo de vida dos usuários dá-se estritamente por Webhooks.

- **Endpoint URL:** Aponta sempre de modo absoluto (HTTPS) para a infraestrutura real. 
  * *Para testes locais:* Utilizar *Ngrok* ou ferramenta equivalente para transpor o localhost.
  * *Para Produção:* Endereçamento da nossa aplicação (`https://api.seu-dominio.../api/v1/webhooks`).
- **Eventos Monitorados Obrigatórios:**
  - `user.created`: Intercepta o sinal do Clerk, gerando a Persona/Profile correspondente (e possível Tenant dinâmico) no banco de dados.
  - `user.updated`: Mantém o metadado relacional em conformidade.
  - `user.deleted`: **Obrigatório para mitigação/LGPD**. Garante expurgo limpo em cascata ou desativação paralela no BD em caso do usuário solicitar ou sofrer exclusão pelo painel de identidade.

---

## 5. Modo "Development" vs "Production"
A plataforma foi inicialmente testada em estado *Development* (tarja laranja).

O processo de Go-Live (`Deploy to production`) requer atenção ao seguinte Checklist de Governança:
1. Alteração explícita de ambiente (chaves de API novas).
2. Parametrização dos registros DNS do tipo **CNAME** via provedor do domínio customizado (ex: `auth.gravity.com.br`) para viabilizar os scripts de sessão de primeira parte sem bloqueios do navegador.
3. Cadastramento compulsório das credenciais próprias de **Client ID e Secret no Google Cloud** (OAuth), visto que chaves de demonstração expiram na transição.
