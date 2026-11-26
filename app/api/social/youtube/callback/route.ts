import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

  if (!redirectUri) {
    return NextResponse.json(
      { error: "Configurazione YouTube mancante" },
      { status: 503 }
    );
  }

  function finish(status: string) {
    const url = new URL("/protected/social", redirectUri);
    url.searchParams.set("youtube", status);

    const response = NextResponse.redirect(url);

    for (const name of [
      "youtube_oauth_state",
      "youtube_oauth_user",
      "youtube_oauth_verifier",
    ]) {
      response.cookies.set(name, "", {
        path: "/api/social/youtube",
        maxAge: 0,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }

    response.headers.set("Cache-Control", "no-store");

    return response;
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return finish("login_required");
    }

    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");

    const savedState = request.cookies.get(
      "youtube_oauth_state"
    )?.value;

    const savedUser = request.cookies.get(
      "youtube_oauth_user"
    )?.value;

    const verifier = request.cookies.get(
      "youtube_oauth_verifier"
    )?.value;

    if (
      !state ||
      !savedState ||
      !verifier ||
      savedUser !== user.id
    ) {
      return finish("invalid_session");
    }

    const received = Buffer.from(state);
    const expected = Buffer.from(savedState);

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      return finish("invalid_state");
    }

    if (request.nextUrl.searchParams.has("error")) {
      return finish("authorization_denied");
    }

    if (!code) {
      return finish("missing_code");
    }

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return finish("configuration_error");
    }

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          code_verifier: verifier,
        }),
        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      return finish("token_error");
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return finish("token_missing");
    }

    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
        cache: "no-store",
      }
    );

    if (!channelResponse.ok) {
      return finish("channel_error");
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel?.id || !channel?.snippet?.title) {
      return finish("channel_not_found");
    }

    const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  return finish("database_configuration_error");
}

const admin = createAdminClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const { error: saveError } = await admin
  .from("social_accounts")
  .upsert(
    {
      user_id: user.id,
      platform: "YouTube",
      username: channel.snippet.title,
      status: "connected",
    },
    {
      onConflict: "user_id,platform",
    }
  );

if (saveError) {
  console.error(
    "YouTube database error:",
    saveError.code
  );

  return finish("database_error");
}

return finish("connected");

  } catch {
    return finish("unexpected_error");
  }
}
