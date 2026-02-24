import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getOrgIdFromApiKey } from '@/lib/supabase/integrations';

function getApiKeyFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const apiKey = request.headers.get('X-API-Key');
  return apiKey?.trim() ?? null;
}

export async function GET(request: NextRequest) {
  const apiKey = getApiKeyFromRequest(request);
  if (!apiKey) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const orgId = await getOrgIdFromApiKey(apiKey);
  if (!orgId) {
    return NextResponse.json({ error: 'Authentification invalide' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const admin = createAdminClient();
  let query = admin
    .from('products')
    .select('id, sku, name, description, type, status, category, tags, collection, prices, total_stock, stock_threshold, event_id, main_image, created_at, updated_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  const products = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description ?? '',
    type: row.type,
    status: row.status,
    category: row.category ?? '',
    tags: (row.tags as unknown[]) ?? [],
    collection: row.collection ?? undefined,
    prices: row.prices ?? { public: 0, member: 0, partner: 0 },
    total_stock: row.total_stock ?? 0,
    stock_threshold: row.stock_threshold ?? 0,
    event_id: row.event_id ?? undefined,
    main_image: row.main_image ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return NextResponse.json({
    data: products,
    pagination: {
      limit,
      offset,
      count: products.length,
    },
  });
}
