import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const riskDefaults = [
  { variable: "umbral_beneficiario_final", umbral: 25, peso: null, activo: true },
  { variable: "monto_efectivo_alerta", umbral: 10000, peso: null, activo: true },
  { variable: "jurisdiccion_alto_riesgo", umbral: null, peso: null, activo: true },
  { variable: "pep_riesgo_auto", umbral: null, peso: null, activo: true },
  { variable: "cripto_bandera_alto_riesgo", umbral: null, peso: null, activo: true },
];

async function main() {
  for (const cfg of riskDefaults) {
    await prisma.configuracionRiesgo.create({ data: cfg });
  }

  console.log("Seed completado: configuración de riesgo por defecto creada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
