import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

import {
  Globe,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  LogOut,
  Link2,
} from "lucide-react";

async function logout() {
  "use server";

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/protected?logout=error");
  }

  redirect("/auth/login");
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const isAdmin = !adminError && !!admin;

  return (
    <div className="min-h-screen w-full bg-[#08090d] text-white flex flex-col">

      <header className="w-full border-b border-[#d9b568]/20 bg-[#11141b]">

        <div className="mx-auto max-w-7xl px-4 py-5">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <Link
              href="/protected"
              className="flex items-center gap-3"
            >
              <Globe
                size={32}
                className="shrink-0 text-[#d9b568]"
              />

              <div>
                <p className="text-sm md:text-xl font-bold text-[#d9b568]">
                  VIRAL CASH GLOBAL
                </p>

                <p className="text-[10px] tracking-widest text-gray-400">
                  GLOBAL CREATOR NETWORK
                </p>
              </div>
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl border border-[#d9b568]/40 px-4 py-2 text-sm text-[#d9b568]"
              >
                <LogOut size={16} />
                Esci
              </button>
            </form>

          </div>

          <nav className="mt-5 flex flex-wrap gap-3">

            <Link
              href="/protected"
              className="flex items-center gap-2 rounded-xl bg-[#08090d] px-3 py-3 text-sm text-[#d9b568]"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href="/protected/campaigns"
              className="flex items-center gap-2 rounded-xl bg-[#08090d] px-3 py-3 text-sm text-[#d9b568]"
            >
              <Megaphone size={18} />
              Campagne
            </Link>

            <Link
              href="/protected/social"
              className="flex items-center gap-2 rounded-xl bg-[#08090d] px-3 py-3 text-sm text-[#d9b568]"
            >
              <Link2 size={18} />
              Social
            </Link>

            {isAdmin && (
              <Link
                href="/protected/admin"
                className="flex items-center gap-2 rounded-xl bg-[#d9b568] px-3 py-3 text-sm font-bold text-black"
              >
                <ShieldCheck size={18} />
                Admin
              </Link>
            )}

          </nav>

        </div>

      </header>

      <div className="w-full min-w-0 flex-1">
        {children}
      </div>

      <footer className="w-full border-t border-[#d9b568]/20 bg-[#11141b] px-4 py-8 text-center">

        <p className="font-bold text-[#d9b568]">
          VIRAL CASH GLOBAL
        </p>

        <p className="mt-2 text-xs tracking-widest text-gray-400">
          GLOBAL CREATOR NETWORK
        </p>

        <p className="mt-4 text-xs text-gray-500">
          © 2026 VIRAL CASH GLOBAL
        </p>

        <p className="mt-2 text-xs text-gray-500">
          Tutti i diritti riservati.
        </p>

      </footer>

    </div>
  );
}
