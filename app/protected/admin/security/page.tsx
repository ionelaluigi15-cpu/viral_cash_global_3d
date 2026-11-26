import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Link from "next/link";

import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Wallet,
  Activity,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Database,
} from "lucide-react";

export default async function SecurityPage() {
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return (
      <main className="p-6 text-white">
        Configurazione server non disponibile.
      </main>
    );
  }

  const db = createServiceClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const [
    walletResult,
    rewardResult,
    transactionResult,
    participationResult,
    adminResult,
  ] = await Promise.all([
    db.from("wallets")
      .select("user_id,balance,currency", { count: "exact" })
      .limit(1000),

    db.from("reward_transactions")
      .select(
        "user_id,participation_id,amount,status,transaction_type",
        { count: "exact" }
      )
      .limit(1000),

    db.from("wallet_transactions")
      .select(
        "user_id,amount,reference_id,transaction_type",
        { count: "exact" }
      )
      .limit(1000),

    db.from("campaign_participations")
      .select(
        "id,user_id,status,reward_amount",
        { count: "exact" }
      )
      .limit(1000),

    db.from("admin_users")
      .select("user_id", { count: "exact" })
      .limit(1000),
  ]);

  const results = [
    walletResult,
    rewardResult,
    transactionResult,
    participationResult,
    adminResult,
  ];

  const incomplete = results.some(
    (result) =>
      result.error ||
      result.count === null ||
      result.count !== result.data?.length
  );

  if (incomplete) {
    return (
      <main className="min-h-screen bg-[#08090d] p-6 text-white">
        <Link
          href="/protected/admin"
          className="text-[#d9b568]"
        >
          Torna al pannello Admin
        </Link>

        <h1 className="mt-8 text-2xl font-bold">
          Controlli non disponibili
        </h1>

        <p className="mt-4 text-yellow-400">
          Impossibile verificare tutti i dati.
          Nessun esito di sicurezza confermato.
        </p>
      </main>
    );
  }

  const wallets = walletResult.data ?? [];
  const rewards = rewardResult.data ?? [];
  const transactions = transactionResult.data ?? [];
  const participations = participationResult.data ?? [];
  const admins = adminResult.data ?? [];

  const cents = (value: unknown) =>
    Math.round(Number(value) * 100);

  const invalidWallets = wallets.filter(
    (wallet) =>
      !Number.isFinite(Number(wallet.balance)) ||
      Number(wallet.balance) < 0
  ).length;

  const unsupportedWallets = wallets.filter(
    (wallet) => wallet.currency !== "EUR"
  ).length;

  const earnings = rewards.filter(
    (reward) => reward.transaction_type === "earning"
  );

  const rewardTransactions = transactions.filter(
    (transaction) =>
      transaction.transaction_type === "reward"
  );

  const unsupportedOperations =
    transactions.length - rewardTransactions.length +
    rewards.length - earnings.length;

  const rewardKeys = new Set<string>();
  let duplicateRewards = 0;

  for (const reward of earnings) {
    if (!reward.participation_id) continue;

    const key = String(reward.participation_id);

    if (rewardKeys.has(key)) {
      duplicateRewards++;
    }

    rewardKeys.add(key);
  }

  const transactionKeys = new Set<string>();
  let duplicateTransactions = 0;

  for (const transaction of rewardTransactions) {
    if (!transaction.reference_id) continue;

    const key = String(transaction.reference_id);

    if (transactionKeys.has(key)) {
      duplicateTransactions++;
    }

    transactionKeys.add(key);
  }

  const participationMap = new Map(
    participations.map((p) => [p.id, p])
  );

  const invalidRewards = earnings.filter((reward) => {
    const participation = participationMap.get(
      reward.participation_id
    );

    return (
      !participation ||
      participation.status !== "approved" ||
      participation.user_id !== reward.user_id ||
      reward.status !== "approved" ||
      !Number.isFinite(Number(reward.amount)) ||
      Number(reward.amount) <= 0 ||
      cents(participation.reward_amount) !==
        cents(reward.amount)
    );
  }).length;

  const invalidTransactions = rewardTransactions.filter(
    (transaction) => {
      const participation = participationMap.get(
        transaction.reference_id
      );

      return (
        !participation ||
        participation.status !== "approved" ||
        participation.user_id !== transaction.user_id ||
        !Number.isFinite(Number(transaction.amount)) ||
        Number(transaction.amount) <= 0 ||
        cents(participation.reward_amount) !==
          cents(transaction.amount)
      );
    }
  ).length;

  const missingCredits = participations.filter((p) => {
    const amount = Number(p.reward_amount);

    if (!Number.isFinite(amount) || amount < 0) {
      return true;
    }

    if (p.status !== "approved") {
      return amount !== 0;
    }

    if (amount === 0) return false;

    const matchingRewards = earnings.filter(
      (r) =>
        r.participation_id === p.id &&
        r.user_id === p.user_id &&
        r.status === "approved" &&
        cents(r.amount) === cents(p.reward_amount)
    );

    const matchingTransactions =
      rewardTransactions.filter(
        (t) =>
          t.reference_id === p.id &&
          t.user_id === p.user_id &&
          cents(t.amount) === cents(p.reward_amount)
      );

    return (
      matchingRewards.length !== 1 ||
      matchingTransactions.length !== 1
    );
  }).length;

  const walletUsers = new Set(
    wallets.map((wallet) => wallet.user_id)
  );

  const missingWallets = new Set(
    [
      ...earnings.map((r) => r.user_id),
      ...rewardTransactions.map((t) => t.user_id),
    ].filter((id) => !walletUsers.has(id))
  ).size;

  const inconsistentWallets = wallets.filter(
    (wallet) => {
      const total = rewardTransactions
        .filter((t) => t.user_id === wallet.user_id)
        .reduce((sum, t) => sum + cents(t.amount), 0);

      return cents(wallet.balance) !== total;
    }
  ).length;

  const checks = [
    {
      title: "Portafogli non validi",
      value: invalidWallets,
    },
    {
      title: "Valute non supportate",
      value: unsupportedWallets,
    },
    {
      title: "Operazioni fuori dal perimetro TEST",
      value: unsupportedOperations,
    },
    {
      title: "Ricompense duplicate",
      value: duplicateRewards,
    },
    {
      title: "Transazioni duplicate",
      value: duplicateTransactions,
    },
    {
      title: "Ricompense non coerenti",
      value: invalidRewards,
    },
    {
      title: "Transazioni non coerenti",
      value: invalidTransactions,
    },
    {
      title: "Candidature con accrediti incoerenti",
      value: missingCredits,
    },
    {
      title: "Portafogli mancanti",
      value: missingWallets,
    },
    {
      title: "Differenze nei saldi individuali",
      value: inconsistentWallets,
    },
  ];

  const failedChecks = checks.filter(
    (check) => check.value > 0
  ).length;

  const securityPassed = failedChecks === 0;

  const metrics = [
    {
      title: "Amministratori",
      value: admins.length,
      icon: Users,
    },
    {
      title: "Portafogli controllati",
      value: wallets.length,
      icon: Wallet,
    },
    {
      title: "Controlli superati",
      value: checks.length - failedChecks,
      icon: ShieldCheck,
    },
    {
      title: "Controlli con anomalie",
      value: failedChecks,
      icon: ShieldAlert,
    },
  ];

  return (
    <main className="min-h-screen bg-[#08090d] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/protected/admin"
          className="mb-8 flex items-center gap-2 text-[#d9b568]"
        >
          <ArrowLeft size={20} />
          Torna al pannello Admin
        </Link>

        <header className="mb-10">
          <p className="text-sm tracking-[0.3em] text-[#d9b568]">
            VIRAL CASH GLOBAL
          </p>

          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            GLOBAL SECURITY{" "}
            <span className="text-[#d9b568]">
              CONTROL CENTER
            </span>
          </h1>

          <p className="mt-4 text-gray-400">
            Monitoraggio amministrativo e controllo
            preliminare delle anomalie finanziarie.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">

          <div className="flex items-center gap-3 text-[#d9b568]">
            <Lock size={24} />
            <h2 className="text-lg font-bold">
              MODALITÀ SOLA LETTURA
            </h2>
          </div>

          <p className="mt-3 text-gray-400">
            Accesso amministrativo verificato.
            Nessuna modifica ai saldi,
            alle autorizzazioni o alle transazioni.
          </p>

          <p className="mt-3 break-all text-sm text-gray-500">
            Account: {user.email}
          </p>

        </section>

        <section className="grid grid-cols-2 gap-4">

          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.title}
                className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5"
              >
                <Icon
                  size={26}
                  className="text-[#d9b568]"
                />

                <p className="mt-3 text-sm text-gray-400">
                  {metric.title}
                </p>

                <p className="mt-2 text-3xl font-bold text-[#d9b568]">
                  {metric.value}
                </p>
              </article>
            );
          })}

        </section>

        <section className="mt-8 rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">

          <h2 className="text-xl font-bold text-[#d9b568]">
            STATO INTEGRITÀ
          </h2>

          {securityPassed ? (
            <div className="mt-5 flex items-center gap-3 text-green-400">
              <ShieldCheck size={30} />
              <p className="font-bold">
                Nessuna anomalia rilevata
                nei controlli eseguiti
              </p>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-3 text-red-400">
              <ShieldAlert size={30} />
              <p className="font-bold">
                Anomalie da verificare
              </p>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-400">
            Controllo preliminare per portafogli EUR
            con sole ricompense. Non costituisce
            una certificazione di sicurezza.
          </p>

        </section>

        <section className="mt-8 rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">

          <div className="flex items-center gap-3">
            <Activity className="text-[#d9b568]" />
            <h2 className="text-xl font-bold text-[#d9b568]">
              CONTROLLI DI SICUREZZA
            </h2>
          </div>

          <div className="mt-5 space-y-3">

            {checks.map((check) => (
              <article
                key={check.title}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#08090d] p-4"
              >
                <div className="flex items-center gap-3">

                  {check.value === 0 ? (
                    <CheckCircle2
                      size={22}
                      className="shrink-0 text-green-400"
                    />
                  ) : (
                    <AlertTriangle
                      size={22}
                      className="shrink-0 text-red-400"
                    />
                  )}

                  <p className="text-sm">
                    {check.title}
                  </p>

                </div>

                <span
                  className={
                    check.value === 0
                      ? "font-bold text-green-400"
                      : "font-bold text-red-400"
                  }
                >
                  {check.value}
                </span>

              </article>
            ))}

          </div>

        </section>

        <section className="mt-8 rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6">

          <div className="flex items-center gap-3">
            <Database className="text-[#d9b568]" />

            <h2 className="font-bold text-[#d9b568]">
              DATABASE MONITORING
            </h2>
          </div>

          <p className="mt-4 text-gray-400">
            Dati letti dal database al caricamento
            della pagina.
          </p>

          <p className="mt-3 text-sm text-yellow-400">
            Audit log, monitoraggio continuo,
            autenticazione multifattore e sistema
            antifrode avanzato da completare.
          </p>

          <Link
            href="/protected/admin/wallet"
            className="mt-5 block rounded-xl bg-[#d9b568] p-4 text-center font-bold text-black"
          >
            APRI CONTROLLO WALLET
          </Link>

        </section>

        <footer className="mt-10 border-t border-[#d9b568]/20 pt-6 text-center text-xs text-gray-500">
          VIRAL CASH GLOBAL © 2026

          <p className="mt-2 text-[#d9b568]">
            GLOBAL SECURITY CONTROL CENTER
          </p>
        </footer>

      </div>
    </main>
  );
}
