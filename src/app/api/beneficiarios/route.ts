import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const body = await req.json()

  const cliente = await prisma.cliente.findFirst({
    where: { id: body.clienteId, usuarioId: user.id },
  })
  if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })

  const beneficiario = await prisma.beneficiarioFinal.create({
    data: {
      clienteId: body.clienteId,
      nombreCompleto: body.nombreCompleto,
      numeroIdentificacion: body.numeroIdentificacion,
      porcentajeParticipacion: body.porcentajeParticipacion,
      fechaAdquisicionCondicion: body.fechaAdquisicionCondicion ? new Date(body.fechaAdquisicionCondicion) : null,
      metodoIdentificacion: body.metodoIdentificacion,
    },
  })

  await prisma.logAuditoria.create({
    data: {
      usuarioId: user.id,
      accion: "BENEFICIARIO_CREADO",
      entidadAfectada: "BeneficiarioFinal",
      entidadId: beneficiario.id,
      detalle: JSON.stringify({ clienteId: body.clienteId, nombre: body.nombreCompleto }),
    },
  })

  return NextResponse.json(beneficiario, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const { id } = await req.json()

  const benef = await prisma.beneficiarioFinal.findFirst({
    where: { id, cliente: { usuarioId: user.id } },
  })
  if (!benef) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.beneficiarioFinal.delete({ where: { id } })

  await prisma.logAuditoria.create({
    data: {
      usuarioId: user.id,
      accion: "BENEFICIARIO_ELIMINADO",
      entidadAfectada: "BeneficiarioFinal",
      entidadId: id,
      detalle: JSON.stringify({ clienteId: benef.clienteId }),
    },
  })

  return NextResponse.json({ success: true })
}
