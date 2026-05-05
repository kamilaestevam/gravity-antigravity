from openpyxl import load_workbook
wb = load_workbook(".claude/planilha-tmp.xlsx")
stats = {"added":0,"removed":0,"updated":0,"sheets":set()}
AN = "servicos-global/configurador/server/routes/assinatura-produto-gravity.ts"
AA = "servicos-global/configurador/server/routes/admin-organizacao-produto-gravity.ts"
PM = "/api/v1/organizacoes/me/assinaturas"
print("start")