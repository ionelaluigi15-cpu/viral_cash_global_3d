import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">

      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b border-[#d9b568]/20 px-4 py-4 sm:px-6">

        <h1 className="text-sm font-bold tracking-wide text-[#d9b568] sm:text-xl">
          VIRAL CASH GLOBAL
        </h1>

        <div className="flex gap-2">
          <Link
            href="/auth/login"
            className="rounded-lg border border-[#d9b568]/40 px-3 py-2 text-xs sm:text-base"
          >
            Accedi
          </Link>

          <Link
            href="/auth/sign-up"
            className="rounded-lg bg-[#d9b568] px-3 py-2 text-xs font-semibold text-black sm:text-base"
          >
            Registrati
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 md:min-h-[85vh] md:py-20">

        <p className="mb-6 text-xs tracking-[0.18em] text-[#d9b568] sm:text-sm">
          IL FUTURO DELLA MONETIZZAZIONE SOCIAL
        </p>

        <h2 className="w-full max-w-5xl break-words text-[clamp(1.5rem,7vw,4.5rem)] font-extrabold leading-tight">
          TRASFORMA LA TUA

          <span className="block text-[#d9b568]">
            PRESENZA SOCIAL
          </span>

          IN OPPORTUNITÀ
        </h2>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-lg">
          Entra nel mondo VIRAL CASH GLOBAL.
          Connettiti, partecipa, crea opportunità
          e trasforma la tua attività online
          in un nuovo percorso digitale.
        </p>

        <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">

          <Link
            href="/auth/sign-up"
            className="rounded-xl bg-[#d9b568] px-3 py-3 text-sm font-bold text-black transition hover:bg-[#e5c782] sm:text-base"
          >
            INIZIA ORA
          </Link>

          <Link
            href="/auth/login"
            className="rounded-xl border border-[#d9b568] px-3 py-3 text-sm font-bold text-[#d9b568] transition hover:bg-[#d9b568]/10 sm:text-base"
          >
            ACCEDI
          </Link>

        </div>

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">

          {[
            ["SOCIAL", "Collega il tuo mondo social"],
            ["MICROTASK", "Partecipa alle attività digitali"],
            ["GLOBAL", "Esplora opportunità internazionali"],
          ].map(([title, description]) => (

            <div
              key={title}
              className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5 sm:p-7"
            >

              <h3 className="mb-2 text-lg font-bold text-[#d9b568]">
                {title}
              </h3>

              <p className="text-sm text-gray-400">
                {description}
              </p>

            </div>
          ))}

        </div>
      </section>

      <footer className="border-t border-[#d9b568]/10 px-4 py-6 text-center text-xs text-gray-500">
        © 2026 VIRAL CASH GLOBAL
        <p className="mt-2">
          GLOBAL CREATOR NETWORK
        </p>
      </footer>

    </main>
  );
}
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
