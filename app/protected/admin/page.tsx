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
  ArrowRight,
  Lock,
} from "lucide-react";

export default async function AdminPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

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
      href: "/protected/admin/users",
      active: true,
    },
    {
      title: "Gestione campagne",
      description: "Creazione e controllo campagne",
      icon: Megaphone,
      href: "/protected/admin/campaigns",
      active: true,
    },
    {
      title: "Candidature",
      description: "Approvazione e accredito ricompense",
      icon: Activity,
      href: "/protected/admin/participations",
      active: true,
    },
    {
      title: "Wallet",
      description: "Controllo dei saldi e delle transazioni",
      icon: Wallet,
      href: null,
      active: false,
    },
    {
      title: "Premi e ricompense",
      description: "Gestione degli accrediti delle campagne",
      icon: Trophy,
      href: "/protected/admin/participations",
      active: true,
    },
    {
      title: "Sicurezza",
      description: "Controlli e protezione antifrode",
      icon: Lock,
      href: null,
      active: false,
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

          <p className="mt-3 break-all text-gray-400">
            Account: {user.email}
          </p>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5">
            <p className="text-sm text-gray-400">
              Accessi ai moduli
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {modules.filter((m) => m.active).length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5">
            <p className="text-sm text-gray-400">
              Da completare
            </p>

            <p className="mt-2 text-3xl font-bold text-[#d9b568]">
              {modules.filter((m) => !m.active).length}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <article
                key={module.title}
                className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6"
              >
                <Icon
                  size={32}
                  className="text-[#d9b568]"
                />

                <h2 className="mt-4 text-xl font-bold">
                  {module.title}
                </h2>

                <p className="mt-2 text-gray-400">
                  {module.description}
                </p>

                {module.active && module.href ? (
                  <>
                    <p className="mt-5 text-sm text-green-400">
                      ● MODULO COLLEGATO
                    </p>

                    <Link
                      href={module.href}
                      className="mt-4 flex items-center justify-between rounded-xl bg-[#d9b568] px-4 py-3 font-bold text-black hover:bg-[#edce8b]"
                    >
                      APRI MODULO
                      <ArrowRight size={20} />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-5 text-sm text-yellow-400">
                      ● IN SVILUPPO
                    </p>

                    <div className="mt-4 rounded-xl border border-[#d9b568]/20 p-3 text-center text-sm text-gray-500">
                      Modulo da completare
                    </div>
                  </>
                )}
              </article>
            );
          })}

        </section>

        <section className="mt-10 rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">

          <div className="flex items-center gap-3">
            <Trophy
              size={28}
              className="text-[#d9b568]"
            />

            <h2 className="text-xl font-bold text-[#d9b568]">
              GLOBAL REWARD ENGINE
            </h2>
          </div>

          <p className="mt-4 text-gray-400">
            Motore automatico di approvazione
            e accredito delle ricompense.
          </p>

          <p className="mt-3 text-sm text-green-400">
            ✓ Motore SQL verificato
          </p>

          <p className="mt-2 text-sm text-green-400">
            ✓ Protezione doppio accredito testata
          </p>

          <p className="mt-2 text-sm text-green-400">
            ✓ Aggiornamenti diretti bloccati
          </p>

          <p className="mt-2 text-sm text-yellow-400">
            Test completo dal sito da eseguire
          </p>

          <Link
            href="/protected/admin/participations"
            className="mt-5 block rounded-xl bg-[#d9b568] p-4 text-center font-bold text-black"
          >
            GESTISCI RICOMPENSE
          </Link>

        </section>

        <section className="mt-8 rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">
          <h2 className="text-xl font-bold text-[#d9b568]">
            Sicurezza amministrativa
          </h2>

          <p className="mt-3 text-gray-400">
            Accesso riservato agli amministratori
            autorizzati nel database.
          </p>
        </section>

        <footer className="mt-10 border-t border-[#d9b568]/20 pt-6 text-center text-xs text-gray-500">
          VIRAL CASH GLOBAL © 2026

          <p className="mt-2 text-[#d9b568]">
            GLOBAL ADMIN CONTROL CENTER
          </p>

          <p className="mt-2">
            GLOBAL REWARD & WALLET ENGINE
          </p>
        </footer>

      </div>
    </main>
  );
}
