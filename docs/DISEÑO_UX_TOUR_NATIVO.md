# 🎯 Diseño UX: Tour de Onboarding Nativo Perfecto

**Fecha:** Enero 2025  
**Agente:** UX Agent  
**Objetivo:** Rehacer el tour usando componentes nativos del design system para crear una experiencia perfecta

---

## 1. Perfil de Usuario & Objetivo

### Usuario objetivo
- **Rol:** Dueño/administrador de PyME nueva en VioTech Pro
- **Contexto:** Primera visita al dashboard después del registro
- **Estado mental:** Curioso, con expectativas altas, necesita ver valor rápido
- **Objetivo:** Entender cómo usar el dashboard y encontrar rápidamente las funcionalidades clave

### Objetivo del tour
**Objetivo principal:** Que el usuario comprenda la estructura del dashboard en menos de 2 minutos y sepa dónde encontrar todo.

**Resultado esperado:**
- Usuario confiado para navegar por el dashboard
- Reducción de tickets de soporte sobre "¿cómo uso esto?"
- Mayor engagement en las primeras sesiones
- Time-to-value más corto

---

## 2. Flujo Paso a Paso

### Paso 0: Inicio del tour
1. Usuario entra al dashboard por primera vez
2. **Transición suave:** Overlay oscuro aparece con fade-in (300ms)
3. **Primer spotlight:** Se enfoca en el sidebar
4. **Tooltip aparece:** Animación slide-in desde la derecha
5. Mensaje de bienvenida con indicador de progreso

### Paso 1: Sidebar (Navegación Principal)
1. Spotlight envuelve el sidebar con borde brillante
2. Resto de la página oscurecido y desenfocado
3. Tooltip a la derecha con:
   - Icono de menú
   - Título claro
   - Descripción concisa
   - Botón "Siguiente" destacado
   - Progress bar (1/6)
4. Usuario puede interactuar con el sidebar (no bloqueado)
5. Click en "Siguiente" → smooth scroll + fade

### Paso 2: Header (Barra Superior)
1. Scroll automático suave al header
2. Spotlight envuelve el header
3. Tooltip debajo del header
4. Misma estructura: icono, título, descripción, controles
5. Progress (2/6)

### Paso 3: KPIs (Métricas Principales)
1. Scroll a las tarjetas de KPIs
2. Spotlight envuelve todas las tarjetas
3. Tooltip arriba o abajo según espacio
4. Progress (3/6)

### Paso 4: Servicios Activos
1. Scroll al panel de servicios
2. Spotlight envuelve el panel completo
3. Tooltip a la izquierda
4. Progress (4/6)

### Paso 5: Roadmap Inmediato
1. Scroll al panel de roadmap
2. Spotlight envuelve el panel
3. Tooltip a la izquierda
4. Progress (5/6)

### Paso 6: Gráficos y Análisis
1. Scroll a los gráficos
2. Spotlight envuelve ambos gráficos
3. Tooltip arriba
4. Progress (6/6)
5. Botón "Siguiente" cambia a "¡Empezar!" con icono de check

### Paso 7: Finalización
1. Mensaje de celebración
2. Opción de ver tour de nuevo más tarde
3. Fade-out del overlay
4. Focus restaurado al dashboard

---

## 3. UX Writing

### Textos del tour

#### Bienvenida (antes del paso 1)
- **Título:** "¡Bienvenido a tu Dashboard! 🎉"
- **Descripción:** "Te guiaremos por las principales secciones para que aproveches al máximo VioTech Pro."
- **CTA primario:** "Comenzar Tour"
- **CTA secundario:** "Saltar por ahora"

#### Paso 1: Sidebar
- **Icono:** Menu
- **Título:** "Navegación Principal"
- **Descripción:** "Desde aquí accedes a todas las secciones: Dashboard, Tickets, Servicios, Pagos y más. Puedes colapsarlo o expandirlo según necesites."
- **CTA:** "Siguiente"
- **Progress:** "Paso 1 de 6"

#### Paso 2: Header
- **Icono:** Bell
- **Título:** "Barra Superior"
- **Descripción:** "Aquí encontrarás tus notificaciones, selector de idioma y botón de actualizar. Mantente al día con todo lo importante."
- **CTA:** "Siguiente"
- **Progress:** "Paso 2 de 6"

#### Paso 3: KPIs
- **Icono:** TrendingUp
- **Título:** "Métricas Principales"
- **Descripción:** "Estas tarjetas muestran tus KPIs más importantes: tickets abiertos, servicios activos, cumplimiento de SLA y avance promedio. Revísalos regularmente para mantener el control."
- **CTA:** "Siguiente"
- **Progress:** "Paso 3 de 6"

#### Paso 4: Servicios Activos
- **Icono:** Package
- **Título:** "Servicios Activos"
- **Descripción:** "Aquí verás todos tus servicios contratados, su estado, fechas de expiración y progreso. Puedes renovar servicios que estén por vencer o explorar nuevos servicios desde aquí."
- **CTA:** "Siguiente"
- **Progress:** "Paso 4 de 6"

#### Paso 5: Roadmap
- **Icono:** Calendar
- **Título:** "Roadmap Inmediato"
- **Descripción:** "Este panel muestra los próximos hitos importantes: renovaciones de servicios y kickoffs de proyectos. Mantén un ojo aquí para no perderte fechas importantes."
- **CTA:** "Siguiente"
- **Progress:** "Paso 5 de 6"

#### Paso 6: Gráficos
- **Icono:** BarChart3
- **Título:** "Gráficos y Análisis"
- **Descripción:** "Los gráficos de tendencias y métricas de SLA te ayudan a visualizar el rendimiento a lo largo del tiempo. Úsalos para identificar patrones y tomar decisiones informadas."
- **CTA:** "¡Empezar!"
- **Progress:** "Paso 6 de 6"

#### Finalización
- **Título:** "¡Todo listo! ✨"
- **Descripción:** "Ya conoces las principales secciones de tu dashboard. Si necesitas ayuda en cualquier momento, puedes volver a ver este tour desde el botón en el header."
- **CTA primario:** "Explorar Dashboard"
- **CTA secundario:** "Ver Tour Nuevamente" (pequeño, texto)

### Textos de botones
- **Siguiente:** "Siguiente"
- **Anterior:** "Anterior"
- **Saltar:** "Saltar Tour"
- **Cerrar:** "Cerrar" (icono X)
- **Finalizar:** "¡Empezar!"

---

## 4. Recomendaciones UI

### Componentes a usar

#### 1. **Overlay y Spotlight**
- **Overlay:** Div fijo con `backdrop-blur-sm` y `bg-black/60`
- **Spotlight:** Div posicionado absolutamente que envuelve el elemento target
  - Borde de `3px solid hsl(var(--primary))`
  - Box-shadow para crear efecto de oscurecimiento alrededor
  - Border-radius que respeta el elemento
  - Transiciones suaves

#### 2. **Tooltip Card**
- **Base:** Card component de Shadcn/UI
- **Estructura:**
  - CardHeader: Icono + Título
  - CardContent: Descripción
  - CardFooter: Progress + Botones
- **Posicionamiento:** Flotante usando Popper o posicionamiento absoluto
- **Flecha:** Triangular que apunta al elemento

#### 3. **Progress Indicator**
- **Componente:** Progress de Shadcn/UI
- **Texto:** "Paso X de Y" debajo de la barra
- **Estilo:** Color primario, altura 4px

#### 4. **Botones**
- **Siguiente:** Button variant="default" (primario)
- **Anterior:** Button variant="ghost" (si no es primer paso)
- **Saltar:** Button variant="ghost" con texto pequeño
- **Cerrar:** Button variant="ghost" icon-only (X)

#### 5. **Animaciones**
- **Entrada:** Fade-in + slide-in desde la dirección del tooltip
- **Salida:** Fade-out + slide-out
- **Transición entre pasos:** Fade-out → scroll → fade-in
- **Spotlight:** Scale animation al cambiar de elemento

### Estructura del componente

```tsx
<TourProvider>
  <TourOverlay>
    <TourSpotlight target={element} />
    <TourTooltip
      position={calculatedPosition}
      title={step.title}
      content={step.content}
      icon={step.icon}
      progress={current / total}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleSkip}
    />
  </TourOverlay>
</TourProvider>
```

### Responsive
- **Mobile:** Tooltip full-width, posición bottom siempre
- **Tablet:** Tooltip ajustado al espacio disponible
- **Desktop:** Tooltip posicionado según `placement` (right, left, top, bottom)

---

## 5. Métricas de Éxito

### Métricas cuantitativas
1. **Tasa de finalización:** % de usuarios que completan el tour
   - **Objetivo:** >70%
   - **Cómo medir:** Evento al completar último paso

2. **Tiempo promedio de completitud:** Tiempo desde inicio hasta finalización
   - **Objetivo:** <2 minutos
   - **Cómo medir:** Timestamp inicio - timestamp fin

3. **Tasa de skip:** % de usuarios que saltan el tour
   - **Objetivo:** <20%
   - **Cómo medir:** Evento al hacer click en "Saltar"

4. **Revisitas al tour:** % de usuarios que vuelven a ver el tour
   - **Objetivo:** <10% (baja porque debería ser intuitivo)
   - **Cómo medir:** Evento al iniciar tour nuevamente

5. **Engagement post-tour:** % de usuarios que interactúan con elementos del tour en las primeras 24h
   - **Objetivo:** >60%
   - **Cómo medir:** Eventos de click en sidebar, servicios, etc.

### Métricas cualitativas
1. **Reducción de tickets de soporte:** "¿Cómo uso el dashboard?"
2. **Feedback de usuarios:** Encuesta breve post-tour
3. **Time-to-value:** Tiempo hasta primera acción útil del usuario

### Eventos a trackear
- `tour_started` - Tour iniciado
- `tour_step_viewed` - Paso X visto (1-6)
- `tour_step_skipped` - Paso saltado
- `tour_completed` - Tour completado
- `tour_skipped` - Tour saltado completamente
- `tour_restarted` - Tour iniciado nuevamente

---

## 6. Consideraciones Técnicas

### Performance
- Lazy load del componente de tour
- Calcular posiciones solo cuando sea necesario
- Debounce en scroll/resize events

### Accesibilidad
- Focus trap dentro del tour
- Navegación con teclado (Tab, Enter, Esc)
- ARIA labels en todos los botones
- `aria-describedby` en elementos destacados
- Screen reader announcements para cada paso

### Persistencia
- Guardar progreso en localStorage
- Opción de "No mostrar de nuevo"
- Restaurar desde último paso si se interrumpe

---

## 7. Estados y Edge Cases

### Estados del tour
1. **No iniciado:** Usuario nuevo sin tour completado
2. **En progreso:** Tour activo, paso X de Y
3. **Completado:** Tour finalizado
4. **Omitido:** Usuario saltó el tour
5. **Reiniciado:** Usuario volvió a ver el tour

### Edge cases a manejar
1. **Elemento no encontrado:** Saltar paso o mostrar mensaje
2. **Ventana redimensionada:** Recalcular posiciones
3. **Scroll durante el tour:** Bloquear o ajustar spotlight
4. **Navegación fuera:** Pausar tour, mostrar confirmación
5. **Múltiples tours:** Sistema de cola o priorización

---

## Conclusión

Este tour nativo proporcionará una experiencia fluida, accesible y efectiva usando únicamente componentes del design system. El enfoque en claridad, reducción de fricción y valor rápido asegurará que los usuarios nuevos se sientan confiados desde el primer momento.

