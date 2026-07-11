import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user || user.rol !== "admin_firma") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const reportes = await prisma.reporteUsuario.findMany({
    orderBy: [{ estado: "asc" }, { fechaCreacion: "desc" }],
    include: { usuario: { select: { nombre: true, email: true } } },
  })
  return NextResponse.json(reportes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const body = await req.json()

  if (!body.tipo || !body.descripcion) {
    return NextResponse.json({ error: "tipo y descripcion son requeridos" }, { status: 400 })
  }

  const tiposValidos = ["sugerencia", "problema", "mejora", "otro"]
  if (!tiposValidos.includes(body.tipo)) {
    return NextResponse.json({ error: "tipo inválido" }, { status: 400 })
  }

  const reporte = await prisma.reporteUsuario.create({
    data: {
      usuarioId: user.id,
      tipo: body.tipo,
      categoria: body.categoria || "otro",
      titulo: body.titulo || body.tipo,
      descripcion: body.descripcion,
      severidad: body.severidad || null,
      pantallaOrigen: body.pantallaOrigen || null,
      navegadorDispositivo: body.navegadorDispositivo || null,
    },
  })

  await prisma.logAuditoria.create({
    data: {
      usuarioId: user.id,
      accion: "REPORTE_CREADO",
      entidadAfectada: "ReporteUsuario",
      entidadId: reporte.id,
      detalle: JSON.stringify({ tipo: body.tipo, categoria: body.categoria }),
    },
  })

  return NextResponse.json(reporte, { status: 201 })
}
