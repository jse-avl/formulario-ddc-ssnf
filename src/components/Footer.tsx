import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-zinc-50 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center gap-4 text-sm text-zinc-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} DDC-SSNF. Todos los derechos reservados.</p>
          <nav className="flex gap-4" aria-label="Enlaces legales">
            <Link href="/privacy" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Política de Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Cookies
            </Link>
            <Link href="/contact" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Contacto
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
