import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { evaluarRiesgo } from "@/lib/riesgo/evaluador"

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

  const resultado = await evaluarRiesgo(body.clienteId, user.id, body.factores)

  await prisma.logAuditoria.create({
    data: {
      usuarioId: user.id,
      accion: "RIESGO_EVALUADO",
      entidadAfectada: "Cliente",
      entidadId: body.clienteId,
      detalle: JSON.stringify({ nivel: resultado.nivel }),
    },
  })

  return NextResponse.json(resultado)
}
