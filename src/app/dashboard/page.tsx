import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import SanctionsCheck from "@/components/SanctionsCheck"

function riesgoBadgeClass(nivel: string): string {
  if (nivel === "alto") return "bg-red-100 text-red-800"
  if (nivel === "medio") return "bg-yellow-100 text-yellow-800"
  return "bg-green-100 text-green-800"
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session.userId) return null

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return null

  const [totalClientes, riesgoAlto, vencidos] = await Promise.all([
    prisma.cliente.count({ where: { usuarioId: user.id } }),
    prisma.cliente.count({ where: { usuarioId: user.id, nivelRiesgo: "alto" } }),
    prisma.cliente.count({
      where: { usuarioId: user.id, proximaActualizacionReq: { lte: new Date() } },
    }),
  ])

  const clientes = await prisma.cliente.findMany({
    where: { usuarioId: user.id },
    orderBy: { fechaCreacion: "desc" },
    take: 5,
  })

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-bold tracking-tight">DDC-SSNF</span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Inicio</Link>
          <Link href="/inspeccion" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Inspección</Link>
          <Link href="/admin/reportes" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Reportes</Link>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h2 className="mb-1 text-sm font-medium text-zinc-500">Clientes activos</h2>
            <p className="text-3xl font-bold">{totalClientes}</p>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="mb-1 text-sm font-medium text-zinc-500">Actualización vencida</h2>
            <p className="text-3xl font-bold">{vencidos}</p>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="mb-1 text-sm font-medium text-zinc-500">Riesgo alto</h2>
            <p className="text-3xl font-bold">{riesgoAlto}</p>
          </div>
        </div>

        {clientes.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Clientes recientes</h2>
            <div className="space-y-2">
              {clientes.map((c) => (
                <Link key={c.id} href={`/expediente/${c.id}`} className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <div>
                    <p className="font-medium">{c.nombreCompleto}</p>
                    <p className="text-xs text-zinc-400">{c.numeroIdentificacion} · {c.tipo.replace(/_/g, " ")}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${riesgoBadgeClass(c.nivelRiesgo)}`}>
                    {c.nivelRiesgo.toUpperCase()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-lg border bg-zinc-50 p-6 text-center dark:bg-zinc-900">
          <h2 className="mb-2 text-lg font-semibold">
            {clientes.length === 0 ? "Comienza a usar DDC-SSNF" : "Agregar otro cliente"}
          </h2>
          <Link
            href="/clientes/nuevo"
            className="inline-block rounded-md bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black"
          >
            {clientes.length === 0 ? "Agregar primer cliente" : "Nuevo cliente"}
          </Link>
        </div>

        <section className="mt-8">
          <SanctionsCheck />
        </section>
      </main>
    </div>
  )
}
