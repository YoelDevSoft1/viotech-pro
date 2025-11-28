# 🔐 Solución: Implementar Tokens de Aceptación de Wompi

**Fecha:** Diciembre 2024  
**Problema:** Error "Not Found" al crear transacciones de pago  
**Causa:** Falta implementación de Tokens de Aceptación obligatorios según la nueva API de Wompi

---

## 🚨 **Problema Identificado**

Según la [documentación oficial de Wompi](https://docs.wompi.co/docs/colombia/fuentes-de-pago/), hay un **cambio importante en el API**:

> **"Para la creación de transacciones y fuentes de pago, pensando en la privacidad y el correcto manejo de los datos personales de nuestros usuarios, es ahora obligatorio el uso de los Tokens de Aceptación a la hora de crear cualquiera de estos dos recursos a través de nuestro API."**

**Si tu backend no está obteniendo/usando un Token de Aceptación antes de crear transacciones, Wompi devolverá un error 404/Not Found.**

---

## 📋 **Qué Necesitas Implementar**

Tu backend debe:

1. **Obtener un Token de Aceptación** antes de crear transacciones
2. **Usar ese Token de Aceptación** en todas las peticiones de creación de transacciones y fuentes de pago

---

## 🔧 **Implementación Paso a Paso**

### **Paso 1: Obtener el Token de Aceptación**

El backend debe hacer una petición a Wompi para obtener el acceptance_token usando la **llave pública**.

#### **Endpoint:**
```
GET /v1/merchants/{public_key}
```

#### **Ejemplo de Implementación (Node.js/Express):**

```javascript
// Obtener acceptance_token de Wompi
async function getAcceptanceToken() {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const apiUrl = process.env.WOMPI_API_URL || 'https://production.wompi.co/v1';
  
  try {
    const response = await fetch(`${apiUrl}/merchants/${publicKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener acceptance_token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // El acceptance_token está en data.data.presigned_acceptance.acceptance_token
    return data.data.presigned_acceptance.acceptance_token;
  } catch (error) {
    console.error('Error obteniendo acceptance_token:', error);
    throw new Error('Error al comunicarse con Wompi para obtener acceptance_token');
  }
}
```

#### **Respuesta de Wompi:**
```json
{
  "data": {
    "presigned_acceptance": {
      "acceptance_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "permalink": "https://wompi.co/v/...",
      "type": "END_USER_POLICY"
    }
  }
}
```

---

### **Paso 2: Usar el Acceptance Token al Crear Transacciones**

Cuando el backend cree una transacción en Wompi, debe incluir el `acceptance_token`.

#### **Endpoint de Transacción:**
```
POST /v1/transactions
```

#### **Ejemplo de Implementación (Node.js/Express):**

```javascript
// Crear transacción con acceptance_token
async function createWompiTransaction(plan, acceptanceToken) {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  const apiUrl = process.env.WOMPI_API_URL || 'https://production.wompi.co/v1';
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  
  // Calcular firma de integridad
  const reference = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const amountInCents = Math.round(plan.precio * 100); // Convertir a centavos
  
  // Crear string para firma
  const signatureString = `${reference}${amountInCents}${plan.currency}${integritySecret}`;
  const signature = require('crypto')
    .createHash('sha256')
    .update(signatureString)
    .digest('hex');
  
  const transactionData = {
    amount_in_cents: amountInCents,
    currency: plan.currency || 'COP',
    customer_email: plan.customer_email,
    payment_method: {
      type: 'CARD', // o 'NEQUI', 'BANCOLOMBIA_TRANSFER', etc.
      installments: 1, // Número de cuotas
    },
    reference: reference,
    acceptance_token: acceptanceToken, // ⚠️ REQUERIDO: Token de aceptación
    redirect_url: process.env.WOMPI_REDIRECT_URL || 'https://viotech.com.co/payment/success',
    signature: signature, // Firma de integridad
  };
  
  try {
    const response = await fetch(`${apiUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${privateKey}`, // Usar llave privada para crear transacciones
      },
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al crear transacción: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creando transacción en Wompi:', error);
    throw new Error(`Error al comunicarse con la pasarela de pago: ${error.message}`);
  }
}
```

---

### **Paso 3: Integrar en tu Endpoint de Backend**

Modifica tu endpoint `/api/payments/create-transaction` para:

1. Obtener el acceptance_token
2. Usarlo al crear la transacción

#### **Ejemplo Completo (Node.js/Express):**

```javascript
// routes/payments.js
const express = require('express');
const router = express.Router();

// Middleware de autenticación
const authenticateToken = require('../middleware/auth');

// Endpoint para crear transacción
router.post('/create-transaction', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    
    // 1. Obtener plan de la base de datos
    const plan = await Plan.findOne({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    
    // 2. Obtener acceptance_token de Wompi
    let acceptanceToken;
    try {
      acceptanceToken = await getAcceptanceToken();
    } catch (error) {
      console.error('Error obteniendo acceptance_token:', error);
      return res.status(500).json({ 
        error: 'Error al comunicarse con la pasarela de pago: No se pudo obtener token de aceptación' 
      });
    }
    
    // 3. Obtener email del usuario (necesario para la transacción)
    const user = await User.findByPk(userId);
    const transactionData = {
      ...plan.toJSON(),
      customer_email: user.email,
    };
    
    // 4. Crear transacción en Wompi con acceptance_token
    let wompiTransaction;
    try {
      wompiTransaction = await createWompiTransaction(transactionData, acceptanceToken);
    } catch (error) {
      console.error('Error creando transacción en Wompi:', error);
      return res.status(500).json({ 
        error: `Error al comunicarse con la pasarela de pago: ${error.message}` 
      });
    }
    
    // 5. Guardar transacción en base de datos (opcional)
    const transaction = await Transaction.create({
      user_id: userId,
      plan_id: planId,
      wompi_transaction_id: wompiTransaction.id,
      wompi_reference: wompiTransaction.reference,
      status: 'PENDING',
      amount: plan.precio,
    });
    
    // 6. Retornar respuesta al frontend
    res.json({
      data: {
        transaction_id: transaction.id,
        checkout_url: wompiTransaction.payment_method?.redirect_url || wompiTransaction.redirect_url,
        wompi_reference: wompiTransaction.reference,
        plan: {
          id: plan.id,
          nombre: plan.nombre,
          precio: plan.precio,
        },
      },
    });
  } catch (error) {
    console.error('Error en create-transaction:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al crear transacción' 
    });
  }
});

module.exports = router;
```

---

## ⚡ **Optimización: Cachear el Acceptance Token**

El acceptance_token puede ser cacheado porque no cambia frecuentemente. Esto reduce las peticiones a Wompi:

```javascript
let cachedAcceptanceToken = null;
let tokenExpiry = null;

async function getAcceptanceTokenCached() {
  // Si el token está cacheado y no ha expirado, usarlo
  if (cachedAcceptanceToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedAcceptanceToken;
  }
  
  // Obtener nuevo token
  const token = await getAcceptanceToken();
  
  // Cachear por 1 hora (ajustar según necesidades)
  cachedAcceptanceToken = token;
  tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hora
  
  return token;
}
```

---

## ✅ **Checklist de Implementación**

- [ ] El backend obtiene el acceptance_token usando `GET /v1/merchants/{public_key}`
- [ ] El acceptance_token se incluye en todas las peticiones de creación de transacciones
- [ ] El acceptance_token se incluye en todas las peticiones de creación de fuentes de pago
- [ ] La variable de entorno `WOMPI_PUBLIC_KEY` está configurada en Render
- [ ] Se manejan errores si no se puede obtener el acceptance_token
- [ ] (Opcional) Se implementa cacheo del acceptance_token para optimización

---

## 🔍 **Cómo Verificar que Está Funcionando**

1. **Revisa los logs del backend:**
   - Debes ver una petición a `/v1/merchants/{public_key}` antes de crear transacciones
   - No deben aparecer errores 404/Not Found relacionados con acceptance_token

2. **Prueba el endpoint:**
   ```bash
   curl -X POST https://viotech-main.onrender.com/api/payments/create-transaction \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TU_TOKEN" \
     -d '{"planId": "LP_PROFESIONAL_002"}'
   ```

3. **Verifica la respuesta:**
   - Debe devolver un `checkout_url` válido
   - No debe devolver errores relacionados con "Not Found" o acceptance_token

---

## 📚 **Referencias**

- [Tokens de Aceptación - Documentación Wompi](https://docs.wompi.co/docs/colombia/tokens-de-aceptacion/)
- [Fuentes de Pago & Tokenización - Documentación Wompi](https://docs.wompi.co/docs/colombia/fuentes-de-pago/)
- [Referencia del API Wompi (Swagger)](https://app.swaggerhub.com/apis-docs/waybox/wompi/1.2.0)

---

## 🆘 **Si el Problema Persiste**

Si después de implementar el acceptance_token el problema persiste:

1. **Verifica que `WOMPI_PUBLIC_KEY` esté configurada correctamente en Render**
2. **Verifica que la URL de la API de Wompi sea correcta:** `https://production.wompi.co/v1`
3. **Revisa los logs del backend** para ver el error exacto que está devolviendo Wompi
4. **Verifica que estés usando el acceptance_token en el campo correcto** de la petición

---

**¿Necesitas ayuda para implementar esto en tu código?** Comparte el código del endpoint `/api/payments/create-transaction` y te ayudo a integrarlo.


