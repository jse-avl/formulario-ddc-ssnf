import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import InspectorPanel from "@/components/InspectorPanel"

function riesgoColor(nivel: string): string {
  if (nivel === "alto") return "text-red-600"
  if (nivel === "medio") return "text-yellow-600"
  return "text-green-600"
}

export const metadata: Metadata = { title: "Expediente — DDC-SSNF" }

export default async function ExpedientePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session.userId) return <div className="p-8 text-center">No autorizado</div>

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } })
  if (!user) return <div className="p-8 text-center">No autorizado</div>

  const { id } = await params
  const cliente = await prisma.cliente.findFirst({
    where: { id, usuarioId: user.id },
    include: { beneficiarios: true, documentos: true, evaluacionesRiesgo: { orderBy: { fecha: "desc" }, take: 1 } },
  })

  if (!cliente) notFound()

  const ultimaEval = cliente.evaluacionesRiesgo[0]
  const factores = ultimaEval ? JSON.parse(ultimaEval.factoresJson) : []

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 print:px-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold">Expediente de Debida Diligencia</h1>
        <div className="flex items-center gap-2">
          <InspectorPanel clienteId={cliente.id} />
          <button onClick={() => window.print()} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black">
            Exportar PDF (Ctrl+P)
          </button>
        </div>
      </div>

      <div className="mb-8 border-b pb-4">
        <h2 className="text-xl font-semibold">{cliente.nombreCompleto}</h2>
        <p className="text-sm text-zinc-500">ID: {cliente.numeroIdentificacion}</p>
        <p className="text-sm text-zinc-500">Tipo: {cliente.tipo.replace(/_/g, " ")}</p>
        <p className="text-sm text-zinc-500">
          Riesgo: <span className={`font-medium ${riesgoColor(cliente.nivelRiesgo)}`}>{cliente.nivelRiesgo.toUpperCase()}</span>
        </p>
        <p className="text-xs text-zinc-400">
          Versión: {cliente.versionNumero} · Generado: {new Date().toLocaleDateString("es-PA")}
        </p>
      </div>

      <section className="mb-6" id="datos-generales">
        <h3 className="mb-2 font-semibold">Datos generales</h3>
        <table className="w-full text-sm">
          <tbody>
            {[
              ["Dirección", cliente.direccion],
              ["Actividad declarada", cliente.actividadDeclarada],
              ["Jurisdicciones", cliente.jurisdiccionesOperacion],
              ["País de constitución", cliente.paisConstitucion],
              ["Fecha de inscripción", cliente.fechaInscripcion?.toLocaleDateString("es-PA")],
            ].map(([label, value]) => (
              <tr key={label} className="border-b">
                <td className="py-1 pr-4 font-medium text-zinc-500">{label}</td>
                <td className="py-1">{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {cliente.beneficiarios.length > 0 && (
        <section className="mb-6" id="beneficiarios">
          <h3 className="mb-2 font-semibold">Beneficiarios finales</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-4 font-medium">Nombre</th>
                <th className="py-1 pr-4 font-medium">ID</th>
                <th className="py-1 pr-4 font-medium">Participación</th>
                <th className="py-1 font-medium">Método</th>
              </tr>
            </thead>
            <tbody>
              {cliente.beneficiarios.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="py-1 pr-4">{b.nombreCompleto}</td>
                  <td className="py-1 pr-4">{b.numeroIdentificacion}</td>
                  <td className="py-1 pr-4">{b.porcentajeParticipacion}%</td>
                  <td className="py-1">{b.metodoIdentificacion.replace(/_/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {cliente.documentos.length > 0 && (
        <section className="mb-6" id="documentos">
          <h3 className="mb-2 font-semibold">Documentos</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-4 font-medium">Tipo</th>
                <th className="py-1 pr-4 font-medium">Fecha</th>
                <th className="py-1 font-medium">Verificado</th>
              </tr>
            </thead>
            <tbody>
              {cliente.documentos.map((d) => (
                <tr key={d.id} className="border-b">
                  <td className="py-1 pr-4">{d.tipoDocumento.replace(/_/g, " ")}</td>
                  <td className="py-1 pr-4">{d.fechaCarga.toLocaleDateString("es-PA")}</td>
                  <td className="py-1">{d.verificado ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {ultimaEval && (
        <section className="mb-6" id="evaluacion-riesgo">
          <h3 className="mb-2 font-semibold">Evaluación de riesgo</h3>
          <p className="mb-1 text-sm">
            Nivel: <strong>{ultimaEval.nivelResultante.toUpperCase()}</strong>
          </p>
          <p className="mb-2 text-xs text-zinc-500">
            Evaluado el {ultimaEval.fecha.toLocaleDateString("es-PA")}
          </p>
          <div className="space-y-1">
            {factores.map((f: any) => (
              <div key={f.nombre} className="flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 rounded-full ${f.activo ? "bg-red-500" : "bg-green-500"}`} />
                <span className={f.activo ? "" : "text-zinc-400 line-through"}>{f.nombre}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
