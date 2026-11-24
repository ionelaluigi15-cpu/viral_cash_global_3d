import { connection } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Megaphone,
  Wallet,
  Globe,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

async function participate(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const { data: { user }, error } =
    await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const campaignId = formData.get("campaign_id");

  if (
    typeof campaignId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId)
  ) {
    redirect("/protected/campaigns?result=error");
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("status", "active")
    .maybeSingle();

  if (!campaign) {
    redirect("/protected/campaigns?result=unavailable");
  }

  const { error: insertError } = await supabase
    .from("campaign_participations")
    .insert({
      campaign_id: campaignId,
      user_id: user.id,
      action_type: "participation",
      status: "pending",
      reward_amount: 0,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      redirect("/protected/campaigns?result=duplicate");
    }

    redirect("/protected/campaigns?result=error");
  }

  revalidatePath("/protected");
  revalidatePath("/protected/campaigns");

  redirect("/protected/campaigns?result=success");
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  await connection();

  const supabase = await createClient();

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { result } = await searchParams;

  const [
    { data: campaigns, error: campaignsError },
    { data: participations, error: participationsError },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id,title,description,platform,reward")
      .eq("status", "active")
      .order("created_at", { ascending: false }),

    supabase
      .from("campaign_participations")
      .select("campaign_id,status")
      .eq("user_id", user.id),
  ]);

  const money = (amount: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const messages: Record<string, string> = {
    success: "Candidatura inviata con successo.",
    duplicate: "Hai già partecipato a questa campagna.",
    unavailable: "Campagna non disponibile.",
    error: "Operazione non riuscita. Riprova.",
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-white px-5 py-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/protected"
          className="inline-flex items-center gap-2 text-[#d9b568] mb-8"
        >
          <ArrowLeft size={18} />
          Torna alla dashboard
        </Link>

        <header className="mb-10">
          <p className="text-[#d9b568] tracking-[0.3em] text-sm">
            VIRAL CASH GLOBAL
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            GLOBAL{" "}
            <span className="text-[#d9b568]">
              MARKETPLACE
            </span>
          </h1>

          <p className="mt-4 text-gray-400">
            Scopri le campagne disponibili e
            candidati alle opportunità.
          </p>
        </header>

        {result && messages[result] && (
          <div className="mb-6 rounded-xl border border-[#d9b568]/30 bg-[#11141b] p-4">
            {messages[result]}
          </div>
        )}

        {campaignsError || participationsError ? (
          <div className="rounded-2xl border border-red-500/30 p-6">
            Impossibile caricare il Marketplace.
            Riprova più tardi.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {campaigns?.length === 0 && (
              <div className="col-span-full rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-8 text-center">
                <Megaphone className="mx-auto text-[#d9b568] mb-4" size={40} />

                <h2 className="text-xl font-bold">
                  Nessuna campagna attiva
                </h2>

                <p className="mt-3 text-gray-400">
                  Le nuove opportunità appariranno qui
                  quando saranno disponibili.
                </p>
              </div>
            )}

            {campaigns?.map((campaign) => {
              const participation = participations?.find(
                (p) => p.campaign_id === campaign.id
              );

              return (
                <article
                  key={campaign.id}
                  className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-6"
                >
                  <div className="flex items-center gap-2 text-[#d9b568]">
                    <Globe size={18} />
                    {campaign.platform}
                  </div>

                  <h2 className="mt-4 text-2xl font-bold">
                    {campaign.title}
                  </h2>

                  <p className="mt-3 text-gray-400">
                    {campaign.description}
                  </p>

                  <div className="mt-6 rounded-xl bg-[#08090d] p-4">
                    <div className="flex items-center gap-2 text-[#d9b568]">
                      <Wallet size={20} />
                      Ricompensa prevista
                    </div>

                    <p className="mt-2 text-3xl font-bold">
                      {money(Number(campaign.reward))}
                    </p>
                  </div>

                  {participation ? (
                    <div className="mt-6 flex items-center gap-2 text-[#d9b568]">
                      <CheckCircle size={20} />

                      {participation.status === "approved"
                        ? "Approvata"
                        : participation.status === "rejected"
                        ? "Rifiutata"
                        : "Candidatura in attesa"}
                    </div>
                  ) : (
                    <form action={participate}>
                      <input
                        type="hidden"
                        name="campaign_id"
                        value={campaign.id}
                      />

                      <button
                        type="submit"
                        className="mt-6 w-full rounded-xl bg-[#d9b568] py-3 font-bold text-black hover:bg-[#e8c982]"
                      >
                        PARTECIPA
                      </button>
                    </form>
                  )}
                </article>
              );
            })}
          </section>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          VIRAL CASH GLOBAL © 2026
          — GLOBAL CREATOR NETWORK
        </footer>

      </div>
    </main>
  );
    }
