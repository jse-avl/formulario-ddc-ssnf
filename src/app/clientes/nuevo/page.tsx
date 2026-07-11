'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LiveRiskBar from '@/components/LiveRiskBar'

type FormData = {
  tipo: string
  nombreCompleto: string
  tipoPersonaJuridica: string
  numeroIdentificacion: string
  paisConstitucion: string
  fechaInscripcion: string
  direccion: string
  actividadDeclarada: string
  jurisdiccionesOperacion: string
}

const pasos = ['Tipo de cliente', 'Datos básicos', 'Beneficiario final', 'Documentos']

export default function NuevoClientePage() {
  const router = useRouter()
  const [paso, setPaso] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({
    tipo: 'persona_natural',
    nombreCompleto: '',
    tipoPersonaJuridica: '',
    numeroIdentificacion: '',
    paisConstitucion: '',
    fechaInscripcion: '',
    direccion: '',
    actividadDeclarada: '',
    jurisdiccionesOperacion: '',
  })
  const [beneficiarios, setBeneficiarios] = useState([{ nombreCompleto: '', numeroIdentificacion: '', porcentajeParticipacion: 25, metodoIdentificacion: 'accionario' }])

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateBenef(i: number, field: string, value: any) {
    setBeneficiarios((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b))
  }

  function addBenef() {
    setBeneficiarios((prev) => [...prev, { nombreCompleto: '', numeroIdentificacion: '', porcentajeParticipacion: 0, metodoIdentificacion: 'accionario' }])
  }

  function removeBenef(i: number) {
    setBeneficiarios((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, completado: true }),
      })
      if (!res.ok) throw new Error()
      const cliente = await res.json()

      for (const b of beneficiarios.filter(b => b.nombreCompleto)) {
        await fetch('/api/beneficiarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...b, clienteId: cliente.id, porcentajeParticipacion: Number(b.porcentajeParticipacion) }),
        })
      }

      router.push(`/expediente/${cliente.id}`)
    } catch {
      alert('Error al guardar el cliente')
    }
    setSaving(false)
  }

  function puedeAvanzar(): boolean {
    if (paso === 0) return !!form.tipo
    if (paso === 1) return form.nombreCompleto.length >= 3 && form.numeroIdentificacion.length >= 3
    return true
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">Agregar nuevo cliente</h1>

      <nav className="mb-8 flex" aria-label="Progreso del wizard">
        {pasos.map((p, i) => (
          <div key={p} className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${i <= paso ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800'}`}>
              {i + 1}
            </div>
            <span className={`ml-2 text-sm ${i <= paso ? 'font-medium' : 'text-zinc-400'}`}>{p}</span>
            {i < pasos.length - 1 && <div className="mx-4 h-px w-12 bg-zinc-300 dark:bg-zinc-600" />}
          </div>
        ))}
      </nav>

      <LiveRiskBar
        nombreCompleto={form.nombreCompleto}
        tipo={form.tipo}
        tipoPersonaJuridica={form.tipoPersonaJuridica}
        paisConstitucion={form.paisConstitucion}
        jurisdiccionesOperacion={form.jurisdiccionesOperacion}
        beneficiarios={beneficiarios}
      />

      {paso === 0 && (
        <div className="space-y-4">
          <label htmlFor="tipo" className="mb-1 block text-sm font-medium">Tipo de cliente</label>
          <select id="tipo" value={form.tipo} onChange={(e) => update('tipo', e.target.value)} className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800">
            <option value="persona_natural">Persona natural</option>
            <option value="persona_juridica">Persona jurídica</option>
            <option value="fideicomiso">Fideicomiso</option>
            <option value="fundacion">Fundación de interés privado</option>
          </select>
        </div>
      )}

      {paso === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="nombreCompleto" className="mb-1 block text-sm font-medium">Nombre completo *</label>
            <input id="nombreCompleto" value={form.nombreCompleto} onChange={(e) => update('nombreCompleto', e.target.value)} required className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800" />
          </div>
          <div>
            <label htmlFor="numeroIdentificacion" className="mb-1 block text-sm font-medium">Número de identificación (cédula/pasaporte/RUC) *</label>
            <input id="numeroIdentificacion" value={form.numeroIdentificacion} onChange={(e) => update('numeroIdentificacion', e.target.value)} required className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800" />
          </div>
          {form.tipo !== 'persona_natural' && (
            <>
              <div>
                <label htmlFor="tipoPersonaJuridica" className="mb-1 block text-sm font-medium">Tipo de persona jurídica</label>
                <select id="tipoPersonaJuridica" value={form.tipoPersonaJuridica} onChange={(e) => update('tipoPersonaJuridica', e.target.value)} className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800">
                  <option value="">Selecciona...</option>
                  <option value="sociedad_anonima">Sociedad Anónima</option>
                  <option value="srl">S.R.L.</option>
                  <option value="fundacion_interes_privado">Fundación de Interés Privado</option>
                  <option value="fideicomiso">Fideicomiso</option>
                  <option value="sucursal_extranjera">Sucursal Extranjera</option>
                </select>
              </div>
              <div>
                <label htmlFor="paisConstitucion" className="mb-1 block text-sm font-medium">País de constitución</label>
                <input id="paisConstitucion" value={form.paisConstitucion} onChange={(e) => update('paisConstitucion', e.target.value)} className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800" />
              </div>
              <div>
                <label htmlFor="fechaInscripcion" className="mb-1 block text-sm font-medium">Fecha de inscripción</label>
                <input id="fechaInscripcion" type="date" value={form.fechaInscripcion} onChange={(e) => update('fechaInscripcion', e.target.value)} className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800" />
              </div>
            </>
          )}
          <div>
            <label htmlFor="actividadDeclarada" className="mb-1 block text-sm font-medium">Actividad declarada</label>
            <input id="actividadDeclarada" value={form.actividadDeclarada} onChange={(e) => update('actividadDeclarada', e.target.value)} className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800" />
          </div>
          <div>
            <label htmlFor="direccion" className="mb-1 block text-sm font-medium">Dirección</label>
            <input id="direccion" value={form.direccion} onChange={(e) => update('direccion', e.target.value)} className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800" />
          </div>
          <div>
            <label htmlFor="jurisdiccionesOperacion" className="mb-1 block text-sm font-medium">Jurisdicciones donde opera</label>
            <input id="jurisdiccionesOperacion" value={form.jurisdiccionesOperacion} onChange={(e) => update('jurisdiccionesOperacion', e.target.value)} placeholder="Ej: Panamá, Estados Unidos" className="w-full rounded-md border px-3 py-2 dark:bg-zinc-800" />
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Registra los beneficiarios finales con participación ≥25%. Si nadie alcanza el umbral, deberás agregar una declaración jurada.
          </p>
          {beneficiarios.map((b, i) => (
            <div key={b.numeroIdentificacion || `benef-${i}`} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Beneficiario #{i + 1}</span>
                {beneficiarios.length > 1 && (
                  <button onClick={() => removeBenef(i)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={b.nombreCompleto} onChange={(e) => updateBenef(i, 'nombreCompleto', e.target.value)} placeholder="Nombre completo" className="rounded-md border px-3 py-2 text-sm dark:bg-zinc-800" />
                <input value={b.numeroIdentificacion} onChange={(e) => updateBenef(i, 'numeroIdentificacion', e.target.value)} placeholder="Cédula/Pasaporte" className="rounded-md border px-3 py-2 text-sm dark:bg-zinc-800" />
                <input type="number" value={b.porcentajeParticipacion} onChange={(e) => updateBenef(i, 'porcentajeParticipacion', e.target.value)} placeholder="% participación" className="rounded-md border px-3 py-2 text-sm dark:bg-zinc-800" />
                <select value={b.metodoIdentificacion} onChange={(e) => updateBenef(i, 'metodoIdentificacion', e.target.value)} className="rounded-md border px-3 py-2 text-sm dark:bg-zinc-800">
                  <option value="accionario">Por participación accionaria</option>
                  <option value="declaracion_jurada">Declaración jurada</option>
                  <option value="cargo_administrativo_superior">Cargo administrativo superior</option>
                </select>
              </div>
            </div>
          ))}
          <button onClick={addBenef} className="text-sm text-zinc-600 hover:text-zinc-900 underline">
            + Agregar otro beneficiario
          </button>
        </div>
      )}

      {paso === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Los documentos se podrán adjuntar después desde el expediente del cliente.
          </p>
          <div className="rounded-lg border bg-zinc-50 p-6 text-center dark:bg-zinc-900">
            <p className="text-sm text-zinc-600">Revisa que los datos sean correctos antes de guardar.</p>
            <p className="mt-1 text-sm font-medium">{form.nombreCompleto}</p>
            <p className="text-xs text-zinc-400">{form.tipo.replace(/_/g, ' ')} — {form.numeroIdentificacion}</p>
            {beneficiarios.filter(b => b.nombreCompleto).length > 0 && (
              <p className="mt-2 text-xs text-zinc-400">
                {beneficiarios.filter(b => b.nombreCompleto).length} beneficiario(s) final(es)
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {paso > 0 ? (
          <button onClick={() => setPaso(paso - 1)} className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Anterior
          </button>
        ) : <div />}
        {paso < pasos.length - 1 ? (
          <button onClick={() => setPaso(paso + 1)} disabled={!puedeAvanzar()} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black">
            Siguiente
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving} className="rounded-md bg-zinc-900 px-6 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black">
            {saving ? 'Guardando...' : 'Guardar expediente'}
          </button>
        )}
      </div>
    </div>
  )
}
