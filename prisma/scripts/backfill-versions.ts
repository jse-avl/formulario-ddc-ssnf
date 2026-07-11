import { PrismaClient } from "@prisma/client"

const p = new PrismaClient()

async function main() {
  const result = await p.$executeRawUnsafe(
    'UPDATE "Cliente" SET "versionGrupoId" = "id", "versionNumero" = 1, "vigente" = 1 WHERE "versionGrupoId" = \'\' OR "versionGrupoId" IS NULL'
  )
  console.log(`Filas actualizadas: ${result}`)
}

main().catch(console.error).finally(() => p.$disconnect())
