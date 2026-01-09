// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const { sso, sig } = await req.json();

    console.log("Received SSO request:", { sso, sig });

    if (!sso || !sig) {
      return new Response(JSON.stringify({ success: false, message: "Missing SSO parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secret = Deno.env.get("SSO_SECRET");
    if (!secret) {
      return new Response(JSON.stringify({ success: false, message: "SSO secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);

    const signatureBuffer = new Uint8Array(sig.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBuffer, encoder.encode(sso));

    if (!isValid) {
      return new Response(JSON.stringify({ success: false, message: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = new URLSearchParams(atob(sso));
    const email = payload.get("email");

    console.log("SSO payload:", payload.toString());

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: "Email not found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let user;
    let existingUser = null;
    let page = 1;
    const perPage = 100;

    while (!existingUser) {
      const { data: users, error: listError } = await supabaseClient.auth.admin.listUsers({
        page,
        perPage,
      });

      if (listError) {
        return new Response(JSON.stringify({ success: false, message: "Failed to query users" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!users.users || users.users.length === 0) {
        break;
      }

      existingUser = users.users.find((u) => u.email === email);

      if (!existingUser && users.users.length < perPage) {
        break;
      }

      page++;
    }

    if (existingUser) {
      user = existingUser;
    } else {
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError) {
        return new Response(JSON.stringify({ success: false, message: "Failed to create user" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      user = newUser.user;
    }

    const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.generateLink({
      type: "magiclink",
      email: user.email!,
      options: {
        redirectTo: `https://learnflow.enterprisedna.co/projects`,
      },
    });

    if (sessionError) {
      return new Response(JSON.stringify({ success: false, message: "Failed to generate session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Authentication successful",
        redirectUrl: sessionData.properties?.action_link,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SSO login error:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
