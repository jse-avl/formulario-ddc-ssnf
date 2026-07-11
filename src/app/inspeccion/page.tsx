import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import InspectorGlobalTable from "@/components/InspectorGlobalTable"

export default async function InspeccionPage() {
  const session = await auth()
  if (!session.userId) return null

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return null

  const totalClientes = await prisma.cliente.count({
    where: { usuarioId: user.id, vigente: true },
  })

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-bold tracking-tight">DDC-SSNF</span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Dashboard</Link>
          <Link href="/admin/reportes" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Reportes</Link>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Inspector Virtual SSNF</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Verifica el estado de cumplimiento de todos tus expedientes contra la Ley 23 de 2015 y guías SSNF.
            El inspector evalúa brechas automáticamente y te muestra qué necesita atención.
          </p>
        </div>

        {totalClientes === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="mb-2 text-zinc-500">No tienes clientes registrados aún.</p>
            <Link href="/clientes/nuevo" className="text-sm text-blue-600 underline hover:text-blue-800">
              Agregar tu primer cliente
            </Link>
          </div>
        ) : (
          <InspectorGlobalTable />
        )}
      </main>
    </div>
  )
}
