import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowLeft,
  Megaphone,
  Wallet,
  Globe,
} from "lucide-react";

export default async function AdminCampaignsPage() {
  await connection();

  const supabase = await createClient();

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
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

  const { data: campaigns, error } =
    await supabase
      .from("campaigns")
      .select("id,title,description,platform,reward,status,created_at")
      .order("created_at", { ascending: false });

  const money = (amount: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  return (
    <main className="min-h-screen bg-[#08090d] text-white px-5 py-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/protected/admin"
          className="inline-flex items-center gap-2 text-[#d9b568] mb-8"
        >
          <ArrowLeft size={20} />
          Torna al pannello Admin
        </Link>

        <p className="text-[#d9b568] tracking-widest">
          VIRAL CASH GLOBAL
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          GESTIONE{" "}
          <span className="text-[#d9b568]">
            CAMPAGNE
          </span>
        </h1>

        <p className="mt-4 text-gray-400">
          Monitoraggio amministrativo delle campagne.
        </p>

        <div className="my-8 rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">
          <Megaphone
            className="text-[#d9b568] mb-4"
            size={32}
          />

          <p className="text-[#d9b568]">
            CAMPAGNE VISIBILI
          </p>

          <p className="mt-3 text-4xl font-bold">
            {error ? "—" : campaigns?.length ?? 0}
          </p>
        </div>

        {error ? (
          <p className="text-red-400">
            Errore nel caricamento delle campagne.
          </p>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">

            {campaigns?.length === 0 && (
              <p>Nessuna campagna disponibile.</p>
            )}

            {campaigns?.map((campaign) => (
              <article
                key={campaign.id}
                className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6"
              >
                <div className="flex items-center gap-2 text-[#d9b568]">
                  <Globe size={20} />
                  {campaign.platform}
                </div>

                <h2 className="mt-4 text-2xl font-bold">
                  {campaign.title}
                </h2>

                <p className="mt-3 text-gray-400">
                  {campaign.description}
                </p>

                <div className="mt-5 rounded-xl bg-[#08090d] p-4">
                  <Wallet
                    className="text-[#d9b568] mb-2"
                    size={24}
                  />

                  <p className="text-gray-400">
                    Ricompensa prevista
                  </p>

                  <p className="text-3xl font-bold">
                    {money(Number(campaign.reward))}
                  </p>
                </div>

                <p className="mt-5 text-[#d9b568]">
                  Stato: {
                    campaign.status === "active"
                      ? "Attiva"
                      : campaign.status
                  }
                </p>
              </article>
            ))}
          </section>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          VIRAL CASH GLOBAL © 2026
          — ADMIN CONTROL CENTER
        </footer>

      </div>
    </main>
  );
      }
