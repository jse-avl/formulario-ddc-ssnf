import { prisma } from "@/lib/prisma"

export type ItemInspeccion = {
  id: string
  titulo: string
  descripcion: string
  articulo: string
  cumple: boolean
  enlace: string
}

export type ResultadoInspeccion = {
  clienteId: string
  clienteNombre: string
  score: number
  items: ItemInspeccion[]
  fecha: string
}

const DIAS_VIGENCIA_EVALUACION = 365
const DIAS_VIGENCIA_SCREENING = 365

export async function inspeccionarCliente(clienteId: string, usuarioId: string): Promise<ResultadoInspeccion> {
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, usuarioId },
    include: {
      beneficiarios: true,
      documentos: true,
      evaluacionesRiesgo: { orderBy: { fecha: "desc" }, take: 1 },
      verificaciones: { orderBy: { fechaVerificacion: "desc" }, take: 1 },
    },
  })

  if (!cliente) throw new Error("Cliente no encontrado")

  const ahora = new Date()
  const items: ItemInspeccion[] = []

  // 1. Evaluación de riesgo vigente (Ley 23 art 14, Guía SSNF 2.3)
  const evalVigente = cliente.evaluacionesRiesgo[0]
  const evalValida = evalVigente && (ahora.getTime() - evalVigente.fecha.getTime()) < DIAS_VIGENCIA_EVALUACION * 86400000
  items.push({
    id: "eval-riesgo",
    titulo: "Evaluación de riesgo vigente",
    descripcion: "El cliente debe tener una evaluación de riesgo actualizada (menos de 365 días).",
    articulo: "Ley 23 art. 14, Guía SSNF 2.3",
    cumple: !!evalValida,
    enlace: `/expediente/${clienteId}#evaluacion-riesgo`,
  })

  // 2. Beneficiarios finales identificados (Ley 23 art 13, Guía SSNF 2.2)
  items.push({
    id: "beneficiarios",
    titulo: "Beneficiarios finales identificados",
    descripcion: "Se deben identificar todos los beneficiarios finales con participación ≥ umbral configurado.",
    articulo: "Ley 23 art. 13, Guía SSNF 2.2",
    cumple: cliente.beneficiarios.length > 0,
    enlace: `/expediente/${clienteId}#beneficiarios`,
  })

  // 3. Documentación mínima cargada (Guía SSNF 2.1)
  items.push({
    id: "documentacion",
    titulo: "Documentación mínima cargada",
    descripcion: "Debe existir al menos un documento de identificación o soporte en el expediente.",
    articulo: "Guía SSNF 2.1",
    cumple: cliente.documentos.length > 0,
    enlace: `/expediente/${clienteId}#documentos`,
  })

  // 4. Screening de sanciones realizado (Ley 23 art. 12)
  const screenVigente = cliente.verificaciones[0]
  const screenValido = screenVigente && (ahora.getTime() - screenVigente.fechaVerificacion.getTime()) < DIAS_VIGENCIA_SCREENING * 86400000
  items.push({
    id: "screening",
    titulo: "Verificación contra listas de sanciones",
    descripcion: "El cliente debe haber sido verificado contra listas OFAC/ONU en los últimos 365 días.",
    articulo: "Ley 23 art. 12",
    cumple: !!screenValido,
    enlace: `/expediente/${clienteId}#screening`,
  })

  // 5. Documentos vencidos (Guía SSNF 2.1.5)
  const docsVencidos = cliente.documentos.filter(
    (d) => d.fechaVencimiento && d.fechaVencimiento < ahora
  ).length
  items.push({
    id: "docs-vencidos",
    titulo: "Documentos vigentes",
    descripcion: "Ningún documento debe tener fecha de vencimiento vencida.",
    articulo: "Guía SSNF 2.1.5",
    cumple: docsVencidos === 0,
    enlace: `/expediente/${clienteId}#documentos`,
  })

  // 6. Expediente completo (Guía SSNF 1.3)
  items.push({
    id: "expediente-completo",
    titulo: "Expediente marcado como completo",
    descripcion: "El expediente debe estar marcado como completo para certificar que toda la información fue recolectada.",
    articulo: "Guía SSNF 1.3",
    cumple: cliente.completado,
    enlace: `/expediente/${clienteId}`,
  })

  const aplicables = items.length
  const cumplidos = items.filter((i) => i.cumple).length
  const score = aplicables > 0 ? Math.round((cumplidos / aplicables) * 100) : 0

  return {
    clienteId: cliente.id,
    clienteNombre: cliente.nombreCompleto,
    score,
    items,
    fecha: ahora.toISOString(),
  }
}
