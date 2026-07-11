# Inspector Virtual SSNF + Sistema de Versiones — Design Doc

## Resumen

Dos módulos independientes:

1. **Sistema de Versiones** — al editar un cliente, los datos se versionan (nuevo registro), preservando el histórico completo. Beneficiarios se copian a la nueva versión. Documentos, evaluaciones y verificaciones quedan vinculados a su versión original.

2. **Inspector Virtual SSNF** — botón "Verificar" en cada expediente que despliega un panel inline con checklist de cumplimiento contra Ley 23/SSNF. Página `/inspeccion` global con tabla de todos los clientes, filtros, ordenamiento y semáforo.

---

## Feature 1: Sistema de Versiones

### Modelo

Se agregan 3 campos a `Cliente`:

- `versionGrupoId String` — UUID que agrupa todas las versiones del mismo cliente
- `versionNumero Int` — empieza en 1, se incrementa con cada edición
- `vigente Boolean @default(true)` — una sola versión `true` por grupo

### Comportamiento

- **Crear cliente** (POST /api/clientes): genera `versionGrupoId` con el mismo ID del cliente, `versionNumero = 1`, `vigente = true`
- **Editar cliente** (PUT /api/clientes/[id]): 
  1. Marca versión actual `vigente = false` (solo eso — fechas originales intactas)
  2. Crea nuevo `Cliente` con datos editados, mismo `versionGrupoId`, `versionNumero + 1`, `vigente = true`
  3. Copia `BeneficiarioFinal` de la versión antigua a la nueva (mismos datos, nuevo ID)
  4. `Documento`, `EvaluacionRiesgo`, `VerificacionSancion`, `OperacionMarcada` quedan vinculados a su versión original
- **GET /api/clientes/[id]**: devuelve la versión vigente
- **GET /api/clientes/[id]?historico=true**: devuelve todas las versiones
- **GET /api/clientes**: solo versión vigente (where vigente: true)
- **Dashboard/expediente**: muestra datos de la versión vigente + documentos/evaluaciones de TODAS las versiones

### API Changes

- `PUT /api/clientes/[id]`: body igual que antes, respuesta incluye `versionNumero` nuevo
- `GET /api/clientes/[id]?historico=true`: array de versiones
- Filtros adicionales en GET /api/clientes: `?versionGrupoId=` para buscar por grupo

---

## Feature 2: Inspector Virtual SSNF

### Checklist de Cumplimiento

Cada ítem tiene: título, descripción para el usuario, artículo de la Ley 23 / Guía SSNF que aplica, estado (cumple/no cumple/n/a), enlace a la sección del expediente.

Reglas de verificación (por cliente):

| # | Ítem | Artículo | Lógica |
|---|------|----------|--------|
| 1 | Evaluación de riesgo vigente | Ley 23 art 14, Guía SSNF 2.3 | `Cliente.evaluacionesRiesgo` tiene una con `fecha` ≤ 365 días |
| 2 | Beneficiarios finales identificados | Ley 23 art 13, Guía 2.2 | `Cliente.beneficiarios` no vacío |
| 3 | Documentación mínima cargada | Guía SSNF 2.1 | `Cliente.documentos` contiene al menos 1 |
| 4 | Screening sanciones realizado | Ley 23 art 12 | `Cliente.verificaciones` tiene una con `fecha` ≤ 365 días |
| 5 | Documentos vencidos | Guía SSNF 2.1.5 | Ningún `Documento.fechaVencimiento` menor a hoy |
| 6 | Expediente completo | Guía SSNF 1.3 | `Cliente.completado = true` |

### Puntaje

- Cada ítem cumplido = 1 punto
- Score = (ítems cumplidos / ítems aplicables) × 100
- Brechas: ítems no cumplidos con su descripción

### UI

#### Botón en Expediente (`/expediente/[id]`)

- Botón "Verificar cumplimiento" al inicio del expediente
- Al hacer clic: panel inline (no modal, accesible) que muestra:
  - Score general con semáforo (verde ≥ 80, amarillo 50-79, rojo < 50)
  - Lista de ítems chequeados con icono (✓/✗) + texto + artículo
  - Cada brecha con enlace directo a la sección del expediente
- WCAG: panel es `section` con `role="region"` y `aria-live="polite"`. Navegable por teclado.

#### Página Global (`/inspeccion`)

- Tabla con todos los clientes del usuario
- Columnas: nombre, tipo, score (semáforo), brechas (cantidad), última verificación, acción
- Filtros: nombre (texto), nivel de riesgo (select), tipo persona (select), estado brechas (todos/con brechas/sin brechas)
- Ordenamiento: por cada columna, ascendente/descendente
- Cada fila: enlace al expediente + enlace para verificar ese cliente
- Resumen arriba: total clientes, % compliance promedio, clientes con brechas

### API

- `GET /api/inspeccion/[clienteId]` — verifica un cliente, devuelve `{ score, items: [{ id, titulo, descripcion, articulo, cumple, enlace }] }`
- `GET /api/inspeccion` — verifica todos los clientes del usuario, devuelve `{ resumen: { total, scorePromedio, conBrechas }, clientes: [{ clienteId, nombre, score, brechas, items }] }`

### Data Flow

1. Usuario hace clic en "Verificar"
2. Frontend llama a `GET /api/inspeccion/[clienteId]`
3. Backend evalúa las 6 reglas contra la DB
4. Devuelve resultado con score + items
5. Frontend renderiza panel inline

---

## Archivos a modificar/crear

```
prisma/
  migrations/                → Nueva migración (versionGrupoId, versionNumero, vigente)
src/
  lib/
    inspeccion/
      verificador.ts         → Lógica de las 6 reglas + cálculo de score (NUEVO)
  app/
    expediente/[id]/
      page.tsx               → Agregar botón + panel Inspector Virtual
    inspeccion/
      page.tsx               → Página global de inspección (NUEVO)
    api/
      clientes/
        route.ts             → GET: where vigente=true . POST: generar versionGrupoId
        [id]/
          route.ts           → PUT: versionar en vez de actualizar in-place
      inspeccion/
        route.ts             → GET /api/inspeccion (todos los clientes)
        [clienteId]/
          route.ts           → GET /api/inspeccion/[clienteId] (un cliente)
  components/
    InspectorPanel.tsx       → Panel inline de verificación (NUEVO)
    InspectorGlobalTable.tsx → Tabla global con filtros (NUEVO)
```

## Consideraciones

- **WCAG**: panel inline (no modal) con `role="region"`, focus management, contraste suficiente
- **Rendimiento**: página global verifica todos los clientes en una sola query (no N+1)
- **Migración**: clientes existentes reciben `versionGrupoId = id`, `versionNumero = 1`, `vigente = true` en la migración
