
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Wallet,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

export default async function ProtectedPage() {
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = data.claims.email ?? "Utente";

  return (
    <main className="min-h-screen bg-[#08090d] text-white px-5 py-10">
      <div className="mx-auto max-w-6xl">

        <header className="mb-10">
          <p className="text-[#d9b568] tracking-[0.3em] text-sm">
            VIRAL CASH GLOBAL
          </p>

          <h1 className="mt-4 text-3xl md:text-5xl font-bold">
            BENVENUTO NELLA{" "}
            <span className="text-[#d9b568]">
              DASHBOARD
            </span>
          </h1>

          <p className="mt-3 text-gray-400">
            Account: {email}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          <div className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">
            <Wallet className="text-[#d9b568]" />
            <p className="mt-4 text-gray-400">Saldo</p>
            <h2 className="text-3xl font-bold mt-2">€0.00</h2>
          </div>

          <div className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">
            <TrendingUp className="text-[#d9b568]" />
            <p className="mt-4 text-gray-400">Guadagni</p>
            <h2 className="text-3xl font-bold mt-2">€0.00</h2>
          </div>

          <div className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">
            <Activity className="text-[#d9b568]" />
            <p className="mt-4 text-gray-400">Attività</p>
            <h2 className="text-3xl font-bold mt-2">0</h2>
          </div>

          <div className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">
            <Users className="text-[#d9b568]" />
            <p className="mt-4 text-gray-400">Community</p>
            <h2 className="text-3xl font-bold mt-2">0</h2>
          </div>

        </section>

        <section className="mt-10 rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">
          <h2 className="text-xl font-bold text-[#d9b568]">
            La tua attività
          </h2>

          <p className="mt-3 text-gray-400">
            La dashboard è pronta per collegare le attività reali,
            i social network, le campagne e il sistema di guadagno.
          </p>
        </section>

      </div>
    </main>
  );
}
