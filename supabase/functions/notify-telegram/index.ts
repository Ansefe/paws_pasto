// Edge Function: notify-telegram
// Envía notificaciones a Telegram con el token GUARDADO EN EL SERVIDOR,
// para no exponer VITE_TELEGRAM_BOT_TOKEN en el bundle del cliente.
//
// Deploy:
//   supabase functions deploy notify-telegram --no-verify-jwt
//   supabase secrets set TELEGRAM_BOT_TOKEN=xxxx TELEGRAM_CHAT_ID=yyyy
//
// El cliente hace POST { message: string } a:
//   ${SUPABASE_URL}/functions/v1/notify-telegram
//
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405)

  try {
    const { message } = await req.json()
    if (!message || typeof message !== "string") {
      return json({ ok: false, error: "message_required" }, 400)
    }
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      // No configurado: best-effort, no es un error fatal para el cliente.
      return json({ ok: false, reason: "not_configured" }, 200)
    }

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" }),
      }
    )
    const result = await res.json()
    return json({ ok: !!result.ok })
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200)
  }
})
