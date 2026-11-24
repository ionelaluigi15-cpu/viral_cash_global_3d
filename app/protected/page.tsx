
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Wallet,
  TrendingUp,
  Activity,
  Megaphone,
} from "lucide-react";

export default async function ProtectedPage() {
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;
  const email = data.claims.email ?? "Utente";

  const [
    wallet,
    rewards,
    participations,
    campaigns,
    transactions,
  ] = await Promise.all([
    supabase
      .from("wallets")
      .select("balance, currency")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("reward_transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("transaction_type", "earning")
      .eq("status", "approved"),

    supabase
      .from("campaign_participations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),

    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("wallet_transactions")
      .select("amount, transaction_type, description")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const money = (value: number, currency = "EUR") =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency,
    }).format(value);

  const earnings = (rewards.data ?? []).reduce(
    (total, reward) => total + Number(reward.amount),
    0
  );

  const hasError = [
    wallet,
    rewards,
    participations,
    campaigns,
    transactions,
  ].some((result) => result.error);

  const cards = [
    {
      title: "Saldo Wallet",
      value: wallet.error
        ? "Non disponibile"
        : wallet.data
          ? money(
              Number(wallet.data.balance),
              wallet.data.currency
            )
          : "Wallet non creato",
      icon: Wallet,
    },
    {
      title: "Premi maturati",
      value: rewards.error
        ? "Non disponibile"
        : money(earnings),
      icon: TrendingUp,
    },
    {
      title: "Partecipazioni",
      value: participations.error
        ? "Non disponibile"
        : String(participations.count ?? 0),
      icon: Activity,
    },
    {
      title: "Campagne attive",
      value: campaigns.error
        ? "Non disponibile"
        : String(campaigns.count ?? 0),
      icon: Megaphone,
    },
  ];

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

        {hasError && (
          <div className="mb-6 rounded-xl border border-red-500/30 p-4 text-red-300">
            Alcuni dati non sono disponibili.
            Riprova più tardi.
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6"
            >
              <card.icon className="text-[#d9b568]" />

              <p className="mt-4 text-gray-400">
                {card.title}
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {card.value}
              </h2>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">

          <h2 className="text-xl font-bold text-[#d9b568]">
            Ultime transazioni
          </h2>

          {transactions.error ? (
            <p className="mt-4 text-red-300">
              Impossibile caricare le transazioni.
            </p>
          ) : !transactions.data?.length ? (
            <p className="mt-4 text-gray-400">
              Nessuna transazione registrata.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {transactions.data.map((transaction, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-4 rounded-xl border border-[#d9b568]/10 bg-[#08090d] p-4"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.description ||
                        transaction.transaction_type}
                    </p>

                    <p className="text-sm text-gray-400">
                      {transaction.transaction_type}
                    </p>
                  </div>

                  <p className="font-bold text-[#d9b568]">
                    {money(Number(transaction.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-gray-500">
          VIRAL CASH GLOBAL © 2026
          — GLOBAL CREATOR NETWORK
        </footer>

      </div>
    </main>
  );
}
