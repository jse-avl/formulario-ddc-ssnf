'use client'

import { useState } from 'react'

type SanctionsMatch = {
  score: number
  match: boolean
  matchedName: string
  type: string
  program: string
}

type ApiResponse = {
  query: string
  timestamp: string
  total_matches: number
  results: SanctionsMatch[]
}

function getBadge(score: number) {
  if (score >= 90) return { label: 'Match confirmado', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  if (score >= 70) return { label: 'Posible match', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
  return { label: 'Sin match', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
}

function formatType(type: string): string {
  if (type === 'I') return 'Individual'
  if (type === 'E') return 'Entidad'
  return 'Otro'
}

export default function SanctionsCheck() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState('')

  async function handleCheck() {
    if (name.length < 3) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`/api/sanctions/check?name=${encodeURIComponent(name)}`)
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Error al verificar')
        return
      }
      setResult(await res.json())
    } catch {
      setError('Error de conexión al verificar listas de sanciones')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Verificar contra listas de sanciones</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Consulta las listas OFAC (SDN) y ONU en busca de coincidencias con el nombre ingresado.
        Esta verificación es un registro interno; el reporte formal a la UAF debe hacerse por los
        canales oficiales establecidos.
      </p>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Nombre completo del cliente o beneficiario"
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-800"
          minLength={3}
        />
        <button
          onClick={handleCheck}
          disabled={loading || name.length < 3}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div>
          {result.results.length === 0 ? (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              No se encontraron coincidencias en las listas de sanciones para{' '}
              <strong>{result.query}</strong>.
            </div>
          ) : (
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Se encontraron {result.total_matches} posible(s) coincidencia(s):
              </p>
              <div className="space-y-2">
                {result.results.map((r, i) => {
                  const badge = getBadge(r.score)
                  return (
                    <div key={r.matchedName} className="rounded-md border p-3 text-sm">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.class}`}>
                          {badge.label} ({r.score}%)
                        </span>
                        <span className="text-xs text-zinc-400">
                          {formatType(r.type)}
                        </span>
                      </div>
                      <p className="font-medium">{r.matchedName}</p>
                      {r.program && (
                        <p className="text-xs text-zinc-400">Programa: {r.program}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-zinc-400">
            Verificado el {new Date(result.timestamp).toLocaleString('es-PA')}
          </p>
        </div>
      )}
    </div>
  )
}
