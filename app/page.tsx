
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#d9b568]/20">
        <h1 className="text-xl font-bold tracking-wider text-[#d9b568]">
          VIRAL CASH GLOBAL
        </h1>

        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-xl border border-[#d9b568]/40 hover:bg-[#d9b568]/10"
          >
            Accedi
          </Link>

          <Link
            href="/auth/sign-up"
            className="px-4 py-2 rounded-xl bg-[#d9b568] text-black font-semibold"
          >
            Registrati
          </Link>
        </div>
      </nav>

      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
        <p className="text-[#d9b568] tracking-[0.35em] text-sm mb-6">
          IL FUTURO DELLA MONETIZZAZIONE SOCIAL
        </p>

        <h2 className="text-5xl md:text-7xl font-extrabold leading-tight max-w-5xl">
          TRASFORMA LA TUA
          <span className="block text-[#d9b568]">
            PRESENZA SOCIAL
          </span>
          IN OPPORTUNITÀ
        </h2>

        <p className="mt-8 max-w-2xl text-gray-400 text-lg">
          Entra nel mondo VIRAL CASH GLOBAL.
          Connettiti, partecipa, crea opportunità e trasforma
          la tua attività online in un nuovo percorso digitale.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link
            href="/auth/sign-up"
            className="px-8 py-4 rounded-xl bg-[#d9b568] text-black font-bold hover:scale-105 transition"
          >
            INIZIA ORA
          </Link>

          <Link
            href="/auth/login"
            className="px-8 py-4 rounded-xl border border-[#d9b568] text-[#d9b568] hover:bg-[#d9b568]/10 transition"
          >
            ACCEDI
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-20 max-w-5xl w-full">
          {[
            ["SOCIAL", "Collega il tuo mondo social"],
            ["MICROTASK", "Partecipa alle attività digitali"],
            ["GLOBAL", "Esplora opportunità internazionali"],
          ].map(([title, description]) => (
            <div
              key={title}
              className="border border-[#d9b568]/20 bg-[#11141b] rounded-2xl p-7"
            >
              <h3 className="text-[#d9b568] font-bold text-xl mb-3">
                {title}
              </h3>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 border-t border-[#d9b568]/10 text-gray-500 text-sm">
        © 2026 VIRAL CASH GLOBAL — Digital Opportunities
      </footer>
    </main>
  );
}
