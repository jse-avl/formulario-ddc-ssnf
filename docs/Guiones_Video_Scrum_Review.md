# Guiones de Video — Sprint Review DDC-SSNF
## Formato: Scrum Review + Preguntas Spick | 8-10 minutos | Cada persona ~330 palabras

---

## Christian Dutary — Backend / API (~330 palabras)

Hola, soy Christian Dutary, responsable del backend y la API del sistema DDC-SSNF.

En el Sprint 1, me encargué del scaffold del proyecto: configuré Next.js 16 con App Router y Turbopack, integré Clerk para autenticación y autorización, y diseñé el esquema de base de datos con Prisma ORM. Creé los 11 modelos de datos necesarios: Usuarios, Transacciones, EvaluacionesRiesgo, Notificaciones, Auditoria, entre otros. Implementé el middleware de roles para garantizar que solo usuarios autorizados accedan a funcionalidades sensibles.

En el Sprint 2, desarrollé los endpoints REST para transacciones: POST para crear, GET para listar con filtros, PUT para actualizar y DELETE para eliminar. Implementé validación con Zod para asegurar integridad de datos en cada request. También construí el sistema de auditoría que registra cada acción del usuario con timestamp, IP y tipo de operación.

En el Sprint 3, trabajé en la integración entre los módulos backend. Conecté el motor de evaluación de riesgo con la base de datos para persistir cada evaluación automática. Configuré el sistema de notificaciones que genera alertas automáticas cuando una transacción supera el umbral de riesgo. Implementé los endpoints para el dashboard que alimentan las métricas en tiempo real.

En el Sprint 4, colaboré con Jose en la configuración de SonarCloud y la resolución de code smells detectados. Optimicé las consultas Prisma para mejorar el rendimiento de las consultas N+1 que habíamos identificado.

Los desafíos principales fueron la integración con la API de OFAC, que tiene rate limiting estricto, y la gestión de transacciones concurrentes sin comprometer la integridad de datos. Aprendí mucho sobre arquitectura de microservicios y patrones de diseño en entornos de producción.

El resultado es una API robusta, documentada y con cobertura completa que sirve como columna vertebral del sistema. Gracias.

---

## Yireikis Abrego — Frontend / UI (~330 palabras)

Hola, soy Yireikis Abrego, encargada del frontend y la experiencia de usuario del sistema DDC-SSNF.

En el Sprint 1, diseñé la estructura de navegación del sistema: un layout responsivo con sidebar para el dashboard, headers con información del usuario autenticado, y protección de rutas que redirige al login si no hay sesión. Utilicé Tailwind CSS v4 para lograr un diseño moderno y consistente.

En el Sprint 2, construí los componentes principales del dashboard: tarjetas de métricas con iconos, gráficos de transacciones por período usando Recharts, y la tabla de transacciones con paginación, ordenamiento y filtros avanzados. Creé el formulario de registro de transacciones con validación en tiempo real y retroalimentación visual inmediata.

En el Sprint 3, implementé las interfaces de evaluación de riesgo: una vista detallada que muestra los 7 factores con sus valores y pesos, un semáforo de riesgo (bajo, medio, alto, crítico) con colores intuitivos, y el historial de evaluaciones por transacción. También diseñé el panel de notificaciones con alertas visuales y sonoras para transacciones de alto riesgo.

En el Sprint 4, me enfocué en mejoras de UX: estados de carga con skeleton screens, mensajes de error amigables, toasts de confirmación para acciones del usuario, y optimización responsive para tablets y móviles. Implementé dark mode toggle que respeta la preferencia del sistema.

Los retos más interesantes fueron crear una experiencia fluida en el dashboard con datos dinámicos, y mantener la consistencia visual entre los 15 módulos diferentes del sistema. Aprendí a usar React hooks de forma efectiva para gestionar estado complejo y a crear componentes reutilizables que mantienen el código limpio.

El frontend es intuitivo, rápido y está preparado para producción. Gracias.

---

## Jose Avila — QA / Documentación (~330 palabras)

Hola, soy Jose Avila, responsable de QA, testing y documentación del sistema DDC-SSNF.

En el Sprint 1, establecí la infraestructura de calidad: configuré el repositorio Git con branching strategy, creé el README con instrucciones de instalación, y documenté el esquema de base de datos. Definí los criterios de aceptación para cada requisito funcional.

En el Sprint 2, diseñé los primeros casos de prueba manuales para los módulos de transacciones y autenticación. Identificé 3 bugs en el flujo de login que fueron corregidos antes del commit. Establecí el proceso de code review obligatorio para cada pull request.

En el Sprint 3, implementé tests unitarios para los módulos de evaluación de riesgo y verificación de cumplimiento. Logré una cobertura inicial del 72%. También escribí la documentación técnica de la arquitectura del sistema, incluyendo diagramas de secuencia y flujo de datos.

En el Sprint 4, me enfoqué en testing end-to-end con Playwright: creé scripts automatizados que validan el flujo completo desde login hasta generación de reporte. Instalé y configuré Playwright, generé capturas de pantalla de cada módulo principal. Configuré SonarCloud con GitHub Actions para análisis estático continuo. El Quality Gate alcanzó A+ con métricas: 95% cobertura, 0 bugs críticos, 0 vulnerabilidades, 0.28% debt ratio.

También preparé la documentación final incluyendo este documento HTML con todas las métricas: requisitos funcionales (15/15 completados), diseño (complejidad ciclomática, acoplamiento y cohesión), código (SonarCloud), clásicas (KLOC, productividad, defect rate), y el proceso de medición según ISO/IEC 15939.

Los aprendizajes más valiosos fueron la importancia del testing automatizado desde el inicio del proyecto y cómo las métricas de calidad guían decisiones técnicas informadas. El sistema está listo para producción con altísimos estándares de calidad.

Gracias por su atención. Este fue nuestro proyecto DDC-SSNF.
