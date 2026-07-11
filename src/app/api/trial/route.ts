import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const hoy = new Date()
  const diasRestantes = user.fechaFinTrial
    ? Math.ceil((user.fechaFinTrial.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const expirado = diasRestantes !== null && diasRestantes <= 0
  const mostrarAviso = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 5

  return NextResponse.json({
    plan: user.planActual,
    fechaRegistro: user.fechaRegistro,
    fechaFinTrial: user.fechaFinTrial,
    diasRestantes: expirado ? 0 : diasRestantes,
    expirado,
    mostrarAviso,
    requiereBloqueo: expirado && user.planActual === "trial",
  })
}
