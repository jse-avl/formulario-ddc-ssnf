/*
  Warnings:

  - Added the required column `versionGrupoId` to the `Cliente` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
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
    "versionGrupoId" TEXT NOT NULL,
    "versionNumero" INTEGER NOT NULL DEFAULT 1,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cliente" ("actividadDeclarada", "completado", "direccion", "fechaCreacion", "fechaEvaluacionRiesgo", "fechaInscripcion", "fechaUltimaActualizacion", "id", "jurisdiccionesOperacion", "nivelRiesgo", "nombreCompleto", "numeroIdentificacion", "paisConstitucion", "proximaActualizacionReq", "tipo", "tipoPersonaJuridica", "usuarioId") SELECT "actividadDeclarada", "completado", "direccion", "fechaCreacion", "fechaEvaluacionRiesgo", "fechaInscripcion", "fechaUltimaActualizacion", "id", "jurisdiccionesOperacion", "nivelRiesgo", "nombreCompleto", "numeroIdentificacion", "paisConstitucion", "proximaActualizacionReq", "tipo", "tipoPersonaJuridica", "usuarioId" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE INDEX "Cliente_versionGrupoId_idx" ON "Cliente"("versionGrupoId");
CREATE UNIQUE INDEX "Cliente_versionGrupoId_versionNumero_key" ON "Cliente"("versionGrupoId", "versionNumero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
