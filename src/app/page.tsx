import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-bold tracking-tight">DDC-SSNF</span>
        <AuthNav />
      </header>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Debida Diligencia para Profesionales Independientes
        </h1>
        <p className="mb-8 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Cumplimiento de la Ley 23 de 2015 y guías SSNF para abogados,
          contadores públicos autorizados y agentes residentes en Panamá.
        </p>
        <Link
          href="/sign-up"
          className="rounded-md bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          Comenzar prueba gratuita
        </Link>
        <p className="mt-2 text-xs text-zinc-400">30 días gratis, sin tarjeta requerida</p>
      </main>
    </div>
  );
}
