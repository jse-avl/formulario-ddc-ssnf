"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

type ClienteRow = {
  clienteId: string
  nombre: string
  tipo: string
  nivelRiesgo: string
  score: number
  brechas: number
  fechaUltimaEvaluacion: string | null
}

type Resumen = {
  total: number
  scorePromedio: number
  conBrechas: number
}

type SortField = "nombre" | "score" | "brechas" | "nivelRiesgo" | "tipo"

export default function InspectorGlobalTable() {
  const [data, setData] = useState<{ resumen: Resumen; clientes: ClienteRow[] } | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortField>("nombre")
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [nombreFilter, setNombreFilter] = useState("")
  const [nivelFilter, setNivelFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [brechasFilter, setBrechasFilter] = useState("")

  function buildParams(): URLSearchParams {
    const params = new URLSearchParams()
    if (nombreFilter) params.set("nombre", nombreFilter)
    if (nivelFilter) params.set("nivelRiesgo", nivelFilter)
    if (tipoFilter) params.set("tipoPersona", tipoFilter)
    if (brechasFilter) params.set("brechas", brechasFilter)
    params.set("sort", sort)
    params.set("order", order)
    return params
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`/api/inspeccion?${buildParams().toString()}`)
      if (!res.ok) throw new Error("Error al cargar")
      const json = await res.json()
      setData(json)
    } catch {
      setError("No se pudieron cargar los datos")
    } finally {
      setCargando(false)
    }
  }, [nombreFilter, nivelFilter, tipoFilter, brechasFilter, sort, order])

  useEffect(() => {
    cargar()
  }, [cargar])

  const toggleSort = (field: SortField) => {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc")
    } else {
      setSort(field)
      setOrder("asc")
    }
  }

  const sortArrow = (field: SortField) => {
    if (sort !== field) return ""
    return order === "asc" ? " \u25B2" : " \u25BC"
  }

  const colorScoreMap: Record<number, string> = { 80: "text-green-600", 50: "text-yellow-600" }
  const barColorMap: Record<number, string> = { 80: "bg-green-500", 50: "bg-yellow-500" }

  function colorScore(score: number): string {
    if (score >= 80) return colorScoreMap[80]
    if (score >= 50) return colorScoreMap[50]
    return "text-red-600"
  }

  function barColor(score: number): string {
    if (score >= 80) return barColorMap[80]
    if (score >= 50) return barColorMap[50]
    return "bg-red-500"
  }

  const riesgoBadgeMap: Record<string, string> = {
    alto: "bg-red-100 text-red-800",
    medio: "bg-yellow-100 text-yellow-800",
    bajo: "bg-green-100 text-green-800",
  }

  function riesgoBadge(nivel: string): string {
    return riesgoBadgeMap[nivel] || "bg-zinc-100 text-zinc-800"
  }

  function ariaSortValue(field: SortField): "ascending" | "descending" | "none" {
    if (sort !== field) return "none"
    return order === "asc" ? "ascending" : "descending"
  }

  return (
    <div>
      {/* Resumen */}
      {data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-zinc-500">Total clientes</p>
            <p className="text-2xl font-bold">{data.resumen.total}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-zinc-500">Cumplimiento promedio</p>
            <p className={`text-2xl font-bold ${colorScore(data.resumen.scorePromedio)}`}>
              {data.resumen.scorePromedio}%
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-zinc-500">Clientes con brechas</p>
            <p className={`text-2xl font-bold ${data.resumen.conBrechas > 0 ? "text-red-600" : "text-green-600"}`}>
              {data.resumen.conBrechas}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3" role="search" aria-label="Filtrar clientes">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={nombreFilter}
          onChange={(e) => setNombreFilter(e.target.value)}
          className="min-w-[180px] rounded-md border px-3 py-1.5 text-sm"
          aria-label="Filtrar por nombre"
        />
        <select
          value={nivelFilter}
          onChange={(e) => setNivelFilter(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
          aria-label="Filtrar por nivel de riesgo"
        >
          <option value="">Todos los riesgos</option>
          <option value="alto">Alto</option>
          <option value="medio">Medio</option>
          <option value="bajo">Bajo</option>
        </select>
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
          aria-label="Filtrar por tipo de persona"
        >
          <option value="">Todos los tipos</option>
          <option value="persona_natural">Persona Natural</option>
          <option value="persona_juridica">Persona Jurídica</option>
        </select>
        <select
          value={brechasFilter}
          onChange={(e) => setBrechasFilter(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
          aria-label="Filtrar por brechas"
        >
          <option value="">Con o sin brechas</option>
          <option value="con">Con brechas</option>
          <option value="sin">Sin brechas</option>
        </select>
      </div>

      {cargando && <p className="text-sm text-zinc-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      {/* Tabla */}
      {data && data.clientes.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                <th
                  className="cursor-pointer px-4 py-2 text-left font-medium"
                  onClick={() => toggleSort("nombre")}
                  role="columnheader"
                  aria-sort={ariaSortValue("nombre")}
                >
                  Nombre{sortArrow("nombre")}
                </th>
                <th
                  className="cursor-pointer px-4 py-2 text-left font-medium"
                  onClick={() => toggleSort("tipo")}
                  role="columnheader"
                  aria-sort={ariaSortValue("tipo")}
                >
                  Tipo{sortArrow("tipo")}
                </th>
                <th
                  className="cursor-pointer px-4 py-2 text-left font-medium"
                  onClick={() => toggleSort("nivelRiesgo")}
                  role="columnheader"
                  aria-sort={ariaSortValue("nivelRiesgo")}
                >
                  Riesgo{sortArrow("nivelRiesgo")}
                </th>
                <th
                  className="cursor-pointer px-4 py-2 text-left font-medium"
                  onClick={() => toggleSort("score")}
                  role="columnheader"
                  aria-sort={ariaSortValue("score")}
                >
                  Cumplimiento{sortArrow("score")}
                </th>
                <th
                  className="cursor-pointer px-4 py-2 text-left font-medium"
                  onClick={() => toggleSort("brechas")}
                  role="columnheader"
                  aria-sort={ariaSortValue("brechas")}
                >
                  Brechas{sortArrow("brechas")}
                </th>
                <th className="px-4 py-2 text-left font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.clientes.map((c) => (
                <tr key={c.clienteId} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-zinc-500">{c.tipo.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${riesgoBadge(c.nivelRiesgo)}`}>
                      {c.nivelRiesgo.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-200">
                        <div className={`h-full ${barColor(c.score)}`} style={{ width: `${c.score}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${colorScore(c.score)}`}>{c.score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {c.brechas > 0 ? (
                      <span className="font-medium text-red-600">{c.brechas}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/expediente/${c.clienteId}`}
                        className="text-xs text-blue-600 underline hover:text-blue-800"
                      >
                        Expediente
                      </Link>
                      <Link
                        href={`/expediente/${c.clienteId}`}
                        className="text-xs text-zinc-500 underline hover:text-zinc-700"
                      >
                        Verificar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.clientes.length === 0 && (
        <div className="rounded-lg border p-6 text-center text-sm text-zinc-500">
          No se encontraron clientes con los filtros seleccionados.
        </div>
      )}
    </div>
  )
}
