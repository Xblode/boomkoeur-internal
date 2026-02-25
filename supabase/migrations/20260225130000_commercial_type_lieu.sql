-- Migration : Ajout du type "lieu" pour les contacts commerciaux
-- Permet de catégoriser les salles, lieux de concert, etc.

ALTER TABLE public.commercial_contacts
  DROP CONSTRAINT IF EXISTS commercial_contacts_type_check;

ALTER TABLE public.commercial_contacts
  ADD CONSTRAINT commercial_contacts_type_check
  CHECK (type IN ('supplier', 'contact', 'partner', 'lieu'));
