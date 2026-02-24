# Migrations Supabase

Migrations numerotees et structurees. Ordre d'execution :

| # | Fichier | Description |
|---|---------|-------------|
| 1 | `20260223100001_profiles.sql` | Table profiles (extension auth.users) + trigger + RLS + backfill |
| 2 | `20260223100002_organisations.sql` | Tables organisations, organisation_members, organisation_invites + fonctions helper + RLS |
| 3 | `20260223100003_events.sql` | Tables artists, events, event_artists, event_comments |
| 4 | `20260223100004_meetings.sql` | Table meetings |
| 5 | `20260223100005_commercial.sql` | Tables commercial_contacts, contact_notes |
| 6 | `20260223100006_finance.sql` | Tables finance (comptes, transactions, budgets, factures, etc.) |
| 7 | `20260223100007_products.sql` | Tables products, product_variants, product_stock_movements, product_providers, product_comments |
| 8 | `20260223100008_rls_business_tables.sql` | RLS sur toutes les tables metier (filtrage par org_id) |

## Execution

```bash
supabase db push
```

Ou via le SQL Editor Supabase : executer les fichiers dans l'ordre numerique.
