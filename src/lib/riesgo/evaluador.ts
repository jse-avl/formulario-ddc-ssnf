import { prisma } from "@/lib/prisma";

export type FactoresRiesgo = {
  esPEP: boolean
  operaJurisdiccionNoCooperante: boolean
  operacionesEfectivoAlto: boolean
  usaCripto: boolean
  beneficiarioNoIdentificado: boolean
  documentosIncompletos: boolean
  sancionMatch: boolean
}

export type ResultadoRiesgo = {
  nivel: "alto" | "medio" | "bajo"
  factores: { nombre: string; activo: boolean; detalle?: string }[]
}

const NOMBRES_FACTORES: Record<keyof FactoresRiesgo, string> = {
  esPEP: "Persona expuesta políticamente (PEP)",
  operaJurisdiccionNoCooperante: "Opera en jurisdicción no cooperante (GAFI)",
  operacionesEfectivoAlto: "Operaciones en efectivo ≥ USD 10,000",
  usaCripto: "Uso de criptomonedas",
  beneficiarioNoIdentificado: "Beneficiario final no identificado por participación accionaria",
  documentosIncompletos: "Documentos de debida diligencia incompletos",
  sancionMatch: "Coincidencia en listas de sanciones (OFAC/ONU)",
}

export async function evaluarRiesgo(clienteId: string, usuarioId: string, factores: FactoresRiesgo): Promise<ResultadoRiesgo> {
  const activos: { nombre: string; activo: boolean; detalle?: string }[] = []

  for (const [key, desc] of Object.entries(NOMBRES_FACTORES)) {
    const k = key as keyof FactoresRiesgo
    activos.push({ nombre: desc, activo: factores[k] })
  }

  // Reglas base (configurables más adelante desde configuracion_riesgo)
  if (factores.sancionMatch || factores.esPEP || factores.operaJurisdiccionNoCooperante) {
    await guardarResultado(clienteId, usuarioId, "alto", activos)
    return { nivel: "alto", factores: activos }
  }

  const banderasAltas = [factores.usaCripto, factores.operacionesEfectivoAlto].filter(Boolean).length
  if (banderasAltas >= 1 || factores.beneficiarioNoIdentificado) {
    await guardarResultado(clienteId, usuarioId, "alto", activos)
    return { nivel: "alto", factores: activos }
  }

  if (factores.documentosIncompletos) {
    await guardarResultado(clienteId, usuarioId, "medio", activos)
    return { nivel: "medio", factores: activos }
  }

  await guardarResultado(clienteId, usuarioId, "bajo", activos)
  return { nivel: "bajo", factores: activos }
}

async function guardarResultado(clienteId: string, usuarioId: string, nivel: string, factores: { nombre: string; activo: boolean }[]) {
  await prisma.evaluacionRiesgo.create({
    data: {
      clienteId,
      usuarioId,
      nivelResultante: nivel,
      factoresJson: JSON.stringify(factores),
    },
  })
  await prisma.cliente.update({
    where: { id: clienteId },
    data: { nivelRiesgo: nivel, fechaEvaluacionRiesgo: new Date() },
  })
}
