#!/usr/bin/env node
/**
 * Script : Créer le compte démo et l'organisation démo
 * Charge .env.local automatiquement (ou via node --env-file=.env.local)
 *
 * Variables requises dans .env.local :
 *   - DEMO_PASSWORD : mot de passe du compte demo@perret.app
 *   - NEXT_PUBLIC_SUPABASE_URL : URL du projet Supabase
 *   - SUPABASE_SERVICE_ROLE_KEY : clé service role (Dashboard > Settings > API)
 */

const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const idx = line.indexOf('=');
    if (idx <= 0 || line.startsWith('#')) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const DEMO_EMAIL = 'demo@perret.app';

async function main() {
  const password = process.env.DEMO_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!password) {
    console.error('❌ DEMO_PASSWORD manquant. Usage: DEMO_PASSWORD=xxx node scripts/create-demo.js');
    process.exit(1);
  }
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('🔐 Création du compte démo...');

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { first_name: 'Démo', last_name: 'Perret' },
  });

  if (userError) {
    if (userError.message?.includes('already been registered')) {
      console.log('ℹ️  Compte demo@perret.app existe déjà.');
    } else {
      console.error('❌ Erreur création utilisateur:', userError.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Compte démo créé.');
  }

  let userId = userData?.user?.id;
  if (!userId) {
    const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const demoUser = data?.users?.find((u) => u.email === DEMO_EMAIL);
    if (!demoUser) {
      console.error('❌ Compte demo@perret.app introuvable.');
      process.exit(1);
    }
    userId = demoUser.id;
  }

  console.log('🏢 Création de l\'organisation démo...');

  const { data: existingOrg } = await supabase
    .from('organisations')
    .select('id')
    .eq('slug', 'demo')
    .single();

  if (existingOrg) {
    console.log('ℹ️  Organisation démo existe déjà (slug: demo).');
    return;
  }

  const { data: org, error: orgError } = await supabase
    .from('organisations')
    .insert({
      name: 'Perret Démo',
      description: 'Organisation de démonstration pour explorer Perret.',
      type: 'association',
      slug: 'demo',
      created_by: userId,
    })
    .select('id')
    .single();

  if (orgError) {
    console.error('❌ Erreur création organisation:', orgError.message);
    process.exit(1);
  }

  const { error: memberError } = await supabase.from('organisation_members').insert({
    org_id: org.id,
    user_id: userId,
    role: 'fondateur',
  });

  if (memberError) {
    console.error('❌ Erreur ajout membre:', memberError.message);
    process.exit(1);
  }

  console.log('✅ Organisation démo créée.');
  console.log('');
  console.log('🎉 Terminé ! Vous pouvez maintenant :');
  console.log('   1. Ajouter DEMO_PASSWORD dans .env.local');
  console.log('   2. Tester la démo sur /demo ou "Essayer la démo"');
  console.log('   3. (Optionnel) Exécuter supabase/seed/demo.sql pour le contenu complet');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
