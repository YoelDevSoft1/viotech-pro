# 🔧 Solución: Error npm Corrupto en nvm

## 📋 Problema

El error indica que npm está corrupto en tu instalación de nvm:

```
Error: Cannot find module '../internal/lrucache'
```

Esto significa que la instalación de Node.js v20.19.0 en nvm está dañada.

## ✅ Solución Rápida

### Opción 1: Reinstalar Node.js en nvm (Recomendado)

Ejecuta estos comandos en PowerShell:

```powershell
# 1. Desinstalar la versión corrupta
nvm uninstall v20.19.0

# 2. Reinstalar Node.js
nvm install v20.19.0

# 3. Activar la versión
nvm use v20.19.0

# 4. Verificar
node --version
npm --version
```

### Opción 2: Script Automatizado

Ejecuta el script `.cursor/fix-nvm-npm-corruption.ps1` como Administrador:

```powershell
.\cursor\fix-nvm-npm-corruption.ps1
```

## 🔍 Verificación

Después de reinstalar, verifica que todo funciona:

```powershell
node --version    # Debe mostrar: v20.19.0
npm --version     # Debe mostrar una versión de npm (ej: 10.x.x)
npx --version     # Debe funcionar sin errores
```

## ⚠️ Si el Problema Persiste

Si después de reinstalar sigues teniendo problemas:

1. **Reinstalar nvm completamente**:
   - Desinstala nvm-windows
   - Reinstala desde: https://github.com/coreybutler/nvm-windows
   - Instala Node.js v20.19.0 nuevamente

2. **Usar Node.js sin nvm**:
   - Descarga Node.js directamente desde nodejs.org
   - Instala la versión LTS
   - Asegúrate de que esté en el PATH

## 📝 Nota sobre Secure Terminal

El servidor `secure-terminal` con `tumf-mcp-shell-server` **no existe** en npm (error 404). 

**Opciones**:
- **Opción A**: Comentar/remover `secure-terminal` de `mcp.json` (no funcionará)
- **Opción B**: Buscar una alternativa real de servidor MCP de terminal
- **Opción C**: Usar comandos directamente en Cursor sin servidor MCP de terminal

---

**Última actualización**: Noviembre 2024

