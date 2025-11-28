# Configuración MCP para Cursor

## 🚀 Inicio Rápido

1. **Copia el archivo de plantilla:**
   ```powershell
   Copy-Item .cursor\mcp.json.template .cursor\mcp.json
   ```

2. **Edita `mcp.json` y reemplaza los placeholders:**
   - `ghp_YOUR_TOKEN_HERE` → Tu GitHub Personal Access Token
   - `BSA_YOUR_API_KEY_HERE` → Tu Brave Search API Key
   - `YOUR_PASSWORD` → Tu contraseña de PostgreSQL (si aplica)

3. **Lee la guía completa:** [MCP_SETUP_GUIDE.md](./MCP_SETUP_GUIDE.md)

## 📝 Notas Importantes

- ⚠️ **NUNCA** subas `mcp.json` con tokens reales a Git
- ✅ Usa variables de entorno cuando sea posible
- ✅ Revisa `.cursor/.gitignore` para proteger tus credenciales





