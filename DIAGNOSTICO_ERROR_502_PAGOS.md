# 🔍 Diagnóstico: Error 502 al Crear Transacción de Pago

**Fecha:** Diciembre 2024  
**Error:** `502 Bad Gateway` al llamar a `/api/payments/create-transaction`  
**Error secundario:** `Error al comunicarse con la pasarela de pago: Not Found`

---

## 📋 **Resumen del Error**

El frontend está intentando crear una transacción de pago para el plan `LP_PROFESIONAL_002`, pero el backend está devolviendo un error 502. El error específico indica que el backend no puede comunicarse con la API de Wompi (recibe un "Not Found").

---

## 🔍 **Causas Probables**

### **0. Token de Aceptación Obligatorio Faltante** ⚠️⚠️ **MUY PROBABLE - CAMBIO RECIENTE EN WOMPI**

**Síntoma:** Error "Not Found" al crear transacciones o fuentes de pago.

**Contexto Crítico:**
Según la [documentación oficial de Wompi](https://docs.wompi.co/docs/colombia/fuentes-de-pago/), hay un **cambio importante en el API**:
> "Para la creación de **transacciones** y **fuentes de pago**, pensando en la privacidad y el correcto manejo de los datos personales de nuestros usuarios, es ahora **obligatorio el uso de los Tokens de Aceptación** a la hora de crear cualquiera de estos dos recursos a través de nuestro API."

**Problema Potencial:**
Si el backend está intentando crear una transacción **sin obtener primero un Token de Aceptación**, Wompi devolverá un error 404/Not Found.

**Verificar en el Backend:**
1. ¿El código del backend obtiene un **acceptance_token** antes de crear transacciones?
2. ¿Se está usando el endpoint `/v1/merchants/{public_key}` para obtener el acceptance_token?
3. ¿El acceptance_token se está incluyendo en las peticiones de creación de transacciones?

**Solución:**
1. Revisa el código del backend en `VioTech-main/backend` que maneja `/api/payments/create-transaction`
2. Verifica que el backend:
   - Primero obtenga un acceptance_token usando `GET /v1/merchants/{public_key}`
   - Use ese acceptance_token al crear transacciones
3. Si falta, implementa la obtención del acceptance_token según la [documentación de Wompi](https://docs.wompi.co/docs/colombia/tokens-de-aceptacion/)

**Referencias:**
- [Tokens de Aceptación - Documentación Wompi](https://docs.wompi.co/docs/colombia/tokens-de-aceptacion/)
- [Fuentes de Pago - Documentación Wompi](https://docs.wompi.co/docs/colombia/fuentes-de-pago/)

---

### **1. Variables de Entorno de Wompi No Configuradas o Incorrectas en Render** ⚠️ **MÁS PROBABLE**

**Síntoma:** Error 502 cuando el backend intenta hacer una petición a Wompi.

**Verificar:**
- [ ] `WOMPI_API_URL` está configurada en Render (debe ser `https://production.wompi.co/v1`)
- [ ] `WOMPI_PUBLIC_KEY` está configurada en Render (necesaria para obtener acceptance_token)
- [ ] `WOMPI_PRIVATE_KEY` está configurada en Render
- [ ] `WOMPI_INTEGRITY_SECRET` está configurada en Render
- [ ] Todas las variables tienen valores válidos (no están vacías)

**Solución:**
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona el servicio `viotech-main`
3. Ve a **Environment** → **Environment Variables**
4. Verifica que estas variables existan:
   ```
   WOMPI_API_URL=https://production.wompi.co/v1
   WOMPI_PUBLIC_KEY=pub_prod_...
   WOMPI_PRIVATE_KEY=prv_prod_...
   WOMPI_INTEGRITY_SECRET=prod_integrity_...
   ```
5. Si faltan, agrégalas siguiendo la guía en `GUIA_CONFIGURAR_WOMPI_RENDER.md`
6. **Reinicia el servicio** después de agregar/modificar variables

---

### **2. URL de API de Wompi Incorrecta**

**Síntoma:** El error "Not Found" sugiere que el backend está intentando acceder a un endpoint de Wompi que no existe.

**Verificar:**
- La variable `WOMPI_API_URL` debe ser exactamente: `https://production.wompi.co/v1`
- NO debe tener una barra al final: ❌ `https://production.wompi.co/v1/`
- NO debe tener rutas adicionales: ❌ `https://production.wompi.co/v1/transactions`

**Solución:**
1. En Render, verifica que `WOMPI_API_URL` sea exactamente `https://production.wompi.co/v1`
2. Si está mal, corrígela y reinicia el servicio

---

### **3. Endpoint de Backend No Existe o No Está Funcionando**

**Síntoma:** El error 502 puede indicar que el endpoint `/api/payments/create-transaction` no existe o está causando un error interno.

**Verificar:**
1. El endpoint existe en el código del backend
2. El servidor backend está funcionando en Render
3. Los logs de Render muestran errores al procesar la petición

**Solución:**
1. Revisa los logs de Render del servicio `viotech-main`
2. Busca errores relacionados con:
   - `create-transaction`
   - `payments`
   - `Wompi`
   - Variables de entorno faltantes

---

### **4. Servidor Backend Caído o No Respondiendo**

**Síntoma:** Error 502 indica que el servidor no está respondiendo correctamente.

**Verificar:**
1. En Render, verifica que el servicio `viotech-main` esté **Running**
2. Revisa los logs recientes para ver si hay errores de inicio
3. Verifica que el servicio no esté en estado "Stopped" o "Error"

**Solución:**
1. Si el servicio está caído, intenta reiniciarlo manualmente
2. Revisa los logs para identificar el error de inicio
3. Verifica que todas las dependencias estén instaladas correctamente

---

### **5. Plan No Existe o ID Incorrecto**

**Síntoma:** El error "Not Found" podría indicar que el plan `LP_PROFESIONAL_002` no existe en la base de datos.

**Verificar:**
1. El plan `LP_PROFESIONAL_002` existe en la base de datos
2. El ID del plan está correctamente formateado

**Solución:**
1. Revisa la base de datos para confirmar que el plan existe
2. Verifica que el ID del plan sea correcto

---

## 🔧 **Pasos de Diagnóstico Recomendados**

### **Paso 1: Verificar Variables de Entorno en Render**

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona el servicio `viotech-main`
3. Ve a **Environment** → **Environment Variables**
4. Verifica que existan estas variables:
   - `WOMPI_API_URL`
   - `WOMPI_PUBLIC_KEY`
   - `WOMPI_PRIVATE_KEY`
   - `WOMPI_INTEGRITY_SECRET`
   - `WOMPI_REDIRECT_URL`

### **Paso 2: Revisar Logs de Render**

1. En Render, ve a **Logs** del servicio `viotech-main`
2. Busca errores relacionados con:
   - "Variables de entorno de Wompi faltantes"
   - "Error de configuración del servidor para pagos"
   - "No se pudo obtener acceptance_token de Wompi"
   - Errores de conexión a Wompi
   - Errores 404 o "Not Found" relacionados con Wompi

### **Paso 3: Probar el Endpoint Directamente**

Prueba el endpoint directamente usando curl o Postman:

```bash
curl -X POST https://viotech-main.onrender.com/api/payments/create-transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"planId": "LP_PROFESIONAL_002"}'
```

Esto te ayudará a ver el error exacto que está devolviendo el backend.

### **Paso 4: Verificar Estado del Servicio**

1. En Render, verifica que el servicio esté **Running**
2. Si está en otro estado, intenta reiniciarlo
3. Verifica que no haya errores de build o despliegue

---

## ✅ **Solución Más Probable**

Basándome en el error "Not Found" al comunicarse con Wompi y la documentación actualizada de Wompi, las causas más probables son (en orden de prioridad):

### **Causa #1: Falta Token de Aceptación (MUY PROBABLE)** 🔴

**El backend no está obteniendo/usando el Token de Aceptación obligatorio antes de crear transacciones.**

Según la [documentación oficial de Wompi](https://docs.wompi.co/docs/colombia/fuentes-de-pago/), los Tokens de Aceptación son ahora **obligatorios** para crear transacciones.

**Pasos Inmediatos:**

1. **Revisa el código del backend:**
   - Busca en `VioTech-main/backend` el archivo que maneja `/api/payments/create-transaction`
   - Verifica si el código obtiene un acceptance_token antes de crear la transacción

2. **Implementa la obtención del acceptance_token si falta:**
   ```javascript
   // El backend debe primero obtener el acceptance_token:
   GET /v1/merchants/{public_key}
   // Usando la WOMPI_PUBLIC_KEY
   ```

3. **Usa el acceptance_token al crear transacciones:**
   - Incluye el acceptance_token en las peticiones a Wompi

### **Causa #2: Variables de Entorno Faltantes** 🟡

**Las variables de entorno de Wompi no están configuradas correctamente en Render.**

**Pasos Inmediatos:**

1. **Verifica las variables de entorno en Render:**
   - Ve a Render Dashboard → `viotech-main` → Environment
   - Confirma que todas las variables de Wompi estén configuradas:
     - `WOMPI_API_URL` = `https://production.wompi.co/v1`
     - `WOMPI_PUBLIC_KEY` (necesaria para acceptance_token)
     - `WOMPI_PRIVATE_KEY`
     - `WOMPI_INTEGRITY_SECRET`
     - `WOMPI_REDIRECT_URL`

2. **Verifica el `WOMPI_API_URL`:**
   - Debe ser exactamente: `https://production.wompi.co/v1`
   - No debe tener barras al final ni rutas adicionales

3. **Reinicia el servicio:**
   - Después de verificar/corregir las variables, reinicia el servicio en Render

4. **Revisa los logs:**
   - Después de reiniciar, revisa los logs para ver si hay errores relacionados con Wompi
   - Busca específicamente errores sobre "acceptance_token" o "merchants"

---

## 📚 **Referencias**

### **Documentación de Wompi (Actualizada)**

- [Tokens de Aceptación](https://docs.wompi.co/docs/colombia/tokens-de-aceptacion/) - ⚠️ **OBLIGATORIO desde 2024**
- [Fuentes de Pago & Tokenización](https://docs.wompi.co/docs/colombia/fuentes-de-pago/) - Cambio importante: Tokens de Aceptación obligatorios
- [Métodos de Pago](https://docs.wompi.co/docs/colombia/metodos-de-pago/)
- [Transacciones con 3D Secure v2](https://docs.wompi.co/docs/colombia/transacciones-con-3d-secure-v2/)
- [Errores Wompi](https://docs.wompi.co/docs/colombia/errores/)
- [Referencia del API (Swagger)](https://app.swaggerhub.com/apis-docs/waybox/wompi/1.2.0)

### **Documentación Interna**

- Ver `GUIA_CONFIGURAR_WOMPI_RENDER.md` para instrucciones detalladas sobre cómo configurar Wompi en Render
- [Render Environment Variables](https://render.com/docs/environment-variables)

### **Nota Importante sobre Tokens de Aceptación**

> ⚠️ **CAMBIO RECIENTE EN WOMPI API:**  
> A partir de 2024, Wompi requiere el uso de **Tokens de Aceptación** para crear transacciones y fuentes de pago. Este es un cambio obligatorio relacionado con privacidad y manejo de datos personales. Si tu código no está actualizado para usar acceptance_tokens, recibirás errores 404/Not Found al intentar crear transacciones.

---

## 🆘 **Si el Problema Persiste**

Si después de seguir estos pasos el problema persiste:

1. **Captura los logs completos** de Render cuando ocurre el error
2. **Prueba el endpoint directamente** con curl/Postman para ver el error exacto
3. **Verifica que las llaves de Wompi sean válidas** y correspondan al ambiente correcto (producción vs pruebas)
4. **Revisa el código del backend** en `VioTech-main/backend` para ver cómo se está haciendo la petición a Wompi

---

**¿Necesitas ayuda para configurar las variables de entorno en Render?** Revisa el archivo `GUIA_CONFIGURAR_WOMPI_RENDER.md` para instrucciones paso a paso.

