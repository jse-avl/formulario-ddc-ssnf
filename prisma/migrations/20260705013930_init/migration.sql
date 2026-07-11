-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'abogado',
    "planActual" TEXT NOT NULL DEFAULT 'trial',
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinTrial" DATETIME,
    "fechaConversionPago" DATETIME
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "tipoPersonaJuridica" TEXT,
    "numeroIdentificacion" TEXT NOT NULL,
    "paisConstitucion" TEXT,
    "fechaInscripcion" DATETIME,
    "direccion" TEXT,
    "actividadDeclarada" TEXT,
    "jurisdiccionesOperacion" TEXT,
    "nivelRiesgo" TEXT NOT NULL DEFAULT 'bajo',
    "fechaEvaluacionRiesgo" DATETIME,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimaActualizacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proximaActualizacionReq" DATETIME,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BeneficiarioFinal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "numeroIdentificacion" TEXT NOT NULL,
    "porcentajeParticipacion" REAL NOT NULL,
    "fechaAdquisicionCondicion" DATETIME,
    "metodoIdentificacion" TEXT NOT NULL,
    CONSTRAINT "BeneficiarioFinal_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "nombreOriginal" TEXT,
    "archivoUrl" TEXT NOT NULL,
    "fechaCarga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" DATETIME,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "verificadoPor" TEXT,
    "fechaVerificacion" DATETIME,
    CONSTRAINT "Documento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluacionRiesgo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivelResultante" TEXT NOT NULL,
    "factoresJson" TEXT NOT NULL,
    CONSTRAINT "EvaluacionRiesgo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvaluacionRiesgo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfiguracionRiesgo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "variable" TEXT NOT NULL,
    "umbral" REAL,
    "peso" REAL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ConfiguracionRiesgo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperacionMarcada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierta',
    CONSTRAINT "OperacionMarcada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperacionMarcada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificacionSancion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "fechaVerificacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proveedorUsado" TEXT NOT NULL DEFAULT 'OFAC_SDN',
    "resultado" TEXT NOT NULL,
    "scoreConfianza" REAL,
    "detalleJson" TEXT,
    "revisadoPor" TEXT,
    "accionTomada" TEXT NOT NULL DEFAULT 'ninguna',
    CONSTRAINT "VerificacionSancion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReporteUsuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "severidad" TEXT,
    "pantallaOrigen" TEXT,
    "navegadorDispositivo" TEXT,
    "capturaPantallaUrl" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'nuevo',
    "respuestaAdmin" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" DATETIME,
    "notificadoAlUsuario" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ReporteUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidadAfectada" TEXT NOT NULL,
    "entidadId" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipOrigen" TEXT,
    "detalle" TEXT,
    CONSTRAINT "LogAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
