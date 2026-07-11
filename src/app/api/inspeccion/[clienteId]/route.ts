import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { inspeccionarCliente } from "@/lib/inspeccion/verificador"

export async function GET(req: NextRequest, { params }: { params: Promise<{ clienteId: string }> }) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { clienteId } = await params
  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  try {
    const resultado = await inspeccionarCliente(clienteId, user.id)
    return NextResponse.json(resultado)
  } catch (e) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
  }
}
