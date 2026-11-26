
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function money(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default async function AdminWalletPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

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

  const db = createAdminClient();

  const [walletResult, transactionResult, profileResult] =
    await Promise.all([
      db
        .from("wallets")
        .select("user_id,balance,currency", {
          count: "exact",
        })
        .order("user_id")
        .limit(100),

      db
        .from("wallet_transactions")
        .select(
          "id,user_id,amount,transaction_type,description,created_at",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .order("id")
        .limit(100),

      db
        .from("profiles")
        .select("id,email,username")
        .order("id")
        .limit(100),
    ]);

  const failed =
    walletResult.error ||
    transactionResult.error ||
    profileResult.error;

  const wallets = walletResult.data || [];
  const transactions = transactionResult.data || [];
  const profiles = profileResult.data || [];

  const complete =
    !failed &&
    walletResult.count === wallets.length &&
    transactionResult.count === transactions.length &&
    wallets.every((wallet) => wallet.currency === "EUR") &&
    transactions.every(
      (transaction) =>
        transaction.transaction_type === "reward" &&
        wallets.some(
          (wallet) => wallet.user_id === transaction.user_id
        )
    );

  const cents = (value: number | string) =>
    Math.round(Number(value) * 100);

  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + cents(wallet.balance),
    0
  );

  const totalTransactions = transactions.reduce(
    (sum, transaction) => sum + cents(transaction.amount),
    0
  );

  const difference = totalBalance - totalTransactions;

  const integrity =
    complete &&
    wallets.every((wallet) => {
      const recorded = transactions
        .filter((t) => t.user_id === wallet.user_id)
        .reduce((sum, t) => sum + cents(t.amount), 0);

      return cents(wallet.balance) === recorded;
    });

  function accountName(id: string) {
    const profile = profiles.find((p) => p.id === id);
    return profile?.email || profile?.username || id;
  }

  const stats = [
    {
      label: "Saldo complessivo",
      value: complete ? money(totalBalance / 100) : "N/D",
    },
    {
      label: "Portafogli utenti",
      value: walletResult.count ?? "N/D",
    },
    {
      label: "Transazioni registrate",
      value: transactionResult.count ?? "N/D",
    },
    {
      label: "Differenza contabile",
      value: complete ? money(difference / 100) : "N/D",
    },
  ];

  return (
    <main className="min-h-screen bg-[#08090d] p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/protected/admin"
          className="text-[#d9b568]"
        >
          ← Torna al pannello Admin
        </Link>

        <header className="my-10">
          <p className="tracking-widest text-[#d9b568]">
            VIRAL CASH GLOBAL
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            GLOBAL WALLET
            <span className="block text-[#d9b568]">
              CONTROL CENTER
            </span>
          </h1>

          <p className="mt-4 text-gray-400">
            Monitoraggio finanziario e controllo
            delle transazioni.
          </p>

          <div className="mt-5 rounded-xl border border-[#d9b568]/30 bg-[#11141b] p-4">
            <p className="font-bold text-[#d9b568]">
              MODALITÀ SOLA LETTURA
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Nessuna modifica manuale dei saldi.
              Nessun pagamento o prelievo.
            </p>
          </div>
        </header>

        {failed ? (
          <div className="rounded-xl border border-red-700 bg-red-950 p-5 text-red-300">
            Errore nel caricamento dei dati finanziari.
            Riprova più tardi.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4">
              {stats.map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5"
                >
                  <p className="text-sm text-gray-400">
                    {item.label}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-[#d9b568]">
                    {item.value}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-6 rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5">
              <h2 className="font-bold text-[#d9b568]">
                CONTROLLO INTEGRITÀ
              </h2>

              <p className={`mt-3 font-semibold ${
                integrity
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}>
                {!complete
                  ? "Verifica completa non disponibile"
                  : integrity
                    ? "✓ Saldi e accrediti coerenti"
                    : "Attenzione: differenza da verificare"}
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Controllo preliminare dei portafogli
                EUR con sole ricompense.
              </p>
            </section>

            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-bold text-[#d9b568]">
                Portafogli utenti
              </h2>

              <p className="text-sm text-gray-400">
                Fino a 100 portafogli visualizzati.
              </p>

              {wallets.length === 0 && (
                <p className="text-gray-400">
                  Nessun portafoglio disponibile.
                </p>
              )}

              {wallets.map((wallet) => (
                <article
                  key={wallet.user_id}
                  className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5"
                >
                  <p className="break-all text-sm text-gray-400">
                    {accountName(wallet.user_id)}
                  </p>

                  <p className="mt-4 text-3xl font-bold text-[#d9b568]">
                    {wallet.currency === "EUR"
                      ? money(Number(wallet.balance))
                      : `${wallet.balance} ${wallet.currency}`}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Valuta: {wallet.currency}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-bold text-[#d9b568]">
                Registro transazioni
              </h2>

              <p className="text-sm text-gray-400">
                Ultime 100 transazioni.
              </p>

              {transactions.length === 0 && (
                <p className="text-gray-400">
                  Nessuna transazione registrata.
                </p>
              )}

              {transactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5"
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">
                      {transaction.transaction_type === "reward"
                        ? "Ricompensa campagna"
                        : transaction.description ||
                          transaction.transaction_type}
                    </p>

                    <p className="font-bold text-[#d9b568]">
                      {wallets.find(
                        (w) => w.user_id === transaction.user_id
                      )?.currency === "EUR"
                        ? money(Number(transaction.amount))
                        : String(transaction.amount)}
                    </p>
                  </div>

                  <p className="mt-3 break-all text-sm text-gray-400">
                    {accountName(transaction.user_id)}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {transaction.created_at
                      ? new Date(
                          transaction.created_at
                        ).toLocaleString("it-IT", {
                          timeZone: "Europe/Rome",
                        })
                      : "Data non disponibile"}
                  </p>
                </article>
              ))}
            </section>
          </>
        )}

        <footer className="mt-12 border-t border-[#d9b568]/20 py-6 text-center text-xs text-gray-500">
          VIRAL CASH GLOBAL © 2026
          <p className="mt-2">
            GLOBAL FINANCIAL CONTROL CENTER
          </p>
        </footer>

      </div>
    </main>
  );
}
