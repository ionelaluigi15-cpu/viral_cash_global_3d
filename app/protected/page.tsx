
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email, username, balance, points, status, created_at")
    .eq("id", userId)
    .single();

  return (
    <main className="min-h-screen bg-[#08090d] text-white p-6">
      <div className="mx-auto max-w-5xl space-y-8">

        <header className="border-b border-[#d9b568]/30 pb-6">
          <h1 className="text-3xl font-black tracking-wide text-[#d9b568]">
            VIRAL CASH GLOBAL
          </h1>
          <p className="mt-2 text-gray-400">
            La tua area personale
          </p>
        </header>

        {error || !profile ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5">
            <h2 className="font-bold text-red-400">
              Profilo non disponibile
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Il tuo account è autenticato, ma il profilo non è ancora
              disponibile nel database.
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">
              <p className="text-sm tracking-[0.2em] text-[#d9b568]">
                ACCOUNT PERSONALE
              </p>

              <h2 className="mt-4 text-2xl font-bold">
                Benvenuto, {profile.username || "Utente"}
              </h2>

              <p className="mt-2 break-all text-gray-400">
                {profile.email}
              </p>

              <div className="mt-4 inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-400">
                Account {profile.status}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">
                <p className="text-sm text-gray-400">
                  SALDO DISPONIBILE
                </p>
                <p className="mt-3 text-4xl font-bold text-[#d9b568]">
                  € {Number(profile.balance).toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">
                <p className="text-sm text-gray-400">
                  PUNTI TOTALI
                </p>
                <p className="mt-3 text-4xl font-bold text-[#d9b568]">
                  {profile.points}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">
              <h3 className="text-lg font-bold text-[#d9b568]">
                Informazioni account
              </h3>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Username</span>
                  <span>{profile.username || "Non impostato"}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Stato</span>
                  <span>{profile.status}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Registrazione</span>
                  <span>
                    {new Date(profile.created_at).toLocaleDateString("it-IT")}
                  </span>
                </div>
              </div>
            </section>
          </>
        )}

        <footer className="border-t border-[#d9b568]/20 pt-5 text-center text-xs text-gray-500">
          VIRAL CASH GLOBAL · Secure Personal Dashboard
        </footer>

      </div>
    </main>
  );
}
