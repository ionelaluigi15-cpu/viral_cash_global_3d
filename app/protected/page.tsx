
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function ProtectedContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = String(data.claims.email ?? "Utente");

  return (
    <main className="min-h-screen bg-[#08090d] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <header className="flex flex-wrap justify-between items-center gap-4 border-b border-[#d9b568]/20 pb-6">
          <h1 className="text-2xl font-bold text-[#d9b568]">
            VIRAL CASH GLOBAL
          </h1>

          <p className="text-sm text-gray-400">
            {email}
          </p>
        </header>

        <section className="py-16">
          <p className="text-[#d9b568] tracking-widest text-sm">
            AREA PERSONALE
          </p>

          <h2 className="text-4xl md:text-6xl font-extrabold mt-4">
            BENVENUTO IN
            <span className="block text-[#d9b568]">
              VIRAL CASH GLOBAL
            </span>
          </h2>

          <p className="text-gray-400 mt-6 max-w-2xl">
            Il tuo spazio digitale per social, campagne,
            attività e opportunità di monetizzazione.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            ["SOCIAL", "Gestisci i tuoi collegamenti social"],
            ["MICROTASK", "Scopri le attività disponibili"],
            ["CAMPAGNE", "Esplora le campagne"],
            ["GUADAGNI", "Consulta saldo e progressi"],
            ["COMMUNITY", "Entra nella community globale"],
            ["ANALYTICS", "Monitora la tua attività"],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-7"
            >
              <h3 className="text-xl font-bold text-[#d9b568]">
                {title}
              </h3>

              <p className="text-gray-400 mt-3 text-sm">
                {description}
              </p>
            </div>
          ))}
        </section>

        <footer className="text-center text-gray-500 text-sm mt-16 border-t border-[#d9b568]/10 pt-6">
          VIRAL CASH GLOBAL © 2026
        </footer>

      </div>
    </main>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090d] text-[#d9b568] flex items-center justify-center">
          Caricamento VIRAL CASH GLOBAL...
        </div>
      }
    >
      <ProtectedContent />
    </Suspense>
  );
}
