"use client"

import { useState } from "react"

type ItemInspeccion = {
  id: string
  titulo: string
  descripcion: string
  articulo: string
  cumple: boolean
  enlace: string
}

type ResultadoInspeccion = {
  clienteId: string
  clienteNombre: string
  score: number
  items: ItemInspeccion[]
  fecha: string
}

export default function InspectorPanel({ clienteId }: { clienteId: string }) {
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoInspeccion | null>(null)
  const [error, setError] = useState<string | null>(null)

  const verificar = async () => {
    if (resultado) {
      setAbierto(!abierto)
      return
    }

    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`/api/inspeccion/${clienteId}`)
      if (!res.ok) throw new Error("Error al verificar")
      const data = await res.json()
      setResultado(data)
      setAbierto(true)
    } catch {
      setError("No se pudo completar la verificación")
    } finally {
      setCargando(false)
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  function getScoreBg(score: number): string {
    if (score >= 80) return "border-green-200 bg-green-50 dark:bg-green-950/20"
    if (score >= 50) return "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
    return "border-red-200 bg-red-50 dark:bg-red-950/20"
  }

  const colorScore = resultado ? getScoreColor(resultado.score) : "text-red-600"
  const colorBg = resultado ? getScoreBg(resultado.score) : "border-red-200 bg-red-50 dark:bg-red-950/20"

  return (
    <div className="print:hidden">
      <button
        onClick={verificar}
        disabled={cargando}
        className="rounded-md bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-black dark:hover:bg-zinc-300"
        aria-label="Verificar cumplimiento normativo del expediente"
      >
        {cargando ? "Verificando..." : (resultado ? "Ocultar verificación" : "Verificar cumplimiento")}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
      )}

      {abierto && resultado && (
        <section
          className={`mt-4 rounded-lg border p-4 ${colorBg}`}
          aria-label="Resultado de verificación de cumplimiento"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Inspector Virtual SSNF</h3>
            <span className={`text-2xl font-bold ${colorScore}`}>{resultado.score}%</span>
          </div>

          <div className="space-y-2">
            {resultado.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-2 rounded-md border p-2 text-sm ${
                  item.cumple
                    ? "border-green-200 bg-white dark:bg-zinc-900"
                    : "border-red-200 bg-white dark:bg-zinc-900"
                }`}
              >
                <span className={`mt-0.5 text-base ${item.cumple ? "text-green-600" : "text-red-600"}`}>
                  {item.cumple ? "\u2713" : "\u2717"}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`font-medium ${item.cumple ? "" : "text-red-800 dark:text-red-300"}`}>
                      {item.titulo}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-400">{item.articulo}</span>
                  </div>
                  {!item.cumple && (
                    <p className="mt-0.5 text-xs text-zinc-500">{item.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-md bg-zinc-100 p-2 text-xs text-zinc-500 dark:bg-zinc-800">
            <strong>Nota importante:</strong> Esta verificación es una herramienta de apoyo basada en reglas
            generales de cumplimiento. Puede cometer errores o no reflejar todas las obligaciones aplicables
            al caso concreto. Consulte con un asesor legal para una evaluación definitiva.
          </div>
        </section>
      )}
    </div>
  )
}
