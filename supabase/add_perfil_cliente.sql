-- ============================================================
-- ACHEI — dados de perfil do cliente
-- Adiciona endereço e foto de perfil à tabela profiles.
-- Cole no Supabase → SQL Editor → New query → Run. Idempotente.
-- ============================================================

alter table public.profiles add column if not exists endereco text;
alter table public.profiles add column if not exists foto_url text;

-- Os GRANTs de profiles (select/insert/update para authenticated) e a RLS
-- de "cada um edita o próprio perfil" já cobrem as colunas novas.
