import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

  if (redirectUri) {
    const callbackUrl = new URL(redirectUri);
    if (request.nextUrl.origin !== callbackUrl.origin) {
      const canonicalConnect = new URL("/api/social/youtube/connect", callbackUrl);
      const response = NextResponse.redirect(canonicalConnect);
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Configurazione YouTube incompleta" },
      { status: 503 }
    );
  }

  const state = randomBytes(32).toString("base64url");

  const verifier = randomBytes(48).toString("base64url");

  const challenge = createHash("sha256")
    .update(verifier)
    .digest("base64url");

  const googleUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth"
  );

  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");

  googleUrl.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/youtube.readonly"
  );

  googleUrl.searchParams.set("access_type", "offline");
  googleUrl.searchParams.set("prompt", "consent");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("code_challenge", challenge);
  googleUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(googleUrl);

  response.cookies.set(
    "youtube_oauth_state",
    state,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/api/social/youtube",
    }
  );

  response.cookies.set(
    "youtube_oauth_user",
    user.id,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/api/social/youtube",
    }
  );

  response.cookies.set(
    "youtube_oauth_verifier",
    verifier,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/api/social/youtube",
    }
  );

  response.headers.set("Cache-Control", "no-store");

  return response;
}
