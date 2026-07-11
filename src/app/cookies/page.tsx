import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies — DDC-SSNF",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Política de Cookies</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Última actualización: julio de 2026
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">¿Qué son las cookies?</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando
          visitas un sitio web. DDC-SSNF utiliza exclusivamente las cookies necesarias para
          su funcionamiento. No usamos cookies de publicidad ni de rastreo de terceros.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Cookies que utilizamos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 pr-4 font-semibold">Categoría</th>
                <th className="pb-2 pr-4 font-semibold">Propósito</th>
                <th className="pb-2 pr-4 font-semibold">Ejemplo</th>
                <th className="pb-2 font-semibold">¿Requiere consentimiento?</th>
              </tr>
            </thead>
            <tbody className="text-zinc-600 dark:text-zinc-400">
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Estrictamente necesarias
                </td>
                <td className="py-2 pr-4">
                  Mantener la sesión iniciada, funcionamiento básico del sitio
                </td>
                <td className="py-2 pr-4">Cookie de sesión de Clerk</td>
                <td className="py-2">No — indispensables para el funcionamiento</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Preferencias
                </td>
                <td className="py-2 pr-4">
                  Recordar configuración del usuario (aceptación de cookies, idioma)
                </td>
                <td className="py-2 pr-4">Preferencia de cookies</td>
                <td className="py-2">Sí</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Analítica
                </td>
                <td className="py-2 pr-4">
                  Medir uso agregado del producto para mejorar la experiencia
                </td>
                <td className="py-2 pr-4">Ninguna por ahora</td>
                <td className="py-2">Sí, se implementará solo con consentimiento</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Facturación
                </td>
                <td className="py-2 pr-4">
                  Procesar el cobro recurrente y gestionar el plan contratado
                </td>
                <td className="py-2 pr-4">Cookies del procesador de pago</td>
                <td className="py-2">No — necesarias para el servicio contratado</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Cookies que NO utilizamos</h2>
        <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
          <li>Cookies de publicidad comportamental o segmentación.</li>
          <li>Cookies de redes sociales o botones de «Me gusta» de terceros.</li>
          <li>Cookies de rastreo entre sitios (cross-site tracking).</li>
          <li>Cookies de terceros no esenciales para la operación del servicio.</li>
        </ul>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Este producto maneja datos sensibles de cumplimiento AML; introducir rastreo
          publicitario sería contradictorio con la confianza que necesitamos transmitir.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Cómo gestionar tus preferencias</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Al visitar el sitio por primera vez, se muestra un banner donde puedes aceptar
          todas las cookies o solo las estrictamente necesarias. Puedes cambiar tu
          preferencia en cualquier momento eliminando las cookies almacenadas desde la
          configuración de tu navegador.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Contacto</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Para consultas sobre el uso de cookies, escribe a:{' '}
          <a href="mailto:avilajoser8@gmail.com" className="underline">
            avilajoser8@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
