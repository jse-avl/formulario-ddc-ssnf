import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto — DDC-SSNF",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Contacto</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Desarrollador / Administrador</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          <strong>Correo:</strong>{' '}
          <a href="mailto:avilajoser8@gmail.com" className="underline">
            avilajoser8@gmail.com
          </a>
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Respuesta en máximo 24 horas hábiles para incidencias bloqueantes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">¿Para qué puedes escribirnos?</h2>
        <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
          <li>
            <strong>Reportes de errores o incidencias técnicas</strong> — también puedes usar
            el botón flotante de feedback dentro de la aplicación.
          </li>
          <li>
            <strong>Consultas sobre privacidad</strong> — ejercicio de derechos ARCO (Ley 81
            de 2019) o dudas sobre el tratamiento de datos.
          </li>
          <li>
            <strong>Soporte durante la prueba gratuita</strong> — dudas sobre el registro, el
            plan o el funcionamiento del sistema.
          </li>
          <li>
            <strong>Sugerencias o quejas</strong> — nos interesa mejorar el producto.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Aviso importante</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Para reportes formales de operaciones sospechosas, utiliza exclusivamente los
          canales oficiales de la Unidad de Análisis Financiero (UAF) de Panamá. Este
          contacto no sustituye ese conducto regulatorio.
        </p>
      </section>

      <section className="rounded-lg border bg-zinc-50 p-6 dark:bg-zinc-900">
        <h2 className="mb-3 text-xl font-semibold">Envíanos un mensaje</h2>
        <p className="mb-4 text-sm text-zinc-500">
          También puedes escribirnos directamente al correo desde tu cliente de email.
        </p>
        <a
          href="mailto:avilajoser8@gmail.com"
          className="inline-block rounded-md bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          Enviar correo
        </a>
      </section>
    </main>
  );
}
