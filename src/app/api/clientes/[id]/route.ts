import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "node:crypto"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  if (searchParams.get("historico") === "true") {
    const cliente = await prisma.cliente.findFirst({
      where: { id, usuarioId: user.id },
    })
    if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    const versiones = await prisma.cliente.findMany({
      where: { versionGrupoId: cliente.versionGrupoId, usuarioId: user.id },
      orderBy: { versionNumero: "asc" },
      include: { beneficiarios: true, documentos: true, evaluacionesRiesgo: { orderBy: { fecha: "desc" }, take: 1 } },
    })

    return NextResponse.json(versiones)
  }

  const cliente = await prisma.cliente.findFirst({
    where: { id, usuarioId: user.id, vigente: true },
    include: { beneficiarios: true, documentos: true, evaluacionesRiesgo: { orderBy: { fecha: "desc" }, take: 1 } },
  })

  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(cliente)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const body = await req.json()

  const actual = await prisma.cliente.findFirst({
    where: { id, usuarioId: user.id, vigente: true },
    include: { beneficiarios: true },
  })

  if (!actual) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  // Mark current version as not vigente
  await prisma.cliente.update({
    where: { id },
    data: { vigente: false },
  })

  // Create new version
  const nuevoId = randomUUID()
  const nueva = await prisma.cliente.create({
    data: {
      id: nuevoId,
      usuarioId: user.id,
      tipo: body.tipo ?? actual.tipo,
      nombreCompleto: body.nombreCompleto ?? actual.nombreCompleto,
      tipoPersonaJuridica: body.tipoPersonaJuridica ?? actual.tipoPersonaJuridica,
      numeroIdentificacion: body.numeroIdentificacion ?? actual.numeroIdentificacion,
      paisConstitucion: body.paisConstitucion ?? actual.paisConstitucion,
      fechaInscripcion: body.fechaInscripcion ? new Date(body.fechaInscripcion) : actual.fechaInscripcion,
      direccion: body.direccion ?? actual.direccion,
      actividadDeclarada: body.actividadDeclarada ?? actual.actividadDeclarada,
      jurisdiccionesOperacion: body.jurisdiccionesOperacion ?? actual.jurisdiccionesOperacion,
      completado: body.completado ?? actual.completado,
      nivelRiesgo: actual.nivelRiesgo,
      versionGrupoId: actual.versionGrupoId,
      versionNumero: actual.versionNumero + 1,
      vigente: true,
    },
  })

  // Copy beneficiaries from old version to new
  if (actual.beneficiarios.length > 0) {
    await prisma.beneficiarioFinal.createMany({
      data: actual.beneficiarios.map((b) => ({
        clienteId: nuevoId,
        nombreCompleto: b.nombreCompleto,
        numeroIdentificacion: b.numeroIdentificacion,
        porcentajeParticipacion: b.porcentajeParticipacion,
        fechaAdquisicionCondicion: b.fechaAdquisicionCondicion,
        metodoIdentificacion: b.metodoIdentificacion,
      })),
    })
  }

  await prisma.logAuditoria.create({
    data: {
      usuarioId: user.id,
      accion: "CLIENTE_VERSIONADO",
      entidadAfectada: "Cliente",
      entidadId: nuevoId,
      detalle: JSON.stringify({
        versionAnterior: actual.versionNumero,
        versionNueva: actual.versionNumero + 1,
        grupoId: actual.versionGrupoId,
      }),
    },
  })

  return NextResponse.json(nueva)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const cliente = await prisma.cliente.findFirst({
    where: { id, usuarioId: user.id },
  })
  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.cliente.delete({ where: { id } })

  await prisma.logAuditoria.create({
    data: {
      usuarioId: user.id,
      accion: "CLIENTE_ELIMINADO",
      entidadAfectada: "Cliente",
      entidadId: id,
      detalle: JSON.stringify({ grupoId: cliente.versionGrupoId }),
    },
  })

  return NextResponse.json({ success: true })
}
