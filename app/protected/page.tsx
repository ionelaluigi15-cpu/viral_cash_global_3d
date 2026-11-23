
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Wallet,
  Coins,
  UserRound,
  ShieldCheck,
  Activity,
} from "lucide-react";
export const dynamic = "force-dynamic";

export default async function ProtectedPage() {
  await connection();

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  const user = authData.user;

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, username, balance, points, status")
    .eq("id", user.id)
    .maybeSingle();

  const username = profile?.username || "Nuovo utente";
  const email = profile?.email || user.email || "Email non disponibile";
  const balance = Number(profile?.balance ?? 0);
  const points = Number(profile?.points ?? 0);
  const status = profile?.status || "active";

  return (
    <main className="min-h-screen bg-[#08090d] text-white px-5 py-10">
      <div className="mx-auto max-w-5xl space-y-8">

        <header>
          <p className="text-sm tracking-[0.3em] text-[#d9b568]">
            VIRAL CASH GLOBAL
          </p>

          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            AREA PERSONALE
          </h1>

          <p className="mt-3 text-gray-400">
            Benvenuto nella tua dashboard.
          </p>
        </header>

        <section className="rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#d9b568] bg-black text-[#d9b568]">
              <UserRound size={30} />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {username}
              </h2>
              <p className="break-all text-sm text-gray-400">
                {email}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-green-400">
            <ShieldCheck size={18} />
            Account autenticato
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">
            <div className="flex items-center gap-3 text-[#d9b568]">
              <Wallet size={22} />
              <span className="text-sm">SALDO DISPONIBILE</span>
            </div>

            <p className="mt-4 text-4xl font-bold">
              € {balance.toFixed(2)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Saldo registrato nel tuo account
            </p>
          </div>

          <div className="rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">
            <div className="flex items-center gap-3 text-[#d9b568]">
              <Coins size={22} />
              <span className="text-sm">PUNTI</span>
            </div>

            <p className="mt-4 text-4xl font-bold">
              {points.toLocaleString("it-IT")}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Punti accumulati
            </p>
          </div>

        </section>

        <section className="rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">
          <div className="flex items-center gap-3 text-[#d9b568]">
            <Activity size={22} />
            <h2 className="font-semibold">Stato account</h2>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-gray-400">Stato</span>

            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-400">
              {status}
            </span>
          </div>
        </section>

        <footer className="border-t border-[#d9b568]/20 pt-6 text-center text-sm text-gray-500">
          VIRAL CASH GLOBAL · IL TUO FUTURO INIZIA ONLINE
        </footer>

      </div>
    </main>
  );
}
