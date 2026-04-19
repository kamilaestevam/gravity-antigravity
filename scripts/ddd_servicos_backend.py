"""
ETAPA 2 BACKEND — Serviços Tenant
Renomeia model TypeScript names nos fragment.prisma e acessores nos arquivos TS.
"""

import re
import os

BASE = 'C:/Users/danie/gravity-antigravity/servicos-global/tenant'
modified_files = []

def apply_renames(filepath, renames):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f'NOT FOUND: {filepath}')
        return
    original = content
    for old, new in renames:
        content = re.sub(r'\b' + re.escape(old) + r'\b', new, content)
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        modified_files.append(filepath)
        print(f'MODIFIED: {os.path.basename(filepath)}')
    else:
        print(f'  (unchanged) {os.path.basename(filepath)}')

def apply_to_dir(dirpath, renames, extensions=('.ts',)):
    for root, dirs, files in os.walk(dirpath):
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'generated', '.prisma']]
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                apply_renames(os.path.join(root, file), renames)

# ─── ATIVIDADES ───────────────────────────────────────────────────────────────
print('\n=== ATIVIDADES — fragment.prisma ===')
apply_renames(f'{BASE}/atividades/prisma/fragment.prisma', [
    ('AtividadeParticipante', 'AtividadesParticipantes'),
    ('AtividadeSessaoTimer',  'AtividadesTempo'),
    ('Atividade',             'AtividadesDados'),
])

print('\n=== ATIVIDADES — server TS ===')
apply_to_dir(f'{BASE}/atividades/server', [
    ('db.atividadeParticipante', 'db.atividadesParticipantes'),
    ('db.atividadeSessaoTimer',  'db.atividadesTempo'),
    ('db.atividade',             'db.atividadesDados'),
    ('tx.atividadeParticipante', 'tx.atividadesParticipantes'),
    ('tx.atividadeSessaoTimer',  'tx.atividadesTempo'),
    ('tx.atividade',             'tx.atividadesDados'),
    ('AtividadeParticipante',    'AtividadesParticipantes'),
    ('AtividadeSessaoTimer',     'AtividadesTempo'),
    ('Atividade',                'AtividadesDados'),
])

# ─── CRONÔMETRO ───────────────────────────────────────────────────────────────
print('\n=== CRONÔMETRO — fragment.prisma ===')
apply_renames(f'{BASE}/cronometro/prisma/fragment.prisma', [
    ('TimerSession',        'AtividadesCronometro'),
    ('TimerActive',         'AtividadesTimer'),
    ('RelatorioTempoCache', 'TempoCriacaoRelatorio'),
])

print('\n=== CRONÔMETRO — server TS ===')
apply_to_dir(f'{BASE}/cronometro/server', [
    ('db.timerSession',        'db.atividadesCronometro'),
    ('db.timerActive',         'db.atividadesTimer'),
    ('db.relatorioTempoCache', 'db.tempoCriacaoRelatorio'),
    ('tx.timerSession',        'tx.atividadesCronometro'),
    ('tx.timerActive',         'tx.atividadesTimer'),
    ('tx.relatorioTempoCache', 'tx.tempoCriacaoRelatorio'),
    ('prisma.timerSession',        'prisma.atividadesCronometro'),
    ('prisma.timerActive',         'prisma.atividadesTimer'),
    ('prisma.relatorioTempoCache', 'prisma.tempoCriacaoRelatorio'),
    ('TimerSession',        'AtividadesCronometro'),
    ('TimerActive',         'AtividadesTimer'),
    ('RelatorioTempoCache', 'TempoCriacaoRelatorio'),
])

# ─── EMAIL ────────────────────────────────────────────────────────────────────
print('\n=== EMAIL — fragment.prisma ===')
apply_renames(f'{BASE}/email/prisma/fragment.prisma', [
    ('EmailThread',  'EmailAssuntosParticipantes'),
    ('EmailMessage', 'EmailMensagem'),
    ('EmailEnviado', 'EmailRegistroEnvio'),
    ('FilaEmail',    'EmailFilaEnvio'),
    ('Template',     'TemplateEmail'),
])

print('\n=== EMAIL — server TS ===')
apply_to_dir(f'{BASE}/email/server', [
    ('prisma.emailThread',  'prisma.emailAssuntosParticipantes'),
    ('prisma.emailMessage', 'prisma.emailMensagem'),
    ('prisma.emailEnviado', 'prisma.emailRegistroEnvio'),
    ('prisma.filaEmail',    'prisma.emailFilaEnvio'),
    ('prisma.template',     'prisma.templateEmail'),
    ('EmailThread',  'EmailAssuntosParticipantes'),
    ('EmailMessage', 'EmailMensagem'),
    ('EmailEnviado', 'EmailRegistroEnvio'),
    ('FilaEmail',    'EmailFilaEnvio'),
])

# ─── WHATSAPP ─────────────────────────────────────────────────────────────────
print('\n=== WHATSAPP — fragment.prisma ===')
apply_renames(f'{BASE}/whatsapp/prisma/fragment.prisma', [
    ('WhatsAppConversation', 'WhatsappConversa'),
    ('WhatsAppMessage',      'WhatsappMensagem'),
    ('WhatsAppUsageLog',     'WhatsappLog'),
    ('WhatsAppAutomation',   'WhatsappRegra'),
])

print('\n=== WHATSAPP — server TS ===')
apply_to_dir(f'{BASE}/whatsapp/server', [
    ('prisma.whatsAppConversation', 'prisma.whatsappConversa'),
    ('prisma.whatsAppMessage',      'prisma.whatsappMensagem'),
    ('prisma.whatsAppUsageLog',     'prisma.whatsappLog'),
    ('prisma.whatsAppAutomation',   'prisma.whatsappRegra'),
    ('WhatsAppConversation', 'WhatsappConversa'),
    ('WhatsAppMessage',      'WhatsappMensagem'),
    ('WhatsAppUsageLog',     'WhatsappLog'),
    ('WhatsAppAutomation',   'WhatsappRegra'),
])

# ─── DASHBOARD ────────────────────────────────────────────────────────────────
print('\n=== DASHBOARD — fragment.prisma ===')
apply_renames(f'{BASE}/dashboard/prisma/fragment.prisma', [
    ('DashboardMetricSnapshot', 'DashboardMetricas'),
    ('DashboardWidget',         'DashboardCriar'),
    ('DashboardAlert',          'DashboardAlertas'),
    ('DashboardShare',          'DashboardCompartilhar'),
    ('DashboardConfig',         'DashboardConfiguracao'),
])

print('\n=== DASHBOARD — server TS ===')
apply_to_dir(f'{BASE}/dashboard/server', [
    ('prisma.dashboardMetricSnapshot', 'prisma.dashboardMetricas'),
    ('prisma.dashboardWidget',         'prisma.dashboardCriar'),
    ('prisma.dashboardAlert',          'prisma.dashboardAlertas'),
    ('prisma.dashboardShare',          'prisma.dashboardCompartilhar'),
    ('prisma.dashboardConfig',         'prisma.dashboardConfiguracao'),
    ('DashboardMetricSnapshot', 'DashboardMetricas'),
    ('DashboardWidget',         'DashboardCriar'),
    ('DashboardAlert',          'DashboardAlertas'),
    ('DashboardShare',          'DashboardCompartilhar'),
    ('DashboardConfig',         'DashboardConfiguracao'),
])

# ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
print('\n=== RELATÓRIOS — fragment.prisma ===')
apply_renames(f'{BASE}/relatorios/prisma/fragment.prisma', [
    ('ConfigRelatorio', 'RelatoriosConfiguracao'),
    ('ExportJob',       'ExportarJob'),
    ('Relatorio',       'RelatoriosSalvos'),
])

print('\n=== RELATÓRIOS — server TS ===')
apply_to_dir(f'{BASE}/relatorios/server', [
    ('prisma.configRelatorio', 'prisma.relatoriosConfiguracao'),
    ('prisma.exportJob',       'prisma.exportarJob'),
    ('prisma.relatorio',       'prisma.relatoriosSalvos'),
    ('ConfigRelatorio', 'RelatoriosConfiguracao'),
    ('ExportJob',       'ExportarJob'),
    ('Relatorio',       'RelatoriosSalvos'),
])

# ─── HISTÓRICO ────────────────────────────────────────────────────────────────
print('\n=== HISTÓRICO — fragment.prisma ===')
apply_renames(f'{BASE}/historico-global/prisma/fragment.prisma', [
    ('HistoryLog',   'HistoricoLog'),
    ('ExportResult', 'ExportarResultado'),
])

print('\n=== HISTÓRICO — server TS ===')
# Targeted: rename prisma/Prisma type refs but NOT raw SQL strings or DB values
apply_to_dir(f'{BASE}/historico-global/server', [
    # Accessor renames
    ('getPrisma().historyLog',           'getPrisma().historicoLog'),
    ('prisma.historyLog',                'prisma.historicoLog'),
    ('prismaAny.exportResult',           'prismaAny.exportarResultado'),
    # Prisma-generated type name renames
    ('Prisma.HistoryLogWhereInput',      'Prisma.HistoricoLogWhereInput'),
    # Inline generic references — these are TS Prisma types
    # Using raw pattern match for <'HistoryLog'> because re.escape handles quotes
])

# ─── NOTIFICAÇÕES ─────────────────────────────────────────────────────────────
print('\n=== NOTIFICAÇÕES — fragment.prisma ===')
# Only rename Notification model; ExternalContact and TenantChannelConfig are merge-deferred
apply_renames(f'{BASE}/notificacoes/prisma/fragment.prisma', [
    ('Notification', 'NotificacoesTituloCorpo'),
])

print('\n=== NOTIFICAÇÕES — server TS ===')
apply_to_dir(f'{BASE}/notificacoes/server', [
    ('prisma.notification', 'prisma.notificacoesTituloCorpo'),
    # NOT renaming Notification type (conflicts with browser API globals)
    # NOT renaming ExternalContact/TenantChannelConfig (merge-deferred)
])

# ─── GABI ─────────────────────────────────────────────────────────────────────
print('\n=== GABI — fragment.prisma ===')
apply_renames(f'{BASE}/gabi/prisma/fragment.prisma', [
    ('GabiConversation', 'ConversaCompletaGabi'),
    ('GabiMessage',      'MensagemIndividualGabiai'),
    ('GabiUsageLog',     'GabiaLogUso'),
    ('GabiTokenLog',     'GabiaTokenConsumidos'),
    ('GabiTokenQuota',   'GabiaTokenWorkspace'),
])

print('\n=== GABI — server TS ===')
apply_to_dir(f'{BASE}/gabi/server', [
    ('prisma.gabiConversation',      'prisma.conversaCompletaGabi'),
    ('prisma.gabiMessage',           'prisma.mensagemIndividualGabiai'),
    ('prisma.gabiUsageLog',          'prisma.gabiaLogUso'),
    ('prisma.gabiTokenLog',          'prisma.gabiaTokenConsumidos'),
    ('prisma.gabiTokenQuota',        'prisma.gabiaTokenWorkspace'),
    ('prismaClient.gabiTokenQuota',  'prismaClient.gabiaTokenWorkspace'),
    ('db.gabiConversation',          'db.conversaCompletaGabi'),
    ('db.gabiMessage',               'db.mensagemIndividualGabiai'),
    ('db.gabiUsageLog',              'db.gabiaLogUso'),
    ('db.gabiTokenLog',              'db.gabiaTokenConsumidos'),
    ('db.gabiTokenQuota',            'db.gabiaTokenWorkspace'),
    ('GabiConversation', 'ConversaCompletaGabi'),
    ('GabiMessage',      'MensagemIndividualGabiai'),
    ('GabiUsageLog',     'GabiaLogUso'),
    ('GabiTokenLog',     'GabiaTokenConsumidos'),
    ('GabiTokenQuota',   'GabiaTokenWorkspace'),
])

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
print(f'\n=== TOTAL MODIFIED: {len(modified_files)} files ===')
for f in modified_files:
    print(f'  {f}')
