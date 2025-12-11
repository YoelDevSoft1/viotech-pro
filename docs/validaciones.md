Perfecto, ahora sí estamos hablando el mismo idioma 😎

Vamos a hacer un **roadmap de validaciones**, NO de features nuevas, empezando solo por **CLIENTE**, y pensado para:

* **No romper lo que ya está**
* Validar primero
* Solo cambiar cuando veamos algo concreto que está mal o débil

Te dejo algo que puedes seguir como playbook con tu equipo.

---

## 🧱 0. Reglas del juego (para no romper nada)

Antes de tocar código, de acuerdo en esto:

1. **Nada de refactors grandes mientras validamos**

   * Solo cambios pequeños y acotados por módulo.
2. **Todo cambio con mínimo de trazabilidad**

   * Comentario en el código o en el issue: “Este cambio responde a validación X”.
3. **Siempre primero medir, luego cambiar**

   * Si un número está raro (por ejemplo Health Score 18 con usuarios activos 100%), primero logueamos/verificamos query → recién después cambiamos lógica.
4. **Cambios riesgosos detrás de flags**

   * Ej: nuevo cálculo de métrica → `USE_NEW_METRICS=false` → lo activas cuando esté probado.

---

## 🧭 Roadmap de Validaciones – CLIENTE

Lo voy a separar en **fases C1–C4**, todas solo para el rol Cliente.
La idea es que tú digas luego: “Listo, hagamos C1.1 en detalle” y vamos bajando a nivel implementación.

---

### 🟢 FASE C1 – Validaciones de Acceso & Rol (Cliente)

**Objetivo:** asegurarte de que el cliente solo vea lo que le corresponde y que todas las vistas de `/client` están protegidas correctamente.

#### C1.1. Mapa de rutas cliente

📌 Acción:

* Listar TODAS las rutas que usa el cliente, por ejemplo:

  * `/client/dashboard`
  * `/client/tickets`
  * `/client/tickets/[id]`
  * `/client/services`
  * `/client/payments`
  * `/client/notifications`
  * `/client/ia/*`
  * `/client/settings/*`
* Ver qué layout usan: `ClientLayout`, `ProtectedRoute`, middleware, etc.

🎯 Validar:

* [ ] Todas las rutas cliente **revisan JWT + organización** antes de renderizar contenido.
* [ ] No hay ninguna vista de cliente colándose bajo `(marketing)` o rutas públicas.
* [ ] El backend valida **siempre** que `user.org_id` coincide con la organización del recurso (ticket, proyecto, etc.).

Si algo falta →
✅ Cambios típicos:

* Añadir middleware genérico en backend: `requireClientRole` / `requireOrganizationMatch`.
* En Next, envolver rutas cliente con `requireAuth` y verificación de rol.

---

### 🟢 FASE C2 – Validaciones de DATOS & NEGOCIO por módulo

Aquí no cambiamos UI, solo respondemos:

> “¿Los datos que ve el cliente son coherentes, seguros y consistentes?”

Lo dividimos por módulos del cliente.

---

#### C2.1. Dashboard Cliente

**Backend – `/api/metrics/dashboard`**

Validar:

* [ ] Los campos básicos siempre existen (aunque sea 0):

  * `serviciosActivos`, `ticketsAbiertos`, `ticketsResueltos`, `slaCumplido`, `avancePromedio`, `healthScore`.
* [ ] **Rangos válidos**:

  * `slaCumplido` ∈ [0, 100]
  * `avancePromedio` ∈ [0, 100]
  * `healthScore` en rango que tú definas (ej. 0–100 o 0–30).
* [ ] Los filtros de tiempo (últimos 7/30/90 días) no rompen el endpoint:

  * Si no hay datos → retorna estructura vacía controlada, no error 500.
* [ ] No hay datos cruzados entre organizaciones:

  * Mismo usuario → cambiar org → cambian métricas.

Si algo falla →
✅ Cambios típicos:

* Normalizar respuesta, por ejemplo:

```json
{
  "serviciosActivos": 0,
  "proximaRenovacion": null,
  "avancePromedio": 0,
  "ticketsAbiertos": 0,
  "ticketsResueltos": 0,
  "slaCumplido": 100,
  "healthScore": 18,
  "healthFactors": {
    "activeUsers": 1.0,
    "activeProjects": 0.0,
    "responseTime": 0.0,
    "resolutionRate": 0.0,
    "paymentsStatus": 0.3,
    "engagement": 0.0
  }
}
```

* Agregar validaciones en backend:

  * `Math.min(Math.max(valor, 0), 100)` para porcentajes.
* Loggear casos raros (`slaCumplido > 100`, `NaN`, etc.) antes de cambiar lógica.

**Frontend – Dashboard**

Validar:

* [ ] Si algún campo viene `null`/`undefined`, la UI **no explota**:

  * Muestra 0, “Sin datos”, skeleton, etc.
* [ ] Los textos (“Crítico”, “Excelente”, etc.) están ligados a rangos claros (config central, no disperso en 5 componentes).
* [ ] El selector de rango de fechas realmente cambia la data (y no solo el UI).

---

#### C2.2. Mis Tickets (datos y negocio)

**Backend**

Validar:

* [ ] `GET /api/tickets`:

  * Filtra siempre por organización / usuario.
  * Paginación funciona (sin `limit` = 1 millón de filas).
  * Soporta filtros esperados (`estado`, `prioridad`, `fecha`).
* [ ] `GET /api/tickets/:id`:

  * Valida que el ticket sea de esa organización; si no → 404 genérico, nunca “ticket de otra empresa”.
* [ ] `POST /api/tickets`:

  * Validaciones fuertes:

    * asunto: longitud mínima/máxima (ej. 5–200 chars)
    * descripción: tamaño razonable
    * prioridad: enum (`low|medium|high|critical`)
    * tipo/categoría: solo valores permitidos
  * Manejo de adjuntos: validar tamaño, mime, cantidad.
* [ ] Transiciones de estado:

  * No puedes pasar de `resuelto` a `nuevo` sin reglas.
  * Cliente no puede cambiar a estados reservados de interno (ej. `interno`, `en QA`) si así lo decides.

**Frontend**

Validar:

* [ ] Formularios no permiten enviar campos vacíos o inválidos (ya tienes RHF+Zod, solo afinar schemas).
* [ ] Campos deshabilitados para el cliente (ej. no puede cambiar cosas que son solo internas).
* [ ] Manejo de errores:

  * Si backend responde 400 → mensajes claros (“Falta X”, “Formato no válido”).
  * Si responde 500 → mensaje genérico + log (no stacktrace).

---

#### C2.3. Servicios & Pagos (datos coherentes)

**Backend**

Validar:

* [ ] Los servicios que ve el cliente:

  * Siempre pertenecen a su organización.
  * Tienen estado coherente:

    * `activo`, `pendiente`, `vencido`, etc. (enum).
* [ ] Fechas:

  * `fecha_expiracion` >= `fecha_compra`.
  * Si `fecha_expiracion` ya pasó → estado `vencido` o calculado así en la capa de negocio.
* [ ] Pago Wompi:

  * Validar firma del webhook.
  * Marcar transacción como idempotente:

    * No crear dos veces el mismo servicio si llega doble webhook.
  * Actualizar servicio y/o proyecto solo si estado de pago es `APPROVED`.

**Frontend**

Validar:

* [ ] Que nunca muestres:

  * servicios de otra org,
  * ni precios inconsistentes con lo que tu backend dictó.
* [ ] Estados:

  * “Sin servicios aún” se muestre cuando la lista viene vacía (no cuando hay error).
* [ ] Flujo éxito/error después de pago:

  * No mostrar “Pago exitoso” si backend reportó fallo o no actualizó el estado.

---

#### C2.4. IA & Predictor (cliente)

**Backend**

Validar:

* [ ] Límite de tamaño de prompt / entradas.
* [ ] Rate limiting razonable (para que no te hagan abuso).
* [ ] Si ML/IA está apagada:

  * El endpoint responde con error controlado (`503`/`“Ia no disponible temporalmente”`).
* [ ] Logs de:

  * entrada resumida (sin datos sensibles),
  * salida (al menos status de éxito/ fallo).

**Frontend**

Validar:

* [ ] Si IA falla:

  * No se rompe la pantalla.
  * Muestras mensaje: “No pudimos generar la predicción ahora, intenta de nuevo más tarde.”
* [ ] Cuando ofreces “Crear ticket desde IA”:

  * Verificar que se prellenen bien los campos.
  * El usuario siempre puede editar antes de enviar.

---

#### C2.5. Notificaciones

**Backend**

Validar:

* [ ] `notifications` siempre están filtradas por usuario/organización.
* [ ] No envías notificación de ticket a usuario equivocado.
* [ ] Estructura básica de notificación es estable:

  * `id`, `type`, `title`, `body`, `createdAt`, `read`, `resourceType`, `resourceId`.

**Frontend**

Validar:

* [ ] Si el user hace click, se navega a recurso correcto (ticket, proyecto, pago).
* [ ] No crashea si notificas algo que ya no existe (por ejemplo, ticket borrado → mostrar mensaje “Este recurso ya no está disponible”).

---

#### C2.6. Perfil, idioma, preferencias

**Backend**

Validar:

* [ ] `PUT /api/users/me`:

  * Solo campos permitidos (no se puede escalar rol ni tocar org).
  * Idiomas aceptados: `es`, `en`, `pt` (enum).
* [ ] Guardar preferencias de notificaciones / idioma a nivel usuario/organización según tu diseño.

**Frontend**

Validar:

* [ ] Selector de idioma solo usa valores válidos.
* [ ] Si la API no responde, no dejas al usuario sin poder usar la app (solo avisas que no se guardó, pero la UI sigue en el idioma actual).

---

### 🟢 FASE C3 – Validaciones de UX / Errores (Cliente)

Aquí ya no es datos, es **experiencia**: que nada se sienta roto.

Validar:

* [ ] Todos los screens cliente tienen:

  * estado `loading` (skeleton/spinner),
  * estado `error` (mensaje + botón “Reintentar”),
  * estado `empty` (mensaje y CTA útil).
* [ ] Errores típicos:

  * sin internet,
  * backend caído,
  * 401/403 → redirigir a login con mensaje amigable.
* [ ] Mensajes de error:

  * Sin textos técnicos (“PrismaError code P2025”), siempre friendly.

---

### 🟢 FASE C4 – Validaciones Automáticas (Tests) – Solo Cliente

Última capa: que todo lo que validaste manualmente quede en **tests básicos**.

Al menos:

1. **E2E feliz cliente**:

   * Login → Dashboard → Crear ticket → Ver ticket → Ver servicios → Logout.

2. **E2E con error**:

   * Llamar al backend caído o simular error → ver que la UI aguanta.

3. **Tests de contrato API** (puede ser con Jest + supertest o similar):

   * `/api/metrics/dashboard` siempre devuelve la forma acordada.
   * `/api/tickets` no devuelve tickets de otra org.

---

## 💡 Cómo lo usamos tú y yo

Tú me propusiste:

> “iremos parte por parte y primero con cliente”

Propuesta concreta:

1. Tomas este roadmap de validaciones de cliente.
2. Escoges un bloque, por ejemplo:
   👉 **C2.2 Mis Tickets (datos y negocio)**
3. En el siguiente mensaje me dices:

   > “Vamos con C2.2, ayúdame a bajar esto a pasos concretos de revisión + cambios”.

Y ahí ya te puedo dar:

* Queries específicas para verificar datos,
* ejemplos de validadores backend,
* esquemas Zod para formularios,
* y hasta estructuras de tests.

Así no tocas nada “a ciegas”, y vamos zona por zona dejando al **cliente sólido**, sin romper lo que ya existe.
