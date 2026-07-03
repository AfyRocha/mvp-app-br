-- ============================================================
-- CORREÇÃO: grants que faltavam (o "permission denied for table ...").
-- Cole no Supabase → SQL Editor → New query → Run.
-- Idempotente: pode rodar quantas vezes quiser.
-- ============================================================

grant usage on schema public to anon, authenticated;

-- Leitura (a RLS filtra as linhas)
grant select on public.categories        to anon, authenticated;
grant select on public.providers          to anon, authenticated;
grant select on public.provider_photos    to anon, authenticated;
grant select on public.reviews            to anon, authenticated;
grant select on public.providers_com_nota to anon, authenticated;
grant select on public.reviews_com_autor  to anon, authenticated;

-- Escrita: só logados (a RLS restringe ao dono)
grant select, insert, update on public.profiles        to authenticated;
grant insert, update, delete on public.providers        to authenticated;
grant insert, delete         on public.provider_photos   to authenticated;
grant insert, update, delete on public.reviews          to authenticated;

-- RPC de visualizações
grant execute on function public.incrementar_visualizacao(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- Canário de RLS: um prestador NÃO aprovado, só para provar que a
-- listagem pública o esconde. É invisível ao anônimo (esse é o ponto).
-- Para removê-lo depois:
--   delete from public.providers where id = '99999999-9999-4999-8999-999999999999';
-- ------------------------------------------------------------
insert into public.providers
  (id, nome_negocio, categoria, cidade_principal, whatsapp, aprovado)
values
  ('99999999-9999-4999-8999-999999999999',
   'CANÁRIO RLS (não aprovado)', 'limpeza', 'Orlando, FL', '10000000000', false)
on conflict (id) do nothing;
