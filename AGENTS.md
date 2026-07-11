# DDC-SSNF — Instrucciones para OpenCode

Sistema web de debida diligencia para profesionales independientes (abogados, contadores, agentes residentes) en Panamá. Cumplimiento Ley 23 de 2015 y guías SSNF.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | Clerk v7 (`@clerk/nextjs`) + `@clerk/localizations` (esES) |
| CSS | Tailwind CSS v4 + PostCSS (`@tailwindcss/postcss`) |
| Lenguaje | TypeScript strict |
| Fonts | Geist + Geist Mono via `next/font/google` |

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server con recarga en caliente |
| `npm run build` | `prebuild` (descarga OFAC SDN) + `next build` |
| `npm run start` | Servir build de producción |
| `npm run lint` | ESLint (flat config: `eslint.config.mjs`) |
| `npm run seed` | Poblar `configuracion_riesgo` con valores por defecto |
| `npx prisma migrate dev` | Crear migración tras cambios en `prisma/schema.prisma` |

## Variables de entorno

`.env.local` es obligatorio para autenticación:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Las keys se obtienen del dashboard de [Clerk](https://clerk.com). MFA obligatorio: activar en Configuración > Sesiones > "Require MFA".

## Autenticación — Clerk v7

**Quirk crítico que un agente se equivocaría:** Clerk v7 **no exporta** `SignedIn` ni `SignedOut`. No intentar importarlos. En su lugar:

- Componentes cliente: `import { useUser, UserButton } from "@clerk/nextjs"` → `const { isSignedIn } = useUser()`
- `UserButton` sí se exporta desde `@clerk/nextjs` y funciona en server components.

Middleware (`src/middleware.ts`): protege todo excepto `/`, `/privacy`, `/cookies`, `/contact`, `/sign-in(.*)`, `/sign-up(.*)`. Next.js 16 muestra deprecation warning (usar "proxy" en vez de "middleware") — ignorar, sigue funcionando.

## Arquitectura del proyecto

```
src/
  middleware.ts             → Clerk auth
  app/
    layout.tsx              → ClerkProvider, Footer, CookieConsent, FeedbackButton, TrialBanner
    page.tsx                → Landing pública
    privacy/page.tsx        → Política de privacidad
    cookies/page.tsx        → Política de cookies
    contact/page.tsx        → Contacto
    dashboard/page.tsx      → Dashboard con datos reales + screening
    sign-in/page.tsx        → Clerk SignIn
    sign-up/page.tsx        → Clerk SignUp
    clientes/nuevo/page.tsx → Wizard 4 pasos (tipo → datos → beneficiarios → docs)
    expediente/[id]/page.tsx → Vista/PDF de expediente (Ctrl+P para exportar)
    admin/reportes/page.tsx → Panel admin de reportes/feedback
    api/
      clientes/route.ts       → CRUD clientes
      clientes/[id]/route.ts  → GET/PUT/DELETE cliente
      beneficiarios/route.ts  → Crear/eliminar beneficiarios
      riesgo/evaluar/route.ts → Evaluar riesgo de un cliente
      reportes/route.ts       → CRUD reportes de usuario
      reportes/[id]/route.ts  → Actualizar estado/respuesta
      sanctions/check/route.ts → Screening OFAC/ONU
      trial/route.ts          → Estado del trial
  components/
    AuthNav.tsx, Footer.tsx, CookieConsent.tsx, FeedbackButton.tsx
    TrialBanner.tsx, SanctionsCheck.tsx
  lib/
    prisma.ts               → Singleton PrismaClient
    sanctions/data.ts       → Carga SDN (server-side fs)
    sanctions/matcher.ts    → Fuzzy matching
    riesgo/evaluador.ts     → Motor de riesgo (7 reglas)
prisma/
  schema.prisma             → 11 modelos: User, Cliente, BeneficiarioFinal, Documento,
                               EvaluacionRiesgo, ConfiguracionRiesgo, OperacionMarcada,
                               VerificacionSancion, ReporteUsuario, LogAuditoria
  seed/seed.ts              → Valores por defecto de configuracion_riesgo
  dev.db                    → SQLite local (no commitear)
```

### Database (SQLite via Prisma 6)
- `DATABASE_URL="file:./dev.db"` en `.env` — SQLite local, migrable a PostgreSQL después.
- `npx prisma migrate dev --name <nombre>` para crear migraciones.
- `npm run seed` después de migrar para poblar `configuracion_riesgo` con umbrales por defecto (beneficiario final: 25%, efectivo alerta: $10k).
- `User` se crea automáticamente al visitar el dashboard (sincronizado con Clerk vía `clerkId`).

## Detalles de implementación

### Convenciones de código
- **Path alias**: `@/*` → `src/*`
- **Idioma UI**: español panameño. Clerk localizado con `esES` (importado de `@clerk/localizations`).
- **Tailwind v4**: usa `@import "tailwindcss"` en CSS en vez de las directivas `@tailwind` antiguas.
- **Componentes cliente**: cualquier componente que use `useUser`, `useState`, `useEffect` debe tener `'use client'`.
- **Server components**: por defecto, todo en `app/` es server component. No añadir `'use client'` sin necesidad.

### Base de datos
- SQLite via Prisma 6 (`prisma/schema.prisma`). Archivo local en `prisma/dev.db`.
- 11 modelos implementados según el PRD, incluyendo `configuracion_riesgo` que almacena umbrales (beneficiario final 25%, alerta efectivo $10k, etc.) — **nunca hardcodear estos valores**.
- `User` se crea automáticamente vía `clerkId` en el dashboard. No requiere registro manual.

### OFAC Sanctions Screening
- `GET /api/sanctions/check?name=<nombre>` — busca en la lista SDN de OFAC (~39k entradas + alias).
- Motor de matching en `src/lib/sanctions/matcher.ts`:
  1. Exact match → score 100
  2. Substring match → score 70-95
  3. Token match ratio (Jaccard) → score hasta 85
  4. Levenshtein distance → score hasta 75
  - Umbral: `score ≥ 70` = "posible match", `score ≥ 90` = "match confirmado"
- Datos se descargan en `prebuild` desde `sanctionslistservice.ofac.treas.gov`. Si falla (403 o timeout), el script usa un dataset embebido mínimo de 3 entradas de prueba. Si un agente necesita el listado completo, debe revisar `scripts/download-sdn.mjs`.

### Cookie Consent
- Componente cliente en `src/components/CookieConsent.tsx`.
- Persiste preferencia en `localStorage` bajo key `cookies-accepted` (`"true"` o `"essential"`).
- Dos botones: "Solo necesarias" y "Aceptar todas".
- Sin dependencias externas.

## Reglas de negocio (del PRD)

El PRD completo está en `../PRD_DDC_SSNF.md`. Extractos relevantes para desarrollo:

- **Umbral beneficiario final**: 25% (NO 10% como en banca). Debe vivir en una tabla `configuracion_riesgo`, no hardcodeado.
- **Niveles de riesgo**: alto, medio, bajo. Determinado por motor configurable (sección 5 del PRD).
- **Reportes sospechosos**: el sistema solo marca internamente. El reporte formal a UAF va por canales oficiales.
- **Retención de datos**: dual — Ley 23 (retención AML mínima) vs Ley 81 (derechos ARCO del titular). La obligación AML prevalece durante el período de retención.
- **Fases de construcción**: ver PRD sección 17 (12 fases). Implementado hasta fase 7. No saltar fases sin orden explícito.

## Estado actual

- [x] Proyecto Next.js + Clerk scaffolded
- [x] Páginas públicas: landing, privacidad, cookies, contacto
- [x] Autenticación con middleware + dashboard con datos reales
- [x] OFAC sanctions screening (API + UI)
- [x] Prisma + SQLite con esquema completo (11 tablas)
- [x] Clientes CRUD (API + wizard de 4 pasos)
- [x] Beneficiarios finales + umbral 25% desde `configuracion_riesgo`
- [x] Motor de riesgo configurable con factores auditables (7 reglas)
- [x] Exportación de expediente PDF (vista para imprimir)
- [x] Módulo feedback: botón flotante, modal, API, panel admin
- [x] Trial: banner dinámico, endpoint de estado
- [ ] Middleware de bloqueo por trial expirado (pendiente)
- [ ] Integración Clerk Organizations (pendiente)
- [ ] Pago: Yappy + tarjeta (pendiente)
