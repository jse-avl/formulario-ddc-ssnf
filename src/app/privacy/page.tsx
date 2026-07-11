import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — DDC-SSNF",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Política de Privacidad</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Última actualización: julio de 2026
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">1. Responsable del tratamiento</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          DDC-SSNF es un sistema operado por José Ávila, actuando como desarrollador y
          administrador del sistema. Los usuarios del sistema (abogados, contadores públicos
          autorizados y agentes residentes) son los responsables directos del tratamiento de
          los datos de sus propios clientes. DDC-SSNF actúa como procesador técnico.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          2. Datos que recopilamos
        </h2>
        <h3 className="mb-2 font-medium">2.1 Datos del usuario registrado</h3>
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          Nombre completo, correo electrónico, nombre de firma o despacho, y datos de
          facturación. Estos son proporcionados directamente por el usuario al registrarse.
        </p>
        <h3 className="mb-2 font-medium">2.2 Datos de terceros (clientes del usuario)</h3>
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          El usuario carga en el sistema los datos de sus propios clientes para generar
          expedientes de debida diligencia: nombres, números de cédula o pasaporte, RUC,
          domicilio, documentos de identidad, y otra información requerida por la Ley 23 de
          2015 y las guías de la SSNF. El usuario es el responsable de haber recolectado
          estos datos con la base legal correspondiente.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">3. Finalidad del tratamiento</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Los datos se utilizan exclusivamente para: generar y mantener expedientes de debida
          diligencia, calcular nivel de riesgo según la normativa SSNF, verificar contra
          listas de sanciones (OFAC/ONU), operar el producto (facturación, soporte técnico,
          seguridad), y cumplir con las obligaciones de resguardo de registros de la Ley 23.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">4. Base legal del tratamiento</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          El tratamiento se fundamenta en el cumplimiento de una obligación legal aplicable
          al responsable del tratamiento (Ley 23 de 2015, Ley 124 de 2020, Decreto Ejecutivo
          No. 35 de 2022 y Acuerdo JD-02-2022 de la SSNF) y en el consentimiento del usuario
          para la operación del sistema.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          5. Destinatarios de los datos (transferencias a terceros)
        </h2>
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          Los datos se comparten exclusivamente con los proveedores estrictamente necesarios
          para la operación del sistema:
        </p>
        <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
          <li><strong>Clerk</strong> — autenticación y gestión de sesiones.</li>
          <li>
            <strong>Proveedor de screening de sanciones</strong> — verificación contra listas
            OFAC/ONU (solo nombres y país de origen).
          </li>
          <li>
            <strong>Procesador de pagos</strong> — facturación recurrente (Yappy, tarjeta de
            crédito/débito).
          </li>
          <li>
            <strong>Proveedor de hosting y base de datos</strong> — almacenamiento cifrado de
            los datos.
          </li>
        </ul>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          No compartimos datos con fines publicitarios ni de rastreo.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          6. Plazo de retención de los datos
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          La Ley 23 de 2015 (Art. 29) exige mantener los expedientes de debida diligencia
          por un plazo mínimo de 3 años para clientes de riesgo bajo y 1 año para clientes
          de riesgo alto. Una vez vencido el plazo de retención AML, los datos pueden ser
          eliminados en ejercicio de los derechos del titular bajo la Ley 81 de 2019. El
          sistema documenta la base legal de cada operación de retención o eliminación.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          7. Derechos ARCO (Ley 81 de 2019)
        </h2>
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          El titular de los datos personales tiene los siguientes derechos, ejercibles a
          través del usuario del sistema (abogado o contador):
        </p>
        <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
          <li>
            <strong>Acceso:</strong> solicitar confirmación de si sus datos están siendo
            procesados y obtener copia.
          </li>
          <li>
            <strong>Rectificación:</strong> solicitar corrección de datos inexactos o
            desactualizados.
          </li>
          <li>
            <strong>Cancelación (supresión):</strong> solicitar eliminación cuando ya no sean
            necesarios para la finalidad original, sujeto a los plazos de retención de la Ley
            23.
          </li>
          <li>
            <strong>Oposición:</strong> oponerse al tratamiento para fines específicos
            siempre que no interfiera con obligaciones legales del sujeto obligado.
          </li>
        </ul>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Para ejercer estos derechos, el titular debe contactar directamente al abogado o
          contador que utilizó el sistema. El usuario puede solicitar al administrador del
          sistema la extracción, modificación o eliminación de los datos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">8. Medidas de seguridad</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Implementamos cifrado en reposo (AES-256-GCM), cifrado en tránsito (TLS 1.3),
          autenticación multifactor (MFA), control de acceso a nivel de fila (RLS) en base de
          datos, y monitoreo de intentos de acceso no autorizados. Todos los documentos de
          identidad se almacenan cifrados con URLs firmadas de corta duración.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">9. Contacto para temas de privacidad</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Para cualquier consulta relacionada con la privacidad de datos o el ejercicio de
          derechos ARCO, escribe a:{' '}
          <a href="mailto:avilajoser8@gmail.com" className="underline">
            avilajoser8@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
