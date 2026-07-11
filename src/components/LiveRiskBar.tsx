'use client'

import { useState, useEffect, useRef } from 'react'

type SanctionsResult = {
  score: number
  match: boolean
  matchedName: string
}

type RiskFlag = {
  label: string
  activo: boolean
  peso: 'alto' | 'medio' | 'bajo'
}

const JURISDICCIONES_NO_COOPERANTES = [
  'iran', 'corea', 'norcorea', 'syria', 'syria', 'cuba', 'myanmar',
  'crimea', 'donetsk', 'luhansk',
]

const JURISDICCIONES_ALTO_RIESGO = [
  'panamá', 'panama', 'emiratos', 'uae', 'dubai', 'islas caiman',
  'british virgin', 'bvi', 'seychelles', 'belice', 'belize',
  'vanuatu', 'samoa', 'marshall',
]

const TIPOS_ALTO_RIESGO = [
  'casino', 'juego', 'gambling', 'exchange', 'crypto', 'cripto',
  'armas', 'weapons', 'petroleo', 'oil',
]

function normalize(s: string): string {
  return s.toLowerCase().trim()
}

export default function LiveRiskBar({
  nombreCompleto,
  tipo,
  tipoPersonaJuridica,
  paisConstitucion,
  jurisdiccionesOperacion,
  beneficiarios,
}: {
  nombreCompleto: string
  tipo: string
  tipoPersonaJuridica: string
  paisConstitucion: string
  jurisdiccionesOperacion: string
  beneficiarios: { nombreCompleto: string; numeroIdentificacion: string }[]
}) {
  const [ofacScore, setOfacScore] = useState(0)
  const [ofacLoading, setOfacLoading] = useState(false)
  const [ofacMatchName, setOfacMatchName] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (nombreCompleto.length < 3) {
      setOfacScore(0)
      setOfacMatchName('')
      return
    }
    setOfacLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/sanctions/check?name=${encodeURIComponent(nombreCompleto)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.results && data.results.length > 0) {
            setOfacScore(data.results[0].score)
            setOfacMatchName(data.results[0].matchedName)
          } else {
            setOfacScore(0)
            setOfacMatchName('')
          }
        }
      } catch { /* ignore */ }
      setOfacLoading(false)
    }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [nombreCompleto])

  const flags: RiskFlag[] = []

  // OFAC match
  if (nombreCompleto.length >= 3) {
    flags.push({
      label: ofacLoading ? 'Verificando OFAC...' : (ofacScore >= 70 ? `Match OFAC: "${ofacMatchName}" (${ofacScore}%)` : 'Sin coincidencia en listas OFAC'),
      activo: ofacScore >= 70,
      peso: ofacScore >= 90 ? 'alto' : 'medio',
    })
  }

  // Tipo de negocio / persona jurídica
  const tipoLower = normalize(tipo)
  const tipoJurLower = normalize(tipoPersonaJuridica)
  const esAltoTipo = TIPOS_ALTO_RIESGO.some(t => tipoLower.includes(t) || tipoJurLower.includes(t))
  if (tipo !== 'persona_natural') {
    flags.push({
      label: esAltoTipo ? `Tipo de actividad de alto riesgo: ${tipoPersonaJuridica || tipo}` : `Tipo: ${tipoPersonaJuridica || tipo}`,
      activo: esAltoTipo,
      peso: 'alto',
    })
  }

  // Jurisdicción no cooperante
  const jurLower = normalize(paisConstitucion)
  const jurOpLower = normalize(jurisdiccionesOperacion)
  const esNoCooperante = JURISDICCIONES_NO_COOPERANTES.some(j => jurLower.includes(j) || jurOpLower.includes(j))
  if (paisConstitucion) {
    flags.push({
      label: esNoCooperante ? `Jurisdicción no cooperante (GAFI): ${paisConstitucion}` : `País de constitución: ${paisConstitucion}`,
      activo: esNoCooperante,
      peso: 'alto',
    })
  }

  // Jurisdicción de alto riesgo
  const esAltoRiesgoJur = JURISDICCIONES_ALTO_RIESGO.some(j => jurLower.includes(j) || jurOpLower.includes(j))
  if (jurisdiccionesOperacion) {
    flags.push({
      label: esAltoRiesgoJur ? `Jurisdicción de alto riesgo en operaciones` : `Jurisdicciones de operación: ${jurisdiccionesOperacion}`,
      activo: esAltoRiesgoJur,
      peso: 'medio',
    })
  }

  // Beneficiarios sin identificación
  const benefSinId = beneficiarios.filter(b => b.nombreCompleto && !b.numeroIdentificacion)
  if (beneficiarios.some(b => b.nombreCompleto)) {
    flags.push({
      label: benefSinId.length > 0 ? `${benefSinId.length} beneficiario(s) sin identificación` : 'Beneficiarios identificados',
      activo: benefSinId.length > 0,
      peso: 'medio',
    })
  }

  // Calcular score total
  let score = 0
  for (const f of flags) {
    if (!f.activo) continue
    if (f.peso === 'alto') score += 30
    else if (f.peso === 'medio') score += 15
    else score += 5
  }
  score = Math.min(100, score)

  const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
  const textColor = score >= 70 ? 'text-red-700 dark:text-red-300' : score >= 40 ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'
  const bgColor = score >= 70 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : score >= 40 ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
  const nivel = score >= 70 ? 'ALTO' : score >= 40 ? 'MEDIO' : 'BAJO'

  if (flags.length === 0) return null

  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">Evaluación de riesgo en tiempo real</span>
        <span className={`text-sm font-bold ${textColor}`}>
          Riesgo: {nivel} ({score}%)
        </span>
      </div>

      {/* Barra */}
      <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Flags */}
      <div className="space-y-1">
        {flags.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${f.activo ? (f.peso === 'alto' ? 'bg-red-500' : 'bg-yellow-500') : 'bg-green-500'}`} />
            <span className={f.activo ? 'font-medium text-zinc-800 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-400'}>
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
