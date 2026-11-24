import { connection } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";

const PATH = "/protected/admin/campaigns";

const platforms = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
];

const statuses = [
  "pending",
  "active",
  "inactive",
];

async function requireAdmin() {
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

  return supabase;
}

async function saveCampaign(formData: FormData) {
  "use server";

  const supabase = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const platform = String(formData.get("platform") ?? "");
  const status = String(formData.get("status") ?? "");
  const rawReward = String(formData.get("reward") ?? "");
  const reward = Number(rawReward);

  if (
    !title ||
    title.length > 200 ||
    description.length > 5000 ||
    !platforms.includes(platform) ||
    !statuses.includes(status) ||
    !/^\d+(\.\d{1,2})?$/.test(rawReward) ||
    !Number.isFinite(reward) ||
    reward < 0 ||
    reward > 100000
  ) {
    redirect(`${PATH}?result=invalid`);
  }

  if (
    id &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    redirect(`${PATH}?result=invalid`);
  }

  const payload = {
    title,
    description,
    platform,
    reward,
    status,
  };

  const query = id
    ? supabase
        .from("campaigns")
        .update(payload)
        .eq("id", id)
    : supabase
        .from("campaigns")
        .insert(payload);

  const { data, error } = await query
    .select("id")
    .single();

  if (error || !data) {
    redirect(`${PATH}?result=error`);
  }

  revalidatePath(PATH);
  revalidatePath("/protected/campaigns");
  revalidatePath("/protected");

  redirect(`${PATH}?result=success`);
}

const field =
  "w-full rounded-xl border border-[#d9b568]/30 bg-[#08090d] p-3 text-white";

const button =
  "w-full rounded-xl bg-[#d9b568] p-3 font-bold text-black";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  platform: string;
  reward: number;
  status: string;
};

function CampaignForm({
  campaign,
}: {
  campaign?: Campaign;
}) {
  return (
    <form action={saveCampaign} className="space-y-4">

      {campaign && (
        <input
          type="hidden"
          name="id"
          value={campaign.id}
        />
      )}

      <label className="block">
        Titolo
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={campaign?.title ?? ""}
          className={field}
        />
      </label>

      <label className="block">
        Descrizione
        <textarea
          name="description"
          rows={4}
          maxLength={5000}
          defaultValue={campaign?.description ?? ""}
          className={field}
        />
      </label>

      <label className="block">
        Piattaforma
        <select
          name="platform"
          defaultValue={campaign?.platform ?? "Instagram"}
          className={field}
        >
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Ricompensa prevista (€)
        <input
          name="reward"
          type="number"
          min="0"
          max="100000"
          step="0.01"
          required
          defaultValue={campaign?.reward ?? 0}
          className={field}
        />
      </label>

      <label className="block">
        Stato campagna
        <select
          name="status"
          defaultValue={campaign?.status ?? "pending"}
          className={field}
        >
          <option value="pending">In attesa</option>
          <option value="active">Attiva</option>
          <option value="inactive">Disattivata</option>
        </select>
      </label>

      <button type="submit" className={button}>
        {campaign
          ? "SALVA MODIFICHE"
          : "CREA CAMPAGNA"}
      </button>

    </form>
  );
}

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  await connection();

  const supabase = await requireAdmin();
  const { result } = await searchParams;

  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id,title,description,platform,reward,status")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#08090d] px-5 py-10 text-white">

      <div className="mx-auto max-w-6xl">

        <Link
          href="/protected/admin"
          className="mb-8 inline-flex items-center gap-2 text-[#d9b568]"
        >
          <ArrowLeft size={20} />
          Torna al pannello Admin
        </Link>

        <p className="tracking-[0.3em] text-[#d9b568]">
          VIRAL CASH GLOBAL
        </p>

        <h1 className="my-5 text-4xl font-bold">
          GESTIONE{" "}
          <span className="text-[#d9b568]">
            CAMPAGNE
          </span>
        </h1>

        <p className="mb-8 text-gray-400">
          Admin Campaign Management
        </p>

        {result === "success" && (
          <p className="mb-6 rounded-xl bg-green-950 p-4 text-green-300">
            Campagna salvata con successo.
          </p>
        )}

        {result === "error" && (
          <p className="mb-6 rounded-xl bg-red-950 p-4">
            Salvataggio non riuscito.
          </p>
        )}

        {result === "invalid" && (
          <p className="mb-6 rounded-xl bg-red-950 p-4">
            Controlla i dati inseriti.
          </p>
        )}

        <section className="mb-8 rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">

          <Megaphone
            className="mb-4 text-[#d9b568]"
            size={32}
          />

          <h2 className="mb-5 text-2xl font-bold text-[#d9b568]">
            NUOVA CAMPAGNA
          </h2>

          <CampaignForm />

        </section>

        {error ? (
          <p className="text-red-400">
            Impossibile caricare le campagne.
          </p>
        ) : (
          <>
            <div className="mb-8 rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6">

              <p className="text-[#d9b568]">
                TOTALE CAMPAGNE
              </p>

              <p className="mt-3 text-4xl font-bold">
                {campaigns?.length ?? 0}
              </p>

            </div>

            <section className="grid gap-6 md:grid-cols-2">

              {campaigns?.map((campaign) => (
                <article
                  key={campaign.id}
                  className="rounded-2xl border border-[#d9b568]/30 bg-[#11141b] p-6"
                >

                  <h2 className="mb-5 text-xl font-bold text-[#d9b568]">
                    {campaign.title}
                  </h2>

                  <CampaignForm campaign={campaign} />

                </article>
              ))}

            </section>
          </>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          VIRAL CASH GLOBAL © 2026
          — ADMIN CONTROL CENTER
        </footer>

      </div>
    </main>
  );
          }
