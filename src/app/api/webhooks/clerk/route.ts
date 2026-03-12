import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) return new Response('Missing secret', { status: 400 })

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
  const { id, email_addresses, external_accounts, first_name, last_name, image_url } = evt.data

  // Récupère l'email depuis email_addresses OU external_accounts (Google OAuth)
  const email = 
    email_addresses?.[0]?.email_address ?? 
    external_accounts?.[0]?.email_address ??
    `fallback-${id}@career-english.com`

  const { error } = await supabaseAdmin.from('profiles').insert({
    id,
    email,
    full_name: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
    avatar_url: image_url ?? '',
    english_level: 'B2',
  })

  if (error) {
    console.error('❌ Supabase insert error:', error.message)
    return new Response('DB error', { status: 500 })
  }

  console.log('✅ Profil créé pour:', id)
}

  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    await supabaseAdmin.from('profiles').delete().eq('id', id)
  }

  return new Response('OK', { status: 200 })
}