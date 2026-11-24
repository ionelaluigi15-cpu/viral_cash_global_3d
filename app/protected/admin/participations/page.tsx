import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PATH = "/protected/admin/participations";

async function requireAdmin() {
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

  return supabase;
}

async function updateParticipation(formData: FormData) {
  "use server";

  const supabase = await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  const validId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (
    !validId.test(id) ||
    !["approved", "rejected"].includes(status)
  ) {
    redirect(`${PATH}?result=invalid`);
  }

  const { data, error } = await supabase
    .from("campaign_participations")
    .update({ status })
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirect(`${PATH}?result=error`);
  }

  revalidatePath(PATH);
  revalidatePath("/protected/campaigns");
  revalidatePath("/protected");

  redirect(`${PATH}?result=success`);
}

export default async function ParticipationsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  await connection();

  const supabase = await requireAdmin();
  const params = await searchParams;

  const { data, error } = await supabase
    .from("campaign_participations")
    .select(
      "id,campaign_id,user_id,status,reward_amount,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: campaigns, error: campaignsError } =
    await supabase
      .from("campaigns")
      .select("id,title,platform");

  const counts = await Promise.all(
    ["pending", "approved", "rejected"].map(
      (status) =>
        supabase
          .from("campaign_participations")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", status)
    )
  );

  const failed =
    error ||
    campaignsError ||
    counts.some((item) => item.error);

  const rows = data || [];

  const pending = counts[0].count || 0;
  const approved = counts[1].count || 0;
  const rejected = counts[2].count || 0;

  const total = pending + approved + rejected;

  const stats = [
    {
      label: "Totale",
      value: total,
      color: "text-[#d9b568]",
    },
    {
      label: "In attesa",
      value: pending,
      color: "text-yellow-400",
    },
    {
      label: "Approvate",
      value: approved,
      color: "text-green-400",
    },
    {
      label: "Rifiutate",
      value: rejected,
      color: "text-red-400",
    },
  ];

  return (
    <main className="min-h-screen bg-[#08090d] p-4 text-white md:p-8">

      <div className="mx-auto max-w-6xl">

        <Link
          href="/protected/admin"
          className="text-sm text-[#d9b568]"
        >
          ← Torna al pannello Admin
        </Link>

        <header className="my-8">
          <p className="text-sm tracking-widest text-[#d9b568]">
            VIRAL CASH GLOBAL
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#d9b568]">
            Gestione candidature
          </h1>

          <p className="mt-2 text-gray-400">
            Global Admin Participation Control Center
          </p>
        </header>

        {params.result === "success" && (
          <div className="mb-5 rounded-xl border border-green-700 bg-green-950 p-4 text-green-300">
            Candidatura aggiornata con successo.
          </div>
        )}

        {["error", "invalid"].includes(
          params.result || ""
        ) && (
          <div className="mb-5 rounded-xl border border-red-700 bg-red-950 p-4 text-red-300">
            Operazione non riuscita. Verifica lo stato
            della candidatura e i permessi.
          </div>
        )}

        {failed ? (
          <div className="rounded-xl border border-red-700 p-5 text-red-400">
            Errore nel caricamento dei dati.
            Riprova più tardi.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">

              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5"
                >
                  <p className="text-sm text-gray-400">
                    {item.label}
                  </p>

                  <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              ))}

            </section>

            <section className="mt-8 space-y-4">

              <h2 className="text-xl font-semibold text-[#d9b568]">
                Elenco candidature
              </h2>

              <p className="text-xs text-gray-400">
                Ultime 100 candidature.
              </p>

              {rows.length === 0 && (
                <p className="rounded-xl bg-[#11141b] p-5 text-gray-400">
                  Nessuna candidatura disponibile.
                </p>
              )}

              {rows.map((row) => {
                const campaign = campaigns?.find(
                  (item) => item.id === row.campaign_id
                );

                return (
                  <article
                    key={row.id}
                    className="rounded-2xl border border-[#d9b568]/20 bg-[#11141b] p-5"
                  >
                    <h3 className="text-lg font-bold text-[#d9b568]">
                      {campaign?.title || "Campagna"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      {campaign?.platform || "Piattaforma"}
                    </p>

                    <p className="mt-3 break-all text-xs text-gray-400">
                      Utente: {row.user_id}
                    </p>

                    <p className="mt-2 text-sm">
                      Ricompensa registrata: €{" "}
                      {Number(row.reward_amount).toFixed(2)}
                    </p>

                    <p className="mt-3 font-semibold">
                      {row.status === "pending" && (
                        <span className="text-yellow-400">
                          ● IN ATTESA
                        </span>
                      )}

                      {row.status === "approved" && (
                        <span className="text-green-400">
                          ✓ APPROVATA
                        </span>
                      )}

                      {row.status === "rejected" && (
                        <span className="text-red-400">
                          ✕ RIFIUTATA
                        </span>
                      )}
                    </p>

                    {row.status === "pending" && (
                      <form
                        action={updateParticipation}
                        className="mt-5 grid grid-cols-2 gap-3"
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={row.id}
                        />

                        <button
                          type="submit"
                          name="status"
                          value="approved"
                          className="rounded-xl bg-green-700 p-3 font-bold text-white"
                        >
                          APPROVA
                        </button>

                        <button
                          type="submit"
                          name="status"
                          value="rejected"
                          className="rounded-xl bg-red-700 p-3 font-bold text-white"
                        >
                          RIFIUTA
                        </button>
                      </form>
                    )}

                  </article>
                );
              })}

            </section>
          </>
        )}

        <footer className="mt-10 border-t border-[#d9b568]/20 pt-5 text-center text-xs text-gray-500">
          VIRAL CASH GLOBAL © 2026
          <p className="mt-2">
            GLOBAL ADMIN CONTROL CENTER
          </p>
        </footer>

      </div>
    </main>
  );
}
