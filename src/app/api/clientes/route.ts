import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "node:crypto"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const versionGrupoId = searchParams.get("versionGrupoId")

  const where: any = { usuarioId: user.id, vigente: true }
  if (versionGrupoId) where.versionGrupoId = versionGrupoId

  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { fechaCreacion: "desc" },
    include: { _count: { select: { beneficiarios: true, documentos: true } } },
  })

  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const body = await req.json()
  const id = randomUUID()

  const cliente = await prisma.cliente.create({
    data: {
      id,
      usuarioId: user.id,
      tipo: body.tipo,
      nombreCompleto: body.nombreCompleto,
      tipoPersonaJuridica: body.tipoPersonaJuridica || null,
      numeroIdentificacion: body.numeroIdentificacion,
      paisConstitucion: body.paisConstitucion || null,
      fechaInscripcion: body.fechaInscripcion ? new Date(body.fechaInscripcion) : null,
      direccion: body.direccion || null,
      actividadDeclarada: body.actividadDeclarada || null,
      jurisdiccionesOperacion: body.jurisdiccionesOperacion || null,
      completado: body.completado || false,
      versionGrupoId: id,
      versionNumero: 1,
      vigente: true,
    },
  })

  await prisma.logAuditoria.create({
    data: {
      usuarioId: user.id,
      accion: "CLIENTE_CREADO",
      entidadAfectada: "Cliente",
      entidadId: cliente.id,
      detalle: JSON.stringify({ tipo: body.tipo, nombre: body.nombreCompleto }),
    },
  })

  return NextResponse.json(cliente, { status: 201 })
}
