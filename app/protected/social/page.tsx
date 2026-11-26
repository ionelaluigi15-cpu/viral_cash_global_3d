import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

import {
  ArrowLeft,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Music2,
  ShieldCheck,
  Link2,
  AlertCircle,
} from "lucide-react";

const youtubeErrors = new Map([
  ["authorization_denied", "Autorizzazione YouTube annullata."],
  ["channel_not_found", "Nessun canale YouTube trovato per questo account Google."],
  ["invalid_session", "La sessione di collegamento è scaduta. Riprova da questa pagina."],
  ["invalid_state", "La sessione di collegamento è scaduta. Riprova da questa pagina."],
  ["database_error", "Impossibile salvare il collegamento YouTube. Riprova più tardi."],
  ["database_configuration_error", "Il salvataggio del collegamento YouTube non è al momento disponibile."],
]);

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ youtube?: string | string[] }>;
}) {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: accounts, error: accountsError } =
    await supabase
      .from("social_accounts")
      .select("platform, username, status")
      .eq("user_id", user.id);

  const { youtube } = await searchParams;
  const youtubeConnected = accounts?.some(
    (account) =>
      account.platform.toLowerCase() === "youtube" &&
      account.status === "connected",
  );
  const youtubeSuccess = youtube === "connected" && youtubeConnected;
  const youtubeMessage =
    typeof youtube === "string" && youtube
      ? youtubeSuccess
        ? "Canale YouTube collegato."
        : youtubeErrors.get(youtube) ??
          "Impossibile confermare il collegamento YouTube. Riprova più tardi."
      : null;

  const platforms = [
    {
      name: "TikTok",
      icon: Music2,
      description:
        "Collega il tuo profilo creator TikTok.",
    },
    {
      name: "Instagram",
      icon: Instagram,
      description:
        "Collega il tuo account Instagram professionale.",
    },
    {
      name: "Facebook",
      icon: Facebook,
      description:
        "Collega le tue pagine Facebook.",
    },
    {
      name: "YouTube",
      icon: Youtube,
      description:
        "Collega il tuo canale YouTube.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#08090d] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/protected"
          className="mb-8 flex items-center gap-2 text-[#d9b568]"
        >
          <ArrowLeft size={20} />
          Torna alla dashboard
        </Link>

        <header className="mb-10">
          <p className="text-sm tracking-[0.3em] text-[#d9b568]">
            VIRAL CASH GLOBAL
          </p>

          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            GLOBAL SOCIAL{" "}
            <span className="text-[#d9b568]">
              CONNECTION CENTER
            </span>
          </h1>

          <p className="mt-5 text-gray-400">
            Gestisci i tuoi profili social e le
            connessioni con le piattaforme digitali.
          </p>

          <p className="mt-3 break-all text-gray-400">
            Account: {user.email}
          </p>
        </header>

        {youtubeMessage && (
          <p
            role={youtubeSuccess ? "status" : "alert"}
            className={`mb-6 rounded-xl border border-current p-4 ${youtubeSuccess ? "text-green-400" : "text-yellow-400"}`}
          >
            {youtubeMessage}
          </p>
        )}

        {accountsError && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/30 p-5 text-red-400">
            <AlertCircle className="mb-2" />
            Impossibile caricare gli account social.
            Riprova più tardi.
          </div>
        )}

        <section className="mb-8 grid grid-cols-2 gap-4">

          <div className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5">
            <Globe className="mb-3 text-[#d9b568]" />

            <p className="text-sm text-gray-400">
              Piattaforme previste
            </p>

            <p className="mt-2 text-3xl font-bold text-[#d9b568]">
              4
            </p>
          </div>

          <div className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5">
            <Link2 className="mb-3 text-[#d9b568]" />

            <p className="text-sm text-gray-400">
              Profili registrati
            </p>

            <p className="mt-2 text-3xl font-bold text-[#d9b568]">
              {accountsError ? "—" : accounts?.length ?? 0}
            </p>
          </div>

        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {platforms.map((platform) => {
            const Icon = platform.icon;

            const account = accounts?.find(
              (item) =>
                item.platform.toLowerCase() ===
                platform.name.toLowerCase()
            );

            return (
              <article
                key={platform.name}
                className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6"
              >
                <Icon
                  size={38}
                  className="text-[#d9b568]"
                />

                <h2 className="mt-4 text-2xl font-bold">
                  {platform.name}
                </h2>

                <p className="mt-3 text-gray-400">
                  {platform.description}
                </p>

                <div className="mt-5 rounded-xl bg-[#08090d] p-4">

                  <p className="text-sm text-gray-400">
                    Stato connessione
                  </p>

                  <p className="mt-2 font-bold text-yellow-400">
                    {accountsError
                      ? "Stato non disponibile"
                      : account?.status === "connected" && platform.name === "YouTube"
                      ? "Collegato"
                      : account
                      ? "Profilo registrato - da verificare"
                      : "Non collegato"}
                  </p>

                  {account?.username && (
                    <p className="mt-2 break-all text-gray-300">
                      Profilo: {account.username}
                    </p>
                  )}

                </div>

                {platform.name === "YouTube" ? (
                  <a
                    href="/api/social/youtube/connect"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9b568] p-4 font-bold text-black hover:bg-[#e5c782]"
                  >
                    <Link2 size={20} />
                    {youtubeConnected ? "Ricollega YouTube" : "Collega YouTube"}
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#d9b568]/30 p-4 font-bold text-[#d9b568] opacity-60"
                  >
                    <Link2 size={20} />
                    OAUTH DA CONFIGURARE
                  </button>
                )}

              </article>
            );
          })}

        </section>

        <section className="mt-8 rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">

          <div className="flex items-center gap-3">
            <ShieldCheck
              size={30}
              className="text-[#d9b568]"
            />

            <h2 className="text-xl font-bold text-[#d9b568]">
              SOCIAL SECURITY
            </h2>
          </div>

          <p className="mt-4 text-gray-400">
            Le connessioni saranno gestite attraverso
            le autorizzazioni ufficiali delle
            piattaforme social.
          </p>

          <p className="mt-3 text-sm text-green-400">
            ✓ Accesso riservato agli utenti autenticati
          </p>

          <p className="mt-2 text-sm text-green-400">
            ✓ Nessuna richiesta di password social
          </p>

          <p className="mt-2 text-sm text-yellow-400">
            Integrazioni OAuth e gestione sicura dei
            token da completare.
          </p>

        </section>

        <footer className="mt-10 border-t border-[#d9b568]/20 pt-6 text-center text-xs text-gray-500">
          VIRAL CASH GLOBAL © 2026

          <p className="mt-2 text-[#d9b568]">
            GLOBAL SOCIAL CONNECTION CENTER
          </p>
        </footer>

      </div>
    </main>
  );
}
