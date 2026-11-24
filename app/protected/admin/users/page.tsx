import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
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

  const { data: profiles, error, count } =
    await supabase
      .from("profiles")
      .select(
        "id, username, full_name, email, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .limit(100);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#08090d",
        color: "#ffffff",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Link
        href="/protected/admin"
        style={{ color: "#d9b568" }}
      >
        ← Torna al pannello admin
      </Link>

      <p
        style={{
          color: "#d9b568",
          letterSpacing: 4,
          marginTop: 40,
        }}
      >
        VIRAL CASH GLOBAL
      </p>

      <h1 style={{ fontSize: 36, margin: "20px 0" }}>
        GESTIONE{" "}
        <span style={{ color: "#d9b568" }}>
          UTENTI
        </span>
      </h1>

      <p style={{ color: "#9ca3af" }}>
        Profili registrati nella piattaforma
      </p>

      <section
        style={{
          background: "#13161e",
          border: "1px solid #50452e",
          borderRadius: 20,
          padding: 25,
          margin: "30px 0",
        }}
      >
        <p style={{ color: "#d9b568" }}>
          TOTALE PROFILI
        </p>

        <h2 style={{ fontSize: 42 }}>
          {error ? "—" : count ?? 0}
        </h2>
      </section>

      {error ? (
        <p style={{ color: "#f87171" }}>
          Errore nel caricamento dei profili.
        </p>
      ) : !profiles?.length ? (
        <p>Nessun profilo registrato.</p>
      ) : (
        profiles.map((profile) => (
          <article
            key={profile.id}
            style={{
              background: "#13161e",
              border: "1px solid #50452e",
              borderRadius: 18,
              padding: 22,
              marginBottom: 18,
              overflowWrap: "anywhere",
            }}
          >
            <h2 style={{ color: "#d9b568" }}>
              {profile.full_name ||
                profile.username ||
                "Utente registrato"}
            </h2>

            <p>
              Email: {profile.email || "Non disponibile"}
            </p>

            <p>
              Username: {profile.username || "Non impostato"}
            </p>

            <p style={{ color: "#9ca3af" }}>
              Registrazione:{" "}
              {profile.created_at
                ? new Date(
                    profile.created_at
                  ).toLocaleDateString("it-IT")
                : "Non disponibile"}
            </p>

            <p style={{ color: "#d9b568" }}>
              Profilo registrato
            </p>
          </article>
        ))
      )}

      {!error && (count ?? 0) > 100 && (
        <p>Visualizzati i primi 100 profili.</p>
      )}

      <footer
        style={{
          marginTop: 40,
          color: "#9ca3af",
          textAlign: "center",
          fontSize: 12,
        }}
      >
        VIRAL CASH GLOBAL © 2026
        <br />
        GLOBAL ADMIN CONTROL CENTER
      </footer>
    </main>
  );
}
