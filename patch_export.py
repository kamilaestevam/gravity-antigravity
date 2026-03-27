import os
import re

files_to_patch = [
  'workspace/Workspaces.tsx',
  'workspace/Usuarios.tsx',
  'workspace/Financeiro.tsx',
  'workspace/Assinaturas.tsx',
  'workspace/ApiCockpit.tsx',
  'admin/ProdutosAdmin.tsx',
  'admin/MonitorApisAdmin.tsx',
  'admin/LogTestes.tsx',
  'admin/HistoricoGlobalAdmin.tsx',
  'admin/DeployRailwayAdmin.tsx',
  'admin/AdminFinanceiro.tsx',
  'TenantDetail.tsx',
  'AdminPanel.tsx',
  'admin/UsuariosGlobaisAdmin.tsx',
]

base_path = r"c:\Users\danie\OneDrive\Documents\Antigravity\2. Gravity\servicos-global\configurador\src\pages"

for f in files_to_patch:
    full_path = os.path.join(base_path, f)
    if not os.path.exists(full_path):
        continue
        
    with open(full_path, "r", encoding="utf-8") as file:
        content = file.read()
        
    original_content = content
    
    # 1. Add import
    if 'TabelaGlobal' in content and 'getAcoesExportacaoPadrao' not in content:
        depth = '../../utils/exportHelper' if '/' in f else '../utils/exportHelper'
        import_stmt = f"\nimport {{ getAcoesExportacaoPadrao }} from '{depth}'\n"
        
        # Find last import
        match = list(re.finditer(r'^import .*$', content, re.MULTILINE))
        if match:
            last_import = match[-1]
            end_idx = last_import.end()
            content = content[:end_idx] + import_stmt + content[end_idx:]
            
    # 2. Patch TabelaGlobal tags
    def replacer(m):
        open_tag = m.group(1)
        attrs = m.group(2)
        col_var = m.group(3)
        close_tag = m.group(4)
        
        if 'getAcoesExportacaoPadrao(' in attrs:
            return m.group(0)
            
        export_val = f"getAcoesExportacaoPadrao({col_var}, 'dados_tabela', 'Exportação de Dados')"
        
        if re.search(r'acoesExportacao=\{[^\}]+\}', attrs):
            new_attrs = re.sub(r'acoesExportacao=\{[^\}]+\}', f'acoesExportacao={{{export_val}}}', attrs)
        else:
            new_attrs = attrs + f'\n        acoesExportacao={{{export_val}}}\n      '
            
        return open_tag + new_attrs + close_tag

    pattern = r'(<TabelaGlobal(?:<[^>]+>)?\s+)([\s\S]*?colunas=\{([a-zA-Z0-9_]+)\}[\s\S]*?)(\/>|>)'
    content = re.sub(pattern, replacer, content)
    
    if content != original_content:
        with open(full_path, "w", encoding="utf-8") as file:
            file.write(content)
        print(f"Patched {f}")
