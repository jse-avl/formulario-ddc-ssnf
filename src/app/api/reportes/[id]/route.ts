import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user || user.rol !== "admin_firma") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const estadosValidos = ["nuevo", "en_revision", "resuelto", "no_aplica"]
  if (body.estado && !estadosValidos.includes(body.estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  const data: any = { fechaActualizacion: new Date() }
  if (body.estado) data.estado = body.estado
  if (body.respuestaAdmin) data.respuestaAdmin = body.respuestaAdmin
  if (body.estado === "resuelto" || body.estado === "no_aplica") data.fechaResolucion = new Date()
  if (body.notificadoAlUsuario !== undefined) data.notificadoAlUsuario = body.notificadoAlUsuario

  await prisma.reporteUsuario.update({ where: { id }, data })

  await prisma.logAuditoria.create({
    data: {
      usuarioId: user.id,
      accion: "REPORTE_ACTUALIZADO",
      entidadAfectada: "ReporteUsuario",
      entidadId: id,
      detalle: JSON.stringify({ estado: body.estado }),
    },
  })

  return NextResponse.json({ success: true })
}
