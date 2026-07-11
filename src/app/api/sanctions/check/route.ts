import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { loadSdnList } from '@/lib/sanctions/data'
import { matchNameBulk } from '@/lib/sanctions/matcher'
import { checkRateLimit } from '@/lib/rate-limiter'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const rate = checkRateLimit(`sanctions:${user.id}`, 20)
  if (!rate.allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta de nuevo en 5 minutos." }, { status: 429 })
  }

  const name = req.nextUrl.searchParams.get('name')
  if (!name || name.length < 3) {
    return NextResponse.json({ error: 'Se requiere un nombre de al menos 3 caracteres' }, { status: 400 })
  }

  const entries = await loadSdnList()
  const results = matchNameBulk(name, entries, 5)

  return NextResponse.json({
    query: name,
    timestamp: new Date().toISOString(),
    total_matches: results.length,
    results,
  })
}
