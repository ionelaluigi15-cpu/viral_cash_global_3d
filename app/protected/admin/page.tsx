import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Megaphone,
  Wallet,
  Activity,
  Trophy,
  ArrowLeft,
  Lock,
} from "lucide-react";

export default async function AdminPage() {
  await connection();

  const supabase = await createClient();

  const { data: { user }, error } =
    await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: admin, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError || !admin) {
    redirect("/protected");
  }

  const modules = [
    {
      title: "Gestione utenti",
      description: "Creator e profili registrati",
      icon: Users,
    },
    {
      title: "Gestione campagne",
      description: "Creazione e controllo campagne",
      icon: Megaphone,
    },
    {
      title: "Candidature",
      description: "Verifica e approvazione",
      icon: Activity,
    },
    {
      title: "Wallet",
      description: "Controllo dei saldi",
      icon: Wallet,
    },
    {
      title: "Premi e ricompense",
      description: "Gestione dei guadagni",
      icon: Trophy,
    },
    {
      title: "Sicurezza",
      description: "Controlli e protezione antifrode",
      icon: Lock,
    },
  ];

  return (
    <main className="min-h-screen bg-[#08090d] text-white px-5 py-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/protected"
          className="flex items-center gap-2 text-[#d9b568] mb-8"
        >
          <ArrowLeft size={20} />
          Torna alla dashboard
        </Link>

        <header className="mb-10">
          <p className="text-[#d9b568] tracking-[0.3em] text-sm">
            VIRAL CASH GLOBAL
          </p>

          <h1 className="mt-4 text-3xl md:text-5xl font-bold">
            GLOBAL ADMIN{" "}
            <span className="text-[#d9b568]">
              CONTROL CENTER
            </span>
          </h1>

          <div className="mt-6 flex items-center gap-3 text-[#d9b568]">
            <ShieldCheck />
            Amministratore autorizzato
          </div>

          <p className="mt-3 text-gray-400">
            Account: {user.email}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.title}
                className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6"
              >
                <Icon
                  size={30}
                  className="text-[#d9b568]"
                />

                <h2 className="mt-4 text-xl font-bold">
                  {module.title}
                </h2>

                <p className="mt-2 text-gray-400">
                  {module.description}
                </p>

                <p className="mt-5 text-sm text-[#d9b568]">
                  Modulo da collegare
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-10 rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">
          <h2 className="text-xl font-bold text-[#d9b568]">
            Sicurezza amministrativa
          </h2>

          <p className="mt-3 text-gray-400">
            Accesso riservato agli amministratori
            autorizzati nel database.
          </p>
        </section>

      </div>
    </main>
  );
}
