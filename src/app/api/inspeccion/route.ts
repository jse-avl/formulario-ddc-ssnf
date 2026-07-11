import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { inspeccionarCliente } from "@/lib/inspeccion/verificador"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const nombreFilter = searchParams.get("nombre")?.toLowerCase() || ""
  const nivelFilter = searchParams.get("nivelRiesgo") || ""
  const tipoFilter = searchParams.get("tipoPersona") || ""
  const brechasFilter = searchParams.get("brechas") || "" // "todos", "con", "sin"

  const clientes = await prisma.cliente.findMany({
    where: { usuarioId: user.id, vigente: true },
    include: {
      beneficiarios: { take: 1 },
      documentos: { take: 1 },
      evaluacionesRiesgo: { orderBy: { fecha: "desc" }, take: 1 },
      verificaciones: { orderBy: { fechaVerificacion: "desc" }, take: 1 },
    },
  })

  let resultados = clientes.map((c) => {
    const ahora = new Date()
    const evalVigente = c.evaluacionesRiesgo[0]
    const evalValida = evalVigente && (ahora.getTime() - evalVigente.fecha.getTime()) < 365 * 86400000
    const screenVigente = c.verificaciones[0]
    const screenValido = screenVigente && (ahora.getTime() - screenVigente.fechaVerificacion.getTime()) < 365 * 86400000
    const docsVencidos = c.documentos.filter((d) => d.fechaVencimiento && d.fechaVencimiento < ahora).length

    const items = [
      { id: "eval-riesgo", cumple: !!evalValida },
      { id: "beneficiarios", cumple: c.beneficiarios.length > 0 },
      { id: "documentacion", cumple: c.documentos.length > 0 },
      { id: "screening", cumple: !!screenValido },
      { id: "docs-vencidos", cumple: docsVencidos === 0 },
      { id: "expediente-completo", cumple: c.completado },
    ]

    const cumplidos = items.filter((i) => i.cumple).length
    const score = Math.round((cumplidos / items.length) * 100)
    const brechas = items.filter((i) => !i.cumple).length

    return {
      clienteId: c.id,
      nombre: c.nombreCompleto,
      tipo: c.tipo,
      nivelRiesgo: c.nivelRiesgo,
      score,
      brechas,
      fechaUltimaEvaluacion: c.fechaEvaluacionRiesgo?.toISOString() || null,
    }
  })

  // Apply filters
  if (nombreFilter) {
    resultados = resultados.filter((r) => r.nombre.toLowerCase().includes(nombreFilter))
  }
  if (nivelFilter) {
    resultados = resultados.filter((r) => r.nivelRiesgo === nivelFilter)
  }
  if (tipoFilter) {
    resultados = resultados.filter((r) => r.tipo === tipoFilter)
  }
  if (brechasFilter === "con") {
    resultados = resultados.filter((r) => r.brechas > 0)
  } else if (brechasFilter === "sin") {
    resultados = resultados.filter((r) => r.brechas === 0)
  }

  // Sort
  const sort = searchParams.get("sort") || "nombre"
  const order = searchParams.get("order") || "asc"
  resultados.sort((a, b) => {
    const valA = (a as any)[sort]
    const valB = (b as any)[sort]
    if (typeof valA === "string") {
      return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    return order === "asc" ? valA - valB : valB - valA
  })

  const total = resultados.length
  const scorePromedio = total > 0 ? Math.round(resultados.reduce((s, r) => s + r.score, 0) / total) : 0
  const conBrechas = resultados.filter((r) => r.brechas > 0).length

  return NextResponse.json({
    resumen: { total, scorePromedio, conBrechas },
    clientes: resultados,
  })
}
